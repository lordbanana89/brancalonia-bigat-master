/**
 * BRANCALONIA MODULES INITIALIZATION FIX
 * Aggiunge metodo initialize() a tutti i moduli che ne sono sprovvisti
 * e assicura che siano correttamente registrati nel sistema
 */

// Fix per InfamiaTracker
if (typeof InfamiaTracker !== 'undefined' && !InfamiaTracker.initialize) {
  InfamiaTracker.initialize = function() {
    console.log('🎭 Inizializzazione Sistema Infamia');

    // Registra hooks
    Hooks.on("createActor", (actor) => {
      if (actor.type === "character") {
        actor.setFlag("brancalonia-bigat", "infamia", 0);
      }
    });

    Hooks.on("renderActorSheet", (app, html, data) => {
      if (app.actor.type === "character") {
        InfamiaTracker.addInfamiaUI(app, html, data);
      }
    });

    // Registra comando chat
    Hooks.on("chatMessage", (html, content) => {
      if (content.startsWith("/infamia")) {
        const parts = content.split(" ");
        const actor = game.user.character || canvas.tokens.controlled[0]?.actor;

        if (!actor) {
          ui.notifications.warn("Seleziona un personaggio!");
          return false;
        }

        if (parts[1] === "add" && parts[2]) {
          actor.addInfamia(parseInt(parts[2]));
        } else if (parts[1] === "set" && parts[2]) {
          actor.setFlag("brancalonia-bigat", "infamia", parseInt(parts[2]));
        } else if (parts[1] === "show") {
          const infamia = actor.getFlag("brancalonia-bigat", "infamia") || 0;
          ChatMessage.create({
            content: `${actor.name} ha ${infamia} punti Infamia`,
            speaker: ChatMessage.getSpeaker({actor})
          });
        }
        return false;
      }
      return true;
    });

    return true;
  };
}

// Fix per HavenSystem
if (typeof HavenSystem !== 'undefined' && !HavenSystem.initialize) {
  HavenSystem.initialize = function() {
    console.log('🏠 Inizializzazione Sistema Haven');

    // Registra hooks
    Hooks.on("renderActorSheet", (app, html, data) => {
      if (app.actor.type === "character") {
        HavenSystem.addHavenUI(app, html, data);
      }
    });

    // Comando chat
    Hooks.on("chatMessage", (html, content) => {
      if (content.startsWith("/haven")) {
        const actor = game.user.character;
        if (actor) {
          HavenSystem.showHavenDialog(actor);
        } else {
          ui.notifications.warn("Devi avere un personaggio selezionato!");
        }
        return false;
      }
      return true;
    });

    return true;
  };
}

// Fix per CompagniaManager
if (typeof CompagniaManager !== 'undefined' && !CompagniaManager.initialize) {
  CompagniaManager.initialize = function() {
    console.log('⚔️ Inizializzazione Gestione Compagnia');

    // Registra settings
    game.settings.register("brancalonia-bigat", "compagniaData", {
      scope: "world",
      config: false,
      type: Object,
      default: {}
    });

    // Comando chat
    Hooks.on("chatMessage", (html, content) => {
      if (content.startsWith("/compagnia")) {
        CompagniaManager.showCompagniaDialog();
        return false;
      }
      return true;
    });

    return true;
  };
}

// Fix per DiseasesSystem
if (typeof DiseasesSystem !== 'undefined' && !DiseasesSystem.initialize) {
  DiseasesSystem.initialize = function() {
    console.log('🤒 Inizializzazione Sistema Malattie');

    // Hook per riposo lungo
    Hooks.on("dnd5e.restCompleted", (actor, result) => {
      if (result.longRest) {
        DiseasesSystem.checkDiseaseProgress(actor);
      }
    });

    // Comando chat
    Hooks.on("chatMessage", (html, content) => {
      if (content.startsWith("/malattia")) {
        const parts = content.split(" ");
        const actor = game.user.character || canvas.tokens.controlled[0]?.actor;

        if (!actor) {
          ui.notifications.warn("Seleziona un personaggio!");
          return false;
        }

        if (parts[1] === "add" && parts[2]) {
          DiseasesSystem.addDisease(actor, parts[2]);
        } else if (parts[1] === "cure" && parts[2]) {
          DiseasesSystem.cureDisease(actor, parts[2]);
        } else if (parts[1] === "list") {
          DiseasesSystem.listDiseases(actor);
        }
        return false;
      }
      return true;
    });

    return true;
  };
}

