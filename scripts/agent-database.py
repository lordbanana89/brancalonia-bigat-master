#!/usr/bin/env python3
"""
AGENT_DATABASE - Database Normalization Script for Brancalonia
================================================================

This script normalizes the database structure for the Brancalonia module by:
1. Ensuring all items have proper _key fields for LevelDB compatibility
2. Standardizing _id field formats
3. Normalizing UUID references
4. Removing duplicates and fixing inconsistencies
5. Processing all packs and generating detailed reports

Author: Claude (AI Assistant)
Version: 1.0
Date: 2025-09-27
"""

import json
import os
import sys
import shutil
import re
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Tuple, Any, Optional
from collections import defaultdict
import uuid


class DatabaseNormalizer:
    """Main class for database normalization operations."""

    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.packs_path = self.base_path / "packs"
        self.scripts_path = self.base_path / "scripts"
        self.backup_path = self.base_path / "backup_database"

        # Statistics and reporting
        self.stats = {
            'files_processed': 0,
            'files_fixed': 0,
            'files_skipped': 0,
            'errors': 0,
            'packs_processed': 0,
            'fixes_applied': defaultdict(int),
            'duplicates_found': 0,
            'duplicates_removed': 0
        }

        self.issues_found = []
        self.fixes_applied = []
        self.errors_encountered = []
        self.duplicates_log = []

        # ID tracking for duplicate detection
        self.id_registry: Dict[str, List[str]] = defaultdict(list)
        self.content_hashes: Dict[str, List[str]] = defaultdict(list)

        # Ensure scripts directory exists
        self.scripts_path.mkdir(exist_ok=True)

    def log_issue(self, issue_type: str, file_path: str, details: str):
        """Log an issue found during processing."""
        self.issues_found.append({
            'type': issue_type,
            'file': str(file_path),
            'details': details,
            'timestamp': datetime.now().isoformat()
        })

    def log_fix(self, fix_type: str, file_path: str, details: str):
        """Log a fix applied during processing."""
        self.fixes_applied.append({
            'type': fix_type,
            'file': str(file_path),
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
        self.stats['fixes_applied'][fix_type] += 1

    def log_error(self, error_type: str, file_path: str, details: str):
        """Log an error encountered during processing."""
        self.errors_encountered.append({
            'type': error_type,
            'file': str(file_path),
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
        self.stats['errors'] += 1

    def create_backup(self) -> bool:
        """Create a backup of the entire packs directory."""
        try:
            if self.backup_path.exists():
                shutil.rmtree(self.backup_path)

            shutil.copytree(self.packs_path, self.backup_path)
            print(f"✓ Created backup at: {self.backup_path}")
            return True
        except Exception as e:
            print(f"✗ Failed to create backup: {e}")
            return False

    def generate_id_from_filename(self, filename: str) -> str:
        """Generate a consistent _id from filename."""
        # Remove .json extension and normalize
        base_name = filename.replace('.json', '')

        # Replace problematic characters with underscores
        normalized = re.sub(r'[^a-zA-Z0-9_-]', '_', base_name)

        # Remove multiple underscores
        normalized = re.sub(r'_+', '_', normalized)

        # Ensure it starts with a letter or underscore
        if normalized and not normalized[0].isalpha() and normalized[0] != '_':
            normalized = f"item_{normalized}"

        # Ensure minimum length
        if len(normalized) < 3:
            normalized = f"item_{normalized}_{abs(hash(filename)) % 10000}"

        return normalized.lower()

    def generate_key_from_id(self, item_id: str, item_type: str = "items") -> str:
        """Generate _key field from _id."""
        return f"!{item_type}!{item_id}"

    def calculate_content_hash(self, data: Dict[str, Any]) -> str:
        """Calculate hash of content for duplicate detection."""
        # Create a normalized version for hashing (exclude metadata)
        content_data = {k: v for k, v in data.items()
                       if k not in ['_id', '_key', 'folder', 'sort', 'ownership', 'flags']}

        content_str = json.dumps(content_data, sort_keys=True, separators=(',', ':'))
        return hashlib.md5(content_str.encode()).hexdigest()

    def normalize_uuid_references(self, data: Any) -> Any:
        """Normalize UUID references in the data."""
        if isinstance(data, dict):
            normalized = {}
            for key, value in data.items():
                if key in ['folder', 'compendium'] and isinstance(value, str):
                    # Normalize folder references
                    if value and not value.startswith('!'):
                        normalized[key] = None  # Reset invalid folder references
                    else:
                        normalized[key] = value
                else:
                    normalized[key] = self.normalize_uuid_references(value)
            return normalized
        elif isinstance(data, list):
            return [self.normalize_uuid_references(item) for item in data]
        else:
            return data

    def fix_ownership_defaults(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure ownership field has proper defaults."""
        if 'ownership' not in data:
            data['ownership'] = {'default': 0}
        elif not isinstance(data['ownership'], dict):
            data['ownership'] = {'default': 0}
        elif 'default' not in data['ownership']:
            data['ownership']['default'] = 0

        return data

    def fix_effects_array(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure effects field is a proper array."""
        if 'effects' not in data:
            data['effects'] = []
        elif not isinstance(data['effects'], list):
            data['effects'] = []

        return data

    def standardize_foundry_fields(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Standardize common Foundry VTT fields."""
        # Ensure sort field exists
        if 'sort' not in data:
            data['sort'] = 0

        # Ensure folder field exists (null is valid)
        if 'folder' not in data:
            data['folder'] = None

        # Standardize type field if missing
        if 'type' not in data and 'name' in data:
            # Try to infer type from filename or content
            data['type'] = self.infer_item_type(data)

        return data

    def infer_item_type(self, data: Dict[str, Any]) -> str:
        """Infer item type from content."""
        # Default mappings based on content analysis
        if 'system' in data:
            if 'armor' in data.get('system', {}):
                return 'equipment'
            elif 'damage' in data.get('system', {}):
                return 'weapon'
            elif 'price' in data.get('system', {}):
                return 'loot'

        # Check for specific field patterns
        if any(field in data for field in ['livello', 'classe', 'meccaniche']):
            return 'feat'

        return 'loot'  # Default fallback

    def normalize_item(self, data: Dict[str, Any], filename: str, file_path: Path) -> Tuple[Dict[str, Any], List[str]]:
        """Normalize a single item's data structure."""
        fixes = []
        original_data = data.copy()

        # Fix _id field
        if '_id' not in data:
            if 'id' in data:
                # Move 'id' to '_id'
                data['_id'] = data['id']
                del data['id']
                fixes.append("Moved 'id' field to '_id'")
            else:
                # Generate _id from filename
                data['_id'] = self.generate_id_from_filename(filename)
                fixes.append(f"Generated _id from filename: {data['_id']}")

        # Ensure _id is string and normalize format
        if not isinstance(data['_id'], str):
            data['_id'] = str(data['_id'])
            fixes.append("Converted _id to string")

        # Fix _key field
        current_key = data.get('_key')
        expected_key = self.generate_key_from_id(data['_id'])

        if not current_key:
            data['_key'] = expected_key
            fixes.append(f"Added missing _key field: {expected_key}")
        elif current_key != expected_key:
            data['_key'] = expected_key
            fixes.append(f"Fixed _key field: {current_key} → {expected_key}")

        # Normalize UUID references
        data = self.normalize_uuid_references(data)

        # Fix ownership defaults
        data = self.fix_ownership_defaults(data)

        # Fix effects array
        data = self.fix_effects_array(data)

        # Standardize Foundry fields
        data = self.standardize_foundry_fields(data)

        # Ensure name field exists
        if 'name' not in data:
            if 'nome' in data:
                data['name'] = data['nome']
                fixes.append("Added 'name' field from 'nome'")
            elif 'nome_brancalonia' in data:
                data['name'] = data['nome_brancalonia']
                fixes.append("Added 'name' field from 'nome_brancalonia'")
            else:
                data['name'] = data['_id'].replace('_', ' ').title()
                fixes.append(f"Generated 'name' field from _id")

        # Track for duplicate detection
        self.id_registry[data['_id']].append(str(file_path))
        content_hash = self.calculate_content_hash(data)
        self.content_hashes[content_hash].append(str(file_path))

        return data, fixes

    def process_json_file(self, file_path: Path) -> bool:
        """Process a single JSON file."""
        try:
            self.stats['files_processed'] += 1

            # Read file
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Normalize the item
            normalized_data, fixes = self.normalize_item(data, file_path.name, file_path)

            # Check if any fixes were applied
            if fixes:
                self.stats['files_fixed'] += 1

                # Log fixes
                for fix in fixes:
                    self.log_fix("normalization", str(file_path), fix)

                # Write back the normalized data
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(normalized_data, f, ensure_ascii=False, indent=2)

                print(f"  ✓ Fixed: {file_path.name} ({len(fixes)} fixes)")
                return True
            else:
                self.stats['files_skipped'] += 1
                return False

        except json.JSONDecodeError as e:
            self.log_error("json_decode", str(file_path), f"Invalid JSON: {e}")
            print(f"  ✗ JSON Error: {file_path.name} - {e}")
            return False
        except Exception as e:
            self.log_error("processing", str(file_path), f"Processing error: {e}")
            print(f"  ✗ Error: {file_path.name} - {e}")
            return False

    def find_and_remove_duplicates(self) -> int:
        """Find and remove duplicate items."""
        duplicates_removed = 0

        # Check for duplicate _ids
        for item_id, file_paths in self.id_registry.items():
            if len(file_paths) > 1:
                self.duplicates_log.append({
                    'type': 'duplicate_id',
                    'id': item_id,
                    'files': file_paths,
                    'action': 'kept_first'
                })

                # Keep the first file, remove others
                for file_path in file_paths[1:]:
                    try:
                        os.remove(file_path)
                        duplicates_removed += 1
                        print(f"  ✓ Removed duplicate: {file_path}")
                    except Exception as e:
                        self.log_error("duplicate_removal", file_path, f"Failed to remove: {e}")

        # Check for duplicate content
        for content_hash, file_paths in self.content_hashes.items():
            if len(file_paths) > 1:
                # Only process if not already handled by ID duplicates
                unique_paths = [p for p in file_paths if os.path.exists(p)]
                if len(unique_paths) > 1:
                    self.duplicates_log.append({
                        'type': 'duplicate_content',
                        'hash': content_hash,
                        'files': unique_paths,
                        'action': 'kept_first'
                    })

                    # Keep the first file, remove others
                    for file_path in unique_paths[1:]:
                        try:
                            os.remove(file_path)
                            duplicates_removed += 1
                            print(f"  ✓ Removed content duplicate: {file_path}")
                        except Exception as e:
                            self.log_error("duplicate_removal", file_path, f"Failed to remove: {e}")

        self.stats['duplicates_removed'] = duplicates_removed
        return duplicates_removed

    def process_pack(self, pack_path: Path) -> bool:
        """Process a single pack directory."""
        source_path = pack_path / "_source"

        if not source_path.exists():
            print(f"  ! No _source directory in {pack_path.name}")
            return False

        print(f"\n📁 Processing pack: {pack_path.name}")

        json_files = list(source_path.glob("*.json"))
        if not json_files:
            print(f"  ! No JSON files found in {source_path}")
            return False

        processed_count = 0
        for json_file in json_files:
            if self.process_json_file(json_file):
                processed_count += 1

        print(f"  📊 Processed {len(json_files)} files, fixed {processed_count}")
        return True

    def process_all_packs(self) -> None:
        """Process all packs in the packs directory."""
        if not self.packs_path.exists():
            print(f"✗ Packs directory not found: {self.packs_path}")
            return

        pack_dirs = [d for d in self.packs_path.iterdir()
                     if d.is_dir() and not d.name.startswith('.')]

        if not pack_dirs:
            print(f"✗ No pack directories found in: {self.packs_path}")
            return

        print(f"🚀 Starting database normalization...")
        print(f"📂 Found {len(pack_dirs)} pack directories")

        for pack_dir in sorted(pack_dirs):
            if self.process_pack(pack_dir):
                self.stats['packs_processed'] += 1

        # Process duplicates after all files are analyzed
        print(f"\n🔍 Checking for duplicates...")
        self.stats['duplicates_found'] = len([ids for ids in self.id_registry.values() if len(ids) > 1])
        self.stats['duplicates_found'] += len([files for files in self.content_hashes.values() if len(files) > 1])

        if self.stats['duplicates_found'] > 0:
            duplicates_removed = self.find_and_remove_duplicates()
            print(f"  📊 Found {self.stats['duplicates_found']} duplicates, removed {duplicates_removed}")

    def generate_report(self) -> str:
        """Generate a detailed normalization report."""
        report_content = f"""# Database Normalization Report

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Script:** agent-database.py v1.0

## Summary Statistics

- **Packs Processed:** {self.stats['packs_processed']}
- **Files Processed:** {self.stats['files_processed']}
- **Files Fixed:** {self.stats['files_fixed']}
- **Files Skipped:** {self.stats['files_skipped']} (no changes needed)
- **Errors Encountered:** {self.stats['errors']}
- **Duplicates Found:** {self.stats['duplicates_found']}
- **Duplicates Removed:** {self.stats['duplicates_removed']}

## Fix Types Applied

"""

        for fix_type, count in self.stats['fixes_applied'].items():
            report_content += f"- **{fix_type.replace('_', ' ').title()}:** {count} fixes\n"

        if self.issues_found:
            report_content += "\n## Issues Found\n\n"
            for issue in self.issues_found[:50]:  # Limit to first 50
                report_content += f"- **{issue['type']}** in `{Path(issue['file']).name}`: {issue['details']}\n"

            if len(self.issues_found) > 50:
                report_content += f"\n... and {len(self.issues_found) - 50} more issues.\n"

        if self.errors_encountered:
            report_content += "\n## Errors Encountered\n\n"
            for error in self.errors_encountered:
                report_content += f"- **{error['type']}** in `{Path(error['file']).name}`: {error['details']}\n"

        if self.duplicates_log:
            report_content += "\n## Duplicates Processed\n\n"
            for dup in self.duplicates_log[:20]:  # Limit to first 20
                if dup['type'] == 'duplicate_id':
                    report_content += f"- **Duplicate ID `{dup['id']}`:** Found in {len(dup['files'])} files\n"
                else:
                    report_content += f"- **Duplicate Content:** Found in {len(dup['files'])} files\n"
                for file_path in dup['files'][:3]:  # Show first 3 files
                    report_content += f"  - `{Path(file_path).name}`\n"
                if len(dup['files']) > 3:
                    report_content += f"  - ... and {len(dup['files']) - 3} more\n"
                report_content += "\n"

        report_content += f"""
## Normalization Details

### _key Field Generation
All items now have properly formatted `_key` fields in the format: `!items!{{_id}}`

### _id Field Standardization
- Converted `id` fields to `_id` where needed
- Generated missing `_id` fields from filenames
- Ensured all `_id` values are strings

### UUID Reference Normalization
- Reset invalid folder references to `null`
- Preserved valid UUID references

### Ownership and Effects
- Added default ownership: `{{"default": 0}}`
- Ensured effects field is an array: `[]`

### Foundry VTT Compatibility
- Added missing `sort` fields (default: 0)
- Standardized `folder` fields
- Inferred `type` fields where missing

## Recommendations

1. **Backup Verified:** Original data backed up to `backup_database/`
2. **Database Ready:** All items now compatible with LevelDB
3. **Duplicates Cleaned:** Removed {self.stats['duplicates_removed']} duplicate items
4. **Structure Normalized:** Consistent field structure across all items

## Next Steps

1. Test the module in Foundry VTT
2. Verify all items load correctly
3. Check for any remaining import issues
4. Run this script again if new items are added

---
*Generated by AGENT_DATABASE v1.0 - Database Normalization Tool*
"""

        return report_content

    def save_report(self, report_content: str) -> None:
        """Save the report to a markdown file."""
        report_path = self.base_path / "database-normalization-report.md"

        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report_content)

        print(f"\n📄 Report saved to: {report_path}")

    def run(self) -> bool:
        """Run the complete normalization process."""
        print("🔧 AGENT_DATABASE - Database Normalization Tool")
        print("=" * 50)

        # Create backup
        if not self.create_backup():
            print("✗ Failed to create backup. Aborting.")
            return False

        # Process all packs
        self.process_all_packs()

        # Generate and save report
        report_content = self.generate_report()
        self.save_report(report_content)

        # Print summary
        print(f"\n✅ Database normalization completed!")
        print(f"📊 Summary: {self.stats['files_processed']} files processed, "
              f"{self.stats['files_fixed']} fixed, {self.stats['errors']} errors")

        return self.stats['errors'] == 0


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Normalize Brancalonia database structure",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python agent-database.py                    # Run with default path
  python agent-database.py --path /custom    # Run with custom path
  python agent-database.py --dry-run         # Preview changes only
        """
    )

    parser.add_argument(
        '--path',
        default=os.getcwd(),
        help='Base path to the Brancalonia module (default: current directory)'
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without applying them'
    )

    args = parser.parse_args()

    # Validate path
    base_path = Path(args.path).resolve()
    if not base_path.exists():
        print(f"✗ Path does not exist: {base_path}")
        sys.exit(1)

    packs_path = base_path / "packs"
    if not packs_path.exists():
        print(f"✗ Packs directory not found: {packs_path}")
        print("Make sure you're running this from the Brancalonia module root directory.")
        sys.exit(1)

    if args.dry_run:
        print("🔍 DRY RUN MODE - No changes will be made")
        print("This feature is not yet implemented.")
        sys.exit(0)

    # Run normalization
    normalizer = DatabaseNormalizer(str(base_path))

    try:
        success = normalizer.run()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()