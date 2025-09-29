/**
 * Fix per rimuovere proprietà deprecate da CONFIG.DND5E
 * Previene warning quando altri moduli fanno deepClone
 */

console.log("Brancalonia | Deprecation fix caricato");

// Intercetta accesso a proprietà deprecate e le rimuove
Hooks.once("init", () => {
  console.log("Brancalonia | Pulizia proprietà deprecate da CONFIG.DND5E...");

  // Rimuovi proprietà deprecate se esistono
  if (CONFIG.DND5E) {
    // Rimuovi spellPreparationModes se esiste
    if (CONFIG.DND5E.spellPreparationModes) {
      delete CONFIG.DND5E.spellPreparationModes;
      console.log("Brancalonia | Rimosso spellPreparationModes deprecato");
    }

    // Rimuovi polymorphSettings se esiste
    if (CONFIG.DND5E.polymorphSettings) {
      delete CONFIG.DND5E.polymorphSettings;
      console.log("Brancalonia | Rimosso polymorphSettings deprecato");
    }

    // Rimuovi polymorphEffectSettings se esiste
    if (CONFIG.DND5E.polymorphEffectSettings) {
      delete CONFIG.DND5E.polymorphEffectSettings;
      console.log("Brancalonia | Rimosso polymorphEffectSettings deprecato");
    }

    // Rimuovi transformationPresets se esiste
    if (CONFIG.DND5E.transformationPresets) {
      delete CONFIG.DND5E.transformationPresets;
      console.log("Brancalonia | Rimosso transformationPresets deprecato");
    }

    // Rimuovi spellcastingTypes se esiste
    if (CONFIG.DND5E.spellcastingTypes) {
      delete CONFIG.DND5E.spellcastingTypes;
      console.log("Brancalonia | Rimosso spellcastingTypes deprecato");
    }

    // NON rimuovere toolProficiencies perché altri moduli potrebbero usarlo
    // Solo logga se esiste
    if (CONFIG.DND5E.toolProficiencies) {
      console.log("Brancalonia | toolProficiencies presente (mantenuto per compatibilità)");
    }
  }
}, { order: -1000 }); // Esegui molto presto con priorità negativa