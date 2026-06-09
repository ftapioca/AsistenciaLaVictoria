import '../styles/globals.css';
import '../../app-config.prod.js';
import '../../app-config.staging.js';
import '../../app-config.js';
import '../../env-badge.js';
import '../../auth.js';

import { createBadge } from '../components/Badge.js';
import { createButton } from '../components/Button.js';
import { createCard } from '../components/Card.js';
import { createSelectField } from '../components/Input.js';
import { createLoadingOverlay } from '../components/LoadingOverlay.js';
import { createPageHero } from '../components/PageHero.js';
import { createToast } from '../components/Toast.js';

const $ = (id) => document.getElementById(id);
const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
const LOCALES = ['Paseo del Lago', 'Segunda Faja'];

let localActivo = LOCALES[0];
let semana = [];
let colaboradores = [];
let turnos = [];
let celdaActual = null;
let horarioCeldaActual = null;
let plantillasTurnos = [];
let plantillaAplicadaActual = '';
let colaboradoresSeleccionados = new Set();
let modoMasivo = false;
let fechaMasivaActual = null;
let turnoCopiado = null;
let fechasAplicacionAdicional = [];
let modalTipoField = null;
let modalEstadoField = null;

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

function setStatus(tipo, mensaje) {
  const tones = {
    loading: 'border-brand-cheese/28 bg-brand-cheese/18 text-brand-bun-dark',
    success: 'border-brand-lettuce/24 bg-brand-lettuce/12 text-brand-lettuce',
    error: 'border-brand-ketchup/24 bg-brand-ketchup/12 text-brand-ketchup',
  };
  const box = $('statusBox');
  box.className = `rounded-2xl border px-lg py-md text-sm font-bold leading-relaxed ${tones[tipo] || tones.loading}`;
  box.textContent = mensaje;
  box.hidden = false;
}

function limpiarStatus() {
  const box = $('statusBox');
  box.hidden = true;
  box.textContent = '';
}

function setGridLoading(loading) {
  $('gridWrap').classList.toggle('loading', loading);
  $('gridWrap').querySelector('.grid-content')?.classList.toggle('blur-[5px]', loading);
  $('gridWrap').querySelector('.grid-content')?.classList.toggle('opacity-70', loading);
  $('gridLoadingOverlay')?.classList.toggle('hidden', !loading);
  $('gridLoadingOverlay')?.classList.toggle('grid', loading);
}

function setModalLoading(loading) {
  $('turnoModal').classList.toggle('loading', loading);
  $('turnoModal').querySelector('.modal-shell')?.classList.toggle('blur-[5px]', loading);
  $('turnoModal').querySelector('.modal-shell')?.classList.toggle('opacity-70', loading);
  $('modalLoadingOverlay')?.classList.toggle('hidden', !loading);
  $('modalLoadingOverlay')?.classList.toggle('grid', loading);
}

function actualizarReloj() {
  $('clock').textContent = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

function fechaISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fechaCL(date) {
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
}

function lunesDeSemana(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function moverSemana(delta) {
  const base = lunesDeSemana(new Date(`${$('fechaSemana').value}T00:00:00`));
  base.setDate(base.getDate() + (delta * 7));
  $('fechaSemana').value = fechaISO(base);
  cargarSemana();
}

function generarSemana() {
  const base = lunesDeSemana(new Date(`${$('fechaSemana').value}T00:00:00`));
  semana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d;
  });
  $('fechaSemana').value = fechaISO(base);
  $('weekTitle').textContent = `Semana ${fechaCL(semana[0])} al ${fechaCL(semana[6])}`;
}

async function apiGet(params) {
  return window.LVAuth.apiGet(params);
}

async function apiPost(params) {
  return window.LVAuth.apiPost(params);
}

function renderLocalTabs() {
  const tabs = $('localTabs');
  tabs.innerHTML = '';
  LOCALES.forEach((local) => {
    const button = createButton(local, {
      variant: local === localActivo ? 'primary' : 'secondary',
      className: local === localActivo
        ? 'min-w-[180px] shadow-none'
        : 'min-w-[180px] bg-brand-cheese/20 text-brand-bun-dark shadow-none hover:bg-brand-bun/10',
      onClick: () => cambiarLocal(local),
    });
    tabs.appendChild(button);
  });
}

async function cambiarLocal(local) {
  overlay.setLoading(true, 'Cambiando local...');
  await waitNextFrame();
  try {
    localActivo = local;
    renderLocalTabs();
    await cargarSemana(false);
  } finally {
    overlay.setLoading(false);
  }
}

async function cargarSemana(usePageLoading = true) {
  if (usePageLoading) {
    overlay.setLoading(true, 'Cargando semana...');
    await waitNextFrame();
  }
  limpiarStatus();
  setGridLoading(true);
  try {
    generarSemana();
    const local = localActivo;
    const fechaInicio = fechaISO(semana[0]);
    const fechaFin = fechaISO(semana[6]);

    const data = await apiGet({ accion: 'BootstrapProgramadorTurnos', local, fechaInicio, fechaFin });
    if (data.status !== 'SUCCESS') throw new Error(data.mensaje || 'No se pudieron cargar los datos del programador.');
    plantillasTurnos = data.data?.plantillas || [];
    colaboradores = data.data?.colaboradores || [];
    turnos = data.data?.turnos || [];

    renderTabla();
  } catch (err) {
    if (err.code === 'UNAUTHORIZED' || err.code === 'FORBIDDEN') {
      window.LVAuth.redirectToIndex('session');
      return;
    }
    setStatus('error', err.message || 'Error al cargar la semana.');
  } finally {
    setGridLoading(false);
    if (usePageLoading) overlay.setLoading(false);
  }
}

function buscarTurno(colaborador, fecha) {
  return turnos.find((t) => t.colaborador === colaborador && t.fecha === fecha);
}

