/**
 * Meccaniche di Gioco Aggiuntive per Brancalonia
 * Completamente compatibile con dnd5e system per Foundry VTT v13
 */

export class BrancaloniaMechanics {
  constructor() {
    // Meccaniche aggiuntive dal censimento
    this.setupAdditionalMechanics();
  }

  setupAdditionalMechanics() {
    // Tabelle casuali per il menagramo e altri eventi
    this.setupRandomTables();

    // Sistema di Botte (danno non letale esteso)
    this.setupNonLethalCombat();

    // Sistema Trabocchetti
    this.setupTraps();

    // Sistema Padrini/Mentori
    this.setupPatronSystem();

    // Oggetti magici specifici di Brancalonia
    this.setupBrancaloniaItems();

    // Regole opzionali
    this.setupOptionalRules();
  }

  /**
   * Setup tabelle casuali conformi a dnd5e
   */
  setupRandomTables() {
    // Registra tabelle nel CONFIG - Usa mergeObject per evitare problemi
    if (!CONFIG.BRANCALONIA) CONFIG.BRANCALONIA = {};
    if (!CONFIG.BRANCALONIA.tables) CONFIG.BRANCALONIA.tables = {};

    foundry.utils.mergeObject(CONFIG.BRANCALONIA.tables, {
      // Tabella Complicazioni Generiche
      complications: {
        name: "Complicazioni di Brancalonia",
        formula: "1d20",
        results: [
          { range: [1, 2], text: "Le guardie sono state allertate" },
          { range: [3, 4], text: "Un rivale interferisce" },
          { range: [5, 6], text: "Il tempo peggiora drasticamente" },
          { range: [7, 8], text: "Un alleato tradisce" },
          { range: [9, 10], text: "Risorse esaurite" },
          { range: [11, 12], text: "Malattia o veleno" },
          { range: [13, 14], text: "Informazioni sbagliate" },
          { range: [15, 16], text: "Trappola inaspettata" },
          { range: [17, 18], text: "Testimone scomodo" },
          { range: [19, 20], text: "Intervento divino (negativo)" }
        ]
      },

      // Tabella Bottino Scadente
      shoddyLoot: {
        name: "Bottino Scadente",
        formula: "1d12",
        results: [
          { range: [1], text: "Spada arrugginita (scadente)" },
          { range: [2], text: "Armatura rattoppata (scadente)" },
          { range: [3], text: "Borsa bucata con 1d4 ducati" },
          { range: [4], text: "Mappa sbiadita (forse utile)" },
          { range: [5], text: "Pozione scaduta (50% di funzionare)" },
          { range: [6], text: "Amuleto maledetto minore" },
          { range: [7], text: "Corda marcia (3 metri)" },
          { range: [8], text: "Torce umide (1d4)" },
          { range: [9], text: "Razioni ammuffite" },
          { range: [10], text: "Libro illeggibile" },
          { range: [11], text: "Chiave misteriosa" },
          { range: [12], text: "Dadi truccati" }
        ]
      },

      // Tabella Voci di Taverna
      tavernRumors: {
        name: "Voci di Taverna",
        formula: "1d10",
        results: [
          { range: [1], text: "Un tesoro nascosto nei dintorni" },
          { range: [2], text: "Guardie corrotte cercano qualcuno" },
          { range: [3], text: "Un nobile cerca sicari" },
          { range: [4], text: "Carovana in arrivo domani" },
          { range: [5], text: "Fantasmi nel cimitero" },
          { range: [6], text: "Il prete locale è un impostore" },
          { range: [7], text: "Banditi sulla strada principale" },
          { range: [8], text: "Torneo clandestino stasera" },
          { range: [9], text: "Strano mercante cerca avventurieri" },
          { range: [10], text: "Il sindaco nasconde un segreto" }
        ]
      }
    });
  }

