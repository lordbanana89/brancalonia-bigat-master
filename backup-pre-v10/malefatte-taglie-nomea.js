/**
 * Sistema Malefatte, Taglie e Nomea - Implementazione Corretta
 * Basato sul manuale Brancalonia (pag. 46-48)
 * Compatibile con dnd5e system v3.3.x
 *
 * REGOLE DAL MANUALE:
 * - 20 Malefatte base con valori in mo
 * - Taglia = somma valori malefatte
 * - Nomea basata sulla taglia totale
 * - Sistema Fratelli di Taglia con livelli di notorietà
 */

export class MalefatteTaglieNomeaSystem {
  constructor() {
    // Tabella Malefatte dal manuale (pag. 46-47)
    this.malefatte = [
      { id: 1, name: "Schiamazzi notturni e disturbo della pubblica quiete", value: 2 },
      { id: 2, name: "Sermone non autorizzato, abbindolamento o supercazzola", value: 2 },
      { id: 3, name: "Offese, insulti o vilipendio", value: 2 },
      { id: 4, name: "Vivande e bevande non pagate", value: 2 },
      { id: 5, name: "Furto di pollame e altri volatili da cortile", value: 4 },
      { id: 6, name: "Adulterio o abbandono del tetto coniugale", value: 4 },
      { id: 7, name: "Profezia, scommessa o gioco d'azzardo non autorizzato", value: 4 },
      { id: 8, name: "Bracconaggio o contrabbando di animali", value: 8 },
      { id: 9, name: "Truffa, imbroglio o burla aggravata", value: 8 },
      { id: 10, name: "Borseggio e taccheggio da mercato", value: 10 },
      { id: 11, name: "Furto con destrezza, furto con carisma o furto con intelligenza", value: 10 },
      { id: 12, name: "Maleficio o fandonia molesta", value: 10 },
      { id: 13, name: "Falsificazione di reliquie e oggetti di pregio", value: 10 },
      { id: 14, name: "Distillazione clandestina, contrabbando o ricettazione", value: 12 },
      { id: 15, name: "Malversazione, corruzione, insolvenza o tasse non pagate", value: 12 },
      { id: 16, name: "Evasione, resistenza all'arresto, interruzione di pubblica esecuzione", value: 15 },
      { id: 17, name: "Rissa non regolamentata, vandalismo, sfascio di bettole e ricoveri", value: 15 },
      { id: 18, name: "Falsificazione di documenti e monete", value: 18 },
      { id: 19, name: "Contrabbando di mostruosità, draghi, bestie magiche e aberrazioni", value: 20 },
      { id: 20, name: "Tradimento, spionaggio e diserzione", value: 20 }
    ];

    // Malefatte aggiuntive (pag. 77 - per crimini più gravi)
    this.malefatteGravi = [
      { name: "Rapina a mano armata", value: 25 },
      { name: "Sequestro di persona", value: 30 },
      { name: "Incendio doloso", value: 35 },
      { name: "Omicidio premeditato", value: 40 },
      { name: "Sacrilegio grave", value: 45 },
      { name: "Cospirazione contro il Regno", value: 50 },
      { name: "Stregoneria nera", value: 60 },
      { name: "Alto tradimento", value: 75 },
      { name: "Regicidio tentato", value: 100 }
    ];

    // Livelli di Nomea basati sulla Taglia (pag. 48)
    this.nomeaLevels = {
      infame: { min: -1, max: -1, name: "Infame", description: "Traditore dei Fratelli di Taglia" },
      maltagliato: { min: 0, max: 9, name: "Maltagliato", description: "Principiante senza taglia significativa" },
      mezzaTaglia: { min: 10, max: 49, name: "Mezza Taglia", description: "Canaglia di basso profilo" },
      tagliola: { min: 50, max: 99, name: "Tagliola", description: "Criminale rispettabile" },
      tagliaForte: { min: 100, max: 199, name: "Taglia Forte", description: "Vero Fratello di Taglia" },
      vecchiaTaglia: { min: 200, max: 399, name: "Vecchia Taglia", description: "Veterano rispettato" },
      grandeTaglia: { min: 400, max: 999, name: "Grande Taglia", description: "Leggenda vivente" },
      mito: { min: 1000, max: Infinity, name: "Mito", description: "Entrato nella leggenda" }
    };

    // Attenuanti e Aggravanti (pag. 78)
    this.modifiers = {
      attenuanti: {
        "Legittima difesa": 0.5,
        "Stato di necessità": 0.7,
        "Ubriachezza": 0.8,
        "Minore età": 0.6,
        "Collaborazione con la giustizia": 0.5
      },
      aggravanti: {
        "Contro autorità": 1.5,
        "Contro religiosi": 1.5,
        "Con violenza": 1.5,
        "Recidiva": 2.0,
        "In gruppo": 1.3,
        "Di notte": 1.2
      }
    };

    this._setupHooks();
  }

