/* Leaflet is contained here: the page depends only on render/focus/fit/zoom/resize. */
(function (root) {
  'use strict';
  root.createTripMap = function (container, onSelect, onStatus) {
    let map, layer, lastGroups = [], selected = null;
    const markers = new Map();
    const model = root.TripModel;
    const colors = ['#006d68','#467db7','#976b9c','#ca8258','#698950','#518d9e'];
    const icon = (number,color,active) => L.divIcon({ className:'trip-marker-wrap',
      html:`<span class="trip-marker ${active?'is-active':''}" style="--marker-color:${color}">${number}</span>`,
      iconSize:[36,36], iconAnchor:[18,18] });
    function init() {
      if (map) return true;
      if (!root.L) { onStatus('error','Die Kartenbibliothek konnte nicht geladen werden. Tagesplan und Bearbeitung bleiben verfügbar.'); return false; }
      map = L.map(container, { zoomControl:false, scrollWheelZoom:true, minZoom:2, maxZoom:19 }).setView([-28.5,149],5);
      layer = L.featureGroup().addTo(map);
      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom:19
      }).addTo(map);
      let loaded = false;
      tiles.on('loading', () => { if (!loaded) onStatus('loading','Karte wird geladen …'); });
      tiles.on('tileload', () => { loaded = true; onStatus('ready',''); });
      tiles.on('tileerror', () => onStatus('error','Kartendaten nicht erreichbar. Verbindung prüfen und erneut laden.'));
      return true;
    }
    function fit() {
      if (!map) return;
      map.invalidateSize({pan:false});
      const points = lastGroups.flatMap(g => g.stops.filter(model.coords).map(s => [s.latitude,s.longitude]));
      if (!points.length) { map.setView([-28.5,149],5); return; }
      const width = container.clientWidth, height = container.clientHeight;
      const mobile = width < 760;
      const top = mobile ? 160 : 170;
      const bottom = mobile ? Math.min(height*.45,330) : 60;
      const left = mobile ? 24 : Math.min(width*.42,560);
      map.fitBounds(L.latLngBounds(points), {paddingTopLeft:[left,top],paddingBottomRight:[60,bottom],maxZoom:points.length===1?13:14,animate:!matchMedia('(prefers-reduced-motion: reduce)').matches});
    }
    return {
      render(groups, activeId, refit=true) {
        lastGroups = groups; selected = activeId;
        if (!init()) return;
        layer.clearLayers(); markers.clear();
        groups.forEach((group,groupIndex) => {
          const color = groups.length===1 ? '#006d68' : colors[groupIndex % colors.length];
          const points = [];
          group.stops.forEach((stop,index) => {
            if (!model.coords(stop)) return;
            const marker = L.marker([stop.latitude,stop.longitude], { icon:icon(index+1,color,stop.id===activeId),
              title:`Tag ${group.number} · Stopp ${index+1}: ${stop.title}`,keyboard:true }).addTo(layer);
            marker.bindTooltip(model.escape(stop.title), {direction:'top',offset:[0,-12]});
            // Native handlers also work when a marker is focused during a map resize.
            const element=marker.getElement();
            element.addEventListener('click', event=>{event.stopPropagation();onSelect(stop.id);});
            element.addEventListener('keydown', event=>{
              if(event.key==='Enter'||event.key===' ') {event.preventDefault();event.stopPropagation();onSelect(stop.id);}
            });
            markers.set(stop.id,{marker,stop,number:index+1,color});
            points.push([stop.latitude,stop.longitude]);
          });
          // Deliberately straight connections, not a road-routing or driving-time estimate.
          if (points.length>1) L.polyline(points,{color,weight:4,opacity:.75,lineCap:'round',dashArray:group.stops.some(s=>s.type==='flight')?'8 8':null}).addTo(layer);
        });
        if (refit) fit();
      },
      focus(id) {
        selected=id;
        markers.forEach(({marker,number,color},key)=>marker.setIcon(icon(number,color,key===id)));
        const entry=markers.get(id);
        if (entry) {
          map.setView(entry.marker.getLatLng(),Math.max(map.getZoom(),12),{animate:!matchMedia('(prefers-reduced-motion: reduce)').matches});
          const mobile=container.clientWidth<760;
          map.panBy(mobile?[0,100]:[-Math.min(container.clientWidth*.2,260),0],{animate:false});
          entry.marker.openTooltip();
        }
      },
      zoom(delta) { if (map) delta>0?map.zoomIn():map.zoomOut(); },
      fit,
      resize() { if (map) map.invalidateSize({pan:false}); },
      retry() { if (!map) init(); else map.eachLayer(l=>{if(l instanceof L.TileLayer)l.redraw();}); },
      destroy() { if (map) map.remove(); map=null; },
      color: index => colors[index % colors.length]
    };
  };
}(window));
