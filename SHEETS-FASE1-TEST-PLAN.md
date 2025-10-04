# 🧪 Test Plan - Fase 1 Completata (67%)

**Data**: 2025-10-03  
**File**: `brancalonia-sheets.js` v2.0.0  
**Status**: ✅ Pronto per test

---

## 📊 Modifiche Implementate

### ✅ Completato (67%)

| Componente | Status | Dettagli |
|------------|--------|----------|
| **Import logger** | ✅ | Line 18 |
| **VERSION/MODULE_NAME** | ✅ | Lines 21-22 |
| **Statistics object** | ✅ | Lines 24-42 |
| **Event history** | ✅ | Lines 44-45 |
| **_registerSettings()** | ✅ | Lines 86-176 (10 settings) |
| **Hook renderActorSheet** | ✅ | Lines 178-222 (già attivo!) |
| **modifyCharacterSheet()** | ✅ | Lines 242-318 (con logger + events) |
| **5 Sezioni + logger** | ✅ | Lines 369-874 |
| **Console.log** | ✅ | 4 → 0 (rimossi tutti) |
| **Logger calls** | ✅ | 0 → 47 |
| **Linter errors** | ✅ | 0 |

### ⏳ Rimasti (33%)

| Componente | Status | Note |
|------------|--------|------|
| Dialog events | ⏳ | Opzionali (dialog già funzionanti) |
| Event listeners enhanced | ⏳ | Opzionali (listeners già attivi) |
| Helper methods | ⏳ | Da aggiungere in Fase 4 |
| API pubblica | ⏳ | Da aggiungere in Fase 4 |
| Macro automatiche | ⏳ | Da aggiungere in Fase 4 |

---

## 🧪 Test 1: Verifica Sintassi

### Test Locale (senza Foundry)

```bash
cd /Users/erik/Desktop/brancalonia-bigat-master

# Test 1: Verifica import
grep "import logger" modules/brancalonia-sheets.js
# Expected: import logger from './brancalonia-logger.js';

# Test 2: Verifica VERSION
grep "static VERSION" modules/brancalonia-sheets.js
# Expected: static VERSION = '2.0.0';

# Test 3: Conta logger calls
grep -c "logger\." modules/brancalonia-sheets.js
# Expected: 47

# Test 4: Verifica console.log rimossi
grep -c "console\." modules/brancalonia-sheets.js
# Expected: 0

# Test 5: Verifica settings registrate
grep -c "game.settings.register" modules/brancalonia-sheets.js
# Expected: 10
```

**Esegui ora**:

```bash
# Quick test
cd /Users/erik/Desktop/brancalonia-bigat-master
echo "=== Test Sintassi ===" && \
grep -q "import logger" modules/brancalonia-sheets.js && echo "✅ Import OK" || echo "❌ Import FAIL" && \
grep -q "static VERSION = '2.0.0'" modules/brancalonia-sheets.js && echo "✅ VERSION OK" || echo "❌ VERSION FAIL" && \
[ $(grep -c "logger\." modules/brancalonia-sheets.js) -eq 47 ] && echo "✅ Logger calls: 47" || echo "⚠️ Logger calls: $(grep -c "logger\." modules/brancalonia-sheets.js)" && \
[ $(grep -c "console\." modules/brancalonia-sheets.js) -eq 0 ] && echo "✅ Console.log: 0" || echo "❌ Console.log: $(grep -c "console\." modules/brancalonia-sheets.js)" && \
echo "=== Test Completato ==="
```

---

## 🧪 Test 2: Verifica Foundry VTT (Manuale)

### Prerequisiti

1. ✅ Foundry VTT running
2. ✅ Mondo Brancalonia aperto
3. ✅ Console F12 aperta
4. ✅ Modulo brancalonia-bigat attivo

### Test 2.1: Verifica Caricamento Modulo

**In console Foundry**:

```javascript
// Test 1: Verifica BrancaloniaSheets esiste
console.log('BrancaloniaSheets:', typeof BrancaloniaSheets);
// Expected: "function"

// Test 2: Verifica VERSION
console.log('Version:', BrancaloniaSheets.VERSION);
// Expected: "2.0.0"

// Test 3: Verifica statistics
console.log('Statistics:', BrancaloniaSheets.statistics);
// Expected: Object with totalRenders, sectionsByType, etc.

// Test 4: Verifica logger
console.log('Logger available:', typeof logger);
// Expected: "object"
```

**Expected Output**:
```
BrancaloniaSheets: function
Version: 2.0.0
Statistics: {totalRenders: 0, sectionsByType: {...}, ...}
Logger available: object
```

### Test 2.2: Verifica Settings

**In console Foundry**:

