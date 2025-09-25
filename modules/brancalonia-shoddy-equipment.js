/**
 * Sistema Oggetti Scadenti di Brancalonia
 * Gestisce gli oggetti di qualità scadente con penalità e difetti
 */

Hooks.once("init", () => {
    console.log("Brancalonia | Inizializzazione Sistema Oggetti Scadenti");

    // Registra flag per qualità scadente
    CONFIG.DND5E.itemProperties.shoddy = {
        label: "Scadente",
        abbr: "SCA"
    };
});

/**
 * Applica penalità per oggetti scadenti
 */
Hooks.on("dnd5e.preRollAttack", (item, config) => {
    if (!item?.flags?.brancalonia?.qualita_scadente) return;

    // Armi scadenti: -1 al tiro per colpire
    if (item.type === "weapon") {
        config.parts.push("-1");
        ui.notifications.info(`${item.name} è scadente: -1 al tiro per colpire`);
    }
});

Hooks.on("dnd5e.preRollDamage", (item, config) => {
    if (!item?.flags?.brancalonia?.qualita_scadente) return;

    // Armi scadenti: -1 ai danni
    if (item.type === "weapon") {
        config.parts.push("-1");
        ui.notifications.info(`${item.name} è scadente: -1 ai danni`);
    }
});

/**
 * Applica penalità AC per armature scadenti
 */
Hooks.on("dnd5e.computeAC", (actor, ac, config) => {
    const armor = actor.items.find(i =>
        i.type === "equipment" &&
        i.system.equipped &&
        i.system.armor?.value &&
        i.flags?.brancalonia?.qualita_scadente
    );

    if (armor) {
        ac.value -= 1;
        ac.breakdown.push("-1 (Armatura Scadente)");
    }
});

/**
 * Applica svantaggio per strumenti scadenti
 */
Hooks.on("dnd5e.preRollAbilityTest", (actor, config, abilityId) => {
    // Controlla se sta usando uno strumento scadente
    const tool = actor.items.find(i =>
        i.type === "tool" &&
        i.flags?.brancalonia?.qualita_scadente
    );

    if (tool && config.parts.includes(`@prof`)) {
        config.advantage = false;
        config.disadvantage = true;
        ui.notifications.warn(`${tool.name} è scadente: svantaggio alla prova`);
    }
});

/**
 * Difetti casuali per oggetti scadenti
 */
class DifettiScadenti {
    static difettiArmi = [
        "Perde il filo facilmente (-2 dopo 3 colpi)",
        "Impugnatura scivolosa (TS DES CD 10 o cade)",
        "Sbilanciata (critico solo con 20 naturale)",
        "Si rompe con 1 naturale",
        "Arrugginita (danno minimo sempre 1)"
    ];

    static difettiArmature = [
        "Cinghie allentate (-5 ft movimento)",
        "Punti deboli (critico con 19-20)",
        "Rumorosa (svantaggio a Furtività)",
        "Scomoda (1 livello esaustione dopo 8 ore)",
        "Fragile (si rompe se subisci critico)"
    ];

    static difettiStrumenti = [
        "Impreciso (tiri di 5 o meno falliscono sempre)",
        "Lento (tempo raddoppiato)",
        "Inaffidabile (1 su d6 si rompe dopo uso)",
        "Limitato (solo compiti semplici)",
        "Pericoloso (1 naturale causa 1d4 danni)"
    ];

    static assegnaDifetto(item) {
        let difetti;

        if (item.type === "weapon") difetti = this.difettiArmi;
        else if (item.system.armor?.value) difetti = this.difettiArmature;
        else if (item.type === "tool") difetti = this.difettiStrumenti;
        else return;

        const difetto = difetti[Math.floor(Math.random() * difetti.length)];

        item.update({
            "flags.brancalonia.difetto_scadente": difetto
        });

        ChatMessage.create({
            content: `<div class="brancalonia shoddy">
                <h3>${item.name}</h3>
                <p><strong>Difetto:</strong> ${difetto}</p>
            </div>`,
            speaker: ChatMessage.getSpeaker()
        });
    }
}

