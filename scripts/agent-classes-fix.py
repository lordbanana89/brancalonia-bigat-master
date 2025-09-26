#!/usr/bin/env python3
"""
Specialized agent to fix class advancement issues in Brancalonia.

This script:
- For each class, adds ItemGrant advancements for every feature at appropriate levels
- Maps features from database/classi/ directory to actual feature items
- Creates proper UUID references in format: Compendium.brancalonia.brancalonia-features.Item.{featureId}
- Adds spell progression for caster classes
"""

import json
import os
import sys
import re
from pathlib import Path
from typing import Dict, List, Any, Optional

class BrancaloniaClassFixer:
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.database_path = self.base_path / "database" / "classi"
        self.features_path = self.base_path / "packs" / "brancalonia-features" / "_source"
        self.classes_path = self.base_path / "packs" / "classi" / "_source"

        # Cache for loaded data
        self.features_cache = {}
        self.class_data_cache = {}

        # Map Italian class names to English identifiers
        self.class_name_map = {
            "pagano": "barbarian",
            "barbaro": "barbarian",
            "arlecchino": "bard",
            "bardo": "bard",
            "miracolaro": "cleric",
            "chierico": "cleric",
            "benandante": "druid",
            "druido": "druid",
            "spadaccino": "fighter",
            "guerriero": "fighter",
            "brigante": "rogue",
            "ladro": "rogue",
            "guiscardo": "wizard",
            "mago": "wizard",
            "frate": "monk",
            "monaco": "monk",
            "cavaliere": "paladin",
            "paladino": "paladin",
            "mattatore": "ranger",
            "ranger": "ranger",
            "scaramante": "sorcerer",
            "stregone": "sorcerer",
            "menagramo": "warlock",
            "warlock": "warlock"
        }

        # Classes that have spellcasting
        self.spellcaster_classes = {
            "bard": {"ability": "cha", "type": "full", "rituals": True},
            "cleric": {"ability": "wis", "type": "full", "rituals": True},
            "druid": {"ability": "wis", "type": "full", "rituals": True},
            "paladin": {"ability": "cha", "type": "half", "rituals": False},
            "ranger": {"ability": "wis", "type": "half", "rituals": False},
            "sorcerer": {"ability": "cha", "type": "full", "rituals": False},
            "warlock": {"ability": "cha", "type": "pact", "rituals": False},
            "wizard": {"ability": "int", "type": "full", "rituals": True}
        }

    def load_features(self) -> Dict[str, Any]:
        """Load all available features from the features directory."""
        if self.features_cache:
            return self.features_cache

        features = {}
        for feature_file in self.features_path.glob("*.json"):
            try:
                with open(feature_file, 'r', encoding='utf-8') as f:
                    feature_data = json.load(f)
                    feature_id = feature_data.get('_id') or feature_data.get('id')
                    if feature_id:
                        features[feature_id] = feature_data
                        # Also map by name for easier lookup
                        name = feature_data.get('name') or feature_data.get('nome')
                        if name:
                            features[name.lower()] = feature_data
            except Exception as e:
                print(f"Error loading feature {feature_file}: {e}")

        self.features_cache = features
        return features

    def load_class_progression(self, class_name: str) -> Optional[Dict[str, Any]]:
        """Load class progression data from database."""
        class_dir = None

        # Map class names to directory patterns (try base class names first)
        class_dir_patterns = {
            "barbaro": ["pagano_barbaro"],  # Only compound exists
            "bardo": ["bardo", "arlecchino_bardo"],
            "chierico": ["chierico", "miracolaro_chierico"],
            "druido": ["druido", "benandante_druido"],
            "guerriero": ["spadaccino_guerriero"],  # Only compound exists
            "ladro": ["brigante_ladro"],  # Only compound exists
            "mago": ["mago", "guiscardo_mago"],
            "monaco": ["monaco", "frate_monaco"],
            "paladino": ["paladino", "cavaliere_errante_paladino"],
            "ranger": ["ranger", "mattatore_ranger"],
            "stregone": ["stregone", "scaramante_stregone"],
            "warlock": ["warlock", "menagramo_warlock"]
        }

        patterns = class_dir_patterns.get(class_name.lower(), [class_name])

        # Find the class directory (try exact matches first, then substring matches)
        for pattern in patterns:
            # First try exact match
            for dir_path in self.database_path.iterdir():
                if dir_path.is_dir() and dir_path.name.lower() == pattern.lower():
                    class_dir = dir_path
                    # print(f"Found class dir for {class_name}: {class_dir.name} (exact match)")
                    break
            if class_dir:
                break

            # Then try substring match
            for dir_path in self.database_path.iterdir():
                if dir_path.is_dir() and pattern.lower() in dir_path.name.lower():
                    class_dir = dir_path
                    # print(f"Found class dir for {class_name}: {class_dir.name} (substring match)")
                    break
            if class_dir:
                break

        if not class_dir:
            available_dirs = [d.name for d in self.database_path.iterdir() if d.is_dir()]
            print(f"Class directory not found for {class_name} (tried: {patterns})")
            print(f"Available directories: {available_dirs}")
            return None

        # Load progression data
        progression_file = class_dir / "progressione" / "progressione.json"
        if not progression_file.exists():
            print(f"Progression file not found: {progression_file}")
            return None

        try:
            with open(progression_file, 'r', encoding='utf-8') as f:
                progression_data = json.load(f)
                return progression_data
        except Exception as e:
            print(f"Error loading progression for {class_name}: {e}")
            return None

    def find_feature_by_name(self, feature_name: str, features: Dict[str, Any]) -> Optional[str]:
        """Find a feature ID by its name."""
        if not isinstance(feature_name, str):
            return None

        # Direct lookup by name
        if feature_name.lower() in features:
            feature = features[feature_name.lower()]
            return feature.get('_id') or feature.get('id')

        # Try to find by partial name match
        for feature_id, feature_data in features.items():
            if isinstance(feature_data, dict):
                name = feature_data.get('name') or feature_data.get('nome')
                if name:
                    # Try exact match
                    if feature_name.lower() == name.lower():
                        return feature_data.get('_id') or feature_data.get('id')
                    # Try partial match
                    if feature_name.lower() in name.lower():
                        return feature_data.get('_id') or feature_data.get('id')
                    # Try clean name match for critico brutale
                    clean_feature_name = re.sub(r'\s*\([^)]*\)', '', feature_name.lower()).strip()
                    clean_name = re.sub(r'\s*\([^)]*\)', '', name.lower()).strip()
                    if clean_feature_name == clean_name or clean_feature_name in clean_name:
                        return feature_data.get('_id') or feature_data.get('id')

        # Try to map common Italian names to English and handle special cases
        italian_to_english = {
            "ira": "rage",
            "difesa senza armatura": "unarmored defense",
            "attacco irruento": "reckless attack",
            "percezione del pericolo": "danger sense",
            "cammino primordiale": "primal path",
            "attacco extra": "extra attack",
            "movimento veloce": "fast movement",
            "istinto ferino": "feral instinct",
            "critico brutale": "brutal critical",
            "critico brutale (1 dado)": "critico brutale",
            "critico brutale (2 dadi)": "critico brutale",
            "critico brutale (3 dadi)": "critico brutale",
            "ira implacabile": "relentless rage",
            "ira persistente": "persistent rage",
            "forza indomabile": "indomitable might",
            "campione primordiale": "primal champion"
        }

        # Clean feature name by removing parenthetical text for better matching
        clean_name = re.sub(r'\s*\([^)]*\)', '', feature_name.lower()).strip()
        if clean_name in italian_to_english:
            english_name = italian_to_english[clean_name]
            return self.find_feature_by_name(english_name, features)

        english_name = italian_to_english.get(feature_name.lower())
        if english_name:
            return self.find_feature_by_name(english_name, features)

        return None

    def create_item_grant_advancement(self, level: int, feature_id: str, feature_name: str) -> Dict[str, Any]:
        """Create an ItemGrant advancement for a feature."""
        advancement_id = f"ItemGrant.{level}.{feature_id}"

        return {
            "_id": advancement_id,
            "type": "ItemGrant",
            "configuration": {
                "items": [
                    {
                        "uuid": f"Compendium.brancalonia.brancalonia-features.Item.{feature_id}",
                        "optional": False
                    }
                ],
                "optional": False,
                "spell": None
            },
            "value": {},
            "level": level,
            "title": feature_name,
            "icon": "",
            "classRestriction": "primary"
        }

    def create_spellcasting_advancement(self, class_identifier: str) -> List[Dict[str, Any]]:
        """Create spellcasting advancement for caster classes."""
        if class_identifier not in self.spellcaster_classes:
            return []

        spell_config = self.spellcaster_classes[class_identifier]
        advancements = []

        # Add spellcasting advancement at level 1 (or appropriate level)
        spell_level = 1
        if class_identifier in ["paladin", "ranger"]:
            spell_level = 2  # Half-casters start at level 2

        advancement = {
            "_id": f"SpellcastingValue.{spell_level}",
            "type": "SpellcastingValue",
            "configuration": {
                "progression": spell_config["type"],
                "ability": spell_config["ability"],
                "spells": spell_config.get("spells", ""),
                "rituals": spell_config["rituals"]
            },
            "value": {},
            "level": spell_level,
            "title": "Incantesimi",
            "icon": "icons/svg/book.svg",
            "classRestriction": "primary"
        }
        advancements.append(advancement)

        return advancements

    def fix_class_advancement(self, class_name: str) -> Optional[Dict[str, Any]]:
        """Fix advancement for a specific class."""
        # Load class file
        class_file = self.classes_path / f"{class_name}.json"
        if not class_file.exists():
            print(f"Class file not found: {class_file}")
            return None

        try:
            with open(class_file, 'r', encoding='utf-8') as f:
                class_data = json.load(f)
        except Exception as e:
            print(f"Error loading class file {class_file}: {e}")
            return None

        # Load progression data
        progression_data = self.load_class_progression(class_name)
        if not progression_data:
            return None

        # Load features
        features = self.load_features()

        # Get class identifier
        class_identifier = self.class_name_map.get(class_name.lower(), class_name.lower())

        # Clear existing ItemGrant advancements (keep ASI and HitPoints)
        existing_advancement = class_data.get("system", {}).get("advancement", [])
        new_advancement = []

        for adv in existing_advancement:
            if adv.get("type") in ["AbilityScoreImprovement", "HitPoints"]:
                new_advancement.append(adv)

        # Add spellcasting if applicable
        spell_advancements = self.create_spellcasting_advancement(class_identifier)
        new_advancement.extend(spell_advancements)

        # Process progression table
        if "tabella" in progression_data:
            for level_data in progression_data["tabella"]:
                level = level_data.get("livello")
                privileges = level_data.get("privilegi", [])

                for privilege in privileges:
                    # Handle different privilege formats (string or dict)
                    if isinstance(privilege, dict):
                        privilege_name = privilege.get('nome', str(privilege))
                        privilege_id = privilege.get('id')
                    else:
                        privilege_name = privilege
                        privilege_id = None

                    # Skip ASI entries
                    if "Aumento Punteggi Caratteristica" in privilege_name:
                        continue

                    # Find corresponding feature
                    feature_id = None
                    if privilege_id and privilege_id in features:
                        feature_id = privilege_id
                    else:
                        feature_id = self.find_feature_by_name(privilege_name, features)

                    if feature_id:
                        advancement = self.create_item_grant_advancement(level, feature_id, privilege_name)
                        new_advancement.append(advancement)
                        print(f"Added {privilege_name} at level {level} for {class_name}")
                    else:
                        print(f"Feature not found: {privilege_name} for {class_name} at level {level}")

        # Update class data
        class_data["system"]["advancement"] = new_advancement

        return class_data

    def fix_barbaro_example(self) -> bool:
        """Fix Barbaro class as a detailed example."""
        print("Fixing Barbaro class as example...")

        fixed_class = self.fix_class_advancement("barbaro")
        if not fixed_class:
            print("Failed to fix Barbaro class")
            return False

        # Save the fixed class
        output_file = self.classes_path / "barbaro_fixed.json"
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(fixed_class, f, indent=2, ensure_ascii=False)
            print(f"Fixed Barbaro class saved to {output_file}")
            return True
        except Exception as e:
            print(f"Error saving fixed Barbaro class: {e}")
            return False

    def analyze_missing_features(self, class_name: str) -> Dict[str, List[str]]:
        """Analyze which features are missing for a class."""
        progression_data = self.load_class_progression(class_name)
        if not progression_data:
            return {"missing": [], "found": []}

        features = self.load_features()
        missing_features = []
        found_features = []

        if "tabella" in progression_data:
            for level_data in progression_data["tabella"]:
                level = level_data.get("livello")
                privileges = level_data.get("privilegi", [])

                for privilege in privileges:
                    # Handle different privilege formats (string or dict)
                    if isinstance(privilege, dict):
                        privilege_name = privilege.get('nome', str(privilege))
                        privilege_id = privilege.get('id')
                    else:
                        privilege_name = privilege
                        privilege_id = None

                    # Skip ASI entries
                    if "Aumento Punteggi Caratteristica" in privilege_name:
                        continue

                    # If we have an ID from the progression, try to find it directly
                    if privilege_id:
                        if privilege_id in features:
                            found_features.append(f"Level {level}: {privilege_name} -> {privilege_id}")
                            continue

                    # Otherwise try name matching
                    feature_id = self.find_feature_by_name(privilege_name, features)
                    if feature_id:
                        found_features.append(f"Level {level}: {privilege_name} -> {feature_id}")
                    else:
                        missing_features.append(f"Level {level}: {privilege_name}")

        return {"missing": missing_features, "found": found_features}

    def run_analysis(self) -> Dict[str, Any]:
        """Run analysis on all classes."""
        results = {}

        # Analyze only core classes that we know exist
        core_classes = ["barbaro", "bardo", "chierico", "druido", "guerriero", "ladro", "mago", "monaco", "paladino", "ranger", "stregone", "warlock"]

        print("Analyzing all classes...")
        for class_name in core_classes:
            print(f"\nAnalyzing {class_name}...")
            analysis = self.analyze_missing_features(class_name)
            results[class_name] = analysis

            print(f"  Found features: {len(analysis['found'])}")
            print(f"  Missing features: {len(analysis['missing'])}")

            if analysis['missing']:
                print("  Missing:")
                for missing in analysis['missing'][:5]:  # Show first 5
                    print(f"    {missing}")

        return results

