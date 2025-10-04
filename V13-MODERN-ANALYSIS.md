# 🚀 Brancalonia V13 Modern - Analisi Pre-Refactoring

## 📊 Status Attuale

| Metrica | Valore | Status |
|---------|--------|--------|
| **Lines of Code** | 422 | ⚠️ Medio |
| **Console.log** | 26 | ❌ **Da rimuovere** |
| **Logger calls** | 0 | ❌ **Nessuno** |
| **Try-catch blocks** | 0 | ❌ **Nessuno** |
| **Event emitters** | 0 | ❌ **Mancanti** |
| **Public API** | 0 | ❌ **Mancante** |
| **Statistics** | 0 | ❌ **Nessuna** |
| **Performance tracking** | 0 | ❌ **Assente** |
| **JSDoc** | Minimale | ⚠️ **Basic** |
| **ES6 Class** | No | ❌ **Funzioni standalone** |

---

## 🎯 Cosa Fa il Modulo

**Scopo**: Wrapper moderno per Foundry VTT v13+ che usa SOLO API moderne (NO retrocompatibilità)

**Architettura Attuale**:
```
brancalonia-v13-modern.js (422 linee)
├── Helper Functions (3)
│   ├── isJQuery() - Verifica se oggetto è jQuery
│   ├── ensureElement() - Converti jQuery → HTMLElement
│   └── ensureJQuery() - Converti HTMLElement → jQuery
│
├── Version Check
│   └── Hook init - Verifica Foundry v13+
│
├── D&D 5e Modern Hooks (3)
│   ├── renderActorSheetV2 (character)
│   ├── renderActorSheetV2 (npc)
│   └── renderItemSheetV2
│
├── Enhancement Functions (3)
│   ├── applyCharacterSheetEnhancements() - Infamia, Baraonda buttons
│   ├── applyNPCSheetEnhancements() - Danger level indicator
│   └── applyItemSheetEnhancements() - Scadente indicator
│
├── Canvas Enhancements
│   └── Hook canvasReady - Tavern scene effects
│
├── Combat Tracker
│   └── Hook renderCombatTracker - Baraonda roll button
│
├── Chat Messages
│   └── Hook renderChatMessageHTML - Infamia/Baraonda styling
│
├── Compendium
│   └── Hook renderCompendium - Brancalonia filters
│
├── Settings
│   └── Hook init - 3 settings (Infamia, Baraonda, Shoddy)
│
├── Sockets
│   └── Hook ready - Socket handling
│
└── Ready Check
    └── Hook ready - Status logging
```

**Funzionalità Principali**:
1. ✅ Version check Foundry v13+
2. ✅ Modern Actor Sheets enhancements
3. ✅ Modern Item Sheets enhancements
4. ✅ Canvas API moderne
5. ✅ Combat Tracker enhancements
6. ✅ Chat message styling
7. ✅ Compendium filters
8. ✅ Settings registration
9. ✅ Socket handling

---

## ❌ Problemi Identificati

### 1. **26 console.log** ⚠️
```javascript
// Lines: 7, 45, 54, 62, 67, 75, 82, 125, 160, 228, 238, 257, 318, 339, 344, 355, 391, 395, 413-420
console.log('🚀 Brancalonia V13 Modern - Initializing');
console.log('✅ Foundry v13 confirmed');
// ... molti altri
```

### 2. **Nessun Logger v2.0.0** ❌
- Non importa `brancalonia-logger.js`
- Usa solo `console.log/error/warn`

### 3. **Nessuna Statistics** ❌
Dovrebbe trackare:
- Sheets enhanced (character, npc, items)
- Canvas enhancements applied
- Combat tracker renders
- Chat messages styled
- Compendium filters applied
- Settings registered
- Socket messages received
- Errors

### 4. **Nessun Event Emitter** ❌
Dovrebbe emettere:
- `v13:initialized`
- `v13:sheet-enhanced`
- `v13:canvas-ready`
- `v13:combat-tracker-ready`
- `v13:settings-registered`

### 5. **Nessun Error Handling** ❌
- 0 try-catch blocks
- Nessun error tracking
- Nessuna gestione errori

