# 🔍 Analisi Database: Condizioni Custom di Brancalonia

## 📊 Data Verifica: 2025-10-03

---

## 🎯 Domanda Iniziale

> *"Verifica nel database se ci dovrebbero essere altre condizioni che in questo momento non gestisce correttamente il modulo."*

---

## ✅ Risultato della Verifica

### 1. Condizioni Ufficiali di Brancalonia

Il file **`/database/regole/condizioni/index.json`** conferma:

```json
{
  "categoria": "Regole",
  "descrizione": "Brancalonia riutilizza le condizioni del regolamento 5e e le richiama nelle risse tramite i livelli di batoste.",
  "fonte": {
    "manuale": "Manuale Base Brancalonia",
    "pagine": "53"
  },
  "totale": 0,
  "elementi": []
}
```

**CONCLUSIONE**: Brancalonia **NON definisce condizioni custom specifiche** nel manuale. Usa le condizioni standard di D&D 5e (avvelenato, spaventato, affascinato, prono, stordito, incapacitato, ecc.)

---

## ⚠️ PROBLEMA TROVATO: Duplicazione dei Sistemi

### Il Problema

Il modulo ha **DUE** sistemi che gestiscono il "menagramo" (sfortuna/jettatura):

#### 1️⃣ **`menagramo-system.js`** (Sistema Completo) ✅

```javascript
class MenagramoSystem {
  constructor() {
    this.menagramoLevels = {
      minor: {
        name: 'Menagramo Minore',
        effects: [ /* svantaggio prove caratteristica */ ],
        duration: '1d4',
        description: 'Svantaggio su una prova di caratteristica'
      },
      moderate: {
        name: 'Menagramo Moderato',
        effects: [ /* svantaggio attacchi e salvezze */ ],
        duration: '2d4',
        description: 'Svantaggio su tutti i tiri di attacco e salvezza'
      },
      major: {
        name: 'Menagramo Maggiore',
        effects: [ /* svantaggio tutto + -2 CA */ ],
        duration: '3d4',
        description: 'Svantaggio su TUTTI i tiri, -2 CA'
      },
      catastrophic: {
        name: 'Menagramo Catastrofico',
        effects: [ /* svantaggio tutto + -4 CA + velocità dimezzata */ ],
        duration: '1d6 + 1',
        description: 'Disastro completo!'
      }
    };
    
    this.misfortuneEvents = [ /* 20 eventi sfortunati */ ];
    this.removalMethods = { /* 5 modi per rimuovere il menagramo */ };
  }
}
```

**Caratteristiche**:
- ✅ 4 livelli di gravità
- ✅ Eventi sfortunati casuali (tavola 1d20)
- ✅ Metodi di rimozione (benedizione, rituale, atto di bontà, offerta, quest)
- ✅ Integrazione completa con il gioco
- ✅ Meccaniche dal manuale di Brancalonia

#### 2️⃣ **`brancalonia-conditions.js`** (Versione Semplificata) ⚠️

```javascript
customConditions = {
  menagramo: {
    name: "Menagramo",
    description: "Maledizione che causa svantaggio e -2 CA",
    effects: [
      { key: "flags.dnd5e.disadvantage.all", mode: 5, value: "1" },
      { key: "system.attributes.ac.bonus", mode: 2, value: "-2" }
    ]
  }
}
```

**Caratteristiche**:
- ⚠️ **Versione semplificata fissa** (corrisponde solo al "Menagramo Maggiore")
- ⚠️ **Nessun livello di gravità**
- ⚠️ **Nessun evento casuale**
- ⚠️ **Nessun metodo di rimozione**

---

## 📋 Confronto Sistemi

