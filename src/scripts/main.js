import '../styles/globals.css';
import { createButton } from '../components/Button.js';
import { createCard } from '../components/Card.js';
import { createInputField, createPinInputField, createSelectField } from '../components/Input.js';
import { createPageHero } from '../components/PageHero.js';
import { createPeriodPicker } from '../components/PeriodPicker.js';
import { createStatGrid } from '../components/StatGrid.js';

function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderPalette() {
  const colors = [
    ['bun', '#ff8a13', 'bg-brand-bun text-neutral-charcoal'],
    ['bun-dark', '#d96700', 'bg-brand-bun-dark text-white'],
    ['cheese', '#ffc928', 'bg-brand-cheese text-neutral-charcoal'],
    ['ketchup', '#ef3b2d', 'bg-brand-ketchup text-white'],
    ['lettuce', '#19a66a', 'bg-brand-lettuce text-white'],
  ];

  const grid = document.createElement('div');
  grid.className = 'grid gap-lg sm:grid-cols-2 lg:grid-cols-5';

  colors.forEach(([name, hex, classes]) => {
    const tile = document.createElement('div');
    tile.className = 'overflow-hidden rounded-2xl border border-neutral-charcoal/10 bg-white/80 shadow-brand-sm';
    tile.innerHTML = `
      <div class="h-32 ${classes} p-lg flex items-end">
        <span class="text-sm font-semibold uppercase tracking-[0.2em]">${name}</span>
      </div>
      <div class="px-lg py-md">
        <p class="text-sm font-semibold text-neutral-charcoal">${name}</p>
        <p class="text-xs text-neutral-muted">${hex}</p>
      </div>
    `;
    grid.appendChild(tile);
  });

  return grid;
}

function renderTypeScale() {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-lg';
  wrapper.innerHTML = `
    <div>
      <p class="text-6xl font-black">Hero / text-6xl</p>
      <p class="text-sm text-neutral-muted">64px · line-height 64px</p>
    </div>
    <div>
      <p class="text-4xl font-bold">Section / text-4xl</p>
      <p class="text-sm text-neutral-muted">36px · line-height 40px</p>
    </div>
    <div>
      <p class="text-xl">Lead / text-xl para introducciones y bloques destacados.</p>
      <p class="text-sm text-neutral-muted">20px · line-height 28px</p>
    </div>
    <div>
      <p class="text-base">Body / text-base para formularios, tablas y lectura continua.</p>
      <p class="text-sm text-neutral-muted">16px · line-height 24px</p>
    </div>
  `;
  return wrapper;
}

function renderButtons() {
  const row = document.createElement('div');
  row.className = 'flex flex-wrap gap-md';

  row.append(
    createButton('Primario'),
    createButton('Secundario', { variant: 'secondary' }),
    createButton('Guardar', { variant: 'success' }),
    createButton('Eliminar', { variant: 'danger' }),
    createButton('Ghost', { variant: 'ghost' }),
    createButton('Deshabilitado', { disabled: true })
  );

  return row;
}

function renderForm() {
  const card = document.createElement('div');
  card.className = 'grid gap-lg md:grid-cols-2';

  const local = createInputField({
    label: 'Local',
    placeholder: 'Paseo del Lago',
    hint: 'Usa etiquetas claras y consistentes.',
  });
  const period = createInputField({
    label: 'Periodo',
    placeholder: '2026-06',
    hint: 'Mantén el formato YYYY-MM.',
  });
  const role = createSelectField({
    label: 'Rol',
    placeholder: 'Selecciona un rol',
    options: [
      { value: 'Administrador', label: 'Administrador' },
      { value: 'Colaborador', label: 'Colaborador' },
    ],
    hint: 'Dropdown custom con la misma estética del selector de meses.',
  });
  const pin = createPinInputField({
    label: 'PIN',
    placeholder: '••••',
    hint: 'Primitive para accesos internos con toggle integrado.',
  });

  card.append(local.wrapper, period.wrapper, role.wrapper, pin.wrapper);
  return card;
}

