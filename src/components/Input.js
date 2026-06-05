import { cn } from '../utils/cn.js';

export function createInputField(options = {}) {
  const {
    label = '',
    type = 'text',
    name = '',
    placeholder = '',
    hint = '',
    value = '',
    required = false,
    disabled = false,
  } = options;

  const wrapper = document.createElement('label');
  wrapper.className = 'flex flex-col gap-sm';

  if (label) {
    const labelNode = document.createElement('span');
    labelNode.className = 'text-sm font-semibold uppercase tracking-[0.16em] text-neutral-muted';
    labelNode.textContent = label;
    wrapper.appendChild(labelNode);
  }

  const input = document.createElement('input');
  input.type = type;
  input.name = name;
  input.placeholder = placeholder;
  input.value = value;
  input.required = required;
  input.disabled = disabled;
  input.className = cn(
    'min-h-[52px] rounded-xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md',
    'text-base text-neutral-charcoal shadow-xs transition-fast placeholder:text-neutral-muted/80',
    'focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30'
  );
  wrapper.appendChild(input);

  if (hint) {
    const hintNode = document.createElement('small');
    hintNode.className = 'text-sm text-neutral-muted';
    hintNode.textContent = hint;
    wrapper.appendChild(hintNode);
  }

  return { wrapper, input };
}
