/**
 * @fileoverview Fix per l'errore "slugify is not defined" in D&D 5e e Foundry v13
 * @module brancalonia-slugify-fix
 * @requires brancalonia-logger
 * @version 2.0.0
 * @author Brancalonia Community
 * 
 * @description
 * Questo modulo fornisce una funzione slugify compatibile con Foundry VTT
 * per risolvere l'errore "slugify is not defined" che può verificarsi in
 * D&D 5e v5.x e Foundry VTT v13.
 * 
 * La funzione viene definita in multiple locations per massima compatibilità:
 * - globalThis.slugify
 * - window.slugify
 * - String.prototype.slugify
 * - foundry.utils.slugify (se possibile)
 * - game.slugify (se possibile)
 * 
 * IMPORTANTE: Questo modulo deve essere caricato PRIMA di tutti gli altri
 * moduli Brancalonia per garantire la disponibilità di slugify.
 * 
 * @example
 * // Uso base
 * const slug = slugify("Hello World"); // "hello-world"
 * 
 * @example
 * // Con opzioni
 * const slug = slugify("Test Brancalònia!", { strict: true }); // "test-brancalonia"
 * 
 * @example
 * // Via String.prototype
 * const slug = "Hello World".slugify(); // "hello-world"
 */

import { createModuleLogger } from './brancalonia-logger.js';

const MODULE_LABEL = 'Slugify Fix';
const moduleLogger = createModuleLogger(MODULE_LABEL);
/**
 * @typedef {Object} SlugifyOptions
 * @property {string} [replacement='-'] - Carattere di sostituzione per spazi
 * @property {boolean} [lower=true] - Converte in lowercase
 * @property {boolean} [strict=false] - Modalità strict (solo a-z, 0-9)
 * @property {string} [locale='en'] - Locale per normalizzazione
 * @property {boolean} [trim=true] - Rimuove replacement all'inizio/fine
 */

/**
 * @typedef {Object} SlugifyStatistics
 * @property {number} totalCalls - Numero totale chiamate slugify
 * @property {number} totalTests - Numero test eseguiti
 * @property {number} testsPassed - Test passati
 * @property {number} testsFailed - Test falliti
 * @property {number} initTime - Tempo inizializzazione in ms
 * @property {Object} availability - Disponibilità slugify nelle varie locations
 * @property {boolean} availability.globalThis - Disponibile in globalThis
 * @property {boolean} availability.window - Disponibile in window
 * @property {boolean} availability.stringPrototype - Disponibile in String.prototype
 * @property {boolean} availability.foundryUtils - Disponibile in foundry.utils
 * @property {boolean} availability.game - Disponibile in game object
 * @property {Array<Object>} errors - Array degli errori registrati
 */

/**
 * Sistema di fix per slugify in Foundry VTT
 * @class SlugifyFix
 */
class SlugifyFix {
  static VERSION = '2.0.0';
  static MODULE_NAME = MODULE_LABEL;

  /**
   * Statistiche del sistema slugify fix
   * @static
   * @type {SlugifyStatistics}
   */
  static statistics = {
    totalCalls: 0,
    totalTests: 0,
    testsPassed: 0,
    testsFailed: 0,
    initTime: 0,
    availability: {
      globalThis: false,
      window: false,
      stringPrototype: false,
      foundryUtils: false,
      game: false
    },
    errors: []
  };

  /**
   * Inizializza il sistema slugify fix
   * @static
   * @returns {void}
   */
  static initialize() {
    moduleLogger.startPerformance('slugify-init');
    moduleLogger.info('Inizializzazione Slugify Fix...');

    // Crea funzione slugify
    this._createSlugifyFunction();

    // Definisci in multiple locations
    this._defineGlobally();

    // Track init time
    const initTime = moduleLogger.endPerformance('slugify-init');
    this.statistics.initTime = initTime;

    moduleLogger.info(`Inizializzazione completata in ${initTime?.toFixed(2)}ms`);

    // Emit event
    moduleLogger.events.emit('slugify:initialized', {
      version: this.VERSION,
      initTime,
      availability: this.statistics.availability,
      timestamp: Date.now()
    });
  }

