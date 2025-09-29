/**
 * Sistema Menagramo di Brancalonia
 * Gestisce il patrono Warlock della sfortuna e maledizioni
 */

Hooks.once("init", () => {
    console.log("Brancalonia | Inizializzazione Sistema Menagramo");

    // Registra nuovi tipi di maledizioni
    CONFIG.BRANCALONIA = CONFIG.BRANCALONIA || {};
    CONFIG.BRANCALONIA.maledizioni = {
        minori: [
            "Inciampi continuamente (-5 ft movimento)",
            "Le monete ti scivolano dalle mani (svantaggio a Sleight of Hand)",
            "Attiri insetti fastidiosi (svantaggio a Persuasione)",
            "Rompi oggetti fragili al tocco",
            "Il cibo ti va sempre di traverso"
        ],
        maggiori: [
            "Fallimento critico con 1-2",
            "Vulnerabilità a un tipo di danno casuale",
            "Non puoi riposare bene (1 solo dado vita per riposo lungo)",
            "Le armi ti si rompono con 1 naturale",
            "Svantaggio a tutti i TS per 24 ore"
        ]
    };
});

/**
 * Classe Menagramo - Patrono Warlock
 */
class Menagramo {
    /**
     * Iattura - maledizione base del Menagramo
     */
    static async iattura(caster, target) {
        if (!target) {
            ui.notifications.warn("Seleziona un bersaglio per la Iattura");
            return;
        }

        // Tiro salvezza Saggezza
        const dc = 8 + caster.system.attributes.prof + caster.system.abilities.cha.mod;
        const save = await target.actor.rollAbilitySave("wis", {
            targetValue: dc,
            flavor: "TS contro Iattura del Menagramo"
        });

        if (save.total < dc) {
            // Fallito - applica sfortuna
            const effect = {
                name: "Iattura del Menagramo",
                icon: "icons/magic/unholy/orb-beam-pink.webp",
                duration: {
                    rounds: 10,
                    startRound: game.combat?.round || 0
                },
                changes: [
                    {
                        key: "flags.dnd5e.disadvantage.attack.all",
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: "1",
                        priority: 20
                    },
                    {
                        key: "flags.dnd5e.disadvantage.save.all",
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: "1",
                        priority: 20
                    }
                ],
                flags: {
                    brancalonia: {
                        menagramo: true,
                        iattura: true
                    }
                }
            };

            await target.actor.createEmbeddedDocuments("ActiveEffect", [effect]);

            ChatMessage.create({
                content: `<div class="brancalonia menagramo-curse">
                    <h3>🎲 Iattura del Menagramo! 🎲</h3>
                    <p><strong>${target.name}</strong> è perseguitato dalla sfortuna!</p>
                    <p class="effect-desc">Svantaggio a tutti i tiri per colpire e tiri salvezza per 1 minuto</p>
                </div>`,
                speaker: ChatMessage.getSpeaker({actor: caster})
            });
        } else {
            ChatMessage.create({
                content: `<div class="brancalonia menagramo-resist">
                    <p><strong>${target.name}</strong> resiste alla Iattura!</p>
                </div>`,
                speaker: ChatMessage.getSpeaker({actor: caster})
            });
        }
    }

    /**
     * Tocco della Malasorte - capacità di 6° livello
     */
    static async toccoMalasorte(caster, target) {
        if (!target) {
            ui.notifications.warn("Seleziona un bersaglio per il Tocco della Malasorte");
            return;
        }

        // Applica maledizione casuale
        const maledizioni = CONFIG.BRANCALONIA.maledizioni.minori;
        const maledizione = maledizioni[Math.floor(Math.random() * maledizioni.length)];

        const effect = {
            name: "Tocco della Malasorte",
            icon: "icons/magic/unholy/hand-claw-glow-purple.webp",
            duration: {
                seconds: 3600 // 1 ora
            },
            description: maledizione,
            changes: this.parseMaledizione(maledizione),
            flags: {
                brancalonia: {
                    menagramo: true,
                    toccoMalasorte: true,
                    maledizione: maledizione
                }
            }
        };

        await target.actor.createEmbeddedDocuments("ActiveEffect", [effect]);

        ChatMessage.create({
            content: `<div class="brancalonia menagramo-touch">
                <h3>☠️ Tocco della Malasorte! ☠️</h3>
                <p><strong>${target.name}</strong> è afflitto da:</p>
                <p class="curse-desc">"${maledizione}"</p>
                <p class="duration">Durata: 1 ora</p>
            </div>`,
            speaker: ChatMessage.getSpeaker({actor: caster})
        });
    }

