(function(){
  "use strict";

  let language=localStorage.getItem("lasicop-language")||"es";
  let simulationData=null;
  let currentEntry=null;
  let simulationKey="";
  let fileKey="";


  const DEMO_DATA={
    "introduccion-vr":{
      name:"Introducción al entorno VR",
      name_en:"Introduction to the VR environment",
      entries:[{file:"introduccion",title:"Introducción al entorno VR",title_en:"Introduction to the VR environment",authors:["Equipo LaSiCoP"],authors_en:["LaSiCoP Team"],updated:"24 de septiembre de 2026",updated_en:"September 24, 2026"}]
    },
    "tanque-nivel":{
      name:"Tanque de nivel",
      name_en:"Level tank",
      entries:[{file:"introduccion",title:"Tanque de nivel",title_en:"Level tank",authors:["Equipo LaSiCoP"],authors_en:["LaSiCoP Team"],updated:"24 de septiembre de 2026",updated_en:"September 24, 2026"}]
    }
  };

  const DEMO_CONTENT={
    es:{
      "introduccion-vr/introduccion":`## Bienvenida al entorno VR

Esta primera experiencia sirve para familiarizarnos con el laboratorio virtual antes de comenzar las prácticas de ingeniería química.

## Controles básicos

- Desplazamiento dentro del entorno.
- Orientación y observación.
- Selección de objetos.
- Interacción con paneles y elementos del laboratorio.

<div class="interactive-panel"><strong>Ejemplo de zona interactiva.</strong><br>Aquí podremos colocar posteriormente una guía visual de los controles.</div>

## Exploración del campus

El recorrido puede incorporar puntos con información breve sobre LaSiCoP y el desarrollo del proyecto.`,

      "tanque-nivel/introduccion":`## Modelo dinámico

El sistema se representa mediante un balance de volumen:

$$A\\\\frac{dh}{dt}=q_{in}-q_{out}$$

## Variables del sistema

- Geometría del tanque.
- Característica inherente de la válvula.
- Flujo de entrada y salida.
- Nivel del líquido.

<div class="interactive-panel"><strong>Ejemplo de componente interactivo.</strong><br>Aquí podremos incorporar sliders, gráficas y cálculos asociados con el modelo.</div>

## Del modelo al control

La documentación podrá avanzar desde el estado estacionario y la linealización hasta el lazo abierto y el control P, PI y PID.`
    },
    en:{
      "introduccion-vr/introduccion":`## Welcome to the VR environment

This first experience helps us become familiar with the virtual laboratory before starting the chemical engineering activities.

## Basic controls

- Movement inside the environment.
- Orientation and observation.
- Object selection.
- Interaction with panels and laboratory elements.

## Campus exploration

The route can include brief information about LaSiCoP and the development of the project.`,

      "tanque-nivel/introduccion":`## Dynamic model

The system is represented through a volume balance:

$$A\\\\frac{dh}{dt}=q_{in}-q_{out}$$

## System variables

- Tank geometry.
- Inherent valve characteristic.
- Inlet and outlet flow.
- Liquid level.

## From the model to control

The documentation can progress from steady state and linearization to open-loop analysis and P, PI, and PID control.`
    }
  };

  const STATIC_TEXT={
    es:{
      "nav.home":"Inicio","nav.lasicop":"LaSiCoP","nav.simulations":"Simulaciones",
      "toc.simulation":"Simulación","toc.contents":"Contenido","loading":"Cargando contenido…",
      authors:"Autores",updated:"Última actualización",home:"Inicio",simulations:"Simulaciones",
      unavailable:"Contenido no disponible aún.",error:"No se encontró la documentación solicitada.",
      rights:"© 2026 LaSiCoP. Derechos Reservados."
    },
    en:{
      "nav.home":"Home","nav.lasicop":"LaSiCoP","nav.simulations":"Simulations",
      "toc.simulation":"Simulation","toc.contents":"Contents","loading":"Loading content…",
      authors:"Authors",updated:"Last updated",home:"Home",simulations:"Simulations",
      unavailable:"Content is not available yet.",error:"The requested documentation was not found.",
      rights:"© 2026 LaSiCoP. All Rights Reserved."
    }
  };

  document.addEventListener("DOMContentLoaded",init);

  function init(){
    const params=new URLSearchParams(window.location.search);
    simulationKey=params.get("simulation")||params.get("subject")||"tanque-nivel";
    fileKey=params.get("file")||"introduccion";

    applyStaticLanguage();
    initLanguageSwitcher();
    initTocToggle();
    loadSimulationData();
  }

  function loadSimulationData(){
    fetch(`data/${simulationKey}.json`)
      .then(r=>{if(!r.ok) throw new Error("data");return r.json();})
      .then(data=>{
        simulationData=data;
        currentEntry=(data.entries||[]).find(entry=>entry.file===fileKey)||null;
        if(!currentEntry){showError();return;}
        renderPageChrome();
        loadContent();
      })
      .catch(()=>{
        const fallback=DEMO_DATA[simulationKey];
        if(!fallback){showError();return;}
        simulationData=fallback;
        currentEntry=(fallback.entries||[]).find(entry=>entry.file===fileKey)||null;
        if(!currentEntry){showError();return;}
        renderPageChrome();
        loadContent();
      });
  }

  function simulationName(){
    if(!simulationData) return simulationKey;
    return language==="en"
      ? (simulationData.name_en||simulationData.name||simulationKey)
      : (simulationData.name||simulationKey);
  }

  function entryTitle(entry=currentEntry){
    if(!entry) return "";
    return language==="en" ? (entry.title_en||entry.title||"") : (entry.title||"");
  }


  function renderPageChrome(){
    const simName=simulationName();
    document.title=`${simName} · LaSiCoP`;

    const title=document.getElementById("article-title");
    const meta=document.getElementById("article-meta");
    if(title) title.textContent=entryTitle();

    if(meta){
      const t=STATIC_TEXT[language];
      const authorsSource=language==="en"
        ? (currentEntry.authors_en||currentEntry.authors||[])
        : (currentEntry.authors||[]);
      const authors=Array.isArray(authorsSource) ? authorsSource.join(", ") : authorsSource;
      const updated=language==="en"
        ? (currentEntry.updated_en||currentEntry.updated||"")
        : (currentEntry.updated||"");
      const parts=[];
      if(authors) parts.push(`<span><strong>${t.authors}:</strong> ${escapeHtml(authors)}</span>`);
      if(updated) parts.push(`<span><strong>${t.updated}:</strong> ${escapeHtml(updated)}</span>`);
      meta.innerHTML=parts.join("");
    }
  }

  function contentCandidates(){
    if(language==="en"){
      return [
        `content/${simulationKey}/${fileKey}.en.mdx`,
        `content/${simulationKey}/${fileKey}.en.md`,
        `content/${simulationKey}/${fileKey}.mdx`,
        `content/${simulationKey}/${fileKey}.md`
      ];
    }
    return [
      `content/${simulationKey}/${fileKey}.mdx`,
      `content/${simulationKey}/${fileKey}.md`
    ];
  }

  function loadContent(){
    fetchFirst(contentCandidates())
      .then(text=>renderMarkdownCompatible(text))
      .catch(()=>{
        const demoKey=`${simulationKey}/${fileKey}`;
        const demo=(DEMO_CONTENT[language]&&DEMO_CONTENT[language][demoKey])||DEMO_CONTENT.es[demoKey];
        if(demo){renderMarkdownCompatible(demo);return;}
        const body=document.getElementById("article-body");
        if(body) body.innerHTML=`<p style="text-align:center;color:#748b9a;padding:46px 0;">${STATIC_TEXT[language].unavailable}</p>`;
      });
  }

  function fetchFirst(paths,index=0){
    if(index>=paths.length) return Promise.reject(new Error("not-found"));
    return fetch(paths[index]).then(r=>{
      if(!r.ok) return fetchFirst(paths,index+1);
      return r.text();
    });
  }

  function renderMarkdownCompatible(source){
    const body=document.getElementById("article-body");
    if(!body) return;

    const content=source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/,'');
    const protectedMath=[];
    let prepared=content.replace(/\$\$([\s\S]*?)\$\$/g,(match,tex)=>{
      const key=`@@BLOCKMATH${protectedMath.length}@@`;
      protectedMath.push({key,tex:tex.trim(),display:true});
      return `\n${key}\n`;
    });
    prepared=prepared.replace(/\$([^\n$]+?)\$/g,(match,tex)=>{
      const key=`@@INLINEMATH${protectedMath.length}@@`;
      protectedMath.push({key,tex:tex.trim(),display:false});
      return key;
    });

    let html=window.marked&&typeof window.marked.parse==="function" ? window.marked.parse(prepared) : prepared;

    protectedMath.forEach(item=>{
      let rendered=item.key;
      try{
        if(window.katex) rendered=katex.renderToString(item.tex,{displayMode:item.display,throwOnError:false});
      }catch(e){}
      html=html.split(item.key).join(rendered);
    });

    body.innerHTML=html;
    if(window.initLaSiCoPWidgets) window.initLaSiCoPWidgets(body);
    body.querySelectorAll("pre code").forEach(block=>{if(window.hljs) hljs.highlightElement(block);});
    generateTOC();
    initScrollSpy();
  }

  function generateTOC(){
    const body=document.getElementById("article-body");
    const list=document.getElementById("toc-list");
    if(!body||!list) return;
    const headings=[...body.querySelectorAll("h2,h3")];
    list.innerHTML="";
    if(!headings.length){
      document.querySelector(".toc-sidebar")?.classList.add("collapsed");
      return;
    }
    headings.forEach((heading,index)=>{
      const id=slugify(heading.textContent)||`section-${index}`;
      heading.id=uniqueHeadingId(id,index);
      const li=document.createElement("li");
      const link=document.createElement("a");
      link.href=`#${heading.id}`;
      link.dataset.target=heading.id;
      link.textContent=heading.textContent;
      if(heading.tagName==="H3") link.classList.add("toc-h3");
      link.addEventListener("click",event=>{
        event.preventDefault();
        heading.scrollIntoView({behavior:"smooth",block:"start"});
        if(window.innerWidth<=768) closeMobileToc();
      });
      li.appendChild(link);list.appendChild(li);
    });
  }

  function uniqueHeadingId(base,index){
    return document.getElementById(base) ? `${base}-${index}` : base;
  }

  function slugify(text){
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  }

  function initScrollSpy(){
    const links=[...document.querySelectorAll("#toc-list a")];
    if(!links.length) return;
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
      if(!visible) return;
      links.forEach(link=>link.classList.toggle("active",link.dataset.target===visible.target.id));
    },{root:document.querySelector(".entry-content"),rootMargin:"-12% 0px -72% 0px",threshold:0});
    document.querySelectorAll("#article-body h2,#article-body h3").forEach(h=>observer.observe(h));
  }

  function initTocToggle(){
    const sidebar=document.querySelector(".toc-sidebar");
    const toggle=document.querySelector(".toc-toggle");
    if(!sidebar||!toggle) return;

    if(window.innerWidth<=768) sidebar.classList.add("collapsed");

    toggle.addEventListener("click",()=>{
      if(window.innerWidth<=768){
        sidebar.classList.toggle("open");
        sidebar.classList.toggle("collapsed",!sidebar.classList.contains("open"));
      }else{
        sidebar.classList.toggle("collapsed");
      }
      updateTocIcon();
    });

    window.addEventListener("resize",()=>{
      if(window.innerWidth>768) sidebar.classList.remove("open");
      else if(!sidebar.classList.contains("open")) sidebar.classList.add("collapsed");
      updateTocIcon();
    });
    updateTocIcon();
  }

  function closeMobileToc(){
    const sidebar=document.querySelector(".toc-sidebar");
    if(!sidebar) return;
    sidebar.classList.remove("open");sidebar.classList.add("collapsed");updateTocIcon();
  }

  function updateTocIcon(){
    const sidebar=document.querySelector(".toc-sidebar");
    const toggle=document.querySelector(".toc-toggle");
    if(!sidebar||!toggle) return;
    const hidden=window.innerWidth<=768 ? !sidebar.classList.contains("open") : sidebar.classList.contains("collapsed");
    toggle.innerHTML=`<i class="bi bi-chevron-${hidden?"right":"left"}"></i>`;
  }

  function initLanguageSwitcher(){
    document.querySelectorAll(".lang-btn").forEach(button=>{
      button.addEventListener("click",()=>{
        language=button.dataset.lang;
        localStorage.setItem("lasicop-language",language);
        document.documentElement.lang=language;
        applyStaticLanguage();
        if(simulationData&&currentEntry){renderPageChrome();loadContent();}
      });
    });
  }

  function applyStaticLanguage(){
    document.documentElement.lang=language;
    const dictionary=STATIC_TEXT[language];
    document.querySelectorAll("[data-i18n-static]").forEach(el=>{
      const value=dictionary[el.dataset.i18nStatic];
      if(value!==undefined) el.textContent=value;
    });
    const footer=document.getElementById("footer-rights");
    if(footer) footer.textContent=dictionary.rights;
    document.querySelectorAll(".lang-btn").forEach(button=>{
      const active=button.dataset.lang===language;
      button.classList.toggle("active",active);
      button.setAttribute("aria-pressed",String(active));
    });
  }

  function showError(){
    const body=document.getElementById("article-body");
    if(body) body.innerHTML=`<p style="text-align:center;color:#748b9a;padding:54px 0;">${STATIC_TEXT[language].error}</p>`;
    document.title=`LaSiCoP · ${STATIC_TEXT[language].simulations}`;
  }

  function escapeHtml(value){
    return String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  }
})();
