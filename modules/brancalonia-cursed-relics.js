/**
 * Sistema Cimeli Maledetti di Brancalonia
 * Gestisce gli oggetti magici con benedizioni e maledizioni
 */

Hooks.once("init", () => {
    console.log("Brancalonia | Inizializzazione Sistema Cimeli Maledetti");

    // Registra proprietà personalizzate
    CONFIG.DND5E.itemProperties.cimelo = {
        label: "Cimelo",
        abbr: "CIM"
    };

    CONFIG.DND5E.itemProperties.maledetto = {
        label: "Maledetto",
        abbr: "MAL"
    };
});

/**
 * Classe per gestire i Cimeli
 */
class CimeliMaledetti {
    static cimeli = new Map();

    /**
     * Inizializza il database dei cimeli
     */
    static async init() {
        // Carica cimeli dal compendium
        const pack = game.packs.get("brancalonia-bigat.equipaggiamento");
        if (!pack) return;

        const items = await pack.getDocuments();
        items.forEach(item => {
            if (item.flags?.brancalonia?.categoria === "cimelo") {
                this.cimeli.set(item.name, {
                    proprieta: item.flags.brancalonia.proprieta_originale,
                    maledizione: item.flags.brancalonia.maledizione,
                    storia: item.flags.brancalonia.storia
                });
            }
        });

        console.log(`Brancalonia | Caricati ${this.cimeli.size} cimeli`);
    }

    /**
     * Applica effetti del cimelo
     */
    static applicaEffetti(actor, item) {
        if (!item.flags?.brancalonia?.categoria === "cimelo") return;

        const effects = [];

        // Effetto benedizione
        if (item.flags.brancalonia.proprieta_originale) {
            effects.push({
                name: `${item.name} - Benedizione`,
                icon: "icons/magic/holy/angel-wings-gray.webp",
                origin: item.uuid,
                duration: {},
                disabled: false,
                transfer: true,
                changes: this.parseBenedizione(item.flags.brancalonia.proprieta_originale)
            });
        }

        // Effetto maledizione
        if (item.flags.brancalonia.maledizione) {
            effects.push({
                name: `${item.name} - Maledizione`,
                icon: "icons/magic/unholy/silhouette-horned-evil.webp",
                origin: item.uuid,
                duration: {},
                disabled: false,
                transfer: true,
                changes: this.parseMaledizione(item.flags.brancalonia.maledizione),
                flags: {
                    brancalonia: {
                        maledizione: true,
                        nonRimovibile: true
                    }
                }
            });
        }

        return effects;
    }

    /**
     * Converte descrizione benedizione in changes per ActiveEffect
     */
    static parseBenedizione(desc) {
        const changes = [];

        // Esempi di parsing comuni
        if (desc.includes("vantaggio") && desc.includes("Inganno")) {
            changes.push({
                key: "flags.dnd5e.advantage.skill.dec",
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: "1",
                priority: 20
            });
        }

        if (desc.includes("+1") && desc.includes("Carisma")) {
            changes.push({
                key: "system.abilities.cha.bonuses.check",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: "1",
                priority: 20
            });
        }

        if (desc.includes("resistenza") && desc.includes("veleno")) {
            changes.push({
                key: "system.traits.dr.value",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: "poison",
                priority: 20
            });
        }

        return changes;
    }

    /**
     * Converte descrizione maledizione in changes per ActiveEffect
     */
    static parseMaledizione(desc) {
        const changes = [];

        // Esempi di parsing comuni
        if (desc.includes("svantaggio") && desc.includes("TS")) {
            if (desc.includes("divini")) {
                changes.push({
                    key: "flags.dnd5e.disadvantage.save.all",
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: "divini",
                    priority: 20
                });
            }
        }

        if (desc.includes("-1") && desc.includes("Forza")) {
            changes.push({
                key: "system.abilities.str.value",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: "-1",
                priority: 20
            });
        }

        if (desc.includes("vulnerabilità") && desc.includes("fuoco")) {
            changes.push({
                key: "system.traits.dv.value",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: "fire",
                priority: 20
            });
        }

        return changes;
    }

    /**
     * Tira per cimelo casuale
     */
    static async tiraCimelo() {
        const roll = await new Roll("1d100").evaluate();
        await roll.toMessage({
            flavor: "Tiro Cimelo Casuale"
        });

        // Trova cimelo corrispondente
        const cimeloId = Math.min(50, Math.floor(roll.total / 2) + 1);
        const cimeloKey = String(cimeloId).padStart(3, '0');

        // Cerca nel compendium
        const pack = game.packs.get("brancalonia-bigat.equipaggiamento");
        const items = await pack.getDocuments();
        const cimelo = items.find(i =>
            i.flags?.brancalonia?.id_originale?.startsWith(cimeloKey)
        );

        if (cimelo) {
            ChatMessage.create({
                content: `<div class="brancalonia cimelo-roll">
                    <h3>Cimelo Trovato!</h3>
                    <p class="cimelo-name">${cimelo.name}</p>
                    <p class="cimelo-desc">${cimelo.flags.brancalonia.storia || ""}</p>
                    <div class="cimelo-effects">
                        <p><strong>Benedizione:</strong> ${cimelo.flags.brancalonia.proprieta_originale}</p>
                        <p><strong>Maledizione:</strong> ${cimelo.flags.brancalonia.maledizione}</p>
                    </div>
                </div>`,
                speaker: ChatMessage.getSpeaker()
            });

            return cimelo;
        }
    }
}

