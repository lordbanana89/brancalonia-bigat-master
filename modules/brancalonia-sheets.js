/**
 * BRANCALONIA CHARACTER SHEET MODIFICATIONS v2.0.0
 * Advanced character sheet customization for Italian Renaissance gameplay
 * Integrates Brancalonia-specific mechanics with D&D 5e system
 * 
 * Features:
 * - Sistema Infamia (reputation tracking)
 * - Compagnia Manager (party management)
 * - Lavori Sporchi (dirty jobs tracking)
 * - Rifugio/Haven (hideout management)
 * - Malefatte (crime registry)
 * - Event emitters (9 eventi)
 * - Performance tracking (8 ops)
 * - Statistiche estese
 * - API pubblica completa
 */

import logger from './brancalonia-logger.js';

class BrancaloniaSheets {
  static VERSION = '2.0.0';
  static MODULE_NAME = 'Sheets';
  
  static statistics = {
    totalRenders: 0,
    sectionsByType: {
      infamia: 0,
      compagnia: 0,
      lavori: 0,
      rifugio: 0,
      malefatte: 0
    },
    lavoriAdded: 0,
    lavoriCompleted: 0,
    malefatteRegistered: 0,
    compagniaMembersAdded: 0,
    rifugioUpgrades: 0,
    avgRenderTime: 0,
    lastRenderTime: 0,
    initTime: 0,
    errors: []
  };
  
  static eventHistory = [];
  static MAX_HISTORY = 50;

