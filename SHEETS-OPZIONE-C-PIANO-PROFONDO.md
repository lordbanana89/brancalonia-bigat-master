# 🎯 Piano Profondo - Opzione C (Hybrid) - brancalonia-sheets.js v2.0.0

**Data**: 2025-10-03  
**Approccio**: Hybrid (Carolingian UI + Brancalonia Sheets)  
**Tempo Stimato**: 2-3 ore  
**ROI**: ⭐⭐⭐⭐⭐ MASSIMO  
**Rischio**: 🟢 BASSO (separazione responsabilità chiara)

---

## 📋 Executive Summary

### Obiettivo
Riattivare `brancalonia-sheets.js` integrando Logger v2.0.0 e coordinando con Carolingian UI senza conflitti.

### Strategia
1. **Carolingian UI** (SheetsUtil.mjs) → Continua a gestire theme/styling
2. **Brancalonia Sheets** → Gestisce contenuto Brancalonia (5 features)
3. **UI Coordinator** → Orchestrazione timing (opzionale)

### Risultato Atteso
- ✅ 5 Features core attivate (Infamia, Compagnia, Lavori, Rifugio, Malefatte)
- ✅ Logger v2.0.0 integrato (43+ chiamate)
- ✅ 9 Event emitters implementati
- ✅ 8 Settings configurabili
- ✅ 5 Macro automatiche
- ✅ API pubblica completa
- ✅ Zero conflitti con Carolingian UI

---

## 🔍 FASE 0: Analisi Approfondita (PRE-PLANNING)

### 0.1 Inventario Codice Esistente

| Componente | Linee | Status | Completezza | Note |
|------------|-------|--------|-------------|------|
| `initialize()` | 8-17 | ✅ Attivo | 50% | Chiama metodi disabilitati |
| `registerSheetModifications()` | 19-26 | 🔴 Disabilitato | 0% | Solo commento |
| `registerSheetListeners()` | 28-35 | ⚠️ Parziale | 30% | Hook registrato ma inutile |
| `registerDataModels()` | 37-44 | ✅ Attivo | 100% | `preCreateActor` OK |
| `modifyCharacterSheet()` | 46-88 | 🔴 Mai chiamato | 100% | **CORE** - Da attivare |
| `addBackgroundTexture()` | 90-100 | 🔴 Orphan | 100% | Funziona ma mai chiamato |
| `enhanceSheetHeader()` | 102-137 | 🔴 Orphan | 100% | Funziona ma mai chiamato |
| `addInfamiaSystem()` | 139-178 | 🔴 Orphan | 100% | **CRITICO** |
| `addCompagniaSection()` | 203-264 | 🔴 Orphan | 100% | **CRITICO** |
| `addLavoriSporchiSection()` | 291-336 | 🔴 Orphan | 100% | **CRITICO** |
| `addRifugioSection()` | 378-445 | 🔴 Orphan | 100% | **CRITICO** |
| `addMalefatteSection()` | 500-533 | 🔴 Orphan | 100% | **CRITICO** |
| `enhanceAbilitiesSection()` | 564-581 | 🔴 Orphan | 100% | i18n |
| `enhanceInventorySection()` | 583-593 | 🔴 Orphan | 100% | Shoddy equipment |
| `enhanceFeatureSection()` | 595-616 | 🔴 Orphan | 80% | Parziale |
| `translateUIElements()` | 618-643 | 🔴 Orphan | 100% | i18n |
| `addDecorativeElements()` | 645-667 | 🔴 Orphan | 100% | Decorazioni |
| `modifyNPCSheet()` | 669-694 | 🔴 Orphan | 100% | NPC sheets |
| `prepareSheetData()` | 696-712 | 🔴 Orphan | 100% | Pre-processing |
| `initializeBrancaloniaData()` | 714-724 | ✅ Attivo | 100% | `preCreateActor` |
| `calculateInfamiaLevel()` | 726-732 | 🔴 Orphan | 100% | Helper |
| `attachEventListeners()` | 734-776 | ⚠️ Parziale | 50% | Cerca elementi inesistenti |
| `handleBaraondaAction()` | 778-807 | 🔴 Orphan | 100% | **DEPRECATO** |
| `openLavoroDialog()` | 809-857 | 🔴 Orphan | 100% | Form Lavoro |
| `openAddMemberDialog()` | 859-905 | 🔴 Orphan | 100% | Form Compagnia |
| `openMalefattaDialog()` | 907-962 | 🔴 Orphan | 100% | Form Malefatta |
| Helper methods (12) | Various | 🔴 Orphan | 100% | Tutti funzionanti |

**Totale Metodi**: 31  
**Attivi**: 2 (6%)  
**Orphan/Disabilitati**: 29 (94%)  
**Da Riattivare**: 25 (80%)

### 0.2 Analisi Flags & Data

**Flags letti/scritti** (71 occorrenze totali):

| Flag | Letture | Scritture | Metodi Coinvolti |
|------|---------|-----------|------------------|
| `flags.brancalonia-bigat.initialized` | 1 | 1 | `prepareSheetData`, `initializeBrancaloniaData` |
| `flags.brancalonia-bigat.infamia` | 12 | 4 | `addInfamiaSystem`, `attachEventListeners`, `openMalefattaDialog` |
| `flags.brancalonia-bigat.infamiaMax` | 4 | 1 | `addInfamiaSystem`, `attachEventListeners` |
| `flags.brancalonia-bigat.baraonda` | 6 | 3 | `prepareSheetData`, `handleBaraondaAction` (deprecato) |
| `flags.brancalonia-bigat.compagnia` | 8 | 2 | `addCompagniaSection`, `openAddMemberDialog` |
| `flags.brancalonia-bigat.rifugio` | 8 | 1 | `addRifugioSection`, `prepareSheetData` |
| `flags.brancalonia-bigat.lavoriSporchi` | 8 | 2 | `addLavoriSporchiSection`, `attachEventListeners`, `openLavoroDialog` |
| `flags.brancalonia-bigat.malefatte` | 8 | 2 | `addMalefatteSection`, `openMalefattaDialog` |
| `flags.brancalonia-bigat.soprannome` | 1 | 0 | `enhanceSheetHeader` (input) |
| `flags.brancalonia-bigat.titolo` | 1 | 0 | `enhanceSheetHeader` (input) |
| `flags.brancalonia-bigat.shoddy` | 1 | 0 | `enhanceInventorySection` |
| `flags.brancalonia-bigat.faction` | 1 | 0 | `modifyNPCSheet` |

**Totale**: 71 accessi a 12 flags diversi

### 0.3 Analisi Dipendenze

**Dipendenze Esterne**:

| Dipendenza | Utilizzo | Criticità | Fallback |
|------------|----------|-----------|----------|
| **jQuery** | 80+ chiamate | 🔴 Alta | `brancalonia-compatibility-fix.js` |
| **Foundry Hooks** | 3 hooks | 🔴 Alta | Nessuno (core) |
| **Dialog API** | 3 dialog forms | 🟡 Media | Prompt alternativo |
| **ChatMessage API** | 3 chiamate | 🟡 Media | Nessuno (core) |
| **Carolingian UI** | Coordinazione | 🟢 Bassa | Funziona senza |
| **ui.notifications** | 2+ chiamate | 🟢 Bassa | console.log fallback |

**Dipendenze Interne** (da altri moduli Brancalonia):

