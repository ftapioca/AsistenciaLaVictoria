import { cn } from '../utils/cn.js';

const TONE_CLASSES = {
  warm: 'border-brand-cheese/35 bg-brand-bun/15 text-brand-bun-dark',
  dark: 'border-neutral-cream/15 bg-neutral-cream/10 text-neutral-cream',
  success: 'border-brand-lettuce/30 bg-brand-lettuce/12 text-brand-lettuce',
};

export function createBadge(label, options = {}) {
  const {
    tone = 'warm',
    className = '',
  } = options;

  const badge = document.createElement('span');
  badge.className = cn(
    'inline-flex w-fit items-center gap-sm rounded-full border px-md py-sm',
    'text-xs font-black uppercase tracking-[0.18em] shadow-brand-sm backdrop-blur',
    TONE_CLASSES[tone] || TONE_CLASSES.warm,
    className
  );
  badge.textContent = label;
  return badge;
}
