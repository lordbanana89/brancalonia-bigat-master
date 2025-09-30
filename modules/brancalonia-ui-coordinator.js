/**
 * BRANCALONIA UI COORDINATOR
 * Sistema centralizzato per coordinare tutte le modifiche UI all'actor sheet
 * Risolve conflitti tra moduli e garantisce ordine di esecuzione corretto
 */

class BrancaloniaUICoordinator {
  static ID = 'brancalonia-bigat';
  static VERSION = '10.1.0';

  // Registro delle modifiche UI per evitare conflitti
  static registry = {
    tabs: [],
    sections: [],
    fields: [],
    css: [],
    hooks: new Map()
  };

  /**
   * Inizializza il coordinatore UI
   */
  static initialize() {
    console.log('🎨 Brancalonia UI Coordinator | Initializing');

    // Registra hook centralizzato per actor sheet
    this._registerCentralHook();

    // Registra sistema di priorità
    this._setupPrioritySystem();

    // Fix per problemi di compatibilità
    this._applyCompatibilityFixes();

    console.log('✅ UI Coordinator ready');
  }

  /**
   * Hook centralizzato per tutte le modifiche actor sheet
   */
  static _registerCentralHook() {
    // Hook principale per D&D 5e v3.x
    Hooks.on('renderActorSheetV2', async (app, html, data) => {
      await this._processActorSheet(app, html, data);
    });

    // Fallback per versioni precedenti
    Hooks.on('renderActorSheet', async (app, html, data) => {
      // Solo se non è già stato processato da renderActorSheetV2
      if (!html[0]?.dataset.brancaloniaProcessed) {
        await this._processActorSheet(app, html, data);
      }
    });

    // Hook specifici per character/NPC
    Hooks.on('renderActorSheet5eCharacter', async (app, html, data) => {
      if (!html[0]?.dataset.brancaloniaProcessed) {
        await this._processActorSheet(app, html, data, 'character');
      }
    });

    Hooks.on('renderActorSheet5eNPC', async (app, html, data) => {
      if (!html[0]?.dataset.brancaloniaProcessed) {
        await this._processActorSheet(app, html, data, 'npc');
      }
    });
  }

  /**
   * Processa l'actor sheet con tutte le modifiche ordinate
   */
  static async _processActorSheet(app, html, data, forceType = null) {
    const actor = app.actor;
    if (!actor) return;

    // Marca come processato per evitare duplicazioni
    const element = html[0] || html;
    element.dataset.brancaloniaProcessed = 'true';

    // Determina tipo actor
    const actorType = forceType || actor.type;

    console.log(`🎭 Processing ${actorType} sheet for: ${actor.name}`);

    try {
      // 1. FASE PREPARAZIONE - Setup base
      await this._phase1_PrepareSheet(html, actor, data);

      // 2. FASE STRUTTURA - Modifiche strutturali (tabs, sezioni)
      await this._phase2_ModifyStructure(html, actor, data);

      // 3. FASE CONTENUTO - Aggiunta contenuti Brancalonia
      await this._phase3_AddContent(html, actor, data);

      // 4. FASE STYLING - Applicazione stili
      await this._phase4_ApplyStyling(html, actor, data);

      // 5. FASE EVENTI - Binding event listeners
      await this._phase5_BindEvents(html, actor, data);

      // 6. FASE FINALIZZAZIONE - Cleanup e ottimizzazioni
      await this._phase6_Finalize(html, actor, data);

    } catch (error) {
      console.error('❌ UI Coordinator | Error processing sheet:', error);
      ui.notifications.error(`Errore UI: ${error.message}`);
    }
  }

  /**
   * FASE 1: Preparazione base sheet
   */
  static async _phase1_PrepareSheet(html, actor, data) {
    // Aggiungi classi base
    html.addClass('brancalonia-sheet');
    html.addClass(`brancalonia-${actor.type}`);

    // Fix jQuery/HTMLElement compatibility
    const element = html[0] || html;

    // Rimuovi classi conflittuali
    element.classList.remove('legacy-sheet');

    // Setup data attributes
    element.dataset.actorId = actor.id;
    element.dataset.brancaloniaVersion = this.VERSION;
  }

