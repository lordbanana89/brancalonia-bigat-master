/**
 * BRANCALONIA - SISTEMA BORSA NERA
 * Mercato nero collegato al Covo.
 */

const MODULE_ID = 'brancalonia-bigat';

class BorsaNeraSystem {
  static PRICE_BASE = {
    common: 50,
    uncommon: 250,
    rare: 2500,
    'very rare': 25000,
    legendary: 50000
  };

  static async openShop(actor, { query } = {}) {
    if (!this._validateActor(actor)) return;

    const covo = this._getCovo(actor);
    if (!covo) {
      ui.notifications.warn('Serve un covo per accedere alla Borsa Nera.');
      return;
    }

    const inventory = await this._loadInventory(covo, query);
    if (inventory.length === 0) {
      ui.notifications.info('Nessun contatto disponibile nella Borsa Nera al momento.');
      return;
    }

    const gold = actor.system?.currency?.gp ?? 0;
    const content = `
      <div class="borsa-nera-shop">
        <div class="shop-header">
          <p>Oro disponibile: <strong>${gold} mo</strong></p>
          <p class="hint">I prezzi tengono conto del livello del covo. Puoi tentare di negoziare durante l'acquisto.</p>
        </div>
        <div class="shop-items">
          ${inventory.map((item, index) => this._renderItemCard(item, index)).join('')}
        </div>
      </div>
    `;

    new Dialog({
      title: '🛍️ Borsa Nera',
      content,
      buttons: {
        close: {
          label: 'Chiudi',
          icon: '<i class="fas fa-times"></i>'
        }
      },
      render: (html) => {
        html[0].querySelectorAll('.buy-item').forEach((btn) => {
          btn.addEventListener('click', async (event) => {
            const index = Number(event.currentTarget.dataset.index);
            await this._buyItem(actor, covo, inventory[index]);
          });
        });
      }
    }, { width: 720, height: 640 }).render(true);
  }

