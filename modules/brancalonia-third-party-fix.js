/**
 * BRANCALONIA THIRD-PARTY MODULE FIX
 * Corregge l'uso di API deprecate in moduli di terze parti
 * DEVE essere caricato PER PRIMO per intercettare le chiamate
 */

console.log("🔧 Brancalonia Third-Party Fix - Intercepting deprecated APIs");

// ============================================
// FIX IMMEDIATO E PERSISTENTE - PRIMA DI TUTTI
// ============================================

// Questo codice deve eseguire IMMEDIATAMENTE, non in un hook
(function() {
  console.log("🚨 Emergency patching deprecated APIs from third-party modules");

  // SUPER AGGRESSIVO - Definisci SUBITO i globali
  // prima che qualsiasi altro modulo possa accedervi

  // Definisci un getter che ritorna sempre l'API moderna
  Object.defineProperty(globalThis, 'ClientSettings', {
    get() {
      return foundry?.helpers?.ClientSettings || this._clientSettings;
    },
    set(value) {
      this._clientSettings = value;
    },
    configurable: true,
    enumerable: false
  });

  Object.defineProperty(globalThis, 'SceneNavigation', {
    get() {
      return foundry?.applications?.ui?.SceneNavigation || this._sceneNav;
    },
    set(value) {
      this._sceneNav = value;
    },
    configurable: true,
    enumerable: false
  });

  Object.defineProperty(globalThis, 'Token', {
    get() {
      return foundry?.canvas?.placeables?.Token || this._token;
    },
    set(value) {
      this._token = value;
    },
    configurable: true,
    enumerable: false
  });

  Object.defineProperty(globalThis, 'JournalTextPageSheet', {
    get() {
      return foundry?.appv1?.sheets?.JournalTextPageSheet || this._journalSheet;
    },
    set(value) {
      this._journalSheet = value;
    },
    configurable: true,
    enumerable: false
  });

  console.log("✅ Global API redirects installed");

  // Salva riferimenti alle API moderne
  const modernAPIs = {
    SceneNavigation: null,
    Token: null,
    ClientSettings: null,
    JournalTextPageSheet: null,
    Canvas: null,
    WallsLayer: null,
    ControlsLayer: null
  };

  // Funzione per ottenere API moderna
  function getModernAPI(path) {
    const parts = path.split('.');
    let current = foundry;
    for (const part of parts) {
      current = current?.[part];
      if (!current) return null;
    }
    return current;
  }

  // Definisci proxy per intercettare accessi
  const createProxy = (name, modernPath) => {
    return new Proxy({}, {
      get(target, prop) {
        // Ottieni l'API moderna
        if (!modernAPIs[name]) {
          modernAPIs[name] = getModernAPI(modernPath);
        }

        const modern = modernAPIs[name];
        if (!modern) {
          console.warn(`⚠️ Modern API not available yet for ${name}`);
          return undefined;
        }

        // Ritorna la proprietà dall'API moderna
        return modern[prop];
      },

      set(target, prop, value) {
        // Ottieni l'API moderna
        if (!modernAPIs[name]) {
          modernAPIs[name] = getModernAPI(modernPath);
        }

        const modern = modernAPIs[name];
        if (modern) {
          modern[prop] = value;
          return true;
        }
        return false;
      },

      has(target, prop) {
        if (!modernAPIs[name]) {
          modernAPIs[name] = getModernAPI(modernPath);
        }
        const modern = modernAPIs[name];
        return modern ? prop in modern : false;
      },

      construct(target, args) {
        // Per costruttori
        if (!modernAPIs[name]) {
          modernAPIs[name] = getModernAPI(modernPath);
        }
        const modern = modernAPIs[name];
        if (modern) {
          return new modern(...args);
        }
        throw new Error(`Cannot construct ${name} - API not available`);
      }
    });
  };

  // Crea proxy per ogni API deprecata
  const apiMappings = [
    { old: 'SceneNavigation', modern: 'applications.ui.SceneNavigation' },
    { old: 'Token', modern: 'canvas.placeables.Token' },
    { old: 'ClientSettings', modern: 'helpers.ClientSettings' },
    { old: 'JournalTextPageSheet', modern: 'appv1.sheets.JournalTextPageSheet' },
    { old: 'Canvas', modern: 'canvas.Canvas' },
    { old: 'WallsLayer', modern: 'canvas.layers.WallsLayer' },
    { old: 'ControlsLayer', modern: 'canvas.layers.ControlsLayer' }
  ];

  // Applica i proxy SOLO se non esistono già
  apiMappings.forEach(({ old, modern }) => {
    if (!window.hasOwnProperty(old)) {
      try {
        Object.defineProperty(window, old, {
          get() {
            // Log solo una volta per tipo
            if (!this._warned) {
              console.log(`📍 Redirecting ${old} → foundry.${modern}`);
              this._warned = true;
            }

            // Prova prima a ottenere l'API moderna
            const modernAPI = getModernAPI(modern);
            if (modernAPI) {
              return modernAPI;
            }

            // Se non disponibile, ritorna il proxy
            return createProxy(old, modern);
          },
          set(value) {
            console.warn(`⚠️ Attempting to overwrite ${old} - ignored`);
          },
          configurable: true,
          enumerable: false
        });
      } catch (e) {
        console.warn(`Could not patch ${old}:`, e.message);
      }
    }
  });

  console.log("✅ Deprecated API patches applied");
})();

