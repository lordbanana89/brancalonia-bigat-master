/**
 * Dice So Nice Integration for Brancalonia
 * Adds custom dice colorsets aligned with the Italian Renaissance theme
 * Compatible with DSN v4.x+ and Foundry v12/v13
 */

Hooks.once('diceSoNiceReady', (dice3d) => {
  // Helper to get CSS variable values
  const cssVar = (name, fallback) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  };

  // Colorset 1: Gold & Wax (Primary)
  const goldWax = {
    name: 'branca-goldwax',
    description: 'Brancalonia — Gold & Wax',
    category: 'Brancalonia',
    foreground: cssVar('--bcl-ink-strong', '#1C140D'),   // Dark ink for pips
    background: cssVar('--bcl-gold', '#C9A54A'),         // Renaissance gold body
    edge: cssVar('--bcl-ink-strong', '#1C140D'),         // Dark edge
    outline: cssVar('--bcl-ink-strong', '#1C140D'),      // Dark outline
    material: 'metal',
    font: 'Alegreya',
    visibility: 'visible'
  };

  // Colorset 2: Parchment & Ink
  const parchmentInk = {
    name: 'branca-parchment',
    description: 'Brancalonia — Parchment & Ink',
    category: 'Brancalonia',
    foreground: cssVar('--bcl-ink-strong', '#1C140D'),   // Dark ink
    background: cssVar('--bcl-paper-strong', '#D9C38F'), // Aged parchment
    edge: cssVar('--bcl-border', '#B99D6B'),            // Soft border
    outline: cssVar('--bcl-border', '#B99D6B'),         // Soft outline
    material: 'plastic',
    font: 'Alegreya',
    visibility: 'visible'
  };

  // Colorset 3: Venetian Red & Gold
  const venetianRed = {
    name: 'branca-venetian',
    description: 'Brancalonia — Venetian Red',
    category: 'Brancalonia',
    foreground: cssVar('--bcl-gold', '#C9A54A'),        // Gold pips
    background: cssVar('--bcl-accent', '#8C2B27'),      // Venetian red body
    edge: cssVar('--bcl-gold', '#C9A54A'),              // Gold edge
    outline: cssVar('--bcl-accent-strong', '#5E1715'),  // Dark wine outline
    material: 'metal',
    font: 'Cinzel',
    visibility: 'visible'
  };

  // Colorset 4: Emerald & Gold
  const emeraldGold = {
    name: 'branca-emerald',
    description: 'Brancalonia — Emerald & Gold',
    category: 'Brancalonia',
    foreground: cssVar('--bcl-gold', '#C9A54A'),        // Gold pips
    background: cssVar('--bcl-emerald', '#2E7D64'),     // Malachite green
    edge: cssVar('--bcl-gold', '#C9A54A'),              // Gold edge
    outline: cssVar('--bcl-ink-strong', '#1C140D'),     // Dark outline
    material: 'glass',
    font: 'Alegreya',
    visibility: 'visible'
  };

  // Colorset 5: Wax Seal (Special/Critical)
  const waxSeal = {
    name: 'branca-waxseal',
    description: 'Brancalonia — Wax Seal',
    category: 'Brancalonia',
    foreground: cssVar('--bcl-gold', '#C9A54A'),        // Gold imprint
    background: cssVar('--bcl-seal-wax', '#8E1D22'),    // Wax seal red
    edge: cssVar('--bcl-ribbon', '#7E1F1B'),            // Darker edge
    outline: cssVar('--bcl-gold', '#C9A54A'),           // Gold outline
    material: 'wood',  // Gives a matte, waxy appearance
    font: 'Cinzel',
    visibility: 'visible'
  };

  // Register all colorsets
  try {
    dice3d.addColorset(goldWax, 'default');
    dice3d.addColorset(parchmentInk, 'default');
    dice3d.addColorset(venetianRed, 'default');
    dice3d.addColorset(emeraldGold, 'default');
    dice3d.addColorset(waxSeal, 'default');

    // Set Gold & Wax as default for D&D 5e system
    if (game.system.id === 'dnd5e') {
      ['d20', 'd12', 'd10', 'd8', 'd6', 'd4', 'd100', 'd2'].forEach((type) => {
        dice3d.addDicePreset({
          type: type,
          labels: '',
          colorset: 'branca-goldwax',
          system: 'dnd5e'
        }, 'dnd5e');
      });

      // Special colorset for advantage/disadvantage d20s
      dice3d.addDicePreset({
        type: 'd20',
        labels: '',
        colorset: 'branca-venetian',
        system: 'dnd5e',
        name: 'Advantage'
      }, 'dnd5e');

      dice3d.addDicePreset({
        type: 'd20',
        labels: '',
        colorset: 'branca-waxseal',
        system: 'dnd5e',
        name: 'Disadvantage'
      }, 'dnd5e');
    }

    console.log('Brancalonia | Dice So Nice colorsets registered successfully');

    // Optional: Set user preference if not already set
    if (game.user.isGM && !game.user.getFlag('dice-so-nice', 'appearance')) {
      game.user.setFlag('dice-so-nice', 'appearance', {
        global: {
          colorset: 'branca-goldwax',
          material: 'metal',
          font: 'Alegreya'
        }
      });
    }

  } catch (error) {
    console.warn('Brancalonia | Failed to register Dice So Nice colorsets:', error);
  }
});

// Hook for dynamic theme changes
Hooks.on('brancaloniaThemeChanged', (theme) => {
  // Re-register colorsets if theme changes between light/dark
  if (game.modules.get('dice-so-nice')?.active) {
    Hooks.call('diceSoNiceReady', game.dice3d);
  }
});

// Test function for development
window.brancaloniaTestDice = function() {
  if (!game.dice3d) {
    ui.notifications.warn("Dice So Nice is not active");
    return;
  }

  // Roll test dice with each colorset
  const colorsets = ['branca-goldwax', 'branca-parchment', 'branca-venetian', 'branca-emerald', 'branca-waxseal'];

  colorsets.forEach((colorset, index) => {
    setTimeout(() => {
      const roll = new Roll('1d20 + 1d12 + 1d10 + 1d8 + 1d6 + 1d4');
      roll.evaluate({async: false});

      game.dice3d.showForRoll(roll, game.user, true, null, false, null, {
        appearance: {
          global: {
            colorset: colorset
          }
        }
      });
    }, index * 2000);
  });
};