# AGENT DEBUGGER PROFONDO 🔧

**Deep Testing and Auto-Fix System for Brancalonia D&D 5e Module**

## Overview

The Agent Debugger Profondo is a comprehensive validation and testing system specifically designed for the Brancalonia module. Unlike superficial checkers, this tool performs **REAL** deep analysis of every component and generates concrete fixes.

## What It Actually Does

### 🔍 **REAL Problem Detection**
- **JSON Validation**: Loads EVERY JSON file and validates against D&D 5e schema
- **UUID Resolution**: Tests ACTUAL UUID references - do they resolve to real items?
- **Spell References**: Tests EVERY spell reference in classes to ensure spells exist
- **Item Grants**: Verifies EVERY item grant actually points to existing items
- **RollTable Data**: Checks EVERY rolltable has REAL data, not empty arrays

### 🏛️ **Deep Class Analysis**
For EACH class, verifies:
- ✅ ALL 20 levels have features (not just some)
- ✅ EACH feature UUID points to EXISTING item
- ✅ Spell slots match D&D 5e EXACTLY (no approximations)
- ✅ Subclass options exist and work
- ✅ Starting equipment ACTUALLY exists in the database

### ✨ **Spell System Verification**
- **Real Count**: Counts actual spells in incantesimi pack
- **Coverage**: Checks spell levels 0-9 coverage (exact numbers, not percentages)
- **Schema**: Verifies spell schools are correct D&D 5e schools
- **Components**: Tests spell component requirements are valid
- **Flags**: Validates ritual and concentration flags work

### ⚔️ **Item Linking Verification**
- **Equipment References**: Tests EVERY equipment reference in classes
- **Weapon Properties**: Verifies weapon properties exist and are valid
- **Armor Calculations**: Checks armor AC calculations are mathematically correct
- **Magic Items**: Validates magic item rarities follow D&D 5e standards
- **Consumables**: Tests consumable items work as expected

### 🎲 **RollTable Deep Check**
- **Loading**: Loads EACH rolltable and validates structure
- **Population**: Verifies results array is populated (not empty)
- **Calculations**: Checks range calculations are mathematically correct
- **Weights**: Tests weight distributions add up correctly
- **Flags**: Validates drawn flags work properly

## Usage

### Basic Usage
```bash
python scripts/agent-debugger-profondo.py /path/to/brancalonia-module
```

### From Module Directory
```bash
cd /Users/erik/Desktop/brancalonia-bigat-master
python scripts/agent-debugger-profondo.py .
```

### Quick Test
```bash
python scripts/test-debugger.py
```

## Output Format

### **NO PERCENTAGES** - Real Numbers Only

The debugger outputs EXACT counts and specific issues:

```
📊 STATISTICHE CONTENUTO:
  Classi: 5
  Incantesimi: 23
  Oggetti: 156
  Tabelle: 12
  UUID registrati: 1,234
  UUID rotti: 7

🔍 RISULTATI VALIDAZIONE:
  Problemi totali: 23
  Critici: 3
  Warning: 15
  Info: 5

📋 PROBLEMI PER CATEGORIA:
  BROKEN_UUID: 7
  CLASS_INCOMPLETE_PROGRESSION: 2
  MISSING_SPELL_LEVEL: 3
  EMPTY_ROLLTABLE: 4
```

### Specific Broken Items Listed

Instead of "85% working", you get:
```
❌ UUID rotto: a1b2c3d4-e5f6-7890 in burattinaio.json
❌ Classe "Burattinaio" manca livelli: [18, 19, 20]
❌ Incantesimo "Dardo Magico" riferito da Mago non trovato
❌ Tabella "Incontri Strada" completamente vuota
```

## Auto-Fix Generation

The debugger generates **concrete fix scripts**, not suggestions:

### Generated Scripts:
1. **`fix_broken_uuids.py`** - Creates placeholder items for broken UUID references
2. **`complete_class_progressions.py`** - Adds missing levels to incomplete classes
3. **`create_missing_items.py`** - Creates missing equipment referenced by classes
4. **`complete_spell_system.py`** - Adds missing spells for empty levels
5. **`populate_rolltables.py`** - Fills empty rolltables with appropriate data

