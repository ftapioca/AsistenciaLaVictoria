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
import { createPeriodPicker } from '../components/PeriodPicker.js';
import { createToast } from '../components/Toast.js';

const $ = (id) => document.getElementById(id);
const currency = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

let currentPayload = null;
let currentSourceFileName = '';

const overlay = createLoadingOverlay('Procesando...');
document.body.appendChild(overlay.element);
overlay.setLoading(true, 'Validando sesión...');

const toast = createToast();
document.body.appendChild(toast.element);

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

function formatJson(value) {
  return JSON.stringify(value, null, 2);
}

function formatDateIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateDisplay(isoDate) {
  const [year, month, day] = String(isoDate || '').split('-').map(Number);
  if (!year || !month || !day) return '-';
  return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
}

function updateStatusBox(node, tone = '', message = '') {
  if (!node) return;

  const toneClasses = {
    info: 'border-brand-cheese/35 bg-brand-cheese/20 text-brand-bun-dark',
    success: 'border-brand-lettuce/25 bg-brand-lettuce/10 text-brand-lettuce',
    warning: 'border-brand-bun/25 bg-brand-cheese/30 text-brand-bun-dark',
    error: 'border-brand-ketchup/25 bg-brand-ketchup/10 text-brand-ketchup',
  };

  if (!message) {
    node.className = 'hidden';
    node.textContent = '';
    return;
  }

  node.className = `rounded-2xl border px-lg py-md text-sm font-bold leading-relaxed ${toneClasses[tone] || toneClasses.info}`;
  node.textContent = message;
}

function createField(label, control, options = {}) {
  const { hint = '', className = '' } = options;
  const wrapper = document.createElement('label');
  wrapper.className = `grid gap-sm ${className}`.trim();

  const title = document.createElement('span');
  title.className = 'text-sm font-black uppercase tracking-[0.16em] text-neutral-muted';
  title.textContent = label;
  wrapper.appendChild(title);

  wrapper.appendChild(control);

  if (hint) {
    const hintNode = document.createElement('small');
    hintNode.className = 'text-sm leading-6 text-neutral-muted';
    hintNode.textContent = hint;
    wrapper.appendChild(hintNode);
  }

  return wrapper;
}

function createReadonlyBox(initialText) {
  const box = document.createElement('div');
  box.className = 'flex min-h-[54px] items-center rounded-2xl border border-neutral-charcoal/10 bg-neutral-charcoal/4 px-lg py-md text-base font-bold text-neutral-charcoal/78';
  box.textContent = initialText;
  return box;
}

function createPreviewBlock(title, id, initialText) {
  const block = document.createElement('section');
  block.className = 'rounded-2xl border border-neutral-charcoal/10 bg-white/72 p-lg shadow-none';
  block.innerHTML = `
    <p class="mb-md text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">${title}</p>
    <pre id="${id}" class="overflow-auto whitespace-pre-wrap break-words rounded-xl bg-neutral-charcoal/[0.03] p-md text-xs leading-6 text-neutral-charcoal"></pre>
  `;
  block.querySelector('pre').textContent = initialText;
  return block;
}

function createStatCard(label, id, initialText) {
  const stat = document.createElement('div');
  stat.className = 'rounded-2xl border border-neutral-charcoal/10 bg-white/78 p-lg shadow-none';
  stat.innerHTML = `
    <strong id="${id}" class="block text-3xl font-black tracking-[-0.04em] text-neutral-charcoal">${initialText}</strong>
    <span class="mt-sm block text-sm font-bold text-neutral-muted">${label}</span>
  `;
  return stat;
}

function getExamplePayload() {
  return {
    metadata: {
      nombreArchivo: 'ejemplo-ventas-junio.json',
      observaciones: 'Payload de ejemplo para staging',
    },
    ventas: [
      {
        ventaId: 'EX-001',
        fecha: '2026-06-01',
        hora: '12:04:00',
        fechaCierre: '2026-06-01 12:09:00',
        local: 'Paseo del Lago',
        estado: 'PAGADA',
        origen: 'POS',
        tipoVenta: 'SALON',
        medioPago: 'DEBITO',
        totalBruto: 12500,
        esDelivery: false,
        esCancelada: false,
        esValidaComision: true,
        motivoExclusion: '',
      },
      {
        ventaId: 'EX-002',
        fecha: '2026-06-01',
        hora: '13:18:00',
        fechaCierre: '2026-06-01 13:22:00',
        local: 'Paseo del Lago',
        estado: 'ANULADA',
        origen: 'POS',
        tipoVenta: 'DELIVERY',
        medioPago: 'EFECTIVO',
        totalBruto: 8800,
        esDelivery: true,
        esCancelada: true,
        esValidaComision: false,
        motivoExclusion: 'Venta anulada',
      },
    ],
    propinas: [
      {
        ventaId: 'EX-001',
        fecha: '2026-06-01',
        hora: '12:04:00',
        local: 'Paseo del Lago',
        montoPropina: 1500,
        cancelada: false,
        esDelivery: false,
        esValidaPropina: true,
        motivoExclusion: '',
      },
    ],
  };
}

function normalizeAmount(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const text = String(value || '').trim();
  if (!text) return 0;
  const cleaned = text.replace(/\$/g, '').replace(/\s+/g, '').replace(/\./g, '').replace(',', '.');
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : 0;
}

function normalizeBoolean(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  const text = String(value).trim().toLowerCase();
  return text === 'true' || text === '1' || text === 'si' || text === 'sí' || text === 'x';
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizeHeader(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, '');
}

const POS_V1_SHEETS = {
  ventas: 'Ventas',
  propinas: 'Propinas',
};

