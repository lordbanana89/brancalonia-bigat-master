/* ===================================== */
/* SETTINGS UTILITY */
/* Gestione completa delle impostazioni */
/* ===================================== */

import { MODULE, THEMES } from '../settings.mjs';
import { LogUtil } from './LogUtil.mjs';
import { GeneralUtil } from './GeneralUtil.mjs';

export class SettingsUtil {
  static settings = new Map();
  static menus = new Map();
  static hooks = new Map();
  static gmDefaults = null;

  /**
   * Register all module settings
   */
  static async registerSettings() {
    LogUtil.log("Registering Brancalonia theme settings...");

    // Core theme setting
    await this.register('theme', {
      name: 'BRANCALONIA.Settings.Theme.Name',
      hint: 'BRANCALONIA.Settings.Theme.Hint',
      scope: 'world',
      config: false,
      type: Object,
      default: THEMES.default,
      onChange: value => this.applyTheme(value)
    });

    // Theme preset selector
    await this.register('themePreset', {
      name: 'BRANCALONIA.Settings.ThemePreset.Name',
      hint: 'BRANCALONIA.Settings.ThemePreset.Hint',
      scope: 'client',
      config: true,
      type: String,
      default: 'default',
      choices: {
        default: 'Pergamena Classica',
        taverna: 'Atmosfera Taverna',
        notte: 'Tema Notturno',
        mare: 'Tema Marino',
        custom: 'Personalizzato'
      },
      onChange: value => this.applyPreset(value)
    });

    // Enable/Disable UI
    await this.register('disableUI', {
      name: 'BRANCALONIA.Settings.DisableUI.Name',
      hint: 'BRANCALONIA.Settings.DisableUI.Hint',
      scope: 'client',
      config: true,
      type: Boolean,
      default: false,
      requiresReload: true
    });

    // Debug mode
    await this.register('debugMode', {
      name: 'BRANCALONIA.Settings.Debug.Name',
      hint: 'BRANCALONIA.Settings.Debug.Hint',
      scope: 'client',
      config: true,
      type: Boolean,
      default: false,
      onChange: value => {
        LogUtil.debugOn = value;
        CONFIG.debug.hooks = value;
      }
    });

    // Enforce GM settings
    await this.register('enforceGMSettings', {
      name: 'BRANCALONIA.Settings.EnforceGM.Name',
      hint: 'BRANCALONIA.Settings.EnforceGM.Hint',
      scope: 'world',
      config: game.user?.isGM,
      type: Boolean,
      default: false,
      onChange: value => {
        if (value && game.user?.isGM) {
          this.saveGMDefaults();
        }
      }
    });

    // GM default settings (hidden)
    await this.register('gmDefaultSettings', {
      scope: 'world',
      config: false,
      type: Object,
      default: {}
    });

    // Custom CSS
    await this.register('customCSS', {
      name: 'BRANCALONIA.Settings.CustomCSS.Name',
      hint: 'BRANCALONIA.Settings.CustomCSS.Hint',
      scope: 'world',
      config: false,
      type: String,
      default: '',
      onChange: value => GeneralUtil.addCustomCSS(value, 'brancalonia-custom')
    });

    // Chat styles
    await this.register('enableChatStyles', {
      name: 'BRANCALONIA.Settings.ChatStyles.Name',
      hint: 'BRANCALONIA.Settings.ChatStyles.Hint',
      scope: 'client',
      config: true,
      type: Boolean,
      default: true,
      onChange: value => this.applyChatStyles(value)
    });

    // Apply theme to sheets
    await this.register('applyThemeToSheets', {
      name: 'BRANCALONIA.Settings.SheetTheme.Name',
      hint: 'BRANCALONIA.Settings.SheetTheme.Hint',
      scope: 'client',
      config: true,
      type: Boolean,
      default: true,
      onChange: value => this.applySheetTheme(value)
    });

    // Scene navigation
    await this.register('enhancedSceneNav', {
      name: 'BRANCALONIA.Settings.SceneNav.Name',
      hint: 'BRANCALONIA.Settings.SceneNav.Hint',
      scope: 'client',
      config: true,
      type: Boolean,
      default: true,
      onChange: value => this.applySceneNavigation(value)
    });

    // Players list enhancements
    await this.register('enhancedPlayersList', {
      name: 'BRANCALONIA.Settings.PlayersList.Name',
      hint: 'BRANCALONIA.Settings.PlayersList.Hint',
      scope: 'client',
      config: true,
      type: Boolean,
      default: true,
      onChange: value => this.applyPlayersList(value)
    });

    // Auto-hide interface
    await this.register('autoHideInterface', {
      name: 'BRANCALONIA.Settings.AutoHide.Name',
      hint: 'BRANCALONIA.Settings.AutoHide.Hint',
      scope: 'client',
      config: true,
      type: Boolean,
      default: false,
      onChange: value => this.applyAutoHide(value)
    });

    // UI Scale
    await this.register('uiScale', {
      name: 'BRANCALONIA.Settings.UIScale.Name',
      hint: 'BRANCALONIA.Settings.UIScale.Hint',
      scope: 'client',
      config: true,
      type: Number,
      default: 100,
      range: {
        min: 50,
        max: 150,
        step: 10
      },
      onChange: value => this.applyUIScale(value)
    });

    // Font settings
    await this.register('uiFont', {
      name: 'BRANCALONIA.Settings.UIFont.Name',
      hint: 'BRANCALONIA.Settings.UIFont.Hint',
      scope: 'client',
      config: true,
      type: String,
      default: '',
      onChange: value => this.applyFont('ui', value)
    });

    await this.register('journalFont', {
      name: 'BRANCALONIA.Settings.JournalFont.Name',
      hint: 'BRANCALONIA.Settings.JournalFont.Hint',
      scope: 'client',
      config: true,
      type: String,
      default: '',
      onChange: value => this.applyFont('journal', value)
    });

    // Last version (for migration)
    await this.register('lastVersion', {
      scope: 'world',
      config: false,
      type: String,
      default: '0.0.0'
    });

    // Register settings menus
    this.registerMenus();

    // Register keybindings
    this.registerKeybindings();

    // Apply initial settings
    this.applyAllSettings();
  }

