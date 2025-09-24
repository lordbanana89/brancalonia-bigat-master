/**
 * Sistema Equitaglia - Gestione Taglie e Giustizia del Regno
 * Basato sul manuale di Brancalonia (pag. 78-79)
 */

class BrancaloniaEquitaglia {
  constructor() {
    this.setupEquitaglia();
  }

  setupEquitaglia() {
    if (!CONFIG.BRANCALONIA) CONFIG.BRANCALONIA = {};

    CONFIG.BRANCALONIA.equitaglia = {
      // Tabella Malefatte con Valori di Taglia
      malefatte: {
        // Malefatte Minori
        schiamazzi: {
          nome: "Schiamazzi notturni e disturbo della quiete",
          valore: 2
        },
        sermone: {
          nome: "Sermone non autorizzato, abbindolamento o supercazzola",
          valore: 2
        },
        insulti: {
          nome: "Offese, insulti o vilipendio",
          valore: 2
        },
        adulterio: {
          nome: "Adulterio o abbandono del tetto coniugale",
          valore: 4
        },
        profezia: {
          nome: "Profezia, scommessa o gioco d'azzardo non autorizzato",
          valore: 4
        },

        // Furti e Appropriazioni
        appropriazione: {
          nome: "Appropriazione indebita di tesoro o bottino",
          valore: "valore_maltolto",
          moltiplicatore: 1
        },
        borseggio: {
          nome: "Furto con destrezza, borseggio, taccheggio",
          valore: "valore_maltolto",
          moltiplicatore: 2
        },
        truffa: {
          nome: "Truffa, burla, imbroglio, ciarlataneria",
          valore: "valore_maltolto",
          moltiplicatore: 2
        },
        bracconaggio: {
          nome: "Bracconaggio o contrabbando",
          valore: "valore_maltolto",
          moltiplicatore: 2
        },
        contraffazione: {
          nome: "Contraffazione, falsificazione di reliquie e documenti",
          valore: "valore_maltolto",
          moltiplicatore: 4
        },
        malversazione: {
          nome: "Malversazione, corruzione, insolvenza o tasse non pagate",
          valore: "valore_maltolto",
          moltiplicatore: 4
        },

        // Violenza
        rissa: {
          nome: "Rissa non regolamentata, vandalismo",
          valore: "valore_danni",
          moltiplicatore: 2
        },
        maleficio: {
          nome: "Maleficio o fandonia molesta, finto miracolo",
          valore: 10
        },
        aggressione: {
          nome: "Aggressione, percosse e violenza",
          valore: 10,
          perPersona: true
        },
        resistenza: {
          nome: "Resistenza all'arresto",
          valore: 15
        },
        evasione: {
          nome: "Evasione, interruzione di pubblica esecuzione",
          valore: "taglia_evasi"
        },
        tradimento: {
          nome: "Tradimento, spionaggio e diserzione",
          valore: 20
        },
        rapimento: {
          nome: "Rapimento, estorsione, sfruttamento",
          valore: 50,
          perPersona: true
        },
        maledizione: {
          nome: "Maledizione maggiore o incantesimo nocivo",
          valore: 50
        },
        rapina: {
          nome: "Rapina a mano armata, saccheggio",
          valore: "valore_maltolto",
          moltiplicatore: 8
        },
        sedizione: {
          nome: "Sedizione, rivolta, brigantaggio organizzato",
          valore: 100
        },
        assassinio: {
          nome: "Assassinio o arsione di marionetta",
          valore: 100
        },
        strage: {
          nome: "Strage, massacri, atti di guerra",
          valore: 1000
        }
      },

      // Attenuanti e Aggravanti
      modificatori: {
        tentato: {
          nome: "Tentato (beccato mentre ci provava)",
          moltiplicatore: 0.5
        },
        pentito: {
          nome: "Pentito e confessato",
          moltiplicatore: 0.5
        },
        istigazione: {
          nome: "Istigazione (non ha agito direttamente)",
          moltiplicatore: 0.5
        },
        complicita: {
          nome: "Complicità o Favoreggiamento",
          moltiplicatore: 0.5
        },
        penumbria: {
          nome: "In Penumbria (leggi diverse)",
          moltiplicatore: 0.5,
          giorniPena: 4 // invece di 2
        },
        vortigana: {
          nome: "In Vortigana (leggi più aspre)",
          moltiplicatore: 2
        },
        controBirri: {
          nome: "Contro birri, notabili e pezzi grossi",
          moltiplicatore: 2
        },
        efferatezza: {
          nome: "Contro indifesi o con efferatezza",
          moltiplicatore: 2,
          rischioInfamia: true
        },
        reiterato: {
          nome: "Plurimo o Reiterato",
          moltiplicatore: 2 // o 4
        },
        mandante: {
          nome: "Mandante (ha ordinato ad altri)",
          moltiplicatore: 2
        }
      },

      // Leggi Non Scritte del Regno
      leggiNonScritte: [
        "Se nessuno ci guadagna da una denuncia, non si denuncia",
        "Se nessuno può identificare i malfattori, non è stato nessuno",
        "I birri vogliono la vita facile e versioni comode dei fatti",
        "Chi subisce una truffa è un minchione e se l'è cercata",
        "Se la Taglia non è alta abbastanza, non vale la pena cercare il malfattore",
        "La soffiata ai birri è gradita, ma chi la fa è un Infame"
      ]
    };
  }

