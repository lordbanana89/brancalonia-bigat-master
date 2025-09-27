/**
 * BRANCALONIA EMERGENCY STARTUP FIX
 * Fix di emergenza per sbloccare il sistema quando rimane su "GAME PAUSED"
 *
 * PROBLEMA CRITICO: Il sistema si blocca all'avvio
 * SOLUZIONE: Disabilita temporaneamente moduli problematici e forza il caricamento
 */

console.error("🚨 BRANCALONIA EMERGENCY FIX ACTIVATED 🚨");

// Disabilita temporaneamente tutti gli hook problematici
(function() {
  // Flag di emergenza
  window.BRANCALONIA_EMERGENCY_MODE = true;

  // Intercetta e previeni errori fatali
  window.addEventListener('error', function(event) {
    console.error("🔴 Caught fatal error:", event.error);

    // Previeni che l'errore blocchi tutto
    if (event.error?.message?.includes("GAME PAUSED") ||
        event.error?.message?.includes("Cannot read properties")) {
      event.preventDefault();
      event.stopPropagation();

      console.log("🔧 Attempting to recover from error...");

      // Forza unpause del gioco
      if (game?.paused) {
        game.paused = false;
      }

      return false;
    }
  }, true);

  // Override del game pause per prevenire blocchi
  let pauseOverrideAttempts = 0;
  const checkAndFixPause = setInterval(() => {
    pauseOverrideAttempts++;

    if (typeof game !== 'undefined' && game) {
      // Forza unpause
      if (game.paused === true) {
        console.warn("🔧 Game is paused, forcing unpause...");
        game.paused = false;

        // Prova anche a triggerare il resume
        if (game.togglePause) {
          try {
            if (game.paused) game.togglePause(false);
          } catch (e) {
            console.error("Could not toggle pause:", e);
          }
        }
      }

      // Se dopo 10 tentativi è ancora in pausa, stop
      if (pauseOverrideAttempts > 10) {
        clearInterval(checkAndFixPause);

        // Ultima risorsa: ricarica senza moduli problematici
        if (game.paused) {
          console.error("🔴 CRITICAL: Game still paused after fixes");
          console.log("🔧 Attempting last resort recovery...");

          // Disabilita tutti i moduli Brancalonia tranne questo
          if (game.modules) {
            for (const [key, module] of game.modules.entries()) {
              if (key.includes('brancalonia') && key !== 'brancalonia-emergency-startup-fix') {
                console.log(`Disabling problematic module: ${key}`);
                module.active = false;
              }
            }
          }
        }
      }
    }

    // Stop dopo 30 secondi
    if (pauseOverrideAttempts > 60) {
      clearInterval(checkAndFixPause);
    }
  }, 500);

  // Previeni hook problematici
  const originalHooksCall = Hooks.call;
  const originalHooksCallAll = Hooks.callAll;

  Hooks.call = function(hook, ...args) {
    // Skip problematici hooks durante emergenza
    if (window.BRANCALONIA_EMERGENCY_MODE) {
      const problematicHooks = [
        'pauseGame',
        'renderPause'
      ];

      if (problematicHooks.includes(hook)) {
        console.warn(`⏭️ Skipping problematic hook during emergency: ${hook}`);
        return;
      }
    }

    try {
      return originalHooksCall.call(this, hook, ...args);
    } catch (error) {
      console.error(`Error in hook ${hook}:`, error);
      // Non rilanciare per non bloccare
    }
  };

  Hooks.callAll = function(hook, ...args) {
    // Skip hooks problematici
    if (window.BRANCALONIA_EMERGENCY_MODE) {
      if (hook === 'pauseGame' || hook === 'renderPause') {
        console.warn(`⏭️ Skipping ${hook} during emergency mode`);
        return;
      }
    }

    try {
      return originalHooksCallAll.call(this, hook, ...args);
    } catch (error) {
      console.error(`Error in hook ${hook}:`, error);
      // Non bloccare
    }
  };

})();

// Hook di recupero quando il gioco è pronto
Hooks.once("ready", () => {
  console.log("✅ Game loaded successfully with emergency fix");

  // Disabilita emergency mode dopo il caricamento
  setTimeout(() => {
    window.BRANCALONIA_EMERGENCY_MODE = false;
    console.log("✅ Emergency mode disabled");
  }, 5000);

  // Assicurati che il gioco non sia in pausa
  if (game.paused) {
    game.togglePause(false);
  }

  // Notifica all'utente
  ui.notifications?.warn("Brancalonia: Sistema caricato in modalità di emergenza. Alcuni moduli potrebbero essere disabilitati.", {permanent: true});
});

// Hook di backup per Canvas
Hooks.once("canvasReady", () => {
  console.log("✅ Canvas ready with emergency fix");

  // Ultima verifica pausa
  if (game?.paused) {
    game.paused = false;
    console.log("🔧 Forced unpause on canvas ready");
  }
});

console.log("📦 Brancalonia Emergency Startup Fix loaded - Monitoring for issues...");