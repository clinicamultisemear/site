/* Clínica Semear - main.js (estável)
   Mantém tudo funcionando sem depender de frameworks.
*/

(function () {
  "use strict";

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const on = (el, evt, cb) => el && el.addEventListener(evt, cb);

  // ----- Mobile menu -----
  function initMobileMenu() {
    const btn = $("#hamburger");
    const menu = $("#mobileMenu");
    if (!btn || !menu) return;

    const setOpen = (open) => {
      menu.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    };

    on(btn, "click", () => setOpen(!menu.classList.contains("open")));
    $$('a[href^="#"]', menu).forEach(a => on(a, "click", () => setOpen(false)));
    on(document, "keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  // ----- Hero slider (single <img>) -----
  function initHeroSlider() {
    const img = $("#hero-slider-img");
    if (!img) return;

    const prev = $(".hero-slider-prev");
    const next = $(".hero-slider-next");
    const dotsWrap = $(".hero-slider-dots");

    const total = 8; // hero-1.jpg ... hero-8.jpg
    let idx = 1;
    let timer = null;

    function setActiveDot() {
      if (!dotsWrap) return;
      $$("button", dotsWrap).forEach((b, i) => b.classList.toggle("active", i + 1 === idx));
    }

    function show(n) {
      idx = ((n - 1 + total) % total) + 1;
      img.src = `hero-${idx}.jpg`;
      img.alt = `Clínica Semear - foto ${idx}`;
      setActiveDot();
    }

    function start() {
      stop();
      timer = setInterval(() => show(idx + 1), 4500);
    }
    function stop() { if (timer) clearInterval(timer); timer = null; }

    // Build dots once
    if (dotsWrap && !dotsWrap.children.length) {
      for (let i = 1; i <= total; i++) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "hero-dot";
        b.setAttribute("aria-label", `Foto ${i}`);
        b.addEventListener("click", () => { show(i); start(); });
        dotsWrap.appendChild(b);
      }
    }

    on(prev, "click", () => { show(idx - 1); start(); });
    on(next, "click", () => { show(idx + 1); start(); });

    // Pause on hover
    const slider = $(".hero-slider");
    on(slider, "mouseenter", stop);
    on(slider, "mouseleave", start);

    // Touch swipe
    if (slider) {
      let x0 = null;
      slider.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      slider.addEventListener("touchend", (e) => {
        if (x0 == null) return;
        const x1 = e.changedTouches[0].clientX;
        const dx = x1 - x0;
        if (Math.abs(dx) > 40) show(dx > 0 ? idx - 1 : idx + 1);
        x0 = null;
        start();
      }, { passive: true });
    }

    show(1);
    start();
  }

  // ----- Testimonials (grid) -----
  function renderTestimonials() {
    const grid = $("#testimonials-grid");
    if (!grid) return;

    const list = window.testimonials || [];
    // fallback content if data missing
    if (!Array.isArray(list) || list.length === 0) return;

    grid.innerHTML = "";
    list.forEach((t) => {
      const card = document.createElement("article");
      card.className = "testimonial";
      const initial = (t.name || "P").trim().charAt(0).toUpperCase();
      card.innerHTML = `
        <div class="testimonial-stars" aria-label="5 estrelas">${"★".repeat(5)}</div>
        <p class="testimonial-quote">“${t.text || ""}”</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">${initial}</div>
          <div class="testimonial-meta">
            <div class="testimonial-name">${t.name || ""}</div>
            <div class="testimonial-sub">${t.role || ""}</div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // ----- FAQ (accordion) -----
  function renderFAQ() {
    const container = $("#faq-container");
    if (!container) return;

    const list = window.faqs || [];
    if (!Array.isArray(list) || list.length === 0) return;

    container.innerHTML = "";
    list.forEach((f, i) => {
      const item = document.createElement("div");
      item.className = "faq-item";
      item.innerHTML = `
        <button class="faq-question" type="button" aria-expanded="false" aria-controls="faq-a-${i}">
          <span>${f.question || ""}</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </button>
        <div class="faq-answer" id="faq-a-${i}" hidden>
          <p>${f.answer || ""}</p>
        </div>
      `;
      container.appendChild(item);
    });

    $$(".faq-question", container).forEach((btn) => {
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";

        // close all
        $$(".faq-question", container).forEach((b) => {
          b.setAttribute("aria-expanded", "false");
          const panel = document.getElementById(b.getAttribute("aria-controls"));
          if (panel) panel.hidden = true;
          const icon = $(".faq-icon", b);
          if (icon) icon.textContent = "+";
        });

        // toggle current
        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
        const panel = document.getElementById(btn.getAttribute("aria-controls"));
        if (panel) panel.hidden = expanded ? true : false;
        const icon = $(".faq-icon", btn);
        if (icon) icon.textContent = expanded ? "+" : "–";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initHeroSlider();
    renderTestimonials();
    renderFAQ();
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  });
})();
