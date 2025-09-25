/**
 * Sistema Risse da Taverna di Brancalonia
 * Gestisce le risse non letali con regole speciali
 */

Hooks.once("init", () => {
    console.log("Brancalonia | Inizializzazione Sistema Risse da Taverna");

    CONFIG.BRANCALONIA = CONFIG.BRANCALONIA || {};
    CONFIG.BRANCALONIA.rissa = {
        mosse: {
            base: ["Pugno", "Spinta", "Testata", "Oggetto Improvvisato"],
            speciali: ["Bicchierata", "Randellata", "Sediata", "Buttafuori", "Presa dell'Orso"]
        },
        batoste: 0,
        ko: false
    };

    // Registra nuovo tipo di danno
    CONFIG.DND5E.damageTypes.brawl = "Da Rissa (non letale)";
});

/**
 * Classe principale per gestire le Risse
 */
class RissaTaverna {
    static rissaAttiva = false;
    static partecipanti = new Set();
    static batoste = new Map(); // Track batoste per personaggio

    /**
     * Inizia una rissa
     */
    static async iniziaRissa() {
        this.rissaAttiva = true;
        this.partecipanti.clear();
        this.batoste.clear();

        // Aggiungi tutti i token selezionati
        for (const token of canvas.tokens.controlled) {
            this.partecipanti.add(token.actor.id);
            this.batoste.set(token.actor.id, 0);
        }

        // Crea messaggio di inizio rissa
        ChatMessage.create({
            content: `<div class="brancalonia rissa-start">
                <h2>🍺 RISSA DA TAVERNA! 🍺</h2>
                <p>Le sedie volano, i boccali si frantumano!</p>
                <p class="participants">Partecipanti: ${this.partecipanti.size}</p>
                <div class="rissa-rules">
                    <p><strong>Regole della Rissa:</strong></p>
                    <ul>
                        <li>Tutti i danni sono non letali</li>
                        <li>Niente magia offensiva</li>
                        <li>6 Batoste = KO</li>
                        <li>Mosse speciali disponibili!</li>
                    </ul>
                </div>
            </div>`,
            speaker: {alias: "Rissa!"}
        });

        // Applica effetto rissa a tutti i partecipanti
        for (const actorId of this.partecipanti) {
            const actor = game.actors.get(actorId);
            if (actor) {
                await this.applicaEffettoRissa(actor);
            }
        }
    }

    /**
     * Applica effetto rissa a un attore
     */
    static async applicaEffettoRissa(actor) {
        const effect = {
            name: "In Rissa",
            icon: "icons/skills/melee/unarmed-punch-fist.webp",
            duration: {},
            changes: [
                {
                    key: "flags.brancalonia.inRissa",
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: "true",
                    priority: 20
                }
            ],
            flags: {
                brancalonia: {
                    rissa: true
                }
            }
        };

        await actor.createEmbeddedDocuments("ActiveEffect", [effect]);
    }

    /**
     * Mosse base della rissa
     */
    static mosse = {
        pugno: {
            nome: "Pugno",
            attacco: "1d20 + @abilities.str.mod",
            danno: "1d4 + @abilities.str.mod",
            descrizione: "Un semplice pugno"
        },
        spinta: {
            nome: "Spinta",
            attacco: "1d20 + @abilities.str.mod",
            effetto: "Bersaglio indietro 10 ft, TS Forza CD 8+prof+FOR o cade prono",
            descrizione: "Spingi il bersaglio"
        },
        testata: {
            nome: "Testata",
            attacco: "1d20 + @abilities.str.mod",
            danno: "1d6 + @abilities.str.mod",
            contropartita: "Subisci 1d4 danni",
            descrizione: "Testata potente ma rischiosa"
        },
        oggettoImprovvisato: {
            nome: "Oggetto Improvvisato",
            attacco: "1d20 + @abilities.str.mod",
            danno: "1d6 + @abilities.str.mod",
            speciale: "L'oggetto si rompe",
            descrizione: "Sedia, boccale, bottiglia..."
        }
    };

