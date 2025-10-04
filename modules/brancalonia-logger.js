/**
 * Sistema di logging centralizzato enterprise-grade per Brancalonia
 *
 * Caratteristiche:
 * - 5 livelli di log configurabili (ERROR, WARN, INFO, DEBUG, TRACE)
 * - Output colorato nella console con mapping sui metodi console nativi
 * - Storia log persistente con rotation automatica (disattivabile via setting)
 * - Performance tracking con auto-cleanup
 * - Event emitter per log streams
 * - Multiple sinks (console, localStorage, custom)
 * - Statistiche runtime dettagliate
 * - API console avanzata per debugging
 * - Safe initialization - funziona anche se usato prima dell'init
 *
 * @module brancalonia-logger
 * @version 2.0.0
 * @author Brancalonia Development Team
 */

/**
 * @typedef {Object} LogLevel
 * @property {number} ERROR - 0
 * @property {number} WARN - 1
 * @property {number} INFO - 2
 * @property {number} DEBUG - 3
 * @property {number} TRACE - 4
 */

/**
 * @typedef {Object} LogEntry
 * @property {number} timestamp - Unix timestamp
 * @property {string} level - Log level name
 * @property {string} module - Nome modulo
 * @property {string} message - Messaggio log
 * @property {Array<*>} args - Argomenti addizionali
 * @property {string} [stackTrace] - Stack trace (solo per ERROR)
 */

/**
 * @typedef {Object} LogStatistics
 * @property {number} totalLogs - Totale log emessi
 * @property {Object<string, number>} byLevel - Contatori per livello
 * @property {Object<string, number>} byModule - Contatori per modulo
 * @property {number} startTime - Timestamp inizializzazione
 * @property {number} uptime - Millisecondi di uptime
 * @property {number} performanceMarks - Performance marks attivi
 * @property {number} historySize - Dimensione history
 * @property {number} memoryUsage - Byte occupati in localStorage
 */

/**
 * Interface per LogSink - destinazione log customizzabile
 * 
 * @interface LogSink
 */
class LogSink {
  /**
   * Nome identificativo del sink
   * @type {string}
   */
  name = 'base-sink';

  /**
   * Livello minimo per questo sink
   * @type {number}
   */
  minLevel = 0;

  /**
   * Se il sink è abilitato
   * @type {boolean}
   */
  enabled = true;

  /**
   * Riceve un log entry
   * @param {LogEntry} entry - Entry da loggare
   * @returns {void|Promise<void>}
   */
  write(entry) {
    throw new Error('LogSink.write() deve essere implementato');
  }

  /**
   * Flush buffer (se applicabile)
   * @returns {void|Promise<void>}
   */
  flush() {
    // Optional
  }

  /**
   * Chiude il sink
   * @returns {void|Promise<void>}
   */
  close() {
    // Optional
  }
}

/**
 * Console sink - output su console del browser
 */
class ConsoleSink extends LogSink {
  constructor() {
    super();
    this.name = 'console';
    this.colors = {
      ERROR: 'background: #ff0000; color: white; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
      WARN: 'background: #ff9800; color: white; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
      INFO: 'background: #2196f3; color: white; padding: 2px 4px; border-radius: 3px;',
      DEBUG: 'background: #4caf50; color: white; padding: 2px 4px; border-radius: 3px;',
      TRACE: 'background: #9e9e9e; color: white; padding: 2px 4px; border-radius: 3px;'
    };
    const fallback = console.log.bind(console);
    this.consoleMethods = {
      ERROR: console.error ? console.error.bind(console) : fallback,
      WARN: console.warn ? console.warn.bind(console) : fallback,
      INFO: console.info ? console.info.bind(console) : fallback,
      DEBUG: console.debug ? console.debug.bind(console) : fallback,
      TRACE: console.debug ? console.debug.bind(console) : fallback
    };
  }

