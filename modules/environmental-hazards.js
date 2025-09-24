/**
 * Sistema Hazard Ambientali per Brancalonia
 * Pericoli ambientali e trappole naturali secondo il manuale
 * Compatibile con dnd5e system per Foundry VTT v13
 */

export class EnvironmentalHazardsSystem {
  constructor() {
    // Database completo degli hazard di Brancalonia
    this.hazards = {
      // HAZARD NATURALI
      "palude_malsana": {
        name: "Palude Malsana",
        type: "naturale",
        icon: "icons/magic/nature/root-vine-fire-entangle-green.webp",
        dc: 12,
        trigger: "Attraversamento",
        effect: {
          immediate: "Movimento dimezzato, TS Costituzione CD 12 o avvelenato per 1 ora",
          ongoing: "Ogni ora: TS Costituzione CD 12 o 1 livello sfinimento",
          damage: null,
          condition: "difficult-terrain"
        },
        detection: { passive: 13, active: "Sopravvivenza CD 10" },
        avoidance: "Percorso alternativo (+2 ore viaggio) o equipaggiamento speciale",
        description: "Acqua stagnante e miasmi velenosi rendono il passaggio pericoloso"
      },

      "sabbie_mobili": {
        name: "Sabbie Mobili",
        type: "naturale",
        icon: "icons/magic/earth/projectiles-stone-salvo.webp",
        dc: 14,
        trigger: "Movimento nell'area",
        effect: {
          immediate: "TS Destrezza CD 14 o intrappolato",
          ongoing: "Affonda 1 piede/round, a 5 piedi soffoca in 1d4+1 round",
          damage: null,
          condition: "restrained"
        },
        detection: { passive: 15, active: "Percezione CD 12" },
        avoidance: "Corda e TS Atletica CD 12 per uscire",
        escape: "Forza CD 15 (con aiuto CD 10)",
        description: "Terreno traditore che ingoia i malcapitati"
      },

      "nebbia_velenosa": {
        name: "Nebbia Velenosa delle Paludi",
        type: "naturale",
        icon: "icons/magic/air/fog-gas-smoke-swirling-green.webp",
        dc: 13,
        trigger: "Inizio turno nell'area",
        effect: {
          immediate: "TS Costituzione CD 13 o 2d4 danni veleno",
          ongoing: "Visibilità 5 piedi, svantaggio Percezione",
          damage: "2d4",
          damageType: "poison",
          condition: "heavily-obscured"
        },
        detection: { passive: 10, active: "Natura CD 12" },
        avoidance: "Maschera o panno bagnato (vantaggio al TS)",
        duration: "2d6 ore o vento forte",
        description: "Miasmi tossici che si alzano dalle paludi al tramonto"
      },

      "frana": {
        name: "Frana Improvvisa",
        type: "naturale",
        icon: "icons/magic/earth/boulder-stone-impact-gray.webp",
        dc: 15,
        trigger: "Rumore forte o vibrazione",
        effect: {
          immediate: "TS Destrezza CD 15 o 4d10 danni contundenti",
          ongoing: "Sepolto: 1d6 danni/minuto per soffocamento",
          damage: "4d10",
          damageType: "bludgeoning",
          condition: "restrained"
        },
        detection: { passive: 14, active: "Percezione CD 12 per crepe" },
        avoidance: "Muoversi silenziosamente (Furtività CD 13)",
        escape: "Forza CD 20 o scavare (1 ora)",
        description: "Rocce instabili pronte a crollare"
      },

      "ghiaccio_sottile": {
        name: "Ghiaccio Sottile",
        type: "naturale",
        icon: "icons/magic/water/barrier-ice-crystal-wall-jagged-blue.webp",
        dc: 12,
        trigger: "Peso superiore a 100 kg",
        effect: {
          immediate: "TS Destrezza CD 12 o cade in acqua gelida",
          ongoing: "1d4 danni freddo/round, sfinimento dopo 1 minuto",
          damage: "1d4",
          damageType: "cold",
          condition: "exhaustion"
        },
        detection: { passive: 11, active: "Sopravvivenza CD 10" },
        avoidance: "Distribuire peso o percorso alternativo",
        escape: "Atletica CD 13 per uscire",
        description: "Superficie ghiacciata pronta a rompersi"
      },

      "tempesta_improvvisa": {
        name: "Tempesta del Menagramo",
        type: "naturale",
        icon: "icons/magic/lightning/bolt-strike-clouds-blue.webp",
        dc: 14,
        trigger: "Casuale (10% ogni ora di viaggio)",
        effect: {
          immediate: "Venti forti: svantaggio attacchi a distanza",
          ongoing: "Ogni 10 minuti: 10% di fulmine (8d6 danni elettrici)",
          damage: "8d6",
          damageType: "lightning",
          condition: "difficult-travel"
        },
        detection: { passive: null, active: "Sopravvivenza CD 15 prevede 1 ora prima" },
        avoidance: "Riparo solido",
        duration: "2d4 ore",
        description: "Tempesta violenta con fulmini e grandine"
      },

      // HAZARD URBANI
      "vicolo_malfamato": {
        name: "Vicolo Malfamato",
        type: "urbano",
        icon: "icons/environment/settlement/alley-narrow-night.webp",
        dc: null,
        trigger: "Passaggio di notte",
        effect: {
          immediate: "Incontro con 1d6 tagliagole (50% probabilità)",
          ongoing: "+10 punti Infamia se si combatte",
          damage: null,
          condition: "ambush"
        },
        detection: { passive: 14, active: "Streetwise CD 12" },
        avoidance: "Pagare 1d4 ducati di 'pedaggio' o altra strada",
        description: "Vicolo controllato da criminali locali"
      },

      "ponte_marcio": {
        name: "Ponte Marcio",
        type: "urbano",
        icon: "icons/environment/wilderness/bridge-rope.webp",
        dc: 11,
        trigger: "Attraversamento",
        effect: {
          immediate: "TS Destrezza CD 11 o cade (2d6 danni)",
          ongoing: "Crolla completamente con 200+ kg",
          damage: "2d6",
          damageType: "bludgeoning",
          condition: null
        },
        detection: { passive: 12, active: "Investigare CD 10" },
        avoidance: "Acrobazia CD 13 per passare con cautela",
        repair: "Attrezzi da falegname + 2 ore",
        description: "Struttura pericolante pronta a crollare"
      },

      "fogna_allagata": {
        name: "Fogna Allagata",
        type: "urbano",
        icon: "icons/environment/wilderness/cave-entrance-hollow.webp",
        dc: 13,
        trigger: "Esplorazione",
        effect: {
          immediate: "TS Costituzione CD 13 o avvelenato 1 ora",
          ongoing: "Malattia (10% febbre palustre)",
          damage: null,
          condition: "poisoned"
        },
        detection: { passive: 10, active: "Odore nauseabondo automatico" },
        avoidance: "Equipaggiamento protettivo",
        inhabitants: "1d4 ratti giganti o 1 otyugh (20%)",
        description: "Tunnel allagati pieni di rifiuti e malattie"
      },

      "tetto_instabile": {
        name: "Tetto Instabile",
        type: "urbano",
        icon: "icons/environment/settlement/house-roof-tiles-green.webp",
        dc: 12,
        trigger: "Movimento sui tetti",
        effect: {
          immediate: "TS Destrezza CD 12 o scivola",
          ongoing: "Caduta 3d6 danni + rumore (guardie allertate)",
          damage: "3d6",
          damageType: "bludgeoning",
          condition: "prone"
        },
        detection: { passive: 13, active: "Percezione CD 11" },
        avoidance: "Acrobazia CD 14 per movimento sicuro",
        description: "Tegole rotte e travi marce"
      },

      // HAZARD DUNGEON
      "stanza_allagata": {
        name: "Stanza Allagata",
        type: "dungeon",
        icon: "icons/magic/water/water-surface.webp",
        dc: 10,
        trigger: "Ingresso nella stanza",
        effect: {
          immediate: "Acqua alta 1 metro, movimento dimezzato",
          ongoing: "Combattimento: svantaggio attacchi in mischia",
          damage: null,
          condition: "difficult-terrain"
        },
        detection: { passive: 8, active: "Automatica" },
        special: "Elettricità: danno +1d6 a tutti in acqua",
        inhabitants: "Sanguisughe giganti (30%)",
        description: "Stanza parzialmente allagata"
      },

      "gas_allucinogeno": {
        name: "Gas Allucinogeno",
        type: "dungeon",
        icon: "icons/magic/control/hypnosis-mesmerism-eye.webp",
        dc: 14,
        trigger: "Apertura porta/cofano",
        effect: {
          immediate: "TS Costituzione CD 14 o allucinazioni per 10 minuti",
          ongoing: "Attacca alleati casuali, vede nemici inesistenti",
          damage: null,
          condition: "confused"
        },
        detection: { passive: 16, active: "Investigare CD 14" },
        avoidance: "Trattenere respiro (1 + COS minuti)",
        neutralize: "Vento forte o incantesimo purificare",
        description: "Spore fungine o alchimia antica"
      },

      "pavimento_traditore": {
        name: "Pavimento Traditore",
        type: "dungeon",
        icon: "icons/environment/wilderness/trap-pit-spikes-yellow.webp",
        dc: 15,
        trigger: "Pressione (50+ kg)",
        effect: {
          immediate: "TS Destrezza CD 15 o cade nella buca",
          ongoing: "3d6 danni + spine avvelenate (CD 12)",
          damage: "3d6",
          damageType: "piercing",
          condition: "prone"
        },
        detection: { passive: 15, active: "Investigare CD 13" },
        avoidance: "Saltare oltre o peso leggero",
        reset: "Automatico dopo 1 minuto",
        description: "Botola nascosta con punte"
      },

      "muro_di_lame": {
        name: "Muro di Lame Rotanti",
        type: "dungeon",
        icon: "icons/weapons/swords/swords-crossed-black.webp",
        dc: 16,
        trigger: "Leva/piastra di pressione",
        effect: {
          immediate: "TS Destrezza CD 16 o 4d8 danni taglienti",
          ongoing: "Blocca passaggio per 1 minuto",
          damage: "4d8",
          damageType: "slashing",
          condition: null
        },
        detection: { passive: 14, active: "Investigare CD 12" },
        avoidance: "Disattivare dispositivo CD 15",
        timing: "Attivo 1 round ogni 3",
        description: "Lame che escono dalle pareti"
      },

      // HAZARD MAGICI
      "zona_di_menagramo": {
        name: "Zona di Menagramo Persistente",
        type: "magico",
        icon: "icons/magic/death/skull-humanoid-crown-white-purple.webp",
        dc: null,
        trigger: "Permanente nell'area",
        effect: {
          immediate: "Applica Menagramo Minore automaticamente",
          ongoing: "Fallimenti critici con 1-3 sul d20",
          damage: null,
          condition: "menagramo"
        },
        detection: { passive: null, active: "Individuare magia" },
        avoidance: "Impossibile, solo protezione magica",
        neutralize: "Dissolvi magie CD 17 o benedizione",
        description: "Area maledetta dal menagramo"
      },

      "portale_instabile": {
        name: "Portale Instabile",
        type: "magico",
        icon: "icons/magic/movement/portal-vortex-purple.webp",
        dc: 15,
        trigger: "Avvicinamento a 3 metri",
        effect: {
          immediate: "TS Forza CD 15 o risucchiato",
          ongoing: "Teletrasporto casuale 1d100 x 10 metri",
          damage: "2d6",
          damageType: "force",
          condition: "teleported"
        },
        detection: { passive: null, active: "Arcano CD 13" },
        avoidance: "Oggetto di ancoraggio o corda",
        stability: "Instabile: 50% di malfunzionamento",
        description: "Portale magico danneggiato"
      },

      "guardiano_spettrale": {
        name: "Guardiano Spettrale Vincolato",
        type: "magico",
        icon: "icons/magic/death/undead-ghost-spirit-teal.webp",
        dc: null,
        trigger: "Violazione area protetta",
        effect: {
          immediate: "Appare spettro ostile",
          ongoing: "Insegue per 100 metri dall'area",
          damage: null,
          condition: "haunted"
        },
        detection: { passive: 16, active: "Religione CD 14" },
        avoidance: "Simbolo sacro o parola d'ordine",
        banish: "Scacciare non morti o esorcismo",
        description: "Spirito legato a proteggere un luogo"
      }
    };

    // Tabelle per generazione casuale
    this.randomTables = {
      wilderness: [
        "palude_malsana", "sabbie_mobili", "nebbia_velenosa",
        "frana", "ghiaccio_sottile", "tempesta_improvvisa"
      ],
      urban: [
        "vicolo_malfamato", "ponte_marcio", "fogna_allagata",
        "tetto_instabile"
      ],
      dungeon: [
        "stanza_allagata", "gas_allucinogeno", "pavimento_traditore",
        "muro_di_lame"
      ],
      magical: [
        "zona_di_menagramo", "portale_instabile", "guardiano_spettrale"
      ]
    };

    this._setupHooks();
    this._registerSettings();
  }

