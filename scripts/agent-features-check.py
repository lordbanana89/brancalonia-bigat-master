#!/usr/bin/env python3
"""
AGENT_FEATURES Validation Script

This script analyzes the relationship between class advancements and features
to ensure all feature items referenced by classes exist and are properly linked.

Features:
1. Scans all class advancement ItemGrants for UUID references
2. Checks if referenced features exist in the features pack
3. Validates existing features have proper structure
4. Generates comprehensive report of findings

Author: Claude Code Agent
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple
from dataclasses import dataclass
from datetime import datetime


@dataclass
class FeatureReference:
    """Represents a feature reference from a class advancement."""
    class_name: str
    level: int
    title: str
    uuid: str
    advancement_id: str
    optional: bool


@dataclass
class Feature:
    """Represents a feature from the features pack."""
    id: str
    key: str
    name: str
    type: str
    file_path: str
    has_description: bool
    source: str
    flag_id: str = None


@dataclass
class ValidationIssue:
    """Represents a validation issue found during analysis."""
    severity: str  # 'error', 'warning', 'info'
    category: str
    message: str
    details: str = ""


class AgentFeaturesChecker:
    """Main class for validating feature references and structures."""

    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.classes_path = self.base_path / "packs" / "classi" / "_source"
        self.features_path = self.base_path / "packs" / "brancalonia-features" / "_source"

        # Collections
        self.feature_references: List[FeatureReference] = []
        self.existing_features: Dict[str, Feature] = {}
        self.issues: List[ValidationIssue] = []

        # Statistics
        self.stats = {
            'classes_scanned': 0,
            'total_references': 0,
            'unique_references': 0,
            'existing_features': 0,
            'missing_features': 0,
            'orphaned_features': 0,
            'invalid_features': 0
        }

    def scan_class_advancements(self) -> None:
        """Scan all class files for ItemGrant advancements containing feature UUIDs."""
        print("📚 Scanning class advancement ItemGrants...")

        if not self.classes_path.exists():
            self.add_issue('error', 'file_system',
                          f"Classes path not found: {self.classes_path}")
            return

        class_files = list(self.classes_path.glob("*.json"))
        if not class_files:
            self.add_issue('warning', 'file_system',
                          f"No class files found in: {self.classes_path}")
            return

        for class_file in class_files:
            try:
                self._scan_class_file(class_file)
                self.stats['classes_scanned'] += 1
            except Exception as e:
                self.add_issue('error', 'parsing',
                              f"Failed to parse class file: {class_file.name}",
                              str(e))

        self.stats['total_references'] = len(self.feature_references)
        self.stats['unique_references'] = len(set(ref.uuid for ref in self.feature_references))

        print(f"   Found {self.stats['total_references']} feature references in {self.stats['classes_scanned']} classes")

    def _scan_class_file(self, class_file: Path) -> None:
        """Scan a single class file for feature references."""
        with open(class_file, 'r', encoding='utf-8') as f:
            class_data = json.load(f)

        class_name = class_data.get('name', class_file.stem)
        advancements = class_data.get('system', {}).get('advancement', [])

        for advancement in advancements:
            if advancement.get('type') == 'ItemGrant':
                self._extract_item_grants(advancement, class_name)

    def _extract_item_grants(self, advancement: dict, class_name: str) -> None:
        """Extract feature UUIDs from an ItemGrant advancement."""
        configuration = advancement.get('configuration', {})
        items = configuration.get('items', [])
        level = advancement.get('level', 0)
        title = advancement.get('title', 'Unknown')
        advancement_id = advancement.get('_id', 'unknown')

        for item in items:
            uuid = item.get('uuid', '')
            optional = item.get('optional', False)

            # Check if this is a brancalonia-features reference
            if 'brancalonia-features' in uuid:
                ref = FeatureReference(
                    class_name=class_name,
                    level=level,
                    title=title,
                    uuid=uuid,
                    advancement_id=advancement_id,
                    optional=optional
                )
                self.feature_references.append(ref)

    def scan_existing_features(self) -> None:
        """Scan the features directory to catalog existing features."""
        print("🔍 Scanning existing features...")

        if not self.features_path.exists():
            self.add_issue('error', 'file_system',
                          f"Features path not found: {self.features_path}")
            return

        feature_files = list(self.features_path.glob("*.json"))
        if not feature_files:
            self.add_issue('warning', 'file_system',
                          f"No feature files found in: {self.features_path}")
            return

        for feature_file in feature_files:
            try:
                self._scan_feature_file(feature_file)
            except Exception as e:
                self.add_issue('error', 'parsing',
                              f"Failed to parse feature file: {feature_file.name}",
                              str(e))

        self.stats['existing_features'] = len(self.existing_features)
        print(f"   Found {self.stats['existing_features']} existing features")

    def _scan_feature_file(self, feature_file: Path) -> None:
        """Scan a single feature file and validate its structure."""
        with open(feature_file, 'r', encoding='utf-8') as f:
            feature_data = json.load(f)

        # Extract feature information
        feature_id = feature_data.get('_id', '')
        feature_key = feature_data.get('_key', '')
        name = feature_data.get('name', '')
        feature_type = feature_data.get('type', '')

        # Check system structure
        system = feature_data.get('system', {})
        description = system.get('description', {})
        has_description = bool(description.get('value', '').strip())
        source = system.get('source', '')

        # Check for original ID flag
        flags = feature_data.get('flags', {})
        brancalonia_flags = flags.get('brancalonia', {})
        flag_id = brancalonia_flags.get('id_originale', '')

        feature = Feature(
            id=feature_id,
            key=feature_key,
            name=name,
            type=feature_type,
            file_path=str(feature_file),
            has_description=has_description,
            source=source,
            flag_id=flag_id
        )

        # Validate feature structure
        self._validate_feature_structure(feature, feature_data)

        # Store feature using both ID and filename as keys
        self.existing_features[feature_id] = feature
        # Also store by filename without extension for easier lookup
        self.existing_features[feature_file.stem] = feature

    def _validate_feature_structure(self, feature: Feature, data: dict) -> None:
        """Validate that a feature has proper structure."""
        issues = []

        # Required fields
        if not feature.id:
            issues.append("Missing _id field")
        if not feature.key:
            issues.append("Missing _key field")
        if not feature.name:
            issues.append("Missing name field")
        if not feature.type:
            issues.append("Missing type field")

        # System structure
        if 'system' not in data:
            issues.append("Missing system object")
        else:
            system = data['system']
            if 'description' not in system:
                issues.append("Missing system.description")
            elif not feature.has_description:
                issues.append("Empty or missing description value")

        # Record issues
        if issues:
            self.stats['invalid_features'] += 1
            issue_text = "; ".join(issues)
            self.add_issue('warning', 'validation',
                          f"Feature structure issues: {feature.name}",
                          issue_text)

    def analyze_feature_links(self) -> None:
        """Analyze the relationship between referenced and existing features."""
        print("🔗 Analyzing feature links...")

        referenced_uuids = set(ref.uuid for ref in self.feature_references)
        missing_features = []

        for ref in self.feature_references:
            if not self._feature_exists(ref.uuid):
                missing_features.append(ref)

        # Find orphaned features (exist but not referenced)
        orphaned_features = []
        for feature_id, feature in self.existing_features.items():
            if not self._is_feature_referenced(feature):
                orphaned_features.append(feature)

        self.stats['missing_features'] = len(missing_features)
        self.stats['orphaned_features'] = len(orphaned_features)

        # Record missing features as issues
        for ref in missing_features:
            self.add_issue('error', 'missing_feature',
                          f"Missing feature: {ref.title} (Level {ref.level})",
                          f"Class: {ref.class_name}, UUID: {ref.uuid}")

        # Record orphaned features as info
        for feature in orphaned_features:
            self.add_issue('info', 'orphaned_feature',
                          f"Orphaned feature: {feature.name}",
                          f"ID: {feature.id}, File: {Path(feature.file_path).name}")

        print(f"   Missing features: {self.stats['missing_features']}")
        print(f"   Orphaned features: {self.stats['orphaned_features']}")

    def _feature_exists(self, uuid: str) -> bool:
        """Check if a feature exists for the given UUID."""
        # Extract the feature ID from the UUID
        # Format: Compendium.brancalonia.brancalonia-features.Item.{feature_id}
        match = re.search(r'Compendium\.brancalonia\.brancalonia-features\.Item\.(.+)$', uuid)
        if not match:
            return False

        feature_id = match.group(1)
        return feature_id in self.existing_features

    def _is_feature_referenced(self, feature: Feature) -> bool:
        """Check if a feature is referenced by any class advancement."""
        for ref in self.feature_references:
            if feature.id in ref.uuid or (feature.flag_id and feature.flag_id in ref.uuid):
                return True
        return False

    def add_issue(self, severity: str, category: str, message: str, details: str = "") -> None:
        """Add a validation issue to the issues list."""
        issue = ValidationIssue(severity, category, message, details)
        self.issues.append(issue)

    def generate_report(self) -> str:
        """Generate a comprehensive markdown report of findings."""
        print("📝 Generating report...")

        report_lines = [
            "# Agent Features Validation Report",
            "",
            f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"Base path: {self.base_path}",
            "",
            "## Summary Statistics",
            "",
            f"- **Classes scanned**: {self.stats['classes_scanned']}",
            f"- **Total feature references**: {self.stats['total_references']}",
            f"- **Unique feature references**: {self.stats['unique_references']}",
            f"- **Existing features**: {self.stats['existing_features']}",
            f"- **Missing features**: {self.stats['missing_features']}",
            f"- **Orphaned features**: {self.stats['orphaned_features']}",
            f"- **Invalid features**: {self.stats['invalid_features']}",
            "",
        ]

        # Issues summary
        error_count = len([i for i in self.issues if i.severity == 'error'])
        warning_count = len([i for i in self.issues if i.severity == 'warning'])
        info_count = len([i for i in self.issues if i.severity == 'info'])

        report_lines.extend([
            "## Issues Summary",
            "",
            f"- **Errors**: {error_count}",
            f"- **Warnings**: {warning_count}",
            f"- **Info**: {info_count}",
            "",
        ])

        # Detailed sections
        self._add_features_by_class_section(report_lines)
        self._add_missing_features_section(report_lines)
        self._add_orphaned_features_section(report_lines)
        self._add_validation_issues_section(report_lines)
        self._add_all_references_section(report_lines)

        return "\n".join(report_lines)

    def _add_features_by_class_section(self, lines: List[str]) -> None:
        """Add section showing features referenced by each class."""
        lines.extend([
            "## Features Referenced by Class",
            "",
        ])

        # Group references by class
        by_class = {}
        for ref in self.feature_references:
            if ref.class_name not in by_class:
                by_class[ref.class_name] = []
            by_class[ref.class_name].append(ref)

        for class_name in sorted(by_class.keys()):
            refs = sorted(by_class[class_name], key=lambda x: x.level)
            lines.append(f"### {class_name}")
            lines.append("")

            for ref in refs:
                exists = "✅" if self._feature_exists(ref.uuid) else "❌"
                optional = " (optional)" if ref.optional else ""
                lines.append(f"- **Level {ref.level}**: {ref.title}{optional} {exists}")
                lines.append(f"  - UUID: `{ref.uuid}`")

            lines.append("")

    def _add_missing_features_section(self, lines: List[str]) -> None:
        """Add section listing missing features that need to be created."""
        missing_refs = [ref for ref in self.feature_references if not self._feature_exists(ref.uuid)]

        if not missing_refs:
            lines.extend([
                "## Missing Features",
                "",
                "✅ All referenced features exist!",
                "",
            ])
            return

        lines.extend([
            "## Missing Features",
            "",
            "The following features are referenced by classes but do not exist:",
            "",
        ])

        for ref in sorted(missing_refs, key=lambda x: (x.class_name, x.level)):
            lines.append(f"### {ref.title}")
            lines.append(f"- **Class**: {ref.class_name}")
            lines.append(f"- **Level**: {ref.level}")
            lines.append(f"- **Optional**: {ref.optional}")
            lines.append(f"- **UUID**: `{ref.uuid}`")
            lines.append(f"- **Advancement ID**: `{ref.advancement_id}`")
            lines.append("")

    def _add_orphaned_features_section(self, lines: List[str]) -> None:
        """Add section listing features that exist but are not referenced."""
        orphaned = [f for f in self.existing_features.values() if not self._is_feature_referenced(f)]
        # Remove duplicates (since we store features by both ID and filename)
        orphaned = list({f.id: f for f in orphaned}.values())

        if not orphaned:
            lines.extend([
                "## Orphaned Features",
                "",
                "✅ All existing features are referenced by classes!",
                "",
            ])
            return

        lines.extend([
            "## Orphaned Features",
            "",
            "The following features exist but are not referenced by any class:",
            "",
        ])

        for feature in sorted(orphaned, key=lambda x: x.name):
            lines.append(f"### {feature.name}")
            lines.append(f"- **ID**: `{feature.id}`")
            lines.append(f"- **Type**: {feature.type}")
            lines.append(f"- **Source**: {feature.source}")
            lines.append(f"- **File**: `{Path(feature.file_path).name}`")
            if feature.flag_id:
                lines.append(f"- **Original ID**: `{feature.flag_id}`")
            lines.append("")

    def _add_validation_issues_section(self, lines: List[str]) -> None:
        """Add section with validation issues."""
        if not self.issues:
            return

        lines.extend([
            "## Validation Issues",
            "",
        ])

        # Group by severity
        by_severity = {'error': [], 'warning': [], 'info': []}
        for issue in self.issues:
            by_severity[issue.severity].append(issue)

        for severity in ['error', 'warning', 'info']:
            issues = by_severity[severity]
            if not issues:
                continue

            severity_icon = {'error': '🚨', 'warning': '⚠️', 'info': 'ℹ️'}[severity]
            lines.append(f"### {severity_icon} {severity.title()}s")
            lines.append("")

            for issue in issues:
                lines.append(f"- **{issue.message}**")
                if issue.details:
                    lines.append(f"  - {issue.details}")

            lines.append("")

    def _add_all_references_section(self, lines: List[str]) -> None:
        """Add complete list of all feature references."""
        lines.extend([
            "## Complete Feature References List",
            "",
            "| Class | Level | Title | UUID | Exists | Optional |",
            "|-------|-------|-------|------|--------|----------|",
        ])

        for ref in sorted(self.feature_references, key=lambda x: (x.class_name, x.level)):
            exists = "✅" if self._feature_exists(ref.uuid) else "❌"
            optional = "Yes" if ref.optional else "No"
            # Truncate long UUIDs for table display
            short_uuid = ref.uuid[-50:] if len(ref.uuid) > 50 else ref.uuid
            lines.append(f"| {ref.class_name} | {ref.level} | {ref.title} | `{short_uuid}` | {exists} | {optional} |")

        lines.append("")

    def run_analysis(self) -> str:
        """Run the complete analysis and return the report."""
        print("🚀 Starting Agent Features Analysis...")
        print(f"Base path: {self.base_path}")
        print()

        try:
            # Step 1: Scan class advancements
            self.scan_class_advancements()

            # Step 2: Scan existing features
            self.scan_existing_features()

            # Step 3: Analyze relationships
            self.analyze_feature_links()

            # Step 4: Generate report
            report = self.generate_report()

            print("✅ Analysis complete!")
            return report

        except Exception as e:
            error_msg = f"❌ Analysis failed: {str(e)}"
            print(error_msg)
            self.add_issue('error', 'system', error_msg, str(e))
            return self.generate_report()


def main():
    """Main entry point for the script."""
    import sys

    # Get base path from command line or use current directory
    if len(sys.argv) > 1:
        base_path = sys.argv[1]
    else:
        base_path = os.getcwd()

    # Run analysis
    checker = AgentFeaturesChecker(base_path)
    report = checker.run_analysis()

    # Save report
    report_file = Path(base_path) / "features-check-report.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"📄 Report saved to: {report_file}")

    # Print summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Classes scanned: {checker.stats['classes_scanned']}")
    print(f"Feature references: {checker.stats['total_references']}")
    print(f"Missing features: {checker.stats['missing_features']}")
    print(f"Orphaned features: {checker.stats['orphaned_features']}")

    # Exit with error code if there are missing features
    if checker.stats['missing_features'] > 0:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()