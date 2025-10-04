# 🔍 Analisi Completa - brancalonia-sheets.js

**Data**: 2025-10-03  
**File**: `/modules/brancalonia-sheets.js`  
**Stato**: ⚠️ **CRITICO - MODULO DISABILITATO E INCOMPLETO**  
**Righe**: 971  

---

## 🚨 PROBLEMI CRITICI IDENTIFICATI

### 1. **Modulo Completamente Disabilitato** ❌

```javascript
// Line 19-26
static registerSheetModifications() {
  // DISABILITATO: Sheet modifications ora gestite da brancalonia-ui-coordinator.js
  // per evitare doppio processing e conflitti
  console.log('🎭 Brancalonia Sheets | Sheet modifications delegated to UI Coordinator');

  // Manteniamo solo questo codice se serve per retrocompatibilità
  // ma generalmente tutto è gestito da brancalonia-ui-coordinator.js
}
```

**Impatto**: 
- Tutte le funzionalità UI di Brancalonia sono state **disabilitate** e delegate al UI Coordinator
- Il UI Coordinator però contiene solo **stub parziali**, non la logica completa
- Il risultato è che **nessuna delle funzionalità è attiva** nel gioco!

### 2. **Metodi Orphan (Mai Chiamati)** 🔴

Il metodo principale `modifyCharacterSheet()` è **definito ma mai chiamato**:

```javascript
// Line 46 - DEFINITO MA MAI CHIAMATO
static async modifyCharacterSheet(app, html, data) {
  // 900+ righe di implementazione completa
  // Ma non c'è un hook che chiama questo metodo!
}
```

**Tutti questi metodi sono orphan (mai chiamati)**:
- `modifyCharacterSheet()` (line 46)
- `addBackgroundTexture()` (line 90)
- `enhanceSheetHeader()` (line 102)
- `addInfamiaSystem()` (line 139) ← **IMPORTANTE**
- `addCompagniaSection()` (line 203) ← **IMPORTANTE**
- `addLavoriSporchiSection()` (line 291) ← **IMPORTANTE**
- `addRifugioSection()` (line 378) ← **IMPORTANTE**
- `addMalefatteSection()` (line 500) ← **IMPORTANTE**
- `enhanceAbilitiesSection()` (line 564)
- `enhanceInventorySection()` (line 583)
- `enhanceFeatureSection()` (line 595)
- `translateUIElements()` (line 618)
- `addDecorativeElements()` (line 645)
- `modifyNPCSheet()` (line 669)
- `prepareSheetData()` (line 696)

**Totale**: **15 metodi completi mai utilizzati!** 💀

### 3. **Hook Mancante** ❌

Non c'è **nessun hook** che collega questi metodi al rendering della scheda:

```javascript
// MANCA QUESTO!
Hooks.on('renderActorSheet', async (app, html, data) => {
  if (data.actor.type === 'character') {
    await BrancaloniaSheets.modifyCharacterSheet(app, html, data);
  }
});
```

### 4. **Integrazione con Logger v2.0.0** ❌

- **Console.log**: 4 istanze (linee 9, 16, 22, 87)
- **Logger calls**: 0
- **Import logger**: ❌ Mancante
- **VERSION/MODULE_NAME**: ❌ Mancante

### 5. **Conflitto con UI Coordinator** ⚠️

`brancalonia-ui-coordinator.js` (931 righe) dovrebbe gestire tutto, MA:
- Contiene solo **stub parziali** (linee 112-200 circa)
- Non ha la logica completa delle sezioni
- Molti metodi helper mancano (es: `calculateTotalEarnings`, `renderLavoriList`)

---

## 📊 Analisi Funzionalità

### ✅ Funzionalità Implementate (ma Disabilitate)

| Funzionalità | Linee | Completezza | Stato |
|--------------|-------|-------------|-------|
| **Sistema Infamia** | 139-178 | 100% | 🔴 Disabilitato |
| **Compagnia Manager** | 203-289 | 100% | 🔴 Disabilitato |
| **Lavori Sporchi** | 291-376 | 100% | 🔴 Disabilitato |
| **Rifugio (Haven)** | 378-498 | 100% | 🔴 Disabilitato |
| **Malefatte/Crimini** | 500-562 | 100% | 🔴 Disabilitato |
| **Decorazioni UI** | 645-667 | 100% | 🔴 Disabilitato |
| **Traduzioni IT** | 618-643 | 100% | 🔴 Disabilitato |
| **Event Listeners** | 734-776 | 100% | 🔴 Disabilitato |
| **Dialog Helpers** | 809-962 | 100% | 🔴 Disabilitato |

