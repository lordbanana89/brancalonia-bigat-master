# 🏗️ Schema JSON Unificato - Cimeli Maledetti

## Data: 2025-10-03
## Fase 3: Design Schema Template JSON ✅

---

## 🎯 Obiettivo

Definire uno **schema JSON unificato** da applicare a tutti i 50 cimeli nel database, che permetta al modulo `brancalonia-cursed-relics.js` di:
1. Leggere direttamente gli `active_effects` dal JSON (no parsing)
2. Gestire contatori e trigger tramite `tracking_flags`
3. Supportare descrizioni narrative per il DM
4. Prioritizzare l'implementazione

---

## 📋 Schema Base

Ogni file JSON in `database/equipaggiamento/cimeli/*.json` avrà questa struttura:

```json
{
  "id": "001",
  "nome": "Nome del Cimelo",
  "categoria": "Cimelo",
  "fonte": "Brancalonia Manuale Base",
  "descrizione": "Descrizione breve dell'oggetto",
  "proprieta": "Beneficio del cimelo",
  "maledizione": "Effetto negativo (se presente)",
  "valore": "500 mo",
  "storia": "Background narrativo",
  
  "implementazione": {
    "tipo": "meccanico|con_trigger|narrativo",
    "priorita": 1-3,
    "attivo": true|false,
    
    "active_effects_benedizione": [],
    "active_effects_maledizione": [],
    
    "tracking_flags": {},
    
    "hooks": [],
    "macros": [],
    
    "ui_config": {},
    "narrative_reminders": []
  },
  
  "img": "icons/path/to/icon.webp"
}
```

---

## 🔷 Tipo 1: MECCANICI (Active Effects Diretti)

### Esempio: #001 - Anello del Vescovo Ladrone

```json
{
  "id": "001",
  "nome": "L'Anello del Vescovo Ladrone",
  "categoria": "Cimelo",
  "fonte": "Brancalonia Manuale Base",
  "descrizione": "Anello d'oro con rubino, appartenuto a un vescovo corrotto",
  "proprieta": "Chi lo indossa ha vantaggio alle prove di Inganno quando mente su questioni religiose",
  "maledizione": "Svantaggio ai TS contro effetti divini",
  "valore": "500 mo",
  "storia": "Appartenuto al Vescovo Arnaldo, scomunicato per simonia",
  
  "implementazione": {
    "tipo": "meccanico",
    "priorita": 3,
    "attivo": true,
    
    "active_effects_benedizione": [
      {
        "key": "flags.dnd5e.advantage.skill.dec",
        "mode": 5,
        "value": "1",
        "priority": 20
      }
    ],
    
    "active_effects_maledizione": [
      {
        "key": "flags.dnd5e.disadvantage.save.wis",
        "mode": 5,
        "value": "1",
        "priority": 20
      },
      {
        "key": "flags.dnd5e.disadvantage.save.cha",
        "mode": 5,
        "value": "1",
        "priority": 20
      }
    ],
    
    "tracking_flags": {
      "requiresConditional": true,
      "conditionalType": "religious_context",
      "description": "Vantaggio solo su questioni religiose"
    },
    
    "hooks": ["dnd5e.preRollSkill"],
    "macros": []
  },
  
  "img": "icons/equipment/finger/ring-cabochon-gold-red.webp"
}
```

### Esempio: #006 - Elmo del Cavaliere Codardo

