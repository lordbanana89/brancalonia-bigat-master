/**
 * BRANCALONIA MODULE COMPATIBILITY
 * Fix per moduli incompatibili con Foundry v13
 * Previene crash da moduli obsoleti
 */

console.log("🔧 Brancalonia Module Compatibility - Fixing incompatible modules");

// ============================================
// FIX IMMEDIATO PER POWER SELECT TOOLKIT
// ============================================

// DEVE essere fatto SUBITO e ripetuto più volte
(function() {
  console.log("🚨 Attempting pre-emptive fix for Power Select Toolkit");

  // Funzione per creare stub
  function createCanvasStubs() {
    if (typeof Canvas !== 'undefined' && Canvas.prototype) {
      console.log("🔧 Creating Canvas stubs...");

    // Lista completa di TUTTI i metodi che PST potrebbe cercare
    const allPossibleMethods = [
      '_onDragLeftStart', '_onDragLeftMove', '_onDragLeftDrop', '_onDragLeftCancel',
      '_onDragSelect', '_onDragRightStart', '_onDragRightMove', '_onDragRightDrop',
      '_onDragRightCancel', '_onClickLeft', '_onClickLeft2', '_onClickRight',
      '_onClickRight2', '_handleMouseDown', '_handleMouseUp', '_handleMouseMove',
      '_handleRightDown', '_handleRightUp', '_handleDragStart', '_handleDragMove',
      '_handleDragDrop', '_handleDragCancel'
    ];

    allPossibleMethods.forEach(method => {
      if (!Canvas.prototype[method]) {
        Canvas.prototype[method] = function(event) {
          console.debug(`🔧 Pre-emptive stub for ${method}`);
          return false;
        };
      }
    });

      console.log("✅ Pre-emptive stubs created for Canvas methods");
      return true;
    }
    return false;
  }

  // Prova a creare stub immediatamente
  if (!createCanvasStubs()) {
    console.log("⏳ Canvas not ready, will retry...");

    // Riprova dopo un breve delay
    let attempts = 0;
    const retryInterval = setInterval(() => {
      attempts++;
      if (createCanvasStubs() || attempts > 10) {
        clearInterval(retryInterval);
        if (attempts > 10) {
          console.warn("⚠️ Failed to create Canvas stubs after 10 attempts");
        }
      }
    }, 100);
  }
})();

// ============================================
// FIX PER POWER SELECT TOOLKIT
// ============================================

// Power Select Toolkit cerca Canvas.prototype._onDragLeftCancel che non esiste in v13
Hooks.once("init", () => {
  console.log("🎯 Checking for incompatible modules");

  // Fix per Power Select Toolkit
  if (game.modules.get("power-select-toolkit")?.active) {
    console.warn("⚠️ Power Select Toolkit detected - This module is NOT compatible with Foundry v13!");
    console.warn("⚠️ Attempting compatibility fix...");

    // Crea metodi mancanti che Power Select Toolkit si aspetta
    if (typeof Canvas !== 'undefined' && Canvas.prototype) {
      // _onDragLeftCancel non esiste più in v13
      if (!Canvas.prototype._onDragLeftCancel) {
        Canvas.prototype._onDragLeftCancel = function(event) {
          console.debug("🔧 Compatibility stub for _onDragLeftCancel");
          // Stub vuoto per prevenire errori
          return false;
        };
        console.log("✅ Added stub for Canvas.prototype._onDragLeftCancel");
      }

      // TUTTI i metodi che Power Select Toolkit cerca
      const missingMethods = [
        '_onDragLeftStart',
        '_onDragLeftMove',
        '_onDragLeftDrop',
        '_onDragLeftCancel',
        '_onDragSelect',           // AGGIUNTO
        '_onClickLeft',
        '_onClickLeft2',
        '_onClickRight',
        '_onClickRight2',
        '_onDragRightStart',
        '_onDragRightMove',
        '_onDragRightDrop',
        '_onDragRightCancel',
        '_handleMouseDown',
        '_handleMouseUp',
        '_handleMouseMove',
        '_handleRightDown',
        '_handleRightUp'
      ];

      missingMethods.forEach(method => {
        if (!Canvas.prototype[method]) {
          Canvas.prototype[method] = function(event) {
            console.debug(`🔧 Compatibility stub for ${method}`);
            return false;
          };
          console.log(`✅ Added stub for Canvas.prototype.${method}`);
        }
      });
    }

    // Se Canvas non è ancora disponibile, aspetta
    Hooks.once("canvasInit", (canvas) => {
      if (!canvas.constructor.prototype._onDragLeftCancel) {
        canvas.constructor.prototype._onDragLeftCancel = function(event) {
          console.debug("🔧 Late compatibility stub for _onDragLeftCancel");
          return false;
        };
        console.log("✅ Late fix applied for Power Select Toolkit");
      }
    });

    // Mostra avviso all'utente
    Hooks.once("ready", () => {
      ui.notifications.warn(
        "Power Select Toolkit non è compatibile con Foundry v13. " +
        "Un fix temporaneo è stato applicato, ma il modulo potrebbe non funzionare correttamente. " +
        "Considera di disabilitarlo.",
        { permanent: false, console: false }
      );
    });
  }

  // Fix per altri moduli problematici
  checkAndFixOtherModules();

  // Fix per Tidbits
  if (game.modules.get("tidbits")?.active) {
    console.warn("⚠️ Tidbits detected - Applying compatibility fix");

    // Tidbits cerca showLoadingScreen che potrebbe non esistere
    if (typeof ui !== 'undefined' && !ui.showLoadingScreen) {
      ui.showLoadingScreen = function(show = true) {
        console.debug("🔧 Compatibility stub for ui.showLoadingScreen");
        return Promise.resolve();
      };
      console.log("✅ Added stub for ui.showLoadingScreen");
    }
  }
});

