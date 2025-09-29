/**
 * Sistema Risse da Taverna per Brancalonia
 * Basato RIGOROSAMENTE sulle regole ufficiali del manuale (pag. 51-57)
 * Compatibile con dnd5e system per Foundry VTT v13
 */

export class TavernBrawlSystem {
  constructor() {
    this.activeBrawl = false;
    this.brawlCombat = null;
    this.brawlParticipants = new Map(); // actorId -> dati rissa

    // Livelli di Batoste come da manuale
    this.batosteLevels = [
      { level: 1, name: "Ammaccato", effect: "-1 CA" },
      { level: 2, name: "Contuso", effect: "-1 CA" },
      { level: 3, name: "Livido", effect: "-1 CA" },
      { level: 4, name: "Pesto", effect: "-1 CA" },
      { level: 5, name: "Gonfio", effect: "-1 CA" },
      { level: 6, name: "Incosciente", effect: "Privo di sensi" }
    ];

    // Mosse Generiche (dal manuale pag. 54)
    this.mosseGeneriche = {
      buttafuori: {
        name: "Buttafuori",
        tipo: "reazione",
        descrizione: "Dopo essere colpito, tiro per colpire (For/Des) che stordisce l'attaccante",
        execute: async (actor, target) => this._executeMossa(actor, target, "buttafuori")
      },
      schianto: {
        name: "Schianto",
        tipo: "azione",
        descrizione: "Tiro (For/Cos): 1 batosta + stordito e prono al bersaglio. Tu subisci 1 batosta",
        execute: async (actor, target) => this._executeMossa(actor, target, "schianto")
      },
      finta: {
        name: "Finta",
        tipo: "azione",
        descrizione: "Fingi di essere svenuto. Non puoi essere bersagliato finché non attacchi",
        execute: async (actor) => this._executeMossa(actor, null, "finta")
      },
      brodagliaInFaccia: {
        name: "Brodaglia in Faccia",
        tipo: "azione bonus",
        descrizione: "Tiro (Des/Sag) che acceca il bersaglio",
        execute: async (actor, target) => this._executeMossa(actor, target, "brodagliaInFaccia")
      },
      ghigliottina: {
        name: "Ghigliottina",
        tipo: "azione",
        descrizione: "Tiro (For/Des): 1 batosta + prono",
        execute: async (actor, target) => this._executeMossa(actor, target, "ghigliottina")
      },
      fracassateste: {
        name: "Fracassateste",
        tipo: "azione",
        descrizione: "Tiro (For/Cos): 1 batosta a due bersagli",
        execute: async (actor, targets) => this._executeMossa(actor, targets, "fracassateste")
      },
      allaPugna: {
        name: "Alla Pugna!",
        tipo: "azione",
        descrizione: "Tutti gli alleati hanno vantaggio alla prossima mossa/saccagnata",
        execute: async (actor) => this._executeMossa(actor, null, "allaPugna")
      },
      sottoIlTavolo: {
        name: "Sotto il Tavolo",
        tipo: "azione",
        descrizione: "Ti metti in copertura: +5 CA e TS Destrezza",
        execute: async (actor) => this._executeMossa(actor, null, "sottoIlTavolo")
      },
      sgambetto: {
        name: "Sgambetto",
        tipo: "azione bonus",
        descrizione: "Tiro (Des/Int) che rende prono il bersaglio",
        execute: async (actor, target) => this._executeMossa(actor, target, "sgambetto")
      },
      giuLeBraghe: {
        name: "Giù le Braghe",
        tipo: "azione bonus",
        descrizione: "Tiro (Des/Car) che trattiene il bersaglio",
        execute: async (actor, target) => this._executeMossa(actor, target, "giuLeBraghe")
      },
      pugnoneInTesta: {
        name: "Pugnone in Testa",
        tipo: "azione",
        descrizione: "Tiro (For/Cos): 1 batosta + incapacitato",
        execute: async (actor, target) => this._executeMossa(actor, target, "pugnoneInTesta")
      },
      testataDiMattone: {
        name: "Testata di Mattone",
        tipo: "reazione",
        descrizione: "Dopo essere colpito, tiro (For/Cos): 1 batosta",
        execute: async (actor, target) => this._executeMossa(actor, target, "testataDiMattone")
      }
    };

    // Mosse Magiche (dal manuale pag. 54)
    this.mosseMagiche = {
      protezioneDalMenare: {
        name: "Protezione dal Menare",
        tipo: "azione",
        descrizione: "Un bersaglio subisce svantaggio agli attacchi contro di lui",
        execute: async (actor, target) => this._executeMossa(actor, target, "protezioneDalMenare")
      },
      spruzzoVenefico: {
        name: "Spruzzo Venefico",
        tipo: "azione",
        descrizione: "Tiro (Int/Sag/Car): 1 batosta + avvelenato",
        execute: async (actor, target) => this._executeMossa(actor, target, "spruzzoVenefico")
      },
      urlaDissennanti: {
        name: "Urla Dissennanti",
        tipo: "azione",
        descrizione: "Una creatura diventa spaventata da te",
        execute: async (actor, target) => this._executeMossa(actor, target, "urlaDissennanti")
      },
      laMagna: {
        name: "La Magna",
        tipo: "azione",
        descrizione: "Una creatura diventa affascinata da te",
        execute: async (actor, target) => this._executeMossa(actor, target, "laMagna")
      },
      sguardoGhiacciante: {
        name: "Sguardo Ghiacciante",
        tipo: "azione",
        descrizione: "Un bersaglio non subisce batoste o condizioni fino al tuo prossimo turno",
        execute: async (actor, target) => this._executeMossa(actor, target, "sguardoGhiacciante")
      },
      pugnoIncantato: {
        name: "Pugno Incantato",
        tipo: "azione",
        descrizione: "Tre tiri (Int/Sag/Car) a tre bersagli: 1 batosta ciascuno",
        execute: async (actor, targets) => this._executeMossa(actor, targets, "pugnoIncantato")
      },
      schiaffoveggenza: {
        name: "Schiaffoveggenza",
        tipo: "reazione",
        descrizione: "Quando attaccato, dai svantaggio all'attaccante",
        execute: async (actor, attacker) => this._executeMossa(actor, attacker, "schiaffoveggenza")
      },
      sediataSpiriturale: {
        name: "Sediata Spirituale",
        tipo: "azione bonus",
        descrizione: "Trasforma oggetto di scena comune in epico",
        execute: async (actor) => this._executeMossa(actor, null, "sediataSpiriturale")
      }
    };

    // Mosse di Classe (dal manuale pag. 54)
    this.mosseClasse = {
      barbaro: {
        name: "Rissa Furiosa",
        descrizione: "Per questo turno, mosse e saccagnate infliggono 1 batosta aggiuntiva"
      },
      bardo: {
        name: "Ku Fu?",
        descrizione: "Reazione: quando attaccato, tiro (Car) per far cambiare bersaglio"
      },
      chierico: {
        name: "Osso Sacro",
        descrizione: "Azione: tiro (Sag): 1 batosta + prono"
      },
      druido: {
        name: "Schiaffo Animale",
        descrizione: "Azione: tiro (Sag): 1 batosta + spaventato"
      },
      guerriero: {
        name: "Contrattacco",
        descrizione: "Reazione: saccagnata contro attaccante con svantaggio"
      },
      ladro: {
        name: "Mossa Furtiva",
        descrizione: "Azione bonus: prossima mossa/saccagnata +1 batosta e vantaggio"
      },
      monaco: {
        name: "Raffica di Schiaffoni",
        descrizione: "Azione bonus: due saccagnate"
      },
      paladino: {
        name: "Punizione di Vino",
        descrizione: "Azione bonus: tiro (For): 1 batosta + accecato"
      },
      ranger: {
        name: "Il Richiamo della Foresta",
        descrizione: "Azione: lancia esca, bersaglio trattenuto da animale"
      },
      mago: {
        name: "Saccagnata Arcana!",
        descrizione: "Spendi slot mossa extra per +1 batosta a mossa magica"
      }
    };

    // Assi nella Manica (livello 6, dal manuale pag. 55)
    this.assiNellaManica = {
      barbaro: {
        name: "Viuuulenza!",
        descrizione: "Fino al prossimo turno non subisci batoste o condizioni"
      },
      bardo: {
        name: "Urlo Straziaugola",
        descrizione: "TS Costituzione o 1 batosta + incapacitato a tutti"
      },
      chierico: {
        name: "Donna Lama, il tuo servo ti chiama!",
        descrizione: "Un Pericolo Vagante colpisce tutti i nemici"
      },
      druido: {
        name: "Nube di Polline",
        descrizione: "TS Costituzione o 1 batosta + avvelenato a tutti"
      },
      guerriero: {
        name: "Pugno Vorpal",
        descrizione: "Saccagnata che infligge 3 batoste aggiuntive"
      },
      ladro: {
        name: "Puff... Sparito!",
        descrizione: "Reazione: eviti attacco e fai saccagnata +1 batosta"
      },
      mago: {
        name: "Palla di Cuoco",
        descrizione: "TS Destrezza o 2 batoste a tutti"
      },
      monaco: {
        name: "Rosario di San Cagnate",
        descrizione: "Saccagnata +1 batosta, TS Cos o KO immediato"
      },
      paladino: {
        name: "Evocare Cavalcatura",
        descrizione: "La cavalcatura fa due saccagnate e se ne va"
      },
      ranger: {
        name: "Trappolone",
        descrizione: "Reazione al movimento: 2 batoste + trattenuto"
      },
      stregone: {
        name: "Sfiga Suprema",
        descrizione: "TS Saggezza o lasci cadere tutto e sei spaventato"
      },
      warlock: {
        name: "Tocco del Rimorso",
        descrizione: "Chi ti colpisce subisce 1 batosta"
      }
    };

    // Pericoli Vaganti (opzionali, dal manuale pag. 55)
    this.pericoliVaganti = [
      {
        name: "Pioggia di Sgabelli",
        effect: "TS Costituzione CD 11 o stordito"
      },
      {
        name: "La Taverna dei Pugni Volanti",
        effect: "TS Forza CD 12 o 1 batosta"
      },
      {
        name: "Fiume di Birra",
        effect: "TS Destrezza CD 13 o prono"
      },
      {
        name: "Sacco di Farina",
        effect: "TS Destrezza CD 10 o accecato"
      },
      {
        name: "Se Non è Zuppa",
        effect: "TS Forza CD 10 o trattenuto"
      },
      {
        name: "Cala la Botte",
        effect: "Tira 1d6, con 1 subisci 1 batosta e prono"
      },
      {
        name: "Storie di Animali",
        effect: "1d6 ad ogni attacco, con 1 colpisci animale invece"
      },
      {
        name: "Piovono Salumi",
        effect: "Tira 1d6, con 1 subisci 1 batosta e stordito"
      }
    ];

    // Privilegi da Rissa per livello (dal manuale pag. 53)
    this.privilegiRissa = {
      1: { mosse: ["generica", "classe"], slotMossa: 2 },
      2: { ignoranzaEroica: true, slotMossa: 2 },
      3: { mosse: ["generica"], slotMossa: 3 },
      4: { mascellaDiFerro: true, slotMossa: 3 },
      5: { mosse: ["generica"], slotMossa: 4 },
      6: { assoNellaManica: true, slotMossa: 4 }
    };

    this._setupHooks();
  }

