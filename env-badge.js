(function() {
  var config = window.APP_CONFIG || {};
  var environment = String(config.ENVIRONMENT || "prod").trim().toLowerCase();
  var label = environment === "staging" ? "STAGING" : "PROD";
  var palette = environment === "staging"
    ? {
        background: "rgba(133, 26, 12, 0.92)",
        border: "rgba(255, 180, 95, 0.55)",
        color: "#fff4db",
        shadow: "0 12px 26px rgba(85, 20, 10, 0.32)"
      }
    : {
        background: "rgba(19, 77, 56, 0.9)",
        border: "rgba(157, 230, 189, 0.38)",
        color: "#eafff3",
        shadow: "0 12px 26px rgba(11, 61, 44, 0.24)"
      };

  function injectBadge() {
    if (!document.body || document.getElementById("lv-env-badge")) {
      return;
    }

    var badge = document.createElement("div");
    badge.id = "lv-env-badge";
    badge.setAttribute("aria-label", "Entorno activo: " + label);
    badge.textContent = label;
    badge.style.position = "fixed";
    badge.style.top = "14px";
    badge.style.right = "14px";
    badge.style.zIndex = "9999";
    badge.style.padding = "8px 12px";
    badge.style.borderRadius = "999px";
    badge.style.border = "1px solid " + palette.border;
    badge.style.background = palette.background;
    badge.style.color = palette.color;
    badge.style.boxShadow = palette.shadow;
    badge.style.backdropFilter = "blur(8px)";
    badge.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
    badge.style.fontSize = "11px";
    badge.style.fontWeight = "800";
    badge.style.letterSpacing = "0.18em";
    badge.style.lineHeight = "1";
    badge.style.pointerEvents = "none";
    badge.style.userSelect = "none";
    badge.style.textTransform = "uppercase";

    document.body.appendChild(badge);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectBadge);
  } else {
    injectBadge();
  }
})();
