#!/usr/bin/env python3

import json
import os
import random
import string

def generate_id():
    """Generate a valid 16-character alphanumeric ID"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=16))

def fix_advancement_ids(directory):
    """Fix all advancement IDs to be 16 characters"""
    fixed_count = 0

    for filename in os.listdir(directory):
        if not filename.endswith('.json'):
            continue

        filepath = os.path.join(directory, filename)

        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        modified = False

        # Check advancement array
        if 'system' in data and 'advancement' in data['system']:
            for adv in data['system']['advancement']:
                if '_id' in adv:
                    # Check if ID is not 16 alphanumeric chars
                    if not (len(adv['_id']) == 16 and adv['_id'].isalnum()):
                        old_id = adv['_id']
                        new_id = generate_id()
                        adv['_id'] = new_id
                        print(f"  {filename}: Fixed ID '{old_id}' -> '{new_id}' (type: {adv.get('type', 'unknown')})")
                        fixed_count += 1
                        modified = True

        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

    return fixed_count

if __name__ == "__main__":
    print("=== FIXING ADVANCEMENT IDS ===\n")

    # Fix backgrounds
    backgrounds_dir = "packs/backgrounds/_source"
    print(f"Checking {backgrounds_dir}...")
    count = fix_advancement_ids(backgrounds_dir)

    print(f"\n✅ Fixed {count} advancement IDs")