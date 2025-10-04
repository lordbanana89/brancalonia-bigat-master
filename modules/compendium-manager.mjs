/**
 * @fileoverview Brancalonia Compendium Manager - Sistema Centralizzato
 * 
 * Gestore completo dei compendi Brancalonia con funzionalità avanzate:
 * - Sblocco automatico compendi
 * - Editor inline con backup automatico
 * - Import/Export JSON (singolo e batch)
 * - Sistema backup e ripristino
 * - Context menu personalizzato
 * - Toolbar integration
 * - Console commands
 * 
 * @version 2.0.0
 * @author Brancalonia Module Team
 * @requires brancalonia-logger.js
 */

import { logger } from './brancalonia-logger.js';

/**
 * @typedef {Object} CompendiumStatistics
 * @property {number} initTime - Tempo inizializzazione (ms)
 * @property {number} packsUnlocked - Pack sbloccati
 * @property {number} documentsEdited - Documenti modificati
 * @property {number} documentsDuplicated - Documenti duplicati
 * @property {number} documentsExported - Documenti esportati
 * @property {number} documentsDeleted - Documenti eliminati
 * @property {number} backupsCreated - Backup creati
 * @property {number} backupsRestored - Backup ripristinati
 * @property {number} importsCompleted - Import completati
 * @property {number} exportsCompleted - Export completati
 * @property {number} packsCompiled - Pack ricompilati
 * @property {number} contextMenuOpened - Context menu aperti
 * @property {number} toolsDialogOpened - Dialog tools aperti
 * @property {number} consoleCommands - Comandi console eseguiti
 * @property {Object<string, number>} operationsByType - Operazioni per tipo
 * @property {number} averageOperationTime - Tempo medio operazioni (ms)
 * @property {Array<{type: string, message: string, timestamp: number}>} errors - Lista errori
 */

/**
 * @typedef {Object} PackInfo
 * @property {string} id - ID del pack
 * @property {string} label - Label del pack
 * @property {string} type - Tipo (Actor, Item, etc)
 * @property {boolean} locked - Se locked
 * @property {number} size - Numero elementi
 */

/**
 * @typedef {Object} BackupData
 * @property {string} id - ID backup
 * @property {string} documentId - ID documento originale
 * @property {string} documentName - Nome documento
 * @property {Object} data - Dati backup
 * @property {number} timestamp - Timestamp creazione
 */

/**
 * Compendium Manager - Sistema Centralizzato Gestione Compendi
 * 
 * Fornisce gestione completa dei compendi Brancalonia con:
 * - Sblocco automatico, editing inline, backup, import/export
 * - Statistics tracking, event emission, error handling
 * 
 * @class CompendiumManager
 */
export class CompendiumManager {
  static VERSION = '2.0.0';
  static MODULE_NAME = 'Compendium Manager';
  static ID = 'brancalonia-bigat';
  static FLAGS = {
    UNLOCKED: 'unlocked',
    BACKUP: 'backup',
    EDIT_MODE: 'editMode'
  };
  
  /**
   * @type {CompendiumStatistics}
   */
  static statistics = {
    initTime: 0,
    packsUnlocked: 0,
    documentsEdited: 0,
    documentsDuplicated: 0,
    documentsExported: 0,
    documentsDeleted: 0,
    backupsCreated: 0,
    backupsRestored: 0,
    importsCompleted: 0,
    exportsCompleted: 0,
    packsCompiled: 0,
    contextMenuOpened: 0,
    toolsDialogOpened: 0,
    consoleCommands: 0,
    operationsByType: {
      quickEdit: 0,
      duplicate: 0,
      export: 0,
      delete: 0,
      backup: 0,
      restore: 0,
      import: 0,
      compile: 0
    },
    averageOperationTime: 0,
    errors: []
  };
  
  /**
   * @private
   * @type {{initialized: boolean}}
   */
  static _state = {
    initialized: false
  };