| Aspetto | `menagramo-system.js` | `brancalonia-conditions.js` |
|---------|----------------------|----------------------------|
| **Livelli** | 4 (Minor, Moderate, Major, Catastrophic) | 1 solo (fisso) |
| **Effetti Graduali** | ✅ Sì | ❌ No |
| **Eventi Sfortunati** | ✅ 20 eventi casuali | ❌ No |
| **Rimozione** | ✅ 5 metodi specifici | ❌ No |
| **Durata** | ✅ Variabile per livello | ⚠️ Manuale |
| **Integrazione** | ✅ Completa | ⚠️ Base |
| **Da Manuale** | ✅ Sì | ⚠️ Interpretazione custom |

---

## 🔎 Altre Condizioni Verificate

### "Ubriaco" 🍺

**Nel Database**:
- Menzionato nella tabella **Bagordi** (tiro 4 e 20: "ubriacone", "ubriachi", "gente ubriaca")
- Cimelio **"Il Boccale del Gigante Ubriacone"**: `TS Costituzione CD 15 o ubriaco per 1 ora`
- **NON è definita come condizione meccanica formale**

**In `brancalonia-conditions.js`**:
```javascript
ubriaco: {
  name: "Ubriaco",
  effects: [
    { key: "system.abilities.dex.value", mode: 2, value: "-2" },
    { key: "system.abilities.wis.value", mode: 2, value: "-2" },
    { key: "system.abilities.cha.value", mode: 2, value: "+2" }
  ]
}
```

**VALUTAZIONE**: ✅ **Interpretazione ragionevole**. Non è nel manuale come condizione formale, ma è una meccanica utile per il VTT.

### "Sfortuna" ⚠️

**Nel Database**: ❌ **NON esiste** come condizione separata

**In `brancalonia-conditions.js`**: 
```javascript
sfortuna: {
  name: "Sfortuna",
  effects: [ /* svantaggio attacchi e salvezze */ ]
}
```

**VALUTAZIONE**: ⚠️ **Ridondante**. È essenzialmente un sinonimo di "Menagramo Moderato" dal sistema completo.

---

## 🎭 Sistemi Correlati Verificati

### ✅ `diseases-system.js` (Malattie)
- **Febbre Palustre**
- **Peste Nera di Taglia**
- **Mal di Strada**
- **Putridume**
- E altre...

**STATUS**: ✅ **Separato e corretto**. Le malattie sono un sistema a sé e non sovrapponibile alle condizioni.

### ✅ `environmental-hazards.js` (Hazard Ambientali)
- Può applicare condizioni standard (poisoned, exhaustion, restrained)
- **Menziona "menagramo"** come possibile effetto da hazard

**STATUS**: ✅ Usa `MenagramoSystem` per gli effetti di menagramo.

### ✅ `tavern-brawl.js` (Risse)
- Gestisce le **batoste** (sistema separato dalle PF)
- Applica condizioni D&D 5e standard durante le risse

**STATUS**: ✅ **Corretto e separato**.

---

## 📊 Riepilogo Condizioni

### Condizioni Gestite Correttamente ✅

1. **Batoste** → `tavern-brawl.js`
2. **Malattie** → `diseases-system.js`
3. **Condizioni D&D 5e Standard** → Sistema nativo Foundry

### Condizioni con Duplicazione ⚠️

| Condizione | Sistema Principale | Sistema Duplicato |
|------------|-------------------|-------------------|
| **Menagramo** | `menagramo-system.js` (4 livelli) | `brancalonia-conditions.js` (1 livello) |
| **Sfortuna** | ❌ Non esiste nel manuale | `brancalonia-conditions.js` |

### Condizioni Custom Utili ✅

| Condizione | Giustificazione |
|------------|----------------|
| **Ubriaco** | Interpretazione ragionevole per VTT, utile per bagordi e cimeli |

---

## 🎯 Raccomandazioni

### Opzione A: Rimuovere Duplicazioni (Consigliata) ✅

1. **Rimuovere "menagramo"** da `brancalonia-conditions.js`
   - Usare esclusivamente `MenagramoSystem` con i suoi 4 livelli
   - Aggiornare i riferimenti per usare `game.brancalonia.menagramo.apply(actor, 'major')`

