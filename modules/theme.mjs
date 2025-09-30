/* ===================================== */
/* BRANCALONIA THEME SYSTEM */
/* Basato su ProjectFU Theme Architecture */
/* ===================================== */

export class Theme {
  constructor(data = {}) {
    // Colori base tema pergamena
    this.colors = {
      // Controls
      controlContent: data.colors?.controlContent ?? "#E8DCC0",
      controlBorder: data.colors?.controlBorder ?? "#B8985A",
      controlFocusContent: data.colors?.controlFocusContent ?? "#FFFFFF",
      controlInactiveContent: data.colors?.controlInactiveContent ?? "#D4C4A080",
      controlFill1: data.colors?.controlFill1 ?? "#3A302866",
      controlFill2: data.colors?.controlFill2 ?? "#5A504A66",

      controlHighlightContent: data.colors?.controlHighlightContent ?? "#B87333",
      controlHighlightBorder: data.colors?.controlHighlightBorder ?? "#B87333",
      controlHighlightFill1: data.colors?.controlHighlightFill1 ?? "#C9A961",
      controlHighlightFill2: data.colors?.controlHighlightFill2 ?? "#D4AA6E",

      controlActiveContent: data.colors?.controlActiveContent ?? "#C9A961",
      controlActiveBorder: data.colors?.controlActiveBorder ?? "#C9A961",
      controlActiveFill1: data.colors?.controlActiveFill1 ?? "#B87333CC",
      controlActiveFill2: data.colors?.controlActiveFill2 ?? "#C9A961CC",

      // Applications
      appHeaderContent: data.colors?.appHeaderContent ?? "#E8DCC0",
      appHeaderFocusContent: data.colors?.appHeaderFocusContent ?? "#FFFFFF",
      appHeaderFill1: data.colors?.appHeaderFill1 ?? "#8B26354D",
      appHeaderFill2: data.colors?.appHeaderFill2 ?? "#7221294D",

      appBodyContent: data.colors?.appBodyContent ?? "#3A3028",
      appBodyContentSecondary: data.colors?.appBodyContentSecondary ?? "#5A504A",
      appBodyPrimaryFill1: data.colors?.appBodyPrimaryFill1 ?? "#D4C4A0E6",
      appBodyPrimaryFill2: data.colors?.appBodyPrimaryFill2 ?? "#E8DCC0E6",

      appBorder: data.colors?.appBorder ?? "#B8985A",
      appNameSectionContent: data.colors?.appNameSectionContent ?? "#E8DCC0",
      appNameSectionShadow: data.colors?.appNameSectionShadow ?? "#00000099",

      // Misc
      miscBorder: data.colors?.miscBorder ?? "#B8985A",
      miscFill: data.colors?.miscFill ?? "#D4C4A04D",
      miscFillPrimary: data.colors?.miscFillPrimary ?? "#3A302833",
      miscFillSecondary: data.colors?.miscFillSecondary ?? "#B8985A1A",
      miscInactiveContent: data.colors?.miscInactiveContent ?? "#5A504A80",
      miscShadowHighlight: data.colors?.miscShadowHighlight ?? "#C9A961",
      miscLinkIdle: data.colors?.miscLinkIdle ?? "#B87333",
      miscLinkFocus: data.colors?.miscLinkFocus ?? "#8B2635",
      miscReroll: data.colors?.miscReroll ?? "#8B2635"
    };

    // Immagini tema
    this.images = {
      appAccentImage: data.images?.appAccentImage ?? "modules/brancalonia-bigat/assets/artwork/fond.webp",
      appSectionBgImage: data.images?.appSectionBgImage ?? "",
      appBgImage: data.images?.appBgImage ?? "",
      sidebarBgImage: data.images?.sidebarBgImage ?? ""
    };

    // Advanced CSS personalizzato
    this.advanced = data.advanced ?? "";
  }

  /**
   * Crea un'istanza Theme da dati JSON
   */
  static from(themeData) {
    if (themeData instanceof Theme) return themeData;
    return new Theme(themeData);
  }

