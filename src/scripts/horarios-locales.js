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

function normalizeLocalOptions() {
  return state.locals.length ? state.locals : ['Paseo del Lago', 'Segunda Faja'];
}

function createTableSection({ eyebrow, title, body, addLabel, tableId, countId, onAdd }) {
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

  header.append(count, createButton(addLabel, {
    variant: 'primary',
    className: 'min-h-[48px] rounded-full px-xl',
    onClick: onAdd,
  }));

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
    <div class="relative z-[1] max-h-[92vh] w-full max-w-[860px] overflow-auto rounded-[32px] border border-neutral-charcoal/12 bg-[#fff8ee] p-xl shadow-brand md:p-2xl">
      <div class="flex items-start justify-between gap-lg">
        <div>
          <p id="modalEyebrow" class="text-xs font-black uppercase tracking-[0.18em] text-neutral-muted">Administración</p>
          <h2 id="modalTitle" class="mt-sm text-[clamp(30px,4vw,46px)] font-black tracking-[-0.05em] text-neutral-charcoal">Editar registro</h2>
          <p id="modalSubtitle" class="mt-sm text-sm font-bold leading-7 text-neutral-muted">Actualiza los parámetros y guarda los cambios.</p>
        </div>
        <button type="button" id="btnCloseScheduleModal" class="grid size-11 place-items-center rounded-2xl border border-neutral-charcoal/10 bg-white/92 text-xl font-black text-neutral-charcoal">×</button>
      </div>
      <form id="scheduleForm" class="mt-xl grid gap-lg">
        <div id="scheduleFormGrid" class="grid gap-lg md:grid-cols-2"></div>
        <div class="grid gap-sm md:flex md:justify-between">
          <button type="button" id="btnDeleteSchedule" class="hidden min-h-[52px] items-center justify-center rounded-2xl bg-brand-ketchup px-xl py-md text-base font-black text-white">Eliminar</button>
          <div class="grid gap-sm md:flex md:justify-end">
            <button type="button" id="btnCancelSchedule" class="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-neutral-charcoal/12 bg-white/92 px-xl py-md text-base font-black text-neutral-charcoal">Cancelar</button>
            <button type="submit" id="btnSaveSchedule" class="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-brand-bun px-xl py-md text-base font-black text-neutral-charcoal transition-fast hover:bg-brand-bun-dark hover:text-neutral-cream">Guardar cambios</button>
          </div>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(root);
}

