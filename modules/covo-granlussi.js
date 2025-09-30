/* ===================================== */
/* BRANCALONIA COVO GRANLUSSI SYSTEM */
/* Sistema Granlussi del Covo */
/* ===================================== */

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

class CovoGranlussiSystem {
  constructor() {
    this.initialized = false;
    this.granlussi = {};
    this.intrugli = {};

    console.log('Brancalonia | Sistema Granlussi del Covo inizializzato');
  }

  static initialize() {
    try {
      console.log('Brancalonia | Inizializzazione Sistema Granlussi del Covo...');

      // Registra le settings
      CovoGranlussiSystem.registerSettings();

      // Registra tutti gli hooks
      CovoGranlussiSystem.registerHooks();

      // Registra comandi chat
      CovoGranlussiSystem.registerChatCommands();

      // Crea istanza globale
      const instance = new CovoGranlussiSystem();
      game.brancalonia = game.brancalonia || {};
      game.brancalonia.covoGranlussi = instance;

      // Registra macro automatiche
      CovoGranlussiSystem.registerMacros();

      console.log('Brancalonia | Sistema Granlussi del Covo inizializzato con successo');
      return instance;
    } catch (error) {
      console.error('Brancalonia | Errore inizializzazione Sistema Granlussi del Covo:', error);
      ui.notifications.error(`Errore inizializzazione Sistema Granlussi del Covo: ${error.message}`);
    }
  }

