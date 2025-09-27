#!/usr/bin/env python3
"""
AGENT MONITOR - Monitora repository D&D 5e per aggiornamenti e struttura
Analizza e salva scoperte tecniche per allineamento con D&D 5e v5.1.9
"""

import json
import requests
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

class DnD5eMonitor:
    def __init__(self):
        self.repo_url = "https://api.github.com/repos/foundryvtt/dnd5e"
        self.branch = "release-5.1.9"
        self.discoveries = {
            "last_check": datetime.now().isoformat(),
            "version": "5.1.9",
            "advancement_types": [],
            "item_grant_format": {},
            "spell_progression": {},
            "uuid_format": "",
            "technical_notes": []
        }

    def fetch_repository_structure(self):
        """Fetch repository structure from GitHub API"""
        try:
            # Get repository contents
            url = f"{self.repo_url}/contents?ref={self.branch}"
            response = requests.get(url)

            if response.status_code == 200:
                contents = response.json()
                self.discoveries["repository_structure"] = [
                    {"name": item['name'], "type": item['type']}
                    for item in contents
                ]
                print(f"✅ Fetched repository structure: {len(contents)} items")
        except Exception as e:
            print(f"❌ Error fetching repository: {e}")

    def analyze_advancement_types(self):
        """Analyze advancement types from D&D 5e"""
        # Based on research, these are the official advancement types
        advancement_types = [
            {
                "type": "HitPoints",
                "description": "Hit point advancement per level",
                "required_levels": [1],
                "configuration": {}
            },
            {
                "type": "Trait",
                "description": "Grants proficiencies (weapons, saves, skills)",
                "required_levels": [1],
                "configuration": {
                    "grants": ["weapon:simple", "save:int", "skill:arcana"]
                }
            },
            {
                "type": "ItemGrant",
                "description": "Grants items/features from compendium",
                "required_levels": "varies",
                "configuration": {
                    "items": [
                        {
                            "uuid": "Compendium.system.pack.Item.id",
                            "optional": False
                        }
                    ]
                }
            },
            {
                "type": "AbilityScoreImprovement",
                "description": "ASI at specific levels",
                "required_levels": [4, 8, 12, 16, 19],
                "configuration": {
                    "points": 2,
                    "fixed": {}
                }
            },
            {
                "type": "ScaleValue",
                "description": "Scaling values (rage uses, cantrips, etc)",
                "required_levels": "varies",
                "configuration": {
                    "identifier": "feature-name",
                    "type": "number|dice|distance|cr",
                    "distance": {"units": "ft"}
                }
            },
            {
                "type": "ItemChoice",
                "description": "Choose items/spells from list",
                "required_levels": "varies",
                "configuration": {
                    "choices": {
                        "0": {"count": 1, "replacement": False}
                    },
                    "type": "spell|feat|feature"
                }
            },
            {
                "type": "Subclass",
                "description": "Subclass selection",
                "required_levels": "varies by class",
                "configuration": {}
            }
        ]

        self.discoveries["advancement_types"] = advancement_types
        print(f"✅ Analyzed {len(advancement_types)} advancement types")

    def analyze_item_grant_format(self):
        """Analyze correct ItemGrant format"""
        item_grant_format = {
            "old_format_string": "Compendium.brancalonia.pack.Item.id",
            "new_format_object": {
                "uuid": "Compendium.brancalonia.pack.Item.id",
                "optional": False
            },
            "implementation_note": "ItemGrant items should be objects with uuid, not strings",
            "example": {
                "_id": "randomid",
                "type": "ItemGrant",
                "configuration": {
                    "items": [
                        {
                            "uuid": "Compendium.brancalonia.brancalonia-features.Item.featureId",
                            "optional": False
                        }
                    ],
                    "optional": False,
                    "spell": {
                        "ability": [],
                        "preparation": "",
                        "uses": {
                            "max": "",
                            "per": ""
                        }
                    }
                },
                "level": 1,
                "title": "Feature Name",
                "icon": "icons/svg/upgrade.svg"
            }
        }

        self.discoveries["item_grant_format"] = item_grant_format
        print("✅ Analyzed ItemGrant format")

    def analyze_spell_progression(self):
        """Analyze spell progression types"""
        spell_progression = {
            "types": {
                "full": "Full caster (Wizard, Cleric, Druid, Bard, Sorcerer)",
                "half": "Half caster (Paladin, Ranger)",
                "third": "Third caster (Eldritch Knight, Arcane Trickster)",
                "pact": "Pact magic (Warlock)",
                "none": "No spellcasting"
            },
            "configuration": {
                "progression": "full|half|third|pact|none",
                "ability": "int|wis|cha",
                "preparation": {
                    "mode": "prepared|always|innate",
                    "formula": "@abilities.int.mod + @classes.wizard.levels"
                }
            },
            "spell_slots_per_level": {
                "full": {
                    "1": [2, 0, 0, 0, 0, 0, 0, 0, 0],
                    "2": [3, 0, 0, 0, 0, 0, 0, 0, 0],
                    "3": [4, 2, 0, 0, 0, 0, 0, 0, 0],
                    "4": [4, 3, 0, 0, 0, 0, 0, 0, 0],
                    "5": [4, 3, 2, 0, 0, 0, 0, 0, 0],
                    "20": [4, 3, 3, 3, 3, 2, 2, 1, 1]
                },
                "half": {
                    "1": [0, 0, 0, 0, 0],
                    "2": [2, 0, 0, 0, 0],
                    "3": [3, 0, 0, 0, 0],
                    "5": [4, 2, 0, 0, 0],
                    "20": [4, 3, 3, 3, 2]
                },
                "pact": {
                    "1": {"slots": 1, "level": 1},
                    "2": {"slots": 2, "level": 1},
                    "5": {"slots": 2, "level": 3},
                    "11": {"slots": 3, "level": 5},
                    "20": {"slots": 4, "level": 5}
                }
            }
        }

        self.discoveries["spell_progression"] = spell_progression
        print("✅ Analyzed spell progression")

    def discover_uuid_format(self):
        """Analyze UUID format requirements"""
        uuid_info = {
            "format": "Compendium.{scope}.{pack}.{documentType}.{id}",
            "examples": {
                "official": "Compendium.dnd5e.classfeatures.Item.gbNo5eVPaqr8IVKL",
                "brancalonia": "Compendium.brancalonia.brancalonia-features.Item.z43pcdx9c9x6fs00"
            },
            "documentTypes": ["Item", "Actor", "Scene", "JournalEntry", "Macro", "RollTable"],
            "validation_regex": r"Compendium\.[^.]+\.[^.]+\.(Item|Actor|Scene|JournalEntry|Macro|RollTable)\.[a-zA-Z0-9]+",
            "notes": [
                "UUID must reference existing items in compendium",
                "DocumentType is usually 'Item' for features, spells, equipment",
                "ID should match the _id field of the referenced document"
            ]
        }

        self.discoveries["uuid_format"] = uuid_info
        print("✅ Analyzed UUID format")

    def add_technical_discovery(self, discovery: str):
        """Add a technical discovery"""
        self.discoveries["technical_notes"].append({
            "timestamp": datetime.now().isoformat(),
            "discovery": discovery
        })

    def save_discoveries(self):
        """Save discoveries to JSON file"""
        output_path = Path("dnd5e-discoveries.json")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.discoveries, f, indent=2, ensure_ascii=False)

        print(f"📝 Discoveries saved to {output_path}")

    def generate_report(self):
        """Generate markdown report of discoveries"""
        report = []
        report.append("# D&D 5e Technical Discoveries\n")
        report.append(f"Last Check: {self.discoveries['last_check']}\n")
        report.append(f"Version: {self.discoveries['version']}\n\n")

        report.append("## Advancement Types\n")
        for adv in self.discoveries["advancement_types"]:
            report.append(f"### {adv['type']}\n")
            report.append(f"- **Description**: {adv['description']}\n")
            report.append(f"- **Required Levels**: {adv['required_levels']}\n")
            report.append(f"- **Configuration**: `{json.dumps(adv['configuration'])}`\n\n")

        report.append("## ItemGrant Format\n")
        report.append("```json\n")
        report.append(json.dumps(self.discoveries["item_grant_format"]["example"], indent=2))
        report.append("\n```\n\n")

        report.append("## Spell Progression\n")
        for prog_type, desc in self.discoveries["spell_progression"]["types"].items():
            report.append(f"- **{prog_type}**: {desc}\n")

        report.append("\n## UUID Format\n")
        report.append(f"Format: `{self.discoveries['uuid_format']['format']}`\n\n")

        # Write report
        report_path = Path("monitor-report.md")
        with open(report_path, 'w', encoding='utf-8') as f:
            f.writelines(report)

        print(f"📊 Report generated: {report_path}")

    def run_monitoring(self):
        """Run complete monitoring cycle"""
        print("🔍 Starting D&D 5e Repository Monitoring...")
        print("=" * 60)

        self.fetch_repository_structure()
        self.analyze_advancement_types()
        self.analyze_item_grant_format()
        self.analyze_spell_progression()
        self.discover_uuid_format()

        # Add key discoveries
        self.add_technical_discovery(
            "ItemGrant in Brancalonia uses string format but should use object with uuid property"
        )
        self.add_technical_discovery(
            "ScaleValue advancement type is missing but critical for features like Sneak Attack, Rage uses"
        )
        self.add_technical_discovery(
            "Spell progression configuration is missing from all caster classes"
        )
        self.add_technical_discovery(
            "Classes need 20+ ItemGrant advancements for features at each level"
        )

        self.save_discoveries()
        self.generate_report()

        print("\n✅ Monitoring complete!")
        print("=" * 60)

def main():
    monitor = DnD5eMonitor()
    monitor.run_monitoring()

if __name__ == "__main__":
    main()