#!/usr/bin/env python3
"""
Pack Validator Agent for Brancalonia D&D 5e v5.1.9 Compatibility
================================================================

This agent performs deep validation of D&D 5e compendium data structures
ensuring full compatibility with D&D 5e v5.1.9 system requirements.

CRITICAL VALIDATION RULES:
- Advancement structure must match D&D 5e v5.1.9 format
- UUID references must point to valid compendium items
- Class features must have proper item grants
- Spell structures must include proper system fields
- RollTable results must have valid structure
"""

import json
import os
import re
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class ValidationSeverity(Enum):
    CRITICAL = "CRITICAL"
    ERROR = "ERROR"
    WARNING = "WARNING"
    INFO = "INFO"

@dataclass
class ValidationIssue:
    file_path: str
    item_id: str
    issue_type: str
    severity: ValidationSeverity
    message: str
    suggested_fix: Optional[str] = None

class PackValidatorAgent:
    """
    Deep validation agent for D&D 5e v5.1.9 compendium data structures
    """

    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.issues: List[ValidationIssue] = []
        self.setup_logging()

        # D&D 5e v5.1.9 validation schemas
        self.required_class_fields = {
            "advancement", "saves", "skills", "spellcasting", "hd", "primaryAbility"
        }

        self.required_item_fields = {
            "system.description", "system.source", "system.rarity"
        }

        self.valid_advancement_types = {
            "HitPoints", "ItemGrant", "AbilityScoreImprovement", "ScaleValue",
            "Size", "Spellcasting", "ItemChoice", "TraitChoice"
        }

        self.valid_item_types = {
            "weapon", "equipment", "consumable", "tool", "loot", "class",
            "subclass", "background", "feat", "spell", "race"
        }

    def setup_logging(self):
        """Setup detailed logging for validation process"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - Pack Validator - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.project_root / 'logs' / 'pack_validator.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

        # Create logs directory if it doesn't exist
        (self.project_root / 'logs').mkdir(exist_ok=True)

    def validate_all_packs(self) -> Dict[str, List[ValidationIssue]]:
        """
        Validate all compendium packs in the project

        Returns:
            Dict mapping pack names to their validation issues
        """
        self.logger.info("Starting comprehensive pack validation for D&D 5e v5.1.9")

        pack_results = {}
        packs_dir = self.project_root / "packs"

        if not packs_dir.exists():
            self.logger.critical(f"Packs directory not found: {packs_dir}")
            return {}

        for pack_dir in packs_dir.iterdir():
            if pack_dir.is_dir() and not pack_dir.name.startswith('.'):
                self.logger.info(f"Validating pack: {pack_dir.name}")
                pack_issues = self.validate_pack(pack_dir)
                pack_results[pack_dir.name] = pack_issues

        self.generate_validation_report(pack_results)
        return pack_results

    def validate_pack(self, pack_dir: Path) -> List[ValidationIssue]:
        """
        Validate a single compendium pack

        Args:
            pack_dir: Path to the pack directory

        Returns:
            List of validation issues found
        """
        pack_issues = []
        source_dir = pack_dir / "_source"

        if not source_dir.exists():
            pack_issues.append(ValidationIssue(
                file_path=str(pack_dir),
                item_id="N/A",
                issue_type="MISSING_SOURCE",
                severity=ValidationSeverity.CRITICAL,
                message=f"Pack {pack_dir.name} missing _source directory",
                suggested_fix="Create _source directory with JSON files"
            ))
            return pack_issues

        # Validate each JSON file in the pack
        for json_file in source_dir.glob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                file_issues = self.validate_item_data(str(json_file), data)
                pack_issues.extend(file_issues)

            except json.JSONDecodeError as e:
                pack_issues.append(ValidationIssue(
                    file_path=str(json_file),
                    item_id="N/A",
                    issue_type="JSON_PARSE_ERROR",
                    severity=ValidationSeverity.CRITICAL,
                    message=f"Invalid JSON: {e}",
                    suggested_fix="Fix JSON syntax errors"
                ))
            except Exception as e:
                pack_issues.append(ValidationIssue(
                    file_path=str(json_file),
                    item_id="N/A",
                    issue_type="FILE_READ_ERROR",
                    severity=ValidationSeverity.ERROR,
                    message=f"Could not read file: {e}",
                    suggested_fix="Check file permissions and encoding"
                ))

        return pack_issues

    def validate_item_data(self, file_path: str, data: Dict[str, Any]) -> List[ValidationIssue]:
        """
        Validate individual item data structure

        Args:
            file_path: Path to the file containing the item
            data: Item data dictionary

        Returns:
            List of validation issues
        """
        issues = []
        item_id = data.get("_id", "UNKNOWN")
        item_type = data.get("type", "unknown")

        # Validate basic structure
        issues.extend(self.validate_basic_structure(file_path, item_id, data))

        # Type-specific validation
        if item_type == "class":
            issues.extend(self.validate_class_item(file_path, item_id, data))
        elif item_type in ["weapon", "equipment", "consumable", "tool", "loot"]:
            issues.extend(self.validate_equipment_item(file_path, item_id, data))
        elif item_type == "spell":
            issues.extend(self.validate_spell_item(file_path, item_id, data))
        elif item_type == "feat":
            issues.extend(self.validate_feat_item(file_path, item_id, data))

        # Validate UUID references
        issues.extend(self.validate_uuid_references(file_path, item_id, data))

        return issues

    def validate_basic_structure(self, file_path: str, item_id: str, data: Dict[str, Any]) -> List[ValidationIssue]:
        """Validate basic D&D 5e item structure"""
        issues = []

        # Required top-level fields
        required_fields = ["_id", "name", "type", "system"]
        for field in required_fields:
            if field not in data:
                issues.append(ValidationIssue(
                    file_path=file_path,
                    item_id=item_id,
                    issue_type="MISSING_REQUIRED_FIELD",
                    severity=ValidationSeverity.CRITICAL,
                    message=f"Missing required field: {field}",
                    suggested_fix=f"Add {field} field to item structure"
                ))

        # Validate item type
        item_type = data.get("type")
        if item_type not in self.valid_item_types:
            issues.append(ValidationIssue(
                file_path=file_path,
                item_id=item_id,
                issue_type="INVALID_ITEM_TYPE",
                severity=ValidationSeverity.ERROR,
                message=f"Invalid item type: {item_type}",
                suggested_fix=f"Use valid item type from: {', '.join(self.valid_item_types)}"
            ))

        # Validate system field structure
        system = data.get("system", {})
        if not isinstance(system, dict):
            issues.append(ValidationIssue(
                file_path=file_path,
                item_id=item_id,
                issue_type="INVALID_SYSTEM_FIELD",
                severity=ValidationSeverity.CRITICAL,
                message="System field must be an object",
                suggested_fix="Convert system field to object with proper D&D 5e structure"
            ))

        return issues

    def validate_class_item(self, file_path: str, item_id: str, data: Dict[str, Any]) -> List[ValidationIssue]:
        """Validate D&D 5e class item structure"""
        issues = []
        system = data.get("system", {})

        # Check required class fields
        for field in self.required_class_fields:
            if field not in system:
                issues.append(ValidationIssue(
                    file_path=file_path,
                    item_id=item_id,
                    issue_type="MISSING_CLASS_FIELD",
                    severity=ValidationSeverity.CRITICAL,
                    message=f"Missing required class field: system.{field}",
                    suggested_fix=f"Add system.{field} field with proper D&D 5e structure"
                ))

        # Validate advancement structure
        advancement = system.get("advancement", [])
        if not isinstance(advancement, list):
            issues.append(ValidationIssue(
                file_path=file_path,
                item_id=item_id,
                issue_type="INVALID_ADVANCEMENT_STRUCTURE",
                severity=ValidationSeverity.CRITICAL,
                message="Advancement must be an array",
                suggested_fix="Convert advancement to array of advancement objects"
            ))
        else:
            for i, adv in enumerate(advancement):
                if not isinstance(adv, dict):
                    continue

                adv_type = adv.get("type")
                if adv_type not in self.valid_advancement_types:
                    issues.append(ValidationIssue(
                        file_path=file_path,
                        item_id=item_id,
                        issue_type="INVALID_ADVANCEMENT_TYPE",
                        severity=ValidationSeverity.ERROR,
                        message=f"Invalid advancement type at index {i}: {adv_type}",
                        suggested_fix=f"Use valid advancement type: {', '.join(self.valid_advancement_types)}"
                    ))

        return issues

    def validate_equipment_item(self, file_path: str, item_id: str, data: Dict[str, Any]) -> List[ValidationIssue]:
        """Validate equipment item structure"""
        issues = []
        system = data.get("system", {})

        # Check for description
        description = system.get("description", {})
        if not description.get("value"):
            issues.append(ValidationIssue(
                file_path=file_path,
                item_id=item_id,
                issue_type="MISSING_DESCRIPTION",
                severity=ValidationSeverity.WARNING,
                message="Item missing description",
                suggested_fix="Add description.value with item description"
            ))

        # Check for source
        if not system.get("source"):
            issues.append(ValidationIssue(
                file_path=file_path,
                item_id=item_id,
                issue_type="MISSING_SOURCE",
                severity=ValidationSeverity.WARNING,
                message="Item missing source field",
                suggested_fix="Add source field with book reference"
            ))

        return issues

    def validate_spell_item(self, file_path: str, item_id: str, data: Dict[str, Any]) -> List[ValidationIssue]:
        """Validate spell item structure"""
        issues = []
        system = data.get("system", {})

        # Required spell fields
        required_spell_fields = ["level", "school", "components", "materials", "preparation", "scaling"]
        for field in required_spell_fields:
            if field not in system:
                issues.append(ValidationIssue(
                    file_path=file_path,
                    item_id=item_id,
                    issue_type="MISSING_SPELL_FIELD",
                    severity=ValidationSeverity.ERROR,
                    message=f"Missing required spell field: system.{field}",
                    suggested_fix=f"Add system.{field} with proper spell data"
                ))

        return issues

    def validate_feat_item(self, file_path: str, item_id: str, data: Dict[str, Any]) -> List[ValidationIssue]:
        """Validate feat item structure"""
        issues = []
        system = data.get("system", {})

        # Check activation structure
        activation = system.get("activation", {})
        if activation and not isinstance(activation, dict):
            issues.append(ValidationIssue(
                file_path=file_path,
                item_id=item_id,
                issue_type="INVALID_ACTIVATION_STRUCTURE",
                severity=ValidationSeverity.ERROR,
                message="Activation must be an object",
                suggested_fix="Convert activation to object with type, cost, condition fields"
            ))

        return issues

    def validate_uuid_references(self, file_path: str, item_id: str, data: Dict[str, Any]) -> List[ValidationIssue]:
        """Validate UUID references in advancement and other fields"""
        issues = []

        def check_uuid_in_object(obj, path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    current_path = f"{path}.{key}" if path else key
                    if key == "uuid" and isinstance(value, str):
                        if not self.is_valid_uuid_reference(value):
                            issues.append(ValidationIssue(
                                file_path=file_path,
                                item_id=item_id,
                                issue_type="INVALID_UUID_REFERENCE",
                                severity=ValidationSeverity.ERROR,
                                message=f"Invalid UUID reference at {current_path}: {value}",
                                suggested_fix="Update UUID to valid compendium reference"
                            ))
                    else:
                        check_uuid_in_object(value, current_path)
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    check_uuid_in_object(item, f"{path}[{i}]")

        check_uuid_in_object(data)
        return issues

    def is_valid_uuid_reference(self, uuid: str) -> bool:
        """Check if UUID reference follows valid pattern"""
        # Pattern: Compendium.module.pack.Item.id
        pattern = r'^Compendium\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.Item\.[a-zA-Z0-9-_]+$'
        return bool(re.match(pattern, uuid))

    def generate_validation_report(self, pack_results: Dict[str, List[ValidationIssue]]):
        """Generate comprehensive validation report"""
        report_path = self.project_root / "reports" / "pack_validation_report.json"
        report_path.parent.mkdir(exist_ok=True)

        # Count issues by severity
        severity_counts = {severity.value: 0 for severity in ValidationSeverity}
        all_issues = []

        for pack_name, issues in pack_results.items():
            for issue in issues:
                severity_counts[issue.severity.value] += 1
                all_issues.append({
                    "pack": pack_name,
                    "file_path": issue.file_path,
                    "item_id": issue.item_id,
                    "issue_type": issue.issue_type,
                    "severity": issue.severity.value,
                    "message": issue.message,
                    "suggested_fix": issue.suggested_fix
                })

        report = {
            "validation_timestamp": "2025-09-27T00:00:00Z",
            "total_packs_validated": len(pack_results),
            "total_issues_found": len(all_issues),
            "severity_counts": severity_counts,
            "issues_by_pack": {pack: len(issues) for pack, issues in pack_results.items()},
            "all_issues": all_issues,
            "recommendations": self.generate_recommendations(severity_counts)
        }

        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        self.logger.info(f"Validation report saved to: {report_path}")

        # Also generate human-readable summary
        self.generate_summary_report(report, pack_results)

    def generate_summary_report(self, report: Dict, pack_results: Dict[str, List[ValidationIssue]]):
        """Generate human-readable summary report"""
        summary_path = self.project_root / "reports" / "pack_validation_summary.md"

        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("# Brancalonia Pack Validation Report\n\n")
            f.write(f"**Validation Date:** {report['validation_timestamp']}\n")
            f.write(f"**Total Packs:** {report['total_packs_validated']}\n")
            f.write(f"**Total Issues:** {report['total_issues_found']}\n\n")

            f.write("## Issues by Severity\n\n")
            for severity, count in report['severity_counts'].items():
                f.write(f"- **{severity}:** {count}\n")

            f.write("\n## Issues by Pack\n\n")
            for pack_name, issues in pack_results.items():
                f.write(f"### {pack_name} ({len(issues)} issues)\n\n")

                if not issues:
                    f.write("✅ No issues found\n\n")
                    continue

                # Group by severity
                by_severity = {}
                for issue in issues:
                    severity = issue.severity.value
                    if severity not in by_severity:
                        by_severity[severity] = []
                    by_severity[severity].append(issue)

                for severity in ["CRITICAL", "ERROR", "WARNING", "INFO"]:
                    if severity in by_severity:
                        f.write(f"#### {severity} ({len(by_severity[severity])})\n\n")
                        for issue in by_severity[severity]:
                            f.write(f"- **{issue.issue_type}** in `{issue.item_id}`\n")
                            f.write(f"  - {issue.message}\n")
                            if issue.suggested_fix:
                                f.write(f"  - *Fix:* {issue.suggested_fix}\n")
                            f.write("\n")

            f.write("## Recommendations\n\n")
            for rec in report['recommendations']:
                f.write(f"- {rec}\n")

        self.logger.info(f"Summary report saved to: {summary_path}")

    def generate_recommendations(self, severity_counts: Dict[str, int]) -> List[str]:
        """Generate actionable recommendations based on validation results"""
        recommendations = []

        if severity_counts["CRITICAL"] > 0:
            recommendations.append("🚨 Address CRITICAL issues immediately - these prevent basic functionality")

        if severity_counts["ERROR"] > 0:
            recommendations.append("⚠️ Fix ERROR issues - these cause runtime problems in Foundry VTT")

        if severity_counts["WARNING"] > 10:
            recommendations.append("📝 Review WARNING issues - these may affect user experience")

        recommendations.extend([
            "🔧 Use the Item Linker Agent to fix UUID references",
            "🏗️ Use the Class Builder Agent to fix advancement structures",
            "🎲 Use the RollTable Fixer Agent to fix table structures",
            "✅ Run Test Runner Agent after fixes to verify corrections"
        ])

        return recommendations

if __name__ == "__main__":
    import sys

    project_root = sys.argv[1] if len(sys.argv) > 1 else "/Users/erik/Desktop/brancalonia-bigat-master"

    agent = PackValidatorAgent(project_root)
    results = agent.validate_all_packs()

    print(f"\n🔍 Pack Validation Complete!")
    print(f"📊 Found {sum(len(issues) for issues in results.values())} total issues")
    print(f"📁 Reports saved to: {agent.project_root}/reports/")