  static registerSettings() {
    game.settings.register('brancalonia-bigat', 'covoGranlussiEnabled', {
      name: 'Abilita Sistema Granlussi',
      hint: 'Attiva il sistema completo dei Granlussi del Covo',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
      onChange: value => {
        console.log('Brancalonia | Sistema Granlussi:', value ? 'abilitato' : 'disabilitato');
        ui.notifications.info(`Sistema Granlussi ${value ? 'abilitato' : 'disabilitato'}`);
      }
    });

    game.settings.register('brancalonia-bigat', 'covoShared', {
      name: 'Covo Condiviso',
      hint: 'Il Covo è condiviso tra tutti i personaggi giocanti',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'granlussiStarting', {
      name: 'Granlussi Iniziali',
      hint: 'Numero di Granlussi con cui inizia una nuova banda',
      scope: 'world',
      config: true,
      type: Number,
      default: 2,
      range: { min: 0, max: 5, step: 1 }
    });

    game.settings.register('brancalonia-bigat', 'granlussiAutoUpgrade', {
      name: 'Upgrade Automatico',
      hint: 'Consenti upgrade automatici durante lo Sbraco',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    console.log('Brancalonia | Settings Sistema Granlussi registrate');
  }

  static registerHooks() {
    // Hook principale di inizializzazione
    Hooks.on('ready', async () => {
      if (!game.settings.get('brancalonia-bigat', 'covoGranlussiEnabled')) return;

      const instance = game.brancalonia?.covoGranlussi;
      if (instance && !instance.initialized) {
        await instance.initialize();
      }
    });

    // Hook per rendering actor sheet
    Hooks.on('renderActorSheet', CovoGranlussiSystem._onRenderActorSheet);

    // Hook per inizio lavoretti
    Hooks.on('brancalonia.jobStarted', CovoGranlussiSystem._onJobStarted);

    // Hook per fase Sbraco
    Hooks.on('brancalonia.sbracoStarted', CovoGranlussiSystem._onSbracoStarted);

    // Hook per riposo lungo
    Hooks.on('dnd5e.restCompleted', CovoGranlussiSystem._onRestCompleted);

    console.log('Brancalonia | Hooks Sistema Granlussi registrati');
  }

  static registerChatCommands() {
    // Comando per gestire covo tramite hook chatMessage
    Hooks.on('chatMessage', (html, content, msg) => {
      if (!content.startsWith('/covo')) return true;

      const args = content.split(' ').slice(1);
      const speaker = ChatMessage.getSpeaker();

      CovoGranlussiSystem._handleChatCommand(args, speaker);
      return false; // Blocca il messaggio normale
    });

    // Sistema di help per comandi
    game.brancalonia = game.brancalonia || {};
    game.brancalonia.covoHelp = () => {
      const helpContent = `
        <div class="brancalonia-help">
          <h3>Comandi Sistema Granlussi del Covo</h3>
          <ul>
            <li><strong>/covo status</strong> - Mostra stato del covo</li>
            <li><strong>/covo upgrade [granlusso]</strong> - Migliora un granlusso</li>
            <li><strong>/covo buy [item]</strong> - Acquista dalla Borsa Nera</li>
            <li><strong>/covo repair [item]</strong> - Ripara con la Fucina</li>
            <li><strong>/covo brew [potion]</strong> - Crea intruglio</li>
            <li><strong>/covo stable</strong> - Gestisci Scuderie</li>
            <li><strong>/covo cellar</strong> - Usa benefici Cantina</li>
          </ul>
          <h4>Granlussi Disponibili:</h4>
          <ul>
            <li><strong>Borsa Nera</strong> - Commercio oggetti magici</li>
            <li><strong>Cantina</strong> - Benefici riposo</li>
            <li><strong>Distilleria</strong> - Intrugli alchemici</li>
            <li><strong>Fucina</strong> - Riparazione equipaggiamento</li>
            <li><strong>Scuderie</strong> - Cavalcature e veicoli</li>
          </ul>
        </div>`;

      ChatMessage.create({
        content: helpContent,
        whisper: [game.user.id]
      });
    };

    console.log('Brancalonia | Comandi chat Sistema Granlussi registrati');
  }

  static registerMacros() {
    // Macro gestione covo
    if (!game.macros.find(m => m.name === 'Gestione Covo')) {
      game.macros.documentClass.create({
        name: 'Gestione Covo',
        type: 'script',
        img: 'icons/environment/settlement/house-cottage.webp',
        command: [
          'const actor = game.user.character || canvas.tokens.controlled[0]?.actor;',
          'if (!actor) {',
          "  ui.notifications.warn('Seleziona un personaggio o token');",
          '  return;',
          '}',
          'game.brancalonia?.covoGranlussi?.openCovoManagementDialog(actor);'
        ].join('\n')
      });
    }

    // Macro status granlussi
    if (!game.macros.find(m => m.name === 'Status Granlussi')) {
      game.macros.documentClass.create({
        name: 'Status Granlussi',
        type: 'script',
        img: 'icons/tools/hand/hammer-and-anvil.webp',
        command: [
          'const actor = game.user.character || canvas.tokens.controlled[0]?.actor;',
          'if (!actor) {',
          "  ui.notifications.warn('Seleziona un personaggio o token');",
          '  return;',
          '}',
          'game.brancalonia?.covoGranlussi?.showCovoStatus(actor);'
        ].join('\n')
      });
    }

    console.log('Brancalonia | Macro Sistema Granlussi registrate');
  }

  // Hook handlers statici
  static _onRenderActorSheet(sheet, html, data) {
    const instance = game.brancalonia?.covoGranlussi;
    if (!instance?.initialized) return;

    try {
      if (game.user.isGM || sheet.actor.isOwner) {
        instance.renderCovoUI(sheet, html, data);
      }
    } catch (error) {
      console.error('Brancalonia | Errore renderActorSheet:', error);
    }
  }

  static _onJobStarted(actors) {
    const instance = game.brancalonia?.covoGranlussi;
    if (!instance?.initialized) return;

    try {
      instance.applyGranlussiBenefits(actors);
    } catch (error) {
      console.error('Brancalonia | Errore jobStarted:', error);
    }
  }

  static _onSbracoStarted() {
    const instance = game.brancalonia?.covoGranlussi;
    if (!instance?.initialized) return;

    try {
      if (game.user.isGM) {
        instance.openGranlussiManagement();
      }
    } catch (error) {
      console.error('Brancalonia | Errore sbracoStarted:', error);
    }
  }

  static _onRestCompleted(actor, config) {
    const instance = game.brancalonia?.covoGranlussi;
    if (!instance?.initialized) return;

    try {
      if (config.restType === 'long') {
        instance.applyCantinaBenefits(actor);
      }
    } catch (error) {
      console.error('Brancalonia | Errore restCompleted:', error);
    }
  }

  static _handleChatCommand(args, speaker) {
    const instance = game.brancalonia?.covoGranlussi;
    if (!instance?.initialized) return;

    try {
      instance.handleChatCommand(args, speaker);
    } catch (error) {
      console.error('Brancalonia | Errore chat command:', error);
      ui.notifications.error('Errore comando sistema granlussi');
    }
  }

  // Inizializza il sistema (chiamato dopo ready)
  async initialize() {
    if (this.initialized) return;

    try {
      // Carica configurazioni granlussi
      await this.loadGranlussiConfig();

      // Carica configurazioni intrugli
      await this.loadIntruglioConfig();

      this.initialized = true;
      console.log('Brancalonia | Sistema Granlussi del Covo configurato');
      ui.notifications.info('Sistema Granlussi del Covo attivo');
    } catch (error) {
      console.error('Brancalonia | Errore inizializzazione sistema granlussi:', error);
      ui.notifications.error('Errore inizializzazione Sistema Granlussi del Covo');
    }
  }

  // Carica configurazione granlussi
  async loadGranlussiConfig() {
    this.granlussi = {
      borsaNera: {
        name: 'Borsa Nera',
        icon: 'icons/containers/bags/pouch-simple-leather-brown.webp',
        description: 'Rete commerciale per oggetti magici e materiali rari',
        type: 'commerce',
        levels: {
          1: {
            cost: 100,
            benefits: 'Oggetti magici comuni al costo di 50 mo',
            monthlyItems: 1,
            rarity: 'common',
            discount: 0.5
          },
          2: {
            cost: 50,
            benefits: 'Oggetti magici non comuni al costo di 150 mo',
            monthlyItems: 1,
            rarity: 'uncommon',
            discount: 0.3
          },
          3: {
            cost: 50,
            benefits: 'Il ricettatore può provare a recuperare oggetti specifici',
            monthlyItems: 1,
            rarity: 'rare',
            specificOrder: true,
            discount: 0.2
          }
        }
      },

      cantina: {
        name: 'Cantina',
        icon: 'icons/environment/settlement/cellar.webp',
        description: 'Luogo fresco per conservare cibo e bevande',
        type: 'rest',
        provides: 'Utensili da Cuoco',
        levels: {
          1: {
            cost: 100,
            benefits: 'Recuperi tutti i Dadi Vita invece che metà durante riposo lungo',
            rations: 1,
            effect: 'fullHD'
          },
          2: {
            cost: 50,
            benefits: 'Recuperi 1 livello di indebolimento aggiuntivo durante riposo lungo',
            rations: 2,
            effect: 'extraExhaustion'
          },
          3: {
            cost: 50,
            benefits: 'Ottieni 1 punto ispirazione durante riposo lungo',
            rations: 3,
            effect: 'inspiration'
          }
        }
      },

      distilleria: {
        name: 'Distilleria',
        icon: 'icons/tools/laboratory/alembic-copper-blue.webp',
        description: 'Alambicchi per distillare intrugli e bevande',
        type: 'alchemy',
        provides: 'Scorte da Mescitore e Scorte da Alchimista',
        levels: {
          1: {
            cost: 100,
            benefits: 'Acquamorte o Richiamino gratuiti',
            intrugli: ['acquamorte', 'richiamino'],
            dailyProduction: 1
          },
          2: {
            cost: 50,
            benefits: 'Afrore di Servatico o Infernet Malebranca gratuiti',
            intrugli: ['afrore_servatico', 'infernet_malebranca'],
            dailyProduction: 1
          },
          3: {
            cost: 50,
            benefits: 'Cordiale Biondino o Intruglio della Forza gratuiti',
            intrugli: ['cordiale_biondino', 'intruglio_forza'],
            dailyProduction: 2
          }
        }
      },

      fucina: {
        name: 'Fucina',
        icon: 'icons/tools/smithing/anvil.webp',
        description: 'Forge per riparare e migliorare equipaggiamento',
        type: 'crafting',
        provides: 'Strumenti da Fabbro e Arnesi da Scasso',
        levels: {
          1: {
            cost: 100,
            benefits: 'Il fabbro può riparare oggetti metallici rotti',
            repairMetal: true,
            repairCost: 0.25
          },
          2: {
            cost: 50,
            benefits: 'Il fabbro può sbloccare lucchetti (non magici)',
            unlock: true,
            repairCost: 0.2
          },
          3: {
            cost: 50,
            benefits: 'Disponibili armi/armature non scadenti',
            nonShoddy: true,
            repairCost: 0.1
          }
        }
      },

      scuderie: {
        name: 'Scuderie',
        icon: 'icons/environment/settlement/stable.webp',
        description: 'Stalle per cavalcature e veicoli',
        type: 'transport',
        levels: {
          1: {
            cost: 100,
            benefits: 'Pony scadente, Asino, Mulo, Carretto scadente, Slitta scadente',
            mounts: ['pony_shoddy', 'donkey', 'mule'],
            vehicles: ['cart_shoddy', 'sled_shoddy'],
            maxLoans: 2
          },
          2: {
            cost: 50,
            benefits: 'Cavallo da Traino/Galoppo scadente, Carro scadente',
            mounts: ['draft_horse_shoddy', 'riding_horse_shoddy'],
            vehicles: ['wagon_shoddy'],
            maxLoans: 3
          },
          3: {
            cost: 50,
            benefits: 'Tutti i servizi precedenti ma non scadenti',
            nonShoddy: true,
            maxLoans: 5
          }
        }
      }
    };

    console.log('Brancalonia | Configurazione granlussi caricata');
  }

  // Carica configurazione intrugli
  async loadIntruglioConfig() {
    this.intrugli = {
      acquamorte: {
        name: 'Acquamorte',
        type: 'consumable',
        img: 'icons/consumables/potions/bottle-round-corked-yellow.webp',
        rarity: 'common',
        system: {
          description: { value: 'Cura 2d4+2 punti ferita quando bevuta.' },
          uses: { value: 1, max: 1, per: null },
          actionType: 'heal',
          damage: { parts: [['2d4 + 2', 'healing']] },
          price: { value: 15, denomination: 'gp' }
        }
      },
      richiamino: {
        name: 'Richiamino',
        type: 'consumable',
        img: 'icons/consumables/potions/bottle-round-flask-purple.webp',
        rarity: 'common',
        system: {
          description: { value: 'Risveglia immediatamente una creatura priva di sensi (0 PF).' },
          uses: { value: 1, max: 1, per: null },
          actionType: 'util',
          price: { value: 20, denomination: 'gp' }
        }
      },
      afrore_servatico: {
        name: 'Afrore di Servatico',
        type: 'consumable',
        img: 'icons/consumables/potions/bottle-round-corked-green.webp',
        rarity: 'uncommon',
        system: {
          description: { value: 'Conferisce resistenza a veleni per 1 ora.' },
          uses: { value: 1, max: 1, per: null },
          duration: { value: 1, units: 'hour' },
          actionType: 'util',
          price: { value: 30, denomination: 'gp' }
        }
      },
      infernet_malebranca: {
        name: 'Infernet Malebranca',
        type: 'consumable',
        img: 'icons/consumables/potions/bottle-round-corked-red.webp',
        rarity: 'uncommon',
        system: {
          description: { value: 'Conferisce resistenza al fuoco per 1 ora.' },
          uses: { value: 1, max: 1, per: null },
          duration: { value: 1, units: 'hour' },
          actionType: 'util',
          price: { value: 40, denomination: 'gp' }
        }
      },
      cordiale_biondino: {
        name: 'Cordiale Biondino',
        type: 'consumable',
        img: 'icons/consumables/potions/bottle-round-corked-orange.webp',
        rarity: 'uncommon',
        system: {
          description: { value: 'Rimuove 1 livello di indebolimento.' },
          uses: { value: 1, max: 1, per: null },
          actionType: 'heal',
          price: { value: 50, denomination: 'gp' }
        }
      },
      intruglio_forza: {
        name: 'Intruglio della Forza',
        type: 'consumable',
        img: 'icons/consumables/potions/bottle-bulb-corked-red.webp',
        rarity: 'rare',
        system: {
          description: { value: 'Forza diventa 21 per 1 ora.' },
          uses: { value: 1, max: 1, per: null },
          duration: { value: 1, units: 'hour' },
          actionType: 'util',
          price: { value: 100, denomination: 'gp' }
        }
      }
    };

    console.log('Brancalonia | Configurazione intrugli caricata');
  }

  // Renderizza UI del Covo sulla scheda
  renderCovoUI(sheet, html, data) {
    try {
      const $html = $(html);
      const actor = sheet.actor;
      const covo = this.getCovoData(actor);

      const covoHtml = `
        <div class="brancalonia-covo-section" style="border: 2px solid #8B4513; padding: 10px; margin: 10px 0; border-radius: 5px;">
          <h3 style="display: flex; justify-content: space-between; align-items: center; margin: 0 0 10px 0;">
            <span><i class="fas fa-home"></i> Covo della Banda</span>
            ${game.user.isGM || actor.isOwner ? `<button class="manage-covo" style="font-size: 0.8em; padding: 2px 6px;">Gestisci</button>` : ''}
          </h3>

          <div class="granlussi-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px;">
            ${this.renderGranlussiList(covo)}
          </div>

          <div class="covo-summary" style="margin-top: 10px; padding: 5px; background: rgba(139, 69, 19, 0.1); border-radius: 3px;">
            <small><strong>Granlussi attivi:</strong> ${Object.values(covo).filter(level => level > 0).length}/5</small>
          </div>
        </div>
      `;

      // Inserisci dopo l'inventario o nel corpo della scheda
      const inventoryTab = $html.find('.tab.inventory');
      if (inventoryTab.length) {
        inventoryTab.append(covoHtml);
      } else {
        $html.find('.sheet-body').append(covoHtml);
      }

      // Event listener
      $html.find('.manage-covo').off('click').on('click', () => {
        this.openCovoManagementDialog(actor);
      });
    } catch (error) {
      console.error('Brancalonia | Errore render covo UI:', error);
    }
  }

  // Renderizza lista granlussi
  renderGranlussiList(covo) {
    let html = '';

    for (const [key, granlusso] of Object.entries(this.granlussi)) {
      const level = covo[key] || 0;
      const levelInfo = level > 0 ? granlusso.levels[level] : null;

      html += `
        <div class="granlusso-item" style="border: 1px solid #ccc; padding: 5px; border-radius: 3px; background: ${level > 0 ? 'rgba(40, 167, 69, 0.1)' : 'rgba(108, 117, 125, 0.1)'};">
          <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 3px;">
            <img src="${granlusso.icon}" width="20" height="20" style="border-radius: 2px;">
            <strong style="font-size: 0.9em;">${granlusso.name}</strong>
          </div>
          <div style="font-size: 0.8em;">
            <div style="margin-bottom: 2px;">Livello: ${level}/3</div>
            ${levelInfo ? `<div style="font-style: italic; color: #666; font-size: 0.75em;">${levelInfo.benefits}</div>` : ''}
          </div>
        </div>
      `;
    }

    return html;
  }

  // Ottiene dati covo
  getCovoData(actor) {
    if (game.settings.get('brancalonia-bigat', 'covoShared')) {
      // Covo condiviso - usa il primo PG come master
      const partyLeader = game.actors.find(a =>
        a.type === 'character' &&
        a.hasPlayerOwner &&
        a.getFlag('brancalonia-bigat', 'partyLeader')
      ) || game.actors.find(a => a.type === 'character' && a.hasPlayerOwner);

      return partyLeader?.getFlag('brancalonia-bigat', 'covo') || {};
    } else {
      return actor.getFlag('brancalonia-bigat', 'covo') || {};
    }
  }

  // Aggiorna dati covo
  async updateCovoData(actor, covoData) {
    if (game.settings.get('brancalonia-bigat', 'covoShared')) {
      const partyLeader = game.actors.find(a =>
        a.type === 'character' &&
        a.hasPlayerOwner &&
        a.getFlag('brancalonia-bigat', 'partyLeader')
      ) || game.actors.find(a => a.type === 'character' && a.hasPlayerOwner);

      if (partyLeader) {
        await partyLeader.setFlag('brancalonia-bigat', 'covo', covoData);
      }
    } else {
      await actor.setFlag('brancalonia-bigat', 'covo', covoData);
    }
  }

  // Dialog per gestione del Covo
  async openCovoManagementDialog(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun personaggio selezionato');
      return;
    }

    try {
      const covo = this.getCovoData(actor);
      const money = actor.system.currency?.gp || 0;

      let content = `
        <div class="covo-management" style="max-height: 500px; overflow-y: auto;">
          <div style="margin-bottom: 15px; padding: 8px; background: #f8f9fa; border-radius: 3px;">
            <p style="margin: 0;"><strong>💰 Denaro disponibile:</strong> ${money} mo</p>
            <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #666;">
              <i class="fas fa-info-circle"></i> Ogni granlusso ha 3 livelli di miglioramento
            </p>
          </div>
          <hr style="margin: 10px 0;">
          <div class="granlussi-upgrade">
      `;

      for (const [key, granlusso] of Object.entries(this.granlussi)) {
        const currentLevel = covo[key] || 0;
        const canUpgrade = currentLevel < 3;
        const nextLevel = currentLevel + 1;
        const cost = canUpgrade ? granlusso.levels[nextLevel].cost : 0;

        content += `
          <div class="granlusso-upgrade-item" style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <img src="${granlusso.icon}" width="24" height="24">
              <h4 style="margin: 0;">${granlusso.name} (Livello ${currentLevel}/3)</h4>
            </div>
            <p style="font-size: 0.9em; margin: 5px 0; color: #666;">${granlusso.description}</p>

            ${currentLevel > 0 ? `
              <div style="margin: 8px 0; padding: 5px; background: rgba(40, 167, 69, 0.1); border-radius: 3px;">
                <strong style="font-size: 0.9em;">📋 Benefici attuali:</strong>
                <p style="margin: 3px 0 0 0; font-size: 0.85em;">${granlusso.levels[currentLevel].benefits}</p>
              </div>
            ` : ''}

            ${canUpgrade ? `
              <div style="margin: 8px 0; padding: 5px; background: rgba(255, 193, 7, 0.1); border-radius: 3px;">
                <strong style="font-size: 0.9em;">⬆️ Prossimo livello (${nextLevel}):</strong>
                <p style="margin: 3px 0; font-size: 0.85em;">${granlusso.levels[nextLevel].benefits}</p>
                <p style="margin: 3px 0 0 0; font-weight: bold;">💰 Costo: ${cost} mo</p>
              </div>
              <button class="upgrade-granlusso" data-key="${key}" data-cost="${cost}"
                style="width: 100%; padding: 5px; margin-top: 5px; ${money < cost ? 'background: #6c757d; cursor: not-allowed;' : 'background: #28a745; cursor: pointer;'} color: white; border: none; border-radius: 3px;"
                ${money < cost ? 'disabled' : ''}>
                ${money < cost ? '❌ Fondi insufficienti' : `✅ Migliora (${cost} mo)`}
              </button>
            ` : '<p style="margin: 8px 0; font-style: italic; color: #28a745;"><i class="fas fa-check-circle"></i> Livello massimo raggiunto!</p>'}
          </div>
        `;
      }

      content += `
          </div>
          <hr style="margin: 15px 0 10px 0;">
          <div style="text-align: center;">
            <button class="show-covo-status" style="padding: 8px 15px; background: #17a2b8; color: white; border: none; border-radius: 3px; margin-right: 10px;">
              📊 Mostra Status Dettagliato
            </button>
            <button class="reset-covo" style="padding: 8px 15px; background: #dc3545; color: white; border: none; border-radius: 3px;">
              🗑️ Reset Covo
            </button>
          </div>
        </div>
      `;

      const dialog = new Dialog({
        title: `🏠 Gestione Covo - ${actor.name}`,
        content,
        buttons: {
          close: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Chiudi'
          }
        },
        render: (html) => {
          // Event listeners per i pulsanti di upgrade
          html.find('.upgrade-granlusso').off('click').on('click', async (e) => {
            const key = e.currentTarget.dataset.key;
            const cost = parseInt(e.currentTarget.dataset.cost);

            const confirmed = await Dialog.confirm({
              title: 'Conferma Upgrade',
              content: `<p>Vuoi migliorare <strong>${this.granlussi[key].name}</strong> per <strong>${cost} mo</strong>?</p>`
            });

            if (confirmed) {
              await this.upgradeGranlusso(actor, key, cost);
              dialog.close();
              setTimeout(() => this.openCovoManagementDialog(actor), 100);
            }
          });

          // Event listener per status
          html.find('.show-covo-status').off('click').on('click', () => {
            this.showCovoStatus(actor);
          });

          // Event listener per reset
          html.find('.reset-covo').off('click').on('click', async () => {
            const confirmed = await Dialog.confirm({
              title: 'Reset Covo',
              content: '<p style="color: red;"><strong>⚠️ ATTENZIONE!</strong></p><p>Questo resetterà completamente il covo. L\'operazione è irreversibile!</p>'
            });

            if (confirmed) {
              await this.resetCovo(actor);
              dialog.close();
              ui.notifications.info('Covo resettato');
            }
          });
        }
      }, {
        width: 600,
        height: 700,
        resizable: true
      });

      dialog.render(true);
    } catch (error) {
      console.error('Brancalonia | Errore dialog gestione covo:', error);
      ui.notifications.error('Errore apertura gestione covo');
    }
  }

  // Migliora un granlusso
  async upgradeGranlusso(actor, granlussoKey, cost) {
    try {
      const currentMoney = actor.system.currency?.gp || 0;
      if (currentMoney < cost) {
        ui.notifications.error('Fondi insufficienti!');
        return;
      }

      // Sottrai denaro
      await actor.update({
        'system.currency.gp': currentMoney - cost
      });

      // Aumenta livello Granlusso
      const covo = this.getCovoData(actor);
      const currentLevel = covo[granlussoKey] || 0;
      covo[granlussoKey] = currentLevel + 1;

      await this.updateCovoData(actor, covo);

      // Notifica
      const granlusso = this.granlussi[granlussoKey];
      const newLevel = covo[granlussoKey];

      const message = `
        <div class="brancalonia-granlusso-upgrade" style="border: 2px solid #28a745; padding: 10px; border-radius: 5px;">
          <h3 style="color: #28a745; margin: 0 0 10px 0;">🎉 ${granlusso.name} Migliorato!</h3>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${granlusso.icon}" width="48" height="48" style="border-radius: 5px;">
            <div>
              <p style="margin: 0; font-weight: bold;">${actor.name} ha migliorato ${granlusso.name} al livello ${newLevel}</p>
              <p style="margin: 5px 0 0 0; font-style: italic;">Costo: ${cost} mo</p>
            </div>
          </div>
          <div style="margin-top: 10px; padding: 8px; background: rgba(40, 167, 69, 0.1); border-radius: 3px;">
            <strong>✨ Nuovi benefici:</strong>
            <p style="margin: 3px 0 0 0;">${granlusso.levels[newLevel].benefits}</p>
          </div>
        </div>
      `;

      await ChatMessage.create({
        content: message,
        speaker: ChatMessage.getSpeaker({ actor }),
        flags: {
          'brancalonia-bigat': {
            granlussoUpgrade: true,
            granlussoKey,
            newLevel
          }
        }
      });

      console.log(`Brancalonia | Granlusso ${granlussoKey} migliorato al livello ${newLevel} per ${actor.name}`);
    } catch (error) {
      console.error('Brancalonia | Errore upgrade granlusso:', error);
      ui.notifications.error('Errore durante l\'upgrade del granlusso');
    }
  }

  // Mostra status del covo
  showCovoStatus(actor) {
    try {
      const covo = this.getCovoData(actor);
      let totalValue = 0;
      let activeGranlussi = 0;

      let content = `
        <div class="covo-status">
          <h3 style="margin: 0 0 15px 0;">📊 Status Dettagliato del Covo</h3>
      `;

      for (const [key, granlusso] of Object.entries(this.granlussi)) {
        const level = covo[key] || 0;
        if (level > 0) {
          activeGranlussi++;
          // Calcola valore investito
          let invested = 0;
          for (let i = 1; i <= level; i++) {
            invested += granlusso.levels[i].cost;
          }
          totalValue += invested;

          content += `
            <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #28a745; border-radius: 5px; background: rgba(40, 167, 69, 0.05);">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                <img src="${granlusso.icon}" width="24" height="24">
                <strong>${granlusso.name}</strong>
                <span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.8em;">Livello ${level}</span>
              </div>
              <p style="margin: 5px 0; font-size: 0.9em;">${granlusso.levels[level].benefits}</p>
              <p style="margin: 0; font-size: 0.8em; color: #666;">💰 Investimento: ${invested} mo</p>
            </div>
          `;
        } else {
          content += `
            <div style="margin-bottom: 10px; padding: 8px; border: 1px solid #6c757d; border-radius: 5px; background: rgba(108, 117, 125, 0.05);">
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="${granlusso.icon}" width="20" height="20" style="opacity: 0.5;">
                <span style="color: #6c757d;">${granlusso.name}</span>
                <span style="background: #6c757d; color: white; padding: 1px 4px; border-radius: 3px; font-size: 0.7em;">Non costruito</span>
              </div>
            </div>
          `;
        }
      }

      content += `
          <hr style="margin: 15px 0;">
          <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
            <h4 style="margin: 0 0 10px 0;">📈 Riepilogo Investimenti</h4>
            <p style="margin: 5px 0;"><strong>Granlussi attivi:</strong> ${activeGranlussi}/5</p>
            <p style="margin: 5px 0;"><strong>Valore totale investito:</strong> ${totalValue} mo</p>
            <p style="margin: 5px 0;"><strong>Progresso:</strong> ${Math.round((activeGranlussi / 5) * 100)}% completamento</p>
          </div>
        </div>
      `;

      new Dialog({
        title: '📊 Status Covo',
        content,
        buttons: {
          close: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Chiudi'
          }
        }
      }, {
        width: 500
      }).render(true);
    } catch (error) {
      console.error('Brancalonia | Errore status covo:', error);
      ui.notifications.error('Errore visualizzazione status covo');
    }
  }

