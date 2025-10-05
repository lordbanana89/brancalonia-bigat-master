/**
 * @fileoverview Sistema Comandi Chat per Brancalonia
 * 
 * Sistema centralizzato per gestire tutti i comandi chat del modulo Brancalonia.
 * Fornisce 13 comandi con routing, validazione permessi, error handling e statistics.
 * 
 * @version 2.0.0
 * @author Brancalonia Module Team
 * @requires brancalonia-logger.js
 */

import { logger } from './brancalonia-logger.js';

/**
 * @typedef {Object} CommandDefinition
 * @property {string} description - Descrizione comando
 * @property {string} usage - Sintassi uso
 * @property {Function} handler - Handler function
 * @property {boolean} gmOnly - Se richiede permessi GM
 */

/**
 * @typedef {Object} ChatCommandsStatistics
 * @property {number} initTime - Tempo inizializzazione (ms)
 * @property {number} commandsRegistered - Numero comandi registrati
 * @property {number} commandsExecuted - Totale comandi eseguiti
 * @property {Object<string, number>} commandsByType - Contatori per tipo
 * @property {number} successfulCommands - Comandi riusciti
 * @property {number} failedCommands - Comandi falliti
 * @property {number} permissionDenied - Permessi negati
 * @property {number} averageExecutionTime - Tempo medio esecuzione (ms)
 * @property {Array<{type: string, command: string, message: string, timestamp: number}>} errors - Lista errori
 */

/**
 * Sistema Comandi Chat Brancalonia
 * 
 * Gestisce tutti i comandi chat del modulo con logging completo,
 * statistics tracking, error handling e event emission.
 * 
 * @class BrancaloniaChatCommands
 * @static
 */
class BrancaloniaChatCommands {
  static VERSION = '2.0.0';
  static MODULE_NAME = 'Chat Commands';
  static ID = 'brancalonia-chat-commands';
  static NAMESPACE = 'brancalonia-bigat';
  
  /**
   * @type {ChatCommandsStatistics}
   */
  static statistics = {
    initTime: 0,
    commandsRegistered: 0,
    commandsExecuted: 0,
    commandsByType: {},
    successfulCommands: 0,
    failedCommands: 0,
    permissionDenied: 0,
    averageExecutionTime: 0,
    errors: []
  };
  
  /**
   * @private
   * @type {{initialized: boolean, commands: Object<string, CommandDefinition>}}
   */
  static _state = {
    initialized: false,
    commands: {}
  };
  
