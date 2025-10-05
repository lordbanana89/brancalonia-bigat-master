/**
 * @fileoverview Sistema di gestione theme settings per Brancalonia
 * @module brancalonia-theme-settings
 * @requires brancalonia-logger
 * @version 2.0.0
 * @author Brancalonia Community
 * 
 * @description
 * Gestisce le impostazioni del tema Brancalonia con integrazione intelligente
 * per Carolingian UI. Fornisce feature flags per permettere agli utenti di
 * personalizzare l'esperienza visiva senza disattivare l'intero modulo.
 * 
 * Caratteristiche principali:
 * - Rilevamento automatico Carolingian UI
 * - Fallback graceful a tema base
 * - Settings specifiche Brancalonia
 * - Integrazione UI dinamica
 * - Decorazioni Renaissance toggle
 * 
 * Ispirato da crlngn-ui approach ma esteso con logging, statistics e API.
 * 
 * @example
 * // Check se Carolingian UI è attivo
 * const isActive = ThemeSettingsManager.isCarolingianActive();
 * 
 * @example
 * // Toggle decorazioni
 * await ThemeSettingsManager.toggleDecorations(true);
 * 
 * @example
 * // Ottieni configurazione
 * const config = ThemeSettingsManager.getConfiguration();
 */

import { createModuleLogger } from './brancalonia-logger.js';

const MODULE_LABEL = 'Theme Settings';
const moduleLogger = createModuleLogger(MODULE_LABEL);
/**
 * @typedef {Object} ThemeConfiguration
 * @property {boolean} carolingianActive - Se Carolingian UI è attivo
 * @property {boolean} decorationsEnabled - Se decorazioni sono abilitate
 * @property {boolean} integrationEnabled - Se integrazione è abilitata
 * @property {string} themeMode - Modalità tema ("full" o "basic")
 */

/**
 * @typedef {Object} ThemeStatistics
 * @property {boolean} carolingianDetected - Se Carolingian UI è stato rilevato
 * @property {number} decorationToggles - Numero toggle decorazioni
 * @property {number} settingsRenders - Numero render settings UI
 * @property {number} initTime - Tempo inizializzazione in ms
 * @property {string} themeMode - Modalità corrente ("full" o "basic")
 * @property {Array<Object>} errors - Array errori registrati
 */

/**
 * Gestore impostazioni tema Brancalonia
 * @class ThemeSettingsManager
 */
class ThemeSettingsManager {
  static VERSION = '2.0.0';
  static MODULE_NAME = MODULE_LABEL;
  static MODULE_ID = 'brancalonia-bigat';

  /**
   * Statistiche del sistema theme settings
   * @static
   * @type {ThemeStatistics}
   */
  static statistics = {
    carolingianDetected: false,
    decorationToggles: 0,
    settingsRenders: 0,
    initTime: 0,
    themeMode: 'unknown',
    errors: []
  };

  /**
   * Stato corrente del tema
   * @static
   * @private
   */
  static _state = {
    carolingianActive: false,
    decorationsEnabled: true,
    integrationEnabled: true,
    initialized: false
  };

