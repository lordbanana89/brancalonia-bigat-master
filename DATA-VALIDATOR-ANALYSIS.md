# 🔍 Analisi Brancalonia Data Validator

## Data: 2025-10-03
## File: `modules/brancalonia-data-validator.js`
## Status: ⚠️ FUNZIONALE MA CON PROBLEMI

---

## 🎯 Funzione del Modulo

Il **Data Validator** è un sistema automatico per:
- ✅ Correggere errori di validazione Foundry VTT
- ✅ Identificare valori di durata non validi nelle attività
- ✅ Validare dati in attori, item e compendi
- ✅ Prevenire crash da `DataModelValidationError`

### Problema Specifico Risolto
Foundry VTT (specialmente D&D 5e v5.x) valida i valori di durata delle attività con questa regex:
```javascript
/^[0-9+\-*/%\s]*$/
```

Se un'attività ha `duration.value = "Istantaneo"` o `duration.value = "1 ora"`, il sistema lancia un errore di validazione.

---

## 🐛 Problemi Identificati

### 1. ⚠️ **Hook `init` Duplicato** (CRITICO)
**Problema**: L'hook `init` è registrato 2 volte, causando doppia esecuzione.

**Linea 37** (dentro `_registerHooks()`):
```javascript
Hooks.once('init', () => {
  logger.info('BrancaloniaDataValidator', 'Iniziando correzione validazione immediata');
  this._fixValidationErrors();
});
```

**Linea 585** (globale):
```javascript
Hooks.once('init', () => {
  try {
    BrancaloniaDataValidator.initialize(); // Che chiama _fixValidationErrors()
  } catch (error) {
    logger.error('BrancaloniaDataValidator', 'Errore inizializzazione:', error);
  }
});
```

**Effetto**: Il metodo `_fixValidationErrors()` viene eseguito 2 volte.

---

### 2. ⚠️ **Metodo `_fixCompendiumValidationIssues()` Non Funzionale**
**Problema**: Usa `pack.getDocuments()` in modo sincrono durante `preInit`, ma è un metodo **async**.

**Linea 394**:
```javascript
const items = pack.getDocuments(); // ❌ SINCRONO ma è ASYNC

for (const item of items) { // ❌ items è una Promise, non un array
  // ...
}
```

**Effetto**: Non corregge mai nulla nei compendi durante `preInit`.

---

### 3. ⚠️ **Metodi Stub Non Implementati**
**Problema**: 2 metodi sono placeholder vuoti che non fanno nulla.

#### `_findValidationIssues()` (Linea 361)
```javascript
static _findValidationIssues() {
  const issues = [];

  try {
    // Controlla documenti nel mondo che potrebbero avere problemi
    // Nota: Questa è una versione semplificata per l'hook init
    logger.info('BrancaloniaDataValidator', 'Ricerca problemi validazione...');
  } catch (error) {
    logger.error('BrancaloniaDataValidator', 'Errore ricerca problemi:', error);
  }

  return issues; // ❌ Sempre array vuoto
}
```

#### `_fixCompendiumIssue()` (Linea 444)
```javascript
static _fixCompendiumIssue(issue) {
  try {
    logger.info('BrancaloniaDataValidator', `Correggendo problema nel compendio: ${issue.compendium} - ${issue.item}`);
    return 1; // ❌ Finge di aver corretto ma non fa nulla
  } catch (error) {
    logger.error('BrancaloniaDataValidator', 'Errore correzione compendio:', error);
    return 0;
  }
}
```

