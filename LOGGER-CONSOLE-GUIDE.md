# 🖥️ Logger v2 - Guida Rapida Console

Apri la Console (F12) in Foundry VTT e usa questi comandi:

---

## 📊 Comandi Base

### 1. Help
```javascript
BrancaloniaLogger.help()
```
Mostra tutti i comandi disponibili con esempi

### 2. Statistiche
```javascript
BrancaloniaLogger.stats()
```
Mostra tabella completa con:
- Uptime
- Log totali per livello
- Log per modulo
- Performance marks attivi
- Dimensione history
- Memoria occupata

### 3. History
```javascript
// Ultimi 10 log
BrancaloniaLogger.history({ limit: 10 })

// Solo errori
BrancaloniaLogger.history({ level: 'ERROR' })

// Da modulo specifico
BrancaloniaLogger.history({ module: 'TavernBrawl' })

// Ultime 24 ore
BrancaloniaLogger.history({ 
  since: Date.now() - 86400000 
})

// Combinati
BrancaloniaLogger.history({
  level: 'ERROR',
  module: 'CursedRelics',
  limit: 5
})
```

### 4. Export Log
```javascript
// Esporta tutto
BrancaloniaLogger.export()

// Esporta filtrato
BrancaloniaLogger.export({
  level: 'ERROR',
  module: 'MyModule',
  since: Date.now() - 3600000 // Ultima ora
})
```

### 5. Clear History
```javascript
BrancaloniaLogger.clear()
```

### 6. Test Diagnostico
```javascript
BrancaloniaLogger.test()
```
Verifica:
- Sinks funzionanti
- LocalStorage accessibile
- Memory usage
- Performance marks
- Logging funzionale

### 7. Cambia Log Level
```javascript
// Livelli: ERROR, WARN, INFO, DEBUG, TRACE
BrancaloniaLogger.setLevel('DEBUG')
```

---

## 🔔 Monitoring Realtime

### Monitora Tutti i Log
```javascript
BrancaloniaLogger.on('log', (entry) => {
  console.log(`[${entry.level}] ${entry.module}: ${entry.message}`);
});
```

### Monitora Solo Errori
```javascript
BrancaloniaLogger.on('log:error', (entry) => {
  console.error('🚨 ERRORE:', entry);
  // Aggiungi notifica, alert, etc
});
```

### Monitora Modulo Specifico
```javascript
BrancaloniaLogger.on('log', (entry) => {
  if (entry.module === 'TavernBrawl') {
    console.log('TavernBrawl:', entry);
  }
});
```

### Rimuovi Listener
```javascript
const myListener = (entry) => console.log(entry);

// Aggiungi
BrancaloniaLogger.on('log:error', myListener);

// Rimuovi
BrancaloniaLogger.off('log:error', myListener);
```

---

## 📈 Statistiche Avanzate

### Stats Completi (Object)
```javascript
const stats = BrancaloniaLogger.getStats();
console.table(stats.byLevel);
console.table(stats.byModule);

// Trova modulo con più log
const topModule = Object.entries(stats.byModule)
  .sort((a, b) => b[1] - a[1])[0];
console.log('Top module:', topModule[0], topModule[1], 'logs');
```

### Memory Check
```javascript
const stats = BrancaloniaLogger.getStats();
const sizeKB = (stats.memoryUsage / 1024).toFixed(2);
console.log(`Memory: ${sizeKB} KB`);

if (stats.memoryUsage > 512 * 1024) {
  console.warn('⚠️ Memory alta, considera clear()');
}
```

---

## 🔍 Debug Workflow

### Scenario: Debug Errori Recenti
```javascript
// 1. Vedi ultimi errori
BrancaloniaLogger.history({ level: 'ERROR', limit: 10 })

// 2. Esportali per analisi
BrancaloniaLogger.export({ level: 'ERROR' })

// 3. Abilita DEBUG per più dettagli
BrancaloniaLogger.setLevel('DEBUG')

// 4. Monitora in realtime
BrancaloniaLogger.on('log:error', e => console.error(e))
```

### Scenario: Performance Audit
```javascript
// 1. Vedi stats
BrancaloniaLogger.stats()

// 2. Identifica moduli pesanti
const stats = BrancaloniaLogger.getStats();
Object.entries(stats.byModule)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .forEach(([mod, count]) => {
    console.log(`${mod}: ${count} logs`);
  });

// 3. Esporta log di modulo specifico
BrancaloniaLogger.export({ module: 'HeavyModule' })
```

### Scenario: Session Recording
```javascript
// All'inizio sessione
const sessionStart = Date.now();

// ... gioca ...

// Alla fine, esporta tutta la sessione
BrancaloniaLogger.export({ 
  since: sessionStart,
  level: 'INFO' // O 'DEBUG' per più dettagli
})
```

