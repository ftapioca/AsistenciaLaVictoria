(function() {
  var STORAGE_KEY = "lavictoria.app.env";
  var presets = window.APP_CONFIG_PRESETS || {};
  var defaultPresets = {
    prod: {
      ENVIRONMENT: "prod",
      WEB_APP_URL: "https://script.google.com/macros/s/AKfycbyqIaw4SLUy1pYl7iAv1QPrgWvHNE51H4dVk-R0qRZ8DppTZNAWRhN0W8bdmG3W23rq/exec",
      SESSION_KEY: "lavictoria.auth.session.prod"
    },
    staging: {
      ENVIRONMENT: "staging",
      WEB_APP_URL: "https://script.google.com/macros/s/AKfycbzcfyIN11hOygphJChfCyPGsj4Th-CfL8ZqFOk7_N-afJZeKZphqFPUrPpBXsvtY-5nFA/exec",
      SESSION_KEY: "lavictoria.auth.session.staging"
    }
  };
  var availablePresets = {
    prod: presets.prod || defaultPresets.prod,
    staging: presets.staging || defaultPresets.staging
  };

  function readStoredEnvironment() {
    try {
      return window.localStorage ? window.localStorage.getItem(STORAGE_KEY) : "";
    } catch (error) {
      return "";
    }
  }

  function writeStoredEnvironment(env) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, env);
      }
    } catch (error) {
      // Ignorar fallas de storage en navegadores restringidos.
    }
  }

  function normalizeEnvironment(env) {
    var value = String(env || "").trim().toLowerCase();
    return availablePresets[value] ? value : "";
  }

  function resolveEnvironment() {
    var forced = normalizeEnvironment(window.LV_FORCE_ENV);
    if (forced) return forced;

    var params = new URLSearchParams(window.location.search || "");
    var fromQuery = normalizeEnvironment(params.get("env"));
    if (fromQuery) {
      writeStoredEnvironment(fromQuery);
      return fromQuery;
    }

    var fromStorage = normalizeEnvironment(readStoredEnvironment());
    if (fromStorage) return fromStorage;

    return "prod";
  }

  function setEnvironment(env) {
    var normalized = normalizeEnvironment(env);
    if (!normalized) {
      throw new Error('Entorno no válido: "' + env + '".');
    }

    writeStoredEnvironment(normalized);
    window.APP_CONFIG = construirConfig(normalized);
    return window.APP_CONFIG;
  }

  function construirConfig(env) {
    var preset = availablePresets[env] || availablePresets.prod;
    return {
      ENVIRONMENT: preset.ENVIRONMENT,
      WEB_APP_URL: preset.WEB_APP_URL,
      SESSION_KEY: preset.SESSION_KEY,
      ENV_STORAGE_KEY: STORAGE_KEY
    };
  }

  var environment = resolveEnvironment();

  window.APP_CONFIG_PRESETS = availablePresets;
  window.APP_CONFIG = construirConfig(environment);
  window.LVAppConfig = {
    getEnvironment: function() {
      return window.APP_CONFIG.ENVIRONMENT;
    },
    setEnvironment: setEnvironment,
    presets: availablePresets
  };
})();
