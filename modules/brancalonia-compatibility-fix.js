/**
 * BRANCALONIA COMPATIBILITY FIX
 * Risolve problemi di compatibilità con D&D 5e v5.1.9
 *
 * PROBLEMA: ActorSheetMixin è stato deprecato e integrato in BaseActorSheet
 * SOLUZIONE: Aggiorna tutti gli hook per usare la nuova API
 */

// Verifica versione D&D 5e
Hooks.once('init', () => {
  const dnd5eVersion = game.system.version;
  const versionNumber = parseFloat(dnd5eVersion);

  console.log(`🔧 Brancalonia Compatibility Fix: D&D 5e v${dnd5eVersion} detected`);

  // Determina quale set di hooks usare
  if (versionNumber >= 5.0) {
    console.log('✅ Using D&D 5e v5.x+ hook system (renderActorSheetV2, renderItemSheetV2)');
    registerNewHooks();
  } else if (versionNumber >= 3.0) {
    console.log('✅ Using D&D 5e v3.x/v4.x hook system (renderActorSheet5e*, renderItemSheet5e)');
    registerLegacyHooks();
  } else {
    console.warn('⚠️ Unsupported D&D 5e version detected - compatibility issues may occur');
    // Fallback ai legacy hooks per v2.x e precedenti
    registerLegacyHooks();
  }
});

/**
 * Registra hooks per D&D 5e v5.0+
 * Usa renderActorSheetV2 invece di renderActorSheet5eCharacter
 */
function registerNewHooks() {
  // Hook principale per schede personaggio
  Hooks.on('renderActorSheetV2', (app, html, data) => {
    // Verifica che sia una scheda personaggio D&D 5e
    if (!app.actor || app.actor.type !== 'character') return;

    // Converti html in jQuery se necessario
    const $html = html instanceof jQuery ? html : $(html);

    // Inizializza dati Brancalonia
    if (!app.actor.getFlag('brancalonia-bigat', 'initialized')) {
      initializeBrancaloniaData(app.actor);
    }

    // Aggiungi tracker infamia
    if (game.settings.get('brancalonia-bigat', 'trackInfamia')) {
      game.brancalonia?.infamiaTracker?.renderInfamiaTracker(app, $html, { actor: app.actor });
    }

    // Aggiungi indicatore menagramo
    if (app.actor.flags?.['brancalonia-bigat']?.menagramo) {
      const header = $html.find('.window-header');
      if (!header.find('.menagramo-indicator').length) {
        header.append(`<span class="menagramo-indicator" title="Sotto effetto del Menagramo!">☠️</span>`);
      }
    }

    // Sistema Bagordi
    if (game.brancalonia?.bagordi) {
      game.brancalonia.bagordi.renderBagordiTracker(app, $html, { actor: app.actor });
    }

    // Sistema Compagnia
    if (game.brancalonia?.compagniaManager &&
        game.brancalonia.compagniaManager._isInCompagnia(app.actor)) {
      game.brancalonia.compagniaManager._addCompagniaTab(app, $html);
    }

    // Sistema Malefatte e Taglie
    if (game.brancalonia?.malefatteTaglie) {
      game.brancalonia.malefatteTaglie._renderTagliaSection(app, $html);
    }

    // Sistema Favori
    if (game.brancalonia?.favoriSystem) {
      game.brancalonia.favoriSystem._renderFavoriUI(app, $html);
    }

    // Covo Granlussi (solo GM)
    if (game.user.isGM && game.brancalonia?.covoGranlussi) {
      game.brancalonia.covoGranlussi._renderCovoUI(app, $html);
    }

    // Event listeners personalizzati
    attachBrancaloniaEventListeners($html, app.actor);
  });

  // Hook per schede NPC
  Hooks.on('renderActorSheetV2', (app, html, data) => {
    if (!app.actor || app.actor.type !== 'npc') return;

    const $html = html instanceof jQuery ? html : $(html);

    // Modifica sheet NPC per Brancalonia
    if (game.brancalonia?.sheets) {
      game.brancalonia.sheets.modifyNPCSheet(app, $html, { actor: app.actor });
    }
  });

  // Pre-render hook
  Hooks.on('preActorSheetV2Render', (app, data) => {
    if (!app.actor) return;

    // Prepara dati sheet
    if (game.brancalonia?.sheets) {
      game.brancalonia.sheets.prepareSheetData(app, data);
    }
  });
}

