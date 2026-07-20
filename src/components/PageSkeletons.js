function pulse(className = '') {
  return `<div class="animate-pulse rounded-2xl bg-white/12 ${className}"></div>`;
}

export function createPageSkeleton(options = {}) {
  const {
    mountNode,
    variant = 'workspace',
  } = options;

  const shell = document.createElement('div');
  shell.className = 'mx-auto flex min-h-screen w-full max-w-[1380px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl';

  const hero = document.createElement('section');
  hero.className = 'rounded-3xl border border-neutral-cream/15 bg-[linear-gradient(145deg,rgba(20,16,13,0.96),rgba(42,23,16,0.90))] p-xl shadow-brand backdrop-blur md:p-2xl';
  hero.innerHTML = `
    <div class="flex flex-col gap-2xl lg:flex-row lg:items-start">
      <div class="min-w-0 flex-1">
        ${pulse('h-8 w-[180px]')}
        ${pulse('mt-lg h-16 max-w-[460px]')}
        ${pulse('mt-md h-16 max-w-[360px]')}
        ${pulse('mt-2xl h-5 max-w-[640px]')}
        ${pulse('mt-md h-5 max-w-[560px]')}
      </div>
      <div class="w-full rounded-3xl border border-neutral-cream/14 bg-neutral-cream/8 p-xl lg:w-[320px]">
        ${pulse('h-4 w-[150px]')}
        ${pulse('mt-lg h-14 w-full')}
        ${pulse('mt-lg h-4 w-full')}
        ${pulse('mt-sm h-4 w-[82%]')}
        ${pulse('mt-xl h-12 w-full rounded-full')}
      </div>
    </div>
  `;

  const content = document.createElement('section');
  content.className = 'grid gap-lg';

  if (variant === 'calendar') {
    const controls = document.createElement('div');
    controls.className = 'rounded-3xl border border-neutral-charcoal/10 bg-white/90 p-xl shadow-brand';
    controls.innerHTML = `
      <div class="grid gap-md lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
        ${pulse('h-[54px] w-full bg-neutral-charcoal/8')}
        ${pulse('h-[54px] w-full bg-neutral-charcoal/8')}
        ${pulse('h-[54px] w-full bg-neutral-charcoal/8')}
        ${pulse('h-[54px] w-full bg-neutral-charcoal/8')}
      </div>
    `;

    const calendar = document.createElement('div');
    calendar.className = 'rounded-3xl border border-neutral-charcoal/10 bg-white/90 p-xl shadow-brand';
    calendar.innerHTML = `
      ${pulse('h-6 w-[180px] bg-neutral-charcoal/8')}
      ${pulse('mt-md h-4 w-[260px] bg-neutral-charcoal/8')}
      <div class="mt-xl grid gap-md md:grid-cols-7">
        ${Array.from({ length: 14 }).map(() => pulse('h-[140px] bg-neutral-charcoal/8')).join('')}
      </div>
    `;

    content.append(controls, calendar);
  } else if (variant === 'table') {
    const filters = document.createElement('div');
    filters.className = 'rounded-3xl border border-neutral-charcoal/10 bg-white/90 p-xl shadow-brand';
    filters.innerHTML = `
      ${pulse('h-6 w-[180px] bg-neutral-charcoal/8')}
      ${pulse('mt-md h-4 w-[320px] bg-neutral-charcoal/8')}
      ${pulse('mt-xl h-[54px] w-full bg-neutral-charcoal/8')}
    `;

    const table = document.createElement('div');
    table.className = 'overflow-hidden rounded-3xl border border-neutral-charcoal/10 bg-white/90 shadow-brand';
    table.innerHTML = `
      <div class="hidden grid-cols-[160px_minmax(0,1.1fr)_minmax(0,1.8fr)_180px] gap-lg border-b border-neutral-charcoal/8 bg-brand-cheese/22 px-xl py-lg md:grid">
        ${pulse('h-4 w-[70px] bg-neutral-charcoal/8')}
        ${pulse('h-4 w-[90px] bg-neutral-charcoal/8')}
        ${pulse('h-4 w-[120px] bg-neutral-charcoal/8')}
        ${pulse('h-4 w-[70px] bg-neutral-charcoal/8')}
      </div>
      <div class="divide-y divide-neutral-charcoal/8">
        ${Array.from({ length: 4 }).map(() => `
          <div class="grid gap-lg px-lg py-lg md:grid-cols-[160px_minmax(0,1.1fr)_minmax(0,1.8fr)_180px] md:items-center md:px-xl">
            ${pulse('h-4 w-[90px] bg-neutral-charcoal/8')}
            <div>
              ${pulse('h-8 w-[220px] bg-neutral-charcoal/8')}
              ${pulse('mt-sm h-4 w-[110px] bg-neutral-charcoal/8 md:hidden')}
            </div>
            <div>
              ${pulse('h-4 w-full bg-neutral-charcoal/8')}
              ${pulse('mt-sm h-4 w-[88%] bg-neutral-charcoal/8')}
            </div>
            <div class="flex md:justify-end">
              ${pulse('h-12 w-full rounded-full bg-neutral-charcoal/8 md:w-[150px]')}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    content.append(filters, table);
  } else if (variant === 'dashboard') {
    const grid = document.createElement('div');
    grid.className = 'grid gap-lg xl:grid-cols-2';
    grid.innerHTML = Array.from({ length: 3 }).map(() => `
      <section class="rounded-3xl border border-neutral-charcoal/10 bg-white/90 p-xl shadow-brand">
        ${pulse('h-8 w-[220px] bg-neutral-charcoal/8')}
        ${pulse('mt-md h-4 w-[260px] bg-neutral-charcoal/8')}
        <div class="mt-xl grid gap-md">
          ${pulse('h-[78px] w-full bg-neutral-charcoal/8')}
          ${pulse('h-[78px] w-full bg-neutral-charcoal/8')}
        </div>
      </section>
    `).join('');

    content.appendChild(grid);
  } else {
    const layout = document.createElement('div');
    layout.className = 'grid gap-lg xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]';
    layout.innerHTML = `
      <div class="grid gap-lg">
        <section class="rounded-3xl border border-neutral-charcoal/10 bg-white/90 p-xl shadow-brand">
          ${pulse('h-6 w-[200px] bg-neutral-charcoal/8')}
          ${pulse('mt-md h-4 w-[300px] bg-neutral-charcoal/8')}
          <div class="mt-xl grid gap-md">
            ${pulse('h-[54px] w-full bg-neutral-charcoal/8')}
            ${pulse('h-[54px] w-full bg-neutral-charcoal/8')}
            ${pulse('h-[220px] w-full bg-neutral-charcoal/8')}
          </div>
        </section>
      </div>
      <div class="grid gap-lg">
        <section class="rounded-3xl border border-neutral-charcoal/10 bg-white/90 p-xl shadow-brand">
          ${pulse('h-6 w-[180px] bg-neutral-charcoal/8')}
          <div class="mt-xl grid gap-md sm:grid-cols-2">
            ${pulse('h-[110px] w-full bg-neutral-charcoal/8')}
            ${pulse('h-[110px] w-full bg-neutral-charcoal/8')}
            ${pulse('h-[110px] w-full bg-neutral-charcoal/8')}
            ${pulse('h-[110px] w-full bg-neutral-charcoal/8')}
          </div>
        </section>
        <section class="rounded-3xl border border-neutral-charcoal/10 bg-white/90 p-xl shadow-brand">
          ${pulse('h-6 w-[160px] bg-neutral-charcoal/8')}
          ${pulse('mt-md h-4 w-full bg-neutral-charcoal/8')}
          ${pulse('mt-sm h-4 w-[88%] bg-neutral-charcoal/8')}
        </section>
      </div>
    `;

    content.appendChild(layout);
  }

  shell.append(hero, content);

  if (mountNode) {
    mountNode.replaceChildren(shell);
  }

  return { shell };
}
