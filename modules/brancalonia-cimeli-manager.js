/**
 * Brancalonia Cimeli Manager
 * Gestisce macro e interazioni per i Cimeli Maledetti
 * 
 * Sistema unificato per:
 * - Contatori usi (giornalieri/totali)
 * - Trigger e saving throw
 * - Macro utente per azioni rapide
 * - Reset giornalieri automatici
 */

import logger from './brancalonia-logger.js';

const MODULE_ID = 'brancalonia-bigat';
const MODULE_NAME = 'CimeliManager';

export default class CimeliManager {

  /**
   * Inizializzazione del sistema
   */
  static initialize() {
    try {
      logger.info(MODULE_NAME, 'Inizializzazione Cimeli Manager');

      // Registra settings
      this._registerSettings();

      // Registra hooks
      this._registerHooks();

      // Registra macro globali
      this._registerGlobalMacros();

      // Sistema di reset giornaliero
      this._setupDailyReset();

      logger.info(MODULE_NAME, 'Cimeli Manager inizializzato con successo');
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore durante inizializzazione', error);
    }
  }

  /**
   * Registra settings per il sistema
   */
  static _registerSettings() {
    try {
      // Timestamp ultimo reset giornaliero
      game.settings.register(MODULE_ID, 'lastCimeliDailyReset', {
        name: 'Ultimo Reset Cimeli',
        scope: 'world',
        config: false,
        type: Number,
        default: 0
      });

      // Debug Cimeli Maledetti
      game.settings.register(MODULE_ID, 'debugCimeliMaledetti', {
        name: 'Debug Cimeli Maledetti',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
      });

      logger.info(MODULE_NAME, 'Settings registrati');
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore registrazione settings', error);
    }
  }

  /**
   * Registra hooks per eventi Foundry
   */
  static _registerHooks() {
    // Hook per nuovi attori
    Hooks.on('createActor', async (actor) => {
      await this._initializeActorFlags(actor);
    });

    // Hook per equipaggiamento cimeli
    Hooks.on('updateItem', async (item, changes, options, userId) => {
      if (changes.system?.equipped !== undefined && item.flags?.brancalonia?.categoria === 'cimelo') {
        await this._onCimeloEquipped(item, changes.system.equipped);
      }
    });
  }

  /**
   * Inizializza flags per un nuovo attore
   */
  static async _initializeActorFlags(actor) {
    try {
      const existing = actor.getFlag(MODULE_ID, 'cimeli');
      if (!existing) {
        await actor.setFlag(MODULE_ID, 'cimeli', {
          lastDailyReset: 0,
          items: {}
        });
        logger.info(MODULE_NAME, `Inizializzati flags cimeli per ${actor.name}`);
      }
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore inizializzazione flags', error);
    }
  }

  /**
   * Gestisce equipaggiamento/rimozione cimeli
   */
  static async _onCimeloEquipped(item, equipped) {
    try {
      const impl = item.system?.implementazione;
      if (!impl || impl.tipo === 'narrativo') return;

      const actor = item.parent;
      if (!actor) return;

      if (equipped) {
        if (game.settings.get(MODULE_ID, 'debugCimeliMaledetti')) {
          ui.notifications.info(`✨ ${item.name} equipaggiato!`);
        }
        
        // Mostra reminder se presente
        if (impl.ui_config?.warningText) {
          ui.notifications.warn(impl.ui_config.warningText);
        }
      }
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore equipaggiamento cimelo', error);
    }
  }

  /**
   * Registra macro globali disponibili
   */
  static _registerGlobalMacros() {
    // Rendi disponibile globalmente
    game.brancalonia = game.brancalonia || {};
    game.brancalonia.cimeli = {
      consumeUse: this.consumeUse.bind(this),
      resetDaily: this.resetDailyFlags.bind(this),
      checkUses: this.checkUses.bind(this),
      
      // Macro specifiche
      drinkBoccale: this.drinkBoccale.bind(this),
      rerollDice: this.rerollDice.bind(this),
      checkResurrection: this.checkResurrection.bind(this),
      forceRollResult: this.forceRollResult.bind(this)
    };

    logger.info(MODULE_NAME, 'Macro globali registrate in game.brancalonia.cimeli');
  }

