# 🔍 Analisi Sovrapposizione: brancalonia-sheets.js vs SheetsUtil.mjs

**Data**: 2025-10-03  
**Confronto**: `brancalonia-sheets.js` (971 righe) vs `crlngn-ui/components/SheetsUtil.mjs` (140 righe)

---

## 🎯 Risultato: NON SI SOVRAPPONGONO! ✅

Sono **COMPLEMENTARI**, non in conflitto:
- **Carolingian UI (SheetsUtil)** = **PRESENTAZIONE** (styling, layout)
- **Brancalonia Sheets** = **CONTENUTO** (features, logica)

---

## 📊 Confronto Dettagliato

### SheetsUtil.mjs (Carolingian UI) - 140 righe

**Responsabilità**: SOLO styling e layout

| Feature | Linee | Cosa Fa |
|---------|-------|---------|
| `applyThemeToSheets()` | 69-79 | Applica CSS theme Carolingian |
| `applyHorizontalSheetTabs()` | 81-92 | Layout tab orizzontali |
| `#addTabScrollButtons()` | 94-128 | Bottoni scroll per tab |
| `#onRenderActorSheet()` | 24-43 | Hook per applicare theme |
| `#onSheetBodyScroll()` | 55-67 | Animazione fade ability scores |

**Hook utilizzato**:
```javascript
// Line 20
Hooks.on(HOOKS_CORE.RENDER_ACTOR_SHEET, SheetsUtil.#onRenderActorSheet);
```

**Cosa fa nell'hook**:
```javascript
static #onRenderActorSheet(actorSheet, html, data){
  // 1. Rimuove tooltip dai tab
  // 2. Applica theme CSS
  // 3. Applica layout orizzontale
  // 4. Aggiunge bottoni scroll
  
  // ❌ NON aggiunge contenuto Brancalonia!
  // ❌ NON gestisce Infamia, Compagnia, Lavori, etc.
}
```

**CSS applicato**:
- `document.body.classList.add("crlngn-sheets")` → Styling generale
- `document.body.classList.add("crlngn-sheet-tabs")` → Layout tab

**Grep per features Brancalonia**:
```bash
$ grep -i "infamia\|compagnia\|lavori\|rifugio\|malefatte" SheetsUtil.mjs
# Risultato: 0 matches ❌
```

**Conclusione**: SheetsUtil.mjs si occupa SOLO di:
- 🎨 Theme/styling
- 📐 Layout
- 🔄 Animazioni UI
- ⚙️ Settings UI

---

### brancalonia-sheets.js - 971 righe

**Responsabilità**: Contenuto e logica Brancalonia

| Feature | Linee | Cosa Fa |
|---------|-------|---------|
| `addInfamiaSystem()` | 139-178 | Tracker Infamia completo |
| `addCompagniaSection()` | 203-289 | Manager Compagnia |
| `addLavoriSporchiSection()` | 291-376 | Tracking Lavori |
| `addRifugioSection()` | 378-498 | Manager Rifugio |
| `addMalefatteSection()` | 500-562 | Registro crimini |
| `attachEventListeners()` | 734-776 | Event handlers gameplay |
| `openLavoroDialog()` | 809-857 | Form Lavoro |
| `openMalefattaDialog()` | 907-962 | Form Malefatta |
| `translateUIElements()` | 618-643 | Traduzioni IT |

**Hook previsto (ma disabilitato)**:
```javascript
// QUESTO MANCA!
Hooks.on('renderActorSheet', (app, html, data) => {
  await BrancaloniaSheets.modifyCharacterSheet(app, html, data);
});
```

**Cosa dovrebbe fare nell'hook**:
```javascript
static async modifyCharacterSheet(app, html, data) {
  // 1. Aggiunge sezione Infamia
  // 2. Aggiunge sezione Compagnia
  // 3. Aggiunge sezione Lavori Sporchi
  // 4. Aggiunge sezione Rifugio
  // 5. Aggiunge sezione Malefatte
  // 6. Collega event listeners
  // 7. Traduzioni IT
  
  // ❌ NON tocca styling (lascia a Carolingian UI)
  // ❌ NON modifica layout (lascia a Carolingian UI)
}
```

**Conclusione**: brancalonia-sheets.js si occupa di:
- 📝 Contenuto Brancalonia (5 sezioni)
- 🎮 Logica gameplay
- 📋 Dialog forms (3)
- 🔗 Event handlers
- 🇮🇹 Traduzioni

---

## 🔄 Come Lavorano Insieme

### Flow Corretto

