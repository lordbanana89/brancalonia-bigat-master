#!/usr/bin/env python3
"""
AGENT RACES - Fix race advancement issues for Brancalonia
Based on D&D 5e v5.1.9 standards
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any

class RacesFixer:
    def __init__(self):
        self.races_path = Path('packs/razze/_source')
        self.features_path = Path('packs/brancalonia-features/_source')
        self.database_path = Path('database/razze')

        # Map sizes per race from database
        self.race_sizes = {
            'Bracaloniani': 'med',  # Medium
            'Pupo': 'sm',          # Small
            'Levantini': 'med',
            'Inesistente': 'med',
            'Svanzici': 'med',
            'Sicumera': 'med',
            'Popolino': 'sm',      # Small
            'Gattolupesco': 'med'
        }

    def create_size_advancement(self, race_name: str) -> Dict:
        """Create Size advancement for race"""
        size = self.race_sizes.get(race_name, 'med')

        return {
            "_id": self.generate_id(),
            "type": "Size",
            "configuration": {
                "sizes": [size]
            },
            "value": {
                "size": size
            },
            "level": 0,
            "title": "Taglia",
            "icon": "icons/svg/upgrade.svg"
        }

    def create_trait_advancement(self, trait_name: str, trait_id: str = None) -> Dict:
        """Create ItemGrant advancement for racial trait"""
        if not trait_id:
            trait_id = self.generate_id()

        return {
            "_id": self.generate_id(),
            "type": "ItemGrant",
            "configuration": {
                "items": [
                    f"Compendium.brancalonia.brancalonia-features.Item.{trait_id}"
                ],
                "optional": False
            },
            "value": {},
            "level": 0,
            "title": trait_name
        }

    def generate_id(self) -> str:
        """Generate random ID"""
        import random
        import string
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=16))

    def find_racial_traits(self, race_name: str) -> List[Dict]:
        """Find racial traits in database and features"""
        traits = []

        # Search in database
        race_db_path = self.database_path / race_name.lower()
        if race_db_path.exists():
            traits_path = race_db_path / 'tratti_razziali'
            if traits_path.exists():
                for trait_file in traits_path.glob('*.json'):
                    try:
                        with open(trait_file, 'r', encoding='utf-8') as f:
                            trait_data = json.load(f)

                        # Search for existing feature
                        feature_id = self.find_feature_id(trait_data.get('nome', ''))

                        if not feature_id:
                            # Create new feature if it doesn't exist
                            feature_id = self.create_racial_feature(trait_data, race_name)

                        traits.append({
                            'name': trait_data.get('nome', trait_file.stem),
                            'id': feature_id
                        })
                    except Exception as e:
                        print(f"Error reading trait {trait_file}: {e}")

        # Common racial traits based on D&D 5e standards
        common_traits = self.get_common_racial_traits(race_name)
        traits.extend(common_traits)

        return traits

    def get_common_racial_traits(self, race_name: str) -> List[Dict]:
        """Get common racial traits based on race type"""
        traits = []

        # Map race to common D&D 5e traits
        if race_name == 'Bracaloniani':
            # Human-like
            traits.append({'name': 'Versatilità', 'id': self.find_or_create_trait('Versatilità', {
                'nome': 'Versatilità',
                'descrizione': '+1 a tutti i punteggi di caratteristica'
            })})

        elif race_name == 'Pupo':
            # Halfling-like
            traits.append({'name': 'Fortuna', 'id': self.find_or_create_trait('Fortuna', {
                'nome': 'Fortuna',
                'descrizione': 'Quando ottieni 1 su un d20, puoi ritirare il dado'
            })})
            traits.append({'name': 'Coraggioso', 'id': self.find_or_create_trait('Coraggioso', {
                'nome': 'Coraggioso',
                'descrizione': 'Vantaggio contro essere spaventato'
            })})
            traits.append({'name': 'Agilità Halfling', 'id': self.find_or_create_trait('Agilità Halfling', {
                'nome': 'Agilità Halfling',
                'descrizione': 'Puoi muoverti attraverso lo spazio di creature più grandi'
            })})

        elif race_name == 'Gattolupesco':
            # Beast-like
            traits.append({'name': 'Scurovisione', 'id': self.find_or_create_trait('Scurovisione', {
                'nome': 'Scurovisione',
                'descrizione': 'Puoi vedere nell\'oscurità entro 18 metri'
            })})
            traits.append({'name': 'Sensi Acuti', 'id': self.find_or_create_trait('Sensi Acuti', {
                'nome': 'Sensi Acuti',
                'descrizione': 'Competenza in Percezione'
            })})

        elif race_name == 'Popolino':
            # Gnome-like
            traits.append({'name': 'Astuzia Gnomesca', 'id': self.find_or_create_trait('Astuzia Gnomesca', {
                'nome': 'Astuzia Gnomesca',
                'descrizione': 'Vantaggio sui TS di Intelligenza, Saggezza e Carisma contro magia'
            })})

        return traits

    def find_or_create_trait(self, trait_name: str, trait_data: Dict) -> str:
        """Find existing trait or create new one"""
        # First try to find existing
        feature_id = self.find_feature_id(trait_name)

        if not feature_id:
            # Create new feature
            feature_id = self.create_racial_feature(trait_data, 'generic')

        return feature_id

    def find_feature_id(self, trait_name: str) -> str:
        """Find existing feature ID"""
        if not self.features_path.exists():
            return None

        search_name = trait_name.lower().replace(' ', '-')

        for feature_file in self.features_path.glob('*.json'):
            try:
                with open(feature_file, 'r', encoding='utf-8') as f:
                    feature = json.load(f)

                if search_name in feature_file.stem.lower() or \
                   trait_name.lower() in feature.get('name', '').lower():
                    return feature.get('_id')
            except:
                continue

        return None

    def create_racial_feature(self, trait_data: Dict, race_name: str) -> str:
        """Create new racial trait feature"""
        feature_id = self.generate_id()
        trait_name = trait_data.get('nome', 'Tratto')

        feature = {
            "_id": feature_id,
            "_key": f"!items!{feature_id}",
            "name": trait_name,
            "type": "feat",
            "img": "icons/svg/item-bag.svg",
            "system": {
                "type": {
                    "value": "race",
                    "subtype": ""
                },
                "description": {
                    "value": trait_data.get('descrizione', ''),
                    "chat": ""
                },
                "requirements": race_name,
                "recharge": {
                    "value": None,
                    "charged": True
                },
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
            "folder": None,
            "flags": {},
            "ownership": {
                "default": 0
            }
        }

        # Save feature
        feature_path = self.features_path / f"race-{race_name.lower()}-{trait_name.lower().replace(' ', '-')}.json"
        os.makedirs(self.features_path, exist_ok=True)

        with open(feature_path, 'w', encoding='utf-8') as f:
            json.dump(feature, f, indent=2, ensure_ascii=False)

        print(f"Created racial feature: {trait_name} for {race_name}")

        return feature_id

    def fix_race(self, race_file: Path) -> bool:
        """Fix single race file"""
        try:
            with open(race_file, 'r', encoding='utf-8') as f:
                race = json.load(f)

            race_name = race.get('name', '')
            print(f"\nFixing {race_name}...")

            # Get or create advancement array
            if 'system' not in race:
                race['system'] = {}
            if 'advancement' not in race['system']:
                race['system']['advancement'] = []

            advancements = race['system']['advancement']

            # Check if Size advancement exists
            has_size = any(adv.get('type') == 'Size' for adv in advancements)

            if not has_size:
                # Add Size advancement
                size_adv = self.create_size_advancement(race_name)
                advancements.insert(0, size_adv)  # Size should be first
                print(f"Added Size advancement for {race_name}")

            # Find and add racial traits
            traits = self.find_racial_traits(race_name)

            # Check existing trait advancements
            existing_traits = [adv for adv in advancements if adv.get('type') == 'ItemGrant']

            if len(existing_traits) == 0 and len(traits) > 0:
                # Add trait advancements
                for trait in traits:
                    trait_adv = self.create_trait_advancement(trait['name'], trait['id'])
                    advancements.append(trait_adv)
                    print(f"Added trait: {trait['name']} for {race_name}")

            # Ensure proper movement and senses
            if 'movement' not in race['system']:
                race['system']['movement'] = {
                    "walk": 30 if race_name not in ['Pupo', 'Popolino'] else 25,
                    "units": "ft",
                    "hover": False
                }

            if 'senses' not in race['system']:
                race['system']['senses'] = {
                    "darkvision": 60 if race_name == 'Gattolupesco' else 0,
                    "units": "ft"
                }

            # Save fixed race
            output_path = self.races_path / f"{race_file.stem}_fixed.json"
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(race, f, indent=2, ensure_ascii=False)

            print(f"Fixed {race_name} saved to {output_path}")
            return True

        except Exception as e:
            print(f"Error fixing {race_file}: {e}")
            return False

    def fix_all_races(self):
        """Fix all race files"""
        if not self.races_path.exists():
            print(f"Races path not found: {self.races_path}")
            return

        print("Fixing all races...")

        for race_file in self.races_path.glob('*.json'):
            if not race_file.stem.endswith('_fixed'):
                self.fix_race(race_file)

        # Replace original files with fixed ones
        print("\nReplacing original files with fixed versions...")
        for fixed_file in self.races_path.glob('*_fixed.json'):
            original_name = fixed_file.stem.replace('_fixed', '') + '.json'
            original_path = self.races_path / original_name

            # Replace original with fixed
            fixed_file.replace(original_path)
            print(f"Replaced {original_name}")

        print("\nAll races fixed!")

def main():
    import sys

    if len(sys.argv) < 2:
        print("Usage: python agent-races-fix.py [path_to_module]")
        sys.exit(1)

    # Change to module directory
    module_path = Path(sys.argv[1])
    if module_path.exists():
        os.chdir(module_path)

    fixer = RacesFixer()
    fixer.fix_all_races()

if __name__ == '__main__':
    main()