| Modulo | Utilizzo | Note |
|--------|----------|------|
| `brancalonia-logger.js` | ❌ Mancante | **DA IMPLEMENTARE** |
| `brancalonia-compatibility-fix.js` | ✅ Implicito | jQuery fallback |
| `brancalonia-ui-coordinator.js` | ⚠️ Opzionale | Coordinazione timing |
| `haven-system.js` | ⚠️ Possibile | Flag `rifugio` condiviso |
| `malefatte-taglie-nomea.js` | ⚠️ Possibile | Flag `malefatte` condiviso |
| `reputation-infamia-unified.js` | ⚠️ Possibile | Flag `infamia` condiviso |
| `compagnia-manager.js` | ⚠️ Possibile | Flag `compagnia` condiviso |
| `shoddy-equipment.js` | ✅ Integrato | Flag `shoddy` letto |

### 0.4 Analisi Console.log

**Totale**: 4 occorrenze

| Linea | Tipo | Messaggio | Priorità Sostituzione |
|-------|------|-----------|----------------------|
| 9 | `console.log` | "Initializing character sheet modifications" | 🔴 Alta |
| 16 | `console.log` | "Character sheet modifications applied" | 🔴 Alta |
| 22 | `console.log` | "Sheet modifications delegated to UI Coordinator" | 🔴 Alta |
| 87 | `console.log` | "Character sheet enhanced with Brancalonia modifications" | 🔴 Alta |

**Totale da sostituire**: 4 → `logger.info()` / `logger.debug()`

### 0.5 Analisi Event Emitters Potenziali

| Evento | Trigger | Payload Previsto | Priorità |
|--------|---------|------------------|----------|
| `sheets:initialized` | `initialize()` | `{version, initTime}` | 🔴 Alta |
| `sheets:sheet-rendered` | `modifyCharacterSheet()` | `{actorId, features}` | 🔴 Alta |
| `sheets:infamia-changed` | `attachEventListeners()` | `{actorId, old, new}` | 🟡 Media |
| `sheets:lavoro-added` | `openLavoroDialog()` | `{actorId, lavoro}` | 🟡 Media |
| `sheets:lavoro-completed` | `attachEventListeners()` | `{actorId, lavoroId}` | 🟡 Media |
| `sheets:malefatta-registered` | `openMalefattaDialog()` | `{actorId, malefatta}` | 🟡 Media |
| `sheets:compagnia-member-added` | `openAddMemberDialog()` | `{actorId, member}` | 🟡 Media |
| `sheets:rifugio-changed` | Form changes | `{actorId, rifugio}` | 🟢 Bassa |
| `sheets:error` | Tutti i try/catch | `{error, context}` | 🔴 Alta |

**Totale**: 9 eventi

### 0.6 Analisi Performance Operations

| Operazione | Metodo | Tempo Stimato | Priorità Tracking |
|------------|--------|---------------|-------------------|
| `sheets-init` | `initialize()` | < 10ms | 🔴 Alta |
| `sheets-render` | `modifyCharacterSheet()` | 50-150ms | 🔴 Alta |
| `sheets-add-infamia` | `addInfamiaSystem()` | 10-30ms | 🟡 Media |
| `sheets-add-compagnia` | `addCompagniaSection()` | 10-30ms | 🟡 Media |
| `sheets-add-lavori` | `addLavoriSporchiSection()` | 10-30ms | 🟡 Media |
| `sheets-add-rifugio` | `addRifugioSection()` | 10-30ms | 🟡 Media |
| `sheets-add-malefatte` | `addMalefatteSection()` | 10-30ms | 🟡 Media |
| `sheets-attach-listeners` | `attachEventListeners()` | 5-15ms | 🟢 Bassa |

**Totale**: 8 operazioni

### 0.7 Settings da Implementare

| Setting | Scope | Type | Default | Descrizione |
|---------|-------|------|---------|-------------|
| `enableBrancaloniaSheets` | world | Boolean | true | Abilita modifiche UI Brancalonia |
| `sheetsShowInfamia` | world | Boolean | true | Mostra sezione Infamia |
| `sheetsShowCompagnia` | world | Boolean | true | Mostra sezione Compagnia |
| `sheetsShowLavori` | world | Boolean | true | Mostra sezione Lavori Sporchi |
| `sheetsShowRifugio` | world | Boolean | true | Mostra sezione Rifugio |
| `sheetsShowMalefatte` | world | Boolean | true | Mostra sezione Malefatte |
| `sheetsDecorativeElements` | client | Boolean | true | Mostra elementi decorativi |
| `sheetsItalianTranslations` | client | Boolean | true | Usa traduzioni italiane |
| `sheetsDelayAfterCarolingian` | world | Number | 100 | Delay (ms) dopo Carolingian UI |
| `debugBrancaloniaSheets` | client | Boolean | false | Debug logging |

**Totale**: 10 settings

### 0.8 Macro da Creare

| Macro | Tipo | Funzione | Icona |
|-------|------|----------|-------|
| "📝 Aggiungi Lavoro Sporco" | script | `openLavoroDialog()` | 💰 |
| "⚖️ Registra Malefatta" | script | `openMalefattaDialog()` | 🗡️ |
| "👥 Aggiungi Membro Compagnia" | script | `openAddMemberDialog()` | ⚔️ |
| "🏠 Gestisci Rifugio" | script | Dialog rifugio | 🏰 |
| "🗡️ Modifica Infamia" | script | Dialog infamia | 💀 |

**Totale**: 5 macro

### 0.9 API Pubblica da Implementare

```javascript
game.brancalonia.sheets = {
  // Core
  getInfamiaLevel(actor): string,
  calculateInfamiaLevel(actor): string,
  
  // Lavori Sporchi
  addLavoro(actor, lavoroData): Promise<void>,
  completeLavoro(actor, lavoroId): Promise<void>,
  getLavoriInCorso(actor): Array,
  getLavoriCompletati(actor): Array,
  getTotalEarnings(actor): number,
  
  // Malefatte
  registerMalefatta(actor, malefattaData): Promise<void>,
  getMalefatte(actor): Array,
  
  // Compagnia
  addCompagniaMember(actor, memberData): Promise<void>,
  removeCompagniaMember(actor, memberId): Promise<void>,
  getCompagnia(actor): Object,
  
  // Rifugio
  upgradeRifugio(actor, comfortLevel): Promise<void>,
  addRifugioFeature(actor, featureId): Promise<void>,
  getRifugio(actor): Object,
  
  // Utility
  refreshSheet(actorId): Promise<void>,
  isSheetEnhanced(actorId): boolean,
  
  // Statistics
  getStatistics(): Object,
  resetStatistics(): void
};
```

**Totale**: 20 metodi API

---

## 🎯 FASE 1: Refactoring con Logger v2.0.0 (60 min)

### 1.1 Import e Setup Base (10 min)

**File**: `brancalonia-sheets.js` (linee 1-17)

**Modifiche**:

