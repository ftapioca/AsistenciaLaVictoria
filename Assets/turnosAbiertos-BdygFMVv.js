import{n as e,t}from"./Card-C4CM9mAb.js";import{t as n}from"./LoadingOverlay-CsAh6-dh.js";import"./auth-DPZ3hZHQ.js";import{t as r}from"./PageHero-CBDFKJS6.js";var i=e=>document.getElementById(e),a=[{nombre:`Paseo del Lago`,id:`PaseoDelLago`},{nombre:`Segunda Faja`,id:`SegundaFaja`}],o=1800*1e3,s=980,c=n(`Procesando...`);document.body.appendChild(c.element),c.setLoading(!0,`Validando sesión...`);function l(e){let t=new URL(e,window.location.href),n=window.APP_CONFIG&&window.APP_CONFIG.ENVIRONMENT;return n&&t.searchParams.set(`env`,n),t.toString()}function u(){return new Promise(e=>requestAnimationFrame(e))}function d(e){return String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function f(){return window.innerWidth<=s}function p(e,t){let n={empty:`border-brand-lettuce/24 bg-brand-lettuce/12 text-brand-lettuce`,loading:`border-brand-cheese/28 bg-brand-cheese/18 text-brand-bun-dark`,error:`border-brand-ketchup/24 bg-brand-ketchup/12 text-brand-ketchup`},r=document.createElement(`div`);return r.className=`rounded-2xl border px-lg py-lg text-sm font-bold leading-relaxed ${n[e]||n.loading}`,r.textContent=t,r}function m(e){let t=document.createElement(`div`);t.className=`overflow-x-auto`;let n=e.map(e=>`
    <tr class="border-b border-neutral-charcoal/8 last:border-b-0">
      <td class="px-md py-md align-middle">
        <div class="flex items-center gap-md">
          <div class="grid size-10 place-items-center rounded-2xl bg-gradient-to-r from-brand-cheese to-brand-bun text-sm font-black text-neutral-charcoal">
            ${d(e.iniciales||`--`)}
          </div>
          <div class="min-w-0 text-sm font-bold text-neutral-charcoal">${d(e.nombre)}</div>
        </div>
      </td>
      <td class="px-md py-md align-middle text-sm font-bold text-neutral-charcoal">${d(e.hora||e.fechaHora||`Sin hora`)}</td>
      <td class="px-md py-md align-middle">
        <span class="inline-flex items-center gap-sm rounded-full border border-brand-ketchup/20 bg-brand-ketchup/10 px-md py-sm text-xs font-black text-brand-ketchup">
          <span aria-hidden="true">●</span>
          Pendiente de salida
        </span>
      </td>
    </tr>
  `).join(``);return t.innerHTML=`
    <div class="grid gap-md md:hidden">${e.map(e=>`
    <article class="rounded-2xl border border-neutral-charcoal/10 bg-white/76 p-lg md:hidden">
      <div class="flex items-start justify-between gap-md">
        <div class="flex min-w-0 items-center gap-md">
          <div class="grid size-11 place-items-center rounded-2xl bg-gradient-to-r from-brand-cheese to-brand-bun text-sm font-black text-neutral-charcoal">
            ${d(e.iniciales||`--`)}
          </div>
          <div class="min-w-0">
            <div class="text-base font-black text-neutral-charcoal">${d(e.nombre)}</div>
            <div class="mt-xs text-sm font-bold text-neutral-muted">Ingreso: ${d(e.hora||e.fechaHora||`Sin hora`)}</div>
          </div>
        </div>
        <span class="inline-flex shrink-0 items-center gap-xs rounded-full border border-brand-ketchup/20 bg-brand-ketchup/10 px-md py-sm text-[11px] font-black text-brand-ketchup">
          ● Pendiente
        </span>
      </div>
    </article>
  `).join(``)}</div>
    <table class="hidden min-w-[520px] w-full border-collapse md:table">
      <thead>
        <tr>
          <th class="bg-brand-cheese/24 px-md py-md text-left text-xs font-black uppercase tracking-[0.12em] text-brand-bun-dark">Colaborador</th>
          <th class="bg-brand-cheese/24 px-md py-md text-left text-xs font-black uppercase tracking-[0.12em] text-brand-bun-dark">Ingreso</th>
          <th class="bg-brand-cheese/24 px-md py-md text-left text-xs font-black uppercase tracking-[0.12em] text-brand-bun-dark">Estado</th>
        </tr>
      </thead>
      <tbody>${n}</tbody>
    </table>
  `,t}function h(e){let n=t({className:`overflow-hidden rounded-3xl p-0`}),r=document.createElement(`details`);r.className=`group`,r.dataset.localId=e.id;let i=document.createElement(`summary`);i.className=`flex cursor-pointer list-none items-center justify-between gap-lg bg-gradient-to-b from-[#fffaf1] to-neutral-cream px-xl py-xl`,i.innerHTML=`
    <div>
      <h2 class="text-[28px] font-black leading-none tracking-[-0.04em] text-neutral-charcoal">${e.nombre}</h2>
      <p class="mt-sm text-sm font-bold text-neutral-muted">Colaboradores pendientes de salida</p>
    </div>
  `;let a=document.createElement(`div`);a.className=`flex items-center gap-md`;let o=document.createElement(`div`);o.id=`badge-${e.id}`,o.className=`grid min-h-[46px] min-w-[46px] place-items-center rounded-2xl bg-gradient-to-r from-brand-cheese to-brand-bun px-md text-xl font-black text-neutral-charcoal`,o.textContent=`0`;let s=document.createElement(`span`);s.className=`grid size-8 place-items-center rounded-full border border-neutral-charcoal/10 bg-white/70 text-sm text-neutral-charcoal transition-transform group-open:rotate-180 md:group-open:rotate-0`,s.textContent=`▾`,a.append(o,s),i.appendChild(a);let c=document.createElement(`div`);return c.id=`contenido-${e.id}`,c.className=`p-lg`,c.appendChild(p(`loading`,`Cargando turnos abiertos...`)),r.append(i,c),n.appendChild(r),n}function g(){document.querySelectorAll(`details[data-local-id]`).forEach(e=>{let t=e.querySelector(`summary`);t&&(f()?(e.removeAttribute(`open`),t.classList.add(`cursor-pointer`)):(e.setAttribute(`open`,``),t.classList.remove(`cursor-pointer`)))})}function _(){let e=Array.from(document.querySelectorAll(`details[data-local-id]`));e.forEach(t=>{let n=t.querySelector(`summary`);n&&(n.addEventListener(`click`,e=>{f()||e.preventDefault()}),t.addEventListener(`toggle`,()=>{if(!f()){t.setAttribute(`open`,``);return}t.open&&e.forEach(e=>{e!==t&&e.removeAttribute(`open`)})}))}),g(),window.addEventListener(`resize`,g)}function v(e){let t=i(`contenido-${e}`);t&&(t.innerHTML=``,t.appendChild(p(`loading`,`Cargando turnos abiertos...`)),i(`badge-${e}`).textContent=`...`)}function y(e,t){let n=i(`contenido-${e.id}`),r=Array.isArray(t)?t.length:0;if(i(`badge-${e.id}`).textContent=String(r),n.innerHTML=``,!r){n.appendChild(p(`empty`,`No hay turnos abiertos en este local.`));return}n.appendChild(m(t))}function b(e,t){let n=i(`contenido-${e.id}`);n.innerHTML=``,n.appendChild(p(`error`,t||`No se pudo cargar este local.`)),i(`badge-${e.id}`).textContent=`0`}function x(){return new Date().toLocaleString(`es-CL`,{day:`2-digit`,month:`2-digit`,year:`numeric`,hour:`2-digit`,minute:`2-digit`})}async function S(e){v(e.id);try{let t=await window.LVAuth.apiGet({accion:`TurnosAbiertos`,local:e.nombre});if(t.status!==`SUCCESS`)return b(e,t.mensaje||`El servidor no devolvió una respuesta válida.`),0;let n=t.turnosAbiertos||[];return y(e,n),n.length}catch(t){return t.code===`UNAUTHORIZED`||t.code===`FORBIDDEN`?(window.LVAuth.redirectToIndex(`session`),0):(b(e,`Error de conexión. Revisa internet o el Apps Script.`),0)}}function C(n){let o=i(`app`),s=document.createElement(`div`);s.className=`mx-auto flex min-h-screen w-full max-w-[1320px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl`;function d(){let e=document.createElement(`div`);return e.className=`rounded-full border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-md text-sm font-black leading-relaxed text-neutral-cream`,e.textContent=`${n.displayName||`Administrador`} · ${n.role}`,e}function f(){let e=document.createElement(`div`);return e.className=`rounded-full border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-md text-sm font-black leading-relaxed text-neutral-cream`,e.innerHTML=`
      <span class="mr-sm text-[11px] uppercase tracking-[0.16em] text-neutral-cream/60">Última actualización</span>
      <span data-refresh-label class="text-sm font-black text-neutral-cream">--:--</span>
    `,e}function p(){let t=document.createElement(`div`);t.className=`flex flex-col gap-sm sm:flex-row sm:flex-wrap`;let n=e(`Volver al panel`,{variant:`secondary`,className:`bg-white/88 text-neutral-charcoal sm:flex-1 hover:bg-white`,onClick:()=>{window.location.href=l(`adminPanel.html`)}}),r=e(`Cerrar sesión`,{className:`sm:flex-1`,onClick:async()=>{c.setLoading(!0,`Cerrando sesión...`),await u(),await window.LVAuth.logout(),window.LVAuth.redirectToIndex()}}),i=e(`Actualizar ahora`,{variant:`success`,className:`sm:flex-1`});return i.dataset.role=`refresh-button`,t.append(n,r,i),{row:t,btnActualizar:i}}let m=document.createElement(`div`);m.className=`hidden flex-wrap gap-sm lg:flex`,m.append(d(),f());let g=p(),v=t({eyebrow:`Sesión y refresh`,className:`rounded-3xl lg:hidden`}),y=document.createElement(`div`);y.className=`grid grid-cols-3 gap-sm`,y.append(e(`Volver`,{variant:`secondary`,className:`min-h-[44px] bg-white/88 px-md py-sm text-sm text-neutral-charcoal shadow-none hover:bg-white`,onClick:()=>{window.location.href=l(`adminPanel.html`)}}),e(`Cerrar`,{className:`min-h-[44px] px-md py-sm text-sm shadow-none`,onClick:async()=>{c.setLoading(!0,`Cerrando sesión...`),await u(),await window.LVAuth.logout(),window.LVAuth.redirectToIndex()}}),e(`Actualizar`,{variant:`success`,className:`min-h-[44px] px-md py-sm text-sm shadow-none`})),y.querySelectorAll(`button`)[2].dataset.role=`refresh-button`,v.appendChild(y);let b=r({badge:`La Victoria · Administración`,title:`Turnos abiertos`,lead:`Vista simultánea de colaboradores que registraron ingreso y todavía no han marcado salida en cada local.`,sideTitle:`Sesión y refresh`,sideStatus:m,sideCopy:`Vista solo lectura con refresh automático cada 30 minutos.`,sideActions:(()=>{let e=document.createElement(`div`);return e.className=`grid gap-sm`,e.append(g.row),e})(),layoutClassName:`gap-lg lg:items-start lg:gap-2xl`,contentClassName:`lg:basis-[70%]`,titleClassName:`mt-sm max-w-[9ch] text-[clamp(32px,8vw,68px)]`,leadClassName:`mt-md max-w-[58ch] text-sm leading-7 md:mt-xl md:text-lg`,sideClassName:`hidden p-lg lg:block lg:w-[420px]`,className:`p-lg md:p-2xl`}),C=document.createElement(`section`);C.className=`grid gap-lg xl:grid-cols-2`,a.forEach(e=>{C.appendChild(h(e))});let w=document.createElement(`p`);w.className=`pb-lg text-center text-sm font-bold text-neutral-cream/70`,w.textContent=`Actualización automática cada 30 minutos · Dashboard solo lectura`,s.append(b,C,v,w),o.appendChild(s);let T=s.querySelectorAll(`[data-refresh-label]`),E=s.querySelectorAll(`[data-role="refresh-button"]`);function D(){let e=x();T.forEach(t=>{t.textContent=e})}async function O(){E.forEach(e=>{e.disabled=!0,e.textContent=`Actualizando...`}),await Promise.all(a.map(e=>S(e))),D(),E.forEach(e=>{e.disabled=!1,e.textContent=`Actualizar ahora`})}return E.forEach(e=>e.addEventListener(`click`,O)),_(),{cargarDashboard:O}}async function w(){try{c.setLoading(!0,`Validando sesión...`);let e=await window.LVAuth.protectPage([`Administrador`]);if(!e)return;c.setLoading(!0,`Cargando dashboard...`),await u();let t=C(e);await t.cargarDashboard(),window.setInterval(t.cargarDashboard,o)}finally{c.setLoading(!1)}}w();