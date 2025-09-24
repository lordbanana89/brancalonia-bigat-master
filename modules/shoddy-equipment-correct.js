/**
 * Sistema Equipaggiamento Scadente e Contraffatto - Implementazione Corretta
 * Basato sul manuale Brancalonia (pag. 42, 62-63)
 * Compatibile con dnd5e system v3.3.x
 *
 * REGOLE DAL MANUALE:
 * - Prezzo: 10% del valore normale (non 50%!)
 * - Effetti variabili per tipo di oggetto
 * - Sistema "contraffatto" per servizi e animali
 */

export class ShoddyEquipmentCorrect {
  constructor() {
    // Configurazione secondo il manuale
    this.shoddyConfig = {
      // Prezzo fisso per tutti: 10% del normale
      priceMultiplier: 0.1,

      // Effetti per categoria (pag. 63)
      effects: {
        weapon: {
          melee: [
            { weight: 30, effect: "fragile", description: "Si rompe su 1 naturale" },
            { weight: 20, effect: "unbalanced", description: "Svantaggio al primo attacco del combattimento" },
            { weight: 20, effect: "dull", description: "-2 ai danni (minimo 1)" },
            { weight: 15, effect: "heavy", description: "Richiede STR 13 o svantaggio" },
            { weight: 15, effect: "rusty", description: "Critico solo su 20 naturale" }
          ],
          ranged: [
            { weight: 30, effect: "warped", description: "Gittata dimezzata" },
            { weight: 25, effect: "loose", description: "Svantaggio oltre gittata normale" },
            { weight: 25, effect: "fragile", description: "Si rompe su 1 naturale" },
            { weight: 20, effect: "inaccurate", description: "-2 al tiro per colpire" }
          ]
        },
        armor: [
          { weight: 25, effect: "rusty", description: "Svantaggio a Furtività anche se non lo darebbe" },
          { weight: 25, effect: "ill-fitting", description: "Velocità -5 piedi" },
          { weight: 20, effect: "gaps", description: "-1 CA" },
          { weight: 15, effect: "heavy", description: "+2 requisito FOR (se presente)" },
          { weight: 15, effect: "fragile", description: "Si rompe se subisci critico" }
        ],
        shield: [
          { weight: 40, effect: "cracked", description: "Si rompe se subisci critico" },
          { weight: 30, effect: "unwieldy", description: "Non puoi usare l'azione Schivata" },
          { weight: 30, effect: "light", description: "+1 CA invece di +2" }
        ],
        tool: [
          { weight: 50, effect: "incomplete", description: "-2 alle prove con l'attrezzo" },
          { weight: 30, effect: "fragile", description: "Si rompe su 1 naturale alla prova" },
          { weight: 20, effect: "slow", description: "Tempo raddoppiato per l'uso" }
        ],
        magicItem: [
          { weight: 40, effect: "unreliable", description: "50% di non funzionare quando attivato" },
          { weight: 30, effect: "cursed", description: "Effetto collaterale negativo minore" },
          { weight: 30, effect: "limited", description: "Utilizzi dimezzati" }
        ]
      },

      // Oggetti contraffatti (servizi, animali, veicoli)
      counterfeit: {
        service: "Sembra buono ma delude: effetto dimezzato o fallisce",
        animal: "Malato o vecchio: -10 PF, -5 velocità, svantaggio a prove",
        vehicle: "Traballante: velocità dimezzata, 10% rottura per giorno di viaggio"
      }
    };

    this._setupHooks();
  }

  _setupHooks() {
    // Hook per creare oggetti scadenti
    Hooks.on("preCreateItem", (item, data, options, userId) => {
      if (data.flags?.brancalonia?.shoddy === true) {
        this._applyShoddyEffects(item, data);
      }
    });

    // Hook per rottura su 1 naturale
    Hooks.on("dnd5e.rollAttack", (item, roll) => {
      if (item.flags?.brancalonia?.shoddyEffect === "fragile") {
        if (roll.dice[0]?.results[0]?.result === 1) {
          this._breakItem(item);
        }
      }
    });

    // Hook per rottura armature su critico
    Hooks.on("dnd5e.damageActor", (actor, damage, options) => {
      if (options.critical) {
        this._checkArmorBreak(actor);
      }
    });

    // Hook per aggiungere opzione scadente nella scheda oggetto
    Hooks.on("renderItemSheet", (app, html, data) => {
      if (game.user.isGM) {
        this._addShoddyToggle(app, html, data);
      }
    });

    // Hook per gestire acquisti scadenti
    Hooks.on("dnd5e.preItemPurchase", (item, buyer, seller, quantity, price) => {
      if (item.flags?.brancalonia?.shoddy) {
        // Applica sconto 90%
        return price * 0.1;
      }
    });
  }

