import { withCurrentEnvironment } from '../utils/navigation.js';
import '../styles/globals.css';
import '../../app-config.prod.js';
import '../../app-config.staging.js';
import '../../app-config.js';
import '../../env-badge.js';

import { createLoadingOverlay } from '../components/LoadingOverlay.js';
import { createAdminPanelApp } from './admin-panel-app.js';

const overlay = createLoadingOverlay('Preview visual');
document.body.appendChild(overlay.element);


createAdminPanelApp({
  mountNode: document.getElementById('app'),
  environment: (window.APP_CONFIG && window.APP_CONFIG.ENVIRONMENT || 'prod').toUpperCase(),
  sessionLabel: 'Felipe Tapia · Administrador',
  accessLabel: 'Preview sin auth',
  sideCopy: 'Esta ruta existe solo para revisar diseño, layout y responsividad sin depender de sesión activa ni backend.',
  onBack: () => { window.location.href = withCurrentEnvironment('index.html'); },
  onLogout: () => {
    overlay.setLoading(true, 'Preview visual: sin logout real');
    window.setTimeout(() => overlay.setLoading(false), 900);
  },
  onNavigate: () => {
    overlay.setLoading(true, 'Preview visual: navegación deshabilitada');
    window.setTimeout(() => overlay.setLoading(false), 900);
  },
});
