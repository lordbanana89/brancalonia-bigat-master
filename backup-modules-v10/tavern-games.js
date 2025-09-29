/**
 * Sistema Giochi da Bettola per Brancalonia
 * Basato RIGOROSAMENTE sulle regole del manuale (pag. 57-60)
 * Compatibile con dnd5e system per Foundry VTT v13
 */

export class TavernGamesSystem {
  constructor() {
    this.activeGames = new Map(); // ID giocatore -> partita attiva

    this._setupHooks();
  }

  _setupHooks() {
    // Hook per i comandi chat
    Hooks.on("chatMessage", (html, content, msg) => {
      if (content.startsWith("/gioca")) {
        const args = content.split(" ");
        if (args[1]) {
          this.startGame(args[1]);
        } else {
          this.showGameMenu();
        }
        return false;
      }
    });
  }

  /**
   * Mostra il menu di selezione giochi
   */
  async showGameMenu() {
    const content = `
      <div style="max-height: 500px; overflow-y: auto;">
        <h2 style="text-align: center; color: #8b4513;">🎲 Giochi da Bettola 🎲</h2>
        <p style="text-align: center; font-style: italic;">
          "Ognuno di questi giochi, con un poco di buona sorte,
          può far sì che un'onesta canaglia si possa riempire
          la borsa di petecchioni sonanti!"
        </p>
        <hr>

        <div class="game-option" style="border: 1px solid #666; padding: 10px; margin: 5px; background: #f0f0f0;">
          <h3>🃏 Le Minchiate</h3>
          <p><em>Gioco di carte dove fortuna, intuito e imbroglio sono parte integrante!</em></p>
          <p>Puntata concordata. Scegli 2 abilità, tira il dado vincita, chi fa di più vince il piatto.</p>
          <button class="play-game" data-game="minchiate" style="width: 100%; padding: 5px;">
            Gioca alle Minchiate
          </button>
        </div>

        <div class="game-option" style="border: 1px solid #666; padding: 10px; margin: 5px; background: #f0f0f0;">
          <h3>🎯 Botte alla Botte</h3>
          <p><em>Unisce resistenza al vino, abilità nell'arme e buona sorte!</em></p>
          <p>Bevi birra, tira contro la botte. Chi la spacca vince, o l'oste prende tutto.</p>
          <button class="play-game" data-game="botte" style="width: 100%; padding: 5px;">
            Gioca a Botte alla Botte
          </button>
        </div>

        <div class="game-option" style="border: 1px solid #666; padding: 10px; margin: 5px; background: #f0f0f0;">
          <h3>🍖 Gara di Mangiate</h3>
          <p><em>Il gioco preferito da morganti e fratacchioni!</em></p>
          <p>1 ma per mancia. Resisti mangiando fino a che non rimane uno solo in piedi.</p>
          <button class="play-game" data-game="mangiate" style="width: 100%; padding: 5px;">
            Partecipa alla Gara di Mangiate
          </button>
        </div>

        <div class="game-option" style="border: 1px solid #666; padding: 10px; margin: 5px; background: #f0f0f0;">
          <h3>🐴 Giostra dei Poveri</h3>
          <p><em>Schernisce le giostre dei cavalieri!</em></p>
          <p>Un cavaliere sulle spalle del cavallo, armato di scopa. Chi cade perde!</p>
          <button class="play-game" data-game="giostra" style="width: 100%; padding: 5px;">
            Partecipa alla Giostra
          </button>
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: "Giochi da Bettola",
      content: content,
      buttons: {
        close: {
          label: "Chiudi",
          callback: () => {}
        }
      },
      render: (html) => {
        html.find(".play-game").click((event) => {
          const gameKey = event.currentTarget.dataset.game;
          dialog.close();
          this.startGame(gameKey);
        });
      }
    });

    dialog.render(true);
  }

  /**
   * Avvia un gioco specifico
   */
  async startGame(gameKey) {
    // Seleziona il personaggio giocante
    const actor = game.user?.character || canvas.tokens.controlled[0]?.actor;
    if (!actor) {
      ui.notifications.warn("Seleziona un personaggio per giocare!");
      return;
    }

    switch (gameKey) {
      case "minchiate":
        await this.playMinchiate(actor);
        break;
      case "botte":
        await this.playBotteAllaBotte(actor);
        break;
      case "mangiate":
        await this.playGaraDiMangiate(actor);
        break;
      case "giostra":
        await this.playGiostraDeiPoveri(actor);
        break;
      default:
        ui.notifications.warn("Gioco non riconosciuto!");
    }
  }

  /**
   * LE MINCHIATE - Gioco di carte (dal manuale pag. 57)
   */
  async playMinchiate(actor) {
    // Dialog per la puntata
    const bet = await this._getBetAmount(actor, "Minchiate", 5, 50);
    if (!bet) return;

    // Selezione delle 2 abilità
    const skills = await this._selectMinchiateSkills(actor);
    if (!skills) return;

    await ChatMessage.create({
      content: `
        <div style="border: 1px solid #8b4513; padding: 10px; background: #faf8f3;">
          <h3>🃏 Le Minchiate 🃏</h3>
          <p><strong>${actor.name}</strong> mette ${bet} ma sul tavolo.</p>
          <p>Approccio scelto: ${skills.join(" e ")}</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    // Calcola CD (10 + 1 per ogni giocatore, incluso chi tira)
    const numPlayers = Math.floor(Math.random() * 4) + 2; // 2-5 giocatori
    const dc = 10 + numPlayers;

    // Effettua le prove di abilità
    let successes = 0;
    for (const skill of skills) {
      const roll = await this._rollSkill(actor, skill, dc);
      if (roll.total >= dc) successes++;
    }

    // Determina il Dado Vincita
    let winDie = "1d6";
    if (successes === 1) winDie = "1d8";
    if (successes === 2) winDie = "1d10";

    // Tira il Dado Vincita
    const winRoll = await new Roll(winDie).evaluate();
    await winRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: "Dado Vincita"
    });

    // Tiri degli avversari
    const opponentRolls = [];
    for (let i = 1; i < numPlayers; i++) {
      const oppRoll = await new Roll("1d8").evaluate(); // Avversari medi
      opponentRolls.push(oppRoll.total);
    }

    const maxOpponent = Math.max(...opponentRolls);
    const won = winRoll.total > maxOpponent;

    // Risultato
    await ChatMessage.create({
      content: `
        <div style="border: 2px solid #8b4513; padding: 10px; background: #f4e4bc;">
          <h3>Risultato Minchiate</h3>
          <p><strong>Tuo dado vincita (${winDie}):</strong> ${winRoll.total}</p>
          <p><strong>Miglior avversario:</strong> ${maxOpponent}</p>
          <hr>
          ${won ?
            `<p style="color: green;"><strong>HAI VINTO!</strong> Porti a casa ${bet * (numPlayers - 1)} ma!</p>` :
            winRoll.total === maxOpponent ?
              `<p style="color: orange;"><strong>PAREGGIO!</strong> Ti dividi la vincita... o fate a botte!</p>` :
              `<p style="color: red;"><strong>HAI PERSO!</strong> Perdi ${bet} ma.</p>`
          }
        </div>
      `,
      speaker: { alias: "Minchiate" }
    });

    // Aggiorna denaro
    if (won) {
      await this._updateMoney(actor, bet * (numPlayers - 1));
    } else if (winRoll.total < maxOpponent) {
      await this._updateMoney(actor, -bet);
    }
  }

  /**
   * BOTTE ALLA BOTTE (dal manuale pag. 57-58)
   */
  async playBotteAllaBotte(actor) {
    // Dialog per la puntata
    const bet = await this._getBetAmount(actor, "Botte alla Botte", 5, 30);
    if (!bet) return;

    // Chiedi quanti boccali bere
    const drinks = await this._selectDrinks();
    if (!drinks) return;

    // Setup della botte
    const botteAC = 13;
    const botteHP = 20;
    let currentHP = botteHP;

    await ChatMessage.create({
      content: `
        <div style="border: 1px solid #8b4513; padding: 10px; background: #faf8f3;">
          <h3>🎯 Botte alla Botte 🎯</h3>
          <p><strong>${actor.name}</strong> punta ${bet} ma e si prepara a bere ${drinks} boccal${drinks > 1 ? 'i' : 'e'}!</p>
          <p>Botte: CA ${botteAC}, PF ${botteHP}</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    // Tiro salvezza Costituzione
    const conDC = 10 + drinks;
    const conSave = await actor.rollAbilitySave("con");
    const isDrunk = conSave.total < conDC;

    await ChatMessage.create({
      content: `<p>TS Costituzione CD ${conDC}: ${conSave.total} - ${isDrunk ? "Ubriaco! (svantaggio)" : "Sobrio!"}</p>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    // Altri giocatori
    const numOpponents = Math.floor(Math.random() * 3) + 1;
    let botteDestroyed = false;
    let winner = null;

    // Turno del giocatore
    for (let i = 0; i < drinks; i++) {
      if (botteDestroyed) break;

      const attackRoll = isDrunk ?
        await new Roll("2d20kl + @prof", { prof: actor.system.attributes.prof }).evaluate() :
        await new Roll("1d20 + @prof", { prof: actor.system.attributes.prof }).evaluate();

      await attackRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: `Tiro ${i + 1} contro la botte`
      });

      if (attackRoll.total >= botteAC || attackRoll.dice[0].total === 20) {
        const damage = attackRoll.dice[0].total === 20 ? currentHP : // Critico spacca la botte
                       await new Roll("1d6").evaluate().total;
        currentHP -= damage;

        if (currentHP <= 0) {
          botteDestroyed = true;
          winner = actor.name;
          await ChatMessage.create({
            content: `<p style="color: green;"><strong>${actor.name} SPACCA LA BOTTE!</strong></p>`,
            speaker: { alias: "Botte alla Botte" }
          });
        }
      }
    }

    // Turni degli avversari (se la botte è ancora integra)
    if (!botteDestroyed) {
      for (let opp = 1; opp <= numOpponents; opp++) {
        if (botteDestroyed) break;

        const oppDrinks = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < oppDrinks; i++) {
          if (botteDestroyed) break;

          const oppAttack = await new Roll("1d20 + 3").evaluate();
          if (oppAttack.total >= botteAC || oppAttack.dice[0].total === 20) {
            const damage = oppAttack.dice[0].total === 20 ? currentHP :
                          await new Roll("1d6").evaluate().total;
            currentHP -= damage;

            if (currentHP <= 0) {
              botteDestroyed = true;
              winner = `Avversario ${opp}`;
              await ChatMessage.create({
                content: `<p style="color: red;"><strong>L'avversario ${opp} spacca la botte!</strong></p>`,
                speaker: { alias: "Botte alla Botte" }
              });
            }
          }
        }
      }
    }

    // Risultato finale
    let winnings = 0;
    let resultMsg = "";

    if (winner === actor.name) {
      winnings = bet * (numOpponents + 1);
      resultMsg = `<p style="color: green;"><strong>VITTORIA!</strong> Vinci ${winnings} ma!</p>`;
    } else if (winner) {
      winnings = -bet;
      resultMsg = `<p style="color: red;"><strong>SCONFITTA!</strong> Perdi ${bet} ma.</p>`;
    } else {
      // Botte integra, l'oste vince ma i giocatori non pagano le birre
      resultMsg = `<p style="color: orange;"><strong>BOTTE INTEGRA!</strong> L'oste vince, ma non paghi le birre!</p>`;
    }

    await ChatMessage.create({
      content: `
        <div style="border: 2px solid #8b4513; padding: 10px; background: #f4e4bc;">
          <h3>Risultato Finale</h3>
          ${resultMsg}
        </div>
      `,
      speaker: { alias: "Botte alla Botte" }
    });

    await this._updateMoney(actor, winnings);
  }

  /**
   * GARA DI MANGIATE (dal manuale pag. 58)
   */
  async playGaraDiMangiate(actor) {
    await ChatMessage.create({
      content: `
        <div style="border: 1px solid #8b4513; padding: 10px; background: #faf8f3;">
          <h3>🍖 Gara di Mangiate 🍖</h3>
          <p><strong>${actor.name}</strong> si siede al tavolo per la gara!</p>
          <p>Ogni mancia costa 1 ma. La gara prosegue fino all'ultimo in piedi!</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    let mancia = 1; // Numero della mancia/round
    let dadoMangiata = 1; // Valore del Dado Mangiata
    let totalSpent = 0;
    let stillIn = true;
    let opponents = Math.floor(Math.random() * 4) + 2; // 2-5 avversari
    let opponentsRemaining = opponents;

    const conMod = actor.system.abilities.con.mod;
    const posateDiSanMangio = false; // TODO: Controllare se ha le posate magiche

    while (stillIn && mancia <= 6) {
      // Paga la mancia
      totalSpent += 1;

      await ChatMessage.create({
        content: `
          <h4>🍖 Mancia ${mancia} - Dado Mangiata: ${dadoMangiata} 🍖</h4>
          <p>CD del tiro salvezza: ${10 + dadoMangiata}</p>
        `,
        speaker: { alias: "Gara di Mangiate" }
      });

      // Tiro del giocatore
      const dc = 10 + dadoMangiata;
      const save = await actor.rollAbilitySave("con");
      const savedValue = save.total + (posateDiSanMangio ? 5 : 0);

      // Controlla Muro dell'Appetito
      const hasDisadvantage = dadoMangiata > conMod;

      if (savedValue < dc) {
        // Subisce batoste pari al Dado Mangiata
        stillIn = false;
        await ChatMessage.create({
          content: `<p style="color: red;">${actor.name} non regge più! Subisce ${dadoMangiata} batoste e si ritira!</p>`,
          speaker: { alias: "Gara di Mangiate" }
        });
      } else {
        await ChatMessage.create({
          content: `<p style="color: green;">${actor.name} regge ancora! ${hasDisadvantage ? '(Muro dell\'Appetito raggiunto)' : ''}</p>`,
          speaker: { alias: "Gara di Mangiate" }
        });
      }

      // Tiri degli avversari
      let opponentsFailed = 0;
      for (let i = 0; i < opponentsRemaining; i++) {
        const oppSave = await new Roll("1d20 + 2").evaluate(); // Con +2 medio
        if (oppSave.total < dc) {
          opponentsFailed++;
        }
      }
      opponentsRemaining -= opponentsFailed;

      if (opponentsFailed > 0) {
        await ChatMessage.create({
          content: `<p>${opponentsFailed} avversari si ritirano! Ne rimangono ${opponentsRemaining}.</p>`,
          speaker: { alias: "Gara di Mangiate" }
        });
      }

      // Verifica condizioni di vittoria
      if (stillIn && opponentsRemaining === 0) {
        // Vittoria!
        const winnings = Math.floor(totalSpent * opponents / 2);
        await ChatMessage.create({
          content: `
            <div style="border: 2px solid #8b4513; padding: 10px; background: #f4e4bc;">
              <h3 style="color: green;">🏆 VITTORIA! 🏆</h3>
              <p>${actor.name} è l'ultimo in piedi!</p>
              <p>Vinci ${winnings} ma dal piatto!</p>
            </div>
          `,
          speaker: { alias: "Gara di Mangiate" }
        });
        await this._updateMoney(actor, winnings - totalSpent);
        return;
      }

      if (!stillIn && opponentsRemaining > 0) {
        // Sconfitta
        await ChatMessage.create({
          content: `
            <div style="border: 2px solid #8b4513; padding: 10px; background: #f4e4bc;">
              <h3 style="color: red;">❌ SCONFITTA ❌</h3>
              <p>${actor.name} crolla alla mancia ${mancia}!</p>
              <p>Hai speso ${totalSpent} ma in mance.</p>
            </div>
          `,
          speaker: { alias: "Gara di Mangiate" }
        });
        await this._updateMoney(actor, -totalSpent);
        return;
      }

      // Prossima mancia
      mancia++;
      dadoMangiata = Math.min(6, dadoMangiata + 1);
    }

    // Se nessuno vince, il locandiere prende tutto
    if (stillIn && opponentsRemaining > 0) {
      await ChatMessage.create({
        content: `
          <div style="border: 2px solid #8b4513; padding: 10px; background: #f4e4bc;">
            <h3 style="color: orange;">🤝 PAREGGIO 🤝</h3>
            <p>Tutti crollano esausti! Il locandiere si prende tutte le mance!</p>
            <p>Hai speso ${totalSpent} ma.</p>
          </div>
        `,
        speaker: { alias: "Gara di Mangiate" }
      });
      await this._updateMoney(actor, -totalSpent);
    }
  }

  /**
   * GIOSTRA DEI POVERI (dal manuale pag. 58)
   */
  async playGiostraDeiPoveri(actor) {
    // Trova un compagno cavallo
    const horse = await this._selectHorse();
    if (!horse) return;

    await ChatMessage.create({
      content: `
        <div style="border: 1px solid #8b4513; padding: 10px; background: #faf8f3;">
          <h3>🐴 Giostra dei Poveri 🐴</h3>
          <p><strong>Cavaliere:</strong> ${actor.name}</p>
          <p><strong>Cavallo:</strong> ${horse.name}</p>
          <p>Contro un'altra coppia di sfidanti!</p>
        </div>
      `,
      speaker: { alias: "Giostra dei Poveri" }
    });

    let dadoGiostra = "d8"; // Dado iniziale
    let opponentDado = "d8";

    // 1. Montare a cavallo
    const mountRoll = await actor.rollSkill("acr");
    if (mountRoll.total < 10) {
      dadoGiostra = this._degradeDie(dadoGiostra);
      await ChatMessage.create({
        content: `<p>${actor.name} sale male in groppa! Dado Giostra degrada a ${dadoGiostra}.</p>`,
        speaker: { alias: "Giostra" }
      });
    } else {
      dadoGiostra = this._upgradeDie(dadoGiostra);
      await ChatMessage.create({
        content: `<p>${actor.name} salta agilmente in groppa! Dado Giostra migliora a ${dadoGiostra}.</p>`,
        speaker: { alias: "Giostra" }
      });
    }

    // 2. Carica del cavallo
    const chargeRoll = await horse.rollSkill("ath");
    if (chargeRoll.total < 12) {
      dadoGiostra = this._degradeDie(dadoGiostra);
      await ChatMessage.create({
        content: `<p>${horse.name} carica debolmente! Dado Giostra degrada a ${dadoGiostra}.</p>`,
        speaker: { alias: "Giostra" }
      });
    } else {
      dadoGiostra = this._upgradeDie(dadoGiostra);
      await ChatMessage.create({
        content: `<p>${horse.name} carica potentemente! Dado Giostra migliora a ${dadoGiostra}.</p>`,
        speaker: { alias: "Giostra" }
      });
    }

    // Avversari fanno lo stesso (semplificato)
    const oppMountRoll = await new Roll("1d20 + 2").evaluate();
    if (oppMountRoll.total >= 10) opponentDado = this._upgradeDie(opponentDado);
    else opponentDado = this._degradeDie(opponentDado);

    const oppChargeRoll = await new Roll("1d20 + 3").evaluate();
    if (oppChargeRoll.total >= 12) opponentDado = this._upgradeDie(opponentDado);
    else opponentDado = this._degradeDie(opponentDado);

    // 3. Scontro finale!
    const playerAttack = await new Roll(`1d20 + ${dadoGiostra}`).evaluate();
    const opponentAttack = await new Roll(`1d20 + ${opponentDado}`).evaluate();

    await playerAttack.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `Attacco con la scopa! (Dado Giostra: ${dadoGiostra})`
    });

    await opponentAttack.toMessage({
      speaker: { alias: "Avversario" },
      flavor: `Attacco avversario! (Dado Giostra: ${opponentDado})`
    });

    // Determina chi viene colpito
    let result = "";
    if (playerAttack.total > 10 && opponentAttack.total <= 10) {
      result = `<h3 style="color: green;">✅ VITTORIA!</h3><p>L'avversario cade disarcionato!</p>`;
    } else if (playerAttack.total <= 10 && opponentAttack.total > 10) {
      result = `<h3 style="color: red;">❌ SCONFITTA!</h3><p>${actor.name} cade a terra!</p>`;
    } else if (playerAttack.total > 10 && opponentAttack.total > 10) {
      result = `<h3 style="color: orange;">💥 DOPPIO COLPO!</h3><p>Entrambi cadono! Pareggio!</p>`;
    } else {
      result = `<h3 style="color: gray;">🔄 MANCATO!</h3><p>Nessuno colpisce! Si riprova!</p>`;
    }

    await ChatMessage.create({
      content: `
        <div style="border: 2px solid #8b4513; padding: 10px; background: #f4e4bc;">
          <h3>Risultato della Giostra</h3>
          ${result}
        </div>
      `,
      speaker: { alias: "Giostra dei Poveri" }
    });
  }

  /* -------------------------------------------- */
  /*  Funzioni di Utilità                        */
  /* -------------------------------------------- */

  async _getBetAmount(actor, gameName, min, max) {
    const currentGold = Math.floor(actor.system.currency?.gp || 0);

    if (currentGold < min) {
      ui.notifications.warn(`Servono almeno ${min} ma per giocare a ${gameName}!`);
      return null;
    }

    return new Promise(resolve => {
      new Dialog({
        title: `${gameName} - Puntata`,
        content: `
          <p>Quanto vuoi puntare? (${min}-${Math.min(max, currentGold)} ma)</p>
          <input type="number" id="bet" value="${min}" min="${min}" max="${Math.min(max, currentGold)}" />
          <p style="font-size: 0.9em;">Hai ${currentGold} ma</p>
        `,
        buttons: {
          bet: {
            label: "Punta",
            callback: (html) => {
              const bet = parseInt(html.find("#bet").val());
              resolve(bet);
            }
          },
          cancel: {
            label: "Annulla",
            callback: () => resolve(null)
          }
        },
        default: "bet"
      }).render(true);
    });
  }

  async _selectMinchiateSkills(actor) {
    return new Promise(resolve => {
      const content = `
        <p>Scegli 2 abilità che rappresentano il tuo approccio alla partita:</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
          <label><input type="checkbox" value="investigation"> Indagare (INT) - Calcolo probabilità</label>
          <label><input type="checkbox" value="insight"> Intuizione (SAG) - Svelare bluff</label>
          <label><input type="checkbox" value="deception"> Inganno (CAR) - Bluffare</label>
          <label><input type="checkbox" value="sleightOfHand"> Rapidità di mano (DES) - Barare</label>
        </div>
      `;

      new Dialog({
        title: "Minchiate - Scegli Approccio",
        content: content,
        buttons: {
          confirm: {
            label: "Conferma",
            callback: (html) => {
              const selected = [];
              html.find("input:checked").each(function() {
                selected.push($(this).val());
              });

              if (selected.length !== 2) {
                ui.notifications.warn("Devi scegliere esattamente 2 abilità!");
                resolve(null);
              } else {
                resolve(selected);
              }
            }
          },
          cancel: {
            label: "Annulla",
            callback: () => resolve(null)
          }
        },
        default: "confirm"
      }).render(true);
    });
  }

  async _selectDrinks() {
    return new Promise(resolve => {
      new Dialog({
        title: "Botte alla Botte - Boccali",
        content: `
          <p>Quanti boccali vuoi bere prima di tirare?</p>
          <p style="font-size: 0.9em;">Più bevi, più tiri hai, ma rischi di ubriacarti!</p>
          <input type="number" id="drinks" value="1" min="1" max="5" />
        `,
        buttons: {
          drink: {
            label: "Bevi!",
            callback: (html) => {
              const drinks = parseInt(html.find("#drinks").val());
              resolve(drinks);
            }
          },
          cancel: {
            label: "Annulla",
            callback: () => resolve(null)
          }
        },
        default: "drink"
      }).render(true);
    });
  }

  async _selectHorse() {
    const tokens = canvas.tokens.controlled.filter(t => t.actor.id !== game.user.character?.id);

    if (tokens.length === 0) {
      return new Promise(resolve => {
        new Dialog({
          title: "Scegli il Cavallo",
          content: `
            <p>Inserisci il nome del tuo compagno che farà da cavallo:</p>
            <input type="text" id="horseName" value="Compagno Robusto" />
          `,
          buttons: {
            confirm: {
              label: "Conferma",
              callback: (html) => {
                const name = html.find("#horseName").val();
                // Crea un actor temporaneo
                resolve({
                  name: name,
                  rollSkill: async (skill) => {
                    const roll = await new Roll("1d20 + 3").evaluate();
                    await roll.toMessage({
                      speaker: { alias: name },
                      flavor: `Prova di ${skill === "ath" ? "Atletica" : skill}`
                    });
                    return { total: roll.total };
                  }
                });
              }
            },
            cancel: {
              label: "Annulla",
              callback: () => resolve(null)
            }
          }
        }).render(true);
      });
    } else {
      return tokens[0].actor;
    }
  }

  async _rollSkill(actor, skillKey, dc) {
    let roll;

    switch(skillKey) {
      case "investigation":
        roll = await actor.rollSkill("inv");
        break;
      case "insight":
        roll = await actor.rollSkill("ins");
        break;
      case "deception":
        roll = await actor.rollSkill("dec");
        break;
      case "sleightOfHand":
        roll = await actor.rollSkill("slt");
        break;
      default:
        roll = await new Roll("1d20").evaluate();
    }

    // Se è Rapidità di mano e fallisce, paga penalità
    if (skillKey === "sleightOfHand" && roll.total < dc) {
      ui.notifications.warn("Beccato a barare! Paghi una quota aggiuntiva!");
    }

    return roll;
  }

  async _updateMoney(actor, amount) {
    const currentGold = actor.system.currency?.du || 0;
    const newGold = Math.max(0, currentGold + amount);

    await actor.update({
      "system.currency.du": newGold
    });

    if (amount > 0) {
      ui.notifications.info(`${actor.name} guadagna ${amount} ma!`);
    } else if (amount < 0) {
      ui.notifications.warn(`${actor.name} perde ${Math.abs(amount)} ma!`);
    }
  }

  _upgradeDie(currentDie) {
    const progression = ["d4", "d6", "d8", "d10", "d12"];
    const current = progression.indexOf(currentDie);
    return progression[Math.min(current + 1, 4)];
  }

  _degradeDie(currentDie) {
    const progression = ["d4", "d6", "d8", "d10", "d12"];
    const current = progression.indexOf(currentDie);
    return progression[Math.max(current - 1, 0)];
  }

  /**
   * Crea macro per i giochi
   */
  static createGameMacros() {
    const macros = [
      {
        name: "🎲 Menu Giochi",
        type: "script",
        img: "icons/tools/gaming/dice-runed-brown.webp",
        command: "game.brancalonia.tavernGames.showGameMenu();"
      },
      {
        name: "🃏 Le Minchiate",
        type: "script",
        img: "icons/tools/gaming/playing-cards.webp",
        command: "game.brancalonia.tavernGames.startGame('minchiate');"
      },
      {
        name: "🎯 Botte alla Botte",
        type: "script",
        img: "icons/containers/barrels/barrel-worn-oak-tan.webp",
        command: "game.brancalonia.tavernGames.startGame('botte');"
      },
      {
        name: "🍖 Gara di Mangiate",
        type: "script",
        img: "icons/consumables/food/meal-bowl-rice-meat-brown.webp",
        command: "game.brancalonia.tavernGames.startGame('mangiate');"
      }
    ];

    macros.forEach(macroData => {
      Macro.create(macroData);
    });

    ui.notifications.info("Macro Giochi da Bettola create");
  }
}