/**
 * Sistema Rischi del Mestiere
 * Basato sul manuale di Brancalonia (pag. 49-52)
 */

class BrancaloniaRischiMestiere {
  static initialize() {
    try {
      console.log("⚠️ Brancalonia | Inizializzazione Sistema Rischi del Mestiere");

      // Registra le impostazioni
      this._registerSettings();

      // Setup dei rischi
      this._setupRischi();

      // Registra gli hook
      this._registerHooks();

      // Registra comandi chat
      this._registerChatCommands();

      // Crea macro automatiche
      this._createAutomaticMacros();

      // Registra l'istanza globale
      game.brancalonia = game.brancalonia || {};
      game.brancalonia.rischiMestiere = this;

      ui.notifications.info("Sistema Rischi del Mestiere caricato con successo!");

    } catch (error) {
      console.error("Errore nell'inizializzazione Sistema Rischi del Mestiere:", error);
      ui.notifications.error("Errore nel caricamento del sistema rischi!");
    }
  }

  static _registerSettings() {
    try {
      // Abilita/disabilita sistema rischi
      game.settings.register('brancalonia-bigat', 'enableRischiMestiere', {
        name: 'Abilita Rischi del Mestiere',
        hint: 'Attiva il sistema completo dei Rischi del Mestiere per le Cricche',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
          if (value) {
            ui.notifications.info("Sistema Rischi del Mestiere attivato!");
          } else {
            ui.notifications.warn("Sistema Rischi del Mestiere disattivato!");
          }
        }
      });

      // Settimane di imbosco
      game.settings.register('brancalonia-bigat', 'settimaneImbosco', {
        name: 'Settimane di Imbosco',
        hint: 'Numero di settimane che la Cricca ha passato imboscata',
        scope: 'world',
        config: false,
        type: Number,
        default: 0
      });

      // Auto-applicazione effetti
      game.settings.register('brancalonia-bigat', 'autoApplyRischiEffects', {
        name: 'Auto-Applicazione Effetti Rischi',
        hint: 'Applica automaticamente gli effetti dei Rischi del Mestiere',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      // Debug mode
      game.settings.register('brancalonia-bigat', 'debugRischiMestiere', {
        name: 'Debug Rischi del Mestiere',
        hint: 'Attiva log dettagliati per il debug del sistema rischi',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
      });

    } catch (error) {
      console.error("Errore nella registrazione delle impostazioni rischi:", error);
    }
  }

  static _setupRischi() {
    try {
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

      if (game.settings.get('brancalonia-bigat', 'debugRischiMestiere')) {
        console.log("Tabella Rischi del Mestiere configurata:", CONFIG.BRANCALONIA.rischiMestiere);
      }

    } catch (error) {
      console.error("Errore nel setup dei rischi:", error);
    }
  }

  static _registerChatCommands() {
    try {
      // Comando principale
      game.brancalonia.chatCommands = game.brancalonia.chatCommands || {};

      game.brancalonia.chatCommands['/rischi'] = {
        callback: this._handleRischiCommand.bind(this),
        description: "Gestisce i Rischi del Mestiere"
      };

      game.brancalonia.chatCommands['/imbosco'] = {
        callback: this._handleImboscoCommand.bind(this),
        description: "Gestisce l'Imbosco della Cricca"
      };

      game.brancalonia.chatCommands['/rischihelp'] = {
        callback: this._showRischiHelp.bind(this),
        description: "Mostra l'aiuto per i comandi rischi"
      };

      // Hook per intercettare i comandi chat
      Hooks.on("chatMessage", (chatLog, message, chatData) => {
        const command = message.split(' ')[0].toLowerCase();

        if (game.brancalonia.chatCommands[command]) {
          game.brancalonia.chatCommands[command].callback(message, chatData);
          return false; // Previene il messaggio normale
        }

        return true;
      });

    } catch (error) {
      console.error("Errore nella registrazione comandi chat rischi:", error);
    }
  }

  static _createAutomaticMacros() {
    try {
      const macros = [
        {
          name: "Rischi del Mestiere",
          type: "script",
          command: [
            "if (!game.brancalonia?.rischiMestiere) {",
            "  ui.notifications.error('Sistema rischi non disponibile!');",
            "  return;",
            "}",
            "",
            "game.brancalonia.rischiMestiere.mostraDialogoRischi();"
          ].join('\n'),
          img: "icons/skills/trades/mining-pickaxe-iron-grey.webp"
        },
        {
          name: "Gestisci Imbosco",
          type: "script",
          command: [
            "if (!game.brancalonia?.rischiMestiere) {",
            "  ui.notifications.error('Sistema rischi non disponibile!');",
            "  return;",
            "}",
            "",
            "game.brancalonia.rischiMestiere.mostraDialogoImbosco();"
          ].join('\n'),
          img: "icons/environment/wilderness/tree-spruce.webp"
        },
        {
          name: "Tira Rischi Veloce",
          type: "script",
          command: [
            "if (!game.brancalonia?.rischiMestiere) {",
            "  ui.notifications.error('Sistema rischi non disponibile!');",
            "  return;",
            "}",
            "",
            "const cricca = game.actors.filter(a => a.type === 'character' && a.hasPlayerOwner);",
            "if (cricca.length === 0) {",
            "  ui.notifications.warn('Nessun personaggio nella Cricca!');",
            "  return;",
            "}",
            "",
            "game.brancalonia.rischiMestiere.tiraRischiVeloce(cricca.map(a => ({actor: a})));"
          ].join('\n'),
          img: "icons/skills/trades/mining-ore-cart-yellow.webp"
        }
      ];

      macros.forEach(async macroData => {
        const existingMacro = game.macros.find(m => m.name === macroData.name);
        if (!existingMacro) {
          await game.macros.documentClass.create(macroData);
          if (game.settings.get('brancalonia-bigat', 'debugRischiMestiere')) {
            console.log(`Macro '${macroData.name}' creata automaticamente`);
          }
        }
      });

    } catch (error) {
      console.error("Errore nella creazione macro rischi:", error);
    }
  }

  /**
   * Tira i Rischi del Mestiere per la Cricca
   */
  static async tiraRischiMestiere(cricca, modificatore = 0) {
    try {
      if (!game.settings.get('brancalonia-bigat', 'enableRischiMestiere')) {
        ui.notifications.warn("Sistema Rischi del Mestiere disabilitato!");
        return null;
      }
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
      await roll.evaluate();

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

      if (game.settings.get('brancalonia-bigat', 'debugRischiMestiere')) {
        console.log("Risultato Rischi del Mestiere:", {
          risultato,
          evento,
          modificatore: modTotale
        });
      }

      return {
        roll,
        risultato,
        evento,
        nomeaMax,
        bonusNomeaTotale,
        modificatore: modTotale
      };

    } catch (error) {
      console.error("Errore nel tiro Rischi del Mestiere:", error);
      ui.notifications.error("Errore nel calcolo dei rischi!");
      return null;
    }
  }

  /**
   * Gestisce l'evento dei Rischi del Mestiere
   */
  static async gestisciEvento(evento, cricca) {
    try {
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

    } catch (error) {
      console.error("Errore nella gestione evento rischi:", error);
      ui.notifications.error("Errore nella gestione dell'evento!");
    }
  }

  static _handleRischiCommand(message, chatData) {
    try {
      const args = message.split(' ');
      const subcommand = args[1]?.toLowerCase();

      switch (subcommand) {
        case 'tira':
        case 'roll':
          this.mostraDialogoRischi();
          break;
        case 'veloce':
        case 'quick':
          this._tiraRischiVeloce();
          break;
        case 'tabella':
        case 'table':
          this._mostraTabella();
          break;
        default:
          this._showRischiHelp();
      }
    } catch (error) {
      console.error("Errore nel comando rischi:", error);
      ui.notifications.error("Errore nell'esecuzione del comando!");
    }
  }

  static _handleImboscoCommand(message, chatData) {
    try {
      const args = message.split(' ');
      const settimane = parseInt(args[1]) || 1;

      if (settimane > 0) {
        this.applicaImbosco(settimane);
      } else {
        this.mostraDialogoImbosco();
      }
    } catch (error) {
      console.error("Errore nel comando imbosco:", error);
      ui.notifications.error("Errore nell'esecuzione del comando!");
    }
  }

  static _showRischiHelp() {
    const helpContent = `
      <div class="brancalonia-help">
        <h2>⚠️ Comandi Rischi del Mestiere</h2>
        <h3>Comandi disponibili:</h3>
        <ul>
          <li><strong>/rischi tira</strong> - Apre il dialogo per tirare i Rischi del Mestiere</li>
          <li><strong>/rischi veloce</strong> - Tira velocemente con la Cricca attuale</li>
          <li><strong>/rischi tabella</strong> - Mostra la tabella completa dei rischi</li>
          <li><strong>/imbosco [settimane]</strong> - Aggiunge settimane di imbosco o apre il dialogo</li>
          <li><strong>/rischihelp</strong> - Mostra questo aiuto</li>
        </ul>
        <h3>Come funziona:</h3>
        <ul>
          <li>Il sistema calcola automaticamente i modificatori basati su Nomea e Imbosco</li>
          <li>Ogni settimana di Imbosco dà -3 al tiro (meglio evitare i rischi)</li>
          <li>La Nomea più alta e la somma dei bonus aumentano i rischi</li>
          <li>Gli eventi vengono applicati automaticamente quando possibile</li>
        </ul>
      </div>
    `;

    ChatMessage.create({
      content: helpContent,
      whisper: [game.user.id]
    });
  }

  static _mostraTabella() {
    let content = `
      <div class="rischi-tabella">
        <h2>⚠️ Tabella Rischi del Mestiere</h2>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Risultato</th>
              <th>Evento</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
    `;

    for (const [key, rischio] of Object.entries(CONFIG.BRANCALONIA.rischiMestiere.tabella)) {
      content += `
        <tr>
          <td>${rischio.min === rischio.max ? rischio.min : `${rischio.min}-${rischio.max}`}</td>
          <td style="font-size: 0.8em;">${rischio.evento}</td>
          <td><span class="badge">${rischio.tipo}</span></td>
        </tr>
      `;
    }

    content += `
          </tbody>
        </table>
      </div>
    `;

    ChatMessage.create({
      content: content,
      whisper: [game.user.id]
    });
  }

  static async _tiraRischiVeloce() {
    try {
      const cricca = game.actors.filter(a => a.type === "character" && a.hasPlayerOwner);
      if (cricca.length === 0) {
        ui.notifications.warn("Nessun personaggio nella Cricca!");
        return;
      }

      const risultato = await this.tiraRischiMestiere(cricca.map(a => ({actor: a})), 0);

      if (risultato) {
        // Mostra il risultato
        ChatMessage.create({
          content: `<div class="brancalonia-rischi">
            <h3>🎲 Rischi del Mestiere - Tiro Veloce</h3>
            <p><strong>Tiro:</strong> ${risultato.roll.formula} = ${risultato.risultato}</p>
          </div>`,
          rolls: [risultato.roll]
        });

        // Gestisci l'evento
        if (risultato.evento) {
          await this.gestisciEvento(risultato.evento, cricca.map(a => ({actor: a})));
        }

        // Resetta l'imbosco
        await this.resetImbosco();
      }

    } catch (error) {
      console.error("Errore nel tiro veloce rischi:", error);
      ui.notifications.error("Errore nel tiro veloce!");
    }
  }

  /**
   * Applica settimane di Imbosco durante lo Sbraco
   */
  static async applicaImbosco(settimane) {
    try {
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

      if (game.settings.get('brancalonia-bigat', 'debugRischiMestiere')) {
        console.log(`Imbosco aggiornato: ${nuovoImbosco} settimane`);
      }

    } catch (error) {
      console.error("Errore nell'applicazione imbosco:", error);
      ui.notifications.error("Errore nell'applicazione dell'imbosco!");
    }
  }

  /**
   * Resetta l'imbosco dopo un lavoretto
   */
  static async resetImbosco() {
    try {
      await game.settings.set("brancalonia-bigat", "settimaneImbosco", 0);
      if (game.settings.get('brancalonia-bigat', 'debugRischiMestiere')) {
        console.log("Imbosco resettato");
      }
    } catch (error) {
      console.error("Errore nel reset imbosco:", error);
    }
  }

  static _registerHooks() {
    try {
      // Aggiungi controlli al GM
      Hooks.on("renderSidebarTab", (app, html) => {
        if (app.tabName !== "chat" || !game.user.isGM || !game.settings.get('brancalonia-bigat', 'enableRischiMestiere')) return;

        const button = `
          <div class="brancalonia-rischi-controls" style="margin: 5px 0;">
            <button class="tira-rischi-mestiere" style="width: 100%; margin: 2px 0; padding: 5px; font-size: 0.8em;">
              <i class="fas fa-dice"></i> Tira Rischi del Mestiere
            </button>
            <button class="gestisci-imbosco" style="width: 100%; margin: 2px 0; padding: 5px; font-size: 0.8em;">
              <i class="fas fa-tree"></i> Imbosco
            </button>
          </div>
        `;

        html.append(button);

        html.find(".tira-rischi-mestiere").click(() => this.mostraDialogoRischi());
        html.find(".gestisci-imbosco").click(() => this.mostraDialogoImbosco());
      });

      // Hook per fine riposo lungo - potenziale trigger rischi
      Hooks.on("dnd5e.longRest", (actor, data) => {
        if (game.settings.get('brancalonia-bigat', 'enableRischiMestiere') && game.user.isGM) {
          ui.notifications.info("Considera di tirare i Rischi del Mestiere dopo il riposo!");
        }
      });

    } catch (error) {
      console.error("Errore nella registrazione degli hook rischi:", error);
    }
  }

  /**
   * Mostra dialogo per tirare i Rischi del Mestiere
   */
  static async mostraDialogoRischi() {
    try {
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
      const nomea = membro.getFlag("brancalonia-bigat", "nomea") || 0;
      nomeaMax = Math.max(nomeaMax, nomea);
      bonusNomeaTotale += Math.floor(nomea / 10);
    }

    const imbosco = game.settings.get("brancalonia-bigat", "settimaneImbosco") || 0;

    const content = `
      <div class="rischi-mestiere-dialog">
        <h3>Cricca Attuale</h3>
        <ul>
          ${cricca.map(m => {
            const nomea = m.getFlag("brancalonia-bigat", "nomea") || 0;
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

            const risultato = await this.tiraRischiMestiere(
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
        },
        cancel: {
          label: "Annulla"
        }
      }
    }).render(true);

    } catch (error) {
      console.error("Errore nel dialogo rischi:", error);
      ui.notifications.error("Errore nell'apertura del dialogo!");
    }
  }

  /**
   * Mostra dialogo per gestire l'Imbosco
   */
  static async mostraDialogoImbosco() {
    try {
      const imboscoAttuale = game.settings.get("brancalonia-bigat", "settimaneImbosco") || 0;

      const content = `
        <div class="imbosco-dialog">
          <p>Settimane di Imbosco attuali: <strong>${imboscoAttuale}</strong></p>
          <p>Modificatore attuale: <strong>-${imboscoAttuale * 3}</strong></p>
          <hr>
          <p><em>L'Imbosco rappresenta il tempo che la Cricca passa nascosta, riducendo i rischi ma limitando le attività.</em></p>

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

    } catch (error) {
      console.error("Errore nel dialogo imbosco:", error);
      ui.notifications.error("Errore nell'apertura del dialogo!");
    }
  }
}

// Inizializza il sistema
Hooks.once("init", () => {
  try {
    BrancaloniaRischiMestiere.initialize();
  } catch (error) {
    console.error("Errore critico nell'inizializzazione BrancaloniaRischiMestiere:", error);
    ui.notifications.error("Errore nel caricamento del sistema rischi del mestiere!");
  }
});

// Rendi disponibile globalmente
window.BrancaloniaRischiMestiere = BrancaloniaRischiMestiere;

// Esporta la classe per uso come modulo
export { BrancaloniaRischiMestiere };