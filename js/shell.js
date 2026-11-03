/* App shell: two views (Start, Reiseplan), hash routing, next-day shortcut, offline banner, service worker. */
(function (root) {
  'use strict';
  const doc = root.document;
  const VIEWS = {
    dashboard: { id: 'view-dashboard', title: 'Australien 2027' },
    reise: { id: 'view-reise', title: 'Reiseplan und Karte, Australien 2027' }
  };
  let current = null;

  function resolve(hash) {
    const clean = String(hash || '').toLowerCase().replace(/^#\/?/, '');
    if (/^(?:day|tag)-\d+/.test(clean)) return 'reise';
    const main = clean.split(/[/?]/)[0];
    return VIEWS[main] ? main : 'dashboard';
  }

  function showView(name, skipHistory) {
    const target = VIEWS[name] ? name : resolve(name);
    doc.querySelectorAll('.app-view').forEach(view => view.classList.toggle('active', view.id === VIEWS[target].id));
    doc.querySelectorAll('.app-nav .nav-link').forEach(link => {
      const active = link.dataset.view === target;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
    doc.body.classList.toggle('is-home', target === 'dashboard');
    doc.body.classList.toggle('is-trip', target === 'reise');
    doc.title = VIEWS[target].title;
    if (!skipHistory && resolve(root.location.hash) !== target) root.location.hash = '#' + target;
    if (current !== target) root.scrollTo(0, 0);
    current = target;
  }
  root.showView = showView;

  function nextDayLabel(day) {
    return 'Tag ' + day.dayNumber + ', ' + String(day.title || '').split(/[➔→]/)[0].trim();
  }
  function syncNextDay() {
    const label = doc.getElementById('next-day-title');
    const day = root.TripPage && root.TripPage.nextDay && root.TripPage.nextDay();
    if (label && day) label.textContent = nextDayLabel(day);
  }
  function jumpToCurrentOrNextDay() {
    const day = root.TripPage && root.TripPage.nextDay && root.TripPage.nextDay();
    showView('reise');
    if (day) root.TripPage.selectDayNumber(day.dayNumber);
  }
  root.jumpToCurrentOrNextDay = jumpToCurrentOrNextDay;

  function isoDate(date) {
    const pad = n => String(n).padStart(2, '0');
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }
  function dayDiff(a, b) {
    const utc = iso => Date.UTC(...iso.split('-').map((part, i) => Number(part) - (i === 1 ? 1 : 0)));
    return Math.round((utc(b) - utc(a)) / 86400000);
  }
  function tripCountdown(todayIso, days) {
    if (!days || !days.length) return '';
    const sorted = days.slice().sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0], last = sorted[sorted.length - 1];
    if (todayIso < first.date) {
      const n = dayDiff(todayIso, first.date);
      return n === 1 ? 'Noch 1 Tag' : 'Noch ' + n + ' Tage';
    }
    if (todayIso <= last.date) {
      const today = sorted.find(d => d.date === todayIso);
      return today ? 'Tag ' + today.dayNumber + ' von ' + last.dayNumber : '';
    }
    return '';
  }
  root.tripCountdown = tripCountdown;
  function syncCountdown() {
    const line = doc.getElementById('hero-countdown');
    if (!line) return;
    const days = root.TripPage && root.TripPage.days ? root.TripPage.days() : [];
    const text = tripCountdown(isoDate(new Date()), days);
    line.textContent = text;
    line.hidden = !text;
  }

  const next = doc.getElementById('next-day-btn');
  if (next) next.addEventListener('click', event => { event.preventDefault(); jumpToCurrentOrNextDay(); });
  root.addEventListener('trip:ready', () => { syncNextDay(); syncCountdown(); });
  root.addEventListener('hashchange', () => showView(resolve(root.location.hash), true));
  setInterval(() => { syncNextDay(); syncCountdown(); }, 60000);

  const banner = doc.getElementById('offline-status-banner');
  function network() { if (banner) banner.hidden = root.navigator.onLine; }
  root.addEventListener('offline', network);
  root.addEventListener('online', network);
  network();

  if ('serviceWorker' in root.navigator) {
    const controlled = Boolean(root.navigator.serviceWorker.controller);
    root.navigator.serviceWorker.addEventListener('controllerchange', () => { if (controlled) root.location.reload(); });
    root.addEventListener('load', () => {
      root.navigator.serviceWorker.register('./sw.js')
        .then(reg => reg.update().catch(() => {}))
        .catch(error => console.warn('[PWA] Service Worker Registrierung fehlgeschlagen:', error));
    });
  }

  showView(resolve(root.location.hash), true);
}(window));
