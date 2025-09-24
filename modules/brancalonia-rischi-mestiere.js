/**
 * Sistema Rischi del Mestiere
 * Basato sul manuale di Brancalonia (pag. 49-52)
 */

class BrancaloniaRischiMestiere {
  constructor() {
    this.setupRischi();
    this.registerHooks();
  }

  setupRischi() {
    if (!CONFIG.BRANCALONIA) CONFIG.BRANCALONIA = {};

    CONFIG.BRANCALONIA.rischiMestiere = {
      // Tabella completa dei Rischi del Mestiere
      tabella: {
        1: { min: 1, max: 15, evento: "Non succede nulla", tipo: "neutro" },

        2: {
          min: 16, max: 20,
          evento: "La Cricca viene ricattata da un Infame, che minaccia di venderla ai birri",
          tipo: "ricatto"
        },

        3: {
          min: 21, max: 25,
          evento: "La Cricca incontra un birro che riconosce visibilmente i suoi membri",
          tipo: "birri"
        },

        4: {
          min: 26, max: 30,
          evento: "Un agente di Equitaglia dà la caccia alla Cricca",
          tipo: "cacciatori"
        },

        5: {
          min: 31, max: 35,
          evento: "Un uomo in cerca di vendetta vuole mettere i bastoni tra le ruote alla Cricca",
          tipo: "vendetta"
        },

        6: {
          min: 36, max: 40,
          evento: "La Cricca incontra un gruppo di 1d4 birri, che riconoscono visibilmente i suoi membri",
          tipo: "birri",
          numero: "1d4"
        },

        7: {
          min: 41, max: 45,
          evento: "Uno o più persone comuni riconoscono la Cricca e fanno una soffiata ai birri",
          tipo: "soffiata"
        },

        8: {
          min: 46, max: 50,
          evento: "La Cricca incontra una pattuglia di 2d4 birri e un capobirro, che sono espressamente sulle tracce di malviventi",
          tipo: "birri",
          numero: "2d4",
          capobirro: true
        },

        9: {
          min: 51, max: 55,
          evento: "Un mercante chiede aiuto alla Cricca per un affare chiaramente illegale",
          tipo: "opportunita"
        },

        10: {
          min: 56, max: 60,
          evento: "Un cavaliere è convinto che il male si annidi nella Cricca e inizia a darle la caccia",
          tipo: "cacciatori",
          cavaliere: true
        },

        11: {
          min: 61, max: 64,
          evento: "Un Infame cerca di intascare le Taglie della banda e indica l'ubicazione del Covo ai birri",
          tipo: "tradimento",
          covo: true
        },

        12: {
          min: 65, max: 68,
          evento: "Un Infame si intrufola nel Covo e cerca di rubarne il bottino",
          tipo: "furto",
          covo: true
        },

        13: {
          min: 69, max: 71,
          evento: "Tre cacciatori di Equitaglia si mettono sulle tracce dell'intera banda per catturarla tutta assieme e consegnarla ai birri",
          tipo: "cacciatori",
          numero: 3
        },

        14: {
          min: 72, max: 74,
          evento: "Un membro della banda diventa Infame e decide di tradirla",
          tipo: "tradimento",
          interno: true
        },

        15: {
          min: 75, max: 77,
          evento: "I turchini ritengono che la banda sia troppo efferata e hanno deciso di punirne i membri facendo crescere loro orecchie d'asino",
          tipo: "magia",
          turchini: true
        },

        16: {
          min: 78, max: 80,
          evento: "Una befana ha fatto innamorare il capobanda con un incantesimo e adesso lui è asservito ai suoi voleri",
          tipo: "magia",
          befana: true
        },

        17: {
          min: 81, max: 83,
          evento: "Un pezzo grosso ricatta il capobanda e lo costringe a usare la banda per fargli svolgere dei lavoretti per conto suo",
          tipo: "ricatto",
          capobanda: true
        },

        18: {
          min: 84, max: 86,
          evento: "Un'altra banda ha preso lo stesso lavoretto della Cricca e adesso ci sono due galli nello stesso pollaio",
          tipo: "rivalita"
        },

        19: {
          min: 87, max: 89,
          evento: "Un pezzo grosso ricatta il capobanda e lo costringe a vendere uno dopo l'altro i propri scagnozzi ai birri",
          tipo: "tradimento",
          capobanda: true
        },

        20: {
          min: 90, max: 92,
          evento: "Una banda rivale desidera il Covo della banda",
          tipo: "rivalita",
          covo: true
        },

        21: {
          min: 93, max: 95,
          evento: "Un confinato inizia a perseguitare la banda per una malefatta compiuta in passato",
          tipo: "vendetta",
          confinato: true
        },

        22: {
          min: 96, max: 98,
          evento: "Un malacoda, avvertendo la gravità delle malefatte della banda, si presenta incuriosito al Covo per vedere se può raccogliere qualche anima",
          tipo: "infernale"
        },

        23: {
          min: 99, max: 999,
          evento: "Editto: un pezzo grosso decreta la banda un pericolo pubblico e mette una Taglia supplementare di 100 gransoldi sulla testa di tutti i membri della Cricca",
          tipo: "editto",
          tagliaExtra: 100
        }
      }
    };
  }

