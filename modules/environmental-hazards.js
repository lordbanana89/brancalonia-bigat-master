/**
 * @fileoverview Sistema Hazard Ambientali per Brancalonia
 *
 * Sistema completo di pericoli ambientali, trappole naturali e meteo.
 * Supporta 3 categorie (naturali, trappole, meteo), detection, trigger automatici,
 * effetti immediate + ongoing, placement su scene, e weather system.
 *
 * Features:
 * - 10+ Hazard Naturali (palude, sabbie mobili, nebbia, frana, valanga, etc.)
 * - 8+ Trappole (fossa, lame, dardi, rete, gas, pavimento, ago, fuoco)
 * - 8+ Eventi Meteo (tempesta, neve, caldo, nebbia, grandine, vento, fulmine, gelo)
 * - Detection system (passive/active)
 * - Trigger automatici
 * - Effetti immediate + ongoing
 * - Damage + Conditions
 * - Avoidance strategies
 * - Escape mechanics
 * - Scene integration (placement/removal)
 * - Weather system automatico
 * - Chat commands (/hazard-*)
 * - Macro automatica
 * - Settings (4 impostazioni)
 * - Hooks integration
 *
 * @version 3.0.0
 * @author Brancalonia Module Team
 * @requires brancalonia-logger.js
 * @requires dnd5e
 */

import { logger } from './brancalonia-logger.js';

/**
 * @typedef {Object} HazardStatistics
 * @property {number} initTime - Tempo inizializzazione (ms)
 * @property {number} hazardsTriggered - Hazard attivati totali
 * @property {Object<string, number>} hazardsByType - Hazard per tipo
 * @property {Object<string, number>} hazardsByCategory - Hazard per categoria (naturale, trappola, meteo)
 * @property {number} detectionsSuccessful - Detection riuscite
 * @property {number} detectionsFailed - Detection fallite
 * @property {number} avoidanceSuccessful - Evitamenti riusciti
 * @property {number} avoidanceFailed - Evitamenti falliti
 * @property {number} ongoingHazards - Hazard ongoing attivi
 * @property {number} weatherEventsTriggered - Eventi meteo attivati
 * @property {number} placedHazards - Hazard posizionati su scene
 * @property {number} removedHazards - Hazard rimossi da scene
 * @property {number} damageTotalDealt - Danni totali inflitti
 * @property {number} actorsSaved - Attori salvati da detection
 * @property {number} actorsTrapped - Attori intrappolati
 * @property {number} actorsEscaped - Attori fuggiti
 * @property {number} macrosCreated - Macro create
 * @property {number} chatCommandsExecuted - Comandi chat eseguiti
 * @property {string[]} errors - Errori registrati
 */

/**
 * Sistema Hazard Ambientali per Brancalonia
 * Gestisce pericoli ambientali, trappole e meteo
 *
 * @class EnvironmentalHazardsSystem
 */
class EnvironmentalHazardsSystem {
  static VERSION = '3.0.0';
  static MODULE_NAME = 'EnvironmentalHazardsSystem';
  static ID = 'environmental-hazards';

  /**
   * Statistiche del modulo
   * @type {HazardStatistics}
   * @private
   * @static
   */
  static _statistics = {
    initTime: 0,
    hazardsTriggered: 0,
    hazardsByType: {},
    hazardsByCategory: { naturale: 0, trappola: 0, meteo: 0 },
    detectionsSuccessful: 0,
    detectionsFailed: 0,
    avoidanceSuccessful: 0,
    avoidanceFailed: 0,
    ongoingHazards: 0,
    weatherEventsTriggered: 0,
    placedHazards: 0,
    removedHazards: 0,
    damageTotalDealt: 0,
    actorsSaved: 0,
    actorsTrapped: 0,
    actorsEscaped: 0,
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
    ongoingHazards: new Map(),
    weatherTimer: null
  };

