#!/usr/bin/env python3

import json
import os
from pathlib import Path

# Map broken icons to working alternatives
ICON_FIXES = {
    # Weapons and combat
    "icons/skills/melee/weapons-crossed-swords-blue.webp": "icons/skills/melee/weapons-crossed-swords-black.webp",
    "icons/skills/melee/weapons-crossed-swords-purple.webp": "icons/skills/melee/weapons-crossed-swords-black.webp",
    "icons/skills/melee/unarmed-punch-fist-yellow.webp": "icons/skills/melee/unarmed-punch-fist.webp",

    # Creatures
    "icons/creatures/humanoids/human-villager-green.webp": "icons/creatures/humanoids/humanoid-standing-green.webp",
    "icons/creatures/mammals/wolf-black-howl.webp": "icons/creatures/mammals/wolf-howl.webp",
    "icons/creatures/aberrations/beast-tentacles-eyes-red.webp": "icons/creatures/aberrations/eye-tentacle-green.webp",
    "icons/creatures/magical/construct-stone-earth-golem.webp": "icons/creatures/magical/construct-stone-tan-blue.webp",
    "icons/creatures/undead/ghost-ghoul-gray.webp": "icons/creatures/undead/ghost-blue.webp",
    "icons/creatures/magical/fae-fairy-winged-glowing.webp": "icons/creatures/magical/fairy-pixie-blue-green.webp",
    "icons/creatures/giants/giant-stone-club.webp": "icons/creatures/magical/giant-stone-green.webp",
    "icons/creatures/unholy/demon-horned-winged-pink.webp": "icons/creatures/unholy/demon-horned-winged-purple.webp",

    # Skills
    "icons/skills/yellow/affinity-puzzle.webp": "icons/skills/trades/gaming-gambling-dice-gray.webp",
    "icons/skills/social/theft-pickpocket-bribery.webp": "icons/skills/social/theft-pickpocket-bribery-brown.webp",
    "icons/skills/movement/feet-sprint-barefoot-sand.webp": "icons/skills/movement/feet-winged-boots-brown.webp",

    # Equipment
    "icons/equipment/shield/heater-shield-steel-worn.webp": "icons/equipment/shield/heater-steel-sword.webp",
    "icons/equipment/shield/heater-shield-winged-gold-blue.webp": "icons/equipment/shield/heater-steel-sword.webp",
    "icons/equipment/weapons/sword-two-handed-damaged.webp": "icons/weapons/swords/greatsword-guard.webp",

    # Containers
    "icons/containers/bags/pack-leather-black-white.webp": "icons/containers/bags/pack-leather-brown-tan.webp",

    # Environment
    "icons/environment/settlement/tavern-interior.webp": "icons/environment/settlement/building-house.webp",

    # Tools
    "icons/tools/hand/shovel-spade-brown-grey.webp": "icons/tools/hand/shovel-spade-wood-brown.webp",

    # Weapons
    "icons/weapons/bows/longbow-recurve-leather-brown.webp": "icons/weapons/bows/bow-recurve-brown.webp",

    # Magic
    "icons/magic/symbols/runes-star-blue.webp": "icons/magic/symbols/rune-sigil-blue.webp",
    "icons/magic/nature/tree-oak-brown-green.webp": "icons/magic/nature/tree-elm-green.webp",
    "icons/magic/holy/saint-glass-portrait-halo-gold.webp": "icons/magic/holy/chalice-glowing-gold.webp",
    "icons/magic/fire/orb-fireball-red-orange.webp": "icons/magic/fire/orb-orange-2.webp",
    "icons/magic/unholy/orb-glowing-purple.webp": "icons/magic/unholy/orb-glowing-green.webp",

    # Instruments
    "icons/tools/instruments/lute-gold-brown.webp": "icons/tools/instruments/lute-brown.webp",

    # Melee
    "icons/skills/melee/strike-dagger-masked-figure-purple.webp": "icons/skills/melee/strike-dagger-arcane-pink.webp",
    "icons/skills/melee/strike-axe-blood-red.webp": "icons/skills/melee/strike-axe-yellow.webp"
}

def fix_icons_in_file(filepath):
    """Fix icon paths in a single file"""
    modified = False

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Check main img field
    if 'img' in data and data['img'] in ICON_FIXES:
        old_icon = data['img']
        data['img'] = ICON_FIXES[old_icon]
        print(f"  Fixed: {old_icon} -> {data['img']}")
        modified = True

    # Check system.img if exists
    if 'system' in data and 'img' in data['system'] and data['system']['img'] in ICON_FIXES:
        old_icon = data['system']['img']
        data['system']['img'] = ICON_FIXES[old_icon]
        print(f"  Fixed system.img: {old_icon} -> {data['system']['img']}")
        modified = True

    # Check items in system if exists
    if 'system' in data and 'items' in data['system']:
        for item in data['system']['items']:
            if 'img' in item and item['img'] in ICON_FIXES:
                old_icon = item['img']
                item['img'] = ICON_FIXES[old_icon]
                print(f"  Fixed item img: {old_icon} -> {item['img']}")
                modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    return modified

def fix_all_packs():
    """Fix icons in all packs"""
    packs_dir = Path("packs")
    total_fixed = 0

    for pack_dir in packs_dir.iterdir():
        if not pack_dir.is_dir():
            continue

        source_dir = pack_dir / "_source"
        if not source_dir.exists():
            continue

        print(f"\nChecking {pack_dir.name}...")
        pack_fixed = 0

        for json_file in source_dir.glob("*.json"):
            if fix_icons_in_file(json_file):
                pack_fixed += 1

        if pack_fixed > 0:
            print(f"  ✅ Fixed {pack_fixed} files")
            total_fixed += pack_fixed
        else:
            print(f"  ✓ No fixes needed")

    return total_fixed

if __name__ == "__main__":
    print("=== FIXING ICON PATHS ===")

    total = fix_all_packs()

    print(f"\n✅ Total files fixed: {total}")

    if total > 0:
        print("\n⚠️  Remember to recompile the packs!")