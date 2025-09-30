/**
 * Sistema Haven (Rifugio) per Brancalonia
 * Completamente compatibile con dnd5e system per Foundry VTT v13
 */

class HavenSystem {
  static ID = 'brancalonia-haven';
  static NAMESPACE = 'brancalonia-bigat';

  constructor() {
    // Tipi di stanze conformi al sistema dnd5e
    this.roomTypes = {
      // Stanze Base
      dormitory: {
        name: 'Dormitorio',
        icon: 'icons/environment/settlement/bed-wooden.webp',
        cost: 100,
        maintenance: 5,
        capacity: 4,
        benefits: {
          restBonus: 1, // +1 dado vita recuperato
          description: 'Letti comodi per riposare. +1 dado vita durante riposo lungo.'
        }
      },
      kitchen: {
        name: 'Cucina',
        icon: 'icons/environment/settlement/kitchen.webp',
        cost: 150,
        maintenance: 10,
        capacity: 0,
        benefits: {
          healingBonus: 2,
          exhaustionRecovery: true,
          description: 'Pasti caldi e nutrienti. +2 hp extra per riposo, rimuove exhaustion.'
        }
      },
      armory: {
        name: 'Armeria',
        icon: 'icons/environment/settlement/armory.webp',
        cost: 200,
        maintenance: 15,
        capacity: 0,
        benefits: {
          repairCost: 0.5, // 50% sconto riparazioni
          weaponStorage: 20,
          description: 'Mantieni e ripara equipaggiamento. 50% sconto riparazioni.'
        }
      },
      laboratory: {
        name: 'Laboratorio',
        icon: 'icons/tools/laboratory/alembic-glass-ball-blue.webp',
        cost: 300,
        maintenance: 20,
        capacity: 0,
        benefits: {
          craftingBonus: 2,
          potionBrewing: true,
          description: 'Crea pozioni e oggetti alchemici. +2 a prove di crafting.'
        },
        requirements: ['int', 13] // Richiede INT 13+
      },
      library: {
        name: 'Biblioteca',
        icon: 'icons/environment/settlement/library.webp',
        cost: 400,
        maintenance: 10,
        capacity: 0,
        benefits: {
          researchBonus: 5,
          languageLearning: true,
          description: 'Ricerca e studio. +5 a Investigation per ricerche.'
        }
      },
      prison: {
        name: 'Prigione',
        icon: 'icons/environment/settlement/jail-cell.webp',
        cost: 250,
        maintenance: 15,
        capacity: 3,
        benefits: {
          interrogationBonus: 3,
          prisoner: true,
          description: 'Cattura e interroga nemici. +3 a Intimidation per interrogatori.'
        }
      },
      tavern: {
        name: 'Taverna',
        icon: 'icons/environment/settlement/tavern.webp',
        cost: 350,
        maintenance: 25,
        capacity: 0,
        benefits: {
          income: '2d6',
          information: true,
          description: 'Guadagni passivi e informazioni. 2d6 ducati/settimana.'
        }
      },
      chapel: {
        name: 'Cappella',
        icon: 'icons/environment/settlement/chapel.webp',
        cost: 300,
        maintenance: 10,
        capacity: 0,
        benefits: {
          divineProtection: true,
          resurrection: 0.8, // 20% sconto resurrezioni
          description: 'Protezione divina. 20% sconto servizi divini.'
        }
      },
      stable: {
        name: 'Stalla',
        icon: 'icons/environment/settlement/stable.webp',
        cost: 150,
        maintenance: 15,
        capacity: 6,
        benefits: {
          mountCare: true,
          travelSpeed: 1.2,
          description: 'Cura per cavalcature. +20% velocità viaggio.'
        }
      },
      workshop: {
        name: 'Officina',
        icon: 'icons/tools/smithing/anvil.webp',
        cost: 250,
        maintenance: 20,
        capacity: 0,
        benefits: {
          craftingTime: 0.5,
          toolProficiency: true,
          description: 'Creazione oggetti. Dimezza tempo di crafting.'
        }
      },
      // Stanze Speciali
      secret_passage: {
        name: 'Passaggio Segreto',
        icon: 'icons/environment/settlement/secret-door.webp',
        cost: 500,
        maintenance: 5,
        capacity: 0,
        benefits: {
          escapeRoute: true,
          stealthBonus: 5,
          description: 'Via di fuga segreta. +5 Stealth nel rifugio.'
        },
        hidden: true
      },
      vault: {
        name: 'Caveau',
        icon: 'icons/environment/settlement/vault.webp',
        cost: 600,
        maintenance: 10,
        capacity: 0,
        benefits: {
          storage: 10000, // 10000 monete
          security: 20, // CD 20 per scassinare
          description: 'Deposito sicuro. CD 20 per scassinare.'
        }
      },
      training_ground: {
        name: "Campo d'Addestramento",
        icon: 'icons/environment/settlement/training-dummy.webp',
        cost: 400,
        maintenance: 20,
        capacity: 0,
        benefits: {
          trainingTime: 0.5,
          combatBonus: 1,
          description: 'Addestramento combattimento. Dimezza tempo training.'
        }
      }
    };

    // Miglioramenti difensivi
    this.defenseUpgrades = {
      walls: {
        name: 'Mura Rinforzate',
        cost: 500,
        defenseBonus: 5,
        description: 'CA +5 per la struttura'
      },
      traps: {
        name: 'Trappole',
        cost: 300,
        damage: '2d6',
        description: '2d6 danni agli intrusi'
      },
      guards: {
        name: 'Guardie',
        cost: 50, // per settimana
        defenseBonus: 3,
        description: '+3 a Perception per avvistare intrusi'
      },
      alarm: {
        name: "Sistema d'Allarme",
        cost: 200,
        description: 'Avviso automatico di intrusioni'
      }
    };

    // Eventi casuali del rifugio
    this.randomEvents = [
      { name: 'Ispezione delle Guardie', type: 'negative', check: 'cha', dc: 13 },
      { name: 'Mercante di Passaggio', type: 'positive', reward: '2d6 * 10' },
      { name: 'Infiltrazione di Ladri', type: 'negative', check: 'per', dc: 15 },
      { name: 'Festa Spontanea', type: 'neutral', morale: 1 },
      { name: 'Riparazione Urgente', type: 'negative', cost: '1d6 * 10' },
      { name: 'Visitatore Misterioso', type: 'quest', info: true },
      { name: 'Infestazione di Ratti', type: 'negative', check: 'sur', dc: 12 },
      { name: 'Trovata Segreta', type: 'positive', reward: 'item' }
    ];

    this._setupHooks();
  }

