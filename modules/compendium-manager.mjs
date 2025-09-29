/**
 * BRANCALONIA COMPENDIUM MANAGER - CONSOLIDATED
 * Unisce le funzionalità di editor e unlocker in un unico modulo
 * - Sblocco automatico dei compendi Brancalonia
 * - Editor inline completo
 * - Import/Export JSON
 * - Backup e ripristino
 * - Console commands
 */

export class CompendiumManager {
  static ID = 'brancalonia-bigat';
  static FLAGS = {
    UNLOCKED: 'unlocked',
    BACKUP: 'backup',
    EDIT_MODE: 'editMode'
  };

  /**
   * Inizializza il manager
   */
  static initialize() {
    console.log('📚 Brancalonia | Inizializzazione Compendium Manager Consolidato');

    // Registra impostazioni
    this.registerSettings();

    // Hook per sblocco automatico
    Hooks.on('renderCompendium', this._onRenderCompendium.bind(this));

    // Hook per context menu
    Hooks.on('getCompendiumEntryContext', this._addContextOptions.bind(this));

    // Hook per sbloccare automaticamente i pack Brancalonia
    Hooks.once('ready', () => {
      this.unlockBrancaloniaPacks();
      this.registerConsoleCommands();
    });

    // Hook per toolbar editing
    Hooks.on('renderCompendiumDirectory', this._addToolbarButton.bind(this));
  }

  /**
   * Registra le impostazioni
   */
  static registerSettings() {
    game.settings.register(this.ID, 'autoUnlock', {
      name: 'Sblocco Automatico Compendi',
      hint: 'Sblocca automaticamente tutti i compendi Brancalonia',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
      onChange: value => {
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
  }

  /**
   * Sblocca tutti i pack Brancalonia
   */
  static async unlockBrancaloniaPacks() {
    if (!game.user.isGM) return;

    const autoUnlock = game.settings.get(this.ID, 'autoUnlock');
    if (!autoUnlock) return;

    console.log('🔓 Sblocco automatico compendi Brancalonia...');

    for (let pack of game.packs) {
      // Sblocca solo i pack del modulo Brancalonia
      if (pack.metadata.packageName === this.ID) {
        if (pack.locked) {
          await pack.configure({ locked: false });
          console.log(`✅ Sbloccato: ${pack.metadata.label}`);
        }

        // Imposta flag di sblocco
        await pack.setFlag(this.ID, this.FLAGS.UNLOCKED, true);
      }
    }

    ui.notifications.info('Compendi Brancalonia sbloccati!');
  }

  /**
   * Aggiunge opzioni al context menu
   */
  static _addContextOptions(html, options) {
    const enableEditor = game.settings.get(this.ID, 'enableEditor');
    if (!enableEditor || !game.user.isGM) return;

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

    new Dialog({
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
    const filename = `${doc.name.slugify()}.json`;

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
    console.log(`📦 Backup creato per: ${doc.name}`);
  }

  /**
   * Aggiunge bottone toolbar
   */
  static _addToolbarButton(app, html) {
    if (!game.user.isGM) return;

    const button = $(`
      <button class="brancalonia-compendium-tools">
        <i class="fas fa-toolbox"></i> Strumenti
      </button>
    `);

    button.click(() => this.showToolsDialog());

    html.find('.directory-header .header-actions').append(button);
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
    new Dialog({
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

    new Dialog({
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
        console.log(`✅ Ricompilato: ${pack.metadata.label}`);
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
      const pack = game.packs.get(`${this.ID}.${packName}`);
      if (pack) {
        await pack.configure({ locked: false });
        console.log(`✅ Sbloccato: ${packName}`);
      } else {
        console.error(`❌ Pack non trovato: ${packName}`);
      }
    };

    // Conta elementi nei pack
    window.countPackItems = async () => {
      for (let pack of game.packs) {
        if (pack.metadata.packageName === this.ID) {
          const count = pack.index.size;
          console.log(`${pack.metadata.label}: ${count} elementi`);
        }
      }
    };

    // Cerca in tutti i pack
    window.searchPacks = async (searchTerm) => {
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

      console.table(results);
      return results;
    };

    console.log('📚 Comandi console Compendium registrati:');
    console.log('  - unlockPack(packName)');
    console.log('  - countPackItems()');
    console.log('  - searchPacks(searchTerm)');
  }

  /**
   * Hook per rendering compendium
   */
  static _onRenderCompendium(app, html, data) {
    if (!game.user.isGM) return;

    // Aggiungi indicatore di stato
    if (app.metadata.packageName === this.ID) {
      const locked = app.locked;
      const indicator = $(`
        <span class="lock-indicator" title="${locked ? 'Bloccato' : 'Sbloccato'}">
          <i class="fas fa-${locked ? 'lock' : 'unlock'}"></i>
        </span>
      `);

      html.find('.window-title').append(indicator);
    }
  }
}

// Inizializza quando il modulo è pronto
Hooks.once('init', () => {
  CompendiumManager.initialize();
});

// Esporta per uso esterno
window.BrancaloniaCompendiumManager = CompendiumManager;