#### `_fixActorIssue()` (Linea 457)
```javascript
static _fixActorIssue(issue) {
  try {
    logger.info('BrancaloniaDataValidator', `Correggendo problema nell'attore: ${issue.actor}`);
    return 1; // ❌ Finge di aver corretto ma non fa nulla
  } catch (error) {
    logger.error('BrancaloniaDataValidator', 'Errore correzione attore:', error);
    return 0;
  }
}
```

**Effetto**: Il metodo `_fixValidationErrors()` chiama questi stub ma non corregge mai nulla.

---

### 4. ⚠️ **Validazione Regex Potenzialmente Troppo Permissiva**
**Problema**: La regex usata potrebbe non catturare tutti i casi problematici.

**Linea 155, 210, 270, 406, 487, 507**:
```javascript
if (typeof durationValue === 'string' && !/^[0-9+\-*/%\s]*$/.test(durationValue))
```

**Casi validi secondo questa regex**:
- `""` (vuoto) ✅
- `"10"` ✅
- `"1+2"` ✅
- `"1 * 3"` ✅

**Casi NON validi (correttamente identificati)**:
- `"Istantaneo"` ❌
- `"1 ora"` ❌
- `"Permanente"` ❌

**Potenziali problemi**:
- Valori come `"0000"` o `"+++++"` passano la validazione ma potrebbero causare problemi
- Non valida se il valore è un numero valido o se è solo spazzatura

---

### 5. ℹ️ **Compendi Hardcoded** (Design)
**Problema**: I nomi dei compendi sono hardcoded.

**Linea 383-387**:
```javascript
const criticalPacks = [
  'brancalonia-bigat.equipaggiamento-scadente',
  'brancalonia-bigat.equipaggiamento',
  'brancalonia-bigat.brancalonia-features'
];
```

**Effetto**: Se i nomi dei compendi cambiano o ne vengono aggiunti di nuovi, il validatore non li controlla.

---

## ✅ Cosa Funziona Bene

### 1. ✅ Hook `ready` - Validazione Completa
**Linea 43-46**: Validazione di tutti i dati al caricamento completo.
```javascript
Hooks.once('ready', () => {
  logger.info('BrancaloniaDataValidator', 'Eseguendo correzione validazione completa al ready');
  this._validateAndFixAllData();
});
```

**Metodi chiamati**:
- `_validateAllActors()` ✅ Funziona correttamente
- `_validateAllCompendiums()` ✅ Funziona correttamente (versione async)

### 2. ✅ Hook `createActor` / `updateActor`
**Linea 49-58**: Validazione automatica su nuovi/aggiornati attori.
```javascript
Hooks.on('createActor', (actor) => {
  this._validateActorData(actor);
});

