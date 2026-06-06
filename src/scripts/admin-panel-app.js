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
    body: 'Vista simultánea de colaboradores que registraron ingreso y aún no marcan salida.',
    href: 'TurnosAbiertos.html',
  },
  {
    eyebrow: 'Planificación',
    title: 'Programador',
    body: 'Programación semanal por local y colaborador, con edición y plantillas.',
    href: 'programadorTurnos.html',
  },
  {
    eyebrow: 'Ventas',
    title: 'Importador Ventas',
    body: 'Harness técnico para probar ImportarVentas con JSON normalizado antes del parser POS final.',
    href: 'ventasMensuales.html',
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
    lead: 'Accede desde aquí a las vistas administrativas disponibles. Esta versión piloto ya usa el design system, respeta el entorno activo y deja una base visual mucho más sólida para migrar el resto de las pantallas.',
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

  const toolsSection = document.createElement('section');
  toolsSection.className = 'grid gap-lg md:grid-cols-2 xl:grid-cols-3';

  tools.forEach((tool) => {
    toolsSection.appendChild(
      createActionCard({
        ...tool,
        actionLabel: `Abrir ${tool.title}`,
        tone: tool.title === 'Importador Ventas' ? 'highlight' : 'neutral',
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

  shell.append(hero, toolsSection, attachmentsCard);

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