  /**
   * Setup reset giornaliero automatico
   */
  static _setupDailyReset() {
    // Hook per passaggio di tempo nel mondo
    Hooks.on('updateWorldTime', async (worldTime, dt) => {
      await this._checkDailyReset();
    });

    logger.info(MODULE_NAME, 'Sistema reset giornaliero attivo');
  }

  /**
   * Controlla e esegue reset giornalieri
   */
  static async _checkDailyReset() {
    try {
      const now = game.time.worldTime;
      const lastReset = game.settings.get(MODULE_ID, 'lastCimeliDailyReset') || 0;
      
      // 86400 secondi = 1 giorno
      if (now - lastReset >= 86400) {
        await this.resetDailyFlags();
        await game.settings.set(MODULE_ID, 'lastCimeliDailyReset', now);
        
        ChatMessage.create({
          content: '<div class="brancalonia-notification"><h3>🌅 Alba</h3><p>I cimeli con usi giornalieri sono stati ripristinati.</p></div>',
          whisper: game.users.filter(u => u.isGM).map(u => u.id)
        });
      }
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore reset giornaliero', error);
    }
  }

  /**
   * Reset di tutti i contatori giornalieri
   */
  static async resetDailyFlags() {
    try {
      for (const actor of game.actors) {
        const cimeliFlags = actor.getFlag(MODULE_ID, 'cimeli');
        if (!cimeliFlags) continue;

        for (const [itemId, flags] of Object.entries(cimeliFlags.items || {})) {
          if (flags.resetPeriod === 'day') {
            await actor.setFlag(MODULE_ID, `cimeli.items.${itemId}.currentUsesDaily`, flags.maxUsesDaily || 1);
            await actor.setFlag(MODULE_ID, `cimeli.items.${itemId}.lastReset`, Date.now());
          }
        }

        await actor.setFlag(MODULE_ID, 'cimeli.lastDailyReset', Date.now());
      }

      logger.info(MODULE_NAME, 'Reset giornaliero completato');
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore durante reset', error);
    }
  }

  /**
   * Consuma un uso di un cimelo
   */
  static async consumeUse(actor, itemId) {
    try {
      const item = actor.items.get(itemId);
      if (!item) {
        ui.notifications.error('Cimelo non trovato!');
        return false;
      }

      const flags = actor.getFlag(MODULE_ID, `cimeli.items.${itemId}`);
      if (!flags) {
        ui.notifications.error('Flags cimelo non inizializzati!');
        return false;
      }

      // Controlla usi disponibili
      if (flags.currentUsesDaily !== undefined) {
        if (flags.currentUsesDaily <= 0) {
          ui.notifications.warn(`${item.name}: Nessun uso giornaliero rimanente!`);
          return false;
        }
        await actor.setFlag(MODULE_ID, `cimeli.items.${itemId}.currentUsesDaily`, flags.currentUsesDaily - 1);
      }

      if (flags.currentUsesTotal !== undefined) {
        if (flags.currentUsesTotal <= 0) {
          ui.notifications.error(`${item.name}: Nessun uso totale rimanente!`);
          return false;
        }
        await actor.setFlag(MODULE_ID, `cimeli.items.${itemId}.currentUsesTotal`, flags.currentUsesTotal - 1);

        // Controlla se esaurito
        if (flags.currentUsesTotal - 1 <= 0 && flags.onDeplete) {
          await this._handleDepletion(actor, item, flags);
        }
      }

      // One-shot
      if (flags.trackingType === 'one_shot_lifetime' && !flags.used) {
        await actor.setFlag(MODULE_ID, `cimeli.items.${itemId}.used`, true);
      }

      ui.notifications.info(`${item.name}: Uso consumato!`);
      return true;
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore consumo uso', error);
      return false;
    }
  }