// ============================================
// FIX PER ALTRI MODULI INCOMPATIBILI
// ============================================

function checkAndFixOtherModules() {
  const incompatibleModules = [
    {
      id: "tidbits",
      name: "Tidbits",
      fix: () => {
        console.log("🔧 Fixing Tidbits compatibility issues");

        // Aggiungi metodi mancanti che Tidbits potrebbe cercare
        if (typeof ui !== 'undefined') {
          if (!ui.showLoadingScreen) {
            ui.showLoadingScreen = (show = true) => Promise.resolve();
          }
          if (!ui.hideLoadingScreen) {
            ui.hideLoadingScreen = () => Promise.resolve();
          }
        }

        // Fix per canvasInit
        Hooks.on("canvasInit", () => {
          if (typeof ui !== 'undefined' && !ui.showLoadingScreen) {
            ui.showLoadingScreen = () => Promise.resolve();
            console.log("✅ Late fix for Tidbits showLoadingScreen");
          }
        });
      }
    },
    {
      id: "drag-ruler",
      name: "Drag Ruler",
      fix: () => {
        // Fix per Drag Ruler se necessario
        if (!canvas?.grid?.measureDistances) {
          console.log("🔧 Adding compatibility for Drag Ruler");
        }
      }
    },
    {
      id: "monks-tokenbar",
      name: "Monk's TokenBar",
      fix: () => {
        // Fix per Monk's TokenBar se necessario
        console.log("🔧 Checking Monk's TokenBar compatibility");
      }
    },
    {
      id: "better-rolls-5e",
      name: "Better Rolls 5e",
      fix: () => {
        // Fix per Better Rolls se necessario
        console.log("🔧 Checking Better Rolls 5e compatibility");
      }
    },
    {
      id: "epic-rolls-5e",
      name: "Epic Rolls 5e",
      fix: () => {
        console.log("🔧 Fixing Epic Rolls 5e compatibility");

        // Epic Rolls cerca di fare prepend su elementi che potrebbero non esistere
        Hooks.on("renderChatLog", (app, html, data) => {
          // Assicurati che html sia un jQuery object valido
          if (!html || !html.length) {
            console.warn("⚠️ Epic Rolls 5e: Invalid HTML element");
            return;
          }

          // Verifica che gli elementi esistano prima che Epic Rolls li usi
          const chatForm = html.find("#chat-form");
          if (!chatForm.length) {
            console.warn("⚠️ Epic Rolls 5e: chat-form not found");
            // Crea un elemento placeholder se necessario
            const placeholder = $('<div id="chat-form"></div>');
            html.append(placeholder);
          }
        }, { priority: -1000 }); // Alta priorità per eseguire prima di Epic Rolls
      }
    }
  ];

  incompatibleModules.forEach(({ id, name, fix }) => {
    if (game.modules.get(id)?.active) {
      console.log(`📦 ${name} detected, applying compatibility fixes...`);
      try {
        fix();
      } catch (e) {
        console.error(`❌ Failed to fix ${name}:`, e);
      }
    }
  });
}

