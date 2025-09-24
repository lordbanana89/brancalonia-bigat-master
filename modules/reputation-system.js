/**
 * Sistema Reputazione Positiva per Brancalonia
 * Complementa il sistema Infamia con reputazione positiva e onore
 * Compatibile con dnd5e system per Foundry VTT v13
 */

export class ReputationSystem {
  constructor() {
    // Tipi di reputazione positiva
    this.reputationTypes = {
      "onore": {
        name: "Onore",
        icon: "icons/skills/social/diplomacy-handshake-yellow.webp",
        description: "Rispetto guadagnato attraverso azioni nobili",
        max: 100,
        benefits: {
          10: "Rispetto dai cittadini onesti",
          25: "Sconto 10% presso mercanti rispettabili",
          50: "Inviti a eventi nobiliari",
          75: "Protezione legale gratuita",
          100: "Cavalierato o titolo nobiliare"
        },
        penalties: {
          negative: "Disprezzo dei criminali, bersaglio di fuorilegge"
        }
      },
      "fama": {
        name: "Fama",
        icon: "icons/skills/social/party-crowd-celebration.webp",
        description: "Notorietà per le proprie imprese",
        max: 100,
        benefits: {
          10: "Riconosciuto nelle taverne locali",
          25: "Drinks gratuiti, storie sul tuo conto",
          50: "Ballate composte sulle tue gesta",
          75: "Fama in tutto il regno",
          100: "Leggenda vivente"
        },
        penalties: {
          high: "Difficile passare inosservato, falsi eroi ti sfidano"
        }
      },
      "gloria": {
        name: "Gloria",
        icon: "icons/equipment/head/crown-gold-laurel.webp",
        description: "Gloria ottenuta in battaglia e duelli",
        max: 100,
        benefits: {
          10: "Rispetto dai guerrieri",
          25: "Accesso a tornei esclusivi",
          50: "Squire personale",
          75: "Comando di truppe",
          100: "Campione del Regno"
        }
      },
      "santita": {
        name: "Santità",
        icon: "icons/magic/holy/angel-wings-gray.webp",
        description: "Devozione religiosa e miracoli",
        max: 100,
        benefits: {
          10: "Benedizioni minori gratuite",
          25: "Accesso a reliquie sacre",
          50: "Guarigioni miracolose 1/settimana",
          75: "Immunità a maledizioni",
          100: "Candidato alla beatificazione"
        }
      },
      "saggezza": {
        name: "Saggezza",
        icon: "icons/tools/scribal/scroll-bound-brown.webp",
        description: "Rispetto per conoscenza e buon consiglio",
        max: 100,
        benefits: {
          10: "Consultato per consigli",
          25: "Accesso a biblioteche private",
          50: "Posizione come consigliere",
          75: "Studenti e seguaci",
          100: "Saggio del Regno"
        }
      }
    };

    // Livelli di reputazione generale
    this.reputationLevels = [
      { min: -100, max: -75, title: "Famigerato", effects: "Temuto e odiato da tutti" },
      { min: -74, max: -50, title: "Infame", effects: "Cattiva reputazione diffusa" },
      { min: -49, max: -25, title: "Malfamato", effects: "Mal visto dalla società" },
      { min: -24, max: -10, title: "Sospetto", effects: "Guardato con diffidenza" },
      { min: -9, max: 9, title: "Sconosciuto", effects: "Nessuna reputazione particolare" },
      { min: 10, max: 24, title: "Conosciuto", effects: "Inizia ad essere riconosciuto" },
      { min: 25, max: 49, title: "Rispettato", effects: "Ben visto dalla comunità" },
      { min: 50, max: 74, title: "Stimato", effects: "Grande rispetto e ammirazione" },
      { min: 75, max: 89, title: "Venerato", effects: "Considerato un eroe" },
      { min: 90, max: 100, title: "Leggendario", effects: "Entrato nella leggenda" }
    ];

    // Azioni che influenzano la reputazione
    this.reputationActions = {
      // Azioni positive
      "salva_innocenti": { onore: 10, fama: 5, gloria: 3 },
      "vinci_duello_onore": { onore: 5, gloria: 10, fama: 8 },
      "dona_poveri": { onore: 5, santita: 8, fama: 2 },
      "sconfiggi_mostro": { gloria: 10, fama: 10, onore: 3 },
      "completa_missione_sacra": { santita: 15, onore: 5, fama: 5 },
      "risolvi_disputa": { saggezza: 10, onore: 5, fama: 3 },
      "scoperta_importante": { saggezza: 15, fama: 8 },
      "proteggi_deboli": { onore: 8, santita: 5, gloria: 3 },

      // Azioni negative
      "uccidi_innocente": { onore: -20, santita: -15, fama: 5 },
      "tradimento": { onore: -25, fama: 10 },
      "sacrilegio": { santita: -30, onore: -10 },
      "codardia": { gloria: -20, onore: -10, fama: -5 },
      "furto": { onore: -5, santita: -3 },
      "menzogna": { onore: -3, saggezza: -5 }
    };

    this._setupHooks();
    this._registerSettings();
  }

