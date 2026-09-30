(function(root) {
  'use strict';
  const DB = 'aus-device-access-v1';
  function deviceGrant(value, write = false) {
    return new Promise((resolve, reject) => {
      const open = indexedDB.open(DB, 1);
      open.onupgradeneeded = () => open.result.createObjectStore('access');
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const db = open.result, tx = db.transaction('access', write ? 'readwrite' : 'readonly');
        const store = tx.objectStore('access');
        const request = write ? (value ? store.put(value, 'grant') : store.delete('grant')) : store.get('grant');
        let result;
        request.onsuccess = () => { result = request.result; };
        tx.oncomplete = () => { db.close(); resolve(write ? value : result); };
        tx.onerror = () => { db.close(); reject(tx.error); };
      };
    });
  }
  function setLocked(locked) {
    [...document.body.children].forEach(el => {
      if (el.id !== 'security-gate' && el.tagName !== 'SCRIPT') el.inert = locked;
    });
  }
  async function restore() {
    let response;
    try { response = await fetch('/api/session', {cache:'no-store', signal:AbortSignal.timeout(5000)}); }
    catch {
      const grant = await deviceGrant();
      if (grant?.key) return grant;
      throw new Error('Offline-Anmeldung ist auf diesem Gerät noch nicht eingerichtet. Melde dich einmal online an.');
    }
    if (response.status === 401) {
      await deviceGrant(null, true);
      location.replace('/login?next=' + encodeURIComponent(location.pathname + location.hash));
      throw new Error('Bitte erneut anmelden.');
    }
    if (!response.ok) throw new Error('Die Anmeldung konnte nicht geprüft werden. Bitte erneut versuchen.');
    const data = await response.json();
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(data.syncSecret), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({name:'PBKDF2', salt:new TextEncoder().encode('aus_roadtrip_sync_v2'), iterations:100000, hash:'SHA-256'}, material, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']);
    const grant = {key, resources:data.resources, syncTopic:data.syncTopic};
    try { await deviceGrant(grant, true); }
    catch (error) { console.warn('Offline-Zugriff konnte nicht gespeichert werden:', error.message); }
    return grant;
  }
  async function logout() {
    let storageError;
    try { await deviceGrant(null, true); } catch (error) { storageError = error; }
    try { await fetch('/api/logout', {method:'POST', signal:AbortSignal.timeout(4000)}); }
    catch { /* Local access is revoked even when the network is unavailable. */ }
    if (storageError) console.error('Offline-Anmeldung konnte nicht gelöscht werden:', storageError);
    if ('caches' in root) {
      const names = await caches.keys();
      await Promise.all(names.filter(n => n.startsWith('aus-roadtrip-')).map(n => caches.delete(n)));
    }
  }
  root.AppSession = {restore, logout, setLocked};
  setLocked(true);
  document.addEventListener('keydown', event => {
    if (!document.body.classList.contains('is-locked') || event.key !== 'Tab') return;
    const focusable = [...document.querySelectorAll('#security-gate input, #security-gate button')];
    const index = focusable.indexOf(document.activeElement);
    if (event.shiftKey && index <= 0) { event.preventDefault(); focusable.at(-1)?.focus(); }
    if (!event.shiftKey && (index < 0 || index === focusable.length - 1)) { event.preventDefault(); focusable[0]?.focus(); }
  }, true);
}(window));
