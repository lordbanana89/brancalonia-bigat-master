/**
 * BRANCALONIA CHARACTER SHEET MODIFICATIONS
 * Advanced character sheet customization for Italian Renaissance gameplay
 * Integrates Brancalonia-specific mechanics with D&D 5e system
 */

export class BrancaloniaSheets {

    static initialize() {
        console.log("📜 Brancalonia Sheets | Initializing character sheet modifications");

        // Register sheet modifications
        this.registerSheetModifications();
        this.registerSheetListeners();
        this.registerDataModels();

        console.log("✅ Brancalonia Sheets | Character sheet modifications applied");
    }

    static registerSheetModifications() {
        // Override default character sheet rendering
        Hooks.on("renderActorSheet5eCharacter", this.modifyCharacterSheet.bind(this));
        Hooks.on("renderActorSheet5eNPC", this.modifyNPCSheet.bind(this));

        // Pre-render data preparation
        Hooks.on("preRenderActorSheet5eCharacter", this.prepareSheetData.bind(this));
    }

    static registerSheetListeners() {
        // Register custom event listeners for Brancalonia elements
        Hooks.on("renderActorSheet", (app, html, data) => {
            if (data.actor?.type === "character") {
                this.attachEventListeners(html, data);
            }
        });
    }

    static registerDataModels() {
        // Extend actor data model for Brancalonia fields
        Hooks.on("preCreateActor", (document, data, options, userId) => {
            if (data.type === "character") {
                this.initializeBrancaloniaData(document);
            }
        });
    }

    static async modifyCharacterSheet(app, html, data) {
        const actor = app.actor;

        // Add Brancalonia class to sheet
        html.addClass("brancalonia-character-sheet");
        html.addClass("italian-renaissance");

        // Add background texture
        this.addBackgroundTexture(html);

        // Modify header section
        this.enhanceSheetHeader(html, data);

        // Add Brancalonia resource trackers
        this.addInfamiaSystem(html, actor);
        this.addBaraondaSystem(html, actor);
        this.addCompagniaSection(html, actor);
        this.addLavoriSporchiSection(html, actor);
        this.addRifugioSection(html, actor);
        this.addMalefatteSection(html, actor);

        // Enhance existing sections
        this.enhanceAbilitiesSection(html, actor);
        this.enhanceInventorySection(html, actor);
        this.enhanceFeatureSection(html, actor);

        // Add Italian terminology
        this.translateUIElements(html);

        // Add decorative elements
        this.addDecorativeElements(html);

        console.log("🎭 Character sheet enhanced with Brancalonia modifications");
    }

    static addBackgroundTexture(html) {
        const sheetBody = html.find(".sheet-body");
        if (sheetBody.length) {
            sheetBody.css({
                'background-image': 'linear-gradient(rgba(244, 228, 188, 0.9), rgba(255, 248, 220, 0.9)), url("/modules/brancalonia-bigat/assets/ui/backgrounds/parchment.webp")',
                'background-blend-mode': 'multiply',
                'background-size': 'cover',
                'background-position': 'center'
            });
        }
    }

    static enhanceSheetHeader(html, data) {
        const header = html.find(".sheet-header");
        if (!header.length) return;

        // Add Renaissance portrait frame
        const portrait = header.find(".profile");
        if (portrait.length) {
            portrait.wrap(`
                <div class="brancalonia-portrait-container">
                    <div class="portrait-frame renaissance">
                        <div class="frame-ornament top-left">⚜</div>
                        <div class="frame-ornament top-right">⚜</div>
                        <div class="frame-ornament bottom-left">❦</div>
                        <div class="frame-ornament bottom-right">❦</div>
                    </div>
                </div>
            `);
        }

        // Add character title section
        const charName = header.find(".char-name");
        if (charName.length && !header.find(".character-titles").length) {
            charName.after(`
                <div class="character-titles">
                    <input type="text" name="flags.brancalonia.soprannome"
                           placeholder="Soprannome (Nickname)"
                           value="${data.actor.flags?.brancalonia?.soprannome || ''}"
                           class="soprannome-input" />
                    <input type="text" name="flags.brancalonia.titolo"
                           placeholder="Titolo o Epiteto"
                           value="${data.actor.flags?.brancalonia?.titolo || ''}"
                           class="titolo-input" />
                </div>
            `);
        }
    }

