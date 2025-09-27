# D&D 5e Official Data Models - Complete Schema Reference

**Source**: D&D 5e System v5.1.9 (release-5.1.9 branch)
**Generated**: September 27, 2025

This document provides the exact schema definitions from the official D&D 5e Foundry system for all compendium types. Use this as the authoritative reference for Brancalonia data validation.

## Overview

All D&D 5e items in Foundry VTT follow strict data models defined in JavaScript classes. Each item type has:
- Required fields (cannot be null/undefined)
- Optional fields (can be null/undefined)
- Default values
- Validation rules
- Field types and constraints

## Document Types

### Item Types
- `spell` - Spells and cantrips
- `feat` - Features, traits, and feats
- `class` - Character classes
- `subclass` - Class specializations
- `race` - Character races/species
- `background` - Character backgrounds
- `weapon` - Weapons
- `equipment` - Armor and equipment
- `consumable` - Consumables and potions
- `tool` - Tools and instruments
- `loot` - Treasure and trade goods
- `container` - Bags and containers
- `facility` - Bastion facilities

### Actor Types
- `character` - Player characters
- `npc` - Non-player characters/monsters
- `vehicle` - Vehicles and constructs

## Field Types Reference

### Core Field Types
- `StringField` - Text strings
- `NumberField` - Numeric values
- `BooleanField` - True/false values
- `HTMLField` - Rich text/HTML content
- `SchemaField` - Nested object structures
- `ArrayField` - Arrays of values
- `SetField` - Sets of unique values
- `ForeignDocumentField` - References to other documents

### D&D 5e Custom Fields
- `FormulaField` - Dice formulas (e.g., "1d8+2")
- `IdentifierField` - URL-safe identifier strings
- `ActivationField` - Action/activation timing
- `DurationField` - Effect duration
- `RangeField` - Range/distance
- `TargetField` - Targeting information
- `CreatureTypeField` - Creature type data
- `SpellcastingField` - Spellcasting progression

---

## SPELL DATA MODEL

**Class**: `SpellData`
**File**: `module/data/item/spell.mjs`

### Core Schema

```javascript
{
  // From ItemDescriptionTemplate
  description: {
    value: HTMLField({ required: true, nullable: true }),     // Full description
    chat: HTMLField({ required: true, nullable: true })      // Chat card description
  },
  identifier: IdentifierField({ required: true }),           // Unique identifier
  source: SourceField(),                                     // Source book info

  // From ActivitiesTemplate
  activities: ActivitiesField(),                             // Spell activities

  // Spell-specific fields
  ability: StringField({ label: "DND5E.SpellAbility" }),     // Override spellcasting ability
  activation: ActivationField(),                             // Casting time
  duration: DurationField(),                                 // Duration
  level: NumberField({                                       // Spell level
    required: true,
    integer: true,
    initial: 1,
    min: 0
  }),
  materials: SchemaField({                                   // Material components
    value: StringField({ required: true }),                  // Description
    consumed: BooleanField({ required: true }),              // Are consumed?
    cost: NumberField({ required: true, initial: 0, min: 0 }), // GP cost
    supply: NumberField({ required: true, initial: 0, min: 0 }) // Available supply
  }),
  method: StringField({                                      // Spellcasting method
    required: true,
    initial: ""
  }),
  prepared: NumberField({                                    // Preparation state
    required: true,
    nullable: false,
    integer: true,
    min: 0,
    initial: 0
  }),
  properties: SetField(StringField()),                       // Spell components/tags
  range: RangeField(),                                       // Range
  school: StringField({ required: true }),                   // Magic school
  sourceClass: StringField(),                                // Associated class
  target: TargetField()                                      // Target info
}
```

### Required Fields
- `description.value`
- `description.chat`
- `identifier`
- `level`
- `materials.value`
- `materials.consumed`
- `materials.cost`
- `materials.supply`
- `method`
- `prepared`
- `school`

### Validation Rules
- `level`: Integer ≥ 0
- `materials.cost`: Number ≥ 0
- `materials.supply`: Number ≥ 0
- `prepared`: Integer ≥ 0
- `school`: Must be valid school from CONFIG.DND5E.spellSchools
- `properties`: Must be valid spell properties from CONFIG.DND5E.itemProperties

