#!/usr/bin/env python3

import json
import os
import random
import string
from pathlib import Path

def generate_advancement_id():
    """Generate a valid 16-character advancement ID"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=16))

def convert_full_background(db_path):
    """Convert a background from database format to complete Foundry format"""

    with open(db_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Generate ID from filename
    filename = os.path.basename(db_path)
    bg_id = filename.replace('.json', '').replace('_', '-')

    # Build comprehensive description
    description = f"<p><em>{data.get('descrizione', '')}</em></p>\n\n"

    # Add introduction text if available
    if 'testo' in data and 'introduzione' in data['testo']:
        intro = data['testo']['introduzione']
        if isinstance(intro, list):
            for paragraph in intro:
                description += f"<p>{paragraph}</p>\n"

    # Add skill proficiencies
    if 'meccaniche' in data and 'competenze_abilita' in data['meccaniche']:
        skill_desc = data['meccaniche']['competenze_abilita'].get('descrizione', '')
        description += f"<p><strong>Competenze Abilità:</strong> {skill_desc}</p>\n"

    # Add tool proficiencies
    if 'meccaniche' in data and 'competenze_strumenti' in data['meccaniche']:
        tool_desc = data['meccaniche']['competenze_strumenti'].get('descrizione', '')
        description += f"<p><strong>Competenze Strumenti:</strong> {tool_desc}</p>\n"

    # Add languages
    if 'meccaniche' in data and 'linguaggi' in data['meccaniche']:
        lang_desc = data['meccaniche']['linguaggi'].get('descrizione', '')
        description += f"<p><strong>Linguaggi:</strong> {lang_desc}</p>\n"

    # Add equipment
    if 'dettagli' in data and 'equipaggiamento' in data['dettagli']:
        equip = data['dettagli']['equipaggiamento']
        description += "<p><strong>Equipaggiamento:</strong></p>\n<ul>\n"
        for item in equip:
            description += f"<li>{item}</li>\n"
        description += "</ul>\n\n"

    # Add feature/privilege
    if 'testo' in data and 'privilegio' in data['testo']:
        priv = data['testo']['privilegio']
        description += f"<h3>Privilegio: {priv.get('nome', 'Privilegio del Background')}</h3>\n"
        description += f"<p>{priv.get('descrizione', '')}</p>\n\n"

    # Add characterization tables
    if 'caratterizzazione' in data:
        caratteri = data['caratterizzazione']

        # Personality Traits
        if 'tratti' in caratteri:
            description += "<h3>Tratti della Personalità</h3>\n"
            if isinstance(caratteri['tratti'], dict):
                description += f"<table><thead><tr><th>{caratteri['tratti'].get('dado', 'd8')}</th><th>Tratto</th></tr></thead><tbody>\n"
                for i, tratto in enumerate(caratteri['tratti'].get('voci', []), 1):
                    description += f"<tr><td>{i}</td><td>{tratto}</td></tr>\n"
            else:  # It's a list
                description += "<table><thead><tr><th>d8</th><th>Tratto</th></tr></thead><tbody>\n"
                for i, tratto in enumerate(caratteri['tratti'], 1):
                    description += f"<tr><td>{i}</td><td>{tratto}</td></tr>\n"
            description += "</tbody></table>\n\n"

        # Ideals
        if 'ideali' in caratteri:
            description += "<h3>Ideali</h3>\n"
            if isinstance(caratteri['ideali'], dict):
                description += f"<table><thead><tr><th>{caratteri['ideali'].get('dado', 'd6')}</th><th>Ideale</th></tr></thead><tbody>\n"
                for i, ideale in enumerate(caratteri['ideali'].get('voci', []), 1):
                    description += f"<tr><td>{i}</td><td>{ideale}</td></tr>\n"
            else:  # It's a list
                description += "<table><thead><tr><th>d6</th><th>Ideale</th></tr></thead><tbody>\n"
                for i, ideale in enumerate(caratteri['ideali'], 1):
                    description += f"<tr><td>{i}</td><td>{ideale}</td></tr>\n"
            description += "</tbody></table>\n\n"

        # Bonds
        if 'legami' in caratteri:
            description += "<h3>Legami</h3>\n"
            if isinstance(caratteri['legami'], dict):
                description += f"<table><thead><tr><th>{caratteri['legami'].get('dado', 'd6')}</th><th>Legame</th></tr></thead><tbody>\n"
                for i, legame in enumerate(caratteri['legami'].get('voci', []), 1):
                    description += f"<tr><td>{i}</td><td>{legame}</td></tr>\n"
            else:  # It's a list
                description += "<table><thead><tr><th>d6</th><th>Legame</th></tr></thead><tbody>\n"
                for i, legame in enumerate(caratteri['legami'], 1):
                    description += f"<tr><td>{i}</td><td>{legame}</td></tr>\n"
            description += "</tbody></table>\n\n"

        # Flaws
        if 'difetti' in caratteri:
            description += "<h3>Difetti</h3>\n"
            if isinstance(caratteri['difetti'], dict):
                description += f"<table><thead><tr><th>{caratteri['difetti'].get('dado', 'd6')}</th><th>Difetto</th></tr></thead><tbody>\n"
                for i, difetto in enumerate(caratteri['difetti'].get('voci', []), 1):
                    description += f"<tr><td>{i}</td><td>{difetto}</td></tr>\n"
            else:  # It's a list
                description += "<table><thead><tr><th>d6</th><th>Difetto</th></tr></thead><tbody>\n"
                for i, difetto in enumerate(caratteri['difetti'], 1):
                    description += f"<tr><td>{i}</td><td>{difetto}</td></tr>\n"
            description += "</tbody></table>\n"

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
                "database_complete": True
            }
        }
    }

    # Add advancements based on database structure
    if 'avanzamento' in data:
        # Skill advancement
        skill_adv = next((a for a in data['avanzamento'] if a.get('tipo') == 'competenze_abilita'), None)
        if skill_adv and 'abilita' in skill_adv:
            skill_map = {
                "acrobazia": "acr",
                "addestrare animali": "ani",
                "arcano": "arc",
                "atletica": "ath",
                "furtività": "ste",
                "furtivita": "ste",
                "indagare": "inv",
                "inganno": "dec",
                "intimidire": "itm",
                "intrattenere": "prf",
                "intuizione": "ins",
                "investigare": "inv",
                "medicina": "med",
                "natura": "nat",
                "percezione": "prc",
                "persuasione": "per",
                "rapidità di mano": "slt",
                "rapidita di mano": "slt",
                "religione": "rel",
                "sopravvivenza": "sur",
                "storia": "his"
            }

            fixed_skills = []
            for skill in skill_adv['abilita']:
                skill_lower = skill.lower()
                if skill_lower in skill_map:
                    fixed_skills.append(skill_map[skill_lower])

            if fixed_skills:
                foundry_doc['system']['advancement'].append({
                    "_id": generate_advancement_id(),
                    "type": "Improvement",
                    "configuration": {
                        "skills": {
                            "chosen": [],
                            "fixed": fixed_skills
                        }
                    },
                    "value": {},
                    "level": 0,
                    "title": "Competenze del Background",
                    "classRestriction": "",
                    "appliedEffects": []
                })

        # Tool proficiencies advancement
        tool_adv = next((a for a in data['avanzamento'] if a.get('tipo') == 'competenze_strumenti'), None)
        if tool_adv:
            if tool_adv.get('scelte', 0) > 0:
                # Choice-based tool proficiency
                foundry_doc['system']['advancement'].append({
                    "_id": generate_advancement_id(),
                    "type": "Improvement",
                    "configuration": {
                        "tools": {
                            "chosen": {
                                "count": tool_adv.get('scelte', 1),
                                "pool": ["artisan"]  # Artisan tools
                            },
                            "fixed": []
                        }
                    },
                    "value": {},
                    "level": 0,
                    "title": "Strumenti del Background",
                    "classRestriction": "",
                    "appliedEffects": []
                })

        # Language advancement
        lang_adv = next((a for a in data['avanzamento'] if a.get('tipo') == 'linguaggi'), None)
        if lang_adv and 'elenco' in lang_adv:
            # Map language names
            lang_map = {
                "baccaglio": "cant",  # Thieves' cant equivalent
                "maccheronico": "latin",  # Church latin equivalent
                "petroglifico": "primordial"  # Ancient language equivalent
            }

            fixed_langs = []
            for lang in lang_adv['elenco']:
                mapped = lang_map.get(lang.lower(), lang.lower())
                fixed_langs.append(mapped)

            if fixed_langs:
                foundry_doc['system']['advancement'].append({
                    "_id": generate_advancement_id(),
                    "type": "Improvement",
                    "configuration": {
                        "languages": {
                            "chosen": [],
                            "fixed": fixed_langs
                        }
                    },
                    "value": {},
                    "level": 0,
                    "title": "Linguaggi del Background",
                    "classRestriction": "",
                    "appliedEffects": []
                })

        # Feature/Privilege as ItemGrant
        priv_adv = next((a for a in data['avanzamento'] if a.get('tipo') == 'privilegio'), None)
        if priv_adv:
            # Create a feature item grant
            foundry_doc['system']['advancement'].append({
                "_id": generate_advancement_id(),
                "type": "ItemGrant",
                "configuration": {
                    "items": [],  # Will be linked to actual feature items
                    "optional": False,
                    "spell": None
                },
                "value": {},
                "level": 0,
                "title": priv_adv.get('nome', 'Privilegio del Background'),
                "classRestriction": "",
                "appliedEffects": []
            })

    return foundry_doc

def main():
    """Update all backgrounds with complete data from database"""

    db_dir = Path("database/backgrounds")
    output_dir = Path("packs/backgrounds/_source")

    # Get all background files (excluding index.json)
    bg_files = [f for f in os.listdir(db_dir) if f.endswith('.json') and f != 'index.json']

    updated = 0

    for bg_file in bg_files:
        db_path = db_dir / bg_file

        # Convert to complete Foundry format
        foundry_doc = convert_full_background(db_path)

        # Save to output
        output_file = output_dir / bg_file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(foundry_doc, f, indent=2, ensure_ascii=False)

        print(f"✅ Updated: {foundry_doc['name']} with {len(foundry_doc['system']['advancement'])} advancements")
        updated += 1

    print(f"\n✅ Updated {updated} backgrounds with complete data from database")

if __name__ == "__main__":
    print("=== UPDATING ALL BACKGROUNDS WITH COMPLETE DATA ===\n")
    main()