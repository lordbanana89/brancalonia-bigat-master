# 📋 Analisi Background Privileges System - Brancalonia

**File**: `modules/background-privileges.js`  
**Data Verifica**: 3 Ottobre 2025  
**Linee Codice**: 936  

---

## ✅ COMPLIANCE CON IL PROGETTO

Il file è **COMPLIANT** con la struttura e le convenzioni del progetto Brancalonia. Segue correttamente:

### Architettura
- ✅ Pattern singleton con classe statica (`BackgroundPrivileges`)
- ✅ Sistema di logging centralizzato (`brancalonia-logger.js`)
- ✅ Hook lifecycle standard di Foundry VTT (`init`, `ready`)
- ✅ Gestione settings con API Foundry VTT
- ✅ Esportazione ES6 module

### Convenzioni Codice
- ✅ Import ES6 modules
- ✅ Naming convention coerente con il progetto
- ✅ Uso di `foundry.appv1.sheets.Dialog` consistente con altri moduli
- ✅ Commenti JSDoc dove appropriato
- ✅ Nessun errore di linting

### Integrazione Progetto
- ✅ Registrato correttamente nel `module.json` (linea 77)
- ✅ Integrato con `brancalonia-ui-coordinator.js`
- ✅ Macro disponibili nel pack `macro`
- ✅ Documentazione presente in `docs/compendia/races-backgrounds.md`

---

## 🎯 FUNZIONALITÀ PRINCIPALI

### Sistema Privilegi Background
Implementa i privilegi speciali dei 6 background principali di Brancalonia:

1. **Ambulante** - Storie della Strada
2. **Attaccabrighe** - Rissaiolo
3. **Azzeccagarbugli** - Risolvere Guai
4. **Brado** - Dimestichezza Selvatica
5. **Cacciatore di Reliquie** - Studioso di Reliquie
6. **Duro** - Faccia da Duro

### Caratteristiche Principali
- ✅ Auto-applicazione effetti su creazione personaggio
- ✅ Aggiornamento automatico su modifica background
- ✅ Integrazione con sistema Active Effects
- ✅ Hook personalizzati per meccaniche specifiche
- ✅ Comandi chat per gestione privilegi
- ✅ Macro automatiche per privilegi comuni
- ✅ UI enhancement per character sheet

---

## 📊 STRUTTURA DEL CODICE

### Metodi Principali

#### Inizializzazione
```javascript
static async initialize()           // Setup completo del sistema
static _registerSettings()           // Registra 4 settings
static _registerHooks()              // Registra 10+ hooks
static _registerActiveEffects()      // Definisce 6 effetti background
static _registerChatCommands()       // 4 comandi chat
static _createAutomaticMacros()      // 3 macro automatiche
```

#### Gestione Privilegi
```javascript
static _initializeBackgroundPrivileges(actor)  // Applica privilegi al personaggio
static _checkBackgroundUpdate(actor)           // Verifica update background
static showBackgroundPrivileges(actor)         // Mostra privilegi in chat
```

#### Privilegi Specifici
```javascript
static _applyAmbulanteBonus(actor, rollData)           // +1 Strade
static _applyAttaccabrigheBonus(actor)                 // Slot mossa extra
static _checkAzzeccagarbugliPrivilege(actor, malefatta) // Annulla malefatte
static applyBradoGuidance(actor, encounterData)        // Evita bestie
static _applyDuroBonus(actor, interactionType)         // +1 Taglia
static _applyBackgroundBonuses(entity, rollData)       // Bonus generali
```

### Settings (4)
1. `enableBackgroundPrivileges` - Master switch (default: true)
2. `autoApplyBackgroundEffects` - Auto-applicazione (default: true)
3. `showPrivilegeNotifications` - Notifiche chat (default: true)
4. `debugBackgroundPrivileges` - Debug mode (default: false)

### Hooks Registrati (10+)
1. `createActor` - Inizializza privilegi nuovo personaggio
2. `updateActor` - Verifica modifiche background
3. `preRoll` - Applica bonus ai tiri
4. `dnd5e.preRollSkill` - Bonus competenze (2 hook)
5. `brancalonia.stradeCheck` - Ambulante: Strade
6. `brancalonia.socialInteraction` - Duro: Nomea
7. `brancalonia.brawlStart` - Attaccabrighe: Rissa
8. `brancalonia.malefattaAdded` - Azzeccagarbugli: Malefatte
9. `renderActorSheet` - UI enhancement
10. `brancalonia.wildEncounter` - Brado: Incontri selvaggi