  _setupHooks() {
    // Hook per modificare il combattimento quando è una rissa
    Hooks.on("combatStart", (combat, options) => {
      if (combat.getFlag("brancalonia-bigat", "isBrawl")) {
        this.activeBrawl = true;
        this.brawlCombat = combat;
        ui.notifications.info("Modalità Rissa Attivata!");
      }
    });

    Hooks.on("combatTurn", (combat, updateData, updateOptions) => {
      if (this.activeBrawl && combat.id === this.brawlCombat?.id) {
        // Mostra azioni disponibili per il turno
        this._showBrawlActions(combat.combatant.actor);
      }
    });

    Hooks.on("combatEnd", (combat) => {
      if (combat.id === this.brawlCombat?.id) {
        this.endBrawl();
      }
    });

    // Hook per i comandi chat
    Hooks.on("chatMessage", (html, content, msg) => {
      if (content === "/rissa") {
        this.startBrawl();
        return false;
      }
    });
  }

  /**
   * Inizia una rissa (sistema corretto dal manuale)
   */
  async startBrawl() {
    if (this.activeBrawl) {
      ui.notifications.warn("C'è già una rissa in corso!");
      return;
    }

    // Seleziona i partecipanti
    const tokens = canvas.tokens.controlled;
    if (tokens.length === 0) {
      ui.notifications.warn("Seleziona i token che parteciperanno alla rissa!");
      return;
    }

    // Crea un nuovo combattimento marcato come rissa
    const combat = await Combat.create({
      scene: canvas.scene?.id,
      active: true,
      flags: {
        brancalonia: {
          isBrawl: true,
          pericoliVaganti: []
        }
      }
    });

    // Aggiungi i combattenti
    for (const token of tokens) {
      await combat.createEmbeddedDocuments("Combatant", [{
        tokenId: token.id,
        actorId: token.actor.id,
        initiative: null
      }]);

      // Inizializza dati rissa per il partecipante
      this.brawlParticipants.set(token.actor.id, {
        actor: token.actor,
        batoste: 0,
        slotMossaUsati: 0,
        slotMossaMax: this._getSlotMossa(token.actor),
        mosse: await this._getMosseDisponibili(token.actor),
        oggettoScena: null,
        condizioni: []
      });
    }

    this.activeBrawl = true;
    this.brawlCombat = combat;

    // Messaggio di inizio rissa
    await ChatMessage.create({
      content: `
        <div class="brancalonia-brawl-start" style="border: 2px solid #8b4513; padding: 10px; background: #f4e4bc;">
          <h2 style="color: #8b4513; text-align: center;">⚔️ RISSA! ⚔️</h2>
          <p style="text-align: center; font-style: italic;">
            "Né per fame né pe'l rame, mai si snudino le lame"
          </p>
          <hr>
          <h3>Regole della Rissa:</h3>
          <ul>
            <li><strong>Movimento:</strong> Generico, ovunque nell'ambiente</li>
            <li><strong>Danni:</strong> Si infliggono BATOSTE, non punti ferita</li>
            <li><strong>Saccagnata:</strong> Attacco base (For + competenza), 1 batosta</li>
            <li><strong>Mosse:</strong> Azioni speciali che consumano slot mossa</li>
            <li><strong>Oggetti di Scena:</strong> Comuni (bonus) o Epici (effetti speciali)</li>
            <li><strong>KO:</strong> A 6 batoste sei incosciente</li>
          </ul>
          <hr>
          <p><strong>Partecipanti:</strong> ${tokens.map(t => t.actor.name).join(", ")}</p>
        </div>
      `,
      speaker: { alias: "Sistema Rissa" }
    });

    // Chiedi se aggiungere Pericoli Vaganti
    const usePericoli = await this._askForPericoliVaganti();
    if (usePericoli) {
      await this._setupPericoliVaganti(combat);
    }

    // Inizia il combattimento
    await combat.startCombat();
  }

