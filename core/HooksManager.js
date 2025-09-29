/**
 * BRANCALONIA HOOKS MANAGER
 * Centralized hooks management with version compatibility
 *
 * @class HooksManager
 * @version 10.0.0
 */

export class HooksManager {

  static hooks = new Map();
  static listeners = new Map();
  static dnd5eVersion = null;
  static isV5 = false;

  /**
   * Initialize hooks system
   */
  static async init() {
    console.log('🎣 Brancalonia HooksManager | Initializing hooks system');

    // Detect D&D 5e version
    this.dnd5eVersion = game.system.version;
    this.isV5 = foundry.utils.isNewerVersion(this.dnd5eVersion, "5.0.0") ||
                this.dnd5eVersion.startsWith("5.");

    console.log(`📊 D&D 5e version detected: ${this.dnd5eVersion} (v5: ${this.isV5})`);

    // Register appropriate hooks based on version
    if (this.isV5) {
      this._registerV5Hooks();
    } else {
      this._registerLegacyHooks();
    }

    // Register universal hooks (work on all versions)
    this._registerUniversalHooks();

    console.log(`✅ HooksManager initialized with ${this.hooks.size} hooks registered`);
  }

  /**
   * Register D&D 5e v5+ hooks
   * @private
   */
  static _registerV5Hooks() {
    console.log('🔄 Registering D&D 5e v5 hooks');

    // Actor Sheet rendering - V5 uses different hook structure
    this._registerHook('renderApplication', (app, html, data) => {
      // Check if this is an actor sheet
      if (app.document?.documentName === 'Actor') {
        const actorType = app.document.type;

        // Determine sheet type and call appropriate handler
        if (actorType === 'character') {
          this._callHandlers('renderActorSheetCharacter', app, html, data);
        } else if (actorType === 'npc') {
          this._callHandlers('renderActorSheetNPC', app, html, data);
        }

        // Generic actor sheet handler
        this._callHandlers('renderActorSheet', app, html, data);
      }
    });

    // Pre-render hooks
    this._registerHook('preRenderApplication', (app, html, data) => {
      if (app.document?.documentName === 'Actor') {
        const actorType = app.document.type;

        if (actorType === 'character') {
          this._callHandlers('preRenderActorSheetCharacter', app, html, data);
        }
      }
    });

    // Document lifecycle hooks - V5 specific
    this._registerHook('createDocument', (document, options, userId) => {
      if (document.documentName === 'Actor') {
        this._callHandlers('createActor', document, options, userId);
      } else if (document.documentName === 'Item') {
        this._callHandlers('createItem', document, options, userId);
      }
    });

    this._registerHook('updateDocument', (document, changes, options, userId) => {
      if (document.documentName === 'Actor') {
        this._callHandlers('updateActor', document, changes, options, userId);
      } else if (document.documentName === 'Item') {
        this._callHandlers('updateItem', document, changes, options, userId);
      }
    });

    this._registerHook('deleteDocument', (document, options, userId) => {
      if (document.documentName === 'Actor') {
        this._callHandlers('deleteActor', document, options, userId);
      } else if (document.documentName === 'Item') {
        this._callHandlers('deleteItem', document, options, userId);
      }
    });
  }

  /**
   * Register legacy D&D 5e hooks (v3/v4)
   * @private
   */
  static _registerLegacyHooks() {
    console.log('🔄 Registering legacy D&D 5e hooks');

    // Direct hook mapping for legacy versions
    const legacyHooks = [
      'renderActorSheet5eCharacter',
      'renderActorSheet5eNPC',
      'preRenderActorSheet5eCharacter',
      'createActor',
      'updateActor',
      'deleteActor',
      'createItem',
      'updateItem',
      'deleteItem'
    ];

    legacyHooks.forEach(hookName => {
      this._registerHook(hookName, (...args) => {
        // Map legacy hook to standardized name
        const standardName = hookName
          .replace('5e', '')
          .replace('Character', 'Character')
          .replace('NPC', 'NPC');

        this._callHandlers(standardName, ...args);
      });
    });
  }

