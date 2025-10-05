/**
 * @fileoverview Brancalonia Dice So Nice Integration
 * 
 * Sistema completo per integrare Dice So Nice con temi rinascimentali Brancalonia.
 * 
 * Features:
 * - 6 colorset tematici (Oro, Pergamena, Smeraldo, Vino, Veneziano, Ceralacca)
 * - Notifiche per critici (nat 20) e fumble (nat 1)
 * - Suoni opzionali per eventi critici
 * - Settings personalizzabili
 * - Funzione di test per development
 * - Supporto cambi tema dinamici
 * 
 * @version 3.0.0
 * @author Brancalonia Module Team
 * @requires brancalonia-logger.js
 * @requires dice-so-nice (Foundry VTT Module)
 */

import { createModuleLogger } from './brancalonia-logger.js';

const MODULE_LABEL = 'DiceTheme';
const moduleLogger = createModuleLogger(MODULE_LABEL);
/**
 * @typedef {Object} DiceThemeStatistics
 * @property {number} initTime - Tempo di inizializzazione (ms)
 * @property {number} colorsetsRegistered - Colorset registrati
 * @property {number} criticalHits - Colpi critici rilevati
 * @property {number} fumbles - Fumble rilevati
 * @property {number} notificationsShown - Notifiche mostrate
 * @property {number} soundsPlayed - Suoni riprodotti
 * @property {number} testRollsExecuted - Test eseguiti
 * @property {number} themeChanges - Cambi tema
 * @property {string[]} errors - Errori registrati
 */

/**
 * @typedef {Object} ColorsetConfig
 * @property {string} name - Nome interno colorset
 * @property {string} description - Descrizione localizzata
 * @property {string} foreground - CSS var per foreground
 * @property {string} foregroundFallback - Fallback hex foreground
 * @property {string} background - CSS var per background
 * @property {string} backgroundFallback - Fallback hex background
 * @property {string} edge - CSS var per edge
 * @property {string} edgeFallback - Fallback hex edge
 * @property {string} outline - CSS var per outline
 * @property {string} outlineFallback - Fallback hex outline
 * @property {string} material - Materiale dadi ('metal'|'plastic'|'glass'|'wood')
 * @property {string} font - Font famiglia
 */

/**
 * Brancalonia Dice Theme Manager
 * Sistema completo per integrazione Dice So Nice
 * 
 * @class BrancaloniaDiceTheme
 */
class BrancaloniaDiceTheme {
  static VERSION = '3.0.0';
  static MODULE_NAME = MODULE_LABEL;
  static ID = 'brancalonia-dice-theme';

  /**
   * Statistiche del modulo
   * @type {DiceThemeStatistics}
   * @private
   */
  static _statistics = {
    initTime: 0,
    colorsetsRegistered: 0,
    criticalHits: 0,
    fumbles: 0,
    notificationsShown: 0,
    soundsPlayed: 0,
    testRollsExecuted: 0,
    themeChanges: 0,
    errors: []
  };

  /**
   * Stato del modulo
   * @type {Object}
   * @private
   */
  static _state = {
    initialized: false,
    dice3dReady: false,
    colorsets: []
  };

