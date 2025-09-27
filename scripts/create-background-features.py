#!/usr/bin/env python3

import json
import os
import uuid
from pathlib import Path

def generate_feat_id():
    """Generate a random ID for feats"""
    return ''.join(str(uuid.uuid4()).split('-'))[:16]

def create_background_feature(bg_data):
    """Create a feature item for a background privilege"""

    privilegio = bg_data.get('testo', {}).get('privilegio', {})
    if not privilegio:
        return None

    feat_id = f"feat-bg-{bg_data['dettagli']['identificatore']}"

    feat = {
        "_id": feat_id,
        "_key": f"!items!{feat_id}",
        "name": privilegio.get('nome', 'Privilegio Background'),
        "type": "feat",
        "img": "icons/skills/trades/academics-study-reading-book.webp",
        "system": {
            "description": {
                "value": f"<p>{privilegio.get('descrizione', '')}</p>",
                "chat": "",
                "unidentified": ""
            },
            "source": bg_data.get('fonte', ''),
            "identifier": f"{bg_data['dettagli']['identificatore']}-privilegio",
            "activation": {
                "type": "",
                "cost": None,
                "condition": ""
            },
            "duration": {
                "value": None,
                "units": ""
            },
            "target": {
                "value": None,
                "width": None,
                "units": "",
                "type": ""
            },
            "range": {
                "value": None,
                "long": None,
                "units": ""
            },
            "uses": {
                "value": None,
                "max": "",
                "per": None,
                "recovery": ""
            },
            "consume": {
                "type": "",
                "target": None,
                "amount": None
            },
            "ability": None,
            "actionType": "",
            "attackBonus": "",
            "chatFlavor": "",
            "critical": {
                "threshold": None,
                "damage": ""
            },
            "damage": {
                "parts": [],
                "versatile": ""
            },
            "formula": "",
            "save": {
                "ability": "",
                "dc": None,
                "scaling": "spell"
            },
            "requirements": bg_data.get('nome', ''),
            "recharge": {
                "value": None,
                "charged": False
            },
            "type": {
                "value": "background",
                "subtype": ""
            }
        },
        "effects": [],
        "folder": None,
        "sort": 0,
        "ownership": {
            "default": 0
        },
        "flags": {
            "brancalonia": {
                "fonte": bg_data.get('fonte', ''),
                "tipo": "privilegio-background",
                "background": bg_data['dettagli']['identificatore']
            }
        }
    }

    return feat

