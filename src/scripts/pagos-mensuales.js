import '../styles/globals.css';
import '../../app-config.prod.js';
import '../../app-config.staging.js';
import '../../app-config.js';
import '../../env-badge.js';
import '../../auth.js';

import { createButton } from '../components/Button.js';
import { createCard } from '../components/Card.js';
import { createInputField, createSelectField } from '../components/Input.js';
import { createLoadingOverlay } from '../components/LoadingOverlay.js';
import { createPageHero } from '../components/PageHero.js';
import { createPeriodPicker } from '../components/PeriodPicker.js';
import { createStatGrid } from '../components/StatGrid.js';
import { createToast } from '../components/Toast.js';

const currency = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const monthFormatter = new Intl.DateTimeFormat('es-CL', {
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Santiago',
});

const state = {
  session: null,
  locales: [],
  local: '',
  periodo: '',
  consulta: null,
  collaboratorInputs: new Map(),
};

const overlay = createLoadingOverlay('Procesando...');
document.body.appendChild(overlay.element);
overlay.setLoading(true, 'Validando sesión...');

const toast = createToast();
document.body.appendChild(toast.element);
const exportConfirmationModal = createExportConfirmationModal();

function waitNextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function withCurrentEnvironment(path) {
  const target = new URL(path, window.location.href);
  const env = window.APP_CONFIG && window.APP_CONFIG.ENVIRONMENT;
  if (env) {
    target.searchParams.set('env', env);
  }
  return target.toString();
}