### Example Auto-Fix:
```python
# Auto-generated fix for broken UUID: a1b2c3d4-e5f6-7890
placeholder_item = {
    '_id': 'a1b2c3d4-e5f6-7890',
    'name': 'Placeholder - Mancante Feature',
    'type': 'feat',
    'description': 'Auto-generated placeholder for broken reference'
}
# Create file: database/privilegi/placeholder-a1b2c3d4.json
```

## Validation Categories

### Critical Issues (Must Fix)
- `BROKEN_UUID` - UUID references that don't resolve
- `CLASS_INCOMPLETE_PROGRESSION` - Classes missing levels
- `EMPTY_ROLLTABLE` - Completely empty tables
- `JSON_SYNTAX` - Malformed JSON files

### Warning Issues (Should Fix)
- `MISSING_EQUIPMENT` - Equipment referenced but not found
- `SPELL_SCHOOL` - Non-standard spell schools
- `WEAPON_MISSING_PROPERTIES` - Incomplete weapon data

### Info Issues (Nice to Fix)
- `MAGIC_ITEM_NO_RARITY` - Magic items without rarity
- `MISSING_SPELL_SCHOOLS` - Underrepresented spell schools

## Output Files

After running, the debugger creates:

```
scripts/
├── debug_report.json          # Complete detailed report
├── auto-fixes/
│   ├── fix_broken_uuids.py
│   ├── complete_class_progressions.py
│   ├── create_missing_items.py
│   ├── complete_spell_system.py
│   └── populate_rolltables.py
```

## Exit Codes

- **0**: No critical issues found
- **1**: Critical issues that must be fixed before release

## Advanced Features

### UUID Registry
Builds complete registry of all UUIDs in the module and tracks which files reference which UUIDs.

### D&D 5e Compliance
Validates against actual D&D 5e standards:
- Spell levels 0-9
- Standard spell schools
- Class progression to level 20
- Equipment properties

### Performance
- Scans entire module in under 60 seconds
- Memory efficient for large modules
- Detailed progress reporting

## Example Session

```bash
$ python scripts/agent-debugger-profondo.py .

🔧 AGENT DEBUGGER PROFONDO - Inizializzazione...
📁 Modulo Path: /Users/erik/Desktop/brancalonia-bigat-master

🚀 AVVIO ANALISI PROFONDA...

📊 FASE 1: Inventario completo dati
📋 Trovati 234 file JSON

🔍 FASE 2: Validazione profonda
📋 Validazione schema JSON...

🏛️ FASE 3: Analisi sistema classi
  📖 Analizzando classe: Burattinaio
  📖 Analizzando classe: Malandrone
  📖 Analizzando classe: Cantastorie

✨ FASE 4: Verifica sistema incantesimi
  📊 Incantesimi per livello:
    Livello 0: 3 incantesimi
    Livello 1: 5 incantesimi
    Livello 2: 0 incantesimi  ❌
    [...]

⚔️ FASE 5: Verifica collegamenti oggetti
  ⚔️ Armi controllate: 23, con problemi: 2
  🛡️ Armature controllate: 15, con problemi: 1

🎲 FASE 6: Controllo profondo tabelle
  📋 Controllando tabella: Malattie del Regno
  📋 Controllando tabella: Incontri Strada

🔧 FASE 7: Generazione fix automatici

📋 REPORT FINALE
=====================================
Problemi totali: 15
Critici: 3
Script auto-fix generati: 5

✅ Report salvato: scripts/debug_report.json
```

## Troubleshooting

### Common Issues

**Script not found**
```bash
chmod +x scripts/agent-debugger-profondo.py
```

**Permission denied**
```bash
python scripts/agent-debugger-profondo.py .
```

**Module too large**
The debugger handles large modules efficiently but may take a few minutes for very large datasets.

### Debug Mode
For verbose output, modify the script to enable debug logging.

## Contributing

To extend the debugger:

1. Add new validation categories in `ValidationIssue`
2. Implement validation logic in appropriate `_validate_*` methods
3. Add auto-fix generation in `_generate_*_script` methods
4. Update documentation

---

**Created by**: Claude Code Agent
**Version**: 1.0
**Last Updated**: September 27, 2024