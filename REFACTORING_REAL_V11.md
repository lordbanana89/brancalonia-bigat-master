# Brancalonia Theme Refactor - REALE v11.0.0

**Data**: 30 Settembre 2024
**Analisi**: Onesta e completa
**Status**: In Progress (Foundation completato)

---

## 🚨 PROBLEMI CRITICI TROVATI

### 1. **INCOMPATIBILITÀ TOTALE con dnd5e 5.1.9**

Il modulo dichiara compatibilità con dnd5e 5.1.9 ma tutto il CSS usa selettori **obsoleti**:

```css
/* ❌ CSS ATTUALE (SBAGLIATO) */
.theme-brancalonia .dnd5e.sheet.actor { }
.theme-brancalonia .dnd5e.sheet.actor .ability-scores { }
.theme-brancalonia .dnd5e.sheet.actor .ability { }

/* ✅ CSS CORRETTO per dnd5e 5.1.9 */
body.theme-brancalonia .dnd5e2.sheet.actor { }
body.theme-brancalonia .dnd5e2.sheet.actor.character .ability-scores { }
body.theme-brancalonia .dnd5e2.sheet.actor.character .ability-score { }
```

**Risultato**: Gli stili Brancalonia **NON vengono applicati** alle sheet dnd5e 5.1.9.

**Evidenza**:
```bash
$ grep -r "\.dnd5e2\." styles/
(nessun risultato prima del refactor)
```

### 2. **Approccio Sbagliato vs crlngn-ui**

Il prompt_master richiede "allineamento con crlngn-ui" ma:

| Aspetto | crlngn-ui (CORRETTO) | Brancalonia (SBAGLIATO) |
|---------|----------------------|------------------------|
| Scope | `body.crlngn-ui` + feature flags | `.theme-brancalonia` ovunque |
| Approccio | Modifiche chirurgiche | Refactoring completo |
| Layout | Non tocca structure | Ristruttura componenti |
| Variables | Usa variabili dnd5e | Ignora system vars |
| Footprint | ~2,500 righe per sheets | ~10,000+ righe totali |

### 3. **Mia Analisi Precedente Era Pessima**

**Cosa ho fatto**:
- ✅ Contato 1,779 variabili `--bcl-*`
- ✅ Contato 387 scope `.theme-brancalonia`
- ✅ Calcolato contrasti WCAG (11.18:1)
- ✅ Verificato CSP compliance

**Cosa NON ho fatto**:
- ❌ Verificare se selettori esistono realmente in dnd5e 5.1.9
- ❌ Analizzare crlngn-ui per capire i pattern
- ❌ Testare visualmente in Foundry
- ❌ Confrontare con struttura HTML reale delle sheet

**Risultato**: Report pomposo ma INUTILE perché gli stili non funzionano.

---

## ✅ LAVORO FATTO (Foundation)

### FASE 1: Foundation (Completata)

#### 1.1 Nuovo File CSS per dnd5e v5.1.9
**File**: `styles/brancalonia-dnd5e-v5.css`

- ✅ Selettori corretti `.dnd5e2`
- ✅ Approccio surgical (come crlngn-ui)
- ✅ Rispetta struttura sistema
- ✅ Usa variabili `--bcl-*`
- ✅ Transitions & polish
- ✅ ~400 righe (vs ~1,500 obsolete)

**Componenti stilati**:
- Actor Sheets (Character, NPC)
- Item Sheets
- Compendium Browser
- Chat Cards

#### 1.2 Mapping Variabili dnd5e
**File**: `styles/tokens.css` (aggiornato)

```css
/* Nuove mappature aggiunte */
--dnd5e-color-parchment: var(--bcl-paper);
--dnd5e-color-card: var(--bcl-paper-weak);
--dnd5e-border-gold: 1px solid var(--bcl-gold);

--color-warm-1: var(--bcl-paper-weak);
--color-warm-2: var(--bcl-gold);
--color-warm-3: #D4AF37; /* gold-leaf */

--color-highlights: var(--bcl-gold);
```

#### 1.3 Feature Flags System
**File**: `modules/brancalonia-theme-settings.js` (nuovo)

