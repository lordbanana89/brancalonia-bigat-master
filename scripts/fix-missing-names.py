#!/usr/bin/env python3

import json
import os
import sys

def fix_missing_names():
    fixed_count = 0

    for root, dirs, files in os.walk('packs'):
        for file in files:
            if file.endswith('.json') and '_source' in root:
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    # Check if name is missing
                    if 'name' not in data or not data.get('name'):
                        # Try to generate name from filename
                        base_name = file.replace('.json', '')

                        # Convert filename to readable name
                        # Examples: class-guerriero-livello_9-indomito -> Indomito
                        parts = base_name.split('-')

                        # For class features, use the last part as name
                        if 'class-' in base_name:
                            # Get the feature name (last part after last dash)
                            feature_parts = base_name.split('-')
                            # Skip class name and level parts
                            if len(feature_parts) > 3:
                                name = '-'.join(feature_parts[3:])
                            else:
                                name = feature_parts[-1]

                            # Clean up underscores and capitalize
                            name = name.replace('_', ' ').replace('-', ' ')
                            name = ' '.join(word.capitalize() for word in name.split())
                        else:
                            # For other items, use the base name
                            name = base_name.replace('_', ' ').replace('-', ' ')
                            name = ' '.join(word.capitalize() for word in name.split())

                        # Special cases
                        replacements = {
                            'Attacco Extra Superiore': 'Attacco Extra (Superiore)',
                            'Attacco Extra Migliorato': 'Attacco Extra (Migliorato)',
                            'Schivata Prodigiosa': 'Schivata Prodigiosa',
                            'Azione Impetuosa': 'Azione Impetuosa',
                            'Aura Coraggio': 'Aura del Coraggio',
                            'Forma Selvatica': 'Forma Selvatica',
                            'Movimento Senza Armatura': 'Movimento senza Armatura',
                            'Ispirazione Bardica': 'Ispirazione Bardica',
                            'Collegio Bardico': 'Collegio Bardico',
                            'Dominio Divino': 'Dominio Divino',
                            'Patto Magico': 'Magia del Patto',
                            'Patto Mistico': 'Dono del Patto',
                            'Nemico Favorito': 'Nemico Prescelto',
                            'Indomabile': 'Indomabile',
                            'Indomito': 'Indomito',
                            'Inafferrabile': 'Inafferrabile',
                            'Stile Combattimento': 'Stile di Combattimento'
                        }

                        if name in replacements:
                            name = replacements[name]

                        # Add name to data
                        data['name'] = name

                        # Save back to file
                        with open(filepath, 'w', encoding='utf-8') as f:
                            json.dump(data, f, ensure_ascii=False, indent=2)

                        print(f"Fixed: {filepath} -> name: {name}")
                        fixed_count += 1

                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == '__main__':
    fix_missing_names()