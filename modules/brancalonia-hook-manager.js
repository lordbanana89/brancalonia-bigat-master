/**
 * Sistema centralizzato per gestione Hooks con auto-cleanup
 * Risolve memory leak da hooks non rimossi
 * 
 * @module brancalonia-hook-manager
 * @version 1.0.0
 */

import logger from './brancalonia-logger.js';

class HookManager {
  /**
   * Mappa dei hooks registrati per modulo
   * @type {Map<string, Array<{id: number, hookName: string, callback: Function, registeredAt: number}>>}
   * @private
   */
  static _hooks = new Map();

  /**
   * Statistiche
   * @private
   */
  static _statistics = {
    registered: 0,
    removed: 0,
    modules: 0
  };

  /**
   * Registra un hook con tracking automatico per cleanup
   * 
   * @param {string} moduleName - Nome del modulo (es. 'IconInterceptor')
   * @param {string} hookName - Nome dell'hook Foundry (es. 'renderActorSheet')
   * @param {Function} callback - Callback da eseguire
   * @returns {number} Hook ID (per rimozione manuale se necessario)
   * 
   * @example
   * HookManager.register('MyModule', 'renderActorSheet', (app, html) => {
   *   console.log('Sheet rendered');
   * });
   */
  static register(moduleName, hookName, callback) {
    const id = Hooks.on(hookName, callback);
    
    if (!this._hooks.has(moduleName)) {
      this._hooks.set(moduleName, []);
      this._statistics.modules++;
    }
    
    this._hooks.get(moduleName).push({ 
      id, 
      hookName, 
      callback,
      registeredAt: Date.now()
    });
    
    this._statistics.registered++;
    
    logger.trace('HookManager', `Hook registrato: ${moduleName}.${hookName} (ID: ${id})`);
    return id;
  }

  /**
   * Registra un hook che viene eseguito una sola volta
   * 
   * @param {string} moduleName - Nome del modulo
   * @param {string} hookName - Nome dell'hook
   * @param {Function} callback - Callback da eseguire
   * @returns {number} Hook ID
   */
  static registerOnce(moduleName, hookName, callback) {
    const id = Hooks.once(hookName, callback);
    
    // Non tracciamo Hooks.once perché si auto-rimuovono
    logger.trace('HookManager', `Hook once registrato: ${moduleName}.${hookName} (ID: ${id})`);
    return id;
  }

  /**
   * Rimuove tutti gli hooks di un modulo specifico
   * 
   * @param {string} moduleName - Nome del modulo
   * @returns {number} Numero di hooks rimossi
   * 
   * @example
   * HookManager.cleanup('MyModule');
   */
  static cleanup(moduleName) {
    const hooks = this._hooks.get(moduleName) || [];
    let removed = 0;
    
    hooks.forEach(({ id, hookName }) => {
      try {
        Hooks.off(hookName, id);
        removed++;
        this._statistics.removed++;
      } catch (error) {
        logger.warn('HookManager', `Errore rimozione hook ${hookName}:${id}`, error);
      }
    });
    
    this._hooks.delete(moduleName);
    this._statistics.modules--;
    
    if (removed > 0) {
      logger.info('HookManager', `Cleanup completato: ${removed} hooks rimossi per ${moduleName}`);
    }
    
    return removed;
  }

  /**
   * Cleanup globale di tutti i moduli
   * 
   * @returns {number} Totale hooks rimossi
   */
  static cleanupAll() {
    const modules = Array.from(this._hooks.keys());
    let totalRemoved = 0;
    
    logger.info('HookManager', `Cleanup globale: ${modules.length} moduli da pulire`);
    
    modules.forEach(moduleName => {
      totalRemoved += this.cleanup(moduleName);
    });
    
    logger.info('HookManager', `Cleanup completo: ${totalRemoved} hooks rimossi totali`);
    return totalRemoved;
  }