  _setupHooks() {
    // Hook per scheda personaggio
    Hooks.on("renderActorSheet5eCharacter", (app, html, data) => {
      this._renderTagliaSection(app, html);
    });

    // Hook per creazione personaggio
    Hooks.on("createActor", (actor) => {
      if (actor.type === "character") {
        this._initializeCharacterMalefatte(actor);
      }
    });

    // Hook per fase di Sbraco - aggiorna taglie
    Hooks.on("brancalonia.sbracoStarted", () => {
      if (game.user.isGM) {
        this._updateAllTaglie();
      }
    });
  }

  /**
   * Inizializza malefatte per nuovo personaggio
   */
  async _initializeCharacterMalefatte(actor) {
    const level = actor.system.details.level || 1;
    const numMalefatte = 3 + level; // 3 + livello del personaggio

    // Dialog per selezione malefatte iniziali
    const content = `
      <div class="malefatte-init">
        <h3>Malefatte Iniziali per ${actor.name}</h3>
        <p>Seleziona ${numMalefatte} malefatte per determinare la Taglia iniziale:</p>

        <div class="malefatte-selection" style="max-height: 400px; overflow-y: auto;">
          ${this.malefatte.map(m => `
            <label style="display: block; margin: 5px 0;">
              <input type="checkbox" name="malefatta" value="${m.id}" data-value="${m.value}">
              ${m.name} (${m.value} mo)
            </label>
          `).join('')}
        </div>

        <hr>
        <div class="taglia-preview">
          <strong>Taglia Totale:</strong> <span id="taglia-total">0</span> mo
        </div>
      </div>
    `;

    new Dialog({
      title: "Malefatte Iniziali",
      content,
      buttons: {
        random: {
          label: "Casuale",
          callback: async () => {
            const randomMalefatte = this._selectRandomMalefatte(numMalefatte);
            await this._applyInitialMalefatte(actor, randomMalefatte);
          }
        },
        confirm: {
          label: "Conferma",
          callback: async (html) => {
            const selected = html.find('input[name="malefatta"]:checked')
              .toArray()
              .slice(0, numMalefatte)
              .map(el => {
                const id = parseInt(el.value);
                return this.malefatte.find(m => m.id === id);
              });

            if (selected.length !== numMalefatte) {
              ui.notifications.warn(`Seleziona esattamente ${numMalefatte} malefatte!`);
              return;
            }

            await this._applyInitialMalefatte(actor, selected);
          }
        }
      },
      render: (html) => {
        // Aggiorna preview taglia
        html.find('input[name="malefatta"]').change(() => {
          const total = html.find('input[name="malefatta"]:checked')
            .toArray()
            .reduce((sum, el) => sum + parseInt(el.dataset.value), 0);
          html.find('#taglia-total').text(total);
        });
      }
    }).render(true);
  }

