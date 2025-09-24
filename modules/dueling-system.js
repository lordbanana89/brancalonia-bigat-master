/**
 * Sistema Duelli Formali per Brancalonia
 * Duelli d'onore, sfide e combattimenti rituali
 * Compatibile con dnd5e system per Foundry VTT v13
 */

export class DuelingSystem {
  constructor() {
    // Tipi di duello disponibili
    this.duelTypes = {
      "primo_sangue": {
        name: "Al Primo Sangue",
        icon: "icons/skills/wounds/blood-drip-red.webp",
        description: "Il duello termina al primo colpo che causa danno",
        rules: {
          endCondition: "first-blood",
          maxRounds: null,
          lethal: false,
          allowMagic: false,
          allowRanged: false
        },
        rewards: {
          winner: { infamy: -5, reputation: 10 },
          loser: { infamy: -2, reputation: -5 }
        }
      },

      "sottomissione": {
        name: "Alla Sottomissione",
        icon: "icons/skills/social/wave-halt-stop.webp",
        description: "Il duello termina quando uno si arrende",
        rules: {
          endCondition: "submission",
          maxRounds: 10,
          lethal: false,
          allowMagic: false,
          allowRanged: false
        },
        rewards: {
          winner: { infamy: -3, reputation: 15 },
          loser: { infamy: 0, reputation: -10 }
        }
      },

      "morte": {
        name: "All'Ultimo Respiro",
        icon: "icons/magic/death/skull-humanoid-white.webp",
        description: "Duello mortale fino alla fine",
        rules: {
          endCondition: "death",
          maxRounds: null,
          lethal: true,
          allowMagic: true,
          allowRanged: false
        },
        rewards: {
          winner: { infamy: 20, reputation: 25 },
          loser: { infamy: 0, reputation: 0 } // Morto
        }
      },

      "incapacitazione": {
        name: "All'Incapacitazione",
        icon: "icons/magic/control/debuff-energy-hold-yellow.webp",
        description: "Il duello termina quando uno è reso incapace",
        rules: {
          endCondition: "incapacitated",
          maxRounds: 15,
          lethal: false,
          allowMagic: true,
          allowRanged: false
        },
        rewards: {
          winner: { infamy: -5, reputation: 20 },
          loser: { infamy: 5, reputation: -15 }
        }
      },

      "campione": {
        name: "Duello dei Campioni",
        icon: "icons/equipment/chest/breastplate-armor-studded-yellow.webp",
        description: "Duello formale con campioni che rappresentano le parti",
        rules: {
          endCondition: "submission",
          maxRounds: 20,
          lethal: false,
          allowMagic: true,
          allowRanged: true,
          allowChampions: true
        },
        rewards: {
          winner: { infamy: -10, reputation: 30, gold: "2d10 * 10" },
          loser: { infamy: 10, reputation: -20, gold: "-1d10 * 10" }
        }
      },

      "giudiziario": {
        name: "Duello Giudiziario",
        icon: "icons/tools/instruments/scales-merchant-gray.webp",
        description: "Duello per risolvere una disputa legale",
        rules: {
          endCondition: "first-blood",
          maxRounds: 5,
          lethal: false,
          allowMagic: false,
          allowRanged: false,
          divineJudgment: true
        },
        rewards: {
          winner: { infamy: -15, reputation: 20, legalStatus: "innocente" },
          loser: { infamy: 15, reputation: -10, legalStatus: "colpevole" }
        }
      }
    };

    // Stili di combattimento
    this.fightingStyles = {
      "aggressivo": {
        name: "Stile Aggressivo",
        bonus: { attack: 2, damage: "1d4", ac: -2 },
        description: "Attacchi furiosi ma difesa scoperta"
      },
      "difensivo": {
        name: "Stile Difensivo",
        bonus: { attack: -2, ac: 4, riposte: true },
        description: "Difesa solida con contrattacchi"
      },
      "equilibrato": {
        name: "Stile Equilibrato",
        bonus: { attack: 0, ac: 1, initiative: 2 },
        description: "Bilanciato tra attacco e difesa"
      },
      "ingannevole": {
        name: "Stile Ingannevole",
        bonus: { feint: true, advantage: "1/duel", disadvantageImpose: "1/duel" },
        description: "Finte e trucchi"
      },
      "brutale": {
        name: "Stile Brutale",
        bonus: { damage: "2d4", attack: -1, intimidate: true },
        description: "Colpi devastanti ma imprecisi"
      }
    };

    // Mosse speciali
    this.specialMoves = {
      "disarmo": {
        name: "Disarmo",
        dc: 14,
        cost: "action",
        effect: "Avversario disarmato per 1 round",
        requirements: "Competenza arma"
      },
      "finta": {
        name: "Finta",
        dc: null,
        cost: "bonus",
        effect: "Prossimo attacco con vantaggio",
        requirements: "Destrezza 13+"
      },
      "provocazione": {
        name: "Provocazione",
        dc: 12,
        cost: "bonus",
        effect: "Avversario ha svantaggio al prossimo attacco",
        requirements: "Carisma 12+"
      },
      "colpo_mirato": {
        name: "Colpo Mirato",
        dc: null,
        cost: "action",
        effect: "Attacco -5, danno +10",
        requirements: "BAB +5"
      },
      "parata_riposte": {
        name: "Parata e Riposte",
        dc: null,
        cost: "reaction",
        effect: "Se parata riesce, attacco immediato",
        requirements: "Stile difensivo"
      }
    };

    // Stato duelli attivi
    this.activeDuels = new Map();

    this._setupHooks();
    this._registerSettings();
  }

