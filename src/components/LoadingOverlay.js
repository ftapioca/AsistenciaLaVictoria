import { cn } from '../utils/cn.js';

export function createLoadingOverlay(initialText = 'Procesando...') {
  document.documentElement.setAttribute('data-lv-build', '2026-07-05-staging-fix');

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-notification hidden place-items-center bg-neutral-charcoal/20 backdrop-blur-sm';
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute('aria-busy', 'true');

  const card = document.createElement('div');
  card.className = cn(
    'grid w-[min(92vw,440px)] gap-md rounded-3xl border border-neutral-cream/20 px-xl py-xl',
    'bg-[linear-gradient(145deg,rgba(255,245,231,0.96),rgba(248,195,89,0.92))] text-neutral-charcoal shadow-brand backdrop-blur'
  );

  const header = document.createElement('div');
  header.className = 'flex items-center gap-md';

  const spinner = document.createElement('span');
  spinner.className = 'size-[18px] shrink-0 rounded-full border-[3px] border-neutral-charcoal/20 border-t-neutral-charcoal animate-spin';
  spinner.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.className = 'text-base font-black';
  text.textContent = initialText;

  const detail = document.createElement('p');
  detail.className = 'text-sm leading-6 text-neutral-charcoal/72';
  detail.hidden = true;

  header.append(spinner, text);
  card.append(header, detail);
  overlay.appendChild(card);

  return {
    element: overlay,
    setLoading(loading, message = initialText, helperText = '') {
      text.textContent = message;
      detail.textContent = helperText;
      detail.hidden = !helperText;
      overlay.classList.toggle('hidden', !loading);
      overlay.classList.toggle('grid', loading);
    },
  };
}
