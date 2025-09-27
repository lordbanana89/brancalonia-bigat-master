/**
 * BRANCALONIA UI CONFIGURATION
 * Manages UI settings and theme preferences for Italian Renaissance interface
 */

export class BrancaloniaUIConfig {

    static ID = 'brancalonia-bigat';
    static SETTINGS = {
        THEME_ENABLED: 'themeEnabled',
        DARK_MODE: 'darkMode',
        CHAT_STYLING: 'chatStyling',
        DICE_MESSAGES: 'diceMessages',
        PORTRAIT_FRAMES: 'portraitFrames',
        CUSTOM_CURSORS: 'customCursors',
        ITALIAN_TERMS: 'italianTerms',
        DECORATIVE_ELEMENTS: 'decorativeElements',
        ANIMATION_SPEED: 'animationSpeed',
        TEXTURE_QUALITY: 'textureQuality'
    };

    static initialize() {
        console.log("⚙️ Brancalonia UI Config | Registering settings");
        this.registerSettings();
        this.registerMenus();
        this.applySettings();
    }

    static registerSettings() {
        // Main theme toggle
        game.settings.register(this.ID, this.SETTINGS.THEME_ENABLED, {
            name: "Abilita Tema Rinascimentale",
            hint: "Attiva il tema completo dell'interfaccia italiana rinascimentale",
            scope: "client",
            config: true,
            type: Boolean,
            default: true,
            onChange: value => this.toggleTheme(value)
        });

        // Dark mode support
        game.settings.register(this.ID, this.SETTINGS.DARK_MODE, {
            name: "Modalità Scura",
            hint: "Usa una versione più scura del tema per ambienti con poca luce",
            scope: "client",
            config: true,
            type: Boolean,
            default: false,
            onChange: value => this.toggleDarkMode(value)
        });

        // Chat message styling
        game.settings.register(this.ID, this.SETTINGS.CHAT_STYLING, {
            name: "Stilizzazione Chat",
            hint: "Applica lo stile rinascimentale ai messaggi in chat",
            scope: "client",
            config: true,
            type: Boolean,
            default: true,
            onChange: value => this.toggleChatStyling(value)
        });

        // Italian dice messages
        game.settings.register(this.ID, this.SETTINGS.DICE_MESSAGES, {
            name: "Messaggi Italiani per i Dadi",
            hint: "Mostra esclamazioni italiane per tiri critici e fallimenti",
            scope: "client",
            config: true,
            type: Boolean,
            default: true
        });

        // Portrait frames
        game.settings.register(this.ID, this.SETTINGS.PORTRAIT_FRAMES, {
            name: "Cornici Ritratti Ornate",
            hint: "Aggiungi cornici dorate rinascimentali ai ritratti dei personaggi",
            scope: "client",
            config: true,
            type: Boolean,
            default: true,
            onChange: value => this.togglePortraitFrames(value)
        });

        // Custom cursors
        game.settings.register(this.ID, this.SETTINGS.CUSTOM_CURSORS, {
            name: "Cursori Personalizzati",
            hint: "Usa cursori del mouse in stile rinascimentale",
            scope: "client",
            config: true,
            type: Boolean,
            default: false,
            onChange: value => this.toggleCustomCursors(value)
        });

        // Italian terminology
        game.settings.register(this.ID, this.SETTINGS.ITALIAN_TERMS, {
            name: "Terminologia Italiana",
            hint: "Traduci i termini di gioco in italiano",
            scope: "client",
            config: true,
            type: Boolean,
            default: true,
            onChange: value => this.toggleItalianTerms(value)
        });

        // Decorative elements
        game.settings.register(this.ID, this.SETTINGS.DECORATIVE_ELEMENTS, {
            name: "Elementi Decorativi",
            hint: "Mostra ornamenti e decorazioni rinascimentali",
            scope: "client",
            config: true,
            type: Boolean,
            default: true,
            onChange: value => this.toggleDecorativeElements(value)
        });

        // Animation speed
        game.settings.register(this.ID, this.SETTINGS.ANIMATION_SPEED, {
            name: "Velocità Animazioni",
            hint: "Controlla la velocità delle animazioni dell'interfaccia",
            scope: "client",
            config: true,
            type: String,
            choices: {
                "none": "Nessuna Animazione",
                "fast": "Veloce",
                "normal": "Normale",
                "slow": "Lenta"
            },
            default: "normal",
            onChange: value => this.setAnimationSpeed(value)
        });

        // Texture quality
        game.settings.register(this.ID, this.SETTINGS.TEXTURE_QUALITY, {
            name: "Qualità Texture",
            hint: "Seleziona la qualità delle texture di sfondo",
            scope: "client",
            config: true,
            type: String,
            choices: {
                "low": "Bassa (Prestazioni)",
                "medium": "Media",
                "high": "Alta (Qualità)"
            },
            default: "medium",
            onChange: value => this.setTextureQuality(value)
        });
    }

