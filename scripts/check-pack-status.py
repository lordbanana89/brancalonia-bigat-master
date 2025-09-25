#!/usr/bin/env python3

import os
import json

def check_packs():
    packs_dir = 'packs'
    results = []

    for pack_name in os.listdir(packs_dir):
        pack_path = os.path.join(packs_dir, pack_name)
        if os.path.isdir(pack_path):
            source_path = os.path.join(pack_path, '_source')

            if os.path.exists(source_path):
                # Count JSON files
                json_files = [f for f in os.listdir(source_path) if f.endswith('.json')]
                count = len(json_files)

                # Check if compiled (CURRENT file exists)
                current_file = os.path.join(pack_path, 'CURRENT')
                if os.path.exists(current_file):
                    status = "✅ COMPILED"
                else:
                    status = "⚠️  NOT COMPILED"

                results.append((pack_name, count, status))

    # Sort and display
    results.sort()
    print("Pack Status Report:")
    print("-" * 50)

    total_compiled = 0
    total_not_compiled = 0

    for pack_name, count, status in results:
        print(f"{status} {pack_name:30} {count:4} items")
        if "✅" in status:
            total_compiled += 1
        else:
            total_not_compiled += 1

    print("-" * 50)
    print(f"Total: {total_compiled} compiled, {total_not_compiled} not compiled")

if __name__ == "__main__":
    check_packs()