  /**
   * Tira i Rischi del Mestiere per la Cricca
   */
  tiraRischiMestiere(cricca, modificatore = 0) {
    // Calcola il modificatore totale
    let modTotale = modificatore;

    // Trova la Nomea più alta nella Cricca
    let nomeaMax = 0;
    let bonusNomeaTotale = 0;

    for (const membro of cricca) {
      const nomea = membro.actor.getFlag("brancalonia-bigat", "nomea") || 0;
      nomeaMax = Math.max(nomeaMax, nomea);
      bonusNomeaTotale += Math.floor(nomea / 10); // +1 ogni 10 punti di nomea
    }

    modTotale += nomeaMax + bonusNomeaTotale;

    // Applica modificatori per Imbosco
    const settimaneImbosco = game.settings.get("brancalonia-bigat", "settimaneImbosco") || 0;
    modTotale -= (settimaneImbosco * 3);

    // Tira il dado
    const roll = new Roll(`1d100 + ${modTotale}`);
    roll.evaluate({ async: false });

    const risultato = roll.total;

    // Trova l'evento corrispondente
    let evento = null;
    for (const [key, value] of Object.entries(CONFIG.BRANCALONIA.rischiMestiere.tabella)) {
      if (risultato >= value.min && risultato <= value.max) {
        evento = value;
        break;
      }
    }

    // Se nessun evento trovato e risultato > 98, usa l'editto
    if (!evento && risultato > 98) {
      evento = CONFIG.BRANCALONIA.rischiMestiere.tabella[23];
    }

    return {
      roll,
      risultato,
      evento,
      nomeaMax,
      bonusNomeaTotale,
      modificatore: modTotale
    };
  }

