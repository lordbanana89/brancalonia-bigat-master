/* ===================================== */
/* BRANCALONIA THEME CORE SYSTEM */
/* Basato su architettura Carolingian UI */
/* ===================================== */

import { MODULE } from './settings.mjs';
import { LogUtil } from './utils/LogUtil.mjs';
import { GeneralUtil } from './utils/GeneralUtil.mjs';

/**
 * Core hook definitions for the module
 */
export const HOOKS_CORE = {
  INIT: 'init',
  READY: 'ready',
  RENDER_CHAT_MESSAGE: 'renderChatMessage',
  RENDER_SCENE_CONTROLS: 'renderSceneControls',
  RENDER_PLAYERS_LIST: 'renderPlayersList',
  RENDER_HOTBAR: 'renderHotbar',
  UPDATE_SETTING: 'updateSetting',
  RENDER_APPLICATION: 'renderApplication',
  RENDER_SIDEBAR_TAB: 'renderSidebarTab'
};

/**
 * Main Theme System Manager
 * Gestisce inizializzazione, hooks, e coordinamento di tutti i componenti UI
 */
export class BrancaloniaThemeCore {
  static isInitialized = false;
  static modules = new Map();
  static themeWatcher = null;
  static cachedSettings = new Map();

  /**
   * Initialize the theme system
   * @static
   */
  static init() {
    // Early initialization
    Hooks.once(HOOKS_CORE.INIT, () => {
      LogUtil.log("Brancalonia Theme Core | Initializing...", true);

      // Add module identifier class
      document.querySelector("body").classList.add("brancalonia-theme-active");
      document.querySelector("#ui-middle")?.classList.add("brancalonia-theme");

      // Check Foundry compatibility
      const foundryVersion = game.data.version;
      const minVersion = "13.0.0";
      if (foundryVersion < minVersion) {
        ui.notifications.error("Brancalonia Theme richiede Foundry v13+", { permanent: true });
        return;
      }

      // Initialize global API
      window.brancaloniaTheme = window.brancaloniaTheme || {};
      window.brancaloniaTheme.api = {
        getTheme: () => this.getCurrentTheme(),
        setTheme: (theme) => this.applyTheme(theme),
        registerModule: (module) => this.registerModule(module),
        emit: (event, data) => this.emitEvent(event, data),
        on: (event, handler) => this.addEventListener(event, handler)
      };

      // Register all settings
      this.registerAllSettings();

      // Apply initial theme
      this.applyInitialTheme();

      // Setup all hooks
      this.setupHooks();

      // Initialize UI components
      this.initializeComponents();
    });

    // Ready hook for final setup
    Hooks.once(HOOKS_CORE.READY, () => {
      LogUtil.log("Brancalonia Theme Core | Ready", [game]);

      // Apply localization for CSS
      this.applyCSSLocalization();

      // Check for updates
      this.checkForUpdates();

      // Apply GM settings if enforced
      this.enforceGMSettings();

      // Start theme watcher
      this.startThemeWatcher();

      // Mark as initialized
      this.isInitialized = true;

      // Emit ready event
      this.emitEvent('theme-ready', { version: game.modules.get(MODULE).version });

      ui.notifications.info("Brancalonia Theme System attivo", { console: false });
    });
  }

  /**
   * Register all module settings
   */
  static registerAllSettings() {
    LogUtil.log("Registering theme settings...");

    // Import and register settings from settings util
    import('./utils/SettingsUtil.mjs').then(({ SettingsUtil }) => {
      SettingsUtil.registerSettings();
    });
  }

  /**
   * Apply initial theme on startup
   */
  static applyInitialTheme() {
    import('./theme.mjs').then(({ Theme }) => {
      const themeData = game.settings.get(MODULE, 'theme');
      const theme = Theme.from(themeData);
      theme.apply();

      // Cache current theme
      this.cachedSettings.set('current-theme', theme);
    });
  }