### Default Values
- `level`: 1
- `materials.cost`: 0
- `materials.supply`: 0
- `method`: ""
- `prepared`: 0

---

## FEAT DATA MODEL

**Class**: `FeatData`
**File**: `module/data/item/feat.mjs`

### Core Schema

```javascript
{
  // From ItemDescriptionTemplate
  description: {
    value: HTMLField({ required: true, nullable: true }),
    chat: HTMLField({ required: true, nullable: true })
  },
  identifier: IdentifierField({ required: true }),
  source: SourceField(),

  // From ActivitiesTemplate
  activities: ActivitiesField(),

  // From AdvancementTemplate
  advancement: AdvancementField(),

  // From ItemTypeTemplate
  type: ItemTypeField({ baseItem: false }),                  // Feature type

  // Feat-specific fields
  cover: NumberField({ min: 0, max: 1 }),                   // Cover provided
  crewed: BooleanField(),                                    // Is crewed?
  enchant: SchemaField({                                     // Enchantment data
    max: FormulaField({ deterministic: true }),              // Max enchantments
    period: StringField()                                    // Reset period
  }),
  prerequisites: SchemaField({                               // Prerequisites
    items: SetField(IdentifierField()),                      // Required items
    level: NumberField({ integer: true, min: 0 }),          // Required level
    repeatable: BooleanField()                               // Can repeat?
  }),
  properties: SetField(StringField()),                       // General properties
  requirements: StringField({ required: true, nullable: true }), // Usage requirements
}
```

### Required Fields
- `description.value`
- `description.chat`
- `identifier`
- `requirements`

### Validation Rules
- `cover`: Number between 0 and 1
- `prerequisites.level`: Integer ≥ 0
- `type.value`: Must be valid feature type from CONFIG.DND5E.featureTypes

### Default Values
- All numeric fields default to 0
- All boolean fields default to false
- String fields default to empty string

---

## CLASS DATA MODEL

**Class**: `ClassData`
**File**: `module/data/item/class.mjs`

### Core Schema

```javascript
{
  // From ItemDescriptionTemplate
  description: {
    value: HTMLField({ required: true, nullable: true }),
    chat: HTMLField({ required: true, nullable: true })
  },
  identifier: IdentifierField({ required: true }),
  source: SourceField(),

  // From AdvancementTemplate
  advancement: AdvancementField(),

  // From StartingEquipmentTemplate
  startingEquipment: StartingEquipmentField(),

  // Class-specific fields
  hd: SchemaField({                                          // Hit dice
    additional: FormulaField({                               // Additional HD
      deterministic: true,
      required: true
    }),
    denomination: StringField({                              // Die type
      required: true,
      initial: "d6",
      blank: false,
      validate: v => /d\d+/.test(v)
    }),
    spent: NumberField({                                     // Spent HD
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
      min: 0
    })
  }),
  levels: NumberField({                                      // Class levels
    required: true,
    nullable: false,
    integer: true,
    min: 0,
    initial: 1
  }),
  primaryAbility: SchemaField({                             // Primary abilities
    value: SetField(StringField()),                         // Ability list
    all: BooleanField({ initial: true })                    // Require all?
  }),
  properties: SetField(StringField()),                      // Class properties
  spellcasting: SpellcastingField()                         // Spellcasting info
}
```

### Required Fields
- `description.value`
- `description.chat`
- `identifier`
- `hd.additional`
- `hd.denomination`
- `hd.spent`
- `levels`

### Validation Rules
- `hd.denomination`: Must match pattern `/d\d+/` (e.g., "d6", "d8", "d10", "d12")
- `hd.spent`: Integer ≥ 0
- `levels`: Integer ≥ 0
- `primaryAbility.value`: Must contain valid ability scores

### Default Values
- `hd.denomination`: "d6"
- `hd.spent`: 0
- `levels`: 1
- `primaryAbility.all`: true

---

## NPC DATA MODEL

