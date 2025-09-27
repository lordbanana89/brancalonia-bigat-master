#!/usr/bin/env python3

import json
import os
from pathlib import Path

# Map of broken icon paths to working replacements
ICON_FIXES = {
    "icons/equipment/chest/breastplate-metal-copper.webp": "systems/dnd5e/icons/items/armor/plate.webp",
    "icons/equipment/chest/breastplate": "systems/dnd5e/icons/items/armor/plate.webp",
    # Add more mappings as needed
}

def fix_icon_in_string(text):
    """Fix icon paths in a string (for HTML content)"""
    if not isinstance(text, str):
        return text

    modified = False
    for broken, fixed in ICON_FIXES.items():
        if broken in text:
            text = text.replace(broken, fixed)
            modified = True

    return text

def fix_icon_recursive(obj, path=""):
    """Recursively fix icon paths in any data structure"""
    modified = False

    if isinstance(obj, dict):
        for key, value in obj.items():
            new_value = value

            # Direct img field
            if key == 'img' and isinstance(value, str):
                for broken, fixed in ICON_FIXES.items():
                    if broken in value:
                        new_value = value.replace(broken, fixed)
                        if new_value != value:
                            obj[key] = new_value
                            modified = True
                            print(f"  ✓ Fixed {key} at {path}")
                            break

            # HTML content fields
            elif key in ['value', 'content', 'description', 'text'] and isinstance(value, str):
                new_value = fix_icon_in_string(value)
                if new_value != value:
                    obj[key] = new_value
                    modified = True
                    print(f"  ✓ Fixed HTML in {key} at {path}")

            # Recurse into nested structures
            elif isinstance(value, (dict, list)):
                if fix_icon_recursive(value, f"{path}.{key}"):
                    modified = True

    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            if isinstance(item, (dict, list)):
                if fix_icon_recursive(item, f"{path}[{i}]"):
                    modified = True
            elif isinstance(item, str):
                new_item = fix_icon_in_string(item)
                if new_item != item:
                    obj[i] = new_item
                    modified = True
                    print(f"  ✓ Fixed string at {path}[{i}]")

    return modified

def process_file(file_path):
    """Process a single JSON file to fix all icon references"""

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if fix_icon_recursive(data, os.path.basename(file_path)):
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True

    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        # Skip non-JSON files
        pass

    return False

def main():
    """Fix all icon references in all packs"""

    packs_dir = Path("packs")
    fixed_total = 0

    # Process all _source directories
    for pack_dir in packs_dir.glob("*/_source"):
        pack_name = pack_dir.parent.name
        files = list(pack_dir.glob("*.json"))

        if not files:
            continue

        print(f"\n📦 Checking {pack_name} ({len(files)} files)...")
        fixed = 0

        for file_path in files:
            if process_file(file_path):
                fixed += 1
                fixed_total += 1

        if fixed > 0:
            print(f"  ✅ Fixed {fixed} files in {pack_name}")

    # Also check journal entries and other packs that might contain HTML
    print(f"\n✅ Total: Fixed {fixed_total} files across all packs")

if __name__ == "__main__":
    print("=== FIXING ALL ICON 404 ERRORS ===\n")
    main()