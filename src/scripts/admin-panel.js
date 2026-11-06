import { withCurrentEnvironment } from '../utils/navigation.js';
import { waitNextFrame } from '../utils/async.js';
import { cargarLocalesPorSesion } from '../utils/locales.js';
import '../styles/globals.css';
import '../../app-config.prod.js';
import '../../app-config.staging.js';
import '../../app-config.js';
import '../../env-badge.js';
import '../../auth.js';

import { createLoadingOverlay } from '../components/LoadingOverlay.js';
import { createAdminPanelApp, createAdminPanelSkeleton } from './admin-panel-app.js';

const $ = (id) => document.getElementById(id);


const overlay = createLoadingOverlay('Procesando...');
document.body.appendChild(overlay.element);

document.addEventListener('DOMContentLoaded', async () => {
  $('app').innerHTML = '';
  createAdminPanelSkeleton({ mountNode: $('app') });
  overlay.setLoading(
    true,
    'Validando sesión...',
    'Estamos cargando tus módulos y permisos para mostrar solo las herramientas habilitadas.'
  );

  try {
    const session = await window.LVAuth.protectPage([
      window.LVAuth.roles.ADMINISTRADOR,
      window.LVAuth.roles.SUPERVISOR,
    ]);
    if (!session) return;

    const isSupervisor = session.role === window.LVAuth.roles.SUPERVISOR;
    const visibleToolTitles = isSupervisor
      ? ['Turnos Abiertos', 'Programador']
      : ['Turnos Abiertos', 'Programador', 'Administración'];

    $('app').innerHTML = '';
    const panel = createAdminPanelApp({
      mountNode: $('app'),
      sessionLabel: `${session.displayName || session.role} · ${session.role}`,
      sideCopy: isSupervisor
        ? 'Como supervisor, solo verás los módulos y locales permitidos para tu sesión.'
        : 'Usa este panel como hub de navegación para las herramientas administrativas.',
      onBack: () => { window.location.href = withCurrentEnvironment('index.html'); },
      onLogout: async () => {
        overlay.setLoading(true, 'Cerrando sesión...');
        await waitNextFrame();
        await window.LVAuth.logout();
        window.LVAuth.redirectToIndex();
      },
      onNavigate: (path) => { window.location.href = withCurrentEnvironment(path); },
      visibleToolTitles,
      showResources: !isSupervisor,
    });
    if (!isSupervisor) {
      cargarLocalesPorSesion('general').then((locales) => panel.setResourceLocales(locales))
        .catch((error) => panel.showResourceError(error.message));
    }
  } finally {
    overlay.setLoading(false);
  }
});
