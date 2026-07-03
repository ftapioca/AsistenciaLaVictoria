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

function isRejectedStatus(value) {
  const text = normalizeText(value);
  if (!text) return false;

  return [
    'anulada',
    'anulado',
    'cancelada',
    'cancelado',
    'eliminada',
    'eliminado',
    'nula',
    'nulo',
    'void',
    'borrada',
    'borrado',
  ].some((token) => text.includes(token));
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function toIsoDate(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function toTime24(hours, minutes, seconds = 0) {
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

function parseExcelSerialDate(value) {
  const serial = Number(value);
  if (!Number.isFinite(serial) || serial <= 0) return null;

  const excelEpoch = Date.UTC(1899, 11, 30);
  const wholeDays = Math.floor(serial);
  const fractionalDay = serial - wholeDays;
  const milliseconds = Math.round(fractionalDay * 24 * 60 * 60 * 1000);
  const date = new Date(excelEpoch + wholeDays * 24 * 60 * 60 * 1000 + milliseconds);

  if (Number.isNaN(date.getTime())) return null;

  return {
    fecha: toIsoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()),
    hora: toTime24(date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()),
  };
}

function parseSpreadsheetDateTimeParts(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      fecha: toIsoDate(value.getFullYear(), value.getMonth() + 1, value.getDate()),
      hora: toTime24(value.getHours(), value.getMinutes(), value.getSeconds()),
    };
  }

  if (typeof value === 'number') {
    return parseExcelSerialDate(value);
  }

  const text = String(value || '').trim();
  if (!text) return null;

  if (/^\d+(\.\d+)?$/.test(text)) {
    const fromSerial = parseExcelSerialDate(text);
    if (fromSerial) return fromSerial;
  }

  const normalized = text.replace(/\s+/g, ' ').trim();
  const match = normalized.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  let hours = match[4] !== undefined ? Number(match[4]) : 0;
  const minutes = match[5] !== undefined ? Number(match[5]) : 0;
  const seconds = match[6] !== undefined ? Number(match[6]) : 0;
  const meridiem = String(match[7] || '').toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  if (!year || !month || !day) return null;

  return {
    fecha: toIsoDate(year, month, day),
    hora: match[4] !== undefined ? toTime24(hours, minutes, seconds) : '',
  };
}

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
    : role === 'pagos'
      ? ['pago', 'pagos', 'payment', 'payments']
      : ['venta', 'ventas', 'sales', 'ticket', 'tickets', 'boleta', 'boletas'];

  const roleHeaders = role === 'propinas'
    ? ['montoPropina', 'monto propina', 'propina', 'tip', 'monto', 'valor', 'cancelado', 'cancelada', 'id venta', 'fecha pago']
    : role === 'pagos'
      ? ['fecha pago', 'medio de pago', 'monto', 'cancelado', 'tipo de venta', 'id venta']
      : ['totalBruto', 'total bruto', 'total', 'monto', 'medioPago', 'medio de pago', 'tipoVenta', 'estado'];

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
  const estado = String(getRowValue(row, ['estado', 'status', 'estado venta'], '')).trim();
  const fechaCierreExplicita = String(getRowValue(row, ['fechaCierre', 'fecha cierre', 'cierre'], '')).trim();
  const cierreRaw = fechaCierreExplicita || getRowValue(row, ['cerrada'], '');
  const cierreParts = parseSpreadsheetDateTimeParts(cierreRaw);
  const esCanceladaExplicita = normalizeBoolean(getRowValue(row, ['esCancelada', 'cancelada', 'anulada', 'nula'], false), false);
  const esCancelada = esCanceladaExplicita || isRejectedStatus(estado);
  const esDelivery = normalizeBoolean(getRowValue(row, ['esDelivery', 'delivery'], false), false);
  const esValidaComision = normalizeBoolean(
    getRowValue(row, ['esValidaComision', 'valida comision', 'valida', 'comisionable'], !esCancelada),
    !esCancelada
  );
  const motivoExclusionOriginal = String(getRowValue(row, ['motivoExclusion', 'motivo exclusion', 'observacion', 'observaciones'], '')).trim();
  const motivoExclusion = !esValidaComision && !motivoExclusionOriginal
    ? (estado ? `Venta excluida por estado ${estado}.` : 'Venta excluida por estado no comisionable.')
    : motivoExclusionOriginal;

  return {
    ventaId: String(getRowValue(row, ['ventaId', 'id', 'folio', 'ticket', 'numero', 'nro'], '')).trim(),
    fecha: String(getRowValue(row, ['fecha', 'dia'], cierreParts?.fecha || '')).trim(),
    hora: String(getRowValue(row, ['hora'], cierreParts?.hora || '')).trim(),
    fechaCierre: fechaCierreExplicita || (cierreParts ? `${cierreParts.fecha} ${cierreParts.hora}`.trim() : ''),
    local: String(getRowValue(row, ['local', 'sucursal'], fallbackLocal)).trim(),
    estado: estado || (esCancelada ? 'ANULADA' : 'PAGADA'),
    origen: String(getRowValue(row, ['origen', 'canal'], 'POS')).trim(),
    tipoVenta: String(getRowValue(row, ['tipoVenta', 'tipo de venta', 'tipo venta', 'tipo'], '')).trim(),
    medioPago: String(getRowValue(row, ['medioPago', 'medio de pago', 'medio pago', 'pago'], '')).trim(),
    totalBruto,
    esDelivery,
    esCancelada,
    esValidaComision,
    motivoExclusion,
  };
}

