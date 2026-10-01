/* Leaflet adapter: basemap, route rendering and location picking stay isolated here. */
(function (root) {
  'use strict';
  const TILE_URL='https://tile.openstreetmap.de/{z}/{x}/{y}.png';
  const TILE_ATTRIBUTION='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap-Mitwirkende</a>';
  const MODES={
    car:{icon:'car-side',label:'Auto',color:'#176b87'},plane:{icon:'plane',label:'Flug',color:'#5367a6'},
    ferry:{icon:'ship',label:'Fähre',color:'#16889c'},walk:{icon:'person-walking',label:'Zu Fuß',color:'#49765c'},
    train:{icon:'train',label:'Zug',color:'#865a92'},other:{icon:'route',label:'Route',color:'#657386'}
  };

  root.createTripMap=function(container,onSelect,onStatus){
    let map,markerLayer,routeLayer,pickerLayer,tileLayer,lastGroups=[],picker=null,reverseController=null;
    const markers=new Map(),model=root.TripModel;
    const reducedMotion=()=>root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const modeOf=stop=>['car','plane','ferry','walk','train'].includes(stop.transportMode)?stop.transportMode:
      ({flight:'plane',transport:'car',activity:'walk'}[stop.type]||'other');
    const stopIcon=(stop,active)=>{const meta=MODES[modeOf(stop)];return L.divIcon({className:'trip-marker-wrap',
      html:`<span class="trip-marker ${active?'is-active':''}" style="--marker-color:${meta.color}"><i class="fa-solid fa-${meta.icon}" aria-hidden="true"></i></span>`,
      iconSize:[40,40],iconAnchor:[20,20]});};
    const pickerIcon=()=>L.divIcon({className:'trip-marker-wrap',html:'<span class="trip-marker trip-picker-marker is-active"><i class="fa-solid fa-location-dot" aria-hidden="true"></i></span>',iconSize:[44,44],iconAnchor:[22,40]});

    function init(){
      if(map)return true;
      if(!root.L){onStatus('error','Die Kartenbibliothek konnte nicht geladen werden. Tagesplan und Bearbeitung bleiben verfügbar.');return false;}
      map=L.map(container,{zoomControl:false,scrollWheelZoom:true,minZoom:2,maxZoom:19,preferCanvas:true}).setView([-28.5,149],5);
      routeLayer=L.featureGroup().addTo(map);markerLayer=L.featureGroup().addTo(map);pickerLayer=L.featureGroup().addTo(map);
      tileLayer=L.tileLayer(TILE_URL,{attribution:TILE_ATTRIBUTION,maxZoom:19}).addTo(map);
      let loaded=false;
      tileLayer.on('loading',()=>{if(!loaded)onStatus('loading','Karte wird geladen …');});
      tileLayer.on('tileload',()=>{loaded=true;onStatus('ready','');});
      tileLayer.on('tileerror',()=>onStatus('error','Kartendaten nicht erreichbar. Verbindung prüfen und erneut laden.'));
      return true;
    }
    function fit(){
      if(!map)return;
      map.invalidateSize({pan:false});
      const points=lastGroups.flatMap(group=>group.stops.filter(model.coords).map(stop=>[stop.latitude,stop.longitude]));
      if(!points.length){map.setView([-28.5,149],5);return;}
      const width=container.clientWidth,height=container.clientHeight,mobile=width<760;
      map.fitBounds(L.latLngBounds(points),{
        paddingTopLeft:[mobile?24:Math.min(width*.42,560),mobile?160:170],
        paddingBottomRight:[60,mobile?Math.min(height*.45,330):60],maxZoom:points.length===1?15:14,animate:!reducedMotion()
      });
    }
    function curvedFlight(a,b){
      const steps=36,mid=[(a[0]+b[0])/2,(a[1]+b[1])/2],distance=Math.hypot(b[0]-a[0],b[1]-a[1]),control=[mid[0]+Math.min(18,distance*.22),mid[1]];
      return Array.from({length:steps+1},(_,index)=>{const t=index/steps,u=1-t;return[u*u*a[0]+2*u*t*control[0]+t*t*b[0],u*u*a[1]+2*u*t*control[1]+t*t*b[1]];});
    }
    function wavyFerry(a,b){
      const steps=36,dx=b[1]-a[1],dy=b[0]-a[0],length=Math.hypot(dx,dy)||1,amplitude=Math.min(.08,length*.025);
      return Array.from({length:steps+1},(_,index)=>{const t=index/steps,wave=Math.sin(t*Math.PI*8)*amplitude;return[a[0]+dy*t+(dx/length)*wave,a[1]+dx*t-(dy/length)*wave];});
    }
    function drawSegment(from,to,mode){
      const meta=MODES[mode]||MODES.other,points=mode==='plane'?curvedFlight(from,to):mode==='ferry'?wavyFerry(from,to):[from,to];
      L.polyline(points,{className:`trip-route-line is-${mode}`,color:meta.color,weight:mode==='walk'?4:5,opacity:.82,lineCap:'round',dashArray:mode==='plane'?'10 12':mode==='walk'?'2 9':null,interactive:true})
        .bindTooltip(meta.label,{sticky:true}).addTo(routeLayer);
      const middle=points[Math.floor(points.length/2)];
      L.marker(middle,{interactive:false,keyboard:false,icon:L.divIcon({className:'trip-route-mode-wrap',html:`<span class="trip-route-mode" style="--route-color:${meta.color}" aria-hidden="true"><i class="fa-solid fa-${meta.icon}"></i></span>`,iconSize:[30,30],iconAnchor:[15,15]})}).addTo(routeLayer);
    }
    async function reverseGeocode(latitude,longitude){
      reverseController?.abort();reverseController=new AbortController();
      const key=`${latitude.toFixed(5)},${longitude.toFixed(5)}`;
      try{
        const cached=JSON.parse(root.sessionStorage?.getItem('aus_reverse_geocode_cache')||'{}');
        if(cached[key])return cached[key];
        const url=new URL('https://nominatim.openstreetmap.org/reverse');
        url.search=new URLSearchParams({format:'jsonv2',lat:String(latitude),lon:String(longitude),zoom:'18',addressdetails:'1','accept-language':'de'});
        const response=await fetch(url,{headers:{Accept:'application/json'},signal:reverseController.signal});
        if(!response.ok)throw new Error('Ortsname konnte nicht geladen werden.');
        const data=await response.json(),address=data.address||{};
        const name=[data.name,address.road,address.suburb,address.city||address.town||address.village,address.state].filter(Boolean).filter((value,index,array)=>array.indexOf(value)===index).slice(0,3).join(', ')||data.display_name||'Ausgewählter Standort';
        cached[key]=name;root.sessionStorage?.setItem('aus_reverse_geocode_cache',JSON.stringify(cached));return name;
      }catch(error){if(error.name==='AbortError')return null;throw error;}
    }
    function setPickerPosition(latlng,resolveName=true){
      if(!picker)return;
      pickerLayer.clearLayers();
      const marker=L.marker(latlng,{icon:pickerIcon(),draggable:true,title:'Ausgewählten Standort verschieben',keyboard:true}).addTo(pickerLayer);
      marker.on('dragend',event=>setPickerPosition(event.target.getLatLng(),true));
      const result={latitude:Number(latlng.lat.toFixed(6)),longitude:Number(latlng.lng.toFixed(6)),locationName:''};
      picker.onChange(result,'loading');
      if(resolveName)reverseGeocode(result.latitude,result.longitude).then(name=>{if(!picker||!name)return;result.locationName=name;picker.onChange(result,'ready');}).catch(()=>picker?.onChange(result,'error'));
      else picker.onChange(result,'ready');
    }

    return{
      render(groups,activeId,refit=true){
        lastGroups=groups;if(!init())return;markerLayer.clearLayers();routeLayer.clearLayers();markers.clear();
        groups.forEach(group=>{
          const located=group.stops.filter(model.coords);
          located.forEach((stop,index)=>{
            const marker=L.marker([stop.latitude,stop.longitude],{icon:stopIcon(stop,stop.id===activeId),title:`Tag ${group.number} · Stopp ${index+1}: ${stop.title}`,keyboard:true}).addTo(markerLayer);
            marker.bindTooltip(`<strong>${model.escape(stop.title)}</strong><br>${model.escape(stop.locationName||stop.region||'')}`,{direction:'top',offset:[0,-14]});
            marker.on('click',event=>{event.originalEvent?.stopPropagation();onSelect(stop.id);});
            markers.set(stop.id,{marker,stop});
            if(index>0){const previous=located[index-1];drawSegment([previous.latitude,previous.longitude],[stop.latitude,stop.longitude],modeOf(stop));}
          });
        });
        if(refit)fit();
      },
      focus(id){
        markers.forEach(({marker,stop},key)=>marker.setIcon(stopIcon(stop,key===id)));
        const entry=markers.get(id);if(!entry||!map)return;
        map.setView(entry.marker.getLatLng(),Math.max(map.getZoom(),13),{animate:!reducedMotion()});
        map.panBy(container.clientWidth<760?[0,100]:[-Math.min(container.clientWidth*.2,260),0],{animate:false});entry.marker.openTooltip();
      },
      startPicking(initial,onChange){
        if(!init())return false;
        this.stopPicking();picker={onChange};container.classList.add('is-location-picking');map.on('click',event=>setPickerPosition(event.latlng,true));
        if(Number.isFinite(initial?.latitude)&&Number.isFinite(initial?.longitude)){const latlng=L.latLng(initial.latitude,initial.longitude);setPickerPosition(latlng,false);map.setView(latlng,Math.max(map.getZoom(),15));}else fit();
        return true;
      },
      stopPicking(){if(map)map.off('click');reverseController?.abort();reverseController=null;picker=null;pickerLayer?.clearLayers();container.classList.remove('is-location-picking');},
      zoom(delta){if(map)delta>0?map.zoomIn():map.zoomOut();},fit,resize(){map?.invalidateSize({pan:false});},
      retry(){if(!map)init();else tileLayer?.redraw();},destroy(){if(map)map.remove();map=null;},
      color:index=>['#176b87','#5367a6','#865a92','#b96845','#49765c','#16889c'][index%6]
    };
  };
}(window));
