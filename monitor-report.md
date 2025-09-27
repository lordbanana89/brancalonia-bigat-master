# D&D 5e Technical Discoveries
Last Check: 2025-09-27T02:05:35.578098
Version: 5.1.9

## Advancement Types
### HitPoints
- **Description**: Hit point advancement per level
- **Required Levels**: [1]
- **Configuration**: `{}`

### Trait
- **Description**: Grants proficiencies (weapons, saves, skills)
- **Required Levels**: [1]
- **Configuration**: `{"grants": ["weapon:simple", "save:int", "skill:arcana"]}`

### ItemGrant
- **Description**: Grants items/features from compendium
- **Required Levels**: varies
- **Configuration**: `{"items": [{"uuid": "Compendium.system.pack.Item.id", "optional": false}]}`

### AbilityScoreImprovement
- **Description**: ASI at specific levels
- **Required Levels**: [4, 8, 12, 16, 19]
- **Configuration**: `{"points": 2, "fixed": {}}`

### ScaleValue
- **Description**: Scaling values (rage uses, cantrips, etc)
- **Required Levels**: varies
- **Configuration**: `{"identifier": "feature-name", "type": "number|dice|distance|cr", "distance": {"units": "ft"}}`

### ItemChoice
- **Description**: Choose items/spells from list
- **Required Levels**: varies
- **Configuration**: `{"choices": {"0": {"count": 1, "replacement": false}}, "type": "spell|feat|feature"}`

### Subclass
- **Description**: Subclass selection
- **Required Levels**: varies by class
- **Configuration**: `{}`

## ItemGrant Format
```json
{
  "_id": "randomid",
  "type": "ItemGrant",
  "configuration": {
    "items": [
      {
        "uuid": "Compendium.brancalonia.brancalonia-features.Item.featureId",
        "optional": false
      }
    ],
    "optional": false,
    "spell": {
      "ability": [],
      "preparation": "",
      "uses": {
        "max": "",
        "per": ""
      }
    }
  },
  "level": 1,
  "title": "Feature Name",
  "icon": "icons/svg/upgrade.svg"
}
```

## Spell Progression
- **full**: Full caster (Wizard, Cleric, Druid, Bard, Sorcerer)
- **half**: Half caster (Paladin, Ranger)
- **third**: Third caster (Eldritch Knight, Arcane Trickster)
- **pact**: Pact magic (Warlock)
- **none**: No spellcasting

## UUID Format
Format: `Compendium.{scope}.{pack}.{documentType}.{id}`

