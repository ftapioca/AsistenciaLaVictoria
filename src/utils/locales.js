export async function cargarLocalesPorSesion(modulo) {
  const response = await window.LVAuth.apiGet({ accion: 'LocalesPorSesion', modulo });
  if (response.status !== 'SUCCESS' || !Array.isArray(response.locales)) {
    throw new Error(response.mensaje || 'No se pudo cargar el catálogo de locales.');
  }
  return response.locales;
}

export function mostrarErrorInicio(error) {
  const alert = document.createElement('div');
  alert.className = 'm-lg rounded-2xl border border-brand-ketchup/24 bg-white p-lg text-brand-ketchup';
  alert.setAttribute('role', 'alert');
  alert.textContent = error.message || 'No se pudo iniciar la página. Recarga para volver a intentarlo.';
  document.getElementById('app').replaceChildren(alert);
}