  /**
   * Calcola il valore di taglia per una malefatta
   */
  calcolaValoretaglia(malefatta, opzioni = {}) {
    const def = CONFIG.BRANCALONIA.equitaglia.malefatte[malefatta];
    if (!def) return 0;

    let valore = def.valore;

    // Calcola valore base
    if (valore === "valore_maltolto") {
      valore = (opzioni.valoreMaltolto || 0) * (def.moltiplicatore || 1);
    } else if (valore === "valore_danni") {
      valore = (opzioni.valoreDanni || 0) * (def.moltiplicatore || 1);
    } else if (valore === "taglia_evasi") {
      valore = opzioni.tagliaEvasi || 0;
    } else if (def.perPersona) {
      valore = def.valore * (opzioni.numeroPersone || 1);
    }

    // Applica modificatori
    if (opzioni.modificatori) {
      for (const mod of opzioni.modificatori) {
        const modDef = CONFIG.BRANCALONIA.equitaglia.modificatori[mod];
        if (modDef?.moltiplicatore) {
          valore *= modDef.moltiplicatore;
        }
      }
    }

    return Math.floor(valore);
  }

  /**
   * Calcola la pena in giorni basata sulla taglia
   */
  calcolaPena(valoreTaglia, inPenumbria = false) {
    // La pena base è 10 volte il valore della taglia
    let giorni = valoreTaglia * 10;

    // In Penumbria la pena è 4 volte invece di 2 volte
    if (inPenumbria) {
      giorni = valoreTaglia * 20; // Dimezza taglia ma raddoppia giorni = x4
    }

    return giorni;
  }

  /**
   * Determina il tipo di pena basata sui giorni
   */
  tipoPena(giorni) {
    if (giorni <= 60) {
      return "prigione_locale"; // Prigioni locali o gogna
    } else {
      return "lavori_forzati"; // Galee o lavori forzati
    }
  }

  /**
   * Calcola la ricompensa per una soffiata
   */
  ricompensaSoffiata(valoreTaglia, pagamentoImmediato = false) {
    const percentuale = valoreTaglia * 0.1; // 10% della taglia

    if (pagamentoImmediato) {
      return Math.floor(percentuale * 0.5); // Metà se pagato subito
    }

    return Math.floor(percentuale);
  }

  /**
   * Verifica se una canaglia rischia l'infamia
   */
  rischiaInfamia(malefatte, modificatori = []) {
    // Crimini efferati rischiano sempre l'infamia
    const criminiEfferati = ['assassinio', 'strage', 'rapimento'];

    for (const malefatta of malefatte) {
      if (criminiEfferati.includes(malefatta)) {
        return true;
      }
    }

    // Modificatore efferatezza
    if (modificatori.includes('efferatezza')) {
      return true;
    }

    return false;
  }