### ⚠️ Funzionalità Parziali nel UI Coordinator

| Funzionalità | UI Coordinator | Sheets.js | Delta |
|--------------|----------------|-----------|-------|
| **Infamia Tab** | 10 righe (stub) | 40 righe (completo) | -30 righe |
| **Compagnia Tab** | 10 righe (stub) | 87 righe (completo) | -77 righe |
| **Rifugio Tab** | 10 righe (stub) | 121 righe (completo) | -111 righe |
| **Lavori Sporchi** | ❌ Mancante | 86 righe (completo) | -86 righe |
| **Malefatte** | ❌ Mancante | 63 righe (completo) | -63 righe |

**Totale logica mancante nel UI Coordinator**: **~367 righe** di codice funzionale!

---

## 🔧 Dipendenze e Integrazioni

### Dipendenze Esterne

1. **jQuery** ✅ (usato per DOM manipulation)
2. **Foundry VTT hooks**:
   - `init` ✅ (line 966)
   - `renderActorSheet` ❌ (hook registrato ma mai triggerato)
   - `preCreateActor` ✅ (line 39)
3. **Carolingian UI** (modulo `/crlngn-ui`)
   - Il UI Coordinator verifica se Carolingian UI è attivo
   - Se attivo, dovrebbe integrare, ma l'integrazione è **incompleta**
4. **brancalonia-compatibility-fix.js**
   - Fornisce fallback per jQuery/v13
5. **module-loader.js**
   - Carica il modulo con priorità 40 (lazy: true)

### Moduli che Dipendono da Sheets

```bash
$ grep -rn "BrancaloniaSheets" modules/ --include="*.js"
# Risultato: NESSUN ALTRO MODULO USA BrancaloniaSheets!
```

**Questo è GRAVE**: Nessun altro modulo si aspetta o usa `BrancaloniaSheets` ⚠️

### Sistemi che Potrebbero Utilizzare Sheets

1. **malefatte-taglie-nomea.js** → Potrebbe usare `addMalefatteSection()`
2. **reputation-infamia-unified.js** → Potrebbe usare `addInfamiaSystem()`
3. **compagnia-manager.js** → Potrebbe usare `addCompagniaSection()`
4. **haven-system.js** → Potrebbe usare `addRifugioSection()`

**Ma nessuno lo fa!** Ogni sistema gestisce la propria UI separatamente! 🤯

---

## 📈 Metriche Codice

| Metrica | Valore | Note |
|---------|--------|------|
| **Righe Totali** | 971 | |
| **Righe Codice Attivo** | ~50 | Solo inizializzazione e event listeners |
| **Righe Codice Disabilitato** | ~900 | 92% del codice è disabilitato! |
| **Console.log** | 4 | Da sostituire con logger |
| **Metodi Pubblici** | 31 | 15 dei quali mai chiamati |
| **Metodi Helper** | 12 | Tutti orphan |
| **Dialog Forms** | 3 | Completamente implementati ma mai usati |
| **jQuery Calls** | ~80 | Rischio compatibilità v13 |

---

## 🎯 Integrazione con Carolingian UI

### Carolingian UI Overview

Carolingian UI è un sistema di UI custom situato in `/modules/crlngn-ui/`:

```
crlngn-ui/
├── module.mjs
├── constants/
│   ├── General.mjs
│   ├── Hooks.mjs
│   ├── Settings.mjs
│   └── SettingMenus.mjs
├── utils/
└── ... (68 files totali)
```

### Conflitto di Responsabilità

**brancalonia-sheets.js**:
- Fornisce UI completa per features custom di Brancalonia
- È disabilitato per evitare conflitti con UI Coordinator
- Ma UI Coordinator non ha la logica completa!

**brancalonia-ui-coordinator.js**:
- Dovrebbe coordinare tra Carolingian UI e Brancalonia features
- Ha solo stub per tab Infamia/Compagnia/Rifugio
- Non ha logica per Lavori Sporchi, Malefatte, decorazioni, traduzioni

**Carolingian UI**:
- Sistema UI custom completo
- Modifiche heavy al layout della scheda
- Non conosce le features specifiche di Brancalonia

