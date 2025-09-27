#!/usr/bin/env python3

import json
import os
from pathlib import Path
from collections import defaultdict

def remove_duplicates_from_pack(pack_dir):
    """Remove duplicate items from a pack, keeping the most complete version"""
    ids = defaultdict(list)
    removed = []
    
    # Find all files and their IDs
    for f in pack_dir.glob('*.json'):
        try:
            data = json.load(open(f))
            if '_id' in data:
                ids[data['_id']].append((f, data))
        except Exception as e:
            print(f"  Error reading {f.name}: {e}")
    
    # Process duplicates
    for item_id, files in ids.items():
        if len(files) > 1:
            # Keep the file with the most data (largest)
            files_sorted = sorted(files, key=lambda x: len(json.dumps(x[1])), reverse=True)
            keep = files_sorted[0][0]
            
            for file_path, _ in files_sorted[1:]:
                removed.append(file_path.name)
                file_path.unlink()  # Delete the duplicate
                
    return removed

def main():
    print("🔧 Rimozione duplicati da tutti i pack")
    print("=" * 50)
    
    total_removed = 0
    
    for pack_dir in Path('packs').glob('*/_source'):
        pack_name = pack_dir.parent.name
        removed = remove_duplicates_from_pack(pack_dir)
        
        if removed:
            print(f"✅ {pack_name}: Rimossi {len(removed)} duplicati")
            for f in removed[:5]:  # Show first 5
                print(f"    - {f}")
            if len(removed) > 5:
                print(f"    ... e altri {len(removed)-5}")
            total_removed += len(removed)
    
    print("=" * 50)
    print(f"📊 Totale duplicati rimossi: {total_removed}")
    print("✨ Pulizia completata!")

if __name__ == "__main__":
    main()
