/**
 * Fix per evitare conflitti con moduli che fanno deepClone di CONFIG
 * Carica le configurazioni DOPO che tutti gli altri moduli sono stati inizializzati
 */

// Usa "ready" per essere sicuri che tutti gli altri moduli siano caricati
Hooks.once("ready", () => {
  console.log("Brancalonia | Applicazione configurazioni CONFIG dopo caricamento altri moduli...");

  // Solo se non già applicato
  if (!CONFIG.BRANCALONIA?.configApplied) {

    // Configurazione valute di Brancalonia
    if (CONFIG.DND5E?.currencies) {
      foundry.utils.mergeObject(CONFIG.DND5E.currencies, {
        du: {
          label: "BRANCALONIA.Currency.Ducati",
          abbreviation: "du",
          conversion: { into: null, each: 1 }
        },
        sc: {
          label: "BRANCALONIA.Currency.Scudi",
          abbreviation: "sc",
          conversion: { into: "du", each: 10 }
        },
        ta: {
          label: "BRANCALONIA.Currency.Talleri",
          abbreviation: "ta",
          conversion: { into: "sc", each: 10 }
        },
        de: {
          label: "BRANCALONIA.Currency.Denari",
          abbreviation: "de",
          conversion: { into: "du", each: 0.1 }
        }
      });
    }

    // Abilità custom
    if (CONFIG.DND5E?.skills) {
      foundry.utils.mergeObject(CONFIG.DND5E.skills, {
        streetwise: {
          label: "BRANCALONIA.Skills.Streetwise",
          ability: "wis",
          fullKey: "streetwise",
          icon: "systems/dnd5e/icons/skills/shadow_17.jpg"
        },
        gambling: {
          label: "BRANCALONIA.Skills.Gambling",
          ability: "cha",
          fullKey: "gambling",
          icon: "systems/dnd5e/icons/skills/ice_17.jpg"
        }
      });
    }

    // Condizioni custom
    if (CONFIG.DND5E?.conditionTypes) {
      foundry.utils.mergeObject(CONFIG.DND5E.conditionTypes, {
        menagramo: {
          name: "BRANCALONIA.Conditions.Menagramo",
          icon: "icons/magic/death/skull-evil-grin-red.webp",
          reference: "Compendium.brancalonia-bigat.regole.JournalEntry.menagramo",
          statuses: ["menagramo"]
        },
        ubriaco: {
          name: "BRANCALONIA.Conditions.Drunk",
          icon: "icons/consumables/drinks/wine-bottle-table-brown.webp",
          reference: "Compendium.brancalonia-bigat.regole.JournalEntry.ubriachezza",
          statuses: ["drunk"]
        }
      });
    }

    // Tools
    if (CONFIG.DND5E?.tools) {
      foundry.utils.mergeObject(CONFIG.DND5E.tools, {
        cardsGambling: {
          label: "BRANCALONIA.Tools.Cards",
          ability: "int"
        },
        diceGambling: {
          label: "BRANCALONIA.Tools.Dice",
          ability: "wis"
        }
      });
    }

    // Damage types
    if (CONFIG.DND5E?.damageTypes) {
      foundry.utils.mergeObject(CONFIG.DND5E.damageTypes, {
        nonlethal: {
          label: "BRANCALONIA.DamageTypes.NonLethal",
          icon: "icons/skills/melee/unarmed-punch-fist.webp",
          reference: ""
        }
      });
    }

    // Marca come applicato
    if (!CONFIG.BRANCALONIA) CONFIG.BRANCALONIA = {};
    CONFIG.BRANCALONIA.configApplied = true;

    console.log("Brancalonia | CONFIG applicato con successo dopo caricamento moduli");
  }
});