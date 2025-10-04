# 🎭 Verifica Modulo: brancalonia-cursed-relics.js

## 📋 Data: 2025-10-03
## Status: ⚠️ **PROBLEMI TROVATI - Correzione Richiesta**

---

## 🎯 Scopo del Modulo

`CimeliMaledetti` gestisce i **50 cimeli magici maledetti** di Brancalonia, oggetti speciali con:
- ✨ **Benedizione**: Potere positivo quando equipaggiato
- 🖤 **Maledizione**: Effetto negativo persistente (anche quando non equipaggiato)

---

## ⚠️ PROBLEMI CRITICI TROVATI

### 🔴 **Bug #1: Condizione Logica Errata** (Righe 557 e 966)

#### Codice Attuale (ERRATO):
```javascript
if (!item.flags?.brancalonia?.categoria === "cimelo") return [];
```

#### Problema:
Il `!` viene applicato **prima** dell'optional chaining, quindi:
- `!item.flags?.brancalonia?.categoria === "cimelo"` 
- → `false === "cimelo"` o `true === "cimelo"`
- → **SEMPRE false**!

Questo significa che la condizione **NON fa mai il return** come previsto, e il codice continua anche se l'item non è un cimelo.

#### Soluzione:
```javascript
if (item.flags?.brancalonia?.categoria !== "cimelo") return [];
```

**OPPURE**:
```javascript
if (!(item.flags?.brancalonia?.categoria === "cimelo")) return [];
```

---

### 🟡 **Problema #2: Parsing Limitato delle Benedizioni/Maledizioni**

#### Sistema Attuale:
Il modulo ha solo **pochi casi hardcoded** nel parsing:

```javascript
static parseBenedizione(desc) {
  // Solo 5-6 casi specifici hardcoded:
  if (descLower.includes("vantaggio") && descLower.includes("inganno")) { ... }
  if (descLower.includes("+1") && descLower.includes("carisma")) { ... }
  if (descLower.includes("resistenza") && descLower.includes("veleno")) { ... }
  // ...pochi altri
}
```

#### Problema:
Dei **50 cimeli nel database**, molti hanno effetti che NON corrispondono a questi pattern:

| Cimelo | Benedizione | Parsing Attuale |
|--------|-------------|-----------------|
| **Pugnale del Traditore** | "+3 a colpire e danni contro alleati" | ❌ Non parsato |
| **Naso di Pinocchio** | "Si allunga quando il portatore mente" | ❌ Narrativo, non parsabile |
| **Dadi del Diavolo** | "Doppio 6 vinci, doppio 1 perdi l'anima" | ❌ Meccanica speciale |
| **Anello Vescovo Ladrone** | "Vantaggio Inganno su questioni religiose" | ⚠️ Parzialmente parsato |

**Risultato**: La maggior parte dei cimeli **NON applica effetti automatici** perché il parsing fallisce!

---

### 🟡 **Problema #3: Cimeli con Solo Benedizione**

Alcuni cimeli nel database hanno **solo `proprieta`** ma non `maledizione`:

```json
{
  "nome": "Il Naso di Pinocchio",
  "proprieta": "Si allunga quando il portatore mente",
  // ❌ Nessun campo "maledizione"
}
```

Il codice assume che TUTTI i cimeli abbiano una maledizione, ma non è sempre vero.

---

### 🟢 **Problema #4: Effetti Narrativi vs Meccanici**

Molti cimeli hanno effetti **puramente narrativi** che non possono essere convertiti in Active Effects:

| Cimelo | Effetto | Tipo |
|--------|---------|------|
| **Naso di Pinocchio** | "Si allunga quando menti" | Narrativo |
| **Guanto del Boia** | "Le mani puzzano sempre di sangue" | Narrativo |
| **Dadi del Diavolo** | "Doppio 1 = perdi l'anima" | Evento speciale |
| **Catena Cane Infernale** | "Attira cani infernali nel raggio 1 km" | Evento casuale |

Questi richiedono gestione **manuale dal DM** o **hook speciali**, non solo Active Effects.

---

## 📊 Analisi del Database

### Struttura Cimeli nel Database

**Totale**: 50 cimeli maledetti in `/database/equipaggiamento/cimeli/`

**Categorie di Effetti**:
1. **Meccanici** (convertibili in Active Effects): ~20 cimeli
   - Vantaggio/Svantaggio a skill
   - Bonus/Malus a caratteristiche
   - Resistenze/Vulnerabilità

2. **Narrativi** (non convertibili): ~15 cimeli
   - Effetti di roleplay
   - Descrizioni visive
   - Effetti sociali