```javascript
/**
 * BRANCALONIA CHARACTER SHEET MODIFICATIONS v2.0.0
 * Advanced character sheet customization for Italian Renaissance gameplay
 * Integrates Brancalonia-specific mechanics with D&D 5e system
 * 
 * Features:
 * - Sistema Infamia (reputation tracking)
 * - Compagnia Manager (party management)
 * - Lavori Sporchi (dirty jobs tracking)
 * - Rifugio/Haven (hideout management)
 * - Malefatte (crime registry)
 * - Event emitters (9 eventi)
 * - Performance tracking (8 ops)
 * - Statistiche estese
 * - API pubblica completa
 */

import logger from './brancalonia-logger.js';

class BrancaloniaSheets {
  static VERSION = '2.0.0';
  static MODULE_NAME = 'Sheets';
  
  static statistics = {
    totalRenders: 0,
    sectionsByType: {
      infamia: 0,
      compagnia: 0,
      lavori: 0,
      rifugio: 0,
      malefatte: 0
    },
    lavoriAdded: 0,
    lavoriCompleted: 0,
    malefatteRegistered: 0,
    compagniaMembersAdded: 0,
    rifugioUpgrades: 0,
    avgRenderTime: 0,
    lastRenderTime: 0,
    initTime: 0,
    errors: []
  };
  
  static eventHistory = [];
  static MAX_HISTORY = 50;

  static initialize() {
    try {
      logger.startPerformance('sheets-init');
      logger.info(this.MODULE_NAME, 'Inizializzazione modifiche sheet personaggi...');

      // Registra settings
      this._registerSettings();

      // Register sheet modifications
      this.registerSheetModifications();
      this.registerSheetListeners();
      this.registerDataModels();

      const initTime = logger.endPerformance('sheets-init');
      this.statistics.initTime = initTime;

      logger.info(this.MODULE_NAME, `Sistema inizializzato in ${initTime?.toFixed(2)}ms`, {
        features: ['infamia', 'compagnia', 'lavori', 'rifugio', 'malefatte'],
        carolingianUI: !!window.brancaloniaSettings?.SheetsUtil
      });

      // Emit event
      logger.events.emit('sheets:initialized', {
        version: this.VERSION,
        initTime,
        carolingianUIActive: !!window.brancaloniaSettings?.SheetsUtil,
        timestamp: Date.now()
      });

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore durante inizializzazione', error);
      this.statistics.errors.push({
        type: 'initialization',
        message: error.message,
        timestamp: Date.now()
      });
    }
  }
```

**Checklist**:
- ✅ Import logger
- ✅ VERSION/MODULE_NAME
- ✅ Statistics object
- ✅ Event history
- ✅ logger.startPerformance
- ✅ logger.endPerformance
- ✅ logger.events.emit
- ✅ Error tracking

### 1.2 Settings Registration (10 min)

**Nuovo metodo da aggiungere** (dopo `initialize()`):

```javascript
static _registerSettings() {
  try {
    // Master switch
    game.settings.register('brancalonia-bigat', 'enableBrancaloniaSheets', {
      name: 'Abilita UI Personalizzata Brancalonia',
      hint: 'Attiva le modifiche UI custom per le schede personaggio',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
      onChange: value => {
        logger.info(this.MODULE_NAME, `Sheets UI: ${value ? 'abilitata' : 'disabilitata'}`);
        if (value) {
          ui.notifications.info('Ricarica la pagina per applicare le modifiche UI');
        }
      }
    });

    // Feature toggles
    const features = [
      { key: 'sheetsShowInfamia', name: 'Mostra Sistema Infamia', default: true },
      { key: 'sheetsShowCompagnia', name: 'Mostra Sezione Compagnia', default: true },
      { key: 'sheetsShowLavori', name: 'Mostra Lavori Sporchi', default: true },
      { key: 'sheetsShowRifugio', name: 'Mostra Sezione Rifugio', default: true },
      { key: 'sheetsShowMalefatte', name: 'Mostra Registro Malefatte', default: true }
    ];

    features.forEach(feature => {
      game.settings.register('brancalonia-bigat', feature.key, {
        name: feature.name,
        hint: 'Mostra questa sezione nelle schede personaggio',
        scope: 'world',
        config: true,
        type: Boolean,
        default: feature.default
      });
    });

    // UI preferences
    game.settings.register('brancalonia-bigat', 'sheetsDecorativeElements', {
      name: 'Elementi Decorativi Rinascimentali',
      hint: 'Mostra cornici, ornamenti e decorazioni rinascimentali',
      scope: 'client',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'sheetsItalianTranslations', {
      name: 'Traduzioni Italiane UI',
      hint: 'Usa traduzioni italiane per elementi D&D 5e standard',
      scope: 'client',
      config: true,
      type: Boolean,
      default: true
    });

    // Technical settings
    game.settings.register('brancalonia-bigat', 'sheetsDelayAfterCarolingian', {
      name: 'Delay Carolingian UI (ms)',
      hint: 'Tempo di attesa dopo Carolingian UI prima di aggiungere contenuto Brancalonia',
      scope: 'world',
      config: true,
      type: Number,
      default: 100,
      range: { min: 0, max: 500, step: 50 }
    });

    game.settings.register('brancalonia-bigat', 'debugBrancaloniaSheets', {
      name: 'Debug Sheets',
      hint: 'Abilita logging dettagliato per il sistema sheets',
      scope: 'client',
      config: true,
      type: Boolean,
      default: false
    });

    logger.debug(this.MODULE_NAME, 'Settings registrate', {
      count: 10,
      features: 5
    });

  } catch (error) {
    logger.error(this.MODULE_NAME, 'Errore nella registrazione settings', error);
    this.statistics.errors.push({
      type: 'settings',
      message: error.message,
      timestamp: Date.now()
    });
  }
}
```

### 1.3 Sostituire Console.log (5 min)

**4 Sostituzioni**:

```javascript
// Line 9 (già fatto in 1.1)
// logger.info già implementato

// Line 16 (già fatto in 1.1)
// logger.info già implementato

// Line 22 - registerSheetModifications()
static registerSheetModifications() {
  try {
    if (!game.settings.get('brancalonia-bigat', 'enableBrancaloniaSheets')) {
      logger.info(this.MODULE_NAME, 'Sheets UI disabilitata tramite settings');
      return;
    }

    logger.debug(this.MODULE_NAME, 'Registrazione modifiche sheet...');

    // Hook renderActorSheet con delay per Carolingian UI
    Hooks.on('renderActorSheet', async (app, html, data) => {
      try {
        // Verifica se Carolingian UI è attivo
        const carolingianActive = !!window.brancaloniaSettings?.SheetsUtil;
        const delay = game.settings.get('brancalonia-bigat', 'sheetsDelayAfterCarolingian') || 100;

        if (carolingianActive) {
          logger.debug(this.MODULE_NAME, `Attendendo ${delay}ms per Carolingian UI...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Applica modifiche Brancalonia
        if (data.actor?.type === 'character') {
          await this.modifyCharacterSheet(app, html, data);
        } else if (data.actor?.type === 'npc') {
          this.modifyNPCSheet(app, html, data);
        }

      } catch (error) {
        logger.error(this.MODULE_NAME, 'Errore in renderActorSheet hook', error);
        this.statistics.errors.push({
          type: 'render-hook',
          message: error.message,
          actorId: data.actor?._id,
          timestamp: Date.now()
        });
      }
    });

    logger.info(this.MODULE_NAME, 'Hook renderActorSheet registrato con successo');

  } catch (error) {
    logger.error(this.MODULE_NAME, 'Errore nella registrazione hook', error);
  }
}

