#!/usr/bin/env python3
"""
Test finale della navigazione dopo standardizzazione e correzioni.
Verifica che tutti gli index.json permettano di identificare ogni file.
"""

import json
import os
from pathlib import Path
import random

def load_json(filepath):
    """Carica un file JSON gestendo encoding."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        return None

def test_index_navigation(base_path):
    """Testa la navigazione attraverso gli index.json."""

    print("=" * 60)
    print("🧭 TEST NAVIGAZIONE INDEX.JSON - FINALE")
    print("=" * 60)

    stats = {
        'total_indexes': 0,
        'successful': 0,
        'failed': 0,
        'warnings': 0,
        'perfect': 0,
        'issues': []
    }

    # Trova tutti gli index.json
    index_files = list(Path(base_path).rglob('index.json'))
    stats['total_indexes'] = len(index_files)

    print(f"\n📂 Trovati {len(index_files)} file index.json")
    print("\n🔍 Test navigazione per ogni index:\n")

    for index_path in sorted(index_files):
        rel_path = index_path.relative_to(base_path)
        directory = index_path.parent

        # Carica l'index
        data = load_json(index_path)
        if not data:
            print(f"❌ {rel_path} - Non leggibile")
            stats['failed'] += 1
            stats['issues'].append(f"Non leggibile: {rel_path}")
            continue

        # Verifica struttura standard
        has_standard = all(k in data for k in ['categoria', 'elementi', 'totale'])
        if not has_standard:
            print(f"⚠️  {rel_path} - Struttura non standard")
            stats['warnings'] += 1
            stats['issues'].append(f"Struttura non standard: {rel_path}")
            continue

        # Test navigazione elementi
        elementi = data.get('elementi', [])
        total_declared = data.get('totale', 0)

        if len(elementi) != total_declared:
            print(f"⚠️  {rel_path} - Totale dichiarato ({total_declared}) != elementi ({len(elementi)})")
            stats['warnings'] += 1
            stats['issues'].append(f"Conteggio errato: {rel_path}")

        # Verifica ogni elemento
        all_files_exist = True
        for elem in elementi:
            # Verifica campi richiesti
            if not all(k in elem for k in ['id', 'nome', 'file']):
                print(f"⚠️  {rel_path} - Elemento senza campi obbligatori")
                stats['warnings'] += 1
                all_files_exist = False
                break

            # Verifica esistenza file
            file_path = directory / elem['file']
            if not file_path.exists():
                print(f"⚠️  {rel_path} - File non trovato: {elem['file']}")
                stats['warnings'] += 1
                all_files_exist = False

        if all_files_exist and len(elementi) == total_declared and has_standard:
            stats['perfect'] += 1
            print(f"✅ {rel_path} - Perfetto ({len(elementi)} elementi)")

        stats['successful'] += 1

    # Report finale
    print("\n" + "=" * 60)
    print("📊 REPORT FINALE NAVIGAZIONE")
    print("=" * 60)

    success_rate = (stats['perfect'] / stats['total_indexes']) * 100 if stats['total_indexes'] > 0 else 0

    print(f"\n📁 Index totali: {stats['total_indexes']}")
    print(f"✅ Perfetti: {stats['perfect']} ({success_rate:.1f}%)")
    print(f"🔧 Funzionanti: {stats['successful']}")
    print(f"⚠️  Warning: {stats['warnings']}")
    print(f"❌ Falliti: {stats['failed']}")

    # Test di ricerca rapida
    print("\n" + "=" * 60)
    print("🔎 TEST RICERCA RAPIDA")
    print("=" * 60)

    test_searches = [
        ("Spadone", "database/equipaggiamento/armi_standard/marziali_mischia"),
        ("Forcone D'arme", "database/equipaggiamento/armi"),
        ("Mago", "database/classi/mago"),
        ("Acquamorte", "database/equipaggiamento/intrugli"),
        ("L'anello del Vescovo Ladrone", "database/equipaggiamento/cimeli")
    ]

    for search_term, expected_path in test_searches:
        found = False
        for index_path in index_files:
            if expected_path in str(index_path):
                data = load_json(index_path)
                if data:
                    for elem in data.get('elementi', []):
                        if search_term.lower() in elem.get('nome', '').lower():
                            print(f"✅ '{search_term}' → Trovato in {index_path.parent.relative_to(base_path)}")
                            found = True
                            break
            if found:
                break

        if not found:
            print(f"❌ '{search_term}' → Non trovato")

    # Suggerimenti finali
    if success_rate == 100:
        print("\n🎉 PERFETTO! Tutti gli index.json sono completamente funzionanti!")
    elif success_rate >= 95:
        print(f"\n✨ ECCELLENTE! Il {success_rate:.1f}% degli index è perfetto.")
    elif success_rate >= 90:
        print(f"\n👍 MOLTO BUONO! Il {success_rate:.1f}% degli index è perfetto.")
    else:
        print(f"\n🔧 Ancora qualche correzione necessaria. Solo il {success_rate:.1f}% è perfetto.")

        if stats['issues']:
            print("\n📋 Problemi principali da risolvere:")
            for i, issue in enumerate(stats['issues'][:10], 1):
                print(f"   {i}. {issue}")

def main():
    """Main function."""
    base_path = Path(__file__).parent.parent / 'database'

    if not base_path.exists():
        print(f"❌ Directory database non trovata: {base_path}")
        return

    test_index_navigation(base_path)

if __name__ == "__main__":
    main()