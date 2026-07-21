import { createButton } from '../components/Button.js';
import { createCard } from '../components/Card.js';
import { createPageHero } from '../components/PageHero.js';
import { createResourceList } from '../components/ResourceList.js';

const attachedResources = [
  {
    type: 'link',
    label: 'Reporte y registro de asistencia',
    href: 'https://docs.google.com/spreadsheets/d/1gVYjLSWMK7kkTJycXfOGkysvc4zyBBk8U9Jp4HK9V74/edit?usp=sharing',
  },
  {
    type: 'file',
    label: 'Registro Asistencia · Local Paseo del Lago',
    href: new URL('../../descargablesLocales/Registro Asistencia _ Local Paseo del Lago.html', import.meta.url).href,
    fileName: 'Registro Asistencia _ Local Paseo del Lago.html',
  },
  {
    type: 'file',
    label: 'Registro Asistencia · Local Segunda Faja',
    href: new URL('../../descargablesLocales/Registro Asistencia _ Local Segunda Faja.html', import.meta.url).href,
    fileName: 'Registro Asistencia _ Local Segunda Faja.html',
  },
];

const tools = [
  {
    eyebrow: 'Operación',
    title: 'Turnos Abiertos',
    body: 'Vista simultánea por local y acceso directo para registrar asistencia administrativa cuando haga falta.',
    href: 'TurnosAbiertos.html',
    tone: 'highlight',
    actionLabel: 'Ir a operación',
  },
  {
    eyebrow: 'Planificación',
    title: 'Programador',
    body: 'Programación semanal por local y colaborador, con edición y plantillas.',
    href: 'programadorTurnos.html',
    tone: 'neutral',
    actionLabel: 'Abrir agenda',
  },
  {
    eyebrow: 'Administración',
    title: 'Administración',
    body: 'Centraliza accesos, importaciones, pagos y configuración operativa de locales desde un único módulo.',
    href: 'administracion.html',
    tone: 'neutral',
    actionLabel: 'Abrir módulo',
  },
];

function createQuickAccessBar(onNavigate, visibleTools) {
  const bar = document.createElement('section');
  bar.className = 'grid gap-sm md:grid-cols-2';

  visibleTools.forEach((tool) => {
    bar.appendChild(createButton(tool.title, {
      variant: 'primary',
      className: 'min-h-[54px] w-full justify-between rounded-2xl px-lg text-left text-sm font-black',
      onClick: () => onNavigate(tool.href),
    }));
  });

  return bar;
}

function createToolTable(onNavigate, visibleTools) {
  const section = document.createElement('section');
  section.className = 'overflow-hidden rounded-3xl border border-neutral-charcoal/10 bg-white/90 shadow-brand backdrop-blur';

  const header = document.createElement('div');
  header.className = 'hidden grid-cols-[160px_minmax(0,1.1fr)_minmax(0,1.8fr)_180px] items-center gap-lg border-b border-neutral-charcoal/8 bg-brand-cheese/22 px-xl py-lg md:grid';
  header.innerHTML = `
    <span class="text-xs font-black uppercase tracking-[0.18em] text-neutral-muted">Área</span>
    <span class="text-xs font-black uppercase tracking-[0.18em] text-neutral-muted">Módulo</span>
    <span class="text-xs font-black uppercase tracking-[0.18em] text-neutral-muted">Descripción</span>
    <span class="text-xs font-black uppercase tracking-[0.18em] text-neutral-muted">Acción</span>
  `;

  const body = document.createElement('div');
  body.className = 'divide-y divide-neutral-charcoal/8';

  visibleTools.forEach((tool) => {
    const row = document.createElement('article');
    row.className = 'grid gap-lg px-lg py-lg md:grid-cols-[160px_minmax(0,1.1fr)_minmax(0,1.8fr)_180px] md:items-center md:px-xl';

    const eyebrow = document.createElement('div');
    eyebrow.className = 'text-xs font-black uppercase tracking-[0.2em] text-brand-bun/70';
    eyebrow.textContent = tool.eyebrow;

    const title = document.createElement('div');
    title.className = 'min-w-0';
    title.innerHTML = `
      <h3 class="text-[28px] font-black leading-none tracking-[-0.04em] text-neutral-charcoal">${tool.title}</h3>
      <p class="mt-sm text-sm font-bold text-neutral-muted md:hidden">${tool.eyebrow}</p>
    `;

    const bodyCopy = document.createElement('p');
    bodyCopy.className = 'text-base leading-7 text-neutral-charcoal/78';
    bodyCopy.textContent = tool.body;

    const actionWrap = document.createElement('div');
    actionWrap.className = 'flex md:justify-end';
    actionWrap.appendChild(createButton(tool.actionLabel || `Abrir ${tool.title}`, {
      variant: 'primary',
      className: 'min-h-[48px] w-full rounded-full px-xl md:w-auto md:min-w-[150px]',
      onClick: () => onNavigate(tool.href),
    }));

    row.append(eyebrow, title, bodyCopy, actionWrap);
    body.appendChild(row);
  });

  section.append(header, body);
  return section;
}

