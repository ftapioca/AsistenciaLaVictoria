import { cn } from '../utils/cn.js';

export function createLoadingOverlay(initialText = 'Procesando...') {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-notification hidden place-items-center bg-neutral-charcoal/20 backdrop-blur-sm';
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute('aria-busy', 'true');

  const card = document.createElement('div');
  card.className = cn(
    'inline-flex items-center gap-md rounded-full px-xl py-md',
    'bg-gradient-to-r from-brand-cheese to-brand-bun text-sm font-black text-neutral-charcoal shadow-brand'
  );

  const spinner = document.createElement('span');
  spinner.className = 'size-[18px] rounded-full border-[3px] border-neutral-charcoal/20 border-t-neutral-charcoal animate-spin';
  spinner.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.textContent = initialText;

  card.append(spinner, text);
  overlay.appendChild(card);

  return {
    element: overlay,
    setLoading(loading, message = initialText) {
      text.textContent = message;
      overlay.classList.toggle('hidden', !loading);
      overlay.classList.toggle('grid', loading);
    },
  };
}
