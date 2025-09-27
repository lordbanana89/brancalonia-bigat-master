# D&D 5e Repository Structure Analysis

**Generated:** 2025-09-27 10:03:36
**Repository:** https://github.com/foundryvtt/dnd5e.git
**Branch:** release-5.1.9
**Analysis Directory:** /tmp/dnd5e-analysis

## Executive Summary

This document provides a comprehensive analysis of the official D&D 5e module structure to understand how advancements, UUIDs, and data are organized for proper Brancalonia integration.

## Advancement Types Analysis

Found 8 different advancement types:

### ItemGrant

**Found in 86 files**

**Common Properties:** _id, configuration, hint, level, title, type, value

**Example Structure:**
```json
{
  "_id": "v3qw412amvkgm7i5",
  "type": "ItemGrant",
  "configuration": {
    "items": [
      {
        "uuid": "Compendium.dnd5e.classfeatures.lT8GsPOPgRzDC3QJ",
        "optional": false
      },
      {
        "uuid": "Compendium.dnd5e.classfeatures.wKdRtFsvGfMKQHLY",
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
  "value": {},
  "level": 2,
  "title": "Features"
}
```

**Source Files:**
- `packs/_source/subclasses/circle-of-the-land.yml`
- `packs/_source/subclasses/path-of-the-berserker.yml`
- `packs/_source/subclasses/the-fiend.yml`
- `packs/_source/subclasses/draconic-bloodline.yml`
- `packs/_source/subclasses/champion.yml`
- ... and 81 more

### Trait

**Found in 65 files**

**Common Properties:** _id, classRestriction, configuration, hint, icon, level, title, type, value

**Example Structure:**
```json
{
  "_id": "Gg8rCLE8zNfjpGOV",
  "type": "Trait",
  "configuration": {
    "mode": "default",
    "allowReplacements": false,
    "grants": [
      "languages:exotic:draconic"
    ],
    "choices": []
  },
  "level": 1,
  "title": "",
  "value": {
    "chosen": []
  }
}
```

**Source Files:**
- `packs/_source/subclasses/draconic-bloodline.yml`
- `packs/_source/subclasses/college-of-lore.yml`
- `packs/_source/subclasses/life-domain.yml`
- `packs/_source/classes/warlock.yml`
- `packs/_source/classes/barbarian.yml`
- ... and 60 more

### ItemChoice

**Found in 32 files**

**Common Properties:** _id, configuration, hint, title, type, value

**Example Structure:**
```json
{
  "_id": "DDqfOiw4IQMv4bAi",
  "type": "ItemChoice",
  "configuration": {
    "choices": {
      "10": {
        "count": 1,
        "replacement": false
      }
    },
    "allowDrops": true,
    "type": "feat",
    "pool": [
      {
        "uuid": "Compendium.dnd5e.classfeatures.8YwPFv3UAPjWVDNf"
      },
      {
        "uuid": "Compendium.dnd5e.classfeatures.zSlV0O2rQMdoq6pB"
      },
      {
        "uuid": "Compendium.dnd5e.classfeatures.hCop9uJrWhF1QPb4"
      },
      {
        "uuid": "Compendium.dnd5e.classfeatures.3Nc6u9pyStByuJsm"
      },
      {
        "uuid": "Compendium.dnd5e.classfeatures.06NVMYf58Z76O85O"
      },
      {
        "uuid": "Compendium.dnd5e.classfeatures.mHcSjcHJ8oZu3hkb"
      }
    ],
    "spell": {
      "ability": [],
      "preparation": "",
      "uses": {
        "max": "",
        "per": ""
      }
    },
    "restriction": {
      "type": "class",
      "subtype": "fightingStyle",
      "level": ""
    }
  },
  "value": {
    "added": {},
    "replaced": {}
  },
  "title": "Additional Fighting Style",
  "hint": "Choose a second option from the Fighting Style class feature."
}
```

**Source Files:**
- `packs/_source/subclasses/champion.yml`
- `packs/_source/subclasses/hunter.yml`
- `packs/_source/subclasses/college-of-lore.yml`
- `packs/_source/classes/warlock.yml`
- `packs/_source/classes/sorcerer.yml`
- ... and 27 more

### ScaleValue

**Found in 40 files**

**Common Properties:** _id, configuration, hint, icon, title, type, value

