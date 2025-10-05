/* ===================================== */
/* BRANCALONIA REST SYSTEM */
/* Sistema di Riposo della Canaglia */
/* ===================================== */

class BrancaloniaRestSystem {
  constructor() {
    this.name = 'Sistema di Riposo della Canaglia';
    this.description = 'Sistema di riposo modificato per Brancalonia';
    this.initialized = false;

    // Durate dei riposi in Brancalonia
    this.restDurations = {
      shortRest: '8 ore',
      longRest: '7 giorni (una settimana)'
    };

    console.log('Brancalonia | Sistema di Riposo della Canaglia inizializzato');
  }

  static initialize() {
    try {
      console.log('Brancalonia | Inizializzazione Sistema di Riposo della Canaglia...');

      // Registra le settings
      BrancaloniaRestSystem.registerSettings();

      // Registra tutti gli hooks
      BrancaloniaRestSystem.registerHooks();

      // Registra comandi chat
      BrancaloniaRestSystem.registerChatCommands();

      // Crea istanza globale
      const instance = new BrancaloniaRestSystem();
      game.brancalonia = game.brancalonia || {};
      game.brancalonia.restSystem = instance;

      console.log('Brancalonia | Sistema di Riposo della Canaglia inizializzato con successo');
      return instance;
    } catch (error) {
      console.error('Brancalonia | Errore inizializzazione Sistema di Riposo della Canaglia:', error);
      if (ui?.notifications) {
        ui.notifications.error(`Errore inizializzazione Sistema di Riposo della Canaglia: ${error.message}`);
      }
    }
  }

