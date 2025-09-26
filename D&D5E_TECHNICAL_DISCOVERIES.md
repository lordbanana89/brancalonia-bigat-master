# D&D 5e Technical Implementation Discoveries

## Executive Summary

Through deep analysis of the official D&D 5e repository (v5.1.9), we've discovered critical technical details about how advancement systems, ItemGrant mechanics, spell progression, and data structures are actually implemented. This analysis provides actionable insights for improving the Brancalonia system.

## Key Technical Discoveries

### 1. ItemGrant Implementation Analysis

#### UUID Format & Structure
**CRITICAL DISCOVERY**: ItemGrant uses string-based UUID references with the format:
```javascript
{
  uuid: "Compendium.pack.type.id", // String UUID reference
  optional: false                   // Boolean for optional items
}
```

#### Actual ItemGrant Schema (from source code):
```javascript
// ItemGrantConfigurationData schema
{
  items: new ArrayField(new SchemaField({
    uuid: new StringField(),        // Simple string, not complex object
    optional: new BooleanField()    // Per-item optional flag
  }), { required: true }),
  optional: new BooleanField({ required: true }),  // Global optional flag
  spell: new EmbeddedDataField(SpellConfigurationData, {
    required: true, nullable: true, initial: null
  })
}
```

**Migration Pattern Discovered**:
```javascript
static migrateData(source) {
  if ( "items" in source ) {
    // Convert old string format to new object format
    source.items = source.items.map(i =>
      foundry.utils.getType(i) === "string" ? { uuid: i } : i
    );
  }
  return source;
}
```

### 2. Advancement System Architecture

#### Core Advancement Types (from _module.mjs):
- `BaseAdvancement` - Foundation class
- `AbilityScoreImprovement` - ASI handling
- `ItemChoice` - Multiple item selection
- `ItemGrantConfigurationData` - Single/multiple item grants
- `ScaleValue` - Level-based scaling values
- `Size` - Size changes
- `Trait` - Feature/trait grants
- `Subclass` - Subclass selection
- `SpellConfigurationData` - Spell modifications

#### Advancement Data Structure:
```javascript
this.advancement = {
  byId: {},                    // Advancement objects by ID
  byLevel: {},                // Arrays of advancements by level
  byType: {},                 // Arrays by advancement type
  needingConfiguration: []    // Unconfigured advancements
};
```

### 3. Spell Progression Implementation

#### Spellcasting Configuration:
```javascript
// From discovered data structure
spellcasting: {
  progression: "full" | "half" | "third" | "none",
  ability: "int" | "wis" | "cha"
}
```

#### Advanced Spell Configuration Features:
- `SpellConfigurationData` embedded in ItemGrant for spell modifications
- Support for spell preparation modes
- Concentration tracking and management
- Ritual casting capabilities

### 4. Scale Value System

#### Scale Value Types Discovered:
```javascript
const TYPES = {
  string: ScaleValueType,           // Generic string values
  number: ScaleValueTypeNumber,     // Numeric values
  cr: ScaleValueTypeCR,            // Challenge Rating values
  dice: ScaleValueTypeDice,        // Dice notation (e.g., "2d6")
  distance: ScaleValueTypeDistance // Distance with units
};
```

#### Scale Value Schema:
```javascript
{
  identifier: new IdentifierField({ required: true }),
  type: new StringField({ required: true, initial: "string", choices: TYPES }),
  distance: new SchemaField({ units: new StringField({ required: true }) }),
  scale: new MappingField(new ScaleValueEntryField(), { required: true })
}
```

### 5. Data Migration Patterns

#### Version Migration Strategy:
```javascript
// Automatic data migration on load
static migrateData(source) {
  if ( source.type === "numeric" ) source.type = "number";
  Object.values(source.scale ?? {}).forEach(v =>
    TYPES[source.type].migrateData(v)
  );
}
```

### 6. System Architecture Insights

#### Pack Structure:
- **Binary Packs**: Data stored in `.db` files, not JSON
- **Modern vs Legacy**: Separate content folders (SRD 5.1 vs SRD 5.2)
- **Source Books**: Structured organization with `sourceBook` flags

#### Document Types Hierarchy:
```javascript
documentTypes: {
  Item: {
    "race", "background", "class", "subclass", "feat",
    "weapon", "equipment", "spell", "consumable", "tool",
    "loot", "container", "facility"
  },
  Actor: {
    "character", "npc", "vehicle", "group", "encounter"
  }
}
```

## Critical Implementation Differences vs Brancalonia

### 1. ItemGrant Structure
**Current Brancalonia**:
```javascript
"uuid": "Compendium.brancalonia.brancalonia-features.Item.feat-bg-ambulante"
```

