import { cn } from '../utils/cn.js';

const TONE_CLASSES = {
  success: 'border-brand-lettuce/25 bg-brand-lettuce/10 text-brand-lettuce',
  error: 'border-brand-ketchup/25 bg-brand-ketchup/10 text-brand-ketchup',
  warn: 'border-brand-bun/25 bg-brand-cheese/35 text-brand-bun-dark',
};

export function createToast() {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-6 right-6 z-notification hidden max-w-[360px] rounded-2xl border px-lg py-lg text-sm font-black leading-relaxed shadow-brand';

  let timer = null;

  return {
    element: toast,
    show(tone, message, duration = 3800) {
      toast.className = cn(
        'fixed bottom-6 right-6 z-notification max-w-[360px] rounded-2xl border px-lg py-lg text-sm font-black leading-relaxed shadow-brand',
        TONE_CLASSES[tone] || TONE_CLASSES.success
      );
      toast.textContent = message;

      clearTimeout(timer);
      timer = window.setTimeout(() => {
        toast.className = 'fixed bottom-6 right-6 z-notification hidden max-w-[360px] rounded-2xl border px-lg py-lg text-sm font-black leading-relaxed shadow-brand';
        toast.textContent = '';
      }, duration);
    },
  };
}
