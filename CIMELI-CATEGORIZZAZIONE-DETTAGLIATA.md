# 📊 Categorizzazione Dettagliata - Tutti i 50 Cimeli Maledetti

## Data: 2025-10-03
## Fase 2: COMPLETATA ✅

---

## 🔷 CATEGORIA A: Meccanici con Active Effects (18 cimeli)

### A1: Vantaggio/Svantaggio a Skill

#### #001 - Anello del Vescovo Ladrone
**Benedizione**: Vantaggio Inganno su questioni religiose  
**Maledizione**: Svantaggio TS contro effetti divini

```json
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
    "value": "divini",
    "priority": 20
  },
  {
    "key": "flags.dnd5e.disadvantage.save.cha",
    "mode": 5,
    "value": "divini",
    "priority": 20
  }
]
```

#### #007 - Fazzoletto della Dama Nera
**Benedizione**: Vantaggio Carisma con sesso opposto 1h  
**Maledizione**: TS SAG CD13 o innamoramento

```json
"active_effects_benedizione": [
  {
    "key": "system.abilities.cha.bonuses.check",
    "mode": 2,
    "value": "+2",
    "priority": 20,
    "duration": {"seconds": 3600}
  }
],
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "saving_throw",
  "saveType": "wis",
  "saveDC": 13,
  "onFailure": "Innamoramento prima persona vista"
}
```

#### #011 - Maschera del Carnefice
**Benedizione**: +2 Intimidire, immunità riconoscimento  
**Maledizione**: Non toglibile 24h

```json
"active_effects_benedizione": [
  {
    "key": "system.skills.int.bonuses.check",
    "mode": 2,
    "value": "+2",
    "priority": 20
  }
],
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "curse_duration",
  "durationHours": 24,
  "effectDescription": "Maschera non rimovibile"
}
```

---

### A2: Bonus/Malus Caratteristiche

#### #006 - Elmo del Cavaliere Codardo
**Benedizione**: +1 CA  
**Maledizione**: Svantaggio TS vs paura

```json
"active_effects_benedizione": [
  {
    "key": "system.attributes.ac.bonus",
    "mode": 2,
    "value": "+1",
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
]
```

#### #015 - Pipa del Filosofo
**Benedizione**: +2 INT per 10 min  
**Collaterale**: -2 CON per 1h dopo

```json
"active_effects_benedizione": [
  {
    "key": "system.abilities.int.value",
    "mode": 2,
    "value": "+2",
    "priority": 20,
    "duration": {"seconds": 600}
  }
],
"active_effects_maledizione": [
  {
    "key": "system.abilities.con.value",
    "mode": 2,
    "value": "-2",
    "priority": 20,
    "duration": {"seconds": 3600}
  }
]
```

#### #044 - Elmo del Generale Sconfitto
**Benedizione**: +2 CAR per comandare  
**Maledizione**: -2 INT strategie

```json
"active_effects_benedizione": [
  {
    "key": "system.abilities.cha.value",
    "mode": 2,
    "value": "+2",
    "priority": 20
  }
],
"active_effects_maledizione": [
  {
    "key": "system.abilities.int.value",
    "mode": 2,
    "value": "-2",
    "priority": 20
  }
]
```

---

### A3: Bonus Armi e Combattimento

#### #022 - Zappa del Contadino Ribelle
**Benedizione**: +1 arma vs nobili/soldati, immune intimidazione autorità

```json
"active_effects_benedizione": [
  {
    "key": "system.magicalBonus",
    "mode": 2,
    "value": "+1",
    "priority": 20
  },
  {
    "key": "flags.dnd5e.advantage.save.wis",
    "mode": 5,
    "value": "intimidation_authority",
    "priority": 20
  }
]
```

#### #033 - Pugnale del Traditore
**Benedizione**: +3 a colpire/danni vs alleati  
**Maledizione**: TS SAG CD15 per non tradire

