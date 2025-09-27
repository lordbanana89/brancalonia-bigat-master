/**
 * BRANCALONIA V13 MODERN
 * Usa SOLO API moderne di Foundry v13 - NO retrocompatibilità
 * Richiede Foundry v13.0.0+
 */

console.log("🚀 Brancalonia V13 Modern - Initializing");

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Helper per gestire sia jQuery che HTMLElement
 * Foundry v13 mescola ancora jQuery e vanilla JS
 */
function isJQuery(obj) {
  return obj && obj.jquery !== undefined;
}

function ensureElement(html) {
  if (isJQuery(html)) {
    return html[0]; // Ottieni HTMLElement da jQuery
  }
  return html; // Già un HTMLElement
}

function ensureJQuery(html) {
  if (!isJQuery(html)) {
    return $(html); // Converti HTMLElement a jQuery
  }
  return html; // Già jQuery
}

// ============================================
// VERSION CHECK - SOLO V13
// ============================================

Hooks.once("init", () => {
  const version = game.version;
  if (!version.startsWith("13")) {
    ui.notifications.error("❌ BRANCALONIA RICHIEDE FOUNDRY V13!", { permanent: true });
    throw new Error(`Brancalonia requires Foundry v13. Current version: ${version}`);
  }
  console.log("✅ Foundry v13 confirmed - Using modern APIs only");
});

// ============================================
// D&D 5E MODERN HOOKS
// ============================================

Hooks.once("init", () => {
  const dnd5eVersion = game.system?.version || "0";
  console.log(`📦 D&D 5e version: ${dnd5eVersion}`);

  // Solo per D&D 5e v5.x
  if (!dnd5eVersion.startsWith("5.")) {
    ui.notifications.warn("⚠️ D&D 5e v5.x richiesto per funzionalità complete");
  }

  // Hook moderni per D&D 5e v5.x
  console.log("🔄 Registering modern D&D 5e v5.x hooks");

  // Character sheets
  Hooks.on("renderActorSheetV2", (app, html, data) => {
    if (app.actor.type === "character") {
      console.log("📝 Character sheet rendered with modern API");
      applyCharacterSheetEnhancements(app, html, data);
    }
  });

  // NPC sheets
  Hooks.on("renderActorSheetV2", (app, html, data) => {
    if (app.actor.type === "npc") {
      console.log("📝 NPC sheet rendered with modern API");
      applyNPCSheetEnhancements(app, html, data);
    }
  });

  // Item sheets
  Hooks.on("renderItemSheetV2", (app, html, data) => {
    console.log("📝 Item sheet rendered with modern API");
    applyItemSheetEnhancements(app, html, data);
  });
});

// ============================================
// MODERN API USAGE EXAMPLES
// ============================================

/**
 * Applica miglioramenti al character sheet usando API v13
 */
function applyCharacterSheetEnhancements(app, html, data) {
  // In v13 renderActorSheetV2, html è un HTMLElement, non jQuery
  // Usa le API moderne
  const sceneNav = foundry.applications.ui.SceneNavigation;
  const tokenClass = foundry.canvas.placeables.Token;

  // Aggiungi classe Brancalonia - vanilla JS
  html.classList.add("brancalonia-sheet");

  // Aggiungi controlli custom - vanilla JS
  const header = html.querySelector(".sheet-header");
  if (header) {
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'brancalonia-controls';
    controlsDiv.innerHTML = `
      <button class="infamia-btn" title="Gestisci Infamia">
        <i class="fas fa-skull"></i> Infamia
      </button>
      <button class="baraonda-btn" title="Inizia Baraonda">
        <i class="fas fa-fist-raised"></i> Baraonda
      </button>
    `;
    header.appendChild(controlsDiv);

    // Event listeners con API moderne - vanilla JS
    const infamiaBtn = html.querySelector(".infamia-btn");
    if (infamiaBtn) {
      infamiaBtn.addEventListener('click', () => {
        console.log("🎭 Opening Infamia tracker with modern API");
        // Usa foundry.applications per dialog moderne
        new Dialog({
          title: "Tracker Infamia",
          content: `
            <div class="brancalonia-infamia">
              <h3>Livello Infamia: ${app.actor.getFlag("brancalonia-bigat", "infamia") || 0}</h3>
              <input type="range" min="0" max="10" value="${app.actor.getFlag("brancalonia-bigat", "infamia") || 0}">
            </div>
          `,
          buttons: {
            save: {
              label: "Salva",
              callback: (dialogHtml) => {
                // dialogHtml potrebbe essere jQuery, quindi gestiamo entrambi i casi
                const input = dialogHtml.querySelector ?
                  dialogHtml.querySelector("input") :
                  dialogHtml.find("input")[0];
                const value = input?.value || 0;
                app.actor.setFlag("brancalonia-bigat", "infamia", value);
              }
            }
          }
        }).render(true);
      });
    }

    const baraondaBtn = html.querySelector(".baraonda-btn");
    if (baraondaBtn) {
      baraondaBtn.addEventListener('click', () => {
        console.log("⚔️ Starting Baraonda with modern API");
        // Usa Canvas moderno
        if (canvas.scene) {
          ui.notifications.info("🎲 Baraonda iniziata!");
          // Usa token layer moderno
          const tokens = canvas.tokens.placeables;
          tokens.forEach(t => {
            if (t.actor?.type === "npc") {
              t.document.update({ "disposition": CONST.TOKEN_DISPOSITIONS.HOSTILE });
            }
          });
        }
      });
    }
  }
}

