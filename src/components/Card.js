import { cn } from '../utils/cn.js';

const TONE_CLASSES = {
  neutral: 'bg-white/88 border-neutral-charcoal/10',
  highlight: 'bg-gradient-to-br from-brand-cheese/85 via-white/92 to-brand-bun/25 border-brand-bun/20',
  dark: 'bg-neutral-charcoal text-neutral-cream border-neutral-charcoal/80',
};

export function createCard(options = {}) {
  const {
    eyebrow = '',
    title = '',
    body = '',
    tone = 'neutral',
    footer = null,
    className = '',
  } = options;

  const article = document.createElement('article');
  article.className = cn(
    'rounded-3xl border p-xl shadow-brand backdrop-blur',
    TONE_CLASSES[tone] || TONE_CLASSES.neutral,
    className
  );

  const eyebrowClass = tone === 'dark'
    ? 'mb-md text-xs font-bold uppercase tracking-[0.24em] text-neutral-cream/72'
    : 'mb-md text-xs font-bold uppercase tracking-[0.24em] text-neutral-muted';

  if (eyebrow) {
    const eyebrowNode = document.createElement('p');
    eyebrowNode.className = eyebrowClass;
    eyebrowNode.textContent = eyebrow;
    article.appendChild(eyebrowNode);
  }

  if (title) {
    const titleNode = document.createElement('h3');
    titleNode.className = 'mb-md text-2xl font-bold';
    titleNode.textContent = title;
    article.appendChild(titleNode);
  }

  if (body) {
    const bodyNode = document.createElement('p');
    bodyNode.className = 'text-base leading-relaxed text-current/80';
    bodyNode.textContent = body;
    article.appendChild(bodyNode);
  }

  if (footer instanceof HTMLElement) {
    footer.classList.add('mt-xl');
    article.appendChild(footer);
  }

  return article;
}
