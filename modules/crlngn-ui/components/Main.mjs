import { HOOKS_CORE } from "../constants/Hooks.mjs";
import { LogUtil } from "./LogUtil.mjs";
import { SettingsUtil } from "./SettingsUtil.mjs";
import { TopNavigation } from "./TopNavUtil.mjs";
import { ChatUtil } from "./ChatUtil.mjs";
import { PlayersList } from "./PlayersListUtil.mjs";
import { getSettings } from "../constants/Settings.mjs";
import { LeftControls } from "./LeftControlsUtil.mjs";
import { MODULE_ID } from "../constants/General.mjs";
import { GeneralUtil } from "./GeneralUtil.mjs";
import { ModuleCompatUtil } from "./ModuleCompatUtil.mjs";
import { SceneNavFolders } from "./SceneFoldersUtil.mjs";
import { UpdateNewsUtil } from "./UpdateNewsUtil.mjs";
import { CustomHandlebarsHelpers } from "./CustomHandlebarsHelpers.mjs";
import { CameraDockUtil } from "./CameraDockUtil.mjs";
import { SidebarTabs } from "./SidebarUtil.mjs";
import { MacroHotbar } from "./MacroHotbarUtil.mjs";
import { ChatLogControls } from "./ChatLogControlsUtil.mjs";
import { TokenWheel } from "./TokenWheelUtil.mjs";
import { BrancaloniaCSSOptimizer } from "./BrancaloniaCSSOptimizer.mjs";
import { SheetsUtil } from "./SheetsUtil.mjs";
import { BrancaloniaInitializationManager } from "./BrancaloniaInitializationManager.mjs";
import logger from '../../brancalonia-logger.js';

/**
 * Main class handling core module initialization and setup
 * Manages module lifecycle, hooks, and core functionality
 *
 * Adapted for Brancalonia from Carolingian UI
 * https://github.com/crlngn/crlngn-ui
 */