// Line 87 - modifyCharacterSheet()
static async modifyCharacterSheet(app, html, data) {
  try {
    logger.startPerformance('sheets-render');
    logger.debug(this.MODULE_NAME, `Rendering sheet per ${data.actor.name}`);

    const actor = app.actor;
    
    // ... (resto del metodo esistente) ...

    // SOSTITUIRE Line 87
    const renderTime = logger.endPerformance('sheets-render');
    
    // Update statistics
    this.statistics.totalRenders++;
    this.statistics.lastRenderTime = Date.now();
    this.statistics.avgRenderTime = ((this.statistics.avgRenderTime * (this.statistics.totalRenders - 1)) + renderTime) / this.statistics.totalRenders;

    logger.info(this.MODULE_NAME, `Sheet ${data.actor.name} renderizzata in ${renderTime?.toFixed(2)}ms`);

    // Emit event
    logger.events.emit('sheets:sheet-rendered', {
      actorId: actor.id,
      actorName: actor.name,
      renderTime,
      sectionsAdded: this._countSectionsAdded(),
      timestamp: Date.now()
    });

  } catch (error) {
    logger.error(this.MODULE_NAME, 'Errore nel rendering sheet', error);
    this.statistics.errors.push({
      type: 'render',
      message: error.message,
      actorId: data.actor?._id,
      timestamp: Date.now()
    });
  }
}
```

### 1.4 Event Emitters nelle Sezioni (20 min)

**addInfamiaSystem()** (line 139):

```javascript
static addInfamiaSystem(html, actor) {
  try {
    logger.startPerformance('sheets-add-infamia');

    if (!game.settings.get('brancalonia-bigat', 'sheetsShowInfamia')) {
      logger.debug(this.MODULE_NAME, 'Sezione Infamia disabilitata');
      return;
    }

    // ... codice esistente ...

    const renderTime = logger.endPerformance('sheets-add-infamia');
    this.statistics.sectionsByType.infamia++;

    logger.debug(this.MODULE_NAME, `Sezione Infamia aggiunta in ${renderTime?.toFixed(2)}ms`);

  } catch (error) {
    logger.error(this.MODULE_NAME, 'Errore nell\'aggiunta sezione Infamia', error);
    this.statistics.errors.push({
      type: 'section-infamia',
      message: error.message,
      timestamp: Date.now()
    });
  }
}
```

**Applicare lo stesso pattern a**:
- `addCompagniaSection()` → `sheets-add-compagnia`
- `addLavoriSporchiSection()` → `sheets-add-lavori`
- `addRifugioSection()` → `sheets-add-rifugio`
- `addMalefatteSection()` → `sheets-add-malefatte`

### 1.5 Event Emitters nei Dialog (10 min)

**openLavoroDialog()** (line 809):

```javascript
static openLavoroDialog(actor) {
  try {
    logger.debug(this.MODULE_NAME, `Apertura dialog lavoro per ${actor.name}`);

    new foundry.appv1.sheets.Dialog({
      // ... contenuto esistente ...
      buttons: {
        save: {
          label: 'Aggiungi',
          callback: async (html) => {
            try {
              const formData = new FormData(html[0].querySelector('form'));
              const lavoro = {
                title: formData.get('title'),
                client: formData.get('client'),
                reward: parseInt(formData.get('reward')),
                description: formData.get('description'),
                completed: false,
                date: new Date().toLocaleDateString('it-IT')
              };

              const lavori = actor.getFlag('brancalonia-bigat', 'lavoriSporchi') || [];
              lavori.push(lavoro);
              await actor.setFlag('brancalonia-bigat', 'lavoriSporchi', lavori);

              // Update statistics
              this.statistics.lavoriAdded++;

              logger.info(this.MODULE_NAME, `Lavoro aggiunto: "${lavoro.title}" per ${actor.name}`);

              // Emit event
              logger.events.emit('sheets:lavoro-added', {
                actorId: actor.id,
                lavoro,
                timestamp: Date.now()
              });

              // Add to history
              this._addToHistory({
                type: 'lavoro-added',
                actorId: actor.id,
                lavoro: lavoro.title,
                timestamp: Date.now()
              });

            } catch (error) {
              logger.error(this.MODULE_NAME, 'Errore nell\'aggiunta lavoro', error);
              ui.notifications.error('Errore nell\'aggiunta del lavoro!');
            }
          }
        },
        cancel: {
          label: 'Annulla'
        }
      },
      default: 'save'
    }).render(true);

  } catch (error) {
    logger.error(this.MODULE_NAME, 'Errore nell\'apertura dialog lavoro', error);
  }
}
```

**Applicare lo stesso pattern a**:
- `openMalefattaDialog()` → `sheets:malefatta-registered`
- `openAddMemberDialog()` → `sheets:compagnia-member-added`

### 1.6 Event Listeners con Eventi (5 min)

**attachEventListeners()** (line 734):

```javascript
static attachEventListeners(html, data) {
  try {
    logger.startPerformance('sheets-attach-listeners');

    // Infamia adjustments
    html.find('.infamia-adjust').click(async ev => {
      try {
        const adjustment = parseInt($(ev.currentTarget).data('adjust'));
        const actor = game.actors.get(data.actor._id);
        const current = actor.getFlag('brancalonia-bigat', 'infamia') || 0;
        const max = actor.getFlag('brancalonia-bigat', 'infamiaMax') || 10;
        const newValue = Math.max(0, Math.min(max, current + adjustment));
        
        await actor.setFlag('brancalonia-bigat', 'infamia', newValue);

        logger.info(this.MODULE_NAME, `Infamia cambiata: ${current} → ${newValue} per ${actor.name}`);

        // Emit event
        logger.events.emit('sheets:infamia-changed', {
          actorId: actor.id,
          oldValue: current,
          newValue,
          adjustment,
          timestamp: Date.now()
        });

      } catch (error) {
        logger.error(this.MODULE_NAME, 'Errore nel cambiamento Infamia', error);
      }
    });

    // Toggle lavoro completion
    html.find('.toggle-lavoro').click(async ev => {
      try {
        const idx = $(ev.currentTarget).data('lavoro-id');
        const actor = game.actors.get(data.actor._id);
        const lavori = actor.getFlag('brancalonia-bigat', 'lavoriSporchi') || [];
        
        if (lavori[idx]) {
          const wasCompleted = lavori[idx].completed;
          lavori[idx].completed = !wasCompleted;
          await actor.setFlag('brancalonia-bigat', 'lavoriSporchi', lavori);

          // Update statistics
          if (lavori[idx].completed) {
            this.statistics.lavoriCompleted++;
          }

          logger.info(this.MODULE_NAME, `Lavoro "${lavori[idx].title}" ${lavori[idx].completed ? 'completato' : 'riaperto'}`);

          // Emit event
          logger.events.emit('sheets:lavoro-completed', {
            actorId: actor.id,
            lavoroId: idx,
            lavoro: lavori[idx],
            completed: lavori[idx].completed,
            timestamp: Date.now()
          });
        }

      } catch (error) {
        logger.error(this.MODULE_NAME, 'Errore nel toggle lavoro', error);
      }
    });

    // ... resto event listeners esistenti ...

    const listenerTime = logger.endPerformance('sheets-attach-listeners');
    logger.debug(this.MODULE_NAME, `Event listeners collegati in ${listenerTime?.toFixed(2)}ms`);

  } catch (error) {
    logger.error(this.MODULE_NAME, 'Errore nel collegamento event listeners', error);
  }
}
```

---

## 🎯 FASE 2: Riattivare Hook renderActorSheet (30 min)

### 2.1 Riattivare registerSheetModifications() (5 min)

**FATTO nella Fase 1.3** ✅

Hook già implementato con:
- ✅ Check settings
- ✅ Delay per Carolingian UI
- ✅ Character vs NPC
- ✅ Error handling
- ✅ Logging

### 2.2 Testare Hook Timing (10 min)

**Test Script** da eseguire in console:

```javascript
// Test 1: Verifica hook registrato
console.log('Hooks renderActorSheet:', Hooks._hooks['renderActorSheet']?.length);

