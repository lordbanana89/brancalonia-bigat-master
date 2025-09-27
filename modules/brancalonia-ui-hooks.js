/**
 * Brancalonia UI Hooks
 *
 * JavaScript module for customizing D&D 5e UI elements with Italian Renaissance theme
 * Adds Brancalonia-specific UI elements and tavern atmosphere
 */

export class BrancaloniaUIHooks {

    static initialize() {
        console.log("🏛️ Brancalonia UI Hooks | Initializing Italian Renaissance theme");

        // Register hooks
        this.registerRenderHooks();
        this.registerSheetHooks();
        this.registerChatHooks();
        this.registerUIEnhancements();

        // Apply theme
        this.applyBrancaloniaTheme();

        console.log("✅ Brancalonia UI Hooks | Italian Renaissance theme applied");
    }

    static registerRenderHooks() {
        // Actor sheet rendering
        Hooks.on("renderActorSheet5eCharacter", (app, html, data) => {
            this.enhanceCharacterSheet(app, html, data);
        });

        // Item sheet rendering
        Hooks.on("renderItemSheet5e", (app, html, data) => {
            this.enhanceItemSheet(app, html, data);
        });

        // Journal rendering
        Hooks.on("renderJournalPageSheet", (app, html, data) => {
            this.enhanceJournalSheet(app, html, data);
        });

        // Application rendering
        Hooks.on("renderApplication", (app, html, data) => {
            this.enhanceGenericSheet(app, html, data);
        });
    }

    static registerSheetHooks() {
        // Add Brancalonia-specific elements to character sheets
        Hooks.on("renderActorSheet", (app, html, data) => {
            if (data.actor?.type === "character") {
                this.addBrancaloniaElements(html, data);
            }
        });
    }

    static registerChatHooks() {
        // Enhance chat messages
        Hooks.on("renderChatMessage", (app, html, data) => {
            this.enhanceChatMessage(html, data);
        });

        // Custom dice roll styling
        Hooks.on("diceSoNiceRollComplete", (chatMessageId) => {
            this.enhanceDiceRoll(chatMessageId);
        });
    }

    static registerUIEnhancements() {
        // Sidebar enhancements
        Hooks.on("renderSidebar", (app, html, data) => {
            this.enhanceSidebar(html);
        });

        // Hotbar enhancements
        Hooks.on("renderHotbar", (app, html, data) => {
            this.enhanceHotbar(html);
        });

        // Dialog enhancements
        Hooks.on("renderDialog", (app, html, data) => {
            this.enhanceDialog(html);
        });
    }

    static enhanceCharacterSheet(app, html, data) {
        // Add Brancalonia class for styling
        html.addClass("brancalonia-character-sheet");

        // Add Italian Renaissance decorative elements
        const header = html.find(".sheet-header");
        if (header.length) {
            header.prepend('<div class="brancalonia-ornament top">⚜</div>');
            header.append('<div class="brancalonia-ornament bottom">🏛️</div>');
        }

        // Customize profile image frame
        const profileImg = html.find(".profile-img");
        if (profileImg.length) {
            profileImg.wrap('<div class="brancalonia-portrait-frame"></div>');
        }

        // Add Infamia tracker if not present
        this.addInfamiaTracker(html, data);

        // Add Baraonda counter
        this.addBaraondaCounter(html, data);

        // Add Lavori Sporchi tracker
        this.addLavoriSporchiTracker(html, data);

        // Add Rifugio management
        this.addRifugioManager(html, data);

        console.log("🎭 Enhanced character sheet with Brancalonia elements");
    }

    static addInfamiaTracker(html, data) {
        const resourcesSection = html.find(".resources");
        if (resourcesSection.length && !html.find(".brancalonia-infamia").length) {
            const infamiaHtml = `
                <div class="brancalonia-infamia">
                    <div class="resource flex-group-center">
                        <label>🗡️ Infamia</label>
                        <div class="resource-content flexrow flex-group-center">
                            <input name="system.resources.infamia.value" type="text"
                                   value="${data.actor.system.resources?.infamia?.value || 0}"
                                   placeholder="0" data-dtype="Number">
                            <span class="sep">/</span>
                            <input name="system.resources.infamia.max" type="text"
                                   value="${data.actor.system.resources?.infamia?.max || 10}"
                                   placeholder="10" data-dtype="Number">
                        </div>
                    </div>
                </div>
            `;
            resourcesSection.append(infamiaHtml);
        }
    }

    static addBaraondaCounter(html, data) {
        const resourcesSection = html.find(".resources");
        if (resourcesSection.length && !html.find(".brancalonia-baraonda").length) {
            const baraondaHtml = `
                <div class="brancalonia-baraonda">
                    <div class="resource flex-group-center">
                        <label>🍺 Baraonda</label>
                        <div class="resource-content flexrow flex-group-center">
                            <input name="system.resources.baraonda.value" type="text"
                                   value="${data.actor.system.resources?.baraonda?.value || 0}"
                                   placeholder="0" data-dtype="Number">
                        </div>
                    </div>
                </div>
            `;
            resourcesSection.append(baraondaHtml);
        }
    }