    /**
     * Mosse speciali
     */
    static mosseSpeciali = {
        bicchierata: {
            nome: "Bicchierata",
            requisito: "Boccale pieno",
            attacco: "1d20 + @abilities.dex.mod",
            danno: "1d8 + @abilities.str.mod",
            effetto: "Bersaglio accecato per 1 turno",
            descrizione: "Lanci birra negli occhi e colpisci col boccale"
        },
        randellata: {
            nome: "Randellata",
            requisito: "Oggetto pesante",
            attacco: "1d20 + @abilities.str.mod",
            danno: "2d6 + @abilities.str.mod",
            effetto: "Bersaglio stordito (TS COS CD 12)",
            descrizione: "Colpo devastante con oggetto pesante"
        },
        sediata: {
            nome: "Sediata",
            requisito: "Sedia disponibile",
            attacco: "1d20 + @abilities.str.mod",
            danno: "1d10 + @abilities.str.mod",
            speciale: "La sedia si rompe sempre",
            descrizione: "Il classico della rissa!"
        },
        buttafuori: {
            nome: "Buttafuori",
            requisito: "Taglia Grande o FOR 16+",
            attacco: "Prova contrapposta di Atletica",
            effetto: "Lanci bersaglio 15 ft + prono",
            descrizione: "Sollevi e lanci l'avversario"
        },
        presaDellOrso: {
            nome: "Presa dell'Orso",
            attacco: "1d20 + @abilities.str.mod + @prof",
            effetto: "Bersaglio afferrato, 1d6 danni/turno",
            descrizione: "Afferri e stritoli"
        }
    };

    /**
     * Esegui mossa di rissa
     */
    static async eseguiMossa(actor, mossaNome, target) {
        const mossa = this.mosse[mossaNome] || this.mosseSpeciali[mossaNome];
        if (!mossa) return;

        let content = `<div class="brancalonia rissa-move">
            <h3>${actor.name} usa ${mossa.nome}!</h3>`;

        // Tiro per colpire
        if (mossa.attacco) {
            const roll = await new Roll(mossa.attacco, actor.getRollData()).evaluate();
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({actor}),
                flavor: `Attacco con ${mossa.nome}`
            });

            if (target && roll.total >= target.actor.system.attributes.ac.value) {
                // Colpito!
                content += `<p class="hit">💥 Colpisce ${target.name}!</p>`;

                // Tira danni
                if (mossa.danno) {
                    const dmgRoll = await new Roll(mossa.danno, actor.getRollData()).evaluate();
                    await dmgRoll.toMessage({
                        speaker: ChatMessage.getSpeaker({actor}),
                        flavor: `Danni da ${mossa.nome} (non letali)`
                    });

                    // Applica batoste invece di danni reali
                    await this.applicaBatoste(target.actor, Math.floor(dmgRoll.total / 5));
                }

                // Effetti speciali
                if (mossa.effetto) {
                    content += `<p class="effect">${mossa.effetto}</p>`;
                    await this.applicaEffettoMossa(target.actor, mossa);
                }
            } else {
                content += `<p class="miss">Manca!</p>`;
            }
        }

        // Contropartita
        if (mossa.contropartita) {
            content += `<p class="recoil">${actor.name} ${mossa.contropartita}</p>`;
        }

        content += `</div>`;

        ChatMessage.create({
            content,
            speaker: ChatMessage.getSpeaker({actor})
        });
    }

    /**
     * Applica batoste
     */
    static async applicaBatoste(actor, numero) {
        const current = this.batoste.get(actor.id) || 0;
        const nuovo = current + numero;
        this.batoste.set(actor.id, nuovo);

        ChatMessage.create({
            content: `<div class="brancalonia batoste">
                <p>${actor.name} prende ${numero} Batost${numero > 1 ? 'e' : 'a'}!</p>
                <p class="batoste-total">Totale: ${nuovo}/6</p>
                ${nuovo >= 6 ? '<p class="ko">💫 KO! 💫</p>' : ''}
            </div>`,
            speaker: {alias: "Rissa"}
        });

        if (nuovo >= 6) {
            await this.ko(actor);
        }
    }

    /**
     * KO di un partecipante
     */
    static async ko(actor) {
        // Rimuovi dalla rissa
        this.partecipanti.delete(actor.id);

        // Applica incosciente
        const effect = {
            name: "KO da Rissa",
            icon: "icons/svg/unconscious.svg",
            duration: {rounds: 10},
            statuses: ["unconscious"],
            changes: [],
            flags: {
                brancalonia: {
                    rissaKO: true
                }
            }
        };

        await actor.createEmbeddedDocuments("ActiveEffect", [effect]);

        // Controlla fine rissa
        if (this.partecipanti.size <= 1) {
            await this.fineRissa();
        }
    }

    /**
     * Fine della rissa
     */
    static async fineRissa() {
        this.rissaAttiva = false;

        const vincitore = this.partecipanti.size === 1
            ? game.actors.get(Array.from(this.partecipanti)[0])
            : null;

        ChatMessage.create({
            content: `<div class="brancalonia rissa-end">
                <h2>🏆 FINE DELLA RISSA! 🏆</h2>
                ${vincitore
                    ? `<p class="winner">Vincitore: <strong>${vincitore.name}</strong>!</p>`
                    : `<p>Pareggio! Tutti KO!</p>`}
                <p>I partecipanti si rialzano doloranti...</p>
            </div>`,
            speaker: {alias: "Rissa"}
        });

        // Rimuovi effetti rissa
        for (const actor of game.actors) {
            const effects = actor.effects.filter(e => e.flags?.brancalonia?.rissa);
            if (effects.length > 0) {
                const ids = effects.map(e => e.id);
                await actor.deleteEmbeddedDocuments("ActiveEffect", ids);
            }
        }

        // Reset batoste
        this.batoste.clear();
    }
}

