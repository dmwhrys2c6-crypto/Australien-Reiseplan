/* Pure presentation functions: no persistence or mutations. */
(function(root) {
  'use strict';
  const M=root.TripModel, e=M.escape;
  const icon = (name) => `<i class="fa-solid fa-${name}" aria-hidden="true"></i>`;
  const button = (action,label,symbol,extra='') => `<button type="button" class="trip-icon-button" data-action="${action}" aria-label="${e(label)}" title="${e(label)}" ${extra}>${icon(symbol)}</button>`;
  function summary(stops) {
    const located=stops.filter(M.coords);
    const distance=stops.slice(1).reduce((sum,s,i)=>sum+(M.distance(stops[i],s)||0),0);
    return `${stops.length} Stops · ${located.length} auf der Karte${distance ? ' · '+Math.round(distance)+' km Luftlinie':''}`;
  }
  function card(stop,index,active,expanded) {
    const location=stop.locationName|| (M.coords(stop)?'Standort auf der Karte':'Standort ergänzen');
    const image=M.safeUrl(stop.image);
    return `<article class="trip-stop-card ${active?'is-selected':''}" data-stop="${e(stop.id)}" id="trip-stop-${e(stop.id)}">
      <div class="trip-stop-time">${e(stop.startTime || 'Offen')}<span>${e(M.TYPES[stop.type]||'Sonstiges')}</span></div>
      <div class="trip-stop-row">
        <button type="button" class="trip-drag-handle" draggable="true" data-drag-stop="${e(stop.id)}" aria-label="${e(stop.title)} verschieben; Pfeiltasten zum Sortieren" title="Ziehen oder Pfeiltasten zum Sortieren">${icon('grip-vertical')}</button>
        <button type="button" class="trip-stop-select" data-action="select-stop" data-id="${e(stop.id)}" aria-pressed="${active}">
          ${image?`<img src="${e(image)}" alt="" loading="lazy" onerror="this.hidden=true">`:`<span class="trip-stop-number">${index+1}</span>`}
          <span><strong>${e(stop.title)}</strong><small>${e(location)}</small>${stop.endTime?`<small>${e(stop.startTime)} – ${e(stop.endTime)}</small>`:''}</span>
        </button>
        ${button('edit-stop','Stopp bearbeiten','pen',`data-id="${e(stop.id)}"`)}
      </div>
      ${(expanded||active)?`<div class="trip-stop-detail">${stop.description?`<p>${e(stop.description)}</p>`:''}${stop.notes?`<p>${icon('note-sticky')} ${e(stop.notes)}</p>`:''}
        ${stop.cost!=null?`<span>${e(new Intl.NumberFormat('de-AT',{maximumFractionDigits:2}).format(stop.cost))} ${e(stop.currency)}</span>`:''}
        ${stop.startTime&&stop.endTime?`<span>${duration(stop.startTime,stop.endTime)} Min.</span>`:''}
        ${stop.bookingReference?`<span>Buchung: ${e(stop.bookingReference)}</span>`:''}
        ${M.safeUrl(stop.bookingUrl)?`<a href="${e(M.safeUrl(stop.bookingUrl))}" target="_blank" rel="noopener noreferrer">Buchung öffnen ${icon('arrow-up-right-from-square')}</a>`:''}
        ${!M.coords(stop)?'<span class="trip-location-missing">Noch kein Kartenstandort hinterlegt</span>':''}
      </div>`:''}
    </article>`;
  }
  function duration(start,end) { const minutes=t=>Number(t.slice(0,2))*60+Number(t.slice(3)); return minutes(end)-minutes(start); }
  root.TripComponents={
    icon,button,summary,
    header(trip,days) {
      const dates=days.map(d=>d.date).filter(Boolean).sort();
      return `<div><span class="trip-eyebrow">UNSER REISEPLAN</span><h1>${e(trip?.title||'Deine nächste Reise')}</h1><p>${dates.length?e(M.dateLabel(dates[0]))+' – '+e(M.dateLabel(dates[dates.length-1]))+' · ':''}${days.length} Tage</p></div>
        <div class="trip-header-actions">${button('edit-trip','Reise bearbeiten','pen')}
        <details class="trip-menu"><summary aria-label="Reiseoptionen">${icon('ellipsis')}</summary><div><button type="button" data-action="add-day">Tag hinzufügen</button><button type="button" data-action="export-trip">Reise exportieren</button></div></details></div>`;
    },
    selector(days,active) { return `<button type="button" class="trip-day-pill ${active===null?'is-active':''}" data-action="overview" aria-pressed="${active===null}">${icon('map')} Übersicht</button>`+
      days.map((d,i)=>`<button type="button" class="trip-day-pill ${active===d.id?'is-active':''}" data-action="select-day" data-id="${e(d.id)}" aria-pressed="${active===d.id}" title="${e(d.title)}">Tag ${i+1}</button>`).join('')+
      `<button type="button" class="trip-day-pill trip-add-day" data-action="add-day" aria-label="Tag hinzufügen">${icon('plus')}</button>`; },
    timeline(stops,selected,expanded) {
      if (!stops.length) return `<div class="trip-empty">${icon('location-dot')}<h3>Ein Tag voller Möglichkeiten.</h3><p>Für diesen Tag sind noch keine Stops geplant.</p><button type="button" class="trip-primary-button" data-action="add-stop">Ersten Stopp hinzufügen</button></div>`;
      return stops.map((s,i)=>`${i&&M.distance(stops[i-1],s)!=null?`<div class="trip-transport">${icon('route')} ${M.distance(stops[i-1],s).toFixed(1)} km Luftlinie</div>`:''}${card(s,i,selected===s.id,expanded)}${selected===s.id&&root.ManagementPage?`<div class="manage-stop-links">${root.ManagementPage.related(s.id)}</div>`:''}`).join('')+
        `<button type="button" class="trip-add-stop" data-action="add-stop">${icon('plus')} Stopp hinzufügen</button>`;
    },
    overview(days,repository,map) {
      if (!days.length) return `<div class="trip-empty">${icon('calendar-plus')}<h3>Hier beginnt deine Reise.</h3><p>Lege den ersten Tag an und plane deine Stops.</p><button type="button" class="trip-primary-button" data-action="add-day">Ersten Tag anlegen</button></div>`;
      return `<div class="trip-overview">${days.map((d,i)=>`<button type="button" class="trip-day-card" data-action="select-day" data-id="${e(d.id)}"><span class="trip-day-card-date" style="--day-color:${map.color(i)}">${e(M.dateLabel(d.date))}</span><span><small>TAG ${i+1}</small><strong>${e(d.title)}</strong><small>${e(summary(repository.getStops(d.id)))}</small></span>${icon('chevron-right')}</button>`).join('')}</div>`;
    },
    sheetHeading(day,number,stops,days) {
      return day?`<div><span class="trip-eyebrow">TAG ${number} · ${e(M.dateLabel(day.date))}</span><h2>${e(day.title)}</h2><p>${e(summary(stops))}</p></div>`:
        `<div><span class="trip-eyebrow">VON DER ERSTEN IDEE BIS ZUM LETZTEN STOPP</span><h2>Deine Reise im Überblick</h2><p>${days.length} Tage · ${stops.length} Stops</p></div>`;
    }
  };
}(window));
