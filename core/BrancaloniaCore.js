/**
 * BRANCALONIA CORE SYSTEM v10.0.0
 * Main initialization and orchestration class
 *
 * @class BrancaloniaCore
 * @version 10.0.0
 * @author Brancalonia Community
 */

class BrancaloniaCore {

  static ID = 'brancalonia-bigat';
  static VERSION = '10.0.0';
  static MINIMUM_DND5E = '5.0.0';
  static MINIMUM_FOUNDRY = '12.0.0';

  /**
   * Initialize the Brancalonia module
   */
  static async init() {
    console.log(`
╔════════════════════════════════════════════════╗
║  🎭 BRANCALONIA - Il Regno di Taglia v${this.VERSION}  ║
║  Initializing Italian Renaissance Experience   ║
╚════════════════════════════════════════════════╝
    `);

    // Check compatibility
    if (!this._checkCompatibility()) {
      return this._handleIncompatibility();
    }

    // Store reference globally
    window.Brancalonia = this;
    game.brancalonia = {
      core: this,
      version: this.VERSION,
      features: {},
      api: {}
    };

    // Initialize core systems
    await this._initializeCoreSystems();

    // Initialize features
    await this._initializeFeatures();

    // Register API
    this._registerPublicAPI();

    console.log('✅ Brancalonia Core initialized successfully');
  }

  /**
   * Check system compatibility
   * @private
   */
  static _checkCompatibility() {
    const checks = {
      foundry: this._checkFoundryVersion(),
      dnd5e: this._checkDnd5eVersion(),
      modules: this._checkRequiredModules()
    };

    const allPassed = Object.values(checks).every(check => check);

    if (!allPassed) {
      console.error('❌ Brancalonia compatibility check failed:', checks);
    }

    return allPassed;
  }

  /**
   * Check Foundry version
   * @private
   */
  static _checkFoundryVersion() {
    const currentVersion = game.version ?? game.data.version;
    const isCompatible = foundry.utils.isNewerVersion(currentVersion, this.MINIMUM_FOUNDRY) ||
                         currentVersion === this.MINIMUM_FOUNDRY;

    if (!isCompatible) {
      ui.notifications.error(
        `Brancalonia requires Foundry ${this.MINIMUM_FOUNDRY} or newer. Current: ${currentVersion}`,
        { permanent: true }
      );
    }

    return isCompatible;
  }

  /**
   * Check D&D 5e version
   * @private
   */
  static _checkDnd5eVersion() {
    if (game.system.id !== 'dnd5e') {
      ui.notifications.error(
        'Brancalonia requires the D&D 5e system',
        { permanent: true }
      );
      return false;
    }

    const currentVersion = game.system.version;
    const isCompatible = foundry.utils.isNewerVersion(currentVersion, this.MINIMUM_DND5E) ||
                         currentVersion === this.MINIMUM_DND5E;

    if (!isCompatible) {
      ui.notifications.error(
        `Brancalonia requires D&D 5e ${this.MINIMUM_DND5E} or newer. Current: ${currentVersion}`,
        { permanent: true }
      );
    }

    return isCompatible;
  }

  /**
   * Check required modules (if any)
   * @private
   */
  static _checkRequiredModules() {
    // For now, no hard dependencies
    return true;
  }

  /**
   * Handle incompatibility gracefully
   * @private
   */
  static _handleIncompatibility() {
    console.error('❌ Brancalonia cannot initialize due to compatibility issues');

    // Disable module features
    game.brancalonia = {
      core: null,
      error: 'Compatibility check failed',
      disabled: true
    };

    // Show persistent warning
    Hooks.once('ready', () => {
      new Dialog({
        title: 'Brancalonia - Compatibility Error',
        content: `
          <p><strong>Brancalonia cannot run on this setup.</strong></p>
          <p>Please check:</p>
          <ul>
            <li>Foundry VTT ${this.MINIMUM_FOUNDRY} or newer</li>
            <li>D&D 5e System ${this.MINIMUM_DND5E} or newer</li>
          </ul>
          <p>The module has been disabled to prevent errors.</p>
        `,
        buttons: {
          ok: {
            label: 'Understood',
            callback: () => {
              // Optionally disable the module
              game.settings.set('core', 'moduleConfiguration', {
                ...game.settings.get('core', 'moduleConfiguration'),
                [this.ID]: false
              });
            }
          }
        }
      }).render(true);
    });
  }

  /**
   * Initialize core systems
   * @private
   */
  static async _initializeCoreSystems() {
    // Lazy load core systems
    const { HooksManager } = await import('./HooksManager.js');
    const { ConfigManager } = await import('./ConfigManager.js');
    const { CompatibilityLayer } = await import('./CompatibilityLayer.js');

    // Initialize in order
    await ConfigManager.init();
    await CompatibilityLayer.init();
    await HooksManager.init();

    // Store references
    game.brancalonia.hooks = HooksManager;
    game.brancalonia.config = ConfigManager;
    game.brancalonia.compat = CompatibilityLayer;
  }