```
1. User apre Actor Sheet
   ↓
2. Foundry emette: Hooks.on('renderActorSheet')
   ↓
3. ┌─────────────────────────────────────┐
   │ SheetsUtil.mjs (Carolingian UI)     │
   │ Priority: FIRST (styling base)      │
   ├─────────────────────────────────────┤
   │ - Applica CSS theme                 │
   │ - Layout tab orizzontali            │
   │ - Bottoni scroll                    │
   │ - Animazioni                        │
   └─────────────────────────────────────┘
   ↓
4. ┌─────────────────────────────────────┐
   │ BrancaloniaSheets.js                │
   │ Priority: SECOND (contenuto)        │
   ├─────────────────────────────────────┤
   │ - Aggiunge sezione Infamia          │
   │ - Aggiunge sezione Compagnia        │
   │ - Aggiunge sezione Lavori           │
   │ - Aggiunge sezione Rifugio          │
   │ - Aggiunge sezione Malefatte        │
   │ - Collega event handlers            │
   └─────────────────────────────────────┘
   ↓
5. Sheet completa renderizzata:
   ✅ Theme Carolingian (styling)
   ✅ Features Brancalonia (contenuto)
```

### Hook Priority

Per evitare conflitti, usa priorità hook:

```javascript
// Carolingian UI (già implementato)
Hooks.on('renderActorSheet', SheetsUtil.#onRenderActorSheet);

// Brancalonia Sheets (da implementare con priorità più bassa)
Hooks.on('renderActorSheet', (app, html, data) => {
  // Esegui DOPO Carolingian UI
  setTimeout(async () => {
    await BrancaloniaSheets.modifyCharacterSheet(app, html, data);
  }, 50); // Delay per permettere a Carolingian UI di finire
});
```

---

## 🎯 Separazione Responsabilità

### Carolingian UI (SheetsUtil.mjs)

| Aspetto | Responsabilità |
|---------|----------------|
| **CSS Classes** | `crlngn-sheets`, `crlngn-sheet-tabs` |
| **Layout** | Tab orizzontali, scroll buttons |
| **Theme** | Colori, font, spacing |
| **Animazioni** | Fade effects, scroll smooth |
| **Settings** | `applyThemeToSheets`, `useHorizontalSheetTabs` |

**NON tocca**:
- ❌ Flags actor (`flags.brancalonia-bigat.*`)
- ❌ Contenuto specifico Brancalonia
- ❌ Logica gameplay
- ❌ Dialog forms

---

### Brancalonia Sheets

| Aspetto | Responsabilità |
|---------|----------------|
| **Data** | `flags.brancalonia-bigat.*` (infamia, compagnia, lavori, etc.) |
| **UI Sections** | 5 sezioni custom Brancalonia |
| **Forms** | 3 dialog forms |
| **Logic** | Event handlers, calculations |
| **i18n** | Traduzioni IT |

**NON tocca**:
- ❌ CSS theme globale
- ❌ Layout tab
- ❌ Scroll buttons
- ❌ Settings UI generali

---

## 🐛 Conflitti Potenziali (e Come Evitarli)

### ⚠️ Conflitto 1: Hook Timing

**Problema**: Se entrambi modificano HTML allo stesso momento, potrebbero sovrascriversi.

**Soluzione**:
```javascript
// Carolingian UI va per primo (già implementato)
Hooks.on('renderActorSheet', SheetsUtil.#onRenderActorSheet);

// Brancalonia Sheets va per secondo (da implementare)
Hooks.on('renderActorSheet', async (app, html, data) => {
  // Attendi che Carolingian UI finisca
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Ora aggiungi contenuto Brancalonia
  await BrancaloniaSheets.modifyCharacterSheet(app, html, data);
});
```

### ⚠️ Conflitto 2: jQuery vs Vanilla JS

**Problema**: Carolingian UI usa vanilla JS, Brancalonia Sheets usa jQuery.

**Soluzione**: jQuery può convivere con vanilla JS senza problemi:
```javascript
// Carolingian UI (vanilla)
html.querySelector('.sheet-body'); // ✅ OK

// Brancalonia Sheets (jQuery)
$(html).find('.sheet-body'); // ✅ OK

// Entrambi funzionano sullo stesso HTML!
```

### ⚠️ Conflitto 3: CSS Classi

**Problema**: Se Brancalonia Sheets aggiunge classi che confliggono con Carolingian UI.

**Soluzione**: Usa prefissi diversi:
```javascript
// Carolingian UI
element.classList.add('crlngn-*'); // Prefisso 'crlngn-'

// Brancalonia Sheets
element.classList.add('brancalonia-*'); // Prefisso 'brancalonia-'

// Nessun conflitto! ✅
```

