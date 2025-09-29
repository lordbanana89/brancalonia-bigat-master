export class BrancaloniaRestSystem {
  constructor() {
    this.name = "Sistema di Riposo della Canaglia";
    this.description = "Sistema di riposo modificato per Brancalonia";

    // Durate dei riposi in Brancalonia
    this.restDurations = {
      shortRest: "8 ore",
      longRest: "7 giorni (una settimana)"
    };
  }

  /**
   * Override del sistema di riposo standard
   */
  async initializeRestSystem() {
    // Hook per intercettare i riposi
    Hooks.on("dnd5e.restStarted", async (actor, config) => {
      // Modifica la configurazione del riposo
      if (game.settings.get("brancalonia", "useCanagliasRest")) {
        await this.handleBrancaloniaRest(actor, config);
      }
    });

    // Hook per completare il riposo
    Hooks.on("dnd5e.restCompleted", async (actor, config) => {
      if (game.settings.get("brancalonia", "useCanagliasRest")) {
        await this.applyBrancaloniaRestEffects(actor, config);
      }
    });
  }

  /**
   * Gestisce l'inizio del riposo in stile Brancalonia
   */
  async handleBrancaloniaRest(actor, config) {
    const restType = config.restType;

    if (restType === "short") {
      // Riposo breve = 8 ore
      ui.notifications.info(`${actor.name} inizia un riposo breve di 8 ore`);

      // Verifica se è in un luogo sicuro
      const isSafe = await this.checkSafeLocation(actor);
      if (!isSafe) {
        ui.notifications.warn("Riposo in luogo non sicuro - possibili interruzioni!");
        config.interrupted = Math.random() < 0.3; // 30% chance di interruzione
      }
    } else if (restType === "long") {
      // Riposo lungo = 7 giorni
      const dialog = await this.showLongRestDialog(actor);
      if (!dialog) {
        config.aborted = true;
        return;
      }

      ui.notifications.info(`${actor.name} inizia un riposo lungo di una settimana`);

      // Durante lo Sbraco, può scegliere tra diverse opzioni
      config.sbracoOption = dialog.option;
    }
  }

  /**
   * Mostra il dialog per il riposo lungo (Sbraco)
   */
  async showLongRestDialog(actor) {
    return new Promise((resolve) => {
      const content = `
        <div class="brancalonia-rest">
          <h2>Riposo della Canaglia - Sbraco</h2>
          <p>Una settimana di riposo tra un lavoretto e l'altro.</p>
          <p>Come vuoi trascorrere questa settimana di Sbraco?</p>

          <div class="form-group">
            <label>
              <input type="radio" name="sbraco" value="riposo" checked>
              <strong>Riposare le stanche membra</strong><br>
              <i>Ottieni tutti gli effetti di un riposo lungo normale</i>
            </label>
          </div>

          <div class="form-group">
            <label>
              <input type="radio" name="sbraco" value="imbosco">
              <strong>Imboscarsi</strong><br>
              <i>Tieni un basso profilo, -3 ai Rischi del Mestiere</i>
            </label>
          </div>

          <div class="form-group">
            <label>
              <input type="radio" name="sbraco" value="bagordi">
              <strong>Darsi ai Bagordi</strong><br>
              <i>Dilapida denaro in bagordi (tira sulla tabella)</i>
            </label>
          </div>
        </div>
      `;

      new Dialog({
        title: "Riposo della Canaglia",
        content: content,
        buttons: {
          confirm: {
            icon: '<i class="fas fa-check"></i>',
            label: "Conferma",
            callback: (html) => {
              const option = html.find('input[name="sbraco"]:checked').val();
              resolve({option: option});
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Annulla",
            callback: () => resolve(null)
          }
        },
        default: "confirm"
      }).render(true);
    });
  }

  /**
   * Applica gli effetti del riposo in stile Brancalonia
   */
  async applyBrancaloniaRestEffects(actor, config) {
    const restType = config.restType;

    if (restType === "short") {
      // Riposo breve di 8 ore
      ui.notifications.info(`${actor.name} ha completato un riposo breve di 8 ore`);

      // Recupero standard dei Dadi Vita
      // Ma con 8 ore di riposo, recupera un po' di più
      const bonusHD = Math.floor(actor.system.details.level / 4);
      if (bonusHD > 0) {
        ui.notifications.info(`Riposo prolungato: recuperi ${bonusHD} Dadi Vita aggiuntivi`);
      }

    } else if (restType === "long" && config.sbracoOption) {
      // Gestisce le diverse opzioni di Sbraco
      switch(config.sbracoOption) {
        case "riposo":
          await this.handleRestOption(actor);
          break;
        case "imbosco":
          await this.handleImboscoOption(actor);
          break;
        case "bagordi":
          await this.handleBagordiOption(actor);
          break;
      }
    }
  }

  /**
   * Opzione: Riposare le stanche membra
   */
  async handleRestOption(actor) {
    ui.notifications.info(`${actor.name} ha riposato per una settimana intera`);

    // Recupero completo
    const updates = {
      "system.attributes.hp.value": actor.system.attributes.hp.max
    };

    // Recupera tutti i Dadi Vita
    const hdRecovered = Math.ceil(actor.system.details.level / 2);

    // Rimuove tutti i livelli di indebolimento
    if (actor.system.attributes.exhaustion) {
      updates["system.attributes.exhaustion"] = 0;
      ui.notifications.info("Tutti i livelli di indebolimento rimossi");
    }

    await actor.update(updates);

    // Recupera slot incantesimi se applicabile
    if (actor.system.spells) {
      await this.recoverSpellSlots(actor);
    }
  }

  /**
   * Opzione: Imboscarsi
   */
  async handleImboscoOption(actor) {
    ui.notifications.info(`${actor.name} si è imboscato per una settimana`);

    // Applica il modificatore ai Rischi del Mestiere
    await actor.setFlag("brancalonia-bigat", "imboscoModifier", -3);

    // Recupero parziale (metà del normale)
    const updates = {
      "system.attributes.hp.value": Math.min(
        actor.system.attributes.hp.value + Math.floor(actor.system.attributes.hp.max / 2),
        actor.system.attributes.hp.max
      )
    };

    // Rimuove 1 livello di indebolimento
    if (actor.system.attributes.exhaustion > 0) {
      updates["system.attributes.exhaustion"] = actor.system.attributes.exhaustion - 1;
    }

    await actor.update(updates);

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({actor: actor}),
      content: `<div class="brancalonia-imbosco">
        <h3>Imboscato!</h3>
        <p>${actor.name} ha tenuto un basso profilo per una settimana.</p>
        <p><strong>Effetto:</strong> -3 al prossimo tiro Rischi del Mestiere del gruppo</p>
      </div>`
    });
  }

  /**
   * Opzione: Darsi ai Bagordi
   */
  async handleBagordiOption(actor) {
    // Integrazione con il sistema bagordi
    if (game.brancalonia?.bagordi) {
      await game.brancalonia.bagordi.showBagordiDialog(actor);
    } else {
      ui.notifications.warn("Sistema Bagordi non trovato!");
      await this.handleRestOption(actor); // Fallback al riposo normale
    }
  }

  /**
   * Verifica se il personaggio è in un luogo sicuro
   */
  async checkSafeLocation(actor) {
    // Verifica se è nel Covo o in una Bettola amica
    const location = actor.getFlag("brancalonia-bigat", "currentLocation");

    if (location === "covo" || location === "bettola_amica") {
      return true;
    }

    // Altrimenti chiedi al GM
    if (game.user.isGM) {
      return await this.askGMSafeLocation(actor);
    }

    return false;
  }

  /**
   * Chiede al GM se il luogo è sicuro
   */
  async askGMSafeLocation(actor) {
    return new Promise((resolve) => {
      new Dialog({
        title: "Luogo Sicuro?",
        content: `<p>${actor.name} sta riposando. Il luogo è sicuro?</p>`,
        buttons: {
          yes: {
            icon: '<i class="fas fa-check"></i>',
            label: "Sì",
            callback: () => resolve(true)
          },
          no: {
            icon: '<i class="fas fa-times"></i>',
            label: "No",
            callback: () => resolve(false)
          }
        },
        default: "yes"
      }).render(true);
    });
  }

  /**
   * Recupera gli slot incantesimi
   */
  async recoverSpellSlots(actor) {
    const spells = actor.system.spells;
    const updates = {};

    for (let [level, slot] of Object.entries(spells)) {
      if (slot.value !== undefined && slot.max > 0) {
        updates[`system.spells.${level}.value`] = slot.max;
      }
    }

    if (Object.keys(updates).length > 0) {
      await actor.update(updates);
      ui.notifications.info("Slot incantesimi recuperati");
    }
  }

  /**
   * Calcola il tempo di viaggio per il riposo
   */
  calculateTravelTime(distance, travelMethod = "piedi") {
    const speeds = {
      piedi: 24,      // 24 km al giorno a piedi
      cavallo: 48,    // 48 km al giorno a cavallo
      carro: 32,      // 32 km al giorno in carro
      nave: 96        // 96 km al giorno via mare
    };

    const kmPerDay = speeds[travelMethod] || speeds.piedi;
    const days = Math.ceil(distance / kmPerDay);

    return {
      days: days,
      weeksNeeded: Math.ceil(days / 7),
      canRest: days >= 7
    };
  }
}

// Registra le impostazioni
Hooks.once("init", () => {
  game.settings.register("brancalonia", "useCanagliasRest", {
    name: "Usa Riposo della Canaglia",
    hint: "Attiva il sistema di riposo di Brancalonia (8 ore breve, 7 giorni lungo)",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register("brancalonia", "enforceRestLocation", {
    name: "Richiedi Luogo Sicuro",
    hint: "I riposi lunghi possono essere fatti solo in luoghi sicuri (Covo, Bettole)",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
});

// Inizializza il sistema
Hooks.once("ready", () => {
  game.brancalonia = game.brancalonia || {};
  game.brancalonia.restSystem = new BrancaloniaRestSystem();
  game.brancalonia.restSystem.initializeRestSystem();

  console.log("Sistema di Riposo della Canaglia di Brancalonia inizializzato");
});