/**
 * BRANCALONIA DATA VALIDATOR
 * Sistema automatico per correggere errori di validazione Foundry VTT
 * Identifica e corregge valori di durata non validi nelle attività
 */

import logger from './brancalonia-logger.js';

class BrancaloniaDataValidator {
  static ID = 'brancalonia-bigat';
  static VALIDATION_ISSUES = [];
  static STATISTICS = {
    totalChecked: 0,
    totalFixed: 0,
    actorsFixed: 0,
    itemsFixed: 0,
    compendiumsFixed: 0,
    lastRun: null
  };

  static initialize() {
    logger.info('BrancaloniaDataValidator', 'Inizializzazione correttore validazione dati');

    // Registra hook per correzione automatica
    this._registerHooks();

    // Salva istanza globale
    game.brancalonia = game.brancalonia || {};
    game.brancalonia.dataValidator = this;

    logger.info('BrancaloniaDataValidator', 'Correttore validazione dati pronto');
  }

  static _registerHooks() {
    // Hook per correzione durante caricamento mondo
    // TEMPORANEAMENTE DISABILITATO - causa crash con dati malformati
    /*
    Hooks.once('ready', async () => {
      logger.info('BrancaloniaDataValidator', 'Eseguendo correzione validazione completa al ready');
      await this._validateAndFixAllData();
    });
    */

    // Hook per correzione quando vengono creati nuovi attori
    Hooks.on('createActor', async (actor) => {
      await this._validateActorData(actor);
    });

    // Hook per correzione quando vengono aggiornati attori esistenti
    Hooks.on('updateActor', async (actor, changes) => {
      if (changes.system?.activities) {
        await this._validateActorActivities(actor);
      }
    });

    // Hook per correzione quando vengono creati nuovi item
    Hooks.on('createItem', async (item) => {
      if (item.parent && item.system?.activities) {
        await this._validateItemActivities(item, item.parent);
      }
    });

    // Hook per correzione errori di validazione globali
    // TEMPORANEAMENTE DISABILITATO - causa loop infinito con dati malformati
    /*
    Hooks.on('error', (error) => {
      if (error.name === 'DataModelValidationError') {
        this._handleValidationError(error);
      }
    });
    */
  }

  /**
   * Corregge errori di validazione in tutti i dati di gioco
   */
  static async _validateAndFixAllData() {
    logger.info('BrancaloniaDataValidator', 'Iniziando validazione completa dati');

    // Reset statistiche
    this.STATISTICS = {
      totalChecked: 0,
      totalFixed: 0,
      actorsFixed: 0,
      itemsFixed: 0,
      compendiumsFixed: 0,
      lastRun: Date.now()
    };

    let fixesApplied = 0;

    // Controlla tutti gli attori
    const actorFixes = await this._validateAllActors();
    fixesApplied += actorFixes;
    this.STATISTICS.actorsFixed = actorFixes;

    // Controlla tutti i compendi
    const compendiumFixes = await this._validateAllCompendiums();
    fixesApplied += compendiumFixes;
    this.STATISTICS.compendiumsFixed = compendiumFixes;

    this.STATISTICS.totalFixed = fixesApplied;

    if (fixesApplied > 0) {
      logger.warn('BrancaloniaDataValidator', `${fixesApplied} errori di validazione corretti`);
      ui.notifications.info(`✅ Corretto ${fixesApplied} errori di validazione dati`);
      
      // Log statistiche
      logger.info('BrancaloniaDataValidator', 'Statistiche correzione:', this.STATISTICS);
    } else {
      logger.info('BrancaloniaDataValidator', 'Nessun errore di validazione trovato');
    }

    return fixesApplied;
  }

  /**
   * Valida e corregge tutti gli attori
   */
  static async _validateAllActors() {
    let fixes = 0;
    const actors = game.actors.contents;

    for (const actor of actors) {
      if (actor.type === 'character' || actor.type === 'npc') {
        fixes += await this._validateActorData(actor);
      }
    }

    return fixes;
  }

