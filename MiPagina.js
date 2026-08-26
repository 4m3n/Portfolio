document.addEventListener('DOMContentLoaded', () => {

  // =====================================================
  // PERSONA 5 INTRO + MENU LOGIC
  // =====================================================
  const p5Intro      = document.getElementById('p5-intro');
  const p5MenuScreen = document.getElementById('p5-menu-screen');
  let introActive    = true;
  let menuActive     = false;

  function triggerTransition() {
    if (!introActive) return;
    introActive = false;

    p5Intro.classList.add('p5-transitioning');

    setTimeout(() => {
      p5Intro.classList.add('p5-done');
      p5MenuScreen.classList.add('p5-menu-visible');
      menuActive = true;
    }, 460);

    setTimeout(() => {
      p5Intro.style.display = 'none';
    }, 720);
  }

  // Any key or tap on intro triggers transition
  document.addEventListener('keydown', (e) => {
    if (introActive) { triggerTransition(); return; }
    if (menuActive)    handleMenuKey(e);
  });

  p5Intro.addEventListener('click', triggerTransition);
  p5Intro.addEventListener('touchstart', (e) => {
    e.preventDefault();
    triggerTransition();
  }, { passive: false });

  // ----- Menu navigation -----
  const menuItems = [...document.querySelectorAll('#p5-menu-screen .p5-menu-item')];
  let activeIdx = 0;

  function setActive(idx) {
    menuItems.forEach(el => el.classList.remove('active'));
    activeIdx = idx;
    menuItems[activeIdx].classList.add('active');
  }

  menuItems.forEach((item, idx) => {
    item.addEventListener('mouseenter', () => setActive(idx));
    item.addEventListener('click', (e) => {
      e.preventDefault();
      enterSection(item.getAttribute('href'));
    });
  });

  function handleMenuKey(e) {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setActive((activeIdx + 1) % menuItems.length);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setActive((activeIdx - 1 + menuItems.length) % menuItems.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        enterSection(menuItems[activeIdx].getAttribute('href'));
        break;
    }
  }

  function enterSection(href) {
    menuActive = false;
    p5MenuScreen.classList.add('p5-menu-exiting');
    const idx = P5_SECTIONS.findIndex(s => s.href === href);
    setTimeout(() => {
      p5MenuScreen.style.display = 'none';
      openViewer(idx >= 0 ? idx : 0);
    }, 400);
  }

  // =====================================================

  const themeToggle = document.getElementById('themeToggle');
  const languageToggle = document.getElementById('languageToggle');
  const root = document.documentElement;
  let currentLanguage = 'es';

  let currentTheme = localStorage.getItem('theme') || 'dark';
  if (currentTheme === 'light') root.setAttribute('data-theme', 'light');
  
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    root.setAttribute('data-theme', currentTheme);
  });
  
  function updateAriaLabels() {
    themeToggle.setAttribute('aria-label', currentTheme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    languageToggle.setAttribute('aria-label', currentLanguage === 'es' ? 'Change to English' : 'Cambiar a Español');
  }

  if (languageToggle) {
    languageToggle.addEventListener('click', () => {
      currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
      changeLanguage(currentLanguage);
    });
  }

document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if(target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

document.querySelector('.logo-link').addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => location.reload(), 500);
});

document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', () => {
    if(window.innerWidth < 768) {
      nav.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

menuToggle.addEventListener('click', () => {
  nav.classList.toggle('active');
  document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : 'auto';
});

document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
});

window.addEventListener('scroll', () => {
  if (nav.classList.contains('active')) {
    nav.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
});



  const stars = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  document.body.appendChild(canvas);

  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '-1';

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars.length = 0;
    createStars();
  }

  function createStars() {
    for (let i = 0; i < 350; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 1.5,
        radius: Math.random() * 1.5,
        speed: Math.random() * 0.5,
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((star) => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI);
      ctx.fillStyle = '#fff';
      ctx.fill();
    });
  }

  let animationFrameId;

  function animateStars() {
    stars.forEach((star) => {
      star.y += star.speed;
      if (star.y > canvas.height) star.y = 0;
    });
    drawStars();
    animationFrameId = requestAnimationFrame(animateStars);
  }

  resizeCanvas();
  createStars();
  animateStars();

  window.addEventListener('resize', resizeCanvas);

  window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    window.removeEventListener('resize', resizeCanvas);
  });

  AOS.init({
    duration: 1000,
    once: true,
  });

  // Re-activate menu keyboard navigation when viewer closes
  document.addEventListener('p5:reopen-menu', () => { menuActive = true; });
});

