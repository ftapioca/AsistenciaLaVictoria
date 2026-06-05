import '../styles/globals.css';
import { createButton } from '../components/Button.js';
import { createCard } from '../components/Card.js';
import { createInputField } from '../components/Input.js';
import { createPageHero } from '../components/PageHero.js';
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

  card.append(local.wrapper, period.wrapper);
  return card;
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
    createSection('Resumen', 'Estado actual del design system sobre esta rama.', cards)
  );

  const footer = document.createElement('footer');
  footer.className = 'border-t border-neutral-charcoal/10 py-2xl text-sm text-neutral-muted';
  footer.textContent = 'Design System v1.1 · La Victoria · Junio 2026';
  shell.appendChild(footer);

  app.appendChild(shell);
}

renderApp();
