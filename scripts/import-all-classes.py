#!/usr/bin/env python3

import json
import os
import random
import string
from pathlib import Path

def generate_id(length=10):
    """Generate a random alphanumeric ID"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def get_class_icon(class_name):
    """Get appropriate icon for class"""
    icons = {
        "guerriero": "icons/skills/melee/weapons-crossed-swords-black.webp",
        "fighter": "icons/skills/melee/weapons-crossed-swords-black.webp",
        "mago": "icons/magic/symbols/runes-star-blue.webp",
        "wizard": "icons/magic/symbols/runes-star-blue.webp",
        "ladro": "icons/skills/melee/strike-dagger-masked-figure-purple.webp",
        "rogue": "icons/skills/melee/strike-dagger-masked-figure-purple.webp",
        "chierico": "icons/magic/holy/saint-glass-portrait-halo-gold.webp",
        "cleric": "icons/magic/holy/saint-glass-portrait-halo-gold.webp",
        "bardo": "icons/tools/instruments/lute-gold-brown.webp",
        "bard": "icons/tools/instruments/lute-gold-brown.webp",
        "druido": "icons/magic/nature/tree-oak-brown-green.webp",
        "druid": "icons/magic/nature/tree-oak-brown-green.webp",
        "monaco": "icons/skills/melee/unarmed-punch-fist.webp",
        "monk": "icons/skills/melee/unarmed-punch-fist.webp",
        "paladino": "icons/equipment/shield/heater-shield-winged-gold-blue.webp",
        "paladin": "icons/equipment/shield/heater-shield-winged-gold-blue.webp",
        "ranger": "icons/weapons/bows/longbow-recurve-leather-brown.webp",
        "barbaro": "icons/skills/melee/strike-axe-blood-red.webp",
        "barbarian": "icons/skills/melee/strike-axe-blood-red.webp",
        "stregone": "icons/magic/fire/orb-fireball-red-orange.webp",
        "sorcerer": "icons/magic/fire/orb-fireball-red-orange.webp",
        "warlock": "icons/magic/unholy/orb-glowing-purple.webp"
    }

    base_name = class_name.lower().split('_')[0] if '_' in class_name else class_name.lower()
    return icons.get(base_name, "icons/skills/melee/weapons-crossed-swords-purple.webp")

def create_base_class(class_name, variant_data=None):
    """Create a base D&D class document"""

    base_classes_data = {
        "guerriero": {
            "name": "Guerriero",
            "identifier": "fighter",
            "source": "Manuale del Giocatore p.70",
            "description": "Maestro di combattimento con ogni tipo di arma e armatura.",
            "hitDice": "10",
            "saves": ["str", "con"],
            "skills": {
                "number": 2,
                "choices": ["acr", "ani", "ath", "his", "ins", "itm", "prc", "sur"]
            },
            "spellcasting": {"progression": "none", "ability": ""}
        },
        "ladro": {
            "name": "Ladro",
            "identifier": "rogue",
            "source": "Manuale del Giocatore p.94",
            "description": "Furfante abile nell'ombra e nell'inganno.",
            "hitDice": "8",
            "saves": ["dex", "int"],
            "skills": {
                "number": 4,
                "choices": ["acr", "ath", "dec", "ins", "itm", "inv", "prc", "prf", "per", "slt", "ste"]
            },
            "spellcasting": {"progression": "none", "ability": ""}
        },
        "barbaro": {
            "name": "Barbaro",
            "identifier": "barbarian",
            "source": "Manuale del Giocatore p.46",
            "description": "Guerriero selvaggio dalla furia primordiale.",
            "hitDice": "12",
            "saves": ["str", "con"],
            "skills": {
                "number": 2,
                "choices": ["ani", "ath", "itm", "nat", "prc", "sur"]
            },
            "spellcasting": {"progression": "none", "ability": ""}
        }
    }

    if class_name not in base_classes_data:
        return None

    data = base_classes_data[class_name]
    class_id = f"class-{data['identifier']}-{generate_id(6)}"

    return {
        "_id": class_id,
        "_key": f"!items!{class_id}",
        "name": data["name"],
        "type": "class",
        "img": get_class_icon(class_name),
        "system": {
            "description": {
                "value": f"<p><em>{data['description']}</em></p>\n<p>Vedi il Manuale del Giocatore per i dettagli completi.</p>",
                "chat": "",
                "unidentified": ""
            },
            "source": data["source"],
            "identifier": data["identifier"],
            "levels": 20,
            "hitDice": data["hitDice"],
            "hitDiceUsed": 0,
            "advancement": [],
            "saves": data["saves"],
            "skills": data["skills"],
            "spellcasting": data["spellcasting"]
        },
        "effects": [],
        "folder": None,
        "sort": 0,
        "ownership": {"default": 0},
        "flags": {
            "brancalonia": {
                "fonte": data["source"],
                "tipo": "classe_base"
            }
        }
    }

def convert_brancalonia_variant(variant_dir):
    """Convert a Brancalonia variant class"""

    index_file = variant_dir / "index.json"
    if not index_file.exists():
        return None

    with open(index_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # This is actually a subclass, should go to sottoclassi pack
    # For now, we'll skip it
    if data.get('tipo') == 'sottoclasse':
        return None

    # If it's marked as a class variant, create it as a class
    class_name = data.get('nome', 'Unknown')
    class_id = f"class-{class_name.lower().replace(' ', '-')}-{generate_id(6)}"

    description = f"<p><em>{data.get('descrizione', '')}</em></p>\n"
    description += f"<p><strong>Classe Base:</strong> {data.get('classe_base', '')}</p>\n"
    description += f"<p><strong>Fonte:</strong> {data.get('fonte', '')}</p>\n"

    return {
        "_id": class_id,
        "_key": f"!items!{class_id}",
        "name": class_name,
        "type": "class",
        "img": get_class_icon(variant_dir.name),
        "system": {
            "description": {
                "value": description,
                "chat": "",
                "unidentified": ""
            },
            "source": data.get('fonte', 'Brancalonia'),
            "identifier": class_name.lower().replace(' ', '-'),
            "levels": 20,
            "hitDice": "8",  # Default, would need proper mapping
            "hitDiceUsed": 0,
            "advancement": [],
            "saves": [],
            "skills": {"number": 2, "choices": [], "value": []},
            "spellcasting": {"progression": "none", "ability": ""}
        },
        "effects": [],
        "folder": None,
        "sort": 0,
        "ownership": {"default": 0},
        "flags": {
            "brancalonia": {
                "fonte": data.get('fonte', ''),
                "classe_base": data.get('classe_base', ''),
                "tipo": "variante_brancalonia"
            }
        }
    }

def main():
    """Import all classes"""
    print("=== IMPORTING ALL CLASSES TO FOUNDRY FORMAT ===\n")

    database_dir = Path("database/classi")
    output_dir = Path("packs/classi/_source")
    output_dir.mkdir(parents=True, exist_ok=True)

    # Clear existing files
    for f in output_dir.glob("*.json"):
        f.unlink()

    processed = 0

    # First, create the base D&D classes
    print("Creating base D&D classes:")
    for class_name in ["guerriero", "ladro", "barbaro"]:
        doc = create_base_class(class_name)
        if doc:
            output_file = output_dir / f"{class_name}.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(doc, f, indent=2, ensure_ascii=False)
            print(f"  ✅ Created: {class_name}")
            processed += 1

    # Import existing class data
    print("\nImporting from database:")
    for class_dir in database_dir.iterdir():
        if not class_dir.is_dir() or class_dir.name == "dettagli":
            continue

        # Skip variant classes (with underscore) for now
        if '_' in class_dir.name:
            continue

        index_file = class_dir / "index.json"
        if not index_file.exists():
            continue

        with open(index_file, 'r', encoding='utf-8') as f:
            class_data = json.load(f)

        # Skip if already created as base class
        if class_dir.name in ["guerriero", "ladro", "barbaro"]:
            continue

        # Convert to Foundry format
        class_id = f"class-{class_dir.name}-{generate_id(6)}"

        foundry_doc = {
            "_id": class_id,
            "_key": f"!items!{class_id}",
            "name": class_data.get('nome', class_dir.name.capitalize()),
            "type": "class",
            "img": get_class_icon(class_dir.name),
            "system": {
                "description": {
                    "value": f"<p><em>{class_data.get('descrizione', '')}</em></p>",
                    "chat": "",
                    "unidentified": ""
                },
                "source": class_data.get('fonte', 'Brancalonia'),
                "identifier": class_dir.name,
                "levels": 20,
                "hitDice": class_data.get('dado_vita', 'd8').replace('d', ''),
                "hitDiceUsed": 0,
                "advancement": [],
                "saves": [],
                "skills": {"number": 2, "choices": [], "value": []},
                "spellcasting": {"progression": "none", "ability": ""}
            },
            "effects": [],
            "folder": None,
            "sort": 0,
            "ownership": {"default": 0},
            "flags": {
                "brancalonia": {
                    "fonte": class_data.get('fonte', ''),
                    "tipo": "classe"
                }
            }
        }

        # Set spellcasting info
        spellcasters = {
            "mago": {"progression": "full", "ability": "int"},
            "chierico": {"progression": "full", "ability": "wis"},
            "druido": {"progression": "full", "ability": "wis"},
            "bardo": {"progression": "full", "ability": "cha"},
            "stregone": {"progression": "full", "ability": "cha"},
            "warlock": {"progression": "pact", "ability": "cha"},
            "paladino": {"progression": "half", "ability": "cha"},
            "ranger": {"progression": "half", "ability": "wis"}
        }

        if class_dir.name in spellcasters:
            foundry_doc['system']['spellcasting'] = spellcasters[class_dir.name]

        output_file = output_dir / f"{class_dir.name}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(foundry_doc, f, indent=2, ensure_ascii=False)

        print(f"  ✅ Imported: {class_dir.name}")
        processed += 1

    print(f"\n✅ Successfully imported {processed} classes")
    print("\n💡 Brancalonia variants (sottoclassi) should be imported separately to 'sottoclassi' pack")

if __name__ == "__main__":
    main()