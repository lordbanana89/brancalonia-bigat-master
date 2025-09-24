/**
 * Sistema di Gestione Compagnia per Brancalonia
 * Compatibile con Foundry VTT v13 e D&D 5e v3.3.1
 */

export class CompagniaManager {
  constructor() {
    this.compagniaRoles = {
      "capitano": { label: "Capitano", max: 1, benefits: "Decisioni finali, +2 Intimidire" },
      "tesoriere": { label: "Tesoriere", max: 1, benefits: "Gestisce finanze, +2 Inganno" },
      "cuoco": { label: "Cuoco", max: 1, benefits: "Migliora riposi, +1 dado vita recuperato" },
      "guaritore": { label: "Guaritore", max: 1, benefits: "Cura gratuita, kit del guaritore infinito" },
      "esploratore": { label: "Esploratore", max: 2, benefits: "+5 Percezione passiva in viaggio" },
      "diplomatico": { label: "Diplomatico", max: 1, benefits: "+2 Persuasione, riduce infamia" },
      "sicario": { label: "Sicario", max: 2, benefits: "+1d6 danni furtivi 1/combattimento" },
      "intrattenitore": { label: "Intrattenitore", max: 1, benefits: "Guadagni extra nelle taverne" }
    };

    this._setupHooks();
    this._registerSocketListeners();
  }

  _setupHooks() {
    // Hook per aggiungere tab Compagnia alle schede
    Hooks.on("renderActorSheet", (app, html, data) => {
      if (data.actor.type === "character" && this._isInCompagnia(data.actor)) {
        this._addCompagniaTab(app, html, data);
      }
    });

    // Hook per dividere automaticamente il bottino
    Hooks.on("createItem", (item, options, userId) => {
      if (item.parent?.type === "character" && item.type === "loot") {
        this._checkLootSharing(item);
      }
    });
  }

  _registerSocketListeners() {
    game.socket.on("module.brancalonia-bigat", (data) => {
      if (data.type === "compagnia-update") {
        this._handleCompagniaUpdate(data);
      }
    });
  }

  /**
   * Crea una nuova compagnia
   */
  async createCompagnia(actors, name = "Compagnia Senza Nome") {
    // Verifica che ci siano almeno 2 membri
    if (actors.length < 2) {
      ui.notifications.error("Una compagnia richiede almeno 2 membri!");
      return null;
    }

    // Crea l'actor per la compagnia (usa tipo npc con flag personalizzati)
    const compagniaData = {
      name: name,
      type: "npc",  // Usa tipo standard dnd5e con flag personalizzati
      img: "icons/environment/people/group.webp",
      system: {
        description: {
          value: `<h2>${name}</h2><p>Una compagnia di ventura del Regno di Taglia.</p>`
        },
        details: {
          type: { value: "humanoid" },
          cr: 0,
          spellLevel: 0,
          source: "Brancalonia"
        }
      },
      flags: {
        brancalonia: {
          isCompagnia: true,
          isGroupActor: true,  // Flag per identificarlo come gruppo
          members: actors.map(a => ({
            actorId: a.id,
            role: null,
            joinDate: new Date().toISOString(),
            share: 1 // Quote del bottino
          })),
          treasury: 0,
          reputation: 0,
          infamiaCollettiva: 0,
          jobs: [],
          haven: null,
          createdDate: new Date().toISOString(),
          charter: {
            rules: [],
            lootDivision: "equal", // equal, shares, merit
            decisions: "vote" // vote, captain, consensus
          }
        }
      }
    };

    const compagnia = await Actor.create(compagniaData);

    // Imposta flag su ogni membro
    for (const actor of actors) {
      await actor.setFlag("brancalonia", "compagniaId", compagnia.id);
      await actor.setFlag("brancalonia", "compagniaRole", null);
    }

    // Notifica creazione
    ChatMessage.create({
      content: `
        <div class="brancalonia-compagnia-created">
          <h2>🏴 Nuova Compagnia Fondata! 🏴</h2>
          <h3>${name}</h3>
          <p><strong>Membri Fondatori:</strong></p>
          <ul>
            ${actors.map(a => `<li>${a.name}</li>`).join('')}
          </ul>
          <p><em>Che la fortuna vi accompagni nelle vostre imprese!</em></p>
        </div>
      `,
      speaker: { alias: "Sistema Compagnia" }
    });

    return compagnia;
  }

