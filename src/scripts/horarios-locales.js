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
import { createToast } from '../components/Toast.js';

const state = {
  session: null,
  locals: [],
  horarioLocales: [],
  horariosEspeciales: [],
  feriados: [],
};

const modalRuntime = {
  config: null,
  batchEnabled: false,
};

const WEEKDAY_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIPO_ESPECIAL_OPTIONS = ['Feriado', 'Evento', 'Cerrado', 'Mantención', 'Horario Extendido', 'Horario Reducido'];
const TIPO_FERIADO_OPTIONS = ['Irrenunciable', 'Civil', 'Religioso'];

const overlay = createLoadingOverlay('Procesando...');
document.body.appendChild(overlay.element);

const toast = createToast();
document.body.appendChild(toast.element);

function $(id) {
  return document.getElementById(id);
}

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

function boolLabel(value) {
  return value
    ? '<span class="inline-flex rounded-full bg-brand-lettuce/14 px-md py-xs text-xs font-black uppercase tracking-[0.16em] text-brand-lettuce">Sí</span>'
    : '<span class="inline-flex rounded-full bg-brand-ketchup/12 px-md py-xs text-xs font-black uppercase tracking-[0.16em] text-brand-ketchup">No</span>';
}

function getStatusBadge(isOpen) {
  return isOpen
    ? '<span class="inline-flex items-center gap-xs rounded-full bg-brand-lettuce/14 px-md py-xs text-sm font-black text-brand-lettuce"><span class="size-2 rounded-full bg-brand-lettuce"></span>Abierto</span>'
    : '<span class="inline-flex items-center gap-xs rounded-full bg-neutral-charcoal/8 px-md py-xs text-sm font-black text-neutral-charcoal/70"><span class="size-2 rounded-full bg-neutral-charcoal/45"></span>Cerrado</span>';
}

function isDayOpen(day) {
  return Boolean(day.activo) && Boolean(day.horaApertura) && Boolean(day.horaCierre);
}

function getHorarioDisplay(day) {
  if (!isDayOpen(day)) {
    return {
      value: '—',
      helper: 'Sin atención',
    };
  }

  return {
    value: `${day.horaApertura} – ${day.horaCierre}`,
    helper: 'Horario de atención',
  };
}

