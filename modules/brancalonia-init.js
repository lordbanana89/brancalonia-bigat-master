/**
 * Brancalonia - Inizializzazione Sistema
 * Compatibile con Foundry VTT v13 e D&D 5e v5.x
 */

// Registrazione modulo
Hooks.once("init", () => {
  console.log("Brancalonia | Inizializzazione modulo...");

  // Registrazione namespace globale
  game.brancalonia = {
    infamiaTracker: null,
    compagniaManager: null,
    havenSystem: null,
    tavernBrawl: null,
    dirtyJobs: null,
    menagramo: null,
    shoddyItems: null,
    equitaglia: null,
    rischiMestiere: null,
    generatoreBettole: null,
    stradeMisteriose: null,
    giochiDaBettola: null,
    intrugli: null
  };

  // Le configurazioni CONFIG sono spostate in brancalonia-config-fix.js per evitare conflitti
  // con altri moduli che fanno deepClone durante init

  // Registra gli status effects custom
  CONFIG.statusEffects = CONFIG.statusEffects.concat([{
    id: "menagramo",
    name: "Menagramo",
    img: "modules/brancalonia-bigat/assets/icons/menagramo.svg"
  }]);

  CONFIG.statusEffects = CONFIG.statusEffects.concat([{
    id: "ubriaco",
    name: "Ubriaco",
    img: "modules/brancalonia-bigat/assets/icons/ubriaco.svg"
  }]);

  CONFIG.statusEffects = CONFIG.statusEffects.concat([{
    id: "batosta",
    name: "Batosta",
    img: "modules/brancalonia-bigat/assets/icons/batosta.svg"
  }]);

  // Registra template paths - Usa il nuovo namespace per Foundry v13
  foundry.applications.handlebars.loadTemplates([
    "modules/brancalonia-bigat/templates/infamia-tracker.hbs",
    "modules/brancalonia-bigat/templates/compagnia-sheet.hbs",
    "modules/brancalonia-bigat/templates/haven-manager.hbs",
    "modules/brancalonia-bigat/templates/dirty-job-card.hbs"
  ]);

  // Registra settings
  registerBrancaloniaSettings();

  // In Foundry v13, i flag non hanno bisogno di registrazione esplicita
  // Sono automaticamente disponibili quando il modulo è attivo
  console.log("Brancalonia | Sistema flags pronto (Foundry v13)");

  console.log("Brancalonia | Inizializzazione completata");
});

// Helper functions per Brancalonia invece di estendere la classe
function initializeBrancaloniaData(actor) {
  // Aggiungi dati Brancalonia usando flags
  if (!actor.getFlag("brancalonia-bigat", "initialized")) {
    actor.setFlag("brancalonia-bigat", "initialized", true);
    actor.setFlag("brancalonia-bigat", "infamia", 0);
    actor.setFlag("brancalonia-bigat", "menagramo", false);
  }
}

// Metodi helper per aggiungere funzionalità Brancalonia agli attori
async function addInfamia(actor, value) {
  const currentInfamia = actor.getFlag("brancalonia-bigat", "infamia") || 0;
  const newInfamia = Math.max(0, Math.min(100, currentInfamia + value));

  await actor.setFlag("brancalonia-bigat", "infamia", newInfamia);

  // Notifica
  ui.notifications.info(`${actor.name} guadagna ${value} punti Infamia (Totale: ${newInfamia})`);

  // Controlla livelli infamia per effetti
  checkInfamiaEffects(actor, newInfamia);
}

// Controlla effetti basati sul livello di infamia
function checkInfamiaEffects(actor, infamiaLevel) {
  if (infamiaLevel >= 75) {
    ui.notifications.warn(`${actor.name} è ora un Fuorilegge Ricercato!`);
  } else if (infamiaLevel >= 50) {
    ui.notifications.warn(`${actor.name} ha una Taglia sulla testa!`);
  } else if (infamiaLevel >= 25) {
    ui.notifications.info(`${actor.name} è Mal Visto dalle autorità`);
  }
}

// Metodo per applicare menagramo
async function applyMenagramo(actor, duration = "1d4") {
  await actor.setFlag("brancalonia-bigat", "menagramo", true);
  await actor.setFlag("brancalonia-bigat", "menagramoDuration", duration);

  // Applica active effect
  const roll = await new Roll(duration).evaluate();
  const effect = {
    name: "Menagramo",
    img: "modules/brancalonia-bigat/assets/icons/menagramo.svg",
    origin: actor.uuid,
    disabled: false,
    duration: {
      rounds: roll.total
    },
    changes: [
      {
        key: "flags.midi-qol.disadvantage.all",
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: "1"
      }
    ],
    flags: {
      brancalonia: {
        isMenagramo: true
      }
    }
  };

  await actor.createEmbeddedDocuments("ActiveEffect", [effect]);
  ui.notifications.warn(`${actor.name} è sotto l'effetto del Menagramo!`);
}