**Class**: `NPCData`
**File**: `module/data/actor/npc.mjs`

### Core Schema

```javascript
{
  // Attributes
  attributes: SchemaField({
    hd: SchemaField({
      spent: NumberField({ integer: true, min: 0, initial: 0 })
    }),
    hp: SchemaField({
      value: NumberField({                                   // Current HP
        nullable: false,
        integer: true,
        min: 0,
        initial: 10
      }),
      max: NumberField({                                     // Max HP
        nullable: false,
        integer: true,
        min: 0,
        initial: 10
      }),
      temp: NumberField({                                    // Temp HP
        integer: true,
        initial: 0,
        min: 0
      }),
      tempmax: NumberField({                                 // Temp max HP
        integer: true,
        initial: 0
      }),
      formula: FormulaField({ required: true })              // HP formula
    }),
    death: RollConfigField({                                // Death saves
      ability: false,
      success: NumberField({
        required: true,
        nullable: false,
        integer: true,
        min: 0,
        initial: 0
      }),
      failure: NumberField({
        required: true,
        nullable: false,
        integer: true,
        min: 0,
        initial: 0
      }),
      bonuses: SchemaField({
        save: FormulaField({ required: true })
      })
    }),
    spell: SchemaField({
      level: NumberField({                                   // Spellcaster level
        required: true,
        nullable: false,
        integer: true,
        min: 0,
        initial: 0
      })
    })
  }),

  // Details
  details: SchemaField({
    type: CreatureTypeField(),                              // Creature type
    habitat: SchemaField({                                  // Habitat
      value: ArrayField(SchemaField({
        type: StringField({ required: true }),
        subtype: StringField()
      })),
      custom: StringField({ required: true })
    }),
    cr: NumberField({                                       // Challenge rating
      required: true,
      nullable: true,
      min: 0,
      initial: 1
    }),
    treasure: SchemaField({
      value: SetField(StringField())
    })
  }),

  // Resources
  resources: SchemaField({
    legact: SchemaField({                                   // Legendary actions
      max: NumberField(),
      spent: NumberField()
    }),
    legres: SchemaField({                                   // Legendary resistances
      max: NumberField(),
      spent: NumberField()
    }),
    lair: SchemaField({                                     // Lair actions
      value: BooleanField(),
      initiative: NumberField(),
      inside: BooleanField()
    })
  }),

  source: SourceField()
}
```

### Required Fields
- `attributes.hp.value`
- `attributes.hp.max`
- `attributes.hp.formula`
- `attributes.death.success`
- `attributes.death.failure`
- `attributes.death.bonuses.save`
- `attributes.spell.level`
- `details.habitat.custom`
- `details.cr`

### Validation Rules
- `attributes.hp.value`: Integer ≥ 0
- `attributes.hp.max`: Integer ≥ 0
- `attributes.hp.temp`: Integer ≥ 0
- `details.cr`: Number ≥ 0
- `details.type.value`: Must be valid creature type

### Default Values
- `attributes.hp.value`: 10
- `attributes.hp.max`: 10
- `attributes.hp.temp`: 0
- `attributes.hp.tempmax`: 0
- `details.cr`: 1

---

## WEAPON DATA MODEL

**Class**: `WeaponData`
**File**: `module/data/item/weapon.mjs`

### Core Schema

