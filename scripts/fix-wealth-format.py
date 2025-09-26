#!/usr/bin/env python3

import json
import os
from pathlib import Path

def fix_wealth(wealth_str):
    """Convert wealth to valid dice formula or remove it"""
    if not wealth_str:
        return None

    # Extract numeric value
    if 'gp' in wealth_str:
        try:
            # Extract number before 'gp'
            amount = wealth_str.replace('gp', '').strip()
            # Return as a dice formula: XdY where result equals the amount
            # For simplicity, use 1dX format
            return f"{amount}d1"
        except:
            pass

    # If we can't parse it, remove it entirely
    # D&D 5e backgrounds don't actually need a wealth field
    return None

def process_background(file_path):
    """Process a background file to fix wealth"""

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    modified = False

    if 'system' in data and 'wealth' in data['system']:
        old_wealth = data['system']['wealth']

        # For backgrounds, it's better to remove wealth entirely
        # as it's not a standard D&D 5e background field
        del data['system']['wealth']
        modified = True
        print(f"  ✓ Removed wealth field from {data['name']} (was: {old_wealth})")

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True

    return False

def main():
    """Fix all background wealth fields"""

    bg_dir = Path("packs/backgrounds/_source")

    if not bg_dir.exists():
        print("❌ Backgrounds directory not found")
        return

    files = [f for f in bg_dir.iterdir() if f.suffix == '.json']
    fixed = 0

    print(f"Processing {len(files)} background files...")

    for file_path in files:
        if process_background(file_path):
            fixed += 1

    print(f"\n✅ Fixed {fixed} backgrounds")

if __name__ == "__main__":
    print("=== FIXING BACKGROUND WEALTH FORMAT ===\n")
    main()