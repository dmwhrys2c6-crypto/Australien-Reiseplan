/* =========================================================================
   Service Worker für Australien Roadtrip 2027 PWA
   Offline-Verfügbarkeit für Reisedaten, Assets, Schriftarten & Karten-Tiles
   ========================================================================= */

const CACHE_NAME = 'aus-roadtrip-395b06b4e2ff';

// Statische Kern-Assets für die App-Shell
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./css/app.css?v=2b4efbe21b5c",
  "./css/hero-dock.css?v=acbf0e0c9823",
  "./css/trip.css?v=54b8249a1b81",
  "./css/management.css?v=33ca1b99e570",
  "./css/design-system.css?v=5c0b6757fede",
  "./js/persistence.js?v=693c8733bcb9",
  "./js/session.js?v=b84cab50341e",
  "./js/trip-store.js?v=3a473727a886",
  "./js/tripMasterData.js?v=b408de665920",
  "./js/tripData.js?v=8536582e14e3",
  "./js/components.js?v=0e3ea73352fa",
  "./js/router.js?v=ebb76f5fd504",
  "./js/reiseApp.js?v=2c5dfc9e1c6d",
  "./js/app.js?v=cd78db629bc5",
  "./js/trip/repository.js?v=93a0a6fc97f5",
  "./js/trip/map-adapter.js?v=1bd2da8b7ee4",
  "./js/trip/components.js?v=833314db286d",
  "./js/trip/editor.js?v=61ae22ce8ae4",
  "./js/trip/page.js?v=3d6cd01c550f",
  "./js/management/repository.js?v=284e225486c8",
  "./js/management/ui.js?v=a8afe8280c83",
  "./js/management/editor.js?v=acfc42f53cb2",
  "./js/management/finance.js?v=1cca521ea3ef",
  "./js/management/page.js?v=cb95dfd929e2",
  "./js/journal/repository.js?v=2dc36fd4f416",
  "./js/journal/upload.js?v=1bbf9c488e89",
  "./js/home.js?v=6f14b8ed2056",
  "./data/trip-days.json",
  "./manifest.json",
  "./favicon.svg",
  "./icon-192.png",
  "./icon-512.png"
];

// Install: Cache vorbereiten & sofort aktivieren
self.addEventListener('install', (event) => {

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Install only after the entire versioned local shell is available.
      return cache.addAll(PRECACHE_ASSETS).then(() => self.skipWaiting());

    })
  );
});

// Activate: Veraltete Caches bereinigen & Clients sofort übernehmen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('aus-roadtrip-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Intelligente Caching-Strategien
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Nur GET-Anfragen cachen (POST für Auth geht direkt an Server)
  if (request.method !== 'GET') {
    return;
  }

  // Session responses contain secrets and must never enter the HTTP cache.
  if (url.pathname === '/api/session' || url.pathname === '/login' || url.pathname === '/js/login.js') {
    event.respondWith(fetch(request));
    return;
  }

  // 1. Navigation / HTML Seiten (App-Shell) -> Network-First mit Cache-Fallback
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200 && new URL(response.url).pathname !== '/login') {
            const clone = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)));
          }
          return response;
        })
        .catch(async () => {
          console.log('[SW] Offline: serving cached index.html for navigation');
          const shell = await caches.open(CACHE_NAME);
          const cached = await shell.match(new URL('index.html', self.registration.scope).href);
          if (cached) return cached;
          return new Response('Offline: Australien Roadtrip App verfügbar aus Cache.', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 2. OpenStreetMap Map Tiles -> Stale-While-Revalidate (offline sichtbare Kartenbereiche)
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Wenn offline und kein Tile im Cache -> leeres transparentes PNG oder gecachter Response
            return cachedResponse || new Response('Offline tile', {status:503});
          });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Eigene API-Endpunkte (/api/rates, /api/weather) -> Network-First mit schnellem Timeout (2.5s) & Cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      new Promise((resolve) => {
        const timeoutId = setTimeout(async () => {
          const cached = await caches.match(request);
          if (cached) {
            const data = await cached.json();
            resolve(new Response(JSON.stringify({...data, stale:true, offline:true}), {headers:{'Content-Type':'application/json'}}));
          } else {
            resolve(new Response(JSON.stringify({ offline: true }), {
              headers: { 'Content-Type': 'application/json' }
            }));
          }
        }, 2500);

        fetch(request)
          .then((networkResponse) => {
            clearTimeout(timeoutId);
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            resolve(networkResponse);
          })
          .catch(async () => {
            clearTimeout(timeoutId);
            const cached = await caches.match(request);
            if (cached) {
              const data = await cached.json();
            resolve(new Response(JSON.stringify({...data, stale:true, offline:true}), {headers:{'Content-Type':'application/json'}}));
            } else {
              resolve(new Response(JSON.stringify({ offline: true }), {
                headers: { 'Content-Type': 'application/json' }
              }));
            }
          });
      })
    );
    return;
  }

  // 4. Statische Assets & CDNs (Fonts, Leaflet, Scripts, Stylesheets, Icons) -> Cache-First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {

        return cachedResponse;
      }

      // Noch nicht im Cache -> Aus dem Netzwerk laden und cachen
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
            // Opaque responses (z.B. cross-origin ohne CORS) trotzdem weiterleiten
            return networkResponse;
          }
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return networkResponse;
        })
        .catch(() => {
          // Letzter Ausweg bei Bildern wenn offline: transparente Dummy-Antwort
          if (request.destination === 'image') {
            return new Response('Offline image', {status:503});
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
    })
  );
});
