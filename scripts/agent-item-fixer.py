#!/usr/bin/env python3
"""
AGENT ITEM FIXER - Sistema di correzione equipaggiamento basato su schema D&D 5e v5.1.9
Versione: 1.0.0
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any, Optional

class ItemFixer:
    def __init__(self, base_path: str = "."):
        self.base_path = Path(base_path)
        self.items_path = self.base_path / "packs" / "equipaggiamento" / "_source"
        self.errors_found = []
        self.fixes_applied = []

        # Schema esatto da D&D 5e v5.1.9
        self.weapon_properties = [
            "ada", "amm", "fin", "foc", "hvy", "lgt", "lod", "mgc",
            "rch", "rel", "ret", "sil", "spc", "thr", "two", "ver"
        ]

        self.armor_types = {
            "light": ["padded", "leather", "studdedLeather"],
            "medium": ["hide", "chainShirt", "scaleMail", "breastplate", "halfPlate"],
            "heavy": ["ringMail", "chainMail", "splintMail", "plate"],
            "shield": ["shield"],
            "clothing": ["clothing"]
        }

        self.consumable_types = [
            "ammo", "potion", "poison", "food", "scroll", "wand", "rod", "trinket"
        ]

        self.required_fields = {
            "weapon": {
                "damage": {"type": "object", "fields": {
                    "parts": {"type": "array", "required": False},
                    "versatile": {"type": "string", "required": False}
                }},
                "range": {"type": "object", "fields": {
                    "value": {"type": "number", "required": False},
                    "long": {"type": "number", "required": False},
                    "units": {"type": "string", "required": False}
                }},
                "properties": {"type": "set", "required": False},
                "proficient": {"type": "number", "required": False},
                "weaponType": {"type": "string", "required": False}
            },
            "equipment": {
                "armor": {"type": "object", "fields": {
                    "value": {"type": "number", "required": False},
                    "dex": {"type": "number", "required": False}
                }},
                "speed": {"type": "object", "fields": {
                    "value": {"type": "number", "required": False},
                    "conditions": {"type": "string", "required": False}
                }},
                "strength": {"type": "number", "required": False},
                "proficient": {"type": "number", "required": False},
                "equipped": {"type": "boolean", "required": False}
            },
            "consumable": {
                "consumableType": {"type": "string", "required": False},
                "charges": {"type": "object", "fields": {
                    "value": {"type": "number", "required": False},
                    "max": {"type": "number", "required": False}
                }},
                "uses": {"type": "object", "fields": {
                    "value": {"type": "number", "required": False},
                    "max": {"type": "string", "required": False},
                    "recovery": {"type": "array", "required": False}
                }}
            },
            "loot": {
                "quantity": {"type": "number", "required": False},
                "weight": {"type": "number", "required": False},
                "price": {"type": "object", "fields": {
                    "value": {"type": "number", "required": False},
                    "denomination": {"type": "string", "required": False}
                }},
                "identified": {"type": "boolean", "required": False}
            },
            "tool": {
                "toolType": {"type": "string", "required": False},
                "ability": {"type": "string", "required": False},
                "chatFlavor": {"type": "string", "required": False},
                "proficient": {"type": "number", "required": False},
                "bonus": {"type": "string", "required": False}
            },
            "container": {
                "capacity": {"type": "object", "fields": {
                    "type": {"type": "string", "required": False},
                    "value": {"type": "number", "required": False}
                }},
                "currency": {"type": "object", "fields": {
                    "cp": {"type": "number", "required": False},
                    "sp": {"type": "number", "required": False},
                    "ep": {"type": "number", "required": False},
                    "gp": {"type": "number", "required": False},
                    "pp": {"type": "number", "required": False}
                }}
            }
        }

        # Mapping tipo italiano -> inglese
        self.type_mapping = {
            "arma": "weapon",
            "armatura": "equipment",
            "equipaggiamento": "equipment",
            "consumabile": "consumable",
            "bottino": "loot",
            "tesoro": "loot",
            "strumento": "tool",
            "contenitore": "container",
            "oggetto": "loot"
        }

    def detect_item_type(self, item_data: Dict) -> str:
        """Rileva il tipo di item basandosi sui campi presenti"""
        system = item_data.get("system", {})
        name = item_data.get("name", "").lower()

        # Check explicit type
        current_type = item_data.get("type", "")
        if current_type in self.type_mapping:
            return self.type_mapping[current_type]

        # Deduce from fields
        if "damage" in system or "weaponType" in system:
            return "weapon"
        elif "armor" in system or "armorType" in system:
            return "equipment"
        elif "consumableType" in system or "charges" in system:
            return "consumable"
        elif "toolType" in system:
            return "tool"
        elif "capacity" in system:
            return "container"

        # Deduce from name
        weapon_keywords = ["spada", "ascia", "martello", "arco", "pugnale", "lancia", "mazza"]
        armor_keywords = ["armatura", "corazza", "scudo", "elmo", "guanti", "stivali"]
        consumable_keywords = ["pozione", "pergamena", "bacchetta", "scroll", "cibo", "razione"]

        for keyword in weapon_keywords:
            if keyword in name:
                return "weapon"

        for keyword in armor_keywords:
            if keyword in name:
                return "equipment"

        for keyword in consumable_keywords:
            if keyword in name:
                return "consumable"

        return "loot"  # Default

    def fix_item(self, item_data: Dict, file_path: Path) -> Dict:
        """Corregge un singolo item secondo lo schema D&D 5e"""
        fixed = False

        # Determina tipo corretto
        detected_type = self.detect_item_type(item_data)
        if item_data.get("type") != detected_type:
            self.errors_found.append(f"{file_path.name}: Tipo cambiato da '{item_data.get('type')}' a '{detected_type}'")
            item_data["type"] = detected_type
            fixed = True

        # Verifica system exists
        if "system" not in item_data:
            item_data["system"] = {}
            fixed = True

        system = item_data["system"]

        # Fix campi base comuni
        if "quantity" not in system:
            system["quantity"] = 1
            fixed = True

        if "weight" not in system:
            system["weight"] = 0
            fixed = True

        if "price" not in system:
            system["price"] = {"value": 0, "denomination": "gp"}
            fixed = True
        elif isinstance(system["price"], (int, float)):
            system["price"] = {"value": system["price"], "denomination": "gp"}
            fixed = True

        if "identified" not in system:
            system["identified"] = True
            fixed = True

        # Fix specifici per tipo
        item_type = item_data["type"]

        if item_type == "weapon":
            fixed = self.fix_weapon(system, file_path) or fixed

        elif item_type == "equipment":
            fixed = self.fix_equipment(system, file_path) or fixed

        elif item_type == "consumable":
            fixed = self.fix_consumable(system, file_path) or fixed

        elif item_type == "tool":
            fixed = self.fix_tool(system, file_path) or fixed

        elif item_type == "container":
            fixed = self.fix_container(system, file_path) or fixed

        elif item_type == "loot":
            # Loot ha solo campi base, già gestiti sopra
            pass

        # Fix description
        if "description" not in system:
            system["description"] = {"value": "", "chat": "", "unidentified": ""}
            fixed = True
        elif isinstance(system["description"], str):
            system["description"] = {"value": system["description"], "chat": "", "unidentified": ""}
            fixed = True

        # Fix source
        if "source" not in system:
            system["source"] = {"custom": "Brancalonia"}
            fixed = True

        # Fix rarity
        if "rarity" not in system:
            system["rarity"] = "common"
            fixed = True

        # Fix attunement
        if "attunement" not in system:
            system["attunement"] = ""
            fixed = True

        if fixed:
            self.fixes_applied.append({
                "file": file_path.name,
                "type": item_type,
                "changes": "Schema corretto secondo D&D 5e v5.1.9"
            })

        return item_data

    def fix_weapon(self, system: Dict, file_path: Path) -> bool:
        """Fix specifici per weapon"""
        fixed = False

        if "damage" not in system:
            system["damage"] = {"parts": [], "versatile": ""}
            fixed = True
        elif "parts" not in system["damage"]:
            system["damage"]["parts"] = []
            fixed = True
        elif not isinstance(system["damage"]["parts"], list):
            system["damage"]["parts"] = []
            fixed = True

        if "range" not in system:
            system["range"] = {"value": None, "long": None, "units": "ft"}
            fixed = True

        if "properties" not in system:
            system["properties"] = []
            fixed = True
        elif isinstance(system["properties"], dict):
            # Converti dict in set/list
            system["properties"] = list(system["properties"].keys())
            fixed = True

        if "weaponType" not in system:
            # Deduce from name
            if any(x in file_path.name.lower() for x in ["spada", "pugnale", "ascia"]):
                system["weaponType"] = "simpleM"
            else:
                system["weaponType"] = "simpleR"
            fixed = True

        if "proficient" not in system:
            system["proficient"] = None
            fixed = True

        return fixed

    def fix_equipment(self, system: Dict, file_path: Path) -> bool:
        """Fix specifici per equipment/armor"""
        fixed = False

        if "armor" not in system:
            system["armor"] = {"value": 10, "dex": None}
            fixed = True
        elif "value" not in system["armor"]:
            system["armor"]["value"] = 10
            fixed = True

        if "speed" not in system:
            system["speed"] = {"value": None, "conditions": ""}
            fixed = True

        if "strength" not in system:
            system["strength"] = None
            fixed = True

        if "stealth" not in system:
            system["stealth"] = False
            fixed = True

        if "proficient" not in system:
            system["proficient"] = None
            fixed = True

        if "equipped" not in system:
            system["equipped"] = False
            fixed = True

        return fixed

    def fix_consumable(self, system: Dict, file_path: Path) -> bool:
        """Fix specifici per consumable"""
        fixed = False

        if "consumableType" not in system:
            # Deduce from name
            if "pozione" in file_path.name.lower():
                system["consumableType"] = "potion"
            elif "pergamena" in file_path.name.lower():
                system["consumableType"] = "scroll"
            else:
                system["consumableType"] = "trinket"
            fixed = True

        if "charges" not in system:
            system["charges"] = {"value": 1, "max": 1}
            fixed = True

        if "uses" not in system:
            system["uses"] = {"value": 0, "max": "", "recovery": []}
            fixed = True

        return fixed

    def fix_tool(self, system: Dict, file_path: Path) -> bool:
        """Fix specifici per tool"""
        fixed = False

        if "toolType" not in system:
            system["toolType"] = "artisan"
            fixed = True

        if "ability" not in system:
            system["ability"] = "int"
            fixed = True

        if "chatFlavor" not in system:
            system["chatFlavor"] = ""
            fixed = True

        if "proficient" not in system:
            system["proficient"] = None
            fixed = True

        if "bonus" not in system:
            system["bonus"] = ""
            fixed = True

        return fixed

    def fix_container(self, system: Dict, file_path: Path) -> bool:
        """Fix specifici per container"""
        fixed = False

        if "capacity" not in system:
            system["capacity"] = {"type": "weight", "value": 0}
            fixed = True

        if "currency" not in system:
            system["currency"] = {"cp": 0, "sp": 0, "ep": 0, "gp": 0, "pp": 0}
            fixed = True

        return fixed

    def process_all_items(self):
        """Processa tutti gli item"""
        if not self.items_path.exists():
            print(f"❌ Path equipaggiamento non trovato: {self.items_path}")
            return 0

        item_files = list(self.items_path.glob("*.json"))
        print(f"\n🎒 Trovati {len(item_files)} oggetti da verificare")

        fixed_count = 0
        for item_file in item_files:
            try:
                with open(item_file, 'r', encoding='utf-8') as f:
                    item_data = json.load(f)

                original = json.dumps(item_data, sort_keys=True)
                fixed_item = self.fix_item(item_data, item_file)
                fixed = json.dumps(fixed_item, sort_keys=True)

                if original != fixed:
                    with open(item_file, 'w', encoding='utf-8') as f:
                        json.dump(fixed_item, f, indent=2, ensure_ascii=False)
                    fixed_count += 1
                    print(f"✅ Corretto: {item_file.name} ({fixed_item['type']})")

            except Exception as e:
                self.errors_found.append(f"{item_file.name}: Errore processamento - {str(e)}")
                print(f"❌ Errore in {item_file.name}: {e}")

        return fixed_count

    def generate_report(self):
        """Genera report finale"""
        report = []
        report.append("\n" + "="*60)
        report.append("AGENT ITEM FIXER - REPORT FINALE")
        report.append("="*60)

        report.append(f"\n📊 STATISTICHE:")
        report.append(f"  - Item analizzati: {len(list(self.items_path.glob('*.json')))}")
        report.append(f"  - Errori trovati: {len(self.errors_found)}")
        report.append(f"  - Fix applicati: {len(self.fixes_applied)}")

        # Statistiche per tipo
        type_stats = {}
        for fix in self.fixes_applied:
            item_type = fix.get("type", "unknown")
            type_stats[item_type] = type_stats.get(item_type, 0) + 1

        if type_stats:
            report.append("\n📦 FIX PER TIPO:")
            for item_type, count in sorted(type_stats.items()):
                report.append(f"  - {item_type}: {count} item")

        if self.errors_found:
            report.append("\n⚠️ ERRORI TROVATI:")
            for error in self.errors_found[:10]:
                report.append(f"  - {error}")
            if len(self.errors_found) > 10:
                report.append(f"  ... e altri {len(self.errors_found) - 10} errori")

        report.append("\n" + "="*60)
        report.append("SCHEMA D&D 5e v5.1.9 APPLICATO CON SUCCESSO")
        report.append("="*60)

        return "\n".join(report)

if __name__ == "__main__":
    print("🚀 AGENT ITEM FIXER - Avvio")
    print("Schema basato su D&D 5e v5.1.9")

    fixer = ItemFixer()
    fixed_count = fixer.process_all_items()

    print(f"\n✅ Corretti {fixed_count} file di equipaggiamento")
    print(fixer.generate_report())

    # Salva report
    report_path = Path("item_fixer_report.txt")
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(fixer.generate_report())
    print(f"\n📄 Report salvato in: {report_path}")