  /**
   * Applica effetti scadenti casuali a un oggetto
   */
  _applyShoddyEffects(item, data) {
    const type = this._getItemCategory(item);
    if (!type) return;

    // Seleziona effetto casuale basato su pesi
    const effect = this._selectRandomEffect(type);
    if (!effect) return;

    // Prepara modifiche
    const updates = {
      name: `${data.name} (Scadente)`,
      "flags.brancalonia.shoddy": true,
      "flags.brancalonia.shoddyEffect": effect.effect,
      "flags.brancalonia.shoddyDescription": effect.description
    };

    // Applica prezzo 10%
    if (data.system?.price?.value !== undefined) {
      updates["system.price.value"] = Math.floor(data.system.price.value * 0.1);
      updates["system.price.denomination"] = data.system.price.denomination || "gp";
    }

    // Aggiungi descrizione dell'effetto
    const currentDesc = data.system?.description?.value || "";
    updates["system.description.value"] = `
      <div class="shoddy-warning" style="border: 2px solid #8B4513; padding: 10px; background: #FFF8DC;">
        <p><strong>⚠️ OGGETTO SCADENTE</strong></p>
        <p><strong>Difetto:</strong> ${effect.description}</p>
        <p><strong>Prezzo:</strong> 10% del normale</p>
      </div>
      ${currentDesc}
    `;

    // Applica modifiche specifiche per effetto
    this._applySpecificEffect(updates, item, effect);

    // Unisci con i dati originali
    mergeObject(data, updates);
  }

  /**
   * Applica modifiche specifiche basate sull'effetto
   */
  _applySpecificEffect(updates, item, effect) {
    switch(effect.effect) {
      case "fragile":
        // Si rompe su 1 naturale - gestito via hook
        break;

      case "unbalanced":
        // Svantaggio al primo attacco - necessita tracking combat
        updates["flags.brancalonia.firstAttackDisadvantage"] = true;
        break;

      case "dull":
        // -2 danni
        if (item.system?.damage?.parts) {
          updates["system.damage.parts"] = item.system.damage.parts.map(part => {
            const [formula, type] = part;
            return [`max(1, ${formula} - 2)`, type];
          });
        }
        break;

      case "heavy":
        // Richiede FOR 13
        updates["system.properties.hvy"] = true;
        updates["system.strength"] = Math.max(13, item.system?.strength || 0);
        break;

      case "rusty":
        // Critico solo su 20
        updates["system.critical.threshold"] = 20;
        break;

      case "warped":
        // Gittata dimezzata
        if (item.system?.range?.value) {
          updates["system.range.value"] = Math.floor(item.system.range.value / 2);
          updates["system.range.long"] = Math.floor((item.system.range.long || 0) / 2);
        }
        break;

      case "inaccurate":
        // -2 al colpire
        updates["system.attack.bonus"] = (item.system?.attack?.bonus || 0) - 2;
        break;

      case "ill-fitting":
        // -5 velocità (applicato come Active Effect)
        updates["flags.brancalonia.speedPenalty"] = 5;
        break;

      case "gaps":
        // -1 CA
        if (item.system?.armor?.value !== undefined) {
          updates["system.armor.value"] = item.system.armor.value - 1;
        }
        break;

      case "cracked":
      case "unwieldy":
      case "light":
        // Effetti scudo gestiti separatamente
        if (item.type === "equipment" && item.system?.armor?.type === "shield") {
          if (effect.effect === "light") {
            updates["system.armor.value"] = 1; // +1 invece di +2
          }
        }
        break;

      case "incomplete":
        // -2 alle prove
        updates["system.bonus"] = (item.system?.bonus || 0) - 2;
        break;

      case "slow":
        // Tempo raddoppiato
        updates["flags.brancalonia.slowUse"] = true;
        break;

      case "unreliable":
        // 50% fallimento oggetti magici
        updates["flags.brancalonia.unreliableMagic"] = true;
        break;

      case "limited":
        // Utilizzi dimezzati
        if (item.system?.uses?.max) {
          updates["system.uses.max"] = Math.ceil(item.system.uses.max / 2);
        }
        break;
    }
  }

