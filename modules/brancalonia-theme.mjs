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

  console.log('Brancalonia | Sistema tema caricato con successo');
});

export { MODULE, Theme };