/**
 * Hook per quando un cimelo viene equipaggiato
 */
Hooks.on("updateItem", async (item, changes, options, userId) => {
    if (!item.parent || item.parent.documentName !== "Actor") return;
    if (!item.flags?.brancalonia?.categoria === "cimelo") return;
    if (changes.system?.equipped === undefined) return;

    const actor = item.parent;

    if (changes.system.equipped) {
        // Equipaggiato - applica effetti
        const effects = CimeliMaledetti.applicaEffetti(actor, item);
        if (effects.length > 0) {
            await actor.createEmbeddedDocuments("ActiveEffect", effects);

            ChatMessage.create({
                content: `<div class="brancalonia cimelo-equipped">
                    <h3>${item.name} Equipaggiato</h3>
                    <p class="warning">La maledizione è ora attiva!</p>
                </div>`,
                speaker: ChatMessage.getSpeaker({actor}),
                whisper: [game.user]
            });
        }
    } else {
        // Non equipaggiato - rimuovi solo benedizione (maledizione resta!)
        const effects = actor.effects.filter(e =>
            e.origin === item.uuid && !e.flags?.brancalonia?.maledizione
        );

        if (effects.length > 0) {
            const ids = effects.map(e => e.id);
            await actor.deleteEmbeddedDocuments("ActiveEffect", ids);
        }

        // Avvisa che la maledizione persiste
        const cursed = actor.effects.find(e =>
            e.origin === item.uuid && e.flags?.brancalonia?.maledizione
        );

        if (cursed) {
            ChatMessage.create({
                content: `<div class="brancalonia cimelo-curse">
                    <h3>Maledizione Persistente!</h3>
                    <p>La maledizione di <strong>${item.name}</strong> continua a tormentarti...</p>
                    <p class="hint">Solo magia potente può rimuovere questa maledizione</p>
                </div>`,
                speaker: ChatMessage.getSpeaker({actor}),
                whisper: [game.user]
            });
        }
    }
});

/**
 * Hook per identificazione cimeli
 */
Hooks.on("renderItemSheet", (app, html, data) => {
    const item = app.object;

    if (item.flags?.brancalonia?.categoria !== "cimelo") return;

    // Mostra info cimelo
    const cimeloInfo = `
        <div class="brancalonia-cimelo-info">
            <h3 class="cimelo-header">⚜️ Cimelo Maledetto ⚜️</h3>
            <div class="cimelo-story">
                <label>Storia:</label>
                <p>${item.flags.brancalonia.storia || "Sconosciuta"}</p>
            </div>
            <div class="cimelo-blessing">
                <label>Benedizione:</label>
                <p>${item.flags.brancalonia.proprieta_originale || "Da scoprire"}</p>
            </div>
            <div class="cimelo-curse">
                <label>Maledizione:</label>
                <p>${item.flags.brancalonia.maledizione || "Da scoprire"}</p>
            </div>
        </div>`;

    html.find(".tab.details").prepend(cimeloInfo);
});

/**
 * Comando chat per tirare cimelo casuale
 */
Hooks.on("chatMessage", (html, content, msg) => {
    if (content === "/cimelo") {
        CimeliMaledetti.tiraCimelo();
        return false;
    }
});

/**
 * Inizializza al ready
 */
Hooks.once("ready", async () => {
    await CimeliMaledetti.init();

    // Aggiungi CSS
    const style = document.createElement("style");
    style.innerHTML = `
        .brancalonia-cimelo-info {
            background: linear-gradient(135deg, #f4e4c1 0%, #e8d4a1 100%);
            border: 2px solid #8b4513;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            box-shadow: 0 2px 4px rgba(139, 69, 19, 0.3);
        }

        .cimelo-header {
            color: #5c3317;
            text-align: center;
            font-family: serif;
            margin-bottom: 10px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }

        .cimelo-story {
            font-style: italic;
            color: #6b4423;
            margin-bottom: 8px;
            padding: 8px;
            background: rgba(255,255,255,0.5);
            border-radius: 4px;
        }

        .cimelo-blessing {
            color: #2e7d32;
            margin-bottom: 8px;
            padding: 8px;
            background: rgba(76, 175, 80, 0.1);
            border-left: 3px solid #4caf50;
        }

        .cimelo-curse {
            color: #b71c1c;
            padding: 8px;
            background: rgba(244, 67, 54, 0.1);
            border-left: 3px solid #f44336;
        }

        .brancalonia.cimelo-roll {
            background: #f4e4c1;
            border: 2px solid #8b4513;
            padding: 12px;
            border-radius: 8px;
        }

        .cimelo-name {
            font-size: 1.2em;
            font-weight: bold;
            color: #5c3317;
            margin: 8px 0;
        }

        .cimelo-desc {
            font-style: italic;
            color: #6b4423;
            margin-bottom: 10px;
        }

        .cimelo-effects {
            border-top: 1px solid #8b4513;
            padding-top: 8px;
        }

        .brancalonia.cimelo-equipped .warning {
            color: #ff6b35;
            font-weight: bold;
            animation: pulse 2s infinite;
        }

        .brancalonia.cimelo-curse {
            background: linear-gradient(135deg, #ffebee 0%, #ef9a9a 100%);
            border: 2px solid #c62828;
            padding: 12px;
            border-radius: 8px;
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    console.log("Brancalonia | Sistema Cimeli Maledetti pronto");
});

// Esporta per uso in altri moduli
window.BrancaloniaCimeli = CimeliMaledetti;