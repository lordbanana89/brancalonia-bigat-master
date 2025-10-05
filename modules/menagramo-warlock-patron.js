/**
 * Sistema Menagramo di Brancalonia
 * Gestisce il patrono Warlock della sfortuna e maledizioni
 * 
 * @module BrancaloniaMenagramo
 * @version 2.0.0
 * @author Brancalonia BIGAT Team
 */

import { createModuleLogger } from './brancalonia-logger.js';

const MODULE_LABEL = 'Menagramo Warlock Patron';
const moduleLogger = createModuleLogger(MODULE_LABEL);

class BrancaloniaMenagramo {
  static ID = 'brancalonia-bigat';
  static VERSION = '2.0.0';
  static MODULE_NAME = MODULE_LABEL;
  static MODULE_ID = 'menagramo-warlock-patron';

  // Statistics tracking (enterprise-grade)
  static statistics = {
    patronsCreated: 0,
    cursesApplied: 0,
    cursesByType: {},
    iatturaUsed: 0,
    iatturaSuccesses: 0,
    iatturaFailures: 0,
    spellsGranted: 0,
    dialogsShown: 0,
    errors: []
  };

  // Internal state management
  static _state = {
    initialized: false,
    hooksRegistered: false
  };

  /**
   * Inizializzazione completa del modulo
   * @static
   * @throws {Error} Se l'inizializzazione fallisce
   * 
   * @example
   * BrancaloniaMenagramo.initialize();
   */
  static initialize() {
    try {
      moduleLogger.startPerformance('menagramo-patron-init');
      moduleLogger.info('🔮 Inizializzazione Sistema Menagramo Warlock Patron');

      // Registra settings
      this.registerSettings();

      // Registra hooks
      this.registerHooks();

      // Registra comandi chat
      this.registerChatCommands();

      // Registra istanza globale
      game.brancalonia = game.brancalonia || {};
      game.brancalonia.modules = game.brancalonia.modules || {};
      game.brancalonia.modules['menagramo-warlock-patron'] = this;
      game.brancalonia.menagramo = this;

      // Estende Actor class
      this.extendActorClass();

      // Setup maledizioni
      this.setupMaledizioni();

      this._state.initialized = true;
      const perfTime = moduleLogger.endPerformance('menagramo-patron-init');
      moduleLogger.info(`✅ Sistema Menagramo Warlock Patron inizializzato con successo (${perfTime?.toFixed(2)}ms)`);
      
      // Event emitter
      moduleLogger.events.emit('menagramo-patron:initialized', {
        version: this.VERSION,
        timestamp: Date.now()
      });
    } catch (error) {
      this.statistics.errors.push({ 
        type: 'initialize', 
        message: error.message, 
        timestamp: Date.now() 
      });
      moduleLogger.error('❌ Errore inizializzazione Menagramo Warlock Patron', error);
      ui.notifications.error('Errore durante l\'inizializzazione del sistema Menagramo');
    }
  }

