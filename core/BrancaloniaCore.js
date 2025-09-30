/**
 * BRANCALONIA CORE SYSTEM v11.0.0
 * Main initialization and orchestration class
 *
 * @class BrancaloniaCore
 * @version 11.0.0
 * @author Brancalonia Community
 */

class BrancaloniaCore {

  static ID = 'brancalonia-bigat';
  static VERSION = '11.0.0';
  static MINIMUM_DND5E = '5.0.0';
  static MINIMUM_FOUNDRY = '12.0.0';

  /**
   * Map of module dependencies
   */
  static MODULE_DEPENDENCIES = {
    // Core modules (no dependencies)
    'brancalonia-modules-init-fix': [],
    'brancalonia-ui-coordinator': [],
    'brancalonia-module-activator': [],
    'brancalonia-v13-modern': [],
    'brancalonia-compatibility-fix': [],
    'brancalonia-sheets': [],
    'brancalonia-icon-interceptor': [],

    // Feature modules with dependencies
    'reputation-infamia-unified': [],
    'haven-system': [],
    'compagnia-manager': ['reputation-infamia-unified'],
    'dirty-jobs': ['compagnia-manager'],
    'malefatte-taglie-nomea': ['reputation-infamia-unified'],
    'menagramo-system': [],
    'menagramo-warlock-patron': ['menagramo-system'],
    'tavern-brawl': [],
    'tavern-entertainment-consolidated': [],
    'diseases-system': [],
    'environmental-hazards': [],
    'wilderness-encounters': [],
    'level-cap': [],
    'brancalonia-dice-theme': [],
    'background-privileges': [],
    'factions-system': [],
    'dueling-system': [],
    'shoddy-equipment': [],
    'rest-system': ['haven-system'],
    'covo-granlussi-v2': [],
    'covo-migration': ['covo-granlussi-v2'],
    'covo-macros': ['covo-granlussi-v2'],
    'favori-system': [],
    'brancalonia-active-effects': [],
    'brancalonia-conditions': [],
    'brancalonia-mechanics': []
  };