// Test 2: Verifica settings
console.log('Sheets abilitati:', game.settings.get('brancalonia-bigat', 'enableBrancaloniaSheets'));
console.log('Delay Carolingian:', game.settings.get('brancalonia-bigat', 'sheetsDelayAfterCarolingian'));

// Test 3: Ascolta evento render
logger.events.on('sheets:sheet-rendered', (data) => {
  console.log('✅ Sheet renderizzata:', data);
});

// Test 4: Apri una character sheet
const testActor = game.actors.contents.find(a => a.type === 'character');
if (testActor) {
  testActor.sheet.render(true);
  console.log('Sheet test aperta, attendi rendering...');
}
```

### 2.3 Verificare Rendering Sezioni (10 min)

**Checklist Visiva**:

Dopo aver aperto una scheda personaggio, verificare:

1. ✅ **Infamia Section** presente?
   - Tracker visibile
   - Bottoni +/- funzionanti
   - Status label corretto

2. ✅ **Compagnia Section** presente?
   - Form compagnia visibile
   - Lista membri presente
   - Bottone "Aggiungi Membro"

3. ✅ **Lavori Sporchi Section** presente?
   - Lista lavori visibile
   - Stats summary presente
   - Bottone "Nuovo Lavoro"

4. ✅ **Rifugio Section** presente?
   - Form rifugio visibile
   - Comfort levels selector
   - Features checkboxes

5. ✅ **Malefatte Section** presente?
   - Lista crimini visibile
   - Crime counter
   - Bottone "Registra Malefatta"

### 2.4 Debug Logging (5 min)

**Attivare debug**:

```javascript
// In console
game.settings.set('brancalonia-bigat', 'debugBrancaloniaSheets', true);

// Riapri sheet
testActor.sheet.close();
testActor.sheet.render(true);

// Controlla console per:
// - "Attendendo Xms per Carolingian UI..."
// - "Rendering sheet per [nome]"
// - "Sezione X aggiunta in Yms"
// - "Event listeners collegati in Zms"
// - "Sheet [nome] renderizzata in Wms"
```

---

## 🎯 FASE 3: Testare Rendering (30 min)

### 3.1 Test Funzionali per Sezione

#### Test 3.1.1: Sistema Infamia (5 min)

```javascript
// Prepara test
const actor = game.actors.getName('Test Hero');
await actor.setFlag('brancalonia-bigat', 'infamia', 5);
await actor.setFlag('brancalonia-bigat', 'infamiaMax', 10);

// Apri sheet
actor.sheet.render(true);

// Verifica visualmente:
// ✅ Tracker mostra 5/10
// ✅ Barra riempita al 50%
// ✅ Status: "Famigerato" (3-5 range)

// Test +1
document.querySelector('.infamia-adjust[data-adjust="1"]').click();
// ✅ Valore diventa 6/10
// ✅ Status: "Temuto" (6-8 range)

// Test -1
document.querySelector('.infamia-adjust[data-adjust="-1"]').click();
// ✅ Valore torna a 5/10

// Verifica evento emesso
logger.events.on('sheets:infamia-changed', (data) => {
  console.assert(data.newValue === 6, 'Infamia cambiata correttamente');
});
```

#### Test 3.1.2: Lavori Sporchi (5 min)

```javascript
// Apri dialog
document.querySelector('.add-lavoro-btn').click();

// ✅ Dialog visibile

// Compila form
document.querySelector('input[name="title"]').value = 'Rubare Corona';
document.querySelector('input[name="client"]').value = 'Conte Rosso';
document.querySelector('input[name="reward"]').value = '500';
document.querySelector('textarea[name="description"]').value = 'Infiltrarsi nel palazzo...';

// Submit
document.querySelector('button[label="Aggiungi"]').click();

// Verifica:
// ✅ Dialog si chiude
// ✅ Nuovo lavoro appare nella lista
// ✅ Stats: "Completati: 0, In Corso: 1"
// ✅ Console: "Lavoro aggiunto: "Rubare Corona""

// Toggle completion
document.querySelector('.toggle-lavoro[data-lavoro-id="0"]').click();

// ✅ Lavoro marcato come completato
// ✅ Stats: "Completati: 1, In Corso: 0"
// ✅ Guadagno Totale: "500 🪙"
```

#### Test 3.1.3: Compagnia (5 min)

```javascript
// Set compagnia data
await actor.setFlag('brancalonia-bigat', 'compagnia', {
  nome: 'I Lupi Bianchi',
  motto: 'Oro e Libertà',
  reputazione: 3
});

// Apri sheet
actor.sheet.close();
actor.sheet.render(true);

// Verifica:
// ✅ Nome: "I Lupi Bianchi"
// ✅ Motto: "Oro e Libertà"
// ✅ Reputazione slider a 3
// ✅ Label: "Conosciuti" (1-3 range)

// Aggiungi membro
document.querySelector('.add-member-btn').click();

// Compila
document.querySelector('input[name="name"]').value = 'Marco il Veloce';
document.querySelector('select[name="role"]').value = 'Ladro';

// Submit
document.querySelector('button[label="Aggiungi"]').click();

// ✅ Membro appare nella lista
// ✅ "Marco il Veloce - Ladro"
```

#### Test 3.1.4: Rifugio (5 min)

```javascript
// Set rifugio
await actor.setFlag('brancalonia-bigat', 'rifugio', {
  nome: 'La Taverna del Gatto Nero',
  tipo: 'taverna',
  comfort: 2,
  features: ['cantina', 'armeria']
});

// Apri sheet
actor.sheet.close();
actor.sheet.render(true);

// Verifica:
// ✅ Nome: "La Taverna del Gatto Nero"
// ✅ Tipo: "Taverna" selected
// ✅ Comfort: Level 2 "Modesto" selected
// ✅ Benefit: "Riposo normale, nessun bonus"
// ✅ Features: "Cantina Segreta" checked, "Armeria" checked

// Change comfort
document.querySelector('input[name="flags.brancalonia-bigat.rifugio.comfort"][value="3"]').click();

// ✅ Benefit aggiornato: "+1 ai tiri di recupero..."
```

#### Test 3.1.5: Malefatte (5 min)

```javascript
// Registra malefatta
document.querySelector('.add-malefatta-btn').click();

// Compila
document.querySelector('select[name="type"]').value = 'furto';
document.querySelector('textarea[name="description"]').value = 'Rubato gioielli dalla baronessa';
document.querySelector('input[name="bounty"]').value = '100';

// Submit
document.querySelector('button[label="Registra"]').click();

// Verifica:
// ✅ Malefatta nella lista
// ✅ Icona: 🗝️ (furto)
// ✅ "Rubato gioielli dalla baronessa"
// ✅ Taglia: "100 🪙"
// ✅ Crime counter: "Furti: 1"
// ✅ Infamia aumentata di 1

// Verifica evento
logger.events.on('sheets:malefatta-registered', (data) => {
  console.assert(data.malefatta.type === 'furto', 'Malefatta registrata');
  console.assert(data.malefatta.bounty === 100, 'Taglia corretta');
});
```

### 3.2 Test Performance (5 min)

```javascript
// Test rendering speed
logger.startPerformance('full-sheet-test');

const testActor = game.actors.getName('Test Hero');
testActor.sheet.close();
await testActor.sheet.render(true);

