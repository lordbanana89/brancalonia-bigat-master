#!/usr/bin/env python3
"""
Brancalonia RollTable Population Agent
====================================

This script scans all packs/rollable-tables/_source/*.json files and populates
empty results[] arrays from the database sources.

It maps tables to their database counterparts and ensures proper D&D 5e
RollTable result format.

Author: Agent Assistant
Version: 1.0
"""

import json
import os
import re
import uuid
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

class BrancaloniaTablePopulator:
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.tables_path = self.base_path / "packs" / "rollable-tables" / "_source"
        self.database_path = self.base_path / "database"
        self.populated_count = 0
        self.errors = []
        self.summary = []

    def load_json_file(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """Load and parse a JSON file safely."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            self.errors.append(f"Error loading {file_path}: {e}")
            return None

    def save_json_file(self, file_path: Path, data: Dict[str, Any]) -> bool:
        """Save data to JSON file with proper formatting."""
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            self.errors.append(f"Error saving {file_path}: {e}")
            return False

    def generate_unique_id(self) -> str:
        """Generate a unique ID for table results."""
        return str(uuid.uuid4()).replace('-', '')[:16]

    def create_result_entry(self, text: str, range_start: int, range_end: int = None) -> Dict[str, Any]:
        """Create a properly formatted D&D 5e RollTable result entry."""
        if range_end is None:
            range_end = range_start

        return {
            "_id": self.generate_unique_id(),
            "type": 0,  # 0=text, 1=entity, 2=compendium
            "text": text.strip(),
            "img": "icons/svg/d20-black.svg",
            "weight": 1,
            "range": [range_start, range_end],
            "drawn": False
        }

    def parse_dice_formula(self, formula: str) -> int:
        """Parse dice formula to get maximum value."""
        if not formula:
            return 6

        # Extract number from formulas like "d6", "1d8", "d10", "d20", "d100"
        match = re.search(r'd(\d+)', formula.lower())
        if match:
            return int(match.group(1))

        # Default to d6 if parsing fails
        return 6

    def get_background_data(self, background_name: str) -> Optional[Dict[str, Any]]:
        """Load background data from database."""
        bg_file = self.database_path / "backgrounds" / f"{background_name}.json"
        return self.load_json_file(bg_file)

    def populate_background_table(self, table_data: Dict[str, Any], table_file: Path) -> bool:
        """Populate a background characterization table from database."""
        flags = table_data.get("flags", {})
        brancalonia_flags = flags.get("brancalonia", {})

        background = brancalonia_flags.get("background")
        tipo = brancalonia_flags.get("tipo")

        if not background or not tipo:
            return False

        # Load background data
        bg_data = self.get_background_data(background)
        if not bg_data:
            return False

        caratterizzazione = bg_data.get("caratterizzazione", {})

        # Map table types to database fields
        type_mapping = {
            "tratti": "tratti",
            "tratti della personalità": "tratti",
            "ideali": "ideali",
            "legami": "legami",
            "difetti": "difetti"
        }

        db_field = type_mapping.get(tipo.lower())
        if not db_field or db_field not in caratterizzazione:
            return False

        char_data = caratterizzazione[db_field]
        voci = char_data.get("voci", [])

        if not voci:
            return False

        # Get dice formula
        formula = table_data.get("formula", char_data.get("dado", "d6"))
        max_value = self.parse_dice_formula(formula)

        # Create results
        results = []
        for i, voce in enumerate(voci[:max_value], 1):
            result_entry = self.create_result_entry(voce, i)
            results.append(result_entry)

        # Update table
        table_data["results"] = results
        table_data["formula"] = formula

        return True

    def populate_trinket_table(self, table_data: Dict[str, Any]) -> bool:
        """Populate trinket/cianfrusaglie tables."""
        # This would be implemented when trinket data is found
        # For now, return False to indicate no population needed
        return False

    def populate_custom_table(self, table_data: Dict[str, Any], table_name: str) -> bool:
        """Populate custom tables based on naming patterns."""
        # Handle special cases like diseases, encounters, etc.
        if "malatti" in table_name.lower():
            return self.populate_disease_table(table_data)
        elif "incontri" in table_name.lower():
            return self.populate_encounter_table(table_data)
        elif "ricompense" in table_name.lower():
            return self.populate_reward_table(table_data)

        return False

    def populate_disease_table(self, table_data: Dict[str, Any]) -> bool:
        """Populate disease tables with sample data."""
        if table_data.get("results"):
            return False  # Already populated

        diseases = [
            "Peste Nera - Salvezza Costituzione CD 15, -2 Costituzione/giorno",
            "Febbre del Goblin - Allucinazioni e -1 Intelligenza/giorno",
            "Putridume - Ferite non guariscono naturalmente",
            "Rabbia - Attacchi selvaggi incontrollati",
            "Scaglie di Drago - Pelle si squama, -2 Carisma",
            "Tosse del Minatore - -10 piedi movimento, tossisce sangue",
            "Maledizione del Lupo - Licantropia minore",
            "Febbre Palustre - Esausto, non recupera con riposo",
            "Lebbra - Parti del corpo diventano insensibili",
            "Peste del Menagramo - Sfortuna estrema, svantaggio a tutto"
        ]

        results = []
        for i, disease in enumerate(diseases, 1):
            result_entry = self.create_result_entry(disease, i)
            results.append(result_entry)

        table_data["results"] = results
        table_data["formula"] = "1d10"

        return True

    def populate_encounter_table(self, table_data: Dict[str, Any]) -> bool:
        """Populate road encounter tables."""
        if table_data.get("results"):
            return False  # Already populated

        encounters = [
            "Mercanti in viaggio con caravan protetto da guardie",
            "Banditi che bloccano la strada richiedendo pedaggio",
            "Pellegrini diretti a un santuario famoso",
            "Messaggero reale a cavallo con notizie urgenti",
            "Famiglia di contadini che fugge da razzie",
            "Compagnia teatrale ambulante con carretto colorato",
            "Predicatore che arringa una piccola folla",
            "Soldati veterani che tornano dalla guerra",
            "Mercenari in cerca di lavoro",
            "Fuggitivo inseguito dalle guardie cittadine"
        ]

        results = []
        for i, encounter in enumerate(encounters, 1):
            result_entry = self.create_result_entry(encounter, i)
            results.append(result_entry)

        table_data["results"] = results
        table_data["formula"] = "1d10"

        return True

    def populate_reward_table(self, table_data: Dict[str, Any]) -> bool:
        """Populate job reward tables."""
        if table_data.get("results"):
            return False  # Already populated

        rewards = [
            "1d4 + 1 Marenghi d'Argento per lavoro semplice",
            "1d6 + 2 Marenghi d'Argento per lavoro rischioso",
            "1d8 + 3 Marenghi d'Argento per lavoro pericoloso",
            "1d10 + 5 Marenghi d'Argento per lavoro mortale",
            "Favore di un nobile locale invece del pagamento",
            "Informazioni preziose oltre al compenso base",
            "Accesso a mercanti esclusivi della zona",
            "Raccomandazione per lavori meglio pagati",
            "Oggetto magico minore come bonus",
            "Doppio compenso per lavoro eccezionale"
        ]

        results = []
        for i, reward in enumerate(rewards, 1):
            result_entry = self.create_result_entry(reward, i)
            results.append(result_entry)

        table_data["results"] = results
        table_data["formula"] = "1d10"

        return True

    def needs_population(self, table_data: Dict[str, Any]) -> bool:
        """Check if a table needs population."""
        results = table_data.get("results", [])
        return len(results) == 0

    def populate_table(self, table_file: Path) -> bool:
        """Populate a single table file."""
        table_data = self.load_json_file(table_file)
        if not table_data:
            return False

        if not self.needs_population(table_data):
            self.summary.append(f"✓ {table_file.name}: Already populated ({len(table_data.get('results', []))} entries)")
            return True

        # Try background table population first
        if self.populate_background_table(table_data, table_file):
            if self.save_json_file(table_file, table_data):
                self.populated_count += 1
                self.summary.append(f"✓ {table_file.name}: Populated from background database ({len(table_data['results'])} entries)")
                return True

        # Try trinket population
        if self.populate_trinket_table(table_data):
            if self.save_json_file(table_file, table_data):
                self.populated_count += 1
                self.summary.append(f"✓ {table_file.name}: Populated from trinket database ({len(table_data['results'])} entries)")
                return True

        # Try custom table population
        table_name = table_file.stem
        if self.populate_custom_table(table_data, table_name):
            if self.save_json_file(table_file, table_data):
                self.populated_count += 1
                self.summary.append(f"✓ {table_file.name}: Populated with custom data ({len(table_data['results'])} entries)")
                return True

        self.summary.append(f"⚠ {table_file.name}: No population method found")
        return False

    def run(self) -> None:
        """Run the population process on all tables."""
        print("Brancalonia RollTable Population Agent")
        print("=" * 50)
        print(f"Scanning: {self.tables_path}")
        print(f"Database: {self.database_path}")
        print()

        if not self.tables_path.exists():
            print(f"Error: Tables path not found: {self.tables_path}")
            return

        if not self.database_path.exists():
            print(f"Error: Database path not found: {self.database_path}")
            return

        # Get all table files
        table_files = list(self.tables_path.glob("*.json"))
        total_tables = len(table_files)

        print(f"Found {total_tables} RollTable files")
        print()

        # Process each table
        for i, table_file in enumerate(table_files, 1):
            print(f"[{i:2d}/{total_tables}] Processing {table_file.name}...")
            self.populate_table(table_file)

        # Print summary
        print()
        print("=" * 50)
        print("POPULATION SUMMARY")
        print("=" * 50)
        print(f"Total tables processed: {total_tables}")
        print(f"Tables populated: {self.populated_count}")
        print(f"Errors encountered: {len(self.errors)}")
        print()

        # Print detailed results
        for entry in self.summary:
            print(entry)

        # Print errors if any
        if self.errors:
            print()
            print("ERRORS:")
            print("-" * 20)
            for error in self.errors:
                print(f"❌ {error}")

        print()
        print("Population process completed!")

def main():
    """Main entry point."""
    if len(sys.argv) > 1:
        base_path = sys.argv[1]
    else:
        # Use current script location to find project root
        script_path = Path(__file__).parent
        base_path = script_path.parent

    populator = BrancaloniaTablePopulator(base_path)
    populator.run()

if __name__ == "__main__":
    main()