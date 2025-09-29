# 📋 PIANO REFACTORING PROFONDO BRANCALONIA v10.0.0

## 🎯 OBIETTIVI
1. **Compatibilità totale con D&D 5e v5.x**
2. **Zero !important nel CSS finale**
3. **Architettura modulare e manutenibile**
4. **Performance ottimizzata**
5. **Codice testabile e documentato**

---

## 📊 ANALISI SITUAZIONE ATTUALE

### Problemi Critici:
1. **Hooks System** - Utilizzo di API deprecate
2. **CSS Cascade** - Conflitti e override aggressivi
3. **Module Loading** - 43 moduli caricati senza ordine
4. **Code Duplication** - 5+ moduli per stesso scopo
5. **No Testing** - Nessun test automatico

### Assets:
- Meccaniche Brancalonia funzionanti
- Palette colori ben definita
- Compendi completi
- Community attiva

---

## 🏗️ ARCHITETTURA PROPOSTA

```
brancalonia-bigat/
├── core/                      # Core functionality
│   ├── BrancaloniaCore.js    # Main class
│   ├── HooksManager.js       # Gestione hooks centralizzata
│   ├── ConfigManager.js      # Settings e configurazione
│   └── CompatibilityLayer.js # Compatibility con versioni
├── features/                  # Feature modules
│   ├── actor-sheet/
│   │   ├── ActorSheetEnhancer.js
│   │   └── actor-sheet.css
│   ├── infamia/
│   │   ├── InfamiaTracker.js
│   │   └── infamia.css
│   ├── baraonda/
│   │   ├── BaraondaSystem.js
│   │   └── baraonda.css
│   └── [altre feature...]
├── styles/
│   ├── _variables.css        # Token system
│   ├── _base.css            # Base styles
│   ├── _components.css      # Componenti UI
│   └── brancalonia.css      # Entry point
├── tests/
│   ├── unit/
│   └── integration/
└── docs/
    ├── API.md
    └── MIGRATION.md
```

---

## 🔄 MIGRAZIONE HOOKS

### Mappatura Old → New:

| D&D 5e v3/v4 (OLD) | D&D 5e v5+ (NEW) | Nostro Wrapper |
|-------------------|------------------|----------------|
| `renderActorSheet5eCharacter` | `dnd5e.renderActorSheet` + check type | `BrancaloniaHooks.onActorSheet` |
| `preRenderActorSheet5eCharacter` | `dnd5e.preRenderActorSheet` | `BrancaloniaHooks.preActorSheet` |
| `renderActorSheet5eNPC` | `dnd5e.renderActorSheet` + check NPC | `BrancaloniaHooks.onNPCSheet` |
| `createActor` | `createDocument` + type check | `BrancaloniaHooks.onActorCreate` |
| `updateActor` | `updateDocument` + type check | `BrancaloniaHooks.onActorUpdate` |

### Strategia Compatibility:

```javascript
class BrancaloniaHooks {
  static init() {
    const dnd5eVersion = game.system.version;

    if (foundry.utils.isNewerVersion(dnd5eVersion, "5.0.0")) {
      this._registerV5Hooks();
    } else if (foundry.utils.isNewerVersion(dnd5eVersion, "4.0.0")) {
      this._registerV4Hooks();
    } else {
      this._registerLegacyHooks();
    }
  }

  static _registerV5Hooks() {
    // Nuovo sistema hooks
    Hooks.on("dnd5e.renderActorSheet", (app, html, data) => {
      if (app.document.type === "character") {
        this.onActorSheet(app, html, data);
      }
    });
  }

  static _registerV4Hooks() {
    // Vecchio sistema
    Hooks.on("renderActorSheet5eCharacter", this.onActorSheet.bind(this));
  }

  // Metodo unificato per logica business
  static onActorSheet(app, html, data) {
    // Logica comune indipendente dalla versione
    this._enhanceActorSheet(app, html, data);
    this._addBrancaloniaElements(app, html, data);
  }
}
```

---

## 🎨 REFACTORING CSS

### Principi:
1. **Zero !important** - Uso specificity e cascade
2. **BEM Methodology** - Naming consistente
3. **CSS Custom Properties** - Theming flessibile
4. **Modular Files** - Un file per componente
5. **Source Order** - Import ordinato

### Nuovo Sistema:

