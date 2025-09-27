/**
 * BRANCALONIA NAMESPACE FIX
 * Risolve i problemi di namespace deprecati in Foundry v13
 *
 * PROBLEMA: Molte classi globali sono state spostate sotto foundry.*
 * SOLUZIONE: Crea alias globali per retrocompatibilità
 */

// Applica fix solo se siamo in Foundry v13+
Hooks.once("init", () => {
  const coreVersion = game.version || game.data.version;

  // Verifica se siamo in v13+
  if (!foundry.utils.isNewerVersion(coreVersion, "13.0.0") && coreVersion !== "13.0.0") {
    console.log("📦 Namespace fix not needed for Foundry < v13");
    return;
  }

  console.log("🔧 Applying Foundry v13+ namespace fixes...");

  // Lista di namespace da fixare
  const namespaceFixes = [
    // UI Applications
    { old: 'SceneNavigation', new: 'foundry.applications.ui.SceneNavigation' },
    { old: 'Hotbar', new: 'foundry.applications.ui.Hotbar' },
    { old: 'SceneControls', new: 'foundry.applications.ui.SceneControls' },
    { old: 'PlayerList', new: 'foundry.applications.ui.PlayerList' },
    { old: 'CombatTracker', new: 'foundry.applications.ui.CombatTracker' },

    // Canvas Placeables
    { old: 'Token', new: 'foundry.canvas.placeables.Token' },
    { old: 'Tile', new: 'foundry.canvas.placeables.Tile' },
    { old: 'Drawing', new: 'foundry.canvas.placeables.Drawing' },
    { old: 'Light', new: 'foundry.canvas.placeables.Light' },
    { old: 'Note', new: 'foundry.canvas.placeables.Note' },
    { old: 'Sound', new: 'foundry.canvas.placeables.Sound' },
    { old: 'Template', new: 'foundry.canvas.placeables.Template' },
    { old: 'Wall', new: 'foundry.canvas.placeables.Wall' },

    // Canvas Layers
    { old: 'WallsLayer', new: 'foundry.canvas.layers.WallsLayer' },
    { old: 'TokenLayer', new: 'foundry.canvas.layers.TokenLayer' },
    { old: 'TemplatesLayer', new: 'foundry.canvas.layers.TemplatesLayer' },
    { old: 'SoundsLayer', new: 'foundry.canvas.layers.SoundsLayer' },
    { old: 'NotesLayer', new: 'foundry.canvas.layers.NotesLayer' },
    { old: 'LightingLayer', new: 'foundry.canvas.layers.LightingLayer' },
    { old: 'DrawingsLayer', new: 'foundry.canvas.layers.DrawingsLayer' },
    { old: 'ControlsLayer', new: 'foundry.canvas.layers.ControlsLayer' },
    { old: 'BackgroundLayer', new: 'foundry.canvas.layers.BackgroundLayer' },

    // Canvas
    { old: 'Canvas', new: 'foundry.canvas.Canvas' },

    // Helpers
    { old: 'ClientSettings', new: 'foundry.helpers.ClientSettings' },

    // Applications v1 (legacy)
    { old: 'JournalTextPageSheet', new: 'foundry.appv1.sheets.JournalTextPageSheet' },
    { old: 'JournalImagePageSheet', new: 'foundry.appv1.sheets.JournalImagePageSheet' },
    { old: 'JournalPDFPageSheet', new: 'foundry.appv1.sheets.JournalPDFPageSheet' },
    { old: 'JournalVideoPageSheet', new: 'foundry.appv1.sheets.JournalVideoPageSheet' },

    // Applications Sheets
    { old: 'CardDeckConfig', new: 'foundry.applications.sheets.CardDeckConfig' },
    { old: 'CardConfig', new: 'foundry.applications.sheets.CardConfig' },

    // Handlebars
    { old: 'loadTemplates', new: 'foundry.applications.handlebars.loadTemplates' },
    { old: 'renderTemplate', new: 'foundry.applications.handlebars.renderTemplate' },
    { old: 'preloadHandlebarsTemplates', new: 'foundry.applications.handlebars.preloadHandlebarsTemplates' }
  ];

  // Applica i fix creando alias globali
  let fixedCount = 0;
  let skippedCount = 0;

  for (const fix of namespaceFixes) {
    try {
      // Ottieni il nuovo namespace
      const parts = fix.new.split('.');
      let target = window;

      for (const part of parts) {
        if (target[part]) {
          target = target[part];
        } else {
          target = null;
          break;
        }
      }

      // Se il nuovo namespace esiste e il vecchio no, crea l'alias
      // Usa hasOwnProperty per evitare di triggerare warning
      if (target && !window.hasOwnProperty(fix.old)) {
        // Usa Object.defineProperty per creare l'alias
        Object.defineProperty(window, fix.old, {
          get() { return target; },
          set(value) { target = value; },
          enumerable: true,
          configurable: true
        });
        fixedCount++;
        console.log(`  ✅ Aliased ${fix.old} → ${fix.new}`);
      } else if (window.hasOwnProperty(fix.old)) {
        skippedCount++;
        // Il vecchio esiste già, non fare nulla
      }
    } catch (err) {
      console.warn(`  ⚠️ Could not create alias for ${fix.old}:`, err.message);
    }
  }

  console.log(`🎯 Namespace fixes applied: ${fixedCount} aliases created, ${skippedCount} skipped`);
});

/**
 * Hook per intercettare e fixare chiamate a funzioni deprecate
 */
Hooks.once("setup", () => {
  // Fix per loadTemplates e renderTemplate se necessario
  if (!window.loadTemplates && foundry.applications?.handlebars?.loadTemplates) {
    window.loadTemplates = foundry.applications.handlebars.loadTemplates;
    console.log("✅ Fixed loadTemplates");
  }

  if (!window.renderTemplate && foundry.applications?.handlebars?.renderTemplate) {
    window.renderTemplate = foundry.applications.handlebars.renderTemplate;
    console.log("✅ Fixed renderTemplate");
  }
});

/**
 * Fix specifici per moduli di terze parti che potrebbero usare vecchi namespace
 */
Hooks.once("ready", () => {
  // Fix per moduli che potrebbero accedere a Token prima che sia disponibile
  if (!window.Token && foundry.canvas?.placeables?.Token) {
    window.Token = foundry.canvas.placeables.Token;
  }

  // Fix per SceneNavigation
  if (!window.SceneNavigation && foundry.applications?.ui?.SceneNavigation) {
    window.SceneNavigation = foundry.applications.ui.SceneNavigation;
  }

  // Fix per ClientSettings
  if (!window.ClientSettings && foundry.helpers?.ClientSettings) {
    window.ClientSettings = foundry.helpers.ClientSettings;
  }

  console.log("✅ Brancalonia namespace fixes ready");
});

// Esporta per debug
window.BrancaloniaNamespaceFix = {
  checkNamespaces: function() {
    const checks = [
      'SceneNavigation',
      'Token',
      'ClientSettings',
      'Canvas',
      'WallsLayer',
      'ControlsLayer',
      'loadTemplates',
      'renderTemplate'
    ];

    console.log("🔍 Checking namespaces:");
    for (const name of checks) {
      const exists = !!window[name];
      console.log(`  ${exists ? '✅' : '❌'} ${name}`);
    }
  }
};

console.log("📦 Brancalonia Namespace Fix loaded");