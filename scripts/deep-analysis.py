#!/usr/bin/env python3
"""
Deep analysis script per identificare TUTTI i problemi reali del modulo
Basato su D&D 5e v5.1.9 structure
"""

import json
import os
from pathlib import Path
from collections import defaultdict

class ModuleAnalyzer:
    def __init__(self):
        self.issues = defaultdict(list)
        self.stats = defaultdict(int)

    def analyze_classes(self):
        """Analizza problemi reali delle classi"""
        class_path = Path('packs/classi/_source')

        for class_file in class_path.glob('*.json'):
            with open(class_file, 'r', encoding='utf-8') as f:
                cls = json.load(f)

            class_name = cls['name']

            # Check advancement completeness
            advancements = cls.get('system', {}).get('advancement', [])
            advancement_types = [adv.get('type') for adv in advancements]
            advancement_levels = [adv.get('level') for adv in advancements]

            # Required base advancements per D&D 5e
            required = {
                'HitPoints': [1],
                'Subclass': [1, 2, 3],  # Varies by class
                'AbilityScoreImprovement': [4, 8, 12, 16, 19]
            }

            # Check missing advancement types
            if 'HitPoints' not in advancement_types:
                self.issues['classes'].append(f"{class_name}: Missing HitPoints advancement")

            # Count ASI advancements
            asi_count = advancement_types.count('AbilityScoreImprovement')
            if asi_count < 5:
                self.issues['classes'].append(f"{class_name}: Only {asi_count}/5 ASI advancements")

            # Check for class features (should have ItemGrant for features)
            feature_grants = [adv for adv in advancements if adv.get('type') == 'ItemGrant']
            if len(feature_grants) == 0:
                self.issues['classes'].append(f"{class_name}: NO class features (ItemGrant) configured")

            # Check spellcasting classes
            spellcasting = cls.get('system', {}).get('spellcasting', {})
            if spellcasting.get('progression') not in ['none', None, '']:
                # Should have spell slot progression
                spell_advancements = [adv for adv in advancements if 'spell' in str(adv).lower()]
                if len(spell_advancements) == 0:
                    self.issues['classes'].append(f"{class_name}: Spellcaster but NO spell advancement")

            self.stats['total_classes'] += 1
            self.stats['total_class_advancements'] += len(advancements)

    def analyze_races(self):
        """Analizza problemi reali delle razze"""
        race_path = Path('packs/razze/_source')

        for race_file in race_path.glob('*.json'):
            with open(race_file, 'r', encoding='utf-8') as f:
                race = json.load(f)

            race_name = race['name']

            # Check for Size advancement
            advancements = race.get('system', {}).get('advancement', [])
            has_size = any(adv.get('type') == 'Size' for adv in advancements)

            if not has_size:
                self.issues['races'].append(f"{race_name}: Missing Size advancement")

            # Check for racial traits
            trait_grants = [adv for adv in advancements if adv.get('type') in ['Trait', 'ItemGrant']]
            if len(trait_grants) == 0:
                self.issues['races'].append(f"{race_name}: NO racial traits configured")

            self.stats['total_races'] += 1

    def analyze_rolltables(self):
        """Analizza problemi delle RollTable"""
        table_path = Path('packs/rollable-tables/_source')

        for table_file in table_path.glob('*.json'):
            with open(table_file, 'r', encoding='utf-8') as f:
                table = json.load(f)

            table_name = table['name']
            results = table.get('results', [])

            if len(results) == 0:
                self.issues['rolltables'].append(f"{table_name}: EMPTY results array")
            else:
                # Check result structure
                for result in results:
                    if not result.get('text'):
                        self.issues['rolltables'].append(f"{table_name}: Result without text")
                    if 'range' not in result:
                        self.issues['rolltables'].append(f"{table_name}: Result without range")

            self.stats['total_rolltables'] += 1
            self.stats['total_results'] += len(results)

    def analyze_features(self):
        """Analizza features mancanti"""
        features_path = Path('packs/brancalonia-features/_source')

        # Map of expected class features per level
        expected_features = {
            'barbaro': {
                1: ['ira', 'difesa-senza-armatura'],
                2: ['percezione-del-pericolo', 'attacco-irruento'],
                3: ['cammino-primordiale'],
                5: ['attacco-extra', 'movimento-veloce'],
                7: ['istinto-ferino'],
                9: ['critico-brutale']
            },
            # Add more classes...
        }

        existing_features = set()
        if features_path.exists():
            for feat_file in features_path.glob('*.json'):
                with open(feat_file, 'r') as f:
                    feat = json.load(f)
                    existing_features.add(feat.get('_id', '').lower())

        # Check missing features
        for class_name, levels in expected_features.items():
            for level, features in levels.items():
                for feature in features:
                    feature_id = f"class-{class_name}-livello_{level}-{feature}"
                    if feature_id not in existing_features:
                        self.issues['features'].append(
                            f"{class_name} L{level}: Missing {feature}"
                        )

        self.stats['existing_features'] = len(existing_features)

    def analyze_spells(self):
        """Analizza spell compendium"""
        spell_path = Path('packs/incantesimi/_source')

        if spell_path.exists():
            spell_files = list(spell_path.glob('*.json'))
            self.stats['total_spells'] = len(spell_files)

            # Check for basic cantrips and 1st level spells
            spell_levels = defaultdict(int)
            for spell_file in spell_files:
                with open(spell_file, 'r') as f:
                    spell = json.load(f)
                    level = spell.get('system', {}).get('level', 0)
                    spell_levels[level] += 1

            if spell_levels[0] < 10:
                self.issues['spells'].append(f"Only {spell_levels[0]} cantrips (expected 20+)")
            if spell_levels[1] < 20:
                self.issues['spells'].append(f"Only {spell_levels[1]} 1st level spells (expected 40+)")
        else:
            self.issues['spells'].append("NO SPELL COMPENDIUM FOUND")

    def analyze_item_links(self):
        """Verifica UUID e collegamenti"""
        all_items = {}
        invalid_uuids = []

        # Collect all existing items
        for pack_dir in Path('packs').glob('*/_source'):
            if pack_dir.is_dir():
                for item_file in pack_dir.glob('*.json'):
                    with open(item_file, 'r') as f:
                        item = json.load(f)
                        item_id = item.get('_id')
                        if item_id:
                            pack_name = pack_dir.parent.name
                            all_items[item_id] = f"{pack_name}/{item['name']}"

        # Check all UUID references
        for pack_dir in Path('packs').glob('*/_source'):
            if pack_dir.is_dir():
                for item_file in pack_dir.glob('*.json'):
                    with open(item_file, 'r') as f:
                        content = f.read()

                    # Find all UUID references
                    import re
                    uuids = re.findall(r'Compendium\.brancalonia\.[^.]+\.Item\.([^"]+)', content)
                    for uuid in uuids:
                        if uuid not in all_items:
                            invalid_uuids.append({
                                'file': item_file.name,
                                'uuid': uuid
                            })

        if invalid_uuids:
            for invalid in invalid_uuids[:10]:  # Show first 10
                self.issues['uuids'].append(
                    f"{invalid['file']}: Invalid UUID {invalid['uuid']}"
                )
            if len(invalid_uuids) > 10:
                self.issues['uuids'].append(f"...and {len(invalid_uuids) - 10} more invalid UUIDs")

        self.stats['total_items'] = len(all_items)
        self.stats['invalid_uuids'] = len(invalid_uuids)

    def print_report(self):
        """Stampa report dettagliato"""
        print("=" * 80)
        print("DEEP ANALYSIS REPORT - BRANCALONIA MODULE")
        print("Based on D&D 5e v5.1.9 Standards")
        print("=" * 80)

        # Print issues by category
        categories = ['classes', 'races', 'features', 'spells', 'rolltables', 'uuids']

        for category in categories:
            if self.issues[category]:
                print(f"\n❌ {category.upper()} ISSUES ({len(self.issues[category])} problems):")
                print("-" * 40)
                for issue in self.issues[category][:10]:  # Show first 10
                    print(f"  • {issue}")
                if len(self.issues[category]) > 10:
                    print(f"  • ...and {len(self.issues[category]) - 10} more issues")

        # Print statistics
        print("\n📊 STATISTICS:")
        print("-" * 40)
        for key, value in self.stats.items():
            print(f"  {key}: {value}")

        # Print summary
        total_issues = sum(len(issues) for issues in self.issues.values())
        print(f"\n⚠️ TOTAL ISSUES FOUND: {total_issues}")

        if total_issues > 0:
            print("\n🔧 PRIORITY FIXES NEEDED:")
            print("1. Add ItemGrant advancement for ALL class features (levels 1-20)")
            print("2. Implement spell progression for caster classes")
            print("3. Create missing feature items in brancalonia-features")
            print("4. Fix invalid UUID references")
            print("5. Add racial trait items and link them")

        print("\n" + "=" * 80)

def main():
    analyzer = ModuleAnalyzer()

    print("Starting deep analysis...")
    analyzer.analyze_classes()
    analyzer.analyze_races()
    analyzer.analyze_features()
    analyzer.analyze_spells()
    analyzer.analyze_rolltables()
    analyzer.analyze_item_links()

    analyzer.print_report()

if __name__ == '__main__':
    main()