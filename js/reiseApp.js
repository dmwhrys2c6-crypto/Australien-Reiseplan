/* =========================================================================
   AUSTRALIEN ROADTRIP 2027 – REISE APP & INTERAKTIVE KARTE (Zielarchitektur)
   Fullscreen-Karten-Interface, Floating Day Plan Overlay,
   Floating Controls, In-Place CRUD Modals & TripStore-Anbindung.
   ========================================================================= */

(function (root) {
  'use strict';

  let currentActiveDayNumber = 1;
  let isOverlayMinimized = false;

  // Helper: Escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Category Icons & Badges
  const CATEGORY_META = {
    sightseeing: { icon: 'fa-camera', label: 'Sightseeing', color: '#0ea5e9' },
    tour: { icon: 'fa-sailboat', label: 'Tour & Boot', color: '#059669' },
    beach: { icon: 'fa-umbrella-beach', label: 'Strand & Meer', color: '#0284c7' },
    hike: { icon: 'fa-person-hiking', label: 'Wanderung', color: '#16a34a' },
    food: { icon: 'fa-utensils', label: 'Essen & Drinks', color: '#ea580c' },
    drive: { icon: 'fa-car', label: 'Fahrt & Transfer', color: '#d97706' },
    flight: { icon: 'fa-plane', label: 'Flug', color: '#6366f1' },
    hotel: { icon: 'fa-hotel', label: 'Unterkunft', color: '#8b5cf6' },
    other: { icon: 'fa-location-dot', label: 'Aktivität', color: '#64748b' }
  };

  // 1. Render Floating Days Bar (Tag 1 .. Tag 20 + Tag hinzufügen)
  function renderFloatingDaysBar(activeDayNum = currentActiveDayNumber) {
    const bar = document.getElementById('floating-days-bar');
    if (!bar) return;

    if (typeof TripStore === 'undefined') return;
    const days = TripStore.getDays();

    let html = '';
    days.forEach(d => {
      const isActive = d.dayNumber === activeDayNum;
      html += `
        <button type="button" 
          class="floating-day-pill ${isActive ? 'active' : ''}" 
          id="float-pill-day-${d.dayNumber}"
          onclick="selectDayOnApp(${d.dayNumber}, event)"
          title="Tag ${d.dayNumber}: ${escapeHtml(d.title)}">
          <span>Tag ${d.dayNumber}</span>
        </button>
      `;
    });

    // Add "+ Tag" Button
    html += `
      <button type="button" 
        class="floating-day-pill btn-add-day" 
        onclick="openAddDayModal()" 
        title="Neuen Reisetag anlegen">
        <i class="fa-solid fa-plus"></i> Tag
      </button>
    `;

    bar.innerHTML = html;

    // Scroll active pill into view smoothly
    const activePill = document.getElementById(`float-pill-day-${activeDayNum}`);
    if (activePill && typeof activePill.scrollIntoView === 'function') {
      activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  // 2. Render Desktop Floating Day Plan Overlay
  function renderDayPlanOverlay(dayNum = currentActiveDayNumber) {
    const overlay = document.getElementById('floating-day-plan-overlay');
    if (!overlay) return;

    if (typeof TripStore === 'undefined') return;
    const day = TripStore.getDay(dayNum);
    if (!day) return;

    currentActiveDayNumber = dayNum;

    // Update Header
    const badgeEl = document.getElementById('overlay-day-badge');
    if (badgeEl) badgeEl.textContent = `TAG ${day.dayNumber} · ${(day.location || day.destLocation || '').toUpperCase()}`;

    const titleEl = document.getElementById('overlay-day-title');
    if (titleEl) titleEl.textContent = day.title;

    // Build Body
    const bodyEl = document.getElementById('overlay-content-body');
    if (!bodyEl) return;

    let bodyHtml = '';

    // A. Route & Drive Details Box
    const distText = day.distance ? `${day.distance}` : '';
    const timeText = day.driveTime ? `${day.driveTime}` : '';
    if (distText || timeText || day.programSummary) {
      bodyHtml += `
        <div class="overlay-section-box">
          <div class="overlay-section-title">
            <span><i class="fa-solid fa-route"></i> Etappe &amp; Fahrzeit</span>
            <span style="font-weight:600; text-transform:none; font-size:0.75rem">${escapeHtml(day.date)}</span>
          </div>
          ${(distText || timeText) ? `
            <div style="font-size:0.8rem; font-weight:700; display:flex; align-items:center; gap:8px">
              <span><i class="fa-solid fa-car-side" style=""></i> ${escapeHtml(day.startLocation || 'Start')} ➔ ${escapeHtml(day.destLocation || day.location || 'Ziel')}</span>
            </div>
            <div style="font-size:0.75rem; display:flex; gap:12px">
              ${distText ? `<span><i class="fa-solid fa-road"></i> ${escapeHtml(distText)}</span>` : ''}
              ${timeText ? `<span><i class="fa-solid fa-clock"></i> ${escapeHtml(timeText)}</span>` : ''}
            </div>
          ` : ''}
          ${day.programSummary ? `
            <p style="font-size:0.78rem; line-height:1.4; margin-top:4px">
              ${escapeHtml(day.programSummary)}
            </p>
          ` : ''}
        </div>
      `;
    }

    // B. Activities Timeline
    bodyHtml += `
      <div class="overlay-section-box">
        <div class="overlay-section-title">
          <span><i class="fa-solid fa-list-check"></i> Aktivitäten (${day.activities.length})</span>
          <button type="button" class="act-icon-btn" onclick="openAddActivityModal(${day.dayNumber})" title="Aktivität hinzufügen">
            <i class="fa-solid fa-plus"></i> Hinzufügen
          </button>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px">
    `;

    if (day.activities.length === 0) {
      bodyHtml += `
        <div style="font-size:0.8rem; text-align:center; padding:12px 0">
          Noch keine Aktivitäten für diesen Tag geplant.
        </div>
      `;
    } else {
      day.activities.forEach(act => {
        const catMeta = CATEGORY_META[act.category] || CATEGORY_META.other;
        bodyHtml += `
          <div class="overlay-activity-item" id="act-item-${act.id}">
            <span class="act-time-pill">${escapeHtml(act.time || '–:–')}</span>
            <div class="act-main-info">
              <div class="act-title-text">
                <i class="fa-solid ${catMeta.icon}" style="margin-right:4px; font-size:0.8rem"></i>
                ${escapeHtml(act.title)}
              </div>
              ${act.description ? `<div class="act-note-text">${escapeHtml(act.description)}</div>` : ''}
            </div>
            <div class="act-actions-row">
              <button type="button" class="act-icon-btn" onclick="openEditActivityModal('${act.id}', ${day.dayNumber})" title="Aktivität bearbeiten">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button type="button" class="act-icon-btn btn-del" onclick="confirmDeleteActivity('${act.id}')" title="Aktivität löschen">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        `;
      });
    }

    bodyHtml += `
        </div>
        <button type="button" class="btn-add-activity-row" onclick="openAddActivityModal(${day.dayNumber})">
          <i class="fa-solid fa-plus"></i> Aktivität hinzufügen
        </button>
      </div>
    `;

    // C. Highlights & Spots Chips
    if (day.spots && day.spots.length > 0) {
      bodyHtml += `
        <div class="overlay-section-box">
          <div class="overlay-section-title">
            <span><i class="fa-solid fa-camera"></i> Highlights &amp; Fotospots (${day.spots.length})</span>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:6px">
      `;

      day.spots.forEach(sp => {
        bodyHtml += `
          <button type="button" 
            class="compact-highlight-chip" 
            style="cursor:pointer; display:inline-flex; align-items:center; gap:5px"
            onclick="focusSpotOnMap(${sp.id}, event)"
            title="Diesen Spot auf der Karte zentrieren">
            <i class="fa-solid fa-location-dot" style="font-size:0.75rem"></i>
            <span>${escapeHtml(sp.name)}</span>
          </button>
        `;
      });

      bodyHtml += `
          </div>
        </div>
      `;
    }

    // D. Accommodation Box
    if (day.accommodationDetails && day.accommodationDetails.name) {
      const acc = day.accommodationDetails;
      bodyHtml += `
        <div class="overlay-section-box">
          <div class="overlay-section-title">
            <span><i class="fa-solid fa-hotel"></i> Unterkunft</span>
            ${acc.checkIn ? `<span style="font-size:0.72rem">${escapeHtml(acc.checkIn)}</span>` : ''}
          </div>
          <div style="font-size:0.84rem; font-weight:700">
            ${escapeHtml(acc.name)}
          </div>
          ${acc.address ? `<div style="font-size:0.75rem">${escapeHtml(acc.address)}</div>` : ''}
          ${acc.bookingUrl ? `
            <a href="${escapeHtml(acc.bookingUrl)}" target="_blank" rel="noopener" 
               style="font-size:0.76rem; font-weight:700; display:inline-flex; align-items:center; gap:4px; margin-top:3px; text-decoration:none">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> ${escapeHtml(acc.bookingLabel || 'Buchungsdetails')}
            </a>
          ` : ''}
        </div>
      `;
    }

    bodyEl.innerHTML = bodyHtml;

    // Prevent map interactions when interacting with the overlay
    if (typeof L !== 'undefined' && L.DomEvent) {
      L.DomEvent.disableClickPropagation(overlay);
      L.DomEvent.disableScrollPropagation(bodyEl);
    }
  }

  // 3. Selection & Synchronization
  function selectDayOnApp(dayNum, event) {
    if (event) event.stopPropagation();
    currentActiveDayNumber = dayNum;

    renderFloatingDaysBar(dayNum);
    renderDayPlanOverlay(dayNum);

    // Call map focus
    if (typeof root.focusDayOnMap === 'function') {
      root.focusDayOnMap(dayNum, event, false);
    }
  }

  // 4. Minimize / Close Overlay
  function toggleMinimizeOverlay() {
    const overlay = document.getElementById('floating-day-plan-overlay');
    if (!overlay) return;
    isOverlayMinimized = !isOverlayMinimized;
    overlay.classList.toggle('is-minimized', isOverlayMinimized);
    const minBtn = document.getElementById('btn-minimize-overlay');
    if (minBtn) {
      minBtn.innerHTML = isOverlayMinimized ? '<i class="fa-solid fa-chevron-down"></i>' : '<i class="fa-solid fa-minus"></i>';
    }
  }

  function closeDayOverlay() {
    const overlay = document.getElementById('floating-day-plan-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  function openDayOverlay() {
    const overlay = document.getElementById('floating-day-plan-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      renderDayPlanOverlay(currentActiveDayNumber);
    }
  }

  // 5. FAB Controls
  function mapZoomIn() {
    if (root.routeInteractiveMap) root.routeInteractiveMap.zoomIn();
  }

  function mapZoomOut() {
    if (root.routeInteractiveMap) root.routeInteractiveMap.zoomOut();
  }

  function toggleFloatingLayersPopover() {
    const pop = document.getElementById('floating-layers-popover');
    if (!pop) return;
    pop.style.display = (pop.style.display === 'none' || !pop.style.display) ? 'flex' : 'none';
    if (typeof L !== 'undefined' && L.DomEvent) {
      L.DomEvent.disableClickPropagation(pop);
    }
  }

  // 6. Activity CRUD Modals
  function openAddActivityModal(dayNum = currentActiveDayNumber) {
    const backdrop = document.getElementById('activity-modal-backdrop');
    if (!backdrop) return;

    document.getElementById('act-modal-title').innerHTML = `<i class="fa-solid fa-plus"></i> Aktivität zu Tag ${dayNum} hinzufügen`;
    document.getElementById('act-field-id').value = '';
    document.getElementById('act-field-day').value = dayNum;
    document.getElementById('act-field-time').value = '10:00';
    document.getElementById('act-field-category').value = 'sightseeing';
    document.getElementById('act-field-title').value = '';
    document.getElementById('act-field-desc').value = '';
    document.getElementById('act-btn-delete').style.display = 'none';

    backdrop.classList.add('is-open');
    setTimeout(() => {
      const titleInput = document.getElementById('act-field-title');
      if (titleInput) titleInput.focus();
    }, 100);
  }

  function openEditActivityModal(activityId, dayNum = currentActiveDayNumber) {
    const backdrop = document.getElementById('activity-modal-backdrop');
    if (!backdrop || typeof TripStore === 'undefined') return;

    const act = TripStore.getActivity(activityId);
    if (!act) return;

    document.getElementById('act-modal-title').innerHTML = `<i class="fa-solid fa-clock"></i> Aktivität bearbeiten`;
    document.getElementById('act-field-id').value = act.id;
    document.getElementById('act-field-day').value = act.dayNumber || dayNum;
    document.getElementById('act-field-time').value = act.time || '10:00';
    document.getElementById('act-field-category').value = act.category || 'sightseeing';
    document.getElementById('act-field-title').value = act.title || '';
    document.getElementById('act-field-desc').value = act.description || act.notes || '';
    document.getElementById('act-btn-delete').style.display = 'block';

    backdrop.classList.add('is-open');
  }

  function closeActivityModal() {
    const backdrop = document.getElementById('activity-modal-backdrop');
    if (backdrop) backdrop.classList.remove('is-open');
  }

  function handleActivityModalSubmit(event) {
    if (event) event.preventDefault();
    if (typeof TripStore === 'undefined') return;

    const id = document.getElementById('act-field-id').value;
    const dayNum = parseInt(document.getElementById('act-field-day').value, 10) || currentActiveDayNumber;
    const time = document.getElementById('act-field-time').value.trim();
    const category = document.getElementById('act-field-category').value;
    const title = document.getElementById('act-field-title').value.trim();
    const description = document.getElementById('act-field-desc').value.trim();

    if (!title) return;

    if (id) {
      TripStore.updateActivity(id, { time, category, title, description, notes: description });
    } else {
      TripStore.createActivity(dayNum, { time, category, title, description, notes: description });
    }

    closeActivityModal();
  }

  function handleActivityModalDelete() {
    const id = document.getElementById('act-field-id').value;
    if (!id || typeof TripStore === 'undefined') return;

    if (confirm('Möchtest du diese Aktivität wirklich löschen?')) {
      TripStore.deleteActivity(id);
      closeActivityModal();
    }
  }

  function confirmDeleteActivity(activityId) {
    if (typeof TripStore === 'undefined') return;
    if (confirm('Möchtest du diese Aktivität wirklich löschen?')) {
      TripStore.deleteActivity(activityId);
    }
  }

  // 7. Day CRUD Modals
  function openAddDayModal() {
    const backdrop = document.getElementById('day-modal-backdrop');
    if (!backdrop || typeof TripStore === 'undefined') return;

    const nextDayNum = TripStore.getDays().length + 1;
    document.getElementById('day-modal-header-title').innerHTML = `<i class="fa-solid fa-calendar-plus"></i> Tag ${nextDayNum} anlegen`;
    document.getElementById('day-field-number').value = 'new';
    document.getElementById('day-field-date').value = '';
    document.getElementById('day-field-transport').value = 'drive';
    document.getElementById('day-field-title').value = '';
    document.getElementById('day-field-start').value = '';
    document.getElementById('day-field-dest').value = '';
    document.getElementById('day-field-distance').value = '';
    document.getElementById('day-field-drivetime').value = '';
    document.getElementById('day-field-summary').value = '';
    document.getElementById('day-btn-delete').style.display = 'none';

    backdrop.classList.add('is-open');
  }

  function openEditDayModal(dayNum = currentActiveDayNumber) {
    const backdrop = document.getElementById('day-modal-backdrop');
    if (!backdrop || typeof TripStore === 'undefined') return;

    const day = TripStore.getDay(dayNum);
    if (!day) return;

    document.getElementById('day-modal-header-title').innerHTML = `<i class="fa-solid fa-calendar-day"></i> Tag ${day.dayNumber} bearbeiten`;
    document.getElementById('day-field-number').value = day.dayNumber;
    document.getElementById('day-field-date').value = day.date || '';
    document.getElementById('day-field-transport').value = day.transportType || 'drive';
    document.getElementById('day-field-title').value = day.title || '';
    document.getElementById('day-field-start').value = day.startLocation || '';
    document.getElementById('day-field-dest').value = day.destLocation || day.location || '';
    document.getElementById('day-field-distance').value = day.distance || '';
    document.getElementById('day-field-drivetime').value = day.driveTime || '';
    document.getElementById('day-field-summary').value = day.programSummary || '';
    document.getElementById('day-btn-delete').style.display = 'block';

    backdrop.classList.add('is-open');
  }

  function closeDayModal() {
    const backdrop = document.getElementById('day-modal-backdrop');
    if (backdrop) backdrop.classList.remove('is-open');
  }

  function handleDayModalSubmit(event) {
    if (event) event.preventDefault();
    if (typeof TripStore === 'undefined') return;

    const dayNumVal = document.getElementById('day-field-number').value;
    const isNew = dayNumVal === 'new';
    const dayNum = parseInt(dayNumVal, 10);

    const date = document.getElementById('day-field-date').value.trim();
    const transportType = document.getElementById('day-field-transport').value;
    const title = document.getElementById('day-field-title').value.trim();
    const startLocation = document.getElementById('day-field-start').value.trim();
    const destLocation = document.getElementById('day-field-dest').value.trim();
    const distance = document.getElementById('day-field-distance').value.trim();
    const driveTime = document.getElementById('day-field-drivetime').value.trim();
    const programSummary = document.getElementById('day-field-summary').value.trim();

    if (!title) return;

    const patch = {
      date,
      transportType,
      title,
      startLocation,
      destLocation,
      location: destLocation || startLocation,
      distance,
      driveTime,
      programSummary
    };

    if (isNew) {
      const created = TripStore.createDay(patch);
      currentActiveDayNumber = created.dayNumber;
    } else {
      TripStore.updateDay(dayNum, patch);
    }

    closeDayModal();
  }

  function handleDayModalDelete() {
    const dayNumVal = document.getElementById('day-field-number').value;
    if (dayNumVal === 'new' || typeof TripStore === 'undefined') return;

    const dayNum = parseInt(dayNumVal, 10);
    if (confirm(`Möchtest du Tag ${dayNum} und alle zugehörigen Aktivitäten wirklich löschen?`)) {
      TripStore.deleteDay(dayNum);
      currentActiveDayNumber = Math.max(1, dayNum - 1);
      closeDayModal();
    }
  }

  // 8. Make Day Plan Overlay Draggable on Desktop
  function initDraggableOverlay() {
    const overlay = document.getElementById('floating-day-plan-overlay');
    const header = document.getElementById('overlay-drag-header');
    if (!overlay || !header) return;

    let isDragging = false;
    let startX, startY, initLeft, initTop;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = overlay.getBoundingClientRect();
      const parentRect = overlay.parentElement.getBoundingClientRect();
      initLeft = rect.left - parentRect.left;
      initTop = rect.top - parentRect.top;
      document.body.style.userSelect = 'none';
      header.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const maxLeft = overlay.parentElement.clientWidth - overlay.offsetWidth - 10;
      const maxTop = overlay.parentElement.clientHeight - 80;
      overlay.style.left = `${Math.min(Math.max(10, initLeft + dx), Math.max(10, maxLeft))}px`;
      overlay.style.top = `${Math.min(Math.max(10, initTop + dy), Math.max(10, maxTop))}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = '';
        header.style.cursor = 'grab';
      }
    });
  }

  // 9. Initialize ReiseApp and Listen to TripStore
  function initReiseApp() {
    if (typeof TripStore !== 'undefined') {
      TripStore.init();

      // Subscribe to events
      TripStore.subscribe('days:changed', () => {
        renderFloatingDaysBar(currentActiveDayNumber);
        renderDayPlanOverlay(currentActiveDayNumber);
      });

      TripStore.subscribe('activities:changed', () => {
        renderDayPlanOverlay(currentActiveDayNumber);
      });

      TripStore.subscribe('day:updated', (payload) => {
        renderFloatingDaysBar(currentActiveDayNumber);
        if (payload.day && payload.day.dayNumber === currentActiveDayNumber) {
          renderDayPlanOverlay(currentActiveDayNumber);
        }
      });

      TripStore.subscribe('store:ready', () => {
        renderFloatingDaysBar(1);
        renderDayPlanOverlay(1);
      });
    }

    renderFloatingDaysBar(1);
    renderDayPlanOverlay(1);
    initDraggableOverlay();
  }

  // Export to global scope
  root.renderFloatingDaysBar = renderFloatingDaysBar;
  root.renderDayPlanOverlay = renderDayPlanOverlay;
  root.selectDayOnApp = selectDayOnApp;
  root.toggleMinimizeOverlay = toggleMinimizeOverlay;
  root.closeDayOverlay = closeDayOverlay;
  root.openDayOverlay = openDayOverlay;
  root.mapZoomIn = mapZoomIn;
  root.mapZoomOut = mapZoomOut;
  root.toggleFloatingLayersPopover = toggleFloatingLayersPopover;
  root.openAddActivityModal = openAddActivityModal;
  root.openEditActivityModal = openEditActivityModal;
  root.closeActivityModal = closeActivityModal;
  root.handleActivityModalSubmit = handleActivityModalSubmit;
  root.handleActivityModalDelete = handleActivityModalDelete;
  root.confirmDeleteActivity = confirmDeleteActivity;
  root.openAddDayModal = openAddDayModal;
  root.openEditDayModal = openEditDayModal;
  root.closeDayModal = closeDayModal;
  root.handleDayModalSubmit = handleDayModalSubmit;
  root.handleDayModalDelete = handleDayModalDelete;
  root.initReiseApp = initReiseApp;

  // Auto-init on DOMContentLoaded or immediate if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReiseApp);
  } else {
    setTimeout(initReiseApp, 50);
  }

}(typeof window !== 'undefined' ? window : globalThis));
