/* ===================================== */
/* ADVANCED SETTINGS DIALOG */
/* Impostazioni avanzate del tema */
/* ===================================== */

import { MODULE } from '../settings.mjs';
import { LogUtil } from '../utils/LogUtil.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class AdvancedSettings extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: 'brancalonia-advanced-settings',
    tag: 'form',
    window: {
      title: 'BRANCALONIA.Settings.Advanced.Title',
      icon: 'fas fa-cogs',
      resizable: true
    },
    position: {
      width: 600,
      height: 400
    },
    form: {
      handler: AdvancedSettings.formHandler,
      submitOnChange: false,
      closeOnSubmit: true
    }
  };

  static PARTS = {
    form: {
      template: 'modules/brancalonia-bigat/templates/advanced-settings.hbs'
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    // Get current settings
    context.debugMode = game.settings.get(MODULE, 'debugMode');
    context.customCSS = game.settings.get(MODULE, 'customCSS') || '';
    context.uiScale = game.settings.get(MODULE, 'uiScale') || 100;
    context.autoHide = game.settings.get(MODULE, 'autoHideInterface');
    context.enforceGM = game.settings.get(MODULE, 'enforceGMSettings');
    context.isGM = game.user?.isGM;

    return context;
  }

  static async formHandler(event, form, formData) {
    LogUtil.log("Advanced settings save", formData);

    try {
      // Save each setting
      await game.settings.set(MODULE, 'debugMode', formData.object.debugMode || false);
      await game.settings.set(MODULE, 'customCSS', formData.object.customCSS || '');
      await game.settings.set(MODULE, 'uiScale', formData.object.uiScale || 100);
      await game.settings.set(MODULE, 'autoHideInterface', formData.object.autoHide || false);

      if (game.user?.isGM) {
        await game.settings.set(MODULE, 'enforceGMSettings', formData.object.enforceGM || false);
      }

      ui.notifications.success('Impostazioni avanzate salvate');
    } catch (error) {
      LogUtil.error('Failed to save advanced settings', error);
      ui.notifications.error('Errore nel salvare le impostazioni');
    }
  }
}