  /**
   * Sistema esteso per danno non letale
   */
  setupNonLethalCombat() {
    // Hook per gestire dichiarazione di danno non letale
    Hooks.on("dnd5e.preRollDamage", (item, rollData, messageData) => {
      // Aggiungi opzione nel dialog
      rollData.dialogOptions = rollData.dialogOptions || {};
      rollData.dialogOptions.nonLethal = {
        label: "Danno Non Letale (KO)",
        checked: false
      };
    });

    // Hook per applicare danno non letale
    Hooks.on("dnd5e.rollDamage", (item, roll) => {
      if (roll.options?.nonLethal) {
        // Marca il danno come non letale
        roll.options.flavor = `${roll.options.flavor || ""} (Non Letale)`;

        // Applica flag per gestione KO
        if (game.combat) {
          const target = game.user.targets.first();
          if (target?.actor) {
            target.actor.setFlag("brancalonia", "nonLethalDamage", true);
          }
        }
      }
    });

    // Hook per KO invece di morte a 0 HP con danno non letale
    Hooks.on("updateActor", (actor, update, options, userId) => {
      if (!update.system?.attributes?.hp) return;

      const hp = update.system.attributes.hp.value;
      const nonLethal = actor.flags.brancalonia?.nonLethalDamage;

      if (hp <= 0 && nonLethal) {
        // Applica KO invece di morte
        actor.toggleStatusEffect("unconscious", { active: true });
        actor.unsetFlag("brancalonia", "nonLethalDamage");

        ChatMessage.create({
          content: `${actor.name} è stato messo KO! (danno non letale)`,
          speaker: ChatMessage.getSpeaker({ actor })
        });

        // Previeni tiri salvezza morte
        options.skipDeathSaves = true;
      }
    });
  }

