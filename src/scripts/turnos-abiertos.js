import '../styles/globals.css';
import '../../app-config.prod.js';
import '../../app-config.staging.js';
import '../../app-config.js';
import '../../env-badge.js';
import '../../auth.js';

import { createButton } from '../components/Button.js';
import { createCard } from '../components/Card.js';
import { createSelectField } from '../components/Input.js';
import { createLoadingOverlay } from '../components/LoadingOverlay.js';
import { createPageHero } from '../components/PageHero.js';
import { createToast } from '../components/Toast.js';

const $ = (id) => document.getElementById(id);

const LOCALES = [
  { nombre: 'Paseo del Lago', id: 'PaseoDelLago' },
  { nombre: 'Segunda Faja', id: 'SegundaFaja' },
];

const REFRESCO_AUTOMATICO_MS = 30 * 60 * 1000;
const MOBILE_BREAKPOINT = 980;

const overlay = createLoadingOverlay('Procesando...');
document.body.appendChild(overlay.element);
overlay.setLoading(true, 'Validando sesión...');

const toast = createToast();
document.body.appendChild(toast.element);
const colaboradoresPorLocalCache = new Map();

function withCurrentEnvironment(path) {
  const target = new URL(path, window.location.href);
  const env = window.APP_CONFIG && window.APP_CONFIG.ENVIRONMENT;
  if (env) {
    target.searchParams.set('env', env);
  }
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

function isMobileView() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

function createStateMessage(kind, message) {
  const toneClasses = {
    empty: 'border-brand-lettuce/24 bg-brand-lettuce/12 text-brand-lettuce',
    loading: 'border-brand-cheese/28 bg-brand-cheese/18 text-brand-bun-dark',
    error: 'border-brand-ketchup/24 bg-brand-ketchup/12 text-brand-ketchup',
  };

  const block = document.createElement('div');
  block.className = `rounded-2xl border px-lg py-lg text-sm font-bold leading-relaxed ${toneClasses[kind] || toneClasses.loading}`;
  block.textContent = message;
  return block;
}

function createAccordionSection({ id, title, subtitle, badgeText = '', open = false }) {
  const card = createCard({
    className: 'overflow-hidden rounded-3xl p-0',
  });

  const wrapper = document.createElement('section');
  wrapper.dataset.accordionId = id;
  wrapper.dataset.open = open ? 'true' : 'false';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'flex w-full items-center justify-between gap-lg bg-gradient-to-b from-[#fffaf1] to-neutral-cream px-xl py-xl text-left';
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  toggle.setAttribute('aria-controls', `${id}-panel`);

  const heading = document.createElement('div');
  heading.className = 'min-w-0';
  heading.innerHTML = `
    <h2 class="text-[28px] font-black leading-none tracking-[-0.04em] text-neutral-charcoal">${escapeHtml(title)}</h2>
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

  let touchStartY = 0;
  let touchStartX = 0;
  let touchMoved = false;
  let ignoreNextClick = false;

  toggle.addEventListener('touchstart', (event) => {
    touchStartY = event.touches[0] ? event.touches[0].clientY : 0;
    touchStartX = event.touches[0] ? event.touches[0].clientX : 0;
    touchMoved = false;
  }, { passive: true });

  toggle.addEventListener('touchmove', (event) => {
    const currentY = event.touches[0] ? event.touches[0].clientY : touchStartY;
    const currentX = event.touches[0] ? event.touches[0].clientX : touchStartX;
    if (Math.abs(currentY - touchStartY) > 8 || Math.abs(currentX - touchStartX) > 8) {
      touchMoved = true;
    }
  }, { passive: true });

  toggle.addEventListener('touchend', (event) => {
    ignoreNextClick = true;
    window.setTimeout(() => {
      ignoreNextClick = false;
    }, 350);

    if (touchMoved) {
      return;
    }

    event.preventDefault();
    if (typeof toggle.__lvOnTap === 'function') {
      toggle.__lvOnTap();
    }
  }, { passive: false });

  function setOpen(nextOpen) {
    const active = Boolean(nextOpen);
    wrapper.dataset.open = active ? 'true' : 'false';
    toggle.setAttribute('aria-expanded', active ? 'true' : 'false');
    panel.hidden = !active;
    chevron.style.transform = active ? 'rotate(180deg)' : 'rotate(0deg)';
  }

  setOpen(open);

  return {
    element: card,
    panel,
    badge,
    toggle,
    setOpen,
    bindToggle(handler) {
      toggle.__lvOnTap = handler;
      toggle.addEventListener('click', (event) => {
        if (ignoreNextClick) {
          event.preventDefault();
          return;
        }
        handler();
      });
    },
    isOpen() {
      return wrapper.dataset.open === 'true';
    },
  };
}

function createTurnosTable(local, turnos, onQuickAction) {
  const wrapper = document.createElement('div');
  wrapper.className = 'overflow-x-auto';

  const rows = turnos.map((turno) => `
    <tr class="border-b border-neutral-charcoal/8 last:border-b-0">
      <td class="px-md py-md align-middle">
        <div class="flex items-center gap-md">
          <div class="grid size-10 place-items-center rounded-2xl bg-gradient-to-r from-brand-cheese to-brand-bun text-sm font-black text-neutral-charcoal">
            ${escapeHtml(turno.iniciales || '--')}
          </div>
          <div class="min-w-0 text-sm font-bold text-neutral-charcoal">${escapeHtml(turno.nombre)}</div>
        </div>
      </td>
      <td class="px-md py-md align-middle text-sm font-bold text-neutral-charcoal">${escapeHtml(turno.hora || turno.fechaHora || 'Sin hora')}</td>
      <td class="px-md py-md align-middle">
        <span class="inline-flex items-center gap-sm rounded-full border border-brand-ketchup/20 bg-brand-ketchup/10 px-md py-sm text-xs font-black text-brand-ketchup">
          <span aria-hidden="true">●</span>
          Pendiente de salida
        </span>
      </td>
      <td class="px-md py-md align-middle">
        <button
          type="button"
          class="inline-flex min-h-[42px] items-center justify-center rounded-xl bg-brand-bun px-md py-sm text-sm font-black text-neutral-charcoal transition hover:bg-brand-bun-dark hover:text-neutral-cream"
          data-quick-action="salida"
          data-local="${escapeHtml(local.nombre)}"
          data-nombre="${escapeHtml(turno.nombre)}">
          Marcar salida
        </button>
      </td>
    </tr>
  `).join('');

  const mobileCards = turnos.map((turno) => `
    <article class="rounded-2xl border border-neutral-charcoal/10 bg-white/76 p-lg md:hidden">
      <div class="flex items-start justify-between gap-md">
        <div class="flex min-w-0 items-center gap-md">
          <div class="grid size-11 place-items-center rounded-2xl bg-gradient-to-r from-brand-cheese to-brand-bun text-sm font-black text-neutral-charcoal">
            ${escapeHtml(turno.iniciales || '--')}
          </div>
          <div class="min-w-0">
            <div class="text-base font-black text-neutral-charcoal">${escapeHtml(turno.nombre)}</div>
            <div class="mt-xs text-sm font-bold text-neutral-muted">Ingreso: ${escapeHtml(turno.hora || turno.fechaHora || 'Sin hora')}</div>
          </div>
        </div>
        <span class="inline-flex shrink-0 items-center gap-xs rounded-full border border-brand-ketchup/20 bg-brand-ketchup/10 px-md py-sm text-[11px] font-black text-brand-ketchup">
          ● Pendiente
        </span>
      </div>
      <button
        type="button"
        class="mt-md inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl bg-brand-bun px-lg py-md text-sm font-black text-neutral-charcoal transition hover:bg-brand-bun-dark hover:text-neutral-cream"
        data-quick-action="salida"
        data-local="${escapeHtml(local.nombre)}"
        data-nombre="${escapeHtml(turno.nombre)}">
        Marcar salida
      </button>
    </article>
  `).join('');

  wrapper.innerHTML = `
    <div class="grid gap-md md:hidden">${mobileCards}</div>
    <table class="hidden min-w-[640px] w-full border-collapse md:table">
      <thead>
        <tr>
          <th class="bg-brand-cheese/24 px-md py-md text-left text-xs font-black uppercase tracking-[0.12em] text-brand-bun-dark">Colaborador</th>
          <th class="bg-brand-cheese/24 px-md py-md text-left text-xs font-black uppercase tracking-[0.12em] text-brand-bun-dark">Ingreso</th>
          <th class="bg-brand-cheese/24 px-md py-md text-left text-xs font-black uppercase tracking-[0.12em] text-brand-bun-dark">Estado</th>
          <th class="bg-brand-cheese/24 px-md py-md text-left text-xs font-black uppercase tracking-[0.12em] text-brand-bun-dark">Acción</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  wrapper.querySelectorAll('[data-quick-action="salida"]').forEach((button) => {
    button.addEventListener('click', () => {
      onQuickAction({
        local: button.dataset.local || local.nombre,
        nombre: button.dataset.nombre || '',
        accion: 'Salida',
      });
    });
  });

  return wrapper;
}

async function cargarColaboradoresPorLocal(local) {
  if (colaboradoresPorLocalCache.has(local)) {
    return colaboradoresPorLocalCache.get(local);
  }

  const data = await window.LVAuth.apiGet({ accion: 'ColaboradoresPorLocal', local });
  if (data.status && data.status !== 'SUCCESS') {
    throw new Error(data.mensaje || 'No se pudo cargar la lista de colaboradores.');
  }

  const colaboradores = Array.isArray(data.colaboradores)
    ? data.colaboradores
    : Array.isArray(data.empleados)
      ? data.empleados
      : [];

  colaboradoresPorLocalCache.set(local, colaboradores);
  return colaboradores;
}

async function registrarAsistenciaAdmin(payload) {
  const data = await window.LVAuth.apiPost({
    accion: 'RegistrarAsistenciaAdmin',
    local: payload.local,
    nombre: payload.nombre,
    tipoAccion: payload.accion,
  });

  if (data.status !== 'SUCCESS') {
    throw new Error(data.mensaje || 'No se pudo registrar la asistencia.');
  }

  return data;
}

function createConfirmModal() {
  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-notification hidden bg-neutral-charcoal/55 px-lg py-lg backdrop-blur-sm';

  const dialog = document.createElement('section');
  dialog.className = 'mx-auto flex min-h-full w-full max-w-[520px] items-center';

  const card = createCard({
    eyebrow: 'Confirmación',
    title: 'Confirmar salida',
    body: '',
    className: 'w-full rounded-[28px] bg-[#fff8ee] p-xl shadow-brand md:p-2xl',
  });

  const bodyNode = card.querySelector('p');
  bodyNode.className = 'text-base font-semibold leading-8 text-neutral-muted';

  const status = document.createElement('div');
  status.hidden = true;

  const actions = document.createElement('div');
  actions.className = 'mt-xl grid gap-sm md:grid-cols-[1fr_1fr]';

  const cancelButton = createButton('Cancelar', {
    variant: 'secondary',
    className: 'min-h-[52px] bg-white/82 text-neutral-charcoal',
  });

  const confirmButton = createButton('Confirmar', {
    variant: 'success',
    className: 'min-h-[52px]',
  });
  confirmButton.type = 'button';

  actions.append(confirmButton, cancelButton);
  card.append(status, actions);
  dialog.appendChild(card);
  backdrop.appendChild(dialog);

  let onConfirm = null;
  let onCancel = null;

  function setStatus(message) {
    status.hidden = false;
    status.className = 'rounded-2xl border border-brand-ketchup/24 bg-brand-ketchup/12 px-lg py-md text-sm font-bold leading-6 text-brand-ketchup';
    status.textContent = message;
  }

  function clearStatus() {
    status.hidden = true;
    status.textContent = '';
    status.className = '';
  }

  function close() {
    backdrop.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    clearStatus();
    confirmButton.disabled = false;
    onConfirm = null;
    onCancel = null;
  }

  function open(options = {}) {
    const {
      title = 'Confirmar acción',
      message = '',
      confirmLabel = 'Confirmar',
      onConfirm: confirmHandler,
      onCancel: cancelHandler,
    } = options;

    card.querySelector('h3').textContent = title;
    bodyNode.textContent = message;
    confirmButton.textContent = confirmLabel;
    onConfirm = confirmHandler;
    onCancel = cancelHandler;
    clearStatus();
    backdrop.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  cancelButton.addEventListener('click', () => {
    if (typeof onCancel === 'function') onCancel();
    close();
  });
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) {
      if (typeof onCancel === 'function') onCancel();
      close();
    }
  });

  confirmButton.addEventListener('click', async () => {
    if (typeof onConfirm !== 'function') {
      close();
      return;
    }

    clearStatus();
    confirmButton.disabled = true;

    try {
      await onConfirm();
      close();
    } catch (error) {
      confirmButton.disabled = false;
      setStatus(error.message || 'No se pudo completar la acción.');
    }
  });

  return { element: backdrop, open, close };
}

