/**
 * Brancalonia - Sistema Condizioni Custom
 * Gestisce le condizioni speciali di Brancalonia con i loro effetti
 * 
 * NOTA: Menagramo e Sfortuna sono gestiti da MenagramoSystem (menagramo-system.js)
 * NOTA: Batoste sono gestite da TavernBrawlSystem (tavern-brawl.js)
 */

import logger from './brancalonia-logger.js';

const MODULE_ID = 'brancalonia-bigat';
const MODULE_NAME = 'Conditions';

class BrancaloniaConditions {
  static initialize() {
    try {
      logger.info(MODULE_NAME, 'Inizializzazione Sistema Condizioni Custom');

      // Registra le impostazioni
      this._registerSettings();

      // Setup delle condizioni custom
      this._setupCustomConditions();

      // Registra gli hook
      this._registerHooks();

      // Registra comandi chat
      this._registerChatCommands();

      // Registra l'istanza globale
      game.brancalonia = game.brancalonia || {};
      game.brancalonia.conditions = this;

      logger.info(MODULE_NAME, 'Sistema Condizioni Custom caricato con successo');

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore inizializzazione Sistema Condizioni', error);
      if (ui?.notifications) {
        ui.notifications.error(`Errore nel caricamento del sistema condizioni: ${error?.message || 'Errore sconosciuto'}`);
      }
    }
  }