  /**
   * Inizializza il sistema comandi
   * @static
   * @returns {void}
   * @fires chat-commands:initialized
   */
  static initialize() {
    logger.startPerformance('chat-commands-init');
    logger.info(this.MODULE_NAME, `Inizializzazione Chat Commands v${this.VERSION}...`);
    
    try {
      // Registra handler principale
      Hooks.on('chatMessage', this.handleChatMessage.bind(this));
      logger.debug(this.MODULE_NAME, 'Hook chatMessage registrato');
      
      // Registra comandi disponibili
      this.registerCommands();
      
      this._state.initialized = true;
      
      const initTime = logger.endPerformance('chat-commands-init');
      this.statistics.initTime = initTime;
      
      logger.info(this.MODULE_NAME, `✅ Chat Commands inizializzato in ${initTime?.toFixed(2)}ms`);
      logger.info(this.MODULE_NAME, `Comandi registrati: ${this.statistics.commandsRegistered}`);
      
      // Emit event
      logger.events.emit('chat-commands:initialized', {
        version: this.VERSION,
        commandsRegistered: this.statistics.commandsRegistered,
        initTime,
        timestamp: Date.now()
      });
      
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore inizializzazione', error);
      this.statistics.errors.push({
        type: 'initialization',
        command: 'system',
        message: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }
  
  /**
   * Registra tutti i comandi disponibili
   * @static
   * @private
   * @returns {void}
   */
  static registerCommands() {
    logger.debug(this.MODULE_NAME, 'Registrazione comandi...');
    
    this._state.commands = {
      // Sistema Infamia
      '/infamia': {
        description: 'Gestione infamia',
        usage: '/infamia [add|remove|set|get] [valore]',
        handler: this.handleInfamia.bind(this),
        gmOnly: true
      },
      
      // Haven System
      '/haven': {
        description: 'Gestione rifugio',
        usage: '/haven [create|upgrade|list|info]',
        handler: this.handleHaven.bind(this),
        gmOnly: true
      },
      '/rifugio': {
        description: 'Alias per /haven',
        usage: '/rifugio [create|upgrade|list|info]',
        handler: this.handleHaven.bind(this),
        gmOnly: true
      },
      
      // Compagnia
      '/compagnia': {
        description: 'Gestione compagnia',
        usage: '/compagnia [add|remove|list|info]',
        handler: this.handleCompagnia.bind(this),
        gmOnly: true
      },
      
      // Menagramo
      '/menagramo': {
        description: 'Tira il menagramo',
        usage: '/menagramo [personaggio]',
        handler: this.handleMenagramo.bind(this),
        gmOnly: false
      },
      
      // Bagordi/Baraonda
      '/bagordi': {
        description: 'Eventi taverna',
        usage: '/bagordi',
        handler: this.handleBagordi.bind(this),
        gmOnly: true
      },
      '/baraonda': {
        description: 'Sistema baraonda',
        usage: '/baraonda [start|stop|chaos|event]',
        handler: this.handleBaraonda.bind(this),
        gmOnly: true
      },
      
      // Lavori Sporchi
      '/lavoro': {
        description: 'Genera lavoro sporco',
        usage: '/lavoro [facile|medio|difficile]',
        handler: this.handleLavoro.bind(this),
        gmOnly: true
      },
      
      // Malattie
      '/malattia': {
        description: 'Sistema malattie',
        usage: '/malattia [check|apply|cure]',
        handler: this.handleMalattia.bind(this),
        gmOnly: true
      },
      
      // Duelli
      '/duello': {
        description: 'Inizia un duello',
        usage: '/duello [sfidante] [sfidato]',
        handler: this.handleDuello.bind(this),
        gmOnly: true
      },
      
      // Fazioni
      '/fazione': {
        description: 'Gestione fazioni',
        usage: '/fazione [nome] [+/-] [valore]',
        handler: this.handleFazione.bind(this),
        gmOnly: true
      },
      
      // Help
      '/brancalonia': {
        description: 'Mostra help comandi',
        usage: '/brancalonia [help|info|version]',
        handler: this.handleHelp.bind(this),
        gmOnly: false
      }
    };
    
    // Conta comandi e inizializza statistics
    this.statistics.commandsRegistered = Object.keys(this._state.commands).length;
    
    // Inizializza contatori per tipo
    for (const cmd of Object.keys(this._state.commands)) {
      this.statistics.commandsByType[cmd] = 0;
    }
    
    logger.info(this.MODULE_NAME, `✅ ${this.statistics.commandsRegistered} comandi registrati`);
  }
  
  /**
   * Handler principale per i messaggi chat
   * @static
   * @param {HTMLElement} html - HTML del messaggio
   * @param {string} content - Contenuto testuale
   * @param {Object} msg - Messaggio dati
   * @returns {boolean} False se comando gestito, true altrimenti
   * @fires chat-commands:command-executed
   * @fires chat-commands:command-failed
   * @fires chat-commands:permission-denied
   */
  static handleChatMessage(html, content, msg) {
    // Controlla se è un comando
    if (!content.startsWith('/')) return true;
    
    const args = content.split(' ');
    const command = args[0].toLowerCase();
    
    // Cerca il comando
    const cmdData = this._state.commands[command];
    if (!cmdData) return true;
    
    logger.debug(this.MODULE_NAME, `Comando ricevuto: ${command}`);
    logger.startPerformance(`cmd-${command}`);
    
    // Controlla permessi GM
    if (cmdData.gmOnly && !game.user.isGM) {
      logger.warn(this.MODULE_NAME, `Permesso negato per ${command} (user: ${game.user.name})`);
      ui.notifications.warn(`Solo il GM può usare ${command}`);
      
      this.statistics.permissionDenied++;
      
      // Emit event
      logger.events.emit('chat-commands:permission-denied', {
        command,
        user: game.user.name,
        timestamp: Date.now()
      });
      
      return false;
    }
    
    // Esegui handler
    try {
      cmdData.handler(args.slice(1), msg);
      
      const execTime = logger.endPerformance(`cmd-${command}`);
      
      // Update statistics
      this.statistics.commandsExecuted++;
      this.statistics.successfulCommands++;
      this.statistics.commandsByType[command] = (this.statistics.commandsByType[command] || 0) + 1;
      
      // Update average execution time
      const totalTime = this.statistics.averageExecutionTime * (this.statistics.commandsExecuted - 1) + execTime;
      this.statistics.averageExecutionTime = totalTime / this.statistics.commandsExecuted;
      
      logger.info(this.MODULE_NAME, `✅ Comando ${command} eseguito in ${execTime?.toFixed(2)}ms`);
      
      // Emit event
      logger.events.emit('chat-commands:command-executed', {
        command,
        user: game.user.name,
        execTime,
        timestamp: Date.now()
      });
      
    } catch (error) {
      logger.endPerformance(`cmd-${command}`);
      logger.error(this.MODULE_NAME, `Errore comando ${command}`, error);
      ui.notifications.error(`Errore eseguendo ${command}`);
      
      // Update statistics
      this.statistics.failedCommands++;
      this.statistics.errors.push({
        type: 'command-execution',
        command,
        message: error.message,
        timestamp: Date.now()
      });
      
      // Emit event
      logger.events.emit('chat-commands:command-failed', {
        command,
        error: error.message,
        timestamp: Date.now()
      });
    }
    
    // Previeni messaggio normale
    return false;
  }
  
  /**
   * Handler comando infamia
   * @static
   * @async
   * @param {Array<string>} args - Argomenti comando
   * @param {Object} msg - Messaggio originale
   * @returns {Promise<void>}
   */
  static async handleInfamia(args, msg) {
    try {
      const action = args[0]?.toLowerCase();
      const value = parseInt(args[1]) || 0;
      
      logger.debug(this.MODULE_NAME, `/infamia: action=${action}, value=${value}`);
      
      // Ottieni attore selezionato
      const actor = canvas.tokens.controlled[0]?.actor;
      if (!actor) {
        logger.warn(this.MODULE_NAME, '/infamia: Nessun token selezionato');
        ui.notifications.warn("Seleziona un token!");
        return;
      }
      
      const infamiaSystem = game.brancalonia?.api;
      if (!infamiaSystem) {
        logger.error(this.MODULE_NAME, '/infamia: Sistema Infamia non disponibile');
        ui.notifications.error("Sistema Infamia non disponibile!");
        return;
      }
      
      switch(action) {
        case 'add':
          await infamiaSystem.addInfamia(actor, value);
          logger.info(this.MODULE_NAME, `/infamia add: ${value} per ${actor.name}`);
          break;
        case 'remove':
          await infamiaSystem.addInfamia(actor, -value);
          logger.info(this.MODULE_NAME, `/infamia remove: ${value} per ${actor.name}`);
          break;
        case 'set':
          await infamiaSystem.setInfamia(actor, value);
          logger.info(this.MODULE_NAME, `/infamia set: ${value} per ${actor.name}`);
          break;
        case 'get':
        default:
          const current = infamiaSystem.getInfamia(actor);
          const level = infamiaSystem.getInfamiaLevel(actor);
          await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor }),
            content: `<div class="brancalonia-infamia">
              <strong>${actor.name}</strong>
              <p>Infamia: ${current}</p>
              <p>Livello: ${level.name}</p>
            </div>`
          });
          logger.info(this.MODULE_NAME, `/infamia get: ${current} (${level.name}) per ${actor.name}`);
      }
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore /infamia', error);
      ui.notifications.error('Errore eseguendo /infamia');
      throw error;
    }
  }
  
  /**
   * Handler comando haven
   * @static
   * @async
   * @param {Array<string>} args - Argomenti comando
   * @param {Object} msg - Messaggio originale
   * @returns {Promise<void>}
   */
  static async handleHaven(args, msg) {
    try {
      const action = args[0]?.toLowerCase();
      logger.debug(this.MODULE_NAME, `/haven: action=${action}`);
      
      const havenSystem = game.brancalonia?.haven;
      if (!havenSystem) {
        logger.error(this.MODULE_NAME, '/haven: Sistema Haven non disponibile');
        ui.notifications.error("Sistema Haven non disponibile!");
        return;
      }
      
      switch(action) {
        case 'create':
          const name = args.slice(1).join(' ') || 'Nuovo Rifugio';
          await havenSystem.createHaven(name);
          logger.info(this.MODULE_NAME, `/haven create: ${name}`);
          break;
        case 'upgrade':
          await havenSystem.showUpgradeDialog();
          logger.info(this.MODULE_NAME, '/haven upgrade: Dialog mostrato');
          break;
        case 'list':
          await havenSystem.listHavens();
          logger.info(this.MODULE_NAME, '/haven list: Lista rifugi mostrata');
          break;
        case 'info':
        default:
          await havenSystem.showHavenInfo();
          logger.info(this.MODULE_NAME, '/haven info: Info rifugio mostrate');
      }
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore /haven', error);
      ui.notifications.error('Errore eseguendo /haven');
      throw error;
    }
  }
  
  /**
   * Handler comando compagnia
   * @static
   * @async
   * @param {Array<string>} args - Argomenti comando
   * @param {Object} msg - Messaggio originale
   * @returns {Promise<void>}
   */
  static async handleCompagnia(args, msg) {
    try {
      const action = args[0]?.toLowerCase();
      logger.debug(this.MODULE_NAME, `/compagnia: action=${action}`);
      
      const compagniaSystem = game.brancalonia?.compagnia;
      if (!compagniaSystem) {
        logger.error(this.MODULE_NAME, '/compagnia: Sistema Compagnia non disponibile');
        ui.notifications.error("Sistema Compagnia non disponibile!");
        return;
      }
      
      switch(action) {
        case 'add':
          const actor = canvas.tokens.controlled[0]?.actor;
          if (actor) {
            await compagniaSystem.addMember(actor);
            logger.info(this.MODULE_NAME, `/compagnia add: ${actor.name}`);
          } else {
            logger.warn(this.MODULE_NAME, '/compagnia add: Nessun token selezionato');
          }
          break;
        case 'remove':
          const removeActor = canvas.tokens.controlled[0]?.actor;
          if (removeActor) {
            await compagniaSystem.removeMember(removeActor);
            logger.info(this.MODULE_NAME, `/compagnia remove: ${removeActor.name}`);
          } else {
            logger.warn(this.MODULE_NAME, '/compagnia remove: Nessun token selezionato');
          }
          break;
        case 'list':
          await compagniaSystem.listMembers();
          logger.info(this.MODULE_NAME, '/compagnia list: Lista membri mostrata');
          break;
        case 'info':
        default:
          await compagniaSystem.showCompagniaInfo();
          logger.info(this.MODULE_NAME, '/compagnia info: Info compagnia mostrata');
      }
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore /compagnia', error);
      ui.notifications.error('Errore eseguendo /compagnia');
      throw error;
    }
  }
  
  /**
   * Handler comando menagramo
   * @static
   * @async
   * @param {Array<string>} args - Argomenti comando
   * @param {Object} msg - Messaggio originale
   * @returns {Promise<void>}
   */
  static async handleMenagramo(args, msg) {
    try {
      logger.debug(this.MODULE_NAME, '/menagramo: Tiro menagramo');
      
      const menagramoSystem = game.brancalonia?.menagramo;
      if (!menagramoSystem) {
        logger.error(this.MODULE_NAME, '/menagramo: Sistema Menagramo non disponibile');
        ui.notifications.error("Sistema Menagramo non disponibile!");
        return;
      }
      
      // Ottieni attore
      const actor = canvas.tokens.controlled[0]?.actor || game.user.character;
      if (!actor) {
        logger.warn(this.MODULE_NAME, '/menagramo: Nessun personaggio selezionato');
        ui.notifications.warn("Nessun personaggio selezionato!");
        return;
      }
      
      // Tira il menagramo
      const result = await menagramoSystem.rollMenagramo(actor);
      
      // Crea messaggio
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<div class="brancalonia-menagramo">
          <h3>🎲 Menagramo!</h3>
          <p><strong>${actor.name}</strong> tira il menagramo...</p>
          <p class="result">${result.effect}</p>
          <p><em>${result.description}</em></p>
        </div>`,
        flags: { 'brancalonia-bigat': { menagramo: true } }
      });
      
      logger.info(this.MODULE_NAME, `/menagramo: ${actor.name} - ${result.effect}`);
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore /menagramo', error);
      ui.notifications.error('Errore eseguendo /menagramo');
      throw error;
    }
  }
  
  /**
   * Handler comando bagordi
   * @static
   * @async
   * @param {Array<string>} args - Argomenti comando
   * @param {Object} msg - Messaggio originale
   * @returns {Promise<void>}
   */
  static async handleBagordi(args, msg) {
    try {
      logger.debug(this.MODULE_NAME, '/bagordi: Genera evento taverna');
      
      const bagordiEvents = [
        "Un menestrello inizia a cantare canzoni oscene!",
        "Qualcuno propone un brindisi alla Compagnia!",
        "Un avventore sfida qualcuno a braccio di ferro!",
        "L'oste offre un giro gratis!",
        "Una rissa scoppia nell'angolo!",
        "Un mercante misterioso si avvicina al tavolo...",
        "Le guardie entrano per un controllo di routine!",
        "Un ladro tenta di borseggiare qualcuno!",
        "Un vecchio racconta storie del Regno!",
        "Qualcuno accusa un altro di barare a carte!"
      ];
      
      const event = bagordiEvents[Math.floor(Math.random() * bagordiEvents.length)];
      
      await ChatMessage.create({
        speaker: { alias: "Evento Taverna" },
        content: `<div class="brancalonia-bagordi">
          <h3>🍺 Bagordi!</h3>
          <p><em>${event}</em></p>
        </div>`,
        flags: { 'brancalonia-bigat': { bagordi: true } }
      });
      
      logger.info(this.MODULE_NAME, `/bagordi: ${event}`);
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore /bagordi', error);
      ui.notifications.error('Errore eseguendo /bagordi');
      throw error;
    }
  }
  
  /**
   * Handler comando baraonda (deprecato - reindirizza a TavernBrawl)
   * @static
   * @param {Array<string>} args - Argomenti comando
   * @param {Object} msg - Messaggio originale
   * @returns {boolean} False
   */
  static handleBaraonda(args, msg) {
    try {
      logger.warn(this.MODULE_NAME, '/baraonda: Comando DEPRECATO richiamato');
      
      // BaraondaSystem è stato integrato in TavernBrawlSystem
      ui.notifications.warn(
        '⚠️ Il comando /baraonda è deprecato. Usa la macro "🍺 Gestione Risse" invece!'
      );
      
      ChatMessage.create({
        content: `
          <div style="border: 2px solid #f0ad4e; padding: 10px; background: #fcf8e3; border-radius: 5px;">
            <h3 style="color: #8a6d3b; margin-top: 0;">⚠️ Comando Deprecato</h3>
            <p>Il sistema <strong>Baraonda</strong> è stato integrato in <strong>TavernBrawlSystem</strong>.</p>
            <p><strong>Come usare il nuovo sistema:</strong></p>
            <ol>
              <li>Seleziona i token dei partecipanti</li>
              <li>Clicca la macro <strong>"🍺 Gestione Risse"</strong> dalla hotbar</li>
              <li>Usa i dialog visuali per gestire la rissa</li>
            </ol>
            <p style="margin-bottom: 0;"><em>Tutte le funzionalità di Baraonda sono disponibili nel nuovo sistema!</em></p>
          </div>
        `,
        speaker: { alias: 'Sistema Brancalonia' },
        whisper: [game.user.id]
      });
      
      return false;
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore /baraonda (deprecation message)', error);
      return false;
    }
  }
  
  /**
   * Handler comando lavoro
   * @static
   * @async
   * @param {Array<string>} args - Argomenti comando
   * @param {Object} msg - Messaggio originale
   * @returns {Promise<void>}
   */
  static async handleLavoro(args, msg) {
    try {
      const difficulty = args[0]?.toLowerCase() || 'medio';
      logger.debug(this.MODULE_NAME, `/lavoro: difficulty=${difficulty}`);
      
      const dirtyJobs = game.brancalonia?.dirtyJobs;
      if (!dirtyJobs) {
        logger.error(this.MODULE_NAME, '/lavoro: Sistema Lavori Sporchi non disponibile');
        ui.notifications.error("Sistema Lavori Sporchi non disponibile!");
        return;
      }
      
      const job = await dirtyJobs.generateJob(difficulty);
      
      await ChatMessage.create({
        speaker: { alias: "Lavoro Sporco" },
        content: `<div class="brancalonia-job">
          <h3>💼 ${job.title}</h3>
          <p><strong>Difficoltà:</strong> ${job.difficulty}</p>
          <p><strong>Ricompensa:</strong> ${job.reward} MR</p>
          <p><strong>Committente:</strong> ${job.client}</p>
          <p><em>${job.description}</em></p>
        </div>`,
        flags: { 'brancalonia-bigat': { dirtyJob: true } }
      });
      
      logger.info(this.MODULE_NAME, `/lavoro: ${job.title} (${difficulty}) - ${job.reward}MR`);
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore /lavoro', error);
      ui.notifications.error('Errore eseguendo /lavoro');
      throw error;
    }
  }
  
  /**
   * Handler comando malattia
   * @static
   * @async
   * @param {Array<string>} args - Argomenti comando
   * @param {Object} msg - Messaggio originale
   * @returns {Promise<void>}
   */
  static async handleMalattia(args, msg) {
    try {
      const action = args[0]?.toLowerCase();
      logger.debug(this.MODULE_NAME, `/malattia: action=${action}`);
      
      const diseaseSystem = game.brancalonia?.diseases;
      if (!diseaseSystem) {
        logger.error(this.MODULE_NAME, '/malattia: Sistema Malattie non disponibile');
        ui.notifications.error("Sistema Malattie non disponibile!");
        return;
      }
      
      const actor = canvas.tokens.controlled[0]?.actor;
      if (!actor && action !== 'list') {
        logger.warn(this.MODULE_NAME, '/malattia: Nessun token selezionato');
        ui.notifications.warn("Seleziona un token!");
        return;
      }
      
      switch(action) {
        case 'check':
          await diseaseSystem.checkDisease(actor);
          logger.info(this.MODULE_NAME, `/malattia check: ${actor.name}`);
          break;
        case 'apply':
          const disease = args[1] || 'random';
          await diseaseSystem.applyDisease(actor, disease);
          logger.info(this.MODULE_NAME, `/malattia apply: ${disease} a ${actor.name}`);
          break;
        case 'cure':
          await diseaseSystem.cureDisease(actor);
          logger.info(this.MODULE_NAME, `/malattia cure: ${actor.name}`);
          break;
        default:
          await diseaseSystem.showDiseaseInfo(actor);
          logger.info(this.MODULE_NAME, `/malattia info: ${actor.name}`);
      }
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore /malattia', error);
      ui.notifications.error('Errore eseguendo /malattia');
      throw error;
    }
  }
  
  /**
   * Handler comando duello
   * @static
   * @async
   * @param {Array<string>} args - Argomenti comando
   * @param {Object} msg - Messaggio originale
   * @returns {Promise<void>}
   */
  static async handleDuello(args, msg) {
    try {
      logger.debug(this.MODULE_NAME, '/duello: Avvio duello');
      
      const duelingSystem = game.brancalonia?.dueling;
      if (!duelingSystem) {
        logger.error(this.MODULE_NAME, '/duello: Sistema Duelli non disponibile');
        ui.notifications.error("Sistema Duelli non disponibile!");
        return;
      }
      
      const tokens = canvas.tokens.controlled;
      if (tokens.length !== 2) {
        logger.warn(this.MODULE_NAME, `/duello: ${tokens.length} token selezionati (servono 2)`);
        ui.notifications.warn("Seleziona esattamente 2 token per il duello!");
        return;
      }
      
      await duelingSystem.startDuel(tokens[0].actor, tokens[1].actor);
      logger.info(this.MODULE_NAME, `/duello: ${tokens[0].name} vs ${tokens[1].name}`);
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore /duello', error);
      ui.notifications.error('Errore eseguendo /duello');
      throw error;
    }
  }
  
  /**
   * Handler comando fazione
   * @static
   * @async
   * @param {Array<string>} args - Argomenti comando
   * @param {Object} msg - Messaggio originale
   * @returns {Promise<void>}
   */
  static async handleFazione(args, msg) {
    try {
      const factionName = args[0];
      const operation = args[1];
      const value = parseInt(args[2]) || 0;
      
      logger.debug(this.MODULE_NAME, `/fazione: ${factionName} ${operation} ${value}`);
      
      const factionSystem = game.brancalonia?.factions;
      if (!factionSystem) {
        logger.error(this.MODULE_NAME, '/fazione: Sistema Fazioni non disponibile');
        ui.notifications.error("Sistema Fazioni non disponibile!");
        return;
      }
      
      const actor = canvas.tokens.controlled[0]?.actor || game.user.character;
      if (!actor) {
        logger.warn(this.MODULE_NAME, '/fazione: Nessun personaggio selezionato');
        ui.notifications.warn("Nessun personaggio selezionato!");
        return;
      }
      
      if (!factionName) {
        await factionSystem.showFactionInfo(actor);
        logger.info(this.MODULE_NAME, `/fazione: Info fazioni per ${actor.name}`);
        return;
      }
      
      if (operation === '+') {
        await factionSystem.adjustReputation(actor, factionName, value);
        logger.info(this.MODULE_NAME, `/fazione: ${actor.name} +${value} rep con ${factionName}`);
      } else if (operation === '-') {
        await factionSystem.adjustReputation(actor, factionName, -value);
        logger.info(this.MODULE_NAME, `/fazione: ${actor.name} -${value} rep con ${factionName}`);
      } else {
        await factionSystem.getFactionReputation(actor, factionName);
        logger.info(this.MODULE_NAME, `/fazione get: ${actor.name} con ${factionName}`);
      }
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore /fazione', error);
      ui.notifications.error('Errore eseguendo /fazione');
      throw error;
    }
  }
  
  /**
   * Handler comando help
   * @static
   * @async
   * @param {Array<string>} args - Argomenti comando
   * @param {Object} msg - Messaggio originale
   * @returns {Promise<void>}
   */
  static async handleHelp(args, msg) {
    try {
      const subcommand = args[0]?.toLowerCase();
      logger.debug(this.MODULE_NAME, `/brancalonia: subcommand=${subcommand}`);
      
      switch(subcommand) {
        case 'version':
          const moduleData = game.modules.get('brancalonia-bigat');
          await ChatMessage.create({
            content: `<div class="brancalonia-help">
              <h3>Brancalonia - Il Regno di Taglia</h3>
              <p>Versione: ${moduleData.version}</p>
              <p>Compatibilità: Foundry ${moduleData.compatibility.minimum}+</p>
            </div>`,
            whisper: [game.user.id]
          });
          logger.info(this.MODULE_NAME, '/brancalonia version: Mostrato');
          break;
          
        case 'info':
          await ChatMessage.create({
            content: `<div class="brancalonia-help">
              <h3>Sistemi Attivi</h3>
              <ul>
                <li>✅ Infamia e Reputazione</li>
                <li>✅ Haven System</li>
                <li>✅ Gestione Compagnia</li>
                <li>✅ Menagramo</li>
                <li>✅ Lavori Sporchi</li>
                <li>✅ Baraonda</li>
                <li>✅ Duelli</li>
                <li>✅ Malattie</li>
                <li>✅ Fazioni</li>
              </ul>
            </div>`,
            whisper: [game.user.id]
          });
          logger.info(this.MODULE_NAME, '/brancalonia info: Sistemi attivi mostrati');
          break;
          
        case 'help':
        default:
          let helpContent = '<div class="brancalonia-help"><h3>Comandi Disponibili</h3><ul>';
          
          for (const [cmd, data] of Object.entries(this._state.commands)) {
            if (!data.gmOnly || game.user.isGM) {
              helpContent += `<li><code>${data.usage}</code> - ${data.description}</li>`;
            }
          }
          
          helpContent += '</ul></div>';
          
          await ChatMessage.create({
            content: helpContent,
            whisper: [game.user.id]
          });
          logger.info(this.MODULE_NAME, '/brancalonia help: Lista comandi mostrata');
      }
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore /brancalonia', error);
      ui.notifications.error('Errore eseguendo /brancalonia');
      throw error;
    }
  }
  
  // =================================================================
  // PUBLIC API
  // =================================================================

  /**
   * Ottiene lo status corrente del sistema comandi
   * @static
   * @returns {Object} Status completo
   * @example
   * const status = BrancaloniaChatCommands.getStatus();
   * console.log('Commands executed:', status.commandsExecuted);
   */
  static getStatus() {
    return {
      version: this.VERSION,
      initialized: this._state.initialized,
      commandsRegistered: this.statistics.commandsRegistered,
      commandsExecuted: this.statistics.commandsExecuted,
      successfulCommands: this.statistics.successfulCommands,
      failedCommands: this.statistics.failedCommands,
      permissionDenied: this.statistics.permissionDenied,
      averageExecutionTime: this.statistics.averageExecutionTime,
      errors: this.statistics.errors.length
    };
  }

  /**
   * Ottiene le statistiche complete del sistema comandi
   * @static
   * @returns {ChatCommandsStatistics} Statistiche complete
   * @example
   * const stats = BrancaloniaChatCommands.getStatistics();
   * console.log('Most used command:', Object.entries(stats.commandsByType).sort((a,b) => b[1]-a[1])[0]);
   */
  static getStatistics() {
    return {
      ...this.statistics
    };
  }

  /**
   * Ottiene lista comandi disponibili
   * @static
   * @param {boolean} [gmOnly=false] - Se true, include solo comandi GM
   * @returns {Array<{command: string, definition: CommandDefinition}>} Array comandi
   * @example
   * const cmds = BrancaloniaChatCommands.getCommandList();
   * cmds.forEach(c => console.log(c.command, ':', c.definition.description));
   */
  static getCommandList(gmOnly = false) {
    const commands = [];
    for (const [cmd, definition] of Object.entries(this._state.commands)) {
      if (!gmOnly || definition.gmOnly) {
        commands.push({ command: cmd, definition });
      }
    }
    return commands;
  }

  /**
   * Resetta le statistiche del sistema comandi
   * @static
   * @returns {void}
   * @example
   * BrancaloniaChatCommands.resetStatistics();
   */
  static resetStatistics() {
    logger.info(this.MODULE_NAME, 'Reset statistiche Chat Commands');

    const initTime = this.statistics.initTime;
    const commandsRegistered = this.statistics.commandsRegistered;

    this.statistics = {
      initTime,
      commandsRegistered,
      commandsExecuted: 0,
      commandsByType: {},
      successfulCommands: 0,
      failedCommands: 0,
      permissionDenied: 0,
      averageExecutionTime: 0,
      errors: []
    };

    // Re-inizializza contatori per tipo
    for (const cmd of Object.keys(this._state.commands)) {
      this.statistics.commandsByType[cmd] = 0;
    }

    logger.info(this.MODULE_NAME, 'Statistiche resettate');
  }

  /**
   * Mostra un report completo dello stato del sistema nella console
   * @static
   * @returns {Object} Status e statistiche (per uso programmatico)
   * @example
   * BrancaloniaChatCommands.showReport();
   */
  static showReport() {
    const stats = this.getStatistics();
    const status = this.getStatus();

    logger.group('💬 Brancalonia Chat Commands - Report');

    logger.info(this.MODULE_NAME, 'VERSION:', this.VERSION);
    logger.info(this.MODULE_NAME, 'Initialized:', status.initialized);
    logger.info(this.MODULE_NAME, 'Commands Registered:', status.commandsRegistered);

    logger.group('📊 Statistics');
    logger.table([
      { Metric: 'Init Time', Value: `${stats.initTime?.toFixed(2)}ms` },
      { Metric: 'Commands Executed', Value: stats.commandsExecuted },
      { Metric: 'Successful', Value: stats.successfulCommands },
      { Metric: 'Failed', Value: stats.failedCommands },
      { Metric: 'Permission Denied', Value: stats.permissionDenied },
      { Metric: 'Avg Execution Time', Value: `${stats.averageExecutionTime.toFixed(2)}ms` },
      { Metric: 'Errors', Value: stats.errors.length }
    ]);
    logger.groupEnd();

    logger.group('📋 Commands By Type (Top 5)');
    const topCommands = Object.entries(stats.commandsByType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    logger.table(topCommands.map(([cmd, count]) => ({ Command: cmd, Count: count })));
    logger.groupEnd();

    if (stats.errors.length > 0) {
      logger.group('🐛 Errors (Last 5)');
      stats.errors.slice(-5).forEach((err, i) => {
        logger.error(this.MODULE_NAME, `Error ${i + 1}:`, err.command, '-', err.message);
      });
      logger.groupEnd();
    }

    logger.groupEnd();

    return { status, stats };
  }
}

// Inizializza quando Foundry è pronto
Hooks.once('ready', () => {
  BrancaloniaChatCommands.initialize();
});

// Esporta globalmente
window.BrancaloniaChatCommands = BrancaloniaChatCommands;
