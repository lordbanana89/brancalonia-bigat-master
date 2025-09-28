/**
 * Sistema di caricamento ottimizzato per i moduli Brancalonia
 * Gestisce dipendenze, priorità e caricamento lazy
 */

import logger from './brancalonia-logger.js';

class BrancaloniaModuleLoader {
  constructor() {
    this.modules = new Map();
    this.loadedModules = new Set();
    this.moduleErrors = new Map();
    this.loadTimes = new Map();

    // Definisce priorità e dipendenze dei moduli
    this.moduleConfig = {
      // Core modules - Priority 0 (caricati per primi)
      'brancalonia-logger': {
        priority: 0,
        critical: true,
        dependencies: []
      },
      'brancalonia-slugify-fix': {
        priority: 1,
        critical: true,
        dependencies: []
      },
      'brancalonia-actorsheet-fix': {
        priority: 1,
        critical: true,
        dependencies: []
      },
      'brancalonia-module-compatibility': {
        priority: 1,
        critical: true,
        dependencies: []
      },
      'brancalonia-api-modern-safe': {
        priority: 2,
        critical: true,
        dependencies: []
      },
      'brancalonia-v13-modern': {
        priority: 2,
        critical: true,
        dependencies: ['brancalonia-api-modern-safe']
      },

      // Theme and UI - Priority 10
      'brancalonia-theme': {
        priority: 10,
        critical: false,
        dependencies: [],
        lazy: false
      },
      'brancalonia-dice-theme': {
        priority: 11,
        critical: false,
        dependencies: ['brancalonia-theme'],
        lazy: true
      },

      // Game mechanics - Priority 20
      'infamia-tracker': {
        priority: 20,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'haven-system': {
        priority: 20,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'compagnia-manager': {
        priority: 20,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'menagramo': {
        priority: 21,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'tavern-games': {
        priority: 21,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'diseases-system': {
        priority: 22,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'environmental-hazards': {
        priority: 22,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'dueling-system': {
        priority: 23,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'factions-system': {
        priority: 23,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'reputation-system': {
        priority: 24,
        critical: false,
        dependencies: ['factions-system'],
        lazy: true
      },

      // Support modules - Priority 30
      'brancalonia-conditions': {
        priority: 30,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'brancalonia-active-effects': {
        priority: 31,
        critical: false,
        dependencies: ['brancalonia-conditions'],
        lazy: true
      },
      'brancalonia-active-effects-complete': {
        priority: 32,
        critical: false,
        dependencies: ['brancalonia-active-effects'],
        lazy: true
      },

      // Utility modules - Priority 40
      'brancalonia-links': {
        priority: 40,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'brancalonia-rules-chat': {
        priority: 40,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'brancalonia-sheets': {
        priority: 41,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'background-privileges': {
        priority: 42,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'brancalonia-targeted-fix': {
        priority: 50,
        critical: false,
        dependencies: [],
        lazy: false
      }
    };
  }

  /**
   * Registra un modulo per il caricamento
   */
  registerModule(name, loader, config = {}) {
    const moduleConfig = this.moduleConfig[name] || {
      priority: 100,
      critical: false,
      dependencies: [],
      lazy: false
    };

    this.modules.set(name, {
      name,
      loader,
      ...moduleConfig,
      ...config
    });

    logger.debug('ModuleLoader', `Registered module: ${name}`, moduleConfig);
  }

  /**
   * Carica un modulo con gestione errori
   */
  async loadModule(name) {
    if (this.loadedModules.has(name)) {
      logger.trace('ModuleLoader', `Module already loaded: ${name}`);
      return true;
    }

    const module = this.modules.get(name);
    if (!module) {
      logger.warn('ModuleLoader', `Module not found: ${name}`);
      return false;
    }

    logger.debug('ModuleLoader', `Loading module: ${name}`);
    const startTime = performance.now();

    try {
      // Carica dipendenze prima
      for (const dep of module.dependencies) {
        if (!await this.loadModule(dep)) {
          throw new Error(`Dependency failed: ${dep}`);
        }
      }

      // Esegui il loader del modulo
      if (typeof module.loader === 'function') {
        await module.loader();
      } else if (typeof module.loader === 'string') {
        await import(module.loader);
      }

      this.loadedModules.add(name);
      const loadTime = performance.now() - startTime;
      this.loadTimes.set(name, loadTime);

      logger.info('ModuleLoader', `Loaded module: ${name} (${loadTime.toFixed(2)}ms)`);
      return true;

    } catch (error) {
      this.moduleErrors.set(name, error);
      const errorMessage = `Failed to load module: ${name}`;

      if (module.critical) {
        logger.error('ModuleLoader', errorMessage, error);
        ui.notifications?.error(`Critical module failed: ${name}`);
        throw error;
      } else {
        logger.warn('ModuleLoader', errorMessage, error);
        return false;
      }
    }
  }

  /**
   * Carica tutti i moduli in base a priorità
   */
  async loadAll() {
    logger.info('ModuleLoader', 'Starting module loading sequence');
    logger.startPerformance('module-loading');

    // Ordina moduli per priorità
    const sortedModules = Array.from(this.modules.entries())
      .sort((a, b) => (a[1].priority ?? 100) - (b[1].priority ?? 100));

    // Raggruppa per priorità per caricamento parallelo
    const priorityGroups = new Map();
    for (const [name, module] of sortedModules) {
      const priority = module.priority ?? 100;
      if (!priorityGroups.has(priority)) {
        priorityGroups.set(priority, []);
      }
      priorityGroups.get(priority).push(name);
    }

    // Carica gruppi in sequenza, moduli nel gruppo in parallelo
    for (const [priority, moduleNames] of priorityGroups) {
      logger.debug('ModuleLoader', `Loading priority group ${priority}`, moduleNames);

      const promises = moduleNames
        .filter(name => {
          const module = this.modules.get(name);
          return !module.lazy; // Skip lazy modules
        })
        .map(name => this.loadModule(name));

      await Promise.allSettled(promises);
    }

    const totalTime = logger.endPerformance('module-loading');
    this.logLoadingSummary(totalTime);
  }

  /**
   * Carica moduli lazy on-demand
   */
  async loadLazy(moduleName) {
    const module = this.modules.get(moduleName);
    if (!module || !module.lazy) {
      logger.warn('ModuleLoader', `Module ${moduleName} is not lazy or doesn't exist`);
      return false;
    }

    logger.info('ModuleLoader', `Lazy loading module: ${moduleName}`);
    return await this.loadModule(moduleName);
  }

  /**
   * Log summary del caricamento
   */
  logLoadingSummary(totalTime) {
    const loaded = this.loadedModules.size;
    const failed = this.moduleErrors.size;
    const total = this.modules.size;

    logger.info('ModuleLoader',
      `Module loading complete: ${loaded}/${total} loaded, ${failed} failed (${totalTime?.toFixed(2)}ms total)`
    );

    if (failed > 0) {
      logger.group('Failed Modules');
      for (const [name, error] of this.moduleErrors) {
        logger.error('ModuleLoader', `${name}: ${error.message}`);
      }
      logger.groupEnd();
    }

    // Log moduli più lenti
    const slowModules = Array.from(this.loadTimes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (slowModules.length > 0) {
      logger.debug('ModuleLoader', 'Slowest modules:');
      logger.table(
        slowModules.map(([name, time]) => ({
          Module: name,
          'Load Time': `${time.toFixed(2)}ms`
        }))
      );
    }
  }

  /**
   * Ricarica un modulo
   */
  async reloadModule(name) {
    logger.info('ModuleLoader', `Reloading module: ${name}`);
    this.loadedModules.delete(name);
    this.moduleErrors.delete(name);
    return await this.loadModule(name);
  }

  /**
   * Ottiene lo stato di un modulo
   */
  getModuleStatus(name) {
    return {
      loaded: this.loadedModules.has(name),
      error: this.moduleErrors.get(name),
      loadTime: this.loadTimes.get(name)
    };
  }

  /**
   * Esporta report di caricamento
   */
  exportLoadingReport() {
    const report = {
      timestamp: new Date().toISOString(),
      loaded: Array.from(this.loadedModules),
      errors: Array.from(this.moduleErrors.entries()).map(([name, error]) => ({
        module: name,
        error: error.message,
        stack: error.stack
      })),
      loadTimes: Object.fromEntries(this.loadTimes),
      totalModules: this.modules.size,
      successRate: `${((this.loadedModules.size / this.modules.size) * 100).toFixed(2)}%`
    };

    return report;
  }
}

// Singleton instance
const moduleLoader = new BrancaloniaModuleLoader();

// Export
export { moduleLoader as default, BrancaloniaModuleLoader };