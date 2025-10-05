# 🔍 PROBLEMI ARCHITETTURALI SHEET - ANALISI COMPLETA

**File**: `modules/brancalonia-sheets.js`  
**Linee**: 1,824  
**Analisi**: Claude Sonnet 4.5  
**Validazione**: vs GPT-5 Codex findings  

---

## ✅ **PROBLEMI CONFERMATI (GPT-5 + Claude)**

### 🔴 1. Hooks Duplicati su renderActorSheet

**Lines**: 188 e 226

```javascript
// PROBLEMA: Stesso hook registrato DUE VOLTE!
Hooks.on('renderActorSheet', async (app, html, data) => { // Line 188
  // Modifiche strutturali
});

Hooks.on('renderActorSheet', (app, html, data) => { // Line 226  
  this.attachEventListeners(html, data);
});
```

**Impatto**: 
- Eseguiti entrambi ad ogni render
- Performance doppia inutile
- Confusione nel debug

**Soluzione**:
```javascript
// ✅ CONSOLIDATO:
Hooks.on('renderActorSheet', async (app, html, data) => {
  if (data.actor?.type === 'character') {
    await this.modifyCharacterSheet(app, html, data);
    this.attachEventListeners(html, data);
  } else if (data.actor?.type === 'npc') {
    this.modifyNPCSheet(app, html, data);
  }
});
```

---

### 🔴 2. Template Handlebars NON Usati

**Template Esistenti** (17 file):
- `infamia-tracker.hbs` ← ❌ MAI usato
- `compagnia-sheet.hbs` ← ❌ MAI usato  
- `dirty-job-card.hbs` ← ❌ MAI usato
- `haven-manager.hbs` ← ❌ MAI usato
- ... e altri 13

**Occorrenze `renderTemplate`**: **0** (ZERO!)

**Problema**: Il codice usa HTML inline invece dei template:

```javascript
// ❌ ATTUALE (Line ~463):
const html = `
  <div class="compagnia-section">
    <h3>${compagnia.name}</h3>
    ...
  </div>
`;
$('.biography').append(html);

// ✅ DOVREBBE ESSERE:
const html = await renderTemplate(
  'modules/brancalonia-bigat/templates/compagnia-sheet.hbs',
  { compagnia, members: compagnia.membri }
);
$('.biography').append(html);
```

**Impatto**:
- Template files inutilizzati (dead code)
- Codice meno mantenibile
- i18n impossibile
- Duplicazione logica

---

### 🔴 3. Race Condition preCreateActor

**Line**: 235-238

```javascript
// ❌ PROBLEMA:
Hooks.on('preCreateActor', (document, data, options, userId) => {
  if (data.type === 'character') {
    this.initializeBrancaloniaData(document); // ❌ Non async, non awaited!
  }
});

// In initializeBrancaloniaData (line ~1004):
static initializeBrancaloniaData(actor) {
  actor.setFlag('brancalonia-bigat', 'infamia', 0); // ❌ Non awaited!
  actor.setFlag('brancalonia-bigat', 'compagnia', {}); // ❌ Non awaited!
  // ... altri setFlag non awaited
}
```

**Problema**:
- setFlag() ritorna Promise, ma non awaited
- L'actor potrebbe essere creato PRIMA che i flag siano impostati
- Race condition su actor creation

**Soluzione**:
```javascript
// ✅ CORRETTO:
Hooks.on('preCreateActor', async (document, data, options, userId) => {
  if (data.type === 'character') {
    await this.initializeBrancaloniaData(document);
  }
});

static async initializeBrancaloniaData(actor) {
  // Batch update atomico
  await actor.update({
    'flags.brancalonia-bigat': {
      infamia: 0,
      infamiaMax: 10,
      compagnia: {},
      lavoriSporchi: [],
      malefatte: [],
      rifugio: null
    }
  });
}
```

---

