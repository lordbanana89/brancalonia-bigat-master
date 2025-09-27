#!/usr/bin/env python3
"""
RollTable Fixer Agent for Brancalonia D&D 5e v5.1.9 Compatibility
================================================================

This agent restores and fixes RollTable structures ensuring proper
functionality and display in Foundry VTT with D&D 5e v5.1.9.

CRITICAL ROLLTABLE FUNCTIONS:
- Fix empty RollTable structures
- Ensure proper result ranges and weights
- Validate formula compatibility
- Fix missing table entries
- Implement proper D&D 5e table format
- Restore table functionality for random generation
"""

import json
import os
import re
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class TableResult:
    text: str
    weight: int
    range_start: int
    range_end: int
    result_type: int = 0
    drawn: bool = False

@dataclass
class TableFix:
    table_name: str
    file_path: str
    issue_type: str
    fix_applied: str
    results_count: int

class RollTableFixerAgent:
    """
    Intelligent agent for fixing and restoring RollTable structures
    """

    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.setup_logging()

        # Table repair statistics
        self.table_fixes: List[TableFix] = []
        self.table_templates = self.load_table_templates()

    def setup_logging(self):
        """Setup detailed logging for table fixing process"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - RollTable Fixer - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.project_root / 'logs' / 'rolltable_fixer.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        (self.project_root / 'logs').mkdir(exist_ok=True)

    def load_table_templates(self) -> Dict[str, Dict[str, Any]]:
        """Load templates for common D&D 5e table structures"""
        return {
            "d4": {"formula": "1d4", "max_result": 4},
            "d6": {"formula": "1d6", "max_result": 6},
            "d8": {"formula": "1d8", "max_result": 8},
            "d10": {"formula": "1d10", "max_result": 10},
            "d12": {"formula": "1d12", "max_result": 12},
            "d20": {"formula": "1d20", "max_result": 20},
            "d100": {"formula": "1d100", "max_result": 100},
            "2d6": {"formula": "2d6", "max_result": 12, "min_result": 2},
            "3d6": {"formula": "3d6", "max_result": 18, "min_result": 3}
        }

    def fix_all_tables(self) -> Dict[str, Any]:
        """
        Fix all RollTable structures in the project

        Returns:
            Summary of table fixing operations
        """
        self.logger.info("Starting comprehensive RollTable fixing for D&D 5e v5.1.9")

        # Phase 1: Analyze existing tables
        self.logger.info("Phase 1: Analyzing existing tables...")
        table_analysis = self.analyze_existing_tables()

        # Phase 2: Fix broken table structures
        self.logger.info("Phase 2: Fixing broken table structures...")
        structure_fixes = self.fix_table_structures()

        # Phase 3: Restore missing table data
        self.logger.info("Phase 3: Restoring missing table data...")
        data_restoration = self.restore_table_data()

        # Phase 4: Validate table formulas
        self.logger.info("Phase 4: Validating table formulas...")
        formula_fixes = self.validate_table_formulas()

        # Phase 5: Optimize table performance
        self.logger.info("Phase 5: Optimizing table performance...")
        performance_opts = self.optimize_table_performance()

        summary = {
            "tables_analyzed": len(table_analysis),
            "structure_fixes": len(structure_fixes),
            "data_restorations": len(data_restoration),
            "formula_fixes": len(formula_fixes),
            "performance_optimizations": len(performance_opts),
            "total_fixes": len(self.table_fixes)
        }

        self.generate_rolltable_report(summary)
        return summary

    def analyze_existing_tables(self) -> List[Dict[str, Any]]:
        """Analyze existing RollTable structures"""
        table_analysis = []
        tables_pack = self.project_root / "packs" / "rollable-tables" / "_source"

        if not tables_pack.exists():
            self.logger.warning("No rollable-tables pack found")
            return table_analysis

        for json_file in tables_pack.glob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                analysis = self.analyze_single_table(data, str(json_file))
                table_analysis.append(analysis)

            except Exception as e:
                self.logger.error(f"Error analyzing table {json_file}: {e}")
                table_analysis.append({
                    "file_path": str(json_file),
                    "table_name": "ERROR",
                    "issues": [f"Parse error: {e}"]
                })

        return table_analysis

    def analyze_single_table(self, data: Dict[str, Any], file_path: str) -> Dict[str, Any]:
        """Analyze a single RollTable structure"""
        table_name = data.get("name", "Unknown")
        issues = []
        stats = {
            "file_path": file_path,
            "table_name": table_name,
            "results_count": 0,
            "formula": data.get("formula", ""),
            "issues": issues
        }

        # Check if it's actually a RollTable
        if data.get("type") != "loot":  # In D&D 5e, RollTables are stored as loot type
            # Check for RollTable indicators
            if "results" not in data and "formula" not in data:
                issues.append("Not a valid RollTable structure")
                return stats

        # Check results structure
        results = data.get("results", [])
        stats["results_count"] = len(results)

        if not results:
            issues.append("Empty results array")
        else:
            # Validate result structure
            for i, result in enumerate(results):
                if not isinstance(result, dict):
                    issues.append(f"Result {i} is not an object")
                    continue

                # Check required fields
                required_fields = ["text", "weight", "range"]
                for field in required_fields:
                    if field not in result:
                        issues.append(f"Result {i} missing {field}")

                # Check range structure
                range_data = result.get("range", [])
                if not isinstance(range_data, list) or len(range_data) != 2:
                    issues.append(f"Result {i} has invalid range structure")

        # Check formula
        formula = data.get("formula", "")
        if not formula:
            issues.append("Missing formula")
        elif not self.is_valid_dice_formula(formula):
            issues.append(f"Invalid dice formula: {formula}")

        # Check formula vs results consistency
        if formula and results:
            expected_max = self.get_formula_max_result(formula)
            actual_max = max((r.get("range", [0, 0])[1] for r in results), default=0)

            if expected_max != actual_max:
                issues.append(f"Formula max ({expected_max}) doesn't match results max ({actual_max})")

        return stats

    def is_valid_dice_formula(self, formula: str) -> bool:
        """Check if dice formula is valid"""
        # Basic dice formula pattern: XdY, XdY+Z, XdY-Z
        pattern = r'^\d*d\d+([+-]\d+)?$'
        return bool(re.match(pattern, formula.strip()))

    def get_formula_max_result(self, formula: str) -> int:
        """Get maximum possible result from dice formula"""
        try:
            # Parse formula like "1d10", "2d6+3", etc.
            formula = formula.strip()

            # Extract modifier
            modifier = 0
            if '+' in formula:
                formula, mod_str = formula.split('+')
                modifier = int(mod_str)
            elif '-' in formula:
                formula, mod_str = formula.split('-')
                modifier = -int(mod_str)

            # Extract dice
            if 'd' in formula:
                if formula.startswith('d'):
                    dice_count = 1
                    die_size = int(formula[1:])
                else:
                    dice_count, die_size = map(int, formula.split('d'))

                return dice_count * die_size + modifier

        except (ValueError, IndexError):
            pass

        return 0

    def fix_table_structures(self) -> List[TableFix]:
        """Fix broken RollTable structures"""
        structure_fixes = []
        tables_pack = self.project_root / "packs" / "rollable-tables" / "_source"

        if not tables_pack.exists():
            return structure_fixes

        for json_file in tables_pack.glob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                table_name = data.get("name", "Unknown")
                fixes_applied = []

                # Fix basic structure
                if self.fix_basic_table_structure(data):
                    fixes_applied.append("basic_structure")

                # Fix results structure
                if self.fix_results_structure(data):
                    fixes_applied.append("results_structure")

                # Fix range consistency
                if self.fix_range_consistency(data):
                    fixes_applied.append("range_consistency")

                if fixes_applied:
                    # Save fixed table
                    with open(json_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)

                    fix = TableFix(
                        table_name=table_name,
                        file_path=str(json_file),
                        issue_type="structure",
                        fix_applied=", ".join(fixes_applied),
                        results_count=len(data.get("results", []))
                    )
                    structure_fixes.append(fix)
                    self.table_fixes.append(fix)

                    self.logger.info(f"Fixed structure for table: {table_name}")

            except Exception as e:
                self.logger.error(f"Error fixing table structure {json_file}: {e}")

        return structure_fixes

    def fix_basic_table_structure(self, data: Dict[str, Any]) -> bool:
        """Fix basic RollTable structure"""
        fixes_applied = False

        # Ensure it's marked as the correct type
        # In D&D 5e, RollTables can be stored as various types, but ensure consistency
        if data.get("type") == "loot" and "results" in data:
            # This is likely a RollTable stored as loot - that's fine
            pass
        elif "results" in data or "formula" in data:
            # This looks like a RollTable but might need type adjustment
            if data.get("type") != "loot":
                data["type"] = "loot"
                fixes_applied = True

        # Ensure required fields
        required_fields = {
            "name": "Unnamed Table",
            "img": "icons/svg/d20-highlight.svg",
            "results": [],
            "formula": "1d10",
            "replacement": True,
            "displayRoll": True,
            "folder": None,
            "sort": 0,
            "ownership": {"default": 0}
        }

        for field, default_value in required_fields.items():
            if field not in data:
                data[field] = default_value
                fixes_applied = True

        return fixes_applied

    def fix_results_structure(self, data: Dict[str, Any]) -> bool:
        """Fix RollTable results structure"""
        fixes_applied = False
        results = data.get("results", [])

        if not results:
            # If no results, try to generate default ones
            formula = data.get("formula", "1d10")
            default_results = self.generate_default_results(formula)
            if default_results:
                data["results"] = default_results
                fixes_applied = True

        else:
            # Fix existing results
            for i, result in enumerate(results):
                if not isinstance(result, dict):
                    continue

                # Ensure required fields
                if "_id" not in result:
                    result["_id"] = f"{data.get('name', 'table').lower().replace(' ', '_')}_{i}"
                    fixes_applied = True

                if "type" not in result:
                    result["type"] = 0  # Text result
                    fixes_applied = True

                if "weight" not in result:
                    result["weight"] = 1
                    fixes_applied = True

                if "drawn" not in result:
                    result["drawn"] = False
                    fixes_applied = True

                if "_key" not in result:
                    result["_key"] = f"!results!{result['_id']}"
                    fixes_applied = True

                # Fix text field
                if "text" not in result:
                    result["text"] = f"Result {i + 1}"
                    fixes_applied = True

        return fixes_applied

    def fix_range_consistency(self, data: Dict[str, Any]) -> bool:
        """Fix range consistency in RollTable results"""
        fixes_applied = False
        results = data.get("results", [])
        formula = data.get("formula", "1d10")

        if not results:
            return fixes_applied

        # Calculate expected range based on formula
        max_result = self.get_formula_max_result(formula)
        min_result = self.get_formula_min_result(formula)

        if max_result == 0:
            max_result = len(results)
            min_result = 1

        # Fix ranges to be sequential and consistent
        for i, result in enumerate(results):
            expected_value = min_result + i
            expected_range = [expected_value, expected_value]

            current_range = result.get("range", [])

            if current_range != expected_range:
                result["range"] = expected_range
                fixes_applied = True

        # Update formula if needed
        if len(results) != (max_result - min_result + 1):
            new_formula = f"1d{len(results)}"
            if data.get("formula") != new_formula:
                data["formula"] = new_formula
                fixes_applied = True

        return fixes_applied

    def get_formula_min_result(self, formula: str) -> int:
        """Get minimum possible result from dice formula"""
        try:
            formula = formula.strip()

            # Extract modifier
            modifier = 0
            if '+' in formula:
                formula, mod_str = formula.split('+')
                modifier = int(mod_str)
            elif '-' in formula:
                formula, mod_str = formula.split('-')
                modifier = -int(mod_str)

            # Extract dice
            if 'd' in formula:
                if formula.startswith('d'):
                    dice_count = 1
                else:
                    dice_count = int(formula.split('d')[0])

                return dice_count + modifier

        except (ValueError, IndexError):
            pass

        return 1

    def generate_default_results(self, formula: str) -> List[Dict[str, Any]]:
        """Generate default results for empty table"""
        max_result = self.get_formula_max_result(formula)
        min_result = self.get_formula_min_result(formula)

        if max_result == 0:
            return []

        results = []
        for i in range(min_result, max_result + 1):
            result = {
                "_id": f"default_result_{i}",
                "type": 0,
                "text": f"Result {i}",
                "weight": 1,
                "range": [i, i],
                "drawn": False,
                "_key": f"!results!default_result_{i}"
            }
            results.append(result)

        return results

    def restore_table_data(self) -> List[TableFix]:
        """Restore missing table data from known sources"""
        data_restorations = []

        # Check if we have backup data or can restore from database
        database_dir = self.project_root / "database"
        if database_dir.exists():
            data_restorations.extend(self.restore_from_database())

        # Try to restore from table reports
        reports_dir = self.project_root / "packs"
        tables_report = reports_dir / "tables_report.json"
        if tables_report.exists():
            data_restorations.extend(self.restore_from_report(tables_report))

        return data_restorations

    def restore_from_database(self) -> List[TableFix]:
        """Restore table data from database directory"""
        restorations = []
        database_dir = self.project_root / "database"

        # Look for table data in database
        for json_file in database_dir.rglob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                # Check if this looks like table data
                if self.is_table_data(data):
                    restoration = self.try_restore_table_from_data(data, str(json_file))
                    if restoration:
                        restorations.append(restoration)

            except Exception as e:
                self.logger.error(f"Error reading database file {json_file}: {e}")

        return restorations

    def is_table_data(self, data: Any) -> bool:
        """Check if data structure contains table information"""
        if isinstance(data, dict):
            # Check for table-like structure
            if "results" in data or "tabella" in data or "table" in str(data):
                return True

            # Check for array of table entries
            for key, value in data.items():
                if isinstance(value, list) and len(value) > 2:
                    # Check if list items look like table entries
                    if all(isinstance(item, (str, dict)) for item in value[:3]):
                        return True

        elif isinstance(data, list) and len(data) > 2:
            # Check if it's a list of table entries
            return all(isinstance(item, (str, dict)) for item in data[:3])

        return False

    def try_restore_table_from_data(self, data: Any, source_file: str) -> Optional[TableFix]:
        """Try to restore a table from data structure"""
        # This is a placeholder for complex table restoration logic
        # In practice, you'd need to analyze the specific data format
        # and map it to proper RollTable structure

        if isinstance(data, dict) and "results" in data:
            # Data already in table format
            table_name = data.get("name", Path(source_file).stem)

            # Convert to proper RollTable format
            restored_table = self.convert_to_rolltable_format(data, table_name)
            if restored_table:
                # Save restored table
                tables_dir = self.project_root / "packs" / "rollable-tables" / "_source"
                tables_dir.mkdir(parents=True, exist_ok=True)

                output_file = tables_dir / f"{table_name.lower().replace(' ', '_')}.json"
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(restored_table, f, indent=2, ensure_ascii=False)

                fix = TableFix(
                    table_name=table_name,
                    file_path=str(output_file),
                    issue_type="restoration",
                    fix_applied="restored_from_database",
                    results_count=len(restored_table.get("results", []))
                )
                self.table_fixes.append(fix)
                return fix

        return None

    def convert_to_rolltable_format(self, data: Dict[str, Any], table_name: str) -> Optional[Dict[str, Any]]:
        """Convert data to proper RollTable format"""
        results = data.get("results", [])
        if not results:
            return None

        # Build proper RollTable structure
        table = {
            "_id": table_name.lower().replace(' ', '_'),
            "name": table_name,
            "type": "loot",
            "img": "icons/svg/d20-highlight.svg",
            "results": [],
            "formula": f"1d{len(results)}",
            "replacement": True,
            "displayRoll": True,
            "folder": None,
            "sort": 0,
            "ownership": {"default": 0},
            "flags": {
                "brancalonia-bigat": {
                    "isOfficial": True,
                    "restored": True
                }
            },
            "_key": f"!items!{table_name.lower().replace(' ', '_')}",
            "effects": []
        }

        # Convert results
        for i, result_data in enumerate(results):
            result = {
                "_id": f"{table_name.lower().replace(' ', '_')}_{i}",
                "type": 0,
                "weight": 1,
                "range": [i + 1, i + 1],
                "drawn": False,
                "_key": f"!results!{table_name.lower().replace(' ', '_')}_{i}"
            }

            # Extract text
            if isinstance(result_data, str):
                result["text"] = result_data
            elif isinstance(result_data, dict):
                result["text"] = result_data.get("text", f"Result {i + 1}")
                result["weight"] = result_data.get("weight", 1)
            else:
                result["text"] = str(result_data)

            table["results"].append(result)

        return table

    def restore_from_report(self, report_file: Path) -> List[TableFix]:
        """Restore table data from existing reports"""
        restorations = []

        try:
            with open(report_file, 'r', encoding='utf-8') as f:
                report_data = json.load(f)

            # Extract table information from report
            if isinstance(report_data, dict):
                for key, value in report_data.items():
                    if "table" in key.lower() and isinstance(value, list):
                        restoration = self.restore_table_from_report_entry(key, value)
                        if restoration:
                            restorations.append(restoration)

        except Exception as e:
            self.logger.error(f"Error reading report file {report_file}: {e}")

        return restorations

    def restore_table_from_report_entry(self, table_name: str, entries: List[Any]) -> Optional[TableFix]:
        """Restore table from report entry"""
        if not entries or len(entries) < 2:
            return None

        # Create table structure
        table_data = {
            "name": table_name.replace('_', ' ').title(),
            "results": entries
        }

        return self.try_restore_table_from_data(table_data, f"report_{table_name}")

    def validate_table_formulas(self) -> List[TableFix]:
        """Validate and fix table formulas"""
        formula_fixes = []
        tables_pack = self.project_root / "packs" / "rollable-tables" / "_source"

        if not tables_pack.exists():
            return formula_fixes

        for json_file in tables_pack.glob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                table_name = data.get("name", "Unknown")

                if self.fix_table_formula(data):
                    # Save fixed table
                    with open(json_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)

                    fix = TableFix(
                        table_name=table_name,
                        file_path=str(json_file),
                        issue_type="formula",
                        fix_applied="formula_validation",
                        results_count=len(data.get("results", []))
                    )
                    formula_fixes.append(fix)
                    self.table_fixes.append(fix)

                    self.logger.info(f"Fixed formula for table: {table_name}")

            except Exception as e:
                self.logger.error(f"Error validating table formula {json_file}: {e}")

        return formula_fixes

    def fix_table_formula(self, data: Dict[str, Any]) -> bool:
        """Fix table formula to match results"""
        fixes_applied = False
        results = data.get("results", [])
        current_formula = data.get("formula", "")

        if not results:
            return fixes_applied

        # Calculate correct formula based on results
        result_count = len(results)
        max_range = max((r.get("range", [0, 0])[1] for r in results), default=result_count)
        min_range = min((r.get("range", [1, 1])[0] for r in results), default=1)

        # Determine best formula
        if min_range == 1 and max_range == result_count:
            correct_formula = f"1d{result_count}"
        elif min_range == 1:
            correct_formula = f"1d{max_range}"
        else:
            # Handle non-standard ranges
            correct_formula = f"1d{max_range - min_range + 1}"

        # Check if formula needs updating
        if current_formula != correct_formula:
            data["formula"] = correct_formula
            fixes_applied = True

        # Validate formula syntax
        if not self.is_valid_dice_formula(correct_formula):
            # Fallback to simple formula
            data["formula"] = f"1d{result_count}"
            fixes_applied = True

        return fixes_applied

    def optimize_table_performance(self) -> List[TableFix]:
        """Optimize tables for better Foundry VTT performance"""
        optimizations = []
        tables_pack = self.project_root / "packs" / "rollable-tables" / "_source"

        if not tables_pack.exists():
            return optimizations

        for json_file in tables_pack.glob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                table_name = data.get("name", "Unknown")

                if self.optimize_single_table(data):
                    # Save optimized table
                    with open(json_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)

                    fix = TableFix(
                        table_name=table_name,
                        file_path=str(json_file),
                        issue_type="optimization",
                        fix_applied="performance_optimization",
                        results_count=len(data.get("results", []))
                    )
                    optimizations.append(fix)
                    self.table_fixes.append(fix)

                    self.logger.info(f"Optimized table: {table_name}")

            except Exception as e:
                self.logger.error(f"Error optimizing table {json_file}: {e}")

        return optimizations

    def optimize_single_table(self, data: Dict[str, Any]) -> bool:
        """Optimize a single table for performance"""
        fixes_applied = False

        # Ensure proper flags for Brancalonia
        flags = data.setdefault("flags", {})
        brancalonia_flags = flags.setdefault("brancalonia-bigat", {})

        if "isOfficial" not in brancalonia_flags:
            brancalonia_flags["isOfficial"] = True
            fixes_applied = True

        # Optimize result structure
        results = data.get("results", [])
        for result in results:
            # Ensure consistent result structure
            if "type" not in result:
                result["type"] = 0
                fixes_applied = True

            if "drawn" not in result:
                result["drawn"] = False
                fixes_applied = True

        # Set optimal display settings
        if data.get("replacement") is not True:
            data["replacement"] = True
            fixes_applied = True

        if data.get("displayRoll") is not True:
            data["displayRoll"] = True
            fixes_applied = True

        return fixes_applied

    def generate_rolltable_report(self, summary: Dict[str, Any]):
        """Generate comprehensive RollTable fixing report"""
        report_path = self.project_root / "reports" / "rolltable_fixing_report.json"
        report_path.parent.mkdir(exist_ok=True)

        report = {
            "fixing_timestamp": "2025-09-27T00:00:00Z",
            "summary": summary,
            "table_fixes": [
                {
                    "table_name": fix.table_name,
                    "file_path": fix.file_path,
                    "issue_type": fix.issue_type,
                    "fix_applied": fix.fix_applied,
                    "results_count": fix.results_count
                }
                for fix in self.table_fixes
            ],
            "template_info": self.table_templates
        }

        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        self.logger.info(f"RollTable fixing report saved to: {report_path}")

        # Generate human-readable summary
        self.generate_rolltable_summary(summary, report_path.parent / "rolltable_fixing_summary.md")

    def generate_rolltable_summary(self, summary: Dict[str, Any], summary_path: Path):
        """Generate human-readable RollTable fixing summary"""
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("# Brancalonia RollTable Fixing Report\n\n")
            f.write("## Summary\n\n")
            f.write(f"- **Tables Analyzed:** {summary['tables_analyzed']}\n")
            f.write(f"- **Structure Fixes:** {summary['structure_fixes']}\n")
            f.write(f"- **Data Restorations:** {summary['data_restorations']}\n")
            f.write(f"- **Formula Fixes:** {summary['formula_fixes']}\n")
            f.write(f"- **Performance Optimizations:** {summary['performance_optimizations']}\n")
            f.write(f"- **Total Fixes:** {summary['total_fixes']}\n\n")

            # Group fixes by type
            fixes_by_type = defaultdict(list)
            for fix in self.table_fixes:
                fixes_by_type[fix.issue_type].append(fix)

            f.write("## Fixes by Type\n\n")
            for issue_type, fixes in fixes_by_type.items():
                f.write(f"### {issue_type.title()} ({len(fixes)})\n\n")
                for fix in fixes:
                    f.write(f"- **{fix.table_name}** ({fix.results_count} results)\n")
                    f.write(f"  - Fix: {fix.fix_applied}\n")
                    f.write(f"  - File: `{fix.file_path}`\n\n")

            f.write("## Next Steps\n\n")
            f.write("1. 🔮 Run Spell System Agent to integrate spells\n")
            f.write("2. ✅ Run Test Runner Agent to validate table functionality\n")
            f.write("3. 🎨 Run UI Validator Agent to check table rendering in Foundry\n")

        self.logger.info(f"RollTable fixing summary saved to: {summary_path}")

if __name__ == "__main__":
    import sys

    project_root = sys.argv[1] if len(sys.argv) > 1 else "/Users/erik/Desktop/brancalonia-bigat-master"

    agent = RollTableFixerAgent(project_root)
    results = agent.fix_all_tables()

    print(f"\n🎲 RollTable Fixing Complete!")
    print(f"📊 Analyzed {results['tables_analyzed']} tables")
    print(f"🔧 Applied {results['total_fixes']} fixes")
    print(f"📁 Reports saved to: {agent.project_root}/reports/")