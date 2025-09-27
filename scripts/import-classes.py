#!/usr/bin/env python3

import json
import os
import random
import string
from pathlib import Path

def generate_id(length=10):
    """Generate a random alphanumeric ID"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def convert_class_to_foundry(class_data, class_dir):
    """Convert a class from database format to Foundry format"""

    # Map D&D classes to their English names
    class_mapping = {
        "mago": "wizard",
        "guerriero": "fighter",
        "ladro": "rogue",
        "chierico": "cleric",
        "bardo": "bard",
        "druido": "druid",
        "monaco": "monk",
        "paladino": "paladin",
        "ranger": "ranger",
        "barbaro": "barbarian",
        "stregone": "sorcerer",
        "warlock": "warlock"
    }

    # Generate ID
    class_id = f"class-{class_data.get('nome', '').lower().replace(' ', '-')}-{generate_id(6)}"

    # Build description HTML
    description = f"<p><em>{class_data.get('descrizione', '')}</em></p>\n"

    if 'dado_vita' in class_data:
        description += f"<p><strong>Dado Vita:</strong> {class_data['dado_vita']}</p>\n"

    if 'punti_ferita' in class_data:
        pf = class_data['punti_ferita']
        description += f"<p><strong>Punti Ferita al 1° livello:</strong> {pf.get('al_1_livello', '')}</p>\n"
        description += f"<p><strong>Punti Ferita ai livelli successivi:</strong> {pf.get('livelli_successivi', '')}</p>\n"

    if 'competenze' in class_data:
        comp = class_data['competenze']
        description += "<h3>Competenze</h3>\n"
        description += f"<p><strong>Armature:</strong> {comp.get('armature', 'Nessuna')}</p>\n"

        if 'armi' in comp and comp['armi']:
            description += f"<p><strong>Armi:</strong> {', '.join(comp['armi'])}</p>\n"

        if 'tiri_salvezza' in comp:
            description += f"<p><strong>Tiri Salvezza:</strong> {', '.join(comp['tiri_salvezza'])}</p>\n"

        if 'abilita' in comp:
            ab = comp['abilita']
            description += f"<p><strong>Abilità:</strong> Scegli {ab.get('numero', 2)} tra: {', '.join(ab.get('scelte', []))}</p>\n"

    if 'equipaggiamento_iniziale' in class_data:
        description += "<h3>Equipaggiamento Iniziale</h3>\n<ul>\n"
        for item in class_data['equipaggiamento_iniziale']:
            description += f"<li>{item}</li>\n"
        description += "</ul>\n"

    # Get the base class identifier
    base_class = class_data.get('nome', '').lower()
    if base_class in class_mapping:
        identifier = class_mapping[base_class]
    else:
        # For Brancalonia-specific classes
        identifier = base_class.replace(' ', '-')

    # Create Foundry class document
    foundry_doc = {
        "_id": class_id,
        "_key": f"!items!{class_id}",
        "name": class_data.get('nome', 'Unknown Class'),
        "type": "class",
        "img": "icons/skills/melee/weapons-crossed-swords-purple.webp",  # Default class icon
        "system": {
            "description": {
                "value": description,
                "chat": "",
                "unidentified": ""
            },
            "source": class_data.get('fonte', 'Brancalonia'),
            "identifier": identifier,
            "levels": 20,  # Standard D&D 5e max level
            "hitDice": class_data.get('dado_vita', 'd8').replace('d', ''),
            "hitDiceUsed": 0,
            "advancement": [],  # Will be populated with class features
            "saves": [],  # Will be populated based on competenze.tiri_salvezza
            "skills": {
                "number": class_data.get('competenze', {}).get('abilita', {}).get('numero', 2),
                "choices": [],  # Will be populated based on competenze.abilita.scelte
                "value": []
            },
            "spellcasting": {
                "progression": "none",  # Will be set based on class type
                "ability": ""
            }
        },
        "effects": [],
        "folder": None,
        "sort": 0,
        "ownership": {
            "default": 0
        },
        "flags": {
            "brancalonia": {
                "fonte": class_data.get('fonte', ''),
                "validazione": class_data.get('validazione', {}),
                "tipo": "classe_base"
            }
        }
    }

    # Set saves based on competenze.tiri_salvezza
    if 'competenze' in class_data and 'tiri_salvezza' in class_data['competenze']:
        save_mapping = {
            "Forza": "str",
            "Destrezza": "dex",
            "Costituzione": "con",
            "Intelligenza": "int",
            "Saggezza": "wis",
            "Carisma": "cha"
        }
        for save in class_data['competenze']['tiri_salvezza']:
            if save in save_mapping:
                foundry_doc['system']['saves'].append(save_mapping[save])

    # Set skills based on competenze.abilita
    if 'competenze' in class_data and 'abilita' in class_data['competenze']:
        skill_mapping = {
            "Acrobazia": "acr",
            "Addestrare Animali": "ani",
            "Arcano": "arc",
            "Atletica": "ath",
            "Furtività": "ste",
            "Indagare": "inv",
            "Inganno": "dec",
            "Intimidire": "itm",
            "Intuizione": "ins",
            "Investigazione": "inv",
            "Medicina": "med",
            "Natura": "nat",
            "Percezione": "prc",
            "Persuasione": "per",
            "Rapidità di Mano": "slt",
            "Religione": "rel",
            "Sopravvivenza": "sur",
            "Storia": "his",
            "Intrattenere": "prf"
        }

        for skill in class_data['competenze']['abilita'].get('scelte', []):
            if skill in skill_mapping:
                foundry_doc['system']['skills']['choices'].append(skill_mapping[skill])

    # Set spellcasting based on class type
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

    base_name = class_data.get('nome', '').lower()
    if base_name in spellcasters:
        foundry_doc['system']['spellcasting'] = spellcasters[base_name]

    return foundry_doc

def process_classes():
    """Process all classes from database to Foundry format"""

    database_dir = Path("database/classi")
    output_dir = Path("packs/classi/_source")

    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)

    processed_count = 0

    # List of base D&D classes
    base_classes = ["mago", "guerriero", "ladro", "chierico", "bardo", "druido",
                   "monaco", "paladino", "ranger", "barbaro", "stregone", "warlock"]

    for class_name in base_classes:
        class_dir = database_dir / class_name
        if not class_dir.exists():
            print(f"⚠️  Directory not found: {class_dir}")
            continue

        index_file = class_dir / "index.json"
        if not index_file.exists():
            print(f"⚠️  No index.json found for {class_name}")
            continue

        # Load class data
        with open(index_file, 'r', encoding='utf-8') as f:
            class_data = json.load(f)

        # Convert to Foundry format
        foundry_doc = convert_class_to_foundry(class_data, class_dir)

        # Save to output
        output_file = output_dir / f"{class_name}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(foundry_doc, f, indent=2, ensure_ascii=False)

        print(f"✅ Processed: {class_name} -> {foundry_doc['_id']}")
        processed_count += 1

    # Also process Brancalonia variant classes (with underscore)
    for dir_name in os.listdir(database_dir):
        if '_' in dir_name:  # These are Brancalonia variants like "spadaccino_guerriero"
            continue  # Skip subclasses for now

    return processed_count

if __name__ == "__main__":
    print("=== IMPORTING CLASSES TO FOUNDRY FORMAT ===\n")

    count = process_classes()

    print(f"\n✅ Successfully imported {count} classes")
    print("\n💡 Note: Subclasses should be imported to the 'sottoclassi' pack")