  /**
   * Determina la categoria dell'oggetto
   */
  _getItemCategory(item) {
    if (item.type === "weapon") {
      const isRanged = item.system?.actionType === "rwak" ||
                       item.system?.properties?.thr ||
                       item.system?.range?.value > 5;
      return isRanged ? "weapon.ranged" : "weapon.melee";
    }

    if (item.type === "equipment") {
      if (item.system?.armor?.type === "shield") return "shield";
      if (item.system?.armor?.value !== undefined) return "armor";
    }

    if (item.type === "tool") return "tool";

    if (item.system?.rarity && item.system?.rarity !== "common") return "magicItem";

    return null;
  }

  /**
   * Seleziona effetto casuale basato sui pesi
   */
  _selectRandomEffect(category) {
    const [mainCat, subCat] = category.split(".");
    const effects = subCat
      ? this.shoddyConfig.effects[mainCat]?.[subCat]
      : this.shoddyConfig.effects[mainCat];

    if (!effects) return null;

    // Calcola peso totale
    const totalWeight = effects.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;

    // Seleziona basato sul peso
    for (const effect of effects) {
      random -= effect.weight;
      if (random <= 0) return effect;
    }

    return effects[0]; // Fallback
  }

  /**
   * Rompe un oggetto
   */
  async _breakItem(item) {
    if (item.flags?.brancalonia?.broken) return;

    await item.update({
      "flags.brancalonia.broken": true,
      "flags.brancalonia.originalName": item.name,
      "name": `${item.name} (ROTTO)`
    });

    // Disabilita l'oggetto
    if (item.type === "weapon") {
      await item.update({
        "system.damage.parts": [],
        "system.attack.bonus": -999
      });
    } else if (item.system?.armor?.value !== undefined) {
      await item.update({
        "system.armor.value": 0,
        "system.equipped": false
      });
    }

    // Notifica
    ChatMessage.create({
      content: `
        <div class="brancalonia-break" style="border: 2px solid red; padding: 10px;">
          <h3>💔 OGGETTO ROTTO!</h3>
          <p><strong>${item.flags.brancalonia.originalName}</strong> si è rotto!</p>
          <p>Non può essere riparato - è scadente!</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({actor: item.parent})
    });
  }

  /**
   * Controlla rottura armature su critico
   */
  async _checkArmorBreak(actor) {
    const fragilArmor = actor.items.find(i =>
      i.type === "equipment" &&
      i.system?.equipped &&
      i.flags?.brancalonia?.shoddyEffect === "fragile"
    );

    if (fragilArmor) {
      await this._breakItem(fragilArmor);
    }
  }

  /**
   * Aggiunge toggle scadente alla scheda oggetto
   */
  _addShoddyToggle(app, html, data) {
    const item = app.object;
    const canBeShoddy = ["weapon", "equipment", "tool", "consumable"].includes(item.type);

    if (!canBeShoddy) return;

    const shoddySection = `
      <div class="form-group">
        <label style="font-weight: bold;">
          <input type="checkbox" name="flags.brancalonia.shoddy"
            ${item.flags?.brancalonia?.shoddy ? 'checked' : ''}>
          Oggetto Scadente (Brancalonia - 10% prezzo)
        </label>
        ${item.flags?.brancalonia?.shoddyEffect ? `
          <p class="notes" style="margin: 5px 0; color: #8B4513;">
            <strong>Difetto:</strong> ${item.flags?.brancalonia?.shoddyDescription || 'Sconosciuto'}
          </p>
        ` : ''}
      </div>
    `;

    // Inserisci dopo il campo prezzo
    const priceField = html.find('[name="system.price.value"]').closest('.form-group');
    if (priceField.length) {
      priceField.after(shoddySection);
    } else {
      html.find('.sheet-body').prepend(shoddySection);
    }

    // Listener per toggle
    html.find('[name="flags.brancalonia.shoddy"]').change(async (e) => {
      if (e.target.checked) {
        await this.makeItemShoddy(item);
      } else {
        await this.removeItemShoddy(item);
      }
    });
  }

  /**
   * Rende un oggetto scadente
   */
  async makeItemShoddy(item) {
    const category = this._getItemCategory(item);
    if (!category) {
      ui.notifications.warn("Questo oggetto non può essere reso scadente!");
      return;
    }

    const effect = this._selectRandomEffect(category);
    const updates = {
      "flags.brancalonia.shoddy": true,
      "flags.brancalonia.shoddyEffect": effect.effect,
      "flags.brancalonia.shoddyDescription": effect.description
    };

    // Aggiorna nome se necessario
    if (!item.name.includes("(Scadente)")) {
      updates.name = `${item.name} (Scadente)`;
    }

    // Applica prezzo 10%
    const currentPrice = item.system.price?.value || 0;
    updates["system.price.value"] = Math.floor(currentPrice * 0.1);

    // Applica effetto specifico
    this._applySpecificEffect(updates, item, effect);

    // Aggiorna descrizione
    const currentDesc = item.system.description?.value || "";
    if (!currentDesc.includes("OGGETTO SCADENTE")) {
      updates["system.description.value"] = `
        <div class="shoddy-warning" style="border: 2px solid #8B4513; padding: 10px; background: #FFF8DC;">
          <p><strong>⚠️ OGGETTO SCADENTE</strong></p>
          <p><strong>Difetto:</strong> ${effect.description}</p>
          <p><strong>Prezzo:</strong> 10% del normale</p>
        </div>
        ${currentDesc}
      `;
    }

    await item.update(updates);
    ui.notifications.info(`${item.name} è ora scadente con difetto: ${effect.description}`);
  }

  /**
   * Rimuove status scadente
   */
  async removeItemShoddy(item) {
    if (!item.flags?.brancalonia?.shoddy) return;

    const updates = {
      "flags.brancalonia.-=shoddy": null,
      "flags.brancalonia.-=shoddyEffect": null,
      "flags.brancalonia.-=shoddyDescription": null
    };

    // Ripristina nome
    if (item.name.includes("(Scadente)")) {
      updates.name = item.name.replace(" (Scadente)", "");
    }

    // Ripristina prezzo (x10)
    const currentPrice = item.system.price?.value || 0;
    updates["system.price.value"] = currentPrice * 10;

    // Rimuovi descrizione scadente
    const desc = item.system.description?.value || "";
    const cleanDesc = desc.replace(/<div class="shoddy-warning"[\s\S]*?<\/div>/g, "");
    updates["system.description.value"] = cleanDesc;

    await item.update(updates);
    ui.notifications.info(`${item.name} non è più scadente`);
  }

  /**
   * Genera loot scadente casuale
   */
  generateShoddyLoot(type = null, quantity = 1) {
    const tables = {
      weapons: [
        "Spada Corta", "Pugnale", "Mazza", "Ascia",
        "Arco Corto", "Balestra Leggera", "Lancia"
      ],
      armor: [
        "Cuoio", "Cuoio Borchiato", "Giaco di Maglia", "Scudo"
      ],
      tools: [
        "Attrezzi da Ladro", "Kit da Erborista", "Attrezzi da Fabbro"
      ]
    };

    const results = [];
    for (let i = 0; i < quantity; i++) {
      const category = type || Object.keys(tables)[Math.floor(Math.random() * 3)];
      const items = tables[category];
      const item = items[Math.floor(Math.random() * items.length)];

      results.push({
        name: `${item} (Scadente)`,
        type: category,
        price: "10% del normale",
        defect: this._selectRandomEffect(
          category === "weapons" ? "weapon.melee" : category.slice(0, -1)
        )?.description || "Difetto generico"
      });
    }

    return results;
  }

  /**
   * Crea macro per gestione oggetti scadenti
   */
  static createMacros() {
    const macros = [
      {
        name: "Rendi Scadente (10%)",
        img: "icons/tools/smithing/hammer-sledge-steel-grey.webp",
        type: "script",
        command: `
// Rende l'oggetto selezionato scadente (10% prezzo, effetto casuale)
const item = canvas.tokens.controlled[0]?.actor.items.find(i => i.id === game.user.targets.first()?.id);
if (item) {
  game.brancalonia.shoddyEquipment.makeItemShoddy(item);
} else {
  ui.notifications.warn("Seleziona un oggetto!");
}
        `
      },
      {
        name: "Genera Loot Scadente",
        img: "icons/containers/bags/sack-simple-leather-brown.webp",
        type: "script",
        command: `
// Genera loot scadente casuale
const loot = game.brancalonia.shoddyEquipment.generateShoddyLoot(null, 5);
let message = "<h3>Loot Scadente Trovato:</h3><ul>";
loot.forEach(item => {
  message += \`<li><strong>\${item.name}</strong> - \${item.defect}</li>\`;
});
message += "</ul>";
ChatMessage.create({content: message});
        `
      }
    ];

    macros.forEach(data => Macro.create(data));
    ui.notifications.info("Macro Equipaggiamento Scadente create!");
  }
}