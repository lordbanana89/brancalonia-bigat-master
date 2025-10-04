# 🏰 HAVEN-SYSTEM UNIFICAZIONE COMPLETA

**Data:** $(date +"%Y-%m-%d %H:%M:%S")  
**Modulo:** haven-system.js → covo-granlussi-v2.js  
**Tipo Operazione:** Unificazione + Eliminazione

---

## 📊 SOMMARIO

| Metrica | Valore |
|---------|--------|
| **File eliminati** | 1 (haven-system.js - 1252 linee) |
| **File modificati** | 3 (covo-granlussi-v2.js, rest-system.js, BrancaloniaCore.js) |
| **Linee aggiunte** | 135 (metodo applyRestBenefits) |
| **Dipendenze risolte** | 1 (rest-system → covo-granlussi-v2) |
| **Conflitti risolti** | 1 hook (dnd5e.restCompleted) |

---

## 🔍 PROBLEMA IDENTIFICATO

### **Sistema Duplicato**
- **haven-system.js** (1252 linee): Sistema vecchio basato su Journal
- **covo-granlussi-v2.js** (già refactored): Sistema moderno basato su Actor

### **Conflitto Hook**
Entrambi i sistemi registravano `Hooks.on('dnd5e.restCompleted')`:
- `haven-system.js` → applicava bonus riposo da "stanze"
- `rest-system.js` → gestiva riposo Canaglia

### **Dipendenza Critica**
`rest-system.js` dipendeva da `haven-system.js` per `applyRestBenefits()`

---

## ✅ SOLUZIONE IMPLEMENTATA

### **1. Migrazione Metodo**
✅ Copiato `applyRestBenefits()` da `haven-system.js` → `covo-granlussi-v2.js`  
✅ Adattato da Journal-based → Actor-based  
✅ Integrato Logger v2.0.0 + Statistics + Events  

### **2. Mappatura Granlussi → Benefici Riposo**

| Granlusso | Bonus Riposo |
|-----------|--------------|
| **Cantina** | +1 Dado Vita, +2 HP, Remove Exhaustion (long rest) |
| **Distilleria** | +1 HP (guarigione alchemica) |
| Fucina | Nessun bonus riposo diretto |
| Borsa Nera | Nessun bonus riposo diretto |
| Scuderie | Nessun bonus riposo diretto |

### **3. Aggiornamenti Integrazione**

**rest-system.js (linee 522-558):**
```javascript
async applyBrancaloniaRestEffects(actor, config) {
  // Applica benefici del Covo se disponibile
  if (game.brancalonia?.covo?.applyRestBenefits) {
    const covoRestBenefits = game.brancalonia.covo.applyRestBenefits(actor, config.restType);
    // Applica HP, remove exhaustion, ecc.
  }
}
```

**BrancaloniaCore.js:**
```javascript
'covo-granlussi-v2': [],
'rest-system': ['covo-granlussi-v2'],  // ✅ Dipendenza aggiornata
```

**module.json:**
```diff
- "modules/haven-system.js",  // ❌ Rimosso
```

### **4. Public API Esposta**

```javascript
// ✅ Già disponibile
game.brancalonia.covo.applyRestBenefits(actor, restType)

// Returns: { extraHitDice, extraHealing, removeExhaustion }
```

---

## 🎯 FUNZIONALITÀ IMPLEMENTATE

### **Metodo: applyRestBenefits()**

**Parametri:**
- `actor` {Actor} - Attore che riposa
- `restType` {string} - 'short' o 'long'

**Returns:**
- `null` - Se nessun Covo/Granlusso
- `Object` - Benefici riposo:
  - `extraHitDice` {number} - Dadi vita extra recuperati
  - `extraHealing` {number} - HP extra recuperati
  - `removeExhaustion` {boolean} - Rimuove 1 livello esaurimento