export class BrancaloniaSettingsMain {
  static isIncompatible = false;
  /**
   * Initialize the module and set up core hooks
   * @static
   */
  static init(){
    Hooks.once(HOOKS_CORE.INIT, async () => {
      document.querySelector("body").classList.add(MODULE_ID);
      document.querySelector("#ui-middle")?.classList.add(MODULE_ID);
      document.querySelector("#ui-left")?.classList.add(MODULE_ID);
      // Add theme-brancalonia class for Brancalonia CSS compatibility
      document.querySelector("body").classList.add("theme-brancalonia");
      document.querySelector("#ui-middle")?.classList.add("theme-brancalonia");
      document.querySelector("#ui-left")?.classList.add("theme-brancalonia");

      // Add notification if Foundry version is incompatible
      const foundryVersion = game.data.version;
      const minVersion = "13.339"; // Updated to latest Carolingian UI requirement
      // Use semantic version comparison instead of lexicographic
      if(!foundry.utils.isNewerVersion(foundryVersion, minVersion) && foundryVersion !== minVersion){
        BrancaloniaSettingsMain.isIncompatible = true;
        ui.notifications?.error(`Brancalonia requires Foundry v${minVersion}+ (current: ${foundryVersion})`);
        return;
      }

      logger.info('BrancaloniaSettingsMain', 'Initializing Brancalonia Settings...', { system: game.system.title });
      window.brancaloniaSettings = window.brancaloniaSettings || {};

      // Esporta riferimenti per coordinamento con altri moduli Brancalonia
      window.brancaloniaSettings.SheetsUtil = SheetsUtil;

      SettingsUtil.registerSettings();
      const SETTINGS = getSettings();
      const uiDisabled = SettingsUtil.get(SETTINGS.disableUI?.tag || 'disableUI');
      LogUtil.log(HOOKS_CORE.INIT,[uiDisabled]);

      if(uiDisabled){
        document.querySelector("body").classList.remove(MODULE_ID);
        document.querySelector("#ui-middle")?.classList.remove(MODULE_ID);
        document.querySelector("#ui-left")?.classList.remove(MODULE_ID);

        return;
      }

      // Check if we're in stream mode
      const isStreamMode = document.body.classList.contains('stream');

      // Initialize Brancalonia System
      await BrancaloniaInitializationManager.initialize();
      
      // Initialize Brancalonia Optimizations
      BrancaloniaCSSOptimizer.optimize();
      BrancaloniaCSSOptimizer.optimizePerformance();
      
      // Always initialize these essential utilities
      ChatUtil.init();
      LogUtil.init?.();
      CameraDockUtil.init();

      // Only initialize UI components if not in stream mode
      if(isStreamMode){
        LogUtil.log("Stream mode detected - skipping UI component initialization");
        return;
      }

      // Initialize remaining UI components for non-stream mode
      ChatLogControls.init();
      PlayersList.init();
      TopNavigation.init();
      LeftControls.init();
      SidebarTabs.init();
      MacroHotbar.init();
      // TokenWheel.init();

      Hooks.on(HOOKS_CORE.RENDER_CHAT_MESSAGE, BrancaloniaSettingsMain.#onRenderChatMessage);
    });

    Hooks.once(HOOKS_CORE.READY, () => {
      logger.info('BrancaloniaSettingsMain', 'Brancalonia Settings Ready', { game: game.id });
      if(BrancaloniaSettingsMain.isIncompatible){
        logger.error('BrancaloniaSettingsMain', 'Foundry VTT version incompatible');
        ui.notifications.error("Brancalonia Settings richiede Foundry VTT v13+", {permanent: true});
        return;
      }

      // Check if we're in stream mode
      const isStreamMode = document.body.classList.contains('stream');
      const SETTINGS = getSettings();

      var isDebugOn = SettingsUtil.get(SETTINGS.debugMode?.tag || 'debugMode');
      if(isDebugOn){CONFIG.debug.hooks = true};

      // Always apply chat styles if enabled
      const chatStylesEnabled = SettingsUtil.get(SETTINGS.enableChatStyles?.tag || 'enableChatStyles');
      if(chatStylesEnabled){
        BrancaloniaSettingsMain.addCSSLocalization();
      }

      // Exit early if in stream mode - skip UI component setup
      if(isStreamMode){
        LogUtil.log("Stream mode - skipping READY hook UI initialization");
        return;
      }

      // Non-stream mode initialization
      CustomHandlebarsHelpers.init();

      // Check TopNavigation availability before calling
      if (typeof TopNavigation?.checkSideBar === 'function') {
        TopNavigation.checkSideBar(ui.sidebar?.expanded || false);
      }

      // Enforce GM settings and refresh components if needed
      const settingsChanged = SettingsUtil.enforceGMSettings();
      if (settingsChanged && typeof TopNavigation?.refreshSettings === 'function') {
        TopNavigation.refreshSettings();
      }

      PlayersList.applyPlayersListSettings();
      // TopNavigation.checkSceneNavCompat();
      ModuleCompatUtil.init();
      UpdateNewsUtil.init();
      SheetsUtil.init();

      SettingsUtil.resetFoundryThemeSettings();

      setTimeout(()=>{
        ui.combat.popout?.close();
      }, 200)

    });
  }

  // Custom labels for DnD5e buttons, added via CSS
  /**
   * Add CSS variables for DnD5e button localization
   * @static
   */
  static addCSSLocalization(){
    const locBtnPath = 'CRLNGN_UI.dnd5e.chatCard.buttons';

    GeneralUtil.addCSSVars('--crlngn-i18n-attack', game.i18n.localize(`${locBtnPath}.attack`));
    GeneralUtil.addCSSVars('--crlngn-i18n-damage', game.i18n.localize(`${locBtnPath}.damage`));
    GeneralUtil.addCSSVars('--crlngn-i18n-summons', game.i18n.localize(`${locBtnPath}.summons`));
    GeneralUtil.addCSSVars('--crlngn-i18n-healing', game.i18n.localize(`${locBtnPath}.healing`));
    GeneralUtil.addCSSVars('--crlngn-i18n-template', game.i18n.localize(`${locBtnPath}.template`));
    GeneralUtil.addCSSVars('--crlngn-i18n-consume', game.i18n.localize(`${locBtnPath}.consume`));
    GeneralUtil.addCSSVars('--crlngn-i18n-refund', game.i18n.localize(`${locBtnPath}.refund`));
    GeneralUtil.addCSSVars('--crlngn-i18n-macro', game.i18n.localize(`${locBtnPath}.macro`));
    GeneralUtil.addCSSVars('--crlngn-i18n-save-dc', game.i18n.localize(`${locBtnPath}.savedc`));
    GeneralUtil.addCSSVars('--crlngn-i18n-save', game.i18n.localize(`${locBtnPath}.save`));
  }

  /**
   * Handle chat message rendering
   * @private
   * @static
   * @param {ChatMessage} chatMessage - The chat message being rendered
   * @param {jQuery} html - The HTML element of the chat message
   */
  static #onRenderChatMessage = (chatMessage, html, data) => {
    LogUtil.log(HOOKS_CORE.RENDER_CHAT_MESSAGE, [chatMessage, html, data]);
    ChatUtil.enrichCard?.(chatMessage, html);
  };

  // Routine SubAgent/Agents rimossa
}