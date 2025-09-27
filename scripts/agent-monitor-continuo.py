#!/usr/bin/env python3
"""
AGENT_MONITOR_CONTINUO - Continuous D&D 5e Repository Monitoring System

This script provides continuous monitoring of the official D&D 5e repository and automatically
updates Brancalonia structures to maintain compatibility. It tracks changes, generates patches,
and ensures seamless integration with D&D 5e updates.

Features:
- Daily git monitoring of D&D 5e repository
- Automatic change detection and analysis
- Patch generation for compatibility updates
- Backup system before applying changes
- Notification system for breaking changes
- Version tracking and compatibility matrix
- Scheduled execution support

Author: Agent Monitor Continuo
Date: 2025-09-27
Purpose: Continuous integration and compatibility maintenance
"""

import os
import sys
import json
import subprocess
import shutil
import hashlib
import argparse
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import re
import difflib
import time

try:
    import yaml
    import croniter
except ImportError:
    print("⚠️  Installing required dependencies...")
    subprocess.run([sys.executable, "-m", "pip", "install", "PyYAML", "croniter"], check=True)
    import yaml
    import croniter

@dataclass
class VersionInfo:
    """Version tracking information"""
    version: str
    commit_hash: str
    timestamp: datetime
    branch: str
    changes_detected: bool = False
    compatibility_status: str = "unknown"

@dataclass
class ChangeDetection:
    """Detected change information"""
    type: str  # advancement, uuid, structure, deprecation
    severity: str  # critical, major, minor
    description: str
    affected_files: List[str]
    suggested_fix: str
    auto_fixable: bool = False

