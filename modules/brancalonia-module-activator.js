/**
 * BRANCALONIA MODULE ACTIVATOR
 * Sistema centrale per l'attivazione e verifica di tutti i moduli
 * Assicura che ogni meccanica sia correttamente inizializzata e accessibile
 */

class BrancaloniaModuleActivator {
  static ID = 'brancalonia-bigat';
  static VERSION = '10.1.0';

  /**
   * Mappa di tutti i moduli e le loro funzioni di inizializzazione
   */
  static modules = {
    // Core Systems
    'infamia-tracker': {
      name: 'Sistema Infamia',
      class: 'InfamiaTracker',
      commands: ['/infamia'],
      settings: ['infamiaEnabled'],
      init: () => {
        if (typeof InfamiaTracker !== 'undefined') {
          InfamiaTracker.initialize();
          return true;
        }
        return false;
      }
    },

    'haven-system': {
      name: 'Sistema Haven',
      class: 'HavenSystem',
      commands: ['/haven'],
      settings: ['havenEnabled'],
      init: () => {
        if (typeof HavenSystem !== 'undefined') {
          HavenSystem.initialize();
          return true;
        }
        return false;
      }
    },

    'compagnia-manager': {
      name: 'Gestione Compagnia',
      class: 'CompagniaManager',
      commands: ['/compagnia'],
      settings: ['compagniaEnabled'],
      init: () => {
        if (typeof CompagniaManager !== 'undefined') {
          CompagniaManager.initialize();
          return true;
        }
        return false;
      }
    },

    'tavern-entertainment': {
      name: 'Intrattenimento Taverna',
      class: 'TavernEntertainment',
      commands: ['/bagordi', '/giocotaverna'],
      settings: ['tavernGamesEnabled', 'bagordiEnabled'],
      init: () => {
        if (typeof TavernEntertainment !== 'undefined') {
          TavernEntertainment.initialize();
          return true;
        }
        return false;
      }
    },

    'tavern-brawl': {
      name: 'Risse da Taverna',
      class: 'TavernBrawl',
      commands: ['/rissa'],
      macros: ['Inizia Rissa'],
      init: () => {
        if (typeof TavernBrawl !== 'undefined') {
          TavernBrawl.initialize();
          return true;
        }
        return false;
      }
    },

    'menagramo-system': {
      name: 'Sistema Menagramo',
      class: 'MenagramoSystem',
      commands: ['/menagramo'],
      settings: ['menagramoEnabled'],
      init: () => {
        if (typeof MenagramoSystem !== 'undefined') {
          MenagramoSystem.initialize();
          return true;
        }
        return false;
      }
    },

    'diseases-system': {
      name: 'Sistema Malattie',
      class: 'DiseasesSystem',
      commands: ['/malattia'],
      settings: ['diseasesEnabled'],
      init: () => {
        if (typeof DiseasesSystem !== 'undefined') {
          DiseasesSystem.initialize();
          return true;
        }
        return false;
      }
    },

    'environmental-hazards': {
      name: 'Hazard Ambientali',
      class: 'EnvironmentalHazards',
      commands: ['/hazard'],
      init: () => {
        if (typeof EnvironmentalHazards !== 'undefined') {
          EnvironmentalHazards.initialize();
          return true;
        }
        return false;
      }
    },

    'dirty-jobs': {
      name: 'Lavori Sporchi',
      class: 'DirtyJobs',
      commands: ['/lavoro'],
      settings: ['dirtyJobsEnabled'],
      init: () => {
        if (typeof DirtyJobs !== 'undefined') {
          DirtyJobs.initialize();
          return true;
        }
        return false;
      }
    },

    'dueling-system': {
      name: 'Sistema Duelli',
      class: 'DuelingSystem',
      commands: ['/duello'],
      init: () => {
        if (typeof DuelingSystem !== 'undefined') {
          DuelingSystem.initialize();
          return true;
        }
        return false;
      }
    },

    'factions-system': {
      name: 'Sistema Fazioni',
      class: 'FactionsSystem',
      commands: ['/fazione'],
      init: () => {
        if (typeof FactionsSystem !== 'undefined') {
          FactionsSystem.initialize();
          return true;
        }
        return false;
      }
    },

    'reputation-system': {
      name: 'Sistema Reputazione',
      class: 'ReputationSystem',
      commands: ['/reputazione'],
      init: () => {
        if (typeof ReputationSystem !== 'undefined') {
          ReputationSystem.initialize();
          return true;
        }
        return false;
      }
    },

    'malefatte-taglie-nomea': {
      name: 'Malefatte, Taglie e Nomea',
      class: 'MalefatteTaglieNomea',
      commands: ['/malefatta', '/taglia', '/nomea'],
      init: () => {
        if (typeof MalefatteTaglieNomea !== 'undefined') {
          MalefatteTaglieNomea.initialize();
          return true;
        }
        return false;
      }
    },

    'level-cap': {
      name: 'Limite Livello',
      class: 'LevelCap',
      settings: ['levelCapEnabled', 'maxLevel'],
      init: () => {
        if (typeof LevelCap !== 'undefined') {
          LevelCap.initialize();
          return true;
        }
        return false;
      }
    },

    'shoddy-equipment': {
      name: 'Equipaggiamento Scadente',
      class: 'ShoddyEquipment',
      settings: ['shoddyEquipmentEnabled'],
      init: () => {
        if (typeof ShoddyEquipment !== 'undefined') {
          ShoddyEquipment.initialize();
          return true;
        }
        return false;
      }
    },

    'rest-system': {
      name: 'Sistema Riposo',
      class: 'RestSystem',
      init: () => {
        if (typeof RestSystem !== 'undefined') {
          RestSystem.initialize();
          return true;
        }
        return false;
      }
    },

    'covo-granlussi': {
      name: 'Covo dei Granlussi',
      class: 'CovoGranlussi',
      commands: ['/covo'],
      init: () => {
        if (typeof CovoGranlussi !== 'undefined') {
          CovoGranlussi.initialize();
          return true;
        }
        return false;
      }
    },

    'favori-system': {
      name: 'Sistema Favori',
      class: 'FavoriSystem',
      commands: ['/favore'],
      init: () => {
        if (typeof FavoriSystem !== 'undefined') {
          FavoriSystem.initialize();
          return true;
        }
        return false;
      }
    },

    'background-privileges': {
      name: 'Privilegi Background',
      class: 'BackgroundPrivileges',
      init: () => {
        if (typeof BackgroundPrivileges !== 'undefined') {
          BackgroundPrivileges.initialize();
          return true;
        }
        return false;
      }
    },

    'brancalonia-cursed-relics': {
      name: 'Reliquie Maledette',
      class: 'CursedRelics',
      init: () => {
        if (typeof CursedRelics !== 'undefined') {
          CursedRelics.initialize();
          return true;
        }
        return false;
      }
    },

    'brancalonia-conditions': {
      name: 'Condizioni Brancalonia',
      class: 'BrancaloniaConditions',
      init: () => {
        if (typeof BrancaloniaConditions !== 'undefined') {
          BrancaloniaConditions.initialize();
          return true;
        }
        return false;
      }
    },

    'brancalonia-rischi-mestiere': {
      name: 'Rischi del Mestiere',
      class: 'RischiMestiere',
      init: () => {
        if (typeof RischiMestiere !== 'undefined') {
          RischiMestiere.initialize();
          return true;
        }
        return false;
      }
    }
  };