```json
{
  "id": "006",
  "nome": "L'Elmo del Cavaliere Codardo",
  "categoria": "Cimelo",
  "fonte": "Brancalonia Manuale Base",
  "descrizione": "Elmo lucido che sembra sempre nuovo",
  "proprieta": "+1 CA ma svantaggio ai TS contro paura",
  "valore": "300 mo",
  "storia": "Il cavaliere fuggì da 100 battaglie e morì nel suo letto",
  
  "implementazione": {
    "tipo": "meccanico",
    "priorita": 3,
    "attivo": true,
    
    "active_effects_benedizione": [
      {
        "key": "system.attributes.ac.bonus",
        "mode": 2,
        "value": "1",
        "priority": 20
      }
    ],
    
    "active_effects_maledizione": [
      {
        "key": "flags.dnd5e.disadvantage.save.wis",
        "mode": 5,
        "value": "fear",
        "priority": 20
      }
    ],
    
    "tracking_flags": {},
    "hooks": [],
    "macros": []
  },
  
  "img": "icons/equipment/head/helm-barbute-tan.webp"
}
```

---

## 🔶 Tipo 2: CON TRIGGER (Contatori e Risorse)

### Esempio: #016 - Quadrifoglio Appassito

```json
{
  "id": "016",
  "nome": "Il Quadrifoglio Appassito",
  "categoria": "Cimelo",
  "fonte": "Brancalonia Manuale Base",
  "descrizione": "Quadrifoglio secco in ampolla di vetro",
  "proprieta": "Una volta al giorno, puoi ritirare un tiro di dado",
  "valore": "777 mo",
  "storia": "L'uomo più fortunato del mondo morì il giorno che lo trovò",
  "limite": "Dopo 7 usi si sbriciola",
  
  "implementazione": {
    "tipo": "con_trigger",
    "priorita": 3,
    "attivo": true,
    
    "active_effects_benedizione": [],
    "active_effects_maledizione": [],
    
    "tracking_flags": {
      "trackingType": "limited_use",
      "maxUsesTotal": 7,
      "currentUsesTotal": 7,
      "maxUsesDaily": 1,
      "currentUsesDaily": 1,
      "resetPeriod": "day",
      "lastReset": 0,
      "onDeplete": "item_destroyed",
      "depleteMessage": "Il quadrifoglio si sbriciola in polvere!"
    },
    
    "hooks": ["dnd5e.preRollAbilityTest", "dnd5e.preRollAbilitySave", "dnd5e.preRollAttack"],
    
    "macros": ["rerollDice"],
    
    "ui_config": {
      "showUsesInSheet": true,
      "showDailyUses": true,
      "showTotalUses": true,
      "warningThreshold": 3
    }
  },
  
  "img": "icons/magic/nature/leaf-clover-inscribed.webp"
}
```

### Esempio: #031 - Moneta del Traghettatore

```json
{
  "id": "031",
  "nome": "La Moneta del Traghettatore",
  "categoria": "Cimelo",
  "fonte": "Brancalonia Manuale Base",
  "descrizione": "Antica moneta sempre fredda",
  "proprieta": "Chi muore con essa può tornare in vita una volta (una sola volta nella vita)",
  "valore": "Inestimabile",
  "storia": "Rubata a Caronte stesso",
  "attivazione": "Deve essere tenuta sotto la lingua al momento della morte",
  
  "implementazione": {
    "tipo": "con_trigger",
    "priorita": 3,
    "attivo": true,
    
    "active_effects_benedizione": [],
    "active_effects_maledizione": [],
    
    "tracking_flags": {
      "trackingType": "one_shot_lifetime",
      "used": false,
      "activationCondition": "hp_zero",
      "activationRequirement": "under_tongue",
      "effectDescription": "Resurrezione automatica a 1 HP"
    },
    
    "hooks": ["updateActor"],
    
    "macros": ["checkResurrection"],
    
    "ui_config": {
      "showStatus": true,
      "statusText": {
        "unused": "✨ Carica disponibile",
        "used": "❌ Già utilizzata"
      }
    },
    
    "narrative_reminders": [
      "La moneta deve essere sotto la lingua al momento della morte",
      "Funziona solo UNA volta nella vita del personaggio"
    ]
  },
  
  "img": "icons/commodities/currency/coin-embossed-skull-gold.webp"
}
```

### Esempio: #003 - Boccale del Gigante Ubriacone

