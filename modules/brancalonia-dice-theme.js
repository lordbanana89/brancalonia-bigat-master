/* ================================================ */
/* BRANCALONIA DICE SO NICE INTEGRATION            */
/* Tema dadi rinascimentali per DSN                */
/* ================================================ */

Hooks.once('diceSoNiceReady', (dice3d) => {
  // Verifica che Dice So Nice sia attivo
  if (!game.modules.get('dice-so-nice')?.active) {
    console.log('🎲 Dice So Nice not active, skipping theme registration');
    return;
  }

  // Verifica che dice3d sia valido
  if (!dice3d) {
    console.error('❌ Dice So Nice API not available');
    return;
  }
  // Funzione helper per leggere CSS variables
  const getCSSVar = (name, fallback) => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || fallback;
  };

  // Colorset 1: Gold & Wax (Oro e Ceralacca)
  const goldWaxColorset = {
    name: 'branca-goldwax',
    description: 'Brancalonia — Oro e Ceralacca',
    category: 'Brancalonia',
    foreground: getCSSVar('--bcl-ink-strong', '#1C140D'),   // Pips/numeri
    background: getCSSVar('--bcl-gold', '#C9A54A'),         // Corpo dado
    edge: getCSSVar('--bcl-ink-strong', '#1C140D'),         // Bordo
    outline: getCSSVar('--bcl-ink-strong', '#1C140D'),      // Outline
    material: 'metal',
    font: 'Alegreya',
    fontScale: {
      d100: 0.8,
      d20: 1.0,
      d12: 1.0,
      d10: 1.0,
      d8: 1.0,
      d6: 1.2,
      d4: 1.0
    }
  };

  // Colorset 2: Parchment & Ink (Pergamena e Inchiostro)
  const parchmentInkColorset = {
    name: 'branca-parchment',
    description: 'Brancalonia — Pergamena e Inchiostro',
    category: 'Brancalonia',
    foreground: getCSSVar('--bcl-ink-strong', '#1C140D'),     // Pips/numeri
    background: getCSSVar('--bcl-paper-strong', '#D9C38F'),   // Corpo dado
    edge: getCSSVar('--bcl-border', '#B99D6B'),              // Bordo
    outline: getCSSVar('--bcl-border', '#B99D6B'),           // Outline
    material: 'plastic',
    font: 'Alegreya',
    fontScale: {
      d100: 0.8,
      d20: 1.0,
      d12: 1.0,
      d10: 1.0,
      d8: 1.0,
      d6: 1.2,
      d4: 1.0
    }
  };

  // Colorset 3: Emerald & Gold (Smeraldo e Oro)
  const emeraldGoldColorset = {
    name: 'branca-emerald',
    description: 'Brancalonia — Smeraldo e Oro',
    category: 'Brancalonia',
    foreground: getCSSVar('--bcl-gold', '#C9A54A'),          // Pips/numeri
    background: getCSSVar('--bcl-emerald', '#2E7D64'),       // Corpo dado
    edge: getCSSVar('--bcl-gold', '#C9A54A'),               // Bordo
    outline: getCSSVar('--bcl-ink-strong', '#1C140D'),      // Outline
    material: 'glass',
    font: 'Cinzel',
    fontScale: {
      d100: 0.8,
      d20: 1.0,
      d12: 1.0,
      d10: 1.0,
      d8: 1.0,
      d6: 1.2,
      d4: 1.0
    }
  };

  // Colorset 4: Wine & Gold (Vino e Oro)
  const wineGoldColorset = {
    name: 'branca-wine',
    description: 'Brancalonia — Vino e Oro',
    category: 'Brancalonia',
    foreground: getCSSVar('--bcl-gold', '#C9A54A'),            // Pips/numeri
    background: getCSSVar('--bcl-accent-strong', '#5E1715'),   // Corpo dado
    edge: getCSSVar('--bcl-gold', '#C9A54A'),                 // Bordo
    outline: getCSSVar('--bcl-gold', '#C9A54A'),              // Outline
    material: 'glass',
    font: 'Cinzel',
    fontScale: {
      d100: 0.8,
      d20: 1.0,
      d12: 1.0,
      d10: 1.0,
      d8: 1.0,
      d6: 1.2,
      d4: 1.0
    }
  };

  // Registra tutti i colorset
  dice3d.addColorset(goldWaxColorset, 'default');
  dice3d.addColorset(parchmentInkColorset, 'default');
  dice3d.addColorset(emeraldGoldColorset, 'default');
  dice3d.addColorset(wineGoldColorset, 'default');

  // Registra preset per dadi più comuni in dnd5e
  // NOTA: In DSN v5.x, i preset richiedono una struttura specifica
  try {
    // Verifica che i metodi esistano prima di usarli
    if (typeof dice3d.addDicePreset === 'function') {
      // Preset principale per d20 con tema Brancalonia
      dice3d.addDicePreset({
        type: 'd20',
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
                '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
        bumpMaps: [],
        emissiveMaps: [],
        emissive: '#000000',
        colorset: 'branca-goldwax',
        shape: 'd20',  // IMPORTANTE: shape è richiesto
        font: 'Alegreya'
      });

      // Preset per d6 (più comune dopo d20)
      dice3d.addDicePreset({
        type: 'd6',
        labels: ['1', '2', '3', '4', '5', '6'],
        bumpMaps: [],
        emissiveMaps: [],
        emissive: '#000000',
        colorset: 'branca-parchment',
        shape: 'd6',  // IMPORTANTE: shape è richiesto
        font: 'Alegreya'
      });

      console.log('🎲 Brancalonia Dice Presets: Created d20 and d6 presets');
    } else {
      console.warn('⚠️ Dice So Nice addDicePreset method not available');
    }
  } catch (error) {
    console.error('❌ Error creating dice presets:', error);
    console.log('🔧 Fallback: Using colorsets without presets');
  }

  console.log('🎲 Brancalonia Dice Theme: Successfully loaded colorsets for Dice So Nice');

  // Hook per modificare i risultati dei dadi con effetti speciali
  Hooks.on('diceSoNiceRollComplete', (chatMessageID) => {
    const message = game.messages.get(chatMessageID);
    if (!message) return;

    const roll = message.rolls?.[0];
    if (!roll) return;

    // Controlla se è un d20
    const d20Result = roll.dice.find(d => d.faces === 20)?.results?.[0]?.result;

    if (d20Result === 20) {
      // Critico! Aggiungi effetto dorato
      ui.notifications.info("⚔️ Colpo Critico! Magnifico!", { permanent: false });
    } else if (d20Result === 1) {
      // Fumble! Aggiungi effetto rosso
      ui.notifications.warn("💀 Fallimento Critico! Maledizione!", { permanent: false });
    }
  });
});

// Registra il modulo per compatibilità
Hooks.once('init', () => {
  console.log('🎨 Brancalonia Dice Theme: Initializing Dice So Nice integration');

  // Aggiungi flag per verificare se DSN è presente
  if (game.modules.get('dice-so-nice')?.active) {
    console.log('✅ Dice So Nice detected, theme will be applied');
  } else {
    console.log('⚠️ Dice So Nice not found, dice theme will not be applied');
  }
});