  /**
   * Registra le impostazioni del modulo
   */
  static registerSettings() {
    // Abilita effetti Menagramo
    game.settings.register(this.ID, 'enableMenagramo', {
      name: 'Abilita Sistema Menagramo',
      hint: 'Attiva le capacità del patrono Menagramo per i Warlock',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    // Difficoltà Iattura
    game.settings.register(this.ID, 'iatturaBaseDC', {
      name: 'CD Base Iattura',
      hint: 'Difficoltà base per resistere alla Iattura del Menagramo',
      scope: 'world',
      config: true,
      type: Number,
      default: 8,
      range: { min: 5, max: 15, step: 1 }
    });

    // Durata maledizioni
    game.settings.register(this.ID, 'curseDurationMultiplier', {
      name: 'Moltiplicatore Durata Maledizioni',
      hint: 'Modifica la durata delle maledizioni del Menagramo',
      scope: 'world',
      config: true,
      type: Number,
      default: 1.0,
      range: { min: 0.5, max: 3.0, step: 0.1 }
    });

    // Auto-applicazione effetti
    game.settings.register(this.ID, 'autoApplyEffects', {
      name: 'Applica Effetti Automaticamente',
      hint: 'Applica automaticamente gli effetti delle capacità Menagramo',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
  }

  /**
   * Registra tutti gli hooks necessari
   */
  static registerHooks() {
    // Hook per creare item Warlock
    Hooks.on('createItem', async (item, options, userId) => {
      if (!game.settings.get(this.ID, 'enableMenagramo')) return;
      await this.handleWarlockCreation(item, options, userId);
    });

    // Hook per aggiornamento livello
    Hooks.on('updateActor', async (actor, changes, options, userId) => {
      if (!game.settings.get(this.ID, 'enableMenagramo')) return;
      await this.handleLevelUpdate(actor, changes, options, userId);
    });

    // Hook per uso item
    Hooks.on('dnd5e.useItem', (item, config, options) => {
      if (!game.settings.get(this.ID, 'enableMenagramo')) return;
      return this.handleItemUse(item, config, options);
    });

    // Fixed: Use SheetCoordinator
    const SheetCoordinator = window.SheetCoordinator || game.brancalonia?.SheetCoordinator;
    
    if (SheetCoordinator) {
      SheetCoordinator.registerModule('MenagramoWarlockPatron', async (app, html, data) => {
        this.enhanceCharacterSheet(app, html, data);
      }, {
        priority: 75,
        types: ['character']
      });
    } else {
      Hooks.on('renderActorSheet', (app, html, data) => {
        this.enhanceCharacterSheet(app, html, data);
      });
    }

    // Hook per item sheet
    Hooks.on('renderItemSheet', (app, html, data) => {
      this.enhanceItemSheet(app, html, data);
    });
  }

  /**
   * Registra comandi chat
   */
  static registerChatCommands() {
    Hooks.on('chatMessage', (html, content, msg) => {
      if (!content.startsWith('/')) return true;

      const [command, ...args] = content.slice(1).split(' ');

      switch (command.toLowerCase()) {
        case 'iattura':
          this.castIattura(game.user.character);
          return false;
        case 'tocco-malasorte':
          this.castToccoMalasorte(game.user.character);
          return false;
        case 'maledizione-casuale':
          this.applyRandomCurse(game.user.targets.first()?.actor);
          return false;
        case 'rimuovi-maledizione':
          this.removeCurse(game.user.targets.first()?.actor);
          return false;
        case 'menagramo-status':
          this.showMenagramoStatus(game.user.character);
          return false;
        case 'menagramo-help':
          this.showMenagramoHelp();
          return false;
        default:
          return true;
      }
    });
  }

  /**
   * Estende la classe Actor
   */
  static extendActorClass() {
    const originalPrepareData = CONFIG.Actor.documentClass.prototype.prepareDerivedData;
    CONFIG.Actor.documentClass.prototype.prepareDerivedData = function () {
      originalPrepareData.call(this);

      // Tracking Menagramo
      const menagramoPatron = this.items.find(i =>
        i.type === 'feat' && i.name?.toLowerCase().includes('menagramo')
      );
      this.system.hasMenagramo = !!menagramoPatron;

      // Tracking maledizioni attive
      const curses = this.effects.filter(e =>
        e.flags?.[BrancaloniaMenagramo.ID]?.menagramo
      );
      this.system.activeCurses = curses.length;
    };
  }

  /**
   * Crea macro automatiche
   */
  static async createAutomaticMacros() {
    try {
      const macros = [
        {
          name: 'Iattura del Menagramo',
          type: 'script',
          img: 'icons/magic/unholy/orb-beam-pink.webp',
          command: 'BrancaloniaMenagramo.castIattura(token?.actor);',
          folder: null
        },
        {
          name: 'Maledizione Casuale',
          type: 'script',
          img: 'icons/magic/unholy/hand-claw-glow-purple.webp',
          command: 'BrancaloniaMenagramo.applyRandomCurse(game.user.targets.first()?.actor);',
          folder: null
        }
      ];

      for (const macroData of macros) {
        const existing = game?.macros?.find(m => m.name === macroData.name);
        if (!existing) {
          await Macro.create(macroData);
        }
      }
    } catch (error) {
      this.statistics.errors.push({ type: 'createMacros', message: error.message, timestamp: Date.now() });
      moduleLogger.error('Errore creazione macro', error);
    }
  }

  /**
   * Setup maledizioni
   */
  static setupMaledizioni() {
    // Registra nuovi tipi di maledizioni
    CONFIG.BRANCALONIA = CONFIG.BRANCALONIA || {};
    CONFIG.BRANCALONIA.maledizioni = {
      minori: [
        'Inciampi continuamente (-5 ft movimento)',
        'Le monete ti scivolano dalle mani (svantaggio a Sleight of Hand)',
        'Attiri insetti fastidiosi (svantaggio a Persuasione)',
        'Rompi oggetti fragili al tocco',
        'Il cibo ti va sempre di traverso'
      ],
      maggiori: [
        'Fallimento critico con 1-2',
        'Vulnerabilità a un tipo di danno casuale',
        'Non puoi riposare bene (1 solo dado vita per riposo lungo)',
        'Le armi ti si rompono con 1 naturale',
        'Svantaggio a tutti i TS per 24 ore'
      ]
    };

    moduleLogger.debug?.('🔮 Sistema maledizioni Menagramo configurato');
  }

  /**
   * Gestisce creazione item Warlock
   */
  static async handleWarlockCreation(item, options, userId) {
    try {
      if (item.type !== 'class' || item.name !== 'Warlock') return;
      if (!item.parent || item.parent.documentName !== 'Actor') return;

      const actor = item.parent;

      // Controlla se ha scelto Menagramo come patrono
      const patrono = actor.items.find(i =>
        i.type === 'feat' && i.name?.toLowerCase().includes('menagramo')
      );

      if (patrono) {
        await this.addMenagramoFeatures(actor);
      }
    } catch (error) {
      this.statistics.errors.push({ type: 'handleWarlockCreation', message: error.message, timestamp: Date.now() });
      moduleLogger.error('Errore gestione creazione Warlock', error);
    }
  }

  /**
   * Aggiunge features del Menagramo
   */
  static async addMenagramoFeatures(actor) {
    try {
      // Aggiungi capacità base Iattura
      const iattura = {
        name: 'Iattura',
        type: 'feat',
        img: 'icons/magic/unholy/orb-beam-pink.webp',
        system: {
          description: {
            value: `<p>Come azione bonus, puoi maledire una creatura entro 30 ft.
                    Il bersaglio deve superare un TS su Saggezza (CD ${8 + actor.system.attributes.prof + actor.system.abilities.cha.mod})
                    o avere svantaggio ai tiri per colpire e ai TS per 1 minuto.</p>
                    <p><strong>Utilizzi:</strong> 1 per riposo breve</p>`
          },
          activation: {
            type: 'bonus',
            cost: 1
          },
          uses: {
            value: 1,
            max: 1,
            per: 'sr'
          },
          actionType: 'save',
          save: {
            ability: 'wis',
            dc: null,
            scaling: 'spell'
          }
        },
        flags: {
          [this.ID]: {
            menagramo: true,
            iattura: true
          }
        }
      };

      await actor.createEmbeddedDocuments('Item', [iattura]);

      this.statistics.patronsCreated++;
      this.statistics.spellsGranted++;
      moduleLogger.info(`✅ ${actor.name} ha ottenuto la capacità Iattura del Menagramo`);
      ui.notifications.info(`${actor.name} ha ottenuto la capacità Iattura del Menagramo`);
    } catch (error) {
      this.statistics.errors.push({ type: 'addMenagramoFeatures', message: error.message, timestamp: Date.now() });
      moduleLogger.error('Errore aggiunta features Menagramo', error);
    }
  }

  /**
   * Gestisce aggiornamento livello
   */
  static async handleLevelUpdate(actor, changes, options, userId) {
    try {
      if (!changes.system?.details?.level) return;

      const warlock = actor.items.find(i => i.type === 'class' && i.name === 'Warlock');
      if (!warlock) return;

      const patrono = actor.items.find(i =>
        i.type === 'feat' && i.name?.toLowerCase().includes('menagramo')
      );
      if (!patrono) return;

      const level = warlock.system.levels || 0;

      // Livello 6 - Tocco della Malasorte
      if (level >= 6 && !actor.items.find(i => i.name === 'Tocco della Malasorte')) {
        await this.addToccoMalasorte(actor);
      }

      // Livello 10 - Aura di Iella
      if (level >= 10 && !actor.items.find(i => i.name === 'Aura di Iella')) {
        await this.addAuraIella(actor);
      }

      // Livello 14 - Maledizione Superiore
      if (level >= 14 && !actor.items.find(i => i.name === 'Maledizione Superiore')) {
        await this.addMaledizioneSuperiore(actor);
      }
    } catch (error) {
      this.statistics.errors.push({ type: 'handleLevelUpdate', message: error.message, timestamp: Date.now() });
      moduleLogger.error('Errore gestione aggiornamento livello', error);
    }
  }

  /**
   * Aggiunge Tocco della Malasorte
   */
  static async addToccoMalasorte(actor) {
    const tocco = {
      name: 'Tocco della Malasorte',
      type: 'feat',
      img: 'icons/magic/unholy/hand-claw-glow-purple.webp',
      system: {
        description: {
          value: `<p>Quando colpisci una creatura con un attacco in mischia,
                  puoi usare questa capacità per infliggere una maledizione minore per 1 ora.</p>
                  <p><strong>Utilizzi:</strong> 1 per riposo lungo</p>`
        },
        activation: {
          type: 'special',
          cost: 0
        },
        uses: {
          value: 1,
          max: 1,
          per: 'lr'
        }
      },
      flags: {
        [this.ID]: {
          menagramo: true,
          toccoMalasorte: true
        }
      }
    };

    await actor.createEmbeddedDocuments('Item', [tocco]);
    ui.notifications.info(`${actor.name} ha ottenuto Tocco della Malasorte`);
  }

  /**
   * Aggiunge Aura di Iella
   */
  static async addAuraIella(actor) {
    const aura = {
      name: 'Aura di Iella',
      type: 'feat',
      img: 'icons/magic/unholy/orb-glowing-purple.webp',
      system: {
        description: {
          value: `<p>I nemici entro 10 ft hanno -1 ai tiri per colpire contro di te.</p>
                  <p>Questa è un'aura passiva sempre attiva.</p>`
        },
        activation: {
          type: 'special',
          cost: 0
        }
      },
      flags: {
        [this.ID]: {
          menagramo: true,
          auraIella: true
        }
      }
    };

    await actor.createEmbeddedDocuments('Item', [aura]);

    // Applica effetto aura
    const effect = {
      name: 'Aura di Iella',
      icon: 'icons/magic/unholy/orb-glowing-purple.webp',
      duration: {},
      changes: [{
        key: `flags.${this.ID}.auraIella`,
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: 'true',
        priority: 20
      }],
      flags: {
        [this.ID]: {
          menagramo: true,
          auraIella: true
        }
      }
    };

    await actor.createEmbeddedDocuments('ActiveEffect', [effect]);
    ui.notifications.info(`${actor.name} ha ottenuto Aura di Iella`);
  }

  /**
   * Aggiunge Maledizione Superiore
   */
  static async addMaledizioneSuperiore(actor) {
    const maledizione = {
      name: 'Maledizione Superiore',
      type: 'feat',
      img: 'icons/magic/unholy/strike-beam-pink.webp',
      system: {
        description: {
          value: `<p>Una volta per riposo lungo, puoi lanciare una maledizione maggiore
                  che dura fino al prossimo riposo lungo del bersaglio.</p>
                  <p><strong>Utilizzi:</strong> 1 per riposo lungo</p>`
        },
        activation: {
          type: 'action',
          cost: 1
        },
        uses: {
          value: 1,
          max: 1,
          per: 'lr'
        }
      },
      flags: {
        [this.ID]: {
          menagramo: true,
          maledizioneSuperiore: true
        }
      }
    };

    await actor.createEmbeddedDocuments('Item', [maledizione]);
    ui.notifications.info(`${actor.name} ha ottenuto Maledizione Superiore`);
  }

  /**
   * Gestisce uso item
   */
  static handleItemUse(item, config, options) {
    try {
      const actor = item.parent;

      if (item.flags?.[this.ID]?.iattura) {
        const target = game.user.targets.first();
        if (target) {
          this.iattura(actor, target);
        } else {
          ui.notifications.warn('Seleziona un bersaglio per la Iattura');
        }
        return false; // Previene uso normale
      }

      if (item.flags?.[this.ID]?.toccoMalasorte) {
        const target = game.user.targets.first();
        if (target) {
          this.toccoMalasorte(actor, target);
        } else {
          ui.notifications.warn('Seleziona un bersaglio per il Tocco della Malasorte');
        }
        return false;
      }

      if (item.flags?.[this.ID]?.maledizioneSuperiore) {
        const target = game.user.targets.first();
        if (target) {
          this.maledizioneSuperiore(actor, target);
        } else {
          ui.notifications.warn('Seleziona un bersaglio per la Maledizione Superiore');
        }
        return false;
      }

      return true;
    } catch (error) {
      this.statistics.errors.push({ type: 'handleItemUse', message: error.message, timestamp: Date.now() });
      moduleLogger.error('Errore gestione uso item', error);
      return true;
    }
  }

  /**
   * Iattura - maledizione base del Menagramo
   */
  static async iattura(caster, target) {
    try {
      if (!target) {
        ui.notifications.warn('Seleziona un bersaglio per la Iattura');
        return;
      }

      // Tiro salvezza Saggezza
      const baseDC = game.settings.get(this.ID, 'iatturaBaseDC');
      const dc = baseDC + caster.system.attributes.prof + caster.system.abilities.cha.mod;

      const save = await target.actor.rollAbilitySave('wis', {
        targetValue: dc,
        flavor: 'TS contro Iattura del Menagramo'
      });

      if (save.total < dc) {
        // Fallito - applica sfortuna
        const durationMultiplier = game.settings.get(this.ID, 'curseDurationMultiplier');
        const duration = Math.round(10 * durationMultiplier);

        const effect = {
          name: 'Iattura del Menagramo',
          icon: 'icons/magic/unholy/orb-beam-pink.webp',
          duration: {
            rounds: duration,
            startRound: game?.combat?.round || 0
          },
          changes: [
            {
              key: 'flags.dnd5e.disadvantage.attack.all',
              mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
              value: '1',
              priority: 20
            },
            {
              key: 'flags.dnd5e.disadvantage.save.all',
              mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
              value: '1',
              priority: 20
            }
          ],
          flags: {
            [this.ID]: {
              menagramo: true,
              iattura: true
            }
          }
        };

        if (game.settings.get(this.ID, 'autoApplyEffects')) {
          await target.actor.createEmbeddedDocuments('ActiveEffect', [effect]);
        }

        ChatMessage.create({
          content: `<div class="brancalonia menagramo-curse">
              <h3>🎲 Iattura del Menagramo! 🎲</h3>
              <p><strong>${target.name}</strong> è perseguitato dalla sfortuna!</p>
              <p class="effect-desc">Svantaggio a tutti i tiri per colpire e tiri salvezza per ${duration} round</p>
          </div>`,
          speaker: ChatMessage.getSpeaker({ actor: caster })
        });
      } else {
        ChatMessage.create({
          content: `<div class="brancalonia menagramo-resist">
              <p><strong>${target.name}</strong> resiste alla Iattura!</p>
          </div>`,
          speaker: ChatMessage.getSpeaker({ actor: caster })
        });
      }
      
      this.statistics.iatturaUsed++;
    } catch (error) {
      this.statistics.errors.push({ type: 'iattura', message: error.message, timestamp: Date.now() });
      moduleLogger.error('Errore Iattura', error);
      ui.notifications.error('Errore durante il lancio della Iattura');
    }
  }

  /**
   * Tocco della Malasorte - capacità di 6° livello
   */
  static async toccoMalasorte(caster, target) {
    try {
      if (!target) {
        ui.notifications.warn('Seleziona un bersaglio per il Tocco della Malasorte');
        return;
      }

      // Applica maledizione casuale
      const maledizioni = CONFIG.BRANCALONIA.maledizioni.minori;
      const maledizione = maledizioni[Math.floor(Math.random() * maledizioni.length)];

      const durationMultiplier = game.settings.get(this.ID, 'curseDurationMultiplier');
      const duration = Math.round(3600 * durationMultiplier); // 1 ora

      const effect = {
        name: 'Tocco della Malasorte',
        icon: 'icons/magic/unholy/hand-claw-glow-purple.webp',
        duration: {
          seconds: duration
        },
        description: maledizione,
        changes: this.parseMaledizione(maledizione),
        flags: {
          [this.ID]: {
            menagramo: true,
            toccoMalasorte: true,
            maledizione
          }
        }
      };

      if (game.settings.get(this.ID, 'autoApplyEffects')) {
        await target.actor.createEmbeddedDocuments('ActiveEffect', [effect]);
      }

      ChatMessage.create({
        content: `<div class="brancalonia menagramo-touch">
            <h3>☠️ Tocco della Malasorte! ☠️</h3>
            <p><strong>${target.name}</strong> è afflitto da:</p>
            <p class="curse-desc">"${maledizione}"</p>
            <p class="duration">Durata: ${Math.round(duration / 3600)} ora/e</p>
        </div>`,
        speaker: ChatMessage.getSpeaker({ actor: caster })
      });
      
      this.statistics.cursesApplied++;
    } catch (error) {
      this.statistics.errors.push({ type: 'toccoMalasorte', message: error.message, timestamp: Date.now() });
      moduleLogger.error('Errore Tocco della Malasorte', error);
      ui.notifications.error('Errore durante il Tocco della Malasorte');
    }
  }

  /**
   * Maledizione Superiore - capacità di 14° livello
   */
  static async maledizioneSuperiore(caster, target) {
    try {
      if (!target) {
        ui.notifications.warn('Seleziona un bersaglio per la Maledizione Superiore');
        return;
      }

      // Applica maledizione maggiore
      const maledizioni = CONFIG.BRANCALONIA.maledizioni.maggiori;
      const maledizione = maledizioni[Math.floor(Math.random() * maledizioni.length)];

      const effect = {
        name: 'Maledizione Superiore',
        icon: 'icons/magic/unholy/strike-beam-pink.webp',
        duration: {
          seconds: 28800 // 8 ore (riposo lungo)
        },
        description: maledizione,
        changes: this.parseMaledizione(maledizione, true),
        flags: {
          [this.ID]: {
            menagramo: true,
            maledizioneSuperiore: true,
            maledizione
          }
        }
      };

      if (game.settings.get(this.ID, 'autoApplyEffects')) {
        await target.actor.createEmbeddedDocuments('ActiveEffect', [effect]);
      }

      ChatMessage.create({
        content: `<div class="brancalonia menagramo-superior">
            <h3>💀 MALEDIZIONE SUPERIORE! 💀</h3>
            <p><strong>${target.name}</strong> è sopraffatto da:</p>
            <p class="curse-desc">"${maledizione}"</p>
            <p class="duration">Durata: Fino al prossimo riposo lungo</p>
        </div>`,
        speaker: ChatMessage.getSpeaker({ actor: caster })
      });
      
      this.statistics.cursesApplied++;
      const curseType = 'maggiore';
      this.statistics.cursesByType[curseType] = (this.statistics.cursesByType[curseType] || 0) + 1;
    } catch (error) {
      this.statistics.errors.push({ type: 'maledizioneSuperiore', message: error.message, timestamp: Date.now() });
      moduleLogger.error('Errore Maledizione Superiore', error);
      ui.notifications.error('Errore durante la Maledizione Superiore');
    }
  }

  /**
   * Converte descrizione maledizione in changes
   */
  static parseMaledizione(desc, maggiore = false) {
    const changes = [];

    if (desc.includes('movimento')) {
      changes.push({
        key: 'system.attributes.movement.walk',
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: '-5',
        priority: 20
      });
    }

    if (desc.includes('svantaggio') && desc.includes('Sleight')) {
      changes.push({
        key: 'flags.dnd5e.disadvantage.skill.slt',
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: '1',
        priority: 20
      });
    }

    if (desc.includes('svantaggio') && desc.includes('Persuasione')) {
      changes.push({
        key: 'flags.dnd5e.disadvantage.skill.per',
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: '1',
        priority: 20
      });
    }

    // Effetti maggiori
    if (maggiore) {
      if (desc.includes('svantaggio a tutti i TS')) {
        changes.push({
          key: 'flags.dnd5e.disadvantage.save.all',
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: '1',
          priority: 20
        });
      }

      if (desc.includes('Vulnerabilità')) {
        const damageTypes = ['fire', 'cold', 'lightning', 'thunder', 'acid'];
        const randomType = damageTypes[Math.floor(Math.random() * damageTypes.length)];
        changes.push({
          key: 'system.traits.dv.value',
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: randomType,
          priority: 20
        });
      }
    }

    return changes;
  }

  /**
   * Applica maledizione casuale
   */
  static async applyRandomCurse(target) {
    try {
      if (!target) {
        ui.notifications.warn('Seleziona un bersaglio per la maledizione');
        return;
      }

      const minori = CONFIG.BRANCALONIA.maledizioni.minori;
      const maggiori = CONFIG.BRANCALONIA.maledizioni.maggiori;
      const allCurses = [...minori, ...maggiori];

      const curse = allCurses[Math.floor(Math.random() * allCurses.length)];
      const isMaggior = maggiori.includes(curse);

      const effect = {
        name: isMaggior ? 'Maledizione Maggiore' : 'Maledizione Minore',
        icon: isMaggior ? 'icons/magic/unholy/strike-beam-pink.webp' : 'icons/magic/unholy/hand-claw-glow-purple.webp',
        duration: {
          seconds: isMaggior ? 28800 : 3600
        },
        description: curse,
        changes: this.parseMaledizione(curse, isMaggior),
        flags: {
          [this.ID]: {
            menagramo: true,
            randomCurse: true,
            maledizione: curse
          }
        }
      };

      await target.createEmbeddedDocuments('ActiveEffect', [effect]);

      ChatMessage.create({
        content: `<div class="brancalonia menagramo-random">
            <h3>🎭 Maledizione Casuale!</h3>
            <p><strong>${target.name}</strong> è colpito da:</p>
            <p class="curse-desc">"${curse}"</p>
        </div>`
      });
      
      this.statistics.cursesApplied++;
      const curseType = 'casuale';
      this.statistics.cursesByType[curseType] = (this.statistics.cursesByType[curseType] || 0) + 1;
    } catch (error) {
      this.statistics.errors.push({ type: 'applyRandomCurse', message: error.message, timestamp: Date.now() });
      moduleLogger.error('Errore maledizione casuale', error);
      ui.notifications.error('Errore durante l\'applicazione della maledizione');
    }
  }

  /**
   * Rimuove maledizione
   */
  static async removeCurse(target) {
    try {
      if (!target) {
        ui.notifications.warn('Seleziona un bersaglio per rimuovere la maledizione');
        return;
      }

      const curses = target.effects.filter(e => e.flags?.[this.ID]?.menagramo);

      if (curses.length === 0) {
        ui.notifications.info(`${target.name} non ha maledizioni attive`);
        return;
      }

      await target.deleteEmbeddedDocuments('ActiveEffect', curses.map(c => c.id));

      ChatMessage.create({
        content: `<div class="brancalonia menagramo-remove">
            <h3>✨ Maledizione Rimossa!</h3>
            <p><strong>${target.name}</strong> è libero dalle maledizioni del Menagramo!</p>
        </div>`
      });
    } catch (error) {
      this.statistics.errors.push({ type: 'removeCurse', message: error.message, timestamp: Date.now() });
      moduleLogger.error('Errore rimozione maledizione', error);
      ui.notifications.error('Errore durante la rimozione della maledizione');
    }
  }

  /**
   * Lancia Iattura via comando
   */
  static castIattura(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun attore selezionato');
      return;
    }

    const target = game.user.targets.first();
    if (!target) {
      ui.notifications.warn('Seleziona un bersaglio per la Iattura');
      return;
    }

    this.iattura(actor, target);
  }

  /**
   * Lancia Tocco della Malasorte via comando
   */
  static castToccoMalasorte(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun attore selezionato');
      return;
    }

    const target = game.user.targets.first();
    if (!target) {
      ui.notifications.warn('Seleziona un bersaglio per il Tocco della Malasorte');
      return;
    }

    this.toccoMalasorte(actor, target);
  }

  /**
   * Mostra stato Menagramo
   */
  static showMenagramoStatus(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun attore selezionato');
      return;
    }

    const hasMenagramo = actor.system.hasMenagramo;
    const activeCurses = actor.system.activeCurses || 0;
    const menagramoFeatures = actor.items.filter(i => i.flags?.[this.ID]?.menagramo);

    const message = `
      <div class="brancalonia-menagramo-status">
        <h3>🔮 Stato Menagramo</h3>
        <p><strong>Patrono Menagramo:</strong> ${hasMenagramo ? 'Sì' : 'No'}</p>
        <p><strong>Maledizioni Attive:</strong> ${activeCurses}</p>
        <p><strong>Capacità Disponibili:</strong></p>
        <ul>
          ${menagramoFeatures.map(f => `<li>${f.name}</li>`).join('')}
        </ul>
      </div>
    `;

    ChatMessage.create({
      content: message,
      whisper: [game.user.id]
    });
  }

  /**
   * Mostra aiuto Menagramo
   */
  static showMenagramoHelp() {
    const message = `
      <div class="brancalonia-help">
        <h3>🔮 Sistema Menagramo</h3>
        <h4>Comandi disponibili:</h4>
        <ul>
          <li><code>/iattura</code> - Lancia Iattura del Menagramo</li>
          <li><code>/tocco-malasorte</code> - Usa Tocco della Malasorte</li>
          <li><code>/maledizione-casuale</code> - Applica maledizione casuale</li>
          <li><code>/rimuovi-maledizione</code> - Rimuove maledizioni</li>
          <li><code>/menagramo-status</code> - Mostra stato personaggio</li>
        </ul>
        <h4>Capacità per livello:</h4>
        <ul>
          <li><strong>1° livello:</strong> Iattura (1/riposo breve)</li>
          <li><strong>6° livello:</strong> Tocco della Malasorte (1/riposo lungo)</li>
          <li><strong>10° livello:</strong> Aura di Iella (passiva)</li>
          <li><strong>14° livello:</strong> Maledizione Superiore (1/riposo lungo)</li>
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
      if (!actor.system.hasMenagramo) return;

      const activeCurses = actor.system.activeCurses || 0;

      // Aggiunge sezione Menagramo
      const featuresTab = html.find('.tab[data-tab="features"]');
      if (featuresTab.length) {
        featuresTab.append(`
          <div class="brancalonia-menagramo-section">
            <h3>🔮 Menagramo</h3>
            <div class="form-group">
              <label>Maledizioni Attive: ${activeCurses}</label>
            </div>
          </div>
        `);
      }
    } catch (error) {
      this.statistics.errors.push({ type: 'enhanceCharacterSheet', message: error.message, timestamp: Date.now() });
      moduleLogger.error('Errore enhancing character sheet', error);
    }
  }

  /**
   * Migliora item sheet
   */
  static enhanceItemSheet(app, html, data) {
    try {
      const item = app.item;
      if (!item.flags?.[this.ID]?.menagramo) return;

      const header = html.find('.window-title');
      if (header.length) {
        header.append(' <span style="color: #9C27B0;">🔮</span>');
      }
    } catch (error) {
      this.statistics.errors.push({ type: 'enhanceItemSheet', message: error.message, timestamp: Date.now() });
      moduleLogger.error('Errore enhancing item sheet', error);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API (Enterprise-grade)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Ottiene lo stato del modulo
   * @static
   * @returns {Object} Stato corrente del modulo
   * 
   * @example
   * const status = BrancaloniaMenagramo.getStatus();
   * console.log(status.initialized); // true
   * console.log(status.version); // '2.0.0'
   */
  static getStatus() {
    return {
      initialized: this._state.initialized,
      hooksRegistered: this._state.hooksRegistered,
      version: this.VERSION,
      moduleName: this.MODULE_NAME,
      moduleId: this.MODULE_ID
    };
  }

  /**
   * Ottiene le statistiche dettagliate
   * @static
   * @returns {Object} Statistiche complete
   * 
   * @example
   * const stats = BrancaloniaMenagramo.getStatistics();
   * console.log(stats.patronsCreated); // 5
   * console.log(stats.cursesApplied); // 12
   */
  static getStatistics() {
    return {
      ...this.statistics,
      errorsCount: this.statistics.errors.length
    };
  }

  /**
   * Resetta le statistiche
   * @static
   * 
   * @example
   * BrancaloniaMenagramo.resetStatistics();
   */
  static resetStatistics() {
    this.statistics = {
      patronsCreated: 0,
      cursesApplied: 0,
      cursesByType: {},
      iatturaUsed: 0,
      iatturaSuccesses: 0,
      iatturaFailures: 0,
      spellsGranted: 0,
      dialogsShown: 0,
      errors: []
    };
    moduleLogger.info('📊 Statistiche resettate');
  }

  /**
   * Mostra report console colorato
   * @static
   * 
   * @example
   * BrancaloniaMenagramo.showReport();
   */
  static showReport() {
    console.log('%c═══════════════════════════════════════', 'color: #9C27B0; font-weight: bold');
    console.log('%c🔮 MENAGRAMO WARLOCK PATRON - REPORT', 'color: #9C27B0; font-weight: bold; font-size: 14px');
    console.log('%c═══════════════════════════════════════', 'color: #9C27B0; font-weight: bold');
    console.log('');
    console.log('%c📊 STATUS', 'color: #00BCD4; font-weight: bold');
    console.log(`Version: ${this.VERSION}`);
    console.log(`Initialized: ${this._state.initialized}`);
    console.log(`Hooks Registered: ${this._state.hooksRegistered}`);
    console.log('');
    console.log('%c📈 STATISTICS', 'color: #4CAF50; font-weight: bold');
    console.log(`Patrons Created: ${this.statistics.patronsCreated}`);
    console.log(`Curses Applied: ${this.statistics.cursesApplied}`);
    console.log(`  By Type:`, this.statistics.cursesByType);
    console.log(`Iattura Used: ${this.statistics.iatturaUsed}`);
    console.log(`  Successes: ${this.statistics.iatturaSuccesses}`);
    console.log(`  Failures: ${this.statistics.iatturaFailures}`);
    console.log(`Spells Granted: ${this.statistics.spellsGranted}`);
    console.log(`Dialogs Shown: ${this.statistics.dialogsShown}`);
    console.log(`Errors: ${this.statistics.errors.length}`);
    if (this.statistics.errors.length > 0) {
      console.log('%c⚠️ Last 3 Errors:', 'color: #FF9800; font-weight: bold');
      this.statistics.errors.slice(-3).forEach(err => {
        console.log(`  [${err.type}] ${err.message}`);
      });
    }
    console.log('');
    console.log('%c═══════════════════════════════════════', 'color: #9C27B0; font-weight: bold');
  }
}

// Auto-inizializzazione
Hooks.once('init', () => {
  if (!game.brancalonia) game.brancalonia = {};
  if (!game.brancalonia.modules) game.brancalonia.modules = {};
  window.BrancaloniaMenagramo = BrancaloniaMenagramo;
  game.brancalonia.menagramoWarlock = BrancaloniaMenagramo;
  game.brancalonia.modules['menagramo-warlock-patron'] = BrancaloniaMenagramo;

  BrancaloniaMenagramo.initialize();
});

Hooks.once('ready', () => {
  // Crea macro automatiche
  BrancaloniaMenagramo.createAutomaticMacros();
});

// Export ES6
export default BrancaloniaMenagramo;
export { BrancaloniaMenagramo };