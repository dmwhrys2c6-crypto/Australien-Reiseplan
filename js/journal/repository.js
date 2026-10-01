(function(root) {
'use strict';
const DB='aus-roadtrip-memories-v1';
function validate(data) {
 const day=Number(data.day);
 if(!Number.isInteger(day)||day<0||day>20)throw new Error('Bitte einen Reisetag zwischen 0 und 20 auswählen.');
 const location=String(data.location||'').trim(),note=String(data.note||'').trim();
 if(location.length>120||note.length>1000)throw new Error('Ort oder Notiz ist zu lang.');
 return {day,location,note};
}
function legacyEntries(storage) {
 const photos=JSON.parse(storage.getItem('aus_roadtrip_photos_2027')||'[]');
 const journal=JSON.parse(storage.getItem('aus_roadtrip_journal_2027')||'{}');
 if(!Array.isArray(photos)||!journal||typeof journal!=='object'||Array.isArray(journal))throw new Error('Alte Erinnerungen konnten nicht gelesen werden.');
 const entries=photos.filter(p=>p&&typeof p==='object').map((p,i)=>({id:'legacy-photo-'+(p.id??i),day:Number(p.dayNum)||0,location:String(p.location||''),note:[p.title,p.caption].filter(Boolean).join(' · '),url:/^https?:\/\//.test(p.url||'')?p.url:'',createdAt:p.createdAt||'2027-03-01T00:00:00Z'}));
 for(const [key,j] of Object.entries(journal)){
  if(!j||typeof j!=='object')continue;
  const note=[j.title,j.mood,j.text,j.notes,j.specialExp,j.links,...(Array.isArray(j.highlights)?j.highlights:[])].filter(Boolean).join('\n');
  const urls=Array.isArray(j.photoUrls)?j.photoUrls.filter(url=>/^https?:\/\//.test(url)):[];
  if(note||urls.length)entries.push({id:'legacy-journal-'+key,day:Number(j.day??key)||0,location:'',note,url:urls[0]||'',legacyUrls:urls,createdAt:j.updatedAt||'2027-03-01T00:00:00Z'});
 }
 return entries;
}
async function open() {
 if(!root.indexedDB)throw new Error('Dieser Browser unterstützt den lokalen Fotospeicher nicht.');
 const db=await new Promise((resolve,reject)=>{
  const request=root.indexedDB.open(DB,1);
  request.onupgradeneeded=()=>{const db=request.result;db.createObjectStore('entries',{keyPath:'id'});db.createObjectStore('meta');};
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(new Error('Bitte andere Tabs dieser Website schließen und erneut laden.'));
 });
 db.onversionchange=()=>db.close();
 function transaction(stores,mode,work){return new Promise((resolve,reject)=>{const tx=db.transaction(stores,mode);let result;try{result=work(tx);}catch(err){tx.abort();reject(err);return;}tx.oncomplete=()=>resolve(result?.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Speichern wurde abgebrochen.'));});}
 const migrated=await transaction(['meta'],'readonly',tx=>tx.objectStore('meta').get('legacy-migrated'));
 if(!migrated){
  const entries=legacyEntries(root.localStorage);
  await transaction(['entries','meta'],'readwrite',tx=>{entries.forEach(entry=>tx.objectStore('entries').put(entry));tx.objectStore('meta').put(true,'legacy-migrated');});
 }
 return {
  async list(){const entries=await transaction(['entries'],'readonly',tx=>tx.objectStore('entries').getAll());return entries.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));},
  async add(data,photos){const fields=validate(data);if(!photos.length)throw new Error('Bitte mindestens ein Foto auswählen.');if(photos.some(p=>!(p.blob instanceof Blob)))throw new Error('Eine Bilddatei ist ungültig.');const entries=photos.map(p=>({...fields,id:root.crypto.randomUUID(),blob:p.blob,name:p.name,createdAt:new Date().toISOString()}));await transaction(['entries'],'readwrite',tx=>entries.forEach(entry=>tx.objectStore('entries').add(entry)));return entries;},
  close:()=>db.close()
 };
}
root.JournalRepository={open,validate,legacyEntries};
}(window));
