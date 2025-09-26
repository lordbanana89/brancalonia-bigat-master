#!/usr/bin/env python3
"""
D&D 5e Repository Monitoring Agent

This script monitors the official D&D 5e repository for structure changes,
analyzes advancement implementations, and discovers technical details about
how features like ItemGrant, spell progression, and RollTables work.

Target Repository: https://github.com/foundryvtt/dnd5e/tree/release-5.1.9
"""

import requests
import json
import os
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional
import base64
import time


class DnD5eMonitor:
    """Monitor for D&D 5e repository analysis"""

    def __init__(self):
        self.base_url = "https://api.github.com/repos/foundryvtt/dnd5e"
        self.raw_base_url = "https://raw.githubusercontent.com/foundryvtt/dnd5e/release-5.1.9"
        self.branch = "release-5.1.9"
        self.session = requests.Session()
        self.discoveries = {
            "timestamp": datetime.now().isoformat(),
            "repository_info": {},
            "advancement_structures": {},
            "itemgrant_analysis": {},
            "spell_progression": {},
            "rolltable_format": {},
            "technical_findings": []
        }

    def log(self, message: str, level: str = "INFO"):
        """Log messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def fetch_github_content(self, path: str) -> Optional[Dict]:
        """Fetch content from GitHub API"""
        try:
            url = f"{self.base_url}/contents/{path}?ref={self.branch}"
            self.log(f"Fetching: {path}")
            response = self.session.get(url)

            if response.status_code == 200:
                data = response.json()
                if data.get('type') == 'file' and data.get('content'):
                    # Decode base64 content
                    content = base64.b64decode(data['content']).decode('utf-8')
                    try:
                        return json.loads(content)
                    except json.JSONDecodeError:
                        return {"raw_content": content}
                return data
            else:
                self.log(f"Failed to fetch {path}: {response.status_code}", "ERROR")
                return None
        except Exception as e:
            self.log(f"Error fetching {path}: {e}", "ERROR")
            return None

    def fetch_raw_content(self, path: str) -> Optional[str]:
        """Fetch raw content directly from GitHub"""
        try:
            url = f"{self.raw_base_url}/{path}"
            self.log(f"Fetching raw: {path}")
            response = self.session.get(url)

            if response.status_code == 200:
                return response.text
            else:
                self.log(f"Failed to fetch raw {path}: {response.status_code}", "ERROR")
                return None
        except Exception as e:
            self.log(f"Error fetching raw {path}: {e}", "ERROR")
            return None

    def analyze_repository_structure(self):
        """Analyze the overall repository structure"""
        self.log("Analyzing repository structure...")

        # Get repository info
        try:
            repo_info = self.session.get(self.base_url).json()
            self.discoveries["repository_info"] = {
                "name": repo_info.get("name"),
                "description": repo_info.get("description"),
                "default_branch": repo_info.get("default_branch"),
                "updated_at": repo_info.get("updated_at"),
                "size": repo_info.get("size")
            }
        except Exception as e:
            self.log(f"Error getting repo info: {e}", "ERROR")

        # Look for key directories
        key_paths = [
            "packs",
            "system.json",
            "template.json",
            "module",
            "lang"
        ]

        for path in key_paths:
            content = self.fetch_github_content(path)
            if content:
                self.discoveries["repository_info"][path] = content

    def analyze_advancement_structures(self):
        """Analyze advancement structures in class files"""
        self.log("Analyzing advancement structures...")

        advancement_examples = {}

        # Try to fetch template.json or data model files
        model_paths = [
            "template.json",
            "templates/actor/actor-5e.json",
            "templates/item/item-5e.json",
            "module/data/advancement/_module.mjs",
            "module/documents/_module.mjs"
        ]

        for path in model_paths:
            content = self.fetch_github_content(path)
            if content:
                advancement_examples[f"template_{path}"] = content

        # Try alternative paths based on actual repository structure
        # Look for directories that might contain source data
        potential_dirs = [
            "module",
            "templates",
            "lang",
            "json"
        ]

        for dir_name in potential_dirs:
            content = self.fetch_github_content(dir_name)
            if content and isinstance(content, list):
                self.log(f"Found directory: {dir_name}")
                # Look for relevant files in these directories
                for item in content[:10]:  # Limit to first 10 items
                    if item.get('type') == 'file':
                        file_name = item.get('name', '')
                        if any(keyword in file_name.lower() for keyword in ['class', 'advancement', 'template', 'data']):
                            file_content = self.fetch_github_content(item['path'])
                            if file_content:
                                advancement_examples[f"{dir_name}_{file_name}"] = file_content

        # Try to fetch raw JavaScript module files that might contain advancement data
        js_paths = [
            "module/data/advancement/advancement.mjs",
            "module/data/advancement/hit-points.mjs",
            "module/data/advancement/item-grant.mjs",
            "module/data/advancement/scale-value.mjs",
            "module/data/advancement/ability-score-improvement.mjs",
            "module/documents/item.mjs",
            "module/documents/actor.mjs"
        ]

        for path in js_paths:
            content = self.fetch_raw_content(path)
            if content:
                advancement_examples[f"module_{path}"] = {"raw_content": content}

        self.discoveries["advancement_structures"] = advancement_examples

        # Analyze advancement patterns
        self._analyze_advancement_patterns(advancement_examples)

    def _analyze_advancement_patterns(self, examples: Dict):
        """Analyze patterns in advancement structures"""
        patterns = {
            "advancement_types": set(),
            "level_distributions": {},
            "configuration_patterns": {},
            "itemgrant_examples": []
        }

        for file_name, content in examples.items():
            if isinstance(content, dict) and 'advancement' in content:
                advancement = content['advancement']
                if isinstance(advancement, list):
                    for adv in advancement:
                        if isinstance(adv, dict):
                            adv_type = adv.get('type')
                            if adv_type:
                                patterns["advancement_types"].add(adv_type)

                                level = adv.get('level', 0)
                                if level not in patterns["level_distributions"]:
                                    patterns["level_distributions"][level] = []
                                patterns["level_distributions"][level].append(adv_type)

                                if adv_type == "ItemGrant":
                                    patterns["itemgrant_examples"].append({
                                        "file": file_name,
                                        "level": level,
                                        "config": adv.get('configuration', {}),
                                        "full_advancement": adv
                                    })

        # Convert set to list for JSON serialization
        patterns["advancement_types"] = list(patterns["advancement_types"])

        self.discoveries["advancement_patterns"] = patterns

    def analyze_itemgrant_implementation(self):
        """Deep dive into ItemGrant implementation"""
        self.log("Analyzing ItemGrant implementation...")

        itemgrant_analysis = {
            "uuid_patterns": [],
            "reference_formats": [],
            "item_structures": {},
            "source_code_analysis": {}
        }

        # Look for ItemGrant implementation in source code
        itemgrant_paths = [
            "module/data/advancement/item-grant.mjs",
            "module/data/advancement/advancement.mjs",
            "module/data/item.mjs",
            "module/documents/item.mjs",
            "module/applications/advancement/item-grant-config.mjs"
        ]

        for path in itemgrant_paths:
            content = self.fetch_raw_content(path)
            if content:
                itemgrant_analysis["source_code_analysis"][path] = content

                # Extract UUID patterns from source code
                import re
                uuid_matches = re.findall(r'Compendium\.[a-zA-Z0-9\.\-_]*', content)
                if uuid_matches:
                    itemgrant_analysis["uuid_patterns"].extend(uuid_matches)

        # Look for any JSON files that might contain UUID examples
        json_paths = [
            "json",
            "lang/en.json"
        ]

        for path in json_paths:
            content = self.fetch_github_content(path)
            if content:
                if isinstance(content, list):
                    # Directory listing
                    for item in content[:5]:
                        if item.get('type') == 'file' and item['name'].endswith('.json'):
                            file_content = self.fetch_github_content(item['path'])
                            if file_content:
                                content_str = json.dumps(file_content)
                                if 'compendium' in content_str.lower() or 'uuid' in content_str.lower():
                                    itemgrant_analysis["item_structures"][item['name']] = file_content
                else:
                    # Single file
                    content_str = json.dumps(content)
                    if 'compendium' in content_str.lower() or 'uuid' in content_str.lower():
                        itemgrant_analysis["item_structures"][path] = content

        self.discoveries["itemgrant_analysis"] = itemgrant_analysis

    def analyze_spell_progression(self):
        """Analyze spell progression implementation"""
        self.log("Analyzing spell progression...")

        spell_analysis = {
            "spellcasting_configurations": {},
            "spell_slot_tables": {},
            "progression_types": [],
            "spell_source_code": {}
        }

        # Look for spellcasting implementation in source code
        spellcasting_paths = [
            "module/data/actor/spellcasting.mjs",
            "module/data/item/spell.mjs",
            "module/documents/actor.mjs",
            "module/documents/item.mjs",
            "module/data/advancement/spell-configuration.mjs"
        ]

        for path in spellcasting_paths:
            content = self.fetch_raw_content(path)
            if content:
                spell_analysis["spell_source_code"][path] = content

        # Look for spell slot progression data
        progression_paths = [
            "json/class-spell-slots.json",
            "json/spellcasting.json",
            "lang/en.json"
        ]

        for path in progression_paths:
            content = self.fetch_github_content(path)
            if content:
                spell_analysis["spellcasting_configurations"][path] = content

        # Look for spell progression in class files (from advancement analysis)
        if "advancement_structures" in self.discoveries:
            for file_name, content in self.discoveries["advancement_structures"].items():
                if isinstance(content, dict):
                    if 'spellcasting' in content:
                        spell_analysis["progression_types"].append({
                            "file": file_name,
                            "spellcasting": content['spellcasting']
                        })

        self.discoveries["spell_progression"] = spell_analysis

    def analyze_rolltable_format(self):
        """Analyze RollTable results format"""
        self.log("Analyzing RollTable format...")

        rolltable_analysis = {
            "table_structures": {},
            "result_formats": [],
            "dice_formulas": [],
            "rolltable_source_code": {}
        }

        # Look for RollTable implementation in source code
        rolltable_paths = [
            "module/documents/roll-table.mjs",
            "module/data/shared/roll-table.mjs",
            "module/dice/dice.mjs"
        ]

        for path in rolltable_paths:
            content = self.fetch_raw_content(path)
            if content:
                rolltable_analysis["rolltable_source_code"][path] = content

        # Look for JSON data that might contain table examples
        json_dirs = ["json"]
        for dir_name in json_dirs:
            content = self.fetch_github_content(dir_name)
            if content and isinstance(content, list):
                for item in content:
                    if item.get('type') == 'file' and 'table' in item.get('name', '').lower():
                        file_content = self.fetch_github_content(item['path'])
                        if file_content:
                            rolltable_analysis["table_structures"][item['name']] = file_content

                            # Extract result format patterns
                            content_str = json.dumps(file_content)
                            if 'result' in content_str.lower():
                                rolltable_analysis["result_formats"].append({
                                    "file": item['name'],
                                    "content": file_content
                                })

        self.discoveries["rolltable_format"] = rolltable_analysis

    def discover_technical_details(self):
        """Discover technical implementation details"""
        self.log("Discovering technical details...")

        technical_findings = []

        # UUID format analysis
        if self.discoveries.get("itemgrant_analysis", {}).get("uuid_patterns"):
            uuid_patterns = self.discoveries["itemgrant_analysis"]["uuid_patterns"]
            unique_patterns = list(set(uuid_patterns))
            technical_findings.append({
                "category": "UUID Format",
                "finding": f"Found {len(unique_patterns)} unique UUID patterns",
                "details": unique_patterns[:10],  # Show first 10
                "pattern_analysis": self._analyze_uuid_patterns(unique_patterns)
            })

        # Advancement level analysis
        if self.discoveries.get("advancement_patterns", {}).get("level_distributions"):
            level_dist = self.discoveries["advancement_patterns"]["level_distributions"]
            technical_findings.append({
                "category": "Advancement Levels",
                "finding": f"Advancement distributed across {len(level_dist)} levels",
                "details": dict(list(level_dist.items())[:20])  # Show first 20 levels
            })

        # ItemGrant configuration patterns
        if self.discoveries.get("advancement_patterns", {}).get("itemgrant_examples"):
            itemgrant_examples = self.discoveries["advancement_patterns"]["itemgrant_examples"]
            technical_findings.append({
                "category": "ItemGrant Implementation",
                "finding": f"Found {len(itemgrant_examples)} ItemGrant examples",
                "details": itemgrant_examples[:5]  # Show first 5 examples
            })

        self.discoveries["technical_findings"] = technical_findings

    def _analyze_uuid_patterns(self, patterns: List[str]) -> Dict:
        """Analyze UUID patterns for structure"""
        analysis = {
            "compendium_types": set(),
            "pack_names": set(),
            "common_prefixes": set()
        }

        for pattern in patterns:
            parts = pattern.split('.')
            if len(parts) >= 3:
                # Format: Compendium.pack.type.id
                if len(parts) >= 2:
                    analysis["pack_names"].add(parts[1])
                if len(parts) >= 3:
                    analysis["compendium_types"].add(parts[2])
                analysis["common_prefixes"].add('.'.join(parts[:2]))

        # Convert sets to lists for JSON serialization
        return {
            "compendium_types": list(analysis["compendium_types"]),
            "pack_names": list(analysis["pack_names"]),
            "common_prefixes": list(analysis["common_prefixes"])
        }

    def generate_report(self) -> str:
        """Generate markdown report of discoveries"""
        report = f"""# D&D 5e Repository Monitoring Report

