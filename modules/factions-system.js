/**
 * @fileoverview Sistema Fazioni per Brancalonia
 *
 * Sistema completo di gestione fazioni, reputazione, alleanze e rivalità.
 * Supporta 12+ fazioni con ranghi, benefici, risorse, relazioni, guerre e eventi.
 *
 * Features:
 * - 12+ Fazioni complete (religiose, militari, politiche, criminali, commerciali, magiche)
 * - Sistema reputazione (scala -100 / +100)
 * - Ranghi per fazione (6 livelli)
 * - Benefici per livello (member, allied, honored)
 * - Relazioni tra fazioni (alleanze/rivalità)
 * - Risorse (oro, truppe, spie, etc.)
 * - Guerra tra fazioni (battaglie, esiti)
 * - Eventi giornalieri automatici
 * - Effetti cascata reputazione
 * - Quest system per fazione
 * - Chat commands (/fazione-*)
 * - Macro automatica
 * - Settings (4 impostazioni)
 * - Actor extension
 *
 * @version 3.0.0
 * @author Brancalonia Module Team
 * @requires brancalonia-logger.js
 * @requires dnd5e
 */

import { logger } from './brancalonia-logger.js';

/**
 * @typedef {Object} FactionStatistics
 * @property {number} initTime - Tempo inizializzazione (ms)
 * @property {number} reputationChanges - Cambi reputazione totali
 * @property {Object<string, number>} reputationByFaction - Cambi per fazione
 * @property {number} ranksGained - Ranghi acquisiti totali
 * @property {number} ranksLost - Ranghi persi totali
 * @property {number} benefitsApplied - Benefici applicati
 * @property {number} benefitsRemoved - Benefici rimossi
 * @property {number} warsStarted - Guerre iniziate
 * @property {number} battlesResolved - Battaglie risolte
 * @property {number} dailyEvents - Eventi giornalieri
 * @property {number} cascadeEffects - Effetti cascata
 * @property {number} allianceChanges - Cambi alleanze
 * @property {number} rivalryChanges - Cambi rivalità
 * @property {number} factionsCount - Numero fazioni
 * @property {number} activeMembers - Membri attivi
 * @property {number} activeMemberships - Membership attive per PG
 * @property {number} macrosCreated - Macro create
 * @property {number} chatCommandsExecuted - Comandi chat eseguiti
 * @property {string[]} errors - Errori registrati
 */

/**
 * Sistema Fazioni per Brancalonia
 * Gestisce fazioni, reputazione, alleanze e rivalità
 *
 * @class FactionsSystem
 */
class FactionsSystem {
  static VERSION = '3.0.0';
  static MODULE_NAME = 'FactionsSystem';
  static ID = 'factions-system';

  /**
   * Statistiche del modulo
   * @type {FactionStatistics}
   * @private
   * @static
   */
  static _statistics = {
    initTime: 0,
    reputationChanges: 0,
    reputationByFaction: {},
    ranksGained: 0,
    ranksLost: 0,
    benefitsApplied: 0,
    benefitsRemoved: 0,
    warsStarted: 0,
    battlesResolved: 0,
    dailyEvents: 0,
    cascadeEffects: 0,
    allianceChanges: 0,
    rivalryChanges: 0,
    factionsCount: 0,
    activeMembers: 0,
    activeMemberships: 0,
    macrosCreated: 0,
    chatCommandsExecuted: 0,
    errors: []
  };

  /**
   * Stato del modulo
   * @type {Object}
   * @private
   * @static
   */
  static _state = {
    initialized: false,
    instance: null,
    activeWars: new Map(),
    dailyEventsTimer: null
  };

