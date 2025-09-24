/**
 * Sistema Fazioni per Brancalonia
 * Gestione completa di fazioni, alleanze e rivalità
 * Compatibile con dnd5e system per Foundry VTT v13
 */

export class FactionsSystem {
  constructor() {
    // Database fazioni di Brancalonia
    this.factions = {
      // FAZIONI RELIGIOSE
      "chiesa_calendaria": {
        name: "Chiesa Calendaria",
        type: "religiosa",
        icon: "icons/environment/settlement/church.webp",
        alignment: "lawful",
        power: 9,
        influence: "nazionale",
        description: "La chiesa ufficiale del Regno, potente e corrotta",
        headquarters: "Vaticantica",
        leader: "Papa Innocenzo XXIII",
        resources: {
          gold: 10000,
          troops: 500,
          spies: 20,
          clerics: 100
        },
        relations: {
          "nobiltà": 75,
          "ordine_draconiano": 50,
          "gilde_mercanti": 60,
          "popolo": 30,
          "criminali": -50,
          "eretici": -100
        },
        benefits: {
          member: "Accesso a cure gratuite, alloggio nei monasteri",
          allied: "Protezione legale, sconto 20% servizi religiosi",
          honored: "Immunità diplomatica, benedizioni potenti"
        },
        quests: [
          "Recuperare reliquie sacre",
          "Eliminare eretici",
          "Raccogliere decime",
          "Convertire pagani"
        ],
        ranks: [
          { level: 0, title: "Fedele", minRep: 0 },
          { level: 1, title: "Accolito", minRep: 10 },
          { level: 2, title: "Chierico", minRep: 25 },
          { level: 3, title: "Priore", minRep: 50 },
          { level: 4, title: "Vescovo", minRep: 100 },
          { level: 5, title: "Cardinale", minRep: 200 }
        ]
      },

      "ordine_draconiano": {
        name: "Ordine Draconiano",
        type: "militare",
        icon: "icons/creatures/abilities/dragon-fire-breath-orange.webp",
        alignment: "lawful",
        power: 8,
        influence: "nazionale",
        description: "Ordine cavalleresco dedicato a San Giorgio",
        headquarters: "Rocca del Drago",
        leader: "Gran Maestro Sigismondo",
        resources: {
          gold: 5000,
          troops: 300,
          knights: 50,
          fortresses: 5
        },
        relations: {
          "chiesa_calendaria": 50,
          "nobiltà": 80,
          "popolo": 60,
          "criminali": -70,
          "mostri": -100
        },
        benefits: {
          member: "Addestramento marziale, equipaggiamento",
          allied: "Protezione militare, accesso fortezze",
          honored: "Cavalierato, terre e titolo"
        },
        quests: [
          "Cacciare mostri",
          "Proteggere pellegrini",
          "Recuperare artefatti draconici",
          "Difendere i deboli"
        ],
        ranks: [
          { level: 0, title: "Scudiero", minRep: 0 },
          { level: 1, title: "Cavaliere", minRep: 20 },
          { level: 2, title: "Cavaliere Veterano", minRep: 40 },
          { level: 3, title: "Comandante", minRep: 80 },
          { level: 4, title: "Campione", minRep: 150 }
        ]
      },

      // FAZIONI CRIMINALI
      "benandanti": {
        name: "I Benandanti",
        type: "segreta",
        icon: "icons/magic/nature/leaf-glow-triple-green.webp",
        alignment: "neutral",
        power: 6,
        influence: "regionale",
        description: "Società segreta di combattenti spirituali",
        headquarters: "Luoghi sacri nascosti",
        leader: "Il Primo Nato",
        resources: {
          gold: 2000,
          members: 100,
          safehouse: 10,
          informants: 30
        },
        relations: {
          "chiesa_calendaria": -30,
          "popolo": 70,
          "streghe": -100,
          "spiriti": 50
        },
        benefits: {
          member: "Protezione da maledizioni, erbe curative",
          allied: "Informazioni su attività sovrannaturali",
          honored: "Iniziazione ai misteri, poteri spirituali"
        },
        quests: [
          "Combattere streghe malvagie",
          "Proteggere raccolti",
          "Esorcizzare spiriti",
          "Trovare nati con la camicia"
        ],
        ranks: [
          { level: 0, title: "Simpatizzante", minRep: 0 },
          { level: 1, title: "Iniziato", minRep: 15 },
          { level: 2, title: "Benandante", minRep: 35 },
          { level: 3, title: "Capitano", minRep: 70 },
          { level: 4, title: "Gran Benandante", minRep: 140 }
        ]
      },

      "mano_nera": {
        name: "La Mano Nera",
        type: "criminale",
        icon: "icons/skills/social/theft-pickpocket-bribery-brown.webp",
        alignment: "chaotic",
        power: 7,
        influence: "nazionale",
        description: "La più potente organizzazione criminale del Regno",
        headquarters: "Sconosciuto",
        leader: "Il Padrone (identità segreta)",
        resources: {
          gold: 8000,
          members: 500,
          safehouse: 50,
          assassins: 20,
          smugglers: 100
        },
        relations: {
          "chiesa_calendaria": -50,
          "nobiltà": 30,
          "guardie": -100,
          "mercanti": 40,
          "popolo": 20
        },
        benefits: {
          member: "Protezione, contrabbando, informazioni",
          allied: "Sconto 30% servizi illegali, contatti",
          honored: "Territorio personale, percentuale affari"
        },
        quests: [
          "Assassinii mirati",
          "Contrabbando merci",
          "Estorsioni",
          "Furto di oggetti preziosi",
          "Corruzione ufficiali"
        ],
        ranks: [
          { level: 0, title: "Associato", minRep: 0 },
          { level: 1, title: "Soldato", minRep: 10 },
          { level: 2, title: "Capo Decina", minRep: 30 },
          { level: 3, title: "Luogotenente", minRep: 60 },
          { level: 4, title: "Capo Famiglia", minRep: 120 },
          { level: 5, title: "Consigliere", minRep: 200 }
        ]
      },

      // FAZIONI COMMERCIALI
      "gilda_mercanti": {
        name: "Gilda dei Mercanti",
        type: "commerciale",
        icon: "icons/commodities/currency/coins-assorted-mix-copper.webp",
        alignment: "neutral",
        power: 7,
        influence: "nazionale",
        description: "Potente confederazione di mercanti e artigiani",
        headquarters: "Tarantasia",
        leader: "Gran Mercante Cosimo de' Fiorini",
        resources: {
          gold: 15000,
          members: 1000,
          caravans: 50,
          ships: 20,
          warehouses: 100
        },
        relations: {
          "chiesa_calendaria": 60,
          "nobiltà": 70,
          "popolo": 50,
          "criminali": -20,
          "pirati": -80
        },
        benefits: {
          member: "Licenza commerciale, protezione carovane",
          allied: "Sconto 25% merci, prestiti agevolati",
          honored: "Monopoli commerciali, partecipazione profitti"
        },
        quests: [
          "Scortare carovane",
          "Recuperare merci rubate",
          "Negoziare accordi",
          "Esplorare nuove rotte",
          "Eliminare concorrenza"
        ],
        ranks: [
          { level: 0, title: "Apprendista", minRep: 0 },
          { level: 1, title: "Mercante", minRep: 15 },
          { level: 2, title: "Mercante Esperto", minRep: 35 },
          { level: 3, title: "Maestro Mercante", minRep: 70 },
          { level: 4, title: "Console", minRep: 140 }
        ]
      },

      // FAZIONI POPOLARI
      "briganti_sherwood": {
        name: "Briganti di Sherwood",
        type: "ribelle",
        icon: "icons/weapons/bows/bow-recurve-yellow.webp",
        alignment: "chaotic good",
        power: 5,
        influence: "regionale",
        description: "Briganti che rubano ai ricchi per dare ai poveri",
        headquarters: "Foresta di Sherwood",
        leader: "Robin di Locksley",
        resources: {
          gold: 1000,
          members: 60,
          hideouts: 5,
          supporters: 200
        },
        relations: {
          "nobiltà": -80,
          "chiesa_calendaria": -30,
          "popolo": 90,
          "guardie": -100
        },
        benefits: {
          member: "Rifugio nella foresta, addestramento arceria",
          allied: "Aiuto contro oppressori, parte del bottino",
          honored: "Leggenda vivente, comando banda"
        },
        quests: [
          "Derubare esattori",
          "Liberare prigionieri",
          "Distribuire cibo ai poveri",
          "Tendere imboscate a nobili"
        ],
        ranks: [
          { level: 0, title: "Simpatizzante", minRep: 0 },
          { level: 1, title: "Brigante", minRep: 10 },
          { level: 2, title: "Fuorilegge", minRep: 25 },
          { level: 3, title: "Luogotenente", minRep: 50 },
          { level: 4, title: "Capo Brigante", minRep: 100 }
        ]
      },

      // FAZIONI MAGICHE
      "congrega_streghe": {
        name: "Congrega delle Streghe",
        type: "magica",
        icon: "icons/magic/symbols/pentagram-glowing-purple.webp",
        alignment: "chaotic",
        power: 6,
        influence: "segreta",
        description: "Rete segreta di streghe e stregoni",
        headquarters: "Vari covi nascosti",
        leader: "La Megera Suprema",
        resources: {
          gold: 3000,
          members: 50,
          covens: 10,
          familiars: 50,
          grimoires: 20
        },
        relations: {
          "chiesa_calendaria": -100,
          "benandanti": -100,
          "popolo": -30,
          "demoni": 50
        },
        benefits: {
          member: "Insegnamenti magici, ingredienti rari",
          allied: "Pozioni, maledizioni su commissione",
          honored: "Iniziazione ai grandi misteri, famiglio"
        },
        quests: [
          "Procurare ingredienti rari",
          "Sabotare benedizioni",
          "Corrompere innocenti",
          "Evocare entità"
        ],
        ranks: [
          { level: 0, title: "Novizio", minRep: 0 },
          { level: 1, title: "Adepto", minRep: 20 },
          { level: 2, title: "Strega/Stregone", minRep: 40 },
          { level: 3, title: "Alto/a Strega/one", minRep: 80 },
          { level: 4, title: "Arci-strega/one", minRep: 160 }
        ]
      }
    };

    // Relazioni tra fazioni
    this.factionRelations = new Map();
    this._initializeFactionRelations();

    // Reputazione dei PG con le fazioni
    this.characterReputations = new Map();

    this._setupHooks();
    this._registerSettings();
  }

