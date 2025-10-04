/**
 * @fileoverview Dialog Safe Wrapper
 * 
 * Utility per wrappare i metodi Dialog di Foundry VTT e prevenire errori
 * quando l'utente chiude il dialog senza scegliere/rispondere.
 * 
 * Fornisce versioni "safe" di:
 * - Dialog.confirm() → safeConfirm()
 * - Dialog.prompt() → safePrompt()
 * - Dialog.wait() → safeWait()
 * 
 * @version 2.0.0
 * @author Brancalonia Module Team
 * @requires brancalonia-logger.js
 */

import { logger } from './brancalonia-logger.js';

/**
 * @typedef {Object} DialogStatistics
 * @property {number} confirmCalls - Chiamate a safeConfirm
 * @property {number} confirmClosed - Dialog chiusi senza scelta
 * @property {number} promptCalls - Chiamate a safePrompt
 * @property {number} promptClosed - Dialog chiusi senza input
 * @property {number} waitCalls - Chiamate a safeWait
 * @property {number} waitClosed - Dialog chiusi senza scelta
 */

/** @type {DialogStatistics} */
const statistics = {
  confirmCalls: 0,
  confirmClosed: 0,
  promptCalls: 0,
  promptClosed: 0,
  waitCalls: 0,
  waitClosed: 0
};

const VERSION = '2.0.0';
const MODULE_NAME = 'Safe Dialog';

/**
 * Safe Dialog.confirm wrapper
 * Wrappa Dialog.confirm() per gestire la chiusura senza scelta.
 * Ritorna false invece di lanciare un'eccezione.
 * 
 * @async
 * @param {Object} config - Configurazione dialog
 * @param {string} config.title - Titolo del dialog
 * @param {string} config.content - Contenuto HTML
 * @param {Function} [config.yes] - Callback per "Yes"
 * @param {Function} [config.no] - Callback per "No"
 * @returns {Promise<boolean>} True se confermato, false se chiuso/rifiutato
 * @example
 * const confirmed = await safeConfirm({
 *   title: 'Conferma',
 *   content: '<p>Vuoi procedere?</p>'
 * });
 * if (confirmed) {
 *   // L'utente ha confermato
 * }
 */
export async function safeConfirm(config) {
  statistics.confirmCalls++;
  try {
    const result = await foundry.appv1.sheets.Dialog.confirm(config);
    logger.debug(MODULE_NAME, 'Dialog confirm: utente ha scelto', result);
    return result;
  } catch (err) {
    // Dialog closed without choice - return false
    statistics.confirmClosed++;
    logger.debug(MODULE_NAME, 'Dialog confirm: chiuso senza scelta');
    return false;
  }
}

/**
 * Safe Dialog.prompt wrapper
 * Wrappa Dialog.prompt() per gestire la chiusura senza input.
 * Ritorna null invece di lanciare un'eccezione.
 * 
 * @async
 * @param {Object} config - Configurazione dialog
 * @param {string} config.title - Titolo del dialog
 * @param {string} config.content - Contenuto HTML con input
 * @param {Function} config.callback - Callback con il valore dell'input
 * @returns {Promise<any|null>} Valore dell'input o null se chiuso
 * @example
 * const value = await safePrompt({
 *   title: 'Inserisci valore',
 *   content: '<input type="text" name="value" />',
 *   callback: (html) => html.find('[name="value"]').val()
 * });
 * if (value !== null) {
 *   // L'utente ha inserito un valore
 * }
 */
export async function safePrompt(config) {
  statistics.promptCalls++;
  try {
    const result = await foundry.appv1.sheets.Dialog.prompt(config);
    logger.debug(MODULE_NAME, 'Dialog prompt: utente ha inserito valore');
    return result;
  } catch (err) {
    // Dialog closed without input - return null
    statistics.promptClosed++;
    logger.debug(MODULE_NAME, 'Dialog prompt: chiuso senza input');
    return null;
  }
}

/**
 * Safe Dialog.wait wrapper
 * Wrappa Dialog.wait() per gestire la chiusura senza scelta.
 * Ritorna null invece di lanciare un'eccezione.
 * 
 * @async
 * @param {Object} config - Configurazione dialog
 * @param {string} config.title - Titolo del dialog
 * @param {string} config.content - Contenuto HTML
 * @param {Object} config.buttons - Bottoni custom
 * @returns {Promise<any|null>} Valore del bottone cliccato o null se chiuso
 * @example
 * const choice = await safeWait({
 *   title: 'Scegli',
 *   content: '<p>Cosa vuoi fare?</p>',
 *   buttons: {
 *     option1: { label: 'Opzione 1', callback: () => 'opt1' },
 *     option2: { label: 'Opzione 2', callback: () => 'opt2' }
 *   }
 * });
 * if (choice !== null) {
 *   // L'utente ha scelto un'opzione
 * }
 */
export async function safeWait(config) {
  statistics.waitCalls++;
  try {
    const dialog = new foundry.appv1.sheets.Dialog(config);
    const result = await dialog.wait();
    logger.debug(MODULE_NAME, 'Dialog wait: utente ha scelto');
    return result;
  } catch (err) {
    // Dialog closed without choice - return null
    statistics.waitClosed++;
    logger.debug(MODULE_NAME, 'Dialog wait: chiuso senza scelta');
    return null;
  }
}

/**
 * Ottiene le statistiche di utilizzo
 * @returns {DialogStatistics} Statistiche correnti
 */
export function getStatistics() {
  return { ...statistics };
}

/**
 * Resetta le statistiche
 * @returns {void}
 */
export function resetStatistics() {
  logger.info(MODULE_NAME, 'Reset statistiche Safe Dialog');
  statistics.confirmCalls = 0;
  statistics.confirmClosed = 0;
  statistics.promptCalls = 0;
  statistics.promptClosed = 0;
  statistics.waitCalls = 0;
  statistics.waitClosed = 0;
}

// Global registration for convenience
Hooks.once('init', () => {
  if (!game.brancalonia) game.brancalonia = {};

  game.brancalonia.safeDialog = {
    confirm: safeConfirm,
    prompt: safePrompt,
    wait: safeWait,
    getStatistics,
    resetStatistics
  };

  logger.info(MODULE_NAME, `✅ Safe Dialog wrapper v${VERSION} registered`);
});