  /**
   * Inizializza il Compendium Manager
   * @static
   * @returns {void}
   * @fires compendium:initialized
   */
  static initialize() {
    logger.startPerformance('compendium-init');
    logger.info(this.MODULE_NAME, `Inizializzazione Compendium Manager v${this.VERSION}...`);

    try {
      // Registra impostazioni
      this.registerSettings();

      // Hook per sblocco automatico
      Hooks.on('renderCompendium', this._onRenderCompendium.bind(this));
      logger.debug(this.MODULE_NAME, 'Hook renderCompendium registrato');

      // Hook per context menu
      Hooks.on('getCompendiumEntryContext', this._addContextOptions.bind(this));
      logger.debug(this.MODULE_NAME, 'Hook getCompendiumEntryContext registrato');

      // Hook per sbloccare automaticamente i pack Brancalonia
      Hooks.once('ready', () => {
        this.unlockBrancaloniaPacks();
        this.registerConsoleCommands();
      });
      logger.debug(this.MODULE_NAME, 'Hook ready registrato');

      // Hook per toolbar editing
      Hooks.on('renderCompendiumDirectory', this._addToolbarButton.bind(this));
      logger.debug(this.MODULE_NAME, 'Hook renderCompendiumDirectory registrato');
      
      this._state.initialized = true;
      
      const initTime = logger.endPerformance('compendium-init');
      this.statistics.initTime = initTime;

      logger.info(this.MODULE_NAME, `✅ Compendium Manager inizializzato in ${initTime?.toFixed(2)}ms`);
      
      // Emit event
      logger.events.emit('compendium:initialized', {
        version: this.VERSION,
        initTime,
        timestamp: Date.now()
      });
      
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore inizializzazione', error);
      this.statistics.errors.push({
        type: 'initialization',
        message: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * Registra settings del modulo
   * @static
   * @private
   * @returns {void}
   */
  static registerSettings() {
    logger.debug(this.MODULE_NAME, 'Registrazione settings...');
    
    try {
      game.settings.register(this.ID, 'autoUnlock', {
        name: 'Sblocco Automatico Compendi',
        hint: 'Sblocca automaticamente tutti i compendi Brancalonia',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
          logger.info(this.MODULE_NAME, `Setting autoUnlock cambiato: ${value}`);
          if (value) this.unlockBrancaloniaPacks();
        }
      });

      game.settings.register(this.ID, 'enableEditor', {
        name: 'Abilita Editor Inline',
        hint: 'Permette modifica diretta degli elementi nei compendi',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      game.settings.register(this.ID, 'autoBackup', {
        name: 'Backup Automatico',
        hint: 'Crea backup automatici prima delle modifiche',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });
      
      logger.info(this.MODULE_NAME, '✅ 3 settings registrati');
      
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore registrazione settings', error);
      this.statistics.errors.push({
        type: 'settings-registration',
        message: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * Sblocca tutti i pack Brancalonia
   * @static
   * @async
   * @returns {Promise<void>}
   * @fires compendium:packs-unlocked
   */
  static async unlockBrancaloniaPacks() {
    if (!game.user.isGM) {
      logger.warn(this.MODULE_NAME, 'unlockBrancaloniaPacks: Solo GM può sbloccare pack');
      return;
    }

    const autoUnlock = game.settings.get(this.ID, 'autoUnlock');
    if (!autoUnlock) {
      logger.debug(this.MODULE_NAME, 'autoUnlock disabilitato, skip');
      return;
    }

    logger.startPerformance('unlock-packs');
    logger.info(this.MODULE_NAME, '🔓 Sblocco automatico compendi Brancalonia...');

    try {
      let unlockedCount = 0;
      
      for (let pack of game.packs) {
        // Sblocca solo i pack del modulo Brancalonia
        if (pack.metadata.packageName === this.ID) {
          if (pack.locked) {
            await pack.configure({ locked: false });
            logger.info(this.MODULE_NAME, `✅ Sbloccato: ${pack.metadata.label}`);
            unlockedCount++;
            this.statistics.packsUnlocked++;
          } else {
            logger.debug(this.MODULE_NAME, `Pack già sbloccato: ${pack.metadata.label}`);
          }
          // Note: Compendium packs don't support setFlag in Foundry v13
          // Unlocking is sufficient
        }
      }
      
      const unlockTime = logger.endPerformance('unlock-packs');
      logger.info(this.MODULE_NAME, `✅ ${unlockedCount} compendi sbloccati in ${unlockTime?.toFixed(2)}ms`);

      ui.notifications.info(`Compendi Brancalonia sbloccati! (${unlockedCount})`);
      
      // Emit event
      logger.events.emit('compendium:packs-unlocked', {
        count: unlockedCount,
        unlockTime,
        timestamp: Date.now()
      });
      
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore sblocco pack', error);
      this.statistics.errors.push({
        type: 'unlock-packs',
        message: error.message,
        timestamp: Date.now()
      });
      ui.notifications.error('Errore nello sblocco dei compendi');
      throw error;
    }
  }

  /**
   * Aggiunge opzioni personalizzate al context menu
   * @static
   * @private
   * @param {HTMLElement} html - HTML element
   * @param {Array} options - Opzioni context menu
   * @returns {void}
   */
  static _addContextOptions(html, options) {
    try {
      const enableEditor = game.settings.get(this.ID, 'enableEditor');
      if (!enableEditor || !game.user.isGM) {
        logger.debug(this.MODULE_NAME, 'Context menu skip: editor disabled o non-GM');
        return;
      }
      
      logger.debug(this.MODULE_NAME, 'Aggiunta opzioni context menu');
      this.statistics.contextMenuOpened++;

    // Quick Edit
    options.unshift({
      name: '✏️ Modifica Rapida',
      icon: '<i class="fas fa-edit"></i>',
      callback: li => {
        const pack = game.packs.get(li.data('pack'));
        const id = li.data('document-id');
        this.quickEditDocument(pack, id);
      }
    });

    // Duplicate
    options.push({
      name: '📋 Duplica',
      icon: '<i class="fas fa-copy"></i>',
      callback: li => {
        const pack = game.packs.get(li.data('pack'));
        const id = li.data('document-id');
        this.duplicateDocument(pack, id);
      }
    });

    // Export to JSON
    options.push({
      name: '💾 Esporta JSON',
      icon: '<i class="fas fa-download"></i>',
      callback: li => {
        const pack = game.packs.get(li.data('pack'));
        const id = li.data('document-id');
        this.exportDocumentJSON(pack, id);
      }
    });

      // Delete with confirmation
      const deleteIndex = options.findIndex(o => o.name === 'Delete');
      if (deleteIndex > -1) {
        options[deleteIndex] = {
          name: '🗑️ Elimina',
          icon: '<i class="fas fa-trash"></i>',
          callback: li => {
            const pack = game.packs.get(li.data('pack'));
            const id = li.data('document-id');
            this.deleteWithConfirmation(pack, id);
          }
        };
      }
      
      logger.debug(this.MODULE_NAME, `✅ 4 opzioni context menu aggiunte`);
      
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore aggiunta context menu options', error);
      this.statistics.errors.push({
        type: 'context-menu',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Modifica rapida di un documento
   */
  static async quickEditDocument(pack, id) {
    const doc = await pack.getDocument(id);
    if (!doc) return;

    const content = `
      <form class="brancalonia-compendium-edit">
        <div class="form-group">
          <label>Nome</label>
          <input type="text" name="name" value="${doc.name}" />
        </div>
        <div class="form-group">
          <label>Descrizione</label>
          <textarea name="description" rows="10">${doc.system?.description?.value || ''}</textarea>
        </div>
        ${this._getTypeSpecificFields(doc)}
      </form>
    `;

    new foundry.appv1.sheets.Dialog({
      title: `Modifica: ${doc.name}`,
      content: content,
      buttons: {
        save: {
          icon: '<i class="fas fa-save"></i>',
          label: 'Salva',
          callback: async (html) => {
            const formData = new FormDataExtended(html.find('form')[0]);
            const updateData = formData.object;

            // Backup se abilitato
            if (game.settings.get(this.ID, 'autoBackup')) {
              await this.backupDocument(pack, doc);
            }

            // Applica modifiche
            await doc.update(updateData);
            ui.notifications.info(`${doc.name} modificato con successo!`);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Annulla'
        }
      },
      default: 'save',
      render: html => {
        // Attiva editor TinyMCE se disponibile
        if (window.tinyMCE) {
          html.find('textarea').each((i, el) => {
            TextEditor.create({
              target: el,
              save_onsavecallback: () => {}
            });
          });
        }
      }
    }, {
      width: 600,
      height: 'auto'
    }).render(true);
  }

  /**
   * Campi specifici per tipo di documento
   */
  static _getTypeSpecificFields(doc) {
    let fields = '';

    if (doc.documentName === 'Item') {
      // Campi per Item
      fields += `
        <div class="form-group">
          <label>Tipo</label>
          <select name="type">
            ${Object.entries(CONFIG.Item.typeLabels)
              .map(([k, v]) => `<option value="${k}" ${doc.type === k ? 'selected' : ''}>${v}</option>`)
              .join('')}
          </select>
        </div>
      `;

      if (doc.type === 'weapon' || doc.type === 'equipment') {
        fields += `
          <div class="form-group">
            <label>Prezzo (mo)</label>
            <input type="number" name="system.price.value" value="${doc.system.price?.value || 0}" />
          </div>
          <div class="form-group">
            <label>Peso</label>
            <input type="number" name="system.weight" value="${doc.system.weight || 0}" step="0.1" />
          </div>
        `;
      }
    } else if (doc.documentName === 'Actor') {
      // Campi per Actor
      fields += `
        <div class="form-group">
          <label>Livello/GS</label>
          <input type="number" name="system.details.cr" value="${doc.system.details?.cr || 0}" />
        </div>
        <div class="form-group">
          <label>PF</label>
          <input type="number" name="system.attributes.hp.max" value="${doc.system.attributes?.hp?.max || 0}" />
        </div>
      `;
    } else if (doc.documentName === 'JournalEntry') {
      // Per Journal entries
      fields += `
        <div class="form-group">
          <label>Contenuto</label>
          <textarea name="content" rows="15">${doc.pages?.[0]?.text?.content || ''}</textarea>
        </div>
      `;
    }

    return fields;
  }

  /**
   * Duplica un documento
   */
  static async duplicateDocument(pack, id) {
    const doc = await pack.getDocument(id);
    if (!doc) return;

    const newName = `${doc.name} (Copia)`;
    const createData = doc.toObject();
    createData.name = newName;
    delete createData._id;

    const newDoc = await pack.documentClass.create(createData, { pack: pack.collection });
    ui.notifications.info(`Creato: ${newName}`);
  }

  /**
   * Esporta documento in JSON
   */
  static async exportDocumentJSON(pack, id) {
    const doc = await pack.getDocument(id);
    if (!doc) return;

    const data = doc.toObject();
    // Usa slugify globale invece del metodo String.prototype
    const filename = `${globalThis.slugify ? globalThis.slugify(doc.name) : doc.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;

    saveDataToFile(JSON.stringify(data, null, 2), 'text/json', filename);
    ui.notifications.info(`Esportato: ${filename}`);
  }

  /**
   * Elimina con conferma
   */
  static async deleteWithConfirmation(pack, id) {
    const doc = await pack.getDocument(id);
    if (!doc) return;

    const confirm = await Dialog.confirm({
      title: 'Conferma Eliminazione',
      content: `<p>Sei sicuro di voler eliminare <strong>${doc.name}</strong>?</p>
                <p class="dialog-warning">⚠️ Questa azione non può essere annullata!</p>`,
      yes: () => true,
      no: () => false
    });

    if (confirm) {
      // Backup prima di eliminare
      if (game.settings.get(this.ID, 'autoBackup')) {
        await this.backupDocument(pack, doc);
      }

      await doc.delete();
      ui.notifications.warn(`Eliminato: ${doc.name}`);
    }
  }

  /**
   * Crea backup di un documento
   */
  static async backupDocument(pack, doc) {
    const backup = {
      timestamp: new Date().toISOString(),
      packId: pack.collection,
      document: doc.toObject()
    };

    const backups = game.settings.get(this.ID, 'backups') || [];
    backups.push(backup);

    // Mantieni solo ultimi 50 backup
    if (backups.length > 50) {
      backups.shift();
    }

    await game.settings.set(this.ID, 'backups', backups);
    logger.info(this.MODULE_NAME, `📦 Backup creato per: ${doc.name}`);
  }

  /**
   * Aggiunge bottone toolbar
   */
  static _addToolbarButton(app, html) {
    if (!game.user.isGM) return;

    // In Foundry v13, html può essere HTMLElement o jQuery
    const $html = html instanceof jQuery ? html : $(html);

    const button = $(`
      <button class="brancalonia-compendium-tools">
        <i class="fas fa-toolbox"></i> Strumenti
      </button>
    `);

    button.click(() => this.showToolsDialog());

    $html.find('.directory-header .header-actions').append(button);
  }

  /**
   * Mostra dialog strumenti
   */
  static showToolsDialog() {
    const content = `
      <div class="brancalonia-tools">
        <h3>Strumenti Compendium</h3>
        <div class="tool-buttons">
          <button class="tool-btn" data-action="unlock-all">
            <i class="fas fa-unlock"></i> Sblocca Tutti
          </button>
          <button class="tool-btn" data-action="lock-all">
            <i class="fas fa-lock"></i> Blocca Tutti
          </button>
          <button class="tool-btn" data-action="export-all">
            <i class="fas fa-file-export"></i> Esporta Tutti
          </button>
          <button class="tool-btn" data-action="import-json">
            <i class="fas fa-file-import"></i> Importa JSON
          </button>
          <button class="tool-btn" data-action="view-backups">
            <i class="fas fa-history"></i> Vedi Backup
          </button>
          <button class="tool-btn" data-action="compile-all">
            <i class="fas fa-hammer"></i> Ricompila Pack
          </button>
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: 'Strumenti Compendium Brancalonia',
      content: content,
      buttons: {
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Chiudi'
        }
      },
      render: html => {
        html.find('.tool-btn').click(async (event) => {
          const action = $(event.currentTarget).data('action');
          await this.handleToolAction(action);
          dialog.close();
        });
      }
    }, {
      width: 400
    });

    dialog.render(true);
  }

  /**
   * Gestisce azioni strumenti
   */
  static async handleToolAction(action) {
    switch(action) {
      case 'unlock-all':
        for (let pack of game.packs) {
          if (pack.metadata.packageName === this.ID && pack.locked) {
            await pack.configure({ locked: false });
          }
        }
        ui.notifications.info('Tutti i compendi sbloccati!');
        break;

      case 'lock-all':
        for (let pack of game.packs) {
          if (pack.metadata.packageName === this.ID && !pack.locked) {
            await pack.configure({ locked: true });
          }
        }
        ui.notifications.info('Tutti i compendi bloccati!');
        break;

      case 'export-all':
        await this.exportAllPacks();
        break;

      case 'import-json':
        await this.showImportDialog();
        break;

      case 'view-backups':
        await this.showBackupsDialog();
        break;

      case 'compile-all':
        await this.compileAllPacks();
        break;
    }
  }

  /**
   * Esporta tutti i pack
   */
  static async exportAllPacks() {
    const exportData = {};

    for (let pack of game.packs) {
      if (pack.metadata.packageName === this.ID) {
        const documents = await pack.getDocuments();
        exportData[pack.metadata.name] = documents.map(d => d.toObject());
      }
    }

    const filename = `brancalonia-compendiums-${Date.now()}.json`;
    saveDataToFile(JSON.stringify(exportData, null, 2), 'text/json', filename);

    ui.notifications.info(`Esportati tutti i compendi in ${filename}`);
  }

  /**
   * Dialog per import
   */
  static async showImportDialog() {
    new foundry.appv1.sheets.Dialog({
      title: 'Importa da JSON',
      content: `
        <form>
          <div class="form-group">
            <label>File JSON</label>
            <input type="file" name="import-file" accept=".json" />
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" name="merge" />
              Unisci con esistenti (invece di sovrascrivere)
            </label>
          </div>
        </form>
      `,
      buttons: {
        import: {
          icon: '<i class="fas fa-file-import"></i>',
          label: 'Importa',
          callback: async (html) => {
            const file = html.find('input[type="file"]')[0].files[0];
            const merge = html.find('input[name="merge"]').prop('checked');

            if (file) {
              await this.importFromFile(file, merge);
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Annulla'
        }
      },
      default: 'import'
    }).render(true);
  }

  /**
   * Importa da file
   */
  static async importFromFile(file, merge = false) {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        let imported = 0;

        for (let [packName, documents] of Object.entries(data)) {
          const pack = game.packs.get(`${this.ID}.${packName}`);
          if (!pack) continue;

          if (!merge) {
            // Cancella esistenti
            const existing = await pack.getDocuments();
            for (let doc of existing) {
              await doc.delete();
            }
          }

          // Importa nuovi
          for (let docData of documents) {
            delete docData._id;
            await pack.documentClass.create(docData, { pack: pack.collection });
            imported++;
          }
        }

        ui.notifications.info(`Importati ${imported} documenti!`);
      } catch (err) {
        ui.notifications.error(`Errore import: ${err.message}`);
      }
    };

    reader.readAsText(file);
  }

  /**
   * Mostra dialog backup
   */
  static async showBackupsDialog() {
    const backups = game.settings.get(this.ID, 'backups') || [];

    const content = backups.length ? `
      <div class="backup-list">
        ${backups.slice(-10).reverse().map((b, i) => `
          <div class="backup-item">
            <strong>${b.document.name}</strong>
            <em>(${new Date(b.timestamp).toLocaleString()})</em>
            <button class="restore-btn" data-index="${backups.length - 1 - i}">
              <i class="fas fa-undo"></i> Ripristina
            </button>
          </div>
        `).join('')}
      </div>
    ` : '<p>Nessun backup disponibile</p>';

    new foundry.appv1.sheets.Dialog({
      title: 'Backup Documenti',
      content: content,
      buttons: {
        clear: {
          icon: '<i class="fas fa-trash"></i>',
          label: 'Cancella Tutti',
          callback: async () => {
            await game.settings.set(this.ID, 'backups', []);
            ui.notifications.info('Backup cancellati');
          }
        },
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Chiudi'
        }
      },
      render: html => {
        html.find('.restore-btn').click(async (event) => {
          const index = parseInt($(event.currentTarget).data('index'));
          await this.restoreBackup(backups[index]);
        });
      }
    }, {
      width: 500,
      height: 400
    }).render(true);
  }

  /**
   * Ripristina backup
   */
  static async restoreBackup(backup) {
    const pack = game.packs.get(backup.packId);
    if (!pack) {
      ui.notifications.error('Compendium non trovato!');
      return;
    }

    await pack.documentClass.create(backup.document, { pack: pack.collection });
    ui.notifications.info(`Ripristinato: ${backup.document.name}`);
  }

  /**
   * Compila tutti i pack
   */
  static async compileAllPacks() {
    ui.notifications.info('Compilazione pack in corso...');

    for (let pack of game.packs) {
      if (pack.metadata.packageName === this.ID) {
        // Forza ricompilazione
        await pack.getIndex({ cache: false });
        logger.info(this.MODULE_NAME, `✅ Ricompilato: ${pack.metadata.label}`);
      }
    }

    ui.notifications.info('Pack ricompilati con successo!');
  }

  /**
   * Registra comandi console
   */
  static registerConsoleCommands() {
    // Sblocca pack specifico
    window.unlockPack = async (packName) => {
      this.statistics.consoleCommands++;
      const pack = game.packs.get(`${this.ID}.${packName}`);
      if (pack) {
        await pack.configure({ locked: false });
        logger.info(this.MODULE_NAME, `✅ Sbloccato: ${packName}`);
      } else {
        logger.error(this.MODULE_NAME, `❌ Pack non trovato: ${packName}`);
      }
    };

    // Conta elementi nei pack
    window.countPackItems = async () => {
      this.statistics.consoleCommands++;
      for (let pack of game.packs) {
        if (pack.metadata.packageName === this.ID) {
          const count = pack.index.size;
          logger.info(this.MODULE_NAME, `${pack.metadata.label}: ${count} elementi`);
        }
      }
    };

    // Cerca in tutti i pack
    window.searchPacks = async (searchTerm) => {
      this.statistics.consoleCommands++;
      const results = [];

      for (let pack of game.packs) {
        if (pack.metadata.packageName === this.ID) {
          const docs = await pack.getDocuments();
          const matches = docs.filter(d =>
            d.name.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (matches.length) {
            results.push({
              pack: pack.metadata.label,
              matches: matches.map(m => m.name)
            });
          }
        }
      }

      logger.table(results);
      return results;
    };

    logger.info(this.MODULE_NAME, '📚 Comandi console Compendium registrati:');
    logger.info(this.MODULE_NAME, '  - unlockPack(packName)');
    logger.info(this.MODULE_NAME, '  - countPackItems()');
    logger.info(this.MODULE_NAME, '  - searchPacks(searchTerm)');
  }

  /**
   * Hook per rendering compendium
   * @static
   * @private
   * @param {Application} app - Compendium application
   * @param {jQuery} html - HTML element
   * @param {Object} data - Render data
   * @returns {void}
   */
  static _onRenderCompendium(app, html, data) {
    try {
      if (!game.user.isGM) return;
      if (!app?.metadata?.packageName) return;

      // Aggiungi indicatore di stato
      if (app.metadata.packageName === this.ID) {
        const locked = app.locked;
        const indicator = $(`
          <span class="lock-indicator" title="${locked ? 'Bloccato' : 'Sbloccato'}">
            <i class="fas fa-${locked ? 'lock' : 'unlock'}"></i>
          </span>
        `);

        html.find('.window-title').append(indicator);
        logger.debug(this.MODULE_NAME, `Indicatore stato aggiunto: ${app.metadata.label}`);
      }
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore onRenderCompendium', error);
    }
  }
  
  // =================================================================
  // PUBLIC API
  // =================================================================

  /**
   * Ottiene lo status corrente del Compendium Manager
   * @static
   * @returns {Object} Status completo
   * @example
   * const status = CompendiumManager.getStatus();
   * console.log('Pack sbloccati:', status.packsUnlocked);
   */
  static getStatus() {
    return {
      version: this.VERSION,
      initialized: this._state.initialized,
      packsUnlocked: this.statistics.packsUnlocked,
      documentsEdited: this.statistics.documentsEdited,
      documentsDuplicated: this.statistics.documentsDuplicated,
      documentsExported: this.statistics.documentsExported,
      documentsDeleted: this.statistics.documentsDeleted,
      backupsCreated: this.statistics.backupsCreated,
      backupsRestored: this.statistics.backupsRestored,
      importsCompleted: this.statistics.importsCompleted,
      exportsCompleted: this.statistics.exportsCompleted,
      packsCompiled: this.statistics.packsCompiled,
      averageOperationTime: this.statistics.averageOperationTime,
      errors: this.statistics.errors.length
    };
  }

  /**
   * Ottiene le statistiche complete del Compendium Manager
   * @static
   * @returns {CompendiumStatistics} Statistiche complete
   * @example
   * const stats = CompendiumManager.getStatistics();
   * console.log('Operazioni per tipo:', stats.operationsByType);
   */
  static getStatistics() {
    return {
      ...this.statistics
    };
  }

  /**
   * Ottiene lista di tutti i pack Brancalonia
   * @static
   * @returns {Array<PackInfo>} Array pack info
   * @example
   * const packs = CompendiumManager.getBrancaloniaPacks();
   * packs.forEach(p => console.log(`${p.label}: ${p.size} elementi`));
   */
  static getBrancaloniaPacks() {
    try {
      const packs = [];
      for (let pack of game.packs) {
        if (pack.metadata.packageName === this.ID) {
          packs.push({
            id: pack.collection,
            label: pack.metadata.label,
            type: pack.metadata.type,
            locked: pack.locked,
            size: pack.index.size
          });
        }
      }
      return packs;
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore getBrancaloniaPacks', error);
      return [];
    }
  }

  /**
   * Ottiene informazioni dettagliate di un pack
   * @static
   * @param {string} packId - ID del pack
   * @returns {PackInfo|null} Info pack o null
   * @example
   * const info = CompendiumManager.getPackInfo('brancalonia-bigat.items');
   * if (info) console.log(`${info.label}: ${info.size} elementi`);
   */
  static getPackInfo(packId) {
    try {
      const pack = game.packs.get(packId);
      if (!pack) {
        logger.warn(this.MODULE_NAME, `Pack ${packId} non trovato`);
        return null;
      }
      
      return {
        id: pack.collection,
        label: pack.metadata.label,
        type: pack.metadata.type,
        locked: pack.locked,
        size: pack.index.size,
        packageName: pack.metadata.packageName
      };
    } catch (error) {
      logger.error(this.MODULE_NAME, `Errore getPackInfo ${packId}`, error);
      return null;
    }
  }

  /**
   * Sblocca un pack specifico via API
   * @static
   * @async
   * @param {string} packName - Nome del pack
   * @returns {Promise<boolean>} True se sbloccato con successo
   * @example
   * const success = await CompendiumManager.unlockPackViaAPI('brancalonia-bigat.items');
   */
  static async unlockPackViaAPI(packName) {
    try {
      logger.info(this.MODULE_NAME, `API: Sblocco pack ${packName}`);
      
      const pack = game.packs.get(packName);
      if (!pack) {
        logger.warn(this.MODULE_NAME, `Pack ${packName} non trovato`);
        return false;
      }
      
      if (!pack.locked) {
        logger.debug(this.MODULE_NAME, `Pack ${packName} già sbloccato`);
        return true;
      }
      
      await pack.configure({ locked: false });
      this.statistics.packsUnlocked++;
      
      logger.info(this.MODULE_NAME, `✅ Pack ${packName} sbloccato via API`);
      return true;
      
    } catch (error) {
      logger.error(this.MODULE_NAME, `Errore unlockPackViaAPI ${packName}`, error);
      return false;
    }
  }

  /**
   * Esporta un pack specifico in JSON via API
   * @static
   * @async
   * @param {string} packName - Nome del pack
   * @returns {Promise<Object|null>} Dati esportati o null
   * @example
   * const data = await CompendiumManager.exportPackViaAPI('brancalonia-bigat.items');
   * if (data) console.log(`Esportati ${data.documents.length} documenti`);
   */
  static async exportPackViaAPI(packName) {
    try {
      logger.info(this.MODULE_NAME, `API: Export pack ${packName}`);
      
      const pack = game.packs.get(packName);
      if (!pack) {
        logger.warn(this.MODULE_NAME, `Pack ${packName} non trovato`);
        return null;
      }
      
      const documents = await pack.getDocuments();
      const exportData = {
        packId: pack.collection,
        packLabel: pack.metadata.label,
        packType: pack.metadata.type,
        timestamp: Date.now(),
        documents: documents.map(doc => doc.toObject())
      };
      
      this.statistics.exportsCompleted++;
      this.statistics.operationsByType.export++;
      
      logger.info(this.MODULE_NAME, `✅ Esportati ${documents.length} documenti da ${packName}`);
      return exportData;
      
    } catch (error) {
      logger.error(this.MODULE_NAME, `Errore exportPackViaAPI ${packName}`, error);
      return null;
    }
  }

  /**
   * Ottiene lista di tutti i backup esistenti
   * @static
   * @returns {Array<BackupData>} Array backup
   * @example
   * const backups = CompendiumManager.getBackupsList();
   * console.log(`${backups.length} backup disponibili`);
   */
  static getBackupsList() {
    try {
      const backups = game.settings.get(this.ID, 'backups') || [];
      return backups.map(b => ({
        id: b.id,
        documentId: b.documentId,
        documentName: b.documentName,
        timestamp: b.timestamp,
        packId: b.packId
      }));
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore getBackupsList', error);
      return [];
    }
  }

  /**
   * Resetta le statistiche del Compendium Manager
   * @static
   * @returns {void}
   * @example
   * CompendiumManager.resetStatistics();
   */
  static resetStatistics() {
    logger.info(this.MODULE_NAME, 'Reset statistiche Compendium Manager');

    const initTime = this.statistics.initTime;

    this.statistics = {
      initTime,
      packsUnlocked: 0,
      documentsEdited: 0,
      documentsDuplicated: 0,
      documentsExported: 0,
      documentsDeleted: 0,
      backupsCreated: 0,
      backupsRestored: 0,
      importsCompleted: 0,
      exportsCompleted: 0,
      packsCompiled: 0,
      contextMenuOpened: 0,
      toolsDialogOpened: 0,
      consoleCommands: 0,
      operationsByType: {
        quickEdit: 0,
        duplicate: 0,
        export: 0,
        delete: 0,
        backup: 0,
        restore: 0,
        import: 0,
        compile: 0
      },
      averageOperationTime: 0,
      errors: []
    };

    logger.info(this.MODULE_NAME, 'Statistiche resettate');
  }

  /**
   * Mostra un report completo dello stato del sistema nella console
   * @static
   * @returns {Object} Status e statistiche (per uso programmatico)
   * @example
   * CompendiumManager.showReport();
   */
  static showReport() {
    const stats = this.getStatistics();
    const status = this.getStatus();
    const packs = this.getBrancaloniaPacks();

    logger.group('📚 Brancalonia Compendium Manager - Report');

    logger.info(this.MODULE_NAME, 'VERSION:', this.VERSION);
    logger.info(this.MODULE_NAME, 'Initialized:', status.initialized);

    logger.group('📊 Statistics');
    logger.table([
      { Metric: 'Init Time', Value: `${stats.initTime?.toFixed(2)}ms` },
      { Metric: 'Packs Sbloccati', Value: stats.packsUnlocked },
      { Metric: 'Documenti Modificati', Value: stats.documentsEdited },
      { Metric: 'Documenti Duplicati', Value: stats.documentsDuplicated },
      { Metric: 'Documenti Esportati', Value: stats.documentsExported },
      { Metric: 'Documenti Eliminati', Value: stats.documentsDeleted },
      { Metric: 'Backup Creati', Value: stats.backupsCreated },
      { Metric: 'Backup Ripristinati', Value: stats.backupsRestored },
      { Metric: 'Import Completati', Value: stats.importsCompleted },
      { Metric: 'Export Completati', Value: stats.exportsCompleted },
      { Metric: 'Pack Ricompilati', Value: stats.packsCompiled },
      { Metric: 'Context Menu Aperti', Value: stats.contextMenuOpened },
      { Metric: 'Tools Dialog Aperti', Value: stats.toolsDialogOpened },
      { Metric: 'Comandi Console', Value: stats.consoleCommands },
      { Metric: 'Avg Operation Time', Value: `${stats.averageOperationTime.toFixed(2)}ms` },
      { Metric: 'Errors', Value: stats.errors.length }
    ]);
    logger.groupEnd();

    logger.group('🔧 Operazioni Per Tipo');
    logger.table(Object.entries(stats.operationsByType).map(([type, count]) => ({
      Tipo: type,
      Count: count
    })));
    logger.groupEnd();

    logger.group('📦 Pack Brancalonia');
    if (packs.length === 0) {
      logger.info(this.MODULE_NAME, 'Nessun pack Brancalonia trovato');
    } else {
      logger.table(packs.map(p => ({
        Label: p.label,
        Tipo: p.type,
        Locked: p.locked ? '🔒' : '🔓',
        Elementi: p.size
      })));
    }
    logger.groupEnd();

    if (stats.errors.length > 0) {
      logger.group('🐛 Errors (Last 5)');
      stats.errors.slice(-5).forEach((err, i) => {
        logger.error(this.MODULE_NAME, `Error ${i + 1}:`, err.type, '-', err.message);
      });
      logger.groupEnd();
    }

    logger.groupEnd();

    return { status, stats, packs };
  }
}

// Inizializza quando il modulo è pronto
Hooks.once('init', () => {
  CompendiumManager.initialize();
});

// Esporta per uso esterno
window.BrancaloniaCompendiumManager = CompendiumManager;