  /**
   * Register a single setting
   */
  static async register(key, data) {
    try {
      await game.settings.register(MODULE, key, {
        name: data.name || '',
        hint: data.hint || '',
        scope: data.scope || 'world',
        config: data.config !== undefined ? data.config : true,
        type: data.type || String,
        default: data.default,
        choices: data.choices,
        range: data.range,
        requiresReload: data.requiresReload || false,
        onChange: data.onChange || (() => {})
      });

      // Store setting data
      this.settings.set(key, data);

      LogUtil.log(`Registered setting: ${key}`);
    } catch (error) {
      LogUtil.error(`Failed to register setting: ${key}`, error);
    }
  }

  /**
   * Register settings menus
   */
  static async registerMenus() {
    // Import menu classes first
    const { ThemeConfig } = await import('../theme-config.mjs');
    const { AdvancedSettings } = await import('../components/AdvancedSettings.mjs');

    // Theme configuration menu
    game.settings.registerMenu(MODULE, 'themeConfig', {
      name: 'BRANCALONIA.Settings.ThemeConfig.Name',
      label: 'BRANCALONIA.Settings.ThemeConfig.Label',
      hint: 'BRANCALONIA.Settings.ThemeConfig.Hint',
      icon: 'fas fa-palette',
      type: ThemeConfig,
      restricted: true
    });

    // Advanced settings menu
    game.settings.registerMenu(MODULE, 'advancedSettings', {
      name: 'BRANCALONIA.Settings.Advanced.Name',
      label: 'BRANCALONIA.Settings.Advanced.Label',
      hint: 'BRANCALONIA.Settings.Advanced.Hint',
      icon: 'fas fa-cogs',
      type: AdvancedSettings,
      restricted: false
    });
  }

  /**
   * Register keybindings
   */
  static registerKeybindings() {
    game.keybindings.register(MODULE, 'toggleInterface', {
      name: 'BRANCALONIA.Keybindings.ToggleInterface',
      hint: 'BRANCALONIA.Keybindings.ToggleInterfaceHint',
      editable: [
        {
          key: '0',
          modifiers: ['Control']
        }
      ],
      onDown: () => {},
      onUp: () => this.toggleInterface(),
      restricted: false
    });

    game.keybindings.register(MODULE, 'quickThemeSwitch', {
      name: 'BRANCALONIA.Keybindings.QuickTheme',
      hint: 'BRANCALONIA.Keybindings.QuickThemeHint',
      editable: [
        {
          key: 'T',
          modifiers: ['Control', 'Shift']
        }
      ],
      onDown: () => {},
      onUp: () => this.quickThemeSwitch(),
      restricted: false
    });
  }

  /**
   * Get a setting value
   */
  static get(key) {
    try {
      return game.settings.get(MODULE, key);
    } catch (error) {
      LogUtil.error(`Failed to get setting: ${key}`, error);
      return this.settings.get(key)?.default;
    }
  }

