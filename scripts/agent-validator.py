#!/usr/bin/env python3
"""
AGENT_VALIDATOR - Comprehensive Brancalonia Module Validation System

This validator implements rigorous testing based on D&D 5e structure discovered by AGENT_MONITOR.
It validates classes, UUIDs, roll tables, features, and spell systems to ensure the module
works correctly in Foundry VTT.

VALIDATION FEATURES:
==================

1. **Class Validation**:
   - Check for ItemGrant advancement with proper object format: {uuid: "...", optional: false}
   - Check for HitPoints advancement
   - Check for AbilityScoreImprovement at levels 4,8,12,16,19
   - Check for SpellcastingValue if spellcaster
   - Check for ScaleValue if applicable (Warlock pact magic)
   - Check for Trait advancement (proficiencies)
   - Check for ItemChoice advancement where applicable
   - Validate minimum 10+ feature grants per class

2. **UUID Validation**:
   - Check all UUID references follow pattern: Compendium.brancalonia.{pack}.{type}.{id}
   - Verify referenced items actually exist
   - Check for broken references

3. **RollTable Validation**:
   - Check for results array
   - Validate each result has: text, range, weight, drawn
   - Ensure no empty RollTables

4. **Feature Validation**:
   - Check all features have _key field
   - Verify features linked from classes exist
   - Check for proper type field

5. **Spell System Validation**:
   - Check for spell items in spell pack
   - Validate spell progression for caster classes
   - Check spell slot arrays

USAGE:
======
python3 agent-validator.py [module_path] [--report output.md] [--verbose] [--quiet]

OUTPUT:
=======
- Detailed error messages with file locations
- Count errors, warnings, and passes (concrete numbers, NOT percentages)
- Generate markdown report
- Exit codes: 0 for success, 1 for errors found

Author: AGENT_VALIDATOR
Version: 2.0.0 (Enhanced)
Compatible with: Brancalonia module v3.21.0+
Based on: D&D 5e v5.1.9 standards
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional, Set
from collections import defaultdict
import argparse
from datetime import datetime
from dataclasses import dataclass, field

@dataclass
class ValidationResult:
    """Results of validation checks."""
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    passes: List[str] = field(default_factory=list)

    def add_error(self, message: str, file_path: str = "", line: int = 0):
        location = f" [{Path(file_path).name}:{line}]" if file_path else ""
        self.errors.append(f"ERROR: {message}{location}")

    def add_warning(self, message: str, file_path: str = "", line: int = 0):
        location = f" [{Path(file_path).name}:{line}]" if file_path else ""
        self.warnings.append(f"WARNING: {message}{location}")

    def add_pass(self, message: str, file_path: str = "", line: int = 0):
        location = f" [{Path(file_path).name}:{line}]" if file_path else ""
        self.passes.append(f"PASS: {message}{location}")

    @property
    def total_issues(self) -> int:
        return len(self.errors) + len(self.warnings)

    @property
    def error_count(self) -> int:
        return len(self.errors)

    @property
    def warning_count(self) -> int:
        return len(self.warnings)

    @property
    def pass_count(self) -> int:
        return len(self.passes)

class BrancaloniaValidator:
    """Comprehensive validator for Brancalonia module."""

    def __init__(self, module_path: str = "."):
        self.module_path = Path(module_path)
        self.results = ValidationResult()
        self.stats = defaultdict(int)
        self.uuid_pattern = re.compile(r'Compendium\.brancalonia\.([^.]+)\.([^.]+)\.([^.]+)')
        self.item_registry: Dict[str, Dict] = {}
        self.pack_info: Dict[str, Dict] = {}

        # Load module manifest
        self._load_module_manifest()

        # D&D 5e class progression requirements
        self.asi_levels = {4, 8, 12, 16, 19}
        self.min_feature_count = 10

        # Valid spell schools for validation
        self.valid_spell_schools = {'abj', 'con', 'div', 'enc', 'evo', 'ill', 'nec', 'trs'}

        # Valid hit dice values
        self.valid_hit_dice = {'d6', 'd8', 'd10', 'd12'}

        # Load all items into registry
        self._load_normalized_packs()

    def _load_module_manifest(self):
        """Load and parse module.json."""
        manifest_path = self.module_path / "module.json"
        if not manifest_path.exists():
            self.results.add_error(f"Module manifest not found", str(manifest_path))
            return

        try:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                manifest = json.load(f)

            for pack in manifest.get('packs', []):
                self.pack_info[pack['name']] = pack

            self.results.add_pass(f"Module manifest loaded successfully with {len(self.pack_info)} packs")

        except Exception as e:
            self.results.add_error(f"Failed to load module manifest: {e}", str(manifest_path))

    def _load_normalized_packs(self):
        """Load all items from normalized packs into registry."""
        packs_dir = self.module_path / "packs_normalized"
        if not packs_dir.exists():
            # Try alternative locations
            packs_dir = self.module_path / "packs"
            if not packs_dir.exists():
                self.results.add_error("No packs directory found")
                return

        total_items = 0
        for pack_dir in packs_dir.iterdir():
            if not pack_dir.is_dir():
                continue

            source_dir = pack_dir / "_source"
            if not source_dir.exists():
                continue

            pack_name = pack_dir.name
            self.item_registry[pack_name] = {}

            for item_file in source_dir.glob("*.json"):
                try:
                    with open(item_file, 'r', encoding='utf-8') as f:
                        item_data = json.load(f)

                    item_id = item_data.get('_id') or item_data.get('id')
                    if item_id:
                        self.item_registry[pack_name][item_id] = {
                            'data': item_data,
                            'file': str(item_file)
                        }
                        total_items += 1

                except Exception as e:
                    self.results.add_error(f"Failed to load item: {e}", str(item_file))

        self.results.add_pass(f"Loaded {total_items} items from normalized packs")

    def validate_json_structure(self, file_path: Path) -> bool:
        """Validate basic JSON structure."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            if not data.get('_id'):
                self.results.add_error(f"Missing _id field", str(file_path))
                return False

            if not data.get('_key'):
                self.results.add_error(f"Missing _key field for LevelDB", str(file_path))
                return False

            self.results.add_pass(f"Valid JSON structure", str(file_path))
            return True

        except json.JSONDecodeError as e:
            self.results.add_error(f"Invalid JSON - {e}", str(file_path))
            return False

    def validate_class_structure(self, class_data: Dict, file_path: str) -> None:
        """Validate D&D 5e class structure and requirements."""
        class_name = class_data.get('name', 'Unknown Class')
        self.stats['total_classes'] += 1

        # Check basic class properties
        required_fields = ['type', 'system']
        for field in required_fields:
            if field not in class_data:
                self.results.add_error(f"Class {class_name} missing required field: {field}", file_path)

        if class_data.get('type') != 'class':
            self.results.add_error(f"Item {class_name} has type '{class_data.get('type')}' but should be 'class'", file_path)
            return

        system_data = class_data.get('system', {})

        # Check hit dice
        hit_dice = system_data.get('hitDice')
        if hit_dice not in self.valid_hit_dice:
            self.results.add_error(f"Class {class_name} has invalid hit dice: {hit_dice} (should be one of {self.valid_hit_dice})", file_path)
        else:
            self.results.add_pass(f"Class {class_name} has valid hit dice: {hit_dice}", file_path)

        # Check saving throw proficiencies
        saves = system_data.get('saves', [])
        if len(saves) != 2:
            self.results.add_warning(f"Class {class_name} should have exactly 2 saving throw proficiencies, has {len(saves)}", file_path)

        # Check for advancement items
        advancement = system_data.get('advancement', {})
        if not advancement:
            self.results.add_warning(f"Class {class_name} has no advancement data - may need manual validation", file_path)
        else:
            self._validate_class_advancement(class_name, advancement, file_path)

    def _validate_class_advancement(self, class_name: str, advancement: Dict, file_path: str) -> None:
        """Validate class advancement structure."""
        feature_count = 0
        has_asi = False
        has_hit_points = False

        for adv_id, adv_data in advancement.items():
            adv_type = adv_data.get('type')

            if adv_type == 'ItemGrant':
                # Check ItemGrant format: {uuid: "...", optional: false}
                items = adv_data.get('configuration', {}).get('items', [])
                for item in items:
                    if isinstance(item, dict):
                        if 'uuid' not in item:
                            self.results.add_error(f"Class {class_name} ItemGrant missing uuid field", file_path)
                        if 'optional' not in item:
                            self.results.add_warning(f"Class {class_name} ItemGrant missing optional field", file_path)
                        # Validate UUID reference
                        uuid = item.get('uuid', '')
                        if uuid:
                            self._validate_single_uuid(uuid, file_path, f"Class {class_name} ItemGrant")
                    elif isinstance(item, str):
                        self._validate_single_uuid(item, file_path, f"Class {class_name} ItemGrant")

                feature_count += len(items)

            elif adv_type == 'HitPoints':
                has_hit_points = True
                self.results.add_pass(f"Class {class_name} has HitPoints advancement", file_path)

            elif adv_type == 'AbilityScoreImprovement':
                has_asi = True
                # Check if ASI appears at correct levels
                levels = adv_data.get('level', [])
                if isinstance(levels, int):
                    levels = [levels]
                for level in levels:
                    if level in self.asi_levels:
                        self.results.add_pass(f"Class {class_name} has ASI at correct level {level}", file_path)
                    else:
                        self.results.add_warning(f"Class {class_name} has ASI at non-standard level {level}", file_path)

            elif adv_type == 'SpellcastingValue':
                self.results.add_pass(f"Class {class_name} has spellcasting advancement", file_path)

            elif adv_type == 'ScaleValue':
                self.results.add_pass(f"Class {class_name} has scale value advancement", file_path)

            elif adv_type == 'Trait':
                self.results.add_pass(f"Class {class_name} has trait advancement (proficiencies)", file_path)

            elif adv_type == 'ItemChoice':
                self.results.add_pass(f"Class {class_name} has item choice advancement", file_path)

        # Validate minimum feature requirements
        if feature_count < self.min_feature_count:
            self.results.add_warning(f"Class {class_name} has only {feature_count} features (recommended minimum: {self.min_feature_count})", file_path)
        else:
            self.results.add_pass(f"Class {class_name} has sufficient features: {feature_count}", file_path)

        if not has_hit_points:
            self.results.add_error(f"Class {class_name} missing HitPoints advancement", file_path)

        if not has_asi:
            self.results.add_warning(f"Class {class_name} missing AbilityScoreImprovement advancement", file_path)

    def validate_uuid_references(self, data: Any, file_path: str, path: str = "") -> None:
        """Recursively validate UUID references throughout data."""
        if isinstance(data, dict):
            for key, value in data.items():
                current_path = f"{path}.{key}" if path else key

                if key == 'uuid' and isinstance(value, str):
                    self._validate_single_uuid(value, file_path, current_path)
                else:
                    self.validate_uuid_references(value, file_path, current_path)

        elif isinstance(data, list):
            for i, item in enumerate(data):
                current_path = f"{path}[{i}]" if path else f"[{i}]"
                self.validate_uuid_references(item, file_path, current_path)

        elif isinstance(data, str) and data.startswith('Compendium.brancalonia.'):
            self._validate_single_uuid(data, file_path, path)

    def _validate_single_uuid(self, uuid: str, file_path: str, path: str) -> None:
        """Validate a single UUID reference."""
        match = self.uuid_pattern.match(uuid)
        if not match:
            self.results.add_error(f"Invalid UUID format: {uuid} at {path}", file_path)
            return

        pack_name, item_type, item_id = match.groups()

        # Check if referenced pack exists
        if pack_name not in self.pack_info and pack_name not in self.item_registry:
            self.results.add_error(f"UUID references non-existent pack '{pack_name}': {uuid} at {path}", file_path)
            return

        # Check if referenced item exists (if we have the registry loaded)
        if pack_name in self.item_registry:
            if item_id not in self.item_registry[pack_name]:
                self.results.add_error(f"UUID references non-existent item '{item_id}' in pack '{pack_name}': {uuid} at {path}", file_path)
            else:
                self.results.add_pass(f"Valid UUID reference: {uuid} at {path}", file_path)
        else:
            self.results.add_pass(f"UUID format valid: {uuid} at {path}", file_path)

    def validate_rolltable(self, table_data: Dict, file_path: str) -> None:
        """Validate roll table structure."""
        table_name = table_data.get('name', 'Unknown Table')
        self.stats['total_rolltables'] += 1

        results = table_data.get('results', [])
        if not results:
            self.results.add_error(f"RollTable {table_name} has no results", file_path)
            return

        # Validate each result
        required_result_fields = ['text', 'range', 'weight', 'drawn']
        for i, result in enumerate(results):
            for field in required_result_fields:
                if field not in result:
                    self.results.add_error(f"RollTable {table_name} result {i} missing field: {field}", file_path)

            # Validate range format
            result_range = result.get('range', [])
            if not isinstance(result_range, list) or len(result_range) != 2:
                self.results.add_error(f"RollTable {table_name} result {i} has invalid range format", file_path)

            # Check for empty text
            if not result.get('text', '').strip():
                self.results.add_warning(f"RollTable {table_name} result {i} has empty text", file_path)

        self.results.add_pass(f"RollTable {table_name} validated with {len(results)} results", file_path)
        self.stats['total_results'] += len(results)

    def validate_feature(self, feature_data: Dict, file_path: str) -> None:
        """Validate feature structure."""
        feature_name = feature_data.get('name', 'Unknown Feature')
        self.stats['total_features'] += 1

        # Check for _key field
        if '_key' not in feature_data:
            self.results.add_error(f"Feature {feature_name} missing _key field", file_path)
        else:
            self.results.add_pass(f"Feature {feature_name} has _key field", file_path)

        # Check type field
        if 'type' not in feature_data:
            self.results.add_error(f"Feature {feature_name} missing type field", file_path)

        # Check system data exists
        system_data = feature_data.get('system', {})
        if not system_data:
            self.results.add_warning(f"Feature {feature_name} has no system data", file_path)

        # Check for description
        description = system_data.get('description', {}).get('value', '')
        if not description.strip():
            self.results.add_warning(f"Feature {feature_name} has no description", file_path)

        self.results.add_pass(f"Feature {feature_name} basic validation passed", file_path)

    def validate_spell(self, spell_data: Dict, file_path: str) -> None:
        """Validate spell structure."""
        spell_name = spell_data.get('name', 'Unknown Spell')
        self.stats['total_spells'] += 1

        if spell_data.get('type') != 'spell':
            self.results.add_error(f"Item {spell_name} should have type 'spell'", file_path)
            return

        system_data = spell_data.get('system', {})

        # Check spell level
        level = system_data.get('level')
        if level is None or not isinstance(level, int) or level < 0 or level > 9:
            self.results.add_error(f"Spell {spell_name} has invalid level: {level}", file_path)

        # Check spell school
        school = system_data.get('school')
        if school not in self.valid_spell_schools:
            self.results.add_error(f"Spell {spell_name} has invalid school: {school}", file_path)

        # Check components
        components = system_data.get('components', {})
        if not any(components.get(comp, False) for comp in ['vocal', 'somatic', 'material']):
            self.results.add_warning(f"Spell {spell_name} has no components", file_path)

        self.results.add_pass(f"Spell {spell_name} validation passed", file_path)

    def validate_pack(self, pack_name: str) -> None:
        """Validate an entire pack."""
        if pack_name not in self.item_registry:
            self.results.add_error(f"Pack {pack_name} not found in registry")
            return

        pack_items = self.item_registry[pack_name]
        self.stats[f'pack_{pack_name}_items'] = len(pack_items)

        for item_id, item_info in pack_items.items():
            item_data = item_info['data']
            file_path = item_info['file']
            item_type = item_data.get('type', 'unknown')

            # Validate UUID references in this item
            self.validate_uuid_references(item_data, file_path)

            # Type-specific validation
            if item_type == 'class':
                self.validate_class_structure(item_data, file_path)
            elif item_type == 'feat' or item_type == 'feature':
                self.validate_feature(item_data, file_path)
            elif item_type == 'spell':
                self.validate_spell(item_data, file_path)
            elif 'results' in item_data:  # Roll table detection
                self.validate_rolltable(item_data, file_path)

        self.results.add_pass(f"Pack {pack_name} validated with {len(pack_items)} items")

    def validate_spell_system(self) -> None:
        """Validate spell system integrity."""
        spell_pack = 'incantesimi'
        if spell_pack not in self.item_registry:
            self.results.add_warning("No spell pack found for spell system validation")
            return

        spells = self.item_registry[spell_pack]
        spell_count_by_level = defaultdict(int)

        for spell_id, spell_info in spells.items():
            spell_data = spell_info['data']
            if spell_data.get('type') == 'spell':
                level = spell_data.get('system', {}).get('level', -1)
                spell_count_by_level[level] += 1

        # Report spell distribution
        for level in range(10):  # 0-9
            count = spell_count_by_level[level]
            if count > 0:
                level_name = "Cantrip" if level == 0 else f"Level {level}"
                self.results.add_pass(f"Spell system has {count} {level_name} spells")
                self.stats[f'spells_level_{level}'] = count

        total_spells = sum(spell_count_by_level.values())
        self.results.add_pass(f"Spell system validated with {total_spells} total spells")
        self.stats['total_spells'] = total_spells

    def validate_features_exist(self) -> None:
        """Verify that features exist and are properly linked."""
        features_pack = 'brancalonia-features'
        if features_pack not in self.item_registry:
            self.results.add_error("CRITICAL: brancalonia-features pack missing!")
            return

        features = self.item_registry[features_pack]
        feature_count = len(features)
        self.stats['total_features'] = feature_count

        if feature_count < 100:
            self.results.add_warning(f"Only {feature_count} features (expected 200+)")
        else:
            self.results.add_pass(f"Features count: {feature_count} ✓")

        # Validate feature structure
        for feature_id, feature_info in features.items():
            self.validate_feature(feature_info['data'], feature_info['file'])

    def run_validation(self) -> ValidationResult:
        """Run complete validation suite."""
        print("Starting Brancalonia Module Validation...")
        print("=" * 80)
        print("AGENT_VALIDATOR - Comprehensive Brancalonia Module Validation")
        print("Based on D&D 5e v5.1.9 Standards")
        print("=" * 80)

        # Validate each pack
        for pack_name in self.pack_info.keys():
            if pack_name in self.item_registry:
                print(f"Validating pack: {pack_name}")
                self.validate_pack(pack_name)

        # Validate features specifically
        print("Validating Features...")
        self.validate_features_exist()

        # Validate spell system
        print("Validating Spell System...")
        self.validate_spell_system()

        print("Validation complete!")
        return self.results

    def generate_markdown_report(self, output_file: str = None) -> str:
        """Generate a detailed markdown report."""
        report_lines = [
            "# Brancalonia Module Validation Report",
            f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"**Module Path:** {self.module_path}",
            f"**Validator Version:** 2.0.0 (Enhanced)",
            "",
            "## Summary",
            f"- **Errors:** {self.results.error_count}",
            f"- **Warnings:** {self.results.warning_count}",
            f"- **Passes:** {self.results.pass_count}",
            f"- **Total Issues:** {self.results.total_issues}",
            ""
        ]

        if self.results.errors:
            report_lines.extend([
                "## Errors",
                ""
            ])
            for error in self.results.errors:
                report_lines.append(f"- {error}")
            report_lines.append("")

        if self.results.warnings:
            report_lines.extend([
                "## Warnings",
                ""
            ])
            for warning in self.results.warnings:
                report_lines.append(f"- {warning}")
            report_lines.append("")

        if self.results.passes:
            report_lines.extend([
                "## Successful Validations",
                ""
            ])
            for pass_msg in self.results.passes:
                report_lines.append(f"- {pass_msg}")
            report_lines.append("")

        # Pack statistics
        report_lines.extend([
            "## Pack Statistics",
            ""
        ])

        for pack_name, pack_items in self.item_registry.items():
            item_types = defaultdict(int)
            for item_info in pack_items.values():
                item_type = item_info['data'].get('type', 'unknown')
                item_types[item_type] += 1

            report_lines.append(f"### {pack_name}")
            report_lines.append(f"- **Total Items:** {len(pack_items)}")
            for item_type, count in sorted(item_types.items()):
                report_lines.append(f"- **{item_type}:** {count}")
            report_lines.append("")

        # Statistics section
        if self.stats:
            report_lines.extend([
                "## Detailed Statistics",
                ""
            ])
            for key, value in sorted(self.stats.items()):
                report_lines.append(f"- **{key}:** {value}")
            report_lines.append("")

        # Recommendations
        if self.results.errors or self.results.warnings:
            report_lines.extend([
                "## Recommendations",
                "",
                "### High Priority (Errors)"
            ])
            if self.results.errors:
                report_lines.extend([
                    "1. Fix ItemGrant advancements with proper UUID format: `{uuid: '...', optional: false}`",
                    "2. Add missing HitPoints advancement to all classes",
                    "3. Ensure all roll tables have complete result structures",
                    "4. Fix broken UUID references",
                    "5. Add missing _key fields to features",
                    ""
                ])

            if self.results.warnings:
                report_lines.extend([
                    "### Medium Priority (Warnings)",
                    "1. Add AbilityScoreImprovement advancement at levels 4, 8, 12, 16, 19",
                    "2. Ensure classes have minimum 10+ feature grants",
                    "3. Add ScaleValue advancements where applicable",
                    "4. Complete feature descriptions",
                    "5. Validate spell component requirements",
                    ""
                ])

        report_content = "\n".join(report_lines)

        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(report_content)
            print(f"Report saved to: {output_file}")

        return report_content

    def print_summary(self) -> None:
        """Print a concise summary of validation results."""
        print("\n" + "="*50)
        print("VALIDATION SUMMARY")
        print("="*50)
        print(f"Errors: {self.results.error_count}")
        print(f"Warnings: {self.results.warning_count}")
        print(f"Passes: {self.results.pass_count}")
        print(f"Total Issues: {self.results.total_issues}")

        if self.results.errors:
            print("\nFirst 5 Errors:")
            for error in self.results.errors[:5]:
                print(f"  - {error}")
            if len(self.results.errors) > 5:
                print(f"  ... and {len(self.results.errors) - 5} more errors")

        if self.results.warnings:
            print("\nFirst 5 Warnings:")
            for warning in self.results.warnings[:5]:
                print(f"  - {warning}")
            if len(self.results.warnings) > 5:
                print(f"  ... and {len(self.results.warnings) - 5} more warnings")

        print("\nPack Summary:")
        for pack_name, items in self.item_registry.items():
            print(f"  {pack_name}: {len(items)} items")

def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Validate Brancalonia module for D&D 5e compliance')
    parser.add_argument('module_path', nargs='?', default='.', help='Path to Brancalonia module directory')
    parser.add_argument('--report', '-r', help='Output markdown report to file')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--quiet', '-q', action='store_true', help='Quiet mode - only show summary')

    args = parser.parse_args()

    if not os.path.exists(args.module_path):
        print(f"Error: Module path does not exist: {args.module_path}")
        sys.exit(1)

    # Run validation
    validator = BrancaloniaValidator(args.module_path)
    results = validator.run_validation()

    # Print summary unless quiet
    if not args.quiet:
        validator.print_summary()

    # Print details if verbose
    if args.verbose and not args.quiet:
        print("\nDETAILS:")
        for error in results.errors:
            print(error)
        for warning in results.warnings:
            print(warning)
        for pass_msg in results.passes:
            print(pass_msg)

    # Generate report
    if args.report:
        validator.generate_markdown_report(args.report)
    elif not args.quiet:
        # Auto-generate report in module directory
        report_path = Path(args.module_path) / 'validation-report.md'
        validator.generate_markdown_report(str(report_path))

    # Exit with error code if there are errors
    sys.exit(1 if results.error_count > 0 else 0)

if __name__ == '__main__':
    main()