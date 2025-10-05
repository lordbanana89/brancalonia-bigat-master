/**
 * Sistema Cimeli Maledetti di Brancalonia
 * Gestisce gli oggetti magici con benedizioni e maledizioni
 */

import logger from './brancalonia-logger.js';

const MODULE_ID = 'brancalonia-bigat';
const MODULE_NAME = 'CursedRelics';

class CimeliMaledetti {
  static initialize() {
    try {
      logger.info(MODULE_NAME, 'Inizializzazione Sistema Cimeli Maledetti');

      // Registra le impostazioni
      this._registerSettings();

      // Setup delle proprietà D&D5E
      this._setupProperties();

      // Registra gli hook
      this._registerHooks();

      // Registra comandi chat
      this._registerChatCommands();

      // NON inizializzare il database qui - i compendium non sono ancora disponibili
      // Verrà fatto nell'hook ready

      // Registra l'istanza globale
      game.brancalonia = game.brancalonia || {};
      game.brancalonia.cimeliMaledetti = this;

      logger.info(MODULE_NAME, 'Sistema Cimeli Maledetti caricato con successo');

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore inizializzazione Sistema Cimeli Maledetti', error);
      if (ui?.notifications) {
        ui.notifications.error(`Errore nel caricamento del sistema cimeli: ${error?.message || 'Errore sconosciuto'}`);
      }
    }
  }