function renderTurno(turno) {
  if (!turno) return `<div class="grid h-full content-center gap-xs rounded-2xl border border-dashed border-neutral-charcoal/10 bg-neutral-cream/70 p-sm text-center text-xs font-black text-neutral-muted">Sin turno<span class="text-[11px] font-bold text-neutral-muted">Click para asignar</span></div>`;
  if (turno.tipoTurno === 'Libre' || turno.estado === 'Libre') return `<div class="grid h-full content-center gap-xs rounded-2xl border border-brand-cheese/24 bg-brand-cheese/28 p-sm text-center text-xs font-black text-brand-bun-dark">Libre<span class="text-[11px] font-bold text-brand-bun-dark/80">0 h</span></div>`;
  if (turno.tipoTurno === 'Partido') {
    return `<div class="grid h-full content-center gap-xs rounded-2xl border border-brand-bun/16 bg-brand-bun/14 p-sm text-center text-xs font-black text-brand-bun-dark">${turno.inicio1}-${turno.fin1}<br>${turno.inicio2}-${turno.fin2}<span class="text-[11px] font-bold text-neutral-muted">${turno.horasProgramadas || 0} h · ${turno.origenHorario || ''}</span></div>`;
  }
  return `<div class="grid h-full content-center gap-xs rounded-2xl border border-brand-lettuce/16 bg-brand-lettuce/14 p-sm text-center text-xs font-black text-brand-lettuce">${turno.inicio1}-${turno.fin1}<span class="text-[11px] font-bold text-neutral-muted">${turno.horasProgramadas || 0} h · ${turno.origenHorario || ''}</span></div>`;
}

function renderTabla() {
  const head = $('tableHead');
  const body = $('tableBody');

  head.innerHTML = `
    <tr>
      <th class="sticky left-0 top-0 z-[3] min-w-[220px] bg-[#fffaf1] px-md py-md text-left text-xs font-black uppercase tracking-[0.12em] text-brand-bun-dark">Colaborador</th>
      ${semana.map((d, i) => `
        <th class="sticky top-0 z-[2] min-w-[130px] bg-brand-cheese/24 px-md py-md text-center text-xs font-black uppercase tracking-[0.12em] text-brand-bun-dark">
          ${dias[i]}<br>
          <span class="text-[11px] font-bold normal-case tracking-normal text-neutral-muted">${fechaCL(d)}</span><br>
          <button type="button" data-masivo="${fechaISO(d)}" class="mt-sm inline-flex size-7 items-center justify-center rounded-full bg-gradient-to-r from-brand-cheese to-brand-bun text-lg font-black text-neutral-charcoal">+</button>
        </th>
      `).join('')}
    </tr>
  `;

  if (!colaboradores.length) {
    body.innerHTML = `<tr><td colspan="8" class="px-lg py-lg text-sm font-bold text-neutral-muted">No hay colaboradores para este local.</td></tr>`;
    $('totalTurnos').textContent = '0 turnos cargados';
    return;
  }

  body.innerHTML = colaboradores.map((nombre) => {
    const cells = semana.map((date) => {
      const iso = fechaISO(date);
      const turno = buscarTurno(nombre, iso);
      return `<td class="h-[82px] min-w-[130px] cursor-pointer border-b border-r border-neutral-charcoal/8 bg-white/74 p-sm align-top hover:bg-white" data-colaborador="${escapeHtml(nombre)}" data-fecha="${iso}">${renderTurno(turno)}</td>`;
    }).join('');
    return `
      <tr>
        <td class="sticky left-0 z-[1] min-w-[220px] max-w-[220px] border-b border-r border-neutral-charcoal/8 bg-[#fffaf1] px-md py-md align-top text-sm font-black text-neutral-charcoal">
          <label class="flex items-center gap-sm">
            <input type="checkbox" class="size-4 accent-brand-bun" data-check-colab="${escapeHtml(nombre)}">
            <span>${escapeHtml(nombre)}</span>
          </label>
        </td>
        ${cells}
      </tr>
    `;
  }).join('');

  $('totalTurnos').textContent = `${turnos.length} turnos cargados`;

  body.querySelectorAll('td[data-colaborador]').forEach((cell) => {
    cell.addEventListener('click', () => abrirModal(cell.dataset.colaborador, cell.dataset.fecha));
  });
  body.querySelectorAll('[data-check-colab]').forEach((input) => {
    input.addEventListener('change', (event) => toggleColaboradorSeleccionado(event.target.dataset.checkColab, event.target.checked));
  });
  head.querySelectorAll('[data-masivo]').forEach((button) => {
    button.addEventListener('click', () => abrirModalMasivo(button.dataset.masivo));
  });
}