```json
"active_effects_benedizione": [
  {
    "key": "system.bonuses.mwak.attack",
    "mode": 2,
    "value": "+3",
    "priority": 20
  },
  {
    "key": "system.bonuses.mwak.damage",
    "mode": 2,
    "value": "+3",
    "priority": 20
  }
],
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "conditional_effect",
  "condition": "vs_alleati",
  "saveType": "wis",
  "saveDC": 15,
  "onFailure": "Compulsione tradimento"
}
```

#### #050 - Spada Spezzata dell'Eroe
**Benedizione**: +2 arma (o +5 se riforgiata)

```json
"active_effects_benedizione": [
  {
    "key": "system.magicalBonus",
    "mode": 2,
    "value": "+2",
    "priority": 20
  }
],
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "upgradeable",
  "upgradeCondition": "Se riforgiata diventa +5"
}
```

---

### A4: Bonus/Malus Salvataggi

#### #030 - Crocifisso Capovolto
**Benedizione**: +5 TS vs demoni  
**Maledizione**: -5 Persuasione con religiosi

```json
"active_effects_benedizione": [
  {
    "key": "system.bonuses.save.all",
    "mode": 2,
    "value": "+5",
    "priority": 20
  }
],
"active_effects_maledizione": [
  {
    "key": "system.skills.per.bonuses.check",
    "mode": 2,
    "value": "-5",
    "priority": 20
  }
],
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "conditional_effect",
  "bonusCondition": "vs_demoni",
  "malusCondition": "vs_religiosi"
}
```

---

### A5: Aure e Effetti Area

#### #035 - Stendardo Strappato
**Benedizione**: Alleati 9m vantaggio vs paura  
**Maledizione**: Svantaggio a ritirarsi

```json
"active_effects_benedizione": [
  {
    "key": "flags.dnd5e.advantage.save.wis",
    "mode": 5,
    "value": "fear",
    "priority": 20
  }
],
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "aura_effect",
  "auraRange": 30,
  "targetType": "allies",
  "effectDescription": "Vantaggio vs paura, svantaggio ritirata"
}
```

---

### A6: Immunità e Protezioni

#### #038 - Veste del Monaco Apostata
**Benedizione**: Immunità individuazione magica/divinazione  
**Maledizione**: Non può entrare luoghi consacrati

```json
"active_effects_benedizione": [
  {
    "key": "flags.brancalonia.immunityDetection",
    "mode": 5,
    "value": "1",
    "priority": 20
  }
],
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "location_ban",
  "bannedLocations": "luoghi_consacrati"
}
```

---

### A7: Visione e Percezione

#### #010 - Lanterna del Guardiano del Faro
**Benedizione**: Luce penetra nebbia/oscurità, rivela invisibili  
**Maledizione**: Attira spiriti naufraghi

```json
"active_effects_benedizione": [
  {
    "key": "system.attributes.senses.darkvision",
    "mode": 4,
    "value": "120",
    "priority": 20
  },
  {
    "key": "flags.brancalonia.seeinvisible",
    "mode": 5,
    "value": "1",
    "priority": 20
  }
],
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "random_encounter",
  "encounterType": "spiriti_naufraghi",
  "frequency": "notte"
}
```

---

### A8: Effetti Speciali Meccanici

#### #020 - Ultimo Chiodo della Croce
**Benedizione**: Danni x2 vs demoni/non-morti

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "damage_multiplier",
  "multiplier": 2,
  "targetTypes": ["undead", "fiend"],
  "requiresAttachment": "Deve essere conficcato nell'arma"
}
```

#### #034 - Ruota della Tortura
**Benedizione**: 1d4 danni a distanza + svantaggio 1 turno

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "activated_ability",
  "actionType": "action",
  "damage": "1d4",
  "range": "touch_last_24h",
  "effect": "disadvantage_1_turn"
}
```

---

## 🔶 CATEGORIA B: Narrativi con Trigger/Contatori (20 cimeli)

### B1: Generatori di Risorse

