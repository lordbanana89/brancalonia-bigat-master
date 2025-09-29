/* ===================================== */
/* BRANCALONIA SHODDY EQUIPMENT */
/* Sistema equipaggiamento scadente */
/* ===================================== */

export class ShoddyEquipment {
  constructor() {
    this.shoddyItems = new Map();
    this.initialized = false;
    console.log('Brancalonia | Sistema Equipaggiamento Scadente inizializzato');
  }

  // Inizializza il sistema
  async initialize() {
    if (this.initialized) return;

    // Registra hooks per gestire l'equipaggiamento scadente
    Hooks.on('createItem', this.onItemCreate.bind(this));
    Hooks.on('updateItem', this.onItemUpdate.bind(this));
    Hooks.on('preCreateItem', this.preCreateItem.bind(this));

    // Carica configurazione equipaggiamento scadente
    await this.loadShoddyConfig();

    this.initialized = true;
    console.log('Brancalonia | Equipaggiamento Scadente configurato');
  }

  // Carica la configurazione degli oggetti scadenti
  async loadShoddyConfig() {
    // Definisci gli oggetti scadenti di base
    this.shoddyConfig = {
      weapons: {
        penalty: -1,
        breakChance: 0.1,
        description: "Arma di qualità scadente"
      },
      armor: {
        acPenalty: -1,
        breakChance: 0.05,
        description: "Armatura di qualità scadente"
      },
      tools: {
        penalty: -2,
        breakChance: 0.15,
        description: "Attrezzi di qualità scadente"
      }
    };
  }

  // Hook prima della creazione dell'oggetto
  preCreateItem(document, data, options, userId) {
    // Controlla se l'oggetto dovrebbe essere scadente
    if (this.shouldBeShoddy(data)) {
      // Aggiungi il flag scadente
      data.flags = data.flags || {};
      data.flags['brancalonia-bigat'] = data.flags['brancalonia-bigat'] || {};
      data.flags['brancalonia-bigat'].shoddy = true;

      // Modifica il nome se non già modificato
      if (!data.name?.includes('[Scadente]')) {
        data.name = `${data.name} [Scadente]`;
      }
    }
  }

  // Hook alla creazione dell'oggetto
  onItemCreate(item, options, userId) {
    if (item.getFlag('brancalonia-bigat', 'shoddy')) {
      this.applyShoddyEffects(item);
    }
  }

  // Hook all'aggiornamento dell'oggetto
  onItemUpdate(item, changes, options, userId) {
    if (changes.flags?.['brancalonia-bigat']?.shoddy !== undefined) {
      if (changes.flags['brancalonia-bigat'].shoddy) {
        this.applyShoddyEffects(item);
      } else {
        this.removeShoddyEffects(item);
      }
    }
  }

  // Determina se un oggetto dovrebbe essere scadente
  shouldBeShoddy(itemData) {
    // Logica per determinare se un oggetto è scadente
    // Basata su nome, tipo, prezzo, etc.
    const name = itemData.name?.toLowerCase() || '';
    const shoddyKeywords = ['scadente', 'rotto', 'malandato', 'vecchio', 'arrugginito'];

    return shoddyKeywords.some(keyword => name.includes(keyword));
  }

  // Applica gli effetti scadenti a un oggetto
  async applyShoddyEffects(item) {
    const type = item.type;
    const config = this.getConfigForType(type);

    if (!config) return;

    // Crea o aggiorna l'active effect per l'oggetto scadente
    const existingEffect = item.effects.find(e =>
      e.getFlag('brancalonia-bigat', 'shoddyEffect')
    );

    if (!existingEffect) {
      const effectData = {
        label: "Equipaggiamento Scadente",
        icon: "icons/svg/downgrade.svg",
        changes: this.getEffectChanges(type, config),
        flags: {
          'brancalonia-bigat': {
            shoddyEffect: true
          }
        },
        transfer: true,
        disabled: false
      };

      await item.createEmbeddedDocuments('ActiveEffect', [effectData]);
    }
  }

  // Rimuove gli effetti scadenti da un oggetto
  async removeShoddyEffects(item) {
    const effects = item.effects.filter(e =>
      e.getFlag('brancalonia-bigat', 'shoddyEffect')
    );

    if (effects.length > 0) {
      const ids = effects.map(e => e.id);
      await item.deleteEmbeddedDocuments('ActiveEffect', ids);
    }
  }

  // Ottiene la configurazione per tipo di oggetto
  getConfigForType(type) {
    switch (type) {
      case 'weapon':
        return this.shoddyConfig.weapons;
      case 'equipment':
        if (game.dnd5e.config.armorTypes) {
          return this.shoddyConfig.armor;
        }
        return this.shoddyConfig.tools;
      case 'tool':
        return this.shoddyConfig.tools;
      default:
        return null;
    }
  }

  // Ottiene i cambiamenti dell'effetto per tipo
  getEffectChanges(type, config) {
    const changes = [];

    switch (type) {
      case 'weapon':
        changes.push({
          key: 'system.attack.bonus',
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: String(config.penalty)
        });
        break;
      case 'equipment':
        if (config.acPenalty) {
          changes.push({
            key: 'system.attributes.ac.bonus',
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: String(config.acPenalty)
          });
        }
        break;
      case 'tool':
        changes.push({
          key: 'system.bonus',
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: String(config.penalty)
        });
        break;
    }

    return changes;
  }

  // Controlla se un oggetto si rompe
  async checkBreakage(item, actor) {
    if (!item.getFlag('brancalonia-bigat', 'shoddy')) return false;

    const config = this.getConfigForType(item.type);
    if (!config) return false;

    const roll = Math.random();
    if (roll < config.breakChance) {
      // L'oggetto si rompe!
      await this.breakItem(item, actor);
      return true;
    }

    return false;
  }

  // Rompe un oggetto
  async breakItem(item, actor) {
    const message = `<div class="brancalonia-shoddy-break">
      <h3>Equipaggiamento Rotto!</h3>
      <p><strong>${item.name}</strong> si è rotto durante l'uso!</p>
      <img src="${item.img}" alt="${item.name}" style="width: 50px; height: 50px;">
    </div>`;

    ChatMessage.create({
      content: message,
      speaker: ChatMessage.getSpeaker({ actor }),
      flags: {
        'brancalonia-bigat': {
          shoddyBreak: true,
          itemId: item.id
        }
      }
    });

    // Marca l'oggetto come rotto
    await item.setFlag('brancalonia-bigat', 'broken', true);

    // Disabilita l'oggetto
    await item.update({ 'system.equipped': false });
  }

  // Ripara un oggetto rotto
  async repairItem(item, actor) {
    if (!item.getFlag('brancalonia-bigat', 'broken')) return;

    // Costo della riparazione (metà del prezzo originale)
    const cost = Math.ceil((item.system.price?.value || 0) / 2);

    const message = `<div class="brancalonia-shoddy-repair">
      <h3>Riparazione</h3>
      <p><strong>${item.name}</strong> riparato per ${cost} mo.</p>
    </div>`;

    ChatMessage.create({
      content: message,
      speaker: ChatMessage.getSpeaker({ actor }),
      flags: {
        'brancalonia-bigat': {
          shoddyRepair: true,
          itemId: item.id
        }
      }
    });

    // Rimuovi il flag rotto
    await item.unsetFlag('brancalonia-bigat', 'broken');
  }
}

// Hook per inizializzare il sistema quando il gioco è pronto
Hooks.once('ready', async () => {
  if (game.brancalonia?.shoddyItems) {
    await game.brancalonia.shoddyItems.initialize();
  }
});