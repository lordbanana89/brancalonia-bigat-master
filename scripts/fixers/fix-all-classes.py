#!/usr/bin/env python3
"""
Fix all D&D 5e class items to be compatible with Foundry v13 and D&D 5e v5.x.
This script processes all class files in packs/classi/_source/ and updates them
with the correct structure for the new system.
"""

import json
import os
from pathlib import Path

# Mapping of Italian class names to their D&D counterparts and primary abilities
CLASS_MAPPING = {
    "barbaro.json": {
        "identifier": "barbarian",
        "primaryAbility": ["str"],
        "hitDie": "d12"
    },
    "bardo.json": {
        "identifier": "bard",
        "primaryAbility": ["cha"],
        "hitDie": "d8"
    },
    "chierico.json": {
        "identifier": "cleric",
        "primaryAbility": ["wis"],
        "hitDie": "d8"
    },
    "druido.json": {
        "identifier": "druid",
        "primaryAbility": ["wis"],
        "hitDie": "d8"
    },
    "guerriero.json": {
        "identifier": "fighter",
        "primaryAbility": ["str", "dex"],
        "hitDie": "d10"
    },
    "ladro.json": {
        "identifier": "rogue",
        "primaryAbility": ["dex"],
        "hitDie": "d8"
    },
    "mago.json": {
        "identifier": "wizard",
        "primaryAbility": ["int"],
        "hitDie": "d6"
    },
    "monaco.json": {
        "identifier": "monk",
        "primaryAbility": ["dex", "wis"],
        "hitDie": "d8"
    },
    "paladino.json": {
        "identifier": "paladin",
        "primaryAbility": ["str", "cha"],
        "hitDie": "d10"
    },
    "ranger.json": {
        "identifier": "ranger",
        "primaryAbility": ["dex", "wis"],
        "hitDie": "d10"
    },
    "stregone.json": {
        "identifier": "sorcerer",
        "primaryAbility": ["cha"],
        "hitDie": "d6"
    },
    "warlock.json": {
        "identifier": "warlock",
        "primaryAbility": ["cha"],
        "hitDie": "d8"
    }
}

def create_hit_points_advancement():
    """Create hit points advancement for level 1"""
    return {
        "_id": "HitPoints.1",
        "type": "HitPoints",
        "configuration": {},
        "value": {},
        "level": 1,
        "title": "",
        "icon": "",
        "classRestriction": "primary"
    }

def create_asi_advancement(level):
    """Create Ability Score Improvement advancement for specified level"""
    return {
        "_id": f"ASI.{level}",
        "type": "AbilityScoreImprovement",
        "configuration": {
            "fixed": {},
            "points": 2,
            "cap": 2
        },
        "value": {
            "type": "asi"
        },
        "level": level,
        "title": "",
        "icon": "",
        "classRestriction": "primary"
    }

def fix_class_file(file_path, class_info):
    """Fix a single class file with the new v13/5.x structure"""
    print(f"Processing {file_path}...")

    try:
        # Read the current file
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Backup original data for comparison
        original_hit_dice = data.get('system', {}).get('hitDice')

        # 1. Fix hit dice structure
        if 'hitDice' in data['system']:
            hit_dice_value = data['system']['hitDice']
            # Convert string to new hd structure
            data['system']['hd'] = {
                "denomination": class_info['hitDie'],
                "spent": 0
            }
            # Remove old hitDice field
            del data['system']['hitDice']
            print(f"  ✓ Fixed hitDice: '{hit_dice_value}' -> hd: {data['system']['hd']}")

        # 2. Add primaryAbility field
        data['system']['primaryAbility'] = class_info['primaryAbility']
        print(f"  ✓ Added primaryAbility: {class_info['primaryAbility']}")

        # 3. Add startingEquipment field
        data['system']['startingEquipment'] = []
        print(f"  ✓ Added startingEquipment: []")

        # 4. Add advancement array with Hit Points and ASI
        advancement = []

        # Add Hit Points advancement at level 1
        advancement.append(create_hit_points_advancement())

        # Add ASI at levels 4, 8, 12, 16, 19
        asi_levels = [4, 8, 12, 16, 19]
        for level in asi_levels:
            advancement.append(create_asi_advancement(level))

        data['system']['advancement'] = advancement
        print(f"  ✓ Added advancement array with {len(advancement)} items (1 HitPoints + {len(asi_levels)} ASI)")

        # Write the fixed file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"  ✓ Successfully fixed {file_path}")
        return True

    except Exception as e:
        print(f"  ✗ Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all class files"""
    # Define the source directory
    source_dir = Path("/Users/erik/Desktop/brancalonia-bigat-master/packs/classi/_source")

    if not source_dir.exists():
        print(f"Error: Source directory does not exist: {source_dir}")
        return

    print("D&D 5e Class Fixer for Foundry v13 and D&D 5e v5.x")
    print("=" * 60)
    print(f"Processing files in: {source_dir}")
    print()

    success_count = 0
    total_count = 0

    # Process each class file
    for filename, class_info in CLASS_MAPPING.items():
        file_path = source_dir / filename

        if file_path.exists():
            total_count += 1
            if fix_class_file(file_path, class_info):
                success_count += 1
            print()  # Add blank line between files
        else:
            print(f"Warning: File not found: {file_path}")

    # Print summary
    print("=" * 60)
    print(f"Processing complete!")
    print(f"Successfully fixed: {success_count}/{total_count} files")

    if success_count == total_count:
        print("✓ All class files have been successfully updated!")
    else:
        print(f"✗ {total_count - success_count} files had errors and may need manual review")

    print()
    print("Changes made to each file:")
    print("1. hitDice (string) -> hd: {denomination: 'dX', spent: 0}")
    print("2. Added primaryAbility field with correct abilities for each class")
    print("3. Added startingEquipment field as empty array")
    print("4. Added advancement array with Hit Points (level 1) and ASI (levels 4,8,12,16,19)")

if __name__ == "__main__":
    main()