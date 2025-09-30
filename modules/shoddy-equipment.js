/* ===================================== */
/* BRANCALONIA SHODDY EQUIPMENT */
/* Sistema equipaggiamento scadente */
/* ===================================== */

class ShoddyEquipment {
  constructor() {
    this.shoddyItems = new Map();
    this.initialized = false;
    this.shoddyConfig = {};
    console.log('Brancalonia | Sistema Equipaggiamento Scadente inizializzato');
  }

  static initialize() {
    try {
      console.log('Brancalonia | Inizializzazione Sistema Equipaggiamento Scadente...');

      // Registra le settings
      ShoddyEquipment.registerSettings();

      // Registra tutti gli hooks
      ShoddyEquipment.registerHooks();

      // Registra comandi chat
      ShoddyEquipment.registerChatCommands();

      // Crea istanza globale
      const instance = new ShoddyEquipment();
      game.brancalonia = game.brancalonia || {};
      game.brancalonia.shoddyEquipment = instance;

      // Registra macro automatiche
      ShoddyEquipment.registerMacros();

      console.log('Brancalonia | Sistema Equipaggiamento Scadente inizializzato con successo');
      return instance;
    } catch (error) {
      console.error('Brancalonia | Errore inizializzazione Sistema Equipaggiamento Scadente:', error);
      ui.notifications.error(`Errore inizializzazione Sistema Equipaggiamento Scadente: ${error.message}`);
    }
  }

