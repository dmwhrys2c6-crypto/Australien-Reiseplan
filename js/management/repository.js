/* Related travel entities. TripStore remains the source of truth for scheduled activities. */
(function(root){
'use strict';
const M=root.TripModel, clone=v=>JSON.parse(JSON.stringify(v));
const KEYS={state:'aus_management_v1',expenses:'aus_roadtrip_expenses_2027',bookings:'aus_roadtrip_bookings_2027'};
const CATEGORIES={accommodation:'Unterkunft',transport:'Transport',food:'Essen',activities:'Aktivitäten',shopping:'Shopping',tickets:'Tickets',other:'Sonstiges'};
const ACTIVITY_CATEGORIES={sightseeing:'Sightseeing',nature:'Natur',hiking:'Wandern',food:'Essen',culture:'Kultur',adventure:'Abenteuer',other:'Sonstiges'};
const BOOKING_TYPES={flight:'Flug',hotel:'Unterkunft',train:'Zug',rentalcar:'Mietwagen',activity:'Aktivität',restaurant:'Restaurant',ticket:'Ticket',other:'Sonstiges'};
const PRICE_TYPES={per_person:'Pro Person',total:'Gesamtkosten',two_persons:'Für 2 Personen'};
const STATUS={confirmed:'Bestätigt',pending:'Offen',cancelled:'Storniert',completed:'Abgeschlossen'};
const DOCUMENT_CATEGORIES={identity:'Identität',transport:'Transport',accommodation:'Unterkunft',insurance:'Versicherung',tickets:'Tickets',other:'Sonstiges'};
const EXP_STATUS={paid:'Bezahlt',pending:'Offen'};
const currency=v=>/^[A-Z]{3}$/.test(v||'')&&(()=>{try {new Intl.NumberFormat('de-AT',{style:'currency',currency:v});return true;}catch{return false;}})();
const validDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')&&Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
const oldCats={hotels:'accommodation',flights:'transport',car:'transport',fuel:'transport',groceries:'shopping',misc:'other',camping:'accommodation'};
const oldTypes={flights:'flight',hotels:'hotel',car:'rentalcar',activities:'activity',camping:'hotel',misc:'other'};
const eligible=s=>['sightseeing','activity','restaurant','event'].includes(s.type)||s.activityMeta;
function createRepository(trip,storage,bridge){
 storage=root.Persistence?.wrap(storage)||storage;
 let state,expenses=[],bookings=[];const listeners=new Set();
 const now=()=>new Date().toISOString(),tripId=()=>trip.getTrip()?.id||'aus-roadtrip-2027';
 const emit=()=>listeners.forEach(fn=>fn());
 function persist(key,value){storage.setItem(KEYS[key],JSON.stringify(value));}
 function syncLegacy(){bridge?.sync?.({expenses:clone(expenses),bookings:clone(bookings)});}
 function read(key,fallback){const raw=storage.getItem(KEYS[key]);return raw===null?clone(fallback):JSON.parse(raw);}
 const dayId=num=>trip.getDays().find(d=>d.dayNumber===Number(num))?.id||'';
 function relations(data,allowMove=false){
  if(data.dayId&&!trip.getDays().some(d=>d.id===data.dayId))throw new Error('Der gewählte Tag existiert nicht mehr.');
  if(data.stopId){const s=trip.getStop(data.stopId);if(!s)throw new Error('Der gewählte Stopp existiert nicht mehr.');if(!allowMove&&data.dayId&&s.dayId!==data.dayId)throw new Error('Stopp und Tag passen nicht zusammen.');if(!allowMove||!data.dayId)data.dayId=s.dayId;}
  if(data.bookingId&&!bookings.some(b=>b.id===data.bookingId))throw new Error('Die gewählte Buchung existiert nicht mehr.');
  if(data.activityId&&!activities().some(a=>a.id===data.activityId))throw new Error('Der gewählte Ausflug existiert nicht mehr.');
 }
 function base(kind,data,previous={}){
  const item={...previous,...data,id:previous.id||M.uid(kind),tripId:tripId(),createdAt:previous.createdAt||now(),updatedAt:now()};
  item.title=String(item.title||'').trim();if(!item.title)throw new Error('Bitte einen Titel angeben.');
  if(item.date&&!validDate(item.date))throw new Error('Bitte ein gültiges Datum angeben.');
  if(item.currency&&!currency(item.currency))throw new Error('Bitte einen gültigen Währungscode angeben.');
  for(const key of ['url','image','website','attachmentUrl'])if(item[key]&&!M.safeUrl(item[key]))throw new Error('Links müssen mit https:// oder http:// beginnen.');
  for(const key of ['startTime','endTime','departureTime','arrivalTime'])if(item[key]&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(item[key]))throw new Error('Bitte eine gültige Uhrzeit angeben.');
  relations(item,kind==='activity');return item;
 }
 function save(kind,data,id){
  const collection=kind==='expense'?expenses:kind==='booking'?bookings:state[kind==='activity'?'activities':kind+'s'];
  const previous=id?collection.find(x=>x.id===id):null;if(id&&!previous)throw new Error('Dieser Eintrag existiert nicht mehr.');
  const item=base(kind,data,previous||{});
  if(kind==='expense'){if(!CATEGORIES[item.category]||!EXP_STATUS[item.status])throw new Error('Kategorie oder Zahlungsstatus ungültig.');if(!Number.isFinite(item.amount)||item.amount<0)throw new Error('Bitte einen gültigen Betrag angeben.');if(!validDate(item.date))throw new Error('Datum fehlt.');item.amountEur=item.currency==='EUR'?item.amount:previous?.amountEur??null;item.dayNum=trip.getDays().find(d=>d.id===item.dayId)?.dayNumber||null;item.note=item.notes||'';}
  if(kind==='booking'){if(!BOOKING_TYPES[item.type]||!STATUS[item.status])throw new Error('Buchungstyp oder Status ungültig.');item.priceType=item.priceType||previous?.priceType||'total';if(!['per_person','total','two_persons'].includes(item.priceType))throw new Error('Preistyp ungültig.');if(item.price!=null&&(!Number.isFinite(item.price)||item.price<0))throw new Error('Preis ist ungültig.');if(!validDate(item.date))throw new Error('Datum fehlt.');if(item.guests!=null&&(!Number.isInteger(item.guests)||item.guests<1))throw new Error('Bitte eine gültige Gästezahl angeben.');if(item.checkOut&&(!validDate(item.checkOut)||item.checkOut<item.date))throw new Error('Check-out liegt vor Check-in.');item.name=item.title;const rawPrice=item.price;if(rawPrice!=null){item.totalAmount=item.priceType==='per_person'?rawPrice*4:(item.priceType==='two_persons'?rawPrice*2:rawPrice);item.perPersonAmount=item.totalAmount/4;item.cost=item.totalAmount;}else{item.totalAmount=null;item.perPersonAmount=null;item.cost=null;}item.time=item.startTime||'';item.bookingRef=item.bookingReference||'';item.link=item.url||'';item.dayNum=trip.getDays().find(d=>d.id===item.dayId)?.dayNumber||null;item.category={flight:'flights',hotel:'hotels',rentalcar:'car',activity:'activities'}[item.type]||'misc';}
  if(kind==='drone'){if(!['landscape','urban','coast','other'].includes(item.category))throw new Error('Bitte eine Spot-Kategorie wählen.');if(!M.coords(item))throw new Error('Bitte gültige Koordinaten angeben.');}
  if(kind==='document'&&!DOCUMENT_CATEGORIES[item.category])throw new Error('Bitte eine Dokument-Kategorie wählen.');
  if(kind==='document'&&!M.safeUrl(item.url))throw new Error('Bitte einen sicheren Dokument-Link angeben.');
  const next=id?collection.map(x=>x.id===id?item:x):[...collection,item];
  if(kind==='expense'){persist('expenses',next);expenses=next;}else if(kind==='booking'){persist('bookings',next);bookings=next;}else{const updated={...state,[kind==='activity'?'activities':kind+'s']:next};persist('state',updated);state=updated;}
  syncLegacy();emit();return clone(item);
 }
 function activities(){
  const assigned=trip.getStops().filter(eligible).map(s=>({...s,...s.activityMeta,id:s.activityMeta?.id||'activity:'+s.id,stopId:s.id,date:trip.getDays().find(d=>d.id===s.dayId)?.date||'',category:s.activityMeta?.category||(s.type==='restaurant'?'food':'sightseeing'),price:s.cost,website:s.bookingUrl,address:s.activityMeta?.address||'',bookingStatus:s.activityMeta?.bookingStatus||'pending'}));
  return clone([...assigned,...state.activities]);
 }
 function activityFields(data){
  if(data.bookingStatus&&!STATUS[data.bookingStatus])throw new Error('Bitte einen Buchungsstatus wählen.');
  if(!ACTIVITY_CATEGORIES[data.category])throw new Error('Bitte eine Kategorie wählen.');
  return {title:data.title,type:data.category==='food'?'restaurant':data.category==='sightseeing'?'sightseeing':'activity',locationName:data.locationName||'',latitude:data.latitude??null,longitude:data.longitude??null,startTime:data.startTime||'',endTime:data.endTime||'',description:data.description||'',notes:data.notes||'',image:data.image||'',cost:data.price??null,currency:data.currency||state.budget.currency,bookingUrl:data.website||'',activityMeta:{id:data.id,category:data.category,address:data.address||'',bookingStatus:data.bookingStatus||'pending'}};
 }
 function saveActivity(data,id){
  const prior=id?activities().find(a=>a.id===id):null;if(id&&!prior)throw new Error('Ausflug existiert nicht mehr.');
  if(prior?.stopId&&data.stopId!=null&&data.stopId!==prior.stopId)throw new Error('Dieser Ausflug ist bereits ein Stopp. Verschiebe ihn über den Reisetag oder bearbeite seinen Standort.');
  const item=base('activity',data,prior||{}),fields=activityFields(item);
  if(item.price!=null&&(!Number.isFinite(item.price)||item.price<0))throw new Error('Preis ist ungültig.');
  if(item.latitude!=null||item.longitude!=null)if(!M.coords(item))throw new Error('Bitte vollständige gültige Koordinaten angeben.');
  if(item.endTime&&item.startTime&&item.endTime<item.startTime)throw new Error('Endzeit liegt vor Startzeit.');
  if(item.stopId){const s=trip.getStop(item.stopId);if(!s)throw new Error('Stopp existiert nicht mehr.');trip.updateStop(s.id,{...fields,dayId:item.dayId||s.dayId});
   if(prior&&!prior.stopId){const next={...state,activities:state.activities.filter(a=>a.id!==prior.id)};try{persist('state',next);state=next;}catch(err){throw new Error('Stopp aktualisiert; gespeicherter Ausflug konnte nicht entfernt werden: '+err.message);}}
   emit();return activities().find(a=>a.stopId===s.id);
  }
  if(item.dayId){const stop=trip.createStop(item.dayId,fields);if(prior){const next={...state,activities:state.activities.filter(a=>a.id!==prior.id)};try{persist('state',next);state=next;}catch(err){trip.deleteStop(stop.id);throw err;}}emit();return activities().find(a=>a.stopId===stop.id);}
  return save('activity',{...item,...fields,category:item.category,price:item.price,website:item.website||''},prior?.id);
 }
 function resolved(items){return clone(items.map(item=>{const activity=item.activityId?activities().find(a=>a.id===item.activityId):null;const linkedStop=item.stopId||activity?.stopId;const s=linkedStop?trip.getStop(linkedStop):null;return {...item,stopId:s?.id||item.stopId,dayId:s?s.dayId:item.dayId,relationMissing:!!((linkedStop&&!s)||(item.activityId&&!activity)||(item.bookingId&&!bookings.some(b=>b.id===item.bookingId))||(item.dayId&&!trip.getDays().some(d=>d.id===item.dayId)))};}));}
 return {
  async init(){await trip.init();const seed=bridge?.seed?.()||{};
   state=read('state',{version:1,budget:{totalBudget:seed.totalBudget||0,currency:'EUR'},activities:[],drones:[],documents:[]});
   if(!state||state.version!==1||!Array.isArray(state.activities)||!Array.isArray(state.drones)||!Array.isArray(state.documents)||!state.budget||!Number.isFinite(state.budget.totalBudget)||!currency(state.budget.currency))throw new Error('Gespeicherte Verwaltungsdaten sind ungültig.');
   expenses=read('expenses',seed.expenses||[]);bookings=read('bookings',seed.bookings||[]);
   if(!Array.isArray(expenses)||!Array.isArray(bookings))throw new Error('Gespeicherte Ausgaben oder Buchungen sind ungültig.');
   expenses=expenses.map(x=>({...x,title:x.title||'',tripId:x.tripId||tripId(),amount:x.amount??(x.currency==='AUD'?x.amountAud:x.amountEur)??0,category:CATEGORIES[x.category]?x.category:oldCats[x.category]||'other',date:x.date,dayId:x.dayId||dayId(x.dayNum),notes:x.notes||x.note||'',status:x.status||'paid',createdAt:x.createdAt||now(),updatedAt:x.updatedAt||now()}));
   bookings=bookings.map(x=>{const priceType=x.priceType||'total';const price=x.price??x.cost??null;const totalAmount=price!=null?(priceType==='per_person'?price*4:(priceType==='two_persons'?price*2:price)):null;const perPersonAmount=totalAmount!=null?totalAmount/4:null;return {...x,title:x.title||x.name||'',tripId:x.tripId||tripId(),type:x.type||oldTypes[x.category]||'other',price,priceType,totalAmount,perPersonAmount,cost:totalAmount??price,dayId:x.dayId||dayId(x.dayNum),startTime:x.startTime||x.time||'',bookingReference:x.bookingReference||x.bookingRef||'',url:x.url||x.link||'',status:STATUS[x.status]?x.status:'pending',createdAt:x.createdAt||now(),updatedAt:x.updatedAt||now()};});
   persist('state',state);persist('expenses',expenses);persist('bookings',bookings);syncLegacy();trip.subscribe(emit);return this;
  },trip,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
  get(kind){return kind==='activity'?activities():resolved(kind==='expense'?expenses:kind==='booking'?bookings:state[kind==='activity'?'activities':kind+'s']);},
  save(kind,data,id){return kind==='activity'?saveActivity(data,id):save(kind,data,id);},
  remove(kind,id){if(kind==='activity'){const assigned=activities().find(a=>a.id===id&&a.stopId);if(assigned){trip.deleteStop(assigned.stopId);emit();return;}}const collection=kind==='expense'?expenses:kind==='booking'?bookings:state[kind==='activity'?'activities':kind+'s'];if(!collection.some(x=>x.id===id))throw new Error('Eintrag existiert nicht mehr.');const next=collection.filter(x=>x.id!==id);if(kind==='expense'){persist('expenses',next);expenses=next;}else if(kind==='booking'){persist('bookings',next);bookings=next;}else{const updated={...state,[kind==='activity'?'activities':kind+'s']:next};persist('state',updated);state=updated;}syncLegacy();emit();},
  duplicateActivity(id){const a=activities().find(x=>x.id===id);if(!a)throw new Error('Ausflug nicht gefunden.');return saveActivity({...a,title:a.title+' · Kopie',stopId:'',dayId:a.dayId},null);},
  getBudget:()=>clone(state.budget),saveBudget(b){if(!Number.isFinite(b.totalBudget)||b.totalBudget<0||!currency(b.currency))throw new Error('Budget oder Währung ungültig.');const next={...state,budget:clone(b)};persist('state',next);state=next;emit();},
  summary(){const b=state.budget,same=expenses.filter(e=>e.currency===b.currency),spent=same.filter(e=>e.status==='paid').reduce((n,e)=>n+e.amount,0),pending=same.filter(e=>e.status==='pending').reduce((n,e)=>n+e.amount,0);return {...clone(b),spent,pending,remaining:b.totalBudget-spent,excluded:expenses.filter(e=>e.currency!==b.currency).length,categories:Object.keys(CATEGORIES).map(category=>({category,amount:same.filter(e=>e.status==='paid'&&e.category===category).reduce((n,e)=>n+e.amount,0)}))};},
  expenseFrom(kind,id){const entity=this.get(kind).find(x=>x.id===id);if(!entity)throw new Error('Eintrag nicht gefunden.');const existing=expenses.find(e=>kind==='booking'?(e.bookingId===id||(entity.stopId&&e.stopId===entity.stopId)):(e.activityId===id||(entity.stopId&&e.stopId===entity.stopId)));if(existing){if(kind==='booking'&&!existing.bookingId)return save('expense',{...existing,bookingId:id},existing.id);if(kind==='activity'&&entity.stopId&&!existing.stopId)return save('expense',{...existing,stopId:entity.stopId,dayId:entity.dayId},existing.id);return clone(existing);}const amount=entity.totalAmount??entity.price;if(amount==null)throw new Error('Bitte zuerst einen Preis hinterlegen.');return save('expense',{title:entity.title,category:kind==='booking'?({hotel:'accommodation',flight:'transport',train:'transport',rentalcar:'transport',restaurant:'food',ticket:'tickets',activity:'activities'}[entity.type]||'other'):'activities',amount,currency:entity.currency||state.budget.currency,date:entity.date||trip.getDays()[0]?.date||new Date().toISOString().slice(0,10),dayId:entity.dayId||'',stopId:entity.stopId||'',bookingId:kind==='booking'?id:'',activityId:kind==='activity'&&!entity.stopId?id:'',notes:'',status:'pending'});}
 };
}
root.ManagementModel={KEYS,CATEGORIES,ACTIVITY_CATEGORIES,BOOKING_TYPES,PRICE_TYPES,STATUS,EXP_STATUS,DOCUMENT_CATEGORIES,validDate,eligible};root.createManagementRepository=createRepository;
}(typeof window==='undefined'?globalThis:window));
