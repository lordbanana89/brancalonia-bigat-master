/* global $ */
/**
 * Sistema Risse da Taverna per Brancalonia
 * Basato RIGOROSAMENTE sulle regole ufficiali del manuale (pag. 51-57)
 * Compatibile con dnd5e system per Foundry VTT v13
 * 
 * INTEGRATO CON:
 * - Eventi Atmosfera da BaraondaSystem
 * - Macro User-Friendly (TavernBrawlMacros)
 * - 20 Mosse completamente implementate
 * 
 * @module TavernBrawlSystem
 * @version 2.0.0
 * @author Brancalonia BIGAT Team
 */

import { logger } from './brancalonia-logger.js';
import './tavern-brawl-macros.js';

class TavernBrawlSystem {
  static VERSION = '2.0.0';
  static MODULE_NAME = 'Tavern Brawl System';
  static ID = 'brancalonia-bigat';

  // Statistics tracking (enterprise-grade)
  static statistics = {
    brawlsStarted: 0,
    brawlsEnded: 0,
    saccagnateExecuted: 0,
    mosseExecuted: 0,
    propsUsed: 0,
    pericoliVagantiTriggered: 0,
    eventiAtmosferaTriggered: 0,
    batosteTotali: 0,
    koCount: 0,
    errors: []
  };

  // Internal state management
  static _state = {
    initialized: false,
    hooksRegistered: false,
    settingsRegistered: false,
    macrosCreated: false
  };

  constructor() {
    this.activeBrawl = false;
    this.brawlCombat = null;
    this.brawlParticipants = new Map(); // actorId -> dati rissa

    // Mapping classi: supporta sia nomi D&D 5e standard che varianti Brancaloniane
    // Database: /database/classi/
    this.classiMapping = {
      // Barbarian / Pagano
      'barbarian': 'barbaro',
      'barbaro': 'barbaro',
      'pagano': 'barbaro',
      
      // Bard / Arlecchino
      'bard': 'bardo',
      'bardo': 'bardo',
      'arlecchino': 'bardo',
      
      // Cleric / Miracolaro
      'cleric': 'chierico',
      'chierico': 'chierico',
      'miracolaro': 'chierico',
      
      // Druid / Benandante
      'druid': 'druido',
      'druido': 'druido',
      'benandante': 'druido',
      
      // Fighter / Spadaccino
      'fighter': 'guerriero',
      'guerriero': 'guerriero',
      'spadaccino': 'guerriero',
      
      // Rogue / Brigante
      'rogue': 'ladro',
      'ladro': 'ladro',
      'brigante': 'ladro',
      
      // Wizard / Guiscardo
      'wizard': 'mago',
      'mago': 'mago',
      'guiscardo': 'mago',
      
      // Monk / Frate
      'monk': 'monaco',
      'monaco': 'monaco',
      'frate': 'monaco',
      
      // Paladin / Cavaliere Errante
      'paladin': 'paladino',
      'paladino': 'paladino',
      'cavaliere errante': 'paladino',
      'cavaliere': 'paladino',
      
      // Ranger / Mattatore
      'ranger': 'ranger',
      'mattatore': 'ranger',
      
      // Sorcerer / Scaramante
      'sorcerer': 'stregone',
      'stregone': 'stregone',
      'scaramante': 'stregone',
      
      // Warlock / Menagramo
      'warlock': 'warlock',
      'menagramo': 'warlock'
    };

    // Livelli di Batoste come da manuale
    this.batosteLevels = [
      { level: 1, name: 'Ammaccato', effect: '-1 CA' },
      { level: 2, name: 'Contuso', effect: '-1 CA' },
      { level: 3, name: 'Livido', effect: '-1 CA' },
      { level: 4, name: 'Pesto', effect: '-1 CA' },
      { level: 5, name: 'Gonfio', effect: '-1 CA' },
      { level: 6, name: 'Incosciente', effect: 'Privo di sensi' }
    ];

    // Mosse Generiche (dal manuale pag. 54)
    this.mosseGeneriche = {
      buttafuori: {
        name: 'Buttafuori',
        tipo: 'reazione',
        descrizione: "Dopo essere colpito, tiro per colpire (For/Des) che stordisce l'attaccante",
        execute: async (actor, target) => this._executeMossa(actor, target, 'buttafuori')
      },
      schianto: {
        name: 'Schianto',
        tipo: 'azione',
        descrizione: 'Tiro (For/Cos): 1 batosta + stordito e prono al bersaglio. Tu subisci 1 batosta',
        execute: async (actor, target) => this._executeMossa(actor, target, 'schianto')
      },
      finta: {
        name: 'Finta',
        tipo: 'azione',
        descrizione: 'Fingi di essere svenuto. Non puoi essere bersagliato finché non attacchi',
        execute: async (actor) => this._executeMossa(actor, null, 'finta')
      },
      brodagliaInFaccia: {
        name: 'Brodaglia in Faccia',
        tipo: 'azione bonus',
        descrizione: 'Tiro (Des/Sag) che acceca il bersaglio',
        execute: async (actor, target) => this._executeMossa(actor, target, 'brodagliaInFaccia')
      },
      ghigliottina: {
        name: 'Ghigliottina',
        tipo: 'azione',
        descrizione: 'Tiro (For/Des): 1 batosta + prono',
        execute: async (actor, target) => this._executeMossa(actor, target, 'ghigliottina')
      },
      fracassateste: {
        name: 'Fracassateste',
        tipo: 'azione',
        descrizione: 'Tiro (For/Cos): 1 batosta a due bersagli',
        execute: async (actor, targets) => this._executeMossa(actor, targets, 'fracassateste')
      },
      allaPugna: {
        name: 'Alla Pugna!',
        tipo: 'azione',
        descrizione: 'Tutti gli alleati hanno vantaggio alla prossima mossa/saccagnata',
        execute: async (actor) => this._executeMossa(actor, null, 'allaPugna')
      },
      sottoIlTavolo: {
        name: 'Sotto il Tavolo',
        tipo: 'azione',
        descrizione: 'Ti metti in copertura: +5 CA e TS Destrezza',
        execute: async (actor) => this._executeMossa(actor, null, 'sottoIlTavolo')
      },
      sgambetto: {
        name: 'Sgambetto',
        tipo: 'azione bonus',
        descrizione: 'Tiro (Des/Int) che rende prono il bersaglio',
        execute: async (actor, target) => this._executeMossa(actor, target, 'sgambetto')
      },
      giuLeBraghe: {
        name: 'Giù le Braghe',
        tipo: 'azione bonus',
        descrizione: 'Tiro (Des/Car) che trattiene il bersaglio',
        execute: async (actor, target) => this._executeMossa(actor, target, 'giuLeBraghe')
      },
      pugnoneInTesta: {
        name: 'Pugnone in Testa',
        tipo: 'azione',
        descrizione: 'Tiro (For/Cos): 1 batosta + incapacitato',
        execute: async (actor, target) => this._executeMossa(actor, target, 'pugnoneInTesta')
      },
      testataDiMattone: {
        name: 'Testata di Mattone',
        tipo: 'reazione',
        descrizione: 'Dopo essere colpito, tiro (For/Cos): 1 batosta',
        execute: async (actor, target) => this._executeMossa(actor, target, 'testataDiMattone')
      }
    };

    // Mosse Magiche (dal manuale pag. 54)
    this.mosseMagiche = {
      protezioneDalMenare: {
        name: 'Protezione dal Menare',
        tipo: 'azione',
        descrizione: 'Un bersaglio subisce svantaggio agli attacchi contro di lui',
        execute: async (actor, target) => this._executeMossa(actor, target, 'protezioneDalMenare')
      },
      spruzzoVenefico: {
        name: 'Spruzzo Venefico',
        tipo: 'azione',
        descrizione: 'Tiro (Int/Sag/Car): 1 batosta + avvelenato',
        execute: async (actor, target) => this._executeMossa(actor, target, 'spruzzoVenefico')
      },
      urlaDissennanti: {
        name: 'Urla Dissennanti',
        tipo: 'azione',
        descrizione: 'Una creatura diventa spaventata da te',
        execute: async (actor, target) => this._executeMossa(actor, target, 'urlaDissennanti')
      },
      laMagna: {
        name: 'La Magna',
        tipo: 'azione',
        descrizione: 'Una creatura diventa affascinata da te',
        execute: async (actor, target) => this._executeMossa(actor, target, 'laMagna')
      },
      sguardoGhiacciante: {
        name: 'Sguardo Ghiacciante',
        tipo: 'azione',
        descrizione: 'Un bersaglio non subisce batoste o condizioni fino al tuo prossimo turno',
        execute: async (actor, target) => this._executeMossa(actor, target, 'sguardoGhiacciante')
      },
      pugnoIncantato: {
        name: 'Pugno Incantato',
        tipo: 'azione',
        descrizione: 'Tre tiri (Int/Sag/Car) a tre bersagli: 1 batosta ciascuno',
        execute: async (actor, targets) => this._executeMossa(actor, targets, 'pugnoIncantato')
      },
      schiaffoveggenza: {
        name: 'Schiaffoveggenza',
        tipo: 'reazione',
        descrizione: "Quando attaccato, dai svantaggio all'attaccante",
        execute: async (actor, attacker) => this._executeMossa(actor, attacker, 'schiaffoveggenza')
      },
      sediataSpiriturale: {
        name: 'Sediata Spirituale',
        tipo: 'azione bonus',
        descrizione: 'Trasforma oggetto di scena comune in epico',
        execute: async (actor) => this._executeMossa(actor, null, 'sediataSpiriturale')
      }
    };

    // Mosse di Classe (dal manuale pag. 54)
    this.mosseClasse = {
      barbaro: {
        name: 'Rissa Furiosa',
        tipo: 'azione bonus',
        descrizione: 'Per questo turno, mosse e saccagnate infliggono 1 batosta aggiuntiva',
        execute: async (actor) => this._executeMossa(actor, null, 'rissaFuriosa')
      },
      bardo: {
        name: 'Ku Fu?',
        tipo: 'reazione',
        descrizione: 'Reazione: quando attaccato, tiro (Car) per far cambiare bersaglio',
        execute: async (actor, attacker) => this._executeMossa(actor, attacker, 'kuFu')
      },
      chierico: {
        name: 'Osso Sacro',
        tipo: 'azione',
        descrizione: 'Azione: tiro (Sag): 1 batosta + prono',
        execute: async (actor, target) => this._executeMossa(actor, target, 'ossoSacro')
      },
      druido: {
        name: 'Schiaffo Animale',
        tipo: 'azione',
        descrizione: 'Azione: tiro (Sag): 1 batosta + spaventato',
        execute: async (actor, target) => this._executeMossa(actor, target, 'schiaffoAnimale')
      },
      guerriero: {
        name: 'Contrattacco',
        tipo: 'reazione',
        descrizione: 'Reazione: saccagnata contro attaccante con svantaggio',
        execute: async (actor, attacker) => this._executeMossa(actor, attacker, 'contrattacco')
      },
      ladro: {
        name: 'Mossa Furtiva',
        tipo: 'azione bonus',
        descrizione: 'Azione bonus: prossima mossa/saccagnata +1 batosta e vantaggio',
        execute: async (actor) => this._executeMossa(actor, null, 'mossaFurtiva')
      },
      monaco: {
        name: 'Raffica di Schiaffoni',
        tipo: 'azione bonus',
        descrizione: 'Azione bonus: due saccagnate',
        execute: async (actor, target) => this._executeMossa(actor, target, 'raffichaSchiaffoni')
      },
      paladino: {
        name: 'Punizione di Vino',
        tipo: 'azione bonus',
        descrizione: 'Azione bonus: tiro (For): 1 batosta + accecato',
        execute: async (actor, target) => this._executeMossa(actor, target, 'punizioneDiVino')
      },
      ranger: {
        name: 'Il Richiamo della Foresta',
        tipo: 'azione',
        descrizione: 'Azione: lancia esca, bersaglio trattenuto da animale',
        execute: async (actor, target) => this._executeMossa(actor, target, 'richiamoDellForesta')
      },
      mago: {
        name: 'Saccagnata Arcana!',
        tipo: 'speciale',
        descrizione: 'Spendi slot mossa extra per +1 batosta a mossa magica',
        execute: async (actor, target) => this._executeMossa(actor, target, 'saccagnataArcana')
      },
      stregone: {
        name: 'Saccagnata Arcana!',
        tipo: 'speciale',
        descrizione: 'Spendi slot mossa extra per +1 batosta a mossa magica',
        execute: async (actor, target) => this._executeMossa(actor, target, 'saccagnataArcana')
      },
      warlock: {
        name: 'Saccagnata Arcana!',
        tipo: 'speciale',
        descrizione: 'Spendi slot mossa extra per +1 batosta a mossa magica',
        execute: async (actor, target) => this._executeMossa(actor, target, 'saccagnataArcana')
      }
    };

    // Assi nella Manica (livello 6, dal manuale pag. 55)
    this.assiNellaManica = {
      barbaro: {
        name: 'Viuuulenza!',
        tipo: 'azione bonus',
        descrizione: 'Fino al prossimo turno non subisci batoste o condizioni',
        execute: async (actor) => this._executeMossa(actor, null, 'viuuulenza')
      },
      bardo: {
        name: 'Urlo Straziaugola',
        tipo: 'azione',
        descrizione: 'TS Costituzione o 1 batosta + incapacitato a tutti',
        execute: async (actor) => this._executeMossa(actor, null, 'urloStraziaugola')
      },
      chierico: {
        name: 'Donna Lama, il tuo servo ti chiama!',
        tipo: 'azione',
        descrizione: 'Un Pericolo Vagante colpisce tutti i nemici',
        execute: async (actor) => this._executeMossa(actor, null, 'donnaLama')
      },
      druido: {
        name: 'Nube di Polline',
        tipo: 'azione',
        descrizione: 'TS Costituzione o 1 batosta + avvelenato a tutti',
        execute: async (actor) => this._executeMossa(actor, null, 'nubeDiPolline')
      },
      guerriero: {
        name: 'Pugno Vorpal',
        tipo: 'azione',
        descrizione: 'Saccagnata che infligge 3 batoste aggiuntive',
        execute: async (actor, target) => this._executeMossa(actor, target, 'pugnoVorpal')
      },
      ladro: {
        name: 'Puff... Sparito!',
        tipo: 'reazione',
        descrizione: 'Reazione: eviti attacco e fai saccagnata +1 batosta',
        execute: async (actor, attacker) => this._executeMossa(actor, attacker, 'puffSparito')
      },
      mago: {
        name: 'Palla di Cuoco',
        tipo: 'azione',
        descrizione: 'TS Destrezza o 2 batoste a tutti',
        execute: async (actor) => this._executeMossa(actor, null, 'pallaDiCuoco')
      },
      monaco: {
        name: 'Rosario di San Cagnate',
        tipo: 'azione',
        descrizione: 'Saccagnata +1 batosta, TS Cos o KO immediato',
        execute: async (actor, target) => this._executeMossa(actor, target, 'rosarioSanCagnate')
      },
      paladino: {
        name: 'Evocare Cavalcatura',
        tipo: 'azione',
        descrizione: 'La cavalcatura fa due saccagnate e se ne va',
        execute: async (actor, target) => this._executeMossa(actor, target, 'evocareCavalcatura')
      },
      ranger: {
        name: 'Trappolone',
        tipo: 'reazione',
        descrizione: 'Reazione al movimento: 2 batoste + trattenuto',
        execute: async (actor, target) => this._executeMossa(actor, target, 'trappolone')
      },
      stregone: {
        name: 'Sfiga Suprema',
        tipo: 'azione',
        descrizione: 'TS Saggezza o lasci cadere tutto e sei spaventato',
        execute: async (actor, target) => this._executeMossa(actor, target, 'sfigaSuprema')
      },
      warlock: {
        name: 'Tocco del Rimorso',
        tipo: 'azione bonus',
        descrizione: 'Chi ti colpisce subisce 1 batosta',
        execute: async (actor) => this._executeMossa(actor, null, 'toccoDelRimorso')
      }
    };

    // Pericoli Vaganti (opzionali, dal manuale pag. 55)
    this.pericoliVaganti = [
      {
        name: 'Pioggia di Sgabelli',
        effect: 'TS Costituzione CD 11 o stordito'
      },
      {
        name: 'La Taverna dei Pugni Volanti',
        effect: 'TS Forza CD 12 o 1 batosta'
      },
      {
        name: 'Fiume di Birra',
        effect: 'TS Destrezza CD 13 o prono'
      },
      {
        name: 'Sacco di Farina',
        effect: 'TS Destrezza CD 10 o accecato'
      },
      {
        name: 'Se Non è Zuppa',
        effect: 'TS Forza CD 10 o trattenuto'
      },
      {
        name: 'Cala la Botte',
        effect: 'Tira 1d6, con 1 subisci 1 batosta e prono'
      },
      {
        name: 'Storie di Animali',
        effect: '1d6 ad ogni attacco, con 1 colpisci animale invece'
      },
      {
        name: 'Piovono Salumi',
        effect: 'Tira 1d6, con 1 subisci 1 batosta e stordito'
      }
    ];

    // Eventi Narrativi Atmosfera (integrati da BaraondaSystem)
    this.eventiAtmosfera = [
      "Una sedia vola attraverso la stanza!",
      "Qualcuno rovescia un tavolo con fracasso!",
      "Un boccale colpisce qualcuno in testa!",
      "La musica si ferma improvvisamente!",
      "Qualcuno grida 'ALLA CARICA!'",
      "Un barile di birra esplode coprendovi di schiuma!",
      "Le guardie arrivano alla porta!",
      "Qualcuno inizia a cantare stonato!",
      "Un cane inizia ad abbaiare furiosamente!",
      "L'oste minaccia di chiamare la milizia!",
      "Un avventore ubriaco cade dal soppalco!",
      "Volano piatti e bicchieri in ogni direzione!",
      "Qualcuno spegne le candele, buio parziale!",
      "Il bardo cerca di calmare gli animi suonando!",
      "Una finestra si sfonda per il caos!",
      "L'oste grida 'NON I MIEI PIATTI!'",
      "Un gatto salta sui tavoli seminando panico!",
      "Qualcuno inciampa in una pozza di vino!",
      "Si sente il fischio della milizia fuori!",
      "Un avventore fugge dalla porta gridando!"
    ];

    // Privilegi da Rissa per livello (dal manuale pag. 53)
    this.privilegiRissa = {
      1: { mosse: ['generica', 'classe'], slotMossa: 2 },
      2: { ignoranzaEroica: true, slotMossa: 2 },
      3: { mosse: ['generica'], slotMossa: 3 },
      4: { mascellaDiFerro: true, slotMossa: 3 },
      5: { mosse: ['generica'], slotMossa: 4 },
      6: { assoNellaManica: true, slotMossa: 4 }
    };
  }