**Logica:**
1. Trova Compagnia dell'attore
2. Trova Covo della Compagnia
3. Recupera Granlussi del Covo (Items embedded)
4. Applica benefici in base al tipo di Granlusso
5. Emette evento `covo:rest-benefits-applied`
6. Traccia statistics

---

## 📈 MIGLIORAMENTI

### **1. Performance**
- ✅ Performance tracking per `applyRestBenefits`
- ✅ Logger v2.0.0 integrato
- ✅ Error handling robusto

### **2. Observability**
- ✅ Event emitter: `covo:rest-benefits-applied`
- ✅ Log dettagliati per ogni Granlusso
- ✅ Statistics tracking

### **3. Compatibilità**
- ✅ Integrazione con D&D 5e rest system
- ✅ Supporto sia short che long rest
- ✅ Fallback graceful se nessun Covo

---

## 🔬 TEST RACCOMANDATI

### **Test 1: Riposo con Cantina**
```javascript
const actor = game.actors.getName("Eroe");
const benefits = game.brancalonia.covo.applyRestBenefits(actor, 'long');
// Expected: { extraHitDice: 1, extraHealing: 2, removeExhaustion: true }
```

### **Test 2: Riposo senza Covo**
```javascript
const actor = game.actors.getName("Vagabondo");
const benefits = game.brancalonia.covo.applyRestBenefits(actor, 'long');
// Expected: null
```

### **Test 3: Integrazione rest-system**
```javascript
await game.brancalonia.restSystem.startLongRest(actor);
// Verifica che i bonus Covo siano applicati automaticamente
```

---

## 📂 FILE MODIFICATI

### **✅ Aggiunti/Modificati**
- `modules/covo-granlussi-v2.js` (+135 linee)
- `modules/rest-system.js` (+34 linee)
- `core/BrancaloniaCore.js` (dipendenze aggiornate)
- `module.json` (script rimosso)

### **❌ Eliminati**
- `modules/haven-system.js` (1252 linee)

### **💾 Backup**
- `modules/haven-system.js.backup` (1252 linee)

---

## 🎉 RISULTATO FINALE

### **Prima dell'Unificazione**
- 2 sistemi duplicati (haven-system + covo-granlussi-v2)
- 1 conflitto hook (dnd5e.restCompleted)
- 1252 linee di codice legacy
- Dipendenza problematica (rest-system → haven-system)

### **Dopo l'Unificazione**
- ✅ 1 sistema unificato (covo-granlussi-v2)
- ✅ 0 conflitti hook
- ✅ -1117 linee di codice (135 nuove, 1252 eliminate)
- ✅ Dipendenza corretta (rest-system → covo-granlussi-v2)
- ✅ Logger v2.0.0 integrato
- ✅ Performance tracking
- ✅ Event emitters
- ✅ Error handling robusto

---

## 📝 NOTE FINALI

1. **Mappatura Granlussi**: Solo Cantina e Distilleria danno bonus riposo. Altri Granlussi (Fucina, Borsa Nera, Scuderie) potrebbero essere estesi in futuro.

2. **Compatibilità**: Il sistema è retrocompatibile. Se un attore non ha Covo, `applyRestBenefits()` restituisce `null` senza errori.

3. **Migration**: Gli attori con vecchi Haven basati su Journal devono migrare usando `game.brancalonia.migration.migrateAll()`.

4. **Estensibilità**: È facile aggiungere nuovi Granlussi con benefici riposo. Basta estendere lo `switch` nel metodo `applyRestBenefits()`.

---

**Operazione completata con successo! ✅**

---

## 🔧 COMANDI UTILI

```javascript
// Verifica stato Covo
game.brancalonia.covo.getStatus()

// Test benefici riposo
game.brancalonia.covo.applyRestBenefits(game.actors.getName("Eroe"), 'long')

// Statistics
game.brancalonia.covo.getStatistics()

// Report completo
game.brancalonia.covo.showReport()
```

