/* ===================================== */
/* BRANCALONIA FAVORI SYSTEM */
/* Sistema Favori della Banda */
/* ===================================== */

/**
 * @fileoverview Sistema Favori per Brancalonia
 *
 * Sistema completo di gestione favori della banda.
 * Implementazione dal Manuale Brancalonia pag. 45.
 * Supporta 7 tipi di favori con costi, debiti e tracking.
 *
 * Features:
 * - 7 Tipi di Favori (Riscatto, Evasione, Compare Esperto, Barattiere, Viaggio Incognito, Informazioni, Granlusso Prestito)
 * - Costo favori (gratuito per bonus Nomea volte, poi 100 mo debito)
 * - Altri Fratelli di Taglia (100 mo extra o 200 mo debito)
 * - Gestione debiti (pagamento, tracking)
 * - Pool condiviso (opzionale)
 * - Dialog UI completa per richieste
 * - Chat commands (/favore-*)
 * - Macro automatica
 * - Settings (4+ impostazioni)
 * - Hook integration
 * - Actor extension
 *
 * @version 3.0.0
 * @author Brancalonia Module Team
 * @requires brancalonia-logger.js
 * @requires dnd5e
 */

import { logger } from './brancalonia-logger.js';

/**
 * @typedef {Object} FavoriStatistics
 * @property {number} initTime - Tempo inizializzazione (ms)
 * @property {number} favoriRequested - Favori richiesti totali
 * @property {Object<string, number>} favoriByType - Favori per tipo
 * @property {number} favoriGranted - Favori concessi
 * @property {number} favoriDenied - Favori negati
 * @property {number} debtCreated - Debiti creati
 * @property {number} debtPaid - Debiti pagati
 * @property {number} freeFavoriUsed - Favori gratuiti usati
 * @property {number} paidFavoriUsed - Favori pagati usati
 * @property {number} otherBandFavori - Favori da altre bande
 * @property {number} favoriExecuted - Favori eseguiti totali
 * @property {number} debtTotal - Debito totale creato (mo)
 * @property {number} debtOutstanding - Debito corrente (mo)
 * @property {number} dialogsOpened - Dialog aperti
 * @property {number} macrosCreated - Macro create
 * @property {number} chatCommandsExecuted - Comandi chat eseguiti
 * @property {string[]} errors - Errori registrati
 */

/**
 * Sistema Favori per Brancalonia
 * Gestisce i favori della banda, costi e debiti
 *
 * @class FavoriSystem
 */
class FavoriSystem {
  static VERSION = '3.0.0';
  static MODULE_NAME = 'FavoriSystem';
  static ID = 'favori-system';

  /**
   * Statistiche del modulo
   * @type {FavoriStatistics}
   * @private
   * @static
   */
  static _statistics = {
    initTime: 0,
    favoriRequested: 0,
    favoriByType: {},
    favoriGranted: 0,
    favoriDenied: 0,
    debtCreated: 0,
    debtPaid: 0,
    freeFavoriUsed: 0,
    paidFavoriUsed: 0,
    otherBandFavori: 0,
    favoriExecuted: 0,
    debtTotal: 0,
    debtOutstanding: 0,
    dialogsOpened: 0,
    macrosCreated: 0,
    chatCommandsExecuted: 0,
    errors: []
  };

  /**
   * Stato del modulo
   * @type {Object}
   * @private
   * @static
   */
  static _state = {
    initialized: false,
    instance: null
  };

