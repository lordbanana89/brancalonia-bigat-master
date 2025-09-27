#!/usr/bin/env python3
"""
AGENT RESTORE ALL CONTENT - Ripristina TUTTO il contenuto rimosso
MAI PIÙ RIMUOVERE, SOLO IMPLEMENTARE!
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any
import hashlib

class ContentRestorer:
    def __init__(self):
        self.base_path = Path(".")
        self.restored_count = 0
        self.items_created = []
        self.errors = []

    def generate_id(self, name: str, prefix: str = "") -> str:
        """Genera un ID univoco basato sul nome"""
        text = f"{prefix}{name}".lower().replace(" ", "-")
        # Rimuovi caratteri speciali
        text = ''.join(c for c in text if c.isalnum() or c == '-')
        # Aggiungi hash per unicità
        hash_suffix = hashlib.md5(text.encode()).hexdigest()[:6]
        return f"{text}-{hash_suffix}"

    def restore_background_equipment(self):
        """Ripristina TUTTI gli equipaggiamenti rimossi dai background"""
        print("\n🔧 RIPRISTINO EQUIPAGGIAMENTI BACKGROUND...")

        db_path = Path("database/backgrounds")
        packs_path = Path("packs/backgrounds/_source")
        equip_path = Path("packs/equipaggiamento/_source")
        equip_path.mkdir(parents=True, exist_ok=True)

        for db_file in db_path.glob("*.json"):
            if db_file.name == "index.json":
                continue

            try:
                with open(db_file, 'r', encoding='utf-8') as f:
                    db_data = json.load(f)

                pack_file = packs_path / db_file.name
                if not pack_file.exists():
                    continue

                with open(pack_file, 'r', encoding='utf-8') as f:
                    pack_data = json.load(f)

                # Estrai equipaggiamento dal database
                equip_list = db_data.get('dettagli', {}).get('equipaggiamento', [])
                if not equip_list:
                    continue

                # Crea gli item di equipaggiamento
                starting_equipment = []
                for idx, item_name in enumerate(equip_list):
                    item_id = self.generate_id(item_name, f"bg-{db_file.stem}")
                    item_uuid = f"Compendium.brancalonia.equipaggiamento.Item.{item_id}"

                    # Crea l'item se non esiste
                    item_file = equip_path / f"{item_id}.json"
                    if not item_file.exists():
                        item_data = self.create_equipment_item(item_name, item_id, db_file.stem)
                        with open(item_file, 'w', encoding='utf-8') as f:
                            json.dump(item_data, f, indent=2, ensure_ascii=False)
                        self.items_created.append(item_name)
                        print(f"  ✅ Creato item: {item_name}")

                    # Aggiungi a startingEquipment
                    starting_equipment.append({
                        "_id": hashlib.md5(f"{item_id}{idx}".encode()).hexdigest()[:16],
                        "type": "linked",
                        "count": 1,
                        "sort": idx * 100000,
                        "uuid": item_uuid
                    })

                # Aggiorna il background
                pack_data["system"]["startingEquipment"] = starting_equipment

                # Salva il background aggiornato
                with open(pack_file, 'w', encoding='utf-8') as f:
                    json.dump(pack_data, f, indent=2, ensure_ascii=False)

                self.restored_count += 1
                print(f"✅ Ripristinato {db_file.stem}: {len(starting_equipment)} item")

            except Exception as e:
                self.errors.append(f"Errore in {db_file.name}: {str(e)}")

    def create_equipment_item(self, name: str, item_id: str, bg_name: str) -> Dict:
        """Crea un item di equipaggiamento"""

        # Determina tipo item
        item_type = "loot"  # Default
        if "borsa" in name.lower():
            item_type = "container"
        elif "abito" in name.lower() or "vesti" in name.lower():
            item_type = "equipment"
        elif "libro" in name.lower() or "pergamena" in name.lower():
            item_type = "loot"
        elif "simbolo" in name.lower() or "ciondolo" in name.lower():
            item_type = "loot"
        elif "strumento" in name.lower():
            item_type = "tool"
        elif "bastone" in name.lower():
            item_type = "weapon"

        # Struttura base
        item_data = {
            "_id": item_id,
            "_key": f"!items!{item_id}",
            "name": name,
            "type": item_type,
            "img": self.get_item_icon(name),
            "system": {
                "description": {
                    "value": f"<p>{name} - Equipaggiamento iniziale del background {bg_name}.</p>",
                    "chat": "",
                    "unidentified": ""
                },
                "source": {
                    "custom": "Brancalonia"
                },
                "quantity": 1,
                "weight": 0,
                "price": {
                    "value": 0,
                    "denomination": "gp"
                },
                "identified": True,
                "rarity": "common"
            },
            "effects": [],
            "folder": None,
            "sort": 0,
            "ownership": {"default": 0},
            "flags": {
                "brancalonia": {
                    "tipo": "equipaggiamento_background",
                    "background": bg_name
                }
            }
        }

        # Aggiungi campi specifici per tipo
        if item_type == "container":
            item_data["system"]["capacity"] = {
                "type": "weight",
                "value": 30
            }
            item_data["system"]["currency"] = {
                "cp": 0, "sp": 0, "ep": 0, "gp": 0, "pp": 0
            }
            # Gestisci denaro nella borsa
            if "ma" in name:
                import re
                match = re.search(r'(\d+)\s*ma', name)
                if match:
                    silver = int(match.group(1))
                    item_data["system"]["currency"]["sp"] = silver * 10  # ma = 10 sp

        elif item_type == "equipment":
            item_data["system"]["armor"] = {
                "value": 10,
                "dex": None
            }
            item_data["system"]["armorType"] = "clothing"
            item_data["system"]["equipped"] = False

        elif item_type == "weapon":
            item_data["system"]["damage"] = {
                "parts": [["1d6 + @mod", "bludgeoning"]],
                "versatile": ""
            }
            item_data["system"]["weaponType"] = "simpleM"
            item_data["system"]["properties"] = []
            item_data["system"]["proficient"] = None

        elif item_type == "tool":
            item_data["system"]["toolType"] = "artisan"
            item_data["system"]["ability"] = "int"
            item_data["system"]["chatFlavor"] = ""
            item_data["system"]["proficient"] = None
            item_data["system"]["bonus"] = ""

        return item_data

    def get_item_icon(self, name: str) -> str:
        """Ottiene un'icona appropriata per l'item"""
        name_lower = name.lower()

        icon_map = {
            "borsa": "icons/containers/bags/sack-simple-leather-brown.webp",
            "abito": "icons/equipment/chest/shirt-simple-white.webp",
            "vesti": "icons/equipment/chest/robe-simple-blue.webp",
            "libro": "icons/sundries/books/book-worn-brown.webp",
            "pergamena": "icons/sundries/scrolls/scroll-plain-tan.webp",
            "simbolo": "icons/commodities/treasure/token-gold-cross.webp",
            "ciondolo": "icons/equipment/neck/pendant-silver.webp",
            "monile": "icons/equipment/neck/necklace-simple-gold.webp",
            "bastone": "icons/weapons/staves/staff-simple.webp",
            "mazzo": "icons/sundries/gaming/playing-cards.webp",
            "dadi": "icons/sundries/gaming/dice-pair-white.webp",
            "calamaio": "icons/tools/scribal/ink-pot-glass-corked-black.webp",
            "pennino": "icons/tools/scribal/quill-feather-white.webp",
            "mappa": "icons/sundries/documents/map-folded-tan.webp",
            "lettere": "icons/sundries/scrolls/scroll-rolled-red.webp",
            "piede": "icons/tools/hand/crowbar-black.webp",
            "custodia": "icons/containers/bags/case-scroll-tan.webp",
            "strumento": "icons/tools/instruments/lute-gold-brown.webp",
            "mostrina": "icons/equipment/chest/badge-medal-gold.webp",
            "trofeo": "icons/commodities/treasure/trophy-cup-gold.webp",
            "pigmenti": "icons/tools/scribal/paints-paint-brush.webp"
        }

        for key, icon in icon_map.items():
            if key in name_lower:
                return icon

        return "icons/commodities/treasure/gem-pearl-white.webp"  # Default

    def add_spell_progression_to_classes(self):
        """Aggiunge SpellcastingValue advancement alle classi caster"""
        print("\n📚 AGGIUNTA SPELL PROGRESSION ALLE CLASSI...")

        class_path = Path("packs/classi/_source")

        # Definisci quali classi sono caster e il loro tipo
        caster_classes = {
            "bardo": ("full", "cha"),
            "chierico": ("full", "wis"),
            "druido": ("full", "wis"),
            "mago": ("full", "int"),
            "stregone": ("full", "cha"),
            "warlock": ("pact", "cha"),
            "paladino": ("half", "cha"),
            "ranger": ("half", "wis")
        }

        for class_file in class_path.glob("*.json"):
            class_name = class_file.stem

            if class_name not in caster_classes:
                continue

            progression_type, ability = caster_classes[class_name]

            with open(class_file, 'r', encoding='utf-8') as f:
                class_data = json.load(f)

            # Verifica se ha già SpellcastingValue
            has_spellcasting = any(
                adv.get('type') == 'SpellcastingValue'
                for adv in class_data.get('system', {}).get('advancement', [])
            )

            if has_spellcasting:
                continue

            # Aggiungi spellcasting al sistema
            if 'spellcasting' not in class_data.get('system', {}):
                class_data['system']['spellcasting'] = {
                    "progression": progression_type,
                    "ability": ability
                }

            # Crea SpellcastingValue advancement
            spell_advancement = self.create_spellcasting_advancement(progression_type)

            # Aggiungi all'inizio degli advancement
            class_data['system']['advancement'].insert(1, spell_advancement)

            # Salva
            with open(class_file, 'w', encoding='utf-8') as f:
                json.dump(class_data, f, indent=2, ensure_ascii=False)

            print(f"✅ Aggiunto SpellcastingValue a {class_name} ({progression_type})")
            self.restored_count += 1

    def create_spellcasting_advancement(self, progression: str) -> Dict:
        """Crea un advancement SpellcastingValue con progressione completa"""

        # Progressione slot incantesimi per tipo
        if progression == "full":
            # Full caster (Bardo, Chierico, Druido, Mago, Stregone)
            value = {
                "1": [2, 0, 0, 0, 0, 0, 0, 0, 0],
                "2": [3, 0, 0, 0, 0, 0, 0, 0, 0],
                "3": [4, 2, 0, 0, 0, 0, 0, 0, 0],
                "4": [4, 3, 0, 0, 0, 0, 0, 0, 0],
                "5": [4, 3, 2, 0, 0, 0, 0, 0, 0],
                "6": [4, 3, 3, 0, 0, 0, 0, 0, 0],
                "7": [4, 3, 3, 1, 0, 0, 0, 0, 0],
                "8": [4, 3, 3, 2, 0, 0, 0, 0, 0],
                "9": [4, 3, 3, 3, 1, 0, 0, 0, 0],
                "10": [4, 3, 3, 3, 2, 0, 0, 0, 0],
                "11": [4, 3, 3, 3, 2, 1, 0, 0, 0],
                "12": [4, 3, 3, 3, 2, 1, 0, 0, 0],
                "13": [4, 3, 3, 3, 2, 1, 1, 0, 0],
                "14": [4, 3, 3, 3, 2, 1, 1, 0, 0],
                "15": [4, 3, 3, 3, 2, 1, 1, 1, 0],
                "16": [4, 3, 3, 3, 2, 1, 1, 1, 0],
                "17": [4, 3, 3, 3, 2, 1, 1, 1, 1],
                "18": [4, 3, 3, 3, 3, 1, 1, 1, 1],
                "19": [4, 3, 3, 3, 3, 2, 1, 1, 1],
                "20": [4, 3, 3, 3, 3, 2, 2, 1, 1]
            }
        elif progression == "half":
            # Half caster (Paladino, Ranger)
            value = {
                "2": [2, 0, 0, 0, 0],
                "3": [3, 0, 0, 0, 0],
                "4": [3, 0, 0, 0, 0],
                "5": [4, 2, 0, 0, 0],
                "6": [4, 2, 0, 0, 0],
                "7": [4, 3, 0, 0, 0],
                "8": [4, 3, 0, 0, 0],
                "9": [4, 3, 2, 0, 0],
                "10": [4, 3, 2, 0, 0],
                "11": [4, 3, 3, 0, 0],
                "12": [4, 3, 3, 0, 0],
                "13": [4, 3, 3, 1, 0],
                "14": [4, 3, 3, 1, 0],
                "15": [4, 3, 3, 2, 0],
                "16": [4, 3, 3, 2, 0],
                "17": [4, 3, 3, 3, 1],
                "18": [4, 3, 3, 3, 1],
                "19": [4, 3, 3, 3, 2],
                "20": [4, 3, 3, 3, 2]
            }
        elif progression == "pact":
            # Warlock usa ScaleValue invece
            return {
                "_id": hashlib.md5("warlock-pact-slots".encode()).hexdigest()[:16],
                "type": "ScaleValue",
                "configuration": {
                    "identifier": "pact-slots",
                    "type": "number",
                    "distance": {"units": ""},
                    "scale": {}
                },
                "value": {
                    "1": 1,
                    "2": 2,
                    "11": 3,
                    "17": 4
                },
                "title": "Pact Magic Slots"
            }
        else:
            value = {}

        return {
            "_id": hashlib.md5(f"spell-progression-{progression}".encode()).hexdigest()[:16],
            "type": "SpellcastingValue",
            "configuration": {},
            "value": value,
            "title": "Slot Incantesimi"
        }

    def add_scale_values(self):
        """Aggiunge ScaleValue per progressioni speciali (sneak attack, ki, etc)"""
        print("\n⚡ AGGIUNTA SCALE VALUES...")

        scale_configs = {
            "ladro": [
                {
                    "id": "sneak-attack",
                    "title": "Attacco Furtivo",
                    "identifier": "sneak-attack",
                    "type": "dice",
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
                    }
                }
            ],
            "monaco": [
                {
                    "id": "ki-points",
                    "title": "Punti Ki",
                    "identifier": "ki",
                    "type": "number",
                    "value": {
                        "2": 2, "3": 3, "4": 4, "5": 5, "6": 6,
                        "7": 7, "8": 8, "9": 9, "10": 10,
                        "11": 11, "12": 12, "13": 13, "14": 14,
                        "15": 15, "16": 16, "17": 17, "18": 18,
                        "19": 19, "20": 20
                    }
                },
                {
                    "id": "martial-arts",
                    "title": "Arti Marziali",
                    "identifier": "martial-arts",
                    "type": "dice",
                    "value": {
                        "1": "1d4",
                        "5": "1d6",
                        "11": "1d8",
                        "17": "1d10"
                    }
                },
                {
                    "id": "movement",
                    "title": "Movimento Senza Armatura",
                    "identifier": "unarmored-movement",
                    "type": "distance",
                    "value": {
                        "2": 10,
                        "6": 15,
                        "10": 20,
                        "14": 25,
                        "18": 30
                    }
                }
            ],
            "warlock": [
                {
                    "id": "invocations",
                    "title": "Invocazioni Mistiche",
                    "identifier": "eldritch-invocations",
                    "type": "number",
                    "value": {
                        "2": 2,
                        "5": 3,
                        "7": 4,
                        "9": 5,
                        "12": 6,
                        "15": 7,
                        "18": 8
                    }
                }
            ],
            "stregone": [
                {
                    "id": "sorcery-points",
                    "title": "Punti Stregoneria",
                    "identifier": "sorcery-points",
                    "type": "number",
                    "value": {
                        "2": 2, "3": 3, "4": 4, "5": 5, "6": 6,
                        "7": 7, "8": 8, "9": 9, "10": 10,
                        "11": 11, "12": 12, "13": 13, "14": 14,
                        "15": 15, "16": 16, "17": 17, "18": 18,
                        "19": 19, "20": 20
                    }
                }
            ]
        }

        class_path = Path("packs/classi/_source")

        for class_name, scales in scale_configs.items():
            class_file = class_path / f"{class_name}.json"
            if not class_file.exists():
                continue

            with open(class_file, 'r', encoding='utf-8') as f:
                class_data = json.load(f)

            for scale_config in scales:
                # Verifica se esiste già
                has_scale = any(
                    adv.get('type') == 'ScaleValue' and
                    adv.get('configuration', {}).get('identifier') == scale_config['identifier']
                    for adv in class_data.get('system', {}).get('advancement', [])
                )

                if has_scale:
                    continue

                # Crea ScaleValue
                scale_adv = {
                    "_id": hashlib.md5(scale_config['id'].encode()).hexdigest()[:16],
                    "type": "ScaleValue",
                    "configuration": {
                        "identifier": scale_config['identifier'],
                        "type": scale_config['type'],
                        "distance": {"units": "ft" if scale_config['type'] == 'distance' else ""},
                        "scale": {}
                    },
                    "value": scale_config['value'],
                    "title": scale_config['title']
                }

                # Aggiungi dopo HitPoints
                idx = 1
                for i, adv in enumerate(class_data['system']['advancement']):
                    if adv.get('type') == 'HitPoints':
                        idx = i + 1
                        break

                class_data['system']['advancement'].insert(idx, scale_adv)

                print(f"✅ Aggiunto {scale_config['title']} a {class_name}")
                self.restored_count += 1

            # Salva
            with open(class_file, 'w', encoding='utf-8') as f:
                json.dump(class_data, f, indent=2, ensure_ascii=False)

    def generate_report(self):
        """Genera report finale"""
        print("\n" + "="*60)
        print("REPORT RIPRISTINO CONTENUTI")
        print("="*60)
        print(f"✅ Item creati: {len(self.items_created)}")
        print(f"✅ Background ripristinati: {self.restored_count}")

        if self.items_created:
            print("\n📦 ITEM CREATI:")
            for item in self.items_created[:20]:
                print(f"  - {item}")
            if len(self.items_created) > 20:
                print(f"  ... e altri {len(self.items_created) - 20}")

        if self.errors:
            print("\n❌ ERRORI:")
            for error in self.errors[:5]:
                print(f"  - {error}")

        print("\n" + "="*60)
        print("MAI PIÙ RIMUOVERE CONTENUTI - SOLO IMPLEMENTARE!")
        print("="*60)

if __name__ == "__main__":
    print("🚀 AGENT RESTORE ALL CONTENT")
    print("Ripristino di TUTTO il contenuto rimosso")

    restorer = ContentRestorer()

    # Ripristina equipaggiamento background
    restorer.restore_background_equipment()

    # Aggiungi spell progression
    restorer.add_spell_progression_to_classes()

    # Aggiungi scale values
    restorer.add_scale_values()

    # Report
    restorer.generate_report()

    print("\n✅ Ripristino completato!")
    print("Ora compila i pack con: ./scripts/compile-all-packs.sh")