/**
 * BRANCALONIA COMPATIBILITY FIX
 * Risolve problemi di compatibilità con D&D 5e v5.1.9
 *
 * PROBLEMA: ActorSheetMixin è stato deprecato e integrato in BaseActorSheet
 * SOLUZIONE: Aggiorna tutti gli hook per usare la nuova API
 * 
 * REFACTORED: Eliminata duplicazione codice, estratta logica comune
 */

import { getLogger } from './brancalonia-logger.js';

const logger = getLogger();

const MODULE_ID = 'brancalonia-bigat';
const MODULE_NAME = 'CompatibilityFix'; // Fix: Spostato fuori dall'hook init

// Verifica versione D&D 5e
Hooks.once('init', () => {
  // Body class application moved to Main.mjs (first esmodule)
  // This ensures correct initialization order
  logger.info(MODULE_NAME, 'Inizializzazione compatibility fix');

  const dnd5eVersion = game.system.version ?? '0.0.0';
  const [majorVersion] = dnd5eVersion.split('.').map(n => parseInt(n, 10));

  logger.info(MODULE_NAME, `D&D 5e v${dnd5eVersion} rilevato`);

  // Determina quale set di hooks usare
  if (Number.isInteger(majorVersion) && majorVersion >= 5) {
    logger.info(MODULE_NAME, 'Uso hook system v5.x+ (dnd5e.renderActorSheet5e*)');
    registerNewHooks();
  } else if (Number.isInteger(majorVersion) && majorVersion >= 3) {
    logger.info(MODULE_NAME, 'Uso hook system legacy v3.x/v4.x (renderActorSheet5e*)');
    registerLegacyHooks();
  } else {
    logger.warn(MODULE_NAME, 'Versione D&D 5e non supportata - possibili problemi di compatibilità');
    // Fallback ai legacy hooks per v2.x e precedenti
    registerLegacyHooks();
  }
});

// ============================================
// SHARED HANDLERS (NO DUPLICATION)
// ============================================

/**
 * Crea handler per character sheet (comune a v5+ e legacy)
 */
function createCharacterSheetHandler() {
  return async (app, html, data) => {
    try {
      if (!app.actor || app.actor.type !== 'character') return;

      const { $html } = normalizeHtml(html);
      if (!$html) {
        logger.warn(MODULE_NAME, 'jQuery non disponibile per character sheet');
        return;
      }

      // Inizializzazione dati
      if (!app.actor.getFlag(MODULE_ID, 'initialized')) {
        await initializeBrancaloniaData(app.actor);
      }

      // Rendering sistemi
      renderBrancaloniaSystems(app, $html);

      // Event listeners
      attachBrancaloniaEventListeners($html, app.actor);

    } catch (error) {
      logger.error(MODULE_NAME, 'Errore rendering character sheet', error);
    }
  };
}

/**
 * Crea handler per NPC sheet (comune a v5+ e legacy)
 */
function createNpcSheetHandler() {
  return (app, html) => {
    try {
      if (!app.actor || app.actor.type !== 'npc') return;
      
      const { $html } = normalizeHtml(html);
      if (!$html) return;

      if (game.brancalonia?.sheets) {
        game.brancalonia.sheets.modifyNPCSheet(app, $html, { actor: app.actor });
      }
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore rendering NPC sheet', error);
    }
  };
}

/**
 * Rendering di tutti i sistemi Brancalonia sulla character sheet
 */
function renderBrancaloniaSystems(app, $html) {
  const actor = app.actor;

  try {
    // Infamia Tracker
    if (game.settings.get(MODULE_ID, 'trackInfamia')) {
      game.brancalonia?.infamiaTracker?.renderInfamiaTracker(app, $html, { actor });
    }

    // Menagramo Indicator
    if (actor.flags?.[MODULE_ID]?.menagramo) {
      const header = $html.find('.window-header');
      if (!header.find('.menagramo-indicator').length) {
        header.append(`<span class="menagramo-indicator" title="Sotto effetto del Menagramo!">☠️</span>`);
      }
    }

    // Bagordi Tracker
    if (game.brancalonia?.bagordi) {
      game.brancalonia.bagordi.renderBagordiTracker(app, $html, { actor });
    }

    // Compagnia Tab
    if (game.brancalonia?.compagniaManager?._isInCompagnia(actor)) {
      game.brancalonia.compagniaManager._addCompagniaTab(app, $html);
    }

    // Malefatte/Taglia Section
    if (game.brancalonia?.malefatteTaglie) {
      game.brancalonia.malefatteTaglie._renderTagliaSection(app, $html);
    }

    // Favori UI
    if (game.brancalonia?.favoriSystem?.renderFavoriUI) {
      game.brancalonia.favoriSystem.renderFavoriUI(app, $html, app.object);
    }

    // Covo UI (GM only)
    if (game.user.isGM && game.brancalonia?.covoGranlussi) {
      game.brancalonia.covoGranlussi._renderCovoUI(app, $html);
    }

  } catch (error) {
    logger.error(MODULE_NAME, 'Errore rendering sistemi Brancalonia', error);
  }
}

