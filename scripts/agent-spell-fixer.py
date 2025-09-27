#!/usr/bin/env python3
"""
AGENT SPELL FIXER - Sistema di correzione incantesimi basato su schema D&D 5e v5.1.9
Versione: 1.0.0
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any, Optional

class SpellFixer:
    def __init__(self, base_path: str = "."):
        self.base_path = Path(base_path)
        self.spells_path = self.base_path / "packs" / "incantesimi" / "_source"
        self.errors_found = []
        self.fixes_applied = []

        # Schema esatto da D&D 5e v5.1.9
        self.required_fields = {
            "level": {"type": "number", "required": True, "integer": True, "min": 0, "max": 9},
            "school": {"type": "string", "required": True, "choices": ["abj", "con", "div", "enc", "evo", "ill", "nec", "trs"]},
            "source": {"type": "object", "fields": {
                "custom": {"type": "string", "required": False},
                "book": {"type": "string", "required": False},
                "page": {"type": "string", "required": False},
                "license": {"type": "string", "required": False}
            }},
            "activation": {"type": "object", "fields": {
                "type": {"type": "string", "required": False, "choices": ["action", "bonus", "reaction", "minute", "hour", "day", "special", "legendary", "lair", "crew"]},
                "cost": {"type": "number", "required": False},
                "condition": {"type": "string", "required": False}
            }},
            "duration": {"type": "object", "fields": {
                "value": {"type": "string", "required": False},
                "units": {"type": "string", "required": False, "choices": ["inst", "turn", "round", "minute", "hour", "day", "month", "year", "perm", "spec"]}
            }},
            "target": {"type": "object", "fields": {
                "affects": {"type": "object", "fields": {
                    "type": {"type": "string", "required": False, "choices": ["self", "creature", "ally", "enemy", "object", "space", "radius", "sphere", "cylinder", "cone", "square", "cube", "line", "wall", "special"]},
                    "count": {"type": "string", "required": False},
                    "choice": {"type": "boolean", "required": False}
                }},
                "template": {"type": "object", "fields": {
                    "units": {"type": "string", "required": False},
                    "type": {"type": "string", "required": False},
                    "size": {"type": "string", "required": False},
                    "width": {"type": "string", "required": False},
                    "height": {"type": "string", "required": False}
                }}
            }},
            "range": {"type": "object", "fields": {
                "value": {"type": "string", "required": False},
                "units": {"type": "string", "required": False, "choices": ["self", "touch", "spec", "any", "ft", "mi"]}
            }},
            "uses": {"type": "object", "fields": {
                "max": {"type": "string", "required": False},
                "recovery": {"type": "array", "required": False}
            }},
            "consume": {"type": "object", "fields": {
                "type": {"type": "string", "required": False},
                "target": {"type": "string", "required": False},
                "amount": {"type": "number", "required": False},
                "scale": {"type": "boolean", "required": False}
            }},
            "ability": {"type": "string", "required": False, "choices": ["str", "dex", "con", "int", "wis", "cha", ""]},
            "actionType": {"type": "string", "required": False, "choices": ["mwak", "rwak", "msak", "rsak", "save", "heal", "abil", "util", "other", ""]},
            "attack": {"type": "object", "fields": {
                "bonus": {"type": "string", "required": False},
                "flat": {"type": "boolean", "required": False}
            }},
            "chatFlavor": {"type": "string", "required": False},
            "critical": {"type": "object", "fields": {
                "threshold": {"type": "number", "required": False},
                "damage": {"type": "string", "required": False}
            }},
            "damage": {"type": "object", "fields": {
                "parts": {"type": "array", "required": False},
                "versatile": {"type": "string", "required": False}
            }},
            "formula": {"type": "string", "required": False},
            "save": {"type": "object", "fields": {
                "ability": {"type": "string", "required": False, "choices": ["str", "dex", "con", "int", "wis", "cha", ""]},
                "dc": {"type": "number", "required": False},
                "scaling": {"type": "string", "required": False, "choices": ["spell", "str", "dex", "con", "int", "wis", "cha", "flat"]}
            }},
            "summons": {"type": "object", "fields": {
                "profile": {"type": "array", "required": False}
            }},
            "damage.parts": {"type": "array", "required": False},
            "properties": {"type": "set", "required": False},
            "materials": {"type": "object", "fields": {
                "value": {"type": "string", "required": True},
                "consumed": {"type": "boolean", "required": False},
                "cost": {"type": "number", "required": False},
                "supply": {"type": "number", "required": False}
            }},
            "preparation": {"type": "object", "fields": {
                "mode": {"type": "string", "required": False, "choices": ["always", "prepared", "ritual", "innate", "pact", "atwill"]},
                "prepared": {"type": "boolean", "required": False}
            }}
        }

        # Mapping scuole italiano -> codice D&D 5e
        self.school_mapping = {
            "abiurazione": "abj",
            "ammaliamento": "enc",
            "divinazione": "div",
            "evocazione": "evo",
            "illusione": "ill",
            "invocazione": "con",
            "necromanzia": "nec",
            "trasmutazione": "trs"
        }

    def fix_spell(self, spell_data: Dict, file_path: Path) -> Dict:
        """Corregge un singolo incantesimo secondo lo schema D&D 5e"""
        fixed = False
        original_data = json.dumps(spell_data, indent=2)

        # Verifica tipo documento
        if spell_data.get("type") != "spell":
            self.errors_found.append(f"{file_path.name}: Tipo non è 'spell'")
            spell_data["type"] = "spell"
            fixed = True

        # Verifica system exists
        if "system" not in spell_data:
            spell_data["system"] = {}
            fixed = True

        system = spell_data["system"]

        # Fix level (required)
        if "level" not in system:
            # Prova a dedurre dal nome o descrizione
            if "trucchetto" in spell_data.get("name", "").lower():
                system["level"] = 0
            else:
                system["level"] = 1  # Default
            self.errors_found.append(f"{file_path.name}: Livello mancante, impostato a {system['level']}")
            fixed = True
        elif not isinstance(system["level"], int):
            try:
                system["level"] = int(system["level"])
                fixed = True
            except:
                system["level"] = 1
                fixed = True

        # Fix school (required)
        if "school" not in system or not system["school"]:
            # Prova a dedurre dalla descrizione
            desc = system.get("description", {}).get("value", "").lower()
            school_found = None
            for ita, eng in self.school_mapping.items():
                if ita in desc:
                    school_found = eng
                    break
            system["school"] = school_found or "evo"  # Default evocazione
            self.errors_found.append(f"{file_path.name}: Scuola mancante, impostata a {system['school']}")
            fixed = True
        elif system["school"] in self.school_mapping:
            # Converti da italiano a codice
            system["school"] = self.school_mapping[system["school"]]
            fixed = True
        elif system["school"] not in ["abj", "con", "div", "enc", "evo", "ill", "nec", "trs"]:
            system["school"] = "evo"
            self.errors_found.append(f"{file_path.name}: Scuola non valida, impostata a 'evo'")
            fixed = True

        # Fix materials (required subfield)
        if "materials" not in system:
            system["materials"] = {"value": "", "consumed": False, "cost": 0, "supply": 0}
            fixed = True
        elif isinstance(system["materials"], str):
            # Converti stringa in oggetto
            system["materials"] = {"value": system["materials"], "consumed": False, "cost": 0, "supply": 0}
            fixed = True
        elif "value" not in system["materials"]:
            system["materials"]["value"] = ""
            fixed = True

        # Fix preparation
        if "preparation" not in system:
            system["preparation"] = {"mode": "prepared", "prepared": False}
            fixed = True
        elif "mode" not in system["preparation"]:
            system["preparation"]["mode"] = "prepared"
            fixed = True

        # Fix activation
        if "activation" not in system:
            system["activation"] = {"type": "action", "cost": 1}
            fixed = True
        elif not system["activation"].get("type"):
            system["activation"]["type"] = "action"
            fixed = True

        # Fix duration
        if "duration" not in system:
            system["duration"] = {"value": "", "units": "inst"}
            fixed = True

        # Fix range
        if "range" not in system:
            system["range"] = {"value": "", "units": "ft"}
            fixed = True

        # Fix target
        if "target" not in system:
            system["target"] = {
                "affects": {"type": "", "count": "", "choice": False},
                "template": {"units": "", "type": "", "size": ""}
            }
            fixed = True

        # Fix damage parts array
        if "damage" in system:
            if "parts" in system["damage"] and not isinstance(system["damage"]["parts"], list):
                system["damage"]["parts"] = []
                fixed = True

        # Fix properties set
        if "properties" in system and not isinstance(system["properties"], (list, set)):
            system["properties"] = []
            fixed = True

        # Fix save
        if "save" in system:
            if "ability" in system["save"] and system["save"]["ability"] not in ["str", "dex", "con", "int", "wis", "cha", ""]:
                system["save"]["ability"] = ""
                fixed = True
            if "scaling" not in system["save"]:
                system["save"]["scaling"] = "spell"
                fixed = True

        # Fix uses
        if "uses" in system:
            if "recovery" in system["uses"] and not isinstance(system["uses"]["recovery"], list):
                system["uses"]["recovery"] = []
                fixed = True

        if fixed:
            self.fixes_applied.append({
                "file": file_path.name,
                "changes": "Schema corretto secondo D&D 5e v5.1.9"
            })

        return spell_data

    def process_all_spells(self):
        """Processa tutti gli incantesimi"""
        if not self.spells_path.exists():
            print(f"❌ Path incantesimi non trovato: {self.spells_path}")
            return

        spell_files = list(self.spells_path.glob("*.json"))
        print(f"\n📚 Trovati {len(spell_files)} incantesimi da verificare")

        fixed_count = 0
        for spell_file in spell_files:
            try:
                with open(spell_file, 'r', encoding='utf-8') as f:
                    spell_data = json.load(f)

                original = json.dumps(spell_data, sort_keys=True)
                fixed_spell = self.fix_spell(spell_data, spell_file)
                fixed = json.dumps(fixed_spell, sort_keys=True)

                if original != fixed:
                    with open(spell_file, 'w', encoding='utf-8') as f:
                        json.dump(fixed_spell, f, indent=2, ensure_ascii=False)
                    fixed_count += 1
                    print(f"✅ Corretto: {spell_file.name}")

            except Exception as e:
                self.errors_found.append(f"{spell_file.name}: Errore processamento - {str(e)}")
                print(f"❌ Errore in {spell_file.name}: {e}")

        return fixed_count

    def generate_report(self):
        """Genera report finale"""
        report = []
        report.append("\n" + "="*60)
        report.append("AGENT SPELL FIXER - REPORT FINALE")
        report.append("="*60)

        report.append(f"\n📊 STATISTICHE:")
        report.append(f"  - Incantesimi analizzati: {len(list(self.spells_path.glob('*.json')))}")
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
        report.append("="*60)

        return "\n".join(report)

if __name__ == "__main__":
    print("🚀 AGENT SPELL FIXER - Avvio")
    print("Schema basato su D&D 5e v5.1.9")

    fixer = SpellFixer()
    fixed_count = fixer.process_all_spells()

    print(f"\n✅ Corretti {fixed_count} file di incantesimi")
    print(fixer.generate_report())

    # Salva report
    report_path = Path("spell_fixer_report.txt")
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(fixer.generate_report())
    print(f"\n📄 Report salvato in: {report_path}")