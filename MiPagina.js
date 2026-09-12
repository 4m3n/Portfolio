(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.add('js');

  const wipe = $('#wipe');
  const SNAP = 'cubic-bezier(0.7, 0, 0.2, 1)';
  const SKEW = 'skewX(-18deg)';
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  let wiping = null;

  const play = (el, frames, opts) =>
    el.animate(frames, Object.assign({ fill: 'forwards' }, opts)).finished;

  function runWipe(card, onCovered, hold = 0) {
    if (!wipe || !wipe.animate || REDUCED) { onCovered(); return Promise.resolve(); }

    const bands = $$('.wipe__band', wipe);
    const box   = $('.wipe__card', wipe);
    const num   = $('.wipe__num', wipe);
    const title = $('.wipe__title .stripe', wipe);
    const flav  = $('.wipe__flavor', wipe);
    num.textContent   = card.num;
    title.textContent = card.title;
    flav.textContent  = card.flavor;

    let release = () => {};
    let covered = false;
    wiping = new Promise((r) => { release = r; });
    wipe.hidden = false;

    const T = 280, GAP = 50;
    const cardAt  = T + GAP - 40;
    const readyAt = cardAt + 60 + 240 + 180;
    const t0 = performance.now();

    const cover = Promise.all(bands.map((b, i) => play(b,
      [{ transform: `translateX(-100%) ${SKEW}` }, { transform: `translateX(0) ${SKEW}` }],
      { duration: T, delay: i * GAP, easing: SNAP })));

    play(box, [{ opacity: 0 }, { opacity: 1 }], { duration: 100, delay: cardAt });
    play(num, [
      { opacity: 0, transform: 'scale(1.9) rotate(-12deg)' },
      { opacity: 1, transform: 'scale(0.94) rotate(1.5deg)', offset: 0.7 },
      { opacity: 1, transform: 'none' },
    ], { duration: 340, delay: cardAt, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' });
    play(flav, [{ opacity: 0, transform: 'translateX(40px)' }, { opacity: 1, transform: 'none' }],
      { duration: 300, delay: cardAt + 30, easing: SNAP });
    play(title, [{ clipPath: 'inset(-30% 100% -30% -30%)' }, { clipPath: 'inset(-30% -30% -30% -30%)' }],
      { duration: 240, delay: cardAt + 60, easing: SNAP });
    play($('.wipe__ring', wipe), [{ transform: 'rotate(-50deg)' }, { transform: 'rotate(30deg)' }],
      { duration: 1400, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' });

    const finish = () => {
      wipe.hidden = true;
      wipe.getAnimations({ subtree: true }).forEach((a) => a.cancel());
      release();
      wiping = null;
    };

    return cover
      .then(() => { covered = true; onCovered(); return wait(Math.max(hold, readyAt - (performance.now() - t0))); })
      .then(() => {
        release();
        const out = [...bands].reverse().map((b, i) => play(b,
          [{ transform: `translateX(0) ${SKEW}` }, { transform: `translateX(100%) ${SKEW}` }],
          { duration: T, delay: i * GAP, easing: SNAP }));
        out.push(play(box,
          [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(12vw) skewX(-10deg)' }],
          { duration: 240, easing: 'cubic-bezier(0.6, 0, 0.9, 0.4)' }));
        return Promise.all(out);
      })
      .then(finish, () => { if (!covered) onCovered(); finish(); });
  }

  function cardFor(sec) {
    const en = document.documentElement.dataset.lang === 'en';
    const head = $('.sec-head', sec);
    if (!head) return { num: 'H', title: en ? 'Home' : 'Inicio', flavor: en ? 'THE PROLOGUE' : 'EL PRÓLOGO' };
    const txt = (sel) => { const n = $(sel, head); return n ? n.textContent.trim() : ''; };
    return { num: txt('.sec-head__num'), title: txt('.sec-head__title'), flavor: txt('.sec-head__flavor') };
  }

  function jumpTo(el) {
    const root = document.documentElement;
    root.style.scrollBehavior = 'auto';
    el.scrollIntoView({ block: 'start' });
    root.style.scrollBehavior = '';
  }

  document.addEventListener('click', (e) => {
    if (REDUCED || e.defaultPrevented || e.button !== 0 ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('skip')) return;
    const hash = a.getAttribute('href');
    const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
    if (!target) return;

    e.preventDefault();
    if (wiping) return;

    runWipe(cardFor(target), () => {
      jumpTo(target);
      if (location.hash !== hash) history.pushState(null, '', hash);
    }).then(() => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  const gate = $('#gate');
  const heroReveals = $$('.hero .reveal');

  function openHero() {
    heroReveals.forEach((el, i) => {
      el.style.setProperty('--d', `${120 + i * 75}ms`);
      el.classList.add('is-in');
    });
  }

  function closeGate() {
    if (!gate) { openHero(); return; }
    if (gate.classList.contains('is-gone')) return;
    gate.style.setProperty('--slash', `${Math.atan2(-0.28 * window.innerHeight, window.innerWidth)}rad`);
    gate.classList.add('is-gone');
    openHero();
    setTimeout(() => gate.remove(), 1100);
  }

  window.addEventListener('load', () => {
    setTimeout(closeGate, REDUCED ? 60 : 550);
  });
  setTimeout(closeGate, 2000);
  ['click', 'keydown', 'wheel', 'touchstart'].forEach((ev) =>
    window.addEventListener(ev, closeGate, { once: true, passive: true }));

  const THEMES = [
    { id: 'tinta',     es: 'Tinta',       en: 'Ink',          sw: ['#14120f', '#e0234f', '#33d4c4'] },
    { id: 'vitela',    es: 'Vitela',      en: 'Vellum',       sw: ['#efe5cf', '#b83a1e', '#1f4e9a'] },
    { id: 'lapis',     es: 'Lapislázuli', en: 'Lapis lazuli', sw: ['#0e1430', '#e2ac3f', '#ec6a45'] },
    { id: 'verdaccio', es: 'Verdaccio',   en: 'Verdaccio',    sw: ['#151811', '#c2502f', '#86b995'] },
  ];
  const themeBtn = $('#themeBtn');
  const metaTheme = $('meta[name="theme-color"]');
  const themeIndex = () =>
    Math.max(0, THEMES.findIndex((t) => t.id === (document.documentElement.dataset.theme || 'tinta')));
  const nextTheme = () => THEMES[(themeIndex() + 1) % THEMES.length];

  function syncMeta() {
    const c = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
    if (metaTheme && c) metaTheme.setAttribute('content', c);
  }

  function labelTheme() {
    if (!themeBtn) return;
    const en = document.documentElement.dataset.lang === 'en';
    const now = THEMES[themeIndex()];
    const nx = nextTheme();
    const label = en
      ? `Colour palette: ${now.en}. Switch to ${nx.en}`
      : `Paleta de color: ${now.es}. Cambiar a ${nx.es}`;
    themeBtn.setAttribute('aria-label', label);
    themeBtn.setAttribute('title', label);
    nx.sw.forEach((c, i) => themeBtn.style.setProperty(`--sw${i + 1}`, c));
  }

  function applyTheme(id) {
    const root = document.documentElement;
    if (id === 'tinta') root.removeAttribute('data-theme');
    else root.dataset.theme = id;
    try { localStorage.setItem('theme', id); } catch (e) {}
    syncMeta();
    labelTheme();
    document.dispatchEvent(new CustomEvent('themechange'));
  }

  const rand = (a, b) => a + Math.random() * (b - a);

  function paintBrushSheet() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const k = Math.sqrt(170000 / (vw * vh));
    const W = Math.max(120, Math.round(vw * k));
    const H = Math.max(120, Math.round(vh * k));
    const N = 36, COLS = 6, ROWS = 6;

    const work = document.createElement('canvas');
    work.width = W; work.height = H;
    const g = work.getContext('2d');
    const sheet = document.createElement('canvas');
    sheet.width = W * COLS; sheet.height = H * ROWS;
    const s = sheet.getContext('2d');
    if ('filter' in s) s.filter = 'blur(0.8px)';

    const K = 6;
    const strokes = Array.from({ length: K }, (_, i) => {
      const ltr = i % 2 === 0;
      const yc = ((i + 0.5) / K) * H + rand(-0.03, 0.03) * H;
      const tilt = rand(-0.14, 0.06) * H;
      const x0 = ltr ? -0.12 * W : 1.12 * W;
      const x1 = ltr ? 1.12 * W : -0.12 * W;
      const y0 = yc - tilt / 2;
      const y1 = yc + tilt / 2;
      return {
        p: [x0, y0,
            x0 + (x1 - x0) * 0.33, y0 + rand(-0.07, 0.07) * H,
            x0 + (x1 - x0) * 0.66, y1 + rand(-0.07, 0.07) * H,
            x1, y1],
        w: (H / K) * rand(1.75, 2.15),
        start: i * 0.085,
        dur: rand(0.34, 0.42),
        done: 0,
        seed: rand(0, 100),
        bristles: Array.from({ length: 18 }, () => ({
          off: rand(-0.5, 0.5), size: rand(0.6, 1.4), ink: rand(0.55, 1), dry: rand(0.55, 0.95),
        })),
      };
    });

    const bez = (p, u) => {
      const v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
      return [a * p[0] + b * p[2] + c * p[4] + d * p[6], a * p[1] + b * p[3] + c * p[5] + d * p[7]];
    };
    const tangent = (p, u) => {
      const v = 1 - u;
      const x = 3 * v * v * (p[2] - p[0]) + 6 * v * u * (p[4] - p[2]) + 3 * u * u * (p[6] - p[4]);
      const y = 3 * v * v * (p[3] - p[1]) + 6 * v * u * (p[5] - p[3]) + 3 * u * u * (p[7] - p[5]);
      const l = Math.hypot(x, y) || 1;
      return [x / l, y / l];
    };

    function paint(st, u0, u1) {
      const len = Math.abs(st.p[6] - st.p[0]) * 1.05;
      const n = Math.max(1, Math.ceil(((u1 - u0) * len) / 1.8));
      const r0 = (st.w / st.bristles.length) * 1.25;
      for (let j = 1; j <= n; j++) {
        const u = u0 + (u1 - u0) * (j / n);
        const [x, y] = bez(st.p, u);
        const [tx, ty] = tangent(st.p, u);
        const nx = -ty, ny = tx;
        const pr = Math.min(1, u / 0.05)
          * (u > 0.82 ? 1 - ((u - 0.82) / 0.18) * 0.55 : 1)
          * (0.92 + 0.08 * Math.sin(u * 23 + st.seed));
        const half = st.w * 0.5 * pr;

        g.fillStyle = '#000';
        st.bristles.forEach((b) => {
          const load = b.ink * (u < b.dry ? 1 : Math.max(0, 1 - (u - b.dry) / (1.02 - b.dry)));
          if (load <= 0.02) return;
          g.globalAlpha = 0.11 * load;
          g.beginPath();
          g.arc(x + nx * b.off * half * 2, y + ny * b.off * half * 2,
            r0 * b.size * (0.6 + 0.4 * pr), 0, Math.PI * 2);
          g.fill();
        });

        if (Math.random() < 0.012) {
          const bx = x + nx * rand(-half, half), by = y + ny * rand(-half, half);
          const R = st.w * rand(0.35, 0.7);
          const pool = g.createRadialGradient(bx, by, 0, bx, by, R);
          pool.addColorStop(0, 'rgba(0,0,0,0.35)');
          pool.addColorStop(0.7, 'rgba(0,0,0,0.12)');
          pool.addColorStop(1, 'rgba(0,0,0,0)');
          g.globalAlpha = 1;
          g.fillStyle = pool;
          g.beginPath(); g.arc(bx, by, R, 0, Math.PI * 2); g.fill();
          g.fillStyle = '#000';
        }
        if (Math.random() < 0.02) {
          g.globalAlpha = rand(0.4, 0.8);
          g.beginPath();
          g.arc(x + nx * rand(-1.4, 1.4) * half, y + ny * rand(-1.4, 1.4) * half,
            rand(0.6, 2.2), 0, Math.PI * 2);
          g.fill();
        }
      }
    }

    const PAINT_END = 0.84;
    for (let f = 0; f < N; f++) {
      const t = f / (N - 1);
      strokes.forEach((st) => {
        const u = Math.min(1, Math.max(0, (t - st.start) / st.dur));
        if (u > st.done) { paint(st, st.done, u); st.done = u; }
      });
      if (t > PAINT_END) {
        g.globalAlpha = t >= 1 ? 1 : 0.18 + (t - PAINT_END) * 1.4;
        g.fillStyle = '#000';
        g.fillRect(0, 0, W, H);
      }
      s.drawImage(work, (f % COLS) * W, Math.floor(f / COLS) * H);
    }

    return new Promise((resolve) => sheet.toBlob((blob) => {
      if (!blob) { resolve(null); return; }
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.src = url;
      const ready = img.decode ? img.decode() : Promise.resolve();
      ready.catch(() => {}).then(() => resolve({ url, vw, vh, N, COLS, ROWS }));
    }, 'image/png'));
  }

  function brushCss(sh) {
    const { url, N, COLS, ROWS } = sh;
    let kf = '';
    for (let f = 0; f < N; f++) {
      const x = ((f % COLS) / (COLS - 1)) * 100;
      const y = (Math.floor(f / COLS) / (ROWS - 1)) * 100;
      kf += `${((f / (N - 1)) * 100).toFixed(3)}%{-webkit-mask-position:${x}% ${y}%;mask-position:${x}% ${y}%}`;
    }
    const size = `${COLS * 100}% ${ROWS * 100}%`;
    return `@keyframes brush-reveal{${kf}}
::view-transition-new(root){
  -webkit-mask-image:url(${url});mask-image:url(${url});
  -webkit-mask-size:${size};mask-size:${size};
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
  animation:brush-reveal 1.6s step-end both;
}`;
  }

  let sheetJob = null;
  function prepSheet() {
    sheetJob = new Promise((resolve) => {
      const go = () => resolve(paintBrushSheet());
      if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 1500 });
      else setTimeout(go, 200);
    });
    return sheetJob;
  }

  const canPaint = !REDUCED && typeof document.startViewTransition === 'function';
  let painting = false;

  async function switchTheme() {
    if (painting || wiping) return;
    const next = nextTheme();
    const en = document.documentElement.dataset.lang === 'en';
    const announce = () => say(en ? `Palette: ${next.en}` : `Paleta: ${next.es}`);

    if (!canPaint) { applyTheme(next.id); announce(); return; }

    painting = true;
    let sh = await (sheetJob || prepSheet());
    if (!sh || sh.vw !== window.innerWidth || sh.vh !== window.innerHeight) {
      if (sh) URL.revokeObjectURL(sh.url);
      sh = await paintBrushSheet();
    }
    sheetJob = null;
    if (!sh) { applyTheme(next.id); announce(); painting = false; return; }

    const style = document.createElement('style');
    style.textContent = brushCss(sh);
    document.head.appendChild(style);

    const root = document.documentElement;
    const vt = document.startViewTransition(() => {
      root.classList.add('theme-switching');
      applyTheme(next.id);
    });
    vt.ready.catch(() => {});
    vt.finished.catch(() => {}).then(() => {
      root.classList.remove('theme-switching');
      style.remove();
      URL.revokeObjectURL(sh.url);
      painting = false;
      announce();
      prepSheet();
    });
  }

  syncMeta();
  if (themeBtn) themeBtn.addEventListener('click', switchTheme);
  if (canPaint) window.addEventListener('load', () => setTimeout(prepSheet, 1800));

  const langBtn   = $('#langBtn');
  const langLabel = $('#langLabel');
  const i18nNodes = $$('[data-en]');

  i18nNodes.forEach((el) => { el.dataset.es = el.textContent.trim(); });

  const META = {
    es: {
      title: 'Hameem Afnan | Desarrollador de Software · Madrid',
      desc:  'Hameem Afnan Akther Faroquee, desarrollador de software en Madrid. 10 meses integrando ERP Odoo, APIs RESTful y bases de datos en producción (Tailored Spain). Portfolio, proyectos y CV.',
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
      title: 'Hameem Afnan | Software Developer · Madrid',
      desc:  'Hameem Afnan Akther Faroquee, software developer in Madrid. Ten months integrating Odoo ERP, RESTful APIs and databases in production (Tailored Spain). Portfolio, projects and CV.',
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
    labelTheme();
    try { localStorage.setItem('lang', lang); } catch (e) {}
  }

  let lang = 'es';
  try { lang = localStorage.getItem('lang') || 'es'; } catch (e) {}
  if (lang === 'en') applyLang('en'); else applyLang('es');

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      if (wiping) return;
      lang = document.documentElement.dataset.lang === 'es' ? 'en' : 'es';
      const next = lang;
      runWipe({
        num: next.toUpperCase(),
        title: next === 'en' ? 'English' : 'Español',
        flavor: next === 'en' ? 'LANGUAGE' : 'IDIOMA',
      }, () => applyLang(next));
    });
  }

  const topbar  = $('#topbar');
  const nav     = $('#nav');
  const menuBtn = $('#menuBtn');
  const scrim   = $('#scrim');
  const isOpen  = () => !!nav && nav.classList.contains('is-open');

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

    const stops = [...$$('.nav__link', nav), $('#themeBtn'), $('#langBtn'), menuBtn].filter(Boolean);
    if (!stops.length) return;
    const first = stops[0];
    const last  = stops[stops.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  const wide = window.matchMedia('(min-width: 881px)');
  const onWide = (e) => { if (e.matches) setMenu(false); };
  if (wide.addEventListener) wide.addEventListener('change', onWide);
  else if (wide.addListener) wide.addListener(onWide);

  const bar   = $('#progressBar');
  const toTop = $('#toTop');
  let ticking = false;
  let maxScroll = 0;
  let winH = window.innerHeight;

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
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { measure(); onScroll(); }).catch(() => {});
  }
  measure();
  onScroll();

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
          if (here) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach((s) => spy.observe(s));
  }

  function fillBars(root) {
    $$('.virtue, .skill', root).forEach((el) => {
      const fill = $('i', el);
      if (fill) fill.style.transform = `scaleX(${(+el.dataset.pct || 0) / 100})`;
    });
  }

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
  const show = (el) => { el.classList.add('is-in'); fillBars(el); };

  if ('IntersectionObserver' in window && !REDUCED) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        if (wiping) wiping.then(() => show(entry.target));
        else show(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    revealables.forEach((el) => {
      if (heroReveals.includes(el)) return;
      const siblings = [...(el.parentElement ? el.parentElement.children : [])].filter((n) =>
        n.classList && n.classList.contains('reveal'));
      const i = Math.max(0, siblings.indexOf(el));
      el.style.setProperty('--d', `${Math.min(i, 4) * 70}ms`);
      io.observe(el);
    });
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
    fillBars(document);
  }

  const toast = $('#toast');
  let toastTimer;

  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2200);
  }

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
        say(`${META[l].copied}: ${text}`);
        btn.classList.add('is-done');
        setTimeout(() => btn.classList.remove('is-done'), 1600);
      } else {
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

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  const canvas = $('#bg-canvas');

  if (canvas && !REDUCED) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let w = 0, h = 0, dpr = 1, motes = [], raf = null, t = 0;
    let wheelCv = null, wheelR = 0;

    let tint = null;
    function readTint() {
      const cs = getComputedStyle(document.documentElement);
      const rgb = (name, fallback) =>
        (cs.getPropertyValue(name).trim() || fallback).split(/[\s,]+/).join(', ');
      tint = {
        paper: rgb('--paper-rgb', '244 241 232'),
        rose:  rgb('--rose-rgb', '224 35 79'),
        aqua:  rgb('--aqua-rgb', '51 212 196'),
        k:     parseFloat(cs.getPropertyValue('--motes')) || 1,
      };
    }
    readTint();

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

    function buildWheel() {
      wheelR = Math.max(w, h) * 0.42;
      const size = Math.ceil(wheelR * 2 + 4);
      if (size <= 0) return;
      wheelCv = document.createElement('canvas');
      wheelCv.width = wheelCv.height = Math.floor(size * dpr);
      const c = wheelCv.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.translate(size / 2, size / 2);
      c.strokeStyle = `rgba(${tint.paper}, 0.04)`;
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
        const a = m.a * twinkle * tint.k;
        ctx.fillStyle = m.tint > 0.82
          ? `rgba(${tint.rose}, ${a * 0.9})`
          : m.tint > 0.68
            ? `rgba(${tint.aqua}, ${a * 0.8})`
            : `rgba(${tint.paper}, ${a * 0.7})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(frame);
    }

    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(resize, 180);
    });

    document.addEventListener('themechange', () => { readTint(); buildWheel(); });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
      else if (!raf) raf = requestAnimationFrame(frame);
    });

    resize();
    raf = requestAnimationFrame(frame);
  }
})();