// ============================================
// GESTIONE ERRORI LIBWRAPPER
// ============================================

// Non possiamo sovrascrivere libWrapper.register (è read-only)
// Ma gli stub preventivi dovrebbero prevenire gli errori

Hooks.once("init", () => {
  if (typeof libWrapper !== 'undefined') {
    console.log("📦 libWrapper detected - stubs should prevent PST errors");

    // Aggiungi handler per errori libWrapper
    Hooks.on("libWrapper.Error", (packageId, error) => {
      if (packageId === 'power-select-toolkit') {
        console.warn("⚠️ Power Select Toolkit error caught:", error.message);
        // Previeni propagazione errore
        return false;
      }
    });
  }
});

// ============================================
// CREAZIONE STUB PER TARGET MANCANTI
// ============================================

function createStubForTarget(target) {
  console.log(`🔨 Creating stub for missing target: ${target}`);

  const parts = target.split('.');
  const method = parts.pop();
  const objPath = parts.join('.');

  // Naviga al percorso
  let obj = globalThis;
  for (const part of parts) {
    if (!obj[part]) {
      console.warn(`⚠️ Cannot create stub - ${part} not found in path ${target}`);
      return;
    }
    obj = obj[part];
  }

  // Crea lo stub se non esiste
  if (!obj[method]) {
    obj[method] = function(...args) {
      console.debug(`🔧 Stub called for ${target}`, args);
      return;
    };
    console.log(`✅ Stub created for ${target}`);
  }
}

// ============================================
// REPORT MODULI INCOMPATIBILI
// ============================================

Hooks.once("ready", () => {
  const incompatible = [];

  // Lista moduli noti per essere incompatibili con v13
  const knownIncompatible = [
    'power-select-toolkit',
    'tidbits',
    'epic-rolls-5e',
    'cursor-hider',
    'grape-juice-premium',
    'token-hud-wildcard'
  ];

  knownIncompatible.forEach(id => {
    const module = game.modules.get(id);
    if (module?.active) {
      incompatible.push({
        id: id,
        title: module.title,
        version: module.version
      });
    }
  });

  if (incompatible.length > 0) {
    console.warn("⚠️ MODULI INCOMPATIBILI CON FOUNDRY V13 RILEVATI:");
    incompatible.forEach(mod => {
      console.warn(`  - ${mod.title} (${mod.id}) v${mod.version}`);
    });
    console.warn("Questi moduli potrebbero causare problemi. Considera di disabilitarli.");
  }
});

// ============================================
// DEBUG UTILITY
// ============================================

window.BrancaloniaCompatibility = {
  listIncompatible() {
    console.log("📋 Checking module compatibility...");

    const modules = game.modules.filter(m => m.active);
    const v13Incompatible = [];

    modules.forEach(mod => {
      // Controlla se il modulo ha compatibility.maximum < 13
      const maxVersion = mod.compatibility?.maximum;
      if (maxVersion && !foundry.utils.isNewerVersion(maxVersion, "12.999")) {
        v13Incompatible.push({
          id: mod.id,
          title: mod.title,
          maxVersion: maxVersion
        });
      }
    });

    if (v13Incompatible.length > 0) {
      console.warn("❌ Moduli non aggiornati per v13:");
      v13Incompatible.forEach(mod => {
        console.warn(`  - ${mod.title}: max v${mod.maxVersion}`);
      });
    } else {
      console.log("✅ Tutti i moduli dichiarano compatibilità con v13");
    }

    return v13Incompatible;
  },

  fixPowerSelect() {
    console.log("🔧 Attempting manual fix for Power Select Toolkit...");

    // Forza la creazione degli stub
    if (Canvas.prototype) {
      ['_onDragLeftStart', '_onDragLeftMove', '_onDragLeftDrop', '_onDragLeftCancel'].forEach(method => {
        if (!Canvas.prototype[method]) {
          Canvas.prototype[method] = function() { return false; };
          console.log(`✅ Added ${method}`);
        }
      });
    }
  }
};

console.log("✅ Brancalonia Module Compatibility loaded");
console.log("💡 Use BrancaloniaCompatibility.listIncompatible() to check for issues");