```javascript
{
  // From ItemDescriptionTemplate
  description: {
    value: HTMLField({ required: true, nullable: true }),
    chat: HTMLField({ required: true, nullable: true })
  },
  identifier: IdentifierField({ required: true }),
  source: SourceField(),

  // From PhysicalItemTemplate
  container: ForeignDocumentField(),                        // Container ID
  quantity: NumberField({                                   // Quantity
    required: true,
    nullable: false,
    integer: true,
    initial: 1,
    min: 0
  }),
  weight: SchemaField({
    value: NumberField({                                    // Weight value
      required: true,
      nullable: false,
      initial: 0,
      min: 0
    }),
    units: StringField({                                    // Weight units
      required: true,
      blank: false,
      initial: () => defaultUnits("weight")
    })
  }),
  price: SchemaField({
    value: NumberField({                                    // Price value
      required: true,
      nullable: false,
      initial: 0,
      min: 0
    }),
    denomination: StringField({                             // Currency
      required: true,
      blank: false,
      initial: "gp"
    })
  }),
  rarity: StringField({ required: true, blank: true }),     // Item rarity

  // From EquippableItemTemplate
  equipped: BooleanField({ initial: false }),               // Is equipped?
  attunement: StringField(),                               // Attunement state

  // From MountableTemplate
  crewed: BooleanField(),                                  // Is crewed?

  // From ActivitiesTemplate
  activities: ActivitiesField(),

  // Weapon-specific fields
  type: ItemTypeField({ baseItem: true }),                 // Weapon type
  properties: SetField(StringField()),                     // Weapon properties
  mastery: SchemaField({                                   // Weapon mastery
    value: StringField(),                                  // Mastery type
    progress: NumberField({                                // Progress
      integer: true,
      min: 0,
      initial: 0
    })
  })
}
```

### Required Fields
- `description.value`
- `description.chat`
- `identifier`
- `quantity`
- `weight.value`
- `weight.units`
- `price.value`
- `price.denomination`
- `rarity`

### Validation Rules
- `quantity`: Integer ≥ 0
- `weight.value`: Number ≥ 0
- `price.value`: Number ≥ 0
- `price.denomination`: Must be valid currency
- `rarity`: Must be valid rarity from CONFIG.DND5E.itemRarity
- `properties`: Must be valid weapon properties
- `mastery.progress`: Integer ≥ 0

### Default Values
- `quantity`: 1
- `weight.value`: 0
- `weight.units`: "lb" (or system default)
- `price.value`: 0
- `price.denomination`: "gp"
- `equipped`: false
- `mastery.progress`: 0

---

## EQUIPMENT DATA MODEL

**Class**: `EquipmentData`
**File**: `module/data/item/equipment.mjs`

Similar to WeaponData but includes armor-specific fields:

### Additional Fields

```javascript
{
  // All weapon fields plus:
  armor: SchemaField({
    type: StringField({ required: true, initial: "clothing" }), // Armor type
    value: NumberField({ required: true, initial: 10 }),        // Base AC
    dex: NumberField(),                                         // Max Dex bonus
    magicalBonus: NumberField({ integer: true, initial: 0 })   // Magical bonus
  }),
  strength: NumberField({ integer: true }),                     // Str requirement
  stealth: BooleanField({ initial: false })                     // Stealth disadvantage
}
```

### Required Fields
All weapon required fields plus:
- `armor.type`
- `armor.value`

### Default Values
- `armor.type`: "clothing"
- `armor.value`: 10
- `armor.magicalBonus`: 0
- `stealth`: false

---

## VALIDATION ENUMS

### Spell Schools
```javascript
CONFIG.DND5E.spellSchools = {
  abj: "Abjuration",
  con: "Conjuration",
  div: "Divination",
  enc: "Enchantment",
  evo: "Evocation",
  ill: "Illusion",
  nec: "Necromancy",
  tra: "Transmutation"
}
```

### Creature Types
```javascript
CONFIG.DND5E.creatureTypes = {
  aberration: "Aberration",
  beast: "Beast",
  celestial: "Celestial",
  construct: "Construct",
  dragon: "Dragon",
  elemental: "Elemental",
  fey: "Fey",
  fiend: "Fiend",
  giant: "Giant",
  humanoid: "Humanoid",
  monstrosity: "Monstrosity",
  ooze: "Ooze",
  plant: "Plant",
  undead: "Undead"
}
```

### Item Rarities
```javascript
CONFIG.DND5E.itemRarity = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  veryRare: "Very Rare",
  legendary: "Legendary",
  artifact: "Artifact"
}
```

### Abilities
```javascript
CONFIG.DND5E.abilities = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
  hon: "Honor",
  san: "Sanity"
}
```

### Currencies
```javascript
CONFIG.DND5E.currencies = {
  pp: "Platinum",
  gp: "Gold",
  ep: "Electrum",
  sp: "Silver",
  cp: "Copper"
}
```

