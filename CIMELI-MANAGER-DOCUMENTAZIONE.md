# 📜 Brancalonia Cimeli Manager - Documentazione

## Data: 2025-10-03
## Versione: 1.0
## Status: ✅ COMPLETO E PRONTO

---

## 🎯 Cos'è il Cimeli Manager?

Il **Cimeli Manager** è un sistema di gestione automatizzata per i Cimeli Maledetti di Brancalonia. Fornisce:

- ✅ **Macro user-friendly** per azioni rapide
- ✅ **Tracking automatico** contatori usi (giornalieri/totali)
- ✅ **Reset giornaliero** automatico all'alba
- ✅ **Sistema saving throw** per maledizioni attivabili
- ✅ **Gestione esaurimento** (distruzione/perdita poteri)
- ✅ **API globale** per sviluppatori

---

## 📦 Installazione

### File Aggiunto
- `modules/brancalonia-cimeli-manager.js`

### Registrato in
- `module.json` → `esmodules` array (riga 88)

### Inizializzazione
- Hook `ready` → `CimeliManager.initialize()`

---

## 🎮 API Globale

### Accesso
```javascript
game.brancalonia.cimeli
```

### Metodi Disponibili

#### 1. `consumeUse(actor, itemId)`
Consuma un uso di un cimelo con contatore.

```javascript
// Esempio: Usa il Quadrifoglio
const actor = game.actors.getName("Pippo");
await game.brancalonia.cimeli.consumeUse(actor, "016");
```

**Effetti**:
- Decrementa `currentUsesDaily` (se presente)
- Decrementa `currentUsesTotal` (se presente)
- Gestisce esaurimento automatico
- Marca `used = true` per one-shot

---

#### 2. `resetDaily()`
Reset manuale di tutti i contatori giornalieri.

```javascript
// Reset manuale (normalmente automatico)
await game.brancalonia.cimeli.resetDaily();
```

**Quando si attiva**:
- Automaticamente ogni 24h di gioco (world time)
- Manualmente via macro GM
- Notifica GM in chat

---

#### 3. `checkUses(actor, itemId)`
Controlla usi rimanenti di un cimelo.

```javascript
const uses = game.brancalonia.cimeli.checkUses(actor, "016");
console.log(uses);
// {
//   daily: 1,
//   maxDaily: 1,
//   total: 5,
//   maxTotal: 7,
//   used: false
// }
```

---

#### 4. `drinkBoccale(actor)`
**Macro Specifica**: #003 - Il Boccale del Gigante Ubriacone

```javascript
await game.brancalonia.cimeli.drinkBoccale(actor);
```

**Logica**:
1. Incrementa contatore sorsi (max 3)
2. Al 3° sorso: TS Costituzione CD 15
3. Fallimento → Applica condizione "Ubriaco" (1h)
4. Reset contatore dopo il TS

---

#### 5. `rerollDice(actor, itemId)`
**Macro Specifica**: #016 - Quadrifoglio / #028 - Ferro di Cavallo

```javascript
await game.brancalonia.cimeli.rerollDice(actor, "016");
```

**Logica**:
1. Verifica usi disponibili
2. Consuma uso (daily + total)
3. Notifica giocatore che può ritirare
4. Allerta quando totali < 3

---

#### 6. `checkResurrection(actor)`
**Macro Specifica**: #031 - La Moneta del Traghettatore

```javascript
// Automatico via hook updateActor
// Oppure manuale:
await game.brancalonia.cimeli.checkResurrection(actor);
```

**Logica**:
1. Si attiva quando HP ≤ 0
2. Controlla se possiede moneta
3. Controlla se `used = false`
4. Resurrezione a 1 HP
5. Marca `used = true`
6. Messaggio epico in chat

---

#### 7. `forceRollResult(actor)`
**Macro Specifica**: #043 - Il Dado del Destino

```javascript
await game.brancalonia.cimeli.forceRollResult(actor);
```

**Logica**:
1. Apre dialog per scelta risultato (1-20)
2. Conferma con warning "irreversibile"
3. Applica risultato forzato
4. Marca `used = true`
5. Disattiva cimelo (diventa d20 normale)

---

## 🎯 Macro Utente Consigliate

