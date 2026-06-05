import { cn } from '../utils/cn.js';

function createResourceAction(resource) {
  const action = document.createElement('a');
  action.className = cn(
    'inline-flex min-h-[44px] items-center justify-center rounded-xl px-lg py-md',
    'bg-gradient-to-r from-brand-cheese to-brand-bun text-sm font-black text-neutral-charcoal',
    'shadow-brand-sm transition-all duration-fast hover:-translate-y-0.5'
  );
  action.textContent = resource.type === 'link' ? 'Abrir' : 'Descargar';
  action.href = resource.href;

  if (resource.type === 'link') {
    action.target = '_blank';
    action.rel = 'noopener noreferrer';
  } else if (resource.fileName) {
    action.download = resource.fileName;
  }

  return action;
}

export function createResourceList(resources = [], options = {}) {
  const {
    className = '',
  } = options;

  const grid = document.createElement('div');
  grid.className = cn('grid gap-md', className);

  resources.forEach((resource) => {
    const row = document.createElement('div');
    row.className = cn(
      'flex flex-col gap-md rounded-2xl border border-neutral-charcoal/10',
      'bg-white/72 p-lg md:flex-row md:items-center md:justify-between'
    );

    const copy = document.createElement('div');
    copy.className = 'min-w-0';

    const label = document.createElement('p');
    label.className = 'text-sm font-black text-neutral-charcoal';
    label.textContent = resource.label;

    copy.appendChild(label);
    row.append(copy, createResourceAction(resource));
    grid.appendChild(row);
  });

  return grid;
}
