/**
 * BRANCALONIA CORE SYSTEM v11.0.0
 * Main initialization and orchestration class
 *
 * @class BrancaloniaCore
 * @version 11.0.0
 * @author Brancalonia Community
 */

import BrancaloniaLogger from '../modules/brancalonia-logger.js';
import { BrancaloniaModuleLoader } from '../modules/brancalonia-module-loader.js';

class BrancaloniaCore {

  static ID = 'brancalonia-bigat';
  static VERSION = '13.0.63';
  static MINIMUM_DND5E = '5.1.0';
  static MINIMUM_FOUNDRY = '13.0.0';

  /**
   * Map of module dependencies
   */
  static MODULE_DEPENDENCIES = {
    'brancalonia-logger': [],
    'brancalonia-module-loader': ['brancalonia-logger'],
    'brancalonia-modules-init-fix': ['brancalonia-module-loader'],
    'brancalonia-module-activator': ['brancalonia-modules-init-fix'],
    'brancalonia-v13-modern': ['brancalonia-module-activator'],
    'brancalonia-compatibility-fix': [],
    'brancalonia-theme': ['brancalonia-v13-modern'],
    'brancalonia-dice-theme': ['brancalonia-theme'],
    'brancalonia-ui-coordinator': ['brancalonia-theme'],
    'brancalonia-sheets': ['brancalonia-theme'],
    'brancalonia-icon-interceptor': ['brancalonia-theme'],

    'reputation-infamia-unified': [],
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
    'background-privileges': [],
    'factions-system': [],
    'dueling-system': [],
    'shoddy-equipment': [],
    'covo-granlussi-v2': [],
    'rest-system': ['covo-granlussi-v2'],
    'covo-macros': ['covo-granlussi-v2'],
    'favori-system': [],
    'brancalonia-active-effects': ['brancalonia-conditions'],
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
      logger: BrancaloniaLogger,
      loader: new BrancaloniaModuleLoader(),
      debug: {
        enabled: false,
        log: (...args) => {
          if (game.brancalonia.debug.enabled) {
            BrancaloniaLogger.debug('CoreDebug', ...args);
          }
        }
      }
    };

    BrancaloniaLogger.setLogLevel(game.settings.get(this.ID, 'debugMode') ? 'DEBUG' : BrancaloniaLogger.logLevel);

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
        BrancaloniaLogger.setLogLevel(value ? 'DEBUG' : BrancaloniaLogger.logLevel);
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
    const loader = game.brancalonia.loader;
    loader.registerModule('brancalonia-logger', async () => BrancaloniaLogger);
    loader.registerModule('brancalonia-module-loader', async () => loader);

    const moduleList = Object.keys(this.MODULE_DEPENDENCIES);
    const initialized = new Set();
    const initializing = new Set();
    const retryCount = new Map();

