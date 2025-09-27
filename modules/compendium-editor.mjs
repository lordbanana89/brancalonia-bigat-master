/* ===================================== */
/* COMPENDIUM EDITOR SYSTEM */
/* Sistema per modificare compendi da UI */
/* ===================================== */

import { MODULE } from './settings.mjs';

/**
 * Sistema completo per editing inline dei compendi
 */
export class CompendiumEditor {
  static isInitialized = false;
  static editMode = false;
  static unsavedChanges = new Map();

  /**
   * Inizializza il sistema editor
   */
  static init() {
    if (this.isInitialized) return;

    console.log("Brancalonia | Inizializzazione Compendium Editor");

    // Registra settings
    this.registerSettings();

    // Setup hooks
    this.setupHooks();

    // Aggiungi comandi console
    this.setupConsoleCommands();

    // Aggiungi CSS per edit mode
    this.injectCSS();

    this.isInitialized = true;
  }

  /**
   * Registra le impostazioni
   */
  static registerSettings() {
    game.settings.register(MODULE, 'compendiumEditMode', {
      name: 'Modalità Modifica Compendi',
      hint: 'Abilita la modifica diretta dei compendi dall\'interfaccia',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false,
      onChange: value => this.toggleEditMode(value),
      restricted: true // Solo GM
    });

    game.settings.register(MODULE, 'compendiumAutoBackup', {
      name: 'Backup Automatico',
      hint: 'Crea backup prima di ogni modifica',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
      restricted: true
    });
  }

  /**
   * Setup hooks per intercettare render dei compendi
   */
  static setupHooks() {
    // Hook per compendium browser
    Hooks.on('renderCompendium', (app, html, data) => {
      if (game.user.isGM && this.editMode) {
        this.enhanceCompendiumBrowser(app, html);
      }
    });

    // Hook per documenti nei compendi
    Hooks.on('renderItemSheet', (app, html, data) => {
      if (game.user.isGM && this.editMode && app.object.pack) {
        this.enhanceDocumentSheet(app, html, 'Item');
      }
    });

    Hooks.on('renderActorSheet', (app, html, data) => {
      if (game.user.isGM && this.editMode && app.object.pack) {
        this.enhanceDocumentSheet(app, html, 'Actor');
      }
    });

    Hooks.on('renderJournalSheet', (app, html, data) => {
      if (game.user.isGM && this.editMode && app.object.pack) {
        this.enhanceDocumentSheet(app, html, 'JournalEntry');
      }
    });

    Hooks.on('renderRollTableConfig', (app, html, data) => {
      if (game.user.isGM && this.editMode && app.object.pack) {
        this.enhanceDocumentSheet(app, html, 'RollTable');
      }
    });

    // Hook per sidebar
    Hooks.on('renderSidebarTab', (app, html, data) => {
      if (app.id === 'compendium' && game.user.isGM) {
        this.addEditButton(html);
      }
    });

    // Hook per salvare modifiche
    Hooks.on('closeApplication', (app) => {
      if (this.unsavedChanges.has(app.id)) {
        this.promptSaveChanges(app);
      }
    });
  }

  /**
   * Aggiunge bottone edit mode alla sidebar
   */
  static addEditButton(html) {
    const header = html.find('.directory-header');

    const editButton = $(`
      <button class="compendium-edit-toggle ${this.editMode ? 'active' : ''}" title="Modalità Modifica Compendi">
        <i class="fas fa-edit"></i>
      </button>
    `);

    editButton.on('click', () => {
      const newState = !game.settings.get(MODULE, 'compendiumEditMode');
      game.settings.set(MODULE, 'compendiumEditMode', newState);
    });

    header.find('.header-actions').prepend(editButton);
  }

  /**
   * Migliora il browser dei compendi
   */
  static enhanceCompendiumBrowser(app, html) {
    // Aggiungi classe per styling
    html.addClass('compendium-edit-mode');

    // Aggiungi toolbar
    const toolbar = $(`
      <div class="compendium-edit-toolbar">
        <button class="add-entry" title="Aggiungi Elemento">
          <i class="fas fa-plus"></i> Nuovo
        </button>
        <button class="import-json" title="Importa da JSON">
          <i class="fas fa-file-import"></i> Importa
        </button>
        <button class="export-json" title="Esporta in JSON">
          <i class="fas fa-file-export"></i> Esporta
        </button>
        <button class="backup-pack" title="Backup Compendio">
          <i class="fas fa-save"></i> Backup
        </button>
      </div>
    `);

    // Event handlers
    toolbar.find('.add-entry').on('click', () => this.createNewEntry(app));
    toolbar.find('.import-json').on('click', () => this.importFromJSON(app));
    toolbar.find('.export-json').on('click', () => this.exportToJSON(app));
    toolbar.find('.backup-pack').on('click', () => this.backupPack(app));

    html.find('.directory-header').after(toolbar);

    // Rendi elementi modificabili
    html.find('.directory-item').each((i, elem) => {
      this.makeEntryEditable($(elem), app);
    });
  }

