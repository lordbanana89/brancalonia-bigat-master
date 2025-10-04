# 🎲 Analisi Brancalonia Dice Theme

## Data: 2025-10-03
## File: `modules/brancalonia-dice-theme.js`
## Status: ✅ FUNZIONALE MA MIGLIORABILE

---

## 🎯 Funzione del Modulo

Il **Dice Theme** integra il modulo "Dice So Nice" per applicare temi visivi personalizzati ai dadi 3D.

### Colorset Disponibili (4)
1. **Gold & Wax** (Oro e Ceralacca) - Materiale: metal
2. **Parchment & Ink** (Pergamena e Inchiostro) - Materiale: plastic
3. **Emerald & Gold** (Smeraldo e Oro) - Materiale: glass
4. **Wine & Gold** (Vino e Oro) - Materiale: glass

### Funzionalità Extra
- ✅ Notifiche per critici (d20 = 20)
- ✅ Notifiche per fumble (d20 = 1)
- ✅ Lettura CSS variables con fallback
- ✅ Controlli di sicurezza per DSN

---

## 🔍 Analisi Dettagliata

### ✅ Cosa Funziona Bene

#### 1. **Struttura Colorset** ✅
```javascript
const goldWaxColorset = {
  name: 'branca-goldwax',
  description: 'Brancalonia — Oro e Ceralacca',
  category: 'Brancalonia',
  foreground: getCSSVar('--bcl-ink-strong', '#1C140D'),
  background: getCSSVar('--bcl-gold', '#C9A54A'),
  edge: getCSSVar('--bcl-ink-strong', '#1C140D'),
  outline: getCSSVar('--bcl-ink-strong', '#1C140D'),
  material: 'metal',
  font: 'Alegreya',
  fontScale: { /* ... */ }
};
```
**✅ Ottimo**: Usa CSS variables con fallback, ben strutturato.

---

#### 2. **Controlli di Sicurezza** ✅
```javascript
if (!game.modules.get('dice-so-nice')?.active) {
  console.log('🎲 Dice So Nice not active, skipping theme registration');
  return;
}

if (!dice3d) {
  console.error('❌ Dice So Nice API not available');
  return;
}
```
**✅ Ottimo**: Evita errori se DSN non è presente.

---

#### 3. **Helper per CSS Variables** ✅
```javascript
const getCSSVar = (name, fallback) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim() || fallback;
};
```
**✅ Ottimo**: Legge variabili CSS con fallback sicuro.

---

#### 4. **Preset Commentati Correttamente** ✅
```javascript
// NON creare preset - causano errori in DSN v5
console.log('🎲 Skipping dice presets - using colorsets only');
/* Commentato perché causa errori ... */
```
**✅ Ottimo**: Documentato il perché sono disabilitati.

---

### ⚠️ Problemi Identificati

#### 1. ⚠️ **Notifiche per TUTTI i Dadi** (MEDIA)
**Problema**: Le notifiche per critici/fumble appaiono per TUTTI i d20, anche NPC o tiri nascosti.

**Linea 155-172**:
```javascript
Hooks.on('diceSoNiceRollComplete', (chatMessageID) => {
  const message = game.messages.get(chatMessageID);
  if (!message) return;

  const roll = message.rolls?.[0];
  if (!roll) return;

  const d20Result = roll.dice.find(d => d.faces === 20)?.results?.[0]?.result;

  if (d20Result === 20) {
    ui.notifications.info('⚔️ Colpo Critico! Magnifico!', { permanent: false });
  } else if (d20Result === 1) {
    ui.notifications.warn('💀 Fallimento Critico! Maledizione!', { permanent: false });
  }
});
```

**Problemi**:
- Non controlla se il tiro è del giocatore corrente
- Mostra notifiche anche per tiri dei PNG
- Mostra notifiche anche per tiri sussurrati/nascosti
- Non considera se il giocatore ha permessi per vedere il risultato

**Effetto**: Spam di notifiche, possibile spoiler per tiri nascosti.

---

#### 2. ℹ️ **Font Hardcoded** (DESIGN)
**Problema**: I font sono hardcoded e potrebbero non essere disponibili.

**Linea 35, 57, 79, 101**:
```javascript
font: 'Alegreya',  // Linea 35, 57
font: 'Cinzel',    // Linea 79, 101
```

**Problemi**:
- Se i font non sono disponibili in DSN, usa il default (OK ma non ideale)
- Non c'è controllo se i font sono disponibili

**Effetto**: Minimo (DSN gestisce il fallback).

