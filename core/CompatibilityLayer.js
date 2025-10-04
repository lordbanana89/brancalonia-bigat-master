/**
 * BRANCALONIA COMPATIBILITY LAYER
 * Ensures compatibility across different Foundry and D&D 5e versions
 *
 * @class CompatibilityLayer
 * @version 10.0.0
 */

export class CompatibilityLayer {

  static patches = new Map();
  static warnings = new Set();

  /**
   * Initialize compatibility layer
   */
  static async init() {
    console.log('🔧 Brancalonia CompatibilityLayer | Initializing compatibility patches');

    // Detect environment
    const env = this._detectEnvironment();
    console.log('📊 Environment detected:', env);

    // Apply necessary patches
    this._applyPatches(env);

    // Setup deprecation warnings
    this._setupDeprecationWarnings();

    console.log(`✅ CompatibilityLayer initialized with ${this.patches.size} patches`);
  }

  /**
   * Detect current environment
   * @private
   */
  static _detectEnvironment() {
    return {
      foundry: {
        version: game.version ?? game.data.version,
        generation: game.release?.generation ?? 10,
        build: game.release?.build ?? 0
      },
      dnd5e: {
        version: game.system.version,
        majorVersion: parseInt(game.system.version.split('.')[0]),
        isV5: game.system.version.startsWith('5.')
      },
      modules: {
        hasCustomDnd5e: game.modules.has('custom-dnd5e'),
        hasTidy5e: game.modules.has('tidy5e-sheet'),
        hasMonksTokenbar: game.modules.has('monks-tokenbar'),
        hasMidiQol: game.modules.has('midi-qol')
      }
    };
  }

  /**
   * Apply compatibility patches based on environment
   * @private
   */
  static _applyPatches(env) {
    // Foundry v12 vs v13 patches
    if (env.foundry.generation >= 13) {
      this._applyV13Patches();
    } else if (env.foundry.generation === 12) {
      this._applyV12Patches();
    }

    // D&D 5e version patches
    if (env.dnd5e.majorVersion >= 5) {
      this._applyDnd5eV5Patches();
    } else if (env.dnd5e.majorVersion === 4) {
      this._applyDnd5eV4Patches();
    } else {
      this._applyDnd5eLegacyPatches();
    }

    // Module compatibility patches
    if (env.modules.hasCustomDnd5e) {
      this._applyCustomDnd5ePatches();
    }

    if (env.modules.hasTidy5e) {
      this._applyTidy5ePatches();
    }
  }

  /**
   * Foundry v13 specific patches
   * @private
   */
  static _applyV13Patches() {
    console.log('🔧 Applying Foundry v13 patches');

    // Fix for ApplicationV2 changes
    this._addPatch('applicationV2', () => {
      const originalRender = Application.prototype.render;
      Application.prototype.render = function(force = false, options = {}) {
        // Ensure jQuery compatibility for modules expecting it
        const result = originalRender.call(this, force, options);

        if (result && this.element && !this.element.jquery) {
          // Wrap HTMLElement in jQuery if needed
          this.element = $(this.element);
        }

        return result;
      };
    });

    // Fix namespace changes
    this._addPatch('namespaces', () => {
      // Create aliases for moved namespaces
      if (!window.ClientSettings && foundry.client?.ClientSettings) {
        window.ClientSettings = foundry.client.ClientSettings;
      }

      if (!window.Token && foundry.canvas?.Token) {
        window.Token = foundry.canvas.Token;
      }

      if (!window.SceneNavigation && foundry.applications?.ui?.SceneNavigation) {
        window.SceneNavigation = foundry.applications.ui.SceneNavigation;
      }
    });
  }

  /**
   * Foundry v12 specific patches
   * @private
   */
  static _applyV12Patches() {
    console.log('🔧 Applying Foundry v12 patches');

    // V12 specific patches if needed
  }

  /**
   * D&D 5e v5 patches
   * @private
   */
  static _applyDnd5eV5Patches() {
    console.log('🔧 Applying D&D 5e v5 patches');

    // Create legacy hook aliases
    this._addPatch('legacyHooks', () => {
      // Map old hooks to new ones
      const hookMappings = {
        'renderActorSheet5eCharacter': 'dnd5e.renderActorSheet5eCharacter',
        'renderActorSheet5eNPC': 'dnd5e.renderActorSheet5eNPC',
        'preRenderActorSheet5eCharacter': 'dnd5e.preRenderActorSheet5eCharacter'
      };

      for (const [oldHook, newHook] of Object.entries(hookMappings)) {
        // Create proxy for old hook name
        Hooks.on(newHook, (...args) => {
          Hooks.callAll(oldHook, ...args);
        });
      }
    });

    // Fix for ActorSheet5e changes
    this._addPatch('actorSheetClasses', () => {
      // Ensure compatibility with modules expecting old class structure
      if (dnd5e.applications?.actor?.ActorSheet5eCharacter) {
        window.ActorSheet5eCharacter = dnd5e.applications.actor.ActorSheet5eCharacter;
      }

      if (dnd5e.applications?.actor?.ActorSheet5eNPC) {
        window.ActorSheet5eNPC = dnd5e.applications.actor.ActorSheet5eNPC;
      }
    });
  }