  _setupHooks() {
    // Hook per modifiche reputazione dopo azioni
    Hooks.on("actionCompleted", (action, actor) => {
      if (this.reputationActions[action]) {
        this.adjustReputationMultiple(actor, this.reputationActions[action]);
      }
    });

    // Hook per modifiche sociali basate su reputazione
    Hooks.on("dnd5e.preRollAbilityTest", (actor, rollData, messageData) => {
      if (["per", "dec", "int", "prf"].includes(rollData.ability)) {
        const repBonus = this._getSocialModifier(actor);
        if (repBonus !== 0) {
          rollData.parts = rollData.parts || [];
          rollData.parts.push(`${repBonus > 0 ? '+' : ''}${repBonus}[Reputazione]`);
        }
      }
    });

    // Hook per prezzi modificati da reputazione
    Hooks.on("dnd5e.preItemUsageConsumption", (item, config, options) => {
      if (item.type === "consumable" && item.system.price) {
        const actor = item.parent;
        const discount = this._getPriceModifier(actor);
        if (discount !== 1) {
          const newPrice = Math.floor(item.system.price * discount);
          ui.notifications.info(`Prezzo modificato da reputazione: ${newPrice} ducati`);
        }
      }
    });
  }

  _registerSettings() {
    game.settings.register("brancalonia-bigat", "useReputation", {
      name: "Sistema Reputazione Positiva",
      hint: "Attiva il sistema di reputazione positiva oltre all'infamia",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register("brancalonia-bigat", "reputationDecay", {
      name: "Decadimento Reputazione",
      hint: "La reputazione decade nel tempo se non mantenuta",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });
  }

  /**
   * Ottieni reputazione totale di un attore
   */
  getTotalReputation(actor) {
    const reps = actor.flags.brancalonia?.reputations || {};
    const infamia = actor.flags.brancalonia?.infamia || 0;

    let total = -infamia; // Infamia conta negativamente

    for (let [type, value] of Object.entries(reps)) {
      total += value;
    }

    return Math.max(-100, Math.min(100, total));
  }

  /**
   * Ottieni reputazione specifica
   */
  getReputation(actor, type) {
    return actor.flags.brancalonia?.reputations?.[type] || 0;
  }

  /**
   * Aggiusta reputazione singola
   */
  async adjustReputation(actor, type, amount) {
    const repType = this.reputationTypes[type];
    if (!repType) {
      ui.notifications.error(`Tipo reputazione ${type} non valido!`);
      return;
    }

    const reps = actor.flags.brancalonia?.reputations || {};
    const current = reps[type] || 0;
    const newValue = Math.max(0, Math.min(repType.max, current + amount));

    reps[type] = newValue;
    await actor.setFlag("brancalonia", "reputations", reps);

    // Controlla benefici
    await this._checkReputationBenefits(actor, type, current, newValue);

    // Notifica
    const emoji = amount > 0 ? "⬆️" : "⬇️";
    ChatMessage.create({
      content: `
        <div class="brancalonia-reputation-change">
          <h3>${emoji} ${repType.name}</h3>
          <p><strong>${actor.name}:</strong> ${amount > 0 ? '+' : ''}${amount}</p>
          <p>Valore attuale: ${newValue}/${repType.max}</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    // Aggiorna reputazione totale
    await this._updateTotalReputation(actor);
  }

  /**
   * Aggiusta reputazioni multiple
   */
  async adjustReputationMultiple(actor, changes) {
    for (let [type, amount] of Object.entries(changes)) {
      if (amount !== 0) {
        await this.adjustReputation(actor, type, amount);
      }
    }
  }

  /**
   * Controlla e applica benefici reputazione
   */
  async _checkReputationBenefits(actor, type, oldValue, newValue) {
    const repType = this.reputationTypes[type];

    for (let [threshold, benefit] of Object.entries(repType.benefits)) {
      const thresh = parseInt(threshold);

      // Nuovo beneficio sbloccato
      if (oldValue < thresh && newValue >= thresh) {
        ChatMessage.create({
          content: `
            <div class="brancalonia-reputation-benefit">
              <h3>🎖️ Beneficio Sbloccato!</h3>
              <p><strong>${actor.name}</strong> - ${repType.name} ${thresh}</p>
              <p><em>${benefit}</em></p>
            </div>
          `,
          speaker: ChatMessage.getSpeaker({ actor })
        });

        // Applica effetto se necessario
        await this._applyReputationEffect(actor, type, thresh);
      }

      // Beneficio perso
      if (oldValue >= thresh && newValue < thresh) {
        ChatMessage.create({
          content: `
            <div class="brancalonia-reputation-lost">
              <p><strong>${actor.name}</strong> perde: ${benefit}</p>
            </div>
          `,
          speaker: ChatMessage.getSpeaker({ actor })
        });

        await this._removeReputationEffect(actor, type, thresh);
      }
    }
  }

  /**
   * Applica effetti permanenti della reputazione
   */
  async _applyReputationEffect(actor, type, threshold) {
    const effectMap = {
      "onore": {
        25: { key: "system.skills.per.bonuses.check", value: "+1" },
        50: { key: "system.traits.di.all", value: ["legal-immunity"] },
        75: { key: "system.currency.du", value: "+100" }
      },
      "gloria": {
        25: { key: "flags.midi-qol.advantage.attack.mwak", value: "1" },
        50: { key: "system.attributes.hp.max", value: "+10" }
      },
      "santita": {
        25: { key: "system.traits.di.all", value: ["necrotic"] },
        50: { key: "system.attributes.hp.max", value: "+5" },
        75: { key: "system.traits.di.all", value: ["cursed"] }
      }
    };

    const effects = effectMap[type]?.[threshold];
    if (!effects) return;

    const effectData = {
      name: `${this.reputationTypes[type].name} ${threshold}`,
      icon: this.reputationTypes[type].icon,
      origin: actor.uuid,
      duration: {},
      changes: [{
        key: effects.key,
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: effects.value
      }],
      flags: {
        brancalonia: {
          isReputationEffect: true,
          repType: type,
          threshold: threshold
        }
      }
    };

    await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
  }

  /**
   * Rimuove effetti reputazione
   */
  async _removeReputationEffect(actor, type, threshold) {
    const effect = actor.effects.find(e =>
      e.flags.brancalonia?.isReputationEffect &&
      e.flags.brancalonia?.repType === type &&
      e.flags.brancalonia?.threshold === threshold
    );

    if (effect) {
      await effect.delete();
    }
  }

  /**
   * Aggiorna reputazione totale
   */
  async _updateTotalReputation(actor) {
    const total = this.getTotalReputation(actor);
    const level = this._getReputationLevel(total);

    await actor.setFlag("brancalonia", "totalReputation", total);
    await actor.setFlag("brancalonia", "reputationLevel", level);

    // Aggiorna nome visualizzato se configurato
    if (game.settings.get("brancalonia-bigat", "showReputationTitle")) {
      const title = level.title;
      await actor.update({
        "prototypeToken.name": `${actor.name} il ${title}`
      });
    }
  }

  /**
   * Ottieni livello reputazione
   */
  _getReputationLevel(total) {
    for (let level of this.reputationLevels) {
      if (total >= level.min && total <= level.max) {
        return level;
      }
    }
    return this.reputationLevels[4]; // Sconosciuto di default
  }

  /**
   * Calcola modificatore sociale
   */
  _getSocialModifier(actor) {
    const total = this.getTotalReputation(actor);

    if (total >= 75) return 5;
    if (total >= 50) return 3;
    if (total >= 25) return 2;
    if (total >= 10) return 1;
    if (total <= -75) return -5;
    if (total <= -50) return -3;
    if (total <= -25) return -2;
    if (total <= -10) return -1;

    return 0;
  }

  /**
   * Calcola modificatore prezzi
   */
  _getPriceModifier(actor) {
    const onore = this.getReputation(actor, "onore");
    const infamia = actor.flags.brancalonia?.infamia || 0;

    // Alta infamia = prezzi maggiori
    if (infamia >= 50) return 1.5;
    if (infamia >= 25) return 1.2;

    // Alto onore = sconti
    if (onore >= 50) return 0.8;
    if (onore >= 25) return 0.9;

    return 1;
  }

  /**
   * Decadimento periodico reputazione
   */
  async decayReputation(actor) {
    if (!game.settings.get("brancalonia-bigat", "reputationDecay")) return;

    const reps = actor.flags.brancalonia?.reputations || {};
    let changed = false;

    for (let [type, value] of Object.entries(reps)) {
      if (value > 50) {
        reps[type] = value - 2; // -2 per settimana se sopra 50
        changed = true;
      } else if (value > 25) {
        reps[type] = value - 1; // -1 per settimana se sopra 25
        changed = true;
      }
    }

    if (changed) {
      await actor.setFlag("brancalonia", "reputations", reps);
      ui.notifications.info(`${actor.name}: Reputazione decade nel tempo`);
    }
  }

  /**
   * Converti infamia in reputazione negativa
   */
  async convertInfamyToReputation(actor) {
    const infamia = actor.flags.brancalonia?.infamia || 0;

    if (infamia > 0) {
      // L'infamia può diventare "fama oscura"
      if (infamia >= 75) {
        await this.adjustReputation(actor, "fama", 20);
        ChatMessage.create({
          content: `${actor.name} è così infame da essere diventato leggendario!`,
          speaker: ChatMessage.getSpeaker({ actor })
        });
      }
    }
  }

  /**
   * Genera evento basato su reputazione
   */
  generateReputationEvent(actor) {
    const total = this.getTotalReputation(actor);
    const level = this._getReputationLevel(total);

    const events = {
      "Famigerato": [
        "Cacciatori di taglie ti cercano",
        "Le guardie ti attaccano a vista",
        "I negozi rifiutano di servirti"
      ],
      "Leggendario": [
        "Un bardo vuole scrivere la tua biografia",
        "Il re ti invita a corte",
        "Ti offrono terre e titolo nobiliare"
      ],
      "Rispettato": [
        "Ti chiedono di risolvere una disputa",
        "Ricevi un invito a una festa importante",
        "Un giovane vuole diventare tuo apprendista"
      ],
      "Sconosciuto": [
        "Nessuno ti presta attenzione",
        "Puoi muoverti liberamente",
        "Devi dimostrare il tuo valore"
      ]
    };

    const levelEvents = events[level.title] || events["Sconosciuto"];
    const event = levelEvents[Math.floor(Math.random() * levelEvents.length)];

    return {
      level: level.title,
      event: event,
      description: `A causa della tua reputazione (${level.title}): ${event}`
    };
  }

  /**
   * UI per gestione reputazione
   */
  renderReputationManager(actor) {
    const total = this.getTotalReputation(actor);
    const level = this._getReputationLevel(total);
    const reps = actor.flags.brancalonia?.reputations || {};

    const content = `
      <div class="brancalonia-reputation-manager">
        <h2>📜 Reputazione di ${actor.name}</h2>

        <div class="reputation-summary">
          <h3>Reputazione Totale: ${total}</h3>
          <p class="rep-level">Livello: <strong>${level.title}</strong></p>
          <p class="rep-effects">${level.effects}</p>
        </div>

        <div class="reputation-types">
          <h3>Reputazioni Specifiche</h3>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Valore</th>
                <th>Benefici Attivi</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(this.reputationTypes).map(([key, type]) => {
                const value = reps[key] || 0;
                const activeBenefits = Object.entries(type.benefits)
                  .filter(([thresh, _]) => value >= parseInt(thresh))
                  .map(([_, benefit]) => benefit);

                return `
                  <tr>
                    <td>
                      <img src="${type.icon}" width="20" height="20">
                      ${type.name}
                    </td>
                    <td>${value}/${type.max}</td>
                    <td>
                      ${activeBenefits.length > 0 ?
                        `<ul>${activeBenefits.map(b => `<li>${b}</li>`).join('')}</ul>` :
                        '<em>Nessuno</em>'
                      }
                    </td>
                    <td>
                      <button class="adjust-rep" data-type="${key}" data-amount="5">+5</button>
                      <button class="adjust-rep" data-type="${key}" data-amount="-5">-5</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="reputation-actions">
          <h3>Azioni Rapide</h3>
          <div class="action-buttons">
            ${Object.entries(this.reputationActions).map(([action, effects]) => `
              <button class="rep-action" data-action="${action}">
                ${action.replace(/_/g, ' ').charAt(0).toUpperCase() + action.slice(1).replace(/_/g, ' ')}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="reputation-event">
          <h3>Genera Evento Reputazione</h3>
          <button id="generate-event">Genera Evento</button>
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: "Gestione Reputazione",
      content: content,
      buttons: {
        close: { label: "Chiudi" }
      },
      render: html => {
        html.find('.adjust-rep').click(ev => {
          const type = ev.currentTarget.dataset.type;
          const amount = parseInt(ev.currentTarget.dataset.amount);
          this.adjustReputation(actor, type, amount);
          dialog.close();
          this.renderReputationManager(actor); // Riapri aggiornato
        });

        html.find('.rep-action').click(ev => {
          const action = ev.currentTarget.dataset.action;
          const effects = this.reputationActions[action];
          this.adjustReputationMultiple(actor, effects);
          dialog.close();
        });

        html.find('#generate-event').click(() => {
          const event = this.generateReputationEvent(actor);
          ChatMessage.create({
            content: `
              <div class="brancalonia-reputation-event">
                <h3>📯 Evento Reputazione!</h3>
                <p><strong>${actor.name}</strong></p>
                <p>${event.description}</p>
              </div>
            `,
            speaker: ChatMessage.getSpeaker({ actor })
          });
        });
      }
    });

    dialog.render(true);
  }
}