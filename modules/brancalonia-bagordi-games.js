/**
 * Sistema Bagordi di Brancalonia
 * Giochi da taverna e competizioni goliardiche
 */

Hooks.once("init", () => {
    console.log("Brancalonia | Inizializzazione Sistema Bagordi");

    CONFIG.BRANCALONIA = CONFIG.BRANCALONIA || {};
    CONFIG.BRANCALONIA.bagordi = {
        giochi: [
            "Gara di Mangiate",
            "Gara di Bevute",
            "Braccio di Ferro",
            "Lancio dei Coltelli",
            "Minchiate (carte)",
            "Zara (dadi)",
            "Giostra dei Poveri"
        ],
        premi: {
            primo: "3d6 monete d'argento",
            secondo: "1d6 monete d'argento",
            consolazione: "Una pacca sulla spalla"
        }
    };
});

/**
 * Classe principale per i Bagordi
 */
class Bagordi {
    /**
     * Gara di Mangiate
     */
    static async garaMangiate(partecipanti) {
        const risultati = [];

        ChatMessage.create({
            content: `<div class="brancalonia bagordo-start">
                <h2>🍖 GARA DI MANGIATE! 🍖</h2>
                <p>Chi riuscirà a mangiare di più?</p>
                <p>Partecipanti: ${partecipanti.length}</p>
            </div>`
        });

        // Ogni partecipante fa un tiro di Costituzione
        for (const actor of partecipanti) {
            const roll = await actor.rollAbilityTest("con", {
                flavor: `${actor.name} - Gara di Mangiate`
            });

            risultati.push({
                actor: actor,
                totale: roll.total,
                critico: roll.dice[0].results[0].result === 20
            });

            // Effetti collaterali
            if (roll.dice[0].results[0].result === 1) {
                ChatMessage.create({
                    content: `<p class="fail">${actor.name} sta male e vomita tutto! 🤢</p>`,
                    speaker: {alias: "Bagordo"}
                });
            }
        }

        // Ordina risultati
        risultati.sort((a, b) => b.totale - a.totale);

        // Annuncia vincitori
        await this.annunciaVincitori(risultati, "Gara di Mangiate");
    }

    /**
     * Gara di Bevute
     */
    static async garaBevute(partecipanti) {
        const risultati = [];
        const turni = 5; // 5 turni di bevute

        ChatMessage.create({
            content: `<div class="brancalonia bagordo-start">
                <h2>🍺 GARA DI BEVUTE! 🍺</h2>
                <p>Chi reggerà più alcol?</p>
                <p>Partecipanti: ${partecipanti.length}</p>
            </div>`
        });

        for (let turno = 1; turno <= turni; turno++) {
            ChatMessage.create({
                content: `<h3>Round ${turno}!</h3>`
            });

            for (const actor of partecipanti) {
                // CD aumenta ogni turno
                const cd = 10 + (turno * 2);
                const save = await actor.rollAbilitySave("con", {
                    targetValue: cd,
                    flavor: `${actor.name} - Round ${turno} (CD ${cd})`
                });

                if (save.total < cd) {
                    ChatMessage.create({
                        content: `<p class="drunk">${actor.name} crolla ubriaco! 🥴</p>`
                    });

                    // Applica ubriachezza
                    await this.applicaUbriachezza(actor);

                    // Rimuovi dai partecipanti
                    const index = partecipanti.indexOf(actor);
                    if (index > -1) partecipanti.splice(index, 1);
                }
            }

            if (partecipanti.length <= 1) break;
        }

        // Vincitore è chi rimane
        if (partecipanti.length > 0) {
            ChatMessage.create({
                content: `<div class="brancalonia bagordo-winner">
                    <h3>🏆 Vincitore: ${partecipanti[0].name}! 🏆</h3>
                </div>`
            });
        }
    }

    /**
     * Braccio di Ferro
     */
    static async braccioFerro(sfidante1, sfidante2) {
        ChatMessage.create({
            content: `<div class="brancalonia bagordo-start">
                <h2>💪 BRACCIO DI FERRO! 💪</h2>
                <p>${sfidante1.name} VS ${sfidante2.name}</p>
            </div>`
        });

        let punti1 = 0, punti2 = 0;
        const target = 3; // Vince chi arriva a 3

        while (punti1 < target && punti2 < target) {
            // Prova contrapposta di Forza (Atletica)
            const roll1 = await sfidante1.rollSkill("ath", {
                flavor: `${sfidante1.name} - Braccio di Ferro`
            });

            const roll2 = await sfidante2.rollSkill("ath", {
                flavor: `${sfidante2.name} - Braccio di Ferro`
            });

            if (roll1.total > roll2.total) {
                punti1++;
                ChatMessage.create({
                    content: `<p>${sfidante1.name} guadagna terreno! (${punti1}-${punti2})</p>`
                });
            } else if (roll2.total > roll1.total) {
                punti2++;
                ChatMessage.create({
                    content: `<p>${sfidante2.name} guadagna terreno! (${punti1}-${punti2})</p>`
                });
            } else {
                ChatMessage.create({
                    content: `<p>Pareggio! Le braccia tremano!</p>`
                });
            }
        }

        const vincitore = punti1 >= target ? sfidante1 : sfidante2;
        ChatMessage.create({
            content: `<div class="brancalonia bagordo-winner">
                <h3>🏆 ${vincitore.name} vince il Braccio di Ferro! 🏆</h3>
            </div>`
        });
    }

