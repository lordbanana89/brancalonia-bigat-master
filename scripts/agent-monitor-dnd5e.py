#!/usr/bin/env python3
"""
AGENT_MONITOR - D&D 5e Repository Structure Analyzer

This script analyzes the official D&D 5e repository to understand:
- Class advancement structures
- UUID patterns
- Item formats
- Data organization

Author: Agent Monitor
Date: 2024
Purpose: Technical discovery for Brancalonia integration
"""

import os
import sys
import json
import subprocess
import shutil
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import re

try:
    import yaml
except ImportError:
    print("⚠️  Warning: PyYAML not installed. Installing...")
    subprocess.run([sys.executable, "-m", "pip", "install", "PyYAML"], check=True)
    import yaml

class DnD5eAnalyzer:
    def __init__(self):
        self.repo_url = "https://github.com/foundryvtt/dnd5e.git"
        self.branch = "release-5.1.9"
        self.analysis_dir = Path("/tmp/dnd5e-analysis")
        self.repo_dir = self.analysis_dir / "dnd5e"
        self.output_file = Path("/Users/erik/Desktop/brancalonia-bigat-master/technical-discoveries/dnd5e-structure-analysis.md")
        self.findings = {
            "advancement_types": {},
            "uuid_patterns": [],
            "class_structures": {},
            "item_formats": {},
            "metadata": {}
        }

    def setup_directories(self):
        """Create necessary directories"""
        self.analysis_dir.mkdir(exist_ok=True)
        self.output_file.parent.mkdir(exist_ok=True)
        print(f"📁 Created analysis directory: {self.analysis_dir}")
        print(f"📁 Output will be saved to: {self.output_file}")

    def clone_repository(self):
        """Clone or update the D&D 5e repository"""
        if self.repo_dir.exists():
            print(f"🔄 Repository already exists at {self.repo_dir}")
            print("🔄 Pulling latest changes...")
            try:
                subprocess.run([
                    "git", "-C", str(self.repo_dir), "pull", "origin", self.branch
                ], check=True, capture_output=True, text=True)
                print("✅ Repository updated successfully")
            except subprocess.CalledProcessError as e:
                print(f"⚠️  Warning: Could not update repository: {e}")
                print("🔄 Continuing with existing repository...")
        else:
            print(f"📥 Cloning D&D 5e repository from {self.repo_url}")
            print(f"🌿 Branch: {self.branch}")
            try:
                subprocess.run([
                    "git", "clone", "-b", self.branch, self.repo_url, str(self.repo_dir)
                ], check=True, capture_output=True, text=True)
                print("✅ Repository cloned successfully")
            except subprocess.CalledProcessError as e:
                print(f"❌ Error cloning repository: {e}")
                sys.exit(1)

    def find_data_files(self, patterns: List[str] = ["*.json", "*.yml", "*.yaml"]) -> List[Path]:
        """Find all data files matching patterns"""
        data_files = []
        for pattern in patterns:
            for file_path in self.repo_dir.rglob(pattern):
                if file_path.is_file():
                    data_files.append(file_path)
        return data_files

    def load_data_file(self, file_path: Path) -> Optional[Dict]:
        """Safely load a JSON or YAML file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                if file_path.suffix.lower() in ['.yml', '.yaml']:
                    return yaml.safe_load(f)
                else:
                    return json.load(f)
        except (json.JSONDecodeError, yaml.YAMLError, UnicodeDecodeError) as e:
            print(f"⚠️  Warning: Could not parse {file_path}: {e}")
            return None
        except Exception as e:
            print(f"⚠️  Warning: Error reading {file_path}: {e}")
            return None

    def analyze_advancement_structure(self, data: Dict, file_path: Path):
        """Analyze advancement structures in data"""
        def recursive_find_advancements(obj, path=""):
            if isinstance(obj, dict):
                if "advancement" in obj and isinstance(obj["advancement"], list):
                    for i, advancement in enumerate(obj["advancement"]):
                        if isinstance(advancement, dict) and "type" in advancement:
                            adv_type = advancement["type"]
                            adv_path = f"{path}.advancement[{i}]"

                            if adv_type not in self.findings["advancement_types"]:
                                self.findings["advancement_types"][adv_type] = {
                                    "examples": [],
                                    "common_properties": set(),
                                    "file_sources": []
                                }

                            # Store example with source info
                            example = {
                                "data": advancement,
                                "source_file": str(file_path.relative_to(self.repo_dir)),
                                "path": adv_path
                            }

                            if len(self.findings["advancement_types"][adv_type]["examples"]) < 5:
                                self.findings["advancement_types"][adv_type]["examples"].append(example)

                            # Track common properties
                            for key in advancement.keys():
                                self.findings["advancement_types"][adv_type]["common_properties"].add(key)

                            # Track source files
                            source_file = str(file_path.relative_to(self.repo_dir))
                            if source_file not in self.findings["advancement_types"][adv_type]["file_sources"]:
                                self.findings["advancement_types"][adv_type]["file_sources"].append(source_file)

                for key, value in obj.items():
                    recursive_find_advancements(value, f"{path}.{key}" if path else key)

            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    recursive_find_advancements(item, f"{path}[{i}]" if path else f"[{i}]")

        recursive_find_advancements(data)

    def analyze_uuid_patterns(self, data: Dict, file_path: Path):
        """Analyze UUID patterns in the data"""
        def find_uuids(obj, path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    if isinstance(value, str):
                        # Look for UUID patterns
                        if "uuid" in key.lower() or key.lower() == "id":
                            if value.startswith("Compendium."):
                                uuid_info = {
                                    "uuid": value,
                                    "context": key,
                                    "source_file": str(file_path.relative_to(self.repo_dir)),
                                    "path": f"{path}.{key}" if path else key
                                }
                                self.findings["uuid_patterns"].append(uuid_info)
                        # Also check for UUID-like strings in other fields
                        elif value.startswith("Compendium."):
                            uuid_info = {
                                "uuid": value,
                                "context": key,
                                "source_file": str(file_path.relative_to(self.repo_dir)),
                                "path": f"{path}.{key}" if path else key
                            }
                            self.findings["uuid_patterns"].append(uuid_info)
                    else:
                        find_uuids(value, f"{path}.{key}" if path else key)
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    find_uuids(item, f"{path}[{i}]" if path else f"[{i}]")

        find_uuids(data)

    def analyze_class_structures(self, data: Dict, file_path: Path):
        """Analyze class data structures"""
        if isinstance(data, dict):
            # Check if this looks like a class definition
            if "type" in data and data.get("type") == "class":
                class_name = data.get("name", "Unknown")
                class_info = {
                    "name": class_name,
                    "source_file": str(file_path.relative_to(self.repo_dir)),
                    "structure": {
                        "system_keys": list(data.get("system", {}).keys()) if "system" in data else [],
                        "has_advancement": "advancement" in data.get("system", {}),
                        "advancement_count": len(data.get("system", {}).get("advancement", [])),
                        "properties": list(data.keys())
                    }
                }
                self.findings["class_structures"][class_name] = class_info

            # Check if this is a classes collection
            elif "entries" in data or "items" in data:
                entries = data.get("entries", data.get("items", []))
                for entry in entries:
                    if isinstance(entry, dict) and entry.get("type") == "class":
                        self.analyze_class_structures(entry, file_path)

    def analyze_item_formats(self, data: Dict, file_path: Path):
        """Analyze item data formats"""
        def analyze_item(item_data, path=""):
            if isinstance(item_data, dict) and "type" in item_data:
                item_type = item_data["type"]
                if item_type not in self.findings["item_formats"]:
                    self.findings["item_formats"][item_type] = {
                        "examples": [],
                        "common_properties": set(),
                        "system_properties": set()
                    }

                # Store limited examples
                if len(self.findings["item_formats"][item_type]["examples"]) < 3:
                    example = {
                        "name": item_data.get("name", "Unknown"),
                        "source_file": str(file_path.relative_to(self.repo_dir)),
                        "data": item_data
                    }
                    self.findings["item_formats"][item_type]["examples"].append(example)

                # Track properties
                for key in item_data.keys():
                    self.findings["item_formats"][item_type]["common_properties"].add(key)

                if "system" in item_data and isinstance(item_data["system"], dict):
                    for key in item_data["system"].keys():
                        self.findings["item_formats"][item_type]["system_properties"].add(key)

        if isinstance(data, dict):
            if "type" in data:
                analyze_item(data)
            elif "entries" in data or "items" in data:
                entries = data.get("entries", data.get("items", []))
                for entry in entries:
                    analyze_item(entry)

    def analyze_files(self):
        """Analyze all data files in the repository"""
        print("🔍 Analyzing data files...")

        data_files = self.find_data_files()
        print(f"📊 Found {len(data_files)} data files")

        analyzed_count = 0
        for file_path in data_files:
            data = self.load_data_file(file_path)
            if data:
                self.analyze_advancement_structure(data, file_path)
                self.analyze_uuid_patterns(data, file_path)
                self.analyze_class_structures(data, file_path)
                self.analyze_item_formats(data, file_path)
                analyzed_count += 1

                if analyzed_count % 50 == 0:
                    print(f"📈 Analyzed {analyzed_count} files...")

        print(f"✅ Analyzed {analyzed_count} data files successfully")

        # Convert sets to lists for JSON serialization
        for adv_type in self.findings["advancement_types"]:
            self.findings["advancement_types"][adv_type]["common_properties"] = list(
                self.findings["advancement_types"][adv_type]["common_properties"]
            )

        for item_type in self.findings["item_formats"]:
            self.findings["item_formats"][item_type]["common_properties"] = list(
                self.findings["item_formats"][item_type]["common_properties"]
            )
            self.findings["item_formats"][item_type]["system_properties"] = list(
                self.findings["item_formats"][item_type]["system_properties"]
            )

    def generate_report(self):
        """Generate comprehensive technical report"""
        print("📝 Generating technical report...")

        report = f"""# D&D 5e Repository Structure Analysis

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Repository:** {self.repo_url}
**Branch:** {self.branch}
**Analysis Directory:** {self.analysis_dir}

