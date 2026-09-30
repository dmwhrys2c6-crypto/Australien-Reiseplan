/* =========================================================================
   Service Worker für Australien Roadtrip 2027 PWA
   Offline-Verfügbarkeit für Reisedaten, Assets, Schriftarten & Karten-Tiles
   ========================================================================= */

const CACHE_NAME = 'aus-roadtrip-v2.0.0';

// Statische Kern-Assets für die App-Shell
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/app.css',
  './js/tripData.js',
  './js/components.js',
  './js/router.js',
  './js/app.js',
  './manifest.json',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js'
];

// Install: Cache vorbereiten & sofort aktivieren
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Precache core assets with resilient error handling
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Could not precache:', url, err.message);
          })
        )
      );
    })
  );
});

// Activate: Veraltete Caches bereinigen & Clients sofort übernehmen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
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

  // 1. Navigation / HTML Seiten (App-Shell) -> Network-First mit Cache-Fallback
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          console.log('[SW] Offline: serving cached index.html for navigation');
          const cached = await caches.match('./index.html') || await caches.match('/');
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
            return cachedResponse || new Response('', { status: 200, headers: { 'Content-Type': 'image/png' } });
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
            resolve(cached);
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
              resolve(cached);
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
        // Im Hintergrund auffrischen (Stale-While-Revalidate für nicht-fingerprinted Assets)
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => { /* Offline – ignorieren */ });

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
            return new Response('', { status: 200, headers: { 'Content-Type': 'image/svg+xml' } });
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
    })
  );
});