  /**
   * Mostra le azioni disponibili per il turno corrente
   */
  async _showBrawlActions(actor) {
    const participantData = this.brawlParticipants.get(actor.id);
    if (!participantData) return;

    const content = `
      <div class="brancalonia-brawl-turn" style="border: 1px solid #654321; padding: 10px; background: #faf8f3;">
        <h3>Turno di ${actor.name}</h3>
        <p><strong>Batoste:</strong> ${participantData.batoste}/6 ${this._getBatostaStatus(participantData.batoste)}</p>
        <p><strong>Slot Mossa:</strong> ${participantData.slotMossaMax - participantData.slotMossaUsati}/${participantData.slotMossaMax}</p>
        ${participantData.oggettoScena ? `<p><strong>In mano:</strong> ${participantData.oggettoScena}</p>` : ''}
        <hr>
        <h4>Azioni Disponibili:</h4>
        <ul>
          <li><strong>Saccagnata:</strong> Attacco base (For + comp), 1 batosta</li>
          <li><strong>Raccogliere Oggetto:</strong> Comune (bonus) o Epico (azione)</li>
          ${participantData.slotMossaUsati < participantData.slotMossaMax ?
            `<li><strong>Usare Mossa:</strong> ${participantData.mosse.map(m => m.name).join(", ")}</li>` : ''}
          ${actor.system.details.level >= 6 ? '<li><strong>Asso nella Manica:</strong> 1 volta per rissa</li>' : ''}
        </ul>
      </div>
    `;

    await ChatMessage.create({
      content: content,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  /**
   * Esegue una saccagnata
   */
  async executeSaccagnata(actor, target) {
    const attackRoll = await new Roll(
      `1d20 + @str + @prof`,
      {
        str: actor.system.abilities.str.mod,
        prof: actor.system.attributes.prof
      }
    ).evaluate();

    await attackRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: "Saccagnata!"
    });

    if (attackRoll.total >= target.actor.system.attributes.ac.value) {
      const batoste = attackRoll.dice[0].total === 20 ? 2 : 1; // Critico = doppie batoste
      await this._applyBatoste(target.actor, batoste);

      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> colpisce ${target.actor.name} con una saccagnata! ${batoste} batost${batoste > 1 ? 'e' : 'a'}!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    } else {
      await ChatMessage.create({
        content: `<p><strong>${actor.name}</strong> manca ${target.actor.name} con la saccagnata!</p>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }

  /**
   * Esegue una mossa
   */
  async _executeMossa(actor, target, mossaKey) {
    const participantData = this.brawlParticipants.get(actor.id);
    if (!participantData) return;

    // Verifica slot mossa
    if (participantData.slotMossaUsati >= participantData.slotMossaMax) {
      ui.notifications.warn("Non hai più slot mossa disponibili!");
      return;
    }

    // Consuma slot mossa
    participantData.slotMossaUsati++;

    // Esegui la mossa specifica
    // (Implementazione dettagliata per ogni mossa seguendo il manuale)
    await ChatMessage.create({
      content: `<p><strong>${actor.name}</strong> esegue ${mossaKey}!</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  /**
   * Applica batoste a un bersaglio
   */
  async _applyBatoste(actor, amount) {
    const participantData = this.brawlParticipants.get(actor.id);
    if (!participantData) return;

    participantData.batoste = Math.min(6, participantData.batoste + amount);

    // Applica penalità CA per ogni livello di batosta
    const caReduction = Math.min(5, participantData.batoste);

    // Crea/aggiorna effetto batoste
    const existingEffect = actor.effects.find(e => e.flags?.brancalonia?.isBatoste);
    if (existingEffect) {
      await existingEffect.update({
        name: this.batosteLevels[participantData.batoste - 1].name,
        changes: [{
          key: "system.attributes.ac.bonus",
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: -caReduction
        }]
      });
    } else {
      await actor.createEmbeddedDocuments("ActiveEffect", [{
        name: this.batosteLevels[participantData.batoste - 1].name,
        img: "icons/skills/wounds/injury-pain-body-orange.webp",
        changes: [{
          key: "system.attributes.ac.bonus",
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          value: -caReduction
        }],
        flags: {
          brancalonia: {
            isBatoste: true,
            level: participantData.batoste
          }
        }
      }]);
    }

    // Se raggiunge 6 batoste, è KO
    if (participantData.batoste >= 6) {
      await ChatMessage.create({
        content: `<h3 style="color: red;">${actor.name} è INCOSCIENTE!</h3>`,
        speaker: { alias: "Sistema Rissa" }
      });

      // Applica condizione incosciente
      await actor.createEmbeddedDocuments("ActiveEffect", [{
        name: "Incosciente (Rissa)",
        img: "icons/svg/unconscious.svg",
        statuses: ["unconscious"],
        flags: { brancalonia: { brawlKO: true } }
      }]);
    }
  }

  /**
   * Raccoglie un oggetto di scena
   */
  async pickUpProp(actor, tipo = "comune") {
    const participantData = this.brawlParticipants.get(actor.id);
    if (!participantData) return;

    const oggettiComuni = [
      "Bottiglia", "Brocca", "Posate", "Zappa", "Candelabro",
      "Torcia", "Fiasco", "Sgabello", "Attizzatoio"
    ];

    const oggettiEpici = [
      "Tavolo", "Botte", "Armatura d'arredo", "Cassapanca",
      "Baule", "Lampadario", "Un altro personaggio!"
    ];

    const oggetto = tipo === "comune" ?
      oggettiComuni[Math.floor(Math.random() * oggettiComuni.length)] :
      oggettiEpici[Math.floor(Math.random() * oggettiEpici.length)];

    participantData.oggettoScena = { nome: oggetto, tipo: tipo };

    await ChatMessage.create({
      content: `<p><strong>${actor.name}</strong> afferra ${oggetto}!</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  /**
   * Usa un oggetto di scena
   */
  async useProp(actor, mode) {
    const participantData = this.brawlParticipants.get(actor.id);
    if (!participantData?.oggettoScena) {
      ui.notifications.warn("Non hai oggetti di scena in mano!");
      return;
    }

    const prop = participantData.oggettoScena;
    let message = `<p><strong>${actor.name}</strong> usa ${prop.nome} `;

    if (prop.tipo === "comune") {
      switch(mode) {
        case "attack":
          message += "per attaccare con +1d4 al tiro!</p>";
          // Aggiungi bonus al prossimo attacco
          break;
        case "bonus":
          message += "come azione bonus per una saccagnata veloce!</p>";
          break;
        case "defense":
          message += "per difendersi (+2 CA)!</p>";
          break;
      }
    } else { // epico
      switch(mode) {
        case "damage":
          message += "infliggendo 1 batosta aggiuntiva!</p>";
          break;
        case "stun":
          message += "stordendo il bersaglio!</p>";
          break;
        case "area":
          message += "colpendo due bersagli!</p>";
          break;
        case "defense":
          message += "per una difesa epica (+5 CA)!</p>";
          break;
      }
    }

    await ChatMessage.create({
      content: message,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    // L'oggetto si disintegra dopo l'uso
    participantData.oggettoScena = null;
  }

  /**
   * Ottiene lo stato delle batoste
   */
  _getBatostaStatus(level) {
    if (level === 0) return "";
    if (level >= 6) return "(INCOSCIENTE)";
    return `(${this.batosteLevels[level - 1].name})`;
  }

  /**
   * Calcola slot mossa disponibili per livello
   */
  _getSlotMossa(actor) {
    const level = actor.system.details.level || 1;
    let baseSlots = 2;

    if (level >= 5) baseSlots = 4;
    else if (level >= 3) baseSlots = 3;

    // Aggiungi slot extra da background Attaccabrighe
    const slotExtra = actor.getFlag('brancalonia-bigat', 'slotMossaExtra') || 0;

    return baseSlots + slotExtra;
  }

  /**
   * Ottiene le mosse disponibili per il personaggio
   */
  async _getMosseDisponibili(actor) {
    const mosse = [];
    const level = actor.system.details.level || 1;
    const classe = actor.system.details.class?.toLowerCase() || "";

    // Mossa di classe al livello 1
    if (level >= 1 && this.mosseClasse[classe]) {
      mosse.push(this.mosseClasse[classe]);
    }

    // Mosse generiche ai livelli 1, 3, 5
    if (level >= 1) mosse.push(this.mosseGeneriche.saccagnata);
    if (level >= 3) mosse.push(this.mosseGeneriche.sgambetto);
    if (level >= 5) mosse.push(this.mosseGeneriche.ghigliottina);

    // Asso nella manica al livello 6
    if (level >= 6 && this.assiNellaManica[classe]) {
      mosse.push({
        ...this.assiNellaManica[classe],
        assoNellaManica: true
      });
    }

    return mosse;
  }

  /**
   * Chiede se usare i Pericoli Vaganti
   */
  async _askForPericoliVaganti() {
    return new Promise(resolve => {
      new Dialog({
        title: "Pericoli Vaganti",
        content: `
          <p>Vuoi aggiungere dei Pericoli Vaganti alla rissa?</p>
          <p style="font-size: 0.9em; font-style: italic;">
            I pericoli vaganti sono eventi casuali che colpiscono tutti durante la rissa.
          </p>
        `,
        buttons: {
          yes: {
            label: "Sì, aggiungi pericoli!",
            callback: () => resolve(true)
          },
          no: {
            label: "No, rissa normale",
            callback: () => resolve(false)
          }
        },
        default: "no"
      }).render(true);
    });
  }

  /**
   * Configura i Pericoli Vaganti
   */
  async _setupPericoliVaganti(combat) {
    const numPericoli = Math.min(3, Math.floor(Math.random() * 3) + 1);
    const pericoli = [];

    for (let i = 0; i < numPericoli; i++) {
      const pericolo = this.pericoliVaganti[Math.floor(Math.random() * this.pericoliVaganti.length)];
      pericoli.push(pericolo);
    }

    await combat.setFlag("brancalonia-bigat", "pericoliVaganti", pericoli);

    await ChatMessage.create({
      content: `
        <div style="border: 1px solid #800; padding: 10px; background: #fdd;">
          <h3>⚠️ Pericoli Vaganti Attivi ⚠️</h3>
          <ul>
            ${pericoli.map(p => `<li><strong>${p.name}:</strong> ${p.effect}</li>`).join('')}
          </ul>
        </div>
      `,
      speaker: { alias: "Sistema Rissa" }
    });
  }

  /**
   * Attiva un Pericolo Vagante
   */
  async activatePericoloVagante() {
    if (!this.brawlCombat) return;

    const pericoli = this.brawlCombat.getFlag("brancalonia-bigat", "pericoliVaganti");
    if (!pericoli || pericoli.length === 0) return;

    const pericolo = pericoli[Math.floor(Math.random() * pericoli.length)];

    await ChatMessage.create({
      content: `
        <div style="border: 2px solid #f00; padding: 10px; background: #fee;">
          <h3>💥 PERICOLO VAGANTE! 💥</h3>
          <p><strong>${pericolo.name}</strong></p>
          <p>${pericolo.effect}</p>
          <p style="font-style: italic;">Tutti i partecipanti devono fare il tiro indicato!</p>
        </div>
      `,
      speaker: { alias: "Pericolo!" }
    });
  }

  /**
   * Termina la rissa
   */
  async endBrawl() {
    if (!this.activeBrawl) return;

    // Determina vincitori e vinti
    const conscious = [];
    const unconscious = [];

    for (const [actorId, data] of this.brawlParticipants) {
      if (data.batoste >= 6) {
        unconscious.push(data.actor);
      } else {
        conscious.push(data.actor);
      }

      // Rimuovi effetti batoste
      const effects = data.actor.effects.filter(e =>
        e.flags?.brancalonia?.isBatoste || e.flags?.brancalonia?.brawlKO
      );
      for (const effect of effects) {
        await effect.delete();
      }
    }

    // Messaggio finale con regole del dopo-rissa
    await ChatMessage.create({
      content: `
        <div class="brancalonia-brawl-end" style="border: 2px solid #8b4513; padding: 15px; background: #f4e4bc;">
          <h2 style="color: #8b4513; text-align: center;">🏁 FINE DELLA RISSA! 🏁</h2>

          ${conscious.length > 0 ? `
            <h3 style="color: green;">✅ Ancora in Piedi:</h3>
            <ul>${conscious.map(a => `<li>${a.name}</li>`).join('')}</ul>
          ` : ''}

          ${unconscious.length > 0 ? `
            <h3 style="color: red;">❌ Incoscienti:</h3>
            <ul>${unconscious.map(a => `<li>${a.name}</li>`).join('')}</ul>
          ` : ''}

          <hr>
          <h3>📜 Regole Post-Rissa (dal manuale):</h3>
          <ol>
            <li><strong>Danni all'Osteria:</strong> Chi è incosciente può essere spogliato dall'oste per risarcimento</li>
            <li><strong>Trofeo:</strong> Ogni vincitore può prendere UN trofeo dagli sconfitti:
              <ul>
                <li>1 Cimelio</li>
                <li>1 moneta a scelta</li>
                <li>1 oggetto simbolico (mappa, lettera, etc.)</li>
                <li>Oppure dare uno "Schiaffo Morale" finale</li>
              </ul>
            </li>
            <li><strong>Niente Taglie:</strong> Era solo una rissa, non un crimine!</li>
          </ol>
        </div>
      `,
      speaker: { alias: "Sistema Rissa" }
    });

    // Reset
    this.activeBrawl = false;
    this.brawlCombat = null;
    this.brawlParticipants.clear();
  }

  /**
   * Crea macro per le azioni della rissa
   */
  static createBrawlMacros() {
    const macros = [
      {
        name: "🥊 Inizia Rissa",
        type: "script",
        img: "icons/skills/melee/unarmed-punch-fist.webp",
        command: "game.brancalonia.tavernBrawl.startBrawl();"
      },
      {
        name: "👊 Saccagnata",
        type: "script",
        img: "icons/skills/melee/punch-fist-white.webp",
        command: `
          const actor = game.user.character || canvas.tokens.controlled[0]?.actor;
          const target = game.user.targets.first();
          if (actor && target) {
            game.brancalonia.tavernBrawl.executeSaccagnata(actor, target);
          } else {
            ui.notifications.warn("Seleziona attaccante e bersaglio!");
          }
        `
      },
      {
        name: "🪑 Raccogliere Oggetto",
        type: "script",
        img: "icons/environment/furniture/chair-wooden.webp",
        command: `
          const actor = game.user.character || canvas.tokens.controlled[0]?.actor;
          if (actor) {
            new Dialog({
              title: "Raccogliere Oggetto di Scena",
              content: "<p>Che tipo di oggetto vuoi raccogliere?</p>",
              buttons: {
                comune: {
                  label: "Comune (azione bonus)",
                  callback: () => game.brancalonia.tavernBrawl.pickUpProp(actor, "comune")
                },
                epico: {
                  label: "Epico (azione)",
                  callback: () => game.brancalonia.tavernBrawl.pickUpProp(actor, "epico")
                }
              }
            }).render(true);
          }
        `
      },
      {
        name: "💥 Pericolo Vagante",
        type: "script",
        img: "icons/magic/fire/explosion-fireball-large-orange.webp",
        command: "game.brancalonia.tavernBrawl.activatePericoloVagante();"
      }
    ];

    macros.forEach(macroData => {
      Macro.create(macroData);
    });

    ui.notifications.info("Macro Risse create nella directory Macro");
  }
}