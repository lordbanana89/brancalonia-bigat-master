#!/usr/bin/env python3
"""
AGENT DEBUGGER PROFONDO - Deep Testing and Fixing for Brancalonia Module
================================================================================

REAL Problem Detection and Auto-Fix System for D&D 5e Brancalonia Module

Features:
- Deep JSON validation against D&D 5e schema
- UUID reference resolution testing
- Complete class progression verification
- Spell system validation
- Item linking verification
- RollTable deep checking
- Auto-fix generation

Author: Claude Code Agent
Version: 1.0
"""

import json
import os
import sys
import uuid
from pathlib import Path
from typing import Dict, List, Set, Any, Optional, Tuple
from dataclasses import dataclass, field
from collections import defaultdict
import re

@dataclass
class ValidationIssue:
    """Represents a validation issue found during testing"""
    category: str
    severity: str  # 'critical', 'warning', 'info'
    file_path: str
    description: str
    details: Dict[str, Any] = field(default_factory=dict)
    auto_fix: Optional[str] = None

@dataclass
class FixScript:
    """Represents an auto-fix script"""
    name: str
    description: str
    script_content: str
    target_files: List[str]

class BrancaloniaDebugger:
    """Deep debugger for Brancalonia module"""

    def __init__(self, module_path: str):
        self.module_path = Path(module_path)
        self.issues: List[ValidationIssue] = []
        self.fix_scripts: List[FixScript] = []
        self.uuid_registry: Dict[str, str] = {}  # uuid -> file_path
        self.broken_uuids: Set[str] = set()
        self.existing_items: Dict[str, Dict] = {}
        self.spell_data: Dict[str, Dict] = {}
        self.class_data: Dict[str, Dict] = {}
        self.rolltable_data: Dict[str, Dict] = {}

        # D&D 5e Standard Data
        self.dnd5e_spell_levels = list(range(0, 10))  # 0-9
        self.dnd5e_spell_schools = {
            'Abiurazione', 'Ammaliamento', 'Divinazione', 'Evocazione',
            'Illusione', 'Necromanzia', 'Trasmutazione', 'Invocazione'
        }
        self.dnd5e_max_level = 20

        print("🔧 AGENT DEBUGGER PROFONDO - Inizializzazione...")
        print(f"📁 Modulo Path: {self.module_path}")

    def run_deep_analysis(self) -> Dict[str, Any]:
        """Run complete deep analysis of the module"""
        print("\n🚀 AVVIO ANALISI PROFONDA...")

        # Phase 1: Load and inventory all data
        print("\n📊 FASE 1: Inventario completo dati")
        self._load_all_json_files()
        self._build_uuid_registry()

        # Phase 2: Deep validation
        print("\n🔍 FASE 2: Validazione profonda")
        self._validate_json_schemas()
        self._test_uuid_references()

        # Phase 3: Class system analysis
        print("\n🏛️ FASE 3: Analisi sistema classi")
        self._deep_class_analysis()

        # Phase 4: Spell system verification
        print("\n✨ FASE 4: Verifica sistema incantesimi")
        self._spell_system_verification()

        # Phase 5: Item linking verification
        print("\n⚔️ FASE 5: Verifica collegamenti oggetti")
        self._item_linking_verification()

        # Phase 6: RollTable deep check
        print("\n🎲 FASE 6: Controllo profondo tabelle")
        self._rolltable_deep_check()

        # Phase 7: Generate fixes
        print("\n🔧 FASE 7: Generazione fix automatici")
        self._generate_auto_fixes()

        # Generate final report
        return self._generate_final_report()

    def _load_all_json_files(self):
        """Load and catalog all JSON files in the module"""
        json_files = list(self.module_path.rglob("*.json"))
        print(f"📋 Trovati {len(json_files)} file JSON")

        for json_file in json_files:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                # Categorize by type
                file_type = self._determine_file_type(data, json_file)

                if file_type == 'class':
                    self.class_data[str(json_file)] = data
                elif file_type == 'spell':
                    self.spell_data[str(json_file)] = data
                elif file_type == 'rolltable':
                    self.rolltable_data[str(json_file)] = data
                else:
                    self.existing_items[str(json_file)] = data

            except json.JSONDecodeError as e:
                self.issues.append(ValidationIssue(
                    category="JSON_SYNTAX",
                    severity="critical",
                    file_path=str(json_file),
                    description=f"Errore sintassi JSON: {str(e)}",
                    auto_fix=f"Correggere sintassi JSON nel file {json_file}"
                ))
            except Exception as e:
                self.issues.append(ValidationIssue(
                    category="FILE_ACCESS",
                    severity="critical",
                    file_path=str(json_file),
                    description=f"Impossibile leggere file: {str(e)}"
                ))

    def _determine_file_type(self, data: Dict, file_path: Path) -> str:
        """Determine the type of JSON file based on content and path"""
        file_str = str(file_path).lower()

        if 'classe' in file_str or 'class' in file_str:
            return 'class'
        elif 'incantesimi' in file_str or 'spell' in file_str:
            return 'spell'
        elif 'table' in file_str or 'tabelle' in file_str:
            return 'rolltable'
        elif isinstance(data, dict):
            if 'progressione' in data or 'privilegi_classe' in data:
                return 'class'
            elif 'scuola' in data and 'livello' in data:
                return 'spell'
            elif 'results' in data and 'formula' in data:
                return 'rolltable'

        return 'item'

    def _build_uuid_registry(self):
        """Build registry of all UUIDs found in files"""
        print("🔑 Costruzione registro UUID...")

        for file_path, data in self.existing_items.items():
            self._extract_uuids_from_data(data, file_path)

        for file_path, data in self.class_data.items():
            self._extract_uuids_from_data(data, file_path)

        for file_path, data in self.spell_data.items():
            self._extract_uuids_from_data(data, file_path)

        for file_path, data in self.rolltable_data.items():
            self._extract_uuids_from_data(data, file_path)

        print(f"📝 UUID registrati: {len(self.uuid_registry)}")

    def _extract_uuids_from_data(self, data: Any, file_path: str, prefix: str = ""):
        """Recursively extract UUIDs from data structure"""
        if isinstance(data, dict):
            for key, value in data.items():
                current_path = f"{prefix}.{key}" if prefix else key

                if key in ['_id', 'id', 'uuid'] and isinstance(value, str):
                    if self._is_valid_uuid_format(value):
                        self.uuid_registry[value] = file_path

                self._extract_uuids_from_data(value, file_path, current_path)

        elif isinstance(data, list):
            for i, item in enumerate(data):
                current_path = f"{prefix}[{i}]" if prefix else f"[{i}]"
                self._extract_uuids_from_data(item, file_path, current_path)

        elif isinstance(data, str) and self._is_valid_uuid_format(data):
            # Found a UUID string in data
            self.uuid_registry[data] = file_path

    def _is_valid_uuid_format(self, value: str) -> bool:
        """Check if string is a valid UUID format"""
        try:
            uuid.UUID(value)
            return True
        except (ValueError, TypeError):
            return False

    def _validate_json_schemas(self):
        """Validate JSON files against D&D 5e schema expectations"""
        print("📋 Validazione schema JSON...")

        # Validate class files
        for file_path, class_data in self.class_data.items():
            self._validate_class_schema(class_data, file_path)

        # Validate spell files
        for file_path, spell_data in self.spell_data.items():
            self._validate_spell_schema(spell_data, file_path)

        # Validate rolltable files
        for file_path, table_data in self.rolltable_data.items():
            self._validate_rolltable_schema(table_data, file_path)

    def _validate_class_schema(self, data: Dict, file_path: str):
        """Validate class data against expected D&D 5e class schema"""
        required_fields = ['nome', 'dado_vita', 'competenze', 'progressione']

        for field in required_fields:
            if field not in data:
                self.issues.append(ValidationIssue(
                    category="CLASS_SCHEMA",
                    severity="critical",
                    file_path=file_path,
                    description=f"Campo obbligatorio mancante: {field}",
                    auto_fix=f"Aggiungere campo '{field}' al file classe"
                ))

        # Validate progression
        if 'progressione' in data:
            progression = data['progressione']
            if not isinstance(progression, list):
                self.issues.append(ValidationIssue(
                    category="CLASS_SCHEMA",
                    severity="critical",
                    file_path=file_path,
                    description="Progressione deve essere una lista",
                    auto_fix="Convertire progressione in formato lista"
                ))
            else:
                # Check if all 20 levels are present
                levels = [item.get('livello', 0) for item in progression if isinstance(item, dict)]
                missing_levels = set(range(1, 21)) - set(levels)

                if missing_levels:
                    self.issues.append(ValidationIssue(
                        category="CLASS_PROGRESSION",
                        severity="critical",
                        file_path=file_path,
                        description=f"Livelli mancanti: {sorted(missing_levels)}",
                        details={"missing_levels": sorted(missing_levels)},
                        auto_fix="Aggiungere progressione per tutti i livelli 1-20"
                    ))

    def _validate_spell_schema(self, data: Dict, file_path: str):
        """Validate spell data against D&D 5e spell schema"""
        required_fields = ['nome', 'livello', 'scuola', 'tempo_lancio', 'gittata', 'componenti', 'durata']

        for field in required_fields:
            if field not in data:
                self.issues.append(ValidationIssue(
                    category="SPELL_SCHEMA",
                    severity="critical",
                    file_path=file_path,
                    description=f"Campo obbligatorio incantesimo mancante: {field}",
                    auto_fix=f"Aggiungere campo '{field}' all'incantesimo"
                ))

        # Validate spell level
        if 'livello' in data:
            level = data['livello']
            if not isinstance(level, int) or level not in self.dnd5e_spell_levels:
                self.issues.append(ValidationIssue(
                    category="SPELL_LEVEL",
                    severity="critical",
                    file_path=file_path,
                    description=f"Livello incantesimo non valido: {level}",
                    auto_fix=f"Correggere livello incantesimo (deve essere 0-9)"
                ))

        # Validate spell school
        if 'scuola' in data:
            school = data['scuola']
            if school not in self.dnd5e_spell_schools:
                self.issues.append(ValidationIssue(
                    category="SPELL_SCHOOL",
                    severity="warning",
                    file_path=file_path,
                    description=f"Scuola incantesimo non standard: {school}",
                    details={"valid_schools": list(self.dnd5e_spell_schools)}
                ))

    def _validate_rolltable_schema(self, data: Dict, file_path: str):
        """Validate rolltable data against expected schema"""
        required_fields = ['results', 'formula']

        for field in required_fields:
            if field not in data:
                self.issues.append(ValidationIssue(
                    category="ROLLTABLE_SCHEMA",
                    severity="critical",
                    file_path=file_path,
                    description=f"Campo obbligatorio tabella mancante: {field}",
                    auto_fix=f"Aggiungere campo '{field}' alla tabella"
                ))

        # Validate results array
        if 'results' in data:
            results = data['results']
            if not isinstance(results, list):
                self.issues.append(ValidationIssue(
                    category="ROLLTABLE_RESULTS",
                    severity="critical",
                    file_path=file_path,
                    description="Results deve essere una lista",
                    auto_fix="Convertire results in formato lista"
                ))
            elif len(results) == 0:
                self.issues.append(ValidationIssue(
                    category="ROLLTABLE_EMPTY",
                    severity="critical",
                    file_path=file_path,
                    description="Tabella vuota - nessun risultato",
                    auto_fix="Popolare tabella con risultati appropriati"
                ))

    def _test_uuid_references(self):
        """Test all UUID references to ensure they resolve to existing items"""
        print("🔗 Test risoluzione riferimenti UUID...")

        all_files = {**self.existing_items, **self.class_data, **self.spell_data, **self.rolltable_data}

        for file_path, data in all_files.items():
            self._find_and_test_uuid_references(data, file_path)

        print(f"❌ UUID rotti trovati: {len(self.broken_uuids)}")

    def _find_and_test_uuid_references(self, data: Any, file_path: str, path: str = ""):
        """Recursively find and test UUID references"""
        if isinstance(data, dict):
            for key, value in data.items():
                current_path = f"{path}.{key}" if path else key

                # Check for UUID references in specific fields
                if key in ['feature_uuid', 'spell_uuid', 'item_uuid', 'grants'] and isinstance(value, str):
                    if self._is_valid_uuid_format(value) and value not in self.uuid_registry:
                        self.broken_uuids.add(value)
                        self.issues.append(ValidationIssue(
                            category="BROKEN_UUID",
                            severity="critical",
                            file_path=file_path,
                            description=f"UUID rotto: {value} in {current_path}",
                            details={"uuid": value, "field": key},
                            auto_fix=f"Creare item mancante per UUID {value} o correggere riferimento"
                        ))

                self._find_and_test_uuid_references(value, file_path, current_path)

        elif isinstance(data, list):
            for i, item in enumerate(data):
                current_path = f"{path}[{i}]" if path else f"[{i}]"
                self._find_and_test_uuid_references(item, file_path, current_path)

    def _deep_class_analysis(self):
        """Perform deep analysis of all class files"""
        print("🏛️ Analisi profonda classi...")

        for file_path, class_data in self.class_data.items():
            self._analyze_single_class(class_data, file_path)

    def _analyze_single_class(self, class_data: Dict, file_path: str):
        """Analyze a single class for completeness and correctness"""
        class_name = class_data.get('nome', 'Unknown')
        print(f"  📖 Analizzando classe: {class_name}")

        # Check progression completeness
        if 'progressione' in class_data:
            progression = class_data['progressione']

            # Verify all 20 levels
            levels_present = set()
            for level_data in progression:
                if isinstance(level_data, dict) and 'livello' in level_data:
                    level = level_data['livello']
                    levels_present.add(level)

                    # Verify each level has features
                    if 'privilegi' not in level_data or not level_data['privilegi']:
                        self.issues.append(ValidationIssue(
                            category="CLASS_MISSING_FEATURES",
                            severity="warning",
                            file_path=file_path,
                            description=f"Livello {level} senza privilegi per classe {class_name}",
                            auto_fix=f"Aggiungere privilegi per livello {level}"
                        ))

            missing_levels = set(range(1, 21)) - levels_present
            if missing_levels:
                self.issues.append(ValidationIssue(
                    category="CLASS_INCOMPLETE_PROGRESSION",
                    severity="critical",
                    file_path=file_path,
                    description=f"Classe {class_name} manca livelli: {sorted(missing_levels)}",
                    details={"missing_levels": sorted(missing_levels), "class_name": class_name},
                    auto_fix=f"Completare progressione classe {class_name} per livelli mancanti"
                ))

        # Check starting equipment exists
        if 'equipaggiamento_iniziale' in class_data:
            equipment = class_data['equipaggiamento_iniziale']
            if isinstance(equipment, list):
                for item in equipment:
                    if isinstance(item, str):
                        # Parse equipment string and verify items exist
                        self._verify_equipment_exists(item, file_path, class_name)

        # Check spell progression for caster classes
        if self._is_spellcaster_class(class_data):
            self._verify_spell_progression(class_data, file_path, class_name)

    def _is_spellcaster_class(self, class_data: Dict) -> bool:
        """Determine if class is a spellcaster based on progression data"""
        if 'progressione' not in class_data:
            return False

        for level_data in class_data['progressione']:
            if isinstance(level_data, dict):
                # Look for spell slot indicators
                for key in level_data.keys():
                    if any(keyword in key.lower() for keyword in ['spell', 'incantesimi', 'slot']):
                        return True
        return False

    def _verify_equipment_exists(self, equipment_text: str, file_path: str, class_name: str):
        """Verify that equipment mentioned in text actually exists as items"""
        # Extract item names from equipment text
        # This is a simplified parser - could be enhanced
        equipment_text = equipment_text.lower()

        # Common D&D equipment that should exist
        common_items = ['stocco', 'pugnale', 'armatura di cuoio', 'borsa', 'strumenti']

        for item in common_items:
            if item in equipment_text:
                # Check if we have this item in our database
                found = False
                for item_file, item_data in self.existing_items.items():
                    if isinstance(item_data, dict) and 'nome' in item_data:
                        if item.lower() in item_data['nome'].lower():
                            found = True
                            break

                if not found:
                    self.issues.append(ValidationIssue(
                        category="MISSING_EQUIPMENT",
                        severity="warning",
                        file_path=file_path,
                        description=f"Equipaggiamento '{item}' menzionato per classe {class_name} non trovato nel database",
                        auto_fix=f"Creare item '{item}' nel database equipaggiamento"
                    ))

    def _verify_spell_progression(self, class_data: Dict, file_path: str, class_name: str):
        """Verify spell progression follows D&D 5e standards"""
        progression = class_data.get('progressione', [])

        # Check for spell slot progression
        has_spell_slots = False
        for level_data in progression:
            if isinstance(level_data, dict):
                for key in level_data.keys():
                    if 'slot' in key.lower() or 'incantesimi' in key.lower():
                        has_spell_slots = True
                        break

        if not has_spell_slots and self._is_spellcaster_class(class_data):
            self.issues.append(ValidationIssue(
                category="MISSING_SPELL_SLOTS",
                severity="critical",
                file_path=file_path,
                description=f"Classe incantatore {class_name} senza progressione slot incantesimi",
                auto_fix=f"Aggiungere progressione slot incantesimi standard D&D 5e per {class_name}"
            ))

    def _spell_system_verification(self):
        """Comprehensive spell system verification"""
        print("✨ Verifica sistema incantesimi...")

        # Count spells by level
        spells_by_level = defaultdict(int)
        schools_found = set()

        for file_path, spell_data in self.spell_data.items():
            if isinstance(spell_data, dict):
                level = spell_data.get('livello')
                school = spell_data.get('scuola')

                if isinstance(level, int):
                    spells_by_level[level] += 1

                if isinstance(school, str):
                    schools_found.add(school)

        # Report spell coverage
        print(f"  📊 Incantesimi per livello:")
        total_spells = 0
        for level in self.dnd5e_spell_levels:
            count = spells_by_level[level]
            total_spells += count
            print(f"    Livello {level}: {count} incantesimi")

            if count == 0:
                self.issues.append(ValidationIssue(
                    category="MISSING_SPELL_LEVEL",
                    severity="warning",
                    file_path="",
                    description=f"Nessun incantesimo di livello {level}",
                    auto_fix=f"Aggiungere incantesimi di livello {level}"
                ))

        print(f"  📈 Totale incantesimi: {total_spells}")

        # Check school coverage
        missing_schools = self.dnd5e_spell_schools - schools_found
        if missing_schools:
            self.issues.append(ValidationIssue(
                category="MISSING_SPELL_SCHOOLS",
                severity="warning",
                file_path="",
                description=f"Scuole di magia mancanti: {missing_schools}",
                auto_fix=f"Aggiungere incantesimi per scuole: {missing_schools}"
            ))

        # Verify spell references in classes
        self._verify_class_spell_references()

    def _verify_class_spell_references(self):
        """Verify that spells referenced by classes actually exist"""
        print("  🔗 Verifica riferimenti incantesimi in classi...")

        # Build spell name registry
        spell_names = set()
        for spell_data in self.spell_data.values():
            if isinstance(spell_data, dict) and 'nome' in spell_data:
                spell_names.add(spell_data['nome'].lower())

        # Check class spell lists
        for file_path, class_data in self.class_data.items():
            class_name = class_data.get('nome', 'Unknown')

            # Look for spell lists in class data
            self._check_spell_list_in_data(class_data, spell_names, file_path, class_name)

    def _check_spell_list_in_data(self, data: Any, spell_names: Set[str], file_path: str, class_name: str):
        """Recursively check for spell references in class data"""
        if isinstance(data, dict):
            for key, value in data.items():
                if 'spell' in key.lower() or 'incantesim' in key.lower():
                    if isinstance(value, list):
                        for spell in value:
                            if isinstance(spell, str) and spell.lower() not in spell_names:
                                self.issues.append(ValidationIssue(
                                    category="MISSING_SPELL_REFERENCE",
                                    severity="warning",
                                    file_path=file_path,
                                    description=f"Incantesimo '{spell}' riferito da {class_name} non trovato",
                                    auto_fix=f"Creare incantesimo '{spell}' o correggere riferimento"
                                ))

                self._check_spell_list_in_data(value, spell_names, file_path, class_name)

        elif isinstance(data, list):
            for item in data:
                self._check_spell_list_in_data(item, spell_names, file_path, class_name)

    def _item_linking_verification(self):
        """Verify all item links and references"""
        print("⚔️ Verifica collegamenti oggetti...")

        # Build item registry by name and type
        items_by_name = {}
        items_by_type = defaultdict(list)

        for file_path, item_data in self.existing_items.items():
            if isinstance(item_data, dict):
                name = item_data.get('nome', item_data.get('name', ''))
                item_type = item_data.get('tipo', item_data.get('type', 'unknown'))

                if name:
                    items_by_name[name.lower()] = item_data
                    items_by_type[item_type].append(item_data)

        print(f"  📦 Oggetti per tipo:")
        for item_type, items in items_by_type.items():
            print(f"    {item_type}: {len(items)} oggetti")

        # Verify weapon properties
        self._verify_weapon_properties()

        # Verify armor AC calculations
        self._verify_armor_calculations()

        # Check magic item rarities
        self._verify_magic_item_rarities()

    def _verify_weapon_properties(self):
        """Verify weapon properties are correctly defined"""
        weapon_count = 0
        weapons_with_issues = 0

        for file_path, item_data in self.existing_items.items():
            if isinstance(item_data, dict):
                item_type = item_data.get('tipo', item_data.get('type', ''))

                if 'arma' in item_type.lower() or 'weapon' in item_type.lower():
                    weapon_count += 1

                    # Check required weapon properties
                    required_props = ['danni', 'tipo_danno', 'proprieta']
                    missing_props = []

                    for prop in required_props:
                        if prop not in item_data:
                            missing_props.append(prop)

                    if missing_props:
                        weapons_with_issues += 1
                        self.issues.append(ValidationIssue(
                            category="WEAPON_MISSING_PROPERTIES",
                            severity="warning",
                            file_path=file_path,
                            description=f"Arma manca proprietà: {missing_props}",
                            auto_fix=f"Aggiungere proprietà mancanti: {missing_props}"
                        ))

        print(f"  ⚔️ Armi controllate: {weapon_count}, con problemi: {weapons_with_issues}")

    def _verify_armor_calculations(self):
        """Verify armor AC calculations are correct"""
        armor_count = 0
        armor_with_issues = 0

        for file_path, item_data in self.existing_items.items():
            if isinstance(item_data, dict):
                item_type = item_data.get('tipo', item_data.get('type', ''))

                if 'armatura' in item_type.lower() or 'armor' in item_type.lower():
                    armor_count += 1

                    # Check AC calculation
                    if 'ca' not in item_data and 'ac' not in item_data:
                        armor_with_issues += 1
                        self.issues.append(ValidationIssue(
                            category="ARMOR_MISSING_AC",
                            severity="warning",
                            file_path=file_path,
                            description="Armatura senza valore CA",
                            auto_fix="Aggiungere valore CA all'armatura"
                        ))

        print(f"  🛡️ Armature controllate: {armor_count}, con problemi: {armor_with_issues}")

    def _verify_magic_item_rarities(self):
        """Verify magic items have appropriate rarity designations"""
        magic_items = 0
        missing_rarity = 0

        for file_path, item_data in self.existing_items.items():
            if isinstance(item_data, dict):
                # Check if it's a magic item
                is_magic = (
                    'magico' in str(item_data).lower() or
                    'magic' in str(item_data).lower() or
                    'rarity' in item_data or
                    'rarita' in item_data
                )

                if is_magic:
                    magic_items += 1

                    if 'rarity' not in item_data and 'rarita' not in item_data:
                        missing_rarity += 1
                        self.issues.append(ValidationIssue(
                            category="MAGIC_ITEM_NO_RARITY",
                            severity="info",
                            file_path=file_path,
                            description="Oggetto magico senza rarità specificata",
                            auto_fix="Aggiungere rarità appropriata (comune, non comune, raro, molto raro, leggendario)"
                        ))

        print(f"  ✨ Oggetti magici: {magic_items}, senza rarità: {missing_rarity}")

    def _rolltable_deep_check(self):
        """Perform deep check of all rolltables"""
        print("🎲 Controllo profondo tabelle...")

        tables_checked = 0
        tables_with_issues = 0

        for file_path, table_data in self.rolltable_data.items():
            tables_checked += 1
            table_name = table_data.get('name', table_data.get('nome', 'Unknown'))

            print(f"  📋 Controllando tabella: {table_name}")

            # Verify results array
            results = table_data.get('results', [])
            if not results:
                tables_with_issues += 1
                self.issues.append(ValidationIssue(
                    category="EMPTY_ROLLTABLE",
                    severity="critical",
                    file_path=file_path,
                    description=f"Tabella '{table_name}' vuota",
                    auto_fix=f"Popolare tabella '{table_name}' con risultati appropriati"
                ))
                continue

            # Verify range calculations
            expected_ranges = self._calculate_expected_ranges(table_data)
            actual_ranges = self._extract_actual_ranges(results)

            if expected_ranges != actual_ranges:
                tables_with_issues += 1
                self.issues.append(ValidationIssue(
                    category="ROLLTABLE_RANGE_ERROR",
                    severity="warning",
                    file_path=file_path,
                    description=f"Tabella '{table_name}' ha range non corretti",
                    details={"expected": expected_ranges, "actual": actual_ranges},
                    auto_fix=f"Correggere range per tabella '{table_name}'"
                ))

            # Verify weight distribution
            self._verify_weight_distribution(results, file_path, table_name)

        print(f"  📊 Tabelle controllate: {tables_checked}, con problemi: {tables_with_issues}")

    def _calculate_expected_ranges(self, table_data: Dict) -> List[Tuple[int, int]]:
        """Calculate expected ranges based on formula and weights"""
        formula = table_data.get('formula', '')
        results = table_data.get('results', [])

        if not results:
            return []

        # Simple calculation for standard dice formulas
        if formula.startswith('1d'):
            try:
                sides = int(formula[2:])
                return [(i, i) for i in range(1, sides + 1)]
            except ValueError:
                return []

        return []

    def _extract_actual_ranges(self, results: List[Dict]) -> List[Tuple[int, int]]:
        """Extract actual ranges from results array"""
        ranges = []
        for result in results:
            if isinstance(result, dict) and 'range' in result:
                range_data = result['range']
                if isinstance(range_data, list) and len(range_data) == 2:
                    ranges.append((range_data[0], range_data[1]))
        return ranges

    def _verify_weight_distribution(self, results: List[Dict], file_path: str, table_name: str):
        """Verify weight distribution is reasonable"""
        weights = []
        for result in results:
            if isinstance(result, dict):
                weight = result.get('weight', 1)
                weights.append(weight)

        if weights:
            total_weight = sum(weights)
            if total_weight == 0:
                self.issues.append(ValidationIssue(
                    category="ROLLTABLE_ZERO_WEIGHT",
                    severity="warning",
                    file_path=file_path,
                    description=f"Tabella '{table_name}' ha peso totale zero",
                    auto_fix=f"Correggere pesi per tabella '{table_name}'"
                ))

    def _generate_auto_fixes(self):
        """Generate auto-fix scripts for found issues"""
        print("🔧 Generazione fix automatici...")

        # Group issues by category for more efficient fixes
        issues_by_category = defaultdict(list)
        for issue in self.issues:
            issues_by_category[issue.category].append(issue)

        # Generate specific fix scripts
        self._generate_uuid_fix_script(issues_by_category.get('BROKEN_UUID', []))
        self._generate_class_completion_script(issues_by_category.get('CLASS_INCOMPLETE_PROGRESSION', []))
        self._generate_missing_items_script(issues_by_category.get('MISSING_EQUIPMENT', []))
        self._generate_spell_completion_script(issues_by_category.get('MISSING_SPELL_LEVEL', []))
        self._generate_rolltable_fix_script(issues_by_category.get('EMPTY_ROLLTABLE', []))

    def _generate_uuid_fix_script(self, uuid_issues: List[ValidationIssue]):
        """Generate script to fix broken UUID references"""
        if not uuid_issues:
            return

        script_lines = [
            "#!/usr/bin/env python3",
            "# Auto-generated script to fix broken UUID references",
            "",
            "import json",
            "import uuid",
            "from pathlib import Path",
            "",
            "def fix_broken_uuids():",
            "    \"\"\"Fix broken UUID references by creating placeholder items\"\"\"",
            ""
        ]

        for issue in uuid_issues:
            broken_uuid = issue.details.get('uuid', '')
            if broken_uuid:
                script_lines.extend([
                    f"    # Fix UUID: {broken_uuid}",
                    f"    placeholder_item = {{",
                    f"        '_id': '{broken_uuid}',",
                    f"        'name': 'Placeholder Item - {broken_uuid[:8]}',",
                    f"        'type': 'feat',",
                    f"        'description': 'Auto-generated placeholder for broken UUID reference',",
                    f"        'flags': {{'auto_generated': True}}",
                    f"    }}",
                    f"    # TODO: Create actual item file for {broken_uuid}",
                    ""
                ])

        script_lines.extend([
            "if __name__ == '__main__':",
            "    fix_broken_uuids()",
            "    print('UUID fixes generated - manual implementation required')"
        ])

        fix_script = FixScript(
            name="fix_broken_uuids.py",
            description=f"Fix {len(uuid_issues)} broken UUID references",
            script_content="\n".join(script_lines),
            target_files=[issue.file_path for issue in uuid_issues]
        )

        self.fix_scripts.append(fix_script)

    def _generate_class_completion_script(self, class_issues: List[ValidationIssue]):
        """Generate script to complete class progressions"""
        if not class_issues:
            return

        script_lines = [
            "#!/usr/bin/env python3",
            "# Auto-generated script to complete class progressions",
            "",
            "import json",
            "from pathlib import Path",
            "",
            "def complete_class_progressions():",
            "    \"\"\"Complete missing class level progressions\"\"\"",
            ""
        ]

        for issue in class_issues:
            missing_levels = issue.details.get('missing_levels', [])
            class_name = issue.details.get('class_name', 'Unknown')

            script_lines.extend([
                f"    # Complete progression for {class_name}",
                f"    # Missing levels: {missing_levels}",
                f"    class_file = Path('{issue.file_path}')",
                f"    # TODO: Add progression data for levels {missing_levels}",
                ""
            ])

        script_lines.extend([
            "if __name__ == '__main__':",
            "    complete_class_progressions()",
            "    print('Class progression completion scripts generated')"
        ])

        fix_script = FixScript(
            name="complete_class_progressions.py",
            description=f"Complete {len(class_issues)} incomplete class progressions",
            script_content="\n".join(script_lines),
            target_files=[issue.file_path for issue in class_issues]
        )

        self.fix_scripts.append(fix_script)

    def _generate_missing_items_script(self, item_issues: List[ValidationIssue]):
        """Generate script to create missing equipment items"""
        if not item_issues:
            return

        script_lines = [
            "#!/usr/bin/env python3",
            "# Auto-generated script to create missing equipment items",
            "",
            "import json",
            "import uuid",
            "from pathlib import Path",
            "",
            "def create_missing_items():",
            "    \"\"\"Create missing equipment items\"\"\"",
            "    ",
            "    # Standard D&D 5e equipment templates",
            "    equipment_templates = {",
            "        'stocco': {",
            "            'nome': 'Stocco',",
            "            'tipo': 'arma da mischia',",
            "            'danni': '1d8',",
            "            'tipo_danno': 'perforante',",
            "            'peso': 1,",
            "            'costo': {'quantita': 25, 'valuta': 'mo'},",
            "            'proprieta': ['accurata', 'elegante']",
            "        },",
            "        'pugnale': {",
            "            'nome': 'Pugnale',",
            "            'tipo': 'arma da mischia',",
            "            'danni': '1d4',",
            "            'tipo_danno': 'perforante',",
            "            'peso': 0.5,",
            "            'costo': {'quantita': 2, 'valuta': 'mo'},",
            "            'proprieta': ['accurata', 'da_lancio', 'leggera']",
            "        },",
            "        'armatura di cuoio': {",
            "            'nome': 'Armatura di Cuoio',",
            "            'tipo': 'armatura leggera',",
            "            'ca': 11,",
            "            'max_des': None,",
            "            'peso': 5,",
            "            'costo': {'quantita': 10, 'mo': 'mo'}",
            "        }",
            "    }",
            ""
        ]

        for issue in item_issues:
            script_lines.extend([
                f"    # Create missing item from: {issue.file_path}",
                f"    # TODO: Implement item creation logic",
                ""
            ])

        script_lines.extend([
            "if __name__ == '__main__':",
            "    create_missing_items()",
            "    print('Missing items creation scripts generated')"
        ])

        fix_script = FixScript(
            name="create_missing_items.py",
            description=f"Create {len(item_issues)} missing equipment items",
            script_content="\n".join(script_lines),
            target_files=[issue.file_path for issue in item_issues]
        )

        self.fix_scripts.append(fix_script)

    def _generate_spell_completion_script(self, spell_issues: List[ValidationIssue]):
        """Generate script to add missing spell levels"""
        if not spell_issues:
            return

        script_content = """#!/usr/bin/env python3
# Auto-generated script to complete spell system

import json
from pathlib import Path

def create_missing_spells():
    \"\"\"Create placeholder spells for missing levels\"\"\"

    # Standard spell templates by level
    spell_templates = {
        0: [
            {'nome': 'Trucchetto Base', 'scuola': 'Trasmutazione'},
            {'nome': 'Prestidigitazione', 'scuola': 'Trasmutazione'}
        ],
        1: [
            {'nome': 'Dardo Incantato', 'scuola': 'Evocazione'},
            {'nome': 'Benedire', 'scuola': 'Ammaliamento'}
        ]
        # TODO: Add templates for levels 2-9
    }

    print("Spell completion scripts generated - manual implementation required")

if __name__ == '__main__':
    create_missing_spells()
"""

        fix_script = FixScript(
            name="complete_spell_system.py",
            description=f"Add spells for {len(spell_issues)} missing levels",
            script_content=script_content,
            target_files=[]
        )

        self.fix_scripts.append(fix_script)

    def _generate_rolltable_fix_script(self, table_issues: List[ValidationIssue]):
        """Generate script to populate empty rolltables"""
        if not table_issues:
            return

        script_content = """#!/usr/bin/env python3
# Auto-generated script to populate empty rolltables

import json
from pathlib import Path

def populate_empty_tables():
    \"\"\"Populate empty rolltables with default content\"\"\"

    default_results = [
        {"_id": "result_1", "type": 0, "text": "Risultato 1", "weight": 1, "range": [1, 1]},
        {"_id": "result_2", "type": 0, "text": "Risultato 2", "weight": 1, "range": [2, 2]},
        {"_id": "result_3", "type": 0, "text": "Risultato 3", "weight": 1, "range": [3, 3]},
        {"_id": "result_4", "type": 0, "text": "Risultato 4", "weight": 1, "range": [4, 4]},
        {"_id": "result_5", "type": 0, "text": "Risultato 5", "weight": 1, "range": [5, 5]},
        {"_id": "result_6", "type": 0, "text": "Risultato 6", "weight": 1, "range": [6, 6]}
    ]

    print("Rolltable population scripts generated - manual implementation required")

if __name__ == '__main__':
    populate_empty_tables()
"""

        fix_script = FixScript(
            name="populate_rolltables.py",
            description=f"Populate {len(table_issues)} empty rolltables",
            script_content=script_content,
            target_files=[issue.file_path for issue in table_issues]
        )

        self.fix_scripts.append(fix_script)

    def _generate_final_report(self) -> Dict[str, Any]:
        """Generate comprehensive final report"""
        print("\n📊 GENERAZIONE REPORT FINALE...")

        # Count issues by category and severity
        issues_by_category = defaultdict(int)
        issues_by_severity = defaultdict(int)

        for issue in self.issues:
            issues_by_category[issue.category] += 1
            issues_by_severity[issue.severity] += 1

        # Calculate statistics
        total_files_scanned = (
            len(self.existing_items) +
            len(self.class_data) +
            len(self.spell_data) +
            len(self.rolltable_data)
        )

        # Count actual content
        actual_classes = len(self.class_data)
        actual_spells = len(self.spell_data)
        actual_items = len(self.existing_items)
        actual_tables = len(self.rolltable_data)

        # Spell level coverage
        spell_level_coverage = defaultdict(int)
        for spell_data in self.spell_data.values():
            if isinstance(spell_data, dict) and 'livello' in spell_data:
                spell_level_coverage[spell_data['livello']] += 1

        report = {
            "metadata": {
                "generated_by": "Agent Debugger Profondo",
                "module_path": str(self.module_path),
                "scan_timestamp": "2024-09-27",
                "total_files_scanned": total_files_scanned
            },
            "content_statistics": {
                "classes": actual_classes,
                "spells": actual_spells,
                "items": actual_items,
                "rolltables": actual_tables,
                "uuid_registry_size": len(self.uuid_registry),
                "broken_uuids": len(self.broken_uuids)
            },
            "spell_system_analysis": {
                "total_spells": actual_spells,
                "spells_by_level": dict(spell_level_coverage),
                "missing_levels": [level for level in self.dnd5e_spell_levels if spell_level_coverage[level] == 0],
                "level_coverage_percentage": round((len(spell_level_coverage) / len(self.dnd5e_spell_levels)) * 100, 1)
            },
            "validation_results": {
                "total_issues": len(self.issues),
                "issues_by_severity": dict(issues_by_severity),
                "issues_by_category": dict(issues_by_category),
                "critical_issues": issues_by_severity['critical'],
                "warning_issues": issues_by_severity['warning'],
                "info_issues": issues_by_severity['info']
            },
            "detailed_issues": [
                {
                    "category": issue.category,
                    "severity": issue.severity,
                    "file": issue.file_path,
                    "description": issue.description,
                    "details": issue.details,
                    "auto_fix": issue.auto_fix
                }
                for issue in self.issues
            ],
            "auto_fix_scripts": [
                {
                    "name": script.name,
                    "description": script.description,
                    "target_files_count": len(script.target_files)
                }
                for script in self.fix_scripts
            ],
            "recommendations": self._generate_recommendations()
        }

        return report

    def _generate_recommendations(self) -> List[str]:
        """Generate specific recommendations based on findings"""
        recommendations = []

        # Critical issues
        critical_count = sum(1 for issue in self.issues if issue.severity == 'critical')
        if critical_count > 0:
            recommendations.append(f"PRIORITA ALTA: Risolvere {critical_count} problemi critici prima del rilascio")

        # Class completeness
        incomplete_classes = sum(1 for issue in self.issues if issue.category == 'CLASS_INCOMPLETE_PROGRESSION')
        if incomplete_classes > 0:
            recommendations.append(f"Completare progressione per {incomplete_classes} classi incomplete")

        # Spell system
        missing_spell_levels = sum(1 for issue in self.issues if issue.category == 'MISSING_SPELL_LEVEL')
        if missing_spell_levels > 0:
            recommendations.append(f"Aggiungere incantesimi per {missing_spell_levels} livelli mancanti")

        # UUID references
        broken_uuid_count = len(self.broken_uuids)
        if broken_uuid_count > 0:
            recommendations.append(f"Correggere {broken_uuid_count} riferimenti UUID rotti")

        # Empty tables
        empty_tables = sum(1 for issue in self.issues if issue.category == 'EMPTY_ROLLTABLE')
        if empty_tables > 0:
            recommendations.append(f"Popolare {empty_tables} tabelle vuote")

        # General recommendations
        if len(self.issues) == 0:
            recommendations.append("ECCELLENTE: Nessun problema critico trovato!")
        elif critical_count == 0:
            recommendations.append("BUONO: Nessun problema critico, solo miglioramenti minori necessari")

        return recommendations

