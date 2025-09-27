#!/usr/bin/env python3
import json
import os
import re
import sys

def fix_json_file(filepath):
    """Fix common JSON syntax errors in file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # Fix missing commas after "effetti" arrays in implementazione_foundry
        content = re.sub(r'(\],)\s*\n(\s*)"(\w+)":', r'\1\n\2},\n\2"\3":', content)

        # Fix closing bracket issue - arrays ending with }
        lines = content.split('\n')
        fixed_lines = []
        in_array = False
        array_depth = 0

        for i, line in enumerate(lines):
            # Track array openings
            if '[' in line and not '"[' in line:
                in_array = True
                array_depth += line.count('[')

            # Check for array closing with wrong bracket
            if in_array and '}' in line and not ']' in line and not '{' in line:
                # This line is likely closing an array with }
                line = line.replace('}', ']')
                array_depth -= 1
                if array_depth == 0:
                    in_array = False
            elif ']' in line and not '"]' in line:
                array_depth -= line.count(']')
                if array_depth == 0:
                    in_array = False

            fixed_lines.append(line)

        content = '\n'.join(fixed_lines)

        # Try to parse to verify it's valid
        try:
            json.loads(content)

            # Only write if we actually changed something
            if content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✓ Fixed {filepath}")
                return True
            else:
                print(f"✓ Already valid: {filepath}")
                return True
        except json.JSONDecodeError as e:
            # More aggressive fix - reconstruct the JSON
            print(f"  Attempting deep fix for {filepath}...")
            return deep_fix_json(filepath)

    except Exception as e:
        print(f"✗ Error processing {filepath}: {e}")
        return False

def deep_fix_json(filepath):
    """Deep fix for severely malformed JSON"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        fixed_lines = []
        for i, line in enumerate(lines):
            # Skip lines we'll handle specially
            if i > 0 and i < len(lines) - 1:
                prev_line = lines[i-1].strip()
                next_line = lines[i+1].strip() if i+1 < len(lines) else ""

                # Fix missing comma after array ending
                if line.strip() == ']' and next_line and next_line[0] == '"':
                    fixed_lines.append(line.rstrip() + ',\n')
                # Fix missing comma after closing brace before property
                elif line.strip() == '}' and next_line and next_line[0] == '"' and i < len(lines) - 2:
                    fixed_lines.append(line.rstrip() + ',\n')
                else:
                    fixed_lines.append(line)
            else:
                fixed_lines.append(line)

        content = ''.join(fixed_lines)

        # Final cleanup
        content = re.sub(r'\]\s*\n\s*"', '],\n  "', content)
        content = re.sub(r'\}\s*\n\s*"', '},\n  "', content)

        # Verify it's valid JSON
        json.loads(content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Deep fixed {filepath}")
        return True

    except Exception as e:
        print(f"✗ Deep fix failed for {filepath}: {e}")
        return False

if __name__ == "__main__":
    failed_files = [
        "database/incantesimi/livello_1/spell-charme.json",
        "database/incantesimi/livello_1/spell-comprensione-linguaggi.json",
        "database/incantesimi/livello_1/spell-infliggi-ferite.json",
        "database/incantesimi/livello_1/spell-marchio-incandescente.json",
        "database/incantesimi/livello_1/spell-ritirata-veloce.json",
        "database/incantesimi/livello_2/spell-blocca-persone.json",
        "database/incantesimi/livello_2/spell-esorcismo.json",
        "database/incantesimi/livello_2/spell-levitazione.json",
        "database/incantesimi/livello_2/spell-oscurita.json",
        "database/incantesimi/livello_2/spell-scurovisione.json",
        "database/incantesimi/livello_2/spell-silenzio.json",
        "database/incantesimi/livello_2/spell-suggestione.json",
        "database/incantesimi/livello_3/spell-banchetto-dei-poveri.json",
        "database/incantesimi/livello_3/spell-controincantesimo.json",
        "database/incantesimi/livello_3/spell-emanazione-angelica.json",
        "database/incantesimi/livello_3/spell-mondare.json",
        "database/incantesimi/livello_3/spell-velocita.json",
        "database/incantesimi/livello_4/spell-porta-dimensionale.json"
    ]

    print(f"Fixing {len(failed_files)} malformed JSON files...")
    fixed = 0

    for filepath in failed_files:
        if fix_json_file(filepath):
            fixed += 1

    print(f"\n✓ Fixed {fixed}/{len(failed_files)} files")

    # Verify all files are now valid
    print("\nVerifying all spell files...")
    all_valid = True
    for root, dirs, files in os.walk("database/incantesimi"):
        for file in files:
            if file.endswith('.json'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        json.load(f)
                except json.JSONDecodeError as e:
                    print(f"✗ Still invalid: {filepath} - {e}")
                    all_valid = False

    if all_valid:
        print("✓ All spell files are now valid JSON!")
    else:
        print("✗ Some files still have issues")
        sys.exit(1)