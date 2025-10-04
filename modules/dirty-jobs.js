/**
 * @fileoverview Sistema Lavori Sporchi per Brancalonia
 * 
 * Gestione completa di lavori illegali, estorsioni, rapine, assassinii e altre
 * attività criminali per personaggi di Brancalonia.
 * 
 * Features:
 * - 8 tipi di lavori (robbery, extortion, smuggling, escort, assassination, spying, heist, sabotage)
 * - 3 livelli difficoltà (easy, medium, hard)
 * - 8 committenti con affidabilità variabile
 * - Sistema complicazioni (25% probabilità)
 * - Ricompense e infamia automatiche
 * - Integrazione con Journal Entries
 * - Chat commands (/lavoro-*)
 * - Macro automatica
 * - UI integration
 * 
 * @version 3.0.0
 * @author Brancalonia Module Team
 * @requires brancalonia-logger.js
 * @requires dnd5e
 */

import { logger } from './brancalonia-logger.js';

/**
 * @typedef {Object} DirtyJobStatistics
 * @property {number} initTime - Tempo inizializzazione (ms)
 * @property {number} jobsGenerated - Lavori generati
 * @property {number} jobsCompleted - Lavori completati
 * @property {number} jobsFailed - Lavori falliti
 * @property {number} totalGoldEarned - Oro totale guadagnato
 * @property {number} totalInfamyGained - Infamia totale accumulata
 * @property {number} dialogsOpened - Dialog aperti
 * @property {number} chatCommandsExecuted - Comandi chat eseguiti
 * @property {number} complicationsTriggered - Complicazioni attivate
 * @property {number} macrosCreated - Macro create
 * @property {Object<string, number>} jobsByType - Lavori per tipo
 * @property {string[]} errors - Errori registrati
 */

/**
 * @typedef {Object} JobType
 * @property {string} name - Nome localizzato
 * @property {string} icon - Path all'icona
 * @property {Object} difficulty - Difficoltà (easy, medium, hard)
 * @property {string[]} skills - Skills richieste
 * @property {string[]} complications - Complicazioni possibili
 */

/**
 * @typedef {Object} Client
 * @property {string} name - Nome committente
 * @property {number} trustworthy - Affidabilità (0-1)
 * @property {number} payModifier - Modificatore pagamento
 */

/**
 * @typedef {Object} DirtyJob
 * @property {string} id - ID univoco
 * @property {string} type - Tipo lavoro
 * @property {string} name - Nome lavoro
 * @property {string} difficulty - Difficoltà
 * @property {number} dc - DC del check
 * @property {Client} client - Committente
 * @property {number} reward - Ricompensa in oro
 * @property {number} infamyGain - Infamia guadagnata
 * @property {string|null} complication - Complicazione
 * @property {string} deadline - Scadenza
 * @property {string[]} requiredSkills - Skills richieste
 * @property {string} status - Stato (available, accepted, completed, failed)
 * @property {string} createdAt - Data creazione ISO
 */

/**
 * Sistema Lavori Sporchi
 * Gestisce generazione, tracking e completamento lavori illegali
 * 
 * @class DirtyJobsSystem
 */
class DirtyJobsSystem {
  static VERSION = '3.0.0';
  static MODULE_NAME = 'DirtyJobs';
  static ID = 'dirty-jobs';

  /**
   * Statistiche del modulo
   * @type {DirtyJobStatistics}
   * @private
   * @static
   */
  static _statistics = {
    initTime: 0,
    jobsGenerated: 0,
    jobsCompleted: 0,
    jobsFailed: 0,
    totalGoldEarned: 0,
    totalInfamyGained: 0,
    dialogsOpened: 0,
    chatCommandsExecuted: 0,
    complicationsTriggered: 0,
    macrosCreated: 0,
    jobsByType: {},
    errors: []
  };

  /**
   * Stato del modulo
   * @type {Object}
   * @private
   * @static
   */
  static _state = {
    initialized: false,
    instance: null
  };