  /**
   * Configurazioni colorset
   * @type {ColorsetConfig[]}
   * @private
   */
  static COLORSET_CONFIGS = [
    {
      name: 'branca-goldwax',
      description: 'Brancalonia — Oro e Ceralacca',
      foreground: '--bcl-ink-strong',
      foregroundFallback: '#1C140D',
      background: '--bcl-gold',
      backgroundFallback: '#C9A54A',
      edge: '--bcl-ink-strong',
      edgeFallback: '#1C140D',
      outline: '--bcl-ink-strong',
      outlineFallback: '#1C140D',
      material: 'metal',
      font: 'Alegreya'
    },
    {
      name: 'branca-parchment',
      description: 'Brancalonia — Pergamena e Inchiostro',
      foreground: '--bcl-ink-strong',
      foregroundFallback: '#1C140D',
      background: '--bcl-paper-strong',
      backgroundFallback: '#D9C38F',
      edge: '--bcl-border',
      edgeFallback: '#B99D6B',
      outline: '--bcl-border',
      outlineFallback: '#B99D6B',
      material: 'plastic',
      font: 'Alegreya'
    },
    {
      name: 'branca-emerald',
      description: 'Brancalonia — Smeraldo e Oro',
      foreground: '--bcl-gold',
      foregroundFallback: '#C9A54A',
      background: '--bcl-emerald',
      backgroundFallback: '#2E7D64',
      edge: '--bcl-gold',
      edgeFallback: '#C9A54A',
      outline: '--bcl-ink-strong',
      outlineFallback: '#1C140D',
      material: 'glass',
      font: 'Cinzel'
    },
    {
      name: 'branca-wine',
      description: 'Brancalonia — Vino e Oro',
      foreground: '--bcl-gold',
      foregroundFallback: '#C9A54A',
      background: '--bcl-accent-strong',
      backgroundFallback: '#5E1715',
      edge: '--bcl-gold',
      edgeFallback: '#C9A54A',
      outline: '--bcl-gold',
      outlineFallback: '#C9A54A',
      material: 'glass',
      font: 'Cinzel'
    },
    {
      name: 'branca-venetian',
      description: 'Brancalonia — Rosso Veneziano',
      foreground: '--bcl-gold',
      foregroundFallback: '#C9A54A',
      background: '--bcl-accent',
      backgroundFallback: '#8C2B27',
      edge: '--bcl-gold',
      edgeFallback: '#C9A54A',
      outline: '--bcl-accent-strong',
      outlineFallback: '#5E1715',
      material: 'metal',
      font: 'Cinzel'
    },
    {
      name: 'branca-waxseal',
      description: 'Brancalonia — Sigillo di Ceralacca',
      foreground: '--bcl-gold',
      foregroundFallback: '#C9A54A',
      background: '--bcl-seal-wax',
      backgroundFallback: '#8E1D22',
      edge: '--bcl-ribbon',
      edgeFallback: '#7E1F1B',
      outline: '--bcl-gold',
      outlineFallback: '#C9A54A',
      material: 'wood',
      font: 'Cinzel'
    }
  ];

  /**
   * Inizializza il modulo Dice Theme
   * Registra hooks, settings e prepara colorset
   * 
   * @static
   * @returns {Promise<void>}
   */
  static async initialize() {
    const startTime = performance.now();

    try {
      moduleLogger.info(`Inizializzazione Dice Theme v${this.VERSION}`);

      // Registra hooks
      this._registerHooks();

      // Registra settings
      this._registerSettings();

      this._state.initialized = true;
      this._statistics.initTime = performance.now() - startTime;

      moduleLogger.info(
        this.MODULE_NAME,
        `✅ Inizializzazione completata in ${this._statistics.initTime.toFixed(2)}ms`
      );

      // Emit event
      Hooks.callAll('dice-theme:initialized', {
        version: this.VERSION,
        colorsets: this.COLORSET_CONFIGS.length
      });
    } catch (error) {
      this._statistics.errors.push(error.message);
      moduleLogger.error('Errore durante inizializzazione', error);
      throw error;
    }
  }

  /**
   * Registra tutti gli hooks necessari
   * @private
   * @static
   */
  static _registerHooks() {
    try {
      // Hook: diceSoNiceReady
      Hooks.once('diceSoNiceReady', (dice3d) => this._onDiceSoNiceReady(dice3d));

      // Hook: diceSoNiceRollComplete
      Hooks.on('diceSoNiceRollComplete', (chatMessageID) => this._onRollComplete(chatMessageID));

      // Hook: brancaloniaThemeChanged
      Hooks.on('brancaloniaThemeChanged', (theme) => this._onThemeChanged(theme));

      moduleLogger.debug?.('3 hooks registrati');
    } catch (error) {
      this._statistics.errors.push(`Hook registration: ${error.message}`);
      moduleLogger.error('Errore registrazione hooks', error);
      throw error;
    }
  }

  /**
   * Registra settings del modulo
   * @private
   * @static
   */
  static _registerSettings() {
    try {
      // Setting: Notifiche critici/fumble
      game.settings.register('brancalonia-bigat', 'diceCriticalNotifications', {
        name: 'Notifiche Critici/Fumble',
        hint: 'Mostra notifiche quando tiri 1 o 20 su un d20 (solo per i tuoi tiri e token controllati)',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true
      });

      // Setting: Suoni critici/fumble
      game.settings.register('brancalonia-bigat', 'diceCriticalSounds', {
        name: 'Suoni Critici/Fumble',
        hint: 'Riproduci suoni speciali per critici e fumble (richiede file audio)',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false
      });

      // Setting: Colorset preferito
      game.settings.register('brancalonia-bigat', 'dicePreferredColorset', {
        name: 'Tema Dadi Preferito',
        hint: 'Il tuo tema di dadi preferito. Ricorda: devi impostarlo manualmente nelle impostazioni di Dice So Nice!',
        scope: 'client',
        config: true,
        type: String,
        choices: {
          'branca-goldwax': '🥇 Oro e Ceralacca',
          'branca-parchment': '📜 Pergamena e Inchiostro',
          'branca-emerald': '💎 Smeraldo e Oro',
          'branca-wine': '🍷 Vino e Oro',
          'branca-venetian': '🔴 Rosso Veneziano',
          'branca-waxseal': '🕯️ Sigillo di Ceralacca'
        },
        default: 'branca-goldwax',
        onChange: (value) => {
          ui.notifications.info(`🎲 Tema preferito: ${value}. Ricorda di impostarlo in Dice So Nice!`);
        }
      });

      moduleLogger.debug?.('3 settings registrati');
    } catch (error) {
      this._statistics.errors.push(`Settings registration: ${error.message}`);
      moduleLogger.error('Errore registrazione settings', error);
      throw error;
    }
  }