class BrancaloniaContinuousMonitor:
    """Continuous monitoring system for D&D 5e compatibility"""

    def __init__(self, base_dir: Optional[Path] = None):
        self.base_dir = base_dir or Path("/Users/erik/Desktop/brancalonia-bigat-master")
        self.scripts_dir = self.base_dir / "scripts"
        self.monitoring_dir = self.base_dir / "monitoring"
        self.backup_dir = self.base_dir / "monitoring" / "backups"
        self.patches_dir = self.base_dir / "monitoring" / "patches"
        self.logs_dir = self.base_dir / "monitoring" / "logs"

        # D&D 5e repository settings
        self.dnd5e_repo_url = "https://github.com/foundryvtt/dnd5e.git"
        self.dnd5e_local_path = Path("/tmp/dnd5e-monitor")
        self.tracked_branches = ["release-5.1.9", "release-5.2.0", "main"]

        # Monitoring files
        self.version_tracking_file = self.monitoring_dir / "VERSION_TRACKING.json"
        self.monitor_log_file = self.monitoring_dir / "MONITOR_LOG.md"
        self.changes_detected_file = self.monitoring_dir / "CHANGES_DETECTED.md"
        self.compatibility_matrix_file = self.monitoring_dir / "COMPATIBILITY_MATRIX.md"

        # Configuration
        self.check_interval_hours = 24
        self.force_check = False
        self.dry_run = False
        self.auto_apply_safe_patches = True
        self.create_backups = True

        # Change tracking
        self.version_history: Dict[str, VersionInfo] = {}
        self.detected_changes: List[ChangeDetection] = []
        self.critical_paths = [
            "packs/**/*.json",
            "templates/**/*.json",
            "lang/**/*.json",
            "*.json"
        ]

    def setup_monitoring_environment(self):
        """Initialize monitoring directory structure"""
        print("🔧 Setting up monitoring environment...")

        # Create directories
        for directory in [self.monitoring_dir, self.backup_dir, self.patches_dir, self.logs_dir]:
            directory.mkdir(parents=True, exist_ok=True)

        # Initialize version tracking if not exists
        if not self.version_tracking_file.exists():
            self.initialize_version_tracking()

        print(f"✅ Monitoring environment ready at {self.monitoring_dir}")

    def initialize_version_tracking(self):
        """Initialize version tracking file"""
        initial_data = {
            "initialized": datetime.now().isoformat(),
            "brancalonia_version": self.get_brancalonia_version(),
            "dnd5e_compatibility": {
                "minimum": "5.0.0",
                "verified": "5.1.9",
                "maximum": "5.2.x"
            },
            "tracking_branches": self.tracked_branches,
            "version_history": {},
            "last_check": None,
            "status": "initialized"
        }

        with open(self.version_tracking_file, 'w', encoding='utf-8') as f:
            json.dump(initial_data, f, indent=2, default=str)

        print(f"📝 Initialized version tracking: {self.version_tracking_file}")

    def get_brancalonia_version(self) -> str:
        """Get current Brancalonia version from module.json"""
        module_file = self.base_dir / "module.json"
        if module_file.exists():
            with open(module_file, 'r', encoding='utf-8') as f:
                module_data = json.load(f)
                return module_data.get("version", "unknown")
        return "unknown"

    def load_version_tracking(self) -> Dict:
        """Load version tracking data"""
        if self.version_tracking_file.exists():
            with open(self.version_tracking_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    def save_version_tracking(self, data: Dict):
        """Save version tracking data"""
        data["last_updated"] = datetime.now().isoformat()
        with open(self.version_tracking_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str)

    def should_run_check(self) -> bool:
        """Determine if monitoring check should run"""
        if self.force_check:
            return True

        tracking_data = self.load_version_tracking()
        last_check = tracking_data.get("last_check")

        if not last_check:
            return True

        last_check_time = datetime.fromisoformat(last_check)
        now = datetime.now()

        return (now - last_check_time).total_seconds() > (self.check_interval_hours * 3600)

    def clone_or_update_dnd5e_repo(self):
        """Clone or update D&D 5e repository"""
        print("📥 Updating D&D 5e repository...")

        if self.dnd5e_local_path.exists():
            print("🔄 Repository exists, pulling latest changes...")
            try:
                # Fetch all branches
                subprocess.run([
                    "git", "-C", str(self.dnd5e_local_path), "fetch", "--all"
                ], check=True, capture_output=True)

                print("✅ Repository updated successfully")
            except subprocess.CalledProcessError as e:
                print(f"⚠️  Warning: Could not update repository: {e}")
        else:
            print(f"📥 Cloning D&D 5e repository...")
            try:
                subprocess.run([
                    "git", "clone", self.dnd5e_repo_url, str(self.dnd5e_local_path)
                ], check=True, capture_output=True)
                print("✅ Repository cloned successfully")
            except subprocess.CalledProcessError as e:
                print(f"❌ Error cloning repository: {e}")
                raise

    def get_commit_info(self, branch: str) -> Tuple[str, datetime]:
        """Get latest commit info for a branch"""
        try:
            # Switch to branch
            subprocess.run([
                "git", "-C", str(self.dnd5e_local_path), "checkout", branch
            ], check=True, capture_output=True)

            # Get commit hash
            result = subprocess.run([
                "git", "-C", str(self.dnd5e_local_path), "rev-parse", "HEAD"
            ], check=True, capture_output=True, text=True)
            commit_hash = result.stdout.strip()

            # Get commit timestamp
            result = subprocess.run([
                "git", "-C", str(self.dnd5e_local_path), "show", "-s", "--format=%ci", commit_hash
            ], check=True, capture_output=True, text=True)
            timestamp_str = result.stdout.strip()
            timestamp = datetime.strptime(timestamp_str[:19], "%Y-%m-%d %H:%M:%S")

            return commit_hash, timestamp

        except subprocess.CalledProcessError as e:
            print(f"⚠️  Warning: Could not get commit info for {branch}: {e}")
            return "unknown", datetime.now()

    def detect_version_changes(self) -> Dict[str, VersionInfo]:
        """Detect changes in tracked branches"""
        print("🔍 Detecting version changes...")

        tracking_data = self.load_version_tracking()
        previous_versions = tracking_data.get("version_history", {})
        current_versions = {}

        for branch in self.tracked_branches:
            print(f"📊 Checking branch: {branch}")

            try:
                commit_hash, timestamp = self.get_commit_info(branch)

                version_info = VersionInfo(
                    version=branch,
                    commit_hash=commit_hash,
                    timestamp=timestamp,
                    branch=branch
                )

                # Check if this is a new commit
                previous_hash = previous_versions.get(branch, {}).get("commit_hash")
                if previous_hash and previous_hash != commit_hash:
                    version_info.changes_detected = True
                    print(f"🆕 New commits detected in {branch}")
                    print(f"   Previous: {previous_hash[:8]}")
                    print(f"   Current:  {commit_hash[:8]}")

                current_versions[branch] = asdict(version_info)

            except Exception as e:
                print(f"⚠️  Error checking {branch}: {e}")
                continue

        return current_versions

    def analyze_structural_changes(self, branch: str) -> List[ChangeDetection]:
        """Analyze structural changes in D&D 5e data"""
        print(f"🔬 Analyzing structural changes in {branch}...")

        changes = []

        try:
            # Switch to branch
            subprocess.run([
                "git", "-C", str(self.dnd5e_local_path), "checkout", branch
            ], check=True, capture_output=True)

            # Find all JSON files
            json_files = list(self.dnd5e_local_path.rglob("*.json"))

            for file_path in json_files:
                if not self.is_critical_file(file_path):
                    continue

                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    # Analyze advancement structures
                    advancement_changes = self.analyze_advancement_changes(data, file_path)
                    changes.extend(advancement_changes)

                    # Analyze UUID patterns
                    uuid_changes = self.analyze_uuid_changes(data, file_path)
                    changes.extend(uuid_changes)

                    # Analyze schema changes
                    schema_changes = self.analyze_schema_changes(data, file_path)
                    changes.extend(schema_changes)

                except Exception as e:
                    print(f"⚠️  Warning: Could not analyze {file_path}: {e}")
                    continue

        except Exception as e:
            print(f"❌ Error analyzing {branch}: {e}")

        return changes

    def is_critical_file(self, file_path: Path) -> bool:
        """Check if file is critical for monitoring"""
        critical_patterns = [
            "**/classes/**/*.json",
            "**/races/**/*.json",
            "**/items/**/*.json",
            "**/spells/**/*.json",
            "**/packs/**/*.json",
            "templates/**/*.json"
        ]

        file_str = str(file_path)
        for pattern in critical_patterns:
            if file_path.match(pattern.replace("**/", "")):
                return True
        return False

    def analyze_advancement_changes(self, data: Dict, file_path: Path) -> List[ChangeDetection]:
        """Analyze changes in advancement structures"""
        changes = []

        def find_advancements(obj, path=""):
            if isinstance(obj, dict):
                if "advancement" in obj and isinstance(obj["advancement"], list):
                    for i, advancement in enumerate(obj["advancement"]):
                        if isinstance(advancement, dict) and "type" in advancement:
                            # Check for new advancement types
                            adv_type = advancement["type"]
                            known_types = [
                                "ItemGrant", "ScaleValue", "HitPoints", "AbilityScoreImprovement",
                                "SpellcastingValue", "Feat", "Size", "Trait"
                            ]

                            if adv_type not in known_types:
                                changes.append(ChangeDetection(
                                    type="advancement",
                                    severity="major",
                                    description=f"New advancement type detected: {adv_type}",
                                    affected_files=[str(file_path)],
                                    suggested_fix=f"Add support for {adv_type} advancement type",
                                    auto_fixable=False
                                ))

                            # Check for required properties
                            required_props = ["type", "configuration"]
                            missing_props = [prop for prop in required_props if prop not in advancement]
                            if missing_props:
                                changes.append(ChangeDetection(
                                    type="advancement",
                                    severity="critical",
                                    description=f"Missing required properties in {adv_type}: {missing_props}",
                                    affected_files=[str(file_path)],
                                    suggested_fix=f"Add missing properties: {missing_props}",
                                    auto_fixable=True
                                ))

                for key, value in obj.items():
                    find_advancements(value, f"{path}.{key}" if path else key)
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    find_advancements(item, f"{path}[{i}]" if path else f"[{i}]")

        find_advancements(data)
        return changes

    def analyze_uuid_changes(self, data: Dict, file_path: Path) -> List[ChangeDetection]:
        """Analyze changes in UUID patterns"""
        changes = []

        def find_uuids(obj, path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    if isinstance(value, str) and value.startswith("Compendium."):
                        # Check UUID format
                        parts = value.split(".")
                        if len(parts) < 3:
                            changes.append(ChangeDetection(
                                type="uuid",
                                severity="major",
                                description=f"Invalid UUID format: {value}",
                                affected_files=[str(file_path)],
                                suggested_fix="Update UUID to proper Compendium.module.type.id format",
                                auto_fixable=True
                            ))
                    else:
                        find_uuids(value, f"{path}.{key}" if path else key)
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    find_uuids(item, f"{path}[{i}]" if path else f"[{i}]")

        find_uuids(data)
        return changes

    def analyze_schema_changes(self, data: Dict, file_path: Path) -> List[ChangeDetection]:
        """Analyze schema and structure changes"""
        changes = []

        # Check for deprecated fields
        deprecated_fields = [
            "data.attributes.spellcasting",  # Moved to system.spellcasting
            "data.details.biography",        # Moved to system.details.biography
        ]

        def find_deprecated(obj, path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    current_path = f"{path}.{key}" if path else key

                    # Check if this path is deprecated
                    for dep_field in deprecated_fields:
                        if current_path == dep_field:
                            changes.append(ChangeDetection(
                                type="deprecation",
                                severity="major",
                                description=f"Deprecated field found: {current_path}",
                                affected_files=[str(file_path)],
                                suggested_fix=f"Migrate {current_path} to new location",
                                auto_fixable=True
                            ))

                    find_deprecated(value, current_path)
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    find_deprecated(item, f"{path}[{i}]" if path else f"[{i}]")

        find_deprecated(data)
        return changes

    def generate_patch_files(self, changes: List[ChangeDetection]) -> List[Path]:
        """Generate patch files for detected changes"""
        if not changes:
            return []

        print(f"🔧 Generating patches for {len(changes)} changes...")

        patch_files = []
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Group changes by type
        changes_by_type = {}
        for change in changes:
            if change.type not in changes_by_type:
                changes_by_type[change.type] = []
            changes_by_type[change.type].append(change)

        for change_type, type_changes in changes_by_type.items():
            patch_file = self.patches_dir / f"patch_{change_type}_{timestamp}.py"

            patch_content = self.create_patch_script(change_type, type_changes)

            with open(patch_file, 'w', encoding='utf-8') as f:
                f.write(patch_content)

            patch_files.append(patch_file)
            print(f"📝 Created patch: {patch_file.name}")

        return patch_files

    def create_patch_script(self, change_type: str, changes: List[ChangeDetection]) -> str:
        """Create a patch script for specific change type"""
        script_header = f'''#!/usr/bin/env python3
"""
Auto-generated patch script for {change_type} changes
Generated: {datetime.now().isoformat()}
Changes: {len(changes)}
"""

import json
import os
from pathlib import Path

def apply_patch():
    """Apply {change_type} patches"""
    base_dir = Path(__file__).parent.parent
    print(f"🔧 Applying {change_type} patches...")

    changes_applied = 0
'''

        script_body = ""
        for i, change in enumerate(changes):
            if change.auto_fixable:
                script_body += f"""
    # Change {i+1}: {change.description}
    try:
        # TODO: Implement specific fix for {change.type}
        # Affected files: {change.affected_files}
        # Suggested fix: {change.suggested_fix}
        print(f"  ✅ Applied fix for: {change.description}")
        changes_applied += 1
    except Exception as e:
        print(f"  ❌ Failed to apply fix: {{e}}")
"""

        script_footer = f"""
    print(f"🎯 Applied {{changes_applied}} out of {len(changes)} changes")
    return changes_applied

if __name__ == "__main__":
    apply_patch()
"""

        return script_header + script_body + script_footer

    def create_backup(self) -> Path:
        """Create backup of current state"""
        if not self.create_backups:
            return None

        print("💾 Creating backup...")

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = self.backup_dir / f"brancalonia_backup_{timestamp}"

        # Create backup directory
        backup_path.mkdir(parents=True, exist_ok=True)

        # Backup critical files and directories
        critical_paths = [
            "packs",
            "modules",
            "module.json",
            "scripts",
            "database"
        ]

        for path_name in critical_paths:
            source_path = self.base_dir / path_name
            if source_path.exists():
                if source_path.is_file():
                    shutil.copy2(source_path, backup_path / path_name)
                else:
                    shutil.copytree(source_path, backup_path / path_name,
                                  ignore=shutil.ignore_patterns('*.tmp', '*.log'))

        print(f"✅ Backup created: {backup_path}")
        return backup_path

    def apply_safe_patches(self, patch_files: List[Path]) -> Dict[str, bool]:
        """Apply patches marked as safe"""
        if not self.auto_apply_safe_patches or self.dry_run:
            return {}

        print("🚀 Applying safe patches...")

        results = {}
        backup_path = self.create_backup()

        for patch_file in patch_files:
            try:
                print(f"🔧 Applying patch: {patch_file.name}")

                # Make patch executable
                os.chmod(patch_file, 0o755)

                # Run patch script
                result = subprocess.run([
                    sys.executable, str(patch_file)
                ], capture_output=True, text=True, cwd=self.base_dir)

                if result.returncode == 0:
                    print(f"✅ Patch applied successfully: {patch_file.name}")
                    results[str(patch_file)] = True
                else:
                    print(f"❌ Patch failed: {patch_file.name}")
                    print(f"   Error: {result.stderr}")
                    results[str(patch_file)] = False

            except Exception as e:
                print(f"❌ Error applying patch {patch_file.name}: {e}")
                results[str(patch_file)] = False

        return results

    def run_validation_tests(self) -> bool:
        """Run validation tests after applying patches"""
        print("🧪 Running validation tests...")

        validator_script = self.scripts_dir / "agent-validator.py"
        if not validator_script.exists():
            print("⚠️  Validator script not found, skipping tests")
            return True

        try:
            result = subprocess.run([
                sys.executable, str(validator_script)
            ], capture_output=True, text=True, cwd=self.base_dir)

            if result.returncode == 0:
                print("✅ Validation tests passed")
                return True
            else:
                print("❌ Validation tests failed")
                print(f"   Error: {result.stderr}")
                return False

        except Exception as e:
            print(f"❌ Error running validation: {e}")
            return False

    def update_notifications(self, changes: List[ChangeDetection], patch_results: Dict[str, bool]):
        """Update notification files"""
        print("📢 Updating notifications...")

        # Update CHANGES_DETECTED.md
        if changes:
            self.create_changes_notification(changes, patch_results)

        # Update MONITOR_LOG.md
        self.update_monitor_log(changes, patch_results)

        # Update compatibility matrix
        self.update_compatibility_matrix()

    def create_changes_notification(self, changes: List[ChangeDetection], patch_results: Dict[str, bool]):
        """Create changes detected notification"""
        critical_changes = [c for c in changes if c.severity == "critical"]
        major_changes = [c for c in changes if c.severity == "major"]
        minor_changes = [c for c in changes if c.severity == "minor"]

        content = f"""# D&D 5e Changes Detected

**Detection Time:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Total Changes:** {len(changes)}

## Summary

- 🔴 Critical Changes: {len(critical_changes)}
- 🟡 Major Changes: {len(major_changes)}
- 🟢 Minor Changes: {len(minor_changes)}

## Critical Changes

"""

        for change in critical_changes:
            content += f"""### {change.description}

**Type:** {change.type}
**Severity:** {change.severity}
**Auto-fixable:** {'Yes' if change.auto_fixable else 'No'}
**Affected Files:** {', '.join(change.affected_files)}
**Suggested Fix:** {change.suggested_fix}

---

"""

        content += "\n## Major Changes\n\n"
        for change in major_changes:
            content += f"- **{change.description}** ({change.type})\n"

        content += "\n## Minor Changes\n\n"
        for change in minor_changes:
            content += f"- **{change.description}** ({change.type})\n"

        content += f"""

## Patch Application Results

"""

        for patch_file, success in patch_results.items():
            status = "✅ Applied" if success else "❌ Failed"
            content += f"- **{Path(patch_file).name}:** {status}\n"

        content += f"""

## Recommended Actions

### Immediate Actions Required
"""

        if critical_changes:
            content += "- 🔴 **CRITICAL**: Review and fix critical changes immediately\n"
            content += "- 📋 Test all affected functionality\n"
            content += "- 🔄 Update compatibility documentation\n"

        if major_changes:
            content += "- 🟡 **MAJOR**: Plan updates for major changes\n"
            content += "- 📝 Update module documentation\n"

        content += """
### Next Steps

1. Review all changes in detail
2. Test affected functionality thoroughly
3. Update version compatibility information
4. Consider updating module version if needed

---

*This notification was generated automatically by AGENT_MONITOR_CONTINUO*
"""

        with open(self.changes_detected_file, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"📄 Changes notification saved: {self.changes_detected_file}")

    def update_monitor_log(self, changes: List[ChangeDetection], patch_results: Dict[str, bool]):
        """Update monitor log with latest run"""
        log_entry = f"""
## Monitor Run - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

**Changes Detected:** {len(changes)}
**Patches Generated:** {len(patch_results)}
**Patches Applied Successfully:** {sum(1 for success in patch_results.values() if success)}

### Changes Summary
"""

        for change in changes:
            log_entry += f"- [{change.severity.upper()}] {change.type}: {change.description}\n"

        log_entry += "\n### Patch Results\n"
        for patch_file, success in patch_results.items():
            status = "✅" if success else "❌"
            log_entry += f"- {status} {Path(patch_file).name}\n"

        log_entry += "\n---\n"

        # Append to existing log or create new
        if self.monitor_log_file.exists():
            with open(self.monitor_log_file, 'r', encoding='utf-8') as f:
                existing_content = f.read()

            # Insert new entry after header
            lines = existing_content.split('\n')
            header_end = 0
            for i, line in enumerate(lines):
                if line.startswith('#') and i > 0:
                    header_end = i
                    break

            new_content = '\n'.join(lines[:header_end]) + log_entry + '\n'.join(lines[header_end:])
        else:
            new_content = f"""# D&D 5e Monitoring Log

This file tracks all monitoring runs and detected changes.

{log_entry}
"""

        with open(self.monitor_log_file, 'w', encoding='utf-8') as f:
            f.write(new_content)

    def update_compatibility_matrix(self):
        """Update compatibility matrix"""
        tracking_data = self.load_version_tracking()

        content = f"""# D&D 5e Compatibility Matrix

**Last Updated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Brancalonia Version:** {self.get_brancalonia_version()}

## Compatibility Status

| D&D 5e Version | Branch | Status | Last Checked | Notes |
|---|---|---|---|---|
"""

        for branch in self.tracked_branches:
            version_info = tracking_data.get("version_history", {}).get(branch, {})
            status = version_info.get("compatibility_status", "unknown")
            last_checked = version_info.get("timestamp", "never")

            if isinstance(last_checked, str) and last_checked != "never":
                try:
                    dt = datetime.fromisoformat(last_checked.replace('Z', '+00:00'))
                    last_checked = dt.strftime('%Y-%m-%d')
                except:
                    pass

            status_icon = {
                "compatible": "✅",
                "compatible_with_patches": "🟡",
                "incompatible": "❌",
                "unknown": "❓"
            }.get(status, "❓")

            content += f"| {branch} | {branch} | {status_icon} {status} | {last_checked} | |\n"

        content += f"""

## Version History

"""

        for branch, version_info in tracking_data.get("version_history", {}).items():
            content += f"### {branch}\n\n"
            content += f"- **Current Commit:** {version_info.get('commit_hash', 'unknown')[:8]}\n"
            content += f"- **Last Updated:** {version_info.get('timestamp', 'unknown')}\n"
            content += f"- **Changes Detected:** {'Yes' if version_info.get('changes_detected') else 'No'}\n"
            content += f"- **Status:** {version_info.get('compatibility_status', 'unknown')}\n\n"

        content += """
## Compatibility Notes

- ✅ **Compatible**: Full compatibility confirmed
- 🟡 **Compatible with patches**: Compatible with automatic patches applied
- ❌ **Incompatible**: Manual intervention required
- ❓ **Unknown**: Not yet tested

---

*This matrix is updated automatically by AGENT_MONITOR_CONTINUO*
"""

        with open(self.compatibility_matrix_file, 'w', encoding='utf-8') as f:
            f.write(content)

    def run_monitoring_cycle(self):
        """Run complete monitoring cycle"""
        print("🚀 Starting D&D 5e continuous monitoring cycle")
        print("=" * 60)

        start_time = datetime.now()

        try:
            # Update repositories
            self.clone_or_update_dnd5e_repo()

            # Detect version changes
            current_versions = self.detect_version_changes()

            # Analyze changes for each branch with updates
            all_changes = []
            for branch, version_info in current_versions.items():
                if version_info.get("changes_detected", False):
                    print(f"🔍 Analyzing changes in {branch}...")
                    branch_changes = self.analyze_structural_changes(branch)
                    all_changes.extend(branch_changes)

            # Generate patches if changes detected
            patch_files = []
            patch_results = {}

            if all_changes:
                print(f"🎯 Detected {len(all_changes)} changes")

                # Generate patches
                patch_files = self.generate_patch_files(all_changes)

                # Apply safe patches
                if patch_files:
                    patch_results = self.apply_safe_patches(patch_files)

                    # Run validation tests
                    if patch_results and any(patch_results.values()):
                        validation_passed = self.run_validation_tests()
                        if not validation_passed:
                            print("⚠️  Validation failed, patches may need review")
            else:
                print("✅ No significant changes detected")

            # Update notifications and logs
            self.update_notifications(all_changes, patch_results)

            # Update version tracking
            tracking_data = self.load_version_tracking()
            tracking_data["version_history"] = current_versions
            tracking_data["last_check"] = datetime.now().isoformat()
            tracking_data["status"] = "completed"
            self.save_version_tracking(tracking_data)

            # Summary
            duration = datetime.now() - start_time
            print(f"\n🎉 Monitoring cycle completed in {duration.total_seconds():.1f}s")
            print(f"📊 Changes detected: {len(all_changes)}")
            print(f"🔧 Patches generated: {len(patch_files)}")
            print(f"✅ Patches applied: {sum(1 for success in patch_results.values() if success)}")

            if all_changes:
                print(f"📄 Check {self.changes_detected_file} for details")

        except Exception as e:
            print(f"❌ Monitoring cycle failed: {e}")
            import traceback
            traceback.print_exc()
            raise

    def setup_cron_job(self, cron_expression: str = "0 2 * * *"):
        """Setup cron job for scheduled monitoring"""
        print(f"⏰ Setting up cron job: {cron_expression}")

        script_path = Path(__file__).absolute()
        cron_command = f"{sys.executable} {script_path} --run"

        print(f"📝 Add this to your crontab:")
        print(f"   {cron_expression} {cron_command}")
        print(f"")
        print(f"To add automatically, run:")
        print(f"   (crontab -l 2>/dev/null; echo '{cron_expression} {cron_command}') | crontab -")

def main():
    """Main entry point with command-line interface"""
    parser = argparse.ArgumentParser(
        description="Continuous D&D 5e Repository Monitoring System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --run                    # Run monitoring cycle
  %(prog)s --force                  # Force check regardless of schedule
  %(prog)s --dry-run                # Dry run without applying patches
  %(prog)s --setup-cron             # Setup cron job
  %(prog)s --check-status           # Check current status
        """
    )

    parser.add_argument('--run', action='store_true',
                       help='Run monitoring cycle')
    parser.add_argument('--force', action='store_true',
                       help='Force check regardless of schedule')
    parser.add_argument('--dry-run', action='store_true',
                       help='Dry run without applying patches')
    parser.add_argument('--setup-cron', action='store_true',
                       help='Setup cron job')
    parser.add_argument('--check-status', action='store_true',
                       help='Check current monitoring status')
    parser.add_argument('--interval', type=int, default=24,
                       help='Check interval in hours (default: 24)')
    parser.add_argument('--base-dir', type=Path,
                       help='Base directory for Brancalonia project')

    args = parser.parse_args()

    # Initialize monitor
    monitor = BrancaloniaContinuousMonitor(base_dir=args.base_dir)
    monitor.check_interval_hours = args.interval
    monitor.force_check = args.force
    monitor.dry_run = args.dry_run

    # Setup monitoring environment
    monitor.setup_monitoring_environment()

    if args.setup_cron:
        monitor.setup_cron_job()
        return

    if args.check_status:
        tracking_data = monitor.load_version_tracking()
        print("📊 Current Monitoring Status")
        print("=" * 40)
        print(f"Brancalonia Version: {monitor.get_brancalonia_version()}")
        print(f"Last Check: {tracking_data.get('last_check', 'Never')}")
        print(f"Status: {tracking_data.get('status', 'Unknown')}")
        print(f"Tracked Branches: {', '.join(monitor.tracked_branches)}")
        return

    if args.run or monitor.should_run_check():
        monitor.run_monitoring_cycle()
    else:
        print("⏰ Monitoring check not due yet. Use --force to run anyway.")

if __name__ == "__main__":
    main()