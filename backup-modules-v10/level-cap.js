/**
 * Sistema Eroi di Bassa Lega - Level Cap & Emeriticenze
 * Implementazione fedele al manuale Brancalonia (pag. 40, 42)
 * Compatibile con dnd5e system v3.3.x
 */

class LevelCapSystem {
  constructor() {
    this.MAX_LEVEL = 6;
    this.BASE_EMERITICENZA_XP = 14000; // XP per raggiungere livello 7
    this.EMERITICENZA_STEP = 9000; // Ogni 9000 XP dopo il 6° = 1 emeriticenza

    // Lista emeriticenze dal manuale (pag. 40)
    this.emeriticenze = {
      affinamento: {
        name: "Affinamento",
        description: "Aumenta di 2 un punteggio caratteristica o di 1 due punteggi (max 20)",
        maxTimes: 2,
        apply: (actor) => this._applyASI(actor)
      },
      armaPreferita: {
        name: "Arma Preferita",
        description: "Aggiungi competenza ai danni con un tipo di arma specifica",
        requirements: ["Barbarian", "Fighter", "Paladin", "Ranger"],
        maxTimes: 1,
        apply: (actor) => this._applyPreferredWeapon(actor)
      },
      emeriticenzaAssoluta: {
        name: "Emeriticenza Assoluta",
        description: "Il bonus di competenza diventa +4",
        requirements: "2 altre emeriticenze",
        maxTimes: 1,
        apply: (actor) => this._applyAbsoluteMastery(actor)
      },
      energumeno: {
        name: "Energumeno",
        description: "PF massimi aumentano di 6 + modificatore Costituzione",
        maxTimes: 1,
        apply: (actor) => this._applyToughness(actor)
      },
      fandoniaMigliorata: {
        name: "Fandonia Migliorata",
        description: "Ottieni uno slot incantesimo aggiuntivo",
        requirements: "Incantatore",
        maxTimes: 1,
        apply: (actor) => this._applyExtraSpellSlot(actor)
      },
      fandoniaPotenziata: {
        name: "Fandonia Potenziata",
        description: "Lancia un incantesimo come se fosse di 1 livello superiore (1/riposo breve)",
        requirements: "Incantatore",
        maxTimes: 1,
        apply: (actor) => this._applyEmpoweredSpell(actor)
      },
      giocoSquadra: {
        name: "Gioco di Squadra",
        description: "Puoi effettuare l'azione di aiuto come azione bonus",
        maxTimes: 1,
        apply: (actor) => this._applyTeamwork(actor)
      },
      donoTalento: {
        name: "Il Dono del Talento",
        description: "Ottieni un talento",
        maxTimes: 2,
        apply: (actor) => this._applyFeat(actor)
      },
      indomito: {
        name: "Indomito",
        description: "Immune alla condizione spaventato",
        maxTimes: 1,
        apply: (actor) => this._applyFearless(actor)
      },
      recuperoMigliorato: {
        name: "Recupero Migliorato",
        description: "Un privilegio recuperabile con riposo lungo ora si recupera con riposo breve",
        maxTimes: 2,
        apply: (actor) => this._applyImprovedRecovery(actor)
      },
      rissaioloProfessionista: {
        name: "Rissaiolo Professionista",
        description: "Ottieni uno slot mossa aggiuntivo e apprendi una nuova mossa base",
        maxTimes: 2,
        apply: (actor) => this._applyBrawlerPro(actor)
      },
      santaFortuna: {
        name: "Santa Fortuna",
        description: "Aggiungi 1d8 a una prova, tiro per colpire o TS (1/riposo breve)",
        maxTimes: 1,
        apply: (actor) => this._applyLuck(actor)
      }
    };

    this._registerHooks();
  }

  _registerHooks() {
    // Impedisci di superare il livello massimo
    Hooks.on("preUpdateItem", (item, update) => {
      if (item.type !== "class") return;
      const actor = item.parent;
      if (!actor || actor.type !== "character") return;

      const newLevels = foundry.utils.getProperty(update, "system.levels");
      if (newLevels === undefined) return;

      const otherLevels = actor.items
        .filter(i => i.type === "class" && i.id !== item.id)
        .reduce((sum, cls) => sum + (cls.system.levels ?? 0), 0);

      const total = otherLevels + newLevels;
      if (total > this.MAX_LEVEL) {
        ui.notifications.error(game.i18n.localize("BRANCALONIA.LevelCapWarning"));
        return false;
      }
    });

    Hooks.on("preCreateItem", (item, data, opts, userId) => {
      if (item.type !== "class") return;
      const actor = item.parent;
      if (!actor || actor.type !== "character") return;

      const classLevels = actor.items
        .filter(i => i.type === "class")
        .reduce((sum, cls) => sum + (cls.system.levels ?? 0), 0);

      if (classLevels >= this.MAX_LEVEL) {
        ui.notifications.error(game.i18n.localize("BRANCALONIA.LevelCapWarning"));
        return false;
      }
    });

    // Controlla XP per emergiticenze
    HooksManager.on(HooksManager.HOOKS.UPDATE_ACTOR, (actor, updateData) => {
      if (actor.type !== "character") return;
      const xp = foundry.utils.getProperty(actor, "system.details.xp.value");
      if (xp === undefined) return;

      const taken = actor.getFlag("brancalonia-bigat", "emeriticenze") ?? 0;
      const nextThreshold = this.BASE_EMERITICENZA_XP + (taken + 1) * this.EMERITICENZA_STEP;

      if (xp >= nextThreshold) {
        actor.setFlag("brancalonia-bigat", "emeriticenze", taken + 1);
        this._notifyEmeriticenza(actor, taken + 1);
      }
    });
  }

