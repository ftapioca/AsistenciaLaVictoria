import{t as e}from"./Button-Dvgf0D68.js";import{t}from"./LoadingOverlay-FeUgnCC2.js";import"./auth-Dnlybq2p.js";import{t as n}from"./Card-DK-BeK6p.js";import{t as r}from"./PageHero-Bo_9EZ5K.js";import{t as i}from"./StatGrid-oyYeg6DK.js";import{t as a}from"./PageSkeletons-DIYJpQOJ.js";import{t as o}from"./Toast-CYsOPytS.js";var s=e=>document.getElementById(e),c=[`Administrador`,`Supervisor`,`Colaborador`],l=[{key:`puede_ingresar_panel_admin`,label:`Panel administrativo`},{key:`puede_ver_mis_turnos`,label:`Ver mis turnos`},{key:`puede_programar_turnos`,label:`Programar turnos`},{key:`puede_ver_turnos_abiertos`,label:`Ver turnos abiertos`},{key:`puede_registrar_asistencia_admin`,label:`Registrar asistencia admin`},{key:`puede_ver_colaboradores_local`,label:`Ver colaboradores por local`},{key:`puede_importar_ventas`,label:`Importar ventas`},{key:`puede_ver_pagos`,label:`Ver pagos`},{key:`puede_gestionar_plantillas_turnos`,label:`Gestionar plantillas`},{key:`puede_copiar_semanas`,label:`Copiar semanas`},{key:`puede_eliminar_turnos`,label:`Eliminar turnos`}],u={session:null,users:[],roles:[],search:``,sortKey:`rol`,sortDirection:`asc`,editingPermissions:!1,draftPermissions:null},d=t(`Procesando...`);document.body.appendChild(d.element),d.setLoading(!0,`Validando sesión...`);var f=o();document.body.appendChild(f.element);function p(e){let t=new URL(e,window.location.href),n=window.APP_CONFIG&&window.APP_CONFIG.ENVIRONMENT;return n&&t.searchParams.set(`env`,n),t.toString()}function m(){return new Promise(e=>requestAnimationFrame(e))}function h(e){return String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function g(e){return String(e||``).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).trim().toLowerCase()}function _(e){return String(e||``).split(/[;,|/]+/).map(e=>e.trim()).filter(Boolean)}function v(){let e=u.users.filter(e=>e.activo).length,t=[...new Set(u.users.flatMap(e=>_(e.local)).filter(Boolean))].length,n=i([{label:`Usuarios`,value:String(u.users.length),detail:`${e} activos en la hoja Usuarios.`},{label:`Locales`,value:String(t||2),detail:`Usuarios ordenados por jerarquía y nombre.`},{label:`Entorno`,value:(window.APP_CONFIG&&window.APP_CONFIG.ENVIRONMENT||`prod`).toUpperCase(),detail:`Cada edición impacta el entorno activo.`}],{tone:`dark`});return n.id=`summaryHighlights`,n}function y(){let e=s(`summaryHighlights`),t=v();e&&e.parentNode&&e.parentNode.replaceChild(t,e)}function b(){let e=document.createElement(`div`);e.id=`editUserModal`,e.className=`fixed inset-0 z-[140] hidden items-center justify-center bg-neutral-charcoal/68 px-lg py-lg backdrop-blur`,e.innerHTML=`
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
          ${x(`idUsuario`,`ID usuario`,!0)}
          ${x(`nombreCompleto`,`Nombre completo`)}
          ${x(`usuarioLogin`,`Usuario login`)}
          ${S(`rol`,`Rol`,c)}
          ${x(`local`,`Local`)}
          ${x(`cargo`,`Cargo`)}
          ${S(`activo`,`Activo`,[`SI`,`No`])}
          ${x(`email`,`Email`)}
          ${x(`telefono`,`Telefono`)}
          ${x(`fechaCreacion`,`Fecha creacion`)}
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
            ${x(`newPin`,`Nuevo PIN`,!1,`password`)}
            ${x(`confirmNewPin`,`Confirmar nuevo PIN`,!1,`password`)}
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
  `,document.body.appendChild(e);let t=e.querySelector(`#editUserForm`),n=e.querySelector(`[data-modal-backdrop]`),r=e.querySelector(`#editUserTitle`),i=e.querySelector(`#editUserSubtitle`),a=e.querySelector(`#btnSaveEditUser`),o=e.querySelector(`#btnCancelEditUser`),s=e.querySelector(`#btnCloseEditUser`),l=e.querySelector(`#btnTogglePinChange`),p=e.querySelector(`#pinChangePanel`),h=e.querySelector(`#pinMatchStatus`),g=e.querySelector(`#editUserFeedback`),_=e.querySelector(`#fieldNewPin`),v=e.querySelector(`#fieldConfirmNewPin`),b=``,C=!1;function w(){e.classList.add(`hidden`),e.classList.remove(`grid`),b=``,C=!1,p.classList.add(`hidden`),l.textContent=`Nuevo PIN`,E(`fieldNewPin`,``),E(`fieldConfirmNewPin`,``),A(),O(``)}function T(e){a.disabled=e,o.disabled=e,s.disabled=e,l.disabled=e,a.textContent=e?`Guardando...`:`Guardar cambios`}function E(t,n){let r=e.querySelector(`#${t}`);r&&(r.value=n||``)}function O(e){if(!e){g.textContent=``,g.classList.add(`hidden`);return}g.textContent=e,g.classList.remove(`hidden`)}function k(e,t){if(!e)return;let n=`min-h-[52px] rounded-2xl bg-white/90 px-lg py-md text-base font-semibold placeholder:text-neutral-muted/70 focus:outline-none focus:ring-2`;if(t===`error`){e.className=`${n} border border-brand-ketchup bg-brand-ketchup/10 text-neutral-charcoal focus:border-brand-ketchup focus:ring-brand-ketchup/30`;return}if(t===`success`){e.className=`${n} border border-brand-lettuce bg-brand-lettuce/10 text-neutral-charcoal focus:border-brand-lettuce focus:ring-brand-lettuce/30`;return}e.className=`${n} border border-neutral-charcoal/10 text-neutral-charcoal focus:border-brand-bun focus:ring-brand-bun/30`}function A(){if(!C)return h.textContent=``,h.className=`mt-md hidden rounded-2xl border px-lg py-md text-sm font-bold`,k(_),k(v),!0;let e=_.value.trim(),t=v.value.trim();if(!t)return h.textContent=``,h.className=`mt-md hidden rounded-2xl border px-lg py-md text-sm font-bold`,k(_),k(v),!1;let n=e&&e===t;return h.textContent=n?`Los PIN coinciden.`:`Los PIN no coinciden.`,h.className=`mt-md rounded-2xl border px-lg py-md text-sm font-bold ${n?`border-brand-lettuce bg-brand-lettuce/10 text-brand-lettuce`:`border-brand-ketchup bg-brand-ketchup/10 text-brand-ketchup`}`,k(_,n?`success`:`error`),k(v,n?`success`:`error`),n}function j(t){b=t.idUsuario,r.textContent=t.nombreCompleto||`Usuario`,i.textContent=`${t.local||`Sin local`} · ${t.rol||`Sin rol`}`,E(`fieldIdUsuario`,t.idUsuario),E(`fieldNombreCompleto`,t.nombreCompleto),E(`fieldUsuarioLogin`,t.usuarioLogin),E(`fieldRol`,t.rol),E(`fieldLocal`,t.local),E(`fieldCargo`,t.cargo),E(`fieldActivo`,t.activo?`SI`:`No`),E(`fieldEmail`,t.email),E(`fieldTelefono`,t.telefono),E(`fieldFechaCreacion`,t.fechaCreacion),E(`fieldObservaciones`,t.observaciones),E(`fieldNewPin`,``),E(`fieldConfirmNewPin`,``),O(``),C=!1,p.classList.add(`hidden`),l.textContent=`Nuevo PIN`,e.classList.remove(`hidden`),e.classList.add(`grid`)}async function M(t){t.preventDefault();let n=e.querySelector(`#fieldNewPin`).value.trim();if(e.querySelector(`#fieldConfirmNewPin`).value.trim(),C){if(!n){f.show(`error`,`Debes ingresar el nuevo PIN.`);return}if(!A()){f.show(`error`,`La confirmación del nuevo PIN no coincide.`);return}}T(!0),O(``),d.setLoading(!0,`Guardando cambios del usuario...`,`Estamos actualizando sus datos de acceso, rol y asignaciones.`),await m();try{let t=await window.LVAuth.apiPost({accion:`ActualizarUsuarioAdmin`,idUsuario:b,nombreCompleto:e.querySelector(`#fieldNombreCompleto`).value.trim(),usuarioLogin:e.querySelector(`#fieldUsuarioLogin`).value.trim(),newPin:C?n:``,rol:e.querySelector(`#fieldRol`).value.trim(),local:e.querySelector(`#fieldLocal`).value.trim(),cargo:e.querySelector(`#fieldCargo`).value.trim(),activo:e.querySelector(`#fieldActivo`).value.trim(),email:e.querySelector(`#fieldEmail`).value.trim(),telefono:e.querySelector(`#fieldTelefono`).value.trim(),fechaCreacion:e.querySelector(`#fieldFechaCreacion`).value.trim(),observaciones:e.querySelector(`#fieldObservaciones`).value.trim()});if(t.status!==`SUCCESS`)throw Error(t.mensaje||`No se pudo actualizar el usuario.`);u.users=u.users.map(e=>e.idUsuario===t.user.idUsuario?t.user:e),y(),D(),f.show(`success`,`${t.user.nombreCompleto} actualizado correctamente.`),w()}catch(e){O(e.message||`No se pudo actualizar el usuario. Corrige los datos e inténtalo nuevamente.`),f.show(`error`,e.message||`No se pudo actualizar el usuario.`)}finally{d.setLoading(!1),T(!1)}}return t.addEventListener(`submit`,M),l.addEventListener(`click`,()=>{C=!C,p.classList.toggle(`hidden`,!C),l.textContent=C?`Cancelar cambio de PIN`:`Nuevo PIN`,C||(E(`fieldNewPin`,``),E(`fieldConfirmNewPin`,``)),A()}),_.addEventListener(`input`,A),v.addEventListener(`input`,A),e.querySelector(`#btnCloseEditUser`).addEventListener(`click`,w),e.querySelector(`#btnCancelEditUser`).addEventListener(`click`,w),n.addEventListener(`click`,w),{open:j,close:w}}function x(e,t,n=!1,r=`text`){return`
    <label class="grid gap-sm">
      <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">${t}</span>
      <input type="${r}" id="field${e.charAt(0).toUpperCase()}${e.slice(1)}" ${n?`disabled`:``} class="min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md text-base font-semibold text-neutral-charcoal placeholder:text-neutral-muted/70 focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30 ${n?`opacity-60`:``}">
    </label>
  `}function S(e,t,n){return`
    <label class="grid gap-sm">
      <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">${t}</span>
      <select id="field${e.charAt(0).toUpperCase()}${e.slice(1)}" class="min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md text-base font-semibold text-neutral-charcoal focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30">
        ${n.map(e=>`<option value="${e}">${e}</option>`).join(``)}
      </select>
    </label>
  `}function C(){let t=s(`app`),i=document.createElement(`div`);i.className=`mx-auto flex min-h-screen w-full max-w-[1380px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl`;let a=document.createElement(`div`);a.id=`sessionStatus`,a.className=`rounded-2xl border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-lg text-sm font-black leading-relaxed text-neutral-cream`,a.textContent=`Validando sesión...`;let o=document.createElement(`div`);o.className=`grid gap-md`,o.append(e(`Volver al panel`,{variant:`secondary`,className:`bg-white/88 text-neutral-charcoal hover:bg-white`,onClick:()=>{window.location.href=p(`administracion.html`)}}),e(`Cerrar sesión`,{onClick:async()=>{d.setLoading(!0,`Cerrando sesión...`),await m(),await window.LVAuth.logout(),window.LVAuth.redirectToIndex()}}));let c=r({badge:`La Victoria · Seguridad`,title:`Usuarios y permisos`,lead:`Gestiona usuarios desde una lista única ordenada por jerarquía y local. La matriz inferior resume permisos por rol en formato comparativo.`,highlights:v(),sideTitle:`Sesión y control`,sideStatus:a,sideCopy:`Los supervisores se asignan por fila y por local. Eso permite que una misma persona tenga alcance distinto según el local donde opere.`,sideActions:o,titleClassName:`max-w-[12ch] text-[clamp(40px,5vw,68px)]`,leadClassName:`max-w-[68ch]`,sideClassName:`lg:w-[340px]`}),l=n({eyebrow:`Usuarios`,title:`Lista de usuarios`,body:`Administradores, supervisores y colaboradores se muestran en una sola tabla, ordenados por jerarquía y local asignado.`,className:`rounded-3xl md:p-2xl`}),u=document.createElement(`div`);u.id=`usersMeta`,u.className=`text-sm font-bold text-neutral-muted`;let f=document.createElement(`div`);f.className=`mt-xl flex flex-col gap-md lg:flex-row lg:items-end lg:justify-between`;let h=document.createElement(`label`);h.className=`grid w-full gap-sm lg:max-w-[420px]`,h.innerHTML=`
    <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Buscar en usuarios</span>
    <input id="userSearchInput" type="search" placeholder="Ej: Ana, supervisor, Paseo del Lago" class="min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md text-base font-semibold text-neutral-charcoal placeholder:text-neutral-muted/80 focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30">
  `,f.append(u,h);let g=document.createElement(`div`);g.id=`usersTable`,g.className=`mt-xl overflow-hidden rounded-2xl border border-neutral-charcoal/10 bg-white/84`,l.append(f,g);let _=n({eyebrow:`Permisos`,title:`Matriz por tipo de usuario`,body:`Comparación compacta por permiso y por rol. El orden fijo es Administrador, Supervisor, Colaborador.`,className:`rounded-3xl md:p-2xl`}),y=document.createElement(`div`);y.id=`permissionsMatrix`,y.className=`mt-xl overflow-hidden rounded-3xl border border-neutral-charcoal/10 bg-white/88 shadow-brand-sm`,_.appendChild(y),i.append(c,l,_),t.replaceChildren(i)}function w(){let e={};return u.roles.forEach(t=>{e[t.role]=t.permissions||{}}),e}function T(){let e=g(u.search),t=new Map(c.map((e,t)=>[e,t]));return u.users.filter(t=>e?g([t.nombreCompleto,t.usuarioLogin,t.local,t.cargo,t.rol,t.email,t.telefono].join(` `)).includes(e):!0).sort((e,n)=>{let r=(e,t)=>String(e||``).localeCompare(String(t||``),`es`),i=()=>(t.get(e.rol)??c.length)-(t.get(n.rol)??c.length),a={nombreCompleto:r(e.nombreCompleto,n.nombreCompleto),usuarioLogin:r(e.usuarioLogin,n.usuarioLogin),rol:i(),local:r(e.local,n.local),cargo:r(e.cargo,n.cargo),activo:Number(!!e.activo)-Number(!!n.activo)}[u.sortKey]??0;if(a)return a*(u.sortDirection===`asc`?1:-1);if(u.sortKey!==`rol`){let e=i();if(e)return e}return r(e.nombreCompleto,n.nombreCompleto)})}function E(e,t){let n=[{key:`nombreCompleto`,label:`Nombre`},{key:`usuarioLogin`,label:`Usuario`},{key:`rol`,label:`Rol`},{key:`local`,label:`Local`},{key:`cargo`,label:`Cargo`},{key:`activo`,label:`Estado`}],r=document.createElement(`div`);r.className=`overflow-x-auto`,r.innerHTML=`
    <table class="min-w-[1080px] w-full border-collapse">
      <thead class="bg-[#fff5e8]">
        <tr>
          ${n.map(({key:e,label:t})=>{let n=u.sortKey===e,r=n?u.sortDirection===`asc`?`↑`:`↓`:`↕`;return`
              <th class="px-lg py-md text-left">
                <button type="button" data-sort-key="${e}" aria-sort="${n?u.sortDirection===`asc`?`ascending`:`descending`:`none`}" class="inline-flex items-center gap-xs text-xs font-black uppercase tracking-[0.16em] text-neutral-muted transition-fast hover:text-neutral-charcoal">
                  ${t}<span aria-hidden="true">${r}</span>
                </button>
              </th>
            `}).join(``)}
          <th class="px-lg py-md text-left text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Acción</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `,r.querySelectorAll(`[data-sort-key]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.sortKey;u.sortKey===t?u.sortDirection=u.sortDirection===`asc`?`desc`:`asc`:(u.sortKey=t,u.sortDirection=`asc`),D()})});let i=r.querySelector(`tbody`);return e.forEach(e=>{let n=document.createElement(`tr`);n.className=`border-t border-neutral-charcoal/8 align-top`,n.innerHTML=`
      <td class="px-lg py-lg">
        <div class="text-base font-black text-neutral-charcoal">${h(e.nombreCompleto)}</div>
        <div class="mt-xs text-xs font-bold uppercase tracking-[0.14em] text-neutral-muted">${h(e.idUsuario||`Sin ID`)}</div>
      </td>
      <td class="px-lg py-lg text-sm font-bold text-neutral-charcoal">${h(e.usuarioLogin||`Sin usuario`)}</td>
      <td class="px-lg py-lg">
        <span class="rounded-full border border-brand-bun/14 bg-brand-cheese/16 px-sm py-xs text-xs font-black text-brand-bun-dark">${h(e.rol)}</span>
      </td>
      <td class="px-lg py-lg text-sm font-bold text-neutral-charcoal">${h(e.local||`Sin local`)}</td>
      <td class="px-lg py-lg text-sm font-bold text-neutral-charcoal">${h(e.cargo||`Sin cargo`)}</td>
      <td class="px-lg py-lg">
        <span class="rounded-full border px-md py-sm text-xs font-black uppercase tracking-[0.16em] ${e.activo?`border-brand-lettuce/18 bg-brand-lettuce/10 text-brand-lettuce`:`border-brand-ketchup/18 bg-brand-ketchup/10 text-brand-ketchup`}">
          ${e.activo?`Activo`:`Inactivo`}
        </span>
      </td>
      <td class="px-lg py-lg">
        <button type="button" class="edit-user inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-brand-bun px-lg py-sm text-sm font-black text-neutral-charcoal transition-fast hover:bg-brand-bun-dark hover:text-neutral-cream">Editar</button>
      </td>
    `,n.querySelector(`.edit-user`).addEventListener(`click`,()=>t(e)),i.appendChild(n)}),r}function D(){let e=s(`usersTable`),t=window.__lvEditUserModal,n=T();if(s(`usersMeta`).textContent=`${n.length} usuario(s) visibles. Orden: rol, local y nombre.`,e.innerHTML=``,!n.length){e.innerHTML=`<div class="px-lg py-xl text-sm font-bold text-neutral-muted">No hay usuarios que coincidan con la búsqueda.</div>`;return}e.appendChild(E(n,t.open))}function O(){let e=s(`permissionsMatrix`),t=u.editingPermissions&&u.draftPermissions?u.draftPermissions:w();if(e.innerHTML=`
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
        ${l.map(e=>`
          <tr class="border-t border-neutral-charcoal/8">
            <td class="px-lg py-lg text-sm font-bold text-neutral-charcoal">${e.label}</td>
            ${c.map(n=>{let r=!!(t[n]&&t[n][e.key]);return u.editingPermissions?`
                  <td class="px-lg py-lg text-center">
                    <label class="mx-auto inline-flex min-h-[48px] min-w-[48px] cursor-pointer items-center justify-center rounded-2xl border ${u.draftPermissions&&w()[n]&&u.draftPermissions[n][e.key]!==w()[n][e.key]?`border-sky-500 bg-sky-500/14 text-sky-700`:`border-neutral-charcoal/12 bg-white text-neutral-charcoal`}">
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
      ${u.editingPermissions?`
          <button type="button" id="btnCancelPermissionsEdit" class="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-neutral-charcoal/12 bg-white/92 px-xl py-md text-sm font-black text-neutral-charcoal">Cancelar</button>
          <button type="button" id="btnSavePermissionsMatrix" class="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-brand-bun px-xl py-md text-sm font-black text-neutral-charcoal transition-fast hover:bg-brand-bun-dark hover:text-neutral-cream">Guardar</button>
        `:`<button type="button" id="btnEditPermissionsMatrix" class="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-brand-bun px-xl py-md text-sm font-black text-neutral-charcoal transition-fast hover:bg-brand-bun-dark hover:text-neutral-cream">Editar permisos</button>`}
    </div>
  `,!u.editingPermissions){e.querySelector(`#btnEditPermissionsMatrix`).addEventListener(`click`,()=>{u.editingPermissions=!0,u.draftPermissions=JSON.parse(JSON.stringify(w())),O()});return}e.querySelectorAll(`.permission-checkbox`).forEach(e=>{e.addEventListener(`change`,()=>{let t=e.dataset.role,n=e.dataset.permission;u.draftPermissions[t]||(u.draftPermissions[t]={}),u.draftPermissions[t][n]=e.checked,O()})}),e.querySelector(`#btnCancelPermissionsEdit`).addEventListener(`click`,()=>{u.editingPermissions=!1,u.draftPermissions=null,O()}),e.querySelector(`#btnSavePermissionsMatrix`).addEventListener(`click`,async()=>{let t=e.querySelector(`#btnSavePermissionsMatrix`),n=e.querySelector(`#btnCancelPermissionsEdit`),r=e.querySelector(`#permissionsSaveFeedback`);t.disabled=!0,n&&(n.disabled=!0),t.textContent=`Guardando...`,r.classList.add(`hidden`),d.setLoading(!0,`Guardando matriz de permisos...`,`Estamos aplicando los permisos definidos para cada rol.`),await m();try{for(let e of c){let t={accion:`ActualizarPermisosRolAdmin`,role:e};l.forEach(n=>{t[n.key]=u.draftPermissions[e]&&u.draftPermissions[e][n.key]?`SI`:`NO`});let n=await window.LVAuth.apiPost(t);if(n.status!==`SUCCESS`)throw Error(n.mensaje||`No se pudieron guardar los permisos de ${e}.`);u.roles=u.roles.map(t=>t.role===e?n.role:t)}u.editingPermissions=!1,u.draftPermissions=null,f.show(`success`,`Matriz de permisos actualizada.`),O()}catch(e){r.textContent=e.message||`No se pudieron guardar los permisos.`,r.classList.remove(`hidden`),f.show(`error`,e.message||`No se pudieron guardar los permisos.`)}finally{d.setLoading(!1),t.disabled=!1,n&&(n.disabled=!1),t.textContent=`Guardar permisos`}})}async function k(){d.setLoading(!0,`Cargando usuarios y permisos...`),await m();let e=await window.LVAuth.apiGet({accion:`BootstrapGestionUsuarios`});if(e.status!==`SUCCESS`)throw Error(e.mensaje||`No se pudieron cargar los usuarios.`);u.users=Array.isArray(e.users)?e.users:[],u.roles=Array.isArray(e.roles)?e.roles:[]}function A(){s(`userSearchInput`).addEventListener(`input`,e=>{u.search=e.target.value||``,D()})}async function j(){if(s(`app`).innerHTML=``,a({mountNode:s(`app`),variant:`table`}),d.setLoading(!0,`Validando sesión...`,`Estamos comprobando el acceso administrativo y preparando la carga de usuarios y permisos.`),u.session=await window.LVAuth.protectPage([window.LVAuth.roles.ADMINISTRADOR]),u.session){C(),A(),window.__lvEditUserModal=b(),s(`sessionStatus`).textContent=`${u.session.displayName||`Administrador`} · ${u.session.role}`;try{await k(),y(),D(),O()}finally{d.setLoading(!1)}}}j().catch(e=>{d.setLoading(!1),f.show(`error`,e.message||`No se pudo cargar la gestión de usuarios.`)});