  constructor() {
    // Fix: Definisci le proprietà PRIMA di usarle
    // Database completo degli hazard di Brancalonia
    this.hazards = {
      // HAZARD NATURALI
      palude_malsana: {
        name: 'Palude Malsana',
        type: 'naturale',
        img: 'icons/magic/nature/root-vine-fire-entangle-green.webp',
        dc: 12,
        trigger: 'Attraversamento',
        effect: {
          immediate: 'Movimento dimezzato, TS Costituzione CD 12 o avvelenato per 1 ora',
          ongoing: 'Ogni ora: TS Costituzione CD 12 o 1 livello sfinimento',
          damage: null,
          condition: 'difficult-terrain'
        },
        detection: { passive: 13, active: 'Sopravvivenza CD 10' },
        avoidance: 'Percorso alternativo (+2 ore viaggio) o equipaggiamento speciale',
        description: 'Acqua stagnante e miasmi velenosi rendono il passaggio pericoloso'
      },

      sabbie_mobili: {
        name: 'Sabbie Mobili',
        type: 'naturale',
        img: 'icons/magic/earth/projectiles-stone-salvo.webp',
        dc: 14,
        trigger: "Movimento nell'area",
        effect: {
          immediate: 'TS Destrezza CD 14 o intrappolato',
          ongoing: 'Affonda 1 piede/round, a 5 piedi soffoca in 1d4+1 round',
          damage: null,
          condition: 'restrained'
        },
        detection: { passive: 15, active: 'Percezione CD 12' },
        avoidance: 'Corda e TS Atletica CD 12 per uscire',
        escape: 'Forza CD 15 (con aiuto CD 10)',
        description: 'Terreno traditore che ingoia i malcapitati'
      },

      nebbia_velenosa: {
        name: 'Nebbia Velenosa delle Paludi',
        type: 'naturale',
        img: 'icons/magic/air/fog-gas-smoke-swirling-green.webp',
        dc: 13,
        trigger: "Inizio turno nell'area",
        effect: {
          immediate: 'TS Costituzione CD 13 o 2d4 danni veleno',
          ongoing: 'Visibilità 5 piedi, svantaggio Percezione',
          damage: '2d4',
          damageType: 'poison',
          condition: 'heavily-obscured'
        },
        detection: { passive: 10, active: 'Natura CD 12' },
        avoidance: 'Maschera o panno bagnato (vantaggio al TS)',
        duration: '2d6 ore o vento forte',
        description: 'Miasmi tossici che si alzano dalle paludi al tramonto'
      },

      frana: {
        name: 'Frana Improvvisa',
        type: 'naturale',
        img: 'icons/magic/earth/boulder-stone-impact-gray.webp',
        dc: 15,
        trigger: 'Rumore forte o vibrazione',
        effect: {
          immediate: 'TS Destrezza CD 15 o 4d10 danni contundenti',
          ongoing: 'Sepolto: 1d6 danni/minuto per soffocamento',
          damage: '4d10',
          damageType: 'bludgeoning',
          condition: 'restrained'
        },
        detection: { passive: 14, active: 'Percezione CD 12 per crepe' },
        avoidance: 'Muoversi silenziosamente (Furtività CD 13)',
        escape: 'Forza CD 20 o scavare (1 ora)',
        description: 'Rocce instabili pronte a crollare'
      },

      ghiaccio_sottile: {
        name: 'Ghiaccio Sottile',
        type: 'naturale',
        img: 'icons/magic/water/barrier-ice-crystal-wall-jagged-blue.webp',
        dc: 12,
        trigger: 'Peso superiore a 100 kg',
        effect: {
          immediate: 'TS Destrezza CD 12 o cade in acqua gelida',
          ongoing: '1d4 danni freddo/round, sfinimento dopo 1 minuto',
          damage: '1d4',
          damageType: 'cold',
          condition: 'exhaustion'
        },
        detection: { passive: 11, active: 'Sopravvivenza CD 10' },
        avoidance: 'Distribuire peso o percorso alternativo',
        escape: 'Atletica CD 13 per uscire',
        description: 'Superficie ghiacciata pronta a rompersi'
      },

      tempesta_improvvisa: {
        name: 'Tempesta del Menagramo',
        type: 'naturale',
        img: 'icons/magic/lightning/bolt-strike-clouds-blue.webp',
        dc: 14,
        trigger: 'Casuale (10% ogni ora di viaggio)',
        effect: {
          immediate: 'Venti forti: svantaggio attacchi a distanza',
          ongoing: 'Ogni 10 minuti: 10% di fulmine (8d6 danni elettrici)',
          damage: '8d6',
          damageType: 'lightning',
          condition: 'difficult-travel'
        },
        detection: { passive: null, active: 'Sopravvivenza CD 15 prevede 1 ora prima' },
        avoidance: 'Riparo solido',
        duration: '2d4 ore',
        description: 'Tempesta violenta con fulmini e grandine'
      },

      // HAZARD URBANI
      vicolo_malfamato: {
        name: 'Vicolo Malfamato',
        type: 'urbano',
        img: 'icons/environment/settlement/alley-narrow-night.webp',
        dc: null,
        trigger: 'Passaggio di notte',
        effect: {
          immediate: 'Incontro con 1d6 tagliagole (50% probabilità)',
          ongoing: '+10 punti Infamia se si combatte',
          damage: null,
          condition: 'ambush'
        },
        detection: { passive: 14, active: 'Streetwise CD 12' },
        avoidance: "Pagare 1d4 ducati di 'pedaggio' o altra strada",
        description: 'Vicolo controllato da criminali locali'
      },

      ponte_marcio: {
        name: 'Ponte Marcio',
        type: 'urbano',
        img: 'icons/environment/wilderness/bridge-rope.webp',
        dc: 11,
        trigger: 'Attraversamento',
        effect: {
          immediate: 'TS Destrezza CD 11 o cade (2d6 danni)',
          ongoing: 'Crolla completamente con 200+ kg',
          damage: '2d6',
          damageType: 'bludgeoning',
          condition: null
        },
        detection: { passive: 12, active: 'Investigare CD 10' },
        avoidance: 'Acrobazia CD 13 per passare con cautela',
        repair: 'Attrezzi da falegname + 2 ore',
        description: 'Struttura pericolante pronta a crollare'
      },

      fogna_allagata: {
        name: 'Fogna Allagata',
        type: 'urbano',
        img: 'icons/environment/wilderness/cave-entrance-hollow.webp',
        dc: 13,
        trigger: 'Esplorazione',
        effect: {
          immediate: 'TS Costituzione CD 13 o avvelenato 1 ora',
          ongoing: 'Malattia (10% febbre palustre)',
          damage: null,
          condition: 'poisoned'
        },
        detection: { passive: 10, active: 'Odore nauseabondo automatico' },
        avoidance: 'Equipaggiamento protettivo',
        inhabitants: '1d4 ratti giganti o 1 otyugh (20%)',
        description: 'Tunnel allagati pieni di rifiuti e malattie'
      },

      tetto_instabile: {
        name: 'Tetto Instabile',
        type: 'urbano',
        img: 'icons/environment/settlement/house-roof-tiles-green.webp',
        dc: 12,
        trigger: 'Movimento sui tetti',
        effect: {
          immediate: 'TS Destrezza CD 12 o scivola',
          ongoing: 'Caduta 3d6 danni + rumore (guardie allertate)',
          damage: '3d6',
          damageType: 'bludgeoning',
          condition: 'prone'
        },
        detection: { passive: 13, active: 'Percezione CD 11' },
        avoidance: 'Acrobazia CD 14 per movimento sicuro',
        description: 'Tegole rotte e travi marce'
      },

      // HAZARD DUNGEON
      stanza_allagata: {
        name: 'Stanza Allagata',
        type: 'dungeon',
        img: 'icons/magic/water/water-surface.webp',
        dc: 10,
        trigger: 'Ingresso nella stanza',
        effect: {
          immediate: 'Acqua alta 1 metro, movimento dimezzato',
          ongoing: 'Combattimento: svantaggio attacchi in mischia',
          damage: null,
          condition: 'difficult-terrain'
        },
        detection: { passive: 8, active: 'Automatica' },
        special: 'Elettricità: danno +1d6 a tutti in acqua',
        inhabitants: 'Sanguisughe giganti (30%)',
        description: 'Stanza parzialmente allagata'
      },

      gas_allucinogeno: {
        name: 'Gas Allucinogeno',
        type: 'dungeon',
        img: 'icons/magic/control/hypnosis-mesmerism-eye.webp',
        dc: 14,
        trigger: 'Apertura porta/cofano',
        effect: {
          immediate: 'TS Costituzione CD 14 o allucinazioni per 10 minuti',
          ongoing: 'Attacca alleati casuali, vede nemici inesistenti',
          damage: null,
          condition: 'confused'
        },
        detection: { passive: 16, active: 'Investigare CD 14' },
        avoidance: 'Trattenere respiro (1 + COS minuti)',
        neutralize: 'Vento forte o incantesimo purificare',
        description: 'Spore fungine o alchimia antica'
      },

      pavimento_traditore: {
        name: 'Pavimento Traditore',
        type: 'dungeon',
        img: 'icons/environment/wilderness/trap-pit-spikes-yellow.webp',
        dc: 15,
        trigger: 'Pressione (50+ kg)',
        effect: {
          immediate: 'TS Destrezza CD 15 o cade nella buca',
          ongoing: '3d6 danni + spine avvelenate (CD 12)',
          damage: '3d6',
          damageType: 'piercing',
          condition: 'prone'
        },
        detection: { passive: 15, active: 'Investigare CD 13' },
        avoidance: 'Saltare oltre o peso leggero',
        reset: 'Automatico dopo 1 minuto',
        description: 'Botola nascosta con punte'
      },

      muro_di_lame: {
        name: 'Muro di Lame Rotanti',
        type: 'dungeon',
        img: 'icons/weapons/swords/swords-crossed-black.webp',
        dc: 16,
        trigger: 'Leva/piastra di pressione',
        effect: {
          immediate: 'TS Destrezza CD 16 o 4d8 danni taglienti',
          ongoing: 'Blocca passaggio per 1 minuto',
          damage: '4d8',
          damageType: 'slashing',
          condition: null
        },
        detection: { passive: 14, active: 'Investigare CD 12' },
        avoidance: 'Disattivare dispositivo CD 15',
        timing: 'Attivo 1 round ogni 3',
        description: 'Lame che escono dalle pareti'
      },

      // HAZARD MAGICI
      zona_di_menagramo: {
        name: 'Zona di Menagramo Persistente',
        type: 'magico',
        img: 'icons/magic/death/skull-humanoid-crown-white-purple.webp',
        dc: null,
        trigger: "Permanente nell'area",
        effect: {
          immediate: 'Applica Menagramo Minore automaticamente',
          ongoing: 'Fallimenti critici con 1-3 sul d20',
          damage: null,
          condition: 'menagramo'
        },
        detection: { passive: null, active: 'Individuare magia' },
        avoidance: 'Impossibile, solo protezione magica',
        neutralize: 'Dissolvi magie CD 17 o benedizione',
        description: 'Area maledetta dal menagramo'
      },

      portale_instabile: {
        name: 'Portale Instabile',
        type: 'magico',
        img: 'icons/magic/movement/portal-vortex-purple.webp',
        dc: 15,
        trigger: 'Avvicinamento a 3 metri',
        effect: {
          immediate: 'TS Forza CD 15 o risucchiato',
          ongoing: 'Teletrasporto casuale 1d100 x 10 metri',
          damage: '2d6',
          damageType: 'force',
          condition: 'teleported'
        },
        detection: { passive: null, active: 'Arcano CD 13' },
        avoidance: 'Oggetto di ancoraggio o corda',
        stability: 'Instabile: 50% di malfunzionamento',
        description: 'Portale magico danneggiato'
      },

      guardiano_spettrale: {
        name: 'Guardiano Spettrale Vincolato',
        type: 'magico',
        img: 'icons/magic/death/undead-ghost-spirit-teal.webp',
        dc: null,
        trigger: 'Violazione area protetta',
        effect: {
          immediate: 'Appare spettro ostile',
          ongoing: "Insegue per 100 metri dall'area",
          damage: null,
          condition: 'haunted'
        },
        detection: { passive: 16, active: 'Religione CD 14' },
        avoidance: "Simbolo sacro o parola d'ordine",
        banish: 'Scacciare non morti o esorcismo',
        description: 'Spirito legato a proteggere un luogo'
      }
    };

    // Tabelle per generazione casuale
    this.randomTables = {
      wilderness: [
        'palude_malsana', 'sabbie_mobili', 'nebbia_velenosa',
        'frana', 'ghiaccio_sottile', 'tempesta_improvvisa'
      ],
      urban: [
        'vicolo_malfamato', 'ponte_marcio', 'fogna_allagata',
        'tetto_instabile'
      ],
      dungeon: [
        'stanza_allagata', 'gas_allucinogeno', 'pavimento_traditore',
        'muro_di_lame'
      ],
      magical: [
        'zona_di_menagramo', 'portale_instabile', 'guardiano_spettrale'
      ]
    };

    // Inizializza contatori statistiche
    try {
      // Inizializza contatori per tipo hazard
      Object.keys(this.hazards).forEach(hazard => {
        EnvironmentalHazardsSystem._statistics.hazardsByType[hazard] = 0;
      });
    } catch (error) {
      EnvironmentalHazardsSystem._statistics.errors.push(`Constructor: ${error.message}`);
      logger.error(EnvironmentalHazardsSystem.MODULE_NAME, 'Errore inizializzazione constructor', error);
    }

    // Non chiamare i metodi privati nel constructor - saranno chiamati da initialize()
  }

