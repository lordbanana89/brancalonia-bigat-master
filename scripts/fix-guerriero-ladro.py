#!/usr/bin/env python3
"""
Fix Guerriero (Fighter) and Ladro (Rogue) classes with proper features
Based on D&D 5e SRD standards
"""

import json
import os
from pathlib import Path
import random
import string

def generate_id():
    """Generate random ID"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=16))

def create_feature(name, level, description=""):
    """Create a feature item"""
    feature_id = generate_id()
    safe_name = name.lower().replace(' ', '-').replace("'", "")

    return {
        "_id": feature_id,
        "_key": f"!items!{feature_id}",
        "name": name,
        "type": "feat",
        "img": "icons/svg/item-bag.svg",
        "system": {
            "type": {
                "value": "class",
                "subtype": ""
            },
            "description": {
                "value": description,
                "chat": ""
            },
            "requirements": f"Livello {level}",
            "activation": {
                "type": "",
                "cost": None,
                "condition": ""
            },
            "uses": {
                "value": None,
                "max": "",
                "per": None,
                "recovery": ""
            }
        },
        "effects": [],
        "flags": {}
    }, feature_id, safe_name

def fix_guerriero():
    """Fix Guerriero (Fighter) class"""
    print("Fixing Guerriero (Fighter)...")

    # Guerriero features based on D&D 5e Fighter
    features = [
        (1, "Stile di Combattimento", "Scegli uno stile di combattimento"),
        (1, "Recupero Straordinario", "Recupera punti ferita con un'azione bonus"),
        (2, "Azione Impetuosa", "Un'azione aggiuntiva per turno"),
        (3, "Archetipo Marziale", "Scegli un archetipo marziale"),
        (5, "Attacco Extra", "Puoi attaccare due volte"),
        (9, "Indomabile", "Puoi ritirare un tiro salvezza"),
        (11, "Attacco Extra (2)", "Puoi attaccare tre volte"),
        (13, "Indomabile (2)", "Usa Indomabile due volte"),
        (15, "Archetipo Marziale - Maestria", "Privilegio dell'archetipo"),
        (17, "Azione Impetuosa (2)", "Due usi di Azione Impetuosa"),
        (17, "Indomabile (3)", "Usa Indomabile tre volte"),
        (20, "Attacco Extra (3)", "Puoi attaccare quattro volte")
    ]

    # Load class file
    class_path = Path('packs/classi/_source/guerriero.json')
    if not class_path.exists():
        print(f"Guerriero class file not found at {class_path}")
        return

    with open(class_path, 'r', encoding='utf-8') as f:
        guerriero = json.load(f)

    # Get existing advancements
    advancements = guerriero.get('system', {}).get('advancement', [])

    # Keep HitPoints and ASI advancements
    new_advancements = [adv for adv in advancements if adv.get('type') in ['HitPoints', 'AbilityScoreImprovement']]

    # Create features and add ItemGrant advancements
    features_path = Path('packs/brancalonia-features/_source')
    os.makedirs(features_path, exist_ok=True)

    for level, feature_name, description in features:
        feature_data, feature_id, safe_name = create_feature(feature_name, level, description)

        # Save feature
        feature_file = features_path / f"class-guerriero-livello_{level}-{safe_name}.json"
        with open(feature_file, 'w', encoding='utf-8') as f:
            json.dump(feature_data, f, indent=2, ensure_ascii=False)

        # Add ItemGrant advancement
        advancement = {
            "_id": generate_id(),
            "type": "ItemGrant",
            "configuration": {
                "items": [f"Compendium.brancalonia.brancalonia-features.Item.{feature_id}"],
                "optional": False
            },
            "value": {},
            "level": level,
            "title": feature_name,
            "icon": "icons/svg/upgrade.svg"
        }
        new_advancements.append(advancement)
        print(f"Added {feature_name} at level {level}")

    # Sort advancements by level
    new_advancements.sort(key=lambda x: (x.get('level', 0), x.get('type', '')))

    # Update class
    guerriero['system']['advancement'] = new_advancements

    # Save updated class
    with open(class_path, 'w', encoding='utf-8') as f:
        json.dump(guerriero, f, indent=2, ensure_ascii=False)

    print(f"Fixed Guerriero with {len(features)} features")

def fix_ladro():
    """Fix Ladro (Rogue) class"""
    print("\nFixing Ladro (Rogue)...")

    # Ladro features based on D&D 5e Rogue
    features = [
        (1, "Competenza Esperta", "Raddoppia il bonus di competenza per due abilità"),
        (1, "Attacco Furtivo", "Infliggi danni extra con attacchi precisi"),
        (1, "Gergo Ladresco", "Linguaggio segreto dei ladri"),
        (2, "Azione Scaltra", "Dash, Disengage o Hide come azione bonus"),
        (3, "Archetipo Ladresco", "Scegli un archetipo ladresco"),
        (5, "Schivata Prodigiosa", "Dimezza i danni di un attacco"),
        (7, "Evasione", "Dimezza o annulla danni ad area"),
        (8, "Competenza Esperta (2)", "Due competenze aggiuntive"),
        (9, "Privilegio dell'Archetipo", "Abilità dell'archetipo"),
        (11, "Talento Affidabile", "Minimo 10 nelle prove di abilità"),
        (13, "Privilegio dell'Archetipo", "Abilità dell'archetipo"),
        (14, "Senso Cieco", "Percepisci creature nascoste vicine"),
        (15, "Mente Sfuggente", "Competenza nei TS di Saggezza"),
        (17, "Privilegio dell'Archetipo", "Abilità dell'archetipo"),
        (18, "Elusivo", "Nessun vantaggio contro di te"),
        (20, "Colpo di Fortuna", "Trasforma fallimento in successo")
    ]

    # Load class file
    class_path = Path('packs/classi/_source/ladro.json')
    if not class_path.exists():
        print(f"Ladro class file not found at {class_path}")
        return

    with open(class_path, 'r', encoding='utf-8') as f:
        ladro = json.load(f)

    # Get existing advancements
    advancements = ladro.get('system', {}).get('advancement', [])

    # Keep HitPoints and ASI advancements
    new_advancements = [adv for adv in advancements if adv.get('type') in ['HitPoints', 'AbilityScoreImprovement']]

    # Create features and add ItemGrant advancements
    features_path = Path('packs/brancalonia-features/_source')
    os.makedirs(features_path, exist_ok=True)

    for level, feature_name, description in features:
        feature_data, feature_id, safe_name = create_feature(feature_name, level, description)

        # Save feature
        feature_file = features_path / f"class-ladro-livello_{level}-{safe_name}.json"
        with open(feature_file, 'w', encoding='utf-8') as f:
            json.dump(feature_data, f, indent=2, ensure_ascii=False)

        # Add ItemGrant advancement
        advancement = {
            "_id": generate_id(),
            "type": "ItemGrant",
            "configuration": {
                "items": [f"Compendium.brancalonia.brancalonia-features.Item.{feature_id}"],
                "optional": False
            },
            "value": {},
            "level": level,
            "title": feature_name,
            "icon": "icons/svg/upgrade.svg"
        }
        new_advancements.append(advancement)
        print(f"Added {feature_name} at level {level}")

    # Add ScaleValue for Sneak Attack damage progression
    sneak_attack_scale = {
        "_id": generate_id(),
        "type": "ScaleValue",
        "configuration": {
            "identifier": "sneak-attack",
            "type": "dice",
            "distance": None,
            "label": "Attacco Furtivo"
        },
        "value": {
            "1": "1d6",
            "3": "2d6",
            "5": "3d6",
            "7": "4d6",
            "9": "5d6",
            "11": "6d6",
            "13": "7d6",
            "15": "8d6",
            "17": "9d6",
            "19": "10d6"
        },
        "title": "Dadi Attacco Furtivo",
        "icon": "icons/svg/upgrade.svg"
    }
    new_advancements.append(sneak_attack_scale)
    print("Added Sneak Attack ScaleValue progression")

    # Sort advancements by level
    new_advancements.sort(key=lambda x: (x.get('level', 0), x.get('type', '')))

    # Update class
    ladro['system']['advancement'] = new_advancements

    # Save updated class
    with open(class_path, 'w', encoding='utf-8') as f:
        json.dump(ladro, f, indent=2, ensure_ascii=False)

    print(f"Fixed Ladro with {len(features)} features + ScaleValue")

def main():
    fix_guerriero()
    fix_ladro()
    print("\nBoth classes fixed successfully!")

if __name__ == '__main__':
    main()