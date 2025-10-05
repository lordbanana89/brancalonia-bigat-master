/**
 * @fileoverview Sistema Duelli Formali per Brancalonia
 *
 * Sistema completo di duelli d'onore, sfide e combattimenti rituali.
 * Supporta 5 tipi di duello, 9 stili di combattimento, mosse speciali,
 * codice d'onore, reputazione/infamia, e arena automatica.
 *
 * Features:
 * - 5 Tipi di Duello (Primo Sangue, Sottomissione, Morte, Incapacitazione, Campioni)
 * - 9 Stili di Combattimento
 * - 5 Mosse Speciali (Feinta, Disarmo, Parata, Stoccata, Provocazione)
 * - Sistema Honor Code con violazioni
 * - Sistema Reputazione/Infamia
 * - Arena automatica con scene
 * - Chat commands (/duello)
 * - Macro automatiche
 * - Statistiche duelli per attore
 * - 8 Hooks integration
 *
 * @version 3.0.0
 * @author Brancalonia Module Team
 * @requires brancalonia-logger.js
 * @requires dnd5e
 */

import { logger } from './brancalonia-logger.js';

/**
 * @typedef {Object} DuelingStatistics
 * @property {number} initTime - Tempo inizializzazione (ms)
 * @property {number} duelsStarted - Duelli iniziati totali
 * @property {Object<string, number>} duelsByType - Duelli per tipo
 * @property {number} duelsCompleted - Duelli completati
 * @property {number} duelsCanceled - Duelli cancellati
 * @property {number} specialMovesExecuted - Mosse speciali eseguite
 * @property {Object<string, number>} movesByType - Mosse per tipo
 * @property {number} honorViolations - Violazioni codice d'onore
 * @property {number} submissions - Arrese
 * @property {number} deaths - Morti in duello
 * @property {number} firstBloodVictories - Vittorie al primo sangue
 * @property {number} arenasCreated - Arene create
 * @property {number} macrosCreated - Macro create
 * @property {number} chatCommandsExecuted - Comandi chat eseguiti
 * @property {number} activeDuels - Duelli attivi correnti
 * @property {string[]} errors - Errori registrati
 */

/**
 * Sistema Duelli Formali per Brancalonia
 * Gestisce duelli d'onore, sfide e combattimenti rituali
 *
 * @class DuelingSystem
 */
class DuelingSystem {
  static VERSION = '3.0.0';
  static MODULE_NAME = 'DuelingSystem';
  static ID = 'dueling-system';

  /**
   * Statistiche del modulo
   * @type {DuelingStatistics}
   * @private
   * @static
   */
  static _statistics = {
    initTime: 0,
    duelsStarted: 0,
    duelsByType: {},
    duelsCompleted: 0,
    duelsCanceled: 0,
    specialMovesExecuted: 0,
    movesByType: {},
    honorViolations: 0,
    submissions: 0,
    deaths: 0,
    firstBloodVictories: 0,
    arenasCreated: 0,
    macrosCreated: 0,
    chatCommandsExecuted: 0,
    activeDuels: 0,
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
    activeDuels: new Map()
  };

  constructor() {
    // Fix: Definisci le proprietà PRIMA di usarle
    // Tipi di duello disponibili
    this.duelTypes = {
      primo_sangue: {
        name: 'Al Primo Sangue',
        img: 'icons/skills/wounds/blood-drip-red.webp',
        description: 'Il duello termina al primo colpo che causa danno',
        rules: {
          endCondition: 'first-blood',
          maxRounds: null,
          lethal: false,
          allowMagic: false,
          allowRanged: false
        },
        rewards: {
          winner: { infamy: -5, reputation: 10 },
          loser: { infamy: -2, reputation: -5 }
        }
      },

      sottomissione: {
        name: 'Alla Sottomissione',
        img: 'icons/skills/social/wave-halt-stop.webp',
        description: 'Il duello termina quando uno si arrende',
        rules: {
          endCondition: 'submission',
          maxRounds: 10,
          lethal: false,
          allowMagic: false,
          allowRanged: false
        },
        rewards: {
          winner: { infamy: -3, reputation: 15 },
          loser: { infamy: 0, reputation: -10 }
        }
      },

      morte: {
        name: "All'Ultimo Respiro",
        img: 'icons/magic/death/skull-humanoid-white.webp',
        description: 'Duello mortale fino alla fine',
        rules: {
          endCondition: 'death',
          maxRounds: null,
          lethal: true,
          allowMagic: true,
          allowRanged: false
        },
        rewards: {
          winner: { infamy: 20, reputation: 25 },
          loser: { infamy: 0, reputation: 0 } // Morto
        }
      },

      incapacitazione: {
        name: "All'Incapacitazione",
        img: 'icons/magic/control/debuff-energy-hold-yellow.webp',
        description: 'Il duello termina quando uno è reso incapace',
        rules: {
          endCondition: 'incapacitated',
          maxRounds: 15,
          lethal: false,
          allowMagic: true,
          allowRanged: false
        },
        rewards: {
          winner: { infamy: -5, reputation: 20 },
          loser: { infamy: 5, reputation: -15 }
        }
      },

      campione: {
        name: 'Duello dei Campioni',
        img: 'icons/equipment/chest/breastplate-armor-studded-yellow.webp',
        description: 'Duello formale con campioni che rappresentano le parti',
        rules: {
          endCondition: 'submission',
          maxRounds: 20,
          lethal: false,
          allowMagic: true,
          allowRanged: true,
          allowChampions: true
        },
        rewards: {
          winner: { infamy: -10, reputation: 30, gold: '2d10 * 10' },
          loser: { infamy: 10, reputation: -20, gold: '-1d10 * 10' }
        }
      },

      giudiziario: {
        name: 'Duello Giudiziario',
        img: 'icons/tools/instruments/scales-merchant-gray.webp',
        description: 'Duello per risolvere una disputa legale',
        rules: {
          endCondition: 'first-blood',
          maxRounds: 5,
          lethal: false,
          allowMagic: false,
          allowRanged: false,
          divineJudgment: true
        },
        rewards: {
          winner: { infamy: -15, reputation: 20, legalStatus: 'innocente' },
          loser: { infamy: 15, reputation: -10, legalStatus: 'colpevole' }
        }
      }
    };

    // Stili di combattimento
    this.fightingStyles = {
      aggressivo: {
        name: 'Stile Aggressivo',
        bonus: { attack: 2, damage: '1d4', ac: -2 },
        description: 'Attacchi furiosi ma difesa scoperta'
      },
      difensivo: {
        name: 'Stile Difensivo',
        bonus: { attack: -2, ac: 4, riposte: true },
        description: 'Difesa solida con contrattacchi'
      },
      equilibrato: {
        name: 'Stile Equilibrato',
        bonus: { attack: 0, ac: 1, initiative: 2 },
        description: 'Bilanciato tra attacco e difesa'
      },
      ingannevole: {
        name: 'Stile Ingannevole',
        bonus: { feint: true, advantage: '1/duel', disadvantageImpose: '1/duel' },
        description: 'Finte e trucchi'
      },
      brutale: {
        name: 'Stile Brutale',
        bonus: { damage: '2d4', attack: -1, intimidate: true },
        description: 'Colpi devastanti ma imprecisi'
      }
    };

    // Mosse speciali
    this.specialMoves = {
      disarmo: {
        name: 'Disarmo',
        dc: 14,
        cost: 'action',
        effect: 'Avversario disarmato per 1 round',
        requirements: 'Competenza arma'
      },
      finta: {
        name: 'Finta',
        dc: null,
        cost: 'bonus',
        effect: 'Prossimo attacco con vantaggio',
        requirements: 'Destrezza 13+'
      },
      provocazione: {
        name: 'Provocazione',
        dc: 12,
        cost: 'bonus',
        effect: 'Avversario ha svantaggio al prossimo attacco',
        requirements: 'Carisma 12+'
      },
      colpo_mirato: {
        name: 'Colpo Mirato',
        dc: null,
        cost: 'action',
        effect: 'Attacco -5, danno +10',
        requirements: 'BAB +5'
      },
      parata_riposte: {
        name: 'Parata e Riposte',
        dc: null,
        cost: 'reaction',
        effect: 'Se parata riesce, attacco immediato',
        requirements: 'Stile difensivo'
      }
    };

    // Stato duelli attivi
    this.activeDuels = new Map();

    // Inizializza contatori statistiche
    try {
      // Inizializza contatori per tipo duello
      Object.keys(this.duelTypes).forEach(type => {
        DuelingSystem._statistics.duelsByType[type] = 0;
      });

      // Inizializza contatori per mosse
      Object.keys(this.specialMoves).forEach(move => {
        DuelingSystem._statistics.movesByType[move] = 0;
      });
    } catch (error) {
      DuelingSystem._statistics.errors.push(`Constructor: ${error.message}`);
      logger.error(DuelingSystem.MODULE_NAME, 'Errore inizializzazione constructor', error);
    }

    // Non chiamare i metodi privati nel constructor
  }

