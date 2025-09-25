#!/usr/bin/env python3
import os
import json
import re

def fix_json_arrays(filepath):
    """Fix arrays closed with } instead of ]"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    fixed_lines = []
    in_array = False
    array_stack = []  # Track opening braces/brackets

    for i, line in enumerate(lines):
        fixed_line = line

        # Track structure
        for char in line:
            if char == '[':
                array_stack.append('[')
            elif char == '{':
                array_stack.append('{')
            elif char == ']':
                if array_stack and array_stack[-1] == '[':
                    array_stack.pop()
            elif char == '}':
                if array_stack and array_stack[-1] == '{':
                    array_stack.pop()

        # Check for malformed array closings
        stripped = line.strip()

        # Pattern: closing brace when we expect array closing
        if stripped == '},' and array_stack and array_stack[-1] == '[':
            fixed_line = line.replace('},', '],')
            array_stack.pop()  # We fixed it
            print(f"  Fixed line {i+1}: }} -> ]")
        elif stripped == '}' and i < len(lines) - 2:  # Not the final closing
            # Check if next non-empty line starts with quote (new property)
            next_idx = i + 1
            while next_idx < len(lines) and not lines[next_idx].strip():
                next_idx += 1
            if next_idx < len(lines) and lines[next_idx].strip().startswith('"'):
                if array_stack and array_stack[-1] == '[':
                    fixed_line = line.replace('}', '],')
                    array_stack.pop()
                    print(f"  Fixed line {i+1}: }} -> ]")
                else:
                    fixed_line = line.replace('}', '},')
                    print(f"  Added comma at line {i+1}")

        fixed_lines.append(fixed_line)

    return ''.join(fixed_lines)

# Process all problematic files
problem_files = [
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

print("Fixing JSON array syntax issues...")
fixed_count = 0
for filepath in problem_files:
    print(f"\nProcessing {filepath}...")
    try:
        content = fix_json_arrays(filepath)

        # Validate JSON
        json.loads(content)

        # Write fixed content
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Fixed and saved {filepath}")
        fixed_count += 1
    except json.JSONDecodeError as e:
        print(f"✗ Still invalid: {e}")
    except Exception as e:
        print(f"✗ Error: {e}")

print(f"\n✓ Successfully fixed {fixed_count}/{len(problem_files)} files")

# Final validation
print("\nFinal validation...")
all_valid = True
for filepath in problem_files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            json.load(f)
    except json.JSONDecodeError as e:
        print(f"✗ {filepath}: {e}")
        all_valid = False

if all_valid:
    print("✓ All files are now valid JSON!")