#!/usr/bin/env python3

import os
import json

def fix_keys(directory):
    fixed = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.json'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r') as f:
                        data = json.load(f)

                    modified = False

                    # Fix incorrect key formats
                    if '_key' in data:
                        old_key = data['_key']
                        # Fix !items! to !item!
                        if '!items!' in old_key:
                            data['_key'] = old_key.replace('!items!', '!item!')
                            print(f"Fixed key in {os.path.basename(filepath)}: {old_key} -> {data['_key']}")
                            modified = True

                    if modified:
                        with open(filepath, 'w') as f:
                            json.dump(data, f, indent=2, ensure_ascii=False)
                            f.write('\n')
                        fixed += 1

                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

    return fixed

# Fix keys in all packs
fixed_count = fix_keys('packs')
print(f"\nTotal files fixed: {fixed_count}")