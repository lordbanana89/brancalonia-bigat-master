#!/usr/bin/env python3

import json
import os

def get_default_img_for_class(filename):
    """Get appropriate icon based on class and feature type"""

    # Default icons for different classes
    class_icons = {
        'barbaro': 'icons/skills/melee/hand-grip-sword-red.webp',
        'bardo': 'icons/skills/trades/music-notes-sound-blue.webp',
        'chierico': 'icons/magic/holy/chalice-glowing-gold.webp',
        'druido': 'icons/magic/nature/root-vine-entangled-thorns.webp',
        'guerriero': 'icons/equipment/weapons/sword-two-handed-cross-blue.webp',
        'ladro': 'icons/skills/trades/thievery-pickpocket-bribery-brown.webp',
        'mago': 'icons/magic/symbols/runes-star-pentagon.webp',
        'monaco': 'icons/skills/melee/unarmed-punch-fist.webp',
        'paladino': 'icons/equipment/shield/heater-crystal-gold.webp',
        'ranger': 'icons/weapons/bows/longbow-recurve-leather.webp',
        'stregone': 'icons/magic/fire/explosion-fireball-large-purple.webp',
        'warlock': 'icons/magic/unholy/orb-beam-pink.webp'
    }

    # Feature-specific icons
    feature_icons = {
        'attacco-extra': 'icons/skills/melee/weapons-crossed-swords-yellow.webp',
        'ira': 'icons/magic/control/buff-strength-muscle-damage.webp',
        'ispirazione': 'icons/magic/sonic/scream-wail-shout-teal.webp',
        'incantesimi': 'icons/magic/symbols/star-pointed-purple.webp',
        'forma-selvatica': 'icons/magic/nature/wolf-paw-glow-large-green.webp',
        'attacco-furtivo': 'icons/skills/melee/strike-dagger-arcane-purple.webp',
        'ki': 'icons/magic/light/orb-lightbulb-white.webp',
        'punizione': 'icons/magic/holy/projectiles-blades-salvo-yellow.webp',
        'nemico': 'icons/skills/targeting/crosshair-creature-red.webp',
        'patrono': 'icons/magic/unholy/hand-fire-skeleton-pink.webp',
        'patto': 'icons/sundries/documents/document-sealed-red.webp',
        'origine': 'icons/magic/lightning/orb-ball-purple.webp',
        'dominio': 'icons/magic/holy/yin-yang-balance-symbol.webp',
        'archetipo': 'icons/sundries/flags/banner-flag-blue.webp',
        'collegio': 'icons/sundries/books/book-embossed-gold-red.webp',
        'tradizione': 'icons/sundries/books/book-open-purple.webp',
        'circolo': 'icons/magic/nature/symbol-moon-stars-white.webp',
        'cammino': 'icons/environment/wilderness/path-dirt.webp',
        'aura': 'icons/magic/holy/barrier-shield-dome-gold.webp',
        'evasione': 'icons/skills/movement/feet-winged-boots-brown.webp',
        'indomito': 'icons/equipment/shield/buckler-wooden-boss-steel.webp',
        'indomabile': 'icons/equipment/shield/buckler-wooden-boss-steel.webp',
        'stile': 'icons/skills/melee/swords-parry-block-yellow.webp',
        'recupero': 'icons/magic/life/heart-shadow-red.webp',
        'azione': 'icons/skills/movement/arrow-upward-yellow.webp',
        'schivata': 'icons/skills/movement/feet-direction-arrows-green.webp',
        'movimento': 'icons/magic/movement/trail-streak-pink.webp',
        'difesa': 'icons/equipment/chest/breastplate-scale-grey.webp',
        'arti-marziali': 'icons/skills/melee/unarmed-punch-fist-yellow.webp',
        'deviare': 'icons/weapons/thrown/arrow-split-y-thin.webp',
        'caduta': 'icons/magic/air/wind-vortex-swirl-blue.webp',
        'lingua': 'icons/skills/social/diplomacy-conversation.webp',
        'corpo': 'icons/magic/life/heart-shadow-purple.webp',
        'anima': 'icons/commodities/gems/gem-faceted-radiant-white.webp',
        'senso': 'icons/magic/perception/eye-ringed-glow-angry-yellow.webp',
        'imposizione': 'icons/magic/life/cross-column-gold.webp',
        'tocco': 'icons/magic/holy/hand-glowing-yellow.webp',
        'giuramento': 'icons/sundries/documents/document-sealed-yellow.webp',
        'intervento': 'icons/magic/holy/angel-winged-humanoid-silver.webp',
        'colpo': 'icons/magic/lightning/bolt-strike-forked-yellow.webp',
        'distruggere': 'icons/magic/death/skull-horned-worn-fire-blue.webp',
        'incanalare': 'icons/magic/symbols/cross-circle-blue.webp',
        'libro': 'icons/sundries/books/book-embossed-bound-brown.webp',
        'signature': 'icons/sundries/documents/document-ink-pen-blue.webp',
        'maestria': 'icons/sundries/books/book-embossed-seal-gold-red.webp',
        'padronanza': 'icons/magic/symbols/star-inverted-yellow.webp',
        'aumento': 'icons/magic/control/buff-flight-wings-blue.webp',
        'fonte': 'icons/magic/water/orb-water-bubbles.webp',
        'punti': 'icons/commodities/currency/coin-inset-snail-silver.webp',
        'metamagia': 'icons/magic/symbols/cog-orange.webp',
        'invocazioni': 'icons/magic/unholy/silhouette-horns-evil.webp',
        'druidico': 'icons/magic/nature/root-vine-entangled-green.webp',
        'esploratore': 'icons/tools/navigation/compass-brass-blue-red.webp',
        'consapevolezza': 'icons/magic/perception/orb-eye-scrying-orange.webp',
        'competenze': 'icons/sundries/gaming/dice-pair-blue.webp',
        'gergo': 'icons/skills/social/theft-pickpocket-bribery.webp',
        'talento': 'icons/magic/control/energy-stream-link-teal.webp',
        'percezione': 'icons/magic/perception/eye-ringed-glow-angry-small-teal.webp',
        'mente': 'icons/magic/control/hypnosis-mesmerism-swirl.webp',
        'fortuna': 'icons/commodities/treasure/token-gold-four-leaf-clover.webp',
        'critico': 'icons/skills/melee/strike-slashes-triple-red.webp',
        'istinto': 'icons/creatures/abilities/paw-print-orange.webp',
        'campione': 'icons/environment/people/hero.webp',
        'perfezione': 'icons/magic/symbols/circled-gem-blue.webp',
        'quiete': 'icons/magic/control/silhouette-grow-blue.webp',
        'purezza': 'icons/magic/water/water-hand.webp',
        'vuoto': 'icons/magic/air/fog-gas-smoke-blue.webp',
        'relentless': 'icons/magic/control/buff-strength-muscle-damage.webp',
        'survivor': 'icons/magic/life/heart-cross-strong-flame-purple.webp',
        'maestro': 'icons/equipment/weapons/sword-guard-gold.webp',
        'jack': 'icons/sundries/gaming/playing-cards-black-gold.webp'
    }

    filename_lower = filename.lower()

    # Check class first
    for class_name, icon in class_icons.items():
        if class_name in filename_lower:
            # Check for specific feature
            for feature, feature_icon in feature_icons.items():
                if feature in filename_lower:
                    return feature_icon
            # Return class default
            return icon

    # Default icon for features
    return 'icons/svg/item-bag.svg'

def fix_missing_img():
    fixed_count = 0

    for root, dirs, files in os.walk('packs'):
        for file in files:
            if file.endswith('.json') and '_source' in root:
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    # Check if img is missing or empty
                    if 'img' not in data or not data.get('img'):
                        # Get appropriate icon
                        if 'class-' in file:
                            data['img'] = get_default_img_for_class(file)
                        elif 'spell' in file:
                            data['img'] = 'icons/magic/symbols/star-pointed-purple.webp'
                        elif 'tratto' in file:
                            data['img'] = 'icons/sundries/documents/document-torn-diagram-tan.webp'
                        elif file == 'index.json':
                            continue  # Skip index files
                        else:
                            # Default for other features
                            data['img'] = 'icons/svg/item-bag.svg'

                        # Save back to file
                        with open(filepath, 'w', encoding='utf-8') as f:
                            json.dump(data, f, ensure_ascii=False, indent=2)

                        print(f"Fixed img for: {file} -> {data['img']}")
                        fixed_count += 1

                except Exception as e:
                    if 'index.json' not in file:
                        print(f"Error processing {filepath}: {e}")

    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == '__main__':
    fix_missing_img()