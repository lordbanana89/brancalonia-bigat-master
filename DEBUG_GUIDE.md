# Guida Debug e Testing - Brancalonia Module

## 🚀 Nuovi Strumenti Implementati

### 1. Sistema di Logging Avanzato (`modules/brancalonia-logger.js`)

Un sistema di logging centralizzato con livelli configurabili, colori e performance monitoring.

#### Utilizzo in Console

```javascript
// Accesso al logger globale
BrancaloniaLogger.setLogLevel('DEBUG');  // Imposta il livello di log

// Metodi di logging
BrancaloniaLogger.error('ModuleName', 'Error message', data);
BrancaloniaLogger.warn('ModuleName', 'Warning message');
BrancaloniaLogger.info('ModuleName', 'Info message');
BrancaloniaLogger.debug('ModuleName', 'Debug message');
BrancaloniaLogger.trace('ModuleName', 'Trace message');

// Performance monitoring
BrancaloniaLogger.startPerformance('operation-name');
// ... codice da misurare ...
BrancaloniaLogger.endPerformance('operation-name');

// Export log history
BrancaloniaLogger.exportLogs();  // Scarica JSON con history

// Clear log history
BrancaloniaLogger.clearHistory();
```

#### Livelli di Log
- 0: ERROR - Solo errori critici
- 1: WARN - Avvisi ed errori
- 2: INFO - Informazioni generali (default)
- 3: DEBUG - Debug dettagliato
- 4: TRACE - Tutto

### 2. Module Loader Ottimizzato (`modules/brancalonia-module-loader.js`)

Sistema di caricamento moduli con gestione dipendenze, priorità e lazy loading.

#### Features
- Caricamento per priorità
- Gestione dipendenze automatica
- Lazy loading per moduli non critici
- Report di caricamento dettagliato
- Gestione errori robusta

### 3. Performance Monitor (`modules/brancalonia-performance-monitor.js`)

Monitoraggio real-time delle performance del modulo.

#### Comandi Console

```javascript
// Comandi disponibili dopo il caricamento
brancaloniaPerf.report()     // Report completo metriche
brancaloniaPerf.slow()       // Operazioni lente
brancaloniaPerf.memory()     // Utilizzo memoria
brancaloniaPerf.summary()    // Summary in console
brancaloniaPerf.clear()      // Pulisci metriche
brancaloniaPerf.export()     // Export JSON dettagliato
```

#### Cosa Monitora
- Esecuzione hooks
- Rendering operations
- Network requests
- Memory usage e leak detection
- Operazioni DOM

## 🧪 Testing con Vitest

### Eseguire i Test

```bash
# Esegui tutti i test
npm test

# Test con UI interattiva
npm run test:ui

# Test con coverage
npm run test:coverage

# Test in watch mode (rilancia automaticamente)
npm run test:watch
```

### Struttura Test
- `tests/setup.js` - Configurazione ambiente test con mock Foundry
- `tests/modules/` - Test per singoli moduli
- Coverage report in `coverage/` dopo `npm run test:coverage`

### Scrivere Nuovi Test

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ModuleName', () => {
  beforeEach(() => {
    // Setup prima di ogni test
  });

  it('should do something', () => {
    // Test logic
    expect(result).toBe(expected);
  });
});
```

## 🔍 Linting con ESLint

### Comandi

```bash
# Controlla errori di codice
npm run lint

# Fix automatico errori
npm run lint:fix
```

### Configurazione
- File: `eslint.config.js`
- Regole per Foundry VTT globals
- Stile codice consistente
- Best practices JavaScript moderno

## 📊 Script di Verifica

### Verifica Integrità Packs

```bash
node scripts/verify-all-packs.cjs
```

Controlla:
- Struttura directory corretta
- Presenza file necessari
- Match tra source e database
- Documenti con _key valido

### Compilazione Packs

```bash
node scripts/fix-compile-packs.cjs
```

Ricompila tutti i packs da source JSON.

## 🐛 Workflow di Debug

### 1. Identificare il Problema

```javascript
// Imposta logging dettagliato
BrancaloniaLogger.setLogLevel('DEBUG');

// Monitora performance
brancaloniaPerf.summary();
```

### 2. Isolare il Modulo

```javascript
// Check status modulo specifico
const loader = window.moduleLoader;  // Se esposto
loader.getModuleStatus('module-name');

// Ricarica modulo
loader.reloadModule('module-name');
```

### 3. Analizzare Performance

```javascript
// Identifica operazioni lente
brancaloniaPerf.slow();

// Export per analisi dettagliata
brancaloniaPerf.export();
```

### 4. Memory Leaks

```javascript
// Monitor memoria nel tempo
brancaloniaPerf.memory();

// Il sistema avvisa automaticamente di potenziali leak
```

## 📝 Best Practices

### Logging

1. Usa il logger centralizzato invece di console.log
2. Scegli il livello appropriato (error, warn, info, debug)
3. Includi sempre il nome del modulo
4. Aggiungi dati contestuali quando utile

### Performance

1. Monitora operazioni critiche con startPerformance/endPerformance
2. Controlla regolarmente brancaloniaPerf.slow()
3. Ottimizza hooks che superano 50ms
4. Lazy load moduli non critici

### Testing

1. Scrivi test per nuove funzionalità
2. Esegui test prima di commit importanti
3. Mantieni coverage sopra 70%
4. Mock sempre le dipendenze Foundry

### Code Quality

1. Esegui `npm run lint` prima di commit
2. Usa `npm run lint:fix` per correzioni automatiche
3. Segui le convenzioni ESLint configurate
4. Documenta funzioni complesse

## 🔧 Troubleshooting

### Modulo non si carica

1. Check console per errori
2. Verifica `BrancaloniaLogger.exportLogs()`
3. Controlla dipendenze con module loader
4. Verifica compatibilità versione Foundry

### Performance degradata

1. Esegui `brancaloniaPerf.summary()`
2. Identifica bottleneck con `brancaloniaPerf.slow()`
3. Check memory leaks con `brancaloniaPerf.memory()`
4. Considera lazy loading per moduli pesanti

### Test falliscono

1. Verifica mock in `tests/setup.js`
2. Check dipendenze test con `npm list`
3. Esegui singolo test con `npm test -- path/to/test.js`
4. Debug con `npm run test:ui`

## 📚 Risorse

- [Vitest Documentation](https://vitest.dev/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Foundry VTT API](https://foundryvtt.com/api/)
- [Performance API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

## 🤝 Contribuire

1. Usa gli strumenti di debug e test
2. Segui le convenzioni di codice (ESLint)
3. Aggiungi test per nuove features
4. Documenta cambiamenti significativi
5. Monitora performance impact