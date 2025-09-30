/**
 * Brancalonia Theme Settings
 *
 * Feature flags system per permettere agli utenti di disabilitare
 * parti del tema senza disattivare tutto il modulo.
 *
 * Ispirato da crlngn-ui approach.
 */

Hooks.once('init', () => {
  const MODULE_ID = 'brancalonia-bigat';

  // Enable/Disable Sheet Styling
  game.settings.register(MODULE_ID, 'enableSheets', {
    name: 'Brancalonia Sheet Styles',
    hint: 'Apply Brancalonia Renaissance theme to Actor and Item sheets',
    scope: 'client',
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      document.body.classList.toggle('branca-sheets-enabled', value);
      ui.notifications.info(`Brancalonia Sheet Styles: ${value ? 'Enabled' : 'Disabled'}`);
    }
  });

  // Enable/Disable Chat Styling
  game.settings.register(MODULE_ID, 'enableChat', {
    name: 'Brancalonia Chat Styles',
    hint: 'Apply Brancalonia Renaissance theme to chat cards',
    scope: 'client',
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      document.body.classList.toggle('branca-chat-enabled', value);
    }
  });

  // Enable/Disable Compendium Styling
  game.settings.register(MODULE_ID, 'enableCompendium', {
    name: 'Brancalonia Compendium Styles',
    hint: 'Apply Brancalonia Renaissance theme to compendium browser',
    scope: 'client',
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      document.body.classList.toggle('branca-compendium-enabled', value);
    }
  });

  // Enable/Disable Decorations
  game.settings.register(MODULE_ID, 'enableDecorations', {
    name: 'Renaissance Decorations',
    hint: 'Show ornaments, corner pieces and parchment textures',
    scope: 'client',
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      document.body.classList.toggle('branca-decorations-enabled', value);
    }
  });

  console.log('Brancalonia | Theme settings registered');
});

Hooks.once('ready', () => {
  const MODULE_ID = 'brancalonia-bigat';

  // Apply feature flags on startup
  const enableSheets = game.settings.get(MODULE_ID, 'enableSheets');
  const enableChat = game.settings.get(MODULE_ID, 'enableChat');
  const enableCompendium = game.settings.get(MODULE_ID, 'enableCompendium');
  const enableDecorations = game.settings.get(MODULE_ID, 'enableDecorations');

  document.body.classList.toggle('branca-sheets-enabled', enableSheets);
  document.body.classList.toggle('branca-chat-enabled', enableChat);
  document.body.classList.toggle('branca-compendium-enabled', enableCompendium);
  document.body.classList.toggle('branca-decorations-enabled', enableDecorations);

  console.log('Brancalonia | Theme flags applied:', {
    sheets: enableSheets,
    chat: enableChat,
    compendium: enableCompendium,
    decorations: enableDecorations
  });
});

// Export for initialize pattern
export function initialize() {
  console.log('Brancalonia Theme Settings | Initialized');
}