function createAttendanceForm(options = {}) {
  const { onSaved, requestConfirmation } = options;

  const container = document.createElement('div');
  container.className = 'grid gap-lg';

  const localField = createSelectField({
    label: 'Local',
    id: 'adminAssistLocal',
    name: 'local',
    placeholder: 'Selecciona un local',
    options: LOCALES.map((local) => ({ value: local.nombre, label: local.nombre })),
  });

  const collaboratorField = createSelectField({
    label: 'Colaborador',
    id: 'adminAssistCollaborator',
    name: 'nombre',
    placeholder: 'Selecciona primero un local',
    options: [],
    disabled: true,
  });

  const actionField = createSelectField({
    label: 'Acción',
    id: 'adminAssistAction',
    name: 'tipoAccion',
    placeholder: 'Selecciona la acción',
    options: [
      { value: 'Ingreso', label: 'Ingreso' },
      { value: 'Salida', label: 'Salida' },
    ],
  });
  actionField.setValue('Ingreso', false);

  const status = document.createElement('div');
  status.hidden = true;

  const actions = document.createElement('div');
  actions.className = 'grid gap-sm md:grid-cols-[1fr_1fr]';

  const submitButton = createButton('Registrar accion', {
    className: 'min-h-[52px]',
  });
  submitButton.type = 'button';

  const resetButton = createButton('Limpiar', {
    variant: 'secondary',
    className: 'min-h-[52px] bg-white/82 text-neutral-charcoal',
  });

  actions.append(submitButton, resetButton);
  container.append(localField.wrapper, collaboratorField.wrapper, actionField.wrapper, status, actions);

  function setStatus(type, message) {
    const tones = {
      loading: 'border-brand-cheese/24 bg-brand-cheese/16 text-brand-bun-dark',
      success: 'border-brand-lettuce/24 bg-brand-lettuce/12 text-brand-lettuce',
      error: 'border-brand-ketchup/24 bg-brand-ketchup/12 text-brand-ketchup',
    };

    status.className = `rounded-2xl border px-lg py-md text-sm font-bold leading-6 ${tones[type] || tones.error}`;
    status.textContent = message;
    status.hidden = false;
  }

  function clearStatus() {
    status.hidden = true;
    status.textContent = '';
    status.className = '';
  }

  async function syncCollaborators(local, preferredName = '') {
    collaboratorField.setDisabled(true);
    collaboratorField.setOptions([]);
    collaboratorField.setPlaceholder(local ? 'Cargando colaboradores...' : 'Selecciona primero un local');

    if (!local) {
      return;
    }

    const colaboradores = await cargarColaboradoresPorLocal(local);
    collaboratorField.setOptions(colaboradores.map((nombre) => ({ value: nombre, label: nombre })));
    collaboratorField.setPlaceholder(colaboradores.length ? 'Selecciona un colaborador' : 'No hay colaboradores en este local');
    collaboratorField.setDisabled(!colaboradores.length);
    collaboratorField.setValue(preferredName && colaboradores.includes(preferredName) ? preferredName : '', false);
  }

  function resetForm() {
    clearStatus();
    localField.setValue('', false);
    collaboratorField.setValue('', false);
    collaboratorField.setOptions([]);
    collaboratorField.setDisabled(true);
    collaboratorField.setPlaceholder('Selecciona primero un local');
    actionField.setValue('Ingreso', false);
    submitButton.disabled = false;
  }

  localField.onChange(async (local) => {
    clearStatus();
    try {
      await syncCollaborators(local);
    } catch (error) {
      setStatus('error', error.message || 'No se pudo cargar la lista de colaboradores.');
    }
  });

  resetButton.addEventListener('click', resetForm);

  submitButton.addEventListener('click', async () => {
    clearStatus();

    const payload = {
      local: localField.getValue().trim(),
      nombre: collaboratorField.getValue().trim(),
      accion: actionField.getValue().trim(),
    };

    if (!payload.local) {
      setStatus('error', 'Debes seleccionar un local.');
      return;
    }

    if (!payload.nombre) {
      setStatus('error', 'Debes seleccionar un colaborador.');
      return;
    }

    if (!payload.accion) {
      setStatus('error', 'Debes seleccionar una acción.');
      return;
    }

    try {
      await requestConfirmation(payload);
      submitButton.disabled = true;
      setStatus('loading', 'Registrando accion...');
      overlay.setLoading(true, 'Guardando accion...');
      await waitNextFrame();
      const data = await registrarAsistenciaAdmin(payload);
      resetForm();
      setStatus('success', `${data.accion} registrada para ${data.nombre}.`);
      toast.show('success', `${data.accion} registrada para ${data.nombre} en ${data.local}.`);
      await onSaved();
    } catch (error) {
      if (error && error.message === 'CONFIRM_CANCELLED') {
        clearStatus();
        submitButton.disabled = false;
        return;
      }
      setStatus('error', error.message || 'No se pudo registrar la asistencia.');
    } finally {
      overlay.setLoading(false);
      submitButton.disabled = false;
    }
  });

  return { element: container };
}

