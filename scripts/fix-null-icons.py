#!/usr/bin/env python3

import json
import os

def fix_null_icons():
    fixed_count = 0

    for root, dirs, files in os.walk('packs'):
        for file in files:
            if file.endswith('.json') and '_source' in root:
                filepath = os.path.join(root, file)
                modified = False

                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    # Fix null img
                    if 'img' in data and data['img'] is None:
                        data['img'] = 'icons/svg/item-bag.svg'
                        modified = True
                        print(f"Fixed null img in: {file}")

                    # Fix null icons in advancement
                    if 'system' in data and 'advancement' in data.get('system', {}):
                        for adv in data['system']['advancement']:
                            if isinstance(adv, dict) and 'icon' in adv and adv['icon'] is None:
                                # Remove null icon field instead of replacing
                                del adv['icon']
                                modified = True
                                print(f"Removed null icon from advancement in: {file}")

                    # Save if modified
                    if modified:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            json.dump(data, f, ensure_ascii=False, indent=2)
                        fixed_count += 1

                except Exception as e:
                    if 'index.json' not in file:
                        print(f"Error processing {filepath}: {e}")

    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == '__main__':
    fix_null_icons()