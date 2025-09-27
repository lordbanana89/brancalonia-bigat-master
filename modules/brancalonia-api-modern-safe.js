/**
 * BRANCALONIA API MODERN SAFE
 * Versione sicura per correggere API deprecate
 * Evita conflitti con proprietà già definite
 */

console.log("🛡️ Brancalonia API Modern Safe - Loading");

// ============================================
// SAFE PROPERTY DEFINITION
// ============================================

function safeDefineProperty(obj, prop, descriptor) {
  try {
    // Controlla se la proprietà esiste già
    const existing = Object.getOwnPropertyDescriptor(obj, prop);

    if (existing) {
      // Se esiste ed è configurabile, prova a ridefinirla
      if (existing.configurable) {
        Object.defineProperty(obj, prop, descriptor);
        console.log(`✅ Redefined ${prop}`);
      } else {
        console.log(`⚠️ ${prop} already exists and is not configurable`);
        // Se non è configurabile ma non ha un getter, prova ad assegnare direttamente
        if (!existing.get && descriptor.get) {
          try {
            obj[prop] = descriptor.get();
            console.log(`✅ Assigned ${prop} directly`);
          } catch (e) {
            console.log(`❌ Cannot modify ${prop}:`, e.message);
          }
        }
      }
    } else {
      // Se non esiste, definiscila
      Object.defineProperty(obj, prop, descriptor);
      console.log(`✅ Defined ${prop}`);
    }
  } catch (error) {
    console.log(`❌ Failed to define ${prop}:`, error.message);
  }
}

// ============================================
// API MODERNE - DEFINIZIONE SICURA
// ============================================

(function() {
  console.log("🔧 Setting up modern API redirects safely");

  // Lista delle API da fixare
  const apiMappings = [
    {
      name: 'ClientSettings',
      getter: () => foundry?.helpers?.ClientSettings
    },
    {
      name: 'SceneNavigation',
      getter: () => foundry?.applications?.ui?.SceneNavigation
    },
    {
      name: 'Token',
      getter: () => foundry?.canvas?.placeables?.Token
    },
    {
      name: 'JournalTextPageSheet',
      getter: () => foundry?.appv1?.sheets?.JournalTextPageSheet
    },
    {
      name: 'Canvas',
      getter: () => foundry?.canvas?.Canvas || canvas?.constructor
    },
    {
      name: 'WallsLayer',
      getter: () => foundry?.canvas?.layers?.WallsLayer
    },
    {
      name: 'ControlsLayer',
      getter: () => foundry?.canvas?.layers?.ControlsLayer
    }
  ];

  // Applica i mapping in modo sicuro
  apiMappings.forEach(({ name, getter }) => {
    // Controlla prima se esiste già
    const exists = name in globalThis;

    if (!exists) {
      // Se non esiste, definiscila in modo sicuro
      safeDefineProperty(globalThis, name, {
        get: getter,
        set(value) {
          console.log(`📝 ${name} set to:`, value);
          this[`_${name}`] = value;
        },
        configurable: true,
        enumerable: false
      });
    } else {
      console.log(`ℹ️ ${name} already exists, skipping`);
    }
  });
})();

// ============================================
// OVERRIDE SICURO DI logCompatibilityWarning
// ============================================

Hooks.once("init", () => {
  console.log("🔇 Attempting safe override of logCompatibilityWarning");

  try {
    // Controlla se possiamo modificare logCompatibilityWarning
    if (foundry?.utils?.logCompatibilityWarning) {
      const descriptor = Object.getOwnPropertyDescriptor(foundry.utils, 'logCompatibilityWarning');

      if (!descriptor || descriptor.configurable !== false) {
        // Salva l'originale
        const original = foundry.utils.logCompatibilityWarning;

        // Crea wrapper
        const wrapper = function(message, options = {}) {
          // Patterns da sopprimere
          const suppressPatterns = [
            /ClientSettings.*namespaced/i,
            /SceneNavigation.*namespaced/i,
            /Token.*namespaced/i,
            /JournalTextPageSheet.*namespaced/i,
            /You are accessing the global/i,
            /Deprecated since Version 13/i
          ];

          const shouldSuppress = suppressPatterns.some(pattern => {
            return pattern.test(message) ||
                   pattern.test(String(options.since)) ||
                   pattern.test(String(options.until));
          });

          if (!shouldSuppress && original) {
            return original.call(this, message, options);
          }
        };

        // Prova a sovrascrivere
        try {
          foundry.utils.logCompatibilityWarning = wrapper;
          console.log("✅ logCompatibilityWarning overridden successfully");
        } catch (e) {
          console.log("⚠️ Cannot override logCompatibilityWarning:", e.message);

          // Fallback: wrap con Proxy
          try {
            foundry.utils = new Proxy(foundry.utils, {
              get(target, prop) {
                if (prop === 'logCompatibilityWarning') {
                  return wrapper;
                }
                return target[prop];
              }
            });
            console.log("✅ logCompatibilityWarning wrapped with Proxy");
          } catch (e2) {
            console.log("❌ Proxy wrap also failed:", e2.message);
          }
        }
      } else {
        console.log("⚠️ logCompatibilityWarning is not configurable");
      }
    }
  } catch (error) {
    console.log("❌ Failed to override logCompatibilityWarning:", error);
  }
});