    static addLavoriSporchiTracker(html, data) {
        const featuresTab = html.find('[data-tab="features"]');
        if (featuresTab.length && !html.find(".brancalonia-lavori-sporchi").length) {
            const lavoriHtml = `
                <div class="brancalonia-lavori-sporchi">
                    <h3>💰 Lavori Sporchi</h3>
                    <div class="lavori-sporchi-content">
                        <input name="system.details.lavoriSporchi" type="text"
                               value="${data.actor.system.details?.lavoriSporchi || ''}"
                               placeholder="Descrivi i lavori sporchi completati...">
                    </div>
                </div>
            `;
            featuresTab.prepend(lavoriHtml);
        }
    }

    static addRifugioManager(html, data) {
        const featuresTab = html.find('[data-tab="features"]');
        if (featuresTab.length && !html.find(".brancalonia-rifugio").length) {
            const rifugioHtml = `
                <div class="brancalonia-rifugio">
                    <h3>🏠 Rifugio</h3>
                    <div class="rifugio-content">
                        <div class="rifugio-details">
                            <label>Nome del Rifugio:</label>
                            <input name="system.details.rifugio.name" type="text"
                                   value="${data.actor.system.details?.rifugio?.name || ''}"
                                   placeholder="Es: La Taverna del Gatto Nero">
                        </div>
                        <div class="rifugio-details">
                            <label>Livello Comfort:</label>
                            <select name="system.details.rifugio.comfort">
                                <option value="modesto">Modesto</option>
                                <option value="confortevole">Confortevole</option>
                                <option value="lussuoso">Lussuoso</option>
                            </select>
                        </div>
                        <div class="rifugio-details">
                            <label>Descrizione:</label>
                            <textarea name="system.details.rifugio.description"
                                      placeholder="Descrivi il tuo rifugio...">${data.actor.system.details?.rifugio?.description || ''}</textarea>
                        </div>
                    </div>
                </div>
            `;
            featuresTab.append(rifugioHtml);
        }
    }

    static enhanceItemSheet(app, html, data) {
        html.addClass("brancalonia-item-sheet");

        // Add Italian item type indicators
        const itemType = data.item.type;
        let iconClass = '';

        switch(itemType) {
            case 'weapon':
                iconClass = '⚔️';
                break;
            case 'equipment':
                iconClass = '🎒';
                break;
            case 'consumable':
                iconClass = '🧪';
                break;
            case 'spell':
                iconClass = '📜';
                break;
            case 'feat':
                iconClass = '🏅';
                break;
            default:
                iconClass = '📋';
        }

        const header = html.find(".sheet-header h4");
        if (header.length) {
            header.prepend(`<span class="brancalonia-item-icon">${iconClass}</span> `);
        }
    }

    static enhanceJournalSheet(app, html, data) {
        html.addClass("brancalonia-journal");

        // Add parchment texture overlay
        const content = html.find(".journal-entry-content");
        if (content.length) {
            content.prepend('<div class="brancalonia-parchment-overlay"></div>');
        }

        // Enhance content links for Italian terms
        this.enhanceContentLinks(html);
    }

    static enhanceContentLinks(html) {
        // Add tooltips for Italian gaming terms
        const italianTerms = {
            'Infamia': 'Reputazione negativa del personaggio nel mondo criminale',
            'Baraonda': 'Contatore per le risse da taverna',
            'Rifugio': 'Base operativa del personaggio o gruppo',
            'Compagnia': 'Gruppo di avventurieri Brancalonia',
            'Malefatte': 'Crimini e misfatti commessi',
            'Emeriticenze': 'Privilegi speciali di Brancalonia',
            'Lavori Sporchi': 'Missioni e incarichi illegali'
        };

        Object.entries(italianTerms).forEach(([term, description]) => {
            const regex = new RegExp(`\b${term}\b`, 'gi');
            html.find('p, li, td').each(function() {
                let content = $(this).html();
                content = content.replace(regex, `<span class="brancalonia-term" title="${description}">${term}</span>`);
                $(this).html(content);
            });
        });
    }

    static enhanceChatMessage(html, data) {
        // Add Italian flair to chat messages
        if (data.message.flavor) {
            html.addClass("brancalonia-chat-message");

            // Add decorative elements for certain message types
            if (data.message.flavor.includes("Infamia")) {
                html.find(".message-header").prepend('<span class="chat-icon">🗡️</span>');
            } else if (data.message.flavor.includes("Baraonda")) {
                html.find(".message-header").prepend('<span class="chat-icon">🍺</span>');
            } else if (data.message.flavor.includes("Rifugio")) {
                html.find(".message-header").prepend('<span class="chat-icon">🏠</span>');
            }
        }
    }