// ============================================
// PATCH DURANTE INIT
// ============================================

Hooks.once("init", () => {
  console.log("🔄 Verifying third-party patches during init");

  // Verifica che i patch siano ancora attivi
  const checks = [
    { name: 'SceneNavigation', path: 'applications.ui.SceneNavigation' },
    { name: 'Token', path: 'canvas.placeables.Token' },
    { name: 'ClientSettings', path: 'helpers.ClientSettings' },
    { name: 'JournalTextPageSheet', path: 'appv1.sheets.JournalTextPageSheet' }
  ];

  checks.forEach(({ name, path }) => {
    // Se il globale non esiste, ricrealo
    if (!window[name]) {
      const parts = path.split('.');
      let modern = foundry;

      for (const part of parts) {
        modern = modern?.[part];
        if (!modern) break;
      }

      if (modern) {
        window[name] = modern;
        console.log(`✅ Re-patched ${name} during init`);
      }
    }
  });
});

// ============================================
// PATCH SPECIFICI PER MODULI NOTI
// ============================================

Hooks.once("setup", () => {
  console.log("🎯 Applying module-specific patches");

  // Fix per moduli che usano Token direttamente
  if (typeof Token === 'undefined' && foundry.canvas?.placeables?.Token) {
    window.Token = foundry.canvas.placeables.Token;
    console.log("✅ Patched Token for third-party modules");
  }

  // Fix per moduli che usano ClientSettings
  if (typeof ClientSettings === 'undefined' && foundry.helpers?.ClientSettings) {
    window.ClientSettings = foundry.helpers.ClientSettings;
    console.log("✅ Patched ClientSettings for third-party modules");
  }

  // Fix per moduli che usano SceneNavigation
  if (typeof SceneNavigation === 'undefined' && foundry.applications?.ui?.SceneNavigation) {
    window.SceneNavigation = foundry.applications.ui.SceneNavigation;
    console.log("✅ Patched SceneNavigation for third-party modules");
  }

  // Fix per moduli che usano JournalTextPageSheet
  if (typeof JournalTextPageSheet === 'undefined' && foundry.appv1?.sheets?.JournalTextPageSheet) {
    window.JournalTextPageSheet = foundry.appv1.sheets.JournalTextPageSheet;
    console.log("✅ Patched JournalTextPageSheet for third-party modules");
  }
});

// ============================================
// OVERRIDE CONSOLE WARNING
// ============================================

Hooks.once("ready", () => {
  console.log("🛡️ Suppressing deprecation warnings from third-party modules");

  // Salva il warning originale
  const originalWarn = console.warn;
  const originalError = console.error;

  // Pattern da sopprimere
  const suppressPatterns = [
    /You are accessing the global.*which is now namespaced/i,
    /Deprecated since Version/i,
    /Backwards-compatible support will be removed/i
  ];

  // Override console.warn
  console.warn = function(...args) {
    const message = args[0]?.toString() || '';
    const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));

    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    } else {
      console.debug("🔇 Suppressed deprecation warning:", message);
    }
  };

  // Override console.error per Error objects
  console.error = function(...args) {
    const message = args[0]?.toString() || '';
    const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));

    if (!shouldSuppress) {
      originalError.apply(console, args);
    } else {
      console.debug("🔇 Suppressed deprecation error:", message);
    }
  };

  console.log("✅ Third-party module fixes active");
});

// ============================================
// DEBUG INFO
// ============================================

window.BrancaloniaThirdPartyFix = {
  checkAPIs: () => {
    console.log("🔍 Checking patched APIs:");
    const apis = [
      'SceneNavigation',
      'Token',
      'ClientSettings',
      'JournalTextPageSheet',
      'Canvas',
      'WallsLayer',
      'ControlsLayer'
    ];

    apis.forEach(api => {
      const exists = !!window[api];
      const isProxy = window[api]?._isProxy;
      console.log(`  ${exists ? '✅' : '❌'} ${api} ${isProxy ? '(proxy)' : '(direct)'}`);
    });
  },

  listThirdPartyModules: () => {
    console.log("📦 Third-party modules that may need patches:");
    game.modules.forEach((mod, id) => {
      if (mod.active && id !== 'brancalonia-bigat') {
        console.log(`  - ${mod.title} (${id})`);
      }
    });
  }
};

console.log("💉 Brancalonia Third-Party Fix loaded - Deprecation warnings should be suppressed");