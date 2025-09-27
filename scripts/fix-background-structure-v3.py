#!/usr/bin/env python3
"""
Fix background structure to match D&D 5e requirements.
Based on research of the official D&D 5e system code.
"""

import json
import os
from pathlib import Path
import uuid

def generate_id():
    """Generate a random ID"""
    return ''.join(str(uuid.uuid4()).split('-'))[:16]

def fix_background_advancement_values(advancement):
    """Fix advancement to have proper value fields populated"""

    if advancement['type'] == 'Improvement':
        # For skills
        if 'skills' in advancement.get('configuration', {}):
            if advancement['configuration']['skills'].get('fixed'):
                advancement['value'] = {
                    'skills': advancement['configuration']['skills']['fixed']
                }

        # For tools
        if 'tools' in advancement.get('configuration', {}):
            # Tools with choices need the count in value
            if advancement['configuration']['tools'].get('chosen'):
                advancement['value'] = {
                    'tools': {
                        'chosen': []  # Will be populated when user selects
                    }
                }

        # For languages
        if 'languages' in advancement.get('configuration', {}):
            if advancement['configuration']['languages'].get('fixed'):
                advancement['value'] = {
                    'languages': advancement['configuration']['languages']['fixed']
                }

    return advancement

def create_starting_equipment_structure(bg_data, database_bg):
    """Create proper startingEquipment structure from database info"""

    equipment_entries = []

    # Get equipment from database
    equip_list = database_bg.get('dettagli', {}).get('equipaggiamento', [])

    for idx, item_name in enumerate(equip_list):
        entry_id = generate_id()

        # Determine item type and key
        if 'monile' in item_name.lower() or 'santa' in item_name.lower():
            # Holy symbol/trinket
            equipment_entries.append({
                "_id": entry_id,
                "group": "",
                "sort": idx * 100000,
                "type": "linked",
                "count": 1,
                "key": f"Compendium.brancalonia.brancalonia-equipment.Item.equip-bg-{bg_data['_id']}-monile"
            })
        elif 'abito' in item_name.lower() or 'viaggiator' in item_name.lower():
            # Clothing
            equipment_entries.append({
                "_id": entry_id,
                "group": "",
                "sort": idx * 100000,
                "type": "linked",
                "count": 1,
                "key": f"Compendium.brancalonia.brancalonia-equipment.Item.equip-bg-{bg_data['_id']}-abito"
            })
        elif 'borsa' in item_name.lower():
            # Pouch
            equipment_entries.append({
                "_id": entry_id,
                "group": "",
                "sort": idx * 100000,
                "type": "linked",
                "count": 1,
                "key": f"Compendium.brancalonia.brancalonia-equipment.Item.equip-bg-{bg_data['_id']}-borsa"
            })

    return equipment_entries

def get_wealth_formula(database_bg):
    """Get starting wealth as a dice formula"""
    wealth = database_bg.get('dettagli', {}).get('ricchezza_iniziale', '')

    # Convert "15 ma" to dice formula
    if '15 ma' in wealth or '15ma' in wealth:
        # 15 silver pieces = 1.5 gold pieces
        return "1d4 + 1"  # Approximate value in gp

    return ""

def fix_background(bg_file, database_path):
    """Fix a single background file"""

    with open(bg_file, 'r', encoding='utf-8') as f:
        bg_data = json.load(f)

    # Load corresponding database file
    db_file = database_path / f"{bg_data['_id']}.json"
    if db_file.exists():
        with open(db_file, 'r', encoding='utf-8') as f:
            database_bg = json.load(f)
    else:
        print(f"  Warning: No database file for {bg_data['_id']}")
        database_bg = {}

    # 1. Fix all advancement values
    if 'advancement' in bg_data.get('system', {}):
        new_advancements = []
        equipment_grant_idx = -1

        for idx, adv in enumerate(bg_data['system']['advancement']):
            # Skip equipment ItemGrant - we'll use startingEquipment instead
            if adv.get('type') == 'ItemGrant' and 'equipaggiamento' in adv.get('title', '').lower():
                equipment_grant_idx = idx
                continue

            # Fix the advancement values
            adv = fix_background_advancement_values(adv)
            new_advancements.append(adv)

        bg_data['system']['advancement'] = new_advancements

    # 2. Add startingEquipment field
    if database_bg:
        bg_data['system']['startingEquipment'] = create_starting_equipment_structure(bg_data, database_bg)

        # 3. Add wealth field (optional, for starting gold)
        wealth_formula = get_wealth_formula(database_bg)
        if wealth_formula:
            bg_data['system']['wealth'] = wealth_formula
    else:
        # Minimal startingEquipment structure
        bg_data['system']['startingEquipment'] = []

    # 4. Ensure ItemGrant for feature has proper structure
    for adv in bg_data['system'].get('advancement', []):
        if adv.get('type') == 'ItemGrant' and adv.get('title') != 'Equipaggiamento Iniziale':
            # This should be the background feature
            if not adv.get('value'):
                adv['value'] = {
                    'items': []  # Will be populated when granted
                }

    # 5. Add required background flags
    if 'flags' not in bg_data:
        bg_data['flags'] = {}

    if 'dnd5e' not in bg_data['flags']:
        bg_data['flags']['dnd5e'] = {}

    # Mark as properly configured
    bg_data['flags']['dnd5e']['backgroundConfigured'] = True

    return bg_data

def main():
    backgrounds_path = Path('/Users/erik/Desktop/brancalonia-bigat-master/packs/backgrounds/_source')
    database_path = Path('/Users/erik/Desktop/brancalonia-bigat-master/database/backgrounds')

    fixed_count = 0
    errors = []

    print("Fixing background structures for D&D 5e compatibility...")
    print("=" * 60)

    for bg_file in backgrounds_path.glob('*.json'):
        try:
            print(f"\nProcessing: {bg_file.name}")

            # Fix the background
            fixed_bg = fix_background(bg_file, database_path)

            # Save the fixed version
            with open(bg_file, 'w', encoding='utf-8') as f:
                json.dump(fixed_bg, f, ensure_ascii=False, indent=2)

            fixed_count += 1
            print(f"  ✓ Fixed advancement values")
            print(f"  ✓ Added startingEquipment field")
            print(f"  ✓ Updated structure for lifecycle hooks")

        except Exception as e:
            error_msg = f"Error fixing {bg_file.name}: {str(e)}"
            print(f"  ✗ {error_msg}")
            errors.append(error_msg)

    print("\n" + "=" * 60)
    print(f"Summary: Fixed {fixed_count} backgrounds")

    if errors:
        print(f"\nErrors encountered:")
        for error in errors:
            print(f"  - {error}")

    print("\nNext steps:")
    print("1. Run: fvtt package pack to compile the backgrounds")
    print("2. Test in Foundry to verify advancement application")
    print("3. Check that skills, tools, languages are granted")
    print("4. Verify starting equipment appears correctly")

if __name__ == '__main__':
    main()