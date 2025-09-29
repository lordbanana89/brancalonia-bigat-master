/**
 * Brancalonia - Sistema Condizioni Custom
 * Gestisce le condizioni speciali di Brancalonia con i loro effetti
 */

class BrancaloniaConditions {
  static initialize() {
    try {
      console.log("🎭 Brancalonia | Inizializzazione Sistema Condizioni Custom");

      // Registra le impostazioni
      this._registerSettings();

      // Setup delle condizioni custom
      this._setupCustomConditions();

      // Registra gli hook
      this._registerHooks();

      // Registra comandi chat
      this._registerChatCommands();

      // Crea macro automatiche
      this._createAutomaticMacros();

      // Registra l'istanza globale
      game.brancalonia = game.brancalonia || {};
      game.brancalonia.conditions = this;

      ui.notifications.info("Sistema Condizioni Custom caricato con successo!");

    } catch (error) {
      console.error("Errore nell'inizializzazione Sistema Condizioni:", error);
      ui.notifications.error("Errore nel caricamento del sistema condizioni!");
    }
  }

  static _registerSettings() {
    try {
      // Abilita/disabilita sistema condizioni
      game.settings.register('brancalonia-bigat', 'enableCustomConditions', {
        name: 'Abilita Condizioni Custom',
        hint: 'Attiva il sistema completo delle condizioni custom di Brancalonia',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
          if (value) {
            ui.notifications.info("Sistema Condizioni Custom attivato!");
          } else {
            ui.notifications.warn("Sistema Condizioni Custom disattivato!");
          }
        }
      });

      // Auto-applicazione effetti
      game.settings.register('brancalonia-bigat', 'autoApplyConditionEffects', {
        name: 'Auto-Applicazione Effetti Condizioni',
        hint: 'Applica automaticamente gli effetti delle condizioni quando vengono aggiunte',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      // Notifiche condizioni
      game.settings.register('brancalonia-bigat', 'showConditionNotifications', {
        name: 'Mostra Notifiche Condizioni',
        hint: 'Mostra messaggi in chat quando vengono applicate le condizioni',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      // Debug mode
      game.settings.register('brancalonia-bigat', 'debugConditions', {
        name: 'Debug Condizioni',
        hint: 'Attiva log dettagliati per il debug del sistema condizioni',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
      });

    } catch (error) {
      console.error("Errore nella registrazione delle impostazioni condizioni:", error);
    }
  }

  static _setupCustomConditions() {
    try {
      // Setup delle condizioni custom specifiche di Brancalonia
      this.customConditions = {
        batosta: {
          name: "Batosta",
          icon: "modules/brancalonia-bigat/assets/icons/batosta.svg",
          description: "Ferite temporanee da rissa. 3 batoste = KO",
          effects: []
        },
        menagramo: {
          name: "Menagramo",
          icon: "icons/magic/unholy/silhouette-horned-evil.webp",
          description: "Maledizione che causa svantaggio e -2 CA",
          effects: [
            { key: "flags.dnd5e.disadvantage.all", mode: 5, value: "1" },
            { key: "system.attributes.ac.bonus", mode: 2, value: "-2" }
          ]
        },
        ubriaco: {
          name: "Ubriaco",
          icon: "icons/consumables/drinks/beer-stein-wooden.webp",
          description: "Effetti dell'alcol: -2 Des/Sag, +2 Car",
          effects: [
            { key: "system.abilities.dex.value", mode: 2, value: "-2" },
            { key: "system.abilities.wis.value", mode: 2, value: "-2" },
            { key: "system.abilities.cha.value", mode: 2, value: "+2" },
            { key: "flags.dnd5e.disadvantage.skill.prc", mode: 5, value: "1" },
            { key: "flags.dnd5e.advantage.save.wis", mode: 5, value: "fear" }
          ]
        },
        sfortuna: {
          name: "Sfortuna",
          icon: "icons/magic/unholy/projectile-helix-gray.webp",
          description: "Maledizione generale che porta sfortuna",
          effects: [
            { key: "flags.dnd5e.disadvantage.attack.all", mode: 5, value: "1" },
            { key: "flags.dnd5e.disadvantage.save.all", mode: 5, value: "1" }
          ]
        }
      };

      if (game.settings.get('brancalonia-bigat', 'debugConditions')) {
        console.log("Condizioni custom configurate:", this.customConditions);
      }

    } catch (error) {
      console.error("Errore nel setup condizioni custom:", error);
    }
  }

  static _registerChatCommands() {
    try {
      // Comando principale
      game.brancalonia.chatCommands = game.brancalonia.chatCommands || {};

      game.brancalonia.chatCommands['/condizione'] = {
        callback: this._handleCondizioneCommand.bind(this),
        description: "Gestisce le condizioni custom"
      };

      game.brancalonia.chatCommands['/batosta'] = {
        callback: this._handleBatostaCommand.bind(this),
        description: "Applica una batosta"
      };

      game.brancalonia.chatCommands['/ubriaco'] = {
        callback: this._handleUbriacoCommand.bind(this),
        description: "Applica la condizione ubriaco"
      };

      game.brancalonia.chatCommands['/condizionhelp'] = {
        callback: this._showConditionsHelp.bind(this),
        description: "Mostra l'aiuto per i comandi condizioni"
      };

      // Hook per intercettare i comandi chat
      Hooks.on("chatMessage", (chatLog, message, chatData) => {
        const command = message.split(' ')[0].toLowerCase();

        if (game.brancalonia.chatCommands[command]) {
          game.brancalonia.chatCommands[command].callback(message, chatData);
          return false; // Previene il messaggio normale
        }

        return true;
      });

    } catch (error) {
      console.error("Errore nella registrazione comandi chat condizioni:", error);
    }
  }

  static _createAutomaticMacros() {
    try {
      const macros = [
        {
          name: "Applica Batosta",
          type: "script",
          command: `
if (!game.brancalonia?.conditions) {
  ui.notifications.error("Sistema condizioni non disponibile!");
  return;
}

const tokens = canvas.tokens.controlled;
if (tokens.length === 0) {
  ui.notifications.warn("Seleziona un token!");
  return;
}

const actor = tokens[0].actor;
if (!actor) {
  ui.notifications.error("Token non valido!");
  return;
}

game.brancalonia.conditions.createBatostaEffect(actor);
`,
          img: "modules/brancalonia-bigat/assets/icons/batosta.svg"
        },
        {
          name: "Applica Ubriaco",
          type: "script",
          command: `
if (!game.brancalonia?.conditions) {
  ui.notifications.error("Sistema condizioni non disponibile!");
  return;
}

const tokens = canvas.tokens.controlled;
if (tokens.length === 0) {
  ui.notifications.warn("Seleziona un token!");
  return;
}

const actor = tokens[0].actor;
if (!actor) {
  ui.notifications.error("Token non valido!");
  return;
}

game.brancalonia.conditions.createCustomCondition(actor, 'ubriaco');
`,
          img: "icons/consumables/drinks/beer-stein-wooden.webp"
        },
        {
          name: "Rimuovi Condizioni Custom",
          type: "script",
          command: `
if (!game.brancalonia?.conditions) {
  ui.notifications.error("Sistema condizioni non disponibile!");
  return;
}

const tokens = canvas.tokens.controlled;
if (tokens.length === 0) {
  ui.notifications.warn("Seleziona un token!");
  return;
}

const actor = tokens[0].actor;
if (!actor) {
  ui.notifications.error("Token non valido!");
  return;
}

game.brancalonia.conditions.removeCustomConditions(actor);
`,
          img: "icons/magic/holy/meditation-stone-cairn-yellow.webp"
        }
      ];

      macros.forEach(async macroData => {
        const existingMacro = game.macros.find(m => m.name === macroData.name);
        if (!existingMacro) {
          await Macro.create(macroData);
          if (game.settings.get('brancalonia-bigat', 'debugConditions')) {
            console.log(`Macro '${macroData.name}' creata automaticamente`);
          }
        }
      });

    } catch (error) {
      console.error("Errore nella creazione macro condizioni:", error);
    }
  }

  static _registerHooks() {
    try {
      // Hook per applicare gli effetti quando vengono aggiunte le condizioni
      Hooks.on("createActiveEffect", this._onCreateEffect.bind(this));
      Hooks.on("deleteActiveEffect", this._onDeleteEffect.bind(this));

      // Hook per character sheet enhancement
      Hooks.on("renderActorSheet", (sheet, html, data) => {
        if (sheet.actor.type === "character" && game.settings.get('brancalonia-bigat', 'enableCustomConditions')) {
          this._enhanceCharacterSheet(sheet, html, data);
        }
      });

    } catch (error) {
      console.error("Errore nella registrazione degli hook condizioni:", error);
    }
  }

  /**
   * Gestisce la creazione di un nuovo effetto
   */
  static async _onCreateEffect(effect, options, userId) {
    try {
      if (game.user.id !== userId) return;
      if (!game.settings.get('brancalonia-bigat', 'enableCustomConditions')) return;

      // Controlla se è una delle nostre condizioni custom
      const statusId = effect.statuses?.first();
      if (!statusId) return;

      if (game.settings.get('brancalonia-bigat', 'autoApplyConditionEffects')) {
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
          case "sfortuna":
            await this.applySfortunaEffect(effect);
            break;
        }
      }

    } catch (error) {
      console.error("Errore nella gestione creazione effetto:", error);
    }
  }

  /**
   * Gestisce la rimozione di un effetto
   */
  static async _onDeleteEffect(effect, options, userId) {
    try {
      if (game.user.id !== userId) return;
      if (!game.settings.get('brancalonia-bigat', 'enableCustomConditions')) return;

      const statusId = effect.statuses?.first();
      if (!statusId) return;

      // Cleanup specifico per condizione se necessario
      const actor = effect.parent;
      if (!actor) return;

      switch(statusId) {
        case "batosta":
          await this.removeBatostaEffect(actor);
          break;
        case "ubriaco":
          await this.removeUbriacoEffect(actor);
          break;
      }

    } catch (error) {
      console.error("Errore nella gestione rimozione effetto:", error);
    }
  }

  static _handleCondizioneCommand(message, chatData) {
    try {
      const args = message.split(' ');
      const subcommand = args[1]?.toLowerCase();
      const condizione = args[2]?.toLowerCase();

      switch(subcommand) {
        case 'applica':
        case 'apply':
          if (condizione) {
            this._applyConditionToSelected(condizione);
          } else {
            ui.notifications.warn("Specifica una condizione da applicare!");
          }
          break;
        case 'rimuovi':
        case 'remove':
          this._removeConditionsFromSelected();
          break;
        case 'lista':
        case 'list':
          this._showConditionsList();
          break;
        default:
          this._showConditionsHelp();
      }
    } catch (error) {
      console.error("Errore nel comando condizione:", error);
      ui.notifications.error("Errore nell'esecuzione del comando!");
    }
  }

  static _handleBatostaCommand(message, chatData) {
    try {
      const tokens = canvas.tokens.controlled;
      if (tokens.length === 0) {
        ui.notifications.warn("Seleziona un token per applicare una batosta!");
        return;
      }

      const actor = tokens[0].actor;
      if (!actor) {
        ui.notifications.error("Token non valido!");
        return;
      }

      this.createBatostaEffect(actor);
    } catch (error) {
      console.error("Errore nel comando batosta:", error);
      ui.notifications.error("Errore nell'esecuzione del comando!");
    }
  }

  static _handleUbriacoCommand(message, chatData) {
    try {
      const tokens = canvas.tokens.controlled;
      if (tokens.length === 0) {
        ui.notifications.warn("Seleziona un token per applicare la condizione ubriaco!");
        return;
      }

      const actor = tokens[0].actor;
      if (!actor) {
        ui.notifications.error("Token non valido!");
        return;
      }

      this.createCustomCondition(actor, 'ubriaco');
    } catch (error) {
      console.error("Errore nel comando ubriaco:", error);
      ui.notifications.error("Errore nell'esecuzione del comando!");
    }
  }

  static _showConditionsHelp() {
    const helpContent = `
      <div class="brancalonia-help">
        <h2>🎭 Comandi Condizioni Custom</h2>
        <h3>Comandi disponibili:</h3>
        <ul>
          <li><strong>/condizione applica [nome]</strong> - Applica una condizione al token selezionato</li>
          <li><strong>/condizione rimuovi</strong> - Rimuove le condizioni custom dal token selezionato</li>
          <li><strong>/condizione lista</strong> - Mostra tutte le condizioni disponibili</li>
          <li><strong>/batosta</strong> - Applica una batosta al token selezionato</li>
          <li><strong>/ubriaco</strong> - Applica la condizione ubriaco al token selezionato</li>
          <li><strong>/condizionhelp</strong> - Mostra questo aiuto</li>
        </ul>
        <h3>Condizioni disponibili:</h3>
        <ul>
          <li><strong>Batosta</strong> - Ferite temporanee da rissa (3 = KO)</li>
          <li><strong>Menagramo</strong> - Maledizione con svantaggio e -2 CA</li>
          <li><strong>Ubriaco</strong> - Effetti alcol: -2 Des/Sag, +2 Car</li>
          <li><strong>Sfortuna</strong> - Maledizione generale con svantaggi</li>
        </ul>
      </div>
    `;

    ChatMessage.create({
      content: helpContent,
      whisper: [game.user.id]
    });
  }

  static _showConditionsList() {
    let content = `
      <div class="condizioni-lista">
        <h2>🎭 Condizioni Custom Disponibili</h2>
        <div class="conditions-grid">
    `;

    for (const [key, condizione] of Object.entries(this.customConditions)) {
      content += `
        <div class="condition-item">
          <h4>${condizione.name}</h4>
          <p><em>${condizione.description}</em></p>
        </div>
      `;
    }

    content += `
        </div>
      </div>
    `;

    ChatMessage.create({
      content: content
    });
  }

  static _applyConditionToSelected(conditionType) {
    const tokens = canvas.tokens.controlled;
    if (tokens.length === 0) {
      ui.notifications.warn("Seleziona un token!");
      return;
    }

    const actor = tokens[0].actor;
    if (!actor) {
      ui.notifications.error("Token non valido!");
      return;
    }

    if (conditionType === 'batosta') {
      this.createBatostaEffect(actor);
    } else {
      this.createCustomCondition(actor, conditionType);
    }
  }

  static _removeConditionsFromSelected() {
    const tokens = canvas.tokens.controlled;
    if (tokens.length === 0) {
      ui.notifications.warn("Seleziona un token!");
      return;
    }

    const actor = tokens[0].actor;
    if (!actor) {
      ui.notifications.error("Token non valido!");
      return;
    }

    this.removeCustomConditions(actor);
  }

  static _enhanceCharacterSheet(sheet, html, data) {
    try {
      const actor = sheet.actor;

      // Aggiungi sezione condizioni custom alla scheda
      const conditionsHtml = `
        <div class="brancalonia-conditions-section">
          <h3>🎭 Condizioni Custom</h3>
          <button type="button" class="add-condition" data-actor-id="${actor.id}">
            Aggiungi Condizione
          </button>
        </div>
      `;

      // Inserisci dopo la sezione effetti
      const effectsSection = html.find('.effects');
      if (effectsSection.length) {
        effectsSection.after(conditionsHtml);
      } else {
        html.find('.sheet-body').prepend(conditionsHtml);
      }

      // Aggiungi event listener
      html.find('.add-condition').click((event) => {
        event.preventDefault();
        const actorId = event.currentTarget.dataset.actorId;
        const actor = game.actors.get(actorId);
        if (actor) {
          this._showConditionDialog(actor);
        }
      });

    } catch (error) {
      console.error("Errore nell'enhancement della scheda personaggio:", error);
    }
  }

  static _showConditionDialog(actor) {
    try {
      let content = `
        <div class="condition-dialog">
          <p>Seleziona una condizione da applicare a <strong>${actor.name}</strong>:</p>
          <select id="condition-select" style="width: 100%; margin: 10px 0;">
      `;

      for (const [key, condizione] of Object.entries(this.customConditions)) {
        content += `<option value="${key}">${condizione.name}</option>`;
      }

      content += `
          </select>
          <p><em>La condizione verrà applicata con i suoi effetti automatici.</em></p>
        </div>
      `;

      new Dialog({
        title: "Applica Condizione Custom",
        content: content,
        buttons: {
          apply: {
            label: "Applica",
            callback: async (html) => {
              const conditionType = html.find('#condition-select').val();
              if (conditionType === 'batosta') {
                await this.createBatostaEffect(actor);
              } else {
                await this.createCustomCondition(actor, conditionType);
              }
            }
          },
          cancel: {
            label: "Annulla"
          }
        }
      }).render(true);

    } catch (error) {
      console.error("Errore nel dialogo condizioni:", error);
      ui.notifications.error("Errore nell'apertura del dialogo!");
    }
  }

  /**
   * Applica l'effetto Batosta
   * Le batoste sono ferite temporanee nelle risse da taverna
   */
  static async applyBatostaEffect(effect) {
    try {
      const actor = effect.parent;
      if (!actor) return;

      // Incrementa il contatore delle batoste
      const batoste = actor.getFlag("brancalonia-bigat", "batoste") || 0;
      await actor.setFlag("brancalonia-bigat", "batoste", batoste + 1);

      // Notifica
      if (game.settings.get('brancalonia-bigat', 'showConditionNotifications')) {
        ui.notifications.info(`${actor.name} ha subito una batosta! (Totale: ${batoste + 1})`);
      }

      // Se raggiunge 3 batoste, è KO
      if (batoste + 1 >= 3) {
        ChatMessage.create({
          content: `<div class="brancalonia-rissa">
            <h3>😵 KO!</h3>
            <p><strong>${actor.name}</strong> è stato messo KO dopo 3 batoste!</p>
            <p><em>Il personaggio è incosciente e deve riprendersi.</em></p>
          </div>`,
          speaker: ChatMessage.getSpeaker({ actor: actor })
        });

        // Applica anche la condizione incosciente
        await this._applyUnconsciousCondition(actor);
      }

      if (game.settings.get('brancalonia-bigat', 'debugConditions')) {
        console.log(`Batosta applicata a ${actor.name}, totale: ${batoste + 1}`);
      }

    } catch (error) {
      console.error("Errore nell'applicazione effetto batosta:", error);
    }
  }

  /**
   * Rimuove l'effetto Batosta
   */
  static async removeBatostaEffect(actor) {
    try {
      // Resetta il contatore delle batoste
      await actor.unsetFlag("brancalonia-bigat", "batoste");

      if (game.settings.get('brancalonia-bigat', 'showConditionNotifications')) {
        ui.notifications.info(`${actor.name} si è ripreso dalle batoste!`);
      }

      if (game.settings.get('brancalonia-bigat', 'debugConditions')) {
        console.log(`Batoste rimosse da ${actor.name}`);
      }

    } catch (error) {
      console.error("Errore nella rimozione effetto batosta:", error);
    }
  }

  static async removeUbriacoEffect(actor) {
    try {
      if (game.settings.get('brancalonia-bigat', 'showConditionNotifications')) {
        ui.notifications.info(`${actor.name} ha smaltito la sbornia!`);
      }

      if (game.settings.get('brancalonia-bigat', 'debugConditions')) {
        console.log(`Condizione ubriaco rimossa da ${actor.name}`);
      }

    } catch (error) {
      console.error("Errore nella rimozione effetto ubriaco:", error);
    }
  }

  static async _applyUnconsciousCondition(actor) {
    try {
      // Applica la condizione incosciente di D&D5e
      const unconsciousEffect = {
        name: "Incosciente (da Batoste)",
        icon: "icons/svg/unconscious.svg",
        origin: actor.uuid,
        disabled: false,
        statuses: ["unconscious"],
        duration: {
          rounds: 10 // Durata temporanea
        }
      };

      await actor.createEmbeddedDocuments("ActiveEffect", [unconsciousEffect]);

    } catch (error) {
      console.error("Errore nell'applicazione condizione incosciente:", error);
    }
  }


  /**
   * Applica l'effetto Menagramo
   */
  static async applyMenagramoEffect(effect) {
    try {
      const actor = effect.parent;
      if (!actor) return;

      // Applica gli effetti del menagramo
      const conditionData = this.customConditions.menagramo;
      if (conditionData && conditionData.effects.length > 0) {
        await effect.update({ changes: conditionData.effects });
      }

      if (game.settings.get('brancalonia-bigat', 'showConditionNotifications')) {
        ChatMessage.create({
          content: `<div class="brancalonia-condition">
            <h3>🖤 Menagramo!</h3>
            <p><strong>${actor.name}</strong> è colpito dal menagramo!</p>
            <ul>
              <li>Svantaggio a tutti i tiri</li>
              <li>-2 alla CA</li>
              <li>Durata: ${effect.duration?.rounds || "Fino a rimozione"} round</li>
            </ul>
          </div>`,
          speaker: ChatMessage.getSpeaker({ actor: actor })
        });
      }

      if (game.settings.get('brancalonia-bigat', 'debugConditions')) {
        console.log(`Menagramo applicato a ${actor.name}`);
      }

    } catch (error) {
      console.error("Errore nell'applicazione effetto menagramo:", error);
    }
  }

  /**
   * Applica l'effetto Ubriaco
   */
  static async applyUbriacoEffect(effect) {
    try {
      const actor = effect.parent;
      if (!actor) return;

      // Applica gli effetti dell'ubriaco
      const conditionData = this.customConditions.ubriaco;
      if (conditionData && conditionData.effects.length > 0) {
        await effect.update({ changes: conditionData.effects });
      }

      if (game.settings.get('brancalonia-bigat', 'showConditionNotifications')) {
        ChatMessage.create({
          content: `<div class="brancalonia-condition">
            <h3>🍺 Ubriaco!</h3>
            <p><strong>${actor.name}</strong> è ubriaco!</p>
            <ul>
              <li>-2 a Destrezza e Saggezza</li>
              <li>+2 a Carisma</li>
              <li>Svantaggio alle prove di Percezione</li>
              <li>Vantaggio ai TS contro paura</li>
            </ul>
          </div>`,
          speaker: ChatMessage.getSpeaker({ actor: actor })
        });
      }

      if (game.settings.get('brancalonia-bigat', 'debugConditions')) {
        console.log(`Condizione ubriaco applicata a ${actor.name}`);
      }

    } catch (error) {
      console.error("Errore nell'applicazione effetto ubriaco:", error);
    }
  }

  /**
   * Applica l'effetto Sfortuna
   */
  static async applySfortunaEffect(effect) {
    try {
      const actor = effect.parent;
      if (!actor) return;

      // Applica gli effetti della sfortuna
      const conditionData = this.customConditions.sfortuna;
      if (conditionData && conditionData.effects.length > 0) {
        await effect.update({ changes: conditionData.effects });
      }

      if (game.settings.get('brancalonia-bigat', 'showConditionNotifications')) {
        ChatMessage.create({
          content: `<div class="brancalonia-condition">
            <h3>🔮 Sfortuna!</h3>
            <p><strong>${actor.name}</strong> è colpito da sfortuna!</p>
            <ul>
              <li>Svantaggio agli attacchi</li>
              <li>Svantaggio ai tiri salvezza</li>
              <li>La sfortuna perseguita ogni azione</li>
            </ul>
          </div>`,
          speaker: ChatMessage.getSpeaker({ actor: actor })
        });
      }

      if (game.settings.get('brancalonia-bigat', 'debugConditions')) {
        console.log(`Sfortuna applicata a ${actor.name}`);
      }

    } catch (error) {
      console.error("Errore nell'applicazione effetto sfortuna:", error);
    }
  }

  /**
   * Crea un effetto Batosta temporaneo
   */
  static async createBatostaEffect(actor, rounds = 10) {
    try {
      if (!game.settings.get('brancalonia-bigat', 'enableCustomConditions')) {
        ui.notifications.warn("Sistema Condizioni Custom disabilitato!");
        return;
      }

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

      if (game.settings.get('brancalonia-bigat', 'debugConditions')) {
        console.log(`Effetto batosta creato per ${actor.name}`);
      }

    } catch (error) {
      console.error("Errore nella creazione effetto batosta:", error);
      ui.notifications.error("Errore nella creazione della batosta!");
    }
  }

  /**
   * Crea una condizione custom
   */
  static async createCustomCondition(actor, conditionType, rounds = null) {
    try {
      if (!game.settings.get('brancalonia-bigat', 'enableCustomConditions')) {
        ui.notifications.warn("Sistema Condizioni Custom disabilitato!");
        return;
      }

      const conditionData = this.customConditions[conditionType];
      if (!conditionData) {
        ui.notifications.error(`Condizione '${conditionType}' non trovata!`);
        return;
      }

      const effectData = {
        name: conditionData.name,
        img: conditionData.icon,
        origin: actor.uuid,
        disabled: false,
        statuses: [conditionType],
        changes: conditionData.effects,
        flags: {
          "brancalonia-bigat": {
            type: conditionType
          }
        }
      };

      // Aggiungi durata se specificata
      if (rounds) {
        effectData.duration = { rounds: rounds };
      }

      await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);

      if (game.settings.get('brancalonia-bigat', 'debugConditions')) {
        console.log(`Condizione ${conditionType} creata per ${actor.name}`);
      }

    } catch (error) {
      console.error("Errore nella creazione condizione custom:", error);
      ui.notifications.error("Errore nella creazione della condizione!");
    }
  }

  /**
   * Rimuove tutte le condizioni custom da un attore
   */
  static async removeCustomConditions(actor) {
    try {
      const customEffects = actor.effects.filter(e =>
        e.flags?.["brancalonia-bigat"]?.type &&
        this.customConditions[e.flags["brancalonia-bigat"].type]
      );

      if (customEffects.length === 0) {
        ui.notifications.info(`${actor.name} non ha condizioni custom da rimuovere.`);
        return;
      }

      const ids = customEffects.map(e => e.id);
      await actor.deleteEmbeddedDocuments("ActiveEffect", ids);

      ui.notifications.info(`Rimosse ${customEffects.length} condizioni custom da ${actor.name}.`);

      if (game.settings.get('brancalonia-bigat', 'debugConditions')) {
        console.log(`Condizioni custom rimosse da ${actor.name}:`, customEffects.map(e => e.name));
      }

    } catch (error) {
      console.error("Errore nella rimozione condizioni custom:", error);
      ui.notifications.error("Errore nella rimozione delle condizioni!");
    }
  }

}

}

// Inizializza il sistema
Hooks.once("init", () => {
  try {
    BrancaloniaConditions.initialize();
  } catch (error) {
    console.error("Errore critico nell'inizializzazione BrancaloniaConditions:", error);
    ui.notifications.error("Errore nel caricamento del sistema condizioni!");
  }
});

// Rendi disponibile globalmente
window.BrancaloniaConditions = BrancaloniaConditions;