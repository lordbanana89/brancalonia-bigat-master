/**
 * @fileoverview Sistema centralizzato per coordinare modifiche UI actor sheet
 * @module brancalonia-ui-coordinator
 * @requires brancalonia-logger
 * @version 2.0.0
 * @author Brancalonia Community
 * 
 * @description
 * Coordinatore UI centralizzato per gestire tutte le modifiche all'actor sheet.
 * Risolve conflitti tra moduli e garantisce ordine di esecuzione corretto.
 * 
 * Funzionalità principali:
 * - Integrazione con Carolingian UI
 * - Processing a 6 fasi (preparazione, struttura, contenuto, styling, eventi, finalizzazione)
 * - 6 tab Brancalonia (Infamia, Compagnia, Rifugio, Lavori, Malefatte, Privilegi)
 * - Sistema privilegi background
 * - Compatibility D&D 5e v3.x/v4.x/v5.x
 * - Conflict resolution automatico
 * 
 * @example
 * // Check status coordinatore
 * const status = BrancaloniaUICoordinator.getStatus();
 * 
 * @example
 * // Mostra report statistiche
 * BrancaloniaUICoordinator.showReport();
 */

import { createModuleLogger } from './brancalonia-logger.js';

const MODULE_LABEL = 'UI Coordinator';
const moduleLogger = createModuleLogger(MODULE_LABEL);
/**
 * @typedef {Object} UICoordinatorStatistics
 * @property {number} initTime - Tempo inizializzazione in ms
 * @property {number} sheetsProcessed - Totale sheets processate
 * @property {number} characterSheets - Character sheets processate
 * @property {number} npcSheets - NPC sheets processate
 * @property {number} tabsAdded - Tab aggiunte
 * @property {number} privilegesLoaded - Privilegi caricati
 * @property {boolean} carolingianDetected - Carolingian UI rilevato
 * @property {number} carolingianIntegrations - Integrazioni Carolingian
 * @property {Object} phaseTimings - Timing per fase (avg ms)
 * @property {Array<Object>} errors - Errori registrati
 */

/**
 * Sistema coordinatore UI per actor sheets Brancalonia
 * @class BrancaloniaUICoordinator
 */
class BrancaloniaUICoordinator {
  static ID = 'brancalonia-bigat';
  static VERSION = '2.0.0';
  static MODULE_NAME = MODULE_LABEL;

  /**
   * Registro delle modifiche UI per evitare conflitti
   * @static
   * @private
   */
  static registry = {
    tabs: [],
    sections: [],
    fields: [],
    css: [],
    hooks: new Map()
  };

  /**
   * Statistiche del coordinatore UI
   * @static
   * @type {UICoordinatorStatistics}
   */
  static statistics = {
    initTime: 0,
    sheetsProcessed: 0,
    characterSheets: 0,
    npcSheets: 0,
    tabsAdded: 0,
    privilegesLoaded: 0,
    carolingianDetected: false,
    carolingianIntegrations: 0,
    phaseTimings: {
      phase1: 0,
      phase2: 0,
      phase3: 0,
      phase4: 0,
      phase5: 0,
      phase6: 0
    },
    errors: []
  };

  /**
   * Stato interno coordinatore
   * @static
   * @private
   */
  static _state = {
    initialized: false,
    carolingianActive: false,
    processedSheets: new Set()
  };

