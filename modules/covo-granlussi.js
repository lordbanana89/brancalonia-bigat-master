/**
 * Sistema Granlussi del Covo - Implementazione Corretta
 * Basato sul manuale Brancalonia (pag. 43-45)
 * Compatibile con dnd5e system v3.3.x
 *
 * I 5 GRANLUSSI DAL MANUALE:
 * - Borsa Nera: commercio oggetti magici
 * - Cantina: recupero riposo lungo migliorato
 * - Distilleria: intrugli alchemici
 * - Fucina: riparazione e miglioramento armi
 * - Scuderie: cavalcature e veicoli
 *
 * Ogni Granlusso ha 3 livelli:
 * - Livello 1: 100 mo
 * - Livello 2: 50 mo aggiuntivi
 * - Livello 3: 50 mo aggiuntivi
 */

export class CovoGranlussiSystem {
  constructor() {
    this.granlussi = {
      borsaNera: {
        name: "Borsa Nera",
        icon: "icons/containers/bags/pouch-simple-leather-brown.webp",
        description: "Rete commerciale per oggetti magici e materiali rari",
        levels: {
          1: {
            cost: 100,
            benefits: "Oggetti magici comuni al costo di 50 mo",
            monthlyItems: 1,
            rarity: "common"
          },
          2: {
            cost: 50,
            benefits: "Oggetti magici non comuni al costo di 150 mo",
            monthlyItems: 1,
            rarity: "uncommon"
          },
          3: {
            cost: 50,
            benefits: "Il ricettatore può provare a recuperare oggetti specifici",
            monthlyItems: 1,
            rarity: "rare",
            specificOrder: true
          }
        }
      },

      cantina: {
        name: "Cantina",
        icon: "icons/environment/settlement/cellar.webp",
        description: "Luogo fresco per conservare cibo e bevande",
        provides: "Utensili da Cuoco",
        levels: {
          1: {
            cost: 100,
            benefits: "Recuperi tutti i Dadi Vita invece che metà durante riposo lungo",
            rations: 1, // Razioni gratuite per personaggio
            effect: "fullHD"
          },
          2: {
            cost: 50,
            benefits: "Recuperi 1 livello di indebolimento aggiuntivo durante riposo lungo",
            rations: 2,
            effect: "extraExhaustion"
          },
          3: {
            cost: 50,
            benefits: "Ottieni 1 punto ispirazione durante riposo lungo",
            rations: 3,
            effect: "inspiration"
          }
        }
      },

      distilleria: {
        name: "Distilleria",
        icon: "icons/tools/laboratory/alembic-copper-blue.webp",
        description: "Alambicchi per distillare intrugli e bevande",
        provides: "Scorte da Mescitore e Scorte da Alchimista",
        levels: {
          1: {
            cost: 100,
            benefits: "Acquamorte o Richiamino gratuiti",
            intrugli: ["acquamorte", "richiamino"]
          },
          2: {
            cost: 50,
            benefits: "Afrore di Servatico o Infernet Malebranca gratuiti",
            intrugli: ["afrore_servatico", "infernet_malebranca"]
          },
          3: {
            cost: 50,
            benefits: "Cordiale Biondino o Intruglio della Forza gratuiti",
            intrugli: ["cordiale_biondino", "intruglio_forza"]
          }
        }
      },

      fucina: {
        name: "Fucina",
        icon: "icons/tools/smithing/anvil.webp",
        description: "Forge per riparare e migliorare equipaggiamento",
        provides: "Strumenti da Fabbro e Arnesi da Scasso",
        levels: {
          1: {
            cost: 100,
            benefits: "Il fabbro può riparare oggetti metallici rotti",
            repairMetal: true
          },
          2: {
            cost: 50,
            benefits: "Il fabbro può sbloccare lucchetti (non magici)",
            unlock: true
          },
          3: {
            cost: 50,
            benefits: "Disponibili armi/armature non scadenti",
            nonShoddy: true
          }
        }
      },

      scuderie: {
        name: "Scuderie",
        icon: "icons/environment/settlement/stable.webp",
        description: "Stalle per cavalcature e veicoli",
        levels: {
          1: {
            cost: 100,
            benefits: "Pony scadente, Asino, Mulo, Carretto scadente, Slitta scadente",
            mounts: ["pony_shoddy", "donkey", "mule"],
            vehicles: ["cart_shoddy", "sled_shoddy"]
          },
          2: {
            cost: 50,
            benefits: "Cavallo da Traino/Galoppo scadente, Carro scadente",
            mounts: ["draft_horse_shoddy", "riding_horse_shoddy"],
            vehicles: ["wagon_shoddy"]
          },
          3: {
            cost: 50,
            benefits: "Tutti i servizi precedenti ma non scadenti",
            nonShoddy: true
          }
        }
      }
    };

    this.intrugli = {
      acquamorte: {
        name: "Acquamorte",
        type: "potion",
        img: "icons/consumables/potions/bottle-round-corked-yellow.webp",
        system: {
          description: { value: "Cura 2d4+2 punti ferita quando bevuta." },
          uses: { value: 1, max: 1, per: null },
          actionType: "heal",
          damage: { parts: [["2d4 + 2", "healing"]] },
          rarity: "common",
          price: { value: 15, denomination: "gp" }
        }
      },
      richiamino: {
        name: "Richiamino",
        type: "consumable",
        img: "icons/consumables/potions/bottle-round-flask-purple.webp",
        system: {
          description: { value: "Risveglia immediatamente una creatura priva di sensi (0 PF)." },
          uses: { value: 1, max: 1, per: null },
          actionType: "util",
          rarity: "common",
          price: { value: 20, denomination: "gp" }
        }
      },
      afrore_servatico: {
        name: "Afrore di Servatico",
        type: "potion",
        img: "icons/consumables/potions/bottle-round-corked-green.webp",
        system: {
          description: { value: "Conferisce resistenza a veleni per 1 ora." },
          uses: { value: 1, max: 1, per: null },
          duration: { value: 1, units: "hour" },
          actionType: "util",
          rarity: "uncommon",
          price: { value: 30, denomination: "gp" }
        }
      },
      infernet_malebranca: {
        name: "Infernet Malebranca",
        type: "potion",
        img: "icons/consumables/potions/bottle-round-corked-red.webp",
        system: {
          description: { value: "Conferisce resistenza al fuoco per 1 ora." },
          uses: { value: 1, max: 1, per: null },
          duration: { value: 1, units: "hour" },
          actionType: "util",
          rarity: "uncommon",
          price: { value: 40, denomination: "gp" }
        }
      },
      cordiale_biondino: {
        name: "Cordiale Biondino",
        type: "potion",
        img: "icons/consumables/potions/bottle-round-corked-orange.webp",
        system: {
          description: { value: "Rimuove 1 livello di indebolimento." },
          uses: { value: 1, max: 1, per: null },
          actionType: "heal",
          rarity: "uncommon",
          price: { value: 50, denomination: "gp" }
        }
      },
      intruglio_forza: {
        name: "Intruglio della Forza",
        type: "potion",
        img: "icons/consumables/potions/bottle-bulb-corked-red.webp",
        system: {
          description: { value: "Forza diventa 21 per 1 ora." },
          uses: { value: 1, max: 1, per: null },
          duration: { value: 1, units: "hour" },
          actionType: "util",
          changes: [{
            key: "system.abilities.str.value",
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value: 21
          }],
          rarity: "rare",
          price: { value: 100, denomination: "gp" }
        }
      }
    };

    this._setupHooks();
  }