  /**
   * Gestisce esaurimento cimelo
   */
  static async _handleDepletion(actor, item, flags) {
    try {
      if (flags.onDeplete === 'item_destroyed') {
        ChatMessage.create({
          content: `<div class="brancalonia-notification warning"><h3>💥 ${item.name}</h3><p>${flags.depleteMessage || 'Il cimelo si è esaurito e distrutto!'}</p></div>`,
          speaker: ChatMessage.getSpeaker({ actor })
        });

        // Rimuovi item dopo un delay
        setTimeout(async () => {
          await actor.deleteEmbeddedDocuments('Item', [item.id]);
        }, 2000);
      } else if (flags.onDeplete === 'item_powerless') {
        ChatMessage.create({
          content: `<div class="brancalonia-notification warning"><h3>⚪ ${item.name}</h3><p>${flags.depleteMessage || 'Il cimelo ha perso i suoi poteri magici!'}</p></div>`,
          speaker: ChatMessage.getSpeaker({ actor })
        });

        // Disattiva implementazione
        await item.update({ 'system.implementazione.attivo': false });
      }
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore gestione esaurimento', error);
    }
  }

  /**
   * Controlla usi rimanenti
   */
  static checkUses(actor, itemId) {
    try {
      const item = actor.items.get(itemId);
      if (!item) return null;

      const flags = actor.getFlag(MODULE_ID, `cimeli.items.${itemId}`);
      if (!flags) return null;

      return {
        daily: flags.currentUsesDaily,
        maxDaily: flags.maxUsesDaily,
        total: flags.currentUsesTotal,
        maxTotal: flags.maxUsesTotal,
        used: flags.used
      };
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore check usi', error);
      return null;
    }
  }

  // ========================================
  // MACRO SPECIFICHE PER CIMELI
  // ========================================