  /**
   * Valida e corregge tutti i compendi
   */
  static async _validateAllCompendiums() {
    let fixes = 0;
    
    // Filtra solo compendi del modulo Brancalonia con type Item
    const packs = game.packs.filter(p => 
      p.metadata.packageName === 'brancalonia-bigat' && 
      p.metadata.type === 'Item'
    );

    logger.info('BrancaloniaDataValidator', `Validazione di ${packs.length} compendi Brancalonia`);

    for (const pack of packs) {
      try {
        const packFixes = await this._validateCompendiumItems(pack);
        fixes += packFixes;
        
        if (packFixes > 0) {
          logger.info('BrancaloniaDataValidator', `Corretto ${packFixes} errori nel compendio ${pack.metadata.label}`);
        }
      } catch (error) {
        logger.warn('BrancaloniaDataValidator', `Errore validazione compendio ${pack.metadata.label}:`, error);
      }
    }

    return fixes;
  }

  /**
   * Valida e corregge dati di un singolo attore
   */
  static async _validateActorData(actor) {
    let fixes = 0;

    try {
      fixes += await this._validateActorActivities(actor);
      fixes += await this._validateActorItems(actor);
    } catch (error) {
      logger.error('BrancaloniaDataValidator', `Errore validazione attore ${actor.name}:`, error);
    }

    return fixes;
  }

  /**
   * Valida se un valore di durata è corretto
   */
  static _isValidDurationValue(value) {
    // Vuoto/null/undefined è sempre valido
    if (value === '' || value === null || value === undefined) return true;
    
    // Deve essere una stringa
    if (typeof value !== 'string') return false;
    
    // Solo numeri e operatori matematici
    if (!/^[0-9+\-*/%\s]*$/.test(value)) return false;
    
    // Non può essere solo operatori o spazi
    if (/^[+\-*/%\s]+$/.test(value)) return false;
    
    // Valido
    return true;
  }

  /**
   * Valida e corregge attività di un attore
   */
  static async _validateActorActivities(actor) {
    let fixes = 0;

    if (!actor.system?.activities) return fixes;

    this.STATISTICS.totalChecked++;

    for (const [activityId, activity] of Object.entries(actor.system.activities)) {
      if (activity.type === 'utility' && activity.duration?.value !== undefined) {
        const durationValue = activity.duration.value;

        // Usa la nuova validazione migliorata
        if (!this._isValidDurationValue(durationValue)) {
          logger.warn('BrancaloniaDataValidator', `Valore durata non valido trovato in ${actor.name} (${activityId}): "${durationValue}"`);

          // Correggi il valore
          const updatedActivities = { ...actor.system.activities };
          updatedActivities[activityId] = {
            ...activity,
            duration: {
              ...activity.duration,
              value: '' // Imposta valore vuoto valido
            }
          };

          try {
            await actor.update({
              'system.activities': updatedActivities
            });

            fixes++;
            this.STATISTICS.itemsFixed++;
            logger.info('BrancaloniaDataValidator', `Corretto valore durata in ${actor.name} (${activityId}): "${durationValue}" → ""`);
          } catch (error) {
            logger.error('BrancaloniaDataValidator', `Errore correzione attività ${activityId}:`, error);
          }
        }
      }
    }

    return fixes;
  }

  /**
   * Valida e corregge item di un attore
   */
  static async _validateActorItems(actor) {
    let fixes = 0;

    for (const item of actor.items.contents) {
      if (item.system?.activities) {
        fixes += await this._validateItemActivities(item, actor);
      }
    }

    return fixes;
  }

  /**
   * Valida e corregge attività di un item
   */
  static async _validateItemActivities(item, actor) {
    let fixes = 0;

    if (!item.system?.activities) return fixes;

    this.STATISTICS.totalChecked++;

    for (const [activityId, activity] of Object.entries(item.system.activities)) {
      if (activity.type === 'utility' && activity.duration?.value !== undefined) {
        const durationValue = activity.duration.value;

        // Usa la nuova validazione migliorata
        if (!this._isValidDurationValue(durationValue)) {
          const ownerName = actor ? actor.name : 'Sconosciuto';
          logger.warn('BrancaloniaDataValidator', `Valore durata non valido in item ${item.name} (${ownerName}) (${activityId}): "${durationValue}"`);

          const updatedActivities = { ...item.system.activities };
          updatedActivities[activityId] = {
            ...activity,
            duration: {
              ...activity.duration,
              value: ''
            }
          };

          try {
            await item.update({
              'system.activities': updatedActivities
            });

            fixes++;
            this.STATISTICS.itemsFixed++;
            logger.info('BrancaloniaDataValidator', `Corretto valore durata in item ${item.name} (${activityId}): "${durationValue}" → ""`);
          } catch (error) {
            logger.error('BrancaloniaDataValidator', `Errore correzione item ${item.name}:`, error);
          }
        }
      }
    }

    return fixes;
  }

