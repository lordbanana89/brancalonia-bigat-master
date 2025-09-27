#!/usr/bin/env python3

import json
import os
from pathlib import Path

def fix_key_format(file_path):
    """Fix incorrect _key format in JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if '_key' in data:
            old_key = data['_key']
            # Fix common issues
            if '!items!' in old_key:
                data['_key'] = old_key.replace('!items!', '!item!')
            elif '!journal!' in old_key:
                pass  # journal is correct
            elif '!tables!' in old_key:
                data['_key'] = old_key.replace('!tables!', '!table!')
            elif '!actors!' in old_key:
                data['_key'] = old_key.replace('!actors!', '!actor!')
            elif '!macros!' in old_key:
                data['_key'] = old_key.replace('!macros!', '!macro!')
            
            # If key was changed, save the file
            if data['_key'] != old_key:
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                return True, f"Fixed: {old_key} -> {data['_key']}"
        
        return False, "No changes needed"
    except Exception as e:
        return False, f"Error: {e}"

def main():
    packs_dir = Path('packs')
    fixed_count = 0
    error_count = 0
    
    print("🔧 Fixing _key format in all packs")
    print("=" * 50)
    
    for pack_dir in packs_dir.glob('*/_source'):
        pack_name = pack_dir.parent.name
        pack_fixed = 0
        
        for json_file in pack_dir.glob('*.json'):
            fixed, message = fix_key_format(json_file)
            if fixed:
                pack_fixed += 1
                fixed_count += 1
            elif "Error" in message:
                error_count += 1
                print(f"  ❌ {json_file.name}: {message}")
        
        if pack_fixed > 0:
            print(f"✅ {pack_name}: Fixed {pack_fixed} files")
    
    print("=" * 50)
    print(f"📊 Results:")
    print(f"  ✅ Fixed: {fixed_count} files")
    print(f"  ❌ Errors: {error_count} files")
    print(f"✨ Fix complete!")

if __name__ == "__main__":
    main()
