(function(root) {
  'use strict';
  const M=root.TripModel,e=M.escape;
  const field=(label,name,value='',type='text',attrs='')=>`<label>${label}<input name="${name}" type="${type}" value="${e(value??'')}" ${attrs}></label>`;
  const area=(label,name,value='')=>`<label class="trip-field-wide">${label}<textarea name="${name}" rows="3">${e(value)}</textarea></label>`;
  const TRANSPORT={car:'Auto',plane:'Flugzeug',ferry:'Fähre',walk:'Zu Fuß',train:'Zug',other:'Sonstiges'};
  root.createTripEditor=function(repository,onSaved,locationPicker) {
    const dialog=document.getElementById('trip-editor');
    const form=document.getElementById('trip-editor-form');
    const fields=document.getElementById('trip-editor-fields');
    const error=document.getElementById('trip-editor-error');
    const deleteButton=document.getElementById('trip-editor-delete');
    let kind,id,returnFocus,busy=false,picking=false;
    const confirmDialog=document.getElementById('trip-confirm');
    let confirmationResolve;
    function confirmDelete(message) {
      document.getElementById('trip-confirm-text').textContent=message;
      confirmDialog.showModal();
      return new Promise(resolve=>{confirmationResolve=resolve;});
    }
    function finishConfirmation(answer) { confirmDialog.close(); confirmationResolve?.(answer); confirmationResolve=null; }
    document.getElementById('trip-confirm-yes').addEventListener('click',()=>finishConfirmation(true));
    document.getElementById('trip-confirm-no').addEventListener('click',()=>finishConfirmation(false));
    confirmDialog.addEventListener('cancel',event=>{event.preventDefault();finishConfirmation(false);});
    function close() { if(busy)return;dialog.close();returnFocus?.focus(); }
    document.getElementById('trip-editor-close').addEventListener('click',close);
    document.getElementById('trip-editor-cancel').addEventListener('click',close);
    dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
    dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
    function saving(value) {
      busy=value;form.setAttribute('aria-busy',String(value));
      form.querySelectorAll('button,input,select,textarea').forEach(el=>el.disabled=value);
      document.getElementById('trip-editor-save').textContent=value?'Wird gespeichert …':'Speichern';
    }
    async function perform(action) {
      error.textContent=''; saving(true);
      try { const result=await action(); saving(false);close();onSaved(result,kind); }
      catch(err) { saving(false);error.textContent=err.message||'Speichern fehlgeschlagen. Bitte erneut versuchen.';error.focus(); }
    }
    form.addEventListener('submit',event=>{
      event.preventDefault(); if(busy)return;
      const values=Object.fromEntries(new FormData(form));
      if(kind==='stop') {
        ['latitude','longitude','cost','durationMinutes'].forEach(key=>values[key]=values[key]===''?null:Number(values[key]));
        values.currency=values.currency.toUpperCase();
        perform(()=>id?repository.updateStop(id,values):repository.createStop(values.dayId,values));
      } else if(kind==='day') {
        values.order=Number(values.order);
        perform(()=>{
          const day=id?repository.updateDay(id,values):repository.createDay(values);
          return day;
        });
      } else perform(()=>repository.getTrip()?repository.updateTrip(values):repository.createTrip(values));
    });
    deleteButton.addEventListener('click',async()=>{
      if(!id||busy)return;
      const confirmed=await confirmDelete(kind==='day'?'Diesen Tag mit allen zugehörigen Stops löschen?':'Diesen Stopp löschen?');
      if(confirmed)perform(()=>{kind==='day'?repository.deleteDay(id):repository.deleteStop(id);return null;});
    });
    function open(type,data={},dayId) {
      kind=type;id=data.id||null;returnFocus=document.activeElement;error.textContent='';saving(false);
      const days=repository.getDays();
      const title=type==='stop'?(id?'Stopp bearbeiten':'Neuer Stopp'):type==='day'?(id?'Tag bearbeiten':'Neuer Reisetag'):'Reise bearbeiten';
      document.getElementById('trip-editor-title').textContent=title;
      deleteButton.hidden=!id||type==='trip';
      if(type==='stop') {
        fields.innerHTML=`${field('Titel','title',data.title,'text','required maxlength="160" class="trip-title-input"')}
          <label>Typ<select name="type">${Object.entries(M.TYPES).map(([value,label])=>`<option value="${value}" ${(data.type||'sightseeing')===value?'selected':''}>${label}</option>`).join('')}</select></label>
          <label class="trip-field-wide">Tag / Datum<select name="dayId" required>${days.map(d=>`<option value="${e(d.id)}" ${(data.dayId||dayId)===d.id?'selected':''}>Tag ${e(d.dayNumber)} · ${e(M.dateLabel(d.date))} · ${e(d.title)}</option>`).join('')}</select></label>
          ${field('Ankunftszeit','startTime',data.startTime,'time')}${field('Dauer in Minuten','durationMinutes',data.durationMinutes,'number','min="0" step="5"')}
          <label>Verkehrsmittel<select name="transportMode">${Object.entries(TRANSPORT).map(([value,label])=>`<option value="${value}" ${(data.transportMode||'walk')===value?'selected':''}>${label}</option>`).join('')}</select></label>
          ${field('Stadt / Region','region',data.region,'text','required maxlength="120" placeholder="z. B. Brisbane"')}
          <div class="trip-field-wide">${field('Standort','locationName',data.locationName,'text','required maxlength="240" placeholder="z. B. Sydney Opera House"')}</div>
          ${field('Latitude','latitude',data.latitude,'number','step="any" min="-90" max="90"')}${field('Longitude','longitude',data.longitude,'number','step="any" min="-180" max="180"')}
          <div class="trip-field-wide trip-location-actions"><button type="button" class="glass-pill trip-location-pick-button" data-editor-action="pick-location"><i class="fa-solid fa-location-crosshairs" aria-hidden="true"></i> Standort auf Karte wählen</button><p class="trip-field-hint">Ein Kartenklick setzt einen verschiebbaren Pin und übernimmt Koordinaten sowie Ortsname.</p></div>
          ${area('Beschreibung','description',data.description)}${area('Notizen','notes',data.notes)}
          <div class="trip-field-wide">${field('Bild-URL','image',data.image,'url','placeholder="https://…"')}</div>
          ${field('Kosten','cost',data.cost,'number','min="0" step="0.01"')}${field('Währung','currency',data.currency||'EUR','text','required pattern="[A-Za-z]{3}" maxlength="3"')}
          <div class="trip-field-wide">${field('Buchungslink','bookingUrl',data.bookingUrl,'url','placeholder="https://…"')}</div>
          <div class="trip-field-wide">${field('Buchungsreferenz','bookingReference',data.bookingReference)}</div>`;
      } else if(type==='day') {
        const last=days[days.length-1];
        let nextDate=last?.date||new Date().toISOString().slice(0,10);
        if(!id&&last?.date) { const date=new Date(last.date+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+1);nextDate=date.toISOString().slice(0,10); }
        fields.innerHTML=`<div class="trip-field-wide">${field('Titel','title',data.title,'text','required maxlength="160"')}</div>
          ${field('Datum','date',data.date||nextDate,'date','required')}
          <label>Reihenfolge<select name="order">${Array.from({length:days.length+(id?0:1)},(_,i)=>`<option value="${i}" ${i===(id?days.findIndex(d=>d.id===id):days.length)?'selected':''}>Position ${i+1}</option>`).join('')}</select></label>
          <div class="trip-field-wide">${field('Stadt / Region','region',data.region,'text','required maxlength="120"')}</div>${area('Beschreibung','summary',data.summary)}`;
      } else fields.innerHTML=`<div class="trip-field-wide">${field('Reisetitel','title',data.title,'text','required maxlength="160"')}</div>${area('Untertitel','subtitle',data.subtitle)}${field('Standardwährung','currency',data.currency||'EUR','text','required pattern="[A-Z]{3}" maxlength="3"')}`;
      dialog.showModal();fields.querySelector('input')?.focus();
    }
    fields.addEventListener('click',event=>{
      const button=event.target.closest('[data-editor-action="pick-location"]');
      if(!button||!locationPicker||picking)return;
      const latitude=form.elements.latitude.value===''?null:Number(form.elements.latitude.value);
      const longitude=form.elements.longitude.value===''?null:Number(form.elements.longitude.value);
      const previous={latitude:form.elements.latitude.value,longitude:form.elements.longitude.value,locationName:form.elements.locationName.value};
      picking=true;dialog.close();
      locationPicker({
        initial:{latitude,longitude},
        onChange(result){
          form.elements.latitude.value=result.latitude;
          form.elements.longitude.value=result.longitude;
          if(result.locationName)form.elements.locationName.value=result.locationName;
        },
        onFinish(confirmed){
          if(!confirmed){form.elements.latitude.value=previous.latitude;form.elements.longitude.value=previous.longitude;form.elements.locationName.value=previous.locationName;}
          picking=false;dialog.showModal();button.focus();
        }
      });
    });
    return {open,close,confirmDelete};
  };
}(window));
