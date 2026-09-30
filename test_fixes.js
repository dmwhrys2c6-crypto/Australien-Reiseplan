import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const data = new Map();
const raw = {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
function context() {
  const ctx=vm.createContext({console,URL,crypto:webcrypto,localStorage:raw,document:{getElementById:()=>null}});
  for(const file of ['js/persistence.js','js/trip-store.js','js/trip/repository.js']) vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
  return ctx;
}
const a=context(),b=context();
const first=a.Persistence.wrap(raw),second=b.Persistence.wrap(raw);
first.getItem('record');second.getItem('record');first.setItem('record','new');
assert.throws(()=>second.setItem('record','stale'),/anderen Tab/);
assert.equal(raw.getItem('record'),'new');
let writes=0;
const batchData=new Map([['one','old-one'],['two','old-two']]);
const quota={getItem:k=>batchData.get(k)??null,removeItem:k=>batchData.delete(k),setItem:(k,v)=>{if(++writes===2)throw new Error('Speicher voll');batchData.set(k,String(v));}};
assert.throws(()=>a.Persistence.wrap(quota).batch([['one','new-one'],['two','new-two']]),/Speicher voll/);
assert.equal(batchData.get('one'),'old-one');assert.equal(batchData.get('two'),'old-two');
a.TripStore.init([{dayNumber:1,title:'Test',date:'2027-03-21',activities:[],sights:[]}]);
const repo=a.createTripRepository(a.TripStore,raw,{tripMeta:{id:'test',title:'Reise'}});
await repo.init();
assert.equal(a.createTripRepository(a.TripStore,raw),repo,'Repositories share one metadata state');
repo.updateTrip({title:'Neuer Titel'});
assert.equal(a.createTripRepository(a.TripStore,raw).getTrip().title,'Neuer Titel');
const day=repo.getDays()[0];
const stop=repo.createStop(day.id,{title:'Ort',type:'other',latitude:10,longitude:20,activityMeta:{id:'original'}});
repo.updateStop(stop.id,{latitude:null,longitude:null});
assert.equal(repo.getStop(stop.id).latitude,null);assert.equal(repo.getStop(stop.id).coords,null);
const copy=repo.duplicateDay(day.id);
assert.notEqual(repo.getStops(copy.id)[0].activityMeta.id,'original');
repo.deleteDay(copy.id);const following=repo.createDay({title:'Neu',date:'2027-03-23'});
assert.ok(following.dayNumber>copy.dayNumber,'Deleted day numbers cannot capture old journal entries');
assert.equal(a.TripStore.importMasterJSON([{dayNumber:9,title:'Import',activities:[]}]),true);
const persisted=raw.getItem('aus_trip_days_v1');
const c=context();await c.TripStore.load();assert.equal(c.TripStore.getDays()[0].title,'Import');
assert.equal(a.TripStore.importMasterJSON({days:[{dayNumber:9,title:'Broken'}]}),false);
assert.equal(raw.getItem('aus_trip_days_v1'),persisted);
assert.equal(a.TripModel.safeUrl('javascript:alert(1)'), '');
// Execute the real budget functions with a small DOM fixture.
const source=fs.readFileSync('js/app.js','utf8');
const budget=source.slice(source.indexOf("    const ONSITE_SPEND_KEY"),source.indexOf('    function openFuelTracker'));
const nodes=Object.fromEntries(['onsite-daily-eur','onsite-total-trip','onsite-spend-input','onsite-spend-slider'].map(id=>[id,{}]));
const ctx=vm.createContext({localStorage:a.Persistence.wrap(raw),document:{getElementById:id=>nodes[id]||null},currentMemoryDays:()=>[1,2,3]});
vm.runInContext(budget,ctx);vm.runInContext("updateOnsiteSpend(10,'input')",ctx);
assert.equal(nodes['onsite-daily-eur'].textContent,'40 €');assert.equal(nodes['onsite-total-trip'].textContent,'120 € (3 Tage)');
vm.runInContext("updateOnsiteSpend(0,'input');initOnsiteSpend()",ctx);assert.equal(nodes['onsite-spend-input'].value,0);
// Real journal handlers: switch before debounce, failure and deletion.
const journalNodes=Object.fromEntries(['journal-entry-title','journal-entry-text','journal-entry-highlights','journal-entry-special','journal-entry-notes','journal-entry-links','journal-autosave-indicator'].map(id=>[id,{value:''}]));
let fail=false,saved,timer;
const journal=vm.createContext({console,Date,document:{getElementById:id=>journalNodes[id]||null,querySelectorAll:()=>[]},
  currentMemoryDays:()=>[{day:1,title:'A'},{day:2,title:'B'}],renderJournalDayInfoCard:()=>{},renderJournalDays:()=>{},setJournalMood:()=>{},
  setTimeout:cb=>{timer=cb;return 1;},clearTimeout:()=>{timer=null;},saveUserJournal:()=>{if(fail)return false;saved=JSON.stringify(journal.userJournal);return true;},window:{confirm:()=>true}});
vm.runInContext('var userJournal={},currentJournalDay=1,currentSelectedMood="",journalDirty=false,journalAutosaveTimer=null;',journal);
vm.runInContext(source.slice(source.indexOf('    function selectJournalDay('),source.indexOf('    function renderJournalDayInfoCard(')),journal);
vm.runInContext(source.slice(source.indexOf('    function onJournalInput('),source.indexOf('    function',source.indexOf('      return true;',source.indexOf('    function saveJournalEntry(')))),journal);
// Extract individual delete handler using its next function boundary.
vm.runInContext(source.slice(source.indexOf('    function deleteJournalEntry('),source.indexOf('    function jumpToJournalDay(')),journal);
journalNodes['journal-entry-text'].value='Sofort speichern';
vm.runInContext('onJournalInput();selectJournalDay(2)',journal);
assert.equal(JSON.parse(saved)['1'].text,'Sofort speichern');assert.equal(journal.currentJournalDay,2);assert.equal(timer,null);
journalNodes['journal-entry-text'].value='Nicht verlieren';fail=true;
vm.runInContext('onJournalInput();selectJournalDay(1)',journal);
assert.equal(journal.currentJournalDay,2);assert.equal(journalNodes['journal-entry-text'].value,'Nicht verlieren');assert.match(journalNodes['journal-autosave-indicator'].textContent,/fehlgeschlagen/);
fail=false;vm.runInContext('deleteJournalEntry(2,true)',journal);
assert.equal(journal.userJournal[2],undefined);assert.equal(journal.journalDirty,false);assert.equal(timer,null);
// Real remote-sync handler: stale snapshots, fuel-only changes and conflict refusal.
const remoteEntries=new Map();const remoteRaw={getItem:k=>remoteEntries.get(k)??null,setItem:(k,v)=>remoteEntries.set(k,String(v)),removeItem:k=>remoteEntries.delete(k)};
let accept=false,renders=0;
const remote=vm.createContext({console,Number,JSON,Object,Array,localStorage:a.Persistence.wrap(remoteRaw),window:{confirm:()=>accept},
  getCustomActivities:()=>({}),storageFailure:()=>{},renderGroceries:()=>renders++,renderFuel:()=>{},applyCheckboxStatesToUI:()=>{},applySubItemsPaidStateToUI:()=>{},renderAllSuggestions:()=>{},renderCustomActivities:()=>{},updateBudgetCalculations:()=>{}});
vm.runInContext("var GROCERY_STORAGE_KEY='g',FUEL_STORAGE_KEY='f',CHECKBOX_STORAGE_KEY='c',SUGGESTIONS_STORAGE_KEY='s',CUSTOM_ACTIVITIES_KEY='a',groceries=[{text:'Brot'}],fuelEntries=[],checkboxStates={},daySuggestions={},isApplyingRemote=false;",remote);
vm.runInContext(source.slice(source.indexOf('    function handleRemoteUpdate('),source.indexOf('    async function broadcastState(')),remote);
remoteEntries.set('aus_sync_local_v2','100');
const payload={timestamp:99,groceries:[{text:'Brot'}],fuelEntries:[{costAud:20}],checkboxStates:{},daySuggestions:{},customActivities:{}};
remote.handleRemoteUpdate(payload);assert.equal(renders,0);assert.equal(remoteEntries.has('aus_sync_received_v2'),false);
payload.timestamp=101;remote.handleRemoteUpdate(payload);assert.equal(renders,0);assert.ok(remoteEntries.has('aus_sync_received_v2'));
accept=true;remote.handleRemoteUpdate(payload);assert.equal(renders,1);assert.equal(remote.fuelEntries[0].costAud,20);assert.ok(remoteEntries.has('aus_sync_backup_v2'));
remote.handleRemoteUpdate(payload);assert.equal(renders,1);
console.log('Regression tests: stale-tab writes, persistent imports, shared repositories, coordinates, duplicate IDs, safe URLs and daily budget passed.');