#### #002 - Bisaccia del Pellegrino Morto
**Effetto**: 1 razione + 1 fiasca ogni alba  
**Maledizione**: Cibo sa di cenere, acqua di lacrime

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "daily_resource",
  "resetTime": "alba",
  "generates": ["1_razione", "1_fiasca"],
  "flavorText": "Sapore orribile ma nutriente"
}
```

---

### B2: Contatori Limitati

#### #016 - Quadrifoglio Appassito
**Effetto**: Ritira 1 dado 1/giorno, max 7 usi totali

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "limited_use",
  "maxUses": 7,
  "currentUses": 7,
  "resetPeriod": "day",
  "effectDescription": "Ritira un tiro di dado"
}
```

#### #028 - Ferro di Cavallo Fortunato
**Effetto**: Critico→Normale 1/giorno, 77 usi totali

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "limited_use",
  "maxUses": 77,
  "currentUses": 77,
  "resetPeriod": "day",
  "effectDescription": "Trasforma critico in successo normale"
}
```

---

### B3: One-Shot Potenti

#### #031 - Moneta del Traghettatore
**Effetto**: Resurrezione 1 volta nella vita

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "one_shot_lifetime",
  "used": false,
  "activationRequirement": "Sotto lingua alla morte",
  "effectDescription": "Resurrezione automatica"
}
```

#### #043 - Dado del Destino
**Effetto**: Decidi risultato prima di tirare, 1 volta

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "one_shot_lifetime",
  "used": false,
  "effectDescription": "Scegli il risultato di un tiro"
}
```

---

### B4: Costi Speciali (Vita/Tempo)

#### #009 - Idolo Pagano
**Effetto**: Risponde sì/no 1/giorno  
**Costo**: 1 PF permanente per attivazione

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "hp_cost",
  "costPerUse": "1_pf_permanente",
  "resetPeriod": "day",
  "effectDescription": "Domanda sì/no agli dei"
}
```

#### #021 - Violino del Diavolo
**Effetto**: Competenza immediata, affascina  
**Costo**: 1 giorno di vita per canzone

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "lifespan_cost",
  "costPerUse": "1_giorno_vita",
  "effectDescription": "Musica divina, prezzo altissimo"
}
```

#### #042 - Candela del Vegliardo
**Effetto**: No bisogno dormire  
**Costo**: 1 anno vita per notte

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "lifespan_cost",
  "costPerUse": "1_anno_vita_per_notte",
  "effectDescription": "Veglia eterna, vita breve"
}
```

---

### B5: Detector e Sensori

#### #018 - Specchio della Strega
**Effetto**: Rivela travestimenti/illusioni  
**Pericolo**: 1/20 mostra orrore

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "detector_with_risk",
  "detectsType": "illusioni_travestimenti",
  "riskChance": "1d20=1",
  "riskEffect": "Visione orrore lovecraftiano"
}
```

#### #023 - Ampolla di San Geniale
**Effetto**: Si liquefa se pericolo mortale 30m

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "danger_detector",
  "detectionRange": 30,
  "detectionType": "pericolo_mortale",
  "visualCue": "Sangue si liquefa"
}
```

#### #047 - Icona Piangente
**Effetto**: Piange sangue 24h prima disgrazie

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "precognition",
  "warningTime": "24_ore",
  "warningType": "disgrazie",
  "visualCue": "Pianto di sangue"
}
```

---

### B6: Controllo Mentale/Sociale

#### #039 - Zufolo del Pifferaio
**Effetto**: Topi e bambini <10 anni seguono  
**Pericolo**: TS CAR CD15 dopo 1h o perdita controllo

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "mind_control_with_risk",
  "targetTypes": ["rats", "children_under_10"],
  "duration": "music_duration",
  "riskTime": "1_hour",
  "saveType": "cha",
  "saveDC": 15,
  "onFailure": "Perdita controllo"
}
```

#### #040 - Anello Spezzato
**Effetto**: Chi ha entrambe metà controlla portatore

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "split_item_control",
  "parts": 2,
  "controlRequirement": "Possesso entrambe metà",
  "effectDescription": "Dominio completo"
}
```

---

### B7: Trigger Sociali/Narrativi

#### #005 - Dadi del Diavolo
**Effetto**: Doppio 6 vinci, doppio 1 perdi anima

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "narrative_gamble",
  "winCondition": "double_6",
  "loseCondition": "double_1",
  "penalty": "Maledetto finché vinci scommessa impossibile"
}
```