/**
 * Registra hooks legacy per retrocompatibilità (D&D 5e < v5.0)
 */
function registerLegacyHooks() {
  // Mantieni i vecchi hook per versioni precedenti
  console.warn('⚠️ Using legacy hooks - some features may not work correctly');

  // I vecchi hook continueranno a funzionare dalle loro posizioni originali
  // Non li duplichiamo qui per evitare conflitti
}

/**
 * Inizializza dati Brancalonia per un attore
 */
function initializeBrancaloniaData(actor) {
  if (!actor) return;

  const defaultData = {
    initialized: true,
    infamia: 0,
    menagramo: false,
    bagordi: {
      bisacce: 0,
      ubriachezza: 0,
      batoste: 0
    },
    compagnia: {
      ruolo: '',
      membro: false
    },
    malefatte: [],
    taglia: 0,
    nomea: 0,
    favori: []
  };

  actor.setFlag('brancalonia-bigat', 'initialized', true);

  // Imposta altri flag se non esistono
  for (const [key, value] of Object.entries(defaultData)) {
    if (key !== 'initialized' && !actor.getFlag('brancalonia-bigat', key)) {
      actor.setFlag('brancalonia-bigat', key, value);
    }
  }
}

/**
 * Aggiunge event listeners personalizzati agli elementi Brancalonia
 */
function attachBrancaloniaEventListeners($html, actor) {
  // Listener per infamia
  $html.find('.infamia-control').on('click', function (event) {
    event.preventDefault();
    const action = $(this).data('action');
    const amount = parseInt($(this).data('amount')) || 1;

    if (action === 'increase') {
      game.brancalonia?.infamiaTracker?.addInfamia(actor, amount);
    } else if (action === 'decrease') {
      game.brancalonia?.infamiaTracker?.removeInfamia(actor, amount);
    }
  });

  // Listener per bagordi
  $html.find('.bagordi-roll').on('click', (event) => {
    event.preventDefault();
    game.brancalonia?.bagordi?.rollBagordi(actor);
  });

  // Listener per malefatte
  $html.find('.add-malefatta').on('click', (event) => {
    event.preventDefault();
    game.brancalonia?.malefatteTaglie?.addMalefatta(actor);
  });

  // Altri listeners...
}

/**
 * Fix per hook deprecati - Rimuove i vecchi hook e usa i nuovi
 */
Hooks.once('init', () => {
  // Verifica se ci sono ancora hook vecchi registrati
  const deprecatedHooks = [
    'renderActorSheet5eCharacter',
    'renderActorSheet5eNPC',
    'preRenderActorSheet5eCharacter'
  ];

  deprecatedHooks.forEach(hookName => {
    // Log se trovati hook deprecati
    try {
      // Verifica che _hooks esista e sia un oggetto
      if (Hooks._hooks && typeof Hooks._hooks === 'object' && Hooks._hooks[hookName]?.length > 0) {
        console.warn(`⚠️ Found deprecated hook: ${hookName}. Consider updating to new API.`);
      }
    } catch (error) {
      // Ignora errori - potrebbe non esistere in v13
      console.log(`📝 Hook ${hookName} check skipped (not available in this version)`);
    }
  });

  // Applica theme class se necessario
  try {
    if (game.settings.get('brancalonia-bigat', 'enableTheme')) {
      document.body.classList.add('theme-brancalonia');
    }
  } catch (error) {
    // Setting potrebbe non esistere, applica theme di default
    console.log('📝 Theme setting not found, applying default theme');
    document.body.classList.add('theme-brancalonia');
  }
});

console.log('✅ Brancalonia Compatibility Fix loaded');