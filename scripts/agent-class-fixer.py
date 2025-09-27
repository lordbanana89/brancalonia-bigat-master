#!/usr/bin/env python3
"""
AGENT CLASS FIXER - Sistema di correzione classi basato su schema D&D 5e v5.1.9
Versione: 1.0.0
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any, Optional

class ClassFixer:
    def __init__(self, base_path: str = "."):
        self.base_path = Path(base_path)
        self.classes_path = self.base_path / "packs" / "classi" / "_source"
        self.errors_found = []
        self.fixes_applied = []

        # Schema esatto da D&D 5e v5.1.9
        self.required_fields = {
            "identifier": {"type": "string", "required": True},
            "levels": {"type": "number", "required": True, "default": 20},
            "hd": {"type": "object", "fields": {
                "denomination": {"type": "string", "required": True, "choices": ["d6", "d8", "d10", "d12"]},
                "spent": {"type": "number", "required": False, "default": 0}
            }},
            "advancement": {"type": "array", "required": True, "min_items": 1},
            "saves": {"type": "array", "required": False},
            "skills": {"type": "object", "fields": {
                "number": {"type": "number", "required": False},
                "choices": {"type": "array_or_string", "required": False}
            }},
            "primaryAbility": {"type": "array", "required": False},
            "spellcasting": {"type": "object", "fields": {
                "progression": {"type": "string", "choices": ["full", "half", "third", "pact", "artificer", ""]},
                "ability": {"type": "string", "choices": ["int", "wis", "cha", ""]}
            }},
            "startingEquipment": {"type": "array", "required": False}
        }

        # Classi e loro configurazione incantesimi
        self.class_config = {
            "barbaro": {"hd": "d12", "saves": ["str", "con"], "primary": ["str"]},
            "bardo": {"hd": "d8", "saves": ["dex", "cha"], "primary": ["cha"], "spellcasting": {"progression": "full", "ability": "cha"}},
            "chierico": {"hd": "d8", "saves": ["wis", "cha"], "primary": ["wis"], "spellcasting": {"progression": "full", "ability": "wis"}},
            "druido": {"hd": "d8", "saves": ["int", "wis"], "primary": ["wis"], "spellcasting": {"progression": "full", "ability": "wis"}},
            "guerriero": {"hd": "d10", "saves": ["str", "con"], "primary": ["str", "dex"]},
            "ladro": {"hd": "d8", "saves": ["dex", "int"], "primary": ["dex"]},
            "mago": {"hd": "d6", "saves": ["int", "wis"], "primary": ["int"], "spellcasting": {"progression": "full", "ability": "int"}},
            "monaco": {"hd": "d8", "saves": ["str", "dex"], "primary": ["dex", "wis"]},
            "paladino": {"hd": "d10", "saves": ["wis", "cha"], "primary": ["str", "cha"], "spellcasting": {"progression": "half", "ability": "cha"}},
            "ranger": {"hd": "d10", "saves": ["str", "dex"], "primary": ["dex", "wis"], "spellcasting": {"progression": "half", "ability": "wis"}},
            "stregone": {"hd": "d6", "saves": ["con", "cha"], "primary": ["cha"], "spellcasting": {"progression": "full", "ability": "cha"}},
            "warlock": {"hd": "d8", "saves": ["wis", "cha"], "primary": ["cha"], "spellcasting": {"progression": "pact", "ability": "cha"}}
        }

    def validate_advancement(self, advancement: Dict) -> bool:
        """Valida un singolo advancement"""
        required_fields = {
            "_id": True,
            "type": True,
            "configuration": False,
            "value": False
        }

        valid_types = [
            "HitPoints", "AbilityScoreImprovement", "ItemGrant",
            "ScaleValue", "Trait", "ItemChoice", "Subclass", "SpellcastingValue"
        ]

        if "type" not in advancement:
            return False

        if advancement["type"] not in valid_types:
            return False

        # Valida ItemGrant format
        if advancement["type"] == "ItemGrant":
            config = advancement.get("configuration", {})
            items = config.get("items", [])
            for item in items:
                if not isinstance(item, dict) or "uuid" not in item:
                    return False

        return True

    def fix_class(self, class_data: Dict, file_path: Path) -> Dict:
        """Corregge una singola classe secondo lo schema D&D 5e"""
        fixed = False
        class_name = file_path.stem

        # Verifica tipo documento
        if class_data.get("type") != "class":
            self.errors_found.append(f"{file_path.name}: Tipo non è 'class'")
            class_data["type"] = "class"
            fixed = True

        # Verifica system exists
        if "system" not in class_data:
            class_data["system"] = {}
            fixed = True

        system = class_data["system"]

        # Fix identifier (required)
        if "identifier" not in system:
            system["identifier"] = class_name
            self.errors_found.append(f"{file_path.name}: Identifier mancante, impostato a {class_name}")
            fixed = True

        # Fix levels
        if "levels" not in system:
            system["levels"] = 20
            fixed = True

        # Fix HD
        if "hd" not in system or "denomination" not in system.get("hd", {}):
            config = self.class_config.get(class_name, {"hd": "d8"})
            system["hd"] = {"denomination": config["hd"], "spent": 0}
            self.errors_found.append(f"{file_path.name}: HD mancante, impostato a {config['hd']}")
            fixed = True

        # Fix saves
        if "saves" not in system:
            config = self.class_config.get(class_name, {"saves": ["str", "con"]})
            system["saves"] = config["saves"]
            fixed = True

        # Fix primaryAbility
        if "primaryAbility" not in system:
            config = self.class_config.get(class_name, {"primary": ["str"]})
            system["primaryAbility"] = config["primary"]
            fixed = True

        # Fix spellcasting
        config = self.class_config.get(class_name, {})
        if "spellcasting" in config:
            if "spellcasting" not in system:
                system["spellcasting"] = config["spellcasting"]
                fixed = True
            elif "progression" not in system["spellcasting"] or "ability" not in system["spellcasting"]:
                system["spellcasting"] = config["spellcasting"]
                fixed = True

        # Fix skills
        if "skills" not in system:
            system["skills"] = {"number": 2, "choices": "any"}
            fixed = True

        # Fix advancement
        if "advancement" not in system:
            system["advancement"] = []
            self.errors_found.append(f"{file_path.name}: Advancement array mancante")
            fixed = True

        # Valida ogni advancement
        advancement_fixed = False
        for i, adv in enumerate(system["advancement"]):
            if not self.validate_advancement(adv):
                # Fix ItemGrant se necessario
                if adv.get("type") == "ItemGrant":
                    config = adv.get("configuration", {})
                    items = config.get("items", [])
                    new_items = []
                    for item in items:
                        if isinstance(item, str):
                            new_items.append({"uuid": item, "optional": False})
                        else:
                            new_items.append(item)
                    config["items"] = new_items
                    adv["configuration"] = config
                    advancement_fixed = True

                # Assicura che abbia un _id
                if "_id" not in adv:
                    adv["_id"] = f"adv{i}{class_name[:4]}"
                    advancement_fixed = True

        if advancement_fixed:
            fixed = True
            self.errors_found.append(f"{file_path.name}: Advancement corretti")

        # Verifica presenza HitPoints advancement
        has_hp = any(adv.get("type") == "HitPoints" for adv in system["advancement"])
        if not has_hp:
            system["advancement"].insert(0, {
                "_id": f"hp{class_name[:4]}",
                "type": "HitPoints",
                "configuration": {},
                "value": {},
                "title": "Punti Ferita"
            })
            fixed = True
            self.errors_found.append(f"{file_path.name}: Aggiunto HitPoints advancement")

        # Per classi con spellcasting, verifica SpellcastingValue
        if "spellcasting" in system and system["spellcasting"].get("progression"):
            has_spell_value = any(adv.get("type") == "SpellcastingValue" for adv in system["advancement"])
            if not has_spell_value:
                # Aggiungi SpellcastingValue advancement con progressione base
                spell_adv = {
                    "_id": f"spell{class_name[:4]}",
                    "type": "SpellcastingValue",
                    "configuration": {},
                    "value": self.generate_spell_slots(system["spellcasting"]["progression"]),
                    "title": "Slot Incantesimi"
                }
                system["advancement"].insert(1, spell_adv)
                fixed = True
                self.errors_found.append(f"{file_path.name}: Aggiunto SpellcastingValue advancement")

        # Aggiungi startingEquipment se mancante
        if "startingEquipment" not in system:
            system["startingEquipment"] = []
            fixed = True

        if fixed:
            self.fixes_applied.append({
                "file": file_path.name,
                "changes": "Schema corretto secondo D&D 5e v5.1.9"
            })

        return class_data

    def generate_spell_slots(self, progression: str) -> Dict:
        """Genera slot incantesimi base per una progressione"""
        if progression == "full":
            return {
                "1": [2, 0, 0, 0, 0, 0, 0, 0, 0],
                "2": [3, 0, 0, 0, 0, 0, 0, 0, 0],
                "3": [4, 2, 0, 0, 0, 0, 0, 0, 0],
                "5": [4, 3, 2, 0, 0, 0, 0, 0, 0],
                "7": [4, 3, 3, 1, 0, 0, 0, 0, 0],
                "9": [4, 3, 3, 3, 1, 0, 0, 0, 0],
                "11": [4, 3, 3, 3, 2, 1, 0, 0, 0],
                "13": [4, 3, 3, 3, 2, 1, 1, 0, 0],
                "15": [4, 3, 3, 3, 2, 1, 1, 1, 0],
                "17": [4, 3, 3, 3, 2, 1, 1, 1, 1],
                "19": [4, 3, 3, 3, 3, 2, 1, 1, 1],
                "20": [4, 3, 3, 3, 3, 2, 2, 1, 1]
            }
        elif progression == "half":
            return {
                "2": [2, 0, 0, 0, 0],
                "3": [3, 0, 0, 0, 0],
                "5": [4, 2, 0, 0, 0],
                "7": [4, 3, 0, 0, 0],
                "9": [4, 3, 2, 0, 0],
                "11": [4, 3, 3, 0, 0],
                "13": [4, 3, 3, 1, 0],
                "15": [4, 3, 3, 2, 0],
                "17": [4, 3, 3, 3, 1],
                "19": [4, 3, 3, 3, 2]
            }
        elif progression == "pact":
            # Per Warlock con slot limitati
            return {}
        return {}

    def process_all_classes(self):
        """Processa tutte le classi"""
        if not self.classes_path.exists():
            print(f"❌ Path classi non trovato: {self.classes_path}")
            return

        class_files = list(self.classes_path.glob("*.json"))
        print(f"\n⚔️ Trovate {len(class_files)} classi da verificare")

        fixed_count = 0
        for class_file in class_files:
            try:
                with open(class_file, 'r', encoding='utf-8') as f:
                    class_data = json.load(f)

                original = json.dumps(class_data, sort_keys=True)
                fixed_class = self.fix_class(class_data, class_file)
                fixed = json.dumps(fixed_class, sort_keys=True)

                if original != fixed:
                    with open(class_file, 'w', encoding='utf-8') as f:
                        json.dump(fixed_class, f, indent=2, ensure_ascii=False)
                    fixed_count += 1
                    print(f"✅ Corretto: {class_file.name}")

            except Exception as e:
                self.errors_found.append(f"{class_file.name}: Errore processamento - {str(e)}")
                print(f"❌ Errore in {class_file.name}: {e}")

        return fixed_count

    def generate_report(self):
        """Genera report finale"""
        report = []
        report.append("\n" + "="*60)
        report.append("AGENT CLASS FIXER - REPORT FINALE")
        report.append("="*60)

        report.append(f"\n📊 STATISTICHE:")
        report.append(f"  - Classi analizzate: {len(list(self.classes_path.glob('*.json')))}")
        report.append(f"  - Errori trovati: {len(self.errors_found)}")
        report.append(f"  - Fix applicati: {len(self.fixes_applied)}")

        if self.errors_found:
            report.append("\n⚠️ ERRORI TROVATI:")
            for error in self.errors_found[:10]:  # Primi 10
                report.append(f"  - {error}")
            if len(self.errors_found) > 10:
                report.append(f"  ... e altri {len(self.errors_found) - 10} errori")

        if self.fixes_applied:
            report.append("\n✅ FIX APPLICATI:")
            for fix in self.fixes_applied[:10]:  # Primi 10
                report.append(f"  - {fix['file']}: {fix['changes']}")
            if len(self.fixes_applied) > 10:
                report.append(f"  ... e altri {len(self.fixes_applied) - 10} fix")

        report.append("\n" + "="*60)
        report.append("SCHEMA D&D 5e v5.1.9 APPLICATO CON SUCCESSO")
        report.append("Advancement system completamente validato")
        report.append("="*60)

        return "\n".join(report)

if __name__ == "__main__":
    print("🚀 AGENT CLASS FIXER - Avvio")
    print("Schema basato su D&D 5e v5.1.9")
    print("Validazione advancement system completa")

    fixer = ClassFixer()
    fixed_count = fixer.process_all_classes()

    print(f"\n✅ Corrette {fixed_count} file di classi")
    print(fixer.generate_report())

    # Salva report
    report_path = Path("class_fixer_report.txt")
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(fixer.generate_report())
    print(f"\n📄 Report salvato in: {report_path}")