**Official D&D 5e**: ✅ **Identical format** - our implementation is correct!

### 2. Advancement Organization
**Discovery**: D&D 5e uses sophisticated advancement categorization:
- By level (`byLevel`)
- By type (`byType`)
- By ID (`byId`)
- Needing configuration tracking

### 3. Scale Values
**Missing in Brancalonia**: The powerful scale value system that allows:
- Level-based progression of any value type
- Dice scaling (e.g., "1d4" at level 1, "2d4" at level 5)
- Distance scaling with units
- String template scaling

### 4. Spell Integration
**D&D 5e Advantage**: Deep integration between ItemGrant and spell configuration
- Spell modification data embedded in ItemGrant
- Automatic spell preparation handling
- Concentration management

## Recommended Improvements for Brancalonia

### 1. Implement Scale Value System
```javascript
// Add to class advancement
{
  "_id": "ScaleValue.rageUses",
  "type": "ScaleValue",
  "configuration": {
    "identifier": "rage-uses",
    "type": "number",
    "scale": {
      "1": { "value": 2 },
      "3": { "value": 3 },
      "6": { "value": 4 },
      "12": { "value": 5 },
      "17": { "value": 6 },
      "20": { "value": 999 }
    }
  }
}
```

### 2. Enhanced ItemGrant Configuration
```javascript
// Add spell configuration support
{
  "type": "ItemGrant",
  "configuration": {
    "items": [
      {
        "uuid": "Compendium.brancalonia.spells.Item.benedizione",
        "optional": false
      }
    ],
    "optional": false,
    "spell": {
      "preparation": "always",
      "ability": "wis"
    }
  }
}
```

### 3. Advancement Organization
```javascript
// Add advancement processing system
_prepareAdvancement() {
  this.advancement = {
    byId: {},
    byLevel: Array.fromRange(21).reduce((obj, l) => { obj[l] = []; return obj; }, {}),
    byType: {},
    needingConfiguration: []
  };
  // Process advancement arrays...
}
```

### 4. Data Migration Support
```javascript
// Add migration patterns for backwards compatibility
static migrateData(source) {
  // Handle old string-only ItemGrant format
  if ("items" in source && Array.isArray(source.items)) {
    source.items = source.items.map(item =>
      typeof item === "string" ? { uuid: item, optional: false } : item
    );
  }
  return source;
}
```

## Spell Progression Implementation Guide

### Full Caster (Mago):
```javascript
spellcasting: {
  progression: "full",
  ability: "int"
}
```

### Half Caster (Paladino):
```javascript
spellcasting: {
  progression: "half",
  ability: "cha"
}
```

### Third Caster (Arcane Trickster):
```javascript
spellcasting: {
  progression: "third",
  ability: "int"
}
```

## RollTable Structure (Limited Discovery)

Based on system.json analysis:
- RollTables stored in binary format in packs
- Support for weighted results
- Integration with dice formulas
- Ownership and permission controls

## Performance & Architecture Notes

### 1. Module Structure
- Clean separation between data models and documents
- Extensive use of mixins for shared functionality
- Template-based inheritance for item types

### 2. Data Validation
- Schema-based validation with Foundry data fields
- Type checking and automatic coercion
- Migration support for version upgrades

### 3. Localization
- Centralized localization prefixes
- Hierarchical language key organization
- Support for multiple source books

## Action Items for Brancalonia

### High Priority
1. ✅ **ItemGrant format is correct** - no changes needed
2. 🔧 **Implement Scale Value advancement type**
3. 🔧 **Add advancement organization system**
4. 🔧 **Enhance spell integration in ItemGrant**

### Medium Priority
1. 📊 **Add data migration support**
2. 🏗️ **Implement advancement by level/type indexing**
3. 🎯 **Add dice-based scale values**

### Low Priority
1. 📚 **Source book organization**
2. 🎨 **Enhanced localization structure**
3. 🔍 **RollTable integration improvements**

## Conclusion

The D&D 5e system demonstrates sophisticated advancement management with powerful scaling systems and flexible ItemGrant mechanics. Our current Brancalonia implementation aligns well with the UUID format, but could benefit significantly from implementing scale values and enhanced advancement organization.

The most impactful improvement would be adding the Scale Value system, which would enable level-based progression for features like Barbarian rage uses, Monk ki points, and spell slot scaling.

---

*Analysis completed: 2025-09-27*
*Source: D&D 5e System v5.1.9*
*Repository: https://github.com/foundryvtt/dnd5e/tree/release-5.1.9*