  /**
   * Inizializza il sistema theme settings
   * @static
   * @returns {void}
   * @fires theme:initialized
   */
  static initialize() {
    moduleLogger.startPerformance('theme-init');
    moduleLogger.info('Inizializzazione Theme Settings...');

    try {
      // Verifica se Carolingian UI è attivo
      this._detectCarolingianUI();

      if (!this._state.carolingianActive) {
        // Fallback a tema base
        this._applyBasicTheme();
      } else {
        // Integrazione completa con Carolingian UI
        this._integrateWithCarolingianUI();
      }

      // Registra hooks
      this._registerHooks();

      // Mark as initialized
      this._state.initialized = true;

      // Track init time
      const initTime = moduleLogger.endPerformance('theme-init');
      this.statistics.initTime = initTime;

      moduleLogger.info(`Inizializzazione completata in ${initTime?.toFixed(2)}ms (mode: ${this.statistics.themeMode})`);

      // Emit event
      moduleLogger.events.emit('theme:initialized', {
        version: this.VERSION,
        themeMode: this.statistics.themeMode,
        carolingianActive: this._state.carolingianActive,
        initTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore durante inizializzazione', error);
      this.statistics.errors.push({
        type: 'initialization',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Rileva se Carolingian UI è attivo
   * @static
   * @private
   * @returns {void}
   * @fires theme:carolingian-detected
   */
  static _detectCarolingianUI() {
    try {
      const carolingianActive = game.modules.get(this.MODULE_ID)?.active;
      this._state.carolingianActive = !!carolingianActive;
      this.statistics.carolingianDetected = !!carolingianActive;

      if (carolingianActive) {
        moduleLogger.info('✅ Carolingian UI rilevato e attivo');
        this.statistics.themeMode = 'full';

        // Emit event
        moduleLogger.events.emit('theme:carolingian-detected', {
          active: true,
          timestamp: Date.now()
        });
      } else {
        moduleLogger.warn('⚠️ Carolingian UI non rilevato, uso tema base');
        this.statistics.themeMode = 'basic';

        // Emit event
        moduleLogger.events.emit('theme:carolingian-detected', {
          active: false,
          timestamp: Date.now()
        });
      }

    } catch (error) {
      moduleLogger.error('Errore rilevamento Carolingian UI', error);
      this._state.carolingianActive = false;
      this.statistics.themeMode = 'basic';
      this.statistics.errors.push({
        type: 'carolingian-detection',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Applica tema base (fallback quando Carolingian UI non disponibile)
   * @static
   * @private
   * @returns {void}
   */
  static _applyBasicTheme() {
    try {
      document.body.classList.add('brancalonia-bigat');
      moduleLogger.info('Tema base applicato');
    } catch (error) {
      moduleLogger.error('Errore applicazione tema base', error);
      this.statistics.errors.push({
        type: 'basic-theme-apply',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Integra con Carolingian UI (tema completo)
   * @static
   * @private
   * @returns {void}
   */
  static _integrateWithCarolingianUI() {
    moduleLogger.startPerformance('theme-integration');
    moduleLogger.info('🎨 Integrazione con Carolingian UI...');

    try {
      // Registra settings specifiche Brancalonia
      this._registerSettings();

      moduleLogger.info('✅ Integrazione Carolingian UI completata');

      const integrationTime = moduleLogger.endPerformance('theme-integration');
      moduleLogger.debug(`Integrazione completata in ${integrationTime?.toFixed(2)}ms`);

      // Emit event
      moduleLogger.events.emit('theme:integration-complete', {
        integrationTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore durante integrazione Carolingian UI', error);
      this.statistics.errors.push({
        type: 'carolingian-integration',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Registra game settings specifiche Brancalonia
   * @static
   * @private
   * @returns {void}
   */
  static _registerSettings() {
    try {
      // Setting: Decorazioni Renaissance
      game.settings.register(this.MODULE_ID, 'enableDecorations', {
        name: 'Renaissance Decorations',
        hint: 'Show ornaments, corner pieces and parchment textures',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
        onChange: (value) => {
          try {
            document.body.classList.toggle('branca-decorations-enabled', value);
            this._state.decorationsEnabled = value;
            this.statistics.decorationToggles++;

            moduleLogger.info(`Decorazioni ${value ? 'abilitate' : 'disabilitate'}`);

            // Emit event
            moduleLogger.events.emit('theme:decorations-changed', {
              enabled: value,
              toggleCount: this.statistics.decorationToggles,
              timestamp: Date.now()
            });

          } catch (error) {
            moduleLogger.error('Errore toggle decorazioni', error);
            this.statistics.errors.push({
              type: 'decorations-toggle',
              message: error.message,
              timestamp: Date.now()
            });
          }
        }
      });

      moduleLogger.debug('Setting "enableDecorations" registrata');

      // Setting: Integrazione Carolingian (hidden)
      game.settings.register(this.MODULE_ID, 'carolingianIntegration', {
        name: 'Carolingian UI Integration',
        hint: 'Advanced settings for Carolingian UI integration',
        scope: 'world',
        config: false, // Hidden setting
        type: Boolean,
        default: true
      });

      moduleLogger.debug('Setting "carolingianIntegration" registrata (hidden)');

    } catch (error) {
      moduleLogger.error('Errore registrazione settings', error);
      this.statistics.errors.push({
        type: 'settings-registration',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Registra hooks Foundry VTT
   * @static
   * @private
   * @returns {void}
   */
  static _registerHooks() {
    try {
      // Hook per aggiungere info integrazione nelle settings UI
      Hooks.on('renderSettingsConfig', (app, html) => {
        ThemeSettingsManager._addIntegrationInfo(html); // Fix: usa nome classe invece di this
      });

      moduleLogger.debug('Hook renderSettingsConfig registrato');

    } catch (error) {
      moduleLogger.error('Errore registrazione hooks', error);
      this.statistics.errors.push({
        type: 'hooks-registration',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Aggiunge informazioni di integrazione nelle impostazioni UI
   * @static
   * @private
   * @param {jQuery|HTMLElement} html - HTML delle settings
   * @returns {void}
   */
  static _addIntegrationInfo(html) {
    if (!this._state.carolingianActive) return;

    try {
      this.statistics.settingsRenders++;

      // Try jQuery first, then vanilla JS fallback
      if (typeof $ !== 'undefined' && html instanceof $) {
        this._addIntegrationInfoJQuery(html);
      } else {
        this._addIntegrationInfoVanilla(html);
      }

      moduleLogger.debug(`Info integrazione aggiunte (render #${this.statistics.settingsRenders})`);

    } catch (error) {
      moduleLogger.error('Errore aggiunta info integrazione', error);
      this.statistics.errors.push({
        type: 'integration-info',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Aggiunge info integrazione usando jQuery
   * @static
   * @private
   * @param {jQuery} html - jQuery object
   * @returns {void}
   */
  static _addIntegrationInfoJQuery(html) {
    const carolingianSection = html.find('.settings-sidebar .settings-group').filter((i, el) => {
      return el.textContent.includes('Carolingian');
    });

    if (carolingianSection.length > 0) {
      const integrationNote = $(`
        <div class="brancalonia-integration-note" style="margin-top: 10px; padding: 8px; background: rgba(68, 147, 173, 0.1); border-radius: 4px;">
          <strong>🏛️ Integration Active</strong><br>
          Brancalonia theme settings are coordinated with Carolingian UI for optimal Renaissance styling.
        </div>
      `);

      carolingianSection.append(integrationNote);
      moduleLogger.debug('Info integrazione aggiunte (jQuery)');
    }
  }

  /**
   * Aggiunge info integrazione usando vanilla JS (fallback)
   * @static
   * @private
   * @param {HTMLElement} html - HTML element
   * @returns {void}
   */
  static _addIntegrationInfoVanilla(html) {
    const element = html instanceof HTMLElement ? html : (html?.[0] || html?.element);
    if (!element) {
      moduleLogger.warn('Elemento HTML non valido per info integrazione');
      return;
    }

    const settingsGroups = element.querySelectorAll('.settings-sidebar .settings-group');
    let carolingianSection = null;

    settingsGroups.forEach(group => {
      if (group.textContent.includes('Carolingian')) {
        carolingianSection = group;
      }
    });

    if (carolingianSection) {
      const integrationNote = document.createElement('div');
      integrationNote.className = 'brancalonia-integration-note';
      integrationNote.style.cssText = 'margin-top: 10px; padding: 8px; background: rgba(68, 147, 173, 0.1); border-radius: 4px;';
      integrationNote.innerHTML = `
        <strong>🏛️ Integration Active</strong><br>
        Brancalonia theme settings are coordinated with Carolingian UI for optimal Renaissance styling.
      `;

      carolingianSection.appendChild(integrationNote);
      moduleLogger.debug('Info integrazione aggiunte (Vanilla JS)');
    }
  }

  // =================================================================
  // PUBLIC API
  // =================================================================

  /**
   * Verifica se Carolingian UI è attivo
   * @static
   * @returns {boolean} True se Carolingian UI è attivo
   * @example
   * if (ThemeSettingsManager.isCarolingianActive()) {
   *   console.log('Carolingian UI disponibile');
   * }
   */
  static isCarolingianActive() {
    return this._state.carolingianActive;
  }

  /**
   * Ottiene la configurazione corrente del tema
   * @static
   * @returns {ThemeConfiguration} Configurazione completa
   * @example
   * const config = ThemeSettingsManager.getConfiguration();
   * console.log('Theme mode:', config.themeMode);
   */
  static getConfiguration() {
    try {
      return {
        carolingianActive: this._state.carolingianActive,
        decorationsEnabled: this._state.decorationsEnabled,
        integrationEnabled: this._state.integrationEnabled,
        themeMode: this.statistics.themeMode,
        initialized: this._state.initialized
      };
    } catch (error) {
      moduleLogger.error('Errore recupero configurazione', error);
      return {
        carolingianActive: false,
        decorationsEnabled: false,
        integrationEnabled: false,
        themeMode: 'unknown',
        initialized: false
      };
    }
  }

  /**
   * Ottiene le statistiche correnti del sistema theme
   * @static
   * @returns {ThemeStatistics} Statistiche complete
   * @example
   * const stats = ThemeSettingsManager.getStatistics();
   * console.log('Toggle count:', stats.decorationToggles);
   */
  static getStatistics() {
    return {
      ...this.statistics,
      uptime: Date.now() - (this.statistics.initTime || Date.now())
    };
  }

  /**
   * Toggle decorazioni Renaissance
   * @static
   * @async
   * @param {boolean} enabled - True per abilitare, false per disabilitare
   * @returns {Promise<void>}
   * @example
   * await ThemeSettingsManager.toggleDecorations(true);
   */
  static async toggleDecorations(enabled) {
    try {
      moduleLogger.info(`Toggle decorazioni: ${enabled}`);
      await game.settings.set(this.MODULE_ID, 'enableDecorations', enabled);
    } catch (error) {
      moduleLogger.error('Errore toggle decorazioni', error);
      throw error;
    }
  }

  /**
   * Resetta le statistiche del sistema
   * @static
   * @returns {void}
   * @example
   * ThemeSettingsManager.resetStatistics();
   */
  static resetStatistics() {
    moduleLogger.info('Reset statistiche');

    const carolingianDetected = this.statistics.carolingianDetected;
    const initTime = this.statistics.initTime;
    const themeMode = this.statistics.themeMode;

    this.statistics = {
      carolingianDetected,
      decorationToggles: 0,
      settingsRenders: 0,
      initTime,
      themeMode,
      errors: []
    };

    moduleLogger.info('Statistiche resettate');
  }

  /**
   * Mostra un report completo dello stato del sistema nella console
   * @static
   * @returns {ThemeStatistics} Le statistiche (per uso programmatico)
   * @example
   * ThemeSettingsManager.showReport();
   */
  static showReport() {
    const stats = this.getStatistics();
    const config = this.getConfiguration();

    moduleLogger.group('📊 Brancalonia Theme Settings - Report');

    moduleLogger.info('VERSION:', this.VERSION);
    moduleLogger.info('Theme Mode:', config.themeMode);
    moduleLogger.info('Initialized:', config.initialized);

    moduleLogger.group('📈 Statistics');
    moduleLogger.table([
      { Metric: 'Carolingian Detected', Value: stats.carolingianDetected ? 'Yes' : 'No' },
      { Metric: 'Theme Mode', Value: stats.themeMode },
      { Metric: 'Decoration Toggles', Value: stats.decorationToggles },
      { Metric: 'Settings Renders', Value: stats.settingsRenders },
      { Metric: 'Init Time', Value: `${stats.initTime?.toFixed(2)}ms` },
      { Metric: 'Errors', Value: stats.errors.length },
      { Metric: 'Uptime', Value: `${(stats.uptime / 1000).toFixed(0)}s` }
    ]);
    moduleLogger.groupEnd();

    moduleLogger.group('⚙️ Configuration');
    moduleLogger.info('Carolingian Active:', config.carolingianActive);
    moduleLogger.info('Decorations Enabled:', config.decorationsEnabled);
    moduleLogger.info('Integration Enabled:', config.integrationEnabled);
    moduleLogger.groupEnd();

    if (stats.errors.length > 0) {
      moduleLogger.group('🐛 Errors');
      stats.errors.forEach((err, i) => {
        moduleLogger.error(`Error ${i + 1}:`, err.type, '-', err.message);
      });
      moduleLogger.groupEnd();
    }

    moduleLogger.groupEnd();

    return stats;
  }
}

// =================================================================
// HOOKS FOUNDRY VTT
// =================================================================

// Hook init - Inizializza il sistema
Hooks.once('init', () => {
  ThemeSettingsManager.initialize();
});

// Export per uso come modulo ES6 e accesso globale
export default ThemeSettingsManager;
window.BrancaloniaThemeSettings = ThemeSettingsManager;