// ============================================
// CONSOLE OVERRIDE SICURO
// ============================================

(function() {
  console.log("🔇 Setting up console override");

  // Salva originali
  const originalWarn = console.warn;
  const originalError = console.error;

  // Pattern da sopprimere
  const suppressPatterns = [
    /You are accessing the global.*which is now namespaced/i,
    /Deprecated since Version/i,
    /Backwards-compatible support will be removed/i,
    /ClientSettings.*namespaced/i,
    /SceneNavigation.*namespaced/i,
    /Token.*namespaced/i,
    /JournalTextPageSheet.*namespaced/i
  ];

  // Override sicuro di console.warn
  try {
    console.warn = function(...args) {
      const message = String(args[0] || '');

      if (args[0] instanceof Error) {
        const errorMsg = args[0].message || args[0].toString();
        if (suppressPatterns.some(p => p.test(errorMsg))) {
          return;
        }
      }

      if (suppressPatterns.some(p => p.test(message))) {
        return;
      }

      return originalWarn.apply(console, args);
    };
    console.log("✅ console.warn overridden");
  } catch (e) {
    console.log("⚠️ Could not override console.warn");
  }

  // Override sicuro di console.error
  try {
    console.error = function(...args) {
      const message = String(args[0] || '');

      if (args[0] instanceof Error) {
        const errorMsg = args[0].message || args[0].toString();
        if (suppressPatterns.some(p => p.test(errorMsg))) {
          return;
        }
      }

      if (suppressPatterns.some(p => p.test(message))) {
        return;
      }

      return originalError.apply(console, args);
    };
    console.log("✅ console.error overridden");
  } catch (e) {
    console.log("⚠️ Could not override console.error");
  }
})();

// ============================================
// FALLBACK PER MODULI SPECIFICI
// ============================================

Hooks.once("setup", () => {
  console.log("🔧 Final API availability check");

  // Assicurati che le API siano disponibili per i moduli che le useranno
  const apis = [
    { name: 'ClientSettings', path: 'foundry.helpers.ClientSettings' },
    { name: 'SceneNavigation', path: 'foundry.applications.ui.SceneNavigation' },
    { name: 'Token', path: 'foundry.canvas.placeables.Token' },
    { name: 'JournalTextPageSheet', path: 'foundry.appv1.sheets.JournalTextPageSheet' }
  ];

  apis.forEach(({ name, path }) => {
    if (!(name in globalThis)) {
      const parts = path.split('.');
      let api = window;

      for (const part of parts) {
        api = api?.[part];
        if (!api) break;
      }

      if (api) {
        try {
          globalThis[name] = api;
          console.log(`✅ ${name} made available`);
        } catch (e) {
          console.log(`⚠️ Could not set ${name}:`, e.message);
        }
      }
    }
  });
});

// ============================================
// DEBUG INFO
// ============================================

window.BrancaloniaAPISafe = {
  checkAPIs() {
    console.log("🔍 API Status:");
    ['ClientSettings', 'SceneNavigation', 'Token', 'JournalTextPageSheet'].forEach(api => {
      const exists = api in globalThis;
      const value = globalThis[api];
      console.log(`  ${exists ? '✅' : '❌'} ${api}:`, value ? 'Available' : 'Not available');
    });
  },

  testAccess() {
    console.log("🧪 Testing API access:");
    try {
      console.log("  ClientSettings:", ClientSettings ? '✅' : '❌');
      console.log("  SceneNavigation:", SceneNavigation ? '✅' : '❌');
      console.log("  Token:", Token ? '✅' : '❌');
    } catch(e) {
      console.error("  Test failed:", e);
    }
  }
};

console.log("✅ Brancalonia API Modern Safe loaded");