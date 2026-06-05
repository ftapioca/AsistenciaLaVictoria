import '../styles/globals.css';
import '../../app-config.prod.js';
import '../../app-config.staging.js';
import '../../app-config.js';
import '../../env-badge.js';
import '../../auth.js';

import { createLoadingOverlay } from '../components/LoadingOverlay.js';
import { createAdminPanelApp } from './admin-panel-app.js';

const $ = (id) => document.getElementById(id);

function withCurrentEnvironment(path) {
  const target = new URL(path, window.location.href);
  const env = window.APP_CONFIG && window.APP_CONFIG.ENVIRONMENT;
  if (env) {
    target.searchParams.set('env', env);
  }
  return target.toString();
}

function waitNextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

const overlay = createLoadingOverlay('Procesando...');
document.body.appendChild(overlay.element);

const panelApp = createAdminPanelApp({
  mountNode: $('app'),
  environment: (window.APP_CONFIG && window.APP_CONFIG.ENVIRONMENT || 'prod').toUpperCase(),
  sessionLabel: 'Validando sesión...',
  accessLabel: 'Sesión protegida',
  onBack: () => { window.location.href = withCurrentEnvironment('index.html'); },
  onLogout: async () => {
    overlay.setLoading(true, 'Cerrando sesión...');
    await waitNextFrame();
    await window.LVAuth.logout();
    window.LVAuth.redirectToIndex();
  },
  onNavigate: (path) => { window.location.href = withCurrentEnvironment(path); },
});

document.addEventListener('DOMContentLoaded', async () => {
  const session = await window.LVAuth.protectPage(['Administrador']);
  if (!session) return;
  panelApp.setSessionLabel(`${session.displayName || 'Administrador'} · ${session.role}`);
});