// Fix per MenagramoSystem
if (typeof MenagramoSystem !== 'undefined' && !MenagramoSystem.initialize) {
  MenagramoSystem.initialize = function() {
    console.log('☠️ Inizializzazione Sistema Menagramo');

    // Hook per modificare tiri
    Hooks.on("dnd5e.preRollAbilityTest", (actor, config, abilityId) => {
      const menagramo = actor.getFlag("brancalonia-bigat", "menagramo");
      if (menagramo?.level > 0) {
        config.disadvantage = true;
        ui.notifications.warn(`${actor.name} è afflitto dal Menagramo!`);
      }
    });

    // Comando chat
    Hooks.on("chatMessage", (html, content) => {
      if (content.startsWith("/menagramo")) {
        const actor = game.user.character || canvas.tokens.controlled[0]?.actor;
        if (actor) {
          MenagramoSystem.showMenagramoDialog(actor);
        }
        return false;
      }
      return true;
    });

    return true;
  };
}

// Fix per TavernBrawl
if (typeof TavernBrawl !== 'undefined' && !TavernBrawl.initialize) {
  TavernBrawl.initialize = function() {
    console.log('👊 Inizializzazione Sistema Risse');

    // Registra comando
    Hooks.on("chatMessage", (html, content) => {
      if (content.startsWith("/rissa")) {
        TavernBrawl.startBrawl();
        return false;
      }
      return true;
    });

    // Crea macro
    Hooks.once("ready", () => {
      const existingMacro = game.macros.find(m => m.name === "Inizia Rissa");
      if (!existingMacro) {
        Macro.create({
          name: "Inizia Rissa",
          type: "script",
          img: "icons/skills/melee/unarmed-punch-fist-yellow.webp",
          command: "TavernBrawl.startBrawl();"
        });
      }
    });

    return true;
  };
}

// Fix per EnvironmentalHazards
if (typeof EnvironmentalHazards !== 'undefined' && !EnvironmentalHazards.initialize) {
  EnvironmentalHazards.initialize = function() {
    console.log('🌪️ Inizializzazione Hazard Ambientali');

    // Comando chat
    Hooks.on("chatMessage", (html, content) => {
      if (content.startsWith("/hazard")) {
        const parts = content.split(" ");
        if (parts[1]) {
          EnvironmentalHazards.applyHazard(parts[1]);
        } else {
          EnvironmentalHazards.showHazardList();
        }
        return false;
      }
      return true;
    });

    return true;
  };
}

// Fix per DirtyJobs
if (typeof DirtyJobs !== 'undefined' && !DirtyJobs.initialize) {
  DirtyJobs.initialize = function() {
    console.log('💼 Inizializzazione Lavori Sporchi');

    // Comando chat
    Hooks.on("chatMessage", (html, content) => {
      if (content.startsWith("/lavoro")) {
        DirtyJobs.generateJob();
        return false;
      }
      return true;
    });

    return true;
  };
}

// Fix per DuelingSystem
if (typeof DuelingSystem !== 'undefined' && !DuelingSystem.initialize) {
  DuelingSystem.initialize = function() {
    console.log('⚔️ Inizializzazione Sistema Duelli');

    // Comando chat
    Hooks.on("chatMessage", (html, content) => {
      if (content.startsWith("/duello")) {
        const actors = canvas.tokens.controlled.map(t => t.actor);
        if (actors.length >= 2) {
          DuelingSystem.startDuel(actors[0], actors[1]);
        } else {
          ui.notifications.warn("Seleziona due token per il duello!");
        }
        return false;
      }
      return true;
    });

    return true;
  };
}