  static _validateActor(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun personaggio selezionato.');
      return false;
    }
    if (actor.type !== 'character') {
      ui.notifications.warn('Solo i personaggi possono comprare dalla Borsa Nera.');
      return false;
    }
    return true;
  }

  static _getCovo(actor) {
    const covoId = actor.getFlag(MODULE_ID, 'covoId');
    if (!covoId) return null;
    return game.actors?.get?.(covoId) ?? null;
  }

  static async _loadInventory(covo, query) {
    const pack = game.packs?.get?.('brancalonia-bigat.equipaggiamento');
    if (!pack) return [];

    const docs = await pack.getDocuments();
    const filtered = docs.filter((doc) => {
      const rarity = (doc.system?.rarity ?? 'common').toLowerCase();
      const isMagic = doc.getFlag?.(MODULE_ID, 'categoria') === 'magico' || doc.system?.properties?.includes?.('mgc');
      const matchesQuery = !query || doc.name.toLowerCase().includes(query.toLowerCase());

      return matchesQuery && (isMagic || ['uncommon', 'rare', 'very rare', 'legendary'].includes(rarity));
    });

    const level = this._borsaLevel(covo);

    return filtered.slice(0, 20).map((doc) => {
      const price = this._priceFor(doc, level);
      return {
        id: doc.id,
        name: doc.name,
        price,
        rarity: (doc.system?.rarity ?? 'common').toLowerCase(),
        description: doc.system?.description?.value ?? '',
        img: doc.img ?? 'icons/commodities/gems/pearl-gold.webp',
        source: doc,
        level
      };
    });
  }

  static _borsaLevel(covo) {
    const borsa = covo.items?.find?.((item) =>
      item.getFlag?.(MODULE_ID, 'granlusso') &&
      item.getFlag?.(MODULE_ID, 'type') === 'borsa-nera'
    );
    return borsa?.system?.level?.value ?? 0;
  }

  static _priceFor(doc, level) {
    const rarity = (doc.system?.rarity ?? 'common').toLowerCase();
    const base = this.PRICE_BASE[rarity] ?? 100;
    const levelDiscount = Math.min(level * 0.05, 0.25); // -5% per livello, max -25%
    return Math.max(1, Math.floor(base * (1 - levelDiscount)));
  }

  static _renderItemCard(item, index) {
    const rarityClass = item.rarity.replace(/\s+/g, '-');
    return `
      <div class="shop-item" data-index="${index}">
        <img src="${item.img}" alt="${item.name}" />
        <div class="shop-info">
          <h4>${item.name}</h4>
          <p class="rarity rarity-${rarityClass}">${item.rarity}</p>
          <div class="description">${item.description.substring(0, 160)}...</div>
        </div>
        <div class="shop-actions">
          <p class="price">${item.price} mo</p>
          <button class="buy-item" data-index="${index}">Acquista</button>
        </div>
      </div>
    `;
  }

  static async _buyItem(actor, covo, entry) {
    const gold = actor.system?.currency?.gp ?? 0;
    if (gold < entry.price) {
      ui.notifications.error('Oro insufficiente per questo acquisto.');
      return;
    }

    const negotiation = await this._negotiatePrice(actor, entry);
    const finalPrice = Math.max(1, Math.floor(entry.price * negotiation.multiplier));

    if (gold < finalPrice) {
      ui.notifications.error(`Dopo il tentativo di trattativa servono comunque ${finalPrice} mo, ma ${actor.name} non le possiede.`);
      return;
    }

    await actor.update({ 'system.currency.gp': gold - finalPrice });

    const data = entry.source.toObject();
    delete data._id;
    data.flags = data.flags || {};
    data.flags[MODULE_ID] = data.flags[MODULE_ID] || {};
    data.flags[MODULE_ID].acquistatoBorsaNera = true;
    data.flags[MODULE_ID].prezzo = finalPrice;

    await actor.createEmbeddedDocuments('Item', [data]);
    await this._logTransaction(covo, actor, entry, finalPrice, negotiation);

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `
        <div class="borsa-nera-message">
          <h3>🛍️ Acquisto dalla Borsa Nera</h3>
          <p>${actor.name} ottiene <strong>${entry.name}</strong> per <strong>${finalPrice} mo</strong>.</p>
          ${negotiation.message ? `<p><em>${negotiation.message}</em></p>` : ''}
        </div>
      `
    });
  }

  static async _negotiatePrice(actor, entry) {
    const skill = actor.system?.skills?.prs ? 'prs' : null;
    if (!skill) {
      return { multiplier: 1, message: '' };
    }

    const roll = await actor.rollSkill(skill, {
      flavor: `Trattativa con la Borsa Nera per ${entry.name}`,
      chatMessage: false,
      fastForward: false
    });

    if (!roll) return { multiplier: 1, message: '' };

    let multiplier = 1;
    let message = `Tiro di trattativa: ${roll.total}. Nessuno sconto.`;

    if (roll.total >= 20) {
      multiplier = 0.8;
      message = `Trattativa eccellente! Sconto 20% (prezzo base ${entry.price} mo).`;
    } else if (roll.total >= 15) {
      multiplier = 0.9;
      message = `Trattativa riuscita: sconto 10% (prezzo base ${entry.price} mo).`;
    }

    // Pubblica comunque il tiro in chat per trasparenza
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `Negoziare il prezzo di ${entry.name}`
    });

    return { multiplier, message };
  }

  static async _logTransaction(covo, actor, entry, finalPrice, negotiation) {
    const transactions = covo.getFlag(MODULE_ID, 'borsaNeraTransactions') ?? [];
    transactions.push({
      item: entry.name,
      price: finalPrice,
      buyer: actor.name,
      timestamp: Date.now(),
      negotiation: negotiation.message
    });

    await covo.setFlag(MODULE_ID, 'borsaNeraTransactions', transactions);
  }
}

export { BorsaNeraSystem };