  /**
   * Set a setting value
   */
  static async set(key, value) {
    try {
      await game.settings.set(MODULE, key, value);
      LogUtil.log(`Setting updated: ${key}`, value);
      return true;
    } catch (error) {
      LogUtil.error(`Failed to set setting: ${key}`, error);
      return false;
    }
  }

  /**
   * Apply all settings on startup
   */
  static applyAllSettings() {
    // Check if UI is disabled
    if (this.get('disableUI')) {
      document.body.classList.remove('brancalonia-theme-active');
      return;
    }

    // Apply each setting
    this.settings.forEach((data, key) => {
      const value = this.get(key);
      if (data.onChange && value !== undefined) {
        data.onChange(value);
      }
    });

    // Enforce GM settings if needed
    if (!game.user?.isGM && this.get('enforceGMSettings')) {
      this.applyGMDefaults();
    }
  }

  /**
   * Apply theme setting
   */
  static async applyTheme(themeData) {
    const { Theme } = await import('../theme.mjs');
    const theme = Theme.from(themeData);
    theme.apply();
  }

  /**
   * Apply theme preset
   */
  static async applyPreset(presetName) {
    if (presetName === 'custom') return;

    if (THEMES[presetName]) {
      await this.set('theme', THEMES[presetName]);
    }
  }

  /**
   * Apply chat styles
   */
  static applyChatStyles(enabled) {
    GeneralUtil.toggleBodyClass('brancalonia-chat-styles', enabled);
  }

  /**
   * Apply sheet theme
   */
  static applySheetTheme(enabled) {
    GeneralUtil.toggleBodyClass('brancalonia-sheet-theme', enabled);
  }

  /**
   * Apply scene navigation
   */
  static applySceneNavigation(enabled) {
    GeneralUtil.toggleBodyClass('brancalonia-scene-nav', enabled);
    ui.nav?.render();
  }

  /**
   * Apply players list
   */
  static applyPlayersList(enabled) {
    GeneralUtil.toggleBodyClass('brancalonia-players-list', enabled);
    ui.players?.render();
  }

  /**
   * Apply auto-hide
   */
  static applyAutoHide(enabled) {
    GeneralUtil.toggleBodyClass('brancalonia-auto-hide', enabled);
  }

  /**
   * Apply UI scale
   */
  static applyUIScale(scale) {
    GeneralUtil.addCSSVars('--brancalonia-ui-scale', `${scale}%`);
    document.documentElement.style.setProperty('font-size', `${scale}%`);
  }

  /**
   * Apply font settings
   */
  static applyFont(type, fontFamily) {
    if (type === 'ui') {
      GeneralUtil.addCSSVars('--brancalonia-font-ui', fontFamily || 'inherit');
    } else if (type === 'journal') {
      GeneralUtil.addCSSVars('--brancalonia-font-journal', fontFamily || 'inherit');
    }
  }

  /**
   * Toggle interface visibility
   */
  static toggleInterface() {
    const ui = document.querySelector('#interface');
    const isHidden = ui?.style.visibility === 'hidden';

    if (isHidden) {
      ui.style.visibility = 'visible';
      document.querySelector('#camera-views')?.style.setProperty('visibility', 'visible');
    } else {
      ui.style.visibility = 'hidden';
      document.querySelector('#camera-views')?.style.setProperty('visibility', 'hidden');
    }
  }

  /**
   * Quick theme switch
   */
  static async quickThemeSwitch() {
    const presets = Object.keys(THEMES);
    const currentPreset = this.get('themePreset');
    const currentIndex = presets.indexOf(currentPreset);
    const nextIndex = (currentIndex + 1) % presets.length;
    const nextPreset = presets[nextIndex];

    await this.set('themePreset', nextPreset);
    ui.notifications.info(`Tema: ${nextPreset}`);
  }

  /**
   * Save GM defaults
   */
  static saveGMDefaults() {
    if (!game.user?.isGM) return;

    const defaults = {};
    this.settings.forEach((data, key) => {
      if (data.scope === 'client') {
        defaults[key] = this.get(key);
      }
    });

    this.set('gmDefaultSettings', defaults);
    ui.notifications.info("Impostazioni GM salvate come default");
  }

  /**
   * Apply GM defaults
   */
  static applyGMDefaults() {
    const defaults = this.get('gmDefaultSettings');
    if (!defaults || Object.keys(defaults).length === 0) return;

    Object.entries(defaults).forEach(([key, value]) => {
      if (this.settings.has(key)) {
        this.set(key, value);
      }
    });

    ui.notifications.info("Impostazioni GM applicate");
  }
}