    /**
     * Initialize a single module
     */
    const initModule = async (moduleName) => {
      // Skip if already initialized
      if (initialized.has(moduleName)) {
        return this.moduleStatus.get(moduleName) !== 'failed';
      }

      // Check retry limit
      const currentRetries = retryCount.get(moduleName) || 0;
      if (currentRetries >= 3) {
        console.error(`❌ Module ${moduleName} exceeded retry limit, skipping`);
        this.moduleStatus.set(moduleName, 'failed');
        return false;
      }

      // Skip if already initializing
      if (initializing.has(moduleName)) {
        return this.moduleStatus.get(moduleName) !== 'failed';
      }

      initializing.add(moduleName);
      retryCount.set(moduleName, currentRetries + 1);

      // Initialize dependencies first
      const dependencies = this.MODULE_DEPENDENCIES[moduleName] || [];
      for (const dep of dependencies) {
        // Verifica se la dipendenza è già stata inizializzata da altro sistema
        // Controlla sia il nome con trattino che senza, e nel namespace globale
        const depClassName = dep.split('-').map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('');
        const depInitialized = initialized.has(dep) ||
                               game.brancalonia?.modules?.[dep] ||
                               game.brancalonia?.modules?.[dep.replace(/-/g, '')] ||
                               window[depClassName] ||
                               window[dep] ||
                               this.moduleStatus.get(dep) === 'success' ||
                               this.moduleStatus.get(dep.replace(/-/g, '')) === 'success';
        
        if (depInitialized) {
          console.log(`✅ Dependency ${dep} already initialized for ${moduleName}`);
          // Marca la dipendenza come inizializzata per evitare futuri controlli
          initialized.add(dep);
          this.moduleStatus.set(dep, 'success');
          // Reset retry count for successful dependency
          retryCount.delete(dep);
          continue;
        }
        
        const depSuccess = await initModule(dep);
        if (!depSuccess && this.moduleStatus.get(dep) !== 'success') {
          // Verifica ancora una volta se si è inizializzato nel frattempo
          const recheckInitialized = game.brancalonia?.modules?.[dep] ||
                                     window[dep.split('-').map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('')];
          
          if (recheckInitialized) {
            game.brancalonia.debug.log(`✅ Dependency ${dep} initialized during wait for ${moduleName}`);
            initialized.add(dep);
            this.moduleStatus.set(dep, 'success');
            continue;
          }
          
          // Debug silenzioso - riprova automaticamente
          game.brancalonia.debug.log(`🔄 Module ${moduleName} dependency ${dep} not ready, retrying...`);
          // Invece di saltare, metti in coda per riprovare
          setTimeout(async () => {
            if (!initializing.has(moduleName)) {
              game.brancalonia.debug.log(`🔄 Retrying initialization of ${moduleName}`);
              await initModule(moduleName);
            }
          }, 1000);
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

          // Reset retry count on successful initialization
          retryCount.delete(moduleName);

          game.brancalonia.debug.log(`✅ Module loaded: ${moduleName}`);

          initializing.delete(moduleName);
          return true;
        } else {
          // Debug silenzioso - riprova automaticamente senza warning in console
          game.brancalonia.debug.log(`🔄 Module ${moduleName} class not found, retrying...`);
          // Invece di fallire, riprova dopo un delay
          setTimeout(async () => {
            if (!initializing.has(moduleName)) {
              game.brancalonia.debug.log(`🔄 Retrying to load ${moduleName}`);
              await initModule(moduleName);
            }
          }, 2000);
          return false;
        }
      } catch (error) {
        console.error(`❌ Failed to initialize module ${moduleName}:`, error);
        // Invece di fallire definitivamente, riprova dopo un delay
        setTimeout(async () => {
          if (!initializing.has(moduleName)) {
            console.log(`🔄 Retrying failed module ${moduleName}`);
            await initModule(moduleName);
          }
        }, 3000);
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
      'brancalonia-icon-interceptor': 'brancalonia-icon-interceptor',
      'brancalonia-theme': 'brancalonia-theme',
      'brancalonia-dice-theme': 'brancalonia-dice-theme',
      'brancalonia-modules-init-fix': 'brancalonia-modules-init-fix'
    };

    const sideEffectModules = new Set([
      'brancalonia-modules-init-fix',
      'brancalonia-module-activator',
      'brancalonia-v13-modern',
      'brancalonia-theme',
      'brancalonia-dice-theme',
      'brancalonia-ui-coordinator',
      'brancalonia-icon-interceptor'
    ]);

    const fileName = moduleFileMap[moduleName];
    if (!fileName) {
      const registered = game.brancalonia.loader.modules?.get(moduleName);
      if (registered) {
        return registered.loader;
      }
      game.brancalonia.debug.log(`Module ${moduleName} not in file map`);
      if (sideEffectModules.has(moduleName)) {
        return {
          async initialize() {
            return true;
          }
        };
      }
      return null;
    }

    // Modules are already loaded via module.json esmodules
    // We just need to find them in the global scope

    // Check common global locations where modules register themselves
    const possibleLocations = [
      window[moduleName],
      window[fileName],
      window[`${this._kebabToPascal(moduleName)}Class`], // Per classi esportate con suffisso Class
      window[`${this._kebabToPascal(fileName)}Class`],
      game.brancalonia?.[moduleName],
      game.brancalonia?.[fileName],
      // Convert kebab-case to CamelCase
      window[this._kebabToCamel(moduleName)],
      window[this._kebabToPascal(moduleName)],
      // Additional checks for common patterns
      window[moduleName.replace(/-/g, '')],
      window[this._kebabToCamel(fileName)],
      window[this._kebabToPascal(fileName)]
    ];

    for (const location of possibleLocations) {
      if (location) {
        return location;
      }
    }

    game.brancalonia.debug.log(`Module ${moduleName} not found in global scope, delegating to loader`);
    if (sideEffectModules.has(moduleName)) {
      return {
        async initialize() {
          return true;
        }
      };
    }
    if (game.brancalonia.loader.modules?.has(moduleName)) {
      await game.brancalonia.loader.loadModule(moduleName);
      return game.brancalonia.loader.modules.get(moduleName).loader;
    }
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
        BrancaloniaLogger.error('WindowError', event.error?.message ?? 'Unknown error', event.error);
        if (game.brancalonia.debug.enabled) {
          ui.notifications.error(`Brancalonia Error: ${event.error?.message ?? event.error}`);
        }
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.stack?.includes('brancalonia')) {
        BrancaloniaLogger.error('PromiseRejection', event.reason?.message ?? event.reason, event.reason);
        if (game.brancalonia.debug.enabled) {
          ui.notifications.error(`Brancalonia Error: ${event.reason?.message ?? event.reason}`);
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
      },
      logger: BrancaloniaLogger,
      loader: game.brancalonia.loader
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
    BrancaloniaLogger.info('Cleanup', 'Brancalonia cleanup complete');
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