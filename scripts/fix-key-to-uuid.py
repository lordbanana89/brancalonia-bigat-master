#!/usr/bin/env python3
"""
FIX KEY TO UUID - Converte tutti i campi 'key' in 'uuid' per compatibilità D&D 5e
"""

import json
import os
from pathlib import Path

def fix_file(file_path):
    """Converte 'key' in 'uuid' in un file JSON"""
    changed = False

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Controlla startingEquipment
    if 'system' in data and 'startingEquipment' in data['system']:
        for item in data['system']['startingEquipment']:
            if 'key' in item and 'uuid' not in item:
                item['uuid'] = item['key']
                del item['key']
                changed = True
                print(f"  ✅ Convertito key->uuid in {file_path.name}")

    if changed:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    return changed

def main():
    print("🔧 FIX KEY TO UUID - Conversione per compatibilità D&D 5e")

    # Lista di pack da controllare
    packs = ['backgrounds', 'classi', 'razze', 'sottoclassi']

    total_fixed = 0

    for pack in packs:
        pack_path = Path(f"packs/{pack}/_source")
        if not pack_path.exists():
            continue

        print(f"\n📦 Processando pack: {pack}")

        for json_file in pack_path.glob("*.json"):
            if fix_file(json_file):
                total_fixed += 1

    print(f"\n✅ Totale file corretti: {total_fixed}")

if __name__ == "__main__":
    main()