  _initializeFactionRelations() {
    // Inizializza le relazioni tra tutte le fazioni
    for (let faction1 in this.factions) {
      for (let faction2 in this.factions) {
        if (faction1 !== faction2) {
          const key = [faction1, faction2].sort().join("-");
          if (!this.factionRelations.has(key)) {
            // Calcola relazione base
            const f1 = this.factions[faction1];
            const f2 = this.factions[faction2];
            let relation = 0;

            // Stessa tipologia = +20
            if (f1.type === f2.type) relation += 20;

            // Allineamenti opposti = -40
            if (f1.alignment && f2.alignment) {
              if (f1.alignment.includes("lawful") && f2.alignment.includes("chaotic")) {
                relation -= 40;
              }
              if (f1.alignment.includes("good") && f2.alignment.includes("evil")) {
                relation -= 40;
              }
            }

            // Relazioni predefinite
            if (f1.relations[faction2]) {
              relation = f1.relations[faction2];
            }

            this.factionRelations.set(key, relation);
          }
        }
      }
    }
  }

  _setupHooks() {
    // Hook per conseguenze azioni (usando hook ufficiale)
    Hooks.on("dnd5e.damageActor", (target, damage, options) => {
      if (target.flags.brancalonia?.faction) {
        const attacker = options.attacker;
        if (attacker?.hasPlayerOwner) {
          // Attaccare membri di una fazione ha conseguenze
          this.adjustReputation(attacker, target.flags.brancalonia.faction, -5);
        }
      }
    });

    // Hook per trasferimento oggetti (hook standard Foundry)
    Hooks.on("preUpdateItem", (item, changes, options, userId) => {
      // Controlla se l'oggetto viene trasferito
      if (changes.parent && item.parent?.flags?.brancalonia?.faction === "gilda_mercanti") {
        const newOwner = game.actors.get(changes.parent);
        if (newOwner?.hasPlayerOwner) {
          this.adjustReputation(newOwner, "gilda_mercanti", 1);
        }
      }
    });

    // Hook per completamento chat messages (per quest)
    Hooks.on("createChatMessage", (message, options, userId) => {
      // Controlla se il messaggio indica completamento quest
      if (message.flags?.brancalonia?.questComplete) {
        const quest = message.flags.brancalonia.quest;
        const actor = game.actors.get(message.speaker.actor);
        if (quest?.faction && actor) {
          this.adjustReputation(actor, quest.faction, quest.reputationReward || 10);
        }
      }
    });
  }