  /**
   * Seleziona malefatte casuali
   */
  _selectRandomMalefatte(count) {
    const selected = [];
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * 20) + 1;
      selected.push(this.malefatte.find(m => m.id === roll));
    }
    return selected;
  }

  /**
   * Applica malefatte iniziali
   */
  async _applyInitialMalefatte(actor, malefatte) {
    const taglia = malefatte.reduce((sum, m) => sum + m.value, 0);
    const nomea = this._calculateNomea(taglia);

    await actor.setFlag("brancalonia-bigat", "malefatte", malefatte);
    await actor.setFlag("brancalonia-bigat", "taglia", taglia);
    await actor.setFlag("brancalonia-bigat", "nomea", nomea.level);
    await actor.setFlag("brancalonia-bigat", "nomeaName", nomea.name);

    ChatMessage.create({
      content: `
        <div class="malefatte-initial">
          <h3>${actor.name} - Malefatte Iniziali</h3>
          <ul>
            ${malefatte.map(m => `<li>${m.name} (${m.value} mo)</li>`).join('')}
          </ul>
          <p><strong>Taglia Totale:</strong> ${taglia} mo</p>
          <p><strong>Nomea:</strong> ${nomea.name}</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({actor})
    });
  }

  /**
   * Calcola livello di Nomea dalla Taglia
   */
  _calculateNomea(taglia) {
    for (const [key, level] of Object.entries(this.nomeaLevels)) {
      if (taglia >= level.min && taglia <= level.max) {
        return {
          level: key,
          name: level.name,
          description: level.description
        };
      }
    }
    return this.nomeaLevels.maltagliato;
  }

  /**
   * Renderizza sezione Taglia sulla scheda
   */
  _renderTagliaSection(app, html) {
    const actor = app.actor;
    const malefatte = actor.getFlag("brancalonia-bigat", "malefatte") || [];
    const taglia = actor.getFlag("brancalonia-bigat", "taglia") || 0;
    const nomeaLevel = actor.getFlag("brancalonia-bigat", "nomea") || "maltagliato";
    const nomea = this.nomeaLevels[nomeaLevel];

    const tagliaHtml = `
      <div class="brancalonia-taglia-section" style="border: 2px solid #8B4513; padding: 10px; margin: 10px 0;">
        <h3 style="display: flex; justify-content: space-between; align-items: center;">
          <span><i class="fas fa-skull-crossbones"></i> Taglia e Nomea</span>
          ${game.user.isGM ? `
            <div>
              <button class="add-malefatta" title="Aggiungi Malefatta">
                <i class="fas fa-plus"></i>
              </button>
              <button class="manage-taglia" title="Gestisci Taglia">
                <i class="fas fa-edit"></i>
              </button>
            </div>
          ` : ''}
        </h3>

        <div class="taglia-display" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0;">
          <div style="text-align: center; padding: 10px; background: #f0f0f0; border-radius: 5px;">
            <div style="font-size: 0.8em; color: #666;">TAGLIA</div>
            <div style="font-size: 2em; font-weight: bold; color: #8B4513;">${taglia} mo</div>
          </div>
          <div style="text-align: center; padding: 10px; background: #f0f0f0; border-radius: 5px;">
            <div style="font-size: 0.8em; color: #666;">NOMEA</div>
            <div style="font-size: 1.5em; font-weight: bold; color: #8B4513;">${nomea.name}</div>
            <div style="font-size: 0.7em; font-style: italic;">${nomea.description}</div>
          </div>
        </div>

        <details style="margin-top: 10px;">
          <summary style="cursor: pointer; font-weight: bold;">
            Malefatte Attribuite (${malefatte.length})
          </summary>
          <div class="malefatte-list" style="margin-top: 10px; max-height: 200px; overflow-y: auto;">
            ${malefatte.length > 0 ? `
              <ul style="margin: 0; padding-left: 20px;">
                ${malefatte.map((m, i) => `
                  <li style="margin: 5px 0;">
                    ${m.name} - ${m.value} mo
                    ${game.user.isGM ? `
                      <button class="remove-malefatta" data-index="${i}"
                        style="float: right; font-size: 0.8em;">
                        <i class="fas fa-times"></i>
                      </button>
                    ` : ''}
                  </li>
                `).join('')}
              </ul>
            ` : '<p style="font-style: italic;">Nessuna malefatta registrata</p>'}
          </div>
        </details>

        ${this._renderNomeaEffects(nomea)}
      </div>
    `;

    // Inserisci dopo gli attributi
    const attributesTab = html.find('.tab.attributes');
    if (attributesTab.length) {
      attributesTab.append(tagliaHtml);
    } else {
      html.find('.sheet-body').prepend(tagliaHtml);
    }

    // Event listeners
    html.find('.add-malefatta').click(() => this._showAddMalefattaDialog(actor));
    html.find('.manage-taglia').click(() => this._showManageTagliaDialog(actor));
    html.find('.remove-malefatta').click((e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      this._removeMalefatta(actor, index);
    });
  }

  /**
   * Renderizza effetti della Nomea
   */
  _renderNomeaEffects(nomea) {
    const effects = {
      infame: [
        "❌ Non può usare Favori",
        "❌ Non può entrare nei Covi",
        "❌ Cacciato dai Fratelli di Taglia",
        "⚔️ Attaccato a vista da altre bande"
      ],
      maltagliato: [
        "👁️ Passa inosservato",
        "💰 Nessuna ricompensa per la cattura"
      ],
      mezzaTaglia: [
        "👥 Riconosciuto dai criminali locali",
        "💰 Piccola ricompensa per informazioni"
      ],
      tagliola: [
        "🎭 Conosciuto nella regione",
        "💰 Ricompensa decente per la cattura",
        "👮 Occasionalmente cercato dai birri"
      ],
      tagliaForte: [
        "⭐ Rispettato tra i Fratelli di Taglia",
        "💰 Alta ricompensa",
        "🎯 Cacciatori di taglie interessati"
      ],
      vecchiaTaglia: [
        "👑 Veterano rispettato",
        "💰 Ricompensa molto alta",
        "🎯 Cacciatori professionisti sulle tracce",
        "✨ +2 Intimidire con criminali"
      ],
      grandeTaglia: [
        "🌟 Leggenda vivente",
        "💰 Ricompensa enorme",
        "🎯 Squadre di cacciatori",
        "✨ +5 Intimidire, Vantaggio con criminali"
      ],
      mito: [
        "🔥 Entrato nel mito",
        "💰 Ricompensa da nobile",
        "⚔️ Eserciti mobilitati",
        "✨ Immunità alla paura, Ispirazione automatica"
      ]
    };

    const currentEffects = effects[nomea.level.toLowerCase()] || effects.maltagliato;

    return `
      <div class="nomea-effects" style="margin-top: 10px; padding: 10px; background: #f9f9f9; border-radius: 5px;">
        <strong>Effetti della Nomea:</strong>
        <ul style="margin: 5px 0; padding-left: 20px;">
          ${currentEffects.map(e => `<li style="margin: 3px 0;">${e}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Dialog per aggiungere malefatta
   */
  _showAddMalefattaDialog(actor) {
    const content = `
      <div class="add-malefatta-dialog">
        <div class="malefatta-type">
          <label>
            <input type="radio" name="type" value="standard" checked>
            Malefatta Standard
          </label>
          <label>
            <input type="radio" name="type" value="grave">
            Malefatta Grave
          </label>
          <label>
            <input type="radio" name="type" value="custom">
            Malefatta Personalizzata
          </label>
        </div>

        <hr>

        <div class="standard-selection">
          <select name="standard-malefatta" style="width: 100%;">
            ${this.malefatte.map(m => `
              <option value="${m.id}">${m.name} (${m.value} mo)</option>
            `).join('')}
          </select>
        </div>

        <div class="grave-selection" style="display: none;">
          <select name="grave-malefatta" style="width: 100%;">
            ${this.malefatteGravi.map((m, i) => `
              <option value="${i}">${m.name} (${m.value} mo)</option>
            `).join('')}
          </select>
        </div>

        <div class="custom-selection" style="display: none;">
          <label>
            Nome:
            <input type="text" name="custom-name" style="width: 100%;">
          </label>
          <label>
            Valore (mo):
            <input type="number" name="custom-value" min="1" value="10">
          </label>
        </div>

        <hr>

        <div class="modifiers">
          <h4>Modificatori (opzionali)</h4>

          <div>
            <strong>Attenuanti:</strong>
            ${Object.entries(this.modifiers.attenuanti).map(([name, mult]) => `
              <label style="display: block;">
                <input type="checkbox" name="attenuante" value="${mult}">
                ${name} (×${mult})
              </label>
            `).join('')}
          </div>

          <div style="margin-top: 10px;">
            <strong>Aggravanti:</strong>
            ${Object.entries(this.modifiers.aggravanti).map(([name, mult]) => `
              <label style="display: block;">
                <input type="checkbox" name="aggravante" value="${mult}">
                ${name} (×${mult})
              </label>
            `).join('')}
          </div>
        </div>

        <hr>
        <div class="value-preview">
          <strong>Valore Finale:</strong> <span id="final-value">0</span> mo
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: "Aggiungi Malefatta",
      content,
      buttons: {
        add: {
          label: "Aggiungi",
          callback: async (html) => {
            const type = html.find('input[name="type"]:checked').val();
            let malefatta;

            if (type === "standard") {
              const id = parseInt(html.find('select[name="standard-malefatta"]').val());
              malefatta = {...this.malefatte.find(m => m.id === id)};
            } else if (type === "grave") {
              const index = parseInt(html.find('select[name="grave-malefatta"]').val());
              malefatta = {...this.malefatteGravi[index]};
            } else {
              malefatta = {
                name: html.find('input[name="custom-name"]').val(),
                value: parseInt(html.find('input[name="custom-value"]').val())
              };
            }

            // Applica modificatori
            let multiplier = 1;
            html.find('input[name="attenuante"]:checked').each((i, el) => {
              multiplier *= parseFloat(el.value);
            });
            html.find('input[name="aggravante"]:checked').each((i, el) => {
              multiplier *= parseFloat(el.value);
            });

            malefatta.value = Math.round(malefatta.value * multiplier);

            await this._addMalefatta(actor, malefatta);
          }
        }
      },
      render: (html) => {
        // Switch tra tipi
        html.find('input[name="type"]').change((e) => {
          const type = e.target.value;
          html.find('.standard-selection').toggle(type === "standard");
          html.find('.grave-selection').toggle(type === "grave");
          html.find('.custom-selection').toggle(type === "custom");
          updatePreview();
        });

        // Aggiorna preview
        const updatePreview = () => {
          const type = html.find('input[name="type"]:checked').val();
          let baseValue = 0;

          if (type === "standard") {
            const id = parseInt(html.find('select[name="standard-malefatta"]').val());
            baseValue = this.malefatte.find(m => m.id === id)?.value || 0;
          } else if (type === "grave") {
            const index = parseInt(html.find('select[name="grave-malefatta"]').val());
            baseValue = this.malefatteGravi[index]?.value || 0;
          } else {
            baseValue = parseInt(html.find('input[name="custom-value"]').val()) || 0;
          }

          let multiplier = 1;
          html.find('input[name="attenuante"]:checked').each((i, el) => {
            multiplier *= parseFloat(el.value);
          });
          html.find('input[name="aggravante"]:checked').each((i, el) => {
            multiplier *= parseFloat(el.value);
          });

          const finalValue = Math.round(baseValue * multiplier);
          html.find('#final-value').text(finalValue);
        };

        // Listener per aggiornamenti
        html.find('select, input').change(updatePreview);
        updatePreview();
      }
    });

    dialog.render(true);
  }

  /**
   * Aggiungi malefatta a un attore
   */
  async _addMalefatta(actor, malefatta) {
    const malefatte = actor.getFlag("brancalonia-bigat", "malefatte") || [];
    malefatte.push(malefatta);

    const taglia = malefatte.reduce((sum, m) => sum + m.value, 0);
    const nomea = this._calculateNomea(taglia);

    await actor.setFlag("brancalonia-bigat", "malefatte", malefatte);
    await actor.setFlag("brancalonia-bigat", "taglia", taglia);
    await actor.setFlag("brancalonia-bigat", "nomea", nomea.level);
    await actor.setFlag("brancalonia-bigat", "nomeaName", nomea.name);

    // Segna come recente per il Barattiere
    const recentMalefatte = actor.getFlag("brancalonia-bigat", "recentMalefatte") || [];
    recentMalefatte.push(malefatta);
    await actor.setFlag("brancalonia-bigat", "recentMalefatte", recentMalefatte);

    ChatMessage.create({
      content: `
        <div class="malefatta-added">
          <h3>Nuova Malefatta!</h3>
          <p><strong>${actor.name}</strong> è accusato di: ${malefatta.name}</p>
          <p>Valore: ${malefatta.value} mo</p>
          <p>Nuova Taglia Totale: <strong>${taglia} mo</strong></p>
          <p>Nomea: <strong>${nomea.name}</strong></p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({actor})
    });
  }

  /**
   * Rimuovi malefatta
   */
  async _removeMalefatta(actor, index) {
    const malefatte = actor.getFlag("brancalonia-bigat", "malefatte") || [];
    if (index < 0 || index >= malefatte.length) return;

    const removed = malefatte.splice(index, 1)[0];
    const taglia = malefatte.reduce((sum, m) => sum + m.value, 0);
    const nomea = this._calculateNomea(taglia);

    await actor.setFlag("brancalonia-bigat", "malefatte", malefatte);
    await actor.setFlag("brancalonia-bigat", "taglia", taglia);
    await actor.setFlag("brancalonia-bigat", "nomea", nomea.level);

    ChatMessage.create({
      content: `Rimossa malefatta: ${removed.name} (-${removed.value} mo)`,
      speaker: ChatMessage.getSpeaker({actor})
    });
  }

  /**
   * Dialog per gestire la taglia
   */
  _showManageTagliaDialog(actor) {
    const malefatte = actor.getFlag("brancalonia-bigat", "malefatte") || [];
    const taglia = actor.getFlag("brancalonia-bigat", "taglia") || 0;

    const content = `
      <div class="manage-taglia">
        <h3>Gestione Taglia - ${actor.name}</h3>
        <p>Taglia Attuale: <strong>${taglia} mo</strong></p>

        <div class="actions" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
          <button class="clear-recent">
            Pulisci Malefatte Recenti
          </button>
          <button class="pay-taglia">
            Paga parte della Taglia
          </button>
          <button class="change-nomea">
            Modifica Nomea
          </button>
          <button class="export-taglia">
            Esporta Scheda Taglia
          </button>
        </div>

        <hr>

        <div class="taglia-summary">
          <h4>Riepilogo Malefatte</h4>
          <table style="width: 100%;">
            <thead>
              <tr>
                <th>Malefatta</th>
                <th>Valore</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${malefatte.map((m, i) => `
                <tr>
                  <td>${m.name}</td>
                  <td>${m.value} mo</td>
                  <td>
                    <button class="remove-single" data-index="${i}">
                      <i class="fas fa-times"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="font-weight: bold;">
                <td>TOTALE</td>
                <td>${taglia} mo</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: "Gestione Taglia",
      content,
      buttons: {
        close: { label: "Chiudi" }
      },
      render: (html) => {
        html.find('.clear-recent').click(async () => {
          await actor.unsetFlag("brancalonia-bigat", "recentMalefatte");
          ui.notifications.info("Malefatte recenti pulite");
          dialog.close();
        });

        html.find('.pay-taglia').click(() => {
          this._showPayTagliaDialog(actor);
          dialog.close();
        });

        html.find('.change-nomea').click(() => {
          this._showChangeNomeaDialog(actor);
          dialog.close();
        });

        html.find('.export-taglia').click(() => {
          this._exportTagliaSheet(actor);
        });

        html.find('.remove-single').click(async (e) => {
          const index = parseInt(e.currentTarget.dataset.index);
          await this._removeMalefatta(actor, index);
          dialog.close();
          this._showManageTagliaDialog(actor); // Riapri aggiornato
        });
      }
    });

    dialog.render(true);
  }

  /**
   * Dialog per pagare parte della taglia
   */
  _showPayTagliaDialog(actor) {
    const taglia = actor.getFlag("brancalonia-bigat", "taglia") || 0;
    const money = actor.system.currency.gp || 0;

    const content = `
      <p>Taglia Attuale: ${taglia} mo</p>
      <p>Denaro Disponibile: ${money} mo</p>
      <label>
        Importo da pagare:
        <input type="number" name="amount" min="0" max="${Math.min(taglia, money)}" value="0">
      </label>
    `;

    new Dialog({
      title: "Paga Taglia",
      content,
      buttons: {
        pay: {
          label: "Paga",
          callback: async (html) => {
            const amount = parseInt(html.find('input[name="amount"]').val());
            if (amount > 0) {
              await actor.update({"system.currency.gp": money - amount});
              await actor.setFlag("brancalonia-bigat", "taglia", Math.max(0, taglia - amount));

              ChatMessage.create({
                content: `${actor.name} paga ${amount} mo per ridurre la taglia`,
                speaker: ChatMessage.getSpeaker({actor})
              });
            }
          }
        }
      }
    }).render(true);
  }

  /**
   * Esporta scheda taglia
   */
  _exportTagliaSheet(actor) {
    const malefatte = actor.getFlag("brancalonia-bigat", "malefatte") || [];
    const taglia = actor.getFlag("brancalonia-bigat", "taglia") || 0;
    const nomea = this.nomeaLevels[actor.getFlag("brancalonia-bigat", "nomea") || "maltagliato"];

    const sheet = `
      <div style="border: 3px solid #8B4513; padding: 20px; background: #FFF8DC;">
        <h1 style="text-align: center; color: #8B4513;">TAGLIA</h1>
        <h2 style="text-align: center;">${actor.name}</h2>

        <div style="text-align: center; margin: 20px 0;">
          <div style="font-size: 3em; font-weight: bold; color: red;">
            ${taglia} MO
          </div>
          <div style="font-size: 1.5em;">
            ${nomea.name}
          </div>
        </div>

        <h3>Malefatte Attribuite:</h3>
        <ul>
          ${malefatte.map(m => `<li>${m.name} - ${m.value} mo</li>`).join('')}
        </ul>

        <hr>
        <p style="text-align: center; font-style: italic;">
          "Per ordine di Equitaglia e dei Regi Registri"
        </p>
      </div>
    `;

    // Crea journal entry
    JournalEntry.create({
      name: `Taglia - ${actor.name}`,
      content: sheet
    });

    ui.notifications.info("Scheda Taglia esportata nel Journal!");
  }

  /**
   * Aggiorna tutte le taglie durante lo Sbraco
   */
  _updateAllTaglie() {
    if (!game.user.isGM) return;

    const actors = game.actors.filter(a =>
      a.type === "character" &&
      a.hasPlayerOwner
    );

    const content = `
      <div class="update-taglie">
        <h3>Aggiornamento Taglie - Fase di Sbraco</h3>
        <p>Aggiorna le taglie per le malefatte commesse durante l'ultimo lavoretto:</p>

        <div class="actor-list">
          ${actors.map(actor => {
            const recent = actor.getFlag("brancalonia-bigat", "recentMalefatte") || [];
            return `
              <div style="margin: 10px 0; padding: 10px; border: 1px solid #ccc;">
                <h4>${actor.name}</h4>
                ${recent.length > 0 ? `
                  <p>Malefatte recenti da confermare:</p>
                  <ul>
                    ${recent.map(m => `<li>${m.name} (${m.value} mo)</li>`).join('')}
                  </ul>
                  <button class="confirm-malefatte" data-actor="${actor.id}">
                    Conferma Malefatte
                  </button>
                  <button class="use-barattiere" data-actor="${actor.id}">
                    Usa Barattiere
                  </button>
                ` : '<p style="font-style: italic;">Nessuna nuova malefatta</p>'}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: "Aggiornamento Taglie",
      content,
      buttons: {
        close: { label: "Chiudi" }
      },
      render: (html) => {
        html.find('.confirm-malefatte').click(async (e) => {
          const actorId = e.currentTarget.dataset.actor;
          const actor = game.actors.get(actorId);
          await actor.unsetFlag("brancalonia-bigat", "recentMalefatte");
          ui.notifications.info(`Malefatte confermate per ${actor.name}`);
          dialog.close();
          this._updateAllTaglie(); // Riapri
        });

        html.find('.use-barattiere').click((e) => {
          const actorId = e.currentTarget.dataset.actor;
          const actor = game.actors.get(actorId);

          if (game.brancalonia?.favoriSystem) {
            game.brancalonia.favoriSystem._executeBarattiere(actor);
          }
          dialog.close();
        });
      }
    });

    dialog.render(true);
  }

  /**
   * Registra impostazioni
   */
  static registerSettings() {
    game.settings.register("brancalonia-bigat", "useInfamiaInsteadOfTaglia", {
      name: "Usa Sistema Infamia",
      hint: "Usa il sistema Infamia 0-100 invece di Malefatte/Taglie (non canonico)",
      scope: "world",
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register("brancalonia-bigat", "autoCalculateNomea", {
      name: "Calcolo Automatico Nomea",
      hint: "Calcola automaticamente la Nomea basata sulla Taglia",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });
  }
}