## Executive Summary

This document provides a comprehensive analysis of the official D&D 5e module structure to understand how advancements, UUIDs, and data are organized for proper Brancalonia integration.

## Advancement Types Analysis

Found {len(self.findings['advancement_types'])} different advancement types:

"""

        # Advancement Types
        for adv_type, info in self.findings["advancement_types"].items():
            report += f"### {adv_type}\n\n"
            report += f"**Found in {len(info['file_sources'])} files**\n\n"
            report += f"**Common Properties:** {', '.join(sorted(info['common_properties']))}\n\n"

            if info["examples"]:
                report += "**Example Structure:**\n```json\n"
                report += json.dumps(info["examples"][0]["data"], indent=2)
                report += "\n```\n\n"

                report += "**Source Files:**\n"
                for source in info["file_sources"][:5]:  # Limit to first 5
                    report += f"- `{source}`\n"
                if len(info["file_sources"]) > 5:
                    report += f"- ... and {len(info['file_sources']) - 5} more\n"
                report += "\n"

        # UUID Patterns
        report += f"## UUID Pattern Analysis\n\n"
        report += f"Found {len(self.findings['uuid_patterns'])} UUID references\n\n"

        # Group UUIDs by pattern
        uuid_groups = {}
        for uuid_info in self.findings["uuid_patterns"]:
            uuid = uuid_info["uuid"]
            parts = uuid.split(".")
            if len(parts) >= 2:
                pattern = f"{parts[0]}.{parts[1]}"
                if pattern not in uuid_groups:
                    uuid_groups[pattern] = []
                uuid_groups[pattern].append(uuid_info)

        for pattern, uuids in uuid_groups.items():
            report += f"### {pattern}\n\n"
            report += f"**Count:** {len(uuids)}\n\n"
            report += "**Examples:**\n"
            for uuid_info in uuids[:5]:  # Show first 5 examples
                report += f"- `{uuid_info['uuid']}` (in {uuid_info['context']})\n"
            if len(uuids) > 5:
                report += f"- ... and {len(uuids) - 5} more\n"
            report += "\n"

        # Class Structures
        report += f"## Class Structure Analysis\n\n"
        report += f"Found {len(self.findings['class_structures'])} class definitions\n\n"

        for class_name, info in self.findings["class_structures"].items():
            report += f"### {class_name}\n\n"
            report += f"**Source:** `{info['source_file']}`\n\n"
            report += f"**Has Advancement:** {info['structure']['has_advancement']}\n\n"
            if info['structure']['has_advancement']:
                report += f"**Advancement Count:** {info['structure']['advancement_count']}\n\n"
            report += f"**Properties:** {', '.join(info['structure']['properties'])}\n\n"
            report += f"**System Keys:** {', '.join(info['structure']['system_keys'])}\n\n"

        # Item Formats
        report += f"## Item Format Analysis\n\n"
        report += f"Found {len(self.findings['item_formats'])} item types\n\n"

        for item_type, info in self.findings["item_formats"].items():
            report += f"### {item_type}\n\n"
            report += f"**Examples Found:** {len(info['examples'])}\n\n"
            report += f"**Common Properties:** {', '.join(sorted(info['common_properties']))}\n\n"
            report += f"**System Properties:** {', '.join(sorted(info['system_properties']))}\n\n"

            if info["examples"]:
                report += f"**Example: {info['examples'][0]['name']}**\n"
                report += f"Source: `{info['examples'][0]['source_file']}`\n\n"

        # Critical Findings
        report += "## Critical Findings for Brancalonia Integration\n\n"

        # Key advancement types
        key_advancements = ["ItemGrant", "SpellcastingValue", "ScaleValue", "HitPoints", "AbilityScoreImprovement"]
        found_advancements = [adv for adv in key_advancements if adv in self.findings["advancement_types"]]

        report += "### Key Advancement Types Found\n\n"
        for adv_type in found_advancements:
            info = self.findings["advancement_types"][adv_type]
            report += f"- **{adv_type}**: {len(info['examples'])} examples in {len(info['file_sources'])} files\n"

        missing_advancements = [adv for adv in key_advancements if adv not in self.findings["advancement_types"]]
        if missing_advancements:
            report += f"\n**Missing Key Advancements:** {', '.join(missing_advancements)}\n"

        # UUID patterns summary
        report += "\n### UUID Structure Patterns\n\n"
        report += "Based on analysis, UUIDs follow these patterns:\n\n"
        for pattern in sorted(uuid_groups.keys()):
            report += f"- `{pattern}.*` ({len(uuid_groups[pattern])} occurrences)\n"

        # Technical recommendations
        report += """