2. **Rimuovere "sfortuna"** da `brancalonia-conditions.js`
   - È ridondante con il sistema menagramo
   - Usare `MenagramoSystem` per applicare sfortuna

3. **Mantenere "ubriaco"** in `brancalonia-conditions.js`
   - È una condizione utile e non duplicata
   - Aggiungere note che spieghino che è un'estensione custom per VTT

### Opzione B: Documentare Differenze

Mantenere entrambi i sistemi ma documentare chiaramente:
- `MenagramoSystem` = Sistema completo con livelli, eventi, rimozione
- `brancalonia-conditions.js` = Versione "quick apply" per DM che vogliono applicare rapidamente una condizione semplice

---

## 📝 Modifiche Suggerite

### 1. Aggiornare `brancalonia-conditions.js`

```javascript
static _setupCustomConditions() {
  // NOTA: Menagramo e Sfortuna sono gestiti da MenagramoSystem
  // Usa game.brancalonia.menagramo.apply(actor, level) per applicarli
  
  this.customConditions = {
    // menagramo: RIMOSSO - usa MenagramoSystem
    // sfortuna: RIMOSSO - usa MenagramoSystem
    
    ubriaco: {
      name: "Ubriaco",
      icon: "icons/consumables/drinks/beer-stein-wooden.webp",
      description: "Effetti dell'alcol: -2 Des/Sag, +2 Car (estensione custom per VTT)",
      effects: [
        { key: "system.abilities.dex.value", mode: 2, value: "-2" },
        { key: "system.abilities.wis.value", mode: 2, value: "-2" },
        { key: "system.abilities.cha.value", mode: 2, value: "+2" }
      ],
      note: "Condizione custom per Brancalonia VTT, non nel manuale base"
    }
  };
}
```

### 2. Creare Macro per MenagramoSystem

```javascript
// Macro: "Applica Menagramo"
if (!game.brancalonia?.menagramo) {
  ui.notifications.error("MenagramoSystem non disponibile!");
  return;
}

const tokens = canvas.tokens.controlled;
if (tokens.length === 0) {
  ui.notifications.warn("Seleziona un token!");
  return;
}

// Dialog per scegliere il livello
new Dialog({
  title: "Applica Menagramo",
  content: `
    <select id="menagramo-level">
      <option value="minor">Minore (svantaggio prove)</option>
      <option value="moderate">Moderato (svantaggio attacchi/salvezze)</option>
      <option value="major">Maggiore (svantaggio tutto + -2 CA)</option>
      <option value="catastrophic">Catastrofico (disastro totale)</option>
    </select>
  `,
  buttons: {
    apply: {
      label: "Applica",
      callback: (html) => {
        const level = html.find('#menagramo-level').val();
        game.brancalonia.menagramo.apply(tokens[0].actor, level);
      }
    }
  }
}).render(true);
```

---

## ✅ Conclusioni

### Domanda Originale
> *"Ci dovrebbero essere altre condizioni che il modulo non gestisce?"*

**RISPOSTA**: ❌ **NO**. Brancalonia usa le condizioni standard di D&D 5e.

### Problema Reale Trovato

⚠️ **Duplicazione**: Il modulo ha **DUE** sistemi per gestire il menagramo:
- `MenagramoSystem` (completo, da manuale)
- `brancalonia-conditions.js` (semplificato, ridondante)

### Azioni Consigliate

1. ✅ **Rimuovere "menagramo" e "sfortuna"** da `brancalonia-conditions.js`
2. ✅ **Usare esclusivamente `MenagramoSystem`** per la gestione della sfortuna
3. ✅ **Mantenere "ubriaco"** come condizione custom utile per VTT
4. ✅ **Creare macro user-friendly** per applicare menagramo con i 4 livelli
5. ✅ **Documentare** la separazione tra sistemi

---

**Verificato da**: AI Assistant  
**Data**: 2025-10-03  
**Status**: ⚠️ DUPLICAZIONE TROVATA - Azione Richiesta


