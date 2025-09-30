/**
 * Sistema Reputazione e Infamia per Brancalonia
 * Gestione completa di reputazione, infamia, nomea e conseguenze sociali
 * Compatibile con dnd5e system per Foundry VTT v13
 */

class ReputationSystem {
  constructor() {
    // Scale di reputazione e infamia
    this.reputationScale = {
      sconosciuto: { min: 0, max: 9, title: 'Sconosciuto', modifier: 0, color: '#888888' },
      noto: { min: 10, max: 24, title: 'Noto', modifier: 1, color: '#4CAF50' },
      rinomato: { min: 25, max: 49, title: 'Rinomato', modifier: 2, color: '#8BC34A' },
      famoso: { min: 50, max: 99, title: 'Famoso', modifier: 3, color: '#FFEB3B' },
      leggendario: { min: 100, max: 199, title: 'Leggendario', modifier: 4, color: '#FF9800' },
      mitico: { min: 200, max: 999, title: 'Mitico', modifier: 5, color: '#9C27B0' }
    };

    this.infamyScale = {
      incensurato: { min: 0, max: 9, title: 'Incensurato', modifier: 0, color: '#FFFFFF' },
      sospetto: { min: 10, max: 24, title: 'Sospetto', modifier: -1, color: '#FFC107' },
      famigerato: { min: 25, max: 49, title: 'Famigerato', modifier: -2, color: '#FF5722' },
      infame: { min: 50, max: 99, title: 'Infame', modifier: -3, color: '#F44336' },
      maledetto: { min: 100, max: 199, title: 'Maledetto', modifier: -4, color: '#9C27B0' },
      dannato: { min: 200, max: 999, title: 'Dannato', modifier: -5, color: '#000000' }
    };

    // Tipi di reputazione positiva (mantenuti dal codice originale)
    this.reputationTypes = {
      onore: {
        name: 'Onore',
        img: 'icons/skills/social/diplomacy-handshake-yellow.webp',
        description: 'Rispetto guadagnato attraverso azioni nobili',
        max: 100,
        benefits: {
          10: 'Rispetto dai cittadini onesti',
          25: 'Sconto 10% presso mercanti rispettabili',
          50: 'Inviti a eventi nobiliari',
          75: 'Protezione legale gratuita',
          100: 'Cavalierato o titolo nobiliare'
        },
        penalties: {
          negative: 'Disprezzo dei criminali, bersaglio di fuorilegge'
        }
      },
      fama: {
        name: 'Fama',
        img: 'icons/skills/social/party-crowd-celebration.webp',
        description: 'Notorietà per le proprie imprese',
        max: 100,
        benefits: {
          10: 'Riconosciuto nelle taverne locali',
          25: 'Drinks gratuiti, storie sul tuo conto',
          50: 'Ballate composte sulle tue gesta',
          75: 'Fama in tutto il regno',
          100: 'Leggenda vivente'
        },
        penalties: {
          high: 'Difficile passare inosservato, falsi eroi ti sfidano'
        }
      },
      gloria: {
        name: 'Gloria',
        img: 'icons/equipment/head/crown-gold-laurel.webp',
        description: 'Gloria ottenuta in battaglia e duelli',
        max: 100,
        benefits: {
          10: 'Rispetto dai guerrieri',
          25: 'Accesso a tornei esclusivi',
          50: 'Squire personale',
          75: 'Comando di truppe',
          100: 'Campione del Regno'
        }
      },
      santita: {
        name: 'Santità',
        img: 'icons/magic/holy/angel-wings-gray.webp',
        description: 'Devozione religiosa e miracoli',
        max: 100,
        benefits: {
          10: 'Benedizioni minori gratuite',
          25: 'Accesso a reliquie sacre',
          50: 'Guarigioni miracolose 1/settimana',
          75: 'Immunità a maledizioni',
          100: 'Candidato alla beatificazione'
        }
      },
      saggezza: {
        name: 'Saggezza',
        img: 'icons/tools/scribal/scroll-bound-brown.webp',
        description: 'Rispetto per conoscenza e buon consiglio',
        max: 100,
        benefits: {
          10: 'Consultato per consigli',
          25: 'Accesso a biblioteche private',
          50: 'Posizione come consigliere',
          75: 'Studenti e seguaci',
          100: 'Saggio del Regno'
        }
      }
    };

    // Titoli e nomea
    this.titles = {
      // TITOLI POSITIVI
      positive: {
        protettore: {
          name: 'Il Protettore',
          requirements: { reputation: 50, deed: 'Salvato una comunità' },
          benefits: '+2 a Persuasione con civili, sconto 20% cure',
          description: 'Protettore dei deboli e degli indifesi'
        },
        benefattore: {
          name: 'Il Benefattore',
          requirements: { reputation: 25, gold_donated: 1000 },
          benefits: 'Accesso a servizi di lusso, +3 a Persuasione con mercanti',
          description: 'Noto per la sua generosità'
        },
        cacciatore_mostri: {
          name: 'Cacciatore di Mostri',
          requirements: { reputation: 30, monsters_killed: 10 },
          benefits: '+5 danni contro mostri, informazioni gratuite su mostri',
          description: 'Sterminatore di creature malvagie'
        },
        campione_giustizia: {
          name: 'Campione della Giustizia',
          requirements: { reputation: 75, criminals_captured: 5 },
          benefits: 'Immunità diplomatica minore, +4 a Intimidire criminali',
          description: "Paladino della legge e dell'ordine"
        },
        eroe_popolo: {
          name: 'Eroe del Popolo',
          requirements: { reputation: 100, faction_rep: { popolo: 50 } },
          benefits: 'Supporto popolare, alloggio gratuito ovunque',
          description: 'Amato dalle masse popolari'
        },
        salvatore: {
          name: 'Il Salvatore',
          requirements: { reputation: 150, lives_saved: 50 },
          benefits: 'Benedizioni divine, +6 a prove di Medicina',
          description: 'Salvatore di innumerevoli vite'
        }
      },

      // TITOLI NEGATIVI
      negative: {
        furfante: {
          name: 'Furfante',
          requirements: { infamy: 25, thefts: 10 },
          penalties: '-2 a Persuasione, +20% prezzi legali',
          benefits: '+2 a Furtività, contatti criminali',
          description: 'Ladro e truffatore di professione'
        },
        assassino: {
          name: "L'Assassino",
          requirements: { infamy: 50, murders: 3 },
          penalties: 'Ricercato, -4 a tutte le prove sociali con civili',
          benefits: '+3 danni stealth, paura negli avversari',
          description: 'Killer spietato e efficiente'
        },
        traditore: {
          name: 'Il Traditore',
          requirements: { infamy: 40, betrayals: 1 },
          penalties: '-5 a Persuasione, nessuno si fida',
          benefits: '+3 a Inganno, accesso a informazioni segrete',
          description: 'Non ci si può fidare di lui'
        },
        macellaio: {
          name: 'Il Macellaio',
          requirements: { infamy: 75, civilian_kills: 10 },
          penalties: 'Orrore negli innocenti, cacciato dalle autorità',
          benefits: '+4 a Intimidire, terrore negli avversari',
          description: 'Massacratore di innocenti'
        },
        eretico: {
          name: "L'Eretico",
          requirements: { infamy: 60, blasphemy: 3 },
          penalties: 'Scomunicato, -6 con fazioni religiose',
          benefits: 'Resistenza a charme divini, seguaci fanatici',
          description: 'Nemico della fede ortodossa'
        },
        demonio: {
          name: 'Demonio in Terra',
          requirements: { infamy: 200, evil_acts: 50 },
          penalties: 'Odiato universalmente, cacciato ovunque',
          benefits: 'Aura di terrore, potere demoniaco',
          description: 'Incarnazione del male assoluto'
        }
      },

      // TITOLI NEUTRALI/SPECIALI
      neutral: {
        misterioso: {
          name: 'Il Misterioso',
          requirements: { reputation: 30, infamy: 30 },
          benefits: '+3 a Furtività e Inganno, identità nascosta',
          description: 'Le sue vere intenzioni sono un enigma'
        },
        mercenario: {
          name: 'Il Mercenario',
          requirements: { contracts_completed: 20 },
          benefits: 'Accesso a contratti lucrativi, +2 a Intimidire',
          description: 'Spada in vendita al miglior offerente'
        },
        vagabondo: {
          name: 'Il Vagabondo',
          requirements: { places_visited: 10 },
          benefits: 'Conoscenza geografia, +2 a Sopravvivenza',
          description: 'Viaggiatore instancabile'
        }
      }
    };

    // Azioni che influenzano la reputazione (mantenute dal codice originale)
    this.reputationActions = {
      // Azioni positive
      salva_innocenti: { onore: 10, fama: 5, gloria: 3 },
      vinci_duello_onore: { onore: 5, gloria: 10, fama: 8 },
      dona_poveri: { onore: 5, santita: 8, fama: 2 },
      sconfiggi_mostro: { gloria: 10, fama: 10, onore: 3 },
      completa_missione_sacra: { santita: 15, onore: 5, fama: 5 },
      risolvi_disputa: { saggezza: 10, onore: 5, fama: 3 },
      scoperta_importante: { saggezza: 15, fama: 8 },
      proteggi_deboli: { onore: 8, santita: 5, gloria: 3 },

      // Azioni negative
      uccidi_innocente: { onore: -20, santita: -15, fama: 5 },
      tradimento: { onore: -25, fama: 10 },
      sacrilegio: { santita: -30, onore: -10 },
      codardia: { gloria: -20, onore: -10, fama: -5 },
      furto: { onore: -5, santita: -3 },
      menzogna: { onore: -3, saggezza: -5 }
    };

    // Eventi che influenzano reputazione
    this.reputationEvents = new Map();

    // Non chiamare metodi privati nel constructor
  }