def create_starting_equipment(bg_data):
    """Create equipment items for a background"""
    items = []

    # Get equipment from the database
    equip = bg_data.get('dettagli', {}).get('equipaggiamento', [])

    for item_name in equip:
        if 'monile' in item_name.lower() or 'santa' in item_name.lower():
            # Create a trinket/holy symbol
            item_id = f"equip-bg-{bg_data['dettagli']['identificatore']}-monile"
            item = {
                "_id": item_id,
                "_key": f"!items!{item_id}",
                "name": item_name,
                "type": "equipment",
                "img": "icons/commodities/treasure/token-gold-cross.webp",
                "system": {
                    "description": {
                        "value": f"<p>Un simbolo sacro degli ambulanti.</p>",
                        "chat": "",
                        "unidentified": ""
                    },
                    "source": bg_data.get('fonte', ''),
                    "quantity": 1,
                    "weight": 0,
                    "price": {
                        "value": 5,
                        "denomination": "gp"
                    },
                    "rarity": "",
                    "identified": True,
                    "activation": {
                        "type": "",
                        "cost": None,
                        "condition": ""
                    },
                    "duration": {
                        "value": None,
                        "units": ""
                    },
                    "target": {
                        "value": None,
                        "width": None,
                        "units": "",
                        "type": ""
                    },
                    "range": {
                        "value": None,
                        "long": None,
                        "units": ""
                    },
                    "uses": {
                        "value": None,
                        "max": "",
                        "per": None,
                        "recovery": ""
                    },
                    "consume": {
                        "type": "",
                        "target": None,
                        "amount": None
                    },
                    "ability": None,
                    "actionType": "",
                    "attackBonus": "",
                    "chatFlavor": "",
                    "critical": {
                        "threshold": None,
                        "damage": ""
                    },
                    "damage": {
                        "parts": [],
                        "versatile": ""
                    },
                    "formula": "",
                    "save": {
                        "ability": "",
                        "dc": None,
                        "scaling": "spell"
                    },
                    "armor": {
                        "value": None,
                        "type": "trinket",
                        "dex": None
                    },
                    "hp": {
                        "value": 0,
                        "max": 0,
                        "dt": None,
                        "conditions": ""
                    },
                    "stealth": False,
                    "proficient": True
                },
                "effects": [],
                "folder": None,
                "sort": 0,
                "ownership": {
                    "default": 0
                },
                "flags": {
                    "brancalonia": {
                        "background": bg_data['dettagli']['identificatore']
                    }
                }
            }
            items.append(item)

        elif 'abito' in item_name.lower() or 'viaggiator' in item_name.lower():
            # Create traveler's clothes
            item_id = f"equip-bg-{bg_data['dettagli']['identificatore']}-abito"
            item = {
                "_id": item_id,
                "_key": f"!items!{item_id}",
                "name": item_name,
                "type": "equipment",
                "img": "icons/equipment/chest/shirt-simple-white.webp",
                "system": {
                    "description": {
                        "value": f"<p>Abiti pratici per chi vive in viaggio.</p>",
                        "chat": "",
                        "unidentified": ""
                    },
                    "source": bg_data.get('fonte', ''),
                    "quantity": 1,
                    "weight": 4,
                    "price": {
                        "value": 2,
                        "denomination": "gp"
                    },
                    "rarity": "",
                    "identified": True,
                    "activation": {
                        "type": "",
                        "cost": None,
                        "condition": ""
                    },
                    "duration": {
                        "value": None,
                        "units": ""
                    },
                    "target": {
                        "value": None,
                        "width": None,
                        "units": "",
                        "type": ""
                    },
                    "range": {
                        "value": None,
                        "long": None,
                        "units": ""
                    },
                    "uses": {
                        "value": None,
                        "max": "",
                        "per": None,
                        "recovery": ""
                    },
                    "consume": {
                        "type": "",
                        "target": None,
                        "amount": None
                    },
                    "ability": None,
                    "actionType": "",
                    "attackBonus": "",
                    "chatFlavor": "",
                    "critical": {
                        "threshold": None,
                        "damage": ""
                    },
                    "damage": {
                        "parts": [],
                        "versatile": ""
                    },
                    "formula": "",
                    "save": {
                        "ability": "",
                        "dc": None,
                        "scaling": "spell"
                    },
                    "armor": {
                        "value": None,
                        "type": "clothing",
                        "dex": None
                    },
                    "hp": {
                        "value": 0,
                        "max": 0,
                        "dt": None,
                        "conditions": ""
                    },
                    "stealth": False,
                    "proficient": True
                },
                "effects": [],
                "folder": None,
                "sort": 0,
                "ownership": {
                    "default": 0
                },
                "flags": {
                    "brancalonia": {
                        "background": bg_data['dettagli']['identificatore']
                    }
                }
            }
            items.append(item)

        elif 'borsa' in item_name.lower():
            # Create pouch
            item_id = f"equip-bg-{bg_data['dettagli']['identificatore']}-borsa"
            item = {
                "_id": item_id,
                "_key": f"!items!{item_id}",
                "name": "Borsa",
                "type": "equipment",
                "img": "icons/containers/bags/pouch-simple-leather-brown.webp",
                "system": {
                    "description": {
                        "value": f"<p>Una borsa per trasportare piccoli oggetti e monete.</p>",
                        "chat": "",
                        "unidentified": ""
                    },
                    "source": bg_data.get('fonte', ''),
                    "quantity": 1,
                    "weight": 1,
                    "price": {
                        "value": 5,
                        "denomination": "sp"
                    },
                    "rarity": "",
                    "identified": True,
                    "activation": {
                        "type": "",
                        "cost": None,
                        "condition": ""
                    },
                    "duration": {
                        "value": None,
                        "units": ""
                    },
                    "target": {
                        "value": None,
                        "width": None,
                        "units": "",
                        "type": ""
                    },
                    "range": {
                        "value": None,
                        "long": None,
                        "units": ""
                    },
                    "uses": {
                        "value": None,
                        "max": "",
                        "per": None,
                        "recovery": ""
                    },
                    "consume": {
                        "type": "",
                        "target": None,
                        "amount": None
                    },
                    "ability": None,
                    "actionType": "",
                    "attackBonus": "",
                    "chatFlavor": "",
                    "critical": {
                        "threshold": None,
                        "damage": ""
                    },
                    "damage": {
                        "parts": [],
                        "versatile": ""
                    },
                    "formula": "",
                    "save": {
                        "ability": "",
                        "dc": None,
                        "scaling": "spell"
                    },
                    "armor": {
                        "value": None,
                        "type": "trinket",
                        "dex": None
                    },
                    "hp": {
                        "value": 0,
                        "max": 0,
                        "dt": None,
                        "conditions": ""
                    },
                    "stealth": False,
                    "proficient": True
                },
                "effects": [],
                "folder": None,
                "sort": 0,
                "ownership": {
                    "default": 0
                },
                "flags": {
                    "brancalonia": {
                        "background": bg_data['dettagli']['identificatore']
                    }
                }
            }
            items.append(item)

    return items

def main():
    # Get all background JSON files from database
    database_path = Path('/Users/erik/Desktop/brancalonia-bigat-master/database/backgrounds')
    features_path = Path('/Users/erik/Desktop/brancalonia-bigat-master/packs/brancalonia-features/_source')
    equipment_path = Path('/Users/erik/Desktop/brancalonia-bigat-master/packs/brancalonia-equipment/_source')

    # Create directories if they don't exist
    features_path.mkdir(parents=True, exist_ok=True)
    equipment_path.mkdir(parents=True, exist_ok=True)

    created_features = []
    created_equipment = []

    for bg_file in database_path.glob('*.json'):
        with open(bg_file, 'r', encoding='utf-8') as f:
            bg_data = json.load(f)

        print(f"Processing background: {bg_data['nome']}")

        # Create feature item for the background privilege
        feat = create_background_feature(bg_data)
        if feat:
            feat_file = features_path / f"{feat['_id']}.json"
            with open(feat_file, 'w', encoding='utf-8') as f:
                json.dump(feat, f, ensure_ascii=False, indent=2)
            created_features.append(feat['_id'])
            print(f"  Created feature: {feat['name']} ({feat['_id']})")

        # Create equipment items
        equipment = create_starting_equipment(bg_data)
        for item in equipment:
            equip_file = equipment_path / f"{item['_id']}.json"
            with open(equip_file, 'w', encoding='utf-8') as f:
                json.dump(item, f, ensure_ascii=False, indent=2)
            created_equipment.append(item['_id'])
            print(f"  Created equipment: {item['name']} ({item['_id']})")

    print(f"\nCreated {len(created_features)} feature items")
    print(f"Created {len(created_equipment)} equipment items")

    # Return the created IDs for updating backgrounds
    return created_features, created_equipment

if __name__ == '__main__':
    features, equipment = main()