Hooks.on('updateActor', (actor, changes) => {
  if (changes.system?.activities) {
    this._validateActorActivities(actor);
  }
});
```

### 3. ✅ Metodi di Validazione Async
Tutti i metodi async funzionano correttamente:
- `_validateAndFixAllData()` ✅
- `_validateAllActors()` ✅
- `_validateAllCompendiums()` ✅
- `_validateActorData()` ✅
- `_validateActorActivities()` ✅
- `_validateActorItems()` ✅
- `_validateItemActivities()` ✅
- `_validateCompendiumItems()` ✅
- `_validateCompendiumItemActivities()` ✅

### 4. ✅ API Pubblica
**Linea 470-528**: Metodi pubblici per verifiche manuali.
```javascript
BrancaloniaDataValidator.checkForValidationIssues() // ✅ Funziona
BrancaloniaDataValidator.fixAllValidationIssues()   // ✅ Funziona
```

---

## 🛠️ Soluzioni Proposte

### Fix 1: Rimuovere Hook `init` Duplicato
**Problema**: Doppia esecuzione di `_fixValidationErrors()`.

**Soluzione**: Rimuovere l'hook dentro `_registerHooks()` e mantenere solo quello globale.

---

### Fix 2: Correggere `_fixCompendiumValidationIssues()`
**Problema**: Uso sincrono di metodo async.

**Soluzione**: Rendere il metodo async o rimuoverlo (la validazione completa avviene comunque in `ready`).

---

### Fix 3: Implementare o Rimuovere Stub
**Problema**: Metodi stub non fanno nulla ma fingono di funzionare.

**Soluzioni**:
- **Opzione A**: Rimuovere `_fixValidationErrors()` e i suoi stub (la validazione completa in `ready` è sufficiente)
- **Opzione B**: Implementare realmente i metodi stub

---

### Fix 4: Migliorare Validazione Regex
**Problema**: Regex troppo permissiva.

**Soluzione**: Aggiungere validazione aggiuntiva per verificare che il valore sia un numero valido o vuoto.

```javascript
static _isValidDurationValue(value) {
  // Vuoto è valido
  if (value === '' || value === null || value === undefined) return true;
  
  // Solo numeri e operatori matematici
  if (!/^[0-9+\-*/%\s]*$/.test(value)) return false;
  
  // Verifica che non sia solo operatori
  if (/^[+\-*/%\s]+$/.test(value)) return false;
  
  // Valido
  return true;
}
```

---

### Fix 5: Compendi Dinamici
**Problema**: Compendi hardcoded.

**Soluzione**: Validare TUTTI i compendi del modulo.

```javascript
const packs = game.packs.filter(p => 
  p.metadata.packageName === 'brancalonia-bigat' && 
  p.metadata.type === 'Item'
);
```

---

## 📊 Priorità Correzioni

| # | Fix | Priorità | Impatto |
|---|-----|----------|---------|
| 1 | Hook duplicato | 🔴 ALTA | Doppia esecuzione inutile |
| 2 | Stub non implementati | 🟠 MEDIA | Confondono il codice |
| 3 | `_fixCompendiumValidationIssues()` async | 🟡 BASSA | Non funziona ma c'è fallback in `ready` |
| 4 | Validazione regex | 🟡 BASSA | Casi edge rari |
| 5 | Compendi hardcoded | 🟢 OPZIONALE | Funziona per uso corrente |

---

## 🎯 Raccomandazioni

### Opzione A: **Fix Minimale** (Raccomandato)
1. ✅ Rimuovere hook `init` duplicato
2. ✅ Rimuovere metodo `_fixCompendiumValidationIssues()` (non funziona)
3. ✅ Rimuovere metodo `_fixValidationErrors()` e suoi stub
4. ✅ Mantenere solo validazione completa in `ready`

**Vantaggi**:
- Codice più pulito
- Nessuna doppia esecuzione
- Funzionalità invariata (la validazione in `ready` funziona già bene)

### Opzione B: **Fix Completo**
1. ✅ Opzione A
2. ✅ Migliorare validazione regex
3. ✅ Rendere compendi dinamici
4. ✅ Aggiungere statistiche di correzione

**Vantaggi**:
- Sistema più robusto
- Gestione migliore dei casi edge
- Più flessibile per futuri compendi

---

## 📈 Statistiche Modulo

| Metrica | Valore |
|---------|--------|
| **Righe Totali** | 595 |
| **Hook Registrati** | 6 (2 duplicati) |
| **Metodi Totali** | 22 |
| **Metodi Funzionanti** | 17 |
| **Metodi Stub** | 3 |
| **Metodi Async** | 10 |
| **Bug Critici** | 1 |
| **Bug Minori** | 2 |
| **Design Issues** | 2 |

---

## ✅ Conclusione

Il **Data Validator** è un modulo UTILE che risolve un problema reale (errori di validazione durata), ma ha alcuni problemi implementativi:

✅ **Funziona**: La validazione in `ready` è completa e corretta  
⚠️ **Problemi**: Hook duplicato + stub non implementati + logica sincrona errata  
🎯 **Soluzione**: Fix minimale pulisce il codice senza perdere funzionalità  

**Il modulo FA IL SUO LAVORO ma può essere migliorato rimuovendo codice morto.**

---

**Vuoi che proceda con le correzioni?**
- **A**: Fix Minimale (pulisci codice morto)
- **B**: Fix Completo (migliora validazione)
- **C**: Lascia così (funziona comunque)
- **D**: Analizza altro modulo



