/**
 * Brancalonia-Specific Settings Definitions
 * Extended from base Settings.mjs
 */

import { SETTING_SCOPE, THEMES } from "./Settings.mjs";

export function getBrancaloniaSettings() {
  return {
    // === THEME SETTINGS ===
    enableTheme: {
      tag: "enableTheme",
      label: "Abilita Tema Renaissance",
      hint: "Applica lo stile visivo rinascimentale italiano alla UI",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.client,
      config: true,
      requiresReload: false
    },

    colorTheme: {
      tag: "colorTheme",
      label: "Variante Tema",
      hint: "Scegli la variante cromatica del tema Renaissance",
      propType: String,
      default: "theme-brancalonia-classic",
      choices: THEMES.reduce((acc, theme) => {
        acc[theme.className] = theme.label;
        return acc;
      }, {}),
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    customCSS: {
      tag: "customCSS",
      label: "CSS Personalizzato",
      hint: "Aggiungi CSS custom per personalizzare ulteriormente il tema (avanzato)",
      propType: String,
      default: "",
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    applyThemeToSheets: {
      tag: "applyThemeToSheets",
      label: "Applica Tema alle Schede",
      hint: "Applica lo stile Renaissance alle schede personaggio",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    // === MECHANICS TOGGLES ===
    trackInfamia: {
      tag: "trackInfamia",
      label: "Sistema Infamia",
      hint: "Abilita il tracking di Infamia e Nomea",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    enableCompagnia: {
      tag: "enableCompagnia",
      label: "Sistema Compagnia",
      hint: "Abilita la gestione della Compagnia (party)",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    enableHaven: {
      tag: "enableHaven",
      label: "Sistema Covo",
      hint: "Abilita la gestione del Covo/Haven",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    enableLavoriSporchi: {
      tag: "enableLavoriSporchi",
      label: "Lavori Sporchi",
      hint: "Abilita il sistema dei Lavori Sporchi",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    enableTavernBrawl: {
      tag: "enableTavernBrawl",
      label: "Risse da Taverna",
      hint: "Abilita il sistema di combattimento da taverna",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    enableMenagramo: {
      tag: "enableMenagramo",
      label: "Sistema Menagramo",
      hint: "Abilita il patrono Menagramo per i warlock",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    enableMalefatte: {
      tag: "enableMalefatte",
      label: "Malefatte e Taglie",
      hint: "Abilita il sistema di Malefatte e Taglie",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    enableFavori: {
      tag: "enableFavori",
      label: "Sistema Favori",
      hint: "Abilita il sistema dei Favori",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    enableDueling: {
      tag: "enableDueling",
      label: "Sistema Duelli",
      hint: "Abilita il sistema dei duelli formali",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    enableDiseases: {
      tag: "enableDiseases",
      label: "Sistema Malattie",
      hint: "Abilita il sistema delle malattie",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    enableHazards: {
      tag: "enableHazards",
      label: "Hazard Ambientali",
      hint: "Abilita gli hazard ambientali",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    enableWilderness: {
      tag: "enableWilderness",
      label: "Incontri Selvaggi",
      hint: "Abilita il sistema degli incontri in natura",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    enableFactions: {
      tag: "enableFactions",
      label: "Sistema Fazioni",
      hint: "Abilita il sistema delle fazioni e reputazione",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    enableShoddyEquipment: {
      tag: "enableShoddyEquipment",
      label: "Equipaggiamento Scadente",
      hint: "Abilita il sistema dell'equipaggiamento scadente",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    enableRestSystem: {
      tag: "enableRestSystem",
      label: "Sistema Riposo",
      hint: "Abilita il sistema di riposo modificato",
      propType: Boolean,
      default: true,
      scope: SETTING_SCOPE.world,
      config: true,
      requiresReload: false
    },

    // === DEBUG ===
    debugMode: {
      tag: "debugMode",
      label: "Debug Mode",
      hint: "Abilita logging dettagliato per debug",
      propType: Boolean,
      default: false,
      scope: SETTING_SCOPE.client,
      config: true,
      requiresReload: false
    },

    disableUI: {
      tag: "disableUI",
      label: "Disabilita UI Modifications",
      hint: "Disabilita completamente le modifiche UI (emergency fallback)",
      propType: Boolean,
      default: false,
      scope: SETTING_SCOPE.client,
      config: true,
      requiresReload: true
    }
  };
}