    /**
     * Converte descrizione maledizione in changes
     */
    static parseMaledizione(desc) {
        const changes = [];

        if (desc.includes("movimento")) {
            changes.push({
                key: "system.attributes.movement.walk",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: "-5",
                priority: 20
            });
        }

        if (desc.includes("svantaggio") && desc.includes("Sleight")) {
            changes.push({
                key: "flags.dnd5e.disadvantage.skill.slt",
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: "1",
                priority: 20
            });
        }

        if (desc.includes("svantaggio") && desc.includes("Persuasione")) {
            changes.push({
                key: "flags.dnd5e.disadvantage.skill.per",
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: "1",
                priority: 20
            });
        }

        return changes;
    }

    /**
     * Lista ampliata incantesimi Menagramo
     */
    static incantesimiAmpliati = {
        1: ["bane", "hex"],
        2: ["blindness/deafness", "silence"],
        3: ["bestow curse", "remove curse"],
        4: ["phantasmal killer", "polymorph"],
        5: ["geas", "modify memory"]
    };

    /**
     * Invocazioni specifiche del Menagramo
     */
    static invocazioni = {
        "Sguardo del Malocchio": {
            livello: 1,
            descrizione: "Puoi lanciare Hex una volta per riposo breve senza usare slot",
            effect: async (actor) => {
                const hex = actor.items.find(i => i.name === "Hex");
                if (hex) {
                    await hex.update({"system.uses.value": 1, "system.uses.per": "sr"});
                }
            }
        },
        "Portatore di Sventura": {
            livello: 5,
            descrizione: "Quando colpisci con un attacco, puoi aggiungere 1d6 danni necrotici e il bersaglio ha svantaggio al prossimo TS",
            effect: async (actor) => {
                // Aggiunge flag per gestire in hook attacco
                await actor.setFlag("brancalonia", "portateSventura", true);
            }
        },
        "Aura di Iella": {
            livello: 7,
            descrizione: "I nemici entro 10 ft hanno -1 ai tiri per colpire contro di te",
            effect: async (actor) => {
                // Crea aura passiva
                const effect = {
                    name: "Aura di Iella",
                    icon: "icons/magic/unholy/orb-glowing-purple.webp",
                    duration: {},
                    changes: [{
                        key: "flags.brancalonia.auraIella",
                        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                        value: "true",
                        priority: 20
                    }]
                };
                await actor.createEmbeddedDocuments("ActiveEffect", [effect]);
            }
        }
    };
}

/**
 * Hook per aggiungere capacità Menagramo ai Warlock
 */
Hooks.on("createItem", async (item, options, userId) => {
    if (item.type !== "class" || item.name !== "Warlock") return;
    if (!item.parent || item.parent.documentName !== "Actor") return;

    const actor = item.parent;

    // Controlla se ha scelto Menagramo come patrono
    const patrono = actor.items.find(i =>
        i.type === "feat" && i.name?.includes("Menagramo")
    );

    if (patrono) {
        // Aggiungi capacità base
        const iattura = {
            name: "Iattura",
            type: "feat",
            img: "icons/magic/unholy/orb-beam-pink.webp",
            system: {
                description: {
                    value: `<p>Come azione bonus, puoi maledire una creatura entro 30 ft.
                            Il bersaglio deve superare un TS su Saggezza (CD ${8 + actor.system.attributes.prof + actor.system.abilities.cha.mod})
                            o avere svantaggio ai tiri per colpire e ai TS per 1 minuto.</p>
                            <p><strong>Utilizzi:</strong> 1 per riposo breve</p>`
                },
                activation: {
                    type: "bonus",
                    cost: 1
                },
                uses: {
                    value: 1,
                    max: 1,
                    per: "sr"
                },
                actionType: "save",
                save: {
                    ability: "wis",
                    dc: null,
                    scaling: "spell"
                }
            },
            flags: {
                brancalonia: {
                    menagramo: true,
                    iattura: true
                }
            }
        };

        await actor.createEmbeddedDocuments("Item", [iattura]);
    }
});

