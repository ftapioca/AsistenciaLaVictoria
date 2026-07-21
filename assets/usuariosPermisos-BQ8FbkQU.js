import{t as e}from"./Button-BA94Eo6P.js";import{t}from"./LoadingOverlay-kXZPMhPI.js";import"./auth-Dnlybq2p.js";import{t as n}from"./Card-h9AjV7B7.js";import{t as r}from"./PageHero-BIjqZC19.js";import{t as i}from"./StatGrid-B286nR4z.js";import{t as a}from"./PageSkeletons-DIYJpQOJ.js";import{t as o}from"./Toast-BLR0dPPs.js";var s=e=>document.getElementById(e),c=980,l=[`Administrador`,`Supervisor`,`Colaborador`],u=[{key:`puede_ingresar_panel_admin`,label:`Panel administrativo`},{key:`puede_ver_mis_turnos`,label:`Ver mis turnos`},{key:`puede_programar_turnos`,label:`Programar turnos`},{key:`puede_ver_turnos_abiertos`,label:`Ver turnos abiertos`},{key:`puede_registrar_asistencia_admin`,label:`Registrar asistencia admin`},{key:`puede_ver_colaboradores_local`,label:`Ver colaboradores por local`},{key:`puede_importar_ventas`,label:`Importar ventas`},{key:`puede_ver_pagos`,label:`Ver pagos`},{key:`puede_gestionar_plantillas_turnos`,label:`Gestionar plantillas`},{key:`puede_copiar_semanas`,label:`Copiar semanas`},{key:`puede_eliminar_turnos`,label:`Eliminar turnos`}],d={session:null,users:[],roles:[],search:``,editingPermissions:!1,draftPermissions:null},f=t(`Procesando...`);document.body.appendChild(f.element),f.setLoading(!0,`Validando sesión...`);var p=o();document.body.appendChild(p.element);function m(e){let t=new URL(e,window.location.href),n=window.APP_CONFIG&&window.APP_CONFIG.ENVIRONMENT;return n&&t.searchParams.set(`env`,n),t.toString()}function h(){return new Promise(e=>requestAnimationFrame(e))}function g(e){return String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function _(e){return String(e||``).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).trim().toLowerCase()}function v(e){return String(e||``).split(/[;,|/]+/).map(e=>e.trim()).filter(Boolean)}function y(){return window.innerWidth<=c}function b(){let e=d.users.filter(e=>e.activo).length,t=[...new Set(d.users.flatMap(e=>v(e.local)).filter(Boolean))].length,n=i([{label:`Usuarios`,value:String(d.users.length),detail:`${e} activos en la hoja Usuarios.`},{label:`Locales`,value:String(t||2),detail:`La vista separa operación por local y administración global.`},{label:`Entorno`,value:(window.APP_CONFIG&&window.APP_CONFIG.ENVIRONMENT||`prod`).toUpperCase(),detail:`Cada edición impacta el entorno activo.`}],{tone:`dark`});return n.id=`summaryHighlights`,n}function x(){let e=s(`summaryHighlights`),t=b();e&&e.parentNode&&e.parentNode.replaceChild(t,e)}function S({id:e,title:t,subtitle:r,badgeText:i=``,open:a=!1}){let o=n({className:`overflow-hidden rounded-3xl p-0`}),s=document.createElement(`section`);s.dataset.accordionId=e;let c=document.createElement(`button`);c.type=`button`,c.className=`flex w-full items-center justify-between gap-lg px-xl py-xl text-left`,c.setAttribute(`aria-expanded`,a?`true`:`false`),c.setAttribute(`aria-controls`,`${e}-panel`);let l=document.createElement(`div`);l.className=`min-w-0`,l.innerHTML=`
    <h2 class="text-[26px] font-black leading-none tracking-[-0.04em] text-neutral-charcoal">${g(t)}</h2>
    <p class="mt-sm text-sm font-bold text-neutral-muted">${g(r)}</p>
  `;let u=document.createElement(`div`);u.className=`flex items-center gap-md`;let d=document.createElement(`div`);d.id=`${e}-badge`,d.className=`grid min-h-[46px] min-w-[46px] place-items-center rounded-2xl bg-gradient-to-r from-brand-cheese to-brand-bun px-md text-xl font-black text-neutral-charcoal`,d.textContent=i;let f=document.createElement(`span`);f.className=`grid size-8 place-items-center rounded-full border border-neutral-charcoal/10 bg-white/70 text-sm text-neutral-charcoal transition-transform`,f.textContent=`▾`,u.append(d,f),c.append(l,u);let p=document.createElement(`div`);p.id=`${e}-panel`,p.className=`p-lg`,s.append(c,p),o.appendChild(s);function m(e){let t=!!e;p.hidden=!t,p.classList.toggle(`hidden`,!t),f.style.transform=t?`rotate(180deg)`:`rotate(0deg)`,c.setAttribute(`aria-expanded`,t?`true`:`false`)}return m(a),{element:o,panel:p,badge:d,setOpen:m,isOpen:()=>c.getAttribute(`aria-expanded`)===`true`,bindToggle(e){c.addEventListener(`click`,e)}}}function C(){let e=document.createElement(`div`);e.id=`editUserModal`,e.className=`fixed inset-0 z-[140] hidden items-center justify-center bg-neutral-charcoal/68 px-lg py-lg backdrop-blur`,e.innerHTML=`
    <div class="absolute inset-0" data-modal-backdrop></div>
    <div class="modal-shell relative z-[1] max-h-[92vh] w-full max-w-[980px] overflow-auto rounded-[32px] border border-neutral-charcoal/12 bg-[#fff8ee] p-xl shadow-brand md:p-2xl">
      <div class="flex items-start justify-between gap-lg">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.18em] text-neutral-muted">Editar usuario</p>
          <h2 id="editUserTitle" class="mt-sm text-[clamp(30px,4vw,46px)] font-black tracking-[-0.05em] text-neutral-charcoal">Usuario</h2>
          <p id="editUserSubtitle" class="mt-sm text-sm font-bold leading-7 text-neutral-muted">Actualiza los campos operativos y de acceso.</p>
        </div>
        <button type="button" id="btnCloseEditUser" class="grid size-11 place-items-center rounded-2xl border border-neutral-charcoal/10 bg-white/92 text-xl font-black text-neutral-charcoal">×</button>
      </div>
      <form id="editUserForm" class="mt-xl grid gap-lg">
        <div class="grid gap-lg md:grid-cols-2">
          ${w(`idUsuario`,`ID usuario`,!0)}
          ${w(`nombreCompleto`,`Nombre completo`)}
          ${w(`usuarioLogin`,`Usuario login`)}
          ${T(`rol`,`Rol`,l)}
          ${w(`local`,`Local`)}
          ${w(`cargo`,`Cargo`)}
          ${T(`activo`,`Activo`,[`SI`,`NO`])}
          ${w(`email`,`Email`)}
          ${w(`telefono`,`Telefono`)}
          ${w(`fechaCreacion`,`Fecha creacion`)}
        </div>
        <section class="rounded-3xl border border-neutral-charcoal/10 bg-white/72 p-lg">
          <div class="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
            <div>
              <p class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Acceso</p>
              <p class="mt-sm text-sm font-bold leading-7 text-neutral-charcoal/72">El PIN actual no se muestra. Usa esta sección solo si necesitas definir un nuevo PIN.</p>
            </div>
            <button type="button" id="btnTogglePinChange" class="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-brand-bun px-xl py-md text-base font-black text-neutral-charcoal transition-fast hover:bg-brand-bun-dark hover:text-neutral-cream">Nuevo PIN</button>
          </div>
          <div id="pinChangePanel" class="mt-lg hidden grid gap-lg md:grid-cols-2">
            ${w(`newPin`,`Nuevo PIN`,!1,`password`)}
            ${w(`confirmNewPin`,`Confirmar nuevo PIN`,!1,`password`)}
          </div>
          <div id="pinMatchStatus" class="mt-md hidden rounded-2xl border px-lg py-md text-sm font-bold"></div>
        </section>
        <label class="grid gap-sm">
          <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Observaciones</span>
          <textarea id="fieldObservaciones" rows="5" class="rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md text-base font-semibold text-neutral-charcoal placeholder:text-neutral-muted/70 focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30"></textarea>
        </label>
        <div id="editUserFeedback" class="hidden rounded-2xl border border-brand-cheese/28 bg-brand-cheese/18 px-lg py-md text-sm font-bold text-brand-bun-dark"></div>
        <div class="grid gap-sm md:flex md:justify-end">
          <button type="button" id="btnCancelEditUser" class="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-neutral-charcoal/12 bg-white/92 px-xl py-md text-base font-black text-neutral-charcoal">Cancelar</button>
          <button type="submit" id="btnSaveEditUser" class="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-brand-bun px-xl py-md text-base font-black text-neutral-charcoal transition-fast hover:bg-brand-bun-dark hover:text-neutral-cream">Guardar cambios</button>
        </div>
      </form>
    </div>
  `,document.body.appendChild(e);let t=e.querySelector(`#editUserForm`),n=e.querySelector(`[data-modal-backdrop]`),r=e.querySelector(`#editUserTitle`),i=e.querySelector(`#editUserSubtitle`),a=e.querySelector(`#btnSaveEditUser`),o=e.querySelector(`#btnCancelEditUser`),s=e.querySelector(`#btnCloseEditUser`),c=e.querySelector(`#btnTogglePinChange`),u=e.querySelector(`#pinChangePanel`),f=e.querySelector(`#pinMatchStatus`),m=e.querySelector(`#editUserFeedback`),h=e.querySelector(`#fieldNewPin`),g=e.querySelector(`#fieldConfirmNewPin`),_=``,v=!1;function y(){e.classList.add(`hidden`),e.classList.remove(`grid`),_=``,v=!1,u.classList.add(`hidden`),c.textContent=`Nuevo PIN`,S(`fieldNewPin`,``),S(`fieldConfirmNewPin`,``),D(),C(``)}function b(e){a.disabled=e,o.disabled=e,s.disabled=e,c.disabled=e,a.textContent=e?`Guardando...`:`Guardar cambios`}function S(t,n){let r=e.querySelector(`#${t}`);r&&(r.value=n||``)}function C(e){if(!e){m.textContent=``,m.classList.add(`hidden`);return}m.textContent=e,m.classList.remove(`hidden`)}function E(e,t){if(!e)return;let n=`min-h-[52px] rounded-2xl bg-white/90 px-lg py-md text-base font-semibold placeholder:text-neutral-muted/70 focus:outline-none focus:ring-2`;if(t===`error`){e.className=`${n} border border-brand-ketchup bg-brand-ketchup/10 text-neutral-charcoal focus:border-brand-ketchup focus:ring-brand-ketchup/30`;return}if(t===`success`){e.className=`${n} border border-brand-lettuce bg-brand-lettuce/10 text-neutral-charcoal focus:border-brand-lettuce focus:ring-brand-lettuce/30`;return}e.className=`${n} border border-neutral-charcoal/10 text-neutral-charcoal focus:border-brand-bun focus:ring-brand-bun/30`}function D(){if(!v)return f.textContent=``,f.className=`mt-md hidden rounded-2xl border px-lg py-md text-sm font-bold`,E(h),E(g),!0;let e=h.value.trim(),t=g.value.trim();if(!t)return f.textContent=``,f.className=`mt-md hidden rounded-2xl border px-lg py-md text-sm font-bold`,E(h),E(g),!1;let n=e&&e===t;return f.textContent=n?`Los PIN coinciden.`:`Los PIN no coinciden.`,f.className=`mt-md rounded-2xl border px-lg py-md text-sm font-bold ${n?`border-brand-lettuce bg-brand-lettuce/10 text-brand-lettuce`:`border-brand-ketchup bg-brand-ketchup/10 text-brand-ketchup`}`,E(h,n?`success`:`error`),E(g,n?`success`:`error`),n}function O(t){_=t.idUsuario,r.textContent=t.nombreCompleto||`Usuario`,i.textContent=`${t.local||`Sin local`} · ${t.rol||`Sin rol`}`,S(`fieldIdUsuario`,t.idUsuario),S(`fieldNombreCompleto`,t.nombreCompleto),S(`fieldUsuarioLogin`,t.usuarioLogin),S(`fieldRol`,t.rol),S(`fieldLocal`,t.local),S(`fieldCargo`,t.cargo),S(`fieldActivo`,t.activo?`SI`:`NO`),S(`fieldEmail`,t.email),S(`fieldTelefono`,t.telefono),S(`fieldFechaCreacion`,t.fechaCreacion),S(`fieldObservaciones`,t.observaciones),S(`fieldNewPin`,``),S(`fieldConfirmNewPin`,``),C(``),v=!1,u.classList.add(`hidden`),c.textContent=`Nuevo PIN`,e.classList.remove(`hidden`),e.classList.add(`grid`)}async function k(t){t.preventDefault();let n=e.querySelector(`#fieldNewPin`).value.trim();if(e.querySelector(`#fieldConfirmNewPin`).value.trim(),v){if(!n){p.show(`error`,`Debes ingresar el nuevo PIN.`);return}if(!D()){p.show(`error`,`La confirmación del nuevo PIN no coincide.`);return}}b(!0),C(`Guardando cambios del usuario...`);try{let t=await window.LVAuth.apiPost({accion:`ActualizarUsuarioAdmin`,idUsuario:_,nombreCompleto:e.querySelector(`#fieldNombreCompleto`).value.trim(),usuarioLogin:e.querySelector(`#fieldUsuarioLogin`).value.trim(),newPin:v?n:``,rol:e.querySelector(`#fieldRol`).value.trim(),local:e.querySelector(`#fieldLocal`).value.trim(),cargo:e.querySelector(`#fieldCargo`).value.trim(),activo:e.querySelector(`#fieldActivo`).value.trim(),email:e.querySelector(`#fieldEmail`).value.trim(),telefono:e.querySelector(`#fieldTelefono`).value.trim(),fechaCreacion:e.querySelector(`#fieldFechaCreacion`).value.trim(),observaciones:e.querySelector(`#fieldObservaciones`).value.trim()});if(t.status!==`SUCCESS`)throw Error(t.mensaje||`No se pudo actualizar el usuario.`);d.users=d.users.map(e=>e.idUsuario===t.user.idUsuario?t.user:e),x(),j(),p.show(`success`,`${t.user.nombreCompleto} actualizado correctamente.`),y()}catch(e){C(``),p.show(`error`,e.message||`No se pudo actualizar el usuario.`)}finally{b(!1)}}return t.addEventListener(`submit`,k),c.addEventListener(`click`,()=>{v=!v,u.classList.toggle(`hidden`,!v),c.textContent=v?`Cancelar cambio de PIN`:`Nuevo PIN`,v||(S(`fieldNewPin`,``),S(`fieldConfirmNewPin`,``)),D()}),h.addEventListener(`input`,D),g.addEventListener(`input`,D),e.querySelector(`#btnCloseEditUser`).addEventListener(`click`,y),e.querySelector(`#btnCancelEditUser`).addEventListener(`click`,y),n.addEventListener(`click`,y),{open:O,close:y}}function w(e,t,n=!1,r=`text`){return`
    <label class="grid gap-sm">
      <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">${t}</span>
      <input type="${r}" id="field${e.charAt(0).toUpperCase()}${e.slice(1)}" ${n?`disabled`:``} class="min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md text-base font-semibold text-neutral-charcoal placeholder:text-neutral-muted/70 focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30 ${n?`opacity-60`:``}">
    </label>
  `}function T(e,t,n){return`
    <label class="grid gap-sm">
      <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">${t}</span>
      <select id="field${e.charAt(0).toUpperCase()}${e.slice(1)}" class="min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md text-base font-semibold text-neutral-charcoal focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30">
        ${n.map(e=>`<option value="${e}">${e}</option>`).join(``)}
      </select>
    </label>
  `}function E(){let t=s(`app`),i=document.createElement(`div`);i.className=`mx-auto flex min-h-screen w-full max-w-[1380px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl`;let a=document.createElement(`div`);a.id=`sessionStatus`,a.className=`rounded-2xl border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-lg text-sm font-black leading-relaxed text-neutral-cream`,a.textContent=`Validando sesión...`;let o=document.createElement(`div`);o.className=`grid gap-md`,o.append(e(`Volver al panel`,{variant:`secondary`,className:`bg-white/88 text-neutral-charcoal hover:bg-white`,onClick:()=>{window.location.href=m(`administracion.html`)}}),e(`Cerrar sesión`,{onClick:async()=>{f.setLoading(!0,`Cerrando sesión...`),await h(),await window.LVAuth.logout(),window.LVAuth.redirectToIndex()}}));let c=r({badge:`La Victoria · Seguridad`,title:`Usuarios y permisos`,lead:`Gestiona usuarios por local con acordeones dedicados y edita cada ficha desde un modal completo. La matriz inferior resume permisos por rol en formato comparativo.`,highlights:b(),sideTitle:`Sesión y control`,sideStatus:a,sideCopy:`Los supervisores se asignan por fila y por local. Eso permite que una misma persona tenga alcance distinto según el local donde opere.`,sideActions:o,titleClassName:`max-w-[12ch] text-[clamp(40px,5vw,68px)]`,leadClassName:`max-w-[68ch]`,sideClassName:`lg:w-[340px]`}),l=n({eyebrow:`Filtro`,title:`Buscar usuarios`,body:`Filtra por nombre, usuario, local, cargo o rol. Los acordeones se actualizan con el subconjunto visible.`,className:`rounded-3xl md:p-2xl`}),u=document.createElement(`label`);u.className=`mt-xl grid gap-sm`,u.innerHTML=`
    <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Buscar</span>
    <input id="userSearchInput" type="search" placeholder="Ej: Ana, supervisor, Paseo del Lago" class="min-h-[54px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md text-base font-semibold text-neutral-charcoal placeholder:text-neutral-muted/80 focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30">
  `,l.appendChild(u);let d=n({eyebrow:`Usuarios`,title:`Roles por persona`,body:`Separamos la operación por acordeón: cada local muestra sus propios usuarios y el bloque de administradores queda aparte.`,className:`rounded-3xl md:p-2xl`}),p=document.createElement(`div`);p.id=`usersMeta`,p.className=`mt-lg text-sm font-bold text-neutral-muted`;let g=document.createElement(`div`);g.id=`usersAccordions`,g.className=`mt-xl grid gap-lg`,d.append(p,g);let _=n({eyebrow:`Permisos`,title:`Matriz por tipo de usuario`,body:`Comparación compacta por permiso y por rol. El orden fijo es Administrador, Supervisor, Colaborador.`,className:`rounded-3xl md:p-2xl`}),v=document.createElement(`div`);v.id=`permissionsMatrix`,v.className=`mt-xl overflow-hidden rounded-3xl border border-neutral-charcoal/10 bg-white/88 shadow-brand-sm`,_.appendChild(v),i.append(c,l,d,_),t.replaceChildren(i)}function D(){let e={};return d.roles.forEach(t=>{e[t.role]=t.permissions||{}}),e}function O(){let e=_(d.search);return d.users.filter(t=>e?_([t.nombreCompleto,t.usuarioLogin,t.local,t.cargo,t.rol,t.email,t.telefono].join(` `)).includes(e):!0)}function k(){let e=O(),t=[...new Set(e.filter(e=>e.rol!==`Administrador`).flatMap(e=>v(e.local)).filter(Boolean))].sort((e,t)=>e.localeCompare(t,`es`)).map(t=>({id:`local-${_(t)}`,title:t,subtitle:`Usuarios operativos asignados a este local`,users:e.filter(e=>e.rol!==`Administrador`&&v(e.local).includes(t))}));return t.push({id:`administradores`,title:`Administradores`,subtitle:`Usuarios con control global del sistema`,users:e.filter(e=>e.rol===`Administrador`)}),t}function A(e,t){let n=document.createElement(`div`);n.className=`overflow-x-auto`,n.innerHTML=`
    <table class="min-w-[1080px] w-full border-collapse">
      <thead class="bg-[#fff5e8]">
        <tr>
          <th class="px-lg py-md text-left text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Nombre</th>
          <th class="px-lg py-md text-left text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Usuario</th>
          <th class="px-lg py-md text-left text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Rol</th>
          <th class="px-lg py-md text-left text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Local</th>
          <th class="px-lg py-md text-left text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Cargo</th>
          <th class="px-lg py-md text-left text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Estado</th>
          <th class="px-lg py-md text-left text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Acción</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;let r=n.querySelector(`tbody`);return e.forEach(e=>{let n=document.createElement(`tr`);n.className=`border-t border-neutral-charcoal/8 align-top`,n.innerHTML=`
      <td class="px-lg py-lg">
        <div class="text-base font-black text-neutral-charcoal">${g(e.nombreCompleto)}</div>
        <div class="mt-xs text-xs font-bold uppercase tracking-[0.14em] text-neutral-muted">${g(e.idUsuario||`Sin ID`)}</div>
      </td>
      <td class="px-lg py-lg text-sm font-bold text-neutral-charcoal">${g(e.usuarioLogin||`Sin usuario`)}</td>
      <td class="px-lg py-lg">
        <span class="rounded-full border border-brand-bun/14 bg-brand-cheese/16 px-sm py-xs text-xs font-black text-brand-bun-dark">${g(e.rol)}</span>
      </td>
      <td class="px-lg py-lg text-sm font-bold text-neutral-charcoal">${g(e.local||`Sin local`)}</td>
      <td class="px-lg py-lg text-sm font-bold text-neutral-charcoal">${g(e.cargo||`Sin cargo`)}</td>
      <td class="px-lg py-lg">
        <span class="rounded-full border px-md py-sm text-xs font-black uppercase tracking-[0.16em] ${e.activo?`border-brand-lettuce/18 bg-brand-lettuce/10 text-brand-lettuce`:`border-brand-ketchup/18 bg-brand-ketchup/10 text-brand-ketchup`}">
          ${e.activo?`Activo`:`Inactivo`}
        </span>
      </td>
      <td class="px-lg py-lg">
        <button type="button" class="edit-user inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-brand-bun px-lg py-sm text-sm font-black text-neutral-charcoal transition-fast hover:bg-brand-bun-dark hover:text-neutral-cream">Editar</button>
      </td>
    `,n.querySelector(`.edit-user`).addEventListener(`click`,()=>t(e)),r.appendChild(n)}),n}function j(){let e=s(`usersAccordions`),t=window.__lvEditUserModal,n=k();s(`usersMeta`).textContent=`${O().length} usuario(s) visibles distribuidos por acordeón.`,e.innerHTML=``;let r=[];n.forEach(n=>{let i=S({id:n.id,title:n.title,subtitle:n.subtitle,badgeText:String(n.users.length),open:!y()});n.users.length?i.panel.appendChild(A(n.users,t.open)):i.panel.innerHTML=`<div class="rounded-2xl border border-neutral-charcoal/10 bg-white/84 px-lg py-lg text-sm font-bold text-neutral-muted">No hay usuarios visibles en este grupo.</div>`,e.appendChild(i.element),r.push(i)});function i(e){let t=!e.isOpen();r.forEach(n=>{n.setOpen(n===e?t:!1)})}r.forEach(e=>{e.bindToggle(()=>{if(y()){i(e);return}e.setOpen(!e.isOpen())})})}function M(){let e=s(`permissionsMatrix`),t=d.editingPermissions&&d.draftPermissions?d.draftPermissions:D();if(e.innerHTML=`
    <div class="relative">
      <div id="permissionsOverlay" class="pointer-events-none absolute inset-0 z-[1] hidden place-items-center bg-white/40 backdrop-blur-sm">
        <div class="inline-flex items-center gap-md rounded-full bg-gradient-to-r from-brand-cheese to-brand-bun px-xl py-md text-sm font-black text-neutral-charcoal shadow-brand">
          <span class="size-[18px] animate-spin rounded-full border-[3px] border-neutral-charcoal/20 border-t-neutral-charcoal"></span>
          <span>Guardando permisos...</span>
        </div>
      </div>
    <table class="w-full min-w-[760px] border-collapse">
      <thead class="bg-gradient-to-r from-brand-bun to-brand-bun-dark text-neutral-cream">
        <tr>
          <th class="px-lg py-lg text-left text-sm font-black uppercase tracking-[0.16em]">Permisos</th>
          <th class="px-lg py-lg text-center text-sm font-black uppercase tracking-[0.16em]">Administrador</th>
          <th class="px-lg py-lg text-center text-sm font-black uppercase tracking-[0.16em]">Supervisor</th>
          <th class="px-lg py-lg text-center text-sm font-black uppercase tracking-[0.16em]">Colaborador</th>
        </tr>
      </thead>
      <tbody>
        ${u.map(e=>`
          <tr class="border-t border-neutral-charcoal/8">
            <td class="px-lg py-lg text-sm font-bold text-neutral-charcoal">${e.label}</td>
            ${l.map(n=>{let r=!!(t[n]&&t[n][e.key]);return d.editingPermissions?`
                  <td class="px-lg py-lg text-center">
                    <label class="mx-auto inline-flex min-h-[48px] min-w-[48px] cursor-pointer items-center justify-center rounded-2xl border ${d.draftPermissions&&D()[n]&&d.draftPermissions[n][e.key]!==D()[n][e.key]?`border-sky-500 bg-sky-500/14 text-sky-700`:`border-neutral-charcoal/12 bg-white text-neutral-charcoal`}">
                      <input
                        type="checkbox"
                        data-role="${n}"
                        data-permission="${e.key}"
                        ${r?`checked`:``}
                        class="permission-checkbox size-5 accent-sky-600"
                      >
                    </label>
                  </td>
                `:`
                <td class="px-lg py-lg text-center">
                  <span class="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-2xl border text-2xl font-black ${r?`border-brand-lettuce/18 bg-brand-lettuce/12 text-brand-lettuce`:`border-brand-ketchup/18 bg-brand-ketchup/10 text-brand-ketchup`}">
                    ${r?`✓`:`×`}
                  </span>
                </td>
              `}).join(``)}
          </tr>
        `).join(``)}
      </tbody>
    </table>
    </div>
    <div class="flex flex-wrap items-center justify-end gap-sm border-t border-neutral-charcoal/8 bg-[#fffaf1] px-lg py-lg">
      <div id="permissionsSaveFeedback" class="mr-auto hidden rounded-2xl border border-brand-cheese/28 bg-brand-cheese/18 px-lg py-md text-sm font-bold text-brand-bun-dark"></div>
      ${d.editingPermissions?`
          <button type="button" id="btnCancelPermissionsEdit" class="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-neutral-charcoal/12 bg-white/92 px-xl py-md text-sm font-black text-neutral-charcoal">Cancelar</button>
          <button type="button" id="btnSavePermissionsMatrix" class="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-brand-bun px-xl py-md text-sm font-black text-neutral-charcoal transition-fast hover:bg-brand-bun-dark hover:text-neutral-cream">Guardar</button>
        `:`<button type="button" id="btnEditPermissionsMatrix" class="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-brand-bun px-xl py-md text-sm font-black text-neutral-charcoal transition-fast hover:bg-brand-bun-dark hover:text-neutral-cream">Editar permisos</button>`}
    </div>
  `,!d.editingPermissions){e.querySelector(`#btnEditPermissionsMatrix`).addEventListener(`click`,()=>{d.editingPermissions=!0,d.draftPermissions=JSON.parse(JSON.stringify(D())),M()});return}e.querySelectorAll(`.permission-checkbox`).forEach(e=>{e.addEventListener(`change`,()=>{let t=e.dataset.role,n=e.dataset.permission;d.draftPermissions[t]||(d.draftPermissions[t]={}),d.draftPermissions[t][n]=e.checked,M()})}),e.querySelector(`#btnCancelPermissionsEdit`).addEventListener(`click`,()=>{d.editingPermissions=!1,d.draftPermissions=null,M()}),e.querySelector(`#btnSavePermissionsMatrix`).addEventListener(`click`,async()=>{let t=e.querySelector(`#btnSavePermissionsMatrix`),n=e.querySelector(`#btnCancelPermissionsEdit`),r=e.querySelector(`#permissionsSaveFeedback`),i=e.querySelector(`#permissionsOverlay`);t.disabled=!0,n&&(n.disabled=!0),t.textContent=`Guardando...`,r.textContent=`Guardando matriz de permisos...`,r.classList.remove(`hidden`),i.classList.remove(`hidden`),i.classList.add(`grid`);try{for(let e of l){let t={accion:`ActualizarPermisosRolAdmin`,role:e};u.forEach(n=>{t[n.key]=d.draftPermissions[e]&&d.draftPermissions[e][n.key]?`SI`:`NO`});let n=await window.LVAuth.apiPost(t);if(n.status!==`SUCCESS`)throw Error(n.mensaje||`No se pudieron guardar los permisos de ${e}.`);d.roles=d.roles.map(t=>t.role===e?n.role:t)}d.editingPermissions=!1,d.draftPermissions=null,p.show(`success`,`Matriz de permisos actualizada.`),M()}catch(e){r.classList.add(`hidden`),i.classList.add(`hidden`),i.classList.remove(`grid`),p.show(`error`,e.message||`No se pudieron guardar los permisos.`)}finally{t.disabled=!1,n&&(n.disabled=!1),t.textContent=`Guardar permisos`}})}async function N(){f.setLoading(!0,`Cargando usuarios y permisos...`),await h();let e=await window.LVAuth.apiGet({accion:`BootstrapGestionUsuarios`});if(e.status!==`SUCCESS`)throw Error(e.mensaje||`No se pudieron cargar los usuarios.`);d.users=Array.isArray(e.users)?e.users:[],d.roles=Array.isArray(e.roles)?e.roles:[]}function P(){s(`userSearchInput`).addEventListener(`input`,e=>{d.search=e.target.value||``,j()})}async function F(){if(s(`app`).innerHTML=``,a({mountNode:s(`app`),variant:`table`}),f.setLoading(!0,`Validando sesión...`,`Estamos comprobando el acceso administrativo y preparando la carga de usuarios y permisos.`),d.session=await window.LVAuth.protectPage([window.LVAuth.roles.ADMINISTRADOR]),d.session){E(),P(),window.__lvEditUserModal=C(),s(`sessionStatus`).textContent=`${d.session.displayName||`Administrador`} · ${d.session.role}`;try{await N(),x(),j(),M()}finally{f.setLoading(!1)}}}F().catch(e=>{f.setLoading(!1),p.show(`error`,e.message||`No se pudo cargar la gestión de usuarios.`)});