  /**
   * Costruttore
   * Inizializza jobTypes e clients
   */
  constructor() {
    // Tipi di lavori con parametri conformi a dnd5e
    this.jobTypes = {
      robbery: {
        name: 'Rapina',
        icon: 'icons/containers/bags/sack-leather-gold.webp',
        difficulty: {
          easy: { dc: 12, reward: '2d6 * 10', infamy: 3 },
          medium: { dc: 15, reward: '4d6 * 10', infamy: 5 },
          hard: { dc: 18, reward: '8d6 * 10', infamy: 8 }
        },
        skills: ['dex', 'ste', 'slt'], // Destrezza, Furtività, Rapidità di Mano
        complications: [
          'Le guardie sono state allertate',
          'Il bottino è maledetto',
          'Un testimone vi ha riconosciuti',
          'La refurtiva è marchiata'
        ]
      },
      extortion: {
        name: 'Estorsione',
        icon: 'icons/skills/social/intimidation-threat-knife.webp',
        difficulty: {
          easy: { dc: 10, reward: '1d6 * 10', infamy: 2 },
          medium: { dc: 13, reward: '2d6 * 10', infamy: 3 },
          hard: { dc: 16, reward: '4d6 * 10', infamy: 5 }
        },
        skills: ['cha', 'itm', 'per'], // Carisma, Intimidire, Persuasione
        complications: [
          'La vittima ha amici potenti',
          'Qualcuno vuole vendetta',
          'La vittima è al verde',
          'Siete stati denunciati'
        ]
      },
      smuggling: {
        name: 'Contrabbando',
        icon: 'icons/containers/barrels/barrel-wooden-brown.webp',
        difficulty: {
          easy: { dc: 11, reward: '3d6 * 10', infamy: 1 },
          medium: { dc: 14, reward: '6d6 * 10', infamy: 2 },
          hard: { dc: 17, reward: '10d6 * 10', infamy: 4 }
        },
        skills: ['wis', 'dec', 'sur'], // Saggezza, Inganno, Sopravvivenza
        complications: [
          'La merce è difettosa',
          'I doganieri sono sospettosi',
          'Un rivale vi sabota',
          'La rotta è bloccata'
        ]
      },
      escort: {
        name: 'Scorta',
        icon: 'icons/environment/people/group.webp',
        difficulty: {
          easy: { dc: 10, reward: '2d6 * 10', infamy: 0 },
          medium: { dc: 13, reward: '4d6 * 10', infamy: 1 },
          hard: { dc: 16, reward: '6d6 * 10', infamy: 2 }
        },
        skills: ['str', 'prc', 'itm'], // Forza, Percezione, Intimidire
        complications: [
          'Imboscata di banditi',
          'Il cliente è inseguito',
          'Tempo atmosferico terribile',
          'Il cliente è insopportabile'
        ]
      },
      assassination: {
        name: 'Assassinio',
        icon: 'icons/weapons/daggers/dagger-curved-red.webp',
        difficulty: {
          easy: { dc: 14, reward: '5d6 * 10', infamy: 10 },
          medium: { dc: 17, reward: '10d6 * 10', infamy: 15 },
          hard: { dc: 20, reward: '20d6 * 10', infamy: 20 }
        },
        skills: ['dex', 'ste', 'inv'], // Destrezza, Furtività, Investigare
        complications: [
          'Il bersaglio è protetto',
          'Doppio gioco del committente',
          'Testimoni inaspettati',
          'Il bersaglio è innocente'
        ]
      },
      spying: {
        name: 'Spionaggio',
        icon: 'icons/tools/scribal/magnifying-glass.webp',
        difficulty: {
          easy: { dc: 11, reward: '1d6 * 10', infamy: 1 },
          medium: { dc: 14, reward: '3d6 * 10', infamy: 2 },
          hard: { dc: 17, reward: '5d6 * 10', infamy: 3 }
        },
        skills: ['int', 'inv', 'ste'], // Intelligenza, Investigare, Furtività
        complications: [
          'Controspionaggio attivo',
          'Informazioni false',
          'Siete stati scoperti',
          'Doppio agente'
        ]
      },
      heist: {
        name: 'Colpo Grosso',
        icon: 'icons/containers/chest/chest-gold-box.webp',
        difficulty: {
          easy: { dc: 13, reward: '10d6 * 10', infamy: 6 },
          medium: { dc: 16, reward: '20d6 * 10', infamy: 10 },
          hard: { dc: 19, reward: '40d6 * 10', infamy: 15 }
        },
        skills: ['dex', 'int', 'cha'], // Richiede pianificazione
        complications: [
          'Tradimento interno',
          'Sistemi di sicurezza imprevisti',
          'Tempistica sbagliata',
          'Refurtiva troppo ingombrante'
        ]
      },
      sabotage: {
        name: 'Sabotaggio',
        icon: 'icons/tools/hand/hammer-and-nail.webp',
        difficulty: {
          easy: { dc: 12, reward: '2d6 * 10', infamy: 3 },
          medium: { dc: 15, reward: '4d6 * 10', infamy: 5 },
          hard: { dc: 18, reward: '8d6 * 10', infamy: 8 }
        },
        skills: ['int', 'slt', 'ste'], // Intelligenza, Attrezzi, Furtività
        complications: [
          'Esplosione prematura',
          'Guardie extra',
          'Piano scoperto',
          'Danni collaterali'
        ]
      }
    };

    // Committenti tipici
    this.clients = [
      { name: 'Nobile Corrotto', trustworthy: 0.6, payModifier: 1.2 },
      { name: 'Mercante Avido', trustworthy: 0.7, payModifier: 1.0 },
      { name: 'Criminale Locale', trustworthy: 0.5, payModifier: 0.9 },
      { name: 'Spia Straniera', trustworthy: 0.4, payModifier: 1.5 },
      { name: 'Chierico Corrotto', trustworthy: 0.6, payModifier: 1.1 },
      { name: 'Capitano delle Guardie', trustworthy: 0.3, payModifier: 1.3 },
      { name: 'Mago Rinnegato', trustworthy: 0.5, payModifier: 1.4 },
      { name: 'Vecchio Amico', trustworthy: 0.8, payModifier: 0.8 }
    ];

    // Inizializza contatori per tipo
    Object.keys(this.jobTypes).forEach(type => {
      DirtyJobsSystem._statistics.jobsByType[type] = 0;
    });
  }

