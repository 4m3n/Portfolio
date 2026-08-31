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
      desc:  'Hameem Afnan Akther Faroquee — Desarrollador de Software en Madrid. 10 meses integrando ERP Odoo, APIs RESTful y bases de datos en producción (Tailored Spain). Portfolio, proyectos y CV.',
      og:    '10 meses integrando ERP Odoo y APIs RESTful en producción. Desarrollo multiplataforma. Madrid, España.',
      loc:   'es_ES',
      menu:  'Abrir menú',
      close: 'Cerrar menú',
      top:   'Volver arriba',
      down:  'Bajar',
      lang:  'Cambiar a inglés / Switch to English',
      skip:  'Ir al contenido',
      copied:'Copiado al portapapeles',
    },
    en: {
      title: 'Hameem Afnan — Software Developer · Madrid',
      desc:  'Hameem Afnan Akther Faroquee — Software Developer in Madrid. Ten months integrating Odoo ERP, RESTful APIs and databases in production (Tailored Spain). Portfolio, projects and CV.',
      og:    'Ten months integrating Odoo ERP and RESTful APIs in production. Multi-platform development. Madrid, Spain.',
      loc:   'en_GB',
      menu:  'Open menu',
      close: 'Close menu',
      top:   'Back to top',
      down:  'Scroll down',
      lang:  'Cambiar a español / Switch to Spanish',
      skip:  'Skip to content',
      copied:'Copied to clipboard',
    },
  };

  const setAttr = (sel, attr, val) => { const n = $(sel); if (n) n.setAttribute(attr, val); };

  function applyLang(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    i18nNodes.forEach((el) => {
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.es;
    });
    if (langLabel) langLabel.textContent = lang.toUpperCase();

    /* El <title> y las descripciones también son contenido: si no se
       traducen, lo que se comparte en LinkedIn sigue saliendo en español. */
    document.title = META[lang].title;
    setAttr('meta[name="description"]',        'content', META[lang].desc);
    setAttr('meta[property="og:description"]', 'content', META[lang].og);
    setAttr('meta[property="og:title"]',       'content', META[lang].title);
    setAttr('meta[property="og:locale"]',      'content', META[lang].loc);

    const btn = $('#menuBtn');
    if (btn) btn.setAttribute('aria-label', btn.getAttribute('aria-expanded') === 'true' ? META[lang].close : META[lang].menu);
    setAttr('#toTop',      'aria-label', META[lang].top);
    setAttr('.scroll-cue', 'aria-label', META[lang].down);
    setAttr('#langBtn',    'aria-label', META[lang].lang);
    const skip = $('.skip');
    if (skip) skip.textContent = META[lang].skip;

    labelBars();
    relabelCopies();
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
  const scrim   = $('#scrim');
  const isOpen  = () => !!nav && nav.classList.contains('is-open');

  /* Quién tenía el foco antes de abrir, para devolvérselo al cerrar. */
  let lastFocused = null;

  function setMenu(open) {
    if (!nav || !menuBtn) return;
    if (open === isOpen()) return;

    if (open) lastFocused = document.activeElement;

    nav.classList.toggle('is-open', open);
    if (scrim) scrim.classList.toggle('is-on', open);
    menuBtn.setAttribute('aria-expanded', String(open));

    const l = document.documentElement.dataset.lang === 'en' ? 'en' : 'es';
    menuBtn.setAttribute('aria-label', open ? META[l].close : META[l].menu);

    /* El panel es un diálogo de hecho: fuera de él no hay nada que leer.
       'inert' saca el fondo del árbol de accesibilidad además de bloquear el
       ratón; donde no exista, la trampa de foco ya cubre lo esencial. */
    document.body.style.overflow = open ? 'hidden' : '';
    document.documentElement.classList.toggle('menu-open', open);
    ['main', '.foot'].forEach((sel) => {
      const n = $(sel);
      if (n && 'inert' in n) n.inert = open;
    });

    if (open) {
      const first = $('.nav__link', nav);
      if (first) first.focus({ preventScroll: true });
    } else {
      const back = (lastFocused && document.contains(lastFocused) && lastFocused !== document.body)
        ? lastFocused : menuBtn;
      if (back) back.focus({ preventScroll: true });
      lastFocused = null;
    }
  }

  if (menuBtn) menuBtn.addEventListener('click', () => setMenu(!isOpen()));
  if (scrim)   scrim.addEventListener('click', () => setMenu(false));
  $$('.nav__link').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { setMenu(false); return; }
    if (e.key !== 'Tab' || !isOpen()) return;

    /* Trampa de foco: con el panel abierto, el tabulador no debe escaparse
       hacia el contenido que hay detrás y que además está oculto. */
    const stops = [...$$('.nav__link', nav), $('#langBtn'), menuBtn].filter(Boolean);
    if (!stops.length) return;
    const first = stops[0];
    const last  = stops[stops.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* Al pasar a escritorio el panel deja de existir: si quedó abierto,
     el body se habría quedado bloqueado sin nada visible que lo explique. */
  const wide = window.matchMedia('(min-width: 881px)');
  const onWide = (e) => { if (e.matches) setMenu(false); };
  if (wide.addEventListener) wide.addEventListener('change', onWide);
  else if (wide.addListener) wide.addListener(onWide);

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
  /* Las tipografías web llegan tarde y reflujan la página: si no volvemos a
     medir, la barra de progreso se queda corta o se llena antes de tiempo. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { measure(); onScroll(); }).catch(() => {});
  }
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
        links.forEach((a) => {
          const here = a.getAttribute('href') === `#${entry.target.id}`;
          a.classList.toggle('is-current', here);
          /* Un lector de pantalla no ve el subrayado: necesita el atributo. */
          if (here) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
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

  /* Las barras son puro decorado en el DOM: sin esto, un lector de pantalla
     lee "Java" y se queda sin el dato, que es justo la mitad del mensaje. */
  function labelBars() {
    const en = document.documentElement.dataset.lang === 'en';
    $$('.virtue, .skill').forEach((el) => {
      const pct  = +el.dataset.pct || 0;
      const name = ($('.skill__n', el) || $('.virtue__name', el) || {}).textContent || '';
      const track = $('.skill__track', el) || $('.virtue__track', el);
      if (!track) return;
      track.setAttribute('role', 'img');
      track.setAttribute('aria-label',
        en ? `${name.trim()}: ${pct} out of 100` : `${name.trim()}: ${pct} sobre 100`);
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
     7. COPIAR AL PORTAPAPELES
     Un mailto: no siempre abre nada útil; poder copiar el dato de un toque
     es la diferencia entre que te escriban y que no.
     ======================================================================== */
  const toast = $('#toast');
  let toastTimer;

  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2200);
  }

  /* Reserva para contextos sin navigator.clipboard (http, navegadores viejos). */
  function legacyCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  function relabelCopies() {
    const en = document.documentElement.dataset.lang === 'en';
    $$('.copy').forEach((b) => {
      b.setAttribute('aria-label', (en ? b.dataset.labelEn : b.dataset.labelEs) || 'Copy');
      b.setAttribute('title', b.getAttribute('aria-label'));
    });
  }

  $$('.copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy || '';
      const l = document.documentElement.dataset.lang === 'en' ? 'en' : 'es';
      let ok = false;

      if (navigator.clipboard && window.isSecureContext) {
        try { await navigator.clipboard.writeText(text); ok = true; } catch (e) { ok = false; }
      }
      if (!ok) ok = legacyCopy(text);

      if (ok) {
        say(`${META[l].copied} — ${text}`);
        btn.classList.add('is-done');
        setTimeout(() => btn.classList.remove('is-done'), 1600);
      } else {
        /* Dejamos el dato seleccionado en la propia tarjeta: Ctrl+C sigue
           funcionando aunque el navegador nos niegue el portapapeles. */
        const val = $('.ccard__v', btn.closest('.ccard'));
        if (val && window.getSelection) {
          const r = document.createRange();
          r.selectNodeContents(val);
          const s = window.getSelection();
          s.removeAllRanges(); s.addRange(r);
        }
        say(text);
      }
    });
  });

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
