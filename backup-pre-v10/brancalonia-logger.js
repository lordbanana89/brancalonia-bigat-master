/**
 * Sistema di logging centralizzato per Brancalonia
 * Fornisce livelli di log configurabili e output formattato
 */

class BrancaloniaLogger {
  constructor() {
    this.moduleId = 'brancalonia-bigat';
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      TRACE: 4
    };
    this.logLevel = this.getLogLevel();

    // Colori per console output
    this.colors = {
      ERROR: 'background: #ff0000; color: white; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
      WARN: 'background: #ff9800; color: white; font-weight: bold; padding: 2px 4px; border-radius: 3px;',
      INFO: 'background: #2196f3; color: white; padding: 2px 4px; border-radius: 3px;',
      DEBUG: 'background: #4caf50; color: white; padding: 2px 4px; border-radius: 3px;',
      TRACE: 'background: #9e9e9e; color: white; padding: 2px 4px; border-radius: 3px;'
    };

    // Performance monitoring
    this.performanceMarks = new Map();
  }

  getLogLevel() {
    // Controlla se siamo in modalità debug
    const savedLevel = game?.settings?.get?.('brancalonia-bigat', 'logLevel');
    if (savedLevel !== undefined) return savedLevel;

    // Default: INFO in produzione, DEBUG in sviluppo
    const isDev = window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1';
    return isDev ? this.levels.DEBUG : this.levels.INFO;
  }

  setLogLevel(level) {
    if (typeof level === 'string' && this.levels[level.toUpperCase()] !== undefined) {
      this.logLevel = this.levels[level.toUpperCase()];
    } else if (typeof level === 'number') {
      this.logLevel = level;
    }
  }

  formatMessage(level, module, message, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${module}]`;
    return { prefix, message, args };
  }

  log(level, module, message, ...args) {
    const levelValue = this.levels[level];
    if (levelValue === undefined || levelValue > this.logLevel) return;

    const { prefix, message: formattedMessage, args: logArgs } = this.formatMessage(level, module, message, ...args);

    // Usa console con stili
    console.log(`%c${level}%c ${prefix} ${formattedMessage}`, this.colors[level], '', ...logArgs);

    // Salva log importante in storage per debug
    if (levelValue <= this.levels.WARN) {
      this.saveToHistory(level, module, message, logArgs);
    }
  }

  saveToHistory(level, module, message, args) {
    try {
      const history = JSON.parse(localStorage.getItem('brancalonia-logs') || '[]');
      history.push({
        timestamp: Date.now(),
        level,
        module,
        message,
        args: args.map(arg => {
          try {
            return typeof arg === 'object' ? JSON.stringify(arg) : arg;
          } catch {
            return String(arg);
          }
        })
      });

      // Mantieni solo gli ultimi 100 log
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }

      localStorage.setItem('brancalonia-logs', JSON.stringify(history));
    } catch (e) {
      // Ignora errori di storage
    }
  }

  error(module, message, ...args) {
    this.log('ERROR', module, message, ...args);
  }

  warn(module, message, ...args) {
    this.log('WARN', module, message, ...args);
  }

  info(module, message, ...args) {
    this.log('INFO', module, message, ...args);
  }

  debug(module, message, ...args) {
    this.log('DEBUG', module, message, ...args);
  }

  trace(module, message, ...args) {
    this.log('TRACE', module, message, ...args);
  }

  // Performance monitoring
  startPerformance(label) {
    this.performanceMarks.set(label, performance.now());
    this.debug('Performance', `Started measuring: ${label}`);
  }

  endPerformance(label) {
    const start = this.performanceMarks.get(label);
    if (!start) {
      this.warn('Performance', `No start mark found for: ${label}`);
      return;
    }

    const duration = performance.now() - start;
    this.performanceMarks.delete(label);

    const level = duration > 1000 ? 'WARN' : duration > 100 ? 'INFO' : 'DEBUG';
    this.log(level, 'Performance', `${label} took ${duration.toFixed(2)}ms`);

    return duration;
  }

  // Group logging
  group(title) {
    console.group(title);
    this.debug('Logger', `Started group: ${title}`);
  }

  groupEnd() {
    console.groupEnd();
  }

  // Table logging per dati strutturati
  table(data, columns) {
    if (this.logLevel >= this.levels.DEBUG) {
      console.table(data, columns);
    }
  }

  // Export logs per debug
  exportLogs() {
    const history = JSON.parse(localStorage.getItem('brancalonia-logs') || '[]');
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brancalonia-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Clear log history
  clearHistory() {
    localStorage.removeItem('brancalonia-logs');
    this.info('Logger', 'Log history cleared');
  }
}

// Singleton instance
const logger = new BrancaloniaLogger();

// Registra come globale per facile accesso
if (!globalThis.BrancaloniaLogger) {
  globalThis.BrancaloniaLogger = logger;
}

// Hook per registrare le impostazioni
Hooks.once('init', () => {
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
});

export { logger as default, BrancaloniaLogger };