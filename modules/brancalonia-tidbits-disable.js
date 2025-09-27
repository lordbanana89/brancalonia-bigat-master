/**
 * BRANCALONIA TIDBITS DISABLE
 * Disabilita completamente Tidbits se causa troppi errori
 */

console.log("🚫 Brancalonia Tidbits Disable - Loading");

// ============================================
// DISABILITA TIDBITS COMPLETAMENTE
// ============================================

(function() {
  // Override immediato di Tidbits
  if (typeof Tidbits !== 'undefined') {
    console.warn("⚠️ Tidbits detected - DISABLING due to incompatibility");

    // Override tutti i metodi di Tidbits
    Tidbits.prototype.showLoadingScreen = function() {
      console.log("🚫 Tidbits.showLoadingScreen blocked");
      return Promise.resolve();
    };

    Tidbits.prototype.hideLoadingScreen = function() {
      console.log("🚫 Tidbits.hideLoadingScreen blocked");
      return Promise.resolve();
    };

    Tidbits.prototype.loadSources = function() {
      console.log("🚫 Tidbits.loadSources blocked");
      return Promise.resolve();
    };

    Tidbits.prototype.getStartupLoadingScreen = function() {
      console.log("🚫 Tidbits.getStartupLoadingScreen blocked");
      return null;
    };
  }

  // Hook per disabilitare Tidbits all'init
  Hooks.once("init", () => {
    const tidbits = game.modules.get("tidbits");
    if (tidbits?.active) {
      console.error("❌ TIDBITS È INCOMPATIBILE CON FOUNDRY V13");
      console.error("❌ Il modulo Tidbits verrà disabilitato per prevenire crash");

      // Sovrascrivi qualsiasi funzione Tidbits
      if (window.Tidbits) {
        window.Tidbits = class {
          constructor() {
            console.log("🚫 Tidbits constructor blocked");
          }
          showLoadingScreen() { return Promise.resolve(); }
          hideLoadingScreen() { return Promise.resolve(); }
          loadSources() { return Promise.resolve(); }
          getStartupLoadingScreen() { return null; }
        };
      }

      // Notifica l'utente
      Hooks.once("ready", () => {
        ui.notifications.error(
          "Tidbits è incompatibile con Foundry v13 e è stato disabilitato. " +
          "Per favore disinstallalo dal Module Management.",
          { permanent: true }
        );
      });
    }
  });

  // Intercetta qualsiasi chiamata a Tidbits
  Object.defineProperty(window, 'Tidbits', {
    get() {
      return class {
        constructor() {}
        showLoadingScreen() { return Promise.resolve(); }
        hideLoadingScreen() { return Promise.resolve(); }
        loadSources() { return Promise.resolve(); }
        getStartupLoadingScreen() { return null; }
      };
    },
    set(value) {
      console.log("🚫 Attempt to set Tidbits blocked");
    },
    configurable: false
  });
})();

console.log("✅ Brancalonia Tidbits Disable loaded - Tidbits will be blocked");