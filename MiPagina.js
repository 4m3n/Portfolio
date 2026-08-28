/* =============================================================================
   HAMEEM AFNAN — PORTFOLIO
   Intro, idioma ES/EN, navegación, apariciones al hacer scroll,
   barras animadas y fondo generativo en canvas.
   ============================================================================= */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* La clase 'js' ya la puso el <script> en línea del <head>; la reafirmamos
     por si este fichero se usa suelto en otra página. */
  document.documentElement.classList.add('js');

  /* ===========================================================================
     1. INTRO
     ======================================================================== */
  const gate = $('#gate');

  function closeGate() {
    if (!gate || gate.classList.contains('is-gone')) return;
    gate.classList.add('is-gone');
    setTimeout(() => gate.remove(), 800);
  }

  window.addEventListener('load', () => {
    setTimeout(closeGate, REDUCED ? 60 : 650);
  });
  /* Red de seguridad: la intro nunca debe bloquear la página. */
  setTimeout(closeGate, 2000);
  ['click', 'keydown', 'wheel', 'touchstart'].forEach((ev) =>
    window.addEventListener(ev, closeGate, { once: true, passive: true }));

  /* ===========================================================================
     2. IDIOMA — ES / EN
     ======================================================================== */
  const langBtn   = $('#langBtn');
  const langLabel = $('#langLabel');
  const i18nNodes = $$('[data-en]');

  /* Guardamos el español original la primera vez. */
  i18nNodes.forEach((el) => { el.dataset.es = el.textContent.trim(); });

  const META = {
    es: {
      title: 'Hameem Afnan — Desarrollador de Software · Madrid',
      menu:  'Abrir menú',
      top:   'Volver arriba',
      down:  'Bajar',
    },
    en: {
      title: 'Hameem Afnan — Software Developer · Madrid',
      menu:  'Open menu',
      top:   'Back to top',
      down:  'Scroll down',
    },
  };

  function applyLang(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    i18nNodes.forEach((el) => {
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.es;
    });
    if (langLabel) langLabel.textContent = lang.toUpperCase();
    document.title = META[lang].title;
    const menuBtn = $('#menuBtn');
    const toTop   = $('#toTop');
    const cue     = $('.scroll-cue');
    if (menuBtn) menuBtn.setAttribute('aria-label', META[lang].menu);
    if (toTop)   toTop.setAttribute('aria-label',   META[lang].top);
    if (cue)     cue.setAttribute('aria-label',     META[lang].down);
    try { localStorage.setItem('lang', lang); } catch (e) { /* modo privado */ }
  }

  let lang = 'es';
  try { lang = localStorage.getItem('lang') || 'es'; } catch (e) { /* noop */ }
  if (lang === 'en') applyLang('en'); else applyLang('es');

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      lang = document.documentElement.dataset.lang === 'es' ? 'en' : 'es';
      applyLang(lang);
    });
  }

  /* ===========================================================================
     3. BARRA SUPERIOR · MENÚ MÓVIL
     ======================================================================== */
  const topbar  = $('#topbar');
  const nav     = $('#nav');
  const menuBtn = $('#menuBtn');

  function setMenu(open) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  }
  $$('.nav__link').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ===========================================================================
     4. SCROLL — barra de progreso, estado de la topbar, volver arriba
     ======================================================================== */
  const bar   = $('#progressBar');
  const toTop = $('#toTop');
  let ticking = false;
  let maxScroll = 0;
  let winH = window.innerHeight;

  /* Medimos una sola vez por cambio de tamaño: leerlo en cada fotograma
     obligaba al navegador a recalcular la maquetación mientras se hace scroll. */
  function measure() {
    winH = window.innerHeight;
    maxScroll = document.documentElement.scrollHeight - winH;
  }

  function onScroll() {
    const y   = window.scrollY;
    const max = maxScroll;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (topbar) topbar.classList.toggle('is-stuck', y > 40);
    if (toTop)  toTop.classList.toggle('is-on', y > winH * 0.9);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  let measureTimer;
  window.addEventListener('resize', () => {
    clearTimeout(measureTimer);
    measureTimer = setTimeout(() => { measure(); onScroll(); }, 150);
  }, { passive: true });
  window.addEventListener('load', measure);
  measure();
  onScroll();

  /* ===========================================================================
     5. SCROLLSPY
     ======================================================================== */
  const links    = $$('.nav__link');
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) =>
          a.classList.toggle('is-current', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach((s) => spy.observe(s));
  }

  /* ===========================================================================
     6. APARICIONES + BARRAS
     ======================================================================== */
  function fillBars(root) {
    $$('.virtue, .skill', root).forEach((el) => {
      const fill = $('i', el);
      if (fill) fill.style.transform = `scaleX(${(+el.dataset.pct || 0) / 100})`;
    });
  }

  const revealables = $$('.reveal');

  if ('IntersectionObserver' in window && !REDUCED) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        fillBars(entry.target);
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    /* Escalonado suave dentro de cada rejilla. */
    revealables.forEach((el) => {
      const siblings = [...(el.parentElement ? el.parentElement.children : [])].filter((n) =>
        n.classList && n.classList.contains('reveal'));
      const i = Math.max(0, siblings.indexOf(el));
      el.style.transitionDelay = `${Math.min(i, 4) * 70}ms`;
      io.observe(el);
    });
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
    fillBars(document);
  }

  /* ===========================================================================
     8. AÑO EN EL PIE
     ======================================================================== */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ===========================================================================
     9. FONDO GENERATIVO — brasas doradas y una rueda heráldica lejana
     ======================================================================== */
  const canvas = $('#bg-canvas');

  if (canvas && !REDUCED) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let w = 0, h = 0, dpr = 1, motes = [], raf = null, t = 0;
    let wheelCv = null, wheelR = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildWheel();
      seed();
    }

    /* La rueda es estática: la rasterizamos una vez fuera de pantalla. */
    function buildWheel() {
      wheelR = Math.max(w, h) * 0.42;
      const size = Math.ceil(wheelR * 2 + 4);
      if (size <= 0) return;
      wheelCv = document.createElement('canvas');
      wheelCv.width = wheelCv.height = Math.floor(size * dpr);
      const c = wheelCv.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.translate(size / 2, size / 2);
      c.strokeStyle = 'rgba(244, 241, 232, 0.04)';
      c.lineWidth = 1;
      for (let i = 0; i < 24; i++) {
        const ang = (i / 24) * Math.PI * 2;
        c.beginPath();
        c.moveTo(Math.cos(ang) * wheelR * 0.28, Math.sin(ang) * wheelR * 0.28);
        c.lineTo(Math.cos(ang) * wheelR, Math.sin(ang) * wheelR);
        c.stroke();
      }
      [0.34, 0.62, 0.9].forEach((k) => {
        c.beginPath();
        c.arc(0, 0, wheelR * k, 0, Math.PI * 2);
        c.stroke();
      });
    }

    function seed() {
      const count = Math.round(Math.min(48, Math.max(18, (w * h) / 34000)));
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.4,
        vy: -(Math.random() * 0.22 + 0.05),
        vx: (Math.random() - 0.5) * 0.14,
        a: Math.random() * 0.45 + 0.12,
        phase: Math.random() * Math.PI * 2,
        tint: Math.random(),
      }));
    }

    /* Rueda tenue girando despacio: sólo se rota el mapa de bits ya pintado. */
    function wheel() {
      if (!wheelCv) return;
      const size = wheelCv.width / dpr;
      ctx.save();
      ctx.translate(w * 0.5, h * 0.32);
      ctx.rotate(t * 0.00006);
      ctx.drawImage(wheelCv, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    function frame() {
      t += 1;
      ctx.clearRect(0, 0, w, h);
      wheel();

      motes.forEach((m) => {
        m.y += m.vy;
        m.x += m.vx + Math.sin((t + m.phase * 60) * 0.004) * 0.16;
        if (m.y < -12) { m.y = h + 12; m.x = Math.random() * w; }
        if (m.x < -12) m.x = w + 12;
        if (m.x > w + 12) m.x = -12;

        const twinkle = 0.65 + Math.sin((t * 0.02) + m.phase) * 0.35;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = m.tint > 0.82
          ? `rgba(224, 35, 79, ${m.a * twinkle * 0.9})`
          : m.tint > 0.68
            ? `rgba(51, 212, 196, ${m.a * twinkle * 0.8})`
            : `rgba(244, 241, 232, ${m.a * twinkle * 0.7})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(frame);
    }

    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(resize, 180);
    });

    /* Pausamos el bucle cuando la pestaña no está visible. */
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
      else if (!raf) raf = requestAnimationFrame(frame);
    });

    resize();
    raf = requestAnimationFrame(frame);
  }
})();
