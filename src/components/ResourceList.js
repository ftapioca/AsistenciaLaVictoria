import { createButton } from './Button.js';
import { cn } from '../utils/cn.js';

function createResourceAction(resource) {
  return createButton(resource.type === 'link' ? 'Abrir' : 'Descargar', {
    as: 'a',
    href: resource.href,
    target: resource.type === 'link' ? '_blank' : '',
    rel: resource.type === 'link' ? 'noopener noreferrer' : '',
    download: resource.type !== 'link' ? (resource.fileName || '') : '',
    className: 'text-sm font-black',
  });
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