function getTrasnocheDisplay(day) {
  if (!isDayOpen(day)) {
    return {
      value: '—',
      helper: 'No aplica',
      badge: '',
    };
  }

  return {
    value: day.permiteTrasnoche ? 'Sí' : 'No',
    helper: day.permiteTrasnoche ? 'Cierra al día siguiente' : '',
    badge: day.permiteTrasnoche
      ? '<span class="inline-flex rounded-full bg-brand-lettuce/14 px-md py-xs text-xs font-black text-brand-lettuce">Cierra al día siguiente</span>'
      : '',
  };
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function getWeekdayRank(dayLabel) {
  const normalized = normalizeText(dayLabel);
  const index = WEEKDAY_ORDER.findIndex((day) => normalizeText(day) === normalized);
  return index === -1 ? WEEKDAY_ORDER.length : index;
}

function sortHorarioLocales(items) {
  return items.slice().sort((a, b) => {
    if (a.local !== b.local) return a.local.localeCompare(b.local, 'es');
    return getWeekdayRank(a.diaSemana) - getWeekdayRank(b.diaSemana);
  });
}

function groupHorarioLocalesByLocal(items) {
  const groups = new Map();

  sortHorarioLocales(items).forEach((item) => {
    if (!groups.has(item.local)) {
      groups.set(item.local, {
        local: item.local,
        days: [],
      });
    }

    groups.get(item.local).days.push(item);
  });

  return [...groups.values()];
}

function normalizeLocalOptions() {
  return state.locals.length ? state.locals : ['Paseo del Lago', 'Segunda Faja'];
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

function createTableSection({ eyebrow, title, body, addLabel, tableId, countId, onAdd, showAddAction = true }) {
  const card = createCard({
    eyebrow,
    title,
    body,
    className: 'rounded-3xl md:p-2xl',
  });

  const header = document.createElement('div');
  header.className = 'mt-xl flex flex-col gap-md md:flex-row md:items-center md:justify-between';

  const count = document.createElement('p');
  count.id = countId;
  count.className = 'text-sm font-bold text-neutral-muted';

  header.appendChild(count);
  if (showAddAction) {
    header.appendChild(createButton(addLabel, {
      variant: 'primary',
      className: 'min-h-[48px] rounded-full px-xl',
      onClick: onAdd,
    }));
  }

  const tableWrap = document.createElement('div');
  tableWrap.id = tableId;
  tableWrap.className = 'mt-xl overflow-hidden rounded-3xl border border-neutral-charcoal/10 bg-white/88';

  card.append(header, tableWrap);
  return card;
}

function createModal() {
  const root = document.createElement('div');
  root.id = 'scheduleModal';
  root.className = 'fixed inset-0 z-[140] hidden items-center justify-center bg-neutral-charcoal/68 px-lg py-lg backdrop-blur';
  root.innerHTML = `
    <div class="absolute inset-0" data-modal-backdrop></div>
    <div id="scheduleModalShell" class="relative z-[1] flex max-h-[92vh] w-full max-w-[1120px] flex-col overflow-hidden rounded-[32px] border border-neutral-charcoal/12 bg-[#fff8ee] shadow-brand">
      <div id="scheduleModalLoading" class="absolute inset-0 z-[4] hidden items-center justify-center rounded-[32px] bg-neutral-charcoal/18 px-xl backdrop-blur-md">
        <div class="grid w-full max-w-[420px] gap-md rounded-3xl border border-brand-bun/18 bg-white/96 px-xl py-xl text-center shadow-brand">
          <div class="mx-auto size-10 rounded-full border-[3px] border-neutral-charcoal/18 border-t-brand-bun animate-spin"></div>
          <p id="scheduleModalLoadingTitle" class="text-lg font-black tracking-[-0.03em] text-neutral-charcoal">Guardando cambios...</p>
          <p id="scheduleModalLoadingMessage" class="text-sm font-semibold leading-7 text-neutral-muted">Estamos aplicando la actualización en la hoja correspondiente.</p>
        </div>
      </div>
      <div id="scheduleModalBackdropBlur" class="flex min-h-0 flex-1 flex-col transition-[filter,opacity] duration-200">
        <div class="sticky top-0 z-[2] flex items-start justify-between gap-lg border-b border-neutral-charcoal/8 bg-[#fff8ee] px-xl py-xl md:px-2xl">
          <div>
          <p id="modalEyebrow" class="text-xs font-black uppercase tracking-[0.18em] text-neutral-muted">Administración</p>
          <h2 id="modalTitle" class="mt-sm text-[clamp(30px,4vw,46px)] font-black tracking-[-0.05em] text-neutral-charcoal">Editar registro</h2>
          <p id="modalSubtitle" class="mt-sm text-sm font-bold leading-7 text-neutral-muted">Actualiza los parámetros y guarda los cambios.</p>
          </div>
          <button type="button" id="btnCloseScheduleModal" class="grid size-11 place-items-center rounded-2xl border border-neutral-charcoal/10 bg-white/92 text-xl font-black text-neutral-charcoal">×</button>
        </div>
        <form id="scheduleForm" class="flex min-h-0 flex-1 flex-col">
          <div class="min-h-0 flex-1 overflow-y-auto px-xl py-xl md:px-2xl">
            <div id="scheduleFormGrid" class="grid gap-lg"></div>
          </div>
          <div class="sticky bottom-0 z-[2] border-t border-neutral-charcoal/8 bg-[#fff8ee] px-xl py-lg md:px-2xl">
            <div class="grid gap-sm md:flex md:items-center md:justify-between">
              <button type="button" id="btnDeleteSchedule" class="hidden min-h-[52px] items-center justify-center rounded-2xl bg-brand-ketchup px-xl py-md text-base font-black text-white">Eliminar</button>
              <div class="grid gap-sm md:flex md:justify-end">
                <button type="button" id="btnCancelSchedule" class="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-neutral-charcoal/12 bg-white/92 px-xl py-md text-base font-black text-neutral-charcoal">Cancelar</button>
                <button type="submit" id="btnSaveSchedule" class="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-brand-bun px-xl py-md text-base font-black text-neutral-charcoal transition-fast hover:bg-brand-bun-dark hover:text-neutral-cream">Guardar cambios</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(root);
}

function setModalLoading(loading, title = 'Procesando...', message = 'Estamos actualizando la información.') {
  const modal = $('scheduleModal');
  const blurShell = $('scheduleModalBackdropBlur');
  const layer = $('scheduleModalLoading');
  if (!modal || !blurShell || !layer) return;

  $('scheduleModalLoadingTitle').textContent = title;
  $('scheduleModalLoadingMessage').textContent = message;

  blurShell.style.filter = loading ? 'blur(6px)' : 'none';
  blurShell.style.opacity = loading ? '0.55' : '1';
  layer.classList.toggle('hidden', !loading);
  layer.classList.toggle('flex', loading);
  modal.dataset.loading = loading ? 'true' : 'false';
}

function isBatchCreateMode(type, mode) {
  return mode === 'create' && (type === 'horariosEspeciales' || type === 'feriados');
}

function getModalConfig(type, mode, record = {}) {
  const localOptions = normalizeLocalOptions();

  if (type === 'horarioLocales') {
    return {
      eyebrow: 'Horario base',
      title: mode === 'create' ? 'Nuevo horario base' : 'Editar horario base',
      subtitle: 'Define la apertura y cierre habitual por local y día. Si el día no atiende, márcalo como cerrado.',
      saveAction: 'GuardarHorarioLocalAdmin',
      deleteAction: 'EliminarHorarioLocalAdmin',
      fields: [
        { id: 'local', label: 'Local', type: 'select', options: localOptions, value: record.local || localOptions[0] || '' },
        { id: 'diaSemana', label: 'Día semana', type: 'select', options: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'], value: record.diaSemana || 'Lunes' },
        { id: 'activo', label: 'Estado', type: 'select', options: ['SI', 'NO'], value: record.activo === false ? 'NO' : 'SI' },
        { id: 'horaApertura', label: 'Hora apertura', type: 'time', value: record.horaApertura || '' },
        { id: 'horaCierre', label: 'Hora cierre', type: 'time', value: record.horaCierre || '' },
        { id: 'permiteTrasnoche', label: 'Permite trasnoche', type: 'select', options: ['SI', 'NO'], value: record.permiteTrasnoche ? 'SI' : 'NO' },
      ],
    };
  }

  if (type === 'horariosEspeciales') {
    return {
      eyebrow: 'Horario especial',
      title: mode === 'create' ? 'Nuevo horario especial' : 'Editar horario especial',
      subtitle: 'Prioriza esta configuración sobre el horario base cuando la fecha coincida.',
      saveAction: 'GuardarHorarioEspecialLocalAdmin',
      deleteAction: 'EliminarHorarioEspecialLocalAdmin',
      fields: [
        { id: 'fecha', label: 'Fecha', type: 'date', value: record.fecha || '' },
        { id: 'local', label: 'Local', type: 'select', options: localOptions, value: record.local || localOptions[0] || '' },
        { id: 'nombreEvento', label: 'Nombre evento', type: 'text', value: record.nombreEvento || '' },
        { id: 'tipoEspecial', label: 'Tipo especial', type: 'select', options: TIPO_ESPECIAL_OPTIONS, value: record.tipoEspecial || 'Evento' },
        { id: 'horaApertura', label: 'Hora apertura', type: 'time', value: record.horaApertura || '' },
        { id: 'horaCierre', label: 'Hora cierre', type: 'time', value: record.horaCierre || '' },
        { id: 'permiteTrasnoche', label: 'Permite trasnoche', type: 'select', options: ['SI', 'NO'], value: record.permiteTrasnoche ? 'SI' : 'NO' },
        { id: 'activo', label: 'Activo', type: 'select', options: ['SI', 'NO'], value: record.activo === false ? 'NO' : 'SI' },
        { id: 'observaciones', label: 'Observaciones', type: 'textarea', value: record.observaciones || '', span: 2 },
      ],
    };
  }

  return {
    eyebrow: 'Feriados',
    title: mode === 'create' ? 'Nuevo feriado' : 'Editar feriado',
    subtitle: 'Mantén visible la fecha especial y clasifícala según su tipo de feriado.',
    saveAction: 'GuardarFeriadoAdmin',
    deleteAction: 'EliminarFeriadoAdmin',
    fields: [
      { id: 'fecha', label: 'Fecha', type: 'date', value: record.fecha || '' },
      { id: 'festividad', label: 'Festividad', type: 'text', value: record.festividad || '' },
      { id: 'tipoFeriado', label: 'Tipo de feriado', type: 'select', options: TIPO_FERIADO_OPTIONS, value: record.tipoFeriado || TIPO_FERIADO_OPTIONS[0] },
    ],
  };
}

function renderField(field) {
  const defaultSpanClass = field.span === 2 ? 'md:col-span-2' : '';
  return renderFieldWithPrefix(field, 'scheduleField_', {
    wrapperClassName: `grid gap-sm ${defaultSpanClass}`.trim(),
  });
}

function renderFieldWithPrefix(field, prefix, options = {}) {
  const wrapper = document.createElement('label');
  wrapper.className = options.wrapperClassName || `grid gap-sm ${field.span === 2 ? 'md:col-span-2' : ''}`;

  const label = document.createElement('span');
  label.className = options.labelClassName || 'text-sm font-black uppercase tracking-[0.16em] text-neutral-muted';
  label.textContent = field.label;

  let control;
  if (field.type === 'select') {
    control = document.createElement('select');
    field.options.forEach((option) => {
      const node = document.createElement('option');
      node.value = option;
      node.textContent = option;
      control.appendChild(node);
    });
    control.value = field.value;
  } else if (field.type === 'textarea') {
    control = document.createElement('textarea');
    control.rows = 4;
    control.value = field.value;
  } else {
    control = document.createElement('input');
    control.type = field.type;
    control.value = field.value;
  }

  control.id = `${prefix}${field.id}`;
  control.dataset.fieldId = field.id;
  control.className = options.controlClassName || 'min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md text-base font-semibold text-neutral-charcoal placeholder:text-neutral-muted/80 focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30';

  wrapper.append(label, control);
  return wrapper;
}

function getBatchFieldLayoutClass(config, field) {
  const fieldIds = config.fields.map((item) => item.id);
  const isFeriado = fieldIds.includes('festividad') && fieldIds.includes('tipoFeriado');
  const isHorarioEspecial = fieldIds.includes('nombreEvento') && fieldIds.includes('tipoEspecial');

  if (isFeriado) {
    const map = {
      fecha: 'md:col-span-3 xl:col-span-3',
      festividad: 'md:col-span-5 xl:col-span-5',
      tipoFeriado: 'md:col-span-4 xl:col-span-4',
    };
    return map[field.id] || 'md:col-span-6 xl:col-span-4';
  }

  if (isHorarioEspecial) {
    const map = {
      fecha: 'md:col-span-3 xl:col-span-3',
      local: 'md:col-span-3 xl:col-span-3',
      nombreEvento: 'md:col-span-6 xl:col-span-6',
      tipoEspecial: 'md:col-span-4 xl:col-span-4',
      horaApertura: 'md:col-span-2 xl:col-span-2',
      horaCierre: 'md:col-span-2 xl:col-span-2',
      permiteTrasnoche: 'md:col-span-2 xl:col-span-2',
      activo: 'md:col-span-2 xl:col-span-2',
      observaciones: 'md:col-span-12 xl:col-span-12',
    };
    return map[field.id] || 'md:col-span-4 xl:col-span-2';
  }

  return field.span === 2 ? 'md:col-span-12 xl:col-span-12' : 'md:col-span-6 xl:col-span-4';
}

function createBatchEntryCard(config, index, seed = {}) {
  const card = document.createElement('section');
  card.className = 'rounded-3xl border border-neutral-charcoal/10 bg-white/82 p-lg md:p-xl';
  card.dataset.entryIndex = String(index);

  const header = document.createElement('div');
  header.className = 'mb-lg flex items-center justify-between gap-md border-b border-neutral-charcoal/8 pb-md';
  header.innerHTML = `
    <div>
      <p class="text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Registro ${index + 1}</p>
      <p class="mt-xs text-sm font-semibold text-neutral-charcoal/70">Completa esta fila antes de guardar.</p>
    </div>
  `;

  const removeButton = createButton('Quitar', {
    variant: 'secondary',
    className: 'min-h-[42px] rounded-2xl border-brand-bun/35 bg-white/92 px-lg text-neutral-charcoal hover:border-brand-bun hover:bg-brand-bun/10',
    onClick: () => {
      const container = $('scheduleBatchEntries');
      if (!container) return;
      if (container.children.length <= 1) return;
      card.remove();
      refreshBatchEntryHeaders();
    },
  });
  removeButton.dataset.removeEntry = 'true';
  header.appendChild(removeButton);

  const grid = document.createElement('div');
  grid.className = 'grid gap-md md:grid-cols-12 md:items-end';

  config.fields.forEach((field) => {
    const fieldValue = Object.prototype.hasOwnProperty.call(seed, field.id) ? seed[field.id] : field.value;
    const layoutClass = getBatchFieldLayoutClass(config, field);
    grid.appendChild(renderFieldWithPrefix(
      { ...field, value: fieldValue },
      `scheduleEntry_${index}_`,
      {
        wrapperClassName: `grid gap-xs ${layoutClass}`,
        labelClassName: 'text-[11px] font-black uppercase tracking-[0.18em] text-neutral-muted',
        controlClassName: field.type === 'textarea'
          ? 'min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/94 px-lg py-md text-base font-semibold text-neutral-charcoal placeholder:text-neutral-muted/80 focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30'
          : 'min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/94 px-lg py-md text-base font-semibold text-neutral-charcoal placeholder:text-neutral-muted/80 focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30',
      },
    ));
  });

  card.append(header, grid);
  return card;
}

function refreshBatchEntryHeaders() {
  const container = $('scheduleBatchEntries');
  if (!container) return;
  [...container.children].forEach((entry, index) => {
    entry.dataset.entryIndex = String(index);
    const eyebrow = entry.querySelector('p');
    if (eyebrow) {
      eyebrow.textContent = `Registro ${index + 1}`;
    }
    const removeButton = entry.querySelector('[data-remove-entry="true"]');
    if (removeButton) {
      removeButton.classList.toggle('hidden', index === 0);
      removeButton.classList.toggle('inline-flex', index > 0);
    }
  });
}

function renderBatchEntryContainer(config, seedEntries = [{}]) {
  const formGrid = $('scheduleFormGrid');
  formGrid.innerHTML = '';
  formGrid.className = 'grid gap-lg';

  const wrapper = document.createElement('div');
  wrapper.className = 'grid w-full gap-lg';

  const container = document.createElement('div');
  container.id = 'scheduleBatchEntries';
  container.className = 'grid gap-lg';
  seedEntries.forEach((entry, index) => {
    container.appendChild(createBatchEntryCard(config, index, entry));
  });
  refreshBatchEntryHeaders();

  const addButtonWrap = document.createElement('div');
  addButtonWrap.className = 'flex justify-start';
  addButtonWrap.appendChild(createButton('Agregar otro', {
    variant: 'secondary',
    className: 'min-h-[46px] rounded-2xl border-brand-bun/35 bg-white/92 px-xl text-neutral-charcoal hover:border-brand-bun hover:bg-brand-bun/10',
    onClick: () => {
      const nextIndex = container.children.length;
      container.appendChild(createBatchEntryCard(config, nextIndex));
      refreshBatchEntryHeaders();
      syncScheduleModalFields();
    },
  }));

  wrapper.append(container, addButtonWrap);
  formGrid.appendChild(wrapper);
}

function collectBatchEntries() {
  const container = $('scheduleBatchEntries');
  if (!container) return [];

  return [...container.children].map((entry, index) => {
    const payload = {};
    modalRuntime.config.fields.forEach((field) => {
      const node = entry.querySelector(`#scheduleEntry_${index}_${field.id}`);
      if (node) payload[field.id] = node.value;
    });
    return payload;
  });
}

