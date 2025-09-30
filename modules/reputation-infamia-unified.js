/**
 * Sistema Unificato di Reputazione e Infamia per Brancalonia
 * Compatibile con Foundry VTT v13 e D&D 5e v5.1.9
 *
 * Unisce le funzionalità di infamia-tracker.js e reputation-system.js
 * Versione: 2.0.0
 */

class ReputationInfamiaSystem {
  static ID = 'brancalonia-reputation-infamia';
  static NAMESPACE = 'brancalonia-bigat';

  constructor() {
    // ===== SISTEMA INFAMIA (da infamia-tracker) =====
    this.infamiaLevels = {
      0: { name: 'Sconosciuto', effects: [] },
      10: { name: 'Poco Noto', effects: ['Piccoli sconti dai criminali'] },
      25: { name: 'Mal Visto', effects: ['Guardie sospettose', '-1 Persuasione con autorità'] },
      50: { name: 'Ricercato', effects: ['Taglia minore', 'Controlli frequenti', '-2 Persuasione con autorità'] },
      75: { name: 'Fuorilegge', effects: ['Taglia maggiore', 'Cacciatori di taglie', 'Bandito dalle città'] },
      100: { name: 'Nemico Pubblico', effects: ['Taglia enorme', 'Squadre di cacciatori', 'Kill on sight'] }
    };

    this.infamiaActions = {
      'Furto Minore': 1,
      'Furto Maggiore': 3,
      Rapina: 5,
      Estorsione: 3,
      Contrabbando: 2,
      'Omicidio Comune': 8,
      'Omicidio Nobile': 15,
      Tradimento: 10,
      Evasione: 5,
      'Rissa Pubblica': 1,
      Danneggiamento: 2,
      'Oltraggio Autorità': 4,
      Sacrilegio: 6,
      Pirateria: 7,
      Sedizione: 12
    };

    // ===== SISTEMA REPUTAZIONE POSITIVA (da reputation-system) =====
    this.reputationTypes = {
      onore: {
        name: "Onore",
        description: "Il rispetto guadagnato attraverso azioni nobili e giuste",
        img: "icons/awards/medal-ribbon-star-gold-red.webp",
        max: 100
      },
      fama: {
        name: "Fama",
        description: "La notorietà delle tue gesta",
        img: "icons/environment/people/group.webp",
        max: 100
      },
      gloria: {
        name: "Gloria",
        description: "L'ammirazione per le tue vittorie",
        img: "icons/skills/ranged/target-bullseye-arrow-glowing-gold.webp",
        max: 100
      },
      santita: {
        name: "Santità",
        description: "Il favore divino e la purezza d'animo",
        img: "icons/magic/holy/angel-wings-gray.webp",
        max: 100
      },
      saggezza: {
        name: "Saggezza",
        description: "Il rispetto per la tua conoscenza",
        img: "icons/sundries/books/book-embossed-gold.webp",
        max: 100
      }
    };

    // Scale di reputazione positiva
    this.reputationScale = {
      0: { name: "Sconosciuto", description: "Nessuno ti conosce" },
      10: { name: "Locale", description: "Conosciuto nel villaggio" },
      25: { name: "Notevole", description: "Riconosciuto nella regione" },
      50: { name: "Rinomato", description: "Famoso nel reame" },
      75: { name: "Leggendario", description: "Le tue gesta sono leggenda" },
      100: { name: "Mitico", description: "Entrato nel mito" }
    };

    // Sistema Titoli (da reputation-system)
    this.titles = {
      // Titoli positivi
      eroe: {
        name: "Eroe del Regno",
        category: "heroic",
        requirements: { fama: 50, gloria: 50 },
        description: "Riconosciuto come eroe"
      },
      santo: {
        name: "Santo Protettore",
        category: "religious",
        requirements: { santita: 75 },
        description: "Benedetto dagli dei"
      },
      saggio: {
        name: "Saggio Venerabile",
        category: "scholarly",
        requirements: { saggezza: 75 },
        description: "Fonte di saggezza"
      },
      campione: {
        name: "Campione del Popolo",
        category: "heroic",
        requirements: { onore: 50, fama: 25 },
        description: "Difensore degli oppressi"
      },

      // Titoli negativi
      famigerato: {
        name: "Il Famigerato",
        category: "infamy",
        requirements: { infamia: 50 },
        description: "Temuto e disprezzato"
      },
      maledetto: {
        name: "Il Maledetto",
        category: "infamy",
        requirements: { infamia: 75 },
        description: "Maledetto dagli dei"
      },
      flagello: {
        name: "Flagello del Regno",
        category: "infamy",
        requirements: { infamia: 100 },
        description: "Nemico di tutti"
      },

      // Titoli neutrali
      mercenario: {
        name: "Mercenario",
        category: "neutral",
        requirements: { combatsWon: 20 },
        description: "Soldato di ventura"
      },
      viandante: {
        name: "Viandante",
        category: "neutral",
        requirements: { traveledScenes: 50 },
        description: "Viaggiatore instancabile"
      }
    };

    // Azioni che modificano le reputazioni
    this.reputationActions = {
      'Salvare innocenti': { onore: 5, fama: 3 },
      'Sconfiggere un mostro': { gloria: 5, fama: 2 },
      'Donare ai poveri': { onore: 2, santita: 3 },
      'Pregare in chiesa': { santita: 1 },
      'Studiare tomi antichi': { saggezza: 2 },
      'Vincere un torneo': { gloria: 10, fama: 5 },
      'Tradire un alleato': { onore: -10, infamia: 5 },
      'Rubare dai poveri': { onore: -5, santita: -5, infamia: 3 },
      'Bestemmiare': { santita: -2, infamia: 1 },
      'Uccidere innocenti': { onore: -15, santita: -10, infamia: 10 }
    };

    // Storico eventi (nuovo)
    this.eventHistory = new Map();
    this.maxHistoryEntries = 50;
  }