// Fix per FactionsSystem
if (typeof FactionsSystem !== 'undefined' && !FactionsSystem.initialize) {
  FactionsSystem.initialize = function() {
    console.log('🏛️ Inizializzazione Sistema Fazioni');

    // Registra fazioni
    game.settings.register("brancalonia-bigat", "factions", {
      scope: "world",
      config: false,
      type: Object,
      default: {}
    });

    // Comando chat
    Hooks.on("chatMessage", (html, content) => {
      if (content.startsWith("/fazione")) {
        FactionsSystem.showFactionsDialog();
        return false;
      }
      return true;
    });

    return true;
  };
}

// Fix per ReputationSystem
if (typeof ReputationSystem !== 'undefined' && !ReputationSystem.initialize) {
  ReputationSystem.initialize = function() {
    console.log('📊 Inizializzazione Sistema Reputazione');

    // Hook per modifiche reputazione
    Hooks.on("updateActor", (actor, data, options, userId) => {
      if (data.flags?.["brancalonia-bigat"]?.reputation) {
        ReputationSystem.checkReputationThresholds(actor);
      }
    });

    // Comando chat
    Hooks.on("chatMessage", (html, content) => {
      if (content.startsWith("/reputazione")) {
        const actor = game.user.character;
        if (actor) {
          ReputationSystem.showReputationDialog(actor);
        }
        return false;
      }
      return true;
    });

    return true;
  };
}

// Fix per MalefatteTaglieNomea
if (typeof MalefatteTaglieNomea !== 'undefined' && !MalefatteTaglieNomea.initialize) {
  MalefatteTaglieNomea.initialize = function() {
    console.log('⚖️ Inizializzazione Malefatte, Taglie e Nomea');

    // Comandi chat
    Hooks.on("chatMessage", (html, content) => {
      const actor = game.user.character || canvas.tokens.controlled[0]?.actor;

      if (content.startsWith("/malefatta")) {
        if (actor) MalefatteTaglieNomea.addMalefatta(actor);
        return false;
      }

      if (content.startsWith("/taglia")) {
        if (actor) MalefatteTaglieNomea.showTagliaDialog(actor);
        return false;
      }

      if (content.startsWith("/nomea")) {
        if (actor) MalefatteTaglieNomea.showNomeaDialog(actor);
        return false;
      }

      return true;
    });

    return true;
  };
}

// Fix per LevelCap
if (typeof LevelCap !== 'undefined' && !LevelCap.initialize) {
  LevelCap.initialize = function() {
    console.log('📈 Inizializzazione Limite Livello');

    const maxLevel = game.settings.get("brancalonia-bigat", "maxLevel") || 6;

    // Hook per limitare livello
    Hooks.on("preUpdateActor", (actor, data, options, userId) => {
      if (actor.type === "character" && data.system?.details?.level) {
        if (data.system.details.level > maxLevel) {
          ui.notifications.warn(`Livello massimo consentito: ${maxLevel}`);
          return false;
        }
      }
    });

    return true;
  };
}

// Fix per ShoddyEquipment
if (typeof ShoddyEquipment !== 'undefined' && !ShoddyEquipment.initialize) {
  ShoddyEquipment.initialize = function() {
    console.log('🗡️ Inizializzazione Equipaggiamento Scadente');

    // Hook per rottura equipaggiamento
    Hooks.on("dnd5e.rollAttack", (item, roll) => {
      if (roll.dice[0].results[0].result === 1) {
        const isShoddy = item.getFlag("brancalonia-bigat", "shoddy");
        if (isShoddy) {
          ShoddyEquipment.breakItem(item);
        }
      }
    });

    return true;
  };
}