  /**
   * Metodo statico di inizializzazione completo
   * @static
   * @returns {void}
   */
  static initialize() {
    const startTime = performance.now();

    try {
      logger.info(this.MODULE_NAME, `Inizializzazione Dueling System v${this.VERSION}`);

      // Creazione istanza globale
      const instance = new DuelingSystem();
      this._state.instance = instance;

      // Registrazione settings
      this.registerSettings();

      // Setup hooks
      instance._setupHooks(); // Fix: chiamato sull'istanza, non sulla classe statica

      // Salva nell'oggetto globale
      if (!game.brancalonia) game.brancalonia = {};
      game.brancalonia.duelingSystem = instance;

      // Registrazione comandi chat
      this.registerChatCommands();

      // Estensione Actor per duelli
      this.extendActor();

      this._state.initialized = true;
      this._statistics.initTime = performance.now() - startTime;

      logger.info(
        this.MODULE_NAME,
        `✅ Inizializzazione completata in ${this._statistics.initTime.toFixed(2)}ms`
      );

      // Emit event
      Hooks.callAll('dueling:initialized', {
        version: this.VERSION,
        duelTypes: Object.keys(instance.duelTypes).length,
        fightingStyles: Object.keys(instance.fightingStyles).length,
        specialMoves: Object.keys(instance.specialMoves).length
      });
    } catch (error) {
      this._statistics.errors.push(error.message);
      logger.error(this.MODULE_NAME, 'Errore durante inizializzazione', error);
      throw error;
    }
  }

