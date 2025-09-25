# Normalizzazione Database Brancalonia per Foundry VTT v13

## Obiettivo
Portare il database Brancalonia allo stesso schema usato dal modulo Foundry dnd5e v5.1.9, per integrare Brancalonia come modulo aggiuntivo senza divergenze strutturali.

## Stato Attuale

### Database
- **Struttura**: Database unificato (Manuale Base + Macaronicon) in categorie uniche
- **Categorie esistenti**:
  - backgrounds, classi, razze, equipaggiamento
  - incantesimi, talenti, emeriticenze
  - creature (creature_base, png_base, creature_macaronicon, png_macaronicon)
  - regole, tabelle
- **File totali**: 795+ file JSON con indici per tutte le cartelle

### Packs Foundry Esistenti
```
packs/
├── backgrounds/_source/        (8 file)
├── brancalonia-features/_source/ (80 file)
├── classi/_source/            (3 file)
├── emeriticenze/_source/      (14 file)
├── equipaggiamento/_source/   (29 file)
├── incantesimi/_source/       (14 file)
├── macro/_source/              (8 file)
├── npc/_source/                (8 file)
├── razze/_source/              (13 file)
├── regole/_source/             (20 file)
├── rollable-tables/_source/   (33 file)
├── sottoclassi/_source/       (16 file)
└── talenti/_source/           (25 file)
```

## Mappatura Database → Packs Foundry

### Mappatura Diretta
| Database | Pack Foundry | Tipo Documento | Note |
|----------|--------------|----------------|------|
| `backgrounds/` | `packs/backgrounds/_source/` | Item (background) | ✅ Già allineato |
| `razze/` | `packs/razze/_source/` | Item (race) | ✅ Già allineato |
| `talenti/` | `packs/talenti/_source/` | Item (feat) | ✅ Già allineato |
| `emeriticenze/` | `packs/emeriticenze/_source/` | Item (feat) | ✅ Già allineato |
| `incantesimi/` | `packs/incantesimi/_source/` | Item (spell) | ✅ Già allineato |
| `regole/` | `packs/regole/_source/` | JournalEntry | ✅ Già allineato |
| `tabelle/` | `packs/rollable-tables/_source/` | RollTable | ✅ Già allineato |

### Mappatura con Riorganizzazione
| Database | Pack Foundry | Tipo Documento | Note |
|----------|--------------|----------------|------|
| `classi/**/*.json` | `packs/classi/_source/` | Item (class) | Classi base |
| `classi/**/sottoclassi/` | `packs/sottoclassi/_source/` | Item (subclass) | Sottoclassi |
| `classi/**/privilegi_*/` | `packs/brancalonia-features/_source/` | Item (feat) | Feature di classe |
| `equipaggiamento/armi/` | `packs/equipaggiamento/_source/` | Item (weapon) | Armi |
| `equipaggiamento/armature/` | `packs/equipaggiamento/_source/` | Item (equipment) | Armature |
| `equipaggiamento/cimeli/` | `packs/equipaggiamento/_source/` | Item (equipment) | Oggetti magici |
| `equipaggiamento/oggetti/` | `packs/equipaggiamento/_source/` | Item (equipment) | Oggetti comuni |
| `creature/creature_base/` | `packs/npc/_source/` | Actor (npc) | Creature manuale base |
| `creature/png_base/` | `packs/npc/_source/` | Actor (npc) | PNG manuale base |
| `creature/creature_macaronicon/` | `packs/npc/_source/` | Actor (npc) | Creature Macaronicon |
| `creature/png_macaronicon/` | `packs/npc/_source/` | Actor (npc) | PNG Macaronicon |

## Schema di Trasformazione

### Differenze Chiave tra Database e Packs

#### Database (formato attuale)
```json
{
  "id": "png-tagliagole",
  "nome": "Tagliagole",
  "tipo": "Umanoide",
  "caratteristiche": {
    "forza": 12,
    "destrezza": 16
  },
  "classe_armatura": {
    "valore": 15,
    "tipo": "cuoio borchiato"
  }
}
```

#### Packs Foundry (formato target)
```json
{
  "_id": "tagliagole001",
  "_key": "!actors!tagliagole001",
  "name": "Tagliagole",
  "type": "npc",
  "system": {
    "abilities": {
      "str": { "value": 12 },
      "dex": { "value": 16 }
    },
    "attributes": {
      "ac": {
        "flat": 15,
        "calc": "default",
        "formula": ""
      }
    }
  }
}
```

### Campi Obbligatori per Foundry v13

1. **_id**: Identificatore univoco (generato)
2. **_key**: Chiave compendio nel formato `!collection!id`
3. **name**: Nome visualizzato
4. **type**: Tipo documento (npc, item, journal, etc.)
5. **system**: Dati di sistema dnd5e
6. **flags**: Flag personalizzati (per dati Brancalonia)
7. **ownership**: Permessi (default: {"default": 0})

## Script di Normalizzazione

### 1. normalize-database.js
Trasforma i file dal formato database al formato Foundry:
- Converte struttura campi
- Aggiunge _id e _key
- Normalizza system.*
- Preserva dati Brancalonia in flags

### 2. validate-normalized.js
Valida i file normalizzati:
- Verifica presenza campi obbligatori
- Controlla compatibilità dnd5e
- Segnala problemi

### 3. build-packs.js
Costruisce i compendi:
- Copia file normalizzati in packs/_source
- Genera file LevelDB
- Aggiorna manifesti

## Preservazione Dati Brancalonia

I dati specifici di Brancalonia vengono preservati in:
```json
{
  "flags": {
    "brancalonia": {
      "fonte": "Manuale Base p.188",
      "note": {
        "ruolo": "Criminale comune",
        "affiliazione": "Onorata Società"
      },
      "meccaniche": {
        "taglia": true,
        "nomea": false
      }
    }
  }
}
```

## Processo di Migrazione

1. **Backup** del database e packs esistenti
2. **Esecuzione** script normalize-database.js
3. **Validazione** con validate-normalized.js
4. **Build** dei pack con build-packs.js
5. **Test** in Foundry VTT
6. **Commit** delle modifiche

## Comandi

```bash
# Normalizza il database
node scripts/normalize-database.js

# Valida i file normalizzati
node scripts/validate-normalized.js

# Costruisci i pack
node scripts/build-packs.js

# Build completo
npm run build:all
```

## Note Implementative

- I file nel database mantengono la struttura modulare (1 file = 1 entità)
- Gli ID vengono generati in modo deterministico dal nome file
- I dati Brancalonia-specific vanno in flags.brancalonia
- Le meccaniche custom (Taglia, Rissa, etc.) richiedono Active Effects

## Prossimi Passi

1. ✅ Analisi struttura esistente
2. ✅ Definizione mappatura
3. ⏳ Implementazione script normalizzazione
4. ⏳ Test su subset di dati
5. ⏳ Normalizzazione completa database
6. ⏳ Validazione e test in Foundry