  /**
   * Module initialization status tracker
   */
  static moduleStatus = new Map();

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
      modules: {},
      api: {},
      debug: {
        enabled: false,
        log: (...args) => {
          if (game.brancalonia.debug.enabled) {
            console.log('[Brancalonia]', ...args);
          }
        }
      }
    };

    // Register core settings
    this._registerCoreSettings();

    // Initialize modules with dependency resolution
    await this._initializeModules();

    // Register public API
    this._registerPublicAPI();

    // Setup error handling
    this._setupErrorHandling();

    console.log('✅ Brancalonia Core initialized successfully');
    console.log(`📦 Loaded modules: ${this.moduleStatus.size}`);

    // Log any failed modules
    const failedModules = Array.from(this.moduleStatus.entries())
      .filter(([_, status]) => status === 'failed');
    if (failedModules.length > 0) {
      console.warn('⚠️ Failed modules:', failedModules.map(([name]) => name));
    }
  }

  /**
   * Register core module settings
   * @private
   */
  static _registerCoreSettings() {
    game.settings.register(this.ID, 'debugMode', {
      name: 'Debug Mode',
      hint: 'Enable debug logging for troubleshooting',
      scope: 'client',
      config: true,
      type: Boolean,
      default: false,
      onChange: value => {
        game.brancalonia.debug.enabled = value;
      }
    });

    game.settings.register(this.ID, 'enabledModules', {
      name: 'Enabled Modules',
      hint: 'Select which Brancalonia features to enable',
      scope: 'world',
      config: false,
      type: Object,
      default: {}
    });
  }

  /**
   * Check system compatibility
   * @private
   */
  static _checkCompatibility() {
    const checks = {
      foundry: this._checkFoundryVersion(),
      dnd5e: this._checkDnd5eVersion()
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
            callback: () => {}
          }
        }
      }).render(true);
    });
  }

  /**
   * Initialize modules with dependency resolution
   * @private
   */
  static async _initializeModules() {
    const moduleList = Object.keys(this.MODULE_DEPENDENCIES);
    const initialized = new Set();
    const initializing = new Set();

    /**
     * Initialize a single module
     */
    const initModule = async (moduleName) => {
      // Skip if already initialized or initializing
      if (initialized.has(moduleName) || initializing.has(moduleName)) {
        return this.moduleStatus.get(moduleName) !== 'failed';
      }

      initializing.add(moduleName);

      // Initialize dependencies first
      const dependencies = this.MODULE_DEPENDENCIES[moduleName] || [];
      for (const dep of dependencies) {
        const depSuccess = await initModule(dep);
        if (!depSuccess) {
          console.warn(`⚠️ Module ${moduleName} skipped due to failed dependency: ${dep}`);
          this.moduleStatus.set(moduleName, 'skipped');
          initializing.delete(moduleName);
          return false;
        }
      }

      // Try to initialize the module
      try {
        const moduleClass = await this._loadModule(moduleName);

        if (moduleClass) {
          // Call initialize if it exists
          if (typeof moduleClass.initialize === 'function') {
            await moduleClass.initialize();
          }

          // Store reference
          game.brancalonia.modules[moduleName] = moduleClass;
          this.moduleStatus.set(moduleName, 'success');
          initialized.add(moduleName);

          game.brancalonia.debug.log(`✅ Module loaded: ${moduleName}`);

          initializing.delete(moduleName);
          return true;
        } else {
          this.moduleStatus.set(moduleName, 'not-found');
          initializing.delete(moduleName);
          return false;
        }
      } catch (error) {
        console.error(`❌ Failed to initialize module ${moduleName}:`, error);
        this.moduleStatus.set(moduleName, 'failed');
        initializing.delete(moduleName);
        return false;
      }
    };

    // Initialize all modules
    for (const moduleName of moduleList) {
      await initModule(moduleName);
    }
  }

  /**
   * Load a module dynamically
   * @private
   */
  static async _loadModule(moduleName) {
    // Map module names to their actual file names
    const moduleFileMap = {
      'reputation-infamia-unified': 'reputation-infamia-unified',
      'haven-system': 'haven-system',
      'compagnia-manager': 'compagnia-manager',
      'dirty-jobs': 'dirty-jobs',
      'menagramo-system': 'menagramo-system',
      'menagramo-warlock-patron': 'menagramo-warlock-patron',
      'tavern-brawl': 'tavern-brawl',
      'tavern-entertainment-consolidated': 'tavern-entertainment-consolidated',
      'diseases-system': 'diseases-system',
      'environmental-hazards': 'environmental-hazards',
      'wilderness-encounters': 'wilderness-encounters',
      'level-cap': 'level-cap',
      'brancalonia-dice-theme': 'brancalonia-dice-theme',
      'background-privileges': 'background-privileges',
      'factions-system': 'factions-system',
      'dueling-system': 'dueling-system',
      'shoddy-equipment': 'shoddy-equipment',
      'rest-system': 'rest-system',
      'covo-granlussi-v2': 'covo-granlussi-v2',
      'covo-migration': 'covo-migration',
      'covo-macros': 'covo-macros',
      'favori-system': 'favori-system',
      'brancalonia-active-effects': 'brancalonia-active-effects',
      'brancalonia-conditions': 'brancalonia-conditions',
      'brancalonia-mechanics': 'brancalonia-mechanics',
      'malefatte-taglie-nomea': 'malefatte-taglie-nomea',
      'brancalonia-modules-init-fix': 'brancalonia-modules-init-fix',
      'brancalonia-ui-coordinator': 'brancalonia-ui-coordinator',
      'brancalonia-module-activator': 'brancalonia-module-activator',
      'brancalonia-v13-modern': 'brancalonia-v13-modern',
      'brancalonia-compatibility-fix': 'brancalonia-compatibility-fix',
      'brancalonia-sheets': 'brancalonia-sheets',
      'brancalonia-icon-interceptor': 'brancalonia-icon-interceptor'
    };

    const fileName = moduleFileMap[moduleName];
    if (!fileName) {
      game.brancalonia.debug.log(`Module ${moduleName} not in file map`);
      return null;
    }

    // Modules are already loaded via module.json esmodules
    // We just need to find them in the global scope

    // Check common global locations where modules register themselves
    const possibleLocations = [
      window[moduleName],
      window[fileName],
      game.brancalonia?.[moduleName],
      game.brancalonia?.[fileName],
      // Convert kebab-case to CamelCase
      window[this._kebabToCamel(moduleName)],
      window[this._kebabToPascal(moduleName)]
    ];

    for (const location of possibleLocations) {
      if (location) {
        return location;
      }
    }

    game.brancalonia.debug.log(`Module ${moduleName} not found in global scope`);
    return null;
  }

  /**
   * Convert kebab-case to camelCase
   * @private
   */
  static _kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * Convert kebab-case to PascalCase
   * @private
   */
  static _kebabToPascal(str) {
    const camel = this._kebabToCamel(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }

  /**
   * Setup global error handling
   * @private
   */
  static _setupErrorHandling() {
    window.addEventListener('error', (event) => {
      if (event.filename?.includes('brancalonia')) {
        console.error('Brancalonia Error:', event.error);
        if (game.brancalonia.debug.enabled) {
          ui.notifications.error(`Brancalonia Error: ${event.error.message}`);
        }
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.stack?.includes('brancalonia')) {
        console.error('Brancalonia Promise Rejection:', event.reason);
        if (game.brancalonia.debug.enabled) {
          ui.notifications.error(`Brancalonia Error: ${event.reason.message || event.reason}`);
        }
      }
    });
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

      // Module detection
      hasModule: (moduleName) => !!game.brancalonia.modules[moduleName],
      getModule: (moduleName) => game.brancalonia.modules[moduleName],
      getModuleStatus: (moduleName) => this.moduleStatus.get(moduleName),

      // Utility functions
      addInfamia: (actor, amount) => {
        if (!this._isActor(actor)) return false;
        const infamiaModule = game.brancalonia.modules['reputation-infamia-unified'];
        return infamiaModule?.addInfamia?.(actor, amount) ?? false;
      },

      getInfamia: (actor) => {
        if (!this._isActor(actor)) return 0;
        const infamiaModule = game.brancalonia.modules['reputation-infamia-unified'];
        return infamiaModule?.getInfamia?.(actor) ?? 0;
      },

      // Theme functions
      applyTheme: () => {
        document.body.classList.add('theme-brancalonia');
        return true;
      },

      removeTheme: () => {
        document.body.classList.remove('theme-brancalonia');
        return true;
      },

      // Debug utilities
      debug: {
        enable: () => {
          game.brancalonia.debug.enabled = true;
          game.settings.set(BrancaloniaCore.ID, 'debugMode', true);
        },

        disable: () => {
          game.brancalonia.debug.enabled = false;
          game.settings.set(BrancaloniaCore.ID, 'debugMode', false);
        },

        getSystemInfo: () => ({
          brancalonia: this.VERSION,
          foundry: game.version,
          dnd5e: game.system.version,
          modules: Object.keys(game.brancalonia.modules),
          moduleStatus: Object.fromEntries(this.moduleStatus)
        }),

        runDiagnostics: async () => {
          const diagnostics = {
            core: this._checkCompatibility(),
            modules: Object.fromEntries(this.moduleStatus),
            performance: await this._getPerformanceMetrics()
          };

          // Run diagnostics for each module if available
          for (const [name, module] of Object.entries(game.brancalonia.modules)) {
            if (typeof module.runDiagnostics === 'function') {
              diagnostics[name] = await module.runDiagnostics();
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
      activeModules: Object.keys(game.brancalonia.modules).length,
      failedModules: Array.from(this.moduleStatus.entries())
        .filter(([_, status]) => status === 'failed')
        .map(([name]) => name),
      memoryUsage: performance.memory?.usedJSHeapSize ?? 'N/A'
    };

    return metrics;
  }

  /**
   * Cleanup on module disable
   */
  static async cleanup() {
    console.log('🧹 Brancalonia cleanup initiated');

    // Cleanup modules
    for (const [name, module] of Object.entries(game.brancalonia.modules)) {
      if (typeof module.cleanup === 'function') {
        try {
          await module.cleanup();
        } catch (error) {
          console.error(`Error cleaning up module ${name}:`, error);
        }
      }
    }

    // Remove global references
    delete window.Brancalonia;
    delete game.brancalonia;

    console.log('✅ Brancalonia cleanup complete');
  }
}

// Initialize when Foundry is ready
Hooks.once('init', () => {
  BrancaloniaCore.init().catch(error => {
    console.error('Fatal error initializing Brancalonia:', error);
    ui.notifications.error('Brancalonia failed to initialize. Check console for details.', { permanent: true });
  });
});

// Cleanup on module disable
Hooks.on('closeSettingsConfig', () => {
  // Check if module was disabled
  setTimeout(() => {
    const moduleConfig = game.settings.get('core', 'moduleConfiguration');
    const isEnabled = moduleConfig[BrancaloniaCore.ID];

    if (!isEnabled && game.brancalonia?.core) {
      BrancaloniaCore.cleanup();
    }
  }, 100);
});

// Export for module system
window.BrancaloniaCore = BrancaloniaCore;
export default BrancaloniaCore;