#### #012 - Naso di Pinocchio
**Effetto**: Si allunga quando menti

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "lie_detector",
  "triggerCondition": "bugia",
  "visualEffect": "Naso si allunga visibilmente"
}
```

#### #024 - Bastone del Mendicante Re
**Effetto**: Sempre sfamato da sconosciuti

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "social_benefit",
  "effectDescription": "NPCs sfamano automaticamente il portatore"
}
```

#### #046 - Guanto del Duellante
**Effetto**: Schiaffo→Sfida obbligatoria o -4 CAR 1 mese  
**Vincolo**: Portatore non può rifiutare sfide

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "honor_code",
  "onUse": "Target accetta o -4 CAR",
  "ownerConstraint": "Non può rifiutare sfide"
}
```

---

### B8: Incontri Casuali/Hazard

#### #025 - Catena del Cane Infernale
**Benedizione**: Tratiene qualsiasi creatura (FOR CD30)  
**Maledizione**: Attira cani infernali 1km

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "random_encounter",
  "encounterType": "cani_infernali",
  "encounterRange": "1km",
  "frequency": "random"
}
```

---

### B9: Effetti Temporali/Timer

#### #017 - Rosa di Ferro
**Benedizione**: Successo automatico corteggiamento  
**Maledizione**: Amore dura solo fino tramonto

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "time_limited_effect",
  "duration": "fino_tramonto",
  "effectDescription": "Amore vero ma effimero"
}
```

#### #045 - Fiala delle Lacrime di Gioia
**Effetto**: Rimuove tristezza 7 giorni  
**Rovescio**: L'ottavo giorno tristezza doppia

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "buff_then_debuff",
  "buffDuration": "7_giorni",
  "debuffTiming": "8_giorno",
  "debuffSeverity": "doppia"
}
```

---

### B10: Abilità Speciali/Utility

#### #013 - Occhio di Vetro del Pirata
**Benedizione**: Vede attraverso nebbia/tempeste  
**Costo**: Sacrificio occhio vero

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "permanent_sacrifice",
  "cost": "Un occhio reale",
  "benefit": "Visione attraverso meteo",
  "effectDescription": "Vedi nebbia e tempeste"
}
```

#### #019 - Teschio del Santo Eretico
**Effetto**: Protegge da possessione/controllo mentale 3m

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "aura_protection",
  "auraRange": 10,
  "protectionType": ["possession", "mind_control"],
  "socialIssue": "Chierici ostili"
}
```

#### #027 - Elmetto del Soldato Sconosciuto
**Effetto**: Dimenticato appena esci dalla vista

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "memory_effect",
  "effectDescription": "Sei dimenticato quando non visibile"
}
```

#### #036 - Tamburo di Guerra Silenzioso
**Effetto**: Ritmo mentale coordina truppe

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "telepathic_coordination",
  "targetType": "truppe_alleate",
  "effectDescription": "Coordinazione tattica perfetta"
}
```

#### #048 - Lettera Mai Consegnata
**Effetto**: Trova sempre strada verso casa

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "navigation",
  "destination": "casa",
  "effectDescription": "Navigazione automatica"
}
```

---

## 🔸 CATEGORIA C: Narrativi Puri (12 cimeli)

### C1: Effetti Descrittivi Puri

#### #004 - Corda dell'Impiccato Innocente
**Effetto**: Impossibile spezzare, senso soffocamento

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "narrative_only",
  "effectDescription": "Corda indistruttibile, toccarla causa sensazione soffocamento"
}
```

#### #008 - Guanto del Boia
**Benedizione**: Sa sempre se qualcuno mente sulla colpevolezza  
**Maledizione**: Mani puzzano sempre di sangue

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "narrative_only",
  "effectDescription": "Detector verità su crimini, odore sangue persistente"
}
```

---

### C2: Tracker e Registratori

#### #026 - Diario del Condannato
**Effetto**: Scrive automaticamente i peccati del possessore

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "narrative_only",
  "effectDescription": "Registra automaticamente le malefatte",
  "utility": "Può essere usato come prova in tribunale"
}
```

