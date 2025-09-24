/**
 * Sopprime i warning di deprecazione causati da altri moduli
 * Invece di rimuovere proprietà, intercetta i log
 */

console.log("Brancalonia | Suppress warnings caricato");

// Salva il metodo originale
const originalLogCompatibilityWarning = foundry.utils.logCompatibilityWarning;

// Lista di warning da sopprimere (causati da module.js che fa deepClone)
const suppressedWarnings = [
  'CONFIG.DND5E.spellPreparationModes',
  'CONFIG.DND5E.polymorphSettings',
  'CONFIG.DND5E.polymorphEffectSettings',
  'CONFIG.DND5E.transformationPresets',
  'CONFIG.DND5E.spellcastingTypes'
];

// Override temporaneo durante l'init
Hooks.once("init", () => {
  foundry.utils.logCompatibilityWarning = function(config, message, options = {}) {
    // Controlla se è un warning che vogliamo sopprimere
    for (const suppressedWarning of suppressedWarnings) {
      if (message?.includes(suppressedWarning)) {
        // Controlla lo stack trace per vedere se viene da module.js
        const stack = new Error().stack;
        if (stack?.includes('module.js:69')) {
          console.log(`Brancalonia | Warning soppresso: ${suppressedWarning} (causato da altro modulo)`);
          return; // Non loggare il warning
        }
      }
    }

    // Altrimenti usa il metodo originale
    return originalLogCompatibilityWarning.call(this, config, message, options);
  };

  console.log("Brancalonia | Override warning deprecazione attivo");
});

// Ripristina dopo l'inizializzazione
Hooks.once("ready", () => {
  foundry.utils.logCompatibilityWarning = originalLogCompatibilityWarning;
  console.log("Brancalonia | Override warning deprecazione disattivato");
});