/**
 * UI per marcare oggetti come scadenti
 */
Hooks.on("renderItemSheet", (app, html, data) => {
    const item = app.object;

    // Solo per equipaggiamento
    if (!["weapon", "equipment", "tool"].includes(item.type)) return;

    // Aggiungi checkbox per qualità scadente
    const checkbox = `
        <div class="form-group">
            <label>
                <input type="checkbox" name="flags.brancalonia.qualita_scadente"
                       ${item.flags?.brancalonia?.qualita_scadente ? "checked" : ""}>
                Oggetto Scadente
            </label>
        </div>`;

    html.find(".tab.details").prepend(checkbox);

    // Mostra difetto se presente
    if (item.flags?.brancalonia?.difetto_scadente) {
        const difettoDiv = `
            <div class="form-group brancalonia-difetto">
                <label>Difetto Scadente</label>
                <p class="notes">${item.flags.brancalonia.difetto_scadente}</p>
            </div>`;
        html.find(".tab.details").append(difettoDiv);
    }

    // Listener per checkbox
    html.find('input[name="flags.brancalonia.qualita_scadente"]').change(async (event) => {
        const isScadente = event.target.checked;

        if (isScadente) {
            await item.setFlag("brancalonia", "qualita_scadente", true);
            DifettiScadenti.assegnaDifetto(item);
        } else {
            await item.unsetFlag("brancalonia", "qualita_scadente");
            await item.unsetFlag("brancalonia", "difetto_scadente");
        }
    });
});

/**
 * Incantesimo "Bollo di Qualità" - rimuove temporaneamente qualità scadente
 */
Hooks.on("dnd5e.useItem", (item, config, options) => {
    if (item.name !== "Bollo di Qualità") return;

    const target = game.user.targets.first();
    if (!target) {
        ui.notifications.warn("Seleziona un bersaglio per Bollo di Qualità");
        return false;
    }

    // Trova oggetto scadente nel target
    const targetActor = target.actor;
    const shoddy = targetActor.items.find(i => i.flags?.brancalonia?.qualita_scadente);

    if (!shoddy) {
        ui.notifications.warn("Il bersaglio non ha oggetti scadenti");
        return false;
    }

    // Applica effetto temporaneo
    const duration = item.system.level >= 3 ? 28800 : 3600; // 8 ore o 1 ora

    const effect = {
        name: "Bollo di Qualità",
        icon: "icons/magic/symbols/rune-sigil-red.webp",
        duration: { seconds: duration },
        changes: [{
            key: `flags.brancalonia.qualita_scadente`,
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value: false,
            priority: 30
        }],
        flags: {
            brancalonia: {
                targetItem: shoddy.id
            }
        }
    };

    targetActor.createEmbeddedDocuments("ActiveEffect", [effect]);

    ChatMessage.create({
        content: `<div class="brancalonia spell-effect">
            <h3>Bollo di Qualità</h3>
            <p><strong>${shoddy.name}</strong> funziona normalmente per ${duration/3600} ore</p>
        </div>`,
        speaker: ChatMessage.getSpeaker({actor: item.actor})
    });
});

/**
 * Stili CSS
 */
Hooks.once("ready", () => {
    const style = document.createElement("style");
    style.innerHTML = `
        .brancalonia.shoddy {
            border: 2px solid #8b4513;
            background: #f4e4c1;
            padding: 10px;
            margin: 5px 0;
        }

        .brancalonia-difetto {
            background: #ffe4b5;
            padding: 8px;
            border-left: 3px solid #cd853f;
            margin-top: 10px;
        }

        .brancalonia-difetto .notes {
            font-style: italic;
            color: #8b4513;
        }

        .item-name .item-property.shoddy {
            color: #8b4513;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
});

console.log("Brancalonia | Sistema Oggetti Scadenti caricato");