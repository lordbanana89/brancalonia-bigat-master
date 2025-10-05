/**
 * Sistema centralizzato per coordinare rendering sheet
 * Risolve problema di 20+ hooks duplicati su renderActorSheet
 * 
 * @module brancalonia-sheet-coordinator
 * @version 1.0.0
 */

import logger from './brancalonia-logger.js';
import { HookManager } from './brancalonia-hook-manager.js';

class SheetCoordinator {
  static VERSION = '1.0.0';
  static MODULE_NAME = 'SheetCoordinator';
  
  /**
   * Registry dei moduli che vogliono modificare le sheet
   * @type {Map<string, {priority: number, handler: Function, types: string[]}>}
   */
  static registry = new Map();
  
  /**
   * Statistiche
   */
  static statistics = {
    renderCalls: 0,
    modulesExecuted: 0,
    avgRenderTime: 0,
    errors: []
  };
  
  /**
   * Stato
   */
  static _initialized = false;

  /**
   * Inizializza il coordinator
   */
  static initialize() {
    if (this._initialized) {
      logger.warn(this.MODULE_NAME, 'Già inizializzato');
      return;
    }

    // Fixed: Usa HookManager invece di Hooks diretto
    HookManager.register(
      'SheetCoordinator',
      'renderActorSheet',
      async (app, html, data) => {
        await this._coordinateRender(app, html, data);
      }
    );

    this._initialized = true;
    logger.info(this.MODULE_NAME, 'Coordinator inizializzato - UNICO hook registrato');
  }

  /**
   * Registra un modulo per rendering sheet
   * 
   * @param {string} moduleName - Nome modulo
   * @param {Function} handler - Funzione (app, html, data) => void|Promise<void>
   * @param {Object} options - Opzioni
   * @param {number} options.priority - Priorità (0-100, default 50)
   * @param {string[]} options.types - Tipi actor ['character', 'npc']
   * @param {boolean} options.gmOnly - Solo per GM
   */
  static registerModule(moduleName, handler, options = {}) {
    const config = {
      priority: options.priority ?? 50,
      handler,
      types: options.types || ['character'],
      gmOnly: options.gmOnly || false
    };

    this.registry.set(moduleName, config);
    
    logger.debug(this.MODULE_NAME, `Modulo registrato: ${moduleName}`, {
      priority: config.priority,
      types: config.types
    });
  }

  /**
   * Rimuove un modulo dal registry
   */
  static unregisterModule(moduleName) {
    const removed = this.registry.delete(moduleName);
    if (removed) {
      logger.debug(this.MODULE_NAME, `Modulo rimosso: ${moduleName}`);
    }
    return removed;
  }

  /**
   * Coordina il rendering chiamando tutti i moduli registrati
   * @private
   */
  static async _coordinateRender(app, html, data) {
    const startTime = performance.now();
    
    try {
      this.statistics.renderCalls++;
      
      const actor = app.actor;
      const actorType = actor.type;
      
      // Filtra moduli applicabili
      const applicableModules = Array.from(this.registry.entries())
        .filter(([name, config]) => {
          // Check tipo actor
          if (!config.types.includes(actorType)) return false;
          
          // Check GM only
          if (config.gmOnly && !game.user.isGM) return false;
          
          return true;
        })
        .sort((a, b) => a[1].priority - b[1].priority); // Ordina per priorità

      logger.debug(this.MODULE_NAME, `Rendering ${actorType} sheet: ${applicableModules.length} moduli applicabili`);

      // Esegui ogni modulo in ordine di priorità
      for (const [moduleName, config] of applicableModules) {
        try {
          await config.handler(app, html, data);
          this.statistics.modulesExecuted++;
          
          logger.trace(this.MODULE_NAME, `Modulo eseguito: ${moduleName}`);
        } catch (error) {
          this.statistics.errors.push({
            module: moduleName,
            error: error.message,
            timestamp: Date.now()
          });
          
          logger.error(this.MODULE_NAME, `Errore modulo ${moduleName}`, error);
        }
      }

      const renderTime = performance.now() - startTime;
      this.statistics.avgRenderTime = (
        (this.statistics.avgRenderTime * (this.statistics.renderCalls - 1)) + renderTime
      ) / this.statistics.renderCalls;

      logger.debug(this.MODULE_NAME, `Render completato in ${renderTime.toFixed(2)}ms (${applicableModules.length} moduli)`);

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore critico in coordinator', error);
    }
  }

  /**
   * Ottiene statistiche
   */
  static getStatistics() {
    return {
      ...this.statistics,
      registeredModules: this.registry.size,
      modulesList: Array.from(this.registry.keys())
    };
  }

  /**
   * Cleanup
   */
  static shutdown() {
    HookManager.cleanup('SheetCoordinator');
    this.registry.clear();
    this._initialized = false;
    
    logger.info(this.MODULE_NAME, 'Coordinator shutdown completato');
  }
}

// Auto-inizializza su init
Hooks.once('init', () => {
  SheetCoordinator.initialize();
});

// Cleanup su beforeunload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    SheetCoordinator.shutdown();
  });
}

// Export
export { SheetCoordinator, SheetCoordinator as default };

// Console API
if (typeof window !== 'undefined') {
  window.BrancaloniaSheetCoordinator = {
    stats: () => SheetCoordinator.getStatistics(),
    modules: () => Array.from(SheetCoordinator.registry.keys()),
    register: (name, handler, opts) => SheetCoordinator.registerModule(name, handler, opts)
  };
}