  /**
   * Metodo statico di inizializzazione completo
   */
  static initialize() {
    console.log('👑 Inizializzazione Sistema Reputazione');

    // Registrazione settings
    this.registerSettings();

    // Creazione istanza globale
    const instance = new ReputationSystem();
    instance._setupHooks();
    instance._registerSettings();

    // Salva nell'oggetto globale
    if (!game.brancalonia) game.brancalonia = {};
    game.brancalonia.reputationSystem = instance;

    // Registrazione comandi chat
    this.registerChatCommands();

    // Creazione macro automatica
    this.createMacros();

    // Estensione Actor per reputazione
    this.extendActor();

    console.log('✅ Sistema Reputazione inizializzato');
  }

  /**
   * Registra le impostazioni del modulo
   */
  static registerSettings() {
    game.settings.register('brancalonia-bigat', 'reputationEffects', {
      name: 'Effetti Reputazione',
      hint: 'La reputazione influenza prezzi, interazioni e quest',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'infamyConsequences', {
      name: 'Conseguenze Infamia',
      hint: "L'infamia porta a conseguenze legali e sociali",
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'dynamicTitles', {
      name: 'Titoli Dinamici',
      hint: 'I titoli vengono assegnati automaticamente in base alle azioni',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'useReputation', {
      name: 'Sistema Reputazione Positiva',
      hint: "Attiva il sistema di reputazione positiva oltre all'infamia",
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'reputationDecay', {
      name: 'Decadimento Reputazione',
      hint: 'La reputazione decade nel tempo se non mantenuta',
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
    // Comando per gestire reputazione
    game.socket.on('system.brancalonia-bigat', (data) => {
      if (data.type === 'reputation-command' && game.user.isGM) {
        const instance = game.brancalonia?.reputationSystem;
        if (instance) {
          switch (data.command) {
            case 'adjustRep':
              instance.adjustReputation(data.actor, data.type, data.amount, data.reason);
              break;
            case 'adjustInfamy':
              instance.adjustInfamy(data.actor, data.amount, data.reason);
              break;
            case 'grantTitle':
              instance.grantTitle(data.actor, data.titleKey, data.category);
              break;
            case 'checkTitle':
              instance.checkTitleEligibility(data.actor);
              break;
          }
        }
      }
    });

    // Comando testuale per reputazione
    if (game.modules.get('monk-enhanced-journal')?.active) {
      game.MonksEnhancedJournal?.registerChatCommand('/reputazione', {
        name: 'Gestisci Reputazione',
        callback: (args) => {
          const instance = game.brancalonia?.reputationSystem;
          if (instance && game.user.isGM) {
            if (args[0] === 'rep' && args.length >= 3) {
              // /reputazione rep @personaggio tipo +/-valore [motivo]
              const actorName = args[1]?.replace('@', '');
              const type = args[2];
              const amount = parseInt(args[3]);
              const reason = args.slice(4).join(' ') || 'Modifica manuale';

              const actor = game.actors.find(a => a.name.toLowerCase().includes(actorName?.toLowerCase()));
              if (actor) {
                instance.adjustReputation(actor, type, amount, reason);
              } else {
                ui.notifications.error('Attore non trovato!');
              }
            } else if (args[0] === 'infamia' && args.length >= 3) {
              // /reputazione infamia @personaggio +/-valore [motivo]
              const actorName = args[1]?.replace('@', '');
              const amount = parseInt(args[2]);
              const reason = args.slice(3).join(' ') || 'Modifica manuale';

              const actor = game.actors.find(a => a.name.toLowerCase().includes(actorName?.toLowerCase()));
              if (actor) {
                instance.adjustInfamy(actor, amount, reason);
              } else {
                ui.notifications.error('Attore non trovato!');
              }
            } else {
              instance.renderReputationManager();
            }
          }
        },
        help: 'Uso: /reputazione [rep @personaggio tipo +/-valore motivo] - Gestisce reputazione e infamia'
      });
    }
  }

  /**
   * Crea macro automatiche
   */
  static createMacros() {
    if (!game.user.isGM) return;

    const macroData = {
      name: '👑 Gestione Reputazione',
      type: 'script',
      img: 'icons/skills/social/diplomacy-peace-agreement.webp',
      command: `
const repSystem = game.brancalonia?.reputationSystem;
if (repSystem) {
  repSystem.renderReputationManager();
} else {
  ui.notifications.error("Sistema Reputazione non inizializzato!");
}
      `,
      folder: null,
      sort: 0,
      ownership: { default: 0, [game.user.id]: 3 },
      flags: { 'brancalonia-bigat': { 'auto-generated': true } }
    };

    // Controlla se esiste già
    const existing = game.macros.find(m => m.name === macroData.name);
    if (!existing) {
      Macro.create(macroData);
      console.log('✅ Macro Reputazione creata');
    }
  }

  /**
   * Estende la classe Actor con metodi reputazione
   */
  static extendActor() {
    // Metodo per ottenere livello reputazione generale
    Actor.prototype.getReputationLevel = function () {
      const instance = game.brancalonia?.reputationSystem;
      if (instance) {
        const total = instance.getTotalReputation(this);
        return instance._getReputationLevel(total);
      }
      return null;
    };

    // Metodo per ottenere livello infamia
    Actor.prototype.getInfamyLevel = function () {
      const instance = game.brancalonia?.reputationSystem;
      if (instance) {
        const infamy = this.flags.brancalonia?.infamia || 0;
        return instance._getInfamyLevel(infamy);
      }
      return instance?.infamyScale.incensurato || null;
    };

    // Metodo per ottenere reputazione specifica
    Actor.prototype.getReputation = function (type) {
      const instance = game.brancalonia?.reputationSystem;
      if (instance) {
        return instance.getReputation(this, type);
      }
      return 0;
    };

    // Metodo per ottenere titoli
    Actor.prototype.getTitles = function () {
      return this.flags.brancalonia?.titles || [];
    };

    // Metodo per ottenere modificatore sociale
    Actor.prototype.getSocialModifier = function () {
      const instance = game.brancalonia?.reputationSystem;
      if (instance) {
        return instance._getSocialModifier(this);
      }
      return 0;
    };

    // Metodo per controllare se ha titolo
    Actor.prototype.hasTitle = function (titleKey) {
      const titles = this.getTitles();
      return titles.some(t => t.key === titleKey);
    };
  }

  _setupHooks() {
    // Hook per modifiche reputazione dopo azioni (mantenuto dal codice originale)
    Hooks.on('actionCompleted', (action, actor) => {
      if (this.reputationActions[action]) {
        this.adjustReputationMultiple(actor, this.reputationActions[action]);
      }
    });

    // Hook per modifiche sociali basate su reputazione (aggiornato)
    Hooks.on('dnd5e.rollSkill', (actor, roll, skillId) => {
      if (!game.settings.get('brancalonia-bigat', 'reputationEffects')) return;

      // Applica modificatori sociali automaticamente
      const socialSkills = ['per', 'dec', 'inti', 'ins'];
      if (socialSkills.includes(skillId)) {
        const modifier = this._getSocialModifier(actor);
        if (modifier !== 0) {
          // Notifica modificatore applicato
          ChatMessage.create({
            content: `
              <div class="reputation-modifier">
                <p><strong>${actor.name}</strong> applica modificatore sociale: ${modifier > 0 ? '+' : ''}${modifier}</p>
                <p><em>Reputazione Totale: ${this.getTotalReputation(actor)}</em></p>
              </div>
            `,
            whisper: [game.user.id]
          });
        }
      }
    });

    // Hook per azioni che influenzano reputazione
    Hooks.on('dnd5e.applyDamage', (target, damage, options) => {
      const attacker = options.attacker;
      if (!attacker?.hasPlayerOwner) return;

      // Uccidere civili innocenti aumenta infamia e diminuisce onore
      if (target.flags.brancalonia?.isInnocent && damage >= target.system.attributes.hp.value) {
        this.adjustInfamy(attacker, 5, `Ucciso civile innocente: ${target.name}`);
        this.adjustReputation(attacker, 'onore', -10);
        this.adjustReputation(attacker, 'santita', -8);
      }

      // Uccidere criminali ricercati aumenta reputazione
      if (target.flags.brancalonia?.isCriminal && damage >= target.system.attributes.hp.value) {
        this.adjustReputation(attacker, 'onore', 3);
        this.adjustReputation(attacker, 'gloria', 2);
      }

      // Uccidere mostri aumenta reputazione
      if (target.type === 'npc' && target.system.details?.type?.value === 'monstrosity' && damage >= target.system.attributes.hp.value) {
        this.adjustReputation(attacker, 'gloria', 5);
        this.adjustReputation(attacker, 'fama', 3);
      }
    });

    // Hook per completamento quest
    Hooks.on('createChatMessage', (message, options, userId) => {
      if (message.flags?.brancalonia?.questComplete) {
        const quest = message.flags.brancalonia.quest;
        const actor = game.actors.get(message.speaker.actor);

        if (quest && actor) {
          // Reputazione da quest
          if (quest.reputationReward) {
            this.adjustReputationMultiple(actor, quest.reputationReward);
          }

          // Infamia da quest malvagie
          if (quest.infamyPenalty) {
            this.adjustInfamy(actor, quest.infamyPenalty, `Quest malvagia: ${quest.name}`);
          }

          this.checkTitleEligibility(actor);
        }
      }
    });

    // Hook eventi temporali per decadimento
    Hooks.on('timePassed', (worldTime, dt) => {
      if (dt >= 604800 && game.user.isGM) { // Ogni settimana (604800 secondi)
        game.actors.filter(a => a.hasPlayerOwner).forEach(actor => {
          this.decayReputation(actor);
        });
      }
    });
  }

  _registerSettings() {
    // Settings già registrate in registerSettings() statico
  }

  /**
   * Ottieni reputazione totale di un attore (mantenuto dal codice originale)
   */
  getTotalReputation(actor) {
    const reps = actor.flags.brancalonia?.reputations || {};
    const infamia = actor.flags.brancalonia?.infamia || 0;

    let total = -infamia; // Infamia conta negativamente

    for (const [type, value] of Object.entries(reps)) {
      total += value;
    }

    return Math.max(-100, Math.min(100, total));
  }

  /**
   * Ottieni reputazione specifica (mantenuto dal codice originale)
   */
  getReputation(actor, type) {
    return actor.flags.brancalonia?.reputations?.[type] || 0;
  }

  /**
   * Aggiusta reputazione singola (aggiornato con controlli titoli)
   */
  async adjustReputation(actor, type, amount, reason = 'Azione eroica') {
    const repType = this.reputationTypes[type];
    if (!repType) {
      ui.notifications.error(`Tipo reputazione ${type} non valido!`);
      return;
    }

    const reps = actor.flags.brancalonia?.reputations || {};
    const current = reps[type] || 0;
    const newValue = Math.max(0, Math.min(repType.max, current + amount));

    reps[type] = newValue;
    await actor.setFlag('brancalonia-bigat', 'reputations', reps);

    // Controlla benefici (mantenuto dal codice originale)
    await this._checkReputationBenefits(actor, type, current, newValue);

    // Notifica
    const emoji = amount > 0 ? '⬆️' : '⬇️';
    ChatMessage.create({
      content: `
        <div class="brancalonia-reputation-change">
          <h3>${emoji} ${repType.name}</h3>
          <p><strong>${actor.name}:</strong> ${amount > 0 ? '+' : ''}${amount}</p>
          <p><strong>Motivo:</strong> ${reason}</p>
          <p>Valore attuale: ${newValue}/${repType.max}</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    // Aggiorna reputazione totale
    await this._updateTotalReputation(actor);

    // Controlla titoli se abilitati
    if (game.settings.get('brancalonia-bigat', 'dynamicTitles')) {
      this.checkTitleEligibility(actor);
    }

    // Registra evento per storico
    await this._recordReputationEvent(actor, 'reputation', amount, reason, type);
  }

  /**
   * Aggiusta infamia di un attore (nuovo metodo)
   */
  async adjustInfamy(actor, amount, reason = 'Azione malvagia') {
    const currentInfamy = actor.flags.brancalonia?.infamia || 0;
    const newInfamy = Math.max(0, Math.min(999, currentInfamy + amount));

    await actor.setFlag('brancalonia-bigat', 'infamia', newInfamy);

    // Controlla cambio livello
    const oldLevel = this._getInfamyLevel(currentInfamy);
    const newLevel = this._getInfamyLevel(newInfamy);

    // Notifica
    const emoji = amount > 0 ? '📈' : '📉';
    ChatMessage.create({
      content: `
        <div class="brancalonia-infamy">
          <h3>${emoji} Infamia</h3>
          <p><strong>${actor.name}:</strong> ${amount > 0 ? '+' : ''}${amount} punti</p>
          <p><strong>Motivo:</strong> ${reason}</p>
          <p>Infamia attuale: ${newInfamy} (${newLevel.title})</p>
          ${oldLevel.title !== newLevel.title ? `
            <p class="level-change">
              <strong>⚠️ Nuovo livello di infamia:</strong> ${newLevel.title}!
            </p>
          ` : ''}
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    // Registra evento per storico
    await this._recordReputationEvent(actor, 'infamy', amount, reason);

    // Controlla conseguenze legali
    if (game.settings.get('brancalonia-bigat', 'infamyConsequences') && newInfamy >= 50) {
      this._handleInfamyConsequences(actor, newLevel);
    }

    // Controlla titoli
    if (game.settings.get('brancalonia-bigat', 'dynamicTitles')) {
      this.checkTitleEligibility(actor);
    }

    // Aggiorna reputazione totale
    await this._updateTotalReputation(actor);
  }

  /**
   * Aggiusta reputazioni multiple (mantenuto dal codice originale)
   */
  async adjustReputationMultiple(actor, changes) {
    for (const [type, amount] of Object.entries(changes)) {
      if (amount !== 0) {
        await this.adjustReputation(actor, type, amount);
      }
    }
  }

  /**
   * Ottieni livello reputazione generale
   */
  _getReputationLevel(total) {
    for (const level of Object.values(this.reputationScale)) {
      if (total >= level.min && total <= level.max) {
        return level;
      }
    }
    return this.reputationScale.mitico; // Fallback per valori molto alti
  }

  /**
   * Ottieni livello infamia
   */
  _getInfamyLevel(infamy) {
    for (const level of Object.values(this.infamyScale)) {
      if (infamy >= level.min && infamy <= level.max) {
        return level;
      }
    }
    return this.infamyScale.dannato; // Fallback per valori molto alti
  }

  /**
   * Controlla benefici reputazione (mantenuto dal codice originale)
   */
  async _checkReputationBenefits(actor, type, oldValue, newValue) {
    const repType = this.reputationTypes[type];

    for (const [threshold, benefit] of Object.entries(repType.benefits)) {
      const thresh = parseInt(threshold);

      // Nuovo beneficio sbloccato
      if (oldValue < thresh && newValue >= thresh) {
        ChatMessage.create({
          content: `
            <div class="brancalonia-reputation-benefit">
              <h3>🎖️ Beneficio Sbloccato!</h3>
              <p><strong>${actor.name}</strong> - ${repType.name} ${thresh}</p>
              <p><em>${benefit}</em></p>
            </div>
          `,
          speaker: ChatMessage.getSpeaker({ actor })
        });

        // Applica effetto se necessario
        await this._applyReputationEffect(actor, type, thresh);
      }

      // Beneficio perso
      if (oldValue >= thresh && newValue < thresh) {
        ChatMessage.create({
          content: `
            <div class="brancalonia-reputation-lost">
              <p><strong>${actor.name}</strong> perde: ${benefit}</p>
            </div>
          `,
          speaker: ChatMessage.getSpeaker({ actor })
        });

        await this._removeReputationEffect(actor, type, thresh);
      }
    }
  }

  /**
   * Controlla eligibilità per titoli (nuovo metodo)
   */
  async checkTitleEligibility(actor) {
    const totalRep = this.getTotalReputation(actor);
    const infamy = actor.flags.brancalonia?.infamia || 0;
    const currentTitles = actor.flags.brancalonia?.titles || [];
    const stats = actor.flags.brancalonia || {};

    // Controlla tutti i titoli
    const allTitles = [
      ...Object.entries(this.titles.positive).map(([key, title]) => ({ key, title, category: 'positive' })),
      ...Object.entries(this.titles.negative).map(([key, title]) => ({ key, title, category: 'negative' })),
      ...Object.entries(this.titles.neutral).map(([key, title]) => ({ key, title, category: 'neutral' }))
    ];

    for (const { key, title, category } of allTitles) {
      const alreadyHas = currentTitles.some(t => t.key === key);
      if (alreadyHas) continue;

      const req = title.requirements;
      let eligible = true;

      // Controlla requisiti reputazione
      if (req.reputation && totalRep < req.reputation) eligible = false;
      if (req.infamy && infamy < req.infamy) eligible = false;

      // Controlla requisiti statistiche
      if (req.monsters_killed && (stats.monstersKilled || 0) < req.monsters_killed) eligible = false;
      if (req.lives_saved && (stats.livesSaved || 0) < req.lives_saved) eligible = false;
      if (req.gold_donated && (stats.goldDonated || 0) < req.gold_donated) eligible = false;
      if (req.thefts && (stats.thefts || 0) < req.thefts) eligible = false;
      if (req.murders && (stats.murders || 0) < req.murders) eligible = false;
      if (req.civilian_kills && (stats.civilianKills || 0) < req.civilian_kills) eligible = false;
      if (req.contracts_completed && (stats.contractsCompleted || 0) < req.contracts_completed) eligible = false;

      if (eligible) {
        await this.grantTitle(actor, key, category);
      }
    }
  }

  /**
   * Assegna titolo a un attore (nuovo metodo)
   */
  async grantTitle(actor, titleKey, category) {
    const title = this.titles[category][titleKey];
    if (!title) return;

    const currentTitles = actor.flags.brancalonia?.titles || [];

    // Controlla se ha già il titolo
    if (currentTitles.some(t => t.key === titleKey)) return;

    const newTitle = {
      key: titleKey,
      name: title.name,
      category,
      grantedDate: game.time.worldTime,
      description: title.description
    };

    currentTitles.push(newTitle);
    await actor.setFlag('brancalonia-bigat', 'titles', currentTitles);

    // Crea oggetto titolo
    const titleItem = {
      name: title.name,
      type: 'feat',
      img: this._getTitleIcon(category),
      system: {
        description: {
          value: `
            <h3>${title.name}</h3>
            <p><strong>Categoria:</strong> ${this._getCategoryName(category)}</p>
            <p><strong>Descrizione:</strong> ${title.description}</p>
            ${title.benefits ? `<p><strong>Benefici:</strong> ${title.benefits}</p>` : ''}
            ${title.penalties ? `<p><strong>Penalità:</strong> ${title.penalties}</p>` : ''}
          `
        },
        source: 'Reputazione Brancalonia'
      },
      flags: {
        brancalonia: {
          isTitle: true,
          titleKey,
          titleCategory: category
        }
      }
    };

    await actor.createEmbeddedDocuments('Item', [titleItem]);

    // Annuncio
    ChatMessage.create({
      content: `
        <div class="brancalonia-title-grant">
          <h2>🏆 NUOVO TITOLO! 🏆</h2>
          <p><strong>${actor.name}</strong> ottiene il titolo:</p>
          <h3>${title.name}</h3>
          <p><em>${title.description}</em></p>
          ${title.benefits ? `<p><strong>Benefici:</strong> ${title.benefits}</p>` : ''}
        </div>
      `,
      speaker: { alias: 'Sistema Reputazione' }
    });
  }

  /**
   * Applica effetti permanenti della reputazione (mantenuto dal codice originale)
   */
  async _applyReputationEffect(actor, type, threshold) {
    const effectMap = {
      onore: {
        25: { key: 'system.skills.per.bonuses.check', value: '+1' },
        50: { key: 'system.traits.di.all', value: ['legal-immunity'] },
        75: { key: 'system.currency.du', value: '+100' }
      },
      gloria: {
        25: { key: 'flags.midi-qol.advantage.attack.mwak', value: '1' },
        50: { key: 'system.attributes.hp.max', value: '+10' }
      },
      santita: {
        25: { key: 'system.traits.di.all', value: ['necrotic'] },
        50: { key: 'system.attributes.hp.max', value: '+5' },
        75: { key: 'system.traits.di.all', value: ['cursed'] }
      }
    };

    const effects = effectMap[type]?.[threshold];
    if (!effects) return;

    const effectData = {
      name: `${this.reputationTypes[type].name} ${threshold}`,
      img: this.reputationTypes[type].img,
      origin: actor.uuid,
      duration: {},
      changes: [{
        key: effects.key,
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: effects.value
      }],
      flags: {
        brancalonia: {
          isReputationEffect: true,
          repType: type,
          threshold
        }
      }
    };

    await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
  }

  /**
   * Rimuove effetti reputazione (mantenuto dal codice originale)
   */
  async _removeReputationEffect(actor, type, threshold) {
    const effect = actor.effects.find(e =>
      e.flags.brancalonia?.isReputationEffect &&
      e.flags.brancalonia?.repType === type &&
      e.flags.brancalonia?.threshold === threshold
    );

    if (effect) {
      await effect.delete();
    }
  }

  /**
   * Aggiorna reputazione totale (mantenuto dal codice originale con aggiornamenti)
   */
  async _updateTotalReputation(actor) {
    const total = this.getTotalReputation(actor);
    const level = this._getReputationLevel(total);

    await actor.setFlag('brancalonia-bigat', 'totalReputation', total);
    await actor.setFlag('brancalonia-bigat', 'reputationLevel', level);

    // Aggiorna nome visualizzato se configurato
    if (game.settings.get('brancalonia-bigat', 'showReputationTitle')) {
      const title = level.title;
      await actor.update({
        'prototypeToken.name': `${actor.name} il ${title}`
      });
    }
  }

  /**
   * Calcola modificatore sociale (aggiornato)
   */
  _getSocialModifier(actor) {
    const total = this.getTotalReputation(actor);
    const level = this._getReputationLevel(total);

    return level?.modifier || 0;
  }

  /**
   * Calcola modificatore prezzi (mantenuto dal codice originale)
   */
  _getPriceModifier(actor) {
    const onore = this.getReputation(actor, 'onore');
    const infamia = actor.flags.brancalonia?.infamia || 0;

    // Alta infamia = prezzi maggiori
    if (infamia >= 50) return 1.5;
    if (infamia >= 25) return 1.2;

    // Alto onore = sconti
    if (onore >= 50) return 0.8;
    if (onore >= 25) return 0.9;

    return 1;
  }

  /**
   * Decadimento periodico reputazione (mantenuto dal codice originale)
   */
  async decayReputation(actor) {
    if (!game.settings.get('brancalonia-bigat', 'reputationDecay')) return;

    const reps = actor.flags.brancalonia?.reputations || {};
    let changed = false;

    for (const [type, value] of Object.entries(reps)) {
      if (value > 50) {
        reps[type] = value - 2; // -2 per settimana se sopra 50
        changed = true;
      } else if (value > 25) {
        reps[type] = value - 1; // -1 per settimana se sopra 25
        changed = true;
      }
    }

    if (changed) {
      await actor.setFlag('brancalonia-bigat', 'reputations', reps);
      ui.notifications.info(`${actor.name}: Reputazione decade nel tempo`);
    }
  }

  /**
   * Registra evento reputazione (nuovo metodo)
   */
  async _recordReputationEvent(actor, type, amount, reason, subtype = null) {
    const events = actor.flags.brancalonia?.reputationEvents || [];

    const event = {
      type, // "reputation" o "infamy"
      subtype, // tipo specifico per reputazione (onore, fama, etc.)
      amount,
      reason,
      date: game.time.worldTime,
      scene: canvas.scene?.name || 'Sconosciuta'
    };

    events.push(event);

    // Mantieni solo gli ultimi 50 eventi
    if (events.length > 50) {
      events.splice(0, events.length - 50);
    }

    await actor.setFlag('brancalonia-bigat', 'reputationEvents', events);
  }

  /**
   * Gestisci conseguenze infamia (nuovo metodo)
   */
  async _handleInfamyConsequences(actor, infamyLevel) {
    // Conseguenze progressive
    switch (infamyLevel.title) {
      case 'Famigerato':
        // Prezzo +25% nei negozi legali
        ChatMessage.create({
          content: `${actor.name} è ora ${infamyLevel.title}. I prezzi nei negozi legali aumentano del 25%.`,
          whisper: [game.user.id]
        });
        break;

      case 'Infame':
        // Ricercato dalle autorità
        await this._createBountyHunters(actor);
        break;

      case 'Maledetto':
        // Cacciato dalle città civilizzate
        ChatMessage.create({
          content: `${actor.name} è ora ${infamyLevel.title}. Sarà cacciato dalla maggior parte delle città!`,
          speaker: { alias: 'Sistema Infamia' }
        });
        break;
    }
  }

  /**
   * Crea cacciatori di taglie (nuovo metodo)
   */
  async _createBountyHunters(actor) {
    const bounty = Math.floor((actor.flags.brancalonia?.infamia || 0) * 10);

    ChatMessage.create({
      content: `
        <div class="brancalonia-bounty-notice">
          <h2>📜 TAGLIA!</h2>
          <h3>RICERCATO VIVO O MORTO</h3>
          <p><strong>${actor.name}</strong></p>
          <p>Ricompensa: <strong>${bounty} ducati</strong></p>
          <p><em>Per crimini contro la Corona e il popolo</em></p>
        </div>
      `,
      speaker: { alias: 'Autorità Reali' }
    });
  }

  /**
   * Ottieni categoria titolo (nuovo metodo)
   */
  _getTitleCategory(title) {
    for (const [category, titles] of Object.entries(this.titles)) {
      if (Object.values(titles).includes(title)) {
        return category;
      }
    }
    return 'neutral';
  }

  /**
   * Ottieni icona titolo (nuovo metodo)
   */
  _getTitleIcon(category) {
    const icons = {
      positive: 'icons/skills/social/diplomacy-peace-agreement.webp',
      negative: 'icons/skills/wounds/blood-drip-red.webp',
      neutral: 'icons/environment/people/commoner.webp'
    };
    return icons[category] || icons.neutral;
  }

  /**
   * Ottieni nome categoria (nuovo metodo)
   */
  _getCategoryName(category) {
    const names = {
      positive: 'Onorifico',
      negative: 'Infamante',
      neutral: 'Neutrale'
    };
    return names[category] || 'Sconosciuto';
  }

  /**
   * UI per gestione reputazione (aggiornata per includere sia vecchio che nuovo sistema)
   */
  renderReputationManager(actor = null) {
    if (actor) {
      // Vista per singolo attore
      const total = this.getTotalReputation(actor);
      const level = this._getReputationLevel(total);
      const reps = actor.flags.brancalonia?.reputations || {};
      const infamy = actor.flags.brancalonia?.infamia || 0;
      const infamyLevel = this._getInfamyLevel(infamy);

      const content = `
        <div class="brancalonia-reputation-manager">
          <h2>👑 Reputazione di ${actor.name}</h2>

          <div class="reputation-summary">
            <h3>Reputazione Totale: ${total}</h3>
            <p class="rep-level">Livello: <strong>${level.title}</strong></p>
            <p class="rep-effects">Mod. Sociale: ${level.modifier > 0 ? '+' : ''}${level.modifier}</p>
          </div>

          <div class="infamy-summary">
            <h3>Infamia: ${infamy}</h3>
            <p class="inf-level">Livello: <strong>${infamyLevel.title}</strong></p>
            <p class="inf-effects">Mod. Sociale: ${infamyLevel.modifier}</p>
            <div class="controls">
              <button class="adjust-infamy" data-amount="1">+1</button>
              <button class="adjust-infamy" data-amount="5">+5</button>
              <button class="adjust-infamy" data-amount="-1">-1</button>
              <button class="adjust-infamy" data-amount="-5">-5</button>
            </div>
          </div>

          <div class="reputation-types">
            <h3>Reputazioni Specifiche</h3>
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Valore</th>
                  <th>Benefici Attivi</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(this.reputationTypes).map(([key, type]) => {
    const value = reps[key] || 0;
    const activeBenefits = Object.entries(type.benefits)
      .filter(([thresh, _]) => value >= parseInt(thresh))
      .map(([_, benefit]) => benefit);

    return `
                    <tr>
                      <td>
                        <img src="${type.img}" width="20" height="20">
                        ${type.name}
                      </td>
                      <td>${value}/${type.max}</td>
                      <td>
                        ${activeBenefits.length > 0 ?
    `<ul>${activeBenefits.map(b => `<li>${b}</li>`).join('')}</ul>` :
    '<em>Nessuno</em>'
}
                      </td>
                      <td>
                        <button class="adjust-rep" data-type="${key}" data-amount="5">+5</button>
                        <button class="adjust-rep" data-type="${key}" data-amount="-5">-5</button>
                      </td>
                    </tr>
                  `;
  }).join('')}
              </tbody>
            </table>
          </div>

          <div class="titles-section">
            <h3>Titoli e Nomea</h3>
            <div class="current-titles">
              ${(actor.getTitles() || []).map(title => `
                <div class="title-item">
                  <strong>${title.name}</strong>
                  <span class="category">(${this._getCategoryName(title.category)})</span>
                </div>
              `).join('') || '<p><em>Nessun titolo</em></p>'}
            </div>
            <button id="check-titles">Controlla Titoli Disponibili</button>
          </div>

          <div class="reputation-actions">
            <h3>Azioni Rapide</h3>
            <div class="action-buttons">
              ${Object.entries(this.reputationActions).slice(0, 8).map(([action, effects]) => `
                <button class="rep-action" data-action="${action}">
                  ${action.replace(/_/g, ' ').charAt(0).toUpperCase() + action.slice(1).replace(/_/g, ' ')}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="reputation-history">
            <h3>Storico Eventi</h3>
            <div class="events-list">
              ${(actor.flags.brancalonia?.reputationEvents || []).slice(-10).map(event => `
                <div class="event-item">
                  <span class="date">${new Date(event.date).toLocaleDateString()}</span>
                  <span class="type ${event.type}">${event.type === 'reputation' ? 'REP' : 'INF'}</span>
                  <span class="amount">${event.amount > 0 ? '+' : ''}${event.amount}</span>
                  <span class="reason">${event.reason}</span>
                </div>
              `).join('') || '<p><em>Nessun evento registrato</em></p>'}
            </div>
          </div>
        </div>
      `;

      const dialog = new Dialog({
        title: 'Gestione Reputazione',
        content,
        buttons: {
          close: { label: 'Chiudi' }
        },
        render: html => {
          html.find('.adjust-rep').click(ev => {
            const type = ev.currentTarget.dataset.type;
            const amount = parseInt(ev.currentTarget.dataset.amount);
            this.adjustReputation(actor, type, amount);
            dialog.close();
            this.renderReputationManager(actor); // Riapri aggiornato
          });

          html.find('.adjust-infamy').click(ev => {
            const amount = parseInt(ev.currentTarget.dataset.amount);
            this.adjustInfamy(actor, amount, 'Modifica manuale infamia');
            dialog.close();
            this.renderReputationManager(actor);
          });

          html.find('.rep-action').click(ev => {
            const action = ev.currentTarget.dataset.action;
            const effects = this.reputationActions[action];
            this.adjustReputationMultiple(actor, effects);
            dialog.close();
          });

          html.find('#check-titles').click(() => {
            this.checkTitleEligibility(actor);
            ui.notifications.info('Controllo titoli completato!');
          });
        }
      });

      dialog.render(true);
    } else {
      // Vista generale per selezione attore
      const content = `
        <div class="brancalonia-reputation-manager">
          <h2>👑 Gestione Reputazione e Infamia</h2>

          <div class="actor-selection">
            <h3>Seleziona Personaggio</h3>
            <select id="actor-select">
              <option value="">-- Seleziona --</option>
              ${game.actors.filter(a => a.hasPlayerOwner).map(a =>
    `<option value="${a.id}">${a.name}</option>`
  ).join('')}
            </select>
            <button id="manage-actor">Gestisci</button>
          </div>

          <div class="reputation-scales">
            <h3>Scale di Valutazione</h3>

            <div class="scale-section">
              <h4>Reputazione</h4>
              <table>
                <thead>
                  <tr><th>Livello</th><th>Punti</th><th>Modificatore</th></tr>
                </thead>
                <tbody>
                  ${Object.values(this.reputationScale).map(level => `
                    <tr>
                      <td style="color: ${level.color}">${level.title}</td>
                      <td>${level.min}-${level.max}</td>
                      <td>${level.modifier > 0 ? '+' : ''}${level.modifier}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="scale-section">
              <h4>Infamia</h4>
              <table>
                <thead>
                  <tr><th>Livello</th><th>Punti</th><th>Modificatore</th></tr>
                </thead>
                <tbody>
                  ${Object.values(this.infamyScale).map(level => `
                    <tr>
                      <td style="color: ${level.color}">${level.title}</td>
                      <td>${level.min}-${level.max}</td>
                      <td>${level.modifier}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      const dialog = new Dialog({
        title: 'Gestione Reputazione',
        content,
        buttons: {
          close: { label: 'Chiudi' }
        },
        render: html => {
          html.find('#manage-actor').click(() => {
            const actorId = html.find('#actor-select').val();
            if (actorId) {
              const actor = game.actors.get(actorId);
              dialog.close();
              this.renderReputationManager(actor);
            }
          });
        }
      });

      dialog.render(true);
    }
  }
}

// Registra classe globale
window.ReputationSystem = ReputationSystem;

// Auto-inizializzazione
Hooks.once('init', () => {
  console.log('🎮 Brancalonia | Inizializzazione Reputation System');
  ReputationSystem.initialize();
});

// Hook per integrazione con schede
Hooks.on('renderActorSheet', (app, html, data) => {
  if (!game.user.isGM) return;

  const actor = app.actor;
  if (actor.type !== 'character' && actor.type !== 'npc') return;

  // Aggiungi sezione reputazione
  const reputationSection = $(`
    <div class="form-group">
      <label>Reputazione e Infamia</label>
      <div class="form-fields reputation-display">
        <div class="rep-stat">
          <span>Reputazione: <strong>${actor.flags.brancalonia?.totalReputation || 0}</strong></span>
          <span class="level">(${actor.getReputationLevel()?.title || 'Sconosciuto'})</span>
        </div>
        <div class="inf-stat">
          <span>Infamia: <strong>${actor.flags.brancalonia?.infamia || 0}</strong></span>
          <span class="level">(${actor.getInfamyLevel()?.title || 'Incensurato'})</span>
        </div>
        <button type="button" class="manage-reputation">
          <i class="fas fa-crown"></i> Gestisci Reputazione
        </button>
      </div>
    </div>
  `);

  html.find('.tab.details .form-group').last().after(reputationSection);

  reputationSection.find('.manage-reputation').click(() => {
    const instance = game.brancalonia?.reputationSystem;
    if (instance) {
      instance.renderReputationManager(actor);
    }
  });
});

// Export per compatibilità
if (typeof module !== 'undefined') {
  module.exports = ReputationSystem;
}