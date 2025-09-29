/**
 * BRANCALONIA TAVERN ENTERTAINMENT - CONSOLIDATED MODULE
 * Unisce tutti i sistemi di intrattenimento delle taverne:
 * - Giochi da Taverna (Minchiate, Botte alla Botte, etc.)
 * - Sistema Bagordi (spesa oro e conseguenze)
 * - Mini-giochi competitivi
 *
 * Basato sul manuale ufficiale pagine 57-60
 */

class TavernEntertainment {
  static ID = 'brancalonia-bigat';

  /**
   * Inizializza il modulo
   */
  static initialize() {
    console.log("🍺 Brancalonia | Inizializzazione Tavern Entertainment Consolidato");

    // Registra hooks
    Hooks.once("ready", () => {
      this.registerCommands();
      this.registerSettings();
    });

    // Hook per i giochi nelle scene di taverna
    Hooks.on("canvasReady", () => {
      if (canvas.scene?.getFlag(this.ID, "isTavern")) {
        this.showTavernNotification();
      }
    });
  }

  /**
   * Registra i comandi chat
   */
  static registerCommands() {
    Hooks.on("chatMessage", (html, content, msg) => {
      const actor = game.user.character;
      if (!actor) return true;

      // Comando /bagordi - Sistema spesa oro
      if (content.startsWith("/bagordi")) {
        this.showBagordiDialog(actor);
        return false;
      }

      // Comando /giocotaverna - Giochi specifici
      if (content.startsWith("/giocotaverna")) {
        this.showGameSelectionDialog(actor);
        return false;
      }

      return true;
    });
  }

  /* ================================================
     SISTEMA BAGORDI (da bagordi.js)
     ================================================ */

  static bagordiResults = [
    { roll: 1, title: "Arrestato!", description: "Finisci in gattabuia per 1d6 giorni", severe: true },
    { roll: 2, title: "Derubato", description: "Perdi tutto l'oro che avevi con te", severe: true },
    { roll: 3, title: "Rissa Epica", description: "Ti ritrovi con 1d4 livelli di indebolimento", severe: true },
    { roll: 4, title: "Debiti di Gioco", description: "Devi altri 2d10 mo a creditori locali" },
    { roll: 5, title: "Tatuaggio Imbarazzante", description: "Ti sei fatto tatuare qualcosa di osceno" },
    { roll: 6, title: "Mal di Testa Bestiale", description: "Svantaggio ai tiri salvezza su Costituzione per 24 ore" },
    { roll: 7, title: "Nuovo Nemico", description: "Ti sei fatto un nemico potente durante i bagordi" },
    { roll: 8, title: "Sbornia Colossale", description: "Non ricordi nulla, ma tutti ti guardano male" },
    { roll: 9, title: "Notte Folle", description: "Ti risvegli in un posto casuale senza equipaggiamento" },
    { roll: 10, title: "Amore Fugace", description: "Ti sei innamorato perdutamente, ma è già finita" },
    { roll: 11, title: "Notte Normale", description: "Una serata piacevole senza conseguenze" },
    { roll: 12, title: "Fortuna al Gioco", description: "Recuperi metà dell'oro speso", positive: true },
    { roll: 13, title: "Nuovi Contatti", description: "Conosci qualcuno di utile", positive: true },
    { roll: 14, title: "Informazioni Preziose", description: "Scopri un segreto o una diceria importante", positive: true },
    { roll: 15, title: "Favore Guadagnato", description: "Un PNG importante ti deve un favore", positive: true },
    { roll: 16, title: "Piccola Vincita", description: "Guadagni 1d6 mo extra", positive: true },
    { roll: 17, title: "Oggetto Trovato", description: "Trovi un oggetto minore utile", positive: true },
    { roll: 18, title: "Reputazione Migliorata", description: "La tua fama cresce in città", positive: true },
    { roll: 19, title: "Alleato Inaspettato", description: "Fai amicizia con qualcuno di influente", positive: true },
    { roll: 20, title: "Jackpot!", description: "Vinci al gioco e raddoppi l'oro speso!", positive: true }
  ];