---

## ADVANCEMENT TYPES

Classes, races, backgrounds, and feats can include advancement configurations:

### Advancement Schema
```javascript
advancement: ArrayField(SchemaField({
  _id: StringField(),                                       // Unique ID
  type: StringField({ required: true }),                    // Advancement type
  level: NumberField({ integer: true, min: 0 }),          // Level gained
  configuration: SchemaField(),                            // Type-specific config
  value: SchemaField(),                                    // Current state
  title: StringField(),                                    // Custom title
  icon: StringField()                                      // Custom icon
}))
```

### Advancement Types
- `AbilityScoreImprovement` - ASI/feat choice
- `HitPoints` - Hit point increases
- `ItemChoice` - Choose from item list
- `ItemGrant` - Automatically grant items
- `ScaleValue` - Scaling numeric values
- `Size` - Size changes
- `SpellConfiguration` - Spell list configuration
- `Subclass` - Subclass selection
- `Trait` - Trait/proficiency grants

---

## ACTIVITY SYSTEM

Items can have multiple activities (actions, attacks, saves, etc.):

### Activity Schema
```javascript
activities: MappingField(SchemaField({
  _id: StringField(),                                       // Activity ID
  type: StringField({ required: true }),                    // Activity type
  name: StringField(),                                     // Activity name
  img: StringField(),                                      // Activity icon
  activation: ActivationField(),                           // Activation cost
  consumption: ConsumptionField(),                         // Resource consumption
  description: HTMLField(),                                // Description
  effects: EffectsField(),                                 // Applied effects
  range: RangeField(),                                     // Range
  target: TargetField(),                                   // Target
  uses: UsesField()                                        // Limited uses
}))
```

### Activity Types
- `attack` - Attack rolls
- `damage` - Damage rolls
- `healing` - Healing
- `save` - Saving throws
- `check` - Ability checks
- `utility` - Utility actions
- `summon` - Summoning
- `enchant` - Enchantments

---

## COMMON PATTERNS

### Identifier Fields
All items must have a unique `identifier` field:
- Must be URL-safe (alphanumeric, hyphens, underscores)
- Should be lowercase
- Must be unique within the system
- Used for cross-references and lookups

### Source Fields
Items should include source information:
```javascript
source: {
  book: StringField(),      // Source book key
  page: StringField(),      // Page reference
  custom: StringField(),    // Custom source
  license: StringField()    // License info
}
```

### Description Fields
All items have standardized descriptions:
```javascript
description: {
  value: HTMLField(),       // Full description (rich text)
  chat: HTMLField()         // Shortened chat description
}
```

### Physical Item Fields
Physical items include:
```javascript
quantity: NumberField(),    // Stack size
weight: {
  value: NumberField(),     // Weight amount
  units: StringField()      // Weight units
},
price: {
  value: NumberField(),     // Cost amount
  denomination: StringField() // Currency type
},
rarity: StringField()       // Item rarity
```

---

## VALIDATION NOTES

1. **Required vs Optional**: Pay attention to `required: true` fields - these cannot be null
2. **Integers**: Fields marked `integer: true` must be whole numbers
3. **Minimums**: Many numeric fields have `min: 0` constraints
4. **Enums**: String fields often must match predefined values in CONFIG
5. **Formulas**: Formula fields accept dice notation (e.g., "1d8+2", "2d6")
6. **HTML Fields**: Can contain rich text but should be properly sanitized
7. **Set Fields**: Contain unique values only (no duplicates)
8. **Array Fields**: Ordered lists that can contain duplicates

---

## MIGRATION CONSIDERATIONS

The D&D 5e system includes extensive migration logic. When converting Brancalonia data:

1. Use the latest field names and structures
2. Ensure all required fields are present
3. Validate enum values against current CONFIG
4. Convert old formula formats to new FormulaField format
5. Use proper data types (string vs number vs boolean)
6. Include proper default values for optional fields

This schema reference represents the authoritative structure for D&D 5e v5.1.9. All Brancalonia data should conform to these exact specifications for compatibility.