  _notifyEmeriticenza(actor, count) {
    // Mostra dialog per scegliere emeriticenza
    this._showEmeriticenzaDialog(actor, count);
  }

  /**
   * Dialog per scegliere un'emeriticenza
   */
  _showEmeriticenzaDialog(actor, totalEmeriticenze) {
    const takenEmeriticenze = actor.getFlag("brancalonia-bigat", "emeriticenzeTaken") || {};
    const availableEmeriticenze = this._getAvailableEmeriticenze(actor, takenEmeriticenze);

    if (availableEmeriticenze.length === 0) {
      ui.notifications.warn("Nessuna emeriticenza disponibile!");
      return;
    }

    const content = `
      <div class="brancalonia-emeriticenza-dialog">
        <h3>Scegli un'Emeriticenza</h3>
        <p>Hai raggiunto ${14000 + (totalEmeriticenze * 9000)} PE!</p>
        <p>Puoi scegliere una delle seguenti Emeriticenze:</p>

        <div class="emeriticenze-list">
          ${availableEmeriticenze.map(em => `
            <label class="emeriticenza-option">
              <input type="radio" name="emeriticenza" value="${em.key}">
              <div class="emeriticenza-info">
                <strong>${em.name}</strong>
                <p>${em.description}</p>
                ${em.requirements ? `<p class="requirements">Requisiti: ${em.requirements}</p>` : ''}
                ${em.timesTaken > 0 ? `<p class="times-taken">Già presa ${em.timesTaken} volta/e</p>` : ''}
              </div>
            </label>
          `).join('')}
        </div>
      </div>
    `;

    new Dialog({
      title: `Emeriticenza - ${actor.name}`,
      content: content,
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: "Conferma",
          callback: async (html) => {
            const chosen = html.find('input[name="emeriticenza"]:checked').val();
            if (chosen) {
              await this._applyEmeriticenza(actor, chosen);
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Annulla"
        }
      },
      default: "confirm"
    }).render(true);
  }

  /**
   * Ottieni emeriticenze disponibili per un attore
   */
  _getAvailableEmeriticenze(actor, takenEmeriticenze) {
    const available = [];

    for (const [key, em] of Object.entries(this.emeriticenze)) {
      const timesTaken = takenEmeriticenze[key] || 0;

      // Controlla se può essere presa ancora
      if (em.maxTimes && timesTaken >= em.maxTimes) continue;

      // Controlla requisiti
      if (em.requirements) {
        if (Array.isArray(em.requirements)) {
          // Requisiti di classe
          const hasClass = actor.items.some(i =>
            i.type === "class" && em.requirements.includes(i.name)
          );
          if (!hasClass) continue;
        } else if (em.requirements === "Incantatore") {
          // Requisito incantatore
          const isSpellcaster = actor.items.some(i =>
            i.type === "class" && i.system.spellcasting?.progression !== "none"
          );
          if (!isSpellcaster) continue;
        } else if (em.requirements === "2 altre emeriticenze") {
          // Requisito numero emeriticenze
          const totalTaken = Object.values(takenEmeriticenze).reduce((a, b) => a + b, 0);
          if (totalTaken < 2) continue;
        }
      }

      available.push({
        key,
        ...em,
        timesTaken
      });
    }

    return available;
  }