function previousPeriod() {
  const now = new Date();
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}`;
}

function createStatusBox() {
  const box = document.createElement('div');
  box.className = 'hidden rounded-2xl border px-lg py-md text-sm font-bold leading-relaxed';
  return box;
}

function updateStatusBox(node, tone = '', message = '') {
  const toneClasses = {
    info: 'border-brand-cheese/35 bg-brand-cheese/20 text-brand-bun-dark',
    success: 'border-brand-lettuce/25 bg-brand-lettuce/10 text-brand-lettuce',
    warning: 'border-brand-bun/25 bg-brand-cheese/30 text-brand-bun-dark',
    error: 'border-brand-ketchup/25 bg-brand-ketchup/10 text-brand-ketchup',
  };

  if (!message) {
    node.className = 'hidden rounded-2xl border px-lg py-md text-sm font-bold leading-relaxed';
    node.textContent = '';
    return;
  }

  node.className = `rounded-2xl border px-lg py-md text-sm font-bold leading-relaxed ${toneClasses[tone] || toneClasses.info}`;
  node.textContent = message;
}

function formatCurrency(value) {
  return currency.format(Number(value || 0));
}

function formatMonthYearLabel(periodo) {
  const [year, month] = String(periodo || '').split('-').map(Number);
  if (!year || !month) {
    return periodo;
  }
  return monthFormatter.format(new Date(year, month - 1, 1));
}

function buildFinalRowLabel(periodo) {
  const [year, month] = String(periodo || '').split('-').map(Number);
  if (!year || !month) {
    return `Total a pagar ${periodo}`;
  }
  const monthName = new Intl.DateTimeFormat('es-CL', {
    month: 'long',
    timeZone: 'America/Santiago',
  }).format(new Date(year, month - 1, 1));
  return `Total a pagar ${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} - ${year}`;
}

function slugifyFilename(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildTable(headers, rows, options = {}) {
  const { feriadoRowChecker = null, emptyLabel = 'Sin datos.' } = options;
  const table = document.createElement('table');
  table.className = 'min-w-full divide-y divide-neutral-charcoal/10 text-left text-sm';

  const thead = document.createElement('thead');
  thead.className = 'bg-neutral-charcoal/[0.04]';
  const headRow = document.createElement('tr');
  headers.forEach((header) => {
    const th = document.createElement('th');
    th.className = 'px-md py-sm text-xs font-black uppercase tracking-[0.16em] text-neutral-muted';
    th.textContent = header;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  tbody.className = 'divide-y divide-neutral-charcoal/8';

  if (!rows.length) {
    const emptyRow = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = headers.length;
    td.className = 'px-md py-md text-sm text-neutral-muted';
    td.textContent = emptyLabel;
    emptyRow.appendChild(td);
    tbody.appendChild(emptyRow);
  } else {
    rows.forEach((row, index) => {
      const tr = document.createElement('tr');
      if (typeof feriadoRowChecker === 'function' && feriadoRowChecker(row, index)) {
        tr.className = 'bg-brand-cheese/12';
      }
      row.forEach((cell) => {
        const td = document.createElement('td');
        td.className = 'px-md py-md align-top text-sm text-neutral-charcoal/80';
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  table.appendChild(tbody);
  return table;
}

function createSectionCard(step, title, body) {
  return createCard({
    eyebrow: `Paso ${step}`,
    title,
    body,
    className: 'rounded-3xl md:p-2xl',
  });
}

function createDataCell(value, className = '') {
  const cell = document.createElement('div');
  cell.className = `rounded-2xl border border-neutral-charcoal/8 bg-white/70 px-lg py-md text-sm font-semibold text-neutral-charcoal/78 ${className}`.trim();
  cell.textContent = value;
  return cell;
}

function createSummaryPill(label, value, options = {}) {
  const { tone = 'neutral' } = options;
  const toneClass = tone === 'highlight'
    ? 'border-brand-bun/20 bg-brand-cheese/20 text-brand-bun-dark'
    : tone === 'success'
      ? 'border-brand-lettuce/20 bg-brand-lettuce/10 text-brand-lettuce'
      : 'border-neutral-charcoal/8 bg-white/74 text-neutral-charcoal/78';
  const wrapper = document.createElement('div');
  wrapper.className = `rounded-2xl border px-lg py-md ${toneClass}`;
  wrapper.innerHTML = `
    <p class="text-[11px] font-black uppercase tracking-[0.16em] opacity-70">${label}</p>
    <p class="mt-xs text-base font-black tracking-[-0.02em]">${value}</p>
  `;
  return wrapper;
}

function createAccordionToggleLabel(title, subtitle = '') {
  const box = document.createElement('div');
  box.className = 'min-w-0';
  box.innerHTML = `
    <h3 class="truncate text-xl font-black tracking-[-0.03em] text-neutral-charcoal">${title}</h3>
    <p class="mt-xs text-sm font-semibold text-neutral-charcoal/60">${subtitle}</p>
  `;
  return box;
}

function getCollaboratorInputState(colaboradorKey) {
  if (!state.collaboratorInputs.has(colaboradorKey)) {
    state.collaboratorInputs.set(colaboradorKey, {
      descuento: 0,
      descuentoObservacion: '',
      consumo: 0,
      consumoObservacion: '',
    });
  }
  return state.collaboratorInputs.get(colaboradorKey);
}

function numberInput(initialValue = '0') {
  const { wrapper, input } = createInputField({
    type: 'number',
    value: initialValue,
    placeholder: '0',
  });
  wrapper.className = 'grid gap-sm';
  input.min = '0';
  input.step = '1';
  return { wrapper, input };
}

function textInput(placeholder = '') {
  const { wrapper, input } = createInputField({
    type: 'text',
    value: '',
    placeholder,
  });
  wrapper.className = 'grid gap-sm';
  return { wrapper, input };
}

function createExportConfirmationModal() {
  const overlayNode = document.createElement('div');
  overlayNode.className = 'fixed inset-0 z-notification hidden items-center justify-center bg-neutral-charcoal/45 px-lg py-lg backdrop-blur-sm';

  const dialog = document.createElement('div');
  dialog.className = 'flex max-h-[85vh] w-full max-w-[920px] flex-col overflow-hidden rounded-3xl border border-neutral-charcoal/10 bg-neutral-paper shadow-brand';

  const head = document.createElement('div');
  head.className = 'border-b border-neutral-charcoal/10 px-xl py-lg';
  head.innerHTML = `
    <p class="text-xs font-black uppercase tracking-[0.18em] text-neutral-muted">Confirmación de exportación</p>
    <h3 class="mt-sm text-2xl font-black tracking-[-0.03em] text-neutral-charcoal">Revisa descuentos y consumos</h3>
    <p class="mt-sm text-sm font-semibold leading-7 text-neutral-charcoal/68">Antes de generar el ZIP, confirma los ajustes aplicados a cada colaborador del local seleccionado.</p>
  `;

  const body = document.createElement('div');
  body.className = 'grid gap-lg overflow-auto px-xl py-xl';

  const footer = document.createElement('div');
  footer.className = 'flex flex-col gap-md border-t border-neutral-charcoal/10 px-xl py-lg md:flex-row md:justify-end';

  const cancelButton = createButton('Cancelar', {
    variant: 'secondary',
    className: 'min-h-[52px] rounded-2xl px-xl font-black',
  });
  const confirmButton = createButton('Confirmar y exportar ZIP', {
    variant: 'primary',
    className: 'min-h-[52px] rounded-2xl px-xl font-black',
  });

  footer.append(cancelButton, confirmButton);
  dialog.append(head, body, footer);
  overlayNode.appendChild(dialog);
  document.body.appendChild(overlayNode);

  let resolver = null;

  function close(result) {
    overlayNode.classList.add('hidden');
    overlayNode.classList.remove('flex');
    body.innerHTML = '';
    if (resolver) {
      resolver(result);
      resolver = null;
    }
  }

  cancelButton.addEventListener('click', () => close(false));
  confirmButton.addEventListener('click', () => close(true));
  overlayNode.addEventListener('click', (event) => {
    if (event.target === overlayNode) {
      close(false);
    }
  });

  return {
    async open(consulta) {
      body.innerHTML = '';

      const intro = document.createElement('div');
      intro.className = 'rounded-2xl border border-brand-cheese/25 bg-brand-cheese/16 px-lg py-md text-sm font-semibold leading-7 text-brand-bun-dark';
      intro.textContent = `Se exportará 1 ZIP para ${consulta.local} con ${consulta.colaboradores.length} archivos individuales del período ${consulta.periodoLabel}.`;
      body.appendChild(intro);

      const list = document.createElement('div');
      list.className = 'grid gap-md';

      consulta.colaboradores.forEach((collaborator) => {
        const key = `${collaborator.local}|${collaborator.colaborador}`;
        const inputState = getCollaboratorInputState(key);
        const subtotal = Number(collaborator.totalPagar || 0);
        const ajustes = Number(inputState.descuento || 0) + Number(inputState.consumo || 0);
        const total = subtotal - ajustes;

        const row = document.createElement('article');
        row.className = 'rounded-2xl border border-neutral-charcoal/10 bg-white/82 px-lg py-lg';
        row.innerHTML = `
          <div class="grid gap-md lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))] lg:items-center">
            <div class="min-w-0">
              <p class="truncate text-lg font-black tracking-[-0.02em] text-neutral-charcoal">${collaborator.colaborador}</p>
              <p class="mt-xs text-sm font-semibold text-neutral-charcoal/60">${collaborator.local} · ${consulta.periodoLabel}</p>
            </div>
            <div class="rounded-2xl border border-neutral-charcoal/8 bg-neutral-charcoal/[0.03] px-md py-md text-sm font-bold text-neutral-charcoal/76">
              <span class="block text-[11px] uppercase tracking-[0.16em] opacity-60">Subtotal mes</span>
              <span class="mt-xs block text-base font-black">${formatCurrency(subtotal)}</span>
            </div>
            <div class="rounded-2xl border border-brand-bun/15 bg-brand-cheese/18 px-md py-md text-sm font-bold text-brand-bun-dark">
              <span class="block text-[11px] uppercase tracking-[0.16em] opacity-70">Ajustes mes</span>
              <span class="mt-xs block text-base font-black">${formatCurrency(-ajustes)}</span>
            </div>
            <div class="rounded-2xl border border-brand-lettuce/20 bg-brand-lettuce/10 px-md py-md text-sm font-bold text-brand-lettuce">
              <span class="block text-[11px] uppercase tracking-[0.16em] opacity-70">${buildFinalRowLabel(consulta.periodo)}</span>
              <span class="mt-xs block text-base font-black">${formatCurrency(total)}</span>
            </div>
          </div>
          <div class="mt-md grid gap-sm md:grid-cols-2">
            <div class="rounded-2xl border border-neutral-charcoal/8 bg-white/68 px-md py-md text-sm font-semibold text-neutral-charcoal/70">
              <span class="block text-[11px] uppercase tracking-[0.16em] opacity-60">Descuento</span>
              <span class="mt-xs block">${formatCurrency(inputState.descuento || 0)}${inputState.descuentoObservacion ? ` · ${inputState.descuentoObservacion}` : ''}</span>
            </div>
            <div class="rounded-2xl border border-neutral-charcoal/8 bg-white/68 px-md py-md text-sm font-semibold text-neutral-charcoal/70">
              <span class="block text-[11px] uppercase tracking-[0.16em] opacity-60">Consumo</span>
              <span class="mt-xs block">${formatCurrency(inputState.consumo || 0)}${inputState.consumoObservacion ? ` · ${inputState.consumoObservacion}` : ''}</span>
            </div>
          </div>
        `;
        list.appendChild(row);
      });

      body.appendChild(list);
      overlayNode.classList.remove('hidden');
      overlayNode.classList.add('flex');
      return new Promise((resolve) => {
        resolver = resolve;
      });
    },
  };
}

function createShell() {
  const app = document.getElementById('app');
  app.className = 'mx-auto flex min-h-screen w-full max-w-[1320px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl';

  const sessionUser = document.createElement('div');
  sessionUser.className = 'rounded-2xl border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-lg text-sm font-black leading-relaxed text-neutral-cream md:text-base';
  sessionUser.textContent = 'Validando sesión...';

  const actions = document.createElement('div');
  actions.className = 'flex flex-col gap-md';
  actions.append(
    createButton('Volver al panel', {
      variant: 'secondary',
      fullWidth: true,
      onClick: () => { window.location.href = withCurrentEnvironment('adminPanel.html'); },
    }),
    createButton('Cerrar sesión', {
      variant: 'primary',
      fullWidth: true,
      onClick: async () => {
        overlay.setLoading(true, 'Cerrando sesión...');
        await waitNextFrame();
        await window.LVAuth.logout();
        window.LVAuth.redirectToIndex();
      },
    }),
  );

  const hero = createPageHero({
    badge: 'La Victoria · Pagos mensuales',
    title: 'Exportador mensual de pagos',
    lead: 'Consulta la carga consolidada por local y período, revisa KPIs semanales y genera un ZIP con planillas individuales por colaborador usando los datos ya calculados en staging o producción.',
    highlights: createStatGrid([
      {
        label: 'Flujo',
        value: 'Consulta y exportación',
        detail: 'No recalcula nada en frontend; consume solo datos exportables ya consolidados.',
      },
      {
        label: 'Período sugerido',
        value: previousPeriod(),
        detail: 'Se propone el mes calendario anterior, pero puedes revisar cualquier mes pasado.',
      },
      {
        label: 'Salida',
        value: 'ZIP por local',
        detail: 'Incluye un `.xlsx` por colaborador con descuentos, consumos y total final del período.',
      },
    ], { tone: 'dark' }),
    sideTitle: 'Sesión y acciones',
    sideStatus: sessionUser,
    sideCopy: 'La validación se considera aprobada cuando existe una importación SUCCESS y hay datos exportables en DetalleMensualPagos para el local y período seleccionados.',
    sideActions: actions,
    layoutClassName: 'lg:gap-4xl',
    contentClassName: 'lg:basis-[68%]',
    titleClassName: 'max-w-[13ch] text-[clamp(40px,6vw,68px)]',
    leadClassName: 'max-w-[70ch]',
    sideClassName: 'lg:w-[320px]',
  });

  const content = document.createElement('section');
  content.className = 'grid gap-lg';

  app.append(hero, content);
  return { content, sessionUser };
}

function renderEmptyState(container, message) {
  container.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'rounded-3xl border border-dashed border-neutral-charcoal/15 bg-white/72 px-xl py-2xl text-center text-sm font-semibold text-neutral-muted';
  box.textContent = message;
  container.appendChild(box);
}

function createKpiCards(resumen) {
  return createStatGrid([
    {
      label: 'Ventas',
      value: String(Number(resumen.cantidadVentas || 0)),
      detail: `Venta bruta: ${formatCurrency(resumen.totalVentaBruta)}`,
    },
    {
      label: 'Propinas',
      value: String(Number(resumen.cantidadPropinas || 0)),
      detail: `Monto total: ${formatCurrency(resumen.totalPropinas)}`,
    },
    {
      label: 'Metas bajas',
      value: String(Number(resumen.diasTramoBajo || 0)),
      detail: 'Días que activaron tramo bajo de comisión.',
    },
    {
      label: 'Metas altas',
      value: String(Number(resumen.diasTramoAlto || 0)),
      detail: 'Días que activaron tramo alto de comisión.',
    },
    {
      label: 'Comisiones',
      value: formatCurrency(resumen.totalComisionesPagar),
      detail: 'Total de comisión diaria acumulada para el local.',
    },
  ], { tone: 'neutral', className: 'sm:grid-cols-2 xl:grid-cols-5' });
}

function createWeekRows(semanas) {
  return semanas.map((semana) => ([
    semana.etiqueta,
    String(Number(semana.cantidadVentas || 0)),
    formatCurrency(semana.totalVentaBruta),
    String(Number(semana.cantidadPropinas || 0)),
    formatCurrency(semana.totalPropinas),
    `${Number(semana.diasTramoBajo || 0)} / ${Number(semana.diasTramoAlto || 0)}`,
    formatCurrency(semana.totalComisionesPagar),
  ]));
}

function buildWorkbookForCollaborator(periodo, local, collaborator, inputState) {
  const workbook = XLSX.utils.book_new();
  const detailRows = collaborator.detalle || [];
  const totalPagoDiario = detailRows.reduce((total, row) => total + Number(row.pagoDiario || 0), 0);
  const totalHorasExtras = detailRows.reduce((total, row) => total + Number(row.horasExtrasDiarias || 0), 0);
  const totalComision = detailRows.reduce((total, row) => total + Number(row.comision || 0), 0);
  const totalPropina = detailRows.reduce((total, row) => total + Number(row.propina || 0), 0);
  const subtotal = detailRows.reduce((total, row) => total + Number(row.total || 0), 0);
  const descuento = Number(inputState.descuento || 0);
  const consumo = Number(inputState.consumo || 0);
  const totalPagar = subtotal - descuento - consumo;

  const rows = [
    ['Fecha Turno', 'Tipo Dia', 'Pago Diario', 'Horas Extras Diarias', 'Comisión', 'Propina', 'Total'],
    ...detailRows.map((row) => [
      row.fechaVisible,
      row.tipoDia,
      Number(row.pagoDiario || 0),
      Number(row.horasExtrasDiarias || 0),
      Number(row.comision || 0),
      Number(row.propina || 0),
      Number(row.total || 0),
    ]),
    ['Totales', '', totalPagoDiario, totalHorasExtras, totalComision, totalPropina, subtotal],
    ['Descuento', inputState.descuentoObservacion || '', '', '', '', '', descuento ? -descuento : 0],
    ['Consumo', inputState.consumoObservacion || '', '', '', '', '', consumo ? -consumo : 0],
    [buildFinalRowLabel(periodo), '', '', '', '', '', totalPagar],
  ];

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet['!cols'] = [
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 22 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
  ];

  const range = XLSX.utils.decode_range(sheet['!ref']);
  for (let col = 2; col <= 6; col += 1) {
    for (let rowIndex = 1; rowIndex <= range.e.r; rowIndex += 1) {
      const ref = XLSX.utils.encode_cell({ r: rowIndex, c: col });
      if (!sheet[ref]) continue;
      sheet[ref].z = '$#,##0';
    }
  }

  const feriadoFill = { patternType: 'solid', fgColor: { rgb: 'F7E5B9' } };
  const headerFill = { patternType: 'solid', fgColor: { rgb: 'E7D2A4' } };
  const totalFill = { patternType: 'solid', fgColor: { rgb: 'F4E9D0' } };

  for (let col = 0; col <= 6; col += 1) {
    const headerRef = XLSX.utils.encode_cell({ r: 0, c: col });
    if (sheet[headerRef]) {
      sheet[headerRef].s = {
        font: { bold: true },
        fill: headerFill,
      };
    }
  }

  detailRows.forEach((row, index) => {
    if (row.tipoDia !== 'Feriado') return;
    for (let col = 0; col <= 6; col += 1) {
      const ref = XLSX.utils.encode_cell({ r: index + 1, c: col });
      if (sheet[ref]) {
        sheet[ref].s = { fill: feriadoFill };
      }
    }
  });

  const totalStartRow = detailRows.length + 1;
  for (let rowIndex = totalStartRow; rowIndex <= totalStartRow + 3; rowIndex += 1) {
    for (let col = 0; col <= 6; col += 1) {
      const ref = XLSX.utils.encode_cell({ r: rowIndex, c: col });
      if (sheet[ref]) {
        sheet[ref].s = {
          font: { bold: rowIndex === totalStartRow || rowIndex === totalStartRow + 3 },
          fill: totalFill,
        };
      }
    }
  }

  XLSX.utils.book_append_sheet(workbook, sheet, 'Pagos');
  return workbook;
}

async function exportZipForCurrentSelection() {
  const { consulta } = state;
  if (!consulta || !consulta.validacion || !consulta.validacion.exportable) {
    toast.show('warn', 'Primero valida un período con datos exportables.');
    return;
  }

  if (!window.JSZip || !window.XLSX) {
    toast.show('error', 'Faltan las librerías necesarias para exportar ZIP/XLSX.');
    return;
  }

  const confirmed = await exportConfirmationModal.open(consulta);
  if (!confirmed) {
    return;
  }

  overlay.setLoading(true, 'Generando ZIP de pagos...');
  await waitNextFrame();

  try {
    const zip = new window.JSZip();
    const periodo = consulta.periodo;
    const local = consulta.local;
    const monthName = new Intl.DateTimeFormat('es-CL', { month: 'long', timeZone: 'America/Santiago' })
      .format(new Date(Number(periodo.slice(0, 4)), Number(periodo.slice(5, 7)) - 1, 1));

    consulta.colaboradores.forEach((collaborator) => {
      const key = `${collaborator.local}|${collaborator.colaborador}`;
      const inputState = getCollaboratorInputState(key);
      const workbook = buildWorkbookForCollaborator(periodo, local, collaborator, inputState);
      const workbookArray = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
      const fileName = `${periodo} - ${slugifyFilename(local)} - ${slugifyFilename(collaborator.colaborador)}.xlsx`;
      zip.file(fileName, workbookArray);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${periodo} - Planilla de pagos ${slugifyFilename(monthName)}.zip`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.show('success', 'ZIP generado correctamente.');
  } catch (error) {
    console.error(error);
    toast.show('error', error && error.message ? error.message : 'No se pudo generar el ZIP.');
  } finally {
    overlay.setLoading(false);
  }
}