// Registrazione settings del modulo
function registerBrancaloniaSettings() {
  // Setting per tracciamento infamia globale
  game.settings.register("brancalonia-bigat", "trackInfamia", {
    name: "BRANCALONIA.Settings.TrackInfamia",
    hint: "BRANCALONIA.Settings.TrackInfamiaHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  // Setting per risse non letali
  game.settings.register("brancalonia-bigat", "nonLethalBrawls", {
    name: "BRANCALONIA.Settings.NonLethalBrawls",
    hint: "BRANCALONIA.Settings.NonLethalBrawlsHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  // Setting per oggetti scadenti
  game.settings.register("brancalonia-bigat", "shoddyItems", {
    name: "BRANCALONIA.Settings.ShoddyItems",
    hint: "BRANCALONIA.Settings.ShoddyItemsHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  // Setting per sistema compagnia
  game.settings.register("brancalonia-bigat", "useCompagnia", {
    name: "BRANCALONIA.Settings.UseCompagnia",
    hint: "BRANCALONIA.Settings.UseCompagniaHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  // Setting per lavori sporchi automatici
  game.settings.register("brancalonia-bigat", "autoGenerateJobs", {
    name: "BRANCALONIA.Settings.AutoGenerateJobs",
    hint: "BRANCALONIA.Settings.AutoGenerateJobsHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // Setting per sistema Haven
  game.settings.register("brancalonia-bigat", "havenSystem", {
    name: "BRANCALONIA.Settings.HavenSystem",
    hint: "BRANCALONIA.Settings.HavenSystemHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  // Setting per sistema Imbosco (Rischi del Mestiere)
  game.settings.register("brancalonia-bigat", "settimaneImbosco", {
    name: "Settimane di Imbosco",
    hint: "Numero di settimane trascorse in imbosco (-3 per settimana al tiro Rischi)",
    scope: "world",
    config: false,
    type: Number,
    default: 0
  });
}

// Hook per ready
Hooks.once("ready", async () => {
  console.log("Brancalonia | Sistema pronto");

  // Verifica compatibilità sistema
  if (!game.system.version.startsWith("5.")) {
    ui.notifications.warn("Brancalonia richiede dnd5e system v5.x per funzionare correttamente");
  }

  // Inizializza TUTTI i moduli
  const { InfamiaTracker } = await import("./infamia-tracker.js");
  const { CompagniaManager } = await import("./compagnia-manager.js");
  const { HavenSystem } = await import("./haven-system.js");
  const { TavernBrawlSystem } = await import("./tavern-brawl.js");
  const { DirtyJobsSystem } = await import("./dirty-jobs.js");
  const { MenagramoSystem } = await import("./menagramo.js");
  const { ShoddyEquipment } = await import("./shoddy-equipment.js");
  const { BrancaloniaMechanics } = await import("./brancalonia-mechanics.js");
  const { DiseasesSystem } = await import("./diseases-system.js");
  const { EnvironmentalHazardsSystem } = await import("./environmental-hazards.js");
  const { DuelingSystem } = await import("./dueling-system.js");
  const { FactionsSystem } = await import("./factions-system.js");
  const { ReputationSystem } = await import("./reputation-system.js");
  const { TavernGamesSystem } = await import("./tavern-games.js");
  const { BagordiSystem } = await import("./bagordi.js");
  const { BrancaloniaRestSystem } = await import("./rest-system.js");
  const { LevelCapSystem } = await import("./level-cap.js");

  // Istanzia TUTTI i sistemi
  game.brancalonia.infamiaTracker = new InfamiaTracker();
  game.brancalonia.compagniaManager = new CompagniaManager();
  game.brancalonia.havenSystem = new HavenSystem();
  game.brancalonia.tavernBrawl = new TavernBrawlSystem();
  game.brancalonia.dirtyJobs = new DirtyJobsSystem();
  game.brancalonia.menagramo = new MenagramoSystem();
  game.brancalonia.shoddyItems = new ShoddyEquipment();
  game.brancalonia.mechanics = new BrancaloniaMechanics();
  game.brancalonia.diseases = new DiseasesSystem();
  game.brancalonia.hazards = new EnvironmentalHazardsSystem();
  game.brancalonia.dueling = new DuelingSystem();
  game.brancalonia.factions = new FactionsSystem();
  game.brancalonia.reputation = new ReputationSystem();
  game.brancalonia.tavernGames = new TavernGamesSystem();
  game.brancalonia.bagordi = new BagordiSystem();
  game.brancalonia.restSystem = new BrancaloniaRestSystem();
  game.brancalonia.levelCap = new LevelCapSystem();

  // Mostra messaggio di benvenuto
  if (game.user.isGM) {
    ChatMessage.create({
      content: `
        <div class="brancalonia-welcome">
          <h2>🏴‍☠️ Benvenuto in Brancalonia! 🏴‍☠️</h2>
          <p>Il Regno di Taglia ti attende!</p>
          <p><em>Versione modulo: ${game.modules.get("brancalonia-bigat").version}</em></p>
          <ul>
            <li>Sistema Infamia: ${game.settings.get("brancalonia-bigat", "trackInfamia") ? "✅ Attivo" : "❌ Disattivo"}</li>
            <li>Sistema Compagnia: ${game.settings.get("brancalonia-bigat", "useCompagnia") ? "✅ Attivo" : "❌ Disattivo"}</li>
            <li>Sistema Haven: ${game.settings.get("brancalonia-bigat", "havenSystem") ? "✅ Attivo" : "❌ Disattivo"}</li>
          </ul>
        </div>
      `,
      whisper: [game.user.id]
    });
  }
});

// Hook per inizializzare nuovi attori
Hooks.on("createActor", (actor, options, userId) => {
  if (actor.type === "character") {
    initializeBrancaloniaData(actor);
  }
});

// Hook per modificare sheet degli attori
Hooks.on("renderActorSheet5e", (app, html, data) => {
  // Solo per PG
  if (data.actor.type !== "character") return;

  // Inizializza se non già fatto
  if (!data.actor.getFlag("brancalonia-bigat", "initialized")) {
    initializeBrancaloniaData(data.actor);
  }

  // Aggiungi tracker infamia
  if (game.settings.get("brancalonia-bigat", "trackInfamia")) {
    game.brancalonia.infamiaTracker?.renderInfamiaTracker(app, html, data);
  }

  // Aggiungi indicatore menagramo
  if (data.actor.flags?.["brancalonia-bigat"]?.menagramo) {
    const header = html.find(".window-header");;
    header.append(`<span class="menagramo-indicator" title="Sotto effetto del Menagramo!">☠️</span>`);
  }
});

// Hook per modificare i tiri
Hooks.on("dnd5e.preRollAbilityTest", (actor, rollData, messageData) => {
  // Applica effetti menagramo
  if (actor.flags?.["brancalonia-bigat"]?.menagramo) {
    rollData.disadvantage = true;
    ui.notifications.warn("Menagramo! Tiro con svantaggio!");
  }
});

// Hook per gestire danno non letale nelle risse
Hooks.on("dnd5e.applyDamage", (actor, damage, options) => {
  if (options.nonLethal || actor.flags?.["brancalonia-bigat"]?.inBrawl) {
    // Converti in danno temporaneo invece che reale
    const tempHp = actor.system.attributes.hp.temp || 0;
    const newTempDamage = Math.max(0, tempHp - damage);

    actor.update({
      "system.attributes.hp.temp": newTempDamage
    });

    // Se arriva a 0, è KO non morto
    if (newTempDamage <= 0) {
      actor.toggleStatusEffect("unconscious");
      ChatMessage.create({
        content: `${actor.name} è stato messo KO nella rissa!`,
        speaker: ChatMessage.getSpeaker({actor: actor})
      });
    }

    // Previeni danno normale
    return false;
  }
});

// Esporta per uso globale
window.BrancaloniaSystem = {
  addInfamia: (actor, value) => addInfamia(actor, value),
  applyMenagramo: (actor, duration) => applyMenagramo(actor, duration),
  startBrawl: () => game.brancalonia.tavernBrawl?.startBrawl(),
  generateJob: (type, level) => game.brancalonia.dirtyJobs?.generateJob(type, level),
  createCompagnia: (actors) => game.brancalonia.compagniaManager?.createCompagnia(actors),
  buildHaven: (name, rooms) => game.brancalonia.havenSystem?.createHaven(name, rooms)
};