  /**
   * FASE 2: Modifica struttura (tabs, layout)
   */
  static async _phase2_ModifyStructure(html, actor, data) {
    // Trova navigation tabs
    const nav = html.find('.sheet-navigation, .tabs, nav.sheet-tabs');

    if (nav.length && actor.type === 'character') {
      // Aggiungi tabs Brancalonia in ordine corretto
      const tabsToAdd = [
        { id: 'infamia', label: 'Infamia', icon: 'fas fa-skull', priority: 10 },
        { id: 'compagnia', label: 'Compagnia', icon: 'fas fa-users', priority: 20 },
        { id: 'haven', label: 'Rifugio', icon: 'fas fa-home', priority: 30 },
        { id: 'lavori', label: 'Lavori', icon: 'fas fa-coins', priority: 40 },
        { id: 'malefatte', label: 'Malefatte', icon: 'fas fa-balance-scale', priority: 50 },
        { id: 'privilegi', label: 'Privilegi', icon: 'fas fa-crown', priority: 60 }
      ];

      // Ordina per priorità
      tabsToAdd.sort((a, b) => a.priority - b.priority);

      // Aggiungi solo se non esistono già
      tabsToAdd.forEach(tab => {
        if (!nav.find(`[data-tab="${tab.id}"]`).length) {
          const tabHtml = `
            <a class="item" data-tab="${tab.id}" data-tooltip="${tab.label}">
              <i class="${tab.icon}"></i>
              <span class="tab-label">${tab.label}</span>
            </a>
          `;
          nav.append(tabHtml);
        }
      });
    }
  }

  /**
   * FASE 3: Aggiunta contenuti Brancalonia
   */
  static async _phase3_AddContent(html, actor, data) {
    const sheetBody = html.find('.sheet-body');
    if (!sheetBody.length) return;

    // Contenuti per ogni tab
    const contents = {
      infamia: () => this._createInfamiaContent(actor),
      compagnia: () => this._createCompagniaContent(actor),
      haven: () => this._createHavenContent(actor),
      lavori: () => this._createLavoriContent(actor),
      malefatte: () => this._createMalefatteContent(actor),
      privilegi: () => this._createPrivilegiContent(actor)
    };

    // Aggiungi contenuti solo se non esistono
    for (const [tabId, contentFn] of Object.entries(contents)) {
      if (!sheetBody.find(`.tab[data-tab="${tabId}"]`).length) {
        const content = await contentFn();
        sheetBody.append(`
          <section class="tab" data-tab="${tabId}" data-group="primary">
            ${content}
          </section>
        `);
      }
    }

    // Fix per contenuti esistenti mal posizionati
    this._fixExistingContent(html, actor);
  }

  /**
   * FASE 4: Applicazione styling coordinato
   */
  static async _phase4_ApplyStyling(html, actor, data) {
    // Rimuovi stili inline problematici
    html.find('[style*="!important"]').each(function() {
      const element = $(this);
      const style = element.attr('style');
      if (style) {
        // Rimuovi solo !important mantenendo gli stili validi
        const cleanStyle = style.replace(/!important/g, '');
        element.attr('style', cleanStyle);
      }
    });

    // Applica tema Brancalonia se attivo
    if (game.settings.get(this.ID, 'enableTheme') !== false) {
      html.addClass('theme-brancalonia');
      html.addClass('italian-renaissance');
    }

    // Fix per altezze e overflow
    this._fixLayoutIssues(html);
  }

  /**
   * FASE 5: Binding eventi coordinato
   */
  static async _phase5_BindEvents(html, actor, data) {
    // Rimuovi listener duplicati
    html.off('.brancalonia');

    // Bind eventi con namespace per evitare conflitti
    html.on('click.brancalonia', '[data-action]', (event) => {
      const action = event.currentTarget.dataset.action;
      this._handleAction(action, actor, event);
    });

    // Tab switching
    html.on('click.brancalonia', '.tabs .item', (event) => {
      const tab = event.currentTarget.dataset.tab;
      this._switchTab(html, tab);
    });
  }

  /**
   * FASE 6: Finalizzazione e cleanup
   */
  static async _phase6_Finalize(html, actor, data) {
    // Rimuovi elementi duplicati
    this._removeDuplicates(html);

    // Fix scroll e overflow
    this._fixScrolling(html);

    // Trigger evento custom per altri moduli
    Hooks.callAll('brancaloniaSheetReady', app, html, data);
  }

  /* -------------------------------------------- */
  /*  Helper Methods                              */
  /* -------------------------------------------- */

