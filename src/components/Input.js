import { cn } from '../utils/cn.js';

const EYE_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true" class="size-5 fill-none stroke-current stroke-[1.8]">
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
`;

const EYE_OFF_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true" class="size-5 fill-none stroke-current stroke-[1.8]">
    <path d="M3 3l18 18"></path>
    <path d="M10.6 10.7a3 3 0 0 0 4 4"></path>
    <path d="M9.9 5.2A11.3 11.3 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-4 4.9"></path>
    <path d="M6.6 6.7C3.9 8.4 2 12 2 12a17.4 17.4 0 0 0 10 7 10.7 10.7 0 0 0 5.2-1.3"></path>
  </svg>
`;

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

export function createPinInputField(options = {}) {
  const {
    label = '',
    name = '',
    placeholder = '••••',
    hint = '',
    value = '',
    required = false,
    disabled = false,
    maxLength = 12,
  } = options;

  const wrapper = document.createElement('label');
  wrapper.className = 'flex flex-col gap-sm';

  if (label) {
    const labelNode = document.createElement('span');
    labelNode.className = 'text-sm font-semibold uppercase tracking-[0.16em] text-neutral-muted';
    labelNode.textContent = label;
    wrapper.appendChild(labelNode);
  }

  const field = document.createElement('div');
  field.className = cn(
    'relative overflow-hidden rounded-2xl border border-neutral-charcoal/10 bg-white/90 pr-[68px]',
    'focus-within:border-brand-bun focus-within:ring-2 focus-within:ring-brand-bun/30'
  );

  const input = document.createElement('input');
  input.type = 'password';
  input.name = name;
  input.placeholder = placeholder;
  input.value = value;
  input.required = required;
  input.disabled = disabled;
  input.inputMode = 'numeric';
  input.maxLength = maxLength;
  input.className = 'min-h-[54px] w-full border-0 bg-transparent px-lg py-md pr-4 text-center text-2xl font-black tracking-[0.28em] text-neutral-charcoal placeholder:text-neutral-muted/80 focus:outline-none focus:ring-0';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'absolute right-2 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-2xl border border-brand-bun/16 bg-brand-cheese/18 text-brand-bun-dark';

  function syncVisibility() {
    const visible = input.type === 'text';
    toggle.innerHTML = visible ? EYE_OFF_ICON : EYE_ICON;
    toggle.setAttribute('aria-label', visible ? 'Ocultar PIN' : 'Mostrar PIN');
    toggle.setAttribute('aria-pressed', visible ? 'true' : 'false');
  }

  toggle.addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password';
    syncVisibility();
    input.focus();
  });

  syncVisibility();
  field.append(input, toggle);
  wrapper.appendChild(field);

  if (hint) {
    const hintNode = document.createElement('small');
    hintNode.className = 'text-sm text-neutral-muted';
    hintNode.textContent = hint;
    wrapper.appendChild(hintNode);
  }

  return { wrapper, input, toggle, syncVisibility };
}

