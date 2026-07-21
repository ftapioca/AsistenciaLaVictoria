import{i as e}from"./Card-C-W-7LiE.js";import{r as t}from"./Input-DV0fMltq.js";var n=[`Enero`,`Febrero`,`Marzo`,`Abril`,`Mayo`,`Junio`,`Julio`,`Agosto`,`Septiembre`,`Octubre`,`Noviembre`,`Diciembre`],r=[`L`,`M`,`M`,`J`,`V`,`S`,`D`];function i(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function a(e){let[t,n,r]=String(e||``).split(`-`).map(Number);return!t||!n||!r?null:new Date(t,n-1,r)}function o(e){return`${String(e.getDate()).padStart(2,`0`)}-${String(e.getMonth()+1).padStart(2,`0`)}-${e.getFullYear()}`}function s(e){let[t,r]=String(e||``).split(`-`).map(Number);return!t||!r?`Selecciona un mes`:`${n[r-1]} ${t}`}function c(e){let t=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate())),n=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-n);let r=new Date(Date.UTC(t.getUTCFullYear(),0,1)),i=Math.ceil(((t-r)/864e5+1)/7);return`${t.getUTCFullYear()}-W${String(i).padStart(2,`0`)}`}function l(e){let[t,n]=String(e||``).split(`-W`),r=Number(t),a=Number(n);if(!r||!a)return null;let o=new Date(Date.UTC(r,0,4)),s=o.getUTCDay()||7,c=new Date(o);c.setUTCDate(o.getUTCDate()-s+1+(a-1)*7);let l=new Date(c);return l.setUTCDate(c.getUTCDate()+6),{from:i(new Date(c.getUTCFullYear(),c.getUTCMonth(),c.getUTCDate())),to:i(new Date(l.getUTCFullYear(),l.getUTCMonth(),l.getUTCDate()))}}function u(e){let t=new Date(Date.UTC(e,11,28));return Number(c(new Date(t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate())).slice(-2))}function d(e,t){let n=u(e),r=new Date(e,t,1),i=new Date(e,t+1,0);return Array.from({length:n},(t,n)=>{let o=n+1,s=`${e}-W${String(o).padStart(2,`0`)}`,c=l(s),u=a(c.from),d=a(c.to);return u<=i&&d>=r?{value:s,range:c,weekNumber:o}:null}).filter(Boolean)}function f(e){let t=l(e);return t?`Semana ${String(e).slice(-2)} · ${o(a(t.from))} al ${o(a(t.to))}`:`Selecciona una semana`}function p(e){let t=a(e);return t?o(t):`Selecciona un día`}function m(){let e=new Date;return{monthly:`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}`,weekly:c(e),daily:i(e)}}function h(c={}){let{label:u=`Período`,scopeLabel:h=`Alcance`,initialType:g=`mensual`,types:_=[`mensual`,`semanal`,`diario`],initialValues:v=m(),showResolvedRange:y=!1,className:b=``,onChange:x}=c,S=Array.isArray(_)&&_.length?_:[`mensual`,`semanal`,`diario`],C=S.includes(g)?g:S[0],w=S.length===1,T={monthly:v.monthly||``,weekly:v.weekly||``,daily:v.daily||``},E={monthlyYear:new Date().getFullYear(),weeklyYear:new Date().getFullYear(),weeklyMonth:new Date().getMonth(),dailyMonth:new Date(new Date().getFullYear(),new Date().getMonth(),1)},D=document.createElement(`section`);D.className=e(`grid gap-lg`,b),D.innerHTML=`
    <div class="${w?`grid gap-lg`:`grid gap-lg lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]`}">
      <div data-role="type-select-slot" class="${w?`hidden`:``}"></div>

      <div class="grid gap-sm">
        <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">${u}</span>

        <div data-picker="mensual" class="relative">
          <button data-trigger="mensual" class="flex min-h-[54px] w-full items-center justify-between gap-md rounded-2xl border border-neutral-charcoal/10 bg-white/84 px-lg py-md text-left font-black text-neutral-charcoal transition-fast hover:bg-white focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30" type="button" aria-haspopup="dialog" aria-expanded="false">
            <strong data-label="mensual" class="text-[15px] tracking-[-0.01em]">Selecciona un mes</strong>
            <span class="text-lg leading-none text-neutral-muted" aria-hidden="true">▼</span>
          </button>
          <div data-popover="mensual" class="absolute left-0 top-[calc(100%+10px)] z-[90] hidden w-[min(100vw-48px,420px)] rounded-3xl border border-neutral-charcoal/10 bg-neutral-paper p-lg shadow-brand backdrop-blur">
            <div class="mb-md flex items-center justify-between gap-md">
              <button data-nav="mensual-prev" class="flex size-10 items-center justify-center rounded-full border border-brand-bun/15 bg-brand-cheese/20 text-brand-bun-dark transition-fast hover:bg-brand-cheese/35" type="button" aria-label="Año anterior">←</button>
              <div data-title="mensual-year" class="flex-1 text-center text-lg font-black tracking-[-0.02em] text-neutral-charcoal">2026</div>
              <button data-nav="mensual-next" class="flex size-10 items-center justify-center rounded-full border border-brand-bun/15 bg-brand-cheese/20 text-brand-bun-dark transition-fast hover:bg-brand-cheese/35" type="button" aria-label="Año siguiente">→</button>
            </div>
            <div data-grid="mensual" class="grid grid-cols-3 gap-sm"></div>
          </div>
        </div>

        <div data-picker="semanal" class="relative" hidden>
          <button data-trigger="semanal" class="flex min-h-[54px] w-full items-center justify-between gap-md rounded-2xl border border-neutral-charcoal/10 bg-white/84 px-lg py-md text-left font-black text-neutral-charcoal transition-fast hover:bg-white focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30" type="button" aria-haspopup="dialog" aria-expanded="false">
            <strong data-label="semanal" class="text-[15px] tracking-[-0.01em]">Selecciona una semana</strong>
            <span class="text-lg leading-none text-neutral-muted" aria-hidden="true">▼</span>
          </button>
          <div data-popover="semanal" class="absolute left-0 top-[calc(100%+10px)] z-[90] hidden w-[min(100vw-48px,420px)] rounded-3xl border border-neutral-charcoal/10 bg-neutral-paper p-lg shadow-brand backdrop-blur">
            <div class="mb-md grid gap-md md:grid-cols-2">
              <div class="grid gap-sm">
                <div class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Año</div>
                <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-sm">
                  <button data-nav="semanal-prev" class="flex size-10 items-center justify-center rounded-full border border-brand-bun/15 bg-brand-cheese/20 text-brand-bun-dark transition-fast hover:bg-brand-cheese/35" type="button" aria-label="Año anterior">←</button>
                  <div data-title="semanal-year" class="text-center text-lg font-black tracking-[-0.02em] text-neutral-charcoal">2026</div>
                  <button data-nav="semanal-next" class="flex size-10 items-center justify-center rounded-full border border-brand-bun/15 bg-brand-cheese/20 text-brand-bun-dark transition-fast hover:bg-brand-cheese/35" type="button" aria-label="Año siguiente">→</button>
                </div>
              </div>
              <label class="grid gap-sm">
                <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Mes</span>
                <div class="relative">
                  <button data-role="weekly-month-trigger" class="flex min-h-[48px] w-full items-center justify-between gap-md rounded-2xl border border-brand-bun/15 bg-gradient-to-r from-neutral-cream to-white px-lg py-md text-left text-base font-black text-brand-bun-dark transition-fast focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30" type="button" aria-haspopup="listbox" aria-expanded="false">
                    <span data-role="weekly-month-label">Junio</span>
                    <span class="text-lg leading-none">▼</span>
                  </button>
                  <div data-role="weekly-month-menu" class="absolute left-0 top-1/2 z-[110] hidden max-h-[360px] w-full -translate-y-1/2 overflow-auto rounded-3xl border border-neutral-charcoal/10 bg-neutral-paper p-md shadow-brand backdrop-blur">
                    <div data-role="weekly-month-options" class="grid grid-cols-1 gap-xs"></div>
                  </div>
                </div>
              </label>
            </div>
            <div data-grid="semanal" class="grid max-h-[320px] grid-cols-1 gap-sm overflow-auto pr-1"></div>
          </div>
        </div>

        <div data-picker="diario" class="relative" hidden>
          <button data-trigger="diario" class="flex min-h-[54px] w-full items-center justify-between gap-md rounded-2xl border border-neutral-charcoal/10 bg-white/84 px-lg py-md text-left font-black text-neutral-charcoal transition-fast hover:bg-white focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30" type="button" aria-haspopup="dialog" aria-expanded="false">
            <strong data-label="diario" class="text-[15px] tracking-[-0.01em]">Selecciona un día</strong>
            <span class="text-lg leading-none text-neutral-muted" aria-hidden="true">▼</span>
          </button>
          <div data-popover="diario" class="absolute left-0 top-[calc(100%+10px)] z-[90] hidden w-[min(100vw-48px,420px)] rounded-3xl border border-neutral-charcoal/10 bg-neutral-paper p-lg shadow-brand backdrop-blur">
            <div class="mb-md grid gap-md md:grid-cols-2">
              <div class="grid gap-sm">
                <div class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Año</div>
                <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-sm">
                  <button data-nav="diario-prev-year" class="flex size-10 items-center justify-center rounded-full border border-brand-bun/15 bg-brand-cheese/20 text-brand-bun-dark transition-fast hover:bg-brand-cheese/35" type="button" aria-label="Año anterior">←</button>
                  <div data-title="diario-year" class="text-center text-lg font-black tracking-[-0.02em] text-neutral-charcoal">2026</div>
                  <button data-nav="diario-next-year" class="flex size-10 items-center justify-center rounded-full border border-brand-bun/15 bg-brand-cheese/20 text-brand-bun-dark transition-fast hover:bg-brand-cheese/35" type="button" aria-label="Año siguiente">→</button>
                </div>
              </div>
              <label class="grid gap-sm">
                <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Mes</span>
                <div class="relative">
                  <button data-role="daily-month-trigger" class="flex min-h-[48px] w-full items-center justify-between gap-md rounded-2xl border border-brand-bun/15 bg-gradient-to-r from-neutral-cream to-white px-lg py-md text-left text-base font-black text-brand-bun-dark transition-fast focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30" type="button" aria-haspopup="listbox" aria-expanded="false">
                    <span data-role="daily-month-label">Junio</span>
                    <span class="text-lg leading-none">▼</span>
                  </button>
                  <div data-role="daily-month-menu" class="absolute left-0 top-1/2 z-[110] hidden max-h-[360px] w-full -translate-y-1/2 overflow-auto rounded-3xl border border-neutral-charcoal/10 bg-neutral-paper p-md shadow-brand backdrop-blur">
                    <div data-role="daily-month-options" class="grid grid-cols-1 gap-xs"></div>
                  </div>
                </div>
              </label>
            </div>
            <div data-day-head class="mb-sm grid grid-cols-7 gap-sm"></div>
            <div data-grid="diario" class="grid grid-cols-7 gap-sm"></div>
          </div>
        </div>
      </div>
    </div>

    <div data-range class="${y?`grid gap-md md:grid-cols-2`:`hidden`}">
      <div class="rounded-2xl border border-neutral-charcoal/8 bg-white/72 px-lg py-md">
        <div class="text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Fecha Desde</div>
        <div data-from class="mt-sm text-base font-bold text-neutral-charcoal">-</div>
      </div>
      <div class="rounded-2xl border border-neutral-charcoal/8 bg-white/72 px-lg py-md">
        <div class="text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Fecha Hasta</div>
        <div data-to class="mt-sm text-base font-bold text-neutral-charcoal">-</div>
      </div>
    </div>
  `;let O={weeklyMonthTrigger:D.querySelector(`[data-role="weekly-month-trigger"]`),weeklyMonthLabel:D.querySelector(`[data-role="weekly-month-label"]`),weeklyMonthMenu:D.querySelector(`[data-role="weekly-month-menu"]`),weeklyMonthOptions:D.querySelector(`[data-role="weekly-month-options"]`),dailyMonthTrigger:D.querySelector(`[data-role="daily-month-trigger"]`),dailyMonthLabel:D.querySelector(`[data-role="daily-month-label"]`),dailyMonthMenu:D.querySelector(`[data-role="daily-month-menu"]`),dailyMonthOptions:D.querySelector(`[data-role="daily-month-options"]`),from:D.querySelector(`[data-from]`),to:D.querySelector(`[data-to]`)},k={type:C,values:T},A=t({label:h,id:`periodPickerScope`,name:`periodPickerScope`,value:C,options:[S.includes(`mensual`)?{value:`mensual`,label:`Mensual`}:null,S.includes(`semanal`)?{value:`semanal`,label:`Semanal`}:null,S.includes(`diario`)?{value:`diario`,label:`Diario`}:null].filter(Boolean),placeholder:`Selecciona alcance`,disabled:w});D.querySelector(`[data-role="type-select-slot"]`).appendChild(A.wrapper);function j(){let e=k.type===`mensual`?k.values.monthly:k.type===`semanal`?k.values.weekly:k.values.daily,t=``,n=``;if(k.type===`mensual`&&e){let[r,a]=e.split(`-`).map(Number);t=i(new Date(r,a-1,1)),n=i(new Date(r,a,0))}else if(k.type===`semanal`&&e){let r=l(e);t=r?.from||``,n=r?.to||``}else k.type===`diario`&&e&&(t=e,n=e);return{type:k.type,period:e,from:t,to:n,values:{...k.values}}}function M(){let e=j();O.from&&(O.from.textContent=e.from?o(a(e.from)):`-`),O.to&&(O.to.textContent=e.to?o(a(e.to)):`-`),typeof x==`function`&&x(e)}function N(){D.querySelector(`[data-picker="mensual"]`).hidden=k.type!==`mensual`,D.querySelector(`[data-picker="semanal"]`).hidden=k.type!==`semanal`,D.querySelector(`[data-picker="diario"]`).hidden=k.type!==`diario`,F(),L()}function P(e,t){[`mensual`,`semanal`,`diario`].forEach(n=>{let r=D.querySelector(`[data-trigger="${n}"]`),i=D.querySelector(`[data-popover="${n}"]`);if(!r||!i)return;let a=n===e&&(typeof t==`boolean`?t:!i.classList.contains(`grid`));i.hidden=!a,i.classList.toggle(`hidden`,!a),i.classList.toggle(`grid`,a),r.classList.toggle(`border-brand-bun/60`,a),r.classList.toggle(`ring-2`,a),r.classList.toggle(`ring-brand-bun/30`,a),r.setAttribute(`aria-expanded`,a?`true`:`false`)})}function F(){P(`mensual`,!1),P(`semanal`,!1),P(`diario`,!1)}function I(e,t){[`weekly`,`daily`].forEach(n=>{let r=n===`weekly`?O.weeklyMonthTrigger:O.dailyMonthTrigger,i=n===`weekly`?O.weeklyMonthMenu:O.dailyMonthMenu;if(!r||!i)return;let a=n===e&&(typeof t==`boolean`?t:i.classList.contains(`hidden`));i.hidden=!a,i.classList.toggle(`hidden`,!a),i.classList.toggle(`block`,a),r.setAttribute(`aria-expanded`,a?`true`:`false`),r.classList.toggle(`border-brand-bun/60`,a),r.classList.toggle(`ring-2`,a),r.classList.toggle(`ring-brand-bun/30`,a),a&&requestAnimationFrame(()=>R(n))})}function L(){I(`weekly`,!1),I(`daily`,!1)}function R(e){let t=e===`weekly`?O.weeklyMonthMenu:O.dailyMonthMenu;if(!t)return;let n=t.querySelector(`[data-active="true"]`);if(!n)return;let r=n.offsetTop-t.clientHeight/2+n.clientHeight/2;t.scrollTop=Math.max(0,r)}function z(e,t=!0){if(k.values.monthly=e||``,D.querySelector(`[data-label="mensual"]`).innerText=s(k.values.monthly),k.values.monthly){let[e,t]=k.values.monthly.split(`-`).map(Number);E.monthlyYear=e,E.dailyMonth=new Date(e,t-1,1)}H(),t&&M()}function B(e,t=!0){if(k.values.weekly=e||``,D.querySelector(`[data-label="semanal"]`).innerText=f(k.values.weekly),k.values.weekly){let e=l(k.values.weekly),t=e?a(e.from):null;t&&(E.weeklyYear=t.getFullYear(),E.weeklyMonth=t.getMonth(),E.dailyMonth=new Date(t.getFullYear(),t.getMonth(),1))}U(),t&&M()}function V(e,t=!0){if(k.values.daily=e||``,D.querySelector(`[data-label="diario"]`).innerText=p(k.values.daily),k.values.daily){let e=a(k.values.daily);e&&(E.dailyMonth=new Date(e.getFullYear(),e.getMonth(),1),E.monthlyYear=e.getFullYear(),E.weeklyYear=e.getFullYear())}G(),t&&M()}function H(){D.querySelector(`[data-title="mensual-year"]`).innerText=String(E.monthlyYear),D.querySelector(`[data-grid="mensual"]`).innerHTML=n.map((t,n)=>{let r=`${E.monthlyYear}-${String(n+1).padStart(2,`0`)}`;return`<button class="${e(`min-h-[44px] rounded-2xl border px-md py-sm text-center text-sm font-black text-brand-bun-dark transition-fast`,r===k.values.monthly?`border-brand-bun/15 bg-gradient-to-r from-brand-cheese to-brand-bun text-neutral-charcoal`:`border-neutral-charcoal/8 bg-neutral-cream/80 hover:bg-brand-bun/10`)}" type="button" data-month-value="${r}">${t.slice(0,3)}</button>`}).join(``)}function U(){let t=E.weeklyYear,r=E.weeklyMonth,i=d(t,r);D.querySelector(`[data-title="semanal-year"]`).innerText=String(t),O.weeklyMonthLabel.innerText=n[r],O.weeklyMonthOptions.innerHTML=n.map((t,n)=>`
      <button
        class="${e(`flex min-h-[40px] w-full items-center rounded-2xl px-md py-sm text-left text-base font-black transition-fast`,n===r?`bg-gradient-to-r from-brand-cheese to-brand-bun text-neutral-charcoal`:`text-brand-bun-dark hover:bg-brand-bun/10`)}"
        type="button"
        data-active="${n===r?`true`:`false`}"
        data-weekly-month="${n}">
        ${t}
      </button>
    `).join(``),D.querySelector(`[data-grid="semanal"]`).innerHTML=i.length?i.map(({value:t,range:n,weekNumber:r})=>`
            <button class="${e(`flex min-h-[62px] items-center justify-between gap-md rounded-2xl border px-md py-md text-left transition-fast`,t===k.values.weekly?`border-brand-bun/15 bg-gradient-to-r from-brand-cheese to-brand-bun text-neutral-charcoal`:`border-neutral-charcoal/8 bg-neutral-cream/80 text-brand-bun-dark hover:bg-brand-bun/10`)}" type="button" data-week-value="${t}">
              <span class="text-base font-black">Semana ${String(r).padStart(2,`0`)}</span>
              <small class="whitespace-nowrap text-[12px] font-bold opacity-80">${o(a(n.from))} al ${o(a(n.to))}</small>
            </button>
          `).join(``):`<div class="rounded-2xl border border-brand-cheese/30 bg-brand-cheese/12 px-lg py-md text-sm font-bold leading-relaxed text-brand-bun-dark">No hay semanas disponibles para este mes.</div>`}function W(){D.querySelector(`[data-day-head]`).innerHTML=r.map(e=>`
      <span class="text-center text-[11px] font-black uppercase tracking-[0.08em] text-neutral-muted">${e}</span>
    `).join(``)}function G(){let t=new Date(E.dailyMonth.getFullYear(),E.dailyMonth.getMonth(),1),r=t.getFullYear(),a=t.getMonth();D.querySelector(`[data-title="diario-year"]`).innerText=String(r),O.dailyMonthLabel.innerText=n[a],O.dailyMonthOptions.innerHTML=n.map((t,n)=>`
      <button
        class="${e(`flex min-h-[40px] w-full items-center rounded-2xl px-md py-sm text-left text-base font-black transition-fast`,n===a?`bg-gradient-to-r from-brand-cheese to-brand-bun text-neutral-charcoal`:`text-brand-bun-dark hover:bg-brand-bun/10`)}"
        type="button"
        data-active="${n===a?`true`:`false`}"
        data-daily-month="${n}">
        ${t}
      </button>
    `).join(``);let o=(new Date(r,a,1).getDay()+6)%7,s=new Date(r,a+1,0).getDate(),c=[],l=i(new Date);for(let e=0;e<o;e++)c.push(`<button class="min-h-[42px] rounded-2xl border border-neutral-charcoal/8 bg-neutral-cream/60 opacity-40" type="button" disabled aria-hidden="true"></button>`);for(let t=1;t<=s;t++){let n=i(new Date(r,a,t)),o=n===k.values.daily,s=n===l;c.push(`
        <button
          class="${e(`min-h-[42px] rounded-2xl border text-sm font-black transition-fast`,o?`border-brand-bun/15 bg-gradient-to-r from-brand-cheese to-brand-bun text-neutral-charcoal`:`border-neutral-charcoal/8 bg-neutral-cream/80 text-brand-bun-dark hover:bg-brand-bun/10`,s&&!o&&`border-brand-bun/60`)}"
          type="button"
          data-day-value="${n}">
          ${t}
        </button>
      `)}for(;c.length%7!=0;)c.push(`<button class="min-h-[42px] rounded-2xl border border-neutral-charcoal/8 bg-neutral-cream/60 opacity-40" type="button" disabled aria-hidden="true"></button>`);D.querySelector(`[data-grid="diario"]`).innerHTML=c.join(``)}function K(e,t=!0){k.type=S.includes(e)?e:S[0],A.setValue(k.type,!1),N(),t&&M()}A.onChange(e=>K(e)),O.weeklyMonthTrigger.addEventListener(`click`,e=>{e.stopPropagation(),I(`weekly`)}),O.dailyMonthTrigger.addEventListener(`click`,e=>{e.stopPropagation(),I(`daily`)}),O.weeklyMonthOptions.addEventListener(`click`,e=>{e.stopPropagation();let t=e.target.closest(`button[data-weekly-month]`);t&&(E.weeklyMonth=Number(t.dataset.weeklyMonth),U(),L(),P(`semanal`,!0))}),O.dailyMonthOptions.addEventListener(`click`,e=>{e.stopPropagation();let t=e.target.closest(`button[data-daily-month]`);t&&(E.dailyMonth=new Date(E.dailyMonth.getFullYear(),Number(t.dataset.dailyMonth),1),G(),L(),P(`diario`,!0))}),D.querySelector(`[data-trigger="mensual"]`).addEventListener(`click`,()=>P(`mensual`)),D.querySelector(`[data-trigger="semanal"]`).addEventListener(`click`,()=>P(`semanal`)),D.querySelector(`[data-trigger="diario"]`).addEventListener(`click`,()=>P(`diario`)),D.querySelector(`[data-nav="mensual-prev"]`).addEventListener(`click`,()=>{--E.monthlyYear,H()}),D.querySelector(`[data-nav="mensual-next"]`).addEventListener(`click`,()=>{E.monthlyYear+=1,H()}),D.querySelector(`[data-nav="semanal-prev"]`).addEventListener(`click`,()=>{--E.weeklyYear,U()}),D.querySelector(`[data-nav="semanal-next"]`).addEventListener(`click`,()=>{E.weeklyYear+=1,U()}),D.querySelector(`[data-nav="diario-prev-year"]`).addEventListener(`click`,()=>{E.dailyMonth=new Date(E.dailyMonth.getFullYear()-1,E.dailyMonth.getMonth(),1),G()}),D.querySelector(`[data-nav="diario-next-year"]`).addEventListener(`click`,()=>{E.dailyMonth=new Date(E.dailyMonth.getFullYear()+1,E.dailyMonth.getMonth(),1),G()}),D.querySelector(`[data-grid="mensual"]`).addEventListener(`click`,e=>{let t=e.target.closest(`button[data-month-value]`);t&&(z(t.dataset.monthValue),F())}),D.querySelector(`[data-grid="semanal"]`).addEventListener(`click`,e=>{let t=e.target.closest(`button[data-week-value]`);t&&(B(t.dataset.weekValue),F())}),D.querySelector(`[data-grid="diario"]`).addEventListener(`click`,e=>{let t=e.target.closest(`button[data-day-value]`);t&&(V(t.dataset.dayValue),F())});let q=e=>{e.target.closest(`[data-period-picker-root]`)||(F(),L())};return D.setAttribute(`data-period-picker-root`,`true`),document.addEventListener(`click`,q),z(T.monthly,!1),B(T.weekly,!1),V(T.daily,!1),W(),K(C,!1),M(),{element:D,getValue:()=>j(),setType:e=>K(e),setValue:(e,t)=>{e===`mensual`&&z(t),e===`semanal`&&B(t),e===`diario`&&V(t)},destroy:()=>{document.removeEventListener(`click`,q),A.destroy()}}}export{h as t};