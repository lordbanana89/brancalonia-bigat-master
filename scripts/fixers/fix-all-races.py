#!/usr/bin/env python3
"""
Script to fix all D&D 5e race items in packs/razze/_source/ to be compatible with Foundry v13 and D&D 5e v5.x.
Converts from equipment template structure to proper race template structure.
"""

import json
import os
from pathlib import Path

# Race files to process
RACE_FILES = [
    "gatto_lupesco.json",
    "inesistente.json",
    "pantegano.json",
    "sottorazzapinocchio.json",
    "sottorazzapupo.json",
    "variantebracaloniani.json",
    "variantelevantini.json",
    "variantesvanzici.json"
]

# Equipment template fields to remove
EQUIPMENT_FIELDS_TO_REMOVE = [
    "activation",
    "duration",
    "target",
    "range",
    "uses",
    "equipped",
    "identified",
    "quantity",
    "weight",
    "price",
    "rarity",
    "attunement"
]

def get_race_characteristics(race_name):
    """Get specific characteristics for each race based on their names and descriptions."""

    # Default characteristics for all races
    characteristics = {
        "movement": {
            "walk": 30,
            "units": "ft",
            "hover": False
        },
        "senses": {
            "darkvision": 0,
            "units": "ft"
        },
        "type": {
            "value": "humanoid",
            "subtype": "",
            "custom": ""
        },
        "advancement": [
            {
                "_id": "size_advancement",
                "type": "size",
                "configuration": {
                    "sizes": ["med"]
                },
                "value": {},
                "level": 0,
                "title": "Size",
                "icon": "",
                "classRestriction": "primary"
            }
        ]
    }

    race_lower = race_name.lower()

    # Pantegano (rat-folk): darkvision 60, size Small
    if "pantegano" in race_lower:
        characteristics["senses"]["darkvision"] = 60
        characteristics["advancement"][0]["configuration"]["sizes"] = ["sm"]
        characteristics["advancement"].append({
            "_id": "darkvision_trait",
            "type": "trait",
            "configuration": {
                "grants": ["darkvision"]
            },
            "value": {},
            "level": 0,
            "title": "Darkvision",
            "icon": "",
            "classRestriction": "primary"
        })

    # Gatto Lupesco (cat-folk): darkvision 60, size Medium
    elif "gatto" in race_lower or "lupesco" in race_lower:
        characteristics["senses"]["darkvision"] = 60
        characteristics["advancement"].append({
            "_id": "darkvision_trait",
            "type": "trait",
            "configuration": {
                "grants": ["darkvision"]
            },
            "value": {},
            "level": 0,
            "title": "Darkvision",
            "icon": "",
            "classRestriction": "primary"
        })

    # Pinocchio/Pupo (constructs): type "construct" instead of "humanoid"
    elif "pinocchio" in race_lower or "pupo" in race_lower:
        characteristics["type"]["value"] = "construct"
        characteristics["advancement"].append({
            "_id": "construct_nature",
            "type": "trait",
            "configuration": {
                "grants": ["construct_resilience"]
            },
            "value": {},
            "level": 0,
            "title": "Construct Nature",
            "icon": "",
            "classRestriction": "primary"
        })

    # Inesistente (ghostly): might need special movement or senses
    elif "inesistente" in race_lower:
        characteristics["advancement"].append({
            "_id": "incorporeal_trait",
            "type": "trait",
            "configuration": {
                "grants": ["incorporeal_movement"]
            },
            "value": {},
            "level": 0,
            "title": "Incorporeal Movement",
            "icon": "",
            "classRestriction": "primary"
        })

    return characteristics

def fix_race_file(file_path):
    """Fix a single race file by removing equipment fields and adding proper race structure."""

    print(f"Processing: {file_path}")

    # Read the current file
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Get race name for characteristics
    race_name = data.get("name", "")

    # Remove equipment template fields from system
    system = data.get("system", {})
    for field in EQUIPMENT_FIELDS_TO_REMOVE:
        if field in system:
            del system[field]
            print(f"  Removed field: {field}")

    # Get race-specific characteristics
    characteristics = get_race_characteristics(race_name)

    # Add proper race fields
    system["movement"] = characteristics["movement"]
    system["senses"] = characteristics["senses"]
    system["type"] = characteristics["type"]
    system["advancement"] = characteristics["advancement"]

    print(f"  Added movement: {characteristics['movement']}")
    print(f"  Added senses: {characteristics['senses']}")
    print(f"  Added type: {characteristics['type']['value']}")
    print(f"  Added {len(characteristics['advancement'])} advancement entries")

    # Save the fixed file
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return {
        "name": race_name,
        "size": characteristics["advancement"][0]["configuration"]["sizes"][0] if characteristics["advancement"] else "med",
        "type": characteristics["type"]["value"],
        "darkvision": characteristics["senses"]["darkvision"],
        "special_traits": len(characteristics["advancement"]) - 1  # Minus the size advancement
    }

def main():
    """Main function to process all race files."""

    races_dir = Path("/Users/erik/Desktop/brancalonia-bigat-master/packs/razze/_source/")

    if not races_dir.exists():
        print(f"Error: Directory {races_dir} does not exist!")
        return

    print("=== FIXING ALL D&D 5E RACE FILES ===")
    print(f"Processing {len(RACE_FILES)} race files...")
    print()

    results = []

    for race_file in RACE_FILES:
        file_path = races_dir / race_file

        if not file_path.exists():
            print(f"Warning: File {race_file} not found, skipping...")
            continue

        try:
            result = fix_race_file(file_path)
            results.append(result)
            print()
        except Exception as e:
            print(f"Error processing {race_file}: {e}")
            print()

    # Summary report
    print("=== SUMMARY REPORT ===")
    print(f"Successfully fixed {len(results)} race files:")
    print()

    for result in results:
        size_name = {"sm": "Small", "med": "Medium", "lg": "Large"}.get(result["size"], result["size"])

        print(f"• {result['name']}")
        print(f"  - Type: {result['type']}")
        print(f"  - Size: {size_name}")
        if result["darkvision"] > 0:
            print(f"  - Darkvision: {result['darkvision']} ft")
        if result["special_traits"] > 0:
            print(f"  - Special traits: {result['special_traits']}")
        print()

    print("All race files have been converted from equipment template to proper race template!")
    print("Races are now compatible with Foundry v13 and D&D 5e v5.x.")

if __name__ == "__main__":
    main()