  /**
   * @param {LogEntry} entry
   */
  write(entry) {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${entry.level}] [${entry.module}]`;
    const method = this.consoleMethods[entry.level] || console.log.bind(console);

    method(
      `%c${entry.level}%c ${prefix} ${entry.message}`,
      this.colors[entry.level] || '',
      '',
      ...entry.args
    );
  }
}

/**
 * LocalStorage sink - salva in localStorage con rotation
 */
class LocalStorageSink extends LogSink {
  constructor(options = {}) {
    super();
    this.name = 'localStorage';
    this.minLevel = 1; // Solo WARN e ERROR di default
    this.storageKey = options.storageKey || 'brancalonia-logs';
    this.maxEntries = options.maxEntries || 100;
    this.rotateAt = options.rotateAt || 200; // Ruota quando raggiunge 200 entry
    this.enabled = options.enabled ?? true;
  }

  /**
   * @param {LogEntry} entry
   */
  write(entry) {
    try {
      const history = this._getHistory();
      history.push({
        ...entry,
        args: entry.args.map(arg => {
          try {
            return typeof arg === 'object' ? JSON.stringify(arg) : arg;
          } catch {
            return String(arg);
          }
        })
      });

      // Auto-rotation
      if (history.length >= this.rotateAt) {
        this._rotate(history);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(history));
    } catch (error) {
      console.warn('LocalStorageSink', 'Impossibile salvare log', error);
    }
  }

  /**
   * Ottiene history da localStorage
   * @private
   * @returns {Array<LogEntry>}
   */
  _getHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Ruota i log mantenendo solo i più recenti
   * @private
   * @param {Array<LogEntry>} history
   */
  _rotate(history) {
    // Mantieni solo i più recenti
    history.splice(0, history.length - this.maxEntries);
  }

  /**
   * Ottiene dimensione in bytes occupata
   * @returns {number}
   */
  getSize() {
    try {
      const data = localStorage.getItem(this.storageKey) || '[]';
      return new Blob([data]).size;
    } catch {
      return 0;
    }
  }

  /**
   * Pulisce history
   */
  clear() {
    localStorage.removeItem(this.storageKey);
  }
}

/**
 * Event Emitter semplice per log events
 */
class LogEventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Registra listener per evento
   * @param {string} event - Nome evento
   * @param {Function} callback - Callback da chiamare
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Rimuove listener
   * @param {string} event - Nome evento
   * @param {Function} callback - Callback da rimuovere
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emette evento
   * @param {string} event - Nome evento
   * @param {*} data - Dati da passare
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    for (const callback of this.listeners.get(event)) {
      try {
        callback(data);
      } catch (error) {
        console.error('LogEventEmitter', `Errore in listener ${event}:`, error);
      }
    }
  }

  /**
   * Rimuove tutti i listener
   */
  clear() {
    this.listeners.clear();
  }
}

/**
 * Classe principale del logger enterprise-grade
 * Implementa pattern Singleton
 */
class BrancaloniaLogger {
  /**
   * Crea istanza logger
   */
  constructor() {
    /**
     * ID modulo Foundry
     * @type {string}
     * @private
     */
    this.moduleId = 'brancalonia-bigat';

    /**
     * Livelli di log disponibili
     * @type {LogLevel}
     */
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      TRACE: 4
    };

    /**
     * Livello corrente
     * @type {number}
     * @private
     */
    this.logLevel = this.getLogLevel();

    /**
     * Performance marks attivi
     * @type {Map<string, {start: number, timeout: number}>}
     * @private
     */
    this.performanceMarks = new Map();

    /**
     * Timeout auto-cleanup performance marks (default: 60s)
     * @type {number}
     * @private
     */
    this.performanceMarkTimeout = 60000;

    /**
     * Sinks registrati
     * @type {Array<LogSink>}
     * @private
     */
    this.sinks = [];

    /**
     * Event emitter per log streams
     * @type {LogEventEmitter}
     */
    this.events = new LogEventEmitter();

    /**
     * Statistiche runtime
     * @type {Object}
     * @private
     */
    this.stats = {
      totalLogs: 0,
      byLevel: {
        ERROR: 0,
        WARN: 0,
        INFO: 0,
        DEBUG: 0,
        TRACE: 0
      },
      byModule: {},
      startTime: Date.now()
    };

    /**
     * Flag di inizializzazione
     * @type {boolean}
     * @private
     */
    this.initialized = false;

    // Setup sinks di default
    this._setupDefaultSinks();
    this.localStorageEnabled = true; // Configurabile tramite setting Foundry
  }

  /**
   * Setup sinks predefiniti (console + localStorage)
   * @private
   */
  _setupDefaultSinks() {
    this.addSink(new ConsoleSink());
    this.localStorageSink = new LocalStorageSink({
      storageKey: 'brancalonia-logs',
      maxEntries: 100,
      rotateAt: 200,
      enabled: this.localStorageEnabled
    });
    this.addSink(this.localStorageSink);
  }

  /**
   * Ottiene livello log corrente
   * @returns {number} Livello log
   */
  getLogLevel() {
    // Prova a leggere da settings
    const savedLevel = game?.settings?.get?.(this.moduleId, 'logLevel');
    if (savedLevel !== undefined) return savedLevel;

    // Fallback: DEBUG in localhost, INFO altrove
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';
    return isDev ? this.levels.DEBUG : this.levels.INFO;
  }

  /**
   * Imposta livello log
   * @param {string|number} level - Livello log
   */
  setLogLevel(level) {
    if (typeof level === 'string' && this.levels[level.toUpperCase()] !== undefined) {
      this.logLevel = this.levels[level.toUpperCase()];
    } else if (typeof level === 'number') {
      this.logLevel = level;
    }
    
    this.debug('Logger', `Log level impostato a: ${this.logLevel}`);
  }

  /**
   * Aggiunge un sink custom
   * @param {LogSink} sink - Sink da aggiungere
   */
  addSink(sink) {
    if (!(sink instanceof LogSink)) {
      throw new Error('Sink deve estendere LogSink class');
    }
    this.sinks.push(sink);
    this.debug('Logger', `Sink aggiunto: ${sink.name}`);
  }

  /**
   * Rimuove un sink
   * @param {string} name - Nome sink da rimuovere
   */
  removeSink(name) {
    const index = this.sinks.findIndex(s => s.name === name);
    if (index > -1) {
      const sink = this.sinks[index];
      if (sink.close) {
        sink.close();
      }
      this.sinks.splice(index, 1);
      this.debug('Logger', `Sink rimosso: ${name}`);
    }
  }

  /**
   * Ottiene sink per nome
   * @param {string} name - Nome sink
   * @returns {LogSink|null}
   */
  getSink(name) {
    return this.sinks.find(s => s.name === name) || null;
  }

  /**
   * Abilita/disabilita LocalStorageSink
   * @param {boolean} enabled
   */
  setLocalStorageEnabled(enabled) {
    this.localStorageEnabled = enabled;
    if (this.localStorageSink) {
      this.localStorageSink.enabled = enabled;
    }
  }

  /**
   * Formatta messaggio log
   * @param {string} level - Livello log
   * @param {string} module - Nome modulo
   * @param {string} message - Messaggio
   * @param {...*} args - Argomenti addizionali
   * @returns {{prefix: string, message: string, args: Array<*>}}
   */
  formatMessage(level, module, message, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${module}]`;
    return { prefix, message, args };
  }

  /**
   * Metodo principale di logging
   * @param {string} level - Livello log
   * @param {string} module - Nome modulo
   * @param {string} message - Messaggio
   * @param {...*} args - Argomenti addizionali
   */
  log(level, module, message, ...args) {
    const levelValue = this.levels[level];
    if (levelValue === undefined || levelValue > this.logLevel) return;

    // Crea log entry
    const entry = {
      timestamp: Date.now(),
      level,
      module,
      message,
      args
    };

    // Aggiungi stack trace per errori
    if (level === 'ERROR' && args[0] instanceof Error) {
      entry.stackTrace = args[0].stack;
    }

    // Aggiorna statistiche
    this.stats.totalLogs++;
    this.stats.byLevel[level]++;
    this.stats.byModule[module] = (this.stats.byModule[module] || 0) + 1;

    // Emetti evento
    this.events.emit('log', entry);
    this.events.emit(`log:${level.toLowerCase()}`, entry);

    // Scrivi su tutti i sinks abilitati
    for (const sink of this.sinks) {
      if (sink.enabled && levelValue >= sink.minLevel) {
        try {
          sink.write(entry);
        } catch (error) {
          console.error('BrancaloniaLogger', `Errore in sink ${sink.name}:`, error);
        }
      }
    }
  }

  /**
   * Log livello ERROR
   * @param {string} module - Nome modulo
   * @param {string} message - Messaggio
   * @param {...*} args - Argomenti addizionali
   */
  error(module, message, ...args) {
    this.log('ERROR', module, message, ...args);
  }

  /**
   * Log livello WARN
   * @param {string} module - Nome modulo
   * @param {string} message - Messaggio
   * @param {...*} args - Argomenti addizionali
   */
  warn(module, message, ...args) {
    this.log('WARN', module, message, ...args);
  }

  /**
   * Log livello INFO
   * @param {string} module - Nome modulo
   * @param {string} message - Messaggio
   * @param {...*} args - Argomenti addizionali
   */
  info(module, message, ...args) {
    this.log('INFO', module, message, ...args);
  }

  /**
   * Log livello DEBUG
   * @param {string} module - Nome modulo
   * @param {string} message - Messaggio
   * @param {...*} args - Argomenti addizionali
   */
  debug(module, message, ...args) {
    this.log('DEBUG', module, message, ...args);
  }

  /**
   * Log livello TRACE
   * @param {string} module - Nome modulo
   * @param {string} message - Messaggio
   * @param {...*} args - Argomenti addizionali
   */
  trace(module, message, ...args) {
    this.log('TRACE', module, message, ...args);
  }

  /**
   * Inizia misurazione performance con auto-cleanup
   * @param {string} label - Label identificativa
   * @param {number} [timeout=60000] - Timeout auto-cleanup (ms)
   */
  startPerformance(label, timeout = this.performanceMarkTimeout) {
    // Pulisci mark precedente se esiste
    if (this.performanceMarks.has(label)) {
      this.warn('Performance', `Mark ${label} già esistente, sovrascrivendolo`);
      this._cleanupPerformanceMark(label);
    }

    const start = performance.now();
    
    // Setup auto-cleanup timeout
    const timeoutId = setTimeout(() => {
      if (this.performanceMarks.has(label)) {
        this.warn('Performance', `Mark ${label} non completato entro ${timeout}ms, auto-cleanup`);
        this.performanceMarks.delete(label);
      }
    }, timeout);

    this.performanceMarks.set(label, { start, timeout: timeoutId });
    this.debug('Performance', `Started measuring: ${label}`);
  }

  /**
   * Termina misurazione performance
   * @param {string} label - Label identificativa
   * @returns {number|null} Durata in ms, null se non trovato
   */
  endPerformance(label) {
    const mark = this.performanceMarks.get(label);
    if (!mark) {
      this.warn('Performance', `No start mark found for: ${label}`);
      return null;
    }

    const duration = performance.now() - mark.start;
    this._cleanupPerformanceMark(label);

    // Log con livello basato su durata
    const level = duration > 1000 ? 'WARN' : duration > 100 ? 'INFO' : 'DEBUG';
    this.log(level, 'Performance', `${label} took ${duration.toFixed(2)}ms`);

    return duration;
  }

  /**
   * Pulisce un performance mark
   * @private
   * @param {string} label
   */
  _cleanupPerformanceMark(label) {
    const mark = this.performanceMarks.get(label);
    if (mark && mark.timeout) {
      clearTimeout(mark.timeout);
    }
    this.performanceMarks.delete(label);
  }

  /**
   * Pulisce tutti i performance marks
   */
  clearPerformanceMarks() {
    for (const [label, mark] of this.performanceMarks.entries()) {
      if (mark.timeout) {
        clearTimeout(mark.timeout);
      }
    }
    this.performanceMarks.clear();
    this.debug('Performance', 'Tutti i performance marks puliti');
  }

  /**
   * Apri gruppo console
   * @param {string} title - Titolo gruppo
   */
  group(title) {
    console.group(title);
    this.debug('Logger', `Started group: ${title}`);
  }

  /**
   * Chiudi gruppo console
   */
  groupEnd() {
    console.groupEnd();
  }

  /**
   * Mostra tabella (solo se DEBUG+)
   * @param {*} data - Dati da mostrare
   * @param {Array<string>} [columns] - Colonne specifiche
   */
  table(data, columns) {
    if (this.logLevel >= this.levels.DEBUG) {
      console.table(data, columns);
    }
  }

  /**
   * Ottiene history log da localStorage
   * @param {Object} [options] - Opzioni filtro
   * @param {string} [options.level] - Filtra per livello
   * @param {string} [options.module] - Filtra per modulo
   * @param {number} [options.since] - Timestamp da cui filtrare
   * @param {number} [options.limit] - Limite entry
   * @returns {Array<LogEntry>}
   */
  getHistory(options = {}) {
    const sink = this.getSink('localStorage');
    if (!sink) return [];

    let history = sink._getHistory();

    // Applica filtri
    if (options.level) {
      history = history.filter(e => e.level === options.level);
    }
    if (options.module) {
      history = history.filter(e => e.module === options.module);
    }
    if (options.since) {
      history = history.filter(e => e.timestamp >= options.since);
    }
    if (options.limit) {
      history = history.slice(-options.limit);
    }

    return history;
  }

  /**
   * Esporta log come JSON file
   * @param {Object} [options] - Opzioni export (vedi getHistory)
   */
  exportLogs(options = {}) {
    const history = this.getHistory(options);
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brancalonia-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.info('Logger', `Esportati ${history.length} log`);
  }

  /**
   * Pulisce history log
   */
  clearHistory() {
    const sink = this.getSink('localStorage');
    if (sink) {
      sink.clear();
    }
    this.info('Logger', 'Log history cleared');
  }

  /**
   * Ottiene statistiche runtime complete
   * @returns {LogStatistics}
   */
  getStatistics() {
    const sink = this.getSink('localStorage');
    
    return {
      totalLogs: this.stats.totalLogs,
      byLevel: { ...this.stats.byLevel },
      byModule: { ...this.stats.byModule },
      startTime: this.stats.startTime,
      uptime: Date.now() - this.stats.startTime,
      performanceMarks: this.performanceMarks.size,
      historySize: sink ? sink._getHistory().length : 0,
      memoryUsage: sink ? sink.getSize() : 0,
      sinks: this.sinks.map(s => ({
        name: s.name,
        enabled: s.enabled,
        minLevel: s.minLevel
      }))
    };
  }

  /**
   * Stampa statistiche formattate nella console
   */
  printStatistics() {
    const stats = this.getStatistics();
    
    console.group('📊 Brancalonia Logger - Statistiche');
    console.log(`⏱️ Uptime: ${(stats.uptime / 1000 / 60).toFixed(1)} minuti`);
    console.log(`📝 Log totali: ${stats.totalLogs}`);
    console.table(stats.byLevel);
    console.log(`📦 Moduli tracciati: ${Object.keys(stats.byModule).length}`);
    console.table(stats.byModule);
    console.log(`⚡ Performance marks attivi: ${stats.performanceMarks}`);
    console.log(`💾 Log in history: ${stats.historySize}`);
    console.log(`📊 Memoria occupata: ${(stats.memoryUsage / 1024).toFixed(2)} KB`);
    console.log(`🔌 Sinks attivi:`);
    console.table(stats.sinks);
    console.log(`💽 Persistenza LocalStorage: ${this.localStorageEnabled ? 'ABILITATA' : 'DISABILITATA'}`);
    console.groupEnd();
  }

  /**
   * Reset completo statistiche
   */
  resetStatistics() {
    this.stats = {
      totalLogs: 0,
      byLevel: {
        ERROR: 0,
        WARN: 0,
        INFO: 0,
        DEBUG: 0,
        TRACE: 0
      },
      byModule: {},
      startTime: Date.now()
    };
    this.info('Logger', 'Statistiche resettate');
  }

  /**
   * Esegue test diagnostico completo
   * @returns {Object} Risultati test
   */
  runDiagnostics() {
    const results = {
      passed: [],
      failed: [],
      warnings: []
    };

    // Test 1: Verifica sinks
    if (this.sinks.length === 0) {
      results.failed.push('Nessun sink registrato');
    } else {
      results.passed.push(`${this.sinks.length} sink(s) registrati`);
    }

    // Test 2: Verifica localStorage
    const lsSink = this.getSink('localStorage');
    if (!lsSink) {
      results.warnings.push('LocalStorage sink non trovato');
    } else {
      try {
        localStorage.setItem('brancalonia-test', 'test');
        localStorage.removeItem('brancalonia-test');
        results.passed.push('LocalStorage accessibile');
      } catch {
        results.failed.push('LocalStorage non accessibile');
      }
    }

    // Test 3: Verifica memory usage
    const stats = this.getStatistics();
    if (stats.memoryUsage > 1024 * 1024) {
      results.warnings.push(`Memory usage alto: ${(stats.memoryUsage / 1024 / 1024).toFixed(2)} MB`);
    } else {
      results.passed.push('Memory usage normale');
    }

    // Test 4: Verifica performance marks leak
    if (stats.performanceMarks > 10) {
      results.warnings.push(`${stats.performanceMarks} performance marks attivi (possibile leak)`);
    } else {
      results.passed.push('Performance marks OK');
    }

    // Test 5: Test log
    try {
      this.debug('Diagnostics', 'Test log message');
      results.passed.push('Logging funzionante');
    } catch (error) {
      results.failed.push(`Logging fallito: ${error.message}`);
    }

    // Test 6: Verifica stato persistenza
    if (this.localStorageEnabled) {
      results.passed.push('Persistenza LocalStorage abilitata');
    } else {
      results.warnings.push('Persistenza LocalStorage disabilitata');
    }

    // Stampa risultati
    console.group('🔍 Brancalonia Logger - Diagnostica');
    if (results.passed.length > 0) {
      console.group('✅ Test Passati');
      results.passed.forEach(msg => console.log(`  ✓ ${msg}`));
      console.groupEnd();
    }
    if (results.warnings.length > 0) {
      console.group('⚠️ Warning');
      results.warnings.forEach(msg => console.warn(`  ⚠ ${msg}`));
      console.groupEnd();
    }
    if (results.failed.length > 0) {
      console.group('❌ Test Falliti');
      results.failed.forEach(msg => console.error(`  ✗ ${msg}`));
      console.groupEnd();
    }
    console.groupEnd();

    return results;
  }

  /**
   * Chiude tutti i sinks e pulisce risorse
   */
  shutdown() {
    this.info('Logger', 'Shutdown in corso...');
    
    // Pulisci performance marks
    this.clearPerformanceMarks();
    
    // Chiudi tutti i sinks
    for (const sink of this.sinks) {
      if (sink.close) {
        try {
          sink.close();
        } catch (error) {
          console.error('Logger', `Errore chiusura sink ${sink.name}:`, error);
        }
      }
    }
    
    // Pulisci event listeners
    this.events.clear();
    
    this.info('Logger', 'Shutdown completato');
  }
}