  _setupHooks() {
    // Hook per iniziativa speciale duelli
    Hooks.on("preCreateCombat", (combat, data, options, userId) => {
      if (combat.flags?.brancalonia?.isDuel) {
        // Modifica regole combattimento per duello
        this._modifyCombatForDuel(combat);
      }
    });

    // Hook per fine round in duello
    Hooks.on("updateCombat", (combat, update, options, userId) => {
      if (!combat.flags?.brancalonia?.isDuel) return;

      const duelId = combat.flags.brancalonia.duelId;
      const duel = this.activeDuels.get(duelId);

      if (duel && update.round) {
        this._checkDuelConditions(duel, combat);
      }
    });

    // Hook per attacchi in duello
    Hooks.on("dnd5e.preRollAttack", (item, rollData, messageData) => {
      const combat = game.combat;
      if (!combat?.flags?.brancalonia?.isDuel) return;

      const duelId = combat.flags.brancalonia.duelId;
      const duel = this.activeDuels.get(duelId);

      if (duel) {
        this._applyDuelModifiers(item, rollData, duel);
      }
    });

    // Hook per danni in duello
    Hooks.on("dnd5e.preRollDamage", (item, rollData, messageData) => {
      const combat = game.combat;
      if (!combat?.flags?.brancalonia?.isDuel) return;

      const duelId = combat.flags.brancalonia.duelId;
      const duel = this.activeDuels.get(duelId);

      if (duel && duel.type.rules.endCondition === "first-blood") {
        // Termina al primo sangue
        this._endDuel(duel, item.parent);
      }
    });
  }

  _registerSettings() {
    game.settings.register("brancalonia-bigat", "duelRules", {
      name: "Regole Duelli",
      hint: "Tipo di regole per i duelli",
      scope: "world",
      config: true,
      type: String,
      choices: {
        "strict": "Rigorose (no magia, no ranged)",
        "flexible": "Flessibili (alcune eccezioni)",
        "free": "Libere (tutto permesso)"
      },
      default: "strict"
    });

    game.settings.register("brancalonia-bigat", "duelSpectators", {
      name: "Spettatori nei Duelli",
      hint: "Gli spettatori influenzano il duello",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });
  }

