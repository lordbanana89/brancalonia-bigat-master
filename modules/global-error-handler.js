/**
 * @fileoverview Global Error Handler per Brancalonia
 *
 * Gestisce errori globali non gestiti, in particolare le chiusure di Dialog.
 * Intercetta unhandled promise rejections e sopprime errori attesi.
 *
 * Features:
 * - Gestione unhandledrejection events
 * - Intercettazione errori Dialog closure
 * - Soppressione errori attesi
 * - Logging strutturato
 * - Statistics tracking
 * - Event emitters
 *
 * @version 3.0.0
 * @author Brancalonia Module Team
 * @requires brancalonia-logger.js
 */

import { logger } from './brancalonia-logger.js';

/**
 * @typedef {Object} ErrorHandlerStatistics
 * @property {number} initTime - Tempo inizializzazione (ms)
 * @property {number} errorsHandled - Errori gestiti totali
 * @property {number} dialogErrorsSuppressed - Errori Dialog soppressi
 * @property {number} dialogClosures - Chiusure Dialog registrate
 * @property {number} otherErrors - Altri errori registrati
 * @property {string[]} errors - Errori interni del modulo
 */

/**
 * Global Error Handler per Brancalonia
 * Gestisce errori globali e chiusure Dialog
 *
 * @class GlobalErrorHandler
 */
class GlobalErrorHandler {
  static VERSION = '3.0.0';
  static MODULE_NAME = 'GlobalErrorHandler';
  static ID = 'global-error-handler';

  /**
   * Statistiche del modulo
   * @type {ErrorHandlerStatistics}
   * @private
   * @static
   */
  static _statistics = {
    initTime: 0,
    errorsHandled: 0,
    dialogErrorsSuppressed: 0,
    dialogClosures: 0,
    otherErrors: 0,
    errors: []
  };

  /**
   * Stato del modulo
   * @type {Object}
   * @private
   * @static
   */
  static _state = {
    initialized: false,
    listener: null
  };

  /**
   * Inizializza il global error handler
   * @static
   * @returns {void}
   */
  static initialize() {
    const startTime = performance.now();

    try {
      logger.info(this.MODULE_NAME, `Inizializzazione Global Error Handler v${this.VERSION}`);

      // Handler per unhandled promise rejections
      const listener = (event) => {
        try {
          const reason = event.reason;
          this._statistics.errorsHandled++;

          // Check se è un errore di chiusura Dialog
          if (this._isDialogClosureError(reason)) {
            // Sopprime l'errore - comportamento atteso
            event.preventDefault();
            this._statistics.dialogErrorsSuppressed++;
            this._statistics.dialogClosures++;

            logger.debug?.(this.MODULE_NAME, 'Dialog closed by user (handled)');

            // Emit event
            Hooks.callAll('error-handler:dialog-suppressed', {
              reason,
              totalSuppressed: this._statistics.dialogErrorsSuppressed
            });

            return;
          }

          // Altri errori - registra ma lascia propagare
          this._statistics.otherErrors++;
          logger.warn(this.MODULE_NAME, 'Unhandled rejection detected (not suppressed)', reason);

        } catch (error) {
          this._statistics.errors.push(`listener: ${error.message}`);
          logger.error(this.MODULE_NAME, 'Errore nel listener unhandledrejection', error);
        }
      };

      // Registra listener
      window.addEventListener('unhandledrejection', listener);
      this._state.listener = listener;
      this._state.initialized = true;

      // Fixed: Auto-cleanup su beforeunload
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });

      this._statistics.initTime = performance.now() - startTime;

      logger.info(
        this.MODULE_NAME,
        `✅ Inizializzazione completata in ${this._statistics.initTime.toFixed(2)}ms`
      );

