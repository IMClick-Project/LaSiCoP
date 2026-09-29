(function(){
  "use strict";

  const COLORS={ink:"#0e4168",cyan:"#35b9c3",grid:"rgba(14,65,104,.12)",muted:"#748b9a"};
  const VALVE_NOTES={
    es:{quick:"Apertura rápida: el coeficiente aumenta con rapidez a bajas aperturas.",linear:"Lineal: el coeficiente relativo cambia proporcionalmente con la apertura.",equal:"Isoporcentual exponencial: cada incremento de apertura produce un cambio relativo aproximadamente constante.",rational:"Isoporcentual racional: utiliza la forma racional definida para el modelo de LaSiCoP."},
    en:{quick:"Quick opening: the coefficient rises rapidly at low openings.",linear:"Linear: the relative coefficient changes proportionally with opening.",equal:"Exponential equal percentage: each opening increment produces an approximately constant relative change.",rational:"Rational equal percentage: uses the rational form defined for the LaSiCoP model."}
  };

  function lang(){return document.documentElement.lang==="en"?"en":"es";}

  function valveValue(type,u){
    u=Math.max(0,Math.min(1,u));
    if(type==="quick") return Math.sqrt(u);
    if(type==="equal") return Math.pow(50,u-1);
    if(type==="rational"){
      const alpha=.2;
      return (alpha*u)/(1+(alpha-1)*u);
    }
    return u;
  }

  function prepCanvas(canvas,ratio=.53){
    const dpr=Math.max(1,window.devicePixelRatio||1);
    const rect=canvas.getBoundingClientRect();
    const w=Math.max(300,Math.round(rect.width||640));
    const h=Math.max(220,Math.round(w*ratio));
    canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.height=h+"px";
    const ctx=canvas.getContext("2d");
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return {ctx,w,h};
  }

  function drawValveAxes(ctx,w,h){
    const m={l:56,r:20,t:20,b:44};
    ctx.clearRect(0,0,w,h);ctx.font="12px Inter, sans-serif";
    for(let i=0;i<=5;i++){
      const x=m.l+(w-m.l-m.r)*i/5,y=m.t+(h-m.t-m.b)*i/5;
      ctx.strokeStyle=COLORS.grid;ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(x,m.t);ctx.lineTo(x,h-m.b);ctx.stroke();
      ctx.beginPath();ctx.moveTo(m.l,y);ctx.lineTo(w-m.r,y);ctx.stroke();
      ctx.fillStyle=COLORS.muted;ctx.fillText((i/5).toFixed(1),x-8,h-m.b+20);ctx.fillText((1-i/5).toFixed(1),16,y+4);
    }
    ctx.strokeStyle=COLORS.ink;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(m.l,m.t);ctx.lineTo(m.l,h-m.b);ctx.lineTo(w-m.r,h-m.b);ctx.stroke();
    ctx.fillStyle=COLORS.ink;ctx.font="600 12px Inter, sans-serif";ctx.fillText("u",w/2,h-8);
    ctx.save();ctx.translate(14,h/2+24);ctx.rotate(-Math.PI/2);ctx.fillText("Cv / Cvmax",0,0);ctx.restore();
    return m;
  }

  function initValve(widget){
    if(widget.dataset.initialized==="1") return;
    widget.dataset.initialized="1";
    const type=widget.querySelector('[data-role="valve-type"]'),opening=widget.querySelector('[data-role="opening"]'),openingText=widget.querySelector('[data-role="opening-value"]'),uText=widget.querySelector('[data-role="u-value"]'),cvText=widget.querySelector('[data-role="cv-value"]'),note=widget.querySelector('[data-role="valve-note"]'),canvas=widget.querySelector('[data-role="valve-canvas"]');
    if(!type||!opening||!canvas) return;

    function draw(){
      const u=Number(opening.value)/100,v=valveValue(type.value,u);
      openingText.textContent=opening.value+" %";uText.textContent=u.toFixed(2);cvText.textContent=v.toFixed(3);
      if(note) note.textContent=(VALVE_NOTES[lang()]||VALVE_NOTES.es)[type.value];
      const {ctx,w,h}=prepCanvas(canvas),m=drawValveAxes(ctx,w,h);
      ctx.strokeStyle=COLORS.cyan;ctx.lineWidth=3;ctx.beginPath();
      for(let i=0;i<=100;i++){
        const x=i/100,y=valveValue(type.value,x),px=m.l+(w-m.l-m.r)*x,py=m.t+(h-m.t-m.b)*(1-y);
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.stroke();
      const px=m.l+(w-m.l-m.r)*u,py=m.t+(h-m.t-m.b)*(1-v);
      ctx.fillStyle=COLORS.ink;ctx.beginPath();ctx.arc(px,py,6,0,Math.PI*2);ctx.fill();
    }
    type.addEventListener("change",draw);opening.addEventListener("input",draw);
    const ro=window.ResizeObserver?new ResizeObserver(draw):null;if(ro)ro.observe(widget);else window.addEventListener("resize",draw);
    draw();
  }

  function initTank(widget){
    if(widget.dataset.initialized==="1") return;
    widget.dataset.initialized="1";
    const opening=widget.querySelector('[data-role="tank-opening"]'),type=widget.querySelector('[data-role="tank-valve-type"]'),fluid=widget.querySelector('[data-role="fluid"]'),speed=widget.querySelector('[data-role="speed"]'),openingText=widget.querySelector('[data-role="tank-opening-value"]'),qinText=widget.querySelector('[data-role="qin-value"]'),qoutText=widget.querySelector('[data-role="qout-value"]'),levelText=widget.querySelector('[data-role="tank-level-value"]'),levelBadge=widget.querySelector('[data-role="level-badge"]'),timeText=widget.querySelector('[data-role="tank-time-value"]'),startBtn=widget.querySelector('[data-role="start"]'),resetBtn=widget.querySelector('[data-role="reset"]'),canvas=widget.querySelector('[data-role="tank-canvas"]');
    if(!opening||!type||!fluid||!canvas) return;

    const dT=2,do_=0.1,hmax=3,g=9.81,Cd=.62,dPpsi=10,Cvmax=300,A=Math.PI*dT*dT/4,Ao=Math.PI*do_*do_/4;
    let h=1.5,t=0,running=false,last=null,history=[[0,h]],raf=null;
    const qin=()=>{const u=Number(opening.value)/100,Cv=Cvmax*valveValue(type.value,u),Gf=Number(fluid.value);return (Cv/15.85037*Math.sqrt(dPpsi/Gf))/1000;};
    const qout=()=>Cd*Ao*Math.sqrt(2*g*Math.max(h,0));

    function draw(){
      const qi=qin(),qo=qout();
      openingText.textContent=opening.value+" %";qinText.textContent=(qi*1000).toFixed(2)+" L/s";qoutText.textContent=(qo*1000).toFixed(2)+" L/s";levelText.textContent=h.toFixed(2)+" m";levelBadge.textContent="h = "+h.toFixed(2)+" m";timeText.textContent=t.toFixed(1)+" s";
      const c=prepCanvas(canvas),ctx=c.ctx,w=c.w,ch=c.h,m={l:58,r:20,t:20,b:44};
      ctx.clearRect(0,0,w,ch);ctx.font="12px Inter, sans-serif";
      for(let i=0;i<=6;i++){
        const x=m.l+(w-m.l-m.r)*i/6;ctx.strokeStyle=COLORS.grid;ctx.beginPath();ctx.moveTo(x,m.t);ctx.lineTo(x,ch-m.b);ctx.stroke();ctx.fillStyle=COLORS.muted;ctx.fillText(String(i*10),x-7,ch-m.b+20);
      }
      for(let i=0;i<=6;i++){
        const y=m.t+(ch-m.t-m.b)*i/6;ctx.strokeStyle=COLORS.grid;ctx.beginPath();ctx.moveTo(m.l,y);ctx.lineTo(w-m.r,y);ctx.stroke();ctx.fillStyle=COLORS.muted;ctx.fillText((hmax*(1-i/6)).toFixed(1),18,y+4);
      }
      ctx.strokeStyle=COLORS.ink;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(m.l,m.t);ctx.lineTo(m.l,ch-m.b);ctx.lineTo(w-m.r,ch-m.b);ctx.stroke();
      ctx.fillStyle=COLORS.ink;ctx.font="600 12px Inter, sans-serif";ctx.fillText("t (s)",w/2,ch-8);ctx.save();ctx.translate(14,ch/2+18);ctx.rotate(-Math.PI/2);ctx.fillText("h (m)",0,0);ctx.restore();
      ctx.strokeStyle=COLORS.cyan;ctx.lineWidth=3;ctx.beginPath();
      history.forEach((p,i)=>{const px=m.l+(w-m.l-m.r)*Math.min(p[0],60)/60,py=m.t+(ch-m.t-m.b)*(1-Math.min(Math.max(p[1],0),hmax)/hmax);i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);});ctx.stroke();
      if(history.length){const p=history[history.length-1],px=m.l+(w-m.l-m.r)*Math.min(p[0],60)/60,py=m.t+(ch-m.t-m.b)*(1-Math.min(Math.max(p[1],0),hmax)/hmax);ctx.fillStyle=COLORS.ink;ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill();}
    }

    function step(ts){
      if(!running)return;if(last===null)last=ts;const realDt=Math.min((ts-last)/1000,.05);last=ts;const simDt=realDt*Number(speed.value);
      const dh=(qin()-qout())/A;h=Math.max(0,Math.min(hmax,h+simDt*dh));t+=simDt;if(t-history[history.length-1][0]>=.15)history.push([t,h]);
      if(t>=60){running=false;startBtn.textContent=lang()==="en"?"Start":"Iniciar";last=null;}
      draw();if(running)raf=requestAnimationFrame(step);
    }

    opening.addEventListener("input",draw);type.addEventListener("change",draw);fluid.addEventListener("change",draw);speed.addEventListener("change",draw);
    startBtn.addEventListener("click",()=>{running=!running;startBtn.textContent=running?(lang()==="en"?"Pause":"Pausar"):(lang()==="en"?"Start":"Iniciar");last=null;if(running)raf=requestAnimationFrame(step);});
    resetBtn.addEventListener("click",()=>{running=false;if(raf)cancelAnimationFrame(raf);h=1.5;t=0;history=[[0,h]];last=null;startBtn.textContent=lang()==="en"?"Start":"Iniciar";draw();});
    const ro=window.ResizeObserver?new ResizeObserver(draw):null;if(ro)ro.observe(widget);else window.addEventListener("resize",draw);
    draw();
  }

  function initLaSiCoPWidgets(root=document){
    root.querySelectorAll('[data-widget="valve-curve"]').forEach(initValve);
    root.querySelectorAll('[data-widget="tank-response"]').forEach(initTank);
  }

  window.initLaSiCoPWidgets=initLaSiCoPWidgets;
})();