// Istanza singleton con binding garantito
const loggerInstance = new BrancaloniaLogger();

// Crea un wrapper che preserva SEMPRE il contesto
const logger = {
  // Proprietà dirette
  levels: loggerInstance.levels,
  events: loggerInstance.events,
  
  // Metodi bound
  log: loggerInstance.log.bind(loggerInstance),
  error: loggerInstance.error.bind(loggerInstance),
  warn: loggerInstance.warn.bind(loggerInstance),
  info: loggerInstance.info.bind(loggerInstance),
  debug: loggerInstance.debug.bind(loggerInstance),
  trace: loggerInstance.trace.bind(loggerInstance),
  startPerformance: loggerInstance.startPerformance.bind(loggerInstance),
  endPerformance: loggerInstance.endPerformance.bind(loggerInstance),
  getStatistics: loggerInstance.getStatistics.bind(loggerInstance),
  resetStatistics: loggerInstance.resetStatistics.bind(loggerInstance),
  setLogLevel: loggerInstance.setLogLevel.bind(loggerInstance),
  setLocalStorageEnabled: loggerInstance.setLocalStorageEnabled.bind(loggerInstance),
  addSink: loggerInstance.addSink.bind(loggerInstance),
  removeSink: loggerInstance.removeSink.bind(loggerInstance),
  getSink: loggerInstance.getSink.bind(loggerInstance),
  shutdown: loggerInstance.shutdown.bind(loggerInstance),
  
  // Metodi di utility console
  table: (data, columns) => {
    if (loggerInstance.logLevel >= loggerInstance.levels.DEBUG) {
      console.table(data, columns);
    }
  },
  group: loggerInstance.group.bind(loggerInstance),
  groupEnd: loggerInstance.groupEnd.bind(loggerInstance),
  
  // Accesso all'istanza originale se necessario
  _instance: loggerInstance
};

