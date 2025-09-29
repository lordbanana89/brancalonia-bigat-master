/**
 * Meccaniche di Gioco Aggiuntive per Brancalonia
 * Completamente compatibile con dnd5e system per Foundry VTT v13
 */

class BrancaloniaMechanics {
  static ID = 'brancalonia-bigat';
  static VERSION = '1.0.0';

  /**
   * Inizializzazione completa del modulo
   */
  static initialize() {
    console.log('🎲 Brancalonia | Inizializzazione Meccaniche di Gioco');

    try {
      // Registra settings
      this.registerSettings();

      // Registra hooks
      this.registerHooks();

      // Registra comandi chat
      this.registerChatCommands();

      // Registra istanza globale
      game.brancalonia = game.brancalonia || {};
      game.brancalonia.mechanics = this;

      // Estende Actor class
      this.extendActorClass();

      // Crea macro automatiche
      this.createAutomaticMacros();

      // Setup meccaniche aggiuntive
      this.setupAdditionalMechanics();

      console.log('✅ Brancalonia | Meccaniche di Gioco inizializzate con successo');
    } catch (error) {
      console.error('❌ Errore inizializzazione Meccaniche:', error);
      ui.notifications.error('Errore durante l\'inizializzazione delle meccaniche di gioco');
    }
  }

