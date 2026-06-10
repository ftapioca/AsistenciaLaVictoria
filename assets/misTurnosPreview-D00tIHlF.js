import{n as e,t}from"./Card-FV6JpNJ0.js";import{t as n}from"./LoadingOverlay-CQ7uFTWQ.js";import{t as r}from"./PageHero-EdS9aL4w.js";import{t as i}from"./PeriodPicker-DR7xGwl_.js";import{t as a}from"./StatGrid-IN-r1M6X.js";import{t as o}from"./Toast-CEbevfWb.js";var s=e=>document.getElementById(e),c=[`Lunes`,`Martes`,`Miercoles`,`Jueves`,`Viernes`,`Sabado`,`Domingo`],l=[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`],u=[],d=null,f=null,p=n(`Preview visual`);document.body.appendChild(p.element);var m=o();document.body.appendChild(m.element);function h(e){let t=new URL(e,window.location.href),n=window.APP_CONFIG&&window.APP_CONFIG.ENVIRONMENT;return n&&t.searchParams.set(`env`,n),t.toString()}function g(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function _(e){let t=new Date(e.getFullYear(),e.getMonth()+1,0);return t.setHours(0,0,0,0),t}function v(e){return String(e||``).replace(/[&<>'"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,"'":`&#39;`,'"':`&quot;`})[e])}function y(e){return!e||e.estado===`Libre`||e.tipoTurno===`Libre`?`Libre`:e.tipoTurno===`Partido`&&e.inicio2&&e.fin2?`${e.inicio1} - ${e.fin1} / ${e.inicio2} - ${e.fin2}`:`${e.inicio1||`--:--`} - ${e.fin1||`--:--`}`}function b(e){let t=String(e.tipoTurno||e.estado||`Programado`).toLowerCase();return t.includes(`libre`)?`libre`:t.includes(`partido`)?`partido`:`programado`}function x(e){return String(e.tipoTurno||``).toLowerCase()===`libre`||String(e.estado||``).toLowerCase()===`libre`?`Libre`:String(e.tipoTurno||`Programado`).trim()}function S(e){return String(e.tipoTurno||``).toLowerCase()===`libre`||String(e.estado||``).toLowerCase()===`libre`?`Libre`:e.local||`Turno`}function C(e){return String(e.tipoTurno||``).toLowerCase()===`libre`||String(e.estado||``).toLowerCase()===`libre`}function w(e){if(!Array.isArray(e)||!e.length)return[];let t=e.filter(e=>!C(e));return t.length?t:[e[0]]}function T(e,t){d={year:e,month:t}}function E(){let e=new Date(d.year,d.month,1),t=_(e),n=e.getFullYear(),r=e.getMonth(),i=e.getDay()===0?6:e.getDay()-1,a=t.getDate();u=[];for(let e=0;e<i;e++)u.push(null);for(let e=1;e<=a;e++)u.push(new Date(n,r,e));for(;u.length%7!=0;)u.push(null);return s(`monthTitle`).innerText=`${l[e.getMonth()]} ${e.getFullYear()}`,s(`monthSubtitle`).innerText=`Calendario mensual mock para revisar diseño.`,{inicio:e,fin:t}}function D(e,t){let n=e.getFullYear(),r=e.getMonth(),i=t.getDate(),a=[];for(let e=1;e<=i;e++){let t=new Date(n,r,e),i=g(t),o=t.getDay();if(o===0){a.push({fecha:i,local:`Libre`,tipoTurno:`Libre`,estado:`Libre`,observaciones:`Descanso semanal`});continue}if(o===6){a.push({fecha:i,local:`Paseo del Lago`,tipoTurno:`Partido`,estado:`Programado`,inicio1:`11:30`,fin1:`15:00`,inicio2:`18:30`,fin2:`22:30`,observaciones:`Turno partido de fin de semana`});continue}a.push({fecha:i,local:o%2==0?`Segunda Faja`:`Paseo del Lago`,tipoTurno:`Programado`,estado:`Programado`,inicio1:o===5?`12:00`:`10:00`,fin1:o===5?`20:30`:`18:30`,observaciones:o===3?`Apoyo apertura y cierre`:`Turno regular`})}return a}function O(e){let t=s(`summaryLegend`),n=new Map;if(e.forEach(e=>{let t=x(e),r=b(e),i=`${r}:${t.toLowerCase()}`,a=n.get(i)||{label:t,className:r,count:0};a.count+=1,n.set(i,a)}),!n.size){t.innerHTML=`<span class="text-sm font-bold text-neutral-muted">Sin turnos para este mes.</span>`;return}t.innerHTML=Array.from(n.values()).map(e=>`
    <span class="inline-flex items-center gap-sm rounded-full bg-neutral-charcoal/5 px-md py-sm text-sm font-bold text-neutral-charcoal">
      <span class="inline-flex rounded-full px-sm py-[2px] text-xs font-black ${e.className===`programado`?`bg-brand-lettuce/15 text-brand-lettuce`:e.className===`libre`?`bg-brand-cheese/35 text-brand-bun-dark`:`bg-[rgba(220,194,239,1)] text-[rgb(95,63,120)]`}">${v(e.label)}</span>
      <span>${e.count}</span>
    </span>
  `).join(``)}function k(e){let t=s(`calendarGrid`),n=g(new Date),r={};e.forEach(e=>{r[e.fecha]||(r[e.fecha]=[]),r[e.fecha].push(e)}),Object.keys(r).forEach(e=>{r[e]=w(r[e])});let i=Object.values(r).flat();s(`totalTurnos`).innerText=`Tienes ${i.length} turnos mock este mes`,O(i),t.innerHTML=c.map(e=>`
    <div class="hidden rounded-2xl bg-brand-cheese/25 px-md py-sm text-center text-xs font-black uppercase tracking-[0.08em] text-brand-bun-dark md:block">${e}</div>
  `).join(``)+u.map(e=>{if(!e)return`<article class="hidden rounded-3xl border border-dashed border-neutral-charcoal/10 bg-white/28 md:block"></article>`;let t=g(e),i=(r[t]||[]).map(e=>{let t=b(e);return`
        <div class="group relative inline-flex max-w-full">
          <span class="inline-flex max-w-full cursor-default items-center gap-sm truncate rounded-full px-md py-sm text-xs font-black ${t===`programado`?`bg-brand-lettuce/15 text-brand-lettuce`:t===`libre`?`bg-brand-cheese/35 text-brand-bun-dark`:`bg-[rgba(220,194,239,1)] text-[rgb(95,63,120)]`}">
            ${v(S(e))}
          </span>
          <div class="pointer-events-none absolute left-0 top-full z-tooltip mt-sm hidden w-[220px] rounded-xl bg-neutral-charcoal px-md py-md text-xs leading-relaxed text-neutral-cream shadow-brand group-hover:block group-focus-within:block">
            <strong>Local:</strong> ${v(e.local||`Local sin definir`)}<br>
            <strong>Turno:</strong> ${v(y(e))}<br>
            <strong>Observaciones:</strong> ${v(e.observaciones||`Sin observaciones`)}
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
    `}).join(``)}function A(){let e=E();k(D(e.inicio,e.fin)),m.show(`success`,`Preview visual cargada correctamente.`)}function j(e,t){return`${e}-${String(t+1).padStart(2,`0`)}`}function M(e,t){f&&f.setValue(`mensual`,j(e,t))}function N(){let t=document.createElement(`div`);t.className=`grid gap-md xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))]`,t.innerHTML=`
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
  `,s(`monthControlsSlot`).appendChild(t);let n=new Date;f=i({label:`Mes`,types:[`mensual`],initialType:`mensual`,initialValues:{monthly:j(d?.year??n.getFullYear(),d?.month??n.getMonth()),weekly:``,daily:``},onChange:({period:e})=>{if(!e)return;let[t,n]=e.split(`-`).map(Number);T(t,n-1),A()}}),s(`monthPickerSlot`).appendChild(f.element);let r=e(`← Mes anterior`,{variant:`secondary`,fullWidth:!0,className:`min-h-[52px] bg-white/82 text-brand-bun-dark hover:bg-white`,onClick:()=>{let e=new Date(d.year,d.month-1,1);M(e.getFullYear(),e.getMonth())}}),a=e(`Mes actual`,{variant:`secondary`,fullWidth:!0,className:`min-h-[52px] bg-white/82 text-brand-bun-dark hover:bg-white`,onClick:()=>{let e=new Date;M(e.getFullYear(),e.getMonth())}}),o=e(`Mes siguiente →`,{variant:`secondary`,fullWidth:!0,className:`min-h-[52px] bg-white/82 text-brand-bun-dark hover:bg-white`,onClick:()=>{let e=new Date(d.year,d.month+1,1);M(e.getFullYear(),e.getMonth())}});s(`btnMesAnterior`).replaceWith(r),r.id=`btnMesAnterior`,s(`btnMesActual`).replaceWith(a),a.id=`btnMesActual`,s(`btnMesSiguiente`).replaceWith(o),o.id=`btnMesSiguiente`}function P(){let n=s(`app`),i=document.createElement(`div`);i.className=`mx-auto flex min-h-screen w-full max-w-[1320px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl`;let o=document.createElement(`div`);o.className=`rounded-2xl border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-lg text-sm font-black leading-relaxed text-neutral-cream md:text-base`,o.textContent=`Felipe Tapia · Colaborador`;let c=document.createElement(`div`);c.className=`flex flex-col gap-md`,c.append(e(`Volver al ingreso`,{variant:`secondary`,fullWidth:!0,className:`bg-white/88 text-neutral-charcoal hover:bg-white`,onClick:()=>{window.location.href=h(`index.html`)}}));let l=r({badge:`La Victoria · Mis Turnos`,title:`Mis turnos`,lead:`Preview visual del calendario personal. Sirve para revisar layout, densidad de información y comportamiento responsive sin depender de sesión ni backend.`,highlights:a([{label:`Vista`,value:`Calendario mensual`,detail:`Todos tus turnos agrupados por día.`},{label:`Entorno`,value:(window.APP_CONFIG?.ENVIRONMENT||`prod`).toUpperCase(),detail:`La preview respeta el entorno activo del frontend.`},{label:`Estado`,value:`Preview sin auth`,detail:`Navegación y datos simulados solo para revisión visual.`}],{tone:`dark`}),sideTitle:`Preview`,sideStatus:o,sideCopy:`Puedes cambiar de mes y validar densidad del calendario, pills, tooltips y estados visuales antes de conectar flujos reales.`,sideActions:c,layoutClassName:`lg:gap-4xl`,contentClassName:`lg:basis-[68%]`,titleClassName:`max-w-[11ch] text-[clamp(44px,6vw,72px)]`,leadClassName:`max-w-[62ch]`,sideClassName:`lg:w-[300px]`}),u=t({eyebrow:`Navegacion`,title:`Seleccion de mes`,body:`Cambia el periodo para revisar el comportamiento visual del calendario.`,className:`relative z-20 overflow-visible rounded-3xl md:p-2xl`}),d=document.createElement(`div`);d.id=`monthControlsSlot`,u.appendChild(d);let f=t({eyebrow:`Calendario`,title:`Resumen mensual`,body:``,className:`relative z-10 rounded-3xl md:p-2xl`});f.innerHTML+=`
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
          <p id="monthSubtitle" class="mt-sm text-sm font-bold text-neutral-muted">Preparando preview...</p>
        </div>
      </div>
      <div id="calendarGrid" class="mt-xl grid gap-md md:grid-cols-7">
        <div class="rounded-2xl border border-neutral-charcoal/10 bg-white/72 p-xl text-base font-bold text-neutral-muted">Cargando preview...</div>
      </div>
    </section>
  `,i.append(l,u,f),n.appendChild(i),N()}P();