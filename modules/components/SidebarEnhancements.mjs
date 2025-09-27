/* ===================================== */
/* SIDEBAR ENHANCEMENTS */
/* Miglioramenti sidebar */
/* ===================================== */

import { LogUtil } from '../utils/LogUtil.mjs';
import { GeneralUtil } from '../utils/GeneralUtil.mjs';

export class SidebarEnhancements {
  static isInitialized = false;

  /**
   * Initialize sidebar enhancements
   */
  static init() {
    if (this.isInitialized) return;

    LogUtil.log("Initializing Sidebar Enhancements");

    // Add custom styles
    this.applyStyles();

    this.isInitialized = true;
  }

  /**
   * Apply sidebar styles
   */
  static applyStyles() {
    const css = `
      .brancalonia-theme-active #sidebar {
        background: var(--pfu-color-app-body-primary-fill-1);
        border-left: 2px solid var(--pfu-color-app-border);
      }

      .brancalonia-theme-active #sidebar-tabs {
        background: var(--pfu-color-app-header-fill-1);
        border-bottom: 2px solid var(--pfu-color-app-border);
      }

      .brancalonia-theme-active #sidebar-tabs > .item {
        background: var(--pfu-color-control-fill-1);
        border: 1px solid var(--pfu-color-control-border);
        color: var(--pfu-color-control-content);
        transition: all 0.3s ease;
      }

      .brancalonia-theme-active #sidebar-tabs > .item:hover {
        background: var(--pfu-color-control-highlight-fill-1);
        color: var(--pfu-color-control-highlight-content);
      }

      .brancalonia-theme-active #sidebar-tabs > .item.active {
        background: var(--pfu-color-control-active-fill-1);
        color: var(--pfu-color-control-active-content);
        border-color: var(--pfu-color-control-active-border);
      }

      .brancalonia-theme-active .sidebar-tab .directory-header {
        background: var(--pfu-color-app-header-fill-1);
        color: var(--pfu-color-app-header-content);
        border-bottom: 1px solid var(--pfu-color-app-border);
      }

      .brancalonia-theme-active .sidebar-tab .directory-item {
        transition: all 0.2s ease;
      }

      .brancalonia-theme-active .sidebar-tab .directory-item:hover {
        background: var(--pfu-color-control-highlight-fill-1);
      }
    `;

    GeneralUtil.addCustomCSS(css, 'brancalonia-sidebar-styles');
  }

  /**
   * Enhance sidebar tab
   */
  static enhanceTab(tab, html, data) {
    // Add Brancalonia specific enhancements
    LogUtil.log("Enhancing sidebar tab", tab.id);
  }
}