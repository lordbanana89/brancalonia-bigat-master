/**
 * BRANCALONIA CONFIG MANAGER
 * Centralized configuration and settings management
 *
 * @class ConfigManager
 * @version 10.0.0
 */

export class ConfigManager {

  static MODULE_ID = 'brancalonia-bigat';
  static settings = new Map();
  static defaults = null;

  /**
   * Initialize configuration system
   */
  static async init() {
    console.log('⚙️ Brancalonia ConfigManager | Initializing configuration system');

    // Load defaults
    this.defaults = this._getDefaults();

    // Register all settings
    this._registerSettings();

    // Load user preferences
    await this._loadUserPreferences();

    // Setup configuration menu
    this._registerConfigMenu();

    console.log(`✅ ConfigManager initialized with ${this.settings.size} settings`);
  }

  /**
   * Get default configuration
   * @private
   */
  static _getDefaults() {
    return {
      // General
      themeEnabled: true,
      language: 'it',
      debugMode: false,

      // Features
      enabledFeatures: {
        infamia: true,
        baraonda: true,
        compagnia: true,
        haven: true,
        dirtyJobs: true,
        tavernBrawl: true,
        menagramo: true,
        diseases: true,
        shoddyItems: true,
        environmentalHazards: true
      },

      // UI
      ui: {
        showInfamiaTracker: true,
        showBaraondaCounter: true,
        showCompagniaTab: true,
        useItalianTerms: true,
        animationsEnabled: true,
        compactMode: false
      },

      // Theme
      theme: {
        colorScheme: 'renaissance',
        fontFamily: 'default',
        decorationsEnabled: true,
        parchmentTexture: true,
        goldAccents: true,
        customCSS: ''
      },

      // Gameplay
      gameplay: {
        infamiaMax: 10,
        infamiaStarting: 0,
        baraondaEnabled: true,
        levelCap: 6,
        useShoddyRules: true,
        criticalFailures: true,
        menagramoActive: false
      },

      // Advanced
      advanced: {
        compatibilityMode: 'auto',
        performanceMode: false,
        experimentalFeatures: false,
        logLevel: 'info',
        autoBackup: true
      }
    };
  }

  /**
   * Register all module settings
   * @private
   */
  static _registerSettings() {
    // Theme Enabled
    game.settings.register(this.MODULE_ID, 'themeEnabled', {
      name: 'Brancalonia Theme',
      hint: 'Enable the Italian Renaissance visual theme',
      scope: 'client',
      config: true,
      type: Boolean,
      default: this.defaults.themeEnabled,
      onChange: value => this._onThemeToggle(value)
    });

    // Debug Mode
    game.settings.register(this.MODULE_ID, 'debugMode', {
      name: 'Debug Mode',
      hint: 'Enable debug logging and diagnostics',
      scope: 'client',
      config: true,
      type: Boolean,
      default: this.defaults.debugMode,
      onChange: value => this._onDebugToggle(value)
    });

    // Enabled Features
    game.settings.register(this.MODULE_ID, 'enabledFeatures', {
      scope: 'world',
      config: false,
      type: Object,
      default: this.defaults.enabledFeatures
    });

    // UI Settings
    game.settings.register(this.MODULE_ID, 'uiSettings', {
      scope: 'client',
      config: false,
      type: Object,
      default: this.defaults.ui
    });

    // Theme Settings
    game.settings.register(this.MODULE_ID, 'themeSettings', {
      scope: 'client',
      config: false,
      type: Object,
      default: this.defaults.theme
    });

    // Gameplay Settings
    game.settings.register(this.MODULE_ID, 'gameplaySettings', {
      scope: 'world',
      config: false,
      type: Object,
      default: this.defaults.gameplay
    });

    // Advanced Settings
    game.settings.register(this.MODULE_ID, 'advancedSettings', {
      scope: 'world',
      config: false,
      type: Object,
      default: this.defaults.advanced
    });

    // Store references
    ['themeEnabled', 'debugMode', 'enabledFeatures', 'uiSettings',
     'themeSettings', 'gameplaySettings', 'advancedSettings'].forEach(key => {
      this.settings.set(key, game.settings.get(this.MODULE_ID, key));
    });
  }

  /**
   * Register configuration menu
   * @private
   */
  static _registerConfigMenu() {
    game.settings.registerMenu(this.MODULE_ID, 'configMenu', {
      name: 'Brancalonia Configuration',
      label: 'Configure Brancalonia',
      hint: 'Open the Brancalonia configuration window',
      icon: 'fas fa-cogs',
      type: BrancaloniaConfigApp,
      restricted: true
    });
  }

