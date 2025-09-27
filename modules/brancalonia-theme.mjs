/* ===================================== */
/* BRANCALONIA THEME MODULE */
/* Sistema tema completo basato su Carolingian UI */
/* v4.4.0 - Architettura Completa */
/* ===================================== */

import { MODULE, registerSettings } from './settings.mjs';
import { Theme } from './theme.mjs';

// Import core system (auto-initializes)
import './brancalonia-theme-core.mjs';

// Legacy initialization for backward compatibility
Hooks.once('init', () => {
  console.log('Brancalonia | Sistema tema v4.4.0 - Architettura Carolingian UI');

  // Register legacy settings
  registerSettings();

  // Apply theme if enabled (legacy support)
  if (game.settings.get(MODULE, 'themeEnabled')) {
    const themeData = game.settings.get(MODULE, 'theme');
    const theme = Theme.from(themeData);
    theme.apply();
  }
});

Hooks.once('ready', () => {
  // Aggiungi supporto per D&D 5e character sheets
  if (game.system.id === 'dnd5e') {
    Hooks.on('renderActorSheet5eCharacter', (app, html, data) => {
      if (html instanceof HTMLElement) {
        html.classList.add('brancalonia-sheet');
      } else {
        html.addClass('brancalonia-sheet');
      }
    });

    Hooks.on('renderActorSheet5eNPC', (app, html, data) => {
      if (html instanceof HTMLElement) {
        html.classList.add('brancalonia-sheet');
      } else {
        html.addClass('brancalonia-sheet');
      }
    });

    Hooks.on('renderItemSheet5e', (app, html, data) => {
      if (html instanceof HTMLElement) {
        html.classList.add('brancalonia-sheet');
      } else {
        html.addClass('brancalonia-sheet');
      }
    });
  }

  // Aggiungi comando console per reset emergenza
  window.brancaloniaResetTheme = async () => {
    const { THEMES } = await import('./settings.mjs');
    const defaultTheme = THEMES.default;
    await game.settings.set(MODULE, 'theme', defaultTheme);
    await game.settings.set(MODULE, 'themePreset', 'default');
    const theme = Theme.from(defaultTheme);
    theme.apply();
    ui.notifications.info('Tema ripristinato ai valori default');
    console.log('Tema Brancalonia ripristinato con successo');
    return 'Tema ripristinato!';
  };

  console.log('Brancalonia | Sistema tema caricato con successo');
  console.log('Per ripristinare il tema in caso di problemi, esegui nella console: brancaloniaResetTheme()');
});

export { MODULE, Theme };