  /**
   * Inizializzazione completa del modulo unificato
   */
  static async initialize() {
    console.log('🎭 Inizializzazione Sistema Unificato Reputazione e Infamia v2.0.0');

    // Crea istanza singleton
    game.brancalonia = game.brancalonia || {};
    game.brancalonia.reputationInfamia = new ReputationInfamiaSystem();

    // Mantieni retrocompatibilità con vecchio sistema
    game.brancalonia.infamia = game.brancalonia.reputationInfamia;

    const instance = game.brancalonia.reputationInfamia;

    // Registra settings
    instance._registerSettings();

    // Estendi Actor con nuovi metodi
    instance._extendActor();

    // Setup hooks
    instance._setupHooks();

    // Registra comandi chat
    instance._registerChatCommands();

    // Crea macro automatiche
    await instance._createMacros();

    console.log('✅ Sistema Reputazione e Infamia inizializzato con successo');
  }

  /**
   * Registra le impostazioni del modulo
   */
  _registerSettings() {
    // Settings Infamia (esistenti)
    game.settings.register(ReputationInfamiaSystem.NAMESPACE, 'trackInfamia', {
      name: 'Traccia Infamia',
      hint: 'Abilita il sistema di tracciamento infamia',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(ReputationInfamiaSystem.NAMESPACE, 'infamiaEffects', {
      name: 'Effetti Automatici Infamia',
      hint: 'Applica automaticamente Active Effects basati sul livello di infamia',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(ReputationInfamiaSystem.NAMESPACE, 'randomEncounters', {
      name: 'Incontri Casuali Cacciatori',
      hint: 'Genera incontri casuali con cacciatori di taglie per PG infami',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    // Settings Reputazione (nuovi)
    game.settings.register(ReputationInfamiaSystem.NAMESPACE, 'useReputation', {
      name: 'Sistema Reputazione Positiva',
      hint: 'Abilita il sistema di reputazioni positive (Onore, Fama, Gloria, etc.)',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
      onChange: () => window.location.reload()
    });

    game.settings.register(ReputationInfamiaSystem.NAMESPACE, 'dynamicTitles', {
      name: 'Titoli Dinamici',
      hint: 'Assegna automaticamente titoli basati su reputazione e azioni',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(ReputationInfamiaSystem.NAMESPACE, 'reputationDecay', {
      name: 'Decadimento Reputazione',
      hint: 'La reputazione decade lentamente nel tempo se non mantenuta',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register(ReputationInfamiaSystem.NAMESPACE, 'trackHistory', {
      name: 'Storico Eventi',
      hint: 'Mantiene uno storico degli eventi di reputazione',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
  }

  /**
   * Estende la classe Actor con metodi personalizzati
   */
  _extendActor() {
    // ===== METODI INFAMIA (esistenti) =====
    CONFIG.Actor.documentClass.prototype.addInfamia = async function(amount, reason = '') {
      const currentInfamia = this.getFlag(ReputationInfamiaSystem.NAMESPACE, 'infamia') || 0;
      const newInfamia = Math.max(0, Math.min(100, currentInfamia + amount));

      await this.setFlag(ReputationInfamiaSystem.NAMESPACE, 'infamia', newInfamia);

      // Registra evento nello storico
      if (game.settings.get(ReputationInfamiaSystem.NAMESPACE, 'trackHistory')) {
        await game.brancalonia.reputationInfamia._recordEvent(this, 'infamia', amount, reason);
      }

      // Applica effetti automatici
      if (game.settings.get(ReputationInfamiaSystem.NAMESPACE, 'infamiaEffects')) {
        await game.brancalonia.reputationInfamia._applyInfamiaEffects(this, newInfamia);
      }

      // Check per nuovi titoli
      if (game.settings.get(ReputationInfamiaSystem.NAMESPACE, 'dynamicTitles')) {
        await game.brancalonia.reputationInfamia._checkTitleEligibility(this);
      }

      return newInfamia;
    };

    CONFIG.Actor.documentClass.prototype.getInfamia = function() {
      return this.getFlag(ReputationInfamiaSystem.NAMESPACE, 'infamia') || 0;
    };

    CONFIG.Actor.documentClass.prototype.getInfamiaLevel = function() {
      const infamia = this.getInfamia();
      const levels = Object.keys(game.brancalonia.reputationInfamia.infamiaLevels)
        .map(Number)
        .sort((a, b) => b - a);

      for (const level of levels) {
        if (infamia >= level) {
          return game.brancalonia.reputationInfamia.infamiaLevels[level];
        }
      }
      return game.brancalonia.reputationInfamia.infamiaLevels[0];
    };

    // ===== NUOVI METODI REPUTAZIONE =====
    CONFIG.Actor.documentClass.prototype.getReputation = function(type) {
      const reputations = this.getFlag(ReputationInfamiaSystem.NAMESPACE, 'reputations') || {};
      return reputations[type] || 0;
    };

    CONFIG.Actor.documentClass.prototype.setReputation = async function(type, value) {
      const reputations = this.getFlag(ReputationInfamiaSystem.NAMESPACE, 'reputations') || {};
      const oldValue = reputations[type] || 0;

      reputations[type] = Math.max(0, Math.min(100, value));
      await this.setFlag(ReputationInfamiaSystem.NAMESPACE, 'reputations', reputations);

      // Check per nuovi titoli
      if (game.settings.get(ReputationInfamiaSystem.NAMESPACE, 'dynamicTitles')) {
        await game.brancalonia.reputationInfamia._checkTitleEligibility(this);
      }

      return reputations[type];
    };

    CONFIG.Actor.documentClass.prototype.adjustReputation = async function(type, amount, reason = '') {
      const current = this.getReputation(type);
      const newValue = await this.setReputation(type, current + amount);

      // Registra evento nello storico
      if (game.settings.get(ReputationInfamiaSystem.NAMESPACE, 'trackHistory')) {
        await game.brancalonia.reputationInfamia._recordEvent(this, type, amount, reason);
      }

      return newValue;
    };

    CONFIG.Actor.documentClass.prototype.getTitles = function() {
      return this.getFlag(ReputationInfamiaSystem.NAMESPACE, 'titles') || [];
    };

    CONFIG.Actor.documentClass.prototype.hasTitle = function(titleKey) {
      const titles = this.getTitles();
      return titles.some(t => t.key === titleKey);
    };

    CONFIG.Actor.documentClass.prototype.grantTitle = async function(titleKey) {
      const titles = this.getTitles();
      const titleData = game.brancalonia.reputationInfamia.titles[titleKey];

      if (!titleData) return false;
      if (this.hasTitle(titleKey)) return false;

      titles.push({
        key: titleKey,
        name: titleData.name,
        category: titleData.category,
        grantedAt: game.time.worldTime
      });

      await this.setFlag(ReputationInfamiaSystem.NAMESPACE, 'titles', titles);

      // Notifica
      ChatMessage.create({
        content: `<div class="brancalonia-title-grant">
          <h3>🎖️ Nuovo Titolo Ottenuto!</h3>
          <p><strong>${this.name}</strong> ha ottenuto il titolo:</p>
          <p class="title-name">${titleData.name}</p>
          <p class="title-desc">${titleData.description}</p>
        </div>`,
        speaker: ChatMessage.getSpeaker({ actor: this })
      });

      return true;
    };

    CONFIG.Actor.documentClass.prototype.getTotalReputation = function() {
      const reputations = this.getFlag(ReputationInfamiaSystem.NAMESPACE, 'reputations') || {};
      const infamia = this.getInfamia();

      let total = -infamia; // Infamia conta negativamente

      for (const [type, value] of Object.entries(reputations)) {
        total += value;
      }

      return total;
    };

    CONFIG.Actor.documentClass.prototype.getReputationHistory = function(limit = 10) {
      const history = this.getFlag(ReputationInfamiaSystem.NAMESPACE, 'reputationHistory') || [];
      return history.slice(-limit);
    };
  }

  /**
   * Setup degli hooks di sistema
   */
  _setupHooks() {
    // Hook rendering scheda attore (per UI)
    Hooks.on('renderActorSheet', (app, html, data) => {
      if (!game.settings.get(ReputationInfamiaSystem.NAMESPACE, 'trackInfamia')) return;
      this._renderReputationUI(app, html, data);
    });

    // Hook su update attore
    Hooks.on('updateActor', (actor, data, options, userId) => {
      if (data.flags?.[ReputationInfamiaSystem.NAMESPACE]?.infamia !== undefined) {
        this._onInfamiaChange(actor);
      }
    });

    // Hook su canvas ready (per eventi casuali)
    Hooks.on('canvasReady', () => {
      if (game.settings.get(ReputationInfamiaSystem.NAMESPACE, 'randomEncounters')) {
        this._checkForBountyHunters();
      }
    });

    // Hook su danni applicati (da reputation-system)
    Hooks.on('dnd5e.applyDamage', async (target, damage, options) => {
      if (!game.settings.get(ReputationInfamiaSystem.NAMESPACE, 'useReputation')) return;

      // Se il bersaglio muore
      if (target.system.attributes.hp.value <= 0) {
        const killer = game.actors.get(options.attackerId);
        if (!killer) return;

        // Determina tipo di creatura uccisa
        const targetType = target.system.details.type?.value || 'unknown';

        if (targetType === 'humanoid' && target.token?.disposition === 1) {
          // Ucciso un innocente
          await killer.addInfamia(10, 'Omicidio di un innocente');
          await killer.adjustReputation('onore', -15, 'Omicidio');
          await killer.adjustReputation('santita', -10, 'Atto empio');
        } else if (targetType === 'fiend' || targetType === 'undead') {
          // Ucciso un mostro malvagio
          await killer.adjustReputation('gloria', 5, 'Sconfitta di un mostro');
          await killer.adjustReputation('santita', 3, 'Purificazione del male');
        }
      }
    });

    // Hook su skill rolls (per modificatori sociali)
    Hooks.on('dnd5e.rollSkill', (actor, skill, roll) => {
      if (!['per', 'dec', 'prf', 'ins'].includes(skill)) return;

      const infamia = actor.getInfamia();
      const infamiaLevel = actor.getInfamiaLevel();
      const totalRep = actor.getTotalReputation();

      // Applica modificatori basati su infamia
      if (infamia >= 25 && ['per', 'dec'].includes(skill)) {
        const modifier = Math.floor(-infamia / 25);
        roll.options.situational = (roll.options.situational || '') +
          ` ${modifier} (Infamia: ${infamiaLevel.name})`;
      }

      // Applica bonus reputazione positiva
      if (totalRep > 50 && skill === 'per') {
        const bonus = Math.floor(totalRep / 50);
        roll.options.situational = (roll.options.situational || '') +
          ` +${bonus} (Reputazione positiva)`;
      }
    });

    // Hook su passaggio del tempo (per decadimento)
    if (game.settings.get(ReputationInfamiaSystem.NAMESPACE, 'reputationDecay')) {
      Hooks.on('updateWorldTime', (worldTime, dt) => {
        // Ogni settimana di gioco
        if (dt >= 604800) {
          this._applyReputationDecay();
        }
      });
    }
  }

  /**
   * Registra i comandi chat
   */
  _registerChatCommands() {
    Hooks.on('chatMessage', (html, content, msg) => {
      const regex = /^\/(\w+)\s*(.*)?/i;
      const match = content.match(regex);
      if (!match) return;

      const [_, command, args] = match;

      switch(command.toLowerCase()) {
        case 'infamia':
          this._handleInfamiaCommand(args);
          return false;

        case 'reputazione':
        case 'rep':
          if (game.settings.get(ReputationInfamiaSystem.NAMESPACE, 'useReputation')) {
            this._handleReputationCommand(args);
            return false;
          }
          break;

        case 'titoli':
        case 'titolo':
          if (game.settings.get(ReputationInfamiaSystem.NAMESPACE, 'dynamicTitles')) {
            this._handleTitleCommand(args);
            return false;
          }
          break;
      }
    });
  }

  /**
   * Gestisce il comando /infamia
   */
  _handleInfamiaCommand(args) {
    const parts = args.trim().split(' ');
    const subCommand = parts[0]?.toLowerCase();
    const amount = parseInt(parts[1]);
    const reason = parts.slice(2).join(' ');

    const controlled = canvas.tokens.controlled[0]?.actor;
    if (!controlled) {
      ui.notifications.warn('Seleziona un token');
      return;
    }

    switch(subCommand) {
      case 'add':
        if (!isNaN(amount)) {
          controlled.addInfamia(amount, reason);
          ui.notifications.info(`Aggiunta ${amount} infamia a ${controlled.name}`);
        }
        break;

      case 'set':
        if (!isNaN(amount)) {
          controlled.setFlag(ReputationInfamiaSystem.NAMESPACE, 'infamia', amount);
          ui.notifications.info(`Infamia di ${controlled.name} impostata a ${amount}`);
        }
        break;

      case 'show':
      case 'info':
        this._showInfamiaInfo(controlled);
        break;

      case 'clear':
        controlled.setFlag(ReputationInfamiaSystem.NAMESPACE, 'infamia', 0);
        ui.notifications.info(`Infamia di ${controlled.name} azzerata`);
        break;

      default:
        this._showInfamiaDialog(controlled);
    }
  }

  /**
   * Gestisce il comando /reputazione
   */
  _handleReputationCommand(args) {
    const parts = args.trim().split(' ');
    const subCommand = parts[0]?.toLowerCase();

    const controlled = canvas.tokens.controlled[0]?.actor;
    if (!controlled) {
      ui.notifications.warn('Seleziona un token');
      return;
    }

    switch(subCommand) {
      case 'add':
        const type = parts[1];
        const amount = parseInt(parts[2]);
        const reason = parts.slice(3).join(' ');

        if (type && !isNaN(amount)) {
          controlled.adjustReputation(type, amount, reason);
          ui.notifications.info(`Aggiunta ${amount} ${type} a ${controlled.name}`);
        }
        break;

      case 'show':
      case 'info':
        this._showReputationInfo(controlled);
        break;

      default:
        this._showReputationDialog(controlled);
    }
  }

  /**
   * Gestisce il comando /titoli
   */
  _handleTitleCommand(args) {
    const controlled = canvas.tokens.controlled[0]?.actor;
    if (!controlled) {
      ui.notifications.warn('Seleziona un token');
      return;
    }

    const titles = controlled.getTitles();

    if (titles.length === 0) {
      ChatMessage.create({
        content: `<div class="brancalonia-titles">
          <h3>Titoli di ${controlled.name}</h3>
          <p>Nessun titolo ottenuto</p>
        </div>`,
        whisper: [game.user.id]
      });
    } else {
      const titleList = titles.map(t => `<li>${t.name}</li>`).join('');
      ChatMessage.create({
        content: `<div class="brancalonia-titles">
          <h3>Titoli di ${controlled.name}</h3>
          <ul>${titleList}</ul>
        </div>`,
        whisper: [game.user.id]
      });
    }
  }

  /**
   * Renderizza l'UI nella scheda attore
   */
  _renderReputationUI(app, html, data) {
    const actor = app.actor;
    if (actor.type !== 'character') return;

    const infamia = actor.getInfamia();
    const infamiaLevel = actor.getInfamiaLevel();

    // Trova la tab degli attributi
    const attributesTab = html.find('.tab.attributes');
    if (!attributesTab.length) return;

    // === BARRA INFAMIA (esistente da infamia-tracker) ===
    const infamiaBarHtml = `
      <div class="brancalonia-infamia-tracker">
        <h3 class="infamia-header">
          <i class="fas fa-skull"></i>
          Infamia: ${infamia} - ${infamiaLevel.name}
        </h3>
        <div class="infamia-bar-container">
          <div class="infamia-bar" style="width: ${infamia}%; background-color: ${this._getInfamiaColor(infamia)}">
            <span class="infamia-value">${infamia}/100</span>
          </div>
        </div>
        <div class="infamia-controls">
          <button class="infamia-decrease" data-action="decrease" title="Diminuisci Infamia">
            <i class="fas fa-minus"></i>
          </button>
          <button class="infamia-info" data-action="info" title="Informazioni Infamia">
            <i class="fas fa-info-circle"></i>
          </button>
          <button class="infamia-increase" data-action="increase" title="Aumenta Infamia">
            <i class="fas fa-plus"></i>
          </button>
          <button class="infamia-actions" data-action="actions" title="Azioni Criminali">
            <i class="fas fa-gavel"></i>
          </button>
        </div>
        ${infamiaLevel.effects.length > 0 ? `
        <div class="infamia-effects">
          <strong>Effetti:</strong>
          <ul>
            ${infamiaLevel.effects.map(e => `<li>${e}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
    `;

    // === SEZIONE REPUTAZIONI (nuovo) ===
    let reputationHtml = '';
    if (game.settings.get(ReputationInfamiaSystem.NAMESPACE, 'useReputation')) {
      const reputations = actor.getFlag(ReputationInfamiaSystem.NAMESPACE, 'reputations') || {};

      reputationHtml = `
        <div class="brancalonia-reputations">
          <h3 class="reputation-header">
            <i class="fas fa-trophy"></i>
            Reputazioni
          </h3>
          <div class="reputation-grid">
            ${Object.entries(this.reputationTypes).map(([key, type]) => {
              const value = reputations[key] || 0;
              return `
                <div class="reputation-item" data-rep="${key}">
                  <img src="${type.img}" width="20" height="20" title="${type.description}">
                  <span class="rep-name">${type.name}</span>
                  <span class="rep-value">${value}/${type.max}</span>
                  <div class="rep-bar" style="width: ${(value/type.max)*100}%"></div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // === SEZIONE TITOLI (nuovo) ===
    let titlesHtml = '';
    if (game.settings.get(ReputationInfamiaSystem.NAMESPACE, 'dynamicTitles')) {
      const titles = actor.getTitles();
      if (titles.length > 0) {
        titlesHtml = `
          <div class="brancalonia-titles">
            <h3 class="titles-header">
              <i class="fas fa-award"></i>
              Titoli e Nomea
            </h3>
            <div class="titles-list">
              ${titles.map(t => `
                <span class="title-badge title-${t.category}">${t.name}</span>
              `).join('')}
            </div>
          </div>
        `;
      }
    }

    // Inserisci tutto nell'HTML
    const fullHtml = infamiaBarHtml + reputationHtml + titlesHtml;
    attributesTab.append(fullHtml);

    // Aggiungi stili CSS
    this._injectStyles();

    // Aggiungi event listeners
    html.find('.infamia-controls button').click(async (event) => {
      const action = event.currentTarget.dataset.action;
      switch(action) {
        case 'decrease':
          await actor.addInfamia(-1);
          break;
        case 'increase':
          await actor.addInfamia(1);
          break;
        case 'info':
          this._showInfamiaInfo(actor);
          break;
        case 'actions':
          this._showInfamiaActionsDialog(actor);
          break;
      }
    });

    // Event listeners per reputazioni
    if (game.settings.get(ReputationInfamiaSystem.NAMESPACE, 'useReputation')) {
      html.find('.reputation-item').click((event) => {
        const repType = event.currentTarget.dataset.rep;
        this._showReputationEditDialog(actor, repType);
      });
    }
  }

  /**
   * Inietta gli stili CSS necessari
   */
  _injectStyles() {
    if (document.getElementById('brancalonia-reputation-styles')) return;

    const style = document.createElement('style');
    style.id = 'brancalonia-reputation-styles';
    style.innerHTML = `
      /* === Stili Infamia === */
      .brancalonia-infamia-tracker {
        margin: 10px 0;
        padding: 10px;
        border: 2px solid #8b4513;
        border-radius: 5px;
        background: linear-gradient(135deg, #f4e4c1 0%, #e8d4a1 100%);
      }

      .infamia-header {
        color: #5e2612;
        margin-bottom: 10px;
        font-family: 'Modesto Condensed', sans-serif;
      }

      .infamia-bar-container {
        width: 100%;
        height: 25px;
        background-color: #ddd;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        border: 1px solid #8b4513;
      }

      .infamia-bar {
        height: 100%;
        transition: width 0.3s ease, background-color 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .infamia-value {
        color: white;
        font-weight: bold;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
      }

      .infamia-controls {
        display: flex;
        gap: 5px;
        justify-content: center;
        margin-top: 10px;
      }

      .infamia-controls button {
        padding: 5px 10px;
        background: #8b4513;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .infamia-controls button:hover {
        background: #a0522d;
      }

      .infamia-effects {
        margin-top: 10px;
        padding: 5px;
        background: rgba(139, 69, 19, 0.1);
        border-radius: 3px;
        font-size: 0.9em;
      }

      .infamia-effects ul {
        margin: 5px 0;
        padding-left: 20px;
      }

      /* === Stili Reputazione === */
      .brancalonia-reputations {
        margin: 15px 0;
        padding: 10px;
        border: 2px solid #d4af37;
        border-radius: 5px;
        background: linear-gradient(135deg, #fff8dc 0%, #faebd7 100%);
      }

      .reputation-header {
        color: #8b6914;
        margin-bottom: 10px;
        font-family: 'Modesto Condensed', sans-serif;
      }

      .reputation-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
      }

      .reputation-item {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 5px;
        background: white;
        border: 1px solid #d4af37;
        border-radius: 3px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: transform 0.2s;
      }

      .reputation-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }

      .reputation-item img {
        flex-shrink: 0;
      }

      .rep-name {
        flex-grow: 1;
        font-weight: bold;
        font-size: 0.9em;
      }

      .rep-value {
        font-size: 0.85em;
        color: #666;
        z-index: 1;
      }

      .rep-bar {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 3px;
        background: linear-gradient(90deg, #d4af37, #ffd700);
        transition: width 0.3s ease;
      }

      /* === Stili Titoli === */
      .brancalonia-titles {
        margin: 15px 0;
        padding: 10px;
        border: 2px solid #800020;
        border-radius: 5px;
        background: linear-gradient(135deg, #fff5f5 0%, #ffe4e1 100%);
      }

      .titles-header {
        color: #800020;
        margin-bottom: 10px;
        font-family: 'Modesto Condensed', sans-serif;
      }

      .titles-list {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .title-badge {
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.85em;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .title-heroic {
        background: linear-gradient(135deg, #ffd700, #ffed4e);
        color: #8b6914;
        border: 1px solid #d4af37;
      }

      .title-infamy {
        background: linear-gradient(135deg, #8b0000, #dc143c);
        color: white;
        border: 1px solid #800020;
      }

      .title-religious {
        background: linear-gradient(135deg, #e6e6fa, #dda0dd);
        color: #4b0082;
        border: 1px solid #9370db;
      }

      .title-scholarly {
        background: linear-gradient(135deg, #4682b4, #5f9ea0);
        color: white;
        border: 1px solid #191970;
      }

      .title-neutral {
        background: linear-gradient(135deg, #d3d3d3, #a9a9a9);
        color: #2f4f4f;
        border: 1px solid #696969;
      }

      /* === Dialogs === */
      .brancalonia-dialog {
        font-family: 'Signika', sans-serif;
      }

      .brancalonia-dialog h3 {
        color: #5e2612;
        border-bottom: 2px solid #8b4513;
        padding-bottom: 5px;
        margin-bottom: 10px;
      }

      .brancalonia-dialog .dialog-buttons {
        margin-top: 15px;
        text-align: center;
      }

      .brancalonia-dialog button {
        margin: 0 5px;
        padding: 5px 15px;
        background: #8b4513;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
      }

      .brancalonia-dialog button:hover {
        background: #a0522d;
      }

      /* === Chat Messages === */
      .brancalonia-title-grant {
        padding: 10px;
        background: linear-gradient(135deg, #fff8dc 0%, #faebd7 100%);
        border: 2px solid #d4af37;
        border-radius: 5px;
      }

      .brancalonia-title-grant h3 {
        color: #8b6914;
        margin: 0 0 10px 0;
      }

      .brancalonia-title-grant .title-name {
        font-size: 1.2em;
        font-weight: bold;
        color: #800020;
        margin: 5px 0;
      }

      .brancalonia-title-grant .title-desc {
        font-style: italic;
        color: #666;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Mostra dialog informazioni infamia
   */
  _showInfamiaInfo(actor) {
    const infamia = actor.getInfamia();
    const level = actor.getInfamiaLevel();
    const history = actor.getReputationHistory ? actor.getReputationHistory(5) : [];

    let content = `
      <div class="brancalonia-dialog">
        <h3>Stato Infamia di ${actor.name}</h3>
        <p><strong>Livello Attuale:</strong> ${infamia} - ${level.name}</p>

        <h4>Effetti Attivi:</h4>
        <ul>
          ${level.effects.length > 0
            ? level.effects.map(e => `<li>${e}</li>`).join('')
            : '<li>Nessun effetto</li>'
          }
        </ul>

        <h4>Soglie Infamia:</h4>
        <ul>
          ${Object.entries(this.infamiaLevels).map(([threshold, data]) =>
            `<li><strong>${threshold}+:</strong> ${data.name}</li>`
          ).join('')}
        </ul>

        ${history.length > 0 ? `
        <h4>Eventi Recenti:</h4>
        <ul>
          ${history.map(e =>
            `<li>${e.reason || 'Modifica infamia'}: ${e.amount > 0 ? '+' : ''}${e.amount}</li>`
          ).join('')}
        </ul>
        ` : ''}
      </div>
    `;

    new Dialog({
      title: 'Informazioni Infamia',
      content: content,
      buttons: {
        close: {
          label: 'Chiudi',
          callback: () => {}
        }
      },
      default: 'close'
    }).render(true);
  }

  /**
   * Mostra dialog azioni criminali
   */
  _showInfamiaActionsDialog(actor) {
    const actionButtons = Object.entries(this.infamiaActions).map(([action, value]) =>
      `<button class="action-button" data-action="${action}" data-value="${value}">
        ${action} (+${value})
      </button>`
    ).join('');

    const content = `
      <div class="brancalonia-dialog">
        <h3>Azioni Criminali</h3>
        <p>Seleziona un'azione per aggiungere infamia:</p>
        <div class="action-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px;">
          ${actionButtons}
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: 'Azioni Criminali',
      content: content,
      buttons: {
        close: {
          label: 'Chiudi',
          callback: () => {}
        }
      },
      render: (html) => {
        html.find('.action-button').click(async (event) => {
          const action = event.currentTarget.dataset.action;
          const value = parseInt(event.currentTarget.dataset.value);

          await actor.addInfamia(value, action);

          ChatMessage.create({
            content: `<p><strong>${actor.name}</strong> ha commesso: ${action} (+${value} infamia)</p>`,
            speaker: ChatMessage.getSpeaker({ actor: actor })
          });

          dialog.close();
        });
      },
      default: 'close'
    });

    dialog.render(true);
  }

  /**
   * Mostra dialog gestione reputazione
   */
  _showReputationDialog(actor) {
    const reputations = actor.getFlag(ReputationInfamiaSystem.NAMESPACE, 'reputations') || {};
    const totalRep = actor.getTotalReputation();

    const content = `
      <div class="brancalonia-dialog">
        <h3>Gestione Reputazione - ${actor.name}</h3>

        <p><strong>Reputazione Totale:</strong> ${totalRep}</p>

        <h4>Reputazioni Positive:</h4>
        <div class="rep-manager">
          ${Object.entries(this.reputationTypes).map(([key, type]) => {
            const value = reputations[key] || 0;
            return `
              <div class="rep-control" style="margin: 10px 0;">
                <img src="${type.img}" width="20" height="20" style="vertical-align: middle;">
                <strong>${type.name}:</strong>
                <span id="rep-${key}-value">${value}</span>/${type.max}
                <button data-rep="${key}" data-change="-5">-5</button>
                <button data-rep="${key}" data-change="-1">-1</button>
                <button data-rep="${key}" data-change="+1">+1</button>
                <button data-rep="${key}" data-change="+5">+5</button>
              </div>
            `;
          }).join('')}
        </div>

        <h4>Azioni Rapide:</h4>
        <select id="rep-action-select" style="width: 100%; margin: 10px 0;">
          <option value="">-- Seleziona un'azione --</option>
          ${Object.entries(this.reputationActions).map(([action, effects]) =>
            `<option value="${action}">${action}</option>`
          ).join('')}
        </select>
        <button id="apply-action" style="width: 100%;">Applica Azione</button>
      </div>
    `;

    const dialog = new Dialog({
      title: 'Gestione Reputazione',
      content: content,
      buttons: {
        save: {
          label: 'Salva',
          callback: () => {}
        },
        close: {
          label: 'Chiudi',
          callback: () => {}
        }
      },
      render: (html) => {
        // Gestione pulsanti +/-
        html.find('button[data-rep]').click(async (event) => {
          const repType = event.currentTarget.dataset.rep;
          const change = parseInt(event.currentTarget.dataset.change);

          await actor.adjustReputation(repType, change);

          // Aggiorna display
          const newValue = actor.getReputation(repType);
          html.find(`#rep-${repType}-value`).text(newValue);
        });

        // Gestione azioni rapide
        html.find('#apply-action').click(async () => {
          const selectedAction = html.find('#rep-action-select').val();
          if (!selectedAction) return;

          const effects = this.reputationActions[selectedAction];

          for (const [type, value] of Object.entries(effects)) {
            if (type === 'infamia') {
              await actor.addInfamia(value, selectedAction);
            } else {
              await actor.adjustReputation(type, value, selectedAction);
            }
          }

          ChatMessage.create({
            content: `<p><strong>${actor.name}</strong>: ${selectedAction}</p>`,
            speaker: ChatMessage.getSpeaker({ actor: actor })
          });

          dialog.close();
        });
      },
      default: 'close'
    });

    dialog.render(true);
  }

  /**
   * Mostra dialog modifica singola reputazione
   */
  _showReputationEditDialog(actor, repType) {
    const repData = this.reputationTypes[repType];
    const currentValue = actor.getReputation(repType);

    const content = `
      <div class="brancalonia-dialog">
        <h3>
          <img src="${repData.img}" width="24" height="24" style="vertical-align: middle;">
          ${repData.name}
        </h3>
        <p><em>${repData.description}</em></p>
        <p><strong>Valore Attuale:</strong> ${currentValue}/${repData.max}</p>

        <div style="margin: 15px 0;">
          <label for="new-value">Nuovo Valore:</label>
          <input type="range" id="new-value" min="0" max="${repData.max}" value="${currentValue}" style="width: 100%;">
          <div style="text-align: center;">
            <span id="value-display">${currentValue}</span>
          </div>
        </div>

        <div style="margin: 15px 0;">
          <label for="reason">Motivo (opzionale):</label>
          <input type="text" id="reason" placeholder="Inserisci il motivo..." style="width: 100%;">
        </div>
      </div>
    `;

    new Dialog({
      title: `Modifica ${repData.name}`,
      content: content,
      buttons: {
        save: {
          label: 'Salva',
          callback: async (html) => {
            const newValue = parseInt(html.find('#new-value').val());
            const reason = html.find('#reason').val();

            await actor.setReputation(repType, newValue);

            if (reason && game.settings.get(ReputationInfamiaSystem.NAMESPACE, 'trackHistory')) {
              await this._recordEvent(actor, repType, newValue - currentValue, reason);
            }
          }
        },
        cancel: {
          label: 'Annulla',
          callback: () => {}
        }
      },
      render: (html) => {
        const slider = html.find('#new-value');
        const display = html.find('#value-display');

        slider.on('input', () => {
          display.text(slider.val());
        });
      },
      default: 'save'
    }).render(true);
  }

  /**
   * Ottiene il colore della barra infamia basato sul livello
   */
  _getInfamiaColor(infamia) {
    if (infamia === 0) return '#28a745';      // Verde
    if (infamia < 10) return '#5cb85c';       // Verde chiaro
    if (infamia < 25) return '#f0ad4e';       // Arancione
    if (infamia < 50) return '#ff6b6b';       // Rosso chiaro
    if (infamia < 75) return '#dc3545';       // Rosso
    return '#8b0000';                          // Rosso scuro
  }

  /**
   * Applica Active Effects basati sul livello di infamia
   */
  async _applyInfamiaEffects(actor, infamia) {
    // Rimuovi effetti esistenti
    const existingEffects = actor.effects.filter(e =>
      e.origin === `${ReputationInfamiaSystem.NAMESPACE}.infamia`
    );

    for (const effect of existingEffects) {
      await effect.delete();
    }

    // Applica nuovi effetti basati sul livello
    const level = actor.getInfamiaLevel();

    if (infamia >= 25) {
      // Penalità ai tiri sociali con le autorità
      const penalty = -Math.floor(infamia / 25);

      await actor.createEmbeddedDocuments('ActiveEffect', [{
        name: `Infamia: ${level.name}`,
        icon: 'icons/skills/social/intimidation-impressing.webp',
        origin: `${ReputationInfamiaSystem.NAMESPACE}.infamia`,
        'duration.rounds': undefined,
        disabled: false,
        changes: [
          {
            key: 'system.skills.per.bonuses.check',
            mode: 2,
            value: penalty,
            priority: 20
          },
          {
            key: 'system.skills.dec.bonuses.check',
            mode: 2,
            value: penalty,
            priority: 20
          }
        ]
      }]);
    }
  }

  /**
   * Controlla se il PG è idoneo per nuovi titoli
   */
  async _checkTitleEligibility(actor) {
    const infamia = actor.getInfamia();
    const reputations = actor.getFlag(ReputationInfamiaSystem.NAMESPACE, 'reputations') || {};
    const currentTitles = actor.getTitles();

    for (const [titleKey, titleData] of Object.entries(this.titles)) {
      // Skip se già possiede il titolo
      if (currentTitles.some(t => t.key === titleKey)) continue;

      // Controlla requisiti
      let eligible = true;

      for (const [req, value] of Object.entries(titleData.requirements)) {
        if (req === 'infamia') {
          if (infamia < value) eligible = false;
        } else if (this.reputationTypes[req]) {
          if ((reputations[req] || 0) < value) eligible = false;
        } else {
          // Altri requisiti custom (es. combatsWon, traveledScenes)
          const flagValue = actor.getFlag(ReputationInfamiaSystem.NAMESPACE, req) || 0;
          if (flagValue < value) eligible = false;
        }
      }

      // Assegna titolo se idoneo
      if (eligible) {
        await actor.grantTitle(titleKey);
      }
    }
  }

  /**
   * Registra un evento nello storico
   */
  async _recordEvent(actor, type, amount, reason) {
    const history = actor.getFlag(ReputationInfamiaSystem.NAMESPACE, 'reputationHistory') || [];

    history.push({
      type: type,
      amount: amount,
      reason: reason || 'Modifica manuale',
      timestamp: game.time.worldTime,
      scene: canvas.scene?.name || 'Unknown'
    });

    // Mantieni solo gli ultimi N eventi
    if (history.length > this.maxHistoryEntries) {
      history.splice(0, history.length - this.maxHistoryEntries);
    }

    await actor.setFlag(ReputationInfamiaSystem.NAMESPACE, 'reputationHistory', history);
  }

  /**
   * Gestisce il cambio di infamia
   */
  _onInfamiaChange(actor) {
    // Refresh la scheda se aperta
    if (actor.sheet?.rendered) {
      actor.sheet.render(false);
    }
  }

  /**
   * Controlla per cacciatori di taglie
   */
  _checkForBountyHunters() {
    // Implementazione eventi casuali cacciatori
    const party = game.actors.filter(a => a.type === 'character' && a.hasPlayerOwner);

    for (const actor of party) {
      const infamia = actor.getInfamia();

      if (infamia >= 50) {
        const roll = new Roll('1d100').roll({ async: false });

        if (roll.total <= infamia / 2) {
          ChatMessage.create({
            content: `<div class="brancalonia-encounter">
              <h3>⚔️ Cacciatori di Taglie!</h3>
              <p>I cacciatori di taglie hanno rintracciato <strong>${actor.name}</strong>!</p>
              <p>Livello infamia: ${actor.getInfamiaLevel().name} (${infamia})</p>
            </div>`,
            speaker: { alias: 'Sistema Infamia' }
          });
        }
      }
    }
  }

  /**
   * Applica decadimento reputazione
   */
  async _applyReputationDecay() {
    const actors = game.actors.filter(a => a.type === 'character');

    for (const actor of actors) {
      const reputations = actor.getFlag(ReputationInfamiaSystem.NAMESPACE, 'reputations') || {};

      for (const [type, value] of Object.entries(reputations)) {
        if (value > 25) {
          // Decade del 10% ogni settimana oltre il livello 25
          const decay = Math.floor(value * 0.1);
          await actor.adjustReputation(type, -decay, 'Decadimento temporale');
        }
      }
    }
  }

  /**
   * Crea macro automatiche
   */
  async _createMacros() {
    // Macro Gestione Reputazione
    const existingMacro = game.macros.find(m => m.name === 'Gestione Reputazione e Infamia');

    if (!existingMacro && game.user.isGM) {
      await Macro.create({
        name: 'Gestione Reputazione e Infamia',
        type: 'script',
        img: 'icons/skills/social/diplomacy-handshake-yellow.webp',
        command: `
// Gestione Reputazione e Infamia Brancalonia
const controlled = canvas.tokens.controlled[0]?.actor;

if (!controlled) {
  ui.notifications.warn('Seleziona un token');
  return;
}

// Mostra dialog principale
game.brancalonia.reputationInfamia._showReputationDialog(controlled);
        `
      });
    }
  }
}

// Registra il modulo quando Foundry è pronto
Hooks.once('init', async () => {
  await ReputationInfamiaSystem.initialize();
});

// Esporta per compatibilità
window.ReputationInfamiaSystem = ReputationInfamiaSystem;