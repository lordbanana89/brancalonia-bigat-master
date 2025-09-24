/**
 * Sistema Imbosco e Rischi del Mestiere
 * Basato sul manuale Brancalonia (pag. 49-50)
 * Compatibile con dnd5e system v3.3.x
 *
 * REGOLE DAL MANUALE:
 * - Imbosco: riduce taglia di 5-10 mo per settimana
 * - Rischi del Mestiere: eventi negativi casuali durante lo Sbraco
 */

export class ImboscoRischiSystem {
  constructor() {
    // Tabella Rischi del Mestiere (pag. 50)
    this.rischiMestiere = [
      {
        range: [1, 2],
        name: "Editto contro la banda",
        description: "Le autorità locali emettono un editto contro la banda. +10 mo alla Taglia di tutti i membri.",
        effect: "increaseAllTaglie",
        value: 10
      },
      {
        range: [3, 4],
        name: "Guerra tra bande",
        description: "Una banda rivale dichiara guerra. Il prossimo lavoretto inizia con un'imboscata.",
        effect: "bandWar",
        duration: "nextJob"
      },
      {
        range: [5, 6],
        name: "Spia nella banda",
        description: "Un membro della banda è una spia. Il capobanda deve identificarla o subire conseguenze.",
        effect: "spy",
        difficulty: "investigation"
      },
      {
        range: [7, 8],
        name: "Razzia al Covo",
        description: "Il Covo viene razziato. Perdete 1d3 livelli di Granlussi casuali.",
        effect: "covoRaid",
        damage: "1d3"
      },
      {
        range: [9, 10],
        name: "Tradimento del capobanda",
        description: "Il capobanda tradisce o viene arrestato. La banda deve eleggerne uno nuovo.",
        effect: "leaderBetrayal"
      },
      {
        range: [11, 12],
        name: "Malattia nel Covo",
        description: "Una malattia si diffonde nel Covo. Tutti devono superare un TS Costituzione CD 12 o subire 1 livello di indebolimento.",
        effect: "disease",
        save: "con",
        dc: 12
      },
      {
        range: [13, 14],
        name: "Debiti di gioco",
        description: "La banda accumula debiti di gioco per 2d20 × 10 mo che devono essere pagati.",
        effect: "gamblingDebt",
        amount: "2d20*10"
      },
      {
        range: [15, 16],
        name: "Incendio al Covo",
        description: "Un incendio danneggia il Covo. Costa 100 mo riparare i danni o perdete 1 Granlusso permanentemente.",
        effect: "fire",
        repairCost: 100
      },
      {
        range: [17, 18],
        name: "Infiltrato di Equitaglia",
        description: "Un agente di Equitaglia si infiltra. Tutte le Taglie aumentano del 50% (arrotondate per eccesso).",
        effect: "equitagliaAgent",
        multiplier: 1.5
      },
      {
        range: [19, 20],
        name: "Maledizione",
        description: "La banda attira una maledizione. Svantaggio a tutti i tiri salvezza per il prossimo lavoretto.",
        effect: "curse",
        duration: "nextJob"
      }
    ];

    // Benefici Imbosco
    this.imboscoConfig = {
      minReduction: 5,
      maxReduction: 10,
      requirements: "Nessuna attività pubblica per 1 settimana",
      restrictions: [
        "Non può partecipare a Bagordi",
        "Non può usare Favori",
        "Non può visitare luoghi pubblici",
        "Non può interagire con PNG importanti"
      ]
    };

    this._setupHooks();
  }

  _setupHooks() {
    // Hook per Sbraco - gestisce Imbosco
    Hooks.on("brancalonia.sbracoStarted", () => {
      // L'imbosco è già gestito in rest-system.js
      // Qui aggiungiamo solo tracking aggiuntivo
      this._trackImboscoChoices();
    });

    // Hook per fine Sbraco - tira Rischi del Mestiere
    Hooks.on("brancalonia.sbracoEnded", () => {
      if (game.user.isGM) {
        this._checkRischiMestiere();
      }
    });

    // Hook per UI
    Hooks.on("renderSidebarTab", (app, html) => {
      if (app.id === "chat" && game.user.isGM) {
        this._addRischiButton(html);
      }
    });
  }