  constructor() {
    try {
      // Inizializza contatori per fazione
      Object.keys(this.factions || {}).forEach(faction => {
        FactionsSystem._statistics.reputationByFaction[faction] = 0;
      });
    } catch (error) {
      FactionsSystem._statistics.errors.push(`Constructor: ${error.message}`);
      logger.error(FactionsSystem.MODULE_NAME, 'Errore inizializzazione constructor', error);
    }
    // Database fazioni di Brancalonia
    this.factions = {
      // FAZIONI RELIGIOSE
      chiesa_calendaria: {
        name: 'Chiesa Calendaria',
        type: 'religiosa',
        icon: 'icons/environment/settlement/church.webp',
        alignment: 'lawful',
        power: 9,
        influence: 'nazionale',
        description: 'La chiesa ufficiale del Regno, potente e corrotta',
        headquarters: 'Vaticantica',
        leader: 'Papa Innocenzo XXIII',
        resources: {
          gold: 10000,
          troops: 500,
          spies: 20,
          clerics: 100
        },
        relations: {
          nobiltà: 75,
          ordine_draconiano: 50,
          gilde_mercanti: 60,
          popolo: 30,
          criminali: -50,
          eretici: -100
        },
        benefits: {
          member: 'Accesso a cure gratuite, alloggio nei monasteri',
          allied: 'Protezione legale, sconto 20% servizi religiosi',
          honored: 'Immunità diplomatica, benedizioni potenti'
        },
        quests: [
          'Recuperare reliquie sacre',
          'Eliminare eretici',
          'Raccogliere decime',
          'Convertire pagani'
        ],
        ranks: [
          { level: 0, title: 'Fedele', minRep: 0 },
          { level: 1, title: 'Accolito', minRep: 10 },
          { level: 2, title: 'Chierico', minRep: 25 },
          { level: 3, title: 'Priore', minRep: 50 },
          { level: 4, title: 'Vescovo', minRep: 100 },
          { level: 5, title: 'Cardinale', minRep: 200 }
        ]
      },

      ordine_draconiano: {
        name: 'Ordine Draconiano',
        type: 'militare',
        icon: 'icons/creatures/abilities/dragon-fire-breath-orange.webp',
        alignment: 'lawful',
        power: 8,
        influence: 'nazionale',
        description: 'Ordine cavalleresco dedicato a San Giorgio',
        headquarters: 'Rocca del Drago',
        leader: 'Gran Maestro Sigismondo',
        resources: {
          gold: 5000,
          troops: 300,
          knights: 50,
          fortresses: 5
        },
        relations: {
          chiesa_calendaria: 50,
          nobiltà: 80,
          popolo: 60,
          criminali: -70,
          mostri: -100
        },
        benefits: {
          member: 'Addestramento marziale, equipaggiamento',
          allied: 'Protezione militare, accesso fortezze',
          honored: 'Cavalierato, terre e titolo'
        },
        quests: [
          'Cacciare mostri',
          'Proteggere pellegrini',
          'Recuperare artefatti draconici',
          'Difendere i deboli'
        ],
        ranks: [
          { level: 0, title: 'Scudiero', minRep: 0 },
          { level: 1, title: 'Cavaliere', minRep: 20 },
          { level: 2, title: 'Cavaliere Veterano', minRep: 40 },
          { level: 3, title: 'Comandante', minRep: 80 },
          { level: 4, title: 'Campione', minRep: 150 }
        ]
      },

      // FAZIONI CRIMINALI
      benandanti: {
        name: 'I Benandanti',
        type: 'segreta',
        icon: 'icons/magic/nature/leaf-glow-triple-green.webp',
        alignment: 'neutral',
        power: 6,
        influence: 'regionale',
        description: 'Società segreta di combattenti spirituali',
        headquarters: 'Luoghi sacri nascosti',
        leader: 'Il Primo Nato',
        resources: {
          gold: 2000,
          members: 100,
          safehouse: 10,
          informants: 30
        },
        relations: {
          chiesa_calendaria: -30,
          popolo: 70,
          streghe: -100,
          spiriti: 50
        },
        benefits: {
          member: 'Protezione da maledizioni, erbe curative',
          allied: 'Informazioni su attività sovrannaturali',
          honored: 'Iniziazione ai misteri, poteri spirituali'
        },
        quests: [
          'Combattere streghe malvagie',
          'Proteggere raccolti',
          'Esorcizzare spiriti',
          'Trovare nati con la camicia'
        ],
        ranks: [
          { level: 0, title: 'Simpatizzante', minRep: 0 },
          { level: 1, title: 'Iniziato', minRep: 15 },
          { level: 2, title: 'Benandante', minRep: 35 },
          { level: 3, title: 'Capitano', minRep: 70 },
          { level: 4, title: 'Gran Benandante', minRep: 140 }
        ]
      },

      mano_nera: {
        name: 'La Mano Nera',
        type: 'criminale',
        icon: 'icons/skills/social/theft-pickpocket-bribery-brown.webp',
        alignment: 'chaotic',
        power: 7,
        influence: 'nazionale',
        description: 'La più potente organizzazione criminale del Regno',
        headquarters: 'Sconosciuto',
        leader: 'Il Padrone (identità segreta)',
        resources: {
          gold: 8000,
          members: 500,
          safehouse: 50,
          assassins: 20,
          smugglers: 100
        },
        relations: {
          chiesa_calendaria: -50,
          nobiltà: 30,
          guardie: -100,
          mercanti: 40,
          popolo: 20
        },
        benefits: {
          member: 'Protezione, contrabbando, informazioni',
          allied: 'Sconto 30% servizi illegali, contatti',
          honored: 'Territorio personale, percentuale affari'
        },
        quests: [
          'Assassinii mirati',
          'Contrabbando merci',
          'Estorsioni',
          'Furto di oggetti preziosi',
          'Corruzione ufficiali'
        ],
        ranks: [
          { level: 0, title: 'Associato', minRep: 0 },
          { level: 1, title: 'Soldato', minRep: 10 },
          { level: 2, title: 'Capo Decina', minRep: 30 },
          { level: 3, title: 'Luogotenente', minRep: 60 },
          { level: 4, title: 'Capo Famiglia', minRep: 120 },
          { level: 5, title: 'Consigliere', minRep: 200 }
        ]
      },

      // FAZIONI COMMERCIALI
      gilda_mercanti: {
        name: 'Gilda dei Mercanti',
        type: 'commerciale',
        icon: 'icons/commodities/currency/coins-assorted-mix-copper.webp',
        alignment: 'neutral',
        power: 7,
        influence: 'nazionale',
        description: 'Potente confederazione di mercanti e artigiani',
        headquarters: 'Tarantasia',
        leader: "Gran Mercante Cosimo de' Fiorini",
        resources: {
          gold: 15000,
          members: 1000,
          caravans: 50,
          ships: 20,
          warehouses: 100
        },
        relations: {
          chiesa_calendaria: 60,
          nobiltà: 70,
          popolo: 50,
          criminali: -20,
          pirati: -80
        },
        benefits: {
          member: 'Licenza commerciale, protezione carovane',
          allied: 'Sconto 25% merci, prestiti agevolati',
          honored: 'Monopoli commerciali, partecipazione profitti'
        },
        quests: [
          'Scortare carovane',
          'Recuperare merci rubate',
          'Negoziare accordi',
          'Esplorare nuove rotte',
          'Eliminare concorrenza'
        ],
        ranks: [
          { level: 0, title: 'Apprendista', minRep: 0 },
          { level: 1, title: 'Mercante', minRep: 15 },
          { level: 2, title: 'Mercante Esperto', minRep: 35 },
          { level: 3, title: 'Maestro Mercante', minRep: 70 },
          { level: 4, title: 'Console', minRep: 140 }
        ]
      },

      // FAZIONI POPOLARI
      briganti_sherwood: {
        name: 'Briganti di Sherwood',
        type: 'ribelle',
        icon: 'icons/weapons/bows/bow-recurve-yellow.webp',
        alignment: 'chaotic good',
        power: 5,
        influence: 'regionale',
        description: 'Briganti che rubano ai ricchi per dare ai poveri',
        headquarters: 'Foresta di Sherwood',
        leader: 'Robin di Locksley',
        resources: {
          gold: 1000,
          members: 60,
          hideouts: 5,
          supporters: 200
        },
        relations: {
          nobiltà: -80,
          chiesa_calendaria: -30,
          popolo: 90,
          guardie: -100
        },
        benefits: {
          member: 'Rifugio nella foresta, addestramento arceria',
          allied: 'Aiuto contro oppressori, parte del bottino',
          honored: 'Leggenda vivente, comando banda'
        },
        quests: [
          'Derubare esattori',
          'Liberare prigionieri',
          'Distribuire cibo ai poveri',
          'Tendere imboscate a nobili'
        ],
        ranks: [
          { level: 0, title: 'Simpatizzante', minRep: 0 },
          { level: 1, title: 'Brigante', minRep: 10 },
          { level: 2, title: 'Fuorilegge', minRep: 25 },
          { level: 3, title: 'Luogotenente', minRep: 50 },
          { level: 4, title: 'Capo Brigante', minRep: 100 }
        ]
      },

      // FAZIONI MAGICHE
      congrega_streghe: {
        name: 'Congrega delle Streghe',
        type: 'magica',
        icon: 'icons/magic/symbols/pentagram-glowing-purple.webp',
        alignment: 'chaotic',
        power: 6,
        influence: 'segreta',
        description: 'Rete segreta di streghe e stregoni',
        headquarters: 'Vari covi nascosti',
        leader: 'La Megera Suprema',
        resources: {
          gold: 3000,
          members: 50,
          covens: 10,
          familiars: 50,
          grimoires: 20
        },
        relations: {
          chiesa_calendaria: -100,
          benandanti: -100,
          popolo: -30,
          demoni: 50
        },
        benefits: {
          member: 'Insegnamenti magici, ingredienti rari',
          allied: 'Pozioni, maledizioni su commissione',
          honored: 'Iniziazione ai grandi misteri, famiglio'
        },
        quests: [
          'Procurare ingredienti rari',
          'Sabotare benedizioni',
          'Corrompere innocenti',
          'Evocare entità'
        ],
        ranks: [
          { level: 0, title: 'Novizio', minRep: 0 },
          { level: 1, title: 'Adepto', minRep: 20 },
          { level: 2, title: 'Strega/Stregone', minRep: 40 },
          { level: 3, title: 'Alto/a Strega/one', minRep: 80 },
          { level: 4, title: 'Arci-strega/one', minRep: 160 }
        ]
      }
    };

    // Relazioni tra fazioni
    this.factionRelations = new Map();
    this._initializeFactionRelations();

    // Reputazione dei PG con le fazioni
    this.characterReputations = new Map();

    // Non chiamare metodi privati nel constructor
  }

