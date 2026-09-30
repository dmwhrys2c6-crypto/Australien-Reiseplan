/* =========================================================================
   AUSTRALIEN ROADTRIP 2027 – TRIP STORE (Single Source of Truth)
   Zentraler reaktiver Datenspeicher mit vollständigen CRUD-Operationen
   für Tage, Aktivitäten, Spots, Unterkünfte, Buchungen & Finanzen.
   Local-First Persistenz mit automatischem Event-Bus.
   ========================================================================= */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./tripMasterData'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const master = require('./tripMasterData');
    module.exports = factory(master);
  } else {
    root.TripStore = factory(root.TRIP_MASTER_DATA);
  }
}(typeof self !== 'undefined' ? self : this, function (initialMasterData) {
  'use strict';

  const STORAGE_KEY = 'aus_trip_master_v3';
  const listeners = new Map();

  let state = {
    version: 3,
    tripMeta: {},
    days: [],
    activities: [],
    spots: [],
    accommodations: [],
    bookings: [],
    expenses: [],
    packing: [],
    photos: [],
    routes: {},
    airspaceFeatures: [],
    weather: {},
    cipherVault: ""
  };

  // Helper: Deep Clone
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Helper: Generate UUID-like ID
  function generateId(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  }

  // Helper: Event-Bus Notify
  function notify(event, payload) {
    if (listeners.has(event)) {
      listeners.get(event).forEach(cb => {
        try { cb(payload); } catch (e) { console.error(`[TripStore Listener Error (${event})]:`, e); }
      });
    }
    // Also notify wildcard '*' listeners
    if (listeners.has('*')) {
      listeners.get('*').forEach(cb => {
        try { cb({ event, payload }); } catch (e) { console.error('[TripStore Wildcard Error]:', e); }
      });
    }
  }

  // Helper: Save State to LocalStorage
  function persist() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch (e) {
      console.warn('[TripStore] Failed to persist to localStorage:', e);
    }
  }

  // Migrate legacy localStorage overrides if existing
  function migrateLegacyOverrides(loadedState) {
    if (typeof localStorage === 'undefined') return loadedState;

    try {
      // 1. Custom Activities
      const customActRaw = localStorage.getItem('aus_roadtrip_custom_activities_2027');
      if (customActRaw) {
        const customActs = JSON.parse(customActRaw);
        Object.keys(customActs).forEach(dayNum => {
          const acts = customActs[dayNum];
          if (Array.isArray(acts)) {
            acts.forEach(ca => {
              // Check if already in loadedState.activities
              const exists = loadedState.activities.some(a => a.id === ca.id || (a.dayNumber == dayNum && a.title === ca.title));
              if (!exists) {
                loadedState.activities.push({
                  id: ca.id || generateId(`act-custom-d${dayNum}`),
                  dayId: `day-${dayNum}`,
                  dayNumber: parseInt(dayNum, 10),
                  time: ca.time || '12:00',
                  title: ca.title || 'Aktivität',
                  category: 'sightseeing',
                  description: ca.note || '',
                  locationName: '',
                  coords: null,
                  isCompleted: !!ca.done,
                  notes: ca.note || '',
                  orderIndex: loadedState.activities.filter(a => a.dayNumber == dayNum).length
                });
              }
            });
          }
        });
      }

      // 2. User Bookings
      const bookingsRaw = localStorage.getItem('aus_roadtrip_bookings_2027');
      if (bookingsRaw) {
        const parsed = JSON.parse(bookingsRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedState.bookings = parsed;
        }
      }

      // 3. User Expenses
      const expensesRaw = localStorage.getItem('aus_roadtrip_expenses_2027');
      if (expensesRaw) {
        const parsed = JSON.parse(expensesRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedState.expenses = parsed;
        }
      }

      // 4. User Packing
      const packingRaw = localStorage.getItem('aus_roadtrip_packing_2027');
      if (packingRaw) {
        const parsed = JSON.parse(packingRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedState.packing = parsed;
        }
      }
    } catch (e) {
      console.warn('[TripStore] Error during legacy migration:', e);
    }

    return loadedState;
  }

  // --- INITIALIZATION ---
  function init(customMaster) {
    const baseline = customMaster || initialMasterData || (typeof window !== 'undefined' ? window.TRIP_MASTER_DATA : null);
    
    let loaded = null;
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.version === 3 && Array.isArray(parsed.days) && parsed.days.length > 0) {
            loaded = parsed;
          }
        }
      }
    } catch (e) {
      console.warn('[TripStore] Error loading stored state:', e);
    }

    if (!loaded) {
      if (!baseline) {
        console.error('[TripStore] No baseline data available to initialize!');
        return;
      }
      loaded = deepClone(baseline);
      loaded = migrateLegacyOverrides(loaded);
      state = loaded;
      persist();
    } else {
      state = loaded;
    }

    notify('store:ready', { totalDays: state.days.length, totalActivities: state.activities.length });
    return state;
  }

  // --- OBSERVER (SUBSCRIBE) ---
  function subscribe(event, callback) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event).add(callback);
    return () => {
      if (listeners.has(event)) {
        listeners.get(event).delete(callback);
      }
    };
  }

  // --- TRIP METADATA ---
  function getTripMeta() {
    return deepClone(state.tripMeta);
  }

  function updateTripMeta(patch) {
    Object.assign(state.tripMeta, patch);
    persist();
    notify('tripMeta:updated', state.tripMeta);
    return deepClone(state.tripMeta);
  }

  // --- DAYS CRUD ---
  function getDays() {
    return deepClone(state.days).sort((a, b) => a.dayNumber - b.dayNumber);
  }

  function getDay(dayIdOrNumber) {
    let day = null;
    if (typeof dayIdOrNumber === 'number' || !isNaN(Number(dayIdOrNumber))) {
      const num = Number(dayIdOrNumber);
      day = state.days.find(d => d.dayNumber === num);
    } else {
      day = state.days.find(d => d.id === dayIdOrNumber);
    }
    if (!day) return null;

    const result = deepClone(day);
    // Attach activities
    result.activities = deepClone(state.activities)
      .filter(a => a.dayId === day.id || a.dayNumber === day.dayNumber)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    // Attach spots
    result.spots = deepClone(state.spots)
      .filter(s => s.day === day.dayNumber || (day.spotIds && day.spotIds.includes(s.id)));

    // Attach accommodation
    result.accommodationDetails = deepClone(state.accommodations)
      .find(acc => acc.id === day.accommodationId || acc.dayNumber === day.dayNumber) || null;

    return result;
  }

  function createDay(newDayData, insertAtIndex = -1) {
    const days = state.days;
    let targetIndex = insertAtIndex >= 0 && insertAtIndex <= days.length ? insertAtIndex : days.length;
    const newDayNumber = targetIndex + 1;

    // Shift subsequent days' dayNumbers
    for (let i = targetIndex; i < days.length; i++) {
      days[i].dayNumber += 1;
      days[i].id = `day-${days[i].dayNumber}`;
    }

    const dayId = `day-${newDayNumber}`;
    const newDay = Object.assign({
      id: dayId,
      dayNumber: newDayNumber,
      date: "",
      title: "Neuer Reisetag",
      location: "",
      startLocation: "",
      destLocation: "",
      startCoords: [-33.8688, 151.2093],
      destCoords: [-33.8688, 151.2093],
      centerCoords: [-33.8688, 151.2093],
      zoom: 12,
      distance: "",
      driveTime: "",
      transportType: "drive",
      accommodationName: "",
      accommodationId: `acc-${newDayNumber}`,
      programSummary: "",
      plannedExpense: { amount: 0, label: "" },
      stageRoute: [],
      spotIds: []
    }, newDayData);

    newDay.id = dayId;
    newDay.dayNumber = newDayNumber;

    days.splice(targetIndex, 0, newDay);
    state.tripMeta.totalDays = days.length;

    persist();
    notify('days:changed', { action: 'create', day: newDay });
    notify('day:created', newDay);
    return deepClone(newDay);
  }

  function updateDay(dayIdOrNumber, patch) {
    const day = typeof dayIdOrNumber === 'number'
      ? state.days.find(d => d.dayNumber === dayIdOrNumber)
      : state.days.find(d => d.id === dayIdOrNumber || d.dayNumber === Number(dayIdOrNumber));

    if (!day) {
      throw new Error(`[TripStore] Day '${dayIdOrNumber}' not found to update.`);
    }

    Object.assign(day, patch);
    persist();
    notify('day:updated', { dayId: day.id, day: deepClone(day) });
    notify('days:changed', { action: 'update', day: deepClone(day) });
    return deepClone(day);
  }

  function deleteDay(dayIdOrNumber) {
    const index = typeof dayIdOrNumber === 'number'
      ? state.days.findIndex(d => d.dayNumber === dayIdOrNumber)
      : state.days.findIndex(d => d.id === dayIdOrNumber || d.dayNumber === Number(dayIdOrNumber));

    if (index === -1) {
      throw new Error(`[TripStore] Day '${dayIdOrNumber}' not found to delete.`);
    }

    const deletedDay = state.days.splice(index, 1)[0];

    // Renumber remaining days
    for (let i = index; i < state.days.length; i++) {
      const oldDayNum = state.days[i].dayNumber;
      const newDayNum = i + 1;
      state.days[i].dayNumber = newDayNum;
      state.days[i].id = `day-${newDayNum}`;

      // Update associated activities
      state.activities.forEach(a => {
        if (a.dayNumber === oldDayNum) {
          a.dayNumber = newDayNum;
          a.dayId = `day-${newDayNum}`;
        }
      });
    }

    // Remove activities associated with the deleted day
    state.activities = state.activities.filter(a => a.dayNumber !== deletedDay.dayNumber && a.dayId !== deletedDay.id);

    state.tripMeta.totalDays = state.days.length;
    persist();
    notify('days:changed', { action: 'delete', dayId: deletedDay.id });
    notify('day:deleted', deletedDay);
    return true;
  }

  function reorderDays(orderedDayIds) {
    const daysMap = new Map(state.days.map(d => [d.id, d]));
    const reordered = [];
    orderedDayIds.forEach((id, idx) => {
      const day = daysMap.get(id);
      if (day) {
        day.dayNumber = idx + 1;
        reordered.push(day);
      }
    });

    state.days = reordered;
    persist();
    notify('days:changed', { action: 'reorder', days: deepClone(state.days) });
    return deepClone(state.days);
  }

  // --- ACTIVITIES CRUD ---
  function getActivities(dayIdOrNumber) {
    let list = state.activities;
    if (dayIdOrNumber !== undefined && dayIdOrNumber !== null) {
      if (typeof dayIdOrNumber === 'number' || !isNaN(Number(dayIdOrNumber))) {
        const num = Number(dayIdOrNumber);
        list = list.filter(a => a.dayNumber === num || a.dayId === `day-${num}`);
      } else {
        list = list.filter(a => a.dayId === dayIdOrNumber);
      }
    }
    return deepClone(list).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  function getActivity(activityId) {
    const act = state.activities.find(a => a.id === activityId);
    return act ? deepClone(act) : null;
  }

  function createActivity(dayIdOrNumber, activityData) {
    let dayNum = typeof dayIdOrNumber === 'number' ? dayIdOrNumber : parseInt(String(dayIdOrNumber).replace('day-', ''), 10);
    if (isNaN(dayNum) || dayNum < 1) dayNum = 1;
    const dayId = `day-${dayNum}`;

    const existingInDay = state.activities.filter(a => a.dayId === dayId || a.dayNumber === dayNum);
    const newAct = Object.assign({
      id: generateId(`act-d${dayNum}`),
      dayId: dayId,
      dayNumber: dayNum,
      time: "10:00",
      title: "Neue Aktivität",
      category: "sightseeing",
      description: "",
      locationName: "",
      coords: null,
      isCompleted: false,
      notes: "",
      orderIndex: existingInDay.length
    }, activityData);

    newAct.dayId = dayId;
    newAct.dayNumber = dayNum;

    state.activities.push(newAct);
    persist();
    notify('activity:created', newAct);
    notify('activities:changed', { dayId, action: 'create', activity: newAct });
    return deepClone(newAct);
  }

  function updateActivity(activityId, patch) {
    const act = state.activities.find(a => a.id === activityId);
    if (!act) {
      throw new Error(`[TripStore] Activity '${activityId}' not found.`);
    }

    Object.assign(act, patch);
    persist();
    notify('activity:updated', deepClone(act));
    notify('activities:changed', { dayId: act.dayId, action: 'update', activity: deepClone(act) });
    return deepClone(act);
  }

  function deleteActivity(activityId) {
    const index = state.activities.findIndex(a => a.id === activityId);
    if (index === -1) {
      throw new Error(`[TripStore] Activity '${activityId}' not found.`);
    }

    const removed = state.activities.splice(index, 1)[0];
    persist();
    notify('activity:deleted', removed);
    notify('activities:changed', { dayId: removed.dayId, action: 'delete', activityId });
    return true;
  }

  function moveActivity(activityId, targetDayNumber, newTime) {
    const act = state.activities.find(a => a.id === activityId);
    if (!act) {
      throw new Error(`[TripStore] Activity '${activityId}' not found.`);
    }

    const oldDayId = act.dayId;
    act.dayNumber = targetDayNumber;
    act.dayId = `day-${targetDayNumber}`;
    if (newTime) act.time = newTime;

    persist();
    notify('activity:moved', { activity: deepClone(act), fromDay: oldDayId, toDay: act.dayId });
    notify('activities:changed', { dayId: act.dayId, action: 'move', activity: deepClone(act) });
    return deepClone(act);
  }

  function reorderActivities(dayIdOrNumber, orderedActivityIds) {
    const dayActs = getActivities(dayIdOrNumber);
    const idMap = new Map(orderedActivityIds.map((id, idx) => [id, idx]));

    state.activities.forEach(a => {
      if (idMap.has(a.id)) {
        a.orderIndex = idMap.get(a.id);
      }
    });

    persist();
    notify('activities:changed', { dayId: typeof dayIdOrNumber === 'number' ? `day-${dayIdOrNumber}` : dayIdOrNumber, action: 'reorder' });
    return getActivities(dayIdOrNumber);
  }

  // --- ACCOMMODATIONS CRUD ---
  function getAccommodations() {
    return deepClone(state.accommodations);
  }

  function getAccommodation(accIdOrDay) {
    const acc = state.accommodations.find(a => a.id === accIdOrDay || a.dayNumber === accIdOrDay);
    return acc ? deepClone(acc) : null;
  }

  function updateAccommodation(accId, patch) {
    const acc = state.accommodations.find(a => a.id === accId || a.dayNumber === accId);
    if (!acc) {
      throw new Error(`[TripStore] Accommodation '${accId}' not found.`);
    }
    Object.assign(acc, patch);
    persist();
    notify('accommodation:updated', deepClone(acc));
    notify('accommodations:changed', { action: 'update', accommodation: deepClone(acc) });
    return deepClone(acc);
  }

  function createAccommodation(data) {
    const newAcc = Object.assign({
      id: generateId('acc'),
      dayNumber: 1,
      name: "Neue Unterkunft",
      address: "",
      location: "",
      checkIn: "",
      checkOut: "",
      bookingUrl: "",
      bookingLabel: "",
      type: "hotel",
      priceAud: 0,
      priceEur: 0,
      coords: null
    }, data);

    state.accommodations.push(newAcc);
    persist();
    notify('accommodations:changed', { action: 'create', accommodation: newAcc });
    return deepClone(newAcc);
  }

  function deleteAccommodation(accId) {
    const idx = state.accommodations.findIndex(a => a.id === accId);
    if (idx !== -1) {
      const removed = state.accommodations.splice(idx, 1)[0];
      persist();
      notify('accommodations:changed', { action: 'delete', accId });
      return true;
    }
    return false;
  }

  // --- SPOTS CRUD ---
  function getSpots(filterFn) {
    const list = deepClone(state.spots);
    return filterFn ? list.filter(filterFn) : list;
  }

  function getSpot(spotId) {
    const s = state.spots.find(item => item.id === spotId || item.id === Number(spotId));
    return s ? deepClone(s) : null;
  }

  function updateSpot(spotId, patch) {
    const spot = state.spots.find(s => s.id === spotId || s.id === Number(spotId));
    if (!spot) {
      throw new Error(`[TripStore] Spot '${spotId}' not found.`);
    }
    Object.assign(spot, patch);
    persist();
    notify('spot:updated', deepClone(spot));
    notify('spots:changed', { action: 'update', spot: deepClone(spot) });
    return deepClone(spot);
  }

  function createSpot(data) {
    const newSpot = Object.assign({
      id: state.spots.length > 0 ? Math.max(...state.spots.map(s => typeof s.id === 'number' ? s.id : 0)) + 1 : 1,
      name: "Neuer Spot",
      category: "Sightseeing",
      region: "sydney",
      coords: [-33.8688, 151.2093],
      highlight: "",
      photoTip: "",
      day: 1,
      visited: false
    }, data);

    state.spots.push(newSpot);
    persist();
    notify('spots:changed', { action: 'create', spot: newSpot });
    return deepClone(newSpot);
  }

  function deleteSpot(spotId) {
    const idx = state.spots.findIndex(s => s.id === spotId || s.id === Number(spotId));
    if (idx !== -1) {
      const removed = state.spots.splice(idx, 1)[0];
      persist();
      notify('spots:changed', { action: 'delete', spotId });
      return true;
    }
    return false;
  }

  // --- BOOKINGS & EXPENSES CRUD ---
  function getBookings() {
    return deepClone(state.bookings);
  }

  function saveBooking(booking) {
    const idx = state.bookings.findIndex(b => b.id === booking.id);
    if (idx >= 0) {
      state.bookings[idx] = Object.assign({}, state.bookings[idx], booking);
    } else {
      if (!booking.id) booking.id = generateId('bk');
      state.bookings.push(booking);
    }
    persist();
    notify('bookings:changed', deepClone(state.bookings));
    return deepClone(booking);
  }

  function deleteBooking(bookingId) {
    state.bookings = state.bookings.filter(b => b.id !== bookingId);
    persist();
    notify('bookings:changed', deepClone(state.bookings));
    return true;
  }

  function getExpenses() {
    return deepClone(state.expenses);
  }

  function saveExpense(expense) {
    const idx = state.expenses.findIndex(e => e.id === expense.id);
    if (idx >= 0) {
      state.expenses[idx] = Object.assign({}, state.expenses[idx], expense);
    } else {
      if (!expense.id) expense.id = generateId('exp');
      state.expenses.push(expense);
    }
    persist();
    notify('expenses:changed', deepClone(state.expenses));
    return deepClone(expense);
  }

  function deleteExpense(expenseId) {
    state.expenses = state.expenses.filter(e => e.id !== expenseId);
    persist();
    notify('expenses:changed', deepClone(state.expenses));
    return true;
  }

  // --- IMPORT / EXPORT / RESET ---
  function exportMasterJSON() {
    return JSON.stringify(state, null, 2);
  }

  function importMasterJSON(jsonString) {
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (!parsed || !Array.isArray(parsed.days)) {
        throw new Error("Ungültiges JSON-Schema: Keine Reisetage ('days') gefunden.");
      }
      state = parsed;
      state.version = 3;
      persist();
      notify('store:imported', state);
      notify('days:changed', { action: 'import' });
      notify('activities:changed', { action: 'import' });
      notify('spots:changed', { action: 'import' });
      return true;
    } catch (e) {
      console.error("[TripStore] Import failed:", e);
      throw e;
    }
  }

  function resetToDefaults() {
    if (initialMasterData) {
      state = deepClone(initialMasterData);
      persist();
      notify('store:reset', state);
      notify('days:changed', { action: 'reset' });
      return true;
    }
    return false;
  }

  // Public Interface
  return {
    init,
    subscribe,
    notify,
    getTripMeta,
    updateTripMeta,
    getDays,
    getDay,
    createDay,
    updateDay,
    deleteDay,
    reorderDays,
    getActivities,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    moveActivity,
    reorderActivities,
    getAccommodations,
    getAccommodation,
    createAccommodation,
    updateAccommodation,
    deleteAccommodation,
    getSpots,
    getSpot,
    createSpot,
    updateSpot,
    deleteSpot,
    getBookings,
    saveBooking,
    deleteBooking,
    getExpenses,
    saveExpense,
    deleteExpense,
    exportMasterJSON,
    importMasterJSON,
    resetToDefaults
  };
}));