function changeLanguage(lang) {
  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-translate");
    if (translations[lang][key]) {
      element.innerHTML = translations[lang][key];
    }
  });
}

const translations = {
  es: {
    logo: "Mi Portfolio",
    linkedin: "LinkedIn",
    github: "GitHub",
    languages: "Idiomas",
    about: "Sobre mí",
    projects: "Proyectos",
    skills: "Habilidades",
    contact: "Contacto",
    hello: "¡Hola, soy Hameem! 👋",
    role: "Técnico superior en desarrollo de aplicaciones multiplataforma",
    description: "Apasionado por crear soluciones innovadoras y aprender nuevas tecnologías.",
    cv: "Ver CV",
    portfolio: "Portfolio",
    aboutText: "Mi pasión por el software se materializa en el desarrollo de proyectos como aplicaciones móviles con Android Studio, sistemas de comunicación en tiempo real mediante sockets en Java, plataformas web interactivas con PHP y MySQL, y soluciones CRUD completas que integran tanto FrontEnd como BackEnd. Cada proyecto es una oportunidad para combinar lógica, creatividad y funcionalidad, siempre buscando superar los retos técnicos con enfoques innovadores.",
    academicTitle: "Formación Académica",
    academicText: "2024 - 2026 | Técnico Superior en Desarrollo de Aplicaciones Multiplataforma <br> Institución: DIGI-TECH",
    complementaryTitle: "Formación Complementaria",
    project1: "Página Web (GeekHub)",
    project1Desc: "GeekHub es una tienda online de electrónica que combina usabilidad y diseño atractivo. Incluye un slider de productos destacados, menú categorizado y diseño responsive. Desarrollada con JavaScript, HTML5/CSS3 y PHP, ofrece una experiencia fluida para usuarios, garantizando comunicación eficiente y navegación intuitiva.",
    project2: "Juego (Demonborne - En desarrollo)",
    project2Desc: "Demonborne es un videojuego 2D en desarrollo ambientado en un mundo de fantasía oscura, donde el jugador controla a un protagonista sin poderes mágicos que, tras pactar con un demonio, adquiere habilidades elementales únicas. Desarrollado con el motor Godot (para mecánicas de juego y diseño de escenas) y Kotlin (para integración de funciones nativas en Android), el juego combina exploración, combate estratégico basado en elementos (fuego, agua, etc.) y un sistema de progresión de habilidades vinculado a la narrativa. La arquitectura técnica prioriza escalabilidad, permitiendo futuras expansiones de mundos y mecánicas.",
    viewProject: "Ver Proyecto",
    java: "Java",
    python: "Python",
    javascript: "JavaScript",
    sql: "SQL",
    mysql: "MySQL",
    php: "PHP",
    html5: "HTML5",
    css3: "CSS3",
    bootstrap: "Bootstrap",
    androidStudio: "Android Studio",
    Idioma1: "Español",
    Idioma2: "Inglés(B2)",
    Idioma3: "Bengalí(Nativo)",
    Idioma4: "Hindi",
    email: "📧 - hameemafnan777@gmail.com",
    phone: "📱 - (+34) 632 881 026",
    location: "🚩 - Madrid",
    footer: "© 2025 Hameem. Todos los derechos reservados."
  },
  en: {
    logo: "My Portfolio",
    linkedin: "LinkedIn",
    github: "GitHub",
    languages: "Languages",
    about: "About Me",
    projects: "Projects",
    skills: "Skills",
    contact: "Contact",
    hello: "Hello, I'm Hameem! 👋",
    role: "Higher degree in multi-platform applications development",
    description: "Passionate about creating innovative solutions and learning new technologies.",
    cv: "View CV",
    portfolio: "Portfolio",
    aboutText: "My passion for software comes to life through developing projects like mobile apps with Android Studio, real-time communication systems using Java sockets, interactive web platforms powered by PHP and MySQL, and full-stack CRUD solutions that bridge FrontEnd and BackEnd development. Each project is an opportunity to merge logic, creativity, and functionality, tackling technical challenges with innovative approaches that push boundaries.",
    academicTitle: "Academic Background",
    academicText: "2024 - 2026 | Higher Degree in Multi-Platform App Development <br> Institution: DIGI-TECH",
    complementaryTitle: "Additional Training",
    project1: "Website (GeekHub)",
    project1Desc: "GeekHub is an electronics e-commerce platform combining usability and sleek design. Features include a product slider, categorized menu, and responsive layout. Built with JavaScript, HTML5/CSS3, and PHP, it delivers a seamless user experience with efficient communication and intuitive navigation.",
    project2: "Game (Demonborne - In Development)",
    project2Desc: "Demonborne is a 2D video game in development set in a dark fantasy world. Players control a powerless protagonist who gains elemental abilities through a demonic pact. Developed with Godot Engine (for game mechanics) and Kotlin (for Android integration), it combines exploration, element-based combat (fire, water, etc.), and a narrative-driven skill progression system. The technical architecture prioritizes scalability for future expansions.",
    viewProject: "View Project",
    java: "Java",
    python: "Python",
    javascript: "JavaScript",
    sql: "SQL",
    mysql: "MySQL",
    php: "PHP",
    html5: "HTML5",
    css3: "CSS3",
    bootstrap: "Bootstrap",
    androidStudio: "Android Studio",
    Idioma1: "Spanish(Native)",
    Idioma2: "English(B2)",
    Idioma3: "Bengali(Native)",
    Idioma4: "Hindi",
    email: "📧 - hameemafnan777@gmail.com",
    phone: "📱 - (+34) 632 881 026",
    location: "🚩 - Madrid",
    footer: "© 2025 Hameem. All rights reserved."
  }
};