  /**
   * Applica il tema al documento
   */
  apply() {
    // Rimuovi CSS tema precedente
    document.querySelector("#brancalonia-theme-css")?.remove();

    // Genera CSS variabili
    const css = this.generateCSS();

    // Crea e inserisci elemento style
    const style = document.createElement("style");
    style.id = "brancalonia-theme-css";
    style.innerHTML = css;
    document.head.appendChild(style);

    // Applica classi al body - CORRETTO per CSS v11.2.0+
    document.body.classList.add("theme-brancalonia");
    // Rimuovi classi legacy se presenti
    document.body.classList.remove("brancalonia-theme", "pergamena-theme");

    console.log("Brancalonia | Tema applicato con theme-brancalonia class");
  }

  /**
   * Genera il CSS del tema
   */
  generateCSS() {
    let css = ":root {\n";

    // Genera variabili colore
    css += "  /* Control Colors */\n";
    css += `  --pfu-color-control-content: ${this.colors.controlContent};\n`;
    css += `  --pfu-color-control-border: ${this.colors.controlBorder};\n`;
    css += `  --pfu-color-control-focus-content: ${this.colors.controlFocusContent};\n`;
    css += `  --pfu-color-control-inactive-content: ${this.colors.controlInactiveContent};\n`;
    css += `  --pfu-color-control-fill-1: ${this.colors.controlFill1};\n`;
    css += `  --pfu-color-control-fill-2: ${this.colors.controlFill2};\n`;
    css += `  --pfu-color-control-fill: linear-gradient(180deg, var(--pfu-color-control-fill-1) 0%, var(--pfu-color-control-fill-2) 100%);\n`;

    css += "\n  /* Control Highlight */\n";
    css += `  --pfu-color-control-highlight-content: ${this.colors.controlHighlightContent};\n`;
    css += `  --pfu-color-control-highlight-border: ${this.colors.controlHighlightBorder};\n`;
    css += `  --pfu-color-control-highlight-fill-1: ${this.colors.controlHighlightFill1};\n`;
    css += `  --pfu-color-control-highlight-fill-2: ${this.colors.controlHighlightFill2};\n`;
    css += `  --pfu-color-control-highlight-fill: linear-gradient(0deg, var(--pfu-color-control-highlight-fill-1) 0%, var(--pfu-color-control-highlight-fill-2) 100%);\n`;

    css += "\n  /* Control Active */\n";
    css += `  --pfu-color-control-active-content: ${this.colors.controlActiveContent};\n`;
    css += `  --pfu-color-control-active-border: ${this.colors.controlActiveBorder};\n`;
    css += `  --pfu-color-control-active-fill-1: ${this.colors.controlActiveFill1};\n`;
    css += `  --pfu-color-control-active-fill-2: ${this.colors.controlActiveFill2};\n`;
    css += `  --pfu-color-control-active-fill: linear-gradient(0deg, var(--pfu-color-control-active-fill-1) 0%, var(--pfu-color-control-active-fill-2) 100%);\n`;

    css += "\n  /* Application Colors */\n";
    css += `  --pfu-color-app-header-content: ${this.colors.appHeaderContent};\n`;
    css += `  --pfu-color-app-header-focus-content: ${this.colors.appHeaderFocusContent};\n`;
    css += `  --pfu-color-app-header-fill-1: ${this.colors.appHeaderFill1};\n`;
    css += `  --pfu-color-app-header-fill-2: ${this.colors.appHeaderFill2};\n`;
    css += `  --pfu-color-app-header-fill: linear-gradient(90deg, var(--pfu-color-app-header-fill-1) 0%, var(--pfu-color-app-header-fill-2) 100%);\n`;

    css += `  --pfu-color-app-body-content: ${this.colors.appBodyContent};\n`;
    css += `  --pfu-color-app-body-content-secondary: ${this.colors.appBodyContentSecondary};\n`;
    css += `  --pfu-color-app-body-primary-fill-1: ${this.colors.appBodyPrimaryFill1};\n`;
    css += `  --pfu-color-app-body-primary-fill-2: ${this.colors.appBodyPrimaryFill2};\n`;
    css += `  --pfu-color-app-body-primary-fill: linear-gradient(270deg, var(--pfu-color-app-body-primary-fill-1) 0%, var(--pfu-color-app-body-primary-fill-2) 100%);\n`;

    css += `  --pfu-color-app-border: ${this.colors.appBorder};\n`;
    css += `  --pfu-color-app-name-section-content: ${this.colors.appNameSectionContent};\n`;
    css += `  --pfu-color-app-name-section-shadow: ${this.colors.appNameSectionShadow};\n`;

    css += "\n  /* Misc Colors */\n";
    css += `  --pfu-color-misc-border: ${this.colors.miscBorder};\n`;
    css += `  --pfu-color-misc-fill: ${this.colors.miscFill};\n`;
    css += `  --pfu-color-misc-fill-primary: ${this.colors.miscFillPrimary};\n`;
    css += `  --pfu-color-misc-fill-secondary: ${this.colors.miscFillSecondary};\n`;
    css += `  --pfu-color-misc-inactive-content: ${this.colors.miscInactiveContent};\n`;
    css += `  --pfu-color-misc-shadow-highlight: ${this.colors.miscShadowHighlight};\n`;
    css += `  --pfu-color-misc-link-idle: ${this.colors.miscLinkIdle};\n`;
    css += `  --pfu-color-misc-link-focus: ${this.colors.miscLinkFocus};\n`;
    css += `  --pfu-color-misc-reroll: ${this.colors.miscReroll};\n`;

    // Immagini
    if (this.images.appAccentImage) {
      css += `\n  --pfu-app-accent-image: url("${this.images.appAccentImage}");\n`;
    }
    if (this.images.appSectionBgImage) {
      css += `  --pfu-app-section-bg-image: url("${this.images.appSectionBgImage}");\n`;
    }
    if (this.images.appBgImage) {
      css += `  --pfu-app-bg-image: url("${this.images.appBgImage}");\n`;
    }
    if (this.images.sidebarBgImage) {
      css += `  --pfu-sidebar-bg-image: url("${this.images.sidebarBgImage}");\n`;
    }

    // D&D 5e compatibility
    css += "\n  /* D&D 5e Compatibility */\n";
    css += `  --color-border-dark: ${this.colors.appBorder};\n`;
    css += `  --color-border-light: ${this.colors.controlBorder};\n`;
    css += `  --color-bg-option: ${this.colors.appBodyPrimaryFill1};\n`;
    css += `  --color-text-dark-primary: ${this.colors.appBodyContent};\n`;
    css += `  --color-text-dark-secondary: ${this.colors.appBodyContentSecondary};\n`;
    css += `  --color-text-light-primary: ${this.colors.appHeaderContent};\n`;
    css += `  --color-shadow-primary: #00000066;\n`;

    // Border radius
    css += "\n  /* Border Radius */\n";
    css += "  --pfu-border-radius-small: 4px;\n";
    css += "  --pfu-border-radius-medium: 8px;\n";
    css += "  --pfu-border-radius-large: 12px;\n";

    css += "}\n";

    // Advanced CSS
    if (this.advanced) {
      css += "\n/* Advanced Custom CSS */\n";
      css += this.advanced;
    }

    return css;
  }

  /**
   * Esporta il tema come JSON
   */
  exportToJson() {
    const data = {
      colors: this.colors,
      images: this.images,
      advanced: this.advanced
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "brancalonia-theme.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Importa tema da file JSON
   */
  static async importFromJSONDialog() {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";

      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return resolve(null);

        try {
          const text = await file.text();
          const data = JSON.parse(text);
          resolve(new Theme(data));
        } catch (error) {
          ui.notifications.error("Errore nell'importazione del tema");
          console.error("Brancalonia | Errore import tema:", error);
          resolve(null);
        }
      };

      input.click();
    });
  }
}