/**
 * Sistema di caricamento ottimizzato per i moduli Brancalonia
 * Gestisce dipendenze, priorità e caricamento lazy
 */

import { createModuleLogger } from './brancalonia-logger.js';

const MODULE_LABEL = 'Brancalonia Module Loader';
const moduleLogger = createModuleLogger(MODULE_LABEL);

class BrancaloniaModuleLoader {
  constructor() {
    this.modules = new Map();
    this.loadedModules = new Set();
    this.moduleErrors = new Map();
    this.loadTimes = new Map();
    this.loadingModules = new Map();

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
      'brancalonia-modules-init-fix': {
        priority: 1,
        critical: true,
        dependencies: []
      },
      'brancalonia-data-validator': {
        priority: 0,
        critical: true,
        dependencies: ['brancalonia-logger']
      },
      'preload-duration-fix': {
        priority: -1,
        critical: true,
        dependencies: ['brancalonia-logger']
      },
      'nuclear-duration-fix': {
        priority: -2,
        critical: true,
        dependencies: ['brancalonia-logger']
      },
      'console-commands': {
        priority: -3,
        critical: true,
        dependencies: []
      },
      'test-module-loading': {
        priority: -4,
        critical: false,
        dependencies: []
      },
      'brancalonia-module-activator': {
        priority: 2,
        critical: true,
        dependencies: ['brancalonia-modules-init-fix']
      },
      'brancalonia-v13-modern': {
        priority: 2,
        critical: true,
        dependencies: []
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
      'reputation-infamia-unified': {
        priority: 20,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'haven-system': {
        priority: 20,
        critical: false,
        dependencies: [],
        lazy: false
      },
      'compagnia-manager': {
        priority: 20,
        critical: false,
        dependencies: ['reputation-infamia-unified'],
        lazy: false
      },
      'dirty-jobs': {
        priority: 20,
        critical: false,
        dependencies: ['compagnia-manager'],
        lazy: true
      },
      'menagramo-system': {
        priority: 21,
        critical: false,
        dependencies: [],
        lazy: false
      },
      'menagramo-warlock-patron': {
        priority: 21,
        critical: false,
        dependencies: ['menagramo-system'],
        lazy: false
      },
      'tavern-brawl': {
        priority: 21,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'tavern-entertainment-consolidated': {
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
      'wilderness-encounters': {
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
      'brancalonia-mechanics': {
        priority: 32,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'background-privileges': {
        priority: 33,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'favori-system': {
        priority: 33,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'rest-system': {
        priority: 34,
        critical: false,
        dependencies: ['haven-system'],
        lazy: true
      },
      'shoddy-equipment': {
        priority: 34,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'covo-granlussi-v2': {
        priority: 35,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'covo-migration': {
        priority: 35,
        critical: false,
        dependencies: ['covo-granlussi-v2'],
        lazy: true
      },
      'covo-macros': {
        priority: 35,
        critical: false,
        dependencies: ['covo-granlussi-v2'],
        lazy: true
      },

      // Utility modules - Priority 40
      'brancalonia-sheets': {
        priority: 40,
        critical: false,
        dependencies: [],
        lazy: true
      },
      'brancalonia-ui-coordinator': {
        priority: 41,
        critical: false,
        dependencies: ['brancalonia-theme'],
        lazy: true
      },
      'brancalonia-icon-interceptor': {
        priority: 42,
        critical: false,
        dependencies: [],
        lazy: false
      }
    };
  }

  registerModule(name, loader, config = {}) {
    const moduleConfig = this.moduleConfig[name] || { priority: 100, critical: false, dependencies: [], lazy: false };

    this.modules.set(name, {
      name,
      loader,
      ...moduleConfig,
      ...config
    });

    moduleLogger.debug(`Registered module: ${name}`, moduleConfig);
  }

  async loadModule(name) {
    if (this.loadedModules.has(name)) {
      moduleLogger.trace(`Module already loaded: ${name}`);
      return true;
    }

    if (this.loadingModules.has(name)) {
      moduleLogger.trace(`Module load already in progress: ${name}`);
      return this.loadingModules.get(name);
    }

    const module = this.modules.get(name);
    if (!module) {
      const error = new Error('Module not registered');
      moduleLogger.warn(`Module not found: ${name}`);

      this.moduleErrors.set(name, error);

      // Emit event
      moduleLogger.events.emit('loader:module-not-found', {
        module: name,
        timestamp: Date.now()
      });

      return false;
    }

    const loadPromise = (async () => {
      moduleLogger.debug(`Loading module: ${name}`);
      const startTime = performance.now();

      try {
        for (const dep of module.dependencies) {
          if (!await this.loadModule(dep)) {
            throw new Error(`Dependency failed: ${dep}`);
          }
        }

        if (typeof module.loader === 'function') {
          await module.loader();
        } else if (typeof module.loader === 'string') {
          await import(module.loader);
        }

        this.loadedModules.add(name);
        const loadTime = performance.now() - startTime;
        this.loadTimes.set(name, loadTime);

        moduleLogger.info(`Loaded module: ${name} (${loadTime.toFixed(2)}ms)`);
        
        // Emit event
        moduleLogger.events.emit('loader:module-loaded', {
          module: name,
          loadTime,
          priority: module.priority,
          lazy: module.lazy,
          timestamp: Date.now()
        });
        
        return true;
      } catch (error) {
        this.moduleErrors.set(name, error);
        const errorMessage = `Failed to load module: ${name}`;

        // Emit event
        moduleLogger.events.emit('loader:module-failed', {
          module: name,
          error: error.message,
          critical: module.critical,
          timestamp: Date.now()
        });

        if (module.critical) {
          moduleLogger.error(errorMessage, error);
          // Safe UI notification - check if UI is available
          if (typeof ui !== 'undefined' && ui.notifications) {
            ui.notifications.error(`Critical module failed: ${name}`);
          } else {
            moduleLogger.error(`Critical module failed: ${name}`, error);
          }
          throw error;
        } else {
          moduleLogger.warn(errorMessage, error);
          return false;
        }
      }
    })();

    this.loadingModules.set(name, loadPromise);

    try {
      return await loadPromise;
    } finally {
      this.loadingModules.delete(name);
    }
  }

  async loadAll() {
    moduleLogger.info('Starting module loading sequence');
    moduleLogger.startPerformance('module-loading');

    const sortedModules = Array.from(this.modules.entries())
      .sort((a, b) => (a[1].priority ?? 100) - (b[1].priority ?? 100));

    const priorityGroups = new Map();
    for (const [name, module] of sortedModules) {
      const priority = module.priority ?? 100;
      if (!priorityGroups.has(priority)) {
        priorityGroups.set(priority, []);
      }
      priorityGroups.get(priority).push(name);
    }

    // Progress tracking
    const totalModulesNonLazy = Array.from(this.modules.values()).filter(m => !m.lazy).length;
    let loadedCount = 0;

    for (const [priority, moduleNames] of priorityGroups) {
      const nonLazyModules = moduleNames.filter(name => !(this.modules.get(name)?.lazy));
      
      moduleLogger.debug(`Loading priority group ${priority}`, moduleNames);
      moduleLogger.info(`Progress: ${loadedCount}/${totalModulesNonLazy} modules loaded`);

      const promises = nonLazyModules.map(name => this.loadModule(name));

      const results = await Promise.allSettled(promises);

      const newlyLoaded = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
      loadedCount += newlyLoaded;

      results.forEach((result, idx) => {
        if (result.status === 'rejected') {
          const moduleName = nonLazyModules[idx];
          if (!this.moduleErrors.has(moduleName)) {
            this.moduleErrors.set(moduleName, result.reason ?? new Error('Unknown load failure'));
          }
        }
      });
    }

    const totalTime = moduleLogger.endPerformance('module-loading');
    this.logLoadingSummary(totalTime);
    
    // Emit final event
    moduleLogger.events.emit('loader:loading-complete', {
      totalModules: this.modules.size,
      loaded: this.loadedModules.size,
      failed: this.moduleErrors.size,
      totalTime,
      timestamp: Date.now()
    });
  }

  async loadLazy(moduleName) {
    const module = this.modules.get(moduleName);
    if (!module || !module.lazy) {
      moduleLogger.warn(`Module ${moduleName} is not lazy or doesn't exist`);
      return false;
    }

    moduleLogger.info(`Lazy loading module: ${moduleName}`);
    return await this.loadModule(moduleName);
  }

  logLoadingSummary(totalTime) {
    const loaded = this.loadedModules.size;
    const failed = this.moduleErrors.size;
    const total = this.modules.size;

    // Calcola statistiche avanzate
    const loadTimesArray = Array.from(this.loadTimes.values());
    const avgTime = loadTimesArray.length > 0 
      ? loadTimesArray.reduce((a, b) => a + b, 0) / loadTimesArray.length 
      : 0;
    
    const sortedTimes = Array.from(this.loadTimes.entries()).sort((a, b) => b[1] - a[1]);
    const slowestModule = sortedTimes.length > 0 ? sortedTimes[0] : null;
    const fastestModule = sortedTimes.length > 0 ? sortedTimes[sortedTimes.length - 1] : null;

    moduleLogger.info(
      `Module loading complete: ${loaded}/${total} loaded, ${failed} failed (${totalTime?.toFixed(2)}ms total)`,
      {
        avgLoadTime: avgTime?.toFixed(2) + 'ms',
        slowest: slowestModule ? `${slowestModule[0]} (${slowestModule[1].toFixed(2)}ms)` : 'N/A',
        fastest: fastestModule ? `${fastestModule[0]} (${fastestModule[1].toFixed(2)}ms)` : 'N/A'
      }
    );

    if (failed > 0) {
      moduleLogger.group('Failed Modules');
      for (const [name, error] of this.moduleErrors) {
        moduleLogger.error(`${name}: ${error.message}`);
      }
      moduleLogger.groupEnd();
    }

    const slowModules = sortedTimes.slice(0, 5);

    if (slowModules.length > 0) {
      moduleLogger.debug('Slowest modules:');
      moduleLogger.table(
        slowModules.map(([name, time]) => ({ Module: name, 'Load Time': `${time.toFixed(2)}ms` }))
      );
    }
  }

  async reloadModule(name) {
    moduleLogger.info(`Reloading module: ${name}`);
    this.loadedModules.delete(name);
    this.moduleErrors.delete(name);
    return await this.loadModule(name);
  }

  getModuleStatus(name) {
    return {
      loaded: this.loadedModules.has(name),
      error: this.moduleErrors.get(name),
      loadTime: this.loadTimes.get(name)
    };
  }

  getConfiguredModules() {
    return new Map(this.modules);
  }

  exportLoadingReport() {
    return {
      timestamp: new Date().toISOString(),
      loaded: Array.from(this.loadedModules),
      errors: Array.from(this.moduleErrors.entries()).map(([moduleName, error]) => ({
        module: moduleName,
        error: error.message,
        stack: error.stack
      })),
      loadTimes: Object.fromEntries(this.loadTimes),
      totalModules: this.modules.size,
      successRate: this.modules.size > 0
        ? `${((this.loadedModules.size / this.modules.size) * 100).toFixed(2)}%`
        : '0%'
    };
  }

  /**
   * Ottiene statistiche avanzate sul caricamento moduli
   * @returns {Object} Statistiche dettagliate
   */
  getAdvancedStatistics() {
    const loadTimesArray = Array.from(this.loadTimes.values());
    const avgTime = loadTimesArray.length > 0 
      ? loadTimesArray.reduce((a, b) => a + b, 0) / loadTimesArray.length 
      : 0;
    
    const sortedTimes = Array.from(this.loadTimes.entries()).sort((a, b) => b[1] - a[1]);
    const slowestModule = sortedTimes.length > 0 ? sortedTimes[0] : null;
    const fastestModule = sortedTimes.length > 0 ? sortedTimes[sortedTimes.length - 1] : null;
    
    const criticalModules = Array.from(this.modules.values()).filter(m => m.critical);
    const lazyModules = Array.from(this.modules.values()).filter(m => m.lazy);
    
    return {
      totalModules: this.modules.size,
      loadedModules: this.loadedModules.size,
      failedModules: this.moduleErrors.size,
      criticalModulesCount: criticalModules.length,
      lazyModulesCount: lazyModules.length,
      loadedLazyModulesCount: Array.from(this.loadedModules).filter(name => this.modules.get(name)?.lazy).length,
      successRate: this.modules.size > 0 
        ? ((this.loadedModules.size / this.modules.size) * 100).toFixed(2) + '%' 
        : '0%',
      avgLoadTime: avgTime.toFixed(2) + 'ms',
      totalLoadTime: loadTimesArray.reduce((a, b) => a + b, 0).toFixed(2) + 'ms',
      slowestModule: slowestModule ? {
        name: slowestModule[0],
        time: slowestModule[1].toFixed(2) + 'ms'
      } : null,
      fastestModule: fastestModule ? {
        name: fastestModule[0],
        time: fastestModule[1].toFixed(2) + 'ms'
      } : null,
      top5Slowest: sortedTimes.slice(0, 5).map(([name, time]) => ({
        name,
        time: time.toFixed(2) + 'ms'
      }))
    };
  }

  /**
   * Registra un listener per eventi del loader
   * @param {string} eventName - Nome dell'evento
   * @param {Function} callback - Funzione da chiamare
   */
  on(eventName, callback) {
    moduleLogger.events.on(`loader:${eventName}`, callback);
  }

  /**
   * Rimuove un listener per eventi del loader
   * @param {string} eventName - Nome dell'evento
   * @param {Function} callback - Funzione da rimuovere
   */
  off(eventName, callback) {
    moduleLogger.events.off(`loader:${eventName}`, callback);
  }
}

const moduleLoader = new BrancaloniaModuleLoader();

export { moduleLoader as default, BrancaloniaModuleLoader };