  /**
   * Traccia le scelte di Imbosco
   */
  _trackImboscoChoices() {
    const imboscati = game.actors.filter(a =>
      a.type === "character" &&
      a.getFlag("brancalonia-bigat", "sbracoChoice") === "imbosco"
    );

    if (imboscati.length > 0) {
      ChatMessage.create({
        content: `
          <div class="imbosco-tracker">
            <h3>🌲 Personaggi Imboscati</h3>
            <p>I seguenti personaggi si sono imboscati per questa settimana:</p>
            <ul>
              ${imboscati.map(a => `
                <li>${a.name} - Riduzione taglia: 5-10 mo</li>
              `).join('')}
            </ul>
            <p style="color: red;">
              ⚠️ Non possono: partecipare a Bagordi, usare Favori, visitare luoghi pubblici
            </p>
          </div>
        `,
        whisper: ChatMessage.getWhisperRecipients("GM")
      });
    }
  }

  /**
   * Applica effetti Imbosco (chiamato da rest-system.js)
   */
  async applyImbosco(actor) {
    const currentTaglia = actor.getFlag("brancalonia-bigat", "taglia") || 0;
    const reduction = Math.floor(Math.random() * 6) + 5; // 5-10
    const newTaglia = Math.max(0, currentTaglia - reduction);

    await actor.setFlag("brancalonia-bigat", "taglia", newTaglia);
    await actor.setFlag("brancalonia-bigat", "imboscato", true);

    // Applica restrizioni come Active Effect temporaneo
    const effect = {
      name: "Imboscato",
      icon: "icons/environment/wilderness/tree-oak.webp",
      duration: { seconds: 604800 }, // 1 settimana
      changes: [
        {
          key: "system.attributes.inspiration",
          mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
          value: false
        }
      ],
      flags: {
        brancalonia: {
          imboscato: true,
          restrictions: this.imboscoConfig.restrictions
        }
      }
    };

    await actor.createEmbeddedDocuments("ActiveEffect", [effect]);

    ChatMessage.create({
      content: `
        <div class="imbosco-result">
          <h3>🌲 ${actor.name} si è imboscato</h3>
          <p>Taglia ridotta di <strong>${reduction} mo</strong></p>
          <p>Nuova taglia: ${newTaglia} mo</p>
          <p>Restrizioni attive per 1 settimana</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({actor})
    });

    return reduction;
  }

  /**
   * Controlla e applica Rischi del Mestiere
   */
  async _checkRischiMestiere() {
    // Dialog per decidere se tirare
    const content = `
      <div class="rischi-check">
        <h3>Rischi del Mestiere</h3>
        <p>Alla fine dello Sbraco, potresti dover affrontare i Rischi del Mestiere.</p>

        <div style="margin: 15px 0;">
          <label>
            <strong>Situazione della banda:</strong>
          </label>
          <div>
            <label>
              <input type="checkbox" name="modifier" value="highProfile">
              Taglia totale della Cricca > 500 mo (+2)
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" name="modifier" value="enemies">
              Nemici potenti o bande rivali (+3)
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" name="modifier" value="failed">
              Ultimo lavoretto fallito (+2)
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" name="modifier" value="public">
              Azioni pubbliche eclatanti (+2)
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" name="modifier" value="protected">
              Covo ben protetto/nascosto (-2)
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" name="modifier" value="allies">
              Alleati potenti o favori (-3)
            </label>
          </div>
        </div>

        <hr>
        <p><strong>Probabilità base:</strong> Tiro 1d20, rischio su 1-5</p>
        <p><strong>Modificatore totale:</strong> <span id="total-mod">+0</span></p>
        <p><strong>Rischio su:</strong> <span id="risk-range">1-5</span></p>
      </div>
    `;

    new Dialog({
      title: "Rischi del Mestiere",
      content,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice"></i>',
          label: "Tira",
          callback: async (html) => {
            let modifier = 0;
            html.find('input[name="modifier"]:checked').each((i, el) => {
              const value = el.value;
              if (value === "highProfile") modifier += 2;
              else if (value === "enemies") modifier += 3;
              else if (value === "failed") modifier += 2;
              else if (value === "public") modifier += 2;
              else if (value === "protected") modifier -= 2;
              else if (value === "allies") modifier -= 3;
            });

            await this._rollRischiMestiere(modifier);
          }
        },
        skip: {
          label: "Salta"
        }
      },
      render: (html) => {
        // Aggiorna preview
        html.find('input[name="modifier"]').change(() => {
          let modifier = 0;
          html.find('input[name="modifier"]:checked').each((i, el) => {
            const value = el.value;
            if (value === "highProfile") modifier += 2;
            else if (value === "enemies") modifier += 3;
            else if (value === "failed") modifier += 2;
            else if (value === "public") modifier += 2;
            else if (value === "protected") modifier -= 2;
            else if (value === "allies") modifier -= 3;
          });

          const baseRange = 5;
          const finalRange = Math.max(1, Math.min(20, baseRange + modifier));

          html.find('#total-mod').text(modifier >= 0 ? `+${modifier}` : modifier);
          html.find('#risk-range').text(`1-${finalRange}`);
        });
      }
    }).render(true);
  }

  /**
   * Tira per Rischi del Mestiere
   */
  async _rollRischiMestiere(modifier = 0) {
    const baseThreshold = 5;
    const threshold = Math.max(1, Math.min(20, baseThreshold + modifier));

    const roll = await new Roll("1d20").evaluate();

    ChatMessage.create({
      content: `
        <div class="rischi-roll">
          <h3>Rischi del Mestiere</h3>
          <p>Soglia: 1-${threshold}</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({alias: "GM"}),
      rolls: [roll]
    });

    if (roll.total <= threshold) {
      // Tira sulla tabella eventi
      const eventRoll = await new Roll("1d20").evaluate();
      const event = this._getRischiEvent(eventRoll.total);

      await this._applyRischiEvent(event);

      ChatMessage.create({
        content: `
          <div class="rischi-event" style="border: 2px solid red; padding: 10px; background: #ffeeee;">
            <h3>⚠️ RISCHIO DEL MESTIERE!</h3>
            <h4>${event.name}</h4>
            <p>${event.description}</p>
          </div>
        `,
        speaker: ChatMessage.getSpeaker({alias: "GM"}),
        rolls: [eventRoll]
      });
    } else {
      ChatMessage.create({
        content: `
          <div class="rischi-safe">
            <h3>✅ Nessun Rischio</h3>
            <p>La banda evita problemi durante lo Sbraco!</p>
          </div>
        `,
        speaker: ChatMessage.getSpeaker({alias: "GM"})
      });
    }
  }

