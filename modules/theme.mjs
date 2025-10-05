/**
 * @fileoverview Core theme engine per sistema tema Brancalonia
 * @module theme
 * @requires brancalonia-logger
 * @version 2.0.0
 * @author Brancalonia Community
 * 
 * @description
 * Core engine per generazione e applicazione temi Brancalonia.
 * Basato su ProjectFU Theme Architecture con estensioni per:
 * - CSS Variables generation
 * - D&D 5e compatibility
 * - Import/Export JSON
 * - Live preview
 * 
 * @example
 * // Crea tema da dati
 * const theme = Theme.from(themeData);
 * theme.apply();
 * 
 * @example
 * // Export tema
 * theme.exportToJson();
 */

import { createModuleLogger } from './brancalonia-logger.js';

const MODULE_LABEL = 'Theme Engine';
const moduleLogger = createModuleLogger(MODULE_LABEL);
/**
 * @typedef {Object} ThemeColors
 * @property {string} controlContent - Colore contenuto controlli
 * @property {string} controlBorder - Colore bordo controlli
 * @property {string} appHeaderContent - Colore contenuto header applicazioni
 * @property {string} appBodyContent - Colore contenuto body applicazioni
 * @property {string} miscBorder - Colore bordo elementi vari
 * ... (52 proprietà totali)
 */

/**
 * @typedef {Object} ThemeImages
 * @property {string} appAccentImage - Immagine accent applicazioni
 * @property {string} appSectionBgImage - Immagine background sezioni
 * @property {string} appBgImage - Immagine background applicazioni
 * @property {string} sidebarBgImage - Immagine background sidebar
 */

/**
 * @typedef {Object} ThemeData
 * @property {ThemeColors} colors - Colori del tema
 * @property {ThemeImages} images - Immagini del tema
 * @property {string} advanced - CSS custom avanzato
 */

/**
 * Core engine per temi Brancalonia
 * @class Theme
 */
export class Theme {
  static VERSION = '2.0.0';
  static MODULE_NAME = MODULE_LABEL;

  /**
   * Statistiche del theme engine
   * @static
   * @private
   */
  static _statistics = {
    applyCount: 0,
    exportCount: 0,
    importCount: 0,
    generateCSSCount: 0,
    errors: []
  };