/* ============================================================
   P5 SECTION VIEWER — Data, Renderer, Navigation
   ============================================================ */

const P5_SECTIONS = [
  { href: '#about',      label: 'PLAYER INFO',  num: '01' },
  { href: '#experience', label: 'MISSION LOG',  num: '02' },
  { href: '#Formacion',  label: 'LORE',         num: '03' },
  { href: '#projects',   label: 'ACHIEVEMENTS', num: '04' },
  { href: '#skills',     label: 'SKILL TREE',   num: '05' },
  { href: '#contact',    label: 'COMMS LINK',   num: '06' },
];

let viewerActive = false;
let currentSecIdx = 0;

const viewer      = document.getElementById('p5-section-viewer');
const vTitle      = document.getElementById('p5-v-title');
const vBody       = document.getElementById('p5-v-body');
const vCounter    = document.getElementById('p5-v-counter');
const btnPrev     = document.getElementById('p5-btn-prev');
const btnNext     = document.getElementById('p5-btn-next');
const btnBack     = document.getElementById('p5-btn-back');

function openViewer(idx) {
  currentSecIdx = idx;
  viewerActive  = true;
  renderViewerSection();
  viewer.classList.remove('p5-viewer-exit');
  viewer.classList.add('p5-viewer-visible');
  startCityCanvas();
}

function closeViewer() {
  viewerActive = false;
  viewer.classList.add('p5-viewer-exit');
  stopCityCanvas();
  setTimeout(() => {
    viewer.classList.remove('p5-viewer-visible', 'p5-viewer-exit');
    const ms = document.getElementById('p5-menu-screen');
    ms.style.display = '';
    ms.classList.remove('p5-menu-exiting');
    ms.classList.add('p5-menu-visible');
    // Re-activate menu via custom event (crosses the DOMContentLoaded closure boundary)
    document.dispatchEvent(new Event('p5:reopen-menu'));
  }, 320);
}

function navigateViewer(dir) {
  const total = P5_SECTIONS.length;
  currentSecIdx = (currentSecIdx + dir + total) % total;
  const slideClass = dir > 0 ? 'slide-left' : 'slide-right';
  vBody.classList.remove('slide-left', 'slide-right');
  void vBody.offsetWidth;
  vBody.classList.add(slideClass);
  renderViewerSection();
  setTimeout(() => vBody.classList.remove(slideClass), 200);
}

function renderViewerSection() {
  const s = P5_SECTIONS[currentSecIdx];
  vTitle.textContent = s.label;
  vCounter.textContent = `${s.num} / ${P5_SECTIONS.length.toString().padStart(2,'0')}`;
  vBody.innerHTML = getSectionHTML(s.href);
}