// ============================================
// HOOK REGISTRATION
// ============================================

/**
 * Registra hooks per D&D 5e v5.0+
 */
function registerNewHooks() {
  const handleCharacter = createCharacterSheetHandler();
  const handleNpc = createNpcSheetHandler();

  // v5+ hooks con prefisso dnd5e.
  Hooks.on('dnd5e.renderActorSheet5eCharacter', handleCharacter);
  Hooks.on('dnd5e.renderActorSheet5eNPC', handleNpc);

  // Pre-render hook per preparazione dati
  Hooks.on('dnd5e.preRenderActorSheet5eCharacter', (app, sheetData) => {
    try {
      if (!app.actor) return;
      if (game.brancalonia?.sheets) {
        game.brancalonia.sheets.prepareSheetData(app, sheetData);
      }
    } catch (error) {
      logger.error(MODULE_NAME, 'Errore pre-render character sheet', error);
    }
  });

  logger.debug(MODULE_NAME, 'Hook v5+ registrati');
}

/**
 * Registra hooks legacy per D&D 5e < v5.0
 */
function registerLegacyHooks() {
  logger.warn(MODULE_NAME, 'Uso hook legacy per D&D 5e < v5.0');

  const handleCharacter = createCharacterSheetHandler();
  const handleNpc = createNpcSheetHandler();

  // Legacy hooks v3.x/v4.x (SENZA prefisso dnd5e.)
  Hooks.on('renderActorSheet5eCharacter', handleCharacter);
  Hooks.on('renderActorSheet5eNPC', handleNpc);

  // Fixed: Use SheetCoordinator for v2.x fallback
  const SheetCoordinator = window.SheetCoordinator || game.brancalonia?.SheetCoordinator;
  
  if (SheetCoordinator) {
    SheetCoordinator.registerModule('CompatibilityFix', async (app, html, data) => {
      try {
        if (app.actor.type === 'character') {
          handleCharacter(app, html, data);
        } else if (app.actor.type === 'npc') {
          handleNpc(app, html);
        }
      } catch (error) {
        logger.error(MODULE_NAME, 'Errore compatibility fix', error);
      }
    }, {
      priority: 10,
      types: ['character', 'npc']
    });
  } else {
    Hooks.on('renderActorSheet', (app, html, data) => {
      try {
        if (app.actor.type === 'character') {
          handleCharacter(app, html, data);
        } else if (app.actor.type === 'npc') {
          handleNpc(app, html);
        }
      } catch (error) {
        logger.error(MODULE_NAME, 'Errore fallback renderActorSheet', error);
      }
    });
  }

  logger.debug(MODULE_NAME, 'Hook legacy registrati');
}

// ============================================
// DATA INITIALIZATION
// ============================================

/**
 * Inizializza dati Brancalonia di default per un attore
 */
