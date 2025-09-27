/**
 * BRANCALONIA SUPPRESS APPLICATION V1 WARNING
 * Sopprimi immediatamente i warning di Application V1 deprecata
 * DEVE essere caricato MOLTO presto
 */

// Esegui IMMEDIATAMENTE al caricamento
(function() {
  console.log("🔇 Suppressing Application V1 deprecation warnings");

  // Intercetta logCompatibilityWarning SUBITO
  if (typeof foundry !== 'undefined') {
    // Aspetta che foundry.utils esista
    const checkAndPatch = () => {
      if (foundry?.utils?.logCompatibilityWarning) {
        const original = foundry.utils.logCompatibilityWarning;

        foundry.utils.logCompatibilityWarning = function(...args) {
          const message = args.join(' ');

          // Sopprimi warning Application V1
          if (message.includes("V1 Application framework") ||
              message.includes("ApplicationV2") ||
              message.includes("will be removed in Version 16") ||
              message.includes("Deprecated since Version 13")) {
            return; // Silenzioso
          }

          return original.apply(this, args);
        };

        console.log("✅ logCompatibilityWarning patched early");
        return true;
      }
      return false;
    };

    // Prova subito
    if (!checkAndPatch()) {
      // Se non disponibile, riprova con intervallo
      const interval = setInterval(() => {
        if (checkAndPatch()) {
          clearInterval(interval);
        }
      }, 10);

      // Stop dopo 5 secondi
      setTimeout(() => clearInterval(interval), 5000);
    }
  }

  // Patch anche il costruttore Application se possibile
  const patchApplicationConstructor = () => {
    if (typeof Application !== 'undefined') {
      const OriginalApplication = Application;

      // Crea wrapper che sopprimi il warning
      window.Application = class Application extends OriginalApplication {
        constructor(...args) {
          // Temporaneamente sopprimi warning durante costruzione
          const tempLogCompat = foundry?.utils?.logCompatibilityWarning;
          if (tempLogCompat) {
            foundry.utils.logCompatibilityWarning = () => {};
          }

          try {
            super(...args);
          } finally {
            // Ripristina
            if (tempLogCompat) {
              foundry.utils.logCompatibilityWarning = tempLogCompat;
            }
          }
        }
      };

      // Copia proprietà statiche
      Object.setPrototypeOf(window.Application, OriginalApplication);
      for (const prop of Object.getOwnPropertyNames(OriginalApplication)) {
        if (!(prop in window.Application)) {
          const descriptor = Object.getOwnPropertyDescriptor(OriginalApplication, prop);
          Object.defineProperty(window.Application, prop, descriptor);
        }
      }

      console.log("✅ Application constructor wrapped");
      return true;
    }
    return false;
  };

  // Prova a patchare Application
  if (!patchApplicationConstructor()) {
    // Riprova quando disponibile
    const checkApp = setInterval(() => {
      if (patchApplicationConstructor()) {
        clearInterval(checkApp);
      }
    }, 50);

    setTimeout(() => clearInterval(checkApp), 5000);
  }

})();

// Backup: Hook molto precoce
if (typeof Hooks !== 'undefined') {
  // Prima di init
  Hooks.once("init", function suppressV1Warning() {
    // Re-patch se necessario
    if (foundry?.utils?.logCompatibilityWarning &&
        !foundry.utils.logCompatibilityWarning._patched) {
      const original = foundry.utils.logCompatibilityWarning;

      foundry.utils.logCompatibilityWarning = function(...args) {
        const message = args.join(' ');

        if (message.includes("V1 Application") ||
            message.includes("ApplicationV2")) {
          return;
        }

        return original.apply(this, args);
      };

      foundry.utils.logCompatibilityWarning._patched = true;
    }
  }, { once: true });
}

console.log("📦 Application V1 Warning Suppressor loaded");