/**
 * Versione semplificata per sopprimere warning
 * Non modifica proprietà read-only
 */

console.log("Brancalonia | Sistema di soppressione warning semplificato attivo");

// Invece di modificare la funzione, intercettiamo solo i console.warn
const originalWarn = console.warn;

// Override temporaneo di console.warn
console.warn = function(...args) {
  // Controlla se è un warning di deprecazione che vogliamo sopprimere
  const message = args.join(' ');

  const suppressedWarnings = [
    'CONFIG.DND5E.spellPreparationModes',
    'CONFIG.DND5E.polymorphSettings',
    'CONFIG.DND5E.polymorphEffectSettings',
    'CONFIG.DND5E.transformationPresets',
    'CONFIG.DND5E.spellcastingTypes',
    'The `label` property of status conditions',
    // Custom D&D 5e settings mancanti
    'custom-dnd5e.rolls',
    'custom-dnd5e.enable-encumbrance',
    'custom-dnd5e.enable-senses',
    'custom-dnd5e.enable-concentration',
    'custom-dnd5e.enable-exhaustion',
    'is not a registered game setting'
  ];

  for (const suppressedWarning of suppressedWarnings) {
    if (message.includes(suppressedWarning)) {
      // Non mostrare questo warning
      return;
    }
  }

  // Altrimenti mostra il warning normalmente
  return originalWarn.apply(console, args);
};

// Ripristina dopo che il sistema è pronto
Hooks.once("ready", () => {
  // Ripristina console.warn dopo un breve delay
  setTimeout(() => {
    console.warn = originalWarn;
    console.log("Brancalonia | Sistema di soppressione warning disattivato");
  }, 5000);
});