3. **Speciali** (richiedono hook custom): ~15 cimeli
   - Meccaniche uniche
   - Eventi casuali
   - Tiri salvezza speciali

---

## 🎮 Funzionalità Verificate

### ✅ Funzioni Corrette

| Funzione | Status | Note |
|----------|--------|------|
| **Registrazione Settings** | ✅ OK | 4 impostazioni configurabili |
| **Comandi Chat** | ✅ OK | `/cimelo`, `/maledizione`, `/cimelihelp` |
| **Macro Automatiche** | ✅ OK | 3 macro create all'avvio |
| **Caricamento Database** | ✅ OK | Carica cimeli dal compendium |
| **Tiro Casuale** | ✅ OK | 1d100 → cimelo casuale |
| **Dialog Identificazione** | ✅ OK | Interfaccia user-friendly |
| **Rimozione Maledizione** | ✅ OK | Con tiro 1d20 vs CD 15 |
| **Stili CSS** | ✅ OK | UI personalizzata per cimeli |
| **Hook Item Sheet** | ✅ OK | Mostra info cimelo nella scheda |

### ⚠️ Funzioni con Problemi

| Funzione | Problema | Gravità |
|----------|----------|---------|
| **`applicaEffetti`** | Bug logico + parsing limitato | 🔴 Alta |
| **`parseBenedizione`** | Solo pochi casi hardcoded | 🟡 Media |
| **`parseMaledizione`** | Solo pochi casi hardcoded | 🟡 Media |
| **Hook `updateItem`** | Bug logico (stesso di `applicaEffetti`) | 🔴 Alta |

---

## 🔧 Soluzioni Proposte

### Soluzione #1: Correzione Bug Logico (URGENTE)

**File**: `/modules/brancalonia-cursed-relics.js`

**Righe da correggere**:
- Riga 557 (metodo `applicaEffetti`)
- Riga 966 (hook `updateItem`)

**Correzione**:
```javascript
// PRIMA (ERRATO):
if (!item.flags?.brancalonia?.categoria === "cimelo") return [];

// DOPO (CORRETTO):
if (item.flags?.brancalonia?.categoria !== "cimelo") return [];
```

### Soluzione #2: Sistema di Parsing Esteso

**Opzione A: Parser Regex Avanzato**
```javascript
static parseBenedizione(desc) {
  const changes = [];
  const descLower = desc.toLowerCase();
  
  // Pattern per vantaggio skill
  const vantaggioSkillPattern = /vantaggio.*?(atletica|acrobazia|furtività|rapidità di mano|arcano|storia|indagare|natura|religione|addestrare animali|intuizione|medicina|percezione|sopravvivenza|inganno|intimidire|intrattenere|persuasione)/i;
  const matchSkill = desc.match(vantaggioSkillPattern);
  if (matchSkill) {
    const skillMap = {
      'atletica': 'ath', 'acrobazia': 'acr', 'furtività': 'ste',
      // ... mapping completo
    };
    const skill = skillMap[matchSkill[1].toLowerCase()];
    if (skill) {
      changes.push({
        key: `flags.dnd5e.advantage.skill.${skill}`,
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: "1"
      });
    }
  }
  
  // Pattern per bonus caratteristiche
  const bonusCaratteristicaPattern = /([+-]\d+).*?(forza|destrezza|costituzione|intelligenza|saggezza|carisma)/i;
  // ... parsing avanzato
  
  return changes;
}
```

**Opzione B: Sistema Tag nel Database**
```json
{
  "nome": "Anello del Vescovo Ladrone",
  "proprieta": "Vantaggio alle prove di Inganno su questioni religiose",
  "active_effects_benedizione": [
    {
      "key": "flags.dnd5e.advantage.skill.dec",
      "mode": 5,
      "value": "1"
    }
  ],
  "maledizione": "Svantaggio ai TS contro effetti divini",
  "active_effects_maledizione": [
    {
      "key": "flags.dnd5e.disadvantage.save.all",
      "mode": 5,
      "value": "divini"
    }
  ]
}
```

### Soluzione #3: Flag per Effetti Narrativi

Aggiungere un flag per identificare cimeli che richiedono gestione manuale:

```javascript
static parseBenedizione(desc) {
  const changes = [];
  
  // Check se è effetto narrativo
  const narrativeKeywords = [
    'si allunga', 'puzza', 'rivela', 'mostra', 
    'attira', 'richiama', 'evoca', 'appare'
  ];
  
  const isNarrative = narrativeKeywords.some(kw => 
    desc.toLowerCase().includes(kw)
  );
  
  if (isNarrative) {
    // Aggiungi flag per avvisare il DM
    changes.push({
      key: "flags.brancalonia.requiresManualHandling",
      mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
      value: "true"
    });
    
    ui.notifications.info(
      `⚠️ "${item.name}" ha effetti narrativi. Gestione manuale richiesta!`
    );
  }
  
  // ... resto del parsing ...
  
  return changes;
}
```

