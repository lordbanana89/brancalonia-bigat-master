/* ===================================== */
/* BRANCALONIA THEME CONFIGURATION */
/* Interfaccia configurazione tema */
/* ===================================== */

import { Theme } from './theme.mjs';
import { MODULE, THEMES } from './settings.mjs';

export class ThemeConfig extends FormApplication {
  constructor(options = {}) {
    super(options);
    this.theme = game.settings.get(MODULE, 'theme');
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'brancalonia-theme-config',
      title: 'Configurazione Tema Brancalonia',
      template: 'modules/brancalonia-bigat/templates/theme-config.hbs',
      width: 600,
      height: 'auto',
      tabs: [{ navSelector: '.tabs', contentSelector: '.content', initial: 'colors' }],
      closeOnSubmit: true
    });
  }

  getData() {
    return {
      theme: this.theme,
      presets: Object.keys(THEMES).map(key => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1)
      }))
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Carica preset
    html.find('.load-preset').click(ev => {
      const preset = html.find('#preset-select').val();
      if (THEMES[preset]) {
        this.theme = THEMES[preset];
        this.render();
        ui.notifications.info(`Tema ${preset} caricato`);
      }
    });

    // Esporta tema
    html.find('.export-theme').click(ev => {
      const theme = Theme.from(this.theme);
      theme.exportToJson();
      ui.notifications.info('Tema esportato');
    });

    // Importa tema
    html.find('.import-theme').click(async ev => {
      const theme = await Theme.importFromJSONDialog();
      if (theme) {
        this.theme = theme;
        this.render();
        ui.notifications.success('Tema importato con successo');
      }
    });

    // Anteprima live
    html.find('input[type="color"]').on('input', ev => {
      this._updatePreview();
    });

    // Reset colore
    html.find('.reset-color').click(ev => {
      const input = $(ev.currentTarget).siblings('input');
      const field = input.attr('name');
      const defaultTheme = THEMES.default;

      // Estrai il valore di default
      const keys = field.replace('theme.', '').split('.');
      let defaultValue = defaultTheme;
      for (const key of keys) {
        defaultValue = defaultValue[key];
      }

      input.val(defaultValue);
      this._updatePreview();
    });
  }

  _updatePreview() {
    // Aggiorna preview in tempo reale
    const formData = this._getSubmitData();
    const theme = Theme.from(formData.theme);
    theme.apply();
  }

  async _updateObject(event, formData) {
    // Salva il tema
    await game.settings.set(MODULE, 'theme', formData.theme);

    // Applica immediatamente
    const theme = Theme.from(formData.theme);
    theme.apply();

    // Aggiorna preset selector se è custom
    await game.settings.set(MODULE, 'themePreset', 'custom');

    ui.notifications.success('Tema salvato e applicato');
  }
}