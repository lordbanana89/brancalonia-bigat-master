/* ===================================== */
/* COMPENDIUM UNLOCKER */
/* Sblocca compendi per modifica diretta */
/* ===================================== */

import { MODULE } from './settings.mjs';

/**
 * Sistema per sbloccare e modificare compendi in Foundry v13
 */
export class CompendiumUnlocker {
  static isInitialized = false;

  /**
   * Inizializza il sistema
   */
  static init() {
    if (this.isInitialized) return;

    console.log("Brancalonia | Inizializzazione Compendium Unlocker");

    // Sblocca automaticamente i compendi Brancalonia
    this.unlockBrancaloniaCompendiums();

    // Aggiungi comandi rapidi
    this.setupCommands();

    // Setup hooks
    this.setupHooks();

    this.isInitialized = true;
  }

  /**
   * Sblocca tutti i compendi del modulo
   */
  static async unlockBrancaloniaCompendiums() {
    // Ottieni tutti i pack del modulo Brancalonia
    const packs = game.packs.filter(p => p.metadata.packageName === MODULE);

    for (const pack of packs) {
      try {
        // Imposta il compendio come modificabile
        await pack.configure({
          locked: false,
          ownership: {
            PLAYER: "OBSERVER",
            ASSISTANT: "OWNER"
          }
        });

        console.log(`Brancalonia | Sbloccato compendio: ${pack.metadata.label}`);
      } catch (error) {
        console.warn(`Non posso sbloccare ${pack.metadata.label}:`, error);
      }
    }

    // Notifica
    if (game.user.isGM) {
      ui.notifications.info(`Compendi Brancalonia sbloccati per modifica`, { permanent: false });
    }
  }

  /**
   * Setup hooks per migliorare l'editing
   */
  static setupHooks() {
    // Hook quando si apre un compendio
    Hooks.on('renderCompendium', (app, html, data) => {
      if (game.user.isGM) {
        this.enhanceCompendium(app, html);
      }
    });

    // Hook per aggiungere opzioni al context menu
    Hooks.on('getCompendiumEntryContext', (html, options) => {
      if (!game.user.isGM) return;

      // Aggiungi opzione per edit rapido
      options.unshift({
        name: "Modifica Rapida",
        icon: '<i class="fas fa-edit"></i>',
        callback: li => {
          const documentId = li.data('document-id');
          const pack = game.packs.get(li.closest('[data-pack]').data('pack'));
          this.quickEdit(pack, documentId);
        }
      });

      // Aggiungi opzione per duplicare
      options.push({
        name: "Duplica nel Compendio",
        icon: '<i class="fas fa-copy"></i>',
        callback: async li => {
          const documentId = li.data('document-id');
          const pack = game.packs.get(li.closest('[data-pack]').data('pack'));
          await this.duplicateInPack(pack, documentId);
        }
      });

      // Aggiungi opzione per export singolo
      options.push({
        name: "Esporta come JSON",
        icon: '<i class="fas fa-file-export"></i>',
        callback: async li => {
          const documentId = li.data('document-id');
          const pack = game.packs.get(li.closest('[data-pack]').data('pack'));
          await this.exportSingle(pack, documentId);
        }
      });
    });

    // Hook per il drag & drop nei compendi
    Hooks.on('dropActorSheetData', (actor, sheet, data) => {
      if (data.pack && game.user.isGM) {
        this.handleDropToPack(data);
      }
    });
  }

  /**
   * Migliora l'interfaccia del compendio
   */
  static enhanceCompendium(app, html) {
    const pack = app.collection;

    // Verifica se è un pack Brancalonia
    if (pack.metadata.packageName !== MODULE) return;

    // Aggiungi indicatore di stato
    const header = html.find('.header-search');
    const lockStatus = pack.locked ?
      '<span class="lock-status locked" title="Compendio Bloccato"><i class="fas fa-lock"></i></span>' :
      '<span class="lock-status unlocked" title="Compendio Modificabile"><i class="fas fa-lock-open"></i></span>';

    header.prepend(lockStatus);

    // Aggiungi bottone per toggle lock
    const lockButton = $(`
      <a class="header-control toggle-lock" title="${pack.locked ? 'Sblocca' : 'Blocca'} Compendio">
        <i class="fas fa-${pack.locked ? 'lock' : 'lock-open'}"></i>
      </a>
    `);

    lockButton.on('click', async () => {
      await pack.configure({ locked: !pack.locked });
      app.render();
      ui.notifications.info(`Compendio ${pack.locked ? 'bloccato' : 'sbloccato'}`);
    });

    html.find('.header-controls').prepend(lockButton);

    // Aggiungi bottone import multiplo
    const importButton = $(`
      <a class="header-control import-json" title="Importa da JSON">
        <i class="fas fa-file-import"></i>
      </a>
    `);

    importButton.on('click', () => this.importDialog(pack));
    html.find('.header-controls').prepend(importButton);

    // Aggiungi bottone per creare nuovo
    if (!pack.locked) {
      const createButton = $(`
        <a class="header-control create-entry" title="Crea Nuovo">
          <i class="fas fa-plus"></i>
        </a>
      `);

      createButton.on('click', () => this.createNewEntry(pack));
      html.find('.header-controls').prepend(createButton);
    }

    // Stile per indicare stato modificabile
    if (!pack.locked) {
      html.addClass('compendium-unlocked');
    }
  }

