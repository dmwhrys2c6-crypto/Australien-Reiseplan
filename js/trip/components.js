/* Pure presentation functions: no persistence or mutations. */
(function(root){
  'use strict';
  const M=root.TripModel,e=M.escape;
  const TRANSPORT={car:['car-side','Auto'],plane:['plane','Flug'],ferry:['ship','Fähre'],walk:['person-walking','Zu Fuß'],train:['train','Zug'],other:['route','Route']};
  const icon=name=>`<i class="fa-solid fa-${name}" aria-hidden="true"></i>`;
  const button=(action,label,symbol,extra='')=>`<button type="button" class="trip-icon-button" data-action="${action}" aria-label="${e(label)}" title="${e(label)}" ${extra}>${icon(symbol)}</button>`;
  const mode=stop=>TRANSPORT[stop.transportMode]||TRANSPORT.other;
  const timeText=stop=>stop.startTime&&stop.endTime?`${stop.startTime}–${stop.endTime}`:stop.startTime?`Ankunft ${stop.startTime}`:stop.durationMinutes?`${stop.durationMinutes} Min.`:'Zeit offen';
  function summary(stops){
    const located=stops.filter(M.coords),distance=stops.slice(1).reduce((sum,stop,index)=>sum+(M.distance(stops[index],stop)||0),0);
    return `${stops.length} Stopps · ${located.length} auf der Karte${distance?' · '+Math.round(distance)+' km Luftlinie':''}`;
  }
  function card(stop,index,active){
    const location=stop.locationName||(M.coords(stop)?stop.region||'Kartenstandort':'Standort ergänzen'),image=M.safeUrl(stop.image),transport=mode(stop);
    return `<article class="trip-stop-card ${active?'is-selected':''} glass-row-item" data-stop="${e(stop.id)}" id="trip-stop-${e(stop.id)}">
      <div class="trip-stop-row">
        <button type="button" class="trip-drag-handle" draggable="true" data-drag-stop="${e(stop.id)}" aria-label="${e(stop.title)} verschieben; Pfeiltasten zum Sortieren" title="Ziehen oder Pfeiltasten zum Sortieren">${icon('grip-vertical')}</button>
        <button type="button" class="trip-stop-select" data-action="select-stop" data-id="${e(stop.id)}" aria-expanded="${active}" aria-controls="trip-stop-detail-${e(stop.id)}">
          ${image?`<img src="${e(image)}" alt="" loading="lazy" onerror="this.hidden=true">`:`<span class="trip-stop-number">${index+1}</span>`}
          <span><strong>${e(stop.title)}</strong><small class="trip-stop-mode">${e(location)} · ${icon(transport[0])} ${e(transport[1])} · ${e(timeText(stop))} · ${e(M.TYPES[stop.type]||'Sonstiges')}</small></span>
          ${icon(active?'chevron-up':'chevron-down')}
        </button>
        ${button('edit-stop','Stopp bearbeiten','pen',`data-id="${e(stop.id)}"`)}
      </div>
      ${active?`<div class="trip-stop-detail" id="trip-stop-detail-${e(stop.id)}">
        ${stop.description?`<p>${e(stop.description)}</p>`:''}
        ${stop.notes?`<p>${icon('note-sticky')} ${e(stop.notes)}</p>`:''}
        <span>${icon(transport[0])} ${e(transport[1])}</span>
        ${M.coords(stop)?`<span>${Number(stop.latitude).toFixed(5)}, ${Number(stop.longitude).toFixed(5)}</span>`:'<span class="trip-location-missing">Noch kein Kartenstandort hinterlegt</span>'}
        ${stop.cost!=null?`<span>${e(new Intl.NumberFormat('de-AT',{maximumFractionDigits:2}).format(stop.cost))} ${e(stop.currency)}</span>`:''}
        ${stop.bookingReference?`<span>Buchung: ${e(stop.bookingReference)}</span>`:''}
        ${M.safeUrl(stop.bookingUrl)?`<a href="${e(M.safeUrl(stop.bookingUrl))}" target="_blank" rel="noopener noreferrer">Buchung öffnen ${icon('arrow-up-right-from-square')}</a>`:''}
      </div>`:''}
    </article>`;
  }
  function groupedTimeline(day,stops,selected){
    if(!stops.length)return `<div class="trip-empty glass-card">${icon('location-dot')}<h3>Ein Tag voller Möglichkeiten.</h3><p>Für diesen Tag sind noch keine Stopps geplant.</p><button type="button" class="trip-primary-button glass-pill glass-action-primary" data-action="add-stop">Ersten Stopp hinzufügen</button></div>`;
    const regions=new Map();
    stops.forEach(stop=>{const region=stop.region||day.region||stop.locationName||'Unterwegs';if(!regions.has(region))regions.set(region,[]);regions.get(region).push(stop);});
    let globalIndex=0;
    return [...regions.entries()].map(([region,items])=>`<section class="trip-region glass-card" aria-labelledby="region-${e(day.id)}-${globalIndex}">
      <header class="trip-region-header"><span class="trip-region-icon">${icon('location-dot')}</span><div><span>STADT / REGION</span><h3 id="region-${e(day.id)}-${globalIndex}">${e(region)}</h3></div></header>
      <div class="trip-region-stops">${items.map(stop=>{const index=globalIndex++,previous=stops[index-1],distance=previous?M.distance(previous,stop):null;return`${distance!=null?`<div class="trip-transport">${icon(mode(stop)[0])} ${e(mode(stop)[1])} · ${distance.toFixed(1)} km Luftlinie</div>`:''}${card(stop,index,selected===stop.id)}${selected===stop.id&&root.ManagementPage?`<div class="manage-stop-links">${root.ManagementPage.related(stop.id)}</div>`:''}`;}).join('')}</div>
    </section>`).join('')+`<button type="button" class="trip-add-stop glass-pill" data-action="add-stop">${icon('plus')} Stopp hinzufügen</button>`;
  }
  root.TripComponents={
    icon,button,summary,
    header(trip,days){
      const dates=days.map(day=>day.date).filter(Boolean).sort();
      return `<div><span class="trip-eyebrow glass-eyebrow">UNSER REISEPLAN</span><h1>${e(trip?.title||'Deine nächste Reise')}</h1><p>${dates.length?e(M.dateLabel(dates[0]))+' – '+e(M.dateLabel(dates[dates.length-1]))+' · ':''}${days.length} Reisetage</p></div>
        <div class="trip-header-actions">${button('edit-trip','Reise bearbeiten','pen')}<details class="trip-menu"><summary aria-label="Reiseoptionen">${icon('ellipsis')}</summary><div><button type="button" data-action="add-day">Tag hinzufügen</button><button type="button" data-action="export-trip">Reise exportieren</button></div></details></div>`;
    },
    selector(days,active){return `<button type="button" class="trip-day-pill ${active===null?'is-active':''} glass-pill" data-action="overview" aria-pressed="${active===null}">${icon('map')} Übersicht</button>`+
      days.map(day=>`<button type="button" class="trip-day-pill ${active===day.id?'is-active':''} glass-pill" data-action="select-day" data-id="${e(day.id)}" aria-pressed="${active===day.id}" title="${e(day.title)}">Tag ${e(day.dayNumber)}</button>`).join('')+
      `<button type="button" class="trip-day-pill trip-add-day glass-pill" data-action="add-day" aria-label="Tag hinzufügen">${icon('plus')}</button>`;},
    timeline:groupedTimeline,
    overview(days,repository,map){
      if(!days.length)return `<div class="trip-empty glass-card">${icon('calendar-plus')}<h3>Hier beginnt deine Reise.</h3><p>Lege den ersten Tag an und plane deine Stopps.</p><button type="button" class="trip-primary-button glass-pill glass-action-primary" data-action="add-day">Ersten Tag anlegen</button></div>`;
      return `<div class="trip-overview">${days.map((day,index)=>`<button type="button" class="trip-day-card glass-row-item" data-action="select-day" data-id="${e(day.id)}"><span class="trip-day-card-date" style="--day-color:${map.color(index)}">${e(M.dateLabel(day.date))}</span><span><small>TAG ${e(day.dayNumber)} · ${e(day.region||'Unterwegs')}</small><strong>${e(day.title)}</strong><small>${e(summary(repository.getStops(day.id)))}</small></span>${icon('chevron-right')}</button>`).join('')}</div>`;
    },
    sheetHeading(day,number,stops,days){return day?`<div><span class="trip-eyebrow glass-eyebrow">TAG ${number} · ${e(M.dateLabel(day.date))}</span><h2>${e(day.title)}</h2><p>${e(day.region||'Unterwegs')} · ${e(summary(stops))}</p></div>`:
      `<div><span class="trip-eyebrow glass-eyebrow">VON DER ERSTEN IDEE BIS ZUM LETZTEN STOPP</span><h2>Deine Reise im Überblick</h2><p>${days.length} Reisetage · ${stops.length} Stopps</p></div>`;}
  };
}(window));
