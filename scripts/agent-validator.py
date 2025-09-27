#!/usr/bin/env python3
"""
AGENT VALIDATOR - Test suite completa per validazione Brancalonia
Basato su D&D 5e v5.1.9 standards
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Tuple, Any
from collections import defaultdict

class BrancaloniaValidator:
    """Validatore completo per tutti i compendium"""

    def __init__(self):
        self.errors = []
        self.warnings = []
        self.passed = []
        self.stats = defaultdict(int)

        # D&D 5e required fields per type
        self.required_fields = {
            'class': {
                'name': str,
                'type': 'class',
                'system': {
                    'identifier': str,
                    'advancement': list,
                    'hitDice': str,
                    'hitDiceUsed': int,
                    'skills': dict,
                    'saves': list,
                    'spellcasting': dict
                }
            },
            'race': {
                'name': str,
                'type': 'race',
                'system': {
                    'advancement': list,
                    'movement': dict,
                    'senses': dict,
                    'size': str
                }
            },
            'background': {
                'name': str,
                'type': 'background',
                'system': {
                    'advancement': list,
                    'description': dict
                }
            },
            'feat': {
                'name': str,
                'type': 'feat',
                'system': {
                    'requirements': str,
                    'description': dict
                }
            }
        }

        # Required advancements per class level
        self.class_required_advancements = {
            1: ['HitPoints'],
            4: ['AbilityScoreImprovement'],
            8: ['AbilityScoreImprovement'],
            12: ['AbilityScoreImprovement'],
            16: ['AbilityScoreImprovement'],
            19: ['AbilityScoreImprovement']
        }

    def validate_json_structure(self, file_path: Path) -> bool:
        """Valida struttura JSON base"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            if not data.get('_id'):
                self.errors.append(f"{file_path.name}: Missing _id field")
                return False

            if not data.get('_key'):
                self.errors.append(f"{file_path.name}: Missing _key field for LevelDB")
                return False

            self.passed.append(f"{file_path.name}: Valid JSON structure")
            return True

        except json.JSONDecodeError as e:
            self.errors.append(f"{file_path.name}: Invalid JSON - {e}")
            return False

    def validate_class(self, file_path: Path) -> bool:
        """Valida struttura classe completa"""
        with open(file_path, 'r', encoding='utf-8') as f:
            cls = json.load(f)

        class_name = cls.get('name', 'Unknown')
        self.stats['total_classes'] += 1

        # Check advancements
        advancements = cls.get('system', {}).get('advancement', [])
        advancement_types = {adv.get('type') for adv in advancements}

        # 1. Check HitPoints advancement
        if 'HitPoints' not in advancement_types:
            self.errors.append(f"CLASS {class_name}: Missing HitPoints advancement")
        else:
            self.passed.append(f"CLASS {class_name}: HitPoints ✓")

        # 2. Check ASI advancements
        asi_count = sum(1 for adv in advancements if adv.get('type') == 'AbilityScoreImprovement')
        if asi_count < 5:
            self.errors.append(f"CLASS {class_name}: Only {asi_count}/5 ASI advancements")
        else:
            self.passed.append(f"CLASS {class_name}: ASI count ✓")

        # 3. Check class features (ItemGrant)
        feature_grants = [adv for adv in advancements if adv.get('type') == 'ItemGrant']
        if len(feature_grants) == 0:
            self.errors.append(f"CLASS {class_name}: NO ItemGrant features (expected 10+)")
        elif len(feature_grants) < 10:
            self.warnings.append(f"CLASS {class_name}: Only {len(feature_grants)} features")
        else:
            self.passed.append(f"CLASS {class_name}: Feature grants ✓")

        # 4. Check ItemGrant UUIDs are valid
        for grant in feature_grants:
            items = grant.get('configuration', {}).get('items', [])
            if len(items) == 0:
                self.errors.append(f"CLASS {class_name}: ItemGrant with empty items array")
            else:
                for item_entry in items:
                    # Handle both string and dict formats
                    if isinstance(item_entry, dict):
                        item_uuid = item_entry.get('uuid', '')
                    else:
                        item_uuid = item_entry

                    if item_uuid and not item_uuid.startswith('Compendium.'):
                        self.errors.append(f"CLASS {class_name}: Invalid UUID format: {item_uuid}")

        # 5. Check spellcasting
        spellcasting = cls.get('system', {}).get('spellcasting', {})
        progression = spellcasting.get('progression')

        if progression and progression not in ['none', None, '']:
            # Should have spell-related advancements
            has_spell_advancement = any(
                'spell' in str(adv).lower() or
                adv.get('type') in ['SpellSlots', 'SpellConfig', 'SpellcastingValue']
                for adv in advancements
            )

            if not has_spell_advancement:
                self.errors.append(f"CLASS {class_name}: Spellcaster but NO spell advancement")
            else:
                self.passed.append(f"CLASS {class_name}: Spell advancement ✓")

        # 6. Check for Scale Values (new discovery)
        scale_values = [adv for adv in advancements if adv.get('type') == 'ScaleValue']
        if len(scale_values) == 0:
            self.warnings.append(f"CLASS {class_name}: No ScaleValue advancements (consider adding)")

        return len([e for e in self.errors if class_name in e]) == 0

    def validate_race(self, file_path: Path) -> bool:
        """Valida struttura razza"""
        with open(file_path, 'r', encoding='utf-8') as f:
            race = json.load(f)

        race_name = race.get('name', 'Unknown')
        self.stats['total_races'] += 1

        advancements = race.get('system', {}).get('advancement', [])

        # 1. Check Size advancement
        has_size = any(adv.get('type') == 'Size' for adv in advancements)
        if not has_size:
            self.errors.append(f"RACE {race_name}: Missing Size advancement")
        else:
            self.passed.append(f"RACE {race_name}: Size advancement ✓")

        # 2. Check for traits
        trait_grants = [adv for adv in advancements if adv.get('type') in ['Trait', 'ItemGrant']]
        if len(trait_grants) == 0:
            self.errors.append(f"RACE {race_name}: NO racial traits")
        else:
            self.passed.append(f"RACE {race_name}: Traits ✓")

        return len([e for e in self.errors if race_name in e]) == 0

    def validate_rolltable(self, file_path: Path) -> bool:
        """Valida RollTable structure"""
        with open(file_path, 'r', encoding='utf-8') as f:
            table = json.load(f)

        table_name = table.get('name', 'Unknown')
        self.stats['total_rolltables'] += 1

        results = table.get('results', [])

        if len(results) == 0:
            self.errors.append(f"TABLE {table_name}: EMPTY results array")
            return False

        # Check result structure
        valid_results = True
        for i, result in enumerate(results):
            if not result.get('text'):
                self.errors.append(f"TABLE {table_name}: Result {i} missing text")
                valid_results = False

            if 'range' not in result:
                self.errors.append(f"TABLE {table_name}: Result {i} missing range")
                valid_results = False

        if valid_results:
            self.passed.append(f"TABLE {table_name}: Structure ✓")

        self.stats['total_results'] += len(results)
        return valid_results

    def validate_uuid_references(self) -> None:
        """Valida tutti gli UUID references"""
        # Collect all existing items
        all_items = {}

        for pack_dir in Path('packs').glob('*/_source'):
            if pack_dir.is_dir():
                for item_file in pack_dir.glob('*.json'):
                    with open(item_file, 'r') as f:
                        item = json.load(f)
                        item_id = item.get('_id')
                        if item_id:
                            pack_name = pack_dir.parent.name
                            full_uuid = f"Compendium.brancalonia.{pack_name}.Item.{item_id}"
                            all_items[full_uuid] = item['name']

        self.stats['total_items'] = len(all_items)

        # Check all UUID references
        invalid_count = 0
        for pack_dir in Path('packs').glob('*/_source'):
            if pack_dir.is_dir():
                for item_file in pack_dir.glob('*.json'):
                    with open(item_file, 'r') as f:
                        content = f.read()

                    # Find UUID patterns
                    import re
                    uuids = re.findall(r'Compendium\.brancalonia\.[^"]+', content)

                    for uuid in uuids:
                        if uuid not in all_items:
                            self.errors.append(f"Invalid UUID: {uuid} in {item_file.name}")
                            invalid_count += 1

        if invalid_count == 0:
            self.passed.append("All UUID references valid ✓")
        else:
            self.errors.append(f"Total invalid UUIDs: {invalid_count}")

    def validate_features_exist(self) -> None:
        """Verifica che i features esistano"""
        features_path = Path('packs/brancalonia-features/_source')

        if not features_path.exists():
            self.errors.append("CRITICAL: brancalonia-features pack missing!")
            return

        feature_files = list(features_path.glob('*.json'))
        self.stats['total_features'] = len(feature_files)

        if len(feature_files) < 100:
            self.warnings.append(f"Only {len(feature_files)} features (expected 200+)")
        else:
            self.passed.append(f"Features count: {len(feature_files)} ✓")

    def run_all_validations(self) -> None:
        """Esegue tutte le validazioni"""
        print("=" * 80)
        print("AGENT VALIDATOR - Brancalonia Module Test Suite")
        print("Based on D&D 5e v5.1.9 Standards")
        print("=" * 80)

        # 1. Validate Classes
        print("\n🎭 Validating Classes...")
        class_path = Path('packs/classi/_source')
        if class_path.exists():
            for class_file in class_path.glob('*.json'):
                if self.validate_json_structure(class_file):
                    self.validate_class(class_file)

        # 2. Validate Races
        print("🧬 Validating Races...")
        race_path = Path('packs/razze/_source')
        if race_path.exists():
            for race_file in race_path.glob('*.json'):
                if self.validate_json_structure(race_file):
                    self.validate_race(race_file)

        # 3. Validate RollTables
        print("🎲 Validating RollTables...")
        table_path = Path('packs/rollable-tables/_source')
        if table_path.exists():
            for table_file in table_path.glob('*.json'):
                if self.validate_json_structure(table_file):
                    self.validate_rolltable(table_file)

        # 4. Validate Features
        print("⚔️ Validating Features...")
        self.validate_features_exist()

        # 5. Validate UUID References
        print("🔗 Validating UUID References...")
        self.validate_uuid_references()

        # Print Report
        self.print_report()

    def print_report(self) -> None:
        """Stampa report dettagliato"""
        print("\n" + "=" * 80)
        print("VALIDATION REPORT")
        print("=" * 80)

        # Errors
        if self.errors:
            print(f"\n❌ ERRORS ({len(self.errors)}):")
            print("-" * 40)
            for error in self.errors[:20]:  # Show first 20
                print(f"  • {error}")
            if len(self.errors) > 20:
                print(f"  • ...and {len(self.errors) - 20} more errors")

        # Warnings
        if self.warnings:
            print(f"\n⚠️ WARNINGS ({len(self.warnings)}):")
            print("-" * 40)
            for warning in self.warnings[:10]:
                print(f"  • {warning}")

        # Passed
        print(f"\n✅ PASSED ({len(self.passed)} tests):")
        print("-" * 40)
        for passed in self.passed[:10]:
            print(f"  • {passed}")
        if len(self.passed) > 10:
            print(f"  • ...and {len(self.passed) - 10} more passed")

        # Statistics
        print("\n📊 STATISTICS:")
        print("-" * 40)
        for key, value in self.stats.items():
            print(f"  {key}: {value}")

        # Summary
        total_tests = len(self.errors) + len(self.warnings) + len(self.passed)
        success_rate = (len(self.passed) / total_tests * 100) if total_tests > 0 else 0

        print(f"\n📈 SUMMARY:")
        print(f"  Total Tests: {total_tests}")
        print(f"  Passed: {len(self.passed)}")
        print(f"  Failed: {len(self.errors)}")
        print(f"  Warnings: {len(self.warnings)}")
        print(f"  Success Rate: {success_rate:.1f}%")

        # Save to file
        report_path = Path('validation-report.md')
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("# Validation Report\n\n")
            f.write(f"## Summary\n")
            f.write(f"- Total Tests: {total_tests}\n")
            f.write(f"- Passed: {len(self.passed)}\n")
            f.write(f"- Failed: {len(self.errors)}\n")
            f.write(f"- Success Rate: {success_rate:.1f}%\n\n")

            if self.errors:
                f.write("## Errors\n")
                for error in self.errors:
                    f.write(f"- {error}\n")

            if self.warnings:
                f.write("\n## Warnings\n")
                for warning in self.warnings:
                    f.write(f"- {warning}\n")

        print(f"\n📝 Report saved to: {report_path}")

        if self.errors:
            print("\n🔧 NEXT STEPS:")
            print("1. Fix ItemGrant advancements with proper UUIDs")
            print("2. Add Size advancement to all races")
            print("3. Populate empty RollTable results")
            print("4. Add spell progression for caster classes")
            print("5. Create missing feature items")

        print("\n" + "=" * 80)

def main():
    validator = BrancaloniaValidator()
    validator.run_all_validations()

if __name__ == '__main__':
    main()