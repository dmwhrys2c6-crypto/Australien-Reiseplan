import json
import os

with open('data/trip-days.json', 'r', encoding='utf-8') as f:
    days_data = f.read()

template = '''/* =========================================================================
   AUSTRALIEN ROADTRIP 2027 – TRIP STORE & DYNAMIC TIMELINE LOADER
   Modulare Architektur (Schritt 1): Asynchroner Loader für data/trip-days.json,
   reaktiver Store, Fallback/Offline-Unterstützung & Timeline-Renderer.
   ========================================================================= */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TripStore = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'aus_trip_days_v1';
  const listeners = new Map();

  // Embedded Fallback Data for offline / file:// protocol
  const FALLBACK_TRIP_DAYS = ''' + days_data + ''';

  let tripDays = [];
  let isLoaded = false;
  let rawMasterState = null;

  // Helper: Deep Clone
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Helper: Event-Bus Notify
  function notify(event, payload) {
    if (listeners.has(event)) {
      listeners.get(event).forEach(cb => {
        try { cb(payload); } catch (e) { console.error('[TripStore Listener Error (' + event + ')]:', e); }
      });
    }
    if (listeners.has('*')) {
      listeners.get('*').forEach(cb => {
        try { cb({ event, payload }); } catch (e) { console.error('[TripStore Wildcard Error]:', e); }
      });
    }
  }

  // Helper: Escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/\'/g, '&#039;');
  }

  // 1. Data Loader with file:// and offline fallback
  async function loadTripDays() {
    let loadedData = null;

    // A. Attempt async fetch from data/trip-days.json
    try {
      if (typeof fetch === 'function') {
        const response = await fetch('data/trip-days.json', { cache: 'no-cache' });
        if (response.ok) {
          loadedData = await response.json();
          console.info('[TripStore] ✓ Successfully loaded 20 travel days from data/trip-days.json via fetch()');
        } else {
          console.warn('[TripStore] Fetch returned status ' + response.status + ', checking fallbacks...');
        }
      }
    } catch (fetchErr) {
      console.warn('[TripStore] Asynchronous fetch failed (likely file:// CORS restrictions or offline):', fetchErr.message);
    }

    // B. Check window.FALLBACK_TRIP_DAYS if provided
    if (!loadedData && typeof window !== 'undefined' && Array.isArray(window.FALLBACK_TRIP_DAYS)) {
      console.info('[TripStore] Using window.FALLBACK_TRIP_DAYS fallback');
      loadedData = deepClone(window.FALLBACK_TRIP_DAYS);
    }

    // C. Use embedded fallback data
    if (!loadedData) {
      console.info('[TripStore] Using embedded offline fallback data (20 days)');
      loadedData = deepClone(FALLBACK_TRIP_DAYS);
    }

    // D. Migrate any local user modifications (custom activities)
    tripDays = loadedData;
    isLoaded = true;

    // Check localStorage overrides
    if (typeof localStorage !== 'undefined') {
      try {
        const storedActs = localStorage.getItem('aus_roadtrip_custom_activities_2027');
        if (storedActs) {
          const parsed = JSON.parse(storedActs);
          Object.keys(parsed).forEach(dayNum => {
            const day = tripDays.find(d => d.dayNumber === parseInt(dayNum, 10));
            if (day && Array.isArray(parsed[dayNum])) {
              parsed[dayNum].forEach(ca => {
                const exists = day.activities.some(a => a.title === ca.title && a.time === ca.time);
                if (!exists) {
                  day.activities.push({
                    time: ca.time || '12:00',
                    title: ca.title || ca.note || 'Aktivität'
                  });
                }
              });
            }
          });
        }
      } catch (e) {
        console.warn('[TripStore] Could not merge localStorage activities:', e);
      }
    }

    notify('days:loaded', tripDays);
    return tripDays;
  }

  // 2. Timeline Accordion HTML Renderers
  function renderSights(sights) {
    if (!sights || sights.length === 0) return '';
    const cardsHtml = sights.map(s => {
      const spotNum = s.spotId || parseInt(String(s.id).replace('spot-', ''), 10) || 0;
      return `
        <div class="sight-detail-card" id="spot-card-${spotNum}" data-spot-id="${spotNum}">
          <div class="sight-header">
            <h4 class="sight-name">${s.name}</h4>
            <button type="button" class="btn-maps-mini btn-unified-map-link"
              onclick="focusSpotOnMap(${spotNum}, event)"
              style="background: rgba(0, 109, 104, 0.12); color: var(--primary); border: 1px solid rgba(0, 109, 104, 0.25); cursor: pointer;"
              title="Diesen Spot auf der Karte zentrieren"><i class="fa-solid fa-map-pin"></i> Auf Karte</button>
          </div>
          <div class="sight-detail-body">
            <div class="sight-fact">
              <span class="sight-label"><i class="fa-solid fa-star"></i> Was macht es besonders:</span>
              <p>${s.highlight}</p>
            </div>
            <div class="photo-spot-box">
              <i class="fa-solid fa-camera"></i>
              <div><strong>Foto-Spot &amp; Zeit:</strong> ${s.photoSpot} ${s.photoTime ? `<span style="font-weight:700; color:var(--primary); font-size:0.78rem;">(${s.photoTime})</span>` : ''}</div>
            </div>
            <div class="sight-fact">
              <span class="sight-label"><i class="fa-solid fa-route"></i> Wie man am besten hinkommt:</span>
              <p>${s.directions}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="day-plan-section-title"><i class="fa-solid fa-camera"></i> Sightseeing-Highlights &amp; Fotospots</div>
      <div class="sight-detail-grid">
        ${cardsHtml}
      </div>
    `;
  }

  function renderActivities(activities, dayNumber) {
    const actsHtml = (activities || []).map(a => `
      <div class="activity-row">
        <span class="activity-time">${escapeHtml(a.time)}</span>
        <span class="activity-desc">${escapeHtml(a.title)}</span>
      </div>
    `).join('');

    return `
      <div class="day-plan-section-title"><i class="fa-solid fa-clock"></i> Zeitplanung &amp; Aktivitäten</div>
      <div class="activity-timeline" id="act-list-day-${dayNumber}">
        ${actsHtml}
      </div>
    `;
  }

  function renderActivityForm(dayNumber) {
    return `
      <div class="activity-inline-form">
        <input type="time" class="act-time-input" id="act-time-day-${dayNumber}"
          aria-label="Uhrzeit für neue Aktivität">
        <input type="text" class="act-desc-input" id="act-desc-day-${dayNumber}"
          placeholder="Neue Aktivität eintragen (z. B. 15:30 Eis essen)..."
          onkeypress="if(event.key==='Enter') addCustomActivity(${dayNumber})">
        <button type="button" class="btn-act-add" onclick="addCustomActivity(${dayNumber})"
          title="Aktivität für Tag ${dayNumber} hinzufügen">
          <i class="fa-solid fa-plus"></i> Hinzufügen
        </button>
      </div>
    `;
  }

  function renderFlightSubcard(flightInfo) {
    if (!flightInfo) return '';
    return `
      <div class="day-subcard hotel">
        <div class="subcard-title"><i class="fa-solid fa-plane"></i> ${escapeHtml(flightInfo.title || 'Fluginformationen')}</div>
        <p><strong>${escapeHtml(flightInfo.details)}</strong></p>
        <span class="status-pill paid" style="margin-top:0.4rem; display:inline-block;"><i class="fa-solid fa-check"></i> ${escapeHtml(flightInfo.statusText || 'Flug gebucht & bezahlt')}</span>
      </div>
    `;
  }

  function renderHotelSubcard(acc) {
    if (!acc || !acc.hasSubcard) return '';
    return `
      <div class="day-subcard hotel">
        <div class="subcard-title"><i class="fa-solid fa-bed"></i> ${escapeHtml(acc.cardTitle || 'Hotel &amp; Unterkunft')}</div>
        <p>${acc.rawHtml || (`<strong>${escapeHtml(acc.name)}</strong> (${escapeHtml(acc.location)}) – ${acc.nights} Nächte gebucht`)}</p>
        ${acc.bookingLink ? `<a href="${escapeHtml(acc.bookingLink)}" target="_blank" class="btn-action btn-booking"><i class="fa-solid fa-hotel"></i> ${escapeHtml(acc.bookingLabel || 'Hotel Website')}</a>` : ''}
        ${acc.mapsLink ? `<a href="${escapeHtml(acc.mapsLink)}" target="_blank" class="btn-action btn-maps"><i class="fa-solid fa-map-location-dot"></i> ${escapeHtml(acc.mapsLabel || 'Hotel Standort')}</a>` : ''}
      </div>
    `;
  }

  function renderBudgetSubcard(budgetItems, day) {
    if (!day.hasBudgetSubcard || !budgetItems || budgetItems.length === 0) return '';
    const itemsHtml = budgetItems.map(b => `
      <li><span>${escapeHtml(b.title)}:</span> <strong>${escapeHtml(b.costFormatted || (b.costEur + ' €'))}</strong> <span class="status-pill ${escapeHtml(b.status)}">${escapeHtml(b.statusText || (b.status === 'paid' ? 'Bezahlt' : 'Geplant'))}</span></li>
    `).join('');

    return `
      <div class="day-subcard budget">
        <div class="subcard-title"><i class="fa-solid fa-wallet"></i> ${escapeHtml(day.budgetCardTitle || 'Budget &amp; Kosten')}</div>
        <ul class="sub-item-list">
          ${itemsHtml}
        </ul>
      </div>
    `;
  }

  function renderSuggestionsSubcard(suggestions, date, dayNumber) {
    const title = suggestions && suggestions.title ? suggestions.title : `Ideen & Vorschläge für Tag ${dayNumber}`;
    return `
      <div class="day-subcard suggestions" data-day="${escapeHtml(date)}">
        <div class="subcard-title"><i class="fa-solid fa-lightbulb" style="color:var(--accent-gold);"></i> ${escapeHtml(title)} <span class="sync-badge" style="margin-left:auto;"><span class="sync-dot"></span> Verschlüsselt</span></div>
        <div class="sug-input-row">
          <input type="text" class="sug-text-input" placeholder="Vorschlag machen..."
            onkeypress="if(event.key==='Enter') addSuggestion('${escapeHtml(date)}', this)">
          <select class="sug-author-select">
            <option>Tobi</option>
            <option>Lara</option>
            <option>Ker</option>
            <option>Flo</option>
          </select>
          <button class="sug-btn-add" onclick="triggerAddSuggestion('${escapeHtml(date)}', this)"><i class="fa-solid fa-plus"></i></button>
        </div>
        <ul class="sug-list" id="sug-list-${escapeHtml(date)}"></ul>
      </div>
    `;
  }

  function renderDayItem(day) {
    const chipsHtml = (day.highlights || []).map(h => `<span class="compact-highlight-chip">${escapeHtml(h)}</span>`).join('\\n                      ');
    const driveIconClass = day.driveIcon && day.driveIcon.startsWith('fa-') ? day.driveIcon : ('fa-' + (day.driveIcon || 'car'));

    return `
      <details class="timeline-item" id="day-${day.dayNumber}">
        <summary class="timeline-summary">
          <div class="summary-header-row">
            <div class="timeline-header-badges">
              <span class="timeline-day-badge">${escapeHtml(day.dayBadge || ('TAG ' + day.dayNumber))}</span>
              <span class="date-badge">${escapeHtml(day.dateBadge || day.date)}</span>
              <span class="drive-badge"><i class="fa-solid ${driveIconClass}"></i> ${escapeHtml(day.routeBadge)}</span>
            </div>
            <button type="button" class="btn-day-map-link btn-unified-map-link"
              onclick="focusDayOnMap(${day.dayNumber}, event)" title="Tag ${day.dayNumber} auf der Karte zentrieren &amp; Route anzeigen"><i
                class="fa-solid fa-map-location-dot"></i> Auf Karte</button>
            <span class="expand-trigger"><i class="fa-solid fa-chevron-down"></i> ${escapeHtml(day.expandTrigger || 'Details')}</span>
          </div>
          <h3 class="timeline-title">${escapeHtml(day.title)}</h3>
          <div class="timeline-compact-highlights">
            ${chipsHtml}
          </div>
        </summary>
        <div class="timeline-body">
          <div class="day-subcard">
            <div class="subcard-title"><i class="fa-solid fa-circle-info"></i> Tagesprogramm</div>
            <p>${escapeHtml(day.summary)}</p>
          </div>

          <details class="day-plan-accordion">
            <summary class="day-plan-summary">
              <span><i class="fa-solid fa-list-check"></i> Detaillierter Tagesplan &amp; Spots</span>
              <span class="plan-toggle-badge">Details ansehen <i class="fa-solid fa-chevron-down"></i></span>
            </summary>
            <div class="day-plan-content">
              ${renderSights(day.sights)}
              ${renderActivities(day.activities, day.dayNumber)}
              ${renderActivityForm(day.dayNumber)}
            </div>
          </details>

          ${renderFlightSubcard(day.flightInfo)}
          ${renderHotelSubcard(day.accommodation)}
          ${renderBudgetSubcard(day.budgetItems, day)}
          ${renderSuggestionsSubcard(day.suggestions, day.date, day.dayNumber)}
        </div>
      </details>
    `;
  }

  // 3. Render Timeline into Container
  function renderTimeline(targetContainer) {
    let container = null;
    if (typeof targetContainer === 'string') {
      container = document.querySelector(targetContainer);
    } else if (targetContainer && (targetContainer.nodeType || typeof targetContainer === 'object')) {
      container = targetContainer;
    } else if (typeof document !== 'undefined') {
      container = document.querySelector('#route .timeline') || document.querySelector('.timeline') || document.getElementById('timeline-container');
    }

    if (!container) {
      console.warn('[TripStore] Target container for timeline not found in DOM');
      return;
    }

    if (!tripDays || tripDays.length === 0) {
      container.innerHTML = `
        <div class="timeline-error-notice" style="padding:2rem; text-align:center; background:var(--card-bg); border-radius:12px; border:1px solid var(--border-color);">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem; color:var(--accent-gold); margin-bottom:0.75rem;"></i>
          <h4 style="margin-bottom:0.5rem;">Reisetage konnten nicht geladen werden</h4>
          <p style="font-size:0.88rem; color:var(--text-muted); max-width:480px; margin:0 auto 1rem auto;">
            Beim Öffnen als lokale Datei (<code>file://</code>) blockiert der Browser unter Umständen lokale JSON-Abfragen per <code>fetch()</code>.
          </p>
          <div style="display:inline-block; text-align:left; background:var(--card-sub-bg); padding:0.75rem 1.25rem; border-radius:8px; font-family:monospace; font-size:0.82rem;">
            npm start &nbsp;&nbsp;<em>oder</em>&nbsp;&nbsp; npx serve &nbsp;&nbsp;<em>oder</em>&nbsp;&nbsp; python3 -m http.server
          </div>
        </div>
      `;
      return;
    }

    const htmlContent = tripDays.map(renderDayItem).join('\\n');
    container.innerHTML = htmlContent;
    console.info('[TripStore] ✓ Successfully rendered ' + tripDays.length + ' travel day accordions into timeline');

    // Synchronize Timeline with Map
    if (typeof setupTimelineMapSync === 'function') {
      setupTimelineMapSync();
    } else if (typeof window !== 'undefined' && typeof window.setupTimelineMapSync === 'function') {
      window.setupTimelineMapSync();
    } else if (typeof document !== 'undefined') {
      document.querySelectorAll('details.timeline-item').forEach(detailsEl => {
        detailsEl.addEventListener('toggle', () => {
          if (detailsEl.open) {
            const dayNum = parseInt(detailsEl.id.replace('day-', ''), 10);
            if (dayNum && typeof focusDayOnMap === 'function') {
              focusDayOnMap(dayNum, null, false);
            }
          }
        });
      });
    }

    // Scroll reveal classes
    if (typeof document !== 'undefined') {
      document.querySelectorAll('.timeline details.timeline-item').forEach((day, idx) => {
        day.classList.add('scroll-tab');
        day.setAttribute('data-day-idx', idx);
      });
    }

    // Floating UI hooks if active
    if (typeof renderFloatingDaysBar === 'function') renderFloatingDaysBar(1);
    if (typeof renderDayPlanOverlay === 'function') renderDayPlanOverlay(1);

    // Hash jump check
    if (typeof window !== 'undefined' && window.location && window.location.hash) {
      const match = window.location.hash.match(/#(?:day|tag)-(\\d+)/i);
      if (match && typeof jumpToDay === 'function') {
        setTimeout(() => jumpToDay(parseInt(match[1], 10)), 150);
      }
    }

    notify('timeline:rendered', tripDays);
  }

  // 4. Store State & CRUD API (Compatible with test suites & interactive UI)
  const TripStore = {
    // State Access
    isLoaded: () => isLoaded,
    getDays: () => deepClone(tripDays),
    getDay: (dayNum) => {
      const day = tripDays.find(d => d.dayNumber === parseInt(dayNum, 10));
      if (!day) return null;
      const res = deepClone(day);
      res.day = res.dayNumber;
      res.spots = res.sights || [];
      res.accommodationDetails = res.accommodation || null;
      return res;
    },
    getActivities: (dayNum) => {
      if (dayNum !== undefined && dayNum !== null) {
        const day = tripDays.find(d => d.dayNumber === parseInt(dayNum, 10));
        return day ? deepClone(day.activities) : [];
      }
      const all = [];
      tripDays.forEach(d => {
        (d.activities || []).forEach(a => all.push(deepClone(a)));
      });
      return all;
    },
    getActivity: (actId) => {
      for (const d of tripDays) {
        const found = (d.activities || []).find(a => a.id === actId);
        if (found) return deepClone(found);
      }
      return null;
    },
    getSpots: (dayNum) => {
      const day = tripDays.find(d => d.dayNumber === parseInt(dayNum, 10));
      return day ? deepClone(day.sights || []) : [];
    },
    getSpot: (spotId) => {
      for (const d of tripDays) {
        const found = (d.sights || []).find(s => s.id === spotId || s.spotId === parseInt(spotId, 10) || s.id === ('spot-' + spotId));
        if (found) return deepClone(found);
      }
      return null;
    },
    getAccommodation: (dayNum) => {
      const day = tripDays.find(d => d.dayNumber === parseInt(dayNum, 10));
      return day ? deepClone(day.accommodation) : null;
    },
    getBudgetItems: (dayNum) => {
      const day = tripDays.find(d => d.dayNumber === parseInt(dayNum, 10));
      return day ? deepClone(day.budgetItems || []) : [];
    },

    // Subscriptions
    subscribe: (event, callback) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(callback);
      return () => {
        if (listeners.has(event)) listeners.get(event).delete(callback);
      };
    },

    // CRUD: Activity
    createActivity: (dayNum, actData) => {
      const day = tripDays.find(d => d.dayNumber === parseInt(dayNum, 10));
      if (!day) return null;
      const newAct = {
        id: 'act-d' + dayNum + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
        time: actData.time || '10:00',
        title: actData.title || 'Neue Aktivität',
        category: actData.category || 'sightseeing',
        description: actData.notes || actData.description || ''
      };
      day.activities = day.activities || [];
      day.activities.push(newAct);
      notify('activity:created', newAct);
      notify('activity:changed', { action: 'create', activity: newAct });
      return deepClone(newAct);
    },

    updateActivity: (actId, updates) => {
      for (const d of tripDays) {
        const act = (d.activities || []).find(a => a.id === actId);
        if (act) {
          Object.assign(act, updates);
          notify('activity:updated', act);
          notify('activity:changed', { action: 'update', activity: act });
          return deepClone(act);
        }
      }
      return null;
    },

    deleteActivity: (actId) => {
      for (const d of tripDays) {
        const idx = (d.activities || []).findIndex(a => a.id === actId);
        if (idx !== -1) {
          const removed = d.activities.splice(idx, 1)[0];
          notify('activity:deleted', removed);
          notify('activity:changed', { action: 'delete', activity: removed });
          return true;
        }
      }
      return false;
    },

    // CRUD: Day
    createDay: (dayData) => {
      const nextNum = tripDays.length + 1;
      const newDay = {
        dayNumber: nextNum,
        day: nextNum,
        date: dayData.date || '2027-04-10',
        dayOfWeek: dayData.dayOfWeek || 'Sa',
        title: dayData.title || ('Reisetag ' + nextNum),
        routeBadge: dayData.routeBadge || 'Erkundung vor Ort',
        transportType: dayData.transportType || 'car',
        highlights: dayData.highlights || [],
        summary: dayData.summary || '',
        activities: dayData.activities || [],
        sights: dayData.sights || [],
        accommodation: dayData.accommodation || null,
        budgetItems: dayData.budgetItems || [],
        dayBadge: 'TAG ' + nextNum + ' · ' + (dayData.location || 'AUSTRALIEN').toUpperCase(),
        dateBadge: dayData.date || '',
        driveIcon: 'fa-car',
        expandTrigger: 'Details',
        hasBudgetSubcard: false,
        suggestions: { date: dayData.date || '', title: 'Ideen für Tag ' + nextNum }
      };
      tripDays.push(newDay);
      notify('day:created', newDay);
      return deepClone(newDay);
    },

    updateDay: (dayNum, updates) => {
      const day = tripDays.find(d => d.dayNumber === parseInt(dayNum, 10));
      if (!day) return null;
      Object.assign(day, updates);
      notify('day:updated', day);
      return deepClone(day);
    },

    deleteDay: (dayNum) => {
      const idx = tripDays.findIndex(d => d.dayNumber === parseInt(dayNum, 10));
      if (idx !== -1) {
        const removed = tripDays.splice(idx, 1)[0];
        notify('day:deleted', removed);
        return true;
      }
      return false;
    },

    // CRUD: Spot
    createSpot: (spotData) => {
      const dayNum = parseInt(spotData.day || 1, 10);
      const day = tripDays.find(d => d.dayNumber === dayNum);
      const newId = spotData.id || ('spot-' + Date.now().toString(36));
      const spotObj = {
        id: newId,
        spotId: parseInt(spotData.spotId || (Date.now() % 1000), 10),
        name: spotData.name || 'Neuer Spot',
        highlight: spotData.highlight || '',
        photoSpot: spotData.photoSpot || '',
        photoTime: spotData.photoTime || '',
        directions: spotData.directions || '',
        mapsUrl: spotData.mapsUrl || '',
        coords: spotData.coords || null,
        category: spotData.category || 'Fotospot'
      };
      if (day) {
        day.sights = day.sights || [];
        day.sights.push(spotObj);
      }
      notify('spot:created', spotObj);
      return deepClone(spotObj);
    },

    updateSpot: (spotId, updates) => {
      for (const d of tripDays) {
        const spot = (d.sights || []).find(s => s.id === spotId || s.spotId === parseInt(spotId, 10));
        if (spot) {
          Object.assign(spot, updates);
          notify('spot:updated', spot);
          return deepClone(spot);
        }
      }
      return null;
    },

    deleteSpot: (spotId) => {
      for (const d of tripDays) {
        const idx = (d.sights || []).findIndex(s => s.id === spotId || s.spotId === parseInt(spotId, 10));
        if (idx !== -1) {
          const removed = d.sights.splice(idx, 1)[0];
          notify('spot:deleted', removed);
          return true;
        }
      }
      return false;
    },

    // Export / Import
    exportMasterJSON: () => {
      return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), days: tripDays }, null, 2);
    },

    importMasterJSON: (jsonStr) => {
      try {
        const data = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
        if (Array.isArray(data)) {
          tripDays = data;
        } else if (data && Array.isArray(data.days)) {
          tripDays = data.days;
        }
        notify('days:loaded', tripDays);
        return true;
      } catch (e) {
        console.error('[TripStore] Import failed:', e);
        return false;
      }
    },

    // Render & Initialization
    load: loadTripDays,
    renderTimeline: renderTimeline,
    renderDayItem: renderDayItem,

    init: function (initialData) {
      if (initialData) {
        if (Array.isArray(initialData)) {
          tripDays = deepClone(initialData);
        } else if (initialData.days && Array.isArray(initialData.days)) {
          rawMasterState = deepClone(initialData);
          tripDays = deepClone(FALLBACK_TRIP_DAYS);
        }
        isLoaded = true;
        return this;
      }

      // 1. Initial immediate render from fallback to avoid FOUC / delay
      if (!isLoaded || tripDays.length === 0) {
        tripDays = deepClone(FALLBACK_TRIP_DAYS);
        isLoaded = true;
      }
      renderTimeline();

      // 2. Async revalidate via fetch('data/trip-days.json')
      if (typeof window !== 'undefined') {
        loadTripDays().then((freshDays) => {
          if (JSON.stringify(freshDays) !== JSON.stringify(FALLBACK_TRIP_DAYS)) {
            renderTimeline();
          }
          if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
            window.dispatchEvent(new CustomEvent('trip-store:ready', { detail: { days: tripDays } }));
          }
        }).catch(err => {
          console.warn('[TripStore] Offline / file:// active, using loaded days:', err.message);
        });
      }
      return this;
    }
  };

  // Auto-init in browser when DOM is ready or immediately
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        TripStore.init();
      });
    } else {
      TripStore.init();
    }
  }

  return TripStore;
}));
'''

with open('js/trip-store.js', 'w', encoding='utf-8') as f:
    f.write(template)

with open('js/tripStore.js', 'w', encoding='utf-8') as f:
    f.write(template)

print('Successfully written js/trip-store.js and js/tripStore.js!')
