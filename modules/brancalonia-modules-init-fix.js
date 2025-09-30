/**
 * BRANCALONIA MODULES INIT FIX
 * Corregge l'ordine di inizializzazione dei moduli e gestisce game.brancalonia
 * Risolve i conflitti di inizializzazione multipla
 */

// Inizializzazione centralizzata di game.brancalonia
Hooks.once('init', () => {
  console.log('🔧 Brancalonia Init Fix - Ensuring proper initialization');

  // Crea l'oggetto principale se non esiste
  if (!game.brancalonia) {
    game.brancalonia = {
      version: '10.1.0',
      modules: {},
      initialized: false,
      initQueue: [],
      api: {}
    };
  }

  // Proteggi l'oggetto da sovrascritture accidentali
  Object.defineProperty(game, 'brancalonia', {
    value: game.brancalonia,
    writable: false,
    configurable: false
  });

  console.log('✅ game.brancalonia protected and ready');
});

// Hook per inizializzazione moduli
Hooks.once('ready', async () => {
  console.log('🚀 Initializing Brancalonia modules in correct order');

  // Ordine corretto di inizializzazione
  const initOrder = [
    // Core systems first
    'InfamiaTracker',
    'HavenSystem',
    'CompagniaManager',

    // Gameplay systems
    'DirtyJobs',
    'TavernBrawl',
    'MenagramoSystem',
    'DiseasesSystem',
    'EnvironmentalHazards',
    'DuelingSystem',
    'FactionsSystem',
    'ReputationSystem',

    // Items and equipment
    'ShoddyEquipment',
    'CursedRelics',

    // Character systems
    'BackgroundPrivileges',
    'FavoriSystem',
    'RischiMestiere',

    // UI and theme
    'BrancaloniaSheets',
    'BrancaloniaDiceTheme',

    // Advanced systems
    'BrancaloniaCovoV2',
    'RestSystem',
    'LevelCap',

    // Mechanics and conditions
    'BrancaloniaConditions',
    'BrancaloniaMechanics',
    'BrancaloniaActiveEffects'
  ];

  // Inizializza ogni modulo in ordine
  for (const className of initOrder) {
    try {
      // Verifica se la classe esiste
      if (typeof window[className] !== 'undefined') {
        const moduleClass = window[className];

        // Se ha un metodo initialize statico, chiamalo
        if (typeof moduleClass.initialize === 'function') {
          console.log(`📦 Initializing ${className}`);
          await moduleClass.initialize();

          // Registra il modulo come inizializzato
          if (!game.brancalonia.modules[className]) {
            game.brancalonia.modules[className] = {
              initialized: true,
              timestamp: Date.now()
            };
          }
        }
      }
    } catch (error) {
      console.error(`❌ Failed to initialize ${className}:`, error);
      ui.notifications.error(`Errore inizializzazione modulo ${className}`);
    }
  }

  // Marca come completamente inizializzato
  game.brancalonia.initialized = true;

  // Trigger custom hook per altri moduli
  Hooks.callAll('brancaloniaReady', game.brancalonia);

  console.log('✅ All Brancalonia modules initialized successfully');

  // Mostra messaggio di benvenuto
  if (game.user.isGM) {
    ChatMessage.create({
      content: `
        <div class="brancalonia-chat">
          <h2>🎭 Brancalonia - Il Regno di Taglia</h2>
          <p><strong>Versione ${game.brancalonia.version}</strong></p>
          <p>✅ Tutti i moduli sono stati inizializzati correttamente!</p>
          <details>
            <summary>Moduli Attivi (${Object.keys(game.brancalonia.modules).length})</summary>
            <ul>
              ${Object.keys(game.brancalonia.modules).map(m => `<li>${m}</li>`).join('')}
            </ul>
          </details>
        </div>
      `,
      whisper: [game.user.id]
    });
  }
});

// Fix per hook deprecati
Hooks.on('renderActorSheet', (app, html, data) => {
  // Fix per jQuery/HTMLElement compatibility
  const element = html[0] || html;

  // Aggiungi classe Brancalonia se è un personaggio del sistema
  if (app.actor?.type === 'character') {
    element.classList.add('brancalonia-sheet');
  }
});

// Fix per chat commands
Hooks.on('chatMessage', (html, content, msg) => {
  // Intercetta comandi Brancalonia
  if (content.startsWith('/brancalonia')) {
    const parts = content.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    // Gestisci comandi
    switch (command) {
      case '/brancalonia-status':
        showBrancaloniaStatus();
        return false;
      case '/brancalonia-reset':
        if (game.user.isGM) {
          resetBrancaloniaModules();
        }
        return false;
    }
  }
});

// Funzione per mostrare lo stato dei moduli
function showBrancaloniaStatus() {
  const modules = game.brancalonia?.modules || {};
  const content = `
    <div class="brancalonia-status">
      <h3>🎭 Stato Moduli Brancalonia</h3>
      <p>Versione: ${game.brancalonia?.version || 'N/A'}</p>
      <p>Inizializzato: ${game.brancalonia?.initialized ? '✅' : '❌'}</p>
      <hr>
      <h4>Moduli (${Object.keys(modules).length}):</h4>
      <ul>
        ${Object.entries(modules).map(([name, data]) =>
          `<li>${name}: ${data.initialized ? '✅' : '❌'}</li>`
        ).join('')}
      </ul>
    </div>
  `;

  ChatMessage.create({
    content,
    whisper: [game.user.id]
  });
}

// Funzione per reset moduli (solo GM)
async function resetBrancaloniaModules() {
  if (!game.user.isGM) return;

  const confirm = await Dialog.confirm({
    title: "Reset Moduli Brancalonia",
    content: "<p>Vuoi davvero resettare tutti i moduli Brancalonia?</p>",
    yes: () => true,
    no: () => false
  });

  if (confirm) {
    // Reset stato
    game.brancalonia.initialized = false;
    game.brancalonia.modules = {};

    // Ricarica
    location.reload();
  }
}

// Export per compatibilità
export { showBrancaloniaStatus, resetBrancaloniaModules };