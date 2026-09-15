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

  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();
})();