  /**
   * Aggiunge un membro alla compagnia
   */
  async addMember(compagnia, actor, role = null) {
    const members = compagnia.flags.brancalonia.members || [];

    // Verifica che non sia già membro
    if (members.find(m => m.actorId === actor.id)) {
      ui.notifications.warn(`${actor.name} è già membro della compagnia!`);
      return;
    }

    // Aggiungi nuovo membro
    members.push({
      actorId: actor.id,
      role: role,
      joinDate: new Date().toISOString(),
      share: 1
    });

    await compagnia.setFlag("brancalonia", "members", members);
    await actor.setFlag("brancalonia", "compagniaId", compagnia.id);
    await actor.setFlag("brancalonia", "compagniaRole", role);

    // Notifica
    ChatMessage.create({
      content: `${actor.name} si è unito alla compagnia ${compagnia.name}!`,
      speaker: { alias: "Sistema Compagnia" }
    });
  }

  /**
   * Rimuove un membro dalla compagnia
   */
  async removeMember(compagnia, actorId) {
    let members = compagnia.flags.brancalonia.members || [];
    const actor = game.actors.get(actorId);

    members = members.filter(m => m.actorId !== actorId);

    await compagnia.setFlag("brancalonia", "members", members);

    if (actor) {
      await actor.unsetFlag("brancalonia", "compagniaId");
      await actor.unsetFlag("brancalonia", "compagniaRole");
    }

    ChatMessage.create({
      content: `${actor?.name || "Un membro"} ha lasciato la compagnia ${compagnia.name}.`,
      speaker: { alias: "Sistema Compagnia" }
    });
  }

  /**
   * Assegna un ruolo a un membro
   */
  async assignRole(compagnia, actorId, role) {
    // Verifica che il ruolo sia valido
    if (!this.compagniaRoles[role]) {
      ui.notifications.error("Ruolo non valido!");
      return;
    }

    // Verifica limiti del ruolo
    const members = compagnia.flags.brancalonia.members || [];
    const currentRoleCount = members.filter(m => m.role === role).length;

    if (currentRoleCount >= this.compagniaRoles[role].max) {
      ui.notifications.error(`Limite massimo per ${this.compagniaRoles[role].label} raggiunto!`);
      return;
    }

    // Assegna ruolo
    const memberIndex = members.findIndex(m => m.actorId === actorId);
    if (memberIndex >= 0) {
      members[memberIndex].role = role;
      await compagnia.setFlag("brancalonia", "members", members);

      const actor = game.actors.get(actorId);
      if (actor) {
        await actor.setFlag("brancalonia", "compagniaRole", role);

        ChatMessage.create({
          content: `${actor.name} è ora ${this.compagniaRoles[role].label} della compagnia!`,
          speaker: { alias: "Sistema Compagnia" }
        });
      }
    }
  }

  /**
   * Calcola l'infamia collettiva della compagnia
   */
  async calculateCollectiveInfamia(compagnia) {
    const members = compagnia.flags.brancalonia.members || [];
    let totalInfamia = 0;
    let count = 0;

    for (const member of members) {
      const actor = game.actors.get(member.actorId);
      if (actor) {
        totalInfamia += actor.flags.brancalonia?.infamia || 0;
        count++;
      }
    }

    const collectiveInfamia = count > 0 ? Math.floor(totalInfamia / count) : 0;
    await compagnia.setFlag("brancalonia", "infamiaCollettiva", collectiveInfamia);

    return collectiveInfamia;
  }