  /**
   * Handler per hook diceSoNiceReady
   * Registra tutti i colorset
   * 
   * @private
   * @static
   * @param {Object} dice3d - API Dice So Nice
   */
  static _onDiceSoNiceReady(dice3d) {
    try {
      // Verifica che Dice So Nice sia attivo
      if (!game.modules.get('dice-so-nice')?.active) {
        moduleLogger.info('Dice So Nice non attivo, skip registrazione tema');
        return;
      }

      // Verifica che dice3d sia valido
      if (!dice3d) {
        moduleLogger.error('Dice So Nice API non disponibile');
        return;
      }

      // Registra tutti i colorset usando la factory
      this.COLORSET_CONFIGS.forEach(config => {
        const colorset = this._createColorset(config);
        dice3d.addColorset(colorset, 'default');
        this._statistics.colorsetsRegistered++;
        this._state.colorsets.push(config.name);
        moduleLogger.debug?.(`Registrato colorset: ${config.description}`);
      });

      this._state.dice3dReady = true;
      moduleLogger.info(`Caricati ${this._statistics.colorsetsRegistered} colorset per Dice So Nice`);

      // Emit event
      Hooks.callAll('dice-theme:colorsets-registered', {
        count: this._statistics.colorsetsRegistered,
        colorsets: this._state.colorsets
      });
    } catch (error) {
      this._statistics.errors.push(`Colorset registration: ${error.message}`);
      moduleLogger.error('Errore registrazione colorset', error);
    }
  }

  /**
   * Handler per hook diceSoNiceRollComplete
   * Gestisce notifiche per critici e fumble
   * 
   * @private
   * @static
   * @param {string} chatMessageID - ID del messaggio chat
   */
  static _onRollComplete(chatMessageID) {
    try {
      // Controlla se le notifiche sono abilitate
      if (!game.settings.get('brancalonia-bigat', 'diceCriticalNotifications')) {
        return;
      }

      const message = game.messages.get(chatMessageID);
      if (!message) return;

      // Filtra per giocatore corrente
      if (!this._isPlayerMessage(message)) {
        return;
      }

      const roll = message.rolls?.[0];
      if (!roll) return;

      // Controlla se è un d20
      const d20Die = roll.dice.find(d => d.faces === 20);
      if (!d20Die) return;

      const d20Result = d20Die.results?.[0]?.result;
      if (!d20Result) return;

      // Gestisci critici e fumble
      if (d20Result === 20) {
        this._handleCriticalHit();
      } else if (d20Result === 1) {
        this._handleFumble();
      }
    } catch (error) {
      this._statistics.errors.push(`Roll complete: ${error.message}`);
      moduleLogger.error('Errore gestione roll complete', error);
    }
  }

  /**
   * Handler per hook brancaloniaThemeChanged
   * Re-registra colorset quando cambia il tema
   * 
   * @private
   * @static
   * @param {Object} theme - Nuovo tema
   */
  static _onThemeChanged(theme) {
    try {
      if (game.modules.get('dice-so-nice')?.active && game.dice3d) {
        moduleLogger.info('Tema cambiato: aggiornamento colorset dadi');
        Hooks.call('diceSoNiceReady', game.dice3d);
        this._statistics.themeChanges++;

        // Emit event
        Hooks.callAll('dice-theme:theme-changed', { theme });
      }
    } catch (error) {
      this._statistics.errors.push(`Theme change: ${error.message}`);
      moduleLogger.error('Errore durante cambio tema', error);
    }
  }

