const header=document.getElementById('topbar');
const navLinks=[...document.querySelectorAll('.main-nav a')];
const sections=[...document.querySelectorAll('main section[id]')];

function updateHeader(){header.classList.toggle('scrolled',window.scrollY>90)}
function updateActiveNav(){
  let current='inicio';
  const marker=window.scrollY+window.innerHeight*.32;
  sections.forEach(section=>{if(section.offsetTop<=marker) current=section.id});
  navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${current}`));
}
window.addEventListener('scroll',()=>{updateHeader();updateActiveNav()},{passive:true});
updateHeader();updateActiveNav();

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}
}),{threshold:.14});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

const track=document.getElementById('galleryTrack');
const viewport=document.getElementById('galleryViewport');
const prev=document.getElementById('galleryPrev');
const next=document.getElementById('galleryNext');
let galleryPosition=0;

function galleryPositions(){
  const limit=Math.max(0,track.scrollWidth-viewport.clientWidth);
  const raw=[...track.children].map(card=>Math.min(card.offsetLeft,limit));
  return [...new Set(raw.map(value=>Math.round(value)))];
}
function renderGallery(){
  const positions=galleryPositions();
  galleryPosition=Math.max(0,Math.min(galleryPosition,positions.length-1));
  const x=positions[galleryPosition]||0;
  track.style.transform=`translateX(${-x}px)`;
  prev.disabled=galleryPosition===0;
  next.disabled=galleryPosition>=positions.length-1;
}
function moveGallery(direction){galleryPosition+=direction;renderGallery()}
prev.addEventListener('click',()=>moveGallery(-1));
next.addEventListener('click',()=>moveGallery(1));
window.addEventListener('resize',renderGallery);
renderGallery();

const simulationTrack=document.getElementById('simulationTrack');
const simulationViewport=document.getElementById('simulationViewport');
const simulationPrev=document.getElementById('simulationPrev');
const simulationNext=document.getElementById('simulationNext');
let simulationIndex=0;

function renderSimulations(){
  const cards=[...simulationTrack.children];
  simulationIndex=Math.max(0,Math.min(simulationIndex,cards.length-1));
  simulationTrack.style.transform=`translateX(${-simulationIndex*simulationViewport.clientWidth}px)`;
  simulationPrev.disabled=simulationIndex===0;
  simulationNext.disabled=simulationIndex===cards.length-1;
}
simulationPrev.addEventListener('click',()=>{simulationIndex--;renderSimulations()});
simulationNext.addEventListener('click',()=>{simulationIndex++;renderSimulations()});
window.addEventListener('resize',renderSimulations);
renderSimulations();



/* Language switcher */
const translations={
  es:{
    "nav.home":"Inicio",
    "nav.lasicop":"LaSiCoP",
    "nav.simulations":"Simulaciones",
    "hero.lab":"Laboratorio de Simulación y Control de Procesos",
    "hero.description":"Un espacio virtual que integra <strong>teoría</strong>, <strong>documentación interactiva</strong>, <strong>simulación</strong> y <strong>realidad virtual</strong> para estudiar el comportamiento, la operación y el control de procesos antes, durante y después de cada experiencia.",
    "hero.discover":"Descubre más",
    "about.title":"Conectando el modelo con la experiencia",
    "features.docs.title":"Documentación interactiva",
    "features.docs.text":"Conceptos, ecuaciones, parámetros, gráficas y pequeños experimentos integrados en cada simulación.",
    "features.sim.title":"Simulación",
    "features.sim.text":"Exploración del comportamiento del proceso mediante cambios de parámetros y condiciones de operación.",
    "features.vr.title":"Realidad virtual",
    "features.vr.text":"Interacción inmersiva con equipos, variables y escenarios para experimentar el sistema de forma espacial.",
    "workflow.title":"Una misma práctica, distintos niveles de aprendizaje",
    "workflow.understand.title":"Definir",
    "workflow.understand.text":"Identificamos el modelo, los conceptos y las ecuaciones fundamentales del sistema.",
    "workflow.explore.title":"Comprender",
    "workflow.explore.text":"Modificamos parámetros y examinamos cómo distintas variables afectan el comportamiento del proceso.",
    "workflow.experiment.title":"Aplicar",
    "workflow.experiment.text":"Integramos las relaciones entre variables y ponemos a prueba nuestras predicciones mediante simulación y realidad virtual.",
    "workflow.analyze.title":"Reflexionar",
    "workflow.analyze.text":"Generalizamos los resultados, evaluamos nuestras decisiones y aplicamos lo aprendido a nuevas condiciones del proceso.",
    "gallery.title":"Disfruta el desarrollo y pruebas",
    "gallery.dev.label":"Desarrollo 3D",
    "gallery.dev.text":"Construcción del entorno virtual.",
    "gallery.test.label":"Pruebas VR",
    "gallery.test.text":"Recorrido dentro del laboratorio.",
    "gallery.interaction.label":"Interacción",
    "gallery.interaction.text":"Acceso a experiencias y configuración.",
    "gallery.identity.label":"Identidad",
    "gallery.identity.text":"LaSiCoP dentro del entorno inmersivo.",
    "simulations.title":"Explora los sistemas disponibles",
    "simulations.intro":"Cada simulación integra documentación, exploración interactiva y una experiencia inmersiva virtual.",
    "vrintro.title":"Introducción al entorno VR",
    "vrintro.text":"Explora el campus y la sala de inicio mientras aprendes a desplazarte, interactuar con objetos y utilizar los controles VR. El recorrido puede incorporar puntos interactivos con instrucciones y datos curiosos del proyecto antes de entrar a las simulaciones.",
    "vrintro.enter":"Iniciar recorrido",
    "tank.title":"Tanque de nivel",
    "tank.text":"Estudia el modelo dinámico del sistema, la característica inherente de la válvula, el comportamiento en estado estacionario y linealizado, y el control en lazo abierto y cerrado mediante acciones PID.",
    "tank.enter":"Entrar a la simulación",
    "footer.rights":"© 2026 LaSiCoP. Derechos Reservados.",
    "toast.tank":"La página del tanque de nivel será el siguiente módulo.",
    "toast.vrintro":"El recorrido introductorio VR será conectado en la siguiente etapa."
  },
  en:{
    "nav.home":"Home",
    "nav.lasicop":"LaSiCoP",
    "nav.simulations":"Simulations",
    "hero.lab":"Process Simulation and Control Laboratory",
    "hero.description":"A virtual space that integrates <strong>theory</strong>, <strong>interactive documentation</strong>, <strong>simulation</strong>, and <strong>virtual reality</strong> to study process behavior, operation, and control before, during, and after each experience.",
    "hero.discover":"Discover more",
    "about.title":"Connecting the model with the experience",
    "features.docs.title":"Interactive documentation",
    "features.docs.text":"Concepts, equations, parameters, plots, and small experiments integrated into each simulation.",
    "features.sim.title":"Simulation",
    "features.sim.text":"Explore process behavior by changing parameters and operating conditions.",
    "features.vr.title":"Virtual reality",
    "features.vr.text":"Immersive interaction with equipment, variables, and scenarios to experience the system spatially.",
    "workflow.title":"One practice, different levels of learning",
    "workflow.understand.title":"Define",
    "workflow.understand.text":"We identify the model, concepts, and fundamental equations of the system.",
    "workflow.explore.title":"Understand",
    "workflow.explore.text":"We modify parameters and examine how different variables affect process behavior.",
    "workflow.experiment.title":"Apply",
    "workflow.experiment.text":"We integrate relationships among variables and test our predictions through simulation and virtual reality.",
    "workflow.analyze.title":"Reflect",
    "workflow.analyze.text":"We generalize the results, evaluate our decisions, and apply what we have learned to new process conditions.",
    "gallery.title":"Enjoy the development and testing process",
    "gallery.dev.label":"3D development",
    "gallery.dev.text":"Building the virtual environment.",
    "gallery.test.label":"VR testing",
    "gallery.test.text":"Exploring the virtual laboratory.",
    "gallery.interaction.label":"Interaction",
    "gallery.interaction.text":"Access to experiences and configuration.",
    "gallery.identity.label":"Identity",
    "gallery.identity.text":"LaSiCoP inside the immersive environment.",
    "simulations.title":"Explore the available systems",
    "simulations.intro":"Each simulation integrates documentation, interactive exploration, and an immersive virtual experience.",
    "vrintro.title":"Introduction to the VR environment",
    "vrintro.text":"Explore the campus and welcome room while learning how to move, interact with objects, and use the VR controls. The route can include interactive points with instructions and project facts before entering the simulations.",
    "vrintro.enter":"Start tour",
    "tank.title":"Level tank",
    "tank.text":"Study the dynamic system model, the inherent valve characteristic, steady-state and linearized behavior, and open- and closed-loop control using PID actions.",
    "tank.enter":"Enter simulation",
    "footer.rights":"© 2026 LaSiCoP. All Rights Reserved.",
    "toast.tank":"The level-tank page will be the next module.",
    "toast.vrintro":"The introductory VR tour will be connected in the next stage."
  }
};

const langButtons=[...document.querySelectorAll('.lang-btn')];

function applyLanguage(lang){
  const dictionary=translations[lang]||translations.es;
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.dataset.i18n;
    if(dictionary[key]!==undefined) el.innerHTML=dictionary[key];
  });
  langButtons.forEach(btn=>{
    const active=btn.dataset.lang===lang;
    btn.classList.toggle('active',active);
    btn.setAttribute('aria-pressed',String(active));
  });
  localStorage.setItem('lasicop-language',lang);
}

langButtons.forEach(btn=>btn.addEventListener('click',()=>applyLanguage(btn.dataset.lang)));
applyLanguage(localStorage.getItem('lasicop-language')||'es');