    /**
     * Minchiate (Gioco di carte)
     */
    static async minchiate(partecipanti) {
        ChatMessage.create({
            content: `<div class="brancalonia bagordo-start">
                <h2>🃏 MINCHIATE! 🃏</h2>
                <p>Gioco di carte della tradizione!</p>
                <p>Partecipanti: ${partecipanti.length}</p>
            </div>`
        });

        const risultati = [];

        for (const actor of partecipanti) {
            // Tiro di Intelligenza (con competenza in giochi)
            const hasGamingSet = actor.items.find(i =>
                i.type === "tool" && i.name.includes("Gaming")
            );

            const bonus = hasGamingSet ? actor.system.attributes.prof : 0;

            const roll = await new Roll(
                `1d20 + @abilities.int.mod + ${bonus}`,
                actor.getRollData()
            ).evaluate();

            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({actor}),
                flavor: `${actor.name} - Minchiate`
            });

            // Possibilità di barare (Sleight of Hand)
            if (roll.dice[0].results[0].result <= 5) {
                const cheatRoll = await actor.rollSkill("slt", {
                    flavor: `${actor.name} tenta di barare!`
                });

                if (cheatRoll.total >= 15) {
                    roll.total += 5;
                    ChatMessage.create({
                        content: `<p class="cheat">${actor.name} bara con successo! 🎭</p>`,
                        whisper: [game.user]
                    });
                } else {
                    ChatMessage.create({
                        content: `<p class="caught">${actor.name} viene beccato a barare! Squalificato! 😤</p>`
                    });
                    continue;
                }
            }

            risultati.push({
                actor: actor,
                totale: roll.total
            });
        }

        // Ordina e annuncia vincitori
        risultati.sort((a, b) => b.totale - a.totale);
        await this.annunciaVincitori(risultati, "Minchiate");
    }

    /**
     * Giostra dei Poveri
     */
    static async giostraPoveri(partecipanti) {
        ChatMessage.create({
            content: `<div class="brancalonia bagordo-start">
                <h2>🐴 GIOSTRA DEI POVERI! 🐴</h2>
                <p>Con scope e secchi invece di lance e cavalli!</p>
                <p>Partecipanti: ${partecipanti.length}</p>
            </div>`
        });

        const risultati = [];

        for (const actor of partecipanti) {
            // Tiro di Destrezza per colpire
            const hitRoll = await actor.rollAbilityTest("dex", {
                flavor: `${actor.name} - Attacco con la scopa`
            });

            // Tiro di Forza per restare in sella
            const balanceRoll = await actor.rollAbilitySave("str", {
                targetValue: 12,
                flavor: `${actor.name} - Equilibrio sul secchio`
            });

            const totale = hitRoll.total + (balanceRoll.total >= 12 ? 5 : 0);

            risultati.push({
                actor: actor,
                totale: totale,
                caduto: balanceRoll.total < 12
            });

            if (balanceRoll.total < 12) {
                ChatMessage.create({
                    content: `<p class="fall">${actor.name} cade dal secchio! 🪣</p>`
                });
            }
        }

        risultati.sort((a, b) => b.totale - a.totale);
        await this.annunciaVincitori(risultati, "Giostra dei Poveri");
    }

    /**
     * Annuncia vincitori
     */
    static async annunciaVincitori(risultati, gioco) {
        let content = `<div class="brancalonia bagordo-results">
            <h3>Risultati ${gioco}</h3>`;

        for (let i = 0; i < Math.min(3, risultati.length); i++) {
            const posto = i + 1;
            const premio = posto === 1 ? "3d6 ma"
                        : posto === 2 ? "1d6 ma"
                        : "Una pacca sulla spalla";

            content += `<p class="place-${posto}">
                ${posto}° posto: <strong>${risultati[i].actor.name}</strong>
                (${risultati[i].totale}) - Premio: ${premio}
            </p>`;

            // Assegna premio
            if (posto <= 2) {
                const roll = await new Roll(posto === 1 ? "3d6" : "1d6").evaluate();
                await roll.toMessage({
                    speaker: {alias: "Premio"},
                    flavor: `${risultati[i].actor.name} vince ${roll.total} monete d'argento!`
                });
            }
        }

        content += `</div>`;
        ChatMessage.create({content});
    }

    /**
     * Applica effetto ubriachezza
     */
    static async applicaUbriachezza(actor) {
        const effect = {
            name: "Ubriaco",
            icon: "icons/consumables/drinks/alcohol-beer-stein-wooden-metal-brown.webp",
            duration: {hours: 4},
            changes: [
                {
                    key: "system.abilities.dex.value",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "-2",
                    priority: 20
                },
                {
                    key: "system.abilities.int.value",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "-2",
                    priority: 20
                },
                {
                    key: "system.abilities.wis.value",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "-2",
                    priority: 20
                }
            ],
            flags: {
                brancalonia: {
                    ubriaco: true
                }
            }
        };

        await actor.createEmbeddedDocuments("ActiveEffect", [effect]);
    }
}

