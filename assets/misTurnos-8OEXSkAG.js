import{t as e}from"./Button-BA94Eo6P.js";import{t}from"./LoadingOverlay-kXZPMhPI.js";import"./auth-Dnlybq2p.js";import{t as n}from"./Card-h9AjV7B7.js";import{t as r}from"./PageHero-BIjqZC19.js";import{t as i}from"./PeriodPicker-BFBJxwd3.js";import{t as a}from"./StatGrid-B286nR4z.js";import{t as o}from"./PageSkeletons-DIYJpQOJ.js";import{t as s}from"./Toast-BLR0dPPs.js";var c=e=>document.getElementById(e),l=[`Lunes`,`Martes`,`Miercoles`,`Jueves`,`Viernes`,`Sabado`,`Domingo`],u=[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`],d=[],f=null,p=null,m=null,h=t(`Procesando...`);document.body.appendChild(h.element);var g=s();document.body.appendChild(g.element);function _(){return new Promise(e=>requestAnimationFrame(e))}function v(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function y(e){let t=new Date(e.getFullYear(),e.getMonth()+1,0);return t.setHours(0,0,0,0),t}function b(e){return String(e||``).replace(/[&<>'"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,"'":`&#39;`,'"':`&quot;`})[e])}function x(e){return!e||e.estado===`Libre`||e.tipoTurno===`Libre`?`Libre`:e.tipoTurno===`Partido`&&e.inicio2&&e.fin2?`${e.inicio1} - ${e.fin1} / ${e.inicio2} - ${e.fin2}`:`${e.inicio1||`--:--`} - ${e.fin1||`--:--`}`}function S(e){let t=String(e.tipoTurno||e.estado||`Programado`).toLowerCase();return t.includes(`libre`)?`libre`:t.includes(`partido`)?`partido`:`programado`}function C(e){return String(e.tipoTurno||``).toLowerCase()===`libre`||String(e.estado||``).toLowerCase()===`libre`?`Libre`:String(e.tipoTurno||`Programado`).trim()}function w(e){return String(e.tipoTurno||``).toLowerCase()===`libre`||String(e.estado||``).toLowerCase()===`libre`?`Libre`:e.local||`Turno`}function T(e){return String(e.tipoTurno||``).toLowerCase()===`libre`||String(e.estado||``).toLowerCase()===`libre`}function E(e){if(!Array.isArray(e)||!e.length)return[];let t=e.filter(e=>!T(e));return t.length?t:[e[0]]}function D(e,t){p={year:e,month:t}}function O(e,t){return`${e}-${String(t+1).padStart(2,`0`)}`}function k(e,t){m&&m.setValue(`mensual`,O(e,t))}function A(e){let t=new Date(p.year,p.month+e,1);k(t.getFullYear(),t.getMonth())}function j(){let e=new Date(p.year,p.month,1),t=y(e),n=e.getFullYear(),r=e.getMonth(),i=e.getDay()===0?6:e.getDay()-1,a=t.getDate();d=[];for(let e=0;e<i;e++)d.push(null);for(let e=1;e<=a;e++)d.push(new Date(n,r,e));for(;d.length%7!=0;)d.push(null);return c(`monthTitle`).innerText=`${u[e.getMonth()]} ${e.getFullYear()}`,c(`monthSubtitle`).innerText=f?`Calendario mensual de ${f.displayName||`colaborador`}`:`Sin sesión.`,{inicio:e,fin:t}}function M(e){let t=c(`summaryLegend`),n=new Map;if(e.forEach(e=>{let t=C(e),r=S(e),i=`${r}:${t.toLowerCase()}`,a=n.get(i)||{label:t,className:r,count:0};a.count+=1,n.set(i,a)}),!n.size){t.innerHTML=`<span class="text-sm font-bold text-neutral-muted">Sin turnos para este mes.</span>`;return}t.innerHTML=Array.from(n.values()).map(e=>`
    <span class="inline-flex items-center gap-sm rounded-full bg-neutral-charcoal/5 px-md py-sm text-sm font-bold text-neutral-charcoal">
      <span class="inline-flex rounded-full px-sm py-[2px] text-xs font-black ${e.className===`programado`?`bg-brand-lettuce/15 text-brand-lettuce`:e.className===`libre`?`bg-brand-cheese/35 text-brand-bun-dark`:`bg-[rgba(220,194,239,1)] text-[rgb(95,63,120)]`}">${b(e.label)}</span>
      <span>${e.count}</span>
    </span>
  `).join(``)}function N(e){let t=c(`calendarGrid`),n=v(new Date),r={};e.forEach(e=>{r[e.fecha]||(r[e.fecha]=[]),r[e.fecha].push(e)}),Object.keys(r).forEach(e=>{r[e]=E(r[e])});let i=Object.values(r).flat();if(c(`totalTurnos`).innerText=`Tienes ${i.length} turnos cargados este mes`,M(i),!e.length){t.innerHTML=`<div class="rounded-2xl border border-neutral-charcoal/10 bg-white/72 p-xl text-base font-bold text-neutral-muted">No tienes turnos asignados para este mes.</div>`;return}t.innerHTML=l.map(e=>`
    <div class="hidden rounded-2xl bg-brand-cheese/25 px-md py-sm text-center text-xs font-black uppercase tracking-[0.08em] text-brand-bun-dark md:block">${e}</div>
  `).join(``)+d.map(e=>{if(!e)return`<article class="hidden rounded-3xl border border-dashed border-neutral-charcoal/10 bg-white/28 md:block"></article>`;let t=v(e),i=(r[t]||[]).map(e=>{let t=S(e);return`
        <div class="group relative inline-flex max-w-full">
          <span class="inline-flex max-w-full cursor-default items-center gap-sm truncate rounded-full px-md py-sm text-xs font-black ${t===`programado`?`bg-brand-lettuce/15 text-brand-lettuce`:t===`libre`?`bg-brand-cheese/35 text-brand-bun-dark`:`bg-[rgba(220,194,239,1)] text-[rgb(95,63,120)]`}">
            ${b(w(e))}
          </span>
          <div class="pointer-events-none absolute left-0 top-full z-tooltip mt-sm hidden w-[220px] rounded-xl bg-neutral-charcoal px-md py-md text-xs leading-relaxed text-neutral-cream shadow-brand group-hover:block group-focus-within:block">
            <strong>Local:</strong> ${b(e.local||`Local sin definir`)}<br>
            <strong>Turno:</strong> ${b(x(e))}<br>
            <strong>Observaciones:</strong> ${b(e.observaciones||`Sin observaciones`)}
          </div>
        </div>
      `}).join(``);return`
      <article class="rounded-3xl border border-neutral-charcoal/8 bg-white/72 p-md ${t===n?`ring-2 ring-brand-bun/30`:``}">
        <div class="flex items-center justify-between gap-sm font-black text-neutral-charcoal">
          <span>${e.getDate()}</span>
          <small class="text-xs uppercase tracking-[0.05em] text-neutral-muted">${e.toLocaleDateString(`es-CL`,{weekday:`short`})}</small>
        </div>
        <div class="mt-md flex flex-wrap gap-sm">
          ${i}
        </div>
      </article>
    `}).join(``)}function P(){let t=document.createElement(`div`);t.className=`grid gap-md xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))]`,t.innerHTML=`
    <div class="grid gap-sm">
      <div id="monthPickerSlot"></div>
    </div>
    <div class="grid gap-sm">
      <span class="text-sm font-black text-transparent">A</span>
      <button id="btnMesAnterior" type="button"></button>
    </div>
    <div class="grid gap-sm">
      <span class="text-sm font-black text-transparent">A</span>
      <button id="btnMesActual" type="button"></button>
    </div>
    <div class="grid gap-sm">
      <span class="text-sm font-black text-transparent">A</span>
      <button id="btnMesSiguiente" type="button"></button>
    </div>
  `,c(`monthControlsSlot`).appendChild(t);let n=new Date;m=i({label:`Mes`,types:[`mensual`],initialType:`mensual`,initialValues:{monthly:O(p?.year??n.getFullYear(),p?.month??n.getMonth()),weekly:``,daily:``},onChange:({period:e})=>{if(!e)return;let[t,n]=e.split(`-`).map(Number);D(t,n-1),f&&I()}}),c(`monthPickerSlot`).appendChild(m.element);let r=e(`← Mes anterior`,{variant:`secondary`,fullWidth:!0,className:`min-h-[52px] bg-white/82 text-brand-bun-dark hover:bg-white`,onClick:()=>A(-1)}),a=e(`Mes actual`,{variant:`secondary`,fullWidth:!0,className:`min-h-[52px] bg-white/82 text-brand-bun-dark hover:bg-white`,onClick:()=>{let e=new Date;D(e.getFullYear(),e.getMonth()),I()}}),o=e(`Mes siguiente →`,{variant:`secondary`,fullWidth:!0,className:`min-h-[52px] bg-white/82 text-brand-bun-dark hover:bg-white`,onClick:()=>A(1)});c(`btnMesAnterior`).replaceWith(r),r.id=`btnMesAnterior`,c(`btnMesActual`).replaceWith(a),a.id=`btnMesActual`,c(`btnMesSiguiente`).replaceWith(o),o.id=`btnMesSiguiente`}function F(){let t=c(`app`),i=document.createElement(`div`);i.className=`mx-auto flex min-h-screen w-full max-w-[1320px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl`;let o=document.createElement(`div`);o.id=`sessionUser`,o.className=`rounded-2xl border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-lg text-sm font-black leading-relaxed text-neutral-cream md:text-base`,o.textContent=`Validando sesión...`;let s=document.createElement(`div`);s.className=`flex flex-col gap-md`;let l=e(`Cerrar sesión`,{variant:`primary`,fullWidth:!0,onClick:async()=>{h.setLoading(!0,`Cerrando sesión...`),await _(),await window.LVAuth.logout(),window.LVAuth.redirectToIndex()}});s.append(l);let u=r({badge:`La Victoria · Mis Turnos`,title:`Mis turnos`,lead:`Vista personal tipo calendario. Muestra todos tus turnos del mes, incluyendo distintos locales.`,highlights:a([{label:`Vista`,value:`Calendario mensual`,detail:`Todos tus turnos agrupados por dia.`},{label:`Entorno`,value:(window.APP_CONFIG?.ENVIRONMENT||`prod`).toUpperCase(),detail:`Puedes validar el flujo en prod o staging.`},{label:`Cobertura`,value:`Multi local`,detail:`Un solo calendario para distintos locales asignados.`}],{tone:`dark`}),sideTitle:`Sesion`,sideStatus:o,sideCopy:`Esta vista esta pensada para consulta rapida desde movil, pero mantiene suficiente detalle para escritorio.`,sideActions:s,layoutClassName:`lg:gap-4xl`,contentClassName:`lg:basis-[68%]`,titleClassName:`max-w-[11ch] text-[clamp(44px,6vw,72px)]`,leadClassName:`max-w-[62ch]`,sideClassName:`lg:w-[300px]`}),d=n({eyebrow:`Navegacion`,title:`Seleccion de mes`,body:`Cambia el periodo para revisar tus turnos cargados por mes.`,className:`relative z-20 overflow-visible rounded-3xl md:p-2xl`}),f=document.createElement(`div`);f.id=`monthControlsSlot`,d.appendChild(f);let p=n({eyebrow:`Calendario`,title:`Resumen mensual`,body:``,className:`relative z-10 rounded-3xl md:p-2xl`});return p.innerHTML+=`
    <section class="mt-xl rounded-3xl border border-neutral-charcoal/8 bg-white/74 p-lg">
      <div class="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap items-center gap-md">
          <h3 class="text-xl font-black text-neutral-charcoal">Resumen mensual</h3>
          <span id="totalTurnos" class="text-sm font-bold text-neutral-muted">0 turnos</span>
        </div>
        <div id="summaryLegend" class="flex flex-wrap gap-sm"></div>
      </div>
      <div class="mt-xl flex flex-col gap-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="monthTitle" class="text-3xl font-black text-neutral-charcoal">Mes</h2>
          <p id="monthSubtitle" class="mt-sm text-sm font-bold text-neutral-muted">Preparando consulta...</p>
        </div>
      </div>
      <div id="calendarGrid" class="mt-xl grid gap-md md:grid-cols-7">
        <div class="rounded-2xl border border-neutral-charcoal/10 bg-white/72 p-xl text-base font-bold text-neutral-muted">Cargando turnos...</div>
      </div>
    </section>
  `,i.append(u,d,p),t.replaceChildren(i),P(),{sessionUser:o}}async function I(){let e=j();h.setLoading(!0,`Cargando calendario...`);try{let t=await window.LVAuth.apiGet({accion:`TurnosSemanaColaborador`,fechaInicio:v(e.inicio),fechaFin:v(e.fin)});if(t.status!==`SUCCESS`)throw Error(t.mensaje||`No se pudieron cargar tus turnos.`);N(t.turnos||[]),g.show(`success`,`Calendario cargado correctamente.`)}catch(e){if(c(`calendarGrid`).innerHTML=`<div class="rounded-2xl border border-neutral-charcoal/10 bg-white/72 p-xl text-base font-bold text-neutral-muted">No se pudo cargar el calendario.</div>`,e.code===`UNAUTHORIZED`){window.LVAuth.redirectToIndex(`session`);return}g.show(`error`,e.message||`Error al cargar tus turnos.`)}finally{h.setLoading(!1)}}document.addEventListener(`DOMContentLoaded`,async()=>{if(c(`app`).innerHTML=``,o({mountNode:c(`app`),variant:`calendar`}),h.setLoading(!0,`Validando sesión...`,`Estamos cargando tu calendario personal y verificando qué turnos puedes consultar.`),f=await window.LVAuth.protectPage([window.LVAuth.roles.COLABORADOR,window.LVAuth.roles.SUPERVISOR]),!f)return;let{sessionUser:e}=F();e.textContent=`${f.displayName||f.role} · ${f.role}`;let t=new Date;k(t.getFullYear(),t.getMonth())});