/**
 * Sistema Oggetti Scadenti per Brancalonia
 * Completamente compatibile con dnd5e system per Foundry VTT v13
 */

export class ShoddyEquipment {
  constructor() {
    // Probabilità rottura per tipo
    this.breakChance = {
      weapon: {
        simple: 0.05,    // 5% su 1 naturale
        martial: 0.10,   // 10% su 1 naturale
        improvised: 0.15 // 15% su 1 naturale
      },
      armor: {
        light: 0.05,     // 5% su colpo critico ricevuto
        medium: 0.10,    // 10% su colpo critico ricevuto
        heavy: 0.15      // 15% su colpo critico ricevuto
      },
      shield: 0.10,      // 10% su colpo critico ricevuto
      tool: 0.10         // 10% su fallimento critico
    };

    // Modificatori per oggetti scadenti
    this.shoddyModifiers = {
      weapon: {
        attack: -1,      // -1 al tiro per colpire
        damage: -1,      // -1 ai danni
        critical: 1,     // +1 alla soglia fallimento critico (1-2 invece di 1)
        price: 0.5       // 50% del prezzo
      },
      armor: {
        ac: -1,          // -1 alla CA
        dexCap: -1,      // -1 al massimo bonus destrezza
        strReq: 2,       // +2 ai requisiti di forza
        stealthDis: true,// Svantaggio su furtività
        price: 0.5       // 50% del prezzo
      },
      tool: {
        check: -2,       // -2 alle prove con l'attrezzo
        time: 1.5,       // 50% tempo in più
        price: 0.3       // 30% del prezzo
      }
    };

    // Metodi di riparazione
    this.repairMethods = {
      quick: {
        name: "Riparazione Rapida",
        time: "10 minuti",
        check: { tool: "smith", dc: 10 },
        quality: "temporary", // Si rompe di nuovo dopo 1d4 usi
        cost: "1d6"
      },
      standard: {
        name: "Riparazione Standard",
        time: "1 ora",
        check: { tool: "smith", dc: 13 },
        quality: "normal",
        cost: "2d6"
      },
      expert: {
        name: "Riparazione Esperta",
        time: "4 ore",
        check: { tool: "smith", dc: 15 },
        quality: "improved", // Rimuove status scadente
        cost: "5d6"
      },
      magical: {
        name: "Riparazione Magica",
        spell: "mending",
        quality: "temporary",
        cost: 0
      }
    };

    this._setupHooks();
  }

  _setupHooks() {
    // Hook per modificare oggetti quando vengono creati
    Hooks.on("preCreateItem", (item, data, options, userId) => {
      if (item.flags.brancalonia?.isShoddy) {
        this._applyShoddyModifiers(item);
      }
    });

    // Hook per controllo rottura su 1 naturale (armi)
    Hooks.on("dnd5e.rollAttack", (item, roll) => {
      if (roll.dice[0]?.results[0]?.result === 1) {
        this._checkWeaponBreak(item);
      }
    });

    // Hook per controllo rottura su critico ricevuto (armature)
    Hooks.on("dnd5e.applyDamage", (actor, damage, options) => {
      if (options.critical) {
        this._checkArmorBreak(actor);
      }
    });

    // Hook per aggiungere opzione scadente alla creazione oggetti
    Hooks.on("renderItemSheet", (app, html, data) => {
      if (game.user.isGM) {
        this._addShoddyOption(app, html, data);
      }
    });

    // Hook per gestire oggetti rotti
    Hooks.on("preUpdateItem", (item, update, options, userId) => {
      if (item.flags.brancalonia?.broken) {
        this._handleBrokenItem(item, update);
      }
    });
  }

