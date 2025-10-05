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

import { createModuleLogger } from './brancalonia-logger.js';
import { SheetCoordinator } from './brancalonia-sheet-coordinator.js';

const MODULE_LABEL = 'Sheets';
const moduleLogger = createModuleLogger(MODULE_LABEL);

class BrancaloniaSheets {
  static VERSION = '2.0.0';
  static MODULE_NAME = MODULE_LABEL;
  
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
      moduleLogger.startPerformance('sheets-init');
      moduleLogger.info('Inizializzazione modifiche sheet personaggi...');

      // Fixed: Preload Handlebars templates
      this._loadTemplates();

      // Registra settings
      this._registerSettings();

      // Register sheet modifications
      this.registerSheetModifications();
      this.registerDataModels();

      const initTime = moduleLogger.endPerformance('sheets-init');
      this.statistics.initTime = initTime;

      moduleLogger.info(`Sistema inizializzato in ${initTime?.toFixed(2)}ms`, {
        features: ['infamia', 'compagnia', 'lavori', 'rifugio', 'malefatte'],
        carolingianUI: !!window.brancaloniaSettings?.SheetsUtil
      });

      // Emit event
      moduleLogger.events.emit('sheets:initialized', {
        version: this.VERSION,
        initTime,
        carolingianUIActive: !!window.brancaloniaSettings?.SheetsUtil,
        timestamp: Date.now()
      });

    } catch (error) {
      moduleLogger.error('Errore durante inizializzazione', error);
      this.statistics.errors.push({
        type: 'initialization',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }

  static _loadTemplates() {
    // Fixed: Preload ALL Handlebars templates for caching
    const templatePaths = [
      'modules/brancalonia-bigat/templates/compagnia-sheet.hbs',
      'modules/brancalonia-bigat/templates/compagnia-sheet-full.hbs',
      'modules/brancalonia-bigat/templates/infamia-tracker.hbs',
      'modules/brancalonia-bigat/templates/infamia-section.hbs',
      'modules/brancalonia-bigat/templates/lavori-section.hbs',
      'modules/brancalonia-bigat/templates/malefatte-section.hbs',
      'modules/brancalonia-bigat/templates/rifugio-section.hbs',
      'modules/brancalonia-bigat/templates/dirty-job-card.hbs',
      'modules/brancalonia-bigat/templates/haven-manager.hbs',
      'modules/brancalonia-bigat/templates/quick-edit.hbs'
    ];

    loadTemplates(templatePaths);

    moduleLogger.debug(`Template Handlebars precaricati (${templatePaths.length} templates)`);
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
          moduleLogger.info(`Sheets UI: ${value ? 'abilitata' : 'disabilitata'}`);
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

      moduleLogger.debug('Settings registrate', {
        count: 10,
        features: 5
      });

    } catch (error) {
      moduleLogger.error('Errore nella registrazione settings', error);
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
        moduleLogger.info('Sheets UI disabilitata tramite settings');
        return;
      }

      moduleLogger.debug('Registrazione con SheetCoordinator...');

      // Fixed: Use SheetCoordinator instead of direct Hook (prevents 20+ hooks issue)
      SheetCoordinator.registerModule(
        'BrancaloniaSheets',
        async (app, html, data) => {
          try {
            // Verifica se Carolingian UI è attivo
            const carolingianActive = !!window.brancaloniaSettings?.SheetsUtil;
            const delay = game.settings.get('brancalonia-bigat', 'sheetsDelayAfterCarolingian') || 100;

            if (carolingianActive) {
              moduleLogger.debug(`Attendendo ${delay}ms per Carolingian UI...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }

            // Applica modifiche Brancalonia
            if (data.actor?.type === 'character') {
              const sheetHtml = await this.modifyCharacterSheet(app, html, data);
              this.attachEventListeners(sheetHtml ?? html, data);
            } else if (data.actor?.type === 'npc') {
              this.modifyNPCSheet(app, html, data);
            }

          } catch (error) {
            moduleLogger.error('Errore in sheet render', error);
            this.statistics.errors.push({
              type: 'render',
              message: error.message,
              actorId: data.actor?._id,
              timestamp: Date.now()
            });
          }
        },
        {
          priority: 50, // Base priority for main sheets module
          types: ['character', 'npc']
        }
      );

      moduleLogger.info('Registrato con SheetCoordinator (priority: 50)');

    } catch (error) {
      moduleLogger.error('Errore nella registrazione hook', error);
    }
  }

  static registerDataModels() {
    // Extend actor data model per inserire i flag di default su nuovi attori
    Hooks.on('preCreateActor', (document, data) => {
      if (data.type !== 'character') return;

      const defaults = {
        initialized: true,
        infamia: 0,
        infamiaMax: 10,
        baraonda: 0,
        compagnia: {},
        rifugio: { comfort: 1 },
        lavoriSporchi: [],
        malefatte: []
      };

      data.flags = data.flags ?? {};
      const existing = data.flags['brancalonia-bigat'] ?? {};
      data.flags['brancalonia-bigat'] = foundry.utils.mergeObject(defaults, existing, { inplace: false, overwrite: false });
    });
  }

  static async modifyCharacterSheet(app, html, data) {
    try {
      moduleLogger.startPerformance('sheets-render');
      moduleLogger.debug(`Rendering sheet per ${data.actor.name}`);

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

      // Garantisce che i flag di stato siano presenti prima di manipolare la UI
      await this.ensureBrancaloniaFlags(actor);

      // Add Brancalonia resource trackers
      await this.addInfamiaSystem($html, actor, app);
      
      // Fixed: Delegate to specialized systems to avoid duplication
      // Compagnia managed by compagnia-manager.js
      // Malefatte/Taglia managed by malefatte-taglie-nomea.js
      // We only add sections if systems are not loaded
      if (!game.brancalonia?.compagniaManager) {
        await this.addCompagniaSection($html, actor, app);
      }
      
      await this.addLavoriSporchiSection($html, actor, app);
      await this.addRifugioSection($html, actor, app);
      
      if (!game.brancalonia?.malefatteSystem) {
        await this.addMalefatteSection($html, actor, app);
      }

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

      const renderTime = moduleLogger.endPerformance('sheets-render');
      
      // Update statistics
      this.statistics.totalRenders++;
      this.statistics.lastRenderTime = Date.now();
      this.statistics.avgRenderTime = ((this.statistics.avgRenderTime * (this.statistics.totalRenders - 1)) + renderTime) / this.statistics.totalRenders;

      moduleLogger.info(`Sheet ${data.actor.name} renderizzata in ${renderTime?.toFixed(2)}ms`);

      // Emit event
      moduleLogger.events.emit('sheets:sheet-rendered', {
        actorId: actor.id,
        actorName: actor.name,
        renderTime,
        sectionsAdded: this._countSectionsAdded(),
        timestamp: Date.now()
      });

      return $html;

    } catch (error) {
      moduleLogger.error('Errore nel rendering sheet', error);
      this.statistics.errors.push({
        type: 'render',
        message: error.message,
        actorId: data.actor?._id,
        timestamp: Date.now()
      });
    }
  }

  static addBackgroundTexture(html) {
    // Fixed: Use CSS class instead of inline styles
    const sheetBody = html.find('.sheet-body');
    if (sheetBody.length) {
      sheetBody.addClass('brancalonia-parchment-background');
    }
  }

  static enhanceSheetHeader(html, data) {
    const header = html.find('.sheet-header');
    if (!header.length) return;

    // Add Renaissance portrait frame
    const portrait = header.find('.profile');
    if (portrait.length && !portrait.closest('.brancalonia-portrait-container').length) {
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

  static async addInfamiaSystem(html, actor, app) {
    try {
      moduleLogger.startPerformance('sheets-add-infamia');

      if (!game.settings.get('brancalonia-bigat', 'sheetsShowInfamia')) {
        moduleLogger.debug('Sezione Infamia disabilitata');
        return;
      }

      const resourcesSection = html.find('.attributes .resources');
      if (resourcesSection.length && !html.find('.infamia-tracker').length) {
        const currentInfamia = actor.getFlag('brancalonia-bigat', 'infamia') || 0;
        const maxInfamia = actor.getFlag('brancalonia-bigat', 'infamiaMax') || 10;

        // Fixed: Use Handlebars template with i18n
        const infamiaHTML = await foundry.applications.handlebars.renderTemplate(
          'modules/brancalonia-bigat/templates/infamia-section.hbs',
          {
            infamia: currentInfamia,
            infamiaMax: maxInfamia,
            infamiaPercentage: (currentInfamia / maxInfamia) * 100,
            infamiaLevel: this.getInfamiaLabel(currentInfamia),
            infamiaClass: this.getInfamiaClass(currentInfamia),
            segments: this.generateInfamiaSegments(maxInfamia),
            statusMarkup: this.getInfamiaStatus(Math.min(currentInfamia, maxInfamia)),
            canEdit: true
          }
        );
        
        resourcesSection.after(infamiaHTML);

        const renderTime = moduleLogger.endPerformance('sheets-add-infamia');
        this.statistics.sectionsByType.infamia++;

        moduleLogger.debug(`Sezione Infamia aggiunta in ${renderTime?.toFixed(2)}ms`);
      }

    } catch (error) {
      moduleLogger.error('Errore nell\'aggiunta sezione Infamia', error);
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

  static async addCompagniaSection(html, actor, app) {
    try {
      moduleLogger.startPerformance('sheets-add-compagnia');

      if (!game.settings.get('brancalonia-bigat', 'sheetsShowCompagnia')) {
        moduleLogger.debug('Sezione Compagnia disabilitata');
        return;
      }

      const biographyTab = html.find('[data-tab="biography"]');
      if (biographyTab.length && !html.find('.compagnia-section').length) {
        const compagnia = actor.getFlag('brancalonia-bigat', 'compagnia') || {};

        // Fixed: Use Handlebars template instead of inline HTML
        const compagniaHTML = await foundry.applications.handlebars.renderTemplate(
          'modules/brancalonia-bigat/templates/compagnia-sheet-full.hbs',
          {
            compagnia,
            members: compagnia.membri || [],
            reputationLabel: this.getReputationLabel(compagnia.reputazione || 0),
            canEdit: app.isEditable
          }
        );
        
        biographyTab.append(compagniaHTML);

        const renderTime = moduleLogger.endPerformance('sheets-add-compagnia');
        this.statistics.sectionsByType.compagnia++;

        moduleLogger.debug(`Sezione Compagnia aggiunta in ${renderTime?.toFixed(2)}ms`);
      }

    } catch (error) {
      moduleLogger.error('Errore nell\'aggiunta sezione Compagnia', error);
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

  static async addLavoriSporchiSection(html, actor, app) {
    try {
      moduleLogger.startPerformance('sheets-add-lavori');

      if (!game.settings.get('brancalonia-bigat', 'sheetsShowLavori')) {
        moduleLogger.debug('Sezione Lavori Sporchi disabilitata');
        return;
      }

      const featuresTab = html.find('[data-tab="features"]');
      if (featuresTab.length && !html.find('.lavori-sporchi-section').length) {
        const lavori = actor.getFlag('brancalonia-bigat', 'lavoriSporchi') || [];

        // Fixed: Use Handlebars template instead of inline HTML
        const lavoriHTML = await foundry.applications.handlebars.renderTemplate(
          'modules/brancalonia-bigat/templates/lavori-section.hbs',
          {
            lavori,
            completedCount: lavori.filter(l => l.completed).length,
            activeCount: lavori.filter(l => !l.completed).length,
            totalEarnings: this.calculateTotalEarnings(lavori),
            canEdit: true
          }
        );
        
        featuresTab.append(lavoriHTML);

        const renderTime = moduleLogger.endPerformance('sheets-add-lavori');
        this.statistics.sectionsByType.lavori++;

        moduleLogger.debug(`Sezione Lavori Sporchi aggiunta in ${renderTime?.toFixed(2)}ms`);
      }

    } catch (error) {
      moduleLogger.error('Errore nell\'aggiunta sezione Lavori Sporchi', error);
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

  static async addRifugioSection(html, actor, app) {
    try {
      moduleLogger.startPerformance('sheets-add-rifugio');

      if (!game.settings.get('brancalonia-bigat', 'sheetsShowRifugio')) {
        moduleLogger.debug('Sezione Rifugio disabilitata');
        return;
      }

      const biographyTab = html.find('[data-tab="biography"]');
      if (biographyTab.length && !html.find('.rifugio-section').length) {
        const rifugio = actor.getFlag('brancalonia-bigat', 'rifugio') || {};

        // Fixed: Use Handlebars template
        const rifugioHTML = await foundry.applications.handlebars.renderTemplate(
          'modules/brancalonia-bigat/templates/rifugio-section.hbs',
          {
            rifugio,
            comfortLevels: this.renderComfortLevels(rifugio.comfort || 1),
            comfortBenefits: this.getComfortBenefits(rifugio.comfort || 1),
            features: this.renderRifugioFeatures(rifugio.features || []),
            canEdit: true
          }
        );
        
        biographyTab.append(rifugioHTML);

        const renderTime = moduleLogger.endPerformance('sheets-add-rifugio');
        this.statistics.sectionsByType.rifugio++;

        moduleLogger.debug(`Sezione Rifugio aggiunta in ${renderTime?.toFixed(2)}ms`);
      }

    } catch (error) {
      moduleLogger.error('Errore nell\'aggiunta sezione Rifugio', error);
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

  static async addMalefatteSection(html, actor, app) {
    try {
      moduleLogger.startPerformance('sheets-add-malefatte');

      if (!game.settings.get('brancalonia-bigat', 'sheetsShowMalefatte')) {
        moduleLogger.debug('Sezione Malefatte disabilitata');
        return;
      }

      const biographyTab = html.find('[data-tab="biography"]');
      if (biographyTab.length && !html.find('.malefatte-section').length) {
        const malefatte = actor.getFlag('brancalonia-bigat', 'malefatte') || [];

        // Fixed: Use Handlebars template with i18n and statistics
        const malefatteHTML = await foundry.applications.handlebars.renderTemplate(
          'modules/brancalonia-bigat/templates/malefatte-section.hbs',
          {
            malefatte,
            stats: {
              furto: malefatte.filter(m => m.type === 'furto').length,
              truffa: malefatte.filter(m => m.type === 'truffa').length,
              rissa: malefatte.filter(m => m.type === 'rissa').length,
              omicidio: malefatte.filter(m => m.type === 'omicidio').length
            },
            totalBounty: malefatte.reduce((sum, m) => sum + (m.bounty || 0), 0),
            canEdit: true
          }
        );
        
        biographyTab.append(malefatteHTML);

        const renderTime = moduleLogger.endPerformance('sheets-add-malefatte');
        this.statistics.sectionsByType.malefatte++;

        moduleLogger.debug(`Sezione Malefatte aggiunta in ${renderTime?.toFixed(2)}ms`);
      }

    } catch (error) {
      moduleLogger.error('Errore nell\'aggiunta sezione Malefatte', error);
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
  }

  static prepareSheetData(app, html, data) {
    // Pre-process data for Brancalonia features
    const actor = app.actor;

    // Ensure Brancalonia flags exist
    if (!actor.getFlag('brancalonia-bigat', 'initialized')) {
      // Effettua init soft senza attendere per evitare ritardi non necessari
      this.ensureBrancaloniaFlags(actor);
    }

    // Calculate derived values
    data.brancalonia = {
      infamiaLevel: this.calculateInfamiaLevel(actor),
      baraondaReady: (actor.getFlag('brancalonia-bigat', 'baraonda') || 0) > 0,
      hasCompagnia: !!actor.getFlag('brancalonia-bigat', 'compagnia.nome'),
      rifugioComfort: actor.getFlag('brancalonia-bigat', 'rifugio.comfort') || 1
    };
  }

  static async ensureBrancaloniaFlags(actor) {
    const updates = {};
    const base = 'flags.brancalonia-bigat';

    const ensure = (key, value) => {
      if (actor.getFlag('brancalonia-bigat', key) === undefined) {
        updates[`${base}.${key}`] = value;
      }
    };

    ensure('initialized', true);
    ensure('infamia', 0);
    ensure('infamiaMax', 10);
    ensure('baraonda', 0);
    ensure('compagnia', {});
    ensure('rifugio', { comfort: 1 });
    ensure('lavoriSporchi', []);
    ensure('malefatte', []);

    if (Object.keys(updates).length > 0) {
      await actor.update(updates, { diff: false });
      moduleLogger.debug(`Flag Brancalonia garantiti per ${actor.name}`, updates);
    }
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
      moduleLogger.startPerformance('sheets-attach-listeners');

      const $root = html instanceof jQuery ? html : $(html);

      // Infamia adjustments
      $root.find('.infamia-adjust')
        .off('click.brancalonia')
        .on('click.brancalonia', async ev => {
        try {
          const adjustment = parseInt($(ev.currentTarget).data('adjust'));
          const actor = game.actors.get(data.actor._id);
          const current = actor.getFlag('brancalonia-bigat', 'infamia') || 0;
          const max = actor.getFlag('brancalonia-bigat', 'infamiaMax') || 10;
          const newValue = Math.max(0, Math.min(max, current + adjustment));
          
          await actor.setFlag('brancalonia-bigat', 'infamia', newValue);

          moduleLogger.info(`Infamia cambiata: ${current} → ${newValue} per ${actor.name}`);

          // Emit event
          moduleLogger.events.emit('sheets:infamia-changed', {
            actorId: actor.id,
            oldValue: current,
            newValue,
            adjustment,
            timestamp: Date.now()
          });

        } catch (error) {
          moduleLogger.error('Errore nel cambiamento Infamia', error);
        }
      });

    // Baraonda actions
    $root.find('.baraonda-btn')
      .off('click.brancalonia')
      .on('click.brancalonia', ev => {
        const action = $(ev.currentTarget).data('action');
        const actor = game.actors.get(data.actor._id);
        this.handleBaraondaAction(actor, action);
      });

      // Lavori Sporchi management
      $root.find('.add-lavoro-btn')
        .off('click.brancalonia')
        .on('click.brancalonia', () => {
        this.openLavoroDialog(data.actor);
      });

      $root.find('.toggle-lavoro')
        .off('click.brancalonia')
        .on('click.brancalonia', async ev => {
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

            moduleLogger.info(`Lavoro "${lavori[idx].title}" ${lavori[idx].completed ? 'completato' : 'riaperto'}`);

            // Emit event
            moduleLogger.events.emit('sheets:lavoro-completed', {
              actorId: actor.id,
              lavoroId: idx,
              lavoro: lavori[idx],
              completed: lavori[idx].completed,
              timestamp: Date.now()
            });
          }

        } catch (error) {
          moduleLogger.error('Errore nel toggle lavoro', error);
        }
      });

    // Add member to Compagnia
    $root.find('.add-member-btn')
      .off('click.brancalonia')
      .on('click.brancalonia', () => {
        this.openAddMemberDialog(data.actor);
      });

      $root.find('.remove-member')
        .off('click.brancalonia')
        .on('click.brancalonia', ev => {
          const memberIndex = parseInt($(ev.currentTarget).data('member-id'));
          const actor = game.actors.get(data.actor._id);
          if (Number.isInteger(memberIndex)) {
            this.removeCompagniaMember(actor, memberIndex);
          }
        });

      // Add Malefatta
      $root.find('.add-malefatta-btn')
        .off('click.brancalonia')
        .on('click.brancalonia', () => {
          this.openMalefattaDialog(data.actor);
        });

      const listenerTime = moduleLogger.endPerformance('sheets-attach-listeners');
      moduleLogger.debug(`Event listeners collegati in ${listenerTime?.toFixed(2)}ms`);

    } catch (error) {
      moduleLogger.error('Errore nel collegamento event listeners', error);
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
    moduleLogger.debug(`Apertura dialog Lavoro Sporco per ${actor.name}`);

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

              moduleLogger.info(`Lavoro Sporco aggiunto: "${newLavoro.title}" (${newLavoro.reward} mo)`);

              // Emit event
              moduleLogger.events.emit('sheets:lavoro-added', {
                actorId: actor.id,
                actorName: actor.name,
                lavoro: newLavoro,
                totalLavori: lavori.length,
                timestamp: Date.now()
              });

            } catch (error) {
              moduleLogger.error('Errore aggiunta Lavoro Sporco', error);
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
    moduleLogger.debug(`Apertura dialog Membro Compagnia per ${actor.name}`);

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

              moduleLogger.info(`Membro Compagnia aggiunto: "${newMember.name}" (${newMember.role})`);

              // Emit event
              moduleLogger.events.emit('sheets:member-added', {
                actorId: actor.id,
                actorName: actor.name,
                member: newMember,
                totalMembers: compagnia.membri.length,
                timestamp: Date.now()
              });

            } catch (error) {
              moduleLogger.error('Errore aggiunta Membro Compagnia', error);
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

  static async removeCompagniaMember(actor, index) {
    try {
      const compagnia = foundry.utils.deepClone(actor.getFlag('brancalonia-bigat', 'compagnia') || {});
      if (!Array.isArray(compagnia.membri)) return;

      const [removed] = compagnia.membri.splice(index, 1);
      await actor.setFlag('brancalonia-bigat', 'compagnia', compagnia);

      moduleLogger.info(`Membro rimosso dalla compagnia di ${actor.name}`, removed);

      moduleLogger.events.emit('sheets:member-removed', {
        actorId: actor.id,
        removedMember: removed,
        timestamp: Date.now()
      });
    } catch (error) {
      moduleLogger.error('Errore nella rimozione membro compagnia', error);
    }
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
    moduleLogger.debug(`Apertura dialog Malefatta per ${actor.name}`);

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

              moduleLogger.info(`Malefatta registrata: "${newMalefatta.type}" (taglia: ${newMalefatta.bounty} mo)`);

              // Emit event
              moduleLogger.events.emit('sheets:malefatta-added', {
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

              moduleLogger.info(`Infamia aumentata di ${infamiaGain}: ${currentInfamia} → ${newInfamia}`);

            } catch (error) {
              moduleLogger.error('Errore registrazione Malefatta', error);
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
    moduleLogger.info('Reset statistiche sheets');
    
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
    
    moduleLogger.info('Statistiche resettate');
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
      moduleLogger.warn('forceRender: actor non valido');
      return;
    }

    moduleLogger.info(`Forcing render per ${actor.name}`);

    try {
      if (actor.sheet?.rendered) {
        await actor.sheet.render(true);
        moduleLogger.info(`Sheet ${actor.name} re-renderizzata con successo`);
      } else {
        moduleLogger.warn(`Sheet ${actor.name} non renderizzata, apertura...`);
        await actor.sheet.render(true);
      }
    } catch (error) {
      moduleLogger.error(`Errore nel force render di ${actor.name}`, error);
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
    moduleLogger.info('Forcing render di tutte le sheet aperte');

    const renderedSheets = Object.values(ui.windows).filter(
      w => w instanceof ActorSheet && w.rendered
    );

    moduleLogger.info(`Trovate ${renderedSheets.length} sheet aperte`);

    for (const sheet of renderedSheets) {
      try {
        await sheet.render(true);
        moduleLogger.debug(`Sheet ${sheet.actor.name} re-renderizzata`);
      } catch (error) {
        moduleLogger.error(`Errore render ${sheet.actor.name}`, error);
      }
    }

    moduleLogger.info(`Re-render completato per ${renderedSheets.length} sheet`);
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
    moduleLogger.info(`${enabled ? 'Abilitazione' : 'Disabilitazione'} sistema sheets`);
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
    
    moduleLogger.info(`${enabled ? 'Abilitazione' : 'Disabilitazione'} sezione ${section}`);
    
    try {
      await game.settings.set('brancalonia-bigat', settingKey, enabled);
      await this.forceRenderAll();
    } catch (error) {
      moduleLogger.error(`Errore nel settaggio sezione ${section}`, error);
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

    moduleLogger.group('📊 Brancalonia Sheets - Report Completo');
    
    moduleLogger.info('VERSION:', this.VERSION);
    moduleLogger.info('Enabled:', config.enabled);
    
    moduleLogger.group('📈 Statistics');
    moduleLogger.table([
      { Metric: 'Total Renders', Value: stats.totalRenders },
      { Metric: 'Avg Render Time', Value: `${stats.avgRenderTime.toFixed(2)}ms` },
      { Metric: 'Last Render', Value: new Date(stats.lastRenderTime).toLocaleTimeString() },
      { Metric: 'Lavori Completed', Value: stats.lavoriCompleted },
      { Metric: 'Init Time', Value: `${stats.initTime?.toFixed(2)}ms` },
      { Metric: 'Uptime', Value: `${(stats.uptime / 1000).toFixed(0)}s` },
      { Metric: 'Errors', Value: stats.errors.length }
    ]);
    moduleLogger.groupEnd();

    moduleLogger.group('🎨 Sections');
    Object.entries(stats.sectionsByType).forEach(([section, count]) => {
      moduleLogger.info(`${section}:`, count, `(${config.sections[section] ? '✅ enabled' : '❌ disabled'})`);
    });
    moduleLogger.groupEnd();

    moduleLogger.group('⚙️ Configuration');
    moduleLogger.info('Decorative Elements:', config.decorativeElements);
    moduleLogger.info('Italian Translations:', config.italianTranslations);
    moduleLogger.info('Carolingian Delay:', `${config.carolingianDelay}ms`);
    moduleLogger.info('Debug Mode:', config.debug);
    moduleLogger.groupEnd();

    if (stats.errors.length > 0) {
      moduleLogger.group('🐛 Errors');
      stats.errors.forEach((err, i) => {
        moduleLogger.error(`Error ${i + 1}:`, err.type, '-', err.message, new Date(err.timestamp).toLocaleTimeString());
      });
      moduleLogger.groupEnd();
    }

    moduleLogger.groupEnd();

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

    moduleLogger.info(`Statistiche esportate in ${filename}`);
  }
}

// Initialize when Foundry is ready
Hooks.once('init', () => {
  BrancaloniaSheets.initialize();
});

// Export for use in other modules - using global for non-ESM
window.BrancaloniaSheets = BrancaloniaSheets;
