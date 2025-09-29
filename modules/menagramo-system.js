/**
 * Sistema Menagramo (Sfortuna) per Brancalonia
 * Completamente compatibile con dnd5e system per Foundry VTT v13
 */

class MenagramoSystem {
  constructor() {
    // Livelli di menagramo con effetti conformi a dnd5e
    this.menagramoLevels = {
      minor: {
        name: "Menagramo Minore",
        img: "icons/magic/death/skull-humanoid-crown-white.webp",
        duration: "1d4",
        effects: [
          {
            key: "flags.midi-qol.disadvantage.ability.check",
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: "1",
            priority: 20
          }
        ],
        description: "Svantaggio su una prova di caratteristica a scelta del GM"
      },
      moderate: {
        name: "Menagramo Moderato",
        img: "icons/magic/death/skull-humanoid-crown-yellow.webp",
        duration: "2d4",
        effects: [
          {
            key: "flags.midi-qol.disadvantage.attack.all",
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: "1",
            priority: 20
          },
          {
            key: "flags.midi-qol.disadvantage.save.all",
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: "1",
            priority: 20
          }
        ],
        description: "Svantaggio su tutti i tiri di attacco e salvezza"
      },
      major: {
        name: "Menagramo Maggiore",
        img: "icons/magic/death/skull-humanoid-crown-red.webp",
        duration: "3d4",
        effects: [
          {
            key: "flags.midi-qol.disadvantage.all",
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: "1",
            priority: 20
          },
          {
            key: "system.attributes.ac.bonus",
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: "-2",
            priority: 20
          }
        ],
        description: "Svantaggio su TUTTI i tiri, -2 CA"
      },
      catastrophic: {
        name: "Menagramo Catastrofico",
        img: "icons/magic/death/skull-humanoid-crown-black.webp",
        duration: "1d6 + 1",
        effects: [
          {
            key: "flags.midi-qol.disadvantage.all",
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: "1",
            priority: 20
          },
          {
            key: "system.attributes.ac.bonus",
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: "-4",
            priority: 20
          },
          {
            key: "system.attributes.movement.walk",
            mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
            value: "0.5",
            priority: 20
          }
        ],
        description: "Svantaggio su tutto, -4 CA, velocità dimezzata"
      }
    };

    // Tabella eventi sfortunati
    this.misfortuneEvents = [
      // Eventi minori (1-10)
      { range: [1, 2], event: "Inciampi e cadi prono", effect: "prone" },
      { range: [3, 4], event: "La tua arma scivola di mano", effect: "disarm" },
      { range: [5, 6], event: "Colpisci un alleato per sbaglio", effect: "friendlyFire" },
      { range: [7, 8], event: "Ti distrai completamente", effect: "skipTurn" },
      { range: [9, 10], event: "Rompi un pezzo d'equipaggiamento", effect: "breakItem" },

      // Eventi moderati (11-15)
      { range: [11, 12], event: "Attiri l'attenzione nemica", effect: "targeted" },
      { range: [13, 14], event: "Perdi oggetti dalla borsa", effect: "loseGold" },
      { range: [15, 15], event: "Ti ferisci da solo", effect: "selfDamage" },

      // Eventi maggiori (16-19)
      { range: [16, 17], event: "Crollo strutturale sopra di te", effect: "fallingDebris" },
      { range: [18, 19], event: "Maledizione temporanea", effect: "curse" },

      // Evento catastrofico (20)
      { range: [20, 20], event: "Disastro totale!", effect: "disaster" }
    ];

    // Metodi per rimuovere il menagramo
    this.removalMethods = {
      blessing: {
        name: "Benedizione Religiosa",
        cost: 50,
        check: { ability: "rel", dc: 15 },
        description: "Un chierico benedice per rimuovere la sfortuna"
      },
      ritual: {
        name: "Rituale di Purificazione",
        cost: 100,
        time: "1 ora",
        description: "Complesso rituale per eliminare il menagramo"
      },
      goodDeed: {
        name: "Atto di Bontà",
        check: { ability: "cha", dc: 13 },
        infamyLoss: 5,
        description: "Un atto altruistico può spezzare la sfortuna"
      },
      offering: {
        name: "Offerta agli Spiriti",
        cost: "2d6 * 10",
        description: "Offerta monetaria per placare gli spiriti"
      },
      quest: {
        name: "Missione di Redenzione",
        description: "Completa una missione per rimuovere il menagramo"
      }
    };

  }

