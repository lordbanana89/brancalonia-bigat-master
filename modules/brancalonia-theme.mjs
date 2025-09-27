/**
 * Brancalonia Theme System
 * Italian Renaissance UI theming for Foundry VTT
 * Based on Project FU Theme architecture
 */

export class BrancaloniaTheme {
  static ID = 'brancalonia-bigat';
  static SETTINGS = {
    THEME_PRESET: 'themePreset',
    CUSTOM_COLORS: 'customColors',
    ENABLE_ANIMATIONS: 'enableAnimations',
    ENABLE_DECORATIONS: 'enableDecorations',
    DARK_MODE: 'darkMode'
  };

  // Italian Renaissance Color Presets
  static PRESETS = {
    taverna: {
      name: "Taverna Malandata",
      description: "Atmosfera di osteria con legni scuri e candele",
      colors: {
        primary: "#8B4513",        // Umber - legno scuro
        secondary: "#A0522D",      // Sienna - legno medio
        accent: "#FFD700",         // Gold - dettagli dorati
        background: "#2C1810",     // Dark wood
        surface: "#3E2723",        // Medium wood
        text: "#F5E6D3",          // Parchment
        textDark: "#2C1810",      // Dark text
        border: "#5D4037",        // Wood border
        highlight: "#FFA000",     // Amber highlight
        shadow: "rgba(0,0,0,0.8)", // Deep shadow
        error: "#B71C1C",         // Deep red
        success: "#1B5E20",       // Forest green
        warning: "#F57C00",       // Orange
        info: "#0D47A1"          // Deep blue
      }
    },
    palazzo: {
      name: "Palazzo Rinascimentale",
      description: "Eleganza nobiliare con ori e marmi",
      colors: {
        primary: "#B8860B",        // Dark goldenrod
        secondary: "#CD7F32",      // Bronze
        accent: "#FFD700",         // Pure gold
        background: "#1A1A1A",     // Black marble
        surface: "#2E2E2E",        // Dark stone
        text: "#F5E6D3",          // Parchment
        textDark: "#1A1A1A",      // Dark text
        border: "#6B5B3F",        // Bronze border
        highlight: "#FFE082",     // Light gold
        shadow: "rgba(0,0,0,0.6)", // Soft shadow
        error: "#C62828",         // Crimson
        success: "#2E7D32",       // Emerald
        warning: "#FF8F00",       // Amber
        info: "#1565C0"          // Sapphire
      }
    },
    cantina: {
      name: "Cantina del Vino",
      description: "Toni vinosi e atmosfera calda",
      colors: {
        primary: "#722F37",        // Wine red
        secondary: "#8B4513",      // Umber
        accent: "#CD7F32",         // Bronze
        background: "#1C0A0D",     // Deep wine
        surface: "#3C1518",        // Wine surface
        text: "#E8D7C3",          // Aged paper
        textDark: "#1C0A0D",      // Dark text
        border: "#5C2328",        // Wine border
        highlight: "#D4A574",     // Tan highlight
        shadow: "rgba(0,0,0,0.7)", // Medium shadow
        error: "#D32F2F",         // Red
        success: "#388E3C",       // Green
        warning: "#FFA726",       // Orange
        info: "#1976D2"          // Blue
      }
    },
    pergamena: {
      name: "Pergamena Antica",
      description: "Stile manoscritto medievale su pergamena",
      colors: {
        primary: "#8B7355",        // Tan brown
        secondary: "#A0826D",      // Beaver
        accent: "#B8860B",         // Goldenrod
        background: "#F5E6D3",     // Parchment
        surface: "#E8D7C3",        // Aged paper
        text: "#2C1810",          // Dark brown text
        textDark: "#F5E6D3",      // Light text for dark bg
        border: "#C4A57B",        // Tan border
        highlight: "#D4AF37",     // Old gold
        shadow: "rgba(92,51,23,0.3)", // Brown shadow
        error: "#8B0000",         // Dark red
        success: "#228B22",       // Forest green
        warning: "#B8860B",       // Dark goldenrod
        info: "#4682B4"          // Steel blue
      }
    }
  };

  static DEFAULTS = BrancaloniaTheme.PRESETS.taverna.colors;

  /**
   * Initialize the theme system
   */
  static init() {
    console.log("Brancalonia Theme System | Initializing...");

    // Register settings
    this.registerSettings();

    // Hook into Foundry's ready event
    Hooks.once('ready', () => {
      this.applyTheme();
      this.setupThemeControls();
      console.log("Brancalonia Theme System | Ready!");
    });

    // Apply theme on settings change
    Hooks.on('closeSettingsConfig', () => {
      this.applyTheme();
    });
  }

