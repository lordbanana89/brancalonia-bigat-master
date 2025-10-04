# 🏗️ Architettura Tecnica - Brancalonia

Questa sezione descrive l'architettura interna del modulo Brancalonia per sviluppatori.

## 📁 Struttura del Progetto

```
brancalonia-bigat/
├── 📂 core/                    # Sistema core e orchestrazione
│   └── BrancaloniaCore.js     # Classe principale di inizializzazione
├── 📂 modules/                # Moduli funzionali del gioco
│   ├── 🎮 sistemi/           # Sistemi di gioco principali
│   ├── 🎨 ui/                # Componenti interfaccia utente
│   ├── ⚙️ utilities/         # Utility e helper
│   └── 🔧 integrations/      # Integrazioni esterne
├── 📂 packs/                  # Compendi Foundry VTT
│   ├── _source/               # File JSON sorgente
│   └── [compendio].db         # Database LevelDB compilati
├── 📂 styles/                 # Fogli di stile CSS
├── 📂 assets/                 # Risorse grafiche e audio
├── 📂 lang/                   # File di localizzazione
└── 📂 docs/                   # Documentazione
```

## 🏛️ Architettura Modulare

### Core System
```javascript
// core/BrancaloniaCore.js
class BrancaloniaCore {
  static MODULE_DEPENDENCIES = {
    'brancalonia-logger': [],
    'brancalonia-module-loader': ['brancalonia-logger'],
    'reputation-infamia-unified': [],
    'haven-system': [],
    'compagnia-manager': ['reputation-infamia-unified'],
    // ... altre dipendenze
  };
}
```

### Sistema di Dipendenze
Il modulo utilizza un sistema di dipendenze gerarchico:

1. **Core Modules** - Logger, Loader, Compatibility
2. **System Modules** - Infamia, Compagnia, Haven, etc.
3. **Feature Modules** - Malattie, Duelli, Fazioni, etc.
4. **UI Modules** - Theme, Components, Settings

## 🔧 Moduli Principali

### Sistema Core
- **`BrancaloniaCore`**: Classe principale di orchestrazione
- **`BrancaloniaLogger`**: Sistema di logging centralizzato
- **`BrancaloniaModuleLoader`**: Caricamento dinamico moduli
- **`BrancaloniaCompatibilityFix`**: Fix compatibilità Foundry v13

### Sistemi di Gioco
- **`ReputationInfamiaUnified`**: Sistema unificato reputazione/infamia
- **`HavenSystem`**: Gestione rifugi e basi segrete
- **`DirtyJobsSystem`**: Sistema lavori sporchi e missioni
- **`MenagramoSystem`**: Sistema sfortuna e maledizioni
- **`DuelingSystem`**: Sistema duelli formali
- **`DiseasesSystem`**: Sistema malattie e contagi
- **`FactionsSystem`**: Sistema fazioni e reputazione

### Utility e Helper
- **`BrancaloniaActiveEffects`**: Gestione effetti attivi
- **`ChatCommands`**: Sistema comandi chat
- **`SettingsRegistration`**: Registrazione impostazioni
- **`GlobalErrorHandler`**: Gestione errori globale

## 🎮 Hook System

### Hook Registrati
Il modulo registra hook per:

```javascript
// Hook di Foundry VTT utilizzati
Hooks.on('init', BrancaloniaCore.init);
Hooks.on('ready', BrancaloniaCore.ready);
Hooks.on('createActor', handleActorCreation);
Hooks.on('updateActor', handleActorUpdate);
Hooks.on('renderActorSheet', renderActorSheet);
Hooks.on('renderChatMessage', handleChatMessage);
Hooks.on('renderSceneControls', addSceneControls);
```

### Hook Custom Brancalonia
```javascript
// Eventi custom del modulo
game.brancalonia.on('infamiaChanged', handleInfamiaChange);
game.brancalonia.on('havenUpgraded', handleHavenUpgrade);
game.brancalonia.on('duelStarted', handleDuelStart);
game.brancalonia.on('diseaseInfected', handleDiseaseInfection);
```

## 📚 Sistema Compendi

### Struttura Compendi
```javascript
// module.json - Definizione compendi
{
  "packs": [
    {
      "name": "razze",
      "label": "Stirpi di Brancalonia",
      "path": "packs/razze",
      "type": "Item",
      "system": "dnd5e"
    }
    // ... altri compendi
  ]
}
```

### Database Structure
- **`_source/`**: File JSON sorgente originali
- **`[nome].db`**: Database LevelDB compilato
- **`lost/`**: Documenti orfani o rimossi

## 🎨 Sistema Theme

### Architettura CSS
```css
/* styles/brancalonia-theme-system.css */
@layer system {
  /* Override Foundry core styles */
}

/* styles/brancalonia-theme-module.css */
@layer module {
  /* Brancalonia specific styles */
}
```

### Sistema Colori Dinamici
```javascript
// modules/brancalonia-theme.mjs
export class BrancaloniaTheme {
  static PRESETS = {
    taverna: { /* colori taverna */ },
    palazzo: { /* colori palazzo */ },
    cantina: { /* colori cantina */ },
    pergamena: { /* colori pergamena */ }
  };

  static applyPreset(presetName) {
    // Applica colori dinamicamente
  }
}
```

## ⚙️ Sistema Settings

### Registrazione Impostazioni
```javascript
// modules/settings-registration.js
export function registerBrancaloniaSettings() {
  game.settings.register(MODULE_ID, 'enableInfamia', {
    name: 'Abilita Sistema Infamia',
    hint: 'Attiva il sistema di reputazione e notorietà',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });
  // ... altre impostazioni
}
```