  /**
   * Ottieni evento dalla tabella
   */
  _getRischiEvent(roll) {
    for (const event of this.rischiMestiere) {
      if (roll >= event.range[0] && roll <= event.range[1]) {
        return event;
      }
    }
    return this.rischiMestiere[0];
  }

  /**
   * Applica effetti dell'evento
   */
  async _applyRischiEvent(event) {
    const actors = game.actors.filter(a =>
      a.type === "character" && a.hasPlayerOwner
    );

    switch(event.effect) {
      case "increaseAllTaglie":
        for (const actor of actors) {
          const current = actor.getFlag("brancalonia-bigat", "taglia") || 0;
          await actor.setFlag("brancalonia-bigat", "taglia", current + event.value);
        }
        break;

      case "bandWar":
        await game.settings.set("brancalonia-bigat", "bandWar", true);
        break;

      case "spy":
        await this._handleSpyEvent();
        break;

      case "covoRaid":
        await this._handleCovoRaid();
        break;

      case "leaderBetrayal":
        await this._handleLeaderBetrayal();
        break;

      case "disease":
        await this._handleDiseaseOutbreak(event);
        break;

      case "gamblingDebt":
        const debt = await new Roll(event.amount).evaluate();
        await game.settings.set("brancalonia-bigat", "bandDebt",
          (game.settings.get("brancalonia-bigat", "bandDebt") || 0) + debt.total
        );
        ChatMessage.create({
          content: `La banda accumula ${debt.total} mo di debiti!`,
          rolls: [debt]
        });
        break;

      case "fire":
        await this._handleCovoFire(event);
        break;

      case "equitagliaAgent":
        for (const actor of actors) {
          const current = actor.getFlag("brancalonia-bigat", "taglia") || 0;
          await actor.setFlag("brancalonia-bigat", "taglia", Math.ceil(current * event.multiplier));
        }
        break;

      case "curse":
        await this._applyCurse(actors);
        break;
    }
  }