    static addInfamiaSystem(html, actor) {
        const resourcesSection = html.find(".attributes .resources");
        if (resourcesSection.length && !html.find(".infamia-tracker").length) {
            const currentInfamia = actor.getFlag('brancalonia-bigat', 'infamia') || 0;
            const maxInfamia = actor.getFlag('brancalonia-bigat', 'infamiaMax') || 10;

            const infamiaHTML = `
                <div class="infamia-tracker brancalonia-resource">
                    <div class="resource-header">
                        <h3>
                            <span class="icon">🗡️</span>
                            Infamia
                            <span class="tooltip-anchor" data-tooltip="La tua reputazione nel mondo criminale">ⓘ</span>
                        </h3>
                    </div>
                    <div class="resource-content">
                        <div class="infamia-bar">
                            <div class="infamia-fill" style="width: ${(currentInfamia/maxInfamia)*100}%"></div>
                            <div class="infamia-segments">
                                ${this.generateInfamiaSegments(maxInfamia)}
                            </div>
                        </div>
                        <div class="infamia-controls">
                            <button class="infamia-adjust" data-adjust="-1" title="Diminuisci Infamia">−</button>
                            <input type="number" class="infamia-value" name="flags.brancalonia-bigat.infamia"
                                   value="${currentInfamia}" min="0" max="${maxInfamia}" />
                            <span class="separator">/</span>
                            <input type="number" class="infamia-max" name="flags.brancalonia-bigat.infamiaMax"
                                   value="${maxInfamia}" min="1" />
                            <button class="infamia-adjust" data-adjust="1" title="Aumenta Infamia">+</button>
                        </div>
                        <div class="infamia-status">
                            ${this.getInfamiaStatus(currentInfamia)}
                        </div>
                    </div>
                </div>
            `;
            resourcesSection.after(infamiaHTML);
        }
    }

    static generateInfamiaSegments(max) {
        let segments = '';
        for (let i = 1; i <= max; i++) {
            segments += `<div class="segment" data-level="${i}"></div>`;
        }
        return segments;
    }

    static getInfamiaStatus(level) {
        const statuses = [
            { min: 0, max: 2, label: "Sconosciuto", icon: "👤" },
            { min: 3, max: 5, label: "Famigerato", icon: "🎭" },
            { min: 6, max: 8, label: "Temuto", icon: "⚔️" },
            { min: 9, max: 10, label: "Leggendario", icon: "👑" }
        ];

        const status = statuses.find(s => level >= s.min && level <= s.max);
        return `<span class="status-label">${status.icon} ${status.label}</span>`;
    }

    static addBaraondaSystem(html, actor) {
        const combatSection = html.find('[data-tab="features"]');
        if (combatSection.length && !html.find(".baraonda-tracker").length) {
            const baraondaPoints = actor.getFlag('brancalonia-bigat', 'baraonda') || 0;

            const baraondaHTML = `
                <div class="baraonda-tracker brancalonia-resource">
                    <div class="resource-header">
                        <h3>
                            <span class="icon">🍺</span>
                            Punti Baraonda
                            <span class="tooltip-anchor" data-tooltip="Punti accumulati nelle risse da taverna">ⓘ</span>
                        </h3>
                    </div>
                    <div class="resource-content">
                        <div class="baraonda-display">
                            <div class="baraonda-value-circle">
                                <input type="number" class="baraonda-value"
                                       name="flags.brancalonia-bigat.baraonda"
                                       value="${baraondaPoints}" min="0" />
                            </div>
                            <div class="baraonda-abilities">
                                <h4>Mosse di Baraonda Disponibili:</h4>
                                <ul class="baraonda-moves">
                                    ${this.getBaraondaMoves(baraondaPoints)}
                                </ul>
                            </div>
                        </div>
                        <div class="baraonda-actions">
                            <button class="baraonda-btn" data-action="brawl-start">
                                🥊 Inizia Rissa
                            </button>
                            <button class="baraonda-btn" data-action="spend-point">
                                💪 Usa Punto
                            </button>
                            <button class="baraonda-btn" data-action="reset">
                                🔄 Resetta
                            </button>
                        </div>
                    </div>
                </div>
            `;
            combatSection.prepend(baraondaHTML);
        }
    }

    static getBaraondaMoves(points) {
        const moves = [
            { cost: 1, name: "Sganassone", desc: "Colpo extra con danno bonus" },
            { cost: 2, name: "Testata", desc: "Stordisce l'avversario" },
            { cost: 3, name: "Lancio della Sedia", desc: "Attacco a distanza improvvisato" },
            { cost: 4, name: "Furia da Taverna", desc: "Attacchi multipli in un turno" }
        ];

        return moves.map(move => {
            const available = points >= move.cost;
            return `
                <li class="baraonda-move ${available ? 'available' : 'unavailable'}">
                    <span class="move-cost">${move.cost}</span>
                    <span class="move-name">${move.name}</span>
                    <span class="move-desc">${move.desc}</span>
                </li>
            `;
        }).join('');
    }

