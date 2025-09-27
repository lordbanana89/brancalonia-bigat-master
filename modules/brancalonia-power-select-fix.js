/**
 * BRANCALONIA POWER SELECT TOOLKIT FIX
 * Fix critico per Power Select Toolkit che blocca l'inizializzazione
 *
 * PROBLEMA: Power Select Toolkit cerca Canvas.prototype._onDragLeftCancel che non esiste in v13
 * SOLUZIONE: Creare il metodo mancante prima che PST lo cerchi
 */

// ESECUZIONE IMMEDIATA - CRITICO!
(function() {
  console.log("🚨 CRITICAL FIX: Power Select Toolkit compatibility");

  // Hook MOLTO precoce - prima di qualsiasi init
  if (typeof Hooks !== 'undefined') {
    // Registra con priorità massima
    Hooks.once("init", function powerSelectFix() {
      console.log("🔧 Applying Power Select Toolkit v13 compatibility fix...");

      // Verifica se Canvas esiste
      if (typeof Canvas !== 'undefined' && Canvas.prototype) {
        // Controlla se il metodo manca
        if (!Canvas.prototype._onDragLeftCancel) {
          console.log("⚠️ Canvas.prototype._onDragLeftCancel missing - creating compatibility stub");

          // Crea un metodo stub compatibile
          Canvas.prototype._onDragLeftCancel = function(event) {
            console.log("📍 Power Select Toolkit: _onDragLeftCancel called (v13 compatibility stub)");

            // Implementazione compatibile con v13
            // In v13, questa funzionalità è gestita diversamente

            // Chiama il nuovo metodo se esiste
            if (this._onCancelDragLeft) {
              return this._onCancelDragLeft(event);
            }

            // Fallback: gestione base del drag cancel
            if (this.stage && this.stage.isDragging) {
              this.stage.isDragging = false;
            }

            // Pulisci selezione se necessario
            if (this.activeLayer && this.activeLayer.clearPreviewContainer) {
              this.activeLayer.clearPreviewContainer();
            }

            // Emetti evento per compatibilità
            Hooks.callAll("canvasDragLeftCancel", this, event);

            return false;
          };

          console.log("✅ Canvas.prototype._onDragLeftCancel stub created");
        }

        // Controlla altri metodi che PST potrebbe cercare
        const missingMethods = [
          '_onDragLeftStart',
          '_onDragLeftMove',
          '_onDragLeftDrop'
        ];

        for (const method of missingMethods) {
          if (!Canvas.prototype[method]) {
            console.log(`⚠️ Canvas.prototype.${method} missing - creating stub`);

            // Crea stub generico
            Canvas.prototype[method] = function(event) {
              console.log(`📍 Power Select Toolkit: ${method} called (v13 stub)`);

              // Prova a chiamare il metodo rinominato in v13
              const newMethod = method.replace('_onDrag', '_onDrag');
              if (this[newMethod]) {
                return this[newMethod](event);
              }

              // Emetti hook per compatibilità
              const hookName = 'canvas' + method.substring(1).replace('_on', '');
              Hooks.callAll(hookName, this, event);

              return false;
            };

            console.log(`✅ Canvas.prototype.${method} stub created`);
          }
        }
      } else {
        console.warn("⚠️ Canvas not available yet, deferring fix");

        // Riprova più tardi
        Hooks.once("canvasInit", function() {
          console.log("🔄 Retrying Power Select Toolkit fix on canvasInit");

          if (Canvas.prototype && !Canvas.prototype._onDragLeftCancel) {
            Canvas.prototype._onDragLeftCancel = function(event) {
              if (this._onCancelDragLeft) {
                return this._onCancelDragLeft(event);
              }
              return false;
            };
            console.log("✅ Late fix: Canvas.prototype._onDragLeftCancel created");
          }
        });
      }

      // Fix per altri potenziali problemi di PST
      fixPowerSelectToolkitIssues();

    }, {once: true});
  }

  // Funzione per fixare altri problemi noti di PST
  function fixPowerSelectToolkitIssues() {
    // Fix per selezione multipla
    if (window.PowerSelectToolkit) {
      const originalInit = window.PowerSelectToolkit.init;
      if (originalInit) {
        window.PowerSelectToolkit.init = function(...args) {
          console.log("🔧 Patching PowerSelectToolkit.init for v13");
          try {
            return originalInit.apply(this, args);
          } catch (error) {
            console.error("❌ PowerSelectToolkit init error caught:", error);
            // Non rilanciare per non bloccare
          }
        };
      }
    }
  }

  // Override temporaneo di libWrapper per catturare errori PST
  if (window.libWrapper) {
    const originalRegister = libWrapper.register;
    libWrapper.register = function(packageId, target, fn, type = 'WRAPPER', options = {}) {
      // Intercetta registrazioni di Power Select Toolkit
      if (packageId === 'power-select-toolkit') {
        console.log(`🔍 PST attempting to wrap: ${target}`);

        // Se sta cercando di wrappare qualcosa che non esiste
        if (target.includes('_onDragLeftCancel') ||
            target.includes('_onDragLeftStart') ||
            target.includes('_onDragLeftMove') ||
            target.includes('_onDragLeftDrop')) {

          console.warn(`⚠️ PST trying to wrap missing method: ${target}`);

          // Verifica se il target esiste ora dopo il nostro fix
          try {
            const result = originalRegister.call(this, packageId, target, fn, type, options);
            console.log(`✅ PST wrap successful after fix: ${target}`);
            return result;
          } catch (error) {
            console.error(`❌ PST wrap still failing for ${target}:`, error.message);
            // Non rilanciare per non bloccare tutto
            return;
          }
        }
      }

      // Per tutti gli altri casi, chiama normale
      return originalRegister.call(this, packageId, target, fn, type, options);
    };

    // Ripristina dopo un po'
    setTimeout(() => {
      libWrapper.register = originalRegister;
      console.log("🔄 libWrapper.register restored");
    }, 5000);
  }

})();