  /**
   * Gestisce il tesoro della compagnia
   */
  async modifyTreasury(compagnia, amount, description = "") {
    const currentTreasury = compagnia.flags.brancalonia.treasury || 0;
    const newTreasury = Math.max(0, currentTreasury + amount);

    await compagnia.setFlag("brancalonia", "treasury", newTreasury);

    // Log transazione
    const transaction = {
      date: new Date().toISOString(),
      amount: amount,
      description: description,
      balance: newTreasury
    };

    const transactions = compagnia.flags.brancalonia.transactions || [];
    transactions.push(transaction);
    await compagnia.setFlag("brancalonia", "transactions", transactions);

    // Notifica
    ChatMessage.create({
      content: `
        <div class="brancalonia-treasury">
          <h3>💰 Tesoro della Compagnia</h3>
          <p>${amount > 0 ? 'Entrata' : 'Uscita'}: ${Math.abs(amount)} ducati</p>
          ${description ? `<p><em>${description}</em></p>` : ''}
          <p><strong>Bilancio attuale:</strong> ${newTreasury} ducati</p>
        </div>
      `,
      speaker: { alias: compagnia.name }
    });
  }

  /**
   * Divide il bottino tra i membri
   */
  async divideLoot(compagnia, totalAmount) {
    const members = compagnia.flags.brancalonia.members || [];
    const divisionType = compagnia.flags.brancalonia.charter?.lootDivision || "equal";

    let distributions = [];

    switch (divisionType) {
      case "equal":
        // Divisione equa
        const equalShare = Math.floor(totalAmount / members.length);
        const remainder = totalAmount % members.length;

        for (const member of members) {
          distributions.push({
            actorId: member.actorId,
            amount: equalShare
          });
        }

        // Il resto va al tesoro comune
        if (remainder > 0) {
          await this.modifyTreasury(compagnia, remainder, "Resto della divisione del bottino");
        }
        break;

      case "shares":
        // Divisione per quote
        const totalShares = members.reduce((sum, m) => sum + (m.share || 1), 0);
        const shareValue = Math.floor(totalAmount / totalShares);

        for (const member of members) {
          distributions.push({
            actorId: member.actorId,
            amount: shareValue * (member.share || 1)
          });
        }
        break;

      case "merit":
        // Divisione per merito (basata su ruolo)
        const meritShares = {
          "capitano": 2,
          "tesoriere": 1.5,
          "sicario": 1.5,
          "default": 1
        };

        const totalMerit = members.reduce((sum, m) =>
          sum + (meritShares[m.role] || meritShares.default), 0
        );
        const meritValue = Math.floor(totalAmount / totalMerit);

        for (const member of members) {
          const merit = meritShares[member.role] || meritShares.default;
          distributions.push({
            actorId: member.actorId,
            amount: Math.floor(meritValue * merit)
          });
        }
        break;
    }

    // Distribuisci ai membri
    let distributionReport = `<h3>Divisione del Bottino</h3><p>Totale: ${totalAmount} ducati</p><ul>`;

    for (const dist of distributions) {
      const actor = game.actors.get(dist.actorId);
      if (actor) {
        // Aggiungi denaro all'attore
        const currentGold = actor.system.currency?.du || 0;
        await actor.update({
          "system.currency.du": currentGold + dist.amount
        });

        distributionReport += `<li>${actor.name}: ${dist.amount} ducati</li>`;
      }
    }

    distributionReport += `</ul>`;

    ChatMessage.create({
      content: distributionReport,
      speaker: { alias: compagnia.name }
    });
  }