### Comandi Chat
```
/privilegi mostra      # Lista tutti i privilegi
/privilegi attiva      # Attiva sistema
/privilegi disattiva   # Disattiva sistema
/background            # Mostra privilegi personaggio
/privilegi-help        # Aiuto comandi
/privilegi-lista       # Lista privilegi
```

---

## 🎮 BACKGROUND DETTAGLIATI

### 1. AMBULANTE - Storie della Strada
**Meccanica**: +1 automatico ai tiri del condottiero quando usa "Strade che non vanno da nessuna parte"

**Active Effects**:
- `system.skills.prf.value = 1` (Intrattenere)
- `system.skills.his.value = 1` (Storia)

**Flags**:
- `storieStrada: true`
- `stradeBonus: 1`

**Hook**: `brancalonia.stradeCheck`, `dnd5e.preRollSkill`

---

### 2. ATTACCABRIGHE - Rissaiolo
**Meccanica**: Slot mossa aggiuntivo nelle Risse da Taverna

**Active Effects**:
- `system.skills.prf.value = 1` (Intrattenere)
- `system.skills.ins.value = 1` (Intuizione)
- `flags.brancalonia-bigat.slotMossa = +1`

**Flags**:
- `slotMossaExtra: 1`

**Hook**: `brancalonia.brawlStart`

---

### 3. AZZECCAGARBUGLI - Risolvere Guai
**Meccanica**: Può annullare una Malefatta pagando monete d'oro pari alla Taglia

**Active Effects**:
- `system.skills.inv.value = 1` (Indagare)
- `system.skills.per.value = 1` (Persuasione)

**Flags**:
- `risolvereGuai: true`

**Hook**: `brancalonia.malefattaAdded`

**Dialog**: Richiede conferma e verifica disponibilità monete

---

### 4. BRADO - Dimestichezza Selvatica
**Meccanica**: Guida attraverso terre selvagge evitando bestie ostili

**Active Effects**:
- `system.skills.ani.value = 1` (Addestrare Animali)
- `system.skills.ath.value = 1` (Atletica)

**Flags**:
- `dimestichezzaSelvatica: true`

**Hook**: `brancalonia.wildEncounter`

**Logica**: Salta automaticamente incontri con `type: 'beast'`

---

### 5. CACCIATORE DI RELIQUIE - Studioso di Reliquie
**Meccanica**: +1 bonus a Religione e Storia per identificare/studiare reliquie

**Active Effects**:
- `system.skills.inv.value = 1` (Indagare)
- `system.skills.his.value = 1` (Storia)
- `system.skills.rel.bonuses.check = +1` (Religione bonus)
- `system.skills.his.bonuses.check = +1` (Storia bonus)

**Flags**:
- `studiosoReliquie: true`

**Hook**: `preRoll`, `dnd5e.preRollSkill`

---

### 6. DURO - Faccia da Duro
**Meccanica**: Taglia conta come +1 livello quando usa la Nomea per intimidire

**Active Effects**:
- `system.skills.ath.value = 1` (Atletica)
- `system.skills.itm.value = 1` (Intimidire)

**Flags**:
- `facciaDaDuro: true`

**Hook**: `dnd5e.preRollSkill`, `brancalonia.socialInteraction`

**Logica**: `effectiveTaglia = currentTaglia + 1`

**Taglia Names**:
- 0: Sconosciuto
- 1: Canaglia
- 2: Famigerato
- 3: Ricercato
- 4: Nemico Pubblico
- 5+: Leggenda

---

## 🔧 MACRO AUTOMATICHE

### 1. Privilegi Background (Generica)
**Funzione**: Mostra tutti i privilegi del personaggio selezionato

**Requisiti**: Token selezionato

**Percorso**: Pulsante nella character sheet

---

### 2. Applica Privilegio Duro
**Funzione**: Calcola e applica Taglia effettiva +1 per intimidazione

**Requisiti**: 
- Token con flag `facciaDaDuro`
- Sistema privilegi attivo

**Output**: Messaggio con Taglia effettiva

---

### 3. Risolvi Guai (Azzeccagarbugli)
**Funzione**: Dialog per annullare Malefatta pagando

**Requisiti**:
- Token con flag `risolvereGuai`
- Monete sufficienti

