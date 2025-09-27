/**
 * Brancalonia - Foundry v13 Compatibility Layer
 * Gestisce la compatibilità con le nuove API di Foundry v13
 */

console.log("Brancalonia | v13 Compatibility Layer attivo");

// Polyfill per mantenere compatibilità con codice legacy
Hooks.once("init", () => {
    // Crea alias per le vecchie API deprecate
    if (!game.actors && game.collections?.get("Actor")) {
        Object.defineProperty(game, "actors", {
            get() {
                return game.collections.get("Actor");
            },
            configurable: true
        });
    }

    if (!game.items && game.collections?.get("Item")) {
        Object.defineProperty(game, "items", {
            get() {
                return game.collections.get("Item");
            },
            configurable: true
        });
    }

    if (!game.journal && game.collections?.get("JournalEntry")) {
        Object.defineProperty(game, "journal", {
            get() {
                return game.collections.get("JournalEntry");
            },
            configurable: true
        });
    }

    if (!game.scenes && game.collections?.get("Scene")) {
        Object.defineProperty(game, "scenes", {
            get() {
                return game.collections.get("Scene");
            },
            configurable: true
        });
    }

    if (!game.macros && game.collections?.get("Macro")) {
        Object.defineProperty(game, "macros", {
            get() {
                return game.collections.get("Macro");
            },
            configurable: true
        });
    }

    if (!game.tables && game.collections?.get("RollTable")) {
        Object.defineProperty(game, "tables", {
            get() {
                return game.collections.get("RollTable");
            },
            configurable: true
        });
    }

    // Alias per TextEditor
    if (!window.TextEditor && foundry.applications.ux?.TextEditor?.implementation) {
        window.TextEditor = foundry.applications.ux.TextEditor.implementation;
    }

    console.log("Brancalonia | Alias API legacy creati");
});

// Sopprimi warning di deprecazione specifici
const originalWarn = console.warn;
console.warn = function(...args) {
    const message = args.join(' ');

    // Sopprimi warning di namespace deprecati
    if (message.includes("You are accessing the global") &&
        (message.includes("CompendiumCollection") ||
         message.includes("TextEditor") ||
         message.includes("game.actors") ||
         message.includes("game.items") ||
         message.includes("game.journal") ||
         message.includes("game.scenes"))) {
        return; // Non mostrare questi warning
    }

    return originalWarn.apply(console, args);
};

console.log("Brancalonia | v13 Compatibility Layer completato");