/**
 * @fileoverview Orchestrator principale per il sistema tema Brancalonia
 * @module brancalonia-theme
 * @requires brancalonia-logger
 * @requires settings.mjs
 * @requires theme.mjs
 * @version 5.0.0
 * @author Brancalonia Community
 * 
 * @description
 * Orchestrator centrale per il sistema tema Brancalonia basato su Carolingian UI.
 * Coordina l'inizializzazione, l'applicazione del tema, e l'integrazione con D&D 5e sheets.
 * 
 * Architettura del sistema tema:
 * - brancalonia-theme.mjs (questo file) - Orchestrator
 * - theme.mjs - Core theme engine
 * - settings.mjs - Settings & presets
 * - theme-config.mjs - UI configuration
 * 
 * @example
 * // Check status sistema
 * const status = BrancaloniaThemeOrchestrator.getStatus();
 * 
 * @example
 * // Reset tema di emergenza
 * await BrancaloniaThemeOrchestrator.resetTheme();
 * 
 * @example
 * // Applica tema specifico
 * await BrancaloniaThemeOrchestrator.applyTheme('taverna');
 */

import logger from './brancalonia-logger.js';
import { MODULE, registerSettings } from './settings.mjs';
import { Theme } from './theme.mjs';

/**
 * @typedef {Object} OrchestratorStatus
 * @property {boolean} initialized - Se orchestrator è inizializzato
 * @property {boolean} themeEnabled - Se tema è abilitato
 * @property {string} currentPreset - Preset tema corrente
 * @property {number} sheetsProcessed - Numero sheets processate
 * @property {boolean} dnd5eDetected - Se D&D 5e è rilevato
 */

/**
 * @typedef {Object} OrchestratorStatistics
 * @property {number} initTime - Tempo inizializzazione in ms
 * @property {number} readyTime - Tempo hook ready in ms
 * @property {number} sheetsProcessed - Numero sheets D&D 5e processate
 * @property {number} itemSheetsProcessed - Numero item sheets processate
 * @property {number} resetCount - Numero reset tema
 * @property {number} themeApplyCount - Numero apply tema
 * @property {boolean} dnd5eSystem - Se sistema è D&D 5e
 * @property {Array<Object>} errors - Array errori registrati
 */

/**
 * Orchestrator principale per sistema tema Brancalonia
 * @class BrancaloniaThemeOrchestrator
 */
class BrancaloniaThemeOrchestrator {
  static VERSION = '5.0.0';
  static MODULE_NAME = 'Theme Orchestrator';

  /**
   * Statistiche del sistema orchestrator
   * @static
   * @type {OrchestratorStatistics}
   */
  static statistics = {
    initTime: 0,
    readyTime: 0,
    sheetsProcessed: 0,
    itemSheetsProcessed: 0,
    resetCount: 0,
    themeApplyCount: 0,
    dnd5eSystem: false,
    errors: []
  };

  /**
   * Stato corrente orchestrator
   * @static
   * @private
   */
  static _state = {
    initialized: false,
    ready: false,
    themeEnabled: false,
    currentPreset: 'default',
    dnd5eDetected: false
  };