  /**
   * Register module settings
   */
  static registerSettings() {
    // Theme preset selection
    game.settings.register(this.ID, this.SETTINGS.THEME_PRESET, {
      name: "BRANCALONIA.Settings.ThemePreset",
      hint: "BRANCALONIA.Settings.ThemePresetHint",
      scope: "client",
      config: true,
      type: String,
      choices: Object.fromEntries(
        Object.entries(this.PRESETS).map(([key, preset]) => [key, preset.name])
      ),
      default: "taverna",
      onChange: value => this.applyTheme()
    });

    // Custom colors (stored as JSON)
    game.settings.register(this.ID, this.SETTINGS.CUSTOM_COLORS, {
      name: "BRANCALONIA.Settings.CustomColors",
      hint: "BRANCALONIA.Settings.CustomColorsHint",
      scope: "client",
      config: false,
      type: Object,
      default: {}
    });

    // Enable animations
    game.settings.register(this.ID, this.SETTINGS.ENABLE_ANIMATIONS, {
      name: "BRANCALONIA.Settings.EnableAnimations",
      hint: "BRANCALONIA.Settings.EnableAnimationsHint",
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
      onChange: value => this.toggleAnimations(value)
    });

    // Enable decorations
    game.settings.register(this.ID, this.SETTINGS.ENABLE_DECORATIONS, {
      name: "BRANCALONIA.Settings.EnableDecorations",
      hint: "BRANCALONIA.Settings.EnableDecorationsHint",
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
      onChange: value => this.toggleDecorations(value)
    });

    // Dark mode
    game.settings.register(this.ID, this.SETTINGS.DARK_MODE, {
      name: "BRANCALONIA.Settings.DarkMode",
      hint: "BRANCALONIA.Settings.DarkModeHint",
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
      onChange: value => this.toggleDarkMode(value)
    });
  }