**Example Structure:**
```json
{
  "_id": "RYU9NFMQarGlfW23",
  "type": "ScaleValue",
  "configuration": {
    "identifier": "divine-strike",
    "type": "dice",
    "distance": {
      "units": ""
    },
    "scale": {
      "8": {
        "number": 1,
        "faces": 8,
        "modifiers": []
      },
      "14": {
        "number": 2,
        "faces": 8,
        "modifiers": []
      }
    }
  },
  "value": {},
  "title": "Divine Strike Damage"
}
```

**Source Files:**
- `packs/_source/subclasses/life-domain.yml`
- `packs/_source/classes/warlock.yml`
- `packs/_source/classes/barbarian.yml`
- `packs/_source/classes/sorcerer.yml`
- `packs/_source/classes/druid.yml`
- ... and 35 more

### HitPoints

**Found in 36 files**

**Common Properties:** _id, configuration, icon, title, type, value

**Example Structure:**
```json
{
  "type": "HitPoints",
  "configuration": {},
  "value": {},
  "title": "Hit Points",
  "icon": "systems/dnd5e/icons/svg/hit-points.svg",
  "_id": "Xdh0dw6w16k5xFbX"
}
```

**Source Files:**
- `packs/_source/classes/warlock.yml`
- `packs/_source/classes/barbarian.yml`
- `packs/_source/classes/sorcerer.yml`
- `packs/_source/classes/druid.yml`
- `packs/_source/classes/monk.yml`
- ... and 31 more

### AbilityScoreImprovement

**Found in 59 files**

**Common Properties:** _id, configuration, hint, level, title, type, value

**Example Structure:**
```json
{
  "type": "AbilityScoreImprovement",
  "configuration": {
    "points": 2,
    "fixed": {
      "str": 0,
      "dex": 0,
      "con": 0,
      "int": 0,
      "wis": 0,
      "cha": 0
    },
    "cap": 2,
    "locked": [],
    "recommendation": null
  },
  "value": {
    "type": "asi"
  },
  "level": 4,
  "title": "Ability Score Improvement",
  "_id": "9tW2ZcVYgy8c3ucN"
}
```

**Source Files:**
- `packs/_source/classes/warlock.yml`
- `packs/_source/classes/barbarian.yml`
- `packs/_source/classes/sorcerer.yml`
- `packs/_source/classes/druid.yml`
- `packs/_source/classes/monk.yml`
- ... and 54 more

### Subclass

**Found in 36 files**

**Common Properties:** _id, configuration, hint, level, title, type, value

**Example Structure:**
```json
{
  "_id": "vibumq2vxjl9tmk4",
  "type": "Subclass",
  "configuration": {},
  "value": {
    "document": null,
    "uuid": null
  },
  "level": 1,
  "title": "Otherworldly Patron"
}
```

**Source Files:**
- `packs/_source/classes/warlock.yml`
- `packs/_source/classes/barbarian.yml`
- `packs/_source/classes/sorcerer.yml`
- `packs/_source/classes/druid.yml`
- `packs/_source/classes/monk.yml`
- ... and 31 more

### Size

**Found in 35 files**

**Common Properties:** _id, configuration, hint, level, title, type, value

**Example Structure:**
```json
{
  "_id": "hv2bcANK5jEJZaAb",
  "type": "Size",
  "configuration": {
    "sizes": [
      "sm"
    ]
  },
  "value": {
    "size": "sm"
  },
  "level": 1,
  "title": "",
  "hint": "Halflings average about 3 feet tall and weigh about 40 pounds. Your size is Small."
}
```

**Source Files:**
- `packs/_source/heroes/merric-halfling-barbarian.yml`
- `packs/_source/heroes/randal-human-fighter.yml`
- `packs/_source/heroes/perrin-halfling-monk.yml`
- `packs/_source/heroes/krusk-half-orc-paladin.yml`
- `packs/_source/heroes/akra-dragonborn-cleric.yml`
- ... and 30 more

## UUID Pattern Analysis

Found 7800 UUID references

### Compendium.dnd5e

**Count:** 6431

**Examples:**
- `Compendium.dnd5e.items.Item.WO8DLfz3G2QZ5njs` (in documentUuid)
- `Compendium.dnd5e.items.Item.fvezXwRJ5PqUf5NN` (in documentUuid)
- `Compendium.dnd5e.items.Item.3X7vdOjnCSpi40yn` (in documentUuid)
- `Compendium.dnd5e.items.Item.ScxK8YNU5dWELhlQ` (in documentUuid)
- `Compendium.dnd5e.items.Item.XJ8CG4UvLELCmOi2` (in documentUuid)
- ... and 6426 more

