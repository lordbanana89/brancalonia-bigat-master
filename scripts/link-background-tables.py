#!/usr/bin/env python3

import json
import os
from pathlib import Path

def find_table_id(tables_dir, bg_name, table_type):
    """Find the table ID for a specific background and type"""

    # Normalize the search pattern
    search_pattern = f"{bg_name.lower().replace(' ', '-')}-{table_type.lower().replace(' ', '-')}"

    for table_file in os.listdir(tables_dir):
        if not table_file.endswith('.json'):
            continue

        if search_pattern in table_file.lower():
            with open(tables_dir / table_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data['_id']

    return None

def update_background(bg_path, tables_dir):
    """Update a background with table references and details"""

    with open(bg_path, 'r', encoding='utf-8') as f:
        doc = json.load(f)

    # Get background name for matching tables
    bg_name = doc['name']

    # Add starting equipment details if not present
    if 'startingEquipment' not in doc['system']:
        doc['system']['startingEquipment'] = []

    # Add traits with table references
    if 'traits' not in doc['system']:
        doc['system']['traits'] = {}

    # Find and link tables for characterization
    table_mappings = {
        'personalityTraits': 'Tratti della Personalità',
        'ideals': 'Ideali',
        'bonds': 'Legami',
        'flaws': 'Difetti'
    }

    for trait_key, table_name in table_mappings.items():
        table_id = find_table_id(tables_dir, bg_name, table_name)
        if table_id:
            if trait_key not in doc['system']['traits']:
                doc['system']['traits'][trait_key] = {}
            doc['system']['traits'][trait_key]['table'] = table_id

    # Parse equipment from description if needed
    desc = doc['system']['description']['value']
    if '<strong>Equipaggiamento:</strong>' in desc:
        # Extract equipment section
        start = desc.find('<ul>', desc.find('<strong>Equipaggiamento:</strong>'))
        end = desc.find('</ul>', start) + 5
        if start > 0 and end > start:
            equip_html = desc[start:end]
            # Parse items
            items = []
            for line in equip_html.split('<li>'):
                if '</li>' in line:
                    item = line.split('</li>')[0].strip()
                    if item and not item.startswith('<'):
                        items.append(item)

            # Add to starting equipment
            if items and not doc['system']['startingEquipment']:
                for item in items:
                    doc['system']['startingEquipment'].append({
                        "type": "default",
                        "item": item
                    })

    # Add starting wealth if not present
    if 'wealth' not in doc['system']:
        # Extract from equipment list
        if '10 ma' in desc:
            doc['system']['wealth'] = "10 ma"
        elif '15 ma' in desc:
            doc['system']['wealth'] = "15 ma"
        elif '5 ma' in desc:
            doc['system']['wealth'] = "5 ma"
        else:
            doc['system']['wealth'] = "10 ma"  # Default

    return doc

def main():
    """Update all backgrounds with table links and details"""

    bg_dir = Path("packs/backgrounds/_source")
    tables_dir = Path("packs/rollable-tables/_source")

    # Get all background files
    bg_files = [f for f in os.listdir(bg_dir) if f.endswith('.json')]

    updated = 0

    for bg_file in bg_files:
        bg_path = bg_dir / bg_file

        # Update background
        doc = update_background(bg_path, tables_dir)

        # Save updated document
        with open(bg_path, 'w', encoding='utf-8') as f:
            json.dump(doc, f, indent=2, ensure_ascii=False)

        print(f"✅ Updated: {doc['name']} with table links and details")
        updated += 1

    print(f"\n✅ Updated {updated} backgrounds with table links and details")

if __name__ == "__main__":
    print("=== LINKING BACKGROUND TABLES ===\n")
    main()