---

## 📊 Metriche Sovrapposizione

| Feature | Carolingian UI | Brancalonia Sheets | Overlap |
|---------|----------------|-------------------|---------|
| **Theme/Styling** | ✅ 100% | ❌ 0% | 0% |
| **Layout Tab** | ✅ 100% | ❌ 0% | 0% |
| **Scroll Buttons** | ✅ 100% | ❌ 0% | 0% |
| **Infamia System** | ❌ 0% | ✅ 100% | 0% |
| **Compagnia Manager** | ❌ 0% | ✅ 100% | 0% |
| **Lavori Sporchi** | ❌ 0% | ✅ 100% | 0% |
| **Rifugio** | ❌ 0% | ✅ 100% | 0% |
| **Malefatte** | ❌ 0% | ✅ 100% | 0% |
| **Event Handlers** | ❌ 0% | ✅ 100% | 0% |
| **Dialog Forms** | ❌ 0% | ✅ 100% | 0% |

**Overlap Totale**: **0%** ✅

---

## 🎊 Conclusione

### ✅ NON c'è Sovrapposizione!

I due sistemi sono **perfettamente complementari**:

```
┌─────────────────────────────────────────────────┐
│             Actor Sheet Finale                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────┐             │
│  │   Carolingian UI Theme         │ ← Styling   │
│  │   (SheetsUtil.mjs)             │             │
│  └────────────────────────────────┘             │
│                                                  │
│  ┌────────────────────────────────┐             │
│  │   Brancalonia Content          │ ← Content   │
│  │   (brancalonia-sheets.js)      │             │
│  │                                 │             │
│  │   - Infamia Section ✅          │             │
│  │   - Compagnia Section ✅        │             │
│  │   - Lavori Sporchi Section ✅   │             │
│  │   - Rifugio Section ✅          │             │
│  │   - Malefatte Section ✅        │             │
│  └────────────────────────────────┘             │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 🎯 Implicazioni per il Completamento

**Questo CONFERMA che l'Opzione C (Hybrid) è PERFETTA**:

1. **Carolingian UI** continua a gestire styling/theme ✅
2. **brancalonia-sheets.js** gestisce contenuto Brancalonia ✅
3. **brancalonia-ui-coordinator.js** coordina i timing ✅
4. **Nessun conflitto** perché responsabilità separate ✅

### ✅ Piano di Azione Confermato

**Opzione C è SICURA e CORRETTA**:

1. ✅ Riattivare `brancalonia-sheets.js` per contenuto
2. ✅ Mantenere `SheetsUtil.mjs` per styling
3. ✅ Usare `ui-coordinator.js` per timing
4. ✅ Nessuna duplicazione, nessun conflitto

---

## 🔧 Implementazione Consigliata

### Step 1: Riattivare brancalonia-sheets.js

```javascript
// brancalonia-sheets.js

static registerSheetModifications() {
  // RIATTIVATO! (era disabilitato)
  
  Hooks.on('renderActorSheet', async (app, html, data) => {
    // Attendi che Carolingian UI applichi il theme
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Ora aggiungi contenuto Brancalonia
    if (data.actor?.type === 'character') {
      await this.modifyCharacterSheet(app, html, data);
    }
  });
}
```

### Step 2: Coordinare con UI Coordinator (opzionale)

Se vuoi più controllo, usa ui-coordinator:

```javascript
// brancalonia-ui-coordinator.js

static _registerCentralHook() {
  Hooks.on('renderActorSheet', async (app, html, data) => {
    // 1. Attendi Carolingian UI theme (già eseguito)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 2. Chiama BrancaloniaSheets per contenuto
    if (data.actor?.type === 'character') {
      await BrancaloniaSheets.modifyCharacterSheet(app, html, data);
    }
  });
}
```

---

## 🎊 Risposta Finale

**Domanda**: "Non è che si sovrappone con SheetsUtil.mjs?"

**Risposta**: **NO! ✅**

- **SheetsUtil.mjs** = Theme/Layout (140 righe)
- **brancalonia-sheets.js** = Features/Logic (971 righe)
- **Overlap** = **0%**
- **Conflitti** = **Nessuno** (se timing corretto)

**Sono come**:
- 🎨 Carolingian UI = "La cornice del quadro"
- 🖼️ Brancalonia Sheets = "Il dipinto dentro la cornice"

**Lavorano insieme perfettamente!** 🤝