  /**
   * Registra le impostazioni del modulo
   * @static
   * @returns {void}
   */
  static registerSettings() {
    try {
      game.settings.register('brancalonia-bigat', 'duelRules', {
      name: 'Regole Duelli',
      hint: 'Tipo di regole per i duelli',
      scope: 'world',
      config: true,
      type: String,
      choices: {
        strict: 'Rigorose (no magia, no ranged)',
        flexible: 'Flessibili (alcune eccezioni)',
        free: 'Libere (tutto permesso)'
      },
      default: 'strict'
    });

    game.settings.register('brancalonia-bigat', 'duelSpectators', {
      name: 'Spettatori nei Duelli',
      hint: 'Gli spettatori influenzano il duello',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

      game.settings.register('brancalonia-bigat', 'duelHonorCode', {
        name: "Codice d'Onore",
        hint: "Applica automaticamente penalità per violazioni del codice d'onore",
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      logger.debug?.(this.MODULE_NAME, '3 settings registrati');
    } catch (error) {
      this._statistics.errors.push(`Settings registration: ${error.message}`);
      logger.error(this.MODULE_NAME, 'Errore registrazione settings', error);
      throw error;
    }
  }

  /**
   * Registra comandi chat
   */
  static registerChatCommands() {
    // Comando per iniziare duello
    game.socket.on('system.brancalonia-bigat', (data) => {
      if (data.type === 'duel-command' && game.user.isGM) {
        const instance = game.brancalonia?.duelingSystem;
        if (instance) {
          switch (data.command) {
            case 'start':
              instance.startDuel(data.challenger, data.challenged, data.type, data.options);
              break;
            case 'end':
              instance.endDuel(data.duel, data.winner, data.reason);
              break;
            case 'move':
              instance.executeSpecialMove(data.actor, data.move, data.target);
              break;
          }
        }
      }
    });

    // Comando testuale per duelli
    if (game.modules.get('monk-enhanced-journal')?.active) {
      game.MonksEnhancedJournal?.registerChatCommand('/duello', {
        name: 'Gestisci Duelli',
        callback: (args) => {
          const instance = game.brancalonia?.duelingSystem;
          if (instance && game.user.isGM) {
            if (args[0] === 'sfida') {
              // /duello sfida @sfidante @sfidato tipo
              const challengerName = args[1]?.replace('@', '');
              const challengedName = args[2]?.replace('@', '');
              const duelType = args[3] || 'primo_sangue';

              const challenger = game?.actors?.find(a => a.name.toLowerCase().includes(challengerName?.toLowerCase()));
              const challenged = game?.actors?.find(a => a.name.toLowerCase().includes(challengedName?.toLowerCase()));

              if (challenger && challenged) {
                instance.startDuel(challenger, challenged, duelType);
              } else {
                ui.notifications.error('Personaggi non trovati!');
              }
            } else {
              instance.renderDuelManager();
            }
          }
        },
        help: 'Uso: /duello [sfida @sfidante @sfidato tipo] - Gestisce i duelli'
      });
    }
  }

  /**
   * Crea macro automatiche
   */
  static createMacros() {
    if (!game.user.isGM) return;

    const macroData = {
      name: '⚔️ Gestione Duelli',
      type: 'script',
      img: 'icons/skills/melee/swords-crossed-silver.webp',
      command: `
const duelSystem = game.brancalonia?.duelingSystem;
if (duelSystem) {
  duelSystem.renderDuelManager();
} else {
  ui.notifications.error("Sistema Duelli non inizializzato!");
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
      console.log('✅ Macro Duelli creata');
    }
  }

  /**
   * Estende la classe Actor con metodi duello
   */
  static extendActor() {
    // Metodo per sfidare a duello
    Actor.prototype.challengeToDuel = async function (opponent, duelType = 'primo_sangue', options = {}) {
      const instance = game.brancalonia?.duelingSystem;
      if (instance) {
        return await instance.startDuel(this, opponent, duelType, options);
      }
    };

    // Metodo per calcolare modificatore duello
    Actor.prototype.getDuelModifier = function (style = 'equilibrato') {
      const instance = game.brancalonia?.duelingSystem;
      if (!instance) return 0;

      const fightingStyle = instance.fightingStyles[style];
      let modifier = 0;

      // Bonus da stile
      if (fightingStyle?.bonus?.attack) {
        modifier += fightingStyle.bonus.attack;
      }

      // Bonus da reputazione
      const reputation = this.flags.brancalonia?.reputation || 0;
      if (reputation >= 50) modifier += 2;
      else if (reputation >= 25) modifier += 1;

      // Penalità da infamia
      const infamy = this.flags.brancalonia?.infamia || 0;
      if (infamy >= 50) modifier -= 2;
      else if (infamy >= 25) modifier -= 1;

      return modifier;
    };

    // Metodo per arendersi in duello
    Actor.prototype.surrenderDuel = function () {
      const instance = game.brancalonia?.duelingSystem;
      if (instance) {
        instance.requestSubmission(this);
      }
    };
  }

  _setupHooks() {
    // Hook per iniziativa speciale duelli
    Hooks.on('preCreateCombat', (combat, data, options, userId) => {
      if (combat.flags?.brancalonia?.isDuel) {
        // Modifica regole combattimento per duello
        this._modifyCombatForDuel(combat);
      }
    });

    // Hook per fine round in duello
    Hooks.on('updateCombat', (combat, update, options, userId) => {
      if (!combat.flags?.brancalonia?.isDuel) return;

      const duelId = combat.flags.brancalonia.duelId;
      const duel = this.activeDuels.get(duelId);

      if (duel && update.round) {
        this._checkDuelConditions(duel, combat);
      }
    });

    // Hook per attacchi in duello
    Hooks.on('dnd5e.preRollAttack', (item, rollData, messageData) => {
      const combat = game?.combat;
      if (!combat?.flags?.brancalonia?.isDuel) return;

      const duelId = combat.flags.brancalonia.duelId;
      const duel = this.activeDuels.get(duelId);

      if (duel) {
        this._applyDuelModifiers(item, rollData, duel);
      }
    });

    // Hook per danni in duello
    Hooks.on('dnd5e.preRollDamage', (item, rollData, messageData) => {
      const combat = game?.combat;
      if (!combat?.flags?.brancalonia?.isDuel) return;

      const duelId = combat.flags.brancalonia.duelId;
      const duel = this.activeDuels.get(duelId);

      if (duel && duel.type.rules.endCondition === 'first-blood') {
        // Termina al primo sangue
        this._endDuel(duel, item.parent);
      }
    });

    // Hook per violazioni codice d'onore
    Hooks.on('dnd5e.rollDamage', (item, roll) => {
      if (!game.settings.get('brancalonia-bigat', 'duelHonorCode')) return;

      const combat = game?.combat;
      if (!combat?.flags?.brancalonia?.isDuel) return;

      // Controlla violazioni (attacco alle spalle, magia non consentita, ecc.)
      this._checkHonorCodeViolations(item, roll, combat);
    });
  }

  _registerSettings() {
    // Settings già registrate in registerSettings() statico
  }

  /**
   * Inizia un nuovo duello
   * @async
   * @param {Actor} challenger - Sfidante
   * @param {Actor} challenged - Sfidato
   * @param {string} type - Tipo duello
   * @param {Object} options - Opzioni aggiuntive
   * @returns {Promise<Object|null>} Dati duello
   *
   * @example
   * await duelingSystem.startDuel(actor1, actor2, 'primo_sangue');
   */
  async startDuel(challenger, challenged, type = 'primo_sangue', options = {}) {
    const startTime = performance.now();

    try {
      const duelType = this.duelTypes[type];
      if (!duelType) {
        ui.notifications.error(`Tipo di duello ${type} non valido!`);
        logger.warn(DuelingSystem.MODULE_NAME, `Tipo duello non valido: ${type}`);
        return null;
      }

    // Crea ID unico per il duello
    const duelId = foundry.utils.randomID();

    // Inizializza dati duello
    const duelData = {
      id: duelId,
      type: duelType,
      challenger: {
        actor: challenger,
        hp: challenger.system.attributes.hp.value,
        style: options.challengerStyle || 'equilibrato',
        moves: [],
        wounds: 0
      },
      challenged: {
        actor: challenged,
        hp: challenged.system.attributes.hp.value,
        style: options.challengedStyle || 'equilibrato',
        moves: [],
        wounds: 0
      },
      round: 0,
      spectators: options.spectators || 0,
      stakes: options.stakes || null,
      witnesses: options.witnesses || [],
      startTime: game.time.worldTime
    };

    this.activeDuels.set(duelId, duelData);

    // Prepara la scena per il duello
    await this._prepareDuelScene(duelData);

    // Annuncia il duello
    ChatMessage.create({
      content: `
        <div class="brancalonia-duel-start">
          <h2>⚔️ DUELLO! ⚔️</h2>
          <p class="duel-type">${duelType.name}</p>
          <div class="duelists">
            <div class="challenger">
              <h3>Sfidante</h3>
              <p><strong>${challenger.name}</strong></p>
              <p>Stile: ${this.fightingStyles[duelData.challenger.style].name}</p>
            </div>
            <div class="vs">VS</div>
            <div class="challenged">
              <h3>Sfidato</h3>
              <p><strong>${challenged.name}</strong></p>
              <p>Stile: ${this.fightingStyles[duelData.challenged.style].name}</p>
            </div>
          </div>
          <p class="description"><em>${duelType.description}</em></p>
          ${duelData.stakes ? `<p class="stakes">Posta in gioco: ${duelData.stakes}</p>` : ''}
          ${duelData.spectators > 0 ? `<p class="spectators">Spettatori: ${duelData.spectators}</p>` : ''}
        </div>
      `,
      speaker: { alias: 'Maestro del Duello' }
    });

      // Inizia combattimento speciale
      await this._startDuelCombat(duelData);

      // Aggiorna statistiche
      DuelingSystem._statistics.duelsStarted++;
      DuelingSystem._statistics.duelsByType[type]++;
      DuelingSystem._statistics.activeDuels++;
      DuelingSystem._state.activeDuels.set(duelId, duelData);

      const duelTime = performance.now() - startTime;
      logger.info(
        DuelingSystem.MODULE_NAME,
        `Duello iniziato: ${challenger.name} vs ${challenged.name} (${duelType.name}, ${duelTime.toFixed(2)}ms)`
      );

      // Emit event
      Hooks.callAll('dueling:duel-started', {
        duel: duelData,
        challenger: challenger.name,
        challenged: challenged.name,
        type,
        duelsStarted: DuelingSystem._statistics.duelsStarted
      });

      return duelData;
    } catch (error) {
      DuelingSystem._statistics.errors.push(`startDuel: ${error.message}`);
      logger.error(DuelingSystem.MODULE_NAME, 'Errore avvio duello', error);
      ui.notifications.error('Errore nell\'avvio del duello!');
      return null;
    }
  }

  /**
   * Prepara la scena per il duello
   * @async
   * @private
   * @param {Object} duelData - Dati duello
   * @returns {Promise<void>}
   */
  async _prepareDuelScene(duelData) {
    try {
    // Posiziona i duellanti
    const tokens = [];

    for (const duelist of [duelData.challenger, duelData.challenged]) {
      const token = duelist.actor.getActiveTokens()[0];
      if (token) {
        // Applica stile di combattimento
        await this._applyFightingStyle(duelist.actor, duelist.style);

        // Resetta HP se non letale
        if (!duelData.type.rules.lethal) {
          await duelist.actor.update({
            'system.attributes.hp.temp': duelist.actor.system.attributes.hp.max
          });
        }

        tokens.push(token);
      }
    }

    // Posiziona i token uno di fronte all'altro
    if (tokens.length === 2) {
      const centerX = canvas.dimensions.width / 2;
      const centerY = canvas.dimensions.height / 2;

      await tokens[0].document.update({
        x: centerX - 200,
        y: centerY
      });

      await tokens[1].document.update({
        x: centerX + 200,
        y: centerY
      });
    }

      // Aggiungi effetto visivo arena
      if (game.settings.get('brancalonia-bigat', 'duelSpectators')) {
        await this._createDuelArena(duelData);
      }

      logger.debug?.(DuelingSystem.MODULE_NAME, 'Scena duello preparata');
    } catch (error) {
      DuelingSystem._statistics.errors.push(`_prepareDuelScene: ${error.message}`);
      logger.error(DuelingSystem.MODULE_NAME, 'Errore preparazione scena duello', error);
    }
  }

  /**
   * Applica stile di combattimento
   * @async
   * @private
   * @param {Actor} actor - Attore
   * @param {string} styleName - Nome stile
   * @returns {Promise<void>}
   */
  async _applyFightingStyle(actor, styleName) {
    try {
      const style = this.fightingStyles[styleName];
      if (!style) {
        logger.warn(DuelingSystem.MODULE_NAME, `Stile combattimento non valido: ${styleName}`);
        return;
      }

    const changes = [];

    if (style.bonus.attack) {
      changes.push({
        key: 'system.bonuses.attack.attack',
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: style.bonus.attack.toString()
      });
    }

    if (style.bonus.ac) {
      changes.push({
        key: 'system.attributes.ac.bonus',
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: style.bonus.ac.toString()
      });
    }

    if (style.bonus.initiative) {
      changes.push({
        key: 'system.attributes.init.bonus',
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: style.bonus.initiative.toString()
      });
    }

    const effectData = {
      name: `Stile di Duello: ${style.name}`,
      img: 'icons/skills/melee/swords-crossed-silver.webp',
      origin: actor.uuid,
      duration: {},
      changes,
      flags: {
        brancalonia: {
          isDuelStyle: true,
          styleName,
          styleData: style
        }
      },
      description: style.description
    };

      await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);

      logger.debug?.(DuelingSystem.MODULE_NAME, `Stile ${styleName} applicato a ${actor.name}`);
    } catch (error) {
      DuelingSystem._statistics.errors.push(`_applyFightingStyle: ${error.message}`);
      logger.error(DuelingSystem.MODULE_NAME, 'Errore applicazione stile combattimento', error);
    }
  }

  /**
   * Inizia combattimento di duello
   * @async
   * @private
   * @param {Object} duelData - Dati duello
   * @returns {Promise<Combat>}
   */
  async _startDuelCombat(duelData) {
    try {
      const combatData = {
      scene: canvas.scene.id,
      combatants: [],
      flags: {
        brancalonia: {
          isDuel: true,
          duelId: duelData.id,
          duelType: duelData.type.name
        }
      }
    };

    // Aggiungi combattenti
    for (const duelist of [duelData.challenger, duelData.challenged]) {
      const token = duelist.actor.getActiveTokens()[0];
      if (token) {
        combatData.combatants.push({
          tokenId: token.id,
          sceneId: canvas.scene.id,
          actorId: duelist.actor.id
        });
      }
    }

      const combat = await Combat.create(combatData);
      await combat.startCombat();

      logger.info(DuelingSystem.MODULE_NAME, `Combattimento duello avviato: ${duelData.id}`);
      return combat;
    } catch (error) {
      DuelingSystem._statistics.errors.push(`_startDuelCombat: ${error.message}`);
      logger.error(DuelingSystem.MODULE_NAME, 'Errore avvio combattimento duello', error);
      throw error;
    }
  }

  /**
   * Modifica combattimento per duello
   */
  _modifyCombatForDuel(combat) {
    // Regole speciali per duelli
    const updates = {
      'flags.dnd5e.skipDefeated': true // Non salta sconfitti
    };
    combat.update(updates);

    // Iniziativa con modificatori stile
    Hooks.once('combatStart', (combat) => {
      this._rollDuelInitiative(combat);
    });
  }

  /**
   * Tira iniziativa speciale per duello
   */
  async _rollDuelInitiative(combat) {
    const duelId = combat.flags.brancalonia?.duelId;
    if (!duelId) return;

    const duel = this.activeDuels.get(duelId);
    if (!duel) return;

    // Aggiungi bonus stile all'iniziativa
    for (const combatant of combat.combatants) {
      const duelist = duel.challenger.actor.id === combatant.actor.id ?
        duel.challenger :
        duel.challenged;

      const style = this.fightingStyles[duelist.style];
      const bonus = style.bonus.initiative || 0;

      // Crea roll con bonus incluso
      const formula = `1d20 + ${combatant.actor.system.attributes.init.mod} + ${bonus}`;
      const roll = await new Roll(formula).evaluate();

      await combat.updateEmbeddedDocuments('Combatant', [{
        _id: combatant.id,
        initiative: roll.total
      }]);
    }
  }

  /**
   * Controlla condizioni di fine duello
   */
  async _checkDuelConditions(duel, combat) {
    const type = duel.type;

    // Controlla round massimi
    if (type.rules.maxRounds && combat.round > type.rules.maxRounds) {
      await this._endDuel(duel, null, 'time-limit');
      return;
    }

    // Controlla condizioni specifiche
    for (const duelist of [duel.challenger, duel.challenged]) {
      const actor = duelist.actor;

      switch (type.rules.endCondition) {
        case 'death':
          if (actor.system.attributes.hp.value <= 0) {
            const winner = duelist === duel.challenger ? duel.challenged : duel.challenger;
            await this._endDuel(duel, winner.actor, 'death');
            return;
          }
          break;

        case 'incapacitated':
          const hasIncapacitated = actor.effects.some(e => e.statuses.has('incapacitated'));
          const hasUnconscious = actor.effects.some(e => e.statuses.has('unconscious'));
          if (hasIncapacitated || hasUnconscious) {
            const winner = duelist === duel.challenger ? duel.challenged : duel.challenger;
            await this._endDuel(duel, winner.actor, 'incapacitated');
            return;
          }
          break;

        case 'submission':
          // Controlla se qualcuno si arrende (gestito via dialog)
          break;

        case 'first-blood':
          // Gestito nel hook danni
          break;
      }
    }
  }

  /**
   * Applica modificatori del duello
   */
  _applyDuelModifiers(item, config, duel) {
    // Modificatori spettatori
    if (game.settings.get('brancalonia-bigat', 'duelSpectators') && duel.spectators > 0) {
      const spectatorBonus = Math.floor(duel.spectators / 10);
      config.parts = config.parts || [];
      config.parts.push(`+${spectatorBonus}[Spettatori]`);

      if (spectatorBonus > 0) {
        ChatMessage.create({
          content: `<p>🎭 Gli spettatori incoraggiano! +${spectatorBonus} al tiro</p>`,
          speaker: ChatMessage.getSpeaker({ actor: item.parent })
        });
      }
    }

    // Modificatori stile
    const duelist = duel.challenger.actor.id === item.parent.id ?
      duel.challenger :
      duel.challenged;

    const style = this.fightingStyles[duelist.style];
    if (style.bonus.damage && config.parts) {
      config.parts.push(`+${style.bonus.damage}[Stile]`);
    }
  }

  /**
   * Esegui mossa speciale
   * @async
   * @param {Actor} actor - Attore che esegue
   * @param {string} moveName - Nome mossa
   * @param {Actor} target - Bersaglio
   * @returns {Promise<boolean>} True se successo
   *
   * @example
   * await duelingSystem.executeSpecialMove(actor, 'feinta', target);
   */
  async executeSpecialMove(actor, moveName, target) {
    const moveStart = performance.now();

    try {
      const move = this.specialMoves[moveName];
      if (!move) {
        ui.notifications.error(`Mossa ${moveName} non valida!`);
        logger.warn(DuelingSystem.MODULE_NAME, `Mossa non valida: ${moveName}`);
        return false;
      }

      // Controlla requisiti
      if (!this._checkMoveRequirements(actor, move)) {
        ui.notifications.warn(`Non soddisfi i requisiti per ${move.name}`);
        logger.debug?.(DuelingSystem.MODULE_NAME, `Requisiti non soddisfatti per ${moveName}`);
        return false;
      }

    // Applica costo
    let success = true;
    if (move.dc) {
      const roll = await actor.rollSkill('ath', {
        dc: move.dc,
        flavor: move.name
      });
      success = roll.total >= move.dc;
    }

      if (success) {
        // Applica effetto
        await this._applyMoveEffect(actor, target, move);

        ChatMessage.create({
          content: `
            <div class="brancalonia-special-move">
              <h3>⚡ ${move.name}!</h3>
              <p><strong>${actor.name}</strong> esegue ${move.name}</p>
              <p><em>${move.effect}</em></p>
            </div>
          `,
          speaker: ChatMessage.getSpeaker({ actor })
        });

        // Aggiorna statistiche
        DuelingSystem._statistics.specialMovesExecuted++;
        DuelingSystem._statistics.movesByType[moveName]++;

        const moveTime = performance.now() - moveStart;
        logger.info(
          DuelingSystem.MODULE_NAME,
          `Mossa ${move.name} eseguita da ${actor.name} (${moveTime.toFixed(2)}ms)`
        );

        // Emit event
        Hooks.callAll('dueling:move-executed', {
          actor: actor.name,
          move: moveName,
          target: target.name,
          success: true,
          specialMovesExecuted: DuelingSystem._statistics.specialMovesExecuted
        });

        return true;
      } else {
        ChatMessage.create({
          content: `<p>${actor.name} fallisce ${move.name}!</p>`,
          speaker: ChatMessage.getSpeaker({ actor })
        });

        // Emit event fallimento
        Hooks.callAll('dueling:move-executed', {
          actor: actor.name,
          move: moveName,
          target: target.name,
          success: false
        });

        return false;
      }
    } catch (error) {
      DuelingSystem._statistics.errors.push(`executeSpecialMove: ${error.message}`);
      logger.error(DuelingSystem.MODULE_NAME, 'Errore esecuzione mossa speciale', error);
      ui.notifications.error('Errore nell\'esecuzione della mossa!');
      return false;
    }
  }

  /**
   * Controlla violazioni codice d'onore
   */
  _checkHonorCodeViolations(item, roll, combat) {
    const duelId = combat.flags.brancalonia.duelId;
    const duel = this.activeDuels.get(duelId);
    if (!duel) return;

    const actor = item.parent;
    const violations = [];

    // Controllo magia non consentita
    if (item.type === 'spell' && !duel.type.rules.allowMagic) {
      violations.push('Uso di magia non consentito');
    }

    // Controllo attacchi a distanza non consentiti
    if (item.system.range?.value > 5 && !duel.type.rules.allowRanged) {
      violations.push('Attacco a distanza non consentito');
    }

    // Applica penalità per violazioni
    for (const violation of violations) {
      this._applyHonorViolationPenalty(actor, violation, duel);
    }
  }

  /**
   * Applica penalità per violazione codice d'onore
   */
  async _applyHonorViolationPenalty(actor, violation, duel) {
    ChatMessage.create({
      content: `
        <div class="brancalonia-honor-violation">
          <h3>⚖️ VIOLAZIONE CODICE D'ONORE!</h3>
          <p><strong>${actor.name}:</strong> ${violation}</p>
          <p>Penalità: -5 Reputazione, +10 Infamia</p>
        </div>
      `,
      speaker: { alias: 'Maestro del Duello' }
    });

    // Applica penalità
    const currentInfamy = actor.flags.brancalonia?.infamia || 0;
    const currentReputation = actor.flags.brancalonia?.reputation || 0;

    await actor.setFlag('brancalonia-bigat', 'infamia', currentInfamy + 10);
    await actor.setFlag('brancalonia-bigat', 'reputation', Math.max(0, currentReputation - 5));

    // Termina il duello per disonore
    const opponent = duel.challenger.actor.id === actor.id ? duel.challenged.actor : duel.challenger.actor;
    await this._endDuel(duel, opponent, 'dishonor');
  }

  /**
   * Controlla requisiti mossa
   */
  _checkMoveRequirements(actor, move) {
    const req = move.requirements;

    if (req.includes('Destrezza')) {
      const minDex = parseInt(req.match(/\d+/)[0]);
      if (actor.system.abilities.dex.value < minDex) return false;
    }

    if (req.includes('Carisma')) {
      const minCha = parseInt(req.match(/\d+/)[0]);
      if (actor.system.abilities.cha.value < minCha) return false;
    }

    if (req.includes('BAB')) {
      const minBAB = parseInt(req.match(/\d+/)[0]);
      const bab = actor.system.attributes.prof || 0;
      if (bab < minBAB) return false;
    }

    return true;
  }

  /**
   * Applica effetto mossa
   */
  async _applyMoveEffect(actor, target, move) {
    switch (move.name) {
      case 'Disarmo':
        if (target) {
          const weapon = target.items.find(i => i.type === 'weapon' && i.system.equipped);
          if (weapon) {
            await weapon.update({ 'system.equipped': false });
            ui.notifications.info(`${target.name} è stato disarmato!`);
          }
        }
        break;

      case 'Finta':
        await actor.setFlag('brancalonia-bigat', 'nextAttackAdvantage', true);
        break;

      case 'Provocazione':
        if (target) {
          await target.setFlag('brancalonia-bigat', 'nextAttackDisadvantage', true);
        }
        break;

      case 'Colpo Mirato':
        await actor.setFlag('brancalonia-bigat', 'powerAttack', { attack: -5, damage: 10 });
        break;
    }
  }

  /**
   * Richiedi sottomissione
   * @async
   * @param {Actor} actor - Attore che si arrende
   * @returns {Promise<void>}
   */
  async requestSubmission(actor) {
    try {
      const combat = game?.combat;
      if (!combat?.flags?.brancalonia?.isDuel) {
        ui.notifications.warn('Non sei in un duello!');
        logger.warn(DuelingSystem.MODULE_NAME, 'Tentativo arresa fuori dal duello');
        return;
      }

      const duelId = combat.flags.brancalonia.duelId;
      const duel = this.activeDuels.get(duelId);
      if (!duel) {
        logger.warn(DuelingSystem.MODULE_NAME, `Duello non trovato: ${duelId}`);
        return;
      }

    const opponent = duel.challenger.actor.id === actor.id ?
      duel.challenged.actor :
      duel.challenger.actor;

      new foundry.appv1.sheets.Dialog({
        title: 'Richiesta di Resa',
        content: `<p>${actor.name} chiede la resa a ${opponent.name}</p>`,
        buttons: {
          accept: {
            label: 'Accetta Resa',
            callback: () => this._endDuel(duel, opponent, 'submission')
          },
          refuse: {
            label: 'Rifiuta',
            callback: () => {
              ChatMessage.create({
                content: `<p>${opponent.name} rifiuta di arrendersi! Il duello continua!</p>`,
                speaker: ChatMessage.getSpeaker({ actor: opponent })
              });
            }
          }
        }
      }).render(true);

      logger.debug?.(DuelingSystem.MODULE_NAME, `Richiesta arresa: ${actor.name}`);
    } catch (error) {
      DuelingSystem._statistics.errors.push(`requestSubmission: ${error.message}`);
      logger.error(DuelingSystem.MODULE_NAME, 'Errore richiesta sottomissione', error);
      ui.notifications.error('Errore nella richiesta di resa!');
    }
  }

  /**
   * Termina il duello
   * @async
   * @private
   * @param {Object} duel - Dati duello
   * @param {Actor} winner - Vincitore (null se pareggio)
   * @param {string} reason - Motivo fine
   * @returns {Promise<void>}
   */
  async _endDuel(duel, winner, reason) {
    const endStart = performance.now();

    try {
      const loser = winner?.id === duel.challenger.actor.id ?
        duel.challenged.actor :
        duel.challenger.actor;

    // Rimuovi effetti stile
    for (const duelist of [duel.challenger.actor, duel.challenged.actor]) {
      const effects = duelist.effects.filter(e => e.flags.brancalonia?.isDuelStyle);
      for (const effect of effects) {
        await effect.delete();
      }
    }

    // Applica ricompense
    if (winner) {
      const rewards = duel.type.rewards;

      // Fixed: Batch updates atomici per evitare race conditions
      const winnerUpdates = {};
      const loserUpdates = {};

      // Infamia
      if (rewards.winner.infamy) {
        const currentInfamia = winner.flags.brancalonia?.infamia || 0;
        winnerUpdates['flags.brancalonia-bigat.infamia'] = currentInfamia + rewards.winner.infamy;
      }
      if (rewards.loser.infamy) {
        const currentInfamia = loser.flags.brancalonia?.infamia || 0;
        loserUpdates['flags.brancalonia-bigat.infamia'] = currentInfamia + rewards.loser.infamy;
      }

      // Oro
      if (rewards.winner.gold) {
        const goldRoll = await new Roll(rewards.winner.gold).evaluate();
        winnerUpdates['system.currency.du'] = winner.system.currency.du + goldRoll.total;
      }

      // Applica batch updates
      const updatePromises = [];
      if (Object.keys(winnerUpdates).length > 0) {
        updatePromises.push(winner.update(winnerUpdates));
      }
      if (Object.keys(loserUpdates).length > 0) {
        updatePromises.push(loser.update(loserUpdates));
      }

      // Reputazione (separata perché usa metodo custom)
      if (rewards.winner.reputation) {
        updatePromises.push(this._adjustReputation(winner, rewards.winner.reputation));
      }
      if (rewards.loser.reputation) {
        updatePromises.push(this._adjustReputation(loser, rewards.loser.reputation));
      }

      // Esegui tutti gli update in parallelo
      await Promise.all(updatePromises);
    }

    // Messaggio finale
    ChatMessage.create({
      content: `
        <div class="brancalonia-duel-end">
          <h2>⚔️ FINE DEL DUELLO! ⚔️</h2>
          ${winner ? `
            <h3>🏆 Vincitore: ${winner.name}</h3>
            <p>Sconfitto: ${loser.name}</p>
          ` : '<h3>Pareggio!</h3>'}
          <p>Motivo: ${this._getEndReason(reason)}</p>
          <p>Durata: ${duel.round} round</p>
          ${duel.stakes ? `<p>Il vincitore ottiene: ${duel.stakes}</p>` : ''}
        </div>
      `,
      speaker: { alias: 'Maestro del Duello' }
    });

      // Termina combattimento
      if (game?.combat?.flags?.brancalonia?.duelId === duel.id) {
        await game?.combat.endCombat();
      }

      // Rimuovi duello attivo
      this.activeDuels.delete(duel.id);
      DuelingSystem._state.activeDuels.delete(duel.id);

      // Aggiorna statistiche
      DuelingSystem._statistics.duelsCompleted++;
      DuelingSystem._statistics.activeDuels--;

      // Statistiche specifiche per motivo
      if (reason === 'first-blood') {
        DuelingSystem._statistics.firstBloodVictories++;
      } else if (reason === 'death') {
        DuelingSystem._statistics.deaths++;
      } else if (reason === 'submission') {
        DuelingSystem._statistics.submissions++;
      }

      // Aggiorna record attori
      if (winner) {
        const wins = winner.getFlag('brancalonia-bigat', 'duelWins') || 0;
        await winner.setFlag('brancalonia-bigat', 'duelWins', wins + 1);

        const losses = loser.getFlag('brancalonia-bigat', 'duelLosses') || 0;
        await loser.setFlag('brancalonia-bigat', 'duelLosses', losses + 1);
      }

      const endTime = performance.now() - endStart;
      logger.info(
        DuelingSystem.MODULE_NAME,
        `Duello terminato: ${winner?.name || 'Pareggio'} (${reason}, ${endTime.toFixed(2)}ms)`
      );

      // Emit event
      Hooks.callAll('dueling:duel-ended', {
        duel,
        winner: winner?.name,
        loser: loser?.name,
        reason,
        rounds: duel.round,
        duelsCompleted: DuelingSystem._statistics.duelsCompleted
      });
    } catch (error) {
      DuelingSystem._statistics.errors.push(`_endDuel: ${error.message}`);
      logger.error(DuelingSystem.MODULE_NAME, 'Errore termine duello', error);
      ui.notifications.error('Errore nella conclusione del duello!');
    }
  }

  /**
   * Ottieni motivo fine duello
   */
  _getEndReason(reason) {
    const reasons = {
      'first-blood': 'Primo Sangue',
      death: 'Morte',
      incapacitated: 'Incapacitazione',
      submission: 'Resa',
      'time-limit': 'Limite di Tempo',
      interference: 'Interferenza Esterna',
      dishonor: 'Disonore'
    };
    return reasons[reason] || reason;
  }

  /**
   * Aggiusta reputazione
   */
  async _adjustReputation(actor, amount) {
    const currentRep = actor.flags.brancalonia?.reputation || 0;
    await actor.setFlag('brancalonia-bigat', 'reputation', currentRep + amount);

    const emoji = amount > 0 ? '📈' : '📉';
    ui.notifications.info(`${emoji} ${actor.name}: Reputazione ${amount > 0 ? '+' : ''}${amount}`);
  }

  /**
   * Crea arena visiva per duello
   */
  async _createDuelArena(duelData) {
    // Crea cerchio di spettatori con tiles
    const centerX = canvas.dimensions.width / 2;
    const centerY = canvas.dimensions.height / 2;
    const radius = 400;

    const spectatorTiles = [];
    const spectatorCount = Math.min(duelData.spectators, 20);

    for (let i = 0; i < spectatorCount; i++) {
      const angle = (i / spectatorCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      spectatorTiles.push({
        img: 'icons/environment/people/commoner.webp',
        x: x - 25,
        y: y - 25,
        width: 50,
        height: 50,
        rotation: (angle * 180 / Math.PI) - 90,
        flags: {
          brancalonia: {
            isSpectator: true,
            duelId: duelData.id
          }
        }
      });
    }

    await canvas.scene.createEmbeddedDocuments('Tile', spectatorTiles);
  }

  /**
   * UI per gestione duelli
   */
  renderDuelManager() {
    const content = `
      <div class="brancalonia-duel-manager">
        <h2>⚔️ Gestione Duelli</h2>

        <div class="duel-setup">
          <h3>Nuovo Duello</h3>

          <div class="form-group">
            <label>Sfidante:</label>
            <select id="challenger-select">
              ${game.actors.filter(a => a.hasPlayerOwner).map(a =>
    `<option value="${a.id}">${a.name}</option>`
  ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Sfidato:</label>
            <select id="challenged-select">
              ${game.actors.filter(a => a.type === 'character' || a.type === 'npc').map(a =>
    `<option value="${a.id}">${a.name}</option>`
  ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Tipo di Duello:</label>
            <select id="duel-type">
              ${Object.entries(this.duelTypes).map(([key, type]) =>
    `<option value="${key}">${type.name}</option>`
  ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Stile Sfidante:</label>
            <select id="challenger-style">
              ${Object.entries(this.fightingStyles).map(([key, style]) =>
    `<option value="${key}">${style.name}</option>`
  ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Stile Sfidato:</label>
            <select id="challenged-style">
              ${Object.entries(this.fightingStyles).map(([key, style]) =>
    `<option value="${key}">${style.name}</option>`
  ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Posta in Gioco:</label>
            <input type="text" id="stakes" placeholder="Oro, oggetti, onore...">
          </div>

          <div class="form-group">
            <label>Spettatori:</label>
            <input type="number" id="spectators" value="0" min="0" max="100">
          </div>

          <button id="start-duel">Inizia Duello!</button>
        </div>

        <div class="active-duels">
          <h3>Duelli Attivi</h3>
          ${this.activeDuels.size > 0 ?
    Array.from(this.activeDuels.values()).map(duel => `
              <div class="active-duel">
                <p>${duel.challenger.actor.name} vs ${duel.challenged.actor.name}</p>
                <p>${duel.type.name} - Round ${duel.round}</p>
                <button class="end-duel" data-duel="${duel.id}">Termina</button>
              </div>
            `).join('') :
    '<p>Nessun duello attivo</p>'
}
        </div>

        <div class="special-moves">
          <h3>Mosse Speciali</h3>
          <div class="moves-grid">
            ${Object.entries(this.specialMoves).map(([key, move]) => `
              <div class="move-card">
                <h4>${move.name}</h4>
                <p>${move.effect}</p>
                <p class="requirements">${move.requirements}</p>
                <p class="cost">Costo: ${move.cost}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    const dialog = new foundry.appv1.sheets.Dialog({
      title: 'Gestione Duelli',
      content,
      buttons: {
        close: { label: 'Chiudi' }
      },
      render: html => {
        html.find('#start-duel').click(async () => {
          const challengerId = html.find('#challenger-select').val();
          const challengedId = html.find('#challenged-select').val();
          const type = html.find('#duel-type').val();

          const challenger = game.actors.get(challengerId);
          const challenged = game.actors.get(challengedId);

          if (challenger && challenged) {
            await this.startDuel(challenger, challenged, type, {
              challengerStyle: html.find('#challenger-style').val(),
              challengedStyle: html.find('#challenged-style').val(),
              stakes: html.find('#stakes').val(),
              spectators: parseInt(html.find('#spectators').val()) || 0
            });
            dialog.close();
          }
        });

        html.find('.end-duel').click(ev => {
          const duelId = ev.currentTarget.dataset.duel;
          const duel = this.activeDuels.get(duelId);
          if (duel) {
            this._endDuel(duel, null, 'interrupted');
            dialog.close();
          }
        });
      }
    });

    dialog.render(true);
  }
}

// Registra classe globale
window.DuelingSystem = DuelingSystem;

// Auto-inizializzazione durante init
Hooks.once('init', () => {
  console.log('🎮 Brancalonia | Inizializzazione Dueling System');
  DuelingSystem.initialize();
});

// Crea macro dopo che il game è pronto
Hooks.once('ready', () => {
  DuelingSystem.createMacros();
});

// Hook per integrazione con schede
Hooks.on('renderActorSheet', (app, html, data) => {
  if (!game.user.isGM) return;

  const actor = app.actor;
  if (actor.type !== 'character' && actor.type !== 'npc') return;

  // Aggiungi sezione duelli
  const duelSection = $(`
    <div class="form-group">
      <label>Gestione Duelli</label>
      <div class="form-fields">
        <button type="button" class="challenge-duel">
          <i class="fas fa-swords"></i> Sfida a Duello
        </button>
        <button type="button" class="view-duel-stats">
          <i class="fas fa-chart-bar"></i> Statistiche Duelli
        </button>
      </div>
    </div>
  `);

  html.find('.tab.details .form-group').last().after(duelSection);

  duelSection.find('.challenge-duel').click(() => {
    const instance = game.brancalonia?.duelingSystem;
    if (instance) {
      instance.renderDuelManager();
    }
  });

  duelSection.find('.view-duel-stats').click(() => {
    // Mostra statistiche duelli dell'attore
    const wins = actor.getFlag('brancalonia-bigat', 'duelWins') || 0;
    const losses = actor.getFlag('brancalonia-bigat', 'duelLosses') || 0;
    const draws = actor.getFlag('brancalonia-bigat', 'duelDraws') || 0;

    new foundry.appv1.sheets.Dialog({
      title: `Statistiche Duelli - ${actor.name}`,
      content: `
        <div class="duel-stats">
          <h3>Record Duelli</h3>
          <p>Vittorie: <strong>${wins}</strong></p>
          <p>Sconfitte: <strong>${losses}</strong></p>
          <p>Pareggi: <strong>${draws}</strong></p>
          <p>Totale: <strong>${wins + losses + draws}</strong></p>
          <hr>
          <p>Ratio: <strong>${losses > 0 ? (wins / losses).toFixed(2) : wins}</strong></p>
        </div>
      `,
      buttons: { close: { label: 'Chiudi' } }
    }).render(true);
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
 * const status = DuelingSystem.getStatus();
 */
DuelingSystem.getStatus = function() {
  return {
    version: this.VERSION,
    initialized: this._state.initialized,
    duelTypes: Object.keys(this._state.instance?.duelTypes || {}).length,
    fightingStyles: Object.keys(this._state.instance?.fightingStyles || {}).length,
    specialMoves: Object.keys(this._state.instance?.specialMoves || {}).length,
    activeDuels: this._statistics.activeDuels,
    duelsCompleted: this._statistics.duelsCompleted
  };
};

/**
 * Ottiene le statistiche del modulo
 * @static
 * @returns {DuelingStatistics} Statistiche correnti
 * @example
 * const stats = DuelingSystem.getStatistics();
 */
DuelingSystem.getStatistics = function() {
  return {
    ...this._statistics,
    duelsByType: { ...this._statistics.duelsByType },
    movesByType: { ...this._statistics.movesByType },
    errors: [...this._statistics.errors]
  };
};

/**
 * Resetta le statistiche
 * @static
 * @example
 * DuelingSystem.resetStatistics();
 */
DuelingSystem.resetStatistics = function() {
  logger.info(this.MODULE_NAME, 'Reset statistiche Dueling System');

  const initTime = this._statistics.initTime;
  const macrosCreated = this._statistics.macrosCreated;

  this._statistics = {
    initTime,
    duelsStarted: 0,
    duelsByType: {},
    duelsCompleted: 0,
    duelsCanceled: 0,
    specialMovesExecuted: 0,
    movesByType: {},
    honorViolations: 0,
    submissions: 0,
    deaths: 0,
    firstBloodVictories: 0,
    arenasCreated: 0,
    macrosCreated,
    chatCommandsExecuted: 0,
    activeDuels: 0,
    errors: []
  };

  // Re-inizializza contatori per tipo duello
  if (this._state.instance) {
    Object.keys(this._state.instance.duelTypes).forEach(type => {
      this._statistics.duelsByType[type] = 0;
    });

    Object.keys(this._state.instance.specialMoves).forEach(move => {
      this._statistics.movesByType[move] = 0;
    });
  }
};

/**
 * Ottiene lista tipi duello disponibili
 * @static
 * @returns {Object} Database tipi duello
 * @example
 * const types = DuelingSystem.getDuelTypes();
 */
DuelingSystem.getDuelTypes = function() {
  return this._state.instance?.duelTypes || {};
};

/**
 * Ottiene lista stili combattimento disponibili
 * @static
 * @returns {Object} Database stili
 * @example
 * const styles = DuelingSystem.getFightingStyles();
 */
DuelingSystem.getFightingStyles = function() {
  return this._state.instance?.fightingStyles || {};
};

/**
 * Ottiene lista mosse speciali disponibili
 * @static
 * @returns {Object} Database mosse
 * @example
 * const moves = DuelingSystem.getSpecialMoves();
 */
DuelingSystem.getSpecialMoves = function() {
  return this._state.instance?.specialMoves || {};
};

/**
 * Ottiene duelli attivi
 * @static
 * @returns {Map} Mappa duelli attivi
 * @example
 * const activeDuels = DuelingSystem.getActiveDuels();
 */
DuelingSystem.getActiveDuels = function() {
  return this._state.activeDuels;
};

/**
 * Inizia duello via API statica
 * @static
 * @async
 * @param {Actor} challenger - Sfidante
 * @param {Actor} challenged - Sfidato
 * @param {string} type - Tipo duello
 * @param {Object} options - Opzioni
 * @returns {Promise<Object|null>}
 * @example
 * await DuelingSystem.startDuelViaAPI(actor1, actor2, 'primo_sangue');
 */
DuelingSystem.startDuelViaAPI = async function(challenger, challenged, type, options) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return null;
  }
  return await this._state.instance.startDuel(challenger, challenged, type, options);
};

/**
 * Termina duello via API statica
 * @static
 * @async
 * @param {string} duelId - ID duello
 * @param {Actor} winner - Vincitore
 * @param {string} reason - Motivo
 * @returns {Promise<void>}
 * @example
 * await DuelingSystem.endDuelViaAPI(duelId, winner, 'submission');
 */
DuelingSystem.endDuelViaAPI = async function(duelId, winner, reason) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return;
  }
  const duel = this._state.activeDuels.get(duelId);
  if (!duel) {
    logger.warn(this.MODULE_NAME, `Duello non trovato: ${duelId}`);
    return;
  }
  await this._state.instance._endDuel(duel, winner, reason);
};

/**
 * Esegui mossa speciale via API statica
 * @static
 * @async
 * @param {Actor} actor - Attore
 * @param {string} moveName - Nome mossa
 * @param {Actor} target - Bersaglio
 * @returns {Promise<boolean>}
 * @example
 * await DuelingSystem.executeSpecialMoveViaAPI(actor, 'feinta', target);
 */
DuelingSystem.executeSpecialMoveViaAPI = async function(actor, moveName, target) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return false;
  }
  return await this._state.instance.executeSpecialMove(actor, moveName, target);
};

/**
 * Mostra report completo
 * @static
 * @example
 * DuelingSystem.showReport();
 */
DuelingSystem.showReport = function() {
  const stats = this.getStatistics();
  const status = this.getStatus();

  console.group(`⚔️ ${this.MODULE_NAME} Report v${this.VERSION}`);
  console.log('Status:', status);
  console.log('Statistiche:', stats);
  console.log('Duelli Attivi:', Array.from(this._state.activeDuels.keys()));
  console.groupEnd();

  ui.notifications.info(
    `⚔️ Report Dueling: ${stats.duelsStarted} duelli, ${stats.duelsCompleted} completati, ${stats.activeDuels} attivi`
  );
};

// Export per compatibilità
if (typeof module !== 'undefined') {
  module.exports = DuelingSystem;
}

// Export ES6
export default DuelingSystem;
export { DuelingSystem };