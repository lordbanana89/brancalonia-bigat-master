/**
 * @fileoverview Interfaccia configurazione tema per Brancalonia
 * @module theme-config
 * @requires brancalonia-logger
 * @requires theme.mjs
 * @requires settings.mjs
 * @version 2.0.0
 * @author Brancalonia Community
 * 
 * @description
 * Fornisce interfaccia utente per configurazione temi con:
 * - Color picker sincronizzati
 * - Tab system (colors, images, advanced)
 * - Live preview
 * - Import/Export preset
 * - Form validation
 * 
 * Usa ApplicationV2 con HandlebarsApplicationMixin per Foundry VTT v13+
 * 
 * @example
 * // Apri config tema
 * new ThemeConfig().render(true);
 */

import { createModuleLogger } from './brancalonia-logger.js';
import { Theme } from './theme.mjs';
import { MODULE, THEMES } from './settings.mjs';

const MODULE_LABEL = 'Theme Config UI';
const moduleLogger = createModuleLogger(MODULE_LABEL);
/**
 * Statistiche del theme config UI
 * @private
 */
const _statistics = {
  formSubmits: 0,
  colorChanges: 0,
  presetLoads: 0,
  exports: 0,
  imports: 0,
  errors: []
};

/**
 * Interfaccia configurazione tema Brancalonia
 * Estende ApplicationV2 con HandlebarsApplicationMixin per Foundry VTT v13+
 * @class ThemeConfig
 * @extends {foundry.applications.api.ApplicationV2}
 */