  /**
   * #003 - Il Boccale del Gigante Ubriacone
   */
  static async drinkBoccale(actor) {
    try {
      const boccale = actor.items.find(i => i.id === '003' || i.name.includes('Boccale'));
      if (!boccale) {
        ui.notifications.warn('Non possiedi il Boccale del Gigante Ubriacone!');
        return;
      }

      const flags = actor.getFlag(MODULE_ID, `cimeli.items.${boccale.id}`) || {};
      const currentSips = flags.currentSips || 0;

      // Incrementa sorsi
      await actor.setFlag(MODULE_ID, `cimeli.items.${boccale.id}.currentSips`, currentSips + 1);

      ChatMessage.create({
        content: `<div class="brancalonia-action"><h3>🍺 ${actor.name} beve dal Boccale</h3><p>Sorso ${currentSips + 1}/3</p></div>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });

      // Dopo 3 sorsi: TS Costituzione
      if (currentSips + 1 >= 3) {
        const roll = await actor.rollAbilitySave('con', { targetValue: 15 });
        
        if (roll.total < 15) {
          // Fallimento: applica condizione Ubriaco
          const ubriaco = CONFIG.statusEffects.find(e => e.id === 'ubriaco');
          if (ubriaco) {
            await actor.toggleEffect(ubriaco);
            ChatMessage.create({
              content: `<div class="brancalonia-notification warning"><h3>🍺 ${actor.name} è Ubriaco!</h3><p>TS Costituzione fallito (${roll.total} vs 15)</p></div>`,
              speaker: ChatMessage.getSpeaker({ actor })
            });
          }
        } else {
          ChatMessage.create({
            content: `<div class="brancalonia-notification success"><h3>✅ ${actor.name} regge l'alcol</h3><p>TS Costituzione superato (${roll.total} vs 15)</p></div>`,
            speaker: ChatMessage.getSpeaker({ actor })
          });
        }

        // Reset sorsi
        await actor.setFlag(MODULE_ID, `cimeli.items.${boccale.id}.currentSips`, 0);
      } else if (currentSips + 1 === 2) {
        ui.notifications.warn('⚠️ Prossimo sorso richiede TS CON CD 15!');
      }
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore drinkBoccale', error);
    }
  }

  /**
   * #016 - Il Quadrifoglio Appassito / #028 - Ferro di Cavallo
   */
  static async rerollDice(actor, itemId) {
    try {
      const item = actor.items.get(itemId);
      if (!item) {
        ui.notifications.error('Cimelo non trovato!');
        return;
      }

      // Controlla usi
      const canUse = await this.consumeUse(actor, itemId);
      if (!canUse) return;

      ui.notifications.info(`✨ ${item.name}: Puoi ritirare un dado!`);
      
      ChatMessage.create({
        content: `<div class="brancalonia-action"><h3>🍀 ${item.name}</h3><p>${actor.name} usa il potere del cimelo per ritirare un tiro!</p></div>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });

      // Nota: il reroll effettivo deve essere gestito dal giocatore
      // Questo è solo il tracking dell'uso
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore rerollDice', error);
    }
  }

  /**
   * #031 - La Moneta del Traghettatore
   */
  static async checkResurrection(actor) {
    try {
      const moneta = actor.items.find(i => i.id === '031' || i.name.includes('Moneta del Traghettatore'));
      if (!moneta) return;

      const flags = actor.getFlag(MODULE_ID, `cimeli.items.${moneta.id}`);
      if (!flags || flags.used) return;

      // Controlla se attore è a 0 HP
      if (actor.system.attributes.hp.value <= 0) {
        // Resurrezione!
        await actor.update({ 'system.attributes.hp.value': 1 });
        await actor.setFlag(MODULE_ID, `cimeli.items.${moneta.id}.used`, true);

        ChatMessage.create({
          content: `<div class="brancalonia-notification epic"><h3>💀➡️✨ RESURREZIONE!</h3><p><strong>${actor.name}</strong> torna in vita grazie alla <strong>Moneta del Traghettatore</strong>!</p><p>La moneta perde il suo potere.</p></div>`,
          speaker: ChatMessage.getSpeaker({ actor })
        });

        ui.notifications.info(`${actor.name} è tornato in vita! (1 HP)`);
      }
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore checkResurrection', error);
    }
  }

  /**
   * #043 - Il Dado del Destino
   */
  static async forceRollResult(actor) {
    try {
      const dado = actor.items.find(i => i.id === '043' || i.name.includes('Dado del Destino'));
      if (!dado) {
        ui.notifications.warn('Non possiedi il Dado del Destino!');
        return;
      }

      const flags = actor.getFlag(MODULE_ID, `cimeli.items.${dado.id}`);
      if (flags && flags.used) {
        ui.notifications.error('Il Dado del Destino è già stato utilizzato!');
        return;
      }

      // Dialog per scegliere il risultato
      new foundry.appv1.sheets.Dialog({
        title: '🎲 Dado del Destino',
        content: `
          <div class="brancalonia-dialog">
            <h3>⚠️ ATTENZIONE</h3>
            <p>Puoi decidere il risultato di UN tiro di dado d20.</p>
            <p><strong>Questa azione è IRREVERSIBILE e può essere usata UNA SOLA VOLTA NELLA VITA!</strong></p>
            <div class="form-group">
              <label>Scegli il risultato (1-20):</label>
              <input type="number" id="forced-result" min="1" max="20" value="20" />
            </div>
          </div>
        `,
        buttons: {
          confirm: {
            icon: '<i class="fas fa-dice-d20"></i>',
            label: 'Usa il Dado del Destino',
            callback: async (html) => {
              const result = parseInt(html.find('#forced-result').val());
              
              if (result < 1 || result > 20) {
                ui.notifications.error('Risultato non valido!');
                return;
              }

              // Consuma uso
              await actor.setFlag(MODULE_ID, `cimeli.items.${dado.id}.used`, true);
              await dado.update({ 'system.implementazione.attivo': false });

              ChatMessage.create({
                content: `<div class="brancalonia-notification epic"><h3>🎲 DADO DEL DESTINO</h3><p><strong>${actor.name}</strong> forza il risultato del tiro: <strong class="fate-result">${result}</strong>!</p><p>Il dado perde il suo potere e diventa un normale d20.</p></div>`,
                speaker: ChatMessage.getSpeaker({ actor })
              });

              ui.notifications.info(`Dado del Destino usato! Risultato: ${result}`);
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Annulla'
          }
        },
        default: 'cancel'
      }).render(true);

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore forceRollResult', error);
    }
  }
}

// Hook per resurrection automatica
Hooks.on('updateActor', async (actor, changes, options, userId) => {
  if (changes.system?.attributes?.hp?.value !== undefined) {
    if (changes.system.attributes.hp.value <= 0) {
      await CimeliManager.checkResurrection(actor);
    }
  }
});

// Inizializza il sistema
Hooks.once("ready", () => {
  try {
    CimeliManager.initialize();
  } catch (error) {
    logger.error(MODULE_NAME, 'Errore critico inizializzazione CimeliManager', error);
    ui.notifications.error("Errore nel caricamento del sistema gestione cimeli!");
  }
});

