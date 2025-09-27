/**
 * BRANCALONIA SETTINGS FIX
 * Corregge i label dei settings che mostrano chiavi di traduzione
 * invece del testo corretto
 */

console.log("🔧 Brancalonia Settings Fix - Loading");

// ============================================
// FIX IMMEDIATO PER ICONE FONT AWESOME
// ============================================

(function() {
  // Intercetta createElement per correggere icone al volo
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName, options) {
    const element = originalCreateElement.call(document, tagName, options);

    // Se è un elemento i (icona), aggiungi observer per correggere classi
    if (tagName.toLowerCase() === 'i') {
      // Correggi immediatamente se ha classi problematiche
      setTimeout(() => {
        if (element.className && element.className.includes('fa ')) {
          const fixedClass = element.className
            .replace(/\bfa\s+fa-/g, 'fas fa-')
            .replace(/\bfa-sync\b/g, 'fa-sync-alt');
          if (fixedClass !== element.className) {
            element.className = fixedClass;
          }
        }
      }, 0);
    }

    return element;
  };
})();

// ============================================
// FIX SETTINGS LABELS
// ============================================

Hooks.once("init", () => {
  console.log("🔧 Fixing module settings labels");

  // Hook per correggere i label dopo che tutti i moduli sono caricati
  Hooks.once("ready", () => {
    fixSettingsLabels();
  });
});

/**
 * Corregge i label dei settings che mostrano codici invece di testo
 */
function fixSettingsLabels() {
  // Mappa dei label corretti per i moduli conosciuti
  const labelFixes = {
    // Fix per bottoni Sync
    "fa fa-sync Sync All": "Sync All",
    "fa fa-sync Sync Modules": "Sync Modules",
    "fa fa-sync Sync Users": "Sync Users",
    "fa fa-sync Sync Agnostic": "Sync Agnostic",
    "fa fa-sync Sync System": "Sync System",
    "fa fa-sync": "Sync",
    // Moduli con label errati comuni
    "fa-solid fa-users-cog": "Configure Settings",
    "fa-solid fa-user-gear": "User Settings",
    "fa-solid fa-user": "User Management",
    "fa-solid fa-users": "User Configuration",
    "fa-solid fa-gear": "Settings",
    "fa-solid fa-gears": "Advanced Settings",
    "fa-solid fa-cog": "Configuration",
    "fa-solid fa-cogs": "System Configuration",
    "fa-solid fa-wrench": "Tools",
    "fa-solid fa-tools": "Admin Tools",
    "fa-solid fa-sliders": "Controls",
    "fa-solid fa-sliders-h": "Configure Controls",
    "fa-solid fa-dice-d20": "Dice Configuration",
    "fa-solid fa-dice": "Dice Settings",
    "fa-solid fa-eye": "View Settings",
    "fa-solid fa-eye-slash": "Hidden Settings",
    "fa-solid fa-lock": "Permissions",
    "fa-solid fa-unlock": "Open Permissions",
    "fa-solid fa-shield": "Security",
    "fa-solid fa-shield-alt": "Security Settings"
  };

  // Corregge i label nei menu settings
  try {
    // Accedi ai settings registrati
    const settings = game.settings.settings;

    for (let [key, setting] of settings.entries()) {
      // Se il nome del setting è una chiave fa-
      if (setting.name && setting.name.startsWith("fa-")) {
        const fixedLabel = labelFixes[setting.name];
        if (fixedLabel) {
          console.log(`🔧 Fixing label: ${setting.name} -> ${fixedLabel}`);
          setting.name = fixedLabel;
        } else {
          // Prova a estrarre un nome sensato dalla chiave
          const fallbackName = setting.name
            .replace(/^fa-solid fa-/, '')
            .replace(/^fa-/, '')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          console.log(`🔧 Auto-fixing label: ${setting.name} -> ${fallbackName}`);
          setting.name = fallbackName;
        }
      }

      // Correggi anche gli hint se necessario
      if (setting.hint && setting.hint.startsWith("fa-")) {
        setting.hint = "Configure this setting";
      }
    }
  } catch (error) {
    console.error("❌ Error fixing settings labels:", error);
  }

  // Fix specifici per moduli noti problematici
  fixSpecificModuleSettings();
}

/**
 * Fix specifici per moduli che hanno problemi noti
 */
function fixSpecificModuleSettings() {
  // Lista di moduli con settings problematici
  const problematicModules = [
    "autocover",
    "beaver-crafting",
    "custom-dnd5e",
    "epic-rolls-5e"
  ];

  problematicModules.forEach(moduleId => {
    const module = game.modules.get(moduleId);
    if (module?.active) {
      console.log(`🔧 Checking settings for module: ${moduleId}`);

      // Prova a correggere i settings del modulo
      const moduleSettings = Array.from(game.settings.settings.entries())
        .filter(([key, setting]) => key.startsWith(moduleId));

      moduleSettings.forEach(([key, setting]) => {
        if (setting.name?.startsWith("fa-") || setting.name?.includes("fa-solid")) {
          const cleanName = module.title || moduleId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          setting.name = `${cleanName} Settings`;
          console.log(`🔧 Fixed ${moduleId} setting: ${key}`);
        }
      });
    }
  });
}