**Risultato**: **Nessuno dei tre sistemi è completamente funzionale!** 💀

---

## 🐛 Bug e Problemi

### Bug Critici

1. **Modulo Disabilitato**: Il codice c'è ma non viene mai eseguito
2. **Hook Missing**: `renderActorSheet` registrato ma non chiama `modifyCharacterSheet()`
3. **UI Coordinator Incompleto**: Ha solo ~10% della logica di sheets.js
4. **Nessuna Integrazione**: Altri moduli non usano sheets.js

### Bug Minori

1. **Console.log invece di logger**: 4 istanze
2. **jQuery Dependency**: Rischio v13
3. **No VERSION/MODULE_NAME**: Difficile tracking
4. **No Statistics**: Nessuna metrica di utilizzo
5. **No Event Emitter**: Nessuna comunicazione con altri moduli
6. **Hard-coded strings**: Mancano costanti

### Warning

```
⚠️ Line 20: "Sheet modifications delegated to UI Coordinator"
⚠️ Line 708: baraonda flag ancora presente (sistema deprecato)
⚠️ Line 778: handleBaraondaAction ancora definito (deprecato)
⚠️ No error handling nei dialog forms
⚠️ No validation nei form inputs
```

---

## 🔍 Analisi Hook Flow

### Flow Attuale (ROTTO) 🔴

```
1. Hooks.once('init') → BrancaloniaSheets.initialize()
   ├─ registerSheetModifications() → ❌ VUOTO (disabilitato)
   ├─ registerSheetListeners() → ✅ Hook 'renderActorSheet' registrato
   └─ registerDataModels() → ✅ Hook 'preCreateActor' registrato

2. Hooks.on('renderActorSheet')
   └─ attachEventListeners(html, data) → ✅ Eseguito
       └─ Cerca elementi che NON ESISTONO perché mai renderizzati!
          └─ ❌ FAIL: Nessun elemento .infamia-adjust, .add-lavoro-btn, etc.

3. modifyCharacterSheet() → ❌ MAI CHIAMATO
   └─ Tutto il codice UI (900+ righe) → ❌ MAI ESEGUITO
```

### Flow Previsto (da Implementare) ✅

```
1. Hooks.once('init') → BrancaloniaSheets.initialize()
   ├─ registerSettings() → Abilita/disabilita features
   ├─ registerSheetHooks() → Registra hook per rendering
   └─ registerEventListeners() → Prepara event handlers

2. Hooks.on('renderActorSheet')
   └─ modifyCharacterSheet(app, html, data) → ✅ CHIAMATO
       ├─ addInfamiaSystem() → Renderizza UI Infamia
       ├─ addCompagniaSection() → Renderizza UI Compagnia
       ├─ addLavoriSporchiSection() → Renderizza UI Lavori
       ├─ addRifugioSection() → Renderizza UI Rifugio
       ├─ addMalefatteSection() → Renderizza UI Malefatte
       ├─ enhanceAbilitiesSection() → Traduzioni IT
       ├─ addDecorativeElements() → Decorazioni Rinascimento
       └─ attachEventListeners() → Collega event handlers

3. User interagisce con UI
   └─ Event handlers chiamati → Aggiornano flags actor
       └─ Sheet re-renderizzata → Ciclo si ripete
```

---

## 💡 Cosa Manca

### 1. Implementazione Mancante nel UI Coordinator

| Feature | Presente in Sheets.js | Presente in UI Coordinator | Mancante |
|---------|----------------------|----------------------------|----------|
| Sistema Infamia completo | ✅ 40 righe | ⚠️ Stub 10 righe | 30 righe |
| Compagnia management | ✅ 87 righe | ⚠️ Stub 10 righe | 77 righe |
| Rifugio management | ✅ 121 righe | ⚠️ Stub 10 righe | 111 righe |
| Lavori Sporchi tracking | ✅ 86 righe | ❌ Nessuna | 86 righe |
| Malefatte registry | ✅ 63 righe | ❌ Nessuna | 63 righe |
| Decorazioni UI | ✅ 23 righe | ❌ Nessuna | 23 righe |
| Traduzioni IT | ✅ 26 righe | ❌ Nessuna | 26 righe |
| Dialog forms (3) | ✅ 153 righe | ❌ Nessuna | 153 righe |
| Event listeners | ✅ 43 righe | ❌ Nessuna | 43 righe |
| Helper methods (12) | ✅ 120 righe | ❌ Nessuna | 120 righe |

