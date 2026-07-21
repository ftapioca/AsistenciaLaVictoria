import{n as e,t}from"./Card-C-W-7LiE.js";import{n,r,t as i}from"./Input-DV0fMltq.js";import{t as a}from"./PageHero-DKAJNuX1.js";import{t as o}from"./PeriodPicker-wlsCVl-A.js";import{t as s}from"./StatGrid-CmdLi249.js";function c(e){let t=document.getElementById(e);t&&t.scrollIntoView({behavior:`smooth`,block:`start`})}function l(){let e=[[`bun`,`#ff8a13`,`bg-brand-bun text-neutral-charcoal`],[`bun-dark`,`#d96700`,`bg-brand-bun-dark text-white`],[`cheese`,`#ffc928`,`bg-brand-cheese text-neutral-charcoal`],[`ketchup`,`#ef3b2d`,`bg-brand-ketchup text-white`],[`lettuce`,`#19a66a`,`bg-brand-lettuce text-white`]],t=document.createElement(`div`);return t.className=`grid gap-lg sm:grid-cols-2 lg:grid-cols-5`,e.forEach(([e,n,r])=>{let i=document.createElement(`div`);i.className=`overflow-hidden rounded-2xl border border-neutral-charcoal/10 bg-white/80 shadow-brand-sm`,i.innerHTML=`
      <div class="h-32 ${r} p-lg flex items-end">
        <span class="text-sm font-semibold uppercase tracking-[0.2em]">${e}</span>
      </div>
      <div class="px-lg py-md">
        <p class="text-sm font-semibold text-neutral-charcoal">${e}</p>
        <p class="text-xs text-neutral-muted">${n}</p>
      </div>
    `,t.appendChild(i)}),t}function u(){let e=document.createElement(`div`);return e.className=`space-y-lg`,e.innerHTML=`
    <div>
      <p class="text-6xl font-black">Hero / text-6xl</p>
      <p class="text-sm text-neutral-muted">64px · line-height 64px</p>
    </div>
    <div>
      <p class="text-4xl font-bold">Section / text-4xl</p>
      <p class="text-sm text-neutral-muted">36px · line-height 40px</p>
    </div>
    <div>
      <p class="text-xl">Lead / text-xl para introducciones y bloques destacados.</p>
      <p class="text-sm text-neutral-muted">20px · line-height 28px</p>
    </div>
    <div>
      <p class="text-base">Body / text-base para formularios, tablas y lectura continua.</p>
      <p class="text-sm text-neutral-muted">16px · line-height 24px</p>
    </div>
  `,e}function d(){let t=document.createElement(`div`);return t.className=`flex flex-wrap gap-md`,t.append(e(`Primario`),e(`Secundario`,{variant:`secondary`}),e(`Guardar`,{variant:`success`}),e(`Eliminar`,{variant:`danger`}),e(`Ghost`,{variant:`ghost`}),e(`Deshabilitado`,{disabled:!0})),t}function f(){let e=document.createElement(`div`);e.className=`grid gap-lg md:grid-cols-2`;let t=i({label:`Local`,placeholder:`Paseo del Lago`,hint:`Usa etiquetas claras y consistentes.`}),a=i({label:`Periodo`,placeholder:`2026-06`,hint:`Mantén el formato YYYY-MM.`}),o=r({label:`Rol`,placeholder:`Selecciona un rol`,options:[{value:`Administrador`,label:`Administrador`},{value:`Colaborador`,label:`Colaborador`}],hint:`Dropdown custom con la misma estética del selector de meses.`}),s=n({label:`PIN`,placeholder:`••••`,hint:`Primitive para accesos internos con toggle integrado.`});return e.append(t.wrapper,a.wrapper,o.wrapper,s.wrapper),e}function p(){let e=document.createElement(`div`);e.className=`grid gap-lg`;let n=t({eyebrow:`Estado`,title:`Período resuelto`,body:``,tone:`highlight`,className:`md:p-2xl`}),r=document.createElement(`div`);r.className=`grid gap-md md:grid-cols-4`,r.innerHTML=`
    <div class="rounded-2xl border border-neutral-charcoal/8 bg-white/72 px-lg py-md">
      <div class="text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Alcance</div>
      <div id="pickerScopeValue" class="mt-sm text-base font-bold text-neutral-charcoal">Mensual</div>
    </div>
    <div class="rounded-2xl border border-neutral-charcoal/8 bg-white/72 px-lg py-md md:col-span-1">
      <div class="text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Período</div>
      <div id="pickerPeriodValue" class="mt-sm text-base font-bold text-neutral-charcoal">-</div>
    </div>
    <div class="rounded-2xl border border-neutral-charcoal/8 bg-white/72 px-lg py-md">
      <div class="text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Desde</div>
      <div id="pickerFromValue" class="mt-sm text-base font-bold text-neutral-charcoal">-</div>
    </div>
    <div class="rounded-2xl border border-neutral-charcoal/8 bg-white/72 px-lg py-md">
      <div class="text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Hasta</div>
      <div id="pickerToValue" class="mt-sm text-base font-bold text-neutral-charcoal">-</div>
    </div>
  `,n.appendChild(r);let i=r.querySelector(`#pickerScopeValue`),a=r.querySelector(`#pickerPeriodValue`),s=r.querySelector(`#pickerFromValue`),c=r.querySelector(`#pickerToValue`),l=o({initialType:`mensual`,showResolvedRange:!0,onChange:({type:e,period:t,from:n,to:r})=>{i.textContent=e,a.textContent=t||`-`,s.textContent=n||`-`,c.textContent=r||`-`}}),u=document.createElement(`div`);return u.className=`grid gap-lg xl:grid-cols-3`,[{eyebrow:`Mensual`,title:`Selector mensual standalone`,body:`Usa el mismo primitive como picker de mes puro.`,type:`mensual`},{eyebrow:`Semanal`,title:`Selector semanal standalone`,body:`Semana ISO con mes contextual y rango resuelto.`,type:`semanal`},{eyebrow:`Diario`,title:`Selector diario standalone`,body:`Calendario compacto para elegir una fecha exacta.`,type:`diario`}].forEach(({eyebrow:e,title:n,body:r,type:i})=>{let a=t({eyebrow:e,title:n,body:r,className:`rounded-3xl md:p-2xl`}),s=o({label:i===`mensual`?`Mes`:i===`semanal`?`Semana`:`Día`,types:[i],initialType:i,showResolvedRange:!0,className:`mt-xl`});a.appendChild(s.element),u.appendChild(a)}),e.append(l.element,n,u),e}function m(e,t,n){let r=document.createElement(`section`);return r.id=e.toLowerCase(),r.className=`mb-6xl w-full`,r.innerHTML=`
    <div class="mb-xl w-full max-w-[760px]">
      <h2 class="text-3xl font-bold">${e}</h2>
      <p class="mt-sm text-base text-neutral-charcoal/72">${t}</p>
    </div>
  `,r.appendChild(n),r}function h(){let n=document.getElementById(`app`),r=document.createElement(`div`);r.className=`mx-auto flex w-full max-w-container flex-col px-lg py-4xl md:px-2xl`;let i=document.createElement(`div`);i.className=`flex flex-col gap-md sm:flex-row sm:flex-wrap`,i.append(e(`Ver componentes`,{variant:`primary`,onClick:()=>c(`botones`)}),e(`Ver resumen técnico`,{variant:`secondary`,onClick:()=>c(`resumen`)}));let o=a({badge:`La Victoria UI`,title:`Design system operativo para cerrar la base visual del proyecto.`,lead:`Tokens, primitives y una demo compilable en Vite para que la siguiente rama parta desde una base estable.`,highlights:s([{label:`Tokens`,value:`Base unificada`,detail:`Colores, spacing, tipografía, radios y sombras viven en Tailwind config.`},{label:`Primitives`,value:`Set inicial listo`,detail:`Botones, cards, inputs, heroes y listas reutilizables para nuevas pantallas.`},{label:`Build`,value:`Demo compilable`,detail:`El sistema ya genera artefactos estáticos para revisión visual y despliegue.`}],{tone:`dark`}),sideTitle:`Navegación`,sideCopy:`Usa esta demo para validar layout, componentes y dirección visual antes de migrar pantallas reales.`,sideActions:i,layoutClassName:`lg:gap-4xl`,contentClassName:`lg:basis-[68%]`,titleClassName:`max-w-[10ch] text-[clamp(46px,6vw,78px)]`,leadClassName:`max-w-[64ch]`,sideClassName:`lg:w-[300px]`,className:`mb-6xl`}),h=document.createElement(`div`);h.className=`flex flex-wrap gap-md`,h.append(e(`Import CTA`,{size:`sm`}),e(`Secondary CTA`,{variant:`secondary`,size:`sm`}));let g=document.createElement(`div`);g.className=`grid gap-lg lg:grid-cols-3`,g.append(t({eyebrow:`Base`,title:`Tokens centralizados`,body:`Colores, tipografía, spacing, radios, sombras y z-index viven en Tailwind config.`}),t({eyebrow:`Primitives`,title:`Button, Input y Card`,body:`Los componentes base ya existen como factories reutilizables en src/components.`,tone:`highlight`,footer:h}),t({eyebrow:`Build`,title:`Demo aislada para Vite`,body:`La demo ya no depende de enlaces al repo. El build genera un artefacto autosuficiente para revisión visual o despliegue estático.`,tone:`dark`})),r.append(o,m(`Colores`,`Paleta de marca y acentos semánticos del sistema.`,l()),m(`Tipografía`,`Escala base para héroes, encabezados, lead y body copy.`,u()),m(`Botones`,`Variantes y tamaños del primitive base.`,d()),m(`Formulario`,`Inputs con label, hint y estados listos para componer formularios.`,f()),m(`Datepicker`,`Patrón reutilizable extraído del flujo legado de ventas: alcance diario, semanal y mensual con popovers específicos y rango resuelto.`,p()),m(`Resumen`,`Estado actual del design system sobre esta rama.`,g));let _=document.createElement(`footer`);_.className=`border-t border-neutral-charcoal/10 py-2xl text-sm text-neutral-muted`,_.textContent=`Design System v1.1 · La Victoria · Junio 2026`,r.appendChild(_),n.appendChild(r)}h();