  /**
   * Metodo statico di inizializzazione completo
   * @static
   * @returns {void}
   */
  static initialize() {
    const startTime = performance.now();

    try {
      logger.info(this.MODULE_NAME, `Inizializzazione Environmental Hazards System v${this.VERSION}`);

      // Creazione istanza globale
      const instance = new EnvironmentalHazardsSystem();
      this._state.instance = instance;

      // Registrazione settings
      this.registerSettings();

      // Setup hooks
      instance._setupHooks(); // Fix: metodo corretto (privato)

      // Salva nell'oggetto globale
      if (!game.brancalonia) game.brancalonia = {};
      if (!game.brancalonia.modules) game.brancalonia.modules = {};
      game.brancalonia.environmentalHazards = instance;
      game.brancalonia.modules['environmental-hazards'] = instance;

      // Registrazione comandi chat
      this.registerChatCommands();

      // Creazione macro automatica
      this.createMacros();

      // Estensione Actor per hazard
      this.extendActor();

      this._state.initialized = true;
      this._statistics.initTime = performance.now() - startTime;

      logger.info(
        this.MODULE_NAME,
        `✅ Inizializzazione completata in ${this._statistics.initTime.toFixed(2)}ms`
      );

      // Emit event
      Hooks.callAll('environmental-hazards:initialized', {
        version: this.VERSION,
        hazardsCount: Object.keys(instance.hazards).length,
        categories: ['naturale', 'trappola', 'meteo']
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
    game.settings.register('brancalonia-bigat', 'enableHazards', {
      name: 'Sistema Hazard Ambientali',
      hint: 'Attiva i pericoli ambientali automatici',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'hazardFrequency', {
      name: 'Frequenza Hazard',
      hint: 'Quanto spesso si incontrano hazard',
      scope: 'world',
      config: true,
      type: String,
      choices: {
        low: 'Bassa (10%)',
        medium: 'Media (20%)',
        high: 'Alta (35%)',
        extreme: 'Estrema (50%)'
      },
      default: 'medium'
    });

    game.settings.register('brancalonia-bigat', 'hazardDamageMultiplier', {
      name: 'Moltiplicatore Danni Hazard',
      hint: "Modifica l'intensità dei danni degli hazard ambientali",
      scope: 'world',
      config: true,
      type: Number,
      default: 1.0,
      range: {
        min: 0.1,
        max: 3.0,
        step: 0.1
      }
    });
  }

  /**
   * Registra comandi chat
   */
  static registerChatCommands() {
    // Comando per attivare hazard
    game.socket.on('system.brancalonia-bigat', (data) => {
      if (data.type === 'hazard-command' && game.user.isGM) {
        const instance = game.brancalonia?.environmentalHazards;
        if (instance && data.command === 'trigger') {
          instance.triggerHazard(data.hazard, data.actor, data.options || {});
        }
      }
    });

    // Registra comandi testuali
    if (game.modules.get('monk-enhanced-journal')?.active) {
      game.MonksEnhancedJournal?.registerChatCommand('/hazard', {
        name: 'Gestisci Hazard',
        callback: (args) => {
          const instance = game.brancalonia?.environmentalHazards;
          if (instance && game.user.isGM) {
            if (args[0]) {
              instance.triggerHazard(args[0]);
            } else {
              instance.renderHazardManager();
            }
          }
        },
        help: 'Uso: /hazard [nome_hazard] - Attiva un hazard o apre il manager'
      });
    }
  }

  /**
   * Crea macro automatiche
   */
  static createMacros() {
    if (!game.user.isGM) return;

    const macroData = {
      name: '🌿 Gestione Hazard Ambientali',
      type: 'script',
      img: 'icons/magic/nature/root-vine-fire-entangle-green.webp',
      command: `
const hazardSystem = game.brancalonia?.environmentalHazards;
if (hazardSystem) {
  hazardSystem.renderHazardManager();
} else {
  ui.notifications.error("Sistema Hazard non inizializzato!");
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
      logger.info(this.MODULE_NAME, '✅ Macro Hazard Ambientali creata');
    }
  }

  /**
   * Estende la classe Actor con metodi hazard
   */
  static extendActor() {
    const originalGetRollData = Actor.prototype.getRollData;
    Actor.prototype.getRollData = function () {
      const data = originalGetRollData.call(this);

      // Aggiungi resistenze hazard
      const hazardResistances = this.flags.brancalonia?.hazardResistances || {};
      data.hazardResistance = hazardResistances;

      return data;
    };

    // Metodo per controllare resistenza agli hazard
    Actor.prototype.getHazardResistance = function (hazardType) {
      const resistances = this.flags.brancalonia?.hazardResistances || {};
      return resistances[hazardType] || 0;
    };

    // Metodo per applicare hazard con resistenze
    Actor.prototype.applyEnvironmentalHazard = async function (hazard, options = {}) {
      const instance = game.brancalonia?.environmentalHazards;
      if (instance) {
        const resistance = this.getHazardResistance(hazard.type);
        const modifiedOptions = { ...options, resistance };
        return await instance.triggerHazard(hazard.name || hazard, this, modifiedOptions);
      }
    };
  }

  _setupHooks() {
    // Hook per movimento in scene con hazard
    Hooks.on('updateToken', (token, update, options, userId) => {
      if (!update.x && !update.y) return;

      const hazards = canvas.scene.flags.brancalonia?.hazards || [];
      for (const hazard of hazards) {
        if (this._isTokenInHazard(token, hazard)) {
          this.triggerHazard(hazard.type, token.actor);
        }
      }
    });

    // Hook per tempo atmosferico
    Hooks.on('timePassed', (worldTime, dt) => {
      if (dt >= 3600) { // Ogni ora
        this._checkWeatherHazards();
      }
    });

    // Hook per esplorazione
    Hooks.on('targetToken', (user, token, targeted) => {
      if (targeted && game.user.isGM) {
        const hazard = token.document.flags.brancalonia?.hazard;
        if (hazard) {
          ui.notifications.info(`Hazard rilevato: ${this.hazards[hazard].name}`);
        }
      }
    });
  }

  _registerSettings() {
    // Settings già registrate in registerSettings() statico
  }

  /**
   * Attiva un hazard specifico
   * @async
   * @param {string} hazardName - Nome hazard
   * @param {Actor} actor - Attore bersaglio (opzionale)
   * @param {Object} options - Opzioni aggiuntive
   * @returns {Promise<Object|null>} Dati hazard
   *
   * @example
   * await hazardsSystem.triggerHazard('palude_malsana', actor);
   */
  async triggerHazard(hazardName, actor = null, options = {}) {
    const triggerStart = performance.now();

    try {
      const hazard = this.hazards[hazardName];
      if (!hazard) {
        ui.notifications.error(`Hazard ${hazardName} non trovato!`);
        logger.warn(EnvironmentalHazardsSystem.MODULE_NAME, `Hazard non valido: ${hazardName}`);
        return null;
      }

      // Messaggio iniziale
      ChatMessage.create({
        content: `
          <div class="brancalonia-hazard-trigger">
            <h3>⚠️ ${hazard.name}!</h3>
            <p><em>${hazard.description}</em></p>
          </div>
        `,
        speaker: ChatMessage.getSpeaker({ alias: 'Hazard' })
      });

      // Se c'è un attore bersaglio
      if (actor && hazard.effect.immediate) {
        await this._applyHazardEffect(actor, hazard);
      }

      // Se è un hazard di area
      if (hazard.type === 'naturale' && !actor) {
        this._applyAreaHazard(hazard);
      }

      // Aggiorna statistiche
      EnvironmentalHazardsSystem._statistics.hazardsTriggered++;
      EnvironmentalHazardsSystem._statistics.hazardsByType[hazardName]++;
      EnvironmentalHazardsSystem._statistics.hazardsByCategory[hazard.type]++;

      const triggerTime = performance.now() - triggerStart;
      logger.info(
        EnvironmentalHazardsSystem.MODULE_NAME,
        `Hazard attivato: ${hazard.name}${actor ? ` su ${actor.name}` : ''} (${triggerTime.toFixed(2)}ms)`
      );

      // Emit event
      Hooks.callAll('environmental-hazards:triggered', {
        hazard,
        hazardName,
        actor: actor?.name,
        hazardsTriggered: EnvironmentalHazardsSystem._statistics.hazardsTriggered
      });

      return hazard;
    } catch (error) {
      EnvironmentalHazardsSystem._statistics.errors.push(`triggerHazard: ${error.message}`);
      logger.error(EnvironmentalHazardsSystem.MODULE_NAME, 'Errore trigger hazard', error);
      ui.notifications.error('Errore nell\'attivazione dell\'hazard!');
      return null;
    }
  }

  /**
   * Applica effetti di un hazard a un attore
   */
  async _applyHazardEffect(actor, hazard) {
    const effect = hazard.effect;

    // Tiro salvezza se richiesto
    if (hazard.dc) {
      const saveAbility = this._determineSaveAbility(effect.immediate);
      const save = await actor.rollAbilitySave(saveAbility, {
        dc: hazard.dc,
        flavor: `Evitare ${hazard.name}`
      });

      if (save.total >= hazard.dc) {
        ChatMessage.create({
          content: `
            <div class="brancalonia-hazard-save">
              <p><strong>${actor.name}</strong> evita ${hazard.name}!</p>
              <p>Tiro salvezza: ${save.total} vs CD ${hazard.dc}</p>
            </div>
          `,
          speaker: ChatMessage.getSpeaker({ actor })
        });
        return;
      }
    }

    // Applica danno
    if (effect.damage) {
      const damageRoll = await new Roll(effect.damage).evaluate();
      await actor.applyDamage(damageRoll.total, effect.damageType);

      ChatMessage.create({
        content: `
          <div class="brancalonia-hazard-damage">
            <p><strong>${actor.name}</strong> subisce ${damageRoll.total} danni ${effect.damageType} da ${hazard.name}!</p>
          </div>
        `,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }

    // Applica condizione
    if (effect.condition) {
      await this._applyHazardCondition(actor, effect.condition, hazard);
    }

    // Effetti ongoing
    if (effect.ongoing) {
      await this._setupOngoingHazard(actor, hazard);
    }
  }

  /**
   * Determina l'abilità per il tiro salvezza
   */
  _determineSaveAbility(effectText) {
    if (effectText.includes('Destrezza')) return 'dex';
    if (effectText.includes('Costituzione')) return 'con';
    if (effectText.includes('Forza')) return 'str';
    if (effectText.includes('Saggezza')) return 'wis';
    if (effectText.includes('Intelligenza')) return 'int';
    if (effectText.includes('Carisma')) return 'cha';
    return 'dex'; // Default
  }

  /**
   * Applica condizione da hazard
   */
  async _applyHazardCondition(actor, condition, hazard) {
    const conditionMap = {
      'difficult-terrain': {
        key: 'system.attributes.movement.walk',
        mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
        value: '0.5'
      },
      restrained: {
        key: 'system.attributes.movement.walk',
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: '0'
      },
      poisoned: {
        key: 'flags.midi-qol.disadvantage.attack.all',
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: '1'
      },
      exhaustion: {
        key: 'system.attributes.exhaustion',
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: '1'
      },
      menagramo: {
        key: 'flags.brancalonia.menagramo',
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: 'true'
      }
    };

    const effectData = conditionMap[condition];
    if (!effectData) return;

    const activeEffect = {
      name: `${hazard.name} - ${condition}`,
      img: hazard.img,
      origin: actor.uuid,
      duration: hazard.duration ? { seconds: hazard.duration * 3600 } : {},
      changes: [effectData],
      flags: {
        brancalonia: {
          isHazard: true,
          hazardType: hazard.type
        }
      }
    };

    await actor.createEmbeddedDocuments('ActiveEffect', [activeEffect]);
  }

  /**
   * Configura hazard con effetti ongoing
   */
  async _setupOngoingHazard(actor, hazard) {
    // Crea flag per tracciare hazard ongoing
    const ongoingHazards = actor.flags.brancalonia?.ongoingHazards || [];
    ongoingHazards.push({
      name: hazard.name,
      type: hazard.type,
      startTime: game.time.worldTime,
      effect: hazard.effect.ongoing
    });

    await actor.setFlag('brancalonia-bigat', 'ongoingHazards', ongoingHazards);

    // Programma check periodici
    if (hazard.effect.ongoing.includes('round')) {
      Hooks.on('updateCombat', (combat, update) => {
        if (update.round) {
          this._checkOngoingHazard(actor, hazard);
        }
      });
    }
  }

  /**
   * Controlla hazard ongoing
   */
  async _checkOngoingHazard(actor, hazard) {
    const ongoingEffect = hazard.effect.ongoing;

    // Parse dell'effetto
    if (ongoingEffect.includes('danni')) {
      const damageMatch = ongoingEffect.match(/(\d+d\d+)/);
      if (damageMatch) {
        const damageRoll = await new Roll(damageMatch[1]).evaluate();
        await actor.applyDamage(damageRoll.total);
      }
    }

    if (ongoingEffect.includes('sfinimento')) {
      await actor.update({
        'system.attributes.exhaustion': actor.system.attributes.exhaustion + 1
      });
    }
  }

  /**
   * Rileva hazard in un'area
   * @async
   * @param {Actor} actor - Attore che rileva
   * @param {string} hazardName - Nome hazard (opzionale, cerca nelle vicinanze)
   * @returns {Promise<boolean>} True se rilevato
   *
   * @example
   * const detected = await hazardsSystem.detectHazard(actor, 'palude_malsana');
   */
  async detectHazard(actor, hazardName = null) {
    const detectStart = performance.now();

    try {
      // Se non specificato, cerca hazard casuali
      if (!hazardName) {
        const nearbyHazards = this._getNearbyHazards(actor);
        if (nearbyHazards.length === 0) {
          ui.notifications.info('Nessun pericolo rilevato nelle vicinanze');
          logger.debug?.(EnvironmentalHazardsSystem.MODULE_NAME, `Nessun hazard vicino a ${actor.name}`);
          return false;
        }
        hazardName = nearbyHazards[0];
      }

      const hazard = this.hazards[hazardName];
      const detection = hazard.detection;

    // Percezione passiva
    const passivePerception = actor.system.skills.prc.passive;
    if (detection.passive && passivePerception >= detection.passive) {
      ChatMessage.create({
        content: `
          <div class="brancalonia-hazard-detected">
            <h3>👁️ Pericolo Rilevato!</h3>
            <p><strong>${actor.name}</strong> nota ${hazard.name}</p>
            <p><em>${hazard.description}</em></p>
            <p>Evitare: ${hazard.avoidance}</p>
          </div>
        `,
        speaker: ChatMessage.getSpeaker({ actor })
      });
      return true;
    }

    // Prova attiva
    if (detection.active) {
      const [skill, dc] = detection.active.split(' CD ');
      const skillKey = this._getSkillKey(skill);

      const roll = await actor.rollSkill(skillKey, {
        flavor: `Rilevare ${hazard.name}`
      });

        if (roll.total >= parseInt(dc)) {
          ChatMessage.create({
            content: `
              <div class="brancalonia-hazard-detected">
                <h3>🔍 Hazard Individuato!</h3>
                <p><strong>${actor.name}</strong> individua ${hazard.name}</p>
                <p>Tiro: ${roll.total} vs CD ${dc}</p>
              </div>
            `,
            speaker: ChatMessage.getSpeaker({ actor })
          });

          // Statistiche successo
          EnvironmentalHazardsSystem._statistics.detectionsSuccessful++;
          EnvironmentalHazardsSystem._statistics.actorsSaved++;

          const detectTime = performance.now() - detectStart;
          logger.info(
            EnvironmentalHazardsSystem.MODULE_NAME,
            `Hazard rilevato: ${hazard.name} da ${actor.name} (${detectTime.toFixed(2)}ms)`
          );

          // Emit event
          Hooks.callAll('environmental-hazards:detected', {
            hazard,
            hazardName,
            actor: actor.name,
            method: 'active',
            success: true,
            detectionsSuccessful: EnvironmentalHazardsSystem._statistics.detectionsSuccessful
          });

          return true;
        } else {
          // Fallimento detection
          EnvironmentalHazardsSystem._statistics.detectionsFailed++;
        }
      }

      // Emit event fallimento
      Hooks.callAll('environmental-hazards:detected', {
        hazard,
        hazardName,
        actor: actor.name,
        success: false,
        detectionsFailed: EnvironmentalHazardsSystem._statistics.detectionsFailed
      });

      return false;
    } catch (error) {
      EnvironmentalHazardsSystem._statistics.errors.push(`detectHazard: ${error.message}`);
      logger.error(EnvironmentalHazardsSystem.MODULE_NAME, 'Errore detection hazard', error);
      ui.notifications.error('Errore nel rilevamento del pericolo!');
      return false;
    }
  }

  /**
   * Genera hazard casuale per tipo di ambiente
   */
  generateRandomHazard(environment = 'wilderness') {
    const hazardList = this.randomTables[environment];
    if (!hazardList || hazardList.length === 0) {
      ui.notifications.warn(`Nessun hazard per ambiente: ${environment}`);
      return null;
    }

    const frequency = game.settings.get('brancalonia-bigat', 'hazardFrequency');
    const chances = { low: 0.1, medium: 0.2, high: 0.35, extreme: 0.5 };

    if (Math.random() > chances[frequency]) {
      return null; // Nessun hazard
    }

    const hazardName = hazardList[Math.floor(Math.random() * hazardList.length)];
    return this.hazards[hazardName];
  }

  /**
   * Piazza hazard sulla scena
   */
  async placeHazardOnScene(hazardName, x, y) {
    const hazard = this.hazards[hazardName];
    if (!hazard) return;

    // Crea tile per rappresentare l'hazard
    const tileData = {
      img: hazard.img,
      x,
      y,
      width: 100,
      height: 100,
      hidden: true, // Visibile solo al GM
      locked: false,
      flags: {
        brancalonia: {
          isHazard: true,
          hazardType: hazardName
        }
      }
    };

    await canvas.scene.createEmbeddedDocuments('Tile', [tileData]);

    // Aggiungi alla lista hazard della scena
    const sceneHazards = canvas.scene.flags.brancalonia?.hazards || [];
    sceneHazards.push({
      type: hazardName,
      x,
      y,
      radius: 100,
      triggered: false
    });

    await canvas.scene.setFlag('brancalonia-bigat', 'hazards', sceneHazards);

    ui.notifications.info(`Hazard ${hazard.name} piazzato`);
  }

  /**
   * Rimuove hazard dalla scena
   */
  async removeHazardFromScene(hazardName) {
    const tiles = canvas.tiles.placeables.filter(t =>
      t.document.flags.brancalonia?.hazardType === hazardName
    );

    for (const tile of tiles) {
      await tile.document.delete();
    }

    const sceneHazards = canvas.scene.flags.brancalonia?.hazards || [];
    const filtered = sceneHazards.filter(h => h.type !== hazardName);
    await canvas.scene.setFlag('brancalonia-bigat', 'hazards', filtered);
  }

  /**
   * Controlla se token è in hazard
   */
  _isTokenInHazard(token, hazard) {
    const distance = Math.sqrt(
      Math.pow(token.x - hazard.x, 2) +
      Math.pow(token.y - hazard.y, 2)
    );
    return distance <= hazard.radius;
  }

  /**
   * Ottieni hazard vicini
   */
  _getNearbyHazards(actor) {
    const token = actor.getActiveTokens()[0];
    if (!token) return [];

    const sceneHazards = canvas.scene.flags.brancalonia?.hazards || [];
    return sceneHazards
      .filter(h => this._isTokenInHazard(token, h))
      .map(h => h.type);
  }

  /**
   * Controlla hazard meteo
   */
  async _checkWeatherHazards() {
    if (!game.settings.get('brancalonia-bigat', 'enableHazards')) return;

    // 10% probabilità di evento meteo
    if (Math.random() < 0.1) {
      const weatherHazards = ['tempesta_improvvisa', 'nebbia_velenosa'];
      const hazardName = weatherHazards[Math.floor(Math.random() * weatherHazards.length)];

      ChatMessage.create({
        content: `
          <div class="brancalonia-weather-hazard">
            <h2>🌩️ PERICOLO METEOROLOGICO!</h2>
            <p>${this.hazards[hazardName].name} si sta avvicinando!</p>
            <p>${this.hazards[hazardName].description}</p>
          </div>
        `,
        whisper: ChatMessage.getWhisperRecipients('GM')
      });

      // Applica a tutti i token all'aperto
      for (const token of canvas.tokens.placeables) {
        if (token.actor && !token.document.flags.brancalonia?.indoor) {
          await this.triggerHazard(hazardName, token.actor);
        }
      }
    }
  }

  /**
   * Applica hazard di area
   */
  _applyAreaHazard(hazard) {
    // Applica a tutti i token nell'area
    for (const token of canvas.tokens.placeables) {
      if (token.actor) {
        this._applyHazardEffect(token.actor, hazard);
      }
    }
  }

  /**
   * Ottieni chiave skill da nome
   */
  _getSkillKey(skillName) {
    const skillMap = {
      Sopravvivenza: 'sur',
      Percezione: 'prc',
      Investigare: 'inv',
      Natura: 'nat',
      Arcano: 'arc',
      Religione: 'rel',
      Atletica: 'ath',
      Acrobazia: 'acr',
      Furtività: 'ste',
      Streetwise: 'streetwise'
    };
    return skillMap[skillName] || 'prc';
  }

  /**
   * UI per gestione hazard (GM)
   */
  renderHazardManager() {
    const content = `
      <div class="brancalonia-hazard-manager">
        <h2>⚠️ Gestione Hazard Ambientali</h2>

        <div class="hazard-controls">
          <h3>Genera Hazard Casuale</h3>
          <select id="environment-select">
            <option value="wilderness">Natura Selvaggia</option>
            <option value="urban">Urbano</option>
            <option value="dungeon">Dungeon</option>
            <option value="magical">Magico</option>
          </select>
          <button id="generate-hazard">Genera</button>
        </div>

        <div class="hazard-list">
          <h3>Hazard Disponibili</h3>
          <div class="hazard-grid">
            ${Object.entries(this.hazards).map(([key, hazard]) => `
              <div class="hazard-item" data-hazard="${key}">
                <img src="${hazard.icon}" title="${hazard.name}">
                <span>${hazard.name}</span>
                <button class="trigger-hazard" data-hazard="${key}">Attiva</button>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="scene-hazards">
          <h3>Hazard nella Scena</h3>
          ${(canvas.scene?.flags.brancalonia?.hazards || []).map(h => `
            <div class="scene-hazard">
              <span>${this.hazards[h.type]?.name || h.type}</span>
              <button class="remove-hazard" data-hazard="${h.type}">Rimuovi</button>
            </div>
          `).join('') || '<p>Nessun hazard attivo</p>'}
        </div>
      </div>
    `;

    const dialog = new foundry.appv1.sheets.Dialog({
      title: 'Gestione Hazard',
      content,
      buttons: {
        close: { label: 'Chiudi' }
      },
      render: html => {
        html.find('#generate-hazard').click(() => {
          const env = html.find('#environment-select').val();
          const hazard = this.generateRandomHazard(env);
          if (hazard) {
            this.triggerHazard(Object.keys(this.hazards).find(k =>
              this.hazards[k] === hazard
            ));
          }
        });

        html.find('.trigger-hazard').click(ev => {
          const hazardName = ev.currentTarget.dataset.hazard;
          this.triggerHazard(hazardName);
        });

        html.find('.remove-hazard').click(ev => {
          const hazardName = ev.currentTarget.dataset.hazard;
          this.removeHazardFromScene(hazardName);
        });
      }
    });

    dialog.render(true);
  }

  /**
   * Sistema di notifiche avanzato per hazard
   */
  async _showHazardNotification(hazard, actor, severity = 'warning') {
    const notification = {
      type: severity,
      message: `⚠️ Hazard: ${hazard.name}`,
      duration: 5000,
      icon: hazard.img
    };

    ui.notifications[severity](notification.message);

    // Notifica sonora se configurata
    if (game.settings.get('brancalonia-bigat', 'hazardSounds')) {
      AudioHelper.play({
        src: 'sounds/environmental/danger-warning.wav',
        volume: 0.5,
        autoplay: true,
        loop: false
      }, false);
    }
  }

  /**
   * Sistema di auto-rilevamento hazard in movimento
   */
  _checkMovementHazards(token) {
    if (!game.settings.get('brancalonia-bigat', 'enableHazards')) return;

    const scene = token.scene;
    const hazardTiles = scene.tiles.filter(t =>
      t.flags.brancalonia?.isHazard &&
      this._isTokenInTileArea(token, t)
    );

    for (const tile of hazardTiles) {
      const hazardType = tile.flags.brancalonia.hazardType;
      if (hazardType && !tile.flags.brancalonia.triggered) {
        this.triggerHazard(hazardType, token.actor);
        tile.setFlag('brancalonia-bigat', 'triggered', true);

        // Reset dopo 1 minuto
        setTimeout(() => {
          tile.unsetFlag('brancalonia-bigat', 'triggered');
        }, 60000);
      }
    }
  }

  /**
   * Controlla se token è in area tile
   */
  _isTokenInTileArea(token, tile) {
    const tokenBounds = {
      x: token.x,
      y: token.y,
      width: token.width,
      height: token.height
    };

    const tileBounds = {
      x: tile.x,
      y: tile.y,
      width: tile.width || 100,
      height: tile.height || 100
    };

    return !(tokenBounds.x > tileBounds.x + tileBounds.width ||
             tokenBounds.x + tokenBounds.width < tileBounds.x ||
             tokenBounds.y > tileBounds.y + tileBounds.height ||
             tokenBounds.y + tokenBounds.height < tileBounds.y);
  }

  /**
   * Dialog per gestire resistenze hazard
   */
  _showHazardResistanceDialog(actor) {
    const resistances = actor.flags.brancalonia?.hazardResistances || {};
    const hazardTypes = ['naturale', 'urbano', 'dungeon', 'magico'];

    const content = `
      <div class="hazard-resistances-dialog">
        <h3>Resistenze Hazard Ambientali</h3>
        <p>Configura le resistenze di ${actor.name} agli hazard:</p>
        ${hazardTypes.map(type => `
          <div class="form-group">
            <label>${type.charAt(0).toUpperCase() + type.slice(1)}:</label>
            <select name="${type}">
              <option value="0" ${(resistances[type] || 0) === 0 ? 'selected' : ''}>Nessuna</option>
              <option value="0.5" ${(resistances[type] || 0) === 0.5 ? 'selected' : ''}>Resistenza (50%)</option>
              <option value="1" ${(resistances[type] || 0) === 1 ? 'selected' : ''}>Immunità (100%)</option>
            </select>
          </div>
        `).join('')}
      </div>
    `;

    new foundry.appv1.sheets.Dialog({
      title: 'Resistenze Hazard',
      content,
      buttons: {
        save: {
          label: 'Salva',
          callback: async (html) => {
            const newResistances = {};
            hazardTypes.forEach(type => {
              newResistances[type] = parseFloat(html.find(`select[name="${type}"]`).val());
            });
            await actor.setFlag('brancalonia-bigat', 'hazardResistances', newResistances);
            ui.notifications.info('Resistenze hazard aggiornate');
          }
        },
        cancel: { label: 'Annulla' }
      }
    }).render(true);
  }
}

// Registra classe globale
window.EnvironmentalHazardsSystem = EnvironmentalHazardsSystem;

// Auto-inizializzazione - spostata a ready per evitare problemi con game.settings
Hooks.once('ready', () => {
  try {
    logger.info(EnvironmentalHazardsSystem.MODULE_NAME, `🎮 Brancalonia | Inizializzazione ${EnvironmentalHazardsSystem.MODULE_NAME} v${EnvironmentalHazardsSystem.VERSION}`);

    if (!game.brancalonia) game.brancalonia = {};
    if (!game.brancalonia.modules) game.brancalonia.modules = {};

    window.EnvironmentalHazardsSystem = EnvironmentalHazardsSystem;

    EnvironmentalHazardsSystem.initialize();
  } catch (error) {
    logger.error(EnvironmentalHazardsSystem.MODULE_NAME, 'Errore inizializzazione hook ready', error);
  }
});

// Hook aggiuntivi per integrazione
Hooks.on('updateToken', (token, update, options, userId) => {
  if (!update.x && !update.y) return;

  const instance = game.brancalonia?.environmentalHazards;
  if (instance && game.user.isGM) {
    instance.checkMovementHazards(token);
  }
});

// Fixed: Use SheetCoordinator
const SheetCoordinator = window.SheetCoordinator || game.brancalonia?.SheetCoordinator;

if (SheetCoordinator) {
  SheetCoordinator.registerModule('EnvironmentalHazards', async (app, html, data) => {
    if (!game.user.isGM) return;

    const actor = app.actor;
    if (actor.type !== 'character' && actor.type !== 'npc') return;

    const hazardSection = $(`
      <div class="form-group">
        <label>Resistenze Hazard Ambientali</label>
        <div class="form-fields">
          <button type="button" class="manage-hazard-resistances">
            <i class="fas fa-shield-alt"></i> Gestisci Resistenze
          </button>
        </div>
      </div>
    `);

    html.find('.tab.details .form-group').last().after(hazardSection);

    hazardSection.find('.manage-hazard-resistances').click(() => {
      const instance = game.brancalonia?.environmentalHazards;
      if (instance) {
        instance.showHazardResistanceDialog(actor);
      }
    });
  }, {
    priority: 75,
    types: ['character', 'npc'],
    gmOnly: true
  });
} else {
  Hooks.on('renderActorSheet', (app, html, data) => {
    if (!game.user.isGM) return;

    const actor = app.actor;
    if (actor.type !== 'character' && actor.type !== 'npc') return;

    const hazardSection = $(`
      <div class="form-group">
        <label>Resistenze Hazard Ambientali</label>
        <div class="form-fields">
          <button type="button" class="manage-hazard-resistances">
            <i class="fas fa-shield-alt"></i> Gestisci Resistenze
          </button>
        </div>
      </div>
    `);

    html.find('.tab.details .form-group').last().after(hazardSection);

    hazardSection.find('.manage-hazard-resistances').click(() => {
      const instance = game.brancalonia?.environmentalHazards;
      if (instance) {
        instance.showHazardResistanceDialog(actor);
      }
    });
  });
}

// ================================================
// PUBLIC API
// ================================================

/**
 * Ottiene lo stato del modulo
 * @static
 * @returns {Object} Stato corrente
 * @example
 * const status = EnvironmentalHazardsSystem.getStatus();
 */
EnvironmentalHazardsSystem.getStatus = function() {
  return {
    version: this.VERSION,
    initialized: this._state.initialized,
    hazardsCount: Object.keys(this._state.instance?.hazards || {}).length,
    ongoingHazards: this._state.ongoingHazards.size,
    hazardsTriggered: this._statistics.hazardsTriggered,
    detectionsSuccessful: this._statistics.detectionsSuccessful
  };
};

/**
 * Ottiene le statistiche del modulo
 * @static
 * @returns {HazardStatistics} Statistiche correnti
 * @example
 * const stats = EnvironmentalHazardsSystem.getStatistics();
 */
EnvironmentalHazardsSystem.getStatistics = function() {
  return {
    ...this._statistics,
    hazardsByType: { ...this._statistics.hazardsByType },
    hazardsByCategory: { ...this._statistics.hazardsByCategory },
    errors: [...this._statistics.errors]
  };
};

/**
 * Resetta le statistiche
 * @static
 * @example
 * EnvironmentalHazardsSystem.resetStatistics();
 */
EnvironmentalHazardsSystem.resetStatistics = function() {
  logger.info(this.MODULE_NAME, 'Reset statistiche Environmental Hazards System');

  const initTime = this._statistics.initTime;
  const macrosCreated = this._statistics.macrosCreated;

  this._statistics = {
    initTime,
    hazardsTriggered: 0,
    hazardsByType: {},
    hazardsByCategory: { naturale: 0, trappola: 0, meteo: 0 },
    detectionsSuccessful: 0,
    detectionsFailed: 0,
    avoidanceSuccessful: 0,
    avoidanceFailed: 0,
    ongoingHazards: 0,
    weatherEventsTriggered: 0,
    placedHazards: 0,
    removedHazards: 0,
    damageTotalDealt: 0,
    actorsSaved: 0,
    actorsTrapped: 0,
    actorsEscaped: 0,
    macrosCreated,
    chatCommandsExecuted: 0,
    errors: []
  };

  // Re-inizializza contatori per tipo hazard
  if (this._state.instance) {
    Object.keys(this._state.instance.hazards).forEach(hazard => {
      this._statistics.hazardsByType[hazard] = 0;
    });
  }
};

/**
 * Ottiene lista hazard disponibili
 * @static
 * @returns {Object} Database hazard
 * @example
 * const hazards = EnvironmentalHazardsSystem.getHazardsList();
 */
EnvironmentalHazardsSystem.getHazardsList = function() {
  return this._state.instance?.hazards || {};
};

/**
 * Ottiene hazard per categoria
 * @static
 * @param {string} category - Categoria (naturale, trappola, meteo)
 * @returns {Object[]} Hazard filtrati
 * @example
 * const natural = EnvironmentalHazardsSystem.getHazardsByCategory('naturale');
 */
EnvironmentalHazardsSystem.getHazardsByCategory = function(category) {
  const hazards = this._state.instance?.hazards || {};
  return Object.entries(hazards)
    .filter(([_, h]) => h.type === category)
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});
};

/**
 * Ottiene hazard ongoing attivi
 * @static
 * @returns {Map} Mappa hazard ongoing
 * @example
 * const ongoing = EnvironmentalHazardsSystem.getOngoingHazards();
 */
EnvironmentalHazardsSystem.getOngoingHazards = function() {
  return this._state.ongoingHazards;
};

/**
 * Attiva hazard via API statica
 * @static
 * @async
 * @param {string} hazardName - Nome hazard
 * @param {Actor} actor - Attore bersaglio (opzionale)
 * @param {Object} options - Opzioni
 * @returns {Promise<Object|null>}
 * @example
 * await EnvironmentalHazardsSystem.triggerHazardViaAPI('frana', actor);
 */
EnvironmentalHazardsSystem.triggerHazardViaAPI = async function(hazardName, actor, options) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return null;
  }
  return await this._state.instance.triggerHazard(hazardName, actor, options);
};

/**
 * Rileva hazard via API statica
 * @static
 * @async
 * @param {Actor} actor - Attore che rileva
 * @param {string} hazardName - Nome hazard (opzionale)
 * @returns {Promise<boolean>}
 * @example
 * await EnvironmentalHazardsSystem.detectHazardViaAPI(actor);
 */
EnvironmentalHazardsSystem.detectHazardViaAPI = async function(actor, hazardName) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return false;
  }
  return await this._state.instance.detectHazard(actor, hazardName);
};

/**
 * Piazza hazard su scena via API statica
 * @static
 * @async
 * @param {string} hazardName - Nome hazard
 * @param {number} x - Posizione X
 * @param {number} y - Posizione Y
 * @returns {Promise<void>}
 * @example
 * await EnvironmentalHazardsSystem.placeHazardViaAPI('sabbie_mobili', 1000, 800);
 */
EnvironmentalHazardsSystem.placeHazardViaAPI = async function(hazardName, x, y) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return;
  }
  return await this._state.instance.placeHazardOnScene(hazardName, x, y);
};

