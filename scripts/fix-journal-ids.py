#!/usr/bin/env python3

import json
import os
import re

def clean_id(id_str):
    """Rimuove numeri casuali alla fine degli ID"""
    # Pattern: word followed by random hex-like string
    # Es: bagordiintroduzionedf4797 -> bagordiintroduzione
    cleaned = re.sub(r'[0-9a-f]{6}$', '', id_str)
    if cleaned == id_str:
        # If no change, just remove all numbers
        cleaned = re.sub(r'[0-9]+', '', id_str)
    return cleaned

def fix_journal_ids(directory):
    fixed = 0

    for filename in os.listdir(directory):
        if filename.endswith('.json'):
            filepath = os.path.join(directory, filename)

            try:
                with open(filepath, 'r') as f:
                    data = json.load(f)

                modified = False

                # Fix main ID
                if '_id' in data:
                    old_id = data['_id']
                    new_id = clean_id(old_id)
                    if old_id != new_id:
                        data['_id'] = new_id
                        # Update _key too
                        if '_key' in data:
                            key_parts = data['_key'].split('!')
                            if len(key_parts) == 3:
                                key_parts[2] = new_id
                                data['_key'] = '!'.join(key_parts)
                        print(f"{filename}: {old_id} -> {new_id}")
                        modified = True

                # Fix page IDs
                if 'pages' in data and isinstance(data['pages'], list):
                    for page in data['pages']:
                        if '_id' in page:
                            old_page_id = page['_id']
                            # Remove 'page1' suffixes and numbers
                            new_page_id = re.sub(r'page\d+$', '', old_page_id)
                            new_page_id = clean_id(new_page_id)
                            if not new_page_id:
                                new_page_id = new_id + "_p1" if 'new_id' in locals() else "page1"
                            else:
                                new_page_id = new_page_id + "_p1"

                            if old_page_id != new_page_id:
                                page['_id'] = new_page_id
                                modified = True

                if modified:
                    with open(filepath, 'w') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                        f.write('\n')
                    fixed += 1

            except Exception as e:
                print(f"Error processing {filename}: {e}")

    return fixed

# Fix journal IDs in regole pack
fixed_count = fix_journal_ids('packs/regole/_source')
print(f"\nTotal files fixed: {fixed_count}")