    static registerMenus() {
        // Advanced UI configuration menu
        game.settings.registerMenu(this.ID, "uiConfigMenu", {
            name: "Configurazione Avanzata UI",
            label: "Configura",
            hint: "Apri il pannello di configurazione avanzata per l'interfaccia Brancalonia",
            icon: "fas fa-palette",
            type: BrancaloniaUIConfigMenu,
            restricted: false
        });
    }

    static applySettings() {
        // Apply all current settings on initialization
        const theme = game.settings.get(this.ID, this.SETTINGS.THEME_ENABLED);
        if (theme) {
            this.toggleTheme(true);
        }

        const darkMode = game.settings.get(this.ID, this.SETTINGS.DARK_MODE);
        if (darkMode) {
            this.toggleDarkMode(true);
        }

        const animSpeed = game.settings.get(this.ID, this.SETTINGS.ANIMATION_SPEED);
        this.setAnimationSpeed(animSpeed);

        const textureQuality = game.settings.get(this.ID, this.SETTINGS.TEXTURE_QUALITY);
        this.setTextureQuality(textureQuality);
    }

    static toggleTheme(enabled) {
        const body = document.body;
        if (enabled) {
            body.classList.add('brancalonia-theme');
            body.classList.add('italian-renaissance');
            console.log("🎨 Tema Rinascimentale attivato");
        } else {
            body.classList.remove('brancalonia-theme');
            body.classList.remove('italian-renaissance');
            console.log("🎨 Tema Rinascimentale disattivato");
        }
    }

    static toggleDarkMode(enabled) {
        const root = document.documentElement;
        if (enabled) {
            root.classList.add('brancalonia-dark-mode');
            // Override CSS variables for dark mode
            root.style.setProperty('--brancalonia-parchment', '#2C2416');
            root.style.setProperty('--brancalonia-cream', '#3A342C');
            root.style.setProperty('--brancalonia-ochre', '#8B6F47');
            root.style.setProperty('--brancalonia-gold', '#B8860B');
        } else {
            root.classList.remove('brancalonia-dark-mode');
            // Reset to light mode colors
            root.style.setProperty('--brancalonia-parchment', '#F4E4BC');
            root.style.setProperty('--brancalonia-cream', '#FFF8DC');
            root.style.setProperty('--brancalonia-ochre', '#CC9966');
            root.style.setProperty('--brancalonia-gold', '#FFD700');
        }
    }

    static toggleChatStyling(enabled) {
        const chat = document.getElementById('chat-log');
        if (chat) {
            if (enabled) {
                chat.classList.add('brancalonia-chat');
            } else {
                chat.classList.remove('brancalonia-chat');
            }
        }
    }

    static togglePortraitFrames(enabled) {
        document.body.classList.toggle('brancalonia-portrait-frames', enabled);
    }

    static toggleCustomCursors(enabled) {
        if (enabled) {
            document.body.classList.add('brancalonia-custom-cursors');
        } else {
            document.body.classList.remove('brancalonia-custom-cursors');
        }
    }

    static toggleItalianTerms(enabled) {
        document.body.classList.toggle('brancalonia-italian-terms', enabled);
    }

    static toggleDecorativeElements(enabled) {
        document.body.classList.toggle('brancalonia-decorations', enabled);
    }

    static setAnimationSpeed(speed) {
        const root = document.documentElement;
        const speeds = {
            "none": "0s",
            "fast": "0.15s",
            "normal": "0.3s",
            "slow": "0.5s"
        };
        root.style.setProperty('--brancalonia-transition-speed', speeds[speed]);

        if (speed === "none") {
            root.classList.add('brancalonia-no-animations');
        } else {
            root.classList.remove('brancalonia-no-animations');
        }
    }

    static setTextureQuality(quality) {
        const root = document.documentElement;
        const qualities = {
            "low": "low-quality",
            "medium": "medium-quality",
            "high": "high-quality"
        };

        // Remove all quality classes
        Object.values(qualities).forEach(q => root.classList.remove(`brancalonia-textures-${q}`));

        // Add selected quality class
        root.classList.add(`brancalonia-textures-${qualities[quality]}`);
    }

    static exportSettings() {
        // Export current UI settings
        const settings = {};
        Object.values(this.SETTINGS).forEach(key => {
            settings[key] = game.settings.get(this.ID, key);
        });

        const data = {
            module: this.ID,
            version: game.modules.get(this.ID).version,
            settings: settings
        };

        const filename = `brancalonia-ui-settings-${Date.now()}.json`;
        saveDataToFile(JSON.stringify(data, null, 2), "text/json", filename);
    }

