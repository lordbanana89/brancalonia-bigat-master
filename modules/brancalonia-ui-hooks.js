/**
 * Brancalonia UI Hooks
 * Handles all UI enhancements and Italian Renaissance theming
 * for Foundry VTT v13 and D&D 5e system
 */

export class BrancaloniaUIHooks {
    static init() {
        console.log("Brancalonia | Initializing UI Hooks...");

        // Character sheet hooks
        Hooks.on("renderActorSheet5eCharacter2", this.enhanceCharacterSheet.bind(this));
        Hooks.on("renderActorSheet5eNPC2", this.enhanceNPCSheet.bind(this));

        // Item sheet hooks
        Hooks.on("renderItemSheet5e2", this.enhanceItemSheet.bind(this));

        // Journal hooks
        Hooks.on("renderJournalSheet", this.enhanceJournalEntry.bind(this));
        Hooks.on("renderJournalPageSheet", this.enhanceJournalEntry.bind(this));

        // Chat message hooks - Handle deprecated hook with backward compatibility
        const chatHook = game.release?.generation >= 12 ? "renderChatMessage" : "renderChatMessage";
        Hooks.on(chatHook, this.enhanceChatMessage.bind(this));

        // UI component hooks
        Hooks.on("renderSidebarTab", this.enhanceSidebar.bind(this));
        Hooks.on("renderHotbar", this.enhanceHotbar.bind(this));
        Hooks.on("renderDialog", this.enhanceDialog.bind(this));
        Hooks.on("renderApplication", this.enhanceGeneralApplication.bind(this));
        Hooks.on("renderPlayerList", this.enhancePlayers.bind(this));

        // Combat tracker hooks
        Hooks.on("renderCombatTracker", this.enhanceCombatTracker.bind(this));

        // Scene controls hooks
        Hooks.on("renderSceneControls", this.enhanceSceneControls.bind(this));

        // Settings hooks
        Hooks.on("renderSettingsConfig", this.enhanceSettings.bind(this));

        // Token HUD hooks
        Hooks.on("renderTokenHUD", this.enhanceTokenHUD.bind(this));

        // Roll hooks
        Hooks.on("renderChatMessage", this.addItalianRollFlavor.bind(this));
        Hooks.on("preCreateChatMessage", this.preprocessChatMessage.bind(this));

        console.log("Brancalonia | UI Hooks initialized successfully!");
    }

    /**
     * Ensure jQuery compatibility for Foundry v13
     * @param {jQuery|HTMLElement} html - The HTML element
     * @returns {jQuery} jQuery wrapped element
     */
    static ensureJQuery(html) {
        return html instanceof jQuery ? html : $(html);
    }

    static preprocessChatMessage(message, data, options, userId) {
        // Add Italian flavor to roll messages
        if (message.isRoll) {
            const roll = message.rolls?.[0];
            if (roll) {
                const d20Result = roll.dice.find(d => d.faces === 20)?.results?.[0]?.result;

                if (d20Result === 20) {
                    data.flavor = (data.flavor || "") + " <span class='branca-crit'>⚔️ Colpo Magistrale!</span>";
                } else if (d20Result === 1) {
                    data.flavor = (data.flavor || "") + " <span class='branca-fumble'>💀 Che Sfortuna!</span>";
                }
            }
        }
    }

    static enhanceCharacterSheet(app, html, data) {
        // Foundry v13 compatibility: handle both HTMLElement and jQuery
        const $html = this.ensureJQuery(html);

        // Add Brancalonia class for styling
        $html.addClass("brancalonia-character-sheet");

        // Add Italian Renaissance decorative elements
        const header = $html.find(".sheet-header");
        if (header.length) {
            header.prepend('<div class="brancalonia-ornament top">⚜</div>');
            header.append('<div class="brancalonia-ornament bottom">🏛️</div>');
        }

        // Customize profile image frame
        const profileImg = $html.find(".profile-img");
        if (profileImg.length) {
            profileImg.wrap('<div class="brancalonia-portrait-frame"></div>');
        }

        // Add Infamia tracker if not present
        this.addInfamiaTracker($html, data);

        // Add Baraonda tracker
        this.addBaraondaTracker($html, data);

        // Add Lavori Sporchi section
        this.addLavoriSporchiTab($html, data);

        // Add Rifugio section
        this.addRifugioSection($html, data);
    }

    static enhanceNPCSheet(app, html, data) {
        const $html = this.ensureJQuery(html);
        $html.addClass("brancalonia-npc-sheet");

        // Add Italian flavor to NPC sheets
        const header = $html.find(".sheet-header");
        if (header.length) {
            header.prepend('<div class="brancalonia-npc-type">Avversario</div>');
        }
    }