  /**
   * Quick edit dialog
   */
  static async quickEdit(pack, documentId) {
    if (pack.locked) {
      ui.notifications.warn("Il compendio è bloccato. Sbloccalo prima di modificare.");
      return;
    }

    const document = await pack.getDocument(documentId);

    // Crea form di edit rapido
    const content = await renderTemplate('modules/brancalonia-bigat/templates/quick-edit.hbs', {
      document: document,
      isItem: document instanceof Item,
      isActor: document instanceof Actor,
      isJournal: document instanceof JournalEntry,
      system: document.system
    });

    new Dialog({
      title: `Modifica Rapida: ${document.name}`,
      content: content,
      buttons: {
        save: {
          icon: '<i class="fas fa-save"></i>',
          label: "Salva",
          callback: async (html) => {
            const formData = new FormDataExtended(html.find('form')[0]).object;

            try {
              await document.update(formData);
              ui.notifications.success(`${document.name} aggiornato`);

              // Refresh compendium
              const compendiumApp = Object.values(ui.windows).find(w =>
                w.collection?.collection === pack.collection
              );
              if (compendiumApp) compendiumApp.render();
            } catch (error) {
              ui.notifications.error(`Errore: ${error.message}`);
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Annulla"
        }
      },
      default: "save",
      width: 500,
      height: 'auto'
    }).render(true);
  }

  /**
   * Duplica documento nel pack
   */
  static async duplicateInPack(pack, documentId) {
    if (pack.locked) {
      ui.notifications.warn("Il compendio è bloccato");
      return;
    }

    try {
      const original = await pack.getDocument(documentId);
      const data = original.toObject();

      // Rimuovi ID e modifica nome
      delete data._id;
      data.name = `${data.name} (Copia)`;

      // Crea nuovo documento
      const created = await pack.documentClass.create(data, { pack: pack.collection });
      ui.notifications.success(`Duplicato: ${created.name}`);

      // Refresh compendium
      const compendiumApp = Object.values(ui.windows).find(w =>
        w.collection?.collection === pack.collection
      );
      if (compendiumApp) compendiumApp.render();
    } catch (error) {
      ui.notifications.error(`Errore duplicando: ${error.message}`);
    }
  }

  /**
   * Esporta singolo documento
   */
  static async exportSingle(pack, documentId) {
    try {
      const document = await pack.getDocument(documentId);
      const data = document.toObject();

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${data.name.slugify()}.json`;
      a.click();

      ui.notifications.info(`Esportato: ${document.name}`);
    } catch (error) {
      ui.notifications.error(`Errore esportando: ${error.message}`);
    }
  }

  /**
   * Dialog per import
   */
  static importDialog(pack) {
    if (pack.locked) {
      ui.notifications.warn("Sblocca il compendio prima di importare");
      return;
    }

    const content = `
      <form>
        <p>Seleziona file JSON da importare:</p>
        <input type="file" name="files" accept=".json" multiple>
        <p class="notes">Puoi selezionare più file JSON</p>
      </form>
    `;

    new Dialog({
      title: `Importa in ${pack.metadata.label}`,
      content: content,
      buttons: {
        import: {
          icon: '<i class="fas fa-file-import"></i>',
          label: "Importa",
          callback: async (html) => {
            const files = html.find('input[type="file"]')[0].files;
            if (!files.length) return;

            let imported = 0;
            for (const file of files) {
              try {
                const text = await file.text();
                const data = JSON.parse(text);

                // Gestisci array o singolo documento
                const documents = Array.isArray(data) ? data : [data];

                for (const doc of documents) {
                  delete doc._id;
                  delete doc.folder;
                  delete doc.sort;

                  await pack.documentClass.create(doc, { pack: pack.collection });
                  imported++;
                }
              } catch (error) {
                console.error(`Errore importando ${file.name}:`, error);
                ui.notifications.error(`Errore in ${file.name}: ${error.message}`);
              }
            }

            ui.notifications.success(`Importati ${imported} documenti`);

            // Refresh compendium
            const compendiumApp = Object.values(ui.windows).find(w =>
              w.collection?.collection === pack.collection
            );
            if (compendiumApp) compendiumApp.render();
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
   * Crea nuovo documento nel pack
   */
  static async createNewEntry(pack) {
    if (pack.locked) {
      ui.notifications.warn("Il compendio è bloccato");
      return;
    }

    // Determina il tipo di documento
    const documentClass = pack.documentClass;
    const documentName = documentClass.documentName;

    // Crea dati base
    let data = {
      name: `Nuovo ${documentName}`,
      type: documentName === 'Item' ? 'equipment' :
            documentName === 'Actor' ? 'npc' :
            undefined
    };

    try {
      // Crea il documento
      const created = await documentClass.create(data, {
        pack: pack.collection,
        renderSheet: true
      });

      ui.notifications.success(`Creato: ${created.name}`);
    } catch (error) {
      ui.notifications.error(`Errore creando: ${error.message}`);
    }
  }

  /**
   * Setup comandi console
   */
  static setupCommands() {
    // Comandi globali
    window.brancaloniaCompendium = {
      // Sblocca tutti i compendi Brancalonia
      unlockAll: async () => {
        const packs = game.packs.filter(p => p.metadata.packageName === MODULE);
        for (const pack of packs) {
          await pack.configure({ locked: false });
        }
        ui.notifications.success("Tutti i compendi Brancalonia sbloccati");
      },

      // Blocca tutti i compendi
      lockAll: async () => {
        const packs = game.packs.filter(p => p.metadata.packageName === MODULE);
        for (const pack of packs) {
          await pack.configure({ locked: true });
        }
        ui.notifications.success("Tutti i compendi Brancalonia bloccati");
      },

      // Export completo di un pack
      exportPack: async (packName) => {
        const pack = game.packs.get(`${MODULE}.${packName}`);
        if (!pack) {
          console.error(`Pack non trovato: ${packName}`);
          return;
        }

        const documents = await pack.getDocuments();
        const data = documents.map(d => d.toObject());

        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${packName}-export.json`;
        a.click();

        console.log(`Esportati ${documents.length} documenti da ${packName}`);
      },

      // Lista tutti i pack
      list: () => {
        const packs = game.packs.filter(p => p.metadata.packageName === MODULE);
        console.table(packs.map(p => ({
          name: p.metadata.name,
          label: p.metadata.label,
          type: p.metadata.type,
          locked: p.locked,
          size: p.index.size
        })));
      }
    };

    console.log('📚 Brancalonia Compendium Commands:');
    console.log('  brancaloniaCompendium.unlockAll() - Sblocca tutti i compendi');
    console.log('  brancaloniaCompendium.lockAll() - Blocca tutti i compendi');
    console.log('  brancaloniaCompendium.exportPack("nome") - Esporta un pack');
    console.log('  brancaloniaCompendium.list() - Lista tutti i pack');
  }

  /**
   * Aggiungi CSS
   */
  static injectStyles() {
    const css = `
      .compendium-unlocked {
        box-shadow: 0 0 5px rgba(201, 169, 97, 0.5) !important;
      }

      .compendium-unlocked .directory-header {
        background: linear-gradient(90deg, rgba(212, 196, 160, 0.3) 0%, rgba(232, 220, 192, 0.3) 100%);
      }

      .lock-status {
        margin-right: 8px;
        font-size: 14px;
      }

      .lock-status.unlocked {
        color: #C9A961;
      }

      .lock-status.locked {
        color: #8B2635;
      }

      .header-control {
        cursor: pointer;
        margin: 0 2px;
      }

      .header-control:hover {
        color: #C9A961;
      }
    `;

    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
  }
}

// Auto-inizializza
Hooks.once('ready', () => {
  if (game.user.isGM) {
    CompendiumUnlocker.init();
    CompendiumUnlocker.injectStyles();
  }
});