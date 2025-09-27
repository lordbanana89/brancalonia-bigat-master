/**
 * BRANCALONIA ACTORSHEET MIXIN FIX
 * Risolve il problema specifico di ActorSheetMixin deprecato in D&D 5e v5.0+
 *
 * PROBLEMA: D&D 5e v5.0+ ha integrato ActorSheetMixin in BaseActorSheet
 * ma alcuni moduli o parti del sistema ancora lo richiedono
 *
 * SOLUZIONE: Intercetta e previene l'errore fornendo un mixin vuoto
 */

// Applica il fix MOLTO presto, prima che D&D 5e lo chiami
Hooks.once("init", () => {
  const dnd5eVersion = game.system?.version || "0.0.0";

  console.log(`🛠️ Brancalonia ActorSheetMixin Fix: D&D 5e ${dnd5eVersion} detected`);

  // Solo per D&D 5e v5.0+
  if (!game.system?.id === "dnd5e") return;
  if (!foundry.utils.isNewerVersion(dnd5eVersion, "5.0.0") && dnd5eVersion !== "5.0.0") return;

  console.log("🔧 Applying ActorSheetMixin compatibility patch...");

  // Metodo 1: Se il mixin non esiste ancora, crealo come no-op
  try {
    if (typeof window.ActorSheetMixin === 'undefined') {
      Object.defineProperty(window, 'ActorSheetMixin', {
        value: function(Base) {
          // Ritorna la classe base senza modifiche
          // perché il functionality è già in BaseActorSheet
          return Base;
        },
        writable: true,
        enumerable: false,
        configurable: true
      });
      console.log("✅ Created no-op ActorSheetMixin");
    }
  } catch (e) {
    console.warn("⚠️ Could not create ActorSheetMixin:", e.message);
  }

  // Metodo 2: Override del namespace dnd5e se accessibile
  try {
    if (window.dnd5e?.applications?.actor) {
      const originalActorSheetMixin = window.dnd5e.applications.actor.ActorSheetMixin;
      if (originalActorSheetMixin) {
        // Usa defineProperty per evitare problemi con proprietà read-only
        Object.defineProperty(window.dnd5e.applications.actor, 'ActorSheetMixin', {
          value: function(Base) {
            // Chiama l'originale ma sopprimi il warning
            const originalLogCompatibilityWarning = foundry.utils.logCompatibilityWarning;
            foundry.utils.logCompatibilityWarning = () => {};

            let result;
            try {
              result = originalActorSheetMixin(Base);
            } catch (e) {
              console.warn("ActorSheetMixin failed, using Base directly:", e);
              result = Base;
            }

            foundry.utils.logCompatibilityWarning = originalLogCompatibilityWarning;
            return result || Base;
          },
          writable: true,
          enumerable: true,
          configurable: true
        });
        console.log("✅ Wrapped dnd5e.applications.actor.ActorSheetMixin");
      }
    }
  } catch (e) {
    console.warn("⚠️ Could not wrap dnd5e ActorSheetMixin:", e.message);
  }

  // Metodo 3: Intercetta l'errore a livello di logCompatibilityWarning
  const originalLogCompatibilityWarning = foundry.utils.logCompatibilityWarning;
  foundry.utils.logCompatibilityWarning = function(...args) {
    // Se è il warning di ActorSheetMixin, ignoralo silenziosamente
    if (args[0]?.message?.includes("ActorSheetMixin")) {
      return; // Sopprimi questo specifico warning
    }
    // Altrimenti chiama l'originale
    return originalLogCompatibilityWarning.apply(this, args);
  };

  console.log("✅ ActorSheetMixin fix applied");
});

// Hook alternativo più tardi nel ciclo di vita
Hooks.once("setup", () => {
  // Controlla se BaseActorSheet esiste nel sistema
  if (game.system.id === "dnd5e") {
    const BaseActorSheet = CONFIG.Actor?.sheetClasses?.character?.["dnd5e.ActorSheet5eCharacter"]?.cls;

    if (BaseActorSheet && !BaseActorSheet._mixinApplied) {
      // Marca che il mixin è già applicato (tramite integrazione in BaseActorSheet)
      BaseActorSheet._mixinApplied = true;
      console.log("✅ Marked BaseActorSheet as mixin-ready");
    }
  }
});

// Fix definitivo: intercetta l'import del modulo problematico
if (window.importShim) {
  const originalImportShim = window.importShim;
  window.importShim = async function(path, ...args) {
    // Se sta importando sheet-mixin.mjs, intercetta
    if (path?.includes("sheet-mixin.mjs")) {
      console.log("🔧 Intercepting sheet-mixin.mjs import");

      // Importa normalmente ma poi patcha il risultato
      const module = await originalImportShim.call(this, path, ...args);

      if (module.ActorSheetMixin) {
        const original = module.ActorSheetMixin;
        module.ActorSheetMixin = function(Base) {
          // Sopprimi il warning chiamando senza logging
          const tempWarn = console.warn;
          const tempError = console.error;
          console.warn = () => {};
          console.error = () => {};

          let result;
          try {
            result = original(Base);
          } catch (e) {
            result = Base;
          }

          console.warn = tempWarn;
          console.error = tempError;

          return result || Base;
        };
      }

      return module;
    }

    return originalImportShim.call(this, path, ...args);
  };
}

console.log("📦 Brancalonia ActorSheetMixin Fix loaded");