export class ThemeConfig extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  static VERSION = '2.0.0';
  static MODULE_NAME = MODULE_LABEL;

  /**
   * Costruttore
   * @param {Object} [options={}] - Opzioni applicazione
   */
  constructor(options = {}) {
    super(options);
    
    moduleLogger.debug('Creazione nuova istanza ThemeConfig');
    
    try {
      this.theme = game.settings.get(MODULE, 'theme');
      moduleLogger.debug('Tema corrente caricato');
    } catch (error) {
      moduleLogger.error('Errore caricamento tema corrente', error);
      this.theme = THEMES.default;
    }
  }

  static DEFAULT_OPTIONS = {
    id: 'brancalonia-theme-config',
    classes: ['brancalonia-theme-config'],
    tag: 'form',
    form: {
      handler: ThemeConfig.formHandler,
      submitOnChange: false,
      closeOnSubmit: true
    },
    window: {
      title: 'Configurazione Tema Brancalonia',
      icon: 'fas fa-palette',
      resizable: true
    },
    position: {
      width: 600,
      height: 'auto'
    },
    actions: {
      loadPreset: ThemeConfig.loadPreset,
      exportTheme: ThemeConfig.exportTheme,
      importTheme: ThemeConfig.importTheme,
      resetColor: ThemeConfig.resetColor,
      changeTab: ThemeConfig._changeTab
    }
  };

  static PARTS = {
    form: {
      template: 'modules/brancalonia-bigat/templates/theme-config.hbs'
    }
  };

  _activeTab = 'colors';

  /**
   * Cambia tab attivo
   * @static
   * @param {Event} event - Evento click
   * @param {HTMLElement} target - Elemento target
   * @returns {void}
   */
  static _changeTab(event, target) {
    event.preventDefault();
    
    try {
      const app = target.closest('.application').application;
      const tabName = target.dataset.tab;

      moduleLogger.debug(`Cambio tab: ${tabName}`);

      // Rimuovi active da tutti i tab
      app.element.querySelectorAll('.tabs .item').forEach(t => t.classList.remove('active'));
      app.element.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

      // Aggiungi active al tab selezionato
      target.classList.add('active');
      const tabContent = app.element.querySelector(`.tab[data-tab="${tabName}"]`);
      if (tabContent) tabContent.classList.add('active');

      // Salva il tab attivo
      app._activeTab = tabName;

    } catch (error) {
      moduleLogger.error('Errore cambio tab', error);
    }
  }

  /**
   * Callback dopo rendering
   * @param {Object} context - Contesto rendering
   * @param {Object} options - Opzioni rendering
   * @returns {void}
   */
  _onRender(context, options) {
    super._onRender(context, options);

    moduleLogger.debug('UI renderizzata, setup handlers...');

    try {
      // Attiva il tab corrente
      const initialTab = this._activeTab || 'colors';
      const tabLink = this.element.querySelector(`.tabs .item[data-tab="${initialTab}"]`);
      const tabContent = this.element.querySelector(`.tab[data-tab="${initialTab}"]`);

      if (tabLink) tabLink.classList.add('active');
      if (tabContent) tabContent.classList.add('active');

      // Setup color input handlers per sincronizzazione
      const html = this.element;

      // Sincronizza color picker con text input
      html.querySelectorAll('.color-input').forEach(group => {
        const colorInput = group.querySelector('input[type="color"]');
        const textInput = group.querySelector('input[type="text"]');

        if (colorInput && textInput) {
          // Quando cambia il color picker, aggiorna il text
          colorInput.addEventListener('input', (e) => {
            textInput.value = e.target.value;
            _statistics.colorChanges++;
            this._updatePreview();
            
            moduleLogger.debug(`Colore cambiato (total: ${_statistics.colorChanges})`);
          });

          // Quando cambia il text, aggiorna il color picker (se valido)
          textInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(value)) {
              colorInput.value = value;
              _statistics.colorChanges++;
            }
            this._updatePreview();
          });
        }
      });

      moduleLogger.debug('Handlers setup completato');

    } catch (error) {
      moduleLogger.error('Errore setup handlers', error);
      _statistics.errors.push({
        type: 'render-setup',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  async _prepareContext(options) {
    // Funzione helper per rimuovere alpha channel dai colori
    const stripAlpha = (color) => {
      if (!color) return '#000000';
      // Se il colore ha 8 o 9 caratteri (con alpha), prendi solo i primi 7
      if (color.length > 7) {
        return color.substring(0, 7);
      }
      return color;
    };

    // Crea una copia del tema con colori processati per input HTML
    const processedTheme = {
      colors: {},
      images: this.theme.images || {},
      advanced: this.theme.advanced || ''
    };

    // Processa tutti i colori
    for (const [key, value] of Object.entries(this.theme.colors || {})) {
      processedTheme.colors[key] = value;
      // Aggiungi versione senza alpha per input color
      processedTheme.colors[key + '_noAlpha'] = stripAlpha(value);
    }

    return {
      theme: processedTheme,
      presets: Object.keys(THEMES).map(key => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1)
      }))
    };
  }


  /**
   * Carica un preset tema
   * @static
   * @async
   * @param {Event} event - Evento click
   * @param {HTMLElement} target - Elemento target
   * @returns {Promise<void>}
   * @fires theme:config-preset-loaded
   */
  static async loadPreset(event, target) {
    try {
      const app = target.closest('.application').application;
      const preset = app.element.querySelector('#preset-select')?.value;
      
      if (preset && THEMES[preset]) {
        moduleLogger.info(`Caricamento preset: ${preset}`);
        
        app.theme = THEMES[preset];
        await app.render();
        
        _statistics.presetLoads++;
        
        ui.notifications.info(`Tema ${preset} caricato`);
        moduleLogger.info(`Preset "${preset}" caricato con successo`);

        // Emit event
        moduleLogger.events.emit('theme:config-preset-loaded', {
          preset,
          loadCount: _statistics.presetLoads,
          timestamp: Date.now()
        });
      }

    } catch (error) {
      moduleLogger.error('Errore caricamento preset', error);
      _statistics.errors.push({
        type: 'preset-load',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Esporta tema corrente
   * @static
   * @async
   * @param {Event} event - Evento click
   * @param {HTMLElement} target - Elemento target
   * @returns {Promise<void>}
   * @fires theme:config-exported
   */
  static async exportTheme(event, target) {
    try {
      moduleLogger.info('Export tema...');
      
      const app = target.closest('.application').application;
      const theme = Theme.from(app.theme);
      theme.exportToJson();
      
      _statistics.exports++;
      
      ui.notifications.info('Tema esportato');
      moduleLogger.info('Tema esportato con successo');

      // Emit event
      moduleLogger.events.emit('theme:config-exported', {
        exportCount: _statistics.exports,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore export tema', error);
      _statistics.errors.push({
        type: 'export',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Importa tema da file
   * @static
   * @async
   * @param {Event} event - Evento click
   * @param {HTMLElement} target - Elemento target
   * @returns {Promise<void>}
   * @fires theme:config-imported
   */
  static async importTheme(event, target) {
    try {
      moduleLogger.info('Import tema...');
      
      const app = target.closest('.application').application;
      const theme = await Theme.importFromJSONDialog();
      
      if (theme) {
        app.theme = theme;
        await app.render();
        
        _statistics.imports++;
        
        ui.notifications.success('Tema importato con successo');
        moduleLogger.info('Tema importato con successo');

        // Emit event
        moduleLogger.events.emit('theme:config-imported', {
          importCount: _statistics.imports,
          timestamp: Date.now()
        });
      } else {
        moduleLogger.debug('Import annullato');
      }

    } catch (error) {
      moduleLogger.error('Errore import tema', error);
      _statistics.errors.push({
        type: 'import',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Reset colore ai valori default
   * @static
   * @async
   * @param {Event} event - Evento click
   * @param {HTMLElement} target - Elemento target
   * @returns {Promise<void>}
   */
  static async resetColor(event, target) {
    try {
      const button = target;
      const colorKey = button.dataset.color;
      const colorInput = button.parentElement.querySelector('input[type="color"]');
      const textInput = button.parentElement.querySelector('input[type="text"]');
      const defaultTheme = THEMES.default;

      moduleLogger.debug(`Reset colore: ${colorKey}`);

      // Estrai il valore di default usando il data-color
      const defaultValue = defaultTheme.colors[colorKey] || '#000000';

      // Aggiorna entrambi gli input
      textInput.value = defaultValue;
      if (colorInput) {
        const stripAlpha = (color) => {
          if (!color) return '#000000';
          if (color.length > 7) return color.substring(0, 7);
          return color;
        };
        colorInput.value = stripAlpha(defaultValue);
      }

      // Aggiorna preview
      const app = target.closest('.application').application;
      app._updatePreview();

      moduleLogger.debug(`Colore ${colorKey} resettato a ${defaultValue}`);

    } catch (error) {
      moduleLogger.error('Errore reset colore', error);
    }
  }

  /**
   * Aggiorna preview live del tema
   * @returns {void}
   */
  _updatePreview() {
    try {
      // Ottieni i dati del form corrente
      const formElement = this.element.querySelector('form');
      if (!formElement) return;

      const formData = new FormDataExtended(formElement).object;
      const theme = Theme.from(formData.theme || this.theme);
      theme.apply();

      moduleLogger.debug('Preview aggiornata');

    } catch (error) {
      moduleLogger.error('Errore aggiornamento preview', error);
    }
  }

  /**
   * Handler submit form configurazione
   * @static
   * @async
   * @param {Event} event - Evento submit
   * @param {HTMLFormElement} form - Form element
   * @param {FormDataExtended} formData - Dati form
   * @returns {Promise<void>}
   * @fires theme:config-saved
   */
  static async formHandler(event, form, formData) {
    moduleLogger.startPerformance('theme-config-submit');
    moduleLogger.info('Submit form configurazione...');

    try {
      // Estrai i dati dal form
      const themeData = {
        colors: {},
        images: {},
        advanced: formData.object['theme.advanced'] || ''
      };

      // Funzione per validare colori
      const isValidColor = (color) => {
        if (!color) return false;
        // Accetta formato hex con o senza alpha
        return /^#[0-9A-F]{6}([0-9A-F]{2})?$/i.test(color);
      };

      let invalidColors = 0;

      // Estrai e valida i colori
      for (const [key, value] of Object.entries(formData.object)) {
        if (key.startsWith('theme.colors.')) {
          const colorKey = key.replace('theme.colors.', '');
          // Valida il colore prima di salvarlo
          if (isValidColor(value)) {
            themeData.colors[colorKey] = value;
          } else {
            // Usa il valore di default se il colore non è valido
            const defaultTheme = THEMES.default;
            const keys = colorKey.split('.');
            let defaultValue = defaultTheme.colors;
            for (const k of keys) {
              defaultValue = defaultValue?.[k];
            }
            themeData.colors[colorKey] = defaultValue || '#000000';
            
            invalidColors++;
            moduleLogger.warn(`Colore non valido per ${colorKey}: ${value}, usando default: ${defaultValue}`);
          }
        } else if (key.startsWith('theme.images.')) {
          const imageKey = key.replace('theme.images.', '');
          themeData.images[imageKey] = value;
        }
      }

      // Salva il tema
      await game.settings.set(MODULE, 'theme', themeData);

      // Applica immediatamente
      const theme = Theme.from(themeData);
      theme.apply();

      // Aggiorna preset selector se è custom
      await game.settings.set(MODULE, 'themePreset', 'custom');

      _statistics.formSubmits++;

      const submitTime = moduleLogger.endPerformance('theme-config-submit');

      ui.notifications.success('Tema salvato e applicato');
      moduleLogger.info(`Tema salvato in ${submitTime?.toFixed(2)}ms (${invalidColors} colori corretti)`);

      // Emit event
      moduleLogger.events.emit('theme:config-saved', {
        submitCount: _statistics.formSubmits,
        invalidColors,
        submitTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore salvataggio tema', error);
      ui.notifications.error('Errore nel salvare il tema. Ripristino tema default.');

      _statistics.errors.push({
        type: 'form-submit',
        message: error.message,
        timestamp: Date.now()
      });

      // Ripristina tema default in caso di errore
      try {
        await game.settings.set(MODULE, 'theme', THEMES.default);
        const defaultTheme = Theme.from(THEMES.default);
        defaultTheme.apply();
        moduleLogger.info('Tema default ripristinato dopo errore');
      } catch (restoreError) {
        moduleLogger.error('Errore ripristino tema default', restoreError);
      }
    }
  }

  /**
   * Ottiene bottoni header applicazione
   * @returns {Array} Array bottoni
   */
  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();
    buttons.unshift({
      label: "Reset",
      class: "reset-theme",
      icon: "fas fa-undo",
      onclick: () => {
        try {
          moduleLogger.info('Reset tema a default');
          this.theme = THEMES.default;
          this.render();
        } catch (error) {
          moduleLogger.error('Errore reset tema', error);
        }
      }
    });
    return buttons;
  }

  // =================================================================
  // PUBLIC API - STATISTICS
  // =================================================================

  /**
   * Ottiene le statistiche del config UI
   * @static
   * @returns {Object} Statistiche complete
   * @example
   * const stats = ThemeConfig.getStatistics();
   */
  static getStatistics() {
    return {
      ..._statistics
    };
  }

  /**
   * Resetta le statistiche del config UI
   * @static
   * @returns {void}
   * @example
   * ThemeConfig.resetStatistics();
   */
  static resetStatistics() {
    moduleLogger.info('Reset statistiche');

    _statistics.formSubmits = 0;
    _statistics.colorChanges = 0;
    _statistics.presetLoads = 0;
    _statistics.exports = 0;
    _statistics.imports = 0;
    _statistics.errors = [];

    moduleLogger.info('Statistiche resettate');
  }

  /**
   * Mostra report statistiche nella console
   * @static
   * @returns {Object} Le statistiche (per uso programmatico)
   * @example
   * ThemeConfig.showReport();
   */
  static showReport() {
    const stats = ThemeConfig.getStatistics();

    moduleLogger.group('📊 Brancalonia Theme Config UI - Report');

    moduleLogger.info('VERSION:', ThemeConfig.VERSION);

    moduleLogger.group('📈 Statistics');
    moduleLogger.table([
      { Metric: 'Form Submits', Value: stats.formSubmits },
      { Metric: 'Color Changes', Value: stats.colorChanges },
      { Metric: 'Preset Loads', Value: stats.presetLoads },
      { Metric: 'Exports', Value: stats.exports },
      { Metric: 'Imports', Value: stats.imports },
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