  static initialize() {
    try {
      logger.startPerformance('tavern-brawl-init');
      logger.info(this.MODULE_NAME, '⚔️ Inizializzazione Sistema Risse...');

    // Registrazione settings
    game.settings.register('brancalonia-bigat', 'brawlSystemEnabled', {
      name: 'Sistema Risse Attivo',
      hint: 'Abilita il sistema completo di risse da taverna',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'brawlPericoliVaganti', {
      name: 'Pericoli Vaganti per Default',
      hint: 'Attiva automaticamente i pericoli vaganti nelle risse',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register('brancalonia-bigat', 'brawlAutoMacros', {
      name: 'Macro Automatiche',
      hint: 'Crea automaticamente le macro per le azioni di rissa',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'brawlVisualEffects', {
      name: 'Effetti Visivi',
      hint: 'Mostra effetti visivi durante le risse',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'brawlAutoEventi', {
      name: 'Eventi Atmosfera Automatici',
      hint: 'Trigger automatico eventi narrativi ogni N turni (0 = disabilitato)',
      scope: 'world',
      config: true,
      type: Number,
      default: 2,
      range: { min: 0, max: 10, step: 1 }
    });

    // Esporta la classe per compatibilità con il sistema di inizializzazione
    window.TavernBrawlSystemClass = TavernBrawlSystem;

    // Creazione istanza globale
    window.TavernBrawlSystem = new TavernBrawlSystem();
    game.brancalonia = game.brancalonia ?? {};
    // Alias storici per compatibilità con macro e moduli esterni
    game.brancalonia.TavernBrawlSystem = window.TavernBrawlSystem;
    game.brancalonia.TavernBrawl = window.TavernBrawlSystem;

    // Registrazione hooks
    TavernBrawlSystem._registerHooks();

    // Registrazione comandi chat
    TavernBrawlSystem._registerChatCommands();

    // Creazione macro automatica
    TavernBrawlSystem._createMacro();

    this._state.initialized = true;
    this._state.settingsRegistered = true;
    const perfTime = logger.endPerformance('tavern-brawl-init');
    logger.info(this.MODULE_NAME, `✅ Sistema Risse inizializzato con successo (${perfTime?.toFixed(2)}ms)`);
    
    // Event emitter
    logger.events.emit('tavern-brawl:initialized', {
      version: this.VERSION,
      timestamp: Date.now()
    });
    } catch (error) {
      this.statistics.errors.push({ 
        type: 'initialize', 
        message: error.message, 
        timestamp: Date.now() 
      });
      logger.error(this.MODULE_NAME, 'Errore inizializzazione Sistema Risse', error);
      if (ui?.notifications) {
        ui.notifications.error(`Errore inizializzazione Sistema Risse: ${error.message}`);
      }
    }
  }

  static _registerHooks() {
    // Hook per modificare il combattimento quando è una rissa
    Hooks.on('combatStart', (combat) => {
      if (!game.settings.get('brancalonia-bigat', 'brawlSystemEnabled')) return;

      if (combat.getFlag('brancalonia-bigat', 'isBrawl')) {
        window.TavernBrawlSystem.activeBrawl = true;
        window.TavernBrawlSystem.brawlCombat = combat;
        ui.notifications.info('Modalità Rissa Attivata!');
      }
    });

    Hooks.on('combatTurn', (combat) => {
      if (!game.settings.get('brancalonia-bigat', 'brawlSystemEnabled')) return;

      if (window.TavernBrawlSystem.activeBrawl && combat.id === window.TavernBrawlSystem.brawlCombat?.id) {
        // Mostra azioni disponibili per il turno
        window.TavernBrawlSystem._showBrawlActions(combat.combatant.actor);
        
        // Trigger automatico eventi atmosfera
        const autoEventiFrequency = game.settings.get('brancalonia-bigat', 'brawlAutoEventi');
        if (autoEventiFrequency > 0 && combat.turn % autoEventiFrequency === 0) {
          window.TavernBrawlSystem.triggerEventoAtmosfera();
        }
      }
    });

    Hooks.on('combatEnd', (combat) => {
      if (!game.settings.get('brancalonia-bigat', 'brawlSystemEnabled')) return;

      if (combat.id === window.TavernBrawlSystem.brawlCombat?.id) {
        window.TavernBrawlSystem.endBrawl();
      }
    });

    // Fixed: Use SheetCoordinator
    const SheetCoordinator = window.SheetCoordinator || game.brancalonia?.SheetCoordinator;
    
    if (SheetCoordinator) {
      SheetCoordinator.registerModule('TavernBrawl', async (app, html) => {
        if (app.actor.type !== 'character' || !game.user.isGM) return;
        if (!game.settings.get('brancalonia-bigat', 'brawlSystemEnabled')) return;

        const button = $(`<button class="brawl-manager-btn" title="Inizia Rissa">
          <i class="fas fa-fist-raised"></i>
        </button>`);
        html.find('.window-header .window-title').after(button);
        button.click(() => {
          window.TavernBrawlSystem.startBrawl();
        });
      }, {
        priority: 70,
        types: ['character'],
        gmOnly: true
      });
    } else {
      Hooks.on('renderActorSheet', (app, html) => {
        if (app.actor.type !== 'character' || !game.user.isGM) return;
        if (!game.settings.get('brancalonia-bigat', 'brawlSystemEnabled')) return;

        const button = $(`<button class="brawl-manager-btn" title="Inizia Rissa">
          <i class="fas fa-fist-raised"></i>
        </button>`);
        html.find('.window-header .window-title').after(button);
        button.click(() => {
          window.TavernBrawlSystem.startBrawl();
        });
      });
    }

    this._state.hooksRegistered = true;
    logger.info(this.MODULE_NAME, '✅ Hooks Sistema Risse registrati');
  }

  static _registerChatCommands() {
    const registerCommands = () => {
      if (!game.chatCommands) {
        logger.warn(this.MODULE_NAME, 'chatCommands non disponibile, uso fallback chatMessage');
        TavernBrawlSystem._registerChatFallback();
        return;
      }

      const commands = [
        {
          name: '/rissa',
          description: 'Inizia una rissa con i token selezionati',
          icon: "<i class='fas fa-fist-raised'></i>",
          handler: async () => {
            if (!game.user.isGM) {
              ui.notifications.error('Solo il GM può iniziare una rissa!');
              return;
            }
            await window.TavernBrawlSystem.startBrawl();
          }
        },
        {
          name: '/saccagnata',
          description: 'Esegue una saccagnata contro il bersaglio',
          icon: "<i class='fas fa-fist-raised'></i>",
          handler: async () => {
            const tokens = canvas.tokens.controlled;
            const targets = game.user.targets;

            if (tokens.length !== 1) {
              ui.notifications.error('Seleziona un solo token attaccante!');
              return;
            }

            if (targets.size !== 1) {
              ui.notifications.error('Seleziona un solo bersaglio!');
              return;
            }

            const actor = tokens[0].actor;
            const target = Array.from(targets)[0];

            await window.TavernBrawlSystem.executeSaccagnata(actor, target);
          }
        },
        {
          name: '/raccogli-oggetto',
          description: 'Raccoglie un oggetto di scena',
          icon: "<i class='fas fa-hand-paper'></i>",
          handler: async (parameters) => {
            const tokens = canvas.tokens.controlled;
            if (tokens.length !== 1) {
              ui.notifications.error('Seleziona un solo token!');
              return;
            }

            const tipo = (parameters || '').trim() || 'comune';
            if (!['comune', 'epico'].includes(tipo)) {
              ui.notifications.error('Tipo non valido! Usa: comune o epico');
              return;
            }

            await window.TavernBrawlSystem.pickUpProp(tokens[0].actor, tipo);
          }
        },
        {
          name: '/pericolo-vagante',
          description: 'Attiva un pericolo vagante casuale',
          icon: "<i class='fas fa-exclamation-triangle'></i>",
          handler: async () => {
            if (!game.user.isGM) {
              ui.notifications.error('Solo il GM può attivare pericoli vaganti!');
              return;
            }
            await window.TavernBrawlSystem.activatePericoloVagante();
          }
        },
        {
          name: '/fine-rissa',
          description: 'Termina la rissa corrente',
          icon: "<i class='fas fa-stop'></i>",
          handler: async () => {
            if (!game.user.isGM) {
              ui.notifications.error('Solo il GM può terminare una rissa!');
              return;
            }
            await window.TavernBrawlSystem.endBrawl();
          }
        },
        {
          name: '/rissa-help',
          description: "Mostra l'aiuto per i comandi rissa",
          icon: "<i class='fas fa-question-circle'></i>",
          handler: () => {
            const helpText = `
              <div class="brancalonia-help">
                <h3>Comandi Sistema Risse</h3>
                <ul>
                  <li><strong>/rissa</strong> - Inizia rissa con token selezionati</li>
                  <li><strong>/saccagnata</strong> - Attacco base in rissa</li>
                  <li><strong>/raccogli-oggetto [comune|epico]</strong> - Raccoglie oggetto di scena</li>
                  <li><strong>/pericolo-vagante</strong> - Attiva pericolo casuale</li>
                  <li><strong>/fine-rissa</strong> - Termina rissa corrente</li>
                  <li><strong>/rissa-help</strong> - Mostra questo aiuto</li>
                </ul>
                <h4>Regole Base:</h4>
                <ul>
                  <li>Saccagnata: Attacco base (For + comp), 1 batosta</li>
                  <li>6 Batoste = Incosciente</li>
                  <li>Oggetti Comuni: +bonus vari</li>
                  <li>Oggetti Epici: +1 batosta o effetti speciali</li>
                </ul>
              </div>
            `;

            ChatMessage.create({
              content: helpText,
              speaker: { alias: 'Sistema Risse' },
              whisper: [game.user.id]
            });
          }
        }
      ];

      for (const command of commands) {
        game.chatCommands.register({
          name: command.name,
          module: 'brancalonia-bigat',
          description: command.description,
          icon: command.icon,
          callback: async (_chat, parameters) => {
            await command.handler(parameters);
          }
        });
      }

      logger.info(TavernBrawlSystem.MODULE_NAME, '✅ Comandi chat Sistema Risse registrati');
    };

    if (game.chatCommands) {
      registerCommands();
    } else {
      Hooks.once('chatCommandsReady', registerCommands);
    }
  }

  static _registerChatFallback() {
    const handlers = {
      '/rissa': async () => {
        if (!game.user.isGM) {
          ui.notifications.error('Solo il GM può iniziare una rissa!');
          return false;
        }
        await window.TavernBrawlSystem.startBrawl();
        return false;
      },
      '/saccagnata': async () => {
        const tokens = canvas.tokens.controlled;
        const targets = game.user.targets;

        if (tokens.length !== 1) {
          ui.notifications.error('Seleziona un solo token attaccante!');
          return false;
        }

        if (targets.size !== 1) {
          ui.notifications.error('Seleziona un solo bersaglio!');
          return false;
        }

        const actor = tokens[0].actor;
        const target = Array.from(targets)[0];

        await window.TavernBrawlSystem.executeSaccagnata(actor, target);
        return false;
      },
      '/raccogli-oggetto': async (message) => {
        const tokens = canvas.tokens.controlled;
        if (tokens.length !== 1) {
          ui.notifications.error('Seleziona un solo token!');
          return false;
        }

        const [, param] = message.split(' ');
        const tipo = (param || '').trim() || 'comune';
        if (!['comune', 'epico'].includes(tipo)) {
          ui.notifications.error('Tipo non valido! Usa: comune o epico');
          return false;
        }

        await window.TavernBrawlSystem.pickUpProp(tokens[0].actor, tipo);
        return false;
      },
      '/pericolo-vagante': async () => {
        if (!game.user.isGM) {
          ui.notifications.error('Solo il GM può attivare pericoli vaganti!');
          return false;
        }
        await window.TavernBrawlSystem.activatePericoloVagante();
        return false;
      },
      '/fine-rissa': async () => {
        if (!game.user.isGM) {
          ui.notifications.error('Solo il GM può terminare una rissa!');
          return false;
        }
        await window.TavernBrawlSystem.endBrawl();
        return false;
      },
      '/rissa-help': () => {
        const helpText = `
          <div class="brancalonia-help">
            <h3>Comandi Sistema Risse</h3>
            <ul>
              <li><strong>/rissa</strong> - Inizia rissa con token selezionati</li>
              <li><strong>/saccagnata</strong> - Attacco base in rissa</li>
              <li><strong>/raccogli-oggetto [comune|epico]</strong> - Raccoglie oggetto di scena</li>
              <li><strong>/pericolo-vagante</strong> - Attiva pericolo casuale</li>
              <li><strong>/fine-rissa</strong> - Termina rissa corrente</li>
              <li><strong>/rissa-help</strong> - Mostra questo aiuto</li>
            </ul>
          </div>
        `;

        ChatMessage.create({
          content: helpText,
          speaker: { alias: 'Sistema Risse' },
          whisper: [game.user.id]
        });
        return false;
      }
    };

    Hooks.on('chatMessage', (_chatLog, message) => {
      const [command] = message.split(' ');
      const handler = handlers[command];
      if (!handler) return true;
      handler(message);
      return false;
    });
    // TODO: Migrare al sistema unificato di gestione comandi quando disponibile
  }

  static _createMacro() {
    const macroData = {
      name: 'Gestione Risse',
      type: 'script',
      scope: 'global',
      command: `
// Macro per Gestione Risse
if (!game.user.isGM) {
  ui.notifications.error("Solo il GM può utilizzare questa macro!");
} else {
  const tokens = canvas.tokens.controlled;

  if (window.TavernBrawlSystem.activeBrawl) {
    // Rissa già attiva - mostra opzioni
    new foundry.appv1.sheets.Dialog({
      title: "Rissa in Corso",
      content: \`
        <div class="form-group">
          <h3>Rissa Attiva</h3>
          <p>Scegli un'azione:</p>
          <button id="pericolo-btn" class="button">Pericolo Vagante</button>
          <button id="end-btn" class="button">Termina Rissa</button>
        </div>
      \`,
      buttons: {
        close: { label: "Chiudi" }
      },
      render: html => {
        html.find('#pericolo-btn').click(() => {
          window.TavernBrawlSystem.activatePericoloVagante();
        });
        html.find('#end-btn').click(() => {
          window.TavernBrawlSystem.endBrawl();
        });
      }
    }).render(true);
  } else if (tokens.length >= 2) {
    // Token selezionati - inizia rissa
    window.TavernBrawlSystem.startBrawl();
  } else if (tokens.length === 1) {
    // Un token - azioni individuali
    const actor = tokens[0].actor;
    new foundry.appv1.sheets.Dialog({
      title: \`Azioni Rissa - \${actor.name}\`,
      content: \`
        <div class="form-group">
          <h3>Azioni Disponibili</h3>
          <button id="saccagnata-btn" class="button">Saccagnata</button>
          <button id="raccogliere-btn" class="button">Raccogliere Oggetto</button>
        </div>
      \`,
      buttons: {
        close: { label: "Chiudi" }
      },
      render: html => {
        html.find('#saccagnata-btn').click(() => {
          const targets = game.user.targets;
          if (targets.size === 1) {
            window.TavernBrawlSystem.executeSaccagnata(actor, Array.from(targets)[0]);
          } else {
            ui.notifications.warn("Seleziona un bersaglio!");
          }
        });
        html.find('#raccogliere-btn').click(() => {
          new foundry.appv1.sheets.Dialog({
            title: "Tipo Oggetto",
            content: \`<p>Che tipo di oggetto vuoi raccogliere?</p>\`,
            buttons: {
              comune: {
                label: "Comune",
                callback: () => window.TavernBrawlSystem.pickUpProp(actor, "comune")
              },
              epico: {
                label: "Epico",
                callback: () => window.TavernBrawlSystem.pickUpProp(actor, "epico")
              }
            }
          }).render(true);
        });
      }
    }).render(true);
  } else {
    ui.notifications.warn("Seleziona almeno 2 token per iniziare una rissa!");
  }
}
      `,
      img: 'icons/skills/melee/unarmed-punch-fist.webp',
      flags: {
        'brancalonia-bigat': {
          isSystemMacro: true,
          version: '1.0'
        }
      }
    };

    // Verifica se la macro esiste già
    const existingMacro = game?.macros?.find(m => m.name === macroData.name && m.flags['brancalonia-bigat']?.isSystemMacro);

    if (!existingMacro) {
      Macro.create(macroData).then(() => {
        TavernBrawlSystem.statistics.errors.length = 0; // Reset su successo
        TavernBrawlSystem._state.macrosCreated = true;
        logger.info(TavernBrawlSystem.MODULE_NAME, '✅ Macro Gestione Risse creata');
      }).catch((error) => {
        logger.debug?.(TavernBrawlSystem.MODULE_NAME, 'Macro Gestione Risse già esistente');
      });
    }

    // Crea macro aggiuntive se richiesto
    if (game.settings.get('brancalonia-bigat', 'brawlAutoMacros')) {
      TavernBrawlSystem._createAdditionalMacros();
    }
  }

  static _createAdditionalMacros() {
    const additionalMacros = [
      {
        name: 'Saccagnata',
        type: 'script',
        img: 'icons/skills/melee/punch-fist-white.webp',
        command: `
const tokens = canvas.tokens.controlled;
const targets = game.user.targets;

if (tokens.length !== 1) {
  ui.notifications.error("Seleziona un solo token attaccante!");
} else if (targets.size !== 1) {
  ui.notifications.error("Seleziona un solo bersaglio!");
} else {
  const actor = tokens[0].actor;
  const target = Array.from(targets)[0];
  window.TavernBrawlSystem.executeSaccagnata(actor, target);
}
        `
      },
      {
        name: 'Raccogliere Oggetto',
        type: 'script',
        img: 'icons/environment/furniture/chair-wooden.webp',
        command: `
const tokens = canvas.tokens.controlled;
if (tokens.length !== 1) {
  ui.notifications.error("Seleziona un solo token!");
} else {
  const actor = tokens[0].actor;
  new foundry.appv1.sheets.Dialog({
    title: "Raccogliere Oggetto di Scena",
    content: "<p>Che tipo di oggetto vuoi raccogliere?</p>",
    buttons: {
      comune: {
        label: "Comune (azione bonus)",
        callback: () => window.TavernBrawlSystem.pickUpProp(actor, "comune")
      },
      epico: {
        label: "Epico (azione)",
        callback: () => window.TavernBrawlSystem.pickUpProp(actor, "epico")
      }
    }
  }).render(true);
}
        `
      }
    ];

    additionalMacros.forEach(macroData => {
      const existing = game?.macros?.find(m => m.name === macroData.name);
      if (!existing) {
        Macro.create(macroData);
      }
    });
  }

  /**
   * Inizia una rissa (sistema corretto dal manuale)
   * @returns {Promise<void>}
   */
  async startBrawl() {
    try {
      if (this.activeBrawl) {
        logger.warn(TavernBrawlSystem.MODULE_NAME, 'Tentativo di iniziare rissa ma già attiva');
        ui.notifications.warn("C'è già una rissa in corso!");
        return;
      }

      TavernBrawlSystem.statistics.brawlsStarted++;
      logger.info(TavernBrawlSystem.MODULE_NAME, '⚔️ Inizio rissa...');

    // Chiama hook per background-privileges (Attaccabrighe)
    const participants = canvas.tokens.controlled.map(t => t.actor).filter(a => a);
    for (const actor of participants) {
      Hooks.callAll('brancalonia.brawlStart', actor);
    }

    // Seleziona i partecipanti
    const tokens = canvas.tokens.controlled;
    if (tokens.length === 0) {
      ui.notifications.warn('Seleziona i token che parteciperanno alla rissa!');
      return;
    }

    // Crea un nuovo combattimento marcato come rissa
    const combat = await game.combats?.documentClass?.create({
      scene: canvas.scene?.id,
      active: true,
      flags: {
        brancalonia: {
          isBrawl: true,
          pericoliVaganti: []
        }
      }
    });

    // Aggiungi i combattenti
    for (const token of tokens) {
      await combat.createEmbeddedDocuments('Combatant', [{
        tokenId: token.id,
        actorId: token.actor.id,
        initiative: null
      }]);

      // Inizializza dati rissa per il partecipante
      this.brawlParticipants.set(token.actor.id, {
        actor: token.actor,
        batoste: 0,
        slotMossaUsati: 0,
        slotMossaMax: this._getSlotMossa(token.actor),
        mosse: await this._getMosseDisponibili(token.actor),
        oggettoScena: null,
        condizioni: []
      });
    }

    this.activeBrawl = true;
    this.brawlCombat = combat;

    // Messaggio di inizio rissa
    await ChatMessage.create({
      content: `
        <div class="brancalonia-brawl-start" style="border: 2px solid #8b4513; padding: 10px; background: #f4e4bc;">
          <h2 style="color: #8b4513; text-align: center;">⚔️ RISSA! ⚔️</h2>
          <p style="text-align: center; font-style: italic;">
            "Né per fame né pe'l rame, mai si snudino le lame"
          </p>
          <hr>
          <h3>Regole della Rissa:</h3>
          <ul>
            <li><strong>Movimento:</strong> Generico, ovunque nell'ambiente</li>
            <li><strong>Danni:</strong> Si infliggono BATOSTE, non punti ferita</li>
            <li><strong>Saccagnata:</strong> Attacco base (For + competenza), 1 batosta</li>
            <li><strong>Mosse:</strong> Azioni speciali che consumano slot mossa</li>
            <li><strong>Oggetti di Scena:</strong> Comuni (bonus) o Epici (effetti speciali)</li>
            <li><strong>KO:</strong> A 6 batoste sei incosciente</li>
          </ul>
          <hr>
          <p><strong>Partecipanti:</strong> ${tokens.map(t => t.actor.name).join(', ')}</p>
        </div>
      `,
      speaker: { alias: 'Sistema Rissa' }
    });

    // Chiedi se aggiungere Pericoli Vaganti
    const usePericoli = await this._askForPericoliVaganti();
    if (usePericoli) {
      await this._setupPericoliVaganti(combat);
    }

    // Inizia il combattimento
    await combat.startCombat();
      
      logger.info(TavernBrawlSystem.MODULE_NAME, `✅ Rissa iniziata con ${tokens.length} partecipanti`);
    } catch (error) {
      TavernBrawlSystem.statistics.errors.push({ 
        type: 'startBrawl', 
        message: error.message, 
        timestamp: Date.now() 
      });
      logger.error(TavernBrawlSystem.MODULE_NAME, 'Errore iniziando rissa', error);
      ui.notifications.error('Errore durante inizio rissa');
    }
  }

  /**
   * Mostra le azioni disponibili per il turno corrente
   * @param {Actor} actor - Attore del turno corrente
   * @returns {Promise<void>}
   */
  async _showBrawlActions(actor) {
    const participantData = this.brawlParticipants.get(actor.id);
    if (!participantData) return;

    const content = `
      <div class="brancalonia-brawl-turn" style="border: 1px solid #654321; padding: 10px; background: #faf8f3;">
        <h3>Turno di ${actor.name}</h3>
        <p><strong>Batoste:</strong> ${participantData.batoste}/6 ${this._getBatostaStatus(participantData.batoste)}</p>
        <p><strong>Slot Mossa:</strong> ${participantData.slotMossaMax - participantData.slotMossaUsati}/${participantData.slotMossaMax}</p>
        ${participantData.oggettoScena ? `<p><strong>In mano:</strong> ${participantData.oggettoScena}</p>` : ''}
        <hr>
        <h4>Azioni Disponibili:</h4>
        <ul>
          <li><strong>Saccagnata:</strong> Attacco base (For + comp), 1 batosta</li>
          <li><strong>Raccogliere Oggetto:</strong> Comune (bonus) o Epico (azione)</li>
          ${participantData.slotMossaUsati < participantData.slotMossaMax ?
    `<li><strong>Usare Mossa:</strong> ${participantData.mosse.map(m => m.name).join(', ')}</li>` : ''}
          ${actor.system.details.level >= 6 ? '<li><strong>Asso nella Manica:</strong> 1 volta per rissa</li>' : ''}
        </ul>
      </div>
    `;

    await ChatMessage.create({
      content,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  /**
   * Esegue una saccagnata
   * @param {Actor} actor - Attaccante
   * @param {Token} target - Bersaglio
   * @returns {Promise<void>}
   */
  async executeSaccagnata(actor, target) {
    TavernBrawlSystem.statistics.saccagnateExecuted++;
    logger.debug?.(TavernBrawlSystem.MODULE_NAME, `Saccagnata: ${actor.name} -> ${target.actor.name}`);
    
    const attackRoll = await new Roll(
      `1d20 + @str + @prof`,
      {
        str: actor.system.abilities.str.mod,
        prof: actor.system.attributes.prof
      }
    ).evaluate();

    await attackRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: 'Saccagnata!'
    });

    if (attackRoll.total >= target.actor.system.attributes.ac.value) {
      const batoste = attackRoll.dice[0].total === 20 ? 2 : 1; // Critico = doppie batoste
      await this._applyBatoste(target.actor, batoste);

      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> colpisce ${target.actor.name} con una saccagnata! ${batoste} batost${batoste > 1 ? 'e' : 'a'}!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    } else {
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> manca ${target.actor.name} con la saccagnata!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }

  /**
   * Esegue una mossa
   * @param {Actor} actor - Attore che esegue la mossa
   * @param {Actor|Token} target - Bersaglio (opzionale)
   * @param {string} mossaKey - Chiave della mossa
   * @returns {Promise<void>}
   */
  async _executeMossa(actor, target, mossaKey) {
    const participantData = this.brawlParticipants.get(actor.id);
    if (!participantData) return;

    // Verifica slot mossa
    if (participantData.slotMossaUsati >= participantData.slotMossaMax) {
      logger.warn(TavernBrawlSystem.MODULE_NAME, `${actor.name} non ha slot mossa disponibili`);
      ui.notifications.warn('Non hai più slot mossa disponibili!');
      return;
    }

    TavernBrawlSystem.statistics.mosseExecuted++;
    logger.debug?.(TavernBrawlSystem.MODULE_NAME, `Mossa "${mossaKey}" eseguita da ${actor.name}`);

    // Consuma slot mossa (alcune mosse sono reazioni e non consumano)
    const isReazione = [
      'buttafuori', 'testataDiMattone', 'schiaffoveggenza', // Reazioni generiche/magiche
      'kuFu', 'contrattacco', // Reazioni mosse di classe
      'puffSparito', 'trappolone' // Reazioni assi nella manica
    ].includes(mossaKey);
    if (!isReazione) {
      participantData.slotMossaUsati++;
    }

    // Implementazione completa mosse
    switch (mossaKey) {
      // ========== MOSSE GENERICHE ==========
      case 'buttafuori':
        await this._mossaButtafuori(actor, target);
        break;
      
      case 'schianto':
        await this._mossaSchianto(actor, target);
        break;
      
      case 'finta':
        await this._mossaFinta(actor);
        break;
      
      case 'brodagliaInFaccia':
        await this._mossaBrodagliaInFaccia(actor, target);
        break;
      
      case 'ghigliottina':
        await this._mossaGhigliottina(actor, target);
        break;
      
      case 'fracassateste':
        await this._mossaFracassateste(actor, target);
        break;
      
      case 'allaPugna':
        await this._mossaAllaPugna(actor);
        break;
      
      case 'sottoIlTavolo':
        await this._mossaSottoIlTavolo(actor);
        break;
      
      case 'sgambetto':
        await this._mossaSgambetto(actor, target);
        break;
      
      case 'giuLeBraghe':
        await this._mossaGiuLeBraghe(actor, target);
        break;
      
      case 'pugnoneInTesta':
        await this._mossaPugnoneInTesta(actor, target);
        break;
      
      case 'testataDiMattone':
        await this._mossaTestataDiMattone(actor, target);
        break;
      
      // ========== MOSSE MAGICHE ==========
      case 'protezioneDalMenare':
        await this._mossaProtezioneDalMenare(actor, target);
        break;
      
      case 'spruzzoVenefico':
        await this._mossaSpruzzoVenefico(actor, target);
        break;
      
      case 'urlaDissennanti':
        await this._mossaUrlaDissennanti(actor, target);
        break;
      
      case 'laMagna':
        await this._mossaLaMagna(actor, target);
        break;
      
      case 'sguardoGhiacciante':
        await this._mossaSguardoGhiacciante(actor, target);
        break;
      
      case 'pugnoIncantato':
        await this._mossaPugnoIncantato(actor, target);
        break;
      
      case 'schiaffoveggenza':
        await this._mossaSchiaffoveggenza(actor, target);
        break;
      
      case 'sediataSpiriturale':
        await this._mossaSediataSpiriturale(actor);
        break;
      
      // ========== MOSSE DI CLASSE ==========
      case 'rissaFuriosa':
        await this._mossaRissaFuriosa(actor);
        break;
      
      case 'kuFu':
        await this._mossaKuFu(actor, target);
        break;
      
      case 'ossoSacro':
        await this._mossaOssoSacro(actor, target);
        break;
      
      case 'schiaffoAnimale':
        await this._mossaSchiaffoAnimale(actor, target);
        break;
      
      case 'contrattacco':
        await this._mossaContrattacco(actor, target);
        break;
      
      case 'mossaFurtiva':
        await this._mossaMossaFurtiva(actor);
        break;
      
      case 'raffichaSchiaffoni':
        await this._mossaRaffichaSchiaffoni(actor, target);
        break;
      
      case 'punizioneDiVino':
        await this._mossaPunizioneDiVino(actor, target);
        break;
      
      case 'richiamoDellForesta':
        await this._mossaRichiamoDellForesta(actor, target);
        break;
      
      case 'saccagnataArcana':
        await this._mossaSaccagnataArcana(actor, target);
        break;
      
      // ========== ASSI NELLA MANICA ==========
      case 'viuuulenza':
        await this._assoViuuulenza(actor);
        break;
      
      case 'urloStraziaugola':
        await this._assoUrloStraziaugola(actor);
        break;
      
      case 'donnaLama':
        await this._assoDonnaLama(actor);
        break;
      
      case 'nubeDiPolline':
        await this._assoNubeDiPolline(actor);
        break;
      
      case 'pugnoVorpal':
        await this._assoPugnoVorpal(actor, target);
        break;
      
      case 'puffSparito':
        await this._assoPuffSparito(actor, target);
        break;
      
      case 'pallaDiCuoco':
        await this._assoPallaDiCuoco(actor);
        break;
      
      case 'rosarioSanCagnate':
        await this._assoRosarioSanCagnate(actor, target);
        break;
      
      case 'evocareCavalcatura':
        await this._assoEvocareCavalcatura(actor, target);
        break;
      
      case 'trappolone':
        await this._assoTrappolone(actor, target);
        break;
      
      case 'sfigaSuprema':
        await this._assoSfigaSuprema(actor, target);
        break;
      
      case 'toccoDelRimorso':
        await this._assoToccoDelRimorso(actor);
        break;
      
      default:
        // Mossa non implementata - messaggio generico
        await ChatMessage.create({
          content: `<p><strong>${actor.name}</strong> esegue ${mossaKey}!</p>`,
          speaker: ChatMessage.getSpeaker({ actor })
        });
    }
  }

  // ========== IMPLEMENTAZIONE MOSSE GENERICHE ==========
  
  async _mossaButtafuori(actor, target) {
    const roll = await new Roll('1d20 + @mod', {
      mod: Math.max(actor.system.abilities.str.mod, actor.system.abilities.dex.mod)
    }).evaluate();
    
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: 'Buttafuori!'
    });
    
    if (roll.total >= target.system.attributes.ac.value) {
      await target.createEmbeddedDocuments('ActiveEffect', [{
        name: 'Stordito (Buttafuori)',
        icon: 'icons/svg/daze.svg',
        duration: { rounds: 1 },
        changes: [{
          key: 'flags.midi-qol.disadvantage.attack.all',
          mode: 0,
          value: 1
        }]
      }]);
      
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> stordisce ${target.name} con un Buttafuori!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }
  
  async _mossaSchianto(actor, target) {
    const roll = await new Roll('1d20 + @mod', {
      mod: Math.max(actor.system.abilities.str.mod, actor.system.abilities.con.mod)
    }).evaluate();
    
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: 'Schianto!'
    });
    
    if (roll.total >= target.system.attributes.ac.value) {
      // Applica 1 batosta + stordito e prono al bersaglio
      const targetData = this.brawlParticipants.get(target.id);
      if (targetData) {
        await this._applyBatoste(target, 1);
      }
      
      await target.createEmbeddedDocuments('ActiveEffect', [{
        name: 'Prono + Stordito',
        icon: 'icons/svg/falling.svg',
        duration: { rounds: 1 },
        statuses: ['prone']
      }]);
      
      // Attore subisce 1 batosta
      const actorData = this.brawlParticipants.get(actor.id);
      if (actorData) {
        await this._applyBatoste(actor, 1);
      }
      
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> esegue uno Schianto su ${target.name}! Entrambi subiscono danni!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }
  
  async _mossaFinta(actor) {
    await actor.createEmbeddedDocuments('ActiveEffect', [{
      name: 'Finta (Svenuto)',
      icon: 'icons/svg/unconscious.svg',
      duration: { rounds: 999 },
      flags: { brancalonia: { finta: true } }
    }]);
    
    await ChatMessage.create({
      content: `<p><strong>${actor.name}</strong> finge di essere svenuto! Non può essere bersagliato finché non attacca.</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }
  
  async _mossaBrodagliaInFaccia(actor, target) {
    const roll = await new Roll('1d20 + @mod', {
      mod: Math.max(actor.system.abilities.dex.mod, actor.system.abilities.wis.mod)
    }).evaluate();
    
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: 'Brodaglia in Faccia!'
    });
    
    if (roll.total >= target.system.attributes.ac.value) {
      await target.createEmbeddedDocuments('ActiveEffect', [{
        name: 'Accecato (Brodaglia)',
        icon: 'icons/svg/blind.svg',
        duration: { rounds: 1 },
        changes: [{
          key: 'flags.midi-qol.disadvantage.attack.all',
          mode: 0,
          value: 1
        }]
      }]);
      
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> acceca ${target.name} con brodaglia in faccia!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }
  
  async _mossaGhigliottina(actor, target) {
    const roll = await new Roll('1d20 + @mod', {
      mod: Math.max(actor.system.abilities.str.mod, actor.system.abilities.dex.mod)
    }).evaluate();
    
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: 'Ghigliottina!'
    });
    
    if (roll.total >= target.system.attributes.ac.value) {
      const targetData = this.brawlParticipants.get(target.id);
      if (targetData) {
        await this._applyBatoste(target, 1);
      }
      
      await target.createEmbeddedDocuments('ActiveEffect', [{
        name: 'Prono',
        icon: 'icons/svg/falling.svg',
        duration: { rounds: 1 },
        statuses: ['prone']
      }]);
      
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> mette a terra ${target.name} con una Ghigliottina!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }
  
  async _mossaFracassateste(actor, targets) {
    await ChatMessage.create({
      content: `<p><strong>${actor.name}</strong> esegue un Fracassateste! Seleziona due bersagli per applicare 1 batosta ciascuno.</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }
  
  async _mossaAllaPugna(actor) {
    const allies = this.brawlParticipants.entries();
    for (const [id, data] of allies) {
      if (data.actor.id !== actor.id && data.actor.hasPlayerOwner) {
        await data.actor.createEmbeddedDocuments('ActiveEffect', [{
          name: 'Alla Pugna! (Vantaggio)',
          icon: 'icons/svg/upgrade.svg',
          duration: { rounds: 1 },
          changes: [{
            key: 'flags.midi-qol.advantage.attack.all',
            mode: 0,
            value: 1
          }]
        }]);
      }
    }
    
    await ChatMessage.create({
      content: `<p><strong>${actor.name}</strong> grida "ALLA PUGNA!" Gli alleati hanno vantaggio al prossimo attacco!</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }
  
  async _mossaSottoIlTavolo(actor) {
    await actor.createEmbeddedDocuments('ActiveEffect', [{
      name: 'Sotto il Tavolo (Copertura)',
      icon: 'icons/svg/shield.svg',
      duration: { rounds: 1 },
      changes: [
        {
          key: 'system.attributes.ac.bonus',
          mode: 2,
          value: 5
        },
        {
          key: 'flags.midi-qol.advantage.ability.save.dex',
          mode: 0,
          value: 1
        }
      ]
    }]);
    
    await ChatMessage.create({
      content: `<p><strong>${actor.name}</strong> si nasconde sotto il tavolo! +5 CA e vantaggio ai TS Destrezza!</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }
  
  async _mossaSgambetto(actor, target) {
    const roll = await new Roll('1d20 + @mod', {
      mod: Math.max(actor.system.abilities.dex.mod, actor.system.abilities.int.mod)
    }).evaluate();
    
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: 'Sgambetto!'
    });
    
    if (roll.total >= target.system.attributes.ac.value) {
      await target.createEmbeddedDocuments('ActiveEffect', [{
        name: 'Prono',
        icon: 'icons/svg/falling.svg',
        duration: { rounds: 1 },
        statuses: ['prone']
      }]);
      
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> fa lo sgambetto a ${target.name}!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }
  
  async _mossaGiuLeBraghe(actor, target) {
    const roll = await new Roll('1d20 + @mod', {
      mod: Math.max(actor.system.abilities.dex.mod, actor.system.abilities.cha.mod)
    }).evaluate();
    
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: 'Giù le Braghe!'
    });
    
    if (roll.total >= target.system.attributes.ac.value) {
      await target.createEmbeddedDocuments('ActiveEffect', [{
        name: 'Trattenuto (Braghe)',
        icon: 'icons/svg/net.svg',
        duration: { rounds: 1 },
        statuses: ['restrained']
      }]);
      
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> trattiene ${target.name} tirandogli giù le braghe!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }
  
  async _mossaPugnoneInTesta(actor, target) {
    const roll = await new Roll('1d20 + @mod', {
      mod: Math.max(actor.system.abilities.str.mod, actor.system.abilities.con.mod)
    }).evaluate();
    
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: 'Pugnone in Testa!'
    });
    
    if (roll.total >= target.system.attributes.ac.value) {
      const targetData = this.brawlParticipants.get(target.id);
      if (targetData) {
        await this._applyBatoste(target, 1);
      }
      
      await target.createEmbeddedDocuments('ActiveEffect', [{
        name: 'Incapacitato',
        icon: 'icons/svg/unconscious.svg',
        duration: { rounds: 1 },
        statuses: ['incapacitated']
      }]);
      
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> colpisce ${target.name} con un Pugnone in Testa!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }
  
  async _mossaTestataDiMattone(actor, target) {
    const roll = await new Roll('1d20 + @mod', {
      mod: Math.max(actor.system.abilities.str.mod, actor.system.abilities.con.mod)
    }).evaluate();
    
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: 'Testata di Mattone!'
    });
    
    if (roll.total >= target.system.attributes.ac.value) {
      const targetData = this.brawlParticipants.get(target.id);
      if (targetData) {
        await this._applyBatoste(target, 1);
      }
      
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> risponde con una Testata di Mattone!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }
  
  // ========== IMPLEMENTAZIONE MOSSE MAGICHE ==========
  
  async _mossaProtezioneDalMenare(actor, target) {
    await target.createEmbeddedDocuments('ActiveEffect', [{
      name: 'Protezione dal Menare',
      icon: 'icons/svg/shield.svg',
      duration: { rounds: 2 },
      changes: [{
        key: 'flags.midi-qol.grants.disadvantage.attack.all',
        mode: 0,
        value: 1
      }]
    }]);
    
    await ChatMessage.create({
      content: `<p><strong>${actor.name}</strong> lancia Protezione dal Menare su ${target.name}! Gli attacchi contro di lui hanno svantaggio!</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }
  
  async _mossaSpruzzoVenefico(actor, target) {
    const roll = await new Roll('1d20 + @mod', {
      mod: Math.max(
        actor.system.abilities.int.mod,
        actor.system.abilities.wis.mod,
        actor.system.abilities.cha.mod
      )
    }).evaluate();
    
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: 'Spruzzo Venefico!'
    });
    
    if (roll.total >= target.system.attributes.ac.value) {
      const targetData = this.brawlParticipants.get(target.id);
      if (targetData) {
        await this._applyBatoste(target, 1);
      }
      
      await target.createEmbeddedDocuments('ActiveEffect', [{
        name: 'Avvelenato',
        icon: 'icons/svg/poison.svg',
        duration: { rounds: 2 },
        statuses: ['poisoned']
      }]);
      
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> avvelena ${target.name} con uno Spruzzo Venefico!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }
  
  async _mossaUrlaDissennanti(actor, target) {
    await target.createEmbeddedDocuments('ActiveEffect', [{
      name: 'Spaventato',
      icon: 'icons/svg/terror.svg',
      duration: { rounds: 1 },
      statuses: ['frightened']
    }]);
    
    await ChatMessage.create({
      content: `<p><strong>${actor.name}</strong> emette Urla Dissennanti! ${target.name} è spaventato!</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }
  
  async _mossaLaMagna(actor, target) {
    await target.createEmbeddedDocuments('ActiveEffect', [{
      name: 'Affascinato',
      icon: 'icons/svg/heal.svg',
      duration: { rounds: 1 },
      statuses: ['charmed']
    }]);
    
    await ChatMessage.create({
      content: `<p><strong>${actor.name}</strong> usa La Magna! ${target.name} è affascinato!</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }
  
  async _mossaSguardoGhiacciante(actor, target) {
    await target.createEmbeddedDocuments('ActiveEffect', [{
      name: 'Sguardo Ghiacciante (Protezione)',
      icon: 'icons/svg/ice-aura.svg',
      duration: { rounds: 1 },
      flags: { brancalonia: { immuneBatoste: true } }
    }]);
    
    await ChatMessage.create({
      content: `<p><strong>${actor.name}</strong> fissa ${target.name} con uno Sguardo Ghiacciante! Non subisce batoste o condizioni fino al prossimo turno!</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }
  
  async _mossaPugnoIncantato(actor, targets) {
    await ChatMessage.create({
      content: `<p><strong>${actor.name}</strong> scaglia un Pugno Incantato! Seleziona tre bersagli per applicare 1 batosta ciascuno.</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }
  
  async _mossaSchiaffoveggenza(actor, attacker) {
    await attacker.createEmbeddedDocuments('ActiveEffect', [{
      name: 'Schiaffoveggenza (Svantaggio)',
      icon: 'icons/svg/downgrade.svg',
      duration: { turns: 1 },
      changes: [{
        key: 'flags.midi-qol.disadvantage.attack.all',
        mode: 0,
        value: 1
      }]
    }]);
    
    await ChatMessage.create({
      content: `<p><strong>${actor.name}</strong> prevede l'attacco! ${attacker.name} ha svantaggio!</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }
  
  async _mossaSediataSpiriturale(actor) {
    const participantData = this.brawlParticipants.get(actor.id);
    if (participantData?.oggettoScena?.tipo === 'comune') {
      participantData.oggettoScena.tipo = 'epico';
      
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> incanta il suo oggetto con una Sediata Spiriturale! Ora è EPICO!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    } else {
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> tenta una Sediata Spiriturale ma non ha un oggetto comune!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }

  // ========== IMPLEMENTAZIONE MOSSE DI CLASSE ==========

  async _mossaRissaFuriosa(actor) {
    // Barbaro: +1 batosta a tutte le mosse e saccagnate per questo turno
    await actor.createEmbeddedDocuments('ActiveEffect', [{
      name: 'Rissa Furiosa',
      icon: 'icons/magic/fire/flame-burning-hand-fist.webp',
      duration: { rounds: 1 },
      flags: { brancalonia: { rissaFuriosa: true } }
    }]);

    await ChatMessage.create({
      content: `
        <div style="border: 2px solid #a00; padding: 8px; background: #fee; border-radius: 5px;">
          <h4 style="color: #a00; margin: 0;">💢 RISSA FURIOSA!</h4>
          <p><strong>${actor.name}</strong> entra in furia!</p>
          <p><em>Per questo turno, tutte le mosse e saccagnate infliggono +1 batosta!</em></p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  async _mossaKuFu(actor, attacker) {
    // Bardo: Reazione - Tiro Carisma per far cambiare bersaglio
    const roll = await new Roll('1d20 + @cha', {
      cha: actor.system.abilities.cha.mod
    }).evaluate({ async: true });

    await roll.toMessage({
      flavor: `<strong>${actor.name}</strong> usa Ku Fu? (Carisma)`,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    if (roll.total >= 12) {
      await ChatMessage.create({
        content: `
          <p><strong>${actor.name}</strong> confonde <strong>${attacker.name}</strong> con strane movenze!</p>
          <p><em>L'attacco manca completamente e colpisce qualcun altro!</em></p>
        `,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    } else {
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> tenta il Ku Fu ma <strong>${attacker.name}</strong> non ci casca!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }

  async _mossaOssoSacro(actor, target) {
    // Chierico: Tiro Saggezza - 1 batosta + prono
    const roll = await new Roll('1d20 + @wis', {
      wis: actor.system.abilities.wis.mod
    }).evaluate({ async: true });

    await roll.toMessage({
      flavor: `<strong>${actor.name}</strong> lancia l'Osso Sacro! (Saggezza)`,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    if (roll.total >= 12) {
      await this._applyBatoste(target, 1);
      
      await target.createEmbeddedDocuments('ActiveEffect', [{
        name: 'Prono',
        icon: 'icons/svg/falling.svg',
        statuses: ['prone'],
        duration: { rounds: 1 }
      }]);

      await ChatMessage.create({
        content: `<p><strong>${target.name}</strong> è colpito dall'osso sacro: 1 batosta e cade prono!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    } else {
      await ChatMessage.create({
        content: `<p>L'osso sacro manca <strong>${target.name}</strong>!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }

  async _mossaSchiaffoAnimale(actor, target) {
    // Druido: Tiro Saggezza - 1 batosta + spaventato
    const roll = await new Roll('1d20 + @wis', {
      wis: actor.system.abilities.wis.mod
    }).evaluate({ async: true });

    await roll.toMessage({
      flavor: `<strong>${actor.name}</strong> evoca uno Schiaffo Animale! (Saggezza)`,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    if (roll.total >= 12) {
      await this._applyBatoste(target, 1);
      
      await target.createEmbeddedDocuments('ActiveEffect', [{
        name: 'Spaventato',
        icon: 'icons/svg/terror.svg',
        statuses: ['frightened'],
        duration: { rounds: 2 }
      }]);

      await ChatMessage.create({
        content: `<p>Un grosso artiglio spettrale colpisce <strong>${target.name}</strong>: 1 batosta e spaventato!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    } else {
      await ChatMessage.create({
        content: `<p>Lo schiaffo animale manca <strong>${target.name}</strong>!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }

  async _mossaContrattacco(actor, attacker) {
    // Guerriero: Reazione - Saccagnata con svantaggio
    const roll = await new Roll('2d20kl + @str + @prof', {
      str: actor.system.abilities.str.mod,
      prof: actor.system.attributes.prof
    }).evaluate({ async: true });

    await roll.toMessage({
      flavor: `<strong>${actor.name}</strong> contrattacca! (con svantaggio)`,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    if (roll.total >= 12) {
      const isCrit = roll.dice[0].results.some(r => r.result === 20);
      const batoste = isCrit ? 2 : 1;
      
      await this._applyBatoste(attacker, batoste);
      
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> contrattacca e colpisce <strong>${attacker.name}</strong>: ${batoste} batosta${batoste > 1 ? 'e' : ''}!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    } else {
      await ChatMessage.create({
        content: `<p>Il contrattacco di <strong>${actor.name}</strong> manca!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }

  async _mossaMossaFurtiva(actor) {
    // Ladro: Azione bonus - +1 batosta e vantaggio alla prossima mossa
    await actor.createEmbeddedDocuments('ActiveEffect', [{
      name: 'Mossa Furtiva',
      icon: 'icons/magic/perception/eye-slit-orange.webp',
      duration: { rounds: 1 },
      flags: { brancalonia: { mossaFurtiva: true } }
    }]);

    await ChatMessage.create({
      content: `
        <p><strong>${actor.name}</strong> si posiziona furtivamente!</p>
        <p><em>La prossima mossa/saccagnata avrà vantaggio e infliggerà +1 batosta!</em></p>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  async _mossaRaffichaSchiaffoni(actor, target) {
    // Monaco: Azione bonus - Due saccagnate
    for (let i = 1; i <= 2; i++) {
      const roll = await new Roll('1d20 + @str + @prof', {
        str: actor.system.abilities.str.mod,
        prof: actor.system.attributes.prof
      }).evaluate({ async: true });

      await roll.toMessage({
        flavor: `<strong>${actor.name}</strong> - Schiaffone ${i}/2`,
        speaker: ChatMessage.getSpeaker({ actor })
      });

      if (roll.total >= 12) {
        await this._applyBatoste(target, 1);
      }
    }

    await ChatMessage.create({
      content: `<p><strong>${actor.name}</strong> scatena una raffica di schiaffoni su <strong>${target.name}</strong>!</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  async _mossaPunizioneDiVino(actor, target) {
    // Paladino: Azione bonus - Tiro Forza - 1 batosta + accecato
    const roll = await new Roll('1d20 + @str', {
      str: actor.system.abilities.str.mod
    }).evaluate({ async: true });

    await roll.toMessage({
      flavor: `<strong>${actor.name}</strong> usa Punizione di Vino! (Forza)`,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    if (roll.total >= 12) {
      await this._applyBatoste(target, 1);
      
      await target.createEmbeddedDocuments('ActiveEffect', [{
        name: 'Accecato',
        icon: 'icons/svg/blind.svg',
        statuses: ['blinded'],
        duration: { rounds: 1 }
      }]);

      await ChatMessage.create({
        content: `<p>Il vino sacro colpisce <strong>${target.name}</strong> negli occhi: 1 batosta e accecato!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    } else {
      await ChatMessage.create({
        content: `<p>La Punizione di Vino manca <strong>${target.name}</strong>!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }

  async _mossaRichiamoDellForesta(actor, target) {
    // Ranger: Lancia esca - Bersaglio trattenuto da animale
    await target.createEmbeddedDocuments('ActiveEffect', [{
      name: 'Trattenuto (Animale)',
      icon: 'icons/creatures/abilities/paw-print-orange.webp',
      statuses: ['restrained'],
      duration: { rounds: 2 },
      changes: [{
        key: 'system.attributes.ac.bonus',
        mode: 2,
        value: -2
      }]
    }]);

    await ChatMessage.create({
      content: `
        <p><strong>${actor.name}</strong> lancia un'esca e richiama un animale!</p>
        <p>Un grosso cane/cinghiale afferra <strong>${target.name}</strong> e lo trattiene!</p>
        <p><em>Trattenuto per 2 turni!</em></p>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  async _mossaSaccagnataArcana(actor, target) {
    // Mago: Spendi slot mossa extra per +1 batosta a mossa magica
    const participantData = this.brawlParticipants.get(actor.id);
    
    if (participantData.slotMossaUsati < participantData.slotMossaMax - 1) {
      participantData.slotMossaUsati++; // Consuma slot extra
      
      await actor.createEmbeddedDocuments('ActiveEffect', [{
        name: 'Saccagnata Arcana',
        icon: 'icons/magic/lightning/bolt-strike-blue.webp',
        duration: { rounds: 1 },
        flags: { brancalonia: { saccagnataArcana: true } }
      }]);

      await ChatMessage.create({
        content: `
          <p><strong>${actor.name}</strong> carica le mani di energia arcana!</p>
          <p><em>La prossima mossa magica infliggerà +1 batosta! (1 slot mossa extra consumato)</em></p>
        `,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    } else {
      ui.notifications.warn('Non hai abbastanza slot mossa per Saccagnata Arcana!');
    }
  }

  // ========== IMPLEMENTAZIONE ASSI NELLA MANICA ==========

  async _assoViuuulenza(actor) {
    // Barbaro: Immunità a batoste e condizioni fino al prossimo turno
    await actor.createEmbeddedDocuments('ActiveEffect', [{
      name: 'VIUUULENZA!',
      icon: 'icons/magic/defensive/shield-barrier-flaming-diamond-red.webp',
      duration: { rounds: 1 },
      flags: { brancalonia: { viuuulenza: true } }
    }]);

    await ChatMessage.create({
      content: `
        <div style="border: 3px solid #f00; padding: 10px; background: #fdd; border-radius: 5px;">
          <h3 style="color: #f00; margin: 0; text-align: center;">💥 VIUUULENZA! 💥</h3>
          <p style="text-align: center; font-size: 1.2em;"><strong>${actor.name}</strong> diventa INARRESTABILE!</p>
          <p style="text-align: center;"><em>Immune a batoste e condizioni fino al prossimo turno!</em></p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  async _assoUrloStraziaugola(actor) {
    // Bardo: TS Costituzione o 1 batosta + incapacitato a tutti
    await ChatMessage.create({
      content: `
        <div style="border: 2px solid #4a90e2; padding: 10px; background: #e3f2fd; border-radius: 5px;">
          <h3 style="color: #4a90e2; margin: 0;">🎵 URLO STRAZIAUGOLA! 🎵</h3>
          <p><strong>${actor.name}</strong> emette un urlo terrificante!</p>
          <p><em>Tutti devono fare TS Costituzione CD 13 o subire 1 batosta + incapacitato!</em></p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    // Applica a tutti i partecipanti tranne il bardo
    for (const [actorId, data] of this.brawlParticipants) {
      if (actorId === actor.id) continue;
      
      const participant = game.actors.get(actorId);
      const saveDC = 13;
      const saveRoll = await new Roll('1d20 + @con', {
        con: participant.system.abilities.con.mod
      }).evaluate({ async: true });

      await saveRoll.toMessage({
        flavor: `TS Costituzione di ${participant.name} vs Urlo`,
        speaker: ChatMessage.getSpeaker({ actor: participant })
      });

      if (saveRoll.total < saveDC) {
        await this._applyBatoste(participant, 1);
        await participant.createEmbeddedDocuments('ActiveEffect', [{
          name: 'Incapacitato',
          icon: 'icons/svg/daze.svg',
          statuses: ['incapacitated'],
          duration: { rounds: 1 }
        }]);
      }
    }
  }

  async _assoDonnaLama(actor) {
    // Chierico: Un Pericolo Vagante colpisce tutti i nemici
    await ChatMessage.create({
      content: `
        <div style="border: 2px solid #ffd700; padding: 10px; background: #fffacd; border-radius: 5px;">
          <h3 style="color: #d4af37; margin: 0;">⚡ DONNA LAMA, IL TUO SERVO TI CHIAMA! ⚡</h3>
          <p><strong>${actor.name}</strong> invoca il potere divino!</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    // Attiva pericolo vagante su tutti tranne il chierico
    await this.activatePericoloVagante();
  }

  async _assoNubeDiPolline(actor) {
    // Druido: TS Costituzione o 1 batosta + avvelenato a tutti
    await ChatMessage.create({
      content: `
        <div style="border: 2px solid #8bc34a; padding: 10px; background: #f1f8e9; border-radius: 5px;">
          <h3 style="color: #689f38; margin: 0;">🌿 NUBE DI POLLINE! 🌿</h3>
          <p><strong>${actor.name}</strong> evoca una nube tossica!</p>
          <p><em>Tutti devono fare TS Costituzione CD 13 o subire 1 batosta + avvelenato!</em></p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    for (const [actorId, data] of this.brawlParticipants) {
      if (actorId === actor.id) continue;
      
      const participant = game.actors.get(actorId);
      const saveDC = 13;
      const saveRoll = await new Roll('1d20 + @con', {
        con: participant.system.abilities.con.mod
      }).evaluate({ async: true });

      await saveRoll.toMessage({
        flavor: `TS Costituzione di ${participant.name} vs Nube`,
        speaker: ChatMessage.getSpeaker({ actor: participant })
      });

      if (saveRoll.total < saveDC) {
        await this._applyBatoste(participant, 1);
        await participant.createEmbeddedDocuments('ActiveEffect', [{
          name: 'Avvelenato',
          icon: 'icons/svg/poison.svg',
          statuses: ['poisoned'],
          duration: { rounds: 3 }
        }]);
      }
    }
  }

  async _assoPugnoVorpal(actor, target) {
    // Guerriero: Saccagnata che infligge 3 batoste aggiuntive
    const roll = await new Roll('1d20 + @str + @prof', {
      str: actor.system.abilities.str.mod,
      prof: actor.system.attributes.prof
    }).evaluate({ async: true });

    await roll.toMessage({
      flavor: `<strong>${actor.name}</strong> scatena il PUGNO VORPAL!`,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    if (roll.total >= 12) {
      const isCrit = roll.dice[0].results.some(r => r.result === 20);
      const batoste = isCrit ? 5 : 4; // 1 base + 3 extra (o doppio per crit)
      
      await this._applyBatoste(target, batoste);
      
      await ChatMessage.create({
        content: `
          <div style="border: 3px solid #ff4500; padding: 10px; background: #ffe4e1; border-radius: 5px;">
            <h3 style="color: #ff4500; margin: 0;">👊 PUGNO VORPAL! 👊</h3>
            <p><strong>${target.name}</strong> è devastato dal pugno: <strong>${batoste} batoste!</strong></p>
          </div>
        `,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    } else {
      await ChatMessage.create({
        content: `<p>Il Pugno Vorpal di <strong>${actor.name}</strong> manca clamorosamente!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }

  async _assoPuffSparito(actor, attacker) {
    // Ladro: Reazione - Eviti attacco e fai saccagnata +1 batosta
    await ChatMessage.create({
      content: `<p><strong>${actor.name}</strong> scompare in una nuvola di fumo! *Puff!*</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    // Saccagnata di risposta con bonus
    const roll = await new Roll('1d20 + @str + @prof + 5', {
      str: actor.system.abilities.str.mod,
      prof: actor.system.attributes.prof
    }).evaluate({ async: true });

    await roll.toMessage({
      flavor: `<strong>${actor.name}</strong> riappare alle spalle! (con vantaggio)`,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    if (roll.total >= 12) {
      await this._applyBatoste(attacker, 2); // 1 base + 1 bonus
      
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> colpisce <strong>${attacker.name}</strong> di sorpresa: 2 batoste!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }

  async _assoPallaDiCuoco(actor) {
    // Mago: TS Destrezza o 2 batoste a tutti
    await ChatMessage.create({
      content: `
        <div style="border: 2px solid #ff6b6b; padding: 10px; background: #ffe0e0; border-radius: 5px;">
          <h3 style="color: #ff0000; margin: 0;">🔥 PALLA DI CUOCO! 🔥</h3>
          <p><strong>${actor.name}</strong> scaglia una palla di fuoco culinaria!</p>
          <p><em>Tutti devono fare TS Destrezza CD 14 o subire 2 batoste!</em></p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    for (const [actorId, data] of this.brawlParticipants) {
      if (actorId === actor.id) continue;
      
      const participant = game.actors.get(actorId);
      const saveDC = 14;
      const saveRoll = await new Roll('1d20 + @dex', {
        dex: participant.system.abilities.dex.mod
      }).evaluate({ async: true });

      await saveRoll.toMessage({
        flavor: `TS Destrezza di ${participant.name} vs Palla di Cuoco`,
        speaker: ChatMessage.getSpeaker({ actor: participant })
      });

      if (saveRoll.total < saveDC) {
        await this._applyBatoste(participant, 2);
      }
    }
  }

  async _assoRosarioSanCagnate(actor, target) {
    // Monaco: Saccagnata +1 batosta, TS Cos o KO immediato
    const roll = await new Roll('1d20 + @str + @prof', {
      str: actor.system.abilities.str.mod,
      prof: actor.system.attributes.prof
    }).evaluate({ async: true });

    await roll.toMessage({
      flavor: `<strong>${actor.name}</strong> scatena il Rosario di San Cagnate!`,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    if (roll.total >= 12) {
      await this._applyBatoste(target, 2); // 1 base + 1 bonus
      
      // TS Costituzione o KO
      const saveDC = 15;
      const saveRoll = await new Roll('1d20 + @con', {
        con: target.system.abilities.con.mod
      }).evaluate({ async: true });

      await saveRoll.toMessage({
        flavor: `TS Costituzione di ${target.name} vs KO`,
        speaker: ChatMessage.getSpeaker({ actor: target })
      });

      if (saveRoll.total < saveDC) {
        await this._applyBatoste(target, 4); // KO immediato = 6 batoste totali
        
        await ChatMessage.create({
          content: `
            <div style="border: 3px solid #000; padding: 10px; background: #fff3cd; border-radius: 5px;">
              <h3 style="color: #000; margin: 0;">☠️ KNOCKOUT! ☠️</h3>
              <p><strong>${target.name}</strong> è KO per il Rosario di San Cagnate!</p>
            </div>
          `,
          speaker: ChatMessage.getSpeaker({ actor })
        });
      } else {
        await ChatMessage.create({
          content: `<p><strong>${target.name}</strong> resiste al KO ma subisce 2 batoste!</p>`,
          speaker: ChatMessage.getSpeaker({ actor })
        });
      }
    }
  }

  async _assoEvocareCavalcatura(actor, target) {
    // Paladino: La cavalcatura fa due saccagnate e se ne va
    await ChatMessage.create({
      content: `
        <p><strong>${actor.name}</strong> evoca la sua cavalcatura!</p>
        <p><em>Un destriero spettrale carica attraverso la taverna!</em></p>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    for (let i = 1; i <= 2; i++) {
      const roll = await new Roll('1d20 + 5').evaluate({ async: true });

      await roll.toMessage({
        flavor: `Carica della Cavalcatura ${i}/2`,
        speaker: ChatMessage.getSpeaker({ actor })
      });

      if (roll.total >= 12) {
        await this._applyBatoste(target, 1);
      }
    }

    await ChatMessage.create({
      content: `<p>La cavalcatura scompare in una nuvola di luce!</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  async _assoTrappolone(actor, target) {
    // Ranger: Reazione al movimento - 2 batoste + trattenuto
    await this._applyBatoste(target, 2);
    
    await target.createEmbeddedDocuments('ActiveEffect', [{
      name: 'Trattenuto (Trappola)',
      icon: 'icons/sundries/traps/trap-jaw-metal-chain.webp',
      statuses: ['restrained'],
      duration: { rounds: 2 }
    }]);

    await ChatMessage.create({
      content: `
        <p><strong>${actor.name}</strong> aveva preparato una trappola!</p>
        <p><strong>${target.name}</strong> ci finisce dentro: 2 batoste e trattenuto!</p>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  async _assoSfigaSuprema(actor, target) {
    // Stregone: TS Saggezza o lasci cadere tutto e sei spaventato
    const saveDC = 14;
    const saveRoll = await new Roll('1d20 + @wis', {
      wis: target.system.abilities.wis.mod
    }).evaluate({ async: true });

    await saveRoll.toMessage({
      flavor: `TS Saggezza di ${target.name} vs Sfiga Suprema`,
      speaker: ChatMessage.getSpeaker({ actor: target })
    });

    if (saveRoll.total < saveDC) {
      const participantData = this.brawlParticipants.get(target.id);
      if (participantData) {
        participantData.oggettoScena = null; // Perde oggetto
      }
      
      await target.createEmbeddedDocuments('ActiveEffect', [{
        name: 'Spaventato',
        icon: 'icons/svg/terror.svg',
        statuses: ['frightened'],
        duration: { rounds: 3 }
      }]);

      await ChatMessage.create({
        content: `
          <div style="border: 2px solid #800080; padding: 10px; background: #f3e5f5; border-radius: 5px;">
            <h3 style="color: #800080; margin: 0;">✨ SFIGA SUPREMA! ✨</h3>
            <p><strong>${target.name}</strong> è colpito da sfortuna cosmica!</p>
            <p><em>Lascia cadere tutto e diventa spaventato!</em></p>
          </div>
        `,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    } else {
      await ChatMessage.create({
        content: `<p><strong>${target.name}</strong> resiste alla Sfiga Suprema!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }

  async _assoToccoDelRimorso(actor) {
    // Warlock: Chi ti colpisce subisce 1 batosta
    await actor.createEmbeddedDocuments('ActiveEffect', [{
      name: 'Tocco del Rimorso',
      icon: 'icons/magic/unholy/hand-claw-fog-green.webp',
      duration: { rounds: 3 },
      flags: { brancalonia: { toccoDelRimorso: true } }
    }]);

    await ChatMessage.create({
      content: `
        <div style="border: 2px solid #4b0082; padding: 10px; background: #f8f4ff; border-radius: 5px;">
          <h3 style="color: #4b0082; margin: 0;">👻 TOCCO DEL RIMORSO! 👻</h3>
          <p><strong>${actor.name}</strong> si avvolge di energia oscura!</p>
          <p><em>Chi lo colpisce subirà 1 batosta di rimorso!</em></p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  /**
   * Applica batoste a un bersaglio
   * @param {Actor} actor - Attore che subisce batoste
   * @param {number} amount - Numero di batoste da applicare
   * @returns {Promise<void>}
   */
  async _applyBatoste(actor, amount) {
    const participantData = this.brawlParticipants.get(actor.id);
    if (!participantData) return;

    TavernBrawlSystem.statistics.batosteTotali += amount;
    logger.debug?.(TavernBrawlSystem.MODULE_NAME, `${actor.name} subisce ${amount} batosta/e (totale: ${participantData.batoste + amount})`);

    participantData.batoste = Math.min(6, participantData.batoste + amount);

    // Applica penalità CA per ogni livello di batosta
    const caReduction = Math.min(5, participantData.batoste);

    // Crea/aggiorna effetto batoste
    const existingEffect = actor.effects.find(e => e.flags?.brancalonia?.isBatoste);
    if (existingEffect) {
      await existingEffect.update({
        name: this.batosteLevels[participantData.batoste - 1].name,
        changes: [{
          key: 'system.attributes.ac.bonus',
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: -caReduction
        }]
      });
    } else {
      await actor.createEmbeddedDocuments('ActiveEffect', [{
        name: this.batosteLevels[participantData.batoste - 1].name,
        img: 'icons/skills/wounds/injury-pain-body-orange.webp',
        changes: [{
          key: 'system.attributes.ac.bonus',
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: -caReduction
        }],
        flags: {
          brancalonia: {
            isBatoste: true,
            level: participantData.batoste
          }
        }
      }]);
    }

    // Se raggiunge 6 batoste, è KO
    if (participantData.batoste >= 6) {
      TavernBrawlSystem.statistics.koCount++;
      logger.info(TavernBrawlSystem.MODULE_NAME, `💀 ${actor.name} è KO! (6 batoste)`);
      
      await ChatMessage.create({
        content: `<h3 style="color: red;">${actor.name} è INCOSCIENTE!</h3>`,
        speaker: { alias: 'Sistema Rissa' }
      });

      // Applica condizione incosciente
      await actor.createEmbeddedDocuments('ActiveEffect', [{
        name: 'Incosciente (Rissa)',
        img: 'icons/svg/unconscious.svg',
        statuses: ['unconscious'],
        flags: { brancalonia: { brawlKO: true } }
      }]);
    }
  }

  /**
   * Raccoglie un oggetto di scena
   * @param {Actor} actor - Attore che raccoglie
   * @param {string} tipo - Tipo oggetto ('comune' o 'epico')
   * @returns {Promise<void>}
   */
  async pickUpProp(actor, tipo = 'comune') {
    const participantData = this.brawlParticipants.get(actor.id);
    if (!participantData) return;

    TavernBrawlSystem.statistics.propsUsed++;
    logger.debug?.(TavernBrawlSystem.MODULE_NAME, `${actor.name} raccoglie oggetto ${tipo}`);

    const oggettiComuni = [
      'Bottiglia', 'Brocca', 'Posate', 'Zappa', 'Candelabro',
      'Torcia', 'Fiasco', 'Sgabello', 'Attizzatoio'
    ];

    const oggettiEpici = [
      'Tavolo', 'Botte', "Armatura d'arredo", 'Cassapanca',
      'Baule', 'Lampadario', 'Un altro personaggio!'
    ];

    const oggetto = tipo === 'comune' ?
      oggettiComuni[Math.floor(Math.random() * oggettiComuni.length)] :
      oggettiEpici[Math.floor(Math.random() * oggettiEpici.length)];

    participantData.oggettoScena = { nome: oggetto, tipo };

    await ChatMessage.create({
      content: `<p><strong>${actor.name}</strong> afferra ${oggetto}!</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  /**
   * Usa un oggetto di scena
   */
  async useProp(actor, mode) {
    const participantData = this.brawlParticipants.get(actor.id);
    if (!participantData?.oggettoScena) {
      ui.notifications.warn('Non hai oggetti di scena in mano!');
      return;
    }

    const prop = participantData.oggettoScena;
    let message = `<p><strong>${actor.name}</strong> usa ${prop.nome} `;

    if (prop.tipo === 'comune') {
      switch (mode) {
        case 'attack':
          message += 'per attaccare con +1d4 al tiro!</p>';
          // Aggiungi bonus al prossimo attacco
          break;
        case 'bonus':
          message += 'come azione bonus per una saccagnata veloce!</p>';
          break;
        case 'defense':
          message += 'per difendersi (+2 CA)!</p>';
          break;
      }
    } else { // epico
      switch (mode) {
        case 'damage':
          message += 'infliggendo 1 batosta aggiuntiva!</p>';
          break;
        case 'stun':
          message += 'stordendo il bersaglio!</p>';
          break;
        case 'area':
          message += 'colpendo due bersagli!</p>';
          break;
        case 'defense':
          message += 'per una difesa epica (+5 CA)!</p>';
          break;
      }
    }

    await ChatMessage.create({
      content: message,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    // L'oggetto si disintegra dopo l'uso
    participantData.oggettoScena = null;
  }

  /**
   * Ottiene lo stato delle batoste
   */
  _getBatostaStatus(level) {
    if (level === 0) return '';
    if (level >= 6) return '(INCOSCIENTE)';
    return `(${this.batosteLevels[level - 1].name})`;
  }

  /**
   * Calcola slot mossa disponibili per livello
   */
  _getSlotMossa(actor) {
    const level = actor.system.details.level || 1;
    let baseSlots = 2;

    if (level >= 5) baseSlots = 4;
    else if (level >= 3) baseSlots = 3;

    // Aggiungi slot extra da background Attaccabrighe
    const slotExtra = actor.getFlag('brancalonia-bigat', 'slotMossaExtra') || 0;

    return baseSlots + slotExtra;
  }

  /**
   * Normalizza il nome della classe per supportare sia D&D 5e che Brancalonia
   * @param {Actor} actor - L'attore di cui normalizzare la classe
   * @returns {string} - Nome classe normalizzato
   */
  _getNormalizedClass(actor) {
    if (!actor?.system?.details?.class) return '';
    
    const rawClass = actor.system.details.class.toLowerCase().trim();
    
    // Usa il mapping per normalizzare
    const normalized = this.classiMapping[rawClass];
    
    if (!normalized) {
      logger.warn(TavernBrawlSystem.MODULE_NAME, `Classe non riconosciuta: "${rawClass}". Supportate: ${Object.keys(this.classiMapping).join(', ')}`);
      return rawClass; // Fallback al nome originale
    }
    
    return normalized;
  }

  /**
   * Ottiene le mosse disponibili per il personaggio
   */
  async _getMosseDisponibili(actor) {
    const mosse = [];
    const level = actor.system.details.level || 1;
    const classe = this._getNormalizedClass(actor);

    // Mossa di classe al livello 1
    if (level >= 1 && this.mosseClasse[classe]) {
      mosse.push(this.mosseClasse[classe]);
    }

    // Mosse generiche ai livelli 1, 3, 5
    if (level >= 1) mosse.push(this.mosseGeneriche.saccagnata);
    if (level >= 3) mosse.push(this.mosseGeneriche.sgambetto);
    if (level >= 5) mosse.push(this.mosseGeneriche.ghigliottina);

    // Asso nella manica al livello 6
    if (level >= 6 && this.assiNellaManica[classe]) {
      mosse.push({
        ...this.assiNellaManica[classe],
        assoNellaManica: true
      });
    }

    return mosse;
  }

  /**
   * Chiede se usare i Pericoli Vaganti
   */
  async _askForPericoliVaganti() {
    return new Promise(resolve => {
      new foundry.appv1.sheets.Dialog({
        title: 'Pericoli Vaganti',
        content: `
          <p>Vuoi aggiungere dei Pericoli Vaganti alla rissa?</p>
          <p style="font-size: 0.9em; font-style: italic;">
            I pericoli vaganti sono eventi casuali che colpiscono tutti durante la rissa.
          </p>
        `,
        buttons: {
          yes: {
            label: 'Sì, aggiungi pericoli!',
            callback: () => resolve(true)
          },
          no: {
            label: 'No, rissa normale',
            callback: () => resolve(false)
          }
        },
        default: 'no'
      }).render(true);
    });
  }

  /**
   * Configura i Pericoli Vaganti
   */
  async _setupPericoliVaganti(combat) {
    const numPericoli = Math.min(3, Math.floor(Math.random() * 3) + 1);
    const pericoli = [];

    for (let i = 0; i < numPericoli; i++) {
      const pericolo = this.pericoliVaganti[Math.floor(Math.random() * this.pericoliVaganti.length)];
      pericoli.push(pericolo);
    }

    await combat.setFlag('brancalonia-bigat', 'pericoliVaganti', pericoli);

    await ChatMessage.create({
      content: `
        <div style="border: 1px solid #800; padding: 10px; background: #fdd;">
          <h3>⚠️ Pericoli Vaganti Attivi ⚠️</h3>
          <ul>
            ${pericoli.map(p => `<li><strong>${p.name}:</strong> ${p.effect}</li>`).join('')}
          </ul>
        </div>
      `,
      speaker: { alias: 'Sistema Rissa' }
    });
  }

  /**
   * Attiva un Pericolo Vagante
   * @returns {Promise<void>}
   */
  async activatePericoloVagante() {
    if (!this.brawlCombat) return;

    const pericoli = this.brawlCombat.getFlag('brancalonia-bigat', 'pericoliVaganti');
    if (!pericoli || pericoli.length === 0) return;

    TavernBrawlSystem.statistics.pericoliVagantiTriggered++;
    const pericolo = pericoli[Math.floor(Math.random() * pericoli.length)];
    logger.info(TavernBrawlSystem.MODULE_NAME, `💥 Pericolo Vagante: ${pericolo.name}`);

    await ChatMessage.create({
      content: `
        <div style="border: 2px solid #f00; padding: 10px; background: #fee;">
          <h3>💥 PERICOLO VAGANTE! 💥</h3>
          <p><strong>${pericolo.name}</strong></p>
          <p>${pericolo.effect}</p>
          <p style="font-style: italic;">Tutti i partecipanti devono fare il tiro indicato!</p>
        </div>
      `,
      speaker: { alias: 'Pericolo!' }
    });
  }

  /**
   * Trigger evento atmosfera narrativo
   * @returns {Promise<void>}
   */
  async triggerEventoAtmosfera() {
    TavernBrawlSystem.statistics.eventiAtmosferaTriggered++;
    const evento = this.eventiAtmosfera[Math.floor(Math.random() * this.eventiAtmosfera.length)];
    logger.debug?.(TavernBrawlSystem.MODULE_NAME, `🍺 Evento Atmosfera: ${evento}`);
    
    await ChatMessage.create({
      content: `
        <div style="border: 1px solid #8b4513; padding: 8px; background: #f4e4bc; border-radius: 5px;">
          <h4 style="margin: 0 0 5px 0; color: #8b4513;">🍺 Atmosfera di Rissa!</h4>
          <p style="margin: 0; font-style: italic;">${evento}</p>
        </div>
      `,
      speaker: { alias: 'Taverna' }
    });
  }

  /**
   * Termina la rissa
   * @returns {Promise<void>}
   */
  async endBrawl() {
    if (!this.activeBrawl) return;

    TavernBrawlSystem.statistics.brawlsEnded++;
    logger.info(TavernBrawlSystem.MODULE_NAME, '🏁 Fine rissa');

    // Determina vincitori e vinti
    const conscious = [];
    const unconscious = [];

    for (const [, data] of this.brawlParticipants) {
      if (data.batoste >= 6) {
        unconscious.push(data.actor);
      } else {
        conscious.push(data.actor);
      }

      // Rimuovi effetti batoste
      const effects = data.actor.effects.filter(e =>
        e.flags?.brancalonia?.isBatoste || e.flags?.brancalonia?.brawlKO
      );
      for (const effect of effects) {
        await effect.delete();
      }
    }

    // Messaggio finale con regole del dopo-rissa
    await ChatMessage.create({
      content: `
        <div class="brancalonia-brawl-end" style="border: 2px solid #8b4513; padding: 15px; background: #f4e4bc;">
          <h2 style="color: #8b4513; text-align: center;">🏁 FINE DELLA RISSA! 🏁</h2>

          ${conscious.length > 0 ? `
            <h3 style="color: green;">✅ Ancora in Piedi:</h3>
            <ul>${conscious.map(a => `<li>${a.name}</li>`).join('')}</ul>
          ` : ''}

          ${unconscious.length > 0 ? `
            <h3 style="color: red;">❌ Incoscienti:</h3>
            <ul>${unconscious.map(a => `<li>${a.name}</li>`).join('')}</ul>
          ` : ''}

          <hr>
          <h3>📜 Regole Post-Rissa (dal manuale):</h3>
          <ol>
            <li><strong>Danni all'Osteria:</strong> Chi è incosciente può essere spogliato dall'oste per risarcimento</li>
            <li><strong>Trofeo:</strong> Ogni vincitore può prendere UN trofeo dagli sconfitti:
              <ul>
                <li>1 Cimelio</li>
                <li>1 moneta a scelta</li>
                <li>1 oggetto simbolico (mappa, lettera, etc.)</li>
                <li>Oppure dare uno "Schiaffo Morale" finale</li>
              </ul>
            </li>
            <li><strong>Niente Taglie:</strong> Era solo una rissa, non un crimine!</li>
          </ol>
        </div>
      `,
      speaker: { alias: 'Sistema Rissa' }
    });

    // Reset
    this.activeBrawl = false;
    this.brawlCombat = null;
    this.brawlParticipants.clear();
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
   * const status = TavernBrawlSystem.getStatus();
   * console.log(status.initialized); // true
   */
  static getStatus() {
    return {
      initialized: this._state.initialized,
      hooksRegistered: this._state.hooksRegistered,
      settingsRegistered: this._state.settingsRegistered,
      macrosCreated: this._state.macrosCreated,
      version: this.VERSION,
      moduleName: this.MODULE_NAME
    };
  }

  /**
   * Ottiene le statistiche dettagliate
   * @static
   * @returns {Object} Statistiche complete
   * 
   * @example
   * const stats = TavernBrawlSystem.getStatistics();
   * console.log(stats.brawlsStarted); // 5
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
   * TavernBrawlSystem.resetStatistics();
   */
  static resetStatistics() {
    this.statistics = {
      brawlsStarted: 0,
      brawlsEnded: 0,
      saccagnateExecuted: 0,
      mosseExecuted: 0,
      propsUsed: 0,
      pericoliVagantiTriggered: 0,
      eventiAtmosferaTriggered: 0,
      batosteTotali: 0,
      koCount: 0,
      errors: []
    };
    logger.info(this.MODULE_NAME, '📊 Statistiche resettate');
  }

  /**
   * Mostra report console colorato
   * @static
   * 
   * @example
   * TavernBrawlSystem.showReport();
   */
  static showReport() {
    console.log('%c═══════════════════════════════════════', 'color: #8b4513; font-weight: bold');
    console.log('%c⚔️ TAVERN BRAWL SYSTEM - REPORT', 'color: #8b4513; font-weight: bold; font-size: 14px');
    console.log('%c═══════════════════════════════════════', 'color: #8b4513; font-weight: bold');
    console.log('');
    console.log('%c📊 STATUS', 'color: #00BCD4; font-weight: bold');
    console.log(`Version: ${this.VERSION}`);
    console.log(`Initialized: ${this._state.initialized}`);
    console.log(`Hooks Registered: ${this._state.hooksRegistered}`);
    console.log(`Settings Registered: ${this._state.settingsRegistered}`);
    console.log(`Macros Created: ${this._state.macrosCreated}`);
    console.log('');
    console.log('%c📈 STATISTICS', 'color: #4CAF50; font-weight: bold');
    console.log(`Brawls Started: ${this.statistics.brawlsStarted}`);
    console.log(`Brawls Ended: ${this.statistics.brawlsEnded}`);
    console.log(`Saccagnate Executed: ${this.statistics.saccagnateExecuted}`);
    console.log(`Mosse Executed: ${this.statistics.mosseExecuted}`);
    console.log(`Props Used: ${this.statistics.propsUsed}`);
    console.log(`Pericoli Vaganti Triggered: ${this.statistics.pericoliVagantiTriggered}`);
    console.log(`Eventi Atmosfera Triggered: ${this.statistics.eventiAtmosferaTriggered}`);
    console.log(`Batoste Totali: ${this.statistics.batosteTotali}`);
    console.log(`KO Count: ${this.statistics.koCount}`);
    console.log(`Errors: ${this.statistics.errors.length}`);
    if (this.statistics.errors.length > 0) {
      console.log('%c⚠️ Last 3 Errors:', 'color: #FF9800; font-weight: bold');
      this.statistics.errors.slice(-3).forEach(err => {
        console.log(`  [${err.type}] ${err.message}`);
      });
    }
    console.log('');
    console.log('%c═══════════════════════════════════════', 'color: #8b4513; font-weight: bold');
  }
}

Hooks.once('ready', () => {
  try {
    if (!game.brancalonia) game.brancalonia = {};
    if (!game.brancalonia.modules) game.brancalonia.modules = {};

    window.TavernBrawlSystem = TavernBrawlSystem;
    game.brancalonia.tavernBrawl = TavernBrawlSystem;
    game.brancalonia.modules['tavern-brawl'] = TavernBrawlSystem;

    TavernBrawlSystem.initialize();
  } catch (error) {
    logger.error(TavernBrawlSystem.MODULE_NAME, 'Errore durante inizializzazione', error);
    TavernBrawlSystem.statistics.errors.push({ 
      type: 'ready-hook', 
      message: error.message, 
      timestamp: Date.now() 
    });
  }
});

// Export ES6
export default TavernBrawlSystem;
export { TavernBrawlSystem };