### 6. **Nessuna API Pubblica** ❌
Dovrebbe avere:
- `getStatus()`
- `getStatistics()`
- `forceReEnhance(actorId)`
- `resetStatistics()`
- `showReport()`

### 7. **JSDoc Minimale** ⚠️
Solo 3 commenti basic, mancano:
- @fileoverview
- @typedef
- @param/@returns
- @fires
- @example

### 8. **Nessun Performance Tracking** ❌
File con 9 hooks - performance tracking essenziale!

### 9. **Architettura Non Moderna** ⚠️
- Funzioni standalone invece di ES6 Class
- Nessun pattern singleton
- Stato globale sparso

---

## 🎯 Piano di Refactoring

### Opzione A: Refactoring Completo 🔥
**Tempo**: ~1h 30min

**Fasi**:
1. **Fase 1**: Convertire in ES6 Class `BrancaloniaV13Modern` (20 min)
   - Singleton pattern
   - Static methods
   - Private state

2. **Fase 2**: Logger v2.0.0 + Statistics (20 min)
   - Import logger
   - Sostituire 26 console.log
   - Statistics object (10+ metriche)

3. **Fase 3**: Performance Tracking (15 min)
   - 9 hooks tracking
   - 3 enhancement functions tracking

4. **Fase 4**: Events + Error Handling (20 min)
   - 5 event emitters
   - Try-catch in tutti i metodi (15+)

5. **Fase 5**: Public API + JSDoc (15 min)
   - 5 metodi pubblici
   - JSDoc completo

---

## 💡 Architettura Target

```
BrancaloniaV13Modern (ES6 Static Class)
├── VERSION = '2.0.0'
├── MODULE_NAME = 'V13 Modern'
│
├── State
│   ├── _state (initialized, ready, foundryVersion, dnd5eVersion)
│   └── statistics (12+ metriche)
│
├── Initialization
│   ├── initialize() - Init sistema
│   └── _checkVersions() - Version check
│
├── Helper Methods (3)
│   ├── isJQuery()
│   ├── ensureElement()
│   └── ensureJQuery()
│
├── Enhancement Methods (3)
│   ├── _applyCharacterSheetEnhancements()
│   ├── _applyNPCSheetEnhancements()
│   └── _applyItemSheetEnhancements()
│
├── Hook Handlers (9)
│   ├── _handleCanvasReady()
│   ├── _handleCombatTracker()
│   ├── _handleChatMessage()
│   ├── _handleCompendium()
│   └── ...
│
└── Public API (5)
    ├── getStatus()
    ├── getStatistics()
    ├── forceReEnhance()
    ├── resetStatistics()
    └── showReport()
```

---

## 📋 Statistics Target

```javascript
statistics = {
  initTime: 0,                    // ms
  characterSheetsEnhanced: 0,     // count
  npcSheetsEnhanced: 0,           // count
  itemSheetsEnhanced: 0,          // count
  canvasEnhancements: 0,          // count
  combatTrackerRenders: 0,        // count
  chatMessagesStyled: 0,          // count
  compendiumFilters: 0,           // count
  settingsRegistered: 0,          // count (3)
  socketMessages: 0,              // count
  errors: []                      // Array
}
```

---

## 🔧 Event Emitters Target

```javascript
// 5 eventi custom
logger.events.emit('v13:initialized', { version, foundryVersion, dnd5eVersion })
logger.events.emit('v13:sheet-enhanced', { type, actorId, time })
logger.events.emit('v13:canvas-ready', { sceneId, tavern })
logger.events.emit('v13:combat-tracker-ready', { combatId })
logger.events.emit('v13:settings-registered', { count: 3 })
```

---

## ✅ Conclusione

**Raccomandazione**: **Opzione A - Refactoring Completo**

**Motivi**:
1. Modulo relativamente piccolo (422 linee)
2. Funzionalità core (Foundry v13 API wrapper)
3. 26 console.log da rimuovere
4. Nessun error handling (critico!)
5. 9 hooks = performance tracking essenziale

**Benefici**:
- ✅ Enterprise-grade logging
- ✅ Observable (events + stats)
- ✅ Robusto (error handling)
- ✅ Testabile (public API)
- ✅ Documentato (JSDoc 100%)
- ✅ Performante (tracking)

**Procediamo?** 🚀

