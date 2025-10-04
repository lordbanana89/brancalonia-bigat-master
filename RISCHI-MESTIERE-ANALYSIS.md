# 🔍 Analisi brancalonia-rischi-mestiere.js

**Data**: 2025-10-03  
**File**: `/modules/brancalonia-rischi-mestiere.js`  
**Righe**: 930  
**Status Logging**: ❌ **NON AGGIORNATO** - Serve upgrade completo

---

## ⚠️ Stato Attuale

### ❌ Problemi Critici

```javascript
// Line 1-5: NO import logger!
// Nessun import presente nel file

// Line 9:
console.log("⚠️ Brancalonia | Inizializzazione Sistema Rischi del Mestiere");

// Line 32:
console.error("Errore nell'inizializzazione Sistema Rischi del Mestiere:", error);

// ... e altre 22 chiamate console.log/error/warn
```

**Console.log/error/warn**: 24 ❌  
**Import Logger**: 0 ❌  
**Eventi**: 0 ❌  
**Performance Tracking**: 0 ❌  
**Statistiche**: 0 ❌

---

## 📊 Distribuzione Console Calls

| Tipo | Count | Righe |
|------|-------|-------|
| `console.log` | 7 | 9, 252, 359, 421, 707, 723 |
| `console.error` | 16 | 32, 89, 256, 293, 363, 368, 438, 540, 567, 583, 683, 711, 726, 916 |
| `console.warn` | 1 | 301 |
| **TOTALE** | **24** | |

---

## 🎯 Funzionalità del Modulo

### Cosa fa questo modulo?

Sistema completo per gestire i **Rischi del Mestiere** per le Cricche in Brancalonia:

1. **Tabella Rischi**: 23 eventi diversi (1-99+)
2. **Sistema Nomea**: Calcolo modificatori basati su Nomea
3. **Sistema Imbosco**: Settimane di nascondimento riducono rischi
4. **Eventi Automatici**: Gestione automatica degli eventi
5. **Chat Commands**: `/rischi`, `/imbosco`, `/rischihelp`
6. **Macro Automatiche**: 3 macro create automaticamente
7. **Dialog UI**: Interfacce per tirare rischi
8. **Flag System**: Gestione taglie e nomea
9. **GM Controls**: Pulsanti nella sidebar

### Eventi Gestiti (23 tipi)

| Range | Evento | Tipo |
|-------|--------|------|
| 1-15 | Non succede nulla | neutro |
| 16-20 | Ricattata da Infame | ricatto |
| 21-25 | Incontro con birro | birri |
| 26-30 | Cacciatore di Equitaglia | cacciatori |
| 31-35 | Vendetta | vendetta |
| 36-40 | Gruppo di birri (1d4) | birri |
| 41-45 | Soffiata ai birri | soffiata |
| 46-50 | Pattuglia (2d4 + capobirro) | birri |
| 51-55 | Opportunità illegale | opportunita |
| 56-60 | Cavaliere cacciatore | cacciatori |
| 61-64 | Tradimento Infame → Covo | tradimento |
| 65-68 | Furto al Covo | furto |
| 69-71 | 3 cacciatori Equitaglia | cacciatori |
| 72-74 | Tradimento interno | tradimento |
| 75-77 | Maledizione Turchini | magia |
| 78-80 | Befana e capobanda | magia |
| 81-83 | Ricatto al capobanda | ricatto |
| 84-86 | Banda rivale stesso job | rivalita |
| 87-89 | Vendita scagnozzi | tradimento |
| 90-92 | Banda vuole Covo | rivalita |
| 93-95 | Confinato persecuta | vendetta |
| 96-98 | Malacoda cerca anime | infernale |
| 99+ | Editto: +100g taglia | editto |

---

## 🎯 Piano di Upgrade

### Fase 1: Import Logger ✅
Aggiungere import all'inizio del file:
```javascript
import logger from './brancalonia-logger.js';
```

### Fase 2: Rimuovere Console.log (24 → 0) ✅
Sostituire tutte le 24 chiamate con logger strutturato:
- `console.log` → `logger.info()` / `logger.debug()`
- `console.error` → `logger.error()`
- `console.warn` → `logger.warn()`

### Fase 3: Aggiungere VERSION e MODULE_NAME ✅
```javascript
class BrancaloniaRischiMestiere {
  static VERSION = '2.0.0';
  static MODULE_NAME = 'RischiMestiere';
  // ...
}
```

### Fase 4: Event Emitter ✅
Aggiungere 6 eventi:
- `rischi:rolled` - Quando viene tirato 1d100
- `rischi:event-triggered` - Quando si verifica un evento
- `rischi:imbosco-applied` - Quando viene applicato imbosco
- `rischi:imbosco-reset` - Quando imbosco viene resettato
- `rischi:taglia-increased` - Quando viene aumentata taglia (editto)
- `rischi:initialized` - Quando sistema è inizializzato

