/* =========================================================================
   AUSTRALIEN ROADTRIP 2027 – WIEDERVERWENDBARE UI-KOMPONENTEN
   Einheitliche Grundlage für:
   Header, Navigation, Buttons, Cards, Timeline, Accordion, Modal,
   Map Container, Map Marker, Bottom Sheet, Status Badge, Progress Bar,
   Section Header.
   ========================================================================= */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.UI = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const UI = {};

  // ---------------------------------------------------------------------------
  // 1. STATUS BADGES
  // ---------------------------------------------------------------------------
  UI.createBadge = function (label, variant = 'neutral', icon = null) {
    const iconHtml = icon ? `<i class="fa-solid ${icon}"></i> ` : '';
    return `<span class="ui-badge ui-badge-${variant}">${iconHtml}${label}</span>`;
  };

  // ---------------------------------------------------------------------------
  // 2. PROGRESS BAR
  // ---------------------------------------------------------------------------
  UI.createProgressBar = function (current, max, label = '') {
    const safeMax = max > 0 ? max : 1;
    const pct = Math.min(100, Math.round((current / safeMax) * 100));
    return `
      <div class="ui-progress-wrapper" role="progressbar" aria-valuenow="${current}" aria-valuemin="0" aria-valuemax="${max}" aria-label="${label}">
        <div class="ui-progress-bar">
          <div class="ui-progress-fill" style="width: ${pct}%"></div>
        </div>
        <span class="ui-progress-label">${current}/${max} · ${pct}%</span>
      </div>
    `;
  };

  // ---------------------------------------------------------------------------
  // 3. SECTION HEADER
  // ---------------------------------------------------------------------------
  UI.createSectionHeader = function ({ title, subtitle, icon, badge, actionsHtml = '' }) {
    const iconHtml = icon ? `<div class="ui-section-icon"><i class="fa-solid ${icon}"></i></div>` : '';
    const badgeHtml = badge ? `<span class="ui-badge ui-badge-primary">${badge}</span>` : '';
    return `
      <div class="ui-section-header">
        <div class="ui-section-header-left">
          ${iconHtml}
          <div>
            ${badgeHtml}
            <h2 class="ui-section-title">${title}</h2>
            ${subtitle ? `<p class="ui-section-subtitle">${subtitle}</p>` : ''}
          </div>
        </div>
        ${actionsHtml ? `<div class="ui-section-header-actions">${actionsHtml}</div>` : ''}
      </div>
    `;
  };

  // ---------------------------------------------------------------------------
  // 4. CARDS & KPI CARDS
  // ---------------------------------------------------------------------------
  UI.createCard = function ({ title, meta, bodyHtml, actionHtml, icon, className = '' }) {
    const iconWrap = icon ? `<div class="ui-card-icon"><i class="fa-solid ${icon}"></i></div>` : '';
    return `
      <div class="ui-card ${className}">
        ${iconWrap}
        ${title ? `<div class="ui-card-title">${title}</div>` : ''}
        ${meta ? `<div class="ui-card-meta">${meta}</div>` : ''}
        ${bodyHtml ? `<div class="ui-card-body">${bodyHtml}</div>` : ''}
        ${actionHtml ? `<div class="ui-card-action">${actionHtml}</div>` : ''}
      </div>
    `;
  };

  UI.createKpiCard = function ({ id, label, value, subtext, icon, color = 'var(--primary)' }) {
    return `
      <div class="ui-kpi-card" ${id ? `id="${id}-card"` : ''}>
        <div class="ui-kpi-label"><i class="fa-solid ${icon}" style=""></i> ${label}</div>
        <div class="ui-kpi-val" ${id ? `id="${id}"` : ''}>${value}</div>
        <div class="ui-kpi-sub" ${id ? `id="${id}-sub"` : ''}>${subtext}</div>
      </div>
    `;
  };

  // ---------------------------------------------------------------------------
  // 5. ACCORDION / TIMELINE DAY
  // ---------------------------------------------------------------------------
  UI.createDayAccordion = function (day) {
    const spotsCount = day.spots ? day.spots.length : 0;
    const spotsBadge = spotsCount > 0 ? `<span class="ui-badge ui-badge-neutral"><i class="fa-solid fa-location-dot"></i> ${spotsCount} Spots</span>` : '';
    return `
      <details class="ui-accordion day-accordion" id="day-${day.day}" data-day="${day.day}">
        <summary class="ui-accordion-summary">
          <div class="day-summary-left">
            <span class="day-pill-number">Tag ${day.day}</span>
            <span class="day-summary-date">${day.date}</span>
            <span class="day-summary-title">${day.title}</span>
          </div>
          <div class="day-summary-meta">
            ${day.driveTime ? `<span class="day-summary-drivetime"><i class="fa-solid fa-car"></i> ${day.driveTime}</span>` : ''}
            ${spotsBadge}
            <i class="fa-solid fa-chevron-down ui-accordion-chevron"></i>
          </div>
        </summary>
        <div class="ui-accordion-content">
          <!-- Tagesdetails werden aus tripData gerendert -->
        </div>
      </details>
    `;
  };

  // ---------------------------------------------------------------------------
  // 6. MAP MARKER (Leaflet DivIcon Factory)
  // ---------------------------------------------------------------------------
  UI.createMapMarkerIcon = function (spot, isActive = false) {
    const dayLabel = spot.day ? `T${spot.day}` : '';
    const activeClass = isActive ? 'is-active' : '';
    return L.divIcon({
      className: 'ui-map-marker-wrap',
      html: `
        <div class="ui-map-marker ${activeClass}" data-spot-id="${spot.id}" title="${spot.name}">
          <span class="ui-marker-number">${spot.id}</span>
          ${dayLabel ? `<span class="ui-marker-day">${dayLabel}</span>` : ''}
        </div>
      `,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -36]
    });
  };

  // ---------------------------------------------------------------------------
  // 7. MODAL CONTROLLER (Singletons)
  // ---------------------------------------------------------------------------
  UI.modal = {
    open: function (modalId) {
      const el = document.getElementById(modalId);
      if (!el) {
        console.warn('[UI.modal] Element not found:', modalId);
        return;
      }
      el.style.display = 'flex';
      el.classList.add('is-open');
      document.body.classList.add('modal-open');
      const focusable = el.querySelector('input:not([type="hidden"]), select, textarea, button:not([data-close])');
      if (focusable) setTimeout(() => focusable.focus(), 50);
    },

    close: function (modalId) {
      const el = document.getElementById(modalId);
      if (!el) return;
      el.classList.remove('is-open');
      el.style.display = 'none';
      if (!document.querySelector('.modal-backdrop.is-open, .org-modal-backdrop[style*="flex"], .expense-modal-backdrop[style*="flex"], .search-modal-backdrop[style*="flex"], .lightbox-modal-backdrop[style*="flex"]')) {
        document.body.classList.remove('modal-open');
      }
    },

    isOpen: function (modalId) {
      const el = document.getElementById(modalId);
      return el && (el.classList.contains('is-open') || el.style.display === 'flex' || el.style.display === 'block');
    },

    init: function () {
      // Global Escape key handler for all modals
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          const openModals = document.querySelectorAll('.is-open, [id$="-modal-backdrop"][style*="flex"], #photo-lightbox-modal[style*="flex"], #global-search-modal[style*="flex"]');
          openModals.forEach(m => {
            if (m.id && m.id !== 'security-gate') {
              UI.modal.close(m.id);
            }
          });
        }
      });
    }
  };

  // ---------------------------------------------------------------------------
  // 8. TOAST NOTIFICATIONS
  // ---------------------------------------------------------------------------
  UI.toast = function (message, type = 'info', duration = 3000) {
    let container = document.getElementById('ui-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ui-toast-container';
      container.className = 'ui-toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `ui-toast ui-toast-${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info'}"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('is-visible'), 10);
    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  return UI;
}));