/**
 * Aggiungi controlli UI per le risse
 */
Hooks.on("renderChatMessage", (message, html, data) => {
    // Aggiungi bottoni per mosse rissa se in rissa
    if (RissaTaverna.rissaAttiva && game.user.character) {
        if (RissaTaverna.partecipanti.has(game.user.character.id)) {
            const buttons = `
                <div class="rissa-actions">
                    <button class="rissa-move" data-move="pugno">👊 Pugno</button>
                    <button class="rissa-move" data-move="spinta">🤚 Spinta</button>
                    <button class="rissa-move" data-move="testata">🤕 Testata</button>
                    <button class="rissa-move" data-move="oggettoImprovvisato">🪑 Oggetto</button>
                </div>`;

            html.find(".message-content").append(buttons);

            html.find(".rissa-move").click((event) => {
                const move = event.currentTarget.dataset.move;
                const target = game.user.targets.first();
                RissaTaverna.eseguiMossa(game.user.character, move, target);
            });
        }
    }
});

/**
 * Comando chat per iniziare rissa
 */
Hooks.on("chatMessage", (html, content, msg) => {
    if (content === "/rissa") {
        if (game.user.isGM) {
            RissaTaverna.iniziaRissa();
        } else {
            ui.notifications.warn("Solo il GM può iniziare una rissa");
        }
        return false;
    }

    if (content === "/finerissa") {
        if (game.user.isGM) {
            RissaTaverna.fineRissa();
        }
        return false;
    }
});

/**
 * CSS per le risse
 */
Hooks.once("ready", () => {
    const style = document.createElement("style");
    style.innerHTML = `
        .brancalonia.rissa-start {
            background: linear-gradient(135deg, #6d4c41 0%, #8d6e63 100%);
            color: white;
            padding: 15px;
            border: 3px solid #5d4037;
            border-radius: 10px;
            text-align: center;
        }

        .brancalonia.rissa-start h2 {
            color: #ffeb3b;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            margin-bottom: 10px;
        }

        .rissa-rules {
            background: rgba(0,0,0,0.3);
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
            text-align: left;
        }

        .brancalonia.rissa-move {
            background: #fff3e0;
            border: 2px solid #ff6f00;
            padding: 10px;
            border-radius: 5px;
        }

        .rissa-move .hit {
            color: #2e7d32;
            font-weight: bold;
        }

        .rissa-move .miss {
            color: #757575;
            font-style: italic;
        }

        .rissa-move .effect {
            color: #1565c0;
            font-style: italic;
        }

        .brancalonia.batoste {
            background: #ffcdd2;
            border: 2px solid #d32f2f;
            padding: 8px;
            border-radius: 5px;
        }

        .batoste-total {
            font-size: 1.2em;
            font-weight: bold;
            color: #b71c1c;
        }

        .batoste .ko {
            font-size: 1.5em;
            color: #ff5722;
            animation: knockout 0.5s ease-out;
        }

        .rissa-actions {
            display: flex;
            gap: 5px;
            margin-top: 10px;
        }

        .rissa-move {
            flex: 1;
            padding: 5px;
            background: #8d6e63;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }

        .rissa-move:hover {
            background: #6d4c41;
        }

        @keyframes knockout {
            0% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.3) rotate(10deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
    `;
    document.head.appendChild(style);

    console.log("Brancalonia | Sistema Risse da Taverna caricato");
});

// Esporta per altri moduli
window.BrancaloniaRissa = RissaTaverna;