function normalizar(valor) {
  return String(valor || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

function mostrarHorarioAplicable(horario) {
  const extra = horario.nombreEvento ? ` · ${horario.nombreEvento}` : '';
  const trasnoche = normalizar(horario.permiteTrasnoche) === 'si' ? 'permite trasnoche' : 'sin trasnoche';
  const box = $('horarioInfo');
  box.className = 'rounded-2xl border border-brand-cheese/24 bg-brand-cheese/16 px-lg py-md text-sm font-bold leading-relaxed text-brand-bun-dark';
  box.textContent = `Horario ${horario.origen || ''}${extra}: ${horario.horaApertura || '--:--'} a ${horario.horaCierre || '--:--'} · ${trasnoche}`;
}

function setModalStatus(tipo, mensaje) {
  const tones = {
    loading: 'border-brand-cheese/28 bg-brand-cheese/18 text-brand-bun-dark',
    success: 'border-brand-lettuce/24 bg-brand-lettuce/12 text-brand-lettuce',
    error: 'border-brand-ketchup/24 bg-brand-ketchup/12 text-brand-ketchup',
  };
  const box = $('modalStatus');
  box.className = `rounded-2xl border px-lg py-md text-sm font-bold leading-relaxed ${tones[tipo] || tones.loading}`;
  box.textContent = mensaje;
  box.hidden = false;
}

function limpiarModalStatus() {
  const box = $('modalStatus');
  box.hidden = true;
  box.textContent = '';
}

function renderPlantillasModal() {
  const box = $('plantillasBox');
  box.innerHTML = '';
  if (!plantillasTurnos.length) {
    const span = document.createElement('span');
    span.className = 'text-sm font-bold text-neutral-muted';
    span.textContent = 'No hay plantillas configuradas para este local.';
    box.appendChild(span);
    return;
  }

  plantillasTurnos.forEach((plantilla, index) => {
    const button = createButton(plantilla.nombrePlantilla, {
      variant: 'secondary',
      className: 'rounded-full bg-brand-cheese/18 px-md py-sm text-sm text-brand-bun-dark shadow-none hover:bg-brand-bun hover:text-neutral-charcoal',
      onClick: () => aplicarPlantillaTurno(index),
    });
    box.appendChild(button);
  });
}

function aplicarPlantillaTurno(index) {
  const plantilla = plantillasTurnos[index];
  if (!plantilla) return;
  plantillaAplicadaActual = plantilla.nombrePlantilla || '';
  modalTipoField.setValue(plantilla.tipoTurno || 'Simple', false);
  if (plantilla.tipoTurno === 'Libre') {
    modalEstadoField.setValue('Libre', false);
    $('inicio1').value = '';
    $('fin1').value = '';
    $('inicio2').value = '';
    $('fin2').value = '';
  } else {
    modalEstadoField.setValue('Programado', false);
    $('inicio1').value = plantilla.inicio1 || '';
    $('fin1').value = plantilla.fin1 || '';
    $('inicio2').value = plantilla.inicio2 || '';
    $('fin2').value = plantilla.fin2 || '';
  }
  refrescarCamposModal();
}

function renderOpcionesDiasAplicacion(fechaBase) {
  const grid = $('applyDaysGrid');
  const fechaActual = fechaBase || celdaActual?.fecha;
  if (!fechaActual) {
    grid.innerHTML = '';
    $('applyDaysField').classList.add('hidden');
    return;
  }
  $('applyDaysField').classList.remove('hidden');
  grid.innerHTML = semana.map((date, index) => {
    const iso = fechaISO(date);
    const esFechaActual = iso === fechaActual;
    const checked = esFechaActual || fechasAplicacionAdicional.includes(iso);
    return `
      <label class="flex items-center gap-sm rounded-2xl border ${esFechaActual ? 'border-brand-lettuce/20 bg-brand-lettuce/10' : 'border-neutral-charcoal/8 bg-white/72'} px-md py-md text-sm font-bold text-neutral-charcoal">
        <input type="checkbox" class="size-4 accent-brand-bun" data-apply-fecha="${iso}" ${checked ? 'checked' : ''} ${esFechaActual ? 'disabled' : ''}>
        <span>${dias[index]} · ${fechaCL(date)}</span>
      </label>
    `;
  }).join('');

  grid.querySelectorAll('[data-apply-fecha]').forEach((input) => {
    input.addEventListener('change', (event) => toggleFechaAplicacion(event.target.dataset.applyFecha, event.target.checked));
  });
}

function toggleFechaAplicacion(fecha, checked) {
  if (checked) {
    if (!fechasAplicacionAdicional.includes(fecha)) fechasAplicacionAdicional.push(fecha);
  } else {
    fechasAplicacionAdicional = fechasAplicacionAdicional.filter((item) => item !== fecha);
  }
}

function obtenerFechasSeleccionadasParaGuardado() {
  if (!celdaActual?.fecha) return [];
  return [celdaActual.fecha, ...fechasAplicacionAdicional.filter((fecha) => fecha !== celdaActual.fecha)];
}

function refrescarCamposModal() {
  const tipo = $('modalTipo').value;
  if (tipo === 'Libre') $('modalEstado').value = 'Libre';
  if (tipo === 'Simple' || tipo === 'Partido') $('modalEstado').value = 'Programado';
  const estado = $('modalEstado').value;
  const libre = tipo === 'Libre' || estado === 'Libre';
  $('tramo1Box').classList.toggle('hidden', libre);
  $('tramo2Box').classList.toggle('hidden', tipo !== 'Partido' || libre);
}

function abrirBackdropModal() {
  const backdrop = $('modalBackdrop');
  backdrop.classList.remove('hidden');
  backdrop.classList.add('flex');
  backdrop.style.display = 'flex';
  backdrop.style.alignItems = 'center';
  backdrop.style.justifyContent = 'center';
}

function cerrarBackdropModal() {
  const backdrop = $('modalBackdrop');
  backdrop.classList.remove('flex');
  backdrop.classList.add('hidden');
  backdrop.style.display = '';
  backdrop.style.alignItems = '';
  backdrop.style.justifyContent = '';
}

async function abrirModal(colaborador, fecha) {
  limpiarModalStatus();
  celdaActual = { colaborador, fecha };
  horarioCeldaActual = null;
  fechasAplicacionAdicional = [];
  const turno = buscarTurno(colaborador, fecha);
  $('btnEliminarTurno').classList.toggle('hidden', !turno);
  $('btnCopiarTurno').classList.toggle('hidden', !turno);
  plantillaAplicadaActual = turno?.plantillaAplicada || '';

  $('modalTitle').textContent = 'Asignar turno';
  $('modalSubtitle').textContent = `${colaborador} · ${fecha} · ${localActivo}`;
  modalTipoField.setValue(turno?.tipoTurno || 'Simple', false);
  modalEstadoField.setValue(turno?.estado || 'Programado', false);
  $('inicio1').value = turno?.inicio1 || '';
  $('fin1').value = turno?.fin1 || '';
  $('inicio2').value = turno?.inicio2 || '';
  $('fin2').value = turno?.fin2 || '';
  $('observaciones').value = turno?.observaciones || '';
  renderOpcionesDiasAplicacion(fecha);
  if (!turno && turnoCopiado) {
    modalTipoField.setValue(turnoCopiado.tipoTurno || 'Simple', false);
    modalEstadoField.setValue(turnoCopiado.estado || 'Programado', false);
    $('inicio1').value = turnoCopiado.inicio1 || '';
    $('fin1').value = turnoCopiado.fin1 || '';
    $('inicio2').value = turnoCopiado.inicio2 || '';
    $('fin2').value = turnoCopiado.fin2 || '';
    $('observaciones').value = turnoCopiado.observaciones || '';
    plantillaAplicadaActual = turnoCopiado.plantillaAplicada || '';
  }
  $('horarioInfo').className = 'rounded-2xl border border-brand-cheese/24 bg-brand-cheese/16 px-lg py-md text-sm font-bold leading-relaxed text-brand-bun-dark';
  $('horarioInfo').textContent = 'Cargando horario del local...';
  refrescarCamposModal();
  abrirBackdropModal();
  renderPlantillasModal();

  try {
    const data = await apiGet({ accion: 'HorarioLocal', local: localActivo, fecha });
    if (data.status !== 'SUCCESS') throw new Error(data.mensaje || 'No se encontró horario configurado.');
    horarioCeldaActual = { origen: data.origen, ...(data.horario || {}) };
    mostrarHorarioAplicable(horarioCeldaActual);
    if (!turno && $('modalTipo').value === 'Simple') {
      $('inicio1').value = horarioCeldaActual.horaApertura || '';
      $('fin1').value = horarioCeldaActual.horaCierre || '';
    }
  } catch (err) {
    $('horarioInfo').className = 'rounded-2xl border border-brand-ketchup/24 bg-brand-ketchup/12 px-lg py-md text-sm font-bold leading-relaxed text-brand-ketchup';
    $('horarioInfo').textContent = err.message || 'No se pudo cargar el horario del local.';
  }
}

function cerrarModal() {
  setModalLoading(false);
  cerrarBackdropModal();
  celdaActual = null;
  horarioCeldaActual = null;
  modoMasivo = false;
  fechaMasivaActual = null;
  plantillaAplicadaActual = '';
  fechasAplicacionAdicional = [];
}

function esHoraValida(hora) {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(String(hora || '').trim());
}

function normalizarHoraTexto(hora) {
  return String(hora || '').trim();
}

function formatearHoraHHMM(hora) {
  hora = normalizarHoraTexto(hora);
  if (!esHoraValida(hora)) {
    throw new Error(`La hora "${hora}" no es válida. Usa formato 24 horas HH:mm.`);
  }
  const partes = hora.split(':');
  return `${partes[0].padStart(2, '0')}:${partes[1]}`;
}

function timeToMin(hora) {
  const [h, m] = String(hora || '0:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function normalizarIntervalo(inicio, fin) {
  const ini = timeToMin(inicio);
  let end = timeToMin(fin);
  const esTrasnoche = end <= ini;
  if (esTrasnoche) end += 24 * 60;
  return { inicio: ini, fin: end, esTrasnoche };
}

function validarTramoEnHorario(inicio, fin, horario, nombreTramo) {
  const permiteTrasnoche = normalizar(horario.permiteTrasnoche) === 'si';
  const tramo = normalizarIntervalo(inicio, fin);
  const apertura = timeToMin(horario.horaApertura);
  let cierre = timeToMin(horario.horaCierre);
  if (cierre <= apertura) cierre += 24 * 60;
  if (tramo.esTrasnoche && !permiteTrasnoche) return { ok: false, mensaje: `El ${nombreTramo} cruza medianoche, pero el local no permite trasnoche.` };
  if (tramo.inicio < apertura || tramo.fin > cierre) return { ok: false, mensaje: `El ${nombreTramo} está fuera del horario del local (${horario.horaApertura} a ${horario.horaCierre}).` };
  return { ok: true };
}

function validarTurnoContraHorario(turno, horario) {
  if (turno.tipoTurno === 'Libre' || turno.estado === 'Libre') return { ok: true };
  if (!turno.inicio1 || !turno.fin1) return { ok: false, mensaje: 'Debes indicar hora de inicio y hora de fin.' };
  if (turno.tipoTurno === 'Partido' && (!turno.inicio2 || !turno.fin2)) return { ok: false, mensaje: 'Para turno partido debes completar el segundo tramo.' };
  if (!horario || !horario.horaApertura || !horario.horaCierre) return { ok: false, mensaje: 'No hay horario configurado para validar este turno.' };
  if (normalizar(horario.tipoEspecial) === 'cerrado') return { ok: false, mensaje: 'El local está marcado como cerrado para esta fecha.' };
  const tramos = [{ inicio: turno.inicio1, fin: turno.fin1, nombre: 'primer tramo' }];
  if (turno.tipoTurno === 'Partido') tramos.push({ inicio: turno.inicio2, fin: turno.fin2, nombre: 'segundo tramo' });
  for (const tramo of tramos) {
    const res = validarTramoEnHorario(tramo.inicio, tramo.fin, horario, tramo.nombre);
    if (!res.ok) return res;
  }
  if (turno.tipoTurno === 'Partido') {
    const a = normalizarIntervalo(turno.inicio1, turno.fin1);
    const b = normalizarIntervalo(turno.inicio2, turno.fin2);
    if (b.inicio < a.fin) return { ok: false, mensaje: 'El segundo tramo no puede comenzar antes de terminar el primero.' };
  }
  return { ok: true };
}

async function cargarHorarioLocalParaFecha(fecha) {
  const data = await apiGet({ accion: 'HorarioLocal', local: localActivo, fecha });
  if (data.status !== 'SUCCESS') throw new Error(data.mensaje || `No se encontró horario configurado para ${fecha}.`);
  return { origen: data.origen, ...(data.horario || {}) };
}

async function guardarTurnoPorColaboradorEnFechas(payloadBase, colaborador, fechas) {
  for (const fecha of fechas) {
    const horarioFecha = fecha === celdaActual?.fecha && horarioCeldaActual ? horarioCeldaActual : await cargarHorarioLocalParaFecha(fecha);
    const payloadFecha = { ...payloadBase, fecha, colaborador };
    const validacionFecha = validarTurnoContraHorario(payloadFecha, horarioFecha);
    if (!validacionFecha.ok) {
      throw new Error(`${dias[semana.findIndex((d) => fechaISO(d) === fecha)] || fecha}: ${validacionFecha.mensaje}`);
    }
    const data = await apiPost(payloadFecha);
    if (data.status !== 'SUCCESS') throw new Error(data.mensaje || `No se pudo guardar el turno para ${colaborador} en ${fecha}.`);
  }
}

async function guardarTurno() {
  if (!celdaActual && !modoMasivo) return;
  setModalLoading(true);
  $('btnGuardarTurno').disabled = true;
  await waitNextFrame();
  try {
    const horas = [$('inicio1').value, $('fin1').value, $('inicio2').value, $('fin2').value].filter(Boolean);
    for (const hora of horas) {
      if (!esHoraValida(normalizarHoraTexto(hora))) throw new Error(`La hora "${hora}" no es válida. Usa formato HH:mm.`);
    }
    const tipoTurno = $('modalTipo').value;
    const estado = $('modalEstado').value;
    let inicio1 = '';
    let fin1 = '';
    let inicio2 = '';
    let fin2 = '';
    if (tipoTurno !== 'Libre' && estado !== 'Libre') {
      inicio1 = formatearHoraHHMM($('inicio1').value);
      fin1 = formatearHoraHHMM($('fin1').value);
      if (tipoTurno === 'Partido') {
        inicio2 = formatearHoraHHMM($('inicio2').value);
        fin2 = formatearHoraHHMM($('fin2').value);
      }
    }
    const payload = {
      accion: 'GuardarTurno',
      fecha: modoMasivo ? fechaMasivaActual : celdaActual.fecha,
      colaborador: modoMasivo ? '' : celdaActual.colaborador,
      local: localActivo,
      tipoTurno,
      estado,
      inicio1,
      fin1,
      inicio2,
      fin2,
      observaciones: $('observaciones').value,
      plantillaAplicada: plantillaAplicadaActual,
    };
    const validacion = validarTurnoContraHorario(payload, horarioCeldaActual);
    if (!validacion.ok) throw new Error(validacion.mensaje);
    if (modoMasivo) {
      const colaboradoresArray = Array.from(colaboradoresSeleccionados);
      for (const colaborador of colaboradoresArray) {
        const data = await apiPost({ ...payload, fecha: fechaMasivaActual, colaborador });
        if (data.status !== 'SUCCESS') throw new Error(data.mensaje || `No se pudo guardar el turno para ${colaborador}.`);
      }
      limpiarSeleccionColaboradores();
      cerrarModal();
      await cargarSemana();
      toast.show('success', `Turno asignado a ${colaboradoresArray.length} colaboradores.`);
    } else {
      const fechasGuardar = obtenerFechasSeleccionadasParaGuardado();
      await guardarTurnoPorColaboradorEnFechas(payload, celdaActual.colaborador, fechasGuardar);
      cerrarModal();
      await cargarSemana();
      toast.show('success', fechasGuardar.length > 1 ? `Turno guardado en ${fechasGuardar.length} días para ${celdaActual.colaborador}.` : 'Turno guardado correctamente.');
    }
  } catch (err) {
    setModalStatus('error', err.message || 'Error al guardar turno.');
  } finally {
    setModalLoading(false);
    $('btnGuardarTurno').disabled = false;
  }
}

function toggleColaboradorSeleccionado(nombre, checked) {
  if (checked) colaboradoresSeleccionados.add(nombre);
  else colaboradoresSeleccionados.delete(nombre);
}

function limpiarSeleccionColaboradores() {
  colaboradoresSeleccionados.clear();
  document.querySelectorAll('[data-check-colab]').forEach((input) => { input.checked = false; });
}

function abrirModalMasivo(fecha) {
  if (!colaboradoresSeleccionados.size) {
    toast.show('warn', 'Selecciona al menos un colaborador antes de aplicar un turno.');
    return;
  }
  modoMasivo = true;
  fechaMasivaActual = fecha;
  celdaActual = null;
  horarioCeldaActual = null;
  plantillaAplicadaActual = '';
  limpiarModalStatus();
  $('btnEliminarTurno').classList.add('hidden');
  $('btnCopiarTurno').classList.add('hidden');
  $('modalTitle').textContent = 'Asignar turno masivo';
  $('modalSubtitle').textContent = `${colaboradoresSeleccionados.size} colaboradores · ${fecha} · ${localActivo}`;
  modalTipoField.setValue('Simple', false);
  modalEstadoField.setValue('Programado', false);
  $('inicio1').value = '';
  $('fin1').value = '';
  $('inicio2').value = '';
  $('fin2').value = '';
  $('observaciones').value = '';
  $('applyDaysField').classList.add('hidden');
  $('horarioInfo').className = 'rounded-2xl border border-brand-cheese/24 bg-brand-cheese/16 px-lg py-md text-sm font-bold leading-relaxed text-brand-bun-dark';
  $('horarioInfo').textContent = 'Cargando horario del local...';
  refrescarCamposModal();
  abrirBackdropModal();
  renderPlantillasModal();
  apiGet({ accion: 'HorarioLocal', local: localActivo, fecha })
    .then((data) => {
      if (data.status !== 'SUCCESS') throw new Error(data.mensaje || 'No se encontró horario configurado.');
      horarioCeldaActual = { origen: data.origen, ...(data.horario || {}) };
      mostrarHorarioAplicable(horarioCeldaActual);
      $('inicio1').value = horarioCeldaActual.horaApertura || '';
      $('fin1').value = horarioCeldaActual.horaCierre || '';
    })
    .catch((err) => {
      $('horarioInfo').className = 'rounded-2xl border border-brand-ketchup/24 bg-brand-ketchup/12 px-lg py-md text-sm font-bold leading-relaxed text-brand-ketchup';
      $('horarioInfo').textContent = err.message || 'No se pudo cargar el horario del local.';
    });
}

async function eliminarTurnoActual() {
  if (modoMasivo) {
    toast.show('warn', 'La eliminación masiva no está disponible.');
    return;
  }
  if (!celdaActual) return;
  if (!window.confirm('¿Seguro que deseas eliminar este turno?')) return;
  try {
    setModalLoading(true);
    await waitNextFrame();
    const data = await apiGet({ accion: 'EliminarTurno', fecha: celdaActual.fecha, colaborador: celdaActual.colaborador, local: localActivo });
    if (data.status !== 'SUCCESS') throw new Error(data.mensaje || 'No se pudo eliminar el turno.');
    cerrarModal();
    await cargarSemana(false);
    toast.show('success', 'Turno eliminado correctamente.');
  } catch (err) {
    setModalStatus('error', err.message || 'Error al eliminar turno.');
  } finally {
    setModalLoading(false);
  }
}

function copiarTurnoActual() {
  if (modoMasivo || !celdaActual) return;
  const turno = buscarTurno(celdaActual.colaborador, celdaActual.fecha);
  if (!turno) {
    setModalStatus('error', 'No hay turno para copiar.');
    return;
  }
  turnoCopiado = {
    tipoTurno: turno.tipoTurno,
    estado: turno.estado,
    inicio1: turno.inicio1,
    fin1: turno.fin1,
    inicio2: turno.inicio2,
    fin2: turno.fin2,
    observaciones: turno.observaciones || '',
    plantillaAplicada: turno.plantillaAplicada || '',
  };
  cerrarModal();
  toast.show('success', 'Turno copiado. Ahora haz clic en otra celda para pegarlo.');
}

function contarTurnosSemanaActual() {
  return Array.isArray(turnos) ? turnos.length : 0;
}

async function contarTurnosDestino(fechaInicioDestino) {
  const fechaActualInicio = semana[0] ? fechaISO(semana[0]) : '';
  if (fechaInicioDestino === fechaActualInicio) return contarTurnosSemanaActual();
  const inicio = new Date(`${fechaInicioDestino}T00:00:00`);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 6);
  const data = await apiGet({ accion: 'TurnosSemana', local: localActivo, fechaInicio: fechaInicioDestino, fechaFin: fechaISO(fin) });
  if (data.status !== 'SUCCESS') throw new Error(data.mensaje || 'No se pudieron revisar los turnos existentes en la semana destino.');
  return Array.isArray(data.turnos) ? data.turnos.length : 0;
}

async function copiarSemana(config) {
  const turnosExistentes = await contarTurnosDestino(config.fechaInicioDestino);
  let mensajeConfirmacion = config.mensajeConfirmacionBase;
  if (turnosExistentes > 0) {
    mensajeConfirmacion += `\n\n⚠️ Ya existen ${turnosExistentes} turnos cargados en la semana destino. Si continúas, los turnos coincidentes se actualizarán.`;
  }
  mensajeConfirmacion += '\n\n¿Continuar?';
  if (!window.confirm(mensajeConfirmacion)) return;
  overlay.setLoading(true, config.mensajeCarga);
  await waitNextFrame();
  setGridLoading(true);
  try {
    const data = await apiGet({ accion: 'CopiarSemana', local: localActivo, fechaInicio: config.fechaInicioDestino });
    if (data.status !== 'SUCCESS') throw new Error(data.mensaje || 'No se pudo copiar la semana.');
    await cargarSemana(false);
    toast.show('success', `${config.mensajeExito}\n${data.turnosCopiados} turnos copiados\n${data.creados} creados · ${data.actualizados} actualizados`);
  } catch (err) {
    toast.show('error', err.message || config.mensajeError);
  } finally {
    setGridLoading(false);
    overlay.setLoading(false);
  }
}

function copiarSemanaAnterior() {
  return copiarSemana({
    fechaInicioDestino: fechaISO(semana[0]),
    mensajeCarga: 'Copiando semana anterior...',
    mensajeConfirmacionBase: `Se copiarán los turnos de la semana anterior hacia la semana actual para ${localActivo}.`,
    mensajeError: 'Error al copiar semana anterior.',
    mensajeExito: 'Semana anterior copiada',
  });
}

function copiarSemanaSiguiente() {
  const siguienteLunes = new Date(semana[0]);
  siguienteLunes.setDate(siguienteLunes.getDate() + 7);
  return copiarSemana({
    fechaInicioDestino: fechaISO(siguienteLunes),
    mensajeCarga: 'Copiando turnos a la siguiente semana...',
    mensajeConfirmacionBase: `Se copiarán los turnos de la semana actual hacia la semana siguiente para ${localActivo}.`,
    mensajeError: 'Error al copiar turnos para la siguiente semana.',
    mensajeExito: 'Semana siguiente copiada',
  });
}

function buildApp(session) {
  const app = $('app');
  const shell = document.createElement('div');
  shell.className = 'mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl';

  const clock = createBadge('--:--', { tone: 'dark', className: 'shadow-none' });
  clock.id = 'clock';

  const sessionUser = document.createElement('div');
  sessionUser.id = 'authUser';
  sessionUser.className = 'text-sm font-black text-neutral-cream';
  sessionUser.textContent = `${session.displayName || 'Administrador'} · ${session.role}`;

  const heroActions = document.createElement('div');
  heroActions.className = 'flex flex-col gap-md sm:flex-row';
  heroActions.append(
    createButton('Volver al panel', {
      variant: 'secondary',
      className: 'bg-white/88 text-neutral-charcoal hover:bg-white',
      onClick: () => { window.location.href = withCurrentEnvironment('adminPanel.html'); },
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

  const heroSide = document.createElement('div');
  heroSide.className = 'grid gap-md';
  heroSide.append(clock, sessionUser, heroActions);

  const hero = createPageHero({
    badge: 'La Victoria · Programación semanal',
    title: 'Programador de turnos',
    lead: 'Asigna turnos por colaborador, local y semana. Las pestañas de local viven junto a la grilla y la barra superior queda dedicada a navegación semanal.',
    sideTitle: 'Sesión y reloj',
    sideStatus: heroSide,
    sideCopy: 'Mantén una sola semana visible y usa las acciones rápidas para copiar o editar la programación.',
    sideClassName: 'lg:w-[360px]',
    titleClassName: 'max-w-[10ch] text-[clamp(36px,5vw,64px)]',
    leadClassName: 'max-w-[64ch]',
  });

  const controlsCard = createCard({ className: 'rounded-3xl md:p-xl' });
  controlsCard.innerHTML = `
    <div class="grid gap-md lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
      <label class="grid gap-sm">
        <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Semana desde lunes</span>
        <input type="date" id="fechaSemana" class="min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md text-base font-semibold text-neutral-charcoal focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30">
      </label>
      <div class="grid gap-sm">
        <span class="text-sm font-black uppercase tracking-[0.16em] text-transparent">A</span>
        <button id="btnSemanaAnterior" type="button"></button>
      </div>
      <div class="grid gap-sm">
        <span class="text-sm font-black uppercase tracking-[0.16em] text-transparent">A</span>
        <button id="btnSemanaActual" type="button"></button>
      </div>
      <div class="grid gap-sm">
        <span class="text-sm font-black uppercase tracking-[0.16em] text-transparent">A</span>
        <button id="btnSemanaSiguiente" type="button"></button>
      </div>
    </div>
  `;

  shell.append(hero, controlsCard);

  const btnSemanaAnterior = createButton('← Semana anterior', { variant: 'secondary', className: 'shadow-none bg-brand-cheese/18 text-brand-bun-dark hover:bg-brand-bun/10' });
  const btnSemanaActual = createButton('Semana actual', { variant: 'secondary', className: 'shadow-none bg-brand-cheese/18 text-brand-bun-dark hover:bg-brand-bun/10' });
  const btnSemanaSiguiente = createButton('Semana siguiente →', { variant: 'secondary', className: 'shadow-none bg-brand-cheese/18 text-brand-bun-dark hover:bg-brand-bun/10' });
  controlsCard.querySelector('#btnSemanaAnterior').replaceWith(btnSemanaAnterior); btnSemanaAnterior.id = 'btnSemanaAnterior';
  controlsCard.querySelector('#btnSemanaActual').replaceWith(btnSemanaActual); btnSemanaActual.id = 'btnSemanaActual';
  controlsCard.querySelector('#btnSemanaSiguiente').replaceWith(btnSemanaSiguiente); btnSemanaSiguiente.id = 'btnSemanaSiguiente';

  const statusBox = document.createElement('div');
  statusBox.id = 'statusBox';
  statusBox.hidden = true;

  const gridWrap = document.createElement('section');
  gridWrap.id = 'gridWrap';
  gridWrap.className = 'relative overflow-hidden rounded-3xl border border-neutral-cream/20 bg-neutral-paper';
  gridWrap.innerHTML = `
    <div class="grid-content">
      <div class="bg-gradient-to-b from-[#fffaf1] to-neutral-cream px-xl pt-lg">
        <div id="localTabs" class="flex flex-wrap gap-sm"></div>
      </div>
      <div class="grid gap-md border-b border-neutral-charcoal/8 bg-gradient-to-b from-[#fffaf1] to-neutral-cream px-xl py-lg lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
        <div><h2 id="weekTitle" class="text-3xl font-black tracking-[-0.04em]">Semana</h2></div>
        <div class="flex flex-wrap gap-sm" id="weekActionRow"></div>
        <div id="totalTurnos" class="text-sm font-black text-neutral-muted">0 turnos cargados</div>
      </div>
      <div class="overflow-auto max-h-[calc(100vh-320px)]">
        <table id="turnosTable" class="min-w-[980px] w-full border-separate border-spacing-0">
          <thead id="tableHead"></thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>
    </div>
    <div class="pointer-events-none absolute inset-0 hidden place-items-center bg-neutral-paper/28 backdrop-blur-sm" id="gridLoadingOverlay">
      <div class="inline-flex items-center gap-md rounded-full bg-gradient-to-r from-brand-cheese to-brand-bun px-xl py-md text-sm font-black text-neutral-charcoal shadow-brand">
        <span class="size-[18px] animate-spin rounded-full border-[3px] border-neutral-charcoal/20 border-t-neutral-charcoal"></span>
        <span>Cargando...</span>
      </div>
    </div>
  `;

  const copiarAnterior = createButton('Copiar semana anterior', { variant: 'secondary', className: 'rounded-full shadow-none bg-brand-cheese/18 text-brand-bun-dark hover:bg-brand-bun/10' });
  copiarAnterior.id = 'btnCopiarSemanaAnterior';
  const copiarSiguiente = createButton('Copiar turnos para la siguiente semana', { variant: 'secondary', className: 'rounded-full shadow-none bg-brand-cheese/18 text-brand-bun-dark hover:bg-brand-bun/10' });
  copiarSiguiente.id = 'btnCopiarSemanaSiguiente';
  gridWrap.querySelector('#weekActionRow').append(copiarAnterior, copiarSiguiente);

  const modalBackdrop = document.createElement('div');
  modalBackdrop.id = 'modalBackdrop';
  modalBackdrop.className = 'fixed inset-0 z-50 hidden items-center justify-center overflow-y-auto bg-neutral-charcoal/60 p-lg backdrop-blur';
  modalBackdrop.innerHTML = `
    <div id="turnoModal" class="relative my-auto flex max-h-[calc(100dvh-36px)] w-full max-w-[560px] flex-col overflow-hidden rounded-3xl border border-neutral-cream/24 bg-[#fffaf1]">
      <div class="modal-shell flex min-h-0 flex-1 flex-col">
        <div class="border-b border-neutral-charcoal/8 bg-gradient-to-b from-neutral-cream to-[#fffaf1] px-xl py-lg">
          <h3 id="modalTitle" class="text-3xl font-black tracking-[-0.04em]">Asignar turno</h3>
          <p id="modalSubtitle" class="mt-sm text-sm font-bold text-neutral-muted">Colaborador · Fecha</p>
        </div>
        <div class="grid flex-1 gap-lg overflow-y-auto px-xl py-lg">
          <div id="horarioInfo" class="rounded-2xl border border-brand-cheese/24 bg-brand-cheese/16 px-lg py-md text-sm font-bold leading-relaxed text-brand-bun-dark">Selecciona una celda para cargar el horario del local.</div>
          <div class="grid gap-sm">
            <label class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Plantillas rápidas</label>
            <div id="plantillasBox" class="flex flex-wrap gap-sm"><span class="text-sm font-bold text-neutral-muted">Cargando plantillas...</span></div>
          </div>
          <div id="modalStatus" hidden></div>
          <div class="grid gap-md md:grid-cols-2">
            <div id="modalTipoSlot"></div>
            <div id="modalEstadoSlot"></div>
          </div>
          <div class="grid gap-md md:grid-cols-2" id="tramo1Box">
            <label class="grid gap-sm"><span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Hora inicio turno</span><input type="text" id="inicio1" placeholder="13:00" class="min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md"></label>
            <label class="grid gap-sm"><span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Hora fin turno</span><input type="text" id="fin1" placeholder="22:00" class="min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md"></label>
          </div>
          <div class="grid hidden gap-md md:grid-cols-2" id="tramo2Box">
            <label class="grid gap-sm"><span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Hora inicio turno 2</span><input type="text" id="inicio2" placeholder="20:00" class="min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md"></label>
            <label class="grid gap-sm"><span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Hora fin turno 2</span><input type="text" id="fin2" placeholder="00:30" class="min-h-[52px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md"></label>
          </div>
          <label class="grid gap-sm">
            <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Observaciones</span>
            <textarea id="observaciones" rows="3" class="rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md"></textarea>
          </label>
          <div class="grid gap-sm" id="applyDaysField">
            <label class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Guardar también en otros días de esta semana</label>
            <div class="grid gap-md rounded-2xl border border-brand-bun/12 bg-brand-cheese/12 p-lg">
              <span class="text-sm font-bold text-neutral-muted">El mismo turno se copiará al colaborador en los días seleccionados.</span>
              <div id="applyDaysGrid" class="grid gap-sm md:grid-cols-2"></div>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap justify-end gap-sm border-t border-neutral-charcoal/8 bg-[#fffaf1] px-xl py-lg" id="modalActionsRow"></div>
      </div>
      <div class="pointer-events-none absolute inset-0 hidden place-items-center bg-[#fffaf1]/34 backdrop-blur-sm" id="modalLoadingOverlay">
        <div class="inline-flex items-center gap-md rounded-full bg-gradient-to-r from-brand-cheese to-brand-bun px-xl py-md text-sm font-black text-neutral-charcoal shadow-brand">
          <span class="size-[18px] animate-spin rounded-full border-[3px] border-neutral-charcoal/20 border-t-neutral-charcoal"></span>
          <span>Guardando turno...</span>
        </div>
      </div>
    </div>
  `;

  const btnEliminar = createButton('Eliminar turno', { variant: 'danger' }); btnEliminar.id = 'btnEliminarTurno';
  const btnCopiarTurno = createButton('Copiar turno', { variant: 'secondary', className: 'shadow-none bg-brand-cheese/18 text-brand-bun-dark hover:bg-brand-bun/10' }); btnCopiarTurno.id = 'btnCopiarTurno';
  const btnCerrarModal = createButton('Cancelar', { variant: 'secondary', className: 'shadow-none bg-brand-cheese/18 text-brand-bun-dark hover:bg-brand-bun/10' }); btnCerrarModal.id = 'btnCerrarModal';
  const btnGuardar = createButton('Guardar turno', { variant: 'success' }); btnGuardar.id = 'btnGuardarTurno';
  modalBackdrop.querySelector('#modalActionsRow').append(btnEliminar, btnCopiarTurno, btnCerrarModal, btnGuardar);

  modalTipoField = createSelectField({
    label: 'Tipo turno',
    id: 'modalTipo',
    name: 'modalTipo',
    value: 'Simple',
    options: [
      { value: 'Simple', label: 'Simple' },
      { value: 'Partido', label: 'Partido' },
      { value: 'Libre', label: 'Libre' },
    ],
  });
  modalEstadoField = createSelectField({
    label: 'Estado',
    id: 'modalEstado',
    name: 'modalEstado',
    value: 'Programado',
    options: [
      { value: 'Programado', label: 'Programado' },
      { value: 'Libre', label: 'Libre' },
    ],
  });
  modalBackdrop.querySelector('#modalTipoSlot').appendChild(modalTipoField.wrapper);
  modalBackdrop.querySelector('#modalEstadoSlot').appendChild(modalEstadoField.wrapper);

  shell.append(statusBox, gridWrap);
  document.body.appendChild(modalBackdrop);
  app.appendChild(shell);

  actualizarReloj();
  window.setInterval(actualizarReloj, 10000);
  $('fechaSemana').value = fechaISO(lunesDeSemana(new Date()));
  renderLocalTabs();
  $('fechaSemana').addEventListener('change', () => cargarSemana());
  $('btnSemanaAnterior').addEventListener('click', () => moverSemana(-1));
  $('btnSemanaActual').addEventListener('click', () => {
    $('fechaSemana').value = fechaISO(lunesDeSemana(new Date()));
    cargarSemana();
  });
  $('btnSemanaSiguiente').addEventListener('click', () => moverSemana(1));
  $('btnEliminarTurno').addEventListener('click', eliminarTurnoActual);
  $('btnCopiarTurno').addEventListener('click', copiarTurnoActual);
  $('btnCerrarModal').addEventListener('click', cerrarModal);
  $('btnGuardarTurno').addEventListener('click', guardarTurno);
  modalTipoField.onChange(() => { plantillaAplicadaActual = ''; refrescarCamposModal(); });
  modalEstadoField.onChange(() => { plantillaAplicadaActual = ''; refrescarCamposModal(); });
  ['inicio1', 'fin1', 'inicio2', 'fin2'].forEach((id) => $(id).addEventListener('input', () => { plantillaAplicadaActual = ''; }));
  $('modalBackdrop').addEventListener('click', (e) => { if (e.target.id === 'modalBackdrop') cerrarModal(); });
  $('btnCopiarSemanaAnterior').addEventListener('click', copiarSemanaAnterior);
  $('btnCopiarSemanaSiguiente').addEventListener('click', copiarSemanaSiguiente);
  generarSemana();
  renderTabla();
}

async function bootstrap() {
  try {
    const session = await window.LVAuth.protectPage(['Administrador']);
    if (!session) return;
    buildApp(session);
    await cargarSemana();
  } finally {
    overlay.setLoading(false);
  }
}

bootstrap();