**Flow**:
1. Richiede costo (input)
2. Verifica disponibilità monete
3. Sottrae monete
4. Annulla malefatta
5. Messaggio in chat

---

## 🎨 UI ENHANCEMENTS

### Character Sheet Integration
Il modulo aggiunge una sezione alla character sheet:

```html
<div class="brancalonia-privileges-section">
  <h3>🎭 Privilegi Background</h3>
  <button class="show-privileges">Mostra Privilegi</button>
</div>
```

**Posizionamento**: Dopo la sezione background o all'inizio del body

**Protezione**: Dataset attribute `privilegesEnhanced` per evitare duplicazioni

---

## 🔄 WORKFLOW

### Alla Creazione Personaggio
```
1. Hook createActor
2. _initializeBackgroundPrivileges()
3. Trova background item
4. Normalizza nome background
5. Imposta flag specifici (manual)
6. Recupera effects dal registry
7. Applica flag da registry (auto)
8. Notifica se abilitato
```

### Su Modifica Background
```
1. Hook updateActor
2. _checkBackgroundUpdate()
3. Re-inizializza privilegi
4. Aggiorna flag
```

### Durante Roll
```
1. Hook preRoll / dnd5e.preRollSkill
2. Verifica flag attore
3. Applica bonus appropriati
4. Modifica rollData.bonus
5. Aggiorna rollData.flavor
```

### Hook Custom
```
1. Altro modulo chiama Hooks.call('brancalonia.XXX')
2. BackgroundPrivileges intercetta
3. Applica logica specifica
4. Restituisce risultato o null
```

---

## ⚠️ PUNTI DI ATTENZIONE

### 1. 🟡 Duplicazione Logica (MINORE)
**Posizione**: Linee 447-471

**Problema**: Il metodo `_initializeBackgroundPrivileges` applica flag in due modi:
1. Manualmente con if-else (linee 447-459)
2. Dal registry `backgroundEffects` (linee 462-466)

```javascript
// Modo 1: Manual
if (bgName.includes('brado')) {
  this.setFlag(actor, 'dimestichezzaSelvatica', true);
}

// Modo 2: Registry
const effects = game.brancalonia?.backgroundEffects?.[bgName];
if (effects && this.getSetting('autoApply')) {
  for (const [key, value] of Object.entries(effects.flags || {})) {
    this.setFlag(actor, key.split('.').pop(), value);
  }
}
```

**Impatto**: ✅ Nessun bug, funziona correttamente
**Motivo**: Probabilmente per retrocompatibilità
**Raccomandazione**: Potrebbe essere semplificato usando solo il registry

---

### 2. 🟢 Active Effects vs Manual Flags
**Comportamento**: Il sistema usa sia Active Effects (linea 185-270) che flag manuali (linee 447-459)

**Perché**:
- **Active Effects**: Per bonus meccanici (skill proficiency, bonus numerici)
- **Flag Manuali**: Per logica custom e trigger hook

**Questo è CORRETTO** - entrambi sono necessari per funzionalità complete

---

### 3. 🟢 Background Name Matching
**Metodo**: `bgName.includes('keyword')` (linee 447-458)

**Pro**:
- ✅ Flessibile (funziona con variazioni nome)
- ✅ Case-insensitive (toLowerCase)
- ✅ Gestisce spazi (replace con _)

**Contro**:
- ⚠️ Potenziale false positive con nomi simili

**Mitigazione**: Background Brancalonia hanno nomi distintivi

---

## 📝 API PUBBLICA

### Global Access
```javascript
game.brancalonia.backgroundPrivileges
window.BackgroundPrivileges
```

### Metodi Pubblici
```javascript
// Mostra privilegi
BackgroundPrivileges.showBackgroundPrivileges(actor)

// Settings
BackgroundPrivileges.getSetting(key)
BackgroundPrivileges.setSetting(key, value)

// Flags
BackgroundPrivileges.getFlag(actor, key)
BackgroundPrivileges.setFlag(actor, key, value)

// Applicazione privilegi specifici
BackgroundPrivileges.applyBradoGuidance(actor, encounterData)
BackgroundPrivileges._applyDuroBonus(actor, interactionType)
```