```json
{
  "id": "003",
  "nome": "Il Boccale del Gigante Ubriacone",
  "categoria": "Cimelo",
  "fonte": "Brancalonia Manuale Base",
  "descrizione": "Enorme boccale di peltro ammaccato",
  "proprieta": "Non si svuota mai completamente di birra",
  "maledizione": "Dopo 3 sorsi, TS Costituzione CD 15 o ubriaco per 1 ora",
  "valore": "150 mo",
  "storia": "Appartenuto al gigante Bevo che morì affogato nella birra",
  
  "implementazione": {
    "tipo": "con_trigger",
    "priorita": 3,
    "attivo": true,
    
    "active_effects_benedizione": [],
    "active_effects_maledizione": [],
    
    "tracking_flags": {
      "trackingType": "counter_with_save",
      "currentSips": 0,
      "maxSipsBeforeSave": 3,
      "resetPeriod": "day",
      "lastReset": 0,
      "saveType": "con",
      "saveDC": 15,
      "onFailure": "apply_ubriaco_condition",
      "failureDuration": 3600
    },
    
    "hooks": [],
    
    "macros": ["drinkBoccale"],
    
    "ui_config": {
      "showCounter": true,
      "counterLabel": "Sorsi oggi",
      "warningText": "⚠️ Prossimo sorso richiede TS CON CD 15!"
    }
  },
  
  "img": "icons/consumables/drinks/beer-stein-brown.webp"
}
```

---

## 🔸 Tipo 3: NARRATIVI (Solo Descrizione)

### Esempio: #004 - Corda dell'Impiccato Innocente

```json
{
  "id": "004",
  "nome": "La Corda dell'Impiccato Innocente",
  "categoria": "Cimelo",
  "fonte": "Brancalonia Manuale Base",
  "descrizione": "Pezzo di corda con nodo scorsoio",
  "proprieta": "Impossibile da spezzare con la forza (richiede taglio)",
  "effetto_speciale": "Chi la tocca sente il collo stringersi per un momento",
  "valore": "100 mo",
  "storia": "Usata per impiccare un innocente che maledisse i suoi carnefici",
  
  "implementazione": {
    "tipo": "narrativo",
    "priorita": 1,
    "attivo": false,
    
    "active_effects_benedizione": [],
    "active_effects_maledizione": [],
    
    "tracking_flags": {
      "trackingType": "narrative_only",
      "properties": {
        "indestructible": true,
        "requiresCutting": true
      }
    },
    
    "hooks": [],
    "macros": [],
    
    "ui_config": {
      "showReminder": true
    },
    
    "narrative_reminders": [
      "La corda non può essere spezzata con la forza bruta",
      "Toccarla causa una sensazione momentanea di soffocamento",
      "Può essere tagliata con armi affilate"
    ]
  },
  
  "img": "icons/tools/fasteners/rope-noose-brown.webp"
}
```

### Esempio: #049 - Mappa del Tesoro Maledetto

```json
{
  "id": "049",
  "nome": "La Mappa del Tesoro Maledetto",
  "categoria": "Cimelo",
  "fonte": "Brancalonia Manuale Base",
  "descrizione": "Mappa che cambia ogni volta che la guardi",
  "proprieta": "Porta sempre a un tesoro, mai lo stesso",
  "maledizione": "Il tesoro vale sempre meno del viaggio",
  "valore": "Variable",
  "storia": "1000 avventurieri la seguirono, 10 tornarono",
  
  "implementazione": {
    "tipo": "narrativo",
    "priorita": 1,
    "attivo": false,
    
    "active_effects_benedizione": [],
    "active_effects_maledizione": [],
    
    "tracking_flags": {
      "trackingType": "narrative_only",
      "dmTool": true,
      "properties": {
        "generatesQuests": true,
        "treasureAlwaysLessThanCost": true
      }
    },
    
    "hooks": [],
    "macros": [],
    
    "ui_config": {
      "dmOnly": true
    },
    
    "narrative_reminders": [
      "Il DM genera una quest al tesoro",
      "Il tesoro deve valere MENO delle spese del viaggio",
      "La mappa cambia destinazione ogni volta",
      "Ottimo per creare avventure secondarie ironiche"
    ]
  },
  
  "img": "icons/sundries/documents/document-treasure-map.webp"
}
```

