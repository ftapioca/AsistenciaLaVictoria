import { cn } from '../utils/cn.js';

export function createStatGrid(items = [], options = {}) {
  const {
    tone = 'dark',
    className = '',
  } = options;

  const cardClass = tone === 'dark'
    ? 'border-neutral-cream/12 bg-neutral-cream/6 text-neutral-cream'
    : 'border-neutral-charcoal/10 bg-white/78 text-neutral-charcoal';
  const labelClass = tone === 'dark'
    ? 'text-neutral-cream/54'
    : 'text-neutral-muted';
  const detailClass = tone === 'dark'
    ? 'text-neutral-cream/68'
    : 'text-neutral-charcoal/70';

  const grid = document.createElement('div');
  grid.className = cn('grid gap-md sm:grid-cols-3', className);

  items.forEach((item) => {
    const stat = document.createElement('div');
    stat.className = cn(
      'rounded-2xl border p-lg backdrop-blur',
      cardClass
    );
    stat.innerHTML = `
      <p class="text-xs font-black uppercase tracking-[0.22em] ${labelClass}">${item.label}</p>
      <p class="mt-sm text-lg font-black">${item.value}</p>
      <p class="mt-sm text-sm leading-relaxed ${detailClass}">${item.detail}</p>
    `;
    grid.appendChild(stat);
  });

  return grid;
}