### 🔴 4. innerHTML Eccessivo (0 occorrenze dirette, ma...)

**Uso di jQuery `.html()`**: Presente in tutto il file

```javascript
// Pattern problematico (trovato ~50+ volte):
$('.section').html(`<div>...</div>`);
```

**Impatto**: Come innerHTML, ma con jQuery.

---

### 🟡 5. setTimeout Delay per Carolingian UI

**Line**: 196 + `Main.mjs:62` (già fixato da GPT-5)

```javascript
// ❌ WORKAROUND FRAGILE:
const delay = game.settings.get('brancalonia-bigat', 'sheetsDelayAfterCarolingian') || 100;
if (carolingianActive) {
  await new Promise(resolve => setTimeout(resolve, delay));
}
```

**Problema**: Race condition basata su timing arbitrario

**Soluzione Corretta**: Observer pattern o eventi

---

### 🟡 6. Selettori DOM Legacy

**Lines**: ~474, 585, etc.

```javascript
// ❌ ASSUMONO MARKUP DND5E v4:
$('[data-tab="biography"]')
$('.attributes .resources')
$('.sheet-header .char-name')
```

**Problema**: dnd5e v5 ha markup diverso → selettori falliscono silenziosamente

**Soluzione**: Feature detection o API system

---

### 🟡 7. Inline Styles invece di CSS

**Line**: 330

```javascript
// ❌ INLINE STYLE:
element.style.backgroundImage = `url(${texture})`;
```

**Dovrebbe essere**: CSS class in stylesheet

---

### 🟡 8. Localizzazione Hardcoded

**Ovunque nel file**:

```javascript
title: 'Aggiungi Lavoro Sporco'  // ❌ Hardcoded Italian
label: 'Salva'                   // ❌ No i18n
```

**Dovrebbe essere**:
```javascript
title: game.i18n.localize('BRANCALONIA.AddDirtyJob')
```

---

### 🟡 9. Accessibilità Mancante

**Buttons senza aria-label**:

```javascript
<button>✖</button> // ❌ Screen reader: ???
```

**Dovrebbe**:
```javascript
<button type="button" aria-label="{{localize 'BRANCALONIA.Remove'}}">✖</button>
```

---

### 🟡 10. NPC Sheet Duplicate Append

**Line**: 1027

```javascript
header.append(`<div class="npc-faction">...`);
// ❌ No guard → duplicato ad ogni render!
```

**Fix**:
```javascript
if (!header.find('.npc-faction').length) {
  header.append(...);
}
```

---

## 📊 TOTALE PROBLEMI TROVATI

| Categoria | Count | Priorità |
|-----------|-------|----------|
| Hooks duplicati | 1 | 🔴 CRITICA |
| Template non usati | 17 files | 🔴 CRITICA |
| Race preCreateActor | 1 | 🔴 CRITICA |
| setFlag non awaited | 6 | 🔴 CRITICA |
| setTimeout workaround | 1 | 🟡 ALTA |
| Selettori legacy | 20+ | 🟡 ALTA |
| Inline styles | 5+ | 🟡 MEDIA |
| i18n hardcoded | 100+ | 🟡 MEDIA |
| Accessibility | 50+ | 🟡 MEDIA |
| Duplicate DOM | 3 | 🟡 MEDIA |

**TOTALE**: **200+ issues** nel singolo file `brancalonia-sheets.js`!

---

## 🎯 SOLUZIONE PROPOSTA

### Approccio 1: Quick Fixes (2 ore)
- Fix hooks duplicati
- Await su preCreateActor
- Batch setFlag
- Guards su DOM duplicati

### Approccio 2: Refactoring Completo (1 settimana)
- Creare proper ActorSheet subclass
- Integrare tutti i template HBS
- Sistema i18n completo
- Accessibility WCAG AA
- CSS modulare

---

**Prossimo Step**: Vuoi quick fixes o refactoring completo?

