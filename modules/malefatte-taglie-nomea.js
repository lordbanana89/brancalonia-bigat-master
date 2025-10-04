/**
 * Sistema Malefatte, Taglie e Nomea per Brancalonia
 * Basato sul manuale Brancalonia - gestione completa di malefatte, taglia e nomea
 * Compatibile con dnd5e system per Foundry VTT v13
 * 
 * @module MalefatteTaglieNomeaSystem
 * @version 2.0.0
 * @author Brancalonia BIGAT Team
 */

import { getLogger } from './brancalonia-logger.js';

const logger = getLogger();

class MalefatteTaglieNomeaSystem {
  static VERSION = '2.0.0';
  static MODULE_NAME = 'Malefatte-Taglie-Nomea System';
  static ID = 'malefatte-taglie-nomea';

  constructor() {
    // Statistics tracking (enterprise-grade)
    this.statistics = {
      malefatteCommesse: 0,
      malefatteByType: {},
      tagliaTotal: 0,
      tagliaIncreased: 0,
      tagliaDecreased: 0,
      nomeaChanges: 0,
      dialogsShown: 0,
      eventsRecorded: 0,
      errors: []
    };

    // Internal state management
    this._state = {
      initialized: false,
      hooksRegistered: false
    };

    // Tabella Malefatte dal manuale (pag. 46-47)
    this.malefatte = [
      { id: 1, name: 'Schiamazzi notturni e disturbo della pubblica quiete', value: 2 },
      { id: 2, name: 'Sermone non autorizzato, abbindolamento o supercazzola', value: 2 },
      { id: 3, name: 'Offese, insulti o vilipendio', value: 2 },
      { id: 4, name: 'Vivande e bevande non pagate', value: 2 },
      { id: 5, name: 'Furto di pollame e altri volatili da cortile', value: 4 },
      { id: 6, name: 'Adulterio o abbandono del tetto coniugale', value: 4 },
      { id: 7, name: "Profezia, scommessa o gioco d'azzardo non autorizzato", value: 4 },
      { id: 8, name: 'Bracconaggio o contrabbando di animali', value: 8 },
      { id: 9, name: 'Truffa, imbroglio o burla aggravata', value: 8 },
      { id: 10, name: 'Borseggio e taccheggio da mercato', value: 10 },
      { id: 11, name: 'Furto con destrezza, furto con carisma o furto con intelligenza', value: 10 },
      { id: 12, name: 'Maleficio o fandonia molesta', value: 10 },
      { id: 13, name: 'Falsificazione di reliquie e oggetti di pregio', value: 10 },
      { id: 14, name: 'Distillazione clandestina, contrabbando o ricettazione', value: 12 },
      { id: 15, name: 'Malversazione, corruzione, insolvenza o tasse non pagate', value: 12 },
      { id: 16, name: "Evasione, resistenza all'arresto, interruzione di pubblica esecuzione", value: 15 },
      { id: 17, name: 'Rissa non regolamentata, vandalismo, sfascio di bettole e ricoveri', value: 15 },
      { id: 18, name: 'Falsificazione di documenti e monete', value: 18 },
      { id: 19, name: 'Contrabbando di mostruosità, draghi, bestie magiche e aberrazioni', value: 20 },
      { id: 20, name: 'Tradimento, spionaggio e diserzione', value: 20 }
    ];

    // Malefatte aggiuntive per crimini più gravi
    this.malefatteGravi = [
      { name: 'Rapina a mano armata', value: 25 },
      { name: 'Sequestro di persona', value: 30 },
      { name: 'Incendio doloso', value: 35 },
      { name: 'Omicidio premeditato', value: 40 },
      { name: 'Sacrilegio grave', value: 45 },
      { name: 'Cospirazione contro il Regno', value: 50 },
      { name: 'Stregoneria nera', value: 60 },
      { name: 'Alto tradimento', value: 75 },
      { name: 'Regicidio tentato', value: 100 }
    ];

    // Livelli di Nomea basati sulla Taglia (pag. 48)
    this.nomeaLevels = {
      infame: { min: -1, max: -1, name: 'Infame', description: 'Traditore dei Fratelli di Taglia' },
      maltagliato: { min: 0, max: 9, name: 'Maltagliato', description: 'Principiante senza taglia significativa' },
      mezzaTaglia: { min: 10, max: 49, name: 'Mezza Taglia', description: 'Canaglia di basso profilo' },
      tagliola: { min: 50, max: 99, name: 'Tagliola', description: 'Criminale rispettabile' },
      tagliaForte: { min: 100, max: 199, name: 'Taglia Forte', description: 'Vero Fratello di Taglia' },
      vecchiaTaglia: { min: 200, max: 399, name: 'Vecchia Taglia', description: 'Veterano rispettato' },
      grandeTaglia: { min: 400, max: 999, name: 'Grande Taglia', description: 'Leggenda vivente' },
      mito: { min: 1000, max: Infinity, name: 'Mito', description: 'Entrato nella leggenda' }
    };

    // Attenuanti e Aggravanti
    this.modifiers = {
      attenuanti: {
        'Legittima difesa': 0.5,
        'Stato di necessità': 0.7,
        Ubriachezza: 0.8,
        'Minore età': 0.6,
        'Collaborazione con la giustizia': 0.5
      },
      aggravanti: {
        'Contro autorità': 1.5,
        'Contro religiosi': 1.5,
        'Con violenza': 1.5,
        Recidiva: 2.0,
        'In gruppo': 1.3,
        'Di notte': 1.2
      }
    };

    // Eventi di modifica taglia
    this.tagliaEvents = new Map();

    // Non chiamare metodi privati nel constructor
  }