/* ---- Section HTML templates ---- */
function getSectionHTML(href) {
  switch (href) {
    case '#about':      return renderAbout();
    case '#experience': return renderExperience();
    case '#Formacion':  return renderFormacion();
    case '#projects':   return renderProjects();
    case '#skills':     return renderSkills();
    case '#contact':    return renderContact();
    default: return '<p style="color:#fff">Section not found</p>';
  }
}

function renderAbout() {
  return `
  <div class="p5-layout-about">
    <div class="p5-about-left">
      <div class="p5-char-frame">
        <img src="./imagenes/mi-cara.webp" alt="Hameem Afnan">
        <div class="p5-char-scan"></div>
      </div>
      <div class="p5-char-lv-badge">
        <span>Lv</span><span style="font-size:1.6rem">3+</span><span class="p5-lv-sub">YRS EXP</span>
      </div>
      <div class="p5-about-tags">
        <span class="p5-about-tag">Java</span>
        <span class="p5-about-tag">Python</span>
        <span class="p5-about-tag">ERP Odoo</span>
        <span class="p5-about-tag">REST APIs</span>
        <span class="p5-about-tag">Dataverse</span>
        <span class="p5-about-tag">Linux</span>
      </div>
    </div>
    <div class="p5-about-right">
      <div class="p5-info-header">
        <h2 class="p5-char-name">Hameem Afnan</h2>
        <span class="p5-char-role">Software Developer · Enterprise Specialist</span>
      </div>
      <div class="p5-stats-block">
        <div class="p5-stat-row">
          <span class="p5-sl">BASE</span>
          <span class="p5-sv">Madrid, España</span>
        </div>
        <div class="p5-stat-row">
          <span class="p5-sl">ESPECIALIDAD</span>
          <span class="p5-sv">ERP · REST APIs · Cloud Integration</span>
        </div>
        <div class="p5-stat-row">
          <span class="p5-sl">IDIOMAS</span>
          <span class="p5-sv">Español · Inglés B2 · Bengali · Hindi</span>
        </div>
        <div class="p5-stat-row">
          <span class="p5-sl">STATUS</span>
          <span class="p5-sv p5-sv-highlight">AVAILABLE FOR HIRE</span>
        </div>
      </div>
      <div class="p5-bio-panel">
        Programador multiplataforma con experiencia en entornos corporativos diseñando e implementando integraciones complejas. Especializado en ERP Odoo, APIs RESTful y arquitecturas escalables. Cada proyecto es una oportunidad para combinar lógica, creatividad y funcionalidad.
      </div>
    </div>
  </div>`;
}

function renderExperience() {
  return `
  <div class="p5-layout-missions">
    <div class="p5-missions-meta">Historial de Misiones · 1 Activa</div>
    <div class="p5-mission-card">
      <div class="p5-mission-top">
        <div class="p5-mission-title-block">
          <h3 class="p5-mission-name">Desarrollador de Software e Integraciones</h3>
          <span class="p5-mission-company">Tailored Spain</span>
        </div>
        <div class="p5-mission-date">2023 — PRESENTE</div>
      </div>
      <div class="p5-mission-tasks">
        <div class="p5-task">Desarrollo e integración de sistemas ERP (Odoo) mediante flujos HTTP y APIs RESTful</div>
        <div class="p5-task">Gestión de migraciones de entornos web internacionales (ALM) en Dataverse</div>
        <div class="p5-task">Resolución de incidencias críticas de arquitectura web y sincronización de bases de datos</div>
      </div>
      <span class="p5-mission-badge">ACTIVE</span>
    </div>
  </div>`;
}

function renderFormacion() {
  return `
  <div class="p5-layout-lore">
    <div class="p5-lore-card">
      <div class="p5-lore-card-top">
        <span class="p5-lore-arcana">Arcana: Education</span>
        <span class="p5-lore-stars">★★★★★</span>
      </div>
      <h3 class="p5-lore-title">Técnico Superior en Desarrollo de Aplicaciones Multiplataforma</h3>
      <div class="p5-lore-detail">
        <div class="p5-lore-row"><span>Institución</span><span>DIGI-TECH</span></div>
        <div class="p5-lore-row"><span>Período</span><span>2024 — 2026</span></div>
        <div class="p5-lore-row"><span>Nivel</span><span>Formación Profesional Superior (CFGS)</span></div>
        <div class="p5-lore-row"><span>Especialidad</span><span>Desarrollo Multiplataforma · Mobile · Web · Desktop</span></div>
      </div>
      <p class="p5-lore-desc">
        Ciclo formativo de grado superior orientado al desarrollo de aplicaciones para múltiples plataformas: móvil, escritorio y web. Orientado a arquitecturas empresariales, sistemas de integración y metodologías profesionales de desarrollo de software.
      </p>
    </div>
  </div>`;
}