function renderCollaborators(container, consulta) {
  container.innerHTML = '';

  if (!consulta.colaboradores.length) {
    renderEmptyState(container, 'No hay colaboradores exportables para este local y período.');
    return;
  }

  const summary = document.createElement('div');
  summary.className = 'rounded-2xl border border-brand-lettuce/20 bg-brand-lettuce/10 px-lg py-md text-sm font-bold text-brand-lettuce';
  summary.textContent = `Hay ${consulta.colaboradores.length} colaboradores con datos exportables en ${consulta.local} para ${consulta.periodoLabel}.`;
  container.appendChild(summary);

  const grid = document.createElement('div');
  grid.className = 'grid gap-lg';

  consulta.colaboradores.forEach((collaborator) => {
    const collaboratorKey = `${collaborator.local}|${collaborator.colaborador}`;
    const currentInputState = getCollaboratorInputState(collaboratorKey);
    const subtotal = collaborator.totalPagar;
    const finalTotal = () => subtotal - Number(currentInputState.descuento || 0) - Number(currentInputState.consumo || 0);
    const adjustmentsValue = () => -Number(currentInputState.descuento || 0) - Number(currentInputState.consumo || 0);

    const card = document.createElement('details');
    card.className = 'group rounded-3xl border border-neutral-charcoal/10 bg-white/88 shadow-brand open:border-brand-bun/18';

    const summaryLine = document.createElement('summary');
    summaryLine.className = 'list-none cursor-pointer p-xl';
    const summaryLayout = document.createElement('div');
    summaryLayout.className = 'grid gap-md lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))_auto] lg:items-center';

    const identity = createAccordionToggleLabel(
      collaborator.colaborador,
      `${collaborator.local} · ${consulta.periodoLabel}`,
    );
    const subtotalPill = createSummaryPill(`Subtotal ${consulta.periodoLabel}`, formatCurrency(subtotal));
    const adjustmentsPill = createSummaryPill(`Ajustes ${consulta.periodoLabel}`, formatCurrency(adjustmentsValue()), { tone: 'highlight' });
    const totalPill = createSummaryPill(buildFinalRowLabel(consulta.periodo), formatCurrency(finalTotal()), { tone: 'success' });
    const chevron = document.createElement('div');
    chevron.className = 'flex items-center justify-end text-2xl font-black text-neutral-muted transition-transform duration-200 group-open:rotate-180';
    chevron.textContent = '⌄';

    summaryLayout.append(identity, subtotalPill, adjustmentsPill, totalPill, chevron);
    summaryLine.appendChild(summaryLayout);
    card.appendChild(summaryLine);

    const body = document.createElement('div');
    body.className = 'border-t border-neutral-charcoal/8 px-xl pb-xl pt-lg';

    const totalGrid = document.createElement('div');
    totalGrid.className = 'grid gap-sm md:grid-cols-2 xl:grid-cols-6';
    totalGrid.append(
      createDataCell(`Base normal: ${formatCurrency(collaborator.totalDiasNormales)}`),
      createDataCell(`Base feriado: ${formatCurrency(collaborator.totalDiasFeriados)}`),
      createDataCell(`Horas extra: ${formatCurrency(collaborator.totalHorasExtras + collaborator.totalHorasExtrasFeriado)}`),
      createDataCell(`Comisión: ${formatCurrency(collaborator.comisionTotal)}`),
      createDataCell(`Propina: ${formatCurrency(collaborator.propinaTotal)}`),
      createDataCell(`Subtotal mes: ${formatCurrency(collaborator.totalPagar)}`, 'border-brand-bun/18 bg-brand-cheese/14'),
    );
    body.appendChild(totalGrid);

    const inputsGrid = document.createElement('div');
    inputsGrid.className = 'mt-lg grid gap-md md:grid-cols-2';

    const descuentoAmount = numberInput(String(currentInputState.descuento || 0));
    const descuentoObs = textInput('Observación opcional descuento');
    descuentoObs.input.value = currentInputState.descuentoObservacion || '';
    const consumoAmount = numberInput(String(currentInputState.consumo || 0));
    const consumoObs = textInput('Observación opcional consumo');
    consumoObs.input.value = currentInputState.consumoObservacion || '';

    const decorateLabel = (fieldWrapper, title) => {
      const label = document.createElement('span');
      label.className = 'text-xs font-black uppercase tracking-[0.16em] text-neutral-muted';
      label.textContent = title;
      fieldWrapper.prepend(label);
    };

    decorateLabel(descuentoAmount.wrapper, 'Descuento');
    decorateLabel(consumoAmount.wrapper, 'Consumo');
    decorateLabel(descuentoObs.wrapper, 'Obs. descuento');
    decorateLabel(consumoObs.wrapper, 'Obs. consumo');

    const syncInputState = () => {
      currentInputState.descuento = Number(descuentoAmount.input.value || 0);
      currentInputState.descuentoObservacion = descuentoObs.input.value || '';
      currentInputState.consumo = Number(consumoAmount.input.value || 0);
      currentInputState.consumoObservacion = consumoObs.input.value || '';
    };

    [descuentoAmount.input, descuentoObs.input, consumoAmount.input, consumoObs.input].forEach((input) => {
      input.addEventListener('input', syncInputState);
    });

    inputsGrid.append(
      descuentoAmount.wrapper,
      consumoAmount.wrapper,
    );
    body.appendChild(inputsGrid);

    const observationsGrid = document.createElement('div');
    observationsGrid.className = 'mt-md grid gap-md md:grid-cols-2';
    observationsGrid.append(
      descuentoObs.wrapper,
      consumoObs.wrapper,
    );
    body.appendChild(observationsGrid);

    const refreshFooter = () => {
      adjustmentsPill.querySelector('p:last-child').textContent = formatCurrency(adjustmentsValue());
      totalPill.querySelector('p:last-child').textContent = formatCurrency(finalTotal());
    };

    [descuentoAmount.input, consumoAmount.input].forEach((input) => {
      input.addEventListener('input', refreshFooter);
    });

    const detailAccordion = document.createElement('details');
    detailAccordion.className = 'mt-lg rounded-2xl border border-neutral-charcoal/10 bg-white/72';
    const detailSummary = document.createElement('summary');
    detailSummary.className = 'list-none cursor-pointer px-lg py-md text-sm font-black uppercase tracking-[0.16em] text-neutral-muted';
    detailSummary.textContent = 'Detalle diario';
    detailAccordion.appendChild(detailSummary);

    const detailTableWrap = document.createElement('div');
    detailTableWrap.className = 'overflow-x-auto border-t border-neutral-charcoal/8';
    detailTableWrap.appendChild(buildTable(
      ['Fecha Turno', 'Tipo Dia', 'Pago Diario', 'Horas Extras Diarias', 'Comisión', 'Propina', 'Total'],
      collaborator.detalle.map((row) => [
        row.fechaVisible,
        row.tipoDia,
        formatCurrency(row.pagoDiario),
        formatCurrency(row.horasExtrasDiarias),
        formatCurrency(row.comision),
        formatCurrency(row.propina),
        formatCurrency(row.total),
      ]),
      {
        feriadoRowChecker: (_, index) => collaborator.detalle[index]?.tipoDia === 'Feriado',
      },
    ));

    detailAccordion.appendChild(detailTableWrap);
    body.appendChild(detailAccordion);
    card.appendChild(body);
    grid.appendChild(card);
  });

  container.appendChild(grid);

  const exportActions = document.createElement('div');
  exportActions.className = 'mt-sm flex flex-col gap-md rounded-3xl border border-neutral-charcoal/10 bg-white/82 px-xl py-xl md:flex-row md:items-center md:justify-between';

  const exportCopy = document.createElement('p');
  exportCopy.className = 'text-sm font-semibold leading-7 text-neutral-charcoal/72';
  exportCopy.textContent = 'Al exportar, el sistema pedirá una confirmación final con el resumen de descuentos y consumos de todos los colaboradores del período.';

  const exportButton = createButton('Exportar ZIP del período', {
    variant: 'primary',
    className: 'min-h-[54px] rounded-2xl px-xl font-black',
    onClick: exportZipForCurrentSelection,
  });

  exportActions.append(exportCopy, exportButton);
  container.appendChild(exportActions);
}