// Marca come inizializzato
logger._instance.initialized = true;

// Esposizione globale
if (!globalThis.BrancaloniaLogger) {
  globalThis.BrancaloniaLogger = logger;
}

/**
 * API Console Avanzata
 * Accessibile come `BrancaloniaLogger.*` nella console
 */
Object.assign(globalThis.BrancaloniaLogger, {
  /**
   * Esporta log filtrati
   * @param {Object} options - Filtri
   */
  export: (options) => logger.exportLogs(options),
  
  /**
   * Mostra statistiche
   */
  stats: () => logger.printStatistics(),
  
  /**
   * Ottiene history
   * @param {Object} options - Filtri
   */
  history: (options) => logger.getHistory(options),
  
  /**
   * Pulisce history
   */
  clear: () => logger.clearHistory(),
  
  /**
   * Esegue diagnostica
   */
  test: () => logger.runDiagnostics(),
  
  /**
   * Imposta livello log
   * @param {string|number} level
   */
  setLevel: (level) => logger.setLogLevel(level),
  
  /**
   * Aggiunge listener custom per log events
   * @param {string} event - 'log', 'log:error', 'log:warn', etc
   * @param {Function} callback
   */
  on: (event, callback) => logger.events.on(event, callback),
  
  /**
   * Rimuove listener
   * @param {string} event
   * @param {Function} callback
   */
  off: (event, callback) => logger.events.off(event, callback),
  
  /**
   * Ottiene statistiche raw
   */
  getStats: () => logger.getStatistics(),
  
  /**
   * Help console
   */
  help: () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║     BRANCALONIA LOGGER v2.0.0 - Console API          ║
╚═══════════════════════════════════════════════════════╝

📊 COMANDI DISPONIBILI:

  BrancaloniaLogger.stats()
    → Mostra statistiche complete

  BrancaloniaLogger.history({ level: 'ERROR', limit: 10 })
    → Ottiene history filtrata

  BrancaloniaLogger.export({ module: 'MyModule' })
    → Esporta log filtrati come JSON

  BrancaloniaLogger.clear()
    → Pulisce history

  BrancaloniaLogger.test()
    → Esegue diagnostica completa

  BrancaloniaLogger.setLevel('DEBUG')
    → Imposta livello log (ERROR|WARN|INFO|DEBUG|TRACE)

  BrancaloniaLogger.on('log:error', entry => console.log(entry))
    → Ascolta eventi log

  BrancaloniaLogger.getStats()
    → Ottiene statistiche raw (object)

  BrancaloniaLogger.help()
    → Mostra questo help

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 ESEMPI:

  // Filtra solo errori delle ultime 24h
  BrancaloniaLogger.history({
    level: 'ERROR',
    since: Date.now() - 86400000
  })

  // Esporta log di un modulo specifico
  BrancaloniaLogger.export({ module: 'CursedRelics' })

  // Monitora log in realtime
  BrancaloniaLogger.on('log', entry => {
    if (entry.level === 'ERROR') {
      alert('Errore rilevato!');
    }
  })

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }
});