  /**
   * Crea la funzione slugify compatibile con Foundry VTT
   * Converte stringhe in formato URL-friendly
   * 
   * @static
   * @private
   * @returns {Function} La funzione slugify
   */
  static _createSlugifyFunction() {
    return (str, options = {}) => {
      if (!str) return '';

      // Track usage
      this.statistics.totalCalls++;

      try {
        // Opzioni di default
        const opts = {
          replacement: '-',
          lower: true,
          strict: false,
          locale: 'en',
          trim: true,
          ...options
        };

        let result = str.toString();

        // Converti in lowercase se richiesto
        if (opts.lower) {
          result = result.toLowerCase();
        }

        // Normalizza caratteri unicode (rimuovi accenti)
        result = result
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        // Sostituisci spazi e caratteri speciali
        if (opts.strict) {
          // Modalità strict: solo a-z, 0-9 e replacement
          result = result.replace(/[^a-z0-9]+/gi, opts.replacement);
        } else {
          // Modalità permissiva: mantieni più caratteri
          result = result.replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, opts.replacement);
        }

        // Rimuovi replacement multipli
        const replaceRegex = new RegExp(`${opts.replacement}+`, 'g');
        result = result.replace(replaceRegex, opts.replacement);

        // Rimuovi replacement all'inizio e alla fine se trim è true
        if (opts.trim) {
          const trimRegex = new RegExp(`^${opts.replacement}|${opts.replacement}$`, 'g');
          result = result.replace(trimRegex, '');
        }

        return result;

      } catch (error) {
        moduleLogger.error('Errore in slugify', error);
        this.statistics.errors.push({
          type: 'slugify-error',
          message: error.message,
          timestamp: Date.now()
        });
        return '';
      }
    };
  }

  /**
   * Definisce slugify in tutte le locations disponibili
   * @static
   * @private
   * @returns {void}
   */
  static _defineGlobally() {
    const slugifyFn = this._createSlugifyFunction();

    // 1. globalThis.slugify
    if (typeof globalThis.slugify === 'undefined') {
      globalThis.slugify = slugifyFn;
      this.statistics.availability.globalThis = true;
      moduleLogger.info('slugify definita in globalThis');
    } else {
      this.statistics.availability.globalThis = true;
      moduleLogger.warn('slugify già esistente in globalThis');
    }

    // 2. window.slugify (alias di globalThis)
    if (typeof window !== 'undefined') {
      this.statistics.availability.window = typeof window.slugify !== 'undefined';
    }

    // 3. String.prototype.slugify
    if (!String.prototype.slugify) {
      String.prototype.slugify = function(options) {
        return globalThis.slugify(this, options);
      };
      this.statistics.availability.stringPrototype = true;
      moduleLogger.info('slugify aggiunta a String.prototype');
    } else {
      this.statistics.availability.stringPrototype = true;
    }
  }

  /**
   * Integra slugify con foundry.utils (hook init)
   * @static
   * @private
   * @returns {void}
   */
  static _integrateFoundryUtils() {
    moduleLogger.debug('Integrazione con foundry.utils...');

    try {
      if (foundry?.utils && !foundry.utils.slugify) {
        // Tenta di aggiungere slugify a foundry.utils
        // Note: foundry.utils potrebbe essere frozen in v13
        if (!Object.isFrozen(foundry.utils) && !Object.isSealed(foundry.utils)) {
          Object.defineProperty(foundry.utils, 'slugify', {
            value: globalThis.slugify,
            writable: false,
            configurable: false,
            enumerable: true
          });
          this.statistics.availability.foundryUtils = true;
          moduleLogger.info('slugify aggiunta a foundry.utils');
        } else {
          // foundry.utils è frozen - usiamo solo globalThis.slugify
          this.statistics.availability.foundryUtils = false;
          moduleLogger.info('foundry.utils è frozen, uso globalThis.slugify');
        }
      } else if (foundry?.utils?.slugify) {
        this.statistics.availability.foundryUtils = true;
      }
    } catch (error) {
      moduleLogger.warn('Errore integrazione foundry.utils', error);
      this.statistics.availability.foundryUtils = false;
      this.statistics.errors.push({
        type: 'foundry-utils-integration',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Integra slugify con game object (hook setup)
   * @static
   * @private
   * @returns {void}
   */
  static _integrateGameObject() {
    moduleLogger.debug('Integrazione con game object...');

    try {
      if (game && !game.slugify) {
        Object.defineProperty(game, 'slugify', {
          value: globalThis.slugify,
          writable: false,
          configurable: false,
          enumerable: true
        });
        this.statistics.availability.game = true;
        moduleLogger.info('slugify aggiunta a game object');
      } else if (game?.slugify) {
        this.statistics.availability.game = true;
      }
    } catch (error) {
      moduleLogger.warn('Errore integrazione game object', error);
      this.statistics.availability.game = false;
      this.statistics.errors.push({
        type: 'game-object-integration',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Verifica disponibilità slugify in tutte le locations
   * @static
   * @private
   * @returns {void}
   */
  static _checkAvailability() {
    moduleLogger.startPerformance('slugify-availability-check');

    const availability = {
      'globalThis.slugify': typeof globalThis.slugify,
      'window.slugify': typeof window.slugify,
      'String.prototype.slugify': typeof String.prototype.slugify,
      'foundry.utils.slugify': typeof foundry?.utils?.slugify,
      'game.slugify': typeof game?.slugify
    };

    moduleLogger.debug('Availability check:', availability);
    moduleLogger.table(Object.entries(availability).map(([name, value]) => ({ Location: name, Type: value })));

    const checkTime = moduleLogger.endPerformance('slugify-availability-check');
    moduleLogger.debug(`Availability check completato in ${checkTime?.toFixed(2)}ms`);

    // Emit event
    moduleLogger.events.emit('slugify:availability-checked', {
      availability: this.statistics.availability,
      checkTime,
      timestamp: Date.now()
    });
  }

  /**
   * Test rapido della funzione slugify
   * @static
   * @private
   * @returns {void}
   */
  static _quickTest() {
    moduleLogger.startPerformance('slugify-quick-test');

    try {
      const testString = "Test Slugify Brancalònia!";
      const result = globalThis.slugify(testString);
      const expected = "test-slugify-brancalonia";

      if (result === expected) {
        moduleLogger.info(`Quick test PASSED: "${testString}" → "${result}"`);
      } else {
        moduleLogger.warn(`Quick test FAILED: "${testString}" → "${result}" (expected: "${expected}")`);
      }

      const testTime = moduleLogger.endPerformance('slugify-quick-test');
      moduleLogger.debug(`Quick test completato in ${testTime?.toFixed(2)}ms`);

    } catch (error) {
      moduleLogger.error('Quick test failed', error);
      this.statistics.errors.push({
        type: 'quick-test',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  // =================================================================
  // PUBLIC API
  // =================================================================

  /**
   * Esegue una suite di test completa sulla funzione slugify
   * 
   * @static
   * @returns {{passed: number, failed: number, tests: Array}} Risultati dei test
   * @example
   * const results = SlugifyFix.test();
   * console.log(`Test: ${results.passed} passed, ${results.failed} failed`);
   */
  static test() {
    moduleLogger.startPerformance('slugify-full-test');
    moduleLogger.info('Esecuzione test suite completa...');

    const tests = [
      { input: "Hello World", expected: "hello-world" },
      { input: "Brancalònia", expected: "brancalonia" },
      { input: "Test  Multiple   Spaces", expected: "test-multiple-spaces" },
      { input: "Test_Underscore", expected: "test-underscore" },
      { input: "Test!@#$%Special", expected: "test-special" },
      { input: "   Trim Spaces   ", expected: "trim-spaces" },
      { input: "ÀÈÌÒÙàèìòù", expected: "aeiouaeiou" },
      { input: "Città di Brancalonia", expected: "citta-di-brancalonia" }
    ];

    let passed = 0;
    let failed = 0;
    const results = [];

    tests.forEach(test => {
      try {
        const result = globalThis.slugify(test.input);
        const success = result === test.expected;

        if (success) {
          passed++;
          moduleLogger.debug(`✅ Test PASSED: "${test.input}" → "${result}"`);
        } else {
          failed++;
          moduleLogger.warn(`❌ Test FAILED: "${test.input}" → "${result}" (expected: "${test.expected}")`);
        }

        results.push({
          input: test.input,
          expected: test.expected,
          result,
          success
        });

      } catch (error) {
        failed++;
        moduleLogger.error(`❌ Test ERROR: "${test.input}"`, error);
        results.push({
          input: test.input,
          expected: test.expected,
          result: null,
          success: false,
          error: error.message
        });
      }
    });

    // Update statistics
    this.statistics.totalTests += tests.length;
    this.statistics.testsPassed += passed;
    this.statistics.testsFailed += failed;

    const testTime = moduleLogger.endPerformance('slugify-full-test');
    moduleLogger.info(`Test suite completata: ${passed} passed, ${failed} failed in ${testTime?.toFixed(2)}ms`);

    // Emit event
    moduleLogger.events.emit('slugify:test-complete', {
      totalTests: tests.length,
      passed,
      failed,
      testTime,
      timestamp: Date.now()
    });

    return { passed, failed, tests: results };
  }

  /**
   * Ottiene lo stato di disponibilità di slugify in tutte le locations
   * 
   * @static
   * @returns {Object} Oggetto con stato disponibilità per ogni location
   * @example
   * const availability = SlugifyFix.getAvailability();
   * console.log('globalThis:', availability.globalThis);
   */
  static getAvailability() {
    return {
      ...this.statistics.availability,
      runtime: {
        'globalThis.slugify': typeof globalThis.slugify,
        'window.slugify': typeof window?.slugify,
        'String.prototype.slugify': typeof String.prototype.slugify,
        'foundry.utils.slugify': typeof foundry?.utils?.slugify,
        'game.slugify': typeof game?.slugify
      }
    };
  }

  /**
   * Ottiene le statistiche correnti del sistema slugify fix
   * 
   * @static
   * @returns {SlugifyStatistics} Statistiche complete
   * @example
   * const stats = SlugifyFix.getStatistics();
   * console.log('Total calls:', stats.totalCalls);
   */
  static getStatistics() {
    return {
      ...this.statistics,
      uptime: Date.now() - (this.statistics.initTime || Date.now())
    };
  }

  /**
   * Resetta le statistiche del sistema
   * 
   * @static
   * @returns {void}
   * @example
   * SlugifyFix.resetStatistics();
   */
  static resetStatistics() {
    moduleLogger.info('Reset statistiche');

    const initTime = this.statistics.initTime;
    const availability = this.statistics.availability;

    this.statistics = {
      totalCalls: 0,
      totalTests: 0,
      testsPassed: 0,
      testsFailed: 0,
      initTime,
      availability,
      errors: []
    };

    moduleLogger.info('Statistiche resettate');
  }

  /**
   * Mostra un report completo dello stato del sistema nella console
   * 
   * @static
   * @returns {SlugifyStatistics} Le statistiche (per uso programmatico)
   * @example
   * SlugifyFix.showReport();
   */
  static showReport() {
    const stats = this.getStatistics();
    const availability = this.getAvailability();

    moduleLogger.group('📊 Brancalonia Slugify Fix - Report');

    moduleLogger.info('VERSION:', this.VERSION);
    moduleLogger.info('Init Time:', stats.initTime?.toFixed(2) + 'ms');

    moduleLogger.group('📈 Statistics');
    moduleLogger.table([
      { Metric: 'Total Calls', Value: stats.totalCalls },
      { Metric: 'Total Tests', Value: stats.totalTests },
      { Metric: 'Tests Passed', Value: stats.testsPassed },
      { Metric: 'Tests Failed', Value: stats.testsFailed },
      { Metric: 'Errors', Value: stats.errors.length },
      { Metric: 'Uptime', Value: `${(stats.uptime / 1000).toFixed(0)}s` }
    ]);
    moduleLogger.groupEnd();

    moduleLogger.group('🎯 Availability');
    Object.entries(availability.runtime).forEach(([location, type]) => {
      const available = type === 'function';
      moduleLogger.info(`${available ? '✅' : '❌'} ${location}: ${type}`);
    });
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
Hooks.once("init", () => {
  SlugifyFix.initialize();
});

// Hook init - Integra con foundry.utils
Hooks.once("init", () => {
  SlugifyFix._integrateFoundryUtils();
});

// Hook setup - Integra con game object
Hooks.once("setup", () => {
  SlugifyFix._integrateGameObject();
  SlugifyFix._checkAvailability();
});

// Hook ready - Test finale e conferma
Hooks.once("ready", () => {
  SlugifyFix._quickTest();
  moduleLogger.info('✅ Sistema pronto e funzionante');
});

// Export per uso come modulo ES6
export default SlugifyFix;