def main():
    if len(sys.argv) < 2:
        print("Usage: python agent-classes-fix.py <base_path> [command]")
        print("Commands: analyze, fix-barbaro, fix-all")
        sys.exit(1)

    base_path = sys.argv[1]
    command = sys.argv[2] if len(sys.argv) > 2 else "analyze"

    fixer = BrancaloniaClassFixer(base_path)

    if command == "analyze":
        results = fixer.run_analysis()
        print("\n=== ANALYSIS SUMMARY ===")
        for class_name, analysis in results.items():
            print(f"{class_name}: {len(analysis['found'])} found, {len(analysis['missing'])} missing")

    elif command == "fix-barbaro":
        success = fixer.fix_barbaro_example()
        if success:
            print("Barbaro class fixed successfully!")
        else:
            print("Failed to fix Barbaro class")

    elif command == "fix-all":
        print("Fixing all classes...")
        for class_name in ["barbaro", "bardo", "chierico", "druido", "guerriero", "ladro", "mago", "monaco", "paladino", "ranger", "stregone", "warlock"]:
            print(f"\nFixing {class_name}...")
            fixed_class = fixer.fix_class_advancement(class_name)
            if fixed_class:
                output_file = fixer.classes_path / f"{class_name}_fixed.json"
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(fixed_class, f, indent=2, ensure_ascii=False)
                print(f"Fixed {class_name} saved to {output_file}")
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()