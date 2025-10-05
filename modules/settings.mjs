/**
 * @fileoverview Gestione settings e presets per sistema tema Brancalonia
 * @module settings
 * @requires brancalonia-logger
 * @requires theme.mjs
 * @requires theme-config.mjs
 * @version 2.0.0
 * @author Brancalonia Community
 * 
 * @description
 * Gestisce la configurazione dei temi con:
 * - 3 preset predefiniti (default, taverna, notte)
 * - Registrazione game settings
 * - Menu configurazione tema
 * - onChange handlers
 * 
 * @example
 * import { MODULE, registerSettings, THEMES } from './settings.mjs';
 * registerSettings();
 */

import { createModuleLogger } from './brancalonia-logger.js';
import { Theme } from './theme.mjs';
import { ThemeConfig } from './theme-config.mjs';

/**
 * Module ID costante
 * @constant {string}
 */
export const MODULE = 'brancalonia-bigat';

/**
 * Version del modulo
 * @constant {string}
 */
export const VERSION = '2.0.0';

/**
 * Module name
 * @constant {string}
 */
export const MODULE_NAME = 'Theme Settings';
const moduleLogger = createModuleLogger(MODULE_NAME);

/**
 * Statistiche del settings manager
 * @private
 */
const _statistics = {
  presetChanges: 0,
  settingsRegistered: false,
  themeChanges: 0,
  errors: []
};

/**
 * Temi predefiniti Brancalonia
 * @constant {Object<string, Theme>}
 */
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
 * @returns {void}
 * @throws {Error} Se la registrazione fallisce
 * @fires theme:settings-registered
 * @fires theme:changed
 * @fires theme:preset-changed
 * @example
 * registerSettings();
 */
export function registerSettings() {
  moduleLogger.info('Registrazione settings...');

  try {
    // Menu configurazione tema
    game.settings.registerMenu(MODULE, 'themeConfig', {
      name: 'Configurazione Tema',
      label: 'Personalizza Tema',
      hint: 'Configura i colori e le immagini del tema',
      icon: 'fas fa-palette',
      type: ThemeConfig,
      restricted: true
    });

    moduleLogger.debug('Menu "themeConfig" registrato');

    // Impostazione tema corrente
    game.settings.register(MODULE, 'theme', {
      scope: 'world',
      config: false,
      type: Object,
      default: THEMES.default,
      onChange: (themeData) => {
        try {
          moduleLogger.debug('Setting "theme" onChange triggered');

          const theme = Theme.from(themeData);
          theme.apply();

          _statistics.themeChanges++;

          moduleLogger.info('Tema cambiato e applicato');

          // Emit event
          moduleLogger.events.emit('theme:changed', {
            changeCount: _statistics.themeChanges,
            timestamp: Date.now()
          });

        } catch (error) {
          moduleLogger.error('Errore onChange theme', error);
          _statistics.errors.push({
            type: 'theme-onchange',
            message: error.message,
            timestamp: Date.now()
          });
        }
      }
    });

    moduleLogger.debug('Setting "theme" registrata');

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
      onChange: async (preset) => {
        try {
          moduleLogger.info(`Preset cambiato: "${preset}"`);

          if (preset !== 'custom' && THEMES[preset]) {
            await game.settings.set(MODULE, 'theme', THEMES[preset]);
            _statistics.presetChanges++;

            moduleLogger.info(`Preset "${preset}" applicato`);

            // Emit event
            moduleLogger.events.emit('theme:preset-changed', {
              preset,
              changeCount: _statistics.presetChanges,
              timestamp: Date.now()
            });
          }

        } catch (error) {
          moduleLogger.error(`Errore onChange preset "${preset}"`, error);
          _statistics.errors.push({
            type: 'preset-onchange',
            message: error.message,
            preset,
            timestamp: Date.now()
          });
        }
      }
    });

    moduleLogger.debug('Setting "themePreset" registrata');

    // Abilita tema
    game.settings.register(MODULE, 'themeEnabled', {
      name: 'Abilita Tema Brancalonia',
      hint: 'Attiva o disattiva il tema pergamena di Brancalonia',
      scope: 'client',
      config: true,
      type: Boolean,
      default: true,
      onChange: () => {
        moduleLogger.info('Setting "themeEnabled" cambiata, reload richiesto');
        window.location.reload();
      }
    });

    moduleLogger.debug('Setting "themeEnabled" registrata');

    // Mark as registered
    _statistics.settingsRegistered = true;

    moduleLogger.info('✅ Tutte le impostazioni tema registrate con successo');

    // Emit event
    moduleLogger.events.emit('theme:settings-registered', {
      moduleName: MODULE,
      presetsAvailable: Object.keys(THEMES).length,
      timestamp: Date.now()
    });

  } catch (error) {
    moduleLogger.error('Errore registrazione settings', error);
    _statistics.errors.push({
      type: 'settings-registration',
      message: error.message,
      timestamp: Date.now()
    });
    throw error;
  }
}