  static initialize() {
    console.log("Inizializzazione MenagramoSystem...");

    // Registrazione settings
    game.settings.register("brancalonia-bigat", "menagramoEnabled", {
      name: "Sistema Menagramo Attivo",
      hint: "Abilita il sistema di sfortuna di Brancalonia",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register("brancalonia-bigat", "menagramoFrequency", {
      name: "Frequenza Eventi Sfortuna",
      hint: "Quanto spesso accadono eventi di sfortuna casuali",
      scope: "world",
      config: true,
      type: String,
      choices: {
        "low": "Bassa (5%)",
        "medium": "Media (10%)",
        "high": "Alta (20%)",
        "chaotic": "Caotica (30%)"
      },
      default: "medium"
    });

    game.settings.register("brancalonia-bigat", "menagramoVisualEffects", {
      name: "Effetti Visivi",
      hint: "Mostra effetti visivi sui token con menagramo",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register("brancalonia-bigat", "menagramoCriticalEvents", {
      name: "Eventi Critici",
      hint: "Abilita eventi di sfortuna critica su 1 naturale",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });

    // Creazione istanza globale
    window.MenagramoSystem = new MenagramoSystem();

    // Registrazione hooks
    MenagramoSystem._registerHooks();

    // Registrazione comandi chat
    MenagramoSystem._registerChatCommands();

    // Creazione macro automatica
    MenagramoSystem._createMacro();

    console.log("MenagramoSystem inizializzato correttamente!");
  }

  static _registerHooks() {
    // Hook per applicare sfortuna ai tiri
    Hooks.on("dnd5e.preRollAttack", (item, rollData, messageData) => {
      if (!game.settings.get("brancalonia-bigat", "menagramoEnabled")) return;

      const actor = item.parent;
      if (window.MenagramoSystem._hasMenagramo(actor)) {
        window.MenagramoSystem._applyMisfortune(actor, rollData, "attack");
      }
    });

    Hooks.on("dnd5e.preRollAbilityTest", (actor, rollData, messageData) => {
      if (!game.settings.get("brancalonia-bigat", "menagramoEnabled")) return;

      if (window.MenagramoSystem._hasMenagramo(actor)) {
        window.MenagramoSystem._applyMisfortune(actor, rollData, "ability");
      }
    });

    Hooks.on("dnd5e.preRollAbilitySave", (actor, rollData, messageData) => {
      if (!game.settings.get("brancalonia-bigat", "menagramoEnabled")) return;

      if (window.MenagramoSystem._hasMenagramo(actor)) {
        window.MenagramoSystem._applyMisfortune(actor, rollData, "save");
      }
    });

    // Hook per eventi casuali di sfortuna
    Hooks.on("updateCombat", (combat, update, options, userId) => {
      if (!game.settings.get("brancalonia-bigat", "menagramoEnabled")) return;
      if (update.turn === undefined) return;

      const combatant = combat.combatant;
      if (!combatant) return;

      const actor = combatant.actor;
      const frequency = game.settings.get("brancalonia-bigat", "menagramoFrequency");
      const chances = { low: 0.05, medium: 0.1, high: 0.2, chaotic: 0.3 };

      if (window.MenagramoSystem._hasMenagramo(actor) && Math.random() < chances[frequency]) {
        window.MenagramoSystem._triggerMisfortuneEvent(actor);
      }
    });

    // Hook per 1 naturale sotto menagramo
    Hooks.on("dnd5e.rollAttack", (item, roll, ammo) => {
      if (!game.settings.get("brancalonia-bigat", "menagramoEnabled")) return;
      if (!game.settings.get("brancalonia-bigat", "menagramoCriticalEvents")) return;

      const actor = item.parent;
      if (!actor) return;

      // Se tira 1 naturale con menagramo
      if (roll.dice[0]?.results[0]?.result === 1 && window.MenagramoSystem._hasMenagramo(actor)) {
        window.MenagramoSystem._criticalMisfortune(actor);
      }
    });

    // Hook per aggiungere pulsante menagramo alle schede personaggio
    Hooks.on("renderActorSheet", (app, html, data) => {
      if (app.actor.type !== "character" || !game.user.isGM) return;
      if (!game.settings.get("brancalonia-bigat", "menagramoEnabled")) return;

      const button = $(`<button class="menagramo-manager-btn" title="Gestione Menagramo">
        <i class="fas fa-skull"></i>
      </button>`);
      html.find(".window-header .window-title").after(button);
      button.click(() => {
        window.MenagramoSystem.showMenagramoDialog(app.actor);
      });
    });

    console.log("MenagramoSystem hooks registrati!");
  }

  static _registerChatCommands() {
    // Comando per applicare menagramo
    game.chatCommands.register({
      name: "/menagramo-applica",
      module: "brancalonia-bigat",
      description: "Applica menagramo a un personaggio",
      icon: "<i class='fas fa-skull'></i>",
      callback: async (chat, parameters, messageData) => {
        if (!game.user.isGM) {
          ui.notifications.error("Solo il GM può applicare il menagramo!");
          return;
        }

        const tokens = canvas.tokens.controlled;
        if (tokens.length !== 1) {
          ui.notifications.error("Seleziona un solo token!");
          return;
        }

        const params = parameters.split(" ");
        const level = params[0] || "minor";
        const reason = params.slice(1).join(" ") || "Sfortuna";

        const validLevels = ["minor", "moderate", "major", "catastrophic"];
        if (!validLevels.includes(level)) {
          ui.notifications.error("Livello non valido! Usa: minor, moderate, major, catastrophic");
          return;
        }

        await window.MenagramoSystem.applyMenagramo(tokens[0].actor, level, reason);
      }
    });

    // Comando per rimuovere menagramo
    game.chatCommands.register({
      name: "/menagramo-rimuovi",
      module: "brancalonia-bigat",
      description: "Rimuove menagramo da un personaggio",
      icon: "<i class='fas fa-heart'></i>",
      callback: async (chat, parameters, messageData) => {
        if (!game.user.isGM) {
          ui.notifications.error("Solo il GM può rimuovere il menagramo!");
          return;
        }

        const tokens = canvas.tokens.controlled;
        if (tokens.length !== 1) {
          ui.notifications.error("Seleziona un solo token!");
          return;
        }

        const method = parameters || null;
        await window.MenagramoSystem.removeMenagramo(tokens[0].actor, method);
      }
    });

    // Comando per dialog menagramo
    game.chatCommands.register({
      name: "/menagramo-dialog",
      module: "brancalonia-bigat",
      description: "Apre dialog gestione menagramo",
      icon: "<i class='fas fa-cogs'></i>",
      callback: (chat, parameters, messageData) => {
        if (!game.user.isGM) {
          ui.notifications.error("Solo il GM può gestire il menagramo!");
          return;
        }

        const tokens = canvas.tokens.controlled;
        if (tokens.length !== 1) {
          ui.notifications.error("Seleziona un solo token!");
          return;
        }

        window.MenagramoSystem.showMenagramoDialog(tokens[0].actor);
      }
    });

    // Comando per evento sfortuna
    game.chatCommands.register({
      name: "/menagramo-evento",
      module: "brancalonia-bigat",
      description: "Scatena evento di sfortuna casuale",
      icon: "<i class='fas fa-bolt'></i>",
      callback: async (chat, parameters, messageData) => {
        if (!game.user.isGM) {
          ui.notifications.error("Solo il GM può scatenare eventi!");
          return;
        }

        const tokens = canvas.tokens.controlled;
        if (tokens.length !== 1) {
          ui.notifications.error("Seleziona un solo token!");
          return;
        }

        await window.MenagramoSystem._triggerMisfortuneEvent(tokens[0].actor);
      }
    });

    // Comando help
    game.chatCommands.register({
      name: "/menagramo-help",
      module: "brancalonia-bigat",
      description: "Mostra l'aiuto per i comandi menagramo",
      icon: "<i class='fas fa-question-circle'></i>",
      callback: (chat, parameters, messageData) => {
        const helpText = `
          <div class="brancalonia-help">
            <h3>Comandi Sistema Menagramo</h3>
            <ul>
              <li><strong>/menagramo-applica [livello] [motivo]</strong> - Applica menagramo</li>
              <li><strong>/menagramo-rimuovi [metodo]</strong> - Rimuove menagramo</li>
              <li><strong>/menagramo-dialog</strong> - Apre dialog gestione</li>
              <li><strong>/menagramo-evento</strong> - Scatena evento casuale</li>
              <li><strong>/menagramo-help</strong> - Mostra questo aiuto</li>
            </ul>
            <h4>Livelli:</h4>
            <p>minor, moderate, major, catastrophic</p>
            <h4>Metodi Rimozione:</h4>
            <p>blessing, ritual, goodDeed, offering, quest</p>
          </div>
        `;

        ChatMessage.create({
          content: helpText,
          speaker: { alias: "Sistema Menagramo" },
          whisper: [game.user.id]
        });
      }
    });

    console.log("MenagramoSystem comandi chat registrati!");
  }

  static _createMacro() {
    const macroData = {
      name: "Gestione Menagramo",
      type: "script",
      scope: "global",
      command: `
// Macro per Gestione Menagramo
if (!game.user.isGM) {
  ui.notifications.error("Solo il GM può utilizzare questa macro!");
} else {
  const tokens = canvas.tokens.controlled;

  if (tokens.length === 0) {
    ui.notifications.warn("Seleziona un token!");
  } else if (tokens.length === 1) {
    const actor = tokens[0].actor;
    if (actor.type === "character" || actor.type === "npc") {
      // Controlla se ha già menagramo
      const hasMenagramo = actor.effects.some(e => e.flags.brancalonia?.isMenagramo);

      if (hasMenagramo) {
        // Dialog per rimuovere o gestire
        new Dialog({
          title: \`Menagramo - \${actor.name}\`,
          content: \`
            <div class="form-group">
              <p>\${actor.name} è già afflitto da menagramo.</p>
              <button id="remove-btn" class="button">Rimuovi Menagramo</button>
              <button id="worsen-btn" class="button">Peggiora Menagramo</button>
              <button id="event-btn" class="button">Evento Sfortuna</button>
            </div>
          \`,
          buttons: {
            close: { label: "Chiudi" }
          },
          render: html => {
            html.find('#remove-btn').click(() => {
              window.MenagramoSystem.showRemovalDialog(actor);
            });
            html.find('#worsen-btn').click(() => {
              window.MenagramoSystem.showMenagramoDialog(actor);
            });
            html.find('#event-btn').click(() => {
              window.MenagramoSystem._triggerMisfortuneEvent(actor);
            });
          }
        }).render(true);
      } else {
        // Applica nuovo menagramo
        window.MenagramoSystem.showMenagramoDialog(actor);
      }
    } else {
      ui.notifications.error("Seleziona un personaggio o PNG!");
    }
  } else {
    ui.notifications.error("Seleziona un solo token!");
  }
}
      `,
      img: "icons/magic/death/skull-humanoid-crown-white.webp",
      flags: {
        "brancalonia-bigat": {
          isSystemMacro: true,
          version: "1.0"
        }
      }
    };

    // Verifica se la macro esiste già
    const existingMacro = game.macros.find(m => m.name === macroData.name && m.flags["brancalonia-bigat"]?.isSystemMacro);

    if (!existingMacro) {
      Macro.create(macroData).then(() => {
        console.log("Macro Gestione Menagramo creata!");
      });
    }
  }

  /**
   * Applica menagramo a un attore
   */
  async applyMenagramo(actor, level = "minor", reason = "Sfortuna") {
    const menagramoData = this.menagramoLevels[level];
    if (!menagramoData) {
      ui.notifications.error("Livello menagramo non valido!");
      return;
    }

    // Rimuovi menagramo esistente
    const existing = actor.effects.find(e => e.flags.brancalonia?.isMenagramo);
    if (existing) {
      await existing.delete();
    }

    // Calcola durata in round
    const durationRoll = await new Roll(menagramoData.duration).evaluate();
    const duration = durationRoll.total;

    // Crea active effect conforme a dnd5e
    const effectData = {
      name: menagramoData.name,
      img: menagramoData.img,
      origin: actor.uuid,
      duration: {
        rounds: duration,
        startRound: game.combat?.round,
        startTurn: game.combat?.turn
      },
      changes: menagramoData.effects,
      flags: {
        brancalonia: {
          isMenagramo: true,
          menagramoLevel: level,
          reason: reason
        },
        dnd5e: {
          type: "curse"
        }
      },
      statuses: ["menagramo"],
      description: menagramoData.description
    };

    const effect = await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);

    // Messaggio drammatico
    await ChatMessage.create({
      content: `
        <div class="brancalonia-menagramo">
          <h3>☠️ ${menagramoData.name}! ☠️</h3>
          <p><strong>${actor.name}</strong> è colpito dalla sfortuna!</p>
          <p><em>Motivo: ${reason}</em></p>
          <p>Durata: ${duration} round</p>
          <p class="description">${menagramoData.description}</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor }),
      flags: { brancalonia: { menagramo: true } }
    });

    // Se catastrofico, aggiungi effetto visivo
    if (level === "catastrophic") {
      this._addCatastrophicVisual(actor);
    }

    return effect[0];
  }

  /**
   * Rimuove il menagramo
   */
  async removeMenagramo(actor, method = null) {
    const effect = actor.effects.find(e => e.flags.brancalonia?.isMenagramo);
    if (!effect) {
      ui.notifications.info("Nessun menagramo da rimuovere");
      return;
    }

    if (method) {
      const removal = this.removalMethods[method];
      if (!removal) {
        ui.notifications.error("Metodo di rimozione non valido!");
        return;
      }

      // Applica costo o conseguenze
      if (removal.cost) {
        const cost = typeof removal.cost === "string"
          ? (await new Roll(removal.cost).evaluate()).total
          : removal.cost;

        const currentMoney = actor.system.currency?.du || 0;
        if (currentMoney < cost) {
          ui.notifications.error(`Servono ${cost} ducati per questo metodo!`);
          return;
        }

        await actor.update({
          "system.currency.du": currentMoney - cost
        });
      }

      if (removal.check) {
        const roll = await actor.rollAbilityTest(removal.check.ability);
        if (roll.total < removal.check.dc) {
          ui.notifications.warn("Tentativo fallito! Il menagramo persiste.");
          return;
        }
      }

      if (removal.infamyLoss && actor.flags.brancalonia?.infamia) {
        await actor.update({
          "flags.brancalonia.infamia": Math.max(0,
            actor.flags.brancalonia.infamia - removal.infamyLoss
          )
        });
      }
    }

    // Rimuovi effetto
    await effect.delete();

    ChatMessage.create({
      content: `
        <div class="brancalonia-menagramo-removed">
          <h3>✨ Menagramo Rimosso! ✨</h3>
          <p><strong>${actor.name}</strong> è finalmente libero dalla sfortuna!</p>
          ${method ? `<p>Metodo: ${this.removalMethods[method].name}</p>` : ''}
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  /**
   * Controlla se l'attore ha menagramo
   */
  _hasMenagramo(actor) {
    return actor?.effects.some(e => e.flags.brancalonia?.isMenagramo) || false;
  }

  /**
   * Applica effetti sfortuna ai tiri
   */
  _applyMisfortune(actor, config, rollType) {
    // Usa la funzione helper standard
    applyMenagramoToRoll(actor, config);

    const effect = actor.effects.find(e => e.flags.brancalonia?.isMenagramo);
    if (!effect) return;

    // Notifica sfortuna occasionale
    if (Math.random() < 0.3) {
      const messages = [
        "Il menagramo interferisce!",
        "La sfortuna colpisce!",
        "Qualcosa va storto...",
        "Il destino è contro di te!"
      ];
      ui.notifications.warn(messages[Math.floor(Math.random() * messages.length)]);
    }
  }

  /**
   * Attiva evento di sfortuna casuale
   */
  async _triggerMisfortuneEvent(actor) {
    const roll = await new Roll("1d20").evaluate();
    const event = this.misfortuneEvents.find(e =>
      roll.total >= e.range[0] && roll.total <= e.range[1]
    );

    if (!event) return;

    ChatMessage.create({
      content: `
        <div class="brancalonia-misfortune-event">
          <h3>⚡ Evento Sfortunato! ⚡</h3>
          <p><strong>${actor.name}:</strong> ${event.event}</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    // Applica effetto
    await this._applyMisfortuneEffect(actor, event.effect);
  }

  /**
   * Applica effetto specifico di sfortuna
   */
  async _applyMisfortuneEffect(actor, effectType) {
    switch (effectType) {
      case "prone":
        await actor.toggleStatusEffect("prone");
        break;

      case "disarm":
        // Rimuovi arma equipaggiata
        const weapon = actor.items.find(i =>
          i.type === "weapon" && i.system.equipped
        );
        if (weapon) {
          await weapon.update({ "system.equipped": false });
          ui.notifications.info(`${weapon.name} cade a terra!`);
        }
        break;

      case "friendlyFire":
        // Colpisci alleato casuale
        const allies = canvas.tokens.placeables.filter(t =>
          t.actor && t.actor.id !== actor.id &&
          t.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY
        );
        if (allies.length > 0) {
          const target = allies[Math.floor(Math.random() * allies.length)];
          const damage = await new Roll("1d4").evaluate();
          await target.actor.applyDamage(damage.total);
          ChatMessage.create({
            content: `${actor.name} colpisce ${target.name} per sbaglio! (${damage.total} danni)`
          });
        }
        break;

      case "skipTurn":
        // Salta turno (se in combattimento)
        if (game.combat) {
          const combatant = game.combat.combatants.find(c => c.actor?.id === actor.id);
          if (combatant) {
            await combatant.update({ defeated: true });
            setTimeout(() => combatant.update({ defeated: false }), 6000);
          }
        }
        break;

      case "breakItem":
        // Rompi oggetto casuale
        const items = actor.items.filter(i =>
          i.type === "equipment" || i.type === "weapon" || i.type === "armor"
        );
        if (items.length > 0) {
          const item = items[Math.floor(Math.random() * items.length)];
          await item.update({
            "flags.brancalonia.broken": true,
            name: `${item.name} (Rotto)`
          });
          ui.notifications.warn(`${item.name} si è rotto!`);
        }
        break;

      case "loseGold":
        // Perdi oro
        const goldLost = Math.floor(Math.random() * 20) + 1;
        const currentGold = actor.system.currency?.du || 0;
        await actor.update({
          "system.currency.du": Math.max(0, currentGold - goldLost)
        });
        ui.notifications.info(`Persi ${goldLost} ducati!`);
        break;

      case "selfDamage":
        // Danno a se stesso
        const selfDamage = await new Roll("1d6").evaluate();
        await actor.applyDamage(selfDamage.total);
        break;

      case "curse":
        // Applica maledizione temporanea
        await actor.createEmbeddedDocuments("ActiveEffect", [{
          name: "Maledizione Temporanea",
          icon: "icons/magic/death/hand-undead-skeleton-fire-green.webp",
          duration: { rounds: 3 },
          changes: [{
            key: "system.attributes.ac.bonus",
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: -2
          }]
        }]);
        break;

      case "disaster":
        // Disastro totale!
        await this.applyMenagramo(actor, "catastrophic", "Disastro totale!");
        break;
    }
  }

  /**
   * Sfortuna critica su 1 naturale
   */
  async _criticalMisfortune(actor) {
    const roll = await new Roll("1d6").evaluate();

    const criticalEffects = [
      "L'arma si rompe!",
      "Colpisci te stesso!",
      "Cadi prono e perdi l'arma!",
      "Provochi un attacco di opportunità!",
      "Il menagramo peggiora!",
      "Attiri una maledizione!"
    ];

    const effect = criticalEffects[roll.total - 1];

    ChatMessage.create({
      content: `
        <div class="brancalonia-critical-misfortune">
          <h3>💀 SFORTUNA CRITICA! 💀</h3>
          <p><strong>${actor.name}:</strong> ${effect}</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor }),
      flags: { brancalonia: { criticalMisfortune: true } }
    });

    // Applica effetto basato sul risultato
    switch (roll.total) {
      case 1: // Arma rotta
        const weapon = actor.items.find(i => i.type === "weapon" && i.system.equipped);
        if (weapon) {
          await weapon.update({
            "flags.brancalonia.broken": true,
            name: `${weapon.name} (Rotta)`
          });
        }
        break;
      case 2: // Danno a se stesso
        const damage = await new Roll("1d6").evaluate();
        await actor.applyDamage(damage.total);
        break;
      case 3: // Prono + disarmato
        await actor.toggleStatusEffect("prone");
        const equippedWeapon = actor.items.find(i => i.type === "weapon" && i.system.equipped);
        if (equippedWeapon) {
          await equippedWeapon.update({ "system.equipped": false });
        }
        break;
      case 5: // Peggiora menagramo
        const currentLevel = actor.effects.find(e => e.flags.brancalonia?.isMenagramo)
          ?.flags.brancalonia.menagramoLevel;
        const levels = ["minor", "moderate", "major", "catastrophic"];
        const nextLevel = levels[Math.min(levels.indexOf(currentLevel) + 1, 3)];
        await this.applyMenagramo(actor, nextLevel, "Peggioramento critico!");
        break;
      case 6: // Maledizione
        await this.applyMenagramo(actor, "moderate", "Maledizione critica!");
        break;
    }
  }

  /**
   * Aggiunge effetto visivo per menagramo catastrofico
   */
  _addCatastrophicVisual(actor) {
    const token = actor.getActiveTokens()[0];
    if (!token) return;

    // Aggiunge aura oscura al token
    token.document.update({
      light: {
        dim: 5,
        bright: 0,
        color: "#800080",
        animation: {
          type: "pulse",
          speed: 2,
          intensity: 3
        }
      }
    });
  }


  /**
   * Mostra dialog per applicare menagramo
   */
  showMenagramoDialog(actor) {
    const content = `
      <form>
        <div class="form-group">
          <label>Livello Menagramo:</label>
          <select id="menagramo-level">
            <option value="minor">Minore (1d4 round)</option>
            <option value="moderate">Moderato (2d4 round)</option>
            <option value="major">Maggiore (3d4 round)</option>
            <option value="catastrophic">Catastrofico (1d6+1 round)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Motivo:</label>
          <input type="text" id="menagramo-reason" placeholder="Causa della sfortuna..." />
        </div>
      </form>
    `;

    new Dialog({
      title: `Applica Menagramo - ${actor.name}`,
      content: content,
      buttons: {
        apply: {
          label: "Applica",
          callback: html => {
            const level = html.find('#menagramo-level').val();
            const reason = html.find('#menagramo-reason').val() || "Sfortuna";
            this.applyMenagramo(actor, level, reason);
          }
        },
        cancel: {
          label: "Annulla"
        }
      },
      default: "apply"
    }).render(true);
  }

  /**
   * Mostra dialog per rimuovere menagramo
   */
  showRemovalDialog(actor) {
    const content = `
      <form>
        <div class="form-group">
          <label>Metodo di Rimozione:</label>
          <select id="removal-method">
            <option value="">Rimozione Gratuita (GM)</option>
            ${Object.entries(this.removalMethods).map(([key, method]) => `
              <option value="${key}">${method.name}</option>
            `).join('')}
          </select>
        </div>
        <div id="method-details"></div>
      </form>
    `;

    const dialog = new Dialog({
      title: `Rimuovi Menagramo - ${actor.name}`,
      content: content,
      buttons: {
        remove: {
          label: "Rimuovi",
          callback: html => {
            const method = html.find('#removal-method').val() || null;
            this.removeMenagramo(actor, method);
          }
        },
        cancel: {
          label: "Annulla"
        }
      },
      default: "remove",
      render: html => {
        html.find('#removal-method').change(ev => {
          const method = ev.target.value;
          if (method && this.removalMethods[method]) {
            const details = this.removalMethods[method];
            html.find('#method-details').html(`
              <div class="form-group">
                <p><strong>Descrizione:</strong> ${details.description}</p>
                ${details.cost ? `<p><strong>Costo:</strong> ${details.cost} ducati</p>` : ''}
                ${details.check ? `<p><strong>Prova:</strong> ${CONFIG.DND5E.abilities[details.check.ability].label} CD ${details.check.dc}</p>` : ''}
                ${details.infamyLoss ? `<p><strong>Perdita Infamia:</strong> -${details.infamyLoss}</p>` : ''}
              </div>
            `);
          } else {
            html.find('#method-details').empty();
          }
        });
      }
    });

    dialog.render(true);
  }
}

/**
 * Funzione helper per applicare modificatori menagramo usando API standard
 */
function applyMenagramoToRoll(actor, config) {
  if (!actor?.effects.some(e => e.flags.brancalonia?.isMenagramo)) return;

  const effect = actor.effects.find(e => e.flags.brancalonia?.isMenagramo);
  const level = effect?.flags.brancalonia.menagramoLevel;

  // Usa il sistema di modificatori standard di dnd5e
  config.parts = config.parts || [];

  // Aggiungi penalità basata sul livello di menagramo
  if (level === "minor") {
    // Solo svantaggio (già gestito da Active Effects)
  } else if (level === "moderate") {
    config.parts.push("-1d4[Menagramo]");
  } else if (level === "major") {
    config.parts.push("-1d6[Menagramo]");
  } else if (level === "catastrophic") {
    config.parts.push("-2d4[Menagramo]");
  }

  // Aggiungi flavor text
  config.flavor = (config.flavor || "") + " (Menagramo)";

  // 10% di probabilità di fallimento critico
  if (Math.random() < 0.1 && (level === "major" || level === "catastrophic")) {
    config.critical = 1; // Forza threshold critico a 1
    ui.notifications.warn("Il Menagramo colpisce pesantemente!");
  }
}