function renderProjects() {
  return `
  <div class="p5-layout-achievements">
    <div class="p5-ach-subtitle">Main Quests · Enterprise</div>
    <div class="p5-ach-grid">
      <div class="p5-ach-card">
        <div class="p5-ach-header">
          <div class="p5-ach-icon">⚙️</div>
          <div>
            <h3 class="p5-ach-name">Integración ERP Odoo</h3>
            <div class="p5-ach-type">Caso de Estudio</div>
          </div>
        </div>
        <p class="p5-ach-desc">Diseño e implementación de infraestructura de comunicación eficiente mediante flujos automatizados y consumo de APIs RESTful en entorno empresarial real.</p>
        <div class="p5-ach-techs">
          <span class="p5-ach-tech">APIs RESTful</span>
          <span class="p5-ach-tech">Odoo ERP</span>
          <span class="p5-ach-tech">Dataverse</span>
        </div>
      </div>
    </div>
    <div class="p5-ach-subtitle" style="margin-top:1.5rem">Side Quests · Personal</div>
    <div class="p5-ach-grid">
      <div class="p5-ach-card">
        <div class="p5-ach-header">
          <div class="p5-ach-icon">🎮</div>
          <div>
            <h3 class="p5-ach-name">Demonborne</h3>
            <div class="p5-ach-type">Indie Game · En Desarrollo</div>
          </div>
        </div>
        <p class="p5-ach-desc">Videojuego 2D con mecánicas de combate elemental, físicas personalizadas y sistema de habilidades vinculado a la narrativa.</p>
        <div class="p5-ach-techs">
          <span class="p5-ach-tech">Godot</span>
          <span class="p5-ach-tech">Kotlin</span>
          <span class="p5-ach-tech">Android Studio</span>
        </div>
        <a href="https://github.com/4m3n/DemonBorne.git" class="p5-ach-link" target="_blank" rel="noopener">▶ Ver Repositorio</a>
      </div>
      <div class="p5-ach-card">
        <div class="p5-ach-header">
          <div class="p5-ach-icon">🔌</div>
          <div>
            <h3 class="p5-ach-name">Arquitectura Sockets</h3>
            <div class="p5-ach-type">Servidor · Tiempo Real</div>
          </div>
        </div>
        <p class="p5-ach-desc">Comunicaciones Cliente/Servidor en tiempo real, gestión de hilos y despliegue en Linux. Ideal para bots y sistemas multicliente.</p>
        <div class="p5-ach-techs">
          <span class="p5-ach-tech">Java Sockets</span>
          <span class="p5-ach-tech">Ubuntu Server</span>
          <span class="p5-ach-tech">Multithreading</span>
        </div>
        <a href="https://github.com/4m3n/ChatSockets.git" class="p5-ach-link" target="_blank" rel="noopener">▶ Ver Repositorio</a>
      </div>
    </div>
  </div>`;
}

const SKILL_LEVELS = {
  'Java': 85, 'Python': 80, 'SQL / MySQL': 82, 'PHP': 70, 'C#': 65,
  'JavaScript': 78, 'HTML5': 88, 'CSS3 / Bootstrap': 82, 'Flutter': 60,
  'Android Studio': 72, 'Git / GitHub': 87, 'Linux Server': 75, 'Odoo ERP': 90, 'Dataverse': 78,
};

function skillBar(name) {
  const pct = SKILL_LEVELS[name] || 70;
  return `
  <div class="p5-skill-entry">
    <span class="p5-skill-name">${name}</span>
    <div class="p5-skill-bar"><div class="p5-skill-bar-fill" style="width:${pct}%"></div></div>
  </div>`;
}

