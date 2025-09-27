/**
 * BRANCALONIA V13 UNIFIED FIX
 * Sostituisce tutti i fix sparsi con un unico modulo ottimizzato
 * Compatibile con Foundry v13 e D&D 5e v5.x
 */

console.log("🛡️ Brancalonia V13 Unified Fix - Initializing");

// ============================================
// SEZIONE 1: NAMESPACE FIXES
// ============================================

// Fix namespace deprecati solo se necessario
if (typeof foundry !== 'undefined' && foundry.utils) {
  // Crea alias per namespace spostati in v13
  const namespaceAliases = {
    'SceneNavigation': () => foundry.applications?.ui?.SceneNavigation,
    'Token': () => foundry.canvas?.placeables?.Token,
    'ClientSettings': () => foundry.helpers?.ClientSettings,
    'Canvas': () => foundry.canvas?.Canvas,
    'WallsLayer': () => foundry.canvas?.layers?.WallsLayer,
    'ControlsLayer': () => foundry.canvas?.layers?.ControlsLayer
  };

  for (const [oldName, getNew] of Object.entries(namespaceAliases)) {
    if (!window[oldName]) {
      Object.defineProperty(window, oldName, {
        get: getNew,
        configurable: true
      });
    }
  }

  console.log("✅ Namespace aliases created");
}

// ============================================
// SEZIONE 2: HOOK COMPATIBILITY
// ============================================

Hooks.once("init", () => {
  const dnd5eVersion = game.system?.version || "0";

  // Fix per D&D 5e v5.x
  if (foundry.utils.isNewerVersion(dnd5eVersion, "5.0.0") || dnd5eVersion === "5.0.0") {
    // Hook compatibility per v5.x
    const hookMap = {
      'renderActorSheet5eCharacter': 'renderActorSheetV2',
      'renderActorSheet5eNPC': 'renderActorSheetV2'
    };

    // Redirect vecchi hook ai nuovi
    for (const [oldHook, newHook] of Object.entries(hookMap)) {
      if (Hooks._hooks?.[oldHook]) {
        const oldFunctions = Hooks._hooks[oldHook];
        Hooks._hooks[newHook] = Hooks._hooks[newHook] || [];
        Hooks._hooks[newHook].push(...oldFunctions);
        delete Hooks._hooks[oldHook];
      }
    }
  }

  console.log("✅ Hook compatibility applied");
});

// ============================================
// SEZIONE 3: WARNING SUPPRESSION
// ============================================

// Sopprimi warning non critici
const originalWarn = console.warn;
const suppressedPatterns = [
  'V1 Application framework is deprecated',
  'ApplicationV2',
  'You are accessing the global',
  'is not a registered game setting',
  'custom-dnd5e',
  'renderChatMessage hook is deprecated',
  'ActorSheetMixin',
  'CONFIG.DND5E.spellPreparationModes',
  'CONFIG.DND5E.polymorphSettings'
];

console.warn = function(...args) {
  const message = args.join(' ');

  for (const pattern of suppressedPatterns) {
    if (message.includes(pattern)) {
      return; // Sopprimi silenziosamente
    }
  }

  return originalWarn.apply(console, args);
};

// ============================================
// SEZIONE 4: FIXES CRITICI
// ============================================

// Fix per Canvas._onDragLeftCancel (Power Select Toolkit)
Hooks.once("canvasInit", () => {
  if (Canvas.prototype && !Canvas.prototype._onDragLeftCancel) {
    Canvas.prototype._onDragLeftCancel = function(event) {
      if (this._onCancelDragLeft) {
        return this._onCancelDragLeft(event);
      }
      return false;
    };
    console.log("✅ Canvas drag methods patched");
  }
});

// Fix per getSceneControlButtons (Power Select Toolkit)
Hooks.on("getSceneControlButtons", (controls) => {
  // Se controls non è un array, ritorna array vuoto per sicurezza
  if (!Array.isArray(controls)) {
    console.warn("getSceneControlButtons: controls is not an array, returning empty array");
    return [];
  }

  // Assicura che ogni control.tools sia un array iterabile
  for (let i = 0; i < controls.length; i++) {
    const control = controls[i];
    if (control && control.tools) {
      // Se tools non è un array, convertilo
      if (!Array.isArray(control.tools)) {
        control.tools = Object.values(control.tools || {});
      }
      // Assicura che abbia Symbol.iterator
      if (!control.tools[Symbol.iterator]) {
        control.tools = Array.from(control.tools);
      }
    } else if (control) {
      // Se tools non esiste, crea array vuoto
      control.tools = [];
    }
  }

  // Aggiungi Symbol.iterator al controls stesso se manca
  if (!controls[Symbol.iterator]) {
    Object.defineProperty(controls, Symbol.iterator, {
      value: Array.prototype[Symbol.iterator],
      writable: true,
      configurable: true
    });
  }

  return controls;
});

// ============================================
// SEZIONE 5: GAME SETTINGS SAFETY
// ============================================

// Wrapper sicuro per game.settings.get
if (typeof game !== 'undefined') {
  const originalGet = game.settings?.get;
  if (originalGet) {
    game.settings.get = function(module, key) {
      try {
        return originalGet.call(this, module, key);
      } catch (error) {
        // Return default per settings mancanti
        if (key === 'enableTheme') return true;
        if (key === 'showLoadingScreen') return true;
        if (key.includes('enable')) return false;
        return undefined;
      }
    };
  }
}

// ============================================
// SEZIONE 6: THIRD-PARTY MODULE FIXES
// ============================================

// Fix per Epic Rolls renderChatLog error
Hooks.on("renderChatLog", (app, html, data) => {
  // Assicura che html esista e abbia il metodo find
  if (!html) return;

  // Se è jQuery, assicura che .chat-messages esista
  if (html.jquery && !html.find('.chat-messages').length) {
    const messages = $('<div class="chat-messages"></div>');
    html.append(messages);
  }
  // Se è HTMLElement, assicura che .chat-messages esista
  else if (html instanceof HTMLElement && !html.querySelector('.chat-messages')) {
    const messages = document.createElement('div');
    messages.className = 'chat-messages';
    html.appendChild(messages);
  }
});

// Fix per Tidbits showLoadingScreen
Hooks.on("canvasInit", () => {
  if (game.modules.get("tidbits")?.active) {
    // Crea setting mancante se non esiste
    try {
      game.settings.get("tidbits", "showLoadingScreen");
    } catch (e) {
      // Se non esiste, usa default
      if (window.Tidbits?.config) {
        window.Tidbits.config.showLoadingScreen = false;
      }
    }
  }
});

// ============================================
// SEZIONE 7: THEME APPLICATION
// ============================================

Hooks.once("ready", () => {
  // Applica tema Brancalonia
  document.body.classList.add("theme-brancalonia");

  console.log("✅ Brancalonia V13 Unified Fix - All fixes applied successfully");

  // Cleanup: ripristina console.warn dopo il caricamento
  setTimeout(() => {
    console.warn = originalWarn;
    console.log("✅ Warning suppression disabled");
  }, 5000);
});

console.log("📦 Brancalonia V13 Unified Fix loaded");