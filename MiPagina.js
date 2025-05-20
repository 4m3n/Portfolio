document.addEventListener('DOMContentLoaded', () => {
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
