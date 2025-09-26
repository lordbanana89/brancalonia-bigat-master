#!/usr/bin/env python3

import json
from pathlib import Path
import uuid

def generate_id():
    """Generate a random ID"""
    return ''.join(str(uuid.uuid4()).split('-'))[:16]

# Fix the cacciatore-di-reliquie background
bg_file = Path('/Users/erik/Desktop/brancalonia-bigat-master/packs/backgrounds/_source/cacciatore_di_reliquie.json')
db_file = Path('/Users/erik/Desktop/brancalonia-bigat-master/database/backgrounds/cacciatore_di_reliquie.json')

with open(bg_file, 'r', encoding='utf-8') as f:
    bg_data = json.load(f)

with open(db_file, 'r', encoding='utf-8') as f:
    database_bg = json.load(f)

# Add startingEquipment for cacciatore
equipment_entries = []
equip_list = database_bg.get('dettagli', {}).get('equipaggiamento', [])

for idx, item_name in enumerate(equip_list):
    entry_id = generate_id()

    if 'abito' in item_name.lower() or 'viaggiator' in item_name.lower():
        equipment_entries.append({
            "_id": entry_id,
            "group": "",
            "sort": idx * 100000,
            "type": "linked",
            "count": 1,
            "key": "Compendium.brancalonia.brancalonia-equipment.Item.equip-bg-cacciatore_di_reliquie-abito"
        })
    elif 'borsa' in item_name.lower():
        equipment_entries.append({
            "_id": entry_id,
            "group": "",
            "sort": idx * 100000,
            "type": "linked",
            "count": 1,
            "key": "Compendium.brancalonia.brancalonia-equipment.Item.equip-bg-cacciatore_di_reliquie-borsa"
        })

bg_data['system']['startingEquipment'] = equipment_entries

# Also add wealth if present
wealth = database_bg.get('dettagli', {}).get('ricchezza_iniziale', '')
if '10 ma' in wealth or '10ma' in wealth:
    bg_data['system']['wealth'] = "1d4"  # About 10 silver in gold equivalent

# Save the fixed file
with open(bg_file, 'w', encoding='utf-8') as f:
    json.dump(bg_data, f, ensure_ascii=False, indent=2)

print("Fixed cacciatore-di-reliquie background")