```javascript
// Test settings registrate
const settings = [
  'enableBrancaloniaSheets',
  'sheetsShowInfamia',
  'sheetsShowCompagnia',
  'sheetsShowLavori',
  'sheetsShowRifugio',
  'sheetsShowMalefatte',
  'sheetsDecorativeElements',
  'sheetsItalianTranslations',
  'sheetsDelayAfterCarolingian',
  'debugBrancaloniaSheets'
];

console.log('=== Settings Test ===');
settings.forEach(key => {
  try {
    const value = game.settings.get('brancalonia-bigat', key);
    console.log(`✅ ${key}:`, value);
  } catch (error) {
    console.error(`❌ ${key}: NOT FOUND`);
  }
});
```

**Expected Output**:
```
✅ enableBrancaloniaSheets: true
✅ sheetsShowInfamia: true
✅ sheetsShowCompagnia: true
✅ sheetsShowLavori: true
✅ sheetsShowRifugio: true
✅ sheetsShowMalefatte: true
✅ sheetsDecorativeElements: true
✅ sheetsItalianTranslations: true
✅ sheetsDelayAfterCarolingian: 100
✅ debugBrancaloniaSheets: false
```

### Test 2.3: Verifica Hook Registrato

**In console Foundry**:

```javascript
// Test 1: Verifica hook renderActorSheet registrato
const hooks = Hooks._hooks['renderActorSheet'];
console.log('Hook renderActorSheet registrato:', hooks?.length || 0, 'volte');
// Expected: >= 1

// Test 2: Trova hook Brancalonia
const brancaloniaHooks = hooks?.filter(h => 
  h.fn.toString().includes('modifyCharacterSheet') || 
  h.fn.toString().includes('Brancalonia')
);
console.log('Hook Brancalonia trovati:', brancaloniaHooks?.length || 0);
// Expected: >= 1

// Test 3: Verifica Carolingian UI
console.log('Carolingian UI attivo:', !!window.brancaloniaSettings?.SheetsUtil);
// Expected: true o false (dipende da setup)
```

**Expected Output**:
```
Hook renderActorSheet registrato: 2-3 volte (dipende da altri moduli)
Hook Brancalonia trovati: 1+
Carolingian UI attivo: true/false
```

### Test 2.4: Verifica Event Listener

**In console Foundry**:

```javascript
// Test ascolto evento sheets:initialized
logger.events.on('sheets:initialized', (data) => {
  console.log('🎉 Event sheets:initialized ricevuto:', data);
});

// Test ascolto evento sheets:sheet-rendered
logger.events.on('sheets:sheet-rendered', (data) => {
  console.log('🎨 Sheet renderizzata:', data.actorName, 'in', data.renderTime, 'ms');
});

console.log('✅ Event listeners configurati. Aspettando eventi...');
```

**Expected Output**:
```
✅ Event listeners configurati. Aspettando eventi...
```

---

## 🧪 Test 3: Test Rendering Sheet (CRITICO)

### Test 3.1: Apri Sheet Personaggio

**Steps**:

1. Trova un personaggio di test:
```javascript
const testActor = game.actors.find(a => a.type === 'character');
console.log('Test actor:', testActor?.name);
```

2. Attiva debug:
```javascript
await game.settings.set('brancalonia-bigat', 'debugBrancaloniaSheets', true);
console.log('✅ Debug abilitato');
```

3. Apri sheet:
```javascript
if (testActor) {
  testActor.sheet.render(true);
  console.log('✅ Sheet aperta, controlla console per log...');
}
```

### Expected Output nella Console

Dovresti vedere questa sequenza di log:

```
[Sheets] Inizializzazione modifiche sheet personaggi...
[Sheets] Settings registrate {count: 10, features: 5}
[Sheets] Registrazione modifiche sheet...
[Sheets] Hook renderActorSheet registrato con successo
[Sheets] Sistema inizializzato in X.XXms {features: Array(5), carolingianUI: true/false}

// Quando apri sheet:
[Sheets] Attendendo 100ms per Carolingian UI...
[Sheets] Rendering sheet per [Nome Personaggio]
[Sheets] Sezione Infamia aggiunta in X.XXms
[Sheets] Sezione Compagnia aggiunta in X.XXms
[Sheets] Sezione Lavori Sporchi aggiunta in X.XXms
[Sheets] Sezione Rifugio aggiunta in X.XXms
[Sheets] Sezione Malefatte aggiunta in X.XXms
[Sheets] Sheet [Nome Personaggio] renderizzata in XX.XXms

🎨 Sheet renderizzata: [Nome Personaggio] in XX.XX ms
```

### Test 3.2: Verifica Sezioni Renderizzate

**Con sheet aperta, esegui**:

