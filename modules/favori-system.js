/**
 * Sistema Favori - Implementazione dal Manuale
 * Basato su Brancalonia pag. 45
 * Compatibile con dnd5e system v3.3.x
 *
 * FAVORI DAL MANUALE:
 * - Riscatto: liberare prigionieri/ostaggi
 * - Evasione: far evadere dal gabbio
 * - Compare Esperto: ottenere aiuto specializzato
 * - Barattiere: insabbiare malefatte
 * - Viaggio in Incognito: trasporto sicuro
 * - Informazioni: info preziose
 * - Granlusso in Prestito: usare granlussi extra
 *
 * Costo: gratuito per bonus Nomea volte, poi 100 mo debito
 * Altri Fratelli di Taglia: 100 mo extra, altrimenti 200 mo debito
 */

export class FavoriSystem {
  constructor() {
    this.favoriTypes = {
      riscatto: {
        name: "Riscatto",
        icon: "icons/skills/social/diplomacy-handshake-yellow.webp",
        description: "La banda paga per liberare un prigioniero o ostaggio",
        baseCost: 100, // + costo riscatto richiesto
        requiresTarget: true
      },

      evasione: {
        name: "Evasione",
        icon: "icons/environment/settlement/jail-cell-key.webp",
        description: "La banda organizza un'evasione dal gabbio",
        baseCost: 100,
        requiresTarget: true,
        difficulty: "media"
      },

      compareEsperto: {
        name: "Compare Esperto",
        icon: "icons/skills/trades/smithing-anvil-silver.webp",
        description: "Un esperto della banda aiuta in una mansione specifica",
        baseCost: 100,
        requiresSpecialization: true,
        duration: "1 lavoretto"
      },

      barattiere: {
        name: "Barattiere",
        icon: "icons/skills/social/intimidation-impressing.webp",
        description: "Insabbia una malefatta prima che diventi taglia",
        baseCost: 100,
        timing: "Durante lo Sbraco",
        immediate: true
      },

      viaggioIncognito: {
        name: "Viaggio in Incognito",
        icon: "icons/environment/settlement/wagon-black.webp",
        description: "Trasporto sicuro verso qualsiasi regione del Regno",
        baseCost: 100,
        requiresDestination: true
      },

      informazioni: {
        name: "Informazioni",
        icon: "icons/skills/social/diplomacy-peace-alliance.webp",
        description: "Informazioni preziose su luogo, persona, oggetto o conoscenza",
        baseCost: 100,
        requiresTopic: true
      },

      granlussoPrestito: {
        name: "Granlusso in Prestito",
        icon: "icons/environment/settlement/house-stone-yellow.webp",
        description: "Usa un Granlusso aggiuntivo del Covo",
        baseCost: 100,
        requiresGranlusso: true
      }
    };

    this._setupHooks();
  }

  _setupHooks() {
    // Hook per UI favori nelle schede personaggio
    Hooks.on("renderActorSheet5eCharacter", (app, html, data) => {
      this._renderFavoriUI(app, html);
    });

    // Hook per Sbraco - gestione Barattiere
    Hooks.on("brancalonia.sbracoStarted", () => {
      this._checkBarattiereRequests();
    });
  }