  _setupHooks() {
    // Hook per movimento in scene con hazard
    Hooks.on("updateToken", (token, update, options, userId) => {
      if (!update.x && !update.y) return;

      const hazards = canvas.scene.flags.brancalonia?.hazards || [];
      for (let hazard of hazards) {
        if (this._isTokenInHazard(token, hazard)) {
          this.triggerHazard(hazard.type, token.actor);
        }
      }
    });

    // Hook per tempo atmosferico
    Hooks.on("timePassed", (worldTime, dt) => {
      if (dt >= 3600) { // Ogni ora
        this._checkWeatherHazards();
      }
    });

    // Hook per esplorazione
    Hooks.on("targetToken", (user, token, targeted) => {
      if (targeted && game.user.isGM) {
        const hazard = token.document.flags.brancalonia?.hazard;
        if (hazard) {
          ui.notifications.info(`Hazard rilevato: ${this.hazards[hazard].name}`);
        }
      }
    });
  }

  _registerSettings() {
    game.settings.register("brancalonia-bigat", "enableHazards", {
      name: "Sistema Hazard Ambientali",
      hint: "Attiva i pericoli ambientali automatici",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register("brancalonia-bigat", "hazardFrequency", {
      name: "Frequenza Hazard",
      hint: "Quanto spesso si incontrano hazard",
      scope: "world",
      config: true,
      type: String,
      choices: {
        "low": "Bassa (10%)",
        "medium": "Media (20%)",
        "high": "Alta (35%)",
        "extreme": "Estrema (50%)"
      },
      default: "medium"
    });
  }

  /**
   * Attiva un hazard specifico
   */
  async triggerHazard(hazardName, actor = null, options = {}) {
    const hazard = this.hazards[hazardName];
    if (!hazard) {
      ui.notifications.error(`Hazard ${hazardName} non trovato!`);
      return;
    }

    // Messaggio iniziale
    ChatMessage.create({
      content: `
        <div class="brancalonia-hazard-trigger">
          <h3>⚠️ ${hazard.name}!</h3>
          <p><em>${hazard.description}</em></p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ alias: "Hazard" })
    });

    // Se c'è un attore bersaglio
    if (actor && hazard.effect.immediate) {
      await this._applyHazardEffect(actor, hazard);
    }

    // Se è un hazard di area
    if (hazard.type === "naturale" && !actor) {
      this._applyAreaHazard(hazard);
    }

    return hazard;
  }

  /**
   * Applica effetti di un hazard a un attore
   */
  async _applyHazardEffect(actor, hazard) {
    const effect = hazard.effect;

    // Tiro salvezza se richiesto
    if (hazard.dc) {
      const saveAbility = this._determineSaveAbility(effect.immediate);
      const save = await actor.rollAbilitySave(saveAbility, {
        dc: hazard.dc,
        flavor: `Evitare ${hazard.name}`
      });

      if (save.total >= hazard.dc) {
        ChatMessage.create({
          content: `
            <div class="brancalonia-hazard-save">
              <p><strong>${actor.name}</strong> evita ${hazard.name}!</p>
              <p>Tiro salvezza: ${save.total} vs CD ${hazard.dc}</p>
            </div>
          `,
          speaker: ChatMessage.getSpeaker({ actor })
        });
        return;
      }
    }

    // Applica danno
    if (effect.damage) {
      const damageRoll = await new Roll(effect.damage).evaluate();
      await actor.applyDamage(damageRoll.total, effect.damageType);

      ChatMessage.create({
        content: `
          <div class="brancalonia-hazard-damage">
            <p><strong>${actor.name}</strong> subisce ${damageRoll.total} danni ${effect.damageType} da ${hazard.name}!</p>
          </div>
        `,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }

    // Applica condizione
    if (effect.condition) {
      await this._applyHazardCondition(actor, effect.condition, hazard);
    }

    // Effetti ongoing
    if (effect.ongoing) {
      await this._setupOngoingHazard(actor, hazard);
    }
  }

  /**
   * Determina l'abilità per il tiro salvezza
   */
  _determineSaveAbility(effectText) {
    if (effectText.includes("Destrezza")) return "dex";
    if (effectText.includes("Costituzione")) return "con";
    if (effectText.includes("Forza")) return "str";
    if (effectText.includes("Saggezza")) return "wis";
    if (effectText.includes("Intelligenza")) return "int";
    if (effectText.includes("Carisma")) return "cha";
    return "dex"; // Default
  }

  /**
   * Applica condizione da hazard
   */
  async _applyHazardCondition(actor, condition, hazard) {
    const conditionMap = {
      "difficult-terrain": {
        key: "system.attributes.movement.walk",
        mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY,
        value: "0.5"
      },
      "restrained": {
        key: "system.attributes.movement.walk",
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: "0"
      },
      "poisoned": {
        key: "flags.midi-qol.disadvantage.attack.all",
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: "1"
      },
      "exhaustion": {
        key: "system.attributes.exhaustion",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: "1"
      },
      "menagramo": {
        key: "flags.brancalonia.menagramo",
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: "true"
      }
    };

    const effectData = conditionMap[condition];
    if (!effectData) return;

    const activeEffect = {
      name: `${hazard.name} - ${condition}`,
      icon: hazard.icon,
      origin: actor.uuid,
      duration: hazard.duration ? { seconds: hazard.duration * 3600 } : {},
      changes: [effectData],
      flags: {
        brancalonia: {
          isHazard: true,
          hazardType: hazard.type
        }
      }
    };

    await actor.createEmbeddedDocuments("ActiveEffect", [activeEffect]);
  }

  /**
   * Configura hazard con effetti ongoing
   */
  async _setupOngoingHazard(actor, hazard) {
    // Crea flag per tracciare hazard ongoing
    const ongoingHazards = actor.flags.brancalonia?.ongoingHazards || [];
    ongoingHazards.push({
      name: hazard.name,
      type: hazard.type,
      startTime: game.time.worldTime,
      effect: hazard.effect.ongoing
    });

    await actor.setFlag("brancalonia-bigat", "ongoingHazards", ongoingHazards);

    // Programma check periodici
    if (hazard.effect.ongoing.includes("round")) {
      Hooks.on("updateCombat", (combat, update) => {
        if (update.round) {
          this._checkOngoingHazard(actor, hazard);
        }
      });
    }
  }

  /**
   * Controlla hazard ongoing
   */
  async _checkOngoingHazard(actor, hazard) {
    const ongoingEffect = hazard.effect.ongoing;

    // Parse dell'effetto
    if (ongoingEffect.includes("danni")) {
      const damageMatch = ongoingEffect.match(/(\d+d\d+)/);
      if (damageMatch) {
        const damageRoll = await new Roll(damageMatch[1]).evaluate();
        await actor.applyDamage(damageRoll.total);
      }
    }

    if (ongoingEffect.includes("sfinimento")) {
      await actor.update({
        "system.attributes.exhaustion": actor.system.attributes.exhaustion + 1
      });
    }
  }

  /**
   * Rileva hazard in un'area
   */
  async detectHazard(actor, hazardName = null) {
    // Se non specificato, cerca hazard casuali
    if (!hazardName) {
      const nearbyHazards = this._getNearbyHazards(actor);
      if (nearbyHazards.length === 0) {
        ui.notifications.info("Nessun pericolo rilevato nelle vicinanze");
        return;
      }
      hazardName = nearbyHazards[0];
    }

    const hazard = this.hazards[hazardName];
    const detection = hazard.detection;

    // Percezione passiva
    const passivePerception = actor.system.skills.prc.passive;
    if (detection.passive && passivePerception >= detection.passive) {
      ChatMessage.create({
        content: `
          <div class="brancalonia-hazard-detected">
            <h3>👁️ Pericolo Rilevato!</h3>
            <p><strong>${actor.name}</strong> nota ${hazard.name}</p>
            <p><em>${hazard.description}</em></p>
            <p>Evitare: ${hazard.avoidance}</p>
          </div>
        `,
        speaker: ChatMessage.getSpeaker({ actor })
      });
      return true;
    }

    // Prova attiva
    if (detection.active) {
      const [skill, dc] = detection.active.split(" CD ");
      const skillKey = this._getSkillKey(skill);

      const roll = await actor.rollSkill(skillKey, {
        flavor: `Rilevare ${hazard.name}`
      });

      if (roll.total >= parseInt(dc)) {
        ChatMessage.create({
          content: `
            <div class="brancalonia-hazard-detected">
              <h3>🔍 Hazard Individuato!</h3>
              <p><strong>${actor.name}</strong> individua ${hazard.name}</p>
              <p>Tiro: ${roll.total} vs CD ${dc}</p>
            </div>
          `,
          speaker: ChatMessage.getSpeaker({ actor })
        });
        return true;
      }
    }

    return false;
  }

  /**
   * Genera hazard casuale per tipo di ambiente
   */
  generateRandomHazard(environment = "wilderness") {
    const hazardList = this.randomTables[environment];
    if (!hazardList || hazardList.length === 0) {
      ui.notifications.warn(`Nessun hazard per ambiente: ${environment}`);
      return null;
    }

    const frequency = game.settings.get("brancalonia-bigat", "hazardFrequency");
    const chances = { low: 0.1, medium: 0.2, high: 0.35, extreme: 0.5 };

    if (Math.random() > chances[frequency]) {
      return null; // Nessun hazard
    }

    const hazardName = hazardList[Math.floor(Math.random() * hazardList.length)];
    return this.hazards[hazardName];
  }

  /**
   * Piazza hazard sulla scena
   */
  async placeHazardOnScene(hazardName, x, y) {
    const hazard = this.hazards[hazardName];
    if (!hazard) return;

    // Crea tile per rappresentare l'hazard
    const tileData = {
      img: hazard.icon,
      x: x,
      y: y,
      width: 100,
      height: 100,
      hidden: true, // Visibile solo al GM
      locked: false,
      flags: {
        brancalonia: {
          isHazard: true,
          hazardType: hazardName
        }
      }
    };

    await canvas.scene.createEmbeddedDocuments("Tile", [tileData]);

    // Aggiungi alla lista hazard della scena
    const sceneHazards = canvas.scene.flags.brancalonia?.hazards || [];
    sceneHazards.push({
      type: hazardName,
      x: x,
      y: y,
      radius: 100,
      triggered: false
    });

    await canvas.scene.setFlag("brancalonia-bigat", "hazards", sceneHazards);

    ui.notifications.info(`Hazard ${hazard.name} piazzato`);
  }

  /**
   * Rimuove hazard dalla scena
   */
  async removeHazardFromScene(hazardName) {
    const tiles = canvas.tiles.placeables.filter(t =>
      t.document.flags.brancalonia?.hazardType === hazardName
    );

    for (let tile of tiles) {
      await tile.document.delete();
    }

    const sceneHazards = canvas.scene.flags.brancalonia?.hazards || [];
    const filtered = sceneHazards.filter(h => h.type !== hazardName);
    await canvas.scene.setFlag("brancalonia-bigat", "hazards", filtered);
  }

  /**
   * Controlla se token è in hazard
   */
  _isTokenInHazard(token, hazard) {
    const distance = Math.sqrt(
      Math.pow(token.x - hazard.x, 2) +
      Math.pow(token.y - hazard.y, 2)
    );
    return distance <= hazard.radius;
  }

  /**
   * Ottieni hazard vicini
   */
  _getNearbyHazards(actor) {
    const token = actor.getActiveTokens()[0];
    if (!token) return [];

    const sceneHazards = canvas.scene.flags.brancalonia?.hazards || [];
    return sceneHazards
      .filter(h => this._isTokenInHazard(token, h))
      .map(h => h.type);
  }

  /**
   * Controlla hazard meteo
   */
  async _checkWeatherHazards() {
    if (!game.settings.get("brancalonia-bigat", "enableHazards")) return;

    // 10% probabilità di evento meteo
    if (Math.random() < 0.1) {
      const weatherHazards = ["tempesta_improvvisa", "nebbia_velenosa"];
      const hazardName = weatherHazards[Math.floor(Math.random() * weatherHazards.length)];

      ChatMessage.create({
        content: `
          <div class="brancalonia-weather-hazard">
            <h2>🌩️ PERICOLO METEOROLOGICO!</h2>
            <p>${this.hazards[hazardName].name} si sta avvicinando!</p>
            <p>${this.hazards[hazardName].description}</p>
          </div>
        `,
        whisper: ChatMessage.getWhisperRecipients("GM")
      });

      // Applica a tutti i token all'aperto
      for (let token of canvas.tokens.placeables) {
        if (token.actor && !token.document.flags.brancalonia?.indoor) {
          await this.triggerHazard(hazardName, token.actor);
        }
      }
    }
  }

  /**
   * Applica hazard di area
   */
  _applyAreaHazard(hazard) {
    // Applica a tutti i token nell'area
    for (let token of canvas.tokens.placeables) {
      if (token.actor) {
        this._applyHazardEffect(token.actor, hazard);
      }
    }
  }

  /**
   * Ottieni chiave skill da nome
   */
  _getSkillKey(skillName) {
    const skillMap = {
      "Sopravvivenza": "sur",
      "Percezione": "prc",
      "Investigare": "inv",
      "Natura": "nat",
      "Arcano": "arc",
      "Religione": "rel",
      "Atletica": "ath",
      "Acrobazia": "acr",
      "Furtività": "ste",
      "Streetwise": "streetwise"
    };
    return skillMap[skillName] || "prc";
  }

  /**
   * UI per gestione hazard (GM)
   */
  renderHazardManager() {
    const content = `
      <div class="brancalonia-hazard-manager">
        <h2>⚠️ Gestione Hazard Ambientali</h2>

        <div class="hazard-controls">
          <h3>Genera Hazard Casuale</h3>
          <select id="environment-select">
            <option value="wilderness">Natura Selvaggia</option>
            <option value="urban">Urbano</option>
            <option value="dungeon">Dungeon</option>
            <option value="magical">Magico</option>
          </select>
          <button id="generate-hazard">Genera</button>
        </div>

        <div class="hazard-list">
          <h3>Hazard Disponibili</h3>
          <div class="hazard-grid">
            ${Object.entries(this.hazards).map(([key, hazard]) => `
              <div class="hazard-item" data-hazard="${key}">
                <img src="${hazard.icon}" title="${hazard.name}">
                <span>${hazard.name}</span>
                <button class="trigger-hazard" data-hazard="${key}">Attiva</button>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="scene-hazards">
          <h3>Hazard nella Scena</h3>
          ${(canvas.scene?.flags.brancalonia?.hazards || []).map(h => `
            <div class="scene-hazard">
              <span>${this.hazards[h.type]?.name || h.type}</span>
              <button class="remove-hazard" data-hazard="${h.type}">Rimuovi</button>
            </div>
          `).join('') || '<p>Nessun hazard attivo</p>'}
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: "Gestione Hazard",
      content: content,
      buttons: {
        close: { label: "Chiudi" }
      },
      render: html => {
        html.find('#generate-hazard').click(() => {
          const env = html.find('#environment-select').val();
          const hazard = this.generateRandomHazard(env);
          if (hazard) {
            this.triggerHazard(Object.keys(this.hazards).find(k =>
              this.hazards[k] === hazard
            ));
          }
        });

        html.find('.trigger-hazard').click(ev => {
          const hazardName = ev.currentTarget.dataset.hazard;
          this.triggerHazard(hazardName);
        });

        html.find('.remove-hazard').click(ev => {
          const hazardName = ev.currentTarget.dataset.hazard;
          this.removeHazardFromScene(hazardName);
        });
      }
    });

    dialog.render(true);
  }
}