  /**
   * Apply the selected theme
   */
  static applyTheme() {
    const presetKey = game.settings.get(this.ID, this.SETTINGS.THEME_PRESET);
    const customColors = game.settings.get(this.ID, this.SETTINGS.CUSTOM_COLORS);
    const preset = this.PRESETS[presetKey] || this.PRESETS.taverna;

    // Merge preset colors with custom colors
    const colors = { ...preset.colors, ...customColors };

    // Apply CSS variables
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--branca-${key}`, value);
    });

    // Apply theme class
    document.body.dataset.brancaTheme = presetKey;

    // Apply additional settings
    this.toggleAnimations(game.settings.get(this.ID, this.SETTINGS.ENABLE_ANIMATIONS));
    this.toggleDecorations(game.settings.get(this.ID, this.SETTINGS.ENABLE_DECORATIONS));
    this.toggleDarkMode(game.settings.get(this.ID, this.SETTINGS.DARK_MODE));

    console.log(`Brancalonia Theme System | Applied theme: ${preset.name}`);
  }

  /**
   * Toggle animations
   */
  static toggleAnimations(enabled) {
    document.body.classList.toggle('branca-no-animations', !enabled);
  }

  /**
   * Toggle decorations
   */
  static toggleDecorations(enabled) {
    document.body.classList.toggle('branca-no-decorations', !enabled);
  }

  /**
   * Toggle dark mode
   */
  static toggleDarkMode(enabled) {
    document.body.classList.toggle('branca-light-mode', !enabled);
  }

  /**
   * Setup theme controls in the UI
   */
  static setupThemeControls() {
    // Add theme picker button to settings
    Hooks.on('renderSettings', (app, html) => {
      const button = $(`
        <button class="branca-theme-picker">
          <i class="fas fa-palette"></i>
          ${game.i18n.localize("BRANCALONIA.ThemePicker")}
        </button>
      `);

      button.on('click', () => this.openThemePicker());
      html.find('.settings-sidebar').append(button);
    });
  }

  /**
   * Open theme picker dialog
   */
  static async openThemePicker() {
    const content = await renderTemplate('modules/brancalonia-bigat/templates/theme-picker.html', {
      presets: this.PRESETS,
      current: game.settings.get(this.ID, this.SETTINGS.THEME_PRESET),
      customColors: game.settings.get(this.ID, this.SETTINGS.CUSTOM_COLORS)
    });

    new Dialog({
      title: game.i18n.localize("BRANCALONIA.ThemePickerTitle"),
      content: content,
      buttons: {
        save: {
          icon: '<i class="fas fa-save"></i>',
          label: game.i18n.localize("Save"),
          callback: html => this.saveThemeSettings(html)
        },
        export: {
          icon: '<i class="fas fa-download"></i>',
          label: game.i18n.localize("Export"),
          callback: () => this.exportTheme()
        },
        import: {
          icon: '<i class="fas fa-upload"></i>',
          label: game.i18n.localize("Import"),
          callback: () => this.importTheme()
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("Cancel")
        }
      },
      default: "save",
      render: html => {
        // Add color picker functionality
        html.find('input[type="color"]').on('change', (e) => {
          const colorKey = e.currentTarget.dataset.color;
          const value = e.currentTarget.value;
          document.documentElement.style.setProperty(`--branca-${colorKey}`, value);
        });

        // Add preset switcher
        html.find('select[name="preset"]').on('change', (e) => {
          const presetKey = e.currentTarget.value;
          const preset = this.PRESETS[presetKey];
          if (preset) {
            Object.entries(preset.colors).forEach(([key, value]) => {
              html.find(`input[data-color="${key}"]`).val(value);
              document.documentElement.style.setProperty(`--branca-${key}`, value);
            });
          }
        });
      }
    }, {
      width: 600,
      classes: ["branca-theme-picker-dialog"]
    }).render(true);
  }

  /**
   * Save theme settings from picker dialog
   */
  static async saveThemeSettings(html) {
    const formData = new FormDataExtended(html[0].querySelector('form')).object;

    // Save preset
    await game.settings.set(this.ID, this.SETTINGS.THEME_PRESET, formData.preset);

    // Save custom colors
    const customColors = {};
    html.find('input[type="color"]').each((i, el) => {
      const colorKey = el.dataset.color;
      const presetValue = this.PRESETS[formData.preset].colors[colorKey];
      if (el.value !== presetValue) {
        customColors[colorKey] = el.value;
      }
    });

    await game.settings.set(this.ID, this.SETTINGS.CUSTOM_COLORS, customColors);

    // Apply theme
    this.applyTheme();

    ui.notifications.info(game.i18n.localize("BRANCALONIA.ThemeSaved"));
  }

  /**
   * Export current theme settings
   */
  static exportTheme() {
    const settings = {
      preset: game.settings.get(this.ID, this.SETTINGS.THEME_PRESET),
      customColors: game.settings.get(this.ID, this.SETTINGS.CUSTOM_COLORS),
      animations: game.settings.get(this.ID, this.SETTINGS.ENABLE_ANIMATIONS),
      decorations: game.settings.get(this.ID, this.SETTINGS.ENABLE_DECORATIONS),
      darkMode: game.settings.get(this.ID, this.SETTINGS.DARK_MODE)
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    saveDataToFile(dataBlob, 'brancalonia-theme.json');

    ui.notifications.info(game.i18n.localize("BRANCALONIA.ThemeExported"));
  }

  /**
   * Import theme settings
   */
  static async importTheme() {
    new Dialog({
      title: game.i18n.localize("BRANCALONIA.ImportTheme"),
      content: `
        <form>
          <div class="form-group">
            <label>${game.i18n.localize("BRANCALONIA.SelectThemeFile")}</label>
            <input type="file" name="theme-file" accept=".json">
          </div>
        </form>
      `,
      buttons: {
        import: {
          icon: '<i class="fas fa-upload"></i>',
          label: game.i18n.localize("Import"),
          callback: async html => {
            const file = html.find('input[type="file"]')[0].files[0];
            if (!file) return;

            const text = await file.text();
            try {
              const settings = JSON.parse(text);

              // Apply imported settings
              for (const [key, value] of Object.entries(settings)) {
                const settingKey = this.SETTINGS[key.toUpperCase().replace(/([A-Z])/g, '_$1')];
                if (settingKey) {
                  await game.settings.set(this.ID, settingKey, value);
                }
              }

              this.applyTheme();
              ui.notifications.info(game.i18n.localize("BRANCALONIA.ThemeImported"));
            } catch (err) {
              ui.notifications.error(game.i18n.localize("BRANCALONIA.ThemeImportError"));
              console.error("Brancalonia Theme System | Import error:", err);
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("Cancel")
        }
      },
      default: "import"
    }).render(true);
  }

  /**
   * Add Renaissance decorative elements
   */
  static addDecorativeElements() {
    // Add ornamental corners to windows
    Hooks.on('renderApplication', (app, html) => {
      if (!game.settings.get(this.ID, this.SETTINGS.ENABLE_DECORATIONS)) return;

      const window = html.closest('.window-app');
      if (window.length && !window.hasClass('branca-decorated')) {
        window.addClass('branca-decorated');

        // Add corner decorations
        const corners = ['tl', 'tr', 'bl', 'br'];
        corners.forEach(corner => {
          window.append(`<div class="branca-corner branca-corner-${corner}"></div>`);
        });
      }
    });

    // Add flourishes to chat messages
    Hooks.on('renderChatMessage', (message, html) => {
      if (!game.settings.get(this.ID, this.SETTINGS.ENABLE_DECORATIONS)) return;

      // Add Italian exclamations for critical rolls
      if (message.isRoll) {
        const roll = message.rolls[0];
        if (roll?.dice[0]?.results[0]?.result === 20) {
          html.find('.message-header').append('<span class="branca-crit">Magnifico!</span>');
        } else if (roll?.dice[0]?.results[0]?.result === 1) {
          html.find('.message-header').append('<span class="branca-fumble">Maledizione!</span>');
        }
      }
    });
  }
}

// Initialize theme system
Hooks.once('init', () => {
  BrancaloniaTheme.init();
  BrancaloniaTheme.addDecorativeElements();
});

// Export for use in other modules
window.BrancaloniaTheme = BrancaloniaTheme;