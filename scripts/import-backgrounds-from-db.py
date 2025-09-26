#!/usr/bin/env python3

import json
import os
from pathlib import Path

def convert_background_from_db(db_file):
    """Convert a background from database format to Foundry format"""

    with open(db_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Generate ID from filename
    filename = os.path.basename(db_file)
    bg_id = filename.replace('.json', '').replace('_', '-')

    # Build description
    description = f"<p><em>{data.get('descrizione', '')}</em></p>\n"

    # Add skill proficiencies
    if 'competenze' in data and 'abilita' in data['competenze']:
        skills = data['competenze']['abilita']
        if isinstance(skills, list) and skills:
            description += f"<p><strong>Competenze Abilità:</strong> {', '.join(skills)}</p>\n"

    # Add tool proficiencies
    if 'competenze' in data and 'strumenti' in data['competenze']:
        tools = data['competenze']['strumenti']
        if tools:
            description += f"<p><strong>Competenze Strumenti:</strong> {tools}</p>\n"

    # Add languages
    if 'competenze' in data and 'lingue' in data['competenze']:
        langs = data['competenze']['lingue']
        if langs:
            description += f"<p><strong>Lingue:</strong> {langs}</p>\n"

    # Add equipment
    if 'equipaggiamento' in data:
        equip = data['equipaggiamento']
        if isinstance(equip, list) and equip:
            description += "<p><strong>Equipaggiamento:</strong></p>\n<ul>\n"
            for item in equip:
                description += f"<li>{item}</li>\n"
            description += "</ul>\n"
        elif isinstance(equip, str):
            description += f"<p><strong>Equipaggiamento:</strong> {equip}</p>\n"

    # Add feature
    if 'privilegio' in data:
        priv = data['privilegio']
        description += f"<h3>{priv.get('nome', 'Privilegio')}</h3>\n"
        description += f"<p>{priv.get('descrizione', '')}</p>\n"

    # Create Foundry document
    foundry_doc = {
        "_id": bg_id,
        "_key": f"!items!{bg_id}",
        "name": data.get('nome', 'Unknown'),
        "type": "background",
        "img": "icons/skills/trades/academics-study-reading-book.webp",
        "system": {
            "description": {
                "value": description,
                "chat": "",
                "unidentified": ""
            },
            "source": data.get('fonte', 'Brancalonia'),
            "identifier": bg_id,
            "advancement": []
        },
        "effects": [],
        "folder": None,
        "sort": 0,
        "ownership": {
            "default": 0
        },
        "flags": {
            "brancalonia": {
                "fonte": data.get('fonte', ''),
                "tipo": "background",
                "database_source": True
            }
        }
    }

    # Add advancement for skills if present
    if 'competenze' in data and 'abilita' in data['competenze']:
        skills = data['competenze']['abilita']
        if isinstance(skills, list) and skills:
            # Map Italian skill names to D&D 5e codes
            skill_map = {
                "Acrobazia": "acr",
                "Addestrare Animali": "ani",
                "Arcano": "arc",
                "Atletica": "ath",
                "Furtività": "ste",
                "Indagare": "inv",
                "Inganno": "dec",
                "Intimidire": "itm",
                "Intrattenere": "prf",
                "Intuizione": "ins",
                "Investigare": "inv",
                "Medicina": "med",
                "Natura": "nat",
                "Percezione": "prc",
                "Persuasione": "per",
                "Rapidità di Mano": "slt",
                "Religione": "rel",
                "Sopravvivenza": "sur",
                "Storia": "his"
            }

            fixed_skills = []
            for skill in skills:
                if skill in skill_map:
                    fixed_skills.append(skill_map[skill])

            if fixed_skills:
                import random
                import string

                adv_id = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
                foundry_doc['system']['advancement'].append({
                    "_id": adv_id,
                    "type": "Improvement",
                    "configuration": {
                        "skills": {
                            "chosen": [],
                            "fixed": fixed_skills
                        }
                    },
                    "value": {},
                    "level": 0,
                    "title": "",
                    "classRestriction": "",
                    "appliedEffects": []
                })

    return foundry_doc

def main():
    """Import all backgrounds from database to pack source"""

    db_dir = Path("database/backgrounds")
    output_dir = Path("packs/backgrounds/_source")

    # List of background files to import (excluding index.json)
    new_backgrounds = [
        "cacciatore_di_reliquie.json",
        "impresario.json",
        "innamorato.json",
        "lucignolo.json",
        "passatore.json",
        "prelato.json",
        "staffetta.json"
    ]

    imported = 0

    for bg_file in new_backgrounds:
        db_path = db_dir / bg_file

        if not db_path.exists():
            print(f"⚠️  Not found: {bg_file}")
            continue

        # Convert to Foundry format
        foundry_doc = convert_background_from_db(db_path)

        # Save to output
        output_file = output_dir / bg_file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(foundry_doc, f, indent=2, ensure_ascii=False)

        print(f"✅ Imported: {foundry_doc['name']} ({bg_file})")
        imported += 1

    print(f"\n✅ Imported {imported} new backgrounds from database")

if __name__ == "__main__":
    print("=== IMPORTING NEW BACKGROUNDS FROM DATABASE ===\n")
    main()