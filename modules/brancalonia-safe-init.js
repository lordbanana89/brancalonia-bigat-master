/**
 * BRANCALONIA SAFE INIT
 * Wrapper sicuro per tutti gli hook init per prevenire errori
 *
 * PROBLEMA: Errori negli hook init possono bloccare l'inizializzazione
 * SOLUZIONE: Try-catch wrapper per ogni modulo
 */

// Lista dei moduli da inizializzare in modo sicuro
const BRANCALONIA_MODULES = [
  'brancalonia-actorsheet-mixin-fix',
  'brancalonia-namespace-fix',
  'brancalonia-appv2-compatibility',
  'brancalonia-compatibility-fix',
  'brancalonia-v13-compatibility'
];

// Wrapper per console.warn per debug
const originalWarn = console.warn;
const originalError = console.error;

// Flag per prevenire loop infiniti
let isProcessingWarning = false;

// Override temporaneo per catturare errori silenziosi
console.warn = function(...args) {
  // Previeni loop infiniti
  if (isProcessingWarning) {
    return originalWarn.apply(console, args);
  }

  const message = args.join(' ');

  // Se è un errore in un hook, logga dettagli (ma previeni loop)
  if (message.includes("Error thrown in hooked function") && !message.includes("brancalonia-safe-init")) {
    isProcessingWarning = true;

    try {
      // Usa originalError per evitare ricorsione
      originalError.call(console, "🔴 Brancalonia Hook Error Detected:", message);

      // Prova a identificare il modulo problematico
      const stackLines = new Error().stack.split('\n');
      const brancaloniaModule = stackLines.find(line =>
        line.includes('brancalonia-') &&
        line.includes('.js') &&
        !line.includes('brancalonia-safe-init.js')
      );
      if (brancaloniaModule) {
        originalError.call(console, "🔍 Problematic module:", brancaloniaModule);
      }
    } catch (e) {
      // Ignora errori nel debug stesso
    } finally {
      isProcessingWarning = false;
    }
  }

  return originalWarn.apply(console, args);
};

// Funzione helper per wrappare hooks in try-catch
function safeHook(hookName, fn, context = "Unknown") {
  return function(...args) {
    try {
      return fn.apply(this, args);
    } catch (error) {
      console.error(`🔴 Brancalonia Safe Init - Error in ${context}:`, error);
      console.error("Hook:", hookName);
      console.error("Stack:", error.stack);

      // Non ri-lanciare l'errore per non bloccare l'inizializzazione
      // Ma logga per debug
      if (game.debug) {
        ui.notifications?.error(`Brancalonia: Error in ${context} - Check console`, {permanent: false});
      }
    }
  };
}

// Hook init principale con error handling
Hooks.once("init", safeHook("init", function() {
  console.log("🛡️ Brancalonia Safe Init starting...");

  // Verifica dipendenze base
  if (!game.system?.id) {
    console.warn("⚠️ Game system not ready, deferring initialization");
    return;
  }

  // Verifica che siamo in D&D 5e
  if (game.system.id !== "dnd5e") {
    console.log("ℹ️ Brancalonia is for D&D 5e system only, current:", game.system.id);
    return;
  }

  console.log("✅ Brancalonia Safe Init completed");
}, "Safe Init Main"));

// Hook per verificare errori post-init
Hooks.once("setup", () => {
  // Controlla se ci sono stati errori durante init
  const errors = window.BRANCALONIA_INIT_ERRORS || [];

  if (errors.length > 0) {
    console.error("🔴 Brancalonia initialization had errors:", errors);

    // Notifica all'utente se GM
    if (game.user?.isGM) {
      ui.notifications.warn(
        `Brancalonia: ${errors.length} initialization errors detected. Check console for details.`,
        {permanent: false, console: false}
      );
    }
  } else {
    console.log("✅ Brancalonia initialized without errors");
  }
});

// Array globale per tracciare errori
window.BRANCALONIA_INIT_ERRORS = window.BRANCALONIA_INIT_ERRORS || [];

// Funzione per registrare errori
window.registerBrancaloniaError = function(module, error) {
  window.BRANCALONIA_INIT_ERRORS.push({
    module: module,
    error: error.message || error,
    stack: error.stack,
    time: new Date().toISOString()
  });
};

// Wrapper per moduli problematici noti
Hooks.once("init", safeHook("init", function() {
  // Fix specifico per ActorSheetMixin se necessario
  try {
    if (typeof window.ActorSheetMixin === 'undefined' &&
        game.system?.id === "dnd5e" &&
        foundry.utils.isNewerVersion(game.system.version, "5.0.0")) {
      window.ActorSheetMixin = function(Base) { return Base; };
      console.log("✅ Emergency ActorSheetMixin fix applied");
    }
  } catch (e) {
    registerBrancaloniaError('actorsheet-emergency-fix', e);
  }

  // Fix per namespace se necessario
  try {
    const criticalNamespaces = ['SceneNavigation', 'Token', 'ClientSettings'];
    criticalNamespaces.forEach(name => {
      if (!window[name]) {
        // Prova a trovare nel nuovo namespace
        let found = false;
        const paths = [
          `foundry.applications.ui.${name}`,
          `foundry.canvas.placeables.${name}`,
          `foundry.helpers.${name}`
        ];

        for (const path of paths) {
          try {
            const parts = path.split('.');
            let obj = window;
            for (const part of parts) {
              obj = obj[part];
              if (!obj) break;
            }
            if (obj) {
              window[name] = obj;
              found = true;
              console.log(`✅ Emergency fix: ${name} → ${path}`);
              break;
            }
          } catch (e) {
            // Continua con il prossimo path
          }
        }

        if (!found && game.debug) {
          console.warn(`⚠️ Could not fix namespace: ${name}`);
        }
      }
    });
  } catch (e) {
    registerBrancaloniaError('namespace-emergency-fix', e);
  }

}, "Emergency Fixes"));

// Ripristina console originale dopo init
Hooks.once("ready", () => {
  console.warn = originalWarn;
  console.error = originalError;
  console.log("🛡️ Brancalonia Safe Init - Console restored");
});

console.log("🛡️ Brancalonia Safe Init loaded");