  /**
   * Gestisce l'evento dei Rischi del Mestiere
   */
  async gestisciEvento(evento, cricca) {
    let contenutoChat = `<div class="brancalonia-rischi">
      <h3>⚠️ Rischi del Mestiere</h3>
      <p><strong>${evento.evento}</strong></p>`;

    // Aggiungi dettagli specifici per tipo di evento
    switch (evento.tipo) {
      case "birri":
        if (evento.numero) {
          const roll = new Roll(evento.numero);
          roll.evaluate({ async: false });
          contenutoChat += `<p>Numero di birri: ${roll.total}</p>`;
        }
        if (evento.capobirro) {
          contenutoChat += `<p>Presente anche un Capobirro!</p>`;
        }
        contenutoChat += `<p><em>Il Condottiero può gestire questo incontro come meglio crede.</em></p>`;
        break;

      case "cacciatori":
        if (evento.numero) {
          contenutoChat += `<p>Numero di cacciatori: ${evento.numero}</p>`;
        }
        if (evento.cavaliere) {
          contenutoChat += `<p>Un cavaliere errante con ideali nobili!</p>`;
        }
        break;

      case "ricatto":
        contenutoChat += `<p><em>La Cricca dovrà decidere se cedere al ricatto o affrontare le conseguenze.</em></p>`;
        break;

      case "tradimento":
        if (evento.interno) {
          contenutoChat += `<p><em>Il Condottiero sceglie quale membro della banda tradisce.</em></p>`;
        }
        if (evento.covo) {
          contenutoChat += `<p>⚠️ Il Covo è stato compromesso!</p>`;
        }
        break;

      case "magia":
        if (evento.turchini) {
          contenutoChat += `<p><em>Maledizione dei Turchini: orecchie d'asino per tutti!</em></p>`;
        }
        if (evento.befana) {
          contenutoChat += `<p><em>Il capobanda è sotto incantesimo d'amore!</em></p>`;
        }
        break;

      case "editto":
        contenutoChat += `<p>💰 Taglia supplementare: +${evento.tagliaExtra} gransoldi su ogni membro!</p>`;
        // Applica automaticamente la taglia extra
        for (const membro of cricca) {
          const tagliaAttuale = membro.actor.getFlag("brancalonia-bigat", "taglia") || 0;
          await membro.actor.setFlag("brancalonia-bigat", "taglia", tagliaAttuale + evento.tagliaExtra);
        }
        break;

      case "opportunita":
        contenutoChat += `<p><em>Un'opportunità rischiosa si presenta...</em></p>`;
        break;

      case "rivalita":
        if (evento.covo) {
          contenutoChat += `<p>⚠️ Una banda rivale vuole il vostro Covo!</p>`;
        }
        contenutoChat += `<p><em>Conflitto con un'altra banda!</em></p>`;
        break;

      case "vendetta":
        if (evento.confinato) {
          contenutoChat += `<p><em>Un Confinato cerca vendetta per torti passati!</em></p>`;
        }
        break;

      case "infernale":
        contenutoChat += `<p><em>Un Malacoda è interessato alle anime della Cricca!</em></p>`;
        break;

      default:
        contenutoChat += `<p><em>Questa volta ve la siete cavata!</em></p>`;
    }

    contenutoChat += `</div>`;

    ChatMessage.create({
      content: contenutoChat,
      speaker: { alias: "Rischi del Mestiere" }
    });
  }

  /**
   * Applica settimane di Imbosco durante lo Sbraco
   */
  async applicaImbosco(settimane) {
    const imboscoAttuale = game.settings.get("brancalonia-bigat", "settimaneImbosco") || 0;
    const nuovoImbosco = imboscoAttuale + settimane;

    await game.settings.set("brancalonia-bigat", "settimaneImbosco", nuovoImbosco);

    ChatMessage.create({
      content: `<div class="brancalonia-imbosco">
        <h3>🌲 Imbosco durante lo Sbraco</h3>
        <p>La Cricca si è imboscata per <strong>${settimane} settimane</strong>.</p>
        <p>Modificatore totale ai Rischi del Mestiere: <strong>-${nuovoImbosco * 3}</strong></p>
      </div>`
    });
  }

  /**
   * Resetta l'imbosco dopo un lavoretto
   */
  async resetImbosco() {
    await game.settings.set("brancalonia-bigat", "settimaneImbosco", 0);
  }

  registerHooks() {
    // Aggiungi impostazioni
    Hooks.once("init", () => {
      game.settings.register("brancalonia", "settimaneImbosco", {
        scope: "world",
        config: false,
        type: Number,
        default: 0
      });
    });

    // Aggiungi controlli al GM
    Hooks.on("renderSidebarTab", (app, html) => {
      if (app.tabName !== "chat" || !game.user.isGM) return;

      const button = `
        <div class="brancalonia-rischi-controls">
          <button class="tira-rischi-mestiere">
            <i class="fas fa-dice"></i> Tira Rischi del Mestiere
          </button>
          <button class="gestisci-imbosco">
            <i class="fas fa-tree"></i> Imbosco
          </button>
        </div>
      `;

      html.append(button);

      html.find(".tira-rischi-mestiere").click(() => this.mostraDialogoRischi());
      html.find(".gestisci-imbosco").click(() => this.mostraDialogoImbosco());
    });
  }