### Fase 5: Performance Tracking ✅
Tracciare tempi per:
- `rischi-init` - Inizializzazione
- `rischi-roll` - Tiro rischi
- `rischi-event-handling` - Gestione eventi

### Fase 6: Statistiche ✅
Implementare:
```javascript
static statistics = {
  totalRolls: 0,
  eventsByType: {},
  totalImbosco: 0,
  avgRollValue: 0,
  highestNomea: 0,
  totalTaglieApplicate: 0
}
```

### Fase 7: API Estesa ✅
Aggiungere metodi pubblici:
- `getStatistics()`
- `getEventHistory()`
- `getTabellaRischi()`

---

## 📈 Metriche Before/After

| Metrica | Before | After (Stimato) |
|---------|--------|-----------------|
| **Righe** | 930 | ~1050 | (+120, +13%) |
| **Console.log** | 24 | 0 | ✅ |
| **Chiamate Logger** | 0 | ~35 | (+35) |
| **Eventi** | 0 | 6 | 🆕 |
| **Performance Ops** | 0 | 3 | 🆕 |
| **Statistiche** | ❌ | ✅ | 🆕 |
| **API Pubblica** | 8 | 11 | +3 🆕 |
| **Import** | 0 | 1 | 🆕 |

---

## 🔍 Code Quality

| Feature | Before | After |
|---------|--------|-------|
| **Import Logger** | ❌ | ✅ |
| **Logging Strutturato** | ❌ 0 | ✅ ~35 |
| **Console.log** | ❌ 24 | ✅ 0 |
| **Event Emitter** | ❌ | ✅ 6 eventi |
| **Performance Tracking** | ❌ | ✅ 3 ops |
| **Statistiche** | ❌ | ✅ Complete |
| **VERSION/MODULE_NAME** | ❌ | ✅ |
| **JSDoc** | ⚠️ Parziale | ✅ Completo |

---

## 💡 Decisione

### **Opzione A: REFACTORING LEGGERO** 🔄

**Cosa include**:
- ✅ Import logger
- ✅ Rimuovere 24 console.log
- ✅ Aggiungere VERSION/MODULE_NAME
- ✅ Logging strutturato base

**Righe aggiunte**: ~50 (+5%)  
**Tempo**: ~15 minuti  
**Criticità**: ⚠️ MEDIA

---

### **Opzione B: REFACTORING MEDIO** 🔶

**Cosa include**:
- ✅ Tutto di Opzione A
- ✅ Event emitter (6 eventi)
- ✅ Performance tracking (3 ops)
- ✅ Statistiche base

**Righe aggiunte**: ~90 (+10%)  
**Tempo**: ~25 minuti  
**Criticità**: ⚠️ MEDIA-ALTA

---

### **Opzione C: REFACTORING COMPLETO** 🔥 (Raccomandato)

**Cosa include**:
- ✅ Tutto di Opzione B
- ✅ Statistiche estese
- ✅ Event history tracking
- ✅ API estesa (getStatistics, getEventHistory)
- ✅ JSDoc completo
- ✅ Test suite (48 test come init-fix)

**Righe aggiunte**: ~120-200 (+13-21%)  
**Tempo**: ~40 minuti  
**Criticità**: ⚠️ ALTA

---

## 🚀 Raccomandazione

**Scegli Opzione C - Refactoring Completo!** 🎯

Motivi:
1. **24 console.log** da rimuovere - lavoro significativo
2. Modulo **critico per gameplay** (Rischi del Mestiere)
3. Mancanza totale di **logging strutturato**
4. Ottima opportunità per **statistiche dettagliate**
5. Eventi per **integrazione con altri moduli**
6. **Coerenza** con altri moduli già aggiornati

---

## 🎊 Moduli Completati Finora

### ✅ Completati (5)
1. ✅ brancalonia-logger.js - v2.0.0
2. ✅ brancalonia-mechanics.js - v2.0.0
3. ✅ brancalonia-module-activator.js - v2.0.0
4. ✅ brancalonia-module-loader.js - v2.0.0
5. ✅ brancalonia-modules-init-fix.js - v2.0.0

### 🔄 In Analisi (1)
6. 🔄 **brancalonia-rischi-mestiere.js** ← **SEI QUI**

---

## 🎯 Cosa Scegli?

- **A**: 🔄 **Refactoring Leggero** (console.log + logger base)
- **B**: 🔶 **Refactoring Medio** (+ eventi + performance)
- **C**: 🔥 **Refactoring Completo** (tutto + statistiche + test)

**Quale opzione preferisci?**


