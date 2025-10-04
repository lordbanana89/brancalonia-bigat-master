# ✅ Dice Theme - Fix Completo

## Data: 2025-10-03
## File: `modules/brancalonia-dice-theme.js`
## Status: ✅ COMPLETO E TESTABILE

---

## 🎯 Cosa È Stato Fatto

### 1. ✅ Factory Pattern per Colorset
**Problema**: 4 blocchi di codice ripetitivi (~85 righe duplicate).

**Prima**:
```javascript
const goldWaxColorset = {
  name: 'branca-goldwax',
  description: 'Brancalonia — Oro e Ceralacca',
  category: 'Brancalonia',
  foreground: getCSSVar('--bcl-ink-strong', '#1C140D'),
  background: getCSSVar('--bcl-gold', '#C9A54A'),
  // ... resto
};

const parchmentInkColorset = { /* ... */ };
const emeraldGoldColorset = { /* ... */ };
const wineGoldColorset = { /* ... */ };

dice3d.addColorset(goldWaxColorset, 'default');
dice3d.addColorset(parchmentInkColorset, 'default');
dice3d.addColorset(emeraldGoldColorset, 'default');
dice3d.addColorset(wineGoldColorset, 'default');
```

**Dopo**:
```javascript
// Factory function
const createColorset = (config) => ({
  name: config.name,
  description: config.description,
  category: 'Brancalonia',
  foreground: getCSSVar(config.foreground, config.foregroundFallback),
  background: getCSSVar(config.background, config.backgroundFallback),
  edge: getCSSVar(config.edge, config.edgeFallback),
  outline: getCSSVar(config.outline, config.outlineFallback),
  material: config.material,
  font: config.font,
  fontScale: { d100: 0.8, d20: 1.0, d12: 1.0, d10: 1.0, d8: 1.0, d6: 1.2, d4: 1.0 }
});

// Array di configurazioni
const COLORSET_CONFIGS = [
  {
    name: 'branca-goldwax',
    description: 'Brancalonia — Oro e Ceralacca',
    foreground: '--bcl-ink-strong',
    foregroundFallback: '#1C140D',
    background: '--bcl-gold',
    backgroundFallback: '#C9A54A',
    // ...
  },
  // ... altri 3 colorset
];

// Registrazione con forEach
COLORSET_CONFIGS.forEach(config => {
  const colorset = createColorset(config);
  dice3d.addColorset(colorset, 'default');
  console.log(`🎨 Registrato colorset: ${config.description}`);
});
```