function openModal(type, mode, record = null) {
  const modal = $('scheduleModal');
  const config = getModalConfig(type, mode, record || {});
  const formGrid = $('scheduleFormGrid');
  formGrid.innerHTML = '';
  formGrid.className = modalRuntime.batchEnabled ? 'grid gap-lg' : 'grid gap-lg md:grid-cols-2';
  modalRuntime.config = config;
  modalRuntime.batchEnabled = isBatchCreateMode(type, mode);

  $('modalEyebrow').textContent = config.eyebrow;
  $('modalTitle').textContent = config.title;
  $('modalSubtitle').textContent = config.subtitle;

  formGrid.className = modalRuntime.batchEnabled ? 'grid gap-lg' : 'grid gap-lg md:grid-cols-2';

  if (modalRuntime.batchEnabled) {
    renderBatchEntryContainer(config);
  } else {
    config.fields.forEach((field) => {
      formGrid.appendChild(renderField(field));
    });
  }

  const deleteButton = $('btnDeleteSchedule');
  deleteButton.classList.toggle('hidden', mode === 'create');
  deleteButton.classList.toggle('inline-flex', mode !== 'create');

  modal.dataset.type = type;
  modal.dataset.mode = mode;
  modal.dataset.rowNumber = record && record.rowNumber ? String(record.rowNumber) : '';
  modal.dataset.saveAction = config.saveAction;
  modal.dataset.deleteAction = config.deleteAction;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  syncScheduleModalFields();
}