  /**
   * Registra le impostazioni del modulo
   */
  static registerSettings() {
    // Abilita tabelle critici/fallimenti
    game.settings.register(this.ID, 'useCriticalTables', {
      name: 'Usa Tabelle Critici/Fallimenti',
      hint: 'Attiva tabelle speciali per 20 e 1 naturali',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    // Sistema Onore/Disonore
    game.settings.register(this.ID, 'useHonorSystem', {
      name: 'Sistema Onore/Disonore',
      hint: 'Traccia onore e disonore dei personaggi',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    // Ferite realistiche
    game.settings.register(this.ID, 'useRealisticInjuries', {
      name: 'Ferite Realistiche',
      hint: 'Ferite permanenti su colpi critici',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    // Sistema trabocchetti
    game.settings.register(this.ID, 'enableTraps', {
      name: 'Abilita Sistema Trabocchetti',
      hint: 'Permette la creazione e gestione di trappole',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
  }

  /**
   * Registra tutti gli hooks necessari
   */
  static registerHooks() {
    // Hook per critici speciali
    Hooks.on('dnd5e.rollAttack', async (item, roll, ammo) => {
      if (!game.settings.get(this.ID, 'useCriticalTables')) return;
      await this.handleCriticalResults(item, roll);
    });

    // Hook per danno non letale
    Hooks.on('dnd5e.preRollDamage', (item, rollData, messageData) => {
      this.addNonLethalOption(rollData);
    });

    // Hook per applicare danno
    Hooks.on('updateActor', (actor, update, options, userId) => {
      this.handleActorUpdate(actor, update, options, userId);
    });

    // Hook per character sheet
    Hooks.on('renderActorSheet', (app, html, data) => {
      this.enhanceCharacterSheet(app, html, data);
    });
  }

  /**
   * Registra comandi chat
   */
  static registerChatCommands() {
    Hooks.on('chatMessage', (html, content, msg) => {
      if (!content.startsWith('/')) return true;

      const [command, ...args] = content.slice(1).split(' ');

      switch (command.toLowerCase()) {
        case 'npc-random':
          this.generateRandomNPCCommand(args[0]);
          return false;
        case 'complicazione':
          this.rollComplication();
          return false;
        case 'voce-taverna':
          this.rollTavernRumor();
          return false;
        case 'bottino-scadente':
          this.rollShoddyLoot();
          return false;
        case 'piazza-trappola':
          if (args[0]) this.createTrapMacro(args[0]);
          else this.showTrapHelp();
          return false;
        case 'assegna-patrono':
          if (args[0]) this.assignPatron(game.user.character, args[0]);
          else this.showPatronHelp();
          return false;
        case 'meccaniche-help':
          this.showMechanicsHelp();
          return false;
        default:
          return true;
      }
    });
  }

  /**
   * Estende la classe Actor
   */
  static extendActorClass() {
    const originalPrepareData = CONFIG.Actor.documentClass.prototype.prepareDerivedData;
    CONFIG.Actor.documentClass.prototype.prepareDerivedData = function() {
      originalPrepareData.call(this);

      // Aggiunge tracking onore/disonore
      if (game.settings.get(BrancaloniaMechanics.ID, 'useHonorSystem')) {
        this.system.honor = this.getFlag(BrancaloniaMechanics.ID, 'honor') || 0;
        this.system.dishonor = this.getFlag(BrancaloniaMechanics.ID, 'dishonor') || 0;
      }

      // Tracking patrono
      this.system.patron = this.getFlag(BrancaloniaMechanics.ID, 'patron') || null;
    };
  }

  /**
   * Crea macro automatiche
   */
  static async createAutomaticMacros() {
    const macros = [
      {
        name: 'Genera PNG Casuale',
        type: 'script',
        img: 'icons/environment/people/commoner.webp',
        command: 'const npc = BrancaloniaMechanics.generateRandomNPC(); ui.notifications.info(`PNG: ${npc.name} - ${npc.occupation}`);',
        folder: null
      },
      {
        name: 'Tira Complicazione',
        type: 'script',
        img: 'icons/magic/symbols/question-stone-yellow.webp',
        command: 'BrancaloniaMechanics.rollComplication();',
        folder: null
      }
    ];

    for (const macroData of macros) {
      const existing = game.macros.find(m => m.name === macroData.name);
      if (!existing) {
        await Macro.create(macroData);
      }
    }
  }

  static setupAdditionalMechanics() {
    try {
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

      console.log('⚙️ Meccaniche aggiuntive di Brancalonia configurate');
    } catch (error) {
      console.error('❌ Errore setup meccaniche aggiuntive:', error);
    }
  }

  /**
   * Setup tabelle casuali conformi a dnd5e
   */
  static setupRandomTables() {
    // Registra tabelle nel CONFIG - Usa mergeObject per evitare problemi
    if (!CONFIG.BRANCALONIA) CONFIG.BRANCALONIA = {};
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
  static setupNonLethalCombat() {
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
            target.actor.setFlag(BrancaloniaMechanics.ID, "nonLethalDamage", true);
          }
        }
      }
    });
  }

  /**
   * Sistema Trabocchetti conforme a dnd5e
   */
  static setupTraps() {
    if (!CONFIG.BRANCALONIA) CONFIG.BRANCALONIA = {};
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
  }

  static async createTrapMacro(trapType) {
    try {
      const trap = CONFIG.BRANCALONIA?.traps?.types?.[trapType];
      if (!trap) {
        ui.notifications.warn(`Tipo di trappola '${trapType}' non trovato`);
        return;
      }

      const macroData = {
        name: `Piazza ${trap.name}`,
        type: "script",
        img: "icons/environment/traps/spike-pit.webp",
        command: `
          try {
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
                'brancalonia-bigat': {
                  isTrap: true,
                  trapType: "${trapType}",
                  trapDC: ${trap.save.dc}
                }
              }
            };

            canvas.tokens.createMany([trapData]);
            ui.notifications.info("Trappola piazzata. Ricorda di nasconderla!");
          } catch (error) {
            console.error('Errore creazione trappola:', error);
            ui.notifications.error('Errore durante la creazione della trappola');
          }
        `
      };

      await Macro.create(macroData);
      ui.notifications.info(`Macro '${macroData.name}' creata`);
    } catch (error) {
      console.error('Errore creazione macro trappola:', error);
      ui.notifications.error('Errore durante la creazione della macro');
    }
  }

  /**
   * Sistema Padrini/Mentori
   */
  static setupPatronSystem() {
    if (!CONFIG.BRANCALONIA) CONFIG.BRANCALONIA = {};
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
  }

  // Funzione per assegnare un patrono
  static async assignPatron(actor, patronType) {
    const patron = CONFIG.BRANCALONIA.patrons.types[patronType];
    if (!patron) return;

    await actor.setFlag(this.ID, "patron", {
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
  }

  /**
   * Oggetti magici specifici di Brancalonia
   */
  static setupBrancaloniaItems() {
    if (!CONFIG.BRANCALONIA) CONFIG.BRANCALONIA = {};
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
  static setupOptionalRules() {
    console.log('⚙️ Configurazione regole opzionali di Brancalonia');
  }

  /**
   * Gestisce risultati critici
   */
  static async handleCriticalResults(item, roll) {
    try {
      const d20Result = roll.dice[0]?.results[0]?.result;
      if (!d20Result) return;

      if (d20Result === 20) {
        await this.handleCriticalSuccess(item, roll);
      } else if (d20Result === 1) {
        await this.handleCriticalFailure(item, roll);
      }
    } catch (error) {
      console.error('Errore gestione critici:', error);
    }
  }

  /**
   * Gestisce critico di successo
   */
  static async handleCriticalSuccess(item, roll) {
    if (!game.settings.get(this.ID, 'useCriticalTables')) return;

    try {
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
    } catch (error) {
      console.error('Errore critico successo:', error);
    }
  }

  /**
   * Gestisce critico di fallimento
   */
  static async handleCriticalFailure(item, roll) {
    if (!game.settings.get(this.ID, 'useCriticalTables')) return;

    try {
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
    } catch (error) {
      console.error('Errore critico fallimento:', error);
    }
  }

  /**
   * Aggiunge opzione danno non letale
   */
  static addNonLethalOption(rollData) {
    try {
      rollData.dialogOptions = rollData.dialogOptions || {};
      rollData.dialogOptions.nonLethal = {
        label: "Danno Non Letale (KO)",
        checked: false
      };
    } catch (error) {
      console.error('Errore aggiunta opzione non letale:', error);
    }
  }

  /**
   * Gestisce aggiornamento attore
   */
  static handleActorUpdate(actor, update, options, userId) {
    try {
      if (!update.system?.attributes?.hp) return;

      const hp = update.system.attributes.hp.value;
      const nonLethal = actor.getFlag(this.ID, 'nonLethalDamage');

      if (hp <= 0 && nonLethal) {
        // Applica KO invece di morte
        actor.toggleStatusEffect("unconscious", { active: true });
        actor.unsetFlag(this.ID, 'nonLethalDamage');

        ChatMessage.create({
          content: `${actor.name} è stato messo KO! (danno non letale)`,
          speaker: ChatMessage.getSpeaker({ actor })
        });

        // Previeni tiri salvezza morte
        options.skipDeathSaves = true;
      }
    } catch (error) {
      console.error('Errore gestione aggiornamento attore:', error);
    }
  }

  /**
   * Migliora character sheet
   */
  static enhanceCharacterSheet(app, html, data) {
    try {
      if (!game.settings.get(this.ID, 'useHonorSystem')) return;

      const actor = app.actor;
      const honor = actor.getFlag(this.ID, 'honor') || 0;
      const dishonor = actor.getFlag(this.ID, 'dishonor') || 0;

      // Aggiunge sezione onore/disonore
      const attributesTab = html.find('.tab[data-tab="attributes"]');
      if (attributesTab.length) {
        attributesTab.append(`
          <div class="brancalonia-honor">
            <h3>Onore e Disonore</h3>
            <div class="form-group">
              <label>Onore: ${honor}</label>
              <label>Disonore: ${dishonor}</label>
            </div>
          </div>
        `);
      }
    } catch (error) {
      console.error('Errore enhancing character sheet:', error);
    }
  }

  /**
   * Tira complicazione
   */
  static async rollComplication() {
    try {
      const table = CONFIG.BRANCALONIA?.tables?.complications;
      if (!table) {
        ui.notifications.warn('Tabella complicazioni non trovata');
        return;
      }

      const roll = await new Roll(table.formula).evaluate();
      const result = table.results.find(r =>
        roll.total >= r.range[0] && roll.total <= (r.range[1] || r.range[0])
      );

      ChatMessage.create({
        content: `
          <div class="brancalonia-complication">
            <h3>💥 Complicazione di Brancalonia!</h3>
            <p><strong>Risultato (${roll.total}):</strong> ${result?.text || 'Risultato non trovato'}</p>
          </div>
        `
      });
    } catch (error) {
      console.error('Errore tiro complicazione:', error);
      ui.notifications.error('Errore durante il tiro della complicazione');
    }
  }

  /**
   * Tira voce di taverna
   */
  static async rollTavernRumor() {
    try {
      const table = CONFIG.BRANCALONIA?.tables?.tavernRumors;
      if (!table) {
        ui.notifications.warn('Tabella voci di taverna non trovata');
        return;
      }

      const roll = await new Roll(table.formula).evaluate();
      const result = table.results.find(r =>
        roll.total >= r.range[0] && roll.total <= (r.range[1] || r.range[0])
      );

      ChatMessage.create({
        content: `
          <div class="brancalonia-rumor">
            <h3>🍺 Voce di Taverna</h3>
            <p><strong>Si dice che...</strong> ${result?.text || 'Nessuna voce interessante'}</p>
          </div>
        `
      });
    } catch (error) {
      console.error('Errore tiro voce taverna:', error);
    }
  }

  /**
   * Tira bottino scadente
   */
  static async rollShoddyLoot() {
    try {
      const table = CONFIG.BRANCALONIA?.tables?.shoddyLoot;
      if (!table) {
        ui.notifications.warn('Tabella bottino scadente non trovata');
        return;
      }

      const roll = await new Roll(table.formula).evaluate();
      const result = table.results.find(r =>
        roll.total >= r.range[0] && roll.total <= (r.range[1] || r.range[0])
      );

      ChatMessage.create({
        content: `
          <div class="brancalonia-loot">
            <h3>💰 Bottino Scadente</h3>
            <p><strong>Trovi:</strong> ${result?.text || 'Niente di valore'}</p>
          </div>
        `
      });
    } catch (error) {
      console.error('Errore tiro bottino:', error);
    }
  }

  /**
   * Genera PNG casuale con comando
   */
  static generateRandomNPCCommand(type = "generic") {
    const npc = this.generateRandomNPC(type);

    ChatMessage.create({
      content: `
        <div class="brancalonia-npc">
          <h3>👤 PNG Casuale di Brancalonia</h3>
          <p><strong>Nome:</strong> ${npc.name}</p>
          <p><strong>Professione:</strong> ${npc.occupation}</p>
          <p><strong>Caratteristica:</strong> ${npc.quirk}</p>
          <p><strong>CA:</strong> ${npc.stats.ac} | <strong>PF:</strong> ${npc.stats.hp} | <strong>Velocità:</strong> ${npc.stats.speed} ft</p>
        </div>
      `
    });
  }

  /**
   * Mostra aiuto trappole
   */
  static showTrapHelp() {
    const message = `
      <div class="brancalonia-help">
        <h3>🕳️ Sistema Trabocchetti</h3>
        <h4>Tipi disponibili:</h4>
        <ul>
          <li><code>pitfall</code> - Botola</li>
          <li><code>dart</code> - Dardi Avvelenati</li>
          <li><code>net</code> - Rete Nascosta</li>
          <li><code>alarm</code> - Allarme</li>
        </ul>
        <p><strong>Uso:</strong> <code>/piazza-trappola [tipo]</code></p>
      </div>
    `;

    ChatMessage.create({
      content: message,
      whisper: [game.user.id]
    });
  }

  /**
   * Mostra aiuto padroni
   */
  static showPatronHelp() {
    const message = `
      <div class="brancalonia-help">
        <h3>👑 Sistema Padrini</h3>
        <h4>Tipi disponibili:</h4>
        <ul>
          <li><code>noble</code> - Nobile Corrotto</li>
          <li><code>criminal</code> - Boss Criminale</li>
          <li><code>merchant</code> - Mercante Ricco</li>
          <li><code>priest</code> - Prelato Ambizioso</li>
          <li><code>wizard</code> - Mago Eccentrico</li>
        </ul>
        <p><strong>Uso:</strong> <code>/assegna-patrono [tipo]</code></p>
      </div>
    `;

    ChatMessage.create({
      content: message,
      whisper: [game.user.id]
    });
  }

  /**
   * Mostra aiuto generale
   */
  static showMechanicsHelp() {
    const message = `
      <div class="brancalonia-help">
        <h3>🎲 Meccaniche di Brancalonia</h3>
        <h4>Comandi disponibili:</h4>
        <ul>
          <li><code>/npc-random [tipo]</code> - Genera PNG casuale</li>
          <li><code>/complicazione</code> - Tira complicazione</li>
          <li><code>/voce-taverna</code> - Tira voce di taverna</li>
          <li><code>/bottino-scadente</code> - Tira bottino scadente</li>
          <li><code>/piazza-trappola [tipo]</code> - Crea trappola</li>
          <li><code>/assegna-patrono [tipo]</code> - Assegna patrono</li>
        </ul>
        <h4>Funzionalità:</h4>
        <ul>
          <li>Critici e fallimenti spettacolari</li>
          <li>Sistema danno non letale</li>
          <li>Tabelle casuali per eventi</li>
          <li>Sistema onore/disonore</li>
          <li>Gestione trabocchetti</li>
        </ul>
      </div>
    `;

    ChatMessage.create({
      content: message,
      whisper: [game.user.id]
    });
  }

  /**
   * Crea un generatore di PNG casuali di Brancalonia
   */
  static generateRandomNPC(type = "generic") {
    const names = {
      male: ["Beppe", "Gino", "Tonio", "Carletto", "Piero", "Matteo", "Franco", "Luigi"],
      female: ["Maria", "Rosa", "Lucia", "Giovanna", "Teresa", "Anna", "Carmela", "Francesca"],
      surnames: ["il Gobbo", "Mangiafuoco", "Zampacorta", "Bevilacqua", "Malaparte", "Dentineri", "lo Storto"]
    };

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
    };
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

// Auto-inizializzazione
Hooks.once('init', () => {
  BrancaloniaMechanics.initialize();
});

// Registra globalmente
window.BrancaloniaMechanics = BrancaloniaMechanics;

/**
 * CSS per effetti UI
 */
Hooks.once('ready', () => {
  const style = document.createElement('style');
  style.innerHTML = `
    .critical-effect {
      background: linear-gradient(135deg, #FF5722 0%, #FF9800 100%);
      color: white;
      border: 2px solid #F44336;
      padding: 12px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(244, 67, 54, 0.4);
      text-align: center;
    }

    .fumble-effect {
      background: linear-gradient(135deg, #795548 0%, #9E9E9E 100%);
      color: white;
      border: 2px solid #6D4C41;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
    }

    .brancalonia-complication {
      background: linear-gradient(135deg, #9C27B0 0%, #E91E63 100%);
      color: white;
      border: 2px solid #8E24AA;
      padding: 12px;
      border-radius: 8px;
    }

    .brancalonia-rumor {
      background: linear-gradient(135deg, #FF9800 0%, #FFC107 100%);
      color: #333;
      border: 2px solid #FF8F00;
      padding: 12px;
      border-radius: 8px;
    }

    .brancalonia-loot {
      background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
      color: white;
      border: 2px solid #43A047;
      padding: 12px;
      border-radius: 8px;
    }

    .brancalonia-npc {
      background: linear-gradient(135deg, #673AB7 0%, #9C27B0 100%);
      color: white;
      border: 2px solid #5E35B1;
      padding: 12px;
      border-radius: 8px;
    }

    .brancalonia-patron {
      background: linear-gradient(135deg, #607D8B 0%, #455A64 100%);
      color: white;
      border: 2px solid #546E7A;
      padding: 12px;
      border-radius: 8px;
    }

    .brancalonia-honor {
      background: #F3E5F5;
      border: 1px solid #9C27B0;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
    }

    .brancalonia-honor h3 {
      color: #7B1FA2;
      margin-bottom: 8px;
    }

    .brancalonia-help {
      background: linear-gradient(135deg, #37474F 0%, #546E7A 100%);
      color: white;
      border: 2px solid #455A64;
      padding: 15px;
      border-radius: 8px;
    }

    .brancalonia-help h3 {
      color: #B0BEC5;
      margin-bottom: 10px;
    }

    .brancalonia-help code {
      background: rgba(0,0,0,0.3);
      padding: 2px 6px;
      border-radius: 3px;
      color: #FFEB3B;
    }
  `;
  document.head.appendChild(style);
});