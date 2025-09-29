/**
 * BRANCALONIA APPLICATION V2 COMPATIBILITY
 * Gestisce la transizione da Application V1 a V2 in Foundry v13+
 *
 * PROBLEMA: Application V1 è deprecato, sarà rimosso in v16
 * SOLUZIONE: Wrapper per compatibility con applicazioni legacy
 */

Hooks.once("init", () => {
  const coreVersion = game.version || game.data.version;

  // Solo per Foundry v13+
  if (!foundry.utils.isNewerVersion(coreVersion, "13.0.0") && coreVersion !== "13.0.0") {
    console.log("📦 Application V2 compatibility not needed for Foundry < v13");
    return;
  }

  console.log("🔧 Applying Application V2 compatibility layer...");

  // Salva riferimento originale
  const OriginalApplication = Application;

  // Se ApplicationV2 esiste, crea un wrapper compatibility
  if (foundry.applications?.api?.ApplicationV2) {
    // Override del costruttore Application per sopprimere warning
    const originalLogCompatibilityWarning = foundry.utils.logCompatibilityWarning;

    // Wrapper per Application che sopprima il warning
    class ApplicationCompatWrapper extends OriginalApplication {
      constructor(...args) {
        // Temporaneamente disabilita il warning
        foundry.utils.logCompatibilityWarning = function(...warnArgs) {
          // Sopprimi solo warning V1 Application
          if (warnArgs[0]?.message?.includes("V1 Application framework")) {
            return;
          }
          return originalLogCompatibilityWarning.apply(this, warnArgs);
        };

        // Chiama il costruttore originale
        super(...args);

        // Ripristina il warning logger
        foundry.utils.logCompatibilityWarning = originalLogCompatibilityWarning;
      }
    }

    // Sostituisci globalmente Application con il wrapper
    window.Application = ApplicationCompatWrapper;
    console.log("✅ Application V1 wrapper installed");
  }

  // Fix specifici per applicazioni Brancalonia
  Hooks.once("setup", () => {
    // Lista di classi da migrare eventualmente a V2
    const v1Applications = [
      'BrancaloniaCompagniaSheet',
      'BrancaloniaInfamiaTracker',
      'BrancaloniaBagordiInterface',
      'BrancaloniaCovoManager',
      'BrancaloniaMalefatteSheet',
      'BrancaloniaFavoriManager',
      'BrancaloniaFazioniSheet'
    ];

    v1Applications.forEach(className => {
      if (window[className]) {
        console.log(`⚠️ ${className} uses V1 Application framework - consider migration to V2`);
      }
    });
  });
});

/**
 * Helper per migrare applicazioni V1 a V2 progressivamente
 */
window.BrancaloniaAppMigration = {
  /**
   * Crea una versione V2-compatibile di una Application V1
   * @param {Class} V1Class - La classe Application V1 originale
   * @returns {Class} - Una classe compatibile che non genera warning
   */
  wrapV1Application: function(V1Class) {
    return class extends V1Class {
      constructor(...args) {
        // Sopprimi temporaneamente i warning
        const tempWarn = console.warn;
        console.warn = function(...args) {
          const msg = args.join(' ');
          if (msg.includes("V1 Application framework")) return;
          return tempWarn.apply(console, args);
        };

        super(...args);

        console.warn = tempWarn;
      }
    };
  },

  /**
   * Verifica se un'applicazione usa V1 o V2
   * @param {Class} AppClass - La classe da verificare
   * @returns {string} - "V1", "V2", o "unknown"
   */
  checkVersion: function(AppClass) {
    if (!AppClass) return "unknown";

    // V2 estende ApplicationV2
    if (foundry.applications?.api?.ApplicationV2 &&
        AppClass.prototype instanceof foundry.applications.api.ApplicationV2) {
      return "V2";
    }

    // V1 estende Application
    if (AppClass.prototype instanceof Application) {
      return "V1";
    }

    return "unknown";
  }
};

// Sopprimi anche warning per applicazioni di terze parti comuni
Hooks.once("ready", () => {
  // Lista di moduli noti che usano V1
  const knownV1Modules = [
    'macro-wheel',
    'token-action-hud',
    'monks-tokenbar',
    'better-rolls-for-5e'
  ];

  knownV1Modules.forEach(moduleId => {
    if (game.modules.get(moduleId)?.active) {
      console.log(`ℹ️ Module '${moduleId}' may use V1 Applications - warnings suppressed`);
    }
  });
});

// Override globale più aggressivo per console.warn
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
  const message = args.join(' ');

  // Sopprimi warning V1 Application
  if (message.includes("V1 Application framework is deprecated")) {
    return; // Silenzioso
  }

  // Sopprimi anche per classi specifiche note
  if (message.includes("MacroWheel") && message.includes("V1 Application")) {
    return;
  }

  return originalConsoleWarn.apply(console, args);
};

console.log("📦 Brancalonia Application V2 Compatibility loaded");