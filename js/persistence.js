/* Shared optimistic write guard: stale tabs must never replace newer data silently. */
(function(root) {
  'use strict';
  const wrappers = new WeakMap();
  function report(error) {
    console.error('Speichern fehlgeschlagen:', error);
    const live = document.getElementById('manage-live');
    if (live) { live.classList.add('has-error'); live.textContent = error.message || 'Speichern fehlgeschlagen. Deine Eingabe ist noch nicht gesichert.'; }
  }
  function wrap(storage) {
    if (!storage) return storage;
    if (wrappers.has(storage)) return wrappers.get(storage);
    const observed = new Map();
    const api = {
      getItem(key) {
        const value = storage.getItem(key);
        if (!observed.has(key)) observed.set(key, value);
        return value;
      },
      setItem(key, value) {
        const current = storage.getItem(key);
        if (observed.has(key) && current !== observed.get(key)) throw new Error('Die Daten wurden in einem anderen Tab geändert. Lade die Seite neu, bevor du erneut speicherst.');
        storage.setItem(key, value);
        observed.set(key, String(value));
      },
      batch(entries) {
        const before = entries.map(([key]) => [key, storage.getItem(key)]);
        for (const [key, current] of before) {
          if (observed.has(key) && current !== observed.get(key)) throw new Error('Die Daten wurden in einem anderen Tab geändert. Lade die Seite neu, bevor du erneut speicherst.');
        }
        let written = 0;
        try {
          for (const [key, value] of entries) { storage.setItem(key, String(value)); written++; }
        } catch (error) {
          for (const [key, value] of before.slice(0, written).reverse()) {
            if (value === null) storage.removeItem(key); else storage.setItem(key, value);
          }
          throw error;
        }
        for (const [key, value] of entries) observed.set(key, String(value));
      },
      removeItem(key) { storage.removeItem(key); observed.set(key, null); }
    };
    wrappers.set(storage, api); wrappers.set(api, api);
    return api;
  }
  root.Persistence = {wrap, report};
  if (root.addEventListener) root.addEventListener('unhandledrejection', event => {
    if (/quota|speicher|anderen Tab/i.test(event.reason?.message || '')) { report(event.reason); event.preventDefault(); }
  });
  if (root.addEventListener) root.addEventListener('error', event => {
    if (/quota|speicher|anderen Tab/i.test(event.error?.message || event.message || '')) report(event.error || new Error(event.message));
  });
}(globalThis));
