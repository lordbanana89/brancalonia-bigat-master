#!/usr/bin/env python3
"""
CONVERT DATABASE TO FOUNDRY - Converte i file dal formato database al formato Foundry VTT
"""

import json
import os
from pathlib import Path
from typing import Dict, Any

class DatabaseToFoundryConverter:
    def __init__(self):
        self.converted_count = 0

    def convert_background(self, db_data: Dict, file_name: str) -> Dict:
        """Converte un background dal formato database al formato Foundry"""

        # Estrai ID dal nome file
        bg_id = file_name.replace('.json', '')

        # Crea la struttura Foundry
        foundry_data = {
            "_id": bg_id,
            "_key": f"!items!{bg_id}",
            "name": db_data.get("nome", bg_id.title()),
            "type": "background",
            "img": "icons/skills/trades/academics-study-reading-book.webp",
            "system": {
                "description": {
                    "value": self.build_description_html(db_data),
                    "chat": "",
                    "unidentified": ""
                },
                "source": db_data.get("fonte", ""),
                "identifier": db_data.get("dettagli", {}).get("identificatore", bg_id),
                "advancement": self.build_advancements(db_data),
                "traits": {},
                "startingEquipment": [],  # Vuoto per evitare UUID dnd5e
                "wealth": db_data.get("dettagli", {}).get("ricchezza_iniziale", "")
            },
            "effects": [],
            "folder": None,
            "sort": 0,
            "ownership": {"default": 0},
            "flags": {
                "brancalonia": {
                    "fonte": db_data.get("fonte", ""),
                    "tipo": "background"
                }
            }
        }

        return foundry_data

    def build_description_html(self, db_data: Dict) -> str:
        """Costruisce la descrizione HTML dal formato database"""
        html_parts = []

        # Descrizione principale
        if "descrizione" in db_data:
            html_parts.append(f"<p><em>{db_data['descrizione']}</em></p>")

        # Testo introduttivo
        if "testo" in db_data and "introduzione" in db_data["testo"]:
            for paragraph in db_data["testo"]["introduzione"]:
                html_parts.append(f"<p>{paragraph}</p>")

        # Meccaniche
        meccaniche = db_data.get("meccaniche", {})

        # Competenze
        if "competenze_abilita" in meccaniche:
            html_parts.append(f"<p><strong>Competenze Abilità:</strong> {meccaniche['competenze_abilita']['descrizione']}</p>")

        if "competenze_strumenti" in meccaniche:
            html_parts.append(f"<p><strong>Competenze Strumenti:</strong> {meccaniche['competenze_strumenti']['descrizione']}</p>")

        if "linguaggi" in meccaniche:
            html_parts.append(f"<p><strong>Linguaggi:</strong> {meccaniche['linguaggi']['descrizione']}</p>")

        # Equipaggiamento
        if "equipaggiamento" in meccaniche:
            html_parts.append(f"<p><strong>Equipaggiamento:</strong></p>")
            html_parts.append("<ul>")
            for item in db_data.get("dettagli", {}).get("equipaggiamento", []):
                html_parts.append(f"<li>{item}</li>")
            html_parts.append("</ul>")

        # Privilegio
        if "privilegio" in db_data.get("testo", {}):
            priv = db_data["testo"]["privilegio"]
            html_parts.append(f"\n<h3>Privilegio: {priv['nome']}</h3>")
            html_parts.append(f"<p>{priv['descrizione']}</p>")

        # Tabelle caratterizzazione
        char = db_data.get("caratterizzazione", {})

        # Tratti
        if "tratti" in char:
            html_parts.append("\n<h3>Tratti della Personalità</h3>")
            html_parts.append(self.build_table(char["tratti"]))

        # Ideali
        if "ideali" in char:
            html_parts.append("\n<h3>Ideali</h3>")
            html_parts.append(self.build_table(char["ideali"]))

        # Legami
        if "legami" in char:
            html_parts.append("\n<h3>Legami</h3>")
            html_parts.append(self.build_table(char["legami"]))

        # Difetti
        if "difetti" in char:
            html_parts.append("\n<h3>Difetti</h3>")
            html_parts.append(self.build_table(char["difetti"]))

        return "\n".join(html_parts)

    def build_table(self, data: Dict) -> str:
        """Costruisce una tabella HTML per le caratterizzazioni"""
        dado = data.get("dado", "d6")
        voci = data.get("voci", [])

        html = f"<table><thead><tr><th>{dado}</th><th>{'Tratto' if 'tratti' in str(data) else 'Voce'}</th></tr></thead><tbody>"
        for i, voce in enumerate(voci, 1):
            html += f"\n<tr><td>{i}</td><td>{voce}</td></tr>"
        html += "\n</tbody></table>"

        return html

    def build_advancements(self, db_data: Dict) -> list:
        """Costruisce gli advancement dal formato database"""
        advancements = []

        avanzamento = db_data.get("avanzamento", [])

        for i, av in enumerate(avanzamento):
            if av["tipo"] == "competenze_abilita":
                # Mapping abilità
                skill_map = {
                    "intrattenere": "prf",
                    "storia": "his",
                    "persuasione": "per",
                    "religione": "rel"
                }

                fixed_skills = [skill_map.get(a, a) for a in av.get("abilita", [])]

                advancements.append({
                    "_id": self.generate_id(8),
                    "type": "Improvement",
                    "configuration": {
                        "skills": {
                            "chosen": [],
                            "fixed": fixed_skills
                        }
                    },
                    "value": {"skills": fixed_skills},
                    "level": 0,
                    "title": "Competenze del Background",
                    "classRestriction": "",
                    "appliedEffects": []
                })

            elif av["tipo"] == "linguaggi":
                langs = av.get("elenco", [])
                advancements.append({
                    "_id": self.generate_id(8),
                    "type": "Improvement",
                    "configuration": {
                        "languages": {
                            "chosen": [],
                            "fixed": langs
                        }
                    },
                    "value": {"languages": langs},
                    "level": 0,
                    "title": "Linguaggi del Background",
                    "classRestriction": "",
                    "appliedEffects": []
                })

            elif av["tipo"] == "competenze_strumenti":
                advancements.append({
                    "_id": self.generate_id(8),
                    "type": "Improvement",
                    "configuration": {
                        "tools": {
                            "chosen": {
                                "count": av.get("scelte", 1),
                                "pool": ["artisan"]
                            },
                            "fixed": []
                        }
                    },
                    "value": {"tools": []},
                    "level": 0,
                    "title": "Strumenti del Background",
                    "classRestriction": "",
                    "appliedEffects": []
                })

        return advancements

    def generate_id(self, length: int = 16) -> str:
        """Genera un ID casuale"""
        import random
        import string
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

    def convert_all_backgrounds(self):
        """Converte tutti i background dal database"""
        db_path = Path("database/backgrounds")
        output_path = Path("packs/backgrounds/_source")
        output_path.mkdir(parents=True, exist_ok=True)

        for json_file in db_path.glob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    db_data = json.load(f)

                foundry_data = self.convert_background(db_data, json_file.name)

                output_file = output_path / json_file.name
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(foundry_data, f, indent=2, ensure_ascii=False)

                self.converted_count += 1
                print(f"✅ Convertito: {json_file.name}")

            except Exception as e:
                print(f"❌ Errore con {json_file.name}: {e}")

        print(f"\n🎯 Totale convertiti: {self.converted_count}")

if __name__ == "__main__":
    print("🚀 CONVERTITORE DATABASE -> FOUNDRY VTT")
    print("="*50)

    converter = DatabaseToFoundryConverter()
    converter.convert_all_backgrounds()

    print("\n✨ Conversione completata!")