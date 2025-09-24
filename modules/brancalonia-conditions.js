/**
 * Brancalonia - Sistema Condizioni Custom
 * Gestisce le condizioni speciali di Brancalonia con i loro effetti
 */

class BrancaloniaConditions {

  /**
   * Inizializza il sistema delle condizioni custom
   */
  static init() {
    console.log("Brancalonia | Inizializzazione sistema condizioni custom...");

    // Hook per applicare gli effetti quando vengono aggiunte le condizioni
    Hooks.on("createActiveEffect", this.onCreateEffect.bind(this));
    Hooks.on("deleteActiveEffect", this.onDeleteEffect.bind(this));
  }

  /**
   * Gestisce la creazione di un nuovo effetto
   */
  static async onCreateEffect(effect, options, userId) {
    if (game.user.id !== userId) return;

    // Controlla se è una delle nostre condizioni custom
    const statusId = effect.statuses?.first();
    if (!statusId) return;

    switch(statusId) {
      case "batosta":
        await this.applyBatostaEffect(effect);
        break;
      case "menagramo":
        await this.applyMenagramoEffect(effect);
        break;
      case "ubriaco":
        await this.applyUbriacoEffect(effect);
        break;
    }
  }

  /**
   * Gestisce la rimozione di un effetto
   */
  static async onDeleteEffect(effect, options, userId) {
    if (game.user.id !== userId) return;

    const statusId = effect.statuses?.first();
    if (!statusId) return;

    // Cleanup specifico per condizione se necessario
    const actor = effect.parent;
    if (!actor) return;

    switch(statusId) {
      case "batosta":
        await this.removeBatostaEffect(actor);
        break;
    }
  }

  /**
   * Applica l'effetto Batosta
   * Le batoste sono ferite temporanee nelle risse da taverna
   */
  static async applyBatostaEffect(effect) {
    const actor = effect.parent;
    if (!actor) return;

    // Incrementa il contatore delle batoste
    const batoste = actor.getFlag("brancalonia-bigat", "batoste") || 0;
    await actor.setFlag("brancalonia-bigat", "batoste", batoste + 1);

    // Notifica
    ui.notifications.info(`${actor.name} ha subito una batosta! (Totale: ${batoste + 1})`);

    // Se raggiunge 3 batoste, è KO
    if (batoste + 1 >= 3) {
      ChatMessage.create({
        content: `<div class="brancalonia-rissa">
          <h3>KO!</h3>
          <p><strong>${actor.name}</strong> è stato messo KO dopo 3 batoste!</p>
        </div>`,
        speaker: ChatMessage.getSpeaker({actor: actor})
      });
    }
  }

  /**
   * Rimuove l'effetto Batosta
   */
  static async removeBatostaEffect(actor) {
    // Resetta il contatore delle batoste
    await actor.unsetFlag("brancalonia-bigat", "batoste");
    ui.notifications.info(`${actor.name} si è ripreso dalle batoste!`);
  }


  /**
   * Applica l'effetto Menagramo (già gestito altrove ma aggiungiamo info)
   */
  static async applyMenagramoEffect(effect) {
    const actor = effect.parent;
    if (!actor) return;

    ChatMessage.create({
      content: `<div class="brancalonia-condition">
        <h3>Menagramo!</h3>
        <p><strong>${actor.name}</strong> è colpito dal menagramo!</p>
        <ul>
          <li>Svantaggio a tutti i tiri</li>
          <li>-2 alla CA</li>
          <li>Durata: ${effect.duration?.rounds || "Fino a rimozione"} round</li>
        </ul>
      </div>`,
      speaker: ChatMessage.getSpeaker({actor: actor})
    });
  }

  /**
   * Applica l'effetto Ubriaco
   */
  static async applyUbriacoEffect(effect) {
    const actor = effect.parent;
    if (!actor) return;

    // Aggiungi i changes per l'effetto ubriaco
    const changes = [
      {
        key: "system.abilities.dex.value",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: "-2"
      },
      {
        key: "system.abilities.cha.value",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: "+2"
      },
      {
        key: "system.abilities.wis.value",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: "-2"
      }
    ];

    await effect.update({changes: changes});

    ChatMessage.create({
      content: `<div class="brancalonia-condition">
        <h3>Ubriaco!</h3>
        <p><strong>${actor.name}</strong> è ubriaco!</p>
        <ul>
          <li>-2 a Destrezza e Saggezza</li>
          <li>+2 a Carisma</li>
          <li>Svantaggio alle prove di Percezione</li>
          <li>Vantaggio ai TS contro paura</li>
        </ul>
      </div>`,
      speaker: ChatMessage.getSpeaker({actor: actor})
    });
  }

  /**
   * Crea un effetto Batosta temporaneo
   */
  static async createBatostaEffect(actor, rounds = 10) {
    const effectData = {
      name: "Batosta",
      img: "modules/brancalonia-bigat/assets/icons/batosta.svg",
      origin: actor.uuid,
      disabled: false,
      duration: {
        rounds: rounds
      },
      statuses: ["batosta"],
      flags: {
        "brancalonia-bigat": {
          type: "batosta"
        }
      }
    };

    await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
  }

}

// Inizializza quando il gioco è pronto
Hooks.once("ready", () => {
  BrancaloniaConditions.init();
});

// Esporta per uso globale
window.BrancaloniaConditions = BrancaloniaConditions;