  /**
   * Aggiunge tab Compagnia alla scheda del personaggio
   */
  _addCompagniaTab(app, html, data) {
    const compagniaId = data.actor.flags.brancalonia?.compagniaId;
    if (!compagniaId) return;

    const compagnia = game.actors.get(compagniaId);
    if (!compagnia) return;

    // Aggiungi tab
    const tabs = html.find('.tabs[data-group="primary"]');
    tabs.append('<a class="item" data-tab="compagnia">Compagnia</a>');

    // Crea contenuto tab
    const members = compagnia.flags.brancalonia.members || [];
    const membersList = members.map(m => {
      const actor = game.actors.get(m.actorId);
      const role = m.role ? this.compagniaRoles[m.role]?.label : "Nessun ruolo";
      return `
        <li>
          <strong>${actor?.name || "Sconosciuto"}</strong>
          <span class="role">${role}</span>
          <span class="infamia">Infamia: ${actor?.flags.brancalonia?.infamia || 0}</span>
        </li>
      `;
    }).join('');

    const tabContent = `
      <div class="tab compagnia" data-group="primary" data-tab="compagnia">
        <h2>${compagnia.name}</h2>

        <div class="compagnia-stats">
          <div class="stat">
            <label>Tesoro Comune:</label>
            <span>${compagnia.flags.brancalonia.treasury || 0} ducati</span>
          </div>
          <div class="stat">
            <label>Reputazione:</label>
            <span>${compagnia.flags.brancalonia.reputation || 0}</span>
          </div>
          <div class="stat">
            <label>Infamia Collettiva:</label>
            <span>${compagnia.flags.brancalonia.infamiaCollettiva || 0}</span>
          </div>
        </div>

        <h3>Membri</h3>
        <ul class="compagnia-members">
          ${membersList}
        </ul>

        <h3>Il Mio Ruolo</h3>
        <div class="my-role">
          <strong>${data.actor.flags.brancalonia?.compagniaRole ?
            this.compagniaRoles[data.actor.flags.brancalonia.compagniaRole]?.label :
            "Nessun ruolo assegnato"
          }</strong>
          ${data.actor.flags.brancalonia?.compagniaRole ?
            `<p>${this.compagniaRoles[data.actor.flags.brancalonia.compagniaRole]?.benefits}</p>` :
            ""
          }
        </div>

        <div class="compagnia-actions">
          <button class="compagnia-treasury">Gestisci Tesoro</button>
          <button class="compagnia-jobs">Visualizza Lavori</button>
          <button class="compagnia-charter">Statuto</button>
        </div>
      </div>
    `;

    const sheetBody = html.find('.sheet-body');
    sheetBody.append(tabContent);

    // Event handlers
    html.find('.compagnia-treasury').click(() => this._showTreasuryDialog(compagnia));
    html.find('.compagnia-jobs').click(() => this._showJobsDialog(compagnia));
    html.find('.compagnia-charter').click(() => this._showCharterDialog(compagnia));

    // CSS per il tab
    if (!$('#brancalonia-compagnia-styles').length) {
      $('head').append(`
        <style id="brancalonia-compagnia-styles">
          .tab.compagnia {
            padding: 10px;
          }

          .compagnia-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin: 10px 0;
            padding: 10px;
            background: rgba(139, 69, 19, 0.1);
            border: 1px solid #8b4513;
            border-radius: 5px;
          }

          .compagnia-stats .stat {
            text-align: center;
          }

          .compagnia-stats label {
            display: block;
            font-weight: bold;
            color: #8b4513;
          }

          .compagnia-members {
            list-style: none;
            padding: 0;
          }

          .compagnia-members li {
            padding: 5px;
            margin: 2px 0;
            background: rgba(0,0,0,0.05);
            border-radius: 3px;
            display: flex;
            justify-content: space-between;
          }

          .my-role {
            padding: 10px;
            background: rgba(139, 69, 19, 0.1);
            border-left: 3px solid #8b4513;
            margin: 10px 0;
          }

          .compagnia-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
          }

          .compagnia-actions button {
            flex: 1;
          }
        </style>
      `);
    }
  }

  /**
   * Mostra dialog per gestione tesoro
   */
  _showTreasuryDialog(compagnia) {
    const content = `
      <form>
        <div class="form-group">
          <label>Operazione:</label>
          <select id="operation">
            <option value="deposit">Deposita</option>
            <option value="withdraw">Preleva</option>
            <option value="divide">Dividi tra membri</option>
          </select>
        </div>
        <div class="form-group">
          <label>Ammontare (ducati):</label>
          <input type="number" id="amount" value="0" min="0" />
        </div>
        <div class="form-group">
          <label>Descrizione:</label>
          <input type="text" id="description" placeholder="Motivo della transazione..." />
        </div>
        <hr>
        <p><strong>Bilancio attuale:</strong> ${compagnia.flags.brancalonia.treasury || 0} ducati</p>
      </form>
    `;

    new Dialog({
      title: `Tesoro - ${compagnia.name}`,
      content: content,
      buttons: {
        execute: {
          label: "Esegui",
          callback: async (html) => {
            const operation = html.find('#operation').val();
            const amount = parseInt(html.find('#amount').val()) || 0;
            const description = html.find('#description').val();

            switch (operation) {
              case "deposit":
                await this.modifyTreasury(compagnia, amount, description);
                break;
              case "withdraw":
                await this.modifyTreasury(compagnia, -amount, description);
                break;
              case "divide":
                await this.divideLoot(compagnia, amount);
                break;
            }
          }
        },
        cancel: {
          label: "Annulla"
        }
      },
      default: "execute"
    }).render(true);
  }

