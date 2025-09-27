#!/usr/bin/env python3

import os
import json
import subprocess
import tempfile
import shutil

def test_file(filepath):
    """Test if a single file can be packed"""
    with tempfile.TemporaryDirectory() as tmpdir:
        # Copy file to temp dir
        filename = os.path.basename(filepath)
        temp_file = os.path.join(tmpdir, filename)
        shutil.copy2(filepath, temp_file)

        # Try to pack it
        result = subprocess.run(
            ['fvtt', 'package', 'pack', 'test.pack', '--in', tmpdir, '--out', tmpdir],
            capture_output=True,
            text=True
        )

        return 'Failed' not in result.stderr

def main():
    source_dir = 'packs/regole/_source'
    failed_files = []

    for filename in os.listdir(source_dir):
        if filename.endswith('.json'):
            filepath = os.path.join(source_dir, filename)
            print(f"Testing {filename}...", end=' ')

            if test_file(filepath):
                print("✅ OK")
            else:
                print("❌ FAILED")
                failed_files.append(filename)

                # Show file structure for failed files
                try:
                    with open(filepath) as f:
                        data = json.load(f)
                        print(f"  _id: {data.get('_id', 'MISSING')}")
                        print(f"  _key: {data.get('_key', 'MISSING')}")
                        print(f"  type: {data.get('type', 'MISSING')}")
                except Exception as e:
                    print(f"  Error reading: {e}")

    print(f"\n\nSummary: {len(failed_files)} failed files")
    if failed_files:
        print("Failed files:", failed_files[:10])

if __name__ == "__main__":
    main()