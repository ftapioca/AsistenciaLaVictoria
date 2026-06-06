import '../styles/globals.css';
import '../../app-config.prod.js';
import '../../app-config.staging.js';
import '../../app-config.js';
import '../../env-badge.js';

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
let mesSeleccionado = null;
let anioSeleccionado = null;
let monthPicker = null;

const overlay = createLoadingOverlay('Preview visual');
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
  $('monthSubtitle').innerText = 'Calendario mensual mock para revisar diseño.';

  return { inicio, fin };
}

function createMockTurnos(inicio, fin) {
  const year = inicio.getFullYear();
  const month = inicio.getMonth();
  const totalDias = fin.getDate();
  const turnos = [];

  for (let day = 1; day <= totalDias; day++) {
    const date = new Date(year, month, day);
    const iso = fechaISO(date);
    const weekday = date.getDay();

    if (weekday === 0) {
      turnos.push({
        fecha: iso,
        local: 'Libre',
        tipoTurno: 'Libre',
        estado: 'Libre',
        observaciones: 'Descanso semanal',
      });
      continue;
    }

    if (weekday === 6) {
      turnos.push({
        fecha: iso,
        local: 'Paseo del Lago',
        tipoTurno: 'Partido',
        estado: 'Programado',
        inicio1: '11:30',
        fin1: '15:00',
        inicio2: '18:30',
        fin2: '22:30',
        observaciones: 'Turno partido de fin de semana',
      });
      continue;
    }

    turnos.push({
      fecha: iso,
      local: weekday % 2 === 0 ? 'Segunda Faja' : 'Paseo del Lago',
      tipoTurno: 'Programado',
      estado: 'Programado',
      inicio1: weekday === 5 ? '12:00' : '10:00',
      fin1: weekday === 5 ? '20:30' : '18:30',
      observaciones: weekday === 3 ? 'Apoyo apertura y cierre' : 'Turno regular',
    });
  }

  return turnos;
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
  $('totalTurnos').innerText = `Tienes ${turnosCompactados.length} turnos mock este mes`;
  updateLegend(turnosCompactados);

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

function cargarMesPreview() {
  const rango = generarCalendarioMes();
  const turnos = createMockTurnos(rango.inicio, rango.fin);
  renderCalendario(turnos);
  toast.show('success', 'Preview visual cargada correctamente.');
}

function monthPeriodValue(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

function syncMonthPicker(year, monthIndex) {
  if (!monthPicker) return;
  monthPicker.setValue('mensual', monthPeriodValue(year, monthIndex));
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
      cargarMesPreview();
    },
  });
  $('monthPickerSlot').appendChild(monthPicker.element);

  const prev = createButton('← Mes anterior', {
    variant: 'secondary',
    fullWidth: true,
    className: 'min-h-[52px] bg-white/82 text-brand-bun-dark hover:bg-white',
    onClick: () => {
      const base = new Date(mesSeleccionado.year, mesSeleccionado.month - 1, 1);
      syncMonthPicker(base.getFullYear(), base.getMonth());
    },
  });
  const current = createButton('Mes actual', {
    variant: 'secondary',
    fullWidth: true,
    className: 'min-h-[52px] bg-white/82 text-brand-bun-dark hover:bg-white',
    onClick: () => {
      const actual = new Date();
      syncMonthPicker(actual.getFullYear(), actual.getMonth());
    },
  });
  const next = createButton('Mes siguiente →', {
    variant: 'secondary',
    fullWidth: true,
    className: 'min-h-[52px] bg-white/82 text-brand-bun-dark hover:bg-white',
    onClick: () => {
      const base = new Date(mesSeleccionado.year, mesSeleccionado.month + 1, 1);
      syncMonthPicker(base.getFullYear(), base.getMonth());
    },
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
  sessionUser.className = 'rounded-2xl border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-lg text-sm font-black leading-relaxed text-neutral-cream md:text-base';
  sessionUser.textContent = 'Felipe Tapia · Colaborador';

  const actions = document.createElement('div');
  actions.className = 'flex flex-col gap-md';
  actions.append(
    createButton('Volver al ingreso', {
      variant: 'secondary',
      fullWidth: true,
      className: 'bg-white/88 text-neutral-charcoal hover:bg-white',
      onClick: () => { window.location.href = withCurrentEnvironment('index.html'); },
    })
  );

  const hero = createPageHero({
    badge: 'La Victoria · Mis Turnos',
    title: 'Mis turnos',
    lead: 'Preview visual del calendario personal. Sirve para revisar layout, densidad de información y comportamiento responsive sin depender de sesión ni backend.',
    highlights: createStatGrid([
      { label: 'Vista', value: 'Calendario mensual', detail: 'Todos tus turnos agrupados por día.' },
      { label: 'Entorno', value: (window.APP_CONFIG?.ENVIRONMENT || 'prod').toUpperCase(), detail: 'La preview respeta el entorno activo del frontend.' },
      { label: 'Estado', value: 'Preview sin auth', detail: 'Navegación y datos simulados solo para revisión visual.' },
    ], { tone: 'dark' }),
    sideTitle: 'Preview',
    sideStatus: sessionUser,
    sideCopy: 'Puedes cambiar de mes y validar densidad del calendario, pills, tooltips y estados visuales antes de conectar flujos reales.',
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
    body: 'Cambia el periodo para revisar el comportamiento visual del calendario.',
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
          <p id="monthSubtitle" class="mt-sm text-sm font-bold text-neutral-muted">Preparando preview...</p>
        </div>
      </div>
      <div id="calendarGrid" class="mt-xl grid gap-md md:grid-cols-7">
        <div class="rounded-2xl border border-neutral-charcoal/10 bg-white/72 p-xl text-base font-bold text-neutral-muted">Cargando preview...</div>
      </div>
    </section>
  `;

  shell.append(hero, controlsCard, calendarCard);
  app.appendChild(shell);
  createMonthControls();
}

buildAppShell();
