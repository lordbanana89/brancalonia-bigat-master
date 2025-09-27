/* ===================================== */
/* BRANCALONIA THEME CONFIGURATION */
/* Interfaccia configurazione tema */
/* ===================================== */

import { Theme } from './theme.mjs';
import { MODULE, THEMES } from './settings.mjs';

// Usa ApplicationV2 con HandlebarsApplicationMixin per compatibilità con Foundry V13+
export class ThemeConfig extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  constructor(options = {}) {
    super(options);
    this.theme = game.settings.get(MODULE, 'theme');
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
    app._activeTab = tabName;
  }

  _onRender(context, options) {
    super._onRender(context, options);

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
          this._updatePreview();
        });

        // Quando cambia il text, aggiorna il color picker (se valido)
        textInput.addEventListener('input', (e) => {
          const value = e.target.value;
          if (/^#[0-9A-F]{6}$/i.test(value)) {
            colorInput.value = value;
          }
          this._updatePreview();
        });
      }
    });
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
    // Estrai i dati dal form
    const themeData = {
      colors: {},
      images: {},
      advanced: formData.object['theme.advanced'] || ''
    };

    // Estrai i colori
    for (const [key, value] of Object.entries(formData.object)) {
      if (key.startsWith('theme.colors.')) {
        const colorKey = key.replace('theme.colors.', '');
        themeData.colors[colorKey] = value;
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