  /**
   * Aggiunge una nuova malefatta a un attore
   */
  async aggiungiMalefatta(actor, malefatta, opzioni = {}) {
    const valoreTaglia = this.calcolaValoretaglia(malefatta, opzioni);
    const malefatte = actor.getFlag("brancalonia", "malefatte") || [];

    malefatte.push({
      tipo: malefatta,
      nome: CONFIG.BRANCALONIA.equitaglia.malefatte[malefatta].nome,
      valore: valoreTaglia,
      data: game.time.worldTime,
      testimoni: opzioni.testimoni || [],
      modificatori: opzioni.modificatori || []
    });

    await actor.setFlag("brancalonia", "malefatte", malefatte);

    // Ricalcola la taglia totale
    await this.ricalcolaTaglia(actor);

    // Verifica infamia
    if (this.rischiaInfamia([malefatta], opzioni.modificatori || [])) {
      ui.notifications.warn(`${actor.name} rischia l'Infamia per questa malefatta!`);
    }

    ChatMessage.create({
      content: `<div class="brancalonia-equitaglia">
        <h3>⚖️ Nuova Malefatta Registrata</h3>
        <p><strong>${actor.name}</strong> è accusato di:</p>
        <p><em>${CONFIG.BRANCALONIA.equitaglia.malefatte[malefatta].nome}</em></p>
        <p><strong>Valore Taglia:</strong> ${valoreTaglia} gransoldi</p>
        ${opzioni.testimoni?.length ? `<p><small>Testimoni: ${opzioni.testimoni.join(", ")}</small></p>` : ""}
      </div>`
    });

    return valoreTaglia;
  }

  /**
   * Ricalcola la taglia totale di un attore
   */
  async ricalcolaTaglia(actor) {
    const malefatte = actor.getFlag("brancalonia", "malefatte") || [];
    let tagliatotale = 0;

    for (const malefatta of malefatte) {
      tagliatotale += malefatta.valore || 0;
    }

    await actor.setFlag("brancalonia", "taglia", tagliatotale);

    // Aggiorna anche la nomea se necessario
    const nomea = Math.floor(tagliatotale / 10);
    await actor.setFlag("brancalonia", "nomea", nomea);

    return tagliatotale;
  }

  /**
   * Gestisce la cattura e il pagamento della taglia
   */
  async catturaMalfattore(actor, catturatoDa = "birri") {
    const taglia = actor.getFlag("brancalonia", "taglia") || 0;

    if (taglia === 0) {
      ui.notifications.info("Nessuna taglia su questa canaglia!");
      return;
    }

    let ricompensa = taglia;

    // I birri prendono solo metà taglia
    if (catturatoDa === "birri") {
      ricompensa = Math.floor(taglia / 2);
    }

    const giorniPena = this.calcolaPena(taglia);
    const tipoPena = this.tipoPena(giorniPena);

    ChatMessage.create({
      content: `<div class="brancalonia-equitaglia">
        <h3>⚖️ Malfattore Catturato!</h3>
        <p><strong>${actor.name}</strong> è stato catturato da ${catturatoDa}!</p>
        <p><strong>Taglia Riscossa:</strong> ${ricompensa} gransoldi</p>
        <p><strong>Pena da Scontare:</strong> ${giorniPena} giorni</p>
        <p><strong>Tipo:</strong> ${tipoPena === "prigione_locale" ? "Prigione locale/Gogna" : "Galee/Lavori forzati"}</p>
        <p><small>La taglia rimane attiva finché la pena non è completamente scontata.</small></p>
      </div>`
    });

    // Segna l'inizio della pena
    await actor.setFlag("brancalonia", "pena", {
      giorni: giorniPena,
      tipo: tipoPena,
      iniziata: game.time.worldTime,
      giorniScontati: 0
    });

    return ricompensa;
  }


