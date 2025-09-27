#!/usr/bin/env python3

import json
import os

def fix_strength_values():
    fixed_count = 0

    for root, dirs, files in os.walk('packs'):
        for file in files:
            if file.endswith('.json') and '_source' in root:
                filepath = os.path.join(root, file)
                modified = False

                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    # Check system.strength
                    if 'system' in data and 'strength' in data['system']:
                        strength = data['system']['strength']

                        # Convert string numbers to integers
                        if isinstance(strength, str):
                            if strength == '—' or strength == '-' or strength == '':
                                # Convert dash or empty to null
                                data['system']['strength'] = null = None
                                modified = True
                                print(f"Fixed {file}: '{strength}' -> null")
                            elif strength.isdigit():
                                # Convert string number to integer
                                data['system']['strength'] = int(strength)
                                modified = True
                                print(f"Fixed {file}: '{strength}' -> {int(strength)}")
                            else:
                                # Try to extract number from string
                                try:
                                    # Handle cases like "Str 13"
                                    import re
                                    match = re.search(r'\d+', strength)
                                    if match:
                                        data['system']['strength'] = int(match.group())
                                        modified = True
                                        print(f"Fixed {file}: '{strength}' -> {int(match.group())}")
                                except:
                                    pass

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
    fix_strength_values()