  /**
   * Inizia un nuovo duello
   */
  async startDuel(challenger, challenged, type = "primo_sangue", options = {}) {
    const duelType = this.duelTypes[type];
    if (!duelType) {
      ui.notifications.error(`Tipo di duello ${type} non valido!`);
      return;
    }

    // Crea ID unico per il duello
    const duelId = foundry.utils.randomID();

    // Inizializza dati duello
    const duelData = {
      id: duelId,
      type: duelType,
      challenger: {
        actor: challenger,
        hp: challenger.system.attributes.hp.value,
        style: options.challengerStyle || "equilibrato",
        moves: [],
        wounds: 0
      },
      challenged: {
        actor: challenged,
        hp: challenged.system.attributes.hp.value,
        style: options.challengedStyle || "equilibrato",
        moves: [],
        wounds: 0
      },
      round: 0,
      spectators: options.spectators || 0,
      stakes: options.stakes || null,
      witnesses: options.witnesses || [],
      startTime: game.time.worldTime
    };

    this.activeDuels.set(duelId, duelData);

    // Prepara la scena per il duello
    await this._prepareDuelScene(duelData);

    // Annuncia il duello
    ChatMessage.create({
      content: `
        <div class="brancalonia-duel-start">
          <h2>⚔️ DUELLO! ⚔️</h2>
          <p class="duel-type">${duelType.name}</p>
          <div class="duelists">
            <div class="challenger">
              <h3>Sfidante</h3>
              <p><strong>${challenger.name}</strong></p>
              <p>Stile: ${this.fightingStyles[duelData.challenger.style].name}</p>
            </div>
            <div class="vs">VS</div>
            <div class="challenged">
              <h3>Sfidato</h3>
              <p><strong>${challenged.name}</strong></p>
              <p>Stile: ${this.fightingStyles[duelData.challenged.style].name}</p>
            </div>
          </div>
          <p class="description"><em>${duelType.description}</em></p>
          ${duelData.stakes ? `<p class="stakes">Posta in gioco: ${duelData.stakes}</p>` : ''}
          ${duelData.spectators > 0 ? `<p class="spectators">Spettatori: ${duelData.spectators}</p>` : ''}
        </div>
      `,
      speaker: { alias: "Maestro del Duello" }
    });

    // Inizia combattimento speciale
    await this._startDuelCombat(duelData);

    return duelData;
  }

  /**
   * Prepara la scena per il duello
   */
  async _prepareDuelScene(duelData) {
    // Posiziona i duellanti
    const tokens = [];

    for (let duelist of [duelData.challenger, duelData.challenged]) {
      const token = duelist.actor.getActiveTokens()[0];
      if (token) {
        // Applica stile di combattimento
        await this._applyFightingStyle(duelist.actor, duelist.style);

        // Resetta HP se non letale
        if (!duelData.type.rules.lethal) {
          await duelist.actor.update({
            "system.attributes.hp.temp": duelist.actor.system.attributes.hp.max
          });
        }

        tokens.push(token);
      }
    }

    // Posiziona i token uno di fronte all'altro
    if (tokens.length === 2) {
      const centerX = canvas.dimensions.width / 2;
      const centerY = canvas.dimensions.height / 2;

      await tokens[0].document.update({
        x: centerX - 200,
        y: centerY
      });

      await tokens[1].document.update({
        x: centerX + 200,
        y: centerY
      });
    }

    // Aggiungi effetto visivo arena
    if (game.settings.get("brancalonia-bigat", "duelSpectators")) {
      await this._createDuelArena(duelData);
    }
  }

  /**
   * Applica stile di combattimento
   */
  async _applyFightingStyle(actor, styleName) {
    const style = this.fightingStyles[styleName];
    if (!style) return;

    const changes = [];

    if (style.bonus.attack) {
      changes.push({
        key: "system.bonuses.attack.attack",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: style.bonus.attack.toString()
      });
    }

    if (style.bonus.ac) {
      changes.push({
        key: "system.attributes.ac.bonus",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: style.bonus.ac.toString()
      });
    }

    if (style.bonus.initiative) {
      changes.push({
        key: "system.attributes.init.bonus",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: style.bonus.initiative.toString()
      });
    }

    const effectData = {
      name: `Stile di Duello: ${style.name}`,
      icon: "icons/skills/melee/swords-crossed-silver.webp",
      origin: actor.uuid,
      duration: {},
      changes: changes,
      flags: {
        brancalonia: {
          isDuelStyle: true,
          styleName: styleName,
          styleData: style
        }
      },
      description: style.description
    };

    await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
  }