function renderPeriodPickers() {
  const wrapper = document.createElement('div');
  wrapper.className = 'grid gap-lg';

  const summary = createCard({
    eyebrow: 'Estado',
    title: 'Período resuelto',
    body: '',
    tone: 'highlight',
    className: 'md:p-2xl',
  });

  const summaryGrid = document.createElement('div');
  summaryGrid.className = 'grid gap-md md:grid-cols-4';
  summaryGrid.innerHTML = `
    <div class="rounded-2xl border border-neutral-charcoal/8 bg-white/72 px-lg py-md">
      <div class="text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Alcance</div>
      <div id="pickerScopeValue" class="mt-sm text-base font-bold text-neutral-charcoal">Mensual</div>
    </div>
    <div class="rounded-2xl border border-neutral-charcoal/8 bg-white/72 px-lg py-md md:col-span-1">
      <div class="text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Período</div>
      <div id="pickerPeriodValue" class="mt-sm text-base font-bold text-neutral-charcoal">-</div>
    </div>
    <div class="rounded-2xl border border-neutral-charcoal/8 bg-white/72 px-lg py-md">
      <div class="text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Desde</div>
      <div id="pickerFromValue" class="mt-sm text-base font-bold text-neutral-charcoal">-</div>
    </div>
    <div class="rounded-2xl border border-neutral-charcoal/8 bg-white/72 px-lg py-md">
      <div class="text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Hasta</div>
      <div id="pickerToValue" class="mt-sm text-base font-bold text-neutral-charcoal">-</div>
    </div>
  `;
  summary.appendChild(summaryGrid);

  const scopeValue = summaryGrid.querySelector('#pickerScopeValue');
  const periodValue = summaryGrid.querySelector('#pickerPeriodValue');
  const fromValue = summaryGrid.querySelector('#pickerFromValue');
  const toValue = summaryGrid.querySelector('#pickerToValue');

  const picker = createPeriodPicker({
    initialType: 'mensual',
    showResolvedRange: true,
    onChange: ({ type, period, from, to }) => {
      scopeValue.textContent = type;
      periodValue.textContent = period || '-';
      fromValue.textContent = from || '-';
      toValue.textContent = to || '-';
    },
  });

  const standaloneGrid = document.createElement('div');
  standaloneGrid.className = 'grid gap-lg xl:grid-cols-3';

  const standaloneConfigs = [
    {
      eyebrow: 'Mensual',
      title: 'Selector mensual standalone',
      body: 'Usa el mismo primitive como picker de mes puro.',
      type: 'mensual',
    },
    {
      eyebrow: 'Semanal',
      title: 'Selector semanal standalone',
      body: 'Semana ISO con mes contextual y rango resuelto.',
      type: 'semanal',
    },
    {
      eyebrow: 'Diario',
      title: 'Selector diario standalone',
      body: 'Calendario compacto para elegir una fecha exacta.',
      type: 'diario',
    },
  ];

  standaloneConfigs.forEach(({ eyebrow, title, body, type }) => {
    const card = createCard({
      eyebrow,
      title,
      body,
      className: 'rounded-3xl md:p-2xl',
    });

    const pickerNode = createPeriodPicker({
      label: type === 'mensual' ? 'Mes' : type === 'semanal' ? 'Semana' : 'Día',
      types: [type],
      initialType: type,
      showResolvedRange: true,
      className: 'mt-xl',
    });

    card.appendChild(pickerNode.element);
    standaloneGrid.appendChild(card);
  });

  wrapper.append(picker.element, summary, standaloneGrid);
  return wrapper;
}

function createSection(title, description, content) {
  const section = document.createElement('section');
  section.id = title.toLowerCase();
  section.className = 'mb-6xl w-full';
  section.innerHTML = `
    <div class="mb-xl w-full max-w-[760px]">
      <h2 class="text-3xl font-bold">${title}</h2>
      <p class="mt-sm text-base text-neutral-charcoal/72">${description}</p>
    </div>
  `;
  section.appendChild(content);
  return section;
}

