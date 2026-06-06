import { createBadge } from './Badge.js';
import { cn } from '../utils/cn.js';

export function createPageHero(options = {}) {
  const {
    badge = '',
    title = '',
    lead = '',
    highlights = null,
    sideTitle = '',
    sideStatus = null,
    sideCopy = '',
    sideActions = null,
    className = '',
    layoutClassName = '',
    contentClassName = '',
    titleClassName = '',
    leadClassName = '',
    sideClassName = '',
  } = options;

  const hero = document.createElement('section');
  hero.className = cn(
    'rounded-3xl border border-neutral-cream/15 shadow-brand backdrop-blur',
    'bg-[linear-gradient(145deg,rgba(20,16,13,0.96),rgba(42,23,16,0.90))] p-xl md:p-2xl',
    className
  );

  const layout = document.createElement('div');
  layout.className = cn(
    'flex flex-col gap-2xl lg:flex-row lg:items-start',
    layoutClassName
  );

  const content = document.createElement('div');
  content.className = cn(
    'min-w-0 flex-1',
    contentClassName
  );

  if (badge) {
    content.appendChild(createBadge(badge, { tone: 'dark' }));
  }

  if (title) {
    const heading = document.createElement('h1');
    heading.className = cn(
      'mt-lg max-w-[12ch] text-[clamp(44px,6vw,78px)] font-black leading-[1] tracking-[-0.06em] text-neutral-cream',
      titleClassName
    );
    heading.textContent = title;
    content.appendChild(heading);
  }

  if (lead) {
    const leadNode = document.createElement('p');
    leadNode.className = cn(
      'mt-2xl max-w-[62ch] text-base leading-8 text-neutral-cream/76 md:text-lg',
      leadClassName
    );
    leadNode.textContent = lead;
    content.appendChild(leadNode);
  }

  if (highlights instanceof HTMLElement) {
    highlights.classList.add('mt-2xl', 'w-full', 'max-w-none');
    content.appendChild(highlights);
  }

  const aside = document.createElement('aside');
  aside.className = cn(
    'w-full rounded-3xl border border-neutral-cream/14 bg-neutral-cream/8 p-xl shadow-brand-sm backdrop-blur lg:w-[320px] lg:flex-none',
    sideClassName
  );

  if (sideTitle) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'text-xs font-black uppercase tracking-[0.22em] text-neutral-cream/54';
    eyebrow.textContent = sideTitle;
    aside.appendChild(eyebrow);
  }

  if (sideStatus instanceof HTMLElement) {
    sideStatus.classList.add('mt-md');
    aside.appendChild(sideStatus);
  }

  if (sideCopy) {
    const copy = document.createElement('p');
    copy.className = 'mt-lg text-sm leading-7 text-neutral-cream/68';
    copy.textContent = sideCopy;
    aside.appendChild(copy);
  }

  if (sideActions instanceof HTMLElement) {
    sideActions.classList.add('mt-xl');
    aside.appendChild(sideActions);
  }

  layout.append(content, aside);
  hero.appendChild(layout);

  return hero;
}