---

## 💡 Tips & Tricks

### Auto-Export su Errori
```javascript
let errorCount = 0;
BrancaloniaLogger.on('log:error', () => {
  errorCount++;
  if (errorCount >= 5) {
    console.warn('⚠️ 5 errori rilevati, auto-export...');
    BrancaloniaLogger.export({ 
      level: 'ERROR',
      since: Date.now() - 600000 // Ultimi 10 min
    });
    errorCount = 0;
  }
});
```

### Performance Alert
```javascript
BrancaloniaLogger.on('log', (entry) => {
  if (entry.module === 'Performance') {
    const match = entry.message.match(/took ([\d.]+)ms/);
    if (match && parseFloat(match[1]) > 1000) {
      console.warn(`⚠️ Operazione lenta: ${entry.message}`);
    }
  }
});
```

### Daily Cleanup
```javascript
// Imposta cleanup giornaliero
const lastCleanup = localStorage.getItem('lastLogCleanup');
const now = Date.now();

if (!lastCleanup || (now - parseInt(lastCleanup)) > 86400000) {
  console.log('🧹 Cleanup giornaliero log...');
  BrancaloniaLogger.clear();
  localStorage.setItem('lastLogCleanup', now.toString());
}
```

---

## 🚨 Quick Troubleshooting

### Logger Non Risponde
```javascript
// 1. Test
BrancaloniaLogger.test()

// 2. Verifica level
console.log('Current level:', logger.logLevel);

// 3. Prova log diretto
logger.info('Test', 'Direct test');
```

### History Vuota
```javascript
// Verifica localStorage
const sink = logger.getSink('localStorage');
console.log('History size:', sink._getHistory().length);

// Se vuoto ma hai loggato, verifica level minimo
console.log('LocalStorage min level:', sink.minLevel);
// (Solo WARN e ERROR vengono salvati di default)
```

### Memory Alta
```javascript
// 1. Check size
const stats = BrancaloniaLogger.getStats();
console.log('Memory:', (stats.memoryUsage / 1024).toFixed(2), 'KB');

// 2. Clear
BrancaloniaLogger.clear();

// 3. Verifica
console.log('After clear:', logger.getSink('localStorage')._getHistory().length);
```

---

## 📝 Esempi Reali

### Esempio 1: Trova Causa Lag
```javascript
// Cerca operazioni lente nelle ultime 5 minuti
const logs = BrancaloniaLogger.history({
  module: 'Performance',
  since: Date.now() - 300000
});

const slow = logs.filter(log => 
  log.message.includes('took') && 
  parseFloat(log.message.match(/[\d.]+/)[0]) > 500
);

console.table(slow);
```

### Esempio 2: Audit Modulo
```javascript
// Quanti log ha fatto un modulo?
const stats = BrancaloniaLogger.getStats();
const moduleName = 'TavernBrawl';
const count = stats.byModule[moduleName] || 0;

console.log(`${moduleName}: ${count} logs`);

// Dettagli
const moduleLogs = BrancaloniaLogger.history({ module: moduleName });
const byLevel = {};
moduleLogs.forEach(log => {
  byLevel[log.level] = (byLevel[log.level] || 0) + 1;
});

console.table(byLevel);
```

### Esempio 3: Export per Bug Report
```javascript
// Export ultimi errori con context
const errors = BrancaloniaLogger.history({ 
  level: 'ERROR',
  limit: 20
});

const report = {
  timestamp: new Date().toISOString(),
  errors: errors,
  stats: BrancaloniaLogger.getStats(),
  config: {
    logLevel: logger.logLevel,
    sinks: logger.sinks.map(s => s.name)
  }
};

console.log('Bug report:', JSON.stringify(report, null, 2));
// Copia output e allega a GitHub issue
```

---

## ⚙️ Configurazione Avanzata

### Disabilita Sink
```javascript
const sink = logger.getSink('localStorage');
sink.enabled = false;
// Ora i log non vengono più salvati in localStorage
```

### Cambia Min Level di Sink
```javascript
const consoleSink = logger.getSink('console');
consoleSink.minLevel = 1; // Solo WARN+ sulla console
```

### Reset Completo
```javascript
// 1. Clear history
BrancaloniaLogger.clear();

// 2. Reset stats
logger.resetStatistics();

// 3. Clear performance marks
logger.clearPerformanceMarks();

// 4. Verifica
BrancaloniaLogger.test();
```

---

**Pro Tip**: Salva i comandi più usati come snippet nel browser dev tools per accesso rapido! 🚀