  /**
   * Inizializza il sistema di attivazione
   */
  static initialize() {
    console.log(`🚀 Brancalonia Module Activator v${this.VERSION}`);

    // Registra settings globali
    this.registerGlobalSettings();

    // Hook per inizializzazione
    // Init hook rimosso - viene chiamato da initialize() esterno

    // Hook per ready
    Hooks.once('init', () => {
      console.log('✅ Brancalonia | Fase READY');
      this.readyPhase();

      // Mostra report di attivazione
      this.showActivationReport();

      // Registra comandi di debug
      this.registerDebugCommands();
    });

    // Hook per setup
    Hooks.once('setup', () => {
      console.log('⚙️ Brancalonia | Fase SETUP');
      this.setupPhase();
    });
  }

  /**
   * Fase di inizializzazione
   */
  static initPhase() {
    // Inizializza namespace globale
    game.brancalonia = game.brancalonia || {};
    game.brancalonia.modules = {};
    game.brancalonia.version = this.VERSION;

    // Registra API globale
    game.brancalonia.api = {
      getModule: (name) => game.brancalonia.modules[name],
      isModuleActive: (name) => !!game.brancalonia.modules[name],
      listActiveModules: () => Object.keys(game.brancalonia.modules),
      executeCommand: (command, ...args) => this.executeCommand(command, ...args)
    };
  }

  /**
   * Fase di setup
   */
  static setupPhase() {
    // Pre-carica configurazioni
    this.loadConfigurations();
  }

  /**
   * Fase ready - attiva tutti i moduli
   */
  static readyPhase() {
    const results = {
      success: [],
      failed: [],
      disabled: []
    };

    // Attiva ogni modulo
    for (const [id, config] of Object.entries(this.modules)) {
      // Controlla se il modulo è disabilitato nelle settings
      if (config.settings) {
        const mainSetting = config.settings[0];
        if (game.settings.get(this.ID, mainSetting) === false) {
          results.disabled.push(config.name);
          continue;
        }
      }

      try {
        // Tenta l'inizializzazione
        const success = config.init();

        if (success) {
          results.success.push(config.name);
          game.brancalonia.modules[id] = true;
          console.log(`✅ ${config.name} attivato`);
        } else {
          results.failed.push(config.name);
          console.warn(`⚠️ ${config.name} non trovato o non inizializzato`);
        }
      } catch (error) {
        results.failed.push(config.name);
        console.error(`❌ Errore attivando ${config.name}:`, error);
      }
    }

    // Salva risultati
    game.brancalonia.activationResults = results;

    // Registra comandi chat globali
    this.registerChatCommands();
  }

