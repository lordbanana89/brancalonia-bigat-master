export class BagordiSystem {
  constructor() {
    this.name = "Sistema Bagordi di Brancalonia";
    this.description = "Sistema per gestire i bagordi durante lo Sbraco";
  }

  /**
   * Inizia una sessione di bagordi
   * @param {Actor} actor - Il personaggio che si dà ai bagordi
   * @param {string} location - Tipo di luogo (villaggio/cittadina/città)
   * @param {number} goldSpent - Oro speso nei bagordi
   */
  async startBagordi(actor, location = "cittadina", goldSpent = 0) {
    const locationLimits = {
      villaggio: { min: 5, max: 10 },
      cittadina: { min: 10, max: 20 },
      città: { min: 20, max: 50 }
    };

    const limits = locationLimits[location] || locationLimits.cittadina;

    if (goldSpent < limits.min || goldSpent > limits.max) {
      ui.notifications.warn(`In ${location} puoi dilapidare tra ${limits.min} e ${limits.max} mo a settimana`);
      return;
    }

    const roll = await new Roll("1d20").evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor: actor}),
      flavor: `<h2>Bagordi in ${location}</h2><p>${actor.name} dilapida ${goldSpent} mo in bagordi!</p>`
    });

    const result = this.getBagordiResult(roll.total, goldSpent);
    await this.applyBagordiResult(actor, result, goldSpent);
  }

  /**
   * Ottiene il risultato dei bagordi dalla tabella
   */
  getBagordiResult(roll, goldSpent) {
    const results = [
      {
        roll: 1,
        title: "Buttate fuori questo sacco di letame!",
        description: "Ti hanno completamente derubato e spogliato di qualsiasi cosa possedessi, abbandonandoti in un fetido rigagnolo. Inoltre, i birri ti trascinano via nel pubblico ludibrio e ti gettano in gattabuia.",
        effect: "Perdi tutti gli oggetti comuni e i Cimeli. Usi un Favore per uscire di galera.",
        severe: true
      },
      {
        roll: 2,
        title: "Mamma! C'è qualcuno nudo nella stalla!",
        description: "Ti hanno completamente derubato e spogliato di qualsiasi cosa possedessi. Lo so, non è una bella situazione, ma poteva andare peggio...",
        effect: "Perdi tutti gli oggetti comuni e i Cimeli.",
        severe: true
      },
      {
        roll: 3,
        title: "Certo! Solo il tempo di prendere il borsello...",
        description: "Qualcuno ti ha tagliato via la borsa, con tutto quello che c'era dentro.",
        effect: "Perdi tutto l'oro che avevi con te."
      },
      {
        roll: 4,
        title: "Senti come puzza questa feccia!",
        description: "Ti fai una pessima fama nei dintorni, di molesto ubriacone, donnaiolo e compagnia disonorevole.",
        effect: "+5 al prossimo tiro Rischi del Mestiere"
      },
      {
        roll: 5,
        title: "Chiedo scusa, non volevo versargliela addosso.",
        description: "Hai scatenato la rissa più spaventosa che si fosse vista in città negli ultimi anni. Tu, i tuoi sconosciuti avversari e i tuoi ancora più sconosciuti alleati avete letteralmente distrutto una Bettola.",
        effect: `Paga altri ${goldSpent} mo o ricevi malefatta Sfascio di Bettole Aggravato (30 mo)`
      },
      {
        roll: 6,
        title: "Tutto sul mio conto!",
        description: "La situazione ti è sfuggita di mano e sei riuscito a dilapidare in una sola notte il doppio del previsto.",
        effect: `Paga altri ${goldSpent} mo o ricevi malefatta Insolvenza per il debito`
      },
      {
        roll: 7,
        title: "Secondino! Ancora un po' di quella sbobba, di grazia.",
        description: "I tuoi schiamazzi notturni hanno attirato le guardie. Tu e quelle canaglie con cui stavi cantando sguaiatamente 'L'uccellin della comare' siete finiti in galera.",
        effect: "Paga 2 mo o rimani in prigione 3 giorni (rivela la tua Taglia)"
      },
      {
        roll: 8,
        title: "Un'offerta che non puoi rifiutare.",
        description: "Un pericoloso malvivente del luogo ti ha seguito tutta la notte, coprendo i tuoi debiti e offrendosi di pagare per te.",
        effect: "Recuperi l'oro speso ma hai un debito con un criminale"
      },
      {
        roll: 9,
        title: "Ehi tu, porco, levale le mani di dosso!",
        description: "Quella che sembrava una laida donnaccia, si rivela essere la sussiegosa moglie di un funzionario del Duca-Conte, che non gradisce le tue attenzioni verso la consorte.",
        effect: "+2 a tutti i prossimi tiri Rischi del Mestiere"
      },
      {
        roll: 10,
        title: "Amore! La colazione è pronta!",
        description: "Al mattino scopri di avere sposato una persona del posto e a quanto pare l'unione risulta confermata dal Credo.",
        effect: "Sei sposato! (Abbandonare è una malefatta)"
      },
      {
        roll: 11,
        title: "Come osi, vile marrano?",
        description: "Mai litigare da ubriachi. Prima di poterti dedicare al prossimo lavoretto, ti aspetta un duello al primo sangue con il figlio del Conestabile.",
        effect: "Duello imminente (meglio perdere senza clamore)"
      },
      {
        roll: 12,
        title: "Questo posto è un vero mortorio!",
        description: "Nonostante le tue pessime intenzioni, vanno tutti a letto presto e nessuno ti dà retta.",
        effect: "Dilapidi solo metà della cifra prevista",
        positive: true
      },
      {
        roll: 13,
        title: "Tu, tu, tu e tu... e anche tu!",
        description: "È stata la notte brava più devastante della tua vita. Tutto come da programma. Complimenti!",
        effect: "+1 Nomea per il prossimo lavoretto",
        positive: true
      },
      {
        roll: 14,
        title: "E questo che diavolo è?",
        description: "Ti ritrovi in tasca l'atto di proprietà di una cosa chiamata 'Vecchia Babbiona'. Per quello che ne sai, potrebbe essere una vacca, un ronzino, la mappa di un tesoro, una magione fuori città o quella bagnarola a vela ancorata al porto.",
        effect: "Ottieni un atto di proprietà misterioso o 1 Cimelio",
        positive: true
      },
      {
        roll: 15,
        title: "Che cosa hai detto di voler essere, tu?",
        description: "Un giovane non proprio in gamba ha deciso di diventare tuo tirapiedi, per imparare da te i segreti del mestiere.",
        effect: "Ottieni un tirapiedi inesperto"
      },
      {
        roll: 16,
        title: "Volpe vecchia!",
        description: "Al termine dei tuoi bagordi, ti sei trovato con più denaro di quello con cui eri partito. Fortuna del principiante o abilità del baro?",
        effect: "Guadagni 1d6 mo extra",
        positive: true
      },
      {
        roll: 17,
        title: "C'è nessuno? Voglio scendere!",
        description: "Ti risvegli in cima al campanile della città, nudo e con un terribile mal di testa. Come diavolo hai fatto a salire fin lassù?",
        effect: "Inizio imbarazzante ma nessuna conseguenza grave"
      },
      {
        roll: 18,
        title: "Che nottata memorabile!",
        description: "Le tue gesta di questa notte verranno ricordate per generazioni. Hai fatto amicizia con mezza città.",
        effect: "Vantaggio alle prove Carisma in città per 1 settimana",
        positive: true
      },
      {
        roll: 19,
        title: "Il Re della Notte!",
        description: "Sei diventato una leggenda vivente. Le tue imprese di stanotte verranno cantate dai menestrelli.",
        effect: "+2 Nomea permanente in questa città",
        positive: true
      },
      {
        roll: 20,
        title: "Fortuna sfacciata!",
        description: "Non solo hai vissuto la notte più incredibile della tua vita, ma hai anche vinto grosse somme al gioco!",
        effect: "Raddoppi l'oro speso (lo recuperi x2)",
        positive: true
      }
    ];

    return results.find(r => r.roll === roll) || results[0];
  }

  /**
   * Applica gli effetti del risultato dei bagordi
   */
  async applyBagordiResult(actor, result, goldSpent) {
    let content = `
      <div class="bagordi-result">
        <h3>${result.title}</h3>
        <p><i>${result.description}</i></p>
        <hr>
        <p><strong>Effetto:</strong> ${result.effect}</p>
      </div>
    `;

    const chatData = {
      speaker: ChatMessage.getSpeaker({actor: actor}),
      content: content,
      flags: {
        brancalonia: {
          bagordiResult: true,
          severe: result.severe || false,
          positive: result.positive || false
        }
      }
    };

    if (result.severe) {
      chatData.flavor = `<span style="color: darkred; font-weight: bold;">Disastro!</span>`;
    } else if (result.positive) {
      chatData.flavor = `<span style="color: green; font-weight: bold;">Fortuna!</span>`;
    }

    await ChatMessage.create(chatData);

    // Applica effetti automatici dove possibile
    if (result.roll === 12) {
      // Restituisce metà dell'oro
      const refund = Math.floor(goldSpent / 2);
      await actor.update({
        "system.currency.du": actor.system.currency.du + refund
      });
      ui.notifications.info(`${actor.name} recupera ${refund} mo`);
    } else if (result.roll === 16) {
      // Guadagna 1d6 mo extra
      const extraGold = await new Roll("1d6").evaluate();
      await actor.update({
        "system.currency.du": actor.system.currency.du + extraGold.total
      });
      ui.notifications.info(`${actor.name} guadagna ${extraGold.total} mo extra!`);
    } else if (result.roll === 20) {
      // Raddoppia l'oro speso
      await actor.update({
        "system.currency.du": actor.system.currency.du + (goldSpent * 2)
      });
      ui.notifications.info(`${actor.name} vince ${goldSpent * 2} mo al gioco!`);
    }

    // Registra l'evento nei flag del personaggio
    const bagordiHistory = actor.getFlag("brancalonia-bigat", "bagordiHistory") || [];
    bagordiHistory.push({
      date: new Date().toISOString(),
      result: result.title,
      goldSpent: goldSpent,
      roll: result.roll
    });
    await actor.setFlag("brancalonia-bigat", "bagordiHistory", bagordiHistory);
  }

  /**
   * Crea un dialog per iniziare i bagordi
   */
  async showBagordiDialog(actor) {
    const content = `
      <form>
        <div class="form-group">
          <label>Luogo dei Bagordi</label>
          <select name="location" id="location">
            <option value="villaggio">Villaggio (5-10 mo)</option>
            <option value="cittadina" selected>Cittadina (10-20 mo)</option>
            <option value="città">Città Maggiore (20-50 mo)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Oro da Dilapidare (mo)</label>
          <input type="number" name="gold" id="gold" value="15" min="5" max="50">
        </div>
        <p><i>Ricorda: Una settimana di Sbraco spesa in bagordi!</i></p>
      </form>
    `;

    new Dialog({
      title: "Darsi ai Bagordi",
      content: content,
      buttons: {
        bagordi: {
          icon: '<i class="fas fa-wine-bottle"></i>',
          label: "Ai Bagordi!",
          callback: async (html) => {
            const location = html.find("#location").val();
            const gold = parseInt(html.find("#gold").val());

            if (actor.system.currency.du < gold) {
              ui.notifications.error("Non hai abbastanza oro!");
              return;
            }

            // Sottrai l'oro
            await actor.update({
              "system.currency.du": actor.system.currency.du - gold
            });

            // Inizia i bagordi
            await this.startBagordi(actor, location, gold);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Annulla"
        }
      },
      default: "bagordi"
    }).render(true);
  }
}

// Hook per aggiungere il sistema ai personaggi
Hooks.on("renderActorSheetV2", (app, html, data) => {
  if (app.actor.type !== "character") return;

  // Converti html in jQuery object per Foundry v13
  const $html = $(html);

  const bagordiBtn = $(`<a class="bagordi-btn" title="Darsi ai Bagordi"><i class="fas fa-wine-bottle"></i> Bagordi</a>`);
  $html.find(".window-header .window-title").after(bagordiBtn);

  bagordiBtn.click(async (ev) => {
    ev.preventDefault();
    const bagordi = new BagordiSystem();
    await bagordi.showBagordiDialog(app.actor);
  });
});

// Registra il sistema globalmente
game.brancalonia = game.brancalonia || {};
game.brancalonia.bagordi = new BagordiSystem();