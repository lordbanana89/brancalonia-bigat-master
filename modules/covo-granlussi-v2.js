/**
 * @fileoverview Brancalonia Covo & Granlussi System V2
 * 
 * Sistema completo per la gestione dei Covi (Rifugi) e dei loro Granlussi.
 * Include sistema di migrazione integrato dal vecchio sistema v1.
 * 
 * @version 2.0.0
 * @author Brancalonia Module Team
 * @requires brancalonia-logger.js
 */

import { createModuleLogger } from './brancalonia-logger.js';

const MODULE_LABEL = 'Covo System';
const moduleLogger = createModuleLogger(MODULE_LABEL);
/**
 * @typedef {Object} CovoStatistics
 * @property {number} initTime - Tempo inizializzazione (ms)
 * @property {number} coviCreated - Covi creati
 * @property {number} granlussiBuilt - Granlussi costruiti
 * @property {number} granlussiUpgraded - Granlussi potenziati
 * @property {number} scenesCreated - Scene create
 * @property {number} journalsCreated - Journal creati
 * @property {number} treasuryTransactions - Transazioni tesoro
 * @property {number} migrationsCompleted - Migrazioni completate
 * @property {number} migrationsVerified - Migrazioni verificate
 * @property {Array<{type: string, message: string, timestamp: number}>} errors - Lista errori
 */

/**
 * Brancalonia Covo & Granlussi System V2
 * 
 * Sistema nativo Foundry VTT per la gestione dei Covi (Rifugi) con:
 * - Actor nativi per i Covi
 * - Item embedded per i Granlussi
 * - Active Effects per bonus automatici
 * - Scene integration
 * - Journal entries per lore
 * - Sistema migrazione v1→v2 integrato
 * 
 * @class BrancaloniaCovoV2
 */
class BrancaloniaCovoV2 {
  static VERSION = '2.0.0';
  static MODULE_NAME = MODULE_LABEL;
  static ID = 'brancalonia-bigat';
  static FLAGS = {
    COVO: 'covo',
    GRANLUSSO: 'granlusso',
    CONSTRUCTION: 'construction'
  };

  static TEMPLATES = {
    COVO_SHEET: 'modules/brancalonia-bigat/templates/covo-sheet.hbs',
    GRANLUSSO_CARD: 'modules/brancalonia-bigat/templates/granlusso-card.hbs'
  };

  /**
   * @type {CovoStatistics}
   */
  static statistics = {
    initTime: 0,
    coviCreated: 0,
    granlussiBuilt: 0,
    granlussiUpgraded: 0,
    scenesCreated: 0,
    journalsCreated: 0,
    treasuryTransactions: 0,
    migrationsCompleted: 0,
    migrationsVerified: 0,
    errors: []
  };

  /**
   * @private
   * @type {{initialized: boolean}}
   */
  static _state = {
    initialized: false
  };

  /**
   * Inizializza il sistema Covo
   * @static
   * @returns {void}
   * @fires covo:initialized
   */
  static initialize() {
    moduleLogger.startPerformance('covo-init');
    moduleLogger.info(`Inizializzazione Covo System v${this.VERSION}...`);

    this.registerSettings();
    this.registerActorTypes();
    this.registerItemTypes();
    this.registerSheets();
    this.registerHooks();
    this.registerHandlebarsHelpers();

    // Registra API globale
    game.brancalonia = game.brancalonia || {};
    game.brancalonia.covo = this;

    this._state.initialized = true;

    const initTime = moduleLogger.endPerformance('covo-init');
    this.statistics.initTime = initTime;

    moduleLogger.info(`✅ Covo System inizializzato in ${initTime?.toFixed(2)}ms`);

    // Emit event
    moduleLogger.events.emit('covo:initialized', {
      version: this.VERSION,
      initTime,
      timestamp: Date.now()
    });
  }

