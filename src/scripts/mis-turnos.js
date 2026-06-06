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
import { createPeriodPicker } from '../components/PeriodPicker.js';
import { createStatGrid } from '../components/StatGrid.js';
import { createToast } from '../components/Toast.js';

const $ = (id) => document.getElementById(id);
const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

let calendario = [];
let session = null;
let mesSeleccionado = null;
let anioSeleccionado = null;
let monthPicker = null;

const overlay = createLoadingOverlay('Procesando...');
document.body.appendChild(overlay.element);

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

function fechaISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function ultimoDiaDelMes(date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(0, 0, 0, 0);
  return d;
}

function primerNombre(nombreCompleto) {
  return String(nombreCompleto || '').trim().split(/\s+/)[0] || 'colaborador';
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

function horarioTexto(turno) {
  if (!turno || turno.estado === 'Libre' || turno.tipoTurno === 'Libre') return 'Libre';
  if (turno.tipoTurno === 'Partido' && turno.inicio2 && turno.fin2) {
    return `${turno.inicio1} - ${turno.fin1} / ${turno.inicio2} - ${turno.fin2}`;
  }
  return `${turno.inicio1 || '--:--'} - ${turno.fin1 || '--:--'}`;
}

function pillClass(turno) {
  const base = String(turno.tipoTurno || turno.estado || 'Programado').toLowerCase();
  if (base.includes('libre')) return 'libre';
  if (base.includes('partido')) return 'partido';
  return 'programado';
}

function legendLabel(turno) {
  if (String(turno.tipoTurno || '').toLowerCase() === 'libre' || String(turno.estado || '').toLowerCase() === 'libre') {
    return 'Libre';
  }
  return String(turno.tipoTurno || 'Programado').trim();
}

function pillLabel(turno) {
  if (String(turno.tipoTurno || '').toLowerCase() === 'libre' || String(turno.estado || '').toLowerCase() === 'libre') {
    return 'Libre';
  }
  return turno.local || 'Turno';
}

function esTurnoLibre(turno) {
  return String(turno.tipoTurno || '').toLowerCase() === 'libre' || String(turno.estado || '').toLowerCase() === 'libre';
}

function compactarTurnosDelDia(turnosDia) {
  if (!Array.isArray(turnosDia) || !turnosDia.length) return [];
  const turnosActivos = turnosDia.filter((turno) => !esTurnoLibre(turno));
  return turnosActivos.length ? turnosActivos : [turnosDia[0]];
}

function setMesSeleccionado(year, monthIndex) {
  mesSeleccionado = { year, month: monthIndex };
  anioSeleccionado = year;
}

function monthPeriodValue(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

function syncMonthPicker(year, monthIndex) {
  if (!monthPicker) return;
  monthPicker.setValue('mensual', monthPeriodValue(year, monthIndex));
}

function moverMes(delta) {
  const base = new Date(mesSeleccionado.year, mesSeleccionado.month + delta, 1);
  syncMonthPicker(base.getFullYear(), base.getMonth());
}

function generarCalendarioMes() {
  const inicio = new Date(mesSeleccionado.year, mesSeleccionado.month, 1);
  const fin = ultimoDiaDelMes(inicio);
  const year = inicio.getFullYear();
  const month = inicio.getMonth();
  const primerDiaSemana = inicio.getDay() === 0 ? 6 : inicio.getDay() - 1;
  const totalDias = fin.getDate();

  calendario = [];
  for (let i = 0; i < primerDiaSemana; i++) calendario.push(null);
  for (let day = 1; day <= totalDias; day++) calendario.push(new Date(year, month, day));
  while (calendario.length % 7 !== 0) calendario.push(null);

  $('monthTitle').innerText = `${meses[inicio.getMonth()]} ${inicio.getFullYear()}`;
  $('monthSubtitle').innerText = session ? `Calendario mensual de ${session.displayName || 'colaborador'}` : 'Sin sesión.';

  return { inicio, fin };
}

function updateLegend(turnos) {
  const container = $('summaryLegend');
  const resumen = new Map();

  turnos.forEach((turno) => {
    const label = legendLabel(turno);
    const className = pillClass(turno);
    const key = `${className}:${label.toLowerCase()}`;
    const actual = resumen.get(key) || { label, className, count: 0 };
    actual.count += 1;
    resumen.set(key, actual);
  });

  if (!resumen.size) {
    container.innerHTML = '<span class="text-sm font-bold text-neutral-muted">Sin turnos para este mes.</span>';
    return;
  }

  container.innerHTML = Array.from(resumen.values()).map((item) => `
    <span class="inline-flex items-center gap-sm rounded-full bg-neutral-charcoal/5 px-md py-sm text-sm font-bold text-neutral-charcoal">
      <span class="inline-flex rounded-full px-sm py-[2px] text-xs font-black ${
        item.className === 'programado'
          ? 'bg-brand-lettuce/15 text-brand-lettuce'
          : item.className === 'libre'
            ? 'bg-brand-cheese/35 text-brand-bun-dark'
            : 'bg-[rgba(220,194,239,1)] text-[rgb(95,63,120)]'
      }">${escapeHtml(item.label)}</span>
      <span>${item.count}</span>
    </span>
  `).join('');
}

function renderCalendario(turnos) {
  const grid = $('calendarGrid');
  const hoy = fechaISO(new Date());
  const turnosPorFecha = {};

  turnos.forEach((turno) => {
    if (!turnosPorFecha[turno.fecha]) turnosPorFecha[turno.fecha] = [];
    turnosPorFecha[turno.fecha].push(turno);
  });

  Object.keys(turnosPorFecha).forEach((fecha) => {
    turnosPorFecha[fecha] = compactarTurnosDelDia(turnosPorFecha[fecha]);
  });

  const turnosCompactados = Object.values(turnosPorFecha).flat();
  $('totalTurnos').innerText = `Tienes ${turnosCompactados.length} turnos cargados este mes`;
  updateLegend(turnosCompactados);

  if (!turnos.length) {
    grid.innerHTML = '<div class="rounded-2xl border border-neutral-charcoal/10 bg-white/72 p-xl text-base font-bold text-neutral-muted">No tienes turnos asignados para este mes.</div>';
    return;
  }

  const weekdays = dias.map((dia) => `
    <div class="hidden rounded-2xl bg-brand-cheese/25 px-md py-sm text-center text-xs font-black uppercase tracking-[0.08em] text-brand-bun-dark md:block">${dia}</div>
  `).join('');

  const cells = calendario.map((date) => {
    if (!date) {
      return '<article class="hidden rounded-3xl border border-dashed border-neutral-charcoal/10 bg-white/28 md:block"></article>';
    }

    const iso = fechaISO(date);
    const eventos = (turnosPorFecha[iso] || []).map((turno) => {
      const tone = pillClass(turno);
      const toneClass = tone === 'programado'
        ? 'bg-brand-lettuce/15 text-brand-lettuce'
        : tone === 'libre'
          ? 'bg-brand-cheese/35 text-brand-bun-dark'
          : 'bg-[rgba(220,194,239,1)] text-[rgb(95,63,120)]';

      return `
        <div class="group relative inline-flex max-w-full">
          <span class="inline-flex max-w-full cursor-default items-center gap-sm truncate rounded-full px-md py-sm text-xs font-black ${toneClass}">
            ${escapeHtml(pillLabel(turno))}
          </span>
          <div class="pointer-events-none absolute left-0 top-full z-tooltip mt-sm hidden w-[220px] rounded-xl bg-neutral-charcoal px-md py-md text-xs leading-relaxed text-neutral-cream shadow-brand group-hover:block group-focus-within:block">
            <strong>Local:</strong> ${escapeHtml(turno.local || 'Local sin definir')}<br>
            <strong>Turno:</strong> ${escapeHtml(horarioTexto(turno))}<br>
            <strong>Observaciones:</strong> ${escapeHtml(turno.observaciones || 'Sin observaciones')}
          </div>
        </div>
      `;
    }).join('');

    return `
      <article class="rounded-3xl border border-neutral-charcoal/8 bg-white/72 p-md ${iso === hoy ? 'ring-2 ring-brand-bun/30' : ''}">
        <div class="flex items-center justify-between gap-sm font-black text-neutral-charcoal">
          <span>${date.getDate()}</span>
          <small class="text-xs uppercase tracking-[0.05em] text-neutral-muted">${date.toLocaleDateString('es-CL', { weekday: 'short' })}</small>
        </div>
        <div class="mt-md flex flex-wrap gap-sm">
          ${eventos}
        </div>
      </article>
    `;
  }).join('');

  grid.innerHTML = weekdays + cells;
}

function createMonthControls() {
  const wrapper = document.createElement('div');
  wrapper.className = 'grid gap-md xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))]';

  wrapper.innerHTML = `
    <div class="grid gap-sm">
      <div id="monthPickerSlot"></div>
    </div>
    <div class="grid gap-sm">
      <span class="text-sm font-black text-transparent">A</span>
      <button id="btnMesAnterior" type="button"></button>
    </div>
    <div class="grid gap-sm">
      <span class="text-sm font-black text-transparent">A</span>
      <button id="btnMesActual" type="button"></button>
    </div>
    <div class="grid gap-sm">
      <span class="text-sm font-black text-transparent">A</span>
      <button id="btnMesSiguiente" type="button"></button>
    </div>
  `;

  $('monthControlsSlot').appendChild(wrapper);
  const now = new Date();
  const initialYear = mesSeleccionado?.year ?? now.getFullYear();
  const initialMonth = mesSeleccionado?.month ?? now.getMonth();

  monthPicker = createPeriodPicker({
    label: 'Mes',
    types: ['mensual'],
    initialType: 'mensual',
    initialValues: {
      monthly: monthPeriodValue(initialYear, initialMonth),
      weekly: '',
      daily: '',
    },
    onChange: ({ period }) => {
      if (!period) return;
      const [year, month] = period.split('-').map(Number);
      setMesSeleccionado(year, month - 1);
      if (session) {
        cargarMes();
      }
    },
  });
  $('monthPickerSlot').appendChild(monthPicker.element);

  const prev = createButton('← Mes anterior', {
    variant: 'secondary',
    fullWidth: true,
    className: 'min-h-[52px] bg-white/82 text-brand-bun-dark hover:bg-white',
    onClick: () => moverMes(-1),
  });
  const current = createButton('Mes actual', {
    variant: 'secondary',
    fullWidth: true,
    className: 'min-h-[52px] bg-white/82 text-brand-bun-dark hover:bg-white',
    onClick: () => {
      const actual = new Date();
      setMesSeleccionado(actual.getFullYear(), actual.getMonth());
      cargarMes();
    },
  });
  const next = createButton('Mes siguiente →', {
    variant: 'secondary',
    fullWidth: true,
    className: 'min-h-[52px] bg-white/82 text-brand-bun-dark hover:bg-white',
    onClick: () => moverMes(1),
  });

  $('btnMesAnterior').replaceWith(prev);
  prev.id = 'btnMesAnterior';
  $('btnMesActual').replaceWith(current);
  current.id = 'btnMesActual';
  $('btnMesSiguiente').replaceWith(next);
  next.id = 'btnMesSiguiente';
}

function buildAppShell() {
  const app = $('app');
  const shell = document.createElement('div');
  shell.className = 'mx-auto flex min-h-screen w-full max-w-[1320px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl';

  const sessionUser = document.createElement('div');
  sessionUser.id = 'sessionUser';
  sessionUser.className = 'rounded-2xl border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-lg text-sm font-black leading-relaxed text-neutral-cream md:text-base';
  sessionUser.textContent = 'Validando sesión...';

  const actions = document.createElement('div');
  actions.className = 'flex flex-col gap-md';

  const logoutButton = createButton('Cerrar sesión', {
    variant: 'primary',
    fullWidth: true,
    onClick: async () => {
      overlay.setLoading(true, 'Cerrando sesión...');
      await waitNextFrame();
      await window.LVAuth.logout();
      window.LVAuth.redirectToIndex();
    },
  });
  actions.append(logoutButton);

  const hero = createPageHero({
    badge: 'La Victoria · Mis Turnos',
    title: 'Mis turnos',
    lead: 'Vista personal tipo calendario. Muestra todos tus turnos del mes, incluyendo distintos locales.',
    highlights: createStatGrid([
      { label: 'Vista', value: 'Calendario mensual', detail: 'Todos tus turnos agrupados por dia.' },
      { label: 'Entorno', value: (window.APP_CONFIG?.ENVIRONMENT || 'prod').toUpperCase(), detail: 'Puedes validar el flujo en prod o staging.' },
      { label: 'Cobertura', value: 'Multi local', detail: 'Un solo calendario para distintos locales asignados.' },
    ], { tone: 'dark' }),
    sideTitle: 'Sesion',
    sideStatus: sessionUser,
    sideCopy: 'Esta vista esta pensada para consulta rapida desde movil, pero mantiene suficiente detalle para escritorio.',
    sideActions: actions,
    layoutClassName: 'lg:gap-4xl',
    contentClassName: 'lg:basis-[68%]',
    titleClassName: 'max-w-[11ch] text-[clamp(44px,6vw,72px)]',
    leadClassName: 'max-w-[62ch]',
    sideClassName: 'lg:w-[300px]',
  });

  const controlsCard = createCard({
    eyebrow: 'Navegacion',
    title: 'Seleccion de mes',
    body: 'Cambia el periodo para revisar tus turnos cargados por mes.',
    className: 'relative z-20 overflow-visible rounded-3xl md:p-2xl',
  });
  const controlsSlot = document.createElement('div');
  controlsSlot.id = 'monthControlsSlot';
  controlsCard.appendChild(controlsSlot);

  const calendarCard = createCard({
    eyebrow: 'Calendario',
    title: 'Resumen mensual',
    body: '',
    className: 'relative z-10 rounded-3xl md:p-2xl',
  });
  calendarCard.innerHTML += `
    <section class="mt-xl rounded-3xl border border-neutral-charcoal/8 bg-white/74 p-lg">
      <div class="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap items-center gap-md">
          <h3 class="text-xl font-black text-neutral-charcoal">Resumen mensual</h3>
          <span id="totalTurnos" class="text-sm font-bold text-neutral-muted">0 turnos</span>
        </div>
        <div id="summaryLegend" class="flex flex-wrap gap-sm"></div>
      </div>
      <div class="mt-xl flex flex-col gap-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="monthTitle" class="text-3xl font-black text-neutral-charcoal">Mes</h2>
          <p id="monthSubtitle" class="mt-sm text-sm font-bold text-neutral-muted">Preparando consulta...</p>
        </div>
      </div>
      <div id="calendarGrid" class="mt-xl grid gap-md md:grid-cols-7">
        <div class="rounded-2xl border border-neutral-charcoal/10 bg-white/72 p-xl text-base font-bold text-neutral-muted">Cargando turnos...</div>
      </div>
    </section>
  `;

  shell.append(hero, controlsCard, calendarCard);
  app.appendChild(shell);

  createMonthControls();
  return { sessionUser };
}

async function cargarMes() {
  const rango = generarCalendarioMes();
  overlay.setLoading(true, 'Cargando calendario...');

  try {
    const data = await window.LVAuth.apiGet({
      accion: 'TurnosSemanaColaborador',
      fechaInicio: fechaISO(rango.inicio),
      fechaFin: fechaISO(rango.fin),
    });

    if (data.status !== 'SUCCESS') {
      throw new Error(data.mensaje || 'No se pudieron cargar tus turnos.');
    }

    renderCalendario(data.turnos || []);
    toast.show('success', 'Calendario cargado correctamente.');
  } catch (error) {
    $('calendarGrid').innerHTML = '<div class="rounded-2xl border border-neutral-charcoal/10 bg-white/72 p-xl text-base font-bold text-neutral-muted">No se pudo cargar el calendario.</div>';
    if (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN') {
      window.LVAuth.redirectToIndex('session');
      return;
    }
    toast.show('error', error.message || 'Error al cargar tus turnos.');
  } finally {
    overlay.setLoading(false);
  }
}

const { sessionUser } = buildAppShell();

document.addEventListener('DOMContentLoaded', async () => {
  session = await window.LVAuth.protectPage(['Colaborador']);
  if (!session) return;

  sessionUser.textContent = `${session.displayName || 'Colaborador'} · ${session.role}`;
  const actual = new Date();
  syncMonthPicker(actual.getFullYear(), actual.getMonth());
});
