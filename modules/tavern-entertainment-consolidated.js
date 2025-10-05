/**
 * BRANCALONIA TAVERN ENTERTAINMENT - CONSOLIDATED MODULE
 * Unisce tutti i sistemi di intrattenimento delle taverne:
 * - Giochi da Taverna (Minchiate, Botte alla Botte, etc.)
 * - Sistema Bagordi (spesa oro e conseguenze)
 * - Mini-giochi competitivi
 *
 * Basato sul manuale ufficiale pagine 57-60
 * 
 * @module BrancaloniaTavernEntertainment
 * @version 2.0.0
 * @author Brancalonia BIGAT Team
 */

import { logger } from './brancalonia-logger.js';

class BrancaloniaTavernEntertainment {
  static ID = 'brancalonia-bigat';
  static VERSION = '2.0.0';
  static MODULE_NAME = 'Tavern Entertainment';

  // Statistics tracking (enterprise-grade)
  static statistics = {
    bagordiExecuted: 0,
    gamesPlayed: 0,
    totalGoldSpent: 0,
    totalGoldWon: 0,
    totalDamageDealt: 0,
    macrosCreated: 0,
    errors: []
  };

  // Internal state management
  static _state = {
    initialized: false,
    settingsRegistered: false,
    hooksRegistered: false,
    gamesConfigured: false,
    bagordiConfigured: false
  };

  /**
   * Inizializzazione completa del modulo
   * @static
   * @returns {void}
   */
  static initialize() {
    try {
      logger.startPerformance('tavern-entertainment-init');
      logger.info(this.MODULE_NAME, '🍺 Inizializzazione Sistema Taverne...');

      // Registra settings
      this.registerSettings();

      // Registra hooks
      this.registerHooks();

      // Registra comandi chat
      this.registerChatCommands();

      // Registra istanza globale
      game.brancalonia = game.brancalonia || {};
      game.brancalonia.tavernEntertainment = this;

      // Estende Actor class
      this.extendActorClass();

      // Setup giochi e bagordi
      this.setupTavernGames();
      this.setupBagordi();

      this._state.initialized = true;
      const perfTime = logger.endPerformance('tavern-entertainment-init');
      logger.info(this.MODULE_NAME, `✅ Sistema Taverne inizializzato con successo (${perfTime?.toFixed(2)}ms)`);
      
      // Event emitter
      logger.events.emit('tavern-entertainment:initialized', {
        version: this.VERSION,
        timestamp: Date.now()
      });
    } catch (error) {
      this.statistics.errors.push({ 
        type: 'initialize', 
        message: error.message, 
        timestamp: Date.now() 
      });
      logger.error(this.MODULE_NAME, 'Errore inizializzazione Sistema Taverne', error);
      ui.notifications.error('Errore durante l\'inizializzazione del sistema taverne');
    }
  }