  /**
   * Verifica se un messaggio è del giocatore corrente
   * @private
   * @static
   * @param {ChatMessage} message - Messaggio da verificare
   * @returns {boolean}
   */
  static _isPlayerMessage(message) {
    // 1. Controlla se il messaggio è sussurrato ad altri
    if (message.whisper?.length > 0 && !message.whisper.includes(game.user.id)) {
      return false;
    }

    // 2. Controlla se il tiro è del giocatore corrente o di un token controllato
    const isPlayerRoll = message.user?.id === game.user.id;
    const speaker = message.speaker;
    let isControlledToken = false;

    if (speaker?.token && canvas.tokens) {
      const token = canvas.tokens.get(speaker.token);
      isControlledToken = token?.isOwner || false;
    }

    return isPlayerRoll || isControlledToken;
  }

  /**
   * Gestisce colpo critico (nat 20)
   * @private
   * @static
   */
  static _handleCriticalHit() {
    try {
      ui.notifications.info('⚔️ Colpo Critico! Magnifico!', { permanent: false });
      this._statistics.criticalHits++;
      this._statistics.notificationsShown++;

      // Suono critico (se abilitato)
      if (game.settings.get('brancalonia-bigat', 'diceCriticalSounds')) {
        this._playSound('critical-hit');
      }

      // Emit event
      Hooks.callAll('dice-theme:critical-hit', {
        criticalHits: this._statistics.criticalHits
      });

      moduleLogger.debug?.(`Colpo critico rilevato (totale: ${this._statistics.criticalHits})`);
    } catch (error) {
      this._statistics.errors.push(`Critical hit: ${error.message}`);
      moduleLogger.error('Errore gestione critico', error);
    }
  }

  /**
   * Gestisce fumble (nat 1)
   * @private
   * @static
   */
  static _handleFumble() {
    try {
      ui.notifications.warn('💀 Fallimento Critico! Maledizione!', { permanent: false });
      this._statistics.fumbles++;
      this._statistics.notificationsShown++;

      // Suono fumble (se abilitato)
      if (game.settings.get('brancalonia-bigat', 'diceCriticalSounds')) {
        this._playSound('fumble');
      }

      // Emit event
      Hooks.callAll('dice-theme:fumble', {
        fumbles: this._statistics.fumbles
      });

      moduleLogger.debug?.(`Fumble rilevato (totale: ${this._statistics.fumbles})`);
    } catch (error) {
      this._statistics.errors.push(`Fumble: ${error.message}`);
      moduleLogger.error('Errore gestione fumble', error);
    }
  }

  /**
   * Riproduce un suono
   * @private
   * @static
   * @param {string} type - Tipo suono ('critical-hit' | 'fumble')
   */
  static async _playSound(type) {
    try {
      // Prova prima MP3, poi WAV
      const formats = ['mp3', 'wav'];

      for (const format of formats) {
        try {
          await AudioHelper.play({
            src: `modules/brancalonia-bigat/sounds/${type}.${format}`,
            volume: 0.5,
            autoplay: true,
            loop: false
          }, false);

          this._statistics.soundsPlayed++;
          moduleLogger.debug?.(`Suono riprodotto: ${type}.${format}`);
          return; // Successo, esci
        } catch (err) {
          // Prova formato successivo
        }
      }

      // Nessun formato trovato
      moduleLogger.debug?.(`Suono ${type} non trovato`);
    } catch (error) {
      this._statistics.errors.push(`Play sound: ${error.message}`);
      moduleLogger.error('Errore riproduzione suono', error);
    }
  }

  /**
   * Factory per creare colorset
   * @private
   * @static
   * @param {ColorsetConfig} config - Configurazione colorset
   * @returns {Object} Colorset per Dice So Nice
   */
  static _createColorset(config) {
    return {
      name: config.name,
      description: config.description,
      category: 'Brancalonia',
      foreground: this._getCSSVar(config.foreground, config.foregroundFallback),
      background: this._getCSSVar(config.background, config.backgroundFallback),
      edge: this._getCSSVar(config.edge, config.edgeFallback),
      outline: this._getCSSVar(config.outline, config.outlineFallback),
      material: config.material,
      font: config.font,
      fontScale: {
        d100: 0.8,
        d20: 1.0,
        d12: 1.0,
        d10: 1.0,
        d8: 1.0,
        d6: 1.2,
        d4: 1.0
      }
    };
  }

  /**
   * Ottiene valore CSS variable
   * @private
   * @static
   * @param {string} name - Nome CSS variable
   * @param {string} fallback - Valore fallback
   * @returns {string} Valore CSS o fallback
   */
  static _getCSSVar(name, fallback) {
    try {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      return value || fallback;
    } catch (error) {
      return fallback;
    }
  }

  // ================================================
  // PUBLIC API
  // ================================================

