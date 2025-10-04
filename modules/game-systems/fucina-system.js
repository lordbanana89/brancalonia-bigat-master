/**
 * BRANCALONIA - SISTEMA FUCINA
 * Riparazione equipaggiamenti nel Covo.
 */

const MODULE_ID = 'brancalonia-bigat';

class FucinaSystem {
  static async repairItem(actor, { itemName } = {}) {
    if (!this._validateActor(actor)) return;

    const items = this._findRepairableItems(actor, itemName);
    if (items.length === 0) {
      ui.notifications.info('Nessun equipaggiamento rotto o scadente da riparare.');
      return;
    }

    const content = this._renderDialog(items);
    new Dialog({
      title: '🔨 Fucina del Covo',
      content,
      buttons: {
        repair: {
          icon: '<i class="fas fa-hammer"></i>',
          label: 'Ripara',
          callback: async (html) => {
            const itemId = html.find('[name="fucina-item"]').val();
            const target = items.find((i) => i.id === itemId);
            if (!target) return;
            await this._executeRepair(actor, target);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Annulla'
        }
      },
      default: 'repair'
    }, { width: 520 }).render(true);
  }

  static _validateActor(actor) {
    if (!actor) {
      ui.notifications.warn('Seleziona un personaggio.');
      return false;
    }
    if (actor.type !== 'character') {
      ui.notifications.warn('Solo i personaggi possono usare la Fucina.');
      return false;
    }
    return true;
  }

  static _findRepairableItems(actor, itemName) {
    return actor.items.filter((item) => {
      const flags = item.flags?.[MODULE_ID] ?? {};
      const matches = !itemName || item.name.toLowerCase().includes(itemName.toLowerCase());
      return matches && (flags.broken || flags.shoddy);
    });
  }

  static _renderDialog(items) {
    const rows = items.map((item) => {
      const flags = item.flags?.[MODULE_ID] ?? {};
      const conditions = [flags.broken ? 'Rotto' : null, flags.shoddy ? 'Scadente' : null]
        .filter(Boolean).join(', ');
      const cost = this._repairCost(item);
      return `<option value="${item.id}">${item.name} (${conditions}) - ${cost} mo</option>`;
    }).join('');

    return `
      <div class="fucina-dialog">
        <p>Scegli un oggetto da riparare. La Fucina richiede il 25% del valore in materiali.</p>
        <select name="fucina-item" style="width: 100%;">
          ${rows}
        </select>
      </div>
    `;
  }

  static _repairCost(item) {
    const basePrice = item.system?.price?.value ?? 10;
    return Math.max(1, Math.ceil(basePrice * 0.25));
  }

  static async _executeRepair(actor, item) {
    const price = this._repairCost(item);
    const gold = actor.system?.currency?.gp ?? 0;
    if (gold < price) {
      ui.notifications.error(`Servono ${price} monete d'oro per riparare ${item.name}.`);
      return;
    }

    const covoBonus = await this._covoBonus(actor);
    const skillMod = actor.system?.skills?.tlt?.total ?? actor.system?.abilities?.str?.mod ?? 0;
    const roll = await (new Roll('1d20 + @skill', { skill: skillMod })).roll({ async: true });
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `Riparazione di ${item.name} nella Fucina`
    });

    await actor.update({ 'system.currency.gp': gold - price });

    const threshold = 12 - covoBonus;
    const d20 = roll.terms?.[0]?.results?.[0]?.result ?? roll.dice?.[0]?.results?.[0]?.result;

    if (roll.total >= threshold) {
      const updateData = { [`flags.${MODULE_ID}.broken`]: false };
      if (d20 === 20) {
        updateData[`flags.${MODULE_ID}.shoddy`] = false;
      }

      await item.update(updateData);

      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `
          <div class="fucina-success">
            <h3>🔧 Riparazione completata!</h3>
            <p>${item.name} torna operativo${d20 === 20 ? ' e non è più scadente' : ''}.</p>
          </div>
        `
      });
    } else {
      ui.notifications.warn(`${actor.name} non riesce a completare la riparazione nonostante i materiali spesi.`);
    }
  }

  static async _covoBonus(actor) {
    const covoId = actor.getFlag(MODULE_ID, 'covoId');
    if (!covoId) return 0;

    const covo = game.actors?.get?.(covoId);
    if (!covo) return 0;

    const fucina = covo.items?.find?.((item) =>
      item.getFlag?.(MODULE_ID, 'granlusso') &&
      item.getFlag?.(MODULE_ID, 'type') === 'fucina' &&
      (item.system?.level?.value ?? 0) > 0
    );

    return fucina ? 2 : 0;
  }
}

export { FucinaSystem };