    static addInfamiaTracker(html, data) {
        const $html = this.ensureJQuery(html);
        const resourcesSection = $html.find(".resources");
        if (resourcesSection.length && !$html.find(".brancalonia-infamia").length) {
            const infamiaHtml = `
                <div class="resource brancalonia-infamia">
                    <h4 class="resource-name">
                        <span>Infamia</span>
                        <i class="fas fa-skull" title="Punti Infamia"></i>
                    </h4>
                    <div class="resource-value">
                        <input type="number" name="system.details.infamia.value"
                               value="${data.actor?.system?.details?.infamia?.value || 0}"
                               placeholder="0" />
                        <span class="sep">/</span>
                        <input type="number" name="system.details.infamia.max"
                               value="${data.actor?.system?.details?.infamia?.max || 30}"
                               placeholder="30" />
                    </div>
                </div>
            `;
            resourcesSection.append(infamiaHtml);
        }
    }

    static addBaraondaTracker(html, data) {
        const $html = this.ensureJQuery(html);
        const resourcesSection = $html.find(".resources");
        if (resourcesSection.length && !$html.find(".brancalonia-baraonda").length) {
            const baraondaHtml = `
                <div class="resource brancalonia-baraonda">
                    <h4 class="resource-name">
                        <span>Baraonda</span>
                        <i class="fas fa-dice" title="Punti Baraonda"></i>
                    </h4>
                    <div class="resource-value">
                        <input type="number" name="system.details.baraonda.value"
                               value="${data.actor?.system?.details?.baraonda?.value || 0}"
                               placeholder="0" />
                    </div>
                </div>
            `;
            resourcesSection.append(baraondaHtml);
        }
    }

    static addLavoriSporchiTab(html, data) {
        const $html = this.ensureJQuery(html);
        const featuresTab = $html.find('[data-tab="features"]');
        if (featuresTab.length && !$html.find(".brancalonia-lavori-sporchi").length) {
            const lavoriHtml = `
                <div class="brancalonia-section brancalonia-lavori-sporchi">
                    <h3 class="section-header">
                        <i class="fas fa-coins"></i>
                        Lavori Sporchi
                    </h3>
                    <div class="form-group">
                        <label>Lavori Completati</label>
                        <textarea name="system.details.lavoriSporchi"
                                  rows="4"
                                  placeholder="Lista dei lavori sporchi completati...">${data.actor?.system?.details?.lavoriSporchi || ''}</textarea>
                    </div>
                </div>
            `;
            featuresTab.append(lavoriHtml);
        }
    }

    static addRifugioSection(html, data) {
        const $html = this.ensureJQuery(html);
        const featuresTab = $html.find('[data-tab="features"]');
        if (featuresTab.length && !$html.find(".brancalonia-rifugio").length) {
            const rifugioHtml = `
                <div class="brancalonia-section brancalonia-rifugio">
                    <h3 class="section-header">
                        <i class="fas fa-home"></i>
                        Rifugio
                    </h3>
                    <div class="rifugio-details">
                        <div class="form-group">
                            <label>Nome del Rifugio</label>
                            <input type="text" name="system.details.rifugio.nome"
                                   value="${data.actor?.system?.details?.rifugio?.nome || ''}"
                                   placeholder="es. La Taverna del Gatto Ubriaco" />
                        </div>
                        <div class="form-group">
                            <label>Descrizione</label>
                            <textarea name="system.details.rifugio.description"
                                      rows="3"
                                      placeholder="Descrivi il tuo rifugio...">${data.actor?.system?.details?.rifugio?.description || ''}</textarea>
                        </div>
                    </div>
                </div>
            `;
            featuresTab.append(rifugioHtml);
        }
    }

    static enhanceItemSheet(app, html, data) {
        // Foundry v13 compatibility: handle both HTMLElement and jQuery
        const $html = this.ensureJQuery(html);
        $html.addClass("brancalonia-item-sheet");

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
                iconClass = '🍷';
                break;
            case 'tool':
                iconClass = '🔧';
                break;
            case 'loot':
                iconClass = '💰';
                break;
            case 'spell':
                iconClass = '✨';
                break;
        }