---

## 📊 Convenzioni e Standard

### 1. Valori `mode` per Active Effects

| Mode | Significato | Uso Tipico |
|------|-------------|------------|
| 0 | CUSTOM | Script custom |
| 1 | MULTIPLY | Moltiplicatore (x1.5) |
| 2 | ADD | Somma (+2) |
| 3 | DOWNGRADE | Prende il minimo |
| 4 | UPGRADE | Prende il massimo |
| 5 | OVERRIDE | Sovrascrive completamente |

### 2. Chiavi `key` Comuni

```javascript
// Caratteristiche
"system.abilities.str.value"
"system.abilities.dex.value"
"system.abilities.con.value"
"system.abilities.int.value"
"system.abilities.wis.value"
"system.abilities.cha.value"

// Skill
"system.skills.dec.bonuses.check"  // Inganno
"system.skills.itm.bonuses.check"  // Intimidire
"system.skills.per.bonuses.check"  // Persuasione
"system.skills.prc.bonuses.check"  // Percezione
"system.skills.ste.bonuses.check"  // Furtività

// Combattimento
"system.attributes.ac.bonus"           // Bonus CA
"system.bonuses.mwak.attack"          // Attacco mischia
"system.bonuses.mwak.damage"          // Danno mischia
"system.bonuses.rwak.attack"          // Attacco distanza
"system.attributes.hp.max"            // PF massimi

// Sensi
"system.attributes.senses.darkvision"
"system.attributes.senses.blindsight"
"system.attributes.senses.tremorsense"

// Flag D&D 5e
"flags.dnd5e.advantage.skill.dec"
"flags.dnd5e.disadvantage.save.wis"
"flags.dnd5e.advantage.attack.all"

// Flag Brancalonia Custom
"flags.brancalonia.seeInvisible"
"flags.brancalonia.noDivination"
"flags.brancalonia.immunityDetection"
```

### 3. Struttura `tracking_flags`

```javascript
{
  "trackingType": "limited_use" | "one_shot_lifetime" | "counter_with_save" | "narrative_only" | "aura_effect" | "conditional_effect",
  
  // Per contatori
  "maxUsesTotal": number,
  "currentUsesTotal": number,
  "maxUsesDaily": number,
  "currentUsesDaily": number,
  "resetPeriod": "day" | "week" | "month" | "never",
  "lastReset": timestamp,
  
  // Per saving throw
  "saveType": "str" | "dex" | "con" | "int" | "wis" | "cha",
  "saveDC": number,
  "onFailure": string,
  "onSuccess": string,
  
  // Per condizioni
  "activationCondition": string,
  "activationRequirement": string,
  "effectDescription": string,
  
  // Per aure
  "auraRange": number,
  "auraTargets": "allies" | "enemies" | "all",
  "auraEffect": string
}
```

### 4. Priorità Implementazione

| Priorità | Valore | Significato |
|----------|--------|-------------|
| Alta | 3 | Implementare subito (meccanici core) |
| Media | 2 | Implementare dopo (utility/trigger) |
| Bassa | 1 | Implementare ultimo (narrativi/edge case) |

---

## 🔧 Integrazione con Codice Esistente

### Modifica a `brancalonia-cursed-relics.js`

