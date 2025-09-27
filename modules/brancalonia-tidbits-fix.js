/**
 * BRANCALONIA TIDBITS COMPATIBILITY FIX
 * Risolve l'errore di Tidbits con showLoadingScreen
 *
 * PROBLEMA: Tidbits v3.0.2 cerca di accedere showLoadingScreen su undefined
 * SOLUZIONE: Assicurarsi che l'oggetto esista prima che Tidbits lo acceda
 */

(function() {
  console.log("🔧 Brancalonia Tidbits Fix - Patching compatibility");

  // Hook molto precoce prima di canvasInit
  Hooks.once("init", () => {
    // Assicurati che game.settings esista con i metodi necessari
    if (typeof game !== 'undefined' && game.settings) {
      // Crea un wrapper per get che gestisce il caso showLoadingScreen
      const originalGet = game.settings.get.bind(game.settings);

      game.settings.get = function(module, key) {
        try {
          // Se Tidbits cerca showLoadingScreen e non esiste, ritorna default
          if (module === 'tidbits' && key === 'showLoadingScreen') {
            try {
              return originalGet(module, key);
            } catch (e) {
              console.log("⚠️ Tidbits showLoadingScreen setting not found, using default");
              return true; // Default value
            }
          }

          return originalGet(module, key);
        } catch (error) {
          console.warn(`⚠️ Setting ${module}.${key} not found:`, error.message);

          // Return sensible defaults for common settings
          if (key === 'showLoadingScreen') return true;
          if (key === 'enabled') return false;

          return undefined;
        }
      };
    }
  });

  // Fix specifico per canvasInit hook
  const originalCallAll = Hooks.callAll;
  let patchActive = true;

  Hooks.callAll = function(hook, ...args) {
    if (patchActive && hook === "canvasInit") {
      // Assicurati che tidbits config esista
      if (game.modules.get("tidbits")?.active) {
        // Crea oggetto config se non esiste
        if (!window.tidbits) {
          window.tidbits = {};
        }

        if (!window.tidbits.config) {
          window.tidbits.config = {
            showLoadingScreen: true,
            enabled: true
          };
        }

        // Assicurati che game.settings.get funzioni per tidbits
        const tidbitSettings = {};

        // Intercetta errori specifici di Tidbits
        try {
          // Pre-popola settings che Tidbits potrebbe cercare
          const possibleSettings = [
            'showLoadingScreen',
            'enableLoadingScreen',
            'loadingScreenEnabled',
            'enabled',
            'active'
          ];

          for (const setting of possibleSettings) {
            try {
              tidbitSettings[setting] = game.settings.get('tidbits', setting);
            } catch (e) {
              // Se il setting non esiste, usa default
              if (setting.includes('Loading') || setting === 'showLoadingScreen') {
                tidbitSettings[setting] = true;
              } else {
                tidbitSettings[setting] = false;
              }
            }
          }

          // Monkey-patch temporaneo per Tidbits
          const originalSettingsGet = game.settings.get;
          game.settings.get = function(module, key) {
            if (module === 'tidbits' && tidbitSettings.hasOwnProperty(key)) {
              return tidbitSettings[key];
            }
            return originalSettingsGet.call(this, module, key);
          };

          // Chiama gli hook
          const result = originalCallAll.call(this, hook, ...args);

          // Ripristina dopo
          game.settings.get = originalSettingsGet;

          return result;

        } catch (error) {
          console.error("❌ Error in Tidbits canvasInit compatibility:", error);

          // Prova a chiamare gli altri hook escludendo Tidbits
          return callHooksExceptTidbits(hook, args);
        }
      }
    }

    // Per altri hook, chiama normalmente
    return originalCallAll.call(this, hook, ...args);
  };

  // Disabilita dopo il caricamento
  Hooks.once("ready", () => {
    setTimeout(() => {
      patchActive = false;
      Hooks.callAll = originalCallAll;
      console.log("✅ Tidbits fix - Protection disabled after startup");
    }, 2000);
  });

  /**
   * Chiama hooks escludendo Tidbits
   */
  function callHooksExceptTidbits(hook, args) {
    console.log(`🔧 Calling ${hook} hooks except tidbits`);

    const hooks = Hooks._hooks[hook] || [];

    for (const hookFn of hooks) {
      try {
        // Salta se sembra essere di Tidbits
        const fnStr = hookFn.toString();
        if (fnStr.includes('tidbits') ||
            fnStr.includes('showLoadingScreen') ||
            fnStr.includes('Tidbits')) {
          console.log("  ⏭️ Skipping suspected Tidbits hook");
          continue;
        }

        // Chiama l'hook
        hookFn(...args);
      } catch (e) {
        console.warn(`  ⚠️ Error in hook, skipping:`, e.message);
      }
    }
  }

  /**
   * Fix alternativo: patch diretto di Tidbits se presente
   */
  Hooks.once("setup", () => {
    if (game.modules.get("tidbits")?.active) {
      console.log("🎮 Tidbits detected, applying direct patches");

      // Assicurati che l'oggetto config esista
      if (window.Tidbits || window.tidbits) {
        const tidbits = window.Tidbits || window.tidbits;

        // Patcha il config se esiste
        if (tidbits.config || tidbits.Config) {
          const config = tidbits.config || tidbits.Config;

          // Assicurati che showLoadingScreen esista
          if (config.showLoadingScreen === undefined) {
            config.showLoadingScreen = true;
          }

          // Crea getter sicuro
          Object.defineProperty(config, 'showLoadingScreen', {
            get() {
              try {
                return game.settings.get('tidbits', 'showLoadingScreen');
              } catch (e) {
                return true; // Default
              }
            },
            set(value) {
              try {
                game.settings.set('tidbits', 'showLoadingScreen', value);
              } catch (e) {
                // Ignora se non può salvare
              }
            },
            configurable: true
          });
        }

        // Patcha metodi che potrebbero avere problemi
        const methodsToPatch = [
          'initialize',
          'init',
          'setup',
          'ready',
          'canvasInit'
        ];

        for (const method of methodsToPatch) {
          if (typeof tidbits[method] === 'function') {
            const original = tidbits[method];
            tidbits[method] = function(...args) {
              try {
                return original.apply(this, args);
              } catch (error) {
                console.warn(`⚠️ Tidbits ${method} failed:`, error.message);
                return undefined;
              }
            };
          }
        }
      }
    }
  });

  /**
   * Protezione finale per canvasInit
   */
  Hooks.on("canvasInit", () => {
    // Se arriviamo qui, canvas è inizializzato correttamente
    // Assicurati che tutto sia a posto per Tidbits
    if (game.modules.get("tidbits")?.active) {
      if (!game.settings.storage.get("world")?.getItem("tidbits.showLoadingScreen")) {
        console.log("🔧 Creating missing Tidbits settings");

        // Crea setting mancante se possibile
        try {
          game.settings.storage.get("world")?.setItem(
            "tidbits.showLoadingScreen",
            JSON.stringify(true)
          );
        } catch (e) {
          // Ignora se non può creare
        }
      }
    }
  });

})();

console.log("📦 Brancalonia Tidbits Fix loaded");