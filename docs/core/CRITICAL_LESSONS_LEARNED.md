# 🚨 LEZIONI CRITICHE APPRESE - BRANCALONIA D&D 5e

## ERRORI FATALI DA NON RIPETERE MAI

### 1. 🔴 PROBLEMA DELLE DUE DIRECTORY

**ERRORE COMMESSO:**
```
packs/            <- Modificavo qui
packs_normalized/ <- Il validator leggeva qui
```

**CONSEGUENZA:**
- I fix non venivano visti dal validator
- Sembrava che nulla funzionasse
- Perdita di tempo enorme

**SOLUZIONE DEFINITIVA:**
```bash
# SEMPRE sincronizzare dopo modifiche
cp -r packs/[pack]/_source/* packs_normalized/[pack]/_source/
```

### 2. 🔴 UUID REFERENCES ESTERNI

**ERRORE COMMESSO:**
```json
"uuid": "Compendium.dnd5e.items.Item.cWi8SiGCmP89GQZZ"
```

**CONSEGUENZA:**
- 6 errori critici di validazione
- Dipendenza da modulo dnd5e core
- Incompatibilità con installazioni custom

**SOLUZIONE DEFINITIVA:**
```json
// OPZIONE 1: UUID locale
"uuid": "Compendium.brancalonia.equipaggiamento.Item.pugnale001"

// OPZIONE 2: Array vuoto (per background)
"startingEquipment": []
```

### 3. 🔴 FORMATO ITEMGRANT

**ERRORE COMMESSO:**
```json
"items": ["Compendium.brancalonia.features.Item.xyz"]  // STRINGA
```

**CONSEGUENZA:**
- Advancement non funzionanti
- Features non assegnate
- Classi incomplete

**SOLUZIONE DEFINITIVA:**
```json
"items": [
  {
    "uuid": "Compendium.brancalonia.brancalonia-features.Item.xyz",
    "optional": false
  }
]
```

### 4. 🔴 CAMPO _KEY MANCANTE

**ERRORE COMMESSO:**
- Usare Foundry CLI che rimuove `_key`

**CONSEGUENZA:**
- Compendi vuoti in Foundry
- 640 documenti non caricati

**SOLUZIONE DEFINITIVA:**
```json
{
  "_id": "item-id",
  "_key": "!items!item-id",  // SEMPRE PRESENTE
  "name": "Item Name"
}
```

### 5. 🔴 CONVERSIONE DATABASE

**ERRORE COMMESSO:**
- File database in formato diverso da Foundry
- Campi non compatibili con D&D 5e

**CONSEGUENZA:**
- Background non funzionanti
- Advancement non applicati

**SOLUZIONE DEFINITIVA:**
```python
# Convertitore database -> Foundry
def convert_background(db_data):
    return {
        "_id": bg_id,
        "_key": f"!items!{bg_id}",
        "type": "background",
        "system": {
            "advancement": build_advancements(db_data),
            "startingEquipment": [],  # MAI UUID esterni
            # ... resto dei campi D&D 5e
        }
    }
```

## CHECKLIST PRE-COMMIT

Prima di ogni commit, SEMPRE verificare:

- [ ] Directory sincronizzate (`packs/` e `packs_normalized/`)
- [ ] Nessun UUID `dnd5e` nei file
- [ ] ItemGrant in formato oggetto, non stringa
- [ ] Campo `_key` presente in tutti i JSON
- [ ] Validator eseguito su directory corretta
- [ ] Test con `python3 scripts/agent-validator.py`
- [ ] Compilazione pack con `./scripts/compile-all-packs.sh`

## COMANDI UTILI

```bash
# Verifica UUID dnd5e
grep -r "dnd5e" packs/*/\_source/*.json

# Sincronizza directory
for pack in packs/*; do
  cp -r $pack/_source/* packs_normalized/$(basename $pack)/_source/
done

# Valida tutto
python3 scripts/agent-validator.py

# Compila tutto
./scripts/compile-all-packs.sh
```

## STRUTTURA FILE CORRETTA

### Background
```json
{
  "_id": "background-id",
  "_key": "!items!background-id",
  "type": "background",
  "system": {
    "advancement": [...],
    "startingEquipment": [],  // Vuoto o UUID locali
    "traits": {},
    "wealth": "1d4"
  }
}
```

### Class
```json
{
  "_id": "class-id",
  "_key": "!items!class-id",
  "type": "class",
  "system": {
    "advancement": [
      {
        "type": "ItemGrant",
        "configuration": {
          "items": [
            {
              "uuid": "Compendium.brancalonia.pack.Item.id",
              "optional": false
            }
          ]
        }
      }
    ]
  }
}
```

## AGENT ORCHESTRATOR

Per eseguire tutti i fix in parallelo:
```python
python3 scripts/agent-orchestrator.py
```

Esegue automaticamente:
- DATABASE normalizer
- SPELL fixer
- CLASS fixer
- ITEM fixer
- UUID cleaner
- Validator finale

---

**RICORDA:** Gli errori qui documentati hanno causato giorni di debug. Non ripeterli!