export function createAdminPanelSkeleton(options = {}) {
  const { mountNode } = options;
  const shell = document.createElement('div');
  shell.className = 'mx-auto flex min-h-screen w-full max-w-[1200px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl';

  const pulseClass = 'animate-pulse rounded-2xl bg-white/12';
  const hero = document.createElement('section');
  hero.className = 'rounded-3xl border border-neutral-cream/15 bg-[linear-gradient(145deg,rgba(20,16,13,0.96),rgba(42,23,16,0.90))] p-xl shadow-brand backdrop-blur md:p-2xl';
  hero.innerHTML = `
    <div class="flex flex-col gap-2xl lg:flex-row lg:items-start">
      <div class="min-w-0 flex-1">
        <div class="${pulseClass} h-8 w-[180px]"></div>
        <div class="${pulseClass} mt-lg h-16 max-w-[420px]"></div>
        <div class="${pulseClass} mt-md h-16 max-w-[360px]"></div>
        <div class="${pulseClass} mt-2xl h-5 max-w-[620px]"></div>
        <div class="${pulseClass} mt-md h-5 max-w-[560px]"></div>
      </div>
      <div class="w-full rounded-3xl border border-neutral-cream/14 bg-neutral-cream/8 p-xl lg:w-[300px]">
        <div class="${pulseClass} h-4 w-[140px]"></div>
        <div class="${pulseClass} mt-lg h-14 w-full"></div>
        <div class="${pulseClass} mt-lg h-4 w-full"></div>
        <div class="${pulseClass} mt-sm h-4 w-[86%]"></div>
        <div class="${pulseClass} mt-xl h-12 w-full rounded-full"></div>
      </div>
    </div>
  `;

  const table = document.createElement('section');
  table.className = 'overflow-hidden rounded-3xl border border-white/10 bg-white/90 shadow-brand backdrop-blur';
  table.innerHTML = `
    <div class="hidden grid-cols-[160px_minmax(0,1.1fr)_minmax(0,1.8fr)_180px] gap-lg border-b border-neutral-charcoal/8 bg-brand-cheese/22 px-xl py-lg md:grid">
      <div class="${pulseClass} h-4 w-[70px] bg-neutral-charcoal/8"></div>
      <div class="${pulseClass} h-4 w-[90px] bg-neutral-charcoal/8"></div>
      <div class="${pulseClass} h-4 w-[120px] bg-neutral-charcoal/8"></div>
      <div class="${pulseClass} h-4 w-[70px] bg-neutral-charcoal/8"></div>
    </div>
  `;

  const rows = document.createElement('div');
  rows.className = 'divide-y divide-neutral-charcoal/8';

  for (let i = 0; i < 4; i += 1) {
    const row = document.createElement('div');
    row.className = 'grid gap-lg px-lg py-lg md:grid-cols-[160px_minmax(0,1.1fr)_minmax(0,1.8fr)_180px] md:items-center md:px-xl';
    row.innerHTML = `
      <div class="${pulseClass} h-4 w-[90px] bg-neutral-charcoal/8"></div>
      <div>
        <div class="${pulseClass} h-8 w-[220px] bg-neutral-charcoal/8"></div>
        <div class="${pulseClass} mt-sm h-4 w-[110px] bg-neutral-charcoal/8 md:hidden"></div>
      </div>
      <div>
        <div class="${pulseClass} h-4 w-full bg-neutral-charcoal/8"></div>
        <div class="${pulseClass} mt-sm h-4 w-[88%] bg-neutral-charcoal/8"></div>
      </div>
      <div class="flex md:justify-end">
        <div class="${pulseClass} h-12 w-full rounded-full bg-neutral-charcoal/8 md:w-[150px]"></div>
      </div>
    `;
    rows.appendChild(row);
  }

  table.appendChild(rows);
  shell.append(hero, table);

  if (mountNode) {
    mountNode.appendChild(shell);
  }

  return { shell };
}