const POS_V1_VENTAS_HEADERS = [
  'Id',
  'Fecha',
  'Creación',
  'Cerrada',
  'Caja',
  'Estado',
  'Cliente',
  'Mesa',
  'Sala',
  'Personas',
  'Camarero / Repartidor',
  'Medio de Pago',
  'Total',
  'Fiscal',
  'Tipo de Venta',
  'Comentario',
  'Origen',
  'Id. Origen',
];

const POS_V1_PROPINAS_HEADERS = [
  'Id. Venta',
  'Valor',
  'Cancelada',
  'Creado por',
];

function detectDelimiter(text) {
  const firstLine = String(text || '').split(/\r?\n/).find((line) => line.trim()) || '';
  const candidates = [',', ';', '\t'];
  let best = ',';
  let bestScore = -1;

  candidates.forEach((delimiter) => {
    const score = firstLine.split(delimiter).length;
    if (score > bestScore) {
      best = delimiter;
      bestScore = score;
    }
  });

  return best;
}

function parseDelimitedLine(line, delimiter) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parseCsvToObjects(text) {
  const delimiter = detectDelimiter(text);
  const lines = String(text || '')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');

  if (!lines.length) return [];

  const headers = parseDelimitedLine(lines[0], delimiter).map((header) => String(header || '').trim());
  return lines.slice(1).map((line) => {
    const cells = parseDelimitedLine(line, delimiter);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] !== undefined ? cells[index] : '';
    });
    return row;
  });
}