  /**
   * Gestisce evento spia
   */
  async _handleSpyEvent() {
    const actors = game.actors.filter(a =>
      a.type === "character" && a.hasPlayerOwner
    );

    const spy = actors[Math.floor(Math.random() * actors.length)];
    await spy.setFlag("brancalonia-bigat", "secretSpy", true);

    // Notifica solo al GM
    ChatMessage.create({
      content: `
        <div class="spy-secret">
          <h3>🕵️ SPIA SEGRETA</h3>
          <p><strong>${spy.name}</strong> è segretamente una spia!</p>
          <p>I giocatori devono scoprirlo con Investigation CD 15</p>
        </div>
      `,
      whisper: ChatMessage.getWhisperRecipients("GM")
    });
  }

  /**
   * Gestisce razzia al Covo
   */
  async _handleCovoRaid() {
    const roll = await new Roll("1d3").evaluate();
    const damage = roll.total;

    ChatMessage.create({
      content: `
        <div class="covo-raid">
          <h3>⚔️ Razzia al Covo!</h3>
          <p>Il Covo perde ${damage} livello/i di Granlussi casuali!</p>
        </div>
      `,
      rolls: [roll]
    });

    // Rimuovi livelli casuali
    // Questo richiede coordinamento con covo-granlussi.js
    if (game.brancalonia?.covoGranlussi) {
      for (let i = 0; i < damage; i++) {
        await game.brancalonia.covoGranlussi.damageRandomGranlusso();
      }
    }
  }

  /**
   * Gestisce tradimento del capobanda
   */
  async _handleLeaderBetrayal() {
    const content = `
      <div class="leader-betrayal">
        <h3>😱 Tradimento del Capobanda!</h3>
        <p>Il capobanda è stato arrestato o è fuggito con la cassa!</p>
        <p>La banda deve eleggere un nuovo capobanda.</p>

        <div style="margin: 15px 0;">
          <label>
            <strong>Nuovo capobanda:</strong>
            <select id="new-leader">
              ${game.actors.filter(a => a.type === "character" && a.hasPlayerOwner)
                .map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
            </select>
          </label>
        </div>
      </div>
    `;

    new Dialog({
      title: "Elezione Nuovo Capobanda",
      content,
      buttons: {
        elect: {
          label: "Eleggi",
          callback: async (html) => {
            const newLeaderId = html.find('#new-leader').val();
            const newLeader = game.actors.get(newLeaderId);

            await game.settings.set("brancalonia-bigat", "capobanda", newLeaderId);

            ChatMessage.create({
              content: `${newLeader.name} è il nuovo capobanda!`,
              speaker: ChatMessage.getSpeaker({alias: "Banda"})
            });
          }
        }
      }
    }).render(true);
  }