---

#### 3. ℹ️ **Nessun Setting Utente** (DESIGN)
**Problema**: Gli utenti non possono scegliere il colorset di default.

**Cosa manca**:
- Nessun setting per scegliere colorset preferito
- Nessun setting per abilitare/disabilitare notifiche critici
- Nessun setting per personalizzare messaggi

**Effetto**: Meno flessibilità per gli utenti.

---

#### 4. ℹ️ **Codice Ripetitivo** (DESIGN)
**Problema**: I 4 colorset hanno struttura identica, solo valori diversi.

**Linee 26-111**: 4 blocchi quasi identici.

**Possibile ottimizzazione**:
```javascript
const colorsets = [
  {
    name: 'branca-goldwax',
    description: 'Brancalonia — Oro e Ceralacca',
    foreground: '--bcl-ink-strong',
    background: '--bcl-gold',
    edge: '--bcl-ink-strong',
    outline: '--bcl-ink-strong',
    material: 'metal',
    font: 'Alegreya'
  },
  // ... altri colorset
];

colorsets.forEach(config => {
  dice3d.addColorset(createColorset(config), 'default');
});
```

**Effetto**: Minimo (codice attuale è più leggibile).

---

#### 5. ℹ️ **Nessun Suono Personalizzato** (MISSING FEATURE)
**Problema**: Non ci sono suoni personalizzati per i critici/fumble.

**Cosa manca**:
- Suono speciale per critico (es. fanfara)
- Suono speciale per fumble (es. trombone triste)
- Suono taverna per tiri normali

**Effetto**: Esperienza meno immersiva.

---

## 📊 Priorità Problemi

| # | Problema | Priorità | Impatto |
|---|----------|----------|---------|
| 1 | Notifiche per tutti i dadi | 🟠 MEDIA | Spam + possibili spoiler |
| 2 | Nessun setting utente | 🟡 BASSA | Meno personalizzazione |
| 3 | Font hardcoded | 🟢 OPZIONALE | Gestito da DSN |
| 4 | Codice ripetitivo | 🟢 OPZIONALE | Leggibilità OK |
| 5 | Nessun suono | 🟢 OPZIONALE | Feature bonus |

---

## 🛠️ Soluzioni Proposte

### Fix 1: Filtrare Notifiche per Giocatore Corrente
**Problema**: Notifiche per tutti i d20.

**Soluzione**:
```javascript
Hooks.on('diceSoNiceRollComplete', (chatMessageID) => {
  const message = game.messages.get(chatMessageID);
  if (!message) return;

  // Controlla se il messaggio è visibile all'utente corrente
  if (message.whisper?.length > 0 && !message.whisper.includes(game.user.id)) {
    return; // Tiro sussurrato ad altri
  }

  // Controlla se il tiro è del giocatore corrente o di un PNG che controlla
  const isPlayerRoll = message.user?.id === game.user.id;
  const isControlledToken = message.speaker?.token && 
    canvas.tokens?.get(message.speaker.token)?.isOwner;

  if (!isPlayerRoll && !isControlledToken) {
    return; // Non mostrare per PNG non controllati
  }

  const roll = message.rolls?.[0];
  if (!roll) return;

  const d20Result = roll.dice.find(d => d.faces === 20)?.results?.[0]?.result;

  if (d20Result === 20) {
    ui.notifications.info('⚔️ Colpo Critico! Magnifico!', { permanent: false });
  } else if (d20Result === 1) {
    ui.notifications.warn('💀 Fallimento Critico! Maledizione!', { permanent: false });
  }
});
```

---

### Fix 2: Aggiungere Settings Utente
**Problema**: Nessuna personalizzazione.

**Soluzione**:
```javascript
Hooks.once('init', () => {
  // Setting per abilitare/disabilitare notifiche
  game.settings.register('brancalonia-bigat', 'diceCriticalNotifications', {
    name: 'Notifiche Critici/Fumble',
    hint: 'Mostra notifiche quando tiri 1 o 20 su un d20',
    scope: 'client',
    config: true,
    type: Boolean,
    default: true
  });

  // Setting per colorset di default
  game.settings.register('brancalonia-bigat', 'diceDefaultColorset', {
    name: 'Tema Dadi Preferito',
    hint: 'Scegli il tema di default per i tuoi dadi',
    scope: 'client',
    config: true,
    type: String,
    choices: {
      'branca-goldwax': 'Oro e Ceralacca',
      'branca-parchment': 'Pergamena e Inchiostro',
      'branca-emerald': 'Smeraldo e Oro',
      'branca-wine': 'Vino e Oro'
    },
    default: 'branca-goldwax'
  });
});
```