/**
 * Hook per livelli successivi del Menagramo
 */
HooksManager.on(HooksManager.HOOKS.UPDATE_ACTOR, async (actor, changes, options, userId) => {
    if (!changes.system?.details?.level) return;

    const warlock = actor.items.find(i => i.type === "class" && i.name === "Warlock");
    if (!warlock) return;

    const patrono = actor.items.find(i =>
        i.type === "feat" && i.name?.includes("Menagramo")
    );
    if (!patrono) return;

    const level = warlock.system.levels || 0;

    // Livello 6 - Tocco della Malasorte
    if (level >= 6 && !actor.items.find(i => i.name === "Tocco della Malasorte")) {
        const tocco = {
            name: "Tocco della Malasorte",
            type: "feat",
            img: "icons/magic/unholy/hand-claw-glow-purple.webp",
            system: {
                description: {
                    value: `<p>Quando colpisci una creatura con un attacco in mischia,
                            puoi usare questa capacità per infliggere una maledizione minore per 1 ora.</p>
                            <p><strong>Utilizzi:</strong> 1 per riposo lungo</p>`
                },
                activation: {
                    type: "special",
                    cost: 0
                },
                uses: {
                    value: 1,
                    max: 1,
                    per: "lr"
                }
            },
            flags: {
                brancalonia: {
                    menagramo: true,
                    toccoMalasorte: true
                }
            }
        };

        await actor.createEmbeddedDocuments("Item", [tocco]);
    }
});

/**
 * Hook per gestire utilizzo capacità Menagramo
 */
Hooks.on("dnd5e.useItem", (item, config, options) => {
    const actor = item.parent;

    if (item.flags?.brancalonia?.iattura) {
        const target = game.user.targets.first();
        if (target) {
            Menagramo.iattura(actor, target);
        }
        return false; // Previene uso normale
    }

    if (item.flags?.brancalonia?.toccoMalasorte) {
        const target = game.user.targets.first();
        if (target) {
            Menagramo.toccoMalasorte(actor, target);
        }
        return false;
    }
});

/**
 * CSS per effetti Menagramo
 */
Hooks.once("ready", () => {
    const style = document.createElement("style");
    style.innerHTML = `
        .brancalonia.menagramo-curse {
            background: linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%);
            color: white;
            border: 2px solid #6a1b9a;
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(106, 27, 154, 0.4);
        }

        .brancalonia.menagramo-curse h3 {
            color: #fff;
            margin-bottom: 8px;
            text-align: center;
        }

        .brancalonia.menagramo-curse .effect-desc {
            background: rgba(0,0,0,0.2);
            padding: 8px;
            border-radius: 4px;
            font-style: italic;
        }

        .brancalonia.menagramo-touch {
            background: linear-gradient(135deg, #b71c1c 0%, #e91e63 100%);
            color: white;
            border: 2px solid #c62828;
            padding: 12px;
            border-radius: 8px;
        }

        .brancalonia.menagramo-touch .curse-desc {
            font-size: 1.1em;
            font-weight: bold;
            color: #ffeb3b;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            margin: 10px 0;
        }

        .brancalonia.menagramo-resist {
            background: #e8eaf6;
            border: 1px solid #3f51b5;
            padding: 8px;
            border-radius: 4px;
        }

        /* Animazione per maledizioni attive */
        .effect-control[data-effect-name*="Menagramo"] {
            animation: cursePulse 2s infinite;
        }

        @keyframes cursePulse {
            0%, 100% {
                filter: drop-shadow(0 0 2px purple);
            }
            50% {
                filter: drop-shadow(0 0 8px purple);
            }
        }
    `;
    document.head.appendChild(style);

    console.log("Brancalonia | Sistema Menagramo caricato");
});

// Esporta per altri moduli
window.BrancaloniaMenagramo = Menagramo;