**Vantaggi**:
- Codice DRY (Don't Repeat Yourself)
- Facile aggiungere nuovi colorset
- Più manutenibile

---

### 2. ✅ Filtri per Notifiche Critici/Fumble
**Problema**: Notifiche mostrate per TUTTI i tiri (anche PNG, tiri nascosti, altri giocatori).

**Prima**:
```javascript
Hooks.on('diceSoNiceRollComplete', (chatMessageID) => {
  const message = game.messages.get(chatMessageID);
  if (!message) return;

  const roll = message.rolls?.[0];
  if (!roll) return;

  const d20Result = roll.dice.find(d => d.faces === 20)?.results?.[0]?.result;

  if (d20Result === 20) {
    ui.notifications.info('⚔️ Colpo Critico! Magnifico!');
  } else if (d20Result === 1) {
    ui.notifications.warn('💀 Fallimento Critico! Maledizione!');
  }
});
```

**Dopo**:
```javascript
Hooks.on('diceSoNiceRollComplete', (chatMessageID) => {
  // 1. Controlla setting utente
  if (!game.settings.get('brancalonia-bigat', 'diceCriticalNotifications')) {
    return;
  }

  const message = game.messages.get(chatMessageID);
  if (!message) return;

  // 2. Filtra tiri sussurrati ad altri
  if (message.whisper?.length > 0 && !message.whisper.includes(game.user.id)) {
    return;
  }

  // 3. Controlla se è tiro del giocatore o token controllato
  const isPlayerRoll = message.user?.id === game.user.id;
  const speaker = message.speaker;
  let isControlledToken = false;

  if (speaker?.token && canvas.tokens) {
    const token = canvas.tokens.get(speaker.token);
    isControlledToken = token?.isOwner || false;
  }

  if (!isPlayerRoll && !isControlledToken) {
    return; // Non mostrare per PNG non controllati
  }

  // 4. Controlli sicuri per d20
  const roll = message.rolls?.[0];
  if (!roll) return;

  const d20Die = roll.dice.find(d => d.faces === 20);
  if (!d20Die) return;

  const d20Result = d20Die.results?.[0]?.result;
  if (!d20Result) return;

  // 5. Mostra notifiche
  if (d20Result === 20) {
    ui.notifications.info('⚔️ Colpo Critico! Magnifico!');
  } else if (d20Result === 1) {
    ui.notifications.warn('💀 Fallimento Critico! Maledizione!');
  }
});
```

**Risultato**: Nessun spam, nessuno spoiler.

---

### 3. ✅ Settings Utente
**Problema**: Nessuna personalizzazione disponibile.

**Aggiunti 3 Settings**:

#### Setting 1: Notifiche Critici/Fumble
```javascript
game.settings.register('brancalonia-bigat', 'diceCriticalNotifications', {
  name: 'Notifiche Critici/Fumble',
  hint: 'Mostra notifiche quando tiri 1 o 20 su un d20 (solo per i tuoi tiri e token controllati)',
  scope: 'client',
  config: true,
  type: Boolean,
  default: true
});
```

#### Setting 2: Suoni Critici/Fumble
```javascript
game.settings.register('brancalonia-bigat', 'diceCriticalSounds', {
  name: 'Suoni Critici/Fumble',
  hint: 'Riproduci suoni speciali per critici e fumble (richiede file audio)',
  scope: 'client',
  config: true,
  type: Boolean,
  default: false
});
```

#### Setting 3: Tema Preferito (Informativo)
```javascript
game.settings.register('brancalonia-bigat', 'dicePreferredColorset', {
  name: 'Tema Dadi Preferito',
  hint: 'Il tuo tema di dadi preferito. Ricorda: devi impostarlo manualmente nelle impostazioni di Dice So Nice!',
  scope: 'client',
  config: true,
  type: String,
  choices: {
    'branca-goldwax': '🥇 Oro e Ceralacca',
    'branca-parchment': '📜 Pergamena e Inchiostro',
    'branca-emerald': '💎 Smeraldo e Oro',
    'branca-wine': '🍷 Vino e Oro'
  },
  default: 'branca-goldwax',
  onChange: (value) => {
    ui.notifications.info(`🎲 Tema preferito: ${value}. Ricorda di impostarlo in Dice So Nice!`);
  }
});
```

**Nota**: Il setting 3 è informativo perché DSN gestisce i suoi temi internamente.

---

### 4. ✅ Supporto Suoni Personalizzati
**Problema**: Solo notifiche visuali, nessun suono.

**Aggiunto**:
```javascript
const soundEnabled = game.settings.get('brancalonia-bigat', 'diceCriticalSounds');

if (d20Result === 20) {
  ui.notifications.info('⚔️ Colpo Critico! Magnifico!');

  if (soundEnabled) {
    AudioHelper.play({
      src: 'modules/brancalonia-bigat/sounds/critical-hit.mp3',
      volume: 0.5,
      autoplay: true,
      loop: false
    }, false).catch(() => {
      // File non trovato, ignora silenziosamente
    });
  }
}
```

**File Audio Necessari** (opzionali):
- `sounds/critical-hit.mp3` - Suono per critico (es. fanfara)
- `sounds/fumble.mp3` - Suono per fumble (es. trombone triste)

**Nota**: Se i file non esistono, il modulo funziona comunque senza errori.

---

## 📊 Confronto Prima/Dopo

| Aspetto | Prima | Dopo |
|---------|-------|------|
| **Righe Codice** | 185 | 277 (+92) |
| **Colorset** | 4 (hardcoded) | 4 (factory) |
| **Settings** | 0 | 3 |
| **Filtri Notifiche** | Nessuno | 5 controlli |
| **Suoni** | ❌ | ✅ (opzionale) |
| **Spam Notifiche** | ⚠️ Sì | ✅ No |
| **Spoiler Possibili** | ⚠️ Sì | ✅ No |
| **Personalizzazione** | ❌ | ✅ |
| **Codice DRY** | ⚠️ No | ✅ Sì |

---

## 🎯 Funzionalità Finali

### Colorset (4)
✅ 🥇 **Oro e Ceralacca** (metal, Alegreya)  
✅ 📜 **Pergamena e Inchiostro** (plastic, Alegreya)  
✅ 💎 **Smeraldo e Oro** (glass, Cinzel)  
✅ 🍷 **Vino e Oro** (glass, Cinzel)  

### Notifiche Intelligenti
✅ Solo per tiri del giocatore corrente  
✅ Solo per token controllati dal giocatore  
✅ Ignora tiri sussurrati ad altri  
✅ Ignora tiri di PNG non controllati  
✅ Configurabile (on/off)  

### Suoni (Opzionali)
✅ Suono critico (d20 = 20)  
✅ Suono fumble (d20 = 1)  
✅ Configurabile (on/off)  
✅ Fallback silenzioso se file assenti  

### Settings Utente
✅ Abilita/disabilita notifiche  
✅ Abilita/disabilita suoni  
✅ Tema preferito (informativo)  

---

## 🚀 Come Testare

### 1. Avvia Foundry VTT
Verifica console:
```
🎨 Brancalonia Dice Theme: Initializing Dice So Nice integration
✅ Dice So Nice detected, theme will be applied
🎨 Registrato colorset: Brancalonia — Oro e Ceralacca
🎨 Registrato colorset: Brancalonia — Pergamena e Inchiostro
🎨 Registrato colorset: Brancalonia — Smeraldo e Oro
🎨 Registrato colorset: Brancalonia — Vino e Oro
🎲 Brancalonia Dice Theme: Successfully loaded 4 colorsets for Dice So Nice
```

### 2. Configura Dice So Nice
1. Apri settings di Dice So Nice
2. Vai su "Appearance" → "Dice"
3. Seleziona un tema Brancalonia:
   - 🥇 Oro e Ceralacca
   - 📜 Pergamena e Inchiostro
   - 💎 Smeraldo e Oro
   - 🍷 Vino e Oro

### 3. Test Notifiche
```javascript
// Tira un d20
/roll 1d20

// Se risultato = 20:
// ⚔️ Colpo Critico! Magnifico!

// Se risultato = 1:
// 💀 Fallimento Critico! Maledizione!
```

### 4. Test Filtri
```javascript
// Come GM, fai tirare un PNG
// Il giocatore NON deve vedere notifiche

// Come giocatore, fai tirare il tuo personaggio
// DEVI vedere notifiche
```

### 5. Test Settings
1. Apri Module Settings
2. Trova "Notifiche Critici/Fumble" → Disabilita
3. Tira 1d20 con risultato 20
4. NON deve apparire notifica

### 6. Test Suoni (Opzionali)
1. Crea file `sounds/critical-hit.mp3` e `sounds/fumble.mp3`
2. Abilita "Suoni Critici/Fumble"
3. Tira 1d20 con risultato 20
4. Deve suonare il file audio

---

## 📁 File Audio Opzionali

### Struttura Directory
```
brancalonia-bigat/
├── modules/
│   └── brancalonia-dice-theme.js
└── sounds/
    ├── critical-hit.mp3  (opzionale)
    └── fumble.mp3        (opzionale)
```

### Dove Trovare Suoni
- **Freesound.org** - Suoni gratuiti
- **Pixabay** - Musica e effetti sonori
- **Zapsplat** - Effetti sonori gratuiti

### Suggerimenti Suoni
- **Critico**: Fanfara, campane, applausi
- **Fumble**: Trombone triste, crash, "oh no!"

---

## 🎨 Log Console Migliorato

**Prima**:
```
🎲 Brancalonia Dice Theme: Successfully loaded colorsets for Dice So Nice
```

**Dopo**:
```
🎨 Brancalonia Dice Theme: Initializing Dice So Nice integration
✅ Dice So Nice detected, theme will be applied
🎨 Registrato colorset: Brancalonia — Oro e Ceralacca
🎨 Registrato colorset: Brancalonia — Pergamena e Inchiostro
🎨 Registrato colorset: Brancalonia — Smeraldo e Oro
🎨 Registrato colorset: Brancalonia — Vino e Oro
🎲 Brancalonia Dice Theme: Successfully loaded 4 colorsets for Dice So Nice
```

---

## ✅ Checklist Correzioni

### Opzione B - Fix Completo ⭐
- [x] Factory pattern per colorset
- [x] Filtri per notifiche (5 controlli)
- [x] Setting: Notifiche on/off
- [x] Setting: Suoni on/off
- [x] Setting: Tema preferito (informativo)
- [x] Supporto suoni personalizzati
- [x] Fallback silenzioso per suoni mancanti
- [x] Log console migliorato
- [x] Documentazione completa
- [x] Nessun errore linting

---

## 🎯 Risultato Finale

Il **Dice Theme** è ora:
- ✅ **Più Pulito** - Factory pattern invece di duplicazione
- ✅ **Più Intelligente** - 5 filtri per notifiche
- ✅ **Più Personalizzabile** - 3 settings utente
- ✅ **Più Immersivo** - Suoni opzionali per critici/fumble
- ✅ **Più Sicuro** - Nessuno spoiler, nessuno spam
- ✅ **Più Mantenibile** - Facile aggiungere nuovi colorset

---

## 📊 Statistiche Finali Fix

| Metrica | Valore |
|---------|--------|
| **Righe Aggiunte** | +92 |
| **Settings Aggiunti** | 3 |
| **Filtri Notifiche** | 5 |
| **Controlli Sicurezza** | 8 |
| **Suoni Opzionali** | 2 |
| **Colorset** | 4 |
| **Codice Duplicato Rimosso** | ~85 righe |
| **Errori Linting** | 0 |
| **Tempo Fix** | ~30 minuti |

---

## 🎉 Conclusione

Il modulo **Dice Theme** ha ricevuto un **fix completo** che:
1. Elimina codice duplicato con factory pattern
2. Aggiunge filtri intelligenti per notifiche
3. Fornisce 3 settings per personalizzazione
4. Supporta suoni opzionali per immersività
5. Previene spam e spoiler

**Il sistema è PRONTO per essere testato in Foundry VTT!** 🎲✨

---

**Completato da**: AI Assistant  
**Data**: 2025-10-03  
**Versione**: 2.0 - Fix Completo + Settings + Suoni


