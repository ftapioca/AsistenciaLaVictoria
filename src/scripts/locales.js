import '../styles/globals.css';
import '../../app-config.prod.js';
import '../../app-config.staging.js';
import '../../app-config.js';
import '../../env-badge.js';
import '../../auth.js';
import { createButton } from '../components/Button.js';
import { createPageHero } from '../components/PageHero.js';
import { createLoadingOverlay } from '../components/LoadingOverlay.js';
import { createPageSkeleton } from '../components/PageSkeletons.js';
import { descargarRegistroLocal, escaparHtml as esc } from '../utils/registro-local.js';

const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const field = 'min-h-[48px] w-full rounded-xl border border-neutral-charcoal/20 bg-white px-md py-sm text-base';
const card = 'rounded-3xl border border-neutral-charcoal/10 bg-white/95 p-lg shadow-brand md:p-xl';
const state = { session: null, locales: [], usuarios: [], vista: 'lista', payload: null, revision: null };
const overlay = createLoadingOverlay('Cargando locales...');
document.body.appendChild(overlay.element);
const app = document.getElementById('app');
function ruta(path) { const url = new URL(path, location.href); url.searchParams.set('env', window.APP_CONFIG.ENVIRONMENT); return url.href; }
function aviso(message) { const node = document.getElementById('localFeedback'); node.textContent = message; node.hidden = !message; }
let pendiente = false;
async function ocupada(text, work) { if (pendiente) return; pendiente = true; overlay.setLoading(true, text); try { await work(); } catch (error) { aviso(error.message || 'No se pudo completar la operación.'); } finally { pendiente = false; overlay.setLoading(false); } }
function nuevaSolicitud() { return { nombre: '', horarios: dias.map(() => ({ abierto: true, apertura: '', cierre: '' })), usuarios: [] }; }
async function cargar() {
  const [locales, usuarios] = await Promise.all([
    window.LVAuth.apiGet({ accion: 'BootstrapAdministracionLocales' }),
    window.LVAuth.apiGet({ accion: 'BootstrapGestionUsuarios' }),
  ]);
  if (locales.status !== 'SUCCESS' || usuarios.status !== 'SUCCESS') throw new Error(locales.mensaje || usuarios.mensaje || 'No se pudo cargar el catálogo.');
  state.locales = locales.locales;
  state.usuarios = usuarios.users.filter((user) => user.activo && ['Colaborador', 'Supervisor'].includes(user.rol));
}
function render() {
  const shell = document.createElement('div');
  shell.className = 'mx-auto grid min-h-screen content-start max-w-[1240px] gap-lg px-lg py-lg md:px-2xl md:py-2xl';
  const actions = document.createElement('div');
  actions.appendChild(createButton('Volver a administración', { variant: 'secondary', onClick: () => { location.href = ruta('administracion.html'); } }));
  shell.appendChild(createPageHero({ badge: 'La Victoria · Administración', title: 'Locales', lead: 'Crea un local, configura su semana y asigna al equipo que ya trabaja en La Victoria.', sideTitle: 'Sesión', sideCopy: `${state.session.displayName} · ${window.APP_CONFIG.ENVIRONMENT.toUpperCase()}`, sideActions: actions }));
  const feedback = document.createElement('p'); feedback.id = 'localFeedback'; feedback.hidden = true; feedback.setAttribute('role', 'alert'); feedback.className = 'rounded-2xl bg-white p-lg font-bold text-brand-ketchup'; shell.appendChild(feedback);
  const content = document.createElement('section'); content.className = card; shell.appendChild(content); app.replaceChildren(shell);
  if (state.vista === 'lista') renderLista(content);
  if (state.vista === 'formulario') renderFormulario(content);
  if (state.vista === 'revision') renderRevision(content);
}
function renderLista(root) {
  const header = document.createElement('div'); header.className = 'mb-lg flex flex-wrap items-center justify-between gap-md';
  header.innerHTML = '<h2 class="text-3xl font-black">Locales registrados</h2>';
  header.appendChild(createButton('Actualizar listado', { variant: 'secondary', onClick: () => ocupada('Actualizando locales...', async () => { await cargar(); render(); }) }));
  header.appendChild(createButton('Nuevo local', { onClick: () => { state.payload = nuevaSolicitud(); state.vista = 'formulario'; render(); } })); root.appendChild(header);
  const list = document.createElement('div'); list.className = 'divide-y divide-neutral-charcoal/10';
  state.locales.forEach((local) => {
    const row = document.createElement('article'); row.className = 'flex flex-wrap items-center justify-between gap-lg py-lg';
    const label = document.createElement('div'); label.innerHTML = `<h3 class="text-xl font-black">${esc(local.nombre)}</h3><p class="mt-sm text-sm font-bold text-neutral-muted">${esc(local.estado)} · ${local.permiteProgramacion ? 'Programación habilitada' : 'Sin programación'}</p>`; row.appendChild(label);
    const actions = document.createElement('div'); actions.className = 'flex flex-wrap gap-sm';
    if (local.activo && local.permiteAsistencia) actions.appendChild(createButton('Descargar registro', { variant: 'secondary', onClick: () => ocupada('Preparando archivo...', () => descargarRegistroLocal(local.nombre)) }));
    actions.appendChild(createButton('Horarios', { variant: 'secondary', onClick: () => { location.href = ruta('horariosLocales.html'); } })); row.appendChild(actions); list.appendChild(row);
  }); root.appendChild(list);
}
function renderFormulario(root) {
  const p = state.payload;
  root.innerHTML = `<h2 class="text-3xl font-black">Nuevo local</h2><p class="mt-sm text-base text-neutral-muted">Revisa el horario operativo y el equipo antes de guardar. El local se creará activo, con asistencia y programación, sin comisiones por ventas.</p>
  <form id="altaLocalForm" class="mt-xl grid gap-xl">
    <label class="grid gap-sm font-bold">Nombre del local<input class="${field}" name="nombre" maxlength="80" required value="${esc(p.nombre)}" autocomplete="off"></label>
    <fieldset class="grid gap-lg"><legend class="mb-lg text-xl font-black">Horario operativo</legend><p class="text-sm text-neutral-muted">Usa 00:00 para el cierre a medianoche. Desmarca los días cerrados.</p>
      <div class="grid gap-md sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label class="grid gap-sm font-bold">Apertura común<input type="time" id="aperturaComun" class="${field}"></label><label class="grid gap-sm font-bold">Cierre común<input type="time" id="cierreComun" class="${field}"></label><button type="button" id="aplicarSemana" class="min-h-[48px] rounded-xl bg-brand-cheese px-lg font-black">Aplicar a días abiertos</button></div>
      ${dias.map((dia, i) => `<div class="grid items-center gap-md rounded-2xl bg-neutral-cream p-md sm:grid-cols-[1.2fr_1fr_1fr]"><label class="flex items-center gap-sm font-bold"><input type="checkbox" name="abierto_${i}" ${p.horarios[i].abierto ? 'checked' : ''}>${dia}</label><label class="grid gap-sm text-sm font-bold">Apertura<input type="time" class="${field}" name="apertura_${i}" value="${esc(p.horarios[i].apertura)}" ${p.horarios[i].abierto ? 'required' : 'disabled'}></label><label class="grid gap-sm text-sm font-bold">Cierre<input type="time" class="${field}" name="cierre_${i}" value="${esc(p.horarios[i].cierre)}" ${p.horarios[i].abierto ? 'required' : 'disabled'}></label></div>`).join('')}
    </fieldset>
    <fieldset class="grid gap-md"><legend class="mb-md text-xl font-black">Equipo del local</legend><p class="text-sm text-neutral-muted">Selecciona cuentas existentes. Se conservan sus roles y sus otros locales. También puedes asignarlas más adelante desde Usuarios y permisos.</p>
      <div class="grid gap-md sm:grid-cols-2">${state.usuarios.map((user) => `<label class="flex cursor-pointer items-start gap-md rounded-2xl border border-neutral-charcoal/15 p-md"><input class="mt-1" type="checkbox" name="usuario" value="${esc(user.idUsuario)}" ${p.usuarios.includes(user.idUsuario) ? 'checked' : ''}><span><strong>${esc(user.nombreCompleto)}</strong><span class="block text-sm text-neutral-muted">${esc(user.rol)} · ${esc(user.local || 'Sin local')}</span></span></label>`).join('')}</div>
    </fieldset><div class="flex flex-wrap gap-md" id="formActions"></div>
  </form>`;
  const form = root.querySelector('form');
  dias.forEach((_, i) => form.elements[`abierto_${i}`].addEventListener('change', () => {
    const abierto = form.elements[`abierto_${i}`].checked;
    for (const prefix of ['apertura', 'cierre']) { form.elements[`${prefix}_${i}`].disabled = !abierto; form.elements[`${prefix}_${i}`].required = abierto; }
  }));
  root.querySelector('#aplicarSemana').addEventListener('click', () => {
    const apertura = root.querySelector('#aperturaComun').value, cierre = root.querySelector('#cierreComun').value;
    if (!apertura || !cierre || apertura === cierre) { aviso('Indica una apertura y un cierre distintos.'); return; }
    dias.forEach((_, i) => { if (form.elements[`abierto_${i}`].checked) { form.elements[`apertura_${i}`].value = apertura; form.elements[`cierre_${i}`].value = cierre; } }); aviso('');
  });
  root.querySelector('#formActions').append(
    createButton('Revisar alta', { onClick: () => form.requestSubmit() }),
    createButton('Cancelar', { variant: 'secondary', onClick: () => { state.vista = 'lista'; render(); } }),
  );
  form.addEventListener('submit', (event) => {
    event.preventDefault(); const values = new FormData(form);
    state.payload = { nombre: String(values.get('nombre')).trim(), horarios: dias.map((_, i) => ({ abierto: form.elements[`abierto_${i}`].checked, apertura: form.elements[`apertura_${i}`].value, cierre: form.elements[`cierre_${i}`].value })), usuarios: values.getAll('usuario') };
    ocupada('Revisando el alta...', async () => {
      const response = await window.LVAuth.apiPost({ accion: 'RevisarAltaLocalAdmin', payload: JSON.stringify(state.payload) });
      if (response.status !== 'SUCCESS') throw new Error(response.mensaje || 'No se pudo revisar el alta.');
      state.revision = response; state.vista = 'revision'; render();
    });
  });
}
function renderRevision(root) {
  const r = state.revision;
  root.innerHTML = `<h2 class="text-3xl font-black">Revisar ${esc(r.local)}</h2><p class="mt-md text-neutral-muted">El alta todavía no está guardada.</p><dl class="mt-lg grid gap-md"><div><dt class="font-black">Operación</dt><dd>Asistencia y programación habilitadas. Sin comisiones por ventas.</dd></div><div><dt class="font-black">Horario operativo</dt><dd class="mt-sm grid gap-sm">${r.horarios.map((h, i) => `<p>${dias[i]}: ${h.abierto ? `${esc(h.apertura)} a ${esc(h.cierre)}` : 'Cerrado'}</p>`).join('')}</dd></div><div><dt class="font-black">Usuarios existentes asignados</dt><dd>${r.usuarios.length ? r.usuarios.map((u) => `<p class="mt-sm">${esc(u.nombre)} · ${esc(u.rol)}</p>`).join('') : 'Sin usuarios por ahora; podrás asignarlos más adelante.'}</dd></div></dl><div class="mt-xl flex flex-wrap gap-md" id="reviewActions"></div>`;
  root.querySelector('#reviewActions').append(
    createButton('Crear local', { onClick: () => ocupada('Creando local y asignaciones...', async () => {
      let response;
      try { response = await window.LVAuth.apiPost({ accion: 'CrearLocalOperativoAdmin', payload: JSON.stringify(state.payload) }); }
      catch (error) { throw new Error('No se pudo confirmar el alta. Actualiza el listado antes de reintentar. ' + error.message); }
      if (response.status !== 'SUCCESS') throw new Error(response.mensaje || 'No se pudo crear el local. Si hubo un corte de conexión, actualiza el listado antes de reintentar.');
      // El alta ya esta confirmada; un fallo al recargar no debe ofrecer crearla otra vez.
      state.vista = 'lista';
      let falloCarga = false;
      try { await cargar(); } catch (error) { falloCarga = true; }
      render();
      const success = document.createElement('div'); success.className = `${card} border-brand-lettuce/30`; success.setAttribute('role', 'status');
      success.innerHTML = `<p class="font-black">${esc(response.local)} creado y verificado.</p><p class="mt-sm">Ya puedes programar turnos y descargar el registro de asistencia.</p>`;
      success.appendChild(createButton('Descargar registro', { className: 'mt-md', onClick: () => ocupada('Preparando archivo...', () => descargarRegistroLocal(response.local)) })); app.firstChild.insertBefore(success, app.firstChild.children[1]);
      if (falloCarga) aviso('El local se creó correctamente, pero no se pudo actualizar el catálogo. Pulsa Actualizar listado.');
      else if (response.aviso) aviso(response.aviso);
    }) }),
    createButton('Volver a editar', { variant: 'secondary', onClick: () => { state.vista = 'formulario'; render(); } }),
  );
}
async function bootstrap() {
  createPageSkeleton({ mountNode: app, variant: 'table' }); overlay.setLoading(true, 'Cargando locales...');
  try {
    state.session = await window.LVAuth.protectPage([window.LVAuth.roles.ADMINISTRADOR]); if (!state.session) return;
    await cargar(); render();
  } catch (error) {
    app.replaceChildren(); const alert = document.createElement('p'); alert.className = card; alert.setAttribute('role', 'alert'); alert.textContent = error.message || 'No se pudieron cargar los locales. Recarga para reintentar.'; app.appendChild(alert);
  } finally { overlay.setLoading(false); }
}
bootstrap();
