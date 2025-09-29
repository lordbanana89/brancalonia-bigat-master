# 🔍 BRANCALONIA FULL DEBUG REPORT
## Data: 2025-09-29
## Versione: 9.1.2

---

## 📊 ANALISI STRUTTURA PROGETTO

### File Count:
- **JavaScript**: 116 files
- **CSS**: 38 files
- **JSON**: 3266 files
- **Dimensione totale**: 233MB
- **Moduli JS**: 1.2MB
- **Stili CSS**: 276KB
- **Packs**: 13MB

### Module.json:
- ✅ Valid JSON syntax
- ✅ 43 ESModules dichiarati
- ✅ Tutti i file esistono
- ✅ Compatibilità: Foundry v13, D&D 5e v5.1.9

---

## 🚨 PROBLEMI CRITICI IDENTIFICATI

### 1. **HOOKS INCOMPATIBILI** (CRITICO!)
```javascript
// VECCHI HOOKS (D&D 5e < v4):
renderActorSheet5eCharacter  // 10 occorrenze
renderActorSheet5eNPC         // 2 occorrenze
preRenderActorSheet5eCharacter // 2 occorrenze

// NUOVI HOOKS (D&D 5e v5+):
renderActorSheetV2  // 5 occorrenze
```

**File coinvolti**:
- `brancalonia-sheets.js` - USA VECCHI HOOKS ❌
- `favori-system.js` - USA VECCHI HOOKS ❌
- `covo-granlussi.js` - USA VECCHI HOOKS ❌
- `compagnia-manager.js` - USA VECCHI HOOKS ❌
- `malefatte-taglie-nomea.js` - USA VECCHI HOOKS ❌
- `brancalonia-init.js` - USA VECCHI HOOKS ❌
- `brancalonia-v13-modern.js` - USA NUOVI HOOKS ✅
- `brancalonia-compatibility-fix.js` - TENTA ENTRAMBI ⚠️

### 2. **CSS !important OVERUSE**
```
brancalonia-actor-sheet-fix.css: 115 !important (CRITICO!)
brancalonia-icons-fix.css: 33 !important
brancalonia-theme-system-v2.css: 27 !important
brancalonia-fontawesome-local.css: 16 !important

Totale: 213 !important
```

### 3. **CLASSI CSS MISMATCH**
La actor sheet cerca:
- `.brancalonia-sheet` (applicata da JS)
- `.dnd5e.sheet.actor` (struttura D&D 5e)

Ma i CSS usano selettori diversi/errati.

### 4. **MODULI DUPLICATI/CONFLITTI**
Multipli fix per lo stesso problema:
- `brancalonia-icon-interceptor.js`
- `brancalonia-icon-detector.js`
- `brancalonia-icons-complete-fix.js`
- `brancalonia-icons-global-fix.js`
- `brancalonia-icons-auto-fix.js`

### 5. **CARICAMENTO MODULI**
43 ESModules caricati = potenziale performance issue

---

## 🔧 FIX NECESSARI

### FIX 1: Aggiornare TUTTI gli hooks
```javascript
// VECCHIO (non funziona):
Hooks.on("renderActorSheet5eCharacter", ...);

// NUOVO (corretto per D&D 5e v5+):
Hooks.on("dnd5e.renderActorSheet5eCharacterSheet", ...);
// O per compatibilità:
Hooks.on("renderApplication", (app, html, data) => {
  if (app.constructor.name === "ActorSheet5eCharacter") {
    // codice
  }
});
```

### FIX 2: Rimuovere actor-sheet-fix.css
Il file `brancalonia-actor-sheet-fix.css` con 115 !important sta ROMPENDO il layout invece di fixarlo.

### FIX 3: Consolidare moduli icon
Ridurre da 5 a 1 modulo per gestione icone.

### FIX 4: Classe corretta per CSS
```css
/* ERRATO */
.theme-brancalonia .dnd5e.sheet.actor { }

/* CORRETTO */
.dnd5e.sheet.actor.brancalonia-sheet { }
/* O */
.app.window-app .dnd5e.sheet.actor { }
```

---

## 📋 PIANO D'AZIONE

### PRIORITÀ 1 (Blockers):
1. **Aggiornare TUTTI gli hooks a D&D 5e v5**
2. **Rimuovere/riscrivere actor-sheet-fix.css**
3. **Fix selettori CSS per match corretto**

### PRIORITÀ 2 (Critical):
1. **Consolidare moduli icone**
2. **Ridurre !important a < 20**
3. **Test con actor sheet reale**

### PRIORITÀ 3 (Important):
1. **Ottimizzare caricamento moduli**
2. **Rimuovere file legacy**
3. **Documentazione hooks v5**

---

## 🎯 CAUSA ROOT DELLA SHEET ROTTA

1. **Hooks obsoleti** = Sheet modifications non applicate
2. **CSS con !important** = Layout forzato errato
3. **Selettori CSS errati** = Stili non applicati
4. **Classe mancante** = Theme non attivato

La combinazione di questi 4 problemi rende la sheet completamente inutilizzabile.

---

## ✅ NEXT STEPS IMMEDIATI

1. Creare `brancalonia-hooks-v5-fix.js` con tutti gli hooks aggiornati
2. Disabilitare `brancalonia-actor-sheet-fix.css`
3. Test con una actor sheet vera
4. Consolidare tutti i fix in un unico file

---

## 📊 METRICHE

- **Errori critici**: 4
- **File da modificare**: ~15
- **Tempo stimato fix**: 2-3 ore
- **Complessità**: Alta
- **Rischio regressioni**: Medio

---

*Report generato automaticamente con Foundry CLI v3.0.0*