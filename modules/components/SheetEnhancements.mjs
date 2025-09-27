/* ===================================== */
/* SHEET ENHANCEMENTS */
/* Miglioramenti fogli personaggio */
/* ===================================== */

import { LogUtil } from '../utils/LogUtil.mjs';
import { GeneralUtil } from '../utils/GeneralUtil.mjs';

export class SheetEnhancements {
  static isInitialized = false;

  /**
   * Initialize sheet enhancements
   */
  static init() {
    if (this.isInitialized) return;

    LogUtil.log("Initializing Sheet Enhancements");

    // Add custom styles
    this.applyStyles();

    this.isInitialized = true;
  }

  /**
   * Apply sheet styles
   */
  static applyStyles() {
    const css = `
      .brancalonia-sheet-theme .sheet {
        background-image: url("modules/brancalonia-bigat/assets/artwork/fond.webp");
        background-size: cover;
        background-position: center;
      }

      .brancalonia-sheet-theme .sheet header {
        background: linear-gradient(90deg,
          var(--pfu-color-app-header-fill-1) 0%,
          var(--pfu-color-app-header-fill-2) 100%);
        color: var(--pfu-color-app-header-content);
        border-bottom: 2px solid var(--pfu-color-app-border);
      }

      .brancalonia-sheet-theme .sheet .sheet-body {
        background: rgba(212, 196, 160, 0.9);
      }

      .brancalonia-sheet-theme .sheet input[type="text"],
      .brancalonia-sheet-theme .sheet input[type="number"] {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid var(--pfu-color-control-border);
        color: var(--pfu-color-app-body-content);
      }

      .brancalonia-sheet-theme .sheet input:focus {
        border-color: var(--pfu-color-control-active-border);
        box-shadow: 0 0 5px var(--pfu-color-misc-shadow-highlight);
      }

      .brancalonia-sheet-theme .sheet .tabs {
        border-bottom: 2px solid var(--pfu-color-app-border);
      }

      .brancalonia-sheet-theme .sheet .tabs .item {
        background: var(--pfu-color-control-fill-1);
        border: 1px solid var(--pfu-color-control-border);
        color: var(--pfu-color-control-content);
      }

      .brancalonia-sheet-theme .sheet .tabs .item.active {
        background: var(--pfu-color-control-active-fill-1);
        color: var(--pfu-color-control-active-content);
        border-color: var(--pfu-color-control-active-border);
      }

      /* Brancalonia specific */
      .brancalonia-sheet-theme .sheet .infamia-tracker {
        background: linear-gradient(135deg, #8B2635 0%, #B87333 100%);
        padding: 10px;
        border-radius: 8px;
        color: white;
        text-align: center;
        margin: 10px 0;
      }

      .brancalonia-sheet-theme .sheet .baraonda-section {
        background: rgba(184, 115, 51, 0.1);
        border: 2px dashed #B87333;
        padding: 10px;
        border-radius: 8px;
        margin: 10px 0;
      }

      .brancalonia-sheet-theme .sheet .menagramo-warning {
        background: rgba(139, 38, 53, 0.1);
        border-left: 4px solid #8B2635;
        padding: 5px 10px;
        margin: 5px 0;
      }
    `;

    GeneralUtil.addCustomCSS(css, 'brancalonia-sheet-styles');
  }

  /**
   * Enhance a character sheet
   */
  static enhanceSheet(app, html, data) {
    // Add Brancalonia class
    html.addClass('brancalonia-enhanced');

    // Add special indicators for Brancalonia content
    if (data.actor?.system?.attributes?.infamia) {
      this.addInfamiaTracker(html, data.actor.system.attributes.infamia);
    }

    LogUtil.log("Enhanced sheet", app.actor?.name);
  }

  /**
   * Add Infamia tracker to sheet
   */
  static addInfamiaTracker(html, infamiaValue) {
    const tracker = `
      <div class="infamia-tracker">
        <h3>Infamia: ${infamiaValue || 0}</h3>
        <div class="infamia-bar" style="width: ${(infamiaValue || 0) * 10}%"></div>
      </div>
    `;

    html.find('.sheet-header').after(tracker);
  }
}