  /**
   * Applica un'emeriticenza scelta
   */
  async _applyEmeriticenza(actor, emeriticenzaKey) {
    const em = this.emeriticenze[emeriticenzaKey];
    if (!em) return;

    // Registra la scelta
    const taken = actor.getFlag("brancalonia-bigat", "emeriticenzeTaken") || {};
    taken[emeriticenzaKey] = (taken[emeriticenzaKey] || 0) + 1;
    await actor.setFlag("brancalonia-bigat", "emeriticenzeTaken", taken);

    // Applica l'effetto
    await em.apply(actor);

    // Notifica
    ChatMessage.create({
      content: `
        <div class="brancalonia-emeriticenza">
          <h3>${actor.name} ottiene: ${em.name}</h3>
          <p>${em.description}</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({actor})
    });
  }

  // Funzioni di applicazione per ogni emeriticenza

  async _applyASI(actor) {
    // Dialog per scegliere quale caratteristica aumentare
    const abilities = CONFIG.DND5E.abilities;
    const content = `
      <div>
        <p>Scegli come distribuire i punti caratteristica:</p>
        <label>
          <input type="radio" name="asi-type" value="single" checked>
          +2 a una caratteristica
        </label>
        <label>
          <input type="radio" name="asi-type" value="double">
          +1 a due caratteristiche
        </label>
        <hr>
        <div class="asi-single">
          <label>Caratteristica:
            <select name="single-ability">
              ${Object.entries(abilities).map(([key, label]) =>
                `<option value="${key}">${label}</option>`
              ).join('')}
            </select>
          </label>
        </div>
        <div class="asi-double" style="display:none;">
          <label>Prima caratteristica:
            <select name="first-ability">
              ${Object.entries(abilities).map(([key, label]) =>
                `<option value="${key}">${label}</option>`
              ).join('')}
            </select>
          </label>
          <label>Seconda caratteristica:
            <select name="second-ability">
              ${Object.entries(abilities).map(([key, label]) =>
                `<option value="${key}">${label}</option>`
              ).join('')}
            </select>
          </label>
        </div>
      </div>
    `;

    new Dialog({
      title: "Affinamento - Aumento Caratteristiche",
      content,
      buttons: {
        confirm: {
          label: "Conferma",
          callback: async (html) => {
            const type = html.find('input[name="asi-type"]:checked').val();
            const updates = {};

            if (type === "single") {
              const ability = html.find('select[name="single-ability"]').val();
              const current = actor.system.abilities[ability].value;
              updates[`system.abilities.${ability}.value`] = Math.min(20, current + 2);
            } else {
              const first = html.find('select[name="first-ability"]').val();
              const second = html.find('select[name="second-ability"]').val();

              const currentFirst = actor.system.abilities[first].value;
              const currentSecond = actor.system.abilities[second].value;

              updates[`system.abilities.${first}.value`] = Math.min(20, currentFirst + 1);
              updates[`system.abilities.${second}.value`] = Math.min(20, currentSecond + 1);
            }

            await actor.update(updates);
          }
        }
      },
      render: (html) => {
        html.find('input[name="asi-type"]').change((e) => {
          const isSingle = e.target.value === "single";
          html.find('.asi-single').toggle(isSingle);
          html.find('.asi-double').toggle(!isSingle);
        });
      }
    }).render(true);
  }

  async _applyPreferredWeapon(actor) {
    // Crea un Active Effect per il bonus ai danni
    const effect = {
      name: "Arma Preferita",
      img: "icons/skills/melee/sword-katana-red.webp",
      origin: actor.uuid,
      duration: {},
      changes: [],
      flags: {
        brancalonia: {
          emeriticenza: "armaPreferita",
          weaponType: null // Sarà impostato tramite dialog
        }
      }
    };

    await actor.createEmbeddedDocuments("ActiveEffect", [effect]);
  }

  async _applyAbsoluteMastery(actor) {
    // Modifica il bonus di competenza
    const effect = {
      name: "Emeriticenza Assoluta",
      img: "icons/magic/control/buff-flight-wings-blue.webp",
      origin: actor.uuid,
      duration: {},
      changes: [{
        key: "system.attributes.prof",
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: 4
      }]
    };

    await actor.createEmbeddedDocuments("ActiveEffect", [effect]);
  }

  async _applyToughness(actor) {
    const conMod = actor.system.abilities.con.mod;
    const hpIncrease = 6 + conMod;
    const currentMax = actor.system.attributes.hp.max;

    await actor.update({
      "system.attributes.hp.max": currentMax + hpIncrease,
      "system.attributes.hp.value": actor.system.attributes.hp.value + hpIncrease
    });
  }

  async _applyExtraSpellSlot(actor) {
    // Dialog per scegliere il livello dello slot
    const spellcasting = actor.items.find(i => i.type === "class" && i.system.spellcasting?.progression);
    if (!spellcasting) return;

    // Calcola livelli di slot disponibili
    const classItem = actor.items.find(i => i.type === "class" && i.name === spellcasting.name);
    const classLevels = classItem?.system.levels || 1;
    const maxLevel = Math.ceil(classLevels / 2) || 1;

    const content = `
      <p>Scegli il livello dello slot incantesimo aggiuntivo:</p>
      <select name="slot-level">
        ${Array.from({length: Math.min(maxLevel, 3)}, (_, i) => i + 1).map(level =>
          `<option value="${level}">Livello ${level}</option>`
        ).join('')}
      </select>
    `;

    new Dialog({
      title: "Fandonia Migliorata - Slot Aggiuntivo",
      content,
      buttons: {
        confirm: {
          label: "Conferma",
          callback: async (html) => {
            const level = html.find('select[name="slot-level"]').val();
            const key = `system.spells.spell${level}.max`;
            const current = actor.system.spells[`spell${level}`]?.max || 0;

            await actor.update({
              [key]: current + 1
            });
          }
        }
      }
    }).render(true);
  }

  async _applyEmpoweredSpell(actor) {
    // Crea un oggetto Feature per rappresentare questa capacità
    const feature = {
      name: "Fandonia Potenziata",
      type: "feat",
      img: "icons/magic/fire/projectile-fireball-orange.webp",
      system: {
        description: {
          value: "<p>Una volta per riposo breve, puoi lanciare un incantesimo come se utilizzassi uno slot di un livello superiore.</p>"
        },
        activation: {
          type: "special",
          cost: 1
        },
        uses: {
          value: 1,
          max: 1,
          per: "sr",
          recovery: "1"
        },
        actionType: "util"
      }
    };

    await actor.createEmbeddedDocuments("Item", [feature]);
  }

  async _applyTeamwork(actor) {
    // Crea feature per azione aiuto bonus
    const feature = {
      name: "Gioco di Squadra",
      type: "feat",
      img: "icons/skills/social/diplomacy-handshake-yellow.webp",
      system: {
        description: {
          value: "<p>Puoi usare l'azione Aiuto come azione bonus.</p>"
        },
        activation: {
          type: "bonus",
          cost: 1
        },
        actionType: "util"
      }
    };

    await actor.createEmbeddedDocuments("Item", [feature]);
  }

  async _applyFeat(actor) {
    // Apri compendio talenti per scegliere
    ui.notifications.info("Scegli un talento dal compendio");
    const pack = game.packs.get("brancalonia-bigat.talenti");
    if (pack) {
      pack.render(true);
    }
  }

  async _applyFearless(actor) {
    // Crea Active Effect per immunità a spaventato
    const effect = {
      name: "Indomito",
      img: "icons/magic/control/debuff-fear-terror-purple.webp",
      origin: actor.uuid,
      duration: {},
      changes: [{
        key: "system.traits.ci.value",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: "frightened"
      }]
    };

    await actor.createEmbeddedDocuments("ActiveEffect", [effect]);
  }

  async _applyImprovedRecovery(actor) {
    // Dialog per scegliere quale capacità migliorare
    const features = actor.items.filter(i =>
      i.type === "feat" &&
      i.system.uses?.per === "lr" &&
      !i.flags.brancalonia?.improvedRecovery
    );

    if (features.length === 0) {
      ui.notifications.warn("Nessuna capacità migliorabile trovata!");
      return;
    }

    const content = `
      <p>Scegli quale capacità potrà essere recuperata con un riposo breve:</p>
      <select name="feature">
        ${features.map(f =>
          `<option value="${f.id}">${f.name}</option>`
        ).join('')}
      </select>
    `;

    new Dialog({
      title: "Recupero Migliorato",
      content,
      buttons: {
        confirm: {
          label: "Conferma",
          callback: async (html) => {
            const featureId = html.find('select[name="feature"]').val();
            const feature = actor.items.get(featureId);

            await feature.update({
              "system.uses.per": "sr",
              "flags.brancalonia.improvedRecovery": true
            });
          }
        }
      }
    }).render(true);
  }

  async _applyBrawlerPro(actor) {
    // Aggiungi slot mossa e nuova mossa
    const currentSlots = actor.getFlag("brancalonia-bigat", "brawlMoveSlots") || 2;
    await actor.setFlag("brancalonia-bigat", "brawlMoveSlots", currentSlots + 1);

    // Notifica per scegliere nuova mossa
    ui.notifications.info("Scegli una nuova mossa base dal sistema Risse");

    // Se il sistema risse è attivo, apri il dialog
    if (game.brancalonia?.tavernBrawl) {
      game.brancalonia.tavernBrawl.showMoveSelectionDialog(actor);
    }
  }

  async _applyLuck(actor) {
    // Crea feature per Santa Fortuna
    const feature = {
      name: "Santa Fortuna",
      type: "feat",
      img: "icons/magic/holy/prayer-hands-glowing-yellow.webp",
      system: {
        description: {
          value: "<p>Una volta per riposo breve, puoi aggiungere 1d8 a una prova di caratteristica, tiro per colpire o tiro salvezza.</p>"
        },
        activation: {
          type: "special",
          cost: 0
        },
        uses: {
          value: 1,
          max: 1,
          per: "sr",
          recovery: "1"
        },
        actionType: "util"
      }
    };

    await actor.createEmbeddedDocuments("Item", [feature]);
  }
}