function getModalConfig(type, mode, record = {}) {
  const localOptions = normalizeLocalOptions();

  if (type === 'horarioLocales') {
    return {
      eyebrow: 'Horario base',
      title: mode === 'create' ? 'Nuevo horario base' : 'Editar horario base',
      subtitle: 'Define la apertura y cierre habitual por local y día.',
      saveAction: 'GuardarHorarioLocalAdmin',
      deleteAction: 'EliminarHorarioLocalAdmin',
      fields: [
        { id: 'local', label: 'Local', type: 'select', options: localOptions, value: record.local || localOptions[0] || '' },
        { id: 'diaSemana', label: 'Día semana', type: 'select', options: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'], value: record.diaSemana || 'Lunes' },
        { id: 'horaApertura', label: 'Hora apertura', type: 'time', value: record.horaApertura || '' },
        { id: 'horaCierre', label: 'Hora cierre', type: 'time', value: record.horaCierre || '' },
        { id: 'permiteTrasnoche', label: 'Permite trasnoche', type: 'select', options: ['SI', 'NO'], value: record.permiteTrasnoche ? 'SI' : 'NO' },
        { id: 'activo', label: 'Activo', type: 'select', options: ['SI', 'NO'], value: record.activo === false ? 'NO' : 'SI' },
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
        { id: 'tipoEspecial', label: 'Tipo especial', type: 'text', value: record.tipoEspecial || '' },
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
    subtitle: 'Mantén visible la fecha especial y su alcance por local o global.',
    saveAction: 'GuardarFeriadoAdmin',
    deleteAction: 'EliminarFeriadoAdmin',
    fields: [
      { id: 'fecha', label: 'Fecha', type: 'date', value: record.fecha || '' },
      { id: 'nombre', label: 'Nombre feriado', type: 'text', value: record.nombre || '' },
      { id: 'local', label: 'Local', type: 'select', options: ['Todos', ...localOptions], value: record.local || 'Todos' },
      { id: 'activo', label: 'Activo', type: 'select', options: ['SI', 'NO'], value: record.activo === false ? 'NO' : 'SI' },
      { id: 'observaciones', label: 'Observaciones', type: 'textarea', value: record.observaciones || '', span: 2 },
    ],
  };
}

function renderField(field) {
  const wrapper = document.createElement('label');
  wrapper.className = `grid gap-sm ${field.span === 2 ? 'md:col-span-2' : ''}`;

  const label = document.createElement('span');
  label.className = 'text-sm font-black uppercase tracking-[0.16em] text-neutral-muted';
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

  control.id = `scheduleField_${field.id}`;
  control.className = 'min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md text-base font-semibold text-neutral-charcoal placeholder:text-neutral-muted/80 focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30';

  wrapper.append(label, control);
  return wrapper;
}

function openModal(type, mode, record = null) {
  const modal = $('scheduleModal');
  const config = getModalConfig(type, mode, record || {});
  const formGrid = $('scheduleFormGrid');
  formGrid.innerHTML = '';

  $('modalEyebrow').textContent = config.eyebrow;
  $('modalTitle').textContent = config.title;
  $('modalSubtitle').textContent = config.subtitle;

  config.fields.forEach((field) => {
    formGrid.appendChild(renderField(field));
  });

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
}

function closeModal() {
  const modal = $('scheduleModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  modal.dataset.type = '';
  modal.dataset.mode = '';
  modal.dataset.rowNumber = '';
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
      className: 'rounded-full px-lg',
      onClick: () => openModal(type, 'edit', record),
    }),
  );
  return wrap;
}

function renderHorarioLocales() {
  const target = $('horarioLocalesTable');
  target.innerHTML = '';
  target.appendChild(createDataTable([
    { label: 'Local', key: 'local' },
    { label: 'Día', key: 'diaSemana' },
    { label: 'Apertura', key: 'horaApertura' },
    { label: 'Cierre', key: 'horaCierre' },
    { label: 'Trasnoche', render: (row) => boolLabel(row.permiteTrasnoche) },
    { label: 'Activo', render: (row) => boolLabel(row.activo) },
    { label: 'Acción', render: (row) => createActionCell('horarioLocales', row) },
  ], state.horarioLocales));
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
    { label: 'Nombre', key: 'nombre' },
    { label: 'Local', render: (row) => escapeHtml(row.local || 'Todos') },
    { label: 'Activo', render: (row) => boolLabel(row.activo) },
    { label: 'Observaciones', render: (row) => escapeHtml(row.observaciones || '-') },
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
    addLabel: 'Nuevo horario base',
    tableId: 'horarioLocalesTable',
    countId: 'horarioLocalesCount',
    onAdd: () => openModal('horarioLocales', 'create'),
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
    body: 'Registra feriados globales o acotados por local para mantener visible el contexto operativo.',
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
  state.horarioLocales = Array.isArray(response.horarioLocales) ? response.horarioLocales : [];
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
  const payload = { accion: modal.dataset.saveAction };
  const rowNumber = Number(modal.dataset.rowNumber || 0);
  if (rowNumber) payload.rowNumber = rowNumber;

  ['local', 'diaSemana', 'horaApertura', 'horaCierre', 'permiteTrasnoche', 'activo', 'fecha', 'nombreEvento', 'tipoEspecial', 'observaciones', 'nombre']
    .forEach((fieldId) => {
      const node = document.getElementById(`scheduleField_${fieldId}`);
      if (node) payload[fieldId] = node.value;
    });

  overlay.setLoading(true, 'Guardando cambios...', 'Estamos actualizando la hoja correspondiente en el entorno activo.');
  await waitNextFrame();

  try {
    const response = await window.LVAuth.apiPost(payload);
    if (response.status !== 'SUCCESS') {
      throw new Error(response.mensaje || 'No se pudo guardar el registro.');
    }
    await loadData();
    renderData();
    closeModal();
    toast.show('success', response.mensaje || 'Cambios guardados correctamente.');
  } catch (error) {
    toast.show('error', error.message || 'No se pudo guardar el registro.');
  } finally {
    overlay.setLoading(false);
  }
}

async function deleteModalData() {
  const modal = $('scheduleModal');
  const rowNumber = Number(modal.dataset.rowNumber || 0);
  if (!rowNumber) return;

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
    overlay.setLoading(false);
  }
}

function bindModal() {
  $('btnCloseScheduleModal').addEventListener('click', closeModal);
  $('btnCancelSchedule').addEventListener('click', closeModal);
  $('btnDeleteSchedule').addEventListener('click', deleteModalData);
  $('scheduleForm').addEventListener('submit', saveModalData);
  $('scheduleModal').querySelector('[data-modal-backdrop]').addEventListener('click', closeModal);
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
