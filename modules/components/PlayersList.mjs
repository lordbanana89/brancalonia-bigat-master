/* ===================================== */
/* PLAYERS LIST ENHANCEMENTS */
/* Miglioramenti lista giocatori */
/* ===================================== */

import { LogUtil } from '../utils/LogUtil.mjs';
import { GeneralUtil } from '../utils/GeneralUtil.mjs';

export class PlayersList {
  static isInitialized = false;

  /**
   * Initialize players list enhancements
   */
  static init() {
    if (this.isInitialized) return;

    LogUtil.log("Initializing Players List Enhancements");

    // Add custom styles
    this.applyStyles();

    this.isInitialized = true;
  }

  /**
   * Apply players list styles
   */
  static applyStyles() {
    const css = `
      .brancalonia-players-list #players {
        background: var(--pfu-color-app-body-primary-fill-1);
        border: 2px solid var(--pfu-color-app-border);
        border-radius: 8px;
      }

      .brancalonia-players-list #players h3 {
        color: var(--pfu-color-app-header-content);
        background: var(--pfu-color-app-header-fill-1);
        padding: 5px 10px;
        border-radius: 6px 6px 0 0;
      }

      .brancalonia-players-list .player {
        border-left: 3px solid var(--player-color, transparent);
        transition: all 0.3s ease;
        padding: 5px;
        margin: 2px 0;
      }

      .brancalonia-players-list .player:hover {
        background: var(--pfu-color-control-highlight-fill-1);
        transform: translateX(2px);
      }

      .brancalonia-players-list .player.active {
        background: var(--pfu-color-control-active-fill-1);
      }

      .brancalonia-players-list .player-name {
        color: var(--pfu-color-control-content);
        font-weight: bold;
      }
    `;

    GeneralUtil.addCustomCSS(css, 'brancalonia-players-list-styles');
  }

  /**
   * Handle render list hook
   */
  static onRenderList(app, html, data) {
    // Add player colors
    html.find('.player').each((i, element) => {
      const playerId = element.dataset.userId;
      const user = game.users.get(playerId);
      if (user?.color) {
        element.style.setProperty('--player-color', user.color);
      }
    });
  }
}