        // Add item type to header
        const header = $html.find(".sheet-header h4");
        if (header.length && iconClass) {
            header.prepend(`<span class="item-type-icon">${iconClass}</span> `);
        }
    }

    static enhanceJournalEntry(app, html, data) {
        const $html = this.ensureJQuery(html);
        $html.addClass("brancalonia-journal");

        // Add Renaissance styling to journal content
        const content = $html.find(".journal-entry-content");
        if (content.length) {
            // Add ornamental first letter to paragraphs
            content.find('p:first-child').addClass('branca-first-paragraph');

            // Style headers with Italian Renaissance flair
            content.find('h1, h2, h3').each(function() {
                const $this = $(this);
                if (!$this.hasClass('branca-styled')) {
                    $this.addClass('branca-styled');
                    $this.prepend('<span class="branca-ornament">🌿</span> ');
                    $this.append(' <span class="branca-ornament">🌿</span>');
                }
            });

            // Add Italian exclamations for rolls
            $html.find('p, li, td').each(function() {
                const $this = $(this);
                const text = $this.text();
                if (text.includes('critical') || text.includes('critico')) {
                    $this.addClass('branca-critical');
                }
            });
        }
    }

    static enhanceChatMessage(message, html, data) {
        const $html = this.ensureJQuery(html);
        if ($html && $html.length) {
            $html.addClass("brancalonia-chat-message");

            // Add thematic icons to chat messages
            if (message.isRoll) {
                $html.find(".message-header").prepend('<span class="chat-icon">🗡️</span>');
            } else if (message.speaker?.actor) {
                $html.find(".message-header").prepend('<span class="chat-icon">🍺</span>');
            } else {
                $html.find(".message-header").prepend('<span class="chat-icon">🏠</span>');
            }
        }
    }

    static addItalianRollFlavor(message, html, data) {
        if (!message.isRoll) return;

        const roll = message.rolls?.[0];
        if (!roll) return;

        // Check for critical success or failure
        const d20 = roll.dice.find(d => d.faces === 20);
        if (d20) {
            const result = d20.results[0]?.result;
            if (result === 20) {
                html.find('.dice-total').addClass('branca-critical-success');
                html.find('.dice-total').append(' <span class="branca-flavor">Magnifico!</span>');
            } else if (result === 1) {
                html.find('.dice-total').addClass('branca-critical-failure');
                html.find('.dice-total').append(' <span class="branca-flavor">Maledizione!</span>');
            }
        }
    }

    static enhanceSidebar(app, html, data) {
        const $html = this.ensureJQuery(html);
        $html.addClass("brancalonia-sidebar");

        // Style sidebar navigation
        const nav = $html.find("#sidebar-tabs");
        if (nav.length) {
            nav.addClass("branca-nav-style");
        }
    }

    static enhanceHotbar(app, html, data) {
        const $html = this.ensureJQuery(html);
        $html.addClass("brancalonia-hotbar");

        // Add hover effects to macros
        $html.find(".macro").each(function() {
            $(this).on('mouseenter', function() {
                $(this).addClass('branca-hover');
            }).on('mouseleave', function() {
                $(this).removeClass('branca-hover');
            });
        });
    }

    static enhanceDialog(app, html, data) {
        const $html = this.ensureJQuery(html);
        $html.addClass("brancalonia-dialog");

        // Translate common dialog buttons to Italian
        $html.find('button[data-button="yes"]').html("Sì");
        $html.find('button[data-button="no"]').html("No");
        $html.find('button[data-button="ok"]').html("Va bene");
        $html.find('button[data-button="cancel"]').html("Annulla");
    }

    static enhanceGeneralApplication(app, html, data) {
        const $html = this.ensureJQuery(html);
        // Add general Brancalonia styling to all windows
        if (!$html.hasClass("brancalonia-styled")) {
            $html.addClass("brancalonia-styled");

            // Style window header
            const header = $html.find(".window-header");
            if (header.length) {
                header.addClass("branca-window-header");
            }
        }
    }

    static enhanceCombatTracker(app, html, data) {
        const $html = this.ensureJQuery(html);
        $html.addClass("brancalonia-combat-tracker");

        // Add Italian combat terms
        $html.find(".combat-button[data-control='startCombat']").attr('title', 'Inizia Combattimento');
        $html.find(".combat-button[data-control='endCombat']").attr('title', 'Termina Combattimento');
        $html.find(".combat-button[data-control='nextTurn']").attr('title', 'Prossimo Turno');
        $html.find(".combat-button[data-control='previousTurn']").attr('title', 'Turno Precedente');
    }

    static enhancePlayers(app, html, data) {
        if (app.constructor.name === "PlayerList") {
            const $html = this.ensureJQuery(html);
            $html.addClass("brancalonia-character");

            // Translate player status
            const nameField = $html.find('input[name="name"]');
            if (nameField.length) {
                nameField.attr('placeholder', 'Nome del Personaggio');
            }
        }
    }

    static enhanceSceneControls(app, html, data) {
        const $html = this.ensureJQuery(html);
        $html.addClass("brancalonia-scene-controls");

        // Add tooltips in Italian
        const controls = {
            'token': 'Pedine',
            'measure': 'Misura',
            'tiles': 'Tessere',
            'drawings': 'Disegni',
            'walls': 'Muri',
            'lighting': 'Illuminazione',
            'sounds': 'Suoni',
            'notes': 'Note'
        };

        Object.entries(controls).forEach(([key, value]) => {
            $html.find(`[data-control="${key}"]`).attr('title', value);
        });
    }

    static enhanceSettings(app, html, data) {
        const $html = this.ensureJQuery(html);
        $html.addClass("brancalonia-settings");

        // Add Italian section headers
        $html.find('.settings-sidebar h2').each(function() {
            const $this = $(this);
            const text = $this.text();
            if (text === 'Game Settings') {
                $this.text('Impostazioni di Gioco');
            } else if (text === 'Module Settings') {
                $this.text('Impostazioni Moduli');
            }
        });
    }

    static enhanceTokenHUD(app, html, data) {
        const $html = this.ensureJQuery(html);
        $html.addClass("brancalonia-token-hud");

        // Style the token HUD with Renaissance theme
        $html.find('.control-icon').each(function() {
            $(this).addClass('branca-control');
        });
    }
}