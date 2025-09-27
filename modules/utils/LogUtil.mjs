/* ===================================== */
/* LOG UTILITY */
/* Sistema di logging avanzato */
/* ===================================== */

import { MODULE } from '../settings.mjs';

export class LogUtil {
  static debugOn = false;
  static logHistory = [];
  static maxHistory = 100;

  /**
   * Initialize logging system
   */
  static init() {
    // Check debug mode from settings
    this.debugOn = game.settings?.get(MODULE, 'debugMode') || false;

    // Add console command for debug toggle
    window.brancaloniaDebug = (enabled = !this.debugOn) => {
      this.debugOn = enabled;
      game.settings.set(MODULE, 'debugMode', enabled);
      console.log(`Brancalonia Debug: ${enabled ? 'ENABLED' : 'DISABLED'}`);
    };
  }

  /**
   * Log a message with optional data
   * @param {string} message - The message to log
   * @param {*} data - Optional data to log
   * @param {boolean} force - Force log even if debug is off
   */
  static log(message, data = null, force = false) {
    if (!this.debugOn && !force) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data: data ? structuredClone(data) : null
    };

    // Add to history
    this.logHistory.push(logEntry);
    if (this.logHistory.length > this.maxHistory) {
      this.logHistory.shift();
    }

    // Console output
    const prefix = `%c[Brancalonia Theme]`;
    const style = 'color: #C9A961; font-weight: bold;';

    if (data !== null) {
      console.log(prefix, style, message, data);
    } else {
      console.log(prefix, style, message);
    }
  }

  /**
   * Log an error
   */
  static error(message, error = null) {
    const prefix = `%c[Brancalonia Theme ERROR]`;
    const style = 'color: #8B2635; font-weight: bold;';

    console.error(prefix, style, message, error);

    // Always add errors to history
    this.logHistory.push({
      timestamp: new Date().toISOString(),
      message: `ERROR: ${message}`,
      data: error
    });
  }

  /**
   * Log a warning
   */
  static warn(message, data = null) {
    if (!this.debugOn) return;

    const prefix = `%c[Brancalonia Theme Warning]`;
    const style = 'color: #D4AA6E; font-weight: bold;';

    if (data !== null) {
      console.warn(prefix, style, message, data);
    } else {
      console.warn(prefix, style, message);
    }
  }

  /**
   * Get log history
   */
  static getHistory() {
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  static clearHistory() {
    this.logHistory = [];
    console.log('%c[Brancalonia Theme]', 'color: #C9A961; font-weight: bold;', 'Log history cleared');
  }

  /**
   * Export logs to file
   */
  static exportLogs() {
    const logs = JSON.stringify(this.logHistory, null, 2);
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `brancalonia-logs-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }
}