function closeModal() {
  const modal = $('scheduleModal');
  setModalLoading(false);
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  modal.dataset.type = '';
  modal.dataset.mode = '';
  modal.dataset.rowNumber = '';
  modalRuntime.config = null;
  modalRuntime.batchEnabled = false;
}

function createDataTable(columns, rows) {
  const table = document.createElement('div');
  table.className = 'overflow-x-auto';

  const inner = document.createElement('table');
  inner.className = 'min-w-full divide-y divide-neutral-charcoal/8';

  const thead = document.createElement('thead');
  thead.className = 'bg-brand-cheese/18';
  const headerRow = document.createElement('tr');
  columns.forEach((column) => {
    const th = document.createElement('th');
    th.className = 'px-lg py-md text-left text-xs font-black uppercase tracking-[0.18em] text-neutral-muted';
    th.textContent = column.label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement('tbody');
  tbody.className = 'divide-y divide-neutral-charcoal/8 bg-white/82';

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.className = 'align-top';
    columns.forEach((column) => {
      const td = document.createElement('td');
      td.className = 'px-lg py-md text-sm font-semibold text-neutral-charcoal';
      const rendered = typeof column.render === 'function' ? column.render(row) : row[column.key];
      if (rendered instanceof HTMLElement) {
        td.appendChild(rendered);
      } else {
        td.innerHTML = rendered == null || rendered === '' ? '<span class="text-neutral-muted">-</span>' : String(rendered);
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  if (!rows.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = columns.length;
    td.className = 'px-lg py-xl text-center text-sm font-bold text-neutral-muted';
    td.textContent = 'No hay registros cargados todavía.';
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  inner.append(thead, tbody);
  table.appendChild(inner);
  return table;
}

function createActionCell(type, record) {
  const wrap = document.createElement('div');
  wrap.className = 'flex gap-sm';
  wrap.append(
    createButton('Editar', {
      variant: 'secondary',
      size: 'sm',
      className: 'rounded-full border-brand-bun/45 bg-white/92 px-lg text-neutral-charcoal hover:border-brand-bun hover:bg-brand-bun/10',
      onClick: () => openModal(type, 'edit', record),
    }),
  );
  return wrap;
}

function renderIconCircle(symbol, tone = 'violet') {
  const tones = {
    violet: 'bg-indigo-500/10 text-indigo-600',
    green: 'bg-brand-lettuce/10 text-brand-lettuce',
    neutral: 'bg-neutral-charcoal/6 text-neutral-charcoal/60',
  };
  return `<span class="grid size-11 place-items-center rounded-full ${tones[tone] || tones.violet} text-lg font-black">${symbol}</span>`;
}

function createHorarioRow(day, local) {
  const horario = getHorarioDisplay(day);
  const trasnoche = getTrasnocheDisplay(day);
  const isOpen = isDayOpen(day);
  const tr = document.createElement('tr');
  tr.className = 'align-middle';
  tr.innerHTML = `
    <td class="px-lg py-lg text-lg font-black text-neutral-charcoal">${escapeHtml(day.diaSemana)}</td>
    <td class="px-lg py-lg">${getStatusBadge(isOpen)}</td>
    <td class="px-lg py-lg">
      <div class="flex items-center gap-md">
        ${renderIconCircle('◷', isOpen ? 'violet' : 'neutral')}
        <div>
          <p class="text-lg font-black tracking-[-0.03em] text-neutral-charcoal">${escapeHtml(horario.value)}</p>
          <p class="text-sm font-semibold text-neutral-muted">${escapeHtml(horario.helper)}</p>
        </div>
      </div>
    </td>
    <td class="px-lg py-lg">
      <div class="flex items-center gap-md">
        ${renderIconCircle('☾', isOpen && day.permiteTrasnoche ? 'green' : 'neutral')}
        <div>
          <p class="text-lg font-black tracking-[-0.03em] text-neutral-charcoal">${escapeHtml(trasnoche.value)}</p>
          <div class="mt-xs text-sm font-semibold text-neutral-muted">${trasnoche.badge || escapeHtml(trasnoche.helper || ' ')}</div>
        </div>
      </div>
    </td>
    <td class="px-lg py-lg">
      <div class="flex justify-end">
        <div data-action-slot></div>
      </div>
    </td>
  `;

  const actionSlot = tr.querySelector('[data-action-slot]');
  actionSlot.appendChild(createButton('Editar', {
    variant: 'secondary',
    className: 'min-h-[46px] rounded-2xl border-brand-bun/45 bg-white/92 px-xl text-neutral-charcoal hover:border-brand-bun hover:bg-brand-bun/10',
    onClick: () => openModal('horarioLocales', 'edit', day),
  }));
  return tr;
}

function renderHorarioLocalesAccordion() {
  const target = $('horarioLocalesTable');
  target.innerHTML = '';
  target.className = 'mt-xl grid gap-lg';
  const groupedRows = groupHorarioLocalesByLocal(state.horarioLocales);
  const sections = [];

  groupedRows.forEach((group) => {
    const section = createAccordionSection({
      id: `horario-local-${normalizeText(group.local).replace(/\s+/g, '-')}`,
      title: group.local,
      subtitle: 'Configuración de horarios semanales',
      badgeText: String(group.days.length),
      open: false,
    });

    const panelLayout = document.createElement('div');
    panelLayout.className = 'grid gap-lg';
    const tableWrap = document.createElement('div');
    tableWrap.className = 'overflow-hidden rounded-3xl border border-neutral-charcoal/10 bg-white/92 shadow-brand-sm';

    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-neutral-charcoal/8';
    table.innerHTML = `
      <thead class="bg-brand-cheese/10">
        <tr>
          <th class="px-lg py-lg text-left text-sm font-black text-neutral-muted">Días</th>
          <th class="px-lg py-lg text-left text-sm font-black text-neutral-muted">Estado</th>
          <th class="px-lg py-lg text-left text-sm font-black text-neutral-muted">Horario de atención</th>
          <th class="px-lg py-lg text-left text-sm font-black text-neutral-muted">Permite trasnoche</th>
          <th class="px-lg py-lg text-right text-sm font-black text-neutral-muted">Acciones</th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');
    tbody.className = 'divide-y divide-neutral-charcoal/8 bg-white/88';
    group.days.forEach((day) => {
      tbody.appendChild(createHorarioRow(day, group.local));
    });
    table.appendChild(tbody);
    tableWrap.appendChild(table);

    panelLayout.appendChild(tableWrap);
    section.panel.appendChild(panelLayout);
    target.appendChild(section.element);
    sections.push(section);
  });

  sections.forEach((section) => {
    section.bindToggle(() => {
      const nextOpen = !section.isOpen();
      sections.forEach((candidate) => candidate.setOpen(false));
      section.setOpen(nextOpen);
    });
  });

  if (!sections.length) {
    const empty = document.createElement('div');
    empty.className = 'rounded-3xl border border-neutral-charcoal/10 bg-white/90 px-xl py-xl text-sm font-bold text-neutral-muted';
    empty.textContent = 'No hay registros cargados todavía.';
    target.appendChild(empty);
  }
}

function syncScheduleModalFields() {
  const modal = $('scheduleModal');
  if (!modal || modal.classList.contains('hidden')) return;

  const entryRoots = modalRuntime.batchEnabled
    ? [...(($('scheduleBatchEntries') && $('scheduleBatchEntries').children) || [])]
    : [modal];

  entryRoots.forEach((root, index) => {
    const prefix = modalRuntime.batchEnabled ? `scheduleEntry_${index}_` : 'scheduleField_';
    const activoField = root.querySelector ? root.querySelector(`#${prefix}activo`) : null;
    const horaAperturaField = root.querySelector ? root.querySelector(`#${prefix}horaApertura`) : null;
    const horaCierreField = root.querySelector ? root.querySelector(`#${prefix}horaCierre`) : null;
    const trasnocheField = root.querySelector ? root.querySelector(`#${prefix}permiteTrasnoche`) : null;
    const tipoEspecialField = root.querySelector ? root.querySelector(`#${prefix}tipoEspecial`) : null;

    if (modal.dataset.type === 'horarioLocales' && activoField) {
      const isClosed = activoField.value === 'NO';
      [horaAperturaField, horaCierreField].forEach((field) => {
        if (!field) return;
        field.disabled = isClosed;
        if (isClosed) field.value = '';
      });
      if (trasnocheField) {
        trasnocheField.disabled = isClosed;
        if (isClosed) trasnocheField.value = 'NO';
      }
    }

    if (modal.dataset.type === 'horariosEspeciales' && tipoEspecialField) {
      const isClosure = tipoEspecialField.value === 'Cerrado';
      [horaAperturaField, horaCierreField].forEach((field) => {
        if (!field) return;
        field.disabled = isClosure;
        if (isClosure) field.value = '';
      });
      if (trasnocheField) {
        trasnocheField.disabled = isClosure;
        if (isClosure) trasnocheField.value = 'NO';
      }
    }
  });
}

function renderHorarioLocales() {
  renderHorarioLocalesAccordion();
  $('horarioLocalesCount').textContent = `${state.horarioLocales.length} registros en la hoja HorarioLocales.`;
}

function renderHorariosEspeciales() {
  const target = $('horariosEspecialesTable');
  target.innerHTML = '';
  target.appendChild(createDataTable([
    { label: 'Fecha', key: 'fecha' },
    { label: 'Local', key: 'local' },
    { label: 'Evento', key: 'nombreEvento' },
    { label: 'Tipo', key: 'tipoEspecial' },
    { label: 'Apertura', key: 'horaApertura' },
    { label: 'Cierre', key: 'horaCierre' },
    { label: 'Activo', render: (row) => boolLabel(row.activo) },
    { label: 'Acción', render: (row) => createActionCell('horariosEspeciales', row) },
  ], state.horariosEspeciales));
  $('horariosEspecialesCount').textContent = `${state.horariosEspeciales.length} registros en la hoja HorarioEspecialLocales.`;
}

function renderFeriados() {
  const target = $('feriadosTable');
  target.innerHTML = '';
  target.appendChild(createDataTable([
    { label: 'Fecha', key: 'fecha' },
    { label: 'Festividad', key: 'festividad' },
    { label: 'Tipo de feriado', key: 'tipoFeriado' },
    { label: 'Acción', render: (row) => createActionCell('feriados', row) },
  ], state.feriados));
  $('feriadosCount').textContent = `${state.feriados.length} registros en la hoja Feriados.`;
}

function renderShell() {
  const app = $('app');
  app.innerHTML = '';

  const shell = document.createElement('div');
  shell.className = 'mx-auto flex min-h-screen w-full max-w-[1380px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl';

  const sessionStatus = document.createElement('div');
  sessionStatus.className = 'rounded-2xl border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-lg text-sm font-black leading-relaxed text-neutral-cream';
  sessionStatus.textContent = `${state.session.displayName || state.session.role} · ${state.session.role}`;

  const sideActions = document.createElement('div');
  sideActions.className = 'grid gap-md';
  sideActions.append(
    createButton('Volver a administración', {
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
    badge: 'La Victoria · Horarios locales',
    title: 'Horarios y feriados',
    lead: 'Administra la operación base de cada local, las excepciones por fecha y el calendario de feriados desde una misma vista.',
    sideTitle: 'Sesión y control',
    sideStatus: sessionStatus,
    sideCopy: 'Cada cambio se escribe directamente en las hojas HorarioLocales, HorarioEspecialLocales y Feriados del entorno activo.',
    sideActions,
    titleClassName: 'max-w-[11ch] text-[clamp(40px,5vw,68px)]',
    leadClassName: 'max-w-[68ch]',
    sideClassName: 'lg:w-[340px]',
  });

  const horarioLocalesSection = createTableSection({
    eyebrow: 'HorarioLocales',
    title: 'Horario base por local',
    body: 'Define la franja habitual por día de la semana. Esta configuración alimenta la referencia operativa normal.',
    tableId: 'horarioLocalesTable',
    countId: 'horarioLocalesCount',
    showAddAction: false,
  });

  const horariosEspecialesSection = createTableSection({
    eyebrow: 'HorarioEspecialLocales',
    title: 'Horarios especiales',
    body: 'Usa esta capa para fechas excepcionales: apertura distinta, cierre especial o eventos por local.',
    addLabel: 'Nuevo horario especial',
    tableId: 'horariosEspecialesTable',
    countId: 'horariosEspecialesCount',
    onAdd: () => openModal('horariosEspeciales', 'create'),
  });

  const feriadosSection = createTableSection({
    eyebrow: 'Feriados',
    title: 'Calendario de feriados',
    body: 'Registra festividades y clasifícalas por tipo para mantener el calendario operativo al día.',
    addLabel: 'Nuevo feriado',
    tableId: 'feriadosTable',
    countId: 'feriadosCount',
    onAdd: () => openModal('feriados', 'create'),
  });

  shell.append(hero, horarioLocalesSection, horariosEspecialesSection, feriadosSection);
  app.appendChild(shell);
}

async function loadData() {
  const response = await window.LVAuth.apiGet({ accion: 'BootstrapAdministracionHorarios' });
  if (response.status !== 'SUCCESS') {
    throw new Error(response.mensaje || 'No se pudo cargar la administración de horarios.');
  }

  state.locals = Array.isArray(response.meta && response.meta.locals) ? response.meta.locals : [];
  state.horarioLocales = Array.isArray(response.horarioLocales) ? sortHorarioLocales(response.horarioLocales) : [];
  state.horariosEspeciales = Array.isArray(response.horariosEspeciales) ? response.horariosEspeciales : [];
  state.feriados = Array.isArray(response.feriados) ? response.feriados : [];
}

function renderData() {
  renderHorarioLocales();
  renderHorariosEspeciales();
  renderFeriados();
}

async function saveModalData(event) {
  event.preventDefault();

  const modal = $('scheduleModal');
  const rowNumber = Number(modal.dataset.rowNumber || 0);
  const payloads = modalRuntime.batchEnabled
    ? collectBatchEntries().map((entry) => ({ accion: modal.dataset.saveAction, ...entry }))
    : [(() => {
        const payload = { accion: modal.dataset.saveAction };
        if (rowNumber) payload.rowNumber = rowNumber;
        ['local', 'diaSemana', 'horaApertura', 'horaCierre', 'permiteTrasnoche', 'activo', 'fecha', 'nombreEvento', 'tipoEspecial', 'observaciones', 'nombre', 'festividad', 'tipoFeriado']
          .forEach((fieldId) => {
            const node = document.getElementById(`scheduleField_${fieldId}`);
            if (node) payload[fieldId] = node.value;
          });
        return payload;
      })()];

  setModalLoading(true, 'Guardando cambios...', 'Estamos aplicando la actualización en la hoja correspondiente. Este proceso puede tardar unos segundos.');
  overlay.setLoading(true, 'Guardando cambios...', 'Estamos actualizando la hoja correspondiente en el entorno activo.');
  await waitNextFrame();

  try {
    for (const payload of payloads) {
      const response = await window.LVAuth.apiPost(payload);
      if (response.status !== 'SUCCESS') {
        throw new Error(response.mensaje || 'No se pudo guardar el registro.');
      }
    }
    await loadData();
    renderData();
    closeModal();
    toast.show('success', payloads.length > 1 ? 'Registros guardados correctamente.' : 'Cambios guardados correctamente.');
  } catch (error) {
    toast.show('error', error.message || 'No se pudo guardar el registro.');
  } finally {
    setModalLoading(false);
    overlay.setLoading(false);
  }
}

async function deleteModalData() {
  const modal = $('scheduleModal');
  const rowNumber = Number(modal.dataset.rowNumber || 0);
  if (!rowNumber) return;

  setModalLoading(true, 'Eliminando registro...', 'Estamos aplicando el cambio en la hoja correspondiente. Espera a que el sistema confirme la eliminación.');
  overlay.setLoading(true, 'Eliminando registro...', 'Estamos aplicando el cambio en la hoja correspondiente.');
  await waitNextFrame();

  try {
    const response = await window.LVAuth.apiPost({
      accion: modal.dataset.deleteAction,
      rowNumber,
    });
    if (response.status !== 'SUCCESS') {
      throw new Error(response.mensaje || 'No se pudo eliminar el registro.');
    }
    await loadData();
    renderData();
    closeModal();
    toast.show('success', response.mensaje || 'Registro eliminado.');
  } catch (error) {
    toast.show('error', error.message || 'No se pudo eliminar el registro.');
  } finally {
    setModalLoading(false);
    overlay.setLoading(false);
  }
}

function bindModal() {
  $('btnCloseScheduleModal').addEventListener('click', () => {
    if ($('scheduleModal').dataset.loading === 'true') return;
    closeModal();
  });
  $('btnCancelSchedule').addEventListener('click', () => {
    if ($('scheduleModal').dataset.loading === 'true') return;
    closeModal();
  });
  $('btnDeleteSchedule').addEventListener('click', deleteModalData);
  $('scheduleForm').addEventListener('submit', saveModalData);
  $('scheduleModal').querySelector('[data-modal-backdrop]').addEventListener('click', () => {
    if ($('scheduleModal').dataset.loading === 'true') return;
    closeModal();
  });
  document.addEventListener('change', (event) => {
    if (
      event.target &&
      (event.target.id === 'scheduleField_activo' || event.target.id === 'scheduleField_tipoEspecial')
    ) {
      syncScheduleModalFields();
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  createModal();
  bindModal();
  createPageSkeleton({ mountNode: $('app') });
  overlay.setLoading(
    true,
    'Validando sesión...',
    'Estamos cargando horarios, especiales y feriados del entorno activo.'
  );

  try {
    state.session = await window.LVAuth.protectPage([window.LVAuth.roles.ADMINISTRADOR]);
    if (!state.session) return;
    await loadData();
    renderShell();
    renderData();
  } finally {
    overlay.setLoading(false);
  }
});
