/* Landing video: picks the mobile or desktop file, plays only while the start view is visible. */
(function () {
  'use strict';

  const hero = document.getElementById('hero-cinematic');
  const dashboard = document.getElementById('view-dashboard');
  const video = hero ? hero.querySelector('video') : null;
  if (!video || !dashboard) return;

  const mobileViewport = window.matchMedia('(max-width: 768px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let unlockAttached = false;

  function selectVideoSource() {
    const desired = mobileViewport.matches ? video.dataset.mobileSrc : video.dataset.desktopSrc;
    if (!desired) return;
    const url = new URL(desired, document.baseURI).href;
    if (video.currentSrc === url || video.src === url) return;
    video.pause();
    video.src = desired;
    video.load();
  }

  function visible() {
    return dashboard.classList.contains('active') && document.visibilityState === 'visible';
  }

  function unlockOnGesture() {
    if (unlockAttached) return;
    unlockAttached = true;
    const unlock = function () {
      if (visible() && !reducedMotion.matches) video.play().catch(function () {});
    };
    window.addEventListener('pointerdown', unlock, { passive: true, once: true });
    window.addEventListener('touchstart', unlock, { passive: true, once: true });
  }

  function sync() {
    if (!visible() || reducedMotion.matches) {
      video.pause();
      return;
    }
    const attempt = video.play();
    if (attempt !== undefined) {
      attempt.then(function () {
        hero.classList.add('hero-video-playing');
      }).catch(function () {
        unlockOnGesture();
      });
    }
  }

  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.addEventListener('canplay', sync);
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(sync).observe(dashboard, { attributes: true, attributeFilter: ['class'] });
  reducedMotion.addEventListener('change', sync);
  mobileViewport.addEventListener('change', function () { selectVideoSource(); sync(); });

  selectVideoSource();
  sync();
}());
