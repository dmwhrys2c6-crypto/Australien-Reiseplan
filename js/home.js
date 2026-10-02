/* Bildauftakt: einmal pro Laden, fünf Sekunden nach sichtbarem Bildstart. */
(function () {
  'use strict';

  const hero = document.getElementById('hero-cinematic');
  const dashboard = document.getElementById('view-dashboard');
  const dock = document.getElementById('liquid-glass-dock');
  const source = document.getElementById('cockpit-next-title');
  const title = document.getElementById('dock-next-title');
  const video = hero ? hero.querySelector('video') : null;
  const mobileViewport = window.matchMedia('(max-width: 768px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let imageReady = true;
  let started = false;
  let videoPlayedOnce = false;
  let wasHome = dashboard.classList.contains('active');
  let stopTimer;

  const DEFAULT_DAYS = [
    { day: 0, date: '2027-03-20', title: 'Fahrt nach Wien & Vorübernachtung' },
    { day: 1, date: '2027-03-21', title: 'Flug ab Wien-Schwechat' },
    { day: 2, date: '2027-03-22', title: 'Ankunft in Sydney & Darling Harbour' },
    { day: 3, date: '2027-03-23', title: 'Sydney – Klassiker am Hafen & Manly Ferry' },
    { day: 4, date: '2027-03-24', title: 'Sydney – Coastal Walk & Trendviertel' },
    { day: 5, date: '2027-03-25', title: 'Flug nach Ballina / Byron Bay' },
    { day: 6, date: '2027-03-26', title: 'Byron Bay – Surfen & Kajak' },
    { day: 7, date: '2027-03-27', title: 'Byron Bay ➔ Gold Coast ➔ Brisbane' },
    { day: 8, date: '2027-03-28', title: 'Brisbane City & South Bank' },
    { day: 9, date: '2027-03-29', title: 'Australia Zoo (Beerwah)' },
    { day: 10, date: '2027-03-30', title: 'Fahrt nach Noosa & Glass House Mountains' },
    { day: 11, date: '2027-03-31', title: 'Rainbow Beach & Carlo Sand Blow ➔ Hervey Bay' },
    { day: 12, date: '2027-04-01', title: 'K’gari (Fraser Island) & Greyhound Nachtbus' },
    { day: 13, date: '2027-04-02', title: 'Airlie Beach & Whitsundays Helikopter' },
    { day: 14, date: '2027-04-03', title: 'Whitsundays Segeln & Whitehaven Beach' },
    { day: 15, date: '2027-04-04', title: 'Airlie Beach Erholung & Cedar Creek Falls' },
    { day: 16, date: '2027-04-05', title: 'Flug nach Melbourne' },
    { day: 17, date: '2027-04-06', title: 'Melbourne City, Laneways & St. Kilda Pinguine' },
    { day: 18, date: '2027-04-07', title: 'Great Ocean Road Tagestour (Twelve Apostles)' },
    { day: 19, date: '2027-04-08', title: 'Melbourne Brighton Beach & Fitzroy Rooftop' },
    { day: 20, date: '2027-04-09', title: 'Melbourne Ausklang & Heimflug nach Wien' }
  ];

  function getCalendarEvent() {
    let days = null;
    if (window.repo && typeof window.repo.trip?.getDays === 'function') {
      days = window.repo.trip.getDays();
    } else if (Array.isArray(window.TRIP_DAYS) && window.TRIP_DAYS.length) {
      days = window.TRIP_DAYS;
    } else {
      days = DEFAULT_DAYS;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    let target = days.find(function (d) { return d.date >= todayStr; });
    if (!target) {
      target = days[days.length - 1] || DEFAULT_DAYS[0];
    }

    const dayNum = target.dayNumber !== undefined ? target.dayNumber : (target.day !== undefined ? target.day : 0);
    return {
      dayNum: dayNum,
      title: target.title || 'Fahrt nach Wien & Vorübernachtung',
      fullTitle: 'Tag ' + dayNum + ' · ' + (target.title || 'Fahrt nach Wien & Vorübernachtung'),
      id: target.id
    };
  }

  function stopIntro() {
    clearTimeout(stopTimer);
    hero?.classList.add('hero-settled');
  }

  function selectVideoSource() {
    if (!video) return;
    const desiredSource = mobileViewport.matches ? video.dataset.mobileSrc : video.dataset.desktopSrc;
    if (!desiredSource) return;
    const desiredUrl = new URL(desiredSource, document.baseURI).href;
    if (video.currentSrc === desiredUrl || video.src === desiredUrl) return;
    video.pause();
    video.src = desiredSource;
    video.load();
  }

  function syncHome() {
    const home = dashboard.classList.contains('active');
    const visible = home && !document.body.classList.contains('is-locked');

    // Eine neue Rückkehr zur Startseite ist eine neue Wiedergabe-Sitzung.
    if (!home && wasHome) {
      clearTimeout(stopTimer);
      started = false;
      videoPlayedOnce = false;
      hero?.classList.remove('hero-playing', 'hero-settled');
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    }
    wasHome = home;

    document.body.classList.toggle('is-home', home);
    dock.classList.toggle('dock-visible', visible);
    dock.inert = !visible;

    if (video) {
      if (visible && !reducedMotion.matches) {
        safePlayVideo();
      } else {
        video.pause();
      }
    }

    if (!visible && started) stopIntro();
    if (visible && imageReady && !started) {
      started = true;
      if (reducedMotion.matches) {
        stopIntro();
      } else {
        hero?.classList.add('hero-playing');
        stopTimer = setTimeout(stopIntro, 5000);
      }
    }
  }

  function syncNextEvent() {
    const cal = getCalendarEvent();
    const fullSource = source ? source.textContent.trim() : '';
    let displayTitle = '';

    if (fullSource && fullSource.toLowerCase().includes('tag')) {
      displayTitle = fullSource.replace(/^Tag\s*(\d+)[:·\s]*/i, 'Tag $1 · ').split(/[➔→]/)[0].trim();
    } else {
      displayTitle = cal.fullTitle;
    }

    if (title) {
      title.textContent = displayTitle;
    }

    const nextBtn = document.getElementById('dock-next-event-btn');
    if (nextBtn) {
      nextBtn.setAttribute('aria-label', displayTitle + ' – Tagesplan öffnen');
      nextBtn.onclick = function () {
        if (typeof window.jumpToCurrentOrNextDay === 'function') {
          window.jumpToCurrentOrNextDay();
        } else if (window.TripPage && typeof window.TripPage.selectDayNumber === 'function') {
          if (typeof window.showView === 'function') window.showView('reise');
          window.TripPage.selectDayNumber(cal.dayNum);
        } else if (typeof window.jumpToDay === 'function') {
          if (typeof window.showView === 'function') window.showView('reise');
          window.jumpToDay(cal.dayNum);
        }
      };
    }
  }

  let gestureAttached = false;
  function safePlayVideo() {
    if (!video) return;
    const home = dashboard.classList.contains('active');
    const visible = home && !document.body.classList.contains('is-locked');
    if (!visible || reducedMotion.matches) {
      video.pause();
      return;
    }
    const p = video.play();
    if (p !== undefined) {
      p.then(function () {
        hero?.classList.add('hero-video-playing');
        hero?.classList.remove('hero-video-failed');
      }).catch(function (err) {
        console.warn('[HeroVideo] Autoplay prevented:', err.name || err);
        hero?.classList.add('hero-video-failed');
        if (!gestureAttached) {
          gestureAttached = true;
          const unlock = function () {
            if (dashboard.classList.contains('active')) {
              video.play().catch(function () {});
            }
            window.removeEventListener('touchstart', unlock, { passive: true });
            window.removeEventListener('pointerdown', unlock, { passive: true });
            window.removeEventListener('click', unlock, { passive: true });
          };
          window.addEventListener('touchstart', unlock, { passive: true, once: true });
          window.addEventListener('pointerdown', unlock, { passive: true, once: true });
          window.addEventListener('click', unlock, { passive: true, once: true });
        }
      });
    }
  }

  if (video) {
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.addEventListener('canplay', function () {
      safePlayVideo();
    });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      safePlayVideo();
    } else if (video) {
      video.pause();
    }
  });

  new MutationObserver(syncHome).observe(dashboard, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(syncHome).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  if (source) {
    new MutationObserver(syncNextEvent).observe(source, { childList: true, subtree: true, characterData: true });
  }

  reducedMotion.addEventListener('change', function () {
    if (reducedMotion.matches) {
      stopIntro();
      if (video) video.pause();
    } else if (dashboard.classList.contains('active') && !videoPlayedOnce) {
      if (video) video.play().catch(function () {});
    }
  });

  mobileViewport.addEventListener('change', function () {
    videoPlayedOnce = false;
    selectVideoSource();
    syncHome();
  });

  // Re-check calendar every minute
  setInterval(syncNextEvent, 60000);

  // Das CSS-Bild wird als Fallback vorgeladen
  const heroImgUrl = hero ? getComputedStyle(hero).getPropertyValue('--hero-image-url').trim().replace(/^['"]|['"]$/g, '') : '';
  if (heroImgUrl) {
    const image = new Image();
    image.onload = function () { imageReady = true; syncHome(); };
    image.onerror = function () { imageReady = true; stopIntro(); syncHome(); };
    image.src = heroImgUrl;
  }

  selectVideoSource();
  syncNextEvent();
  syncHome();
}());
