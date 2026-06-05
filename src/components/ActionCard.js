import { createButton } from './Button.js';
import { createCard } from './Card.js';

export function createActionCard(options = {}) {
  const {
    eyebrow = '',
    title = '',
    body = '',
    tone = 'neutral',
    actionLabel = 'Abrir',
    onAction,
  } = options;

  const footer = document.createElement('div');
  footer.className = 'flex flex-wrap gap-md';
  footer.appendChild(
    createButton(actionLabel, {
      variant: tone === 'dark' ? 'secondary' : 'primary',
      onClick: onAction,
      fullWidth: true,
      className: 'sm:w-auto',
    })
  );

  return createCard({
    eyebrow,
    title,
    body,
    tone,
    footer,
    className: 'h-full',
  });
}