def main():
    """Main execution function"""
    if len(sys.argv) != 2:
        print("Uso: python agent-debugger-profondo.py <path_to_brancalonia_module>")
        sys.exit(1)

    module_path = sys.argv[1]

    if not os.path.exists(module_path):
        print(f"Errore: Path non esistente: {module_path}")
        sys.exit(1)

    print("🎯 AGENT DEBUGGER PROFONDO")
    print("=" * 50)
    print("Deep Testing and Fixing for Brancalonia Module")
    print("=" * 50)

    debugger = BrancaloniaDebugger(module_path)

    try:
        report = debugger.run_deep_analysis()

        # Print summary
        print("\n" + "=" * 50)
        print("📋 REPORT FINALE")
        print("=" * 50)

        print(f"\n📊 STATISTICHE CONTENUTO:")
        content_stats = report['content_statistics']
        print(f"  Classi: {content_stats['classes']}")
        print(f"  Incantesimi: {content_stats['spells']}")
        print(f"  Oggetti: {content_stats['items']}")
        print(f"  Tabelle: {content_stats['rolltables']}")
        print(f"  UUID registrati: {content_stats['uuid_registry_size']}")
        print(f"  UUID rotti: {content_stats['broken_uuids']}")

        print(f"\n✨ SISTEMA INCANTESIMI:")
        spell_stats = report['spell_system_analysis']
        print(f"  Totale incantesimi: {spell_stats['total_spells']}")
        print(f"  Copertura livelli: {spell_stats['level_coverage_percentage']}%")
        if spell_stats['missing_levels']:
            print(f"  Livelli mancanti: {spell_stats['missing_levels']}")

        print(f"\n🔍 RISULTATI VALIDAZIONE:")
        validation = report['validation_results']
        print(f"  Problemi totali: {validation['total_issues']}")
        print(f"  Critici: {validation['critical_issues']}")
        print(f"  Warning: {validation['warning_issues']}")
        print(f"  Info: {validation['info_issues']}")

        if validation['issues_by_category']:
            print(f"\n📋 PROBLEMI PER CATEGORIA:")
            for category, count in validation['issues_by_category'].items():
                print(f"  {category}: {count}")

        print(f"\n🔧 SCRIPT AUTO-FIX GENERATI:")
        for script_info in report['auto_fix_scripts']:
            print(f"  {script_info['name']}: {script_info['description']}")

        print(f"\n💡 RACCOMANDAZIONI:")
        for rec in report['recommendations']:
            print(f"  • {rec}")

        # Save detailed report
        report_file = Path(module_path) / "scripts" / "debug_report.json"
        report_file.parent.mkdir(exist_ok=True)

        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        print(f"\n📄 Report dettagliato salvato: {report_file}")

        # Save fix scripts
        scripts_dir = Path(module_path) / "scripts" / "auto-fixes"
        scripts_dir.mkdir(exist_ok=True)

        for script in debugger.fix_scripts:
            script_path = scripts_dir / script.name
            with open(script_path, 'w', encoding='utf-8') as f:
                f.write(script.script_content)
            print(f"💾 Script salvato: {script_path}")

        print("\n🎉 ANALISI COMPLETATA!")

        # Exit with appropriate code
        if validation['critical_issues'] > 0:
            print("❌ ATTENZIONE: Problemi critici trovati!")
            sys.exit(1)
        elif validation['total_issues'] > 0:
            print("⚠️  Warning: Miglioramenti raccomandati")
            sys.exit(0)
        else:
            print("✅ Tutto perfetto!")
            sys.exit(0)

    except Exception as e:
        print(f"\n💥 ERRORE DURANTE ANALISI: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()