  constructor() {
    try {
      this.initialized = false;
      this.favoriTypes = {};

      logger.info(FavoriSystem.MODULE_NAME, 'Constructor Sistema Favori');
    } catch (error) {
      FavoriSystem._statistics.errors.push(`Constructor: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore inizializzazione constructor', error);
    }
  }

  /**
   * Inizializza il sistema favori
   * @static
   * @returns {FavoriSystem|null} Istanza sistema favori
   */
  static initialize() {
    const startTime = performance.now();

    try {
      logger.info(this.MODULE_NAME, `Inizializzazione Favori System v${this.VERSION}`);

      // Registra le settings
      FavoriSystem.registerSettings();

      // Registra tutti gli hooks
      FavoriSystem.registerHooks();

      // Registra comandi chat
      FavoriSystem.registerChatCommands();

      // Crea istanza globale
      const instance = new FavoriSystem();
      this._state.instance = instance;
      this._state.initialized = true;

      game.brancalonia = game.brancalonia || {};
      game.brancalonia.favoriSystem = instance;

      this._statistics.initTime = performance.now() - startTime;

      logger.info(
        this.MODULE_NAME,
        `✅ Inizializzazione completata in ${this._statistics.initTime.toFixed(2)}ms`
      );

      // Emit event
      Hooks.callAll('favori:initialized', {
        version: this.VERSION,
        favoriTypes: 7
      });

      return instance;
    } catch (error) {
      this._statistics.errors.push(error.message);
      logger.error(this.MODULE_NAME, 'Errore inizializzazione Sistema Favori', error);
      if (ui?.notifications) {
        ui.notifications.error(`Errore inizializzazione Sistema Favori: ${error.message}`);
      }
      return null;
    }
  }

  static registerSettings() {
    game.settings.register('brancalonia-bigat', 'favoriSystemEnabled', {
      name: 'Abilita Sistema Favori',
      hint: 'Attiva il sistema completo dei Favori della Banda',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
      onChange: value => {
        logger.info(FavoriSystem.MODULE_NAME, `Sistema Favori: ${value ? 'abilitato' : 'disabilitato'}`);
        ui.notifications.info(`Sistema Favori ${value ? 'abilitato' : 'disabilitato'}`);
      }
    });

    game.settings.register('brancalonia-bigat', 'favoriSharedPool', {
      name: 'Pool Favori Condiviso',
      hint: 'I favori gratuiti sono condivisi tra tutta la Cricca',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register('brancalonia-bigat', 'favoriNomeaScale', {
      name: 'Scala Bonus Nomea',
      hint: 'Ogni quanti punti nomea si ottiene un favore gratuito',
      scope: 'world',
      config: true,
      type: Number,
      default: 25,
      range: { min: 10, max: 50, step: 5 }
    });

    game.settings.register('brancalonia-bigat', 'favoriAutomaticDebt', {
      name: 'Debito Automatico',
      hint: 'Calcola automaticamente i debiti dei favori',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    logger.info(this.MODULE_NAME, 'Settings Sistema Favori registrate');
  }

  static registerHooks() {
    // Hook principale di inizializzazione
    Hooks.on('ready', async () => {
      if (!game.settings.get('brancalonia-bigat', 'favoriSystemEnabled')) return;

      const instance = game.brancalonia?.favoriSystem;
      if (instance && !instance.initialized) {
        await instance.initialize();
      }
    });

    // Hook per rendering actor sheet
    Hooks.on('renderActorSheet', FavoriSystem._onRenderActorSheet);

    // Hook per Sbraco - gestione Barattiere
    Hooks.on('brancalonia.sbracoStarted', FavoriSystem._onSbracoStarted);

    // Hook per fine lavoretto - cleanup temporanei
    Hooks.on('brancalonia.jobCompleted', FavoriSystem._onJobCompleted);

    logger.info(this.MODULE_NAME, 'Hooks Sistema Favori registrati');
  }

  static registerChatCommands() {
    // Comando per gestire favori
    Hooks.on('chatCommandsReady', (commands) => {
      commands.register({
        name: '/favore',
        description: 'Gestisce il sistema dei Favori della Banda',
        icon: '<i class="fas fa-hands-helping"></i>',
        callback: FavoriSystem._handleChatCommand
      });
    });

    // Sistema di help per comandi
    game.brancalonia = game.brancalonia || {};
    game.brancalonia.favoriHelp = () => {
      const helpContent = `
        <div class="brancalonia-help">
          <h3>Comandi Sistema Favori</h3>
          <ul>
            <li><strong>/favore richiedi</strong> - Richiedi un favore alla banda</li>
            <li><strong>/favore status</strong> - Mostra stato favori</li>
            <li><strong>/favore paga [importo]</strong> - Paga debiti di favori</li>
            <li><strong>/favore barattiere</strong> - Usa favore Barattiere</li>
            <li><strong>/favore info [argomento]</strong> - Richiedi informazioni</li>
            <li><strong>/favore viaggio [destinazione]</strong> - Viaggio sicuro</li>
            <li><strong>/favore compare [tipo]</strong> - Compare esperto</li>
          </ul>
          <h4>Tipi di Favori:</h4>
          <ul>
            <li><strong>Riscatto</strong> - Liberare prigionieri</li>
            <li><strong>Evasione</strong> - Far evadere dal gabbio</li>
            <li><strong>Compare Esperto</strong> - Aiuto specializzato</li>
            <li><strong>Barattiere</strong> - Insabbiare malefatte</li>
            <li><strong>Viaggio Incognito</strong> - Trasporto sicuro</li>
            <li><strong>Informazioni</strong> - Conoscenze preziose</li>
            <li><strong>Granlusso Prestito</strong> - Granlussi temporanei</li>
          </ul>
        </div>`;

      ChatMessage.create({
        content: helpContent,
        whisper: [game.user.id]
      });
    };

    logger.info(this.MODULE_NAME, 'Comandi chat Sistema Favori registrati');
  }

  static registerMacros() {
    // Macro richiesta favore
    if (!game?.macros?.find(m => m.name === 'Richiedi Favore')) {
      Macro.create({
        name: 'Richiedi Favore',
        type: 'script',
        img: 'icons/skills/social/diplomacy-handshake-yellow.webp',
        command: `
          const actor = game.user.character || canvas.tokens.controlled[0]?.actor;
          if (!actor) {
            ui.notifications.warn('Seleziona un personaggio o token');
            return;
          }
          game.brancalonia?.favoriSystem?.openFavoreRequestDialog(actor);
        `
      });
    }

    // Macro status favori
    if (!game?.macros?.find(m => m.name === 'Status Favori')) {
      Macro.create({
        name: 'Status Favori',
        type: 'script',
        img: 'icons/skills/social/diplomacy-peace-alliance.webp',
        command: `
          const actor = game.user.character || canvas.tokens.controlled[0]?.actor;
          if (!actor) {
            ui.notifications.warn('Seleziona un personaggio o token');
            return;
          }
          game.brancalonia?.favoriSystem?.showFavoriStatus(actor);
        `
      });
    }

    FavoriSystem._statistics.macrosCreated++;
    logger.info(this.MODULE_NAME, 'Macro Sistema Favori registrate');
  }

  // Hook handlers statici
  static _onRenderActorSheet(sheet, html, data) {
    const instance = game.brancalonia?.favoriSystem;
    if (!instance?.initialized) return;

    try {
      if (sheet.actor.type === 'character' && (game.user.isGM || sheet.actor.isOwner)) {
        instance.renderFavoriUI(sheet, html, data);
      }
    } catch (error) {
      FavoriSystem._statistics.errors.push(`renderActorSheet: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore renderActorSheet', error);
    }
  }

  static _onSbracoStarted() {
    const instance = game.brancalonia?.favoriSystem;
    if (!instance?.initialized) return;

    try {
      instance.checkBarattiereRequests();
    } catch (error) {
      FavoriSystem._statistics.errors.push(`sbracoStarted: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore sbracoStarted', error);
    }
  }

  static _onJobCompleted(actors) {
    const instance = game.brancalonia?.favoriSystem;
    if (!instance?.initialized) return;

    try {
      instance.cleanupTemporaryFavors(actors);
    } catch (error) {
      FavoriSystem._statistics.errors.push(`jobCompleted: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore jobCompleted', error);
    }
  }

  static _handleChatCommand(args, speaker) {
    const instance = game.brancalonia?.favoriSystem;
    if (!instance?.initialized) return;

    try {
      instance.handleChatCommand(args, speaker);
    } catch (error) {
      FavoriSystem._statistics.errors.push(`chatCommand: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore chat command', error);
      ui.notifications.error('Errore comando sistema favori');
    }
  }

  // Inizializza il sistema (chiamato dopo ready)
  async initialize() {
    if (this.initialized) return;

    try {
      // Carica configurazioni favori
      await this.loadFavoriConfig();

      this.initialized = true;
      logger.info(FavoriSystem.MODULE_NAME, 'Sistema Favori configurato');
      ui.notifications.info('Sistema Favori attivo');
    } catch (error) {
      FavoriSystem._statistics.errors.push(`initialize: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore inizializzazione sistema favori', error);
      ui.notifications.error('Errore inizializzazione Sistema Favori');
    }
  }

  // Carica configurazioni favori
  async loadFavoriConfig() {
    this.favoriTypes = {
      riscatto: {
        name: 'Riscatto',
        icon: 'icons/skills/social/diplomacy-handshake-yellow.webp',
        description: 'La banda paga per liberare un prigioniero o ostaggio',
        baseCost: 100,
        requiresTarget: true,
        category: 'liberazione'
      },

      evasione: {
        name: 'Evasione',
        icon: 'icons/environment/settlement/jail-cell-key.webp',
        description: "La banda organizza un'evasione dal gabbio",
        baseCost: 100,
        requiresTarget: true,
        difficulty: 'media',
        category: 'liberazione'
      },

      compareEsperto: {
        name: 'Compare Esperto',
        icon: 'icons/skills/trades/smithing-anvil-silver.webp',
        description: 'Un esperto della banda aiuta in una mansione specifica',
        baseCost: 100,
        requiresSpecialization: true,
        duration: '1 lavoretto',
        category: 'supporto'
      },

      barattiere: {
        name: 'Barattiere',
        icon: 'icons/skills/social/intimidation-impressing.webp',
        description: 'Insabbia una malefatta prima che diventi taglia',
        baseCost: 100,
        timing: 'Durante lo Sbraco',
        immediate: true,
        category: 'sicurezza'
      },

      viaggioIncognito: {
        name: 'Viaggio in Incognito',
        icon: 'icons/environment/settlement/wagon-black.webp',
        description: 'Trasporto sicuro verso qualsiasi regione del Regno',
        baseCost: 100,
        requiresDestination: true,
        category: 'viaggio'
      },

      informazioni: {
        name: 'Informazioni',
        icon: 'icons/skills/social/diplomacy-peace-alliance.webp',
        description: 'Informazioni preziose su luogo, persona, oggetto o conoscenza',
        baseCost: 100,
        requiresTopic: true,
        category: 'intelligence'
      },

      granlussoPrestito: {
        name: 'Granlusso in Prestito',
        icon: 'icons/environment/settlement/house-stone-yellow.webp',
        description: 'Usa un Granlusso aggiuntivo del Covo',
        baseCost: 100,
        requiresGranlusso: true,
        duration: '1 lavoretto',
        category: 'supporto'
      }
    };

    // Inizializza contatori statistics per tipo favore
    Object.keys(this.favoriTypes).forEach(type => {
      FavoriSystem._statistics.favoriByType[type] = 0;
    });

    logger.info(FavoriSystem.MODULE_NAME, `Configurazione favori caricata (${Object.keys(this.favoriTypes).length} tipi)`);
  }

  // Renderizza UI Favori sulla scheda
  renderFavoriUI(sheet, html, data) {
    try {
      const $html = $(html);
      const actor = sheet.actor;

      const nomea = actor.getFlag('brancalonia-bigat', 'nomea') || 0;
      const nomeaScale = game.settings.get('brancalonia-bigat', 'favoriNomeaScale');
      const nomeaBonus = Math.floor(nomea / nomeaScale);
      const favoriUsed = actor.getFlag('brancalonia-bigat', 'favoriUsed') || 0;
      const favoriDebts = actor.getFlag('brancalonia-bigat', 'favoriDebts') || 0;
      const favoriRemaining = Math.max(0, nomeaBonus - favoriUsed);

      const favoriHtml = `
        <div class="brancalonia-favori-section" style="border: 2px solid #8B4513; padding: 10px; margin: 10px 0; border-radius: 5px;">
          <h3 style="display: flex; justify-content: space-between; align-items: center; margin: 0 0 10px 0;">
            <span><i class="fas fa-hands-helping"></i> Favori della Banda</span>
            ${(game.user.isGM || actor.isOwner) && favoriDebts === 0 ? `
              <button class="request-favore" style="font-size: 0.8em; padding: 2px 6px;">Richiedi Favore</button>
            ` : ''}
          </h3>

          <div class="favori-status" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div style="text-align: center; padding: 5px; background: rgba(40, 167, 69, 0.1); border-radius: 3px;">
              <strong style="font-size: 0.9em;">Gratuiti</strong>
              <div style="font-size: 1.2em; color: #28a745;">${favoriRemaining}/${nomeaBonus}</div>
            </div>
            <div style="text-align: center; padding: 5px; background: rgba(${favoriDebts > 0 ? '220, 53, 69' : '108, 117, 125'}, 0.1); border-radius: 3px;">
              <strong style="font-size: 0.9em;">Debiti</strong>
              <div style="font-size: 1.2em; color: ${favoriDebts > 0 ? '#dc3545' : '#6c757d'};">
                ${favoriDebts} mo
              </div>
            </div>
            <div style="text-align: center; padding: 5px; background: rgba(255, 193, 7, 0.1); border-radius: 3px;">
              <strong style="font-size: 0.9em;">Bonus Nomea</strong>
              <div style="font-size: 1.2em; color: #ffc107;">+${nomeaBonus}</div>
            </div>
          </div>

          ${favoriDebts > 0 ? `
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 8px; border-radius: 3px; color: #721c24;">
              <strong>⚠️ Debiti Pendenti</strong><br>
              <small>Hai ${favoriDebts} mo di debiti con la banda. Salda i debiti prima di richiedere altri favori.</small>
              <br><button class="pay-debt" style="margin-top: 5px; font-size: 0.8em; padding: 2px 6px;">Paga Debiti</button>
            </div>
          ` : ''}

          <div style="margin-top: 10px; padding: 5px; background: rgba(139, 69, 19, 0.1); border-radius: 3px;">
            <small><strong>Info:</strong> I favori gratuiti si basano sulla Nomea (ogni ${nomeaScale} punti = +1 favore)</small>
          </div>
        </div>
      `;

      // Inserisci dopo la sezione Covo o Granlussi
      const covoSection = $html.find('.brancalonia-covo-section');
      if (covoSection.length) {
        covoSection.after(favoriHtml);
      } else {
        $html.find('.tab.inventory').append(favoriHtml);
      }

      // Event listeners
      $html.find('.request-favore').off('click').on('click', () => {
        if (favoriDebts > 0) {
          ui.notifications.error('Devi saldare i debiti prima di richiedere altri favori!');
          return;
        }
        this.openFavoreRequestDialog(actor);
      });

      $html.find('.pay-debt').off('click').on('click', () => {
        this.openDebtPaymentDialog(actor);
      });
    } catch (error) {
      FavoriSystem._statistics.errors.push(`renderFavoriUI: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore render favori UI', error);
    }
  }

  // Dialog per richiedere un favore
  async openFavoreRequestDialog(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun personaggio selezionato');
      return;
    }

    try {
      const nomea = actor.getFlag('brancalonia-bigat', 'nomea') || 0;
      const nomeaScale = game.settings.get('brancalonia-bigat', 'favoriNomeaScale');
      const nomeaBonus = Math.floor(nomea / nomeaScale);
      const favoriUsed = actor.getFlag('brancalonia-bigat', 'favoriUsed') || 0;
      const favoriRemaining = Math.max(0, nomeaBonus - favoriUsed);

      const content = `
        <div class="favore-request" style="padding: 10px;">
          <div style="margin-bottom: 15px; padding: 8px; background: #e9ecef; border-radius: 3px;">
            <p style="margin: 0;"><strong>📊 Status Favori:</strong></p>
            <p style="margin: 5px 0 0 0;">Favori gratuiti rimanenti: <strong>${favoriRemaining}</strong></p>
            ${favoriRemaining === 0 ? `
              <p style="color: #dc3545; margin: 5px 0 0 0; font-size: 0.9em;">
                ⚠️ Hai esaurito i favori gratuiti. Il prossimo favore costerà 100 mo di debito.
              </p>
            ` : ''}
          </div>

          <div class="favore-type" style="margin: 15px 0;">
            <label style="display: block; margin-bottom: 5px;"><strong>Tipo di Favore:</strong></label>
            <select name="favore-type" style="width: 100%; padding: 5px;">
              ${Object.entries(this.favoriTypes).map(([key, favore]) => `
                <option value="${key}">${favore.name} - ${favore.description}</option>
              `).join('')}
            </select>
          </div>

          <div class="favore-details" style="margin: 15px 0;">
            <!-- Dettagli dinamici in base al tipo -->
          </div>

          <div class="favore-band" style="margin: 15px 0;">
            <label style="cursor: pointer;">
              <input type="checkbox" name="other-band" style="margin-right: 8px;">
              Richiedi a un'altra banda (+100 mo costo o +200 mo debito)
            </label>
          </div>

          <div class="favore-cost" style="margin: 15px 0; padding: 8px; background: #fff3cd; border-radius: 3px;">
            <strong>💰 Costo stimato:</strong>
            <span class="cost-display">
              ${favoriRemaining > 0 ? 'Gratuito' : '100 mo di debito'}
            </span>
          </div>
        </div>
      `;

      const dialog = new foundry.appv1.sheets.Dialog({
        title: '🤝 Richiedi Favore alla Banda',
        content,
        buttons: {
          request: {
            icon: '<i class="fas fa-check"></i>',
            label: 'Richiedi Favore',
            callback: async (html) => {
              const type = html.find('select[name="favore-type"]').val();
              const otherBand = html.find('input[name="other-band"]').is(':checked');
              const details = this.collectFavoreDetails(html, type);

              const confirmed = await foundry.appv1.sheets.Dialog.confirm({
                title: 'Conferma Richiesta',
                content: `<p>Vuoi richiedere il favore <strong>${this.favoriTypes[type].name}</strong>?</p>`
              });

              if (confirmed) {
                await this.processFavoreRequest(actor, type, otherBand, details);
              }
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Annulla'
          }
        },
        render: (html) => {
          // Aggiorna dettagli quando cambia il tipo
          html.find('select[name="favore-type"]').off('change').on('change', (e) => {
            this.updateFavoreDetails(html, e.target.value);
            this.updateCostDisplay(html, actor);
          });

          // Aggiorna costo quando cambia banda
          html.find('input[name="other-band"]').off('change').on('change', () => {
            this.updateCostDisplay(html, actor);
          });

          // Mostra dettagli iniziali
          this.updateFavoreDetails(html, html.find('select[name="favore-type"]').val());
          this.updateCostDisplay(html, actor);
        }
      }, {
        width: 500
      });

      dialog.render(true);
    } catch (error) {
      FavoriSystem._statistics.errors.push(`openFavoreRequestDialog: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore dialog richiesta favore', error);
      ui.notifications.error('Errore apertura dialog richiesta favore');
    }
  }

  // Aggiorna dettagli del favore in base al tipo
  updateFavoreDetails(html, type) {
    const favore = this.favoriTypes[type];
    let detailsHtml = '';

    if (favore.requiresTarget) {
      detailsHtml += `
        <div style="margin-bottom: 10px;">
          <label style="display: block; margin-bottom: 3px;"><strong>Nome del bersaglio:</strong></label>
          <input type="text" name="target" placeholder="Chi deve essere liberato/fatto evadere" style="width: 100%; padding: 5px;">
        </div>
      `;
    }

    if (favore.requiresSpecialization) {
      detailsHtml += `
        <div style="margin-bottom: 10px;">
          <label style="display: block; margin-bottom: 3px;"><strong>Specializzazione richiesta:</strong></label>
          <select name="specialization" style="width: 100%; padding: 5px;">
            <option value="ladro">Ladro esperto</option>
            <option value="guerriero">Guerriero veterano</option>
            <option value="mago">Mago sapiente</option>
            <option value="chierico">Chierico devoto</option>
            <option value="artigiano">Artigiano abile</option>
            <option value="mercante">Mercante astuto</option>
            <option value="bardo">Bardo eloquente</option>
            <option value="ranger">Ranger esperto</option>
          </select>
        </div>
      `;
    }

    if (favore.requiresDestination) {
      detailsHtml += `
        <div style="margin-bottom: 10px;">
          <label style="display: block; margin-bottom: 3px;"><strong>Destinazione:</strong></label>
          <select name="destination" style="width: 100%; padding: 5px;">
            <option value="quinotaria">Quinotaria</option>
            <option value="falcamonte">Falcamonte</option>
            <option value="galaverna">Galaverna</option>
            <option value="vortigana">Vortigana</option>
            <option value="pianaverna">Pianaverna</option>
            <option value="penumbria">Penumbria</option>
            <option value="torrigiana">Torrigiana</option>
            <option value="spoletaria">Spoletaria</option>
            <option value="alazia">Alazia</option>
            <option value="ausonia">Ausonia</option>
          </select>
        </div>
      `;
    }

    if (favore.requiresTopic) {
      detailsHtml += `
        <div style="margin-bottom: 10px;">
          <label style="display: block; margin-bottom: 3px;"><strong>Informazioni su:</strong></label>
          <input type="text" name="topic" placeholder="Persona, luogo, oggetto o conoscenza" style="width: 100%; padding: 5px;">
        </div>
      `;
    }

    if (favore.requiresGranlusso) {
      detailsHtml += `
        <div style="margin-bottom: 10px;">
          <label style="display: block; margin-bottom: 3px;"><strong>Granlusso desiderato:</strong></label>
          <select name="granlusso" style="width: 100%; padding: 5px;">
            <option value="borsaNera">Borsa Nera</option>
            <option value="cantina">Cantina</option>
            <option value="distilleria">Distilleria</option>
            <option value="fucina">Fucina</option>
            <option value="scuderie">Scuderie</option>
          </select>
        </div>
      `;
    }

    if (favore.timing) {
      detailsHtml += `
        <div style="margin-bottom: 10px; padding: 8px; background: #d1ecf1; border-radius: 3px;">
          <strong>⏰ Tempistiche:</strong> ${favore.timing}
        </div>
      `;
    }

    if (favore.duration) {
      detailsHtml += `
        <div style="margin-bottom: 10px; padding: 8px; background: #d4edda; border-radius: 3px;">
          <strong>⏱️ Durata:</strong> ${favore.duration}
        </div>
      `;
    }

    html.find('.favore-details').html(detailsHtml);
  }

  // Aggiorna display del costo
  updateCostDisplay(html, actor) {
    const nomea = actor.getFlag('brancalonia-bigat', 'nomea') || 0;
    const nomeaScale = game.settings.get('brancalonia-bigat', 'favoriNomeaScale');
    const nomeaBonus = Math.floor(nomea / nomeaScale);
    const favoriUsed = actor.getFlag('brancalonia-bigat', 'favoriUsed') || 0;
    const favoriRemaining = Math.max(0, nomeaBonus - favoriUsed);
    const otherBand = html.find('input[name="other-band"]').is(':checked');

    let costText = '';

    if (favoriRemaining > 0) {
      if (otherBand) {
        const currentMoney = actor.system.currency?.gp || 0;
        if (currentMoney >= 100) {
          costText = '100 mo (altra banda)';
        } else {
          costText = '200 mo di debito (altra banda, senza fondi)';
        }
      } else {
        costText = 'Gratuito';
      }
    } else {
      if (otherBand) {
        const currentMoney = actor.system.currency?.gp || 0;
        if (currentMoney >= 200) {
          costText = '200 mo (nessun favore gratuito + altra banda)';
        } else {
          costText = '300 mo di debito (nessun favore gratuito + altra banda senza fondi)';
        }
      } else {
        costText = '100 mo di debito';
      }
    }

    html.find('.cost-display').text(costText);
  }

  // Raccoglie dettagli del favore
  collectFavoreDetails(html, type) {
    const details = { type };

    const inputs = {
      target: 'input[name="target"]',
      specialization: 'select[name="specialization"]',
      destination: 'select[name="destination"]',
      topic: 'input[name="topic"]',
      granlusso: 'select[name="granlusso"]'
    };

    for (const [key, selector] of Object.entries(inputs)) {
      const element = html.find(selector);
      if (element.length) {
        details[key] = element.val();
      }
    }

    return details;
  }

  // Processa la richiesta di favore
  async processFavoreRequest(actor, type, otherBand, details) {
    try {
      const nomea = actor.getFlag('brancalonia-bigat', 'nomea') || 0;
      const nomeaScale = game.settings.get('brancalonia-bigat', 'favoriNomeaScale');
      const nomeaBonus = Math.floor(nomea / nomeaScale);
      const favoriUsed = actor.getFlag('brancalonia-bigat', 'favoriUsed') || 0;
      const favoriRemaining = Math.max(0, nomeaBonus - favoriUsed);

      let cost = 0;
      let debt = 0;

      // Calcola costo e debito
      if (favoriRemaining === 0) {
        debt += 100; // Favore oltre il bonus
      }

      if (otherBand) {
        const currentMoney = actor.system.currency?.gp || 0;
        if (currentMoney >= 100) {
          cost += 100; // Extra per altra banda
        } else {
          debt += 200; // Debito maggiore con altra banda
        }
      }

      // Applica costo immediato
      if (cost > 0) {
        const currentMoney = actor.system.currency?.gp || 0;
        if (currentMoney < cost) {
          ui.notifications.error('Fondi insufficienti!');
          return;
        }
        await actor.update({ 'system.currency.gp': currentMoney - cost });
      }

      // Applica debito
      if (debt > 0) {
        const currentDebt = actor.getFlag('brancalonia-bigat', 'favoriDebts') || 0;
        await actor.setFlag('brancalonia-bigat', 'favoriDebts', currentDebt + debt);
      }

      // Incrementa favori usati
      if (favoriRemaining > 0) {
        await actor.setFlag('brancalonia-bigat', 'favoriUsed', favoriUsed + 1);
      }

      // Registra il favore
      await this.registerFavore(actor, type, details, cost, debt, otherBand);

      // Esegui il favore
      await this.executeFavore(actor, type, details);

      logger.info(FavoriSystem.MODULE_NAME, `Favore ${type} processato per ${actor.name}`);
    } catch (error) {
      FavoriSystem._statistics.errors.push(`processFavoreRequest: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore processo favore', error);
      ui.notifications.error('Errore durante il processo del favore');
    }
  }

  // Registra il favore nel journal
  async registerFavore(actor, type, details, cost, debt, otherBand) {
    try {
      const favore = this.favoriTypes[type];
      const timestamp = new Date().toLocaleString();

      // Crea o aggiorna journal dei favori
      let journal = game.journal.getName(`Favori - ${actor.name}`);
      if (!journal) {
        journal = await JournalEntry.create({
          name: `Favori - ${actor.name}`,
          pages: [{
            name: 'Registro Favori',
            type: 'text',
            text: { content: '' }
          }]
        });
      }

      const entry = `
        <div style="border-bottom: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
          <h3 style="color: #8B4513; margin: 0 0 5px 0;">🤝 ${favore.name}</h3>
          <p style="margin: 3px 0;"><strong>Data:</strong> ${timestamp}</p>
          <p style="margin: 3px 0;"><strong>Categoria:</strong> ${favore.category}</p>
          ${details.target ? `<p style="margin: 3px 0;"><strong>Bersaglio:</strong> ${details.target}</p>` : ''}
          ${details.destination ? `<p style="margin: 3px 0;"><strong>Destinazione:</strong> ${details.destination}</p>` : ''}
          ${details.topic ? `<p style="margin: 3px 0;"><strong>Argomento:</strong> ${details.topic}</p>` : ''}
          ${details.specialization ? `<p style="margin: 3px 0;"><strong>Specializzazione:</strong> ${details.specialization}</p>` : ''}
          ${details.granlusso ? `<p style="margin: 3px 0;"><strong>Granlusso:</strong> ${details.granlusso}</p>` : ''}
          <p style="margin: 3px 0;"><strong>Banda:</strong> ${otherBand ? 'Altra banda' : 'Propria banda'}</p>
          <p style="margin: 3px 0;"><strong>Costo:</strong> ${cost > 0 ? `${cost} mo` : 'Gratuito'}</p>
          <p style="margin: 3px 0;"><strong>Debito:</strong> ${debt > 0 ? `${debt} mo` : 'Nessuno'}</p>
        </div>
      `;

      const page = journal.pages.contents[0];
      const currentContent = page.text.content || '';
      await page.update({
        'text.content': entry + currentContent
      });
    } catch (error) {
      FavoriSystem._statistics.errors.push(`registerFavore: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore registrazione favore', error);
    }
  }

  // Esegue il favore richiesto
  async executeFavore(actor, type, details) {
    try {
      const favore = this.favoriTypes[type];

      // Messaggio di conferma base
      const message = `
        <div class="brancalonia-favore" style="border: 2px solid #28a745; padding: 10px; border-radius: 5px;">
          <h3 style="color: #28a745; margin: 0 0 10px 0;">🤝 ${favore.name} Concesso!</h3>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${favore.icon}" width="48" height="48" style="border-radius: 5px;">
            <div>
              <p style="margin: 0; font-weight: bold;">${actor.name} ha richiesto: ${favore.description}</p>
              ${details.target ? `<p style="margin: 3px 0 0 0;">🎯 Bersaglio: ${details.target}</p>` : ''}
              ${details.destination ? `<p style="margin: 3px 0 0 0;">📍 Destinazione: ${details.destination}</p>` : ''}
              ${details.topic ? `<p style="margin: 3px 0 0 0;">💭 Argomento: ${details.topic}</p>` : ''}
            </div>
          </div>
        </div>
      `;

      await ChatMessage.create({
        content: message,
        speaker: ChatMessage.getSpeaker({ actor }),
        flags: {
          'brancalonia-bigat': {
            favoreExecuted: true,
            favoreType: type,
            details
          }
        }
      });

      // Effetti specifici per tipo
      switch (type) {
        case 'barattiere':
          await this.executeBarattiere(actor);
          break;
        case 'compareEsperto':
          await this.executeCompareEsperto(actor, details);
          break;
        case 'granlussoPrestito':
          await this.executeGranlussoPrestito(actor, details);
          break;
        case 'informazioni':
          await this.executeInformazioni(actor, details);
          break;
        case 'viaggioIncognito':
          await this.executeViaggioIncognito(actor, details);
          break;
        case 'riscatto':
        case 'evasione':
          // Questi richiedono intervento GM
          await ChatMessage.create({
            content: `<p>🎭 Il GM deve gestire <strong>${favore.name}</strong> per <strong>${details.target}</strong></p>`,
            whisper: ChatMessage.getWhisperRecipients('GM')
          });
          break;
      }
    } catch (error) {
      FavoriSystem._statistics.errors.push(`executeFavore: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore esecuzione favore', error);
      ui.notifications.error('Errore durante l\'esecuzione del favore');
    }
  }

  // Esegue Barattiere - cancella malefatta
  async executeBarattiere(actor) {
    try {
      const malefatte = actor.getFlag('brancalonia-bigat', 'malefatte') || [];

      if (malefatte.length === 0) {
        ui.notifications.warn('Nessuna malefatta da insabbiare!');
        return;
      }

      // Dialog per scegliere quale malefatta
      const content = `
        <div style="padding: 10px;">
          <p>Scegli quale malefatta insabbiare:</p>
          <select name="malefatta" style="width: 100%; padding: 5px;">
            ${malefatte.map((m, i) => `
              <option value="${i}">${m.name} (${m.value} mo di taglia)</option>
            `).join('')}
          </select>
        </div>
      `;

      new foundry.appv1.sheets.Dialog({
        title: '🎭 Barattiere - Insabbia Malefatta',
        content,
        buttons: {
          confirm: {
            icon: '<i class="fas fa-eraser"></i>',
            label: 'Insabbia',
            callback: async (html) => {
              const index = parseInt(html.find('select[name="malefatta"]').val());
              const removed = malefatte.splice(index, 1)[0];

              await actor.setFlag('brancalonia-bigat', 'malefatte', malefatte);

              // Ricalcola taglia
              const newTaglia = malefatte.reduce((sum, m) => sum + m.value, 0);
              await actor.setFlag('brancalonia-bigat', 'taglia', newTaglia);

              const message = `
                <div style="border: 2px solid #ffc107; padding: 10px; border-radius: 5px;">
                  <h4 style="color: #856404; margin: 0 0 8px 0;">🎭 Malefatta Insabbiata</h4>
                  <p style="margin: 0;">Il Barattiere ha insabbiato: <strong>${removed.name}</strong></p>
                  <p style="margin: 5px 0 0 0;">Taglia ridotta di <strong>${removed.value} mo</strong></p>
                  <p style="margin: 5px 0 0 0;">Taglia attuale: <strong>${newTaglia} mo</strong></p>
                </div>`;

              await ChatMessage.create({
                content: message,
                speaker: ChatMessage.getSpeaker({ actor })
              });
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Annulla'
          }
        }
      }).render(true);
    } catch (error) {
      FavoriSystem._statistics.errors.push(`executeBarattiere: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore barattiere', error);
    }
  }

  // Esegue Compare Esperto
  async executeCompareEsperto(actor, details) {
    try {
      // Applica flag temporaneo per il compare
      await actor.setFlag('brancalonia-bigat', 'compareEsperto', {
        specialization: details.specialization,
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 giorni
      });

      const message = `
        <div style="border: 2px solid #17a2b8; padding: 10px; border-radius: 5px;">
          <h4 style="color: #0c5460; margin: 0 0 8px 0;">🎯 Compare Esperto Assegnato</h4>
          <p style="margin: 0;">Un <strong>${details.specialization}</strong> esperto si unisce temporaneamente alla Cricca!</p>
          <p style="margin: 5px 0 0 0;"><strong>Durata:</strong> 1 lavoretto (max 7 giorni)</p>
          <p style="margin: 5px 0 0 0;"><strong>Benefici:</strong> Advantage sui tiri di abilità correlati</p>
        </div>`;

      await ChatMessage.create({
        content: message,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    } catch (error) {
      FavoriSystem._statistics.errors.push(`executeCompareEsperto: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore compare esperto', error);
    }
  }

  // Esegue Granlusso in Prestito
  async executeGranlussoPrestito(actor, details) {
    try {
      const granlussoKey = details.granlusso;

      // Applica flag temporaneo per il granlusso
      await actor.setFlag('brancalonia-bigat', `tempGranlusso_${granlussoKey}`, {
        active: true,
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 giorni
      });

      const granlussoNames = {
        borsaNera: 'Borsa Nera',
        cantina: 'Cantina',
        distilleria: 'Distilleria',
        fucina: 'Fucina',
        scuderie: 'Scuderie'
      };

      const message = `
        <div style="border: 2px solid #6f42c1; padding: 10px; border-radius: 5px;">
          <h4 style="color: #432c66; margin: 0 0 8px 0;">🏠 Granlusso in Prestito</h4>
          <p style="margin: 0;">${actor.name} può usare <strong>${granlussoNames[granlussoKey]}</strong> per questo lavoretto!</p>
          <p style="margin: 5px 0 0 0;"><strong>Durata:</strong> 1 lavoretto (max 7 giorni)</p>
        </div>`;

      await ChatMessage.create({
        content: message,
        speaker: ChatMessage.getSpeaker({ actor })
      });

      // Applica benefici immediati se applicabili
      if (game.brancalonia?.covoGranlussi) {
        setTimeout(() => {
          game.brancalonia.covoGranlussi.applyGranlussiBenefits([actor]);
        }, 100);
      }
    } catch (error) {
      FavoriSystem._statistics.errors.push(`executeGranlussoPrestito: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore granlusso prestito', error);
    }
  }

  // Esegue Informazioni
  async executeInformazioni(actor, details) {
    try {
      // Tira per qualità informazioni
      const roll = await new Roll('1d20').evaluate();
      let quality = 'vaghe';
      let qualityColor = '#6c757d';

      if (roll.total >= 15) {
        quality = 'dettagliate';
        qualityColor = '#28a745';
      } else if (roll.total >= 10) {
        quality = 'utili';
        qualityColor = '#17a2b8';
      } else if (roll.total >= 5) {
        quality = 'generiche';
        qualityColor = '#ffc107';
      }

      const message = `
        <div style="border: 2px solid ${qualityColor}; padding: 10px; border-radius: 5px;">
          <h4 style="color: ${qualityColor}; margin: 0 0 8px 0;">🔍 Informazioni Ottenute</h4>
          <p style="margin: 0;">Qualità: <strong style="color: ${qualityColor};">${quality}</strong></p>
          <p style="margin: 5px 0 0 0;">Argomento: <strong>${details.topic}</strong></p>
          <p style="margin: 5px 0 0 0; font-style: italic;">[Il GM fornirà i dettagli appropriati]</p>
        </div>`;

      await ChatMessage.create({
        content: message,
        speaker: ChatMessage.getSpeaker({ actor }),
        whisper: ChatMessage.getWhisperRecipients('GM').concat([game.user.id]),
        rolls: [roll]
      });
    } catch (error) {
      FavoriSystem._statistics.errors.push(`executeInformazioni: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore informazioni', error);
    }
  }

  // Esegue Viaggio in Incognito
  async executeViaggioIncognito(actor, details) {
    try {
      await actor.setFlag('brancalonia-bigat', 'safeTravel', {
        destination: details.destination,
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 1 settimana
      });

      const message = `
        <div style="border: 2px solid #fd7e14; padding: 10px; border-radius: 5px;">
          <h4 style="color: #bd5d00; margin: 0 0 8px 0;">🚗 Viaggio in Incognito</h4>
          <p style="margin: 0;">Viaggio sicuro organizzato verso <strong>${details.destination}</strong></p>
          <p style="margin: 5px 0 0 0;">✅ Nessun incontro casuale durante il viaggio!</p>
          <p style="margin: 5px 0 0 0;">✅ Trasporto discreto garantito</p>
        </div>`;

      await ChatMessage.create({
        content: message,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    } catch (error) {
      FavoriSystem._statistics.errors.push(`executeViaggioIncognito: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore viaggio incognito', error);
    }
  }

  // Dialog per pagamento debiti
  async openDebtPaymentDialog(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun personaggio selezionato');
      return;
    }

    try {
      const currentDebt = actor.getFlag('brancalonia-bigat', 'favoriDebts') || 0;
      const currentMoney = actor.system.currency?.gp || 0;
      const maxPayment = Math.min(currentDebt, currentMoney);

      if (currentDebt === 0) {
        ui.notifications.info('Non hai debiti di favori da pagare');
        return;
      }

      const content = `
        <div style="padding: 15px;">
          <div style="margin-bottom: 15px; padding: 10px; background: #f8d7da; border-radius: 5px;">
            <p style="margin: 0;"><strong>💳 Debito attuale:</strong> ${currentDebt} mo</p>
            <p style="margin: 5px 0 0 0;"><strong>💰 Denaro disponibile:</strong> ${currentMoney} mo</p>
          </div>

          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;"><strong>Importo da pagare:</strong></label>
            <input type="number" name="payment" min="1" max="${maxPayment}" value="${maxPayment}" style="width: 100%; padding: 5px;">
            <small style="color: #666;">Massimo pagabile: ${maxPayment} mo</small>
          </div>

          <div style="padding: 8px; background: #d1ecf1; border-radius: 3px;">
            <strong>💡 Info:</strong> Devi saldare tutti i debiti prima di poter richiedere altri favori.
          </div>
        </div>
      `;

      new foundry.appv1.sheets.Dialog({
        title: '💳 Paga Debiti di Favori',
        content,
        buttons: {
          pay: {
            icon: '<i class="fas fa-credit-card"></i>',
            label: 'Paga',
            callback: async (html) => {
              const amount = parseInt(html.find('input[name="payment"]').val()) || 0;
              if (amount > 0) {
                await this.payFavoriDebt(actor, amount);
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
      FavoriSystem._statistics.errors.push(`openDebtPaymentDialog: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore dialog pagamento', error);
    }
  }

  // Paga debiti di favori
  async payFavoriDebt(actor, amount) {
    try {
      const currentDebt = actor.getFlag('brancalonia-bigat', 'favoriDebts') || 0;
      const currentMoney = actor.system.currency?.gp || 0;

      const toPay = Math.min(amount, currentDebt, currentMoney);

      if (toPay === 0) {
        ui.notifications.warn('Nessun pagamento possibile!');
        return;
      }

      await actor.update({
        'system.currency.gp': currentMoney - toPay
      });

      await actor.setFlag('brancalonia-bigat', 'favoriDebts', currentDebt - toPay);

      const message = `
        <div style="border: 2px solid #28a745; padding: 10px; border-radius: 5px;">
          <h4 style="color: #155724; margin: 0 0 8px 0;">💳 Debito Pagato</h4>
          <p style="margin: 0;">${actor.name} paga <strong>${toPay} mo</strong> di debiti di favori</p>
          <p style="margin: 5px 0 0 0;">Debito rimanente: <strong>${currentDebt - toPay} mo</strong></p>
          ${currentDebt - toPay === 0 ? '<p style="margin: 5px 0 0 0; color: #28a745;">✅ Tutti i debiti sono stati saldati!</p>' : ''}
        </div>`;

      await ChatMessage.create({
        content: message,
        speaker: ChatMessage.getSpeaker({ actor })
      });

      if (currentDebt - toPay === 0) {
        ui.notifications.info('Tutti i debiti sono stati saldati! Ora puoi richiedere altri favori.');
      }
    } catch (error) {
      FavoriSystem._statistics.errors.push(`payFavoriDebt: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore pagamento debiti', error);
      ui.notifications.error('Errore durante il pagamento dei debiti');
    }
  }

  // Mostra status favori
  showFavoriStatus(actor) {
    try {
      if (!actor) {
        ui.notifications.warn('Nessun personaggio selezionato');
        return;
      }

      const nomea = actor.getFlag('brancalonia-bigat', 'nomea') || 0;
      const nomeaScale = game.settings.get('brancalonia-bigat', 'favoriNomeaScale');
      const nomeaBonus = Math.floor(nomea / nomeaScale);
      const favoriUsed = actor.getFlag('brancalonia-bigat', 'favoriUsed') || 0;
      const favoriDebts = actor.getFlag('brancalonia-bigat', 'favoriDebts') || 0;
      const favoriRemaining = Math.max(0, nomeaBonus - favoriUsed);

      // Controllo favori temporanei attivi
      const tempFavors = [];
      const compareEsperto = actor.getFlag('brancalonia-bigat', 'compareEsperto');
      if (compareEsperto && compareEsperto.expires > Date.now()) {
        tempFavors.push(`Compare ${compareEsperto.specialization}`);
      }

      const safeTravel = actor.getFlag('brancalonia-bigat', 'safeTravel');
      if (safeTravel && safeTravel.expires > Date.now()) {
        tempFavors.push(`Viaggio sicuro verso ${safeTravel.destination}`);
      }

      // Controllo granlussi temporanei
      const tempGranlussi = [];
      for (const key of ['borsaNera', 'cantina', 'distilleria', 'fucina', 'scuderie']) {
        const tempGranlusso = actor.getFlag('brancalonia-bigat', `tempGranlusso_${key}`);
        if (tempGranlusso && tempGranlusso.active && tempGranlusso.expires > Date.now()) {
          tempGranlussi.push(key);
        }
      }

      const content = `
        <div style="padding: 15px;">
          <h3 style="margin: 0 0 15px 0;">📊 Status Favori - ${actor.name}</h3>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="padding: 10px; background: rgba(40, 167, 69, 0.1); border-radius: 5px; text-align: center;">
              <strong>Favori Gratuiti</strong><br>
              <span style="font-size: 1.5em; color: #28a745;">${favoriRemaining}/${nomeaBonus}</span>
            </div>
            <div style="padding: 10px; background: rgba(${favoriDebts > 0 ? '220, 53, 69' : '108, 117, 125'}, 0.1); border-radius: 5px; text-align: center;">
              <strong>Debiti</strong><br>
              <span style="font-size: 1.5em; color: ${favoriDebts > 0 ? '#dc3545' : '#6c757d'};">${favoriDebts} mo</span>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <h4>📈 Statistiche</h4>
            <ul style="margin: 10px 0 0 20px;">
              <li><strong>Nomea:</strong> ${nomea} punti</li>
              <li><strong>Bonus Nomea:</strong> ${nomeaBonus} favori (ogni ${nomeaScale} punti)</li>
              <li><strong>Favori utilizzati:</strong> ${favoriUsed}</li>
              <li><strong>Prossimo bonus a:</strong> ${(Math.floor(nomea / nomeaScale) + 1) * nomeaScale} punti nomea</li>
            </ul>
          </div>

          ${tempFavors.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <h4>⏳ Favori Temporanei Attivi</h4>
              <ul style="margin: 10px 0 0 20px;">
                ${tempFavors.map(favor => `<li>${favor}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${tempGranlussi.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <h4>🏠 Granlussi Temporanei</h4>
              <ul style="margin: 10px 0 0 20px;">
                ${tempGranlussi.map(g => `<li>${g.charAt(0).toUpperCase() + g.slice(1)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div style="background: #e9ecef; padding: 10px; border-radius: 5px;">
            <h4 style="margin: 0 0 10px 0;">💡 Sistema Favori</h4>
            <ul style="margin: 0 0 0 20px; font-size: 0.9em;">
              <li>I favori gratuiti si basano sulla Nomea</li>
              <li>Favori extra costano 100 mo di debito</li>
              <li>Richieste ad altre bande costano +100 mo</li>
              <li>Devi saldare i debiti prima di nuovi favori</li>
            </ul>
          </div>
        </div>
      `;

      new foundry.appv1.sheets.Dialog({
        title: '📊 Status Favori',
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
      FavoriSystem._statistics.errors.push(`showFavoriStatus: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore status favori', error);
      ui.notifications.error('Errore visualizzazione status favori');
    }
  }

  // Controlla richieste Barattiere durante lo Sbraco
  checkBarattiereRequests() {
    try {
      const actors = game.actors.filter(a =>
        a.type === 'character' &&
        a.hasPlayerOwner &&
        (a.getFlag('brancalonia-bigat', 'malefatte') || []).length > 0
      );

      actors.forEach(actor => {
        if (actor.getFlag('brancalonia-bigat', 'favoriDebts') > 0) return;

        const message = `
          <div class="barattiere-offer" style="border: 2px solid #ffc107; padding: 10px; border-radius: 5px;">
            <h3 style="color: #856404; margin: 0 0 10px 0;">🎭 Offerta del Barattiere</h3>
            <p style="margin: 0 0 10px 0;">${actor.name} può usare un favore <strong>Barattiere</strong> per insabbiare malefatte!</p>
            <button onclick="game.brancalonia.favoriSystem.openFavoreRequestDialog(game.actors.get('${actor.id}'))"
              style="padding: 5px 10px; background: #ffc107; color: #212529; border: none; border-radius: 3px; cursor: pointer;">
              🎭 Richiedi Barattiere
            </button>
          </div>
        `;

        const user = game?.users?.find(u => u.character?.id === actor.id);
        if (user) {
          ChatMessage.create({
            content: message,
            whisper: [user.id]
          });
        }
      });
    } catch (error) {
      FavoriSystem._statistics.errors.push(`checkBarattiereRequests: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore controllo barattiere', error);
    }
  }

  // Cleanup favori temporanei alla fine del lavoretto
  async cleanupTemporaryFavors(actors) {
    try {
      // Fixed: Use for...of instead of forEach(async) to properly await
      for (const actor of actors) {
        // Rimuovi compare temporaneo
        if (actor.getFlag('brancalonia-bigat', 'compareEsperto')) {
          await actor.unsetFlag('brancalonia-bigat', 'compareEsperto');
        }

        // Rimuovi granlussi temporanei
        for (const key of ['borsaNera', 'cantina', 'distilleria', 'fucina', 'scuderie']) {
          if (actor.getFlag('brancalonia-bigat', `tempGranlusso_${key}`)) {
            await actor.unsetFlag('brancalonia-bigat', `tempGranlusso_${key}`);
          }
        }

        logger.info(FavoriSystem.MODULE_NAME, `Favori temporanei puliti per ${actor.name}`);
      }
    } catch (error) {
      FavoriSystem._statistics.errors.push(`cleanupTemporaryFavors: ${error.message}`);
      logger.error(FavoriSystem.MODULE_NAME, 'Errore cleanup favori', error);
    }
  }

  // Gestisce comandi chat
  handleChatCommand(args, speaker) {
    const command = args[0]?.toLowerCase();
    const actor = ChatMessage.getSpeakerActor(speaker);

    switch (command) {
      case 'richiedi':
        this.openFavoreRequestDialog(actor);
        break;
      case 'status':
        this.showFavoriStatus(actor);
        break;
      case 'paga':
        const amount = parseInt(args[1]) || 0;
        if (amount > 0) {
          this.payFavoriDebt(actor, amount);
        } else {
          this.openDebtPaymentDialog(actor);
        }
        break;
      case 'barattiere':
        this.executeBarattiere(actor);
        break;
      case 'info':
        const topic = args.slice(1).join(' ');
        if (topic) {
          this.processFavoreRequest(actor, 'informazioni', false, { topic });
        } else {
          ui.notifications.warn('Specifica l\'argomento delle informazioni');
        }
        break;
      case 'viaggio':
        const destination = args.slice(1).join(' ');
        if (destination) {
          this.processFavoreRequest(actor, 'viaggioIncognito', false, { destination });
        } else {
          ui.notifications.warn('Specifica la destinazione del viaggio');
        }
        break;
      case 'compare':
        const specialization = args[1]?.toLowerCase();
        if (specialization) {
          this.processFavoreRequest(actor, 'compareEsperto', false, { specialization });
        } else {
          ui.notifications.warn('Specifica il tipo di compare esperto');
        }
        break;
      default:
        game.brancalonia.favoriHelp();
        break;
    }
  }
}

// Registra la classe nel window
window.FavoriSystem = FavoriSystem;

// Inizializzazione automatica
Hooks.once('init', () => {
  try {
    logger.info(FavoriSystem.MODULE_NAME, `🎮 Brancalonia | Inizializzazione ${FavoriSystem.MODULE_NAME} v${FavoriSystem.VERSION}`);
    FavoriSystem.initialize();
  } catch (error) {
    logger.error(FavoriSystem.MODULE_NAME, 'Errore inizializzazione hook init', error);
  }
});

// Registra macro quando il gioco è pronto
Hooks.once('ready', () => {
  FavoriSystem.registerMacros();
});

// ================================================
// PUBLIC API
// ================================================

/**
 * Ottiene lo stato del modulo
 * @static
 * @returns {Object} Stato corrente
 * @example
 * const status = FavoriSystem.getStatus();
 */
FavoriSystem.getStatus = function() {
  return {
    version: this.VERSION,
    initialized: this._state.initialized,
    favoriRequested: this._statistics.favoriRequested,
    favoriGranted: this._statistics.favoriGranted,
    debtOutstanding: this._statistics.debtOutstanding
  };
};

/**
 * Ottiene le statistiche del modulo
 * @static
 * @returns {FavoriStatistics} Statistiche correnti
 * @example
 * const stats = FavoriSystem.getStatistics();
 */
FavoriSystem.getStatistics = function() {
  return {
    ...this._statistics,
    favoriByType: { ...this._statistics.favoriByType },
    errors: [...this._statistics.errors]
  };
};

/**
 * Resetta le statistiche
 * @static
 * @example
 * FavoriSystem.resetStatistics();
 */
FavoriSystem.resetStatistics = function() {
  logger.info(this.MODULE_NAME, 'Reset statistiche Favori System');

  const initTime = this._statistics.initTime;
  const macrosCreated = this._statistics.macrosCreated;

  this._statistics = {
    initTime,
    favoriRequested: 0,
    favoriByType: {},
    favoriGranted: 0,
    favoriDenied: 0,
    debtCreated: 0,
    debtPaid: 0,
    freeFavoriUsed: 0,
    paidFavoriUsed: 0,
    otherBandFavori: 0,
    favoriExecuted: 0,
    debtTotal: 0,
    debtOutstanding: 0,
    dialogsOpened: 0,
    macrosCreated,
    chatCommandsExecuted: 0,
    errors: []
  };

  // Re-inizializza contatori per tipo favore
  if (this._state.instance) {
    Object.keys(this._state.instance.favoriTypes).forEach(type => {
      this._statistics.favoriByType[type] = 0;
    });
  }
};

/**
 * Ottiene tipi favori disponibili
 * @static
 * @returns {Object} Database favori
 * @example
 * const favori = FavoriSystem.getFavoriTypes();
 */
FavoriSystem.getFavoriTypes = function() {
  return this._state.instance?.favoriTypes || {};
};

/**
 * Richiede favore via API statica
 * @static
 * @async
 * @param {Actor} actor - Attore
 * @returns {Promise<void>}
 * @example
 * await FavoriSystem.requestFavoreViaAPI(actor);
 */
FavoriSystem.requestFavoreViaAPI = async function(actor) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return;
  }
  return await this._state.instance.openFavoreRequestDialog(actor);
};

/**
 * Mostra status favori via API statica
 * @static
 * @param {Actor} actor - Attore
 * @example
 * FavoriSystem.showStatusViaAPI(actor);
 */
FavoriSystem.showStatusViaAPI = function(actor) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return;
  }
  return this._state.instance.showFavoriStatus(actor);
};

/**
 * Apre dialog pagamento debiti via API statica
 * @static
 * @async
 * @param {Actor} actor - Attore
 * @returns {Promise<void>}
 * @example
 * await FavoriSystem.payDebtViaAPI(actor);
 */
FavoriSystem.payDebtViaAPI = async function(actor) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return;
  }
  return await this._state.instance.openDebtPaymentDialog(actor);
};

/**
 * Mostra report completo
 * @static
 * @example
 * FavoriSystem.showReport();
 */
FavoriSystem.showReport = function() {
  const stats = this.getStatistics();
  const status = this.getStatus();

  console.group(`🎁 ${this.MODULE_NAME} Report v${this.VERSION}`);
  console.log('Status:', status);
  console.log('Statistiche:', stats);
  console.groupEnd();

  ui.notifications.info(
    `🎁 Report Favori: ${stats.favoriRequested} richiesti, ${stats.favoriGranted} concessi, ${stats.debtOutstanding} mo debito`
  );
};

// Export per compatibilità
if (typeof module !== 'undefined') {
  module.exports = FavoriSystem;
}

// Export ES6
export default FavoriSystem;
export { FavoriSystem };