```javascript
static applicaEffetti(actor, item) {
  try {
    if (!game.settings.get('brancalonia-bigat', 'enableCimeliMaledetti')) return [];
    if (item.flags?.brancalonia?.categoria !== "cimelo") return [];

    const effects = [];
    const impl = item.system?.implementazione || item.flags?.brancalonia?.implementazione;
    
    if (!impl || !impl.attivo) return [];

    // Leggi direttamente dal database invece di parsare
    if (impl.active_effects_benedizione?.length > 0) {
      effects.push({
        name: `${item.name} - Benedizione`,
        icon: item.img || "icons/magic/holy/angel-wings-gray.webp",
        origin: item.uuid,
        duration: {},
        disabled: false,
        transfer: true,
        changes: impl.active_effects_benedizione,
        flags: {
          brancalonia: {
            benedizione: true,
            cimeloId: item.id
          }
        }
      });
    }

    if (impl.active_effects_maledizione?.length > 0) {
      effects.push({
        name: `${item.name} - Maledizione`,
        icon: "icons/magic/unholy/strike-body-explode-disintegrate.webp",
        origin: item.uuid,
        duration: {},
        disabled: false,
        transfer: true,
        changes: impl.active_effects_maledizione,
        flags: {
          brancalonia: {
            maledizione: true,
            cimeloId: item.id
          }
        }
      });
    }

    return effects;
  } catch (error) {
    console.error("Errore applicazione effetti cimelo:", error);
    return [];
  }
}
```

---

## 📚 Esempi Completi per Categoria

### 🟢 Alta Priorità (15 cimeli)

| ID | Nome | Tipo | Active Effects | Tracking Flags |
|----|------|------|----------------|----------------|
| 001 | Anello Vescovo | Meccanico | ✅ Skill advantage | ⚠️ Condizionale |
| 003 | Boccale Gigante | Con trigger | ❌ | ✅ Counter + save |
| 006 | Elmo Codardo | Meccanico | ✅ AC + save | ❌ |
| 010 | Lanterna Faro | Meccanico | ✅ Senses | ⚠️ Encounter |
| 015 | Pipa Filosofo | Meccanico | ✅ Buff/debuff temporali | ⚠️ Duration |
| 016 | Quadrifoglio | Con trigger | ❌ | ✅ Limited uses |
| 028 | Ferro Cavallo | Con trigger | ❌ | ✅ Limited uses |
| 030 | Crocifisso | Meccanico | ✅ Save bonus | ⚠️ Condizionale |
| 031 | Moneta | Con trigger | ❌ | ✅ One-shot |
| 033 | Pugnale Traditore | Meccanico | ✅ Attack/damage | ⚠️ Condizionale |
| 035 | Stendardo | Meccanico | ✅ Aura | ⚠️ Area effect |
| 043 | Dado Destino | Con trigger | ❌ | ✅ One-shot |

---

## ✅ Checklist Implementazione per Sviluppatore

Quando aggiorni un file JSON:

- [ ] Aggiungi campo `implementazione` con struttura completa
- [ ] Compila `tipo` e `priorita`
- [ ] Aggiungi `active_effects_benedizione` se meccanico
- [ ] Aggiungi `active_effects_maledizione` se presente
- [ ] Compila `tracking_flags` se serve tracking
- [ ] Lista `hooks` necessari
- [ ] Lista `macros` da creare
- [ ] Configura `ui_config` per UI
- [ ] Aggiungi `narrative_reminders` se narrativo
- [ ] Verifica path `img` corretto
- [ ] Testa che il JSON sia valido (no errori sintassi)

---

## 🎯 Prossimo Step

**Fase 5**: Applicare questo schema a tutti i 50 file JSON nel database.

**Ordine consigliato**:
1. Prima i 15 cimeli ad alta priorità (meccanici puri)
2. Poi i 19 a media priorità (con trigger)
3. Infine i 16 a bassa priorità (narrativi)

---

**Schema creato da**: AI Assistant  
**Data**: 2025-10-03  
**Versione**: 1.0  
**Status**: ✅ COMPLETO E PRONTO PER IMPLEMENTAZIONE