  /**
   * Setup all module hooks
   */
  static setupHooks() {
    // Chat message rendering
    Hooks.on(HOOKS_CORE.RENDER_CHAT_MESSAGE, this.onRenderChatMessage.bind(this));

    // Scene controls
    Hooks.on(HOOKS_CORE.RENDER_SCENE_CONTROLS, this.onRenderSceneControls.bind(this));

    // Players list
    Hooks.on(HOOKS_CORE.RENDER_PLAYERS_LIST, this.onRenderPlayersList.bind(this));

    // Settings updates
    Hooks.on(HOOKS_CORE.UPDATE_SETTING, this.onUpdateSetting.bind(this));

    // Application rendering (for theme injection)
    Hooks.on(HOOKS_CORE.RENDER_APPLICATION, this.onRenderApplication.bind(this));

    // Sidebar tabs
    Hooks.on(HOOKS_CORE.RENDER_SIDEBAR_TAB, this.onRenderSidebarTab.bind(this));
  }

  /**
   * Initialize UI components
   */
  static initializeComponents() {
    // Load components dynamically
    const components = [
      './components/ChatEnhancements.mjs',
      './components/SceneNavigation.mjs',
      './components/PlayersList.mjs',
      './components/SidebarEnhancements.mjs',
      './components/SheetEnhancements.mjs'
    ];

    components.forEach(async (path) => {
      try {
        const module = await import(path);
        const ComponentClass = Object.values(module)[0];
        if (ComponentClass?.init) {
          ComponentClass.init();
          this.modules.set(ComponentClass.name, ComponentClass);
        }
      } catch (error) {
        LogUtil.log(`Failed to load component: ${path}`, error);
      }
    });
  }

  /**
   * Apply CSS localization strings
   */
  static applyCSSLocalization() {
    const locPrefix = 'BRANCALONIA.Theme.';

    // Add localized strings as CSS variables
    const localizations = {
      '--brancalonia-i18n-attack': game.i18n.localize(`${locPrefix}Attack`),
      '--brancalonia-i18n-damage': game.i18n.localize(`${locPrefix}Damage`),
      '--brancalonia-i18n-healing': game.i18n.localize(`${locPrefix}Healing`),
      '--brancalonia-i18n-save': game.i18n.localize(`${locPrefix}Save`),
      '--brancalonia-i18n-check': game.i18n.localize(`${locPrefix}Check`),
      '--brancalonia-i18n-template': game.i18n.localize(`${locPrefix}Template`)
    };

    Object.entries(localizations).forEach(([key, value]) => {
      GeneralUtil.addCSSVars(key, value);
    });
  }

  /**
   * Start theme watcher for live updates
   */
  static startThemeWatcher() {
    // Clear existing watcher
    if (this.themeWatcher) {
      clearInterval(this.themeWatcher);
    }

    // Watch for theme changes every 5 seconds
    this.themeWatcher = setInterval(() => {
      this.checkThemeUpdates();
    }, 5000);
  }

  /**
   * Check for theme updates
   */
  static checkThemeUpdates() {
    const currentTheme = game.settings.get(MODULE, 'theme');
    const cachedTheme = this.cachedSettings.get('current-theme');

    if (JSON.stringify(currentTheme) !== JSON.stringify(cachedTheme?.colors)) {
      LogUtil.log("Theme update detected, applying...");
      this.applyInitialTheme();
    }
  }

  /**
   * Check for module updates
   */
  static async checkForUpdates() {
    // Check if there's a newer version available
    const currentVersion = game.modules.get(MODULE).version;
    const lastVersion = game.settings.get(MODULE, 'lastVersion') || '0.0.0';

    if (currentVersion !== lastVersion) {
      // Show update news
      ui.notifications.info(`Brancalonia Theme aggiornato a v${currentVersion}`);
      game.settings.set(MODULE, 'lastVersion', currentVersion);

      // Run migration if needed
      await this.runMigration(lastVersion, currentVersion);
    }
  }

