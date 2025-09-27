#!/usr/bin/env python3

import json
import os
from pathlib import Path

def generate_id_from_filename(filename):
    """Generate an ID from filename"""
    # Remove .json extension
    base = filename.replace('.json', '')
    # Replace hyphens with empty string for ID
    # Keep the base name structure
    return base

def add_missing_ids(pack_name):
    """Add missing _id fields to pack files"""

    source_dir = Path(f"packs/{pack_name}/_source")

    if not source_dir.exists():
        print(f"❌ {pack_name}: source directory not found")
        return 0

    fixed_count = 0

    for json_file in source_dir.glob("*.json"):
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Check if _id is missing
        if '_id' not in data or not data['_id']:
            # Generate ID from filename
            new_id = generate_id_from_filename(json_file.name)
            data['_id'] = new_id

            # Save the file
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            print(f"  ✅ {json_file.name}: added _id = {new_id}")
            fixed_count += 1

    return fixed_count

if __name__ == "__main__":
    print("=== ADDING MISSING IDs ===\n")

    packs = ['incantesimi', 'brancalonia-features']

    total_fixed = 0

    for pack in packs:
        print(f"Processing {pack}...")
        count = add_missing_ids(pack)
        total_fixed += count
        print(f"  Fixed {count} files\n")

    print(f"✅ Total files fixed: {total_fixed}")