/**
 * BRANCALONIA INIT WRAPPER
 * Standardizzazione dell'inizializzazione dei moduli con error handling centralizzato
 *
 * Questo modulo fornisce un wrapper unificato per l'inizializzazione di tutti i moduli
 * con gestione errori, logging e dipendenze
 */

class BrancaloniaInitWrapper {
  static NAMESPACE = 'brancalonia-bigat';

  /**
   * Registra un modulo per l'inizializzazione
   * @param {string} moduleName - Nome del modulo
   * @param {Function} initFunction - Funzione di inizializzazione
   * @param {Object} options - Opzioni di configurazione
   */
  static registerModule(moduleName, initFunction, options = {}) {
    const {
      dependencies = [],
      hook = 'init',
      priority = 0,
      required = false
    } = options;

    // Wrapper con error handling
    const wrappedInit = async () => {
      const startTime = performance.now();

      try {
        // Verifica dipendenze
        for (const dep of dependencies) {
          if (!game.brancalonia?.modules?.[dep]) {
            console.warn(`⚠️ [${moduleName}] Dipendenza mancante: ${dep}`);
            if (required) {
              throw new Error(`Dipendenza richiesta ${dep} non trovata`);
            }
          }
        }

        // Log inizializzazione
        if (game.brancalonia?.debug?.enabled) {
          console.log(`🔧 [${moduleName}] Inizializzazione...`);
        }

        // Esegui inizializzazione
        await initFunction();

        // Registra successo
        const loadTime = (performance.now() - startTime).toFixed(2);

        if (game.brancalonia) {
          game.brancalonia.modules = game.brancalonia.modules || {};
          game.brancalonia.modules[moduleName] = {
            status: 'initialized',
            loadTime: loadTime
          };
        }

        if (game.brancalonia?.debug?.enabled) {
          console.log(`✅ [${moduleName}] Inizializzato in ${loadTime}ms`);
        }

      } catch (error) {
        console.error(`❌ [${moduleName}] Errore durante l'inizializzazione:`, error);

        // Registra fallimento
        if (game.brancalonia) {
          game.brancalonia.modules = game.brancalonia.modules || {};
          game.brancalonia.modules[moduleName] = {
            status: 'failed',
            error: error.message
          };
        }

        // Notifica utente se il modulo è critico
        if (required) {
          ui.notifications.error(
            `Modulo critico ${moduleName} non riuscito ad inizializzarsi. Controlla la console.`,
            { permanent: true }
          );
        } else if (game.user.isGM) {
          ui.notifications.warn(
            `Modulo ${moduleName} non inizializzato correttamente.`
          );
        }

        // Rilancia l'errore se critico
        if (required) {
          throw error;
        }
      }
    };

    // Registra su hook appropriato
    if (hook === 'ready') {
      // Per moduli che DEVONO usare ready (es. necessitano canvas)
      Hooks.once('ready', wrappedInit, priority);
    } else {
      // Default: usa init
      Hooks.once('init', wrappedInit, priority);
    }
  }

  /**
   * Inizializza il sistema di logging
   */
  static initializeLogging() {
    game.brancalonia = game.brancalonia || {};
    game.brancalonia.log = game.brancalonia.log || {};

    // Sistema di logging centralizzato
    game.brancalonia.log = {
      debug: (...args) => {
        if (game.settings.get(this.NAMESPACE, 'debugMode')) {
          console.log('[Brancalonia Debug]', ...args);
        }
      },
      info: (...args) => {
        console.log('[Brancalonia]', ...args);
      },
      warn: (...args) => {
        console.warn('[Brancalonia]', ...args);
      },
      error: (...args) => {
        console.error('[Brancalonia]', ...args);

        // Notifica GM degli errori
        if (game.user.isGM && game.settings.get(this.NAMESPACE, 'notifyErrors')) {
          ui.notifications.error(`Brancalonia Error: ${args[0]}`);
        }
      }
    };
  }

  /**
   * Registra settings globali per il debug
   */
  static registerDebugSettings() {
    game.settings.register(this.NAMESPACE, 'debugMode', {
      name: 'Modalità Debug',
      hint: 'Abilita log dettagliati per troubleshooting',
      scope: 'client',
      config: true,
      type: Boolean,
      default: false,
      onChange: value => {
        game.brancalonia = game.brancalonia || {};
        game.brancalonia.debug = { enabled: value };
      }
    });

    game.settings.register(this.NAMESPACE, 'notifyErrors', {
      name: 'Notifica Errori',
      hint: 'Mostra notifiche per errori dei moduli (solo GM)',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
  }

  /**
   * Ottiene lo stato di tutti i moduli
   */
  static getModulesStatus() {
    const modules = game.brancalonia?.modules || {};
    const report = {
      initialized: [],
      failed: [],
      total: 0
    };

    for (const [name, data] of Object.entries(modules)) {
      report.total++;
      if (data.status === 'initialized') {
        report.initialized.push({ name, loadTime: data.loadTime });
      } else if (data.status === 'failed') {
        report.failed.push({ name, error: data.error });
      }
    }

    return report;
  }

  /**
   * Stampa report di inizializzazione
   */
  static printInitReport() {
    const report = this.getModulesStatus();

    console.groupCollapsed(
      `🎭 Brancalonia - Report Inizializzazione (${report.initialized.length}/${report.total} moduli caricati)`
    );

    if (report.initialized.length > 0) {
      console.group('✅ Moduli Inizializzati');
      const table = report.initialized.map(m => ({
        Modulo: m.name,
        'Tempo (ms)': m.loadTime
      }));
      console.table(table);
      console.groupEnd();
    }

    if (report.failed.length > 0) {
      console.group('❌ Moduli Falliti');
      const table = report.failed.map(m => ({
        Modulo: m.name,
        Errore: m.error
      }));
      console.table(table);
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Wrapper per convertire classe con initialize() statico
   */
  static wrapClass(ModuleClass, moduleName, options = {}) {
    this.registerModule(
      moduleName,
      async () => {
        if (typeof ModuleClass.initialize === 'function') {
          await ModuleClass.initialize();
        } else if (typeof ModuleClass.init === 'function') {
          await ModuleClass.init();
        } else {
          // Se la classe non ha metodo init, crea istanza
          game.brancalonia = game.brancalonia || {};
          game.brancalonia[moduleName] = new ModuleClass();
        }
      },
      options
    );
  }

  /**
   * Utility per migrare modulo da ready a init
   */
  static migrateToInit(moduleName, initFunction, needsCanvas = false) {
    if (needsCanvas) {
      // Se il modulo necessita del canvas, usa comunque ready ma con wrapper
      this.registerModule(moduleName, initFunction, { hook: 'ready' });
    } else {
      // Altrimenti migra a init
      this.registerModule(moduleName, initFunction, { hook: 'init' });
    }
  }
}

// Inizializzazione del wrapper stesso
Hooks.once('init', () => {
  console.log('🎯 Brancalonia Init Wrapper v1.0.0');

  // Inizializza logging
  BrancaloniaInitWrapper.initializeLogging();

  // Registra settings debug
  BrancaloniaInitWrapper.registerDebugSettings();

  // Esponi globalmente
  window.BrancaloniaInitWrapper = BrancaloniaInitWrapper;
  game.brancalonia = game.brancalonia || {};
  game.brancalonia.InitWrapper = BrancaloniaInitWrapper;
});

// Report finale su ready
Hooks.once('ready', () => {
  setTimeout(() => {
    BrancaloniaInitWrapper.printInitReport();
  }, 1000); // Aspetta che tutti i moduli siano inizializzati
});

export default BrancaloniaInitWrapper;