---

## 🎯 Confronto: Due Tipi di Cimeli

È importante notare che Brancalonia ha **DUE** tipi di cimeli:

### 1️⃣ Cimeli Comuni (50 pezzi)
**Fonte**: `/database/regole/cimeli.json`

**Caratteristiche**:
- ❌ Non magici
- ❌ Nessun potere speciale
- ✅ Valore narrativo
- ✅ Possono dare Ispirazione (1 volta)
- ✅ Oggetti bizzarri e unici

**Esempi**:
- Zappa splendida
- Stivali spaiati di Belgaratto
- Cappello dell'Ammazzasette
- Dente umano nero

**Gestione**: Non richiedono il sistema `CimeliMaledetti`, sono solo roleplay!

### 2️⃣ Cimeli Maledetti (50 pezzi)
**Fonte**: `/database/equipaggiamento/cimeli/*.json`

**Caratteristiche**:
- ✅ Magici
- ✅ Benedizione (potere positivo)
- ⚠️ Maledizione (effetto negativo persistente)
- ✅ Valore economico
- ✅ Storia unica

**Esempi**:
- Anello del Vescovo Ladrone
- Pugnale del Traditore
- Boccale del Gigante Ubriacone
- Dadi del Diavolo

**Gestione**: Usano il sistema `CimeliMaledetti`

---

## 📝 Raccomandazioni

### Priorità Alta (Correggere Subito) 🔴

1. **Correggere il bug logico** alle righe 557 e 966
2. **Testare** l'applicazione automatica degli effetti dopo la correzione
3. **Aggiungere log di debug** per verificare quali cimeli vengono parsati correttamente

### Priorità Media (Miglioramenti) 🟡

1. **Estendere il sistema di parsing** con pattern regex più completi
2. **Aggiungere tag `active_effects` al database** per evitare il parsing automatico
3. **Creare warning per effetti narrativi** che richiedono gestione manuale
4. **Documentare** quali cimeli hanno effetti automatici e quali no

### Priorità Bassa (Optional) 🟢

1. **Hook speciali** per cimeli con meccaniche uniche (Dadi del Diavolo, etc.)
2. **UI migliorata** per mostrare se un cimelo ha effetti automatici o manuali
3. **Sistema di tag** nel database per categorizzare i tipi di effetto

---

## 📊 Statistiche Modulo

| Metrica | Valore |
|---------|--------|
| **Righe di Codice** | 1214 |
| **Settings** | 4 |
| **Comandi Chat** | 3 |
| **Macro Automatiche** | 3 |
| **Metodi Pubblici** | 15+ |
| **Hooks Registrati** | 2 |
| **Bug Critici** | 1 |
| **Problemi Medi** | 2 |
| **Cimeli nel Database** | 50 |
| **Cimeli Parsabili** | ~20 (40%) |

---

## ✅ Checklist Verifica

- [x] ✅ Letto tutto il codice
- [x] ✅ Verificato database cimeli
- [x] ✅ Testato logica con linter
- [x] ⚠️ Trovato bug logico critico
- [x] ⚠️ Identificato parsing limitato
- [x] ✅ Verificato settings e comandi
- [x] ✅ Verificato macro e UI
- [x] ✅ Verificato hooks
- [ ] ❌ Correzione bug (da fare)
- [ ] ❌ Test funzionale (dopo correzione)

---

## 🎯 Conclusione

### Status Attuale: ⚠️ **RICHIEDE CORREZIONE**

Il modulo `brancalonia-cursed-relics.js` è **ben strutturato** ma ha:
- 🔴 **1 bug critico** (condizione logica errata)
- 🟡 **2 limitazioni medie** (parsing incompleto, effetti narrativi)

### Priorità:
1. **URGENT**: Correggere il bug logico (5 minuti)
2. **IMPORTANTE**: Estendere il parsing o usare tag nel database (1-2 ore)
3. **OPZIONALE**: Hook speciali per effetti unici (2-4 ore)

### Dopo la Correzione:
Il sistema sarà **pienamente funzionale** per i ~20 cimeli con effetti meccanici standard. I rimanenti cimeli con effetti narrativi o speciali richiederanno gestione manuale dal DM (come previsto dal manuale).

---

**Verificato da**: AI Assistant  
**Data**: 2025-10-03  
**Status**: ⚠️ BUG TROVATO - Correzione Necessaria