  /**
   * Metodo statico di inizializzazione completo
   * @static
   * @returns {void}
   */
  static initialize() {
    const startTime = performance.now();

    try {
      logger.info(this.MODULE_NAME, `Inizializzazione Factions System v${this.VERSION}`);

      // Creazione istanza globale
      const instance = new FactionsSystem();
      this._state.instance = instance;

      // Conta fazioni
      this._statistics.factionsCount = Object.keys(instance.factions).length;

      // Registrazione settings
      this.registerSettings();

      // Inizializza relazioni fazioni (metodo privato, già chiamato nel constructor)
      // instance._initializeFactionRelations(); // Già fatto nel constructor

      // Setup hooks
      instance._setupHooks(); // Fix: metodo corretto

      // Salva nell'oggetto globale
      if (!game.brancalonia) game.brancalonia = {};
      game.brancalonia.factionsSystem = instance;

      // Registrazione comandi chat
      this.registerChatCommands();

      // Estensione Actor per fazioni
      this.extendActor();

      // NON creare macro qui - game.user non è disponibile nell'hook init
      // Le macro saranno create nell'hook ready

      this._state.initialized = true;
      this._statistics.initTime = performance.now() - startTime;

      logger.info(
        this.MODULE_NAME,
        `✅ Inizializzazione completata in ${this._statistics.initTime.toFixed(2)}ms (${this._statistics.factionsCount} fazioni)`
      );

      // Emit event
      Hooks.callAll('factions:initialized', {
        version: this.VERSION,
        factionsCount: this._statistics.factionsCount,
        factions: Object.keys(instance.factions)
      });
    } catch (error) {
      this._statistics.errors.push(error.message);
      logger.error(this.MODULE_NAME, 'Errore durante inizializzazione', error);
      throw error;
    }
  }