function renderApp() {
  const app = document.getElementById('app');

  const shell = document.createElement('div');
  shell.className = 'mx-auto flex w-full max-w-container flex-col px-lg py-4xl md:px-2xl';

  const actions = document.createElement('div');
  actions.className = 'flex flex-col gap-md sm:flex-row sm:flex-wrap';
  actions.append(
    createButton('Ver componentes', {
      variant: 'primary',
      onClick: () => scrollToSection('botones'),
    }),
    createButton('Ver resumen técnico', {
      variant: 'secondary',
      onClick: () => scrollToSection('resumen'),
    })
  );

  const hero = createPageHero({
    badge: 'La Victoria UI',
    title: 'Design system operativo para cerrar la base visual del proyecto.',
    lead: 'Tokens, primitives y una demo compilable en Vite para que la siguiente rama parta desde una base estable.',
    highlights: createStatGrid([
      {
        label: 'Tokens',
        value: 'Base unificada',
        detail: 'Colores, spacing, tipografía, radios y sombras viven en Tailwind config.',
      },
      {
        label: 'Primitives',
        value: 'Set inicial listo',
        detail: 'Botones, cards, inputs, heroes y listas reutilizables para nuevas pantallas.',
      },
      {
        label: 'Build',
        value: 'Demo compilable',
        detail: 'El sistema ya genera artefactos estáticos para revisión visual y despliegue.',
      },
    ], { tone: 'dark' }),
    sideTitle: 'Navegación',
    sideCopy: 'Usa esta demo para validar layout, componentes y dirección visual antes de migrar pantallas reales.',
    sideActions: actions,
    layoutClassName: 'lg:gap-4xl',
    contentClassName: 'lg:basis-[68%]',
    titleClassName: 'max-w-[10ch] text-[clamp(46px,6vw,78px)]',
    leadClassName: 'max-w-[64ch]',
    sideClassName: 'lg:w-[300px]',
    className: 'mb-6xl',
  });

  const summaryFooter = document.createElement('div');
  summaryFooter.className = 'flex flex-wrap gap-md';
  summaryFooter.append(
    createButton('Import CTA', { size: 'sm' }),
    createButton('Secondary CTA', { variant: 'secondary', size: 'sm' })
  );

  const cards = document.createElement('div');
  cards.className = 'grid gap-lg lg:grid-cols-3';
  cards.append(
    createCard({
      eyebrow: 'Base',
      title: 'Tokens centralizados',
      body: 'Colores, tipografía, spacing, radios, sombras y z-index viven en Tailwind config.',
    }),
    createCard({
      eyebrow: 'Primitives',
      title: 'Button, Input y Card',
      body: 'Los componentes base ya existen como factories reutilizables en src/components.',
      tone: 'highlight',
      footer: summaryFooter,
    }),
    createCard({
      eyebrow: 'Build',
      title: 'Demo aislada para Vite',
      body: 'La demo ya no depende de enlaces al repo. El build genera un artefacto autosuficiente para revisión visual o despliegue estático.',
      tone: 'dark',
    })
  );

  shell.append(
    hero,
    createSection('Colores', 'Paleta de marca y acentos semánticos del sistema.', renderPalette()),
    createSection('Tipografía', 'Escala base para héroes, encabezados, lead y body copy.', renderTypeScale()),
    createSection('Botones', 'Variantes y tamaños del primitive base.', renderButtons()),
    createSection('Formulario', 'Inputs con label, hint y estados listos para componer formularios.', renderForm()),
    createSection('Datepicker', 'Patrón reutilizable extraído del flujo legado de ventas: alcance diario, semanal y mensual con popovers específicos y rango resuelto.', renderPeriodPickers()),
    createSection('Resumen', 'Estado actual del design system sobre esta rama.', cards)
  );

  const footer = document.createElement('footer');
  footer.className = 'border-t border-neutral-charcoal/10 py-2xl text-sm text-neutral-muted';
  footer.textContent = 'Design System v1.1 · La Victoria · Junio 2026';
  shell.appendChild(footer);

  app.appendChild(shell);
}

renderApp();