### Compendium.dnd-monster-manual

**Count:** 1368

**Examples:**
- `Compendium.dnd-monster-manual.features.Item.mmMultiattack000` (in compendiumSource)
- `Compendium.dnd-monster-manual.features.Item.mmBite0000000000` (in compendiumSource)
- `Compendium.dnd-monster-manual.features.Item.mmScratch0000000` (in compendiumSource)
- `Compendium.dnd-monster-manual.features.Item.mmShapeshift0000` (in compendiumSource)
- `Compendium.dnd-monster-manual.features.Item.mmBite0000000000` (in compendiumSource)
- ... and 1363 more

### Compendium.dnd-dungeon-masters-guide

**Count:** 1

**Examples:**
- `Compendium.dnd-dungeon-masters-guide.equipment.Item.dmgEnergyBow0000.ActiveEffect.8hnthmLhtIdRp00M` (in compendiumSource)

## Class Structure Analysis

Found 12 class definitions

### Warlock

**Source:** `packs/_source/classes24/warlock/warlock.yml`

**Has Advancement:** True

**Advancement Count:** 21

**Properties:** _id, name, type, folder, img, system, effects, flags, _stats, sort, ownership, _key

**System Keys:** description, source, startingEquipment, identifier, levels, advancement, spellcasting, wealth, primaryAbility, hd

### Barbarian

**Source:** `packs/_source/classes24/barbarian/barbarian.yml`

**Has Advancement:** True

**Advancement Count:** 33

**Properties:** _id, name, type, img, system, effects, folder, flags, _stats, sort, ownership, _key

**System Keys:** description, source, startingEquipment, identifier, levels, advancement, spellcasting, wealth, primaryAbility, hd

### Sorcerer

**Source:** `packs/_source/classes24/sorcerer/sorcerer.yml`

**Has Advancement:** True

**Advancement Count:** 19

**Properties:** _id, name, type, folder, img, system, effects, flags, _stats, sort, ownership, _key

**System Keys:** description, source, startingEquipment, identifier, levels, advancement, spellcasting, wealth, primaryAbility, hd

### Druid

**Source:** `packs/_source/classes24/druid/druid.yml`

**Has Advancement:** True

**Advancement Count:** 29

**Properties:** _id, name, type, folder, img, system, effects, flags, _stats, sort, ownership, _key

**System Keys:** description, source, startingEquipment, identifier, levels, advancement, spellcasting, wealth, primaryAbility, hd

### Monk

**Source:** `packs/_source/classes24/monk/monk.yml`

**Has Advancement:** True

**Advancement Count:** 30

**Properties:** _id, name, type, folder, img, system, effects, flags, _stats, sort, ownership, _key

**System Keys:** description, source, startingEquipment, identifier, levels, advancement, spellcasting, wealth, primaryAbility, hd

### Bard

**Source:** `packs/_source/classes24/bard/bard.yml`

**Has Advancement:** True

**Advancement Count:** 27

**Properties:** _id, name, type, folder, img, system, effects, flags, _stats, sort, ownership, _key

**System Keys:** description, source, startingEquipment, identifier, levels, advancement, spellcasting, wealth, primaryAbility, hd

### Paladin

**Source:** `packs/_source/classes24/paladin/paladin.yml`

**Has Advancement:** True

**Advancement Count:** 28

**Properties:** _id, name, type, folder, img, system, effects, flags, _stats, sort, ownership, _key

**System Keys:** description, source, startingEquipment, identifier, levels, advancement, spellcasting, wealth, primaryAbility, hd

### Wizard

**Source:** `packs/_source/classes24/wizard/wizard.yml`

**Has Advancement:** True

**Advancement Count:** 18

**Properties:** _id, name, type, folder, img, system, effects, flags, _stats, sort, ownership, _key

**System Keys:** description, source, startingEquipment, identifier, levels, advancement, spellcasting, wealth, primaryAbility, hd

### Ranger

**Source:** `packs/_source/classes24/ranger/ranger.yml`

**Has Advancement:** True

**Advancement Count:** 33

**Properties:** _id, name, type, folder, img, system, effects, flags, _stats, sort, ownership, _key

