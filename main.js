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
    heroOptions.hidden = false;
    heroOptions.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        heroPhoto.src = button.dataset.photo;
        heroPhoto.alt = button.dataset.alt;
        heroOptions.querySelectorAll('button').forEach((option) => {
          option.setAttribute('aria-pressed', String(option === button));
        });
      });
    });
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
