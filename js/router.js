/* =========================================================================
   AUSTRALIEN ROADTRIP 2027 – CLIENT-SIDE ROUTER
   Verwaltet die 6 logischen Hauptbereiche:
   /dashboard
   /reise
   /organisation
   /finanzen
   /erlebnisse
   /mehr
   Unterstützt HTML5 History-API (PushState/PopState), Deep-Links und
   Hash-Fallbacks für maximale Hosting-Kompatibilität.
   ========================================================================= */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Router = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ROUTES = {
    dashboard: {
      path: '/dashboard',
      viewId: 'view-dashboard',
      title: 'Dashboard · Australien Roadtrip 2027',
      label: 'Dashboard'
    },
    reise: {
      path: '/reise',
      viewId: 'view-reise',
      title: '20-Tage Reiseplan & Karte · Australien 2027',
      label: 'Reise'
    },
    organisation: {
      path: '/organisation',
      viewId: 'view-organisation',
      title: 'Reiseorganisation & Buchungen · Australien 2027',
      label: 'Organisation'
    },
    finanzen: {
      path: '/finanzen',
      viewId: 'view-finanzen',
      title: 'Kosten & Budgetübersicht · Australien 2027',
      label: 'Finanzen'
    },
    erlebnisse: {
      path: '/erlebnisse',
      viewId: 'view-erlebnisse',
      title: 'Reisejournal & Erinnerungen · Australien 2027',
      label: 'Erlebnisse'
    },
    mehr: {
      path: '/mehr',
      viewId: 'view-mehr',
      title: 'Drohne, Wetter & Tools · Australien 2027',
      label: 'Mehr'
    }
  };

  let currentRoute = 'dashboard';
  let isNavigating = false;

  const Router = {
    routes: ROUTES,

    getCurrentRoute: function () {
      return currentRoute;
    },

    /**
     * Ermittelt die Zielroute anhand von Pfad oder Hash
     */
    resolveRoute: function () {
      const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');

      // 1. Prüfe Pathname
      for (const [key, config] of Object.entries(ROUTES)) {
        if (pathname.endsWith(config.path) || pathname === config.path) {
          return { route: key, sub: hash };
        }
      }

      // 2. Prüfe Hash
      if (hash) {
        const hashMain = hash.split('/')[0].split('?')[0];
        if (ROUTES[hashMain]) {
          return { route: hashMain, sub: hash.substring(hashMain.length + 1) };
        }
      }

      // 3. Fallback
      return { route: 'dashboard', sub: '' };
    },

    /**
     * Hauptnavigation zu einer Route
     */
    navigate: function (routeKey, options = {}) {
      const { push = true, sub = '', silent = false } = options;
      if (!ROUTES[routeKey]) {
        console.warn('[Router] Unknown route:', routeKey);
        routeKey = 'dashboard';
      }

      currentRoute = routeKey;
      const targetConfig = ROUTES[routeKey];

      // 1. View-Container umschalten
      const allViews = document.querySelectorAll('.app-view');
      allViews.forEach(view => {
        if (view.id === targetConfig.viewId) {
          view.classList.add('active');
          view.style.display = 'block';
        } else {
          view.classList.remove('active');
          view.style.display = 'none';
        }
      });

      // 2. Navigation-Tabs aktualisieren (Desktop & Mobile)
      const navTabs = document.querySelectorAll('.desktop-nav .nav-tab, .mobile-bottom-nav .bottom-nav-item');
      navTabs.forEach(tab => {
        const tabView = tab.getAttribute('data-view');
        const isMobileItem = tab.classList.contains('bottom-nav-item');
        const isActive = (tabView === routeKey) || (isMobileItem && routeKey === 'erlebnisse' && tabView === 'mehr');
        if (isActive) {
          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');
        } else {
          tab.classList.remove('active');
          tab.setAttribute('aria-selected', 'false');
        }
      });

      // 3. Browser-History & URL aktualisieren
      if (push && !isNavigating) {
        const isFileProtocol = window.location.protocol === 'file:';
        if (isFileProtocol) {
          window.location.hash = sub ? `${routeKey}/${sub}` : routeKey;
        } else {
          const targetUrl = targetConfig.path + (sub ? `#${sub}` : '');
          if (window.location.pathname !== targetConfig.path || window.location.hash !== (sub ? `#${sub}` : '')) {
            window.history.pushState({ route: routeKey, sub: sub }, targetConfig.title, targetUrl);
          }
        }
      }

      // 4. Dokument-Titel aktualisieren
      document.title = targetConfig.title;

      // 5. Nachbearbeitung / Event Hooks
      if (!silent) {
        window.dispatchEvent(new CustomEvent('app:route-changed', {
          detail: { route: routeKey, sub: sub }
        }));
      }

      // 6. Karten-Rendering bei Bedarf auffrischen (Leaflet Resize-Fix)
      if (routeKey === 'reise' && typeof window.ensureRouteMapReady === 'function') {
        setTimeout(window.ensureRouteMapReady, 100);
      }

      // 7. Scroll nach oben zurücksetzen
      window.scrollTo({ top: 0, behavior: 'instant' });
    },

    /**
     * Initialisiert Event-Listener für History und Links
     */
    init: function () {
      // Popstate (Browser Zurück / Vor)
      window.addEventListener('popstate', function (e) {
        isNavigating = true;
        const resolved = Router.resolveRoute();
        Router.navigate(resolved.route, { push: false, sub: resolved.sub });
        isNavigating = false;
      });

      // Hashchange
      window.addEventListener('hashchange', function () {
        if (!isNavigating) {
          const resolved = Router.resolveRoute();
          Router.navigate(resolved.route, { push: false, sub: resolved.sub });
        }
      });

      // Initialer Aufruf
      const initial = Router.resolveRoute();
      Router.navigate(initial.route, { push: false, sub: initial.sub });
    }
  };

  return Router;
}));