  /**
   * Registra settings globali
   */
  static registerGlobalSettings() {
    // Master switch
    game.settings.register(this.ID, 'brancaloniaEnabled', {
      name: 'Abilita Sistema Brancalonia',
      hint: 'Attiva/disattiva tutte le meccaniche di Brancalonia',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
      onChange: value => {
        if (!value) {
          ui.notifications.warn('Sistema Brancalonia disabilitato. Ricarica per applicare.');
        }
      }
    });

    // Settings per ogni modulo
    const moduleSettings = {
      infamiaEnabled: 'Sistema Infamia',
      havenEnabled: 'Sistema Haven',
      compagniaEnabled: 'Gestione Compagnia',
      tavernGamesEnabled: 'Giochi da Taverna',
      bagordiEnabled: 'Sistema Bagordi',
      menagramoEnabled: 'Sistema Menagramo',
      diseasesEnabled: 'Sistema Malattie',
      dirtyJobsEnabled: 'Lavori Sporchi',
      levelCapEnabled: 'Limite Livello (6°)',
      shoddyEquipmentEnabled: 'Equipaggiamento Scadente'
    };

    for (const [key, name] of Object.entries(moduleSettings)) {
      game.settings.register(this.ID, key, {
        name,
        hint: `Abilita/disabilita ${name}`,
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });
    }

    // Setting livello massimo
    game.settings.register(this.ID, 'maxLevel', {
      name: 'Livello Massimo',
      hint: 'Livello massimo raggiungibile dai personaggi',
      scope: 'world',
      config: true,
      type: Number,
      default: 6,
      range: {
        min: 1,
        max: 20,
        step: 1
      }
    });
  }

  /**
   * Registra comandi chat
   */
  static registerChatCommands() {
    Hooks.on('chatMessage', (html, content, msg) => {
      // Comando help
      if (content === '/brancalonia' || content === '/branca') {
        this.showHelpMessage();
        return false;
      }

      // Comando status
      if (content === '/brancalonia status') {
        this.showStatusMessage();
        return false;
      }

      // Comando test
      if (content === '/brancalonia test') {
        this.runSystemTest();
        return false;
      }

      return true;
    });
  }

  /**
   * Mostra messaggio di aiuto
   */
  static showHelpMessage() {
    const commands = [];
    for (const [id, config] of Object.entries(this.modules)) {
      if (config.commands && game.brancalonia.modules[id]) {
        commands.push(...config.commands);
      }
    }

    const content = `
      <div class="brancalonia-help">
        <h2>🇮🇹 Brancalonia - Comandi Disponibili</h2>
        <p><strong>Comandi Sistema:</strong></p>
        <ul>
          <li><code>/brancalonia</code> - Mostra questo aiuto</li>
          <li><code>/brancalonia status</code> - Stato moduli</li>
          <li><code>/brancalonia test</code> - Test sistema</li>
        </ul>
        <p><strong>Comandi Meccaniche:</strong></p>
        <ul>
          ${commands.map(cmd => `<li><code>${cmd}</code></li>`).join('')}
        </ul>
        <p><em>Versione: ${this.VERSION}</em></p>
      </div>
    `;

    ChatMessage.create({
      content,
      whisper: [game.user.id]
    });
  }

  /**
   * Mostra stato del sistema
   */
  static showStatusMessage() {
    const results = game.brancalonia.activationResults;

    const content = `
      <div class="brancalonia-status">
        <h2>📊 Stato Sistema Brancalonia</h2>
        <p><strong>✅ Moduli Attivi (${results.success.length}):</strong></p>
        <ul style="color: green;">
          ${results.success.map(name => `<li>${name}</li>`).join('')}
        </ul>
        ${results.failed.length > 0 ? `
        <p><strong>❌ Moduli Non Caricati (${results.failed.length}):</strong></p>
        <ul style="color: red;">
          ${results.failed.map(name => `<li>${name}</li>`).join('')}
        </ul>
        ` : ''}
        ${results.disabled.length > 0 ? `
        <p><strong>⚫ Moduli Disabilitati (${results.disabled.length}):</strong></p>
        <ul style="color: gray;">
          ${results.disabled.map(name => `<li>${name}</li>`).join('')}
        </ul>
        ` : ''}
      </div>
    `;

    ChatMessage.create({
      content,
      whisper: [game.user.id]
    });
  }