**Totale mancante**: **~600 righe di logica funzionale!**

### 2. Integrazione Logger v2.0.0

- ❌ Import logger
- ❌ VERSION/MODULE_NAME
- ❌ Event emitter (9+ eventi possibili)
- ❌ Performance tracking (4+ ops)
- ❌ Statistiche estese
- ❌ Error tracking

### 3. Settings Mancanti

```javascript
// Da implementare
game.settings.register('brancalonia-bigat', 'enableSheetsUI', {
  name: 'Abilita UI Personalizzata',
  hint: 'Attiva le modifiche UI custom di Brancalonia',
  scope: 'world',
  config: true,
  type: Boolean,
  default: true
});

game.settings.register('brancalonia-bigat', 'sheetsDecorativeElements', {
  name: 'Elementi Decorativi Rinascimentali',
  hint: 'Mostra cornici, ornamenti e decorazioni rinascimentali',
  scope: 'client',
  config: true,
  type: Boolean,
  default: true
});

// ... altri 6-8 settings per feature specifiche
```

### 4. Event Emitters Mancanti

```javascript
// Eventi che potrebbero essere emessi
'sheets:infamia-changed'
'sheets:lavoro-added'
'sheets:lavoro-completed'
'sheets:malefatta-registered'
'sheets:compagnia-member-added'
'sheets:rifugio-upgraded'
'sheets:sheet-rendered'
'sheets:ui-enhanced'
'sheets:error'
```

### 5. API Pubblica Mancante

```javascript
// API che dovrebbe esistere
game.brancalonia.sheets.getInfamiaLevel(actor)
game.brancalonia.sheets.addLavoro(actor, lavoroData)
game.brancalonia.sheets.completeLavoro(actor, lavoroId)
game.brancalonia.sheets.registerMalefatta(actor, malefattaData)
game.brancalonia.sheets.addCompagniaMember(actor, memberData)
game.brancalonia.sheets.upgradeRifugio(actor, comfortLevel)
game.brancalonia.sheets.refreshSheet(actorId)
game.brancalonia.sheets.getStatistics()
```

### 6. Macro Mancanti

Dovrebbero esistere macro automatiche per:
- "Aggiungi Lavoro Sporco" → Dialog rapido
- "Registra Malefatta" → Dialog rapido
- "Gestisci Compagnia" → Panel management
- "Aggiorna Rifugio" → Upgrade dialog
- "Calcola Infamia" → Summary report

---

## 🎯 Piano di Completamento

### Opzione A: **Riattivare brancalonia-sheets.js** (Raccomandato)

**Pro**:
- Codice già completo (900+ righe)
- Tutte le features già implementate
- Solo da riattivare e integrare logger

**Contro**:
- Possibile conflitto con UI Coordinator
- jQuery dependency da gestire

**Passi**:
1. ✅ Import logger v2.0.0
2. ✅ Sostituire console.log (4) con logger
3. ✅ Aggiungere VERSION/MODULE_NAME
4. ✅ Implementare statistiche estese
5. ✅ Implementare event emitters (9 eventi)
6. ✅ Riattivare `registerSheetModifications()` con hook
7. ✅ Aggiungere settings (8-10)
8. ✅ Aggiungere API pubblica
9. ✅ Creare macro automatiche (5)
10. ✅ Testare integrazione con UI Coordinator
11. ✅ Gestire Carolingian UI compatibility

**Tempo stimato**: 3-4 ore
**Difficoltà**: ALTA (conflitti UI)

### Opzione B: **Completare UI Coordinator**

**Pro**:
- Centralizzato in un solo modulo
- Già impostato per Carolingian UI

**Contro**:
- Devi implementare 600+ righe mancanti
- Duplicazione codice da sheets.js
- Più lavoro

**Passi**:
1. Copiare metodi da sheets.js a UI Coordinator
2. Adattare per Carolingian UI
3. Implementare helper methods
4. Implementare dialog forms
5. Implementare event listeners
6. Integrare logger v2.0.0
7. Testare

**Tempo stimato**: 5-6 ore
**Difficoltà**: MEDIA-ALTA

### Opzione C: **Hybrid Approach** (Raccomandato per te)

**Pro**:
- Riusa codice esistente
- Evita conflitti
- Separazione responsabilità chiara