function setLoadingLocal(section) {
  section.panel.innerHTML = '';
  section.panel.appendChild(createStateMessage('loading', 'Cargando turnos abiertos...'));
  section.badge.textContent = '...';
}

function renderLocal(section, local, turnos, onQuickAction) {
  const total = Array.isArray(turnos) ? turnos.length : 0;
  section.badge.textContent = String(total);
  section.panel.innerHTML = '';

  if (!total) {
    section.panel.appendChild(createStateMessage('empty', 'No hay turnos abiertos en este local.'));
    return;
  }

  section.panel.appendChild(createTurnosTable(local, turnos, onQuickAction));
}

function renderErrorLocal(section, message) {
  section.panel.innerHTML = '';
  section.panel.appendChild(createStateMessage('error', message || 'No se pudo cargar este local.'));
  section.badge.textContent = '0';
}

function getDashboardTimestamp() {
  const now = new Date();
  return now.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function bootstrap() {
  try {
    overlay.setLoading(true, 'Validando sesión...');
    const session = await window.LVAuth.protectPage(['Administrador']);
    if (!session) return;

    overlay.setLoading(true, 'Cargando dashboard...');
    await waitNextFrame();
    const app = createTurnosAbiertosApp(session);
    await app.cargarDashboard();
    window.setInterval(app.cargarDashboard, REFRESCO_AUTOMATICO_MS);
  } finally {
    overlay.setLoading(false);
  }
}

function createTurnosAbiertosApp(session) {
  const app = $('app');
  const shell = document.createElement('div');
  shell.className = 'mx-auto flex min-h-screen w-full max-w-[1320px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl';

  function createSessionPill() {
    const node = document.createElement('div');
    node.className = 'rounded-full border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-md text-sm font-black leading-relaxed text-neutral-cream';
    node.textContent = `${session.displayName || 'Administrador'} · ${session.role}`;
    return node;
  }

  function createRefreshPill() {
    const node = document.createElement('div');
    node.className = 'rounded-full border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-md text-sm font-black leading-relaxed text-neutral-cream';
    node.innerHTML = `
      <span class="mr-sm text-[11px] uppercase tracking-[0.16em] text-neutral-cream/60">Última actualización</span>
      <span data-refresh-label class="text-sm font-black text-neutral-cream">--:--</span>
    `;
    return node;
  }

  function createActionButtons() {
    const row = document.createElement('div');
    row.className = 'flex flex-col gap-sm sm:flex-row sm:flex-wrap';

    const btnBack = createButton('Volver al panel', {
      variant: 'secondary',
      className: 'bg-white/88 text-neutral-charcoal sm:flex-1 hover:bg-white',
      onClick: () => {
        window.location.href = withCurrentEnvironment('adminPanel.html');
      },
    });

    const btnLogout = createButton('Cerrar sesión', {
      className: 'sm:flex-1',
      onClick: async () => {
        overlay.setLoading(true, 'Cerrando sesión...');
        await waitNextFrame();
        await window.LVAuth.logout();
        window.LVAuth.redirectToIndex();
      },
    });

    const btnActualizar = createButton('Actualizar ahora', {
      variant: 'success',
      className: 'sm:flex-1',
    });
    btnActualizar.dataset.role = 'refresh-button';

    row.append(btnBack, btnLogout, btnActualizar);
    return { row };
  }

  const desktopContextPills = document.createElement('div');
  desktopContextPills.className = 'hidden flex-wrap gap-sm lg:flex';
  desktopContextPills.append(createSessionPill(), createRefreshPill());

  const desktopActions = createActionButtons();

  const mobileSessionCard = createCard({
    eyebrow: 'Sesión y refresh',
    className: 'rounded-3xl lg:hidden',
  });
  const mobileActions = document.createElement('div');
  mobileActions.className = 'grid grid-cols-3 gap-sm';
  mobileActions.append(
    createButton('Volver', {
      variant: 'secondary',
      className: 'min-h-[44px] bg-white/88 px-md py-sm text-sm text-neutral-charcoal shadow-none hover:bg-white',
      onClick: () => {
        window.location.href = withCurrentEnvironment('adminPanel.html');
      },
    }),
    createButton('Cerrar', {
      className: 'min-h-[44px] px-md py-sm text-sm shadow-none',
      onClick: async () => {
        overlay.setLoading(true, 'Cerrando sesión...');
        await waitNextFrame();
        await window.LVAuth.logout();
        window.LVAuth.redirectToIndex();
      },
    }),
    createButton('Actualizar', {
      variant: 'success',
      className: 'min-h-[44px] px-md py-sm text-sm shadow-none',
    }),
  );
  mobileActions.querySelector('button:last-child').dataset.role = 'refresh-button';
  mobileSessionCard.appendChild(mobileActions);

  const hero = createPageHero({
    badge: 'La Victoria · Administración',
    title: 'Turnos abiertos',
    lead: 'Revisa turnos abiertos por local y registra asistencia administrativa desde una sección dedicada al final del tablero.',
    sideTitle: 'Sesión y refresh',
    sideStatus: desktopContextPills,
    sideCopy: 'Para revisión funcional usa siempre la ruta con ?env=staging, así mantienes todo el circuito de navegación en el entorno correcto.',
    sideActions: (() => {
      const wrapper = document.createElement('div');
      wrapper.className = 'grid gap-sm';
      wrapper.append(desktopActions.row);
      return wrapper;
    })(),
    layoutClassName: 'gap-lg lg:items-start lg:gap-2xl',
    contentClassName: 'lg:basis-[70%]',
    titleClassName: 'mt-sm max-w-[9ch] text-[clamp(32px,8vw,68px)]',
    leadClassName: 'mt-md max-w-[58ch] text-sm leading-7 md:mt-xl md:text-lg',
    sideClassName: 'hidden p-lg lg:block lg:w-[420px]',
    className: 'p-lg md:p-2xl',
  });

  const localGrid = document.createElement('section');
  localGrid.className = 'grid gap-lg xl:grid-cols-2';

  const localSections = LOCALES.map((local) => {
    const section = createAccordionSection({
      id: local.id,
      title: local.nombre,
      subtitle: 'Colaboradores pendientes de salida',
      badgeText: '0',
      open: !isMobileView(),
    });

    localGrid.appendChild(section.element);
    return { local, section };
  });

  const adminSection = createAccordionSection({
    id: 'AsistenciaAdministrativa',
    title: 'Asistencia Administrativa',
    subtitle: 'Registra ingreso o salida de colaboradores',
    badgeText: 'A',
    open: !isMobileView(),
  });

  const confirmModal = createConfirmModal();
  shell.appendChild(confirmModal.element);

  const attendanceForm = createAttendanceForm({
    onSaved: async () => {
      await cargarDashboard();
    },
    requestConfirmation: async (payload) => new Promise((resolve, reject) => {
      confirmModal.open({
        title: 'Confirmar accion',
        message: `Vas a registrar ${payload.accion.toLowerCase()} para ${payload.nombre} en ${payload.local}.`,
        confirmLabel: payload.accion === 'Salida' ? 'Registrar salida' : 'Registrar ingreso',
        onConfirm: async () => { resolve(); },
        onCancel: () => { reject(new Error('CONFIRM_CANCELLED')); },
      });
    }),
  });
  adminSection.panel.appendChild(attendanceForm.element);

  const footer = document.createElement('p');
  footer.className = 'pb-lg text-center text-sm font-bold text-neutral-cream/70';
  footer.textContent = 'Actualización automática cada 30 minutos · Revisión recomendada en ?env=staging';

  shell.append(hero, localGrid, adminSection.element, mobileSessionCard, footer);
  app.appendChild(shell);

  const refreshLabels = shell.querySelectorAll('[data-refresh-label]');
  const actionButtons = shell.querySelectorAll('[data-role="refresh-button"]');
  const accordionSections = [...localSections.map((item) => item.section), adminSection];

  function setExclusiveOpen(sectionToToggle) {
    const shouldOpen = !sectionToToggle.isOpen();
    accordionSections.forEach((section) => {
      section.setOpen(section === sectionToToggle ? shouldOpen : false);
    });
  }

  function attachAccordionToggle(section) {
    section.bindToggle(() => {
      setExclusiveOpen(section);
    });
  }

  localSections.forEach(({ section }) => {
    attachAccordionToggle(section);
  });

  attachAccordionToggle(adminSection);

  function syncAccordionMode() {
    if (isMobileView()) {
      accordionSections.forEach((section) => section.setOpen(false));
      return;
    }

    accordionSections.forEach((section, index) => {
      section.setOpen(index === 0);
    });
  }

  function updateDashboardTimestamp() {
    const text = getDashboardTimestamp();
    refreshLabels.forEach((label) => {
      label.textContent = text;
    });
  }

  async function handleQuickAction(payload) {
    confirmModal.open({
      title: 'Confirmar salida',
      message: `Vas a registrar la salida de ${payload.nombre} en ${payload.local}.`,
      confirmLabel: 'Registrar salida',
      onConfirm: async () => {
        overlay.setLoading(true, 'Guardando salida...');
        await waitNextFrame();

        try {
          const data = await registrarAsistenciaAdmin(payload);
          toast.show('success', `${data.accion} registrada para ${data.nombre} en ${data.local}.`);
          await cargarDashboard();
        } finally {
          overlay.setLoading(false);
        }
      },
    });
  }

  async function cargarDashboard() {
    actionButtons.forEach((button) => {
      button.disabled = true;
      button.textContent = 'Actualizando...';
    });

    await Promise.all(localSections.map(async ({ local, section }) => {
      setLoadingLocal(section);
      try {
        const data = await window.LVAuth.apiGet({ accion: 'TurnosAbiertos', local: local.nombre });
        if (data.status !== 'SUCCESS') {
          renderErrorLocal(section, data.mensaje || 'El servidor no devolvió una respuesta válida.');
          return;
        }

        renderLocal(section, local, data.turnosAbiertos || [], handleQuickAction);
      } catch (error) {
        if (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN') {
          window.LVAuth.redirectToIndex('session');
          return;
        }
        renderErrorLocal(section, 'Error de conexión. Revisa internet o el Apps Script.');
      }
    }));

    updateDashboardTimestamp();

    actionButtons.forEach((button) => {
      button.disabled = false;
      button.textContent = 'Actualizar ahora';
    });
  }

  actionButtons.forEach((button) => button.addEventListener('click', cargarDashboard));
  window.addEventListener('resize', syncAccordionMode);
  syncAccordionMode();

  return { cargarDashboard };
}

bootstrap();
