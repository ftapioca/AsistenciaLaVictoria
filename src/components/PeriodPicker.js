import { cn } from '../utils/cn.js';
import { createSelectField } from './Input.js';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAY_SHORT_NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function formatDateIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseDateParts(isoDate) {
  const [year, month, day] = String(isoDate || '').split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDateDisplay(date) {
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

function formatMonthLabel(periodo) {
  const [year, month] = String(periodo || '').split('-').map(Number);
  if (!year || !month) return 'Selecciona un mes';
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function getIsoWeekValue(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getWeekStartEnd(weekValue) {
  const [yearText, weekText] = String(weekValue || '').split('-W');
  const year = Number(yearText);
  const week = Number(weekText);
  if (!year || !week) return null;

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - day + 1 + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return {
    from: formatDateIso(new Date(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate())),
    to: formatDateIso(new Date(sunday.getUTCFullYear(), sunday.getUTCMonth(), sunday.getUTCDate())),
  };
}

function getWeeksInYear(year) {
  const dec28 = new Date(Date.UTC(year, 11, 28));
  return Number(getIsoWeekValue(new Date(dec28.getUTCFullYear(), dec28.getUTCMonth(), dec28.getUTCDate())).slice(-2));
}

function getWeeksForMonth(year, monthIndex) {
  const totalWeeks = getWeeksInYear(year);
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0);

  return Array.from({ length: totalWeeks }, (_, index) => {
    const weekNumber = index + 1;
    const value = `${year}-W${String(weekNumber).padStart(2, '0')}`;
    const range = getWeekStartEnd(value);
    const fromDate = parseDateParts(range.from);
    const toDate = parseDateParts(range.to);
    const overlapsMonth = fromDate <= monthEnd && toDate >= monthStart;
    return overlapsMonth ? { value, range, weekNumber } : null;
  }).filter(Boolean);
}

function formatWeekLabel(periodo) {
  const range = getWeekStartEnd(periodo);
  if (!range) return 'Selecciona una semana';
  return `Semana ${String(periodo).slice(-2)} · ${formatDateDisplay(parseDateParts(range.from))} al ${formatDateDisplay(parseDateParts(range.to))}`;
}

function formatDayLabel(periodo) {
  const date = parseDateParts(periodo);
  if (!date) return 'Selecciona un día';
  return formatDateDisplay(date);
}

function defaultValues() {
  const today = new Date();
  return {
    monthly: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
    weekly: getIsoWeekValue(today),
    daily: formatDateIso(today),
  };
}

export function createPeriodPicker(options = {}) {
  const {
    label = 'Período',
    scopeLabel = 'Alcance',
    initialType = 'mensual',
    types = ['mensual', 'semanal', 'diario'],
    initialValues = defaultValues(),
    showResolvedRange = false,
    className = '',
    onChange,
  } = options;

  const availableTypes = Array.isArray(types) && types.length ? types : ['mensual', 'semanal', 'diario'];
  const resolvedInitialType = availableTypes.includes(initialType) ? initialType : availableTypes[0];
  const hideTypeSelector = availableTypes.length === 1;

  const values = {
    monthly: initialValues.monthly || '',
    weekly: initialValues.weekly || '',
    daily: initialValues.daily || '',
  };

  const pickerState = {
    monthlyYear: new Date().getFullYear(),
    weeklyYear: new Date().getFullYear(),
    weeklyMonth: new Date().getMonth(),
    dailyMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  };

  const root = document.createElement('section');
  root.className = cn('grid gap-lg', className);

  root.innerHTML = `
    <div class="${hideTypeSelector ? 'grid gap-lg' : 'grid gap-lg lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]'}">
      <div data-role="type-select-slot" class="${hideTypeSelector ? 'hidden' : ''}"></div>

      <div class="grid gap-sm">
        <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">${label}</span>

        <div data-picker="mensual" class="relative">
          <button data-trigger="mensual" class="flex min-h-[54px] w-full items-center justify-between gap-md rounded-2xl border border-neutral-charcoal/10 bg-white/84 px-lg py-md text-left font-black text-neutral-charcoal transition-fast hover:bg-white focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30" type="button" aria-haspopup="dialog" aria-expanded="false">
            <strong data-label="mensual" class="text-[15px] tracking-[-0.01em]">Selecciona un mes</strong>
            <span class="text-lg leading-none text-neutral-muted" aria-hidden="true">▼</span>
          </button>
          <div data-popover="mensual" class="absolute left-0 top-[calc(100%+10px)] z-[90] hidden w-[min(100vw-48px,420px)] rounded-3xl border border-neutral-charcoal/10 bg-neutral-paper p-lg shadow-brand backdrop-blur">
            <div class="mb-md flex items-center justify-between gap-md">
              <button data-nav="mensual-prev" class="flex size-10 items-center justify-center rounded-full border border-brand-bun/15 bg-brand-cheese/20 text-brand-bun-dark transition-fast hover:bg-brand-cheese/35" type="button" aria-label="Año anterior">←</button>
              <div data-title="mensual-year" class="flex-1 text-center text-lg font-black tracking-[-0.02em] text-neutral-charcoal">2026</div>
              <button data-nav="mensual-next" class="flex size-10 items-center justify-center rounded-full border border-brand-bun/15 bg-brand-cheese/20 text-brand-bun-dark transition-fast hover:bg-brand-cheese/35" type="button" aria-label="Año siguiente">→</button>
            </div>
            <div data-grid="mensual" class="grid grid-cols-3 gap-sm"></div>
          </div>
        </div>

        <div data-picker="semanal" class="relative" hidden>
          <button data-trigger="semanal" class="flex min-h-[54px] w-full items-center justify-between gap-md rounded-2xl border border-neutral-charcoal/10 bg-white/84 px-lg py-md text-left font-black text-neutral-charcoal transition-fast hover:bg-white focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30" type="button" aria-haspopup="dialog" aria-expanded="false">
            <strong data-label="semanal" class="text-[15px] tracking-[-0.01em]">Selecciona una semana</strong>
            <span class="text-lg leading-none text-neutral-muted" aria-hidden="true">▼</span>
          </button>
          <div data-popover="semanal" class="absolute left-0 top-[calc(100%+10px)] z-[90] hidden w-[min(100vw-48px,420px)] rounded-3xl border border-neutral-charcoal/10 bg-neutral-paper p-lg shadow-brand backdrop-blur">
            <div class="mb-md grid gap-md md:grid-cols-2">
              <div class="grid gap-sm">
                <div class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Año</div>
                <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-sm">
                  <button data-nav="semanal-prev" class="flex size-10 items-center justify-center rounded-full border border-brand-bun/15 bg-brand-cheese/20 text-brand-bun-dark transition-fast hover:bg-brand-cheese/35" type="button" aria-label="Año anterior">←</button>
                  <div data-title="semanal-year" class="text-center text-lg font-black tracking-[-0.02em] text-neutral-charcoal">2026</div>
                  <button data-nav="semanal-next" class="flex size-10 items-center justify-center rounded-full border border-brand-bun/15 bg-brand-cheese/20 text-brand-bun-dark transition-fast hover:bg-brand-cheese/35" type="button" aria-label="Año siguiente">→</button>
                </div>
              </div>
              <label class="grid gap-sm">
                <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Mes</span>
                <div class="relative">
                  <button data-role="weekly-month-trigger" class="flex min-h-[48px] w-full items-center justify-between gap-md rounded-2xl border border-brand-bun/15 bg-gradient-to-r from-neutral-cream to-white px-lg py-md text-left text-base font-black text-brand-bun-dark transition-fast focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30" type="button" aria-haspopup="listbox" aria-expanded="false">
                    <span data-role="weekly-month-label">Junio</span>
                    <span class="text-lg leading-none">▼</span>
                  </button>
                  <div data-role="weekly-month-menu" class="absolute left-0 top-1/2 z-[110] hidden max-h-[360px] w-full -translate-y-1/2 overflow-auto rounded-3xl border border-neutral-charcoal/10 bg-neutral-paper p-md shadow-brand backdrop-blur">
                    <div data-role="weekly-month-options" class="grid grid-cols-1 gap-xs"></div>
                  </div>
                </div>
              </label>
            </div>
            <div data-grid="semanal" class="grid max-h-[320px] grid-cols-1 gap-sm overflow-auto pr-1"></div>
          </div>
        </div>

        <div data-picker="diario" class="relative" hidden>
          <button data-trigger="diario" class="flex min-h-[54px] w-full items-center justify-between gap-md rounded-2xl border border-neutral-charcoal/10 bg-white/84 px-lg py-md text-left font-black text-neutral-charcoal transition-fast hover:bg-white focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30" type="button" aria-haspopup="dialog" aria-expanded="false">
            <strong data-label="diario" class="text-[15px] tracking-[-0.01em]">Selecciona un día</strong>
            <span class="text-lg leading-none text-neutral-muted" aria-hidden="true">▼</span>
          </button>
          <div data-popover="diario" class="absolute left-0 top-[calc(100%+10px)] z-[90] hidden w-[min(100vw-48px,420px)] rounded-3xl border border-neutral-charcoal/10 bg-neutral-paper p-lg shadow-brand backdrop-blur">
            <div class="mb-md grid gap-md md:grid-cols-2">
              <div class="grid gap-sm">
                <div class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Año</div>
                <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-sm">
                  <button data-nav="diario-prev-year" class="flex size-10 items-center justify-center rounded-full border border-brand-bun/15 bg-brand-cheese/20 text-brand-bun-dark transition-fast hover:bg-brand-cheese/35" type="button" aria-label="Año anterior">←</button>
                  <div data-title="diario-year" class="text-center text-lg font-black tracking-[-0.02em] text-neutral-charcoal">2026</div>
                  <button data-nav="diario-next-year" class="flex size-10 items-center justify-center rounded-full border border-brand-bun/15 bg-brand-cheese/20 text-brand-bun-dark transition-fast hover:bg-brand-cheese/35" type="button" aria-label="Año siguiente">→</button>
                </div>
              </div>
              <label class="grid gap-sm">
                <span class="text-sm font-black uppercase tracking-[0.16em] text-neutral-muted">Mes</span>
                <div class="relative">
                  <button data-role="daily-month-trigger" class="flex min-h-[48px] w-full items-center justify-between gap-md rounded-2xl border border-brand-bun/15 bg-gradient-to-r from-neutral-cream to-white px-lg py-md text-left text-base font-black text-brand-bun-dark transition-fast focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30" type="button" aria-haspopup="listbox" aria-expanded="false">
                    <span data-role="daily-month-label">Junio</span>
                    <span class="text-lg leading-none">▼</span>
                  </button>
                  <div data-role="daily-month-menu" class="absolute left-0 top-1/2 z-[110] hidden max-h-[360px] w-full -translate-y-1/2 overflow-auto rounded-3xl border border-neutral-charcoal/10 bg-neutral-paper p-md shadow-brand backdrop-blur">
                    <div data-role="daily-month-options" class="grid grid-cols-1 gap-xs"></div>
                  </div>
                </div>
              </label>
            </div>
            <div data-day-head class="mb-sm grid grid-cols-7 gap-sm"></div>
            <div data-grid="diario" class="grid grid-cols-7 gap-sm"></div>
          </div>
        </div>
      </div>
    </div>

    <div data-range class="${showResolvedRange ? 'grid gap-md md:grid-cols-2' : 'hidden'}">
      <div class="rounded-2xl border border-neutral-charcoal/8 bg-white/72 px-lg py-md">
        <div class="text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Fecha Desde</div>
        <div data-from class="mt-sm text-base font-bold text-neutral-charcoal">-</div>
      </div>
      <div class="rounded-2xl border border-neutral-charcoal/8 bg-white/72 px-lg py-md">
        <div class="text-xs font-black uppercase tracking-[0.16em] text-neutral-muted">Fecha Hasta</div>
        <div data-to class="mt-sm text-base font-bold text-neutral-charcoal">-</div>
      </div>
    </div>
  `;

  const refs = {
    weeklyMonthTrigger: root.querySelector('[data-role="weekly-month-trigger"]'),
    weeklyMonthLabel: root.querySelector('[data-role="weekly-month-label"]'),
    weeklyMonthMenu: root.querySelector('[data-role="weekly-month-menu"]'),
    weeklyMonthOptions: root.querySelector('[data-role="weekly-month-options"]'),
    dailyMonthTrigger: root.querySelector('[data-role="daily-month-trigger"]'),
    dailyMonthLabel: root.querySelector('[data-role="daily-month-label"]'),
    dailyMonthMenu: root.querySelector('[data-role="daily-month-menu"]'),
    dailyMonthOptions: root.querySelector('[data-role="daily-month-options"]'),
    from: root.querySelector('[data-from]'),
    to: root.querySelector('[data-to]'),
  };

  const state = {
    type: resolvedInitialType,
    values,
  };

  const typeSelectField = createSelectField({
    label: scopeLabel,
    id: 'periodPickerScope',
    name: 'periodPickerScope',
    value: resolvedInitialType,
    options: [
      availableTypes.includes('mensual') ? { value: 'mensual', label: 'Mensual' } : null,
      availableTypes.includes('semanal') ? { value: 'semanal', label: 'Semanal' } : null,
      availableTypes.includes('diario') ? { value: 'diario', label: 'Diario' } : null,
    ].filter(Boolean),
    placeholder: 'Selecciona alcance',
    disabled: hideTypeSelector,
  });
  root.querySelector('[data-role="type-select-slot"]').appendChild(typeSelectField.wrapper);

  function getSnapshot() {
    const period = state.type === 'mensual' ? state.values.monthly : state.type === 'semanal' ? state.values.weekly : state.values.daily;
    let from = '';
    let to = '';

    if (state.type === 'mensual' && period) {
      const [year, month] = period.split('-').map(Number);
      from = formatDateIso(new Date(year, month - 1, 1));
      to = formatDateIso(new Date(year, month, 0));
    } else if (state.type === 'semanal' && period) {
      const range = getWeekStartEnd(period);
      from = range?.from || '';
      to = range?.to || '';
    } else if (state.type === 'diario' && period) {
      from = period;
      to = period;
    }

    return {
      type: state.type,
      period,
      from,
      to,
      values: { ...state.values },
    };
  }

  function emitChange() {
    const snapshot = getSnapshot();
    if (refs.from) refs.from.textContent = snapshot.from ? formatDateDisplay(parseDateParts(snapshot.from)) : '-';
    if (refs.to) refs.to.textContent = snapshot.to ? formatDateDisplay(parseDateParts(snapshot.to)) : '-';
    if (typeof onChange === 'function') onChange(snapshot);
  }

  function setPickerVisibility() {
    root.querySelector('[data-picker="mensual"]').hidden = state.type !== 'mensual';
    root.querySelector('[data-picker="semanal"]').hidden = state.type !== 'semanal';
    root.querySelector('[data-picker="diario"]').hidden = state.type !== 'diario';
    closeAllPopovers();
    closeMonthMenus();
  }

  function openPopover(type, shouldOpen) {
    ['mensual', 'semanal', 'diario'].forEach((name) => {
      const trigger = root.querySelector(`[data-trigger="${name}"]`);
      const popover = root.querySelector(`[data-popover="${name}"]`);
      if (!trigger || !popover) return;
      const active = name === type && (typeof shouldOpen === 'boolean' ? shouldOpen : !popover.classList.contains('grid'));
      popover.hidden = !active;
      popover.classList.toggle('hidden', !active);
      popover.classList.toggle('grid', active);
      trigger.classList.toggle('border-brand-bun/60', active);
      trigger.classList.toggle('ring-2', active);
      trigger.classList.toggle('ring-brand-bun/30', active);
      trigger.setAttribute('aria-expanded', active ? 'true' : 'false');
    });
  }

  function closeAllPopovers() {
    openPopover('mensual', false);
    openPopover('semanal', false);
    openPopover('diario', false);
  }

  function openMonthMenu(kind, shouldOpen) {
    ['weekly', 'daily'].forEach((name) => {
      const trigger = name === 'weekly' ? refs.weeklyMonthTrigger : refs.dailyMonthTrigger;
      const menu = name === 'weekly' ? refs.weeklyMonthMenu : refs.dailyMonthMenu;
      if (!trigger || !menu) return;
      const active = name === kind && (typeof shouldOpen === 'boolean' ? shouldOpen : menu.classList.contains('hidden'));
      menu.hidden = !active;
      menu.classList.toggle('hidden', !active);
      menu.classList.toggle('block', active);
      trigger.setAttribute('aria-expanded', active ? 'true' : 'false');
      trigger.classList.toggle('border-brand-bun/60', active);
      trigger.classList.toggle('ring-2', active);
      trigger.classList.toggle('ring-brand-bun/30', active);
      if (active) {
        requestAnimationFrame(() => centerMonthMenu(name));
      }
    });
  }

  function closeMonthMenus() {
    openMonthMenu('weekly', false);
    openMonthMenu('daily', false);
  }

  function centerMonthMenu(kind) {
    const menu = kind === 'weekly' ? refs.weeklyMonthMenu : refs.dailyMonthMenu;
    if (!menu) return;

    const activeOption = menu.querySelector('[data-active="true"]');
    if (!activeOption) return;

    const targetScroll = activeOption.offsetTop - (menu.clientHeight / 2) + (activeOption.clientHeight / 2);
    menu.scrollTop = Math.max(0, targetScroll);
  }

  function setMonthlyPeriod(value, emit = true) {
    state.values.monthly = value || '';
    root.querySelector('[data-label="mensual"]').innerText = formatMonthLabel(state.values.monthly);
    if (state.values.monthly) {
      const [year, month] = state.values.monthly.split('-').map(Number);
      pickerState.monthlyYear = year;
      pickerState.dailyMonth = new Date(year, month - 1, 1);
    }
    renderMonthPopover();
    if (emit) emitChange();
  }

  function setWeeklyPeriod(value, emit = true) {
    state.values.weekly = value || '';
    root.querySelector('[data-label="semanal"]').innerText = formatWeekLabel(state.values.weekly);
    if (state.values.weekly) {
      const range = getWeekStartEnd(state.values.weekly);
      const date = range ? parseDateParts(range.from) : null;
      if (date) {
        pickerState.weeklyYear = date.getFullYear();
        pickerState.weeklyMonth = date.getMonth();
        pickerState.dailyMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      }
    }
    renderWeekPopover();
    if (emit) emitChange();
  }

  function setDailyPeriod(value, emit = true) {
    state.values.daily = value || '';
    root.querySelector('[data-label="diario"]').innerText = formatDayLabel(state.values.daily);
    if (state.values.daily) {
      const date = parseDateParts(state.values.daily);
      if (date) {
        pickerState.dailyMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        pickerState.monthlyYear = date.getFullYear();
        pickerState.weeklyYear = date.getFullYear();
      }
    }
    renderDayPopover();
    if (emit) emitChange();
  }

  function renderMonthPopover() {
    root.querySelector('[data-title="mensual-year"]').innerText = String(pickerState.monthlyYear);
    root.querySelector('[data-grid="mensual"]').innerHTML = MONTH_NAMES.map((monthName, monthIndex) => {
      const value = `${pickerState.monthlyYear}-${String(monthIndex + 1).padStart(2, '0')}`;
      const active = value === state.values.monthly;
      return `<button class="${cn(
        'min-h-[44px] rounded-2xl border px-md py-sm text-center text-sm font-black text-brand-bun-dark transition-fast',
        active
          ? 'border-brand-bun/15 bg-gradient-to-r from-brand-cheese to-brand-bun text-neutral-charcoal'
          : 'border-neutral-charcoal/8 bg-neutral-cream/80 hover:bg-brand-bun/10'
      )}" type="button" data-month-value="${value}">${monthName.slice(0, 3)}</button>`;
    }).join('');
  }

  function renderWeekPopover() {
    const year = pickerState.weeklyYear;
    const monthIndex = pickerState.weeklyMonth;
    const weeks = getWeeksForMonth(year, monthIndex);
    root.querySelector('[data-title="semanal-year"]').innerText = String(year);
    refs.weeklyMonthLabel.innerText = MONTH_NAMES[monthIndex];
    refs.weeklyMonthOptions.innerHTML = MONTH_NAMES.map((monthName, index) => `
      <button
        class="${cn(
          'flex min-h-[40px] w-full items-center rounded-2xl px-md py-sm text-left text-base font-black transition-fast',
          index === monthIndex
            ? 'bg-gradient-to-r from-brand-cheese to-brand-bun text-neutral-charcoal'
            : 'text-brand-bun-dark hover:bg-brand-bun/10'
        )}"
        type="button"
        data-active="${index === monthIndex ? 'true' : 'false'}"
        data-weekly-month="${index}">
        ${monthName}
      </button>
    `).join('');
    root.querySelector('[data-grid="semanal"]').innerHTML = weeks.length
      ? weeks.map(({ value, range, weekNumber }) => {
          const active = value === state.values.weekly;
          return `
            <button class="${cn(
              'flex min-h-[62px] items-center justify-between gap-md rounded-2xl border px-md py-md text-left transition-fast',
              active
                ? 'border-brand-bun/15 bg-gradient-to-r from-brand-cheese to-brand-bun text-neutral-charcoal'
                : 'border-neutral-charcoal/8 bg-neutral-cream/80 text-brand-bun-dark hover:bg-brand-bun/10'
            )}" type="button" data-week-value="${value}">
              <span class="text-base font-black">Semana ${String(weekNumber).padStart(2, '0')}</span>
              <small class="whitespace-nowrap text-[12px] font-bold opacity-80">${formatDateDisplay(parseDateParts(range.from))} al ${formatDateDisplay(parseDateParts(range.to))}</small>
            </button>
          `;
        }).join('')
      : '<div class="rounded-2xl border border-brand-cheese/30 bg-brand-cheese/12 px-lg py-md text-sm font-bold leading-relaxed text-brand-bun-dark">No hay semanas disponibles para este mes.</div>';
  }

  function renderDayHead() {
    root.querySelector('[data-day-head]').innerHTML = DAY_SHORT_NAMES.map((labelText) => `
      <span class="text-center text-[11px] font-black uppercase tracking-[0.08em] text-neutral-muted">${labelText}</span>
    `).join('');
  }

  function renderDayPopover() {
    const base = new Date(pickerState.dailyMonth.getFullYear(), pickerState.dailyMonth.getMonth(), 1);
    const year = base.getFullYear();
    const month = base.getMonth();
    root.querySelector('[data-title="diario-year"]').innerText = String(year);
    refs.dailyMonthLabel.innerText = MONTH_NAMES[month];
    refs.dailyMonthOptions.innerHTML = MONTH_NAMES.map((monthName, index) => `
      <button
        class="${cn(
          'flex min-h-[40px] w-full items-center rounded-2xl px-md py-sm text-left text-base font-black transition-fast',
          index === month
            ? 'bg-gradient-to-r from-brand-cheese to-brand-bun text-neutral-charcoal'
            : 'text-brand-bun-dark hover:bg-brand-bun/10'
        )}"
        type="button"
        data-active="${index === month ? 'true' : 'false'}"
        data-daily-month="${index}">
        ${monthName}
      </button>
    `).join('');

    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = [];
    const todayIso = formatDateIso(new Date());

    for (let i = 0; i < offset; i++) {
      cells.push('<button class="min-h-[42px] rounded-2xl border border-neutral-charcoal/8 bg-neutral-cream/60 opacity-40" type="button" disabled aria-hidden="true"></button>');
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const value = formatDateIso(date);
      const active = value === state.values.daily;
      const today = value === todayIso;
      cells.push(`
        <button
          class="${cn(
            'min-h-[42px] rounded-2xl border text-sm font-black transition-fast',
            active
              ? 'border-brand-bun/15 bg-gradient-to-r from-brand-cheese to-brand-bun text-neutral-charcoal'
              : 'border-neutral-charcoal/8 bg-neutral-cream/80 text-brand-bun-dark hover:bg-brand-bun/10',
            today && !active && 'border-brand-bun/60'
          )}"
          type="button"
          data-day-value="${value}">
          ${day}
        </button>
      `);
    }

    while (cells.length % 7 !== 0) {
      cells.push('<button class="min-h-[42px] rounded-2xl border border-neutral-charcoal/8 bg-neutral-cream/60 opacity-40" type="button" disabled aria-hidden="true"></button>');
    }

    root.querySelector('[data-grid="diario"]').innerHTML = cells.join('');
  }

  function setType(type, emit = true) {
    state.type = availableTypes.includes(type) ? type : availableTypes[0];
    typeSelectField.setValue(state.type, false);
    setPickerVisibility();
    if (emit) emitChange();
  }

  typeSelectField.onChange((value) => setType(value));
  refs.weeklyMonthTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    openMonthMenu('weekly');
  });
  refs.dailyMonthTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    openMonthMenu('daily');
  });
  refs.weeklyMonthOptions.addEventListener('click', (event) => {
    event.stopPropagation();
    const button = event.target.closest('button[data-weekly-month]');
    if (!button) return;
    pickerState.weeklyMonth = Number(button.dataset.weeklyMonth);
    renderWeekPopover();
    closeMonthMenus();
    openPopover('semanal', true);
  });
  refs.dailyMonthOptions.addEventListener('click', (event) => {
    event.stopPropagation();
    const button = event.target.closest('button[data-daily-month]');
    if (!button) return;
    pickerState.dailyMonth = new Date(pickerState.dailyMonth.getFullYear(), Number(button.dataset.dailyMonth), 1);
    renderDayPopover();
    closeMonthMenus();
    openPopover('diario', true);
  });

  root.querySelector('[data-trigger="mensual"]').addEventListener('click', () => openPopover('mensual'));
  root.querySelector('[data-trigger="semanal"]').addEventListener('click', () => openPopover('semanal'));
  root.querySelector('[data-trigger="diario"]').addEventListener('click', () => openPopover('diario'));

  root.querySelector('[data-nav="mensual-prev"]').addEventListener('click', () => {
    pickerState.monthlyYear -= 1;
    renderMonthPopover();
  });
  root.querySelector('[data-nav="mensual-next"]').addEventListener('click', () => {
    pickerState.monthlyYear += 1;
    renderMonthPopover();
  });
  root.querySelector('[data-nav="semanal-prev"]').addEventListener('click', () => {
    pickerState.weeklyYear -= 1;
    renderWeekPopover();
  });
  root.querySelector('[data-nav="semanal-next"]').addEventListener('click', () => {
    pickerState.weeklyYear += 1;
    renderWeekPopover();
  });
  root.querySelector('[data-nav="diario-prev-year"]').addEventListener('click', () => {
    pickerState.dailyMonth = new Date(pickerState.dailyMonth.getFullYear() - 1, pickerState.dailyMonth.getMonth(), 1);
    renderDayPopover();
  });
  root.querySelector('[data-nav="diario-next-year"]').addEventListener('click', () => {
    pickerState.dailyMonth = new Date(pickerState.dailyMonth.getFullYear() + 1, pickerState.dailyMonth.getMonth(), 1);
    renderDayPopover();
  });

  root.querySelector('[data-grid="mensual"]').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-month-value]');
    if (!button) return;
    setMonthlyPeriod(button.dataset.monthValue);
    closeAllPopovers();
  });
  root.querySelector('[data-grid="semanal"]').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-week-value]');
    if (!button) return;
    setWeeklyPeriod(button.dataset.weekValue);
    closeAllPopovers();
  });
  root.querySelector('[data-grid="diario"]').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-day-value]');
    if (!button) return;
    setDailyPeriod(button.dataset.dayValue);
    closeAllPopovers();
  });

  const handleOutsideClick = (event) => {
    if (!event.target.closest('[data-period-picker-root]')) {
      closeAllPopovers();
      closeMonthMenus();
    }
  };

  root.setAttribute('data-period-picker-root', 'true');
  document.addEventListener('click', handleOutsideClick);

  setMonthlyPeriod(values.monthly, false);
  setWeeklyPeriod(values.weekly, false);
  setDailyPeriod(values.daily, false);
  renderDayHead();
  setType(resolvedInitialType, false);
  emitChange();

  return {
    element: root,
    getValue: () => getSnapshot(),
    setType: (type) => setType(type),
    setValue: (type, value) => {
      if (type === 'mensual') setMonthlyPeriod(value);
      if (type === 'semanal') setWeeklyPeriod(value);
      if (type === 'diario') setDailyPeriod(value);
    },
    destroy: () => {
      document.removeEventListener('click', handleOutsideClick);
      typeSelectField.destroy();
    },
  };
}