  /**
   * Register universal hooks that work on all versions
   * @private
   */
  static _registerUniversalHooks() {
    console.log('🔄 Registering universal hooks');

    // System ready
    this._registerHook('ready', () => {
      this._callHandlers('brancaloniaReady');
      this._applyThemeClass();
      this._checkSheetCompatibility();
    });

    // Canvas ready
    this._registerHook('canvasReady', (canvas) => {
      this._callHandlers('canvasReady', canvas);
    });

    // Combat hooks
    this._registerHook('combatStart', (combat) => {
      this._callHandlers('combatStart', combat);
    });

    this._registerHook('combatRound', (combat) => {
      this._callHandlers('combatRound', combat);
    });

    this._registerHook('combatTurn', (combat) => {
      this._callHandlers('combatTurn', combat);
    });

    // Chat message
    this._registerHook('createChatMessage', (message, options, userId) => {
      this._callHandlers('createChatMessage', message, options, userId);
    });

    // Settings
    this._registerHook('renderSettingsConfig', (app, html, data) => {
      this._callHandlers('renderSettingsConfig', app, html, data);
    });
  }

  /**
   * Register a Foundry hook
   * @private
   */
  static _registerHook(hookName, handler) {
    const hookId = Hooks.on(hookName, handler);
    this.hooks.set(hookName, hookId);
  }

  /**
   * Call all registered handlers for a hook
   * @private
   */
  static _callHandlers(handlerName, ...args) {
    const handlers = this.listeners.get(handlerName) ?? [];

    for (const handler of handlers) {
      try {
        handler(...args);
      } catch (error) {
        console.error(`❌ Error in Brancalonia handler ${handlerName}:`, error);
      }
    }
  }

  /**
   * Public API to register a handler
   * @param {string} hookName - Standardized hook name
   * @param {Function} handler - Handler function
   */
  static on(hookName, handler) {
    if (!this.listeners.has(hookName)) {
      this.listeners.set(hookName, []);
    }

    this.listeners.get(hookName).push(handler);

    return {
      off: () => this.off(hookName, handler)
    };
  }

  /**
   * Remove a handler
   */
  static off(hookName, handler) {
    const handlers = this.listeners.get(hookName);
    if (!handlers) return;

    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Apply theme class to body
   * @private
   */
  static _applyThemeClass() {
    const isEnabled = game.settings.get('brancalonia-bigat', 'themeEnabled') ?? true;

    if (isEnabled) {
      document.body.classList.add('brancalonia-theme');
      console.log('🎨 Brancalonia theme class applied');
    }
  }

  /**
   * Check sheet compatibility
   * @private
   */
  static _checkSheetCompatibility() {
    // Add brancalonia-sheet class to all actor sheets
    document.querySelectorAll('.dnd5e.sheet.actor').forEach(sheet => {
      sheet.classList.add('brancalonia-sheet');
    });

    // Monitor for new sheets
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.classList?.contains('dnd5e') && node.classList?.contains('sheet')) {
            node.classList.add('brancalonia-sheet');
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Get diagnostics information
   */
  static getDiagnostics() {
    return {
      dnd5eVersion: this.dnd5eVersion,
      isV5: this.isV5,
      registeredHooks: Array.from(this.hooks.keys()),
      listenerCount: Array.from(this.listeners.entries()).map(([name, handlers]) => ({
        name,
        count: handlers.length
      }))
    };
  }

  /**
   * Cleanup hooks
   */
  static cleanup() {
    console.log('🧹 Cleaning up HooksManager');

    // Remove all Foundry hooks
    for (const [hookName, hookId] of this.hooks.entries()) {
      Hooks.off(hookName, hookId);
    }

    // Clear internal maps
    this.hooks.clear();
    this.listeners.clear();
  }
}

// Standardized hook names for public API
HooksManager.HOOKS = {
  // Actor sheets
  RENDER_ACTOR_SHEET: 'renderActorSheet',
  RENDER_ACTOR_SHEET_CHARACTER: 'renderActorSheetCharacter',
  RENDER_ACTOR_SHEET_NPC: 'renderActorSheetNPC',
  PRE_RENDER_ACTOR_SHEET_CHARACTER: 'preRenderActorSheetCharacter',

  // Documents
  CREATE_ACTOR: 'createActor',
  UPDATE_ACTOR: 'updateActor',
  DELETE_ACTOR: 'deleteActor',
  CREATE_ITEM: 'createItem',
  UPDATE_ITEM: 'updateItem',
  DELETE_ITEM: 'deleteItem',

  // System
  BRANCALONIA_READY: 'brancaloniaReady',
  CANVAS_READY: 'canvasReady',

  // Combat
  COMBAT_START: 'combatStart',
  COMBAT_ROUND: 'combatRound',
  COMBAT_TURN: 'combatTurn',

  // Chat
  CREATE_CHAT_MESSAGE: 'createChatMessage',

  // Settings
  RENDER_SETTINGS: 'renderSettingsConfig'
};

export default HooksManager;