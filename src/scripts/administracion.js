import '../styles/globals.css';
import '../../app-config.prod.js';
import '../../app-config.staging.js';
import '../../app-config.js';
import '../../env-badge.js';
import '../../auth.js';

import { createButton } from '../components/Button.js';
import { createLoadingOverlay } from '../components/LoadingOverlay.js';
import { createPageHero } from '../components/PageHero.js';
import { createPageSkeleton } from '../components/PageSkeletons.js';

const MODULES = [
  {
    area: 'Seguridad',
    title: 'Usuarios y Permisos',
    description: 'Gestiona roles por usuario, alcance por local y permisos por tipo desde una vista operativa dedicada.',
    href: 'usuariosPermisos.html',
    actionLabel: 'Abrir accesos',
  },
  {
    area: 'Operación',
    title: 'Horarios Locales',
    description: 'Edita horarios base, horarios especiales por local y feriados directamente sobre las hojas de configuración.',
    href: 'horariosLocales.html',
    actionLabel: 'Abrir horarios',
  },
  {
    area: 'Ventas',
    title: 'Importador Ventas',
    description: 'Carga y valida importaciones de ventas antes de recalcular el consolidado mensual.',
    href: 'ventasMensuales.html',
    actionLabel: 'Abrir importador',
  },
  {
    area: 'Pagos',
    title: 'Pagos Mensuales',
    description: 'Consulta el consolidado exportable por período y genera planillas individuales por colaborador.',
    href: 'pagosMensuales.html',
    actionLabel: 'Abrir pagos',
  },
];

const overlay = createLoadingOverlay('Procesando...');
document.body.appendChild(overlay.element);

function withCurrentEnvironment(path) {
  const target = new URL(path, window.location.href);
  const env = window.APP_CONFIG && window.APP_CONFIG.ENVIRONMENT;
  if (env) target.searchParams.set('env', env);
  return target.toString();
}

function waitNextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function createModuleTable(onNavigate) {
  const section = document.createElement('section');
  section.className = 'overflow-hidden rounded-3xl border border-neutral-charcoal/10 bg-white/92 shadow-brand backdrop-blur';

  const header = document.createElement('div');
  header.className = 'hidden grid-cols-[170px_minmax(0,1.15fr)_minmax(0,1.85fr)_190px] items-center gap-lg border-b border-neutral-charcoal/8 bg-brand-cheese/22 px-xl py-lg md:grid';
  header.innerHTML = `
    <span class="text-xs font-black uppercase tracking-[0.18em] text-neutral-muted">Área</span>
    <span class="text-xs font-black uppercase tracking-[0.18em] text-neutral-muted">Módulo</span>
    <span class="text-xs font-black uppercase tracking-[0.18em] text-neutral-muted">Descripción</span>
    <span class="text-xs font-black uppercase tracking-[0.18em] text-neutral-muted">Acción</span>
  `;

  const body = document.createElement('div');
  body.className = 'divide-y divide-neutral-charcoal/8';

  MODULES.forEach((module) => {
    const row = document.createElement('article');
    row.className = 'grid gap-lg px-lg py-lg md:grid-cols-[170px_minmax(0,1.15fr)_minmax(0,1.85fr)_190px] md:items-center md:px-xl';

    const area = document.createElement('div');
    area.className = 'text-xs font-black uppercase tracking-[0.2em] text-brand-bun/72';
    area.textContent = module.area;

    const title = document.createElement('div');
    title.innerHTML = `
      <h3 class="text-[28px] font-black leading-none tracking-[-0.04em] text-neutral-charcoal">${module.title}</h3>
      <p class="mt-sm text-sm font-bold text-neutral-muted md:hidden">${module.area}</p>
    `;

    const description = document.createElement('p');
    description.className = 'text-base leading-7 text-neutral-charcoal/78';
    description.textContent = module.description;

    const actions = document.createElement('div');
    actions.className = 'flex md:justify-end';
    actions.appendChild(createButton(module.actionLabel, {
      variant: 'primary',
      className: 'min-h-[48px] w-full rounded-full px-xl md:w-auto md:min-w-[160px]',
      onClick: () => onNavigate(module.href),
    }));

    row.append(area, title, description, actions);
    body.appendChild(row);
  });

  section.append(header, body);
  return section;
}

function render(session) {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const shell = document.createElement('div');
  shell.className = 'mx-auto flex min-h-screen w-full max-w-[1240px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl';

  const sessionStatus = document.createElement('div');
  sessionStatus.className = 'rounded-2xl border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-lg text-sm font-black leading-relaxed text-neutral-cream';
  sessionStatus.textContent = `${session.displayName || session.role} · ${session.role}`;

  const actions = document.createElement('div');
  actions.className = 'grid gap-md';
  actions.append(
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

  const hero = createPageHero({
    badge: 'La Victoria · Administración',
    title: 'Módulos administrativos',
    lead: 'Este espacio reúne los módulos internos reservados para administración: accesos, horarios operativos, importaciones y pagos.',
    sideTitle: 'Sesión y acciones',
    sideStatus: sessionStatus,
    sideCopy: 'Cada módulo mantiene sus propias validaciones y escribe directo en el entorno activo.',
    sideActions: actions,
    titleClassName: 'max-w-[13ch] text-[clamp(42px,5vw,68px)]',
    leadClassName: 'max-w-[66ch]',
    sideClassName: 'lg:w-[330px]',
  });

  const intro = document.createElement('section');
  intro.className = 'rounded-3xl border border-neutral-charcoal/10 bg-white/92 px-xl py-xl shadow-brand';
  intro.innerHTML = `
    <p class="text-xs font-black uppercase tracking-[0.18em] text-neutral-muted">Catálogo</p>
    <h2 class="mt-sm text-[30px] font-black tracking-[-0.04em] text-neutral-charcoal">Selecciona el módulo que quieres administrar</h2>
    <p class="mt-md max-w-[72ch] text-base leading-7 text-neutral-charcoal/76">Se consolidó esta capa para separar la operación diaria del mantenimiento administrativo. Desde aquí podrás entrar a cada vista especializada sin saturar el panel principal.</p>
  `;

  shell.append(hero, intro, createModuleTable((href) => {
    window.location.href = withCurrentEnvironment(href);
  }));

  app.appendChild(shell);
}

document.addEventListener('DOMContentLoaded', async () => {
  createPageSkeleton({ mountNode: document.getElementById('app'), variant: 'table' });
  overlay.setLoading(
    true,
    'Validando sesión...',
    'Estamos preparando el módulo de administración y verificando tus permisos.'
  );

  try {
    const session = await window.LVAuth.protectPage([window.LVAuth.roles.ADMINISTRADOR]);
    if (!session) return;
    render(session);
  } finally {
    overlay.setLoading(false);
  }
});
