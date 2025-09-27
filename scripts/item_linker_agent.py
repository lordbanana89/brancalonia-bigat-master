#!/usr/bin/env python3
"""
Item Linker Agent for Brancalonia D&D 5e v5.1.9 Compatibility
============================================================

This agent rebuilds connections between items, spells, features, and classes
ensuring proper UUID references and compendium links for D&D 5e v5.1.9.

CRITICAL LINKING FUNCTIONS:
- Rebuild class advancement ItemGrant references
- Link spells to proper spell compendium
- Connect features to class advancement
- Fix background equipment and feature links
- Validate and repair broken UUID references
"""

import json
import os
import re
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Set, Tuple
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class ItemReference:
    item_id: str
    item_name: str
    item_type: str
    pack_name: str
    file_path: str
    uuid: str

@dataclass
class LinkingIssue:
    source_file: str
    source_item: str
    broken_uuid: str
    issue_type: str
    suggested_uuid: Optional[str] = None
    confidence: float = 0.0

class ItemLinkerAgent:
    """
    Intelligent agent for rebuilding item connections and UUID references
    """

    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.setup_logging()

        # Caches for performance
        self.item_registry: Dict[str, ItemReference] = {}
        self.name_to_items: Dict[str, List[ItemReference]] = defaultdict(list)
        self.type_to_items: Dict[str, List[ItemReference]] = defaultdict(list)
        self.linking_issues: List[LinkingIssue] = []

        # UUID patterns
        self.uuid_pattern = re.compile(r'Compendium\.([^.]+)\.([^.]+)\.Item\.([^.]+)')

    def setup_logging(self):
        """Setup detailed logging for linking process"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - Item Linker - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.project_root / 'logs' / 'item_linker.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        (self.project_root / 'logs').mkdir(exist_ok=True)

    def rebuild_all_connections(self) -> Dict[str, Any]:
        """
        Rebuild all item connections in the project

        Returns:
            Summary of linking operations performed
        """
        self.logger.info("Starting comprehensive item linking for D&D 5e v5.1.9")

        # Phase 1: Build item registry
        self.logger.info("Phase 1: Building item registry...")
        self.build_item_registry()

        # Phase 2: Analyze current links
        self.logger.info("Phase 2: Analyzing current links...")
        broken_links = self.analyze_current_links()

        # Phase 3: Fix broken links
        self.logger.info("Phase 3: Fixing broken links...")
        fixed_links = self.fix_broken_links(broken_links)

        # Phase 4: Rebuild class advancement
        self.logger.info("Phase 4: Rebuilding class advancement...")
        advancement_fixes = self.rebuild_class_advancement()

        # Phase 5: Link background features
        self.logger.info("Phase 5: Linking background features...")
        background_fixes = self.link_background_features()

        # Generate report
        summary = {
            "total_items_indexed": len(self.item_registry),
            "broken_links_found": len(broken_links),
            "links_fixed": len(fixed_links),
            "advancement_fixes": len(advancement_fixes),
            "background_fixes": len(background_fixes),
            "remaining_issues": len(self.linking_issues)
        }

        self.generate_linking_report(summary)
        return summary

    def build_item_registry(self):
        """Build comprehensive registry of all items in all packs"""
        packs_dir = self.project_root / "packs"

        if not packs_dir.exists():
            self.logger.error(f"Packs directory not found: {packs_dir}")
            return

        for pack_dir in packs_dir.iterdir():
            if not pack_dir.is_dir() or pack_dir.name.startswith('.'):
                continue

            pack_name = pack_dir.name
            source_dir = pack_dir / "_source"

            if not source_dir.exists():
                self.logger.warning(f"No _source directory in pack: {pack_name}")
                continue

            self.logger.info(f"Indexing pack: {pack_name}")

            for json_file in source_dir.glob("*.json"):
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    item_ref = self.create_item_reference(data, pack_name, str(json_file))
                    if item_ref:
                        self.register_item(item_ref)

                except Exception as e:
                    self.logger.error(f"Error indexing {json_file}: {e}")

        self.logger.info(f"Registry built: {len(self.item_registry)} items indexed")

    def create_item_reference(self, data: Dict[str, Any], pack_name: str, file_path: str) -> Optional[ItemReference]:
        """Create ItemReference from item data"""
        item_id = data.get("_id")
        item_name = data.get("name")
        item_type = data.get("type")

        if not all([item_id, item_name, item_type]):
            return None

        # Generate UUID
        uuid = f"Compendium.brancalonia-bigat.{pack_name}.Item.{item_id}"

        return ItemReference(
            item_id=item_id,
            item_name=item_name,
            item_type=item_type,
            pack_name=pack_name,
            file_path=file_path,
            uuid=uuid
        )

    def register_item(self, item_ref: ItemReference):
        """Register item in all lookup structures"""
        self.item_registry[item_ref.item_id] = item_ref
        self.name_to_items[item_ref.item_name.lower()].append(item_ref)
        self.type_to_items[item_ref.item_type].append(item_ref)

        # Also register by clean name (without special characters)
        clean_name = re.sub(r'[^\w\s]', '', item_ref.item_name.lower())
        self.name_to_items[clean_name].append(item_ref)

    def analyze_current_links(self) -> List[LinkingIssue]:
        """Analyze current UUID links and identify broken ones"""
        broken_links = []
        packs_dir = self.project_root / "packs"

        for pack_dir in packs_dir.iterdir():
            if not pack_dir.is_dir() or pack_dir.name.startswith('.'):
                continue

            source_dir = pack_dir / "_source"
            if not source_dir.exists():
                continue

            for json_file in source_dir.glob("*.json"):
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    file_issues = self.find_broken_links_in_item(data, str(json_file))
                    broken_links.extend(file_issues)

                except Exception as e:
                    self.logger.error(f"Error analyzing {json_file}: {e}")

        return broken_links

    def find_broken_links_in_item(self, data: Dict[str, Any], file_path: str) -> List[LinkingIssue]:
        """Find broken UUID links in a single item"""
        issues = []
        item_id = data.get("_id", "UNKNOWN")

        def check_uuid_in_object(obj, path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    current_path = f"{path}.{key}" if path else key
                    if key == "uuid" and isinstance(value, str):
                        if not self.is_valid_uuid_link(value):
                            issue = LinkingIssue(
                                source_file=file_path,
                                source_item=item_id,
                                broken_uuid=value,
                                issue_type="BROKEN_UUID_REFERENCE"
                            )
                            # Try to find replacement
                            suggestion = self.suggest_uuid_replacement(value)
                            if suggestion:
                                issue.suggested_uuid = suggestion[0]
                                issue.confidence = suggestion[1]
                            issues.append(issue)
                    else:
                        check_uuid_in_object(value, current_path)
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    check_uuid_in_object(item, f"{path}[{i}]")

        check_uuid_in_object(data)
        return issues

    def is_valid_uuid_link(self, uuid: str) -> bool:
        """Check if UUID points to an existing item"""
        match = self.uuid_pattern.match(uuid)
        if not match:
            return False

        module, pack, item_id = match.groups()

        # Check if it's a Brancalonia item
        if module == "brancalonia-bigat" or module == "brancalonia":
            return item_id in self.item_registry

        # For external references (like dnd5e system), assume valid for now
        return True

    def suggest_uuid_replacement(self, broken_uuid: str) -> Optional[Tuple[str, float]]:
        """Suggest replacement UUID for broken reference"""
        match = self.uuid_pattern.match(broken_uuid)
        if not match:
            return None

        module, pack, item_id = match.groups()

        # If item exists in registry, fix module name
        if item_id in self.item_registry:
            correct_uuid = self.item_registry[item_id].uuid
            return (correct_uuid, 1.0)

        # Try to find by name similarity
        # Extract potential name from item_id
        potential_names = [
            item_id.replace('-', ' '),
            item_id.replace('_', ' '),
            re.sub(r'[^a-zA-Z\s]', ' ', item_id)
        ]

        best_match = None
        best_score = 0.0

        for name in potential_names:
            name = name.lower().strip()
            if name in self.name_to_items:
                for item_ref in self.name_to_items[name]:
                    score = self.calculate_name_similarity(name, item_ref.item_name.lower())
                    if score > best_score:
                        best_score = score
                        best_match = item_ref.uuid

        if best_match and best_score > 0.7:
            return (best_match, best_score)

        return None

    def calculate_name_similarity(self, name1: str, name2: str) -> float:
        """Calculate similarity between two names"""
        # Simple implementation - could be enhanced with fuzzy matching
        words1 = set(name1.split())
        words2 = set(name2.split())

        if not words1 or not words2:
            return 0.0

        intersection = words1.intersection(words2)
        union = words1.union(words2)

        return len(intersection) / len(union)

    def fix_broken_links(self, broken_links: List[LinkingIssue]) -> List[Dict[str, Any]]:
        """Fix broken UUID links"""
        fixed_links = []

        for issue in broken_links:
            if issue.suggested_uuid and issue.confidence > 0.7:
                try:
                    # Load file
                    with open(issue.source_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    # Replace UUID
                    if self.replace_uuid_in_object(data, issue.broken_uuid, issue.suggested_uuid):
                        # Save file
                        with open(issue.source_file, 'w', encoding='utf-8') as f:
                            json.dump(data, f, indent=2, ensure_ascii=False)

                        fixed_links.append({
                            "file": issue.source_file,
                            "item": issue.source_item,
                            "old_uuid": issue.broken_uuid,
                            "new_uuid": issue.suggested_uuid,
                            "confidence": issue.confidence
                        })

                        self.logger.info(f"Fixed UUID in {issue.source_item}: {issue.broken_uuid} -> {issue.suggested_uuid}")

                except Exception as e:
                    self.logger.error(f"Error fixing {issue.source_file}: {e}")
            else:
                # Add to remaining issues
                self.linking_issues.append(issue)

        return fixed_links

    def replace_uuid_in_object(self, obj: Any, old_uuid: str, new_uuid: str) -> bool:
        """Replace UUID in object structure"""
        replaced = False

        if isinstance(obj, dict):
            for key, value in obj.items():
                if key == "uuid" and value == old_uuid:
                    obj[key] = new_uuid
                    replaced = True
                elif isinstance(value, (dict, list)):
                    if self.replace_uuid_in_object(value, old_uuid, new_uuid):
                        replaced = True
        elif isinstance(obj, list):
            for item in obj:
                if self.replace_uuid_in_object(item, old_uuid, new_uuid):
                    replaced = True

        return replaced

    def rebuild_class_advancement(self) -> List[Dict[str, Any]]:
        """Rebuild class advancement structures"""
        advancement_fixes = []

        # Get all class items
        class_items = self.type_to_items.get("class", [])

        for class_ref in class_items:
            try:
                with open(class_ref.file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                # Check and fix advancement
                system = data.get("system", {})
                advancement = system.get("advancement", [])

                fixed_advancement = []
                for adv in advancement:
                    fixed_adv = self.fix_advancement_entry(adv, class_ref.item_name)
                    fixed_advancement.append(fixed_adv)

                if fixed_advancement != advancement:
                    system["advancement"] = fixed_advancement

                    # Save file
                    with open(class_ref.file_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)

                    advancement_fixes.append({
                        "class": class_ref.item_name,
                        "file": class_ref.file_path,
                        "fixes_applied": len([a for a in fixed_advancement if a != advancement[i] for i, a in enumerate(fixed_advancement) if i < len(advancement)])
                    })

                    self.logger.info(f"Fixed advancement for class: {class_ref.item_name}")

            except Exception as e:
                self.logger.error(f"Error fixing advancement for {class_ref.item_name}: {e}")

        return advancement_fixes

    def fix_advancement_entry(self, advancement: Dict[str, Any], class_name: str) -> Dict[str, Any]:
        """Fix a single advancement entry"""
        if advancement.get("type") != "ItemGrant":
            return advancement

        configuration = advancement.get("configuration", {})
        items = configuration.get("items", [])

        fixed_items = []
        for item in items:
            uuid = item.get("uuid", "")
            if uuid and not self.is_valid_uuid_link(uuid):
                # Try to find correct feature for this class and level
                level = advancement.get("level", 1)
                title = advancement.get("title", "")

                new_uuid = self.find_class_feature_uuid(class_name, level, title)
                if new_uuid:
                    item["uuid"] = new_uuid
                    self.logger.info(f"Fixed feature UUID for {class_name} level {level}: {title}")

            fixed_items.append(item)

        if fixed_items != items:
            configuration["items"] = fixed_items

        return advancement

    def find_class_feature_uuid(self, class_name: str, level: int, feature_name: str) -> Optional[str]:
        """Find correct UUID for class feature"""
        # Look for features that match the pattern
        feature_items = self.type_to_items.get("feat", [])

        # Try exact name match first
        clean_feature_name = feature_name.lower()
        for item_ref in feature_items:
            if clean_feature_name in item_ref.item_name.lower():
                return item_ref.uuid

        # Try pattern matching with class name and level
        class_pattern = class_name.lower()
        level_pattern = str(level)

        for item_ref in feature_items:
            item_name_lower = item_ref.item_name.lower()
            if class_pattern in item_name_lower and level_pattern in item_name_lower:
                return item_ref.uuid

        return None

    def link_background_features(self) -> List[Dict[str, Any]]:
        """Link background features and equipment"""
        background_fixes = []

        # Get all background items
        background_items = self.type_to_items.get("background", [])

        for bg_ref in background_items:
            try:
                with open(bg_ref.file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                # Fix background advancement and features
                fixes_made = self.fix_background_advancement(data, bg_ref.item_name)

                if fixes_made:
                    # Save file
                    with open(bg_ref.file_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)

                    background_fixes.append({
                        "background": bg_ref.item_name,
                        "file": bg_ref.file_path,
                        "fixes_applied": fixes_made
                    })

                    self.logger.info(f"Fixed background features for: {bg_ref.item_name}")

            except Exception as e:
                self.logger.error(f"Error fixing background {bg_ref.item_name}: {e}")

        return background_fixes

    def fix_background_advancement(self, data: Dict[str, Any], bg_name: str) -> int:
        """Fix background advancement structure"""
        fixes_made = 0
        system = data.get("system", {})
        advancement = system.get("advancement", [])

        for adv in advancement:
            if adv.get("type") == "ItemGrant":
                configuration = adv.get("configuration", {})
                items = configuration.get("items", [])

                for item in items:
                    uuid = item.get("uuid", "")
                    if uuid and not self.is_valid_uuid_link(uuid):
                        # Try to find background-specific feature
                        new_uuid = self.find_background_feature_uuid(bg_name, adv.get("title", ""))
                        if new_uuid:
                            item["uuid"] = new_uuid
                            fixes_made += 1

        return fixes_made

    def find_background_feature_uuid(self, bg_name: str, feature_name: str) -> Optional[str]:
        """Find correct UUID for background feature"""
        bg_pattern = bg_name.lower()
        feature_pattern = feature_name.lower()

        # Look in background features
        feature_items = self.type_to_items.get("feat", [])

        for item_ref in feature_items:
            item_name_lower = item_ref.item_name.lower()
            if bg_pattern in item_name_lower and feature_pattern in item_name_lower:
                return item_ref.uuid

        return None

    def generate_linking_report(self, summary: Dict[str, Any]):
        """Generate comprehensive linking report"""
        report_path = self.project_root / "reports" / "item_linking_report.json"
        report_path.parent.mkdir(exist_ok=True)

        # Prepare detailed report
        report = {
            "linking_timestamp": "2025-09-27T00:00:00Z",
            "summary": summary,
            "item_registry_stats": {
                "total_items": len(self.item_registry),
                "items_by_type": {item_type: len(items) for item_type, items in self.type_to_items.items()},
                "items_by_pack": {}
            },
            "remaining_issues": [
                {
                    "source_file": issue.source_file,
                    "source_item": issue.source_item,
                    "broken_uuid": issue.broken_uuid,
                    "issue_type": issue.issue_type,
                    "suggested_uuid": issue.suggested_uuid,
                    "confidence": issue.confidence
                }
                for issue in self.linking_issues
            ]
        }

        # Count items by pack
        pack_counts = defaultdict(int)
        for item_ref in self.item_registry.values():
            pack_counts[item_ref.pack_name] += 1
        report["item_registry_stats"]["items_by_pack"] = dict(pack_counts)

        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        self.logger.info(f"Linking report saved to: {report_path}")

        # Generate human-readable summary
        self.generate_linking_summary(summary, report_path.parent / "item_linking_summary.md")

    def generate_linking_summary(self, summary: Dict[str, Any], summary_path: Path):
        """Generate human-readable linking summary"""
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("# Brancalonia Item Linking Report\n\n")
            f.write("## Summary\n\n")
            f.write(f"- **Total Items Indexed:** {summary['total_items_indexed']}\n")
            f.write(f"- **Broken Links Found:** {summary['broken_links_found']}\n")
            f.write(f"- **Links Fixed:** {summary['links_fixed']}\n")
            f.write(f"- **Advancement Fixes:** {summary['advancement_fixes']}\n")
            f.write(f"- **Background Fixes:** {summary['background_fixes']}\n")
            f.write(f"- **Remaining Issues:** {summary['remaining_issues']}\n\n")

            # Success rate
            if summary['broken_links_found'] > 0:
                success_rate = (summary['links_fixed'] / summary['broken_links_found']) * 100
                f.write(f"**Fix Success Rate:** {success_rate:.1f}%\n\n")

            f.write("## Next Steps\n\n")
            if summary['remaining_issues'] > 0:
                f.write("1. 🔍 Review remaining issues in detailed report\n")
                f.write("2. 🛠️ Manually fix complex UUID references\n")
                f.write("3. ✅ Run Test Runner Agent to verify fixes\n")
            else:
                f.write("✅ All UUID references successfully linked!\n")

        self.logger.info(f"Linking summary saved to: {summary_path}")

if __name__ == "__main__":
    import sys

    project_root = sys.argv[1] if len(sys.argv) > 1 else "/Users/erik/Desktop/brancalonia-bigat-master"

    agent = ItemLinkerAgent(project_root)
    results = agent.rebuild_all_connections()

    print(f"\n🔗 Item Linking Complete!")
    print(f"📊 Indexed {results['total_items_indexed']} items")
    print(f"🔧 Fixed {results['links_fixed']} broken links")
    print(f"📁 Reports saved to: {agent.project_root}/reports/")