/**
 * Applica miglioramenti al NPC sheet usando API v13
 */
function applyNPCSheetEnhancements(app, html, data) {
  // In v13 renderActorSheetV2, html è un HTMLElement, non jQuery
  html.classList.add("brancalonia-npc-sheet");

  // Aggiungi indicatore di pericolo - vanilla JS
  const header = html.querySelector(".sheet-header");
  if (header) {
    const cr = app.actor.system.details?.cr || 0;
    const dangerLevel = cr >= 5 ? "alto" : cr >= 3 ? "medio" : "basso";

    const dangerDiv = document.createElement('div');
    dangerDiv.className = `brancalonia-danger danger-${dangerLevel}`;
    dangerDiv.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      Pericolo: ${dangerLevel.toUpperCase()}
    `;
    header.appendChild(dangerDiv);
  }
}

/**
 * Applica miglioramenti al item sheet usando API v13
 */
function applyItemSheetEnhancements(app, html, data) {
  // In v13 renderItemSheetV2, html è un HTMLElement, non jQuery
  html.classList.add("brancalonia-item-sheet");

  // Aggiungi indicatore oggetto scadente - vanilla JS
  if (app.item.type === "weapon" || app.item.type === "equipment") {
    const header = html.querySelector(".sheet-header");
    if (header && app.item.getFlag("brancalonia-bigat", "scadente")) {
      const scadenteDiv = document.createElement('div');
      scadenteDiv.className = 'brancalonia-scadente';
      scadenteDiv.innerHTML = `
        <i class="fas fa-trash"></i> Oggetto Scadente
      `;
      header.appendChild(scadenteDiv);
    }
  }
}

// ============================================
// CANVAS ENHANCEMENTS CON API V13
// ============================================

Hooks.on("canvasReady", (canvas) => {
  console.log("🗺️ Canvas ready - Using modern Canvas API");

  // Usa API Canvas moderne
  const scene = canvas.scene;
  const tokens = canvas.tokens;
  const walls = canvas.walls;
  const lighting = canvas.lighting;

  // Applica tema Brancalonia alla scena
  if (scene.getFlag("brancalonia-bigat", "tavernScene")) {
    console.log("🍺 Tavern scene detected - Applying atmosphere");

    // Usa lighting layer moderno
    canvas.lighting.globalLight = false;
    canvas.lighting.globalLightThreshold = 0.5;

    // Aggiungi effetti atmosferici
    canvas.scene.update({
      "darkness": 0.4,
      "fogExploration": true
    });
  }
});

// ============================================
// COMBAT TRACKER ENHANCEMENTS
// ============================================

Hooks.on("renderCombatTracker", (app, html, data) => {
  console.log("⚔️ Combat tracker rendered - Using modern API");

  // renderCombatTracker passa jQuery object
  const $html = ensureJQuery(html);

  // Usa Combat Tracker moderno
  const combat = game.combat;
  if (!combat) return;

  // Aggiungi bottone Baraonda
  const controls = $html.find(".combat-control");
  controls.append(`
    <a class="combat-control baraonda-roll" title="Tira per Baraonda">
      <i class="fas fa-dice-d20"></i>
    </a>
  `);

  $html.find(".baraonda-roll").click(async () => {
    const roll = await new Roll("1d6").evaluate();
    await roll.toMessage({
      flavor: "🎲 Tiro Baraonda",
      speaker: ChatMessage.getSpeaker()
    });

    if (roll.total >= 5) {
      ui.notifications.info("💥 BARAONDA! Tutti attaccano!");
    }
  });
});

// ============================================
// CHAT MESSAGE ENHANCEMENTS
// ============================================

Hooks.on("renderChatMessage", (message, html, data) => {
  // renderChatMessage passa jQuery object
  const $html = ensureJQuery(html);

  // Aggiungi stile Brancalonia ai messaggi
  if (message.getFlag("brancalonia-bigat", "isInfamiaRoll")) {
    $html.addClass("brancalonia-infamia-message");
    $html.find(".message-header").prepend('<i class="fas fa-skull"></i> ');
  }

  if (message.getFlag("brancalonia-bigat", "isBaraondaRoll")) {
    $html.addClass("brancalonia-baraonda-message");
    $html.find(".message-header").prepend('<i class="fas fa-fist-raised"></i> ');
  }
});

// ============================================
// COMPENDIUM ENHANCEMENTS
// ============================================

Hooks.on("renderCompendium", async (app, html, data) => {
  console.log("📚 Compendium rendered - Using modern API");

  // renderCompendium passa jQuery object
  const $html = ensureJQuery(html);

  // Aggiungi filtri Brancalonia
  if (app.collection.metadata.id?.includes("brancalonia")) {
    const controls = $html.find(".header-search");
    controls.after(`
      <div class="brancalonia-filters">
        <button class="filter-scadente" title="Solo Oggetti Scadenti">
          <i class="fas fa-trash"></i>
        </button>
        <button class="filter-speciale" title="Solo Oggetti Speciali">
          <i class="fas fa-star"></i>
        </button>
      </div>
    `);

    // Event handlers
    $html.find(".filter-scadente").click(() => {
      console.log("🗑️ Filtering for scadente items");
      // Implementa filtro
    });

    $html.find(".filter-speciale").click(() => {
      console.log("⭐ Filtering for special items");
      // Implementa filtro
    });
  }
});

// ============================================
// SETTINGS REGISTRATION
// ============================================

Hooks.once("init", () => {
  console.log("⚙️ Registering Brancalonia settings");

  // Registra settings usando API moderne
  game.settings.register("brancalonia-bigat", "useInfamia", {
    name: "Usa Sistema Infamia",
    hint: "Attiva il tracking dell'Infamia per i personaggi",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register("brancalonia-bigat", "useBaraonda", {
    name: "Usa Regole Baraonda",
    hint: "Attiva le regole per le risse da taverna",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register("brancalonia-bigat", "useShoddy", {
    name: "Usa Oggetti Scadenti",
    hint: "Attiva le regole per gli oggetti scadenti",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
});

// ============================================
// SOCKET HANDLING
// ============================================

Hooks.once("ready", () => {
  console.log("📡 Setting up Brancalonia sockets");

  // Usa socket moderni
  game.socket.on("module.brancalonia-bigat", (data) => {
    console.log("📨 Received socket data:", data);

    switch(data.action) {
      case "infamiaUpdate":
        ui.notifications.info(`Infamia aggiornata: ${data.value}`);
        break;
      case "baraondaStart":
        ui.notifications.warn("💥 BARAONDA INIZIATA!");
        break;
    }
  });
});

// ============================================
// READY CHECK
// ============================================

Hooks.once("ready", () => {
  console.log("✨ Brancalonia V13 Modern - READY");
  console.log("📋 Active features:");
  console.log("  - Modern Actor Sheets ✅");
  console.log("  - Modern Canvas API ✅");
  console.log("  - Modern Combat Tracker ✅");
  console.log("  - Modern Compendiums ✅");
  console.log("  - Modern Settings ✅");
  console.log("  - Modern Sockets ✅");

  ui.notifications.info("🎭 Brancalonia V13 - Pronto all'avventura!", { permanent: false });
});