  static _createInfamiaContent(actor) {
    const infamia = actor.getFlag(this.ID, 'infamia') || 0;
    const level = this._getInfamiaLevel(infamia);

    return `
      <div class="infamia-tracker">
        <h3 class="section-header">
          <i class="fas fa-skull"></i>
          Livello Infamia
        </h3>

        <div class="infamia-display">
          <div class="infamia-value">${infamia}</div>
          <div class="infamia-level">${level.name}</div>
        </div>

        <div class="infamia-bar">
          <div class="infamia-fill" style="width: ${Math.min(100, infamia)}%"></div>
        </div>

        <div class="infamia-controls">
          <button data-action="infamia-add" data-value="1">
            <i class="fas fa-plus"></i> +1
          </button>
          <button data-action="infamia-add" data-value="5">
            <i class="fas fa-plus"></i> +5
          </button>
          <button data-action="infamia-subtract" data-value="1">
            <i class="fas fa-minus"></i> -1
          </button>
          <button data-action="infamia-subtract" data-value="5">
            <i class="fas fa-minus"></i> -5
          </button>
        </div>

        <div class="infamia-effects">
          <h4>Effetti Attuali:</h4>
          <ul>
            ${level.effects.map(e => `<li>${e}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  static _createCompagniaContent(actor) {
    const compagniaId = actor.getFlag(this.ID, 'compagniaId');
    const compagnia = compagniaId ? game.actors.get(compagniaId) : null;

    if (!compagnia) {
      return `
        <div class="compagnia-empty">
          <h3>Nessuna Compagnia</h3>
          <p>Non fai parte di nessuna compagnia.</p>
          <button data-action="join-compagnia">
            <i class="fas fa-users"></i> Unisciti a una Compagnia
          </button>
        </div>
      `;
    }

    return `
      <div class="compagnia-info">
        <h3>${compagnia.name}</h3>
        <div class="compagnia-members">
          <h4>Membri:</h4>
          <ul>
            ${compagnia.getFlag(this.ID, 'members')?.map(id => {
              const member = game.actors.get(id);
              return member ? `<li>${member.name}</li>` : '';
            }).join('') || '<li>Nessun membro</li>'}
          </ul>
        </div>
        <button data-action="leave-compagnia">
          <i class="fas fa-sign-out-alt"></i> Lascia Compagnia
        </button>
      </div>
    `;
  }

  static _createHavenContent(actor) {
    const haven = actor.getFlag(this.ID, 'haven') || {};

    return `
      <div class="haven-info">
        <h3>Il Tuo Rifugio</h3>
        <div class="haven-details">
          <p><strong>Nome:</strong> ${haven.name || 'Nessun rifugio'}</p>
          <p><strong>Tipo:</strong> ${haven.type || 'N/A'}</p>
          <p><strong>Livello:</strong> ${haven.level || 0}</p>
        </div>
        <button data-action="manage-haven">
          <i class="fas fa-home"></i> Gestisci Rifugio
        </button>
      </div>
    `;
  }

  static _createLavoriContent(actor) {
    const jobs = actor.getFlag(this.ID, 'activeJobs') || [];

    return `
      <div class="lavori-list">
        <h3>Lavori Sporchi Attivi</h3>
        ${jobs.length > 0 ? `
          <ul class="job-list">
            ${jobs.map(job => `
              <li class="job-item">
                <strong>${job.name}</strong>
                <span class="job-reward">${job.reward} du</span>
                <button data-action="complete-job" data-job-id="${job.id}">
                  Completa
                </button>
              </li>
            `).join('')}
          </ul>
        ` : '<p>Nessun lavoro attivo</p>'}
        <button data-action="find-job">
          <i class="fas fa-search"></i> Cerca Lavoro
        </button>
      </div>
    `;
  }

  static _createMalefatteContent(actor) {
    const malefatte = actor.getFlag(this.ID, 'malefatte') || [];

    return `
      <div class="malefatte-list">
        <h3>Le Tue Malefatte</h3>
        ${malefatte.length > 0 ? `
          <ul>
            ${malefatte.map(m => `
              <li>
                <strong>${m.name}</strong>
                <span class="malefatta-date">${m.date}</span>
                <span class="infamia-gain">+${m.infamia} Infamia</span>
              </li>
            `).join('')}
          </ul>
        ` : '<p>Nessuna malefatta registrata</p>'}
      </div>
    `;
  }

  static _createPrivilegiContent(actor) {
    // Trova il background del personaggio
    const background = actor.items.find(i => i.type === 'background');

    if (!background) {
      return `
        <div class="privilegi-empty">
          <h3>Nessun Background</h3>
          <p>Il personaggio non ha un background selezionato.</p>
          <p><em>Aggiungi un background per sbloccare i privilegi speciali!</em></p>
        </div>
      `;
    }

    // Ottieni i privilegi del background
    const bgName = background.name.toLowerCase().replace(/\s+/g, '_');
    const privileges = this._getBackgroundPrivileges(bgName, background);

    return `
      <div class="privilegi-info">
        <h3>Privilegi di ${background.name}</h3>

        <div class="privilege-header">
          <img src="${background.img || 'icons/svg/mystery-man.svg'}" alt="${background.name}">
          <div class="privilege-description">
            <p>${background.system?.description?.value || 'Nessuna descrizione disponibile.'}</p>
          </div>
        </div>

        <div class="privilege-details">
          <h4>Privilegi Speciali:</h4>
          ${privileges.length > 0 ? `
            <ul class="privilege-list">
              ${privileges.map(p => `
                <li class="privilege-item ${p.active ? 'active' : ''}">
                  <i class="${p.icon}"></i>
                  <div>
                    <strong>${p.name}</strong>
                    <p>${p.description}</p>
                    ${p.bonus ? `<span class="bonus">Bonus: ${p.bonus}</span>` : ''}
                  </div>
                  ${p.toggleable ? `
                    <button data-action="toggle-privilege" data-privilege="${p.id}">
                      ${p.active ? 'Disattiva' : 'Attiva'}
                    </button>
                  ` : ''}
                </li>
              `).join('')}
            </ul>
          ` : '<p>Nessun privilegio speciale per questo background.</p>'}
        </div>

        <div class="privilege-actions">
          <button data-action="refresh-privileges">
            <i class="fas fa-sync"></i> Aggiorna Privilegi
          </button>
          <button data-action="show-privilege-help">
            <i class="fas fa-question-circle"></i> Aiuto
          </button>
        </div>
      </div>
    `;
  }

  static _getBackgroundPrivileges(bgName, background) {
    // Mappatura privilegi per background
    const privilegesMap = {
      ambulante: [
        {
          id: 'storie-strada',
          name: 'Storie della Strada',
          description: '+1 alle Strade che non vanno da nessuna parte',
          icon: 'fas fa-road',
          bonus: '+1 Intrattenere, +1 Storia',
          active: true,
          toggleable: false
        }
      ],
      attaccabrighe: [
        {
          id: 'slot-mossa',
          name: 'Rissaiolo',
          description: 'Slot mossa extra nelle Risse da Taverna',
          icon: 'fas fa-fist-raised',
          bonus: '+1 Slot Mossa',
          active: true,
          toggleable: false
        }
      ],
      azzeccagarbugli: [
        {
          id: 'risolvere-guai',
          name: 'Risolvere Guai',
          description: 'Può annullare Malefatte pagando ducati',
          icon: 'fas fa-scroll',
          bonus: 'Costo: 50 du per Malefatta',
          active: true,
          toggleable: true
        }
      ],
      brado: [
        {
          id: 'dimestichezza-selvatica',
          name: 'Dimestichezza Selvatica',
          description: 'Evita incontri ostili con bestie selvagge',
          icon: 'fas fa-paw',
          bonus: 'Bestie neutrali se non provocate',
          active: true,
          toggleable: false
        }
      ],
      'cacciatore di reliquie': [
        {
          id: 'studioso-reliquie',
          name: 'Studioso di Reliquie',
          description: 'Esperto in storia e religione',
          icon: 'fas fa-cross',
          bonus: '+1 Religione, +1 Storia',
          active: true,
          toggleable: false
        }
      ],
      duro: [
        {
          id: 'faccia-duro',
          name: 'Faccia da Duro',
          description: 'Taglia conta come +1 livello per intimidire',
          icon: 'fas fa-skull-crossbones',
          bonus: '+1 Taglia effettiva',
          active: true,
          toggleable: false
        }
      ]
    };

    return privilegesMap[bgName] || [];
  }

  static _getInfamiaLevel(value) {
    if (value >= 100) return { name: 'Nemico Pubblico', effects: ['Taglia enorme', 'Kill on sight'] };
    if (value >= 75) return { name: 'Fuorilegge', effects: ['Taglia maggiore', 'Bandito dalle città'] };
    if (value >= 50) return { name: 'Ricercato', effects: ['Taglia minore', '-2 Persuasione'] };
    if (value >= 25) return { name: 'Mal Visto', effects: ['Guardie sospettose', '-1 Persuasione'] };
    if (value >= 10) return { name: 'Poco Noto', effects: ['Piccoli sconti dai criminali'] };
    return { name: 'Sconosciuto', effects: [] };
  }

  static _handleAction(action, actor, event) {
    switch(action) {
      case 'infamia-add':
        const addValue = parseInt(event.currentTarget.dataset.value) || 1;
        const current = actor.getFlag(this.ID, 'infamia') || 0;
        actor.setFlag(this.ID, 'infamia', current + addValue);
        break;

      case 'infamia-subtract':
        const subValue = parseInt(event.currentTarget.dataset.value) || 1;
        const curr = actor.getFlag(this.ID, 'infamia') || 0;
        actor.setFlag(this.ID, 'infamia', Math.max(0, curr - subValue));
        break;

      // Altri action handlers...
    }
  }

  static _switchTab(html, tabId) {
    // Switch active tab
    html.find('.tabs .item').removeClass('active');
    html.find(`.tabs .item[data-tab="${tabId}"]`).addClass('active');

    // Switch content
    html.find('.tab').removeClass('active');
    html.find(`.tab[data-tab="${tabId}"]`).addClass('active');
  }

  static _fixExistingContent(html, actor) {
    // Fix per contenuti mal posizionati da altri moduli

    // Sposta infamia tracker se in posizione errata
    const infamiaWrong = html.find('.infamia-tracker:not(.tab [data-tab="infamia"] .infamia-tracker)');
    if (infamiaWrong.length) {
      const infamiaTab = html.find('.tab[data-tab="infamia"]');
      if (infamiaTab.length) {
        infamiaWrong.appendTo(infamiaTab);
      }
    }
  }

  static _fixLayoutIssues(html) {
    // Fix altezze
    const sheetBody = html.find('.sheet-body');
    if (sheetBody.length) {
      sheetBody.css({
        'max-height': 'calc(100vh - 200px)',
        'overflow-y': 'auto'
      });
    }

    // Fix tabs container
    const tabs = html.find('.sheet-tabs');
    if (tabs.length) {
      tabs.css({
        'flex-wrap': 'wrap',
        'gap': '0.25rem'
      });
    }
  }

  static _fixScrolling(html) {
    // Assicura che ogni tab abbia scroll indipendente
    html.find('.tab').each(function() {
      $(this).css({
        'overflow-y': 'auto',
        'max-height': '100%'
      });
    });
  }

  static _removeDuplicates(html) {
    // Rimuovi elementi duplicati creati da hook multipli
    const seen = new Set();
    html.find('[data-brancalonia-element]').each(function() {
      const element = $(this);
      const id = element.data('brancalonia-element');
      if (seen.has(id)) {
        element.remove();
      } else {
        seen.add(id);
      }
    });
  }

  /**
   * Setup sistema di priorità per modifiche
   */
  static _setupPrioritySystem() {
    // Permetti ai moduli di registrare le loro modifiche con priorità
    window.BrancaloniaUI = {
      register: (moduleId, modifications, priority = 100) => {
        this.registry.hooks.set(moduleId, {
          modifications,
          priority
        });
      }
    };
  }

  /**
   * Fix per problemi di compatibilità noti
   */
  static _applyCompatibilityFixes() {
    // Fix per D&D 5e v3.x
    if (game.system.version?.startsWith('3.')) {
      CONFIG.Actor.sheetClasses.character['dnd5e.ActorSheet5eCharacter'].cls.prototype._renderOuter =
        new Proxy(CONFIG.Actor.sheetClasses.character['dnd5e.ActorSheet5eCharacter'].cls.prototype._renderOuter, {
          apply: async (target, thisArg, args) => {
            const result = await target.apply(thisArg, args);
            // Aggiungi marker per evitare processamento multiplo
            if (result[0]) {
              result[0].dataset.brancaloniaCompatFixed = 'true';
            }
            return result;
          }
        });
    }
  }
}

// Inizializzazione - DEVE eseguire in init per essere disponibile agli altri moduli
Hooks.once('init', () => {
  BrancaloniaUICoordinator.initialize();
});

// Export globale
window.BrancaloniaUICoordinator = BrancaloniaUICoordinator;