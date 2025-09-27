#!/usr/bin/env python3

import os
import json

def rename_files_and_fix_ids(directory):
    renamed = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.json') and '-' in file:
                old_path = os.path.join(root, file)
                new_name = file.replace('-', '')
                new_path = os.path.join(root, new_name)

                # Rename file
                os.rename(old_path, new_path)
                print(f"Renamed: {file} -> {new_name}")
                renamed += 1

    return renamed

# Process packs directory
packs_dir = "packs"
renamed_count = rename_files_and_fix_ids(packs_dir)

# Process packs_normalized directory
packs_normalized_dir = "packs_normalized"
renamed_normalized = rename_files_and_fix_ids(packs_normalized_dir)

print(f"\nTotal renamed in packs: {renamed_count}")
print(f"Total renamed in packs_normalized: {renamed_normalized}")