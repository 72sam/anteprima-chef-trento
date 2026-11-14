(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const nodes = [...document.querySelectorAll('.section-heading, .reputation, .experience, .booking-strip, .location, .owner-preview, .path-card, .benefit-row, .video-section')];
  let observer;
  function enable() {
    if (reduced.matches || !('IntersectionObserver' in window)) {
      nodes.forEach(n => n.classList.remove('reveal-ready')); return;
    }
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold: .08, rootMargin: '0px 0px -25px 0px'});
    nodes.forEach(n => { if(n.getBoundingClientRect().top > innerHeight*.9) n.classList.add('reveal-ready'); observer.observe(n); });
  }
  enable();
  reduced.addEventListener('change', () => { observer?.disconnect(); nodes.forEach(n=>n.classList.remove('reveal-ready')); if (!reduced.matches) enable(); });
})();
