/* Bildauftakt: einmal pro Laden, fünf Sekunden nach sichtbarem Bildstart. */
(function () {
  'use strict';

  const hero = document.getElementById('hero-cinematic');
  const dashboard = document.getElementById('view-dashboard');
  const dock = document.getElementById('liquid-glass-dock');
  const source = document.getElementById('cockpit-next-title');
  const title = document.getElementById('dock-next-title');
  const video = hero ? hero.querySelector('video') : null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let imageReady = true;
  let started = false;
  let stopTimer;

  function stopIntro() {
    clearTimeout(stopTimer);
    hero?.classList.add('hero-settled');
  }

  function syncHome() {
    const home = dashboard.classList.contains('active');
    const visible = home && !document.body.classList.contains('is-locked');
    document.body.classList.toggle('is-home', home);
    dock.classList.toggle('dock-visible', visible);
    dock.inert = !visible;

    if (video) {
      if (visible && !reducedMotion.matches) {
        const p = video.play();
        if (p !== undefined) p.catch(() => {});
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
    const fullTitle = source.textContent.trim();
    title.textContent = fullTitle.replace(/^Tag (\d+):\s*/, 'Tag $1 · ').split(/[➔→]/)[0].trim();
    document.getElementById('dock-next-event-btn').setAttribute('aria-label', fullTitle + ' – Tagesplan öffnen');
  }

  new MutationObserver(syncHome).observe(dashboard, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(syncHome).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(syncNextEvent).observe(source, { childList: true, subtree: true, characterData: true });
  reducedMotion.addEventListener('change', function () {
    if (reducedMotion.matches) {
      stopIntro();
      if (video) video.pause();
    } else if (dashboard.classList.contains('active')) {
      if (video) video.play().catch(() => {});
    }
  });

  // Das CSS-Bild wird als Fallback vorgeladen
  const heroImgUrl = hero ? getComputedStyle(hero).getPropertyValue('--hero-image-url').trim().replace(/^['"]|['"]$/g, '') : '';
  if (heroImgUrl) {
    const image = new Image();
    image.onload = function () { imageReady = true; syncHome(); };
    image.onerror = function () { imageReady = true; stopIntro(); syncHome(); };
    image.src = heroImgUrl;
  }

  syncNextEvent();
  syncHome();
}());