// Hook Foundry per settings - DEVE essere 'init' per le settings
Hooks.once('init', () => {
  try {
    game.settings.register('brancalonia-bigat', 'logLevel', {
      name: 'Log Level',
      hint: 'Imposta il livello di dettaglio dei log (0=ERROR, 1=WARN, 2=INFO, 3=DEBUG, 4=TRACE)',
      scope: 'client',
      config: true,
      type: Number,
      default: 2,
      choices: {
        0: 'ERROR',
        1: 'WARN',
        2: 'INFO',
        3: 'DEBUG',
        4: 'TRACE'
      },
      onChange: value => logger.setLogLevel(value)
    });

    game.settings.register('brancalonia-bigat', 'enableLogPersistence', {
      name: 'Salva log in LocalStorage',
      hint: 'Se disabilitato, il logger non persisterà i messaggi in LocalStorage',
      scope: 'client',
      config: true,
      type: Boolean,
      default: true,
      onChange: value => logger.setLocalStorageEnabled(value)
    });

    const persistenceEnabled = game.settings.get('brancalonia-bigat', 'enableLogPersistence');
    logger.setLocalStorageEnabled(persistenceEnabled);
    
    // NON usare logger.info qui per evitare race conditions
    console.log('%c[Brancalonia Logger]%c Settings registrate', 
      'background: #2196f3; color: white; padding: 2px 4px; border-radius: 3px;', '');
  } catch (error) {
    console.error('Errore durante registrazione logger settings:', error);
  }
});

// Hook ready per log finale conferma
Hooks.once('ready', () => {
  logger.info('Logger', '✅ Logger v2.0.0 completamente inizializzato');
});

// Cleanup su unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    logger.shutdown();
  });
}

// Safe logger getter - funziona anche se chiamato prima dell'inizializzazione
const getLogger = () => {
  // Se il logger non è ancora inizializzato, restituisci un proxy sicuro
  if (!logger || !logger.log) {
    return {
      log: () => {}, // No-op function
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
      trace: () => {},
      startPerformance: () => Date.now(),
      endPerformance: () => 0,
      events: { on: () => {}, off: () => {}, emit: () => {} }
    };
  }
  return logger;
};

// Export per compatibilità
export {
  getLogger,
  logger,
  logger as default,
  BrancaloniaLogger,
  LogSink,
  ConsoleSink,
  LocalStorageSink,
  LogEventEmitter
};