  _setupHooks() {
    // Hook per aggiungere UI del Covo
    Hooks.on("renderActorSheetV2", (app, html, data) => {
      if (game.user.isGM && data.actor.type === "character") {
        this._renderCovoUI(app, html, data);
      }
    });

    // Hook per applicare benefici all'inizio del lavoretto
    Hooks.on("brancalonia.jobStarted", (actors) => {
      this._applyGranlussiBenefits(actors);
    });

    // Hook per fase di Sbraco
    Hooks.on("brancalonia.sbracoStarted", () => {
      if (game.user.isGM) {
        this._openGranlussiManagement();
      }
    });
  }

  /**
   * Renderizza UI del Covo sulla scheda
   */
  _renderCovoUI(app, html, data) {
    const actor = app.actor;
    const covo = actor.getFlag("brancalonia-bigat", "covo") || {};

    const covoHtml = `
      <div class="brancalonia-covo-section" style="border: 2px solid #8B4513; padding: 10px; margin: 10px 0;">
        <h3 style="display: flex; justify-content: space-between; align-items: center;">
          <span><i class="fas fa-home"></i> Covo della Banda</span>
          ${game.user.isGM ? `<button class="manage-covo" style="font-size: 0.8em;">Gestisci</button>` : ''}
        </h3>

        <div class="granlussi-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
          ${this._renderGranlussiList(covo)}
        </div>
      </div>
    `;

    // Inserisci dopo l'inventario
    const inventoryTab = html.find('.tab.inventory');
    if (inventoryTab.length) {
      inventoryTab.append(covoHtml);
    } else {
      html.find('.sheet-body').append(covoHtml);
    }

    // Event listener
    html.find('.manage-covo').click(() => {
      this._openCovoManagementDialog(actor);
    });
  }