  /**
   * Mostra dialogo per aggiungere una malefatta
   */
  async mostraDialogoMalefatta(actor) {
    const malefatte = CONFIG.BRANCALONIA.equitaglia.malefatte;
    const modificatori = CONFIG.BRANCALONIA.equitaglia.modificatori;

    const content = `
      <form>
        <div class="form-group">
          <label>Tipo di Malefatta:</label>
          <select name="malefatta">
            ${Object.entries(malefatte).map(([key, val]) =>
              `<option value="${key}">${val.nome}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Valore Maltolto/Danni (se applicabile):</label>
          <input type="number" name="valore" value="0"/>
        </div>
        <div class="form-group">
          <label>Numero Persone Coinvolte:</label>
          <input type="number" name="persone" value="1" min="1"/>
        </div>
        <div class="form-group">
          <label>Testimoni (separati da virgola):</label>
          <input type="text" name="testimoni" placeholder="Guardia Beppe, Oste Gino"/>
        </div>
        <div class="form-group">
          <label>Modificatori:</label>
          ${Object.entries(modificatori).map(([key, val]) => `
            <label>
              <input type="checkbox" name="mod_${key}"/>
              ${val.nome}
            </label><br/>
          `).join('')}
        </div>
      </form>
    `;

    new Dialog({
      title: "Aggiungi Malefatta",
      content,
      buttons: {
        add: {
          label: "Aggiungi",
          callback: async (html) => {
            const malefatta = html.find('[name="malefatta"]').val();
            const valore = parseInt(html.find('[name="valore"]').val()) || 0;
            const persone = parseInt(html.find('[name="persone"]').val()) || 1;
            const testimoni = html.find('[name="testimoni"]').val()
              .split(',').map(t => t.trim()).filter(t => t);

            const mods = [];
            Object.keys(modificatori).forEach(key => {
              if (html.find(`[name="mod_${key}"]`).prop('checked')) {
                mods.push(key);
              }
            });

            await this.aggiungiMalefatta(actor, malefatta, {
              valoreMaltolto: valore,
              valoreDanni: valore,
              numeroPersone: persone,
              testimoni,
              modificatori: mods
            });
          }
        }
      }
    }).render(true);
  }

  /**
   * Mostra dialogo per catturare un malfattore
   */
  async mostraDialogoCattura(actor) {
    const content = `
      <form>
        <div class="form-group">
          <label>Catturato da:</label>
          <select name="catturatoDa">
            <option value="cacciatore">Cacciatore di Taglie (100%)</option>
            <option value="birri">Birri (50%)</option>
            <option value="soffiata">Con Soffiata (90%)</option>
          </select>
        </div>
      </form>
    `;

    new Dialog({
      title: "Cattura Malfattore",
      content,
      buttons: {
        capture: {
          label: "Cattura",
          callback: async (html) => {
            const catturatoDa = html.find('[name="catturatoDa"]').val();
            await this.catturaMalfattore(actor, catturatoDa);
          }
        }
      }
    }).render(true);
  }
}

// Registra hooks prima del ready
Hooks.once("init", () => {
  // Registra hook per UI qui, prima che le schede vengano aperte
  Hooks.on("renderActorSheet", (app, html, data) => {
    if (app.actor.type !== "character") return;
    if (!game.brancalonia?.equitaglia) return; // Aspetta che il sistema sia pronto

    const taglia = app.actor.getFlag("brancalonia", "taglia") || 0;
    const malefatte = app.actor.getFlag("brancalonia", "malefatte") || [];

    // Aggiungi sezione Equitaglia alla scheda
    const equitagliaSection = `
      <div class="brancalonia-section equitaglia">
        <h3>⚖️ Equitaglia - Registro Malefatte</h3>
        <div class="taglia-display">
          <span>Taglia Totale: <strong>${taglia} gransoldi</strong></span>
          <span>Pena Potenziale: <strong>${taglia * 10} giorni</strong></span>
        </div>
        <div class="malefatte-list">
          ${malefatte.map(m => `
            <div class="malefatta-entry">
              <span>${m.nome}</span>
              <span>${m.valore} mo</span>
            </div>
          `).join('')}
        </div>
        <div class="equitaglia-controls">
          <button class="aggiungi-malefatta" title="Aggiungi Malefatta">
            <i class="fas fa-gavel"></i> Nuova Malefatta
          </button>
          <button class="cattura-malfattore" title="Cattura!">
            <i class="fas fa-handcuffs"></i> Cattura
          </button>
        </div>
      </div>
    `;

    html.find(".tab.biography").append(equitagliaSection);

    // Event handlers
    html.find(".aggiungi-malefatta").click(() => {
      game.brancalonia.equitaglia.mostraDialogoMalefatta(app.actor);
    });
    html.find(".cattura-malfattore").click(() => {
      game.brancalonia.equitaglia.mostraDialogoCattura(app.actor);
    });
  });
});

// Inizializza il sistema
Hooks.once("ready", () => {
  // NON sovrascrivere game.brancalonia, solo aggiungere equitaglia
  if (!game.brancalonia) {
    console.error("Brancalonia | game.brancalonia non trovato!");
    return;
  }
  game.brancalonia.equitaglia = new BrancaloniaEquitaglia();
  console.log("Brancalonia | Sistema Equitaglia inizializzato");
});