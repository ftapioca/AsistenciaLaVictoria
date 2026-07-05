import{n as e,t}from"./Card-FV6JpNJ0.js";import{t as n}from"./LoadingOverlay-B8G4qlvs.js";import"./auth-DPZ3hZHQ.js";import{t as r}from"./PageHero-EdS9aL4w.js";import{t as i}from"./PeriodPicker-DR7xGwl_.js";import{t as a}from"./StatGrid-IN-r1M6X.js";import{t as o}from"./Toast-CEbevfWb.js";var s=e=>document.getElementById(e),c=[`Lunes`,`Martes`,`Miercoles`,`Jueves`,`Viernes`,`Sabado`,`Domingo`],l=[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`],u=[],d=null,f=null,p=null,m=n(`Procesando...`);document.body.appendChild(m.element);var h=o();document.body.appendChild(h.element);function g(){return new Promise(e=>requestAnimationFrame(e))}function _(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function v(e){let t=new Date(e.getFullYear(),e.getMonth()+1,0);return t.setHours(0,0,0,0),t}function y(e){return String(e||``).replace(/[&<>'"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,"'":`&#39;`,'"':`&quot;`})[e])}function b(e){return!e||e.estado===`Libre`||e.tipoTurno===`Libre`?`Libre`:e.tipoTurno===`Partido`&&e.inicio2&&e.fin2?`${e.inicio1} - ${e.fin1} / ${e.inicio2} - ${e.fin2}`:`${e.inicio1||`--:--`} - ${e.fin1||`--:--`}`}function x(e){let t=String(e.tipoTurno||e.estado||`Programado`).toLowerCase();return t.includes(`libre`)?`libre`:t.includes(`partido`)?`partido`:`programado`}function S(e){return String(e.tipoTurno||``).toLowerCase()===`libre`||String(e.estado||``).toLowerCase()===`libre`?`Libre`:String(e.tipoTurno||`Programado`).trim()}function C(e){return String(e.tipoTurno||``).toLowerCase()===`libre`||String(e.estado||``).toLowerCase()===`libre`?`Libre`:e.local||`Turno`}function w(e){return String(e.tipoTurno||``).toLowerCase()===`libre`||String(e.estado||``).toLowerCase()===`libre`}function T(e){if(!Array.isArray(e)||!e.length)return[];let t=e.filter(e=>!w(e));return t.length?t:[e[0]]}function E(e,t){f={year:e,month:t}}function D(e,t){return`${e}-${String(t+1).padStart(2,`0`)}`}function O(e,t){p&&p.setValue(`mensual`,D(e,t))}function k(e){let t=new Date(f.year,f.month+e,1);O(t.getFullYear(),t.getMonth())}function A(){let e=new Date(f.year,f.month,1),t=v(e),n=e.getFullYear(),r=e.getMonth(),i=e.getDay()===0?6:e.getDay()-1,a=t.getDate();u=[];for(let e=0;e<i;e++)u.push(null);for(let e=1;e<=a;e++)u.push(new Date(n,r,e));for(;u.length%7!=0;)u.push(null);return s(`monthTitle`).innerText=`${l[e.getMonth()]} ${e.getFullYear()}`,s(`monthSubtitle`).innerText=d?`Calendario mensual de ${d.displayName||`colaborador`}`:`Sin sesión.`,{inicio:e,fin:t}}function j(e){let t=s(`summaryLegend`),n=new Map;if(e.forEach(e=>{let t=S(e),r=x(e),i=`${r}:${t.toLowerCase()}`,a=n.get(i)||{label:t,className:r,count:0};a.count+=1,n.set(i,a)}),!n.size){t.innerHTML=`<span class="text-sm font-bold text-neutral-muted">Sin turnos para este mes.</span>`;return}t.innerHTML=Array.from(n.values()).map(e=>`
    <span class="inline-flex items-center gap-sm rounded-full bg-neutral-charcoal/5 px-md py-sm text-sm font-bold text-neutral-charcoal">
      <span class="inline-flex rounded-full px-sm py-[2px] text-xs font-black ${e.className===`programado`?`bg-brand-lettuce/15 text-brand-lettuce`:e.className===`libre`?`bg-brand-cheese/35 text-brand-bun-dark`:`bg-[rgba(220,194,239,1)] text-[rgb(95,63,120)]`}">${y(e.label)}</span>
      <span>${e.count}</span>
    </span>
  `).join(``)}function M(e){let t=s(`calendarGrid`),n=_(new Date),r={};e.forEach(e=>{r[e.fecha]||(r[e.fecha]=[]),r[e.fecha].push(e)}),Object.keys(r).forEach(e=>{r[e]=T(r[e])});let i=Object.values(r).flat();if(s(`totalTurnos`).innerText=`Tienes ${i.length} turnos cargados este mes`,j(i),!e.length){t.innerHTML=`<div class="rounded-2xl border border-neutral-charcoal/10 bg-white/72 p-xl text-base font-bold text-neutral-muted">No tienes turnos asignados para este mes.</div>`;return}t.innerHTML=c.map(e=>`
    <div class="hidden rounded-2xl bg-brand-cheese/25 px-md py-sm text-center text-xs font-black uppercase tracking-[0.08em] text-brand-bun-dark md:block">${e}</div>
  `).join(``)+u.map(e=>{if(!e)return`<article class="hidden rounded-3xl border border-dashed border-neutral-charcoal/10 bg-white/28 md:block"></article>`;let t=_(e),i=(r[t]||[]).map(e=>{let t=x(e);return`
        <div class="group relative inline-flex max-w-full">
          <span class="inline-flex max-w-full cursor-default items-center gap-sm truncate rounded-full px-md py-sm text-xs font-black ${t===`programado`?`bg-brand-lettuce/15 text-brand-lettuce`:t===`libre`?`bg-brand-cheese/35 text-brand-bun-dark`:`bg-[rgba(220,194,239,1)] text-[rgb(95,63,120)]`}">
            ${y(C(e))}
          </span>
          <div class="pointer-events-none absolute left-0 top-full z-tooltip mt-sm hidden w-[220px] rounded-xl bg-neutral-charcoal px-md py-md text-xs leading-relaxed text-neutral-cream shadow-brand group-hover:block group-focus-within:block">
            <strong>Local:</strong> ${y(e.local||`Local sin definir`)}<br>
            <strong>Turno:</strong> ${y(b(e))}<br>
            <strong>Observaciones:</strong> ${y(e.observaciones||`Sin observaciones`)}
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
    `}).join(``)}function N(){let t=document.createElement(`div`);t.className=`grid gap-md xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))]`,t.innerHTML=`
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
  `,s(`monthControlsSlot`).appendChild(t);let n=new Date;p=i({label:`Mes`,types:[`mensual`],initialType:`mensual`,initialValues:{monthly:D(f?.year??n.getFullYear(),f?.month??n.getMonth()),weekly:``,daily:``},onChange:({period:e})=>{if(!e)return;let[t,n]=e.split(`-`).map(Number);E(t,n-1),d&&F()}}),s(`monthPickerSlot`).appendChild(p.element);let r=e(`← Mes anterior`,{variant:`secondary`,fullWidth:!0,className:`min-h-[52px] bg-white/82 text-brand-bun-dark hover:bg-white`,onClick:()=>k(-1)}),a=e(`Mes actual`,{variant:`secondary`,fullWidth:!0,className:`min-h-[52px] bg-white/82 text-brand-bun-dark hover:bg-white`,onClick:()=>{let e=new Date;E(e.getFullYear(),e.getMonth()),F()}}),o=e(`Mes siguiente →`,{variant:`secondary`,fullWidth:!0,className:`min-h-[52px] bg-white/82 text-brand-bun-dark hover:bg-white`,onClick:()=>k(1)});s(`btnMesAnterior`).replaceWith(r),r.id=`btnMesAnterior`,s(`btnMesActual`).replaceWith(a),a.id=`btnMesActual`,s(`btnMesSiguiente`).replaceWith(o),o.id=`btnMesSiguiente`}function P(){let n=s(`app`),i=document.createElement(`div`);i.className=`mx-auto flex min-h-screen w-full max-w-[1320px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl`;let o=document.createElement(`div`);o.id=`sessionUser`,o.className=`rounded-2xl border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-lg text-sm font-black leading-relaxed text-neutral-cream md:text-base`,o.textContent=`Validando sesión...`;let c=document.createElement(`div`);c.className=`flex flex-col gap-md`;let l=e(`Cerrar sesión`,{variant:`primary`,fullWidth:!0,onClick:async()=>{m.setLoading(!0,`Cerrando sesión...`),await g(),await window.LVAuth.logout(),window.LVAuth.redirectToIndex()}});c.append(l);let u=r({badge:`La Victoria · Mis Turnos`,title:`Mis turnos`,lead:`Vista personal tipo calendario. Muestra todos tus turnos del mes, incluyendo distintos locales.`,highlights:a([{label:`Vista`,value:`Calendario mensual`,detail:`Todos tus turnos agrupados por dia.`},{label:`Entorno`,value:(window.APP_CONFIG?.ENVIRONMENT||`prod`).toUpperCase(),detail:`Puedes validar el flujo en prod o staging.`},{label:`Cobertura`,value:`Multi local`,detail:`Un solo calendario para distintos locales asignados.`}],{tone:`dark`}),sideTitle:`Sesion`,sideStatus:o,sideCopy:`Esta vista esta pensada para consulta rapida desde movil, pero mantiene suficiente detalle para escritorio.`,sideActions:c,layoutClassName:`lg:gap-4xl`,contentClassName:`lg:basis-[68%]`,titleClassName:`max-w-[11ch] text-[clamp(44px,6vw,72px)]`,leadClassName:`max-w-[62ch]`,sideClassName:`lg:w-[300px]`}),d=t({eyebrow:`Navegacion`,title:`Seleccion de mes`,body:`Cambia el periodo para revisar tus turnos cargados por mes.`,className:`relative z-20 overflow-visible rounded-3xl md:p-2xl`}),f=document.createElement(`div`);f.id=`monthControlsSlot`,d.appendChild(f);let p=t({eyebrow:`Calendario`,title:`Resumen mensual`,body:``,className:`relative z-10 rounded-3xl md:p-2xl`});return p.innerHTML+=`
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
  `,i.append(u,d,p),n.appendChild(i),N(),{sessionUser:o}}async function F(){let e=A();m.setLoading(!0,`Cargando calendario...`);try{let t=await window.LVAuth.apiGet({accion:`TurnosSemanaColaborador`,fechaInicio:_(e.inicio),fechaFin:_(e.fin)});if(t.status!==`SUCCESS`)throw Error(t.mensaje||`No se pudieron cargar tus turnos.`);M(t.turnos||[]),h.show(`success`,`Calendario cargado correctamente.`)}catch(e){if(s(`calendarGrid`).innerHTML=`<div class="rounded-2xl border border-neutral-charcoal/10 bg-white/72 p-xl text-base font-bold text-neutral-muted">No se pudo cargar el calendario.</div>`,e.code===`UNAUTHORIZED`||e.code===`FORBIDDEN`){window.LVAuth.redirectToIndex(`session`);return}h.show(`error`,e.message||`Error al cargar tus turnos.`)}finally{m.setLoading(!1)}}var{sessionUser:I}=P();document.addEventListener(`DOMContentLoaded`,async()=>{if(d=await window.LVAuth.protectPage([`Colaborador`]),!d)return;I.textContent=`${d.displayName||`Colaborador`} · ${d.role}`;let e=new Date;O(e.getFullYear(),e.getMonth())});