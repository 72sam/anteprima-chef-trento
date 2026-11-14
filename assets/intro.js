(() => {
  'use strict';

  const root = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const navigation = performance.getEntriesByType('navigation')[0];
  const site = new URL('.', location.href);
  const fromSite = document.referrer.startsWith(site.href);
  if (motion.matches || location.hash || navigation?.type === 'back_forward' ||
      (fromSite && navigation?.type !== 'reload')) return;

  root.classList.add('chef-intro-active');

  function dismiss() {
    root.classList.remove('chef-intro-active', 'chef-intro-leaving');
    document.removeEventListener('keydown', dismiss);
    document.removeEventListener('pointerdown', dismiss);
    motion.removeEventListener('change', dismiss);
    window.removeEventListener('pagehide', dismiss);
  }

  document.addEventListener('keydown', dismiss);
  document.addEventListener('pointerdown', dismiss);
  motion.addEventListener('change', dismiss);
  window.addEventListener('pagehide', dismiss);
  // Keep the page usable even if a slow asset delays the document.
  window.setTimeout(dismiss, 2900);

  document.addEventListener('DOMContentLoaded', () => {
    if (!root.classList.contains('chef-intro-active')) return;
    const hero = document.querySelector('.hero-photo');
    const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
    const ready = hero?.decode ? hero.decode().catch(() => {}) : Promise.resolve();
    Promise.all([wait(1100), Promise.race([ready, wait(1900)])]).then(() => {
      if (!root.classList.contains('chef-intro-active')) return;
      root.classList.add('chef-intro-leaving');
      window.setTimeout(dismiss, 490);
    });
  }, {once: true});
})();