  // Reset del covo
  async resetCovo(actor) {
    try {
      await this.updateCovoData(actor, {});

      // Rimuovi anche prestiti e altri flag correlati
      await actor.unsetFlag('brancalonia-bigat', 'scuderieLoan');
      await actor.unsetFlag('brancalonia-bigat', 'borsaNeraLastCheck');

      console.log(`Brancalonia | Covo resettato per ${actor.name}`);
    } catch (error) {
      console.error('Brancalonia | Errore reset covo:', error);
      ui.notifications.error('Errore durante il reset del covo');
    }
  }

  // Applica benefici granlussi all'inizio del lavoretto
  async applyGranlussiBenefits(actors) {
    try {
      for (const actor of actors) {
        const covo = this.getCovoData(actor);

        // Cantina - razioni gratuite
        if (covo.cantina > 0) {
          const level = this.granlussi.cantina.levels[covo.cantina];
          const rations = level.rations;

          const message = `
            <div style="border: 1px solid #8B4513; padding: 8px; border-radius: 3px;">
              <strong>🍽️ Cantina del Covo</strong><br>
              ${actor.name} riceve ${rations} razione/i gratuite dalla Cantina
            </div>`;

          await ChatMessage.create({
            content: message,
            speaker: ChatMessage.getSpeaker({ actor })
          });
        }

        // Distilleria - intruglio gratuito
        if (covo.distilleria > 0) {
          const level = this.granlussi.distilleria.levels[covo.distilleria];
          await this.selectFreePotion(actor, level.intrugli);
        }

        // Fucina - miglioramenti temporanei
        if (covo.fucina > 0) {
          await actor.setFlag('brancalonia-bigat', 'fucinaLevel', covo.fucina);
          this.selectItemsToImprove(actor, covo.fucina);
        }

        // Scuderie - prestito cavalcature
        if (covo.scuderie > 0) {
          this.offerMountLoan(actor, covo.scuderie);
        }

        // Borsa Nera - controllo oggetti mensili
        if (covo.borsaNera > 0) {
          await this.checkBorsaNeraItems(actor, covo.borsaNera);
        }
      }
    } catch (error) {
      console.error('Brancalonia | Errore applicazione benefici granlussi:', error);
    }
  }

