/* ===================================== */
/* BRANCALONIA THEME MODULE */
/* Sistema tema completo basato su ProjectFU */
/* ===================================== */

import { MODULE, registerSettings } from './settings.mjs';
import { Theme } from './theme.mjs';

Hooks.once('init', () => {
  console.log('Brancalonia | Inizializzazione sistema tema avanzato');

  // Registra tutte le impostazioni
  registerSettings();

  // Applica tema se abilitato
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