// =================================================================
// PUBLIC API - STATISTICS
// =================================================================

/**
 * Ottiene lo stato del modulo
 * @returns {Object} Stato corrente del modulo
 * @example
 * import { getStatus } from './settings.mjs';
 * const status = getStatus();
 * console.log(status.version); // '2.0.0'
 * console.log(status.presetsAvailable); // 3
 */
export function getStatus() {
  return {
    version: VERSION,
    moduleName: MODULE_NAME,
    moduleId: MODULE,
    settingsRegistered: _statistics.settingsRegistered,
    presetsAvailable: Object.keys(THEMES).length,
    presetNames: Object.keys(THEMES)
  };
}

/**
 * Ottiene le statistiche del settings manager
 * @returns {Object} Statistiche complete
 * @example
 * import { getStatistics } from './settings.mjs';
 * const stats = getStatistics();
 * console.log(stats.presetChanges); // 5
 * console.log(stats.themeChanges); // 3
 */
export function getStatistics() {
  return {
    ..._statistics,
    errorsCount: _statistics.errors.length
  };
}

/**
 * Resetta le statistiche del settings manager
 * @returns {void}
 * @example
 * import { resetStatistics } from './settings.mjs';
 * resetStatistics();
 */
export function resetStatistics() {
  moduleLogger.info('Reset statistiche');

  const settingsRegistered = _statistics.settingsRegistered;

  _statistics.presetChanges = 0;
  _statistics.themeChanges = 0;
  _statistics.settingsRegistered = settingsRegistered;
  _statistics.errors = [];

  moduleLogger.info('Statistiche resettate');
}

/**
 * Mostra report statistiche nella console con formattazione colorata
 * @returns {Object} Le statistiche (per uso programmatico)
 * @example
 * import { showReport } from './settings.mjs';
 * const stats = showReport();
 * console.log(stats.presetChanges); // 5
 */
export function showReport() {
  const stats = getStatistics();

  moduleLogger.group('📊 Brancalonia Theme Settings - Report');

  moduleLogger.info('MODULE:', MODULE);
  moduleLogger.info('Presets Available:', Object.keys(THEMES).length);

  moduleLogger.group('📈 Statistics');
  moduleLogger.table([
    { Metric: 'Settings Registered', Value: stats.settingsRegistered ? 'Yes' : 'No' },
    { Metric: 'Preset Changes', Value: stats.presetChanges },
    { Metric: 'Theme Changes', Value: stats.themeChanges },
    { Metric: 'Errors', Value: stats.errors.length }
  ]);
  moduleLogger.groupEnd();

  moduleLogger.group('🎨 Available Presets');
  Object.keys(THEMES).forEach(key => {
    moduleLogger.info(`- ${key}`);
  });
  moduleLogger.groupEnd();

  if (stats.errors.length > 0) {
    moduleLogger.group('🐛 Errors');
    stats.errors.forEach((err, i) => {
      moduleLogger.error(`Error ${i + 1}:`, err.type, '-', err.message);
    });
    moduleLogger.groupEnd();
  }

  moduleLogger.groupEnd();

  return stats;
}