/* ===================================== */
/* SCENE NAVIGATION ENHANCEMENTS */
/* Miglioramenti navigazione scene */
/* ===================================== */

import { LogUtil } from '../utils/LogUtil.mjs';
import { GeneralUtil } from '../utils/GeneralUtil.mjs';

export class SceneNavigation {
  static isInitialized = false;

  /**
   * Initialize scene navigation enhancements
   */
  static init() {
    if (this.isInitialized) return;

    LogUtil.log("Initializing Scene Navigation Enhancements");

    // Add custom styles
    this.applyStyles();

    this.isInitialized = true;
  }

  /**
   * Apply scene navigation styles
   */
  static applyStyles() {
    const css = `
      .brancalonia-scene-nav #navigation {
        background: var(--pfu-color-app-body-primary-fill-1);
        border: 2px solid var(--pfu-color-app-border);
      }

      .brancalonia-scene-nav #navigation #nav-toggle {
        background: var(--pfu-color-control-fill-1);
        border-color: var(--pfu-color-control-border);
      }

      .brancalonia-scene-nav #navigation .nav-item {
        background: var(--pfu-color-control-fill-1);
        border: 1px solid var(--pfu-color-control-border);
        transition: all 0.3s ease;
      }

      .brancalonia-scene-nav #navigation .nav-item:hover {
        background: var(--pfu-color-control-highlight-fill-1);
        transform: scale(1.05);
      }

      .brancalonia-scene-nav #navigation .nav-item.active {
        background: var(--pfu-color-control-active-fill-1);
        border-color: var(--pfu-color-control-active-border);
      }
    `;

    GeneralUtil.addCustomCSS(css, 'brancalonia-scene-nav-styles');
  }

  /**
   * Handle render controls hook
   */
  static onRenderControls(app, html, data) {
    // Add enhancements to scene controls
    LogUtil.log("Enhancing scene controls");
  }
}