  /**
   * Valida e corregge item in un compendio
   */
  static async _validateCompendiumItems(pack) {
    let fixes = 0;

    try {
      const items = await pack.getDocuments();

      for (const item of items) {
        if (item.system?.activities) {
          fixes += await this._validateCompendiumItemActivities(item, pack);
        }
      }
    } catch (error) {
      logger.warn('BrancaloniaDataValidator', `Errore accesso compendio ${pack.metadata.label}:`, error);
    }

    return fixes;
  }

  /**
   * Valida e corregge attività di un item in compendio
   */
  static async _validateCompendiumItemActivities(item, pack) {
    let fixes = 0;

    if (!item.system?.activities) return fixes;

    this.STATISTICS.totalChecked++;

    for (const [activityId, activity] of Object.entries(item.system.activities)) {
      if (activity.type === 'utility' && activity.duration?.value !== undefined) {
        const durationValue = activity.duration.value;

        // Usa la nuova validazione migliorata
        if (!this._isValidDurationValue(durationValue)) {
          logger.warn('BrancaloniaDataValidator', `Valore durata non valido nel compendio ${pack.metadata.label} (${item.name}): "${durationValue}"`);

          const updatedActivities = { ...item.system.activities };
          updatedActivities[activityId] = {
            ...activity,
            duration: {
              ...activity.duration,
              value: ''
            }
          };

          try {
            await item.update({
              'system.activities': updatedActivities
            });

            fixes++;
            logger.info('BrancaloniaDataValidator', `Corretto valore durata nel compendio ${item.name} (${activityId}): "${durationValue}" → ""`);
          } catch (error) {
            logger.error('BrancaloniaDataValidator', `Errore correzione item nel compendio ${item.name}:`, error);
          }
        }
      }
    }

    return fixes;
  }

  /**
   * Gestisce errori di validazione globali
   */
  static _handleValidationError(error) {
    logger.error('BrancaloniaDataValidator', 'Errore validazione rilevato:', error);

    // Controlla se è un errore di durata
    // TEMPORANEAMENTE DISABILITATO - causa loop infinito
    /*
    if (error.message && error.message.includes('duration') && error.message.includes('value')) {
      logger.warn('BrancaloniaDataValidator', 'Errore durata rilevato - eseguendo correzione automatica');

      // Esegui correzione automatica dopo un breve delay
      setTimeout(async () => {
        await this._validateAndFixAllData();
      }, 1000);
    }
    */
  }

  /**
   * Verifica se ci sono problemi di validazione attivi
   */
  static async checkForValidationIssues() {
    logger.info('BrancaloniaDataValidator', 'Controllando problemi di validazione...');

    const issues = [];
    let totalChecked = 0;

    // Controlla attori
    const actors = game.actors.contents;
    for (const actor of actors) {
      if (actor.type === 'character' || actor.type === 'npc') {
        totalChecked++;

        if (actor.system?.activities) {
          for (const [activityId, activity] of Object.entries(actor.system.activities)) {
            if (activity.type === 'utility' && activity.duration?.value !== undefined) {
              const durationValue = activity.duration.value;

              // Usa validazione migliorata
              if (!this._isValidDurationValue(durationValue)) {
                issues.push({
                  type: 'actor',
                  actor: actor.name,
                  activityId,
                  item: 'N/A',
                  currentValue: durationValue
                });
              }
            }
          }
        }

        // Controlla item dell'attore
        for (const item of actor.items.contents) {
          if (item.system?.activities) {
            for (const [activityId, activity] of Object.entries(item.system.activities)) {
              if (activity.type === 'utility' && activity.duration?.value !== undefined) {
                const durationValue = activity.duration.value;

                // Usa validazione migliorata
                if (!this._isValidDurationValue(durationValue)) {
                  issues.push({
                    type: 'item',
                    actor: actor.name,
                    item: item.name,
                    activityId,
                    currentValue: durationValue
                  });
                }
              }
            }
          }
        }
      }
    }

    this.VALIDATION_ISSUES = issues;

    logger.info('BrancaloniaDataValidator', `Controllati ${totalChecked} attori, trovati ${issues.length} problemi`);

    return issues;
  }