  /**
   * Rimuove un hook specifico
   * 
   * @param {string} moduleName - Nome del modulo
   * @param {number} hookId - ID dell'hook da rimuovere
   * @returns {boolean} True se rimosso con successo
   */
  static remove(moduleName, hookId) {
    const hooks = this._hooks.get(moduleName);
    if (!hooks) return false;
    
    const index = hooks.findIndex(h => h.id === hookId);
    if (index === -1) return false;
    
    const hook = hooks[index];
    Hooks.off(hook.hookName, hook.id);
    hooks.splice(index, 1);
    this._statistics.removed++;
    
    logger.debug('HookManager', `Hook rimosso: ${moduleName}.${hook.hookName}:${hookId}`);
    
    if (hooks.length === 0) {
      this._hooks.delete(moduleName);
      this._statistics.modules--;
    }
    
    return true;
  }

  /**
   * Ottiene statistiche di utilizzo
   * 
   * @returns {Object} Statistiche correnti
   */
  static getStatistics() {
    const totalActive = Array.from(this._hooks.values())
      .reduce((sum, hooks) => sum + hooks.length, 0);
    
    return {
      modules: this._hooks.size,
      totalHooks: totalActive,
      registered: this._statistics.registered,
      removed: this._statistics.removed,
      byModule: Object.fromEntries(
        Array.from(this._hooks.entries()).map(([name, hooks]) => [name, hooks.length])
      ),
      oldestHooks: this._getOldestHooks(5)
    };
  }

  /**
   * Ottiene i 5 hooks più vecchi (potenziali leak)
   * @private
   */
  static _getOldestHooks(limit = 5) {
    const allHooks = [];
    
    this._hooks.forEach((hooks, moduleName) => {
      hooks.forEach(hook => {
        allHooks.push({
          module: moduleName,
          hookName: hook.hookName,
          age: Date.now() - hook.registeredAt
        });
      });
    });
    
    return allHooks
      .sort((a, b) => b.age - a.age)
      .slice(0, limit)
      .map(h => ({
        ...h,
        ageMinutes: (h.age / 60000).toFixed(2)
      }));
  }

  /**
   * Diagnostica - lista tutti gli hooks attivi
   * 
   * @returns {Array} Lista hooks attivi
   */
  static listActiveHooks() {
    const list = [];
    
    this._hooks.forEach((hooks, moduleName) => {
      hooks.forEach(hook => {
        list.push({
          module: moduleName,
          hookName: hook.hookName,
          id: hook.id,
          age: Date.now() - hook.registeredAt
        });
      });
    });
    
    return list.sort((a, b) => a.module.localeCompare(b.module));
  }

  /**
   * Verifica se un modulo ha hooks registrati
   * 
   * @param {string} moduleName - Nome del modulo
   * @returns {boolean}
   */
  static hasHooks(moduleName) {
    return this._hooks.has(moduleName) && this._hooks.get(moduleName).length > 0;
  }

  /**
   * Conta gli hooks di un modulo
   * 
   * @param {string} moduleName - Nome del modulo
   * @returns {number}
   */
  static count(moduleName) {
    return (this._hooks.get(moduleName) || []).length;
  }
}

// ================================================
// AUTO-CLEANUP GLOBALE
// ================================================

// Cleanup su beforeunload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    logger.info('HookManager', 'Cleanup automatico su beforeunload');
    HookManager.cleanupAll();
  });
}

// Cleanup su disable modulo (se supportato da Foundry)
Hooks.once('init', () => {
  // Hook futuro per quando Foundry supporterà module disable
  if (typeof Hooks.on === 'function') {
    Hooks.on('disableModule', (moduleId) => {
      if (moduleId === 'brancalonia-bigat') {
        logger.info('HookManager', 'Modulo disabilitato, cleanup completo');
        HookManager.cleanupAll();
      }
    });
  }
});

// ================================================
// CONSOLE API per debugging
// ================================================

if (typeof window !== 'undefined') {
  window.BrancaloniaHookManager = {
    stats: () => HookManager.getStatistics(),
    list: () => HookManager.listActiveHooks(),
    cleanup: (module) => HookManager.cleanup(module),
    cleanupAll: () => HookManager.cleanupAll()
  };
}

// Export
export { HookManager, HookManager as default };