function formatUtcDate(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function formatUtcTime(date) {
  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')}`;
}

function excelSerialToDate(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const millis = Math.round((value - 25569) * 86400 * 1000);
  const date = new Date(millis);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parsePosDateOnly(value) {
  if (typeof value === 'number') {
    const date = excelSerialToDate(value);
    return date ? formatUtcDate(date) : '';
  }

  const text = String(value || '').trim();
  if (!text) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const datePart = text.split(' ')[0];
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(datePart);
  if (!match) return '';
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

function parsePosDateTime(value, fallbackDate = '') {
  if (typeof value === 'number') {
    const date = excelSerialToDate(value);
    return date ? `${formatUtcDate(date)} ${formatUtcTime(date)}` : '';
  }

  const text = String(value || '').trim();
  if (!text) return '';
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(text)) {
    return text.length === 16 ? `${text}:00` : text;
  }

  const [datePart, timePart = '00:00'] = text.split(/\s+/);
  const isoDate = parsePosDateOnly(datePart);
  if (!isoDate) return fallbackDate ? `${fallbackDate} ${timePart}` : '';
  const normalizedTime = /^\d{2}:\d{2}:\d{2}$/.test(timePart) ? timePart : `${timePart}:00`;
  return `${isoDate} ${normalizedTime}`;
}

function parsePosTime(value, fallbackDate = '') {
  const fullDateTime = parsePosDateTime(value, fallbackDate);
  if (!fullDateTime) return '';
  return fullDateTime.split(' ')[1] || '';
}

function subtractOneUtcDay(isoDate) {
  const [year, month, day] = String(isoDate || '').split('-').map(Number);
  if (!year || !month || !day) return '';
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return formatUtcDate(date);
}

function derivePosPeriodMetadataFromVentasMatrix(matrix) {
  const rows = Array.isArray(matrix) ? matrix : [];
  const desdeLabel = normalizeText(rows[0] && rows[0][0]);
  const hastaLabel = normalizeText(rows[1] && rows[1][0]);
  if (desdeLabel !== 'desde' || hastaLabel !== 'hasta') {
    throw new Error('La hoja Ventas no trae el bloque esperado de Desde/Hasta en las filas 1 y 2.');
  }

  const desdeRaw = rows[0][1];
  const hastaRaw = rows[1][1];
  const fechaDesde = parsePosDateOnly(desdeRaw);
  const hastaExclusive = parsePosDateOnly(hastaRaw);

  if (!fechaDesde || !hastaExclusive) {
    throw new Error('No se pudo interpretar el rango Desde/Hasta de la hoja Ventas.');
  }

  const fechaHasta = subtractOneUtcDay(hastaExclusive);
  if (!fechaHasta) {
    throw new Error('No se pudo derivar la fechaHasta desde la hoja Ventas.');
  }

  return {
    fechaDesde,
    fechaHasta,
    periodo: fechaDesde.slice(0, 7),
  };
}

function assertExactHeaders(actualRow, expectedHeaders, sheetName, rowNumber) {
  const actual = expectedHeaders.map((_, index) => String(actualRow[index] || '').trim());
  const expectedNormalized = expectedHeaders.map(normalizeHeader);
  const actualNormalized = actual.map(normalizeHeader);

  const mismatch = expectedNormalized.findIndex((header, index) => header !== actualNormalized[index]);
  if (mismatch !== -1) {
    throw new Error(
      `La hoja ${sheetName} no coincide con el formato POS V1 esperado en la fila ${rowNumber}. ` +
      `Se esperaba "${expectedHeaders[mismatch]}" en la columna ${mismatch + 1}, pero llegó "${actual[mismatch] || '(vacío)'}".`
    );
  }
}

function rowsToObjectsWithFixedHeaders(matrix, headerRowIndex, expectedHeaders, sheetName) {
  const rows = Array.isArray(matrix) ? matrix : [];
  const headerRow = rows[headerRowIndex];
  if (!Array.isArray(headerRow)) {
    throw new Error(`No se encontró la fila de encabezados esperada en la hoja.`);
  }

  assertExactHeaders(headerRow, expectedHeaders, sheetName, headerRowIndex + 1);

  return rows
    .slice(headerRowIndex + 1)
    .filter((row) => Array.isArray(row) && row.some((cell) => String(cell || '').trim() !== ''))
    .map((row) => {
      const record = {};
      expectedHeaders.forEach((header, index) => {
        record[header] = row[index] !== undefined ? row[index] : '';
      });
      return record;
    });
}

function parsePosVentaRows(ventaRows, fallbackLocal) {
  return ventaRows
    .filter((row) => normalizeText(row.Estado) === 'cerrada')
    .map((row) => {
      const fecha = parsePosDateOnly(row.Fecha);
      const hora = parsePosTime(row.Creación, fecha);
      const fechaCierre = parsePosDateTime(row.Cerrada, fecha);
      const tipoVenta = String(row['Tipo de Venta'] || '').trim();

      return {
        ventaId: String(row.Id || '').trim(),
        fecha,
        hora,
        fechaCierre,
        local: fallbackLocal,
        estado: String(row.Estado || '').trim(),
        origen: String(row.Origen || 'POS').trim() || 'POS',
        tipoVenta,
        medioPago: String(row['Medio de Pago'] || '').trim(),
        totalBruto: Math.round(normalizeAmount(row.Total)),
        esDelivery: normalizeText(tipoVenta).includes('delivery'),
        esCancelada: false,
        esValidaComision: true,
        motivoExclusion: '',
      };
    })
    .filter((row) => row.ventaId !== '');
}

function parsePosPropinaRows(propinaRows, ventas, fallbackLocal) {
  const ventasById = new Map(ventas.map((venta) => [String(venta.ventaId), venta]));

  return propinaRows
    .filter((row) => normalizeText(row.Cancelada) !== 'si')
    .map((row) => {
      const ventaId = String(row['Id. Venta'] || '').trim();
      const venta = ventasById.get(ventaId);
      const hasLinkedVenta = Boolean(venta);

      return {
        ventaId,
        fecha: venta ? venta.fecha : '',
        hora: venta ? venta.hora : '',
        local: venta ? venta.local : fallbackLocal,
        montoPropina: Math.round(normalizeAmount(row.Valor)),
        cancelada: false,
        esDelivery: venta ? venta.esDelivery : false,
        esValidaPropina: hasLinkedVenta,
        motivoExclusion: hasLinkedVenta ? '' : 'Propina sin venta asociada en hoja Ventas.',
      };
    })
    .filter((row) => row.ventaId !== '');
}

function parsePosWorkbook(workbook, fileName, fallbackLocal) {
  const xlsx = window.XLSX;
  const ventasSheet = workbook.Sheets[POS_V1_SHEETS.ventas];
  const propinasSheet = workbook.Sheets[POS_V1_SHEETS.propinas];

  if (!ventasSheet) {
    throw new Error('El archivo no contiene la hoja obligatoria "Ventas".');
  }

  if (!propinasSheet) {
    throw new Error('El archivo no contiene la hoja obligatoria "Propinas".');
  }

  const ventasMatrix = xlsx.utils.sheet_to_json(ventasSheet, { header: 1, defval: '' });
  const propinasMatrix = xlsx.utils.sheet_to_json(propinasSheet, { header: 1, defval: '' });
  const metadata = derivePosPeriodMetadataFromVentasMatrix(ventasMatrix);
  const ventaRows = rowsToObjectsWithFixedHeaders(ventasMatrix, 3, POS_V1_VENTAS_HEADERS, POS_V1_SHEETS.ventas);
  const propinaRows = rowsToObjectsWithFixedHeaders(propinasMatrix, 0, POS_V1_PROPINAS_HEADERS, POS_V1_SHEETS.propinas);
  const ventas = parsePosVentaRows(ventaRows, fallbackLocal);
  const propinas = parsePosPropinaRows(propinaRows, ventas, fallbackLocal);

  return {
    metadata: {
      periodo: metadata.periodo,
      nombreArchivo: fileName,
      fechaDesde: metadata.fechaDesde,
      fechaHasta: metadata.fechaHasta,
      observaciones: `Archivo POS V1 normalizado desde ${fileName}.`,
    },
    ventas,
    propinas,
  };
}

function getRowValue(row, aliases, fallback = '') {
  if (!row || typeof row !== 'object') return fallback;

  const normalizedMap = {};
  Object.keys(row).forEach((key) => {
    normalizedMap[normalizeHeader(key)] = row[key];
  });

  for (const alias of aliases) {
    const direct = row[alias];
    if (direct !== undefined && direct !== null && String(direct).trim() !== '') {
      return direct;
    }

    const normalized = normalizedMap[normalizeHeader(alias)];
    if (normalized !== undefined && normalized !== null && String(normalized).trim() !== '') {
      return normalized;
    }
  }

  return fallback;
}

function sheetRowsToObjects(matrix, expectedAliases) {
  const rows = Array.isArray(matrix) ? matrix : [];
  let bestIndex = -1;
  let bestScore = -1;

  rows.slice(0, 20).forEach((row, index) => {
    if (!Array.isArray(row)) return;
    const normalized = row.map((cell) => normalizeHeader(cell));
    let score = 0;

    expectedAliases.forEach((aliasGroup) => {
      const found = aliasGroup.some((alias) => normalized.includes(normalizeHeader(alias)));
      if (found) score += 1;
    });

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  if (bestIndex === -1 || bestScore <= 1) return [];

  const headers = (rows[bestIndex] || []).map((cell, index) => {
    const value = String(cell || '').trim();
    return value || `col_${index + 1}`;
  });

  return rows
    .slice(bestIndex + 1)
    .filter((row) => Array.isArray(row) && row.some((cell) => String(cell || '').trim() !== ''))
    .map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index] !== undefined ? row[index] : '';
      });
      return record;
    });
}

