/* Repository facade over TripStore. Backend implementations can expose the same API. */
(function (root) {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = prefix => prefix + '-' + (root.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2));
  const META_KEY = 'aus_trip_meta_v1';
  const TYPES = {
    sightseeing: 'Sightseeing', activity: 'Aktivität', restaurant: 'Restaurant', hotel: 'Hotel',
    flight: 'Flug', train: 'Zug', transport: 'Transport', event: 'Event', other: 'Sonstiges'
  };
  const TRANSPORT_MODES = { car:'Auto', plane:'Flugzeug', ferry:'Fähre', walk:'Zu Fuß', train:'Zug', other:'Sonstiges' };
  const aliases = { tour: 'activity', beach: 'activity', hike: 'activity', food: 'restaurant', drive: 'transport', plane: 'flight' };
  const coordinateMigrations = {
    'act-1-3':[-33.9461,151.1772], 'act-1-4':[-33.9461,151.1772], 'act-2-2':[-33.8695,151.201],
    'act-5-4':[[-28.6384,153.6366],[-28.6384,153.6383]], 'act-7-3':[-27.4608,153.036], 'act-12-1':[-25.449,153.058],
    'act-12-3':[-25.449,153.058], 'act-12-4':[-25.449,153.058], 'act-12-5':[-25.449,153.058],
    'act-13-2':[-20.2675,148.718], 'act-14-2':[-20.285,149.038], 'act-14-4':[-20.285,149.038],
    'act-16-2':[-37.8205,144.964], 'act-16-3':[-37.8205,144.964], 'act-17-1':[-37.816,144.938],
    'act-20-2':[-37.8304,144.98]
  };
  const sameCoords = (left, right) => Array.isArray(left) && Array.isArray(right) && left.length === 2 && left.every((value,index) => value === right[index]);
  const matchesMigration = (coords, migration) => Array.isArray(migration?.[0]) ? migration.some(candidate => sameCoords(coords,candidate)) : sameCoords(coords,migration);
  const normalizeTransport = value => ({flight:'plane',transport:'car',drive:'car',boat:'ferry'}[value] || (TRANSPORT_MODES[value] ? value : 'walk'));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const safeUrl = value => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
  const coords = stop => Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude) && Math.abs(stop.latitude) <= 90 && Math.abs(stop.longitude) <= 180;
  const tokens = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[a-z]{4,}/g) || [];
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value||'') && !Number.isNaN(Date.parse(value+'T12:00:00Z')) && new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
  function matchLocation(title, sights) {
    const words = tokens(title);
    return sights.find(s => {
      const name = tokens(s.name);
      return name.filter(w => words.includes(w)).length >= 2 || (name.length === 1 && words.includes(name[0]));
    });
  }
  function normalizeStop(data, day, index, tripId) {
    const lat = Object.hasOwn(data, 'latitude') ? data.latitude : data.coords?.[0] ?? null;
    const lng = Object.hasOwn(data, 'longitude') ? data.longitude : data.coords?.[1] ?? null;
    return { ...data, id: data.id || uid('stop'), tripId, dayId: day.id, dayNumber: day.dayNumber,
      order: index, orderIndex: index, title: data.title || data.name || 'Stopp',
      type: aliases[data.type || data.category] || data.type || data.category || 'other',
      coords: lat != null && lng != null ? [lat, lng] : null,
      locationName: data.locationName || data.region || day.region || '', region:data.region || day.region || data.locationName || 'Unterwegs', latitude: lat, longitude: lng,
      startTime: data.startTime ?? data.time ?? '', time: data.startTime ?? data.time ?? '', endTime: data.endTime || '',
      durationMinutes:Number.isFinite(Number(data.durationMinutes)) ? Number(data.durationMinutes) : 60,
      transportMode:normalizeTransport(data.transportMode || aliases[data.type || data.category] || data.type || data.category || day.transportType),
      description: data.description || '', notes: data.notes || '', image: data.image || '',
      cost: data.cost ?? null, currency: data.currency || 'EUR', bookingUrl: data.bookingUrl || '',
      bookingReference: data.bookingReference || '', createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString() };
  }
  function distance(a, b) {
    if (!coords(a) || !coords(b)) return null;
    const rad = n => n * Math.PI / 180;
    const dlat = rad(b.latitude - a.latitude), dlng = rad(b.longitude - a.longitude);
    const q = Math.sin(dlat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dlng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
  }
  const dateLabel = date => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return date || 'Datum offen';
    return new Intl.DateTimeFormat('de-AT', { weekday:'short', day:'numeric', month:'long' }).format(new Date(date + 'T12:00:00'));
  };
  root.TripModel = { TYPES, TRANSPORT_MODES, escape, safeUrl, coords, distance, dateLabel, uid };

  const instances = new WeakMap();
  function createRepository(store, storage, master = {}) {
    if (instances.has(store)) return instances.get(store);
    storage = root.Persistence?.wrap(storage) || storage;
    let metadata = clone(master.tripMeta || { id:'aus-roadtrip-2027', title:'Australien Roadtrip 2027', currency:'EUR' });
    const subscribers = new Set();
    let writing = false;
    function emit() { subscribers.forEach(fn => fn()); }
    function readDays() { return store.getDays().map((d, i) => ({ ...d, id:d.id || 'day-' + d.dayNumber, order:i })); }
    function nextDayNumber() {
      const number = Math.max(Number(storage?.getItem('aus_trip_day_sequence_v1')) || 0, ...readDays().map(d => d.dayNumber), 0) + 1;
      storage?.setItem('aus_trip_day_sequence_v1', String(number));
      return number;
    }
    function commit(days) { writing = true; try { store.replaceDays(days); } finally { writing = false; } emit(); }
    function assertDay(id, days = readDays()) { const day = days.find(d => d.id === id); if (!day) throw new Error('Dieser Tag existiert nicht mehr.'); return day; }
    function validateStop(data) {
      if (!String(data.title || '').trim()) throw new Error('Bitte einen Titel angeben.');
      if (!TYPES[data.type]) throw new Error('Bitte einen gültigen Typ wählen.');
      if (!TRANSPORT_MODES[data.transportMode]) throw new Error('Bitte ein gültiges Verkehrsmittel wählen.');
      if (!String(data.region || '').trim()) throw new Error('Bitte eine Stadt oder Region angeben.');
      if (!String(data.locationName || '').trim()) throw new Error('Bitte einen Standort angeben.');
      if ((data.latitude == null) !== (data.longitude == null)) throw new Error('Breiten- und Längengrad gemeinsam angeben.');
      if (data.latitude != null && !coords(data)) throw new Error('Koordinaten liegen außerhalb des gültigen Bereichs.');
      if (data.latitude == null) throw new Error('Bitte einen Standort auf der Karte wählen.');
      for (const time of [data.startTime, data.endTime]) if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Bitte eine gültige Uhrzeit angeben.');
      if (data.endTime && data.startTime && data.endTime < data.startTime) throw new Error('Die Endzeit muss nach der Startzeit liegen. Für Übernachtung bitte zwei Stops verwenden.');
      if (data.cost != null && (!Number.isFinite(data.cost) || data.cost < 0)) throw new Error('Kosten müssen eine positive Zahl sein.');
      if (!/^[A-Z]{3}$/.test(data.currency || 'EUR')) throw new Error('Bitte eine Währung mit drei Buchstaben angeben.');
      for (const key of ['image','bookingUrl']) if (data[key] && !safeUrl(data[key])) throw new Error('Links müssen mit https:// oder http:// beginnen.');
    }
    function reorder(items, ids) {
      if (ids.length !== items.length || new Set(ids).size !== items.length || ids.some(id => !items.some(item => item.id === id))) throw new Error('Ungültige Reihenfolge.');
      return ids.map((id, order) => ({ ...items.find(item => item.id === id), order, orderIndex:order }));
    }
    store.subscribe('*', ({event}) => { if (!writing && /^(day|activity|spot|days):/.test(event)) emit(); });
    const repository = {
      async init() {
        await store.ready();
        const savedMeta = storage?.getItem(META_KEY);
        if (savedMeta) metadata = JSON.parse(savedMeta);
        const days = readDays();
        const seedDay = dayNumber => {
          const source=master.days?.find(day=>day.dayNumber===dayNumber);
          if(!source)return null;
          const activities=(master.activities||[]).filter(activity=>activity.dayNumber===dayNumber).map(activity=>clone(activity));
          return {...clone(source),date:source.date,id:source.id||'day-'+dayNumber,activities,sights:[],highlights:[],budgetItems:[],stopModelVersion:0};
        };
        let changed = false;
        if(!days.some(day=>day.dayNumber===0)){
          const dayZero=seedDay(0);
          if(dayZero){days.unshift(dayZero);changed=true;}
        }
        const dayOne=days.find(day=>day.dayNumber===1);
        if(dayOne&&dayOne.title==='Abreise aus Wien'){dayOne.title='Flug ab Wien-Schwechat';changed=true;}
        const dayTen=days.find(day=>day.dayNumber===10);
        if(dayTen&&/Glass House Mountains|Noosa/.test(dayTen.title)){
          const brisbane=seedDay(10);
          if(brisbane){Object.assign(dayTen,{...brisbane,id:dayTen.id,dayNumber:10});changed=true;}
        }
        const dayEleven=days.find(day=>day.dayNumber===11);
        if(dayEleven&&/^Noosa/.test(dayEleven.title)){
          const coastStage=seedDay(11);
          if(coastStage){Object.assign(dayEleven,{...coastStage,id:dayEleven.id,dayNumber:11});changed=true;}
        }
        const highest = Math.max(0,...days.map(d => d.dayNumber));
        if ((Number(storage?.getItem('aus_trip_day_sequence_v1')) || 0) < highest) storage?.setItem('aus_trip_day_sequence_v1', String(highest));
        days.forEach(day => {
          if (day.stopModelVersion === 7) return;
          changed = true;
          const geo = master.days?.find(d => d.dayNumber === day.dayNumber);
          day.region=day.region || geo?.region || geo?.location || 'Unterwegs';
          const sights = day.sights || [];
          const used = new Set();
          day.activities = (day.activities || []).map((activity, i) => {
            const reference = master.activities?.find(a => a.dayNumber === day.dayNumber && a.title === activity.title);
            const canonicalReference = reference || master.activities?.find(a => a.id === activity.id);
            const storedCoordinates = activity.coords || (Number.isFinite(activity.latitude) && Number.isFinite(activity.longitude) ? [activity.latitude,activity.longitude] : null);
            const migrateCoordinates = matchesMigration(storedCoordinates, coordinateMigrations[activity.id]) && canonicalReference?.coords;
            const sight = matchLocation(activity.title, sights);
            if (sight) used.add(sight.id || sight.name);
            let position = (migrateCoordinates ? canonicalReference.coords : activity.coords) || canonicalReference?.coords || sight?.coords || null;
            if (!position && /Flughafen Wien|Wien-Schwechat/i.test(activity.title)) position = geo?.startCoords;
            if (!position && /Landung.*Sydney|Kingsford Smith/i.test(activity.title)) position = geo?.destCoords;
            if (!position) position = i === (day.activities?.length || 1)-1 ? geo?.destCoords : geo?.startCoords;
            return normalizeStop({ ...canonicalReference, ...activity, id:activity.id || 'act-' + day.dayNumber + '-' + (i+1),
              coords:position, latitude:position?.[0] ?? activity.latitude ?? null, longitude:position?.[1] ?? activity.longitude ?? null,
              locationName:(migrateCoordinates ? canonicalReference.locationName : activity.locationName) || canonicalReference?.locationName || sight?.name || geo?.location || day.region || day.title,
              region:(migrateCoordinates ? canonicalReference.region : activity.region) || canonicalReference?.region || day.region || geo?.region || geo?.location,
              transportMode:activity.transportMode || canonicalReference?.transportMode || day.transportType,
              durationMinutes:activity.durationMinutes || canonicalReference?.durationMinutes || 60,
              type:activity.type || canonicalReference?.category || activity.category || 'other' }, day, i, metadata?.id);
          });
          sights.filter(s => !used.has(s.id || s.name)).forEach(s => {
            day.activities.push(normalizeStop({ id:'stop-' + day.id + '-' + (s.id || uid('sight')), title:s.name,
              type:'sightseeing', coords:s.coords, locationName:s.name, region:s.region || day.region, transportMode:'walk', durationMinutes:60, description:s.highlight || '', notes:s.directions || '',
              bookingUrl:s.mapsUrl || '' }, day, day.activities.length, metadata?.id));
          });
          day.stopModelVersion = 7;
        });
        if (changed) commit(days);
        return this;
      },
      subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); },
      getTrip() { return clone(metadata); },
      createTrip(data) {
        if (metadata) throw new Error('Es gibt bereits eine aktive Reise.');
        if (!data.title?.trim()) throw new Error('Bitte einen Reisetitel angeben.');
        const next = { ...data, id:uid('trip'), createdAt:new Date().toISOString() };
        storage?.setItem(META_KEY, JSON.stringify(next)); metadata = next; emit(); return clone(next);
      },
      updateTrip(data) {
        if (!metadata) throw new Error('Keine aktive Reise.');
        if (!data.title?.trim()) throw new Error('Bitte einen Reisetitel angeben.');
        const next = { ...metadata, ...data, id:metadata.id, updatedAt:new Date().toISOString() };
        storage?.setItem(META_KEY, JSON.stringify(next)); metadata = next; emit(); return clone(next);
      },
      deleteTrip() { commit([]); storage?.setItem(META_KEY, 'null'); metadata = null; emit(); },
      getDays:readDays,
      getDay(id) { return clone(assertDay(id)); },
      getStops(dayId) { return clone(readDays().filter(d => !dayId || d.id === dayId).flatMap(d => (d.activities || []).map((s,i) => normalizeStop(s,d,i,metadata?.id)))); },
      getStop(id) { return this.getStops().find(s => s.id === id) || null; },
      createDay(data) {
        if (!metadata) throw new Error('Bitte zuerst eine Reise anlegen.');
        if (!data.title?.trim() || !validDate(data.date)) throw new Error('Bitte Titel und gültiges Datum angeben.');
        const days = readDays();
        const day = { ...data, id:uid('day'), dayNumber:nextDayNumber(),
          order:days.length, stopModelVersion:7, activities:[], sights:[], highlights:[], budgetItems:[], accommodation:null };
        const position=data.order==null?days.length:Number(data.order);
        if(!Number.isInteger(position)||position<0||position>days.length)throw new Error('Ungültige Tagesposition.');
        days.splice(position,0,day);commit(days); return clone(day);
      },
      updateDay(id, data) {
        const days = readDays(), day = assertDay(id,days);
        if (!data.title?.trim() || !validDate(data.date)) throw new Error('Bitte Titel und gültiges Datum angeben.');
        const position=data.order==null?days.findIndex(d=>d.id===id):Number(data.order);
        if(!Number.isInteger(position)||position<0||position>=days.length)throw new Error('Ungültige Tagesposition.');
        Object.assign(day,data,{id:day.id,dayNumber:day.dayNumber});
        days.splice(days.findIndex(d=>d.id===id),1);days.splice(position,0,day);commit(days); return clone(day);
      },
      deleteDay(id) { const days = readDays(); assertDay(id,days); commit(days.filter(d => d.id !== id)); },
      duplicateDay(id) {
        const original = this.getDay(id), days = readDays();
        const copy = { ...original, id:uid('day'), dayNumber:nextDayNumber(), title:original.title+' (Kopie)' };
        copy.activities = original.activities.map((s,i) => normalizeStop({ ...s,id:uid('stop'), ...(s.activityMeta ? {activityMeta:{...s.activityMeta,id:uid('activity')}} : {}) },copy,i,metadata?.id));
        days.splice(days.findIndex(d => d.id === id)+1,0,copy); commit(days); return clone(copy);
      },
      reorderDays(ids) { commit(reorder(readDays(),ids)); },
      createStop(dayId, data) {
        validateStop(data); const days = readDays(), day = assertDay(dayId,days);
        const stop = normalizeStop({ ...data, id:uid('stop') },day,day.activities.length,metadata?.id);
        day.activities.push(stop); commit(days); return clone(stop);
      },
      updateStop(id, data) {
        const previous = this.getStop(id); if (!previous) throw new Error('Dieser Stopp existiert nicht mehr.');
        const next = {...previous,...data}; validateStop(next);
        const days = readDays(), target = assertDay(next.dayId,days);
        const from = assertDay(previous.dayId,days);
        const index = from.activities.findIndex(s => s.id === id);
        from.activities.splice(index,1);
        const position = from.id === target.id ? index : target.activities.length;
        const stop = normalizeStop({...next,updatedAt:new Date().toISOString()},target,position,metadata?.id);
        target.activities.splice(position,0,stop); commit(days); return clone(stop);
      },
      deleteStop(id) { const days = readDays(); const stop = this.getStop(id); if (!stop) throw new Error('Dieser Stopp existiert nicht mehr.'); const day = assertDay(stop.dayId,days); day.activities = day.activities.filter(s => s.id !== id); commit(days); },
      reorderStops(dayId, ids) { const days = readDays(), day = assertDay(dayId,days); day.activities = reorder(day.activities,ids); commit(days); }
    };
    instances.set(store, repository);
    return repository;
  }
  root.createTripRepository = createRepository;
}(typeof window !== 'undefined' ? window : globalThis));