// ============================================
// OVERRIDE SETTINGS REGISTRATION
// ============================================

// Wrapper per game.settings.register per intercettare registrazioni problematiche
Hooks.once("init", () => {
  const originalRegister = game.settings.register;

  game.settings.register = function(namespace, key, data) {
    // Correggi label se sono chiavi fa-
    if (data.name?.startsWith("fa-") || data.name?.includes("fa-solid")) {
      console.warn(`⚠️ Intercepted bad setting name: ${data.name} for ${namespace}.${key}`);

      // Prova a generare un nome migliore
      const betterName = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();

      data.name = betterName || "Setting";
      console.log(`✅ Replaced with: ${data.name}`);
    }

    // Correggi anche gli hint
    if (data.hint?.startsWith("fa-") || data.hint?.includes("fa-solid")) {
      data.hint = `Configure ${data.name || key}`;
    }

    // Chiama l'originale con i dati corretti
    return originalRegister.call(this, namespace, key, data);
  };

  console.log("✅ Settings registration wrapper installed");
});

// ============================================
// RENDERING FIXES
// ============================================

// Correggi i label quando vengono renderizzati TUTTI gli elementi
Hooks.on("renderApplication", (app, html, data) => {
  fixRenderedLabels(html);
});

Hooks.on("renderSettingsConfig", (app, html, data) => {
  fixRenderedLabels(html);
});

function fixRenderedLabels(html) {
  // Converti a jQuery se necessario
  const $html = html.jquery ? html : $(html);

  // Cerca tutti i label che contengono "fa-"
  $html.find("label").each(function() {
    const label = $(this);
    const text = label.text();

    if (text.includes("fa-solid") || text.includes("fa-")) {
      // Estrai il testo pulito
      const cleanText = text
        .replace(/fa-solid fa-/g, '')
        .replace(/fa-/g, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();

      if (cleanText) {
        console.log(`🔧 Fixing rendered label: ${text} -> ${cleanText}`);
        label.text(cleanText);
      }
    }
  });

  // Correggi anche i titoli delle sezioni
  $html.find("h2").each(function() {
    const heading = $(this);
    const text = heading.text();

    if (text.includes("fa-solid") || text.includes("fa-")) {
      const cleanText = text
        .replace(/fa-solid fa-/g, '')
        .replace(/fa-/g, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();

      if (cleanText) {
        heading.text(cleanText);
      }
    }
  });

  // Correggi bottoni con testo "fa fa-sync"
  $html.find("button, a.button, .button").each(function() {
    const button = $(this);
    const html = button.html();

    if (html && html.includes("fa fa-")) {
      const fixed = html
        .replace(/fa fa-sync/g, '<i class="fas fa-sync-alt"></i>')
        .replace(/fa fa-([\w-]+)/g, '<i class="fas fa-$1"></i>');

      if (fixed !== html) {
        button.html(fixed);
      }
    }

    // Correggi anche il testo diretto
    const text = button.text();
    if (text.includes("fa fa-")) {
      const cleanText = text
        .replace(/fa fa-sync\s*/g, '')
        .replace(/fa fa-[\w-]+\s*/g, '')
        .trim();

      if (cleanText && cleanText !== text) {
        // Preserva icone esistenti
        const icon = button.find('i').detach();
        button.text(cleanText);
        if (icon.length) button.prepend(icon);
      }
    }
  });

  // Fix icone che hanno classi errate
  $html.find('i[class*="fa "]').each(function() {
    const icon = $(this);
    const fixedClass = icon.attr('class')
      .replace(/\bfa\s+fa-/g, 'fas fa-')
      .replace(/\bfa-sync\b/g, 'fa-sync-alt');

    if (fixedClass !== icon.attr('class')) {
      icon.attr('class', fixedClass);
    }
  });
}

console.log("✅ Brancalonia Settings Fix loaded");

// ============================================
// DEBUG UTILITY
// ============================================

window.BrancaloniaSettingsFix = {
  /**
   * Lista tutti i settings con label problematici
   */
  listBadLabels() {
    console.log("🔍 Searching for bad setting labels...");
    const badSettings = [];

    for (let [key, setting] of game.settings.settings.entries()) {
      if (setting.name?.includes("fa-") || setting.hint?.includes("fa-")) {
        badSettings.push({
          key: key,
          name: setting.name,
          hint: setting.hint,
          module: key.split('.')[0]
        });
      }
    }

    if (badSettings.length > 0) {
      console.table(badSettings);
      console.log(`Found ${badSettings.length} settings with bad labels`);
    } else {
      console.log("✅ No bad labels found");
    }

    return badSettings;
  },

  /**
   * Corregge manualmente tutti i label
   */
  fixAllLabels() {
    fixSettingsLabels();
    console.log("✅ Labels fixed. You may need to refresh the settings window.");
  }
};

console.log("💡 Use BrancaloniaSettingsFix.listBadLabels() to check for issues");
console.log("💡 Use BrancaloniaSettingsFix.fixAllLabels() to fix them");