  /**
   * Applica modificatori scadenti a un oggetto
   */
  _applyShoddyModifiers(item) {
    const updates = {};

    if (item.type === "weapon") {
      const mods = this.shoddyModifiers.weapon;

      // Modifica attacco
      if (item.system.attack?.bonus !== undefined) {
        updates["system.attack.bonus"] = (item.system.attack.bonus || 0) + mods.attack;
      }

      // Modifica danni
      if (item.system.damage?.parts) {
        updates["system.damage.parts"] = item.system.damage.parts.map(part => {
          const [formula, type] = part;
          return [`${formula} - 1`, type];
        });
      }

      // Modifica critico
      if (item.system.critical?.threshold !== undefined) {
        updates["system.critical.threshold"] = Math.max(1,
          (item.system.critical.threshold || 20) - mods.critical
        );
      }

      // Modifica prezzo
      if (item.system.price?.value !== undefined) {
        updates["system.price.value"] = Math.floor(item.system.price.value * mods.price);
      }

      // Aggiungi descrizione
      updates["system.description.value"] = `
        <div class="shoddy-warning">
          <p><strong>⚠️ Oggetto Scadente</strong></p>
          <p>-1 Attacco, -1 Danni, 50% prezzo</p>
          <p>Possibilità di rompersi su 1 naturale</p>
        </div>
        ${item.system.description.value || ''}
      `;

    } else if (item.type === "equipment" && item.system.armor) {
      const mods = this.shoddyModifiers.armor;

      // Modifica CA
      if (item.system.armor.value !== undefined) {
        updates["system.armor.value"] = (item.system.armor.value || 0) + mods.ac;
      }

      // Modifica cap destrezza
      if (item.system.armor.dex !== undefined && item.system.armor.dex !== null) {
        updates["system.armor.dex"] = Math.max(0, (item.system.armor.dex || 0) + mods.dexCap);
      }

      // Modifica requisiti forza
      if (item.system.strength !== undefined) {
        updates["system.strength"] = (item.system.strength || 0) + mods.strReq;
      }

      // Aggiungi svantaggio stealth
      updates["system.stealth"] = true;

      // Modifica prezzo
      if (item.system.price?.value !== undefined) {
        updates["system.price.value"] = Math.floor(item.system.price.value * mods.price);
      }

    } else if (item.type === "tool") {
      const mods = this.shoddyModifiers.tool;

      // Modifica bonus
      if (item.system.bonus !== undefined) {
        updates["system.bonus"] = (item.system.bonus || 0) + mods.check;
      }

      // Modifica prezzo
      if (item.system.price?.value !== undefined) {
        updates["system.price.value"] = Math.floor(item.system.price.value * mods.price);
      }
    }

    // Aggiungi flag e nome
    updates["name"] = `${item.name} (Scadente)`;
    updates["flags.brancalonia.isShoddy"] = true;
    updates["flags.brancalonia.breakChance"] = this._getBreakChance(item);

    item.updateSource(updates);
  }

  /**
   * Trasforma un oggetto normale in scadente
   */
  async makeShoddy(item, options = {}) {
    if (!item) {
      ui.notifications.error("Oggetto non valido!");
      return null;
    }

    // Clona l'oggetto
    const itemData = item.toObject();

    // Aggiungi flag scadente
    itemData.flags = itemData.flags || {};
    itemData.flags.brancalonia = itemData.flags.brancalonia || {};
    itemData.flags.brancalonia.isShoddy = true;

    // Crea nuovo oggetto scadente
    const shoddyItem = new CONFIG.Item.documentClass(itemData);
    this._applyShoddyModifiers(shoddyItem);

    // Se specificato, crea l'oggetto
    if (options.create) {
      const parent = options.parent || item.parent;
      if (parent) {
        return await parent.createEmbeddedDocuments("Item", [shoddyItem.toObject()]);
      }
    }

    return shoddyItem;
  }

  /**
   * Controlla rottura arma
   */
  async _checkWeaponBreak(item) {
    if (!item.flags.brancalonia?.isShoddy) return;
    if (item.flags.brancalonia?.broken) return;

    const breakChance = item.flags.brancalonia?.breakChance || 0.1;
    const roll = Math.random();

    if (roll < breakChance) {
      await this._breakItem(item);
    } else if (roll < breakChance * 2) {
      // Quasi rotto
      ChatMessage.create({
        content: `<p>⚠️ ${item.name} scricchiola pericolosamente!</p>`,
        speaker: ChatMessage.getSpeaker({ actor: item.parent })
      });
    }
  }

