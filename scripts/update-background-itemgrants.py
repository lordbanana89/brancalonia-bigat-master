#!/usr/bin/env python3

import json
import os
from pathlib import Path

def update_background_itemgrants():
    """Update ItemGrant advancements in backgrounds to reference the created feature items"""

    backgrounds_path = Path('/Users/erik/Desktop/brancalonia-bigat-master/packs/backgrounds/_source')
    features_path = Path('/Users/erik/Desktop/brancalonia-bigat-master/packs/brancalonia-features/_source')
    equipment_path = Path('/Users/erik/Desktop/brancalonia-bigat-master/packs/brancalonia-equipment/_source')

    updated_count = 0

    for bg_file in backgrounds_path.glob('*.json'):
        with open(bg_file, 'r', encoding='utf-8') as f:
            bg_data = json.load(f)

        bg_id = bg_data['_id']
        modified = False

        # Find ItemGrant advancements
        if 'advancement' in bg_data.get('system', {}):
            for advancement in bg_data['system']['advancement']:
                if advancement.get('type') == 'ItemGrant':
                    # Get the feature ID for this background
                    feat_id = f"feat-bg-{bg_id}"
                    feat_file = features_path / f"{feat_id}.json"

                    if feat_file.exists():
                        # Update the ItemGrant to reference the feature
                        advancement['configuration']['items'] = [
                            {
                                "uuid": f"Compendium.brancalonia.brancalonia-features.Item.{feat_id}",
                                "optional": False
                            }
                        ]
                        modified = True
                        print(f"Updated ItemGrant for {bg_data['name']}: added {feat_id}")

                    # Also add equipment items if this is the equipment grant
                    if 'equipment' in advancement.get('title', '').lower() or \
                       'equipaggiamento' in advancement.get('title', '').lower():
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
                            # Create a new equipment grant advancement if needed
                            equipment_grant_exists = False
                            for adv in bg_data['system']['advancement']:
                                if adv.get('type') == 'ItemGrant' and 'equipaggiamento' in adv.get('title', '').lower():
                                    adv['configuration']['items'] = equipment_items
                                    equipment_grant_exists = True
                                    modified = True
                                    break

                            if not equipment_grant_exists:
                                # Add new equipment grant
                                bg_data['system']['advancement'].append({
                                    "_id": f"equip-{bg_id[:8]}",
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
                                print(f"Added equipment grant for {bg_data['name']}")

        if modified:
            # Save the updated background
            with open(bg_file, 'w', encoding='utf-8') as f:
                json.dump(bg_data, f, ensure_ascii=False, indent=2)
            updated_count += 1

    print(f"\nUpdated {updated_count} backgrounds with ItemGrant references")

    # Now let's also add the starting gold to each background
    for bg_file in backgrounds_path.glob('*.json'):
        with open(bg_file, 'r', encoding='utf-8') as f:
            bg_data = json.load(f)

        # Check if we need to add starting gold advancement
        has_gold = False
        for advancement in bg_data.get('system', {}).get('advancement', []):
            if advancement.get('type') == 'ItemChoice' and 'gold' in advancement.get('title', '').lower():
                has_gold = True
                break

        if not has_gold:
            # Add a note about starting gold in the description
            if 'system' in bg_data and 'description' in bg_data['system']:
                desc = bg_data['system']['description']['value']
                if '15 ma' in desc or '15ma' in desc:
                    # Add a note about starting gold
                    if '<h3>Denaro Iniziale</h3>' not in desc:
                        desc += '\n<h3>Denaro Iniziale</h3>\n<p>15 monete d\'argento (ma)</p>'
                        bg_data['system']['description']['value'] = desc

                        with open(bg_file, 'w', encoding='utf-8') as f:
                            json.dump(bg_data, f, ensure_ascii=False, indent=2)
                        print(f"Added starting gold note to {bg_data['name']}")

if __name__ == '__main__':
    update_background_itemgrants()