function normalizePropinaRow(row, fallbackLocal) {
  const estado = String(getRowValue(row, ['estado', 'status', 'estado propina'], '')).trim();
  const canceladaExplicita = normalizeBoolean(getRowValue(row, ['cancelada', 'anulada', 'cancelado'], false), false);
  const cancelada = canceladaExplicita || isRejectedStatus(estado);
  const esValidaPropina = normalizeBoolean(
    getRowValue(row, ['esValidaPropina', 'valida propina', 'valida'], !cancelada),
    !cancelada
  );
  const motivoExclusionOriginal = String(getRowValue(row, ['motivoExclusion', 'motivo exclusion', 'observacion', 'observaciones'], '')).trim();
  const motivoExclusion = !esValidaPropina && !motivoExclusionOriginal
    ? (estado ? `Propina excluida por estado ${estado}.` : 'Propina excluida por estado no valido.')
    : motivoExclusionOriginal;

  return {
    ventaId: String(getRowValue(row, ['ventaId', 'id venta', 'id. venta', 'id', 'folio', 'ticket', 'numero', 'nro'], '')).trim(),
    fecha: String(getRowValue(row, ['fecha', 'dia'], '')).trim(),
    hora: String(getRowValue(row, ['hora'], '')).trim(),
    local: String(getRowValue(row, ['local', 'sucursal'], fallbackLocal)).trim(),
    montoPropina: normalizeAmount(getRowValue(row, ['montoPropina', 'monto propina', 'propina', 'tip', 'monto', 'valor'], 0)),
    cancelada,
    esDelivery: normalizeBoolean(getRowValue(row, ['esDelivery', 'delivery'], false), false),
    esValidaPropina,
    motivoExclusion,
  };
}

function normalizePagoRow(row, fallbackLocal) {
  const fechaPagoRaw = getRowValue(row, ['fechaPago', 'fecha pago', 'fecha'], '');
  const fechaPagoParts = parseSpreadsheetDateTimeParts(fechaPagoRaw);
  const cancelado = normalizeBoolean(getRowValue(row, ['cancelado', 'cancelada', 'anulada'], false), false);

  return {
    ventaId: String(getRowValue(row, ['ventaId', 'id venta', 'id. venta', 'id', 'folio', 'ticket', 'numero', 'nro'], '')).trim(),
    fecha: String(getRowValue(row, ['fecha', 'dia'], fechaPagoParts?.fecha || '')).trim(),
    hora: String(getRowValue(row, ['hora'], fechaPagoParts?.hora || '')).trim(),
    local: String(getRowValue(row, ['local', 'sucursal'], fallbackLocal)).trim(),
    medioPago: String(getRowValue(row, ['medioPago', 'medio de pago', 'medio pago', 'pago'], '')).trim(),
    monto: normalizeAmount(getRowValue(row, ['monto', 'total', 'valor'], 0)),
    cancelado,
    tipoVenta: String(getRowValue(row, ['tipoVenta', 'tipo de venta', 'tipo venta', 'tipo'], '')).trim(),
  };
}

