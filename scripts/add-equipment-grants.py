#!/usr/bin/env python3

import json
import os
import uuid
from pathlib import Path

def generate_id():
    """Generate a random ID"""
    return ''.join(str(uuid.uuid4()).split('-'))[:16]

def add_equipment_grants():
    """Add equipment ItemGrant advancements to all backgrounds"""

    backgrounds_path = Path('/Users/erik/Desktop/brancalonia-bigat-master/packs/backgrounds/_source')
    equipment_path = Path('/Users/erik/Desktop/brancalonia-bigat-master/packs/brancalonia-equipment/_source')

    updated_count = 0

    for bg_file in backgrounds_path.glob('*.json'):
        with open(bg_file, 'r', encoding='utf-8') as f:
            bg_data = json.load(f)

        bg_id = bg_data['_id']
        modified = False

        # Check if equipment grant already exists
        has_equipment_grant = False
        for advancement in bg_data.get('system', {}).get('advancement', []):
            if advancement.get('type') == 'ItemGrant' and \
               ('equipment' in advancement.get('title', '').lower() or \
                'equipaggiamento' in advancement.get('title', '').lower()):
                has_equipment_grant = True
                break

        if not has_equipment_grant:
            # Find equipment items for this background
            equipment_items = []

            # Check for equipment items
            equip_ids = [
                f"equip-bg-{bg_id}-monile",
                f"equip-bg-{bg_id}-abito",
                f"equip-bg-{bg_id}-borsa"
            ]

            for equip_id in equip_ids:
                equip_file = equipment_path / f"{equip_id}.json"
                if equip_file.exists():
                    equipment_items.append({
                        "uuid": f"Compendium.brancalonia.brancalonia-equipment.Item.{equip_id}",
                        "optional": False
                    })

            if equipment_items:
                # Add equipment grant advancement
                if 'advancement' not in bg_data['system']:
                    bg_data['system']['advancement'] = []

                bg_data['system']['advancement'].append({
                    "_id": generate_id(),
                    "type": "ItemGrant",
                    "configuration": {
                        "items": equipment_items,
                        "optional": False,
                        "spell": None
                    },
                    "value": {},
                    "level": 0,
                    "title": "Equipaggiamento Iniziale",
                    "classRestriction": "",
                    "appliedEffects": []
                })
                modified = True
                print(f"Added equipment grant to {bg_data['name']} with {len(equipment_items)} items")

        if modified:
            # Save the updated background
            with open(bg_file, 'w', encoding='utf-8') as f:
                json.dump(bg_data, f, ensure_ascii=False, indent=2)
            updated_count += 1

    print(f"\nUpdated {updated_count} backgrounds with equipment grants")

if __name__ == '__main__':
    add_equipment_grants()