  /**
   * Sistema Trabocchetti conforme a dnd5e
   */
  setupTraps() {
    if (!CONFIG.BRANCALONIA.traps) CONFIG.BRANCALONIA.traps = {};

    foundry.utils.mergeObject(CONFIG.BRANCALONIA.traps, {
      // Trappola base template
      template: {
        name: "Trappola Base",
        type: "hazard",
        system: {
          activation: { type: "special", cost: null },
          damage: { parts: [["1d6", "piercing"]] },
          save: { ability: "dex", dc: 12, scaling: "flat" },
          target: { value: 1, units: "", type: "creature" },
          range: { value: null, units: "" }
        }
      },

      // Tipi di trappole
      types: {
        pitfall: {
          name: "Botola",
          damage: [["2d6", "bludgeoning"]],
          save: { ability: "dex", dc: 12 },
          description: "Una botola nascosta che si apre sotto i piedi"
        },
        dart: {
          name: "Dardi Avvelenati",
          damage: [["1d4", "piercing"], ["1d4", "poison"]],
          save: { ability: "dex", dc: 13 },
          description: "Dardi avvelenati sparati dal muro"
        },
        net: {
          name: "Rete Nascosta",
          damage: [],
          save: { ability: "dex", dc: 14 },
          condition: "restrained",
          description: "Una rete cade dal soffitto"
        },
        alarm: {
          name: "Allarme",
          damage: [],
          save: { ability: "wis", dc: 10 },
          effect: "alert",
          description: "Un allarme che attira guardie"
        }
      }
    });

    // Macro per piazzare trappole
    this.createTrapMacro = function(trapType) {
      const trap = CONFIG.BRANCALONIA.traps.types[trapType];
      if (!trap) return;

      return new Macro({
        name: `Piazza ${trap.name}`,
        type: "script",
        img: "icons/environment/traps/spike-pit.webp",
        command: `
          // Crea token trappola
          const trapData = {
            name: "${trap.name}",
            img: "icons/environment/traps/question-mark.webp",
            hidden: true,
            disposition: -1,
            actorData: {
              type: "npc",
              system: {
                attributes: { hp: { value: 1, max: 1 } },
                details: { cr: 0.5 }
              }
            },
            flags: {
              brancalonia: {
                isTrap: true,
                trapType: "${trapType}",
                trapDC: ${trap.save.dc}
              }
            }
          });

          canvas.tokens.createMany([trapData]);
          ui.notifications.info("Trappola piazzata. Ricorda di nasconderla!");
        `
      });
    };

  /**
   * Sistema Padrini/Mentori
   */
  setupPatronSystem() {
    if (!CONFIG.BRANCALONIA.patrons) CONFIG.BRANCALONIA.patrons = {};

    foundry.utils.mergeObject(CONFIG.BRANCALONIA.patrons, {
      types: {
        noble: {
          name: "Nobile Corrotto",
          benefits: ["Accesso a corti", "Protezione legale limitata"],
          obligations: ["Missioni politiche", "Discrezione"],
          resources: { gold: "high", connections: "high", danger: "medium" }
        },
        criminal: {
          name: "Boss Criminale",
          benefits: ["Contatti malavita", "Nascondigli sicuri"],
          obligations: ["Lavori sporchi", "Omertà"],
          resources: { gold: "medium", connections: "high", danger: "high" }
        },
        merchant: {
          name: "Mercante Ricco",
          benefits: ["Sconti equipaggiamento", "Informazioni commerciali"],
          obligations: ["Protezione carovane", "Recupero debiti"],
          resources: { gold: "high", connections: "medium", danger: "low" }
        },
        priest: {
          name: "Prelato Ambizioso",
          benefits: ["Cure gratuite", "Asilo in chiese"],
          obligations: ["Missioni religiose", "Donazioni"],
          resources: { gold: "low", connections: "medium", danger: "low" }
        },
        wizard: {
          name: "Mago Eccentrico",
          benefits: ["Identificazione oggetti", "Pergamene occasionali"],
          obligations: ["Recupero componenti", "Test esperimenti"],
          resources: { gold: "low", connections: "low", danger: "high" }
        }
      }
    });

    // Funzione per assegnare un patrono
    this.assignPatron = async function(actor, patronType) {
      const patron = CONFIG.BRANCALONIA.patrons.types[patronType];
      if (!patron) return;

      await actor.setFlag("brancalonia", "patron", {
        type: patronType,
        name: patron.name,
        reputation: 0,
        favors: 0,
        debt: 0
      });

      ChatMessage.create({
        content: `
          <div class="brancalonia-patron">
            <h3>Nuovo Patrono: ${patron.name}</h3>
            <p><strong>Benefici:</strong> ${patron.benefits.join(", ")}</p>
            <p><strong>Obblighi:</strong> ${patron.obligations.join(", ")}</p>
          </div>
        `,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    });
  }

  /**
   * Oggetti magici specifici di Brancalonia
   */
  setupBrancaloniaItems() {
    if (!CONFIG.BRANCALONIA.magicItems) CONFIG.BRANCALONIA.magicItems = {};

    foundry.utils.mergeObject(CONFIG.BRANCALONIA.magicItems, {
      // Reliquie religiose
      relics: {
        "santo-dito": {
          name: "Dito di San Tognone",
          type: "trinket",
          rarity: "uncommon",
          attunement: false,
          effects: [{
            key: "system.attributes.hp.tempmax",
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: 5
          }],
          description: "Un dito mummificato di un santo locale. +5 HP massimi temporanei all'alba."
        },
        "acqua-benedetta": {
          name: "Acqua Benedetta Contraffatta",
          type: "consumable",
          rarity: "common",
          charges: 3,
          description: "50% di funzionare come vera acqua benedetta, 50% di essere solo acqua sporca."
        }
      },

      // Talismani folkloristici
      talismans: {
        "corno-rosso": {
          name: "Cornetto Rosso",
          type: "trinket",
          rarity: "common",
          effects: [{
            key: "flags.midi-qol.advantage.save.frightened",
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: "1"
          }],
          description: "Protegge dal malocchio. Vantaggio contro paura."
        },
        "ferro-cavallo": {
          name: "Ferro di Cavallo Fortunato",
          type: "trinket",
          rarity: "uncommon",
          description: "Una volta al giorno, puoi ritirare un 1 naturale."
        }
      },

      // Armi leggendarie scadenti
      legendary: {
        "durlindana-falsa": {
          name: "Durlindana (Replica Scadente)",
          type: "weapon",
          weaponType: "sword",
          rarity: "rare",
          bonus: 1,
          properties: ["shoddy"],
          description: "Una pessima imitazione della spada di Orlando. +1 al colpire, si rompe con 1-2."
        }
      }
    });
  }

  /**
   * Regole opzionali di Brancalonia
   */
  setupOptionalRules() {
    // Registra settings per regole opzionali
    game.settings.register("brancalonia-bigat", "useCriticalTables", {
      name: "Usa Tabelle Critici/Fallimenti",
      hint: "Attiva tabelle speciali per 20 e 1 naturali",
      scope: "world",
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register("brancalonia-bigat", "useHonorSystem", {
      name: "Sistema Onore/Disonore",
      hint: "Traccia onore e disonore dei personaggi",
      scope: "world",
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register("brancalonia-bigat", "useRealisticInjuries", {
      name: "Ferite Realistiche",
      hint: "Ferite permanenti su colpi critici",
      scope: "world",
      config: true,
      type: Boolean,
      default: false
    });

    // Hook per critici speciali
    if (game.settings.get("brancalonia-bigat", "useCriticalTables")) {
      Hooks.on("dnd5e.rollAttack", async (item, roll, ammo) => {
        const d20Result = roll.dice[0]?.results[0]?.result;

        if (d20Result === 20) {
          // Critico spettacolare
          const criticalTable = await new Roll("1d10").evaluate();
          const effects = [
            "Colpo devastante! Danno massimizzato",
            "Ferita sanguinante: 1d4 danni per round per 3 round",
            "Arto menomato: -2 Destrezza fino a cura",
            "Stordito: Il bersaglio perde il prossimo turno",
            "Disarmato e prono",
            "Colpo all'occhio: Accecato per 1 minuto",
            "Terrore: Nemici entro 3m devono fare TS Saggezza CD 12 o essere spaventati",
            "Ispirazione: Guadagni Ispirazione",
            "Doppio danno dei dadi",
            "Colpo perfetto: Puoi attaccare di nuovo immediatamente"
          ];

          ChatMessage.create({
            content: `
              <div class="critical-effect">
                <h3>⚔️ CRITICO SPETTACOLARE! ⚔️</h3>
                <p>${effects[criticalTable.total - 1]}</p>
              </div>
            `,
            speaker: ChatMessage.getSpeaker({ actor: item.parent })
          });
        } else if (d20Result === 1) {
          // Fallimento catastrofico
          const fumbleTable = await new Roll("1d10").evaluate();
          const fumbles = [
            "Colpisci te stesso: Metà danni",
            "Arma inceppata/rotta: Deve essere riparata",
            "Cadi prono",
            "Colpisci un alleato vicino",
            "Perdi l'arma: Vola via 3m",
            "Esposto: Il prossimo attacco contro di te ha vantaggio",
            "Distrazione: -2 CA fino al tuo prossimo turno",
            "Crampo: Non puoi usare quell'arma per 1 round",
            "Imbarazzo: Svantaggio al prossimo tiro",
            "Il Menagramo colpisce! Applica Menagramo minore"
          ];

          ChatMessage.create({
            content: `
              <div class="fumble-effect">
                <h3>💥 FALLIMENTO CATASTROFICO! 💥</h3>
                <p>${fumbles[fumbleTable.total - 1]}</p>
              </div>
            `,
            speaker: ChatMessage.getSpeaker({ actor: item.parent })
          });
        }
      });
    }
  }

  /**
   * Crea un generatore di PNG casuali di Brancalonia
   */
  static generateRandomNPC(type = "generic") {
    const names = {
      male: ["Beppe", "Gino", "Tonio", "Carletto", "Piero", "Matteo", "Franco", "Luigi"],
      female: ["Maria", "Rosa", "Lucia", "Giovanna", "Teresa", "Anna", "Carmela", "Francesca"],
      surnames: ["il Gobbo", "Mangiafuoco", "Zampacorta", "Bevilacqua", "Malaparte", "Dentineri", "lo Storto"]
    });

    const occupations = ["Locandiere", "Mercante", "Guardia", "Ladro", "Contadino", "Artigiano", "Prete", "Menestrello"];

    const quirks = [
      "Sempre ubriaco",
      "Parla in rima",
      "Terrorizzato dai gatti",
      "Ride nervosamente",
      "Sussurra sempre",
      "Esageratamente superstizioso",
      "Mente compulsivamente",
      "Puzza di cipolle"
    ];

    const gender = Math.random() > 0.5 ? "male" : "female";
    const firstName = names[gender][Math.floor(Math.random() * names[gender].length)];
    const surname = names.surnames[Math.floor(Math.random() * names.surnames.length)];
    const occupation = occupations[Math.floor(Math.random() * occupations.length)];
    const quirk = quirks[Math.floor(Math.random() * quirks.length)];

    return {
      name: `${firstName} ${surname}`,
      occupation: occupation,
      quirk: quirk,
      stats: {
        ac: 10 + Math.floor(Math.random() * 5),
        hp: Math.floor(Math.random() * 20) + 5,
        speed: 30
      }
    });
  }

  /**
   * Sistema per generare soprannomi Knave
   */
  static generateKnaveNickname() {
    const adjectives = ["Veloce", "Storto", "Maldestro", "Fortunato", "Maledetto", "Gobbo", "Lungo", "Corto"];
    const nouns = ["Coltello", "Ombra", "Volpe", "Corvo", "Moneta", "Dado", "Whisky", "Veleno"];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adj} ${noun}`;
  }
}

// Registra classe globalmente
window.BrancaloniaMechanics = BrancaloniaMechanics;