function extractMetadataFromMatrix(matrix) {
  const rows = Array.isArray(matrix) ? matrix : [];
  const metadata = {};

  rows.slice(0, 8).forEach((row) => {
    if (!Array.isArray(row) || row.length < 2) return;
    const key = normalizeText(row[0]);
    const value = String(row[1] || '').trim();
    if (!value) return;

    if (key === 'desde') metadata.fechaDesde = value.slice(0, 10).replace(/\//g, '-');
    if (key === 'hasta') metadata.fechaHasta = value.slice(0, 10).replace(/\//g, '-');
  });

  return metadata;
}

function detectSheetByRole(sheetEntries, role) {
  const roleTokens = role === 'propinas'
    ? ['propina', 'propinas', 'tip', 'tips']
    : ['venta', 'ventas', 'sales', 'ticket', 'tickets', 'boleta', 'boletas'];

  const roleHeaders = role === 'propinas'
    ? ['montoPropina', 'propina', 'tip', 'monto tip']
    : ['totalBruto', 'total', 'monto', 'medioPago', 'tipoVenta'];

  let best = null;

  sheetEntries.forEach((entry) => {
    let score = 0;
    const normalizedName = normalizeText(entry.name);

    roleTokens.forEach((token) => {
      if (normalizedName.includes(token)) score += 4;
    });

    const firstRow = entry.rows[0] || {};
    Object.keys(firstRow).forEach((key) => {
      const normalizedKey = normalizeHeader(key);
      roleHeaders.forEach((header) => {
        if (normalizedKey === normalizeHeader(header)) score += 2;
      });
    });

    if (!best || score > best.score) {
      best = { entry, score };
    }
  });

  if (!best || best.score <= 0) {
    return role === 'ventas' && sheetEntries.length === 1 ? sheetEntries[0] : null;
  }

  return best.entry;
}

function normalizeVentaRow(row, fallbackLocal) {
  const totalBruto = normalizeAmount(getRowValue(row, ['totalBruto', 'total bruto', 'total', 'monto', 'venta bruta'], 0));
  const esCancelada = normalizeBoolean(getRowValue(row, ['esCancelada', 'cancelada', 'anulada', 'nula'], false), false);
  const esDelivery = normalizeBoolean(getRowValue(row, ['esDelivery', 'delivery'], false), false);
  const esValidaComision = normalizeBoolean(
    getRowValue(row, ['esValidaComision', 'valida comision', 'valida', 'comisionable'], !esCancelada),
    !esCancelada
  );

  return {
    ventaId: String(getRowValue(row, ['ventaId', 'id', 'folio', 'ticket', 'numero', 'nro'], '')).trim(),
    fecha: String(getRowValue(row, ['fecha', 'dia'], '')).trim(),
    hora: String(getRowValue(row, ['hora'], '')).trim(),
    fechaCierre: String(getRowValue(row, ['fechaCierre', 'fecha cierre', 'cierre'], '')).trim(),
    local: String(getRowValue(row, ['local', 'sucursal'], fallbackLocal)).trim(),
    estado: String(getRowValue(row, ['estado'], esCancelada ? 'ANULADA' : 'PAGADA')).trim(),
    origen: String(getRowValue(row, ['origen', 'canal'], 'POS')).trim(),
    tipoVenta: String(getRowValue(row, ['tipoVenta', 'tipo venta', 'tipo'], '')).trim(),
    medioPago: String(getRowValue(row, ['medioPago', 'medio pago', 'pago'], '')).trim(),
    totalBruto,
    esDelivery,
    esCancelada,
    esValidaComision,
    motivoExclusion: String(getRowValue(row, ['motivoExclusion', 'motivo exclusion', 'observacion', 'observaciones'], '')).trim(),
  };
}

function normalizePropinaRow(row, fallbackLocal) {
  const cancelada = normalizeBoolean(getRowValue(row, ['cancelada', 'anulada'], false), false);
  const esValidaPropina = normalizeBoolean(
    getRowValue(row, ['esValidaPropina', 'valida propina', 'valida'], !cancelada),
    !cancelada
  );

  return {
    ventaId: String(getRowValue(row, ['ventaId', 'id', 'folio', 'ticket', 'numero', 'nro'], '')).trim(),
    fecha: String(getRowValue(row, ['fecha', 'dia'], '')).trim(),
    hora: String(getRowValue(row, ['hora'], '')).trim(),
    local: String(getRowValue(row, ['local', 'sucursal'], fallbackLocal)).trim(),
    montoPropina: normalizeAmount(getRowValue(row, ['montoPropina', 'monto propina', 'propina', 'tip', 'monto'], 0)),
    cancelada,
    esDelivery: normalizeBoolean(getRowValue(row, ['esDelivery', 'delivery'], false), false),
    esValidaPropina,
    motivoExclusion: String(getRowValue(row, ['motivoExclusion', 'motivo exclusion', 'observacion', 'observaciones'], '')).trim(),
  };
}

function buildPayloadFromSheetEntries(sheetEntries, fileName, fallbackLocal) {
  const ventasSheet = detectSheetByRole(sheetEntries, 'ventas');
  const propinasSheet = detectSheetByRole(sheetEntries, 'propinas');
  const metadataFromVentas = ventasSheet && ventasSheet.metadata ? ventasSheet.metadata : {};

  const ventas = ventasSheet
    ? ventasSheet.rows
        .map((row) => normalizeVentaRow(row, fallbackLocal))
        .filter((row) => row.ventaId || row.fecha || row.totalBruto || row.medioPago)
    : [];

  const propinas = propinasSheet
    ? propinasSheet.rows
        .map((row) => normalizePropinaRow(row, fallbackLocal))
        .filter((row) => row.ventaId || row.fecha || row.montoPropina)
    : [];

  return {
    metadata: {
      nombreArchivo: fileName,
      fechaDesde: metadataFromVentas.fechaDesde || '',
      fechaHasta: metadataFromVentas.fechaHasta || '',
      observaciones: `Archivo detectado automáticamente desde ${fileName}.`,
    },
    ventas,
    propinas,
  };
}

async function ensureXlsxLoaded() {
  if (window.XLSX) return window.XLSX;
  throw new Error('La librería XLSX no está disponible. Recarga la página e intenta nuevamente.');
}

async function parseSpreadsheetFile(file, fallbackLocal) {
  const extension = String(file.name || '').split('.').pop().toLowerCase();

  if (extension === 'json') {
    const text = await file.text();
    return {
      payload: JSON.parse(text),
      mode: 'json',
    };
  }

  if (extension === 'csv') {
    throw new Error('CSV ya no se procesa con heurística genérica. Usa JSON normalizado o el export XLS/XLSX del POS soportado.');
  }

  if (extension === 'xls' || extension === 'xlsx') {
    const XLSX = await ensureXlsxLoaded();
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    return {
      payload: parsePosWorkbook(workbook, file.name, fallbackLocal),
      mode: 'spreadsheet',
    };
  }

  throw new Error('Formato no soportado. Usa JSON, CSV, XLS o XLSX.');
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function renderPreview(payload) {
  const ventas = payload.ventas || [];
  const propinas = payload.propinas || [];

  const ventaValida = ventas.reduce((sum, item) => (
    sum + (normalizeBoolean(item.esValidaComision, true) ? normalizeAmount(item.totalBruto ?? item.total ?? item.monto) : 0)
  ), 0);

  const propinaValida = propinas.reduce((sum, item) => (
    sum + (normalizeBoolean(item.esValidaPropina, true) ? normalizeAmount(item.montoPropina ?? item.monto ?? item.propina) : 0)
  ), 0);

  $('statVentas').textContent = String(ventas.length);
  $('statPropinas').textContent = String(propinas.length);
  $('statVentaValida').textContent = currency.format(Math.round(ventaValida));
  $('statPropinaValida').textContent = currency.format(Math.round(propinaValida));

  $('metadataPreview').textContent = formatJson(payload.metadata);
  $('ventaPreview').textContent = ventas.length ? formatJson(ventas[0]) : 'Sin ventas.';
  $('propinaPreview').textContent = propinas.length ? formatJson(propinas[0]) : 'Sin propinas.';
}

async function sendImport(payload) {
  const session = window.LVAuth.getSession();
  if (!session || !session.sessionToken) {
    throw new Error('No hay sesión válida.');
  }

  const form = new URLSearchParams({
    accion: 'ImportarVentas',
    sessionToken: session.sessionToken,
    metadata: JSON.stringify(payload.metadata),
    ventas: JSON.stringify(payload.ventas),
    propinas: JSON.stringify(payload.propinas),
  });

  const response = await fetch(window.APP_CONFIG.WEB_APP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: form,
  });

  const data = await response.json();
  if (!response.ok || data.status !== 'SUCCESS') {
    const error = new Error(data.mensaje || 'No se pudo importar ventas.');
    error.code = data.status || 'ERROR_IMPORTACION';
    throw error;
  }

  return data;
}

function renderApp(session) {
  const app = $('app');
  const shell = document.createElement('div');
  shell.className = 'mx-auto flex min-h-screen w-full max-w-[1240px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl';

  const statusBox = document.createElement('div');
  statusBox.id = 'statusBox';
  statusBox.className = 'hidden';

  const existingImportBox = document.createElement('div');
  existingImportBox.id = 'existingImportBox';
  existingImportBox.className = 'hidden';

  const localSelectField = createSelectField({
    label: 'Local',
    id: 'localSelect',
    name: 'local',
    placeholder: 'Selecciona un local',
    options: [
      { value: 'Paseo del Lago', label: 'Paseo del Lago' },
      { value: 'Segunda Faja', label: 'Segunda Faja' },
    ],
  });
  const localSelect = localSelectField.input;

  const fechaDesdeBox = createReadonlyBox('-');
  const fechaHastaBox = createReadonlyBox('-');
  let markPayloadDirty = () => {};

  const periodPicker = createPeriodPicker({
    label: 'Período',
    scopeLabel: 'Alcance',
    initialType: 'mensual',
    showResolvedRange: true,
    className: 'rounded-3xl border border-neutral-charcoal/8 bg-neutral-cream/42 p-lg',
    onChange: ({ from, to }) => {
      fechaDesdeBox.textContent = from ? formatDateDisplay(from) : '-';
      fechaHastaBox.textContent = to ? formatDateDisplay(to) : '-';
      updateStatusBox(existingImportBox);
      markPayloadDirty();
    },
  });

  const fileInput = document.createElement('input');
  fileInput.id = 'jsonFileInput';
  fileInput.type = 'file';
  fileInput.accept = '.json,.csv,.xls,.xlsx,application/json,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  fileInput.className = 'block min-h-[54px] w-full rounded-2xl border border-dashed border-brand-bun/30 bg-gradient-to-r from-brand-cheese/10 to-white px-lg py-md text-sm font-bold text-neutral-charcoal file:mr-md file:rounded-xl file:border-0 file:bg-brand-bun file:px-md file:py-sm file:text-sm file:font-black file:text-neutral-charcoal hover:file:bg-brand-bun-dark hover:file:text-neutral-cream focus:outline-none';

  const logicalFileNameBox = createReadonlyBox('Se completará al cargar un archivo.');
  logicalFileNameBox.id = 'nombreArchivoLogico';

  const observacionesInput = document.createElement('input');
  observacionesInput.id = 'observacionesInput';
  observacionesInput.type = 'text';
  observacionesInput.placeholder = 'Notas opcionales de la importación';
  observacionesInput.className = 'min-h-[54px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md text-base font-medium text-neutral-charcoal transition-fast placeholder:text-neutral-muted focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30';

  const jsonInput = document.createElement('textarea');
  jsonInput.id = 'jsonInput';
  jsonInput.spellcheck = false;
  jsonInput.placeholder = '{"metadata":{},"ventas":[],"propinas":[]}';
  jsonInput.className = 'min-h-[260px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-lg font-mono text-[13px] leading-6 text-neutral-charcoal transition-fast placeholder:text-neutral-muted focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30';

  const sourceFooter = document.createElement('div');
  sourceFooter.className = 'mt-xl grid gap-lg';
  sourceFooter.append(statusBox);

  const sourceActions = document.createElement('div');
  sourceActions.className = 'flex flex-col gap-md md:flex-row md:flex-wrap';

  const btnLoadExample = createButton('Cargar ejemplo', { variant: 'secondary', className: 'shadow-none' });
  const btnBuildPreview = createButton('Construir preview', { variant: 'secondary', className: 'shadow-none' });
  const btnImport = createButton('Importar ventas', { disabled: true, className: 'shadow-none' });
  btnImport.id = 'btnImport';

  sourceActions.append(btnLoadExample, btnBuildPreview, btnImport);
  sourceFooter.appendChild(sourceActions);

  const sourceCard = createCard({
    eyebrow: 'Fuente',
    title: 'Carga y normalización',
    body: 'Carga un JSON normalizado o el export XLS/XLSX del POS soportado. El período se deriva desde la hoja Ventas y el local lo define el selector.',
    className: 'relative z-10 rounded-3xl shadow-none md:p-2xl',
  });

  const formGrid = document.createElement('div');
  formGrid.className = 'mt-xl grid gap-lg md:grid-cols-2';
  const resolvedDatesGrid = document.createElement('div');
  resolvedDatesGrid.className = 'grid gap-md md:grid-cols-2 md:col-span-2';
  resolvedDatesGrid.append(
    createField('Fecha desde', fechaDesdeBox),
    createField('Fecha hasta', fechaHastaBox),
  );

  formGrid.append(
    localSelectField.wrapper,
    createField('Período', periodPicker.element, { className: 'md:col-span-2' }),
    resolvedDatesGrid,
    (() => {
      const wrapper = document.createElement('div');
      wrapper.className = 'md:col-span-2';
      wrapper.appendChild(existingImportBox);
      return wrapper;
    })(),
    (() => {
      const wrapper = document.createElement('div');
      wrapper.className = 'md:col-span-2 flex flex-col gap-md md:flex-row';
      const btnCheckExisting = createButton('Consultar datos anteriores', { variant: 'secondary', className: 'shadow-none' });
      btnCheckExisting.id = 'btnCheckExisting';
      wrapper.appendChild(btnCheckExisting);
      return wrapper;
    })(),
    createField('Archivo fuente', fileInput, {
      hint: 'Si el archivo ya viene normalizado como JSON, se usa directo. Si es XLS/XLSX, debe coincidir con el formato POS V1 soportado para construir el payload.',
      className: 'md:col-span-2',
    }),
    createField('Nombre de archivo lógico', logicalFileNameBox, { className: 'md:col-span-2' }),
    createField('Observaciones', observacionesInput, { className: 'md:col-span-2' }),
    createField('Payload JSON', jsonInput, { className: 'md:col-span-2' }),
  );
  sourceCard.append(formGrid, sourceFooter);

  const statsGrid = document.createElement('div');
  statsGrid.className = 'grid gap-md sm:grid-cols-2';
  statsGrid.append(
    createStatCard('Ventas', 'statVentas', '0'),
    createStatCard('Propinas', 'statPropinas', '0'),
    createStatCard('Venta bruta válida', 'statVentaValida', '$0'),
    createStatCard('Propinas válidas', 'statPropinaValida', '$0'),
  );

  const previewBlocks = document.createElement('div');
  previewBlocks.className = 'mt-lg grid gap-md';
  previewBlocks.append(
    createPreviewBlock('Metadata final', 'metadataPreview', 'Sin preview todavía.'),
    createPreviewBlock('Primera venta', 'ventaPreview', 'Sin preview todavía.'),
    createPreviewBlock('Primera propina', 'propinaPreview', 'Sin preview todavía.'),
    createPreviewBlock('Respuesta última importación', 'responsePreview', 'Sin respuesta todavía.'),
  );

  const previewCard = createCard({
    eyebrow: 'Preview',
    title: 'Resumen técnico',
    body: 'Revisa el payload final antes de enviarlo al backend.',
    className: 'relative z-0 rounded-3xl shadow-none md:p-2xl',
  });
  previewCard.append(statsGrid, previewBlocks);

  const notesCard = createCard({
    eyebrow: 'Notas',
    title: 'Cobertura actual',
    body: 'Este importador ya normaliza el formato POS V1 usando solo las hojas Ventas y Propinas. Pagos sigue fuera de la persistencia principal hasta cerrar el catálogo y las reglas de medios de pago.',
    tone: 'highlight',
    className: 'relative z-0 rounded-3xl shadow-none',
  });

  const sessionUser = document.createElement('div');
  sessionUser.className = 'rounded-2xl border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-lg text-sm font-black leading-relaxed text-neutral-cream shadow-none md:text-base';
  sessionUser.textContent = `${session.displayName || 'Administrador'} · ${session.role} · ${window.APP_CONFIG.ENVIRONMENT.toUpperCase()}`;

  const heroActions = document.createElement('div');
  heroActions.className = 'flex flex-col gap-md';
  heroActions.append(
    createButton('Volver al panel', {
      variant: 'secondary',
      fullWidth: true,
      className: 'bg-white/88 text-neutral-charcoal shadow-none hover:bg-white',
      onClick: () => {
        window.location.href = withCurrentEnvironment('adminPanel.html');
      },
    }),
    createButton('Cerrar sesión', {
      fullWidth: true,
      className: 'shadow-none',
      onClick: async () => {
        overlay.setLoading(true, 'Cerrando sesión...');
        await waitNextFrame();
        await window.LVAuth.logout();
        window.LVAuth.redirectToIndex();
      },
    }),
  );

  const hero = createPageHero({
    badge: 'La Victoria · Ventas y comisiones',
    title: 'Importador operativo',
    lead: 'Harness técnico para construir, validar e importar payloads normalizados de ventas hacia staging o producción sin depender todavía del parser POS final.',
    sideTitle: 'Sesión y acciones',
    sideStatus: sessionUser,
    sideCopy: 'Usa esta pantalla para revisar el archivo fuente, validar rangos y confirmar el payload final antes de reemplazar una carga previa.',
    sideActions: heroActions,
    layoutClassName: 'lg:gap-4xl',
    contentClassName: 'lg:basis-[68%]',
    titleClassName: 'max-w-[11ch] text-[clamp(42px,5.8vw,72px)]',
    leadClassName: 'max-w-[64ch]',
    sideClassName: 'shadow-none lg:w-[320px]',
    className: 'shadow-none',
  });
  hero.querySelector('.shadow-brand-sm')?.classList.add('shadow-none');

  const layout = document.createElement('section');
  layout.className = 'grid gap-lg xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] xl:items-start';

  const leftStack = document.createElement('div');
  leftStack.className = 'relative z-10 grid gap-lg';
  leftStack.append(sourceCard);

  const rightStack = document.createElement('div');
  rightStack.className = 'relative z-0 grid gap-lg';
  rightStack.append(previewCard, notesCard);

  layout.append(leftStack, rightStack);
  shell.append(hero, layout);
  app.appendChild(shell);

  const btnCheckExisting = shell.querySelector('#btnCheckExisting');

  function getCurrentPeriodSnapshot() {
    return periodPicker.getValue();
  }

  markPayloadDirty = function markPayloadDirtyImpl() {
    currentPayload = null;
    btnImport.disabled = true;
  };

  function resetPreview() {
    $('statVentas').textContent = '0';
    $('statPropinas').textContent = '0';
    $('statVentaValida').textContent = '$0';
    $('statPropinaValida').textContent = '$0';
    $('metadataPreview').textContent = 'Sin preview todavía.';
    $('ventaPreview').textContent = 'Sin preview todavía.';
    $('propinaPreview').textContent = 'Sin preview todavía.';
    $('responsePreview').textContent = 'Sin respuesta todavía.';
  }

  function mergePayloadWithForm(rawPayload, fileNameFromInput) {
    const payload = rawPayload && typeof rawPayload === 'object' ? rawPayload : {};
    const metadata = payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {};
    const snapshot = getCurrentPeriodSnapshot();

    return {
      metadata: {
        ...metadata,
        local: localSelect.value.trim(),
        periodo: metadata.periodo || snapshot.period,
        nombreArchivo: currentSourceFileName || metadata.nombreArchivo || fileNameFromInput || 'ventas-normalizadas.json',
        fechaDesde: metadata.fechaDesde || snapshot.from,
        fechaHasta: metadata.fechaHasta || snapshot.to,
        observaciones: observacionesInput.value.trim() || metadata.observaciones || '',
      },
      ventas: Array.isArray(payload.ventas) ? payload.ventas : [],
      propinas: Array.isArray(payload.propinas) ? payload.propinas : [],
    };
  }

  async function refreshExistingImportsWarning() {
    const snapshot = getCurrentPeriodSnapshot();
    const periodo = String(snapshot.period || '').trim();
    const local = localSelect.value.trim();

    if (!periodo || !local) {
      updateStatusBox(existingImportBox);
      return;
    }

    try {
      const data = await window.LVAuth.apiGet({
        accion: 'ConsultarImportacionesVentas',
        local,
        periodo,
      });

      if (!data.importaciones || !data.importaciones.length) {
        updateStatusBox(existingImportBox, 'success', 'No existe una carga previa para este local y período.');
        return;
      }

      if (data.hayImportacionActiva) {
        const active = data.importaciones.find((item) => item.estado === 'SUCCESS');
        updateStatusBox(
          existingImportBox,
          'warning',
          `Ya existe una carga activa para ${local} en ${periodo}. Si importas de nuevo, se reemplazará. Última activa: ${active ? active.nombreArchivo : 'sin nombre'} (${active ? active.fechaImportacion : 'sin fecha'}).`
        );
        return;
      }

      updateStatusBox(existingImportBox, 'info', `Existen ${data.total} cargas históricas para este local y período, pero ninguna activa.`);
    } catch (error) {
      updateStatusBox(existingImportBox, 'error', error.message || 'No se pudo consultar el historial de importaciones.');
    }
  }

  async function buildPayloadFromInputs() {
    const rawText = jsonInput.value.trim();
    if (!rawText) {
      throw new Error('Debes cargar o pegar un payload JSON.');
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error('El JSON no es válido.');
    }

    const payload = mergePayloadWithForm(parsed, currentSourceFileName);
    const metadata = payload.metadata || {};
    const snapshot = getCurrentPeriodSnapshot();
    const requiredFields = ['local', 'periodo', 'nombreArchivo', 'fechaDesde', 'fechaHasta'];

    requiredFields.forEach((field) => {
      if (!String(metadata[field] || '').trim()) {
        throw new Error(`Falta completar "${field}" antes de generar el preview.`);
      }
    });

    if (parsed && parsed.metadata && parsed.metadata.periodo && snapshot.period && parsed.metadata.periodo !== snapshot.period) {
      throw new Error('El período seleccionado no coincide con el período derivado desde el archivo POS.');
    }

    if (parsed && parsed.metadata && parsed.metadata.fechaDesde && snapshot.from && parsed.metadata.fechaDesde !== snapshot.from) {
      throw new Error('La fechaDesde seleccionada no coincide con la derivada desde el archivo POS.');
    }

    if (parsed && parsed.metadata && parsed.metadata.fechaHasta && snapshot.to && parsed.metadata.fechaHasta !== snapshot.to) {
      throw new Error('La fechaHasta seleccionada no coincide con la derivada desde el archivo POS.');
    }

    const normalizedForHash = {
      metadata: {
        local: metadata.local,
        periodo: metadata.periodo,
        nombreArchivo: metadata.nombreArchivo,
        fechaDesde: metadata.fechaDesde,
        fechaHasta: metadata.fechaHasta,
      },
      ventas: payload.ventas,
      propinas: payload.propinas,
    };

    payload.metadata.hashArchivo = await sha256Hex(formatJson(normalizedForHash));
    return payload;
  }

  async function handleBuildPreview() {
    updateStatusBox(statusBox, 'info', 'Construyendo preview...');
    currentPayload = await buildPayloadFromInputs();
    renderPreview(currentPayload);
    btnImport.disabled = false;
    updateStatusBox(statusBox, 'success', 'Preview listo. Puedes importar este payload al backend.');
  }

  async function handleImport() {
    if (!currentPayload) {
      throw new Error('Primero debes construir el preview.');
    }

    overlay.setLoading(true, 'Importando ventas...');
    await waitNextFrame();

    try {
      const result = await sendImport(currentPayload);
      $('responsePreview').textContent = formatJson(result);
      updateStatusBox(
        statusBox,
        'success',
        `Importación creada: ${result.importId}. Ventas: ${result.registrosVentas}. Propinas: ${result.registrosPropinas}.`
      );
      toast.show('success', 'Importación enviada correctamente.');
    } finally {
      overlay.setLoading(false);
    }
  }

  function fillInputsFromExample() {
    const example = getExamplePayload();
    localSelectField.setValue('Paseo del Lago', false);
    periodPicker.setType('mensual');
    periodPicker.setValue('mensual', '2026-06');
    currentSourceFileName = example.metadata.nombreArchivo;
    logicalFileNameBox.textContent = currentSourceFileName;
    observacionesInput.value = example.metadata.observaciones;
    jsonInput.value = formatJson(example);
    markPayloadDirty();
    $('responsePreview').textContent = 'Sin respuesta todavía.';
    updateStatusBox(statusBox);
    updateStatusBox(existingImportBox);
  }

  function resetFormDefaults() {
    localSelectField.setValue('', false);
    periodPicker.setType('mensual');
    periodPicker.setValue('mensual', formatDateIso(new Date()).slice(0, 7));
    currentSourceFileName = '';
    logicalFileNameBox.textContent = 'Se completará al cargar un archivo.';
    observacionesInput.value = '';
    jsonInput.value = '';
    fileInput.value = '';
    markPayloadDirty();
    resetPreview();
    updateStatusBox(statusBox);
    updateStatusBox(existingImportBox);
  }

  async function handleSourceFile(file) {
    if (!file) return;
    const result = await parseSpreadsheetFile(file, localSelectField.getValue().trim());
    if (result.payload && result.payload.metadata && result.payload.metadata.periodo) {
      periodPicker.setType('mensual');
      periodPicker.setValue('mensual', result.payload.metadata.periodo);
    }
    jsonInput.value = formatJson(result.payload);
    currentSourceFileName = file.name;
    logicalFileNameBox.textContent = file.name;
    markPayloadDirty();
    updateStatusBox(statusBox, 'info', `Archivo cargado: ${file.name} (${result.mode}). Ahora construye el preview.`);
  }

  localSelectField.onChange(() => {
    updateStatusBox(existingImportBox);
    markPayloadDirty();
  });

  observacionesInput.addEventListener('input', markPayloadDirty);
  jsonInput.addEventListener('input', markPayloadDirty);

  btnLoadExample.addEventListener('click', fillInputsFromExample);
  btnCheckExisting.addEventListener('click', refreshExistingImportsWarning);

  btnBuildPreview.addEventListener('click', async () => {
    try {
      await handleBuildPreview();
    } catch (error) {
      currentPayload = null;
      btnImport.disabled = true;
      updateStatusBox(statusBox, 'error', error.message || 'No se pudo construir el preview.');
    }
  });

  btnImport.addEventListener('click', async () => {
    try {
      await handleImport();
    } catch (error) {
      updateStatusBox(statusBox, 'error', error.message || 'No se pudo importar ventas.');
    }
  });

  fileInput.addEventListener('change', async (event) => {
    try {
      await handleSourceFile(event.target.files && event.target.files[0]);
    } catch (error) {
      updateStatusBox(statusBox, 'error', error.message || 'No se pudo leer el archivo.');
    }
  });

  resetFormDefaults();
}

async function bootstrap() {
  try {
    overlay.setLoading(true, 'Validando sesión...');
    const session = await window.LVAuth.protectPage(['Administrador']);
    if (!session) return;

    overlay.setLoading(true, 'Cargando importador...');
    await waitNextFrame();
    renderApp(session);
  } finally {
    overlay.setLoading(false);
  }
}

bootstrap();
