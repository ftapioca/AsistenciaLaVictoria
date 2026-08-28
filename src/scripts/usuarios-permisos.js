import '../styles/globals.css';
import '../../app-config.prod.js';
import '../../app-config.staging.js';
import '../../app-config.js';
import '../../env-badge.js';
import '../../auth.js';

import { createButton } from '../components/Button.js';
import { createCard } from '../components/Card.js';
import { createLoadingOverlay } from '../components/LoadingOverlay.js';
import { createPageHero } from '../components/PageHero.js';
import { createPageSkeleton } from '../components/PageSkeletons.js';
import { createStatGrid } from '../components/StatGrid.js';
import { createToast } from '../components/Toast.js';

const $ = (id) => document.getElementById(id);
const ROLE_ORDER = ['Administrador', 'Supervisor', 'Colaborador'];

const PERMISSION_DEFS = [
  { key: 'puede_ingresar_panel_admin', label: 'Panel administrativo' },
  { key: 'puede_ver_mis_turnos', label: 'Ver mis turnos' },
  { key: 'puede_programar_turnos', label: 'Programar turnos' },
  { key: 'puede_ver_turnos_abiertos', label: 'Ver turnos abiertos' },
  { key: 'puede_registrar_asistencia_admin', label: 'Registrar asistencia admin' },
  { key: 'puede_ver_colaboradores_local', label: 'Ver colaboradores por local' },
  { key: 'puede_importar_ventas', label: 'Importar ventas' },
  { key: 'puede_ver_pagos', label: 'Ver pagos' },
  { key: 'puede_gestionar_plantillas_turnos', label: 'Gestionar plantillas' },
  { key: 'puede_copiar_semanas', label: 'Copiar semanas' },
  { key: 'puede_eliminar_turnos', label: 'Eliminar turnos' },
];

const state = {
  session: null,
  users: [],
  roles: [],
  search: '',
  sortKey: 'rol',
  sortDirection: 'asc',
  editingPermissions: false,
  draftPermissions: null,
};

const overlay = createLoadingOverlay('Procesando...');
document.body.appendChild(overlay.element);
overlay.setLoading(true, 'Validando sesión...');

const toast = createToast();
document.body.appendChild(toast.element);

function withCurrentEnvironment(path) {
  const target = new URL(path, window.location.href);
  const env = window.APP_CONFIG && window.APP_CONFIG.ENVIRONMENT;
  if (env) target.searchParams.set('env', env);
  return target.toString();
}

function waitNextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function parseLocalList(localValue) {
  return String(localValue || '')
    .split(/[;,|/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildHighlights() {
  const activeUsers = state.users.filter((user) => user.activo).length;
  const localCount = [...new Set(state.users.flatMap((user) => parseLocalList(user.local)).filter(Boolean))].length;
  const grid = createStatGrid([
    {
      label: 'Usuarios',
      value: String(state.users.length),
      detail: `${activeUsers} activos en la hoja Usuarios.`,
    },
    {
      label: 'Locales',
      value: String(localCount || 2),
      detail: 'Usuarios ordenados por jerarquía y nombre.',
    },
    {
      label: 'Entorno',
      value: (window.APP_CONFIG && window.APP_CONFIG.ENVIRONMENT || 'prod').toUpperCase(),
      detail: 'Cada edición impacta el entorno activo.',
    },
  ], { tone: 'dark' });

  grid.id = 'summaryHighlights';
  return grid;
}

function updateHighlights() {
  const current = $('summaryHighlights');
  const next = buildHighlights();
  if (current && current.parentNode) {
    current.parentNode.replaceChild(next, current);
  }
}

function createAccordionSection({ id, title, subtitle, badgeText = '', open = false }) {
  const card = createCard({ className: 'overflow-hidden rounded-3xl p-0' });
  const wrapper = document.createElement('section');
  wrapper.dataset.accordionId = id;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'flex w-full items-center justify-between gap-lg px-xl py-xl text-left';
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  toggle.setAttribute('aria-controls', `${id}-panel`);

  const heading = document.createElement('div');
  heading.className = 'min-w-0';
  heading.innerHTML = `
    <h2 class="text-[26px] font-black leading-none tracking-[-0.04em] text-neutral-charcoal">${escapeHtml(title)}</h2>
    <p class="mt-sm text-sm font-bold text-neutral-muted">${escapeHtml(subtitle)}</p>
  `;

  const meta = document.createElement('div');
  meta.className = 'flex items-center gap-md';

  const badge = document.createElement('div');
  badge.id = `${id}-badge`;
  badge.className = 'grid min-h-[46px] min-w-[46px] place-items-center rounded-2xl bg-gradient-to-r from-brand-cheese to-brand-bun px-md text-xl font-black text-neutral-charcoal';
  badge.textContent = badgeText;

  const chevron = document.createElement('span');
  chevron.className = 'grid size-8 place-items-center rounded-full border border-neutral-charcoal/10 bg-white/70 text-sm text-neutral-charcoal transition-transform';
  chevron.textContent = '▾';

  meta.append(badge, chevron);
  toggle.append(heading, meta);

  const panel = document.createElement('div');
  panel.id = `${id}-panel`;
  panel.className = 'p-lg';

  wrapper.append(toggle, panel);
  card.appendChild(wrapper);

  function setOpen(nextOpen) {
    const active = Boolean(nextOpen);
    panel.hidden = !active;
    panel.classList.toggle('hidden', !active);
    chevron.style.transform = active ? 'rotate(180deg)' : 'rotate(0deg)';
    toggle.setAttribute('aria-expanded', active ? 'true' : 'false');
  }

  setOpen(open);

  return {
    element: card,
    panel,
    badge,
    setOpen,
    isOpen: () => toggle.getAttribute('aria-expanded') === 'true',
    bindToggle(handler) {
      toggle.addEventListener('click', handler);
    },
  };
}

function createEditModal() {
  const root = document.createElement('div');
  root.id = 'editUserModal';
  root.className = 'fixed inset-0 z-[140] hidden items-center justify-center bg-neutral-charcoal/68 px-lg py-lg backdrop-blur';
  root.innerHTML = `
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
          ${createInputGroup('idUsuario', 'ID usuario', true)}
          ${createInputGroup('nombreCompleto', 'Nombre completo')}
          ${createInputGroup('usuarioLogin', 'Usuario login')}
          ${createSelectGroup('rol', 'Rol', ROLE_ORDER)}
          ${createInputGroup('local', 'Local')}
          ${createInputGroup('cargo', 'Cargo')}
          ${createSelectGroup('activo', 'Activo', ['SI', 'No'])}
          ${createInputGroup('email', 'Email')}
          ${createInputGroup('telefono', 'Telefono')}
          ${createInputGroup('fechaCreacion', 'Fecha creacion')}
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
            ${createInputGroup('newPin', 'Nuevo PIN', false, 'password')}
            ${createInputGroup('confirmNewPin', 'Confirmar nuevo PIN', false, 'password')}
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
  `;

  document.body.appendChild(root);

  const form = root.querySelector('#editUserForm');
  const backdrop = root.querySelector('[data-modal-backdrop]');
  const title = root.querySelector('#editUserTitle');
  const subtitle = root.querySelector('#editUserSubtitle');
  const saveButton = root.querySelector('#btnSaveEditUser');
  const cancelButton = root.querySelector('#btnCancelEditUser');
  const closeButton = root.querySelector('#btnCloseEditUser');
  const togglePinButton = root.querySelector('#btnTogglePinChange');
  const pinChangePanel = root.querySelector('#pinChangePanel');
  const pinMatchStatus = root.querySelector('#pinMatchStatus');
  const feedback = root.querySelector('#editUserFeedback');
  const newPinField = root.querySelector('#fieldNewPin');
  const confirmPinField = root.querySelector('#fieldConfirmNewPin');
  let currentUserId = '';
  let changingPin = false;

  function close() {
    root.classList.add('hidden');
    root.classList.remove('grid');
    currentUserId = '';
    changingPin = false;
    pinChangePanel.classList.add('hidden');
    togglePinButton.textContent = 'Nuevo PIN';
    setFieldValue('fieldNewPin', '');
    setFieldValue('fieldConfirmNewPin', '');
    setPinValidationState();
    setFeedback('');
  }

  function setLoading(loading) {
    saveButton.disabled = loading;
    cancelButton.disabled = loading;
    closeButton.disabled = loading;
    togglePinButton.disabled = loading;
    saveButton.textContent = loading ? 'Guardando...' : 'Guardar cambios';
  }

  function setFieldValue(fieldId, value) {
    const field = root.querySelector(`#${fieldId}`);
    if (field) field.value = value || '';
  }

  function setFeedback(message) {
    if (!message) {
      feedback.textContent = '';
      feedback.classList.add('hidden');
      return;
    }
    feedback.textContent = message;
    feedback.classList.remove('hidden');
  }

  function setFieldTone(field, tone) {
    if (!field) return;
    const base = 'min-h-[52px] rounded-2xl bg-white/90 px-lg py-md text-base font-semibold placeholder:text-neutral-muted/70 focus:outline-none focus:ring-2';
    if (tone === 'error') {
      field.className = `${base} border border-brand-ketchup bg-brand-ketchup/10 text-neutral-charcoal focus:border-brand-ketchup focus:ring-brand-ketchup/30`;
      return;
    }
    if (tone === 'success') {
      field.className = `${base} border border-brand-lettuce bg-brand-lettuce/10 text-neutral-charcoal focus:border-brand-lettuce focus:ring-brand-lettuce/30`;
      return;
    }
    field.className = `${base} border border-neutral-charcoal/10 text-neutral-charcoal focus:border-brand-bun focus:ring-brand-bun/30`;
  }

  function setPinValidationState() {
    if (!changingPin) {
      pinMatchStatus.textContent = '';
      pinMatchStatus.className = 'mt-md hidden rounded-2xl border px-lg py-md text-sm font-bold';
      setFieldTone(newPinField);
      setFieldTone(confirmPinField);
      return true;
    }

    const newPin = newPinField.value.trim();
    const confirmPin = confirmPinField.value.trim();

    if (!confirmPin) {
      pinMatchStatus.textContent = '';
      pinMatchStatus.className = 'mt-md hidden rounded-2xl border px-lg py-md text-sm font-bold';
      setFieldTone(newPinField);
      setFieldTone(confirmPinField);
      return false;
    }

    const matches = newPin && newPin === confirmPin;
    pinMatchStatus.textContent = matches ? 'Los PIN coinciden.' : 'Los PIN no coinciden.';
    pinMatchStatus.className = `mt-md rounded-2xl border px-lg py-md text-sm font-bold ${
      matches
        ? 'border-brand-lettuce bg-brand-lettuce/10 text-brand-lettuce'
        : 'border-brand-ketchup bg-brand-ketchup/10 text-brand-ketchup'
    }`;
    setFieldTone(newPinField, matches ? 'success' : 'error');
    setFieldTone(confirmPinField, matches ? 'success' : 'error');
    return matches;
  }

  function open(user) {
    currentUserId = user.idUsuario;
    title.textContent = user.nombreCompleto || 'Usuario';
    subtitle.textContent = `${user.local || 'Sin local'} · ${user.rol || 'Sin rol'}`;
    setFieldValue('fieldIdUsuario', user.idUsuario);
    setFieldValue('fieldNombreCompleto', user.nombreCompleto);
    setFieldValue('fieldUsuarioLogin', user.usuarioLogin);
    setFieldValue('fieldRol', user.rol);
    setFieldValue('fieldLocal', user.local);
    setFieldValue('fieldCargo', user.cargo);
    setFieldValue('fieldActivo', user.activo ? 'SI' : 'No');
    setFieldValue('fieldEmail', user.email);
    setFieldValue('fieldTelefono', user.telefono);
    setFieldValue('fieldFechaCreacion', user.fechaCreacion);
    setFieldValue('fieldObservaciones', user.observaciones);
    setFieldValue('fieldNewPin', '');
    setFieldValue('fieldConfirmNewPin', '');
    setFeedback('');
    changingPin = false;
    pinChangePanel.classList.add('hidden');
    togglePinButton.textContent = 'Nuevo PIN';
    root.classList.remove('hidden');
    root.classList.add('grid');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const newPin = root.querySelector('#fieldNewPin').value.trim();
    const confirmNewPin = root.querySelector('#fieldConfirmNewPin').value.trim();

    if (changingPin) {
      if (!newPin) {
        toast.show('error', 'Debes ingresar el nuevo PIN.');
        return;
      }
      if (!setPinValidationState()) {
        toast.show('error', 'La confirmación del nuevo PIN no coincide.');
        return;
      }
    }

    setLoading(true);
    setFeedback('');
    overlay.setLoading(
      true,
      'Guardando cambios del usuario...',
      'Estamos actualizando sus datos de acceso, rol y asignaciones.'
    );
    await waitNextFrame();
    try {
      const response = await window.LVAuth.apiPost({
        accion: 'ActualizarUsuarioAdmin',
        idUsuario: currentUserId,
        nombreCompleto: root.querySelector('#fieldNombreCompleto').value.trim(),
        usuarioLogin: root.querySelector('#fieldUsuarioLogin').value.trim(),
        newPin: changingPin ? newPin : '',
        rol: root.querySelector('#fieldRol').value.trim(),
        local: root.querySelector('#fieldLocal').value.trim(),
        cargo: root.querySelector('#fieldCargo').value.trim(),
        activo: root.querySelector('#fieldActivo').value.trim(),
        email: root.querySelector('#fieldEmail').value.trim(),
        telefono: root.querySelector('#fieldTelefono').value.trim(),
        fechaCreacion: root.querySelector('#fieldFechaCreacion').value.trim(),
        observaciones: root.querySelector('#fieldObservaciones').value.trim(),
      });

      if (response.status !== 'SUCCESS') {
        throw new Error(response.mensaje || 'No se pudo actualizar el usuario.');
      }

      state.users = state.users.map((entry) => (
        entry.idUsuario === response.user.idUsuario ? response.user : entry
      ));
      updateHighlights();
      renderUsersTable();
      toast.show('success', `${response.user.nombreCompleto} actualizado correctamente.`);
      close();
    } catch (error) {
      setFeedback(error.message || 'No se pudo actualizar el usuario. Corrige los datos e inténtalo nuevamente.');
      toast.show('error', error.message || 'No se pudo actualizar el usuario.');
    } finally {
      overlay.setLoading(false);
      setLoading(false);
    }
  }

  form.addEventListener('submit', handleSubmit);
  togglePinButton.addEventListener('click', () => {
    changingPin = !changingPin;
    pinChangePanel.classList.toggle('hidden', !changingPin);
    togglePinButton.textContent = changingPin ? 'Cancelar cambio de PIN' : 'Nuevo PIN';
    if (!changingPin) {
      setFieldValue('fieldNewPin', '');
      setFieldValue('fieldConfirmNewPin', '');
    }
    setPinValidationState();
  });
  newPinField.addEventListener('input', setPinValidationState);
  confirmPinField.addEventListener('input', setPinValidationState);
  root.querySelector('#btnCloseEditUser').addEventListener('click', close);
  root.querySelector('#btnCancelEditUser').addEventListener('click', close);
  backdrop.addEventListener('click', close);

  return { open, close };
}

function createInputGroup(id, label, disabled = false, type = 'text') {
  return `
    <label class="grid gap-sm">
      <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">${label}</span>
      <input type="${type}" id="field${id.charAt(0).toUpperCase()}${id.slice(1)}" ${disabled ? 'disabled' : ''} class="min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md text-base font-semibold text-neutral-charcoal placeholder:text-neutral-muted/70 focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30 ${disabled ? 'opacity-60' : ''}">
    </label>
  `;
}

function createNewUserModal() {
  const root = document.createElement('div');
  root.className = 'fixed inset-0 z-[140] hidden items-center justify-center bg-neutral-charcoal/68 px-lg py-lg backdrop-blur';
  root.innerHTML = `
    <div class="absolute inset-0" data-backdrop></div>
    <div class="relative z-[1] max-h-[92vh] w-full max-w-[900px] overflow-auto rounded-[32px] border border-neutral-charcoal/12 bg-[#fff8ee] p-xl shadow-brand md:p-2xl">
      <div class="flex items-start justify-between gap-lg"><div><p class="text-xs font-black uppercase tracking-[0.18em] text-neutral-muted">Nuevo usuario</p><h2 class="mt-sm text-[clamp(30px,4vw,46px)] font-black tracking-[-0.05em]">Crear acceso</h2><p id="newUserRequirements" class="mt-sm text-sm font-bold text-neutral-muted">Nombre y PIN son obligatorios para usuarios activos.</p></div><button type="button" data-close class="grid size-11 place-items-center rounded-2xl border border-neutral-charcoal/10 bg-white text-xl font-black">×</button></div>
      <form class="mt-xl grid gap-lg"><div class="grid gap-lg md:grid-cols-2">
        ${createInputGroup('newNombreCompleto', 'Nombre completo')}${createInputGroup('newUsuarioLogin', 'Usuario login')}${createSelectGroup('newRol', 'Rol', ROLE_ORDER)}${createInputGroup('newLocal', 'Local')}${createInputGroup('newCargo', 'Cargo')}${createSelectGroup('newActivo', 'Activo', ['SI', 'No'])}${createInputGroup('createPin', 'PIN', false, 'password')}${createInputGroup('createConfirmPin', 'Confirmar PIN', false, 'password')}${createInputGroup('newEmail', 'Email')}${createInputGroup('newTelefono', 'Telefono')}
      </div><label class="grid gap-sm"><span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Observaciones</span><textarea id="fieldNewObservaciones" rows="4" class="rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md text-base font-semibold"></textarea></label><div data-feedback class="hidden rounded-2xl border border-brand-ketchup/25 bg-brand-ketchup/10 px-lg py-md text-sm font-bold text-brand-ketchup"></div><div class="flex justify-end gap-sm"><button type="button" data-close class="min-h-[52px] rounded-2xl border border-neutral-charcoal/12 bg-white px-xl py-md font-black">Cancelar</button><button type="submit" class="min-h-[52px] rounded-2xl bg-brand-bun px-xl py-md font-black">Crear usuario</button></div></form>
    </div>`;
  document.body.appendChild(root);
  const form = root.querySelector('form'); const feedback = root.querySelector('[data-feedback]'); const submit = root.querySelector('[type="submit"]');
  const close = () => { root.classList.add('hidden'); root.classList.remove('grid'); feedback.classList.add('hidden'); form.reset(); root.querySelector('#fieldNewActivo').value = 'SI'; };
  const updateRequirements = () => { const role = root.querySelector('#fieldNewRol').value; root.querySelector('#newUserRequirements').textContent = role === 'Administrador' ? 'Nombre y PIN son obligatorios para administradores activos.' : `Nombre, PIN y al menos un local son obligatorios para ${role.toLowerCase()} activo.${role === 'Supervisor' ? ' Usuario login también es obligatorio.' : ''}`; };
  root.querySelectorAll('[data-close], [data-backdrop]').forEach((node) => node.addEventListener('click', close));
  root.querySelector('#fieldNewRol').addEventListener('change', updateRequirements); updateRequirements();
  form.addEventListener('submit', async (event) => { event.preventDefault(); const pin = root.querySelector('#fieldCreatePin').value.trim(); if (pin !== root.querySelector('#fieldCreateConfirmPin').value.trim()) { feedback.textContent = 'Los PIN no coinciden.'; feedback.classList.remove('hidden'); return; }
    submit.disabled = true; overlay.setLoading(true, 'Creando usuario...', 'Estamos creando el acceso y sus asignaciones.'); await waitNextFrame();
    try { const response = await window.LVAuth.apiPost({ accion: 'CrearUsuarioAdmin', nombreCompleto: root.querySelector('#fieldNewNombreCompleto').value.trim(), usuarioLogin: root.querySelector('#fieldNewUsuarioLogin').value.trim(), rol: root.querySelector('#fieldNewRol').value, local: root.querySelector('#fieldNewLocal').value.trim(), cargo: root.querySelector('#fieldNewCargo').value.trim(), activo: root.querySelector('#fieldNewActivo').value, pin, email: root.querySelector('#fieldNewEmail').value.trim(), telefono: root.querySelector('#fieldNewTelefono').value.trim(), observaciones: root.querySelector('#fieldNewObservaciones').value.trim() }); if (response.status !== 'SUCCESS') throw new Error(response.mensaje || 'No se pudo crear el usuario.'); await loadData(); updateHighlights(); renderUsersTable(); toast.show('success', `${response.user.nombreCompleto} creado correctamente.`); close(); } catch (error) { feedback.textContent = error.message || 'No se pudo crear el usuario.'; feedback.classList.remove('hidden'); } finally { overlay.setLoading(false); submit.disabled = false; }
  });
  return { open: () => { root.classList.remove('hidden'); root.classList.add('grid'); } };
}

function createSelectGroup(id, label, options) {
  return `
    <label class="grid gap-sm">
      <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">${label}</span>
      <select id="field${id.charAt(0).toUpperCase()}${id.slice(1)}" class="min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md text-base font-semibold text-neutral-charcoal focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30">
        ${options.map((option) => `<option value="${option}">${option}</option>`).join('')}
      </select>
    </label>
  `;
}

function buildShell() {
  const app = $('app');
  const shell = document.createElement('div');
  shell.className = 'mx-auto flex min-h-screen w-full max-w-[1380px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl';

  const sessionStatus = document.createElement('div');
  sessionStatus.id = 'sessionStatus';
  sessionStatus.className = 'rounded-2xl border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-lg text-sm font-black leading-relaxed text-neutral-cream';
  sessionStatus.textContent = 'Validando sesión...';

  const sideActions = document.createElement('div');
  sideActions.className = 'grid gap-md';
  sideActions.append(
    createButton('Volver al panel', {
      variant: 'secondary',
      className: 'bg-white/88 text-neutral-charcoal hover:bg-white',
      onClick: () => { window.location.href = withCurrentEnvironment('administracion.html'); },
    }),
    createButton('Cerrar sesión', {
      onClick: async () => {
        overlay.setLoading(true, 'Cerrando sesión...');
        await waitNextFrame();
        await window.LVAuth.logout();
        window.LVAuth.redirectToIndex();
      },
    }),
  );

  const hero = createPageHero({
    badge: 'La Victoria · Seguridad',
    title: 'Usuarios y permisos',
    lead: 'Gestiona usuarios desde una lista única ordenada por jerarquía y local. La matriz inferior resume permisos por rol en formato comparativo.',
    highlights: buildHighlights(),
    sideTitle: 'Sesión y control',
    sideStatus: sessionStatus,
    sideCopy: 'Los supervisores se asignan por fila y por local. Eso permite que una misma persona tenga alcance distinto según el local donde opere.',
    sideActions,
    titleClassName: 'max-w-[12ch] text-[clamp(40px,5vw,68px)]',
    leadClassName: 'max-w-[68ch]',
    sideClassName: 'lg:w-[340px]',
  });

  const usersCard = createCard({
    eyebrow: 'Usuarios',
    title: 'Lista de usuarios',
    body: 'Administradores, supervisores y colaboradores se muestran en una sola tabla, ordenados por jerarquía y local asignado.',
    className: 'rounded-3xl md:p-2xl',
  });

  const usersMeta = document.createElement('div');
  usersMeta.id = 'usersMeta';
  usersMeta.className = 'text-sm font-bold text-neutral-muted';

  const usersToolbar = document.createElement('div');
  usersToolbar.className = 'mt-xl flex flex-col gap-md lg:flex-row lg:items-end lg:justify-between';
  const searchLabel = document.createElement('label');
  searchLabel.className = 'grid w-full gap-sm lg:max-w-[420px]';
  searchLabel.innerHTML = `
    <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Buscar en usuarios</span>
    <input id="userSearchInput" type="search" placeholder="Ej: Ana, supervisor, Paseo del Lago" class="min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md text-base font-semibold text-neutral-charcoal placeholder:text-neutral-muted/80 focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30">
  `;
  usersToolbar.append(usersMeta, searchLabel);

  const createUserButton = createButton('Agregar nuevo usuario', { className: 'lg:order-3' });
  createUserButton.id = 'btnCreateUser';
  usersToolbar.append(createUserButton);

  const activeUsersTable = document.createElement('div');
  activeUsersTable.id = 'activeUsersTable';
  activeUsersTable.className = 'mt-xl overflow-hidden rounded-2xl border border-neutral-charcoal/10 bg-white/84';
  const inactiveUsersDetails = document.createElement('details');
  inactiveUsersDetails.className = 'mt-lg rounded-2xl border border-neutral-charcoal/10 bg-white/72';
  inactiveUsersDetails.innerHTML = '<summary id="inactiveUsersSummary" class="cursor-pointer px-lg py-lg text-sm font-black text-neutral-charcoal">Usuarios inactivos</summary><div id="inactiveUsersTable" class="overflow-hidden border-t border-neutral-charcoal/10"></div>';
  usersCard.append(usersToolbar, activeUsersTable, inactiveUsersDetails);

  const rolesCard = createCard({
    eyebrow: 'Permisos',
    title: 'Matriz por tipo de usuario',
    body: 'Comparación compacta por permiso y por rol. El orden fijo es Administrador, Supervisor, Colaborador.',
    className: 'rounded-3xl md:p-2xl',
  });

  const matrix = document.createElement('div');
  matrix.id = 'permissionsMatrix';
  matrix.className = 'mt-xl overflow-hidden rounded-3xl border border-neutral-charcoal/10 bg-white/88 shadow-brand-sm';
  rolesCard.appendChild(matrix);

  shell.append(hero, usersCard, rolesCard);
  app.replaceChildren(shell);
}

function getRoleMap() {
  const map = {};
  state.roles.forEach((role) => {
    map[role.role] = role.permissions || {};
  });
  return map;
}

function getVisibleUsers() {
  const search = normalizeText(state.search);
  const roleRank = new Map(ROLE_ORDER.map((role, index) => [role, index]));
  return state.users.filter((user) => {
    if (!search) return true;
    const haystack = normalizeText([
      user.nombreCompleto,
      user.usuarioLogin,
      user.local,
      user.cargo,
      user.rol,
      user.email,
      user.telefono,
    ].join(' '));
    return haystack.includes(search);
  }).sort((left, right) => {
    const compareText = (first, second) => String(first || '').localeCompare(String(second || ''), 'es');
    const compareRole = () => (roleRank.get(left.rol) ?? ROLE_ORDER.length) - (roleRank.get(right.rol) ?? ROLE_ORDER.length);
    const comparisonByKey = {
      nombreCompleto: compareText(left.nombreCompleto, right.nombreCompleto),
      usuarioLogin: compareText(left.usuarioLogin, right.usuarioLogin),
      rol: compareRole(),
      local: compareText(left.local, right.local),
      cargo: compareText(left.cargo, right.cargo),
      activo: Number(Boolean(left.activo)) - Number(Boolean(right.activo)),
    };
    const primaryComparison = comparisonByKey[state.sortKey] ?? 0;
    if (primaryComparison) return primaryComparison * (state.sortDirection === 'asc' ? 1 : -1);

    if (state.sortKey !== 'rol') {
      const roleDifference = compareRole();
      if (roleDifference) return roleDifference;
    }

    return compareText(left.nombreCompleto, right.nombreCompleto);
  });
}

function createUserTable(users, openEditModal) {
  const columns = [
    { key: 'nombreCompleto', label: 'Nombre' },
    { key: 'usuarioLogin', label: 'Usuario' },
    { key: 'rol', label: 'Rol' },
    { key: 'local', label: 'Local' },
    { key: 'cargo', label: 'Cargo' },
    { key: 'activo', label: 'Estado' },
  ];
  const wrapper = document.createElement('div');
  wrapper.className = 'overflow-x-auto';
  wrapper.innerHTML = `
    <table class="min-w-[1080px] w-full border-collapse">
      <thead class="bg-[#fff5e8]">
        <tr>
          ${columns.map(({ key, label }) => {
            const isActiveSort = state.sortKey === key;
            const indicator = isActiveSort ? (state.sortDirection === 'asc' ? '↑' : '↓') : '↕';
            return `
              <th class="px-lg py-md text-left">
                <button type="button" data-sort-key="${key}" aria-sort="${isActiveSort ? (state.sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}" class="inline-flex items-center gap-xs text-xs font-black uppercase tracking-[0.16em] text-neutral-muted transition-fast hover:text-neutral-charcoal">
                  ${label}<span aria-hidden="true">${indicator}</span>
                </button>
              </th>
            `;
          }).join('')}
          <th class="px-lg py-md text-left text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Acción</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  wrapper.querySelectorAll('[data-sort-key]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.sortKey;
      if (state.sortKey === key) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = key;
        state.sortDirection = 'asc';
      }
      renderUsersTable();
    });
  });

  const tbody = wrapper.querySelector('tbody');

  users.forEach((user) => {
    const row = document.createElement('tr');
    row.className = 'border-t border-neutral-charcoal/8 align-top';
    row.innerHTML = `
      <td class="px-lg py-lg">
        <div class="text-base font-black text-neutral-charcoal">${escapeHtml(user.nombreCompleto)}</div>
        <div class="mt-xs text-xs font-bold uppercase tracking-[0.14em] text-neutral-muted">${escapeHtml(user.idUsuario || 'Sin ID')}</div>
      </td>
      <td class="px-lg py-lg text-sm font-bold text-neutral-charcoal">${escapeHtml(user.usuarioLogin || 'Sin usuario')}</td>
      <td class="px-lg py-lg">
        <span class="rounded-full border border-brand-bun/14 bg-brand-cheese/16 px-sm py-xs text-xs font-black text-brand-bun-dark">${escapeHtml(user.rol)}</span>
      </td>
      <td class="px-lg py-lg text-sm font-bold text-neutral-charcoal">${escapeHtml(user.local || 'Sin local')}</td>
      <td class="px-lg py-lg text-sm font-bold text-neutral-charcoal">${escapeHtml(user.cargo || 'Sin cargo')}</td>
      <td class="px-lg py-lg">
        <span class="rounded-full border px-md py-sm text-xs font-black uppercase tracking-[0.16em] ${user.activo ? 'border-brand-lettuce/18 bg-brand-lettuce/10 text-brand-lettuce' : 'border-brand-ketchup/18 bg-brand-ketchup/10 text-brand-ketchup'}">
          ${user.activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td class="px-lg py-lg">
        <button type="button" class="edit-user inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-brand-bun px-lg py-sm text-sm font-black text-neutral-charcoal transition-fast hover:bg-brand-bun-dark hover:text-neutral-cream">Editar</button>
      </td>
    `;

    row.querySelector('.edit-user').addEventListener('click', () => openEditModal(user));
    tbody.appendChild(row);
  });

  return wrapper;
}

function renderUsersTable() {
  const modal = window.__lvEditUserModal;
  const users = getVisibleUsers();
  const activeUsers = users.filter((user) => user.activo);
  const inactiveUsers = users.filter((user) => !user.activo);
  const activeRoot = $('activeUsersTable');
  const inactiveRoot = $('inactiveUsersTable');
  $('usersMeta').textContent = `${activeUsers.length} activo(s) y ${inactiveUsers.length} inactivo(s). Orden: rol y nombre.`;
  $('inactiveUsersSummary').textContent = `Usuarios inactivos (${inactiveUsers.length})`;
  activeRoot.innerHTML = '';
  inactiveRoot.innerHTML = '';
  activeRoot.appendChild(activeUsers.length
    ? createUserTable(activeUsers, modal.open)
    : Object.assign(document.createElement('div'), { className: 'px-lg py-xl text-sm font-bold text-neutral-muted', textContent: 'No hay usuarios activos que coincidan con la búsqueda.' }));
  inactiveRoot.appendChild(inactiveUsers.length
    ? createUserTable(inactiveUsers, modal.open)
    : Object.assign(document.createElement('div'), { className: 'px-lg py-xl text-sm font-bold text-neutral-muted', textContent: 'No hay usuarios inactivos que coincidan con la búsqueda.' }));
}

async function fetchDuplicateGroups() {
  const response = await window.LVAuth.apiGet({ accion: 'AuditarDuplicadosUsuariosAdmin' });
  if (response.status !== 'SUCCESS') throw new Error(response.mensaje || 'No se pudieron revisar los duplicados.');
  return Array.isArray(response.groups) ? response.groups : [];
}

function renderDuplicateAudit() {
  const root = $('duplicatesRoot');
  root.innerHTML = '';
  if (!state.duplicateGroups.length) {
    root.innerHTML = '<div class="rounded-2xl border border-brand-lettuce/20 bg-brand-lettuce/10 px-lg py-lg text-sm font-bold text-brand-lettuce">No se detectaron grupos duplicados.</div>';
    return;
  }

  state.duplicateGroups.forEach((group) => {
    const card = document.createElement('section');
    card.className = 'rounded-3xl border border-brand-cheese/30 bg-brand-cheese/10 p-lg';
    card.innerHTML = `
      <div class="flex flex-col gap-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p class="text-sm font-black text-neutral-charcoal">${group.candidates.length} registros · ${escapeHtml(group.role)}</p>
          <p class="mt-xs text-sm font-bold text-neutral-muted">${group.matchType === 'usuario_login' ? 'Coincidencia por usuario login.' : 'Coincidencia por nombre y rol sin usuario login. Revísala antes de consolidar.'}</p>
        </div>
      </div>
      <label class="mt-lg grid gap-sm text-sm font-black text-neutral-charcoal">
        Registro canónico
        <select class="duplicate-canonical min-h-[50px] rounded-2xl border border-neutral-charcoal/10 bg-white px-lg py-md font-bold">
          ${group.candidates.map((candidate) => `<option value="${escapeHtml(candidate.idUsuario)}" ${candidate.recommended ? 'selected' : ''}>${escapeHtml(candidate.nombreCompleto)} · ${escapeHtml(candidate.idUsuario)} · ${candidate.activo ? 'Activo' : 'Inactivo'} · ${escapeHtml(candidate.local || 'Sin local')}</option>`).join('')}
        </select>
      </label>
      <label class="mt-md flex items-start gap-sm text-sm font-bold text-neutral-charcoal">
        <input type="checkbox" class="duplicate-confirm mt-1 size-4 accent-brand-bun">
        Confirmo que el registro seleccionado conservará sus datos y los demás quedarán inactivos con trazabilidad.
      </label>
      <button type="button" class="consolidate-duplicate mt-lg inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-brand-bun px-xl py-md text-sm font-black text-neutral-charcoal disabled:cursor-not-allowed disabled:opacity-45" disabled>Consolidar este grupo</button>
    `;
    const confirm = card.querySelector('.duplicate-confirm');
    const button = card.querySelector('.consolidate-duplicate');
    confirm.addEventListener('change', () => { button.disabled = !confirm.checked; });
    button.addEventListener('click', async () => {
      overlay.setLoading(true, 'Consolidando usuarios...', 'Estamos preservando el registro elegido y dejando trazabilidad en los duplicados.');
      await waitNextFrame();
      try {
        const response = await window.LVAuth.apiPost({ accion: 'ConsolidarDuplicadosUsuariosAdmin', groupKey: group.groupKey, canonicalId: card.querySelector('.duplicate-canonical').value, confirmar: 'SI' });
        if (response.status !== 'SUCCESS') throw new Error(response.mensaje || 'No se pudo consolidar el grupo.');
        await loadData();
        updateHighlights();
        renderUsersTable();
        state.duplicateGroups = await fetchDuplicateGroups();
        renderDuplicateAudit();
        toast.show('success', `Grupo consolidado en ${response.canonicalId}.`);
      } catch (error) {
        toast.show('error', error.message || 'No se pudo consolidar el grupo.');
      } finally {
        overlay.setLoading(false);
      }
    });
    root.appendChild(card);
  });
}

function renderPermissionsMatrix() {
  const matrix = $('permissionsMatrix');
  const roleMap = state.editingPermissions && state.draftPermissions
    ? state.draftPermissions
    : getRoleMap();

  matrix.innerHTML = `
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
        ${PERMISSION_DEFS.map((permission) => `
          <tr class="border-t border-neutral-charcoal/8">
            <td class="px-lg py-lg text-sm font-bold text-neutral-charcoal">${permission.label}</td>
            ${ROLE_ORDER.map((role) => {
              const active = Boolean(roleMap[role] && roleMap[role][permission.key]);
              if (state.editingPermissions) {
                const changed = Boolean(
                  state.draftPermissions
                  && getRoleMap()[role]
                  && state.draftPermissions[role][permission.key] !== getRoleMap()[role][permission.key]
                );
                return `
                  <td class="px-lg py-lg text-center">
                    <label class="mx-auto inline-flex min-h-[48px] min-w-[48px] cursor-pointer items-center justify-center rounded-2xl border ${
                      changed ? 'border-sky-500 bg-sky-500/14 text-sky-700' : 'border-neutral-charcoal/12 bg-white text-neutral-charcoal'
                    }">
                      <input
                        type="checkbox"
                        data-role="${role}"
                        data-permission="${permission.key}"
                        ${active ? 'checked' : ''}
                        class="permission-checkbox size-5 accent-sky-600"
                      >
                    </label>
                  </td>
                `;
              }
              return `
                <td class="px-lg py-lg text-center">
                  <span class="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-2xl border text-2xl font-black ${active ? 'border-brand-lettuce/18 bg-brand-lettuce/12 text-brand-lettuce' : 'border-brand-ketchup/18 bg-brand-ketchup/10 text-brand-ketchup'}">
                    ${active ? '✓' : '×'}
                  </span>
                </td>
              `;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
    </div>
    <div class="flex flex-wrap items-center justify-end gap-sm border-t border-neutral-charcoal/8 bg-[#fffaf1] px-lg py-lg">
      <div id="permissionsSaveFeedback" class="mr-auto hidden rounded-2xl border border-brand-cheese/28 bg-brand-cheese/18 px-lg py-md text-sm font-bold text-brand-bun-dark"></div>
      ${state.editingPermissions
        ? `
          <button type="button" id="btnCancelPermissionsEdit" class="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-neutral-charcoal/12 bg-white/92 px-xl py-md text-sm font-black text-neutral-charcoal">Cancelar</button>
          <button type="button" id="btnSavePermissionsMatrix" class="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-brand-bun px-xl py-md text-sm font-black text-neutral-charcoal transition-fast hover:bg-brand-bun-dark hover:text-neutral-cream">Guardar</button>
        `
        : '<button type="button" id="btnEditPermissionsMatrix" class="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-brand-bun px-xl py-md text-sm font-black text-neutral-charcoal transition-fast hover:bg-brand-bun-dark hover:text-neutral-cream">Editar permisos</button>'
      }
    </div>
  `;

  if (!state.editingPermissions) {
    matrix.querySelector('#btnEditPermissionsMatrix').addEventListener('click', () => {
      state.editingPermissions = true;
      state.draftPermissions = JSON.parse(JSON.stringify(getRoleMap()));
      renderPermissionsMatrix();
    });
    return;
  }

  matrix.querySelectorAll('.permission-checkbox').forEach((input) => {
    input.addEventListener('change', () => {
      const role = input.dataset.role;
      const permission = input.dataset.permission;
      if (!state.draftPermissions[role]) state.draftPermissions[role] = {};
      state.draftPermissions[role][permission] = input.checked;
      renderPermissionsMatrix();
    });
  });

  matrix.querySelector('#btnCancelPermissionsEdit').addEventListener('click', () => {
    state.editingPermissions = false;
    state.draftPermissions = null;
    renderPermissionsMatrix();
  });

  matrix.querySelector('#btnSavePermissionsMatrix').addEventListener('click', async () => {
    const saveButton = matrix.querySelector('#btnSavePermissionsMatrix');
    const cancelButton = matrix.querySelector('#btnCancelPermissionsEdit');
    const feedback = matrix.querySelector('#permissionsSaveFeedback');
    saveButton.disabled = true;
    if (cancelButton) cancelButton.disabled = true;
    saveButton.textContent = 'Guardando...';
    feedback.classList.add('hidden');
    overlay.setLoading(
      true,
      'Guardando matriz de permisos...',
      'Estamos aplicando los permisos definidos para cada rol.'
    );
    await waitNextFrame();
    try {
      for (const role of ROLE_ORDER) {
        const payload = { accion: 'ActualizarPermisosRolAdmin', role };
        PERMISSION_DEFS.forEach((permission) => {
          payload[permission.key] = state.draftPermissions[role] && state.draftPermissions[role][permission.key] ? 'SI' : 'NO';
        });

        const response = await window.LVAuth.apiPost(payload);
        if (response.status !== 'SUCCESS') {
          throw new Error(response.mensaje || `No se pudieron guardar los permisos de ${role}.`);
        }

        state.roles = state.roles.map((entry) => (
          entry.role === role ? response.role : entry
        ));
      }

      state.editingPermissions = false;
      state.draftPermissions = null;
      toast.show('success', 'Matriz de permisos actualizada.');
      renderPermissionsMatrix();
    } catch (error) {
      feedback.textContent = error.message || 'No se pudieron guardar los permisos.';
      feedback.classList.remove('hidden');
      toast.show('error', error.message || 'No se pudieron guardar los permisos.');
    } finally {
      overlay.setLoading(false);
      saveButton.disabled = false;
      if (cancelButton) cancelButton.disabled = false;
      saveButton.textContent = 'Guardar permisos';
    }
  });
}

async function loadData() {
  overlay.setLoading(true, 'Cargando usuarios y permisos...');
  await waitNextFrame();
  const response = await window.LVAuth.apiGet({ accion: 'BootstrapGestionUsuarios' });
  if (response.status !== 'SUCCESS') {
    throw new Error(response.mensaje || 'No se pudieron cargar los usuarios.');
  }
  state.users = Array.isArray(response.users) ? response.users : [];
  state.roles = Array.isArray(response.roles) ? response.roles : [];
}

function bindFilters() {
  $('userSearchInput').addEventListener('input', (event) => {
    state.search = event.target.value || '';
    renderUsersTable();
  });

  $('btnCreateUser').addEventListener('click', () => window.__lvCreateUserModal.open());
}

async function bootstrap() {
  $('app').innerHTML = '';
  createPageSkeleton({ mountNode: $('app'), variant: 'table' });
  overlay.setLoading(
    true,
    'Validando sesión...',
    'Estamos comprobando el acceso administrativo y preparando la carga de usuarios y permisos.'
  );

  state.session = await window.LVAuth.protectPage([window.LVAuth.roles.ADMINISTRADOR]);
  if (!state.session) return;

  buildShell();
  window.__lvEditUserModal = createEditModal();
  window.__lvCreateUserModal = createNewUserModal();
  bindFilters();
  $('sessionStatus').textContent = `${state.session.displayName || 'Administrador'} · ${state.session.role}`;

  try {
    await loadData();
    updateHighlights();
    renderUsersTable();
    renderPermissionsMatrix();
  } finally {
    overlay.setLoading(false);
  }
}

bootstrap().catch((error) => {
  overlay.setLoading(false);
  toast.show('error', error.message || 'No se pudo cargar la gestión de usuarios.');
});