  /**
   * Load user preferences
   * @private
   */
  static async _loadUserPreferences() {
    // Check for saved preferences
    const savedPrefs = localStorage.getItem('brancalonia-preferences');

    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        console.log('✅ Loaded user preferences from localStorage');

        // Apply non-world settings
        if (prefs.theme) {
          await this.setSetting('themeSettings', prefs.theme);
        }

        if (prefs.ui) {
          await this.setSetting('uiSettings', prefs.ui);
        }
      } catch (error) {
        console.error('❌ Failed to load user preferences:', error);
      }
    }
  }

  /**
   * Handle theme toggle
   * @private
   */
  static _onThemeToggle(enabled) {
    if (enabled) {
      document.body.classList.add('brancalonia-theme');
      console.log('🎨 Brancalonia theme enabled');
    } else {
      document.body.classList.remove('brancalonia-theme');
      console.log('🎨 Brancalonia theme disabled');
    }
  }

  /**
   * Handle debug toggle
   * @private
   */
  static _onDebugToggle(enabled) {
    if (enabled) {
      CONFIG.debug.brancalonia = true;
      console.log('🐛 Debug mode enabled');
    } else {
      CONFIG.debug.brancalonia = false;
      console.log('🐛 Debug mode disabled');
    }
  }

  /**
   * Public API to get setting
   */
  static getSetting(key, subkey = null) {
    const value = this.settings.get(key) ?? this.defaults[key];

    if (subkey && typeof value === 'object') {
      return value[subkey];
    }

    return value;
  }

  /**
   * Public API to set setting
   */
  static async setSetting(key, value) {
    await game.settings.set(this.MODULE_ID, key, value);
    this.settings.set(key, value);

    // Save to localStorage for persistence
    this._saveUserPreferences();

    return value;
  }

  /**
   * Save user preferences to localStorage
   * @private
   */
  static _saveUserPreferences() {
    const prefs = {
      theme: this.getSetting('themeSettings'),
      ui: this.getSetting('uiSettings'),
      timestamp: Date.now()
    };

    localStorage.setItem('brancalonia-preferences', JSON.stringify(prefs));
  }

  /**
   * Check if feature is enabled
   */
  static isFeatureEnabled(feature) {
    const features = this.getSetting('enabledFeatures');
    return features[feature] ?? false;
  }

  /**
   * Get all configuration
   */
  static getAll() {
    const config = {};

    for (const [key, value] of this.settings.entries()) {
      config[key] = value;
    }

    return config;
  }

  /**
   * Reset to defaults
   */
  static async resetToDefaults() {
    console.log('🔄 Resetting Brancalonia configuration to defaults');

    for (const key in this.defaults) {
      await this.setSetting(key, this.defaults[key]);
    }

    // Clear localStorage
    localStorage.removeItem('brancalonia-preferences');

    // Reload
    window.location.reload();
  }

  /**
   * Export configuration
   */
  static exportConfig() {
    const config = this.getAll();
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brancalonia-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('✅ Configuration exported');
  }

  /**
   * Import configuration
   */
  static async importConfig(file) {
    try {
      const text = await file.text();
      const config = JSON.parse(text);

      console.log('📥 Importing configuration:', config);

      // Validate and apply
      for (const [key, value] of Object.entries(config)) {
        if (this.defaults.hasOwnProperty(key)) {
          await this.setSetting(key, value);
        }
      }

      console.log('✅ Configuration imported successfully');

      // Reload to apply changes
      window.location.reload();
    } catch (error) {
      console.error('❌ Failed to import configuration:', error);
      ui.notifications.error('Failed to import configuration file');
    }
  }

  /**
   * Cleanup
   */
  static cleanup() {
    console.log('🧹 Cleaning up ConfigManager');
    this.settings.clear();
  }
}

/**
 * Configuration Application
 */
class BrancaloniaConfigApp extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'brancalonia-config',
      title: 'Brancalonia Configuration',
      template: 'modules/brancalonia-bigat/templates/config.html',
      width: 600,
      height: 'auto',
      tabs: [{navSelector: '.tabs', contentSelector: '.content', initial: 'general'}],
      closeOnSubmit: false
    });
  }

  getData() {
    return {
      config: ConfigManager.getAll(),
      defaults: ConfigManager.defaults
    };
  }

  async _updateObject(event, formData) {
    // Update settings based on form data
    for (const [key, value] of Object.entries(formData)) {
      const [category, setting] = key.split('.');

      if (category && setting) {
        const current = ConfigManager.getSetting(category) || {};
        current[setting] = value;
        await ConfigManager.setSetting(category, current);
      }
    }

    ui.notifications.info('Brancalonia configuration saved');
  }
}

export default ConfigManager;