  /**
   * Inizia combattimento di duello
   */
  async _startDuelCombat(duelData) {
    const combatData = {
      scene: canvas.scene.id,
      combatants: [],
      flags: {
        brancalonia: {
          isDuel: true,
          duelId: duelData.id,
          duelType: duelData.type.name
        }
      }
    };

    // Aggiungi combattenti
    for (let duelist of [duelData.challenger, duelData.challenged]) {
      const token = duelist.actor.getActiveTokens()[0];
      if (token) {
        combatData.combatants.push({
          tokenId: token.id,
          sceneId: canvas.scene.id,
          actorId: duelist.actor.id
        });
      }
    }

    const combat = await Combat.create(combatData);
    await combat.startCombat();
  }

  /**
   * Modifica combattimento per duello
   */
  _modifyCombatForDuel(combat) {
    // Regole speciali per duelli
    const updates = {
      "flags.dnd5e.skipDefeated": true // Non salta sconfitti
    };
    combat.update(updates);

    // Iniziativa con modificatori stile
    Hooks.once("combatStart", (combat) => {
      this._rollDuelInitiative(combat);
    });
  }

  /**
   * Tira iniziativa speciale per duello
   */
  async _rollDuelInitiative(combat) {
    const duelId = combat.flags.brancalonia?.duelId;
    if (!duelId) return;

    const duel = this.activeDuels.get(duelId);
    if (!duel) return;

    // Aggiungi bonus stile all'iniziativa
    for (let combatant of combat.combatants) {
      const duelist = duel.challenger.actor.id === combatant.actor.id
        ? duel.challenger
        : duel.challenged;

      const style = this.fightingStyles[duelist.style];
      const bonus = style.bonus.initiative || 0;

      // Crea roll con bonus incluso
      const formula = `1d20 + ${combatant.actor.system.attributes.init.mod} + ${bonus}`;
      const roll = await new Roll(formula).evaluate();

      await combat.updateEmbeddedDocuments("Combatant", [{
        _id: combatant.id,
        initiative: roll.total
      }]);
    }
  }

  /**
   * Controlla condizioni di fine duello
   */
  async _checkDuelConditions(duel, combat) {
    const type = duel.type;

    // Controlla round massimi
    if (type.rules.maxRounds && combat.round > type.rules.maxRounds) {
      await this._endDuel(duel, null, "time-limit");
      return;
    }

    // Controlla condizioni specifiche
    for (let duelist of [duel.challenger, duel.challenged]) {
      const actor = duelist.actor;

      switch (type.rules.endCondition) {
        case "death":
          if (actor.system.attributes.hp.value <= 0) {
            const winner = duelist === duel.challenger ? duel.challenged : duel.challenger;
            await this._endDuel(duel, winner.actor, "death");
            return;
          }
          break;

        case "incapacitated":
          const hasIncapacitated = actor.effects.some(e => e.statuses.has("incapacitated"));
          const hasUnconscious = actor.effects.some(e => e.statuses.has("unconscious"));
          if (hasIncapacitated || hasUnconscious) {
            const winner = duelist === duel.challenger ? duel.challenged : duel.challenger;
            await this._endDuel(duel, winner.actor, "incapacitated");
            return;
          }
          break;

        case "submission":
          // Controlla se qualcuno si arrende (gestito via dialog)
          break;

        case "first-blood":
          // Gestito nel hook danni
          break;
      }
    }
  }

  /**
   * Applica modificatori del duello
   */
  _applyDuelModifiers(item, config, duel) {
    // Modificatori spettatori
    if (game.settings.get("brancalonia-bigat", "duelSpectators") && duel.spectators > 0) {
      const spectatorBonus = Math.floor(duel.spectators / 10);
      config.parts = config.parts || [];
      config.parts.push(`+${spectatorBonus}[Spettatori]`);

      if (spectatorBonus > 0) {
        ChatMessage.create({
          content: `<p>🎭 Gli spettatori incoraggiano! +${spectatorBonus} al tiro</p>`,
          speaker: ChatMessage.getSpeaker({ actor: item.parent })
        });
      }
    }

    // Modificatori stile
    const duelist = duel.challenger.actor.id === item.parent.id
      ? duel.challenger
      : duel.challenged;

    const style = this.fightingStyles[duelist.style];
    if (style.bonus.damage && config.parts) {
      config.parts.push(`+${style.bonus.damage}[Stile]`);
    }
  }