export function createAdminPanelApp(options = {}) {
  const {
    mountNode,
    sessionLabel = 'Validando sesión...',
    sideCopy = 'Usa este panel como hub de navegación para las herramientas administrativas. El siguiente paso es replicar esta calidad visual en las demás vistas.',
    onBack,
    onLogout,
    onNavigate,
    visibleToolTitles = [],
    showResources = true,
  } = options;

  const visibleTools = visibleToolTitles.length
    ? tools.filter((tool) => visibleToolTitles.includes(tool.title))
    : tools;

  const shell = document.createElement('div');
  shell.className = 'mx-auto flex min-h-screen w-full max-w-[1200px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl';

  const sessionUser = document.createElement('div');
  sessionUser.className = 'rounded-2xl border border-neutral-cream/14 bg-neutral-cream/12 px-lg py-lg text-sm font-black leading-relaxed text-neutral-cream md:text-base';
  sessionUser.textContent = sessionLabel;

  const actions = document.createElement('div');
  actions.className = 'flex flex-col gap-md';

  const logoutButton = createButton('Cerrar sesión', {
    variant: 'primary',
    fullWidth: true,
    onClick: onLogout,
  });

  actions.append(logoutButton);

  const hero = createPageHero({
    badge: 'La Victoria · Administración',
    title: 'Panel interno',
    lead: 'Accede desde aquí a las vistas administrativas disponibles. El panel ahora prioriza accesos rápidos, lectura móvil más clara y rutas directas hacia operación diaria.',
    sideTitle: 'Sesión y acciones',
    sideStatus: sessionUser,
    sideCopy,
    sideActions: actions,
    layoutClassName: 'lg:gap-4xl',
    contentClassName: 'lg:basis-[68%]',
    titleClassName: 'max-w-[11ch] text-[clamp(44px,6vw,72px)]',
    leadClassName: 'max-w-[64ch]',
    sideClassName: 'lg:w-[300px]',
  });

  const quickAccess = document.createElement('section');
  quickAccess.className = 'grid gap-md md:hidden';

  const quickAccessCopy = document.createElement('div');
  quickAccessCopy.className = 'flex flex-col gap-xs px-sm';
  quickAccessCopy.innerHTML = `
    <p class="text-xs font-black uppercase tracking-[0.18em] text-neutral-cream/60">Accesos rápidos</p>
    <p class="text-sm font-semibold leading-7 text-neutral-cream/72">En móvil, cada acción principal queda disponible en un tap sin tener que recorrer toda la grilla.</p>
  `;

  quickAccess.append(quickAccessCopy, createQuickAccessBar(onNavigate, visibleTools));

  const toolsSection = createToolTable(onNavigate, visibleTools);

  shell.append(quickAccess, hero, toolsSection);

  if (showResources) {
    const attachmentsCard = createCard({
      eyebrow: 'otros',
      title: 'Recursos',
      body: 'Documentos disponibles para descarga y revisión operativa desde esta misma vista.',
      className: 'rounded-3xl md:p-2xl',
      footer: createResourceList(attachedResources),
    });
    shell.appendChild(attachmentsCard);
  }

  if (mountNode) {
    mountNode.appendChild(shell);
  }

  return {
    shell,
    setSessionLabel(value) {
      sessionUser.textContent = value;
    },
  };
}