**System Keys:** description, source, startingEquipment, identifier, levels, advancement, spellcasting, wealth, primaryAbility, hd

### Cleric

**Source:** `packs/_source/classes24/cleric/cleric.yml`

**Has Advancement:** True

**Advancement Count:** 24

**Properties:** _id, name, type, folder, img, system, effects, flags, _stats, sort, ownership, _key

**System Keys:** description, source, startingEquipment, identifier, levels, advancement, spellcasting, wealth, primaryAbility, hd

### Rogue

**Source:** `packs/_source/classes24/rogue/rogue.yml`

**Has Advancement:** True

**Advancement Count:** 30

**Properties:** _id, name, type, folder, img, system, effects, flags, _stats, sort, ownership, _key

**System Keys:** description, source, startingEquipment, identifier, levels, advancement, spellcasting, wealth, primaryAbility, hd

### Fighter

**Source:** `packs/_source/classes24/fighter/fighter.yml`

**Has Advancement:** True

**Advancement Count:** 31

**Properties:** _id, name, type, folder, img, system, effects, flags, _stats, sort, ownership, _key

**System Keys:** description, source, startingEquipment, identifier, levels, advancement, spellcasting, wealth, primaryAbility, hd

## Item Format Analysis

Found 19 item types

### subclass

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, effects, flags, folder, img, name, ownership, sort, system, type

**System Properties:** advancement, classIdentifier, description, identifier, source, spellcasting

**Example: Circle of the Land**
Source: `packs/_source/subclasses/circle-of-the-land.yml`

### class

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, effects, flags, folder, img, name, ownership, sort, system, type

**System Properties:** advancement, description, hd, hitDice, hitDiceUsed, identifier, levels, primaryAbility, source, spellcasting, startingEquipment, wealth

**Example: Warlock**
Source: `packs/_source/classes/warlock.yml`

### character

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, effects, flags, folder, img, items, name, ownership, prototypeToken, sort, system, type

**System Properties:** abilities, attributes, bastion, bonuses, currency, details, favorites, resources, skills, spells, tools, traits

**Example: Merric (Halfling Barbarian)**
Source: `packs/_source/heroes/merric-halfling-barbarian.yml`

### race

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, effects, flags, folder, img, name, ownership, sort, system, type

**System Properties:** advancement, description, identifier, movement, senses, source, type

**Example: Tiefling, Abyssal**
Source: `packs/_source/origins24/species/tiefling-abyssal.yml`

### Item

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, color, description, flags, folder, name, sort, sorting, type

**System Properties:** 

**Example: Species**
Source: `packs/_source/origins24/species/_folder.yml`

### feat

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, effects, flags, folder, img, name, ownership, sort, system, type

**System Properties:** activities, advancement, cover, crewed, description, enchant, identifier, prerequisites, properties, requirements, source, type, uses

**Example: Gnomish Lineage, Forest**
Source: `packs/_source/origins24/species/traits/gnome/gnomish-lineage-forest.yml`

### background

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, effects, flags, folder, img, name, ownership, sort, system, type

**System Properties:** advancement, description, identifier, source, startingEquipment, wealth

**Example: Criminal**
Source: `packs/_source/origins24/backgrounds/criminal.yml`

### npc

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, effects, flags, folder, img, items, name, ownership, prototypeToken, sort, system, type

**System Properties:** abilities, attributes, bonuses, currency, details, resources, skills, source, spells, tools, traits

**Example: Wererat**
Source: `packs/_source/actors24/monstrosity/wererat.yml`

### Actor

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, color, description, flags, folder, name, sort, sorting, type

**System Properties:** 

**Example: Monstrosity**
Source: `packs/_source/actors24/monstrosity/_folder.yml`

### vehicle

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, effects, flags, folder, img, items, name, ownership, prototypeToken, sort, system, type

**System Properties:** abilities, attributes, cargo, currency, details, source, traits, vehicleType

**Example: Apparatus of the Crab**
Source: `packs/_source/actors24/magic-items/apparatus-of-the-crab.yml`

### loot

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, effects, flags, folder, img, name, ownership, sort, system, type

**System Properties:** container, description, identified, identifier, price, properties, quantity, rarity, source, type, unidentified, weight

**Example: Linen**
Source: `packs/_source/tradegoods/linen.yml`

### RollTable

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, color, description, flags, folder, name, sort, sorting, type

**System Properties:** 

