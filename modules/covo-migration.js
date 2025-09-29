/**
 * BRANCALONIA COVO MIGRATION SYSTEM
 * Migra i dati dal vecchio sistema al nuovo
 */

class CovoMigration {
  static async migrateAll() {
    if (!game.user.isGM) {
      ui.notifications.error("Solo il GM può eseguire la migrazione!");
      return;
    }

    console.log("Brancalonia | Inizio migrazione sistema Covo...");

    try {
      // Trova tutti gli attori con dati del vecchio covo
      const actorsWithOldCovo = game.actors.filter(a =>
        a.getFlag('brancalonia-bigat', 'covo') &&
        !a.getFlag('brancalonia-bigat', 'covoMigrated')
      );

      if (actorsWithOldCovo.length === 0) {
        ui.notifications.info("Nessun covo da migrare trovato.");
        return;
      }

      const confirmed = await Dialog.confirm({
        title: "Migrazione Sistema Covo",
        content: `
          <div style="padding: 15px;">
            <h3>🔄 Migrazione al nuovo sistema Covo</h3>
            <p>Trovati <strong>${actorsWithOldCovo.length}</strong> personaggi con dati del vecchio sistema.</p>
            <p style="color: #E65100; margin: 15px 0;">
              <strong>⚠️ IMPORTANTE:</strong> Questa operazione:
            </p>
            <ul style="margin: 10px 0;">
              <li>Creerà nuovi Actor di tipo Covo</li>
              <li>Migrerà tutti i granlussi e progressi</li>
              <li>Manterrà il tesoro e le associazioni</li>
              <li>È irreversibile una volta completata</li>
            </ul>
            <p style="margin-top: 15px;">
              <strong>Vuoi procedere con la migrazione?</strong>
            </p>
          </div>
        `,
        yes: () => true,
        no: () => false
      });

      if (!confirmed) {
        ui.notifications.info("Migrazione annullata.");
        return;
      }

      // Progress dialog
      const progressDialog = new Dialog({
        title: "Migrazione in corso...",
        content: `
          <div style="padding: 20px; text-align: center;">
            <h3>🔄 Migrazione in corso...</h3>
            <div class="migration-progress" style="margin: 20px 0;">
              <div class="progress-bar" style="width: 100%; height: 30px; background: #E0E0E0; border-radius: 15px; overflow: hidden;">
                <div class="progress-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%); transition: width 0.3s;"></div>
              </div>
              <p class="progress-text" style="margin-top: 10px;">Preparazione...</p>
            </div>
            <p style="color: #666; font-size: 0.9em;">Non chiudere questa finestra!</p>
          </div>
        `,
        buttons: {},
        close: () => false
      }, {
        width: 400,
        closeOnEscape: false
      });

      progressDialog.render(true);

      // Raggruppa per covo condiviso
      const covoGroups = this._groupActorsByCovo(actorsWithOldCovo);
      let migrated = 0;
      const total = Object.keys(covoGroups).length;

      for (const [groupKey, actors] of Object.entries(covoGroups)) {
        // Aggiorna progress
        const percent = Math.round((migrated / total) * 100);
        const progressBar = progressDialog.element.find('.progress-fill');
        const progressText = progressDialog.element.find('.progress-text');

        progressBar.css('width', `${percent}%`);
        progressText.text(`Migrazione covo ${migrated + 1}/${total}...`);

        // Migra questo gruppo
        await this._migrateCovoGroup(actors, groupKey);
        migrated++;

        // Piccolo delay per UI
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Chiudi progress dialog
      progressDialog.close();

      // Report finale
      const report = await this._generateMigrationReport(total);

      new Dialog({
        title: "✅ Migrazione Completata",
        content: report,
        buttons: {
          ok: {
            icon: '<i class="fas fa-check"></i>',
            label: "OK"
          }
        }
      }, {
        width: 500
      }).render(true);

      console.log("Brancalonia | Migrazione sistema Covo completata!");

    } catch (error) {
      console.error("Brancalonia | Errore durante la migrazione:", error);
      ui.notifications.error("Errore durante la migrazione: " + error.message);
    }
  }

  /**
   * Raggruppa attori per covo condiviso
   */
  static _groupActorsByCovo(actors) {
    const groups = {};

    actors.forEach(actor => {
      const covoData = actor.getFlag('brancalonia-bigat', 'covo');

      // Se ha flag di covo condiviso, usa quello come chiave
      const sharedCovoId = actor.getFlag('brancalonia-bigat', 'sharedCovoId');
      const groupKey = sharedCovoId || actor.id;

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(actor);
    });

    return groups;
  }

  /**
   * Migra un gruppo di attori che condividono lo stesso covo
   */
  static async _migrateCovoGroup(actors, groupKey) {
    // Prendi i dati del covo dal primo attore
    const leadActor = actors[0];
    const oldCovoData = leadActor.getFlag('brancalonia-bigat', 'covo') || {};

    // Determina il nome del covo
    const covoName = oldCovoData.name || `Covo di ${leadActor.name}`;

    // Crea il nuovo Actor Covo
    const newCovo = await this._createNewCovoActor(covoName, oldCovoData, actors);

    // Associa tutti gli attori al nuovo covo
    for (const actor of actors) {
      await actor.setFlag('brancalonia-bigat', 'covoId', newCovo.id);
      await actor.setFlag('brancalonia-bigat', 'covoMigrated', true);

      // Rimuovi vecchi flag se richiesto
      if (game.settings.get('brancalonia-bigat', 'removeOldCovoData')) {
        await actor.unsetFlag('brancalonia-bigat', 'covo');
        await actor.unsetFlag('brancalonia-bigat', 'sharedCovoId');
      }
    }

    // Crea scena e journal se abilitato
    if (game.settings.get('brancalonia-bigat', 'autoCreateCovoScene')) {
      await game.brancalonia.covo.createCovoScene(newCovo);
    }
    await game.brancalonia.covo.createCovoJournal(newCovo);

    // Log migrazione
    console.log(`Brancalonia | Migrato covo: ${covoName} con ${actors.length} membri`);

    return newCovo;
  }

  /**
   * Crea nuovo Actor Covo dai vecchi dati
   */
  static async _createNewCovoActor(name, oldData, members) {
    // Prepara dati base del covo
    const covoData = {
      name: name,
      type: "npc",
      img: oldData.img || "icons/environment/settlement/house-cottage.webp",
      system: {
        details: {
          biography: {
            value: oldData.description || "Covo migrato dal vecchio sistema."
          },
          type: {
            value: "Covo",
            custom: "Covo"
          }
        },
        currency: {
          gp: oldData.treasury || 0
        },
        attributes: {
          hp: {
            value: 100,
            max: 100
          }
        }
      },
      flags: {
        'brancalonia-bigat': {
          covo: true,
          reputation: oldData.reputation || 0,
          founded: oldData.createdDate || new Date().toISOString(),
          migratedFrom: 'v1',
          originalData: oldData // Mantieni backup dei dati originali
        }
      }
    };

    // Crea l'actor
    const covo = await Actor.create(covoData);

    // Migra i granlussi
    await this._migrateGranlussi(covo, oldData);

    // Migra transazioni se presenti
    if (oldData.transactions) {
      await covo.setFlag('brancalonia-bigat', 'transactions', oldData.transactions);
    }

    return covo;
  }

  /**
   * Migra i granlussi al nuovo formato
   */
  static async _migrateGranlussi(covo, oldData) {
    const granlussiData = [];

    // Mappa vecchi nomi ai nuovi
    const granlussiMap = {
      'borsaNera': {
        name: 'Borsa Nera',
        type: 'borsa-nera',
        img: 'icons/containers/bags/pouch-simple-leather-brown.webp'
      },
      'cantina': {
        name: 'Cantina',
        type: 'cantina',
        img: 'icons/environment/settlement/cellar.webp'
      },
      'distilleria': {
        name: 'Distilleria',
        type: 'distilleria',
        img: 'icons/tools/laboratory/alembic-copper-blue.webp'
      },
      'fucina': {
        name: 'Fucina',
        type: 'fucina',
        img: 'icons/tools/smithing/anvil.webp'
      },
      'scuderie': {
        name: 'Scuderie',
        type: 'scuderie',
        img: 'icons/environment/settlement/stable.webp'
      }
    };

    // Benefits per livello (dal manuale)
    const benefitsMap = {
      'borsa-nera': {
        1: { cost: 100, description: "Oggetti magici comuni (50 mo)" },
        2: { cost: 50, description: "Oggetti non comuni (150 mo)" },
        3: { cost: 50, description: "Oggetti rari su richiesta" }
      },
      'cantina': {
        1: { cost: 100, description: "Recuperi tutti i DV nel riposo lungo" },
        2: { cost: 50, description: "-1 indebolimento extra" },
        3: { cost: 50, description: "+1 punto ispirazione" }
      },
      'distilleria': {
        1: { cost: 100, description: "Acquamorte o Richiamino gratis" },
        2: { cost: 50, description: "Afrore o Infernet gratis" },
        3: { cost: 50, description: "Cordiale o Intruglio Forza gratis" }
      },
      'fucina': {
        1: { cost: 100, description: "Ripara oggetti metallici" },
        2: { cost: 50, description: "Sblocca lucchetti non magici" },
        3: { cost: 50, description: "Equipaggiamento non scadente" }
      },
      'scuderie': {
        1: { cost: 100, description: "Pony, asini, muli in prestito" },
        2: { cost: 50, description: "Cavalli e carri in prestito" },
        3: { cost: 50, description: "Tutto non scadente" }
      }
    };

    // Crea item per ogni granlusso
    for (const [oldKey, info] of Object.entries(granlussiMap)) {
      const level = oldData[oldKey] || 0;

      const itemData = {
        name: info.name,
        type: "feat",
        img: info.img,
        system: {
          description: {
            value: this._getGranlussoDescription(info.type)
          },
          type: {
            value: "feat",
            subtype: "granlusso"
          },
          activation: {
            type: "special",
            cost: null
          },
          level: {
            value: level,
            max: 3
          }
        },
        flags: {
          'brancalonia-bigat': {
            granlusso: true,
            type: info.type,
            benefits: benefitsMap[info.type],
            migratedLevel: level
          }
        }
      };

      granlussiData.push(itemData);
    }

    // Crea tutti i granlussi
    await covo.createEmbeddedDocuments("Item", granlussiData);
  }

  /**
   * Ottiene la descrizione del granlusso
   */
  static _getGranlussoDescription(type) {
    const descriptions = {
      'borsa-nera': "Rete di contatti per commercio di oggetti magici e materiali rari.",
      'cantina': "Luogo fresco per conservare cibo e bevande, migliora il riposo.",
      'distilleria': "Alambicchi per distillare intrugli alchemici e bevande.",
      'fucina': "Forge per riparare e migliorare equipaggiamento.",
      'scuderie': "Stalle per cavalcature e veicoli."
    };

    return descriptions[type] || "Granlusso del covo.";
  }

  /**
   * Genera report di migrazione
   */
  static async _generateMigrationReport(totalCovos) {
    const newCovos = game.actors.filter(a =>
      a.getFlag('brancalonia-bigat', 'covo') &&
      a.getFlag('brancalonia-bigat', 'migratedFrom') === 'v1'
    );

    const migratedActors = game.actors.filter(a =>
      a.getFlag('brancalonia-bigat', 'covoMigrated')
    );

    let report = `
      <div style="padding: 20px;">
        <h3 style="color: #4CAF50; margin-bottom: 15px;">✅ Migrazione Completata con Successo!</h3>

        <div style="background: rgba(76, 175, 80, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4>📊 Riepilogo:</h4>
          <ul style="margin: 10px 0;">
            <li><strong>${totalCovos}</strong> covi migrati</li>
            <li><strong>${migratedActors.length}</strong> personaggi aggiornati</li>
            <li><strong>${newCovos.length}</strong> nuovi Actor Covo creati</li>
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h4>📝 Covi Creati:</h4>
          <ul style="margin: 10px 0;">
    `;

    newCovos.forEach(covo => {
      const members = game.actors.filter(a =>
        a.getFlag('brancalonia-bigat', 'covoId') === covo.id
      );
      report += `
        <li>
          <strong>${covo.name}</strong> - ${members.length} membri
          <button class="view-covo" data-covo-id="${covo.id}" style="margin-left: 10px; padding: 2px 8px; background: #8B4513; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Visualizza
          </button>
        </li>
      `;
    });

    report += `
          </ul>
        </div>

        <div style="background: #FFF3CD; padding: 10px; border-radius: 8px; border: 1px solid #FFC107;">
          <p style="margin: 0;">
            <strong>💡 Prossimi passi:</strong><br>
            • Verifica che tutti i granlussi siano migrati correttamente<br>
            • Controlla le associazioni dei membri<br>
            • Personalizza le descrizioni e immagini dei covi<br>
            • Considera di rimuovere i vecchi dati dopo verifica
          </p>
        </div>
      </div>
    `;

    return report;
  }

  /**
   * Pulisce i vecchi dati dopo migrazione
   */
  static async cleanupOldData() {
    const confirmed = await Dialog.confirm({
      title: "Pulizia Dati Vecchi",
      content: `
        <p><strong>⚠️ ATTENZIONE:</strong></p>
        <p>Questa operazione rimuoverà permanentemente tutti i vecchi flag del sistema covo v1.</p>
        <p>Assicurati di aver verificato che la migrazione sia andata a buon fine!</p>
        <p><strong>Vuoi procedere?</strong></p>
      `
    });

    if (!confirmed) return;

    const actors = game.actors.filter(a =>
      a.getFlag('brancalonia-bigat', 'covoMigrated')
    );

    let cleaned = 0;
    for (const actor of actors) {
      await actor.unsetFlag('brancalonia-bigat', 'covo');
      await actor.unsetFlag('brancalonia-bigat', 'sharedCovoId');
      await actor.unsetFlag('brancalonia-bigat', 'covoMigrated');
      cleaned++;
    }

    ui.notifications.info(`Rimossi vecchi dati da ${cleaned} attori.`);
  }

  /**
   * Verifica integrità dopo migrazione
   */
  static async verifyMigration() {
    const report = {
      success: [],
      warnings: [],
      errors: []
    };

    // Verifica tutti i covi migrati
    const migratedCovos = game.actors.filter(a =>
      a.getFlag('brancalonia-bigat', 'covo') &&
      a.getFlag('brancalonia-bigat', 'migratedFrom') === 'v1'
    );

    for (const covo of migratedCovos) {
      // Verifica granlussi
      const granlussi = covo.items.filter(i =>
        i.getFlag('brancalonia-bigat', 'granlusso')
      );

      if (granlussi.length !== 5) {
        report.warnings.push(`${covo.name}: Solo ${granlussi.length}/5 granlussi trovati`);
      }

      // Verifica membri
      const members = game.actors.filter(a =>
        a.getFlag('brancalonia-bigat', 'covoId') === covo.id
      );

      if (members.length === 0) {
        report.warnings.push(`${covo.name}: Nessun membro associato`);
      }

      report.success.push(`${covo.name}: Migrato correttamente con ${members.length} membri`);
    }

    // Mostra report
    const content = `
      <div style="padding: 15px; max-height: 400px; overflow-y: auto;">
        <h3>📋 Verifica Migrazione</h3>

        ${report.success.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h4 style="color: #4CAF50;">✅ Successi (${report.success.length})</h4>
            <ul>${report.success.map(s => `<li>${s}</li>`).join('')}</ul>
          </div>
        ` : ''}

        ${report.warnings.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h4 style="color: #FF9800;">⚠️ Avvisi (${report.warnings.length})</h4>
            <ul>${report.warnings.map(w => `<li>${w}</li>`).join('')}</ul>
          </div>
        ` : ''}

        ${report.errors.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h4 style="color: #F44336;">❌ Errori (${report.errors.length})</h4>
            <ul>${report.errors.map(e => `<li>${e}</li>`).join('')}</ul>
          </div>
        ` : ''}

        ${report.success.length === migratedCovos.length && report.errors.length === 0 ?
          '<p style="color: #4CAF50; font-weight: bold;">✅ Tutte le migrazioni sono state verificate con successo!</p>' :
          '<p style="color: #FF9800;">Controlla gli avvisi sopra e correggi manualmente se necessario.</p>'
        }
      </div>
    `;

    new Dialog({
      title: "Verifica Migrazione",
      content,
      buttons: {
        ok: { label: "OK" }
      }
    }, {
      width: 500
    }).render(true);

    return report;
  }
}

// Registra comandi globali per migrazione
Hooks.once('ready', () => {
  if (game.user.isGM) {
    // Aggiungi comandi al menu di amministrazione
    game.brancalonia = game.brancalonia || {};
    game.brancalonia.migration = {
      migrateAll: () => CovoMigration.migrateAll(),
      cleanup: () => CovoMigration.cleanupOldData(),
      verify: () => CovoMigration.verifyMigration()
    };

    // Settings per migrazione
    game.settings.register('brancalonia-bigat', 'removeOldCovoData', {
      name: 'Rimuovi Dati Vecchi dopo Migrazione',
      hint: 'Rimuove automaticamente i vecchi flag dopo una migrazione riuscita',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    console.log("Brancalonia | Sistema migrazione covo pronto. Usa game.brancalonia.migration.migrateAll() per iniziare.");
  }
});

// Esporta la classe
export { CovoMigration };