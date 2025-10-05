/**
 * Brancalonia Settings Registration System
 * 
 * Sistema dinamico di registrazione delle impostazioni che legge da settings-config.json
 * 
 * @module SettingsRegistration
 * @version 2.0.0
 * @author Brancalonia BIGAT Team
 */

import { createModuleLogger } from './brancalonia-logger.js';

const MODULE_LABEL = 'Settings Registration';
const moduleLogger = createModuleLogger(MODULE_LABEL);
/**
 * Classe per la registrazione automatica delle impostazioni
 * @class
 */
class SettingsRegistration {
  static VERSION = '2.0.0';
  static MODULE_NAME = MODULE_LABEL;
  static MODULE_ID = 'brancalonia-bigat';

  // Statistics tracking
  static statistics = {
    settingsRegistered: 0,
    settingsFailures: 0,
    menusRegistered: 0,
    menusFailures: 0,
    configLoadTime: 0,
    errors: []
  };

  // Internal state
  static _state = {
    initialized: false,
    configLoaded: false
  };

  /**
   * Carica la configurazione da settings-config.json
   * @static
   * @async
   * @returns {Promise<Object|null>} Configurazione caricata o null in caso di errore
   * @throws {Error} Se il file non esiste o è malformato
   * 
   * @example
   * const config = await SettingsRegistration.loadConfig();
   * console.log(config.settings.length); // 21
   */
  static async loadConfig() {
    try {
      moduleLogger.startPerformance('settings-config-load');
      moduleLogger.info('📂 Caricamento settings-config.json...');

      const response = await fetch('modules/settings-config.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const config = await response.json();
      this._state.configLoaded = true;

      const perfTime = moduleLogger.endPerformance('settings-config-load');
      this.statistics.configLoadTime = perfTime;

      moduleLogger.info(`✅ Configurazione caricata: ${config.settings.length} settings, ${config.menus.length} menus (${perfTime?.toFixed(2)}ms)`);
      
      return config;
    } catch (error) {
      this.statistics.errors.push({ 
        type: 'loadConfig', 
        message: error.message, 
        timestamp: Date.now() 
      });
      moduleLogger.error('Errore caricamento settings-config.json', error);
      ui.notifications.error('Errore caricamento configurazione Brancalonia');
      return null;
    }
  }

  /**
   * Registra un singolo setting
   * @static
   * @param {Object} settingConfig - Configurazione del setting
   * @returns {boolean} True se registrato con successo
   * 
   * @example
   * const success = SettingsRegistration.registerSetting({
   *   key: 'brancalonia-bigat.enableInfamia',
   *   type: 'bool',
   *   default: true,
   *   name: 'Sistema Infamia',
   *   hint: 'Abilita il sistema Infamia',
   *   scope: 'world',
   *   config: true
   * });
   */
  static registerSetting(settingConfig) {
    try {
      // Parse key to get namespace and setting name
      const [namespace, settingName] = settingConfig.key.split('.');
      
      if (namespace !== this.MODULE_ID) {
        moduleLogger.warn(`Setting namespace mismatch: ${namespace} !== ${this.MODULE_ID}`);
      }

      // Map type string to actual type
      const typeMap = {
        'bool': Boolean,
        'boolean': Boolean,
        'number': Number,
        'string': String,
        'object': Object
      };

      const actualType = typeMap[settingConfig.type.toLowerCase()] || String;

      // Build setting object
      const settingData = {
        name: settingConfig.name,
        hint: settingConfig.hint,
        scope: settingConfig.scope || 'world',
        config: settingConfig.config !== false,
        type: actualType,
        default: settingConfig.default
      };

      // Add optional properties
      if (settingConfig.choices) {
        settingData.choices = settingConfig.choices;
      }

      if (settingConfig.range) {
        settingData.range = settingConfig.range;
      }

      if (settingConfig.onChange) {
        settingData.onChange = settingConfig.onChange;
      }

      // Ensure game.settings is available and fully initialized
      if (!game?.settings?.register) {
        moduleLogger.error(`game.settings API non disponibile per ${settingConfig.key} - skipping registration`);
        this.statistics.settingsFailures++;
        return false;
      }

      // Register the setting
      game.settings.register(namespace, settingName, settingData);

      this.statistics.settingsRegistered++;
      moduleLogger.debug?.(`✅ Registrato: ${settingConfig.key}`);

      return true;
    } catch (error) {
      this.statistics.settingsFailures++;
      this.statistics.errors.push({ 
        type: 'registerSetting', 
        key: settingConfig.key,
        message: error.message, 
        timestamp: Date.now() 
      });
      moduleLogger.error(`Errore registrazione setting: ${settingConfig.key}`, error);
      return false;
    }
  }

  /**
   * Registra un menu
   * @static
   * @param {Object} menuConfig - Configurazione del menu
   * @returns {boolean} True se registrato con successo
   * 
   * @example
   * const success = SettingsRegistration.registerMenu({
   *   key: 'brancalonia-bigat.themeConfig',
   *   name: 'Configura Tema',
   *   label: 'Apri Configurazione Tema',
   *   icon: 'fas fa-palette',
   *   type: ThemeConfigApp,
   *   restricted: true
   * });
   */
  static registerMenu(menuConfig) {
    try {
      const [namespace, menuName] = menuConfig.key.split('.');

      if (namespace !== this.MODULE_ID) {
        moduleLogger.warn(`Menu namespace mismatch: ${namespace} !== ${this.MODULE_ID}`);
      }

      const menuData = {
        name: menuConfig.name,
        label: menuConfig.label,
        hint: menuConfig.hint,
        icon: menuConfig.icon || 'fas fa-cog',
        type: menuConfig.type,
        restricted: menuConfig.restricted !== false
      };

      game.settings.registerMenu(namespace, menuName, menuData);

      this.statistics.menusRegistered++;
      moduleLogger.debug?.(`✅ Menu registrato: ${menuConfig.key}`);

      return true;
    } catch (error) {
      this.statistics.menusFailures++;
      this.statistics.errors.push({ 
        type: 'registerMenu', 
        key: menuConfig.key,
        message: error.message, 
        timestamp: Date.now() 
      });
      moduleLogger.error(`Errore registrazione menu: ${menuConfig.key}`, error);
      return false;
    }
  }

  /**
   * Inizializza e registra tutte le impostazioni
   * @static
   * @async
   * @returns {Promise<boolean>} True se inizializzazione completata con successo
   * @throws {Error} Se l'inizializzazione fallisce
   * 
   * @example
   * await SettingsRegistration.initialize();
   */
  static async initialize() {
    try {
      moduleLogger.startPerformance('settings-registration-init');
      moduleLogger.info('🔧 Inizializzazione registrazione settings...');

      // Ensure game.settings is available and fully initialized
      if (!game?.settings?.register) {
        moduleLogger.warn('game.settings API non ancora disponibile, attesa massima 30 secondi...');
        const maxWait = 30000; // 30 seconds
        const checkInterval = 100;
        let waited = 0;

        await new Promise(resolve => {
          const checkSettings = () => {
            waited += checkInterval;
            if (game?.settings?.register) {
              moduleLogger.info(`game.settings API disponibile dopo ${waited}ms`);
              resolve();
            } else if (waited >= maxWait) {
              moduleLogger.error(`Timeout: game.settings API non disponibile dopo ${maxWait}ms`);
              resolve(); // Continue anyway to avoid hanging
            } else {
              setTimeout(checkSettings, checkInterval);
            }
          };
          checkSettings();
        });
      }

      // Load configuration
      const config = await this.loadConfig();
      if (!config) {
        throw new Error('Impossibile caricare settings-config.json');
      }

      // Register all settings
      for (const setting of config.settings) {
        this.registerSetting(setting);
      }

      // Register all menus
      for (const menu of config.menus) {
        this.registerMenu(menu);
      }

      this._state.initialized = true;
      const perfTime = moduleLogger.endPerformance('settings-registration-init');

      moduleLogger.info(`✅ Registrazione completata: ${this.statistics.settingsRegistered} settings, ${this.statistics.menusRegistered} menus (${perfTime?.toFixed(2)}ms)`);
      
      // Event emitter
      moduleLogger.events.emit('settings-registration:initialized', {
        version: this.VERSION,
        settingsCount: this.statistics.settingsRegistered,
        menusCount: this.statistics.menusRegistered,
        timestamp: Date.now()
      });

      return true;
    } catch (error) {
      this.statistics.errors.push({ 
        type: 'initialize', 
        message: error.message, 
        timestamp: Date.now() 
      });
      moduleLogger.error('Errore inizializzazione settings registration', error);
      ui.notifications.error('Errore durante la registrazione delle impostazioni Brancalonia');
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API (Enterprise-grade)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Ottiene lo stato del modulo
   * @static
   * @returns {Object} Stato corrente del modulo
   * 
   * @example
   * const status = SettingsRegistration.getStatus();
   * console.log(status.initialized); // true
   * console.log(status.configLoaded); // true
   */
  static getStatus() {
    return {
      initialized: this._state.initialized,
      configLoaded: this._state.configLoaded,
      version: this.VERSION,
      moduleName: this.MODULE_NAME,
      moduleId: this.MODULE_ID
    };
  }

  /**
   * Ottiene le statistiche dettagliate
   * @static
   * @returns {Object} Statistiche complete
   * 
   * @example
   * const stats = SettingsRegistration.getStatistics();
   * console.log(stats.settingsRegistered); // 21
   * console.log(stats.configLoadTime); // 5.23
   */
  static getStatistics() {
    return {
      ...this.statistics,
      errorsCount: this.statistics.errors.length,
      successRate: this.statistics.settingsRegistered / 
        (this.statistics.settingsRegistered + this.statistics.settingsFailures) * 100
    };
  }

  /**
   * Resetta le statistiche
   * @static
   * 
   * @example
   * SettingsRegistration.resetStatistics();
   */
  static resetStatistics() {
    this.statistics = {
      settingsRegistered: 0,
      settingsFailures: 0,
      menusRegistered: 0,
      menusFailures: 0,
      configLoadTime: 0,
      errors: []
    };
    moduleLogger.info('📊 Statistiche resettate');
  }

  /**
   * Mostra report console colorato
   * @static
   * 
   * @example
   * SettingsRegistration.showReport();
   */
  static showReport() {
    console.log('%c═══════════════════════════════════════', 'color: #4CAF50; font-weight: bold');
    console.log('%c🔧 SETTINGS REGISTRATION - REPORT', 'color: #4CAF50; font-weight: bold; font-size: 14px');
    console.log('%c═══════════════════════════════════════', 'color: #4CAF50; font-weight: bold');
    console.log('');
    console.log('%c📊 STATUS', 'color: #00BCD4; font-weight: bold');
    console.log(`Version: ${this.VERSION}`);
    console.log(`Initialized: ${this._state.initialized}`);
    console.log(`Config Loaded: ${this._state.configLoaded}`);
    console.log('');
    console.log('%c📈 STATISTICS', 'color: #4CAF50; font-weight: bold');
    console.log(`Settings Registered: ${this.statistics.settingsRegistered}`);
    console.log(`Settings Failures: ${this.statistics.settingsFailures}`);
    console.log(`Menus Registered: ${this.statistics.menusRegistered}`);
    console.log(`Menus Failures: ${this.statistics.menusFailures}`);
    console.log(`Config Load Time: ${this.statistics.configLoadTime?.toFixed(2)}ms`);
    console.log(`Success Rate: ${(this.statistics.settingsRegistered / (this.statistics.settingsRegistered + this.statistics.settingsFailures) * 100 || 0).toFixed(1)}%`);
    console.log(`Errors: ${this.statistics.errors.length}`);
    if (this.statistics.errors.length > 0) {
      console.log('%c⚠️ Last 3 Errors:', 'color: #FF9800; font-weight: bold');
      this.statistics.errors.slice(-3).forEach(err => {
        console.log(`  [${err.type}${err.key ? `: ${err.key}` : ''}] ${err.message}`);
      });
    }
    console.log('');
    console.log('%c═══════════════════════════════════════', 'color: #4CAF50; font-weight: bold');
  }
}

// Auto-inizializzazione
Hooks.once('init', async () => {
  if (!game.brancalonia) game.brancalonia = {};
  if (!game.brancalonia.modules) game.brancalonia.modules = {};
  
  window.SettingsRegistration = SettingsRegistration;
  game.brancalonia.settingsRegistration = SettingsRegistration;
  game.brancalonia.modules['settings-registration'] = SettingsRegistration;

  await SettingsRegistration.initialize();
});

// Export ES6
export default SettingsRegistration;
export { SettingsRegistration };