### Settings Manager
```javascript
// core/ConfigManager.js
class ConfigManager {
  static get(settingName) {
    return game.settings.get(MODULE_ID, settingName);
  }

  static set(settingName, value) {
    return game.settings.set(MODULE_ID, settingName, value);
  }
}
```

## 🔄 Active Effects System

### Registry Effects
```javascript
// modules/brancalonia-active-effects.js
class ActiveEffectsManager {
  static EFFECTS_REGISTRY = {
    'menagramo-minor': {
      key: 'flags.midi-qol.disadvantage.ability.check',
      mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
      value: '1'
    }
    // ... altri effetti
  };
}
```

### Runtime Application
```javascript
// Applicazione effetti a runtime
static applyEffectsToActor(actor, effectIds) {
  const effects = effectIds.map(id => this.EFFECTS_REGISTRY[id]);
  await actor.createEmbeddedDocuments('ActiveEffect', effects);
}
```

## 💬 Chat Commands System

### Registrazione Comandi
```javascript
// modules/chat-commands.js
export class ChatCommands {
  static registerCommands() {
    // Comando /infamia
    game.brancalonia.commands.register('infamia', this.handleInfamia);

    // Comando /haven
    game.brancalonia.commands.register('haven', this.handleHaven);
  }
}
```

## 🎲 Dice e Tiri

### Dice Theme Integration
```javascript
// modules/brancalonia-dice-theme.js
export class BrancaloniaDiceTheme {
  static DICE_FACES = {
    d20: {
      1: '☠️',  // Critico negativo
      20: '💎'  // Critico positivo
    }
  };
}
```

## 🔧 Error Handling

### Global Error Handler
```javascript
// modules/global-error-handler.js
export class GlobalErrorHandler {
  static handleError(error, context = '') {
    console.error(`[Brancalonia] Error in ${context}:`, error);

    // Log dettagliato
    BrancaloniaLogger.error('System Error', { error, context });

    // Notifica utente se necessario
    if (game.user.isGM) {
      ui.notifications.error(`Errore sistema Brancalonia: ${error.message}`);
    }
  }
}
```

## 📊 Performance Monitoring

### Performance Optimizer
```javascript
// modules/brancalonia-performance-optimizer.js
class PerformanceOptimizer {
  static monitorModuleLoadTime() {
    const startTime = performance.now();

    // Monitora caricamento moduli
    Hooks.once('ready', () => {
      const loadTime = performance.now() - startTime;
      BrancaloniaLogger.info('Module Load Time', { loadTime });
    });
  }
}
```

## 🔒 Compatibility Layer

### Foundry v13 Compatibility
```javascript
// modules/brancalonia-v13-modern.js
export class V13Compatibility {
  static fixDeprecatedAPIs() {
    // Fix per API deprecate
    if (typeof game.macros.find === 'undefined') {
      game.macros.find = game.macros.filter; // Fix Foundry v13
    }
  }
}
```

## 📦 Module Loader

### Dynamic Module Loading
```javascript
// modules/brancalonia-module-loader.js
export class BrancaloniaModuleLoader {
  static async loadModules() {
    const modules = this.getModuleLoadOrder();

    for (const moduleName of modules) {
      try {
        await this.loadModule(moduleName);
        BrancaloniaLogger.info(`Module ${moduleName} loaded`);
      } catch (error) {
        BrancaloniaLogger.error(`Failed to load ${moduleName}`, error);
      }
    }
  }
}
```

## 🎯 API Publica

### Global API
```javascript
// API globale disponibile per altri moduli
window.BrancaloniaAPI = {
  // Sistema Infamia
  addInfamia: (actor, amount) => game.brancalonia.infamiaTracker.addInfamia(actor, amount),
  getInfamiaLevel: (actor) => game.brancalonia.infamiaTracker.getLevel(actor),

  // Sistema Haven
  createHaven: (name, type) => game.brancalonia.havenSystem.createHaven(name, type),

  // Sistema Lavori Sporchi
  generateJob: (type, difficulty) => game.brancalonia.dirtyJobs.generateJob(type, difficulty),

  // Altri sistemi...
};
```

## 🧪 Testing Framework

### Test Structure
```javascript
// tests/modules/brancalonia-test-suite.js
export class BrancaloniaTestSuite {
  static async runAllTests() {
    const results = {
      passed: 0,
      failed: 0,
      tests: []
    };

    // Test sistemi
    results.tests.push(await this.testInfamiaSystem());
    results.tests.push(await this.testHavenSystem());
    // ... altri test
  }
}
```

## 📈 Monitoring e Analytics

### System Monitor
```javascript
// modules/brancalonia-monitoring.js
class SystemMonitor {
  static trackEvent(eventType, data) {
    // Traccia eventi sistema
    game.brancalonia.analytics.track(eventType, data);
  }

  static getSystemStats() {
    return {
      activeCompagnie: game.brancalonia.compagniaManager.getActiveCount(),
      totalHaven: game.brancalonia.havenSystem.getTotalCount(),
      infamiaMedia: game.brancalonia.infamiaTracker.getAverageInfamia()
    };
  }
}
```

## 🔧 Development Tools

### Debug Utilities
```javascript
// modules/brancalonia-debug-tools.js
export class DebugTools {
  static exposeAPI() {
    // Espone API interne per debug
    window.BrancaloniaDebug = {
      systems: game.brancalonia,
      logger: BrancaloniaLogger,
      core: BrancaloniaCore
    };
  }
}
```

---

Questa architettura garantisce:
- **Modularità**: Ogni sistema è indipendente
- **Scalabilità**: Facile aggiungere nuovi sistemi
- **Manutenibilità**: Codice ben organizzato
- **Performance**: Caricamento ottimizzato
- **Compatibilità**: Supporto Foundry v13 e D&D 5e v5.1.9+

Per contribuire al progetto, consulta [CONTRIBUTING.md](../contributing.md).