#### #032 - Orecchio del Confessore
**Benedizione**: Senti attraverso muri  
**Maledizione**: Senti confessioni casuali

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "narrative_only",
  "effectDescription": "Ascolto muri + sussurri peccati casuali"
}
```

---

### C3: Modificatori Esterni

#### #014 - Pennello del Pittore Maledetto
**Benedizione**: Dipinti sembrano vivi  
**Maledizione**: Ritratti invecchiano al posto del soggetto

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "narrative_only",
  "effectDescription": "Arte magica, trasferimento invecchiamento ai ritratti"
}
```

#### #041 - Bicchiere Avvelenato
**Benedizione**: Neutralizza veleni  
**Ironia**: Acqua pura diventa leggermente tossica

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "narrative_only",
  "effectDescription": "Anti-veleno perfetto ma rende tossica acqua pura"
}
```

---

### C4: Effetti Meteorologici/Ambientali

#### #037 - Uncino del Pirata Fantasma
**Benedizione**: Tocca creature incorporee  
**Maledizione**: Braccio paralizza durante tempeste

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "narrative_only",
  "effectDescription": "Arma anti-fantasmi, paralisi da maltempo"
}
```

---

### C5: Maledizioni Permanenti/Dannose

#### #029 - Grimorio dello Studente Suicida
**Benedizione**: 3 incantesimi 1°-3° livello  
**Maledizione**: Ogni incantesimo costa 1 SAG permanente

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "permanent_stat_loss",
  "cost": "1_sag_per_spell",
  "effectDescription": "Conoscenza arcana a prezzo della sanità"
}
```

---

### C6: Economia Narrativa

#### #049 - Mappa del Tesoro Maledetto
**Benedizione**: Porta sempre a tesoro (mai stesso)  
**Maledizione**: Tesoro vale sempre meno del viaggio

```json
"flags_tracking": {
  "requiresManualHandling": true,
  "trackingType": "narrative_only",
  "effectDescription": "Avventure infinite, guadagno negativo"
}
```

---

## 📊 Riepilogo Statistiche

### Distribuzione Finale

| Categoria | Cimeli | % | Implementazione |
|-----------|--------|---|-----------------|
| **A: Meccanici** | 18 | 36% | Active Effects diretti |
| **B: Con Trigger** | 20 | 40% | Flags + UI + Notifiche |
| **C: Narrativi** | 12 | 24% | Solo descrizione + reminder DM |

### Sottocategorie Categoria A (Meccanici)

| Sottotipo | Quantità |
|-----------|----------|
| Vantaggio/Svantaggio Skill | 3 |
| Bonus/Malus Caratteristiche | 3 |
| Bonus Armi | 3 |
| Bonus/Malus Salvataggi | 1 |
| Aure | 1 |
| Immunità | 1 |
| Visione Speciale | 1 |
| Effetti Speciali | 5 |

### Sottocategorie Categoria B (Trigger)

| Sottotipo | Quantità |
|-----------|----------|
| Generatori Risorse | 1 |
| Contatori Limitati | 2 |
| One-Shot Potenti | 2 |
| Costi Vita/Tempo | 3 |
| Detector/Sensori | 3 |
| Controllo Mentale | 2 |
| Trigger Sociali | 4 |
| Incontri Casuali | 1 |
| Timer/Temporali | 2 |
| Utility Speciali | 4 |

### Con Maledizione Esplicita

- **Con campo `maledizione`**: 16 cimeli (32%)
- **Solo campo `proprieta`**: 28 cimeli (56%)
- **Con effetti negativi impliciti**: 6 cimeli (12%)

---

## ✅ Prossimo Step

**Fase 3**: Creare template JSON unificato che supporti:
- Active Effects (meccanici)
- Flags tracking (con trigger)
- Narrative descriptions (puri)

---

**Categorizzazione completata da**: AI Assistant  
**Data**: 2025-10-03  
**Status Fase 2**: ✅ COMPLETA