Generated: {self.discoveries['timestamp']}
Repository: https://github.com/foundryvtt/dnd5e/tree/{self.branch}

## Repository Overview

"""

        if self.discoveries.get("repository_info"):
            repo_info = self.discoveries["repository_info"]
            report += f"""- **Name**: {repo_info.get('name', 'N/A')}
- **Description**: {repo_info.get('description', 'N/A')}
- **Last Updated**: {repo_info.get('updated_at', 'N/A')}
- **Size**: {repo_info.get('size', 'N/A')} KB

"""

        # Advancement Structure Analysis
        report += "## Advancement Structure Analysis\n\n"
        if self.discoveries.get("advancement_patterns"):
            patterns = self.discoveries["advancement_patterns"]
            report += f"**Advancement Types Found**: {', '.join(patterns.get('advancement_types', []))}\n\n"

            if patterns.get("level_distributions"):
                report += "### Level Distribution\n\n"
                level_dist = patterns["level_distributions"]
                for level in sorted(level_dist.keys()):
                    types = ', '.join(set(level_dist[level]))
                    report += f"- **Level {level}**: {types}\n"
                report += "\n"

        # ItemGrant Analysis
        report += "## ItemGrant Implementation Analysis\n\n"
        if self.discoveries.get("itemgrant_analysis"):
            itemgrant = self.discoveries["itemgrant_analysis"]
            if itemgrant.get("uuid_patterns"):
                report += f"**UUID Patterns Found**: {len(itemgrant['uuid_patterns'])} total patterns\n\n"

                # Show unique patterns
                unique_patterns = list(set(itemgrant["uuid_patterns"]))[:10]
                report += "### Sample UUID Patterns\n\n"
                for pattern in unique_patterns:
                    report += f"- `{pattern}`\n"
                report += "\n"

        if self.discoveries.get("advancement_patterns", {}).get("itemgrant_examples"):
            examples = self.discoveries["advancement_patterns"]["itemgrant_examples"]
            report += f"### ItemGrant Examples ({len(examples)} found)\n\n"
            for i, example in enumerate(examples[:3]):  # Show first 3
                report += f"#### Example {i+1}: {example.get('file', 'Unknown')}\n\n"
                report += f"- **Level**: {example.get('level', 'N/A')}\n"
                report += f"- **Configuration**: ```json\n{json.dumps(example.get('config', {}), indent=2)}\n```\n\n"

        # Spell Progression Analysis
        report += "## Spell Progression Analysis\n\n"
        if self.discoveries.get("spell_progression", {}).get("progression_types"):
            progressions = self.discoveries["spell_progression"]["progression_types"]
            report += f"**Spellcasting Classes Found**: {len(progressions)}\n\n"
            for prog in progressions:
                report += f"- **{prog.get('file', 'Unknown')}**: {json.dumps(prog.get('spellcasting', {}))}\n"
            report += "\n"

        # RollTable Analysis
        report += "## RollTable Format Analysis\n\n"
        if self.discoveries.get("rolltable_format", {}).get("result_formats"):
            formats = self.discoveries["rolltable_format"]["result_formats"]
            report += f"**RollTable Files Analyzed**: {len(formats)}\n\n"
            for fmt in formats[:3]:  # Show first 3
                report += f"### {fmt.get('file', 'Unknown')}\n\n"
                report += f"- **Result Count**: {fmt.get('result_count', 'N/A')}\n"
                report += f"- **Sample Result**: ```json\n{json.dumps(fmt.get('sample_result', {}), indent=2)}\n```\n\n"

        # Technical Findings
        report += "## Key Technical Discoveries\n\n"
        if self.discoveries.get("technical_findings"):
            for finding in self.discoveries["technical_findings"]:
                report += f"### {finding.get('category', 'Unknown')}\n\n"
                report += f"{finding.get('finding', 'No details available')}\n\n"
                if finding.get("details"):
                    if isinstance(finding["details"], dict):
                        report += "```json\n" + json.dumps(finding["details"], indent=2) + "\n```\n\n"
                    elif isinstance(finding["details"], list):
                        for detail in finding["details"][:5]:  # Show first 5
                            report += f"- {detail}\n"
                        report += "\n"

        # Raw Data Summary
        report += "## Raw Data Summary\n\n"
        report += f"- **Advancement Structures**: {len(self.discoveries.get('advancement_structures', {}))}\n"
        report += f"- **Item Structures**: {len(self.discoveries.get('itemgrant_analysis', {}).get('item_structures', {}))}\n"
        report += f"- **RollTable Structures**: {len(self.discoveries.get('rolltable_format', {}).get('table_structures', {}))}\n"

        return report

    def run_monitoring(self):
        """Run the complete monitoring process"""
        self.log("Starting D&D 5e repository monitoring...")

        try:
            self.analyze_repository_structure()
            time.sleep(1)  # Rate limiting

            self.analyze_advancement_structures()
            time.sleep(1)

            self.analyze_itemgrant_implementation()
            time.sleep(1)

            self.analyze_spell_progression()
            time.sleep(1)

            self.analyze_rolltable_format()
            time.sleep(1)

            self.discover_technical_details()

            # Generate report
            report = self.generate_report()

            # Save discoveries as JSON
            with open('dnd5e-discoveries.json', 'w') as f:
                json.dump(self.discoveries, f, indent=2, default=str)

            # Save report as markdown
            with open('monitor-report.md', 'w') as f:
                f.write(report)

            self.log("Monitoring complete! Reports saved:")
            self.log("- dnd5e-discoveries.json (raw data)")
            self.log("- monitor-report.md (formatted report)")

            return True

        except Exception as e:
            self.log(f"Monitoring failed: {e}", "ERROR")
            return False


def main():
    """Main entry point"""
    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        print(__doc__)
        print("\nUsage: python agent-monitor-dnd5e.py")
        print("\nThis script will:")
        print("1. Analyze D&D 5e repository structure")
        print("2. Discover advancement implementation patterns")
        print("3. Analyze ItemGrant UUID formats")
        print("4. Study spell progression mechanisms")
        print("5. Examine RollTable result formats")
        print("6. Generate technical discovery report")
        return

    monitor = DnD5eMonitor()
    success = monitor.run_monitoring()

    if success:
        print("\n" + "="*50)
        print("MONITORING COMPLETE!")
        print("="*50)
        print("Check 'monitor-report.md' for detailed findings.")
    else:
        print("\n" + "="*50)
        print("MONITORING FAILED!")
        print("="*50)
        sys.exit(1)


if __name__ == "__main__":
    main()