---

### Fix 3: Ottimizzare Colorset con Factory
**Problema**: Codice ripetitivo.

**Soluzione**:
```javascript
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
  fontScale: {
    d100: 0.8, d20: 1.0, d12: 1.0, d10: 1.0,
    d8: 1.0, d6: 1.2, d4: 1.0
  }
});

const colorsetConfigs = [
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

colorsetConfigs.forEach(config => {
  dice3d.addColorset(createColorset(config), 'default');
});
```

---

### Fix 4: Aggiungere Suoni Personalizzati
**Problema**: Nessun suono.

**Soluzione**:
```javascript
Hooks.on('diceSoNiceRollComplete', async (chatMessageID) => {
  // ... controlli ...

  if (d20Result === 20) {
    ui.notifications.info('⚔️ Colpo Critico! Magnifico!', { permanent: false });
    
    // Suono critico
    AudioHelper.play({
      src: 'modules/brancalonia-bigat/sounds/critical-hit.mp3',
      volume: 0.5,
      autoplay: true,
      loop: false
    }, false);
  } else if (d20Result === 1) {
    ui.notifications.warn('💀 Fallimento Critico! Maledizione!', { permanent: false });
    
    // Suono fumble
    AudioHelper.play({
      src: 'modules/brancalonia-bigat/sounds/fumble.mp3',
      volume: 0.5,
      autoplay: true,
      loop: false
    }, false);
  }
});
```

---

## 🎯 Raccomandazioni

### Opzione A: **Fix Minimale** (Raccomandato) ⭐
1. ✅ Filtrare notifiche per giocatore corrente
2. ✅ Aggiungere setting per abilitare/disabilitare notifiche

**Vantaggi**:
- Risolve problema spam
- Nessuno spoiler
- Personalizzazione base

### Opzione B: **Fix Completo**
1. ✅ Opzione A
2. ✅ Aggiungere setting per colorset default
3. ✅ Ottimizzare colorset con factory
4. ✅ Aggiungere suoni personalizzati (se disponibili)

**Vantaggi**:
- Esperienza più completa
- Codice più mantenibile
- Immersività maggiore

### Opzione C: **Lascia Così**
Il modulo funziona correttamente, i problemi sono minori.

---

## 📈 Statistiche Modulo

| Metrica | Valore |
|---------|--------|
| **Righe Totali** | 185 |
| **Colorset Registrati** | 4 |
| **Hook Registrati** | 3 |
| **Controlli Sicurezza** | 3 |
| **Settings** | 0 |
| **Bug Critici** | 0 |
| **Bug Minori** | 0 |
| **Design Issues** | 4 |

---

## ✅ Punti di Forza

1. ✅ **Ben Strutturato**: Codice pulito e leggibile
2. ✅ **Sicuro**: Controlli per DSN non presente
3. ✅ **Tematico**: 4 colorset coerenti con Brancalonia
4. ✅ **CSS Variables**: Usa variabili del tema con fallback
5. ✅ **Documentato**: Commenti chiari sul perché preset sono disabilitati
6. ✅ **Notifiche Immersive**: Feedback visivo per critici/fumble

---

## ⚠️ Punti di Debolezza

1. ⚠️ **Notifiche Non Filtrate**: Mostrate per tutti i tiri
2. ℹ️ **Nessun Setting**: Gli utenti non possono personalizzare
3. ℹ️ **Codice Ripetitivo**: 4 blocchi simili (ma leggibile)
4. ℹ️ **Nessun Suono**: Solo notifiche visuali

---

## 🎯 Conclusione

Il **Dice Theme** è un modulo **FUNZIONALE e BEN FATTO** che:

✅ **Funziona perfettamente** con Dice So Nice  
✅ **Offre 4 temi coerenti** con l'estetica di Brancalonia  
✅ **Ha controlli di sicurezza** appropriati  
⚠️ **Ha un problema minore** con le notifiche non filtrate  
ℹ️ **Potrebbe essere migliorato** con settings e suoni  

**Il modulo FA BENE il suo lavoro, ma può essere migliorato per evitare spam di notifiche.**

---

## 🎯 Vuoi che Proceda?

- **A**: Fix Minimale (filtra notifiche + setting) ⭐
- **B**: Fix Completo (A + factory + suoni)
- **C**: Lascia così (funziona comunque)
- **D**: Analizza altro modulo

Dimmi cosa preferisci! 🚀


