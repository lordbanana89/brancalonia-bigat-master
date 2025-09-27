#!/usr/bin/env python3
"""
FIX DND5E REFERENCES - Rimuove TUTTI i riferimenti a dnd5e
"""

import json
from pathlib import Path
import re

def fix_file(file_path):
    """Rimuove riferimenti dnd5e da un file"""
    modified = False

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Controlla se ci sono riferimenti dnd5e
    if 'dnd5e' not in content:
        return False

    # Carica come JSON
    try:
        data = json.loads(content)
    except:
        return False

    # Converti in stringa per replace
    data_str = json.dumps(data, ensure_ascii=False)

    # Pattern per UUID dnd5e
    patterns = [
        (r'"Compendium\.dnd5e\.items\.Item\.[^"]*"', '"Compendium.brancalonia.equipaggiamento.Item.placeholder"'),
        (r'"Compendium\.dnd5e\.rules\.JournalEntry\.[^"]*"', '""'),
        (r'"Compendium\.dnd5e\.spells\.Item\.[^"]*"', '"Compendium.brancalonia.incantesimi.Item.placeholder"'),
        (r'"dnd5e\.[^"]*"', '""')
    ]

    for pattern, replacement in patterns:
        if re.search(pattern, data_str):
            data_str = re.sub(pattern, replacement, data_str)
            modified = True

    if modified:
        # Ricarica come JSON per formattazione
        data = json.loads(data_str)

        # Rimuovi campi vuoti
        def clean_empty(obj):
            if isinstance(obj, dict):
                return {k: clean_empty(v) for k, v in obj.items() if v != "" and v != [] and v != {}}
            elif isinstance(obj, list):
                return [clean_empty(item) for item in obj if item != "" and item != [] and item != {}]
            return obj

        data = clean_empty(data)

        # Salva
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"✅ Fixed: {file_path.name}")
        return True

    return False

def main():
    print("🔧 FIX DND5E REFERENCES")
    print("="*50)

    fixed_count = 0

    # Fix in tutti i pack
    for pack_dir in Path('packs').glob('*/_source'):
        pack_name = pack_dir.parent.name
        print(f"\n📦 Checking pack: {pack_name}")

        for json_file in pack_dir.glob('*.json'):
            if fix_file(json_file):
                fixed_count += 1

    # Fix anche in packs_normalized
    for pack_dir in Path('packs_normalized').glob('*/_source'):
        for json_file in pack_dir.glob('*.json'):
            if fix_file(json_file):
                fixed_count += 1

    print(f"\n✅ Total files fixed: {fixed_count}")
    print("="*50)

if __name__ == "__main__":
    main()