  /**
   * Inizializza il sistema tema (Hook init)
   * @static
   * @returns {void}
   * @fires theme:orchestrator-initialized
   */
  static initialize() {
    logger.startPerformance('theme-orchestrator-init');
    logger.info(this.MODULE_NAME, `Inizializzazione Orchestrator v${this.VERSION}...`);

    try {
      // Rileva sistema D&D 5e
      this._detectDnD5eSystem();

      // Registra settings
      this._registerSettings();

      // Applica tema se abilitato
      this._applyInitialTheme();

      // Mark as initialized
      this._state.initialized = true;

      // Track init time
      const initTime = logger.endPerformance('theme-orchestrator-init');
      this.statistics.initTime = initTime;

      logger.info(this.MODULE_NAME, `Orchestrator inizializzato in ${initTime?.toFixed(2)}ms`);

      // Emit event
      logger.events.emit('theme:orchestrator-initialized', {
        version: this.VERSION,
        themeEnabled: this._state.themeEnabled,
        currentPreset: this._state.currentPreset,
        dnd5eDetected: this._state.dnd5eDetected,
        initTime,
        timestamp: Date.now()
      });

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore durante inizializzazione', error);
      this.statistics.errors.push({
        type: 'initialization',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Rileva se il sistema è D&D 5e
   * @static
   * @private
   * @returns {void}
   */
  static _detectDnD5eSystem() {
    try {
      const isDnD5e = game.system.id === 'dnd5e';
      this._state.dnd5eDetected = isDnD5e;
      this.statistics.dnd5eSystem = isDnD5e;

      if (isDnD5e) {
        logger.info(this.MODULE_NAME, '✅ Sistema D&D 5e rilevato');
      } else {
        logger.warn(this.MODULE_NAME, `⚠️ Sistema non-D&D 5e rilevato: ${game.system.id}`);
      }

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore rilevamento D&D 5e', error);
      this._state.dnd5eDetected = false;
      this.statistics.dnd5eSystem = false;
    }
  }

  /**
   * Registra game settings
   * @static
   * @private
   * @returns {void}
   */
  static _registerSettings() {
    try {
      registerSettings();
      logger.debug(this.MODULE_NAME, 'Settings registrate con successo');
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore registrazione settings', error);
      this.statistics.errors.push({
        type: 'settings-registration',
        message: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * Applica tema iniziale se abilitato
   * @static
   * @private
   * @returns {void}
   */
  static _applyInitialTheme() {
    try {
      const themeEnabled = game.settings.get(MODULE, 'themeEnabled');
      this._state.themeEnabled = themeEnabled;

      if (themeEnabled) {
        const themeData = game.settings.get(MODULE, 'theme');
        const preset = game.settings.get(MODULE, 'themePreset') || 'default';
        this._state.currentPreset = preset;

        const theme = Theme.from(themeData);
        theme.apply();

        this.statistics.themeApplyCount++;
        logger.info(this.MODULE_NAME, `Tema applicato: preset "${preset}"`);
      } else {
        logger.info(this.MODULE_NAME, 'Tema disabilitato nelle impostazioni');
      }

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore applicazione tema iniziale', error);
      this.statistics.errors.push({
        type: 'initial-theme-apply',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Setup completo quando Foundry è ready (Hook ready)
   * @static
   * @returns {void}
   * @fires theme:orchestrator-ready
   */
  static setupReady() {
    logger.startPerformance('theme-orchestrator-ready');
    logger.info(this.MODULE_NAME, 'Setup hook ready...');

    try {
      // Setup D&D 5e sheets integration
      if (this._state.dnd5eDetected) {
        this._setupDnD5eSheetsIntegration();
      }

      // Setup emergency reset command
      this._setupEmergencyReset();

      // Mark as ready
      this._state.ready = true;

      // Track ready time
      const readyTime = logger.endPerformance('theme-orchestrator-ready');
      this.statistics.readyTime = readyTime;

      logger.info(this.MODULE_NAME, `Sistema tema pronto in ${readyTime?.toFixed(2)}ms`);
      logger.info(this.MODULE_NAME, 'Per reset emergenza: brancaloniaResetTheme()');

      // Emit event
      logger.events.emit('theme:orchestrator-ready', {
        sheetsProcessed: this.statistics.sheetsProcessed,
        itemSheetsProcessed: this.statistics.itemSheetsProcessed,
        readyTime,
        timestamp: Date.now()
      });

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore durante setup ready', error);
      this.statistics.errors.push({
        type: 'ready-setup',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Setup integrazione D&D 5e sheets
   * @static
   * @private
   * @returns {void}
   * @fires theme:sheet-processed
   */
  static _setupDnD5eSheetsIntegration() {
    try {
      logger.debug(this.MODULE_NAME, 'Setup integrazione D&D 5e sheets...');

      // Hook renderApplication per D&D 5e v5+ compatibility
      Hooks.on('renderApplication', (app, html, data) => {
        try {
          // Verifica che sia una actor sheet D&D 5e
          if (!app.actor || !['character', 'npc'].includes(app.actor.type)) return;
          if (!app.constructor.name.includes('ActorSheet')) return;

          // Aggiungi classe Brancalonia
          if (html instanceof HTMLElement) {
            html.classList.add('brancalonia-sheet');
          } else if (html?.addClass) {
            html.addClass('brancalonia-sheet');
          }

          this.statistics.sheetsProcessed++;

          logger.debug(this.MODULE_NAME, `Sheet processata: ${app.actor.name} (total: ${this.statistics.sheetsProcessed})`);

          // Emit event
          logger.events.emit('theme:sheet-processed', {
            actorName: app.actor.name,
            actorType: app.actor.type,
            sheetType: 'actor',
            totalProcessed: this.statistics.sheetsProcessed,
            timestamp: Date.now()
          });

        } catch (error) {
          logger.error(this.MODULE_NAME, 'Errore processing actor sheet', error);
        }
      });

      // Hook renderItemSheet5e per item sheets
      Hooks.on('renderItemSheet5e', (app, html, data) => {
        try {
          // Aggiungi classe Brancalonia
          if (html instanceof HTMLElement) {
            html.classList.add('brancalonia-sheet');
          } else if (html?.addClass) {
            html.addClass('brancalonia-sheet');
          }

          this.statistics.itemSheetsProcessed++;

          logger.debug(this.MODULE_NAME, `Item sheet processata (total: ${this.statistics.itemSheetsProcessed})`);

          // Emit event
          logger.events.emit('theme:sheet-processed', {
            sheetType: 'item',
            totalProcessed: this.statistics.itemSheetsProcessed,
            timestamp: Date.now()
          });

        } catch (error) {
          logger.error(this.MODULE_NAME, 'Errore processing item sheet', error);
        }
      });

      logger.info(this.MODULE_NAME, 'Integrazione D&D 5e sheets configurata');

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore setup D&D 5e integration', error);
      this.statistics.errors.push({
        type: 'dnd5e-integration-setup',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Setup comando reset emergenza
   * @static
   * @private
   * @returns {void}
   */
  static _setupEmergencyReset() {
    try {
      // Aggiungi comando console globale
      window.brancaloniaResetTheme = async () => {
        return await this.resetTheme();
      };

      logger.debug(this.MODULE_NAME, 'Comando reset emergenza configurato: window.brancaloniaResetTheme()');

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore setup comando reset', error);
    }
  }

  // =================================================================
  // PUBLIC API
  // =================================================================

  /**
   * Ottiene lo status corrente dell'orchestrator
   * @static
   * @returns {OrchestratorStatus} Status completo
   * @example
   * const status = BrancaloniaThemeOrchestrator.getStatus();
   * console.log('Tema enabled:', status.themeEnabled);
   */
  static getStatus() {
    return {
      initialized: this._state.initialized,
      ready: this._state.ready,
      themeEnabled: this._state.themeEnabled,
      currentPreset: this._state.currentPreset,
      sheetsProcessed: this.statistics.sheetsProcessed,
      itemSheetsProcessed: this.statistics.itemSheetsProcessed,
      dnd5eDetected: this._state.dnd5eDetected
    };
  }

  /**
   * Ottiene le statistiche correnti dell'orchestrator
   * @static
   * @returns {OrchestratorStatistics} Statistiche complete
   * @example
   * const stats = BrancaloniaThemeOrchestrator.getStatistics();
   * console.log('Sheets processate:', stats.sheetsProcessed);
   */
  static getStatistics() {
    return {
      ...this.statistics,
      uptime: Date.now() - (this.statistics.initTime || Date.now())
    };
  }

  /**
   * Applica un tema specifico
   * @static
   * @async
   * @param {string} preset - Nome del preset ('default', 'taverna', 'notte')
   * @returns {Promise<void>}
   * @fires theme:applied
   * @example
   * await BrancaloniaThemeOrchestrator.applyTheme('taverna');
   */
  static async applyTheme(preset) {
    try {
      logger.info(this.MODULE_NAME, `Applicazione tema: ${preset}`);

      const { THEMES } = await import('./settings.mjs');

      if (!THEMES[preset]) {
        throw new Error(`Preset tema non valido: ${preset}`);
      }

      // Salva settings
      await game.settings.set(MODULE, 'theme', THEMES[preset]);
      await game.settings.set(MODULE, 'themePreset', preset);

      // Applica tema
      const theme = Theme.from(THEMES[preset]);
      theme.apply();

      // Update state
      this._state.currentPreset = preset;
      this.statistics.themeApplyCount++;

      logger.info(this.MODULE_NAME, `Tema "${preset}" applicato con successo`);

      // Emit event
      logger.events.emit('theme:applied', {
        preset,
        applyCount: this.statistics.themeApplyCount,
        timestamp: Date.now()
      });

    } catch (error) {
      logger.error(this.MODULE_NAME, `Errore applicazione tema "${preset}"`, error);
      this.statistics.errors.push({
        type: 'theme-apply',
        message: error.message,
        preset,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * Reset tema ai valori default (emergenza)
   * @static
   * @async
   * @returns {Promise<string>} Messaggio di conferma
   * @fires theme:reset
   * @example
   * await BrancaloniaThemeOrchestrator.resetTheme();
   */
  static async resetTheme() {
    try {
      logger.info(this.MODULE_NAME, 'Reset tema ai valori default...');

      const { THEMES } = await import('./settings.mjs');
      const defaultTheme = THEMES.default;

      await game.settings.set(MODULE, 'theme', defaultTheme);
      await game.settings.set(MODULE, 'themePreset', 'default');

      const theme = Theme.from(defaultTheme);
      theme.apply();

      this._state.currentPreset = 'default';
      this.statistics.resetCount++;

      ui.notifications.info('Tema ripristinato ai valori default');
      logger.info(this.MODULE_NAME, 'Tema ripristinato con successo');

      // Emit event
      logger.events.emit('theme:reset', {
        resetCount: this.statistics.resetCount,
        timestamp: Date.now()
      });

      return 'Tema ripristinato ai valori default!';

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore reset tema', error);
      this.statistics.errors.push({
        type: 'theme-reset',
        message: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * Resetta le statistiche dell'orchestrator
   * @static
   * @returns {void}
   * @example
   * BrancaloniaThemeOrchestrator.resetStatistics();
   */
  static resetStatistics() {
    logger.info(this.MODULE_NAME, 'Reset statistiche');

    const initTime = this.statistics.initTime;
    const readyTime = this.statistics.readyTime;
    const dnd5eSystem = this.statistics.dnd5eSystem;

    this.statistics = {
      initTime,
      readyTime,
      sheetsProcessed: 0,
      itemSheetsProcessed: 0,
      resetCount: 0,
      themeApplyCount: 0,
      dnd5eSystem,
      errors: []
    };

    logger.info(this.MODULE_NAME, 'Statistiche resettate');
  }

  /**
   * Mostra un report completo dello stato del sistema nella console
   * @static
   * @returns {OrchestratorStatistics} Le statistiche (per uso programmatico)
   * @example
   * BrancaloniaThemeOrchestrator.showReport();
   */
  static showReport() {
    const stats = this.getStatistics();
    const status = this.getStatus();

    logger.group('📊 Brancalonia Theme Orchestrator - Report');

    logger.info(this.MODULE_NAME, 'VERSION:', this.VERSION);
    logger.info(this.MODULE_NAME, 'Initialized:', status.initialized);
    logger.info(this.MODULE_NAME, 'Ready:', status.ready);

    logger.group('📈 Statistics');
    logger.table([
      { Metric: 'Init Time', Value: `${stats.initTime?.toFixed(2)}ms` },
      { Metric: 'Ready Time', Value: `${stats.readyTime?.toFixed(2)}ms` },
      { Metric: 'Sheets Processed', Value: stats.sheetsProcessed },
      { Metric: 'Item Sheets Processed', Value: stats.itemSheetsProcessed },
      { Metric: 'Theme Apply Count', Value: stats.themeApplyCount },
      { Metric: 'Reset Count', Value: stats.resetCount },
      { Metric: 'D&D 5e System', Value: stats.dnd5eSystem ? 'Yes' : 'No' },
      { Metric: 'Errors', Value: stats.errors.length },
      { Metric: 'Uptime', Value: `${(stats.uptime / 1000).toFixed(0)}s` }
    ]);
    logger.groupEnd();

    logger.group('⚙️ Status');
    logger.info(this.MODULE_NAME, 'Theme Enabled:', status.themeEnabled);
    logger.info(this.MODULE_NAME, 'Current Preset:', status.currentPreset);
    logger.info(this.MODULE_NAME, 'D&D 5e Detected:', status.dnd5eDetected);
    logger.groupEnd();

    if (stats.errors.length > 0) {
      logger.group('🐛 Errors');
      stats.errors.forEach((err, i) => {
        logger.error(this.MODULE_NAME, `Error ${i + 1}:`, err.type, '-', err.message);
      });
      logger.groupEnd();
    }

    logger.groupEnd();

    return stats;
  }
}

// =================================================================
// HOOKS FOUNDRY VTT
// =================================================================

// Hook init - Inizializza orchestrator
Hooks.once('init', () => {
  BrancaloniaThemeOrchestrator.initialize();
});

// Hook ready - Setup completo
Hooks.once('ready', () => {
  BrancaloniaThemeOrchestrator.setupReady();
});

// Export per uso come modulo ES6 e accesso globale
export default BrancaloniaThemeOrchestrator;
export { MODULE, Theme };