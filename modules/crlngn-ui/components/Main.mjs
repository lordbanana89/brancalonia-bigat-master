/**
 * Brancalonia Settings System - Main Entry Point
 *
 * Adapted from Carolingian UI (https://github.com/crlngn/crlngn-ui)
 * Copyright (c) 2024 Carolingian - MIT License
 * Modified for Brancalonia 2025
 */

import { HOOKS_CORE } from "../constants/Hooks.mjs";
import { LogUtil } from "./LogUtil.mjs";
import { SettingsUtil } from "./SettingsUtil.mjs";
import { SheetsUtil } from "./SheetsUtil.mjs";
import { ChatUtil } from "./ChatUtil.mjs";
import { getSettings } from "../constants/Settings.mjs";
import { MODULE_ID } from "../constants/General.mjs";
import { ModuleCompatUtil } from "./ModuleCompatUtil.mjs";

/**
 * Main class handling Brancalonia settings initialization
 */
export class BrancaloniaSettingsMain {
  static isIncompatible = false;

  /**
   * Initialize the settings system
   */
  static init() {
    Hooks.once(HOOKS_CORE.INIT, () => {
      // Add module identifier class to body
      document.querySelector("body").classList.add(MODULE_ID);

      // Check Foundry version compatibility
      const foundryVersion = game.data.version;
      const minVersion = "13.0.0";
      if (foundryVersion < minVersion) {
        BrancaloniaSettingsMain.isIncompatible = true;
        return;
      }

      LogUtil.log("Brancalonia Settings | Initializing...", [game.system.title], true);
      window.brancaloniaSettings = window.brancaloniaSettings || {};

      // Register all settings
      SettingsUtil.registerSettings();
      const SETTINGS = getSettings();
      const uiDisabled = SettingsUtil.get(SETTINGS.disableUI?.tag || 'disableUI');
      LogUtil.log(HOOKS_CORE.INIT, [uiDisabled]);

      if (uiDisabled) {
        document.querySelector("body").classList.remove(MODULE_ID);
        return;
      }

      // Initialize essential utilities
      ChatUtil.init();
      LogUtil.init?.();
      ModuleCompatUtil.init();

      Hooks.on(HOOKS_CORE.RENDER_CHAT_MESSAGE, BrancaloniaSettingsMain.#onRenderChatMessage);
    });

    Hooks.once(HOOKS_CORE.READY, () => {
      LogUtil.log("Brancalonia Settings | Ready", [game]);

      if (BrancaloniaSettingsMain.isIncompatible) {
        ui.notifications.error("Brancalonia richiede Foundry VTT v13+", { permanent: true });
        return;
      }

      const SETTINGS = getSettings();
      const isDebugOn = SettingsUtil.get(SETTINGS.debugMode?.tag || 'debugMode');
      if (isDebugOn) {
        CONFIG.debug.hooks = true;
      }

      // Apply theme settings
      SettingsUtil.applyThemeSettings?.();
      SettingsUtil.applyCustomCSS?.();
      SettingsUtil.applyModuleAdjustments?.();

      // Apply chat styles
      SettingsUtil.applyChatStyles?.();

      // Apply sheet theme if enabled
      const applyThemeToSheets = SettingsUtil.get(SETTINGS.applyThemeToSheets?.tag || 'applyThemeToSheets');
      SheetsUtil.applyThemeToSheets?.(applyThemeToSheets);

      console.log('✅ Brancalonia Settings System | Initialized');
    });
  }

  /**
   * Handle chat message rendering
   */
  static #onRenderChatMessage = (chatMessage, html, data) => {
    LogUtil.log(HOOKS_CORE.RENDER_CHAT_MESSAGE, [chatMessage, html, data]);
    ChatUtil.enrichCard?.(chatMessage, html);
  };
}

// Auto-initialize when module loads
BrancaloniaSettingsMain.init();