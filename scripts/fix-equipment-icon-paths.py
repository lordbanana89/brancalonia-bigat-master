#!/usr/bin/env python3

import json
import os
from pathlib import Path

def fix_icon_path(img_path):
    """Fix the icon path to use the correct D&D 5e system path"""

    # Map of wrong paths to correct paths
    icon_fixes = {
        "icons/equipment/chest/breastplate-metal-copper.webp": "systems/dnd5e/icons/items/armor/plate.webp",
        # Add more mappings as needed
    }

    # Check if this specific path needs fixing
    if img_path in icon_fixes:
        return icon_fixes[img_path]

    # General fix for equipment icons
    if "icons/equipment/chest/breastplate" in img_path:
        return "systems/dnd5e/icons/items/armor/plate.webp"

    return img_path

def process_file(file_path):
    """Process a single JSON file to fix icon paths"""

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        modified = False

        # Check and fix img field
        if 'img' in data:
            new_path = fix_icon_path(data['img'])
            if new_path != data['img']:
                data['img'] = new_path
                modified = True
                print(f"  ✓ Fixed icon path in {os.path.basename(file_path)}")

        # Check and fix system.img if it exists
        if 'system' in data and 'img' in data['system']:
            new_path = fix_icon_path(data['system']['img'])
            if new_path != data['system']['img']:
                data['system']['img'] = new_path
                modified = True
                print(f"  ✓ Fixed system.img path in {os.path.basename(file_path)}")

        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True

    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        print(f"  ⚠️  Error processing {file_path}: {e}")

    return False

def main():
    """Fix all equipment icon paths"""

    # Process main equipment pack
    equip_dir = Path("packs/equipaggiamento/_source")

    if equip_dir.exists():
        files = [f for f in os.listdir(equip_dir) if f.endswith('.json')]
        fixed = 0

        print(f"Processing {len(files)} equipment files...")

        for file_name in files:
            file_path = equip_dir / file_name
            if process_file(file_path):
                fixed += 1

        print(f"\n✅ Fixed {fixed} equipment files")
    else:
        print("❌ Equipment directory not found")

if __name__ == "__main__":
    print("=== FIXING EQUIPMENT ICON PATHS ===\n")
    main()