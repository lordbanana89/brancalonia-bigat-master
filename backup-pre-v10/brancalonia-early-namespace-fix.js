/**
 * BRANCALONIA EARLY NAMESPACE FIX
 * Applica fix namespace PRIMA che altri moduli li accedano
 * Questo modulo deve essere caricato PER PRIMO
 */

// Esegui IMMEDIATAMENTE al caricamento del modulo
(function() {
  console.log("🚀 Brancalonia Early Namespace Fix - Executing immediately");

  // Lista di namespace critici che devono essere fixati SUBITO
  const criticalNamespaces = {
    'ControlsLayer': ['foundry', 'canvas', 'layers', 'ControlsLayer'],
    'SceneNavigation': ['foundry', 'applications', 'ui', 'SceneNavigation'],
    'Token': ['foundry', 'canvas', 'placeables', 'Token'],
    'ClientSettings': ['foundry', 'helpers', 'ClientSettings'],
    'SceneDirectory': ['foundry', 'applications', 'sidebar', 'tabs', 'SceneDirectory'],
    'KeyboardManager': ['foundry', 'helpers', 'interaction', 'KeyboardManager'],
    'DocumentSheetConfig': ['foundry', 'applications', 'apps', 'DocumentSheetConfig']
  };

  // Funzione per navigare un path nell'oggetto
  function getNestedProperty(obj, path) {
    try {
      let current = obj;
      for (const prop of path) {
        if (current && typeof current === 'object' && prop in current) {
          current = current[prop];
        } else {
          return null;
        }
      }
      return current;
    } catch (e) {
      return null;
    }
  }

  // Applica fix per ogni namespace critico
  let fixedCount = 0;
  for (const [oldName, path] of Object.entries(criticalNamespaces)) {
    // Controlla se già esiste
    if (window.hasOwnProperty(oldName)) {
      continue;
    }

    // Prova a trovare nel nuovo path
    const target = getNestedProperty(window, path);

    if (target) {
      // Crea alias con getter lazy
      Object.defineProperty(window, oldName, {
        get() {
          // Risolvi dinamicamente in caso cambi
          return getNestedProperty(window, path) || target;
        },
        set(value) {
          // Permetti override se necessario
          const parent = getNestedProperty(window, path.slice(0, -1));
          if (parent) {
            parent[path[path.length - 1]] = value;
          }
        },
        enumerable: true,
        configurable: true
      });
      fixedCount++;
      console.log(`  ✅ Early fix: ${oldName}`);
    }
  }

  if (fixedCount > 0) {
    console.log(`🎯 Early namespace fixes applied: ${fixedCount} aliases created`);
  }

  // Backup: applica anche quando foundry è pronto
  if (typeof Hooks !== 'undefined') {
    // Hook molto precoce
    Hooks.once("init", function earlyNamespaceFixInit() {
      console.log("🔄 Re-checking namespace fixes at init");

      // Riapplica per namespace che potrebbero non essere stati disponibili
      for (const [oldName, path] of Object.entries(criticalNamespaces)) {
        if (!window.hasOwnProperty(oldName)) {
          const target = getNestedProperty(window, path);
          if (target) {
            window[oldName] = target;
            console.log(`  ✅ Init fix: ${oldName}`);
          }
        }
      }
    });
  }

  // Override console.warn IMMEDIATAMENTE per catturare warning precoci
  const originalWarn = console.warn;
  console.warn = function(...args) {
    const message = args.join(' ');

    // Sopprimi warning per namespace che stiamo fixando
    if (message.includes("You are accessing the global") &&
        (message.includes("ControlsLayer") ||
         message.includes("SceneNavigation") ||
         message.includes("Token") ||
         message.includes("ClientSettings") ||
         message.includes("SceneDirectory") ||
         message.includes("KeyboardManager") ||
         message.includes("DocumentSheetConfig"))) {
      // Silenzioso
      return;
    }

    return originalWarn.apply(console, args);
  };

  // Ripristina console.warn dopo un po'
  setTimeout(() => {
    console.warn = originalWarn;
    console.log("🔄 Console.warn restored by early fix");
  }, 5000);

})();

console.log("📦 Brancalonia Early Namespace Fix loaded");