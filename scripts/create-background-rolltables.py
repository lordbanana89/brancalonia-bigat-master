#!/usr/bin/env python3

import json
import os
import random
import string
from pathlib import Path

def generate_table_id():
    """Generate a valid table ID"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=16))

def create_rolltable(name, formula, results, bg_name):
    """Create a RollTable document for Foundry"""

    table_id = generate_table_id()

    # Create table document
    table = {
        "_id": table_id,
        "_key": f"!tables!{table_id}",
        "name": f"{bg_name} - {name}",
        "img": "icons/svg/d20-grey.svg",
        "formula": formula,
        "replacement": True,
        "displayRoll": True,
        "results": [],
        "flags": {
            "brancalonia": {
                "background": bg_name.lower().replace(' ', '-'),
                "tipo": name.lower()
            }
        },
        "folder": None,
        "sort": 0,
        "ownership": {"default": 0}
    }

    # Add results
    for i, text in enumerate(results, 1):
        result_id = generate_table_id()
        table["results"].append({
            "_id": result_id,
            "type": 0,  # Text result
            "text": text,
            "img": "icons/svg/d20-black.svg",
            "weight": 1,
            "range": [i, i],
            "drawn": False
        })

    return table

def process_background(bg_path, output_dir):
    """Process a background and create its rolltables"""

    with open(bg_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    bg_name = data.get('nome', 'Unknown')
    tables = []

    if 'caratterizzazione' not in data:
        return tables

    caratteri = data['caratterizzazione']

    # Process personality traits
    if 'tratti' in caratteri:
        if isinstance(caratteri['tratti'], dict):
            formula = caratteri['tratti'].get('dado', '1d8')
            results = caratteri['tratti'].get('voci', [])
        else:
            formula = '1d8'
            results = caratteri['tratti']

        if results:
            table = create_rolltable(
                "Tratti della Personalità",
                formula,
                results,
                bg_name
            )
            tables.append(table)

    # Process ideals
    if 'ideali' in caratteri:
        if isinstance(caratteri['ideali'], dict):
            formula = caratteri['ideali'].get('dado', '1d6')
            results = caratteri['ideali'].get('voci', [])
        else:
            formula = '1d6'
            results = caratteri['ideali']

        if results:
            table = create_rolltable(
                "Ideali",
                formula,
                results,
                bg_name
            )
            tables.append(table)

    # Process bonds
    if 'legami' in caratteri:
        if isinstance(caratteri['legami'], dict):
            formula = caratteri['legami'].get('dado', '1d6')
            results = caratteri['legami'].get('voci', [])
        else:
            formula = '1d6'
            results = caratteri['legami']

        if results:
            table = create_rolltable(
                "Legami",
                formula,
                results,
                bg_name
            )
            tables.append(table)

    # Process flaws
    if 'difetti' in caratteri:
        if isinstance(caratteri['difetti'], dict):
            formula = caratteri['difetti'].get('dado', '1d6')
            results = caratteri['difetti'].get('voci', [])
        else:
            formula = '1d6'
            results = caratteri['difetti']

        if results:
            table = create_rolltable(
                "Difetti",
                formula,
                results,
                bg_name
            )
            tables.append(table)

    return tables

def main():
    """Create rolltables for all backgrounds"""

    db_dir = Path("database/backgrounds")
    output_dir = Path("packs/rollable-tables/_source")

    # Get all background files
    bg_files = [f for f in os.listdir(db_dir) if f.endswith('.json') and f != 'index.json']

    all_tables = []

    for bg_file in bg_files:
        db_path = db_dir / bg_file
        tables = process_background(db_path, output_dir)
        all_tables.extend(tables)

        if tables:
            bg_name = bg_file.replace('.json', '').replace('_', ' ').title()
            print(f"✅ Created {len(tables)} tables for {bg_name}")

    # Save all tables
    for table in all_tables:
        filename = f"bg-{table['name'].lower().replace(' ', '-').replace('---', '-')}.json"
        output_file = output_dir / filename

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(table, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Created {len(all_tables)} rolltables for backgrounds")

if __name__ == "__main__":
    print("=== CREATING BACKGROUND ROLLTABLES ===\n")
    main()