(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const floatingWhatsapp = document.querySelector('.floating-whatsapp');
  const cookieBanner = document.querySelector('#cookie-banner');
  const cookieAccept = document.querySelector('#cookie-accept');
  const cookieReject = document.querySelector('#cookie-reject');

  const syncHeader = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    if (floatingWhatsapp) floatingWhatsapp.classList.toggle('is-visible', window.scrollY > 450);
  };

  const closeMenu = () => {
    if (!toggle || !nav) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  };

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const next = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', next);
      toggle.setAttribute('aria-expanded', String(next));
      toggle.setAttribute('aria-label', next ? 'Fechar menu' : 'Abrir menu');
    });

    nav.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); toggle.focus(); }
    });
    document.addEventListener('click', (event) => { if (!header.contains(event.target)) closeMenu(); });
    window.matchMedia('(max-width: 1080px)').addEventListener('change', closeMenu);
  }

  document.querySelectorAll('.js-whatsapp').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (typeof window.gtag_report_conversion !== 'function') return;
      event.preventDefault();
      window.gtag_report_conversion(link.href);
    });
  });

  let consentTrigger = null;
  document.querySelectorAll('.cookie-settings').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => {
      consentTrigger = button;
      cookieBanner.hidden = false;
      cookieBanner.focus();
    });
  });

  const setConsent = (accepted) => {
    const state = accepted ? 'granted' : 'denied';
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: state,
        analytics_storage: state,
        ad_user_data: state,
        ad_personalization: state
      });
    }
    try { localStorage.setItem('semear_cookie_consent', accepted ? 'accepted' : 'rejected'); } catch (_) {}
    if (cookieBanner) cookieBanner.hidden = true;
    if (consentTrigger) { consentTrigger.focus(); consentTrigger = null; }
  };

  let savedConsent = null;
  try { savedConsent = localStorage.getItem('semear_cookie_consent'); } catch (_) {}
  if (cookieBanner && !['accepted', 'rejected'].includes(savedConsent)) cookieBanner.hidden = false;
  if (savedConsent === 'accepted') setConsent(true);
  if (savedConsent === 'rejected') setConsent(false);
  if (cookieAccept) cookieAccept.addEventListener('click', () => setConsent(true));
  if (cookieReject) cookieReject.addEventListener('click', () => setConsent(false));

  const heroOptions = document.querySelector('.hero-photo-options');
  const heroPhoto = document.querySelector('#hero-photo');
  if (heroOptions && heroPhoto) {
    const media = heroPhoto.closest('.hero-media');
    const controls = media.querySelector('.hero-carousel-controls');
    const options = Array.from(heroOptions.querySelectorAll('button'));
    const pause = controls.querySelector('.hero-pause');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let paused = reduced.matches;
    let timer;
    let revision = 0;
    heroOptions.hidden = false;
    controls.hidden = false;
    // Preload the three small, optimized photographs for a smooth change.
    options.forEach(option => { const photo = new Image(); photo.src = option.dataset.photo; });
    const show = async (index) => {
      current = (index + options.length) % options.length;
      const selected = options[current];
      const version = ++revision;
      options.forEach(option => option.setAttribute('aria-pressed', String(option === selected)));
      controls.querySelector('.hero-count').textContent = `${current + 1} de ${options.length}`;
      if (!reduced.matches) {
        await heroPhoto.animate([{opacity: 1}, {opacity: 0}], {duration: 180, fill: 'forwards'}).finished;
      }
      if (version !== revision) return;
      heroPhoto.src = selected.dataset.photo;
      heroPhoto.alt = selected.dataset.alt;
      try { await heroPhoto.decode(); } catch (_) {}
      if (version !== revision) return;
      heroPhoto.getAnimations().forEach(animation => animation.cancel());
      if (!reduced.matches) heroPhoto.animate([{opacity: 0}, {opacity: 1}], {duration: 350});
    };
    const stop = () => clearInterval(timer);
    const start = () => {
      stop();
      pause.textContent = paused ? 'Reproduzir fotos' : 'Pausar fotos';
      if (!paused && !document.hidden && !media.matches(':hover') && !media.contains(document.activeElement)) {
        timer = setInterval(() => show(current + 1), 5000);
      }
    };
    options.forEach((option, index) => option.addEventListener('click', () => show(index)));
    controls.querySelector('.hero-prev').addEventListener('click', () => show(current - 1));
    controls.querySelector('.hero-next').addEventListener('click', () => show(current + 1));
    pause.addEventListener('click', () => { paused = !paused; start(); });
    media.addEventListener('mouseenter', stop);
    media.addEventListener('mouseleave', start);
    media.addEventListener('focusin', stop);
    media.addEventListener('focusout', () => setTimeout(start, 0));
    document.addEventListener('visibilitychange', start);
    reduced.addEventListener('change', () => { paused = reduced.matches; start(); });
    let touchX;
    heroPhoto.addEventListener('touchstart', event => { touchX = event.changedTouches[0].clientX; stop(); }, {passive: true});
    heroPhoto.addEventListener('touchend', event => {
      const delta = event.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 45) show(current + (delta < 0 ? 1 : -1));
      start();
    }, {passive: true});
    start();
  }

  const track = document.querySelector('.clinic-track');
  if (track) {
    const gallery = track.closest('.clinic-gallery');
    const slides = Array.from(track.children);
    const prev = gallery.querySelector('.gallery-prev');
    const next = gallery.querySelector('.gallery-next');
    const count = gallery.querySelector('.gallery-count');
    gallery.querySelector('.gallery-controls').hidden = false;
    const index = () => Math.round(track.scrollLeft / (track.clientWidth + 16));
    const update = () => {
      const current = Math.max(0, Math.min(slides.length - 1, index()));
      count.textContent = `${current + 1} de ${slides.length}`;
      prev.disabled = current === 0;
      next.disabled = current === slides.length - 1;
    };
    const move = (step) => track.scrollTo({
      left: Math.max(0, Math.min(slides.length - 1, index() + step)) * (track.clientWidth + 16),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
    prev.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    let frame;
    track.addEventListener('scroll', () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();
})();