  /**
   * Inizializza il modulo Dirty Jobs
   * Registra hooks, settings, chat commands e crea macro
   * 
   * @static
   * @returns {void}
   */
  static initialize() {
    const startTime = performance.now();

    try {
      logger.info(this.MODULE_NAME, `Inizializzazione Dirty Jobs v${this.VERSION}`);

      // Creazione istanza
      this._state.instance = new DirtyJobsSystem();

      // Registrazione settings
      this._registerSettings();

      // Registrazione hooks
      this._registerHooks();

      // Registrazione comandi chat
      this._registerChatCommands();

      // Creazione macro automatica
      this._createMacro();

      // Hook per creare macro quando il gioco è pronto
      Hooks.once('ready', () => {
        try {
          if (!game.macros?.find(m => m.name === 'Generatore Lavori Sporchi')) {
            this._createMacro();
          }
        } catch (error) {
          this._statistics.errors.push(`Ready hook: ${error.message}`);
          logger.error(this.MODULE_NAME, 'Errore in ready hook', error);
        }
      });

      // Esporta per compatibilità
      window.DirtyJobsSystemClass = DirtyJobsSystem;
      window.DirtyJobsSystem = this._state.instance;

      // Registra in game.brancalonia
      game.brancalonia = game.brancalonia || {};
      game.brancalonia.modules = game.brancalonia.modules || {};
      game.brancalonia.modules['dirty-jobs'] = DirtyJobsSystem;
      game.brancalonia.dirtyJobs = this._state.instance;

      this._state.initialized = true;
      this._statistics.initTime = performance.now() - startTime;

      logger.info(
        this.MODULE_NAME,
        `✅ Inizializzazione completata in ${this._statistics.initTime.toFixed(2)}ms`
      );

      // Emit event
      Hooks.callAll('dirty-jobs:initialized', {
        version: this.VERSION,
        jobTypes: Object.keys(this._state.instance.jobTypes).length,
        clients: this._state.instance.clients.length
      });
    } catch (error) {
      this._statistics.errors.push(error.message);
      logger.error(this.MODULE_NAME, 'Errore durante inizializzazione', error);
      throw error;
    }
  }