  _registerSettings() {
    game.settings.register("brancalonia-bigat", "factionInfluence", {
      name: "Influenza Fazioni",
      hint: "Le fazioni influenzano prezzi, quest e interazioni",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register("brancalonia-bigat", "factionWars", {
      name: "Guerre tra Fazioni",
      hint: "Abilita conflitti dinamici tra fazioni",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });
  }

  /**
   * Ottieni reputazione di un attore con una fazione
   */
  getReputation(actor, factionKey) {
    const key = `${actor.id}-${factionKey}`;
    return this.characterReputations.get(key) || 0;
  }

  /**
   * Aggiusta reputazione con una fazione
   */
  async adjustReputation(actor, factionKey, amount, options = {}) {
    const faction = this.factions[factionKey];
    if (!faction) {
      ui.notifications.error(`Fazione ${factionKey} non trovata!`);
      return;
    }

    const key = `${actor.id}-${factionKey}`;
    const currentRep = this.characterReputations.get(key) || 0;
    const newRep = Math.max(-100, Math.min(300, currentRep + amount));

    this.characterReputations.set(key, newRep);

    // Salva nel flag dell'attore
    const factionReps = actor.flags.brancalonia?.factionReputations || {};
    factionReps[factionKey] = newRep;
    await actor.setFlag("brancalonia", "factionReputations", factionReps);

    // Controlla cambio rango
    const oldRank = this._getRank(faction, currentRep);
    const newRank = this._getRank(faction, newRep);

    // Notifica
    const emoji = amount > 0 ? "📈" : "📉";
    ChatMessage.create({
      content: `
        <div class="brancalonia-faction-rep">
          <h3>${emoji} Reputazione ${faction.name}</h3>
          <p><strong>${actor.name}:</strong> ${amount > 0 ? '+' : ''}${amount} punti</p>
          <p>Reputazione attuale: ${newRep}</p>
          ${oldRank.level !== newRank.level ? `
            <p class="rank-change">
              <strong>Nuovo Rango:</strong> ${newRank.title}
            </p>
          ` : ''}
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    // Applica effetti del nuovo rango
    if (oldRank.level < newRank.level) {
      await this._applyRankBenefits(actor, faction, newRank);
    } else if (oldRank.level > newRank.level) {
      await this._removeRankBenefits(actor, faction, oldRank);
    }

    // Effetti a catena su altre fazioni
    if (options.cascade !== false) {
      await this._cascadeReputationEffects(actor, factionKey, amount);
    }
  }

  /**
   * Ottieni rango in una fazione
   */
  _getRank(faction, reputation) {
    let currentRank = faction.ranks[0];

    for (let rank of faction.ranks) {
      if (reputation >= rank.minRep) {
        currentRank = rank;
      }
    }

    return currentRank;
  }

  /**
   * Applica benefici del rango
   */
  async _applyRankBenefits(actor, faction, rank) {
    // Crea item per rappresentare il rango
    const rankItem = {
      name: `${faction.name}: ${rank.title}`,
      type: "feat",
      img: faction.icon,
      system: {
        description: {
          value: `
            <h3>Rango ${rank.level}: ${rank.title}</h3>
            <p><strong>Fazione:</strong> ${faction.name}</p>
            <p><strong>Benefici:</strong></p>
            <ul>
              ${rank.level >= 1 ? `<li>${faction.benefits.member}</li>` : ''}
              ${rank.level >= 3 ? `<li>${faction.benefits.allied}</li>` : ''}
              ${rank.level >= 5 ? `<li>${faction.benefits.honored}</li>` : ''}
            </ul>
          `
        },
        source: "Brancalonia"
      },
      flags: {
        brancalonia: {
          isFactionRank: true,
          faction: faction.name,
          rank: rank.level
        }
      }
    };

    await actor.createEmbeddedDocuments("Item", [rankItem]);
  }

  /**
   * Rimuovi benefici del rango
   */
  async _removeRankBenefits(actor, faction, oldRank) {
    const items = actor.items.filter(i =>
      i.flags.brancalonia?.isFactionRank &&
      i.flags.brancalonia?.faction === faction.name
    );

    for (let item of items) {
      await item.delete();
    }
  }

  /**
   * Effetti a catena sulla reputazione
   */
  async _cascadeReputationEffects(actor, factionKey, amount) {
    const faction = this.factions[factionKey];

    // Effetti su fazioni alleate/nemiche
    for (let [otherFaction, relation] of Object.entries(faction.relations)) {
      if (this.factions[otherFaction]) {
        let cascadeAmount = 0;

        if (relation >= 50) {
          // Alleati: +25% dell'effetto
          cascadeAmount = Math.floor(amount * 0.25);
        } else if (relation <= -50) {
          // Nemici: -50% dell'effetto
          cascadeAmount = Math.floor(amount * -0.5);
        }

        if (cascadeAmount !== 0) {
          await this.adjustReputation(actor, otherFaction, cascadeAmount, {
            cascade: false
          });
        }
      }
    }
  }

  /**
   * Genera missione per una fazione
   */
  generateFactionQuest(factionKey, difficulty = "medium") {
    const faction = this.factions[factionKey];
    if (!faction) return null;

    const questType = faction.quests[Math.floor(Math.random() * faction.quests.length)];

    const difficultyModifiers = {
      easy: { dc: 10, reward: 5, gold: 50 },
      medium: { dc: 13, reward: 10, gold: 100 },
      hard: { dc: 16, reward: 20, gold: 250 },
      deadly: { dc: 20, reward: 40, gold: 500 }
    };

    const mod = difficultyModifiers[difficulty];

    const quest = {
      name: `${faction.name}: ${questType}`,
      faction: factionKey,
      type: questType,
      difficulty: difficulty,
      dc: mod.dc,
      description: this._generateQuestDescription(faction, questType),
      objectives: this._generateQuestObjectives(questType),
      rewards: {
        reputation: mod.reward,
        gold: mod.gold + Math.floor(Math.random() * mod.gold),
        special: this._generateSpecialReward(faction, difficulty)
      },
      consequences: {
        success: `+${mod.reward} reputazione con ${faction.name}`,
        failure: `-${Math.floor(mod.reward/2)} reputazione con ${faction.name}`
      }
    };

    return quest;
  }

  _generateQuestDescription(faction, questType) {
    const descriptions = {
      "Recuperare reliquie sacre": `La ${faction.name} richiede il recupero di una reliquia sacra rubata da eretici.`,
      "Eliminare eretici": `Un gruppo di eretici sta corrompendo i fedeli. La ${faction.name} vuole che siano fermati.`,
      "Cacciare mostri": `Un terribile mostro minaccia i territori protetti dalla ${faction.name}.`,
      "Scortare carovane": `Una carovana importante della ${faction.name} necessita protezione.`,
      "Assassinii mirati": `La ${faction.name} vuole eliminare discretamente un nemico.`,
      "Contrabbando merci": `Merci preziose devono essere contrabbandate oltre i confini.`
    };

    return descriptions[questType] || `La ${faction.name} richiede assistenza per ${questType}.`;
  }

  _generateQuestObjectives(questType) {
    const objectivesMap = {
      "Recuperare reliquie sacre": [
        "Localizzare la reliquia",
        "Infiltrarsi nel nascondiglio",
        "Recuperare l'oggetto",
        "Riportarlo intatto"
      ],
      "Eliminare eretici": [
        "Identificare il leader",
        "Trovare il loro covo",
        "Eliminarli o catturarli",
        "Distruggere i loro scritti"
      ],
      "Cacciare mostri": [
        "Rintracciare il mostro",
        "Studiarne le debolezze",
        "Affrontarlo",
        "Portare prova dell'uccisione"
      ],
      default: [
        "Accettare la missione",
        "Completare l'obiettivo",
        "Riportare alla fazione"
      ]
    };

    return objectivesMap[questType] || objectivesMap.default;
  }

  _generateSpecialReward(faction, difficulty) {
    const rewards = {
      easy: ["Lettera di raccomandazione", "Sconto servizi fazione"],
      medium: ["Oggetto benedetto", "Contatto importante", "Accesso area ristretta"],
      hard: ["Oggetto magico minore", "Titolo onorario", "Proprietà piccola"],
      deadly: ["Oggetto magico raro", "Posizione nella fazione", "Feudo o territorio"]
    };

    const pool = rewards[difficulty];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Inizia una guerra tra fazioni
   */
  async startFactionWar(faction1Key, faction2Key, reason = "Dispute territoriali") {
    if (!game.settings.get("brancalonia-bigat", "factionWars")) return;

    const f1 = this.factions[faction1Key];
    const f2 = this.factions[faction2Key];

    if (!f1 || !f2) return;

    // Calcola forza relativa
    const f1Strength = f1.power + (f1.resources.troops || 0) / 50;
    const f2Strength = f2.power + (f2.resources.troops || 0) / 50;

    // Imposta stato di guerra
    const warKey = [faction1Key, faction2Key].sort().join("-");
    const warData = {
      factions: [faction1Key, faction2Key],
      reason: reason,
      startTime: game.time.worldTime,
      strength: {
        [faction1Key]: f1Strength,
        [faction2Key]: f2Strength
      },
      battles: [],
      status: "active"
    };

    await game.settings.set("brancalonia-bigat", `war-${warKey}`, warData);

    // Annuncio
    ChatMessage.create({
      content: `
        <div class="brancalonia-faction-war">
          <h2>⚔️ GUERRA TRA FAZIONI! ⚔️</h2>
          <p><strong>${f1.name}</strong> VS <strong>${f2.name}</strong></p>
          <p>Motivo: ${reason}</p>
          <p>Forze in campo:</p>
          <ul>
            <li>${f1.name}: ${f1.resources.troops || 0} truppe</li>
            <li>${f2.name}: ${f2.resources.troops || 0} truppe</li>
          </ul>
        </div>
      `,
      speaker: { alias: "Eventi del Regno" }
    });

    // Effetti sulla reputazione dei PG
    game.actors.filter(a => a.hasPlayerOwner).forEach(actor => {
      const rep1 = this.getReputation(actor, faction1Key);
      const rep2 = this.getReputation(actor, faction2Key);

      if (rep1 > 50 && rep2 > 50) {
        ChatMessage.create({
          content: `${actor.name} deve scegliere da che parte stare!`,
          whisper: [actor.owner]
        });
      }
    });
  }

  /**
   * Risolvi battaglia tra fazioni
   */
  async resolveFactionBattle(faction1Key, faction2Key) {
    const f1 = this.factions[faction1Key];
    const f2 = this.factions[faction2Key];

    // Tiri contrapposti con modificatori
    const f1Roll = await new Roll(`1d20 + ${f1.power}`).evaluate();
    const f2Roll = await new Roll(`1d20 + ${f2.power}`).evaluate();

    const winner = f1Roll.total > f2Roll.total ? f1 : f2;
    const loser = winner === f1 ? f2 : f1;

    // Perdite
    const winnerLosses = Math.floor(Math.random() * 20 + 10);
    const loserLosses = Math.floor(Math.random() * 40 + 20);

    // Aggiorna risorse
    if (winner.resources.troops) {
      winner.resources.troops -= winnerLosses;
    }
    if (loser.resources.troops) {
      loser.resources.troops -= loserLosses;
    }

    ChatMessage.create({
      content: `
        <div class="brancalonia-battle-result">
          <h3>⚔️ Risultato Battaglia</h3>
          <p><strong>Vincitore:</strong> ${winner.name}</p>
          <p><strong>Perdite:</strong></p>
          <ul>
            <li>${winner.name}: ${winnerLosses} truppe</li>
            <li>${loser.name}: ${loserLosses} truppe</li>
          </ul>
        </div>
      `
    });
  }

  /**
   * UI per gestione fazioni
   */
  renderFactionsManager(actor = null) {
    const content = `
      <div class="brancalonia-factions-manager">
        <h2>🏰 Gestione Fazioni</h2>

        ${actor ? `
          <div class="character-reputations">
            <h3>Reputazioni di ${actor.name}</h3>
            <table>
              <thead>
                <tr>
                  <th>Fazione</th>
                  <th>Reputazione</th>
                  <th>Rango</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(this.factions).map(([key, faction]) => {
                  const rep = this.getReputation(actor, key);
                  const rank = this._getRank(faction, rep);
                  return `
                    <tr>
                      <td>
                        <img src="${faction.icon}" width="20" height="20">
                        ${faction.name}
                      </td>
                      <td>${rep}</td>
                      <td>${rank.title}</td>
                      <td>
                        <button class="adjust-rep" data-faction="${key}" data-amount="5">+5</button>
                        <button class="adjust-rep" data-faction="${key}" data-amount="-5">-5</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <div class="faction-overview">
          <h3>Panoramica Fazioni</h3>
          <div class="faction-grid">
            ${Object.entries(this.factions).map(([key, faction]) => `
              <div class="faction-card" data-faction="${key}">
                <img src="${faction.icon}" title="${faction.name}">
                <h4>${faction.name}</h4>
                <p>Potere: ${faction.power}/10</p>
                <p>Tipo: ${faction.type}</p>
                <button class="generate-quest" data-faction="${key}">Genera Missione</button>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="faction-wars">
          <h3>Guerre tra Fazioni</h3>
          <button id="start-war">Inizia Guerra</button>
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: "Gestione Fazioni",
      content: content,
      buttons: {
        close: { label: "Chiudi" }
      },
      render: html => {
        if (actor) {
          html.find('.adjust-rep').click(ev => {
            const faction = ev.currentTarget.dataset.faction;
            const amount = parseInt(ev.currentTarget.dataset.amount);
            this.adjustReputation(actor, faction, amount);
            dialog.close();
            this.renderFactionsManager(actor); // Riapri aggiornato
          });
        }

        html.find('.generate-quest').click(ev => {
          const faction = ev.currentTarget.dataset.faction;
          const quest = this.generateFactionQuest(faction, "medium");

          ChatMessage.create({
            content: `
              <div class="brancalonia-faction-quest">
                <h3>📜 ${quest.name}</h3>
                <p>${quest.description}</p>
                <p><strong>Obiettivi:</strong></p>
                <ul>
                  ${quest.objectives.map(o => `<li>${o}</li>`).join('')}
                </ul>
                <p><strong>Ricompense:</strong></p>
                <ul>
                  <li>Reputazione: +${quest.rewards.reputation}</li>
                  <li>Oro: ${quest.rewards.gold} ducati</li>
                  <li>Speciale: ${quest.rewards.special}</li>
                </ul>
              </div>
            `
          });
        });

        html.find('#start-war').click(() => {
          this._showWarDialog();
        });
      }
    });

    dialog.render(true);
  }

  _showWarDialog() {
    const content = `
      <div class="faction-war-setup">
        <div class="form-group">
          <label>Fazione 1:</label>
          <select id="faction1">
            ${Object.entries(this.factions).map(([key, f]) =>
              `<option value="${key}">${f.name}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Fazione 2:</label>
          <select id="faction2">
            ${Object.entries(this.factions).map(([key, f]) =>
              `<option value="${key}">${f.name}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Motivo:</label>
          <input type="text" id="reason" value="Dispute territoriali">
        </div>
      </div>
    `;

    new Dialog({
      title: "Inizia Guerra tra Fazioni",
      content: content,
      buttons: {
        start: {
          label: "Inizia Guerra",
          callback: html => {
            const f1 = html.find('#faction1').val();
            const f2 = html.find('#faction2').val();
            const reason = html.find('#reason').val();
            this.startFactionWar(f1, f2, reason);
          }
        },
        cancel: { label: "Annulla" }
      }
    }).render(true);
  }
}