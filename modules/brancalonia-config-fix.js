/**
 * Fix per evitare conflitti con moduli che fanno deepClone di CONFIG
 * Carica le configurazioni DOPO che tutti gli altri moduli sono stati inizializzati
 */

console.log("Brancalonia | CONFIG-FIX file caricato");

// Proviamo più hook per trovare il momento giusto
Hooks.once("setup", () => {
  console.log("Brancalonia | Hook setup attivato");
});

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
          img: "systems/dnd5e/icons/skills/shadow_17.jpg"
        },
        gambling: {
          label: "BRANCALONIA.Skills.Gambling",
          ability: "cha",
          fullKey: "gambling",
          img: "systems/dnd5e/icons/skills/ice_17.jpg"
        }
      });
    }

    // Condizioni custom
    if (CONFIG.DND5E?.conditionTypes) {
      foundry.utils.mergeObject(CONFIG.DND5E.conditionTypes, {
        menagramo: {
          label: "Menagramo",
          img: "modules/brancalonia-bigat/assets/icons/menagramo.svg",
          reference: "Compendium.brancalonia-bigat.regole.JournalEntry.menagramo",
          statuses: ["menagramo"]
        },
        ubriaco: {
          label: "Ubriaco",
          img: "modules/brancalonia-bigat/assets/icons/ubriaco.svg",
          reference: "Compendium.brancalonia-bigat.regole.JournalEntry.ubriachezza",
          statuses: ["ubriaco"]
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
          img: "icons/skills/melee/unarmed-punch-fist.webp",
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