```javascript
// Test presenza sezioni
const sheetElement = document.querySelector('.brancalonia-character-sheet');
console.log('Sheet Brancalonia:', !!sheetElement);

const sections = {
  infamia: !!document.querySelector('.infamia-tracker'),
  compagnia: !!document.querySelector('.compagnia-section'),
  lavori: !!document.querySelector('.lavori-sporchi-section'),
  rifugio: !!document.querySelector('.rifugio-section'),
  malefatte: !!document.querySelector('.malefatte-section')
};

console.log('=== Sezioni Renderizzate ===');
Object.entries(sections).forEach(([name, present]) => {
  console.log(`${present ? '✅' : '❌'} ${name}`);
});

const totalSections = Object.values(sections).filter(Boolean).length;
console.log(`\nTotale: ${totalSections}/5 sezioni renderizzate`);
```

**Expected Output**:
```
=== Sezioni Renderizzate ===
✅ infamia
✅ compagnia
✅ lavori
✅ rifugio
✅ malefatte

Totale: 5/5 sezioni renderizzate
```

### Test 3.3: Verifica Statistics

**Dopo aver aperto almeno una sheet**:

```javascript
const stats = BrancaloniaSheets.statistics;

console.log('=== Statistics ===');
console.log('Total Renders:', stats.totalRenders);
console.log('Avg Render Time:', stats.avgRenderTime.toFixed(2), 'ms');
console.log('Last Render:', new Date(stats.lastRenderTime).toLocaleTimeString());
console.log('Sections Added:', stats.sectionsByType);
console.log('Init Time:', stats.initTime?.toFixed(2), 'ms');
console.log('Errors:', stats.errors.length);

// Target: totalRenders >= 1, avgRenderTime < 200ms
console.assert(stats.totalRenders >= 1, '❌ Nessuna render effettuata!');
console.assert(stats.avgRenderTime < 200, `⚠️ Render time troppo alto: ${stats.avgRenderTime}ms`);
```

**Expected Output**:
```
=== Statistics ===
Total Renders: 1+
Avg Render Time: 50-150 ms
Last Render: [time]
Sections Added: {infamia: 1, compagnia: 1, lavori: 1, rifugio: 1, malefatte: 1}
Init Time: 5-15 ms
Errors: 0
```

---

## 🧪 Test 4: Test Performance

### Performance Test Script

```javascript
async function testSheetsPerformance() {
  console.log('🚀 Starting performance test...');
  
  const testActor = game.actors.find(a => a.type === 'character');
  if (!testActor) {
    console.error('❌ No test actor found!');
    return;
  }
  
  // Reset statistics
  BrancaloniaSheets.statistics.totalRenders = 0;
  BrancaloniaSheets.statistics.avgRenderTime = 0;
  
  // Test 5 renders
  const times = [];
  for (let i = 0; i < 5; i++) {
    const startTime = performance.now();
    
    await testActor.sheet.close();
    await testActor.sheet.render(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const endTime = performance.now();
    times.push(endTime - startTime);
    
    console.log(`Render ${i + 1}/5: ${(endTime - startTime).toFixed(2)}ms`);
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  console.log('\n=== Performance Test Results ===');
  console.log(`Average: ${avgTime.toFixed(2)}ms`);
  console.log(`Min: ${minTime.toFixed(2)}ms`);
  console.log(`Max: ${maxTime.toFixed(2)}ms`);
  console.log(`Target: < 200ms`);
  console.log(avgTime < 200 ? '✅ PASS' : '❌ FAIL');
}

// Run test
testSheetsPerformance();
```

**Expected Output**:
```
🚀 Starting performance test...
Render 1/5: 120.45ms
Render 2/5: 95.32ms
Render 3/5: 102.18ms
Render 4/5: 88.76ms
Render 5/5: 91.23ms

=== Performance Test Results ===
Average: 99.59ms
Min: 88.76ms
Max: 120.45ms
Target: < 200ms
✅ PASS
```

---

## 🧪 Test 5: Test Carolingian UI Compatibility

### Compatibility Test