  /**
   * Renderizza UI Favori sulla scheda
   */
  _renderFavoriUI(app, html) {
    const actor = app.actor;
    const nomea = actor.getFlag("brancalonia-bigat", "nomea") || 0;
    const nomeaBonus = Math.floor(nomea / 25); // Bonus ogni 25 punti nomea
    const favoriUsed = actor.getFlag("brancalonia-bigat", "favoriUsed") || 0;
    const favoriDebts = actor.getFlag("brancalonia-bigat", "favoriDebts") || 0;
    const favoriRemaining = Math.max(0, nomeaBonus - favoriUsed);

    const favoriHtml = `
      <div class="brancalonia-favori-section" style="border: 1px solid #8B4513; padding: 10px; margin: 10px 0;">
        <h3 style="display: flex; justify-content: space-between;">
          <span><i class="fas fa-hands-helping"></i> Favori</span>
          <button class="request-favore" style="font-size: 0.8em;">Richiedi Favore</button>
        </h3>

        <div class="favori-status" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div style="text-align: center;">
            <strong>Gratuiti Rimanenti</strong>
            <div style="font-size: 1.5em;">${favoriRemaining}/${nomeaBonus}</div>
          </div>
          <div style="text-align: center;">
            <strong>Debiti</strong>
            <div style="font-size: 1.5em; color: ${favoriDebts > 0 ? 'red' : 'black'};">
              ${favoriDebts} mo
            </div>
          </div>
          <div style="text-align: center;">
            <strong>Bonus Nomea</strong>
            <div style="font-size: 1.5em;">+${nomeaBonus}</div>
          </div>
        </div>

        ${favoriDebts > 0 ? `
          <div style="background: #ffcccc; padding: 5px; margin-top: 10px; border-radius: 5px;">
            <strong>⚠️ Attenzione:</strong> Hai ${favoriDebts} mo di debiti con la banda!
            Non puoi richiedere altri favori finché non saldi.
          </div>
        ` : ''}
      </div>
    `;

    // Inserisci dopo la sezione Covo
    const covoSection = html.find('.brancalonia-covo-section');
    if (covoSection.length) {
      covoSection.after(favoriHtml);
    } else {
      html.find('.tab.inventory').append(favoriHtml);
    }

    // Event listener
    html.find('.request-favore').click(() => {
      if (favoriDebts > 0) {
        ui.notifications.error("Devi saldare i debiti prima di richiedere altri favori!");
        return;
      }
      this._openFavoreRequestDialog(actor);
    });
  }

