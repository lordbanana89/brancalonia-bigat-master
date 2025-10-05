/**
 * @fileoverview Sistema moderno per Foundry VTT v13+ con API moderne
 * @module brancalonia-v13-modern
 * @requires brancalonia-logger
 * @version 2.0.0
 * @author Brancalonia Community
 * 
 * @description
 * Wrapper moderno per Foundry VTT v13+ che usa SOLO API moderne.
 * NO retrocompatibilità - richiede Foundry v13.0.0+ e D&D 5e v5.0+
 * 
 * Funzionalità principali:
 * - Modern Actor Sheets enhancements (renderActorSheetV2)
 * - Modern Item Sheets enhancements (renderItemSheetV2)
 * - Canvas API moderne
 * - Combat Tracker enhancements
 * - Chat message styling
 * - Compendium filters
 * - Settings registration
 * - Socket handling
 */

import { createModuleLogger } from './brancalonia-logger.js';

const MODULE_LABEL = 'V13 Modern';
const moduleLogger = createModuleLogger(MODULE_LABEL);
/**
 * @typedef {Object} V13Statistics
 * @property {number} initTime - Tempo inizializzazione in ms
 * @property {number} characterSheetsEnhanced - Character sheets processate
 * @property {number} npcSheetsEnhanced - NPC sheets processate
 * @property {number} itemSheetsEnhanced - Item sheets processate
 * @property {number} canvasEnhancements - Canvas enhancements applicati
 * @property {number} combatTrackerRenders - Combat tracker renders
 * @property {number} chatMessagesStyled - Chat messages stilizzati
 * @property {number} compendiumFilters - Compendium filters applicati
 * @property {number} settingsRegistered - Settings registrati
 * @property {number} socketMessages - Socket messages ricevuti
 * @property {Array<Object>} errors - Errori registrati
 */

/**
 * Sistema moderno Foundry VTT v13+
 * @class BrancaloniaV13Modern
 */
class BrancaloniaV13Modern {
  static VERSION = '2.0.0';
  static MODULE_NAME = MODULE_LABEL;
  static REQUIRED_FOUNDRY_VERSION = '13';
  static REQUIRED_DND5E_VERSION = '5';

  /**
   * Statistiche del sistema
   * @static
   * @type {V13Statistics}
   */
  static statistics = {
    initTime: 0,
    characterSheetsEnhanced: 0,
    npcSheetsEnhanced: 0,
    itemSheetsEnhanced: 0,
    canvasEnhancements: 0,
    combatTrackerRenders: 0,
    chatMessagesStyled: 0,
    compendiumFilters: 0,
    settingsRegistered: 0,
    socketMessages: 0,
    errors: []
  };