  /**
   * Metodo statico di inizializzazione completo
   * @static
   * @throws {Error} Se l'inizializzazione fallisce
   * 
   * @example
   * MalefatteTaglieNomeaSystem.initialize();
   */
  static initialize() {
    try {
      logger.startPerformance('malefatte-init');
      logger.info(this.MODULE_NAME, '💰 Inizializzazione Sistema Malefatte e Taglie');

      // Registrazione settings
      this.registerSettings();

      // Creazione istanza globale
      const instance = new MalefatteTaglieNomeaSystem();
      instance._setupHooks(); // Fix: chiamato sull'istanza, non sulla classe statica
      instance._state.hooksRegistered = true;

      // Salva nell'oggetto globale
      if (!game.brancalonia) game.brancalonia = {};
      game.brancalonia.malefatteSystem = instance;

      // Registrazione comandi chat
      this.registerChatCommands();

      // Estensione Actor per malefatte
      this.extendActor();

      instance._state.initialized = true;

      const initTime = logger.endPerformance('malefatte-init');
      logger.info(this.MODULE_NAME, `✅ Sistema Malefatte e Taglie inizializzato in ${initTime?.toFixed(2)}ms`);

      // Emit event
      logger.events.emit('malefatte:initialized', {
        version: this.VERSION,
        initTime,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore durante inizializzazione', error);
      throw error;
    }
  }

  /**
   * Registra le impostazioni del modulo
   */
  static registerSettings() {
    game.settings.register('brancalonia-bigat', 'useInfamiaInsteadOfTaglia', {
      name: 'Usa Sistema Infamia',
      hint: 'Usa il sistema Infamia 0-100 invece di Malefatte/Taglie (non canonico)',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register('brancalonia-bigat', 'autoCalculateNomea', {
      name: 'Calcolo Automatico Nomea',
      hint: 'Calcola automaticamente la Nomea basata sulla Taglia',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'autoMalefatteOnCrime', {
      name: 'Malefatte Automatiche',
      hint: 'Aggiungi automaticamente malefatte quando commetti crimini',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
  }

  /**
   * Registra comandi chat
   */
  static registerChatCommands() {
    // Comando per gestire malefatte
    game.socket.on('system.brancalonia-bigat', (data) => {
      if (data.type === 'malefatte-command' && game.user.isGM) {
        const instance = game.brancalonia?.malefatteSystem;
        if (instance) {
          switch (data.command) {
            case 'addMalefatta':
              instance.addMalefatta(data.actor, data.malefatta);
              break;
            case 'removeMalefatta':
              instance.removeMalefatta(data.actor, data.index);
              break;
            case 'payTaglia':
              instance.payTaglia(data.actor, data.amount);
              break;
            case 'updateNomea':
              instance.updateNomea(data.actor);
              break;
          }
        }
      }
    });

    // Comando testuale per malefatte
    if (game.modules.get('monk-enhanced-journal')?.active) {
      game.MonksEnhancedJournal?.registerChatCommand('/malefatta', {
        name: 'Gestisci Malefatte',
        callback: (args) => {
          const instance = game.brancalonia?.malefatteSystem;
          if (instance && game.user.isGM) {
            if (args[0] === 'add' && args.length >= 3) {
              // /malefatta add @personaggio numero_malefatta
              const actorName = args[1]?.replace('@', '');
              const malefattaId = parseInt(args[2]);

              const actor = game?.actors?.find(a => a.name.toLowerCase().includes(actorName?.toLowerCase()));
              const malefatta = instance.malefatte.find(m => m.id === malefattaId);

              if (actor && malefatta) {
                instance.addMalefatta(actor, malefatta);
              } else {
                ui.notifications.error('Attore o malefatta non trovati!');
              }
            } else if (args[0] === 'pay' && args.length >= 3) {
              // /malefatta pay @personaggio importo
              const actorName = args[1]?.replace('@', '');
              const amount = parseInt(args[2]);

              const actor = game?.actors?.find(a => a.name.toLowerCase().includes(actorName?.toLowerCase()));
              if (actor) {
                instance.payTaglia(actor, amount);
              } else {
                ui.notifications.error('Attore non trovato!');
              }
            } else {
              instance.renderMalefatteManager();
            }
          }
        },
        help: 'Uso: /malefatta [add @personaggio id | pay @personaggio importo] - Gestisce malefatte'
      });
    }
  }

  /**
   * Crea macro automatiche
   */
  static createMacros() {
    if (!game.user.isGM) return;

    const macroData = {
      name: '💰 Gestione Malefatte e Taglie',
      type: 'script',
      img: 'icons/skills/social/theft-pickpocket-bribery-brown.webp',
      command: `
const malefatteSystem = game.brancalonia?.malefatteSystem;
if (malefatteSystem) {
  malefatteSystem.renderMalefatteManager();
} else {
  ui.notifications.error("Sistema Malefatte non inizializzato!");
}
      `,
      folder: null,
      sort: 0,
      ownership: { default: 0, [game.user.id]: 3 },
      flags: { 'brancalonia-bigat': { 'auto-generated': true } }
    };

    // Controlla se esiste già
    const existing = game?.macros?.find(m => m.name === macroData.name);
    if (!existing) {
      Macro.create(macroData);
      logger.info(this.MODULE_NAME, '✅ Macro Malefatte creata');
    }
  }

  /**
   * Estende la classe Actor con metodi malefatte
   */
  static extendActor() {
    // Metodo per ottenere taglia totale
    Actor.prototype.getTaglia = function () {
      return this.flags.brancalonia?.taglia || 0;
    };

    // Metodo per ottenere nomea
    Actor.prototype.getNomea = function () {
      const instance = game.brancalonia?.malefatteSystem;
      if (instance) {
        const taglia = this.getTaglia();
        return instance.calculateNomea(taglia);
      }
      return { level: 'maltagliato', name: 'Maltagliato', description: 'Principiante' };
    };

    // Metodo per ottenere malefatte
    Actor.prototype.getMalefatte = function () {
      return this.flags.brancalonia?.malefatte || [];
    };

    // Metodo per aggiungere malefatta
    Actor.prototype.addMalefatta = async function (malefatta) {
      const instance = game.brancalonia?.malefatteSystem;
      if (instance) {
        return await instance.addMalefatta(this, malefatta);
      }
    };

    // Metodo per pagare taglia
    Actor.prototype.payTaglia = async function (amount) {
      const instance = game.brancalonia?.malefatteSystem;
      if (instance) {
        return await instance.payTaglia(this, amount);
      }
    };

    // Metodo per controllare se è ricercato
    Actor.prototype.isWanted = function () {
      const taglia = this.getTaglia();
      return taglia >= 50; // Tagliola o superiore
    };
  }

  _setupHooks() {
    // Hook per scheda personaggio
    Hooks.on('renderActorSheet', (app, html, data) => {
      if (app.actor.type === 'character') {
        this._renderTagliaSection(app, html);
      }
    });

    // Hook per creazione personaggio
    Hooks.on('createActor', (actor) => {
      if (actor.type === 'character' && game.user.isGM) {
        this._initializeCharacterMalefatte(actor);
      }
    });

    // Hook per crimini automatici
    Hooks.on('dnd5e.rollSkill', (actor, roll, skillId) => {
      if (!game.settings.get('brancalonia-bigat', 'autoMalefatteOnCrime')) return;
      if (!game.user.isGM) return;

      // Controlla se è un'abilità criminale
      const criminalSkills = ['sle', 'ste', 'dec'];
      if (criminalSkills.includes(skillId) && roll.total >= 15) {
        // Successo in attività criminale
        this._checkForAutomaticMalefatta(actor, skillId, roll.total);
      }
    });

    // Hook per fase di Sbraco - aggiorna taglie
    Hooks.on('brancalonia.sbracoStarted', () => {
      if (game.user.isGM) {
        this._updateAllTaglie();
      }
    });

    // Hook per combattimento - malefatte per violenza
    Hooks.on('dnd5e.applyDamage', (target, damage, options) => {
      if (!game.settings.get('brancalonia-bigat', 'autoMalefatteOnCrime')) return;
      if (!game.user.isGM) return;

      const attacker = options.attacker;
      if (!attacker?.hasPlayerOwner) return;

      // Se uccide un innocente
      if (target.flags.brancalonia?.isInnocent && damage >= target.system.attributes.hp.value) {
        const malefatta = { name: 'Omicidio di innocente', value: 40 };
        this.addMalefatta(attacker, malefatta);
      }

      // Se ferisce gravemente qualcuno
      if (damage >= target.system.attributes.hp.max / 2) {
        const malefatta = { name: 'Rissa non regolamentata, vandalismo, sfascio di bettole e ricoveri', value: 15 };
        this.addMalefatta(attacker, malefatta);
      }
    });
  }

  _registerSettings() {
    // Settings già registrate in registerSettings() statico
  }

  /**
   * Inizializza malefatte per nuovo personaggio
   */
  async _initializeCharacterMalefatte(actor) {
    if (!game.user.isGM) return;

    const level = actor.system.details.level || 1;
    const numMalefatte = Math.max(1, Math.floor(level / 2)); // 1 ogni 2 livelli

    if (numMalefatte === 0) return;

    // Dialog per selezione malefatte iniziali
    const content = `
      <div class="malefatte-init">
        <h3>Malefatte Iniziali per ${actor.name}</h3>
        <p>Seleziona fino a ${numMalefatte} malefatte per determinare la Taglia iniziale:</p>

        <div class="malefatte-selection" style="max-height: 400px; overflow-y: auto;">
          ${this.malefatte.map(m => `
            <label style="display: block; margin: 5px 0;">
              <input type="checkbox" name="malefatta" value="${m.id}" data-value="${m.value}">
              ${m.name} (${m.value} mo)
            </label>
          `).join('')}
        </div>

        <hr>
        <div class="taglia-preview">
          <strong>Taglia Totale:</strong> <span id="taglia-total">0</span> mo
        </div>
      </div>
    `;

    new foundry.appv1.sheets.Dialog({
      title: 'Malefatte Iniziali',
      content,
      buttons: {
        random: {
          label: 'Casuale',
          callback: async () => {
            const randomMalefatte = this._selectRandomMalefatte(numMalefatte);
            await this._applyInitialMalefatte(actor, randomMalefatte);
          }
        },
        confirm: {
          label: 'Conferma',
          callback: async (html) => {
            const selected = html.find('input[name="malefatta"]:checked')
              .toArray()
              .slice(0, numMalefatte)
              .map(el => {
                const id = parseInt(el.value);
                return this.malefatte.find(m => m.id === id);
              });

            await this._applyInitialMalefatte(actor, selected);
          }
        },
        skip: {
          label: 'Salta',
          callback: () => {
            // Inizializza con valori vuoti
            this._applyInitialMalefatte(actor, []);
          }
        }
      },
      render: (html) => {
        // Aggiorna preview taglia
        html.find('input[name="malefatta"]').change(() => {
          const total = html.find('input[name="malefatta"]:checked')
            .toArray()
            .reduce((sum, el) => sum + parseInt(el.dataset.value), 0);
          html.find('#taglia-total').text(total);
        });
      }
    }).render(true);
  }

  /**
   * Seleziona malefatte casuali
   */
  _selectRandomMalefatte(count) {
    const selected = [];
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * 20) + 1;
      selected.push(this.malefatte.find(m => m.id === roll));
    }
    return selected;
  }

  /**
   * Applica malefatte iniziali
   */
  async _applyInitialMalefatte(actor, malefatte) {
    const taglia = malefatte.reduce((sum, m) => sum + m.value, 0);
    const nomea = this._calculateNomea(taglia);

    await actor.setFlag('brancalonia-bigat', 'malefatte', malefatte);
    await actor.setFlag('brancalonia-bigat', 'taglia', taglia);
    await actor.setFlag('brancalonia-bigat', 'nomea', nomea.level);
    await actor.setFlag('brancalonia-bigat', 'nomeaName', nomea.name);

    if (malefatte.length > 0) {
      ChatMessage.create({
        content: `
          <div class="malefatte-initial">
            <h3>${actor.name} - Malefatte Iniziali</h3>
            <ul>
              ${malefatte.map(m => `<li>${m.name} (${m.value} mo)</li>`).join('')}
            </ul>
            <p><strong>Taglia Totale:</strong> ${taglia} mo</p>
            <p><strong>Nomea:</strong> ${nomea.name}</p>
          </div>
        `,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }

  /**
   * Calcola livello di Nomea dalla Taglia
   */
  _calculateNomea(taglia) {
    for (const [key, level] of Object.entries(this.nomeaLevels)) {
      if (taglia >= level.min && taglia <= level.max) {
        return {
          level: key,
          name: level.name,
          description: level.description
        };
      }
    }
    return { level: 'maltagliato', name: 'Maltagliato', description: 'Principiante' };
  }

  /**
   * Aggiungi malefatta a un attore
   */
  async addMalefatta(actor, malefatta) {
    const malefatte = actor.flags.brancalonia?.malefatte || [];
    malefatte.push(malefatta);

    // Chiama hook per background-privileges (Azzeccagarbugli)
    Hooks.callAll('brancalonia.malefattaAdded', actor, malefatta);

    const taglia = malefatte.reduce((sum, m) => sum + m.value, 0);
    const nomea = this._calculateNomea(taglia);

    await actor.setFlag('brancalonia-bigat', 'malefatte', malefatte);
    await actor.setFlag('brancalonia-bigat', 'taglia', taglia);
    await actor.setFlag('brancalonia-bigat', 'nomea', nomea.level);
    await actor.setFlag('brancalonia-bigat', 'nomeaName', nomea.name);

    // Segna come recente per il Barattiere
    const recentMalefatte = actor.flags.brancalonia?.recentMalefatte || [];
    recentMalefatte.push(malefatta);
    await actor.setFlag('brancalonia-bigat', 'recentMalefatte', recentMalefatte);

    ChatMessage.create({
      content: `
        <div class="malefatta-added">
          <h3>💰 Nuova Malefatta!</h3>
          <p><strong>${actor.name}</strong> è accusato di: ${malefatta.name}</p>
          <p>Valore: ${malefatta.value} mo</p>
          <p>Nuova Taglia Totale: <strong>${taglia} mo</strong></p>
          <p>Nomea: <strong>${nomea.name}</strong></p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    // Registra evento
    await this._recordTagliaEvent(actor, 'malefatta', malefatta.value, malefatta.name);

    return { taglia, nomea };
  }

  /**
   * Rimuovi malefatta
   */
  async removeMalefatta(actor, index) {
    const malefatte = actor.flags.brancalonia?.malefatte || [];
    if (index < 0 || index >= malefatte.length) return;

    const removed = malefatte.splice(index, 1)[0];
    const taglia = malefatte.reduce((sum, m) => sum + m.value, 0);
    const nomea = this._calculateNomea(taglia);

    await actor.setFlag('brancalonia-bigat', 'malefatte', malefatte);
    await actor.setFlag('brancalonia-bigat', 'taglia', taglia);
    await actor.setFlag('brancalonia-bigat', 'nomea', nomea.level);
    await actor.setFlag('brancalonia-bigat', 'nomeaName', nomea.name);

    ChatMessage.create({
      content: `
        <div class="malefatta-removed">
          <h3>Rimossa malefatta: ${removed.name}</h3>
          <p>Valore: -${removed.value} mo</p>
          <p>Nuova Taglia: ${taglia} mo</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    // Registra evento
    await this._recordTagliaEvent(actor, 'rimozione', -removed.value, `Rimossa: ${removed.name}`);

    return { taglia, nomea, removed };
  }

  /**
   * Paga parte della taglia
   */
  async payTaglia(actor, amount) {
    const currentTaglia = actor.flags.brancalonia?.taglia || 0;
    const money = actor.system.currency.gp || 0;

    if (amount > money) {
      ui.notifications.warn('Non hai abbastanza denaro!');
      return;
    }

    if (amount > currentTaglia) {
      ui.notifications.warn("L'importo è maggiore della taglia attuale!");
      return;
    }

    const newTaglia = Math.max(0, currentTaglia - amount);
    const nomea = this._calculateNomea(newTaglia);

    await actor.update({ 'system.currency.gp': money - amount });
    await actor.setFlag('brancalonia-bigat', 'taglia', newTaglia);
    await actor.setFlag('brancalonia-bigat', 'nomea', nomea.level);
    await actor.setFlag('brancalonia-bigat', 'nomeaName', nomea.name);

    ChatMessage.create({
      content: `
        <div class="taglia-payment">
          <h3>💰 Pagamento Taglia</h3>
          <p><strong>${actor.name}</strong> paga ${amount} mo per ridurre la taglia</p>
          <p>Taglia precedente: ${currentTaglia} mo</p>
          <p>Taglia attuale: ${newTaglia} mo</p>
          <p>Nomea attuale: <strong>${nomea.name}</strong></p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    // Registra evento
    await this._recordTagliaEvent(actor, 'pagamento', -amount, 'Pagamento taglia');

    return { newTaglia, nomea };
  }

  /**
   * Aggiorna nomea di un attore
   */
  async updateNomea(actor) {
    const taglia = actor.flags.brancalonia?.taglia || 0;
    const nomea = this._calculateNomea(taglia);

    await actor.setFlag('brancalonia-bigat', 'nomea', nomea.level);
    await actor.setFlag('brancalonia-bigat', 'nomeaName', nomea.name);

    return nomea;
  }

  /**
   * Controlla malefatte automatiche per crimini
   */
  _checkForAutomaticMalefatta(actor, skillId, rollTotal) {
    const crimeMap = {
      sle: { // Sleight of Hand
        malefatta: this.malefatte.find(m => m.id === 10), // Borseggio
        threshold: 15
      },
      ste: { // Stealth
        malefatta: this.malefatte.find(m => m.id === 11), // Furto con destrezza
        threshold: 18
      },
      dec: { // Deception
        malefatta: this.malefatte.find(m => m.id === 9), // Truffa
        threshold: 16
      }
    };

    const crime = crimeMap[skillId];
    if (crime && rollTotal >= crime.threshold) {
      // 30% chance di essere scoperti
      if (Math.random() < 0.3) {
        this.addMalefatta(actor, crime.malefatta);
      }
    }
  }

  /**
   * Registra evento taglia
   */
  async _recordTagliaEvent(actor, type, amount, description) {
    const events = actor.flags.brancalonia?.tagliaEvents || [];

    const event = {
      type,
      amount,
      description,
      date: game.time.worldTime,
      scene: canvas.scene?.name || 'Sconosciuta'
    };

    events.push(event);

    // Mantieni solo gli ultimi 30 eventi
    if (events.length > 30) {
      events.splice(0, events.length - 30);
    }

    await actor.setFlag('brancalonia-bigat', 'tagliaEvents', events);
  }

  /**
   * Renderizza sezione Taglia sulla scheda
   */
  _renderTagliaSection(app, html) {
    const actor = app.actor;
    const malefatte = actor.flags.brancalonia?.malefatte || [];
    const taglia = actor.flags.brancalonia?.taglia || 0;
    const nomeaLevel = actor.flags.brancalonia?.nomea || 'maltagliato';
    const nomea = this.nomeaLevels[nomeaLevel];

    const tagliaHtml = `
      <div class="brancalonia-taglia-section" style="border: 2px solid #8B4513; padding: 10px; margin: 10px 0;">
        <h3 style="display: flex; justify-content: space-between; align-items: center;">
          <span><i class="fas fa-skull-crossbones"></i> Taglia e Nomea</span>
          ${game.user.isGM ? `
            <div>
              <button class="add-malefatta" title="Aggiungi Malefatta">
                <i class="fas fa-plus"></i>
              </button>
              <button class="manage-taglia" title="Gestisci Taglia">
                <i class="fas fa-edit"></i>
              </button>
            </div>
          ` : ''}
        </h3>

        <div class="taglia-display" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0;">
          <div style="text-align: center; padding: 10px; background: #f0f0f0; border-radius: 5px;">
            <div style="font-size: 0.8em; color: #666;">TAGLIA</div>
            <div style="font-size: 2em; font-weight: bold; color: #8B4513;">${taglia} mo</div>
          </div>
          <div style="text-align: center; padding: 10px; background: #f0f0f0; border-radius: 5px;">
            <div style="font-size: 0.8em; color: #666;">NOMEA</div>
            <div style="font-size: 1.5em; font-weight: bold; color: #8B4513;">${nomea.name}</div>
            <div style="font-size: 0.7em; font-style: italic;">${nomea.description}</div>
          </div>
        </div>

        <details style="margin-top: 10px;">
          <summary style="cursor: pointer; font-weight: bold;">
            Malefatte Attribuite (${malefatte.length})
          </summary>
          <div class="malefatte-list" style="margin-top: 10px; max-height: 200px; overflow-y: auto;">
            ${malefatte.length > 0 ? `
              <ul style="margin: 0; padding-left: 20px;">
                ${malefatte.map((m, i) => `
                  <li style="margin: 5px 0;">
                    ${m.name} - ${m.value} mo
                    ${game.user.isGM ? `
                      <button class="remove-malefatta" data-index="${i}"
                        style="float: right; font-size: 0.8em;">
                        <i class="fas fa-times"></i>
                      </button>
                    ` : ''}
                  </li>
                `).join('')}
              </ul>
            ` : '<p style="font-style: italic;">Nessuna malefatta registrata</p>'}
          </div>
        </details>

        ${this._renderNomeaEffects(nomea)}
      </div>
    `;

    // Inserisci dopo gli attributi
    const attributesTab = html.find('.tab.attributes');
    if (attributesTab.length) {
      attributesTab.append(tagliaHtml);
    } else {
      html.find('.sheet-body').prepend(tagliaHtml);
    }

    // Event listeners
    html.find('.add-malefatta').click(() => this._showAddMalefattaDialog(actor));
    html.find('.manage-taglia').click(() => this._showManageTagliaDialog(actor));
    html.find('.remove-malefatta').click((e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      this.removeMalefatta(actor, index);
    });
  }

  /**
   * Renderizza effetti della Nomea
   */
  _renderNomeaEffects(nomea) {
    const effects = {
      infame: [
        '❌ Non può usare Favori',
        '❌ Non può entrare nei Covi',
        '❌ Cacciato dai Fratelli di Taglia',
        '⚔️ Attaccato a vista da altre bande'
      ],
      maltagliato: [
        '👁️ Passa inosservato',
        '💰 Nessuna ricompensa per la cattura'
      ],
      mezzaTaglia: [
        '👥 Riconosciuto dai criminali locali',
        '💰 Piccola ricompensa per informazioni'
      ],
      tagliola: [
        '🎭 Conosciuto nella regione',
        '💰 Ricompensa decente per la cattura',
        '👮 Occasionalmente cercato dai birri'
      ],
      tagliaForte: [
        '⭐ Rispettato tra i Fratelli di Taglia',
        '💰 Alta ricompensa',
        '🎯 Cacciatori di taglie interessati'
      ],
      vecchiaTaglia: [
        '👑 Veterano rispettato',
        '💰 Ricompensa molto alta',
        '🎯 Cacciatori professionisti sulle tracce',
        '✨ +2 Intimidire con criminali'
      ],
      grandeTaglia: [
        '🌟 Leggenda vivente',
        '💰 Ricompensa enorme',
        '🎯 Squadre di cacciatori',
        '✨ +5 Intimidire, Vantaggio con criminali'
      ],
      mito: [
        '🔥 Entrato nel mito',
        '💰 Ricompensa da nobile',
        '⚔️ Eserciti mobilitati',
        '✨ Immunità alla paura, Ispirazione automatica'
      ]
    };

    const currentEffects = effects[nomea.level] || effects.maltagliato;

    return `
      <div class="nomea-effects" style="margin-top: 10px; padding: 10px; background: #f9f9f9; border-radius: 5px;">
        <strong>Effetti della Nomea:</strong>
        <ul style="margin: 5px 0; padding-left: 20px;">
          ${currentEffects.map(e => `<li style="margin: 3px 0;">${e}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Dialog per aggiungere malefatta
   */
  _showAddMalefattaDialog(actor) {
    const content = `
      <div class="add-malefatta-dialog">
        <div class="malefatta-type">
          <label>
            <input type="radio" name="type" value="standard" checked>
            Malefatta Standard
          </label>
          <label>
            <input type="radio" name="type" value="grave">
            Malefatta Grave
          </label>
          <label>
            <input type="radio" name="type" value="custom">
            Malefatta Personalizzata
          </label>
        </div>

        <hr>

        <div class="standard-selection">
          <select name="standard-malefatta" style="width: 100%;">
            ${this.malefatte.map(m => `
              <option value="${m.id}">${m.name} (${m.value} mo)</option>
            `).join('')}
          </select>
        </div>

        <div class="grave-selection" style="display: none;">
          <select name="grave-malefatta" style="width: 100%;">
            ${this.malefatteGravi.map((m, i) => `
              <option value="${i}">${m.name} (${m.value} mo)</option>
            `).join('')}
          </select>
        </div>

        <div class="custom-selection" style="display: none;">
          <label>
            Nome:
            <input type="text" name="custom-name" style="width: 100%;">
          </label>
          <label>
            Valore (mo):
            <input type="number" name="custom-value" min="1" value="10">
          </label>
        </div>

        <hr>

        <div class="modifiers">
          <h4>Modificatori (opzionali)</h4>

          <div>
            <strong>Attenuanti:</strong>
            ${Object.entries(this.modifiers.attenuanti).map(([name, mult]) => `
              <label style="display: block;">
                <input type="checkbox" name="attenuante" value="${mult}">
                ${name} (×${mult})
              </label>
            `).join('')}
          </div>

          <div style="margin-top: 10px;">
            <strong>Aggravanti:</strong>
            ${Object.entries(this.modifiers.aggravanti).map(([name, mult]) => `
              <label style="display: block;">
                <input type="checkbox" name="aggravante" value="${mult}">
                ${name} (×${mult})
              </label>
            `).join('')}
          </div>
        </div>

        <hr>
        <div class="value-preview">
          <strong>Valore Finale:</strong> <span id="final-value">0</span> mo
        </div>
      </div>
    `;

    const dialog = new foundry.appv1.sheets.Dialog({
      title: 'Aggiungi Malefatta',
      content,
      buttons: {
        add: {
          label: 'Aggiungi',
          callback: async (html) => {
            const type = html.find('input[name="type"]:checked').val();
            let malefatta;

            if (type === 'standard') {
              const id = parseInt(html.find('select[name="standard-malefatta"]').val());
              malefatta = { ...this.malefatte.find(m => m.id === id) };
            } else if (type === 'grave') {
              const index = parseInt(html.find('select[name="grave-malefatta"]').val());
              malefatta = { ...this.malefatteGravi[index] };
            } else {
              malefatta = {
                name: html.find('input[name="custom-name"]').val(),
                value: parseInt(html.find('input[name="custom-value"]').val())
              };
            }

            // Applica modificatori
            let multiplier = 1;
            html.find('input[name="attenuante"]:checked').each((i, el) => {
              multiplier *= parseFloat(el.value);
            });
            html.find('input[name="aggravante"]:checked').each((i, el) => {
              multiplier *= parseFloat(el.value);
            });

            malefatta.value = Math.round(malefatta.value * multiplier);

            await this.addMalefatta(actor, malefatta);
          }
        },
        cancel: { label: 'Annulla' }
      },
      render: (html) => {
        // Switch tra tipi
        html.find('input[name="type"]').change((e) => {
          const type = e.target.value;
          html.find('.standard-selection').toggle(type === 'standard');
          html.find('.grave-selection').toggle(type === 'grave');
          html.find('.custom-selection').toggle(type === 'custom');
          updatePreview();
        });

        // Aggiorna preview
        const updatePreview = () => {
          const type = html.find('input[name="type"]:checked').val();
          let baseValue = 0;

          if (type === 'standard') {
            const id = parseInt(html.find('select[name="standard-malefatta"]').val());
            baseValue = this.malefatte.find(m => m.id === id)?.value || 0;
          } else if (type === 'grave') {
            const index = parseInt(html.find('select[name="grave-malefatta"]').val());
            baseValue = this.malefatteGravi[index]?.value || 0;
          } else {
            baseValue = parseInt(html.find('input[name="custom-value"]').val()) || 0;
          }

          let multiplier = 1;
          html.find('input[name="attenuante"]:checked').each((i, el) => {
            multiplier *= parseFloat(el.value);
          });
          html.find('input[name="aggravante"]:checked').each((i, el) => {
            multiplier *= parseFloat(el.value);
          });

          const finalValue = Math.round(baseValue * multiplier);
          html.find('#final-value').text(finalValue);
        };

        // Listener per aggiornamenti
        html.find('select, input').change(updatePreview);
        updatePreview();
      }
    });

    dialog.render(true);
  }

  /**
   * Dialog per gestire la taglia
   */
  _showManageTagliaDialog(actor) {
    const malefatte = actor.flags.brancalonia?.malefatte || [];
    const taglia = actor.flags.brancalonia?.taglia || 0;
    const money = actor.system.currency.gp || 0;

    const content = `
      <div class="manage-taglia">
        <h3>Gestione Taglia - ${actor.name}</h3>
        <p>Taglia Attuale: <strong>${taglia} mo</strong></p>
        <p>Denaro Disponibile: <strong>${money} mo</strong></p>

        <div class="actions" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
          <button class="clear-recent">
            Pulisci Malefatte Recenti
          </button>
          <button class="pay-taglia">
            Paga parte della Taglia
          </button>
          <button class="export-taglia">
            Esporta Scheda Taglia
          </button>
          <button class="view-history">
            Storico Eventi
          </button>
        </div>

        <hr>

        <div class="taglia-summary">
          <h4>Riepilogo Malefatte</h4>
          <table style="width: 100%;">
            <thead>
              <tr>
                <th>Malefatta</th>
                <th>Valore</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${malefatte.map((m, i) => `
                <tr>
                  <td>${m.name}</td>
                  <td>${m.value} mo</td>
                  <td>
                    <button class="remove-single" data-index="${i}">
                      <i class="fas fa-times"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="font-weight: bold;">
                <td>TOTALE</td>
                <td>${taglia} mo</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;

    const dialog = new foundry.appv1.sheets.Dialog({
      title: 'Gestione Taglia',
      content,
      buttons: {
        close: { label: 'Chiudi' }
      },
      render: (html) => {
        html.find('.clear-recent').click(async () => {
          await actor.unsetFlag('brancalonia-bigat', 'recentMalefatte');
          ui.notifications.info('Malefatte recenti pulite');
        });

        html.find('.pay-taglia').click(() => {
          this._showPayTagliaDialog(actor);
          dialog.close();
        });

        html.find('.export-taglia').click(() => {
          this._exportTagliaSheet(actor);
        });

        html.find('.view-history').click(() => {
          this._showTagliaHistoryDialog(actor);
        });

        html.find('.remove-single').click(async (e) => {
          const index = parseInt(e.currentTarget.dataset.index);
          await this.removeMalefatta(actor, index);
          dialog.close();
          this._showManageTagliaDialog(actor); // Riapri aggiornato
        });
      }
    });

    dialog.render(true);
  }

  /**
   * Dialog per pagare parte della taglia
   */
  _showPayTagliaDialog(actor) {
    const taglia = actor.flags.brancalonia?.taglia || 0;
    const money = actor.system.currency.gp || 0;

    const content = `
      <p>Taglia Attuale: ${taglia} mo</p>
      <p>Denaro Disponibile: ${money} mo</p>
      <label>
        Importo da pagare:
        <input type="number" name="amount" min="0" max="${Math.min(taglia, money)}" value="0">
      </label>
    `;

    new foundry.appv1.sheets.Dialog({
      title: 'Paga Taglia',
      content,
      buttons: {
        pay: {
          label: 'Paga',
          callback: async (html) => {
            const amount = parseInt(html.find('input[name="amount"]').val());
            if (amount > 0) {
              await this.payTaglia(actor, amount);
            }
          }
        },
        cancel: { label: 'Annulla' }
      }
    }).render(true);
  }

  /**
   * Dialog per storico eventi taglia
   */
  _showTagliaHistoryDialog(actor) {
    const events = actor.flags.brancalonia?.tagliaEvents || [];

    const content = `
      <div class="taglia-history">
        <h3>Storico Eventi Taglia - ${actor.name}</h3>
        <div class="events-list" style="max-height: 400px; overflow-y: auto;">
          ${events.length > 0 ? `
            <table style="width: 100%;">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Valore</th>
                  <th>Descrizione</th>
                </tr>
              </thead>
              <tbody>
                ${events.map(event => `
                  <tr>
                    <td>${new Date(event.date).toLocaleDateString()}</td>
                    <td>${event.type}</td>
                    <td>${event.amount > 0 ? '+' : ''}${event.amount} mo</td>
                    <td>${event.description}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p><em>Nessun evento registrato</em></p>'}
        </div>
      </div>
    `;

    new foundry.appv1.sheets.Dialog({
      title: 'Storico Taglia',
      content,
      buttons: {
        close: { label: 'Chiudi' }
      }
    }).render(true);
  }

  /**
   * Esporta scheda taglia
   */
  _exportTagliaSheet(actor) {
    const malefatte = actor.flags.brancalonia?.malefatte || [];
    const taglia = actor.flags.brancalonia?.taglia || 0;
    const nomea = this.nomeaLevels[actor.flags.brancalonia?.nomea || 'maltagliato'];

    const sheet = `
      <div style="border: 3px solid #8B4513; padding: 20px; background: #FFF8DC;">
        <h1 style="text-align: center; color: #8B4513;">TAGLIA</h1>
        <h2 style="text-align: center;">${actor.name}</h2>

        <div style="text-align: center; margin: 20px 0;">
          <div style="font-size: 3em; font-weight: bold; color: red;">
            ${taglia} MO
          </div>
          <div style="font-size: 1.5em;">
            ${nomea.name}
          </div>
        </div>

        <h3>Malefatte Attribuite:</h3>
        <ul>
          ${malefatte.map(m => `<li>${m.name} - ${m.value} mo</li>`).join('')}
        </ul>

        <hr>
        <p style="text-align: center; font-style: italic;">
          "Per ordine di Equitaglia e dei Regi Registri"
        </p>
      </div>
    `;

    // Crea journal entry
    JournalEntry.create({
      name: `Taglia - ${actor.name}`,
      content: sheet
    });

    ui.notifications.info('Scheda Taglia esportata nel Journal!');
  }

  /**
   * Aggiorna tutte le taglie durante lo Sbraco
   */
  _updateAllTaglie() {
    if (!game.user.isGM) return;

    const actors = game.actors.filter(a =>
      a.type === 'character' &&
      a.hasPlayerOwner
    );

    const content = `
      <div class="update-taglie">
        <h3>Aggiornamento Taglie - Fase di Sbraco</h3>
        <p>Aggiorna le taglie per le malefatte commesse durante l'ultimo lavoretto:</p>

        <div class="actor-list">
          ${actors.map(actor => {
    const recent = actor.flags.brancalonia?.recentMalefatte || [];
    return `
              <div style="margin: 10px 0; padding: 10px; border: 1px solid #ccc;">
                <h4>${actor.name}</h4>
                ${recent.length > 0 ? `
                  <p>Malefatte recenti da confermare:</p>
                  <ul>
                    ${recent.map(m => `<li>${m.name} (${m.value} mo)</li>`).join('')}
                  </ul>
                  <button class="confirm-malefatte" data-actor="${actor.id}">
                    Conferma Malefatte
                  </button>
                  <button class="use-barattiere" data-actor="${actor.id}">
                    Usa Barattiere
                  </button>
                ` : '<p style="font-style: italic;">Nessuna nuova malefatta</p>'}
              </div>
            `;
  }).join('')}
        </div>
      </div>
    `;

    const dialog = new foundry.appv1.sheets.Dialog({
      title: 'Aggiornamento Taglie',
      content,
      buttons: {
        close: { label: 'Chiudi' }
      },
      render: (html) => {
        html.find('.confirm-malefatte').click(async (e) => {
          const actorId = e.currentTarget.dataset.actor;
          const actor = game.actors.get(actorId);
          await actor.unsetFlag('brancalonia-bigat', 'recentMalefatte');
          ui.notifications.info(`Malefatte confermate per ${actor.name}`);
          dialog.close();
          this._updateAllTaglie(); // Riapri
        });

        html.find('.use-barattiere').click((e) => {
          const actorId = e.currentTarget.dataset.actor;
          const actor = game.actors.get(actorId);

          if (game.brancalonia?.favoriSystem) {
            game.brancalonia.favoriSystem._executeBarattiere(actor);
          }
          dialog.close();
        });
      }
    });

    dialog.render(true);
  }

  /**
   * UI per gestione malefatte
   */
  renderMalefatteManager(actor = null) {
    if (actor) {
      // Vista per singolo attore
      const malefatte = actor.flags.brancalonia?.malefatte || [];
      const taglia = actor.flags.brancalonia?.taglia || 0;
      const nomea = actor.getNomea();

      const content = `
        <div class="brancalonia-malefatte-manager">
          <h2>💰 Gestione Malefatte - ${actor.name}</h2>

          <div class="status-summary">
            <h3>Stato Attuale</h3>
            <p><strong>Taglia:</strong> ${taglia} mo</p>
            <p><strong>Nomea:</strong> ${nomea.name} (${nomea.description})</p>
            <p><strong>Ricercato:</strong> ${actor.isWanted() ? 'Sì' : 'No'}</p>
          </div>

          <div class="malefatte-list">
            <h3>Malefatte (${malefatte.length})</h3>
            ${malefatte.length > 0 ? `
              <table style="width: 100%;">
                <thead>
                  <tr><th>Malefatta</th><th>Valore</th><th>Azioni</th></tr>
                </thead>
                <tbody>
                  ${malefatte.map((m, i) => `
                    <tr>
                      <td>${m.name}</td>
                      <td>${m.value} mo</td>
                      <td><button class="remove-malefatta" data-index="${i}">Rimuovi</button></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p><em>Nessuna malefatta</em></p>'}
          </div>

          <div class="actions">
            <button id="add-malefatta">Aggiungi Malefatta</button>
            <button id="pay-taglia">Paga Taglia</button>
            <button id="view-history">Storico</button>
            <button id="export-sheet">Esporta Scheda</button>
          </div>
        </div>
      `;

      const dialog = new foundry.appv1.sheets.Dialog({
        title: 'Gestione Malefatte',
        content,
        buttons: { close: { label: 'Chiudi' } },
        render: html => {
          html.find('#add-malefatta').click(() => {
            dialog.close();
            this._showAddMalefattaDialog(actor);
          });

          html.find('#pay-taglia').click(() => {
            dialog.close();
            this._showPayTagliaDialog(actor);
          });

          html.find('#view-history').click(() => {
            this._showTagliaHistoryDialog(actor);
          });

          html.find('#export-sheet').click(() => {
            this._exportTagliaSheet(actor);
          });

          html.find('.remove-malefatta').click(async (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            await this.removeMalefatta(actor, index);
            dialog.close();
            this.renderMalefatteManager(actor);
          });
        }
      });

      dialog.render(true);
    } else {
      // Vista generale
      const content = `
        <div class="brancalonia-malefatte-manager">
          <h2>💰 Gestione Malefatte e Taglie</h2>

          <div class="actor-selection">
            <h3>Seleziona Personaggio</h3>
            <select id="actor-select">
              <option value="">-- Seleziona --</option>
              ${game.actors.filter(a => a.hasPlayerOwner).map(a =>
    `<option value="${a.id}">${a.name} (${a.getTaglia()} mo)</option>`
  ).join('')}
            </select>
            <button id="manage-actor">Gestisci</button>
          </div>

          <div class="malefatte-reference">
            <h3>Tabella Malefatte</h3>
            <div style="max-height: 400px; overflow-y: auto;">
              <table style="width: 100%;">
                <thead>
                  <tr><th>ID</th><th>Malefatta</th><th>Valore</th></tr>
                </thead>
                <tbody>
                  ${this.malefatte.map(m => `
                    <tr>
                      <td>${m.id}</td>
                      <td>${m.name}</td>
                      <td>${m.value} mo</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="nomea-levels">
            <h3>Livelli di Nomea</h3>
            <table style="width: 100%;">
              <thead>
                <tr><th>Nomea</th><th>Taglia</th><th>Descrizione</th></tr>
              </thead>
              <tbody>
                ${Object.values(this.nomeaLevels).map(level => `
                  <tr>
                    <td>${level.name}</td>
                    <td>${level.min === level.max ? level.min : `${level.min}-${level.max === Infinity ? '∞' : level.max}`}</td>
                    <td>${level.description}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      const dialog = new foundry.appv1.sheets.Dialog({
        title: 'Gestione Malefatte',
        content,
        buttons: { close: { label: 'Chiudi' } },
        render: html => {
          html.find('#manage-actor').click(() => {
            const actorId = html.find('#actor-select').val();
            if (actorId) {
              const actor = game.actors.get(actorId);
              dialog.close();
              this.renderMalefatteManager(actor);
            }
          });
        }
      });

      dialog.render(true);
    }
  }

  /* ========================================
   * PUBLIC API
   * ======================================== */

  /**
   * Ottieni lo stato corrente del sistema
   * @static
   * @returns {Object} Stato del sistema
   * 
   * @example
   * const status = MalefatteTaglieNomeaSystem.getStatus();
   */
  static getStatus() {
    const instance = game.brancalonia?.malefatteSystem;
    return {
      initialized: instance?._state.initialized ?? false,
      hooksRegistered: instance?._state.hooksRegistered ?? false,
      malefatteCount: instance?.malefatte.length ?? 0,
      malefatteGraviCount: instance?.malefatteGravi.length ?? 0,
      nomeaLevelsCount: Object.keys(instance?.nomeaLevels ?? {}).length,
      version: this.VERSION
    };
  }

  /**
   * Ottieni le statistiche del sistema
   * @static
   * @returns {Object} Statistiche complete
   * 
   * @example
   * const stats = MalefatteTaglieNomeaSystem.getStatistics();
   */
  static getStatistics() {
    const instance = game.brancalonia?.malefatteSystem;
    return instance?.statistics ?? {};
  }

  /**
   * Reset statistiche
   * @static
   * 
   * @example
   * MalefatteTaglieNomeaSystem.resetStatistics();
   */
  static resetStatistics() {
    const instance = game.brancalonia?.malefatteSystem;
    if (!instance) return;

    instance.statistics = {
      malefatteCommesse: 0,
      malefatteByType: {},
      tagliaTotal: 0,
      tagliaIncreased: 0,
      tagliaDecreased: 0,
      nomeaChanges: 0,
      dialogsShown: 0,
      eventsRecorded: 0,
      errors: []
    };

    logger.info(this.MODULE_NAME, '📊 Statistiche reset');
  }

  /**
   * Ottieni lista completa malefatte
   * @static
   * @returns {Array} Lista malefatte
   * 
   * @example
   * const list = MalefatteTaglieNomeaSystem.getMalefatteList();
   */
  static getMalefatteList() {
    const instance = game.brancalonia?.malefatteSystem;
    return [
      ...(instance?.malefatte ?? []),
      ...(instance?.malefatteGravi?.map(m => ({ ...m, grave: true })) ?? [])
    ];
  }

  /**
   * Calcola Nomea da taglia
   * @static
   * @param {number} taglia - Valore taglia in mo
   * @returns {Object} Livello nomea
   * 
   * @example
   * const nomea = MalefatteTaglieNomeaSystem.calculateNomea(150);
   * console.log(nomea.name); // "Taglia Forte"
   */
  static calculateNomea(taglia) {
    const instance = game.brancalonia?.malefatteSystem;
    if (!instance) return null;

    for (const [key, level] of Object.entries(instance.nomeaLevels)) {
      if (taglia >= level.min && taglia <= level.max) {
        return { key, ...level };
      }
    }
    return null;
  }

  /**
   * Mostra report completo
   * @static
   * 
   * @example
   * MalefatteTaglieNomeaSystem.showReport();
   */
  static showReport() {
    const status = this.getStatus();
    const stats = this.getStatistics();

    console.log('%c═══════════════════════════════════════', 'color: #8B4513; font-weight: bold');
    console.log('%c💰 MALEFATTE-TAGLIE-NOMEA SYSTEM - REPORT', 'color: #8B4513; font-weight: bold; font-size: 14px');
    console.log('%c═══════════════════════════════════════', 'color: #8B4513; font-weight: bold');
    
    console.log('%c\n📊 STATUS', 'color: #4CAF50; font-weight: bold');
    console.log('Version:', status.version);
    console.log('Initialized:', status.initialized);
    console.log('Malefatte Standard:', status.malefatteCount);
    console.log('Malefatte Gravi:', status.malefatteGraviCount);
    console.log('Nomea Levels:', status.nomeaLevelsCount);
    
    console.log('%c\n📈 STATISTICS', 'color: #2196F3; font-weight: bold');
    console.log('Malefatte Commesse:', stats.malefatteCommesse);
    console.log('Taglia Total:', stats.tagliaTotal, 'mo');
    console.log('Taglia Increased:', stats.tagliaIncreased);
    console.log('Taglia Decreased:', stats.tagliaDecreased);
    console.log('Nomea Changes:', stats.nomeaChanges);
    console.log('Dialogs Shown:', stats.dialogsShown);
    
    if (stats.errors?.length > 0) {
      console.log('%c\n⚠️ ERRORS', 'color: #F44336; font-weight: bold');
      console.log(`Total Errors: ${stats.errors.length}`);
      stats.errors.slice(-5).forEach(err => {
        console.log(`- [${err.type}] ${err.message}`);
      });
    }
    
    console.log('%c\n═══════════════════════════════════════', 'color: #8B4513; font-weight: bold');
  }
}

// Registra classe globale
window.MalefatteTaglieNomeaSystem = MalefatteTaglieNomeaSystem;

// Auto-inizializzazione
Hooks.once('init', () => {
  logger.info('Brancalonia', '🎮 Inizializzazione Malefatte System');
  MalefatteTaglieNomeaSystem.initialize();
});

// Hook per creazione macro (dopo che game.user è disponibile)
Hooks.once('ready', () => {
  MalefatteTaglieNomeaSystem.createMacros();
});

// Hook per integrazione con schede
Hooks.on('renderActorSheet', (app, html, data) => {
  if (!game.user.isGM) return;

  const actor = app.actor;
  if (actor.type !== 'character') return;

  // Aggiungi pulsante rapido per gestione malefatte
  const malefatteButton = $(`
    <div class="form-group">
      <label>Malefatte e Taglia</label>
      <div class="form-fields">
        <div class="quick-stats">
          <span>Taglia: <strong>${actor.getTaglia()} mo</strong></span>
          <span>Nomea: <strong>${actor.getNomea().name}</strong></span>
        </div>
        <button type="button" class="manage-malefatte">
          <i class="fas fa-skull-crossbones"></i> Gestisci Malefatte
        </button>
      </div>
    </div>
  `);

  html.find('.tab.details .form-group').last().after(malefatteButton);

  malefatteButton.find('.manage-malefatte').click(() => {
    const instance = game.brancalonia?.malefatteSystem;
    if (instance) {
      instance.renderMalefatteManager(actor);
    }
  });
});

// NOTA: L'inizializzazione è gestita da BrancaloniaCore
// Esporta per compatibilità e scoperta da parte di BrancaloniaCore
window.MalefatteTaglieNomeaSystem = MalefatteTaglieNomeaSystem;
window.MalefatteTaglieNomea = MalefatteTaglieNomeaSystem; // For module loader
window['malefatte-taglie-nomea'] = MalefatteTaglieNomeaSystem; // For module loader