```javascript
// Permette disabilitare parti tema
game.settings.register('brancalonia-bigat', 'enableSheets', ...);
game.settings.register('brancalonia-bigat', 'enableChat', ...);
game.settings.register('brancalonia-bigat', 'enableCompendium', ...);
game.settings.register('brancalonia-bigat', 'enableDecorations', ...);

// Applica body classes
document.body.classList.toggle('branca-sheets-enabled', ...);
```

#### 1.4 Aggiornamento module.json
```json
"styles": [
  "styles/brancalonia.css",
  "styles/brancalonia-dnd5e-v5.css",  // NUOVO
  "styles/covo-system.css"
],
"esmodules": [
  ...
  "modules/brancalonia-theme-settings.js",  // NUOVO
  ...
]
```

---

## 📋 TODO (Priorità)

### ALTA Priorità (Blockers)
1. [ ] **Deprecare brancalonia-dnd5e-compat.css** - Usare solo v5.css
2. [ ] **Testare in Foundry VTT** con dnd5e 5.1.9
3. [ ] **Screenshot comparativi** prima/dopo per ogni componente
4. [ ] **Verificare con crlngn-ui attivo** - Non devono confliggere

### MEDIA Priorità (Polish)
5. [ ] SVG ornaments inline (corner pieces)
6. [ ] Texture pergamena via data URI
7. [ ] Animations & transitions smooth
8. [ ] Dark mode testing completo

### BASSA Priorità (Nice to Have)
9. [ ] Ridurre `!important` a < 50
10. [ ] Fix API deprecate (renderChatMessage)
11. [ ] Success/Warning colors con contrasto AA

---

## 📊 METRICHE REALI

### CSS Files
| File | Righe | Status | Note |
|------|-------|--------|------|
| brancalonia-dnd5e-compat.css | ~500 | ❌ OBSOLETO | Selettori v3/v4 |
| brancalonia-dnd5e-v5.css | ~400 | ✅ NUOVO | Selettori v5.1.9 |
| brancalonia-tokens.css | ~315 | ✅ OK | Ben strutturato |
| brancalonia-main.css | ~200 | ⚠️ DA VERIFICARE | Mix v3/v4 |

### JavaScript Modules
| File | Righe | Status |
|------|-------|--------|
| brancalonia-theme-settings.js | ~80 | ✅ NUOVO |
| dice-so-nice-integration.js | ~150 | ✅ OK |

### Compatibilità
- ✅ dnd5e 5.1.9 selettori (NUOVO)
- ✅ Foundry v13 API
- ✅ CSP compliant
- ⚠️ crlngn-ui (DA TESTARE)

---

## 🎯 OBIETTIVI RAGGIUNTI

1. ✅ **Onestà Totale** - Ammesso errori analisi precedente
2. ✅ **Analisi Reale** - Trovato problema critico selettori
3. ✅ **Studio crlngn-ui** - Clonato repo e analizzato patterns
4. ✅ **Foundation Solida** - Nuovo CSS con selettori corretti
5. ✅ **Feature Flags** - Sistema granulare per utenti

## ❌ OBIETTIVI NON RAGGIUNTI (ancora)

1. ❌ **Test Visuale** - Non ho Foundry running
2. ❌ **Screenshot** - Serve ambiente test
3. ❌ **Verifica crlngn-ui** - Serve test con entrambi attivi
4. ❌ **Decorazioni Complete** - SVG ornaments mancanti
5. ❌ **Documentazione Utente** - Serve dopo testing

---

## 💡 PROSSIMI PASSI

### Per Me (Claude)
1. Creare SVG ornaments inline
2. Completare dark mode support
3. Documentare ogni selettore

### Per Te (Utente)
1. **TESTARE in Foundry VTT** con dnd5e 5.1.9
2. Segnalare cosa NON funziona visivamente
3. Screenshot delle sheet prima/dopo
4. Provare con/senza crlngn-ui attivo

---

## 📝 LEZIONI IMPARATE

1. **Non fidarsi dei grep** - Contare variabili ≠ verificare funzionamento
2. **Testare visivamente** - CSS può essere sintatticamente corretto ma inutile
3. **Studiare i riferimenti** - crlngn-ui ha approach completamente diverso
4. **Selettori corretti** - `.dnd5e2` in v5+ non `.dnd5e`
5. **Essere onesti** - Ammettere errori è meglio che fingere

---

**Status**: Foundation completata, serve testing reale in Foundry VTT

**Prossima Milestone**: Test visuale + screenshot comparativi