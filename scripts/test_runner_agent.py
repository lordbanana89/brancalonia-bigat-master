#!/usr/bin/env python3
"""
Test Runner Agent for Brancalonia D&D 5e v5.1.9 Compatibility
============================================================

This agent performs automated testing of all fixes and modifications
ensuring proper functionality with D&D 5e v5.1.9 and Foundry VTT.

CRITICAL TESTING FUNCTIONS:
- Pre/post modification testing with fvtt CLI
- Pack integrity validation
- JSON schema validation
- UUID reference testing
- Class advancement testing
- Spell system testing
- RollTable functionality testing
"""

import json
import os
import subprocess
import logging
import time
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class TestResult:
    test_name: str
    test_type: str
    status: str  # "PASS", "FAIL", "SKIP", "ERROR"
    message: str
    execution_time: float
    details: Optional[Dict[str, Any]] = None

@dataclass
class PackTestResult:
    pack_name: str
    total_tests: int
    passed: int
    failed: int
    errors: int
    execution_time: float
    test_results: List[TestResult]

class TestRunnerAgent:
    """
    Comprehensive testing agent for D&D 5e v5.1.9 compatibility
    """

    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.setup_logging()

        # Test configuration
        self.test_results: List[TestResult] = []
        self.pack_results: List[PackTestResult] = []

        # Foundry CLI configuration
        self.fvtt_cli_available = self.check_fvtt_cli()

    def setup_logging(self):
        """Setup detailed logging for testing process"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - Test Runner - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.project_root / 'logs' / 'test_runner.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        (self.project_root / 'logs').mkdir(exist_ok=True)

    def check_fvtt_cli(self) -> bool:
        """Check if Foundry VTT CLI is available"""
        try:
            result = subprocess.run(['fvtt', '--version'],
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                self.logger.info(f"FVTT CLI available: {result.stdout.strip()}")
                return True
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass

        self.logger.warning("FVTT CLI not available - some tests will be skipped")
        return False

    def run_comprehensive_tests(self) -> Dict[str, Any]:
        """
        Run comprehensive test suite for all modifications

        Returns:
            Summary of all test results
        """
        self.logger.info("Starting comprehensive test suite for D&D 5e v5.1.9")

        start_time = time.time()

        # Phase 1: JSON validation tests
        self.logger.info("Phase 1: Running JSON validation tests...")
        json_results = self.run_json_validation_tests()

        # Phase 2: Pack integrity tests
        self.logger.info("Phase 2: Running pack integrity tests...")
        pack_results = self.run_pack_integrity_tests()

        # Phase 3: UUID reference tests
        self.logger.info("Phase 3: Running UUID reference tests...")
        uuid_results = self.run_uuid_reference_tests()

        # Phase 4: Class advancement tests
        self.logger.info("Phase 4: Running class advancement tests...")
        class_results = self.run_class_advancement_tests()

        # Phase 5: Spell system tests
        self.logger.info("Phase 5: Running spell system tests...")
        spell_results = self.run_spell_system_tests()

        # Phase 6: RollTable tests
        self.logger.info("Phase 6: Running RollTable tests...")
        table_results = self.run_rolltable_tests()

        # Phase 7: FVTT CLI tests (if available)
        if self.fvtt_cli_available:
            self.logger.info("Phase 7: Running FVTT CLI tests...")
            fvtt_results = self.run_fvtt_cli_tests()
        else:
            fvtt_results = []

        total_time = time.time() - start_time

        # Compile summary
        all_test_results = (json_results + pack_results + uuid_results +
                           class_results + spell_results + table_results + fvtt_results)

        summary = self.compile_test_summary(all_test_results, total_time)
        self.generate_test_report(summary)

        return summary

    def run_json_validation_tests(self) -> List[TestResult]:
        """Run JSON validation tests on all pack files"""
        json_results = []
        packs_dir = self.project_root / "packs"

        if not packs_dir.exists():
            return [TestResult("JSON_VALIDATION", "setup", "FAIL",
                             "Packs directory not found", 0.0)]

        for pack_dir in packs_dir.iterdir():
            if not pack_dir.is_dir() or pack_dir.name.startswith('.'):
                continue

            source_dir = pack_dir / "_source"
            if not source_dir.exists():
                continue

            pack_name = pack_dir.name
            self.logger.info(f"Testing JSON validation for pack: {pack_name}")

            for json_file in source_dir.glob("*.json"):
                result = self.test_json_file_validity(json_file, pack_name)
                json_results.append(result)

        return json_results

    def test_json_file_validity(self, json_file: Path, pack_name: str) -> TestResult:
        """Test validity of a single JSON file"""
        start_time = time.time()
        test_name = f"JSON_VALIDITY_{pack_name}_{json_file.name}"

        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Basic structure validation
            if not isinstance(data, dict):
                return TestResult(test_name, "json", "FAIL",
                                "Root must be object", time.time() - start_time)

            # Required fields validation
            required_fields = ["_id", "name", "type"]
            missing_fields = [field for field in required_fields if field not in data]

            if missing_fields:
                return TestResult(test_name, "json", "FAIL",
                                f"Missing fields: {', '.join(missing_fields)}",
                                time.time() - start_time)

            # D&D 5e specific validation
            validation_issues = self.validate_dnd5e_structure(data)
            if validation_issues:
                return TestResult(test_name, "json", "FAIL",
                                f"D&D 5e issues: {'; '.join(validation_issues)}",
                                time.time() - start_time)

            return TestResult(test_name, "json", "PASS",
                            "Valid JSON structure", time.time() - start_time)

        except json.JSONDecodeError as e:
            return TestResult(test_name, "json", "FAIL",
                            f"JSON parse error: {e}", time.time() - start_time)
        except Exception as e:
            return TestResult(test_name, "json", "ERROR",
                            f"Unexpected error: {e}", time.time() - start_time)

    def validate_dnd5e_structure(self, data: Dict[str, Any]) -> List[str]:
        """Validate D&D 5e specific structure requirements"""
        issues = []
        item_type = data.get("type")

        # Type-specific validation
        if item_type == "class":
            issues.extend(self.validate_class_structure(data))
        elif item_type == "spell":
            issues.extend(self.validate_spell_structure(data))
        elif item_type in ["weapon", "equipment", "consumable"]:
            issues.extend(self.validate_item_structure(data))

        return issues

    def validate_class_structure(self, data: Dict[str, Any]) -> List[str]:
        """Validate class structure"""
        issues = []
        system = data.get("system", {})

        required_class_fields = ["advancement", "saves", "hd", "primaryAbility"]
        for field in required_class_fields:
            if field not in system:
                issues.append(f"Missing class field: {field}")

        # Validate advancement
        advancement = system.get("advancement", [])
        if not isinstance(advancement, list):
            issues.append("Advancement must be array")
        else:
            for i, adv in enumerate(advancement):
                if not isinstance(adv, dict):
                    issues.append(f"Advancement {i} must be object")
                elif "type" not in adv:
                    issues.append(f"Advancement {i} missing type")

        return issues

    def validate_spell_structure(self, data: Dict[str, Any]) -> List[str]:
        """Validate spell structure"""
        issues = []
        system = data.get("system", {})

        required_spell_fields = ["level", "school", "components", "activation"]
        for field in required_spell_fields:
            if field not in system:
                issues.append(f"Missing spell field: {field}")

        # Validate spell level
        level = system.get("level")
        if level is not None and (not isinstance(level, int) or level < 0 or level > 9):
            issues.append(f"Invalid spell level: {level}")

        return issues

    def validate_item_structure(self, data: Dict[str, Any]) -> List[str]:
        """Validate item structure"""
        issues = []
        system = data.get("system", {})

        if "description" not in system:
            issues.append("Missing description")

        if "rarity" not in system:
            issues.append("Missing rarity")

        return issues

    def run_pack_integrity_tests(self) -> List[TestResult]:
        """Run pack integrity tests"""
        integrity_results = []
        packs_dir = self.project_root / "packs"

        if not packs_dir.exists():
            return [TestResult("PACK_INTEGRITY", "setup", "FAIL",
                             "Packs directory not found", 0.0)]

        for pack_dir in packs_dir.iterdir():
            if not pack_dir.is_dir() or pack_dir.name.startswith('.'):
                continue

            pack_name = pack_dir.name
            result = self.test_pack_integrity(pack_dir, pack_name)
            integrity_results.append(result)

        return integrity_results

    def test_pack_integrity(self, pack_dir: Path, pack_name: str) -> TestResult:
        """Test integrity of a single pack"""
        start_time = time.time()
        test_name = f"PACK_INTEGRITY_{pack_name}"

        try:
            source_dir = pack_dir / "_source"
            if not source_dir.exists():
                return TestResult(test_name, "integrity", "FAIL",
                                "Missing _source directory", time.time() - start_time)

            # Count files
            json_files = list(source_dir.glob("*.json"))
            if not json_files:
                return TestResult(test_name, "integrity", "FAIL",
                                "No JSON files found", time.time() - start_time)

            # Check for duplicates
            ids_seen = set()
            names_seen = set()
            duplicates = []

            for json_file in json_files:
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    item_id = data.get("_id")
                    item_name = data.get("name")

                    if item_id in ids_seen:
                        duplicates.append(f"Duplicate ID: {item_id}")
                    else:
                        ids_seen.add(item_id)

                    if item_name in names_seen:
                        duplicates.append(f"Duplicate name: {item_name}")
                    else:
                        names_seen.add(item_name)

                except Exception:
                    duplicates.append(f"Cannot read: {json_file.name}")

            if duplicates:
                return TestResult(test_name, "integrity", "FAIL",
                                f"Integrity issues: {'; '.join(duplicates[:5])}",
                                time.time() - start_time)

            return TestResult(test_name, "integrity", "PASS",
                            f"Pack integrity OK ({len(json_files)} files)",
                            time.time() - start_time)

        except Exception as e:
            return TestResult(test_name, "integrity", "ERROR",
                            f"Unexpected error: {e}", time.time() - start_time)

    def run_uuid_reference_tests(self) -> List[TestResult]:
        """Run UUID reference validation tests"""
        uuid_results = []

        # Build item registry first
        item_registry = self.build_test_item_registry()

        packs_dir = self.project_root / "packs"
        if not packs_dir.exists():
            return [TestResult("UUID_REFERENCES", "setup", "FAIL",
                             "Packs directory not found", 0.0)]

        for pack_dir in packs_dir.iterdir():
            if not pack_dir.is_dir() or pack_dir.name.startswith('.'):
                continue

            source_dir = pack_dir / "_source"
            if not source_dir.exists():
                continue

            pack_name = pack_dir.name

            for json_file in source_dir.glob("*.json"):
                result = self.test_uuid_references(json_file, pack_name, item_registry)
                uuid_results.append(result)

        return uuid_results

    def build_test_item_registry(self) -> Dict[str, str]:
        """Build registry of all available items for UUID testing"""
        registry = {}
        packs_dir = self.project_root / "packs"

        for pack_dir in packs_dir.iterdir():
            if not pack_dir.is_dir() or pack_dir.name.startswith('.'):
                continue

            source_dir = pack_dir / "_source"
            if not source_dir.exists():
                continue

            pack_name = pack_dir.name

            for json_file in source_dir.glob("*.json"):
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    item_id = data.get("_id")
                    if item_id:
                        uuid = f"Compendium.brancalonia-bigat.{pack_name}.Item.{item_id}"
                        registry[uuid] = json_file.name

                except Exception:
                    continue

        return registry

    def test_uuid_references(self, json_file: Path, pack_name: str,
                           item_registry: Dict[str, str]) -> TestResult:
        """Test UUID references in a single file"""
        start_time = time.time()
        test_name = f"UUID_REFS_{pack_name}_{json_file.name}"

        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            broken_uuids = []
            self.find_uuids_in_object(data, broken_uuids, item_registry)

            if broken_uuids:
                return TestResult(test_name, "uuid", "FAIL",
                                f"Broken UUIDs: {'; '.join(broken_uuids[:3])}",
                                time.time() - start_time)

            return TestResult(test_name, "uuid", "PASS",
                            "All UUID references valid", time.time() - start_time)

        except Exception as e:
            return TestResult(test_name, "uuid", "ERROR",
                            f"Error checking UUIDs: {e}", time.time() - start_time)

    def find_uuids_in_object(self, obj: Any, broken_uuids: List[str],
                           registry: Dict[str, str], path: str = ""):
        """Recursively find and validate UUIDs in object"""
        if isinstance(obj, dict):
            for key, value in obj.items():
                current_path = f"{path}.{key}" if path else key
                if key == "uuid" and isinstance(value, str):
                    if value.startswith("Compendium.brancalonia") and value not in registry:
                        broken_uuids.append(f"{current_path}:{value}")
                else:
                    self.find_uuids_in_object(value, broken_uuids, registry, current_path)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                self.find_uuids_in_object(item, broken_uuids, registry, f"{path}[{i}]")

    def run_class_advancement_tests(self) -> List[TestResult]:
        """Run class advancement validation tests"""
        class_results = []
        classes_pack = self.project_root / "packs" / "classi" / "_source"

        if not classes_pack.exists():
            return [TestResult("CLASS_ADVANCEMENT", "setup", "SKIP",
                             "No classes pack found", 0.0)]

        for json_file in classes_pack.glob("*.json"):
            result = self.test_class_advancement(json_file)
            class_results.append(result)

        return class_results

    def test_class_advancement(self, json_file: Path) -> TestResult:
        """Test class advancement structure"""
        start_time = time.time()
        test_name = f"CLASS_ADV_{json_file.stem}"

        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            if data.get("type") != "class":
                return TestResult(test_name, "class", "SKIP",
                                "Not a class item", time.time() - start_time)

            system = data.get("system", {})
            advancement = system.get("advancement", [])

            issues = []

            # Check for required advancement types
            adv_types = [adv.get("type") for adv in advancement]

            if "HitPoints" not in adv_types:
                issues.append("Missing HitPoints advancement")

            asi_count = adv_types.count("AbilityScoreImprovement")
            if asi_count < 5:
                issues.append(f"Insufficient ASI advancements: {asi_count}/5")

            # Check level coverage
            levels = [adv.get("level") for adv in advancement if adv.get("level")]
            missing_levels = []
            for level in range(1, 21):
                if level not in levels and level in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]:
                    # Check if this level should have features
                    if level in [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 20]:
                        missing_levels.append(level)

            if missing_levels and len(missing_levels) > 5:
                issues.append(f"Many levels without advancement: {len(missing_levels)}")

            if issues:
                return TestResult(test_name, "class", "FAIL",
                                f"Advancement issues: {'; '.join(issues)}",
                                time.time() - start_time)

            return TestResult(test_name, "class", "PASS",
                            f"Class advancement OK ({len(advancement)} entries)",
                            time.time() - start_time)

        except Exception as e:
            return TestResult(test_name, "class", "ERROR",
                            f"Error testing advancement: {e}", time.time() - start_time)

    def run_spell_system_tests(self) -> List[TestResult]:
        """Run spell system validation tests"""
        spell_results = []
        spells_pack = self.project_root / "packs" / "incantesimi" / "_source"

        if not spells_pack.exists():
            return [TestResult("SPELL_SYSTEM", "setup", "SKIP",
                             "No spells pack found", 0.0)]

        for json_file in spells_pack.glob("*.json"):
            result = self.test_spell_structure(json_file)
            spell_results.append(result)

        return spell_results

    def test_spell_structure(self, json_file: Path) -> TestResult:
        """Test spell structure"""
        start_time = time.time()
        test_name = f"SPELL_STRUCT_{json_file.stem}"

        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            if data.get("type") != "spell":
                return TestResult(test_name, "spell", "SKIP",
                                "Not a spell item", time.time() - start_time)

            system = data.get("system", {})
            issues = []

            # Required spell fields
            required_fields = ["level", "school", "components", "activation", "duration", "target", "range"]
            for field in required_fields:
                if field not in system:
                    issues.append(f"Missing {field}")

            # Validate level
            level = system.get("level")
            if level is not None and (not isinstance(level, int) or level < 0 or level > 9):
                issues.append(f"Invalid level: {level}")

            # Validate school
            valid_schools = ["abj", "con", "div", "enc", "evo", "ill", "nec", "trs"]
            school = system.get("school")
            if school and school not in valid_schools:
                issues.append(f"Invalid school: {school}")

            # Validate components
            components = system.get("components", {})
            if not isinstance(components, dict):
                issues.append("Components must be object")
            else:
                for comp in ["vocal", "somatic", "material"]:
                    if comp not in components:
                        issues.append(f"Missing component: {comp}")

            if issues:
                return TestResult(test_name, "spell", "FAIL",
                                f"Spell issues: {'; '.join(issues)}",
                                time.time() - start_time)

            return TestResult(test_name, "spell", "PASS",
                            f"Spell structure OK (Level {level})",
                            time.time() - start_time)

        except Exception as e:
            return TestResult(test_name, "spell", "ERROR",
                            f"Error testing spell: {e}", time.time() - start_time)

    def run_rolltable_tests(self) -> List[TestResult]:
        """Run RollTable validation tests"""
        table_results = []
        tables_pack = self.project_root / "packs" / "rollable-tables" / "_source"

        if not tables_pack.exists():
            return [TestResult("ROLLTABLES", "setup", "SKIP",
                             "No rollable-tables pack found", 0.0)]

        for json_file in tables_pack.glob("*.json"):
            result = self.test_rolltable_structure(json_file)
            table_results.append(result)

        return table_results

    def test_rolltable_structure(self, json_file: Path) -> TestResult:
        """Test RollTable structure"""
        start_time = time.time()
        test_name = f"TABLE_STRUCT_{json_file.stem}"

        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            issues = []

            # Check for table indicators
            if "results" not in data and "formula" not in data:
                return TestResult(test_name, "table", "SKIP",
                                "Not a rollable table", time.time() - start_time)

            # Validate results
            results = data.get("results", [])
            if not results:
                issues.append("Empty results array")
            else:
                for i, result in enumerate(results):
                    if not isinstance(result, dict):
                        issues.append(f"Result {i} not object")
                        continue

                    if "text" not in result:
                        issues.append(f"Result {i} missing text")
                    if "range" not in result:
                        issues.append(f"Result {i} missing range")

            # Validate formula
            formula = data.get("formula", "")
            if not formula:
                issues.append("Missing formula")
            elif not self.is_valid_dice_formula(formula):
                issues.append(f"Invalid formula: {formula}")

            if issues:
                return TestResult(test_name, "table", "FAIL",
                                f"Table issues: {'; '.join(issues[:3])}",
                                time.time() - start_time)

            return TestResult(test_name, "table", "PASS",
                            f"Table OK ({len(results)} results)",
                            time.time() - start_time)

        except Exception as e:
            return TestResult(test_name, "table", "ERROR",
                            f"Error testing table: {e}", time.time() - start_time)

    def is_valid_dice_formula(self, formula: str) -> bool:
        """Check if dice formula is valid"""
        import re
        pattern = r'^\d*d\d+([+-]\d+)?$'
        return bool(re.match(pattern, formula.strip()))

    def run_fvtt_cli_tests(self) -> List[TestResult]:
        """Run Foundry VTT CLI tests"""
        if not self.fvtt_cli_available:
            return []

        fvtt_results = []

        # Test pack/unpack cycle for each pack
        packs_dir = self.project_root / "packs"
        if not packs_dir.exists():
            return [TestResult("FVTT_CLI", "setup", "FAIL",
                             "Packs directory not found", 0.0)]

        for pack_dir in packs_dir.iterdir():
            if not pack_dir.is_dir() or pack_dir.name.startswith('.'):
                continue

            source_dir = pack_dir / "_source"
            if not source_dir.exists():
                continue

            pack_name = pack_dir.name
            result = self.test_fvtt_pack_cycle(pack_name)
            fvtt_results.append(result)

        return fvtt_results

    def test_fvtt_pack_cycle(self, pack_name: str) -> TestResult:
        """Test FVTT pack/unpack cycle"""
        start_time = time.time()
        test_name = f"FVTT_CYCLE_{pack_name}"

        try:
            # Change to project directory
            original_cwd = os.getcwd()
            os.chdir(self.project_root)

            # Test packing
            pack_result = subprocess.run(
                ['fvtt', 'package', 'pack', pack_name],
                capture_output=True, text=True, timeout=60
            )

            if pack_result.returncode != 0:
                return TestResult(test_name, "fvtt", "FAIL",
                                f"Pack failed: {pack_result.stderr}",
                                time.time() - start_time)

            # Test unpacking
            unpack_result = subprocess.run(
                ['fvtt', 'package', 'unpack', pack_name],
                capture_output=True, text=True, timeout=60
            )

            if unpack_result.returncode != 0:
                return TestResult(test_name, "fvtt", "FAIL",
                                f"Unpack failed: {unpack_result.stderr}",
                                time.time() - start_time)

            return TestResult(test_name, "fvtt", "PASS",
                            "Pack/unpack cycle successful",
                            time.time() - start_time)

        except subprocess.TimeoutExpired:
            return TestResult(test_name, "fvtt", "FAIL",
                            "FVTT CLI timeout", time.time() - start_time)
        except Exception as e:
            return TestResult(test_name, "fvtt", "ERROR",
                            f"FVTT CLI error: {e}", time.time() - start_time)
        finally:
            try:
                os.chdir(original_cwd)
            except:
                pass

    def compile_test_summary(self, all_results: List[TestResult],
                           total_time: float) -> Dict[str, Any]:
        """Compile comprehensive test summary"""
        summary = {
            "test_timestamp": "2025-09-27T00:00:00Z",
            "total_execution_time": total_time,
            "total_tests": len(all_results),
            "passed": len([r for r in all_results if r.status == "PASS"]),
            "failed": len([r for r in all_results if r.status == "FAIL"]),
            "errors": len([r for r in all_results if r.status == "ERROR"]),
            "skipped": len([r for r in all_results if r.status == "SKIP"]),
            "success_rate": 0.0,
            "results_by_type": {},
            "critical_failures": [],
            "all_results": all_results
        }

        # Calculate success rate
        if summary["total_tests"] > 0:
            summary["success_rate"] = (summary["passed"] /
                                     (summary["total_tests"] - summary["skipped"])) * 100

        # Group by test type
        by_type = defaultdict(lambda: {"passed": 0, "failed": 0, "errors": 0, "skipped": 0})
        for result in all_results:
            status_key = result.status.lower()
            if status_key not in by_type[result.test_type]:
                by_type[result.test_type][status_key] = 0
            by_type[result.test_type][status_key] += 1

        summary["results_by_type"] = dict(by_type)

        # Identify critical failures
        critical_types = ["json", "integrity", "fvtt"]
        for result in all_results:
            if result.test_type in critical_types and result.status in ["FAIL", "ERROR"]:
                summary["critical_failures"].append({
                    "test_name": result.test_name,
                    "message": result.message,
                    "type": result.test_type
                })

        return summary

    def generate_test_report(self, summary: Dict[str, Any]):
        """Generate comprehensive test report"""
        report_path = self.project_root / "reports" / "test_runner_report.json"
        report_path.parent.mkdir(exist_ok=True)

        # Prepare JSON-serializable report
        json_summary = {
            "test_timestamp": summary["test_timestamp"],
            "total_execution_time": summary["total_execution_time"],
            "total_tests": summary["total_tests"],
            "passed": summary["passed"],
            "failed": summary["failed"],
            "errors": summary["errors"],
            "skipped": summary["skipped"],
            "success_rate": summary["success_rate"],
            "results_by_type": summary["results_by_type"],
            "critical_failures": summary["critical_failures"],
            "test_results": [
                {
                    "test_name": result.test_name,
                    "test_type": result.test_type,
                    "status": result.status,
                    "message": result.message,
                    "execution_time": result.execution_time
                }
                for result in summary["all_results"]
            ]
        }

        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(json_summary, f, indent=2, ensure_ascii=False)

        self.logger.info(f"Test report saved to: {report_path}")

        # Generate human-readable summary
        self.generate_test_summary(summary, report_path.parent / "test_runner_summary.md")

    def generate_test_summary(self, summary: Dict[str, Any], summary_path: Path):
        """Generate human-readable test summary"""
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("# Brancalonia Test Runner Report\n\n")
            f.write(f"**Test Date:** {summary['test_timestamp']}\n")
            f.write(f"**Execution Time:** {summary['total_execution_time']:.2f} seconds\n\n")

            f.write("## Overall Results\n\n")
            f.write(f"- **Total Tests:** {summary['total_tests']}\n")
            f.write(f"- **Passed:** {summary['passed']} ✅\n")
            f.write(f"- **Failed:** {summary['failed']} ❌\n")
            f.write(f"- **Errors:** {summary['errors']} ⚠️\n")
            f.write(f"- **Skipped:** {summary['skipped']} ⏭️\n")
            f.write(f"- **Success Rate:** {summary['success_rate']:.1f}%\n\n")

            # Overall status
            if summary["critical_failures"]:
                f.write("🚨 **Status: CRITICAL ISSUES FOUND**\n\n")
            elif summary["failed"] > 0:
                f.write("⚠️ **Status: ISSUES NEED ATTENTION**\n\n")
            elif summary["passed"] > 0:
                f.write("✅ **Status: ALL TESTS PASSED**\n\n")

            f.write("## Results by Test Type\n\n")
            for test_type, results in summary["results_by_type"].items():
                total = sum(results.values())
                passed = results.get("passed", 0)
                rate = (passed / total * 100) if total > 0 else 0

                f.write(f"### {test_type.title()} ({rate:.1f}% success)\n")
                f.write(f"- Passed: {results.get('passed', 0)}\n")
                f.write(f"- Failed: {results.get('failed', 0)}\n")
                f.write(f"- Errors: {results.get('errors', 0)}\n")
                f.write(f"- Skipped: {results.get('skipped', 0)}\n\n")

            if summary["critical_failures"]:
                f.write("## Critical Failures\n\n")
                for failure in summary["critical_failures"]:
                    f.write(f"- **{failure['test_name']}** ({failure['type']})\n")
                    f.write(f"  - {failure['message']}\n\n")

            f.write("## Recommendations\n\n")
            if summary["critical_failures"]:
                f.write("1. 🚨 **Address critical failures immediately**\n")
                f.write("2. 🔧 Run specific agent fixes for failed areas\n")
                f.write("3. 🔄 Re-run tests after fixes\n")
            elif summary["failed"] > 0:
                f.write("1. 🔍 Review failed tests for minor issues\n")
                f.write("2. 🛠️ Apply targeted fixes\n")
                f.write("3. ✅ Validate fixes with re-testing\n")
            else:
                f.write("✅ **All systems operational!**\n\n")
                f.write("- All D&D 5e v5.1.9 compatibility checks passed\n")
                f.write("- Ready for production use in Foundry VTT\n")
                f.write("- Consider running UI Validator for final check\n")

        self.logger.info(f"Test summary saved to: {summary_path}")

if __name__ == "__main__":
    import sys

    project_root = sys.argv[1] if len(sys.argv) > 1 else "/Users/erik/Desktop/brancalonia-bigat-master"

    agent = TestRunnerAgent(project_root)
    results = agent.run_comprehensive_tests()

    print(f"\n✅ Test Suite Complete!")
    print(f"📊 {results['passed']}/{results['total_tests']} tests passed ({results['success_rate']:.1f}%)")
    if results['critical_failures']:
        print(f"🚨 {len(results['critical_failures'])} critical failures found!")
    print(f"📁 Reports saved to: {agent.project_root}/reports/")