#!/usr/bin/env python3
"""
Complete all racial traits for Brancalonia races
Based on Brancalonia lore and D&D 5e standards
"""

import json
import os
from pathlib import Path
import random
import string

def generate_id():
    """Generate random ID"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=16))

def create_racial_trait(name, race, description, ability_bonus=None):
    """Create a racial trait feature"""
    feature_id = generate_id()
    safe_name = name.lower().replace(' ', '-').replace("'", "")

    feature = {
        "_id": feature_id,
        "_key": f"!items!{feature_id}",
        "name": name,
        "type": "feat",
        "img": "icons/svg/item-bag.svg",
        "system": {
            "type": {
                "value": "race",
                "subtype": ""
            },
            "description": {
                "value": description,
                "chat": ""
            },
            "requirements": race,
            "activation": {
                "type": "",
                "cost": None,
                "condition": ""
            }
        },
        "effects": [],
        "flags": {}
    }

    # Add ability bonus effect if provided
    if ability_bonus:
        feature['effects'].append({
            "_id": generate_id(),
            "name": f"Bonus {ability_bonus['ability']}",
            "icon": "icons/svg/upgrade.svg",
            "changes": [{
                "key": f"system.abilities.{ability_bonus['ability']}.value",
                "mode": 2,
                "value": ability_bonus['value']
            }],
            "disabled": False,
            "transfer": True
        })

    return feature, feature_id

def add_traits_to_race(race_file, traits_data):
    """Add traits to a race file"""
    with open(race_file, 'r', encoding='utf-8') as f:
        race = json.load(f)

    race_name = race.get('name', '')
    print(f"\nAdding traits to {race_name}...")

    # Get existing advancements
    advancements = race.get('system', {}).get('advancement', [])

    # Check if traits already exist
    existing_grants = [adv for adv in advancements if adv.get('type') == 'ItemGrant']
    if len(existing_grants) > 0:
        print(f"{race_name} already has {len(existing_grants)} traits, skipping...")
        return

    # Create trait features and add ItemGrant advancements
    features_path = Path('packs/brancalonia-features/_source')
    os.makedirs(features_path, exist_ok=True)

    for trait_info in traits_data:
        feature, feature_id = create_racial_trait(
            trait_info['name'],
            race_name,
            trait_info['description'],
            trait_info.get('ability_bonus')
        )

        # Save feature
        safe_name = trait_info['name'].lower().replace(' ', '-')
        feature_file = features_path / f"race-{race_name.lower()}-{safe_name}.json"
        with open(feature_file, 'w', encoding='utf-8') as f:
            json.dump(feature, f, indent=2, ensure_ascii=False)

        # Add ItemGrant advancement
        advancement = {
            "_id": generate_id(),
            "type": "ItemGrant",
            "configuration": {
                "items": [f"Compendium.brancalonia.brancalonia-features.Item.{feature_id}"],
                "optional": False
            },
            "value": {},
            "level": 0,
            "title": trait_info['name'],
            "icon": "icons/svg/upgrade.svg"
        }
        advancements.append(advancement)
        print(f"Added trait: {trait_info['name']}")

    # Save updated race
    race['system']['advancement'] = advancements
    with open(race_file, 'w', encoding='utf-8') as f:
        json.dump(race, f, indent=2, ensure_ascii=False)

    print(f"Updated {race_name} with {len(traits_data)} traits")

def main():
    """Add all missing racial traits"""
    races_path = Path('packs/razze/_source')

    # Define traits for each race based on Brancalonia lore
    racial_traits = {
        'variantelevantini.json': [
            {
                'name': 'Sangue Levantino',
                'description': 'I Levantini sono robusti e resistenti. +2 Costituzione.',
                'ability_bonus': {'ability': 'con', 'value': 2}
            },
            {
                'name': 'Cultura Marittima',
                'description': 'Competenza in Navigazione e con gli attrezzi da marinaio.'
            },
            {
                'name': 'Resistenza al Mare',
                'description': 'Vantaggio sui tiri salvezza contro effetti legati all\'acqua e al freddo.'
            }
        ],
        'inesistente.json': [
            {
                'name': 'Invisibilità Naturale',
                'description': 'Come azione bonus, puoi diventare invisibile per 1 turno. Utilizzabile 1 volta per riposo breve.'
            },
            {
                'name': 'Passare Inosservato',
                'description': 'Competenza in Furtività. Se già competente, raddoppia il bonus di competenza.'
            },
            {
                'name': 'Memoria Evanescente',
                'description': 'Le creature hanno svantaggio per ricordarsi di te dopo 1 ora dall\'ultimo incontro.'
            }
        ],
        'variantesvanzici.json': [
            {
                'name': 'Astuzia Svanzica',
                'description': 'I Svanzici sono astuti e carismatici. +2 Carisma.',
                'ability_bonus': {'ability': 'cha', 'value': 2}
            },
            {
                'name': 'Parlantina',
                'description': 'Competenza in Persuasione o Inganno (a scelta).'
            },
            {
                'name': 'Fortuna del Briccone',
                'description': '1 volta per riposo lungo, puoi ritirare un tiro di dado e usare il nuovo risultato.'
            }
        ],
        'gatto_lupesco.json': [
            {
                'name': 'Scurovisione',
                'description': 'Puoi vedere nell\'oscurità entro 18 metri come se fosse luce fioca.'
            },
            {
                'name': 'Sensi Acuti',
                'description': 'Competenza in Percezione. Vantaggio nelle prove di Percezione basate su olfatto.'
            },
            {
                'name': 'Artigli Naturali',
                'description': 'I tuoi artigli sono armi naturali che infliggono 1d4 + modificatore di Forza danni taglienti.'
            },
            {
                'name': 'Agilità Felina',
                'description': '+2 Destrezza. Puoi muoverti a velocità normale anche quando sei accovacciato.',
                'ability_bonus': {'ability': 'dex', 'value': 2}
            }
        ],
        'sottorazzapinocchio.json': [
            {
                'name': 'Corpo di Legno',
                'description': 'Resistenza ai danni da fuoco. Vulnerabilità ai danni da acido.'
            },
            {
                'name': 'Naso che Cresce',
                'description': 'Quando menti, il tuo naso si allunga. Svantaggio su prove di Inganno, ma vantaggio su prove di Intuizione.'
            },
            {
                'name': 'Senza Bisogni Vitali',
                'description': 'Non hai bisogno di mangiare, bere o respirare. Immune a veleni e malattie.'
            },
            {
                'name': 'Costruito',
                'description': '+1 Costituzione. Non puoi essere curato con magia, ma puoi essere riparato.',
                'ability_bonus': {'ability': 'con', 'value': 1}
            }
        ],
        'pantegano.json': [
            {
                'name': 'Scurovisione',
                'description': 'Puoi vedere nell\'oscurità entro 18 metri.'
            },
            {
                'name': 'Furtività Naturale',
                'description': 'Competenza in Furtività. Puoi nasconderti anche quando sei oscurato solo leggermente.'
            },
            {
                'name': 'Resistenza alle Malattie',
                'description': 'Vantaggio sui tiri salvezza contro veleni e malattie.'
            },
            {
                'name': 'Morso Affilato',
                'description': 'Il tuo morso è un\'arma naturale che infligge 1d4 + modificatore di Forza danni perforanti.'
            },
            {
                'name': 'Agilità del Ratto',
                'description': '+2 Destrezza. Puoi muoverti attraverso spazi stretti senza penalità.',
                'ability_bonus': {'ability': 'dex', 'value': 2}
            }
        ]
    }

    # Process each race
    for race_filename, traits in racial_traits.items():
        race_file = races_path / race_filename
        if race_file.exists():
            add_traits_to_race(race_file, traits)
        else:
            print(f"Race file not found: {race_filename}")

    print("\n✅ All racial traits added successfully!")

if __name__ == '__main__':
    main()