  /**
   * Dialog per richiedere un favore
   */
  _openFavoreRequestDialog(actor) {
    const nomea = actor.getFlag("brancalonia-bigat", "nomea") || 0;
    const nomeaBonus = Math.floor(nomea / 25);
    const favoriUsed = actor.getFlag("brancalonia-bigat", "favoriUsed") || 0;
    const favoriRemaining = Math.max(0, nomeaBonus - favoriUsed);
    const isOwnBand = true; // TODO: determinare se è la propria banda

    let content = `
      <div class="favore-request">
        <p>Favori gratuiti rimanenti: <strong>${favoriRemaining}</strong></p>
        ${favoriRemaining === 0 ? `
          <p style="color: orange;">
            ⚠️ Hai esaurito i favori gratuiti. Il prossimo favore costerà 100 mo di debito.
          </p>
        ` : ''}

        <div class="favore-type" style="margin: 15px 0;">
          <label><strong>Tipo di Favore:</strong></label>
          <select name="favore-type" style="width: 100%;">
            ${Object.entries(this.favoriTypes).map(([key, favore]) => `
              <option value="${key}">${favore.name} - ${favore.description}</option>
            `).join('')}
          </select>
        </div>

        <div class="favore-details" style="margin: 15px 0;">
          <!-- Dettagli dinamici in base al tipo -->
        </div>

        <div class="favore-band" style="margin: 15px 0;">
          <label>
            <input type="checkbox" name="other-band">
            Richiedi a un'altra banda (+100 mo)
          </label>
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: "Richiedi Favore",
      content,
      buttons: {
        request: {
          icon: '<i class="fas fa-check"></i>',
          label: "Richiedi",
          callback: async (html) => {
            const type = html.find('select[name="favore-type"]').val();
            const otherBand = html.find('input[name="other-band"]').is(':checked');
            const details = this._collectFavoreDetails(html, type);

            await this._processFavoreRequest(actor, type, otherBand, details);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Annulla"
        }
      },
      render: (html) => {
        // Aggiorna dettagli quando cambia il tipo
        html.find('select[name="favore-type"]').change((e) => {
          this._updateFavoreDetails(html, e.target.value);
        });

        // Mostra dettagli iniziali
        this._updateFavoreDetails(html, html.find('select[name="favore-type"]').val());
      }
    });

    dialog.render(true);
  }

  /**
   * Aggiorna i dettagli del favore in base al tipo
   */
  _updateFavoreDetails(html, type) {
    const favore = this.favoriTypes[type];
    let detailsHtml = '';

    if (favore.requiresTarget) {
      detailsHtml += `
        <label>
          <strong>Nome del bersaglio:</strong>
          <input type="text" name="target" placeholder="Chi deve essere liberato/fatto evadere">
        </label>
      `;
    }

    if (favore.requiresSpecialization) {
      detailsHtml += `
        <label>
          <strong>Specializzazione richiesta:</strong>
          <select name="specialization">
            <option value="ladro">Ladro esperto</option>
            <option value="guerriero">Guerriero veterano</option>
            <option value="mago">Mago sapiente</option>
            <option value="chierico">Chierico devoto</option>
            <option value="artigiano">Artigiano abile</option>
            <option value="mercante">Mercante astuto</option>
          </select>
        </label>
      `;
    }

    if (favore.requiresDestination) {
      detailsHtml += `
        <label>
          <strong>Destinazione:</strong>
          <select name="destination">
            <option value="quinotaria">Quinotaria</option>
            <option value="falcamonte">Falcamonte</option>
            <option value="galaverna">Galaverna</option>
            <option value="vortigana">Vortigana</option>
            <option value="pianaverna">Pianaverna</option>
            <option value="penumbria">Penumbria</option>
            <option value="torrigiana">Torrigiana</option>
            <option value="spoletaria">Spoletaria</option>
            <option value="alazia">Alazia</option>
            <option value="ausonia">Ausonia</option>
          </select>
        </label>
      `;
    }

    if (favore.requiresTopic) {
      detailsHtml += `
        <label>
          <strong>Informazioni su:</strong>
          <input type="text" name="topic" placeholder="Persona, luogo, oggetto o conoscenza">
        </label>
      `;
    }

    if (favore.requiresGranlusso) {
      detailsHtml += `
        <label>
          <strong>Granlusso desiderato:</strong>
          <select name="granlusso">
            <option value="borsaNera">Borsa Nera</option>
            <option value="cantina">Cantina</option>
            <option value="distilleria">Distilleria</option>
            <option value="fucina">Fucina</option>
            <option value="scuderie">Scuderie</option>
          </select>
        </label>
      `;
    }

    html.find('.favore-details').html(detailsHtml);
  }

  /**
   * Raccoglie i dettagli del favore
   */
  _collectFavoreDetails(html, type) {
    const details = {
      type: type
    };

    const inputs = {
      target: 'input[name="target"]',
      specialization: 'select[name="specialization"]',
      destination: 'select[name="destination"]',
      topic: 'input[name="topic"]',
      granlusso: 'select[name="granlusso"]'
    };

    for (const [key, selector] of Object.entries(inputs)) {
      const element = html.find(selector);
      if (element.length) {
        details[key] = element.val();
      }
    }

    return details;
  }

  /**
   * Processa la richiesta di favore
   */
  async _processFavoreRequest(actor, type, otherBand, details) {
    const nomea = actor.getFlag("brancalonia-bigat", "nomea") || 0;
    const nomeaBonus = Math.floor(nomea / 25);
    const favoriUsed = actor.getFlag("brancalonia-bigat", "favoriUsed") || 0;
    const favoriRemaining = Math.max(0, nomeaBonus - favoriUsed);

    let cost = 0;
    let debt = 0;

    // Calcola costo
    if (favoriRemaining === 0) {
      debt += 100; // Favore oltre il bonus
    }

    if (otherBand) {
      cost += 100; // Extra per altra banda
      if (actor.system.currency.gp < cost) {
        debt += 200; // Debito maggiore con altra banda
        cost = 0;
      }
    }

    // Applica costo/debito
    if (cost > 0) {
      const currentMoney = actor.system.currency.gp || 0;
      if (currentMoney < cost) {
        ui.notifications.error("Fondi insufficienti!");
        return;
      }
      await actor.update({"system.currency.gp": currentMoney - cost});
    }

    if (debt > 0) {
      const currentDebt = actor.getFlag("brancalonia-bigat", "favoriDebts") || 0;
      await actor.setFlag("brancalonia-bigat", "favoriDebts", currentDebt + debt);
    }

    // Incrementa favori usati
    if (favoriRemaining > 0) {
      await actor.setFlag("brancalonia-bigat", "favoriUsed", favoriUsed + 1);
    }

    // Registra il favore
    await this._registerFavore(actor, type, details, cost, debt);

    // Esegui il favore
    await this._executeFavore(actor, type, details);
  }

  /**
   * Registra il favore nel journal
   */
  async _registerFavore(actor, type, details, cost, debt) {
    const favore = this.favoriTypes[type];
    const timestamp = new Date().toISOString();

    // Crea o aggiorna journal dei favori
    let journal = game.journal.getName(`Favori - ${actor.name}`);
    if (!journal) {
      journal = await JournalEntry.create({
        name: `Favori - ${actor.name}`,
        content: ""
      });
    }

    const entry = `
      <div style="border-bottom: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
        <h3>${favore.name}</h3>
        <p><strong>Data:</strong> ${timestamp}</p>
        <p><strong>Dettagli:</strong> ${JSON.stringify(details, null, 2)}</p>
        <p><strong>Costo:</strong> ${cost > 0 ? `${cost} mo` : 'Gratuito'}</p>
        <p><strong>Debito:</strong> ${debt > 0 ? `${debt} mo` : 'Nessuno'}</p>
      </div>
    `;

    const currentContent = journal.pages.contents[0]?.text?.content || "";
    await journal.pages.contents[0]?.update({
      "text.content": entry + currentContent
    });
  }

  /**
   * Esegue il favore richiesto
   */
  async _executeFavore(actor, type, details) {
    const favore = this.favoriTypes[type];

    // Messaggio di conferma
    ChatMessage.create({
      content: `
        <div class="brancalonia-favore">
          <h3>${favore.name} Concesso!</h3>
          <p><strong>${actor.name}</strong> ha richiesto: ${favore.description}</p>
          ${details.target ? `<p>Bersaglio: ${details.target}</p>` : ''}
          ${details.destination ? `<p>Destinazione: ${details.destination}</p>` : ''}
          ${details.topic ? `<p>Argomento: ${details.topic}</p>` : ''}
        </div>
      `,
      speaker: ChatMessage.getSpeaker({actor})
    });

    // Effetti specifici per tipo
    switch(type) {
      case "barattiere":
        await this._executeBarattiere(actor);
        break;

      case "compareEsperto":
        await this._executeCompareEsperto(actor, details);
        break;

      case "granlussoPrestito":
        await this._executeGranlussoPrestito(actor, details);
        break;

      case "informazioni":
        await this._executeInformazioni(actor, details);
        break;

      case "viaggioIncognito":
        await this._executeViaggioIncognito(actor, details);
        break;

      case "riscatto":
      case "evasione":
        // Questi richiedono intervento GM
        ChatMessage.create({
          content: `<p>Il GM deve gestire ${favore.name} per ${details.target}</p>`,
          whisper: ChatMessage.getWhisperRecipients("GM")
        });
        break;
    }
  }

  /**
   * Esegue Barattiere - cancella ultima malefatta
   */
  async _executeBarattiere(actor) {
    const malefatte = actor.getFlag("brancalonia-bigat", "malefatte") || [];

    if (malefatte.length === 0) {
      ui.notifications.warn("Nessuna malefatta da insabbiare!");
      return;
    }

    // Dialog per scegliere quale malefatta
    const content = `
      <p>Scegli quale malefatta insabbiare:</p>
      <select name="malefatta">
        ${malefatte.map((m, i) => `
          <option value="${i}">${m.name} (${m.value} mo)</option>
        `).join('')}
      </select>
    `;

    new Dialog({
      title: "Barattiere - Insabbia Malefatta",
      content,
      buttons: {
        confirm: {
          label: "Insabbia",
          callback: async (html) => {
            const index = parseInt(html.find('select[name="malefatta"]').val());
            const removed = malefatte.splice(index, 1)[0];

            await actor.setFlag("brancalonia-bigat", "malefatte", malefatte);

            // Ricalcola taglia
            const newTaglia = malefatte.reduce((sum, m) => sum + m.value, 0);
            await actor.setFlag("brancalonia-bigat", "taglia", newTaglia);

            ChatMessage.create({
              content: `Il Barattiere ha insabbiato: ${removed.name} (-${removed.value} mo di taglia)`,
              speaker: ChatMessage.getSpeaker({actor})
            });
          }
        }
      }
    }).render(true);
  }

  /**
   * Esegue Compare Esperto
   */
  async _executeCompareEsperto(actor, details) {
    // Crea un NPC temporaneo come compare
    const compareData = {
      name: `Compare ${details.specialization}`,
      type: "npc",
      img: "icons/svg/mystery-man.svg",
      system: {
        details: {
          cr: 2,
          type: { value: "humanoid" }
        }
      },
      flags: {
        brancalonia: {
          isTemporaryCompare: true,
          specialization: details.specialization,
          employer: actor.id
        }
      }
    };

    const compare = await Actor.create(compareData);

    ChatMessage.create({
      content: `
        <p>Un ${details.specialization} esperto si unisce temporaneamente alla Cricca!</p>
        <p>Durata: 1 lavoretto</p>
      `,
      speaker: ChatMessage.getSpeaker({actor})
    });
  }

  /**
   * Esegue Granlusso in Prestito
   */
  async _executeGranlussoPrestito(actor, details) {
    const granlussoKey = details.granlusso;

    // Applica flag temporaneo per il granlusso
    await actor.setFlag("brancalonia-bigat", `tempGranlusso_${granlussoKey}`, true);

    ChatMessage.create({
      content: `${actor.name} può usare ${granlussoKey} per questo lavoretto!`,
      speaker: ChatMessage.getSpeaker({actor})
    });

    // Applica benefici immediati se applicabili
    if (game.brancalonia?.covoGranlussi) {
      game.brancalonia.covoGranlussi._applyGranlussiBenefits([actor]);
    }
  }

  /**
   * Esegue Informazioni
   */
  async _executeInformazioni(actor, details) {
    // Tira per qualità informazioni
    const roll = await new Roll("1d20").evaluate();
    let quality = "vaghe";

    if (roll.total >= 15) quality = "dettagliate";
    else if (roll.total >= 10) quality = "utili";
    else if (roll.total >= 5) quality = "generiche";

    ChatMessage.create({
      content: `
        <div class="brancalonia-info">
          <p>Informazioni ${quality} su: <strong>${details.topic}</strong></p>
          <p>[Il GM fornirà i dettagli appropriati]</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({actor}),
      whisper: ChatMessage.getWhisperRecipients("GM"),
      rolls: [roll]
    });
  }

  /**
   * Esegue Viaggio in Incognito
   */
  async _executeViaggioIncognito(actor, details) {
    await actor.setFlag("brancalonia-bigat", "safeTravel", {
      destination: details.destination,
      expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 1 settimana
    });

    ChatMessage.create({
      content: `
        <p>Viaggio sicuro organizzato verso ${details.destination}.</p>
        <p>Nessun incontro casuale durante il viaggio!</p>
      `,
      speaker: ChatMessage.getSpeaker({actor})
    });
  }

  /**
   * Controlla richieste Barattiere durante lo Sbraco
   */
  _checkBarattiereRequests() {
    // Trova tutti i PG con malefatte recenti
    const actors = game.actors.filter(a =>
      a.type === "character" &&
      a.hasPlayerOwner &&
      (a.getFlag("brancalonia-bigat", "recentMalefatte") || []).length > 0
    );

    actors.forEach(actor => {
      // Offri opzione Barattiere
      ChatMessage.create({
        content: `
          <div class="barattiere-offer">
            <h3>Offerta del Barattiere</h3>
            <p>${actor.name} può usare un favore Barattiere per insabbiare malefatte recenti!</p>
            <button onclick="game.brancalonia.favoriSystem._openFavoreRequestDialog(game.actors.get('${actor.id}'))">
              Richiedi Barattiere
            </button>
          </div>
        `,
        whisper: [game.users.find(u => u.character?.id === actor.id)]
      });
    });
  }

  /**
   * Paga debiti di favori
   */
  async payFavoriDebt(actor, amount) {
    const currentDebt = actor.getFlag("brancalonia-bigat", "favoriDebts") || 0;
    const currentMoney = actor.system.currency.gp || 0;

    const toPay = Math.min(amount, currentDebt, currentMoney);

    if (toPay === 0) {
      ui.notifications.warn("Nessun pagamento possibile!");
      return;
    }

    await actor.update({
      "system.currency.gp": currentMoney - toPay
    });

    await actor.setFlag("brancalonia-bigat", "favoriDebts", currentDebt - toPay);

    ChatMessage.create({
      content: `${actor.name} paga ${toPay} mo di debiti di favori. Debito rimanente: ${currentDebt - toPay} mo`,
      speaker: ChatMessage.getSpeaker({actor})
    });
  }

  /**
   * Registra impostazioni
   */
  static registerSettings() {
    game.settings.register("brancalonia-bigat", "favoriSharedPool", {
      name: "Pool Favori Condiviso",
      hint: "I favori gratuiti sono condivisi tra tutta la Cricca",
      scope: "world",
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register("brancalonia-bigat", "favoriNomeaScale", {
      name: "Scala Bonus Nomea",
      hint: "Ogni quanti punti nomea si ottiene un favore gratuito",
      scope: "world",
      config: true,
      type: Number,
      default: 25,
      range: {
        min: 10,
        max: 50,
        step: 5
      }
    });
  }
}