    static enhanceDiceRoll(chatMessageId) {
        // Add Italian exclamations to critical rolls
        const message = game.messages.get(chatMessageId);
        if (message?.rolls) {
            message.rolls.forEach(roll => {
                if (roll.dice && roll.dice.length > 0) {
                    const die = roll.dice[0];
                    if (die.total === die.faces) {
                        // Critical success - add Italian celebration
                        ChatMessage.create({
                            content: `<em style="color: gold;">🎉 Fantastico! Colpo critico! 🎯</em>`,
                            whisper: [game.user.id]
                        });
                    } else if (die.total === 1) {
                        // Critical failure - add Italian commiseration
                        ChatMessage.create({
                            content: `<em style="color: red;">💥 Madonna! Che sfortuna! 😱</em>`,
                            whisper: [game.user.id]
                        });
                    }
                }
            });
        }
    }

    static enhanceSidebar(html) {
        html.addClass("brancalonia-sidebar");

        // Add decorative header
        const nav = html.find("#sidebar-tabs");
        if (nav.length) {
            nav.before('<div class="brancalonia-sidebar-header">🏛️ Regno di Taglia 🏛️</div>');
        }
    }

    static enhanceHotbar(html) {
        html.addClass("brancalonia-hotbar");

        // Style macro slots with Italian theme
        html.find(".macro").each(function() {
            $(this).addClass("brancalonia-macro-slot");
        });
    }

    static enhanceDialog(html) {
        html.addClass("brancalonia-dialog");

        // Add Italian button text where appropriate
        html.find('button[data-button="yes"]').html("Sì");
        html.find('button[data-button="no"]').html("No");
        html.find('button[data-button="ok"]').html("Va bene");
        html.find('button[data-button="cancel"]').html("Annulla");
    }

    static enhanceGenericSheet(app, html, data) {
        // Apply general Brancalonia styling to any sheet
        if (html.hasClass("app") && !html.hasClass("brancalonia-styled")) {
            html.addClass("brancalonia-styled");

            // Add subtle Italian theming
            const header = html.find(".window-header");
            if (header.length && header.find(".brancalonia-window-ornament").length === 0) {
                header.append('<span class="brancalonia-window-ornament">⚜</span>');
            }
        }
    }

    static addBrancaloniaElements(html, data) {
        // Add custom Brancalonia sections to any character sheet
        const actor = data.actor;

        // Check if this is a Brancalonia character (has Italian background or class)
        const isBrancaloniaCharacter = this.isBrancaloniaCharacter(actor);

        if (isBrancaloniaCharacter) {
            html.addClass("brancalonia-character");

            // Add visual indicators
            const nameField = html.find('input[name="name"]');
            if (nameField.length) {
                nameField.before('<span class="brancalonia-character-indicator" title="Personaggio di Brancalonia">🇮🇹</span>');
            }
        }
    }

    static isBrancaloniaCharacter(actor) {
        // Check various indicators that this is a Brancalonia character
        const background = actor.system.details?.background?.toLowerCase();
        const classes = actor.items.filter(i => i.type === "class");

        // Italian backgrounds or Brancalonia-specific content
        const italianBackgrounds = ['furfante', 'mariuolo', 'scugnizzo', 'mercante'];

        return italianBackgrounds.some(bg => background?.includes(bg)) ||
               classes.some(cls => cls.name.includes('Brancalonia')) ||
               actor.system.resources?.infamia !== undefined;
    }

    static applyBrancaloniaTheme() {
        // Apply theme-wide enhancements
        $('body').addClass('brancalonia-theme');

        // Add custom CSS variables for dynamic theming
        const root = document.documentElement;
        root.style.setProperty('--brancalonia-active', 'true');

        // Apply favicon if available
        this.updateFavicon();

        // Custom cursor for Italian flair (optional)
        this.applyCustomCursor();
    }

    static updateFavicon() {
        const favicon = document.querySelector('link[rel="icon"]');
        const brancaloniaIcon = '/modules/brancalonia-bigat/assets/artwork/favicon.ico';

        if (favicon && game.modules.get('brancalonia-bigat')?.active) {
            favicon.href = brancaloniaIcon;
        }
    }

    static applyCustomCursor() {
        // Optional: Apply Italian-themed cursor
        const style = document.createElement('style');
        style.textContent = `
            .brancalonia-theme {
                cursor: url('/modules/brancalonia-bigat/assets/ui/cursors/default.cur'), auto;
            }
            .brancalonia-theme button:hover {
                cursor: url('/modules/brancalonia-bigat/assets/ui/cursors/pointer.cur'), pointer;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize when Foundry is ready
Hooks.once("ready", () => {
    BrancaloniaUIHooks.initialize();
});

// Re-apply theme when settings change
Hooks.on("updateSetting", (setting) => {
    if (setting.key.includes("brancalonia")) {
        BrancaloniaUIHooks.applyBrancaloniaTheme();
    }
});