  /**
   * Registra impostazioni
   */
  static registerSettings() {
    game.settings.register(this.ID, 'covoSystemEnabled', {
      name: 'Sistema Covo V2',
      hint: 'Abilita il sistema avanzato del Covo con Actor/Item nativi',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
      requiresReload: true
    });

    game.settings.register(this.ID, 'constructionTimeEnabled', {
      name: 'Tempi di Costruzione',
      hint: 'I granlussi richiedono tempo per essere costruiti',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(this.ID, 'autoCreateCovoScene', {
      name: 'Crea Scena Covo Automatica',
      hint: 'Crea automaticamente una scena per il covo quando creato',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
  }

  /**
   * Registra tipi di Actor custom
   */
  static registerActorTypes() {
    CONFIG.Actor.documentClass = class extends CONFIG.Actor.documentClass {
      get isCovo() {
        return this.getFlag(BrancaloniaCovoV2.ID, BrancaloniaCovoV2.FLAGS.COVO);
      }
    };
  }

  /**
   * Registra tipi di Item custom
   */
  static registerItemTypes() {
    const BaseItem = CONFIG.Item.documentClass;
    CONFIG.Item.documentClass = class extends BaseItem {
      get isGranlusso() {
        return this.getFlag(BrancaloniaCovoV2.ID, BrancaloniaCovoV2.FLAGS.GRANLUSSO);
      }

      get constructionProgress() {
        return this.getFlag(BrancaloniaCovoV2.ID, BrancaloniaCovoV2.FLAGS.CONSTRUCTION) || {
          started: null,
          daysRequired: 0,
          daysCompleted: 0,
          completed: false
        };
      }

      static migrateData(source) {
        try {
          const properties = source?.system?.properties;
          if (properties && !Array.isArray(properties)) {
            const entries = Object.entries(properties)
              .filter(([, value]) => value)
              .map(([key]) => key);
            source.system.properties = entries;
          }
          if (source?.system && !source.system.properties) {
            source.system.properties = [];
          }
        } catch (error) {
          moduleLogger.error('Errore migrazione proprietà item', error, source);
          this.statistics.errors.push({
            type: 'item-migration',
            message: error.message,
            timestamp: Date.now()
          });
          if (source?.system) {
            source.system.properties = [];
          }
        }

        return super.migrateData(source);
      }
    };
  }

  /**
   * Registra sheet custom per il Covo
   */
  static registerSheets() {
    const ActorSheetClass = foundry.appv1.sheets.ActorSheet;
    class CovoSheet extends ActorSheetClass {
      static get defaultOptions() {
        return foundry.utils.foundry.utils.mergeObject(super.defaultOptions, {
          classes: ['brancalonia', 'sheet', 'covo'],
          template: BrancaloniaCovoV2.TEMPLATES.COVO_SHEET,
          width: 720,
          height: 680,
          tabs: [{
            navSelector: '.tabs',
            contentSelector: '.content',
            initial: 'overview'
          }],
          dragDrop: [{ dragSelector: '.item', dropSelector: null }]
        });
      }

      get template() {
        // Se il template non esiste, usa fallback
        if (!game.modules.get(BrancaloniaCovoV2.ID)?.active) {
          return 'systems/dnd5e/templates/actors/npc-sheet.hbs';
        }
        return BrancaloniaCovoV2.TEMPLATES.COVO_SHEET;
      }

      async getData(options = {}) {
        const context = await super.getData(options);

        // Aggiungi dati specifici del covo
        context.granlussi = this.actor.items.filter(i => i.isGranlusso);
        context.treasury = this.actor.system.currency?.gp || 0;
        context.reputation = this.actor.getFlag(BrancaloniaCovoV2.ID, 'reputation') || 0;
        context.members = this._getCompagniaMembers();
        context.constructionQueue = this._getConstructionQueue();

        // Calcola statistiche
        context.stats = {
          totalGranlussi: context.granlussi.length,
          activeGranlussi: context.granlussi.filter(g => g.system.level?.value > 0).length,
          totalInvestment: this._calculateTotalInvestment(context.granlussi)
        };

        return context;
      }

      _getCompagniaMembers() {
        // Trova tutti i PG che appartengono a questa compagnia
        return game.actors.filter(a =>
          a.type === 'character' &&
          a.getFlag(BrancaloniaCovoV2.ID, 'covoId') === this.actor.id
        );
      }

      _getConstructionQueue() {
        return this.actor.items
          .filter(i => i.isGranlusso && !i.constructionProgress.completed)
          .map(i => ({
            name: i.name,
            progress: i.constructionProgress,
            percentComplete: Math.round((i.constructionProgress.daysCompleted / i.constructionProgress.daysRequired) * 100)
          }));
      }

      _calculateTotalInvestment(granlussi) {
        return granlussi.reduce((total, g) => {
          const level = g.system.level?.value || 0;
          let cost = 0;
          for (let i = 1; i <= level; i++) {
            cost += i === 1 ? 100 : 50;
          }
          return total + cost;
        }, 0);
      }

      activateListeners(html) {
        super.activateListeners(html);

        // Upgrade granlusso
        html.find('.upgrade-granlusso').click(this._onUpgradeGranlusso.bind(this));

        // Gestisci tesoro
        html.find('.manage-treasury').click(this._onManageTreasury.bind(this));

        // Visualizza membri
        html.find('.view-members').click(this._onViewMembers.bind(this));

        // Apri scena covo
        html.find('.open-covo-scene').click(this._onOpenCovoScene.bind(this));
      }

      async _onUpgradeGranlusso(event) {
        event.preventDefault();
        const itemId = event.currentTarget.dataset.itemId;
        const item = this.actor.items.get(itemId);

        if (!item) return;

        await BrancaloniaCovoV2.upgradeGranlusso(this.actor, item);
      }

      async _onManageTreasury(event) {
        event.preventDefault();
        BrancaloniaCovoV2.openTreasuryDialog(this.actor);
      }

      async _onViewMembers(event) {
        event.preventDefault();
        BrancaloniaCovoV2.showCompagniaMembers(this.actor);
      }

      async _onOpenCovoScene(event) {
        event.preventDefault();
        const scene = game?.scenes?.find(s =>
          s.getFlag(BrancaloniaCovoV2.ID, 'covoId') === this.actor.id
        );

        if (scene) {
          scene.view();
        } else {
          ui.notifications.warn('Nessuna scena covo trovata');
        }
      }
    }

    // Registra la sheet
    foundry.documents.collections.Actors.registerSheet(BrancaloniaCovoV2.ID, CovoSheet, {
      types: ['npc'],
      makeDefault: false,
      label: 'Brancalonia Covo Sheet'
    });
  }

  /**
   * Registra Handlebars helpers
   */
  static registerHandlebarsHelpers() {
    Handlebars.registerHelper('granlussoIcon', (type) => {
      const icons = {
        'borsa-nera': 'fa-sack-dollar',
        cantina: 'fa-wine-bottle',
        distilleria: 'fa-flask',
        fucina: 'fa-hammer',
        scuderie: 'fa-horse'
      };
      return icons[type] || 'fa-home';
    });

    Handlebars.registerHelper('granlussoColor', (level) => {
      const colors = ['#6c757d', '#28a745', '#ffc107', '#fd7e14'];
      return colors[level] || colors[0];
    });
  }

  /**
   * Registra hooks
   */
  static registerHooks() {
    // Creazione nuovo covo
    Hooks.on('createActor', this._onCreateActor.bind(this));

    // Aggiornamento granlusso
    Hooks.on('updateItem', this._onUpdateItem.bind(this));

    // Riposo lungo - applica benefici cantina
    Hooks.on('dnd5e.restCompleted', this._onRestCompleted.bind(this));

    // Inizio giornata - check costruzioni
    Hooks.on('simple-calendar.dateChanged', this._onDateChanged.bind(this));

    // Render chat message
    Hooks.on('renderChatMessageHTML', this._onRenderChatMessage.bind(this));
  }

  static async _onCreateActor(actor, options, userId) {
    if (userId !== game.user.id) return;

    // Se è un covo appena creato
    if (actor.getFlag(this.ID, this.FLAGS.COVO)) {
      await this.initializeCovo(actor);
    }
  }

  static async _onUpdateItem(item, changes, options, userId) {
    if (!item.isGranlusso) return;

    // Check se costruzione completata
    const construction = item.constructionProgress;
    if (construction.daysCompleted >= construction.daysRequired && !construction.completed) {
      await this.completeConstruction(item);
    }
  }

  static async _onRestCompleted(actor, config) {
    if (config.longRest) {
      const covo = this.getActorCovo(actor);
      if (covo) {
        await this.applyRestBenefits(actor, covo);
      }
    }
  }

  static async _onDateChanged(data) {
    if (!game.user.isGM) return;

    // Avanza tutte le costruzioni in corso
    const covos = game.actors.filter(a => a.isCovo);
    for (const covo of covos) {
      await this.advanceConstructions(covo);
    }
  }

  static _onRenderChatMessage(app, html, data) {
    // In Foundry v13, html può essere HTMLElement o jQuery
    const $html = html instanceof jQuery ? html : $(html);

    // Aggiungi bottoni interattivi ai messaggi del covo
    $html.find('.covo-action').click(async (event) => {
      const action = event.currentTarget.dataset.action;
      const actorId = event.currentTarget.dataset.actorId;
      const actor = game.actors.get(actorId);

      if (!actor) return;

      switch (action) {
        case 'view-covo':
          actor.sheet.render(true);
          break;
        case 'collect-potion':
          await this.collectDistilleryPotion(actor);
          break;
        case 'repair-item':
          await this.openRepairDialog(actor);
          break;
      }
    });
  }

  /**
   * Crea un nuovo Covo
   */
  static async createCovo(name, members = []) {
    // Crea l'actor Covo
    const covoData = {
      name: name || 'Covo della Compagnia',
      type: 'npc',
      img: 'icons/environment/settlement/house-cottage.webp',
      system: {
        details: {
          biography: {
            value: 'Il rifugio segreto della nostra banda di malfattori.'
          },
          type: {
            value: 'Covo',
            custom: 'Covo'
          }
        },
        currency: {
          gp: 0
        },
        attributes: {
          hp: {
            value: 100,
            max: 100
          }
        }
      },
      flags: {
        [this.ID]: {
          [this.FLAGS.COVO]: true,
          reputation: 0,
          founded: new Date().toISOString()
        }
      }
    };

    const covo = await Actor.create(covoData);

    // Crea i 5 granlussi base (livello 0)
    await this.createBaseGranlussi(covo);

    // Associa i membri
    for (const member of members) {
      await member.setFlag(this.ID, 'covoId', covo.id);
    }

    // Crea scena se abilitato
    if (game.settings.get(this.ID, 'autoCreateCovoScene')) {
      await this.createCovoScene(covo);
    }

    // Crea journal entry
    await this.createCovoJournal(covo);

    // Messaggio di benvenuto
    ChatMessage.create({
      content: `
        <div class="brancalonia-covo-created">
          <h2>🏠 Nuovo Covo Fondato!</h2>
          <p><strong>${covo.name}</strong> è ora il rifugio della compagnia.</p>
          <p>Membri fondatori: ${members.map(m => m.name).join(', ')}</p>
          <button class="covo-action" data-action="view-covo" data-actor-id="${covo.id}">
            Apri Gestione Covo
          </button>
        </div>
      `,
      speaker: { alias: 'Sistema Covo' }
    });

    return covo;
  }

  /**
   * Crea i granlussi base per un nuovo covo
   */
  static async createBaseGranlussi(covo) {
    const granlussi = [
      {
        name: 'Borsa Nera',
        type: 'feat',
        img: 'icons/containers/bags/pouch-simple-leather-brown.webp',
        system: {
          description: {
            value: 'Rete di contatti per commercio di oggetti magici e materiali rari.'
          },
          type: {
            value: 'feat',
            subtype: 'granlusso'
          },
          activation: {
            type: 'special',
            cost: null
          },
          level: {
            value: 0,
            max: 3
          }
        },
        flags: {
          [this.ID]: {
            [this.FLAGS.GRANLUSSO]: true,
            type: 'borsa-nera',
            benefits: {
              1: { cost: 100, description: 'Oggetti magici comuni (50 mo)' },
              2: { cost: 50, description: 'Oggetti non comuni (150 mo)' },
              3: { cost: 50, description: 'Oggetti rari su richiesta' }
            }
          }
        }
      },
      {
        name: 'Cantina',
        type: 'feat',
        img: 'icons/environment/settlement/cellar.webp',
        system: {
          description: {
            value: 'Luogo fresco per conservare cibo e bevande, migliora il riposo.'
          },
          type: {
            value: 'feat',
            subtype: 'granlusso'
          },
          activation: {
            type: 'special',
            cost: null
          },
          level: {
            value: 0,
            max: 3
          }
        },
        flags: {
          [this.ID]: {
            [this.FLAGS.GRANLUSSO]: true,
            type: 'cantina',
            benefits: {
              1: { cost: 100, description: 'Recuperi tutti i DV nel riposo lungo' },
              2: { cost: 50, description: '-1 indebolimento extra' },
              3: { cost: 50, description: '+1 punto ispirazione' }
            }
          }
        }
      },
      {
        name: 'Distilleria',
        type: 'feat',
        img: 'icons/tools/laboratory/alembic-copper-blue.webp',
        system: {
          description: {
            value: 'Alambicchi per distillare intrugli alchemici e bevande.'
          },
          type: {
            value: 'feat',
            subtype: 'granlusso'
          },
          activation: {
            type: 'special',
            cost: null
          },
          level: {
            value: 0,
            max: 3
          }
        },
        flags: {
          [this.ID]: {
            [this.FLAGS.GRANLUSSO]: true,
            type: 'distilleria',
            benefits: {
              1: { cost: 100, description: 'Acquamorte o Richiamino gratis' },
              2: { cost: 50, description: 'Afrore o Infernet gratis' },
              3: { cost: 50, description: 'Cordiale o Intruglio Forza gratis' }
            }
          }
        }
      },
      {
        name: 'Fucina',
        type: 'feat',
        img: 'icons/tools/smithing/anvil.webp',
        system: {
          description: {
            value: 'Forge per riparare e migliorare equipaggiamento.'
          },
          type: {
            value: 'feat',
            subtype: 'granlusso'
          },
          activation: {
            type: 'special',
            cost: null
          },
          level: {
            value: 0,
            max: 3
          }
        },
        flags: {
          [this.ID]: {
            [this.FLAGS.GRANLUSSO]: true,
            type: 'fucina',
            benefits: {
              1: { cost: 100, description: 'Ripara oggetti metallici' },
              2: { cost: 50, description: 'Sblocca lucchetti non magici' },
              3: { cost: 50, description: 'Equipaggiamento non scadente' }
            }
          }
        }
      },
      {
        name: 'Scuderie',
        type: 'feat',
        img: 'icons/environment/settlement/stable.webp',
        system: {
          description: {
            value: 'Stalle per cavalcature e veicoli.'
          },
          type: {
            value: 'feat',
            subtype: 'granlusso'
          },
          activation: {
            type: 'special',
            cost: null
          },
          level: {
            value: 0,
            max: 3
          }
        },
        flags: {
          [this.ID]: {
            [this.FLAGS.GRANLUSSO]: true,
            type: 'scuderie',
            benefits: {
              1: { cost: 100, description: 'Pony, asini, muli in prestito' },
              2: { cost: 50, description: 'Cavalli e carri in prestito' },
              3: { cost: 50, description: 'Tutto non scadente' }
            }
          }
        }
      }
    ];

    await covo.createEmbeddedDocuments('Item', granlussi);
  }

  /**
   * Migliora un granlusso
   */
  static async upgradeGranlusso(covo, granlusso) {
    const currentLevel = granlusso.system.level?.value || 0;

    if (currentLevel >= 3) {
      ui.notifications.warn('Granlusso già al livello massimo!');
      return;
    }

    const nextLevel = currentLevel + 1;
    const benefits = granlusso.getFlag(this.ID, 'benefits');
    const cost = benefits[nextLevel].cost;

    // Verifica fondi
    const treasury = covo.system.currency?.gp || 0;
    if (treasury < cost) {
      ui.notifications.error(`Fondi insufficienti! Servono ${cost} mo`);
      return;
    }

    // Dialog conferma
    const confirmed = await foundry.appv1.sheets.Dialog.confirm({
      title: 'Conferma Upgrade',
      content: `
        <p>Vuoi migliorare <strong>${granlusso.name}</strong> al livello ${nextLevel}?</p>
        <p><strong>Costo:</strong> ${cost} mo</p>
        <p><strong>Beneficio:</strong> ${benefits[nextLevel].description}</p>
        ${game.settings.get(this.ID, 'constructionTimeEnabled') ?
    `<p><strong>Tempo:</strong> ${nextLevel * 7} giorni</p>` : ''}
      `
    });

    if (!confirmed) return;

    // Sottrai fondi
    await covo.update({
      'system.currency.gp': treasury - cost
    });

    // Se tempi costruzione abilitati
    if (game.settings.get(this.ID, 'constructionTimeEnabled')) {
      await granlusso.setFlag(this.ID, this.FLAGS.CONSTRUCTION, {
        started: game.time.worldTime || Date.now(),
        daysRequired: nextLevel * 7,
        daysCompleted: 0,
        completed: false,
        targetLevel: nextLevel
      });

      ChatMessage.create({
        content: `
          <div class="brancalonia-construction-started">
            <h3>🔨 Costruzione Iniziata</h3>
            <p><strong>${granlusso.name}</strong> - Livello ${nextLevel}</p>
            <p>Tempo richiesto: ${nextLevel * 7} giorni</p>
            <div class="construction-bar" style="width: 100%; height: 20px; background: #ddd; border-radius: 10px;">
              <div style="width: 0%; height: 100%; background: #28a745; border-radius: 10px;"></div>
            </div>
          </div>
        `
      });
    } else {
      // Upgrade immediato
      await granlusso.update({
        'system.level.value': nextLevel
      });

      // Applica Active Effect se appropriato
      await this.applyGranlussoEffects(covo, granlusso, nextLevel);

      ChatMessage.create({
        content: `
          <div class="brancalonia-upgrade-complete">
            <h3>✨ ${granlusso.name} Migliorato!</h3>
            <p>Ora al livello ${nextLevel}</p>
            <p><em>${benefits[nextLevel].description}</em></p>
          </div>
        `
      });
    }
  }

  /**
   * Applica Active Effects basati sul granlusso
   */
  static async applyGranlussoEffects(covo, granlusso, level) {
    const type = granlusso.getFlag(this.ID, 'type');

    // Rimuovi effetti precedenti
    const existingEffects = covo.effects.filter(e =>
      e.getFlag(this.ID, 'granlussoType') === type
    );
    await covo.deleteEmbeddedDocuments('ActiveEffect', existingEffects.map(e => e.id));

    // Crea nuovi effetti basati sul tipo e livello
    const effectsData = [];

    switch (type) {
      case 'cantina':
        if (level >= 1) {
          effectsData.push({
            label: 'Cantina - Recupero DV Completo',
            icon: 'icons/svg/tankard.svg',
            changes: [{
              key: 'flags.dnd5e.longRestHDRecovery',
              mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
              value: 'all'
            }],
            transfer: true,
            flags: {
              [this.ID]: {
                granlussoType: 'cantina',
                level: 1
              }
            }
          });
        }
        if (level >= 2) {
          effectsData.push({
            label: 'Cantina - Recupero Indebolimento',
            icon: 'icons/svg/tankard.svg',
            changes: [{
              key: 'flags.dnd5e.longRestExhaustionRecovery',
              mode: CONST.ACTIVE_EFFECT_MODES.ADD,
              value: 1
            }],
            transfer: true,
            flags: {
              [this.ID]: {
                granlussoType: 'cantina',
                level: 2
              }
            }
          });
        }
        break;

      case 'fucina':
        if (level >= 3) {
          effectsData.push({
            label: 'Fucina - Equipaggiamento Superiore',
            icon: 'icons/tools/smithing/anvil.webp',
            changes: [{
              key: 'system.bonuses.mwak.attack',
              mode: CONST.ACTIVE_EFFECT_MODES.ADD,
              value: 1
            }],
            transfer: true,
            duration: {
              seconds: 86400 // 1 giorno
            },
            flags: {
              [this.ID]: {
                granlussoType: 'fucina',
                level: 3
              }
            }
          });
        }
        break;
    }

    if (effectsData.length > 0) {
      await covo.createEmbeddedDocuments('ActiveEffect', effectsData);
    }
  }

  /**
   * Crea scena per il covo
   */
  static async createCovoScene(covo) {
    const sceneData = {
      name: `Covo - ${covo.name}`,
      img: 'maps/covo-base.webp', // Placeholder - sostituire con vera mappa
      width: 3200,
      height: 2400,
      padding: 0.25,
      initial: false,
      navigation: true,
      navOrder: 100,
      flags: {
        [this.ID]: {
          covoId: covo.id,
          isCovoScene: true
        }
      }
    };

    const scene = await Scene.create(sceneData);

    // Crea tokens per i granlussi come "edifici"
    const tokens = [];
    const granlussi = covo.items.filter(i => i.isGranlusso);

    granlussi.forEach((g, index) => {
      tokens.push({
        name: g.name,
        img: g.img,
        x: 400 + (index * 600),
        y: 1200,
        width: 2,
        height: 2,
        disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
        displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
        actorId: covo.id,
        flags: {
          [this.ID]: {
            granlussoId: g.id
          }
        }
      });
    });

    await scene.createEmbeddedDocuments('Token', tokens);

    return scene;
  }

  /**
   * Crea Journal Entry per il covo
   */
  static async createCovoJournal(covo) {
    const journalData = {
      name: `📖 Registro di ${covo.name}`,
      flags: {
        [this.ID]: {
          covoId: covo.id
        }
      }
    };

    const journal = await JournalEntry.create(journalData);

    // Crea pagine per ogni aspetto del covo
    const pages = [
      {
        name: '📜 Storia del Covo',
        type: 'text',
        text: {
          format: 'html',
          content: `
            <h2>Fondazione</h2>
            <p>Il covo è stato fondato il ${new Date().toLocaleDateString()}.</p>
            <h2>Membri Fondatori</h2>
            <ul>
              ${game.actors.filter(a => a.getFlag(this.ID, 'covoId') === covo.id)
    .map(m => `<li>${m.name}</li>`).join('')}
            </ul>
          `
        }
      },
      {
        name: '💰 Registro Finanziario',
        type: 'text',
        text: {
          format: 'html',
          content: `
            <h2>Transazioni</h2>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrizione</th>
                  <th>Entrata</th>
                  <th>Uscita</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${new Date().toLocaleDateString()}</td>
                  <td>Fondazione</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                </tr>
              </tbody>
            </table>
          `
        }
      },
      {
        name: '🔨 Progetti di Costruzione',
        type: 'text',
        text: {
          format: 'html',
          content: `
            <h2>Granlussi</h2>
            <p>Nessun progetto in corso.</p>
          `
        }
      }
    ];

    await journal.createEmbeddedDocuments('JournalEntryPage', pages);

    return journal;
  }

  /**
   * Ottiene il covo di un actor
   */
  static getActorCovo(actor) {
    const covoId = actor.getFlag(this.ID, 'covoId');
    return game.actors.get(covoId);
  }

  /**
   * Applica benefici del riposo dal covo
   */
  static async applyRestBenefits(actor, covo) {
    const cantina = covo.items.find(i =>
      i.isGranlusso &&
      i.getFlag(this.ID, 'type') === 'cantina'
    );

    if (!cantina) return;

    const level = cantina.system.level?.value || 0;
    const benefits = [];

    if (level >= 1) {
      // Recupera tutti i DV
      const hdMax = actor.system.attributes.hd.max;
      await actor.update({
        'system.attributes.hd.value': hdMax
      });
      benefits.push('Recuperati tutti i Dadi Vita');
    }

    if (level >= 2) {
      // Rimuovi indebolimento extra
      const exhaustion = actor.system.attributes.exhaustion || 0;
      if (exhaustion > 0) {
        await actor.update({
          'system.attributes.exhaustion': Math.max(0, exhaustion - 2)
        });
        benefits.push('Rimossi 2 livelli di indebolimento');
      }
    }

    if (level >= 3) {
      // Dai ispirazione
      await actor.update({
        'system.attributes.inspiration': true
      });
      benefits.push('Ottenuta ispirazione');
    }

    if (benefits.length > 0) {
      ChatMessage.create({
        content: `
          <div class="brancalonia-rest-benefits">
            <h3>🍷 Benefici della Cantina</h3>
            <p>${actor.name} beneficia del riposo nel covo:</p>
            <ul>
              ${benefits.map(b => `<li>${b}</li>`).join('')}
            </ul>
          </div>
        `,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }

  /**
   * Avanza costruzioni in corso
   */
  static async advanceConstructions(covo) {
    const constructions = covo.items.filter(i => {
      const c = i.constructionProgress;
      return c && !c.completed && c.started;
    });

    for (const item of constructions) {
      const construction = item.constructionProgress;
      const newProgress = Math.min(
        construction.daysCompleted + 1,
        construction.daysRequired
      );

      await item.setFlag(this.ID, this.FLAGS.CONSTRUCTION, {
        ...construction,
        daysCompleted: newProgress
      });

      // Notifica progresso
      const percent = Math.round((newProgress / construction.daysRequired) * 100);

      if (percent === 100) {
        await this.completeConstruction(item);
      } else if (percent % 25 === 0) {
        // Notifica ogni 25%
        ChatMessage.create({
          content: `
            <div class="brancalonia-construction-progress">
              <h3>🔨 Progresso Costruzione</h3>
              <p><strong>${item.name}</strong> - ${percent}% completato</p>
              <div class="construction-bar" style="width: 100%; height: 20px; background: #ddd; border-radius: 10px;">
                <div style="width: ${percent}%; height: 100%; background: #ffc107; border-radius: 10px;"></div>
              </div>
            </div>
          `
        });
      }
    }
  }

  /**
   * Completa costruzione
   */
  static async completeConstruction(item) {
    const construction = item.constructionProgress;
    const targetLevel = construction.targetLevel;

    // Aggiorna livello
    await item.update({
      'system.level.value': targetLevel
    });

    // Marca come completato
    await item.setFlag(this.ID, this.FLAGS.CONSTRUCTION, {
      ...construction,
      completed: true,
      completedDate: new Date().toISOString()
    });

    // Applica effetti
    const covo = item.parent;
    await this.applyGranlussoEffects(covo, item, targetLevel);

    // Notifica completamento
    ChatMessage.create({
      content: `
        <div class="brancalonia-construction-complete">
          <h2>🎉 Costruzione Completata!</h2>
          <p><strong>${item.name}</strong> è ora al livello ${targetLevel}!</p>
          <p><em>${item.getFlag(this.ID, 'benefits')[targetLevel].description}</em></p>
          <button class="covo-action" data-action="view-covo" data-actor-id="${covo.id}">
            Visualizza Covo
          </button>
        </div>
      `,
      speaker: { alias: 'Sistema Covo' }
    });

    // Aggiorna journal
    await this.updateCovoJournal(covo, {
      type: 'construction',
      granlusso: item.name,
      level: targetLevel
    });
  }

  /**
   * Aggiorna journal del covo
   */
  static async updateCovoJournal(covo, event) {
    const journal = game?.journal?.find(j =>
      j.getFlag(this.ID, 'covoId') === covo.id
    );

    if (!journal) return;

    // Trova o crea la pagina appropriata
    let page;
    switch (event.type) {
      case 'construction':
        page = journal.pages.find(p => p.name.includes('Progetti'));
        if (page) {
          const currentContent = page.text.content;
          const newEntry = `
            <tr>
              <td>${new Date().toLocaleDateString()}</td>
              <td>${event.granlusso} completato - Livello ${event.level}</td>
            </tr>
          `;
          await page.update({
            'text.content': currentContent.replace('</tbody>', `${newEntry}</tbody>`)
          });
        }
        break;
    }
  }

  /**
   * Mostra membri della compagnia
   */
  static showCompagniaMembers(covo) {
    const members = game.actors.filter(a =>
      a.getFlag(this.ID, 'covoId') === covo.id
    );

    const content = `
      <div class="brancalonia-members">
        <h2>Membri della Compagnia</h2>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Classe</th>
              <th>Livello</th>
              <th>Ruolo</th>
            </tr>
          </thead>
          <tbody>
            ${members.map(m => `
              <tr>
                <td>${m.name}</td>
                <td>${m.system.details.class || 'N/A'}</td>
                <td>${m.system.details.level || 0}</td>
                <td>${m.getFlag(this.ID, 'compagniaRole') || 'Membro'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    new foundry.appv1.sheets.Dialog({
      title: 'Membri della Compagnia',
      content,
      buttons: {
        close: { label: 'Chiudi' }
      }
    }, {
      width: 500
    }).render(true);
  }

  /**
   * Dialog gestione tesoro
   */
  static openTreasuryDialog(covo) {
    const treasury = covo.system.currency?.gp || 0;

    const content = `
      <div class="brancalonia-treasury">
        <p>Tesoro attuale: <strong>${treasury} mo</strong></p>
        <hr>
        <div class="form-group">
          <label>Operazione:</label>
          <select name="operation">
            <option value="deposit">Deposita</option>
            <option value="withdraw">Preleva</option>
          </select>
        </div>
        <div class="form-group">
          <label>Importo:</label>
          <input type="number" name="amount" min="0" value="0">
        </div>
        <div class="form-group">
          <label>Descrizione:</label>
          <input type="text" name="description" placeholder="Motivo della transazione">
        </div>
      </div>
    `;

    new foundry.appv1.sheets.Dialog({
      title: 'Gestione Tesoro',
      content,
      buttons: {
        confirm: {
          label: 'Conferma',
          callback: async (html) => {
            const operation = html.find('[name="operation"]').val();
            const amount = parseInt(html.find('[name="amount"]').val()) || 0;
            const description = html.find('[name="description"]').val();

            if (amount <= 0) return;

            const newAmount = operation === 'deposit' ?
              treasury + amount :
              Math.max(0, treasury - amount);

            await covo.update({
              'system.currency.gp': newAmount
            });

            ChatMessage.create({
              content: `
                <div class="brancalonia-transaction">
                  <h3>💰 Transazione Tesoro</h3>
                  <p><strong>${operation === 'deposit' ? 'Deposito' : 'Prelievo'}:</strong> ${amount} mo</p>
                  <p><strong>Motivo:</strong> ${description || 'Non specificato'}</p>
                  <p><strong>Nuovo saldo:</strong> ${newAmount} mo</p>
                </div>
              `
            });
          }
        },
        cancel: { label: 'Annulla' }
      }
    }).render(true);
  }

  // =================================================================
  // MIGRATION SYSTEM (v1 → v2)
  // Sistema di migrazione integrato dal vecchio sistema
  // =================================================================

  /**
   * Migration tools per convertire dati dal vecchio sistema v1
   * Integrato da covo-migration.js
   */
  static Migration = class {
    /**
     * Migra tutti i covi dal vecchio sistema
     * @static
     * @async
     * @returns {Promise<void>}
     */
    static async migrateAll() {
      if (!game.user.isGM) {
        ui.notifications.error('Solo il GM può eseguire la migrazione!');
        return;
      }

      moduleLogger.startPerformance('covo-migration');
      moduleLogger.info('🔄 Inizio migrazione sistema Covo...');

      try {
        // Trova tutti gli attori con dati del vecchio covo
        const actorsWithOldCovo = game.actors.filter(a =>
          a.getFlag('brancalonia-bigat', 'covo') &&
          !a.getFlag('brancalonia-bigat', 'covoMigrated')
        );

        if (actorsWithOldCovo.length === 0) {
          ui.notifications.info('Nessun covo da migrare trovato.');
          return;
        }

        const confirmed = await foundry.appv1.sheets.Dialog.confirm({
          title: 'Migrazione Sistema Covo',
          content: `
            <div style="padding: 15px;">
              <h3>🔄 Migrazione al nuovo sistema Covo</h3>
              <p>Trovati <strong>${actorsWithOldCovo.length}</strong> personaggi con dati del vecchio sistema.</p>
              <p style="color: #E65100; margin: 15px 0;">
                <strong>⚠️ IMPORTANTE:</strong> Questa operazione:
              </p>
              <ul style="margin: 10px 0;">
                <li>Creerà nuovi Actor di tipo Covo</li>
                <li>Migrerà tutti i granlussi e progressi</li>
                <li>Manterrà il tesoro e le associazioni</li>
                <li>È irreversibile una volta completata</li>
              </ul>
              <p style="margin-top: 15px;">
                <strong>Vuoi procedere con la migrazione?</strong>
              </p>
            </div>
          `,
          yes: () => true,
          no: () => false
        });

        if (!confirmed) {
          ui.notifications.info('Migrazione annullata.');
          return;
        }

        // Fixed: Progress dialog migrated to DialogV2
        const progressDialog = new foundry.applications.api.DialogV2({
          window: {
            title: 'Migrazione in corso...'
          },
          content: `
            <div style="padding: 20px; text-align: center;">
              <h3>🔄 Migrazione in corso...</h3>
              <div class="migration-progress" style="margin: 20px 0;">
                <div class="progress-bar" style="width: 100%; height: 30px; background: #E0E0E0; border-radius: 15px; overflow: hidden;">
                  <div class="progress-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%); transition: width 0.3s;"></div>
                </div>
                <p class="progress-text" style="margin-top: 10px;">Preparazione...</p>
              </div>
              <p style="color: #666; font-size: 0.9em;">Non chiudere questa finestra!</p>
            </div>
          `,
          buttons: [],
          close: () => false,
          rejectClose: true
        }, {
          classes: ['migration-progress-dialog'],
          width: 400
        });

        progressDialog.render(true);

        // Raggruppa per covo condiviso
        const covoGroups = this._groupActorsByCovo(actorsWithOldCovo);
        let migrated = 0;
        const total = Object.keys(covoGroups).length;

        for (const [groupKey, actors] of Object.entries(covoGroups)) {
          // Aggiorna progress
          const percent = Math.round((migrated / total) * 100);
          const progressBar = progressDialog.element.find('.progress-fill');
          const progressText = progressDialog.element.find('.progress-text');

          progressBar.css('width', `${percent}%`);
          progressText.text(`Migrazione covo ${migrated + 1}/${total}...`);

          // Migra questo gruppo
          await this._migrateCovoGroup(actors, groupKey);
          migrated++;

          // Piccolo delay per UI
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Chiudi progress dialog
        progressDialog.close();

        // Report finale
        const report = await this._generateMigrationReport(total);

        new foundry.appv1.sheets.Dialog({
          title: '✅ Migrazione Completata',
          content: report,
          buttons: {
            ok: {
              icon: '<i class="fas fa-check"></i>',
              label: 'OK'
            }
          }
        }, {
          width: 500
        }).render(true);

        const migrationTime = moduleLogger.endPerformance('covo-migration');
        moduleLogger.info(`✅ Migrazione sistema Covo completata in ${migrationTime?.toFixed(2)}ms!`);
        
        BrancaloniaCovoV2.statistics.migrationsCompleted++;
        
      } catch (error) {
        moduleLogger.error('Errore durante la migrazione', error);
        BrancaloniaCovoV2.statistics.errors.push({
          type: 'migration-failed',
          message: error.message,
          timestamp: Date.now()
        });
        ui.notifications.error(`Errore durante la migrazione: ${error.message}`);
      }
    }

    /**
     * Raggruppa attori per covo condiviso
     * @private
     */
    static _groupActorsByCovo(actors) {
      const groups = {};

      actors.forEach(actor => {
        const covoData = actor.getFlag('brancalonia-bigat', 'covo');

        // Se ha flag di covo condiviso, usa quello come chiave
        const sharedCovoId = actor.getFlag('brancalonia-bigat', 'sharedCovoId');
        const groupKey = sharedCovoId || actor.id;

        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(actor);
      });

      return groups;
    }

    /**
     * Migra un gruppo di attori che condividono lo stesso covo
     * @private
     */
    static async _migrateCovoGroup(actors, groupKey) {
      // Prendi i dati del covo dal primo attore
      const leadActor = actors[0];
      const oldCovoData = leadActor.getFlag('brancalonia-bigat', 'covo') || {};

      // Determina il nome del covo
      const covoName = oldCovoData.name || `Covo di ${leadActor.name}`;

      // Crea il nuovo Actor Covo
      const newCovo = await this._createNewCovoActor(covoName, oldCovoData, actors);

      // Associa tutti gli attori al nuovo covo
      for (const actor of actors) {
        await actor.setFlag('brancalonia-bigat', 'covoId', newCovo.id);
        await actor.setFlag('brancalonia-bigat', 'covoMigrated', true);

        // Rimuovi vecchi flag se richiesto
        if (game.settings.get('brancalonia-bigat', 'removeOldCovoData')) {
          await actor.unsetFlag('brancalonia-bigat', 'covo');
          await actor.unsetFlag('brancalonia-bigat', 'sharedCovoId');
        }
      }

      // Crea scena e journal se abilitato
      if (game.settings.get('brancalonia-bigat', 'autoCreateCovoScene')) {
        await BrancaloniaCovoV2.createCovoScene(newCovo);
      }
      if (BrancaloniaCovoV2.createCovoJournal) {
        await BrancaloniaCovoV2.createCovoJournal(newCovo);
      }

      // Log migrazione
      moduleLogger.info(`✅ Migrato covo: ${covoName} con ${actors.length} membri`);

      return newCovo;
    }

    /**
     * Crea nuovo Actor Covo dai vecchi dati
     * @private
     */
    static async _createNewCovoActor(name, oldData, members) {
      // Prepara dati base del covo
      const covoData = {
        name,
        type: 'npc',
        img: oldData.img || 'icons/environment/settlement/house-cottage.webp',
        system: {
          details: {
            biography: {
              value: oldData.description || 'Covo migrato dal vecchio sistema.'
            },
            type: {
              value: 'Covo',
              custom: 'Covo'
            }
          },
          currency: {
            gp: oldData.treasury || 0
          },
          attributes: {
            hp: {
              value: 100,
              max: 100
            }
          }
        },
        flags: {
          'brancalonia-bigat': {
            covo: true,
            reputation: oldData.reputation || 0,
            founded: oldData.createdDate || new Date().toISOString(),
            migratedFrom: 'v1',
            originalData: oldData // Mantieni backup dei dati originali
          }
        }
      };

      // Crea l'actor
      const covo = await Actor.create(covoData);

      // Migra i granlussi
      await this._migrateGranlussi(covo, oldData);

      // Migra transazioni se presenti
      if (oldData.transactions) {
        await covo.setFlag('brancalonia-bigat', 'transactions', oldData.transactions);
      }

      return covo;
    }

    /**
     * Migra i granlussi al nuovo formato
     * @private
     */
    static async _migrateGranlussi(covo, oldData) {
      const granlussiData = [];

      // Mappa vecchi nomi ai nuovi
      const granlussiMap = {
        borsaNera: {
          name: 'Borsa Nera',
          type: 'borsa-nera',
          img: 'icons/containers/bags/pouch-simple-leather-brown.webp'
        },
        cantina: {
          name: 'Cantina',
          type: 'cantina',
          img: 'icons/environment/settlement/cellar.webp'
        },
        distilleria: {
          name: 'Distilleria',
          type: 'distilleria',
          img: 'icons/tools/laboratory/alembic-copper-blue.webp'
        },
        fucina: {
          name: 'Fucina',
          type: 'fucina',
          img: 'icons/tools/smithing/anvil.webp'
        },
        scuderie: {
          name: 'Scuderie',
          type: 'scuderie',
          img: 'icons/environment/settlement/stable.webp'
        }
      };

      // Benefits per livello (dal manuale)
      const benefitsMap = {
        'borsa-nera': {
          1: { cost: 100, description: 'Oggetti magici comuni (50 mo)' },
          2: { cost: 50, description: 'Oggetti non comuni (150 mo)' },
          3: { cost: 50, description: 'Oggetti rari su richiesta' }
        },
        cantina: {
          1: { cost: 100, description: 'Recuperi tutti i DV nel riposo lungo' },
          2: { cost: 50, description: '-1 indebolimento extra' },
          3: { cost: 50, description: '+1 punto ispirazione' }
        },
        distilleria: {
          1: { cost: 100, description: 'Acquamorte o Richiamino gratis' },
          2: { cost: 50, description: 'Afrore o Infernet gratis' },
          3: { cost: 50, description: 'Cordiale o Intruglio Forza gratis' }
        },
        fucina: {
          1: { cost: 100, description: 'Ripara oggetti metallici' },
          2: { cost: 50, description: 'Sblocca lucchetti non magici' },
          3: { cost: 50, description: 'Equipaggiamento non scadente' }
        },
        scuderie: {
          1: { cost: 100, description: 'Pony, asini, muli in prestito' },
          2: { cost: 50, description: 'Cavalli e carri in prestito' },
          3: { cost: 50, description: 'Tutto non scadente' }
        }
      };

      // Crea item per ogni granlusso
      for (const [oldKey, info] of Object.entries(granlussiMap)) {
        const level = oldData[oldKey] || 0;

        const itemData = {
          name: info.name,
          type: 'feat',
          img: info.img,
          system: {
            description: {
              value: this._getGranlussoDescription(info.type)
            },
            type: {
              value: 'feat',
              subtype: 'granlusso'
            },
            activation: {
              type: 'special',
              cost: null
            },
            level: {
              value: level,
              max: 3
            }
          },
          flags: {
            'brancalonia-bigat': {
              granlusso: true,
              type: info.type,
              benefits: benefitsMap[info.type],
              migratedLevel: level
            }
          }
        };

        granlussiData.push(itemData);
      }

      // Crea tutti i granlussi
      await covo.createEmbeddedDocuments('Item', granlussiData);
    }

    /**
     * Ottiene la descrizione del granlusso
     * @private
     */
    static _getGranlussoDescription(type) {
      const descriptions = {
        'borsa-nera': 'Rete di contatti per commercio di oggetti magici e materiali rari.',
        cantina: 'Luogo fresco per conservare cibo e bevande, migliora il riposo.',
        distilleria: 'Alambicchi per distillare intrugli alchemici e bevande.',
        fucina: 'Forge per riparare e migliorare equipaggiamento.',
        scuderie: 'Stalle per cavalcature e veicoli.'
      };

      return descriptions[type] || 'Granlusso del covo.';
    }

    /**
     * Genera report di migrazione
     * @private
     */
    static async _generateMigrationReport(totalCovos) {
      const newCovos = game.actors.filter(a =>
        a.getFlag('brancalonia-bigat', 'covo') &&
        a.getFlag('brancalonia-bigat', 'migratedFrom') === 'v1'
      );

      const migratedActors = game.actors.filter(a =>
        a.getFlag('brancalonia-bigat', 'covoMigrated')
      );

      let report = `
        <div style="padding: 20px;">
          <h3 style="color: #4CAF50; margin-bottom: 15px;">✅ Migrazione Completata con Successo!</h3>

          <div style="background: rgba(76, 175, 80, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4>📊 Riepilogo:</h4>
            <ul style="margin: 10px 0;">
              <li><strong>${totalCovos}</strong> covi migrati</li>
              <li><strong>${migratedActors.length}</strong> personaggi aggiornati</li>
              <li><strong>${newCovos.length}</strong> nuovi Actor Covo creati</li>
            </ul>
          </div>

          <div style="margin-bottom: 20px;">
            <h4>📝 Covi Creati:</h4>
            <ul style="margin: 10px 0;">
      `;

      newCovos.forEach(covo => {
        const members = game.actors.filter(a =>
          a.getFlag('brancalonia-bigat', 'covoId') === covo.id
        );
        report += `
          <li>
            <strong>${covo.name}</strong> - ${members.length} membri
          </li>
        `;
      });

      report += `
            </ul>
          </div>

          <div style="background: #FFF3CD; padding: 10px; border-radius: 8px; border: 1px solid #FFC107;">
            <p style="margin: 0;">
              <strong>💡 Prossimi passi:</strong><br>
              • Verifica che tutti i granlussi siano migrati correttamente<br>
              • Controlla le associazioni dei membri<br>
              • Personalizza le descrizioni e immagini dei covi<br>
              • Considera di rimuovere i vecchi dati dopo verifica
            </p>
          </div>
        </div>
      `;

      return report;
    }

    /**
     * Pulisce i vecchi dati dopo migrazione
     * @static
     * @async
     * @returns {Promise<void>}
     */
    static async cleanupOldData() {
      const confirmed = await foundry.appv1.sheets.Dialog.confirm({
        title: 'Pulizia Dati Vecchi',
        content: `
          <p><strong>⚠️ ATTENZIONE:</strong></p>
          <p>Questa operazione rimuoverà permanentemente tutti i vecchi flag del sistema covo v1.</p>
          <p>Assicurati di aver verificato che la migrazione sia andata a buon fine!</p>
          <p><strong>Vuoi procedere?</strong></p>
        `
      });

      if (!confirmed) return;

      const actors = game.actors.filter(a =>
        a.getFlag('brancalonia-bigat', 'covoMigrated')
      );

      let cleaned = 0;
      for (const actor of actors) {
        await actor.unsetFlag('brancalonia-bigat', 'covo');
        await actor.unsetFlag('brancalonia-bigat', 'sharedCovoId');
        await actor.unsetFlag('brancalonia-bigat', 'covoMigrated');
        cleaned++;
      }

      ui.notifications.info(`Rimossi vecchi dati da ${cleaned} attori.`);
      moduleLogger.info(`🧹 Rimossi vecchi dati da ${cleaned} attori`);
    }

    /**
     * Verifica integrità dopo migrazione
     * @static
     * @async
     * @returns {Promise<Object>} Report di verifica
     */
    static async verifyMigration() {
      const report = {
        success: [],
        warnings: [],
        errors: []
      };

      // Verifica tutti i covi migrati
      const migratedCovos = game.actors.filter(a =>
        a.getFlag('brancalonia-bigat', 'covo') &&
        a.getFlag('brancalonia-bigat', 'migratedFrom') === 'v1'
      );

      for (const covo of migratedCovos) {
        // Verifica granlussi
        const granlussi = covo.items.filter(i =>
          i.getFlag('brancalonia-bigat', 'granlusso')
        );

        if (granlussi.length !== 5) {
          report.warnings.push(`${covo.name}: Solo ${granlussi.length}/5 granlussi trovati`);
        }

        // Verifica membri
        const members = game.actors.filter(a =>
          a.getFlag('brancalonia-bigat', 'covoId') === covo.id
        );

        if (members.length === 0) {
          report.warnings.push(`${covo.name}: Nessun membro associato`);
        }

        report.success.push(`${covo.name}: Migrato correttamente con ${members.length} membri`);
      }

      // Mostra report
      const content = `
        <div style="padding: 15px; max-height: 400px; overflow-y: auto;">
          <h3>📋 Verifica Migrazione</h3>

          ${report.success.length > 0 ? `
            <div style="margin-bottom: 15px;">
              <h4 style="color: #4CAF50;">✅ Successi (${report.success.length})</h4>
              <ul>${report.success.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
          ` : ''}

          ${report.warnings.length > 0 ? `
            <div style="margin-bottom: 15px;">
              <h4 style="color: #FF9800;">⚠️ Avvisi (${report.warnings.length})</h4>
              <ul>${report.warnings.map(w => `<li>${w}</li>`).join('')}</ul>
            </div>
          ` : ''}

          ${report.errors.length > 0 ? `
            <div style="margin-bottom: 15px;">
              <h4 style="color: #F44336;">❌ Errori (${report.errors.length})</h4>
              <ul>${report.errors.map(e => `<li>${e}</li>`).join('')}</ul>
            </div>
          ` : ''}

          ${report.success.length === migratedCovos.length && report.errors.length === 0 ?
            '<p style="color: #4CAF50; font-weight: bold;">✅ Tutte le migrazioni sono state verificate con successo!</p>' :
            '<p style="color: #FF9800;">Controlla gli avvisi sopra e correggi manualmente se necessario.</p>'
          }
        </div>
      `;

      new foundry.appv1.sheets.Dialog({
        title: 'Verifica Migrazione',
        content,
        buttons: {
          ok: { label: 'OK' }
        }
      }, {
        width: 500
      }).render(true);

      moduleLogger.info('✅ Verifica migrazione completata', report);
      BrancaloniaCovoV2.statistics.migrationsVerified++;
      return report;
    }
  };

  /**
   * Applica benefici del Covo durante riposo
   * Integrazione con rest-system per bonus riposo in base ai Granlussi presenti
   * 
   * @static
   * @param {Actor} actor - Attore che riposa
   * @param {string} restType - Tipo riposo ('short' o 'long')
   * @returns {Object|null} Benefici riposo o null se nessun Covo
   * 
   * @example
   * const benefits = BrancaloniaCovoV2.applyRestBenefits(actor, 'long');
   * if (benefits) {
   *   console.log(`Dadi vita extra: ${benefits.extraHitDice}`);
   * }
   */
  static applyRestBenefits(actor, restType) {
    try {
      moduleLogger.startPerformance('covo-rest-benefits');

      // Trova il Covo dell'attore tramite compagnia
      const compagniaId = actor.getFlag('brancalonia-bigat', 'compagniaId');
      if (!compagniaId) {
        moduleLogger.debug?.(`Actor ${actor.name} non ha una compagnia`);
        return null;
      }

      const compagnia = game.actors.get(compagniaId);
      if (!compagnia) {
        moduleLogger.warn(`Compagnia ${compagniaId} non trovata per ${actor.name}`);
        return null;
      }

      const covoId = compagnia.getFlag('brancalonia-bigat', 'covoId');
      if (!covoId) {
        moduleLogger.debug?.(`Compagnia ${compagnia.name} non ha un Covo`);
        return null;
      }

      const covo = game.actors.get(covoId);
      if (!covo) {
        moduleLogger.warn(`Covo ${covoId} non trovato`);
        return null;
      }

      // Verifica che sia un Covo v2
      if (!covo.getFlag('brancalonia-bigat', 'isCovo')) {
        moduleLogger.warn(`Actor ${covo.name} non è un Covo valido`);
        return null;
      }

      const benefits = {
        extraHitDice: 0,
        extraHealing: 0,
        removeExhaustion: false
      };

      // Recupera i Granlussi del Covo (Items embedded)
      const granlussi = covo.items.filter(item =>
        item.getFlag('brancalonia-bigat', 'isGranlusso')
      );

      // Applica benefici in base ai Granlussi presenti
      granlussi.forEach(granlusso => {
        const type = granlusso.getFlag('brancalonia-bigat', 'granlussType');

        switch (type) {
          case 'cantina':
            // Cantina: Riposo migliorato
            benefits.extraHitDice += 1;
            benefits.extraHealing += 2;
            if (restType === 'long') {
              benefits.removeExhaustion = true;
            }
            moduleLogger.debug?.(`Benefici Cantina applicati: +1 HD, +2 HP, remove exhaustion`);
            break;

          case 'distilleria':
            // Distilleria: Bonus guarigione alchemica
            benefits.extraHealing += 1;
            moduleLogger.debug?.(`Benefici Distilleria applicati: +1 HP`);
            break;

          case 'fucina':
            // Fucina: Non dà benefici di riposo diretti
            moduleLogger.debug?.(`Fucina presente ma nessun beneficio riposo diretto`);
            break;

          case 'borsa_nera':
            // Borsa Nera: Non dà benefici di riposo diretti
            moduleLogger.debug?.(`Borsa Nera presente ma nessun beneficio riposo diretto`);
            break;

          case 'scuderie':
            // Scuderie: Non dà benefici di riposo diretti
            moduleLogger.debug?.(`Scuderie presenti ma nessun beneficio riposo diretto`);
            break;

          default:
            moduleLogger.debug?.(`Granlusso sconosciuto: ${type}`);
        }
      });

      const perfTime = moduleLogger.endPerformance('covo-rest-benefits');

      // Se ci sono benefici, logga e return
      if (benefits.extraHitDice > 0 || benefits.extraHealing > 0 || benefits.removeExhaustion) {
        moduleLogger.info(
          this.MODULE_NAME,
          `Benefici riposo Covo applicati per ${actor.name}: HD+${benefits.extraHitDice}, HP+${benefits.extraHealing}, removeExhaustion=${benefits.removeExhaustion} (${perfTime?.toFixed(2)}ms)`
        );

        // Emit event
        moduleLogger.events.emit('covo:rest-benefits-applied', {
          actor: actor.name,
          covo: covo.name,
          benefits,
          restType,
          timestamp: Date.now()
        });

        return benefits;
      }

      moduleLogger.debug?.(`Nessun beneficio riposo per ${actor.name} dal Covo ${covo.name}`);
      return null;

    } catch (error) {
      this.statistics.errors.push({
        type: 'applyRestBenefits',
        message: error.message,
        timestamp: Date.now()
      });
      moduleLogger.error('Errore applicazione benefici riposo', error);
      return null;
    }
  }
}

// NOTA: L'inizializzazione è gestita da BrancaloniaCore
// Ma settings devono essere registrati durante 'init'
Hooks.once('init', () => {
  BrancaloniaCovoV2.initialize();
});

Hooks.once('ready', () => {
  // Migrazione da vecchio sistema se necessario
  if (game.user.isGM) {
    // Registra API globale per migration
    game.brancalonia = game.brancalonia || {};
    game.brancalonia.migration = {
      migrateAll: () => BrancaloniaCovoV2.Migration.migrateAll(),
      cleanup: () => BrancaloniaCovoV2.Migration.cleanupOldData(),
      verify: () => BrancaloniaCovoV2.Migration.verifyMigration()
    };

    // Settings per migrazione (se non già registrate)
    if (!game.settings.settings.has('brancalonia-bigat.removeOldCovoData')) {
      game.settings.register('brancalonia-bigat', 'removeOldCovoData', {
        name: 'Rimuovi Dati Vecchi dopo Migrazione',
        hint: 'Rimuove automaticamente i vecchi flag dopo una migrazione riuscita',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
      });
    }

    if (game.settings.get(BrancaloniaCovoV2.ID, 'covoSystemEnabled')) {
      moduleLogger.info('✅ Sistema Covo V2 pronto');
      moduleLogger.info('🔄 Sistema migrazione covo pronto. Usa game.brancalonia.migration.migrateAll() per iniziare.');

      // Controlla se ci sono covi vecchi da migrare
      const oldCovos = game.actors.filter(a =>
        a.getFlag('brancalonia-bigat', 'covo') &&
        !a.getFlag('brancalonia-bigat', 'covoMigrated')
      );

      if (oldCovos.length > 0) {
        foundry.appv1.sheets.Dialog.confirm({
          title: 'Migrazione Sistema Covo',
          content: `<p>Trovati ${oldCovos.length} covi dal vecchio sistema. Vuoi migrarli al nuovo sistema?</p>`,
          yes: () => BrancaloniaCovoV2.Migration.migrateAll(),
          no: () => moduleLogger.info('Migrazione covi annullata')  
        });
      }
    }
  }
});

// Esporta per compatibilità e scoperta da parte di BrancaloniaCore
window.BrancaloniaCovoV2 = BrancaloniaCovoV2;
window.CovoGranlussiV2 = BrancaloniaCovoV2; // For module loader
window['covo-granlussi-v2'] = BrancaloniaCovoV2; // For module loader