  /**
   * Esegui mossa speciale
   */
  async executeSpecialMove(actor, moveName, target) {
    const move = this.specialMoves[moveName];
    if (!move) {
      ui.notifications.error(`Mossa ${moveName} non valida!`);
      return;
    }

    // Controlla requisiti
    if (!this._checkMoveRequirements(actor, move)) {
      ui.notifications.warn(`Non soddisfi i requisiti per ${move.name}`);
      return;
    }

    // Applica costo
    let success = true;
    if (move.dc) {
      const roll = await actor.rollSkill("ath", {
        dc: move.dc,
        flavor: move.name
      });
      success = roll.total >= move.dc;
    }

    if (success) {
      // Applica effetto
      await this._applyMoveEffect(actor, target, move);

      ChatMessage.create({
        content: `
          <div class="brancalonia-special-move">
            <h3>⚡ ${move.name}!</h3>
            <p><strong>${actor.name}</strong> esegue ${move.name}</p>
            <p><em>${move.effect}</em></p>
          </div>
        `,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    } else {
      ChatMessage.create({
        content: `<p>${actor.name} fallisce ${move.name}!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }

  /**
   * Applica modificatori del duello
   */
  _applyDuelModifiers(item, config, duel) {
    const actor = item.parent;
    const duelist = duel.challenger.actor.id === actor.id
      ? duel.challenger
      : duel.challenged;

    const style = this.fightingStyles[duelist.style];

    // Applica bonus stile all'attacco
    if (style.bonus.attack) {
      config.parts = config.parts || [];
      config.parts.push(`+${style.bonus.attack}[Stile ${style.name}]`);
    }

    // Controlli vantaggi/svantaggi da mosse speciali
    if (actor.flags.brancalonia?.nextAttackAdvantage) {
      config.advantage = true;
      actor.unsetFlag("brancalonia-bigat", "nextAttackAdvantage");
    }
    if (actor.flags.brancalonia?.nextAttackDisadvantage) {
      config.disadvantage = true;
      actor.unsetFlag("brancalonia-bigat", "nextAttackDisadvantage");
    }

    // Power attack
    const powerAttack = actor.flags.brancalonia?.powerAttack;
    if (powerAttack) {
      config.parts.push(`${powerAttack.attack}[Colpo Mirato]`);
      actor.unsetFlag("brancalonia-bigat", "powerAttack");
    }
  }

  /**
   * Controlla requisiti mossa
   */
  _checkMoveRequirements(actor, move) {
    const req = move.requirements;

    if (req.includes("Destrezza")) {
      const minDex = parseInt(req.match(/\d+/)[0]);
      if (actor.system.abilities.dex.value < minDex) return false;
    }

    if (req.includes("Carisma")) {
      const minCha = parseInt(req.match(/\d+/)[0]);
      if (actor.system.abilities.cha.value < minCha) return false;
    }

    if (req.includes("BAB")) {
      const minBAB = parseInt(req.match(/\d+/)[0]);
      const bab = actor.system.attributes.prof || 0;
      if (bab < minBAB) return false;
    }

    return true;
  }

  /**
   * Applica effetto mossa
   */
  async _applyMoveEffect(actor, target, move) {
    switch (move.name) {
      case "Disarmo":
        if (target) {
          const weapon = target.items.find(i => i.type === "weapon" && i.system.equipped);
          if (weapon) {
            await weapon.update({ "system.equipped": false });
            ui.notifications.info(`${target.name} è stato disarmato!`);
          }
        }
        break;

      case "Finta":
        await actor.setFlag("brancalonia-bigat", "nextAttackAdvantage", true);
        break;

      case "Provocazione":
        if (target) {
          await target.setFlag("brancalonia-bigat", "nextAttackDisadvantage", true);
        }
        break;

      case "Colpo Mirato":
        await actor.setFlag("brancalonia-bigat", "powerAttack", { attack: -5, damage: 10 });
        break;
    }
  }

  /**
   * Richiedi sottomissione
   */
  async requestSubmission(actor) {
    const combat = game.combat;
    if (!combat?.flags?.brancalonia?.isDuel) {
      ui.notifications.warn("Non sei in un duello!");
      return;
    }

    const duelId = combat.flags.brancalonia.duelId;
    const duel = this.activeDuels.get(duelId);
    if (!duel) return;

    const opponent = duel.challenger.actor.id === actor.id
      ? duel.challenged.actor
      : duel.challenger.actor;

    new Dialog({
      title: "Richiesta di Resa",
      content: `<p>${actor.name} chiede la resa a ${opponent.name}</p>`,
      buttons: {
        accept: {
          label: "Accetta Resa",
          callback: () => this._endDuel(duel, opponent, "submission")
        },
        refuse: {
          label: "Rifiuta",
          callback: () => {
            ChatMessage.create({
              content: `<p>${opponent.name} rifiuta di arrendersi! Il duello continua!</p>`,
              speaker: ChatMessage.getSpeaker({ actor: opponent })
            });
          }
        }
      }
    }).render(true);
  }

  /**
   * Termina il duello
   */
  async _endDuel(duel, winner, reason) {
    const loser = winner?.id === duel.challenger.actor.id
      ? duel.challenged.actor
      : duel.challenger.actor;

    // Rimuovi effetti stile
    for (let duelist of [duel.challenger.actor, duel.challenged.actor]) {
      const effects = duelist.effects.filter(e => e.flags.brancalonia?.isDuelStyle);
      for (let effect of effects) {
        await effect.delete();
      }
    }

    // Applica ricompense
    if (winner) {
      const rewards = duel.type.rewards;

      // Infamia
      if (rewards.winner.infamy) {
        const currentInfamia = winner.flags.brancalonia?.infamia || 0;
        await winner.setFlag("brancalonia-bigat", "infamia", currentInfamia + rewards.winner.infamy);
      }
      if (rewards.loser.infamy) {
        const currentInfamia = loser.flags.brancalonia?.infamia || 0;
        await loser.setFlag("brancalonia-bigat", "infamia", currentInfamia + rewards.loser.infamy);
      }

      // Reputazione
      if (rewards.winner.reputation) {
        await this._adjustReputation(winner, rewards.winner.reputation);
      }
      if (rewards.loser.reputation) {
        await this._adjustReputation(loser, rewards.loser.reputation);
      }

      // Oro
      if (rewards.winner.gold) {
        const goldRoll = await new Roll(rewards.winner.gold).evaluate();
        await winner.update({
          "system.currency.du": winner.system.currency.du + goldRoll.total
        });
      }
    }

    // Messaggio finale
    ChatMessage.create({
      content: `
        <div class="brancalonia-duel-end">
          <h2>⚔️ FINE DEL DUELLO! ⚔️</h2>
          ${winner ? `
            <h3>🏆 Vincitore: ${winner.name}</h3>
            <p>Sconfitto: ${loser.name}</p>
          ` : '<h3>Pareggio!</h3>'}
          <p>Motivo: ${this._getEndReason(reason)}</p>
          <p>Durata: ${duel.round} round</p>
          ${duel.stakes ? `<p>Il vincitore ottiene: ${duel.stakes}</p>` : ''}
        </div>
      `,
      speaker: { alias: "Maestro del Duello" }
    });

    // Termina combattimento
    if (game.combat?.flags?.brancalonia?.duelId === duel.id) {
      await game.combat.endCombat();
    }

    // Rimuovi duello attivo
    this.activeDuels.delete(duel.id);
  }

  /**
   * Ottieni motivo fine duello
   */
  _getEndReason(reason) {
    const reasons = {
      "first-blood": "Primo Sangue",
      "death": "Morte",
      "incapacitated": "Incapacitazione",
      "submission": "Resa",
      "time-limit": "Limite di Tempo",
      "interference": "Interferenza Esterna"
    };
    return reasons[reason] || reason;
  }

  /**
   * Aggiusta reputazione
   */
  async _adjustReputation(actor, amount) {
    const currentRep = actor.flags.brancalonia?.reputation || 0;
    await actor.setFlag("brancalonia-bigat", "reputation", currentRep + amount);

    const emoji = amount > 0 ? "📈" : "📉";
    ui.notifications.info(`${emoji} ${actor.name}: Reputazione ${amount > 0 ? '+' : ''}${amount}`);
  }

  /**
   * Crea arena visiva per duello
   */
  async _createDuelArena(duelData) {
    // Crea cerchio di spettatori con tiles
    const centerX = canvas.dimensions.width / 2;
    const centerY = canvas.dimensions.height / 2;
    const radius = 400;

    const spectatorTiles = [];
    const spectatorCount = Math.min(duelData.spectators, 20);

    for (let i = 0; i < spectatorCount; i++) {
      const angle = (i / spectatorCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      spectatorTiles.push({
        img: "icons/environment/people/commoner.webp",
        x: x - 25,
        y: y - 25,
        width: 50,
        height: 50,
        rotation: (angle * 180 / Math.PI) - 90,
        flags: {
          brancalonia: {
            isSpectator: true,
            duelId: duelData.id
          }
        }
      });
    }

    await canvas.scene.createEmbeddedDocuments("Tile", spectatorTiles);
  }

  /**
   * UI per gestione duelli
   */
  renderDuelManager() {
    const content = `
      <div class="brancalonia-duel-manager">
        <h2>⚔️ Gestione Duelli</h2>

        <div class="duel-setup">
          <h3>Nuovo Duello</h3>

          <div class="form-group">
            <label>Sfidante:</label>
            <select id="challenger-select">
              ${game.actors.filter(a => a.hasPlayerOwner).map(a =>
                `<option value="${a.id}">${a.name}</option>`
              ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Sfidato:</label>
            <select id="challenged-select">
              ${game.actors.filter(a => a.type === "character" || a.type === "npc").map(a =>
                `<option value="${a.id}">${a.name}</option>`
              ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Tipo di Duello:</label>
            <select id="duel-type">
              ${Object.entries(this.duelTypes).map(([key, type]) =>
                `<option value="${key}">${type.name}</option>`
              ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Stile Sfidante:</label>
            <select id="challenger-style">
              ${Object.entries(this.fightingStyles).map(([key, style]) =>
                `<option value="${key}">${style.name}</option>`
              ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Stile Sfidato:</label>
            <select id="challenged-style">
              ${Object.entries(this.fightingStyles).map(([key, style]) =>
                `<option value="${key}">${style.name}</option>`
              ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Posta in Gioco:</label>
            <input type="text" id="stakes" placeholder="Oro, oggetti, onore...">
          </div>

          <div class="form-group">
            <label>Spettatori:</label>
            <input type="number" id="spectators" value="0" min="0" max="100">
          </div>

          <button id="start-duel">Inizia Duello!</button>
        </div>

        <div class="active-duels">
          <h3>Duelli Attivi</h3>
          ${this.activeDuels.size > 0 ?
            Array.from(this.activeDuels.values()).map(duel => `
              <div class="active-duel">
                <p>${duel.challenger.actor.name} vs ${duel.challenged.actor.name}</p>
                <p>${duel.type.name} - Round ${duel.round}</p>
              </div>
            `).join('') :
            '<p>Nessun duello attivo</p>'
          }
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: "Gestione Duelli",
      content: content,
      buttons: {
        close: { label: "Chiudi" }
      },
      render: html => {
        html.find('#start-duel').click(async () => {
          const challengerId = html.find('#challenger-select').val();
          const challengedId = html.find('#challenged-select').val();
          const type = html.find('#duel-type').val();

          const challenger = game.actors.get(challengerId);
          const challenged = game.actors.get(challengedId);

          if (challenger && challenged) {
            await this.startDuel(challenger, challenged, type, {
              challengerStyle: html.find('#challenger-style').val(),
              challengedStyle: html.find('#challenged-style').val(),
              stakes: html.find('#stakes').val(),
              spectators: parseInt(html.find('#spectators').val()) || 0
            });
            dialog.close();
          }
        });
      }
    });

    dialog.render(true);
  }
}