  /**
   * Renderizza lista Granlussi
   */
  _renderGranlussiList(covo) {
    let html = '';

    for (const [key, granlusso] of Object.entries(this.granlussi)) {
      const level = covo[key] || 0;
      const levelInfo = level > 0 ? granlusso.levels[level] : null;

      html += `
        <div class="granlusso-item" style="border: 1px solid #ccc; padding: 5px; border-radius: 5px;">
          <div style="display: flex; align-items: center; gap: 5px;">
            <img src="${granlusso.icon}" width="24" height="24">
            <strong>${granlusso.name}</strong>
          </div>
          <div style="font-size: 0.9em; margin-top: 5px;">
            Livello: ${level}/3
            ${levelInfo ? `<br><em style="font-size: 0.8em;">${levelInfo.benefits}</em>` : ''}
          </div>
        </div>
      `;
    }

    return html;
  }

  /**
   * Dialog per gestione del Covo
   */
  _openCovoManagementDialog(actor) {
    const covo = actor.getFlag("brancalonia-bigat", "covo") || {};
    const money = actor.system.currency?.gp || 0;

    let content = `
      <div class="covo-management">
        <p>Denaro disponibile: <strong>${money} mo</strong></p>
        <hr>
        <div class="granlussi-upgrade">
    `;

    for (const [key, granlusso] of Object.entries(this.granlussi)) {
      const currentLevel = covo[key] || 0;
      const canUpgrade = currentLevel < 3;
      const nextLevel = currentLevel + 1;
      const cost = canUpgrade ? granlusso.levels[nextLevel].cost : 0;

      content += `
        <div class="granlusso-upgrade-item" style="margin-bottom: 15px; padding: 10px; border: 1px solid #ccc;">
          <h4>${granlusso.name} (Livello ${currentLevel}/3)</h4>
          <p style="font-size: 0.9em;">${granlusso.description}</p>

          ${currentLevel > 0 ? `
            <p><strong>Benefici attuali:</strong> ${granlusso.levels[currentLevel].benefits}</p>
          ` : ''}

          ${canUpgrade ? `
            <p><strong>Prossimo livello (${nextLevel}):</strong> ${granlusso.levels[nextLevel].benefits}</p>
            <p><strong>Costo:</strong> ${cost} mo</p>
            <button class="upgrade-granlusso" data-key="${key}" data-cost="${cost}"
              ${money < cost ? 'disabled' : ''}>
              ${money < cost ? 'Fondi insufficienti' : `Migliora (${cost} mo)`}
            </button>
          ` : '<p><em>Livello massimo raggiunto!</em></p>'}
        </div>
      `;
    }

    content += `
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: `Gestione Covo - ${actor.name}`,
      content,
      buttons: {
        close: {
          label: "Chiudi"
        }
      },
      render: (html) => {
        html.find('.upgrade-granlusso').click(async (e) => {
          const key = e.currentTarget.dataset.key;
          const cost = parseInt(e.currentTarget.dataset.cost);

          await this._upgradeGranlusso(actor, key, cost);
          dialog.close();
          this._openCovoManagementDialog(actor); // Riapri con valori aggiornati
        });
      }
    });

    dialog.render(true);
  }

  /**
   * Migliora un Granlusso
   */
  async _upgradeGranlusso(actor, granlussoKey, cost) {
    const currentMoney = actor.system.currency?.gp || 0;
    if (currentMoney < cost) {
      ui.notifications.error("Fondi insufficienti!");
      return;
    }

    // Sottrai denaro
    await actor.update({
      "system.currency.gp": currentMoney - cost
    });

    // Aumenta livello Granlusso
    const covo = actor.getFlag("brancalonia-bigat", "covo") || {};
    const currentLevel = covo[granlussoKey] || 0;
    covo[granlussoKey] = currentLevel + 1;

    await actor.setFlag("brancalonia-bigat", "covo", covo);

    // Notifica
    const granlusso = this.granlussi[granlussoKey];
    ChatMessage.create({
      content: `
        <div class="brancalonia-granlusso-upgrade">
          <h3>${granlusso.name} migliorato!</h3>
          <p>${actor.name} ha migliorato ${granlusso.name} al livello ${covo[granlussoKey]}.</p>
          <p><strong>Nuovi benefici:</strong> ${granlusso.levels[covo[granlussoKey]].benefits}</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({actor})
    });
  }

  /**
   * Applica benefici Granlussi all'inizio del lavoretto
   */
  async _applyGranlussiBenefits(actors) {
    for (const actor of actors) {
      const covo = actor.getFlag("brancalonia-bigat", "covo") || {};

      // Cantina - razioni gratuite
      if (covo.cantina > 0) {
        const rations = this.granlussi.cantina.levels[covo.cantina].rations;
        ChatMessage.create({
          content: `${actor.name} riceve ${rations} razione/i dalla Cantina.`,
          speaker: ChatMessage.getSpeaker({actor})
        });
      }

      // Distilleria - intruglio gratuito
      if (covo.distilleria > 0) {
        const intrugli = this.granlussi.distilleria.levels[covo.distilleria].intrugli;
        await this._selectFreePotion(actor, intrugli);
      }

      // Fucina - ignora qualità scadente
      if (covo.fucina > 0) {
        const level = covo.fucina;
        await actor.setFlag("brancalonia-bigat", "fucinaLevel", level);

        // Permetti di selezionare oggetti da migliorare
        if (level >= 1) {
          this._selectItemsToImprove(actor, level);
        }
      }

      // Scuderie - prestito cavalcature
      if (covo.scuderie > 0) {
        this._offerMountLoan(actor, covo.scuderie);
      }

      // Borsa Nera - oggetti magici mensili
      if (covo.borsaNera > 0) {
        // Controlla se è passato un mese
        const lastCheck = actor.getFlag("brancalonia-bigat", "borsaNeraLastCheck") || 0;
        const now = Date.now();
        const monthInMs = 30 * 24 * 60 * 60 * 1000;

        if (now - lastCheck > monthInMs) {
          await this._generateMagicItems(actor, covo.borsaNera);
          await actor.setFlag("brancalonia-bigat", "borsaNeraLastCheck", now);
        }
      }
    }
  }

  /**
   * Seleziona intruglio gratuito dalla Distilleria
   */
  async _selectFreePotion(actor, availableIntrugli) {
    const options = availableIntrugli.map(key => {
      const intruglio = this.intrugli[key];
      return `<option value="${key}">${intruglio.name}</option>`;
    }).join('');

    const content = `
      <p>Scegli un intruglio gratuito dalla Distilleria:</p>
      <select name="intruglio">${options}</select>
    `;

    new Dialog({
      title: "Distilleria - Intruglio Gratuito",
      content,
      buttons: {
        confirm: {
          label: "Prendi",
          callback: async (html) => {
            const chosen = html.find('select[name="intruglio"]').val();
            const itemData = this.intrugli[chosen];

            if (itemData) {
              await actor.createEmbeddedDocuments("Item", [itemData]);
              ChatMessage.create({
                content: `${actor.name} riceve ${itemData.name} dalla Distilleria.`,
                speaker: ChatMessage.getSpeaker({actor})
              });
            }
          }
        }
      }
    }).render(true);
  }

  /**
   * Seleziona oggetti da migliorare con la Fucina
   */
  async _selectItemsToImprove(actor, fucinaLevel) {
    const shoddyItems = actor.items.filter(i =>
      i.flags?.brancalonia?.shoddy &&
      ["weapon", "equipment"].includes(i.type)
    );

    if (shoddyItems.length === 0) return;

    const maxItems = fucinaLevel;
    const options = shoddyItems.map(item =>
      `<label>
        <input type="checkbox" name="improve" value="${item.id}">
        ${item.name}
      </label>`
    ).join('<br>');

    const content = `
      <p>La Fucina può ignorare la qualità scadente di ${maxItems} oggetto/i:</p>
      <div>${options}</div>
    `;

    new Dialog({
      title: "Fucina - Migliora Oggetti",
      content,
      buttons: {
        confirm: {
          label: "Conferma",
          callback: async (html) => {
            const selected = html.find('input[name="improve"]:checked')
              .toArray()
              .slice(0, maxItems)
              .map(el => el.value);

            for (const itemId of selected) {
              const item = actor.items.get(itemId);
              if (item) {
                await item.setFlag("brancalonia-bigat", "temporaryImproved", true);
                ChatMessage.create({
                  content: `${item.name} temporaneamente migliorato dalla Fucina.`,
                  speaker: ChatMessage.getSpeaker({actor})
                });
              }
            }
          }
        }
      }
    }).render(true);
  }

  /**
   * Offre prestito cavalcature dalle Scuderie
   */
  _offerMountLoan(actor, scuderieLevel) {
    const level = this.granlussi.scuderie.levels[scuderieLevel];
    const availableMounts = [];
    const availableVehicles = [];

    // Raccogli disponibili per livello
    for (let i = 1; i <= scuderieLevel; i++) {
      const lvl = this.granlussi.scuderie.levels[i];
      if (lvl.mounts) availableMounts.push(...lvl.mounts);
      if (lvl.vehicles) availableVehicles.push(...lvl.vehicles);
    }

    // Se livello 3, rimuovi "scadente"
    const nonShoddy = level.nonShoddy;
    const cleanName = (name) => nonShoddy ? name.replace('_shoddy', '') : name;

    const mountOptions = availableMounts.map(m =>
      `<option value="${m}">${cleanName(m).replace('_', ' ')}</option>`
    ).join('');

    const vehicleOptions = availableVehicles.map(v =>
      `<option value="${v}">${cleanName(v).replace('_', ' ')}</option>`
    ).join('');

    const content = `
      <p>Le Scuderie offrono cavalcature e veicoli in prestito:</p>

      <div>
        <label>
          <strong>Cavalcatura:</strong>
          <select name="mount">
            <option value="">Nessuna</option>
            ${mountOptions}
          </select>
        </label>
      </div>

      <div>
        <label>
          <strong>Veicolo:</strong>
          <select name="vehicle">
            <option value="">Nessuno</option>
            ${vehicleOptions}
          </select>
        </label>
      </div>

      <p style="color: red; font-size: 0.9em;">
        ⚠️ Se perdi il prestito, dovrai pagare il valore intero!
      </p>
    `;

    new Dialog({
      title: "Scuderie - Prestito",
      content,
      buttons: {
        confirm: {
          label: "Prendi in prestito",
          callback: async (html) => {
            const mount = html.find('select[name="mount"]').val();
            const vehicle = html.find('select[name="vehicle"]').val();

            const loans = [];
            if (mount) loans.push({type: "mount", name: mount});
            if (vehicle) loans.push({type: "vehicle", name: vehicle});

            if (loans.length > 0) {
              await actor.setFlag("brancalonia-bigat", "scuderieLoan", loans);

              const loanText = loans.map(l =>
                cleanName(l.name).replace('_', ' ')
              ).join(' e ');

              ChatMessage.create({
                content: `${actor.name} prende in prestito: ${loanText}`,
                speaker: ChatMessage.getSpeaker({actor})
              });
            }
          }
        },
        cancel: {
          label: "Annulla"
        }
      }
    }).render(true);
  }

  /**
   * Genera oggetti magici dalla Borsa Nera
   */
  async _generateMagicItems(actor, borsaNeraLevel) {
    const level = this.granlussi.borsaNera.levels[borsaNeraLevel];
    const rarity = level.rarity;

    // Qui andrebbe integrato con il compendio oggetti magici
    // Per ora generiamo placeholder
    const items = [
      {
        name: `Oggetto Magico ${rarity}`,
        type: "equipment",
        img: "icons/magic/defensive/amulet-gem-blue-gold.webp",
        system: {
          description: { value: `Un oggetto magico ${rarity} disponibile dalla Borsa Nera.` },
          rarity: rarity,
          price: {
            value: rarity === "common" ? 50 : rarity === "uncommon" ? 150 : 500,
            denomination: "gp"
          }
        }
      }
    ];

    ChatMessage.create({
      content: `
        <div class="borsa-nera-items">
          <h3>Borsa Nera - Nuovi Oggetti Disponibili</h3>
          <p>Il ricettatore ha trovato ${items.length} oggetto/i magico/i questo mese.</p>
          <ul>
            ${items.map(i => `<li>${i.name} (${i.system.price.value} mo)</li>`).join('')}
          </ul>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({actor})
    });
  }

  /**
   * Dialog per gestione Granlussi durante lo Sbraco
   */
  _openGranlussiManagement() {
    const content = `
      <div class="granlussi-sbraco">
        <h3>Gestione Granlussi - Fase di Sbraco</h3>
        <p>Durante lo Sbraco puoi:</p>
        <ul>
          <li>Costruire o migliorare un Granlusso (1 settimana)</li>
          <li>Riscattare materiali per dimezzare i costi</li>
          <li>Riparare danni al Covo</li>
        </ul>

        <button class="manage-all-covos">Gestisci Covi della Cricca</button>
      </div>
    `;

    new Dialog({
      title: "Granlussi - Sbraco",
      content,
      buttons: {
        close: { label: "Chiudi" }
      },
      render: (html) => {
        html.find('.manage-all-covos').click(() => {
          // Apri gestione per tutti i PG
          game.actors.filter(a => a.type === "character" && a.hasPlayerOwner)
            .forEach(actor => this._openCovoManagementDialog(actor));
        });
      }
    }).render(true);
  }

  /**
   * Riscatta materiali per Granlussi
   */
  async riscattaMateriali(actor, items, granlussoKey) {
    const granlusso = this.granlussi[granlussoKey];
    if (!granlusso) return;

    let totalValue = 0;
    for (const item of items) {
      const value = item.system.price?.value || 0;
      totalValue += Math.floor(value / 2); // Metà del valore
      await item.delete(); // Rimuovi oggetto
    }

    ChatMessage.create({
      content: `
        <p>${actor.name} riscatta materiali per ${granlusso.name}.</p>
        <p>Valore recuperato: ${totalValue} mo</p>
      `,
      speaker: ChatMessage.getSpeaker({actor})
    });

    // Applica come sconto al prossimo upgrade
    await actor.setFlag("brancalonia-bigat", `${granlussoKey}Discount`, totalValue);
  }

  /**
   * Registra impostazioni
   */
  static registerSettings() {
    game.settings.register("brancalonia-bigat", "covoShared", {
      name: "Covo Condiviso",
      hint: "Il Covo è condiviso tra tutti i personaggi giocanti",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register("brancalonia-bigat", "granlussiStarting", {
      name: "Granlussi Iniziali",
      hint: "Numero di Granlussi con cui inizia una nuova banda",
      scope: "world",
      config: true,
      type: Number,
      default: 2,
      range: {
        min: 0,
        max: 5,
        step: 1
      }
    });
  }
}