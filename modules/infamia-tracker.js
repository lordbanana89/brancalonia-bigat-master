/**
 * Sistema di Tracciamento Infamia per Brancalonia
 * Compatibile con Foundry VTT v13 e D&D 5e v3.3.1
 */

export class InfamiaTracker {
  constructor() {
    this.infamiaLevels = {
      0: { name: "Sconosciuto", effects: [] },
      10: { name: "Poco Noto", effects: ["Piccoli sconti dai criminali"] },
      25: { name: "Mal Visto", effects: ["Guardie sospettose", "-1 Persuasione con autorità"] },
      50: { name: "Ricercato", effects: ["Taglia minore", "Controlli frequenti", "-2 Persuasione con autorità"] },
      75: { name: "Fuorilegge", effects: ["Taglia maggiore", "Cacciatori di taglie", "Bandito dalle città"] },
      100: { name: "Nemico Pubblico", effects: ["Taglia enorme", "Squadre di cacciatori", "Kill on sight"] }
    };

    this.infamiaActions = {
      "Furto Minore": 1,
      "Furto Maggiore": 3,
      "Rapina": 5,
      "Estorsione": 3,
      "Contrabbando": 2,
      "Omicidio Comune": 8,
      "Omicidio Nobile": 15,
      "Tradimento": 10,
      "Evasione": 5,
      "Rissa Pubblica": 1,
      "Danneggiamento": 2,
      "Oltraggio Autorità": 4,
      "Sacrilegio": 6,
      "Pirateria": 7,
      "Sedizione": 12
    };

    this._setupHooks();
  }

  _setupHooks() {
    // Hook per aggiungere controlli infamia ai tiri
    Hooks.on("dnd5e.preRollAbilityTest", (actor, rollData, messageData) => {
      if (rollData.ability === "per" && this._isAuthorityCheck(actor)) {
        const infamia = actor.flags.brancalonia?.infamia || 0;
        const penalty = this._getInfamiaPenalty(infamia);

        if (penalty) {
          rollData.parts.push(`-${penalty}[Infamia]`);
          ui.notifications.info(`Penalità Infamia: -${penalty}`);
        }
      }
    });

    // Hook per random encounters basati su infamia
    Hooks.on("canvasReady", () => {
      if (game.user.isGM) {
        this._checkRandomBountyHunters();
      }
    });
  }