  /**
   * Inizializzazione completa del modulo Haven
   */
  static initialize() {
    console.log('🏠 Inizializzazione Sistema Haven');

    // Registra settings
    game.settings.register(this.NAMESPACE, 'trackHavens', {
      name: 'Sistema Haven',
      hint: 'Abilita il sistema di gestione rifugi',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(this.NAMESPACE, 'autoCreateHavenScene', {
      name: 'Crea Scene Automatiche',
      hint: 'Crea automaticamente scene per nuovi rifugi',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register(this.NAMESPACE, 'weeklyMaintenance', {
      name: 'Mantenimento Automatico',
      hint: 'Deduce automaticamente mantenimento settimanale',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(this.NAMESPACE, 'havenEvents', {
      name: 'Eventi Casuali',
      hint: 'Abilita eventi casuali nei rifugi',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(this.NAMESPACE, 'havensData', {
      scope: 'world',
      config: false,
      type: Object,
      default: {}
    });

    // Crea istanza globale
    if (!game.brancalonia) game.brancalonia = {};
    const haven = new HavenSystem();
    game.brancalonia.haven = haven;

    // Registra hooks principali statici
    this._registerHooks();

    // Registra comandi chat
    this._registerChatCommands();

    // Aggiungi UI alla scheda
    this._registerSheetHooks();

    // Estendi Actor per supporto haven
    this._extendActor();

    // Crea macro automatica
    Hooks.once('ready', () => {
      this._createMacros();
    });

    return true;
  }

  /**
   * Registra hooks principali
   */
  static _registerHooks() {
    const instance = game.brancalonia?.haven;
    if (!instance) return;

    // Hook per canvas ready
    Hooks.on('canvasReady', () => {
      if (!game.settings.get(this.NAMESPACE, 'havenEvents')) return;
      if (game.user.isGM && canvas.scene?.flags[this.NAMESPACE]?.isHaven) {
        instance._checkHavenEvents(canvas.scene);
      }
    });

    // Hook per tempo di gioco
    Hooks.on('updateWorldTime', (worldTime, dt) => {
      if (!game.settings.get(this.NAMESPACE, 'weeklyMaintenance')) return;
      const weekInSeconds = 604800;
      if (dt >= weekInSeconds && game.user.isGM) {
        instance._processWeeklyMaintenance();
      }
    });

    // Hook per riposo
    Hooks.on('dnd5e.restCompleted', (actor, result) => {
      if (result.longRest) {
        const benefits = HavenSystem.applyRestBenefits(actor, 'long');
        if (benefits) {
          result.dhd = (result.dhd || 0) + benefits.extraHitDice;
          result.dhp = (result.dhp || 0) + benefits.extraHealing;
          if (benefits.removeExhaustion && actor.system.attributes?.exhaustion > 0) {
            actor.update({ 'system.attributes.exhaustion': actor.system.attributes.exhaustion - 1 });
          }
        }
      }
    });

    // Hook per creazione compagnia
    Hooks.on('createActor', (actor) => {
      if (actor.type === 'group' && actor.flags[this.NAMESPACE]?.isCompagnia) {
        instance._promptHavenCreation(actor);
      }
    });
  }

  /**
   * Registra comandi chat
   */
  static _registerChatCommands() {
    Hooks.on('chatMessage', (html, content, msg) => {
      if (!content.startsWith('/haven') && !content.startsWith('/rifugio')) return true;

      const parts = content.split(' ');
      const command = parts[0];
      const subcommand = parts[1];
      const args = parts.slice(2).join(' ');

      const instance = game.brancalonia?.haven;
      if (!instance) {
        ui.notifications.error('Sistema Haven non inizializzato!');
        return false;
      }

      switch (subcommand) {
        case 'create':
        case 'crea':
          instance._showCreateHavenDialog();
          break;

        case 'manage':
        case 'gestisci':
          instance._showManageHavenDialog();
          break;

        case 'room':
        case 'stanza':
          instance._showAddRoomDialog();
          break;

        case 'defense':
        case 'difesa':
          instance._showAddDefenseDialog();
          break;

        case 'status':
        case 'stato':
          instance._showHavenStatus();
          break;

        case 'events':
        case 'eventi':
          if (game.user.isGM) {
            instance._rollHavenEvent();
          } else {
            ui.notifications.warn('Solo il GM può generare eventi!');
          }
          break;

        case 'help':
        case 'aiuto':
        default:
          ChatMessage.create({
            content: `
              <div class="brancalonia-help">
                <h3>Comandi Haven/Rifugio</h3>
                <ul>
                  <li><code>/haven create</code> - Crea nuovo rifugio</li>
                  <li><code>/haven manage</code> - Gestisci rifugio esistente</li>
                  <li><code>/haven room</code> - Aggiungi stanza</li>
                  <li><code>/haven defense</code> - Aggiungi difesa</li>
                  <li><code>/haven status</code> - Mostra stato rifugio</li>
                  <li><code>/haven events</code> - Genera evento casuale (GM)</li>
                </ul>
              </div>
            `,
            whisper: [game.user.id]
          });
      }

      return false;
    });
  }

  /**
   * Registra hooks per le schede
   */
  static _registerSheetHooks() {
    // Aggiungi tab Haven alle compagnie
    Hooks.on('renderActorSheet', (app, html, data) => {
      if (!game.settings.get(this.NAMESPACE, 'trackHavens')) return;
      if (app.actor.type === 'group' && app.actor.flags[this.NAMESPACE]?.isCompagnia) {
        game.brancalonia?.haven?.renderHavenTab(app, html, data);
      }
    });

    // Aggiungi info haven ai personaggi
    Hooks.on('renderActorSheet', (app, html, data) => {
      if (app.actor.type === 'character') {
        const compagniaId = app.actor.flags[this.NAMESPACE]?.compagniaId;
        if (compagniaId) {
          const compagnia = game.actors.get(compagniaId);
          const havenId = compagnia?.flags[this.NAMESPACE]?.haven;
          if (havenId) {
            game.brancalonia?.haven?.renderHavenInfo(app, html, havenId);
          }
        }
      }
    });
  }

  /**
   * Estende Actor con metodi haven
   */
  static _extendActor() {
    // Metodo per ottenere il rifugio
    CONFIG.Actor.documentClass.prototype.getHaven = function () {
      if (this.type === 'group' && this.flags[HavenSystem.NAMESPACE]?.haven) {
        return game.journal.get(this.flags[HavenSystem.NAMESPACE].haven);
      }
      if (this.type === 'character') {
        const compagniaId = this.flags[HavenSystem.NAMESPACE]?.compagniaId;
        if (compagniaId) {
          const compagnia = game.actors.get(compagniaId);
          return compagnia?.getHaven();
        }
      }
      return null;
    };

    // Metodo per verificare presenza stanza
    CONFIG.Actor.documentClass.prototype.hasHavenRoom = function (roomType) {
      const haven = this.getHaven();
      if (!haven) return false;
      const havenData = haven.flags[HavenSystem.NAMESPACE]?.havenData;
      return havenData?.rooms?.find(r => r.id === roomType) !== undefined;
    };
  }

  /**
   * Crea macro per gestione haven
   */
  static async _createMacros() {
    if (!game.user.isGM) return;

    const macros = [
      {
        name: 'Gestione Rifugio',
        img: 'icons/environment/settlement/house-stone.webp',
        command: `
// Gestione Rifugio
if (game.brancalonia?.haven) {
  game.brancalonia.haven._showManageHavenDialog();
} else {
  ui.notifications.error('Sistema Haven non inizializzato!');
}
        `
      },
      {
        name: 'Crea Rifugio',
        img: 'icons/environment/settlement/construction.webp',
        command: `
// Crea Nuovo Rifugio
if (game.brancalonia?.haven) {
  game.brancalonia.haven._showCreateHavenDialog();
} else {
  ui.notifications.error('Sistema Haven non inizializzato!');
}
        `
      }
    ];

    for (const macroData of macros) {
      const existing = game.macros.find(m => m.name === macroData.name);
      if (!existing) {
        await Macro.create({
          ...macroData,
          type: 'script'
        });
        console.log(`📌 Macro "${macroData.name}" creata`);
      }
    }
  }

  /**
   * Mostra dialog creazione rifugio
   */
  _showCreateHavenDialog() {
    const content = `
      <form>
        <div class="form-group">
          <label>Nome del Rifugio:</label>
          <input type="text" name="name" placeholder="Es: La Tana del Lupo" />
        </div>
        <div class="form-group">
          <label>Locazione:</label>
          <input type="text" name="location" placeholder="Es: Boschi di Lungariva" />
        </div>
        <div class="form-group">
          <label>Stanze Iniziali:</label>
          <div style="max-height: 200px; overflow-y: auto;">
            <label><input type="checkbox" name="room" value="dormitory" checked /> Dormitorio (100 ducati)</label><br>
            <label><input type="checkbox" name="room" value="kitchen" /> Cucina (150 ducati)</label><br>
            <label><input type="checkbox" name="room" value="armory" /> Armeria (200 ducati)</label><br>
            <label><input type="checkbox" name="room" value="stable" /> Stalla (150 ducati)</label>
          </div>
        </div>
      </form>
    `;

    new Dialog({
      title: 'Crea Nuovo Rifugio',
      content,
      buttons: {
        create: {
          label: 'Crea',
          callback: async (html) => {
            const name = html.find('input[name="name"]').val();
            const location = html.find('input[name="location"]').val();
            const rooms = [];
            html.find('input[name="room"]:checked').each((i, el) => {
              rooms.push($(el).val());
            });

            if (!name) {
              ui.notifications.warn('Inserisci un nome per il rifugio!');
              return;
            }

            await this.createHaven(name, location || 'Sconosciuta', rooms);
          }
        },
        cancel: {
          label: 'Annulla'
        }
      },
      default: 'create'
    }).render(true);
  }

  /**
   * Mostra dialog gestione rifugio
   */
  _showManageHavenDialog() {
    const havens = game.journal.filter(j => j.flags[HavenSystem.NAMESPACE]?.isHaven);

    if (havens.length === 0) {
      ui.notifications.warn('Nessun rifugio trovato! Creane uno prima.');
      return;
    }

    const content = `
      <form>
        <div class="form-group">
          <label>Seleziona Rifugio:</label>
          <select name="haven">
            ${havens.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}
          </select>
        </div>
      </form>
    `;

    new Dialog({
      title: 'Gestisci Rifugio',
      content,
      buttons: {
        view: {
          label: 'Visualizza',
          callback: (html) => {
            const havenId = html.find('select[name="haven"]').val();
            const haven = game.journal.get(havenId);
            haven?.sheet.render(true);
          }
        },
        room: {
          label: 'Aggiungi Stanza',
          callback: (html) => {
            const havenId = html.find('select[name="haven"]').val();
            this._showAddRoomDialog(havenId);
          }
        },
        defense: {
          label: 'Aggiungi Difesa',
          callback: (html) => {
            const havenId = html.find('select[name="haven"]').val();
            this._showAddDefenseDialog(havenId);
          }
        },
        cancel: {
          label: 'Chiudi'
        }
      },
      default: 'view'
    }).render(true);
  }

  /**
   * Renderizza tab haven sulla scheda compagnia
   */
  renderHavenTab(app, html, data) {
    // Aggiungi tab
    const tabs = html.find('.tabs');
    if (!tabs.find('[data-tab="haven"]').length) {
      tabs.append('<a class="item" data-tab="haven">Rifugio</a>');
    }

    // Aggiungi contenuto tab
    const havenId = app.actor.flags[HavenSystem.NAMESPACE]?.haven;
    let tabContent = '';

    if (havenId) {
      const haven = game.journal.get(havenId);
      const havenData = haven?.flags[HavenSystem.NAMESPACE]?.havenData;

      if (havenData) {
        tabContent = `
          <div class="tab haven" data-tab="haven">
            <h2>${havenData.name}</h2>
            <p><strong>Locazione:</strong> ${havenData.location}</p>

            <div class="haven-stats">
              <div class="stat">
                <label>Difesa:</label> <span>${havenData.defense}</span>
              </div>
              <div class="stat">
                <label>Comfort:</label> <span>${havenData.comfort}</span>
              </div>
              <div class="stat">
                <label>Capacità:</label> <span>${havenData.capacity}</span>
              </div>
              <div class="stat">
                <label>Mantenimento:</label> <span>${havenData.maintenance} ducati/settimana</span>
              </div>
            </div>

            <h3>Stanze</h3>
            <ul>
              ${havenData.rooms.map(r => `<li>${r.name} - ${r.benefits.description}</li>`).join('')}
            </ul>

            <h3>Difese</h3>
            ${havenData.defenses.length > 0 ? `
              <ul>
                ${havenData.defenses.map(d => `<li>${d.name} - ${d.description}</li>`).join('')}
              </ul>
            ` : '<p>Nessuna difesa speciale</p>'}

            <div class="haven-actions">
              <button class="haven-add-room">Aggiungi Stanza</button>
              <button class="haven-add-defense">Aggiungi Difesa</button>
              <button class="haven-view-journal">Apri Diario</button>
            </div>
          </div>
        `;
      }
    } else {
      tabContent = `
        <div class="tab haven" data-tab="haven">
          <p>Questa compagnia non ha ancora un rifugio.</p>
          <button class="haven-create">Crea Rifugio</button>
        </div>
      `;
    }

    const tabsContent = html.find('.sheet-body');
    tabsContent.append(tabContent);

    // Event listeners
    html.find('.haven-create').click(() => this._showCreateHavenDialog());
    html.find('.haven-add-room').click(() => this._showAddRoomDialog(havenId));
    html.find('.haven-add-defense').click(() => this._showAddDefenseDialog(havenId));
    html.find('.haven-view-journal').click(() => {
      const haven = game.journal.get(havenId);
      haven?.sheet.render(true);
    });
  }

  _setupHooks() {
    // Hook per aggiungere gestione haven alle scene
    Hooks.on('canvasReady', () => {
      if (game.user.isGM) {
        const scene = canvas.scene;
        if (scene?.flags.brancalonia?.isHaven) {
          this._checkHavenEvents(scene);
        }
      }
    });

    // Hook per costi di mantenimento settimanali
    Hooks.on('updateWorldTime', (worldTime, dt) => {
      // Controlla se è passata una settimana
      const weekInSeconds = 604800;
      if (dt >= weekInSeconds) {
        this._processWeeklyMaintenance();
      }
    });
  }

  /**
   * Crea un nuovo rifugio
   */
  async createHaven(name, location = 'Sconosciuta', initialRooms = ['dormitory']) {
    // Validazione
    if (!name) {
      ui.notifications.error('Il rifugio deve avere un nome!');
      return null;
    }

    // Calcola costo iniziale
    let totalCost = 0;
    const rooms = [];

    for (const roomId of initialRooms) {
      const roomData = this.roomTypes[roomId];
      if (roomData) {
        totalCost += roomData.cost;
        rooms.push({
          id: roomId,
          ...roomData,
          constructed: new Date().toISOString()
        });
      }
    }

    // Crea dati del rifugio
    const havenData = {
      id: foundry.utils.randomID(),
      name,
      location,
      rooms,
      defenses: [],
      treasury: 0,
      maintenance: this._calculateMaintenance(rooms),
      defense: 10, // CA base
      comfort: this._calculateComfort(rooms),
      capacity: this._calculateCapacity(rooms),
      createdAt: new Date().toISOString(),
      lastMaintenance: new Date().toISOString()
    };

    // Crea Journal Entry per il rifugio
    const pages = [
      {
        name: 'Panoramica',
        type: 'text',
        text: {
          content: this._generateHavenOverview(havenData),
          format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
        }
      },
      {
        name: 'Stanze',
        type: 'text',
        text: {
          content: this._generateRoomsDescription(havenData),
          format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
        }
      },
      {
        name: 'Gestione',
        type: 'text',
        text: {
          content: this._generateManagementInfo(havenData),
          format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
        },
        ownership: {
          default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE
        }
      }
    ];

    const journal = await JournalEntry.create({
      name: `Haven: ${name}`,
      img: 'icons/environment/settlement/house-stone.webp',
      pages,
      flags: {
        brancalonia: {
          isHaven: true,
          havenData
        }
      }
    });

    // Crea scena per il rifugio (opzionale)
    if (game.settings.get('brancalonia-bigat', 'autoCreateHavenScene')) {
      await this._createHavenScene(havenData);
    }

    // Notifica creazione
    ChatMessage.create({
      content: `
        <div class="brancalonia-haven-created">
          <h2>🏠 Nuovo Rifugio Stabilito!</h2>
          <h3>${name}</h3>
          <p><strong>Locazione:</strong> ${location}</p>
          <p><strong>Stanze iniziali:</strong> ${rooms.map(r => r.name).join(', ')}</p>
          <p><strong>Costo totale:</strong> ${totalCost} ducati</p>
          <p><strong>Mantenimento settimanale:</strong> ${havenData.maintenance} ducati</p>
        </div>
      `,
      speaker: { alias: 'Sistema Haven' }
    });

    return journal;
  }

  /**
   * Aggiunge una stanza al rifugio
   */
  async addRoom(haven, roomType) {
    const havenData = haven.flags.brancalonia?.havenData;
    if (!havenData) {
      ui.notifications.error('Dati rifugio non validi!');
      return;
    }

    const roomInfo = this.roomTypes[roomType];
    if (!roomInfo) {
      ui.notifications.error('Tipo di stanza non valido!');
      return;
    }

    // Controlla requisiti
    if (roomInfo.requirements) {
      const [ability, minScore] = roomInfo.requirements;
      // Verifica che almeno un membro della compagnia soddisfi i requisiti
      const qualified = game.actors.filter(a =>
        a.hasPlayerOwner &&
        a.system.abilities[ability]?.value >= minScore
      );

      if (qualified.length === 0) {
        ui.notifications.error(`Richiede ${CONFIG.DND5E.abilities[ability].label} ${minScore}+`);
        return;
      }
    }

    // Controlla fondi
    const compagnia = this._getOwningCompagnia(haven);
    if (compagnia) {
      const treasury = compagnia.flags.brancalonia?.treasury || 0;
      if (treasury < roomInfo.cost) {
        ui.notifications.error(`Fondi insufficienti! Servono ${roomInfo.cost} ducati.`);
        return;
      }

      // Sottrai costo
      await compagnia.update({
        'flags.brancalonia.treasury': treasury - roomInfo.cost
      });
    }

    // Aggiungi stanza
    const newRoom = {
      id: roomType,
      ...roomInfo,
      constructed: new Date().toISOString()
    };

    havenData.rooms.push(newRoom);
    havenData.maintenance = this._calculateMaintenance(havenData.rooms);
    havenData.comfort = this._calculateComfort(havenData.rooms);
    havenData.capacity = this._calculateCapacity(havenData.rooms);

    await haven.setFlag('brancalonia-bigat', 'havenData', havenData);

    // Aggiorna pagine journal
    const roomsPage = haven.pages.find(p => p.name === 'Stanze');
    if (roomsPage) {
      await roomsPage.update({
        'text.content': this._generateRoomsDescription(havenData)
      });
    }

    // Notifica
    ChatMessage.create({
      content: `
        <div class="brancalonia-room-added">
          <h3>🔨 Nuova Stanza Costruita!</h3>
          <p><strong>${roomInfo.name}</strong> aggiunta a ${haven.name}</p>
          <p>${roomInfo.benefits.description}</p>
          <p>Nuovo mantenimento settimanale: ${havenData.maintenance} ducati</p>
        </div>
      `,
      speaker: { alias: 'Sistema Haven' }
    });
  }

  /**
   * Aggiunge miglioramento difensivo
   */
  async addDefense(haven, defenseType) {
    const havenData = haven.flags.brancalonia?.havenData;
    if (!havenData) return;

    const defense = this.defenseUpgrades[defenseType];
    if (!defense) {
      ui.notifications.error('Tipo di difesa non valido!');
      return;
    }

    // Controlla se già presente
    if (havenData.defenses.find(d => d.type === defenseType)) {
      ui.notifications.warn('Difesa già presente!');
      return;
    }

    // Applica costo
    const compagnia = this._getOwningCompagnia(haven);
    if (compagnia) {
      const treasury = compagnia.flags.brancalonia?.treasury || 0;
      if (treasury < defense.cost) {
        ui.notifications.error(`Fondi insufficienti! Servono ${defense.cost} ducati.`);
        return;
      }

      await compagnia.update({
        'flags.brancalonia.treasury': treasury - defense.cost
      });
    }

    // Aggiungi difesa
    havenData.defenses.push({
      type: defenseType,
      ...defense,
      installed: new Date().toISOString()
    });

    // Aggiorna CA se applicabile
    if (defense.defenseBonus) {
      havenData.defense += defense.defenseBonus;
    }

    await haven.setFlag('brancalonia-bigat', 'havenData', havenData);

    ChatMessage.create({
      content: `${defense.name} installato/a al rifugio ${haven.name}!`,
      speaker: { alias: 'Sistema Haven' }
    });
  }

  /**
   * Processa mantenimento settimanale
   */
  async _processWeeklyMaintenance() {
    const havens = game.journal.filter(j => j.flags.brancalonia?.isHaven);

    for (const haven of havens) {
      const havenData = haven.flags.brancalonia.havenData;
      if (!havenData) continue;

      const compagnia = this._getOwningCompagnia(haven);
      if (!compagnia) continue;

      const treasury = compagnia.flags.brancalonia?.treasury || 0;
      const maintenance = havenData.maintenance;

      if (treasury >= maintenance) {
        // Paga mantenimento
        await compagnia.update({
          'flags.brancalonia.treasury': treasury - maintenance
        });

        ChatMessage.create({
          content: `Mantenimento settimanale pagato per ${haven.name}: ${maintenance} ducati`,
          speaker: { alias: 'Sistema Haven' },
          whisper: ChatMessage.getWhisperRecipients('GM')
        });
      } else {
        // Conseguenze per mancato pagamento
        const degradation = Math.floor(Math.random() * 3) + 1;
        havenData.comfort = Math.max(0, havenData.comfort - degradation);

        await haven.setFlag('brancalonia-bigat', 'havenData', havenData);

        ChatMessage.create({
          content: `
            <div class="warning">
              ⚠️ Mantenimento non pagato per ${haven.name}!
              Il comfort scende di ${degradation} punti.
            </div>
          `,
          speaker: { alias: 'Sistema Haven' },
          whisper: ChatMessage.getWhisperRecipients('GM')
        });
      }

      // Aggiorna data ultimo mantenimento
      havenData.lastMaintenance = new Date().toISOString();
      await haven.setFlag('brancalonia-bigat', 'havenData', havenData);
    }
  }

  /**
   * Controlla eventi casuali del rifugio
   */
  async _checkHavenEvents(scene) {
    const roll = new Roll('1d20').evaluate({ async: false });

    if (roll.total <= 5) {
      // Evento casuale!
      const event = this.randomEvents[Math.floor(Math.random() * this.randomEvents.length)];

      ChatMessage.create({
        content: `
          <div class="brancalonia-haven-event">
            <h3>📢 Evento al Rifugio!</h3>
            <p><strong>${event.name}</strong></p>
            ${event.check ? `<p>Richiede prova di ${CONFIG.DND5E.abilities[event.check].label} CD ${event.dc}</p>` : ''}
            ${event.cost ? `<p>Costo: ${event.cost} ducati</p>` : ''}
            ${event.reward ? `<p>Possibile ricompensa!</p>` : ''}
          </div>
        `,
        speaker: { alias: 'Sistema Haven' }
      });
    }
  }

  /**
   * Calcola mantenimento totale
   */
  _calculateMaintenance(rooms) {
    return rooms.reduce((total, room) => total + (room.maintenance || 0), 0);
  }

  /**
   * Calcola comfort del rifugio
   */
  _calculateComfort(rooms) {
    let comfort = 0;
    if (rooms.find(r => r.id === 'dormitory')) comfort += 2;
    if (rooms.find(r => r.id === 'kitchen')) comfort += 3;
    if (rooms.find(r => r.id === 'tavern')) comfort += 2;
    if (rooms.find(r => r.id === 'library')) comfort += 1;
    if (rooms.find(r => r.id === 'chapel')) comfort += 1;
    return comfort;
  }

  /**
   * Calcola capacità totale
   */
  _calculateCapacity(rooms) {
    return rooms.reduce((total, room) => total + (room.capacity || 0), 0);
  }

  /**
   * Trova la compagnia proprietaria
   */
  _getOwningCompagnia(haven) {
    // Cerca nelle compagnie quale possiede questo rifugio
    return game.actors.find(a =>
      a.type === 'group' &&
      a.flags.brancalonia?.isCompagnia &&
      a.flags.brancalonia?.haven === haven.id
    );
  }

  /**
   * Genera HTML panoramica rifugio
   */
  _generateHavenOverview(havenData) {
    return `
      <div class="brancalonia-haven-overview">
        <h2>${havenData.name}</h2>
        <p><strong>Locazione:</strong> ${havenData.location}</p>

        <div class="haven-stats">
          <div class="stat">
            <label>Difesa (CA):</label>
            <span>${havenData.defense}</span>
          </div>
          <div class="stat">
            <label>Comfort:</label>
            <span>${havenData.comfort}</span>
          </div>
          <div class="stat">
            <label>Capacità:</label>
            <span>${havenData.capacity} persone</span>
          </div>
          <div class="stat">
            <label>Mantenimento:</label>
            <span>${havenData.maintenance} ducati/settimana</span>
          </div>
        </div>

        <h3>Difese</h3>
        ${havenData.defenses.length > 0 ? `
          <ul>
            ${havenData.defenses.map(d => `<li>${d.name}: ${d.description}</li>`).join('')}
          </ul>
        ` : '<p>Nessuna difesa speciale installata</p>'}
      </div>
    `;
  }

  /**
   * Genera HTML descrizione stanze
   */
  _generateRoomsDescription(havenData) {
    return `
      <div class="brancalonia-haven-rooms">
        <h2>Stanze del Rifugio</h2>
        ${havenData.rooms.map(room => `
          <div class="room-entry">
            <h3>${room.name}</h3>
            <p>${room.benefits.description}</p>
            <p class="room-meta">
              <em>Mantenimento: ${room.maintenance} ducati/settimana</em>
              ${room.capacity > 0 ? `<br><em>Capacità: ${room.capacity} persone</em>` : ''}
            </p>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Genera informazioni di gestione
   */
  _generateManagementInfo(havenData) {
    const nextMaintenance = new Date(havenData.lastMaintenance);
    nextMaintenance.setDate(nextMaintenance.getDate() + 7);

    return `
      <div class="brancalonia-haven-management">
        <h2>Gestione del Rifugio</h2>

        <h3>Finanze</h3>
        <p><strong>Costo Mantenimento Settimanale:</strong> ${havenData.maintenance} ducati</p>
        <p><strong>Prossimo Pagamento:</strong> ${nextMaintenance.toLocaleDateString()}</p>

        <h3>Stanze Disponibili per Costruzione</h3>
        <ul>
          ${Object.entries(this.roomTypes)
    .filter(([id, room]) => !havenData.rooms.find(r => r.id === id) && !room.hidden)
    .map(([id, room]) => `
              <li>
                <strong>${room.name}</strong> (${room.cost} ducati)
                <br>${room.benefits.description}
              </li>
            `).join('')}
        </ul>

        <h3>Miglioramenti Difensivi Disponibili</h3>
        <ul>
          ${Object.entries(this.defenseUpgrades)
    .filter(([id, def]) => !havenData.defenses.find(d => d.type === id))
    .map(([id, def]) => `
              <li>
                <strong>${def.name}</strong> (${def.cost} ducati)
                <br>${def.description}
              </li>
            `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Crea scena per il rifugio
   */
  async _createHavenScene(havenData) {
    const sceneData = {
      name: `Haven: ${havenData.name}`,
      navigation: true,
      navName: havenData.name,
      img: 'modules/brancalonia-bigat/assets/maps/map_brancalonia.webp',
      flags: {
        brancalonia: {
          isHaven: true,
          havenId: havenData.id
        }
      }
    };

    return await Scene.create(sceneData);
  }

  /**
   * Applica benefici del rifugio durante riposo
   */
  static applyRestBenefits(actor, restType) {
    // Trova il rifugio della compagnia
    const compagniaId = actor.flags.brancalonia?.compagniaId;
    if (!compagniaId) return;

    const compagnia = game.actors.get(compagniaId);
    const havenId = compagnia?.flags.brancalonia?.haven;
    if (!havenId) return;

    const haven = game.journal.get(havenId);
    const havenData = haven?.flags.brancalonia?.havenData;
    if (!havenData) return;

    const benefits = {
      extraHitDice: 0,
      extraHealing: 0,
      removeExhaustion: false
    };

    // Applica benefici delle stanze
    if (havenData.rooms.find(r => r.id === 'dormitory')) {
      benefits.extraHitDice += 1;
    }
    if (havenData.rooms.find(r => r.id === 'kitchen')) {
      benefits.extraHealing += 2;
      benefits.removeExhaustion = true;
    }
    if (havenData.rooms.find(r => r.id === 'chapel')) {
      benefits.extraHealing += 1;
    }

    return benefits;
  }
}

// Registra globalmente
window.HavenSystem = HavenSystem;

// Auto-inizializzazione
Hooks.once('init', () => {
  HavenSystem.initialize();
});