  static registerSettings() {
    game.settings.register('brancalonia-bigat', 'shoddyEquipmentEnabled', {
      name: 'Abilita Equipaggiamento Scadente',
      hint: 'Attiva il sistema di equipaggiamento scadente che può rompersi',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
      onChange: value => {
        console.log('Brancalonia | Equipaggiamento Scadente:', value ? 'abilitato' : 'disabilitato');
        ui.notifications.info(`Sistema Equipaggiamento Scadente ${value ? 'abilitato' : 'disabilitato'}`);
      }
    });

    game.settings.register('brancalonia-bigat', 'shoddyBreakChance', {
      name: 'Probabilità Rottura',
      hint: 'Probabilità base che un oggetto scadente si rompa (0.0-1.0)',
      scope: 'world',
      config: true,
      type: Number,
      range: { min: 0.0, max: 1.0, step: 0.01 },
      default: 0.1,
      onChange: value => {
        console.log('Brancalonia | Probabilità rottura equipaggiamento scadente aggiornata:', value);
      }
    });

    game.settings.register('brancalonia-bigat', 'shoddyAutoDetection', {
      name: 'Rilevamento Automatico',
      hint: 'Rileva automaticamente oggetti scadenti dal nome',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    console.log('Brancalonia | Settings Equipaggiamento Scadente registrate');
  }

  static registerHooks() {
    // Hook principale di inizializzazione
    Hooks.on('ready', async () => {
      if (!game.settings.get('brancalonia-bigat', 'shoddyEquipmentEnabled')) return;

      const instance = game.brancalonia?.shoddyEquipment;
      if (instance && !instance.initialized) {
        await instance.initialize();
      }
    });

    // Hooks per gestione oggetti
    Hooks.on('preCreateItem', ShoddyEquipment._onPreCreateItem);
    Hooks.on('createItem', ShoddyEquipment._onCreateItem);
    Hooks.on('updateItem', ShoddyEquipment._onUpdateItem);
    Hooks.on('preUpdateItem', ShoddyEquipment._onPreUpdateItem);

    // Hook per gestione attori e sheet
    Hooks.on('renderActorSheet', ShoddyEquipment._onRenderActorSheet);
    Hooks.on('renderItemSheet', ShoddyEquipment._onRenderItemSheet);

    // Hook per controllo rottura durante l'uso
    Hooks.on('dnd5e.rollAttack', ShoddyEquipment._onRollAttack);
    Hooks.on('dnd5e.rollDamage', ShoddyEquipment._onRollDamage);
    Hooks.on('dnd5e.useItem', ShoddyEquipment._onUseItem);

    console.log('Brancalonia | Hooks Equipaggiamento Scadente registrati');
  }

  static registerChatCommands() {
    // Comando per marcare oggetto come scadente
    Hooks.on('chatCommandsReady', (commands) => {
      commands.register({
        name: '/shoddy',
        description: 'Gestisce equipaggiamento scadente',
        icon: '<i class="fas fa-tools"></i>',
        callback: ShoddyEquipment._handleChatCommand
      });
    });

    // Sistema di help per comandi
    game.brancalonia = game.brancalonia || {};
    game.brancalonia.shoddyHelp = () => {
      const helpContent = `
        <div class="brancalonia-help">
          <h3>Comandi Equipaggiamento Scadente</h3>
          <ul>
            <li><strong>/shoddy mark [nome]</strong> - Marca oggetto come scadente</li>
            <li><strong>/shoddy repair [nome]</strong> - Ripara oggetto rotto</li>
            <li><strong>/shoddy break [nome]</strong> - Forza la rottura di un oggetto</li>
            <li><strong>/shoddy list</strong> - Lista oggetti scadenti</li>
            <li><strong>/shoddy toggle</strong> - Abilita/disabilita sistema</li>
          </ul>
        </div>`;

      ChatMessage.create({
        content: helpContent,
        whisper: [game.user.id]
      });
    };

    console.log('Brancalonia | Comandi chat Equipaggiamento Scadente registrati');
  }

  static registerMacros() {
    // Macro per controllo equipaggiamento
    if (!game.macros.find(m => m.name === 'Controlla Equipaggiamento Scadente')) {
      Macro.create({
        name: 'Controlla Equipaggiamento Scadente',
        type: 'script',
        img: 'icons/tools/smithing/hammer.webp',
        command: `
          const actor = game.user.character || canvas.tokens.controlled[0]?.actor;
          if (!actor) {
            ui.notifications.warn('Seleziona un personaggio o token');
            return;
          }
          game.brancalonia?.shoddyEquipment?.checkActorEquipment(actor);
        `
      });
    }

    console.log('Brancalonia | Macro Equipaggiamento Scadente registrate');
  }

  // Inizializza il sistema (chiamato dopo ready)
  async initialize() {
    if (this.initialized) return;

    try {
      // Carica configurazione equipaggiamento scadente
      await this.loadShoddyConfig();

      this.initialized = true;
      console.log('Brancalonia | Sistema Equipaggiamento Scadente configurato');
      ui.notifications.info('Sistema Equipaggiamento Scadente attivo');
    } catch (error) {
      console.error('Brancalonia | Errore inizializzazione equipaggiamento scadente:', error);
      ui.notifications.error('Errore inizializzazione Sistema Equipaggiamento Scadente');
    }
  }

  // Carica la configurazione degli oggetti scadenti
  async loadShoddyConfig() {
    const baseChance = game.settings.get('brancalonia-bigat', 'shoddyBreakChance');

    this.shoddyConfig = {
      weapons: {
        penalty: -1,
        breakChance: baseChance,
        description: 'Arma di qualità scadente',
        keywords: ['scadente', 'rotto', 'malandato', 'vecchio', 'arrugginito', 'logoro']
      },
      armor: {
        acPenalty: -1,
        breakChance: baseChance * 0.5,
        description: 'Armatura di qualità scadente',
        keywords: ['scadente', 'rotto', 'malandato', 'vecchio', 'arrugginito', 'logoro']
      },
      tools: {
        penalty: -2,
        breakChance: baseChance * 1.5,
        description: 'Attrezzi di qualità scadente',
        keywords: ['scadente', 'rotto', 'malandato', 'vecchio', 'arrugginito', 'logoro']
      },
      shield: {
        acPenalty: -1,
        breakChance: baseChance * 0.3,
        description: 'Scudo di qualità scadente',
        keywords: ['scadente', 'rotto', 'malandato', 'vecchio', 'arrugginito', 'logoro']
      }
    };

    console.log('Brancalonia | Configurazione equipaggiamento scadente caricata');
  }

  // Hook handlers statici
  static _onPreCreateItem(document, data, options, userId) {
    const instance = game.brancalonia?.shoddyEquipment;
    if (!instance?.initialized) return;

    try {
      instance.preCreateItem(document, data, options, userId);
    } catch (error) {
      console.error('Brancalonia | Errore preCreateItem:', error);
    }
  }

  static _onCreateItem(item, options, userId) {
    const instance = game.brancalonia?.shoddyEquipment;
    if (!instance?.initialized) return;

    try {
      instance.onItemCreate(item, options, userId);
    } catch (error) {
      console.error('Brancalonia | Errore createItem:', error);
    }
  }

  static _onUpdateItem(item, changes, options, userId) {
    const instance = game.brancalonia?.shoddyEquipment;
    if (!instance?.initialized) return;

    try {
      instance.onItemUpdate(item, changes, options, userId);
    } catch (error) {
      console.error('Brancalonia | Errore updateItem:', error);
    }
  }

  static _onPreUpdateItem(item, changes, options, userId) {
    const instance = game.brancalonia?.shoddyEquipment;
    if (!instance?.initialized) return;

    try {
      instance.preUpdateItem(item, changes, options, userId);
    } catch (error) {
      console.error('Brancalonia | Errore preUpdateItem:', error);
    }
  }

  static _onRenderActorSheet(sheet, html, data) {
    const instance = game.brancalonia?.shoddyEquipment;
    if (!instance?.initialized) return;

    try {
      instance.enhanceActorSheet(sheet, html, data);
    } catch (error) {
      console.error('Brancalonia | Errore renderActorSheet:', error);
    }
  }

  static _onRenderItemSheet(sheet, html, data) {
    const instance = game.brancalonia?.shoddyEquipment;
    if (!instance?.initialized) return;

    try {
      instance.enhanceItemSheet(sheet, html, data);
    } catch (error) {
      console.error('Brancalonia | Errore renderItemSheet:', error);
    }
  }

  static _onRollAttack(item, roll) {
    const instance = game.brancalonia?.shoddyEquipment;
    if (!instance?.initialized) return;

    try {
      instance.checkBreakageOnUse(item, item.actor);
    } catch (error) {
      console.error('Brancalonia | Errore rollAttack:', error);
    }
  }

  static _onRollDamage(item, roll) {
    const instance = game.brancalonia?.shoddyEquipment;
    if (!instance?.initialized) return;

    try {
      instance.checkBreakageOnUse(item, item.actor);
    } catch (error) {
      console.error('Brancalonia | Errore rollDamage:', error);
    }
  }

  static _onUseItem(item, config, options) {
    const instance = game.brancalonia?.shoddyEquipment;
    if (!instance?.initialized) return;

    try {
      instance.checkBreakageOnUse(item, item.actor);
    } catch (error) {
      console.error('Brancalonia | Errore useItem:', error);
    }
  }

  static _handleChatCommand(args, speaker) {
    const instance = game.brancalonia?.shoddyEquipment;
    if (!instance?.initialized) return;

    try {
      instance.handleChatCommand(args, speaker);
    } catch (error) {
      console.error('Brancalonia | Errore chat command:', error);
      ui.notifications.error('Errore comando equipaggiamento scadente');
    }
  }

  // Hook prima della creazione dell'oggetto
  preCreateItem(document, data, options, userId) {
    if (!game.settings.get('brancalonia-bigat', 'shoddyAutoDetection')) return;

    if (this.shouldBeShoddy(data)) {
      data.flags = data.flags || {};
      data.flags['brancalonia-bigat'] = data.flags['brancalonia-bigat'] || {};
      data.flags['brancalonia-bigat'].shoddy = true;

      if (!data.name?.includes('[Scadente]')) {
        data.name = `${data.name} [Scadente]`;
      }

      console.log(`Brancalonia | Oggetto marcato come scadente: ${data.name}`);
    }
  }

  // Hook alla creazione dell'oggetto
  async onItemCreate(item, options, userId) {
    if (item.getFlag('brancalonia-bigat', 'shoddy')) {
      await this.applyShoddyEffects(item);
    }
  }

  // Hook all'aggiornamento dell'oggetto
  async onItemUpdate(item, changes, options, userId) {
    if (changes.flags?.['brancalonia-bigat']?.shoddy !== undefined) {
      if (changes.flags['brancalonia-bigat'].shoddy) {
        await this.applyShoddyEffects(item);
      } else {
        await this.removeShoddyEffects(item);
      }
    }
  }

  // Hook prima dell'aggiornamento
  preUpdateItem(item, changes, options, userId) {
    if (changes.flags?.['brancalonia-bigat']?.shoddy === false) {
      // Rimuovi il tag [Scadente] dal nome
      if (changes.name?.includes('[Scadente]')) {
        changes.name = changes.name.replace(' [Scadente]', '').replace('[Scadente] ', '');
      }
    }
  }

  // Determina se un oggetto dovrebbe essere scadente
  shouldBeShoddy(itemData) {
    if (!game.settings.get('brancalonia-bigat', 'shoddyAutoDetection')) return false;

    const name = itemData.name?.toLowerCase() || '';
    const config = this.getConfigForType(itemData.type);

    if (!config) return false;

    return config.keywords.some(keyword => name.includes(keyword));
  }

  // Applica gli effetti scadenti a un oggetto
  async applyShoddyEffects(item) {
    const type = item.type;
    const config = this.getConfigForType(type);

    if (!config) return;

    const existingEffect = item.effects.find(e =>
      e.getFlag('brancalonia-bigat', 'shoddyEffect')
    );

    if (!existingEffect) {
      const effectData = {
        label: 'Equipaggiamento Scadente',
        icon: 'icons/svg/downgrade.svg',
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
      console.log(`Brancalonia | Effetti scadenti applicati a: ${item.name}`);
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
      console.log(`Brancalonia | Effetti scadenti rimossi da: ${item.name}`);
    }
  }

  // Ottiene la configurazione per tipo di oggetto
  getConfigForType(type) {
    switch (type) {
      case 'weapon':
        return this.shoddyConfig.weapons;
      case 'equipment':
        // Differenzia armature da altri equipaggiamenti
        return this.shoddyConfig.armor;
      case 'tool':
        return this.shoddyConfig.tools;
      case 'shield':
        return this.shoddyConfig.shield;
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
        changes.push({
          key: 'system.damage.bonus',
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
      case 'shield':
        changes.push({
          key: 'system.armor.value',
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: String(config.acPenalty)
        });
        break;
    }

    return changes;
  }

  // Controlla rottura durante l'uso
  async checkBreakageOnUse(item, actor) {
    if (!item.getFlag('brancalonia-bigat', 'shoddy')) return false;
    if (item.getFlag('brancalonia-bigat', 'broken')) return false;

    const config = this.getConfigForType(item.type);
    if (!config) return false;

    const roll = Math.random();
    if (roll < config.breakChance) {
      await this.breakItem(item, actor);
      return true;
    }

    return false;
  }

  // Controlla se un oggetto si rompe (metodo pubblico)
  async checkBreakage(item, actor) {
    return await this.checkBreakageOnUse(item, actor);
  }

  // Rompe un oggetto
  async breakItem(item, actor) {
    try {
      const message = `
        <div class="brancalonia-shoddy-break" style="border: 2px solid #8B0000; padding: 10px; border-radius: 5px;">
          <h3 style="color: #8B0000; margin: 0 0 10px 0;">🔧 Equipaggiamento Rotto!</h3>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${item.img}" alt="${item.name}" style="width: 48px; height: 48px; border-radius: 3px;">
            <div>
              <p style="margin: 0; font-weight: bold;">${item.name}</p>
              <p style="margin: 0; font-style: italic; color: #666;">si è rotto durante l'uso!</p>
            </div>
          </div>
          <p style="margin: 10px 0 0 0; font-size: 0.9em;">L'oggetto è ora inutilizzabile e deve essere riparato.</p>
        </div>`;

      await ChatMessage.create({
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

      // Disabilita l'oggetto se è equipaggiato
      if (item.system.equipped) {
        await item.update({ 'system.equipped': false });
      }

      console.log(`Brancalonia | Oggetto rotto: ${item.name}`);
      ui.notifications.warn(`${item.name} si è rotto!`);
    } catch (error) {
      console.error('Brancalonia | Errore rottura oggetto:', error);
      ui.notifications.error('Errore durante la rottura dell\'oggetto');
    }
  }

  // Ripara un oggetto rotto
  async repairItem(item, actor) {
    if (!item.getFlag('brancalonia-bigat', 'broken')) {
      ui.notifications.warn(`${item.name} non è rotto`);
      return;
    }

    try {
      const cost = Math.ceil((item.system.price?.value || 10) / 2);

      const message = `
        <div class="brancalonia-shoddy-repair" style="border: 2px solid #228B22; padding: 10px; border-radius: 5px;">
          <h3 style="color: #228B22; margin: 0 0 10px 0;">🔧 Riparazione Completata</h3>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${item.img}" alt="${item.name}" style="width: 48px; height: 48px; border-radius: 3px;">
            <div>
              <p style="margin: 0; font-weight: bold;">${item.name}</p>
              <p style="margin: 0; color: #666;">è stato riparato per ${cost} mo</p>
            </div>
          </div>
        </div>`;

      await ChatMessage.create({
        content: message,
        speaker: ChatMessage.getSpeaker({ actor }),
        flags: {
          'brancalonia-bigat': {
            shoddyRepair: true,
            itemId: item.id,
            cost
          }
        }
      });

      // Rimuovi il flag rotto
      await item.unsetFlag('brancalonia-bigat', 'broken');

      console.log(`Brancalonia | Oggetto riparato: ${item.name} (costo: ${cost} mo)`);
      ui.notifications.info(`${item.name} riparato per ${cost} mo`);
    } catch (error) {
      console.error('Brancalonia | Errore riparazione oggetto:', error);
      ui.notifications.error('Errore durante la riparazione dell\'oggetto');
    }
  }

  // Gestisce comandi chat
  handleChatCommand(args, speaker) {
    const command = args[0]?.toLowerCase();
    const actor = ChatMessage.getSpeakerActor(speaker);

    switch (command) {
      case 'mark':
        this.markItemAsShoddy(args.slice(1).join(' '), actor);
        break;
      case 'repair':
        this.repairItemByName(args.slice(1).join(' '), actor);
        break;
      case 'break':
        this.breakItemByName(args.slice(1).join(' '), actor);
        break;
      case 'list':
        this.listShoddyItems(actor);
        break;
      case 'toggle':
        this.toggleSystem();
        break;
      default:
        game.brancalonia.shoddyHelp();
        break;
    }
  }

  // Marca oggetto come scadente per nome
  async markItemAsShoddy(itemName, actor) {
    if (!actor) {
      ui.notifications.warn('Nessun attore selezionato');
      return;
    }

    const item = actor.items.find(i =>
      i.name.toLowerCase().includes(itemName.toLowerCase())
    );

    if (!item) {
      ui.notifications.warn(`Oggetto "${itemName}" non trovato`);
      return;
    }

    await item.setFlag('brancalonia-bigat', 'shoddy', true);
    await this.applyShoddyEffects(item);
    ui.notifications.info(`${item.name} marcato come scadente`);
  }

  // Ripara oggetto per nome
  async repairItemByName(itemName, actor) {
    if (!actor) {
      ui.notifications.warn('Nessun attore selezionato');
      return;
    }

    const item = actor.items.find(i =>
      i.name.toLowerCase().includes(itemName.toLowerCase()) &&
      i.getFlag('brancalonia-bigat', 'broken')
    );

    if (!item) {
      ui.notifications.warn(`Oggetto rotto "${itemName}" non trovato`);
      return;
    }

    await this.repairItem(item, actor);
  }

  // Rompe oggetto per nome
  async breakItemByName(itemName, actor) {
    if (!actor) {
      ui.notifications.warn('Nessun attore selezionato');
      return;
    }

    const item = actor.items.find(i =>
      i.name.toLowerCase().includes(itemName.toLowerCase()) &&
      i.getFlag('brancalonia-bigat', 'shoddy')
    );

    if (!item) {
      ui.notifications.warn(`Oggetto scadente "${itemName}" non trovato`);
      return;
    }

    await this.breakItem(item, actor);
  }

  // Lista oggetti scadenti
  listShoddyItems(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun attore selezionato');
      return;
    }

    const shoddyItems = actor.items.filter(i =>
      i.getFlag('brancalonia-bigat', 'shoddy')
    );

    if (shoddyItems.length === 0) {
      ChatMessage.create({
        content: '<p>Nessun oggetto scadente trovato.</p>',
        whisper: [game.user.id]
      });
      return;
    }

    const itemsList = shoddyItems.map(item => {
      const broken = item.getFlag('brancalonia-bigat', 'broken') ? ' (ROTTO)' : '';
      return `<li>${item.name}${broken}</li>`;
    }).join('');

    const content = `
      <div class="brancalonia-shoddy-list">
        <h3>Oggetti Scadenti</h3>
        <ul>${itemsList}</ul>
      </div>`;

    ChatMessage.create({
      content,
      whisper: [game.user.id]
    });
  }

  // Toggle sistema
  toggleSystem() {
    const current = game.settings.get('brancalonia-bigat', 'shoddyEquipmentEnabled');
    game.settings.set('brancalonia-bigat', 'shoddyEquipmentEnabled', !current);
  }

  // Controlla tutto l'equipaggiamento di un attore
  async checkActorEquipment(actor) {
    const shoddyItems = actor.items.filter(i =>
      i.getFlag('brancalonia-bigat', 'shoddy') &&
      !i.getFlag('brancalonia-bigat', 'broken')
    );

    if (shoddyItems.length === 0) {
      ui.notifications.info('Nessun oggetto scadente da controllare');
      return;
    }

    let brokenCount = 0;
    for (const item of shoddyItems) {
      const broke = await this.checkBreakage(item, actor);
      if (broke) brokenCount++;
    }

    if (brokenCount === 0) {
      ui.notifications.info('Tutti gli oggetti scadenti sono ancora funzionanti');
    }
  }

  // Migliora actor sheet
  enhanceActorSheet(sheet, html, data) {
    // Aggiungi indicatori visivi per oggetti scadenti
    html.find('.item').each((index, element) => {
      const itemId = element.dataset.itemId;
      const item = sheet.actor.items.get(itemId);

      if (item?.getFlag('brancalonia-bigat', 'shoddy')) {
        const $element = $(element);
        $element.addClass('shoddy-item');

        if (item.getFlag('brancalonia-bigat', 'broken')) {
          $element.addClass('broken-item');
          $element.find('.item-name').append(' <span class="broken-indicator">(ROTTO)</span>');
        } else {
          $element.find('.item-name').append(' <span class="shoddy-indicator">(Scadente)</span>');
        }
      }
    });

    // Aggiungi stili CSS
    const style = `
      <style>
      .shoddy-item { background-color: rgba(255, 165, 0, 0.1) !important; }
      .broken-item { background-color: rgba(139, 0, 0, 0.1) !important; }
      .shoddy-indicator { color: #FF8C00; font-size: 0.8em; font-style: italic; }
      .broken-indicator { color: #8B0000; font-size: 0.8em; font-weight: bold; }
      </style>`;
    html.find('head').append(style);
  }

  // Migliora item sheet
  enhanceItemSheet(sheet, html, data) {
    const item = sheet.item;
    const isShoddy = item.getFlag('brancalonia-bigat', 'shoddy');
    const isBroken = item.getFlag('brancalonia-bigat', 'broken');

    // Aggiungi controlli per gestire oggetti scadenti
    const controls = `
      <div class="form-group">
        <label>Equipaggiamento Scadente</label>
        <div class="form-fields">
          <input type="checkbox" name="flags.brancalonia-bigat.shoddy" ${isShoddy ? 'checked' : ''}>
          <label>Scadente</label>
        </div>
        ${isShoddy ? `
          <div class="form-fields">
            <input type="checkbox" name="flags.brancalonia-bigat.broken" ${isBroken ? 'checked' : ''}>
            <label>Rotto</label>
          </div>
        ` : ''}
      </div>`;

    html.find('.tab[data-tab="details"]').append(controls);
  }
}

// Registra la classe nel window
window.ShoddyEquipment = ShoddyEquipment;

// Inizializzazione automatica
Hooks.once('init', () => {
  console.log('Brancalonia | Inizializzazione Sistema Equipaggiamento Scadente...');
  ShoddyEquipment.initialize();
});