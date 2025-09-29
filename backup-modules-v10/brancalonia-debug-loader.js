/**
 * BRANCALONIA DEBUG LOADER
 * Traccia il caricamento di ogni modulo per identificare il blocco
 */

console.log("=====================================");
console.log("🔍 BRANCALONIA DEBUG LOADER STARTED");
console.log("=====================================");
console.log("Timestamp:", new Date().toISOString());

// Traccia quali moduli sono stati caricati
window.BRANCALONIA_LOADED_MODULES = [];

// Intercetta il caricamento di ogni script
const originalAppendChild = Node.prototype.appendChild;
Node.prototype.appendChild = function(child) {
  if (child.tagName === 'SCRIPT' && child.src && child.src.includes('brancalonia')) {
    const moduleName = child.src.split('/').pop();
    console.log(`📦 Loading module: ${moduleName}`);
    window.BRANCALONIA_LOADED_MODULES.push({
      name: moduleName,
      timestamp: new Date().toISOString(),
      src: child.src
    });
  }
  return originalAppendChild.call(this, child);
};

// Monitora lo stato del gioco
let checkCount = 0;
const stateMonitor = setInterval(() => {
  checkCount++;

  const state = {
    gameExists: typeof game !== 'undefined',
    gamePaused: game?.paused,
    gameReady: game?.ready,
    canvasExists: typeof canvas !== 'undefined',
    canvasReady: canvas?.ready,
    modulesLoaded: window.BRANCALONIA_LOADED_MODULES?.length || 0,
    hooksCount: Hooks?._hooks ? Object.keys(Hooks._hooks).length : 0
  };

  console.log(`⏱️ Check #${checkCount}:`, state);

  // Se il gioco è in pausa, registra info dettagliate
  if (state.gamePaused) {
    console.error("🚨 GAME IS PAUSED!");
    console.log("Last loaded module:", window.BRANCALONIA_LOADED_MODULES[window.BRANCALONIA_LOADED_MODULES.length - 1]);

    // Mostra stack trace
    console.trace("Pause detected at:");

    // Ferma il monitor
    clearInterval(stateMonitor);
  }

  // Stop dopo 60 check (30 secondi)
  if (checkCount > 60) {
    clearInterval(stateMonitor);
    console.log("🔍 Debug monitor stopped after 30 seconds");
  }
}, 500);

// Intercetta errori
window.addEventListener('error', (event) => {
  console.error("❌ ERROR CAUGHT:", {
    message: event.error?.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });

  // Log ultimo modulo caricato
  if (window.BRANCALONIA_LOADED_MODULES?.length > 0) {
    console.error("Last module before error:",
      window.BRANCALONIA_LOADED_MODULES[window.BRANCALONIA_LOADED_MODULES.length - 1]);
  }
});

// Intercetta chiamate a pause
if (typeof Game !== 'undefined') {
  const originalPause = Game.prototype.pause;
  Game.prototype.pause = function(state, push = false) {
    console.error("🚨 PAUSE CALLED!", {
      state: state,
      push: push,
      caller: new Error().stack
    });
    return originalPause.call(this, state, push);
  };
}

// Log di tutti gli hook registrati
Hooks.on("init", () => {
  console.log("📝 INIT HOOK FIRED");
  console.log("Modules loaded so far:", window.BRANCALONIA_LOADED_MODULES);
});

Hooks.on("setup", () => {
  console.log("📝 SETUP HOOK FIRED");
});

Hooks.on("ready", () => {
  console.log("📝 READY HOOK FIRED - System loaded successfully!");
  clearInterval(stateMonitor);
});

console.log("🔍 Debug loader initialized");