```javascript
async function testCarolingianUICompatibility() {
  console.log('🎨 Testing Carolingian UI compatibility...');
  
  const carolingianActive = !!window.brancaloniaSettings?.SheetsUtil;
  console.log('Carolingian UI Active:', carolingianActive);
  
  const delay = game.settings.get('brancalonia-bigat', 'sheetsDelayAfterCarolingian');
  console.log('Configured Delay:', delay, 'ms');
  
  // Test with delay variations
  const delays = [0, 50, 100, 150, 200];
  
  for (const testDelay of delays) {
    await game.settings.set('brancalonia-bigat', 'sheetsDelayAfterCarolingian', testDelay);
    
    const testActor = game.actors.find(a => a.type === 'character');
    await testActor.sheet.close();
    
    const startTime = performance.now();
    await testActor.sheet.render(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    const endTime = performance.now();
    
    console.log(`Delay ${testDelay}ms: Render took ${(endTime - startTime).toFixed(2)}ms`);
    
    // Verifica sezioni presenti
    const sectionsPresent = document.querySelector('.infamia-tracker') !== null;
    console.log(`  Sections present: ${sectionsPresent ? '✅' : '❌'}`);
  }
  
  // Restore default
  await game.settings.set('brancalonia-bigat', 'sheetsDelayAfterCarolingian', 100);
  console.log('\n✅ Compatibility test complete');
}

// Run test
testCarolingianUICompatibility();
```

---

## ✅ Checklist Risultati Attesi

### Test Locale (Bash)
- [ ] Import logger trovato
- [ ] VERSION = '2.0.0'
- [ ] 47 logger calls
- [ ] 0 console.log
- [ ] 0 linter errors

### Test Foundry (Console)
- [ ] BrancaloniaSheets.VERSION === '2.0.0'
- [ ] 10 settings registrate e accessibili
- [ ] Hook renderActorSheet registrato
- [ ] Eventi sheets:initialized e sheets:sheet-rendered emessi
- [ ] 5 sezioni renderizzate correttamente
- [ ] Statistics tracked (totalRenders, avgRenderTime)
- [ ] avgRenderTime < 200ms
- [ ] 0 errors in statistics.errors

### Test Visivi (Sheet Aperta)
- [ ] Sezione Infamia visibile
- [ ] Sezione Compagnia visibile
- [ ] Sezione Lavori Sporchi visibile
- [ ] Sezione Rifugio visibile
- [ ] Sezione Malefatte visibile
- [ ] Theme Carolingian UI applicato (se attivo)
- [ ] Nessun errore console

---

## 🐛 Troubleshooting

### Problema: "logger is not defined"

**Soluzione**:
```javascript
// Verifica che brancalonia-logger.js sia caricato prima
console.log('Logger disponibile:', typeof logger);

// Se undefined, verifica module.json
// brancalonia-logger.js deve essere caricato prima di brancalonia-sheets.js
```

### Problema: Settings non trovate

**Soluzione**:
```javascript
// Ricarica mondo per forzare re-registrazione settings
location.reload();
```

### Problema: Hook non triggerato

**Soluzione**:
```javascript
// Verifica che enableBrancaloniaSheets sia true
const enabled = game.settings.get('brancalonia-bigat', 'enableBrancaloniaSheets');
console.log('Sheets enabled:', enabled);

if (!enabled) {
  await game.settings.set('brancalonia-bigat', 'enableBrancaloniaSheets', true);
  location.reload();
}
```

### Problema: Sezioni non renderizzate

**Soluzione**:
```javascript
// Verifica settings per ogni sezione
['sheetsShowInfamia', 'sheetsShowCompagnia', 'sheetsShowLavori', 'sheetsShowRifugio', 'sheetsShowMalefatte'].forEach(key => {
  const value = game.settings.get('brancalonia-bigat', key);
  if (!value) {
    console.warn(`⚠️ ${key} è disabilitato!`);
  }
});
```

---

## 📊 Report Finale

**Dopo tutti i test, genera report**:

```javascript
function generateTestReport() {
  const stats = BrancaloniaSheets.statistics;
  
  const report = {
    version: BrancaloniaSheets.VERSION,
    totalRenders: stats.totalRenders,
    avgRenderTime: stats.avgRenderTime,
    sectionsRendered: Object.values(stats.sectionsByType).reduce((a, b) => a + b, 0),
    errorsCount: stats.errors.length,
    settingsCount: 10, // hardcoded
    loggerCalls: 47, // hardcoded from grep
    carolingianUIActive: !!window.brancaloniaSettings?.SheetsUtil,
    timestamp: new Date().toISOString()
  };
  
  console.log('\n=== 📊 TEST REPORT ===');
  console.log(JSON.stringify(report, null, 2));
  
  // Copy to clipboard
  copy(JSON.stringify(report, null, 2));
  console.log('\n✅ Report copiato in clipboard!');
  
  return report;
}

// Generate report
const report = generateTestReport();
```

---

## 🎯 Next Steps

**Se tutti i test passano** ✅:
- Procedi con **Fase 2** (già implementata - hook attivo!)
- Salta a **Fase 3** (Test rendering completo)
- O vai a **Fase 4** (Polish - API + Macro)

**Se ci sono problemi** ❌:
- Analizza log console
- Verifica statistics.errors
- Debug con debugBrancaloniaSheets: true

---

**Pronto per testare!** 🚀