function renderConsulta(step2Body, step3Body, consulta, step1Status, step2Status) {
  state.consulta = consulta;

  updateStatusBox(
    step1Status,
    consulta.validacion.exportable ? 'success' : 'warning',
    consulta.validacion.exportable
      ? `Importación activa ${consulta.importacionActiva.importId} validada. Hay ${consulta.validacion.totalColaboradores} colaboradores y ${consulta.validacion.totalFilasDetalle} filas exportables.`
      : consulta.validacion.motivo,
  );

  step2Body.innerHTML = '';
  step3Body.innerHTML = '';

  if (!consulta.validacion.exportable) {
    renderEmptyState(step2Body, 'No hay resumen semanal disponible porque el período aún no tiene datos exportables.');
    renderEmptyState(step3Body, 'Cuando exista un detalle mensual exportable para este local y período, aquí aparecerán los colaboradores.');
    updateStatusBox(step2Status, 'warning', 'La validación aún no permite exportar planillas.');
    return;
  }

  updateStatusBox(
    step2Status,
    'success',
    `Resumen consolidado para ${consulta.local} · ${consulta.periodoLabel}. La exportación saldrá en un ZIP por local.`,
  );

  step2Body.appendChild(createKpiCards(consulta.resumen));

  const weekCard = document.createElement('div');
  weekCard.className = 'overflow-x-auto rounded-2xl border border-neutral-charcoal/10 bg-white/88';
  weekCard.appendChild(buildTable(
    ['Semana', 'Ventas', 'Venta bruta', 'Propinas', 'Monto propinas', 'Metas (B/A)', 'Comisiones'],
    createWeekRows(consulta.semanas),
  ));
  step2Body.appendChild(weekCard);

  renderCollaborators(step3Body, consulta);
}