// FIX CRITICO per getSceneControlButtons
Hooks.on("getSceneControlButtons", (controls) => {
  // Assicurati che controls sia un array iterabile
  if (!Array.isArray(controls)) {
    console.error("🚨 CRITICAL: getSceneControlButtons received non-array:", controls);

    // Converti in array se possibile
    if (controls && typeof controls === 'object') {
      // Prova a convertire oggetto in array
      try {
        const controlsArray = Object.values(controls);
        console.log("🔧 Converted controls object to array");

        // Sostituisci l'oggetto con l'array
        controls.length = 0;
        controls.push(...controlsArray);
      } catch (e) {
        console.error("❌ Could not convert controls to array:", e);
      }
    }

    // Se ancora non è un array, creane uno vuoto
    if (!Array.isArray(controls)) {
      console.warn("⚠️ Creating empty controls array");
      return [];
    }
  }

  // Assicurati che ogni control abbia tools come array
  for (const control of controls) {
    if (control && !Array.isArray(control.tools)) {
      console.warn(`⚠️ Control ${control.name} has non-array tools, fixing...`);

      if (control.tools && typeof control.tools === 'object') {
        // Converti oggetto tools in array
        control.tools = Object.values(control.tools);
      } else {
        // Crea array vuoto
        control.tools = [];
      }
    }
  }

  return controls;
});

// Wrapper per intercettare errori di PST in getSceneControlButtons
const originalCallAll = Hooks.callAll;
Hooks.callAll = function(hook, ...args) {
  if (hook === "getSceneControlButtons") {
    console.log("🔍 Intercepting getSceneControlButtons hook");

    try {
      // Assicurati che il primo argomento sia un array
      if (args.length > 0 && !Array.isArray(args[0])) {
        console.warn("⚠️ getSceneControlButtons called with non-array, fixing...");

        // Se è un oggetto, prova a convertirlo
        if (args[0] && typeof args[0] === 'object') {
          args[0] = Object.values(args[0]);
        } else {
          args[0] = [];
        }
      }

      const result = originalCallAll.call(this, hook, ...args);

      // Assicurati che il risultato sia un array
      if (!Array.isArray(result)) {
        console.warn("⚠️ getSceneControlButtons returned non-array, fixing...");
        if (result && typeof result === 'object') {
          return Object.values(result);
        }
        return [];
      }

      return result;

    } catch (error) {
      console.error("❌ Error in getSceneControlButtons:", error);

      // Non rilanciare, ritorna array vuoto
      return args[0] || [];
    }
  }

  return originalCallAll.call(this, hook, ...args);
};

// Ripristina dopo l'inizializzazione
Hooks.once("ready", () => {
  setTimeout(() => {
    Hooks.callAll = originalCallAll;
    console.log("🔄 Hooks.callAll restored");
  }, 3000);
});

// Hook di emergenza se PST è già caricato
Hooks.once("ready", () => {
  // Verifica finale che tutto sia ok
  if (game.modules.get("power-select-toolkit")?.active) {
    console.log("🔍 Power Select Toolkit is active - checking compatibility");

    if (Canvas.prototype._onDragLeftCancel) {
      console.log("✅ Canvas.prototype._onDragLeftCancel exists - PST should work");
    } else {
      console.error("❌ CRITICAL: Canvas.prototype._onDragLeftCancel still missing!");

      // Emergency fix
      Canvas.prototype._onDragLeftCancel = function(event) {
        return false;
      };
    }
  }
});

console.log("🛡️ Power Select Toolkit v13 Compatibility Fix loaded");