async function initializeBrancaloniaData(actor) {
  if (!actor) return;

  try {
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

    // Imposta flag initialized
    await actor.setFlag(MODULE_ID, 'initialized', true);

    // Imposta altri flag solo se non esistono
    const flagPromises = [];
    for (const [key, value] of Object.entries(defaultData)) {
      if (key !== 'initialized' && !actor.getFlag(MODULE_ID, key)) {
        flagPromises.push(actor.setFlag(MODULE_ID, key, value));
      }
    }

    if (flagPromises.length > 0) {
      await Promise.all(flagPromises);
    }

    logger.debug(MODULE_NAME, `Dati Brancalonia inizializzati per ${actor.name}`);

  } catch (error) {
    logger.error(MODULE_NAME, 'Errore inizializzazione dati Brancalonia', error);
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Aggiunge event listeners per controlli Brancalonia
 * Supporta sia jQuery che vanilla JS
 */
function attachBrancaloniaEventListeners($html, actor) {
  const jq = globalThis.jQuery || globalThis.$;

  try {
    if (jq && $html) {
      // jQuery disponibile - usa il metodo preferito
      attachJQueryListeners($html, actor, jq);
    } else {
      // Fallback vanilla JS (Foundry v13+)
      attachVanillaListeners($html, actor);
    }
  } catch (error) {
    logger.error(MODULE_NAME, 'Errore attaching event listeners', error);
  }
}

/**
 * Event listeners con jQuery
 */
function attachJQueryListeners($html, actor, jq) {
  // Infamia controls
  $html.find('.infamia-control').on('click', function (event) {
    event.preventDefault();
    const action = jq(this).data('action');
    const amount = parseInt(jq(this).data('amount')) || 1;

    if (action === 'increase') {
      game.brancalonia?.infamiaTracker?.addInfamia(actor, amount);
    } else if (action === 'decrease') {
      game.brancalonia?.infamiaTracker?.removeInfamia(actor, amount);
    }
  });

  // Bagordi roll
  $html.find('.bagordi-roll').on('click', (event) => {
    event.preventDefault();
    game.brancalonia?.bagordi?.rollBagordi(actor);
  });

  // Add malefatta
  $html.find('.add-malefatta').on('click', (event) => {
    event.preventDefault();
    game.brancalonia?.malefatteTaglie?.addMalefatta(actor);
  });

  logger.debug(MODULE_NAME, 'Event listeners jQuery attaccati');
}

/**
 * Event listeners con vanilla JS (fallback)
 */
function attachVanillaListeners($html, actor) {
  logger.debug(MODULE_NAME, 'Uso vanilla JS per event listeners');

  const element = $html instanceof HTMLElement ? $html : ($html?.[0] || $html?.element);
  if (!element) {
    logger.warn(MODULE_NAME, 'Elemento HTML non valido per event listeners');
    return;
  }

  // Infamia controls
  element.querySelectorAll('.infamia-control').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      const action = btn.dataset.action;
      const amount = parseInt(btn.dataset.amount) || 1;

      if (action === 'increase') {
        game.brancalonia?.infamiaTracker?.addInfamia(actor, amount);
      } else if (action === 'decrease') {
        game.brancalonia?.infamiaTracker?.removeInfamia(actor, amount);
      }
    });
  });

  // Bagordi roll
  element.querySelectorAll('.bagordi-roll').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      game.brancalonia?.bagordi?.rollBagordi(actor);
    });
  });

  // Add malefatta
  element.querySelectorAll('.add-malefatta').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      game.brancalonia?.malefatteTaglie?.addMalefatta(actor);
    });
  });

  logger.debug(MODULE_NAME, 'Event listeners vanilla JS attaccati');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Normalizza html input a formato consistente
 * Supporta jQuery objects, arrays, HTMLElements
 * 
 * @param {jQuery|Array|HTMLElement} html - HTML input da normalizzare
 * @returns {{$html: jQuery|null, element: HTMLElement|null}}
 */
function normalizeHtml(html) {
  const jq = globalThis.jQuery || globalThis.$;

  if (jq) {
    // jQuery disponibile
    if (html instanceof jq) {
      return { $html: html, element: html[0] };
    }

    if (Array.isArray(html)) {
      const element = html[0];
      return { $html: element ? jq(element) : jq([]), element };
    }

    if (html instanceof HTMLElement) {
      return { $html: jq(html), element: html };
    }

    return { $html: jq(html), element: jq(html)[0] };
  }

  // jQuery non disponibile - return solo element
  const element = Array.isArray(html) ? html[0] : html;
  return { $html: null, element };
}

// ============================================
// DEPRECATION CHECKS
// ============================================

/**
 * Verifica hook deprecati
 */
Hooks.once('init', () => {
  const legacyHookNames = ['renderActorSheetV2', 'renderItemSheetV2'];

  legacyHookNames.forEach(hookName => {
    try {
      if (Hooks._hooks?.[hookName]?.length > 0) {
        logger.warn(MODULE_NAME, `Hook deprecato trovato: ${hookName} - verificare compatibilità`);
      }
    } catch (error) {
      logger.debug(MODULE_NAME, `Check hook ${hookName} skipped (non disponibile)`);
    }
  });

  // Rimuovi classi CSS theme (migrato a Main.mjs)
  document.body.classList.remove('brancalonia-theme', 'pergamena-theme', 'brancalonia-theme-active');
  
  logger.info(MODULE_NAME, 'Compatibility fix completato');
});

// ============================================
// EXPORTS
// ============================================

export {
  initializeBrancaloniaData,
  normalizeHtml,
  attachBrancaloniaEventListeners
};