      // Emit event
      Hooks.callAll('error-handler:initialized', {
        version: this.VERSION
      });

    } catch (error) {
      this._statistics.errors.push(error.message);
      logger.error(this.MODULE_NAME, 'Errore durante inizializzazione', error);
      throw error;
    }
  }

  /**
   * Verifica se un errore è una chiusura Dialog
   * @private
   * @static
   * @param {*} reason - Motivo dell'errore
   * @returns {boolean} True se è un errore Dialog
   */
  static _isDialogClosureError(reason) {
    if (!reason) return false;

    // Check se il messaggio include "Dialog was closed without"
    if (reason.message && reason.message.includes('Dialog was closed without')) {
      return true;
    }

    // Check se è una stringa che include "closed without"
    if (typeof reason === 'string' && reason.includes('closed without')) {
      return true;
    }

    return false;
  }

  /**
   * Cleanup del listener
   * @static
   * @returns {void}
   */
  static cleanup() {
    try {
      if (this._state.listener) {
        window.removeEventListener('unhandledrejection', this._state.listener);
        this._state.listener = null;
        this._state.initialized = false;
        logger.info(this.MODULE_NAME, 'Listener rimosso');
      }
    } catch (error) {
      this._statistics.errors.push(`cleanup: ${error.message}`);
      logger.error(this.MODULE_NAME, 'Errore durante cleanup', error);
    }
  }
}

// ================================================
// PUBLIC API
// ================================================

/**
 * Ottiene lo stato del modulo
 * @static
 * @returns {Object} Stato corrente
 * @example
 * const status = GlobalErrorHandler.getStatus();
 */
GlobalErrorHandler.getStatus = function() {
  return {
    version: this.VERSION,
    initialized: this._state.initialized,
    errorsHandled: this._statistics.errorsHandled,
    dialogErrorsSuppressed: this._statistics.dialogErrorsSuppressed
  };
};

/**
 * Ottiene le statistiche del modulo
 * @static
 * @returns {ErrorHandlerStatistics} Statistiche correnti
 * @example
 * const stats = GlobalErrorHandler.getStatistics();
 */
GlobalErrorHandler.getStatistics = function() {
  return {
    ...this._statistics,
    errors: [...this._statistics.errors]
  };
};

/**
 * Resetta le statistiche
 * @static
 * @example
 * GlobalErrorHandler.resetStatistics();
 */
GlobalErrorHandler.resetStatistics = function() {
  logger.info(this.MODULE_NAME, 'Reset statistiche Global Error Handler');

  const initTime = this._statistics.initTime;

  this._statistics = {
    initTime,
    errorsHandled: 0,
    dialogErrorsSuppressed: 0,
    dialogClosures: 0,
    otherErrors: 0,
    errors: []
  };
};

/**
 * Mostra report completo
 * @static
 * @example
 * GlobalErrorHandler.showReport();
 */
GlobalErrorHandler.showReport = function() {
  const stats = this.getStatistics();
  const status = this.getStatus();

  console.group(`🛡️ ${this.MODULE_NAME} Report v${this.VERSION}`);
  console.log('Status:', status);
  console.log('Statistiche:', stats);
  console.groupEnd();

  ui.notifications.info(
    `🛡️ Report Error Handler: ${stats.errorsHandled} errori gestiti, ${stats.dialogErrorsSuppressed} Dialog soppressi`
  );
};

// Registra classe globale
window.GlobalErrorHandler = GlobalErrorHandler;

// Auto-inizializzazione
Hooks.once('init', () => {
  try {
    logger.info(GlobalErrorHandler.MODULE_NAME, `🎮 Brancalonia | Inizializzazione ${GlobalErrorHandler.MODULE_NAME} v${GlobalErrorHandler.VERSION}`);
    GlobalErrorHandler.initialize();
  } catch (error) {
    logger.error(GlobalErrorHandler.MODULE_NAME, 'Errore inizializzazione hook init', error);
  }
});

// Export per compatibilità
if (typeof module !== 'undefined') {
  module.exports = GlobalErrorHandler;
}

// Export ES6
export default GlobalErrorHandler;
export { GlobalErrorHandler };