function renderSkills() {
  return `
  <div class="p5-layout-skills">
    <div class="p5-skill-group">
      <div class="p5-skill-group-header" style="background:#8b0000">Backend &amp; Data</div>
      <div class="p5-skill-list">
        ${['Java','Python','SQL / MySQL','PHP','C#'].map(skillBar).join('')}
      </div>
    </div>
    <div class="p5-skill-group">
      <div class="p5-skill-group-header" style="background:#003580">Frontend &amp; Apps</div>
      <div class="p5-skill-list">
        ${['JavaScript','HTML5','CSS3 / Bootstrap','Flutter'].map(skillBar).join('')}
      </div>
    </div>
    <div class="p5-skill-group">
      <div class="p5-skill-group-header" style="background:#004d00">Tools &amp; Entornos</div>
      <div class="p5-skill-list">
        ${['Android Studio','Git / GitHub','Linux Server','Odoo ERP','Dataverse'].map(skillBar).join('')}
      </div>
    </div>
  </div>`;
}

function renderContact() {
  return `
  <div class="p5-layout-contact">
    <div class="p5-comms-panel">
      <div class="p5-comms-header">
        <span class="p5-comms-title">◈ COMMS LINK ESTABLISHED ◈</span>
        <span class="p5-comms-status">● ONLINE</span>
      </div>
      <div class="p5-comms-body">
        <div class="p5-comms-row">
          <span class="p5-comms-label">EMAIL_</span>
          <a href="mailto:hameemafnan777@gmail.com" class="p5-comms-val">hameemafnan777@gmail.com</a>
        </div>
        <div class="p5-comms-row">
          <span class="p5-comms-label">PHONE_</span>
          <span class="p5-comms-val">(+34) 632 881 026</span>
        </div>
        <div class="p5-comms-row">
          <span class="p5-comms-label">LOCATION_</span>
          <span class="p5-comms-val">Madrid, España — Base de Operaciones</span>
        </div>
        <div class="p5-comms-row">
          <span class="p5-comms-label">GITHUB_</span>
          <a href="https://github.com/4m3n" class="p5-comms-val" target="_blank" rel="noopener">github.com/4m3n</a>
        </div>
        <div class="p5-comms-row">
          <span class="p5-comms-label">LINKEDIN_</span>
          <a href="https://www.linkedin.com/in/hameem-afnan" class="p5-comms-val" target="_blank" rel="noopener">linkedin.com/in/hameem-afnan</a>
        </div>
        <div class="p5-comms-row">
          <span class="p5-comms-label">RESUME_</span>
          <a href="./imagenes/CV - Hameem Afnan Akther Faroquee.pdf" class="p5-comms-val p5-comms-download" target="_blank" rel="noopener">▼ DOWNLOAD CV</a>
        </div>
      </div>
      <div class="p5-comms-cursor"></div>
    </div>
  </div>`;
}

/* ---- Viewer button/keyboard handlers ---- */
btnPrev.addEventListener('click', () => { if (viewerActive) navigateViewer(-1); });
btnNext.addEventListener('click', () => { if (viewerActive) navigateViewer(1);  });
btnBack.addEventListener('click', () => { if (viewerActive) closeViewer(); });

document.addEventListener('keydown', (e) => {
  if (!viewerActive) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); navigateViewer(1);  }
  if (e.key === 'ArrowLeft')  { e.preventDefault(); navigateViewer(-1); }
  if (e.key === 'Escape')     { e.preventDefault(); closeViewer();       }
});

/* ============================================================
   CITY CANVAS ANIMATION — Buildings + Walking Silhouettes
   ============================================================ */

let cityRaf = null;
let cityRunning = false;