## Technical Recommendations

### 1. Advancement Structure
- Follow the exact property structure found in the official module
- Ensure all required properties are present for each advancement type
- Use consistent naming conventions

### 2. UUID Management
- Maintain the Compendium.{module}.{type}.{id} pattern
- Ensure UUIDs are unique across the module
- Use descriptive IDs that match the content

### 3. Data Organization
- Follow the same file organization as the official module
- Use consistent property names and structures
- Maintain backward compatibility with existing data

### 4. Integration Strategy
- Map Brancalonia advancement data to match D&D 5e structure
- Ensure proper reference resolution for UUIDs
- Test advancement functionality thoroughly

## Next Steps

1. Use this analysis to update Brancalonia advancement structures
2. Implement proper UUID generation and management
3. Test integration with the official D&D 5e advancement system
4. Validate all advancement types work correctly

---

*This analysis was generated by AGENT_MONITOR for the Brancalonia project*
"""

        # Write the report
        with open(self.output_file, 'w', encoding='utf-8') as f:
            f.write(report)

        print(f"✅ Technical report saved to: {self.output_file}")

        # Also save raw findings as JSON for further analysis
        json_output = self.output_file.with_suffix('.json')
        with open(json_output, 'w', encoding='utf-8') as f:
            json.dump(self.findings, f, indent=2, default=str)

        print(f"📊 Raw findings saved to: {json_output}")

    def run_analysis(self):
        """Run complete analysis"""
        print("🚀 Starting D&D 5e Repository Analysis")
        print("=" * 50)

        try:
            self.setup_directories()
            self.clone_repository()
            self.analyze_files()
            self.generate_report()

            print("\n✅ Analysis Complete!")
            print(f"📄 Report: {self.output_file}")
            print(f"📊 Data: {self.output_file.with_suffix('.json')}")

        except KeyboardInterrupt:
            print("\n🛑 Analysis interrupted by user")
            sys.exit(1)
        except Exception as e:
            print(f"\n❌ Analysis failed: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

def main():
    """Main entry point"""
    if len(sys.argv) > 1 and sys.argv[1] in ["-h", "--help"]:
        print(__doc__)
        return

    analyzer = DnD5eAnalyzer()
    analyzer.run_analysis()

if __name__ == "__main__":
    main()