### Macro 1: Usa Cimelo Veloce
```javascript
// Nome: 🎲 Usa Cimelo
const actor = canvas.tokens.controlled[0]?.actor;
if (!actor) {
  ui.notifications.warn("Seleziona un token!");
  return;
}

// Lista cimeli con usi
const cimeli = actor.items.filter(i => {
  const impl = i.system?.implementazione;
  return impl?.tipo === 'con_trigger' && impl?.attivo;
});

if (cimeli.length === 0) {
  ui.notifications.info("Nessun cimelo con usi disponibile!");
  return;
}

// Dialog scelta
new Dialog({
  title: "🎲 Usa Cimelo",
  content: `
    <div class="form-group">
      <label>Scegli cimelo:</label>
      <select id="cimelo-select">
        ${cimeli.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
      </select>
    </div>
  `,
  buttons: {
    use: {
      label: "Usa",
      callback: async (html) => {
        const itemId = html.find('#cimelo-select').val();
        const item = actor.items.get(itemId);
        
        // Azioni specifiche
        if (item.name.includes('Boccale')) {
          await game.brancalonia.cimeli.drinkBoccale(actor);
        } else if (item.name.includes('Quadrifoglio') || item.name.includes('Ferro')) {
          await game.brancalonia.cimeli.rerollDice(actor, itemId);
        } else if (item.name.includes('Dado del Destino')) {
          await game.brancalonia.cimeli.forceRollResult(actor);
        } else {
          await game.brancalonia.cimeli.consumeUse(actor, itemId);
        }
      }
    }
  },
  default: "use"
}).render(true);
```

---

### Macro 2: Info Cimeli
```javascript
// Nome: 📊 Info Cimeli
const actor = canvas.tokens.controlled[0]?.actor;
if (!actor) {
  ui.notifications.warn("Seleziona un token!");
  return;
}

const cimeli = actor.items.filter(i => i.system?.implementazione?.attivo);

if (cimeli.length === 0) {
  ui.notifications.info("Nessun cimelo equipaggiato!");
  return;
}

let content = '<div class="cimeli-info"><h3>📊 Cimeli Attivi</h3>';

for (const item of cimeli) {
  const uses = game.brancalonia.cimeli.checkUses(actor, item.id);
  const impl = item.system.implementazione;
  
  content += `<div class="cimelo-entry">
    <h4>${item.name}</h4>
    <p><strong>Tipo:</strong> ${impl.tipo}</p>`;
  
  if (uses) {
    if (uses.daily !== undefined) {
      content += `<p><strong>Usi Giornalieri:</strong> ${uses.daily}/${uses.maxDaily}</p>`;
    }
    if (uses.total !== undefined) {
      content += `<p><strong>Usi Totali:</strong> ${uses.total}/${uses.maxTotal}</p>`;
    }
    if (uses.used !== undefined) {
      content += `<p><strong>Status:</strong> ${uses.used ? '❌ Usato' : '✅ Disponibile'}</p>`;
    }
  }
  
  content += `</div>`;
}

content += '</div>';

ChatMessage.create({
  content: content,
  speaker: ChatMessage.getSpeaker({ actor }),
  whisper: [game.user.id]
});
```

---

### Macro 3: Reset Giornaliero (GM)
```javascript
// Nome: 🌅 Reset Cimeli (GM)
if (!game.user.isGM) {
  ui.notifications.error("Solo il GM può usare questa macro!");
  return;
}

Dialog.confirm({
  title: "Reset Giornaliero Cimeli",
  content: "<p>Resettare tutti i contatori giornalieri dei cimeli?</p>",
  yes: async () => {
    await game.brancalonia.cimeli.resetDaily();
    ui.notifications.info("✅ Cimeli resetati!");
  }
});
```

---

## 🔧 Sistema Tracking Flags

### Struttura Flags
```javascript
actor.flags['brancalonia-bigat'].cimeli = {
  lastDailyReset: timestamp,
  items: {
    "016": { // Item ID
      trackingType: "limited_use",
      maxUsesDaily: 1,
      currentUsesDaily: 1,
      maxUsesTotal: 7,
      currentUsesTotal: 7,
      resetPeriod: "day",
      lastReset: timestamp,
      onDeplete: "item_destroyed",
      depleteMessage: "Il quadrifoglio si sbriciola!"
    }
  }
}
```

### Tipi di Tracking

| `trackingType` | Descrizione | Flags |
|----------------|-------------|-------|
| `limited_use` | Contatori usi | `maxUsesDaily`, `currentUsesDaily`, `maxUsesTotal`, `currentUsesTotal` |
| `one_shot_lifetime` | Uso singolo permanente | `used` (boolean) |
| `counter_with_save` | Contatore + TS | `currentSips`, `maxSipsBeforeSave`, `saveType`, `saveDC` |
| `narrative_only` | Solo descrizione | Nessun flag specifico |

---

## ⚙️ Sistema Reset Giornaliero

### Come Funziona
1. Hook `updateWorldTime` monitora il tempo di gioco
2. Ogni 86400 secondi (24h) attiva reset
3. Per ogni attore:
   - Legge `cimeli.items`
   - Trova quelli con `resetPeriod = "day"`
   - Ripristina `currentUsesDaily = maxUsesDaily`
   - Aggiorna `lastReset = now`
4. Salva `lastCimeliDailyReset` nei settings
5. Notifica GM in chat

### Configurazione
Nessuna configurazione necessaria. Il sistema è automatico.

---

## 🐛 Gestione Esaurimento

### Tipi di Esaurimento

#### 1. `item_destroyed`
Il cimelo si DISTRUGGE automaticamente.

**Esempio**: #016 - Quadrifoglio (dopo 7 usi)

```javascript
// Configurazione JSON
"tracking_flags": {
  "onDeplete": "item_destroyed",
  "depleteMessage": "Il quadrifoglio si sbriciola in polvere!"
}
```

**Comportamento**:
1. Messaggio drammatico in chat
2. Delay 2 secondi
3. Item rimosso dall'inventario

---

#### 2. `item_powerless`
Il cimelo PERDE i poteri ma rimane.

**Esempio**: #043 - Dado del Destino (dopo 1 uso)

```javascript
// Configurazione JSON
"tracking_flags": {
  "onDeplete": "item_powerless",
  "depleteMessage": "Il dado perde la sua magia e diventa un normale d20."
}
```

**Comportamento**:
1. Messaggio in chat
2. `implementazione.attivo = false`
3. Item rimane come souvenir

---

## 📊 Cimeli Supportati (con Macro)

| ID | Nome | Macro | Tipo |
|----|------|-------|------|
| 003 | Boccale Gigante | `drinkBoccale` | Counter + Save |
| 016 | Quadrifoglio | `rerollDice` | Limited 7/7 |
| 028 | Ferro Cavallo | `rerollDice` | Limited 77/77 |
| 031 | Moneta Traghettatore | `checkResurrection` | One-shot (auto) |
| 043 | Dado Destino | `forceRollResult` | One-shot (dialog) |

---

## 🔮 Futuri Sviluppi

### Fase 8 (Opzionale)
- [ ] UI nella character sheet per contatori visibili
- [ ] Notifiche visuali per usi rimanenti
- [ ] Macro per altri 15+ cimeli con trigger
- [ ] Sistema reminder per cimeli narrativi
- [ ] Integration con Dice So Nice per effetti speciali

---

## 🎯 Testing

### Come Testare in Foundry

1. **Carica il modulo** e verifica console:
   ```
   🎲 Inizializzazione Cimeli Manager...
   📜 Macro globali registrate in game.brancalonia.cimeli
   ⏰ Sistema reset giornaliero attivo
   ✅ Cimeli Manager inizializzato con successo
   ```

2. **Equipaggia un cimelo** (es. Quadrifoglio)
3. **Apri console** e prova:
   ```javascript
   const actor = game.actors.getName("Test");
   game.brancalonia.cimeli.checkUses(actor, "016");
   ```

4. **Usa la macro**:
   ```javascript
   await game.brancalonia.cimeli.rerollDice(actor, "016");
   ```

5. **Verifica notifiche** e contatori

---

## ✅ Conclusione

Il **Cimeli Manager** è un sistema completo e pronto per l'uso che:

- ✅ Gestisce automaticamente contatori e usi
- ✅ Fornisce macro user-friendly
- ✅ Integra reset giornaliero automatico
- ✅ Gestisce esaurimento e distruzione
- ✅ Offre API estensibile per sviluppatori

**Il sistema è PRONTO per essere testato in Foundry VTT!** 🎉

---

**Creato da**: AI Assistant  
**Data**: 2025-10-03  
**Versione**: 1.0


