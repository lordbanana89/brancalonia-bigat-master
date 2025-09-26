#!/usr/bin/env python3
"""
Analizza la struttura di tutti gli item types per identificare problemi
basati sui requisiti di D&D 5e v5.x per Foundry v13
"""

import json
import os
from pathlib import Path

def analyze_backgrounds():
    """Analizza i background per problemi strutturali"""
    issues = []
    bg_path = Path('packs/backgrounds/_source')

    for bg_file in bg_path.glob('*.json'):
        with open(bg_file, 'r', encoding='utf-8') as f:
            bg = json.load(f)

        bg_issues = []

        # Check startingEquipment
        if 'startingEquipment' not in bg.get('system', {}):
            bg_issues.append("Manca campo startingEquipment")

        # Check advancement values
        for adv in bg.get('system', {}).get('advancement', []):
            if not adv.get('value') or adv.get('value') == {}:
                bg_issues.append(f"Advancement '{adv.get('title', 'Unknown')}' ha value vuoto")

        if bg_issues:
            issues.append({
                'file': bg_file.name,
                'name': bg['name'],
                'issues': bg_issues
            })

    return issues

def analyze_classes():
    """Analizza le classi per problemi strutturali"""
    issues = []
    class_path = Path('packs/classi/_source')

    for class_file in class_path.glob('*.json'):
        with open(class_file, 'r', encoding='utf-8') as f:
            cls = json.load(f)

        cls_issues = []

        # Check hit dice structure
        hd = cls.get('system', {}).get('hitDice')
        if isinstance(hd, str):
            cls_issues.append(f"hitDice è stringa '{hd}' invece di oggetto con denomination")

        # D&D 5e v5.x usa 'hd' non 'hitDice'
        if 'hd' not in cls.get('system', {}):
            cls_issues.append("Manca campo 'hd' (hit dice object)")

        # Check primaryAbility
        if 'primaryAbility' not in cls.get('system', {}):
            cls_issues.append("Manca campo primaryAbility")

        # Check startingEquipment
        if 'startingEquipment' not in cls.get('system', {}):
            cls_issues.append("Manca campo startingEquipment")

        # Check advancement
        if not cls.get('system', {}).get('advancement'):
            cls_issues.append("Campo advancement vuoto - dovrebbe avere HP, ASI, etc.")

        if cls_issues:
            issues.append({
                'file': class_file.name,
                'name': cls['name'],
                'issues': cls_issues
            })

    return issues

def analyze_races():
    """Analizza le razze per problemi strutturali"""
    issues = []
    race_path = Path('packs/razze/_source')

    for race_file in race_path.glob('*.json'):
        with open(race_file, 'r', encoding='utf-8') as f:
            race = json.load(f)

        race_issues = []

        # Check for wrong fields (from equipment template)
        wrong_fields = ['activation', 'duration', 'target', 'range', 'uses',
                       'equipped', 'quantity', 'weight', 'price', 'rarity', 'attunement']

        for field in wrong_fields:
            if field in race.get('system', {}):
                race_issues.append(f"Campo errato '{field}' (da equipment template)")

        # Check for missing required fields
        required_fields = ['movement', 'senses', 'type']
        for field in required_fields:
            if field not in race.get('system', {}):
                race_issues.append(f"Manca campo richiesto '{field}'")

        # Check advancement
        if 'advancement' not in race.get('system', {}):
            race_issues.append("Manca campo advancement")

        if race_issues:
            issues.append({
                'file': race_file.name,
                'name': race['name'],
                'issues': race_issues
            })

    return issues

def analyze_subclasses():
    """Analizza le sottoclassi per problemi strutturali"""
    issues = []
    subclass_path = Path('packs/sottoclassi/_source')

    if not subclass_path.exists():
        return issues

    for sub_file in subclass_path.glob('*.json'):
        with open(sub_file, 'r', encoding='utf-8') as f:
            sub = json.load(f)

        sub_issues = []

        # Check classIdentifier
        if 'classIdentifier' not in sub.get('system', {}):
            sub_issues.append("Manca campo classIdentifier")

        # Check advancement
        if 'advancement' not in sub.get('system', {}):
            sub_issues.append("Manca campo advancement")

        if sub_issues:
            issues.append({
                'file': sub_file.name,
                'name': sub['name'],
                'issues': sub_issues
            })

    return issues

def main():
    print("=" * 80)
    print("ANALISI STRUTTURA ITEM TYPES - D&D 5e v5.x per Foundry v13")
    print("=" * 80)

    # Backgrounds
    print("\n📚 BACKGROUNDS:")
    print("-" * 40)
    bg_issues = analyze_backgrounds()
    if bg_issues:
        for item in bg_issues:
            print(f"\n❌ {item['name']} ({item['file']}):")
            for issue in item['issues']:
                print(f"   - {issue}")
    else:
        print("✅ Tutti i background hanno struttura corretta")

    # Classes
    print("\n\n⚔️ CLASSES:")
    print("-" * 40)
    class_issues = analyze_classes()
    if class_issues:
        for item in class_issues:
            print(f"\n❌ {item['name']} ({item['file']}):")
            for issue in item['issues']:
                print(f"   - {issue}")
    else:
        print("✅ Tutte le classi hanno struttura corretta")

    # Races
    print("\n\n👥 RACES:")
    print("-" * 40)
    race_issues = analyze_races()
    if race_issues:
        for item in race_issues:
            print(f"\n❌ {item['name']} ({item['file']}):")
            for issue in item['issues']:
                print(f"   - {issue}")
    else:
        print("✅ Tutte le razze hanno struttura corretta")

    # Subclasses
    print("\n\n📖 SUBCLASSES:")
    print("-" * 40)
    sub_issues = analyze_subclasses()
    if sub_issues:
        for item in sub_issues:
            print(f"\n❌ {item['name']} ({item['file']}):")
            for issue in item['issues']:
                print(f"   - {issue}")
    else:
        print("✅ Tutte le sottoclassi hanno struttura corretta")

    # Summary
    print("\n\n" + "=" * 80)
    print("RIEPILOGO PROBLEMI:")
    print("-" * 40)
    total_issues = len(bg_issues) + len(class_issues) + len(race_issues) + len(sub_issues)
    print(f"Backgrounds con problemi: {len(bg_issues)}")
    print(f"Classi con problemi: {len(class_issues)}")
    print(f"Razze con problemi: {len(race_issues)}")
    print(f"Sottoclassi con problemi: {len(sub_issues)}")
    print(f"\nTOTALE ITEM CON PROBLEMI: {total_issues}")

    if total_issues > 0:
        print("\n⚠️ RACCOMANDAZIONI:")
        print("1. I background necessitano startingEquipment e value negli advancement")
        print("2. Le classi necessitano ristrutturazione completa del campo hd")
        print("3. Le razze hanno template completamente errato (equipment invece di race)")
        print("4. Tutti gli item types necessitano advancement configurati correttamente")

if __name__ == '__main__':
    main()