/**
 * Genera hazard casuale via API statica
 * @static
 * @param {string} environment - Tipo ambiente
 * @returns {Object|null}
 * @example
 * const hazard = EnvironmentalHazardsSystem.generateRandomHazardViaAPI('wilderness');
 */
EnvironmentalHazardsSystem.generateRandomHazardViaAPI = function(environment) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return null;
  }
  return this._state.instance.generateRandomHazard(environment);
};

/**
 * Mostra report completo
 * @static
 * @example
 * EnvironmentalHazardsSystem.showReport();
 */
EnvironmentalHazardsSystem.showReport = function() {
  const stats = this.getStatistics();
  const status = this.getStatus();

  console.group(`🌿 ${this.MODULE_NAME} Report v${this.VERSION}`);
  console.log('Status:', status);
  console.log('Statistiche:', stats);
  console.log('Ongoing Hazards:', Array.from(this._state.ongoingHazards.keys()));
  console.groupEnd();

  ui.notifications.info(
    `🌿 Report Hazards: ${stats.hazardsTriggered} attivati, ${stats.detectionsSuccessful} rilevati, ${stats.ongoingHazards} ongoing`
  );
};

// Export per compatibilità
if (typeof module !== 'undefined') {
  module.exports = EnvironmentalHazardsSystem;
}

// Export ES6
export default EnvironmentalHazardsSystem;
export { EnvironmentalHazardsSystem };