  /**
   * Registra le impostazioni del modulo
   * @static
   * @returns {void}
   */
  static registerSettings() {
    // Abilita giochi da taverna
    game.settings.register(this.ID, 'tavernGamesEnabled', {
      name: 'Abilita Giochi da Taverna',
      hint: 'Permette l\'uso dei giochi da taverna nei luoghi appropriati',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    // Abilita sistema bagordi
    game.settings.register(this.ID, 'bagordiEnabled', {
      name: 'Abilita Sistema Bagordi',
      hint: 'Permette di spendere oro in bagordi con conseguenze casuali',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    // Applica danni automaticamente
    game.settings.register(this.ID, 'autoApplyDamage', {
      name: 'Applica Danni Automaticamente',
      hint: 'Applica automaticamente i danni dai giochi pericolosi',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    // Moltiplicatore difficoltà
    game.settings.register(this.ID, 'difficultyMultiplier', {
      name: 'Moltiplicatore Difficoltà',
      hint: 'Modifica la difficoltà generale dei giochi',
      scope: 'world',
      config: true,
      type: Number,
      default: 1.0,
      range: { min: 0.5, max: 2.0, step: 0.1 }
    });

    this._state.settingsRegistered = true;
    logger.info(this.MODULE_NAME, '✅ Settings Sistema Taverne registrate');
  }

  /**
   * Registra tutti gli hooks necessari
   * @static
   * @returns {void}
   */
  static registerHooks() {
    // Hook per canvas ready
    Hooks.on('canvasReady', () => {
      this.handleCanvasReady();
    });

    // Hook per character sheet
    Hooks.on('renderActorSheet', (app, html, data) => {
      this.enhanceCharacterSheet(app, html, data);
    });

    // Hook per scene controls
    Hooks.on('getSceneControlButtons', (controls) => {
      this.addTavernControls(controls);
    });

    // Hook per aggiornamento oro
    Hooks.on('updateActor', (actor, changes, options, userId) => {
      this.handleGoldUpdate(actor, changes, options, userId);
    });

    this._state.hooksRegistered = true;
    logger.info(this.MODULE_NAME, '✅ Hooks Sistema Taverne registrati');
  }

  /**
   * Registra comandi chat
   * @static
   * @returns {void}
   */
  static registerChatCommands() {
    Hooks.on('chatMessage', (html, content, msg) => {
      if (!content.startsWith('/')) return true;

      const [command, ...args] = content.slice(1).split(' ');

      switch (command.toLowerCase()) {
        case 'bagordi':
          this.showBagordiDialog(game.user.character);
          return false;
        case 'giocotaverna':
          this.showGameSelectionDialog(game.user.character);
          return false;
        case 'minchiate':
          this.playSpecificGame(game.user.character, 'minchiate', parseInt(args[0]) || 10);
          return false;
        case 'botte-alla-botte':
          this.playSpecificGame(game.user.character, 'botteAllaBotte', 0);
          return false;
        case 'gara-mangiate':
          this.playSpecificGame(game.user.character, 'garaDiMangiate', 0);
          return false;
        case 'giostra-poveri':
          this.playSpecificGame(game.user.character, 'giostraDeiPoveri', parseInt(args[0]) || 5);
          return false;
        case 'taverna-status':
          this.showTavernStatus();
          return false;
        case 'taverna-help':
          this.showTavernHelp();
          return false;
        default:
          return true;
      }
    });

    logger.info(this.MODULE_NAME, '✅ Comandi chat Sistema Taverne registrati');
  }

  /**
   * Estende la classe Actor
   * @static
   * @returns {void}
   */
  static extendActorClass() {
    const originalPrepareData = CONFIG.Actor.documentClass.prototype.prepareDerivedData;
    CONFIG.Actor.documentClass.prototype.prepareDerivedData = function () {
      originalPrepareData.call(this);

      // Tracking spese taverna
      this.system.tavernSpending = this.getFlag(BrancaloniaTavernEntertainment.ID, 'totalSpent') || 0;
      this.system.gamesWon = this.getFlag(BrancaloniaTavernEntertainment.ID, 'gamesWon') || 0;
      this.system.gamesLost = this.getFlag(BrancaloniaTavernEntertainment.ID, 'gamesLost') || 0;

      // Reputation tracking
      this.system.tavernReputation = this.getFlag(BrancaloniaTavernEntertainment.ID, 'reputation') || 0;
    };
  }

  /**
   * Crea macro automatiche
   * @static
   * @returns {Promise<void>}
   */
  static async createAutomaticMacros() {
    const macros = [
      {
        name: 'Bagordi',
        type: 'script',
        img: 'icons/consumables/drinks/alcohol-beer-stein-wooden-metal-brown.webp',
        command: 'BrancaloniaTavernEntertainment.showBagordiDialog(token?.actor);',
        folder: null
      },
      {
        name: 'Giochi da Taverna',
        type: 'script',
        img: 'icons/sundries/gaming/dice-pair-white.webp',
        command: 'BrancaloniaTavernEntertainment.showGameSelectionDialog(token?.actor);',
        folder: null
      }
    ];

    for (const macroData of macros) {
      try {
        const existing = game?.macros?.find(m => m.name === macroData.name);
        if (!existing) {
          await Macro.create(macroData);
          this.statistics.macrosCreated++;
          logger.info(this.MODULE_NAME, `✅ Macro "${macroData.name}" creata`);
        } else {
          logger.debug?.(this.MODULE_NAME, `Macro "${macroData.name}" già esistente`);
        }
      } catch (error) {
        this.statistics.errors.push({ 
          type: 'createMacro', 
          message: `${macroData.name}: ${error.message}`, 
          timestamp: Date.now() 
        });
        logger.error(this.MODULE_NAME, `Errore creazione macro ${macroData.name}`, error);
      }
    }
  }

  /**
   * Setup giochi da taverna
   */
  static setupTavernGames() {
    this.tavernGames = {
      minchiate: {
        name: 'Minchiate',
        description: 'Gioco di carte tradizionale',
        skill: 'deception',
        dc: 15,
        stakes: { min: 5, max: 50 },
        type: 'skill'
      },
      botteAllaBotte: {
        name: 'Botte alla Botte',
        description: 'Spaccare botti con la testa',
        skill: 'constitution',
        dc: 12,
        rounds: 3,
        damage: '1d4',
        type: 'endurance'
      },
      garaDiMangiate: {
        name: 'Gara di Mangiate',
        description: 'Chi mangia di più vince',
        skill: 'constitution',
        dc: 10,
        rounds: 5,
        dcIncrease: 2,
        type: 'eating'
      },
      giostraDeiPoveri: {
        name: 'Giostra dei Poveri',
        description: 'Giostra improvvisata con animali',
        skills: ['animal-handling', 'athletics'],
        dc: 14,
        rounds: 3,
        stakes: { min: 5, max: 20 },
        type: 'competition'
      }
    };

    this._state.gamesConfigured = true;
    logger.info(this.MODULE_NAME, '🎲 Giochi da taverna configurati');
  }

  /**
   * Setup sistema bagordi
   * @static
   * @returns {void}
   */
  static setupBagordi() {
    this.bagordiResults = [
      { roll: 1, title: 'Arrestato!', description: 'Finisci in gattabuia per 1d6 giorni', severe: true },
      { roll: 2, title: 'Derubato', description: "Perdi tutto l'oro che avevi con te", severe: true },
      { roll: 3, title: 'Rissa Epica', description: 'Ti ritrovi con 1d4 livelli di indebolimento', severe: true },
      { roll: 4, title: 'Debiti di Gioco', description: 'Devi altri 2d10 mo a creditori locali' },
      { roll: 5, title: 'Tatuaggio Imbarazzante', description: 'Ti sei fatto tatuare qualcosa di osceno' },
      { roll: 6, title: 'Mal di Testa Bestiale', description: 'Svantaggio ai tiri salvezza su Costituzione per 24 ore' },
      { roll: 7, title: 'Nuovo Nemico', description: 'Ti sei fatto un nemico potente durante i bagordi' },
      { roll: 8, title: 'Sbornia Colossale', description: 'Non ricordi nulla, ma tutti ti guardano male' },
      { roll: 9, title: 'Notte Folle', description: 'Ti risvegli in un posto casuale senza equipaggiamento' },
      { roll: 10, title: 'Amore Fugace', description: 'Ti sei innamorato perdutamente, ma è già finita' },
      { roll: 11, title: 'Notte Normale', description: 'Una serata piacevole senza conseguenze' },
      { roll: 12, title: 'Fortuna al Gioco', description: "Recuperi metà dell'oro speso", positive: true },
      { roll: 13, title: 'Nuovi Contatti', description: 'Conosci qualcuno di utile', positive: true },
      { roll: 14, title: 'Informazioni Preziose', description: 'Scopri un segreto o una diceria importante', positive: true },
      { roll: 15, title: 'Favore Guadagnato', description: 'Un PNG importante ti deve un favore', positive: true },
      { roll: 16, title: 'Piccola Vincita', description: 'Guadagni 1d6 mo extra', positive: true },
      { roll: 17, title: 'Oggetto Trovato', description: 'Trovi un oggetto minore utile', positive: true },
      { roll: 18, title: 'Reputazione Migliorata', description: 'La tua fama cresce in città', positive: true },
      { roll: 19, title: 'Alleato Inaspettato', description: 'Fai amicizia con qualcuno di influente', positive: true },
      { roll: 20, title: 'Jackpot!', description: "Vinci al gioco e raddoppi l'oro speso!", positive: true }
    ];

    this._state.bagordiConfigured = true;
    logger.info(this.MODULE_NAME, '🍺 Sistema bagordi configurato');
  }

  /**
   * Gestisce canvas ready
   * @static
   * @returns {void}
   */
  static handleCanvasReady() {
    try {
      if (canvas.scene?.getFlag(this.ID, 'isTavern')) {
        this.showTavernNotification();
      }
    } catch (error) {
      this.statistics.errors.push({ 
        type: 'canvasReady', 
        message: error.message, 
        timestamp: Date.now() 
      });
      logger.error(this.MODULE_NAME, 'Errore canvas ready', error);
    }
  }

  /**
   * Aggiunge controlli taverna
   * @static
   * @param {Array} controls - Array dei controlli scene
   * @returns {void}
   */
  static addTavernControls(controls) {
    try {
      if (!game.user?.isGM) return;
      if (!canvas?.scene) return; // Canvas non ancora pronto
      if (!Array.isArray(controls)) return; // Controls deve essere un array

      const tokenControls = controls.find(c => c.name === 'token');
      if (tokenControls) {
        tokenControls.tools.push({
          name: 'tavern-mode',
          title: 'Modalità Taverna',
          icon: 'fas fa-beer',
          toggle: true,
          active: canvas.scene?.getFlag(this.ID, 'isTavern') || false,
          onClick: () => this.toggleTavernMode()
        });
      }
    } catch (error) {
      this.statistics.errors.push({ 
        type: 'addTavernControls', 
        message: error.message, 
        timestamp: Date.now() 
      });
      logger.error(this.MODULE_NAME, 'Errore aggiunta controlli taverna', error);
    }
  }

  /**
   * Toggle modalità taverna
   * @static
   * @returns {Promise<void>}
   */
  static async toggleTavernMode() {
    try {
      const isTavern = canvas.scene?.getFlag(this.ID, 'isTavern') || false;
      await canvas.scene.setFlag(this.ID, 'isTavern', !isTavern);

      const message = !isTavern ? 'Modalità Taverna ATTIVATA' : 'Modalità Taverna DISATTIVATA';
      logger.info(this.MODULE_NAME, message);
      ui.notifications.info(message);

      if (!isTavern) {
        this.showTavernNotification();
      }
    } catch (error) {
      this.statistics.errors.push({ 
        type: 'toggleTavernMode', 
        message: error.message, 
        timestamp: Date.now() 
      });
      logger.error(this.MODULE_NAME, 'Errore toggle taverna', error);
    }
  }

  /**
   * Gestisce aggiornamento oro
   * @static
   * @param {Actor} actor - Attore aggiornato
   * @param {Object} changes - Modifiche applicate
   * @param {Object} options - Opzioni
   * @param {string} userId - ID utente
   * @returns {void}
   */
  static handleGoldUpdate(actor, changes, options, userId) {
    try {
      if (!changes.system?.currency?.gp) return;

      const oldGold = actor.system.currency.gp;
      const newGold = changes.system.currency.gp;

      if (newGold < oldGold) {
        const spent = oldGold - newGold;
        const totalSpent = (actor.getFlag(this.ID, 'totalSpent') || 0) + spent;
        actor.setFlag(this.ID, 'totalSpent', totalSpent);
        logger.debug?.(this.MODULE_NAME, `${actor.name} ha speso ${spent} mo (totale: ${totalSpent})`);
      }
    } catch (error) {
      this.statistics.errors.push({ 
        type: 'handleGoldUpdate', 
        message: error.message, 
        timestamp: Date.now() 
      });
      logger.error(this.MODULE_NAME, 'Errore tracking oro', error);
    }
  }

  /**
   * Mostra dialog bagordi
   */
  static async showBagordiDialog(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun personaggio selezionato');
      return;
    }

    if (!game.settings.get(this.ID, 'bagordiEnabled')) {
      ui.notifications.warn('Sistema Bagordi disabilitato');
      return;
    }

    const content = `
      <form class="brancalonia-dialog">
        <h3>🍺 Darsi ai Bagordi</h3>
        <div class="form-group">
          <label>Luogo dei Bagordi</label>
          <select name="location" id="location">
            <option value="villaggio">Villaggio (5-10 mo)</option>
            <option value="cittadina" selected>Cittadina (10-20 mo)</option>
            <option value="città">Città Maggiore (20-50 mo)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Oro da Dilapidare (mo)</label>
          <input type="number" name="gold" id="gold" value="15" min="5" max="50">
        </div>
        <div class="form-group">
          <label>Personaggio: ${actor.name}</label>
          <p>Oro disponibile: ${actor.system.currency.gp} mo</p>
        </div>
        <p class="notes"><i>Una settimana di Sbraco spesa in bagordi! Tira 1d20 per le conseguenze.</i></p>
      </form>
    `;

    new foundry.appv1.sheets.Dialog({
      title: 'Bagordi e Divertimenti',
      content,
      buttons: {
        bagordi: {
          icon: '<i class="fas fa-wine-bottle"></i>',
          label: 'Ai Bagordi!',
          callback: async (html) => {
            const gold = parseInt(html.find('#gold').val());

            if (actor.system.currency.gp < gold) {
              ui.notifications.error('Non hai abbastanza oro!');
              return;
            }

            await actor.update({ 'system.currency.gp': actor.system.currency.gp - gold });
            await this.rollBagordiResult(actor, gold);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Annulla'
        }
      },
      default: 'bagordi'
    }).render(true);
  }

  /**
   * Tira risultato bagordi
   * @static
   * @param {Actor} actor - Attore che fa bagordi
   * @param {number} goldSpent - Oro speso
   * @returns {Promise<void>}
   */
  static async rollBagordiResult(actor, goldSpent) {
    try {
      this.statistics.bagordiExecuted++;
      this.statistics.totalGoldSpent += goldSpent;
      
      const roll = await new Roll('1d20').evaluate();
      await roll.toMessage();

      const result = this.bagordiResults.find(r => r.roll === roll.total);
      
      logger.info(this.MODULE_NAME, `🍺 Bagordi: ${actor.name} - Risultato ${roll.total}: ${result.title}`);

      const messageContent = `
        <div class="brancalonia-message bagordi-result">
          <h3>${result.title}</h3>
          <p>${result.description}</p>
          <p class="gold-spent">Oro speso: ${goldSpent} mo</p>
        </div>
      `;

      // Applica effetti speciali
      await this.applyBagordiEffects(actor, result, goldSpent);

      ChatMessage.create({
        content: messageContent,
        speaker: ChatMessage.getSpeaker({ actor })
      });

      // Aggiorna statistiche
      await this.updateTavernStats(actor, 'bagordi', goldSpent);
    } catch (error) {
      this.statistics.errors.push({ 
        type: 'rollBagordiResult', 
        message: error.message, 
        timestamp: Date.now() 
      });
      logger.error(this.MODULE_NAME, 'Errore risultato bagordi', error);
      ui.notifications.error('Errore durante i bagordi');
    }
  }

  /**
   * Applica effetti bagordi
   * @static
   * @param {Actor} actor - Attore
   * @param {Object} result - Risultato bagordi
   * @param {number} goldSpent - Oro speso
   * @returns {Promise<void>}
   */
  static async applyBagordiEffects(actor, result, goldSpent) {
    try {
      switch (result.roll) {
        case 1: // Arrestato
          const days = await new Roll('1d6').evaluate();
          logger.info(this.MODULE_NAME, `${actor.name} arrestato per ${days.total} giorni`);
          ui.notifications.warn(`${actor.name} è in prigione per ${days.total} giorni!`);
          break;

        case 2: // Derubato
          await actor.update({ 'system.currency.gp': 0 });
          logger.warn(this.MODULE_NAME, `${actor.name} derubato di tutto l'oro`);
          ui.notifications.error(`${actor.name} è stato derubato di tutto!`);
          break;

        case 3: // Rissa - FIX BUG: Applica exhaustion correttamente
          const exhaustionRoll = await new Roll('1d4').evaluate();
          const exhaustionLevels = exhaustionRoll.total;
          
          // Applica livelli di exhaustion usando il sistema dnd5e
          const currentExhaustion = actor.system.attributes.exhaustion || 0;
          const newExhaustion = Math.min(6, currentExhaustion + exhaustionLevels);
          
          await actor.update({ 'system.attributes.exhaustion': newExhaustion });
          
          logger.warn(this.MODULE_NAME, `${actor.name} riceve ${exhaustionLevels} livelli di exhaustion (totale: ${newExhaustion})`);
          ui.notifications.warn(`${actor.name} ha ${exhaustionLevels} livelli di indebolimento! (Totale: ${newExhaustion}/6)`);
          break;

        case 6: // Mal di testa
          const effect = {
            name: 'Sbornia',
            icon: 'icons/consumables/drinks/alcohol-beer-stein-wooden-metal-brown.webp',
            duration: { seconds: 86400 },
            changes: [{
              key: 'flags.dnd5e.disadvantage.save.con',
              mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
              value: '1',
              priority: 20
            }]
          };
          await actor.createEmbeddedDocuments('ActiveEffect', [effect]);
          logger.info(this.MODULE_NAME, `${actor.name} ha Sbornia (svantaggio tiri salvezza CON per 24 ore)`);
          break;

        case 12: // Fortuna al gioco
          const refund = Math.floor(goldSpent / 2);
          await actor.update({ 'system.currency.gp': actor.system.currency.gp + refund });
          this.statistics.totalGoldWon += refund;
          logger.info(this.MODULE_NAME, `${actor.name} recupera ${refund} mo`);
          ui.notifications.info(`${actor.name} recupera ${refund} mo!`);
          break;

        case 16: // Piccola vincita
          const bonus = await new Roll('1d6').evaluate();
          await actor.update({ 'system.currency.gp': actor.system.currency.gp + bonus.total });
          this.statistics.totalGoldWon += bonus.total;
          logger.info(this.MODULE_NAME, `${actor.name} vince ${bonus.total} mo extra`);
          ui.notifications.info(`${actor.name} vince ${bonus.total} mo extra!`);
          break;

        case 18: // Reputazione
          const currentRep = actor.getFlag(this.ID, 'reputation') || 0;
          await actor.setFlag(this.ID, 'reputation', currentRep + 1);
          logger.info(this.MODULE_NAME, `${actor.name} reputazione +1 (totale: ${currentRep + 1})`);
          break;

        case 20: // Jackpot
          const jackpot = goldSpent * 2;
          await actor.update({ 'system.currency.gp': actor.system.currency.gp + jackpot });
          this.statistics.totalGoldWon += jackpot;
          logger.info(this.MODULE_NAME, `🎰 ${actor.name} JACKPOT! Vince ${jackpot} mo`);
          ui.notifications.info(`${actor.name} vince ${jackpot} mo!`);
          break;
      }
    } catch (error) {
      this.statistics.errors.push({ 
        type: 'applyBagordiEffects', 
        message: error.message, 
        timestamp: Date.now() 
      });
      logger.error(this.MODULE_NAME, 'Errore applicazione effetti bagordi', error);
    }
  }

  /**
   * Mostra dialog selezione giochi
   */
  static async showGameSelectionDialog(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun personaggio selezionato');
      return;
    }

    if (!game.settings.get(this.ID, 'tavernGamesEnabled')) {
      ui.notifications.warn('Giochi da taverna disabilitati');
      return;
    }

    const gameOptions = Object.entries(this.tavernGames)
      .map(([key, game]) => `<option value="${key}">${game.name} - ${game.description}</option>`)
      .join('');

    const content = `
      <form class="brancalonia-dialog">
        <h3>🎲 Scegli un Gioco da Taverna</h3>
        <div class="form-group">
          <label>Gioco</label>
          <select name="game" id="game-select">
            ${gameOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Posta in Gioco (mo)</label>
          <input type="number" name="stake" id="stake" value="10" min="5" max="100">
        </div>
        <div class="form-group">
          <label>Avversario</label>
          <select name="opponent" id="opponent">
            <option value="easy">Principiante (CD -2)</option>
            <option value="medium" selected>Esperto (CD normale)</option>
            <option value="hard">Maestro (CD +2)</option>
            <option value="legendary">Leggendario (CD +5)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Personaggio: ${actor.name}</label>
          <p>Oro disponibile: ${actor.system.currency.gp} mo</p>
        </div>
      </form>
    `;

    new foundry.appv1.sheets.Dialog({
      title: 'Giochi da Taverna',
      content,
      buttons: {
        play: {
          icon: '<i class="fas fa-dice"></i>',
          label: 'Gioca!',
          callback: async (html) => {
            const gameKey = html.find('#game-select').val();
            const stake = parseInt(html.find('#stake').val());
            const difficulty = html.find('#opponent').val();

            await this.playTavernGame(actor, gameKey, stake, difficulty);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Annulla'
        }
      },
      default: 'play'
    }).render(true);
  }

  /**
   * Gioca a gioco specifico
   */
  static async playSpecificGame(actor, gameKey, stake) {
    if (!actor) {
      ui.notifications.warn('Nessun personaggio selezionato');
      return;
    }

    await this.playTavernGame(actor, gameKey, stake, 'medium');
  }

  /**
   * Gioca a un gioco da taverna
   * @static
   * @param {Actor} actor - Attore che gioca
   * @param {string} gameKey - Chiave del gioco
   * @param {number} stake - Posta in gioco
   * @param {string} difficulty - Livello di difficoltà
   * @returns {Promise<void>}
   */
  static async playTavernGame(actor, gameKey, stake, difficulty) {
    try {
      this.statistics.gamesPlayed++;
      this.statistics.totalGoldSpent += stake;
      
      const game = this.tavernGames[gameKey];
      if (!game) {
        ui.notifications.error('Gioco non trovato');
        return;
      }

      logger.info(this.MODULE_NAME, `🎲 ${actor.name} gioca a ${game.name} (posta: ${stake} mo, difficoltà: ${difficulty})`);

      // Controlla oro se necessario
      if (stake > 0 && actor.system.currency.gp < stake) {
        ui.notifications.error('Non hai abbastanza oro!');
        return;
      }

      // Modifica CD basata sulla difficoltà
      const difficultyMod = {
        easy: -2,
        medium: 0,
        hard: 2,
        legendary: 5
      };

      const difficultyMultiplier = game.settings.get(this.ID, 'difficultyMultiplier');
      const baseDC = Math.round((game.dc + difficultyMod[difficulty]) * difficultyMultiplier);

      let messageContent = `
        <div class="brancalonia-message tavern-game">
          <h3>🎯 ${game.name}</h3>
          <p>${game.description}</p>
          <p><strong>Posta:</strong> ${stake} mo | <strong>CD Base:</strong> ${baseDC}</p>
          <hr>
      `;

      let success = true;
      let totalSuccesses = 0;
      let totalFailures = 0;
      let totalDamage = 0;

      // Giochi a round multipli
      if (game.rounds) {
        let currentDC = baseDC;

        for (let round = 1; round <= game.rounds; round++) {
          messageContent += `<p><strong>Round ${round}:</strong> `;

          // Determina quale abilità usare
          const skill = Array.isArray(game.skills) ?
            game.skills[Math.floor(Math.random() * game.skills.length)] :
            game.skill || 'constitution';

          // Tira il dado
          const rollFormula = this.getSkillRollFormula(skill, actor);
          const roll = await new Roll(rollFormula, actor.getRollData()).evaluate();

          if (roll.total >= currentDC) {
            messageContent += `✅ Successo! (${roll.total} vs CD ${currentDC})`;
            totalSuccesses++;
          } else {
            messageContent += `❌ Fallimento! (${roll.total} vs CD ${currentDC})`;
            totalFailures++;

            // Danni per alcuni giochi
            if (game.damage) {
              const damageRoll = await new Roll(game.damage).evaluate();
              messageContent += ` - ${damageRoll.total} danni!`;
              totalDamage += damageRoll.total;
            }
          }

          messageContent += `</p>`;

          // Aumenta difficoltà per alcuni giochi
          if (game.dcIncrease) {
            currentDC += game.dcIncrease;
          }
        }

        success = totalSuccesses > totalFailures;
      } else {
        // Gioco a round singolo
        const skill = game.skill || 'deception';
        const rollFormula = this.getSkillRollFormula(skill, actor);
        const roll = await new Roll(rollFormula, actor.getRollData()).evaluate();

        success = roll.total >= baseDC;
        messageContent += `<p>Risultato: ${roll.total} vs CD ${baseDC}</p>`;
      }

      // Applica danni se presenti (FIX BUG: actor.applyDamage non esiste in dnd5e)
      if (totalDamage > 0) {
        this.statistics.totalDamageDealt += totalDamage;
        
        if (game.settings.get(this.ID, 'autoApplyDamage')) {
          // Applica danni correttamente usando il metodo standard dnd5e
          const currentHp = actor.system.attributes.hp.value;
          const newHp = Math.max(0, currentHp - totalDamage);
          await actor.update({ 'system.attributes.hp.value': newHp });
          logger.info(this.MODULE_NAME, `${actor.name} subisce ${totalDamage} danni (HP: ${currentHp} -> ${newHp})`);
        } else {
          logger.debug?.(this.MODULE_NAME, `${actor.name} dovrebbe subire ${totalDamage} danni (auto-apply disabilitato)`);
        }
        
        messageContent += `<p><strong>Danni totali subiti:</strong> ${totalDamage}</p>`;
      }

      // Risultato finale
      messageContent += `<hr><h4>`;

      if (success) {
        messageContent += `🏆 Vittoria! Vinci ${stake * 2} mo!</h4>`;
        if (stake > 0) {
          await actor.update({ 'system.currency.gp': actor.system.currency.gp + stake });
          this.statistics.totalGoldWon += stake;
        }
        await this.updateTavernStats(actor, 'win', stake);
        logger.info(this.MODULE_NAME, `✅ ${actor.name} VINCE ${stake} mo (gioco: ${game.name})`);
        ui.notifications.info(`${actor.name} vince ${stake} mo!`);
      } else {
        messageContent += `💀 Sconfitta! Perdi ${stake} mo!</h4>`;
        if (stake > 0) {
          await actor.update({ 'system.currency.gp': actor.system.currency.gp - stake });
        }
        await this.updateTavernStats(actor, 'loss', stake);
        logger.info(this.MODULE_NAME, `❌ ${actor.name} PERDE ${stake} mo (gioco: ${game.name})`);
        ui.notifications.warn(`${actor.name} perde ${stake} mo!`);
      }

      messageContent += `</div>`;

      ChatMessage.create({
        content: messageContent,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    } catch (error) {
      this.statistics.errors.push({ 
        type: 'playTavernGame', 
        message: error.message, 
        timestamp: Date.now() 
      });
      logger.error(this.MODULE_NAME, 'Errore gioco taverna', error);
      ui.notifications.error('Errore durante il gioco');
    }
  }

  /**
   * Ottiene formula per tiro abilità
   * @static
   * @param {string} skill - Nome abilità
   * @param {Actor} actor - Attore
   * @returns {string} Formula per roll
   * 
   * @note Abbreviazioni skill dnd5e standard:
   * - deception (dec), athletics (ath), persuasion (per)
   * - animal-handling (ani), sleight-of-hand (sle)
   * - FIX: Corretto 'slt' -> 'sle' per sleight-of-hand
   */
  static getSkillRollFormula(skill, actor) {
    if (skill === 'constitution') {
      return `1d20 + @abilities.con.mod`;
    }

    // Mapping skill names to dnd5e abbreviations
    const skillMap = {
      deception: 'dec',
      athletics: 'ath',
      'animal-handling': 'ani',
      'sleight-of-hand': 'sle', // FIX BUG: era 'slt'
      persuasion: 'per',
      perception: 'prc',
      insight: 'ins',
      performance: 'prf'
    };

    const skillKey = skillMap[skill] || skill;
    logger.debug?.(this.MODULE_NAME, `Roll formula: 1d20 + @skills.${skillKey}.total (skill: ${skill})`);
    return `1d20 + @skills.${skillKey}.total`;
  }

  /**
   * Aggiorna statistiche taverna
   * @static
   * @param {Actor} actor - Attore
   * @param {string} type - Tipo statistica ('win', 'loss', 'bagordi')
   * @param {number} amount - Ammontare
   * @returns {Promise<void>}
   */
  static async updateTavernStats(actor, type, amount) {
    try {
      switch (type) {
        case 'win':
          const wins = actor.getFlag(this.ID, 'gamesWon') || 0;
          await actor.setFlag(this.ID, 'gamesWon', wins + 1);
          logger.debug?.(this.MODULE_NAME, `${actor.name} vittorie: ${wins + 1}`);
          break;
        case 'loss':
          const losses = actor.getFlag(this.ID, 'gamesLost') || 0;
          await actor.setFlag(this.ID, 'gamesLost', losses + 1);
          logger.debug?.(this.MODULE_NAME, `${actor.name} sconfitte: ${losses + 1}`);
          break;
        case 'bagordi':
          const spent = actor.getFlag(this.ID, 'totalSpent') || 0;
          await actor.setFlag(this.ID, 'totalSpent', spent + amount);
          logger.debug?.(this.MODULE_NAME, `${actor.name} speso totale: ${spent + amount} mo`);
          break;
      }
    } catch (error) {
      this.statistics.errors.push({ 
        type: 'updateTavernStats', 
        message: error.message, 
        timestamp: Date.now() 
      });
      logger.error(this.MODULE_NAME, 'Errore aggiornamento statistiche', error);
    }
  }

  /**
   * Mostra notifica taverna
   */
  static showTavernNotification() {
    const message = `
      <div class="brancalonia-notification">
        <h3>🍺 Benvenuto alla Taverna!</h3>
        <p>Puoi usare i seguenti comandi:</p>
        <ul>
          <li><code>/bagordi</code> - Spendi oro in festeggiamenti</li>
          <li><code>/giocotaverna</code> - Partecipa ai giochi</li>
          <li><code>/minchiate [posta]</code> - Gioca a Minchiate</li>
          <li><code>/botte-alla-botte</code> - Spacca botti</li>
          <li><code>/gara-mangiate</code> - Gara di mangiate</li>
          <li><code>/giostra-poveri [posta]</code> - Giostra dei poveri</li>
          <li><code>/taverna-status</code> - Mostra statistiche</li>
        </ul>
      </div>
    `;

    ChatMessage.create({
      content: message,
      whisper: [game.user.id]
    });
  }

  /**
   * Mostra stato taverna
   */
  static showTavernStatus() {
    const actor = game.user.character;
    if (!actor) {
      ui.notifications.warn('Nessun personaggio selezionato');
      return;
    }

    const totalSpent = actor.getFlag(this.ID, 'totalSpent') || 0;
    const gamesWon = actor.getFlag(this.ID, 'gamesWon') || 0;
    const gamesLost = actor.getFlag(this.ID, 'gamesLost') || 0;
    const reputation = actor.getFlag(this.ID, 'reputation') || 0;

    const message = `
      <div class="brancalonia-tavern-status">
        <h3>🍺 Statistiche Taverna - ${actor.name}</h3>
        <p><strong>Oro Speso Totale:</strong> ${totalSpent} mo</p>
        <p><strong>Giochi Vinti:</strong> ${gamesWon}</p>
        <p><strong>Giochi Persi:</strong> ${gamesLost}</p>
        <p><strong>Reputazione:</strong> ${reputation}</p>
        <p><strong>Oro Attuale:</strong> ${actor.system.currency.gp} mo</p>
      </div>
    `;

    ChatMessage.create({
      content: message,
      whisper: [game.user.id]
    });
  }

  /**
   * Mostra aiuto taverna
   */
  static showTavernHelp() {
    const message = `
      <div class="brancalonia-help">
        <h3>🍺 Sistema Taverne di Brancalonia</h3>
        <h4>Comandi disponibili:</h4>
        <ul>
          <li><code>/bagordi</code> - Sistema bagordi con conseguenze casuali</li>
          <li><code>/giocotaverna</code> - Menu principale giochi</li>
          <li><code>/minchiate [posta]</code> - Gioco di carte (Inganno)</li>
          <li><code>/botte-alla-botte</code> - Spaccare botti (Costituzione)</li>
          <li><code>/gara-mangiate</code> - Gara di resistenza (Costituzione)</li>
          <li><code>/giostra-poveri [posta]</code> - Giostra animali (Atletica/Addestrare)</li>
          <li><code>/taverna-status</code> - Mostra statistiche personaggio</li>
        </ul>
        <h4>Tipi di gioco:</h4>
        <ul>
          <li><strong>Abilità:</strong> Tiri singoli contro CD</li>
          <li><strong>Resistenza:</strong> Round multipli con CD crescente</li>
          <li><strong>Competizione:</strong> Round multipli con abilità miste</li>
        </ul>
        <h4>Difficoltà avversari:</h4>
        <ul>
          <li><strong>Principiante:</strong> CD -2</li>
          <li><strong>Esperto:</strong> CD normale</li>
          <li><strong>Maestro:</strong> CD +2</li>
          <li><strong>Leggendario:</strong> CD +5</li>
        </ul>
      </div>
    `;

    ChatMessage.create({
      content: message,
      whisper: [game.user.id]
    });
  }

  /**
   * Migliora character sheet
   */
  static enhanceCharacterSheet(app, html, data) {
    try {
      const actor = app.actor;
      const totalSpent = actor.getFlag(this.ID, 'totalSpent') || 0;
      const gamesWon = actor.getFlag(this.ID, 'gamesWon') || 0;
      const gamesLost = actor.getFlag(this.ID, 'gamesLost') || 0;

      if (totalSpent > 0 || gamesWon > 0 || gamesLost > 0) {
        const attributesTab = html.find('.tab[data-tab="attributes"]');
        if (attributesTab.length) {
          attributesTab.append(`
            <div class="brancalonia-tavern-stats">
              <h3>🍺 Statistiche Taverna</h3>
              <div class="form-group">
                <label>Oro Speso: ${totalSpent} mo</label>
                <label>Vittorie: ${gamesWon} | Sconfitte: ${gamesLost}</label>
              </div>
            </div>
          `);
        }
      }
    } catch (error) {
      this.statistics.errors.push({ 
        type: 'enhanceCharacterSheet', 
        message: error.message, 
        timestamp: Date.now() 
      });
      logger.error(this.MODULE_NAME, 'Errore enhancing character sheet', error);
    }
  }

  // ========================================
  // PUBLIC API METHODS (Enterprise-Grade)
  // ========================================

  /**
   * Ottiene lo stato corrente del modulo
   * @static
   * @returns {Object} Stato del modulo
   * @public
   */
  static getStatus() {
    return {
      version: this.VERSION,
      initialized: this._state.initialized,
      settingsRegistered: this._state.settingsRegistered,
      hooksRegistered: this._state.hooksRegistered,
      gamesConfigured: this._state.gamesConfigured,
      bagordiConfigured: this._state.bagordiConfigured,
      totalGamesAvailable: Object.keys(this.tavernGames || {}).length,
      totalBagordiResults: (this.bagordiResults || []).length
    };
  }

  /**
   * Ottiene le statistiche del modulo
   * @static
   * @returns {Object} Statistiche
   * @public
   */
  static getStatistics() {
    return {
      ...this.statistics,
      netGold: this.statistics.totalGoldWon - this.statistics.totalGoldSpent,
      errorCount: this.statistics.errors.length,
      successRate: this.statistics.gamesPlayed > 0 
        ? ((this.statistics.totalGoldWon / (this.statistics.totalGoldWon + this.statistics.totalGoldSpent)) * 100).toFixed(2) 
        : 0
    };
  }

  /**
   * Reset delle statistiche
   * @static
   * @returns {void}
   * @public
   */
  static resetStatistics() {
    this.statistics = {
      bagordiExecuted: 0,
      gamesPlayed: 0,
      totalGoldSpent: 0,
      totalGoldWon: 0,
      totalDamageDealt: 0,
      macrosCreated: 0,
      errors: []
    };
    logger.info(this.MODULE_NAME, 'Statistiche resettate');
  }

  /**
   * Mostra report completo del sistema
   * @static
   * @returns {void}
   * @public
   */
  static showReport() {
    const status = this.getStatus();
    const stats = this.getStatistics();

    const report = `
      <div class="brancalonia-report">
        <h2>📊 Report Sistema Taverne</h2>
        <h3>Stato Modulo</h3>
        <ul>
          <li><strong>Versione:</strong> ${status.version}</li>
          <li><strong>Inizializzato:</strong> ${status.initialized ? '✅' : '❌'}</li>
          <li><strong>Giochi Disponibili:</strong> ${status.totalGamesAvailable}</li>
          <li><strong>Risultati Bagordi:</strong> ${status.totalBagordiResults}</li>
        </ul>
        <h3>Statistiche Runtime</h3>
        <ul>
          <li><strong>Bagordi Eseguiti:</strong> ${stats.bagordiExecuted}</li>
          <li><strong>Giochi Giocati:</strong> ${stats.gamesPlayed}</li>
          <li><strong>Oro Speso:</strong> ${stats.totalGoldSpent} mo</li>
          <li><strong>Oro Vinto:</strong> ${stats.totalGoldWon} mo</li>
          <li><strong>Bilancio Netto:</strong> ${stats.netGold >= 0 ? '+' : ''}${stats.netGold} mo</li>
          <li><strong>Danni Inflitti:</strong> ${stats.totalDamageDealt} HP</li>
          <li><strong>Macro Create:</strong> ${stats.macrosCreated}</li>
          <li><strong>Errori:</strong> ${stats.errorCount}</li>
        </ul>
      </div>
    `;

    // Fixed: Migrated to DialogV2
    new foundry.applications.api.DialogV2({
      window: {
        title: 'Report Sistema Taverne'
      },
      content: report,
      buttons: [{
        action: 'export',
        label: 'Esporta Log',
        callback: () => {
          const log = JSON.stringify({ status, stats }, null, 2);
          const blob = new Blob([log], { type: 'application/json' });
          saveDataToFile(blob, 'text/json', 'tavern-entertainment-report.json');
        }
      }, {
        action: 'close',
        label: 'Chiudi',
        default: true
      }]
    }, {
      classes: ['tavern-report-dialog']
    }).render(true);

    logger.info(this.MODULE_NAME, 'Report visualizzato', { status, stats });
  }
}

// Auto-inizializzazione
Hooks.once('init', () => {
  try {
    if (!game.brancalonia) game.brancalonia = {};
    if (!game.brancalonia.modules) game.brancalonia.modules = {};

    window.BrancaloniaTavernEntertainment = BrancaloniaTavernEntertainment;
    game.brancalonia.tavernEntertainment = BrancaloniaTavernEntertainment;
    game.brancalonia.modules['tavern-entertainment-consolidated'] = BrancaloniaTavernEntertainment;

    BrancaloniaTavernEntertainment.initialize();
  } catch (error) {
    logger.error('Tavern Entertainment', 'Errore hook init', error);
  }
});

/**
 * CSS per effetti UI taverne e creazione macro
 */
Hooks.once('ready', () => {
  // Crea macro automatiche
  BrancaloniaTavernEntertainment.createAutomaticMacros();

  const style = document.createElement('style');
  style.innerHTML = `
    .brancalonia-notification {
      background: linear-gradient(135deg, #8D6E63 0%, #5D4037 100%);
      color: white;
      border: 2px solid #6D4C41;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(109, 76, 65, 0.4);
    }

    .brancalonia-notification h3 {
      color: #FFCC02;
      margin-bottom: 10px;
      text-align: center;
    }

    .brancalonia-notification ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    .brancalonia-notification code {
      background: rgba(0,0,0,0.3);
      padding: 2px 6px;
      border-radius: 3px;
      color: #FFEB3B;
    }

    .brancalonia-message.bagordi-result {
      background: linear-gradient(135deg, #E65100 0%, #FF9800 100%);
      color: white;
      border: 2px solid #D84315;
      padding: 12px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(216, 67, 21, 0.4);
    }

    .brancalonia-message.bagordi-result h3 {
      color: #FFF3E0;
      margin-bottom: 8px;
      text-align: center;
    }

    .brancalonia-message.bagordi-result .gold-spent {
      background: rgba(0,0,0,0.2);
      padding: 6px;
      border-radius: 4px;
      margin-top: 10px;
      font-weight: bold;
    }

    .brancalonia-message.tavern-game {
      background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%);
      color: white;
      border: 2px solid #1565C0;
      padding: 12px;
      border-radius: 8px;
    }

    .brancalonia-message.tavern-game h3 {
      color: #E3F2FD;
      margin-bottom: 8px;
      text-align: center;
    }

    .brancalonia-tavern-status {
      background: linear-gradient(135deg, #388E3C 0%, #4CAF50 100%);
      color: white;
      border: 2px solid #2E7D32;
      padding: 15px;
      border-radius: 8px;
    }

    .brancalonia-tavern-status h3 {
      color: #C8E6C9;
      margin-bottom: 10px;
    }

    .brancalonia-tavern-stats {
      background: #FFF3E0;
      border: 1px solid #FF9800;
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
    }

    .brancalonia-tavern-stats h3 {
      color: #E65100;
      margin-bottom: 8px;
    }

    .brancalonia-dialog {
      font-family: 'Roboto', sans-serif;
    }

    .brancalonia-dialog .form-group {
      margin-bottom: 15px;
    }

    .brancalonia-dialog label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
      color: #424242;
    }

    .brancalonia-dialog select,
    .brancalonia-dialog input {
      width: 100%;
      padding: 8px;
      border: 1px solid #BDBDBD;
      border-radius: 4px;
      font-size: 14px;
    }

    .brancalonia-dialog .notes {
      background: #F5F5F5;
      padding: 10px;
      border-radius: 4px;
      margin-top: 15px;
      font-size: 12px;
      color: #666;
    }

    .brancalonia-help {
      background: linear-gradient(135deg, #37474F 0%, #546E7A 100%);
      color: white;
      border: 2px solid #455A64;
      padding: 15px;
      border-radius: 8px;
    }

    .brancalonia-help h3, .brancalonia-help h4 {
      color: #B0BEC5;
      margin-bottom: 8px;
    }

    .brancalonia-help code {
      background: rgba(0,0,0,0.3);
      padding: 2px 6px;
      border-radius: 3px;
      color: #FFEB3B;
    }

    .brancalonia-help ul {
      margin: 10px 0;
      padding-left: 20px;
    }
  `;
  document.head.appendChild(style);

  logger.info('Tavern Entertainment', '✅ CSS e macro caricate');
});

// Export ES6
export default BrancaloniaTavernEntertainment;
export { BrancaloniaTavernEntertainment };