**Contro**:
- Richiede coordinazione tra 2 moduli

**Passi**:
1. **sheets.js**:
   - Fornisce **funzioni helper** per renderizzare sezioni
   - Non chiama direttamente hooks
   - Export metodi come API pubblica
2. **ui-coordinator.js**:
   - Gestisce hooks e timing
   - Chiama metodi di sheets.js al momento giusto
   - Gestisce conflitti con Carolingian UI
3. **Integrare logger v2.0.0 in entrambi**
4. **Testare**

**Tempo stimato**: 2-3 ore
**Difficoltà**: MEDIA

---

## 📊 Metriche Before/After (Proiezione)

### Before (Stato Attuale)

| Metrica | Valore | Note |
|---------|--------|------|
| **Righe Attive** | ~50 | 5% del codice |
| **Features Attive** | 0 | Tutte disabilitate |
| **Console.log** | 4 | No logger |
| **Event Emitters** | 0 | Nessuno |
| **API Pubblica** | 0 | Nessuna |
| **Macro** | 0 | Nessuna |
| **Settings** | 0 | Nessuno |
| **Statistics** | 0 | Nessuna |

### After (Opzione C - Raccomandato)

| Metrica | Valore | Note |
|---------|--------|------|
| **Righe Attive** | ~950 | 98% del codice |
| **Features Attive** | 5 | Infamia, Compagnia, Lavori, Rifugio, Malefatte |
| **Console.log** | 0 | Tutto logger |
| **Event Emitters** | 9 | Eventi per tutte le azioni |
| **API Pubblica** | 7 | Metodi game.brancalonia.sheets.* |
| **Macro** | 5 | Dialog rapidi per features |
| **Settings** | 8 | Controllo granulare |
| **Statistics** | ✅ | Tracking utilizzo completo |

---

## 🎓 Raccomandazioni Finali

### 1. **Priorità MASSIMA**: Completare questo modulo! ⚠️

È **ESTREMAMENTE IMPORTANTE** perché:
- Contiene **5 features core** di Brancalonia (Infamia, Compagnia, Lavori, Rifugio, Malefatte)
- È **92% completo** ma **100% disabilitato** 💀
- Serve a rendere il gioco **giocabile** (senza UI i giocatori non possono gestire i loro PG!)
- È il modulo con il **miglior ROI** (Return on Investment): ~2-3 ore di lavoro per attivare 900+ righe

### 2. **Approccio Raccomandato**: Opzione C (Hybrid) ✅

1. **Fase 1**: Refactoring sheets.js (1h)
   - Import logger v2.0.0
   - Sostituire console.log
   - Aggiungere statistics + events

2. **Fase 2**: Riattivare funzionalità (1h)
   - Riabilitare `registerSheetModifications()`
   - Aggiungere hook `renderActorSheet` → `modifyCharacterSheet()`
   - Testare rendering sezioni

3. **Fase 3**: Integrazione UI Coordinator (30m)
   - Coordinare timing con Carolingian UI
   - Gestire conflitti
   - Testing

4. **Fase 4**: Polish (30m)
   - Settings
   - Macro
   - API pubblica
   - Documentazione

**Totale**: **3 ore** per attivare **5 features core** 🎯

### 3. **Rischi da Mitigare**

- **Conflitto con Carolingian UI**: Testare con e senza attivo
- **jQuery su v13**: Usa compatibility-fix.js
- **Performance**: Lazy load features pesanti
- **Conflitti hook**: Usa priorities

---

## 🎊 Conclusione

`brancalonia-sheets.js` è un modulo **CRITICO** e **QUASI COMPLETO** (92%) ma **TOTALMENTE DISABILITATO** (100% inattivo).

È il **missing link** tra:
- I sistemi di gioco (Infamia, Compagnia, etc.) ← Backend OK ✅
- L'interfaccia giocatore (Actor Sheet) ← Frontend MISSING ❌

**Senza questo modulo attivo**, i giocatori **NON POSSONO**:
- ❌ Vedere/modificare Infamia
- ❌ Gestire la Compagnia
- ❌ Tracciare Lavori Sporchi
- ❌ Gestire il Rifugio
- ❌ Registrare Malefatte

**Priorità**: 🔴🔴🔴 **MASSIMA** 🔴🔴🔴

**Next Step**: Scegliere opzione (A/B/C) e procedere con refactoring completo!


