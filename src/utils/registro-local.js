export function escaparHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

export function crearHtmlRegistroLocal(template, nombre, webAppUrl) {
  nombre = String(nombre || '').trim();
  if (!nombre || nombre.length > 80) throw new Error('Indica un nombre de local válido.');
  const url = new URL(webAppUrl);
  if (url.protocol !== 'https:' || url.hostname !== 'script.google.com' || !/^\/macros\/s\/[^/]+\/exec$/.test(url.pathname)) throw new Error('La dirección del sistema de asistencia no es válida.');
  const jsonSeguro = (value) => JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`);
  const replacements = {
    __LV_LOCAL_JSON__: jsonSeguro(nombre),
    __LV_WEB_APP_URL_JSON__: jsonSeguro(url.href),
    __LV_LOCAL_HTML__: escaparHtml(nombre),
  };
  return template.replace(/__LV_LOCAL_JSON__|__LV_WEB_APP_URL_JSON__|__LV_LOCAL_HTML__/g, (key) => replacements[key]);
}

export async function descargarRegistroLocal(nombre) {
  const { default: template } = await import('../templates/registro-asistencia.html?raw');
  const html = crearHtmlRegistroLocal(template, nombre, window.APP_CONFIG.WEB_APP_URL);
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  const suffix = window.APP_CONFIG.ENVIRONMENT === 'staging' ? ' _ STAGING' : '';
  link.download = `Registro Asistencia _ Local ${nombre.replace(/[\\/:*?"<>|\x00-\x1f]/g, '_')}${suffix}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
