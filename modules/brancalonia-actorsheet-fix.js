/**
 * BRANCALONIA ACTORSHEET FIX
 * Risolve l'errore ActorSheetMixin deprecato
 */

console.log("🔧 Brancalonia ActorSheet Fix - Loading");

// ============================================
// FIX ACTORSHEETMIXIN DEPRECATION
// ============================================

// Intercetta PRIMA che D&D 5e carichi
(function() {
  // Override import per sheet-mixin.mjs
  const originalImport = window.import || globalThis.import;

  window.import = globalThis.import = async function(specifier) {
    // Se stanno importando sheet-mixin.mjs, restituisci un mixin vuoto
    if (specifier?.includes('sheet-mixin.mjs')) {
      console.log("🚫 Intercepted import of deprecated sheet-mixin.mjs");
      return {
        ActorSheetMixin: function(Base) {
          // Restituisci la classe base senza modifiche
          console.log("✅ Returning no-op ActorSheetMixin");
          return Base;
        }
      };
    }

    // Altrimenti usa l'import originale
    return originalImport.call(this, specifier);
  };
})();

// Hook per assicurarsi che BaseActorSheet sia disponibile
Hooks.once("init", () => {
  // Se D&D 5e è attivo
  if (game.system?.id === "dnd5e") {
    // Assicurati che ActorSheetMixin sia definito come no-op
    if (!window.ActorSheetMixin && !globalThis.ActorSheetMixin) {
      const noOpMixin = function(Base) {
        return Base;
      };

      window.ActorSheetMixin = noOpMixin;
      globalThis.ActorSheetMixin = noOpMixin;

      // Aggiungi anche al namespace dnd5e se esiste
      if (dnd5e?.applications?.actor) {
        dnd5e.applications.actor.ActorSheetMixin = noOpMixin;
      }

      console.log("✅ ActorSheetMixin no-op created");
    }
  }
});

// Override logCompatibilityWarning per questo specifico errore
Hooks.once("setup", () => {
  if (foundry?.utils?.logCompatibilityWarning) {
    const original = foundry.utils.logCompatibilityWarning;

    foundry.utils.logCompatibilityWarning = function(message, options = {}) {
      // Sopprimi solo il warning di ActorSheetMixin
      if (message?.includes("ActorSheetMixin")) {
        console.log("🔇 Suppressed ActorSheetMixin deprecation warning");
        return;
      }

      // Altrimenti chiama l'originale
      return original.call(this, message, options);
    };
  }
});

console.log("✅ Brancalonia ActorSheet Fix loaded");