function startCityCanvas() {
  if (cityRunning) return;
  cityRunning = true;
  const canvas = document.getElementById('p5-city-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, buildings, people, frame = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildings = genBuildings(W, H);
    people    = genPeople(W, H);
  }

  function genBuildings(W, H) {
    const list = [];
    let x = 0;
    const groundY = H * 0.72;
    while (x < W + 120) {
      const w = 35 + Math.random() * 85;
      const h = 70 + Math.random() * (groundY * 0.8);
      const wins = [];
      for (let wy = groundY - h + 8; wy < groundY - 12; wy += 18) {
        for (let wx = x + 6; wx < x + w - 6; wx += 15) {
          wins.push({ x: wx, y: wy, lit: Math.random() > 0.38, timer: Math.floor(Math.random() * 280 + 80) });
        }
      }
      list.push({ x, w, h, wins });
      x += w + 2;
    }
    return list;
  }

  function genPeople(W, H) {
    const groundY = H * 0.72;
    return Array.from({ length: 9 }, () => ({
      x:    Math.random() * W,
      y:    groundY + 5 + Math.random() * 18,
      spd:  0.4 + Math.random() * 1.3,
      sz:   18 + Math.random() * 22,
      dir:  Math.random() > 0.5 ? 1 : -1,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function drawPerson(ctx, p, frame) {
    const { x, y, sz, phase } = p;
    const walk = Math.sin(frame * 0.08 + phase) * 0.28;
    ctx.save();
    ctx.fillStyle = 'rgba(200,0,0,0.88)';

    /* head */
    ctx.beginPath();
    ctx.arc(x, y - sz, sz * 0.2, 0, Math.PI * 2);
    ctx.fill();

    /* torso */
    ctx.fillRect(x - sz * 0.11, y - sz * 0.78, sz * 0.22, sz * 0.46);

    /* legs */
    ctx.save(); ctx.translate(x - sz * 0.06, y - sz * 0.32);
    ctx.rotate(walk);
    ctx.fillRect(-sz * 0.055, 0, sz * 0.11, sz * 0.38);
    ctx.restore();

    ctx.save(); ctx.translate(x + sz * 0.06, y - sz * 0.32);
    ctx.rotate(-walk);
    ctx.fillRect(-sz * 0.055, 0, sz * 0.11, sz * 0.38);
    ctx.restore();

    /* arms */
    ctx.save(); ctx.translate(x + sz * 0.13, y - sz * 0.65);
    ctx.rotate(-walk * 0.5);
    ctx.fillRect(-sz * 0.055, 0, sz * 0.1, sz * 0.28);
    ctx.restore();

    ctx.save(); ctx.translate(x - sz * 0.13, y - sz * 0.65);
    ctx.rotate(walk * 0.5);
    ctx.fillRect(-sz * 0.055, 0, sz * 0.1, sz * 0.28);
    ctx.restore();

    ctx.restore();
  }

  function draw() {
    if (!cityRunning) return;
    frame++;
    ctx.clearRect(0, 0, W, H);

    /* Sky gradient */
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.73);
    sky.addColorStop(0, '#02000b');
    sky.addColorStop(0.55, '#0d0005');
    sky.addColorStop(1, '#1c0003');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    /* Moon glow */
    const moon = ctx.createRadialGradient(W * 0.82, H * 0.12, 0, W * 0.82, H * 0.12, 130);
    moon.addColorStop(0, 'rgba(180,0,0,.18)');
    moon.addColorStop(1, 'transparent');
    ctx.fillStyle = moon;
    ctx.fillRect(0, 0, W, H);

    /* Stars (tiny dots) */
    if (frame % 3 === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let i = 0; i < 3; i++) {
        const sx = Math.random() * W;
        const sy = Math.random() * H * 0.65;
        ctx.fillRect(sx, sy, 1, 1);
      }
    }

    /* Buildings */
    const groundY = H * 0.72;
    for (const b of buildings) {
      ctx.fillStyle = '#060009';
      ctx.fillRect(b.x, groundY - b.h, b.w, b.h);
      for (const w of b.wins) {
        if (frame % w.timer === 0) w.lit = !w.lit;
        if (w.lit) {
          ctx.fillStyle = 'rgba(255,210,110,.75)';
          ctx.fillRect(w.x, w.y, 5, 8);
        }
      }
    }

    /* Street */
    const street = ctx.createLinearGradient(0, groundY, 0, H);
    street.addColorStop(0, '#070003');
    street.addColorStop(1, '#030001');
    ctx.fillStyle = street;
    ctx.fillRect(0, groundY, W, H - groundY);

    /* Street line reflections */
    ctx.fillStyle = 'rgba(217,0,0,0.06)';
    for (let lx = 0; lx < W; lx += 45) {
      ctx.fillRect(lx, groundY + 8, 22, H - groundY - 8);
    }

    /* Walking people */
    for (const p of people) {
      p.x += p.spd * p.dir;
      if (p.x > W + 60) p.x = -60;
      if (p.x < -60)    p.x = W + 60;
      drawPerson(ctx, p, frame);
    }

    cityRaf = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

function stopCityCanvas() {
  cityRunning = false;
  if (cityRaf) { cancelAnimationFrame(cityRaf); cityRaf = null; }
}