/**
 * Comandi Chat
 */
Hooks.on("chatMessage", (html, content, msg) => {
    const args = content.split(" ");
    const command = args[0];

    if (command === "/bagordo") {
        if (!game.user.isGM) {
            ui.notifications.warn("Solo il GM può iniziare i bagordi");
            return false;
        }

        const gioco = args[1];
        const partecipanti = canvas.tokens.controlled.map(t => t.actor);

        if (partecipanti.length === 0) {
            ui.notifications.warn("Seleziona i partecipanti!");
            return false;
        }

        switch(gioco) {
            case "mangiate":
                Bagordi.garaMangiate(partecipanti);
                break;
            case "bevute":
                Bagordi.garaBevute(partecipanti);
                break;
            case "braccioferro":
                if (partecipanti.length === 2) {
                    Bagordi.braccioFerro(partecipanti[0], partecipanti[1]);
                } else {
                    ui.notifications.warn("Braccio di ferro richiede esattamente 2 partecipanti");
                }
                break;
            case "minchiate":
                Bagordi.minchiate(partecipanti);
                break;
            case "giostra":
                Bagordi.giostraPoveri(partecipanti);
                break;
            default:
                ChatMessage.create({
                    content: `<div class="brancalonia">
                        <h3>Bagordi disponibili:</h3>
                        <ul>
                            <li>/bagordo mangiate</li>
                            <li>/bagordo bevute</li>
                            <li>/bagordo braccioferro</li>
                            <li>/bagordo minchiate</li>
                            <li>/bagordo giostra</li>
                        </ul>
                    </div>`,
                    whisper: [game.user]
                });
        }

        return false;
    }
});

/**
 * CSS per Bagordi
 */
Hooks.once("ready", () => {
    const style = document.createElement("style");
    style.innerHTML = `
        .brancalonia.bagordo-start {
            background: linear-gradient(135deg, #ff6f00 0%, #ffb300 100%);
            color: white;
            padding: 15px;
            border: 3px solid #e65100;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 8px rgba(230, 81, 0, 0.3);
        }

        .brancalonia.bagordo-start h2 {
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            margin-bottom: 10px;
        }

        .brancalonia.bagordo-results {
            background: #fff8e1;
            border: 2px solid #ff6f00;
            padding: 12px;
            border-radius: 8px;
        }

        .bagordo-results .place-1 {
            color: #ffc107;
            font-size: 1.3em;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
        }

        .bagordo-results .place-2 {
            color: #9e9e9e;
            font-size: 1.1em;
        }

        .bagordo-results .place-3 {
            color: #8d6e63;
        }

        .brancalonia.bagordo-winner {
            background: radial-gradient(circle, #fff59d 0%, #ffc107 100%);
            border: 3px solid #f57c00;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            animation: winner 1s ease-in-out;
        }

        .bagordo-winner h3 {
            color: #e65100;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .drunk {
            color: #7b1fa2;
            font-style: italic;
            animation: wobble 0.5s;
        }

        .fall {
            color: #d32f2f;
            font-weight: bold;
        }

        .cheat {
            color: #388e3c;
            font-style: italic;
        }

        .caught {
            color: #d32f2f;
            font-weight: bold;
            background: #ffcdd2;
            padding: 4px;
            border-radius: 4px;
        }

        @keyframes winner {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        @keyframes wobble {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);

    console.log("Brancalonia | Sistema Bagordi caricato");
});

// Esporta per altri moduli
window.BrancaloniaBagordi = Bagordi;