const fullTime = logger.endPerformance('full-sheet-test');

console.log('📊 Performance Test:');
console.log(`- Full render: ${fullTime}ms`);
console.log(`- Statistics:`, game.brancalonia.sheets.getStatistics());

// Target: < 200ms per rendering completo
console.assert(fullTime < 200, `✅ Performance OK (${fullTime}ms < 200ms)`);
```

### 3.3 Test Compatibility Carolingian UI (5 min)

```javascript
// Test 1: Con Carolingian UI attivo
console.log('Carolingian UI attivo:', !!window.brancaloniaSettings?.SheetsUtil);

// Test 2: Theme applicato
console.log('Theme class presente:', document.body.classList.contains('crlngn-sheets'));

// Test 3: Tabs orizzontali
console.log('Tabs orizzontali:', document.body.classList.contains('crlngn-sheet-tabs'));

// Test 4: Verifica delay
const delay = game.settings.get('brancalonia-bigat', 'sheetsDelayAfterCarolingian');
console.log(`Delay impostato: ${delay}ms`);

// Test 5: Apri sheet e verifica timing
// Dovrebbe aspettare delay prima di aggiungere sezioni Brancalonia
// Controlla console per: "Attendendo Xms per Carolingian UI..."
```

---

## 🎯 FASE 4: Polish (30 min)

### 4.1 Helper Methods & API (10 min)

**Aggiungere alla fine della classe**:

```javascript
/**
 * Aggiungi evento all'history
 * @private
 */
static _addToHistory(entry) {
  this.eventHistory.unshift(entry);
  if (this.eventHistory.length > this.MAX_HISTORY) {
    this.eventHistory = this.eventHistory.slice(0, this.MAX_HISTORY);
  }
}

/**
 * Conta sezioni aggiunte nell'ultimo render
 * @private
 */
static _countSectionsAdded() {
  const sections = {
    infamia: game.settings.get('brancalonia-bigat', 'sheetsShowInfamia'),
    compagnia: game.settings.get('brancalonia-bigat', 'sheetsShowCompagnia'),
    lavori: game.settings.get('brancalonia-bigat', 'sheetsShowLavori'),
    rifugio: game.settings.get('brancalonia-bigat', 'sheetsShowRifugio'),
    malefatte: game.settings.get('brancalonia-bigat', 'sheetsShowMalefatte')
  };
  return Object.values(sections).filter(Boolean).length;
}

/**
 * API Pubblica
 */

// Core
static getInfamiaLevel(actor) {
  return this.calculateInfamiaLevel(actor);
}