  /**
   * Renderizza il tracker dell'infamia sulla scheda del personaggio
   */
  renderInfamiaTracker(app, html, data) {
    const actor = app.actor;
    const infamia = actor.flags.brancalonia?.infamia || 0;
    const level = this._getInfamiaLevel(infamia);

    // Template HTML per il tracker
    const trackerHtml = `
      <div class="brancalonia-infamia-section">
        <h3 class="infamia-header">
          <i class="fas fa-skull"></i>
          Infamia
          <span class="infamia-controls">
            <a class="infamia-decrease" title="Diminuisci Infamia"><i class="fas fa-minus"></i></a>
            <a class="infamia-increase" title="Aumenta Infamia"><i class="fas fa-plus"></i></a>
            <a class="infamia-info" title="Info Infamia"><i class="fas fa-info-circle"></i></a>
          </span>
        </h3>
        <div class="infamia-bar-container">
          <div class="infamia-bar">
            <div class="infamia-fill" style="width: ${infamia}%; background: ${this._getInfamiaColor(infamia)}"></div>
            <span class="infamia-value">${infamia}/100</span>
          </div>
          <div class="infamia-level">${level.name}</div>
        </div>
        <div class="infamia-effects">
          ${level.effects.length > 0 ? `
            <div class="effects-list">
              ${level.effects.map(e => `<span class="effect-tag">${e}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Inserisci dopo le caratteristiche
    const attributesTab = html.find('.tab.attributes');
    attributesTab.append(trackerHtml);

    // Aggiungi event listeners
    html.find('.infamia-increase').click(() => this._modifyInfamia(actor, 1));
    html.find('.infamia-decrease').click(() => this._modifyInfamia(actor, -1));
    html.find('.infamia-info').click(() => this._showInfamiaInfo(actor));

    // Aggiungi CSS inline se necessario
    if (!$('#brancalonia-infamia-styles').length) {
      $('head').append(`
        <style id="brancalonia-infamia-styles">
          .brancalonia-infamia-section {
            margin: 10px 0;
            padding: 10px;
            border: 2px solid #8b4513;
            border-radius: 5px;
            background: rgba(139, 69, 19, 0.1);
          }

          .infamia-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            color: #8b4513;
          }

          .infamia-controls a {
            margin: 0 2px;
            cursor: pointer;
            color: #8b4513;
          }

          .infamia-controls a:hover {
            color: #a0522d;
          }

          .infamia-bar-container {
            position: relative;
            margin-bottom: 5px;
          }

          .infamia-bar {
            height: 20px;
            background: #ddd;
            border: 1px solid #999;
            border-radius: 10px;
            position: relative;
            overflow: hidden;
          }

          .infamia-fill {
            height: 100%;
            transition: width 0.3s, background 0.3s;
          }

          .infamia-value {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-weight: bold;
            color: white;
            text-shadow: 1px 1px 2px black;
          }

          .infamia-level {
            text-align: center;
            font-weight: bold;
            color: #8b4513;
            margin-top: 5px;
          }

          .effects-list {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 5px;
          }

          .effect-tag {
            background: #8b4513;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.9em;
          }
        </style>
      `);
    }
  }

  /**
   * Modifica il valore di infamia
   */
  async _modifyInfamia(actor, delta) {
    const current = actor.flags.brancalonia?.infamia || 0;
    const newValue = Math.max(0, Math.min(100, current + delta));

    await actor.setFlag("brancalonia-bigat", "infamia", newValue);

    // Notifica cambio livello
    const oldLevel = this._getInfamiaLevel(current);
    const newLevel = this._getInfamiaLevel(newValue);

    if (oldLevel.name !== newLevel.name) {
      ChatMessage.create({
        content: `
          <div class="brancalonia-infamia-change">
            <h3>${actor.name}</h3>
            <p>Livello Infamia: <strong>${oldLevel.name}</strong> → <strong>${newLevel.name}</strong></p>
            ${newLevel.effects.length > 0 ? `
              <p>Nuovi effetti:</p>
              <ul>
                ${newLevel.effects.map(e => `<li>${e}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `,
        speaker: ChatMessage.getSpeaker({actor: actor})
      });
    }
  }

  /**
   * Mostra informazioni dettagliate sull'infamia
   */
  _showInfamiaInfo(actor) {
    const infamia = actor.flags.brancalonia?.infamia || 0;
    const level = this._getInfamiaLevel(infamia);

    const content = `
      <div class="brancalonia-infamia-info">
        <h2>Sistema Infamia - ${actor.name}</h2>
        <p><strong>Infamia Attuale:</strong> ${infamia}/100</p>
        <p><strong>Livello:</strong> ${level.name}</p>

        <h3>Effetti Attuali:</h3>
        <ul>
          ${level.effects.map(e => `<li>${e}</li>`).join('') || '<li>Nessuno</li>'}
        </ul>

        <h3>Azioni che Aumentano l'Infamia:</h3>
        <table>
          <thead>
            <tr>
              <th>Azione</th>
              <th>Punti</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(this.infamiaActions).map(([action, points]) => `
              <tr>
                <td>${action}</td>
                <td>+${points}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>Modi per Ridurre l'Infamia:</h3>
        <ul>
          <li>Pagare multe (1 punto per 50 ducati)</li>
          <li>Fare lavori legali (1-3 punti)</li>
          <li>Aiutare le autorità (5 punti)</li>
          <li>Periodo di inattività (1 punto/settimana)</li>
          <li>Cambiare identità (azzera ma costa molto)</li>
        </ul>

        <h3>Livelli di Infamia:</h3>
        <ul>
          ${Object.entries(this.infamiaLevels).map(([threshold, data]) => `
            <li><strong>${threshold}+:</strong> ${data.name}</li>
          `).join('')}
        </ul>
      </div>
    `;

    new Dialog({
      title: "Sistema Infamia",
      content: content,
      buttons: {
        close: {
          label: "Chiudi",
          callback: () => {}
        },
        addInfamia: {
          label: "Aggiungi Infamia",
          callback: () => this._showAddInfamiaDialog(actor)
        }
      },
      default: "close",
      render: html => {
        html.find('.brancalonia-infamia-info').css({
          'max-height': '600px',
          'overflow-y': 'auto'
        });
      }
    }).render(true);
  }

  /**
   * Dialog per aggiungere infamia per azioni specifiche
   */
  _showAddInfamiaDialog(actor) {
    const content = `
      <form>
        <div class="form-group">
          <label>Seleziona Azione Criminale:</label>
          <select id="infamia-action">
            <option value="">-- Personalizzato --</option>
            ${Object.entries(this.infamiaActions).map(([action, points]) => `
              <option value="${points}">${action} (+${points})</option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>O inserisci valore personalizzato:</label>
          <input type="number" id="infamia-custom" value="0" min="-100" max="100" />
        </div>
        <div class="form-group">
          <label>Note (opzionale):</label>
          <input type="text" id="infamia-note" placeholder="Motivo del cambiamento..." />
        </div>
      </form>
    `;

    new Dialog({
      title: `Modifica Infamia - ${actor.name}`,
      content: content,
      buttons: {
        add: {
          label: "Applica",
          callback: async (html) => {
            const action = html.find('#infamia-action').val();
            const custom = parseInt(html.find('#infamia-custom').val()) || 0;
            const note = html.find('#infamia-note').val();

            const value = action ? parseInt(action) : custom;

            if (value !== 0) {
              await actor.addInfamia(value);

              // Log nel chat
              ChatMessage.create({
                content: `
                  <div class="brancalonia-infamia-log">
                    <strong>${actor.name}</strong> ${value > 0 ? 'guadagna' : 'perde'} ${Math.abs(value)} punti Infamia
                    ${note ? `<br><em>${note}</em>` : ''}
                  </div>
                `,
                speaker: ChatMessage.getSpeaker({actor: actor})
              });
            }
          }
        },
        cancel: {
          label: "Annulla"
        }
      },
      default: "add"
    }).render(true);
  }

  /**
   * Ottiene il livello di infamia corrente
   */
  _getInfamiaLevel(value) {
    let currentLevel = this.infamiaLevels[0];

    for (const [threshold, level] of Object.entries(this.infamiaLevels)) {
      if (value >= parseInt(threshold)) {
        currentLevel = level;
      }
    }

    return currentLevel;
  }

  /**
   * Ottiene il colore per la barra infamia
   */
  _getInfamiaColor(value) {
    if (value >= 75) return '#8b0000'; // Rosso scuro
    if (value >= 50) return '#ff4500'; // Rosso arancione
    if (value >= 25) return '#ff8c00'; // Arancione scuro
    if (value >= 10) return '#ffd700'; // Oro
    return '#90ee90'; // Verde chiaro
  }

  /**
   * Ottiene penalità basata su infamia per interazioni con autorità
   */
  _getInfamiaPenalty(infamia) {
    if (infamia >= 75) return 5;
    if (infamia >= 50) return 3;
    if (infamia >= 25) return 1;
    return 0;
  }

  /**
   * Controlla se è un'interazione con autorità
   */
  _isAuthorityCheck(actor) {
    // Logica per determinare se si sta interagendo con autorità
    // Potrebbe essere basato su flag, target, o contesto
    return game.user.targets.some(t =>
      t.actor?.flags.brancalonia?.isAuthority ||
      t.actor?.name?.toLowerCase().includes('guardia') ||
      t.actor?.name?.toLowerCase().includes('capitano')
    );
  }

  /**
   * Genera incontri casuali con cacciatori di taglie
   */
  async _checkRandomBountyHunters() {
    if (!game.settings.get("brancalonia-bigat", "trackInfamia")) return;

    const party = game.actors.filter(a => a.hasPlayerOwner && a.type === "character");
    const maxInfamia = Math.max(...party.map(a => a.flags.brancalonia?.infamia || 0));

    if (maxInfamia >= 50) {
      const roll = await new Roll("1d100").evaluate();

      if (roll.total <= maxInfamia / 2) {
        ChatMessage.create({
          content: `
            <div class="brancalonia-encounter">
              <h3>⚠️ Cacciatori di Taglie! ⚠️</h3>
              <p>La vostra infamia ha attirato l'attenzione di cacciatori di taglie!</p>
              <p>Tiro: ${roll.total} (Soglia: ${maxInfamia / 2})</p>
            </div>
          `,
          whisper: ChatMessage.getWhisperRecipients("GM")
        });
      }
    }
  }

  /**
   * Riduce infamia attraverso azioni specifiche
   */
  async reduceInfamia(actor, method, amount = null) {
    const reductionMethods = {
      "fine": { base: 1, costPer: 50 }, // 1 punto per 50 ducati
      "legal_work": { base: 2 }, // Media di 1d3
      "help_authority": { base: 5 },
      "downtime_week": { base: 1 },
      "change_identity": { base: "all", cost: 1000 }
    };

    const reduction = reductionMethods[method];
    if (!reduction) return;

    let value = amount || reduction.base;

    if (method === "change_identity") {
      await actor.setFlag("brancalonia-bigat", "infamia", 0);
      ChatMessage.create({
        content: `${actor.name} ha cambiato identità! Infamia azzerata.`,
        speaker: ChatMessage.getSpeaker({actor: actor})
      });
    } else {
      await actor.addInfamia(-value);
    }
  }
}