  /**
   * Mostra dialog dei lavori
   */
  _showJobsDialog(compagnia) {
    const jobs = compagnia.flags.brancalonia.jobs || [];

    const content = `
      <div class="compagnia-jobs-list">
        <h3>Lavori Attivi</h3>
        ${jobs.filter(j => !j.completed).map(job => `
          <div class="job-card">
            <h4>${job.name}</h4>
            <p>${job.description}</p>
            <p><strong>Ricompensa:</strong> ${job.reward} ducati</p>
            <p><strong>Infamia:</strong> +${job.infamyGain}</p>
          </div>
        `).join('') || '<p>Nessun lavoro attivo</p>'}

        <h3>Lavori Completati</h3>
        ${jobs.filter(j => j.completed).map(job => `
          <div class="job-card completed">
            <h4>${job.name}</h4>
            <p><strong>Ricompensa:</strong> ${job.reward} ducati</p>
            <p><strong>Completato:</strong> ${new Date(job.completedDate).toLocaleDateString()}</p>
          </div>
        `).join('') || '<p>Nessun lavoro completato</p>'}
      </div>
    `;

    new Dialog({
      title: `Lavori - ${compagnia.name}`,
      content: content,
      buttons: {
        close: {
          label: "Chiudi"
        }
      },
      default: "close"
    }).render(true);
  }

  /**
   * Mostra dialog dello statuto
   */
  _showCharterDialog(compagnia) {
    const charter = compagnia.flags.brancalonia.charter || {};

    const content = `
      <div class="compagnia-charter">
        <h3>Statuto della Compagnia</h3>

        <div class="charter-section">
          <h4>Divisione del Bottino</h4>
          <p>${charter.lootDivision === "equal" ? "Divisione Equa" :
             charter.lootDivision === "shares" ? "Divisione per Quote" :
             "Divisione per Merito"}</p>
        </div>

        <div class="charter-section">
          <h4>Processo Decisionale</h4>
          <p>${charter.decisions === "vote" ? "Votazione Democratica" :
             charter.decisions === "captain" ? "Decisione del Capitano" :
             "Consenso Unanime"}</p>
        </div>

        <div class="charter-section">
          <h4>Regole della Compagnia</h4>
          <ol>
            ${(charter.rules || []).map(rule => `<li>${rule}</li>`).join('') ||
              '<li>Nessuna regola stabilita</li>'}
          </ol>
        </div>
      </div>
    `;

    new Dialog({
      title: `Statuto - ${compagnia.name}`,
      content: content,
      buttons: {
        edit: {
          label: "Modifica",
          callback: () => this._editCharterDialog(compagnia)
        },
        close: {
          label: "Chiudi"
        }
      },
      default: "close"
    }).render(true);
  }

  /**
   * Dialog per modificare lo statuto
   */
  _editCharterDialog(compagnia) {
    // Solo il capitano o con consenso può modificare
    // Implementazione dettagliata...
  }

  /**
   * Verifica se un attore è in una compagnia
   */
  _isInCompagnia(actor) {
    return actor.flags.brancalonia?.compagniaId ? true : false;
  }

  /**
   * Controlla se il bottino deve essere condiviso
   */
  _checkLootSharing(item) {
    const actor = item.parent;
    if (!actor || !this._isInCompagnia(actor)) return;

    // Notifica della condivisione
    const compagniaId = actor.flags.brancalonia.compagniaId;
    const compagnia = game.actors.get(compagniaId);

    if (compagnia && item.system.price?.value > 0) {
      ChatMessage.create({
        content: `${actor.name} ha trovato ${item.name} (valore: ${item.system.price.value} ducati). Condividere con la compagnia?`,
        speaker: { alias: compagnia.name },
        whisper: ChatMessage.getWhisperRecipients("GM")
      });
    }
  }

  /**
   * Gestisce aggiornamenti della compagnia via socket
   */
  _handleCompagniaUpdate(data) {
    // Aggiorna UI per tutti i client
    ui.actors.render();
  }
}