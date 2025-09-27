/* ===================================== */
/* BRANCALONIA THEME CONFIGURATION */
/* Interfaccia configurazione tema */
/* ===================================== */

import { Theme } from './theme.mjs';
import { MODULE, THEMES } from './settings.mjs';

// Usa ApplicationV2 per compatibilità con Foundry V13+
export class ThemeConfig extends foundry.applications.api.ApplicationV2 {
  constructor(options = {}) {
    super(options);
    this.theme = game.settings.get(MODULE, 'theme');
  }

  static DEFAULT_OPTIONS = {
    id: 'brancalonia-theme-config',
    title: 'Configurazione Tema Brancalonia',
    tag: 'form',
    form: {
      handler: ThemeConfig.formHandler,
      submitOnChange: false,
      closeOnSubmit: true
    },
    window: {
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
    },
    tabs: [
      {
        navSelector: '.tabs',
        contentSelector: '.content',
        initial: 'colors'
      }
    ]
  };

  static PARTS = {
    form: {
      template: 'modules/brancalonia-bigat/templates/theme-config.hbs'
    }
  };

  tabGroups = {
    primary: 'colors'
  };

  static _changeTab(event, target) {
    event.preventDefault();
    const app = target.closest('.application').application;
    const tabName = target.dataset.tab;

    // Rimuovi active da tutti i tab
    app.element.querySelectorAll('.tabs .item').forEach(t => t.classList.remove('active'));
    app.element.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    // Aggiungi active al tab selezionato
    target.classList.add('active');
    const tabContent = app.element.querySelector(`.tab[data-tab="${tabName}"]`);
    if (tabContent) tabContent.classList.add('active');

    // Salva il tab attivo
    app.tabGroups.primary = tabName;
  }

  _onFirstRender(context, options) {
    // Attiva il primo tab
    const initialTab = this.tabGroups.primary || 'colors';
    const tabLink = this.element.querySelector(`.tabs .item[data-tab="${initialTab}"]`);
    const tabContent = this.element.querySelector(`.tab[data-tab="${initialTab}"]`);

    if (tabLink) tabLink.classList.add('active');
    if (tabContent) tabContent.classList.add('active');
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
      })),
      tabs: this.tabGroups
    };
  }

  _onRender(context, options) {
    const html = this.element;

    // Anteprima live per input colore
    html.querySelectorAll('input[type="color"]').forEach(input => {
      input.addEventListener('input', () => this._updatePreview());
    });

    // Anteprima live per input testo
    html.querySelectorAll('input[type="text"][name*="colors"]').forEach(input => {
      input.addEventListener('input', () => this._updatePreview());
    });
  }

  static async loadPreset(event, target) {
    const app = target.closest('.application').application;
    const preset = app.element.querySelector('#preset-select')?.value;
    if (preset && THEMES[preset]) {
      app.theme = THEMES[preset];
      await app.render();
      ui.notifications.info(`Tema ${preset} caricato`);
    }
  }

  static async exportTheme(event, target) {
    const app = target.closest('.application').application;
    const theme = Theme.from(app.theme);
    theme.exportToJson();
    ui.notifications.info('Tema esportato');
  }

  static async importTheme(event, target) {
    const app = target.closest('.application').application;
    const theme = await Theme.importFromJSONDialog();
    if (theme) {
      app.theme = theme;
      await app.render();
      ui.notifications.success('Tema importato con successo');
    }
  }

  static async resetColor(event, target) {
    const button = target;
    const colorInput = button.parentElement.querySelector('input[type="color"]');
    const textInput = button.parentElement.querySelector('input[type="text"]');
    const field = textInput.getAttribute('name');
    const defaultTheme = THEMES.default;

    // Estrai il valore di default
    const keys = field.replace('theme.', '').split('.');
    let defaultValue = defaultTheme;
    for (const key of keys) {
      defaultValue = defaultValue[key];
    }

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
  }

  _updatePreview() {
    // Ottieni i dati del form corrente
    const formElement = this.element.querySelector('form');
    if (!formElement) return;

    const formData = new FormDataExtended(formElement).object;
    const theme = Theme.from(formData.theme || this.theme);
    theme.apply();
  }

  static async formHandler(event, form, formData) {
    // Salva il tema
    await game.settings.set(MODULE, 'theme', formData.theme);

    // Applica immediatamente
    const theme = Theme.from(formData.theme);
    theme.apply();

    // Aggiorna preset selector se è custom
    await game.settings.set(MODULE, 'themePreset', 'custom');

    ui.notifications.success('Tema salvato e applicato');
  }

  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();
    buttons.unshift({
      label: "Reset",
      class: "reset-theme",
      icon: "fas fa-undo",
      onclick: () => {
        this.theme = THEMES.default;
        this.render();
      }
    });
    return buttons;
  }
}