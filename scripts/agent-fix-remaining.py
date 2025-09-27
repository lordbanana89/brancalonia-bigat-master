#!/usr/bin/env python3
"""
AGENT FIX REMAINING - Risolve i problemi rimanenti identificati
Versione: 1.0.0
Target: 6 errori UUID dnd5e + 54 warning descrizioni mancanti
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any

class RemainingFixer:
    def __init__(self):
        self.base_path = Path(".")
        self.errors_fixed = []
        self.warnings_fixed = []

        # Mapping UUID dnd5e -> brancalonia equivalenti
        self.uuid_replacements = {
            "Compendium.dnd5e.items.Item.cWi8SiGCmP89GQZZ": "Compendium.brancalonia.equipaggiamento.Item.pugnale001",
            "Compendium.dnd5e.items.Item.2H6CkfArvmaZFoaR": "Compendium.brancalonia.equipaggiamento.Item.spada001",
            "Compendium.dnd5e.items.Item.4d2SZ7c7O5kGER5C": "Compendium.brancalonia.equipaggiamento.Item.arco001",
            "Compendium.dnd5e.items.Item.zF21mAzPRrlqN6Fb": "Compendium.brancalonia.equipaggiamento.Item.armatura001",
            "Compendium.dnd5e.items.Item.ytHoUEhE2B7K4CDm": "Compendium.brancalonia.equipaggiamento.Item.scudo001",
            "Compendium.dnd5e.items.Item.ibfTWP5nF1wRc3QB": "Compendium.brancalonia.equipaggiamento.Item.borsa001"
        }

        # Features che necessitano descrizioni
        self.features_needing_description = [
            "tratto001_costrutto",
            "tratto002_riparazione",
            "tratto-003_costituzione_possente",
            "tratto-001_resistenza_infernale",
            "tratto002_versatilita_abilita"
        ]

    def fix_uuid_references(self):
        """Corregge tutti i riferimenti UUID a dnd5e core"""
        print("\n🔧 Correzione UUID references dnd5e...")

        # Cerca in tutti i pack
        packs = ["backgrounds", "classi", "sottoclassi", "razze", "brancalonia-features"]

        for pack in packs:
            pack_path = self.base_path / "packs" / pack / "_source"
            if not pack_path.exists():
                continue

            for json_file in pack_path.glob("*.json"):
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    modified = False
                    data_str = json.dumps(data)

                    # Sostituisci tutti gli UUID dnd5e
                    for old_uuid, new_uuid in self.uuid_replacements.items():
                        if old_uuid in data_str:
                            data_str = data_str.replace(old_uuid, new_uuid)
                            modified = True
                            self.errors_fixed.append(f"UUID fix in {json_file.name}: {old_uuid} -> {new_uuid}")

                    if modified:
                        data = json.loads(data_str)
                        with open(json_file, 'w', encoding='utf-8') as f:
                            json.dump(data, f, indent=2, ensure_ascii=False)
                        print(f"  ✅ Fixed UUID in: {json_file.name}")

                except Exception as e:
                    print(f"  ❌ Error processing {json_file.name}: {e}")

    def fix_missing_descriptions(self):
        """Aggiunge descrizioni mancanti alle features"""
        print("\n📝 Aggiunta descrizioni mancanti...")

        features_path = self.base_path / "packs" / "brancalonia-features" / "_source"

        # Descrizioni default per le features
        descriptions = {
            "tratto001_costrutto": "Sei un costrutto magico. Non hai bisogno di respirare, mangiare o dormire, e sei immune a malattie e veleni.",
            "tratto002_riparazione": "Quando riposi, puoi riparare i danni subiti utilizzando materiali appropriati invece di cure magiche.",
            "tratto-003_costituzione_possente": "La tua costituzione robusta ti conferisce resistenza superiore. Ottieni +1 ai punti ferita per livello.",
            "tratto-001_resistenza_infernale": "Il tuo retaggio infernale ti conferisce resistenza al danno da fuoco.",
            "tratto002_versatilita_abilita": "Scegli due abilità. Ottieni competenza in quelle abilità."
        }

        for feature_name, description in descriptions.items():
            feature_file = features_path / f"{feature_name}.json"
            if feature_file.exists():
                try:
                    with open(feature_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    # Aggiungi descrizione se mancante
                    if "system" in data:
                        if "description" not in data["system"]:
                            data["system"]["description"] = {}

                        if not data["system"]["description"].get("value"):
                            data["system"]["description"]["value"] = f"<p>{description}</p>"
                            self.warnings_fixed.append(f"Descrizione aggiunta a {feature_name}")

                            with open(feature_file, 'w', encoding='utf-8') as f:
                                json.dump(data, f, indent=2, ensure_ascii=False)
                            print(f"  ✅ Descrizione aggiunta: {feature_name}")

                except Exception as e:
                    print(f"  ❌ Error processing {feature_name}: {e}")

    def create_missing_equipment(self):
        """Crea equipaggiamenti mancanti referenziati"""
        print("\n🎒 Creazione equipaggiamenti mancanti...")

        equipment_path = self.base_path / "packs" / "equipaggiamento" / "_source"
        equipment_path.mkdir(parents=True, exist_ok=True)

        # Equipaggiamenti base da creare se non esistono
        base_equipment = {
            "pugnale001": {
                "_id": "pugnale001",
                "_key": "!items!pugnale001",
                "name": "Pugnale",
                "type": "weapon",
                "img": "icons/weapons/daggers/dagger-simple.webp",
                "system": {
                    "description": {"value": "<p>Un pugnale semplice ma efficace.</p>"},
                    "source": {"custom": "Brancalonia"},
                    "quantity": 1,
                    "weight": 1,
                    "price": {"value": 2, "denomination": "gp"},
                    "identified": True,
                    "damage": {"parts": [["1d4 + @mod", "piercing"]], "versatile": ""},
                    "range": {"value": 20, "long": 60, "units": "ft"},
                    "properties": ["fin", "lgt", "thr"],
                    "weaponType": "simpleM",
                    "proficient": None
                },
                "effects": [],
                "folder": None,
                "sort": 0,
                "ownership": {"default": 0}
            },
            "spada001": {
                "_id": "spada001",
                "_key": "!items!spada001",
                "name": "Spada Corta",
                "type": "weapon",
                "img": "icons/weapons/swords/sword-guard-brass.webp",
                "system": {
                    "description": {"value": "<p>Una spada corta ben bilanciata.</p>"},
                    "source": {"custom": "Brancalonia"},
                    "quantity": 1,
                    "weight": 2,
                    "price": {"value": 10, "denomination": "gp"},
                    "identified": True,
                    "damage": {"parts": [["1d6 + @mod", "slashing"]], "versatile": ""},
                    "range": {"value": None, "long": None, "units": "ft"},
                    "properties": ["fin", "lgt"],
                    "weaponType": "martialM",
                    "proficient": None
                },
                "effects": [],
                "folder": None,
                "sort": 0,
                "ownership": {"default": 0}
            },
            "arco001": {
                "_id": "arco001",
                "_key": "!items!arco001",
                "name": "Arco Corto",
                "type": "weapon",
                "img": "icons/weapons/bows/bow-simple.webp",
                "system": {
                    "description": {"value": "<p>Un arco corto per combattimento a distanza.</p>"},
                    "source": {"custom": "Brancalonia"},
                    "quantity": 1,
                    "weight": 2,
                    "price": {"value": 25, "denomination": "gp"},
                    "identified": True,
                    "damage": {"parts": [["1d6 + @mod", "piercing"]], "versatile": ""},
                    "range": {"value": 80, "long": 320, "units": "ft"},
                    "properties": ["amm", "two"],
                    "weaponType": "simpleR",
                    "proficient": None
                },
                "effects": [],
                "folder": None,
                "sort": 0,
                "ownership": {"default": 0}
            },
            "armatura001": {
                "_id": "armatura001",
                "_key": "!items!armatura001",
                "name": "Armatura di Cuoio",
                "type": "equipment",
                "img": "icons/equipment/chest/breastplate-leather-brown.webp",
                "system": {
                    "description": {"value": "<p>Armatura leggera di cuoio bollito.</p>"},
                    "source": {"custom": "Brancalonia"},
                    "quantity": 1,
                    "weight": 10,
                    "price": {"value": 10, "denomination": "gp"},
                    "identified": True,
                    "armor": {"value": 11, "dex": None},
                    "armorType": "light",
                    "speed": {"value": None, "conditions": ""},
                    "strength": None,
                    "stealth": False,
                    "proficient": None,
                    "equipped": False
                },
                "effects": [],
                "folder": None,
                "sort": 0,
                "ownership": {"default": 0}
            },
            "scudo001": {
                "_id": "scudo001",
                "_key": "!items!scudo001",
                "name": "Scudo",
                "type": "equipment",
                "img": "icons/equipment/shield/round-wooden-boss-steel.webp",
                "system": {
                    "description": {"value": "<p>Uno scudo di legno rinforzato.</p>"},
                    "source": {"custom": "Brancalonia"},
                    "quantity": 1,
                    "weight": 6,
                    "price": {"value": 10, "denomination": "gp"},
                    "identified": True,
                    "armor": {"value": 2, "dex": None},
                    "armorType": "shield",
                    "speed": {"value": None, "conditions": ""},
                    "strength": None,
                    "stealth": False,
                    "proficient": None,
                    "equipped": False
                },
                "effects": [],
                "folder": None,
                "sort": 0,
                "ownership": {"default": 0}
            },
            "borsa001": {
                "_id": "borsa001",
                "_key": "!items!borsa001",
                "name": "Borsa da Viaggio",
                "type": "container",
                "img": "icons/containers/bags/pack-leather-white.webp",
                "system": {
                    "description": {"value": "<p>Una capiente borsa da viaggio.</p>"},
                    "source": {"custom": "Brancalonia"},
                    "quantity": 1,
                    "weight": 2,
                    "price": {"value": 2, "denomination": "gp"},
                    "identified": True,
                    "capacity": {"type": "weight", "value": 30},
                    "currency": {"cp": 0, "sp": 0, "ep": 0, "gp": 0, "pp": 0}
                },
                "effects": [],
                "folder": None,
                "sort": 0,
                "ownership": {"default": 0}
            }
        }

        created = 0
        for item_id, item_data in base_equipment.items():
            item_file = equipment_path / f"{item_id}.json"
            if not item_file.exists():
                with open(item_file, 'w', encoding='utf-8') as f:
                    json.dump(item_data, f, indent=2, ensure_ascii=False)
                print(f"  ✅ Creato: {item_data['name']}")
                created += 1

        if created > 0:
            print(f"  📦 Creati {created} nuovi equipaggiamenti")

    def generate_report(self):
        """Genera report finale"""
        print("\n" + "="*60)
        print("AGENT FIX REMAINING - REPORT")
        print("="*60)
        print(f"✅ UUID dnd5e corretti: {len(self.errors_fixed)}")
        print(f"✅ Descrizioni aggiunte: {len(self.warnings_fixed)}")

        if self.errors_fixed:
            print("\nUUID CORRETTI:")
            for fix in self.errors_fixed[:5]:
                print(f"  - {fix}")

        if self.warnings_fixed:
            print("\nDESCRIZIONI AGGIUNTE:")
            for fix in self.warnings_fixed[:5]:
                print(f"  - {fix}")

        print("="*60)

if __name__ == "__main__":
    print("🚀 AGENT FIX REMAINING - Risoluzione problemi finali")

    fixer = RemainingFixer()
    fixer.fix_uuid_references()
    fixer.fix_missing_descriptions()
    fixer.create_missing_equipment()
    fixer.generate_report()

    print("\n✨ Fix remaining completato!")