    static async importSettings(file) {
        // Import UI settings from file
        try {
            const content = await readTextFromFile(file);
            const data = JSON.parse(content);

            if (data.module !== this.ID) {
                ui.notifications.error("File di configurazione non valido!");
                return;
            }

            for (const [key, value] of Object.entries(data.settings)) {
                if (Object.values(this.SETTINGS).includes(key)) {
                    await game.settings.set(this.ID, key, value);
                }
            }

            ui.notifications.info("Configurazione UI importata con successo!");
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            ui.notifications.error("Errore nell'importazione della configurazione!");
            console.error(err);
        }
    }
}

/**
 * Advanced UI Configuration Menu
 */
class BrancaloniaUIConfigMenu extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "brancalonia-ui-config",
            title: "Configurazione Avanzata UI Brancalonia",
            template: "modules/brancalonia-bigat/templates/ui-config.html",
            width: 600,
            height: "auto",
            closeOnSubmit: true
        });
    }

    getData(options) {
        const data = {};

        // Get all current settings
        Object.entries(BrancaloniaUIConfig.SETTINGS).forEach(([key, setting]) => {
            data[key] = game.settings.get(BrancaloniaUIConfig.ID, setting);
        });

        // Add color palette for customization
        data.colorPalette = {
            ochre: getComputedStyle(document.documentElement).getPropertyValue('--brancalonia-ochre'),
            sienna: getComputedStyle(document.documentElement).getPropertyValue('--brancalonia-sienna'),
            umber: getComputedStyle(document.documentElement).getPropertyValue('--brancalonia-umber'),
            wine: getComputedStyle(document.documentElement).getPropertyValue('--brancalonia-wine'),
            gold: getComputedStyle(document.documentElement).getPropertyValue('--brancalonia-gold'),
            bronze: getComputedStyle(document.documentElement).getPropertyValue('--brancalonia-bronze')
        };

        return data;
    }

    async _updateObject(event, formData) {
        // Save all settings
        for (const [key, value] of Object.entries(formData)) {
            if (Object.values(BrancaloniaUIConfig.SETTINGS).includes(key)) {
                await game.settings.set(BrancaloniaUIConfig.ID, key, value);
            }
        }

        // Apply custom colors if changed
        if (formData.customColors) {
            this.applyCustomColors(formData);
        }

        ui.notifications.info("Configurazione UI salvata con successo!");
    }

    applyCustomColors(formData) {
        const root = document.documentElement;

        if (formData.colorOchre) root.style.setProperty('--brancalonia-ochre', formData.colorOchre);
        if (formData.colorSienna) root.style.setProperty('--brancalonia-sienna', formData.colorSienna);
        if (formData.colorUmber) root.style.setProperty('--brancalonia-umber', formData.colorUmber);
        if (formData.colorWine) root.style.setProperty('--brancalonia-wine', formData.colorWine);
        if (formData.colorGold) root.style.setProperty('--brancalonia-gold', formData.colorGold);
        if (formData.colorBronze) root.style.setProperty('--brancalonia-bronze', formData.colorBronze);
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Export settings button
        html.find('.export-settings').click(() => {
            BrancaloniaUIConfig.exportSettings();
        });

        // Import settings button
        html.find('.import-settings').click(() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (file) {
                    await BrancaloniaUIConfig.importSettings(file);
                }
            };
            input.click();
        });

        // Reset to defaults button
        html.find('.reset-defaults').click(async () => {
            const confirmed = await Dialog.confirm({
                title: "Ripristina Impostazioni Predefinite",
                content: "<p>Sei sicuro di voler ripristinare tutte le impostazioni UI ai valori predefiniti?</p>",
                yes: () => true,
                no: () => false
            });

            if (confirmed) {
                for (const setting of Object.values(BrancaloniaUIConfig.SETTINGS)) {
                    const defaultValue = game.settings.settings.get(`${BrancaloniaUIConfig.ID}.${setting}`).default;
                    await game.settings.set(BrancaloniaUIConfig.ID, setting, defaultValue);
                }
                this.render();
                ui.notifications.info("Impostazioni ripristinate ai valori predefiniti!");
            }
        });

        // Preview changes in real-time
        html.find('input, select').on('change', (event) => {
            const input = event.currentTarget;
            const setting = input.name;
            const value = input.type === 'checkbox' ? input.checked : input.value;

            // Apply preview immediately (without saving)
            if (setting === 'darkMode') {
                BrancaloniaUIConfig.toggleDarkMode(value);
            } else if (setting === 'decorativeElements') {
                BrancaloniaUIConfig.toggleDecorativeElements(value);
            } else if (setting === 'animationSpeed') {
                BrancaloniaUIConfig.setAnimationSpeed(value);
            }
        });
    }
}

// Initialize when Foundry is ready
Hooks.once("init", () => {
    BrancaloniaUIConfig.initialize();
});

// Re-apply settings after game is ready
Hooks.once("ready", () => {
    BrancaloniaUIConfig.applySettings();
    console.log("✅ Brancalonia UI Config | Settings applied");
});

// Export for use in other modules
export default BrancaloniaUIConfig;