```css
/* _variables.css */
:root {
  /* Design Tokens */
  --bcl-color-primary: #C9A54A;
  --bcl-space-unit: 0.25rem;

  /* Semantic Tokens */
  --bcl-actor-bg: var(--bcl-color-surface);
  --bcl-actor-border: var(--bcl-color-primary);
}

/* _base.css */
.brancalonia {
  /* Reset e base styles */
}

/* components/actor-sheet.css */
.bcl-actor-sheet {
  /* Component specific */
}

.bcl-actor-sheet__header {
  /* BEM element */
}

.bcl-actor-sheet--compact {
  /* BEM modifier */
}
```

---

## 🔧 CONSOLIDAMENTO MODULI

### Da 43 a ~15 moduli:

**PRIMA** (Caos):
```
brancalonia-icon-interceptor.js
brancalonia-icon-detector.js
brancalonia-icons-complete-fix.js
brancalonia-icons-global-fix.js
brancalonia-icons-auto-fix.js
```

**DOPO** (Organizzato):
```
IconManager.js  // Unico modulo per gestione icone
```

### Moduli Core (8):
1. `BrancaloniaCore.js` - Inizializzazione
2. `HooksManager.js` - Gestione hooks
3. `ActorEnhancer.js` - Modifiche actor
4. `ItemEnhancer.js` - Modifiche item
5. `UIEnhancer.js` - UI modifications
6. `IconManager.js` - Gestione icone
7. `CompendiumManager.js` - Gestione compendi
8. `CompatibilityLayer.js` - Retrocompatibilità

### Moduli Feature (7):
1. `InfamiaSystem.js`
2. `BaraondaSystem.js`
3. `CompagniaManager.js`
4. `HavenSystem.js`
5. `TavernBrawl.js`
6. `DirtyJobs.js`
7. `Menagramo.js`

---

## 📝 STEP DI IMPLEMENTAZIONE

### Step 1: Setup Struttura (1h)
- [ ] Creare directory structure
- [ ] Setup build system
- [ ] Configurare testing framework

### Step 2: Core System (3h)
- [ ] BrancaloniaCore class
- [ ] HooksManager con compatibility
- [ ] ConfigManager per settings
- [ ] CompatibilityLayer per versioni

### Step 3: Migrazione Hooks (2h)
- [ ] Identificare tutti gli usi
- [ ] Creare wrappers
- [ ] Test su v4 e v5
- [ ] Fallback per errori

### Step 4: CSS Refactor (4h)
- [ ] Nuovo token system
- [ ] Rimuovere TUTTI !important
- [ ] BEM methodology
- [ ] Component files
- [ ] Test responsive

### Step 5: Features Migration (3h)
- [ ] Infamia system
- [ ] Baraonda system
- [ ] Altri sistemi
- [ ] Integration test

### Step 6: Testing & QA (2h)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing
- [ ] Performance test

### Step 7: Documentation (1h)
- [ ] API documentation
- [ ] Migration guide
- [ ] README update
- [ ] Changelog

---

## 🚀 DEPLOYMENT STRATEGY

### Versioning:
- **v9.x** - Ultima versione legacy (current)
- **v10.0.0-alpha** - Testing interno
- **v10.0.0-beta** - Community testing
- **v10.0.0** - Release stabile

### Breaking Changes:
- Hooks system completamente nuovo
- CSS class names cambiate
- API pubblica modificata
- Minimum Foundry v12

### Migration Path:
1. Deprecation warnings in v9.5
2. Migration helper in v9.9
3. Clean break in v10.0

---

## ⚠️ RISCHI E MITIGAZIONI

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|------------|---------|-------------|
| Breaking existing worlds | Alta | Critico | Migration script + backup |
| CSS conflicts | Media | Alto | Namespace tutto + testing |
| Performance regression | Bassa | Medio | Profiling + lazy loading |
| Community resistance | Media | Alto | Beta testing + docs |

---

## 📊 METRICHE DI SUCCESSO

- [ ] 0 errori console in fresh install
- [ ] < 100ms actor sheet render
- [ ] 0 !important in CSS
- [ ] 100% hooks compatibility
- [ ] < 20 moduli totali
- [ ] 90%+ test coverage
- [ ] < 5 bug reports first week

---

## 🎯 TIMELINE

- **Settimana 1**: Core + Hooks (Step 1-3)
- **Settimana 2**: CSS + Features (Step 4-5)
- **Settimana 3**: Testing + Docs (Step 6-7)
- **Settimana 4**: Beta release

---

*Piano creato: 2025-09-29*
*Target release: v10.0.0*
*Complexity: ████████░░ 80%*