  // Applica benefici cantina durante riposo lungo
  async applyCantinaBenefits(actor) {
    try {
      const covo = this.getCovoData(actor);
      if (covo.cantina === 0) return;

      const level = this.granlussi.cantina.levels[covo.cantina];
      const effects = [];

      switch (level.effect) {
        case 'fullHD':
          effects.push('Recuperi tutti i Dadi Vita invece che metà');
          break;
        case 'extraExhaustion':
          if (actor.system.attributes.exhaustion > 0) {
            const newExhaustion = Math.max(0, actor.system.attributes.exhaustion - 1);
            await actor.update({ 'system.attributes.exhaustion': newExhaustion });
            effects.push('Recuperi 1 livello di indebolimento aggiuntivo');
          }
          break;
        case 'inspiration':
          await actor.setFlag('brancalonia-bigat', 'inspiration', true);
          effects.push('Ottieni 1 punto ispirazione');
          break;
      }

      if (effects.length > 0) {
        const message = `
          <div style="border: 2px solid #28a745; padding: 10px; border-radius: 5px;">
            <h4 style="color: #28a745; margin: 0 0 8px 0;">🍽️ Benefici della Cantina</h4>
            <p style="margin: 0;">${actor.name} beneficia dei servizi della Cantina:</p>
            <ul style="margin: 5px 0 0 20px;">
              ${effects.map(effect => `<li>${effect}</li>`).join('')}
            </ul>
          </div>`;

        await ChatMessage.create({
          content: message,
          speaker: ChatMessage.getSpeaker({ actor })
        });
      }
    } catch (error) {
      console.error('Brancalonia | Errore benefici cantina:', error);
    }
  }

