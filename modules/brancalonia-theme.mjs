/* ===================================== */
/* BRANCALONIA THEME MODULE */
/* Sistema tema pergamena rinascimentale */
/* ===================================== */

const MODULE = 'brancalonia-bigat';

Hooks.once('init', () => {
  console.log('Brancalonia | Inizializzazione tema pergamena rinascimentale');

  // Registra il tema come attivo
  game.settings.register(MODULE, 'themeActive', {
    name: 'Tema Pergamena Attivo',
    hint: 'Attiva il tema pergamena rinascimentale di Brancalonia',
    scope: 'client',
    config: true,
    type: Boolean,
    default: true,
    onChange: () => window.location.reload()
  });

  // Applica classi tema al body per stili CSS
  if (game.settings.get(MODULE, 'themeActive')) {
    document.body.classList.add('brancalonia-theme', 'pergamena-theme');
  }
});

Hooks.once('ready', () => {
  // Aggiungi supporto per D&D 5e character sheets
  if (game.system.id === 'dnd5e') {
    Hooks.on('renderActorSheet5eCharacter', (app, html, data) => {
      html.addClass('brancalonia-sheet');
    });

    Hooks.on('renderActorSheet5eNPC', (app, html, data) => {
      html.addClass('brancalonia-sheet');
    });

    Hooks.on('renderItemSheet5e', (app, html, data) => {
      html.addClass('brancalonia-sheet');
    });
  }

  console.log('Brancalonia | Tema pergamena caricato con successo');
});

// Supporto per tema scuro (opzionale)
Hooks.on('renderSettingsConfig', (app, html) => {
  try {
    // In Foundry v13, colorScheme potrebbe non esistere o essere configurato diversamente
    // Controlla se il setting esiste prima di accedervi
    const settings = game.settings.settings;
    const hasColorScheme = settings.has('core.colorScheme');

    if (hasColorScheme) {
      const themeMode = game.settings.get('core', 'colorScheme');
      if (themeMode === 'dark') {
        document.body.classList.add('theme-dark');
      } else {
        document.body.classList.remove('theme-dark');
      }
    } else {
      // Fallback: controlla se il body ha già una classe tema
      // o usa il tema di default del sistema
      console.log('Brancalonia | colorScheme setting non disponibile, uso tema default');
    }
  } catch (error) {
    // Gestisci silenziosamente l'errore se il setting non esiste
    console.log('Brancalonia | Tema scuro non configurabile:', error.message);
  }
});

export { MODULE };