  /**
   * Initialize feature modules
   * @private
   */
  static async _initializeFeatures() {
    // Get enabled features from settings
    const enabledFeatures = game.settings.get(this.ID, 'enabledFeatures') ?? {
      infamia: true,
      baraonda: true,
      compagnia: true,
      haven: true,
      dirtyJobs: true,
      tavernBrawl: true,
      menagramo: true
    };

    // Load enabled features
    for (const [feature, enabled] of Object.entries(enabledFeatures)) {
      if (!enabled) continue;

      try {
        const modulePath = `../features/${feature}/${this._getFeatureModule(feature)}`;
        const module = await import(modulePath);

        if (module.default?.init) {
          await module.default.init();
          game.brancalonia.features[feature] = module.default;
          console.log(`✅ Feature loaded: ${feature}`);
        }
      } catch (error) {
        console.error(`❌ Failed to load feature ${feature}:`, error);
      }
    }
  }

  /**
   * Get feature module filename
   * @private
   */
  static _getFeatureModule(feature) {
    const moduleMap = {
      infamia: 'InfamiaSystem.js',
      baraonda: 'BaraondaSystem.js',
      compagnia: 'CompagniaManager.js',
      haven: 'HavenSystem.js',
      dirtyJobs: 'DirtyJobs.js',
      tavernBrawl: 'TavernBrawl.js',
      menagramo: 'Menagramo.js'
    };

    return moduleMap[feature] || `${feature}.js`;
  }

  /**
   * Register public API for other modules
   * @private
   */
  static _registerPublicAPI() {
    game.brancalonia.api = {
      // Version info
      version: this.VERSION,
      isCompatible: (minVersion) =>
        foundry.utils.isNewerVersion(this.VERSION, minVersion) || this.VERSION === minVersion,

      // Feature detection
      hasFeature: (feature) => !!game.brancalonia.features[feature],
      getFeature: (feature) => game.brancalonia.features[feature],

      // Utility functions
      addInfamia: (actor, amount) => {
        if (!this._isActor(actor)) return false;
        return game.brancalonia.features.infamia?.addInfamia(actor, amount) ?? false;
      },

      addBaraonda: (actor, points) => {
        if (!this._isActor(actor)) return false;
        return game.brancalonia.features.baraonda?.addPoints(actor, points) ?? false;
      },

      // Theme functions
      applyTheme: () => {
        document.body.classList.add('brancalonia-theme');
        return true;
      },

      removeTheme: () => {
        document.body.classList.remove('brancalonia-theme');
        return true;
      },

      // Debug utilities
      debug: {
        getSystemInfo: () => ({
          brancalonia: this.VERSION,
          foundry: game.version,
          dnd5e: game.system.version,
          features: Object.keys(game.brancalonia.features)
        }),

        runDiagnostics: async () => {
          const diagnostics = {
            core: this._checkCompatibility(),
            features: {},
            hooks: game.brancalonia.hooks?.getDiagnostics(),
            performance: await this._getPerformanceMetrics()
          };

          for (const [name, feature] of Object.entries(game.brancalonia.features)) {
            if (feature.runDiagnostics) {
              diagnostics.features[name] = await feature.runDiagnostics();
            }
          }

          return diagnostics;
        }
      }
    };
  }

  /**
   * Check if object is valid actor
   * @private
   */
  static _isActor(obj) {
    return obj instanceof Actor || obj?.documentName === 'Actor';
  }

  /**
   * Get performance metrics
   * @private
   */
  static async _getPerformanceMetrics() {
    const metrics = {
      loadTime: performance.now(),
      moduleCount: game.modules.size,
      activeFeatures: Object.keys(game.brancalonia.features).length,
      memoryUsage: performance.memory?.usedJSHeapSize ?? 'N/A'
    };

    return metrics;
  }

  /**
   * Cleanup on module disable
   */
  static async cleanup() {
    console.log('🧹 Brancalonia cleanup initiated');

    // Cleanup features
    for (const feature of Object.values(game.brancalonia.features)) {
      if (feature.cleanup) {
        await feature.cleanup();
      }
    }

    // Cleanup core systems
    game.brancalonia.hooks?.cleanup();
    game.brancalonia.config?.cleanup();
    game.brancalonia.compat?.cleanup();

    // Remove global references
    delete window.Brancalonia;
    delete game.brancalonia;

    console.log('✅ Brancalonia cleanup complete');
  }
}

// Initialize when Foundry is ready
Hooks.once('init', () => {
  BrancaloniaCore.init();
});

// Cleanup on module disable
Hooks.once('closeSettingsConfig', () => {
  // Check if module was disabled
  const isEnabled = game.settings.get('core', 'moduleConfiguration')[BrancaloniaCore.ID];

  if (!isEnabled && game.brancalonia?.core) {
    BrancaloniaCore.cleanup();
  }
});

// Export for module system
window.BrancaloniaCore = BrancaloniaCore;