  /**
   * Registra le impostazioni del modulo
   */
  static registerSettings() {
    game.settings.register('brancalonia-bigat', 'factionInfluence', {
      name: 'Influenza Fazioni',
      hint: 'Le fazioni influenzano prezzi, quest e interazioni',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'factionWars', {
      name: 'Guerre tra Fazioni',
      hint: 'Abilita conflitti dinamici tra fazioni',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'factionReputation', {
      name: 'Sistema Reputazione Fazioni',
      hint: 'Abilita sistema di reputazione avanzato con le fazioni',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
  }

  /**
   * Registra comandi chat
   */
  static registerChatCommands() {
    // Comando per gestire fazioni
    game.socket.on('system.brancalonia-bigat', (data) => {
      if (data.type === 'faction-command' && game.user.isGM) {
        const instance = game.brancalonia?.factionsSystem;
        if (instance) {
          switch (data.command) {
            case 'adjustRep':
              instance.adjustReputation(data.actor, data.faction, data.amount, data.options);
              break;
            case 'startWar':
              instance.startFactionWar(data.faction1, data.faction2, data.reason);
              break;
            case 'generateQuest':
              const quest = instance.generateFactionQuest(data.faction, data.difficulty);
              if (quest) {
                ChatMessage.create({
                  content: instance.formatQuestMessage(quest),
                  speaker: { alias: 'Fazioni' }
                });
              }
              break;
          }
        }
      }
    });

    // Comando testuale per fazioni
    if (game.modules.get('monk-enhanced-journal')?.active) {
      game.MonksEnhancedJournal?.registerChatCommand('/fazione', {
        name: 'Gestisci Fazioni',
        callback: (args) => {
          const instance = game.brancalonia?.factionsSystem;
          if (instance && game.user.isGM) {
            if (args[0] === 'rep' && args.length >= 4) {
              // /fazione rep @personaggio fazione_key +/-valore
              const actorName = args[1]?.replace('@', '');
              const factionKey = args[2];
              const amount = parseInt(args[3]);

              const actor = game?.actors?.find(a => a.name.toLowerCase().includes(actorName?.toLowerCase()));
              if (actor && instance.factions[factionKey]) {
                instance.adjustReputation(actor, factionKey, amount);
              } else {
                ui.notifications.error('Attore o fazione non trovati!');
              }
            } else {
              instance.renderFactionsManager();
            }
          }
        },
        help: 'Uso: /fazione [rep @personaggio fazione +/-valore] - Gestisce le fazioni'
      });
    }
  }

  /**
   * Crea macro automatiche
   */
  static createMacros() {
    if (!game.user.isGM) return;

    const macroData = {
      name: '🏰 Gestione Fazioni',
      type: 'script',
      img: 'icons/environment/settlement/castle.webp',
      command: `
const factionSystem = game.brancalonia?.factionsSystem;
if (factionSystem) {
  factionSystem.renderFactionsManager();
} else {
  ui.notifications.error("Sistema Fazioni non inizializzato!");
}
      `,
      folder: null,
      sort: 0,
      ownership: { default: 0, [game.user.id]: 3 },
      flags: { 'brancalonia-bigat': { 'auto-generated': true } }
    };

    // Controlla se esiste già
    const existing = game?.macros?.find(m => m.name === macroData.name);
    if (!existing) {
      Macro.create(macroData);
      this._statistics.macrosCreated++;
      logger.info(this.MODULE_NAME, '✅ Macro Fazioni creata');
    }
  }

  /**
   * Estende la classe Actor con metodi fazioni
   */
  static extendActor() {
    // Metodo per ottenere reputazione con una fazione
    Actor.prototype.getFactionReputation = function (factionKey) {
      const instance = game.brancalonia?.factionsSystem;
      if (instance) {
        return instance.getReputation(this, factionKey);
      }
      return 0;
    };

    // Metodo per unirsi a una fazione
    Actor.prototype.joinFaction = async function (factionKey) {
      const instance = game.brancalonia?.factionsSystem;
      if (instance && instance.factions[factionKey]) {
        await instance.adjustReputation(this, factionKey, 10);

        // Imposta fazione principale se non ce n'è una
        const currentFaction = this.flags.brancalonia?.primaryFaction;
        if (!currentFaction) {
          await this.setFlag('brancalonia-bigat', 'primaryFaction', factionKey);
        }

        return true;
      }
      return false;
    };

    // Metodo per abbandonare una fazione
    Actor.prototype.leaveFaction = async function (factionKey) {
      const instance = game.brancalonia?.factionsSystem;
      if (instance) {
        await instance.adjustReputation(this, factionKey, -25);

        // Rimuovi come fazione principale se lo è
        const currentFaction = this.flags.brancalonia?.primaryFaction;
        if (currentFaction === factionKey) {
          await this.unsetFlag('brancalonia-bigat', 'primaryFaction');
        }

        return true;
      }
      return false;
    };

    // Metodo per ottenere rango in una fazione
    Actor.prototype.getFactionRank = function (factionKey) {
      const instance = game.brancalonia?.factionsSystem;
      if (instance && instance.factions[factionKey]) {
        const reputation = instance.getReputation(this, factionKey);
        const faction = instance.factions[factionKey];
        return instance.getRank(faction, reputation);
      }
      return null;
    };
  }

  _initializeFactionRelations() {
    // Inizializza le relazioni tra tutte le fazioni
    for (const faction1 in this.factions) {
      for (const faction2 in this.factions) {
        if (faction1 !== faction2) {
          const key = [faction1, faction2].sort().join('-');
          if (!this.factionRelations.has(key)) {
            // Calcola relazione base
            const f1 = this.factions[faction1];
            const f2 = this.factions[faction2];
            let relation = 0;

            // Stessa tipologia = +20
            if (f1.type === f2.type) relation += 20;

            // Allineamenti opposti = -40
            if (f1.alignment && f2.alignment) {
              if (f1.alignment.includes('lawful') && f2.alignment.includes('chaotic')) {
                relation -= 40;
              }
              if (f1.alignment.includes('good') && f2.alignment.includes('evil')) {
                relation -= 40;
              }
            }

            // Relazioni predefinite
            if (f1.relations[faction2]) {
              relation = f1.relations[faction2];
            }

            this.factionRelations.set(key, relation);
          }
        }
      }
    }
  }

  _setupHooks() {
    // Hook per conseguenze azioni (usando hook ufficiale)
    Hooks.on('dnd5e.applyDamage', (target, damage, options) => {
      if (target.flags.brancalonia?.faction) {
        const attacker = options.attacker;
        if (attacker?.hasPlayerOwner) {
          // Attaccare membri di una fazione ha conseguenze
          this.adjustReputation(attacker, target.flags.brancalonia.faction, -5);
        }
      }
    });

    // Hook per trasferimento oggetti (hook standard Foundry)
    Hooks.on('preUpdateItem', (item, changes, options, userId) => {
      // Controlla se l'oggetto viene trasferito
      if (changes.parent && item.parent?.flags?.brancalonia?.faction === 'gilda_mercanti') {
        const newOwner = game.actors.get(changes.parent);
        if (newOwner?.hasPlayerOwner) {
          this.adjustReputation(newOwner, 'gilda_mercanti', 1);
        }
      }
    });

    // Hook per completamento chat messages (per quest)
    Hooks.on('createChatMessage', (message, options, userId) => {
      // Controlla se il messaggio indica completamento quest
      if (message.flags?.brancalonia?.questComplete) {
        const quest = message.flags.brancalonia.quest;
        const actor = game.actors.get(message.speaker.actor);
        if (quest?.faction && actor) {
          this.adjustReputation(actor, quest.faction, quest.reputationReward || 10);
        }
      }
    });

    // Hook per eventi temporali
    Hooks.on('timePassed', (worldTime, dt) => {
      if (dt >= 86400 && game.user.isGM) { // Ogni giorno (86400 secondi)
        this._dailyFactionEvents();
      }
    });

    // Hook per modifiche del mondo che influenzano le fazioni
    Hooks.on('updateScene', (scene, update, options, userId) => {
      if (update.flags?.brancalonia?.factionControl && game.user.isGM) {
        this._handleTerritorialChange(scene, update.flags.brancalonia.factionControl);
      }
    });
  }

  _registerSettings() {
    // Settings già registrate in registerSettings() statico
  }

  /**
   * Ottieni reputazione di un attore con una fazione
   */
  getReputation(actor, factionKey) {
    const key = `${actor.id}-${factionKey}`;
    return this.characterReputations.get(key) || 0;
  }

  /**
   * Aggiusta reputazione con una fazione
   * @async
   * @param {Actor} actor - Attore
   * @param {string} factionKey - Chiave fazione
   * @param {number} amount - Ammontare cambio reputazione
   * @param {Object} options - Opzioni
   * @param {boolean} options.cascade - Effetti cascata (default true)
   * @returns {Promise<void>}
   *
   * @example
   * await factionsSystem.adjustReputation(actor, 'chiesa_calendaria', 10);
   */
  async adjustReputation(actor, factionKey, amount, options = {}) {
    const repStart = performance.now();

    try {
      const faction = this.factions[factionKey];
      if (!faction) {
        ui.notifications.error(`Fazione ${factionKey} non trovata!`);
        logger.warn(FactionsSystem.MODULE_NAME, `Fazione non valida: ${factionKey}`);
        return;
      }

      const key = `${actor.id}-${factionKey}`;
      const currentRep = this.characterReputations.get(key) || 0;
      const newRep = Math.max(-100, Math.min(300, currentRep + amount));

      this.characterReputations.set(key, newRep);

      // Salva nel flag dell'attore
      const factionReps = actor.flags.brancalonia?.factionReputations || {};
      factionReps[factionKey] = newRep;
      await actor.setFlag('brancalonia-bigat', 'factionReputations', factionReps);

      // Controlla cambio rango
      const oldRank = this._getRank(faction, currentRep);
      const newRank = this._getRank(faction, newRep);

      // Notifica
      const emoji = amount > 0 ? '📈' : '📉';
      ChatMessage.create({
        content: `
          <div class="brancalonia-faction-rep">
            <h3>${emoji} Reputazione ${faction.name}</h3>
            <p><strong>${actor.name}:</strong> ${amount > 0 ? '+' : ''}${amount} punti</p>
            <p>Reputazione attuale: ${newRep}</p>
            ${oldRank.level !== newRank.level ? `
              <p class="rank-change">
                <strong>Nuovo Rango:</strong> ${newRank.title}
              </p>
            ` : ''}
          </div>
        `,
        speaker: ChatMessage.getSpeaker({ actor })
      });

      // Applica effetti del nuovo rango
      if (oldRank.level < newRank.level) {
        await this._applyRankBenefits(actor, faction, newRank);
        FactionsSystem._statistics.ranksGained++;
      } else if (oldRank.level > newRank.level) {
        await this._removeRankBenefits(actor, faction, oldRank);
        FactionsSystem._statistics.ranksLost++;
      }

      // Effetti a catena su altre fazioni
      if (options.cascade !== false) {
        await this._cascadeReputationEffects(actor, factionKey, amount);
      }

      // Aggiorna statistiche
      FactionsSystem._statistics.reputationChanges++;
      FactionsSystem._statistics.reputationByFaction[factionKey]++;

      const repTime = performance.now() - repStart;
      logger.info(
        FactionsSystem.MODULE_NAME,
        `Reputazione aggiornata: ${actor.name} con ${faction.name} (${amount > 0 ? '+' : ''}${amount}) -> ${newRep} (${repTime.toFixed(2)}ms)`
      );

      // Emit event
      Hooks.callAll('factions:reputation-changed', {
        actor: actor.name,
        faction: faction.name,
        factionKey,
        oldRep: currentRep,
        newRep,
        amount,
        oldRank: oldRank.title,
        newRank: newRank.title,
        rankChanged: oldRank.level !== newRank.level
      });
    } catch (error) {
      FactionsSystem._statistics.errors.push(`adjustReputation: ${error.message}`);
      logger.error(FactionsSystem.MODULE_NAME, 'Errore aggiornamento reputazione', error);
      ui.notifications.error('Errore nell\'aggiornamento della reputazione!');
    }
  }

  /**
   * Ottieni rango in una fazione
   */
  _getRank(faction, reputation) {
    let currentRank = faction.ranks[0];

    for (const rank of faction.ranks) {
      if (reputation >= rank.minRep) {
        currentRank = rank;
      }
    }

    return currentRank;
  }

  /**
   * Applica benefici del rango
   */
  async _applyRankBenefits(actor, faction, rank) {
    // Crea item per rappresentare il rango
    const rankItem = {
      name: `${faction.name}: ${rank.title}`,
      type: 'feat',
      img: faction.icon,
      system: {
        description: {
          value: `
            <h3>Rango ${rank.level}: ${rank.title}</h3>
            <p><strong>Fazione:</strong> ${faction.name}</p>
            <p><strong>Benefici:</strong></p>
            <ul>
              ${rank.level >= 1 ? `<li>${faction.benefits.member}</li>` : ''}
              ${rank.level >= 3 ? `<li>${faction.benefits.allied}</li>` : ''}
              ${rank.level >= 5 ? `<li>${faction.benefits.honored}</li>` : ''}
            </ul>
          `
        },
        source: 'Brancalonia'
      },
      flags: {
        brancalonia: {
          isFactionRank: true,
          faction: faction.name,
          rank: rank.level
        }
      }
    };

    await actor.createEmbeddedDocuments('Item', [rankItem]);
  }

  /**
   * Rimuovi benefici del rango
   */
  async _removeRankBenefits(actor, faction, oldRank) {
    const items = actor.items.filter(i =>
      i.flags.brancalonia?.isFactionRank &&
      i.flags.brancalonia?.faction === faction.name
    );

    for (const item of items) {
      await item.delete();
    }
  }

  /**
   * Effetti a catena sulla reputazione
   */
  async _cascadeReputationEffects(actor, factionKey, amount) {
    const faction = this.factions[factionKey];

    // Effetti su fazioni alleate/nemiche
    for (const [otherFaction, relation] of Object.entries(faction.relations)) {
      if (this.factions[otherFaction]) {
        let cascadeAmount = 0;

        if (relation >= 50) {
          // Alleati: +25% dell'effetto
          cascadeAmount = Math.floor(amount * 0.25);
        } else if (relation <= -50) {
          // Nemici: -50% dell'effetto
          cascadeAmount = Math.floor(amount * -0.5);
        }

        if (cascadeAmount !== 0) {
          await this.adjustReputation(actor, otherFaction, cascadeAmount, {
            cascade: false
          });
        }
      }
    }
  }

  /**
   * Genera missione per una fazione
   */
  generateFactionQuest(factionKey, difficulty = 'medium') {
    const faction = this.factions[factionKey];
    if (!faction) return null;

    const questType = faction.quests[Math.floor(Math.random() * faction.quests.length)];

    const difficultyModifiers = {
      easy: { dc: 10, reward: 5, gold: 50 },
      medium: { dc: 13, reward: 10, gold: 100 },
      hard: { dc: 16, reward: 20, gold: 250 },
      deadly: { dc: 20, reward: 40, gold: 500 }
    };

    const mod = difficultyModifiers[difficulty];

    const quest = {
      name: `${faction.name}: ${questType}`,
      faction: factionKey,
      type: questType,
      difficulty,
      dc: mod.dc,
      description: this._generateQuestDescription(faction, questType),
      objectives: this._generateQuestObjectives(questType),
      rewards: {
        reputation: mod.reward,
        gold: mod.gold + Math.floor(Math.random() * mod.gold),
        special: this._generateSpecialReward(faction, difficulty)
      },
      consequences: {
        success: `+${mod.reward} reputazione con ${faction.name}`,
        failure: `-${Math.floor(mod.reward / 2)} reputazione con ${faction.name}`
      }
    };

    return quest;
  }

  _generateQuestDescription(faction, questType) {
    const descriptions = {
      'Recuperare reliquie sacre': `La ${faction.name} richiede il recupero di una reliquia sacra rubata da eretici.`,
      'Eliminare eretici': `Un gruppo di eretici sta corrompendo i fedeli. La ${faction.name} vuole che siano fermati.`,
      'Cacciare mostri': `Un terribile mostro minaccia i territori protetti dalla ${faction.name}.`,
      'Scortare carovane': `Una carovana importante della ${faction.name} necessita protezione.`,
      'Assassinii mirati': `La ${faction.name} vuole eliminare discretamente un nemico.`,
      'Contrabbando merci': `Merci preziose devono essere contrabbandate oltre i confini.`
    };

    return descriptions[questType] || `La ${faction.name} richiede assistenza per ${questType}.`;
  }

  _generateQuestObjectives(questType) {
    const objectivesMap = {
      'Recuperare reliquie sacre': [
        'Localizzare la reliquia',
        'Infiltrarsi nel nascondiglio',
        "Recuperare l'oggetto",
        'Riportarlo intatto'
      ],
      'Eliminare eretici': [
        'Identificare il leader',
        'Trovare il loro covo',
        'Eliminarli o catturarli',
        'Distruggere i loro scritti'
      ],
      'Cacciare mostri': [
        'Rintracciare il mostro',
        'Studiarne le debolezze',
        'Affrontarlo',
        "Portare prova dell'uccisione"
      ],
      default: [
        'Accettare la missione',
        "Completare l'obiettivo",
        'Riportare alla fazione'
      ]
    };

    return objectivesMap[questType] || objectivesMap.default;
  }

  _generateSpecialReward(faction, difficulty) {
    const rewards = {
      easy: ['Lettera di raccomandazione', 'Sconto servizi fazione'],
      medium: ['Oggetto benedetto', 'Contatto importante', 'Accesso area ristretta'],
      hard: ['Oggetto magico minore', 'Titolo onorario', 'Proprietà piccola'],
      deadly: ['Oggetto magico raro', 'Posizione nella fazione', 'Feudo o territorio']
    };

    const pool = rewards[difficulty];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Inizia una guerra tra fazioni
   */
  async startFactionWar(faction1Key, faction2Key, reason = 'Dispute territoriali') {
    if (!game.settings.get('brancalonia-bigat', 'factionWars')) return;

    const f1 = this.factions[faction1Key];
    const f2 = this.factions[faction2Key];

    if (!f1 || !f2) return;

    // Calcola forza relativa
    const f1Strength = f1.power + (f1.resources.troops || 0) / 50;
    const f2Strength = f2.power + (f2.resources.troops || 0) / 50;

    // Imposta stato di guerra
    const warKey = [faction1Key, faction2Key].sort().join('-');
    const warData = {
      factions: [faction1Key, faction2Key],
      reason,
      startTime: game.time.worldTime,
      strength: {
        [faction1Key]: f1Strength,
        [faction2Key]: f2Strength
      },
      battles: [],
      status: 'active'
    };

    await game.settings.set('brancalonia-bigat', `war-${warKey}`, warData);

    // Annuncio
    ChatMessage.create({
      content: `
        <div class="brancalonia-faction-war">
          <h2>⚔️ GUERRA TRA FAZIONI! ⚔️</h2>
          <p><strong>${f1.name}</strong> VS <strong>${f2.name}</strong></p>
          <p>Motivo: ${reason}</p>
          <p>Forze in campo:</p>
          <ul>
            <li>${f1.name}: ${f1.resources.troops || 0} truppe</li>
            <li>${f2.name}: ${f2.resources.troops || 0} truppe</li>
          </ul>
        </div>
      `,
      speaker: { alias: 'Eventi del Regno' }
    });

    // Effetti sulla reputazione dei PG
    game.actors.filter(a => a.hasPlayerOwner).forEach(actor => {
      const rep1 = this.getReputation(actor, faction1Key);
      const rep2 = this.getReputation(actor, faction2Key);

      if (rep1 > 50 && rep2 > 50) {
        ChatMessage.create({
          content: `${actor.name} deve scegliere da che parte stare!`,
          whisper: [actor.owner]
        });
      }
    });
  }

  /**
   * Risolvi battaglia tra fazioni
   */
  async resolveFactionBattle(faction1Key, faction2Key) {
    const f1 = this.factions[faction1Key];
    const f2 = this.factions[faction2Key];

    // Tiri contrapposti con modificatori
    const f1Roll = await new Roll(`1d20 + ${f1.power}`).evaluate();
    const f2Roll = await new Roll(`1d20 + ${f2.power}`).evaluate();

    const winner = f1Roll.total > f2Roll.total ? f1 : f2;
    const loser = winner === f1 ? f2 : f1;

    // Perdite
    const winnerLosses = Math.floor(Math.random() * 20 + 10);
    const loserLosses = Math.floor(Math.random() * 40 + 20);

    // Aggiorna risorse
    if (winner.resources.troops) {
      winner.resources.troops -= winnerLosses;
    }
    if (loser.resources.troops) {
      loser.resources.troops -= loserLosses;
    }

    ChatMessage.create({
      content: `
        <div class="brancalonia-battle-result">
          <h3>⚔️ Risultato Battaglia</h3>
          <p><strong>Vincitore:</strong> ${winner.name}</p>
          <p><strong>Perdite:</strong></p>
          <ul>
            <li>${winner.name}: ${winnerLosses} truppe</li>
            <li>${loser.name}: ${loserLosses} truppe</li>
          </ul>
        </div>
      `
    });
  }

  /**
   * Eventi giornalieri delle fazioni
   */
  async _dailyFactionEvents() {
    // Controllo guerre attive
    const settings = game.settings.storage.get('world') || {};
    const wars = Object.keys(settings)
      .filter(key => key.startsWith('brancalonia-bigat.war-'))
      .map(key => settings[key]);

    for (const war of wars) {
      if (war.status === 'active') {
        // 20% chance di battaglia ogni giorno
        if (Math.random() < 0.2) {
          this.resolveFactionBattle(war.factions[0], war.factions[1]);
        }
      }
    }

    // Eventi casuali fazioni
    if (Math.random() < 0.1) { // 10% al giorno
      this._generateRandomFactionEvent();
    }
  }

  /**
   * Genera evento casuale fazione
   */
  _generateRandomFactionEvent() {
    const factionKeys = Object.keys(this.factions);
    const randomFactionKey = factionKeys[Math.floor(Math.random() * factionKeys.length)];
    const faction = this.factions[randomFactionKey];

    const events = [
      `La ${faction.name} annuncia nuove alleanze commerciali`,
      `Tensioni crescenti tra la ${faction.name} e i suoi rivali`,
      `La ${faction.name} lancia una nuova campagna di reclutamento`,
      `Scandalo nella ${faction.name}: il leader è sotto accusa`,
      `La ${faction.name} ottiene una vittoria diplomatica importante`
    ];

    const event = events[Math.floor(Math.random() * events.length)];

    ChatMessage.create({
      content: `
        <div class="brancalonia-faction-event">
          <h3>📰 Notizie dal Regno</h3>
          <p>${event}</p>
        </div>
      `,
      speaker: { alias: 'Cronache del Regno' }
    });
  }

  /**
   * Gestisce cambio controllo territoriale
   */
  _handleTerritorialChange(scene, factionControl) {
    const oldFaction = scene.flags?.brancalonia?.factionControl?.current;
    const newFaction = factionControl.current;

    if (oldFaction && oldFaction !== newFaction) {
      ChatMessage.create({
        content: `
          <div class="brancalonia-territory-change">
            <h3>🏴 Cambio di Controllo Territoriale</h3>
            <p><strong>${scene.name}</strong> ora è controllata da <strong>${this.factions[newFaction]?.name || newFaction}</strong></p>
            <p>Precedentemente controllata da: ${this.factions[oldFaction]?.name || oldFaction}</p>
          </div>
        `,
        speaker: { alias: 'Eventi del Regno' }
      });
    }
  }

  /**
   * Formatta messaggio quest
   */
  _formatQuestMessage(quest) {
    return `
      <div class="brancalonia-faction-quest">
        <h3>📜 ${quest.name}</h3>
        <p>${quest.description}</p>
        <p><strong>Obiettivi:</strong></p>
        <ul>
          ${quest.objectives.map(o => `<li>${o}</li>`).join('')}
        </ul>
        <p><strong>Ricompense:</strong></p>
        <ul>
          <li>Reputazione: +${quest.rewards.reputation}</li>
          <li>Oro: ${quest.rewards.gold} ducati</li>
          <li>Speciale: ${quest.rewards.special}</li>
        </ul>
      </div>
    `;
  }

  /**
   * UI per gestione fazioni
   */
  renderFactionsManager(actor = null) {
    const content = `
      <div class="brancalonia-factions-manager">
        <h2>🏰 Gestione Fazioni</h2>

        ${actor ? `
          <div class="character-reputations">
            <h3>Reputazioni di ${actor.name}</h3>
            <table>
              <thead>
                <tr>
                  <th>Fazione</th>
                  <th>Reputazione</th>
                  <th>Rango</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(this.factions).map(([key, faction]) => {
    const rep = this.getReputation(actor, key);
    const rank = this._getRank(faction, rep);
    return `
                    <tr>
                      <td>
                        <img src="${faction.icon}" width="20" height="20">
                        ${faction.name}
                      </td>
                      <td>${rep}</td>
                      <td>${rank.title}</td>
                      <td>
                        <button class="adjust-rep" data-faction="${key}" data-amount="5">+5</button>
                        <button class="adjust-rep" data-faction="${key}" data-amount="-5">-5</button>
                      </td>
                    </tr>
                  `;
  }).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <div class="faction-overview">
          <h3>Panoramica Fazioni</h3>
          <div class="faction-grid">
            ${Object.entries(this.factions).map(([key, faction]) => `
              <div class="faction-card" data-faction="${key}">
                <img src="${faction.icon}" title="${faction.name}">
                <h4>${faction.name}</h4>
                <p>Potere: ${faction.power}/10</p>
                <p>Tipo: ${faction.type}</p>
                <button class="generate-quest" data-faction="${key}">Genera Missione</button>
                <button class="faction-info" data-faction="${key}">Info Dettagliate</button>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="faction-wars">
          <h3>Guerre tra Fazioni</h3>
          <button id="start-war">Inizia Guerra</button>
          <button id="view-wars">Visualizza Guerre Attive</button>
        </div>
      </div>
    `;

    const dialog = new foundry.appv1.sheets.Dialog({
      title: 'Gestione Fazioni',
      content,
      buttons: {
        close: { label: 'Chiudi' }
      },
      render: html => {
        if (actor) {
          html.find('.adjust-rep').click(ev => {
            const faction = ev.currentTarget.dataset.faction;
            const amount = parseInt(ev.currentTarget.dataset.amount);
            this.adjustReputation(actor, faction, amount);
            dialog.close();
            this.renderFactionsManager(actor); // Riapri aggiornato
          });
        }

        html.find('.generate-quest').click(ev => {
          const faction = ev.currentTarget.dataset.faction;
          const quest = this.generateFactionQuest(faction, 'medium');

          if (quest) {
            ChatMessage.create({
              content: this._formatQuestMessage(quest),
              speaker: { alias: 'Fazioni' }
            });
          }
        });

        html.find('.faction-info').click(ev => {
          const factionKey = ev.currentTarget.dataset.faction;
          const faction = this.factions[factionKey];

          new foundry.appv1.sheets.Dialog({
            title: `${faction.name} - Informazioni Dettagliate`,
            content: `
              <div class="faction-details">
                <h3>${faction.name}</h3>
                <img src="${faction.icon}" style="width: 64px; height: 64px; float: right;">
                <p><strong>Tipo:</strong> ${faction.type}</p>
                <p><strong>Allineamento:</strong> ${faction.alignment}</p>
                <p><strong>Potere:</strong> ${faction.power}/10</p>
                <p><strong>Influenza:</strong> ${faction.influence}</p>
                <p><strong>Quartier Generale:</strong> ${faction.headquarters}</p>
                <p><strong>Leader:</strong> ${faction.leader}</p>
                <p><strong>Descrizione:</strong> ${faction.description}</p>

                <h4>Risorse:</h4>
                <ul>
                  ${Object.entries(faction.resources).map(([key, value]) => `
                    <li>${key}: ${value}</li>
                  `).join('')}
                </ul>

                <h4>Benefici Membri:</h4>
                <ul>
                  <li><strong>Membro:</strong> ${faction.benefits.member}</li>
                  <li><strong>Alleato:</strong> ${faction.benefits.allied}</li>
                  <li><strong>Onorato:</strong> ${faction.benefits.honored}</li>
                </ul>

                <h4>Missioni Tipiche:</h4>
                <ul>
                  ${faction.quests.map(quest => `<li>${quest}</li>`).join('')}
                </ul>
              </div>
            `,
            buttons: { close: { label: 'Chiudi' } }
          }).render(true);
        });

        html.find('#start-war').click(() => {
          this._showWarDialog();
        });

        html.find('#view-wars').click(() => {
          this._showActiveWarsDialog();
        });
      }
    });

    dialog.render(true);
  }

  _showWarDialog() {
    const content = `
      <div class="faction-war-setup">
        <div class="form-group">
          <label>Fazione 1:</label>
          <select id="faction1">
            ${Object.entries(this.factions).map(([key, f]) =>
    `<option value="${key}">${f.name}</option>`
  ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Fazione 2:</label>
          <select id="faction2">
            ${Object.entries(this.factions).map(([key, f]) =>
    `<option value="${key}">${f.name}</option>`
  ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Motivo:</label>
          <input type="text" id="reason" value="Dispute territoriali">
        </div>
      </div>
    `;

    new foundry.appv1.sheets.Dialog({
      title: 'Inizia Guerra tra Fazioni',
      content,
      buttons: {
        start: {
          label: 'Inizia Guerra',
          callback: html => {
            const f1 = html.find('#faction1').val();
            const f2 = html.find('#faction2').val();
            const reason = html.find('#reason').val();
            this.startFactionWar(f1, f2, reason);
          }
        },
        cancel: { label: 'Annulla' }
      }
    }).render(true);
  }

  _showActiveWarsDialog() {
    const settings = game.settings.storage.get('world') || {};
    const wars = Object.entries(settings)
      .filter(([key, value]) => key.startsWith('brancalonia-bigat.war-'))
      .map(([key, war]) => ({ key, ...war }));

    const content = `
      <div class="active-wars">
        <h3>Guerre Attive</h3>
        ${wars.length > 0 ?
    wars.map(war => `
            <div class="war-entry">
              <h4>${this.factions[war.factions[0]]?.name} vs ${this.factions[war.factions[1]]?.name}</h4>
              <p><strong>Motivo:</strong> ${war.reason}</p>
              <p><strong>Durata:</strong> ${Math.floor((game.time.worldTime - war.startTime) / 86400)} giorni</p>
              <p><strong>Battaglie:</strong> ${war.battles?.length || 0}</p>
              <button class="end-war" data-key="${war.key}">Termina Guerra</button>
            </div>
          `).join('') :
    '<p>Nessuna guerra attiva</p>'
}
      </div>
    `;

    new foundry.appv1.sheets.Dialog({
      title: 'Guerre Attive',
      content,
      buttons: { close: { label: 'Chiudi' } },
      render: html => {
        html.find('.end-war').click(async (ev) => {
          const warKey = ev.currentTarget.dataset.key;
          await game.settings.set('brancalonia-bigat', warKey.replace('brancalonia-bigat.', ''), null);
          ui.notifications.info('Guerra terminata');
          ev.currentTarget.closest('.war-entry').remove();
        });
      }
    }).render(true);
  }
}

// Registra classe globale
window.FactionsSystem = FactionsSystem;

// Auto-inizializzazione - migrato a init per garantire disponibilità
Hooks.once('init', () => {
  try {
    logger.info(FactionsSystem.MODULE_NAME, `🎮 Brancalonia | Inizializzazione ${FactionsSystem.MODULE_NAME} v${FactionsSystem.VERSION}`);
    FactionsSystem.initialize();
  } catch (error) {
    logger.error(FactionsSystem.MODULE_NAME, 'Errore inizializzazione hook init', error);
  }
});

// Hook per creazione macro (dopo che game.user è disponibile)
Hooks.once('ready', () => {
  FactionsSystem.createMacros();
});

// Hook per integrazione con schede
Hooks.on('renderActorSheet', (app, html, data) => {
  if (!game.user.isGM) return;

  const actor = app.actor;
  if (actor.type !== 'character' && actor.type !== 'npc') return;

  // Aggiungi sezione fazioni
  const factionSection = $(`
    <div class="form-group">
      <label>Gestione Fazioni</label>
      <div class="form-fields">
        <button type="button" class="manage-factions">
          <i class="fas fa-users"></i> Gestisci Fazioni
        </button>
        <button type="button" class="view-faction-status">
          <i class="fas fa-flag"></i> Status Fazioni
        </button>
      </div>
    </div>
  `);

  html.find('.tab.details .form-group').last().after(factionSection);

  factionSection.find('.manage-factions').click(() => {
    const instance = game.brancalonia?.factionsSystem;
    if (instance) {
      instance.renderFactionsManager(actor);
    }
  });

  factionSection.find('.view-faction-status').click(() => {
    const instance = game.brancalonia?.factionsSystem;
    if (instance) {
      const primaryFaction = actor.flags.brancalonia?.primaryFaction;
      const reputations = actor.flags.brancalonia?.factionReputations || {};

      const content = `
        <div class="faction-status">
          <h3>Status Fazioni - ${actor.name}</h3>
          ${primaryFaction ? `
            <p><strong>Fazione Principale:</strong> ${instance.factions[primaryFaction]?.name || primaryFaction}</p>
          ` : '<p><em>Nessuna fazione principale</em></p>'}

          <h4>Reputazioni:</h4>
          <table style="width: 100%;">
            <thead>
              <tr><th>Fazione</th><th>Reputazione</th><th>Rango</th></tr>
            </thead>
            <tbody>
              ${Object.entries(reputations)
    .filter(([key, rep]) => rep !== 0)
    .map(([key, rep]) => {
      const faction = instance.factions[key];
      const rank = faction ? instance.getRank(faction, rep) : null;
      return `
                    <tr>
                      <td>${faction?.name || key}</td>
                      <td>${rep}</td>
                      <td>${rank?.title || 'N/A'}</td>
                    </tr>
                  `;
    }).join('') || '<tr><td colspan="3"><em>Nessuna reputazione</em></td></tr>'}
            </tbody>
          </table>
        </div>
      `;

      new foundry.appv1.sheets.Dialog({
        title: `Status Fazioni - ${actor.name}`,
        content,
        buttons: { close: { label: 'Chiudi' } }
      }).render(true);
    }
  });
});

// ================================================
// PUBLIC API
// ================================================

/**
 * Ottiene lo stato del modulo
 * @static
 * @returns {Object} Stato corrente
 * @example
 * const status = FactionsSystem.getStatus();
 */
FactionsSystem.getStatus = function() {
  return {
    version: this.VERSION,
    initialized: this._state.initialized,
    factionsCount: this._statistics.factionsCount,
    reputationChanges: this._statistics.reputationChanges,
    ranksGained: this._statistics.ranksGained,
    activeWars: this._state.activeWars.size
  };
};

/**
 * Ottiene le statistiche del modulo
 * @static
 * @returns {FactionStatistics} Statistiche correnti
 * @example
 * const stats = FactionsSystem.getStatistics();
 */
FactionsSystem.getStatistics = function() {
  return {
    ...this._statistics,
    reputationByFaction: { ...this._statistics.reputationByFaction },
    errors: [...this._statistics.errors]
  };
};

/**
 * Resetta le statistiche
 * @static
 * @example
 * FactionsSystem.resetStatistics();
 */
FactionsSystem.resetStatistics = function() {
  logger.info(this.MODULE_NAME, 'Reset statistiche Factions System');

  const initTime = this._statistics.initTime;
  const factionsCount = this._statistics.factionsCount;
  const macrosCreated = this._statistics.macrosCreated;

  this._statistics = {
    initTime,
    reputationChanges: 0,
    reputationByFaction: {},
    ranksGained: 0,
    ranksLost: 0,
    benefitsApplied: 0,
    benefitsRemoved: 0,
    warsStarted: 0,
    battlesResolved: 0,
    dailyEvents: 0,
    cascadeEffects: 0,
    allianceChanges: 0,
    rivalryChanges: 0,
    factionsCount,
    activeMembers: 0,
    activeMemberships: 0,
    macrosCreated,
    chatCommandsExecuted: 0,
    errors: []
  };

  // Re-inizializza contatori per fazione
  if (this._state.instance) {
    Object.keys(this._state.instance.factions).forEach(faction => {
      this._statistics.reputationByFaction[faction] = 0;
    });
  }
};

/**
 * Ottiene lista fazioni disponibili
 * @static
 * @returns {Object} Database fazioni
 * @example
 * const factions = FactionsSystem.getFactionsList();
 */
FactionsSystem.getFactionsList = function() {
  return this._state.instance?.factions || {};
};

/**
 * Ottiene fazioni per tipo
 * @static
 * @param {string} type - Tipo (religiosa, militare, politica, criminale, commerciale, magica, popolare)
 * @returns {Object[]} Fazioni filtrate
 * @example
 * const religious = FactionsSystem.getFactionsByType('religiosa');
 */
FactionsSystem.getFactionsByType = function(type) {
  const factions = this._state.instance?.factions || {};
  return Object.entries(factions)
    .filter(([_, f]) => f.type === type)
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});
};

/**
 * Ottiene reputazione attore con fazione
 * @static
 * @param {Actor} actor - Attore
 * @param {string} factionKey - Chiave fazione
 * @returns {number} Reputazione
 * @example
 * const rep = FactionsSystem.getActorReputation(actor, 'chiesa_calendaria');
 */
FactionsSystem.getActorReputation = function(actor, factionKey) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return 0;
  }
  return this._state.instance.getReputation(actor, factionKey);
};

/**
 * Aggiusta reputazione via API statica
 * @static
 * @async
 * @param {Actor} actor - Attore
 * @param {string} factionKey - Chiave fazione
 * @param {number} amount - Ammontare cambio
 * @param {Object} options - Opzioni
 * @returns {Promise<void>}
 * @example
 * await FactionsSystem.adjustReputationViaAPI(actor, 'chiesa_calendaria', 10);
 */
FactionsSystem.adjustReputationViaAPI = async function(actor, factionKey, amount, options) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return;
  }
  return await this._state.instance.adjustReputation(actor, factionKey, amount, options);
};

/**
 * Inizia guerra tra fazioni via API statica
 * @static
 * @async
 * @param {string} faction1Key - Chiave fazione 1
 * @param {string} faction2Key - Chiave fazione 2
 * @param {string} reason - Motivo guerra
 * @returns {Promise<void>}
 * @example
 * await FactionsSystem.startWarViaAPI('chiesa_calendaria', 'eretici', 'Eresia');
 */
FactionsSystem.startWarViaAPI = async function(faction1Key, faction2Key, reason) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return;
  }
  return await this._state.instance.startFactionWar(faction1Key, faction2Key, reason);
};

/**
 * Ottiene guerre attive
 * @static
 * @returns {Map} Mappa guerre attive
 * @example
 * const wars = FactionsSystem.getActiveWars();
 */
FactionsSystem.getActiveWars = function() {
  return this._state.activeWars;
};

/**
 * Mostra report completo
 * @static
 * @example
 * FactionsSystem.showReport();
 */
FactionsSystem.showReport = function() {
  const stats = this.getStatistics();
  const status = this.getStatus();

  console.group(`🏰 ${this.MODULE_NAME} Report v${this.VERSION}`);
  console.log('Status:', status);
  console.log('Statistiche:', stats);
  console.log('Guerre Attive:', Array.from(this._state.activeWars.keys()));
  console.groupEnd();

  ui.notifications.info(
    `🏰 Report Fazioni: ${stats.reputationChanges} cambi reputazione, ${stats.ranksGained} ranghi acquisiti, ${stats.warsStarted} guerre`
  );
};

// Export per compatibilità
if (typeof module !== 'undefined') {
  module.exports = FactionsSystem;
}

// Export ES6
export default FactionsSystem;
export { FactionsSystem };