**Example: Magic Items**
Source: `packs/_source/tables24/magic-items/_folder.yml`

### weapon

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, effects, flags, folder, img, name, ownership, sort, system, type

**System Properties:** activities, ammunition, armor, attuned, attunement, container, cover, crewed, damage, description, enchant, equipped, hp, identified, identifier, magicalBonus, mastery, prerequisites, price, proficient, properties, quantity, range, rarity, requirements, source, type, unidentified, uses, weight

**Example: Arcane Burst**
Source: `packs/_source/monsterfeatures24/actions/arcane-burst.yml`

### tool

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, effects, flags, folder, img, name, ownership, sort, system, type

**System Properties:** ability, activities, attuned, attunement, bonus, chatFlavor, container, description, equipped, identified, identifier, price, proficient, properties, quantity, rarity, source, type, unidentified, uses, weight

**Example: Disguise Kit**
Source: `packs/_source/equipment24/tools/other/disguise-kit.yml`

### consumable

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, effects, flags, folder, img, name, ownership, sort, system, type

**System Properties:** activities, armor, attuned, attunement, capacity, container, cover, crewed, currency, damage, description, equipped, hp, identified, identifier, magicalBonus, price, proficient, properties, quantity, rarity, source, strength, type, unidentified, uses, weight

**Example: Spell Scroll, Cantrip**
Source: `packs/_source/equipment24/adventuring-gear/spell-scroll-cantrip.yml`

### equipment

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, effects, flags, folder, img, name, ownership, sort, system, type

**System Properties:** activities, ammunition, armor, attuned, attunement, capacity, container, cover, crewed, currency, damage, description, equipped, hp, identified, identifier, magicalBonus, mastery, price, proficient, properties, quantity, range, rarity, source, speed, strength, type, unidentified, uses, weight

**Example: Lamp**
Source: `packs/_source/equipment24/adventuring-gear/lamp.yml`

### container

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, effects, flags, folder, img, name, ownership, sort, system, type

**System Properties:** attuned, attunement, capacity, container, currency, description, equipped, identified, identifier, price, properties, quantity, rarity, source, unidentified, weight

**Example: Pouch**
Source: `packs/_source/equipment24/adventuring-gear/pouch/_container.yml`

### spell

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, effects, flags, folder, img, name, ownership, sort, system, type

**System Properties:** activation, activities, description, duration, identifier, level, materials, preparation, properties, range, school, source, target, uses

**Example: Astral Projection**
Source: `packs/_source/spells24/9th-level/astral-projection.yml`

### JournalEntry

**Examples Found:** 3

**Common Properties:** _id, _key, _stats, color, description, flags, folder, name, sort, sorting, type

**System Properties:** 

**Example: Chapter 7**
Source: `packs/_source/content24/chapter-7/_folder.yml`

## Critical Findings for Brancalonia Integration

### Key Advancement Types Found

- **ItemGrant**: 5 examples in 86 files
- **ScaleValue**: 5 examples in 40 files
- **HitPoints**: 5 examples in 36 files
- **AbilityScoreImprovement**: 5 examples in 59 files

**Missing Key Advancements:** SpellcastingValue

### UUID Structure Patterns

Based on analysis, UUIDs follow these patterns:

- `Compendium.dnd-dungeon-masters-guide.*` (1 occurrences)
- `Compendium.dnd-monster-manual.*` (1368 occurrences)
- `Compendium.dnd5e.*` (6431 occurrences)


## Technical Recommendations

### 1. Advancement Structure
- Follow the exact property structure found in the official module
- Ensure all required properties are present for each advancement type
- Use consistent naming conventions

### 2. UUID Management
- Maintain the Compendium.{module}.{type}.{id} pattern
- Ensure UUIDs are unique across the module
- Use descriptive IDs that match the content

### 3. Data Organization
- Follow the same file organization as the official module
- Use consistent property names and structures
- Maintain backward compatibility with existing data

### 4. Integration Strategy
- Map Brancalonia advancement data to match D&D 5e structure
- Ensure proper reference resolution for UUIDs
- Test advancement functionality thoroughly

## Next Steps

1. Use this analysis to update Brancalonia advancement structures
2. Implement proper UUID generation and management
3. Test integration with the official D&D 5e advancement system
4. Validate all advancement types work correctly

---

*This analysis was generated by AGENT_MONITOR for the Brancalonia project*
