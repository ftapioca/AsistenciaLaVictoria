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

function createMetricCard(label, valueId, tone = 'neutral') {
  const toneClass = tone === 'highlight'
    ? 'bg-gradient-to-br from-brand-cheese/80 via-white/92 to-brand-bun/25 border-brand-bun/20'
    : 'bg-white/88 border-neutral-charcoal/10';

  const metric = document.createElement('article');
  metric.className = `rounded-3xl border p-xl backdrop-blur ${toneClass}`;
  metric.innerHTML = `
    <p class="text-xs font-black uppercase tracking-[0.18em] text-neutral-muted">${label}</p>
    <strong id="${valueId}" class="mt-md block text-[42px] font-black leading-none tracking-[-0.06em] text-brand-bun-dark">0</strong>
  `;
  return metric;
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

function createLocalCard(local) {
  const card = createCard({
    className: 'overflow-hidden rounded-3xl p-0',
  });

  const details = document.createElement('details');
  details.className = 'group';
  details.dataset.localId = local.id;

  const summary = document.createElement('summary');
  summary.className = 'flex cursor-pointer list-none items-center justify-between gap-lg bg-gradient-to-b from-[#fffaf1] to-neutral-cream px-xl py-xl';
  summary.innerHTML = `
    <div>
      <h2 class="text-[28px] font-black leading-none tracking-[-0.04em] text-neutral-charcoal">${local.nombre}</h2>
      <p class="mt-sm text-sm font-bold text-neutral-muted">Colaboradores pendientes de salida</p>
    </div>
  `;

  const meta = document.createElement('div');
  meta.className = 'flex items-center gap-md';

  const countBadge = document.createElement('div');
  countBadge.id = `badge-${local.id}`;
  countBadge.className = 'grid min-h-[46px] min-w-[46px] place-items-center rounded-2xl bg-gradient-to-r from-brand-cheese to-brand-bun px-md text-xl font-black text-neutral-charcoal';
  countBadge.textContent = '0';

  const chevron = document.createElement('span');
  chevron.className = 'grid size-8 place-items-center rounded-full border border-neutral-charcoal/10 bg-white/70 text-sm text-neutral-charcoal transition-transform group-open:rotate-180 md:group-open:rotate-0';
  chevron.textContent = '▾';

  meta.append(countBadge, chevron);
  summary.appendChild(meta);

  const panel = document.createElement('div');
  panel.id = `contenido-${local.id}`;
  panel.className = 'p-lg';
  panel.appendChild(createStateMessage('loading', 'Cargando turnos abiertos...'));

  details.append(summary, panel);
  card.appendChild(details);

  return card;
}

function updateAccordionMode() {
  document.querySelectorAll('details[data-local-id]').forEach((details) => {
    const summary = details.querySelector('summary');
    if (!summary) return;

    if (isMobileView()) {
      details.removeAttribute('open');
      summary.classList.add('cursor-pointer');
    } else {
      details.setAttribute('open', '');
      summary.classList.remove('cursor-pointer');
    }
  });
}

function setupAccordions() {
  const accordions = Array.from(document.querySelectorAll('details[data-local-id]'));

  accordions.forEach((details) => {
    const summary = details.querySelector('summary');
    if (!summary) return;

    summary.addEventListener('click', (event) => {
      if (!isMobileView()) {
        event.preventDefault();
      }
    });

    details.addEventListener('toggle', () => {
      if (!isMobileView()) {
        details.setAttribute('open', '');
        return;
      }

      if (details.open) {
        accordions.forEach((other) => {
          if (other !== details) other.removeAttribute('open');
        });
      }
    });
  });

  updateAccordionMode();
  window.addEventListener('resize', updateAccordionMode);
}

function setLoadingLocal(localId) {
  const panel = $(`contenido-${localId}`);
  if (!panel) return;
  panel.innerHTML = '';
  panel.appendChild(createStateMessage('loading', 'Cargando turnos abiertos...'));
  $(`badge-${localId}`).textContent = '...';
}

function createLocalActions(local, total, onRegisterAction) {
  const toolbar = document.createElement('div');
  toolbar.className = 'mb-lg flex flex-col gap-sm rounded-2xl border border-neutral-charcoal/8 bg-white/62 p-md md:flex-row md:items-center md:justify-between';
  toolbar.innerHTML = `
    <div class="min-w-0">
      <p class="text-xs font-black uppercase tracking-[0.18em] text-neutral-muted">Acción administrativa</p>
      <p class="mt-xs text-sm font-semibold leading-6 text-neutral-charcoal/72">${total ? `Hay ${total} turnos abiertos en ${local.nombre}.` : `No hay turnos abiertos en ${local.nombre}, pero igual puedes registrar asistencia.`}</p>
    </div>
  `;

  toolbar.appendChild(createButton('Registrar asistencia', {
    className: 'min-h-[48px] md:min-w-[220px]',
    onClick: () => onRegisterAction({ local: local.nombre }),
  }));

  return toolbar;
}

function renderLocal(local, turnos, onRegisterAction) {
  const panel = $(`contenido-${local.id}`);
  const total = Array.isArray(turnos) ? turnos.length : 0;
  $(`badge-${local.id}`).textContent = String(total);

  panel.innerHTML = '';
  panel.appendChild(createLocalActions(local, total, onRegisterAction));
  if (!total) {
    panel.appendChild(createStateMessage('empty', 'No hay turnos abiertos en este local.'));
    return;
  }

  panel.appendChild(createTurnosTable(local, turnos, onRegisterAction));
}

function renderErrorLocal(local, message) {
  const panel = $(`contenido-${local.id}`);
  panel.innerHTML = '';
  panel.appendChild(createLocalActions(local, 0, openRegisterModalGlobal));
  panel.appendChild(createStateMessage('error', message || 'No se pudo cargar este local.'));
  $(`badge-${local.id}`).textContent = '0';
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

async function cargarTurnosLocal(local) {
  setLoadingLocal(local.id);
  try {
    const data = await window.LVAuth.apiGet({ accion: 'TurnosAbiertos', local: local.nombre });
    if (data.status !== 'SUCCESS') {
      renderErrorLocal(local, data.mensaje || 'El servidor no devolvió una respuesta válida.');
      return 0;
    }

    const turnos = data.turnosAbiertos || [];
    renderLocal(local, turnos, openRegisterModalGlobal);
    return turnos.length;
  } catch (error) {
    if (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN') {
      window.LVAuth.redirectToIndex('session');
      return 0;
    }
    renderErrorLocal(local, 'Error de conexión. Revisa internet o el Apps Script.');
    return 0;
  }
}

async function cargarColaboradoresPorLocal(local) {
  if (colaboradoresPorLocalCache.has(local)) {
    return colaboradoresPorLocalCache.get(local);
  }

  const data = await window.LVAuth.apiGet({ accion: 'ColaboradoresPorLocal', local });
  if (data.status !== 'SUCCESS') {
    throw new Error(data.mensaje || 'No se pudo cargar la lista de colaboradores.');
  }

  const colaboradores = Array.isArray(data.colaboradores) ? data.colaboradores : [];
  colaboradoresPorLocalCache.set(local, colaboradores);
  return colaboradores;
}

let openRegisterModalGlobal = () => {};

function createRegisterModal(onSaved) {
  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-notification hidden bg-neutral-charcoal/55 px-lg py-lg backdrop-blur-sm';

  const dialog = document.createElement('section');
  dialog.className = 'mx-auto flex min-h-full w-full max-w-[640px] items-center';

  const card = createCard({
    eyebrow: 'Asistencia administrativa',
    title: 'Registrar ingreso o salida',
    body: 'Selecciona local, colaborador y acción. La operación usa tu sesión de administrador y respeta las validaciones de secuencia del sistema.',
    className: 'w-full rounded-[28px] bg-[#fff8ee] p-xl shadow-brand md:p-2xl',
  });

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
    name: 'accion',
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
  actions.className = 'mt-xl grid gap-sm md:grid-cols-[1fr_1fr]';

  const cancelButton = createButton('Cancelar', {
    variant: 'secondary',
    className: 'min-h-[52px] bg-white/82 text-neutral-charcoal',
  });

  const submitButton = createButton('Registrar asistencia', {
    className: 'min-h-[52px]',
  });
  submitButton.type = 'button';

  actions.append(cancelButton, submitButton);

  const form = document.createElement('div');
  form.className = 'mt-xl grid gap-lg';
  form.append(localField.wrapper, collaboratorField.wrapper, actionField.wrapper, status, actions);
  card.appendChild(form);
  dialog.appendChild(card);
  backdrop.appendChild(dialog);

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

  function close() {
    backdrop.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    clearStatus();
    submitButton.disabled = false;
  }

  async function open(options = {}) {
    const { local = '', nombre = '', accion = 'Ingreso' } = options;
    clearStatus();
    localField.setValue(local, false);
    actionField.setValue(accion, false);
    collaboratorField.setValue('', false);
    collaboratorField.setOptions([]);
    collaboratorField.setDisabled(true);
    collaboratorField.setPlaceholder(local ? 'Cargando colaboradores...' : 'Selecciona primero un local');
    backdrop.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    if (local) {
      try {
        await syncCollaborators(local, nombre);
      } catch (error) {
        setStatus('error', error.message || 'No se pudo cargar la lista de colaboradores.');
      }
    }
  }

  localField.onChange(async (local) => {
    clearStatus();
    try {
      await syncCollaborators(local);
    } catch (error) {
      setStatus('error', error.message || 'No se pudo cargar la lista de colaboradores.');
    }
  });

  cancelButton.addEventListener('click', close);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close();
  });

  submitButton.addEventListener('click', async () => {
    clearStatus();

    const local = localField.getValue().trim();
    const nombre = collaboratorField.getValue().trim();
    const accion = actionField.getValue().trim();

    if (!local) {
      setStatus('error', 'Debes seleccionar un local.');
      return;
    }

    if (!nombre) {
      setStatus('error', 'Debes seleccionar un colaborador.');
      return;
    }

    if (!accion) {
      setStatus('error', 'Debes seleccionar una acción.');
      return;
    }

    submitButton.disabled = true;
    setStatus('loading', 'Registrando asistencia...');
    overlay.setLoading(true, 'Guardando asistencia...');
    await waitNextFrame();

    try {
      const data = await window.LVAuth.apiPost({
        accion: 'RegistrarAsistenciaAdmin',
        local,
        nombre,
        accion,
      });

      if (data.status !== 'SUCCESS') {
        throw new Error(data.mensaje || 'No se pudo registrar la asistencia.');
      }

      close();
      toast.show('success', `${data.accion} registrada para ${data.nombre} en ${data.local}.`);
      await onSaved();
    } catch (error) {
      setStatus('error', error.message || 'No se pudo registrar la asistencia.');
    } finally {
      overlay.setLoading(false);
      submitButton.disabled = false;
    }
  });

  return { element: backdrop, open, close };
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

    const btnRegistrar = createButton('Registrar asistencia', {
      variant: 'success',
      className: 'sm:flex-1',
    });
    btnRegistrar.dataset.role = 'register-button';

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

    row.append(btnRegistrar, btnBack, btnLogout, btnActualizar);
    return { row, btnActualizar, btnRegistrar };
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
  mobileActions.className = 'grid grid-cols-2 gap-sm';
  mobileActions.append(
    createButton('Registrar', {
      variant: 'success',
      className: 'min-h-[44px] px-md py-sm text-sm shadow-none',
    }),
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
  mobileActions.querySelectorAll('button')[0].dataset.role = 'register-button';
  mobileActions.querySelectorAll('button')[3].dataset.role = 'refresh-button';
  mobileSessionCard.appendChild(mobileActions);

  const hero = createPageHero({
    badge: 'La Victoria · Administración',
    title: 'Turnos abiertos',
    lead: 'Revisa turnos abiertos por local y registra asistencia administrativa sin salir de esta vista cuando necesites corregir o completar una marca.',
    sideTitle: 'Sesión y refresh',
    sideStatus: desktopContextPills,
    sideCopy: 'Refresh automático cada 30 minutos y acceso inmediato para registrar ingreso o salida por administración.',
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
  LOCALES.forEach((local) => {
    localGrid.appendChild(createLocalCard(local));
  });

  const footer = document.createElement('p');
  footer.className = 'pb-lg text-center text-sm font-bold text-neutral-cream/70';
  footer.textContent = 'Actualización automática cada 30 minutos · Registro administrativo disponible en cada local';

  shell.append(hero, localGrid, mobileSessionCard, footer);
  app.appendChild(shell);

  const refreshLabels = shell.querySelectorAll('[data-refresh-label]');
  const actionButtons = shell.querySelectorAll('[data-role="refresh-button"]');
  const registerButtons = shell.querySelectorAll('[data-role="register-button"]');

  const registerModal = createRegisterModal(async () => {
    await cargarDashboard();
  });
  shell.appendChild(registerModal.element);

  openRegisterModalGlobal = (options = {}) => {
    registerModal.open(options);
  };

  function updateDashboardTimestamp() {
    const text = getDashboardTimestamp();
    refreshLabels.forEach((label) => {
      label.textContent = text;
    });
  }

  async function cargarDashboard() {
    actionButtons.forEach((button) => {
      button.disabled = true;
      button.textContent = 'Actualizando...';
    });

    await Promise.all(LOCALES.map((local) => cargarTurnosLocal(local)));
    updateDashboardTimestamp();

    actionButtons.forEach((button) => {
      button.disabled = false;
      button.textContent = 'Actualizar ahora';
    });
  }

  actionButtons.forEach((button) => button.addEventListener('click', cargarDashboard));
  registerButtons.forEach((button) => button.addEventListener('click', () => openRegisterModalGlobal()));
  setupAccordions();

  return { cargarDashboard };
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

bootstrap();