async function fetchPagosMensuales(step1Status, step2Status, step2Body, step3Body) {
  overlay.setLoading(true, 'Consultando datos exportables...');
  await waitNextFrame();

  try {
    const consulta = await window.LVAuth.apiGet({
      accion: 'ConsultarPagosMensuales',
      local: state.local,
      periodo: state.periodo,
    });
    renderConsulta(step2Body, step3Body, consulta, step1Status, step2Status);
  } catch (error) {
    console.error(error);
    state.consulta = null;
    updateStatusBox(step1Status, 'error', error && error.message ? error.message : 'No se pudo validar el período seleccionado.');
    updateStatusBox(step2Status, 'error', 'No fue posible cargar el resumen mensual.');
    renderEmptyState(step2Body, 'No se pudo cargar el resumen del período.');
    renderEmptyState(step3Body, 'No se pudo cargar el listado de colaboradores.');
    toast.show('error', 'Falló la consulta de pagos mensuales.');
  } finally {
    overlay.setLoading(false);
  }
}

function buildPage(shell) {
  const step1Card = createSectionCard(
    '1',
    'Validar datos exportables por local',
    'Selecciona un local y un mes pasado. El sistema revisará si existe una importación SUCCESS y si ya hay datos exportables consolidados para ese período.',
  );
  const step2Card = createSectionCard(
    '2',
    'Resumen de ventas, propinas y comisiones por semana',
    'Con la validación aprobada, aquí se muestran los KPIs principales del mes y el desglose semanal para ese local.',
  );
  const step3Card = createSectionCard(
    '3',
    'Colaboradores y exportación ZIP',
    'Desde DetalleMensualPagos se listan los colaboradores del local. Puedes completar descuentos y consumos antes de generar un ZIP con un `.xlsx` por persona.',
  );

  const step1Status = createStatusBox();
  const step2Status = createStatusBox();
  const step2Body = document.createElement('div');
  step2Body.className = 'mt-xl grid gap-lg';
  const step3Body = document.createElement('div');
  step3Body.className = 'mt-xl grid gap-lg';

  const localSelectField = createSelectField({
    label: 'Local',
    id: 'pagosLocal',
    name: 'pagosLocal',
    placeholder: 'Selecciona local',
    options: [],
  });

  const periodPicker = createPeriodPicker({
    label: 'Período mensual',
    scopeLabel: 'Alcance',
    initialType: 'mensual',
    types: ['mensual'],
    initialValues: { monthly: state.periodo || previousPeriod() },
    showResolvedRange: true,
    onChange: (value) => {
      state.periodo = value.period;
    },
  });

  const validateButton = createButton('Validar datos exportables', {
    variant: 'primary',
    className: 'min-h-[54px] rounded-2xl px-xl font-black',
    onClick: () => fetchPagosMensuales(step1Status, step2Status, step2Body, step3Body),
  });

  const formGrid = document.createElement('div');
  formGrid.className = 'mt-xl grid gap-lg xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)]';

  const leftColumn = document.createElement('div');
  leftColumn.className = 'grid gap-lg';
  leftColumn.append(localSelectField.wrapper, validateButton, step1Status);

  const rightColumn = document.createElement('div');
  rightColumn.className = 'grid gap-lg';
  rightColumn.appendChild(periodPicker.element);

  formGrid.append(leftColumn, rightColumn);
  step1Card.appendChild(formGrid);

  step2Card.append(step2Status, step2Body);
  step3Card.appendChild(step3Body);

  shell.content.append(step1Card, step2Card, step3Card);

  localSelectField.onChange((value) => {
    state.local = value;
  });

  return { localSelectField, periodPicker, step1Status, step2Status, step2Body, step3Body };
}