  /**
   * Inizializza il coordinatore UI
   * @static
   * @returns {void}
   * @fires ui:coordinator-initialized
   */
  static initialize() {
    moduleLogger.startPerformance('ui-coordinator-init');
    moduleLogger.info(`Inizializzazione UI Coordinator v${this.VERSION}...`);

    try {
      // Verifica se Carolingian UI è attivo
      const carolingianActive = game.modules.get('brancalonia-bigat')?.active;
      this._state.carolingianActive = !!carolingianActive;
      this.statistics.carolingianDetected = !!carolingianActive;

      if (!carolingianActive) {
        moduleLogger.warn('⚠️ Carolingian UI non attivo, skip integrazione');
        return;
      }

      moduleLogger.info('✅ Carolingian UI attivo, integrazione in corso...');

      // Integra con Carolingian UI invece di sostituirlo
      this._integrateWithCarolingianUI();

      // Registra sistema di priorità
      this._setupPrioritySystem();

      // Fix per problemi di compatibilità
      this._applyCompatibilityFixes();

      // Mark as initialized
      this._state.initialized = true;

      const initTime = moduleLogger.endPerformance('ui-coordinator-init');
      this.statistics.initTime = initTime;

      moduleLogger.info(`✅ UI Coordinator pronto in ${initTime?.toFixed(2)}ms`);

      // Emit event
      moduleLogger.events.emit('ui:coordinator-initialized', {
        version: this.VERSION,
        carolingianActive: this._state.carolingianActive,
        initTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore durante inizializzazione', error);
      this.statistics.errors.push({
        type: 'initialization',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Integra con Carolingian UI invece di sostituirlo
   * @static
   * @private
   * @returns {void}
   */
  static _integrateWithCarolingianUI() {
    try {
      // Verifica se SheetsUtil di Carolingian UI è attivo
      if (typeof window.brancaloniaSettings?.SheetsUtil !== 'undefined') {
        moduleLogger.info('🎨 Carolingian UI SheetsUtil rilevato, coordinamento...');

        // Registra hook dopo quelli di Carolingian UI per evitare conflitti
        Hooks.once('ready', () => {
          setTimeout(() => {
            this._registerCompatibilityHooks();
          }, 1000); // Delay per permettere a Carolingian UI di inizializzarsi completamente
        });
      } else {
        moduleLogger.warn('⚠️ Carolingian UI SheetsUtil non trovato, hooks standard');
        this._registerCentralHook();
      }

    } catch (error) {
      moduleLogger.error('Errore integrazione Carolingian UI', error);
      this.statistics.errors.push({
        type: 'carolingian-integration',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Registra hook di compatibilità per lavorare insieme a Carolingian UI
   * @static
   * @private
   * @returns {void}
   */
  static _registerCompatibilityHooks() {
    moduleLogger.info('🎨 Registrazione compatibility hooks con Carolingian UI');

    try {
      // Hook per actor sheets che funziona insieme a Carolingian UI
      Hooks.on('renderActorSheetV2', async (app, html, data) => {
        try {
          // Verifica se Carolingian UI ha già processato questa sheet
          const element = (html instanceof jQuery) ? html[0] : (Array.isArray(html) ? html[0] : html);
          
          if (element?.dataset?.crlngnProcessed) {
            moduleLogger.debug('Sheet già processata da Carolingian UI, aggiungo enhancements');

            this.statistics.carolingianIntegrations++;

            // Aggiungi solo elementi specifici di Brancalonia che Carolingian UI non gestisce
            await this._addBrancaloniaEnhancements(app, html, data);
          } else if (!element?.dataset?.brancaloniaProcessed) {
            moduleLogger.debug('Carolingian UI non rilevato, processing completo');
            await this._processActorSheet(app, html, data);
          }

        } catch (error) {
          moduleLogger.error('Errore hook renderActorSheetV2', error);
          this.statistics.errors.push({
            type: 'hook-render-sheet-v2',
            message: error.message,
            timestamp: Date.now()
          });
        }
      });

      moduleLogger.debug('Compatibility hooks registrati');

    } catch (error) {
      moduleLogger.error('Errore registrazione compatibility hooks', error);
      this.statistics.errors.push({
        type: 'register-compatibility-hooks',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Aggiunge miglioramenti specifici di Brancalonia a sheet già processate da Carolingian UI
   * @static
   * @async
   * @private
   * @param {Application} app - Application instance
   * @param {jQuery|HTMLElement} html - HTML element
   * @param {Object} data - Template data
   * @returns {Promise<void>}
   */
  static async _addBrancaloniaEnhancements(app, html, data) {
    try {
      const element = (html instanceof jQuery) ? html[0] : (Array.isArray(html) ? html[0] : html);
      if (!element) {
        moduleLogger.warn('Elemento HTML non valido per enhancements');
        return;
      }

      // Marca come processato da Brancalonia per evitare doppi processing
      element.dataset.brancaloniaProcessed = 'true';

      // Aggiungi elementi specifici di Brancalonia che Carolingian UI non gestisce
      await this._addBrancaloniaSpecificElements(app, html, data);

      moduleLogger.info('✅ Enhancements Brancalonia aggiunti a sheet Carolingian UI');

    } catch (error) {
      moduleLogger.error('Errore aggiunta enhancements Brancalonia', error);
      this.statistics.errors.push({
        type: 'add-enhancements',
        message: error.message,
        actorId: app?.actor?.id,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Aggiunge elementi specifici di Brancalonia che Carolingian UI non gestisce
   * @static
   * @async
   * @private
   * @param {Application} app - Application instance
   * @param {jQuery|HTMLElement} html - HTML element
   * @param {Object} data - Template data
   * @returns {Promise<void>}
   * @fires ui:tab-added
   */
  static async _addBrancaloniaSpecificElements(app, html, data) {
    const actor = app.actor;
    if (!actor) {
      moduleLogger.warn('Actor non disponibile per elementi specifici');
      return;
    }

    try {

    // Wrap html in jQuery if needed
    let $html = html;
    if (!($html instanceof jQuery)) {
      if (Array.isArray(html)) {
        $html = $(html[0]);
      } else {
        $html = $(html);
      }
    }

    // Aggiungi solo elementi specifici di Brancalonia che Carolingian UI non gestisce
    if (actor.type === 'character') {
      // Aggiungi tab Infamia se non esiste già
      const infamiaTab = $html.find('.sheet-navigation .item[data-tab="infamia"], .tabs .item[data-tab="infamia"]');
      if (infamiaTab.length === 0) {
        this._addInfamiaTab($html, actor);
      }

      // Aggiungi tab Compagnia se non esiste già
      const compagniaTab = $html.find('.sheet-navigation .item[data-tab="compagnia"], .tabs .item[data-tab="compagnia"]');
      if (compagniaTab.length === 0) {
        this._addCompagniaTab($html, actor);
      }

      // Aggiungi tab Rifugio se non esiste già
      const havenTab = $html.find('.sheet-navigation .item[data-tab="haven"], .tabs .item[data-tab="haven"]');
      if (havenTab.length === 0) {
        this._addHavenTab($html, actor);
      }
    }

      // Aggiungi elementi decorativi rinascimentali se Carolingian UI non li ha aggiunti
      this._addBrancaloniaDecorativeElements($html, actor);

      moduleLogger.debug(`Elementi specifici aggiunti per ${actor.name}`);

    } catch (error) {
      moduleLogger.error('Errore aggiunta elementi specifici', error);
      this.statistics.errors.push({
        type: 'add-specific-elements',
        message: error.message,
        actorId: actor?.id,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Seleziona la navigazione principale per l'actor sheet
   * @param {jQuery|HTMLElement|Array} html
   * @returns {jQuery|null}
   * @private
   */
  static _selectPrimaryNavigation(html) {
    if (!html) return null;

    if (html instanceof jQuery) {
      const sheetNav = html.find('.sheet-navigation').first();
      if (sheetNav.length) return sheetNav;
      const tabsNav = html.find('.tabs').first();
      return tabsNav.length ? tabsNav : null;
    }

    const element = Array.isArray(html) ? html[0] : html;
    if (!(element instanceof HTMLElement)) {
      return null;
    }

    const navElement = element.querySelector('.sheet-navigation') || element.querySelector('.tabs');
    return navElement ? $(navElement) : null;
  }

  /**
   * Aggiunge tab Infamia
   */
  static _addInfamiaTab($html, actor) {
    const nav = this._selectPrimaryNavigation($html);
    if (!nav) return;

    const infamiaTab = $(`
      <a class="item" data-tab="infamia">
        <i class="fas fa-skull"></i>
        Infamia
      </a>
    `);

    nav.append(infamiaTab);

    // Crea contenuto tab se non esiste
    const tabContent = $html.find('.tab[data-tab="infamia"], .sheet-body .tab.infamia');
    if (tabContent.length === 0) {
      const sheetBody = $html.find('.sheet-body');
      if (sheetBody.length > 0) {
        const infamiaContent = $(`
          <div class="tab infamia" data-group="primary" data-tab="infamia">
            <div class="brancalonia-infamia-section">
              <h3>🏴‍☠️ Sistema Infamia</h3>
              <p>Sistema di reputazione e conseguenze rinascimentale italiano</p>
            </div>
          </div>
        `);
        sheetBody.append(infamiaContent);
      }
    }
  }

  /**
   * Aggiunge tab Compagnia
   */
  static _addCompagniaTab($html, actor) {
    const nav = this._selectPrimaryNavigation($html);
    if (!nav) return;

    const compagniaTab = $(`
      <a class="item" data-tab="compagnia">
        <i class="fas fa-users"></i>
        Compagnia
      </a>
    `);

    nav.append(compagniaTab);
  }

  /**
   * Aggiunge tab Rifugio
   */
  static _addHavenTab($html, actor) {
    const nav = this._selectPrimaryNavigation($html);
    if (!nav) return;

    const havenTab = $(`
      <a class="item" data-tab="haven">
        <i class="fas fa-home"></i>
        Rifugio
      </a>
    `);

    nav.append(havenTab);
  }

  /**
   * Aggiunge elementi decorativi rinascimentali
   */
  static _addBrancaloniaDecorativeElements($html, actor) {
    // Aggiungi classe tema Brancalonia se non presente
    const body = $html.find('body');
    if (body.length > 0 && !body.hasClass('theme-brancalonia')) {
      body.addClass('theme-brancalonia');
    }

    // Aggiungi elementi decorativi specifici
    const header = $html.find('.sheet-header');
    if (header.length > 0) {
      // Aggiungi bordo rinascimentale se non presente
      if (!header.hasClass('brancalonia-border')) {
        header.addClass('brancalonia-border');
      }
    }
  }

  /**
   * Hook centralizzato per tutte le modifiche actor sheet
   * @static
   * @private
   * @returns {void}
   */
  static _registerCentralHook() {
    try {
      // Hook specifici per character/NPC - Version-aware
      const systemVersion = parseFloat(game.system?.version || '0');
      const isV5Plus = systemVersion >= 5.0;

      moduleLogger.info(`Registrazione central hook per D&D 5e v${systemVersion}`);

      if (isV5Plus) {
        // dnd5e v5.x+ usa renderActorSheetV2
        moduleLogger.info('🎨 Utilizzo hooks D&D 5e v5.x');
        
        Hooks.on('renderActorSheetV2', async (app, html, data) => {
          try {
            // Previeni doppio processing
            const element = (html instanceof jQuery) ? html[0] : (Array.isArray(html) ? html[0] : html);
            if (element?.dataset?.brancaloniaProcessed) return;

            await this._processActorSheet(app, html, data);

          } catch (error) {
            moduleLogger.error('Errore hook renderActorSheetV2', error);
            this.statistics.errors.push({
              type: 'hook-render-sheet-v2',
              message: error.message,
              timestamp: Date.now()
            });
          }
        });

        // Fixed: Use SheetCoordinator for fallback
        const SheetCoordinator = window.SheetCoordinator || game.brancalonia?.SheetCoordinator;
        
        if (SheetCoordinator) {
          SheetCoordinator.registerModule('UICoordinator', async (app, html, data) => {
            try {
              const element = (html instanceof jQuery) ? html[0] : html;
              if (!element?.dataset?.brancaloniaProcessed) {
                await this._processActorSheet(app, html, data);
              }
            } catch (error) {
              moduleLogger.error('Errore UI coordinator', error);
              this.statistics.errors.push({
                type: 'ui-coordinator',
                message: error.message,
                timestamp: Date.now()
              });
            }
          }, {
            priority: 90,
            types: ['character', 'npc']
          });
        } else {
          Hooks.on('renderActorSheet', async (app, html, data) => {
            try {
              const element = (html instanceof jQuery) ? html[0] : html;
              if (!element?.dataset?.brancaloniaProcessed) {
                await this._processActorSheet(app, html, data);
              }

            } catch (error) {
              moduleLogger.error('Errore hook renderActorSheet fallback', error);
              this.statistics.errors.push({
                type: 'hook-render-sheet-fallback',
                message: error.message,
                timestamp: Date.now()
              });
            }
          });
        }

      } else {
        // dnd5e v3.x/v4.x usa hooks legacy
        moduleLogger.info('🎨 Utilizzo compatibility hooks D&D 5e v3/v4');
        
        // Usa renderApplication con controllo tipo per compatibilità
        Hooks.on('renderApplication', async (app, html, data) => {
          try {
            // Verifica che sia una actor sheet D&D 5e
            if (!app.actor || !['character', 'npc'].includes(app.actor.type)) return;
            if (!app.constructor.name.includes('ActorSheet')) return;
            
            const actorType = app.actor.type;
            if (!html[0]?.dataset.brancaloniaProcessed) {
              await this._processActorSheet(app, html, data, actorType);
            }

          } catch (error) {
            moduleLogger.error('Errore hook renderApplication', error);
            this.statistics.errors.push({
              type: 'hook-render-application',
              message: error.message,
              timestamp: Date.now()
            });
          }
        });
      }

      moduleLogger.debug('Central hooks registrati con successo');

    } catch (error) {
      moduleLogger.error('Errore registrazione central hook', error);
      this.statistics.errors.push({
        type: 'register-central-hook',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Processa l'actor sheet con tutte le modifiche ordinate (6 fasi)
   * @static
   * @async
   * @private
   * @param {Application} app - Application instance
   * @param {jQuery|HTMLElement} html - HTML element
   * @param {Object} data - Template data
   * @param {string|null} forceType - Forza tipo actor
   * @returns {Promise<void>}
   * @fires ui:sheet-processed
   */
  static async _processActorSheet(app, html, data, forceType = null) {
    const actor = app.actor;
    if (!actor) {
      moduleLogger.warn('Actor non disponibile per processing');
      return;
    }

    moduleLogger.startPerformance(`ui-process-sheet-${actor.id}`);

    try {
      // Wrap html in jQuery if needed (Foundry v13 compatibility)
      // Foundry v13 renderActorSheetV2 can pass array of HTMLElements
      let $html;
      if (html instanceof jQuery) {
        $html = html;
      } else if (Array.isArray(html)) {
        // v13 renderActorSheetV2: array of HTMLElements
        $html = $(html[0]);
      } else {
        // Single HTMLElement
        $html = $(html);
      }

      // Marca come processato per evitare duplicazioni
      const element = $html[0] || $html;
      element.dataset.brancaloniaProcessed = 'true';

      // Determina tipo actor
      const actorType = forceType || actor.type;

      moduleLogger.info(`🎭 Processing ${actorType} sheet: ${actor.name}`);

      // 1. FASE PREPARAZIONE - Setup base
      await this._phase1_PrepareSheet($html, actor, data);

      // 2. FASE STRUTTURA - Modifiche strutturali (tabs, sezioni)
      await this._phase2_ModifyStructure($html, actor, data);

      // 3. FASE CONTENUTO - Aggiunta contenuti Brancalonia
      await this._phase3_AddContent($html, actor, data);

      // 4. FASE STYLING - Applicazione stili
      await this._phase4_ApplyStyling($html, actor, data);

      // 5. FASE EVENTI - Binding event listeners
      await this._phase5_BindEvents(app, $html, actor, data);

      // 6. FASE FINALIZZAZIONE - Cleanup e ottimizzazioni
      await this._phase6_Finalize(app, $html, actor, data);

      // Update statistics
      this.statistics.sheetsProcessed++;
      if (actorType === 'character') {
        this.statistics.characterSheets++;
      } else if (actorType === 'npc') {
        this.statistics.npcSheets++;
      }
      this._state.processedSheets.add(actor.id);

      const processTime = moduleLogger.endPerformance(`ui-process-sheet-${actor.id}`);
      moduleLogger.info(`✅ Sheet processata in ${processTime?.toFixed(2)}ms`);

      // Emit event
      moduleLogger.events.emit('ui:sheet-processed', {
        actorId: actor.id,
        actorName: actor.name,
        actorType,
        processTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error(`Errore processing sheet per ${actor.name}`, error);
      this.statistics.errors.push({
        type: 'process-sheet',
        message: error.message,
        actorId: actor.id,
        actorName: actor.name,
        timestamp: Date.now()
      });
      ui.notifications.error(`Errore UI Brancalonia: ${error.message}`);
    }
  }

  /**
   * FASE 1: Preparazione base sheet
   * @static
   * @async
   * @private
   * @param {jQuery|HTMLElement} html - HTML element
   * @param {Actor} actor - Actor document
   * @param {Object} data - Template data
   * @returns {Promise<void>}
   * @fires ui:phase-complete
   */
  static async _phase1_PrepareSheet(html, actor, data) {
    moduleLogger.startPerformance(`ui-phase1-${actor.id}`);
    
    try {
      // Fix jQuery/HTMLElement compatibility - determina tipo prima di usare
      const element = html[0] || html;

      // Aggiungi classi base (compatibile con entrambi jQuery e HTMLElement)
      if (element.classList) {
        element.classList.add('brancalonia-sheet');
        element.classList.add(`brancalonia-${actor.type}`);
      } else if (html.addClass) {
        html.addClass('brancalonia-sheet');
        html.addClass(`brancalonia-${actor.type}`);
      }

      // Rimuovi classi conflittuali
      if (element.classList) {
        element.classList.remove('legacy-sheet');
      }

      // Setup data attributes
      element.dataset.actorId = actor.id;
      element.dataset.brancaloniaVersion = this.VERSION;

      const phaseTime = moduleLogger.endPerformance(`ui-phase1-${actor.id}`);
      this._updatePhaseTimings('phase1', phaseTime);
      
      moduleLogger.debug(`Fase 1 completata in ${phaseTime?.toFixed(2)}ms`);
      
      // Emit event
      moduleLogger.events.emit('ui:phase-complete', {
        phase: 1,
        actorId: actor.id,
        phaseTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore Fase 1 (Preparazione)', error);
      this.statistics.errors.push({
        type: 'phase1-prepare',
        message: error.message,
        actorId: actor.id,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * FASE 2: Modifica struttura (tabs, layout)
   * @static
   * @async
   * @private
   * @param {jQuery|HTMLElement} html - HTML element
   * @param {Actor} actor - Actor document
   * @param {Object} data - Template data
   * @returns {Promise<void>}
   * @fires ui:phase-complete
   * @fires ui:tab-added
   */
  static async _phase2_ModifyStructure(html, actor, data) {
    moduleLogger.startPerformance(`ui-phase2-${actor.id}`);

    try {
      // html is already jQuery wrapped by _processActorSheet

      // Trova navigation tabs prioritizzando la barra principale
      const nav = this._selectPrimaryNavigation(html);

      if (nav && actor.type === 'character') {
        // Aggiungi tabs Brancalonia in ordine corretto
        const tabsToAdd = [
          { id: 'infamia', label: 'Infamia', icon: 'fas fa-skull', priority: 10 },
          { id: 'compagnia', label: 'Compagnia', icon: 'fas fa-users', priority: 20 },
          { id: 'haven', label: 'Rifugio', icon: 'fas fa-home', priority: 30 },
          { id: 'lavori', label: 'Lavori', icon: 'fas fa-coins', priority: 40 },
          { id: 'malefatte', label: 'Malefatte', icon: 'fas fa-balance-scale', priority: 50 },
          { id: 'privilegi', label: 'Privilegi', icon: 'fas fa-crown', priority: 60 }
        ];

        // Ordina per priorità
        tabsToAdd.sort((a, b) => a.priority - b.priority);

        // Aggiungi solo se non esistono già
        tabsToAdd.forEach(tab => {
          if (!nav.find(`[data-tab="${tab.id}"]`).length) {
            const tabHtml = `
              <a class="item" data-tab="${tab.id}" data-tooltip="${tab.label}">
                <i class="${tab.icon}"></i>
                <span class="tab-label">${tab.label}</span>
              </a>
            `;
            nav.append(tabHtml);
            
            // Update statistics
            this.statistics.tabsAdded++;
            
            // Emit event
            moduleLogger.events.emit('ui:tab-added', {
              tabId: tab.id,
              tabLabel: tab.label,
              actorId: actor.id,
              timestamp: Date.now()
            });
            
            moduleLogger.debug(`Tab "${tab.label}" aggiunta`);
          }
        });
      }

      const phaseTime = moduleLogger.endPerformance(`ui-phase2-${actor.id}`);
      this._updatePhaseTimings('phase2', phaseTime);
      
      moduleLogger.debug(`Fase 2 completata in ${phaseTime?.toFixed(2)}ms`);
      
      // Emit event
      moduleLogger.events.emit('ui:phase-complete', {
        phase: 2,
        actorId: actor.id,
        phaseTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore Fase 2 (Struttura)', error);
      this.statistics.errors.push({
        type: 'phase2-structure',
        message: error.message,
        actorId: actor.id,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * FASE 3: Aggiunta contenuti Brancalonia
   * @static
   * @async
   * @private
   * @param {jQuery|HTMLElement} html - HTML element
   * @param {Actor} actor - Actor document
   * @param {Object} data - Template data
   * @returns {Promise<void>}
   * @fires ui:phase-complete
   */
  static async _phase3_AddContent(html, actor, data) {
    moduleLogger.startPerformance(`ui-phase3-${actor.id}`);

    try {
      const sheetBody = html.find('.sheet-body');
      if (!sheetBody.length) {
        moduleLogger.warn('Sheet body non trovato, skip Fase 3');
        return;
      }

      // Contenuti per ogni tab
      const contents = {
        infamia: () => this._createInfamiaContent(actor),
        compagnia: () => this._createCompagniaContent(actor),
        haven: () => this._createHavenContent(actor),
        lavori: () => this._createLavoriContent(actor),
        malefatte: () => this._createMalefatteContent(actor),
        privilegi: () => this._createPrivilegiContent(actor)
      };

      // Aggiungi contenuti solo se non esistono
      for (const [tabId, contentFn] of Object.entries(contents)) {
        if (!sheetBody.find(`.tab[data-tab="${tabId}"]`).length) {
          const content = await contentFn();
          sheetBody.append(`
            <section class="tab" data-tab="${tabId}" data-group="primary">
              ${content}
            </section>
          `);
          
          moduleLogger.debug(`Contenuto tab "${tabId}" aggiunto`);
        }
      }

      // Fix per contenuti esistenti mal posizionati
      this._fixExistingContent(html, actor);

      const phaseTime = moduleLogger.endPerformance(`ui-phase3-${actor.id}`);
      this._updatePhaseTimings('phase3', phaseTime);
      
      moduleLogger.debug(`Fase 3 completata in ${phaseTime?.toFixed(2)}ms`);
      
      // Emit event
      moduleLogger.events.emit('ui:phase-complete', {
        phase: 3,
        actorId: actor.id,
        phaseTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore Fase 3 (Contenuto)', error);
      this.statistics.errors.push({
        type: 'phase3-content',
        message: error.message,
        actorId: actor.id,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * FASE 4: Applicazione styling coordinato
   * @static
   * @async
   * @private
   * @param {jQuery|HTMLElement} html - HTML element
   * @param {Actor} actor - Actor document
   * @param {Object} data - Template data
   * @returns {Promise<void>}
   * @fires ui:phase-complete
   */
  static async _phase4_ApplyStyling(html, actor, data) {
    moduleLogger.startPerformance(`ui-phase4-${actor.id}`);

    try {
      // Rimuovi stili inline problematici
      html.find('[style*="!important"]').each(function() {
        const element = $(this);
        const style = element.attr('style');
        if (style) {
          // Rimuovi solo !important mantenendo gli stili validi
          const cleanStyle = style.replace(/!important/g, '');
          element.attr('style', cleanStyle);
        }
      });

      // Applica tema Brancalonia se attivo
      if (game.settings.get(this.ID, 'enableTheme') !== false) {
        const element = html[0] || html;
        if (element.classList) {
          element.classList.add('theme-brancalonia', 'italian-renaissance');
        } else if (html.addClass) {
          html.addClass('theme-brancalonia');
          html.addClass('italian-renaissance');
        }
      }

      // Fix per altezze e overflow
      this._fixLayoutIssues(html);

      const phaseTime = moduleLogger.endPerformance(`ui-phase4-${actor.id}`);
      this._updatePhaseTimings('phase4', phaseTime);
      
      moduleLogger.debug(`Fase 4 completata in ${phaseTime?.toFixed(2)}ms`);
      
      // Emit event
      moduleLogger.events.emit('ui:phase-complete', {
        phase: 4,
        actorId: actor.id,
        phaseTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore Fase 4 (Styling)', error);
      this.statistics.errors.push({
        type: 'phase4-styling',
        message: error.message,
        actorId: actor.id,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * FASE 5: Binding eventi coordinato
   * @static
   * @async
   * @private
   * @param {jQuery|HTMLElement} html - HTML element
   * @param {Actor} actor - Actor document
   * @param {Object} data - Template data
   * @returns {Promise<void>}
   * @fires ui:phase-complete
   */
  static async _phase5_BindEvents(app, html, actor, data) {
    moduleLogger.startPerformance(`ui-phase5-${actor.id}`);

    try {
      // Rimuovi listener duplicati
      html.off('.brancalonia');

      // Bind eventi con namespace per evitare conflitti
      html.on('click.brancalonia', '[data-action]', (event) => {
        try {
          const action = event.currentTarget.dataset.action;
          this._handleAction(action, actor, event);
        } catch (error) {
          moduleLogger.error(`Errore handling action`, error);
        }
      });

      // Tab switching
      html.on('click.brancalonia', '.tabs .item, .sheet-navigation .item', (event) => {
        try {
          event.preventDefault();
          event.stopPropagation();
          const tab = event.currentTarget.dataset.tab;
          if (tab) {
            this._switchTab(html, tab);
            this._activateNativeTab(app, tab);
          }
        } catch (error) {
          moduleLogger.error(`Errore tab switching`, error);
        }
      });

      const phaseTime = moduleLogger.endPerformance(`ui-phase5-${actor.id}`);
      this._updatePhaseTimings('phase5', phaseTime);
      
      moduleLogger.debug(`Fase 5 completata in ${phaseTime?.toFixed(2)}ms`);
      
      // Emit event
      moduleLogger.events.emit('ui:phase-complete', {
        phase: 5,
        actorId: actor.id,
        phaseTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore Fase 5 (Eventi)', error);
      this.statistics.errors.push({
        type: 'phase5-events',
        message: error.message,
        actorId: actor.id,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * FASE 6: Finalizzazione e cleanup
   * @static
   * @async
   * @private
   * @param {Application} app - Application instance
   * @param {jQuery|HTMLElement} html - HTML element
   * @param {Actor} actor - Actor document
   * @param {Object} data - Template data
   * @returns {Promise<void>}
   * @fires ui:phase-complete
   */
  static async _phase6_Finalize(app, html, actor, data) {
    moduleLogger.startPerformance(`ui-phase6-${actor.id}`);

    try {
      // Rimuovi elementi duplicati
      this._removeDuplicates(html);

      // Fix scroll e overflow
      this._fixScrolling(html);

      // Trigger evento custom per altri moduli
      Hooks.callAll('brancaloniaSheetReady', app, html, data);

      const phaseTime = moduleLogger.endPerformance(`ui-phase6-${actor.id}`);
      this._updatePhaseTimings('phase6', phaseTime);
      
      moduleLogger.debug(`Fase 6 completata in ${phaseTime?.toFixed(2)}ms`);
      
      // Emit event
      moduleLogger.events.emit('ui:phase-complete', {
        phase: 6,
        actorId: actor.id,
        phaseTime,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore Fase 6 (Finalizzazione)', error);
      this.statistics.errors.push({
        type: 'phase6-finalize',
        message: error.message,
        actorId: actor.id,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /* -------------------------------------------- */
  /*  Helper Methods                              */
  /* -------------------------------------------- */

  /**
   * Aggiorna i timing medi delle fasi
   * @static
   * @private
   * @param {string} phase - Nome fase (phase1-6)
   * @param {number} time - Tempo in ms
   * @returns {void}
   */
  static _updatePhaseTimings(phase, time) {
    if (!time) return;
    
    const current = this.statistics.phaseTimings[phase] || 0;
    // Moving average: 80% old + 20% new
    this.statistics.phaseTimings[phase] = current * 0.8 + time * 0.2;
  }

  /**
   * Crea contenuto tab Infamia
   * @static
   * @private
   * @param {Actor} actor - Actor document
   * @returns {string} HTML content
   */
  static async _createInfamiaContent(actor) {
    const infamia = actor.getFlag(this.ID, 'infamia') ?? 0;
    const infamiaMax = Math.max(1, actor.getFlag(this.ID, 'infamiaMax') ?? 10);
    const level = this._getInfamiaLevel(infamia);
    const canEdit = actor.isOwner || game.user.isGM;

    return foundry.applications.handlebars.renderTemplate('modules/brancalonia-bigat/templates/infamia-section.hbs', {
      infamia,
      infamiaMax,
      infamiaPercentage: Math.min(100, (infamia / infamiaMax) * 100),
      infamiaLevel: level.name,
      infamiaClass: this._getInfamiaClass(level.name),
      segments: this._generateInfamiaSegments(infamiaMax, infamia),
      statusMarkup: this._getInfamiaStatusMarkup(level),
      canEdit
    });
  }

  static async _createCompagniaContent(actor) {
    const compagniaData = actor.getFlag(this.ID, 'compagnia');
    const compagnia = compagniaData ? foundry.utils.duplicate(compagniaData) : {};
    const members = compagnia.membri || compagnia.members || [];
    const reputation = Number(compagnia.reputazione ?? 0);

    return foundry.applications.handlebars.renderTemplate('modules/brancalonia-bigat/templates/compagnia-sheet-full.hbs', {
      compagnia,
      members,
      reputationLabel: this._getReputationLabel(reputation),
      canEdit: actor.isOwner || game.user.isGM
    });
  }

  static async _createHavenContent(actor) {
    const rifugioData = actor.getFlag(this.ID, 'rifugio');
    const rifugio = rifugioData ? foundry.utils.duplicate(rifugioData) : {};
    const comfortLevel = Number(rifugio.comfort ?? rifugio.level ?? 1);
    const features = Array.isArray(rifugio.features) ? rifugio.features : [];
    const canEdit = actor.isOwner || game.user.isGM;

    return foundry.applications.handlebars.renderTemplate('modules/brancalonia-bigat/templates/rifugio-section.hbs', {
      rifugio,
      comfortLevels: this._renderComfortLevels(comfortLevel, canEdit),
      comfortBenefits: this._getComfortBenefits(comfortLevel),
      features: this._renderRifugioFeatures(features, canEdit),
      canEdit
    });
  }

  static async _createLavoriContent(actor) {
    const lavoriData = actor.getFlag(this.ID, 'lavoriSporchi');
    const lavori = lavoriData ? foundry.utils.duplicate(lavoriData) : [];
    const canEdit = actor.isOwner || game.user.isGM;

    return foundry.applications.handlebars.renderTemplate('modules/brancalonia-bigat/templates/lavori-section.hbs', {
      lavori,
      completedCount: lavori.filter(l => l.completed).length,
      activeCount: lavori.filter(l => !l.completed).length,
      totalEarnings: this._calculateTotalEarnings(lavori),
      canEdit
    });
  }

  static async _createMalefatteContent(actor) {
    const malefatteData = actor.getFlag(this.ID, 'malefatte');
    const malefatte = malefatteData ? foundry.utils.duplicate(malefatteData) : [];
    const canEdit = actor.isOwner || game.user.isGM;
    const stats = this._summarizeMalefatte(malefatte);

    return foundry.applications.handlebars.renderTemplate('modules/brancalonia-bigat/templates/malefatte-section.hbs', {
      malefatte,
      stats,
      totalBounty: malefatte.reduce((sum, m) => sum + (Number(m.bounty) || 0), 0),
      canEdit
    });
  }

  static _createPrivilegiContent(actor) {
    // Trova il background del personaggio
    const background = actor.items.find(i => i.type === 'background');

    if (!background) {
      return `
        <div class="privilegi-empty">
          <h3>Nessun Background</h3>
          <p>Il personaggio non ha un background selezionato.</p>
          <p><em>Aggiungi un background per sbloccare i privilegi speciali!</em></p>
        </div>
      `;
    }

    // Ottieni i privilegi del background
    const bgName = background.name.toLowerCase().replace(/\s+/g, '_');
    const privileges = this._getBackgroundPrivileges(bgName, background);

    return `
      <div class="privilegi-info">
        <h3>Privilegi di ${background.name}</h3>

        <div class="privilege-header">
          <img src="${background.img || 'icons/svg/mystery-man.svg'}" alt="${background.name}">
          <div class="privilege-description">
            <p>${background.system?.description?.value || 'Nessuna descrizione disponibile.'}</p>
          </div>
        </div>

        <div class="privilege-details">
          <h4>Privilegi Speciali:</h4>
          ${privileges.length > 0 ? `
            <ul class="privilege-list">
              ${privileges.map(p => `
                <li class="privilege-item ${p.active ? 'active' : ''}">
                  <i class="${p.icon}"></i>
                  <div>
                    <strong>${p.name}</strong>
                    <p>${p.description}</p>
                    ${p.bonus ? `<span class="bonus">Bonus: ${p.bonus}</span>` : ''}
                  </div>
                  ${p.toggleable ? `
                    <button data-action="toggle-privilege" data-privilege="${p.id}">
                      ${p.active ? 'Disattiva' : 'Attiva'}
                    </button>
                  ` : ''}
                </li>
              `).join('')}
            </ul>
          ` : '<p>Nessun privilegio speciale per questo background.</p>'}
        </div>

        <div class="privilege-actions">
          <button data-action="refresh-privileges">
            <i class="fas fa-sync"></i> Aggiorna Privilegi
          </button>
          <button data-action="show-privilege-help">
            <i class="fas fa-question-circle"></i> Aiuto
          </button>
        </div>
      </div>
    `;
  }

  static _getBackgroundPrivileges(bgName, background) {
    // Mappatura privilegi per background
    const privilegesMap = {
      ambulante: [
        {
          id: 'storie-strada',
          name: 'Storie della Strada',
          description: '+1 alle Strade che non vanno da nessuna parte',
          icon: 'fas fa-road',
          bonus: '+1 Intrattenere, +1 Storia',
          active: true,
          toggleable: false
        }
      ],
      attaccabrighe: [
        {
          id: 'slot-mossa',
          name: 'Rissaiolo',
          description: 'Slot mossa extra nelle Risse da Taverna',
          icon: 'fas fa-fist-raised',
          bonus: '+1 Slot Mossa',
          active: true,
          toggleable: false
        }
      ],
      azzeccagarbugli: [
        {
          id: 'risolvere-guai',
          name: 'Risolvere Guai',
          description: 'Può annullare Malefatte pagando ducati',
          icon: 'fas fa-scroll',
          bonus: 'Costo: 50 du per Malefatta',
          active: true,
          toggleable: true
        }
      ],
      brado: [
        {
          id: 'dimestichezza-selvatica',
          name: 'Dimestichezza Selvatica',
          description: 'Evita incontri ostili con bestie selvagge',
          icon: 'fas fa-paw',
          bonus: 'Bestie neutrali se non provocate',
          active: true,
          toggleable: false
        }
      ],
      'cacciatore di reliquie': [
        {
          id: 'studioso-reliquie',
          name: 'Studioso di Reliquie',
          description: 'Esperto in storia e religione',
          icon: 'fas fa-cross',
          bonus: '+1 Religione, +1 Storia',
          active: true,
          toggleable: false
        }
      ],
      duro: [
        {
          id: 'faccia-duro',
          name: 'Faccia da Duro',
          description: 'Taglia conta come +1 livello per intimidire',
          icon: 'fas fa-skull-crossbones',
          bonus: '+1 Taglia effettiva',
          active: true,
          toggleable: false
        }
      ]
    };

    return privilegesMap[bgName] || [];
  }

  static _getInfamiaLevel(value) {
    if (value >= 100) return { name: 'Nemico Pubblico', icon: '💀', effects: ['Taglia enorme', 'Kill on sight'] };
    if (value >= 75) return { name: 'Fuorilegge', icon: '⚔️', effects: ['Taglia maggiore', 'Bandito dalle città'] };
    if (value >= 50) return { name: 'Ricercato', icon: '🚨', effects: ['Taglia minore', '-2 Persuasione'] };
    if (value >= 25) return { name: 'Mal Visto', icon: '👁️', effects: ['Guardie sospettose', '-1 Persuasione'] };
    if (value >= 10) return { name: 'Poco Noto', icon: '🕵️', effects: ['Piccoli sconti dai criminali'] };
    return { name: 'Sconosciuto', icon: '🎭', effects: [] };
  }

  static _getInfamiaClass(levelName) {
    const slugify = foundry?.utils?.slugify ?? ((str) => String(str).toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    const slug = slugify(levelName || 'sconosciuto', { replacement: '-' });
    return `infamia-${slug}`;
  }

  static _generateInfamiaSegments(max, current) {
    const cappedMax = Math.max(1, Number(max) || 1);
    const value = Number(current) || 0;
    let segments = '';
    for (let i = 1; i <= cappedMax; i += 1) {
      const filled = i <= value ? 'filled' : '';
      segments += `<div class="segment ${filled}" data-level="${i}"></div>`;
    }
    return segments;
  }

  static _getInfamiaStatusMarkup(level) {
    if (!level) return '';
    const effects = Array.isArray(level.effects) && level.effects.length
      ? level.effects.join(' • ')
      : 'Nessun effetto attivo';
    return `<span class="infamia-status" data-tooltip="${effects}">${level.icon || ''} ${effects}</span>`;
  }

  static _getReputationLabel(value) {
    if (value <= -7) return 'Maledetti';
    if (value <= -4) return 'Malvisti';
    if (value <= -1) return 'Sospetti';
    if (value === 0) return 'Sconosciuti';
    if (value <= 3) return 'Conosciuti';
    if (value <= 6) return 'Rispettati';
    if (value <= 9) return 'Famosi';
    return 'Leggendari';
  }

  static _calculateTotalEarnings(lavori) {
    return (lavori || [])
      .filter(l => l && l.completed)
      .reduce((total, lavoro) => total + (Number(lavoro?.reward) || 0), 0);
  }

  static _summarizeMalefatte(malefatte) {
    const categories = { furto: 0, truffa: 0, rissa: 0, omicidio: 0 };
    for (const entry of malefatte || []) {
      const type = (entry?.type || '').toLowerCase();
      if (categories[type] !== undefined) categories[type] += 1;
    }
    return categories;
  }

  static _renderComfortLevels(currentLevel, canEdit) {
    const levels = [
      { level: 1, name: 'Squallido', icon: '🕸️' },
      { level: 2, name: 'Modesto', icon: '🪑' },
      { level: 3, name: 'Confortevole', icon: '🛋️' },
      { level: 4, name: 'Lussuoso', icon: '👑' },
      { level: 5, name: 'Principesco', icon: '🏰' }
    ];

    return levels.map(l => {
      const checked = l.level === currentLevel ? 'checked' : '';
      const disabled = canEdit ? '' : 'disabled';
      const selected = l.level === currentLevel ? 'selected' : '';
      return `
        <label class="comfort-level ${selected}">
          <input type="radio" name="flags.brancalonia-bigat.rifugio.comfort" value="${l.level}" ${checked} ${disabled} />
          <span class="comfort-icon">${l.icon}</span>
          <span class="comfort-name">${l.name}</span>
        </label>
      `;
    }).join('');
  }

  static _getComfortBenefits(level) {
    const benefits = {
      1: 'Riposo Lungo recupera solo metà dei Dadi Vita',
      2: 'Riposo normale, nessun bonus',
      3: '+1 ai tiri di recupero durante il riposo',
      4: '+2 ai tiri di recupero, riposo breve in 30 minuti',
      5: '+3 ai tiri di recupero, ispirazione gratuita dopo riposo lungo'
    };
    const value = benefits[level] || benefits[1];
    return `<p class="comfort-benefit">${value}</p>`;
  }

  static _renderRifugioFeatures(features, canEdit) {
    const enabled = Array.isArray(features) ? features : [];
    const availableFeatures = [
      { id: 'cantina', name: 'Cantina Segreta', icon: '🍷' },
      { id: 'armeria', name: 'Armeria', icon: '⚔️' },
      { id: 'laboratorio', name: 'Laboratorio', icon: '⚗️' },
      { id: 'biblioteca', name: 'Biblioteca', icon: '📚' },
      { id: 'prigione', name: 'Prigione', icon: '🔒' },
      { id: 'passaggio', name: 'Passaggio Segreto', icon: '🚪' },
      { id: 'torre', name: 'Torre di Guardia', icon: '🗼' },
      { id: 'stalla', name: 'Stalla', icon: '🐴' }
    ];

    const disabled = canEdit ? '' : 'disabled';

    return availableFeatures.map(f => `
      <label class="feature-checkbox ${enabled.includes(f.id) ? 'selected' : ''}">
        <input type="checkbox" name="flags.brancalonia-bigat.rifugio.features" value="${f.id}" ${enabled.includes(f.id) ? 'checked' : ''} ${disabled} />
        <span class="feature-icon">${f.icon}</span>
        <span class="feature-name">${f.name}</span>
      </label>
    `).join('');
  }

  static _handleAction(action, actor, event) {
    switch(action) {
      case 'infamia-add':
        const addValue = parseInt(event.currentTarget.dataset.value) || 1;
        const current = actor.getFlag(this.ID, 'infamia') || 0;
        actor.setFlag(this.ID, 'infamia', current + addValue);
        break;

      case 'infamia-subtract':
        const subValue = parseInt(event.currentTarget.dataset.value) || 1;
        const curr = actor.getFlag(this.ID, 'infamia') || 0;
        actor.setFlag(this.ID, 'infamia', Math.max(0, curr - subValue));
        break;

      // Altri action handlers...
    }
  }

  static _switchTab(html, tabId) {
    // Switch active tab
    html.find('.tabs .item, .sheet-navigation .item').removeClass('active');
    html.find(`.tabs .item[data-tab="${tabId}"]`).addClass('active');
    html.find(`.sheet-navigation .item[data-tab="${tabId}"]`).addClass('active');

    // Switch content
    html.find('.tab').removeClass('active');
    html.find(`.tab[data-tab="${tabId}"]`).addClass('active');
  }

  static _activateNativeTab(app, tabId) {
    if (!app) return;

    try {
      if (Array.isArray(app._tabs)) {
        for (const tab of app._tabs) {
          if (typeof tab?.activate === 'function') {
            tab.activate(tabId, { triggerCallback: true });
          }
        }
      }

      if (app._tabsByName && typeof app._tabsByName === 'object') {
        const groups = Object.values(app._tabsByName);
        for (const group of groups) {
          if (group && typeof group.activate === 'function') {
            group.activate(tabId, { triggerCallback: true });
          }
        }
      }
    } catch (error) {
      moduleLogger.debug?.('Impossibile sincronizzare tab native', error);
    }
  }

  static _fixExistingContent(html, actor) {
    // Fix per contenuti mal posizionati da altri moduli

    // Sposta infamia tracker se in posizione errata
    const infamiaWrong = html.find('.infamia-tracker:not(.tab [data-tab="infamia"] .infamia-tracker)');
    if (infamiaWrong.length) {
      const infamiaTab = html.find('.tab[data-tab="infamia"]');
      if (infamiaTab.length) {
        infamiaWrong.appendTo(infamiaTab);
      }
    }
  }

  static _fixLayoutIssues(html) {
    // Fix altezze
    const sheetBody = html.find('.sheet-body');
    if (sheetBody.length) {
      sheetBody.css({
        'max-height': 'calc(100vh - 200px)',
        'overflow-y': 'auto'
      });
    }

    // Fix tabs container
    const tabs = html.find('.sheet-tabs');
    if (tabs.length) {
      tabs.css({
        'flex-wrap': 'wrap',
        'gap': '0.25rem'
      });
    }
  }

  static _fixScrolling(html) {
    // Assicura che ogni tab abbia scroll indipendente
    html.find('.tab').each(function() {
      $(this).css({
        'overflow-y': 'auto',
        'max-height': '100%'
      });
    });
  }

  static _removeDuplicates(html) {
    // Rimuovi elementi duplicati creati da hook multipli
    const seen = new Set();
    html.find('[data-brancalonia-element]').each(function() {
      const element = $(this);
      const id = element.data('brancalonia-element');
      if (seen.has(id)) {
        element.remove();
      } else {
        seen.add(id);
      }
    });
  }

  /**
   * Setup sistema di priorità per modifiche
   * @static
   * @private
   * @returns {void}
   */
  static _setupPrioritySystem() {
    try {
      // Permetti ai moduli di registrare le loro modifiche con priorità
      window.BrancaloniaUI = {
        register: (moduleId, modifications, priority = 100) => {
          this.registry.hooks.set(moduleId, {
            modifications,
            priority
          });
          
          moduleLogger.debug(`Modulo "${moduleId}" registrato con priorità ${priority}`);
        }
      };

      moduleLogger.debug('Sistema priorità configurato');

    } catch (error) {
      moduleLogger.error('Errore setup sistema priorità', error);
      this.statistics.errors.push({
        type: 'setup-priority-system',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Fix per problemi di compatibilità noti
   * @static
   * @private
   * @returns {void}
   */
  static _applyCompatibilityFixes() {
    try {
      const systemVersion = parseFloat(game.system?.version || '0');

      // SKIP per dnd5e v5.x+ (struttura CONFIG.Actor.sheetClasses cambiata/deprecata)
      if (systemVersion >= 5.0) {
        moduleLogger.info('🎨 Sheet class patching skipped (D&D 5e v5.x)');
        return;
      }

      // Fix per D&D 5e v3.x/v4.x SOLAMENTE
      if (systemVersion >= 3.0 && systemVersion < 5.0) {
        try {
          const sheetClass = CONFIG.Actor.sheetClasses?.character?.['dnd5e.ActorSheet5eCharacter'];
          if (!sheetClass) {
            moduleLogger.warn('⚠️ Sheet class non trovata, skip patch');
            return;
          }

          CONFIG.Actor.sheetClasses.character['dnd5e.ActorSheet5eCharacter'].cls.prototype._renderOuter =
            new Proxy(CONFIG.Actor.sheetClasses.character['dnd5e.ActorSheet5eCharacter'].cls.prototype._renderOuter, {
              apply: async (target, thisArg, args) => {
                const result = await target.apply(thisArg, args);
                // Aggiungi marker per evitare processamento multiplo
                if (result[0]) {
                  result[0].dataset.brancaloniaCompatFixed = 'true';
                }
                return result;
              }
            });
          
          moduleLogger.info('✅ Sheet class patched per D&D 5e v3/v4');

        } catch (error) {
          moduleLogger.error('Errore patching sheet class', error);
          this.statistics.errors.push({
            type: 'sheet-class-patch',
            message: error.message,
            timestamp: Date.now()
          });
        }
      }

    } catch (error) {
      moduleLogger.error('Errore compatibility fixes', error);
      this.statistics.errors.push({
        type: 'compatibility-fixes',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  // =================================================================
  // PUBLIC API
  // =================================================================

  /**
   * Ottiene lo status corrente del coordinatore UI
   * @static
   * @returns {Object} Status completo
   * @example
   * const status = BrancaloniaUICoordinator.getStatus();
   * console.log('Sheets processate:', status.sheetsProcessed);
   */
  static getStatus() {
    return {
      version: this.VERSION,
      initialized: this._state.initialized,
      carolingianActive: this._state.carolingianActive,
      sheetsProcessed: this.statistics.sheetsProcessed,
      characterSheets: this.statistics.characterSheets,
      npcSheets: this.statistics.npcSheets,
      tabsAdded: this.statistics.tabsAdded,
      privilegesLoaded: this.statistics.privilegesLoaded,
      carolingianIntegrations: this.statistics.carolingianIntegrations,
      processedSheetsCount: this._state.processedSheets.size,
      errors: this.statistics.errors.length
    };
  }

  /**
   * Ottiene le statistiche complete del coordinatore UI
   * @static
   * @returns {UICoordinatorStatistics} Statistiche complete
   * @example
   * const stats = BrancaloniaUICoordinator.getStatistics();
   * console.log('Tempo medio Fase 1:', stats.phaseTimings.phase1);
   */
  static getStatistics() {
    return {
      ...this.statistics,
      processedSheetsIds: Array.from(this._state.processedSheets),
      uptime: this.statistics.initTime ? Date.now() - this.statistics.initTime : 0
    };
  }

  /**
   * Ottiene lista sheets processate
   * @static
   * @returns {Array<string>} Array di actor IDs
   * @example
   * const sheets = BrancaloniaUICoordinator.getProcessedSheets();
   * console.log(`${sheets.length} sheets processate`);
   */
  static getProcessedSheets() {
    return Array.from(this._state.processedSheets);
  }

  /**
   * Forza re-processing di una specifica actor sheet
   * @static
   * @async
   * @param {string} actorId - ID dell'actor
   * @returns {Promise<boolean>} True se re-processing avvenuto con successo
   * @example
   * await BrancaloniaUICoordinator.forceReprocess('actor-id-123');
   */
  static async forceReprocess(actorId) {
    try {
      moduleLogger.info(`Forza re-processing per actor: ${actorId}`);

      const actor = game.actors.get(actorId);
      if (!actor) {
        moduleLogger.warn(`Actor ${actorId} non trovato`);
        return false;
      }

      // Rimuovi dalla lista processed
      this._state.processedSheets.delete(actorId);

      // Trova la sheet aperta
      const sheet = actor.sheet;
      if (!sheet || !sheet.rendered) {
        moduleLogger.warn(`Sheet per actor ${actorId} non aperta/renderizzata`);
        return false;
      }

      // Re-render sheet
      await sheet.render(true);

      moduleLogger.info(`✅ Re-processing completato per ${actor.name}`);
      return true;

    } catch (error) {
      moduleLogger.error(`Errore re-processing actor ${actorId}`, error);
      this.statistics.errors.push({
        type: 'force-reprocess',
        message: error.message,
        actorId,
        timestamp: Date.now()
      });
      return false;
    }
  }

  /**
   * Resetta le statistiche del coordinatore
   * @static
   * @returns {void}
   * @example
   * BrancaloniaUICoordinator.resetStatistics();
   */
  static resetStatistics() {
    moduleLogger.info('Reset statistiche UI Coordinator');

    const initTime = this.statistics.initTime;
    const carolingianDetected = this.statistics.carolingianDetected;

    this.statistics = {
      initTime,
      sheetsProcessed: 0,
      characterSheets: 0,
      npcSheets: 0,
      tabsAdded: 0,
      privilegesLoaded: 0,
      carolingianDetected,
      carolingianIntegrations: 0,
      phaseTimings: {
        phase1: 0,
        phase2: 0,
        phase3: 0,
        phase4: 0,
        phase5: 0,
        phase6: 0
      },
      errors: []
    };

    this._state.processedSheets.clear();

    moduleLogger.info('Statistiche resettate');
  }

  /**
   * Mostra un report completo dello stato del coordinatore nella console
   * @static
   * @returns {Object} Status e statistiche (per uso programmatico)
   * @example
   * BrancaloniaUICoordinator.showReport();
   */
  static showReport() {
    const stats = this.getStatistics();
    const status = this.getStatus();

    moduleLogger.group('🎨 Brancalonia UI Coordinator - Report');

    moduleLogger.info('VERSION:', this.VERSION);
    moduleLogger.info('Initialized:', status.initialized);
    moduleLogger.info('Carolingian Active:', status.carolingianActive);

    moduleLogger.group('📊 Statistics');
    moduleLogger.table([
      { Metric: 'Init Time', Value: `${stats.initTime?.toFixed(2)}ms` },
      { Metric: 'Sheets Processed', Value: stats.sheetsProcessed },
      { Metric: 'Character Sheets', Value: stats.characterSheets },
      { Metric: 'NPC Sheets', Value: stats.npcSheets },
      { Metric: 'Tabs Added', Value: stats.tabsAdded },
      { Metric: 'Privileges Loaded', Value: stats.privilegesLoaded },
      { Metric: 'Carolingian Integrations', Value: stats.carolingianIntegrations },
      { Metric: 'Errors', Value: stats.errors.length },
      { Metric: 'Uptime', Value: `${(stats.uptime / 1000).toFixed(0)}s` }
    ]);
    moduleLogger.groupEnd();

    moduleLogger.group('⚙️ Phase Timings (avg ms)');
    moduleLogger.table([
      { Phase: 'Phase 1 (Prepare)', Time: `${stats.phaseTimings.phase1.toFixed(2)}ms` },
      { Phase: 'Phase 2 (Structure)', Time: `${stats.phaseTimings.phase2.toFixed(2)}ms` },
      { Phase: 'Phase 3 (Content)', Time: `${stats.phaseTimings.phase3.toFixed(2)}ms` },
      { Phase: 'Phase 4 (Styling)', Time: `${stats.phaseTimings.phase4.toFixed(2)}ms` },
      { Phase: 'Phase 5 (Events)', Time: `${stats.phaseTimings.phase5.toFixed(2)}ms` },
      { Phase: 'Phase 6 (Finalize)', Time: `${stats.phaseTimings.phase6.toFixed(2)}ms` }
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

// Inizializzazione - DEVE eseguire in init per essere disponibile agli altri moduli
Hooks.once('init', () => {
  BrancaloniaUICoordinator.initialize();
});

// Export globale
window.BrancaloniaUICoordinator = BrancaloniaUICoordinator;
