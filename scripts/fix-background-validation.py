#!/usr/bin/env python3

import json
import os
from pathlib import Path

def fix_background(bg_path):
    """Fix validation errors in background documents"""

    with open(bg_path, 'r', encoding='utf-8') as f:
        doc = json.load(f)

    modified = False

    # Remove startingEquipment - it's not supported in D&D 5e backgrounds
    if 'startingEquipment' in doc['system']:
        del doc['system']['startingEquipment']
        modified = True
        print(f"  ✓ Removed startingEquipment from {doc['name']}")

    # Fix wealth format - convert "X ma" to dice formula
    if 'wealth' in doc['system']:
        wealth = doc['system']['wealth']
        if 'ma' in wealth.lower():
            # Extract number
            amount = wealth.split()[0] if wealth.split() else "10"
            try:
                # Convert to standard gp equivalent (1 ma = 1 gp for simplicity)
                doc['system']['wealth'] = f"{amount}gp"
                modified = True
                print(f"  ✓ Fixed wealth format: {wealth} → {amount}gp")
            except:
                # Default to 10gp if parsing fails
                doc['system']['wealth'] = "10gp"
                modified = True
                print(f"  ✓ Fixed wealth format: {wealth} → 10gp (default)")

    # Remove traits.personalityTraits.table etc if they exist
    # These should be in the description as rolltables, not as system fields
    if 'traits' in doc['system']:
        if any(k in doc['system']['traits'] for k in ['personalityTraits', 'ideals', 'bonds', 'flaws']):
            # Keep only standard D&D 5e traits
            allowed_traits = ['size', 'di', 'dv', 'dr', 'ci', 'cv', 'cr', 'languages', 'weaponProf', 'armorProf', 'toolProf', 'saves', 'skills', 'senses']
            new_traits = {}
            for key in allowed_traits:
                if key in doc['system']['traits']:
                    new_traits[key] = doc['system']['traits'][key]

            if new_traits != doc['system']['traits']:
                doc['system']['traits'] = new_traits if new_traits else {}
                modified = True
                print(f"  ✓ Cleaned traits object")

    return doc, modified

def main():
    """Fix all backgrounds"""

    bg_dir = Path("packs/backgrounds/_source")

    # Get all background files
    bg_files = [f for f in os.listdir(bg_dir) if f.endswith('.json')]

    fixed = 0

    for bg_file in bg_files:
        bg_path = bg_dir / bg_file

        # Fix background
        doc, modified = fix_background(bg_path)

        if modified:
            # Save updated document
            with open(bg_path, 'w', encoding='utf-8') as f:
                json.dump(doc, f, indent=2, ensure_ascii=False)

            fixed += 1

    print(f"\n✅ Fixed {fixed} backgrounds")

if __name__ == "__main__":
    print("=== FIXING BACKGROUND VALIDATION ERRORS ===\n")
    main()