  static registerSettings() {
    game.settings.register('brancalonia-bigat', 'useCanagliasRest', {
      name: 'Usa Riposo della Canaglia',
      hint: 'Attiva il sistema di riposo di Brancalonia (8 ore breve, 7 giorni lungo)',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
      onChange: value => {
        console.log('Brancalonia | Riposo della Canaglia:', value ? 'abilitato' : 'disabilitato');
        ui.notifications.info(`Sistema Riposo della Canaglia ${value ? 'abilitato' : 'disabilitato'}`);
      }
    });

    game.settings.register('brancalonia-bigat', 'enforceRestLocation', {
      name: 'Richiedi Luogo Sicuro',
      hint: 'I riposi lunghi possono essere fatti solo in luoghi sicuri (Covo, Bettole)',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'allowInterruptedRest', {
      name: 'Consenti Riposi Interrotti',
      hint: 'I riposi in luoghi non sicuri possono essere interrotti',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'restBonusRecovery', {
      name: 'Recupero Bonus Dadi Vita',
      hint: 'Dadi Vita bonus recuperati durante riposo breve prolungato',
      scope: 'world',
      config: true,
      type: Number,
      range: { min: 0, max: 10, step: 1 },
      default: 1
    });

    console.log('Brancalonia | Settings Sistema di Riposo registrate');
  }

  static registerHooks() {
    // Hook principale di inizializzazione
    Hooks.on('ready', async () => {
      const instance = game.brancalonia?.restSystem;
      if (instance && !instance.initialized) {
        await instance.initializeRestSystem();
      }
    });

    // Hooks per gestione riposi D&D 5e
    Hooks.on('dnd5e.restStarted', BrancaloniaRestSystem._onRestStarted);
    Hooks.on('dnd5e.restCompleted', BrancaloniaRestSystem._onRestCompleted);
    Hooks.on('dnd5e.preRestCompleted', BrancaloniaRestSystem._onPreRestCompleted);

    // Fixed: Use SheetCoordinator
    const SheetCoordinator = window.SheetCoordinator || game.brancalonia?.SheetCoordinator;
    
    if (SheetCoordinator) {
      SheetCoordinator.registerModule('RestSystem', BrancaloniaRestSystem._onRenderActorSheet, {
        priority: 70,
        types: ['character']
      });
    } else {
      Hooks.on('renderActorSheet', BrancaloniaRestSystem._onRenderActorSheet);
    }
    Hooks.on('renderRestDialog', BrancaloniaRestSystem._onRenderRestDialog);

    // Hook per controllo location
    Hooks.on('canvasReady', BrancaloniaRestSystem._onCanvasReady);

    console.log('Brancalonia | Hooks Sistema di Riposo registrati');
  }

  static registerChatCommands() {
    // Comando per gestire riposi
    Hooks.on('chatCommandsReady', (commands) => {
      commands.register({
        name: '/rest',
        description: 'Gestisce il sistema di riposo della canaglia',
        icon: '<i class="fas fa-bed"></i>',
        callback: BrancaloniaRestSystem._handleChatCommand
      });
    });

    // Sistema di help per comandi
    game.brancalonia = game.brancalonia || {};
    game.brancalonia.restHelp = () => {
      const helpContent = `
        <div class="brancalonia-help">
          <h3>Comandi Sistema di Riposo della Canaglia</h3>
          <ul>
            <li><strong>/rest short</strong> - Inizia riposo breve (8 ore)</li>
            <li><strong>/rest long</strong> - Inizia riposo lungo (7 giorni)</li>
            <li><strong>/rest sbraco</strong> - Mostra opzioni Sbraco</li>
            <li><strong>/rest location [nome]</strong> - Imposta location attuale</li>
            <li><strong>/rest check</strong> - Controlla stato riposo</li>
            <li><strong>/rest interrupt</strong> - Interrompe riposo corrente</li>
          </ul>
          <h4>Tipi di Sbraco:</h4>
          <ul>
            <li><strong>Riposo</strong> - Recupero completo</li>
            <li><strong>Imbosco</strong> - Basso profilo, -3 Rischi Mestiere</li>
            <li><strong>Bagordi</strong> - Dilapidare denaro</li>
          </ul>
        </div>`;

      ChatMessage.create({
        content: helpContent,
        whisper: [game.user.id]
      });
    };

    console.log('Brancalonia | Comandi chat Sistema di Riposo registrati');
  }

  static registerMacros() {
    // Macro per riposo breve
    if (!game?.macros?.find(m => m.name === 'Riposo Breve Canaglia')) {
      Macro.create({
        name: 'Riposo Breve Canaglia',
        type: 'script',
        img: 'icons/sundries/survival/bedroll-leather-brown.webp',
        command: `
          const actor = game.user.character || canvas.tokens.controlled[0]?.actor;
          if (!actor) {
            ui.notifications.warn('Seleziona un personaggio o token');
            return;
          }
          game.brancalonia?.restSystem?.startShortRest(actor);
        `
      });
    }

    // Macro per riposo lungo (Sbraco)
    if (!game?.macros?.find(m => m.name === 'Sbraco della Canaglia')) {
      Macro.create({
        name: 'Sbraco della Canaglia',
        type: 'script',
        img: 'icons/environment/settlement/tavern.webp',
        command: `
          const actor = game.user.character || canvas.tokens.controlled[0]?.actor;
          if (!actor) {
            ui.notifications.warn('Seleziona un personaggio o token');
            return;
          }
          game.brancalonia?.restSystem?.startLongRest(actor);
        `
      });
    }

    console.log('Brancalonia | Macro Sistema di Riposo registrate');
  }

  // Hook handlers statici
  static _onRestStarted(actor, config) {
    const instance = game.brancalonia?.restSystem;
    if (!instance?.initialized) return;

    try {
      if (game.settings.get('brancalonia-bigat', 'useCanagliasRest')) {
        instance.handleBrancaloniaRest(actor, config);
      }
    } catch (error) {
      console.error('Brancalonia | Errore restStarted:', error);
    }
  }

  static _onRestCompleted(actor, config) {
    const instance = game.brancalonia?.restSystem;
    if (!instance?.initialized) return;

    try {
      if (game.settings.get('brancalonia-bigat', 'useCanagliasRest')) {
        instance.applyBrancaloniaRestEffects(actor, config);
      }
    } catch (error) {
      console.error('Brancalonia | Errore restCompleted:', error);
    }
  }

  static _onPreRestCompleted(actor, config) {
    const instance = game.brancalonia?.restSystem;
    if (!instance?.initialized) return;

    try {
      instance.preRestCompleted(actor, config);
    } catch (error) {
      console.error('Brancalonia | Errore preRestCompleted:', error);
    }
  }

  static _onRenderActorSheet(sheet, html, data) {
    const instance = game.brancalonia?.restSystem;
    if (!instance?.initialized) return;

    try {
      instance.enhanceActorSheet(sheet, html, data);
    } catch (error) {
      console.error('Brancalonia | Errore renderActorSheet:', error);
    }
  }

  static _onRenderRestDialog(dialog, html, data) {
    const instance = game.brancalonia?.restSystem;
    if (!instance?.initialized) return;

    try {
      instance.enhanceRestDialog(dialog, html, data);
    } catch (error) {
      console.error('Brancalonia | Errore renderRestDialog:', error);
    }
  }

  static _onCanvasReady() {
    const instance = game.brancalonia?.restSystem;
    if (!instance?.initialized) return;

    try {
      instance.updateLocationContext();
    } catch (error) {
      console.error('Brancalonia | Errore canvasReady:', error);
    }
  }

  static _handleChatCommand(args, speaker) {
    const instance = game.brancalonia?.restSystem;
    if (!instance?.initialized) return;

    try {
      instance.handleChatCommand(args, speaker);
    } catch (error) {
      console.error('Brancalonia | Errore chat command:', error);
      ui.notifications.error('Errore comando sistema di riposo');
    }
  }

  // Inizializza il sistema (chiamato dopo ready)
  async initializeRestSystem() {
    if (this.initialized) return;

    try {
      // Inizializza configurazioni
      await this.loadRestConfigurations();

      this.initialized = true;
      console.log('Brancalonia | Sistema di Riposo della Canaglia configurato');
      ui.notifications.info('Sistema di Riposo della Canaglia attivo');
    } catch (error) {
      console.error('Brancalonia | Errore inizializzazione sistema riposo:', error);
      ui.notifications.error('Errore inizializzazione Sistema di Riposo della Canaglia');
    }
  }

  // Carica configurazioni riposo
  async loadRestConfigurations() {
    this.config = {
      shortRestDuration: 8, // ore
      longRestDuration: 7, // giorni
      safeLocations: ['covo', 'bettola_amica', 'taverna_sicura', 'casa', 'tempio'],
      dangerousLocations: ['dungeon', 'wilderness', 'strada', 'sottobosco'],
      interruptionChance: {
        safe: 0.0,
        neutral: 0.3,
        dangerous: 0.7
      },
      sbracoOptions: {
        riposo: {
          name: 'Riposare le stanche membra',
          description: 'Ottieni tutti gli effetti di un riposo lungo normale',
          effects: ['full_recovery', 'remove_exhaustion', 'recover_spells']
        },
        imbosco: {
          name: 'Imboscarsi',
          description: 'Tieni un basso profilo, -3 ai Rischi del Mestiere',
          effects: ['partial_recovery', 'reduce_exhaustion', 'stealth_bonus']
        },
        bagordi: {
          name: 'Darsi ai Bagordi',
          description: 'Dilapida denaro in bagordi (tira sulla tabella)',
          effects: ['full_recovery', 'bagordi_table', 'spend_money']
        }
      }
    };

    console.log('Brancalonia | Configurazioni riposo caricate');
  }

  // Inizia riposo breve
  async startShortRest(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun personaggio selezionato');
      return;
    }

    const location = await this.checkSafeLocation(actor);
    const config = {
      restType: 'short',
      duration: this.config.shortRestDuration,
      location
    };

    await this.handleBrancaloniaRest(actor, config);
  }

  // Inizia riposo lungo (Sbraco)
  async startLongRest(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun personaggio selezionato');
      return;
    }

    const sbracoOption = await this.showLongRestDialog(actor);
    if (!sbracoOption) return;

    const config = {
      restType: 'long',
      duration: this.config.longRestDuration,
      sbracoOption: sbracoOption.option
    };

    await this.handleBrancaloniaRest(actor, config);
  }

