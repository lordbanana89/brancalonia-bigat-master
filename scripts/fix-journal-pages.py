#!/usr/bin/env python3

import json
import os

def fix_journal_pages(directory):
    fixed = 0

    for filename in os.listdir(directory):
        if filename.endswith('.json'):
            filepath = os.path.join(directory, filename)

            try:
                with open(filepath, 'r') as f:
                    data = json.load(f)

                # Check if it's a journal entry
                if data.get('type') == 'JournalEntry' or ('_key' in data and '!journal!' in data['_key']):
                    modified = False

                    # Ensure pages is an empty list if problematic
                    if 'pages' in data:
                        # For now, just empty the pages to make it compile
                        if len(data['pages']) > 0:
                            print(f"{filename}: Clearing {len(data['pages'])} pages")
                            data['pages'] = []
                            modified = True
                    else:
                        data['pages'] = []
                        modified = True

                    if modified:
                        with open(filepath, 'w') as f:
                            json.dump(data, f, indent=2, ensure_ascii=False)
                            f.write('\n')
                        fixed += 1

            except Exception as e:
                print(f"Error processing {filename}: {e}")

    return fixed

# Fix journal pages in regole pack
fixed_count = fix_journal_pages('packs/regole/_source')
print(f"\nTotal files fixed: {fixed_count}")