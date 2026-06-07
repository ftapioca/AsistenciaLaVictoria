import '../styles/globals.css';
import '../../app-config.prod.js';
import '../../app-config.staging.js';
import '../../app-config.js';
import '../../env-badge.js';
import '../../auth.js';

import { createBadge } from '../components/Badge.js';
import { createButton } from '../components/Button.js';
import { createCard } from '../components/Card.js';
import { createPinInputField, createSelectField } from '../components/Input.js';
import { createLoadingOverlay } from '../components/LoadingOverlay.js';

const $ = (id) => document.getElementById(id);
let roleSelectFieldRef = null;
let nameSelectFieldRef = null;
let roleShortcutButtons = [];

function waitNextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function createFeatureCard(title, detail) {
  const card = createCard({
    title,
    body: detail,
    tone: 'dark',
    className: 'rounded-[24px] border-neutral-cream/12 bg-neutral-cream/8 p-lg shadow-none',
  });

  const heading = card.querySelector('h3');
  if (heading) {
    heading.className = 'mb-sm text-[15px] font-black leading-6 tracking-[-0.02em] text-neutral-cream';
  }

  const body = card.querySelector('p');
  if (body) {
    body.className = 'text-sm font-semibold leading-7 text-neutral-cream/70';
  }

  return card;
}

function createFieldLabel(text) {
  const label = document.createElement('label');
  label.className = 'grid gap-sm';

  const caption = document.createElement('span');
  caption.className = 'text-sm font-black uppercase tracking-[0.16em] text-neutral-muted';
  caption.textContent = text;
  label.appendChild(caption);

  return label;
}

function createTextInput({ id, name, type = 'text', placeholder = '', autocomplete = '' }) {
  const input = document.createElement('input');
  input.id = id;
  input.name = name;
  input.type = type;
  input.placeholder = placeholder;
  input.autocomplete = autocomplete;
  input.className = 'min-h-[54px] rounded-2xl border border-neutral-charcoal/10 bg-white/90 px-lg py-md text-base font-semibold text-neutral-charcoal placeholder:text-neutral-muted/80 focus:border-brand-bun focus:outline-none focus:ring-2 focus:ring-brand-bun/30';
  return input;
}

function setStatus(type, message) {
  const box = $('loginStatus');
  const tones = {
    loading: 'border-brand-cheese/24 bg-brand-cheese/16 text-brand-bun-dark',
    success: 'border-brand-lettuce/24 bg-brand-lettuce/12 text-brand-lettuce',
    error: 'border-brand-ketchup/24 bg-brand-ketchup/12 text-brand-ketchup',
  };

  box.className = `rounded-2xl border px-lg py-md text-sm font-bold leading-6 ${tones[type] || tones.error}`;
  box.textContent = message;
  box.hidden = false;
}

function clearStatus() {
  const box = $('loginStatus');
  box.hidden = true;
  box.textContent = '';
  box.className = '';
}