  // Gestisce l'inizio del riposo in stile Brancalonia
  async handleBrancaloniaRest(actor, config) {
    const restType = config.restType;

    if (restType === 'short') {
      ui.notifications.info(`${actor.name} inizia un riposo breve di 8 ore`);

      // Verifica se è in un luogo sicuro
      const locationSafety = await this.evaluateLocationSafety(actor);
      if (locationSafety !== 'safe') {
        ui.notifications.warn('Riposo in luogo non sicuro - possibili interruzioni!');

        if (game.settings.get('brancalonia-bigat', 'allowInterruptedRest')) {
          const interruptChance = this.config.interruptionChance[locationSafety] || 0.3;
          config.interrupted = Math.random() < interruptChance;

          if (config.interrupted) {
            await this.handleRestInterruption(actor, config);
            return;
          }
        }
      }

      // Avvia il riposo breve normale
      await this.processShortRest(actor, config);
    } else if (restType === 'long') {
      ui.notifications.info(`${actor.name} inizia un riposo lungo di una settimana (Sbraco)`);

      // Durante lo Sbraco, gestisci l'opzione scelta
      await this.processSbracoOption(actor, config);
    }
  }

  // Mostra il dialog per il riposo lungo (Sbraco)
  async showLongRestDialog(actor) {
    return new Promise((resolve) => {
      const content = `
        <div class="brancalonia-rest" style="padding: 15px;">
          <h2 style="color: #8B4513; margin-bottom: 15px;">🏕️ Riposo della Canaglia - Sbraco</h2>
          <p style="margin-bottom: 20px; font-style: italic;">Una settimana di riposo tra un lavoretto e l'altro.</p>
          <p style="margin-bottom: 20px; font-weight: bold;">Come vuoi trascorrere questa settimana di Sbraco?</p>

          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; cursor: pointer; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
              <input type="radio" name="sbraco" value="riposo" checked style="margin-right: 10px;">
              <strong>🛏️ Riposare le stanche membra</strong><br>
              <i style="color: #666; margin-left: 20px;">Ottieni tutti gli effetti di un riposo lungo normale</i>
            </label>
          </div>

          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; cursor: pointer; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
              <input type="radio" name="sbraco" value="imbosco" style="margin-right: 10px;">
              <strong>🕵️ Imboscarsi</strong><br>
              <i style="color: #666; margin-left: 20px;">Tieni un basso profilo, -3 ai Rischi del Mestiere</i>
            </label>
          </div>

          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; cursor: pointer; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
              <input type="radio" name="sbraco" value="bagordi" style="margin-right: 10px;">
              <strong>🍻 Darsi ai Bagordi</strong><br>
              <i style="color: #666; margin-left: 20px;">Dilapida denaro in bagordi (tira sulla tabella)</i>
            </label>
          </div>
        </div>`;

      new foundry.appv1.sheets.Dialog({
        title: 'Riposo della Canaglia',
        content,
        buttons: {
          confirm: {
            icon: '<i class="fas fa-check"></i>',
            label: 'Conferma',
            callback: (html) => {
              const option = html.find('input[name="sbraco"]:checked').val();
              resolve({ option });
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Annulla',
            callback: () => resolve(null)
          }
        },
        default: 'confirm',
        render: (html) => {
          // Aggiungi eventi per evidenziare le opzioni
          html.find('label').hover(
            function () { $(this).css('background-color', '#f0f0f0'); },
            function () { $(this).css('background-color', ''); }
          );
        }
      }).render(true);
    });
  }

  // Processa riposo breve
  async processShortRest(actor, config) {
    try {
      // Recupero standard dei Dadi Vita
      const bonusHD = game.settings.get('brancalonia-bigat', 'restBonusRecovery');

      // Messaggio di completamento
      const message = `
        <div class="brancalonia-rest-complete" style="border: 2px solid #228B22; padding: 10px; border-radius: 5px;">
          <h3 style="color: #228B22; margin: 0 0 10px 0;">🛏️ Riposo Breve Completato</h3>
          <p style="margin: 0;"><strong>${actor.name}</strong> ha completato un riposo breve di 8 ore</p>
          ${bonusHD > 0 ? `<p style="margin: 5px 0 0 0; font-style: italic;">Riposo prolungato: +${bonusHD} Dadi Vita bonus</p>` : ''}
        </div>`;

      await ChatMessage.create({
        content: message,
        speaker: ChatMessage.getSpeaker({ actor }),
        flags: {
          'brancalonia-bigat': {
            restType: 'short',
            duration: 8,
            completed: true
          }
        }
      });

      console.log(`Brancalonia | Riposo breve completato per: ${actor.name}`);
    } catch (error) {
      console.error('Brancalonia | Errore processo riposo breve:', error);
      ui.notifications.error('Errore durante il riposo breve');
    }
  }

  // Processa opzioni Sbraco
  async processSbracoOption(actor, config) {
    const option = config.sbracoOption;
    const sbracoConfig = this.config.sbracoOptions[option];

    if (!sbracoConfig) {
      ui.notifications.error('Opzione Sbraco non valida');
      return;
    }

    switch (option) {
      case 'riposo':
        await this.handleRestOption(actor);
        break;
      case 'imbosco':
        await this.handleImboscoOption(actor);
        break;
      case 'bagordi':
        await this.handleBagordiOption(actor);
        break;
    }
  }

  // Applica gli effetti del riposo in stile Brancalonia
  async applyBrancaloniaRestEffects(actor, config) {
    try {
      // Applica benefici del Covo se disponibile
      if (game.brancalonia?.covo?.applyRestBenefits) {
        const covoRestBenefits = game.brancalonia.covo.applyRestBenefits(actor, config.restType);
        
        if (covoRestBenefits) {
          // Applica i benefici del Covo
          const updates = {};
          
          // Guarigione extra
          if (covoRestBenefits.extraHealing > 0) {
            const currentHP = actor.system.attributes.hp.value;
            const maxHP = actor.system.attributes.hp.max;
            updates['system.attributes.hp.value'] = Math.min(currentHP + covoRestBenefits.extraHealing, maxHP);
          }
          
          // Rimuove esaurimento se applicabile
          if (covoRestBenefits.removeExhaustion && actor.system.attributes.exhaustion > 0) {
            updates['system.attributes.exhaustion'] = Math.max(0, actor.system.attributes.exhaustion - 1);
          }
          
          if (Object.keys(updates).length > 0) {
            await actor.update(updates);
            console.log(`Brancalonia | Benefici Covo applicati per: ${actor.name}`);
          }
          
          // Nota: extraHitDice viene gestito automaticamente dal sistema di riposo D&D 5e
        }
      }
      
      // Gli altri effetti sono già applicati nei metodi specifici
      console.log(`Brancalonia | Effetti riposo applicati per: ${actor.name}`);
    } catch (error) {
      console.error('Brancalonia | Errore applicazione effetti riposo Covo:', error);
    }
  }

  // Pre-processing riposo
  preRestCompleted(actor, config) {
    // Salva stato prima del riposo per eventuali rollback
    actor.setFlag('brancalonia-bigat', 'preRestState', {
      hp: actor.system.attributes.hp.value,
      exhaustion: actor.system.attributes.exhaustion,
      timestamp: Date.now()
    });
  }

  // Opzione: Riposare le stanche membra
  async handleRestOption(actor) {
    try {
      ui.notifications.info(`${actor.name} ha riposato per una settimana intera`);

      // Recupero completo
      const updates = {
        'system.attributes.hp.value': actor.system.attributes.hp.max
      };

      // Rimuove tutti i livelli di indebolimento
      if (actor.system.attributes.exhaustion > 0) {
        updates['system.attributes.exhaustion'] = 0;
        ui.notifications.info('Tutti i livelli di indebolimento rimossi');
      }

      await actor.update(updates);

      // Recupera slot incantesimi se applicabile
      if (actor.system.spells) {
        await this.recoverSpellSlots(actor);
      }

      // Rimuovi flag temporanei negativi
      await this.clearTemporaryFlags(actor);

      const message = `
        <div class="brancalonia-rest-riposo" style="border: 2px solid #228B22; padding: 10px; border-radius: 5px;">
          <h3 style="color: #228B22; margin: 0 0 10px 0;">🛏️ Riposo Completo</h3>
          <p style="margin: 0;"><strong>${actor.name}</strong> ha riposato per una settimana intera</p>
          <ul style="margin: 10px 0 0 20px;">
            <li>Punti Ferita completamente recuperati</li>
            <li>Tutti i livelli di indebolimento rimossi</li>
            <li>Slot incantesimi recuperati</li>
            <li>Effetti temporanei rimossi</li>
          </ul>
        </div>`;

      await ChatMessage.create({
        content: message,
        speaker: ChatMessage.getSpeaker({ actor }),
        flags: {
          'brancalonia-bigat': {
            sbracoType: 'riposo',
            completed: true
          }
        }
      });
    } catch (error) {
      console.error('Brancalonia | Errore riposo completo:', error);
      ui.notifications.error('Errore durante il riposo completo');
    }
  }

  // Opzione: Imboscarsi
  async handleImboscoOption(actor) {
    try {
      ui.notifications.info(`${actor.name} si è imboscato per una settimana`);

      // Applica il modificatore ai Rischi del Mestiere
      await actor.setFlag('brancalonia-bigat', 'imboscoModifier', {
        value: -3,
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 giorni
      });

      // Recupero parziale (75% del normale)
      const updates = {
        'system.attributes.hp.value': Math.min(
          actor.system.attributes.hp.value + Math.floor(actor.system.attributes.hp.max * 0.75),
          actor.system.attributes.hp.max
        )
      };

      // Rimuove 1-2 livelli di indebolimento
      if (actor.system.attributes.exhaustion > 0) {
        const reduction = Math.min(2, actor.system.attributes.exhaustion);
        updates['system.attributes.exhaustion'] = actor.system.attributes.exhaustion - reduction;
      }

      await actor.update(updates);

      // Recupero parziale slot incantesimi
      if (actor.system.spells) {
        await this.recoverSpellSlots(actor, 0.5); // 50% degli slot
      }

      const message = `
        <div class="brancalonia-rest-imbosco" style="border: 2px solid #4682B4; padding: 10px; border-radius: 5px;">
          <h3 style="color: #4682B4; margin: 0 0 10px 0;">🕵️ Imboscato!</h3>
          <p style="margin: 0;"><strong>${actor.name}</strong> ha tenuto un basso profilo per una settimana</p>
          <ul style="margin: 10px 0 0 20px;">
            <li>Recupero parziale (75% PF)</li>
            <li>Riduzione indebolimento</li>
            <li>Slot incantesimi recuperati al 50%</li>
            <li><strong>Effetto:</strong> -3 al prossimo tiro Rischi del Mestiere del gruppo</li>
          </ul>
        </div>`;

      await ChatMessage.create({
        content: message,
        speaker: ChatMessage.getSpeaker({ actor }),
        flags: {
          'brancalonia-bigat': {
            sbracoType: 'imbosco',
            modifier: -3,
            completed: true
          }
        }
      });
    } catch (error) {
      console.error('Brancalonia | Errore imbosco:', error);
      ui.notifications.error('Errore durante l\'imbosco');
    }
  }

  // Opzione: Darsi ai Bagordi
  async handleBagordiOption(actor) {
    try {
      // Integrazione con il sistema bagordi
      if (game.brancalonia?.tavernEntertainment?.rollBagordi) {
        await game.brancalonia.tavernEntertainment.rollBagordi(actor);
      } else {
        // Fallback: sistema semplificato
        await this.simpleBagordiSystem(actor);
      }

      // Recupero completo come riposo normale
      await this.handleRestOption(actor);
    } catch (error) {
      console.error('Brancalonia | Errore bagordi:', error);
      ui.notifications.error('Errore durante i bagordi');
      // Fallback al riposo normale
      await this.handleRestOption(actor);
    }
  }

  // Sistema bagordi semplificato
  async simpleBagordiSystem(actor) {
    const roll = new Roll('1d6');
    await roll.evaluate();

    const results = {
      1: { effect: 'Perdi 2d6 mo', cost: '2d6' },
      2: { effect: 'Perdi 1d6 mo', cost: '1d6' },
      3: { effect: 'Nessun effetto', cost: '0' },
      4: { effect: 'Nessun effetto', cost: '0' },
      5: { effect: 'Fai nuovi contatti', cost: '1d4', bonus: 'contatti' },
      6: { effect: 'Informazioni utili', cost: '1d4', bonus: 'informazioni' }
    };

    const result = results[roll.total];

    if (result.cost !== '0') {
      const costRoll = new Roll(result.cost);
      await costRoll.evaluate();

      const message = `
        <div class="brancalonia-bagordi">
          <h3>🍻 Bagordi!</h3>
          <p>${result.effect}</p>
          <p>Costo: ${costRoll.total} mo</p>
        </div>`;

      await ChatMessage.create({
        content: message,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }

  // Verifica luogo sicuro
  async checkSafeLocation(actor) {
    const location = actor.getFlag('brancalonia-bigat', 'currentLocation');
    return this.config.safeLocations.includes(location);
  }

  // Valuta sicurezza location
  async evaluateLocationSafety(actor) {
    const location = actor.getFlag('brancalonia-bigat', 'currentLocation');

    if (this.config.safeLocations.includes(location)) {
      return 'safe';
    } else if (this.config.dangerousLocations.includes(location)) {
      return 'dangerous';
    } else {
      return 'neutral';
    }
  }

  // Gestisce interruzione riposo
  async handleRestInterruption(actor, config) {
    const message = `
      <div class="brancalonia-rest-interrupted" style="border: 2px solid #FF4500; padding: 10px; border-radius: 5px;">
        <h3 style="color: #FF4500; margin: 0 0 10px 0;">⚠️ Riposo Interrotto!</h3>
        <p style="margin: 0;"><strong>${actor.name}</strong> è stato disturbato durante il riposo</p>
        <p style="margin: 5px 0 0 0; font-style: italic;">Il riposo non ha avuto effetto.</p>
      </div>`;

    await ChatMessage.create({
      content: message,
      speaker: ChatMessage.getSpeaker({ actor }),
      flags: {
        'brancalonia-bigat': {
          restInterrupted: true,
          location: config.location
        }
      }
    });

    ui.notifications.warn(`Riposo di ${actor.name} interrotto!`);
  }

  // Recupera slot incantesimi
  async recoverSpellSlots(actor, percentage = 1.0) {
    const spells = actor.system.spells;
    const updates = {};

    for (const [level, slot] of Object.entries(spells)) {
      if (slot.value !== undefined && slot.max > 0) {
        const recoveredSlots = Math.floor(slot.max * percentage);
        updates[`system.spells.${level}.value`] = Math.min(slot.value + recoveredSlots, slot.max);
      }
    }

    if (Object.keys(updates).length > 0) {
      await actor.update(updates);
      const percent = Math.round(percentage * 100);
      ui.notifications.info(`Slot incantesimi recuperati al ${percent}%`);
    }
  }

  // Rimuove flag temporanei
  async clearTemporaryFlags(actor) {
    const flagsToRemove = [
      'brancalonia-bigat.imboscoModifier',
      'brancalonia-bigat.temporaryPenalty',
      'brancalonia-bigat.shortTermCondition'
    ];

    for (const flag of flagsToRemove) {
      if (actor.getFlag(flag.split('.')[0], flag.split('.')[1])) {
        await actor.unsetFlag(flag.split('.')[0], flag.split('.')[1]);
      }
    }
  }

  // Gestisce comandi chat
  handleChatCommand(args, speaker) {
    const command = args[0]?.toLowerCase();
    const actor = ChatMessage.getSpeakerActor(speaker);

    switch (command) {
      case 'short':
        this.startShortRest(actor);
        break;
      case 'long':
        this.startLongRest(actor);
        break;
      case 'sbraco':
        this.showSbracoOptions(actor);
        break;
      case 'location':
        this.setActorLocation(args.slice(1).join(' '), actor);
        break;
      case 'check':
        this.checkRestStatus(actor);
        break;
      case 'interrupt':
        this.interruptCurrentRest(actor);
        break;
      default:
        game.brancalonia.restHelp();
        break;
    }
  }

  // Mostra opzioni Sbraco
  async showSbracoOptions(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun attore selezionato');
      return;
    }

    const content = `
      <div class="brancalonia-sbraco-info">
        <h3>Opzioni Sbraco Disponibili</h3>
        <ul>
          <li><strong>Riposo:</strong> ${this.config.sbracoOptions.riposo.description}</li>
          <li><strong>Imbosco:</strong> ${this.config.sbracoOptions.imbosco.description}</li>
          <li><strong>Bagordi:</strong> ${this.config.sbracoOptions.bagordi.description}</li>
        </ul>
      </div>`;

    ChatMessage.create({
      content,
      whisper: [game.user.id]
    });
  }

  // Imposta location attore
  async setActorLocation(locationName, actor) {
    if (!actor) {
      ui.notifications.warn('Nessun attore selezionato');
      return;
    }

    if (!locationName) {
      ui.notifications.warn('Specifica il nome della location');
      return;
    }

    await actor.setFlag('brancalonia-bigat', 'currentLocation', locationName.toLowerCase());
    ui.notifications.info(`Location di ${actor.name} impostata a: ${locationName}`);
  }

  // Controlla stato riposo
  checkRestStatus(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun attore selezionato');
      return;
    }

    const location = actor.getFlag('brancalonia-bigat', 'currentLocation') || 'sconosciuta';
    const safety = this.evaluateLocationSafety(actor);
    const imboscoMod = actor.getFlag('brancalonia-bigat', 'imboscoModifier');

    let content = `
      <div class="brancalonia-rest-status">
        <h3>Stato Riposo - ${actor.name}</h3>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Sicurezza:</strong> ${safety}</p>`;

    if (imboscoMod) {
      content += `<p><strong>Modificatore Imbosco:</strong> ${imboscoMod.value}</p>`;
    }

    content += `</div>`;

    ChatMessage.create({
      content,
      whisper: [game.user.id]
    });
  }

  // Interrompe riposo corrente
  async interruptCurrentRest(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun attore selezionato');
      return;
    }

    // Implementa logica per interrompere riposo
    ui.notifications.info(`Riposo di ${actor.name} interrotto manualmente`);

    const message = `
      <div class="brancalonia-rest-interrupted">
        <h3>⚠️ Riposo Interrotto</h3>
        <p><strong>${actor.name}</strong> ha interrotto il riposo</p>
      </div>`;

    ChatMessage.create({
      content: message,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  // Aggiorna contesto location
  updateLocationContext() {
    // Aggiorna automaticamente le location basandosi sulla scena corrente
    if (!game.scenes.current) return;

    const sceneName = game.scenes.current.name.toLowerCase();

    // Mappa automatica scene -> location
    const sceneLocationMap = {
      taverna: 'bettola_amica',
      covo: 'covo',
      casa: 'casa',
      tempio: 'tempio',
      dungeon: 'dungeon',
      foresta: 'wilderness',
      strada: 'strada'
    };

    for (const [keyword, location] of Object.entries(sceneLocationMap)) {
      if (sceneName.includes(keyword)) {
        // Aggiorna location per tutti gli attori del party
        game.actors.forEach(actor => {
          if (actor.hasPlayerOwner) {
            actor.setFlag('brancalonia-bigat', 'currentLocation', location);
          }
        });
        break;
      }
    }
  }

  // Migliora actor sheet
  enhanceActorSheet(sheet, html, data) {
    if (!game.settings.get('brancalonia-bigat', 'useCanagliasRest')) return;

    // Aggiungi informazioni riposo Brancalonia
    const actor = sheet.actor;
    const location = actor.getFlag('brancalonia-bigat', 'currentLocation') || 'Sconosciuta';
    const imboscoMod = actor.getFlag('brancalonia-bigat', 'imboscoModifier');

    let restInfo = `<div class="brancalonia-rest-info" style="margin: 5px 0; padding: 5px; background: rgba(139, 69, 19, 0.1); border-radius: 3px;">`;
    restInfo += `<small><strong>Location:</strong> ${location}</small>`;

    if (imboscoMod && imboscoMod.expires > Date.now()) {
      restInfo += `<br><small><strong>Imbosco:</strong> ${imboscoMod.value} ai Rischi</small>`;
    }

    restInfo += `</div>`;

    // Inserisci le informazioni vicino alle altre stat
    html.find('.attributes').after(restInfo);
  }

  // Migliora dialog riposo
  enhanceRestDialog(dialog, html, data) {
    if (!game.settings.get('brancalonia-bigat', 'useCanagliasRest')) return;

    // Modifica i testi del dialog per riflettere le durate Brancalonia
    html.find('label').each((i, label) => {
      const $label = $(label);
      const text = $label.text();

      if (text.includes('Short Rest')) {
        $label.html(text.replace('Short Rest', 'Riposo Breve (8 ore)'));
      } else if (text.includes('Long Rest')) {
        $label.html(text.replace('Long Rest', 'Riposo Lungo - Sbraco (7 giorni)'));
      }
    });

    // Aggiungi informazioni aggiuntive
    const info = `
      <div style="margin: 10px 0; padding: 8px; background: #f0f0f0; border-radius: 3px; font-size: 0.9em;">
        <strong>Sistema Riposo della Canaglia:</strong><br>
        • Riposo Breve: 8 ore (invece di 1 ora)<br>
        • Riposo Lungo: 7 giorni con opzioni Sbraco
      </div>`;

    html.find('.form-group').first().before(info);
  }
}

// Registra la classe nel window
window.BrancaloniaRestSystem = BrancaloniaRestSystem;

// Inizializzazione automatica
Hooks.once('init', () => {
  console.log('Brancalonia | Inizializzazione Sistema di Riposo della Canaglia...');
  BrancaloniaRestSystem.initialize();
});

// Registra macro quando il gioco è pronto
Hooks.once('ready', () => {
  BrancaloniaRestSystem.registerMacros();
});