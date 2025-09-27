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

  // Brancalonia "Spaghetti Fantasy" Color Presets
  // Dirty, worn, picaresque - not noble Renaissance!
  static PRESETS = {
    taverna: {
      name: "Taverna Malandata",
      description: "Dirty tavern with smoke stains, spilled wine, and greasy surfaces",
      colors: {
        primary: "#4A3426",        // Smoke-stained wood
        secondary: "#6B4C3A",      // Dirty brown wood
        accent: "#B8956A",         // Tarnished brass - not pure gold!
        background: "#1F1612",     // Soot-darkened walls
        surface: "#342821",        // Greasy, worn wood
        text: "#D4C4A8",          // Yellowed, dirty parchment
        textDark: "#2B1F15",      // Grease-darkened text
        border: "#52392B",        // Wine-stained wood
        highlight: "#C9A671",     // Cheap candle light
        shadow: "rgba(0,0,0,0.9)", // Deep tavern shadows
        error: "#7A2E2E",         // Dried blood red
        success: "#3B4A2F",       // Moldy green
        warning: "#8B6239",       // Dirty amber
        info: "#3D4654"          // Dusty blue
      }
    },
    strada: {
      name: "Strada Fangosa",
      description: "Muddy roads, dust, worn leather, rust and grime",
      colors: {
        primary: "#5C4A3C",        // Dried mud
        secondary: "#6B5D4F",      // Road dust
        accent: "#A68B5B",         // Worn leather
        background: "#2A231C",     // Dark mud
        surface: "#3E342A",        // Dusty ground
        text: "#C8B89E",          // Dust-covered parchment
        textDark: "#2A231C",      // Mud text
        border: "#4F4136",        // Rusty iron
        highlight: "#B39573",     // Dirty sunlight
        shadow: "rgba(0,0,0,0.85)", // Deep street shadows
        error: "#8B4444",         // Rust red
        success: "#4A5739",       // Roadside weeds
        warning: "#9A6E3A",       // Dirty copper
        info: "#465360"          // Puddle water blue
      }
    },
    pergamena: {
      name: "Pergamena Macchiata",
      description: "Stained parchment with wine spills, grease marks, and faded ink",
      colors: {
        primary: "#7A6A57",        // Coffee-stained paper
        secondary: "#8B7B68",      // Grease-marked vellum
        accent: "#9B8061",         // Worn bronze ink
        background: "#D4C2A6",     // Stained parchment
        surface: "#C8B69C",        // Yellowed paper
        text: "#3A2F24",          // Faded brown ink
        textDark: "#C8B69C",      // Light text for dark bg
        border: "#8C7A66",        // Water-stained edges
        highlight: "#A89171",     // Wine spill highlight
        shadow: "rgba(92,51,23,0.4)", // Brown ink shadow
        error: "#6B3333",         // Dried blood ink
        success: "#4A5A3A",       // Moldy paper green
        warning: "#8B6F47",       // Candle wax yellow
        info: "#4A5866"          // Faded blue ink
      }
    },
    mercato: {
      name: "Mercato Popolare",
      description: "Market stalls with cheap fabrics, worn copper, tarnished metals",
      colors: {
        primary: "#6B5843",        // Worn burlap
        secondary: "#7A6651",      // Dirty canvas
        accent: "#8B7355",         // Tarnished copper
        background: "#2C2418",     // Market dirt
        surface: "#3A3025",        // Stall wood
        text: "#C4B5A0",          // Cheap paper
        textDark: "#2C2418",      // Charcoal text
        border: "#5A4A3A",        // Rusty metal
        highlight: "#9B8469",     // Dirty brass
        shadow: "rgba(0,0,0,0.8)", // Market shadows
        error: "#7A3F3F",         // Rotten fruit red
        success: "#495940",       // Wilted vegetable green
        warning: "#8A6841",       // Cheap oil lamp
        info: "#4A5A6A"          // Dirty cloth blue
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
    Hooks.on("renderChatLog", (message, html) => {
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