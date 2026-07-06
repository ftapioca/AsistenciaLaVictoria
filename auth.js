(function () {
  const config = window.APP_CONFIG || {};
  const WEB_APP_URL = config.WEB_APP_URL || "";
  const SESSION_KEY = config.SESSION_KEY || "lavictoria.auth.session";

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    } catch (error) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  function setSession(session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function buildUrl(params) {
    return `${WEB_APP_URL}?${new URLSearchParams(params).toString()}`;
  }

  async function request(params, options) {
    if (!WEB_APP_URL) {
      throw new Error("Falta configurar APP_CONFIG.WEB_APP_URL.");
    }

    const response = await fetch(buildUrl(params), options || {});
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "No se pudo completar la solicitud.");
    }

    return data;
  }

  async function loginBySelection(role, nombre, pin) {
    const data = await request(
      {
        accion: "LoginPorSeleccion",
        role: String(role || "").trim(),
        nombre: String(nombre || "").trim(),
        pin: String(pin || "").trim()
      },
      { method: "POST" }
    );

    if (data.status !== "SUCCESS" || !data.sessionToken || !data.role) {
      throw new Error(data.mensaje || "Credenciales no válidas.");
    }

    const session = {
      role: data.role,
      displayName: data.displayName || "",
      userKey: data.userKey || "",
      sessionToken: data.sessionToken
    };

    setSession(session);
    return session;
  }

  async function validateSession() {
    const session = getSession();
    if (!session || !session.sessionToken) {
      return null;
    }

    const data = await request(
      { accion: "ValidarSesion", sessionToken: session.sessionToken },
      { method: "POST" }
    );

    if (data.status !== "SUCCESS" || !data.role) {
      clearSession();
      return null;
    }

    const refreshed = {
      role: data.role,
      displayName: data.displayName || session.displayName || "",
      userKey: data.userKey || session.userKey || "",
      sessionToken: session.sessionToken
    };

    setSession(refreshed);
    return refreshed;
  }

  async function logout() {
    const session = getSession();
    if (session && session.sessionToken) {
      try {
        await request(
          { accion: "Logout", sessionToken: session.sessionToken },
          { method: "POST" }
        );
      } catch (error) {
        // Si el servidor ya invalidó la sesión, igual limpiamos el cliente.
      }
    }

    clearSession();
  }

  function buildApiError(data, fallbackMessage) {
    const error = new Error(data && data.mensaje ? data.mensaje : fallbackMessage);
    error.code = data && data.status ? data.status : "ERROR";
    return error;
  }

  function ensureAuthorized(data) {
    if (!data || !data.status) {
      return data;
    }

    if (data.status === "UNAUTHORIZED") {
      clearSession();
      redirectToIndex("session");
      throw buildApiError(data, "Acceso no autorizado.");
    }

    if (data.status === "FORBIDDEN") {
      throw buildApiError(data, "No tienes permisos para esta acción.");
    }

    return data;
  }

  async function apiGet(params) {
    const session = getSession();
    const data = await request(
      { ...params, sessionToken: session && session.sessionToken ? session.sessionToken : "" },
      { method: "GET" }
    );
    return ensureAuthorized(data);
  }

  async function apiPost(params) {
    const session = getSession();
    const data = await request(
      { ...params, sessionToken: session && session.sessionToken ? session.sessionToken : "" },
      { method: "POST" }
    );
    return ensureAuthorized(data);
  }

  function redirectToIndex(reason) {
    const target = new URL("index.html", window.location.href);
    if (reason) {
      target.searchParams.set("reason", reason);
    }
    window.location.replace(target.toString());
  }

  async function protectPage(allowedRoles) {
    const session = await validateSession();
    if (!session) {
      redirectToIndex("session");
      return null;
    }

    if (Array.isArray(allowedRoles) && allowedRoles.length && !allowedRoles.includes(session.role)) {
      redirectToIndex("forbidden");
      return null;
    }

    return session;
  }

  function getDefaultLandingPage(role) {
    if (role === "Administrador") return "adminPanel.html";
    if (role === "Colaborador") return "misTurnos.html";
    return "index.html";
  }

  window.LVAuth = {
    getSession,
    setSession,
    clearSession,
    loginBySelection,
    validateSession,
    logout,
    apiGet,
    apiPost,
    protectPage,
    redirectToIndex,
    getDefaultLandingPage,
    WEB_APP_URL
  };
})();