  /**
   * Registra settings del modulo
   * @private
   * @static
   */
  static _registerSettings() {
    try {
      game.settings.register('brancalonia-bigat', 'dirtyJobsEnabled', {
        name: 'Sistema Lavori Sporchi Attivo',
        hint: 'Abilita il sistema di generazione lavori sporchi',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      game.settings.register('brancalonia-bigat', 'dirtyJobsAutoReward', {
        name: 'Ricompense Automatiche',
        hint: 'Calcola automaticamente ricompense e infamia al completamento',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      game.settings.register('brancalonia-bigat', 'dirtyJobsNotifications', {
        name: 'Notifiche Lavori',
        hint: 'Mostra notifiche per nuovi lavori e completamenti',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      logger.debug?.(this.MODULE_NAME, '3 settings registrati');
    } catch (error) {
      this._statistics.errors.push(`Settings registration: ${error.message}`);
      logger.error(this.MODULE_NAME, 'Errore registrazione settings', error);
      throw error;
    }
  }

  /**
   * Registra hooks del modulo
   * @private
   * @static
   */
  static _registerHooks() {
    try {
      // Hook per aggiungere lavori al journal
      Hooks.on('renderJournalDirectory', (app, html) => {
        try {
          if (game.user.isGM && game.settings.get('brancalonia-bigat', 'dirtyJobsEnabled')) {
            // Vanilla JS fallback per jQuery
            const element = html instanceof jQuery ? html[0] : html;
            const actionButtons = element.querySelector('.directory-header .action-buttons');

            if (actionButtons) {
              const button = document.createElement('button');
              button.className = 'generate-job';
              button.innerHTML = '<i class="fas fa-coins"></i> Genera Lavoro';
              button.addEventListener('click', () => {
                window.DirtyJobsSystem.showJobGeneratorDialog();
              });
              actionButtons.appendChild(button);
            }
          }
        } catch (error) {
          this._statistics.errors.push(`renderJournalDirectory: ${error.message}`);
          logger.error(this.MODULE_NAME, 'Errore in renderJournalDirectory hook', error);
        }
      });

      // Hook per tracciare completamento lavori
      Hooks.on('updateJournalEntry', (journal, update, options, userId) => {
        try {
          if (journal.flags.brancalonia?.isJob && update.flags?.brancalonia?.jobCompleted) {
            window.DirtyJobsSystem._handleJobCompletion(journal);
          }
        } catch (error) {
          this._statistics.errors.push(`updateJournalEntry: ${error.message}`);
          logger.error(this.MODULE_NAME, 'Errore in updateJournalEntry hook', error);
        }
      });

      // Hook per aggiungere pulsanti ai journal entries di lavori
      Hooks.on('renderJournalSheet', (app, html, data) => {
        try {
          if (app.object.flags.brancalonia?.isJob && game.user.isGM) {
            // Vanilla JS fallback per jQuery
            const element = html instanceof jQuery ? html[0] : html;
            const windowTitle = element.querySelector('.window-header .window-title');

            if (windowTitle) {
              const button = document.createElement('button');
              button.className = 'job-complete-btn';
              button.title = 'Completa Lavoro';
              button.innerHTML = '<i class="fas fa-check"></i> Completa';
              button.addEventListener('click', () => {
                app.object.setFlag('brancalonia', 'jobCompleted', true);
              });
              windowTitle.insertAdjacentElement('afterend', button);
            }
          }
        } catch (error) {
          this._statistics.errors.push(`renderJournalSheet: ${error.message}`);
          logger.error(this.MODULE_NAME, 'Errore in renderJournalSheet hook', error);
        }
      });

      logger.debug?.(this.MODULE_NAME, '3 hooks registrati');
    } catch (error) {
      this._statistics.errors.push(`Hook registration: ${error.message}`);
      logger.error(this.MODULE_NAME, 'Errore registrazione hooks', error);
      throw error;
    }
  }

  /**
   * Registra comandi chat
   * @private
   * @static
   */
  static _registerChatCommands() {
    try {
      // Registra il handler per i comandi chat
      Hooks.on('chatMessage', async (html, content, msg) => {
        try {
          // Verifica se è un comando lavoro
          if (!content.startsWith('/lavoro-')) return true;

          this._statistics.chatCommandsExecuted++;

          // Estrai comando e parametri
          const parts = content.split(' ');
          const command = parts[0];
          const parameters = parts.slice(1).join(' ');

          // Comando per generare lavoro
          if (command === '/lavoro-genera') {
            if (!game.user.isGM) {
              ui.notifications.error('Solo il GM può generare lavori!');
              return false;
            }

            const params = parameters.split(' ');
            const type = params[0] || null;
            const difficulty = params[1] || 'medium';

            const jobsSystem = game.brancalonia?.dirtyJobs || window.DirtyJobsSystem;
            if (jobsSystem) {
              const job = await jobsSystem.generateJob(type, difficulty);
              if (job) {
                ChatMessage.create({
                  content: `Lavoro generato: ${job.name}`,
                  speaker: { alias: 'Sistema Lavori' }
                });
              }
            }
            return false;
          }

          // Comando per mostrare dialog generazione
          if (command === '/lavoro-dialog') {
            if (!game.user.isGM) {
              ui.notifications.error('Solo il GM può generare lavori!');
              return false;
            }

            const jobsSystem = game.brancalonia?.dirtyJobs || window.DirtyJobsSystem;
            if (jobsSystem) {
              jobsSystem.showJobGeneratorDialog();
            }
            return false;
          }

          // Comando per lavoro casuale
          if (command === '/lavoro-random') {
            if (!game.user.isGM) {
              ui.notifications.error('Solo il GM può generare lavori!');
              return false;
            }

            const jobsSystem = game.brancalonia?.dirtyJobs || window.DirtyJobsSystem;
            if (jobsSystem && jobsSystem.jobTypes) {
              const types = Object.keys(jobsSystem.jobTypes);
              const randomType = types[Math.floor(Math.random() * types.length)];
              const difficulties = ['easy', 'medium', 'hard'];
              const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

              await jobsSystem.generateJob(randomType, randomDifficulty);
            }
            return false;
          }

          // Comando per listare tipi di lavoro
          if (command === '/lavoro-tipi') {
            const jobsSystem = game.brancalonia?.dirtyJobs || window.DirtyJobsSystem;
            if (jobsSystem && jobsSystem.jobTypes) {
              const types = Object.entries(jobsSystem.jobTypes);
              const content = `
                <div class="brancalonia-help">
                  <h3>Tipi di Lavoro Disponibili</h3>
                  <ul>
                    ${types.map(([key, data]) => `<li><strong>${key}</strong>: ${data.name}</li>`).join('')}
                  </ul>
                  <p><em>Usa /lavoro-genera [tipo] [difficoltà] per generare un lavoro specifico</em></p>
                </div>
              `;

              ChatMessage.create({
                content,
                speaker: { alias: 'Sistema Lavori' },
                whisper: [game.user.id]
              });
            }
            return false;
          }

          // Comando help
          if (command === '/lavoro-help') {
            const helpText = `
              <div class="brancalonia-help">
                <h3>Comandi Lavori Sporchi</h3>
                <ul>
                  <li><strong>/lavoro-genera [tipo] [difficoltà]</strong> - Genera lavoro specifico</li>
                  <li><strong>/lavoro-dialog</strong> - Dialog generazione avanzata</li>
                  <li><strong>/lavoro-random</strong> - Lavoro completamente casuale</li>
                  <li><strong>/lavoro-tipi</strong> - Lista tipi disponibili</li>
                  <li><strong>/lavoro-help</strong> - Mostra questo aiuto</li>
                </ul>
                <h4>Tipi:</h4>
                <p>robbery, extortion, smuggling, escort, assassination, spying, heist, sabotage</p>
                <h4>Difficoltà:</h4>
                <p>easy, medium, hard</p>
              </div>
            `;

            ChatMessage.create({
              content: helpText,
              speaker: { alias: 'Sistema Lavori' },
              whisper: [game.user.id]
            });
            return false;
          }

          // Se è un comando lavoro ma non riconosciuto
          if (content.startsWith('/lavoro-')) {
            ui.notifications.warn('Comando lavoro non riconosciuto. Usa /lavoro-help per aiuto.');
            return false;
          }

          return true;
        } catch (error) {
          this._statistics.errors.push(`Chat command: ${error.message}`);
          logger.error(this.MODULE_NAME, 'Errore esecuzione comando chat', error);
          return true;
        }
      });

      logger.debug?.(this.MODULE_NAME, 'Comandi chat registrati');
    } catch (error) {
      this._statistics.errors.push(`Chat commands registration: ${error.message}`);
      logger.error(this.MODULE_NAME, 'Errore registrazione comandi chat', error);
      throw error;
    }
  }

  /**
   * Crea macro per generazione lavori
   * @private
   * @static
   */
  static _createMacro() {
    try {
      // Verifica se game.macros è disponibile
      if (!game?.macros) {
        // Debug silenzioso - riprova automaticamente durante init
        logger.debug(
          this.MODULE_NAME,
          'game.macros non ancora disponibile, retry automatico...'
        );

        // Riprova dopo un breve delay, ma solo se non siamo già in un retry
        if (!this._macroRetryCount) {
          this._macroRetryCount = 0;
        }
        if (this._macroRetryCount < 3) {
          this._macroRetryCount++;
          setTimeout(() => this._createMacro(), 2000);
        } else {
          logger.debug(this.MODULE_NAME, 'Macro creation skipped (game.macros not available)');
        }
        return;
      }

      // Reset del contatore se siamo arrivati qui
      this._macroRetryCount = 0;

      const macroData = {
        name: 'Generatore Lavori Sporchi',
        type: 'script',
        scope: 'global',
        command: `
// Macro per Generazione Lavori Sporchi
if (!game.user.isGM) {
  ui.notifications.error("Solo il GM può utilizzare questa macro!");
} else {
  const choice = await foundry.appv1.sheets.Dialog.confirm({
    title: "Generatore Lavori",
    content: "<p>Vuoi aprire il dialog di generazione avanzata o generare un lavoro casuale?</p>",
    yes: () => "dialog",
    no: () => "random"
  });

  if (choice === "dialog") {
    window.DirtyJobsSystem.showJobGeneratorDialog();
  } else if (choice === "random") {
    const types = Object.keys(window.DirtyJobsSystem.jobTypes);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const difficulties = ["easy", "medium", "hard"];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    await window.DirtyJobsSystem.generateJob(randomType, randomDifficulty);
  }
}
        `,
        img: 'icons/containers/bags/sack-leather-gold.webp',
        flags: {
          'brancalonia-bigat': {
            isSystemMacro: true,
            version: '3.0'
          }
        }
      };

      // Verifica se la macro esiste già
      const existingMacro = game?.macros?.find(m => 
        m.name === macroData.name && m.flags['brancalonia-bigat']?.isSystemMacro
      );

      if (!existingMacro) {
        Macro.create(macroData).then(() => {
          this._statistics.macrosCreated++;
          logger.info(this.MODULE_NAME, 'Macro Generatore Lavori Sporchi creata');
        }).catch(error => {
          this._statistics.errors.push(`Macro creation: ${error.message}`);
          logger.warn(this.MODULE_NAME, 'Errore creazione macro', error);
        });
      }
    } catch (error) {
      this._statistics.errors.push(`_createMacro: ${error.message}`);
      logger.error(this.MODULE_NAME, 'Errore in _createMacro', error);
    }
  }

  /**
   * Genera un nuovo lavoro sporco
   * 
   * @async
   * @param {string|null} type - Tipo lavoro (null = casuale)
   * @param {string} difficulty - Difficoltà (easy, medium, hard)
   * @param {Object} options - Opzioni aggiuntive
   * @returns {Promise<JournalEntry|null>} Journal entry creato
   * 
   * @example
   * const job = await dirtyJobs.generateJob('robbery', 'hard');
   */
  async generateJob(type = null, difficulty = 'medium', options = {}) {
    const startTime = performance.now();

    try {
      // Seleziona tipo casuale se non specificato
      if (!type) {
        const types = Object.keys(this.jobTypes);
        type = types[Math.floor(Math.random() * types.length)];
      }

      const jobData = this.jobTypes[type];
      if (!jobData) {
        ui.notifications.error('Tipo di lavoro non valido!');
        logger.warn(DirtyJobsSystem.MODULE_NAME, `Tipo lavoro invalido: ${type}`);
        return null;
      }

      const difficultyData = jobData.difficulty[difficulty];
      if (!difficultyData) {
        ui.notifications.error('Difficoltà non valida!');
        logger.warn(DirtyJobsSystem.MODULE_NAME, `Difficoltà invalida: ${difficulty}`);
        return null;
      }

      // Genera committente
      const client = this._generateClient();

      // Calcola ricompensa
      const rewardRoll = await new Roll(difficultyData.reward).evaluate();
      const finalReward = Math.floor(rewardRoll.total * client.payModifier);

      // Genera complicazione (25% di probabilità, o opzionale garantita)
      let complication = null;
      if (options.guaranteedComplication || Math.random() < 0.25) {
        complication = jobData.complications[
          Math.floor(Math.random() * jobData.complications.length)
        ];
        if (complication) {
          DirtyJobsSystem._statistics.complicationsTriggered++;
        }
      }

      // Genera scadenza
      const deadline = this._generateDeadline(difficulty, options.urgentJob);

      // Crea dati del lavoro
      const job = {
        id: foundry.utils.randomID(),
        type,
        name: `${jobData.name} - ${client.name}`,
        difficulty,
        dc: difficultyData.dc,
        client,
        reward: finalReward,
        infamyGain: difficultyData.infamy,
        complication,
        deadline,
        requiredSkills: jobData.skills,
        status: 'available',
        createdAt: new Date().toISOString()
      };

      // Crea pagine del journal conforme a V13
      const pages = [
        {
          name: 'Dettagli Lavoro',
          type: 'text',
          text: {
            content: this._generateJobDescription(job),
            format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
          }
        },
        {
          name: 'Note Private',
          type: 'text',
          text: {
            content: `<h3>Note del GM</h3>
              <p><strong>DC Base:</strong> ${job.dc}</p>
              <p><strong>Affidabilità Cliente:</strong> ${Math.floor(client.trustworthy * 100)}%</p>
              ${complication ? `<p><strong>Complicazione:</strong> ${complication}</p>` : ''}
              <p><em>Modificare secondo necessità</em></p>`,
            format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
          },
          ownership: {
            default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE
          }
        }
      ];

      // Crea il journal entry
      const journalData = {
        name: job.name,
        pages,
        img: jobData.icon,
        flags: {
          brancalonia: {
            isJob: true,
            jobData: job
          }
        }
      };

      const journal = await JournalEntry.create(journalData);

      // Aggiorna statistiche
      DirtyJobsSystem._statistics.jobsGenerated++;
      DirtyJobsSystem._statistics.jobsByType[type]++;

      const generationTime = performance.now() - startTime;
      logger.info(
        DirtyJobsSystem.MODULE_NAME,
        `Lavoro generato: ${job.name} (${generationTime.toFixed(2)}ms)`
      );

      // Notifica creazione (se abilitata)
      if (game.settings.get('brancalonia-bigat', 'dirtyJobsNotifications')) {
        ChatMessage.create({
          content: `
            <div class="brancalonia-job-available">
              <h3>🎯 Nuovo Lavoro Disponibile!</h3>
              <p><strong>${job.name}</strong></p>
              <p>Difficoltà: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
              <p>Ricompensa: ${finalReward} ducati</p>
              <p>Scadenza: ${deadline}</p>
              ${complication ? `<p class="warning">⚠️ Possibili complicazioni</p>` : ''}
            </div>
          `,
          speaker: { alias: 'Bacheca Lavori' }
        });
      }

      // Emit event
      Hooks.callAll('dirty-jobs:job-generated', {
        job,
        journal,
        generationTime
      });

      return journal;
    } catch (error) {
      DirtyJobsSystem._statistics.errors.push(`generateJob: ${error.message}`);
      logger.error(DirtyJobsSystem.MODULE_NAME, 'Errore generazione lavoro', error);
      ui.notifications.error('Errore nella generazione del lavoro!');
      return null;
    }
  }

  /**
   * Mostra dialog per generare lavoro
   * 
   * @example
   * dirtyJobs.showJobGeneratorDialog();
   */
  showJobGeneratorDialog() {
    try {
      DirtyJobsSystem._statistics.dialogsOpened++;

      const content = `
        <form>
          <div class="form-group">
            <label>Tipo di Lavoro:</label>
            <select id="job-type">
              <option value="">Casuale</option>
              ${Object.entries(this.jobTypes).map(([key, data]) =>
        `<option value="${key}">${data.name}</option>`
      ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Difficoltà:</label>
            <select id="job-difficulty">
              <option value="easy">Facile</option>
              <option value="medium" selected>Media</option>
              <option value="hard">Difficile</option>
            </select>
          </div>
          <div class="form-group">
            <label>Opzioni:</label>
            <div>
              <label>
                <input type="checkbox" id="guaranteed-complication" />
                Complicazione Garantita
              </label>
            </div>
            <div>
              <label>
                <input type="checkbox" id="urgent-job" />
                Lavoro Urgente (scadenza ridotta)
              </label>
            </div>
          </div>
        </form>
      `;

      new foundry.appv1.sheets.Dialog({
        title: 'Generatore Lavori Sporchi',
        content,
        buttons: {
          generate: {
            icon: '<i class="fas fa-coins"></i>',
            label: 'Genera',
            callback: async (html) => {
              try {
                const form = html[0].querySelector('form');
                const type = form.querySelector('#job-type').value || null;
                const difficulty = form.querySelector('#job-difficulty').value;
                const options = {
                  guaranteedComplication: form.querySelector('#guaranteed-complication').checked,
                  urgentJob: form.querySelector('#urgent-job').checked
                };

                await this.generateJob(type, difficulty, options);
              } catch (error) {
                DirtyJobsSystem._statistics.errors.push(`Dialog callback: ${error.message}`);
                logger.error(DirtyJobsSystem.MODULE_NAME, 'Errore dialog callback', error);
                ui.notifications.error('Errore nella generazione del lavoro!');
              }
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Annulla'
          }
        },
        default: 'generate'
      }).render(true);

      logger.debug?.(DirtyJobsSystem.MODULE_NAME, 'Dialog generazione aperto');

      // Emit event
      Hooks.callAll('dirty-jobs:dialog-opened', {
        dialogsOpened: DirtyJobsSystem._statistics.dialogsOpened
      });
    } catch (error) {
      DirtyJobsSystem._statistics.errors.push(`showJobGeneratorDialog: ${error.message}`);
      logger.error(DirtyJobsSystem.MODULE_NAME, 'Errore apertura dialog', error);
      ui.notifications.error('Errore nell\'apertura del dialog!');
    }
  }

  /**
   * Gestisce il completamento di un lavoro
   * @private
   * @param {JournalEntry} journal - Journal entry del lavoro
   */
  _handleJobCompletion(journal) {
    try {
      const job = journal.flags.brancalonia?.jobData;
      if (!job) {
        logger.warn(DirtyJobsSystem.MODULE_NAME, 'Job data mancante nel journal');
        return;
      }

      DirtyJobsSystem._statistics.jobsCompleted++;
      DirtyJobsSystem._statistics.totalGoldEarned += job.reward;
      DirtyJobsSystem._statistics.totalInfamyGained += job.infamyGain;

      logger.info(
        DirtyJobsSystem.MODULE_NAME,
        `Lavoro completato: ${job.name} (${job.reward} oro, ${job.infamyGain} infamia)`
      );

      // Notifica completamento (se auto-reward abilitato)
      if (game.settings.get('brancalonia-bigat', 'dirtyJobsAutoReward')) {
        ChatMessage.create({
          content: `
            <div class="brancalonia-job-completed">
              <h3>✅ Lavoro Completato!</h3>
              <p><strong>${job.name}</strong></p>
              <p>Ricompensa: ${job.reward} ducati</p>
              <p>Infamia guadagnata: ${job.infamyGain}</p>
            </div>
          `,
          speaker: { alias: 'Sistema Lavori' }
        });
      }

      // Emit event
      Hooks.callAll('dirty-jobs:job-completed', {
        job,
        journal,
        totalCompleted: DirtyJobsSystem._statistics.jobsCompleted
      });
    } catch (error) {
      DirtyJobsSystem._statistics.errors.push(`_handleJobCompletion: ${error.message}`);
      logger.error(DirtyJobsSystem.MODULE_NAME, 'Errore gestione completamento', error);
    }
  }

  /**
   * Genera un committente casuale
   * @private
   * @returns {Client} Committente
   */
  _generateClient() {
    return this.clients[Math.floor(Math.random() * this.clients.length)];
  }

  /**
   * Genera una scadenza per il lavoro
   * @private
   * @param {string} difficulty - Difficoltà
   * @param {boolean} urgent - Se il lavoro è urgente
   * @returns {string} Scadenza
   */
  _generateDeadline(difficulty, urgent = false) {
    const baseDays = {
      easy: 7,
      medium: 5,
      hard: 3
    };

    let days = baseDays[difficulty] || 5;
    if (urgent) {
      days = Math.max(1, Math.floor(days / 2));
    }

    return `${days} ${days === 1 ? 'giorno' : 'giorni'}`;
  }

  /**
   * Genera descrizione HTML del lavoro
   * @private
   * @param {DirtyJob} job - Dati del lavoro
   * @returns {string} HTML descrizione
   */
  _generateJobDescription(job) {
    const jobType = this.jobTypes[job.type];
    return `
      <div class="dirty-job-description">
        <h2>${job.name}</h2>
        
        <div class="job-info">
          <p><strong>Committente:</strong> ${job.client.name}</p>
          <p><strong>Tipo:</strong> ${jobType.name}</p>
          <p><strong>Difficoltà:</strong> ${job.difficulty.charAt(0).toUpperCase() + job.difficulty.slice(1)}</p>
          <p><strong>Ricompensa:</strong> ${job.reward} ducati</p>
          <p><strong>Scadenza:</strong> ${job.deadline}</p>
        </div>

        <hr>

        <h3>📜 Descrizione</h3>
        <p>${this._generateJobNarrative(job)}</p>

        <h3>🎯 Obiettivo</h3>
        <p>Completare il lavoro superando una prova con DC ${job.dc}.</p>

        <h3>⚙️ Skills Richieste</h3>
        <p>${job.requiredSkills.join(', ')}</p>

        ${job.complication ? `
          <div class="warning-box">
            <h3>⚠️ Attenzione</h3>
            <p>Ci sono voci di possibili complicazioni...</p>
          </div>
        ` : ''}

        <hr>
        <p class="job-status">
          <strong>Stato:</strong> <span class="status-${job.status}">${
      job.status === 'available' ? 'Disponibile' :
        job.status === 'accepted' ? 'Accettato' :
          job.status === 'completed' ? 'Completato' :
            'Fallito'
    }</span>
        </p>
      </div>
    `;
  }

  /**
   * Genera narrativa per il lavoro
   * @private
   * @param {DirtyJob} job - Dati del lavoro
   * @returns {string} Narrativa
   */
  _generateJobNarrative(job) {
    const narratives = {
      robbery: [
        `${job.client.name} vuole che derubiate un ricco mercante che transita in città.`,
        `C'è una cassaforte piena d'oro che aspetta solo di essere svuotata.`,
        `Un nobile tiene i suoi risparmi in casa. Tempo di una visita notturna.`
      ],
      extortion: [
        `${job.client.name} ha bisogno che convinciate un debitore a pagare.`,
        `Un mercante si rifiuta di pagare la "protezione". Dategli una lezione.`,
        `C'è chi non rispetta gli accordi. Fateli cambiare idea.`
      ],
      smuggling: [
        `Trasportate questa merce oltre i confini senza farvi beccare.`,
        `${job.client.name} ha della merce "speciale" che deve arrivare a destinazione.`,
        `Evitate i dazi e consegnate il carico entro ${job.deadline}.`
      ],
      escort: [
        `Scortate ${job.client.name} attraverso territori pericolosi.`,
        `Un mercante ha bisogno di protezione per il suo viaggio.`,
        `Assicuratevi che il carico arrivi integro a destinazione.`
      ],
      assassination: [
        `${job.client.name} vuole che qualcuno... sparisca. Permanentemente.`,
        `C'è un problema che richiede una soluzione definitiva.`,
        `Eliminate il bersaglio senza lasciare tracce.`
      ],
      spying: [
        `Scoprite cosa sta tramando il rivale di ${job.client.name}.`,
        `Infiltratevi e raccogliete informazioni compromettenti.`,
        `${job.client.name} vuole sapere tutto sui movimenti del suo nemico.`
      ],
      heist: [
        `Il colpo del secolo! ${job.client.name} ha individuato un bersaglio succoso.`,
        `Pianificate ed eseguite il furto perfetto.`,
        `Un tesoro vi aspetta, se siete abbastanza abili da prenderlo.`
      ],
      sabotage: [
        `Distruggete le operazioni del rivale di ${job.client.name}.`,
        `Fate in modo che un certo progetto non veda mai la luce.`,
        `Sabotate senza farvi scoprire. La discrezione è fondamentale.`
      ]
    };

    const typeNarratives = narratives[job.type] || ['Un lavoro sporco vi attende.'];
    return typeNarratives[Math.floor(Math.random() * typeNarratives.length)];
  }

  // ================================================
  // PUBLIC API
  // ================================================

  /**
   * Ottiene lo stato del modulo
   * @static
   * @returns {Object} Stato corrente
   * @example
   * const status = DirtyJobsSystem.getStatus();
   */
  static getStatus() {
    return {
      version: this.VERSION,
      initialized: this._state.initialized,
      enabled: game.settings.get('brancalonia-bigat', 'dirtyJobsEnabled'),
      autoReward: game.settings.get('brancalonia-bigat', 'dirtyJobsAutoReward'),
      jobTypes: Object.keys(this._state.instance?.jobTypes || {}).length,
      clients: this._state.instance?.clients?.length || 0
    };
  }

  /**
   * Ottiene le statistiche del modulo
   * @static
   * @returns {DirtyJobStatistics} Statistiche correnti
   * @example
   * const stats = DirtyJobsSystem.getStatistics();
   */
  static getStatistics() {
    return {
      ...this._statistics,
      jobsByType: { ...this._statistics.jobsByType },
      errors: [...this._statistics.errors]
    };
  }

  /**
   * Resetta le statistiche
   * @static
   * @example
   * DirtyJobsSystem.resetStatistics();
   */
  static resetStatistics() {
    logger.info(this.MODULE_NAME, 'Reset statistiche Dirty Jobs');

    const initTime = this._statistics.initTime;
    const macrosCreated = this._statistics.macrosCreated;

    this._statistics = {
      initTime,
      jobsGenerated: 0,
      jobsCompleted: 0,
      jobsFailed: 0,
      totalGoldEarned: 0,
      totalInfamyGained: 0,
      dialogsOpened: 0,
      chatCommandsExecuted: 0,
      complicationsTriggered: 0,
      macrosCreated,
      jobsByType: {},
      errors: []
    };

    // Re-inizializza jobsByType
    if (this._state.instance) {
      Object.keys(this._state.instance.jobTypes).forEach(type => {
        this._statistics.jobsByType[type] = 0;
      });
    }
  }

  /**
   * Ottiene lista tipi lavoro
   * @static
   * @returns {Object} Tipi lavoro disponibili
   * @example
   * const types = DirtyJobsSystem.getJobTypes();
   */
  static getJobTypes() {
    return this._state.instance?.jobTypes || {};
  }

  /**
   * Ottiene lista committenti
   * @static
   * @returns {Client[]} Committenti disponibili
   * @example
   * const clients = DirtyJobsSystem.getClients();
   */
  static getClients() {
    return this._state.instance?.clients || [];
  }

  /**
   * Genera lavoro via API statica
   * @static
   * @async
   * @param {string} type - Tipo lavoro
   * @param {string} difficulty - Difficoltà
   * @param {Object} options - Opzioni
   * @returns {Promise<JournalEntry|null>}
   * @example
   * const job = await DirtyJobsSystem.generateJobViaAPI('heist', 'hard');
   */
  static async generateJobViaAPI(type, difficulty, options) {
    if (!this._state.instance) {
      logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
      return null;
    }
    return await this._state.instance.generateJob(type, difficulty, options);
  }

  /**
   * Apre dialog via API statica
   * @static
   * @example
   * DirtyJobsSystem.openDialog();
   */
  static openDialog() {
    if (!this._state.instance) {
      logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
      return;
    }
    this._state.instance.showJobGeneratorDialog();
  }

  /**
   * Mostra report completo
   * @static
   * @example
   * DirtyJobsSystem.showReport();
   */
  static showReport() {
    const stats = this.getStatistics();
    const status = this.getStatus();

    console.group(`📊 ${this.MODULE_NAME} Report v${this.VERSION}`);
    console.log('Status:', status);
    console.log('Statistiche:', stats);
    console.groupEnd();

    ui.notifications.info(
      `📊 Report Dirty Jobs: ${stats.jobsGenerated} generati, ${stats.jobsCompleted} completati`
    );
  }
}

// NOTA: L'inizializzazione è gestita da BrancaloniaCore
// Esporta per compatibilità e scoperta da parte di BrancaloniaCore
window.DirtyJobsSystemClass = DirtyJobsSystem;
window.DirtyJobsSystem = DirtyJobsSystem; // Placeholder, sarà instance dopo init
window.DirtyJobs = DirtyJobsSystem; // For module loader
window['dirty-jobs'] = DirtyJobsSystem; // For module loader

// Export ES6
export default DirtyJobsSystem;
