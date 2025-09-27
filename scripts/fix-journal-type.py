#!/usr/bin/env python3

import os
import json

def fix_journal_type(directory):
    fixed = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.json'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r') as f:
                        data = json.load(f)

                    # Check if it's a journal entry (has _key with !journal!)
                    if '_key' in data and '!journal!' in data['_key']:
                        if 'type' not in data:
                            data['type'] = 'JournalEntry'
                            print(f"Added type to {os.path.basename(filepath)}")

                            with open(filepath, 'w') as f:
                                json.dump(data, f, indent=2, ensure_ascii=False)
                                f.write('\n')
                            fixed += 1

                except Exception as e:
                    pass  # Skip non-JSON files

    return fixed

# Fix journal entries in regole pack
fixed_count = fix_journal_type('packs/regole/_source')
print(f"\nTotal journal entries fixed: {fixed_count}")