export function createSelectField(options = {}) {
  const {
    label = '',
    name = '',
    id = '',
    hint = '',
    value = '',
    disabled = false,
    placeholder = 'Selecciona una opción',
    options: initialOptions = [],
  } = options;

  const wrapper = document.createElement('label');
  wrapper.className = 'flex flex-col gap-sm';

  if (label) {
    const labelNode = document.createElement('span');
    labelNode.className = 'text-sm font-semibold uppercase tracking-[0.16em] text-neutral-muted';
    labelNode.textContent = label;
    wrapper.appendChild(labelNode);
  }

  const field = document.createElement('div');
  field.className = 'relative';

  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'hidden';
  hiddenInput.name = name;
  hiddenInput.id = id;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = cn(
    'flex min-h-[54px] w-full items-center justify-between gap-md rounded-2xl border border-brand-bun/15',
    'bg-gradient-to-r from-neutral-cream to-white px-lg py-md text-left text-base font-black text-brand-bun-dark',
    'transition-fast focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30'
  );
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const triggerLabel = document.createElement('span');
  triggerLabel.className = 'truncate';

  const triggerIcon = document.createElement('span');
  triggerIcon.className = 'text-lg leading-none';
  triggerIcon.setAttribute('aria-hidden', 'true');
  triggerIcon.textContent = '▼';

  trigger.append(triggerLabel, triggerIcon);

  const menu = document.createElement('div');
  menu.className = 'absolute left-0 top-1/2 z-[110] hidden max-h-[360px] w-full -translate-y-1/2 overflow-auto rounded-3xl border border-neutral-charcoal/10 bg-neutral-paper p-md shadow-brand backdrop-blur';

  const optionsBox = document.createElement('div');
  optionsBox.className = 'grid grid-cols-1 gap-xs';
  optionsBox.setAttribute('role', 'listbox');
  menu.appendChild(optionsBox);

  field.append(hiddenInput, trigger, menu);
  wrapper.appendChild(field);

  if (hint) {
    const hintNode = document.createElement('small');
    hintNode.className = 'text-sm text-neutral-muted';
    hintNode.textContent = hint;
    wrapper.appendChild(hintNode);
  }

  let currentOptions = Array.isArray(initialOptions) ? [...initialOptions] : [];
  let currentValue = value;
  let currentPlaceholder = placeholder;
  let currentDisabled = disabled;
  let changeHandler = null;

  function getSelectedOption() {
    return currentOptions.find((option) => option.value === currentValue) || null;
  }

  function setMenuOpen(shouldOpen) {
    const active = Boolean(shouldOpen) && !currentDisabled;
    menu.hidden = !active;
    menu.classList.toggle('hidden', !active);
    menu.classList.toggle('block', active);
    trigger.setAttribute('aria-expanded', active ? 'true' : 'false');
    trigger.classList.toggle('border-brand-bun/60', active);
    trigger.classList.toggle('ring-2', active);
    trigger.classList.toggle('ring-brand-bun/30', active);
  }

  function render() {
    const selected = getSelectedOption();
    triggerLabel.textContent = selected ? selected.label : currentPlaceholder;
    hiddenInput.value = currentValue || '';
    trigger.disabled = currentDisabled;
    trigger.classList.toggle('opacity-60', currentDisabled);
    trigger.classList.toggle('cursor-not-allowed', currentDisabled);
    optionsBox.innerHTML = currentOptions.map((option) => `
      <button
        class="${cn(
          'flex min-h-[40px] w-full items-center rounded-2xl px-md py-sm text-left text-base font-black transition-fast',
          option.value === currentValue
            ? 'bg-gradient-to-r from-brand-cheese to-brand-bun text-neutral-charcoal'
            : 'text-brand-bun-dark hover:bg-brand-bun/10'
        )}"
        type="button"
        data-active="${option.value === currentValue ? 'true' : 'false'}"
        data-option-value="${option.value}">
        ${option.label}
      </button>
    `).join('');
  }

  function setValue(nextValue, emit = true) {
    currentValue = nextValue || '';
    render();
    if (emit && typeof changeHandler === 'function') {
      changeHandler(currentValue);
    }
  }

  function setOptions(nextOptions = []) {
    currentOptions = Array.isArray(nextOptions) ? [...nextOptions] : [];
    if (!currentOptions.some((option) => option.value === currentValue)) {
      currentValue = '';
    }
    render();
  }

  function setDisabled(nextDisabled) {
    currentDisabled = Boolean(nextDisabled);
    if (currentDisabled) {
      setMenuOpen(false);
    }
    render();
  }

  function setPlaceholder(nextPlaceholder) {
    currentPlaceholder = nextPlaceholder || placeholder;
    render();
  }

  function onDocumentClick(event) {
    if (!field.contains(event.target)) {
      setMenuOpen(false);
    }
  }

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen(menu.classList.contains('hidden'));
  });

  optionsBox.addEventListener('click', (event) => {
    event.stopPropagation();
    const button = event.target.closest('button[data-option-value]');
    if (!button) return;
    setValue(button.dataset.optionValue);
    setMenuOpen(false);
  });

  document.addEventListener('click', onDocumentClick);
  setDisabled(currentDisabled);
  render();

  return {
    wrapper,
    input: hiddenInput,
    trigger,
    menu,
    getValue: () => currentValue,
    setValue,
    setOptions,
    setDisabled,
    setPlaceholder,
    onChange(handler) {
      changeHandler = handler;
    },
    destroy() {
      document.removeEventListener('click', onDocumentClick);
    },
  };
}
