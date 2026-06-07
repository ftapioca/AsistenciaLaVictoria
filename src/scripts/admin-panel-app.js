import { createActionCard } from '../components/ActionCard.js';
import { createButton } from '../components/Button.js';
import { createCard } from '../components/Card.js';
import { createPageHero } from '../components/PageHero.js';
import { createResourceList } from '../components/ResourceList.js';
import { createStatGrid } from '../components/StatGrid.js';

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
    className: 'md:col-span-2 xl:col-span-1',
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
    eyebrow: 'Ventas',
    title: 'Importador Ventas',
    body: 'Harness técnico para probar ImportarVentas con JSON normalizado antes del parser POS final.',
    href: 'ventasMensuales.html',
    tone: 'neutral',
    actionLabel: 'Abrir importador',
  },
];

function buildHeroHighlights(environmentLabel, accessLabel) {
  return createStatGrid([
    {
      label: 'Estado',
      value: accessLabel,
      detail: 'La vista usa el layout oficial del panel administrativo.',
    },
    {
      label: 'Entorno',
      value: environmentLabel,
      detail: 'La navegación conserva el entorno activo en cada vista.',
    },
    {
      label: 'Cobertura',
      value: '3 módulos clave',
      detail: 'Turnos, planificación y ventas desde un solo punto.',
    },
  ], { tone: 'dark' });
}

function createQuickAccessBar(onNavigate) {
  const bar = document.createElement('section');
  bar.className = 'grid gap-sm md:grid-cols-3';

  tools.forEach((tool) => {
    bar.appendChild(createButton(tool.title, {
      variant: tool.title === 'Turnos Abiertos' ? 'primary' : 'secondary',
      className: 'min-h-[54px] w-full justify-between rounded-2xl px-lg text-left text-sm font-black',
      onClick: () => onNavigate(tool.href),
    }));
  });

  return bar;
}

export function createAdminPanelApp(options = {}) {
  const {
    mountNode,
    environment = 'PROD',
    sessionLabel = 'Validando sesión...',
    accessLabel = 'Sesión protegida',
    sideCopy = 'Usa este panel como hub de navegación para las herramientas administrativas. El siguiente paso es replicar esta calidad visual en las demás vistas.',
    onBack,
    onLogout,
    onNavigate,
  } = options;

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
    highlights: buildHeroHighlights(environment, accessLabel),
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
  quickAccess.className = 'grid gap-md';

  const quickAccessCopy = document.createElement('div');
  quickAccessCopy.className = 'flex flex-col gap-xs px-sm';
  quickAccessCopy.innerHTML = `
    <p class="text-xs font-black uppercase tracking-[0.18em] text-neutral-cream/60">Accesos rápidos</p>
    <p class="text-sm font-semibold leading-7 text-neutral-cream/72">En móvil, cada acción principal queda disponible en un tap sin tener que recorrer toda la grilla.</p>
  `;

  quickAccess.append(quickAccessCopy, createQuickAccessBar(onNavigate));

  const toolsSection = document.createElement('section');
  toolsSection.className = 'grid gap-lg md:grid-cols-2 xl:grid-cols-3';

  tools.forEach((tool) => {
    toolsSection.appendChild(
      createActionCard({
        ...tool,
        tone: tool.tone || 'neutral',
        actionLabel: tool.actionLabel || `Abrir ${tool.title}`,
        className: tool.className || '',
        onAction: () => onNavigate(tool.href),
      })
    );
  });

  const attachmentsCard = createCard({
    eyebrow: 'otros',
    title: 'Recursos',
    body: 'Documentos disponibles para descarga y revisión operativa desde esta misma vista.',
    className: 'rounded-3xl md:p-2xl',
    footer: createResourceList(attachedResources),
  });

  shell.append(quickAccess, hero, toolsSection, attachmentsCard);

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