  /**
   * Rende un elemento del compendio modificabile
   */
  static makeEntryEditable(elem, compendium) {
    const entityId = elem.data('document-id');

    // Aggiungi bottoni azione
    const actions = $(`
      <div class="entry-actions">
        <a class="edit-inline" title="Modifica Rapida"><i class="fas fa-pen"></i></a>
        <a class="duplicate-entry" title="Duplica"><i class="fas fa-copy"></i></a>
        <a class="delete-entry" title="Elimina"><i class="fas fa-trash"></i></a>
      </div>
    `);

    // Event handlers
    actions.find('.edit-inline').on('click', async (e) => {
      e.stopPropagation();
      await this.quickEdit(compendium, entityId);
    });

    actions.find('.duplicate-entry').on('click', async (e) => {
      e.stopPropagation();
      await this.duplicateEntry(compendium, entityId);
    });

    actions.find('.delete-entry').on('click', async (e) => {
      e.stopPropagation();
      await this.deleteEntry(compendium, entityId);
    });

    elem.find('.document-name').after(actions);

    // Rendi il nome modificabile
    const nameElement = elem.find('.document-name');
    nameElement.attr('contenteditable', 'true');
    nameElement.on('blur', async () => {
      const newName = nameElement.text().trim();
      if (newName) {
        await this.updateEntryName(compendium, entityId, newName);
      }
    });
  }

