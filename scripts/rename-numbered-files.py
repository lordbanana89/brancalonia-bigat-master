#!/usr/bin/env python3

import os
import re

def rename_numbered_files(directory):
    renamed = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.json') and re.match(r'^\d', file):
                old_path = os.path.join(root, file)
                new_name = 'item_' + file
                new_path = os.path.join(root, new_name)

                # Rename file
                os.rename(old_path, new_path)
                print(f"Renamed: {file} -> {new_name}")
                renamed += 1

    return renamed

# Process packs directory
packs_dir = "packs"
renamed_count = rename_numbered_files(packs_dir)

print(f"\nTotal renamed: {renamed_count}")