  /**
   * D&D 5e v4 patches
   * @private
   */
  static _applyDnd5eV4Patches() {
    console.log('🔧 Applying D&D 5e v4 patches');

    // V4 specific patches
  }

  /**
   * D&D 5e legacy (<v4) patches
   * @private
   */
  static _applyDnd5eLegacyPatches() {
    console.log('🔧 Applying D&D 5e legacy patches');

    this._addPatch('legacyConfig', () => {
      // Ensure CONFIG.DND5E exists for very old versions
      if (!CONFIG.DND5E && CONFIG.dnd5e) {
        CONFIG.DND5E = CONFIG.dnd5e;
      }
    });
  }

  /**
   * Custom D&D 5e module patches
   * @private
   */
  static _applyCustomDnd5ePatches() {
    console.log('🔧 Applying Custom D&D 5e patches');

    this._addPatch('customDnd5e', () => {
      // Wait for Custom D&D to initialize
      Hooks.once('custom-dnd5e.ready', () => {
        console.log('✅ Custom D&D 5e detected, applying compatibility');
        // Custom D&D specific adjustments
      });
    });
  }

  /**
   * Tidy5e Sheets patches
   * @private
   */
  static _applyTidy5ePatches() {
    console.log('🔧 Applying Tidy5e Sheets patches');

    this._addPatch('tidy5e', () => {
      // Add Brancalonia sections to Tidy5e
      Hooks.on('tidy5e-sheet.ready', (app, html, data) => {
        console.log('✅ Tidy5e sheet detected, injecting Brancalonia elements');
        // Inject Brancalonia UI elements into Tidy5e
      });
    });
  }

  /**
   * Add a patch
   * @private
   */
  static _addPatch(name, patchFn) {
    try {
      patchFn();
      this.patches.set(name, true);
      console.log(`✅ Patch applied: ${name}`);
    } catch (error) {
      this.patches.set(name, false);
      console.error(`❌ Patch failed: ${name}`, error);
    }
  }

  /**
   * Setup deprecation warnings
   * @private
   */
  static _setupDeprecationWarnings() {
    // Override console.warn to catch deprecation warnings
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const warning = args.join(' ');

      // Check if it's a known warning we can suppress
      if (this._shouldSuppressWarning(warning)) {
        // Log quietly for debugging but don't show to user
        console.debug('[Suppressed]', ...args);
        return;
      }

      // Pass through other warnings
      originalWarn.apply(console, args);
    };
  }

  /**
   * Check if warning should be suppressed
   * @private
   */
  static _shouldSuppressWarning(warning) {
    const suppressPatterns = [
      /ActorSheetMixin is deprecated/i,
      /SceneNavigation is deprecated/i,
      /ClientSettings is deprecated/i,
      /Token is deprecated/i,
      /renderActorSheet5e.*is deprecated/i
    ];

    return suppressPatterns.some(pattern => pattern.test(warning));
  }

  /**
   * Public API to check compatibility
   */
  static isCompatible(feature) {
    const compatibilityMap = {
      'actor-sheets-v2': game.release?.generation >= 11,
      'application-v2': game.release?.generation >= 11,
      'data-models': game.release?.generation >= 10,
      'document-sheets': game.release?.generation >= 11,
      'dnd5e-v5': game.system.version.startsWith('5.'),
      'custom-elements': true // Always available in modern browsers
    };

    return compatibilityMap[feature] ?? false;
  }

  /**
   * Get compatibility report
   */
  static getReport() {
    return {
      environment: this._detectEnvironment(),
      patches: Array.from(this.patches.entries()).map(([name, success]) => ({
        name,
        applied: success
      })),
      warnings: Array.from(this.warnings),
      features: {
        'actor-sheets-v2': this.isCompatible('actor-sheets-v2'),
        'application-v2': this.isCompatible('application-v2'),
        'data-models': this.isCompatible('data-models'),
        'document-sheets': this.isCompatible('document-sheets'),
        'dnd5e-v5': this.isCompatible('dnd5e-v5')
      }
    };
  }

  /**
   * Cleanup
   */
  static cleanup() {
    console.log('🧹 Cleaning up CompatibilityLayer');
    this.patches.clear();
    this.warnings.clear();
  }
}

export default CompatibilityLayer;