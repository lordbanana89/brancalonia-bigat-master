#!/usr/bin/env python3
"""
Class Builder Agent for Brancalonia D&D 5e v5.1.9 Compatibility
==============================================================

This agent performs complete reconstruction of D&D 5e class structures
with proper advancement chains, feature grants, and system compatibility.

CRITICAL CLASS BUILDING FUNCTIONS:
- Rebuild advancement chains with correct D&D 5e v5.1.9 structure
- Ensure proper ItemGrant configurations
- Fix AbilityScoreImprovement entries
- Validate spell progression for caster classes
- Implement proper subclass integration
- Fix hit die and proficiency structures
"""

import json
import os
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class ClassFeature:
    name: str
    level: int
    feature_type: str
    uuid: Optional[str] = None
    description: str = ""
    is_choice: bool = False
    choices: List[str] = None

@dataclass
class ClassDefinition:
    name: str
    identifier: str
    hit_die: str
    primary_abilities: List[str]
    saves: List[str]
    skill_choices: int
    skill_options: List[str]
    spell_progression: str = "none"
    spell_ability: str = ""
    starting_equipment: List[Dict] = None

class ClassBuilderAgent:
    """
    Intelligent agent for building complete D&D 5e class structures
    """

    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.setup_logging()

        # D&D 5e v5.1.9 class standards
        self.standard_class_definitions = self.load_standard_classes()
        self.advancement_templates = self.load_advancement_templates()

        # Feature registry for linking
        self.feature_registry: Dict[str, Dict[str, Any]] = {}
        self.class_fixes: List[Dict[str, Any]] = []

    def setup_logging(self):
        """Setup detailed logging for class building process"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - Class Builder - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.project_root / 'logs' / 'class_builder.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        (self.project_root / 'logs').mkdir(exist_ok=True)

    def load_standard_classes(self) -> Dict[str, ClassDefinition]:
        """Load standard D&D 5e class definitions"""
        return {
            "barbarian": ClassDefinition(
                name="Barbaro",
                identifier="barbarian",
                hit_die="d12",
                primary_abilities=["str"],
                saves=["str", "con"],
                skill_choices=2,
                skill_options=["ani", "ath", "itm", "nat", "prc", "sur"],
                spell_progression="none"
            ),
            "bard": ClassDefinition(
                name="Bardo",
                identifier="bard",
                hit_die="d8",
                primary_abilities=["cha"],
                saves=["dex", "cha"],
                skill_choices=3,
                skill_options=["any"],
                spell_progression="full",
                spell_ability="cha"
            ),
            "cleric": ClassDefinition(
                name="Chierico",
                identifier="cleric",
                hit_die="d8",
                primary_abilities=["wis"],
                saves=["wis", "cha"],
                skill_choices=2,
                skill_options=["his", "ins", "med", "per", "rel"],
                spell_progression="full",
                spell_ability="wis"
            ),
            "druid": ClassDefinition(
                name="Druido",
                identifier="druid",
                hit_die="d8",
                primary_abilities=["wis"],
                saves=["int", "wis"],
                skill_choices=2,
                skill_options=["arc", "ani", "ins", "med", "nat", "prc", "rel", "sur"],
                spell_progression="full",
                spell_ability="wis"
            ),
            "fighter": ClassDefinition(
                name="Guerriero",
                identifier="fighter",
                hit_die="d10",
                primary_abilities=["str", "dex"],
                saves=["str", "con"],
                skill_choices=2,
                skill_options=["acr", "ani", "ath", "his", "ins", "itm", "prc", "sur"],
                spell_progression="none"
            ),
            "monk": ClassDefinition(
                name="Monaco",
                identifier="monk",
                hit_die="d8",
                primary_abilities=["dex", "wis"],
                saves=["str", "dex"],
                skill_choices=2,
                skill_options=["acr", "ath", "his", "ins", "rel", "ste"],
                spell_progression="none"
            ),
            "paladin": ClassDefinition(
                name="Paladino",
                identifier="paladin",
                hit_die="d10",
                primary_abilities=["str", "cha"],
                saves=["wis", "cha"],
                skill_choices=2,
                skill_options=["ath", "ins", "itm", "med", "per", "rel"],
                spell_progression="half",
                spell_ability="cha"
            ),
            "ranger": ClassDefinition(
                name="Ranger",
                identifier="ranger",
                hit_die="d10",
                primary_abilities=["dex", "wis"],
                saves=["str", "dex"],
                skill_choices=3,
                skill_options=["ani", "ath", "ins", "inv", "nat", "prc", "ste", "sur"],
                spell_progression="half",
                spell_ability="wis"
            ),
            "rogue": ClassDefinition(
                name="Ladro",
                identifier="rogue",
                hit_die="d8",
                primary_abilities=["dex"],
                saves=["dex", "int"],
                skill_choices=4,
                skill_options=["acr", "ath", "dec", "ins", "itm", "inv", "prc", "per", "slt", "ste"],
                spell_progression="none"
            ),
            "sorcerer": ClassDefinition(
                name="Stregone",
                identifier="sorcerer",
                hit_die="d6",
                primary_abilities=["cha"],
                saves=["con", "cha"],
                skill_choices=2,
                skill_options=["arc", "dec", "ins", "itm", "per", "rel"],
                spell_progression="full",
                spell_ability="cha"
            ),
            "warlock": ClassDefinition(
                name="Warlock",
                identifier="warlock",
                hit_die="d8",
                primary_abilities=["cha"],
                saves=["wis", "cha"],
                skill_choices=2,
                skill_options=["arc", "dec", "his", "itm", "inv", "nat", "rel"],
                spell_progression="pact",
                spell_ability="cha"
            ),
            "wizard": ClassDefinition(
                name="Mago",
                identifier="wizard",
                hit_die="d6",
                primary_abilities=["int"],
                saves=["int", "wis"],
                skill_choices=2,
                skill_options=["arc", "his", "ins", "inv", "med", "rel"],
                spell_progression="full",
                spell_ability="int"
            )
        }

    def load_advancement_templates(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load standard advancement templates for D&D 5e classes"""
        return {
            "asi_levels": [4, 8, 12, 16, 19],  # Standard ASI levels
            "subclass_levels": {
                "most": [3, 6, 10, 14],  # Most classes
                "cleric": [1, 2, 6, 8, 17],  # Cleric domain
                "warlock": [1, 6, 10, 14],  # Warlock patron
                "sorcerer": [1, 6, 14, 18]  # Sorcerer origin
            }
        }

    def rebuild_all_classes(self) -> Dict[str, Any]:
        """
        Rebuild all class structures in the project

        Returns:
            Summary of class building operations
        """
        self.logger.info("Starting comprehensive class rebuilding for D&D 5e v5.1.9")

        # Phase 1: Index available features
        self.logger.info("Phase 1: Indexing class features...")
        self.index_class_features()

        # Phase 2: Rebuild each class
        self.logger.info("Phase 2: Rebuilding class structures...")
        rebuilt_classes = self.rebuild_class_structures()

        # Phase 3: Validate class consistency
        self.logger.info("Phase 3: Validating class consistency...")
        validation_results = self.validate_class_consistency(rebuilt_classes)

        # Phase 4: Fix subclass integration
        self.logger.info("Phase 4: Fixing subclass integration...")
        subclass_fixes = self.fix_subclass_integration()

        summary = {
            "features_indexed": len(self.feature_registry),
            "classes_rebuilt": len(rebuilt_classes),
            "classes_validated": len(validation_results),
            "subclass_fixes": len(subclass_fixes),
            "total_fixes_applied": len(self.class_fixes)
        }

        self.generate_class_building_report(summary)
        return summary

    def index_class_features(self):
        """Index all available class features for reference"""
        features_pack = self.project_root / "packs" / "brancalonia-features" / "_source"

        if not features_pack.exists():
            self.logger.warning("No brancalonia-features pack found")
            return

        for json_file in features_pack.glob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                feature_id = data.get("_id")
                feature_name = data.get("name", "")

                if feature_id and feature_name:
                    self.feature_registry[feature_id] = {
                        "name": feature_name,
                        "file_path": str(json_file),
                        "data": data
                    }

                    # Also index by name patterns
                    name_key = feature_name.lower().replace(" ", "_")
                    self.feature_registry[name_key] = self.feature_registry[feature_id]

            except Exception as e:
                self.logger.error(f"Error indexing feature {json_file}: {e}")

        self.logger.info(f"Indexed {len(self.feature_registry)} class features")

    def rebuild_class_structures(self) -> List[str]:
        """Rebuild all class structures"""
        rebuilt_classes = []
        classes_pack = self.project_root / "packs" / "classi" / "_source"

        if not classes_pack.exists():
            self.logger.error("No classi pack found")
            return rebuilt_classes

        for json_file in classes_pack.glob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                class_name = data.get("name", "")
                class_identifier = data.get("system", {}).get("identifier", "")

                self.logger.info(f"Rebuilding class: {class_name}")

                if self.rebuild_single_class(data, str(json_file)):
                    rebuilt_classes.append(class_name)

                    # Save rebuilt class
                    with open(json_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)

            except Exception as e:
                self.logger.error(f"Error rebuilding class {json_file}: {e}")

        return rebuilt_classes

    def rebuild_single_class(self, data: Dict[str, Any], file_path: str) -> bool:
        """Rebuild a single class structure"""
        fixes_applied = False
        system = data.get("system", {})
        class_name = data.get("name", "")
        class_identifier = system.get("identifier", "")

        # Get standard definition if available
        standard_def = None
        for std_id, std_def in self.standard_class_definitions.items():
            if (std_id == class_identifier or
                std_def.name.lower() == class_name.lower() or
                class_name.lower() in std_def.name.lower()):
                standard_def = std_def
                break

        # Fix basic class structure
        if self.fix_basic_class_structure(data, standard_def):
            fixes_applied = True

        # Rebuild advancement
        if self.rebuild_class_advancement(data, standard_def):
            fixes_applied = True

        # Fix spellcasting structure
        if self.fix_spellcasting_structure(data, standard_def):
            fixes_applied = True

        if fixes_applied:
            self.class_fixes.append({
                "class_name": class_name,
                "file_path": file_path,
                "identifier": class_identifier
            })

        return fixes_applied

    def fix_basic_class_structure(self, data: Dict[str, Any], standard_def: Optional[ClassDefinition]) -> bool:
        """Fix basic class structure fields"""
        fixes_applied = False
        system = data.get("system", {})

        if standard_def:
            # Fix hit die
            if system.get("hd", {}).get("denomination") != standard_def.hit_die:
                system.setdefault("hd", {})["denomination"] = standard_def.hit_die
                fixes_applied = True

            # Fix saves
            if system.get("saves") != standard_def.saves:
                system["saves"] = standard_def.saves
                fixes_applied = True

            # Fix primary abilities
            if system.get("primaryAbility") != standard_def.primary_abilities:
                system["primaryAbility"] = standard_def.primary_abilities
                fixes_applied = True

            # Fix skill structure
            skills = system.get("skills", {})
            if skills.get("number") != standard_def.skill_choices:
                skills["number"] = standard_def.skill_choices
                fixes_applied = True

            if skills.get("choices") != standard_def.skill_options:
                skills["choices"] = standard_def.skill_options
                fixes_applied = True

        # Ensure required fields exist
        required_fields = {
            "levels": 20,
            "hitDiceUsed": 0,
            "advancement": [],
            "startingEquipment": []
        }

        for field, default_value in required_fields.items():
            if field not in system:
                system[field] = default_value
                fixes_applied = True

        return fixes_applied

    def rebuild_class_advancement(self, data: Dict[str, Any], standard_def: Optional[ClassDefinition]) -> bool:
        """Rebuild complete advancement structure"""
        fixes_applied = False
        system = data.get("system", {})
        advancement = system.get("advancement", [])

        # Build new advancement structure
        new_advancement = []

        # Add hit points advancement
        hp_advancement = self.create_hit_points_advancement()
        new_advancement.append(hp_advancement)

        # Add level 1 features
        level_1_features = self.get_level_1_features(data, standard_def)
        new_advancement.extend(level_1_features)

        # Add ASI advancements
        asi_advancements = self.create_asi_advancements()
        new_advancement.extend(asi_advancements)

        # Add class-specific features
        class_features = self.create_class_feature_advancements(data, standard_def)
        new_advancement.extend(class_features)

        # Sort by level
        new_advancement.sort(key=lambda x: x.get("level", 0))

        # Update if different
        if new_advancement != advancement:
            system["advancement"] = new_advancement
            fixes_applied = True

        return fixes_applied

    def create_hit_points_advancement(self) -> Dict[str, Any]:
        """Create hit points advancement entry"""
        return {
            "_id": "hp-advancement",
            "type": "HitPoints",
            "configuration": {},
            "value": {},
            "title": "Punti Ferita"
        }

    def get_level_1_features(self, data: Dict[str, Any], standard_def: Optional[ClassDefinition]) -> List[Dict[str, Any]]:
        """Get level 1 features for class"""
        features = []
        class_name = data.get("name", "").lower()

        # Look for existing level 1 features in advancement
        existing_advancement = data.get("system", {}).get("advancement", [])
        for adv in existing_advancement:
            if adv.get("level") == 1 and adv.get("type") == "ItemGrant":
                features.append(adv)

        # If no level 1 features found, create default ones
        if not features and standard_def:
            # Add class-specific level 1 features
            if standard_def.identifier == "barbarian":
                features.append(self.create_feature_grant(
                    "rage", "Ira", 1, "class-barbaro-livello_1-ira"
                ))
                features.append(self.create_feature_grant(
                    "unarmored-defense", "Difesa Senza Armatura", 1, "class-barbaro-livello_1-difesa-senza-armatura"
                ))

        return features

    def create_feature_grant(self, feature_id: str, title: str, level: int, uuid_suffix: str) -> Dict[str, Any]:
        """Create feature grant advancement"""
        return {
            "_id": f"feature-{feature_id}-{level}",
            "type": "ItemGrant",
            "configuration": {
                "items": [
                    {
                        "uuid": f"Compendium.brancalonia-bigat.brancalonia-features.Item.{uuid_suffix}",
                        "optional": False
                    }
                ],
                "optional": False
            },
            "value": {},
            "level": level,
            "title": title,
            "icon": "icons/svg/upgrade.svg"
        }

    def create_asi_advancements(self) -> List[Dict[str, Any]]:
        """Create ability score improvement advancements"""
        asi_levels = self.advancement_templates["asi_levels"]
        advancements = []

        for level in asi_levels:
            advancements.append({
                "_id": f"asi-{level}",
                "type": "AbilityScoreImprovement",
                "configuration": {
                    "points": 2,
                    "fixed": {}
                },
                "value": {
                    "type": "asi"
                },
                "level": level,
                "title": "Aumento Caratteristica"
            })

        return advancements

    def create_class_feature_advancements(self, data: Dict[str, Any], standard_def: Optional[ClassDefinition]) -> List[Dict[str, Any]]:
        """Create class-specific feature advancements"""
        advancements = []
        class_name = data.get("name", "").lower()

        # Use existing advancement as template, but fix structure
        existing_advancement = data.get("system", {}).get("advancement", [])

        for adv in existing_advancement:
            if adv.get("type") == "ItemGrant" and adv.get("level", 1) > 1:
                # Validate and fix the advancement
                fixed_adv = self.fix_advancement_structure(adv)
                if fixed_adv:
                    advancements.append(fixed_adv)

        return advancements

    def fix_advancement_structure(self, advancement: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Fix advancement structure to match D&D 5e v5.1.9 format"""
        # Ensure required fields
        if not advancement.get("_id"):
            advancement["_id"] = f"adv-{advancement.get('level', 1)}-{len(advancement.get('configuration', {}).get('items', []))}"

        if advancement.get("type") == "ItemGrant":
            configuration = advancement.get("configuration", {})
            items = configuration.get("items", [])

            # Validate each item grant
            valid_items = []
            for item in items:
                uuid = item.get("uuid", "")
                if uuid and self.is_valid_feature_uuid(uuid):
                    valid_items.append({
                        "uuid": uuid,
                        "optional": item.get("optional", False)
                    })

            if valid_items:
                configuration["items"] = valid_items
                configuration["optional"] = configuration.get("optional", False)
                return advancement

        return None

    def is_valid_feature_uuid(self, uuid: str) -> bool:
        """Check if feature UUID references a valid feature"""
        # For now, assume Brancalonia UUIDs are valid if they follow pattern
        return uuid.startswith("Compendium.brancalonia")

    def fix_spellcasting_structure(self, data: Dict[str, Any], standard_def: Optional[ClassDefinition]) -> bool:
        """Fix spellcasting structure for caster classes"""
        if not standard_def or standard_def.spell_progression == "none":
            return False

        fixes_applied = False
        system = data.get("system", {})
        spellcasting = system.get("spellcasting", {})

        # Fix progression
        if spellcasting.get("progression") != standard_def.spell_progression:
            spellcasting["progression"] = standard_def.spell_progression
            fixes_applied = True

        # Fix ability
        if spellcasting.get("ability") != standard_def.spell_ability:
            spellcasting["ability"] = standard_def.spell_ability
            fixes_applied = True

        # Add spellcasting advancement if needed
        if standard_def.spell_progression in ["full", "half", "pact"]:
            advancement = system.get("advancement", [])
            has_spellcasting_advancement = any(
                adv.get("type") == "Spellcasting" for adv in advancement
            )

            if not has_spellcasting_advancement:
                spell_level = 1 if standard_def.spell_progression == "full" else 2
                if standard_def.spell_progression == "pact":
                    spell_level = 1

                spellcasting_advancement = {
                    "_id": "spellcasting-advancement",
                    "type": "Spellcasting",
                    "configuration": {
                        "ability": standard_def.spell_ability,
                        "progression": standard_def.spell_progression
                    },
                    "value": {},
                    "level": spell_level,
                    "title": "Incantesimi"
                }

                advancement.append(spellcasting_advancement)
                fixes_applied = True

        return fixes_applied

    def validate_class_consistency(self, rebuilt_classes: List[str]) -> List[Dict[str, Any]]:
        """Validate consistency of rebuilt classes"""
        validation_results = []

        for class_name in rebuilt_classes:
            # Find class file
            classes_pack = self.project_root / "packs" / "classi" / "_source"

            for json_file in classes_pack.glob("*.json"):
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    if data.get("name") == class_name:
                        validation = self.validate_single_class(data)
                        validation_results.append({
                            "class_name": class_name,
                            "file_path": str(json_file),
                            "validation": validation
                        })
                        break

                except Exception as e:
                    self.logger.error(f"Error validating class {json_file}: {e}")

        return validation_results

    def validate_single_class(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate a single class structure"""
        validation = {
            "has_advancement": False,
            "has_asi_progression": False,
            "advancement_count": 0,
            "level_coverage": set(),
            "issues": []
        }

        system = data.get("system", {})
        advancement = system.get("advancement", [])

        validation["advancement_count"] = len(advancement)
        validation["has_advancement"] = len(advancement) > 0

        # Check ASI progression
        asi_count = sum(1 for adv in advancement if adv.get("type") == "AbilityScoreImprovement")
        validation["has_asi_progression"] = asi_count >= 5  # Standard 5 ASIs

        # Check level coverage
        for adv in advancement:
            level = adv.get("level")
            if level:
                validation["level_coverage"].add(level)

        # Convert set to list for JSON serialization
        validation["level_coverage"] = sorted(list(validation["level_coverage"]))

        # Check for common issues
        if not validation["has_advancement"]:
            validation["issues"].append("No advancement structure")

        if not validation["has_asi_progression"]:
            validation["issues"].append("Missing ASI progression")

        if len(validation["level_coverage"]) < 10:
            validation["issues"].append("Insufficient level coverage")

        return validation

    def fix_subclass_integration(self) -> List[Dict[str, Any]]:
        """Fix subclass integration with parent classes"""
        subclass_fixes = []
        subclass_pack = self.project_root / "packs" / "sottoclassi" / "_source"

        if not subclass_pack.exists():
            self.logger.warning("No sottoclassi pack found")
            return subclass_fixes

        for json_file in subclass_pack.glob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                subclass_name = data.get("name", "")

                if self.fix_single_subclass(data, str(json_file)):
                    subclass_fixes.append({
                        "subclass_name": subclass_name,
                        "file_path": str(json_file)
                    })

                    # Save fixed subclass
                    with open(json_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)

            except Exception as e:
                self.logger.error(f"Error fixing subclass {json_file}: {e}")

        return subclass_fixes

    def fix_single_subclass(self, data: Dict[str, Any], file_path: str) -> bool:
        """Fix a single subclass structure"""
        fixes_applied = False
        system = data.get("system", {})

        # Ensure subclass type
        if data.get("type") != "subclass":
            data["type"] = "subclass"
            fixes_applied = True

        # Fix classIdentifier
        class_identifier = system.get("classIdentifier")
        if not class_identifier:
            # Try to infer from subclass name
            subclass_name = data.get("name", "").lower()
            for std_id, std_def in self.standard_class_definitions.items():
                if std_def.name.lower() in subclass_name:
                    system["classIdentifier"] = std_id
                    fixes_applied = True
                    break

        # Ensure advancement structure
        if "advancement" not in system:
            system["advancement"] = []
            fixes_applied = True

        # Fix subclass levels
        advancement = system.get("advancement", [])
        if advancement:
            # Ensure proper subclass levels
            class_id = system.get("classIdentifier", "")
            expected_levels = self.advancement_templates["subclass_levels"].get(
                class_id, self.advancement_templates["subclass_levels"]["most"]
            )

            # Validate advancement levels
            for adv in advancement:
                level = adv.get("level")
                if level and level not in expected_levels:
                    self.logger.warning(f"Subclass {data.get('name')} has feature at unusual level: {level}")

        return fixes_applied

    def generate_class_building_report(self, summary: Dict[str, Any]):
        """Generate comprehensive class building report"""
        report_path = self.project_root / "reports" / "class_building_report.json"
        report_path.parent.mkdir(exist_ok=True)

        report = {
            "building_timestamp": "2025-09-27T00:00:00Z",
            "summary": summary,
            "standard_classes_available": list(self.standard_class_definitions.keys()),
            "class_fixes": self.class_fixes,
            "feature_registry_stats": {
                "total_features": len(self.feature_registry),
                "features_by_type": self.count_features_by_type()
            }
        }

        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        self.logger.info(f"Class building report saved to: {report_path}")

        # Generate human-readable summary
        self.generate_class_building_summary(summary, report_path.parent / "class_building_summary.md")

    def count_features_by_type(self) -> Dict[str, int]:
        """Count features by type"""
        type_counts = defaultdict(int)

        for feature_data in self.feature_registry.values():
            if isinstance(feature_data, dict) and "data" in feature_data:
                feature_type = feature_data["data"].get("type", "unknown")
                type_counts[feature_type] += 1

        return dict(type_counts)

    def generate_class_building_summary(self, summary: Dict[str, Any], summary_path: Path):
        """Generate human-readable class building summary"""
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("# Brancalonia Class Building Report\n\n")
            f.write("## Summary\n\n")
            f.write(f"- **Features Indexed:** {summary['features_indexed']}\n")
            f.write(f"- **Classes Rebuilt:** {summary['classes_rebuilt']}\n")
            f.write(f"- **Classes Validated:** {summary['classes_validated']}\n")
            f.write(f"- **Subclass Fixes:** {summary['subclass_fixes']}\n")
            f.write(f"- **Total Fixes Applied:** {summary['total_fixes_applied']}\n\n")

            f.write("## Rebuilt Classes\n\n")
            for fix in self.class_fixes:
                f.write(f"### {fix['class_name']}\n")
                f.write(f"- **Identifier:** {fix.get('identifier', 'N/A')}\n")
                f.write(f"- **File:** `{fix['file_path']}`\n\n")

            f.write("## Next Steps\n\n")
            f.write("1. 🎲 Run RollTable Fixer Agent to fix table structures\n")
            f.write("2. 🔮 Run Spell System Agent to integrate spells\n")
            f.write("3. ✅ Run Test Runner Agent to validate all fixes\n")
            f.write("4. 🎨 Run UI Validator Agent to check Foundry rendering\n")

        self.logger.info(f"Class building summary saved to: {summary_path}")

if __name__ == "__main__":
    import sys

    project_root = sys.argv[1] if len(sys.argv) > 1 else "/Users/erik/Desktop/brancalonia-bigat-master"

    agent = ClassBuilderAgent(project_root)
    results = agent.rebuild_all_classes()

    print(f"\n🏗️ Class Building Complete!")
    print(f"📊 Rebuilt {results['classes_rebuilt']} classes")
    print(f"🔧 Applied {results['total_fixes_applied']} fixes")
    print(f"📁 Reports saved to: {agent.project_root}/reports/")