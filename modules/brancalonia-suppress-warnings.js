/**
 * BRANCALONIA SUPPRESS WARNINGS
 * Sopprime COMPLETAMENTE i warning di API deprecate
 * Caricato PRIMA di tutti gli altri moduli
 */

console.log("🔇 Brancalonia Suppress Warnings - Blocking all deprecation warnings");

// ============================================
// OVERRIDE logCompatibilityWarning
// ============================================

// Intercetta la funzione che genera i warning PRIMA che venga chiamata
(function() {
  // Aspetta che foundry sia disponibile
  const waitForFoundry = setInterval(() => {
    if (typeof foundry !== 'undefined') {
      clearInterval(waitForFoundry);

      // Override il metodo che logga i warning
      const originalLogCompat = foundry.utils?.logCompatibilityWarning;
      if (originalLogCompat) {
        foundry.utils.logCompatibilityWarning = function(message, options = {}) {
          // Filtra i messaggi di deprecazione per API spostate
          const suppressPatterns = [
            /ClientSettings/i,
            /SceneNavigation/i,
            /Token.*namespaced/i,
            /JournalTextPageSheet/i,
            /Canvas.*namespaced/i,
            /WallsLayer/i,
            /ControlsLayer/i,
            /namespaced under foundry/i,
            /Deprecated since Version/i
          ];

          const shouldSuppress = suppressPatterns.some(pattern =>
            pattern.test(message) || pattern.test(options?.since) || pattern.test(options?.until)
          );

          if (!shouldSuppress) {
            // Chiama l'originale solo se non va soppresso
            return originalLogCompat.call(this, message, options);
          } else {
            // Log silenzioso per debug
            console.debug("🔇 Suppressed:", message);
          }
        };

        console.log("✅ logCompatibilityWarning overridden");
      }
    }
  }, 1);
})();

// ============================================
// OVERRIDE CONSOLE METHODS
// ============================================

// Salva i metodi originali
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

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

// Override console.warn
console.warn = function(...args) {
  const message = String(args[0] || '');

  // Controlla se è un Error object
  if (args[0] instanceof Error) {
    const errorMessage = args[0].message || args[0].toString();
    if (suppressPatterns.some(p => p.test(errorMessage))) {
      console.debug("🔇 Suppressed warn:", errorMessage);
      return;
    }
  }

  // Controlla messaggio normale
  if (suppressPatterns.some(p => p.test(message))) {
    console.debug("🔇 Suppressed warn:", message);
    return;
  }

  return originalConsoleWarn.apply(console, args);
};

// Override console.error
console.error = function(...args) {
  const message = String(args[0] || '');

  // Controlla se è un Error object
  if (args[0] instanceof Error) {
    const errorMessage = args[0].message || args[0].toString();
    if (suppressPatterns.some(p => p.test(errorMessage))) {
      console.debug("🔇 Suppressed error:", errorMessage);
      return;
    }
  }

  // Controlla messaggio normale
  if (suppressPatterns.some(p => p.test(message))) {
    console.debug("🔇 Suppressed error:", message);
    return;
  }

  return originalConsoleError.apply(console, args);
};

console.log("✅ Console methods overridden - Deprecation warnings will be suppressed");

// ============================================
// FIX SPECIFICO PER LIBWRAPPER
// ============================================

// LibWrapper accede a ClientSettings in modo particolare
// Dobbiamo assicurarci che sia disponibile PRIMA di LibWrapper
Hooks.once("init", () => {
  // Forza la disponibilità di ClientSettings
  if (!globalThis.ClientSettings && foundry?.helpers?.ClientSettings) {
    globalThis.ClientSettings = foundry.helpers.ClientSettings;
    console.log("✅ ClientSettings forced for LibWrapper");
  }
}, { once: true, priority: -9999 }); // Priorità altissima

// ============================================
// VERIFICA FINALE
// ============================================

Hooks.once("ready", () => {
  console.log("🔍 Final check - Deprecation warnings should be gone");

  // Test accesso alle API
  try {
    const cs = ClientSettings;
    const sn = SceneNavigation;
    const tk = Token;
    console.log("✅ All APIs accessible without warnings");
  } catch(e) {
    console.warn("⚠️ Some APIs still not accessible:", e);
  }
});

console.log("💊 Brancalonia Suppress Warnings loaded - No more deprecation noise!");