  /**
   * Ottiene lo stato del modulo
   * @static
   * @returns {Object} Stato corrente
   * @example
   * const status = BrancaloniaDiceTheme.getStatus();
   * console.log(status.initialized); // true
   */
  static getStatus() {
    return {
      version: this.VERSION,
      initialized: this._state.initialized,
      dice3dReady: this._state.dice3dReady,
      colorsetsRegistered: this._statistics.colorsetsRegistered,
      colorsets: [...this._state.colorsets],
      dice3dActive: game.modules.get('dice-so-nice')?.active || false
    };
  }

  /**
   * Ottiene le statistiche del modulo
   * @static
   * @returns {DiceThemeStatistics} Statistiche correnti
   * @example
   * const stats = BrancaloniaDiceTheme.getStatistics();
   * console.log(`Critici: ${stats.criticalHits}`);
   */
  static getStatistics() {
    return {
      ...this._statistics,
      errors: [...this._statistics.errors]
    };
  }

  /**
   * Resetta le statistiche
   * @static
   * @example
   * BrancaloniaDiceTheme.resetStatistics();
   */
  static resetStatistics() {
    moduleLogger.info('Reset statistiche Dice Theme');
    
    const initTime = this._statistics.initTime;
    const colorsetsRegistered = this._statistics.colorsetsRegistered;

    this._statistics = {
      initTime,
      colorsetsRegistered,
      criticalHits: 0,
      fumbles: 0,
      notificationsShown: 0,
      soundsPlayed: 0,
      testRollsExecuted: 0,
      themeChanges: 0,
      errors: []
    };
  }

  /**
   * Testa tutti i colorset
   * Tira dadi con ciascun colorset registrato
   * @static
   * @example
   * BrancaloniaDiceTheme.testColorsets();
   */
  static testColorsets() {
    try {
      if (!game.dice3d) {
        ui.notifications.warn("Dice So Nice non è attivo");
        moduleLogger.warn('Test dadi: Dice So Nice non disponibile');
        return;
      }

      ui.notifications.info(`🎲 Test colorset Brancalonia: ${this._state.colorsets.length} temi`);
      moduleLogger.info(`Test dadi: inizio test di ${this._state.colorsets.length} colorset`);

      this._state.colorsets.forEach((colorset, index) => {
        setTimeout(() => {
          const roll = new Roll('1d20 + 1d12 + 1d10 + 1d8 + 1d6 + 1d4');
          roll.evaluate({async: false});

          game.dice3d.showForRoll(roll, game.user, true, null, false, null, {
            appearance: {
              global: {
                colorset: colorset
              }
            }
          });

          this._statistics.testRollsExecuted++;
          moduleLogger.debug?.(`Test dadi: ${colorset} (${index + 1}/${this._state.colorsets.length})`);
        }, index * 2500); // 2.5 secondi tra ogni set
      });

      // Emit event
      Hooks.callAll('dice-theme:test-executed', {
        colorsets: this._state.colorsets.length
      });
    } catch (error) {
      this._statistics.errors.push(`Test: ${error.message}`);
      moduleLogger.error('Errore durante test colorset', error);
    }
  }

  /**
   * Mostra report completo
   * @static
   * @example
   * BrancaloniaDiceTheme.showReport();
   */
  static showReport() {
    const stats = this.getStatistics();
    const status = this.getStatus();

    console.group(`📊 ${this.MODULE_NAME} Report v${this.VERSION}`);
    console.log('Status:', status);
    console.log('Statistiche:', stats);
    console.groupEnd();

    ui.notifications.info(`📊 Report Dice Theme: ${stats.criticalHits} critici, ${stats.fumbles} fumble`);
  }
}

// ================================================
// INIZIALIZZAZIONE
// ================================================

Hooks.once('init', () => {
  BrancaloniaDiceTheme.initialize();
});

// ================================================
// GLOBAL API
// ================================================

// Registra API globale
Hooks.once('ready', () => {
  if (!game.brancalonia) game.brancalonia = {};

  game.brancalonia.diceTheme = {
    getStatus: () => BrancaloniaDiceTheme.getStatus(),
    getStatistics: () => BrancaloniaDiceTheme.getStatistics(),
    resetStatistics: () => BrancaloniaDiceTheme.resetStatistics(),
    testColorsets: () => BrancaloniaDiceTheme.testColorsets(),
    showReport: () => BrancaloniaDiceTheme.showReport()
  };

  // Alias per compatibility
  window.brancaloniaTestDice = () => BrancaloniaDiceTheme.testColorsets();

  moduleLogger.info(
    BrancaloniaDiceTheme.MODULE_NAME,
    `✅ API globale registrata: game.brancalonia.diceTheme`
  );
});

export default BrancaloniaDiceTheme;