  static _registerSettings() {
    try {
      // Abilita/disabilita sistema condizioni
      game.settings.register(MODULE_ID, 'enableCustomConditions', {
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
      game.settings.register(MODULE_ID, 'autoApplyConditionEffects', {
        name: 'Auto-Applicazione Effetti Condizioni',
        hint: 'Applica automaticamente gli effetti delle condizioni quando vengono aggiunte',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      // Notifiche condizioni
      game.settings.register(MODULE_ID, 'showConditionNotifications', {
        name: 'Mostra Notifiche Condizioni',
        hint: 'Mostra messaggi in chat quando vengono applicate le condizioni',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      // Debug mode
      game.settings.register(MODULE_ID, 'debugConditions', {
        name: 'Debug Condizioni',
        hint: 'Attiva log dettagliati per il debug del sistema condizioni',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
      });

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore registrazione impostazioni', error);
    }
  }

  static _setupCustomConditions() {
    try {
      // Setup delle condizioni custom specifiche di Brancalonia
      // NOTA: Le batoste sono gestite da TavernBrawlSystem (tavern-brawl.js)
      // NOTA: Menagramo e Sfortuna sono gestiti da MenagramoSystem (menagramo-system.js)
      //       Usa game.brancalonia.menagramo.apply(actor, level) per applicarli
      
      this.customConditions = {
        ubriaco: {
          name: "Ubriaco",
          icon: "icons/consumables/drinks/beer-stein-wooden.webp",
          description: "Effetti dell'alcol: -2 Des/Sag, +2 Car (estensione custom per VTT)",
          effects: [
            { key: "system.abilities.dex.value", mode: 2, value: "-2" },
            { key: "system.abilities.wis.value", mode: 2, value: "-2" },
            { key: "system.abilities.cha.value", mode: 2, value: "+2" },
            { key: "flags.dnd5e.disadvantage.skill.prc", mode: 5, value: "1" },
            { key: "flags.dnd5e.advantage.save.wis", mode: 5, value: "fear" }
          ],
          note: "Condizione custom per Brancalonia VTT, non nel manuale base. Utile per bagordi e cimeli."
        }
      };

      if (game.settings.get(MODULE_ID, 'debugConditions')) {
        logger.debug(MODULE_NAME, 'Condizioni custom configurate', this.customConditions);
      }

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore setup condizioni custom', error);
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

      // Comando /batosta rimosso - le batoste sono gestite da TavernBrawlSystem
      
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
      logger.error(MODULE_NAME, 'Errore registrazione comandi chat', error);
    }
  }

  static _createAutomaticMacros() {
    try {
      // Verifica che game.macros sia disponibile
      if (!game.macros) {
        logger.warn(MODULE_NAME, 'game.macros non ancora disponibile, macro creation skipped');
        return;
      }

      // NOTA: Macro "Applica Batosta" rimossa - le batoste sono gestite da TavernBrawlSystem
      const macros = [
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

      // Fixed: Use for...of instead of forEach(async)
      for (const macroData of macros) {
        try {
          const existingMacro = game?.macros?.find(m => m.name === macroData.name);
          if (existingMacro) {
            if (game.settings.get(MODULE_ID, 'debugConditions')) {
              logger.info(MODULE_NAME, `Macro '${macroData.name}' già presente, nessuna creazione necessaria`);
            }
            continue;
          }

          await Macro.create(macroData);

          if (game.settings.get(MODULE_ID, 'debugConditions')) {
            logger.debug(MODULE_NAME, `Macro '${macroData.name}' creata automaticamente`);
          }
        } catch (error) {
          logger.error(MODULE_NAME, `Errore creazione macro ${macroData.name}`, error);
        }
      }

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore creazione macro condizioni', error);
    }
  }

  static _registerHooks() {
    try {
      // Hook per applicare gli effetti quando vengono aggiunte le condizioni
      Hooks.on("createActiveEffect", this._onCreateEffect.bind(this));
      Hooks.on("deleteActiveEffect", this._onDeleteEffect.bind(this));

      // Hook per character sheet enhancement
      Hooks.on("renderActorSheet", (sheet, html, data) => {
        if (sheet.actor.type === "character" && game.settings.get(MODULE_ID, 'enableCustomConditions')) {
          this._enhanceCharacterSheet(sheet, html, data);
        }
      });

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore registrazione hook', error);
    }
  }

  /**
   * Gestisce la creazione di un nuovo effetto
   */
  static async _onCreateEffect(effect, options, userId) {
    try {
      if (game.user.id !== userId) return;
      if (!game.settings.get(MODULE_ID, 'enableCustomConditions')) return;

      // Controlla se è una delle nostre condizioni custom
      const statusId = effect.statuses?.first();
      if (!statusId) return;

      if (game.settings.get(MODULE_ID, 'autoApplyConditionEffects')) {
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
      logger.error(MODULE_NAME, 'Errore gestione creazione effetto', error);
    }
  }

  /**
   * Gestisce la rimozione di un effetto
   */
  static async _onDeleteEffect(effect, options, userId) {
    try {
      if (game.user.id !== userId) return;
      if (!game.settings.get(MODULE_ID, 'enableCustomConditions')) return;

      const statusId = effect.statuses?.first();
      if (!statusId) return;

      // Cleanup specifico per condizione se necessario
      const actor = effect.parent;
      if (!actor) return;

      switch(statusId) {
        case "batosta":
          // Le batoste sono gestite da TavernBrawlSystem
          break;
        case "ubriaco":
          await this.removeUbriacoEffect(actor);
          break;
      }

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore gestione rimozione effetto', error);
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
      logger.error(MODULE_NAME, 'Errore comando condizione', error);
      ui.notifications.error("Errore nell'esecuzione del comando!");
    }
  }

  // Metodo _handleBatostaCommand rimosso - le batoste sono gestite da TavernBrawlSystem

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
      logger.error(MODULE_NAME, 'Errore comando ubriaco', error);
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
          <li><strong>/ubriaco</strong> - Applica la condizione ubriaco al token selezionato</li>
          <li><strong>/condizionhelp</strong> - Mostra questo aiuto</li>
        </ul>
        <h3>Condizioni disponibili:</h3>
        <ul>
          <li><strong>Ubriaco</strong> - Effetti alcol: -2 Des/Sag, +2 Car</li>
        </ul>
        
        <hr style="margin: 15px 0; border: 1px solid #ccc;">
        
        <h3>Altri Sistemi:</h3>
        <ul>
          <li><strong>Batoste</strong> → Usa la macro "🍺 Gestione Risse" (TavernBrawlSystem)</li>
          <li><strong>Menagramo/Sfortuna</strong> → Usa la macro "🖤 Applica Menagramo" (MenagramoSystem con 4 livelli)</li>
          <li><strong>Malattie</strong> → Sistema Malattie (DiseasesSystem)</li>
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
        
        <hr style="margin: 15px 0; border: 1px solid #ccc;">
        
        <div style="padding: 10px; background: #f5f5f5; border-radius: 5px; margin-top: 10px;">
          <p style="margin: 0; font-size: 0.9em;"><strong>Altri sistemi:</strong></p>
          <ul style="margin: 5px 0; padding-left: 20px; font-size: 0.9em;">
            <li><strong>Menagramo/Sfortuna</strong>: Usa la macro "🖤 Applica Menagramo"</li>
            <li><strong>Batoste</strong>: Usa la macro "🍺 Gestione Risse"</li>
            <li><strong>Malattie</strong>: Sistema Malattie separato</li>
          </ul>
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

    // Redirect a sistemi specializzati
    if (conditionType === 'batosta') {
      ui.notifications.warn('Le batoste sono gestite dal sistema risse! Usa la macro "🍺 Gestione Risse"');
      return;
    }
    
    if (conditionType === 'menagramo' || conditionType === 'sfortuna') {
      logger.warn(MODULE_NAME, 'Menagramo e Sfortuna sono gestiti da MenagramoSystem! Usa la macro "🖤 Applica Menagramo"');
      return;
    }
    
    this.createCustomCondition(actor, conditionType);
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
      logger.error(MODULE_NAME, 'Errore enhancement scheda personaggio', error);
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

      new foundry.appv1.sheets.Dialog({
        title: "Applica Condizione Custom",
        content: content,
        buttons: {
          apply: {
            label: "Applica",
            callback: async (html) => {
              const conditionType = html.find('#condition-select').val();
              if (conditionType === 'batosta') {
                ui.notifications.warn('Le batoste sono gestite dal sistema risse! Usa la macro "🍺 Gestione Risse"');
                return;
              }
              await this.createCustomCondition(actor, conditionType);
            }
          },
          cancel: {
            label: "Annulla"
          }
        }
      }).render(true);

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore creazione dialogo condizione', error);
    }
  }
}

export default BrancaloniaConditions;