  /**
   * Controlla rottura armatura
   */
  async _checkArmorBreak(actor) {
    const armor = actor.items.find(i =>
      i.type === "equipment" &&
      i.system.equipped &&
      i.system.armor?.value &&
      i.flags.brancalonia?.isShoddy
    );

    if (!armor || armor.flags.brancalonia?.broken) return;

    const breakChance = armor.flags.brancalonia?.breakChance || 0.1;

    if (Math.random() < breakChance) {
      await this._breakItem(armor);
    }
  }

  /**
   * Rompe un oggetto
   */
  async _breakItem(item) {
    // Segna come rotto
    await item.update({
      "flags.brancalonia.broken": true,
      "flags.brancalonia.originalName": item.name,
      "name": `${item.name} (ROTTO)`,
      "system.equipped": false
    });

    // Rimuovi effetti dell'oggetto
    if (item.type === "weapon") {
      await item.update({
        "system.damage.parts": [],
        "system.attack.bonus": -99
      });
    } else if (item.type === "equipment" && item.system.armor) {
      await item.update({
        "system.armor.value": 0
      });
    }

    // Notifica drammatica
    ChatMessage.create({
      content: `
        <div class="brancalonia-item-break">
          <h3>💔 OGGETTO ROTTO! 💔</h3>
          <p><strong>${item.flags.brancalonia.originalName}</strong> si è rotto!</p>
          <p>L'oggetto deve essere riparato prima di poter essere usato di nuovo.</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor: item.parent })
    });

    // Effetto sonoro se disponibile
    if (game.audio) {
      AudioHelper.play({ src: "sounds/break.ogg", volume: 0.8 }, true);
    }
  }

  /**
   * Ripara un oggetto rotto
   */
  async repairItem(item, method = "standard") {
    if (!item.flags.brancalonia?.broken) {
      ui.notifications.info("L'oggetto non è rotto!");
      return;
    }

    const repair = this.repairMethods[method];
    if (!repair) {
      ui.notifications.error("Metodo di riparazione non valido!");
      return;
    }

    // Dialog per riparazione
    const content = `
      <div class="repair-dialog">
        <h3>Riparazione: ${item.name}</h3>
        <p><strong>Metodo:</strong> ${repair.name}</p>
        <p><strong>Tempo:</strong> ${repair.time}</p>
        ${repair.check ? `<p><strong>Prova richiesta:</strong> Attrezzi da Fabbro CD ${repair.check.dc}</p>` : ''}
        <p><strong>Costo:</strong> ${repair.cost ? `${repair.cost} ducati` : 'Gratuito'}</p>
        <p><strong>Qualità risultato:</strong> ${
          repair.quality === "temporary" ? "Temporanea (si romperà di nuovo)" :
          repair.quality === "normal" ? "Normale (ancora scadente)" :
          repair.quality === "improved" ? "Migliorata (non più scadente)" :
          "Sconosciuta"
        }</p>
      </div>
    `;

    new Dialog({
      title: "Riparazione Oggetto",
      content: content,
      buttons: {
        repair: {
          label: "Ripara",
          callback: async () => {
            // Esegui check se richiesto
            if (repair.check) {
              const actor = item.parent;
              const roll = await actor.rollToolCheck("smith", { dc: repair.check.dc });

              if (roll.total < repair.check.dc) {
                ChatMessage.create({
                  content: `<p>Riparazione fallita! ${item.name} rimane rotto.</p>`,
                  speaker: ChatMessage.getSpeaker({ actor })
                });
                return;
              }
            }

            // Applica costo
            if (repair.cost) {
              const cost = typeof repair.cost === "string"
                ? (await new Roll(repair.cost).evaluate()).total
                : repair.cost;

              const actor = item.parent;
              const currentMoney = actor.system.currency?.du || 0;

              if (currentMoney < cost) {
                ui.notifications.error(`Servono ${cost} ducati per la riparazione!`);
                return;
              }

              await actor.update({
                "system.currency.du": currentMoney - cost
              });
            }

            // Ripara l'oggetto
            await this._performRepair(item, repair);
          }
        },
        cancel: {
          label: "Annulla"
        }
      },
      default: "repair"
    }).render(true);
  }

  /**
   * Esegue la riparazione
   */
  async _performRepair(item, repair) {
    const updates = {
      "flags.brancalonia.broken": false,
      "name": item.flags.brancalonia.originalName || item.name.replace(" (ROTTO)", "")
    };

    // Ripristina statistiche originali
    if (item.type === "weapon") {
      // Recupera dati originali (approssimati)
      const baseItem = game.items.find(i => i.name === updates.name && !i.flags.brancalonia?.isShoddy);

      if (baseItem) {
        updates["system.damage.parts"] = baseItem.system.damage.parts;
        updates["system.attack.bonus"] = baseItem.system.attack.bonus;
      } else {
        // Valori di default
        updates["system.damage.parts"] = [["1d6", "slashing"]];
        updates["system.attack.bonus"] = 0;
      }

      // Applica modificatori scadenti se ancora scadente
      if (repair.quality !== "improved" && item.flags.brancalonia?.isShoddy) {
        updates["system.attack.bonus"] = (updates["system.attack.bonus"] || 0) - 1;
        updates["system.damage.parts"] = updates["system.damage.parts"].map(part => {
          const [formula, type] = part;
          return [`${formula} - 1`, type];
        });
      }

    } else if (item.type === "equipment" && item.system.armor) {
      const baseArmor = game.items.find(i => i.name === updates.name && !i.flags.brancalonia?.isShoddy);

      if (baseArmor) {
        updates["system.armor.value"] = baseArmor.system.armor.value;
      } else {
        updates["system.armor.value"] = 10; // AC base
      }

      // Applica modificatori scadenti
      if (repair.quality !== "improved" && item.flags.brancalonia?.isShoddy) {
        updates["system.armor.value"] -= 1;
      }
    }

    // Gestisci qualità riparazione
    if (repair.quality === "temporary") {
      updates["flags.brancalonia.temporaryRepair"] = true;
      updates["flags.brancalonia.repairUses"] = (await new Roll("1d4").evaluate()).total;
    } else if (repair.quality === "improved") {
      updates["flags.brancalonia.isShoddy"] = false;
      updates["name"] = updates.name.replace(" (Scadente)", "");
    }

    await item.update(updates);

    ChatMessage.create({
      content: `
        <div class="brancalonia-repair-success">
          <h3>🔧 Riparazione Completata!</h3>
          <p><strong>${item.name}</strong> è stato riparato con successo!</p>
          ${repair.quality === "temporary" ?
            `<p>⚠️ Riparazione temporanea - durerà ${updates["flags.brancalonia.repairUses"]} usi</p>` :
            repair.quality === "improved" ?
            `<p>✨ L'oggetto non è più scadente!</p>` :
            `<p>L'oggetto è stato riparato ma rimane scadente.</p>`
          }
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor: item.parent })
    });
  }

  /**
   * Aggiunge opzione scadente alla scheda oggetto
   */
  _addShoddyOption(app, html, data) {
    if (!["weapon", "equipment", "tool"].includes(data.item.type)) return;

    const shoddyHtml = `
      <div class="form-group">
        <label>
          <input type="checkbox" name="flags.brancalonia.isShoddy"
            ${data.item.flags?.brancalonia?.isShoddy ? 'checked' : ''} />
          Oggetto Scadente (Brancalonia)
        </label>
      </div>
    `;

    // Inserisci dopo il campo rarità o prezzo
    const insertPoint = html.find('[name="system.rarity"]').closest('.form-group');
    if (insertPoint.length) {
      insertPoint.after(shoddyHtml);
    } else {
      html.find('.sheet-body').prepend(shoddyHtml);
    }

    // Aggiungi listener
    html.find('[name="flags.brancalonia.isShoddy"]').change(async (ev) => {
      const isShoddy = ev.target.checked;

      if (isShoddy) {
        // Applica modificatori scadenti
        const updates = this._calculateShoddyUpdates(app.object);
        await app.object.update(updates);
      } else {
        // Rimuovi modificatori scadenti
        const updates = this._removeShoddyUpdates(app.object);
        await app.object.update(updates);
      }
    });
  }

  /**
   * Calcola modifiche per oggetto scadente
   */
  _calculateShoddyUpdates(item) {
    const updates = {
      "flags.brancalonia.isShoddy": true,
      "flags.brancalonia.breakChance": this._getBreakChance(item)
    };

    if (!item.name.includes("(Scadente)")) {
      updates.name = `${item.name} (Scadente)`;
    }

    // Modifica prezzo
    if (item.system.price?.value) {
      updates["system.price.value"] = Math.floor(item.system.price.value * 0.5);
    }

    return updates;
  }

  /**
   * Rimuove modifiche oggetto scadente
   */
  _removeShoddyUpdates(item) {
    const updates = {
      "flags.brancalonia.isShoddy": false,
      "flags.brancalonia.breakChance": null
    };

    if (item.name.includes("(Scadente)")) {
      updates.name = item.name.replace(" (Scadente)", "");
    }

    // Ripristina prezzo (approssimato)
    if (item.system.price?.value) {
      updates["system.price.value"] = Math.floor(item.system.price.value * 2);
    }

    return updates;
  }

  /**
   * Ottiene probabilità di rottura per tipo oggetto
   */
  _getBreakChance(item) {
    if (item.type === "weapon") {
      const weaponType = item.system.weaponType || "simple";
      return this.breakChance.weapon[weaponType] || 0.1;
    } else if (item.type === "equipment" && item.system.armor) {
      const armorType = item.system.armor.type || "light";
      return this.breakChance.armor[armorType] || 0.1;
    } else if (item.type === "tool") {
      return this.breakChance.tool || 0.1;
    }
    return 0.05;
  }

  /**
   * Gestisce oggetti rotti
   */
  _handleBrokenItem(item, update) {
    // Previeni equipaggiamento di oggetti rotti
    if (update.system?.equipped && item.flags.brancalonia?.broken) {
      ui.notifications.error("Non puoi equipaggiare un oggetto rotto!");
      delete update.system.equipped;
      return false;
    }
  }

  /**
   * Genera loot scadente
   */
  generateShoddyLoot(quantity = 1, type = null) {
    const lootTables = {
      weapons: [
        "Pugnale", "Spada Corta", "Mazza", "Lancia",
        "Ascia", "Martello", "Randello"
      ],
      armor: [
        "Cuoio", "Cuoio Borchiato", "Giaco di Maglia"
      ],
      tools: [
        "Attrezzi da Ladro", "Kit da Erborista", "Attrezzi da Fabbro"
      ]
    };

    const loot = [];

    for (let i = 0; i < quantity; i++) {
      let selectedType = type;
      if (!selectedType) {
        const types = Object.keys(lootTables);
        selectedType = types[Math.floor(Math.random() * types.length)];
      }

      const table = lootTables[selectedType];
      if (table) {
        const itemName = table[Math.floor(Math.random() * table.length)];
        loot.push({
          name: `${itemName} (Scadente)`,
          type: selectedType,
          shoddy: true
        });
      }
    }

    return loot;
  }

  /**
   * Crea macro per gestione oggetti scadenti
   */
  static createShoddyMacros() {
    const macros = [
      {
        name: "Rendi Scadente",
        type: "script",
        img: "icons/tools/smithing/hammer-worn-brown.webp",
        command: `
          const item = game.user.character?.items.find(i => i.id === game.user.targets.first()?.id);
          if (item) {
            game.brancalonia.shoddyItems.makeShoddy(item, { create: true });
          } else {
            ui.notifications.warn("Seleziona un oggetto!");
          }
        `
      },
      {
        name: "Ripara Oggetto",
        type: "script",
        img: "icons/tools/smithing/anvil.webp",
        command: `
          const actor = game.user.character || canvas.tokens.controlled[0]?.actor;
          if (actor) {
            const broken = actor.items.filter(i => i.flags.brancalonia?.broken);
            if (broken.length > 0) {
              game.brancalonia.shoddyItems.repairItem(broken[0]);
            } else {
              ui.notifications.info("Nessun oggetto rotto!");
            }
          }
        `
      }
    ];

    macros.forEach(macroData => {
      Macro.create(macroData);
    });

    ui.notifications.info("Macro Oggetti Scadenti create");
  }
}