  /**
   * Quick edit dialog
   */
  static async quickEdit(compendium, entityId) {
    const pack = compendium.collection;
    const document = await pack.getDocument(entityId);

    const content = `
      <form>
        <div class="form-group">
          <label>Nome</label>
          <input type="text" name="name" value="${document.name}">
        </div>
        ${this.getQuickEditFields(document)}
        <div class="form-group">
          <label>Descrizione</label>
          <textarea name="description" rows="4">${document.system.description?.value || ''}</textarea>
        </div>
      </form>
    `;

    new Dialog({
      title: `Modifica Rapida: ${document.name}`,
      content: content,
      buttons: {
        save: {
          icon: '<i class="fas fa-save"></i>',
          label: "Salva",
          callback: async (html) => {
            const formData = new FormDataExtended(html.find('form')[0]).object;
            await this.saveQuickEdit(pack, document, formData);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Annulla"
        }
      },
      default: "save",
      render: (html) => {
        // Inizializza editor TinyMCE se presente
        html.find('textarea').each((i, textarea) => {
          const editor = $(textarea);
          if (editor.hasClass('editor-content')) {
            TextEditor.create({
              target: textarea,
              save_onsavecallback: () => {},
              content_css: []
            });
          }
        });
      }
    }).render(true);
  }

  /**
   * Ottieni campi specifici per tipo documento
   */
  static getQuickEditFields(document) {
    let fields = '';

    if (document.type === 'weapon' || document.type === 'equipment') {
      fields += `
        <div class="form-group">
          <label>Prezzo (du)</label>
          <input type="number" name="system.price.value" value="${document.system.price?.value || 0}">
        </div>
        <div class="form-group">
          <label>Peso</label>
          <input type="number" name="system.weight" value="${document.system.weight || 0}" step="0.1">
        </div>
      `;
    }

    if (document.type === 'spell') {
      fields += `
        <div class="form-group">
          <label>Livello</label>
          <select name="system.level">
            ${[0,1,2,3,4,5,6,7,8,9].map(l =>
              `<option value="${l}" ${document.system.level === l ? 'selected' : ''}>${l === 0 ? 'Trucchetto' : `Livello ${l}`}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Scuola</label>
          <select name="system.school">
            ${Object.entries(CONFIG.DND5E.spellSchools).map(([k, v]) =>
              `<option value="${k}" ${document.system.school === k ? 'selected' : ''}>${v.label}</option>`
            ).join('')}
          </select>
        </div>
      `;
    }

    if (document.type === 'npc') {
      fields += `
        <div class="form-group">
          <label>GS</label>
          <input type="number" name="system.details.cr" value="${document.system.details?.cr || 0}" step="0.25">
        </div>
        <div class="form-group">
          <label>Tipo</label>
          <input type="text" name="system.details.type.value" value="${document.system.details?.type?.value || ''}">
        </div>
      `;
    }

    return fields;
  }

  /**
   * Salva modifiche rapide
   */
  static async saveQuickEdit(pack, document, formData) {
    try {
      // Backup se abilitato
      if (game.settings.get(MODULE, 'compendiumAutoBackup')) {
        await this.createBackup(pack, document);
      }

      // Prepara update data
      const updateData = {
        _id: document.id,
        ...formData
      };

      // Aggiorna documento
      await pack.updateDocument(updateData);

      ui.notifications.success(`${document.name} aggiornato con successo`);

      // Refresh compendium view
      pack.render();
    } catch (error) {
      console.error('Errore salvando modifiche:', error);
      ui.notifications.error(`Errore nel salvare: ${error.message}`);
    }
  }

  /**
   * Aggiorna nome entry
   */
  static async updateEntryName(compendium, entityId, newName) {
    try {
      const pack = compendium.collection;
      await pack.updateDocument({
        _id: entityId,
        name: newName
      });
      ui.notifications.info(`Nome aggiornato: ${newName}`);
    } catch (error) {
      ui.notifications.error(`Errore aggiornando nome: ${error.message}`);
    }
  }

  /**
   * Duplica entry
   */
  static async duplicateEntry(compendium, entityId) {
    try {
      const pack = compendium.collection;
      const original = await pack.getDocument(entityId);

      const duplicateData = original.toObject();
      delete duplicateData._id;
      duplicateData.name = `${duplicateData.name} (Copia)`;

      const newDoc = await pack.documentClass.create(duplicateData, {pack: pack.collection});
      ui.notifications.success(`Duplicato: ${newDoc.name}`);

      compendium.render();
    } catch (error) {
      ui.notifications.error(`Errore duplicando: ${error.message}`);
    }
  }

  /**
   * Elimina entry
   */
  static async deleteEntry(compendium, entityId) {
    const pack = compendium.collection;
    const document = await pack.getDocument(entityId);

    const confirm = await Dialog.confirm({
      title: "Conferma Eliminazione",
      content: `<p>Sei sicuro di voler eliminare <strong>${document.name}</strong>?</p>
                <p class="warning">Questa azione non può essere annullata!</p>`,
      yes: () => true,
      no: () => false,
      defaultYes: false
    });

    if (confirm) {
      try {
        // Backup prima di eliminare
        if (game.settings.get(MODULE, 'compendiumAutoBackup')) {
          await this.createBackup(pack, document);
        }

        await pack.deleteDocument(entityId);
        ui.notifications.warn(`Eliminato: ${document.name}`);
        compendium.render();
      } catch (error) {
        ui.notifications.error(`Errore eliminando: ${error.message}`);
      }
    }
  }

  /**
   * Crea nuovo elemento
   */
  static async createNewEntry(compendium) {
    const pack = compendium.collection;
    const types = this.getValidTypes(pack);

    const content = `
      <form>
        <div class="form-group">
          <label>Nome</label>
          <input type="text" name="name" placeholder="Nome nuovo elemento">
        </div>
        <div class="form-group">
          <label>Tipo</label>
          <select name="type">
            ${types.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
          </select>
        </div>
      </form>
    `;

    new Dialog({
      title: "Crea Nuovo Elemento",
      content: content,
      buttons: {
        create: {
          icon: '<i class="fas fa-plus"></i>',
          label: "Crea",
          callback: async (html) => {
            const formData = new FormDataExtended(html.find('form')[0]).object;

            if (!formData.name) {
              ui.notifications.warn("Inserisci un nome");
              return;
            }

            try {
              const data = {
                name: formData.name,
                type: formData.type
              };

              const newDoc = await pack.documentClass.create(data, {pack: pack.collection});
              ui.notifications.success(`Creato: ${newDoc.name}`);

              // Apri per modifica
              newDoc.sheet.render(true);
              compendium.render();
            } catch (error) {
              ui.notifications.error(`Errore creando: ${error.message}`);
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Annulla"
        }
      },
      default: "create"
    }).render(true);
  }

  /**
   * Ottieni tipi validi per il compendio
   */
  static getValidTypes(pack) {
    const documentName = pack.documentName;

    if (documentName === 'Item') {
      return Object.entries(CONFIG.Item.typeLabels).map(([k, v]) => ({
        value: k,
        label: game.i18n.localize(v)
      }));
    } else if (documentName === 'Actor') {
      return Object.entries(CONFIG.Actor.typeLabels).map(([k, v]) => ({
        value: k,
        label: game.i18n.localize(v)
      }));
    } else if (documentName === 'JournalEntry') {
      return [{value: 'base', label: 'Journal Entry'}];
    } else if (documentName === 'RollTable') {
      return [{value: 'base', label: 'Roll Table'}];
    } else if (documentName === 'Macro') {
      return [
        {value: 'script', label: 'Script'},
        {value: 'chat', label: 'Chat'}
      ];
    }

    return [{value: 'base', label: 'Base'}];
  }

  /**
   * Importa da JSON
   */
  static async importFromJSON(compendium) {
    new Dialog({
      title: "Importa da JSON",
      content: `
        <form>
          <p>Seleziona un file JSON da importare nel compendio.</p>
          <div class="form-group">
            <input type="file" name="import-file" accept=".json">
          </div>
          <p class="notes">Il file deve contenere un array di documenti validi.</p>
        </form>
      `,
      buttons: {
        import: {
          icon: '<i class="fas fa-file-import"></i>',
          label: "Importa",
          callback: async (html) => {
            const input = html.find('input[type="file"]')[0];
            if (!input.files.length) return;

            try {
              const file = input.files[0];
              const text = await file.text();
              const data = JSON.parse(text);

              const pack = compendium.collection;
              const documents = Array.isArray(data) ? data : [data];

              for (const doc of documents) {
                delete doc._id;
                await pack.documentClass.create(doc, {pack: pack.collection});
              }

              ui.notifications.success(`Importati ${documents.length} elementi`);
              compendium.render();
            } catch (error) {
              ui.notifications.error(`Errore importando: ${error.message}`);
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Annulla"
        }
      },
      default: "import"
    }).render(true);
  }

  /**
   * Esporta in JSON
   */
  static async exportToJSON(compendium) {
    try {
      const pack = compendium.collection;
      const documents = await pack.getDocuments();
      const data = documents.map(d => d.toObject());

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${pack.metadata.name}-export.json`;
      a.click();

      URL.revokeObjectURL(url);
      ui.notifications.success(`Esportati ${documents.length} elementi`);
    } catch (error) {
      ui.notifications.error(`Errore esportando: ${error.message}`);
    }
  }

  /**
   * Backup del compendio
   */
  static async backupPack(compendium) {
    try {
      const pack = compendium.collection;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `${pack.metadata.name}-backup-${timestamp}`;

      // Crea backup in localStorage
      const documents = await pack.getDocuments();
      const data = documents.map(d => d.toObject());

      localStorage.setItem(`brancalonia-backup-${backupName}`, JSON.stringify({
        metadata: pack.metadata,
        documents: data,
        timestamp: timestamp
      }));

      ui.notifications.success(`Backup creato: ${backupName}`);

      // Opzionale: esporta anche come file
      const exportBackup = await Dialog.confirm({
        title: "Esporta Backup",
        content: "Vuoi anche esportare il backup come file?",
        yes: () => true,
        no: () => false
      });

      if (exportBackup) {
        const jsonStr = JSON.stringify({metadata: pack.metadata, documents: data}, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${backupName}.json`;
        a.click();

        URL.revokeObjectURL(url);
      }
    } catch (error) {
      ui.notifications.error(`Errore creando backup: ${error.message}`);
    }
  }

  /**
   * Crea backup di un singolo documento
   */
  static async createBackup(pack, document) {
    const key = `brancalonia-backup-${pack.metadata.name}-${document.id}`;
    const backup = {
      document: document.toObject(),
      timestamp: Date.now(),
      pack: pack.metadata.name
    };

    localStorage.setItem(key, JSON.stringify(backup));
  }

  /**
   * Toggle edit mode
   */
  static toggleEditMode(enabled) {
    this.editMode = enabled;

    if (enabled) {
      ui.notifications.info("Modalità modifica compendi ATTIVA");
      document.body.classList.add('compendium-edit-mode');
    } else {
      ui.notifications.info("Modalità modifica compendi DISATTIVA");
      document.body.classList.remove('compendium-edit-mode');
    }

    // Re-render tutti i compendi aperti
    for (const app of Object.values(ui.windows)) {
      if (app instanceof Compendium) {
        app.render();
      }
    }
  }

  /**
   * Migliora sheet documento
   */
  static enhanceDocumentSheet(app, html, type) {
    // Aggiungi toolbar
    const toolbar = $(`
      <div class="compendium-sheet-toolbar">
        <button class="save-to-pack" title="Salva nel Compendio">
          <i class="fas fa-save"></i> Salva
        </button>
        <button class="save-as-new" title="Salva come Nuovo">
          <i class="fas fa-plus"></i> Salva Come
        </button>
        <button class="revert-changes" title="Annulla Modifiche">
          <i class="fas fa-undo"></i> Ripristina
        </button>
      </div>
    `);

    toolbar.find('.save-to-pack').on('click', () => this.saveToCompendium(app));
    toolbar.find('.save-as-new').on('click', () => this.saveAsNew(app));
    toolbar.find('.revert-changes').on('click', () => this.revertChanges(app));

    html.find('.window-header').after(toolbar);

    // Track changes
    html.find('input, select, textarea').on('change', () => {
      this.unsavedChanges.set(app.id, true);
    });
  }

  /**
   * Setup comandi console
   */
  static setupConsoleCommands() {
    window.brancaloniaCompendium = {
      enableEdit: () => game.settings.set(MODULE, 'compendiumEditMode', true),
      disableEdit: () => game.settings.set(MODULE, 'compendiumEditMode', false),
      listBackups: () => this.listBackups(),
      restoreBackup: (key) => this.restoreBackup(key),
      clearBackups: () => this.clearBackups()
    };

    console.log('Brancalonia Compendium Editor Commands:');
    console.log('  brancaloniaCompendium.enableEdit() - Abilita modifica');
    console.log('  brancaloniaCompendium.disableEdit() - Disabilita modifica');
    console.log('  brancaloniaCompendium.listBackups() - Lista backup');
    console.log('  brancaloniaCompendium.restoreBackup(key) - Ripristina backup');
  }

  /**
   * Lista backup disponibili
   */
  static listBackups() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('brancalonia-backup-')) {
        const data = JSON.parse(localStorage.getItem(key));
        backups.push({
          key: key,
          timestamp: data.timestamp,
          pack: data.pack || data.metadata?.name
        });
      }
    }

    console.table(backups);
    return backups;
  }

  /**
   * Inietta CSS per edit mode
   */
  static injectCSS() {
    const css = `
      .compendium-edit-mode {
        border: 2px solid #C9A961 !important;
        box-shadow: 0 0 10px rgba(201, 169, 97, 0.3);
      }

      .compendium-edit-toolbar {
        padding: 8px;
        background: linear-gradient(90deg, #D4C4A0 0%, #E8DCC0 100%);
        border-bottom: 1px solid #B8985A;
        display: flex;
        gap: 5px;
      }

      .compendium-edit-toolbar button {
        padding: 4px 8px;
        background: white;
        border: 1px solid #B8985A;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
      }

      .compendium-edit-toolbar button:hover {
        background: #C9A961;
        color: white;
      }

      .compendium-edit-toggle {
        margin-right: 5px;
        padding: 3px 6px;
        background: #D4C4A0;
        border: 1px solid #B8985A;
        border-radius: 3px;
        cursor: pointer;
      }

      .compendium-edit-toggle.active {
        background: #C9A961;
        color: white;
      }

      .entry-actions {
        display: inline-flex;
        gap: 5px;
        margin-left: auto;
        opacity: 0;
        transition: opacity 0.3s;
      }

      .directory-item:hover .entry-actions {
        opacity: 1;
      }

      .entry-actions a {
        color: #B8985A;
        cursor: pointer;
        transition: color 0.3s;
      }

      .entry-actions a:hover {
        color: #C9A961;
      }

      .compendium-edit-mode .document-name[contenteditable] {
        padding: 2px 4px;
        border: 1px dashed transparent;
        transition: all 0.3s;
      }

      .compendium-edit-mode .document-name[contenteditable]:hover {
        border-color: #C9A961;
        background: rgba(201, 169, 97, 0.1);
      }

      .compendium-edit-mode .document-name[contenteditable]:focus {
        outline: none;
        border-color: #B87333;
        background: white;
      }

      .compendium-sheet-toolbar {
        padding: 5px 10px;
        background: #F5F5F5;
        border-bottom: 1px solid #DDD;
        display: flex;
        gap: 5px;
      }

      .compendium-sheet-toolbar button {
        padding: 4px 8px;
        font-size: 12px;
      }

      .warning {
        color: #8B2635;
        font-weight: bold;
      }
    `;

    const style = document.createElement('style');
    style.id = 'brancalonia-compendium-editor-styles';
    style.innerHTML = css;
    document.head.appendChild(style);
  }
}

// Auto-inizializza quando ready
Hooks.once('ready', () => {
  if (game.user.isGM) {
    CompendiumEditor.init();
  }
});