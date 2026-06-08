import { cn } from '../utils/cn.js';

const VARIANT_CLASSES = {
  primary: 'bg-brand-bun text-neutral-charcoal hover:bg-brand-bun-dark hover:text-neutral-cream',
  secondary: 'border border-brand-bun/30 bg-white/80 text-neutral-charcoal hover:bg-brand-bun/10',
  danger: 'bg-brand-ketchup text-white hover:opacity-90',
  success: 'bg-brand-lettuce text-white hover:opacity-90',
  ghost: 'text-neutral-charcoal hover:bg-neutral-charcoal/5',
};

const SIZE_CLASSES = {
  sm: 'px-md py-sm text-sm rounded-md',
  md: 'px-lg py-md text-base rounded-lg',
  lg: 'px-xl py-lg text-lg rounded-xl',
};

export function createButton(label, options = {}) {
  const {
    as = 'button',
    variant = 'primary',
    size = 'md',
    type = 'button',
    href = '',
    target = '',
    rel = '',
    download = '',
    disabled = false,
    fullWidth = false,
    onClick,
    className = '',
  } = options;

  const element = document.createElement(as === 'a' ? 'a' : 'button');
  element.textContent = label;
  element.className = cn(
    'inline-flex items-center justify-center gap-sm font-semibold shadow-none transition-all duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bun focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary,
    SIZE_CLASSES[size] || SIZE_CLASSES.md,
    fullWidth && 'w-full',
    className
  );

  if (element instanceof HTMLButtonElement) {
    element.type = type;
    element.disabled = disabled;
  }

  if (element instanceof HTMLAnchorElement) {
    element.href = href;
    if (target) element.target = target;
    if (rel) element.rel = rel;
    if (download) element.download = download;
    if (disabled) {
      element.setAttribute('aria-disabled', 'true');
      element.tabIndex = -1;
    }
  }

  if (typeof onClick === 'function') {
    element.addEventListener('click', onClick);
  }

  return element;
}