async function bootstrap() {
  const shell = createShell();
  const page = buildPage(shell);

  const session = await window.LVAuth.protectPage(['Administrador']);
  if (!session) return;
  state.session = session;
  shell.sessionUser.textContent = `${session.displayName || 'Administrador'} · ${session.role}`;

  try {
    const response = await window.LVAuth.apiGet({ accion: 'LocalesPagosMensuales' });
    state.locales = Array.isArray(response.locales) ? response.locales : [];
    state.periodo = response.periodoSugerido || previousPeriod();
    page.localSelectField.setPlaceholder('Selecciona local');
    page.localSelectField.setOptions(state.locales.map((local) => ({ value: local, label: local })));
    if (state.locales.length) {
      state.local = state.locales[0];
      page.localSelectField.setValue(state.local);
    }
    page.periodPicker.setValue('mensual', state.periodo);
    updateStatusBox(page.step1Status, 'info', `Período sugerido: ${state.periodo}. Selecciona local y valida para continuar.`);
    renderEmptyState(page.step2Body, 'Valida primero un local y período para ver el resumen semanal.');
    renderEmptyState(page.step3Body, 'Valida primero un local y período para listar colaboradores exportables.');
  } catch (error) {
    console.error(error);
    updateStatusBox(page.step1Status, 'error', 'No se pudieron cargar los locales disponibles desde RRHH.');
    renderEmptyState(page.step2Body, 'No se pudo iniciar la pantalla.');
    renderEmptyState(page.step3Body, 'No se pudo iniciar la pantalla.');
  } finally {
    overlay.setLoading(false);
  }
}

document.addEventListener('DOMContentLoaded', bootstrap);
