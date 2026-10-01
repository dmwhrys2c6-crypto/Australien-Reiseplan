/* Page controller owns selection and sheet state; repository owns travel data. */
(function(root) {
  'use strict';
  const M=root.TripModel,C=root.TripComponents;
  const view=document.getElementById('view-reise'),workspace=document.getElementById('trip-workspace');
  const sheet=document.getElementById('trip-sheet'),body=document.getElementById('trip-sheet-body');
  const header=document.getElementById('trip-header-content'),daysBar=document.getElementById('trip-day-selector');
  const status=document.getElementById('trip-status'),mapStatus=document.getElementById('trip-map-status');
  let repository,editor,map,ready=false,dragId=null,touchDrag=null,mapVisible=false,sheetDragged=false,pickerSession=null;
  const state={dayId:null,stopId:null,sheet:'default'};
  function notifyError(error) {status.textContent=error.message||String(error);status.hidden=false;}
  function run(action) {try {return action();}catch(error){notifyError(error);}}
  function sheetState(value) {
    state.sheet=value;sheet.dataset.state=value;workspace.dataset.sheetState=value;
    const handle=document.getElementById('trip-sheet-handle'),expandButton=document.getElementById('trip-sheet-expand');
    handle.setAttribute('aria-label',`${value==='collapsed'?'Tagesplan öffnen':value==='expanded'?'Tagesplan verkleinern':'Tagesplan erweitern'}`);
    handle.setAttribute('aria-expanded',String(value==='expanded'));
    body.inert=value==='collapsed';body.setAttribute('aria-hidden',String(value==='collapsed'));
    expandButton.setAttribute('aria-label',value==='expanded'?'Tagesplan verkleinern':'Tagesplan erweitern');
    expandButton.setAttribute('aria-expanded',String(value==='expanded'));
    if(ready)render(false);
  }
  function groups() {
    const days=repository.getDays();
    return days.filter(d=>state.dayId===null||d.id===state.dayId).map(d=>({id:d.id,number:d.dayNumber,region:d.region,stops:repository.getStops(d.id)}));
  }
  function render(refit=true,updateMap=true) {
    if(!ready)return;
    const days=repository.getDays(),trip=repository.getTrip();
    if(state.dayId&&!days.some(d=>d.id===state.dayId)) {state.dayId=null;state.stopId=null;}
    header.innerHTML=C.header(trip,days);
    const scroll=daysBar.scrollLeft;
    daysBar.innerHTML=C.selector(days,state.dayId);daysBar.scrollLeft=scroll;
    const day=state.dayId?repository.getDay(state.dayId):null;
    const stops=repository.getStops(state.dayId);
    document.getElementById('trip-sheet-heading').innerHTML=C.sheetHeading(day,day?.dayNumber,stops,days);
    document.getElementById('trip-day-actions').hidden=!day;
    body.innerHTML=day?C.timeline(day,stops,state.stopId,state.sheet==='expanded'):C.overview(days,repository,map);
    const missing=stops.filter(s=>!M.coords(s)).length;
    document.getElementById('trip-route-note').textContent=`Route nach Verkehrsmittel${missing?' · '+missing+' Stopps ohne Standort':''}`;
    if(updateMap&&view.classList.contains('active')&&!document.body.classList.contains('is-locked'))map.render(groups(),state.stopId,refit);
  }
  function selectDay(id) {
    state.dayId=id;state.stopId=null;if(state.sheet==='collapsed')state.sheet='default';
    sheet.dataset.state=state.sheet;workspace.dataset.sheetState=state.sheet;body.inert=false;body.setAttribute('aria-hidden','false');render();
    daysBar.querySelector('.is-active')?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});
  }
  function selectStop(id,fromMap=false) {
    const stop=repository.getStop(id);if(!stop)return;
    if(!fromMap&&state.stopId===id){state.stopId=null;render(false,false);return;}
    const changedDay=state.dayId!==stop.dayId;
    if(changedDay)state.dayId=stop.dayId;
    state.stopId=id;
    if(state.sheet==='collapsed')sheetState('default');
    render(false,changedDay);map.focus(id);
    document.getElementById('trip-stop-'+id)?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  function syncLayout() {
    const active=view.classList.contains('active');
    if(document.body.classList.contains('is-trip')!==active)document.body.classList.toggle('is-trip',active);
    if(!active){mapVisible=false;return;}
    const nav=document.querySelector('.app-header'),bottom=document.querySelector('.mobile-bottom-nav');
    const floatingHeader=document.querySelector('.trip-floating-header');
    const top=nav?nav.getBoundingClientRect().height:48;
    const bottomHeight=(!bottom||getComputedStyle(bottom).display==='none')?0:bottom.getBoundingClientRect().height;
    if(floatingHeader) document.documentElement.style.setProperty('--trip-header-height',floatingHeader.getBoundingClientRect().height+'px');
    document.documentElement.style.setProperty('--trip-navbar-height',top+'px');
    document.documentElement.style.setProperty('--trip-bottom-nav-height',bottomHeight+'px');
    if(ready&&!document.body.classList.contains('is-locked')) {map.render(groups(),state.stopId,!mapVisible);map.resize();mapVisible=true;}
  }
  function moveStop(id,delta) {
    const stops=repository.getStops(state.dayId),ids=stops.map(s=>s.id),index=ids.indexOf(id),to=index+delta;
    if(index<0||to<0||to>=ids.length)return;
    ids.splice(index,1);ids.splice(to,0,id);repository.reorderStops(state.dayId,ids);
    body.querySelector(`[data-drag-stop="${CSS.escape(id)}"]`)?.focus();
    document.getElementById('trip-announcement').textContent='Stopp auf Position '+(to+1)+' verschoben.';
  }
  function dropStop(id,target) {
    if(!target||target===id||!state.dayId)return;
    const ids=repository.getStops(state.dayId).map(s=>s.id);
    const index=ids.indexOf(id);if(index<0||!ids.includes(target))return;
    ids.splice(index,1);ids.splice(ids.indexOf(target),0,id);run(()=>repository.reorderStops(state.dayId,ids));
  }
  workspace.addEventListener('click',event=>{
    const target=event.target.closest('[data-action]');if(!target||!ready)return;
    const id=target.dataset.id;
    run(()=>{
      switch(target.dataset.action) {
        case 'overview':selectDay(null);break;
        case 'select-day':selectDay(id);break;
        case 'select-stop':selectStop(id);break;
        case 'add-stop':editor.open('stop',{},state.dayId);break;
        case 'edit-stop':editor.open('stop',repository.getStop(id));break;
        case 'add-day':if(!repository.getTrip())editor.open('trip',{});else editor.open('day');break;
        case 'edit-day':editor.open('day',repository.getDay(state.dayId));break;
        case 'duplicate-day':{const day=repository.duplicateDay(state.dayId);selectDay(day.id);break;}
        case 'edit-trip':editor.open('trip',repository.getTrip()||{});break;
        case 'zoom-in':map.zoom(1);break;
        case 'zoom-out':map.zoom(-1);break;
        case 'fit-map':map.fit();break;
        case 'retry-map':map.retry();break;
        case 'confirm-location':finishLocationPicker(true);break;
        case 'cancel-location':finishLocationPicker(false);break;
        case 'collapse-sheet':sheetState(state.sheet==='collapsed'?'default':'collapsed');break;
        case 'expand-sheet':sheetState(state.sheet==='expanded'?'default':'expanded');break;
        case 'cycle-sheet':if(sheetDragged){sheetDragged=false;break;}sheetState(state.sheet==='collapsed'?'default':state.sheet==='default'?'expanded':'default');break;
        case 'export-trip': {
          const blob=new Blob([JSON.stringify({trip:repository.getTrip(),days:repository.getDays()},null,2)],{type:'application/json'});
          const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='reiseplan.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);break;
        }
      }
    });
  });
  body.addEventListener('dragstart',event=>{const handle=event.target.closest('[data-drag-stop]');if(!handle)return;dragId=handle.dataset.dragStop;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',dragId);});
  body.addEventListener('dragover',event=>{if(dragId){event.preventDefault();event.dataTransfer.dropEffect='move';}});
  body.addEventListener('drop',event=>{event.preventDefault();dropStop(dragId,event.target.closest('[data-stop]')?.dataset.stop);dragId=null;});
  body.addEventListener('dragend',()=>dragId=null);
  body.addEventListener('keydown',event=>{const handle=event.target.closest('[data-drag-stop]');if(handle&&['ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();run(()=>moveStop(handle.dataset.dragStop,event.key==='ArrowUp'?-1:1));}});
  body.addEventListener('pointerdown',event=>{const handle=event.target.closest('[data-drag-stop]');if(!handle||event.pointerType==='mouse')return;touchDrag={id:handle.dataset.dragStop,x:event.clientX,y:event.clientY};handle.setPointerCapture(event.pointerId);});
  body.addEventListener('pointermove',event=>{if(!touchDrag)return;const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-stop]');body.querySelectorAll('.is-drop-target').forEach(el=>el.classList.remove('is-drop-target'));if(target&&target.dataset.stop!==touchDrag.id)target.classList.add('is-drop-target');});
  function clearDropTargets(){body.querySelectorAll('.is-drop-target').forEach(el=>el.classList.remove('is-drop-target'));}
  body.addEventListener('pointerup',event=>{if(!touchDrag)return;const dragged=touchDrag;touchDrag=null;clearDropTargets();if(Math.hypot(event.clientX-dragged.x,event.clientY-dragged.y)<8)return;dropStop(dragged.id,document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-stop]')?.dataset.stop);});
  body.addEventListener('pointercancel',()=>{touchDrag=null;clearDropTargets();});
  const handle=document.getElementById('trip-sheet-handle');let startY=null;
  handle.addEventListener('pointerdown',event=>{startY=event.clientY;sheetDragged=false;handle.setPointerCapture(event.pointerId);});
  handle.addEventListener('pointerup',event=>{if(startY===null)return;const dy=event.clientY-startY;startY=null;if(Math.abs(dy)>30){sheetDragged=true;sheetState(dy<0?(state.sheet==='collapsed'?'default':'expanded'):(state.sheet==='expanded'?'default':'collapsed'));event.preventDefault();}});
  handle.addEventListener('pointercancel',()=>startY=null);
  new MutationObserver(syncLayout).observe(view,{attributes:true,attributeFilter:['class']});
  new MutationObserver(syncLayout).observe(document.body,{attributes:true,attributeFilter:['class']});
  new ResizeObserver(syncLayout).observe(document.querySelector('.app-header'));
  window.addEventListener('resize',syncLayout);
  window.addEventListener('management:changed',()=>render(false));
  root.TripPage={selectDayNumber(number){if(!ready){state.pendingDay=number;return;}const day=repository.getDays().find(d=>d.dayNumber===Number(number));if(day)selectDay(day.id);},selectStop, getState:()=>({...state})};
  function startLocationPicker(session) {
    pickerSession=session;
    const panel=document.getElementById('trip-location-picker');
    const confirm=panel.querySelector('[data-action="confirm-location"]');
    panel.hidden=false;confirm.disabled=true;
    document.getElementById('trip-location-picker-status').textContent='Klicke auf die Karte, um einen Pin zu setzen.';
    const started=map.startPicking(session.initial,(result,phase)=>{
      session.onChange(result);confirm.disabled=false;
      document.getElementById('trip-location-picker-status').textContent=phase==='loading'?'Ortsname wird ermittelt …':
        phase==='error'?`${result.latitude}, ${result.longitude} · Ortsname bitte prüfen.`:
        `${result.locationName||'Ausgewählter Standort'} · ${result.latitude}, ${result.longitude}`;
    });
    if(!started){panel.hidden=true;pickerSession=null;session.onFinish(false);}
  }
  function finishLocationPicker(confirmed){
    if(!pickerSession)return;
    const session=pickerSession;pickerSession=null;map.stopPicking();
    document.getElementById('trip-location-picker').hidden=true;session.onFinish(confirmed);
  }
  async function init() {
    try {
      repository=root.createTripRepository(root.TripStore,root.localStorage,root.TRIP_MASTER_DATA);
      await repository.init();
      map=root.createTripMap(document.getElementById('trip-map'),id=>selectStop(id,true),(phase,text)=>{
        mapStatus.hidden=phase==='ready';mapStatus.dataset.phase=phase;
        document.getElementById('trip-map-status-text').textContent=text;
        document.getElementById('trip-map-retry').hidden=phase!=='error';
      });
      editor=root.createTripEditor(repository,(result,kind)=>{if(kind==='day'&&result)selectDay(result.id);else if(kind==='stop'&&result){state.dayId=result.dayId;state.stopId=result.id;render();}},startLocationPicker);
      repository.subscribe(()=>render());ready=true;status.hidden=true;workspace.dataset.sheetState=state.sheet;render();syncLayout();
      if(state.pendingDay)root.TripPage.selectDayNumber(state.pendingDay);
      const match=location.hash.match(/(?:day|tag)-(\d+)/);if(match)root.TripPage.selectDayNumber(Number(match[1]));
    }catch(error){notifyError(error);document.getElementById('trip-data-retry').hidden=false;}
  }
  document.getElementById('trip-data-retry').addEventListener('click',()=>location.reload());
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
}(window));