  /**
   * Run migration between versions
   */
  static async runMigration(fromVersion, toVersion) {
    LogUtil.log(`Running migration from ${fromVersion} to ${toVersion}`);

    // Add migration logic here based on version changes
    if (fromVersion < '4.3.8') {
      // Migrate old theme settings to new format
      await this.migrateOldThemeSettings();
    }
  }

  /**
   * Migrate old theme settings
   */
  static async migrateOldThemeSettings() {
    // Migration logic for old settings
    LogUtil.log("Migrating old theme settings...");
  }

  /**
   * Enforce GM settings to players
   */
  static enforceGMSettings() {
    if (game.user?.isGM) {
      // Save current settings as defaults
      const settings = this.getAllSettings();
      game.settings.set(MODULE, 'gmDefaultSettings', settings);
    } else {
      // Apply GM settings if enforcement is enabled
      const enforceSettings = game.settings.get(MODULE, 'enforceGMSettings');
      if (enforceSettings) {
        const gmSettings = game.settings.get(MODULE, 'gmDefaultSettings');
        if (gmSettings) {
          this.applySettings(gmSettings);
        }
      }
    }
  }

  /**
   * Get all current settings
   */
  static getAllSettings() {
    const settings = {};
    const allSettings = game.settings.settings.entries();

    for (const [key, setting] of allSettings) {
      if (key.startsWith(MODULE)) {
        const settingKey = key.replace(`${MODULE}.`, '');
        settings[settingKey] = game.settings.get(MODULE, settingKey);
      }
    }

    return settings;
  }

  /**
   * Apply a set of settings
   */
  static applySettings(settings) {
    Object.entries(settings).forEach(([key, value]) => {
      try {
        game.settings.set(MODULE, key, value);
      } catch (error) {
        LogUtil.log(`Failed to apply setting ${key}:`, error);
      }
    });
  }

  /**
   * Register a UI module
   */
  static registerModule(module) {
    if (module.name && module.init) {
      this.modules.set(module.name, module);
      module.init();
      LogUtil.log(`Registered module: ${module.name}`);
    }
  }

  /**
   * Get current theme
   */
  static getCurrentTheme() {
    return this.cachedSettings.get('current-theme');
  }

  /**
   * Apply a theme
   */
  static async applyTheme(themeData) {
    const { Theme } = await import('./theme.mjs');
    const theme = Theme.from(themeData);
    theme.apply();
    this.cachedSettings.set('current-theme', theme);
    this.emitEvent('theme-changed', { theme });
  }

  /**
   * Event system
   */
  static events = new Map();

  static addEventListener(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(handler);
  }

  static emitEvent(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(handler => handler(data));
    }
  }

  // Hook handlers
  static onRenderChatMessage(message, html, data) {
    this.modules.get('ChatEnhancements')?.onRenderMessage(message, html, data);
  }

  static onRenderSceneControls(app, html, data) {
    this.modules.get('SceneNavigation')?.onRenderControls(app, html, data);
  }

  static onRenderPlayersList(app, html, data) {
    this.modules.get('PlayersList')?.onRenderList(app, html, data);
  }

  static onUpdateSetting(setting, value) {
    if (setting.key.startsWith(MODULE)) {
      const key = setting.key.replace(`${MODULE}.`, '');
      this.emitEvent('setting-changed', { key, value });

      // Apply setting immediately
      if (key === 'theme') {
        this.applyTheme(value);
      }
    }
  }

  static onRenderApplication(app, html, data) {
    // Inject theme into applications
    if (app.options?.classes?.includes('sheet')) {
      this.modules.get('SheetEnhancements')?.enhanceSheet(app, html, data);
    }
  }

  static onRenderSidebarTab(tab, html, data) {
    this.modules.get('SidebarEnhancements')?.enhanceTab(tab, html, data);
  }
}

// Auto-initialize
BrancaloniaThemeCore.init();