  /**
   * Costruttore tema
   * @param {ThemeData} [data={}] - Dati configurazione tema
   */
  constructor(data = {}) {
    moduleLogger.debug('Creazione nuova istanza Theme');

    // Colori base tema pergamena
    this.colors = {
      // Controls
      controlContent: data.colors?.controlContent ?? "#E8DCC0",
      controlBorder: data.colors?.controlBorder ?? "#B8985A",
      controlFocusContent: data.colors?.controlFocusContent ?? "#FFFFFF",
      controlInactiveContent: data.colors?.controlInactiveContent ?? "#D4C4A080",
      controlFill1: data.colors?.controlFill1 ?? "#3A302866",
      controlFill2: data.colors?.controlFill2 ?? "#5A504A66",

      controlHighlightContent: data.colors?.controlHighlightContent ?? "#B87333",
      controlHighlightBorder: data.colors?.controlHighlightBorder ?? "#B87333",
      controlHighlightFill1: data.colors?.controlHighlightFill1 ?? "#C9A961",
      controlHighlightFill2: data.colors?.controlHighlightFill2 ?? "#D4AA6E",

      controlActiveContent: data.colors?.controlActiveContent ?? "#C9A961",
      controlActiveBorder: data.colors?.controlActiveBorder ?? "#C9A961",
      controlActiveFill1: data.colors?.controlActiveFill1 ?? "#B87333CC",
      controlActiveFill2: data.colors?.controlActiveFill2 ?? "#C9A961CC",

      // Applications
      appHeaderContent: data.colors?.appHeaderContent ?? "#E8DCC0",
      appHeaderFocusContent: data.colors?.appHeaderFocusContent ?? "#FFFFFF",
      appHeaderFill1: data.colors?.appHeaderFill1 ?? "#8B26354D",
      appHeaderFill2: data.colors?.appHeaderFill2 ?? "#7221294D",

      appBodyContent: data.colors?.appBodyContent ?? "#3A3028",
      appBodyContentSecondary: data.colors?.appBodyContentSecondary ?? "#5A504A",
      appBodyPrimaryFill1: data.colors?.appBodyPrimaryFill1 ?? "#D4C4A0E6",
      appBodyPrimaryFill2: data.colors?.appBodyPrimaryFill2 ?? "#E8DCC0E6",

      appBorder: data.colors?.appBorder ?? "#B8985A",
      appNameSectionContent: data.colors?.appNameSectionContent ?? "#E8DCC0",
      appNameSectionShadow: data.colors?.appNameSectionShadow ?? "#00000099",

      // Misc
      miscBorder: data.colors?.miscBorder ?? "#B8985A",
      miscFill: data.colors?.miscFill ?? "#D4C4A04D",
      miscFillPrimary: data.colors?.miscFillPrimary ?? "#3A302833",
      miscFillSecondary: data.colors?.miscFillSecondary ?? "#B8985A1A",
      miscInactiveContent: data.colors?.miscInactiveContent ?? "#5A504A80",
      miscShadowHighlight: data.colors?.miscShadowHighlight ?? "#C9A961",
      miscLinkIdle: data.colors?.miscLinkIdle ?? "#B87333",
      miscLinkFocus: data.colors?.miscLinkFocus ?? "#8B2635",
      miscReroll: data.colors?.miscReroll ?? "#8B2635"
    };

    // Immagini tema
    this.images = {
      appAccentImage: data.images?.appAccentImage ?? "modules/brancalonia-bigat/assets/artwork/fond.webp",
      appSectionBgImage: data.images?.appSectionBgImage ?? "",
      appBgImage: data.images?.appBgImage ?? "",
      sidebarBgImage: data.images?.sidebarBgImage ?? ""
    };

    // Advanced CSS personalizzato
    this.advanced = data.advanced ?? "";
  }

  /**
   * Crea un'istanza Theme da dati JSON
   * @static
   * @param {ThemeData|Theme} themeData - Dati tema o istanza Theme
   * @returns {Theme} Istanza Theme
   * @example
   * const theme = Theme.from(themeData);
   */
  static from(themeData) {
    if (themeData instanceof Theme) return themeData;
    return new Theme(themeData);
  }