  /**
   * Stato interno
   * @static
   * @private
   */
  static _state = {
    initialized: false,
    ready: false,
    foundryVersion: '',
    dnd5eVersion: ''
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Verifica se oggetto è jQuery
   * @static
   * @param {*} obj - Oggetto da verificare
   * @returns {boolean} True se è jQuery
   */
  static isJQuery(obj) {
    return obj && obj.jquery !== undefined;
  }

  /**
   * Assicura che html sia HTMLElement (converti da jQuery se necessario)
   * @static
   * @param {jQuery|HTMLElement} html - HTML element
   * @returns {HTMLElement} HTMLElement
   */
  static ensureElement(html) {
    if (this.isJQuery(html)) {
      return html[0]; // Ottieni HTMLElement da jQuery
    }
    return html; // Già un HTMLElement
  }

  /**
   * Assicura che html sia jQuery (converti da HTMLElement se necessario)
   * @static
   * @param {jQuery|HTMLElement} html - HTML element
   * @returns {jQuery} jQuery object
   */
  static ensureJQuery(html) {
    if (!this.isJQuery(html)) {
      return $(html); // Converti HTMLElement a jQuery
    }
    return html; // Già jQuery
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  /**
   * Inizializza il sistema V13 Modern
   * @static
   * @returns {void}
   * @fires v13:initialized
   */
  static initialize() {
    moduleLogger.startPerformance('v13-init');
    moduleLogger.info(`Inizializzazione V13 Modern v${this.VERSION}...`);

    try {
      // Version check
      this._checkVersions();

      // Register hooks
      this._registerHooks();

      // Register settings
      this._registerSettings();

      // Setup sockets
      this._setupSockets();

      this._state.initialized = true;

      const initTime = moduleLogger.endPerformance('v13-init');
      this.statistics.initTime = initTime;

      moduleLogger.info(`✅ V13 Modern inizializzato in ${initTime?.toFixed(2)}ms`);

      // Emit event
      moduleLogger.events.emit('v13:initialized', {
        version: this.VERSION,
        foundryVersion: this._state.foundryVersion,
        dnd5eVersion: this._state.dnd5eVersion,
        initTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore inizializzazione', error);
      this.statistics.errors.push({
        type: 'initialization',
        message: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * Verifica versioni Foundry VTT e D&D 5e
   * @static
   * @private
   * @throws {Error} Se versioni non compatibili
   */
  static _checkVersions() {
    const foundryVersion = game.version;
    const dnd5eVersion = game.system?.version || '0';

    this._state.foundryVersion = foundryVersion;
    this._state.dnd5eVersion = dnd5eVersion;

    // Check Foundry v13+
    if (!foundryVersion.startsWith(this.REQUIRED_FOUNDRY_VERSION)) {
      const errorMsg = `❌ BRANCALONIA RICHIEDE FOUNDRY V${this.REQUIRED_FOUNDRY_VERSION}! (Attuale: ${foundryVersion})`;
      ui.notifications.error(errorMsg, { permanent: true });
      throw new Error(`Brancalonia requires Foundry v${this.REQUIRED_FOUNDRY_VERSION}. Current: ${foundryVersion}`);
    }

    moduleLogger.info(`✅ Foundry v${foundryVersion} confirmed - Using modern APIs`);

    // Check D&D 5e v5+
    if (!dnd5eVersion.startsWith(this.REQUIRED_DND5E_VERSION)) {
      moduleLogger.warn(`⚠️ D&D 5e v${this.REQUIRED_DND5E_VERSION}.x richiesto per funzionalità complete (Attuale: ${dnd5eVersion})`);
      ui.notifications.warn('⚠️ D&D 5e v5.x richiesto per funzionalità complete');
    } else {
      moduleLogger.info(`✅ D&D 5e v${dnd5eVersion} confirmed`);
    }
  }

  /**
   * Registra tutti gli hooks moderni
   * @static
   * @private
   */
  static _registerHooks() {
    moduleLogger.info('🔄 Registrazione modern hooks D&D 5e v5.x');

    try {
      // Character sheets
      Hooks.on('renderActorSheetV2', (app, html, data) => {
        if (app.actor.type === 'character') {
          moduleLogger.debug('📝 Character sheet rendered');
          this._applyCharacterSheetEnhancements(app, html, data);
        }
      });

      // NPC sheets
      Hooks.on('renderActorSheetV2', (app, html, data) => {
        if (app.actor.type === 'npc') {
          moduleLogger.debug('📝 NPC sheet rendered');
          this._applyNPCSheetEnhancements(app, html, data);
        }
      });

      // Item sheets
      Hooks.on('renderItemSheetV2', (app, html, data) => {
        moduleLogger.debug('📝 Item sheet rendered');
        this._applyItemSheetEnhancements(app, html, data);
      });

      // Canvas ready
      Hooks.on('canvasReady', (canvas) => {
        this._handleCanvasReady(canvas);
      });

      // Combat tracker
      Hooks.on('renderCombatTracker', (app, html, data) => {
        this._handleCombatTracker(app, html, data);
      });

      // Chat messages
      Hooks.on('renderChatMessageHTML', (message, html, data) => {
        this._handleChatMessage(message, html, data);
      });

      // Compendium
      Hooks.on('renderCompendium', async (app, html, data) => {
        await this._handleCompendium(app, html, data);
      });

      moduleLogger.debug('✅ Hooks registrati con successo');

    } catch (error) {
      moduleLogger.error('Errore registrazione hooks', error);
      this.statistics.errors.push({
        type: 'register-hooks',
        message: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  // ============================================
  // SHEET ENHANCEMENTS
  // ============================================

  /**
   * Applica miglioramenti al character sheet usando API v13
   * @static
   * @private
   * @param {Application} app - Application instance
   * @param {Array<HTMLElement>|HTMLElement} html - HTML element(s)
   * @param {Object} data - Template data
   * @returns {void}
   * @fires v13:sheet-enhanced
   */
  static _applyCharacterSheetEnhancements(app, html, data) {
    moduleLogger.startPerformance(`v13-char-sheet-${app.actor.id}`);

    try {
      // In v13 renderActorSheetV2, html può essere un array di HTMLElement
      const element = Array.isArray(html) ? html[0] : html;

      // Aggiungi classe Brancalonia - vanilla JS
      element.classList.add('brancalonia-sheet');

      // Aggiungi controlli custom - vanilla JS
      const header = element.querySelector('.sheet-header');
      if (header) {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'brancalonia-controls';
        controlsDiv.innerHTML = `
          <button class="infamia-btn" title="Gestisci Infamia">
            <i class="fas fa-skull"></i> Infamia
          </button>
          <button class="baraonda-btn" title="Inizia Baraonda">
            <i class="fas fa-fist-raised"></i> Baraonda
          </button>
        `;
        header.appendChild(controlsDiv);

        // Event listeners con API moderne - vanilla JS
        const infamiaBtn = element.querySelector('.infamia-btn');
        if (infamiaBtn) {
          infamiaBtn.addEventListener('click', async () => {
            moduleLogger.info('🎭 Apertura Infamia tracker');

            const currentInfamia = app.actor.getFlag('brancalonia-bigat', 'infamia') || 0;

            // Usa DialogV2.prompt per Foundry v13
            const result = await foundry.applications.api.DialogV2.prompt({
              window: { title: 'Tracker Infamia' },
              content: `
                <div class="brancalonia-infamia">
                  <h3>Livello Infamia: <span id="infamia-value">${currentInfamia}</span></h3>
                  <input type="range" id="infamia-range" min="0" max="10" value="${currentInfamia}"
                         oninput="document.getElementById('infamia-value').textContent = this.value">
                </div>
              `,
              ok: {
                label: 'Salva',
                callback: (event, button, dialog) => {
                  const value = parseInt(dialog.querySelector('#infamia-range').value) || 0;
                  return value;
                }
              },
              rejectClose: false,
              modal: true
            });

            if (result !== null) {
              await app.actor.setFlag('brancalonia-bigat', 'infamia', result);
              ui.notifications.info(`Infamia aggiornata: ${result}`);
            }
          });
        }

        const baraondaBtn = element.querySelector('.baraonda-btn');
        if (baraondaBtn) {
          baraondaBtn.addEventListener('click', () => {
            moduleLogger.info('⚔️ Avvio Baraonda con modern API');
            // Usa Canvas moderno
            if (canvas.scene) {
              ui.notifications.info('🎲 Baraonda iniziata!');
              // Usa token layer moderno
              const tokens = canvas.tokens.placeables;
              tokens.forEach(t => {
                if (t.actor?.type === 'npc') {
                  t.document.update({ disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE });
                }
              });
            }
          });
        }
      }

      // Update statistics
      this.statistics.characterSheetsEnhanced++;

      const enhanceTime = moduleLogger.endPerformance(`v13-char-sheet-${app.actor.id}`);
      moduleLogger.debug(`Character sheet enhanced in ${enhanceTime?.toFixed(2)}ms`);

      // Emit event
      moduleLogger.events.emit('v13:sheet-enhanced', {
        type: 'character',
        actorId: app.actor.id,
        actorName: app.actor.name,
        enhanceTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error(`Errore enhancement character sheet per ${app.actor.name}`, error);
      this.statistics.errors.push({
        type: 'character-sheet-enhancement',
        message: error.message,
        actorId: app.actor.id,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Applica miglioramenti al NPC sheet usando API v13
   * @static
   * @private
   * @param {Application} app - Application instance
   * @param {Array<HTMLElement>|HTMLElement} html - HTML element(s)
   * @param {Object} data - Template data
   * @returns {void}
   * @fires v13:sheet-enhanced
   */
  static _applyNPCSheetEnhancements(app, html, data) {
    moduleLogger.startPerformance(`v13-npc-sheet-${app.actor.id}`);

    try {
      // In v13 renderActorSheetV2, html può essere un array di HTMLElement
      const element = Array.isArray(html) ? html[0] : html;

      element.classList.add('brancalonia-npc-sheet');

      // Aggiungi indicatore di pericolo - vanilla JS
      const header = element.querySelector('.sheet-header');
      if (header) {
        const cr = app.actor.system.details?.cr || 0;
        const dangerLevel = cr >= 5 ? 'alto' : cr >= 3 ? 'medio' : 'basso';

        const dangerDiv = document.createElement('div');
        dangerDiv.className = `brancalonia-danger danger-${dangerLevel}`;
        dangerDiv.innerHTML = `
          <i class="fas fa-exclamation-triangle"></i>
          Pericolo: ${dangerLevel.toUpperCase()}
        `;
        header.appendChild(dangerDiv);
      }

      // Update statistics
      this.statistics.npcSheetsEnhanced++;

      const enhanceTime = moduleLogger.endPerformance(`v13-npc-sheet-${app.actor.id}`);
      moduleLogger.debug(`NPC sheet enhanced in ${enhanceTime?.toFixed(2)}ms`);

      // Emit event
      moduleLogger.events.emit('v13:sheet-enhanced', {
        type: 'npc',
        actorId: app.actor.id,
        actorName: app.actor.name,
        enhanceTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error(`Errore enhancement NPC sheet per ${app.actor.name}`, error);
      this.statistics.errors.push({
        type: 'npc-sheet-enhancement',
        message: error.message,
        actorId: app.actor.id,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Applica miglioramenti al item sheet usando API v13
   * @static
   * @private
   * @param {Application} app - Application instance
   * @param {HTMLElement} html - HTML element
   * @param {Object} data - Template data
   * @returns {void}
   * @fires v13:sheet-enhanced
   */
  static _applyItemSheetEnhancements(app, html, data) {
    moduleLogger.startPerformance(`v13-item-sheet-${app.item.id}`);

    try {
      // In v13 renderItemSheetV2, html è un HTMLElement, non jQuery
      html.classList.add('brancalonia-item-sheet');

      // Aggiungi indicatore oggetto scadente - vanilla JS
      if (app.item.type === 'weapon' || app.item.type === 'equipment') {
        const header = html.querySelector('.sheet-header');
        if (header && app.item.getFlag('brancalonia-bigat', 'scadente')) {
          const scadenteDiv = document.createElement('div');
          scadenteDiv.className = 'brancalonia-scadente';
          scadenteDiv.innerHTML = `
            <i class="fas fa-trash"></i> Oggetto Scadente
          `;
          header.appendChild(scadenteDiv);
        }
      }

      // Update statistics
      this.statistics.itemSheetsEnhanced++;

      const enhanceTime = moduleLogger.endPerformance(`v13-item-sheet-${app.item.id}`);
      moduleLogger.debug(`Item sheet enhanced in ${enhanceTime?.toFixed(2)}ms`);

      // Emit event
      moduleLogger.events.emit('v13:sheet-enhanced', {
        type: 'item',
        itemId: app.item.id,
        itemName: app.item.name,
        enhanceTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error(`Errore enhancement item sheet per ${app.item.name}`, error);
      this.statistics.errors.push({
        type: 'item-sheet-enhancement',
        message: error.message,
        itemId: app.item.id,
        timestamp: Date.now()
      });
    }
  }

  // ============================================
  // HOOK HANDLERS
  // ============================================

  /**
   * Handler canvasReady con API V13 moderne
   * @static
   * @private
   * @param {Canvas} canvas - Canvas instance
   * @returns {void}
   * @fires v13:canvas-ready
   */
  static _handleCanvasReady(canvas) {
    moduleLogger.startPerformance('v13-canvas-ready');
    moduleLogger.info('🗺️ Canvas ready - Using modern Canvas API');

    try {
      // Usa API Canvas moderne
      const scene = canvas.scene;
      const isTavernScene = scene.getFlag('brancalonia-bigat', 'tavernScene');

      // Applica tema Brancalonia alla scena
      if (isTavernScene) {
        moduleLogger.info('🍺 Tavern scene detected - Applying atmosphere');

        // Usa lighting layer moderno
        canvas.lighting.globalLight = false;
        canvas.lighting.globalLightThreshold = 0.5;

        // Aggiungi effetti atmosferici
        canvas.scene.update({
          darkness: 0.4,
          fogExploration: true
        });
      }

      // Update statistics
      this.statistics.canvasEnhancements++;

      const canvasTime = moduleLogger.endPerformance('v13-canvas-ready');
      moduleLogger.debug(`Canvas ready processed in ${canvasTime?.toFixed(2)}ms`);

      // Emit event
      moduleLogger.events.emit('v13:canvas-ready', {
        sceneId: scene.id,
        sceneName: scene.name,
        tavernScene: isTavernScene,
        canvasTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore canvas ready handler', error);
      this.statistics.errors.push({
        type: 'canvas-ready',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handler renderCombatTracker
   * @static
   * @private
   * @param {Application} app - Application instance
   * @param {jQuery|HTMLElement} html - HTML element
   * @param {Object} data - Template data
   * @returns {void}
   * @fires v13:combat-tracker-ready
   */
  static _handleCombatTracker(app, html, data) {
    // Verifica se combat è disponibile PRIMA di iniziare performance tracking
    const combat = game?.combat;
    if (!combat) {
      // Debug silenzioso - situazione normale quando non c'è combattimento
      moduleLogger.debug('Combat non disponibile, skip enhancements');
      return;
    }

    moduleLogger.startPerformance('v13-combat-tracker');
    moduleLogger.debug('⚔️ Combat tracker rendered');

    try {
      // renderCombatTracker passa jQuery object
      const $html = this.ensureJQuery(html);

      // Aggiungi bottone Baraonda
      const controls = $html.find('.combat-control');
      controls.append(`
        <a class="combat-control baraonda-roll" title="Tira per Baraonda">
          <i class="fas fa-dice-d20"></i>
        </a>
      `);

      $html.find('.baraonda-roll').click(async () => {
        try {
          const roll = await new Roll('1d6').evaluate();
          await roll.toMessage({
            flavor: '🎲 Tiro Baraonda',
            speaker: ChatMessage.getSpeaker()
          });

          if (roll.total >= 5) {
            ui.notifications.info('💥 BARAONDA! Tutti attaccano!');
            moduleLogger.info(`Baraonda triggered! Roll: ${roll.total}`);
          }
        } catch (error) {
          moduleLogger.error('Errore Baraonda roll', error);
        }
      });

      // Update statistics
      this.statistics.combatTrackerRenders++;

      const trackerTime = moduleLogger.endPerformance('v13-combat-tracker');
      moduleLogger.debug(`Combat tracker processed in ${trackerTime?.toFixed(2)}ms`);

      // Emit event
      moduleLogger.events.emit('v13:combat-tracker-ready', {
        combatId: combat.id,
        combatants: combat.combatants.size,
        trackerTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore combat tracker handler', error);
      this.statistics.errors.push({
        type: 'combat-tracker',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handler renderChatMessageHTML
   * @static
   * @private
   * @param {ChatMessage} message - Chat message
   * @param {HTMLElement} html - HTML element
   * @param {Object} data - Template data
   * @returns {void}
   */
  static _handleChatMessage(message, html, data) {
    try {
      // renderChatMessageHTML passa HTMLElement
      const $html = this.ensureJQuery(html);

      let styled = false;

      // Aggiungi stile Brancalonia ai messaggi
      if (message.getFlag('brancalonia-bigat', 'isInfamiaRoll')) {
        $html.addClass('brancalonia-infamia-message');
        const $header = $html.find('.message-header');
        if ($header.length) {
          $header.prepend('<i class="fas fa-skull"></i> ');
        }
        styled = true;
      }

      if (message.getFlag('brancalonia-bigat', 'isBaraondaRoll')) {
        $html.addClass('brancalonia-baraonda-message');
        const $header = $html.find('.message-header');
        if ($header.length) {
          $header.prepend('<i class="fas fa-fist-raised"></i> ');
        }
        styled = true;
      }

      // Update statistics
      if (styled) {
        this.statistics.chatMessagesStyled++;
        moduleLogger.debug(`Chat message styled: ${message.id}`);
      }

    } catch (error) {
      moduleLogger.error('Errore chat message handler', error);
      this.statistics.errors.push({
        type: 'chat-message',
        message: error.message,
        messageId: message.id,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handler renderCompendium
   * @static
   * @async
   * @private
   * @param {Application} app - Application instance
   * @param {jQuery|HTMLElement} html - HTML element
   * @param {Object} data - Template data
   * @returns {Promise<void>}
   */
  static async _handleCompendium(app, html, data) {
    moduleLogger.startPerformance('v13-compendium');
    moduleLogger.debug('📚 Compendium rendered');

    try {
      // renderCompendium passa jQuery object
      const $html = this.ensureJQuery(html);

      // Aggiungi filtri Brancalonia
      if (app.collection.metadata.id?.includes('brancalonia')) {
        const controls = $html.find('.header-search');
        controls.after(`
          <div class="brancalonia-filters">
            <button class="filter-scadente" title="Solo Oggetti Scadenti">
              <i class="fas fa-trash"></i>
            </button>
            <button class="filter-speciale" title="Solo Oggetti Speciali">
              <i class="fas fa-star"></i>
            </button>
          </div>
        `);

        // Event handlers
        $html.find('.filter-scadente').click(() => {
          moduleLogger.info('🗑️ Filtraggio oggetti scadenti');
          this.statistics.compendiumFilters++;
          // TODO: Implementa filtro scadente
        });

        $html.find('.filter-speciale').click(() => {
          moduleLogger.info('⭐ Filtraggio oggetti speciali');
          this.statistics.compendiumFilters++;
          // TODO: Implementa filtro speciale
        });

        const compendiumTime = moduleLogger.endPerformance('v13-compendium');
        moduleLogger.debug(`Compendium processed in ${compendiumTime?.toFixed(2)}ms`);
      }

    } catch (error) {
      moduleLogger.error('Errore compendium handler', error);
      this.statistics.errors.push({
        type: 'compendium',
        message: error.message,
        compendiumId: app.collection.metadata.id,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Registra settings V13 Modern
   * @static
   * @private
   * @returns {void}
   * @fires v13:settings-registered
   */
  static _registerSettings() {
    moduleLogger.info('⚙️ Registrazione Brancalonia settings');

    try {
      // Registra settings usando API moderne
      game.settings.register('brancalonia-bigat', 'useInfamia', {
        name: 'Usa Sistema Infamia',
        hint: "Attiva il tracking dell'Infamia per i personaggi",
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      game.settings.register('brancalonia-bigat', 'useBaraonda', {
        name: 'Usa Regole Baraonda',
        hint: 'Attiva le regole per le risse da taverna',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      game.settings.register('brancalonia-bigat', 'useShoddy', {
        name: 'Usa Oggetti Scadenti',
        hint: 'Attiva le regole per gli oggetti scadenti',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      this.statistics.settingsRegistered = 3;

      moduleLogger.info('✅ 3 settings registrati con successo');

      // Emit event
      moduleLogger.events.emit('v13:settings-registered', {
        count: 3,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore registrazione settings', error);
      this.statistics.errors.push({
        type: 'settings-registration',
        message: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * Setup socket handling
   * @static
   * @private
   * @returns {void}
   */
  static _setupSockets() {
    moduleLogger.info('📡 Setup Brancalonia sockets');

    try {
      // Usa socket moderni
      game.socket.on('module.brancalonia-bigat', (data) => {
        try {
          moduleLogger.debug('📨 Received socket data:', data);

          this.statistics.socketMessages++;

          switch (data.action) {
            case 'infamiaUpdate':
              ui.notifications.info(`Infamia aggiornata: ${data.value}`);
              break;
            case 'baraondaStart':
              ui.notifications.warn('💥 BARAONDA INIZIATA!');
              break;
            default:
              moduleLogger.warn(`Socket action sconosciuta: ${data.action}`);
          }

        } catch (error) {
          moduleLogger.error('Errore handling socket message', error);
          this.statistics.errors.push({
            type: 'socket-message',
            message: error.message,
            action: data?.action,
            timestamp: Date.now()
          });
        }
      });

      moduleLogger.debug('✅ Sockets configurati');

    } catch (error) {
      moduleLogger.error('Errore setup sockets', error);
      this.statistics.errors.push({
        type: 'socket-setup',
        message: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * Handler ready event
   * @static
   * @returns {void}
   */
  static onReady() {
    moduleLogger.info('✨ Brancalonia V13 Modern - READY');
    moduleLogger.info('📋 Active features:');
    moduleLogger.info('  - Modern Actor Sheets ✅');
    moduleLogger.info('  - Modern Canvas API ✅');
    moduleLogger.info('  - Modern Combat Tracker ✅');
    moduleLogger.info('  - Modern Compendiums ✅');
    moduleLogger.info('  - Modern Settings ✅');
    moduleLogger.info('  - Modern Sockets ✅');

    this._state.ready = true;

    ui.notifications.info("🎭 Brancalonia V13 - Pronto all'avventura!", { permanent: false });
  }

  // =================================================================
  // PUBLIC API
  // =================================================================

  /**
   * Ottiene lo status corrente di V13 Modern
   * @static
   * @returns {Object} Status completo
   * @example
   * const status = BrancaloniaV13Modern.getStatus();
   * console.log('Sheets enhanced:', status.sheetsEnhanced);
   */
  static getStatus() {
    return {
      version: this.VERSION,
      initialized: this._state.initialized,
      ready: this._state.ready,
      foundryVersion: this._state.foundryVersion,
      dnd5eVersion: this._state.dnd5eVersion,
      characterSheetsEnhanced: this.statistics.characterSheetsEnhanced,
      npcSheetsEnhanced: this.statistics.npcSheetsEnhanced,
      itemSheetsEnhanced: this.statistics.itemSheetsEnhanced,
      sheetsEnhanced: this.statistics.characterSheetsEnhanced + this.statistics.npcSheetsEnhanced + this.statistics.itemSheetsEnhanced,
      canvasEnhancements: this.statistics.canvasEnhancements,
      combatTrackerRenders: this.statistics.combatTrackerRenders,
      chatMessagesStyled: this.statistics.chatMessagesStyled,
      settingsRegistered: this.statistics.settingsRegistered,
      socketMessages: this.statistics.socketMessages,
      errors: this.statistics.errors.length
    };
  }

  /**
   * Ottiene le statistiche complete
   * @static
   * @returns {V13Statistics} Statistiche complete
   * @example
   * const stats = BrancaloniaV13Modern.getStatistics();
   * console.log('Init time:', stats.initTime);
   */
  static getStatistics() {
    return {
      ...this.statistics
    };
  }

  /**
   * Resetta le statistiche
   * @static
   * @returns {void}
   * @example
   * BrancaloniaV13Modern.resetStatistics();
   */
  static resetStatistics() {
    moduleLogger.info('Reset statistiche V13 Modern');

    const initTime = this.statistics.initTime;

    this.statistics = {
      initTime,
      characterSheetsEnhanced: 0,
      npcSheetsEnhanced: 0,
      itemSheetsEnhanced: 0,
      canvasEnhancements: 0,
      combatTrackerRenders: 0,
      chatMessagesStyled: 0,
      compendiumFilters: 0,
      settingsRegistered: this.statistics.settingsRegistered, // Mantieni
      socketMessages: 0,
      errors: []
    };

    moduleLogger.info('Statistiche resettate');
  }

  /**
   * Mostra un report completo nella console
   * @static
   * @returns {Object} Status e statistiche (per uso programmatico)
   * @example
   * BrancaloniaV13Modern.showReport();
   */
  static showReport() {
    const stats = this.getStatistics();
    const status = this.getStatus();

    moduleLogger.group('🚀 Brancalonia V13 Modern - Report');

    moduleLogger.info('VERSION:', this.VERSION);
    moduleLogger.info('Initialized:', status.initialized);
    moduleLogger.info('Ready:', status.ready);
    moduleLogger.info('Foundry:', status.foundryVersion);
    moduleLogger.info('D&D 5e:', status.dnd5eVersion);

    moduleLogger.group('📊 Statistics');
    moduleLogger.table([
      { Metric: 'Init Time', Value: `${stats.initTime?.toFixed(2)}ms` },
      { Metric: 'Character Sheets', Value: stats.characterSheetsEnhanced },
      { Metric: 'NPC Sheets', Value: stats.npcSheetsEnhanced },
      { Metric: 'Item Sheets', Value: stats.itemSheetsEnhanced },
      { Metric: 'Total Sheets', Value: status.sheetsEnhanced },
      { Metric: 'Canvas Enhancements', Value: stats.canvasEnhancements },
      { Metric: 'Combat Tracker Renders', Value: stats.combatTrackerRenders },
      { Metric: 'Chat Messages Styled', Value: stats.chatMessagesStyled },
      { Metric: 'Compendium Filters', Value: stats.compendiumFilters },
      { Metric: 'Settings Registered', Value: stats.settingsRegistered },
      { Metric: 'Socket Messages', Value: stats.socketMessages },
      { Metric: 'Errors', Value: stats.errors.length }
    ]);
    moduleLogger.groupEnd();

    if (stats.errors.length > 0) {
      moduleLogger.group('🐛 Errors');
      stats.errors.forEach((err, i) => {
        moduleLogger.error(`Error ${i + 1}:`, err.type, '-', err.message);
      });
      moduleLogger.groupEnd();
    }

    moduleLogger.groupEnd();

    return { status, stats };
  }
}

// =================================================================
// HOOKS REGISTRATION
// =================================================================

Hooks.once('init', () => {
  BrancaloniaV13Modern.initialize();
});

Hooks.once('ready', () => {
  BrancaloniaV13Modern.onReady();
});

// Export globale
window.BrancaloniaV13Modern = BrancaloniaV13Modern;