// Fix per RestSystem
if (typeof RestSystem !== 'undefined' && !RestSystem.initialize) {
  RestSystem.initialize = function() {
    console.log('😴 Inizializzazione Sistema Riposo');

    // Override riposo
    Hooks.on("dnd5e.preRestCompleted", (actor, result) => {
      return RestSystem.modifyRest(actor, result);
    });

    return true;
  };
}

// Fix per CovoGranlussi
if (typeof CovoGranlussi !== 'undefined' && !CovoGranlussi.initialize) {
  CovoGranlussi.initialize = function() {
    console.log('🏚️ Inizializzazione Covo dei Granlussi');

    // Comando chat
    Hooks.on("chatMessage", (html, content) => {
      if (content.startsWith("/covo")) {
        CovoGranlussi.manageCovo();
        return false;
      }
      return true;
    });

    return true;
  };
}

// Fix per FavoriSystem
if (typeof FavoriSystem !== 'undefined' && !FavoriSystem.initialize) {
  FavoriSystem.initialize = function() {
    console.log('🤝 Inizializzazione Sistema Favori');

    // Comando chat
    Hooks.on("chatMessage", (html, content) => {
      if (content.startsWith("/favore")) {
        const actor = game.user.character;
        if (actor) {
          FavoriSystem.requestFavore(actor);
        }
        return false;
      }
      return true;
    });

    return true;
  };
}

// Fix per BackgroundPrivileges
if (typeof BackgroundPrivileges !== 'undefined' && !BackgroundPrivileges.initialize) {
  BackgroundPrivileges.initialize = function() {
    console.log('🎭 Inizializzazione Privilegi Background');

    // Hook per applicare privilegi
    Hooks.on("createItem", (item, options, userId) => {
      if (item.type === "background" && item.parent?.type === "character") {
        BackgroundPrivileges.applyPrivileges(item.parent, item);
      }
    });

    return true;
  };
}

// Fix per CursedRelics
if (typeof CursedRelics !== 'undefined' && !CursedRelics.initialize) {
  CursedRelics.initialize = function() {
    console.log('💀 Inizializzazione Reliquie Maledette');

    // Hook per oggetti maledetti
    Hooks.on("createItem", (item, options, userId) => {
      if (item.getFlag("brancalonia-bigat", "cursed")) {
        CursedRelics.applyCurse(item);
      }
    });

    return true;
  };
}

// Fix per BrancaloniaConditions
if (typeof BrancaloniaConditions !== 'undefined' && !BrancaloniaConditions.initialize) {
  BrancaloniaConditions.initialize = function() {
    console.log('🎯 Inizializzazione Condizioni Brancalonia');

    // Registra condizioni custom
    CONFIG.statusEffects.push(
      {
        id: "briaco",
        label: "Briaco",
        icon: "icons/consumables/drinks/alcohol-beer-stein-wooden-metal-brown.webp"
      },
      {
        id: "affamato",
        label: "Affamato",
        icon: "icons/consumables/food/bread-loaf-white.webp"
      },
      {
        id: "menagramo",
        label: "Menagramo",
        icon: "icons/magic/death/skull-humanoid-crown-white-blue.webp"
      }
    );

    return true;
  };
}

// Fix per RischiMestiere
if (typeof RischiMestiere !== 'undefined' && !RischiMestiere.initialize) {
  RischiMestiere.initialize = function() {
    console.log('⚠️ Inizializzazione Rischi del Mestiere');

    // Hook per complicazioni
    Hooks.on("dnd5e.rollAbilityTest", (actor, roll, abilityId) => {
      if (roll.dice[0].results[0].result === 1) {
        RischiMestiere.triggerComplication(actor);
      }
    });

    return true;
  };
}

console.log('✅ Brancalonia Modules Init Fix caricato - tutti i moduli hanno ora initialize()');

// Registra flag globale per confermare che il fix è stato caricato
if (typeof game !== 'undefined' && game.ready) {
  game.brancalonia = game.brancalonia || {};
  game.brancalonia.initFixLoaded = true;
}