  /**
   * Applica il tema al documento
   * @returns {void}
   * @fires theme:engine-applied
   * @example
   * const theme = new Theme(data);
   * theme.apply();
   */
  apply() {
    moduleLogger.startPerformance('theme-engine-apply');
    moduleLogger.debug('Applicazione tema...');

    try {
      // Rimuovi CSS tema precedente
      const oldStyle = document.querySelector("#brancalonia-theme-css");
      if (oldStyle) {
        oldStyle.remove();
        moduleLogger.debug('CSS tema precedente rimosso');
      }

      // Genera CSS variabili
      const css = this.generateCSS();

      // Crea e inserisci elemento style
      const style = document.createElement("style");
      style.id = "brancalonia-theme-css";
      style.innerHTML = css;
      document.head.appendChild(style);

      // Body class application moved to Main.mjs (first esmodule)
      // Remove legacy classes if present
      document.body.classList.remove("brancalonia-theme", "pergamena-theme");

      // Update statistics
      Theme._statistics.applyCount++;

      const applyTime = moduleLogger.endPerformance('theme-engine-apply');
      moduleLogger.info(`Tema applicato in ${applyTime?.toFixed(2)}ms`);

      // Emit event
      moduleLogger.events.emit('theme:engine-applied', {
        applyCount: Theme._statistics.applyCount,
        applyTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore applicazione tema', error);
      Theme._statistics.errors.push({
        type: 'apply',
        message: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * Genera il CSS del tema
   * @returns {string} CSS generato
   * @example
   * const css = theme.generateCSS();
   */
  generateCSS() {
    moduleLogger.startPerformance('theme-engine-generate-css');
    moduleLogger.debug('Generazione CSS...');

    try {
      let css = ":root {\n";

    // Genera variabili colore
    css += "  /* Control Colors */\n";
    css += `  --pfu-color-control-content: ${this.colors.controlContent};\n`;
    css += `  --pfu-color-control-border: ${this.colors.controlBorder};\n`;
    css += `  --pfu-color-control-focus-content: ${this.colors.controlFocusContent};\n`;
    css += `  --pfu-color-control-inactive-content: ${this.colors.controlInactiveContent};\n`;
    css += `  --pfu-color-control-fill-1: ${this.colors.controlFill1};\n`;
    css += `  --pfu-color-control-fill-2: ${this.colors.controlFill2};\n`;
    css += `  --pfu-color-control-fill: linear-gradient(180deg, var(--pfu-color-control-fill-1) 0%, var(--pfu-color-control-fill-2) 100%);\n`;

    css += "\n  /* Control Highlight */\n";
    css += `  --pfu-color-control-highlight-content: ${this.colors.controlHighlightContent};\n`;
    css += `  --pfu-color-control-highlight-border: ${this.colors.controlHighlightBorder};\n`;
    css += `  --pfu-color-control-highlight-fill-1: ${this.colors.controlHighlightFill1};\n`;
    css += `  --pfu-color-control-highlight-fill-2: ${this.colors.controlHighlightFill2};\n`;
    css += `  --pfu-color-control-highlight-fill: linear-gradient(0deg, var(--pfu-color-control-highlight-fill-1) 0%, var(--pfu-color-control-highlight-fill-2) 100%);\n`;

    css += "\n  /* Control Active */\n";
    css += `  --pfu-color-control-active-content: ${this.colors.controlActiveContent};\n`;
    css += `  --pfu-color-control-active-border: ${this.colors.controlActiveBorder};\n`;
    css += `  --pfu-color-control-active-fill-1: ${this.colors.controlActiveFill1};\n`;
    css += `  --pfu-color-control-active-fill-2: ${this.colors.controlActiveFill2};\n`;
    css += `  --pfu-color-control-active-fill: linear-gradient(0deg, var(--pfu-color-control-active-fill-1) 0%, var(--pfu-color-control-active-fill-2) 100%);\n`;

    css += "\n  /* Application Colors */\n";
    css += `  --pfu-color-app-header-content: ${this.colors.appHeaderContent};\n`;
    css += `  --pfu-color-app-header-focus-content: ${this.colors.appHeaderFocusContent};\n`;
    css += `  --pfu-color-app-header-fill-1: ${this.colors.appHeaderFill1};\n`;
    css += `  --pfu-color-app-header-fill-2: ${this.colors.appHeaderFill2};\n`;
    css += `  --pfu-color-app-header-fill: linear-gradient(90deg, var(--pfu-color-app-header-fill-1) 0%, var(--pfu-color-app-header-fill-2) 100%);\n`;

    css += `  --pfu-color-app-body-content: ${this.colors.appBodyContent};\n`;
    css += `  --pfu-color-app-body-content-secondary: ${this.colors.appBodyContentSecondary};\n`;
    css += `  --pfu-color-app-body-primary-fill-1: ${this.colors.appBodyPrimaryFill1};\n`;
    css += `  --pfu-color-app-body-primary-fill-2: ${this.colors.appBodyPrimaryFill2};\n`;
    css += `  --pfu-color-app-body-primary-fill: linear-gradient(270deg, var(--pfu-color-app-body-primary-fill-1) 0%, var(--pfu-color-app-body-primary-fill-2) 100%);\n`;

    css += `  --pfu-color-app-border: ${this.colors.appBorder};\n`;
    css += `  --pfu-color-app-name-section-content: ${this.colors.appNameSectionContent};\n`;
    css += `  --pfu-color-app-name-section-shadow: ${this.colors.appNameSectionShadow};\n`;

    css += "\n  /* Misc Colors */\n";
    css += `  --pfu-color-misc-border: ${this.colors.miscBorder};\n`;
    css += `  --pfu-color-misc-fill: ${this.colors.miscFill};\n`;
    css += `  --pfu-color-misc-fill-primary: ${this.colors.miscFillPrimary};\n`;
    css += `  --pfu-color-misc-fill-secondary: ${this.colors.miscFillSecondary};\n`;
    css += `  --pfu-color-misc-inactive-content: ${this.colors.miscInactiveContent};\n`;
    css += `  --pfu-color-misc-shadow-highlight: ${this.colors.miscShadowHighlight};\n`;
    css += `  --pfu-color-misc-link-idle: ${this.colors.miscLinkIdle};\n`;
    css += `  --pfu-color-misc-link-focus: ${this.colors.miscLinkFocus};\n`;
    css += `  --pfu-color-misc-reroll: ${this.colors.miscReroll};\n`;

    // Immagini
    if (this.images.appAccentImage) {
      css += `\n  --pfu-app-accent-image: url("${this.images.appAccentImage}");\n`;
    }
    if (this.images.appSectionBgImage) {
      css += `  --pfu-app-section-bg-image: url("${this.images.appSectionBgImage}");\n`;
    }
    if (this.images.appBgImage) {
      css += `  --pfu-app-bg-image: url("${this.images.appBgImage}");\n`;
    }
    if (this.images.sidebarBgImage) {
      css += `  --pfu-sidebar-bg-image: url("${this.images.sidebarBgImage}");\n`;
    }

    // D&D 5e compatibility
    css += "\n  /* D&D 5e Compatibility */\n";
    css += `  --color-border-dark: ${this.colors.appBorder};\n`;
    css += `  --color-border-light: ${this.colors.controlBorder};\n`;
    css += `  --color-bg-option: ${this.colors.appBodyPrimaryFill1};\n`;
    css += `  --color-text-dark-primary: ${this.colors.appBodyContent};\n`;
    css += `  --color-text-dark-secondary: ${this.colors.appBodyContentSecondary};\n`;
    css += `  --color-text-light-primary: ${this.colors.appHeaderContent};\n`;
    css += `  --color-shadow-primary: #00000066;\n`;

    // Border radius
    css += "\n  /* Border Radius */\n";
    css += "  --pfu-border-radius-small: 4px;\n";
    css += "  --pfu-border-radius-medium: 8px;\n";
    css += "  --pfu-border-radius-large: 12px;\n";

    css += "}\n";

    // Advanced CSS
    if (this.advanced) {
      css += "\n/* Advanced Custom CSS */\n";
      css += this.advanced;
    }

    // Update statistics
    Theme._statistics.generateCSSCount++;

    const generateTime = moduleLogger.endPerformance('theme-engine-generate-css');
    moduleLogger.debug(`CSS generato in ${generateTime?.toFixed(2)}ms (${css.length} caratteri)`);

    return css;

    } catch (error) {
      moduleLogger.error('Errore generazione CSS', error);
      Theme._statistics.errors.push({
        type: 'generate-css',
        message: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * Esporta il tema come JSON
   * @returns {void}
   * @fires theme:engine-exported
   * @example
   * theme.exportToJson();
   */
  exportToJson() {
    moduleLogger.info('Export tema a JSON...');

    try {
      const data = {
        colors: this.colors,
        images: this.images,
        advanced: this.advanced,
        version: Theme.VERSION,
        exportDate: new Date().toISOString()
      };

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `brancalonia-theme-${Date.now()}.json`;
      a.click();

      URL.revokeObjectURL(url);

      // Update statistics
      Theme._statistics.exportCount++;

      moduleLogger.info('Tema esportato con successo');

      // Emit event
      moduleLogger.events.emit('theme:engine-exported', {
        exportCount: Theme._statistics.exportCount,
        fileSize: jsonStr.length,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore export tema', error);
      Theme._statistics.errors.push({
        type: 'export',
        message: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * Importa tema da file JSON
   * @static
   * @async
   * @returns {Promise<Theme|null>} Istanza Theme importata o null se errore
   * @fires theme:engine-imported
   * @example
   * const theme = await Theme.importFromJSONDialog();
   * if (theme) theme.apply();
   */
  static async importFromJSONDialog() {
    moduleLogger.info('Apertura dialog import tema...');

    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";

      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          moduleLogger.debug('Import annullato dall\'utente');
          return resolve(null);
        }

        try {
          moduleLogger.info(`Import tema da file: ${file.name}`);

          const text = await file.text();
          // Fixed: JSON.parse with try-catch
          let data;
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            moduleLogger.error('File tema non valido', parseError);
            ui.notifications.error('File tema non valido o corrotto!');
            return;
          }

          // Validate data structure
          if (!data.colors) {
            throw new Error('File JSON non valido: manca "colors"');
          }

          const theme = new Theme(data);

          // Update statistics
          Theme._statistics.importCount++;

          moduleLogger.info('Tema importato con successo');

          // Emit event
          moduleLogger.events.emit('theme:engine-imported', {
            fileName: file.name,
            fileSize: file.size,
            importCount: Theme._statistics.importCount,
            timestamp: Date.now()
          });

          resolve(theme);

        } catch (error) {
          moduleLogger.error('Errore import tema', error);
          ui.notifications.error("Errore nell'importazione del tema");

          Theme._statistics.errors.push({
            type: 'import',
            message: error.message,
            fileName: file?.name,
            timestamp: Date.now()
          });

          resolve(null);
        }
      };

      input.click();
    });
  }

  // =================================================================
  // PUBLIC API - STATISTICS
  // =================================================================

  /**
   * Ottiene le statistiche del theme engine
   * @static
   * @returns {Object} Statistiche complete
   * @example
   * const stats = Theme.getStatistics();
   */
  static getStatistics() {
    return {
      ...Theme._statistics
    };
  }

  /**
   * Resetta le statistiche del theme engine
   * @static
   * @returns {void}
   * @example
   * Theme.resetStatistics();
   */
  static resetStatistics() {
    moduleLogger.info('Reset statistiche');

    Theme._statistics = {
      applyCount: 0,
      exportCount: 0,
      importCount: 0,
      generateCSSCount: 0,
      errors: []
    };

    moduleLogger.info('Statistiche resettate');
  }

  /**
   * Mostra report statistiche nella console
   * @static
   * @returns {Object} Le statistiche (per uso programmatico)
   * @example
   * Theme.showReport();
   */
  static showReport() {
    const stats = Theme.getStatistics();

    moduleLogger.group('📊 Brancalonia Theme Engine - Report');

    moduleLogger.info('VERSION:', Theme.VERSION);

    moduleLogger.group('📈 Statistics');
    moduleLogger.table([
      { Metric: 'Apply Count', Value: stats.applyCount },
      { Metric: 'Export Count', Value: stats.exportCount },
      { Metric: 'Import Count', Value: stats.importCount },
      { Metric: 'Generate CSS Count', Value: stats.generateCSSCount },
      { Metric: 'Errors', Value: stats.errors.length }
    ]);
    moduleLogger.groupEnd();

    if (stats.errors.length > 0) {
      moduleLogger.group('🐛 Errors');
      stats.errors.forEach((err, i) => {
        moduleLogger.error(`Error ${i + 1}:`, err.type, '-', err.message);
      });
      moduleLogger.groupEnd();
    }

    moduleLogger.groupEnd();

    return stats;
  }
}