### Hook Pubblici
Altri moduli possono invocare:
```javascript
// Strade che non vanno da nessuna parte
Hooks.call('brancalonia.stradeCheck', actor, rollData)

// Interazione sociale
Hooks.call('brancalonia.socialInteraction', actor, target, type)

// Inizio rissa
Hooks.call('brancalonia.brawlStart', actor)

// Malefatta aggiunta
Hooks.call('brancalonia.malefattaAdded', actor, malefatta)

// Incontro selvaggio
const result = Hooks.call('brancalonia.wildEncounter', actor, encounterData)
```

---

## 🔐 SICUREZZA

### Controlli Presenti
- ✅ Verifica tipo attore (`type === 'character'`)
- ✅ Verifica esistenza background prima di applicare
- ✅ Try-catch su tutti i metodi principali
- ✅ Verifica monete disponibili (Azzeccagarbugli)
- ✅ Safe optional chaining (`game.brancalonia?.backgroundEffects?.[bgName]`)
- ✅ Protezione UI doppia renderizzazione

### Dialog Confirmation
- ✅ Azzeccagarbugli richiede conferma prima di pagare
- ✅ Verifica preventiva disponibilità risorse

---

## 📈 METRICHE

### Coverage
- **6 Background** implementati su 22+ disponibili
- **Background Core**: 100% (tutti quelli con meccaniche speciali)
- **Active Effects**: 6 definizioni complete
- **Hook Custom**: 6 hook Brancalonia-specifici
- **Macro**: 3 macro automatiche

### Complessità
- **936 linee** totali
- **19 metodi** statici
- **10+ hook** registrati
- **4 settings** configurabili
- **6 comandi** chat

---

## 🐛 DEBUG

### Attivazione Debug
```javascript
// Via UI
Settings > Brancalonia > Debug Privilegi Background = true

// Via Console
game.settings.set('brancalonia-bigat', 'debugBackgroundPrivileges', true)
```

### Log Output
```javascript
// Verifica stato sistema
game.brancalonia.backgroundPrivileges

// Verifica flag attore
const actor = game.actors.getName('Nome Personaggio');
actor.flags['brancalonia-bigat']

// Verifica background effects registry
game.brancalonia.backgroundEffects

// Test privilegio specifico
BackgroundPrivileges.showBackgroundPrivileges(actor)
```

---

## 🔄 INTEGRAZIONE CON ALTRI MODULI

### Active Effects System
```javascript
// Background Privileges DEFINISCE gli effetti
game.brancalonia.backgroundEffects = { ... }

// Active Effects System LI APPLICA
await activeEffectsManager.applyToItem(backgroundItem)
```

### Tavern Brawl System
```javascript
// Tavern Brawl chiama
Hooks.call('brancalonia.brawlStart', actor)

// Background Privileges risponde
_applyAttaccabrigheBonus(actor) // +1 slot mossa
```

### Malefatte System
```javascript
// Malefatte chiama
const canAdd = Hooks.call('brancalonia.malefattaAdded', actor, malefatta)

// Azzeccagarbugli intercetta
if (canAdd === false) return; // Malefatta annullata
```

### Wilderness Encounters
```javascript
// Wilderness chiama
const encounter = Hooks.call('brancalonia.wildEncounter', actor, data)

// Brado intercetta
if (encounter === null) return; // Incontro evitato
```

---

## ✨ CONCLUSIONE

Il file **`background-privileges.js`** è:
- ✅ **COMPLIANT** con il progetto
- ✅ **BEN STRUTTURATO** e manutenibile
- ✅ **FUNZIONALMENTE COMPLETO** per i 6 background core
- ✅ **BEN INTEGRATO** con altri sistemi
- ✅ **SICURO** con controlli appropriati
- ✅ **DOCUMENTATO** con commenti chiari

### Punti di Forza
1. **Architettura modulare** con hook system ben progettato
2. **Gestione completa** di 6 background distintivi
3. **Auto-applicazione** smart con fallback manuale
4. **UI enhancement** non invasivo
5. **Macro automatiche** per usabilità
6. **Debug mode** per troubleshooting

### Aree di Miglioramento (Opzionali)
1. Semplificare duplicazione flag manual vs registry
2. Estendere a tutti i 22 background di Brancalonia
3. Aggiungere più macro per privilegi complessi
4. Migliorare UI integration con tab dedicato

### Stato Finale
🟢 **PRONTO PER PRODUZIONE** - Nessuna correzione necessaria.

---

**Verificato da**: AI Assistant  
**Data**: 3 Ottobre 2025  
**Versione File**: 1.0 (stable)