  static _registerSettings() {
    try {
      // Abilita/disabilita sistema cimeli
      game.settings.register(MODULE_ID, 'enableCimeliMaledetti', {
        name: 'Abilita Cimeli Maledetti',
        hint: 'Attiva il sistema completo dei cimeli maledetti con benedizioni e maledizioni',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
          if (value) {
            ui.notifications.info("Sistema Cimeli Maledetti attivato!");
          } else {
            ui.notifications.warn("Sistema Cimeli Maledetti disattivato!");
          }
        }
      });

      // Auto-applicazione effetti
      game.settings.register(MODULE_ID, 'autoApplyCimeliEffects', {
        name: 'Auto-Applicazione Effetti Cimeli',
        hint: 'Applica automaticamente benedizioni e maledizioni quando equipaggiati',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      // Mostra maledizioni ai giocatori
      game.settings.register(MODULE_ID, 'showCursesToPlayers', {
        name: 'Mostra Maledizioni ai Giocatori',
        hint: 'I giocatori vedono immediatamente le maledizioni dei cimeli',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
      });

      // Debug mode
      game.settings.register(MODULE_ID, 'debugCimeliMaledetti', {
        name: 'Debug Cimeli Maledetti',
        hint: 'Attiva log dettagliati per il debug del sistema cimeli',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
      });

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore registrazione impostazioni cimeli', error);
    }
  }

  static _setupProperties() {
    try {
      // Registra proprietà personalizzate
      CONFIG.DND5E.itemProperties.cimelo = {
        label: "Cimelo",
        abbr: "CIM"
      };

      CONFIG.DND5E.itemProperties.maledetto = {
        label: "Maledetto",
        abbr: "MAL"
      };

      if (game.settings.get(MODULE_ID, 'debugCimeliMaledetti')) {
        logger.debug(MODULE_NAME, 'Proprietà cimeli registrate in D&D5E');
      }

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore setup proprietà cimeli', error);
    }
  }
  static cimeli = new Map();

  static _registerChatCommands() {
    try {
      // Comando principale
      game.brancalonia.chatCommands = game.brancalonia.chatCommands || {};

      game.brancalonia.chatCommands['/cimelo'] = {
        callback: this._handleCimeloCommand.bind(this),
        description: "Gestisce i cimeli maledetti"
      };

      game.brancalonia.chatCommands['/maledizione'] = {
        callback: this._handleMaledizioneCommand.bind(this),
        description: "Gestisce le maledizioni"
      };

      game.brancalonia.chatCommands['/cimelihelp'] = {
        callback: this._showCimeliHelp.bind(this),
        description: "Mostra l'aiuto per i comandi cimeli"
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
      logger.error(MODULE_NAME, 'Errore registrazione comandi chat cimeli', error);
    }
  }

  static _createAutomaticMacros() {
    try {
      // Verifica che game.macros sia disponibile
      if (!game.macros) {
        logger.warn(MODULE_NAME, 'game.macros non ancora disponibile, macro creation skipped');
        return;
      }

      const macros = [
        {
          name: "Tira Cimelo Casuale",
          type: "script",
          command: `
if (!game.brancalonia?.cimeliMaledetti) {
  ui.notifications.error("Sistema cimeli non disponibile!");
  return;
}

game.brancalonia.cimeliMaledetti.tiraCimelo();
`,
          img: "icons/magic/holy/angel-wings-gray.webp"
        },
        {
          name: "Identifica Cimelo",
          type: "script",
          command: `
if (!game.brancalonia?.cimeliMaledetti) {
  ui.notifications.error("Sistema cimeli non disponibile!");
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

game.brancalonia.cimeliMaledetti.mostraDialogoIdentificazione(actor);
`,
          img: "icons/magic/perception/eye-ringed-glow-angry-small-teal.webp"
        },
        {
          name: "Rimuovi Maledizione",
          type: "script",
          command: `
if (!game.brancalonia?.cimeliMaledetti) {
  ui.notifications.error("Sistema cimeli non disponibile!");
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

game.brancalonia.cimeliMaledetti.tentaRimozioneMaledizione(actor);
`,
          img: "icons/magic/holy/meditation-stone-cairn-yellow.webp"
        }
      ];

      // Fixed: Use for...of instead of forEach(async)
      for (const macroData of macros) {
        try {
          const existingMacro = game?.macros?.find(m => m.name === macroData.name);
          if (!existingMacro) {
            await Macro.create(macroData);
            if (game.settings.get(MODULE_ID, 'debugCimeliMaledetti')) {
              logger.debug(MODULE_NAME, `Macro '${macroData.name}' creata automaticamente`);
            }
          }
        } catch (error) {
          logger.error(MODULE_NAME, `Errore creazione macro ${macroData.name}`, error);
        }
      }

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore creazione macro cimeli', error);
    }
  }

  /**
   * Inizializza il database dei cimeli
   */
  static async _initCimeli() {
    try {
      if (!game.settings.get(MODULE_ID, 'enableCimeliMaledetti')) return;

      // Carica cimeli dal compendium
      const pack = game.packs.get("brancalonia-bigat.equipaggiamento");
      if (!pack) {
        logger.warn(MODULE_NAME, 'Compendium equipaggiamento non trovato');
        return;
      }

      const items = await pack.getDocuments();

      // Pre-processing: fix validation errors before processing
      const validItems = [];

      for (const item of items) {
        try {
          // Skip items that might cause validation errors
          let skipItem = false;

          // Fix strength values before processing
          if (item.system?.strength !== undefined) {
            const strength = item.system.strength;
            if (typeof strength !== 'number' || isNaN(strength)) {
              // Convert to valid integer
              item.system.strength = 0;
            }
          }

          // Fix duration validation errors in activities
          if (item.system?.activities) {
            let needsUpdate = false;
            const updatedActivities = { ...item.system.activities };

            for (const [activityId, activity] of Object.entries(item.system.activities)) {
              if (activity.type === 'utility' && activity.duration?.value !== undefined) {
                const durationValue = activity.duration.value;

                // Check if duration value is invalid
                if (!CimeliMaledetti._isValidDurationValue(durationValue)) {
                  logger.warn(MODULE_NAME, `Fixing invalid duration in ${item.name}: "${durationValue}" -> ""`);
                  updatedActivities[activityId] = {
                    ...activity,
                    duration: {
                      ...activity.duration,
                      value: '' // Set to valid empty value
                    }
                  };
                  needsUpdate = true;
                }
              }
            }

            // Apply fixes if needed
            if (needsUpdate) {
              try {
                // Use updateSource to avoid validation during processing
                item.updateSource({ 'system.activities': updatedActivities });
              } catch (error) {
                logger.error(MODULE_NAME, `Error fixing item ${item.name}`, error);
                skipItem = true;
              }
            }
          }

          // Only include valid items
          if (!skipItem) {
            validItems.push(item);
          }
        } catch (error) {
          logger.warn(MODULE_NAME, `Skipping problematic item ${item.name}`, error);
          // Skip this item if it can't be processed
        }
      }

      // Use only valid items for processing
      const processableItems = validItems;

      // Process cimeli items
      processableItems.forEach(item => {
        if (item.flags?.brancalonia?.categoria === "cimelo") {
          this.cimeli.set(item.name, {
            proprieta: item.flags.brancalonia.proprieta_originale,
            maledizione: item.flags.brancalonia.maledizione,
            storia: item.flags.brancalonia.storia,
            item: item
          });
        }
      });

      if (game.settings.get(MODULE_ID, 'debugCimeliMaledetti')) {
        logger.debug(MODULE_NAME, `Caricati ${this.cimeli.size} cimeli`, Array.from(this.cimeli.keys()));
      }

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore caricamento cimeli', error);
    }
  }

  static _handleCimeloCommand(message, chatData) {
    try {
      const args = message.split(' ');
      const subcommand = args[1]?.toLowerCase();

      switch (subcommand) {
        case 'tira':
        case 'casuale':
        case 'random':
          this.tiraCimelo();
          break;
        case 'lista':
        case 'list':
          this._mostraListaCimeli();
          break;
        case 'identifica':
        case 'identify':
          this._gestisciIdentificazione();
          break;
        default:
          this.tiraCimelo(); // Default action
      }
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore comando cimelo', error);
      ui.notifications.error("Errore nell'esecuzione del comando!");
    }
  }

  static _handleMaledizioneCommand(message, chatData) {
    try {
      const args = message.split(' ');
      const subcommand = args[1]?.toLowerCase();

      switch (subcommand) {
        case 'rimuovi':
        case 'remove':
          this._gestisciRimozioneMaledizione();
          break;
        case 'mostra':
        case 'show':
          this._mostraMaledizioni();
          break;
        default:
          this._showCimeliHelp();
      }
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore comando maledizione', error);
      ui.notifications.error("Errore nell'esecuzione del comando!");
    }
  }

  static _showCimeliHelp() {
    const helpContent = `
      <div class="brancalonia-help">
        <h2>🎭 Comandi Cimeli Maledetti</h2>
        <h3>Comandi disponibili:</h3>
        <ul>
          <li><strong>/cimelo</strong> - Tira un cimelo casuale</li>
          <li><strong>/cimelo tira</strong> - Tira un cimelo casuale</li>
          <li><strong>/cimelo lista</strong> - Mostra tutti i cimeli disponibili</li>
          <li><strong>/cimelo identifica</strong> - Identifica cimeli del personaggio selezionato</li>
          <li><strong>/maledizione rimuovi</strong> - Tenta di rimuovere una maledizione</li>
          <li><strong>/maledizione mostra</strong> - Mostra tutte le maledizioni attive</li>
          <li><strong>/cimelihelp</strong> - Mostra questo aiuto</li>
        </ul>
        <h3>Come funziona:</h3>
        <ul>
          <li>I cimeli hanno sia benedizioni che maledizioni</li>
          <li>Le benedizioni si attivano quando equipaggiati</li>
          <li>Le maledizioni persistono anche quando non equipaggiati</li>
          <li>Solo magia potente può rimuovere le maledizioni</li>
        </ul>
      </div>
    `;

    ChatMessage.create({
      content: helpContent,
      whisper: [game.user.id]
    });
  }

  static _mostraListaCimeli() {
    if (this.cimeli.size === 0) {
      ui.notifications.warn("Nessun cimelo disponibile nel database!");
      return;
    }

    let content = `
      <div class="cimeli-lista">
        <h2>🎭 Lista Cimeli Maledetti</h2>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Benedizione</th>
              <th>Maledizione</th>
            </tr>
          </thead>
          <tbody>
    `;

    for (const [nome, dati] of this.cimeli.entries()) {
      content += `
        <tr>
          <td><strong>${nome}</strong></td>
          <td style="color: #2e7d32; font-size: 0.8em;">${dati.proprieta || 'Sconosciuta'}</td>
          <td style="color: #b71c1c; font-size: 0.8em;">${dati.maledizione || 'Sconosciuta'}</td>
        </tr>
      `;
    }

    content += `
          </tbody>
        </table>
      </div>
    `;

    ChatMessage.create({
      content: content,
      whisper: [game.user.id]
    });
  }

  static _gestisciIdentificazione() {
    const tokens = canvas.tokens.controlled;
    if (tokens.length === 0) {
      ui.notifications.warn("Seleziona un token per identificare i suoi cimeli!");
      return;
    }

    const actor = tokens[0].actor;
    if (!actor) {
      ui.notifications.error("Token non valido!");
      return;
    }

    this.mostraDialogoIdentificazione(actor);
  }

  static _gestisciRimozioneMaledizione() {
    const tokens = canvas.tokens.controlled;
    if (tokens.length === 0) {
      ui.notifications.warn("Seleziona un token per rimuovere le maledizioni!");
      return;
    }

    const actor = tokens[0].actor;
    if (!actor) {
      ui.notifications.error("Token non valido!");
      return;
    }

    this.tentaRimozioneMaledizione(actor);
  }

  static _mostraMaledizioni() {
    const tokens = canvas.tokens.controlled;
    if (tokens.length === 0) {
      ui.notifications.warn("Seleziona un token per vedere le sue maledizioni!");
      return;
    }

    const actor = tokens[0].actor;
    if (!actor) {
      ui.notifications.error("Token non valido!");
      return;
    }

    const maledizioni = actor.effects.filter(e => e.flags?.brancalonia?.maledizione);

    if (maledizioni.length === 0) {
      ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> non è afflitto da maledizioni.</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
      return;
    }

    let content = `
      <div class="maledizioni-attive">
        <h3>🖤 Maledizioni di ${actor.name}</h3>
        <ul>
    `;

    maledizioni.forEach(maledizione => {
      content += `<li><strong>${maledizione.name}</strong></li>`;
    });

    content += `
        </ul>
      </div>
    `;

    ChatMessage.create({
      content: content,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  /**
   * Applica effetti del cimelo
   * AGGIORNATO: Legge direttamente da implementazione.active_effects_* invece di parsare
   */
  static applicaEffetti(actor, item) {
    try {
      if (!game.settings.get(MODULE_ID, 'enableCimeliMaledetti')) return [];
      if (item.flags?.brancalonia?.categoria !== "cimelo") return [];

      const effects = [];
      
      // Leggi implementazione dal system o dai flags (compatibilità)
      const impl = item.system?.implementazione || item.flags?.brancalonia?.implementazione;
      
      if (!impl || !impl.attivo) {
        logger.debug(MODULE_NAME, `${item.name} non è attivo o manca implementazione`);
        return [];
      }

      // NUOVO: Leggi active_effects direttamente dal JSON
      if (impl.active_effects_benedizione?.length > 0) {
        effects.push({
          name: `${item.name} - Benedizione`,
          icon: item.img || "icons/magic/holy/angel-wings-gray.webp",
          origin: item.uuid,
          duration: {},
          disabled: false,
          transfer: true,
          changes: impl.active_effects_benedizione,
          flags: {
            brancalonia: {
              benedizione: true,
              cimeloId: item.id,
              tipo: impl.tipo,
              priorita: impl.priorita
            }
          }
        });
        logger.debug(MODULE_NAME, `Applicata benedizione da ${item.name}`);
      }

      if (impl.active_effects_maledizione?.length > 0) {
        effects.push({
          name: `${item.name} - Maledizione`,
          icon: "icons/magic/unholy/strike-body-explode-disintegrate.webp",
          origin: item.uuid,
          duration: {},
          disabled: false,
          transfer: true,
          changes: impl.active_effects_maledizione,
          flags: {
            brancalonia: {
              maledizione: true,
              nonRimovibile: true,
              cimeloId: item.id,
              tipo: impl.tipo,
              priorita: impl.priorita
            }
          }
        });
        logger.debug(MODULE_NAME, `Applicata maledizione da ${item.name}`);
      }

      // Inizializza tracking flags se presenti
      if (impl.tracking_flags && Object.keys(impl.tracking_flags).length > 0) {
        this._initializeTrackingFlags(actor, item, impl.tracking_flags);
      }

      // FALLBACK: Se non ci sono active_effects nel nuovo formato, prova il vecchio parsing
      if (effects.length === 0) {
        logger.warn(MODULE_NAME, `${item.name} usa vecchio formato, fallback a parsing`);
        return this._legacyParseEffetti(actor, item);
      }

      return effects;

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore applicazione effetti cimelo', error);
      return [];
    }
  }

  /**
   * Inizializza tracking flags per cimeli con trigger/contatori
   */
  static _initializeTrackingFlags(actor, item, trackingFlags) {
    try {
      const flagPath = `cimeli.${item.id}`;
      
      // Se i flags non esistono già, inizializzali
      const existingFlags = actor.getFlag(MODULE_ID, flagPath);
      if (!existingFlags) {
        actor.setFlag(MODULE_ID, flagPath, {
          ...trackingFlags,
          itemName: item.name,
          initialized: Date.now()
        });
        logger.debug(MODULE_NAME, `Inizializzati tracking flags per ${item.name}`);
      }
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore inizializzazione tracking flags', error);
    }
  }

  /**
   * LEGACY: Parsing vecchio formato (per compatibilità)
   */
  static _legacyParseEffetti(actor, item) {
    try {
      const effects = [];

      // Effetto benedizione (vecchio formato)
      if (item.flags?.brancalonia?.proprieta_originale) {
        const changes = this.parseBenedizione(item.flags.brancalonia.proprieta_originale);
        if (changes.length > 0) {
          effects.push({
            name: `${item.name} - Benedizione`,
            icon: "icons/magic/holy/angel-wings-gray.webp",
            origin: item.uuid,
            duration: {},
            disabled: false,
            transfer: true,
            changes: changes,
            flags: {
              brancalonia: {
                benedizione: true,
                legacy: true
              }
            }
          });
        }
      }

      // Effetto maledizione (vecchio formato)
      if (item.flags?.brancalonia?.maledizione) {
        const changes = this.parseMaledizione(item.flags.brancalonia.maledizione);
        if (changes.length > 0) {
          effects.push({
            name: `${item.name} - Maledizione`,
            icon: "icons/magic/unholy/silhouette-horned-evil.webp",
            origin: item.uuid,
            duration: {},
            disabled: false,
            transfer: true,
            changes: changes,
            flags: {
              brancalonia: {
                maledizione: true,
                nonRimovibile: true,
                legacy: true
              }
            }
          });
        }
      }

      return effects;
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore parsing legacy', error);
      return [];
    }
  }

  /**
   * Valida un valore di durata riusando il Data Validator se disponibile
   */
  static _isValidDurationValue(value) {
    try {
      const validator = game.brancalonia?.dataValidator;
      if (validator?._isValidDurationValue) {
        return validator._isValidDurationValue(value);
      }
    } catch (error) {
      logger.warn(MODULE_NAME, 'Impossibile delegare la validazione durata al Data Validator', error);
    }

    if (value === '' || value === null || value === undefined) return true;
    if (typeof value !== 'string') return false;
    if (!/^[0-9+\-*/%\s]*$/.test(value)) return false;
    if (/^[+\-*/%\s]+$/.test(value)) return false;
    return true;
  }

  /**
   * Converte descrizione benedizione in changes per ActiveEffect
   */
  static parseBenedizione(desc) {
    try {
      const changes = [];
      const descLower = desc.toLowerCase();

      // Esempi di parsing comuni
      if (descLower.includes("vantaggio") && descLower.includes("inganno")) {
        changes.push({
          key: "flags.dnd5e.advantage.skill.dec",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
          priority: 20
        });
      }

      if (descLower.includes("+1") && descLower.includes("carisma")) {
        changes.push({
          key: "system.abilities.cha.bonuses.check",
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: "1",
          priority: 20
        });
      }

      if (descLower.includes("resistenza") && descLower.includes("veleno")) {
        changes.push({
          key: "system.traits.dr.value",
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: "poison",
          priority: 20
        });
      }

      // Parsing più avanzato per altre benedizioni comuni
      if (descLower.includes("vantaggio") && descLower.includes("persuasione")) {
        changes.push({
          key: "flags.dnd5e.advantage.skill.per",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
          priority: 20
        });
      }

      if (descLower.includes("+2") && descLower.includes("iniziativa")) {
        changes.push({
          key: "system.attributes.init.bonus",
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: "2",
          priority: 20
        });
      }

      if (game.settings.get(MODULE_ID, 'debugCimeliMaledetti')) {
        logger.debug(MODULE_NAME, 'Benedizione parsata', { desc, changes });
      }

      return changes;

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore parsing benedizione', error);
      return [];
    }
  }

  /**
   * Converte descrizione maledizione in changes per ActiveEffect
   */
  static parseMaledizione(desc) {
    try {
      const changes = [];
      const descLower = desc.toLowerCase();

      // Esempi di parsing comuni
      if (descLower.includes("svantaggio") && descLower.includes("ts")) {
        if (descLower.includes("divini")) {
          changes.push({
            key: "flags.dnd5e.disadvantage.save.all",
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: "divini",
            priority: 20
          });
        } else {
          // Svantaggio generico ai TS
          ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(ability => {
            changes.push({
              key: `flags.dnd5e.disadvantage.save.${ability}`,
              mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
              value: "1",
              priority: 20
            });
          });
        }
      }

      if (descLower.includes("-1") && descLower.includes("forza")) {
        changes.push({
          key: "system.abilities.str.value",
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: "-1",
          priority: 20
        });
      }

      if (descLower.includes("vulnerabilità") && descLower.includes("fuoco")) {
        changes.push({
          key: "system.traits.dv.value",
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: "fire",
          priority: 20
        });
      }

      // Parsing più avanzato per altre maledizioni comuni
      if (descLower.includes("svantaggio") && descLower.includes("attacco")) {
        changes.push({
          key: "flags.dnd5e.disadvantage.attack.all",
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
          value: "1",
          priority: 20
        });
      }

      if (descLower.includes("-2") && descLower.includes("ca")) {
        changes.push({
          key: "system.attributes.ac.bonus",
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: "-2",
          priority: 20
        });
      }

      if (game.settings.get(MODULE_ID, 'debugCimeliMaledetti')) {
        logger.debug(MODULE_NAME, 'Maledizione parsata', { desc, changes });
      }

      return changes;

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore parsing maledizione', error);
      return [];
    }
  }

  /**
   * Tira per cimelo casuale
   */
  static async tiraCimelo() {
    try {
      if (!game.settings.get(MODULE_ID, 'enableCimeliMaledetti')) {
        ui.notifications.warn("Sistema Cimeli Maledetti disabilitato!");
        return null;
      }

      const roll = await new Roll("1d100").evaluate();
      await roll.toMessage({
        flavor: "Tiro Cimelo Casuale"
      });

      // Trova cimelo corrispondente
      const cimeloId = Math.min(50, Math.floor(roll.total / 2) + 1);
      const cimeloKey = String(cimeloId).padStart(3, '0');

      // Cerca nel compendium
      const pack = game.packs.get("brancalonia-bigat.equipaggiamento");
      if (!pack) {
        ui.notifications.error("Compendium equipaggiamento non trovato!");
        return null;
      }

      const items = await pack.getDocuments();
      const cimelo = items.find(i =>
        i.flags?.brancalonia?.id_originale?.startsWith(cimeloKey) ||
        i.flags?.brancalonia?.categoria === "cimelo"
      );

      if (cimelo) {
        const showCurseToPlayers = game.settings.get(MODULE_ID, 'showCursesToPlayers');
        const whisper = showCurseToPlayers ? [] : [game.user.id];

        ChatMessage.create({
          content: `<div class="brancalonia cimelo-roll">
            <h3>✨ Cimelo Trovato! ✨</h3>
            <p class="cimelo-name">${cimelo.name}</p>
            <p class="cimelo-desc">${cimelo.flags.brancalonia.storia || "Un oggetto antico avvolto nel mistero..."}</p>
            <div class="cimelo-effects">
              <p><strong>Benedizione:</strong> ${cimelo.flags.brancalonia.proprieta_originale || "Da scoprire"}</p>
              ${showCurseToPlayers || game.user.isGM ? `<p><strong>Maledizione:</strong> ${cimelo.flags.brancalonia.maledizione || "Da scoprire"}</p>` : "<p><em>La maledizione è nascosta...</em></p>"}
            </div>
            <hr>
            <p><em>Il cimelo può essere aggiunto all'inventario dal GM.</em></p>
          </div>`,
          speaker: ChatMessage.getSpeaker(),
          whisper: whisper
        });

        if (game.settings.get(MODULE_ID, 'debugCimeliMaledetti')) {
          logger.debug(MODULE_NAME, 'Cimelo generato', { name: cimelo.name, id: cimeloId });
        }

        return cimelo;
      } else {
        ui.notifications.warn("Nessun cimelo trovato per questo tiro!");
        return null;
      }

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore tiro cimelo casuale', error);
      ui.notifications.error("Errore nella generazione del cimelo!");
      return null;
    }
  }

  /**
   * Mostra dialogo per identificazione cimeli
   */
  static async mostraDialogoIdentificazione(actor) {
    try {
      const cimeli = actor.items.filter(i => i.flags?.brancalonia?.categoria === "cimelo");

      if (cimeli.length === 0) {
        ui.notifications.info(`${actor.name} non possiede cimeli da identificare.`);
        return;
      }

      let content = `
        <div class="identificazione-dialog">
          <h3>Cimeli di ${actor.name}</h3>
          <p>Seleziona un cimelo da identificare:</p>
          <select id="cimelo-select" style="width: 100%; margin: 10px 0;">
      `;

      cimeli.forEach(cimelo => {
        content += `<option value="${cimelo.id}">${cimelo.name}</option>`;
      });

      content += `
          </select>
          <p><em>L'identificazione rivelerà le proprietà nascoste del cimelo.</em></p>
        </div>
      `;

      new foundry.appv1.sheets.Dialog({
        title: "Identificazione Cimelo",
        content: content,
        buttons: {
          identify: {
            label: "Identifica",
            callback: async (html) => {
              const cimeloId = html.find('#cimelo-select').val();
              const cimelo = actor.items.get(cimeloId);
              if (cimelo) {
                await this._identificaCimelo(actor, cimelo);
              }
            }
          },
          cancel: {
            label: "Annulla"
          }
        }
      }).render(true);

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore dialogo identificazione', error);
      ui.notifications.error("Errore nell'apertura del dialogo!");
    }
  }

  static async _identificaCimelo(actor, cimelo) {
    try {
      const benedizione = cimelo.flags.brancalonia.proprieta_originale || "Proprietà sconosciuta";
      const maledizione = cimelo.flags.brancalonia.maledizione || "Maledizione sconosciuta";
      const storia = cimelo.flags.brancalonia.storia || "Storia perduta nel tempo...";

      ChatMessage.create({
        content: `<div class="identificazione-risultato">
          <h3>🔍 Identificazione Completata</h3>
          <h4>${cimelo.name}</h4>
          <div class="cimelo-storia">
            <p><strong>Storia:</strong> ${storia}</p>
          </div>
          <div class="cimelo-benedizione">
            <p><strong>Benedizione:</strong> ${benedizione}</p>
          </div>
          <div class="cimelo-maledizione">
            <p><strong>Maledizione:</strong> ${maledizione}</p>
          </div>
        </div>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore identificazione cimelo', error);
      ui.notifications.error("Errore nell'identificazione!");
    }
  }

  /**
   * Tenta di rimuovere una maledizione
   */
  static async tentaRimozioneMaledizione(actor) {
    try {
      const maledizioni = actor.effects.filter(e => e.flags?.brancalonia?.maledizione);

      if (maledizioni.length === 0) {
        ui.notifications.info(`${actor.name} non è afflitto da maledizioni.`);
        return;
      }

      // Richiede un tiro di dado per la rimozione
      const roll = await new Roll("1d20").evaluate();
      const dc = 15; // Difficoltà base

      ChatMessage.create({
        content: `<div class="rimozione-maledizione">
          <h3>✨ Tentativo Rimozione Maledizione</h3>
          <p><strong>${actor.name}</strong> tenta di liberarsi dalle maledizioni...</p>
          <p><strong>Tiro:</strong> ${roll.total} (CD ${dc})</p>
        </div>`,
        rolls: [roll],
        speaker: ChatMessage.getSpeaker({ actor })
      });

      if (roll.total >= dc) {
        // Successo - rimuovi una maledizione casuale
        const maledizioneDaRimuovere = maledizioni[Math.floor(Math.random() * maledizioni.length)];
        await actor.deleteEmbeddedDocuments("ActiveEffect", [maledizioneDaRimuovere.id]);

        ChatMessage.create({
          content: `<div class="rimozione-successo">
            <h3>✨ Maledizione Rimossa! ✨</h3>
            <p><strong>${maledizioneDaRimuovere.name}</strong> è stata rimossa da ${actor.name}!</p>
          </div>`,
          speaker: ChatMessage.getSpeaker({ actor })
        });
      } else {
        // Fallimento
        ChatMessage.create({
          content: `<div class="rimozione-fallimento">
            <h3>🖤 Tentativo Fallito</h3>
            <p>Le maledizioni si stringono più saldamente attorno a <strong>${actor.name}</strong>...</p>
          </div>`,
          speaker: ChatMessage.getSpeaker({ actor })
        });
      }

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore tentativo rimozione maledizione', error);
      ui.notifications.error("Errore nel tentativo di rimozione!");
    }
  }

  static _registerHooks() {
    try {
      // Hook per quando un cimelo viene equipaggiato
      Hooks.on("updateItem", async (item, changes, options, userId) => {
        if (!game.settings.get(MODULE_ID, 'enableCimeliMaledetti')) return;
        if (!item.parent || item.parent.documentName !== "Actor") return;
        if (item.flags?.brancalonia?.categoria !== "cimelo") return;
        if (changes.system?.equipped === undefined) return;

        const actor = item.parent;

        if (changes.system.equipped) {
          // Equipaggiato - applica effetti
          if (game.settings.get(MODULE_ID, 'autoApplyCimeliEffects')) {
            const effects = this.applicaEffetti(actor, item);
            if (effects.length > 0) {
              await actor.createEmbeddedDocuments("ActiveEffect", effects);

              ChatMessage.create({
                content: `<div class="brancalonia cimelo-equipped">
                  <h3>✨ ${item.name} Equipaggiato ✨</h3>
                  <p class="warning">⚠️ La maledizione è ora attiva!</p>
                  <p><em>Gli effetti sono stati applicati automaticamente.</em></p>
                </div>`,
                speaker: ChatMessage.getSpeaker({ actor }),
                whisper: game.settings.get(MODULE_ID, 'showCursesToPlayers') ? [] : [game.user.id]
              });
            }
          }
        } else {
          // Non equipaggiato - rimuovi solo benedizione (maledizione resta!)
          const effects = actor.effects.filter(e =>
            e.origin === item.uuid && !e.flags?.brancalonia?.maledizione
          );

          if (effects.length > 0) {
            const ids = effects.map(e => e.id);
            await actor.deleteEmbeddedDocuments("ActiveEffect", ids);
          }

          // Avvisa che la maledizione persiste
          const cursed = actor.effects.find(e =>
            e.origin === item.uuid && e.flags?.brancalonia?.maledizione
          );

          if (cursed) {
            ChatMessage.create({
              content: `<div class="brancalonia cimelo-curse">
                <h3>🖤 Maledizione Persistente!</h3>
                <p>La maledizione di <strong>${item.name}</strong> continua a tormentarti...</p>
                <p class="hint">Solo magia potente può rimuovere questa maledizione</p>
              </div>`,
              speaker: ChatMessage.getSpeaker({ actor }),
              whisper: game.settings.get(MODULE_ID, 'showCursesToPlayers') ? [] : [game.user.id]
            });
          }
        }
      });

      // Hook per identificazione cimeli - Version-aware
      const systemVersion = parseFloat(game.system?.version || '0');
      const hookName = systemVersion >= 5.0 ? 'renderItemSheetV2' : 'renderItemSheet5e';

      Hooks.on(hookName, (app, html, data) => {
        if (!game.settings.get(MODULE_ID, 'enableCimeliMaledetti')) return;

        const item = app.object;

        // Check if item exists and has flags
        if (!item || !item.flags?.brancalonia?.categoria) return;
        if (item.flags.brancalonia.categoria !== "cimelo") return;

        // Mostra info cimelo
        const cimeloInfo = `
          <div class="brancalonia-cimelo-info">
            <h3 class="cimelo-header">⚖️ Cimelo Maledetto ⚖️</h3>
            <div class="cimelo-story">
              <label>Storia:</label>
              <p>${item.flags.brancalonia.storia || "Sconosciuta"}</p>
            </div>
            <div class="cimelo-blessing">
              <label>Benedizione:</label>
              <p>${item.flags.brancalonia.proprieta_originale || "Da scoprire"}</p>
            </div>
            <div class="cimelo-curse">
              <label>Maledizione:</label>
              <p>${item.flags.brancalonia.maledizione || "Da scoprire"}</p>
            </div>
          </div>`;

        const tabDetails = html.querySelector(".tab.details");
        if (tabDetails) {
          tabDetails.insertAdjacentHTML('afterbegin', cimeloInfo);
        }
      });

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore registrazione hook cimeli', error);
    }
  }

  static _addCustomStyles() {
    try {
      // Aggiungi CSS personalizzato
      const style = document.createElement("style");
      style.innerHTML = `
        .brancalonia-cimelo-info {
          background: linear-gradient(135deg, #f4e4c1 0%, #e8d4a1 100%);
          border: 2px solid #8b4513;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
          box-shadow: 0 2px 4px rgba(139, 69, 19, 0.3);
        }

        .cimelo-header {
          color: #5c3317;
          text-align: center;
          font-family: serif;
          margin-bottom: 10px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }

        .cimelo-story {
          font-style: italic;
          color: #6b4423;
          margin-bottom: 8px;
          padding: 8px;
          background: rgba(255,255,255,0.5);
          border-radius: 4px;
        }

        .cimelo-blessing {
          color: #2e7d32;
          margin-bottom: 8px;
          padding: 8px;
          background: rgba(76, 175, 80, 0.1);
          border-left: 3px solid #4caf50;
        }

        .cimelo-curse {
          color: #b71c1c;
          padding: 8px;
          background: rgba(244, 67, 54, 0.1);
          border-left: 3px solid #f44336;
        }

        .brancalonia.cimelo-roll {
          background: #f4e4c1;
          border: 2px solid #8b4513;
          padding: 12px;
          border-radius: 8px;
        }

        .cimelo-name {
          font-size: 1.2em;
          font-weight: bold;
          color: #5c3317;
          margin: 8px 0;
        }

        .cimelo-desc {
          font-style: italic;
          color: #6b4423;
          margin-bottom: 10px;
        }

        .cimelo-effects {
          border-top: 1px solid #8b4513;
          padding-top: 8px;
        }

        .brancalonia.cimelo-equipped .warning {
          color: #ff6b35;
          font-weight: bold;
          animation: pulse 2s infinite;
        }

        .brancalonia.cimelo-curse {
          background: linear-gradient(135deg, #ffebee 0%, #ef9a9a 100%);
          border: 2px solid #c62828;
          padding: 12px;
          border-radius: 8px;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }

        .identificazione-risultato {
          background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%);
          border: 2px solid #4caf50;
          padding: 12px;
          border-radius: 8px;
        }

        .rimozione-maledizione {
          background: linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%);
          border: 2px solid #ff9800;
          padding: 12px;
          border-radius: 8px;
        }

        .rimozione-successo {
          background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%);
          border: 2px solid #4caf50;
          padding: 12px;
          border-radius: 8px;
        }

        .rimozione-fallimento {
          background: linear-gradient(135deg, #ffebee 0%, #ef9a9a 100%);
          border: 2px solid #c62828;
          padding: 12px;
          border-radius: 8px;
        }
      `;
      document.head.appendChild(style);

      if (game.settings.get(MODULE_ID, 'debugCimeliMaledetti')) {
        logger.debug(MODULE_NAME, 'Stili CSS cimeli applicati');
      }

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore aggiunta stili CSS', error);
    }
  }


}

// Inizializza il sistema
Hooks.once("init", () => {
  try {
    CimeliMaledetti.initialize();
  } catch (error) {
    logger.error(MODULE_NAME, 'Errore critico inizializzazione CimeliMaledetti', error);
    ui.notifications.error("Errore nel caricamento del sistema cimeli maledetti!");
  }
});

// Aggiungi CSS e crea macro quando pronto
Hooks.once("ready", async () => {
  CimeliMaledetti._addCustomStyles();
  CimeliMaledetti._createAutomaticMacros();
  // Inizializza il database dei cimeli ORA che i compendium sono disponibili
  await CimeliMaledetti._initCimeli();
  logger.info(MODULE_NAME, 'Sistema Cimeli Maledetti pronto');
});

// Rendi disponibile globalmente
window.BrancaloniaCimeli = CimeliMaledetti;
window.CimeliMaledetti = CimeliMaledetti;

// Export per uso come modulo
export { CimeliMaledetti };