  static initialize() {
    try {
      logger.startPerformance('sheets-init');
      logger.info(this.MODULE_NAME, 'Inizializzazione modifiche sheet personaggi...');

      // Registra settings
      this._registerSettings();

      // Register sheet modifications
      this.registerSheetModifications();
      this.registerSheetListeners();
      this.registerDataModels();

      const initTime = logger.endPerformance('sheets-init');
      this.statistics.initTime = initTime;

      logger.info(this.MODULE_NAME, `Sistema inizializzato in ${initTime?.toFixed(2)}ms`, {
        features: ['infamia', 'compagnia', 'lavori', 'rifugio', 'malefatte'],
        carolingianUI: !!window.brancaloniaSettings?.SheetsUtil
      });

      // Emit event
      logger.events.emit('sheets:initialized', {
        version: this.VERSION,
        initTime,
        carolingianUIActive: !!window.brancaloniaSettings?.SheetsUtil,
        timestamp: Date.now()
      });

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore durante inizializzazione', error);
      this.statistics.errors.push({
        type: 'initialization',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  static _registerSettings() {
    try {
      // Master switch
      game.settings.register('brancalonia-bigat', 'enableBrancaloniaSheets', {
        name: 'Abilita UI Personalizzata Brancalonia',
        hint: 'Attiva le modifiche UI custom per le schede personaggio',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
          logger.info(this.MODULE_NAME, `Sheets UI: ${value ? 'abilitata' : 'disabilitata'}`);
          if (value) {
            ui.notifications.info('Ricarica la pagina per applicare le modifiche UI');
          }
        }
      });

      // Feature toggles
      const features = [
        { key: 'sheetsShowInfamia', name: 'Mostra Sistema Infamia', default: true },
        { key: 'sheetsShowCompagnia', name: 'Mostra Sezione Compagnia', default: true },
        { key: 'sheetsShowLavori', name: 'Mostra Lavori Sporchi', default: true },
        { key: 'sheetsShowRifugio', name: 'Mostra Sezione Rifugio', default: true },
        { key: 'sheetsShowMalefatte', name: 'Mostra Registro Malefatte', default: true }
      ];

      features.forEach(feature => {
        game.settings.register('brancalonia-bigat', feature.key, {
          name: feature.name,
          hint: 'Mostra questa sezione nelle schede personaggio',
          scope: 'world',
          config: true,
          type: Boolean,
          default: feature.default
        });
      });

      // UI preferences
      game.settings.register('brancalonia-bigat', 'sheetsDecorativeElements', {
        name: 'Elementi Decorativi Rinascimentali',
        hint: 'Mostra cornici, ornamenti e decorazioni rinascimentali',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true
      });

      game.settings.register('brancalonia-bigat', 'sheetsItalianTranslations', {
        name: 'Traduzioni Italiane UI',
        hint: 'Usa traduzioni italiane per elementi D&D 5e standard',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true
      });

      // Technical settings
      game.settings.register('brancalonia-bigat', 'sheetsDelayAfterCarolingian', {
        name: 'Delay Carolingian UI (ms)',
        hint: 'Tempo di attesa dopo Carolingian UI prima di aggiungere contenuto Brancalonia',
        scope: 'world',
        config: true,
        type: Number,
        default: 100,
        range: { min: 0, max: 500, step: 50 }
      });

      game.settings.register('brancalonia-bigat', 'debugBrancaloniaSheets', {
        name: 'Debug Sheets',
        hint: 'Abilita logging dettagliato per il sistema sheets',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false
      });

      logger.debug(this.MODULE_NAME, 'Settings registrate', {
        count: 10,
        features: 5
      });

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore nella registrazione settings', error);
      this.statistics.errors.push({
        type: 'settings',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  static registerSheetModifications() {
    try {
      if (!game.settings.get('brancalonia-bigat', 'enableBrancaloniaSheets')) {
        logger.info(this.MODULE_NAME, 'Sheets UI disabilitata tramite settings');
        return;
      }

      logger.debug(this.MODULE_NAME, 'Registrazione modifiche sheet...');

      // Hook renderActorSheet con delay per Carolingian UI
      Hooks.on('renderActorSheet', async (app, html, data) => {
        try {
          // Verifica se Carolingian UI è attivo
          const carolingianActive = !!window.brancaloniaSettings?.SheetsUtil;
          const delay = game.settings.get('brancalonia-bigat', 'sheetsDelayAfterCarolingian') || 100;

          if (carolingianActive) {
            logger.debug(this.MODULE_NAME, `Attendendo ${delay}ms per Carolingian UI...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          // Applica modifiche Brancalonia
          if (data.actor?.type === 'character') {
            await this.modifyCharacterSheet(app, html, data);
          } else if (data.actor?.type === 'npc') {
            this.modifyNPCSheet(app, html, data);
          }

        } catch (error) {
          logger.error(this.MODULE_NAME, 'Errore in renderActorSheet hook', error);
          this.statistics.errors.push({
            type: 'render-hook',
            message: error.message,
            actorId: data.actor?._id,
            timestamp: Date.now()
          });
        }
      });

      logger.info(this.MODULE_NAME, 'Hook renderActorSheet registrato con successo');

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore nella registrazione hook', error);
    }
  }

  static registerSheetListeners() {
    // Register custom event listeners for Brancalonia elements
    Hooks.on('renderActorSheet', (app, html, data) => {
      if (data.actor?.type === 'character') {
        this.attachEventListeners(html, data);
      }
    });
  }

  static registerDataModels() {
    // Extend actor data model for Brancalonia fields
    // Fixed: Made async to properly await initialization
    Hooks.on('preCreateActor', async (document, data, options, userId) => {
      if (data.type === 'character') {
        await this.initializeBrancaloniaData(document, data);
      }
    });
  }

  static async modifyCharacterSheet(app, html, data) {
    try {
      logger.startPerformance('sheets-render');
      logger.debug(this.MODULE_NAME, `Rendering sheet per ${data.actor.name}`);

      const actor = app.actor;

      // Ensure html is jQuery wrapped (handle array from v13)
      let $html;
      if (html instanceof jQuery) {
        $html = html;
      } else if (Array.isArray(html)) {
        $html = $(html[0]);
      } else {
        $html = $(html);
      }

      // Add Brancalonia class to sheet
      $html.addClass('brancalonia-character-sheet');
      $html.addClass('italian-renaissance');

      // Add background texture
      this.addBackgroundTexture($html);

      // Modify header section
      this.enhanceSheetHeader($html, data);

      // Add Brancalonia resource trackers
      this.addInfamiaSystem($html, actor);
      this.addCompagniaSection($html, actor);
      this.addLavoriSporchiSection($html, actor);
      this.addRifugioSection($html, actor);
      this.addMalefatteSection($html, actor);

      // Enhance existing sections
      this.enhanceAbilitiesSection($html, actor);
      this.enhanceInventorySection($html, actor);
      this.enhanceFeatureSection($html, actor);

      // Add Italian terminology
      if (game.settings.get('brancalonia-bigat', 'sheetsItalianTranslations')) {
        this.translateUIElements($html);
      }

      // Add decorative elements
      if (game.settings.get('brancalonia-bigat', 'sheetsDecorativeElements')) {
        this.addDecorativeElements($html);
      }

      const renderTime = logger.endPerformance('sheets-render');
      
      // Update statistics
      this.statistics.totalRenders++;
      this.statistics.lastRenderTime = Date.now();
      this.statistics.avgRenderTime = ((this.statistics.avgRenderTime * (this.statistics.totalRenders - 1)) + renderTime) / this.statistics.totalRenders;

      logger.info(this.MODULE_NAME, `Sheet ${data.actor.name} renderizzata in ${renderTime?.toFixed(2)}ms`);

      // Emit event
      logger.events.emit('sheets:sheet-rendered', {
        actorId: actor.id,
        actorName: actor.name,
        renderTime,
        sectionsAdded: this._countSectionsAdded(),
        timestamp: Date.now()
      });

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore nel rendering sheet', error);
      this.statistics.errors.push({
        type: 'render',
        message: error.message,
        actorId: data.actor?._id,
        timestamp: Date.now()
      });
    }
  }

  static addBackgroundTexture(html) {
    const sheetBody = html.find('.sheet-body');
    if (sheetBody.length) {
      sheetBody.css({
        'background-image': 'linear-gradient(rgba(244, 228, 188, 0.9), rgba(255, 248, 220, 0.9))',
        'background-blend-mode': 'multiply',
        'background-size': 'cover',
        'background-position': 'center'
      });
    }
  }

  static enhanceSheetHeader(html, data) {
    const header = html.find('.sheet-header');
    if (!header.length) return;

    // Add Renaissance portrait frame
    const portrait = header.find('.profile');
    if (portrait.length) {
      portrait.wrap(`
                <div class="brancalonia-portrait-container">
                    <div class="portrait-frame renaissance">
                        <div class="frame-ornament top-left">⚜</div>
                        <div class="frame-ornament top-right">⚜</div>
                        <div class="frame-ornament bottom-left">❦</div>
                        <div class="frame-ornament bottom-right">❦</div>
                    </div>
                </div>
            `);
    }

    // Add character title section
    const charName = header.find('.char-name');
    if (charName.length && !header.find('.character-titles').length) {
      charName.after(`
                <div class="character-titles">
                    <input type="text" name="flags.brancalonia.soprannome"
                           placeholder="Soprannome (Nickname)"
                           value="${data.actor.flags?.brancalonia?.soprannome || ''}"
                           class="soprannome-input" />
                    <input type="text" name="flags.brancalonia.titolo"
                           placeholder="Titolo o Epiteto"
                           value="${data.actor.flags?.brancalonia?.titolo || ''}"
                           class="titolo-input" />
                </div>
            `);
    }
  }

  static addInfamiaSystem(html, actor) {
    try {
      logger.startPerformance('sheets-add-infamia');

      if (!game.settings.get('brancalonia-bigat', 'sheetsShowInfamia')) {
        logger.debug(this.MODULE_NAME, 'Sezione Infamia disabilitata');
        return;
      }

      const resourcesSection = html.find('.attributes .resources');
      if (resourcesSection.length && !html.find('.infamia-tracker').length) {
        const currentInfamia = actor.getFlag('brancalonia-bigat', 'infamia') || 0;
        const maxInfamia = actor.getFlag('brancalonia-bigat', 'infamiaMax') || 10;

      const infamiaHTML = `
                <div class="infamia-tracker brancalonia-resource">
                    <div class="resource-header">
                        <h3>
                            <span class="icon">🗡️</span>
                            Infamia
                            <span class="tooltip-anchor" data-tooltip="La tua reputazione nel mondo criminale">ⓘ</span>
                        </h3>
                    </div>
                    <div class="resource-content">
                        <div class="infamia-bar">
                            <div class="infamia-fill" style="width: ${(currentInfamia / maxInfamia) * 100}%"></div>
                            <div class="infamia-segments">
                                ${this.generateInfamiaSegments(maxInfamia)}
                            </div>
                        </div>
                        <div class="infamia-controls">
                            <button class="infamia-adjust" data-adjust="-1" title="Diminuisci Infamia">−</button>
                            <input type="number" class="infamia-value" name="flags.brancalonia-bigat.infamia"
                                   value="${currentInfamia}" min="0" max="${maxInfamia}" />
                            <span class="separator">/</span>
                            <input type="number" class="infamia-max" name="flags.brancalonia-bigat.infamiaMax"
                                   value="${maxInfamia}" min="1" />
                            <button class="infamia-adjust" data-adjust="1" title="Aumenta Infamia">+</button>
                        </div>
                        <div class="infamia-status">
                            ${this.getInfamiaStatus(currentInfamia)}
                        </div>
                    </div>
                </div>
            `;
        resourcesSection.after(infamiaHTML);

        const renderTime = logger.endPerformance('sheets-add-infamia');
        this.statistics.sectionsByType.infamia++;

        logger.debug(this.MODULE_NAME, `Sezione Infamia aggiunta in ${renderTime?.toFixed(2)}ms`);
      }

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore nell\'aggiunta sezione Infamia', error);
      this.statistics.errors.push({
        type: 'section-infamia',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  static generateInfamiaSegments(max) {
    let segments = '';
    for (let i = 1; i <= max; i++) {
      segments += `<div class="segment" data-level="${i}"></div>`;
    }
    return segments;
  }

  static getInfamiaStatus(level) {
    const statuses = [
      { min: 0, max: 2, label: 'Sconosciuto', icon: '👤' },
      { min: 3, max: 5, label: 'Famigerato', icon: '🎭' },
      { min: 6, max: 8, label: 'Temuto', icon: '⚔️' },
      { min: 9, max: 10, label: 'Leggendario', icon: '👑' }
    ];

    const status = statuses.find(s => level >= s.min && level <= s.max);
    return `<span class="status-label">${status.icon} ${status.label}</span>`;
  }

  // BaraondaSystem rimosso - integrato in TavernBrawlSystem
  // Usa la macro "🍺 Gestione Risse" per le risse da taverna

  static addCompagniaSection(html, actor) {
    try {
      logger.startPerformance('sheets-add-compagnia');

      if (!game.settings.get('brancalonia-bigat', 'sheetsShowCompagnia')) {
        logger.debug(this.MODULE_NAME, 'Sezione Compagnia disabilitata');
        return;
      }

      const biographyTab = html.find('[data-tab="biography"]');
      if (biographyTab.length && !html.find('.compagnia-section').length) {
        const compagnia = actor.getFlag('brancalonia-bigat', 'compagnia') || {};

      const compagniaHTML = `
                <div class="compagnia-section brancalonia-section">
                    <div class="section-header ornate">
                        <h2>
                            <span class="icon">⚔️</span>
                            La Compagnia
                            <span class="icon">⚔️</span>
                        </h2>
                    </div>
                    <div class="section-content">
                        <div class="compagnia-info">
                            <div class="field-group">
                                <label>Nome della Compagnia:</label>
                                <input type="text" name="flags.brancalonia-bigat.compagnia.nome"
                                       value="${compagnia.nome || ''}"
                                       placeholder="Es: I Fratelli del Pugnale" />
                            </div>
                            <div class="field-group">
                                <label>Motto:</label>
                                <input type="text" name="flags.brancalonia-bigat.compagnia.motto"
                                       value="${compagnia.motto || ''}"
                                       placeholder="Es: 'Vino, Oro e Gloria!'" />
                            </div>
                            <div class="field-group">
                                <label>Stemma/Simbolo:</label>
                                <textarea name="flags.brancalonia-bigat.compagnia.stemma"
                                          placeholder="Descrivi lo stemma della compagnia..."
                                          rows="3">${compagnia.stemma || ''}</textarea>
                            </div>
                        </div>
                        <div class="compagnia-members">
                            <h4>Membri della Compagnia:</h4>
                            <div class="members-list">
                                ${this.renderCompagniaMembers(compagnia.membri || [])}
                            </div>
                            <button class="add-member-btn">
                                <span class="icon">➕</span> Aggiungi Membro
                            </button>
                        </div>
                        <div class="compagnia-reputation">
                            <h4>Reputazione della Compagnia:</h4>
                            <div class="reputation-tracker">
                                <input type="range" name="flags.brancalonia-bigat.compagnia.reputazione"
                                       min="-10" max="10" value="${compagnia.reputazione || 0}"
                                       class="reputation-slider" />
                                <div class="reputation-labels">
                                    <span class="rep-negative">Infame</span>
                                    <span class="rep-current">${this.getReputationLabel(compagnia.reputazione || 0)}</span>
                                    <span class="rep-positive">Eroica</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        biographyTab.append(compagniaHTML);

        const renderTime = logger.endPerformance('sheets-add-compagnia');
        this.statistics.sectionsByType.compagnia++;

        logger.debug(this.MODULE_NAME, `Sezione Compagnia aggiunta in ${renderTime?.toFixed(2)}ms`);
      }

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore nell\'aggiunta sezione Compagnia', error);
      this.statistics.errors.push({
        type: 'section-compagnia',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  static renderCompagniaMembers(members) {
    if (members.length === 0) {
      return '<p class="no-members">Nessun membro registrato</p>';
    }
    return members.map((member, idx) => `
            <div class="member-entry" data-member-id="${idx}">
                <span class="member-name">${member.name}</span>
                <span class="member-role">${member.role}</span>
                <button class="remove-member" data-member-id="${idx}">✖</button>
            </div>
        `).join('');
  }

  static getReputationLabel(value) {
    if (value <= -7) return 'Maledetti';
    if (value <= -4) return 'Malvisti';
    if (value <= -1) return 'Sospetti';
    if (value === 0) return 'Sconosciuti';
    if (value <= 3) return 'Conosciuti';
    if (value <= 6) return 'Rispettati';
    if (value <= 9) return 'Famosi';
    return 'Leggendari';
  }

  static addLavoriSporchiSection(html, actor) {
    try {
      logger.startPerformance('sheets-add-lavori');

      if (!game.settings.get('brancalonia-bigat', 'sheetsShowLavori')) {
        logger.debug(this.MODULE_NAME, 'Sezione Lavori Sporchi disabilitata');
        return;
      }

      const featuresTab = html.find('[data-tab="features"]');
      if (featuresTab.length && !html.find('.lavori-sporchi-section').length) {
        const lavori = actor.getFlag('brancalonia-bigat', 'lavoriSporchi') || [];

      const lavoriHTML = `
                <div class="lavori-sporchi-section brancalonia-section">
                    <div class="section-header">
                        <h3>
                            <span class="icon">💰</span>
                            Lavori Sporchi
                            <span class="tooltip-anchor" data-tooltip="Missioni e incarichi completati">ⓘ</span>
                        </h3>
                    </div>
                    <div class="section-content">
                        <div class="lavori-summary">
                            <div class="stat-box">
                                <span class="stat-label">Completati:</span>
                                <span class="stat-value">${lavori.filter(l => l.completed).length}</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-label">In Corso:</span>
                                <span class="stat-value">${lavori.filter(l => !l.completed).length}</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-label">Guadagno Totale:</span>
                                <span class="stat-value">${this.calculateTotalEarnings(lavori)} 🪙</span>
                            </div>
                        </div>
                        <div class="lavori-list">
                            <h4>Registro dei Lavori:</h4>
                            ${this.renderLavoriList(lavori)}
                        </div>
                        <div class="lavori-actions">
                            <button class="add-lavoro-btn">
                                <span class="icon">📋</span> Nuovo Lavoro
                            </button>
                            <button class="archive-lavori-btn">
                                <span class="icon">📚</span> Archivia Completati
                            </button>
                        </div>
                    </div>
                </div>
            `;
        featuresTab.append(lavoriHTML);

        const renderTime = logger.endPerformance('sheets-add-lavori');
        this.statistics.sectionsByType.lavori++;

        logger.debug(this.MODULE_NAME, `Sezione Lavori Sporchi aggiunta in ${renderTime?.toFixed(2)}ms`);
      }

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore nell\'aggiunta sezione Lavori Sporchi', error);
      this.statistics.errors.push({
        type: 'section-lavori',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  static calculateTotalEarnings(lavori) {
    return lavori
      .filter(l => l.completed)
      .reduce((total, lavoro) => total + (lavoro.reward || 0), 0);
  }

  static renderLavoriList(lavori) {
    if (lavori.length === 0) {
      return '<p class="no-lavori">Nessun lavoro registrato</p>';
    }

    return `
            <div class="lavori-entries">
                ${lavori.map((lavoro, idx) => `
                    <div class="lavoro-entry ${lavoro.completed ? 'completed' : 'active'}" data-lavoro-id="${idx}">
                        <div class="lavoro-header">
                            <span class="lavoro-title">${lavoro.title}</span>
                            <span class="lavoro-status">${lavoro.completed ? '✅' : '⏳'}</span>
                        </div>
                        <div class="lavoro-details">
                            <span class="lavoro-client">Cliente: ${lavoro.client || 'Sconosciuto'}</span>
                            <span class="lavoro-reward">Ricompensa: ${lavoro.reward || 0} 🪙</span>
                        </div>
                        <div class="lavoro-description">
                            ${lavoro.description || 'Nessuna descrizione'}
                        </div>
                        <div class="lavoro-actions">
                            <button class="edit-lavoro" data-lavoro-id="${idx}">✏️</button>
                            <button class="toggle-lavoro" data-lavoro-id="${idx}">
                                ${lavoro.completed ? '↩️' : '✓'}
                            </button>
                            <button class="delete-lavoro" data-lavoro-id="${idx}">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
  }

  static addRifugioSection(html, actor) {
    try {
      logger.startPerformance('sheets-add-rifugio');

      if (!game.settings.get('brancalonia-bigat', 'sheetsShowRifugio')) {
        logger.debug(this.MODULE_NAME, 'Sezione Rifugio disabilitata');
        return;
      }

      const biographyTab = html.find('[data-tab="biography"]');
      if (biographyTab.length && !html.find('.rifugio-section').length) {
        const rifugio = actor.getFlag('brancalonia-bigat', 'rifugio') || {};

      const rifugioHTML = `
                <div class="rifugio-section brancalonia-section">
                    <div class="section-header ornate">
                        <h2>
                            <span class="icon">🏠</span>
                            Il Rifugio
                            <span class="icon">🏠</span>
                        </h2>
                    </div>
                    <div class="section-content">
                        <div class="rifugio-main">
                            <div class="field-group">
                                <label>Nome del Rifugio:</label>
                                <input type="text" name="flags.brancalonia-bigat.rifugio.nome"
                                       value="${rifugio.nome || ''}"
                                       placeholder="Es: La Taverna del Gatto Nero" />
                            </div>
                            <div class="field-group">
                                <label>Ubicazione:</label>
                                <input type="text" name="flags.brancalonia-bigat.rifugio.ubicazione"
                                       value="${rifugio.ubicazione || ''}"
                                       placeholder="Es: Vicolo dei Ladri, Tarantasia" />
                            </div>
                            <div class="field-group">
                                <label>Tipo di Rifugio:</label>
                                <select name="flags.brancalonia-bigat.rifugio.tipo">
                                    <option value="taverna" ${rifugio.tipo === 'taverna' ? 'selected' : ''}>Taverna</option>
                                    <option value="locanda" ${rifugio.tipo === 'locanda' ? 'selected' : ''}>Locanda</option>
                                    <option value="bordello" ${rifugio.tipo === 'bordello' ? 'selected' : ''}>Bordello</option>
                                    <option value="magazzino" ${rifugio.tipo === 'magazzino' ? 'selected' : ''}>Magazzino</option>
                                    <option value="palazzo" ${rifugio.tipo === 'palazzo' ? 'selected' : ''}>Palazzo Abbandonato</option>
                                    <option value="nave" ${rifugio.tipo === 'nave' ? 'selected' : ''}>Nave</option>
                                    <option value="altro" ${rifugio.tipo === 'altro' ? 'selected' : ''}>Altro</option>
                                </select>
                            </div>
                        </div>
                        <div class="rifugio-comfort">
                            <h4>Livello di Comfort:</h4>
                            <div class="comfort-selector">
                                ${this.renderComfortLevels(rifugio.comfort || 1)}
                            </div>
                            <div class="comfort-benefits">
                                <h5>Benefici del Comfort:</h5>
                                ${this.getComfortBenefits(rifugio.comfort || 1)}
                            </div>
                        </div>
                        <div class="rifugio-features">
                            <h4>Caratteristiche Speciali:</h4>
                            <div class="features-grid">
                                ${this.renderRifugioFeatures(rifugio.features || [])}
                            </div>
                        </div>
                        <div class="rifugio-description">
                            <label>Descrizione:</label>
                            <textarea name="flags.brancalonia-bigat.rifugio.descrizione"
                                      rows="4"
                                      placeholder="Descrivi l'aspetto e l'atmosfera del rifugio...">${rifugio.descrizione || ''}</textarea>
                        </div>
                    </div>
                </div>
            `;
        biographyTab.append(rifugioHTML);

        const renderTime = logger.endPerformance('sheets-add-rifugio');
        this.statistics.sectionsByType.rifugio++;

        logger.debug(this.MODULE_NAME, `Sezione Rifugio aggiunta in ${renderTime?.toFixed(2)}ms`);
      }

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore nell\'aggiunta sezione Rifugio', error);
      this.statistics.errors.push({
        type: 'section-rifugio',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  static renderComfortLevels(currentLevel) {
    const levels = [
      { level: 1, name: 'Squallido', icon: '🕸️' },
      { level: 2, name: 'Modesto', icon: '🪑' },
      { level: 3, name: 'Confortevole', icon: '🛋️' },
      { level: 4, name: 'Lussuoso', icon: '👑' },
      { level: 5, name: 'Principesco', icon: '🏰' }
    ];

    return levels.map(l => `
            <label class="comfort-level ${l.level === currentLevel ? 'selected' : ''}">
                <input type="radio" name="flags.brancalonia-bigat.rifugio.comfort"
                       value="${l.level}" ${l.level === currentLevel ? 'checked' : ''} />
                <span class="comfort-icon">${l.icon}</span>
                <span class="comfort-name">${l.name}</span>
            </label>
        `).join('');
  }

  static getComfortBenefits(level) {
    const benefits = {
      1: 'Riposo Lungo recupera solo metà dei Dadi Vita',
      2: 'Riposo normale, nessun bonus',
      3: '+1 ai tiri di recupero durante il riposo',
      4: '+2 ai tiri di recupero, riposo breve in 30 minuti',
      5: '+3 ai tiri di recupero, ispirazione gratuita dopo riposo lungo'
    };
    return `<p class="comfort-benefit">${benefits[level] || benefits[1]}</p>`;
  }

  static renderRifugioFeatures(features) {
    const availableFeatures = [
      { id: 'cantina', name: 'Cantina Segreta', icon: '🍷' },
      { id: 'armeria', name: 'Armeria', icon: '⚔️' },
      { id: 'laboratorio', name: 'Laboratorio', icon: '⚗️' },
      { id: 'biblioteca', name: 'Biblioteca', icon: '📚' },
      { id: 'prigione', name: 'Prigione', icon: '🔒' },
      { id: 'passaggio', name: 'Passaggio Segreto', icon: '🚪' },
      { id: 'torre', name: 'Torre di Guardia', icon: '🗼' },
      { id: 'stalla', name: 'Stalla', icon: '🐴' }
    ];

    return availableFeatures.map(f => `
            <label class="feature-checkbox">
                <input type="checkbox" name="flags.brancalonia-bigat.rifugio.features"
                       value="${f.id}" ${features.includes(f.id) ? 'checked' : ''} />
                <span class="feature-icon">${f.icon}</span>
                <span class="feature-name">${f.name}</span>
            </label>
        `).join('');
  }

  static addMalefatteSection(html, actor) {
    try {
      logger.startPerformance('sheets-add-malefatte');

      if (!game.settings.get('brancalonia-bigat', 'sheetsShowMalefatte')) {
        logger.debug(this.MODULE_NAME, 'Sezione Malefatte disabilitata');
        return;
      }

      const biographyTab = html.find('[data-tab="biography"]');
      if (biographyTab.length && !html.find('.malefatte-section').length) {
        const malefatte = actor.getFlag('brancalonia-bigat', 'malefatte') || [];

      const malefatteHTML = `
                <div class="malefatte-section brancalonia-section">
                    <div class="section-header">
                        <h3>
                            <span class="icon">📜</span>
                            Registro delle Malefatte
                            <span class="tooltip-anchor" data-tooltip="I crimini e misfatti commessi">ⓘ</span>
                        </h3>
                    </div>
                    <div class="section-content">
                        <div class="malefatte-stats">
                            <div class="crime-counter">
                                <span class="crime-type">Furti: ${malefatte.filter(m => m.type === 'furto').length}</span>
                                <span class="crime-type">Truffe: ${malefatte.filter(m => m.type === 'truffa').length}</span>
                                <span class="crime-type">Risse: ${malefatte.filter(m => m.type === 'rissa').length}</span>
                                <span class="crime-type">Omicidi: ${malefatte.filter(m => m.type === 'omicidio').length}</span>
                            </div>
                        </div>
                        <div class="malefatte-list">
                            ${this.renderMalefatteList(malefatte)}
                        </div>
                        <button class="add-malefatta-btn">
                            <span class="icon">⚖️</span> Registra Malefatta
                        </button>
                    </div>
                </div>
            `;
        biographyTab.append(malefatteHTML);

        const renderTime = logger.endPerformance('sheets-add-malefatte');
        this.statistics.sectionsByType.malefatte++;

        logger.debug(this.MODULE_NAME, `Sezione Malefatte aggiunta in ${renderTime?.toFixed(2)}ms`);
      }

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore nell\'aggiunta sezione Malefatte', error);
      this.statistics.errors.push({
        type: 'section-malefatte',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  static renderMalefatteList(malefatte) {
    if (malefatte.length === 0) {
      return '<p class="no-malefatte">Fedina penale pulita... per ora</p>';
    }

    return malefatte.slice(-5).map((malefatta, idx) => `
            <div class="malefatta-entry">
                <span class="malefatta-date">${malefatta.date || 'Data sconosciuta'}</span>
                <span class="malefatta-type">${this.getMalefattaIcon(malefatta.type)}</span>
                <span class="malefatta-desc">${malefatta.description}</span>
                <span class="malefatta-bounty">${malefatta.bounty || 0} 🪙</span>
            </div>
        `).join('');
  }

  static getMalefattaIcon(type) {
    const icons = {
      furto: '🗝️',
      truffa: '🎭',
      rissa: '🥊',
      omicidio: '🗡️',
      contrabbando: '📦',
      blasfemia: '😈',
      altro: '⚖️'
    };
    return icons[type] || icons.altro;
  }

  static enhanceAbilitiesSection(html, actor) {
    // Add Italian labels to ability scores
    const abilities = {
      str: 'Forza',
      dex: 'Destrezza',
      con: 'Costituzione',
      int: 'Intelligenza',
      wis: 'Saggezza',
      cha: 'Carisma'
    };

    Object.entries(abilities).forEach(([key, label]) => {
      const abilityElement = html.find(`.ability[data-ability="${key}"] .ability-name`);
      if (abilityElement.length) {
        abilityElement.attr('title', label);
      }
    });
  }

  static enhanceInventorySection(html, actor) {
    // Add quality indicators for shoddy equipment
    const items = html.find('.item');
    items.each(function () {
      const item = actor.items.get($(this).data('item-id'));
      if (item?.getFlag('brancalonia-bigat', 'shoddy')) {
        $(this).addClass('shoddy-item');
        $(this).prepend('<span class="quality-indicator shoddy" title="Equipaggiamento Scadente">⚠️</span>');
      }
    });
  }

  static enhanceFeatureSection(html, actor) {
    // Group features by type with Italian categories
    const featuresTab = html.find('[data-tab="features"]');
    if (featuresTab.length) {
      // Add category headers
      const categories = {
        race: 'Stirpe',
        background: 'Background',
        class: 'Classe',
        feat: 'Talenti',
        brancalonia: 'Privilegi di Brancalonia'
      };

      // Reorganize features by category
      Object.entries(categories).forEach(([type, label]) => {
        const features = actor.items.filter(i => i.type === type || i.getFlag('brancalonia-bigat', 'type') === type);
        if (features.length > 0) {
          // Implementation for organizing features
        }
      });
    }
  }

  static translateUIElements(html) {
    // Translate common D&D terms to Italian
    const translations = {
      'Hit Points': 'Punti Ferita',
      'Armor Class': 'Classe Armatura',
      Initiative: 'Iniziativa',
      Speed: 'Velocità',
      'Proficiency Bonus': 'Bonus di Competenza',
      'Spell Save DC': 'CD Tiro Salvezza Incantesimi',
      'Spell Attack': 'Attacco con Incantesimi',
      'Death Saves': 'Tiri Salvezza contro Morte',
      Inspiration: 'Ispirazione',
      'Experience Points': 'Punti Esperienza',
      Skills: 'Abilità',
      Features: 'Privilegi',
      Inventory: 'Inventario',
      Spellbook: 'Libro degli Incantesimi',
      Biography: 'Biografia'
    };

    Object.entries(translations).forEach(([english, italian]) => {
      html.find(`label:contains("${english}")`).each(function () {
        $(this).html($(this).html().replace(english, italian));
      });
    });
  }

  static addDecorativeElements(html) {
    // Add Renaissance decorative flourishes
    const sections = html.find('.sheet-body > div[data-tab]');
    sections.each(function () {
      if (!$(this).find('.section-ornament').length) {
        $(this).prepend('<div class="section-ornament top">❦ ❦ ❦</div>');
        $(this).append('<div class="section-ornament bottom">❦ ❦ ❦</div>');
      }
    });

    // Add corner ornaments to main sections
    const mainSections = html.find('.brancalonia-section');
    mainSections.each(function () {
      $(this).append(`
                <div class="corner-ornaments">
                    <span class="ornament top-left">⚜</span>
                    <span class="ornament top-right">⚜</span>
                    <span class="ornament bottom-left">❧</span>
                    <span class="ornament bottom-right">❧</span>
                </div>
            `);
    });
  }

  static modifyNPCSheet(app, html, data) {
    // Ensure html is jQuery wrapped (handle array from v13)
    let $html;
    if (html instanceof jQuery) {
      $html = html;
    } else if (Array.isArray(html)) {
      $html = $(html[0]);
    } else {
      $html = $(html);
    }

    // Add Brancalonia styling to NPC sheets
    $html.addClass('brancalonia-npc-sheet');

    // Add faction indicator
    const faction = app.actor.getFlag('brancalonia-bigat', 'faction');
    if (faction) {
      const header = $html.find('.sheet-header');
      // Fixed: Guard per prevenire duplicati ad ogni render
      if (!header.find('.npc-faction').length) {
        header.append(`
                <div class="npc-faction">
                    <span class="faction-label">Fazione:</span>
                    <span class="faction-name">${faction}</span>
                </div>
            `);
    }
  }

  static prepareSheetData(app, html, data) {
    // Pre-process data for Brancalonia features
    const actor = app.actor;

    // Ensure Brancalonia flags exist
    if (!actor.getFlag('brancalonia-bigat', 'initialized')) {
      this.initializeBrancaloniaData(actor);
    }

    // Calculate derived values
    data.brancalonia = {
      infamiaLevel: this.calculateInfamiaLevel(actor),
      baraondaReady: (actor.getFlag('brancalonia-bigat', 'baraonda') || 0) > 0,
      hasCompagnia: !!actor.getFlag('brancalonia-bigat', 'compagnia.nome'),
      rifugioComfort: actor.getFlag('brancalonia-bigat', 'rifugio.comfort') || 1
    };
  }

  static async initializeBrancaloniaData(actor, data) {
    // Fixed: Batch update atomico invece di 8 setFlag separati
    // Previene race condition durante actor creation
    await actor.updateSource({
      'flags.brancalonia-bigat': {
        initialized: true,
        infamia: 0,
        infamiaMax: 10,
        baraonda: 0,
        compagnia: {},
        rifugio: { comfort: 1 },
        lavoriSporchi: [],
        malefatte: []
      }
    });
    
    logger.debug(this.MODULE_NAME, `Dati Brancalonia inizializzati per nuovo actor (${data.name || 'Unnamed'})`);
  }

  static calculateInfamiaLevel(actor) {
    const infamia = actor.getFlag('brancalonia-bigat', 'infamia') || 0;
    if (infamia >= 9) return 'legendary';
    if (infamia >= 6) return 'feared';
    if (infamia >= 3) return 'notorious';
    return 'unknown';
  }

  /**
   * Collega gli event listeners alle sezioni custom della sheet
   * 
   * Listeners collegati:
   * - .infamia-adjust: Click per modificare Infamia (+1/-1)
   * - .baraonda-btn: Click per azioni Baraonda
   * - .add-lavoro-btn: Click per aprire dialog nuovo Lavoro Sporco
   * - .toggle-lavoro: Click per completare/riaprire un Lavoro
   * - .add-member-btn: Click per aprire dialog nuovo membro Compagnia
   * - .add-malefatta-btn: Click per aprire dialog nuova Malefatta
   * 
   * Tutti i listeners includono:
   * - Gestione async/await
   * - Try-catch per error handling
   * - Logger calls per debug
   * - Event emission per integrazione
   * 
   * @static
   * @param {jQuery} html - L'HTML della sheet
   * @param {Object} data - I dati della sheet
   * @returns {void}
   * @fires sheets:infamia-changed
   * @fires sheets:lavoro-completed
   */
  static attachEventListeners(html, data) {
    try {
      logger.startPerformance('sheets-attach-listeners');

      // Infamia adjustments
      html.find('.infamia-adjust').click(async ev => {
        try {
          const adjustment = parseInt($(ev.currentTarget).data('adjust'));
          const actor = game.actors.get(data.actor._id);
          const current = actor.getFlag('brancalonia-bigat', 'infamia') || 0;
          const max = actor.getFlag('brancalonia-bigat', 'infamiaMax') || 10;
          const newValue = Math.max(0, Math.min(max, current + adjustment));
          
          await actor.setFlag('brancalonia-bigat', 'infamia', newValue);

          logger.info(this.MODULE_NAME, `Infamia cambiata: ${current} → ${newValue} per ${actor.name}`);

          // Emit event
          logger.events.emit('sheets:infamia-changed', {
            actorId: actor.id,
            oldValue: current,
            newValue,
            adjustment,
            timestamp: Date.now()
          });

        } catch (error) {
          logger.error(this.MODULE_NAME, 'Errore nel cambiamento Infamia', error);
        }
      });

    // Baraonda actions
    html.find('.baraonda-btn').click(ev => {
      const action = $(ev.currentTarget).data('action');
      const actor = game.actors.get(data.actor._id);
      this.handleBaraondaAction(actor, action);
    });

      // Lavori Sporchi management
      html.find('.add-lavoro-btn').click(() => {
        this.openLavoroDialog(data.actor);
      });

      html.find('.toggle-lavoro').click(async ev => {
        try {
          const idx = $(ev.currentTarget).data('lavoro-id');
          const actor = game.actors.get(data.actor._id);
          const lavori = actor.getFlag('brancalonia-bigat', 'lavoriSporchi') || [];
          
          if (lavori[idx]) {
            const wasCompleted = lavori[idx].completed;
            lavori[idx].completed = !wasCompleted;
            await actor.setFlag('brancalonia-bigat', 'lavoriSporchi', lavori);

            // Update statistics
            if (lavori[idx].completed) {
              this.statistics.lavoriCompleted++;
            }

            logger.info(this.MODULE_NAME, `Lavoro "${lavori[idx].title}" ${lavori[idx].completed ? 'completato' : 'riaperto'}`);

            // Emit event
            logger.events.emit('sheets:lavoro-completed', {
              actorId: actor.id,
              lavoroId: idx,
              lavoro: lavori[idx],
              completed: lavori[idx].completed,
              timestamp: Date.now()
            });
          }

        } catch (error) {
          logger.error(this.MODULE_NAME, 'Errore nel toggle lavoro', error);
        }
      });

    // Add member to Compagnia
    html.find('.add-member-btn').click(() => {
      this.openAddMemberDialog(data.actor);
    });

      // Add Malefatta
      html.find('.add-malefatta-btn').click(() => {
        this.openMalefattaDialog(data.actor);
      });

      const listenerTime = logger.endPerformance('sheets-attach-listeners');
      logger.debug(this.MODULE_NAME, `Event listeners collegati in ${listenerTime?.toFixed(2)}ms`);

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore nel collegamento event listeners', error);
      this.statistics.errors.push({
        type: 'event-listeners',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  static handleBaraondaAction(actor, action) {
    switch (action) {
      case 'brawl-start':
        ChatMessage.create({
          content: `<div class="brancalonia-message baraonda-start">
                        <h3>🍺 Baraonda! 🍺</h3>
                        <p><strong>${actor.name}</strong> inizia una rissa da taverna!</p>
                        <p>Che la battaglia abbia inizio!</p>
                    </div>`,
          speaker: ChatMessage.getSpeaker({ actor })
        });
        break;
      case 'spend-point':
        const current = actor.getFlag('brancalonia-bigat', 'baraonda') || 0;
        if (current > 0) {
          actor.setFlag('brancalonia-bigat', 'baraonda', current - 1);
          ChatMessage.create({
            content: `<div class="brancalonia-message baraonda-spend">
                            <p><strong>${actor.name}</strong> spende un Punto Baraonda!</p>
                            <p>Punti rimanenti: ${current - 1}</p>
                        </div>`,
            speaker: ChatMessage.getSpeaker({ actor })
          });
        }
        break;
      case 'reset':
        actor.setFlag('brancalonia-bigat', 'baraonda', 0);
        break;
    }
  }

  /**
   * Apre un dialog per aggiungere un nuovo Lavoro Sporco
   * 
   * Campi del form:
   * - Titolo del Lavoro (text)
   * - Cliente (text)
   * - Ricompensa in monete (number)
   * - Descrizione (textarea)
   * 
   * @static
   * @param {Actor} actor - L'attore a cui aggiungere il lavoro
   * @returns {void}
   * @fires sheets:lavoro-added
   */
  static openLavoroDialog(actor) {
    logger.debug(this.MODULE_NAME, `Apertura dialog Lavoro Sporco per ${actor.name}`);

    new foundry.appv1.sheets.Dialog({
      title: 'Nuovo Lavoro Sporco',
      content: `
                <form>
                    <div class="form-group">
                        <label>Titolo del Lavoro:</label>
                        <input type="text" name="title" />
                    </div>
                    <div class="form-group">
                        <label>Cliente:</label>
                        <input type="text" name="client" />
                    </div>
                    <div class="form-group">
                        <label>Ricompensa (in monete):</label>
                        <input type="number" name="reward" value="0" />
                    </div>
                    <div class="form-group">
                        <label>Descrizione:</label>
                        <textarea name="description" rows="3"></textarea>
                    </div>
                </form>
            `,
      buttons: {
        save: {
          label: 'Aggiungi',
          callback: async (html) => {
            try {
              const formData = new FormData(html[0].querySelector('form'));
              const newLavoro = {
                title: formData.get('title'),
                client: formData.get('client'),
                reward: parseInt(formData.get('reward')),
                description: formData.get('description'),
                completed: false,
                date: new Date().toLocaleDateString('it-IT')
              };

              const lavori = actor.getFlag('brancalonia-bigat', 'lavoriSporchi') || [];
              lavori.push(newLavoro);
              await actor.setFlag('brancalonia-bigat', 'lavoriSporchi', lavori);

              logger.info(this.MODULE_NAME, `Lavoro Sporco aggiunto: "${newLavoro.title}" (${newLavoro.reward} mo)`);

              // Emit event
              logger.events.emit('sheets:lavoro-added', {
                actorId: actor.id,
                actorName: actor.name,
                lavoro: newLavoro,
                totalLavori: lavori.length,
                timestamp: Date.now()
              });

            } catch (error) {
              logger.error(this.MODULE_NAME, 'Errore aggiunta Lavoro Sporco', error);
            }
          }
        },
        cancel: {
          label: 'Annulla'
        }
      },
      default: 'save'
    }).render(true);
  }

  /**
   * Apre un dialog per aggiungere un nuovo membro alla Compagnia
   * 
   * Campi del form:
   * - Nome (text)
   * - Ruolo (select): Capo, Braccio Destro, Picchiatore, Ladro, Truffatore, Spia, Mago, Guaritore
   * 
   * @static
   * @param {Actor} actor - L'attore a cui aggiungere il membro
   * @returns {void}
   * @fires sheets:member-added
   */
  static openAddMemberDialog(actor) {
    logger.debug(this.MODULE_NAME, `Apertura dialog Membro Compagnia per ${actor.name}`);

    new foundry.appv1.sheets.Dialog({
      title: 'Aggiungi Membro alla Compagnia',
      content: `
                <form>
                    <div class="form-group">
                        <label>Nome:</label>
                        <input type="text" name="name" />
                    </div>
                    <div class="form-group">
                        <label>Ruolo:</label>
                        <select name="role">
                            <option value="Capo">Capo</option>
                            <option value="Braccio Destro">Braccio Destro</option>
                            <option value="Picchiatore">Picchiatore</option>
                            <option value="Ladro">Ladro</option>
                            <option value="Truffatore">Truffatore</option>
                            <option value="Spia">Spia</option>
                            <option value="Mago">Mago</option>
                            <option value="Guaritore">Guaritore</option>
                        </select>
                    </div>
                </form>
            `,
      buttons: {
        save: {
          label: 'Aggiungi',
          callback: async (html) => {
            try {
              const formData = new FormData(html[0].querySelector('form'));
              const newMember = {
                name: formData.get('name'),
                role: formData.get('role')
              };

              const compagnia = actor.getFlag('brancalonia-bigat', 'compagnia') || {};
              compagnia.membri = compagnia.membri || [];
              compagnia.membri.push(newMember);
              await actor.setFlag('brancalonia-bigat', 'compagnia', compagnia);

              logger.info(this.MODULE_NAME, `Membro Compagnia aggiunto: "${newMember.name}" (${newMember.role})`);

              // Emit event
              logger.events.emit('sheets:member-added', {
                actorId: actor.id,
                actorName: actor.name,
                member: newMember,
                totalMembers: compagnia.membri.length,
                timestamp: Date.now()
              });

            } catch (error) {
              logger.error(this.MODULE_NAME, 'Errore aggiunta Membro Compagnia', error);
            }
          }
        },
        cancel: {
          label: 'Annulla'
        }
      },
      default: 'save'
    }).render(true);
  }

  /**
   * Apre un dialog per registrare una nuova Malefatta (crimine)
   * 
   * Campi del form:
   * - Tipo di Crimine (select): Furto, Truffa, Rissa, Omicidio, Contrabbando, Blasfemia, Altro
   * - Descrizione (textarea)
   * - Taglia se presente (number)
   * 
   * Effetti collaterali:
   * - Aumenta automaticamente l'Infamia dell'attore (+1 o +2 per omicidio)
   * 
   * @static
   * @param {Actor} actor - L'attore a cui aggiungere la malefatta
   * @returns {void}
   * @fires sheets:malefatta-added
   */
  static openMalefattaDialog(actor) {
    logger.debug(this.MODULE_NAME, `Apertura dialog Malefatta per ${actor.name}`);

    new foundry.appv1.sheets.Dialog({
      title: 'Registra Malefatta',
      content: `
                <form>
                    <div class="form-group">
                        <label>Tipo di Crimine:</label>
                        <select name="type">
                            <option value="furto">Furto</option>
                            <option value="truffa">Truffa</option>
                            <option value="rissa">Rissa</option>
                            <option value="omicidio">Omicidio</option>
                            <option value="contrabbando">Contrabbando</option>
                            <option value="blasfemia">Blasfemia</option>
                            <option value="altro">Altro</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Descrizione:</label>
                        <textarea name="description" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Taglia (se presente):</label>
                        <input type="number" name="bounty" value="0" />
                    </div>
                </form>
            `,
      buttons: {
        save: {
          label: 'Registra',
          callback: async (html) => {
            try {
              const formData = new FormData(html[0].querySelector('form'));
              const newMalefatta = {
                type: formData.get('type'),
                description: formData.get('description'),
                bounty: parseInt(formData.get('bounty')),
                date: new Date().toLocaleDateString('it-IT')
              };

              const malefatte = actor.getFlag('brancalonia-bigat', 'malefatte') || [];
              malefatte.push(newMalefatta);
              await actor.setFlag('brancalonia-bigat', 'malefatte', malefatte);

              logger.info(this.MODULE_NAME, `Malefatta registrata: "${newMalefatta.type}" (taglia: ${newMalefatta.bounty} mo)`);

              // Emit event
              logger.events.emit('sheets:malefatta-added', {
                actorId: actor.id,
                actorName: actor.name,
                malefatta: newMalefatta,
                totalMalefatte: malefatte.length,
                timestamp: Date.now()
              });

              // Update Infamia
              const currentInfamia = actor.getFlag('brancalonia-bigat', 'infamia') || 0;
              const infamiaGain = newMalefatta.type === 'omicidio' ? 2 : 1;
              const newInfamia = Math.min(10, currentInfamia + infamiaGain);
              await actor.setFlag('brancalonia-bigat', 'infamia', newInfamia);

              logger.info(this.MODULE_NAME, `Infamia aumentata di ${infamiaGain}: ${currentInfamia} → ${newInfamia}`);

            } catch (error) {
              logger.error(this.MODULE_NAME, 'Errore registrazione Malefatta', error);
            }
          }
        },
        cancel: {
          label: 'Annulla'
        }
      },
      default: 'save'
    }).render(true);
  }
  // =================================================================
  // PUBLIC API
  // =================================================================

  /**
   * Ottiene le statistiche correnti del sistema sheets
   * 
   * Le statistiche includono:
   * - Total renders effettuati
   * - Counter per tipo di sezione
   * - Tempo medio di rendering
   * - Timestamp ultimo rendering
   * - Lavori completati
   * - Tempo di inizializzazione
   * - Array degli errori
   * - Uptime del sistema
   * - Storia degli ultimi 10 render
   * 
   * @static
   * @returns {SheetsStatistics} Statistiche complete
   * @example
   * const stats = BrancaloniaSheets.getStatistics();
   * console.log(`Total renders: ${stats.totalRenders}`);
   * console.log(`Avg time: ${stats.avgRenderTime.toFixed(2)}ms`);
   */
  static getStatistics() {
    return {
      ...this.statistics,
      uptime: Date.now() - (this.statistics.initTime || Date.now()),
      renderHistory: this.renderHistory.slice(-10) // Ultime 10 render
    };
  }

  /**
   * Resetta le statistiche del sistema
   * 
   * Resetta tutti i counter a 0 mantenendo solo initTime.
   * Utile per test o per ripartire da zero dopo debug.
   * 
   * @static
   * @returns {void}
   * @example
   * BrancaloniaSheets.resetStatistics();
   * console.log('Statistiche resettate!');
   */
  static resetStatistics() {
    logger.info(this.MODULE_NAME, 'Reset statistiche sheets');
    
    const initTime = this.statistics.initTime;
    
    this.statistics = {
      totalRenders: 0,
      sectionsByType: {
        infamia: 0,
        compagnia: 0,
        lavori: 0,
        rifugio: 0,
        malefatte: 0
      },
      avgRenderTime: 0,
      lastRenderTime: 0,
      lavoriCompleted: 0,
      initTime,
      errors: []
    };
    
    this.renderHistory = [];
    
    logger.info(this.MODULE_NAME, 'Statistiche resettate');
  }

  /**
   * Forza il re-rendering di una sheet specifica
   * 
   * Controlla se la sheet è già aperta e la re-renderizza,
   * oppure la apre se non ancora renderizzata.
   * 
   * @static
   * @async
   * @param {Actor} actor - Attore di cui re-renderizzare la sheet
   * @returns {Promise<void>}
   * @example
   * const actor = game.actors.getName("Rosso Maltese");
   * await BrancaloniaSheets.forceRender(actor);
   */
  static async forceRender(actor) {
    if (!actor) {
      logger.warn(this.MODULE_NAME, 'forceRender: actor non valido');
      return;
    }

    logger.info(this.MODULE_NAME, `Forcing render per ${actor.name}`);

    try {
      if (actor.sheet?.rendered) {
        await actor.sheet.render(true);
        logger.info(this.MODULE_NAME, `Sheet ${actor.name} re-renderizzata con successo`);
      } else {
        logger.warn(this.MODULE_NAME, `Sheet ${actor.name} non renderizzata, apertura...`);
        await actor.sheet.render(true);
      }
    } catch (error) {
      logger.error(this.MODULE_NAME, `Errore nel force render di ${actor.name}`, error);
    }
  }

  /**
   * Forza il re-rendering di tutte le sheet aperte
   * 
   * Utile dopo aver modificato le settings o per applicare
   * modifiche globali a tutte le sheet attualmente visualizzate.
   * 
   * @static
   * @async
   * @returns {Promise<void>}
   * @example
   * // Dopo aver abilitato una sezione
   * await game.settings.set('brancalonia-bigat', 'sheetsShowInfamia', true);
   * await BrancaloniaSheets.forceRenderAll();
   */
  static async forceRenderAll() {
    logger.info(this.MODULE_NAME, 'Forcing render di tutte le sheet aperte');

    const renderedSheets = Object.values(ui.windows).filter(
      w => w instanceof ActorSheet && w.rendered
    );

    logger.info(this.MODULE_NAME, `Trovate ${renderedSheets.length} sheet aperte`);

    for (const sheet of renderedSheets) {
      try {
        await sheet.render(true);
        logger.debug(this.MODULE_NAME, `Sheet ${sheet.actor.name} re-renderizzata`);
      } catch (error) {
        logger.error(this.MODULE_NAME, `Errore render ${sheet.actor.name}`, error);
      }
    }

    logger.info(this.MODULE_NAME, `Re-render completato per ${renderedSheets.length} sheet`);
  }

  /**
   * Ottiene la configurazione corrente del sistema
   * 
   * Ritorna tutte le 10 settings in un oggetto strutturato.
   * 
   * @static
   * @returns {SheetsConfiguration} Configurazione settings
   * @example
   * const config = BrancaloniaSheets.getConfiguration();
   * if (config.enabled) {
   *   console.log('Sistema abilitato!');
   *   console.log('Sezioni attive:', Object.values(config.sections).filter(Boolean).length);
   * }
   */
  static getConfiguration() {
    return {
      enabled: game.settings.get('brancalonia-bigat', 'enableBrancaloniaSheets'),
      sections: {
        infamia: game.settings.get('brancalonia-bigat', 'sheetsShowInfamia'),
        compagnia: game.settings.get('brancalonia-bigat', 'sheetsShowCompagnia'),
        lavori: game.settings.get('brancalonia-bigat', 'sheetsShowLavori'),
        rifugio: game.settings.get('brancalonia-bigat', 'sheetsShowRifugio'),
        malefatte: game.settings.get('brancalonia-bigat', 'sheetsShowMalefatte')
      },
      decorativeElements: game.settings.get('brancalonia-bigat', 'sheetsDecorativeElements'),
      italianTranslations: game.settings.get('brancalonia-bigat', 'sheetsItalianTranslations'),
      carolingianDelay: game.settings.get('brancalonia-bigat', 'sheetsDelayAfterCarolingian'),
      debug: game.settings.get('brancalonia-bigat', 'debugBrancaloniaSheets')
    };
  }

  /**
   * Abilita o disabilita il sistema sheets
   * 
   * Quando abilitato, forza il re-rendering di tutte le sheet aperte
   * per applicare immediatamente le modifiche.
   * 
   * @static
   * @async
   * @param {boolean} enabled - True per abilitare, false per disabilitare
   * @returns {Promise<void>}
   * @example
   * // Disabilita temporaneamente il sistema
   * await BrancaloniaSheets.setEnabled(false);
   * // ... fai modifiche ...
   * await BrancaloniaSheets.setEnabled(true);
   */
  static async setEnabled(enabled) {
    logger.info(this.MODULE_NAME, `${enabled ? 'Abilitazione' : 'Disabilitazione'} sistema sheets`);
    await game.settings.set('brancalonia-bigat', 'enableBrancaloniaSheets', enabled);
    
    if (enabled) {
      await this.forceRenderAll();
    }
  }

  /**
   * Abilita o disabilita una sezione specifica
   * 
   * Dopo aver modificato la setting, forza il re-rendering
   * di tutte le sheet aperte per applicare la modifica.
   * 
   * @static
   * @async
   * @param {string} section - Nome sezione ('infamia', 'compagnia', 'lavori', 'rifugio', 'malefatte')
   * @param {boolean} enabled - True per abilitare, false per disabilitare
   * @returns {Promise<void>}
   * @example
   * // Disabilita sezione Malefatte
   * await BrancaloniaSheets.setSectionEnabled('malefatte', false);
   */
  static async setSectionEnabled(section, enabled) {
    const settingKey = `sheetsShow${section.charAt(0).toUpperCase() + section.slice(1)}`;
    
    logger.info(this.MODULE_NAME, `${enabled ? 'Abilitazione' : 'Disabilitazione'} sezione ${section}`);
    
    try {
      await game.settings.set('brancalonia-bigat', settingKey, enabled);
      await this.forceRenderAll();
    } catch (error) {
      logger.error(this.MODULE_NAME, `Errore nel settaggio sezione ${section}`, error);
    }
  }

  /**
   * Mostra un report completo dello stato del sistema nella console
   * 
   * Il report include:
   * - Versione e stato abilitazione
   * - Statistiche dettagliate (tabella formattata)
   * - Contatori per sezione con stato abilitazione
   * - Configurazione completa
   * - Lista errori (se presenti)
   * 
   * Output colorato e organizzato in gruppi collassabili.
   * 
   * @static
   * @returns {SheetsStatistics} Le statistiche (per uso programmatico)
   * @example
   * // Mostra report nella console
   * BrancaloniaSheets.showReport();
   * 
   * @example
   * // Ottieni statistiche per uso programmatico
   * const stats = BrancaloniaSheets.showReport();
   * if (stats.avgRenderTime > 200) {
   *   console.warn('Performance issue detected!');
   * }
   */
  static showReport() {
    const stats = this.getStatistics();
    const config = this.getConfiguration();

    logger.group('📊 Brancalonia Sheets - Report Completo');
    
    logger.info(this.MODULE_NAME, 'VERSION:', this.VERSION);
    logger.info(this.MODULE_NAME, 'Enabled:', config.enabled);
    
    logger.group('📈 Statistics');
    logger.table([
      { Metric: 'Total Renders', Value: stats.totalRenders },
      { Metric: 'Avg Render Time', Value: `${stats.avgRenderTime.toFixed(2)}ms` },
      { Metric: 'Last Render', Value: new Date(stats.lastRenderTime).toLocaleTimeString() },
      { Metric: 'Lavori Completed', Value: stats.lavoriCompleted },
      { Metric: 'Init Time', Value: `${stats.initTime?.toFixed(2)}ms` },
      { Metric: 'Uptime', Value: `${(stats.uptime / 1000).toFixed(0)}s` },
      { Metric: 'Errors', Value: stats.errors.length }
    ]);
    logger.groupEnd();

    logger.group('🎨 Sections');
    Object.entries(stats.sectionsByType).forEach(([section, count]) => {
      logger.info(this.MODULE_NAME, `${section}:`, count, `(${config.sections[section] ? '✅ enabled' : '❌ disabled'})`);
    });
    logger.groupEnd();

    logger.group('⚙️ Configuration');
    logger.info(this.MODULE_NAME, 'Decorative Elements:', config.decorativeElements);
    logger.info(this.MODULE_NAME, 'Italian Translations:', config.italianTranslations);
    logger.info(this.MODULE_NAME, 'Carolingian Delay:', `${config.carolingianDelay}ms`);
    logger.info(this.MODULE_NAME, 'Debug Mode:', config.debug);
    logger.groupEnd();

    if (stats.errors.length > 0) {
      logger.group('🐛 Errors');
      stats.errors.forEach((err, i) => {
        logger.error(this.MODULE_NAME, `Error ${i + 1}:`, err.type, '-', err.message, new Date(err.timestamp).toLocaleTimeString());
      });
      logger.groupEnd();
    }

    logger.groupEnd();

    return stats;
  }

  /**
   * Esporta le statistiche in un file JSON
   * 
   * Genera un file JSON scaricabile con:
   * - Versione modulo
   * - Timestamp esportazione
   * - Statistiche complete
   * - Configurazione corrente
   * - Render history completa
   * 
   * Filename formato: `brancalonia-sheets-stats-[timestamp].json`
   * 
   * @static
   * @returns {void}
   * @example
   * // Esporta statistiche per analisi
   * BrancaloniaSheets.exportStatistics();
   * // File salvato: brancalonia-sheets-stats-1696348800000.json
   */
  static exportStatistics() {
    const stats = this.getStatistics();
    const config = this.getConfiguration();
    
    const exportData = {
      version: this.VERSION,
      timestamp: new Date().toISOString(),
      statistics: stats,
      configuration: config,
      renderHistory: this.renderHistory
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const filename = `brancalonia-sheets-stats-${Date.now()}.json`;

    saveDataToFile(dataStr, 'application/json', filename);

    logger.info(this.MODULE_NAME, `Statistiche esportate in ${filename}`);
  }
}

// Initialize when Foundry is ready
Hooks.once('init', () => {
  BrancaloniaSheets.initialize();
});

// Export for use in other modules - using global for non-ESM
window.BrancaloniaSheets = BrancaloniaSheets;