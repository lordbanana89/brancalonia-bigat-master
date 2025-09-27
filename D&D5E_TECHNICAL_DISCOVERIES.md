# 📚 D&D 5e Technical Discoveries & Required Fixes

## 🔍 CRITICAL DISCOVERY: ItemGrant Format Issue

### Current Brancalonia Implementation (WRONG)
```json
"items": ["Compendium.brancalonia.features.Item.id"]
```

### D&D 5e v5.1.9 Correct Format
```json
"items": [
  {
    "uuid": "Compendium.brancalonia.features.Item.id",
    "optional": false
  }
]
```

**Impact**: ItemGrant advancements are NOT applying features to characters because the format is incorrect.

## 🎯 Missing Advancement Types

### Currently Implemented
- ✅ ItemGrant (but with wrong format)
- ✅ AbilityScoreImprovement
- ✅ HitPoints
- ✅ Size (races only)

### MISSING Critical Types
1. **ScaleValue** - Required for:
   - Barbarian Rage uses (2→∞)
   - Rogue Sneak Attack (1d6→10d6)
   - Monk Ki points
   - Cantrips known
   - Channel Divinity uses

2. **Trait** - Required for:
   - Weapon proficiencies
   - Saving throw proficiencies
   - Skill proficiencies at level 1

3. **ItemChoice** - Required for:
   - Fighting Style selection
   - Spell selection (Warlock, Ranger)
   - Metamagic options

4. **Subclass** - Required for:
   - All classes at specific levels (1-3 varies)

## 📊 Spell Progression Analysis

### Current Status
- **0 classes** have spell progression configured
- **Spellcasting field**: Present but empty/incorrect

### Required Configuration
```json
"spellcasting": {
  "progression": "full",  // or half, third, pact
  "ability": "int",       // or wis, cha
  "preparation": {
    "mode": "prepared",
    "formula": "@abilities.int.mod + @classes.wizard.levels"
  }
}
```

### Classes Needing Spell Progression
| Class | Progression | Ability | Mode |
|-------|-------------|---------|------|
| Mago (Wizard) | full | int | prepared |
| Chierico (Cleric) | full | wis | prepared |
| Druido (Druid) | full | wis | prepared |
| Bardo (Bard) | full | cha | known |
| Stregone (Sorcerer) | full | cha | known |
| Warlock | pact | cha | known |
| Paladino (Paladin) | half | cha | prepared |
| Ranger | half | wis | known |

## 🔢 Advancement Count Analysis

### Current Advancement Count
- Average: 6-8 advancements per class
- Most are ASI and HitPoints

### Required for D&D 5e Compliance
- Minimum: 25-30 advancements per class
- ItemGrant for EVERY feature at EVERY level
- ScaleValue for ALL scaling features

### Example: Barbarian Should Have
- Level 1: Rage (ItemGrant), Unarmored Defense (ItemGrant), HitPoints, Trait (proficiencies)
- Level 2: Reckless Attack (ItemGrant), Danger Sense (ItemGrant)
- Level 3: Subclass
- Level 4: ASI
- Level 5: Extra Attack (ItemGrant), Fast Movement (ItemGrant)
- Plus ScaleValue for Rage uses: 2 (L1), 3 (L3), 4 (L6), 5 (L12), 6 (L17), ∞ (L20)

## 🎲 RollTable Structure

### Current Implementation
```json
{
  "results": [
    {
      "_id": "abc123",
      "type": 0,
      "text": "Result text",
      "weight": 1,
      "range": [1, 1],
      "drawn": false
    }
  ]
}
```

### Status
- Structure: ✅ Correct
- Content: ✅ Populated (776 results across 81 tables)
- Loading: ❓ Needs in-game verification

## 🔗 UUID Validation

### Format Requirements
- Pattern: `Compendium.{scope}.{pack}.{documentType}.{id}`
- DocumentType: Usually "Item" for features
- Example: `Compendium.brancalonia.brancalonia-features.Item.abc123`

### Current Status
- Format: ✅ Correct
- References: ⚠️ Many features don't exist yet
- Validation: Need to create missing feature items

## 📋 Priority Fix Order

### PHASE 1: Fix Critical Issues
1. Convert ALL ItemGrant to object format with uuid
2. Add Trait advancement to ALL classes (level 1)
3. Add spellcasting configuration to caster classes

### PHASE 2: Add Missing Types
1. Implement ScaleValue for scaling features
2. Add Subclass advancement at appropriate levels
3. Implement ItemChoice for options

### PHASE 3: Complete Features
1. Create ALL missing feature items
2. Add ItemGrant for EVERY class feature
3. Link with correct UUIDs

### PHASE 4: Validation
1. Test character creation
2. Verify advancement application
3. Check spell slot progression
4. Validate drag & drop

## 🛠 Technical Implementation Notes

### ItemGrant Fix Script
```python
# Convert string to object format
if isinstance(item, str):
    item = {
        "uuid": item,
        "optional": False
    }
```

### ScaleValue Example
```json
{
  "type": "ScaleValue",
  "configuration": {
    "identifier": "rage-uses",
    "type": "number"
  },
  "value": {
    "1": 2,
    "3": 3,
    "6": 4,
    "12": 5,
    "17": 6,
    "20": null  // Unlimited
  }
}
```

### Spell Progression Advancement
```json
{
  "type": "SpellcastingValue",
  "configuration": {},
  "value": {
    "1": [2, 0, 0, 0, 0, 0, 0, 0, 0],
    "2": [3, 0, 0, 0, 0, 0, 0, 0, 0],
    "3": [4, 2, 0, 0, 0, 0, 0, 0, 0]
  }
}
```

## ⚠️ DO NOT

1. **DO NOT** remove existing content
2. **DO NOT** declare completion without testing
3. **DO NOT** use percentages without real metrics
4. **DO NOT** skip advancement levels
5. **DO NOT** ignore UUID validation

## ✅ MUST DO

1. **MUST** test every change in Foundry
2. **MUST** validate JSON structure
3. **MUST** create feature items before referencing
4. **MUST** follow D&D 5e v5.1.9 standards
5. **MUST** document every technical change

---

**Last Updated**: 2025-09-27T02:06:00
**D&D 5e Version**: 5.1.9
**Foundry Version**: v13