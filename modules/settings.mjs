/* ===================================== */
/* BRANCALONIA THEME SETTINGS */
/* Gestione configurazione temi */
/* ===================================== */

import { Theme } from './theme.mjs';
import { ThemeConfig } from './theme-config.mjs';

export const MODULE = 'brancalonia-bigat';

// Temi predefiniti
export const THEMES = {
  default: new Theme({
    colors: {
      // Tema pergamena default
      controlContent: "#E8DCC0",
      controlBorder: "#B8985A",
      controlFocusContent: "#FFFFFF",
      controlInactiveContent: "#D4C4A080",
      controlFill1: "#3A302866",
      controlFill2: "#5A504A66",
      controlHighlightContent: "#B87333",
      controlHighlightBorder: "#B87333",
      controlHighlightFill1: "#C9A961",
      controlHighlightFill2: "#D4AA6E",
      controlActiveContent: "#C9A961",
      controlActiveBorder: "#C9A961",
      controlActiveFill1: "#B87333CC",
      controlActiveFill2: "#C9A961CC",
      appHeaderContent: "#E8DCC0",
      appHeaderFocusContent: "#FFFFFF",
      appHeaderFill1: "#8B26354D",
      appHeaderFill2: "#7221294D",
      appBodyContent: "#3A3028",
      appBodyContentSecondary: "#5A504A",
      appBodyPrimaryFill1: "#D4C4A0E6",
      appBodyPrimaryFill2: "#E8DCC0E6",
      appBorder: "#B8985A",
      appNameSectionContent: "#E8DCC0",
      appNameSectionShadow: "#00000099",
      miscBorder: "#B8985A",
      miscFill: "#D4C4A04D",
      miscFillPrimary: "#3A302833",
      miscFillSecondary: "#B8985A1A",
      miscInactiveContent: "#5A504A80",
      miscShadowHighlight: "#C9A961",
      miscLinkIdle: "#B87333",
      miscLinkFocus: "#8B2635",
      miscReroll: "#8B2635"
    },
    images: {
      appAccentImage: "modules/brancalonia-bigat/assets/artwork/fond.webp"
    }
  }),

  taverna: new Theme({
    colors: {
      // Tema taverna più caldo
      controlContent: "#F5E6D3",
      controlBorder: "#8B4513",
      controlFocusContent: "#FFFFFF",
      controlInactiveContent: "#D2B48C80",
      controlFill1: "#4B281666",
      controlFill2: "#6B3E2566",
      controlHighlightContent: "#CD853F",
      controlHighlightBorder: "#CD853F",
      controlHighlightFill1: "#DEB887",
      controlHighlightFill2: "#F5DEB3",
      controlActiveContent: "#DEB887",
      controlActiveBorder: "#DEB887",
      controlActiveFill1: "#CD853FCC",
      controlActiveFill2: "#DEB887CC",
      appHeaderContent: "#F5E6D3",
      appHeaderFocusContent: "#FFFFFF",
      appHeaderFill1: "#8B45134D",
      appHeaderFill2: "#A0522D4D",
      appBodyContent: "#2F1F0F",
      appBodyContentSecondary: "#5C3D2E",
      appBodyPrimaryFill1: "#D2B48CE6",
      appBodyPrimaryFill2: "#F5E6D3E6",
      appBorder: "#8B4513",
      appNameSectionContent: "#F5E6D3",
      appNameSectionShadow: "#00000099",
      miscBorder: "#8B4513",
      miscFill: "#D2B48C4D",
      miscFillPrimary: "#4B281633",
      miscFillSecondary: "#8B45131A",
      miscInactiveContent: "#5C3D2E80",
      miscShadowHighlight: "#DEB887",
      miscLinkIdle: "#CD853F",
      miscLinkFocus: "#8B0000",
      miscReroll: "#8B0000"
    },
    images: {
      appAccentImage: "modules/brancalonia-bigat/assets/artwork/ambiance/inn.webp"
    }
  }),

  notte: new Theme({
    colors: {
      // Tema notturno scuro
      controlContent: "#C0C0C0",
      controlBorder: "#4A4A4A",
      controlFocusContent: "#FFFFFF",
      controlInactiveContent: "#80808080",
      controlFill1: "#1A1A1A99",
      controlFill2: "#2A2A2A99",
      controlHighlightContent: "#708090",
      controlHighlightBorder: "#708090",
      controlHighlightFill1: "#4682B4",
      controlHighlightFill2: "#5F9EA0",
      controlActiveContent: "#87CEEB",
      controlActiveBorder: "#87CEEB",
      controlActiveFill1: "#4682B4CC",
      controlActiveFill2: "#5F9EA0CC",
      appHeaderContent: "#C0C0C0",
      appHeaderFocusContent: "#FFFFFF",
      appHeaderFill1: "#1919194D",
      appHeaderFill2: "#2F2F2F4D",
      appBodyContent: "#E0E0E0",
      appBodyContentSecondary: "#A0A0A0",
      appBodyPrimaryFill1: "#2A2A2AE6",
      appBodyPrimaryFill2: "#1A1A1AE6",
      appBorder: "#4A4A4A",
      appNameSectionContent: "#C0C0C0",
      appNameSectionShadow: "#00000099",
      miscBorder: "#4A4A4A",
      miscFill: "#3333334D",
      miscFillPrimary: "#1A1A1A33",
      miscFillSecondary: "#4A4A4A1A",
      miscInactiveContent: "#60606080",
      miscShadowHighlight: "#708090",
      miscLinkIdle: "#87CEEB",
      miscLinkFocus: "#4682B4",
      miscReroll: "#B22222"
    },
    images: {
      appAccentImage: "modules/brancalonia-bigat/assets/artwork/ambiance/camp.webp"
    }
  })
};

/**
 * Registra le impostazioni del modulo
 */
export function registerSettings() {
  // Menu configurazione tema
  game.settings.registerMenu(MODULE, 'themeConfig', {
    name: 'Configurazione Tema',
    label: 'Personalizza Tema',
    hint: 'Configura i colori e le immagini del tema',
    icon: 'fas fa-palette',
    type: ThemeConfig,
    restricted: true
  });

  // Impostazione tema corrente
  game.settings.register(MODULE, 'theme', {
    scope: 'world',
    config: false,
    type: Object,
    default: THEMES.default,
    onChange: (themeData) => {
      const theme = Theme.from(themeData);
      theme.apply();
    }
  });

  // Selezione tema predefinito
  game.settings.register(MODULE, 'themePreset', {
    name: 'Tema Predefinito',
    hint: 'Seleziona un tema predefinito da applicare',
    scope: 'world',
    config: true,
    type: String,
    choices: {
      'default': 'Pergamena Classica',
      'taverna': 'Taverna Calda',
      'notte': 'Notte Oscura',
      'custom': 'Personalizzato'
    },
    default: 'default',
    onChange: (preset) => {
      if (preset !== 'custom' && THEMES[preset]) {
        game.settings.set(MODULE, 'theme', THEMES[preset]);
      }
    }
  });

  // Abilita tema
  game.settings.register(MODULE, 'themeEnabled', {
    name: 'Abilita Tema Brancalonia',
    hint: 'Attiva o disattiva il tema pergamena di Brancalonia',
    scope: 'client',
    config: true,
    type: Boolean,
    default: true,
    onChange: () => window.location.reload()
  });

  console.log('Brancalonia | Impostazioni tema registrate');
}