  /**
   * Restituisce statistiche di validazione
   */
  static getStatistics() {
    return {
      ...this.STATISTICS,
      currentIssues: this.VALIDATION_ISSUES.length
    };
  }

  /**
   * Mostra report statistiche in console
   */
  static showStatistics() {
    const stats = this.getStatistics();
    
    logger.group('📊 Brancalonia Data Validator - Statistiche');
    logger.info('BrancaloniaDataValidator', `🔍 Documenti controllati: ${stats.totalChecked}`);
    logger.info('BrancaloniaDataValidator', `✅ Correzioni applicate: ${stats.totalFixed}`);
    logger.info('BrancaloniaDataValidator', `👤 Attori corretti: ${stats.actorsFixed}`);
    logger.info('BrancaloniaDataValidator', `📦 Item corretti: ${stats.itemsFixed}`);
    logger.info('BrancaloniaDataValidator', `📚 Compendi corretti: ${stats.compendiumsFixed}`);
    logger.info('BrancaloniaDataValidator', `⚠️ Problemi attuali: ${stats.currentIssues}`);
    logger.info(
      'BrancaloniaDataValidator',
      `🕐 Ultimo controllo: ${stats.lastRun ? new Date(stats.lastRun).toLocaleString('it-IT') : 'Mai'}`
    );
    logger.groupEnd();

    return stats;
  }

  /**
   * Corregge tutti i problemi di validazione trovati
   */
  static async fixAllValidationIssues() {
    logger.info('BrancaloniaDataValidator', 'Correggendo tutti i problemi di validazione...');

    const issues = await this.checkForValidationIssues();
    let fixesApplied = 0;

    for (const issue of issues) {
      try {
        if (issue.type === 'actor') {
          const actor = game.actors.getName(issue.actor);
          if (actor && actor.system?.activities?.[issue.activityId]) {
            const activity = actor.system.activities[issue.activityId];
            const updatedActivities = { ...actor.system.activities };
            updatedActivities[issue.activityId] = {
              ...activity,
              duration: { ...activity.duration, value: '' }
            };

            await actor.update({ 'system.activities': updatedActivities });
            fixesApplied++;
          }
        } else if (issue.type === 'item') {
          const actor = game.actors.getName(issue.actor);
          if (actor) {
            const item = actor.items.find(i => i.name === issue.item);
            if (item && item.system?.activities?.[issue.activityId]) {
              const activity = item.system.activities[issue.activityId];
              const updatedActivities = { ...item.system.activities };
              updatedActivities[issue.activityId] = {
                ...activity,
                duration: { ...activity.duration, value: '' }
              };

              await item.update({ 'system.activities': updatedActivities });
              fixesApplied++;
            }
          }
        }
      } catch (error) {
        logger.error('BrancaloniaDataValidator', `Errore correzione issue:`, error);
      }
    }

    logger.info('BrancaloniaDataValidator', `Corretto ${fixesApplied}/${issues.length} problemi`);
    return fixesApplied;
  }
}

// Registrazione globale
window.BrancaloniaDataValidator = BrancaloniaDataValidator;

// Hook per inizializzazione
Hooks.once('init', () => {
  try {
    BrancaloniaDataValidator.initialize();
  } catch (error) {
    logger.error('BrancaloniaDataValidator', 'Errore inizializzazione:', error);
  }
});

// Esporta per uso modulare
export { BrancaloniaDataValidator };