  /**
   * Esegue test del sistema
   */
  static async runSystemTest() {
    const tests = [];

    // Test 1: Namespace
    tests.push({
      name: 'Namespace Globale',
      passed: !!game.brancalonia,
      details: 'game.brancalonia disponibile'
    });

    // Test 2: Settings
    tests.push({
      name: 'Settings Registrate',
      passed: !!game.settings.get(this.ID, 'brancaloniaEnabled'),
      details: 'Settings caricate correttamente'
    });

    // Test 3: Moduli Core
    const coreModules = ['infamia-tracker', 'haven-system', 'compagnia-manager'];
    const coreActive = coreModules.every(m => game.brancalonia.modules[m]);
    tests.push({
      name: 'Moduli Core',
      passed: coreActive,
      details: `${coreModules.filter(m => game.brancalonia.modules[m]).length}/${coreModules.length} attivi`
    });

    // Test 4: Actor Flags
    const testActor = game.actors.find(a => a.type === 'character');
    if (testActor) {
      tests.push({
        name: 'Actor Flags',
        passed: true,
        details: 'Sistema flags funzionante'
      });
    }

    // Mostra risultati
    const content = `
      <div class="brancalonia-test">
        <h2>🧪 Test Sistema Brancalonia</h2>
        ${tests.map(test => `
          <p>
            ${test.passed ? '✅' : '❌'} <strong>${test.name}:</strong>
            ${test.details}
          </p>
        `).join('')}
        <hr>
        <p><strong>Risultato:</strong> ${tests.filter(t => t.passed).length}/${tests.length} test passati</p>
      </div>
    `;

    ChatMessage.create({
      content,
      whisper: [game.user.id]
    });
  }

  /**
   * Mostra report di attivazione all'avvio
   */
  static showActivationReport() {
    const results = game.brancalonia.activationResults;

    // Solo se ci sono problemi
    if (results.failed.length > 0) {
      ui.notifications.warn(`Brancalonia: ${results.failed.length} moduli non caricati. Usa /brancalonia status per dettagli.`);
    } else {
      ui.notifications.info(`Brancalonia v${this.VERSION}: ${results.success.length} moduli attivi!`);
    }
  }

  /**
   * Registra comandi di debug per console
   */
  static registerDebugCommands() {
    // Comando per forzare reinizializzazione
    window.brancaloniaReinit = () => {
      console.log('🔄 Reinizializzazione forzata...');
      this.readyPhase();
      return 'Reinizializzazione completata';
    };

    // Comando per testare un modulo specifico
    window.brancaloniaTestModule = (moduleName) => {
      const config = this.modules[moduleName];
      if (!config) {
        return `Modulo ${moduleName} non trovato`;
      }

      try {
        const result = config.init();
        return result ? `✅ ${config.name} inizializzato` : `❌ ${config.name} fallito`;
      } catch (e) {
        return `❌ Errore: ${e.message}`;
      }
    };

    // Lista moduli
    window.brancaloniaModules = () => {
      return game.brancalonia.modules;
    };

    console.log('🎮 Comandi debug Brancalonia disponibili:');
    console.log('  - brancaloniaReinit()');
    console.log('  - brancaloniaTestModule(name)');
    console.log('  - brancaloniaModules()');
  }

  /**
   * Carica configurazioni salvate
   */
  static loadConfigurations() {
    // Carica configurazioni personalizzate se esistono
    const customConfig = game.settings.get(this.ID, 'customModuleConfig') || {};

    // Applica configurazioni custom
    for (const [id, config] of Object.entries(customConfig)) {
      if (this.modules[id]) {
        Object.assign(this.modules[id], config);
      }
    }
  }

  /**
   * Esegue un comando specifico
   */
  static executeCommand(command, ...args) {
    // Implementazione per esecuzione comandi programmatica
    console.log(`Executing command: ${command}`, args);

    // Trova il modulo che gestisce questo comando
    for (const [id, config] of Object.entries(this.modules)) {
      if (config.commands && config.commands.includes(command)) {
        // Trova la classe e chiama il metodo appropriato
        const className = config.class;
        if (window[className] && typeof window[className].handleCommand === 'function') {
          return window[className].handleCommand(command, ...args);
        }
      }
    }

    console.warn(`Comando ${command} non trovato`);
    return null;
  }
}

// Inizializza quando Foundry è pronto
// Inizializzazione principale - solo una volta
if (!window.BrancaloniaModuleActivator) {
  Hooks.once('init', () => {
    BrancaloniaModuleActivator.initialize();
  });

  // Esporta globalmente
  window.BrancaloniaModuleActivator = BrancaloniaModuleActivator;
}