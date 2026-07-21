(function () {
  const config = window.APP_CONFIG || {};
  const WEB_APP_URL = config.WEB_APP_URL || "";
  const SESSION_KEY = config.SESSION_KEY || "lavictoria.auth.session";
  const SESSION_VALIDATION_TTL_MS = Number(config.SESSION_VALIDATION_TTL_MS || 120000);
  const USER_TYPES = Object.freeze({
    ADMINISTRADOR: Object.freeze({
      id: "Administrador",
      label: "Administrador",
      landingPage: "adminPanel.html",
      credentialMode: "username",
      usesDirectory: false,
      fallbackDisplayName: "Administrador"
    }),
    SUPERVISOR: Object.freeze({
      id: "Supervisor",
      label: "Supervisor",
      landingPage: "adminPanel.html",
      credentialMode: "username",
      usesDirectory: false,
      fallbackDisplayName: "Supervisor"
    }),
    COLABORADOR: Object.freeze({
      id: "Colaborador",
      label: "Colaborador",
      landingPage: "misTurnos.html",
      credentialMode: "directory",
      usesDirectory: true,
      fallbackDisplayName: "Colaborador"
    })
  });

  const USER_TYPE_LIST = Object.freeze(Object.values(USER_TYPES));

  function getUserType(role) {
    const normalizedRole = String(role || "").trim();
    return USER_TYPE_LIST.find((userType) => userType.id === normalizedRole) || null;
  }

  function isRole(role, expectedRole) {
    return String(role || "").trim() === String(expectedRole || "").trim();
  }

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
      sessionToken: data.sessionToken,
      permissions: data.permissions || {},
      allowedLocals: Array.isArray(data.allowedLocals) ? data.allowedLocals : [],
      unrestrictedLocals: Boolean(data.unrestrictedLocals),
      validatedAt: Date.now()
    };

    setSession(session);
    return session;
  }

  async function validateSession() {
    const session = getSession();
    if (!session || !session.sessionToken) {
      return null;
    }

    if (
      session.validatedAt &&
      Number.isFinite(session.validatedAt) &&
      Date.now() - session.validatedAt < SESSION_VALIDATION_TTL_MS
    ) {
      return session;
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
      sessionToken: session.sessionToken,
      permissions: data.permissions || session.permissions || {},
      allowedLocals: Array.isArray(data.allowedLocals) ? data.allowedLocals : (session.allowedLocals || []),
      unrestrictedLocals: typeof data.unrestrictedLocals === "boolean"
        ? data.unrestrictedLocals
        : Boolean(session.unrestrictedLocals),
      validatedAt: Date.now()
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
    const userType = getUserType(role);
    return userType ? userType.landingPage : "index.html";
  }

  window.LVAuth = {
    roles: Object.freeze({
      ADMINISTRADOR: USER_TYPES.ADMINISTRADOR.id,
      SUPERVISOR: USER_TYPES.SUPERVISOR.id,
      COLABORADOR: USER_TYPES.COLABORADOR.id
    }),
    userTypes: USER_TYPES,
    getUserTypes: () => USER_TYPE_LIST.slice(),
    getUserType,
    isRole,
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