function buildPayloadFromSheetEntries(sheetEntries, fileName, fallbackLocal) {
  const ventasSheet = detectSheetByRole(sheetEntries, 'ventas');
  const propinasSheet = detectSheetByRole(sheetEntries, 'propinas');
  const pagosSheet = detectSheetByRole(sheetEntries, 'pagos');
  const metadataFromVentas = ventasSheet && ventasSheet.metadata ? ventasSheet.metadata : {};

  let ventas = ventasSheet
    ? ventasSheet.rows
        .map((row) => normalizeVentaRow(row, fallbackLocal))
        .filter((row) => row.ventaId || row.fecha || row.totalBruto || row.medioPago)
    : [];

  const pagos = pagosSheet
    ? pagosSheet.rows
        .map((row) => normalizePagoRow(row, fallbackLocal))
        .filter((row) => row.ventaId || row.fecha || row.monto || row.medioPago)
    : [];

  const pagosByVentaId = new Map();
  pagos.forEach((row) => {
    if (!row.ventaId) return;
    const key = String(row.ventaId).trim();
    if (!pagosByVentaId.has(key)) pagosByVentaId.set(key, []);
    pagosByVentaId.get(key).push(row);
  });

  ventas = ventas.map((row) => {
    const pagosVenta = row.ventaId ? pagosByVentaId.get(String(row.ventaId).trim()) : null;
    const primerPago = pagosVenta && pagosVenta.length ? pagosVenta[0] : null;
    if (!primerPago) return row;

    return {
      ...row,
      medioPago: row.medioPago || primerPago.medioPago || '',
      tipoVenta: row.tipoVenta || primerPago.tipoVenta || '',
    };
  });

  const ventasById = new Map(
    ventas
      .filter((row) => row.ventaId)
      .map((row) => [String(row.ventaId).trim(), row])
  );

  const propinas = propinasSheet
    ? propinasSheet.rows
        .map((row) => normalizePropinaRow(row, fallbackLocal))
        .map((row) => {
          const linkedVenta = row.ventaId ? ventasById.get(String(row.ventaId).trim()) : null;
          if (!linkedVenta) return row;

          return {
            ...row,
            fecha: row.fecha || linkedVenta.fecha || '',
            hora: row.hora || linkedVenta.hora || '',
            local: row.local || linkedVenta.local || fallbackLocal || '',
          };
        })
        .filter((row) => row.ventaId || row.fecha || row.montoPropina)
    : [];

  const pagosEnriquecidos = pagos.map((row) => {
    const linkedVenta = row.ventaId ? ventasById.get(String(row.ventaId).trim()) : null;
    if (!linkedVenta) return row;

    return {
      ...row,
      fecha: row.fecha || linkedVenta.fecha || '',
      hora: row.hora || linkedVenta.hora || '',
      local: row.local || linkedVenta.local || fallbackLocal || '',
    };
  });

  return {
    metadata: {
      nombreArchivo: fileName,
      fechaDesde: metadataFromVentas.fechaDesde || '',
      fechaHasta: metadataFromVentas.fechaHasta || '',
      observaciones: `Archivo detectado automáticamente desde ${fileName}.`,
    },
    ventas,
    propinas,
    pagos: pagosEnriquecidos,
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
    const text = await file.text();
    return {
      payload: buildPayloadFromSheetEntries([{ name: file.name, rows: parseCsvToObjects(text) }], file.name, fallbackLocal),
      mode: 'csv',
    };
  }

  if (extension === 'xls' || extension === 'xlsx') {
    const XLSX = await ensureXlsxLoaded();
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetEntries = workbook.SheetNames.map((sheetName) => ({
      name: sheetName,
      matrix: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' }),
    }))
      .map((entry) => {
        const normalizedSheetName = normalizeText(entry.name);
        const expectedAliases = normalizedSheetName.includes('propina')
          ? [
              ['fecha pago', 'fecha', 'dia'],
              ['monto', 'monto propina', 'propina', 'tip', 'valor'],
              ['cancelado', 'cancelada', 'anulada', 'estado'],
              ['id venta', 'id. venta', 'ventaId', 'folio', 'ticket'],
              ['local', 'sucursal'],
            ]
          : normalizedSheetName.includes('pago')
            ? [
                ['fecha pago', 'fecha', 'dia'],
                ['medio de pago', 'medioPago', 'pago'],
                ['monto', 'total', 'valor'],
                ['tipo de venta', 'tipoVenta'],
                ['cancelado', 'cancelada', 'anulada', 'estado'],
                ['id venta', 'id. venta', 'ventaId', 'folio', 'ticket'],
              ]
            : [
                ['fecha', 'dia'],
                ['medio de pago', 'medioPago', 'pago'],
                ['total', 'total bruto', 'monto'],
                ['tipo de venta', 'tipoVenta'],
                ['camarero / repartidor', 'origen', 'estado'],
                ['id venta', 'id. venta', 'ventaId', 'folio', 'ticket'],
              ];

        return {
          name: entry.name,
          metadata: extractMetadataFromMatrix(entry.matrix),
          rows: sheetRowsToObjects(entry.matrix, expectedAliases),
        };
      })
      .filter((entry) => entry.rows.length > 0);

    return {
      payload: buildPayloadFromSheetEntries(sheetEntries, file.name, fallbackLocal),
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
    pagos: JSON.stringify(payload.pagos || []),
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
    body: 'Carga un archivo JSON, CSV, XLS o XLSX. Los campos de local y período pueden sobrescribir lo que venga detectado en el archivo.',
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
      hint: 'Si el archivo ya viene normalizado como JSON, se usa directo. Si es CSV, XLS o XLSX, se detectan hojas y columnas comunes para construir el payload.',
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
    body: 'Este importador ya puede transformar archivos JSON, CSV, XLS y XLSX en un payload normalizado para ImportarVentas. Si el formato POS viene con nombres de hojas o columnas distintos, habrá que extender las reglas de detección.',
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
        periodo: snapshot.period,
        nombreArchivo: currentSourceFileName || metadata.nombreArchivo || fileNameFromInput || 'ventas-normalizadas.json',
        fechaDesde: snapshot.from,
        fechaHasta: snapshot.to,
        observaciones: observacionesInput.value.trim() || metadata.observaciones || '',
      },
      ventas: Array.isArray(payload.ventas) ? payload.ventas : [],
      propinas: Array.isArray(payload.propinas) ? payload.propinas : [],
      pagos: Array.isArray(payload.pagos) ? payload.pagos : [],
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
    const requiredFields = ['local', 'periodo', 'nombreArchivo', 'fechaDesde', 'fechaHasta'];

    requiredFields.forEach((field) => {
      if (!String(metadata[field] || '').trim()) {
        throw new Error(`Falta completar "${field}" antes de generar el preview.`);
      }
    });

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