// Lavori Sporchi
static async addLavoro(actor, lavoroData) {
  try {
    const lavori = actor.getFlag('brancalonia-bigat', 'lavoriSporchi') || [];
    lavori.push({
      ...lavoroData,
      completed: false,
      date: new Date().toLocaleDateString('it-IT')
    });
    await actor.setFlag('brancalonia-bigat', 'lavoriSporchi', lavori);
    
    this.statistics.lavoriAdded++;
    logger.info(this.MODULE_NAME, `Lavoro aggiunto via API: "${lavoroData.title}"`);
    
    logger.events.emit('sheets:lavoro-added', {
      actorId: actor.id,
      lavoro: lavoroData,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(this.MODULE_NAME, 'Errore nell\'aggiunta lavoro via API', error);
    throw error;
  }
}

static async completeLavoro(actor, lavoroId) {
  try {
    const lavori = actor.getFlag('brancalonia-bigat', 'lavoriSporchi') || [];
    if (lavori[lavoroId]) {
      lavori[lavoroId].completed = true;
      await actor.setFlag('brancalonia-bigat', 'lavoriSporchi', lavori);
      
      this.statistics.lavoriCompleted++;
      logger.info(this.MODULE_NAME, `Lavoro completato via API: "${lavori[lavoroId].title}"`);
    }
  } catch (error) {
    logger.error(this.MODULE_NAME, 'Errore nel completamento lavoro via API', error);
    throw error;
  }
}

static getLavoriInCorso(actor) {
  const lavori = actor.getFlag('brancalonia-bigat', 'lavoriSporchi') || [];
  return lavori.filter(l => !l.completed);
}

static getLavoriCompletati(actor) {
  const lavori = actor.getFlag('brancalonia-bigat', 'lavoriSporchi') || [];
  return lavori.filter(l => l.completed);
}

static getTotalEarnings(actor) {
  return this.calculateTotalEarnings(actor.getFlag('brancalonia-bigat', 'lavoriSporchi') || []);
}

// Malefatte
static async registerMalefatta(actor, malefattaData) {
  try {
    const malefatte = actor.getFlag('brancalonia-bigat', 'malefatte') || [];
    malefatte.push({
      ...malefattaData,
      date: new Date().toLocaleDateString('it-IT')
    });
    await actor.setFlag('brancalonia-bigat', 'malefatte', malefatte);
    
    // Update Infamia
    const currentInfamia = actor.getFlag('brancalonia-bigat', 'infamia') || 0;
    const infamiaGain = malefattaData.type === 'omicidio' ? 2 : 1;
    await actor.setFlag('brancalonia-bigat', 'infamia', Math.min(10, currentInfamia + infamiaGain));
    
    this.statistics.malefatteRegistered++;
    logger.info(this.MODULE_NAME, `Malefatta registrata via API: ${malefattaData.type}`);
    
    logger.events.emit('sheets:malefatta-registered', {
      actorId: actor.id,
      malefatta: malefattaData,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(this.MODULE_NAME, 'Errore nella registrazione malefatta via API', error);
    throw error;
  }
}

static getMalefatte(actor) {
  return actor.getFlag('brancalonia-bigat', 'malefatte') || [];
}

// Compagnia
static async addCompagniaMember(actor, memberData) {
  try {
    const compagnia = actor.getFlag('brancalonia-bigat', 'compagnia') || {};
    compagnia.membri = compagnia.membri || [];
    compagnia.membri.push(memberData);
    await actor.setFlag('brancalonia-bigat', 'compagnia', compagnia);
    
    this.statistics.compagniaMembersAdded++;
    logger.info(this.MODULE_NAME, `Membro compagnia aggiunto via API: ${memberData.name}`);
  } catch (error) {
    logger.error(this.MODULE_NAME, 'Errore nell\'aggiunta membro via API', error);
    throw error;
  }
}

static async removeCompagniaMember(actor, memberId) {
  try {
    const compagnia = actor.getFlag('brancalonia-bigat', 'compagnia') || {};
    if (compagnia.membri && compagnia.membri[memberId]) {
      compagnia.membri.splice(memberId, 1);
      await actor.setFlag('brancalonia-bigat', 'compagnia', compagnia);
      logger.info(this.MODULE_NAME, `Membro compagnia rimosso via API`);
    }
  } catch (error) {
    logger.error(this.MODULE_NAME, 'Errore nella rimozione membro via API', error);
    throw error;
  }
}

static getCompagnia(actor) {
  return actor.getFlag('brancalonia-bigat', 'compagnia') || {};
}

// Rifugio
static async upgradeRifugio(actor, comfortLevel) {
  try {
    const rifugio = actor.getFlag('brancalonia-bigat', 'rifugio') || {};
    rifugio.comfort = comfortLevel;
    await actor.setFlag('brancalonia-bigat', 'rifugio', rifugio);
    
    this.statistics.rifugioUpgrades++;
    logger.info(this.MODULE_NAME, `Rifugio upgraded a livello ${comfortLevel} via API`);
  } catch (error) {
    logger.error(this.MODULE_NAME, 'Errore nell\'upgrade rifugio via API', error);
    throw error;
  }
}

static async addRifugioFeature(actor, featureId) {
  try {
    const rifugio = actor.getFlag('brancalonia-bigat', 'rifugio') || {};
    rifugio.features = rifugio.features || [];
    if (!rifugio.features.includes(featureId)) {
      rifugio.features.push(featureId);
      await actor.setFlag('brancalonia-bigat', 'rifugio', rifugio);
      logger.info(this.MODULE_NAME, `Feature rifugio aggiunta via API: ${featureId}`);
    }
  } catch (error) {
    logger.error(this.MODULE_NAME, 'Errore nell\'aggiunta feature rifugio via API', error);
    throw error;
  }
}

static getRifugio(actor) {
  return actor.getFlag('brancalonia-bigat', 'rifugio') || {};
}

// Utility
static async refreshSheet(actorId) {
  const actor = game.actors.get(actorId);
  if (actor && actor.sheet.rendered) {
    actor.sheet.close();
    await actor.sheet.render(true);
    logger.info(this.MODULE_NAME, `Sheet ${actor.name} refresh via API`);
  }
}

static isSheetEnhanced(actorId) {
  const actor = game.actors.get(actorId);
  return actor && actor.sheet.rendered && 
         document.querySelector('.brancalonia-character-sheet') !== null;
}

// Statistics
static getStatistics() {
  return {
    ...this.statistics,
    uptime: Date.now() - (this.statistics.lastRenderTime || Date.now()),
    eventHistoryCount: this.eventHistory.length
  };
}

static resetStatistics() {
  logger.info(this.MODULE_NAME, 'Reset statistiche');
  
  this.statistics = {
    totalRenders: 0,
    sectionsByType: {
      infamia: 0,
      compagnia: 0,
      lavori: 0,
      rifugio: 0,
      malefatte: 0
    },
    lavoriAdded: 0,
    lavoriCompleted: 0,
    malefatteRegistered: 0,
    compagniaMembersAdded: 0,
    rifugioUpgrades: 0,
    avgRenderTime: 0,
    lastRenderTime: 0,
    initTime: this.statistics.initTime, // Mantieni initTime
    errors: []
  };
  this.eventHistory = [];
}
```

### 4.2 Macro Automatiche (10 min)

**Aggiungere metodo `_createAutomaticMacros()`**:

```javascript
static _createAutomaticMacros() {
  try {
    if (!game.macros) {
      logger.warn(this.MODULE_NAME, 'game.macros non disponibile, macro creation skipped');
      return;
    }

    const macros = [
      {
        name: "📝 Aggiungi Lavoro Sporco",
        type: "script",
        img: "icons/sundries/scrolls/scroll-bound-brown-gold.webp",
        command: `
// Verifica token selezionati
const tokens = canvas.tokens.controlled;
if (tokens.length === 0) {
  ui.notifications.warn("Seleziona un token!");
  return;
}

const actor = tokens[0].actor;
if (!actor || actor.type !== 'character') {
  ui.notifications.error("Seleziona un personaggio!");
  return;
}

// Apri dialog
game.brancalonia.sheets.openLavoroDialog(actor);
        `
      },
      {
        name: "⚖️ Registra Malefatta",
        type: "script",
        img: "icons/svg/skull.svg",
        command: `
const tokens = canvas.tokens.controlled;
if (tokens.length === 0) {
  ui.notifications.warn("Seleziona un token!");
  return;
}

const actor = tokens[0].actor;
if (!actor || actor.type !== 'character') {
  ui.notifications.error("Seleziona un personaggio!");
  return;
}

game.brancalonia.sheets.openMalefattaDialog(actor);
        `
      },
      {
        name: "👥 Aggiungi Membro Compagnia",
        type: "script",
        img: "icons/environment/people/group.webp",
        command: `
const tokens = canvas.tokens.controlled;
if (tokens.length === 0) {
  ui.notifications.warn("Seleziona un token!");
  return;
}

const actor = tokens[0].actor;
if (!actor || actor.type !== 'character') {
  ui.notifications.error("Seleziona un personaggio!");
  return;
}

game.brancalonia.sheets.openAddMemberDialog(actor);
        `
      },
      {
        name: "🏠 Statistiche Rifugio",
        type: "script",
        img: "icons/environment/settlement/house-small.webp",
        command: `
const tokens = canvas.tokens.controlled;
if (tokens.length === 0) {
  ui.notifications.warn("Seleziona un token!");
  return;
}

const actor = tokens[0].actor;
const rifugio = game.brancalonia.sheets.getRifugio(actor);

if (!rifugio.nome) {
  ui.notifications.info("Questo personaggio non ha ancora un rifugio!");
  return;
}

const comfortLabels = ['', 'Squallido', 'Modesto', 'Confortevole', 'Lussuoso', 'Principesco'];

ChatMessage.create({
  content: \`
    <div class="brancalonia-message rifugio-stats">
      <h3>🏠 Rifugio: \${rifugio.nome}</h3>
      <p><strong>Tipo:</strong> \${rifugio.tipo || 'Sconosciuto'}</p>
      <p><strong>Ubicazione:</strong> \${rifugio.ubicazione || 'Sconosciuta'}</p>
      <p><strong>Comfort:</strong> \${comfortLabels[rifugio.comfort || 1]}</p>
      <p><strong>Features:</strong> \${(rifugio.features || []).length} installate</p>
      <hr>
      <p><em>\${rifugio.descrizione || 'Nessuna descrizione'}</em></p>
    </div>
  \`,
  speaker: ChatMessage.getSpeaker({ actor })
});
        `
      },
      {
        name: "🗡️ Report Infamia",
        type: "script",
        img: "icons/magic/death/skull-horned-worn-fire-blue.webp",
        command: `
const tokens = canvas.tokens.controlled;
if (tokens.length === 0) {
  ui.notifications.warn("Seleziona un token!");
  return;
}

const actor = tokens[0].actor;
const infamia = actor.getFlag('brancalonia-bigat', 'infamia') || 0;
const infamiaMax = actor.getFlag('brancalonia-bigat', 'infamiaMax') || 10;
const level = game.brancalonia.sheets.getInfamiaLevel(actor);
const malefatte = game.brancalonia.sheets.getMalefatte(actor);

const levelLabels = {
  'unknown': '👤 Sconosciuto',
  'notorious': '🎭 Famigerato',
  'feared': '⚔️ Temuto',
  'legendary': '👑 Leggendario'
};

ChatMessage.create({
  content: \`
    <div class="brancalonia-message infamia-report">
      <h3>🗡️ Report Infamia: \${actor.name}</h3>
      <p><strong>Livello Infamia:</strong> \${infamia}/\${infamiaMax}</p>
      <p><strong>Status:</strong> \${levelLabels[level]}</p>
      <p><strong>Crimini Registrati:</strong> \${malefatte.length}</p>
      <hr>
      <h4>Ultimi 3 Crimini:</h4>
      <ul>
        \${malefatte.slice(-3).map(m => 
          \`<li>\${m.date}: \${m.type} - \${m.description}</li>\`
        ).join('') || '<li>Nessun crimine registrato</li>'}
      </ul>
    </div>
  \`,
  speaker: ChatMessage.getSpeaker({ actor })
});
        `
      }
    ];

    let createdCount = 0;
    macros.forEach(async macroData => {
      try {
        const existingMacro = game.macros.find(m => m.name === macroData.name);
        if (!existingMacro) {
          await game.macros.documentClass.create(macroData);
          createdCount++;
          logger.debug(this.MODULE_NAME, `Macro '${macroData.name}' creata`);
        }
      } catch (error) {
        logger.error(this.MODULE_NAME, `Errore creazione macro ${macroData.name}`, error);
      }
    });

    if (createdCount > 0) {
      logger.info(this.MODULE_NAME, `${createdCount} macro create automaticamente`);
    }

  } catch (error) {
    logger.error(this.MODULE_NAME, 'Errore nella creazione macro', error);
  }
}
```

**Chiamare in Hook ready**:

```javascript
Hooks.once('ready', () => {
  BrancaloniaSheets._createAutomaticMacros();
});
```

### 4.3 Esposizione API Globale (5 min)

**Modificare export finale** (line 965-971):

```javascript
// Initialize when Foundry is ready
Hooks.once('init', () => {
  BrancaloniaSheets.initialize();
});

// Esponi globalmente per uso da altri moduli
window.BrancaloniaSheets = BrancaloniaSheets;

// Registra in game.brancalonia
Hooks.once('ready', () => {
  game.brancalonia = game.brancalonia || {};
  game.brancalonia.sheets = BrancaloniaSheets;
  
  logger.info(BrancaloniaSheets.MODULE_NAME, 'API pubblica registrata in game.brancalonia.sheets');
});
```

### 4.4 Documentazione API Console (5 min)

**Aggiungere metodo `help()`**:

```javascript
/**
 * Mostra guida API nella console
 */
static help() {
  console.log(`
%c🎭 Brancalonia Sheets API v${this.VERSION}

%c📚 Metodi Disponibili:

%cCore:
  game.brancalonia.sheets.getInfamiaLevel(actor)
  game.brancalonia.sheets.calculateInfamiaLevel(actor)

%c💰 Lavori Sporchi:
  game.brancalonia.sheets.addLavoro(actor, {title, client, reward, description})
  game.brancalonia.sheets.completeLavoro(actor, lavoroId)
  game.brancalonia.sheets.getLavoriInCorso(actor)
  game.brancalonia.sheets.getLavoriCompletati(actor)
  game.brancalonia.sheets.getTotalEarnings(actor)

%c⚖️ Malefatte:
  game.brancalonia.sheets.registerMalefatta(actor, {type, description, bounty})
  game.brancalonia.sheets.getMalefatte(actor)

%c👥 Compagnia:
  game.brancalonia.sheets.addCompagniaMember(actor, {name, role})
  game.brancalonia.sheets.removeCompagniaMember(actor, memberId)
  game.brancalonia.sheets.getCompagnia(actor)

%c🏠 Rifugio:
  game.brancalonia.sheets.upgradeRifugio(actor, comfortLevel)
  game.brancalonia.sheets.addRifugioFeature(actor, featureId)
  game.brancalonia.sheets.getRifugio(actor)

%c🔧 Utility:
  game.brancalonia.sheets.refreshSheet(actorId)
  game.brancalonia.sheets.isSheetEnhanced(actorId)

%c📊 Statistics:
  game.brancalonia.sheets.getStatistics()
  game.brancalonia.sheets.resetStatistics()

%c💡 Esempi:

  // Aggiungi lavoro
  const actor = game.actors.getName('Eroe');
  await game.brancalonia.sheets.addLavoro(actor, {
    title: 'Rubare Corona',
    client: 'Conte Rosso',
    reward: 500,
    description: 'Infiltrarsi nel palazzo...'
  });

  // Registra malefatta
  await game.brancalonia.sheets.registerMalefatta(actor, {
    type: 'furto',
    description: 'Rubato gioielli',
    bounty: 100
  });

  // Statistiche
  console.log(game.brancalonia.sheets.getStatistics());
  `,
  'color: #d4af37; font-size: 16px; font-weight: bold;',
  'color: #4a90e2; font-size: 14px; font-weight: bold;',
  'color: #666; font-size: 12px;',
  'color: #666; font-size: 12px;',
  'color: #666; font-size: 12px;',
  'color: #666; font-size: 12px;',
  'color: #666; font-size: 12px;',
  'color: #666; font-size: 12px;',
  'color: #666; font-size: 12px;',
  'color: #888; font-size: 11px; font-style: italic;'
  );
}
```

---

## 📊 Checklist Finale

### Fase 1: Refactoring Logger v2.0.0
- [ ] Import logger
- [ ] VERSION/MODULE_NAME
- [ ] Statistics object
- [ ] Event history
- [ ] _registerSettings() (10 settings)
- [ ] Sostituire 4 console.log
- [ ] Event emitters (9 eventi)
- [ ] Performance tracking (8 ops)
- [ ] Error tracking

### Fase 2: Hook renderActorSheet
- [ ] Hook registrato in registerSheetModifications()
- [ ] Delay Carolingian UI implementato
- [ ] Character vs NPC handling
- [ ] Settings check
- [ ] Error handling
- [ ] Logging

### Fase 3: Test Rendering
- [ ] Test Infamia (+/-, status)
- [ ] Test Lavori (add, toggle, stats)
- [ ] Test Compagnia (add member)
- [ ] Test Rifugio (comfort, features)
- [ ] Test Malefatte (register, infamia increase)
- [ ] Test performance (< 200ms)
- [ ] Test Carolingian UI compatibility

### Fase 4: Polish
- [ ] Helper methods (_addToHistory, _countSectionsAdded)
- [ ] API pubblica (20 metodi)
- [ ] 5 Macro automatiche
- [ ] Esposizione game.brancalonia.sheets
- [ ] help() method
- [ ] Documentazione

---

## 🎊 Risultato Atteso

### Metriche Before/After

| Metrica | Before | After | Diff |
|---------|--------|-------|------|
| **Righe Attive** | ~50 | ~1020 | **+970** |
| **Features Attive** | 0 | 5 | **+5** |
| **Console.log** | 4 | 0 | **-4** |
| **Logger Calls** | 0 | 43+ | **+43** |
| **Event Emitters** | 0 | 9 | **+9** |
| **Settings** | 0 | 10 | **+10** |
| **Macro** | 0 | 5 | **+5** |
| **API Methods** | 0 | 20 | **+20** |
| **Performance Ops** | 0 | 8 | **+8** |

### Features Attivate

1. ✅ **Sistema Infamia** (reputation tracking)
2. ✅ **Compagnia Manager** (party management)
3. ✅ **Lavori Sporchi** (dirty jobs tracking)
4. ✅ **Rifugio** (hideout management)
5. ✅ **Malefatte** (crime registry)

### Qualità Codice

- ✅ Logger v2.0.0 integrato
- ✅ Event emitters completi
- ✅ Performance tracking
- ✅ Statistiche estese
- ✅ Error handling robusto
- ✅ API pubblica completa
- ✅ Macro user-friendly
- ✅ Zero conflitti Carolingian UI

---

## 🚀 Pronto per Iniziare?

**Tutto è pianificato nei minimi dettagli!**

**Vuoi che proceda con l'implementazione?**

**A**: ✅ **SÌ! Inizia con Fase 1** (Refactoring logger)  
**B**: 🤔 **Rivedi un aspetto specifico** (quale?)  
**C**: 📝 **Mostrami esempio di codice** per una fase specifica  
**D**: 🎯 **VAI! Implementa tutto** in sequenza

**Quale scegli?**


