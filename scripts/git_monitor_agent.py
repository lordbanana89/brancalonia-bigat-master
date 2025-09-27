#!/usr/bin/env python3
"""
Git Monitor Agent for Brancalonia D&D 5e v5.1.9 Compatibility
============================================================

This agent monitors the official D&D 5e repository for updates and changes
ensuring continuous compatibility with the latest system version.

CRITICAL MONITORING FUNCTIONS:
- Monitor foundryvtt/dnd5e repository for updates
- Track system version changes
- Alert for breaking changes
- Monitor data structure changes
- Track advancement system updates
- Generate compatibility reports
"""

import json
import os
import subprocess
import logging
import time
import requests
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class RepositoryUpdate:
    commit_sha: str
    commit_message: str
    author: str
    timestamp: str
    files_changed: List[str]
    breaking_change: bool = False

@dataclass
class CompatibilityIssue:
    issue_type: str
    description: str
    affected_files: List[str]
    severity: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    recommendation: str

class GitMonitorAgent:
    """
    Intelligent agent for monitoring D&D 5e repository changes
    """

    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.setup_logging()

        # GitHub API configuration
        self.github_api_base = "https://api.github.com"
        self.dnd5e_repo = "foundryvtt/dnd5e"
        self.github_token = os.getenv("GITHUB_TOKEN")  # Optional for higher rate limits

        # Monitoring configuration
        self.monitoring_data_file = self.project_root / "monitoring" / "git_monitor_data.json"
        self.last_check_file = self.project_root / "monitoring" / "last_check.json"

        # Initialize monitoring data
        self.monitoring_data = self.load_monitoring_data()
        self.compatibility_issues: List[CompatibilityIssue] = []

    def setup_logging(self):
        """Setup detailed logging for monitoring process"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - Git Monitor - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.project_root / 'logs' / 'git_monitor.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        (self.project_root / 'logs').mkdir(exist_ok=True)
        (self.project_root / 'monitoring').mkdir(exist_ok=True)

    def load_monitoring_data(self) -> Dict[str, Any]:
        """Load existing monitoring data"""
        if self.monitoring_data_file.exists():
            try:
                with open(self.monitoring_data_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                self.logger.error(f"Error loading monitoring data: {e}")

        return {
            "last_monitored_commit": None,
            "known_versions": [],
            "tracked_files": [],
            "compatibility_history": []
        }

    def save_monitoring_data(self):
        """Save monitoring data to file"""
        try:
            with open(self.monitoring_data_file, 'w', encoding='utf-8') as f:
                json.dump(self.monitoring_data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            self.logger.error(f"Error saving monitoring data: {e}")

    def monitor_dnd5e_repository(self) -> Dict[str, Any]:
        """
        Monitor D&D 5e repository for updates

        Returns:
            Summary of monitoring results
        """
        self.logger.info("Starting D&D 5e repository monitoring")

        start_time = time.time()

        # Phase 1: Check for new commits
        self.logger.info("Phase 1: Checking for new commits...")
        new_commits = self.check_for_new_commits()

        # Phase 2: Analyze commit changes
        self.logger.info("Phase 2: Analyzing commit changes...")
        analyzed_commits = self.analyze_commits(new_commits)

        # Phase 3: Check for version updates
        self.logger.info("Phase 3: Checking for version updates...")
        version_updates = self.check_version_updates()

        # Phase 4: Detect breaking changes
        self.logger.info("Phase 4: Detecting breaking changes...")
        breaking_changes = self.detect_breaking_changes(analyzed_commits)

        # Phase 5: Generate compatibility alerts
        self.logger.info("Phase 5: Generating compatibility alerts...")
        compatibility_alerts = self.generate_compatibility_alerts(analyzed_commits, breaking_changes)

        monitoring_time = time.time() - start_time

        summary = {
            "monitoring_timestamp": datetime.now().isoformat(),
            "monitoring_duration": monitoring_time,
            "new_commits_found": len(new_commits),
            "commits_analyzed": len(analyzed_commits),
            "version_updates": len(version_updates),
            "breaking_changes": len(breaking_changes),
            "compatibility_alerts": len(compatibility_alerts),
            "compatibility_issues": len(self.compatibility_issues)
        }

        self.generate_monitoring_report(summary, analyzed_commits, breaking_changes)
        self.save_monitoring_data()

        return summary

    def check_for_new_commits(self) -> List[Dict[str, Any]]:
        """Check for new commits in D&D 5e repository"""
        try:
            # Get latest commits from GitHub API
            url = f"{self.github_api_base}/repos/{self.dnd5e_repo}/commits"
            params = {"per_page": 50}

            headers = {}
            if self.github_token:
                headers["Authorization"] = f"token {self.github_token}"

            response = requests.get(url, params=params, headers=headers, timeout=30)
            response.raise_for_status()

            commits_data = response.json()
            last_monitored = self.monitoring_data.get("last_monitored_commit")

            new_commits = []
            for commit in commits_data:
                commit_sha = commit["sha"]

                # Stop when we reach a commit we've already processed
                if last_monitored and commit_sha == last_monitored:
                    break

                new_commits.append({
                    "sha": commit_sha,
                    "message": commit["commit"]["message"],
                    "author": commit["commit"]["author"]["name"],
                    "timestamp": commit["commit"]["author"]["date"],
                    "url": commit["html_url"]
                })

            # Update last monitored commit
            if commits_data:
                self.monitoring_data["last_monitored_commit"] = commits_data[0]["sha"]

            self.logger.info(f"Found {len(new_commits)} new commits")
            return new_commits

        except requests.RequestException as e:
            self.logger.error(f"Error fetching commits from GitHub: {e}")
            return []
        except Exception as e:
            self.logger.error(f"Unexpected error checking commits: {e}")
            return []

    def analyze_commits(self, commits: List[Dict[str, Any]]) -> List[RepositoryUpdate]:
        """Analyze commits for relevant changes"""
        analyzed_commits = []

        for commit in commits:
            try:
                # Get detailed commit information
                commit_details = self.get_commit_details(commit["sha"])
                if commit_details:
                    repo_update = RepositoryUpdate(
                        commit_sha=commit["sha"],
                        commit_message=commit["message"],
                        author=commit["author"],
                        timestamp=commit["timestamp"],
                        files_changed=commit_details["files_changed"],
                        breaking_change=self.is_breaking_change(commit["message"], commit_details["files_changed"])
                    )
                    analyzed_commits.append(repo_update)

            except Exception as e:
                self.logger.error(f"Error analyzing commit {commit['sha']}: {e}")

        return analyzed_commits

    def get_commit_details(self, commit_sha: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific commit"""
        try:
            url = f"{self.github_api_base}/repos/{self.dnd5e_repo}/commits/{commit_sha}"

            headers = {}
            if self.github_token:
                headers["Authorization"] = f"token {self.github_token}"

            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()

            commit_data = response.json()

            files_changed = []
            for file_info in commit_data.get("files", []):
                files_changed.append({
                    "filename": file_info["filename"],
                    "status": file_info["status"],  # "added", "modified", "removed"
                    "additions": file_info.get("additions", 0),
                    "deletions": file_info.get("deletions", 0)
                })

            return {
                "files_changed": files_changed,
                "stats": commit_data.get("stats", {}),
                "parents": [p["sha"] for p in commit_data.get("parents", [])]
            }

        except requests.RequestException as e:
            self.logger.error(f"Error fetching commit details: {e}")
            return None

    def is_breaking_change(self, commit_message: str, files_changed: List[Dict[str, Any]]) -> bool:
        """Determine if a commit represents a breaking change"""
        message_lower = commit_message.lower()

        # Check commit message for breaking change indicators
        breaking_indicators = [
            "breaking change", "breaking:", "break:", "major:",
            "removed", "deprecated", "incompatible",
            "migration", "upgrade required"
        ]

        if any(indicator in message_lower for indicator in breaking_indicators):
            return True

        # Check affected files for critical changes
        critical_files = [
            "module.json",  # Module manifest changes
            "packs/",       # Compendium structure changes
            "system.json",  # System configuration changes
            "template.json" # Data template changes
        ]

        for file_info in files_changed:
            filename = file_info["filename"]
            if any(critical_file in filename for critical_file in critical_files):
                # High number of changes in critical files might be breaking
                if file_info.get("additions", 0) + file_info.get("deletions", 0) > 50:
                    return True

        return False

    def check_version_updates(self) -> List[Dict[str, Any]]:
        """Check for D&D 5e system version updates"""
        version_updates = []

        try:
            # Get current module.json from repository
            url = f"{self.github_api_base}/repos/{self.dnd5e_repo}/contents/module.json"

            headers = {}
            if self.github_token:
                headers["Authorization"] = f"token {self.github_token}"

            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()

            content_data = response.json()
            content = content_data["content"]

            # Decode base64 content
            import base64
            decoded_content = base64.b64decode(content).decode('utf-8')
            module_data = json.loads(decoded_content)

            current_version = module_data.get("version", "unknown")
            known_versions = self.monitoring_data.get("known_versions", [])

            if current_version not in known_versions:
                version_updates.append({
                    "version": current_version,
                    "timestamp": datetime.now().isoformat(),
                    "compatibility": module_data.get("compatibility", {}),
                    "relationships": module_data.get("relationships", {})
                })

                known_versions.append(current_version)
                self.monitoring_data["known_versions"] = known_versions

                self.logger.info(f"New D&D 5e version detected: {current_version}")

        except Exception as e:
            self.logger.error(f"Error checking version updates: {e}")

        return version_updates

    def detect_breaking_changes(self, commits: List[RepositoryUpdate]) -> List[Dict[str, Any]]:
        """Detect specific breaking changes that affect Brancalonia"""
        breaking_changes = []

        for commit in commits:
            if not commit.breaking_change:
                continue

            change_analysis = {
                "commit_sha": commit.commit_sha,
                "commit_message": commit.commit_message,
                "timestamp": commit.timestamp,
                "impact_areas": [],
                "recommended_actions": []
            }

            # Analyze file changes for specific impacts
            for file_info in commit.files_changed:
                filename = file_info["filename"]

                # Check for advancement system changes
                if "advancement" in filename.lower():
                    change_analysis["impact_areas"].append("advancement_system")
                    change_analysis["recommended_actions"].append("Review and update class advancement structures")

                # Check for item/spell structure changes
                if any(term in filename.lower() for term in ["item", "spell", "feature"]):
                    change_analysis["impact_areas"].append("item_structures")
                    change_analysis["recommended_actions"].append("Validate item and spell data structures")

                # Check for compendium changes
                if "pack" in filename.lower() or "compendium" in filename.lower():
                    change_analysis["impact_areas"].append("compendium_format")
                    change_analysis["recommended_actions"].append("Test compendium packing/unpacking")

                # Check for system data changes
                if filename.endswith(".json") and any(term in filename for term in ["system", "template", "config"]):
                    change_analysis["impact_areas"].append("system_data")
                    change_analysis["recommended_actions"].append("Review system configuration compatibility")

            if change_analysis["impact_areas"]:
                breaking_changes.append(change_analysis)

                # Generate compatibility issues
                self.generate_compatibility_issue_from_change(change_analysis)

        return breaking_changes

    def generate_compatibility_issue_from_change(self, change_analysis: Dict[str, Any]):
        """Generate compatibility issue from breaking change analysis"""
        impact_areas = change_analysis["impact_areas"]
        severity = "HIGH" if len(impact_areas) > 2 else "MEDIUM"

        if "advancement_system" in impact_areas:
            issue = CompatibilityIssue(
                issue_type="ADVANCEMENT_COMPATIBILITY",
                description=f"D&D 5e advancement system changes detected in commit {change_analysis['commit_sha'][:8]}",
                affected_files=["packs/classi/*", "scripts/class_builder_agent.py"],
                severity=severity,
                recommendation="Run Class Builder Agent to validate and fix class advancement structures"
            )
            self.compatibility_issues.append(issue)

        if "item_structures" in impact_areas:
            issue = CompatibilityIssue(
                issue_type="ITEM_STRUCTURE_COMPATIBILITY",
                description=f"Item/spell structure changes detected in commit {change_analysis['commit_sha'][:8]}",
                affected_files=["packs/incantesimi/*", "packs/equipaggiamento/*"],
                severity=severity,
                recommendation="Run Spell System Agent and Item Linker Agent to update structures"
            )
            self.compatibility_issues.append(issue)

        if "compendium_format" in impact_areas:
            issue = CompatibilityIssue(
                issue_type="COMPENDIUM_COMPATIBILITY",
                description=f"Compendium format changes detected in commit {change_analysis['commit_sha'][:8]}",
                affected_files=["packs/*"],
                severity="CRITICAL",
                recommendation="Run full Pack Validator Agent and Test Runner Agent"
            )
            self.compatibility_issues.append(issue)

    def generate_compatibility_alerts(self, commits: List[RepositoryUpdate],
                                    breaking_changes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate compatibility alerts based on analysis"""
        alerts = []

        # Alert for high number of recent commits
        if len(commits) > 20:
            alerts.append({
                "type": "HIGH_ACTIVITY",
                "severity": "MEDIUM",
                "message": f"High repository activity: {len(commits)} new commits",
                "recommendation": "Monitor more closely for potential issues"
            })

        # Alert for breaking changes
        if breaking_changes:
            alerts.append({
                "type": "BREAKING_CHANGES",
                "severity": "HIGH",
                "message": f"{len(breaking_changes)} breaking changes detected",
                "recommendation": "Review breaking changes and update Brancalonia accordingly"
            })

        # Alert for specific file pattern changes
        all_changed_files = []
        for commit in commits:
            all_changed_files.extend([f["filename"] for f in commit.files_changed])

        critical_patterns = {
            "advancement": ["advancement", "class"],
            "spells": ["spell", "magic"],
            "items": ["item", "equipment", "weapon"],
            "system": ["system", "module", "template"]
        }

        for pattern_name, patterns in critical_patterns.items():
            affected_files = [f for f in all_changed_files
                            if any(pattern in f.lower() for pattern in patterns)]

            if len(affected_files) > 5:
                alerts.append({
                    "type": f"{pattern_name.upper()}_CHANGES",
                    "severity": "MEDIUM",
                    "message": f"Multiple {pattern_name} related files changed ({len(affected_files)} files)",
                    "recommendation": f"Review {pattern_name} compatibility and run relevant agents"
                })

        return alerts

    def generate_monitoring_report(self, summary: Dict[str, Any],
                                 commits: List[RepositoryUpdate],
                                 breaking_changes: List[Dict[str, Any]]):
        """Generate comprehensive monitoring report"""
        report_path = self.project_root / "reports" / "git_monitoring_report.json"
        report_path.parent.mkdir(exist_ok=True)

        report = {
            "monitoring_timestamp": summary["monitoring_timestamp"],
            "summary": summary,
            "monitored_repository": self.dnd5e_repo,
            "new_commits": [
                {
                    "sha": commit.commit_sha,
                    "message": commit.commit_message,
                    "author": commit.author,
                    "timestamp": commit.timestamp,
                    "files_changed_count": len(commit.files_changed),
                    "breaking_change": commit.breaking_change
                }
                for commit in commits
            ],
            "breaking_changes": breaking_changes,
            "compatibility_issues": [
                {
                    "issue_type": issue.issue_type,
                    "description": issue.description,
                    "affected_files": issue.affected_files,
                    "severity": issue.severity,
                    "recommendation": issue.recommendation
                }
                for issue in self.compatibility_issues
            ],
            "monitoring_configuration": {
                "repository": self.dnd5e_repo,
                "github_api_available": bool(self.github_token),
                "monitoring_frequency": "on_demand"
            }
        }

        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        self.logger.info(f"Monitoring report saved to: {report_path}")

        # Generate human-readable summary
        self.generate_monitoring_summary(summary, commits, breaking_changes,
                                       report_path.parent / "git_monitoring_summary.md")

    def generate_monitoring_summary(self, summary: Dict[str, Any],
                                  commits: List[RepositoryUpdate],
                                  breaking_changes: List[Dict[str, Any]],
                                  summary_path: Path):
        """Generate human-readable monitoring summary"""
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("# Brancalonia Git Monitoring Report\n\n")
            f.write(f"**Monitoring Date:** {summary['monitoring_timestamp']}\n")
            f.write(f"**Repository:** {self.dnd5e_repo}\n")
            f.write(f"**Monitoring Duration:** {summary['monitoring_duration']:.2f} seconds\n\n")

            # Overall status
            if breaking_changes:
                f.write("🚨 **Status: BREAKING CHANGES DETECTED**\n\n")
            elif summary['new_commits_found'] > 10:
                f.write("⚠️ **Status: HIGH ACTIVITY - REVIEW NEEDED**\n\n")
            elif summary['new_commits_found'] > 0:
                f.write("📡 **Status: UPDATES AVAILABLE**\n\n")
            else:
                f.write("✅ **Status: UP TO DATE**\n\n")

            f.write("## Summary\n\n")
            f.write(f"- **New Commits Found:** {summary['new_commits_found']}\n")
            f.write(f"- **Commits Analyzed:** {summary['commits_analyzed']}\n")
            f.write(f"- **Version Updates:** {summary['version_updates']}\n")
            f.write(f"- **Breaking Changes:** {summary['breaking_changes']}\n")
            f.write(f"- **Compatibility Alerts:** {summary['compatibility_alerts']}\n")
            f.write(f"- **Compatibility Issues:** {summary['compatibility_issues']}\n\n")

            if breaking_changes:
                f.write("## Breaking Changes\n\n")
                for change in breaking_changes:
                    f.write(f"### Commit {change['commit_sha'][:8]}\n")
                    f.write(f"**Message:** {change['commit_message']}\n")
                    f.write(f"**Impact Areas:** {', '.join(change['impact_areas'])}\n")
                    f.write("**Recommended Actions:**\n")
                    for action in change['recommended_actions']:
                        f.write(f"- {action}\n")
                    f.write("\n")

            if self.compatibility_issues:
                f.write("## Compatibility Issues\n\n")
                issues_by_severity = {}
                for issue in self.compatibility_issues:
                    severity = issue.severity
                    if severity not in issues_by_severity:
                        issues_by_severity[severity] = []
                    issues_by_severity[severity].append(issue)

                for severity in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
                    if severity in issues_by_severity:
                        issues = issues_by_severity[severity]
                        f.write(f"### {severity} ({len(issues)})\n\n")
                        for issue in issues:
                            f.write(f"#### {issue.issue_type}\n")
                            f.write(f"{issue.description}\n\n")
                            f.write(f"**Affected Files:** {', '.join(issue.affected_files)}\n")
                            f.write(f"**Recommendation:** {issue.recommendation}\n\n")

            if commits:
                f.write("## Recent Commits\n\n")
                for commit in commits[:10]:  # Show first 10 commits
                    f.write(f"### {commit.commit_sha[:8]} - {commit.author}\n")
                    f.write(f"**Date:** {commit.timestamp}\n")
                    f.write(f"**Message:** {commit.commit_message}\n")
                    f.write(f"**Files Changed:** {len(commit.files_changed)}\n")
                    if commit.breaking_change:
                        f.write("🚨 **Breaking Change**\n")
                    f.write("\n")

            f.write("## Recommended Actions\n\n")
            if breaking_changes:
                f.write("### Immediate Actions Required\n")
                f.write("1. 🚨 Review all breaking changes in detail\n")
                f.write("2. 🔧 Run Pack Validator Agent to check for issues\n")
                f.write("3. 🏗️ Run Class Builder Agent if advancement changes detected\n")
                f.write("4. 🔮 Run Spell System Agent if spell changes detected\n")
                f.write("5. ✅ Run Test Runner Agent to validate compatibility\n\n")

            f.write("### Regular Monitoring Actions\n")
            f.write("1. 📡 Set up automated monitoring (cron job or CI/CD)\n")
            f.write("2. 🔔 Configure alerts for breaking changes\n")
            f.write("3. 📊 Review compatibility issues weekly\n")
            f.write("4. 🔄 Re-run agents after major D&D 5e updates\n\n")

            f.write("## Monitoring Configuration\n\n")
            f.write("To enable continuous monitoring:\n\n")
            f.write("```bash\n")
            f.write("# Add to crontab for daily monitoring\n")
            f.write("0 9 * * * cd /path/to/brancalonia && python scripts/git_monitor_agent.py\n")
            f.write("```\n\n")
            f.write("For GitHub API rate limiting, set environment variable:\n")
            f.write("```bash\n")
            f.write("export GITHUB_TOKEN=your_github_token_here\n")
            f.write("```\n")

        self.logger.info(f"Monitoring summary saved to: {summary_path}")

    def setup_continuous_monitoring(self) -> Dict[str, str]:
        """Setup continuous monitoring configuration"""
        monitoring_script = self.project_root / "scripts" / "monitor_scheduler.sh"

        script_content = f"""#!/bin/bash
# Brancalonia Git Monitoring Scheduler
# This script should be added to crontab for continuous monitoring

cd "{self.project_root}"

# Run git monitoring
python scripts/git_monitor_agent.py

# If breaking changes detected, run critical agents
if grep -q "BREAKING_CHANGES" reports/git_monitoring_report.json; then
    echo "Breaking changes detected, running critical agents..."
    python scripts/pack_validator_agent.py
    python scripts/test_runner_agent.py
fi

# Log monitoring run
echo "$(date): Git monitoring completed" >> logs/monitoring_schedule.log
"""

        try:
            with open(monitoring_script, 'w') as f:
                f.write(script_content)

            # Make script executable
            os.chmod(monitoring_script, 0o755)

            return {
                "script_path": str(monitoring_script),
                "cron_command": f"0 9 * * * {monitoring_script}",
                "status": "ready"
            }

        except Exception as e:
            self.logger.error(f"Error setting up continuous monitoring: {e}")
            return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import sys

    project_root = sys.argv[1] if len(sys.argv) > 1 else "/Users/erik/Desktop/brancalonia-bigat-master"

    agent = GitMonitorAgent(project_root)
    results = agent.monitor_dnd5e_repository()

    print(f"\n📡 Git Monitoring Complete!")
    print(f"📊 Found {results['new_commits_found']} new commits")
    if results['breaking_changes'] > 0:
        print(f"🚨 {results['breaking_changes']} breaking changes detected!")
    if results['compatibility_issues'] > 0:
        print(f"⚠️ {results['compatibility_issues']} compatibility issues found")
    print(f"📁 Reports saved to: {agent.project_root}/reports/")