  static async showBagordiDialog(actor) {
    const content = `
      <form class="brancalonia-dialog">
        <h3>🍺 Darsi ai Bagordi</h3>
        <div class="form-group">
          <label>Luogo dei Bagordi</label>
          <select name="location" id="location">
            <option value="villaggio">Villaggio (5-10 mo)</option>
            <option value="cittadina" selected>Cittadina (10-20 mo)</option>
            <option value="città">Città Maggiore (20-50 mo)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Oro da Dilapidare (mo)</label>
          <input type="number" name="gold" id="gold" value="15" min="5" max="50">
        </div>
        <p class="notes"><i>Una settimana di Sbraco spesa in bagordi! Tira 1d20 per le conseguenze.</i></p>
      </form>
    `;

    new Dialog({
      title: "Bagordi e Divertimenti",
      content: content,
      buttons: {
        bagordi: {
          icon: '<i class="fas fa-wine-bottle"></i>',
          label: "Ai Bagordi!",
          callback: async (html) => {
            const gold = parseInt(html.find("#gold").val());

            if (actor.system.currency.gp < gold) {
              ui.notifications.error("Non hai abbastanza oro!");
              return;
            }

            await actor.update({"system.currency.gp": actor.system.currency.gp - gold});
            await this.rollBagordiResult(actor, gold);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Annulla"
        }
      },
      default: "bagordi"
    }).render(true);
  }

  static async rollBagordiResult(actor, goldSpent) {
    const roll = await new Roll("1d20").evaluate();
    await roll.toMessage();

    const result = this.bagordiResults.find(r => r.roll === roll.total);

    let messageContent = `
      <div class="brancalonia-message bagordi-result">
        <h3>${result.title}</h3>
        <p>${result.description}</p>
        <p class="gold-spent">Oro speso: ${goldSpent} mo</p>
      </div>
    `;

    // Applica effetti speciali
    if (result.roll === 12) {
      const refund = Math.floor(goldSpent / 2);
      await actor.update({"system.currency.gp": actor.system.currency.gp + refund});
      ui.notifications.info(`Recuperi ${refund} mo!`);
    } else if (result.roll === 20) {
      await actor.update({"system.currency.gp": actor.system.currency.gp + (goldSpent * 2)});
      ui.notifications.info(`Vinci ${goldSpent * 2} mo!`);
    }

    ChatMessage.create({
      content: messageContent,
      speaker: ChatMessage.getSpeaker({actor: actor})
    });
  }

  /* ================================================
     GIOCHI DA TAVERNA (da tavern-games.js)
     Manuale pagine 57-60
     ================================================ */

  static tavernGames = {
    minchiate: {
      name: "Minchiate",
      description: "Gioco di carte tradizionale",
      skill: "deception",
      dc: 15,
      stakes: { min: 5, max: 50 }
    },
    botteAllaBotte: {
      name: "Botte alla Botte",
      description: "Spaccare botti con la testa",
      skill: "constitution",
      dc: 12,
      rounds: 3,
      damage: "1d4"
    },
    garaDiMangiate: {
      name: "Gara di Mangiate",
      description: "Chi mangia di più vince",
      skill: "constitution",
      dc: 10,
      rounds: 5,
      dcIncrease: 2
    },
    giostraDeiPoveri: {
      name: "Giostra dei Poveri",
      description: "Giostra improvvisata con animali",
      skills: ["animal-handling", "athletics"],
      dc: 14,
      rounds: 3
    }
  };

  static async showGameSelectionDialog(actor) {
    const gameOptions = Object.entries(this.tavernGames)
      .map(([key, game]) => `<option value="${key}">${game.name} - ${game.description}</option>`)
      .join("");

    const content = `
      <form class="brancalonia-dialog">
        <h3>🎲 Scegli un Gioco da Taverna</h3>
        <div class="form-group">
          <label>Gioco</label>
          <select name="game" id="game-select">
            ${gameOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Posta in Gioco (mo)</label>
          <input type="number" name="stake" id="stake" value="10" min="5" max="100">
        </div>
        <div class="form-group">
          <label>Avversario</label>
          <select name="opponent" id="opponent">
            <option value="easy">Principiante (CD -2)</option>
            <option value="medium" selected>Esperto (CD normale)</option>
            <option value="hard">Maestro (CD +2)</option>
            <option value="legendary">Leggendario (CD +5)</option>
          </select>
        </div>
      </form>
    `;

    new Dialog({
      title: "Giochi da Taverna",
      content: content,
      buttons: {
        play: {
          icon: '<i class="fas fa-dice"></i>',
          label: "Gioca!",
          callback: async (html) => {
            const gameKey = html.find("#game-select").val();
            const stake = parseInt(html.find("#stake").val());
            const difficulty = html.find("#opponent").val();

            await this.playTavernGame(actor, gameKey, stake, difficulty);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Annulla"
        }
      },
      default: "play"
    }).render(true);
  }

  static async playTavernGame(actor, gameKey, stake, difficulty) {
    const game = this.tavernGames[gameKey];
    if (!game) return;

    // Modifica CD basata sulla difficoltà
    const difficultyMod = {
      easy: -2,
      medium: 0,
      hard: 2,
      legendary: 5
    };

    const baseDC = game.dc + difficultyMod[difficulty];

    let messageContent = `
      <div class="brancalonia-message tavern-game">
        <h3>🎯 ${game.name}</h3>
        <p>${game.description}</p>
        <p><strong>Posta:</strong> ${stake} mo | <strong>CD Base:</strong> ${baseDC}</p>
        <hr>
    `;

    let success = true;
    let totalSuccesses = 0;
    let totalFailures = 0;

    // Giochi a round multipli
    if (game.rounds) {
      let currentDC = baseDC;

      for (let round = 1; round <= game.rounds; round++) {
        messageContent += `<p><strong>Round ${round}:</strong> `;

        // Determina quale abilità usare
        const skill = Array.isArray(game.skills) ?
          game.skills[Math.floor(Math.random() * game.skills.length)] :
          game.skill || "constitution";

        // Tira il dado
        const rollFormula = skill === "constitution" ?
          `1d20 + @abilities.con.mod` :
          `1d20 + @skills.${skill}.total`;

        const roll = await new Roll(rollFormula, actor.getRollData()).evaluate();

        if (roll.total >= currentDC) {
          messageContent += `✅ Successo! (${roll.total} vs CD ${currentDC})`;
          totalSuccesses++;
        } else {
          messageContent += `❌ Fallimento! (${roll.total} vs CD ${currentDC})`;
          totalFailures++;

          // Danni per alcuni giochi
          if (game.damage) {
            const damageRoll = await new Roll(game.damage).evaluate();
            messageContent += ` - ${damageRoll.total} danni!`;
            await actor.applyDamage(damageRoll.total);
          }
        }

        messageContent += `</p>`;

        // Aumenta difficoltà per alcuni giochi
        if (game.dcIncrease) {
          currentDC += game.dcIncrease;
        }
      }

      success = totalSuccesses > totalFailures;

    } else {
      // Gioco a round singolo
      const skill = game.skill || "deception";
      const rollFormula = `1d20 + @skills.${skill}.total`;
      const roll = await new Roll(rollFormula, actor.getRollData()).evaluate();

      success = roll.total >= baseDC;
      messageContent += `<p>Risultato: ${roll.total} vs CD ${baseDC}</p>`;
    }

    // Risultato finale
    messageContent += `<hr><h4>`;

    if (success) {
      messageContent += `🏆 Vittoria! Vinci ${stake * 2} mo!</h4>`;
      await actor.update({"system.currency.gp": actor.system.currency.gp + stake});
      ui.notifications.info(`${actor.name} vince ${stake} mo!`);
    } else {
      messageContent += `💀 Sconfitta! Perdi ${stake} mo!</h4>`;
      await actor.update({"system.currency.gp": actor.system.currency.gp - stake});
      ui.notifications.warn(`${actor.name} perde ${stake} mo!`);
    }

    messageContent += `</div>`;

    ChatMessage.create({
      content: messageContent,
      speaker: ChatMessage.getSpeaker({actor: actor})
    });
  }

  /* ================================================
     MINI-GIOCHI COMPETITIVI
     ================================================ */

  static competitiveGames = {
    armWrestling: {
      name: "Braccio di Ferro",
      skill: "athletics",
      opposed: true,
      rounds: 3,
      description: "Sfida di forza pura"
    },
    drinkingContest: {
      name: "Gara di Bevute",
      skill: "constitution",
      save: true,
      dcStart: 10,
      dcIncrease: 2,
      maxRounds: 10,
      description: "Chi regge più alcol?"
    },
    knifeThrow: {
      name: "Lancio dei Coltelli",
      attack: "dex",
      ac: 15,
      bestOf: 5,
      description: "Precisione mortale"
    },
    liarsDice: {
      name: "Dadi del Bugiardo",
      skill: "deception",
      insight: true,
      rounds: 5,
      description: "Bluff e inganni"
    }
  };

  /**
   * Registra le impostazioni del modulo
   */
  static registerSettings() {
    game.settings.register(this.ID, "tavernGamesEnabled", {
      name: "Abilita Giochi da Taverna",
      hint: "Permette l'uso dei giochi da taverna nei luoghi appropriati",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(this.ID, "bagordiEnabled", {
      name: "Abilita Sistema Bagordi",
      hint: "Permette di spendere oro in bagordi con conseguenze casuali",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(this.ID, "autoApplyDamage", {
      name: "Applica Danni Automaticamente",
      hint: "Applica automaticamente i danni dai giochi pericolosi",
      scope: "world",
      config: true,
      type: Boolean,
      default: false
    });
  }

  /**
   * Mostra notifica quando si entra in una taverna
   */
  static showTavernNotification() {
    const message = `
      <div class="brancalonia-notification">
        <h3>🍺 Benvenuto alla Taverna!</h3>
        <p>Puoi usare i seguenti comandi:</p>
        <ul>
          <li><code>/bagordi</code> - Spendi oro in festeggiamenti</li>
          <li><code>/giocotaverna</code> - Partecipa ai giochi</li>
        </ul>
      </div>
    `;

    ChatMessage.create({
      content: message,
      whisper: [game.user.id]
    });
  }

  /**
   * Crea macro per accesso rapido
   */
  static async createMacros() {
    const bagordiMacro = {
      name: "Bagordi",
      type: "script",
      img: "icons/consumables/drinks/alcohol-beer-stein-wooden-metal-brown.webp",
      command: `TavernEntertainment.showBagordiDialog(token.actor);`,
      folder: null,
      sort: 0,
      permission: {default: 0},
      flags: {"brancalonia-bigat": {type: "bagordi"}}
    };

    const gamesMacro = {
      name: "Giochi da Taverna",
      type: "script",
      img: "icons/sundries/gaming/dice-pair-white.webp",
      command: `TavernEntertainment.showGameSelectionDialog(token.actor);`,
      folder: null,
      sort: 0,
      permission: {default: 0},
      flags: {"brancalonia-bigat": {type: "tavernGames"}}
    };

    await Macro.create(bagordiMacro);
    await Macro.create(gamesMacro);

    ui.notifications.info("Macro per Intrattenimento Taverna create!");
  }
}

// Inizializza quando Foundry è pronto
Hooks.once("init", () => {
  TavernEntertainment.initialize();

  // Rendi disponibile globalmente
  game.brancalonia = game.brancalonia || {};
  game.brancalonia.tavernEntertainment = TavernEntertainment;
});

// Esporta per compatibilità
window.TavernEntertainment = TavernEntertainment;