  /**
   * Gestisce epidemia di malattia
   */
  async _handleDiseaseOutbreak(event) {
    const actors = game.actors.filter(a =>
      a.type === "character" && a.hasPlayerOwner
    );

    for (const actor of actors) {
      const roll = await actor.rollAbilitySave(event.save, {
        dc: event.dc,
        flavor: "Resistere alla malattia"
      });

      if (roll.total < event.dc) {
        const currentExhaustion = actor.system.attributes.exhaustion || 0;
        await actor.update({
          "system.attributes.exhaustion": Math.min(6, currentExhaustion + 1)
        });

        ChatMessage.create({
          content: `${actor.name} si ammala! (+1 livello indebolimento)`,
          speaker: ChatMessage.getSpeaker({actor})
        });
      }
    }
  }

  /**
   * Gestisce incendio al Covo
   */
  async _handleCovoFire(event) {
    const content = `
      <div class="covo-fire">
        <h3>🔥 Incendio al Covo!</h3>
        <p>Un incendio ha danneggiato il Covo!</p>
        <p>Opzioni:</p>
        <ul>
          <li>Pagare ${event.repairCost} mo per riparare i danni</li>
          <li>Perdere permanentemente 1 Granlusso casuale</li>
        </ul>
      </div>
    `;

    new Dialog({
      title: "Incendio al Covo",
      content,
      buttons: {
        pay: {
          label: `Paga ${event.repairCost} mo`,
          callback: async () => {
            // Dedurre denaro dalla cassa comune
            ChatMessage.create({
              content: "La banda paga per riparare i danni dell'incendio."
            });
          }
        },
        lose: {
          label: "Perdi Granlusso",
          callback: async () => {
            if (game.brancalonia?.covoGranlussi) {
              await game.brancalonia.covoGranlussi.destroyRandomGranlusso();
            }
          }
        }
      }
    }).render(true);
  }

  /**
   * Applica maledizione
   */
  async _applyCurse(actors) {
    for (const actor of actors) {
      const effect = {
        name: "Maledizione della Banda",
        icon: "icons/magic/unholy/orb-glowing-purple.webp",
        duration: { rounds: 100 }, // Durata simbolica
        changes: [],
        flags: {
          brancalonia: {
            curse: true,
            description: "Svantaggio a tutti i tiri salvezza per il prossimo lavoretto"
          }
        }
      };

      await actor.createEmbeddedDocuments("ActiveEffect", [effect]);
    }

    ChatMessage.create({
      content: `
        <div class="curse-applied">
          <h3>👻 Maledizione!</h3>
          <p>La banda è maledetta! Svantaggio ai TS per il prossimo lavoretto.</p>
        </div>
      `
    });
  }

  /**
   * Aggiungi bottone per Rischi nel chat
   */
  _addRischiButton(html) {
    const button = `
      <button class="rischi-mestiere-btn" style="margin: 5px;">
        <i class="fas fa-dice"></i> Rischi del Mestiere
      </button>
    `;

    html.find('.directory-header').append(button);

    html.find('.rischi-mestiere-btn').click(() => {
      this._checkRischiMestiere();
    });
  }

  /**
   * Registra impostazioni
   */
  static registerSettings() {
    game.settings.register("brancalonia-bigat", "autoRischi", {
      name: "Rischi Automatici",
      hint: "Tira automaticamente per Rischi del Mestiere alla fine dello Sbraco",
      scope: "world",
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register("brancalonia-bigat", "rischiFrequency", {
      name: "Frequenza Rischi",
      hint: "Ogni quanti Sbraco controllare i Rischi (1 = sempre)",
      scope: "world",
      config: true,
      type: Number,
      default: 1,
      range: {
        min: 1,
        max: 5,
        step: 1
      }
    });

    // Impostazioni per tracking eventi
    game.settings.register("brancalonia-bigat", "bandWar", {
      scope: "world",
      config: false,
      type: Boolean,
      default: false
    });

    game.settings.register("brancalonia-bigat", "bandDebt", {
      scope: "world",
      config: false,
      type: Number,
      default: 0
    });

    game.settings.register("brancalonia-bigat", "capobanda", {
      scope: "world",
      config: false,
      type: String,
      default: ""
    });
  }
}