  // Seleziona intruglio gratuito dalla distilleria
  async selectFreePotion(actor, availableIntrugli) {
    try {
      const options = availableIntrugli.map(key => {
        const intruglio = this.intrugli[key];
        return `<option value="${key}">${intruglio.name}</option>`;
      }).join('');

      const content = `
        <div style="text-align: center; padding: 10px;">
          <img src="icons/tools/laboratory/alembic-copper-blue.webp" width="48" height="48" style="margin-bottom: 10px;">
          <p>La <strong>Distilleria</strong> ha preparato degli intrugli per te!</p>
          <p>Scegli un intruglio gratuito:</p>
          <select name="intruglio" style="width: 100%; padding: 5px; margin: 10px 0;">${options}</select>
        </div>
      `;

      new Dialog({
        title: '🧪 Distilleria - Intruglio Gratuito',
        content,
        buttons: {
          confirm: {
            icon: '<i class="fas fa-flask"></i>',
            label: 'Prendi Intruglio',
            callback: async (html) => {
              const chosen = html.find('select[name="intruglio"]').val();
              const itemData = foundry.utils.duplicate(this.intrugli[chosen]);

              if (itemData) {
                await actor.createEmbeddedDocuments('Item', [itemData]);

                const message = `
                  <div style="border: 1px solid #17a2b8; padding: 8px; border-radius: 3px;">
                    <strong>🧪 Distilleria del Covo</strong><br>
                    ${actor.name} riceve <strong>${itemData.name}</strong> dalla Distilleria
                  </div>`;

                await ChatMessage.create({
                  content: message,
                  speaker: ChatMessage.getSpeaker({ actor })
                });
              }
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Annulla'
          }
        }
      }).render(true);
    } catch (error) {
      console.error('Brancalonia | Errore selezione intruglio:', error);
    }
  }

  // Seleziona oggetti da migliorare con la fucina
  async selectItemsToImprove(actor, fucinaLevel) {
    try {
      const shoddyItems = actor.items.filter(i =>
        i.getFlag('brancalonia-bigat', 'shoddy') &&
        ['weapon', 'equipment'].includes(i.type)
      );

      if (shoddyItems.length === 0) {
        ui.notifications.info('Nessun oggetto scadente da migliorare');
        return;
      }

      const maxItems = fucinaLevel;
      const options = shoddyItems.map(item =>
        `<label style="display: block; margin: 5px 0; cursor: pointer;">
          <input type="checkbox" name="improve" value="${item.id}" style="margin-right: 8px;">
          ${item.name}
        </label>`
      ).join('');

      const content = `
        <div style="padding: 10px;">
          <div style="text-align: center; margin-bottom: 15px;">
            <img src="icons/tools/smithing/anvil.webp" width="48" height="48">
          </div>
          <p>La <strong>Fucina</strong> può temporaneamente migliorare la qualità di <strong>${maxItems}</strong> oggetto/i scadente/i:</p>
          <div style="max-height: 200px; overflow-y: auto; margin: 10px 0;">${options}</div>
          <p style="font-size: 0.9em; color: #666; font-style: italic;">
            💡 I miglioramenti durano per tutta la missione
          </p>
        </div>
      `;

      new Dialog({
        title: '🔨 Fucina - Migliora Oggetti',
        content,
        buttons: {
          confirm: {
            icon: '<i class="fas fa-hammer"></i>',
            label: 'Conferma Miglioramenti',
            callback: async (html) => {
              const selected = html.find('input[name="improve"]:checked')
                .toArray()
                .slice(0, maxItems)
                .map(el => el.value);

              for (const itemId of selected) {
                const item = actor.items.get(itemId);
                if (item) {
                  await item.setFlag('brancalonia-bigat', 'temporaryImproved', true);
                }
              }

              if (selected.length > 0) {
                const itemNames = selected.map(id => actor.items.get(id)?.name).join(', ');

                const message = `
                  <div style="border: 1px solid #fd7e14; padding: 8px; border-radius: 3px;">
                    <strong>🔨 Fucina del Covo</strong><br>
                    Oggetti temporaneamente migliorati: <strong>${itemNames}</strong>
                  </div>`;

                await ChatMessage.create({
                  content: message,
                  speaker: ChatMessage.getSpeaker({ actor })
                });
              }
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Annulla'
          }
        }
      }).render(true);
    } catch (error) {
      console.error('Brancalonia | Errore selezione oggetti da migliorare:', error);
    }
  }

  // Offre prestito cavalcature dalle scuderie
  async offerMountLoan(actor, scuderieLevel) {
    try {
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
      const cleanName = (name) => {
        const clean = name.replace('_shoddy', '').replace('_', ' ');
        return clean.charAt(0).toUpperCase() + clean.slice(1);
      };

      const mountOptions = availableMounts.map(m =>
        `<option value="${m}">${cleanName(m)}</option>`
      ).join('');

      const vehicleOptions = availableVehicles.map(v =>
        `<option value="${v}">${cleanName(v)}</option>`
      ).join('');

      const content = `
        <div style="padding: 15px;">
          <div style="text-align: center; margin-bottom: 15px;">
            <img src="icons/environment/settlement/stable.webp" width="48" height="48">
          </div>
          <p style="text-align: center; margin-bottom: 20px;">
            Le <strong>Scuderie</strong> del covo offrono cavalcature e veicoli in prestito per la missione
          </p>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
              🐴 Cavalcatura:
            </label>
            <select name="mount" style="width: 100%; padding: 5px;">
              <option value="">Nessuna cavalcatura</option>
              ${mountOptions}
            </select>
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
              🛒 Veicolo:
            </label>
            <select name="vehicle" style="width: 100%; padding: 5px;">
              <option value="">Nessun veicolo</option>
              ${vehicleOptions}
            </select>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 8px; border-radius: 3px; font-size: 0.9em;">
            <strong>⚠️ Attenzione:</strong> Se perdi il prestito durante la missione, dovrai risarcire il valore intero!
          </div>
        </div>
      `;

      new Dialog({
        title: '🐎 Scuderie - Prestito',
        content,
        buttons: {
          confirm: {
            icon: '<i class="fas fa-handshake"></i>',
            label: 'Prendi in Prestito',
            callback: async (html) => {
              const mount = html.find('select[name="mount"]').val();
              const vehicle = html.find('select[name="vehicle"]').val();

              const loans = [];
              if (mount) loans.push({ type: 'mount', name: mount, displayName: cleanName(mount) });
              if (vehicle) loans.push({ type: 'vehicle', name: vehicle, displayName: cleanName(vehicle) });

              if (loans.length > 0) {
                await actor.setFlag('brancalonia-bigat', 'scuderieLoan', loans);

                const loanText = loans.map(l => l.displayName).join(' e ');

                const message = `
                  <div style="border: 1px solid #6f42c1; padding: 8px; border-radius: 3px;">
                    <strong>🐎 Scuderie del Covo</strong><br>
                    ${actor.name} prende in prestito: <strong>${loanText}</strong>
                  </div>`;

                await ChatMessage.create({
                  content: message,
                  speaker: ChatMessage.getSpeaker({ actor })
                });
              }
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Annulla'
          }
        }
      }).render(true);
    } catch (error) {
      console.error('Brancalonia | Errore prestito scuderie:', error);
    }
  }

  // Controlla oggetti mensili dalla Borsa Nera
  async checkBorsaNeraItems(actor, borsaNeraLevel) {
    try {
      const lastCheck = actor.getFlag('brancalonia-bigat', 'borsaNeraLastCheck') || 0;
      const now = Date.now();
      const monthInMs = 30 * 24 * 60 * 60 * 1000; // 30 giorni

      if (now - lastCheck > monthInMs) {
        await this.generateMagicItems(actor, borsaNeraLevel);
        await actor.setFlag('brancalonia-bigat', 'borsaNeraLastCheck', now);
      }
    } catch (error) {
      console.error('Brancalonia | Errore controllo Borsa Nera:', error);
    }
  }

  // Genera oggetti magici dalla Borsa Nera
  async generateMagicItems(actor, borsaNeraLevel) {
    try {
      const level = this.granlussi.borsaNera.levels[borsaNeraLevel];
      const rarity = level.rarity;
      const rarityColors = {
        common: '#6c757d',
        uncommon: '#28a745',
        rare: '#007bff',
        'very rare': '#6f42c1',
        legendary: '#fd7e14'
      };

      // Per ora generiamo placeholder - in futuro si può integrare con compendi
      const items = [
        {
          name: `Oggetto Magico ${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`,
          type: 'equipment',
          img: 'icons/magic/defensive/amulet-gem-blue-gold.webp',
          system: {
            description: { value: `Un oggetto magico di rarità ${rarity} disponibile dalla Borsa Nera del covo.` },
            rarity,
            price: {
              value: rarity === 'common' ? 50 : rarity === 'uncommon' ? 150 : 500,
              denomination: 'gp'
            }
          }
        }
      ];

      const message = `
        <div style="border: 2px solid ${rarityColors[rarity]}; padding: 10px; border-radius: 5px;">
          <h4 style="color: ${rarityColors[rarity]}; margin: 0 0 10px 0;">🛍️ Borsa Nera - Nuovi Oggetti</h4>
          <p style="margin: 0 0 8px 0;">Il ricettatore ha trovato ${items.length} oggetto/i magico/i questo mese:</p>
          <ul style="margin: 5px 0 0 20px;">
            ${items.map(i => `<li><strong>${i.name}</strong> - ${i.system.price.value} mo</li>`).join('')}
          </ul>
          <p style="margin: 8px 0 0 0; font-size: 0.9em; color: #666;">
            💰 Usa il comando <code>/covo buy</code> per acquistare
          </p>
        </div>
      `;

      await ChatMessage.create({
        content: message,
        speaker: ChatMessage.getSpeaker({ actor }),
        flags: {
          'brancalonia-bigat': {
            borsaNeraItems: items,
            month: new Date().getMonth()
          }
        }
      });
    } catch (error) {
      console.error('Brancalonia | Errore generazione oggetti magici:', error);
    }
  }

  // Dialog per gestione granlussi durante lo Sbraco
  openGranlussiManagement() {
    try {
      const content = `
        <div class="granlussi-sbraco" style="padding: 15px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="icons/environment/settlement/house-cottage.webp" width="64" height="64">
            <h3 style="margin: 10px 0 0 0;">🏠 Gestione Granlussi - Fase di Sbraco</h3>
          </div>

          <div style="background: #e9ecef; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <p style="margin: 0;"><strong>Durante lo Sbraco puoi:</strong></p>
            <ul style="margin: 8px 0 0 20px;">
              <li>Costruire o migliorare un Granlusso (1 settimana per livello)</li>
              <li>Riscattare materiali per dimezzare i costi di costruzione</li>
              <li>Riparare eventuali danni al Covo</li>
              <li>Pianificare espansioni future</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <button class="manage-all-covos" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">
              🏠 Gestisci Covi della Cricca
            </button>
            <button class="show-granlussi-help" style="padding: 10px 20px; background: #17a2b8; color: white; border: none; border-radius: 5px; cursor: pointer;">
              ❓ Guida Granlussi
            </button>
          </div>
        </div>
      `;

      new Dialog({
        title: '🏗️ Granlussi - Fase Sbraco',
        content,
        buttons: {
          close: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Chiudi'
          }
        },
        render: (html) => {
          html.find('.manage-all-covos').off('click').on('click', () => {
            // Apri gestione per tutti i PG
            const playerCharacters = game.actors.filter(a =>
              a.type === 'character' && a.hasPlayerOwner
            );

            if (playerCharacters.length === 0) {
              ui.notifications.warn('Nessun personaggio giocante trovato');
              return;
            }

            playerCharacters.forEach(actor => {
              setTimeout(() => this.openCovoManagementDialog(actor), Math.random() * 500);
            });
          });

          html.find('.show-granlussi-help').off('click').on('click', () => {
            this.showGranlussiGuide();
          });
        }
      }, {
        width: 500
      }).render(true);
    } catch (error) {
      console.error('Brancalonia | Errore gestione granlussi:', error);
    }
  }

  // Mostra guida granlussi
  showGranlussiGuide() {
    const content = `
      <div style="padding: 10px; max-height: 500px; overflow-y: auto;">
        <h3>📚 Guida Completa ai Granlussi</h3>

        <div style="margin-bottom: 20px;">
          <h4>🏠 Borsa Nera</h4>
          <p><strong>Funzione:</strong> Commercio di oggetti magici</p>
          <ul>
            <li><strong>Livello 1:</strong> Oggetti comuni (50 mo)</li>
            <li><strong>Livello 2:</strong> Oggetti non comuni (150 mo)</li>
            <li><strong>Livello 3:</strong> Oggetti rari + ordini specifici</li>
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h4>🍽️ Cantina</h4>
          <p><strong>Funzione:</strong> Miglioramento del riposo</p>
          <ul>
            <li><strong>Livello 1:</strong> Recupero completo Dadi Vita</li>
            <li><strong>Livello 2:</strong> -1 indebolimento extra</li>
            <li><strong>Livello 3:</strong> +1 punto ispirazione</li>
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h4>🧪 Distilleria</h4>
          <p><strong>Funzione:</strong> Produzione intrugli alchemici</p>
          <ul>
            <li><strong>Livello 1:</strong> Acquamorte, Richiamino</li>
            <li><strong>Livello 2:</strong> Afrore Servatico, Infernet</li>
            <li><strong>Livello 3:</strong> Cordiale Biondino, Intruglio Forza</li>
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h4>🔨 Fucina</h4>
          <p><strong>Funzione:</strong> Riparazione e miglioramento</p>
          <ul>
            <li><strong>Livello 1:</strong> Riparazione oggetti metallici</li>
            <li><strong>Livello 2:</strong> Sblocco lucchetti</li>
            <li><strong>Livello 3:</strong> Equipaggiamento non scadente</li>
          </ul>
        </div>

        <div style="margin-bottom: 20px;">
          <h4>🐎 Scuderie</h4>
          <p><strong>Funzione:</strong> Cavalcature e veicoli</p>
          <ul>
            <li><strong>Livello 1:</strong> Animali da soma, carretti</li>
            <li><strong>Livello 2:</strong> Cavalli, carri</li>
            <li><strong>Livello 3:</strong> Tutto non scadente</li>
          </ul>
        </div>

        <div style="background: #fff3cd; padding: 10px; border-radius: 5px;">
          <p style="margin: 0;"><strong>💡 Consigli:</strong></p>
          <ul style="margin: 5px 0 0 20px;">
            <li>Pianifica gli upgrade in base alle esigenze del gruppo</li>
            <li>La Cantina è essenziale per gruppi che fanno molti combattimenti</li>
            <li>Le Scuderie sono utili per missioni di viaggio</li>
            <li>La Borsa Nera diventa preziosa ai livelli alti</li>
          </ul>
        </div>
      </div>
    `;

    new Dialog({
      title: '📚 Guida Granlussi',
      content,
      buttons: {
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Chiudi'
        }
      }
    }, {
      width: 600,
      height: 700
    }).render(true);
  }

  // Gestisce comandi chat
  handleChatCommand(args, speaker) {
    const command = args[0]?.toLowerCase();
    const actor = ChatMessage.getSpeakerActor(speaker);

    switch (command) {
      case 'status':
        this.showCovoStatus(actor);
        break;
      case 'upgrade':
        if (game.user.isGM || actor?.isOwner) {
          this.openCovoManagementDialog(actor);
        } else {
          ui.notifications.warn('Non hai i permessi per gestire il covo');
        }
        break;
      case 'buy':
        this.buyFromBorsaNera(args.slice(1).join(' '), actor);
        break;
      case 'repair':
        this.repairWithFucina(args.slice(1).join(' '), actor);
        break;
      case 'brew':
        this.brewPotion(args.slice(1).join(' '), actor);
        break;
      case 'stable':
        this.manageStables(actor);
        break;
      case 'cellar':
        this.useCellarBenefits(actor);
        break;
      default:
        game.brancalonia.covoHelp();
        break;
    }
  }

  // Acquista dalla Borsa Nera
  buyFromBorsaNera(itemName, actor) {
    if (!actor) {
      ui.notifications.warn('Nessun personaggio selezionato');
      return;
    }

    ui.notifications.info('Funzione acquisto Borsa Nera in sviluppo');
    // TODO: Implementare sistema acquisto oggetti magici
  }

  // Ripara con la Fucina
  repairWithFucina(itemName, actor) {
    if (!actor) {
      ui.notifications.warn('Nessun personaggio selezionato');
      return;
    }

    ui.notifications.info('Funzione riparazione Fucina in sviluppo');
    // TODO: Implementare sistema riparazione
  }

  // Crea intruglio
  brewPotion(potionName, actor) {
    if (!actor) {
      ui.notifications.warn('Nessun personaggio selezionato');
      return;
    }

    ui.notifications.info('Funzione creazione intrugli in sviluppo');
    // TODO: Implementare sistema creazione intrugli
  }

  // Gestisci scuderie
  manageStables(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun personaggio selezionato');
      return;
    }

    const covo = this.getCovoData(actor);
    if (covo.scuderie > 0) {
      this.offerMountLoan(actor, covo.scuderie);
    } else {
      ui.notifications.warn('Le Scuderie non sono state costruite nel covo');
    }
  }

  // Usa benefici cantina
  useCellarBenefits(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun personaggio selezionato');
      return;
    }

    const covo = this.getCovoData(actor);
    if (covo.cantina > 0) {
      ui.notifications.info('I benefici della Cantina si applicano automaticamente durante il riposo lungo');
    } else {
      ui.notifications.warn('La Cantina non è stata costruita nel covo');
    }
  }
}

// Registra la classe nel window
window.CovoGranlussiSystem = CovoGranlussiSystem;

// Inizializzazione automatica
Hooks.once('init', () => {
  console.log('Brancalonia | Inizializzazione Sistema Granlussi del Covo...');
  CovoGranlussiSystem.initialize();
});

// Esporta la classe per uso come modulo
export { CovoGranlussiSystem };