async function cargarUsuariosPorRol(role) {
  nameSelectFieldRef.setDisabled(true);
  nameSelectFieldRef.setOptions([]);
  nameSelectFieldRef.setPlaceholder('Cargando nombres...');

  if (!role) {
    nameSelectFieldRef.setPlaceholder('Selecciona primero un rol');
    return;
  }

  try {
    const url = `${window.APP_CONFIG.WEB_APP_URL}?${new URLSearchParams({
      accion: 'UsuariosPorRol',
      role,
    }).toString()}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'SUCCESS') {
      throw new Error(data.mensaje || 'No se pudo cargar la lista de usuarios.');
    }

    const usuarios = Array.isArray(data.usuarios) ? data.usuarios : [];
    nameSelectFieldRef.setOptions(usuarios.map((nombre) => ({ value: nombre, label: nombre })));
    nameSelectFieldRef.setPlaceholder('Selecciona tu nombre');
    nameSelectFieldRef.setDisabled(false);
  } catch (error) {
    nameSelectFieldRef.setOptions([]);
    nameSelectFieldRef.setPlaceholder('No se pudo cargar la lista');
    setStatus('error', error.message || 'Error al cargar usuarios.');
  }
}

function syncCredentialMode(role) {
  const isAdmin = role === 'Administrador';
  $('nameSelectField').classList.toggle('hidden', isAdmin);
  $('adminUserField').classList.toggle('hidden', !isAdmin);

  if (isAdmin) {
    nameSelectFieldRef.setValue('', false);
    nameSelectFieldRef.setOptions([]);
    nameSelectFieldRef.setPlaceholder('No aplica para administradores');
    nameSelectFieldRef.setDisabled(true);
  } else if (!role) {
    nameSelectFieldRef.setValue('', false);
    nameSelectFieldRef.setOptions([]);
    nameSelectFieldRef.setPlaceholder('Selecciona primero un rol');
    nameSelectFieldRef.setDisabled(true);
  }
}

function updateRoleShortcutState(role) {
  roleShortcutButtons.forEach((button) => {
    const active = button.dataset.roleShortcut === role;
    button.classList.toggle('border-brand-bun', active);
    button.classList.toggle('bg-brand-bun', active);
    button.classList.toggle('text-neutral-charcoal', true);
    button.classList.toggle('border-neutral-charcoal/10', !active);
    button.classList.toggle('bg-white/78', !active);
    button.classList.toggle('hover:bg-brand-cheese/24', !active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

async function handleRoleSelection(role) {
  clearStatus();
  $('adminUserInput').value = '';
  syncCredentialMode(role);
  updateRoleShortcutState(role);

  if (role === 'Colaborador') {
    await cargarUsuariosPorRol(role);
  }
}

function updateSessionCard(session) {
  const card = $('sessionCard');
  if (!session) {
    card.classList.add('hidden');
    $('sessionDescription').textContent = '';
    return;
  }

  $('sessionTitle').textContent = `Sesión activa · ${session.role}`;
  $('sessionDescription').textContent = `${session.displayName || 'Usuario'} autenticado. Continúa a tu panel permitido.`;
  $('btnContinue').dataset.href = window.LVAuth.getDefaultLandingPage(session.role);
  card.classList.remove('hidden');
}

function handleReasonMessage() {
  const params = new URLSearchParams(window.location.search);
  const reason = params.get('reason');
  if (reason === 'session') {
    setStatus('error', 'Tu sesión no existe o expiró. Ingresa nuevamente con tu PIN.');
  } else if (reason === 'forbidden') {
    setStatus('error', 'Tu sesión no tiene permisos para esa vista.');
  }
}

async function refreshSessionUI() {
  const current = window.LVAuth.getSession();
  if (!current) {
    updateSessionCard(null);
    return;
  }

  try {
    const session = await window.LVAuth.validateSession();
    updateSessionCard(session);
    if (session) {
      setStatus('success', `${session.displayName || 'Usuario'} autenticado como ${session.role}.`);
    }
  } catch {
    window.LVAuth.clearSession();
    updateSessionCard(null);
  }
}

function buildApp() {
  const app = $('app');
  const shell = document.createElement('div');
  shell.className = 'mx-auto flex min-h-screen w-full max-w-[1240px] flex-col justify-center gap-lg px-lg py-lg md:px-2xl md:py-2xl';

  const layout = document.createElement('section');
  layout.className = 'grid items-stretch gap-lg xl:grid-cols-[minmax(0,1.7fr)_minmax(380px,420px)]';

  const hero = createCard({
    tone: 'dark',
    className: 'rounded-[32px] border-neutral-cream/18 bg-[linear-gradient(135deg,rgba(72,53,24,0.88),rgba(58,33,21,0.92)_38%,rgba(108,61,28,0.82)_100%)] px-xl py-xl shadow-none md:px-2xl md:py-2xl',
  });

  const heroBadge = createBadge('La Victoria · Acceso interno', {
    tone: 'dark',
    className: 'border-brand-cheese/32 bg-brand-cheese/22 text-neutral-cream shadow-none',
  });

  const heroTitle = document.createElement('h1');
  heroTitle.className = 'mt-xl max-w-[7ch] text-[clamp(54px,7vw,88px)] font-black leading-[0.92] tracking-[-0.08em] text-neutral-cream';
  heroTitle.textContent = 'Ingreso por rol.';

  const heroLead = document.createElement('p');
  heroLead.className = 'mt-lg max-w-[30ch] text-base font-semibold leading-8 text-neutral-cream/82 md:mt-xl md:text-lg md:leading-9';
  heroLead.textContent = 'Accede a tu espacio interno de forma segura. El sistema valida tu identidad antes de habilitar la navegación correspondiente a tu perfil.';

  const featureGrid = document.createElement('div');
  featureGrid.className = 'mt-xl grid gap-md sm:grid-cols-2 md:mt-2xl';
  featureGrid.append(
    createFeatureCard('Acceso personalizado', 'Cada persona ingresa solo a las secciones que le corresponden.'),
    createFeatureCard('Consulta de turnos', 'Puedes revisar tu información asignada desde una vista simple y protegida.'),
    createFeatureCard('Sesión protegida', 'El acceso se conserva solo durante la sesión activa de esta pestaña.'),
    createFeatureCard('Validación segura', 'La identidad y los permisos se verifican antes de mostrar cualquier contenido.'),
  );

  hero.append(heroBadge, heroTitle, heroLead, featureGrid);

  const card = createCard({
    eyebrow: 'Autenticación',
    title: 'Ingresa tus credenciales',
    body: 'Selecciona tu rol. Si eres colaborador, elige tu nombre de la lista; si eres administrador, ingresa tu usuario y tu PIN.',
    className: 'rounded-[32px] bg-[#fff8ee] px-xl py-xl shadow-none md:px-2xl md:py-2xl',
  });

  const cardTitle = card.querySelector('h3');
  if (cardTitle) {
    cardTitle.className = 'mb-md text-[clamp(34px,4vw,56px)] font-black leading-[0.94] tracking-[-0.06em] text-neutral-charcoal md:mb-lg';
  }

  const cardBody = card.querySelector('p');
  if (cardBody) {
    cardBody.className = 'max-w-[24ch] text-base font-bold leading-8 text-neutral-muted md:max-w-[18ch] md:text-lg md:leading-9';
  }

  const form = document.createElement('form');
  form.id = 'loginForm';
  form.className = 'mt-xl grid gap-lg md:mt-2xl md:gap-xl';

  const roleShortcutBlock = document.createElement('div');
  roleShortcutBlock.className = 'grid gap-sm rounded-3xl border border-neutral-charcoal/10 bg-white/66 p-md';

  const roleShortcutLabel = document.createElement('p');
  roleShortcutLabel.className = 'text-xs font-black uppercase tracking-[0.18em] text-neutral-muted';
  roleShortcutLabel.textContent = 'Ruta rápida';

  const roleShortcutHelp = document.createElement('p');
  roleShortcutHelp.className = 'text-sm font-semibold leading-6 text-neutral-muted';
  roleShortcutHelp.textContent = 'En móvil, elige primero cómo quieres ingresar para mostrar solo los campos necesarios.';

  const roleShortcutRow = document.createElement('div');
  roleShortcutRow.className = 'grid grid-cols-2 gap-sm';

  const adminShortcut = createButton('Administrador', {
    variant: 'ghost',
    className: 'min-h-[48px] border border-neutral-charcoal/10 bg-white/78 text-neutral-charcoal hover:bg-brand-cheese/24',
  });
  adminShortcut.dataset.roleShortcut = 'Administrador';

  const collaboratorShortcut = createButton('Colaborador', {
    variant: 'ghost',
    className: 'min-h-[48px] border border-neutral-charcoal/10 bg-white/78 text-neutral-charcoal hover:bg-brand-cheese/24',
  });
  collaboratorShortcut.dataset.roleShortcut = 'Colaborador';

  roleShortcutButtons = [adminShortcut, collaboratorShortcut];
  roleShortcutRow.append(adminShortcut, collaboratorShortcut);
  roleShortcutBlock.append(roleShortcutLabel, roleShortcutHelp, roleShortcutRow);

  const roleField = createSelectField({
    label: 'Rol',
    id: 'roleSelect',
    name: 'role',
    options: [
      { value: 'Administrador', label: 'Administrador' },
      { value: 'Colaborador', label: 'Colaborador' },
    ],
    placeholder: 'Selecciona un rol',
  });
  roleField.wrapper.id = 'roleSelectField';
  roleSelectFieldRef = roleField;

  const nameField = createSelectField({
    label: 'Nombre',
    id: 'nameSelect',
    name: 'nombre',
    disabled: true,
    options: [],
    placeholder: 'Selecciona primero un rol',
  });
  nameField.wrapper.id = 'nameSelectField';
  nameSelectFieldRef = nameField;

  const adminField = createFieldLabel('Usuario administrador');
  adminField.id = 'adminUserField';
  adminField.classList.add('hidden');
  adminField.appendChild(createTextInput({
    id: 'adminUserInput',
    name: 'admin_username',
    placeholder: 'Ingresa tu usuario',
    autocomplete: 'username',
  }));

  const pinField = createPinInputField({
    label: 'PIN de acceso',
    name: 'pin',
    placeholder: '••••',
    maxLength: 12,
  });
  pinField.input.id = 'pinInput';
  pinField.input.autocomplete = 'one-time-code';
  pinField.toggle.id = 'btnTogglePin';

  const status = document.createElement('div');
  status.id = 'loginStatus';
  status.hidden = true;

  const actions = document.createElement('div');
  actions.className = 'grid gap-sm';
  const btnLogin = createButton('Ingresar', { className: 'min-h-[56px] text-base' });
  btnLogin.type = 'submit';
  btnLogin.id = 'btnLogin';
  actions.append(btnLogin);

  const sessionCard = document.createElement('section');
  sessionCard.id = 'sessionCard';
  sessionCard.className = 'hidden gap-md rounded-3xl border border-brand-lettuce/18 bg-brand-lettuce/10 p-lg';
  sessionCard.setAttribute('aria-live', 'polite');
  sessionCard.innerHTML = `
    <strong id="sessionTitle" class="text-xl font-black text-brand-lettuce">Sesión activa</strong>
    <span id="sessionDescription" class="text-sm font-bold leading-7 text-brand-lettuce"></span>
  `;
  const btnContinue = createButton('Continuar', { variant: 'success' });
  btnContinue.id = 'btnContinue';
  btnContinue.type = 'button';
  sessionCard.appendChild(btnContinue);

  form.append(roleField.wrapper, nameField.wrapper, adminField, pinField.wrapper, status, actions);
  card.append(form, sessionCard);

  const note = document.createElement('p');
  note.className = 'text-center text-sm text-neutral-cream/70';
  note.textContent = 'Si accedes por URL directa sin sesión válida, el sistema volverá a esta pantalla.';

  form.prepend(roleShortcutBlock);

  card.classList.add('xl:order-2');
  hero.classList.add('xl:order-1');

  layout.append(card, hero);
  shell.append(layout, note);
  app.appendChild(shell);
}

async function bootstrap() {
  buildApp();
  const overlay = createLoadingOverlay('Procesando...');
  document.body.appendChild(overlay.element);

  handleReasonMessage();
  await refreshSessionUI();
  syncCredentialMode('');
  updateRoleShortcutState('');

  roleSelectFieldRef.onChange(handleRoleSelection);
  roleShortcutButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const role = button.dataset.roleShortcut || '';
      roleSelectFieldRef.setValue(role, false);
      await handleRoleSelection(role);
    });
  });

  $('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    clearStatus();

    const role = roleSelectFieldRef.getValue().trim();
    const nombre = role === 'Administrador'
      ? $('adminUserInput').value.trim()
      : nameSelectFieldRef.getValue().trim();
    const pin = $('pinInput').value.trim();

    if (!role) {
      setStatus('error', 'Debes seleccionar un rol.');
      return;
    }

    if (!nombre) {
      setStatus('error', role === 'Administrador' ? 'Debes ingresar tu usuario.' : 'Debes seleccionar un nombre.');
      return;
    }

    if (!pin) {
      setStatus('error', 'Debes ingresar un PIN.');
      return;
    }

    $('btnLogin').disabled = true;
    setStatus('loading', 'Validando credenciales...');
    overlay.setLoading(true, 'Iniciando sesión...');
    await waitNextFrame();

    try {
      const session = await window.LVAuth.loginBySelection(role, nombre, pin);
      $('pinInput').value = '';
      updateSessionCard(session);
      setStatus('success', `${session.displayName || 'Usuario'} autenticado como ${session.role}.`);
      window.location.href = window.LVAuth.getDefaultLandingPage(session.role);
    } catch (error) {
      updateSessionCard(null);
      setStatus('error', error.message || 'No se pudo validar el acceso.');
    } finally {
      overlay.setLoading(false);
      $('btnLogin').disabled = false;
    }
  });

  $('btnContinue').addEventListener('click', () => {
    const href = $('btnContinue').dataset.href || 'index.html';
    window.location.href = href;
  });

}

bootstrap();