    static addCompagniaSection(html, actor) {
        const biographyTab = html.find('[data-tab="biography"]');
        if (biographyTab.length && !html.find(".compagnia-section").length) {
            const compagnia = actor.getFlag('brancalonia-bigat', 'compagnia') || {};

            const compagniaHTML = `
                <div class="compagnia-section brancalonia-section">
                    <div class="section-header ornate">
                        <h2>
                            <span class="icon">⚔️</span>
                            La Compagnia
                            <span class="icon">⚔️</span>
                        </h2>
                    </div>
                    <div class="section-content">
                        <div class="compagnia-info">
                            <div class="field-group">
                                <label>Nome della Compagnia:</label>
                                <input type="text" name="flags.brancalonia-bigat.compagnia.nome"
                                       value="${compagnia.nome || ''}"
                                       placeholder="Es: I Fratelli del Pugnale" />
                            </div>
                            <div class="field-group">
                                <label>Motto:</label>
                                <input type="text" name="flags.brancalonia-bigat.compagnia.motto"
                                       value="${compagnia.motto || ''}"
                                       placeholder="Es: 'Vino, Oro e Gloria!'" />
                            </div>
                            <div class="field-group">
                                <label>Stemma/Simbolo:</label>
                                <textarea name="flags.brancalonia-bigat.compagnia.stemma"
                                          placeholder="Descrivi lo stemma della compagnia..."
                                          rows="3">${compagnia.stemma || ''}</textarea>
                            </div>
                        </div>
                        <div class="compagnia-members">
                            <h4>Membri della Compagnia:</h4>
                            <div class="members-list">
                                ${this.renderCompagniaMembers(compagnia.membri || [])}
                            </div>
                            <button class="add-member-btn">
                                <span class="icon">➕</span> Aggiungi Membro
                            </button>
                        </div>
                        <div class="compagnia-reputation">
                            <h4>Reputazione della Compagnia:</h4>
                            <div class="reputation-tracker">
                                <input type="range" name="flags.brancalonia-bigat.compagnia.reputazione"
                                       min="-10" max="10" value="${compagnia.reputazione || 0}"
                                       class="reputation-slider" />
                                <div class="reputation-labels">
                                    <span class="rep-negative">Infame</span>
                                    <span class="rep-current">${this.getReputationLabel(compagnia.reputazione || 0)}</span>
                                    <span class="rep-positive">Eroica</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            biographyTab.append(compagniaHTML);
        }
    }

    static renderCompagniaMembers(members) {
        if (members.length === 0) {
            return '<p class="no-members">Nessun membro registrato</p>';
        }
        return members.map((member, idx) => `
            <div class="member-entry" data-member-id="${idx}">
                <span class="member-name">${member.name}</span>
                <span class="member-role">${member.role}</span>
                <button class="remove-member" data-member-id="${idx}">✖</button>
            </div>
        `).join('');
    }

    static getReputationLabel(value) {
        if (value <= -7) return "Maledetti";
        if (value <= -4) return "Malvisti";
        if (value <= -1) return "Sospetti";
        if (value === 0) return "Sconosciuti";
        if (value <= 3) return "Conosciuti";
        if (value <= 6) return "Rispettati";
        if (value <= 9) return "Famosi";
        return "Leggendari";
    }

    static addLavoriSporchiSection(html, actor) {
        const featuresTab = html.find('[data-tab="features"]');
        if (featuresTab.length && !html.find(".lavori-sporchi-section").length) {
            const lavori = actor.getFlag('brancalonia-bigat', 'lavoriSporchi') || [];

            const lavoriHTML = `
                <div class="lavori-sporchi-section brancalonia-section">
                    <div class="section-header">
                        <h3>
                            <span class="icon">💰</span>
                            Lavori Sporchi
                            <span class="tooltip-anchor" data-tooltip="Missioni e incarichi completati">ⓘ</span>
                        </h3>
                    </div>
                    <div class="section-content">
                        <div class="lavori-summary">
                            <div class="stat-box">
                                <span class="stat-label">Completati:</span>
                                <span class="stat-value">${lavori.filter(l => l.completed).length}</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-label">In Corso:</span>
                                <span class="stat-value">${lavori.filter(l => !l.completed).length}</span>
                            </div>
                            <div class="stat-box">
                                <span class="stat-label">Guadagno Totale:</span>
                                <span class="stat-value">${this.calculateTotalEarnings(lavori)} 🪙</span>
                            </div>
                        </div>
                        <div class="lavori-list">
                            <h4>Registro dei Lavori:</h4>
                            ${this.renderLavoriList(lavori)}
                        </div>
                        <div class="lavori-actions">
                            <button class="add-lavoro-btn">
                                <span class="icon">📋</span> Nuovo Lavoro
                            </button>
                            <button class="archive-lavori-btn">
                                <span class="icon">📚</span> Archivia Completati
                            </button>
                        </div>
                    </div>
                </div>
            `;
            featuresTab.append(lavoriHTML);
        }
    }

    static calculateTotalEarnings(lavori) {
        return lavori
            .filter(l => l.completed)
            .reduce((total, lavoro) => total + (lavoro.reward || 0), 0);
    }

    static renderLavoriList(lavori) {
        if (lavori.length === 0) {
            return '<p class="no-lavori">Nessun lavoro registrato</p>';
        }

        return `
            <div class="lavori-entries">
                ${lavori.map((lavoro, idx) => `
                    <div class="lavoro-entry ${lavoro.completed ? 'completed' : 'active'}" data-lavoro-id="${idx}">
                        <div class="lavoro-header">
                            <span class="lavoro-title">${lavoro.title}</span>
                            <span class="lavoro-status">${lavoro.completed ? '✅' : '⏳'}</span>
                        </div>
                        <div class="lavoro-details">
                            <span class="lavoro-client">Cliente: ${lavoro.client || 'Sconosciuto'}</span>
                            <span class="lavoro-reward">Ricompensa: ${lavoro.reward || 0} 🪙</span>
                        </div>
                        <div class="lavoro-description">
                            ${lavoro.description || 'Nessuna descrizione'}
                        </div>
                        <div class="lavoro-actions">
                            <button class="edit-lavoro" data-lavoro-id="${idx}">✏️</button>
                            <button class="toggle-lavoro" data-lavoro-id="${idx}">
                                ${lavoro.completed ? '↩️' : '✓'}
                            </button>
                            <button class="delete-lavoro" data-lavoro-id="${idx}">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    static addRifugioSection(html, actor) {
        const biographyTab = html.find('[data-tab="biography"]');
        if (biographyTab.length && !html.find(".rifugio-section").length) {
            const rifugio = actor.getFlag('brancalonia-bigat', 'rifugio') || {};

            const rifugioHTML = `
                <div class="rifugio-section brancalonia-section">
                    <div class="section-header ornate">
                        <h2>
                            <span class="icon">🏠</span>
                            Il Rifugio
                            <span class="icon">🏠</span>
                        </h2>
                    </div>
                    <div class="section-content">
                        <div class="rifugio-main">
                            <div class="field-group">
                                <label>Nome del Rifugio:</label>
                                <input type="text" name="flags.brancalonia-bigat.rifugio.nome"
                                       value="${rifugio.nome || ''}"
                                       placeholder="Es: La Taverna del Gatto Nero" />
                            </div>
                            <div class="field-group">
                                <label>Ubicazione:</label>
                                <input type="text" name="flags.brancalonia-bigat.rifugio.ubicazione"
                                       value="${rifugio.ubicazione || ''}"
                                       placeholder="Es: Vicolo dei Ladri, Tarantasia" />
                            </div>
                            <div class="field-group">
                                <label>Tipo di Rifugio:</label>
                                <select name="flags.brancalonia-bigat.rifugio.tipo">
                                    <option value="taverna" ${rifugio.tipo === 'taverna' ? 'selected' : ''}>Taverna</option>
                                    <option value="locanda" ${rifugio.tipo === 'locanda' ? 'selected' : ''}>Locanda</option>
                                    <option value="bordello" ${rifugio.tipo === 'bordello' ? 'selected' : ''}>Bordello</option>
                                    <option value="magazzino" ${rifugio.tipo === 'magazzino' ? 'selected' : ''}>Magazzino</option>
                                    <option value="palazzo" ${rifugio.tipo === 'palazzo' ? 'selected' : ''}>Palazzo Abbandonato</option>
                                    <option value="nave" ${rifugio.tipo === 'nave' ? 'selected' : ''}>Nave</option>
                                    <option value="altro" ${rifugio.tipo === 'altro' ? 'selected' : ''}>Altro</option>
                                </select>
                            </div>
                        </div>
                        <div class="rifugio-comfort">
                            <h4>Livello di Comfort:</h4>
                            <div class="comfort-selector">
                                ${this.renderComfortLevels(rifugio.comfort || 1)}
                            </div>
                            <div class="comfort-benefits">
                                <h5>Benefici del Comfort:</h5>
                                ${this.getComfortBenefits(rifugio.comfort || 1)}
                            </div>
                        </div>
                        <div class="rifugio-features">
                            <h4>Caratteristiche Speciali:</h4>
                            <div class="features-grid">
                                ${this.renderRifugioFeatures(rifugio.features || [])}
                            </div>
                        </div>
                        <div class="rifugio-description">
                            <label>Descrizione:</label>
                            <textarea name="flags.brancalonia-bigat.rifugio.descrizione"
                                      rows="4"
                                      placeholder="Descrivi l'aspetto e l'atmosfera del rifugio...">${rifugio.descrizione || ''}</textarea>
                        </div>
                    </div>
                </div>
            `;
            biographyTab.append(rifugioHTML);
        }
    }

    static renderComfortLevels(currentLevel) {
        const levels = [
            { level: 1, name: "Squallido", icon: "🕸️" },
            { level: 2, name: "Modesto", icon: "🪑" },
            { level: 3, name: "Confortevole", icon: "🛋️" },
            { level: 4, name: "Lussuoso", icon: "👑" },
            { level: 5, name: "Principesco", icon: "🏰" }
        ];

        return levels.map(l => `
            <label class="comfort-level ${l.level === currentLevel ? 'selected' : ''}">
                <input type="radio" name="flags.brancalonia-bigat.rifugio.comfort"
                       value="${l.level}" ${l.level === currentLevel ? 'checked' : ''} />
                <span class="comfort-icon">${l.icon}</span>
                <span class="comfort-name">${l.name}</span>
            </label>
        `).join('');
    }

    static getComfortBenefits(level) {
        const benefits = {
            1: "Riposo Lungo recupera solo metà dei Dadi Vita",
            2: "Riposo normale, nessun bonus",
            3: "+1 ai tiri di recupero durante il riposo",
            4: "+2 ai tiri di recupero, riposo breve in 30 minuti",
            5: "+3 ai tiri di recupero, ispirazione gratuita dopo riposo lungo"
        };
        return `<p class="comfort-benefit">${benefits[level] || benefits[1]}</p>`;
    }

    static renderRifugioFeatures(features) {
        const availableFeatures = [
            { id: 'cantina', name: 'Cantina Segreta', icon: '🍷' },
            { id: 'armeria', name: 'Armeria', icon: '⚔️' },
            { id: 'laboratorio', name: 'Laboratorio', icon: '⚗️' },
            { id: 'biblioteca', name: 'Biblioteca', icon: '📚' },
            { id: 'prigione', name: 'Prigione', icon: '🔒' },
            { id: 'passaggio', name: 'Passaggio Segreto', icon: '🚪' },
            { id: 'torre', name: 'Torre di Guardia', icon: '🗼' },
            { id: 'stalla', name: 'Stalla', icon: '🐴' }
        ];

        return availableFeatures.map(f => `
            <label class="feature-checkbox">
                <input type="checkbox" name="flags.brancalonia-bigat.rifugio.features"
                       value="${f.id}" ${features.includes(f.id) ? 'checked' : ''} />
                <span class="feature-icon">${f.icon}</span>
                <span class="feature-name">${f.name}</span>
            </label>
        `).join('');
    }

    static addMalefatteSection(html, actor) {
        const biographyTab = html.find('[data-tab="biography"]');
        if (biographyTab.length && !html.find(".malefatte-section").length) {
            const malefatte = actor.getFlag('brancalonia-bigat', 'malefatte') || [];

            const malefatteHTML = `
                <div class="malefatte-section brancalonia-section">
                    <div class="section-header">
                        <h3>
                            <span class="icon">📜</span>
                            Registro delle Malefatte
                            <span class="tooltip-anchor" data-tooltip="I crimini e misfatti commessi">ⓘ</span>
                        </h3>
                    </div>
                    <div class="section-content">
                        <div class="malefatte-stats">
                            <div class="crime-counter">
                                <span class="crime-type">Furti: ${malefatte.filter(m => m.type === 'furto').length}</span>
                                <span class="crime-type">Truffe: ${malefatte.filter(m => m.type === 'truffa').length}</span>
                                <span class="crime-type">Risse: ${malefatte.filter(m => m.type === 'rissa').length}</span>
                                <span class="crime-type">Omicidi: ${malefatte.filter(m => m.type === 'omicidio').length}</span>
                            </div>
                        </div>
                        <div class="malefatte-list">
                            ${this.renderMalefatteList(malefatte)}
                        </div>
                        <button class="add-malefatta-btn">
                            <span class="icon">⚖️</span> Registra Malefatta
                        </button>
                    </div>
                </div>
            `;
            biographyTab.append(malefatteHTML);
        }
    }

    static renderMalefatteList(malefatte) {
        if (malefatte.length === 0) {
            return '<p class="no-malefatte">Fedina penale pulita... per ora</p>';
        }

        return malefatte.slice(-5).map((malefatta, idx) => `
            <div class="malefatta-entry">
                <span class="malefatta-date">${malefatta.date || 'Data sconosciuta'}</span>
                <span class="malefatta-type">${this.getMalefattaIcon(malefatta.type)}</span>
                <span class="malefatta-desc">${malefatta.description}</span>
                <span class="malefatta-bounty">${malefatta.bounty || 0} 🪙</span>
            </div>
        `).join('');
    }

    static getMalefattaIcon(type) {
        const icons = {
            'furto': '🗝️',
            'truffa': '🎭',
            'rissa': '🥊',
            'omicidio': '🗡️',
            'contrabbando': '📦',
            'blasfemia': '😈',
            'altro': '⚖️'
        };
        return icons[type] || icons['altro'];
    }

    static enhanceAbilitiesSection(html, actor) {
        // Add Italian labels to ability scores
        const abilities = {
            'str': 'Forza',
            'dex': 'Destrezza',
            'con': 'Costituzione',
            'int': 'Intelligenza',
            'wis': 'Saggezza',
            'cha': 'Carisma'
        };

        Object.entries(abilities).forEach(([key, label]) => {
            const abilityElement = html.find(`.ability[data-ability="${key}"] .ability-name`);
            if (abilityElement.length) {
                abilityElement.attr('title', label);
            }
        });
    }

    static enhanceInventorySection(html, actor) {
        // Add quality indicators for shoddy equipment
        const items = html.find('.item');
        items.each(function() {
            const item = actor.items.get($(this).data('item-id'));
            if (item?.getFlag('brancalonia-bigat', 'shoddy')) {
                $(this).addClass('shoddy-item');
                $(this).prepend('<span class="quality-indicator shoddy" title="Equipaggiamento Scadente">⚠️</span>');
            }
        });
    }

    static enhanceFeatureSection(html, actor) {
        // Group features by type with Italian categories
        const featuresTab = html.find('[data-tab="features"]');
        if (featuresTab.length) {
            // Add category headers
            const categories = {
                'race': 'Stirpe',
                'background': 'Background',
                'class': 'Classe',
                'feat': 'Talenti',
                'brancalonia': 'Privilegi di Brancalonia'
            };

            // Reorganize features by category
            Object.entries(categories).forEach(([type, label]) => {
                const features = actor.items.filter(i => i.type === type || i.getFlag('brancalonia-bigat', 'type') === type);
                if (features.length > 0) {
                    // Implementation for organizing features
                }
            });
        }
    }

    static translateUIElements(html) {
        // Translate common D&D terms to Italian
        const translations = {
            'Hit Points': 'Punti Ferita',
            'Armor Class': 'Classe Armatura',
            'Initiative': 'Iniziativa',
            'Speed': 'Velocità',
            'Proficiency Bonus': 'Bonus di Competenza',
            'Spell Save DC': 'CD Tiro Salvezza Incantesimi',
            'Spell Attack': 'Attacco con Incantesimi',
            'Death Saves': 'Tiri Salvezza contro Morte',
            'Inspiration': 'Ispirazione',
            'Experience Points': 'Punti Esperienza',
            'Skills': 'Abilità',
            'Features': 'Privilegi',
            'Inventory': 'Inventario',
            'Spellbook': 'Libro degli Incantesimi',
            'Biography': 'Biografia'
        };

        Object.entries(translations).forEach(([english, italian]) => {
            html.find(`label:contains("${english}")`).each(function() {
                $(this).html($(this).html().replace(english, italian));
            });
        });
    }

    static addDecorativeElements(html) {
        // Add Renaissance decorative flourishes
        const sections = html.find('.sheet-body > div[data-tab]');
        sections.each(function() {
            if (!$(this).find('.section-ornament').length) {
                $(this).prepend('<div class="section-ornament top">❦ ❦ ❦</div>');
                $(this).append('<div class="section-ornament bottom">❦ ❦ ❦</div>');
            }
        });

        // Add corner ornaments to main sections
        const mainSections = html.find('.brancalonia-section');
        mainSections.each(function() {
            $(this).append(`
                <div class="corner-ornaments">
                    <span class="ornament top-left">⚜</span>
                    <span class="ornament top-right">⚜</span>
                    <span class="ornament bottom-left">❧</span>
                    <span class="ornament bottom-right">❧</span>
                </div>
            `);
        });
    }

    static modifyNPCSheet(app, html, data) {
        // Add Brancalonia styling to NPC sheets
        html.addClass("brancalonia-npc-sheet");

        // Add faction indicator
        const faction = app.actor.getFlag('brancalonia-bigat', 'faction');
        if (faction) {
            const header = html.find(".sheet-header");
            header.append(`
                <div class="npc-faction">
                    <span class="faction-label">Fazione:</span>
                    <span class="faction-name">${faction}</span>
                </div>
            `);
        }
    }

    static prepareSheetData(app, html, data) {
        // Pre-process data for Brancalonia features
        const actor = app.actor;

        // Ensure Brancalonia flags exist
        if (!actor.getFlag('brancalonia-bigat', 'initialized')) {
            this.initializeBrancaloniaData(actor);
        }

        // Calculate derived values
        data.brancalonia = {
            infamiaLevel: this.calculateInfamiaLevel(actor),
            baraondaReady: (actor.getFlag('brancalonia-bigat', 'baraonda') || 0) > 0,
            hasCompagnia: !!actor.getFlag('brancalonia-bigat', 'compagnia.nome'),
            rifugioComfort: actor.getFlag('brancalonia-bigat', 'rifugio.comfort') || 1
        };
    }

    static initializeBrancaloniaData(actor) {
        // Set default Brancalonia data
        actor.setFlag('brancalonia-bigat', 'initialized', true);
        actor.setFlag('brancalonia-bigat', 'infamia', 0);
        actor.setFlag('brancalonia-bigat', 'infamiaMax', 10);
        actor.setFlag('brancalonia-bigat', 'baraonda', 0);
        actor.setFlag('brancalonia-bigat', 'compagnia', {});
        actor.setFlag('brancalonia-bigat', 'rifugio', { comfort: 1 });
        actor.setFlag('brancalonia-bigat', 'lavoriSporchi', []);
        actor.setFlag('brancalonia-bigat', 'malefatte', []);
    }

    static calculateInfamiaLevel(actor) {
        const infamia = actor.getFlag('brancalonia-bigat', 'infamia') || 0;
        if (infamia >= 9) return 'legendary';
        if (infamia >= 6) return 'feared';
        if (infamia >= 3) return 'notorious';
        return 'unknown';
    }

    static attachEventListeners(html, data) {
        // Infamia adjustments
        html.find('.infamia-adjust').click(ev => {
            const adjustment = parseInt($(ev.currentTarget).data('adjust'));
            const actor = game.actors.get(data.actor._id);
            const current = actor.getFlag('brancalonia-bigat', 'infamia') || 0;
            const max = actor.getFlag('brancalonia-bigat', 'infamiaMax') || 10;
            const newValue = Math.max(0, Math.min(max, current + adjustment));
            actor.setFlag('brancalonia-bigat', 'infamia', newValue);
        });

        // Baraonda actions
        html.find('.baraonda-btn').click(ev => {
            const action = $(ev.currentTarget).data('action');
            const actor = game.actors.get(data.actor._id);
            this.handleBaraondaAction(actor, action);
        });

        // Lavori Sporchi management
        html.find('.add-lavoro-btn').click(() => {
            this.openLavoroDialog(data.actor);
        });

        html.find('.toggle-lavoro').click(ev => {
            const idx = $(ev.currentTarget).data('lavoro-id');
            const actor = game.actors.get(data.actor._id);
            const lavori = actor.getFlag('brancalonia-bigat', 'lavoriSporchi') || [];
            if (lavori[idx]) {
                lavori[idx].completed = !lavori[idx].completed;
                actor.setFlag('brancalonia-bigat', 'lavoriSporchi', lavori);
            }
        });

        // Add member to Compagnia
        html.find('.add-member-btn').click(() => {
            this.openAddMemberDialog(data.actor);
        });

        // Add Malefatta
        html.find('.add-malefatta-btn').click(() => {
            this.openMalefattaDialog(data.actor);
        });
    }

    static handleBaraondaAction(actor, action) {
        switch(action) {
            case 'brawl-start':
                ChatMessage.create({
                    content: `<div class="brancalonia-message baraonda-start">
                        <h3>🍺 Baraonda! 🍺</h3>
                        <p><strong>${actor.name}</strong> inizia una rissa da taverna!</p>
                        <p>Che la battaglia abbia inizio!</p>
                    </div>`,
                    speaker: ChatMessage.getSpeaker({ actor })
                });
                break;
            case 'spend-point':
                const current = actor.getFlag('brancalonia-bigat', 'baraonda') || 0;
                if (current > 0) {
                    actor.setFlag('brancalonia-bigat', 'baraonda', current - 1);
                    ChatMessage.create({
                        content: `<div class="brancalonia-message baraonda-spend">
                            <p><strong>${actor.name}</strong> spende un Punto Baraonda!</p>
                            <p>Punti rimanenti: ${current - 1}</p>
                        </div>`,
                        speaker: ChatMessage.getSpeaker({ actor })
                    });
                }
                break;
            case 'reset':
                actor.setFlag('brancalonia-bigat', 'baraonda', 0);
                break;
        }
    }

    static openLavoroDialog(actor) {
        new Dialog({
            title: "Nuovo Lavoro Sporco",
            content: `
                <form>
                    <div class="form-group">
                        <label>Titolo del Lavoro:</label>
                        <input type="text" name="title" />
                    </div>
                    <div class="form-group">
                        <label>Cliente:</label>
                        <input type="text" name="client" />
                    </div>
                    <div class="form-group">
                        <label>Ricompensa (in monete):</label>
                        <input type="number" name="reward" value="0" />
                    </div>
                    <div class="form-group">
                        <label>Descrizione:</label>
                        <textarea name="description" rows="3"></textarea>
                    </div>
                </form>
            `,
            buttons: {
                save: {
                    label: "Aggiungi",
                    callback: (html) => {
                        const formData = new FormData(html[0].querySelector('form'));
                        const lavoro = {
                            title: formData.get('title'),
                            client: formData.get('client'),
                            reward: parseInt(formData.get('reward')),
                            description: formData.get('description'),
                            completed: false,
                            date: new Date().toLocaleDateString('it-IT')
                        };

                        const lavori = actor.getFlag('brancalonia-bigat', 'lavoriSporchi') || [];
                        lavori.push(lavoro);
                        actor.setFlag('brancalonia-bigat', 'lavoriSporchi', lavori);
                    }
                },
                cancel: {
                    label: "Annulla"
                }
            },
            default: "save"
        }).render(true);
    }

    static openAddMemberDialog(actor) {
        new Dialog({
            title: "Aggiungi Membro alla Compagnia",
            content: `
                <form>
                    <div class="form-group">
                        <label>Nome:</label>
                        <input type="text" name="name" />
                    </div>
                    <div class="form-group">
                        <label>Ruolo:</label>
                        <select name="role">
                            <option value="Capo">Capo</option>
                            <option value="Braccio Destro">Braccio Destro</option>
                            <option value="Picchiatore">Picchiatore</option>
                            <option value="Ladro">Ladro</option>
                            <option value="Truffatore">Truffatore</option>
                            <option value="Spia">Spia</option>
                            <option value="Mago">Mago</option>
                            <option value="Guaritore">Guaritore</option>
                        </select>
                    </div>
                </form>
            `,
            buttons: {
                save: {
                    label: "Aggiungi",
                    callback: (html) => {
                        const formData = new FormData(html[0].querySelector('form'));
                        const member = {
                            name: formData.get('name'),
                            role: formData.get('role')
                        };

                        const compagnia = actor.getFlag('brancalonia-bigat', 'compagnia') || {};
                        compagnia.membri = compagnia.membri || [];
                        compagnia.membri.push(member);
                        actor.setFlag('brancalonia-bigat', 'compagnia', compagnia);
                    }
                },
                cancel: {
                    label: "Annulla"
                }
            },
            default: "save"
        }).render(true);
    }

    static openMalefattaDialog(actor) {
        new Dialog({
            title: "Registra Malefatta",
            content: `
                <form>
                    <div class="form-group">
                        <label>Tipo di Crimine:</label>
                        <select name="type">
                            <option value="furto">Furto</option>
                            <option value="truffa">Truffa</option>
                            <option value="rissa">Rissa</option>
                            <option value="omicidio">Omicidio</option>
                            <option value="contrabbando">Contrabbando</option>
                            <option value="blasfemia">Blasfemia</option>
                            <option value="altro">Altro</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Descrizione:</label>
                        <textarea name="description" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Taglia (se presente):</label>
                        <input type="number" name="bounty" value="0" />
                    </div>
                </form>
            `,
            buttons: {
                save: {
                    label: "Registra",
                    callback: (html) => {
                        const formData = new FormData(html[0].querySelector('form'));
                        const malefatta = {
                            type: formData.get('type'),
                            description: formData.get('description'),
                            bounty: parseInt(formData.get('bounty')),
                            date: new Date().toLocaleDateString('it-IT')
                        };

                        const malefatte = actor.getFlag('brancalonia-bigat', 'malefatte') || [];
                        malefatte.push(malefatta);
                        actor.setFlag('brancalonia-bigat', 'malefatte', malefatte);

                        // Update Infamia
                        const currentInfamia = actor.getFlag('brancalonia-bigat', 'infamia') || 0;
                        const infamiaGain = malefatta.type === 'omicidio' ? 2 : 1;
                        actor.setFlag('brancalonia-bigat', 'infamia', Math.min(10, currentInfamia + infamiaGain));
                    }
                },
                cancel: {
                    label: "Annulla"
                }
            },
            default: "save"
        }).render(true);
    }
}

// Initialize when Foundry is ready
Hooks.once("ready", () => {
    BrancaloniaSheets.initialize();
});

// Export for use in other modules
export default BrancaloniaSheets;