  /**
   * Mostra dialogo per tirare i Rischi del Mestiere
   */
  async mostraDialogoRischi() {
    // Ottieni tutti i personaggi giocanti
    const cricca = game.actors.filter(a => a.type === "character" && a.hasPlayerOwner);

    if (cricca.length === 0) {
      ui.notifications.warn("Nessun personaggio nella Cricca!");
      return;
    }

    // Calcola preview del modificatore
    let nomeaMax = 0;
    let bonusNomeaTotale = 0;

    for (const membro of cricca) {
      const nomea = membro.getFlag("brancalonia", "nomea") || 0;
      nomeaMax = Math.max(nomeaMax, nomea);
      bonusNomeaTotale += Math.floor(nomea / 10);
    }

    const imbosco = game.settings.get("brancalonia-bigat", "settimaneImbosco") || 0;

    const content = `
      <div class="rischi-mestiere-dialog">
        <h3>Cricca Attuale</h3>
        <ul>
          ${cricca.map(m => {
            const nomea = m.getFlag("brancalonia", "nomea") || 0;
            return `<li>${m.name} (Nomea: ${nomea})</li>`;
          }).join('')}
        </ul>

        <h3>Modificatori</h3>
        <ul>
          <li>Nomea più alta: +${nomeaMax}</li>
          <li>Bonus Nomea totale: +${bonusNomeaTotale}</li>
          <li>Settimane Imbosco: -${imbosco * 3}</li>
        </ul>

        <div class="form-group">
          <label>Modificatore Aggiuntivo:</label>
          <input type="number" name="modExtra" value="0"/>
        </div>
      </div>
    `;

    new Dialog({
      title: "Rischi del Mestiere",
      content,
      buttons: {
        roll: {
          label: "Tira!",
          callback: async (html) => {
            const modExtra = parseInt(html.find('[name="modExtra"]').val()) || 0;

            const risultato = this.tiraRischiMestiere(
              cricca.map(a => ({ actor: a })),
              modExtra
            );

            // Mostra il risultato
            ChatMessage.create({
              content: `<div class="brancalonia-rischi">
                <h3>🎲 Rischi del Mestiere</h3>
                <p><strong>Tiro:</strong> ${risultato.roll.formula} = ${risultato.risultato}</p>
                <p>Nomea Max: ${risultato.nomeaMax}, Bonus Totale: ${risultato.bonusNomeaTotale}</p>
                <p>Modificatore Totale: ${risultato.modificatore}</p>
              </div>`,
              rolls: [risultato.roll]
            });

            // Gestisci l'evento
            if (risultato.evento) {
              await this.gestisciEvento(risultato.evento, cricca.map(a => ({ actor: a })));
            }

            // Resetta l'imbosco dopo il tiro
            await this.resetImbosco();
          }
        }
      }
    }).render(true);
  }

  /**
   * Mostra dialogo per gestire l'Imbosco
   */
  async mostraDialogoImbosco() {
    const imboscoAttuale = game.settings.get("brancalonia-bigat", "settimaneImbosco") || 0;

    const content = `
      <div class="imbosco-dialog">
        <p>Settimane di Imbosco attuali: <strong>${imboscoAttuale}</strong></p>
        <p>Modificatore attuale: <strong>-${imboscoAttuale * 3}</strong></p>

        <div class="form-group">
          <label>Aggiungi Settimane di Imbosco:</label>
          <input type="number" name="settimane" value="1" min="0"/>
        </div>
      </div>
    `;

    new Dialog({
      title: "Imbosco durante lo Sbraco",
      content,
      buttons: {
        add: {
          label: "Aggiungi",
          callback: async (html) => {
            const settimane = parseInt(html.find('[name="settimane"]').val()) || 0;
            if (settimane > 0) {
              await this.applicaImbosco(settimane);
            }
          }
        },
        reset: {
          label: "Resetta",
          callback: async () => {
            await this.resetImbosco();
            ui.notifications.info("Imbosco resettato!");
          }
        }
      }
    }).render(true);
  }
}

// Inizializza il sistema
Hooks.once("ready", () => {
  // NON sovrascrivere game.brancalonia, solo aggiungere rischiMestiere
  if (!game.brancalonia) {
    console.error("Brancalonia | game.brancalonia non trovato!");
    return;
  }
  game.brancalonia.rischiMestiere = new BrancaloniaRischiMestiere();
  console.log("Brancalonia | Sistema Rischi del Mestiere inizializzato");
});