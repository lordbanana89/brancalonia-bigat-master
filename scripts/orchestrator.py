#!/usr/bin/env python3
"""
Multi-Agent Orchestrator for Brancalonia D&D 5e v5.1.9 Compatibility
===================================================================

This orchestrator manages the execution of all specialized agents in the correct
order and coordinates their interactions for maximum effectiveness.

ORCHESTRATION PRIORITIES:
1. Validation and analysis first
2. Structural fixes before content fixes
3. Testing after each major change
4. Monitoring for ongoing compatibility
5. Documentation and reporting
"""

import json
import os
import sys
import subprocess
import logging
import time
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class AgentResult:
    agent_name: str
    execution_time: float
    status: str  # "SUCCESS", "FAILED", "SKIPPED"
    summary: Dict[str, Any]
    error_message: Optional[str] = None

class BrancaloniaOrchestrator:
    """
    Master orchestrator for all Brancalonia compatibility agents
    """

    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.setup_logging()

        # Agent execution order and dependencies
        self.agent_pipeline = [
            {
                "name": "Pack Validator",
                "script": "pack_validator_agent.py",
                "description": "Deep validation of all compendium data structures",
                "critical": True,
                "dependencies": []
            },
            {
                "name": "Item Linker",
                "script": "item_linker_agent.py",
                "description": "Rebuild UUID references and item connections",
                "critical": True,
                "dependencies": ["Pack Validator"]
            },
            {
                "name": "Class Builder",
                "script": "class_builder_agent.py",
                "description": "Reconstruct class advancement structures",
                "critical": True,
                "dependencies": ["Item Linker"]
            },
            {
                "name": "RollTable Fixer",
                "script": "rolltable_fixer_agent.py",
                "description": "Restore RollTable functionality",
                "critical": False,
                "dependencies": ["Pack Validator"]
            },
            {
                "name": "Spell System",
                "script": "spell_system_agent.py",
                "description": "Integrate D&D 5e v5.1.9 spell system",
                "critical": True,
                "dependencies": ["Item Linker"]
            },
            {
                "name": "Test Runner",
                "script": "test_runner_agent.py",
                "description": "Comprehensive testing of all fixes",
                "critical": True,
                "dependencies": ["Class Builder", "Spell System", "RollTable Fixer"]
            },
            {
                "name": "UI Validator",
                "script": "ui_validator_agent.py",
                "description": "Validate Foundry VTT UI compatibility",
                "critical": False,
                "dependencies": ["Test Runner"]
            },
            {
                "name": "Git Monitor",
                "script": "git_monitor_agent.py",
                "description": "Monitor D&D 5e repository for updates",
                "critical": False,
                "dependencies": []
            }
        ]

        self.execution_results: List[AgentResult] = []

    def setup_logging(self):
        """Setup orchestrator logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - Orchestrator - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.project_root / 'logs' / 'orchestrator.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

        # Ensure directories exist
        (self.project_root / 'logs').mkdir(exist_ok=True)
        (self.project_root / 'reports').mkdir(exist_ok=True)

    def run_full_orchestration(self, skip_non_critical: bool = False) -> Dict[str, Any]:
        """
        Run complete agent orchestration

        Args:
            skip_non_critical: Skip non-critical agents for faster execution

        Returns:
            Summary of orchestration results
        """
        self.logger.info("🚀 Starting Brancalonia Multi-Agent Orchestration")
        self.logger.info(f"Project: {self.project_root}")
        self.logger.info(f"Skip non-critical: {skip_non_critical}")

        start_time = time.time()

        # Pre-execution checks
        if not self.pre_execution_checks():
            return {"status": "FAILED", "message": "Pre-execution checks failed"}

        # Execute agents in pipeline order
        for agent_config in self.agent_pipeline:
            # Skip non-critical agents if requested
            if skip_non_critical and not agent_config["critical"]:
                self.logger.info(f"⏭️ Skipping non-critical agent: {agent_config['name']}")
                self.execution_results.append(AgentResult(
                    agent_name=agent_config["name"],
                    execution_time=0.0,
                    status="SKIPPED",
                    summary={"reason": "non_critical_skipped"}
                ))
                continue

            # Check dependencies
            if not self.check_dependencies(agent_config):
                self.logger.error(f"❌ Dependencies not met for {agent_config['name']}")
                self.execution_results.append(AgentResult(
                    agent_name=agent_config["name"],
                    execution_time=0.0,
                    status="FAILED",
                    summary={},
                    error_message="Dependencies not satisfied"
                ))
                continue

            # Execute agent
            result = self.execute_agent(agent_config)
            self.execution_results.append(result)

            # Stop on critical agent failure
            if result.status == "FAILED" and agent_config["critical"]:
                self.logger.error(f"🚨 Critical agent failed: {agent_config['name']}")
                break

        total_time = time.time() - start_time

        # Generate final report
        summary = self.generate_orchestration_summary(total_time)
        self.generate_final_report(summary)

        self.logger.info(f"✅ Orchestration completed in {total_time:.2f} seconds")
        return summary

    def pre_execution_checks(self) -> bool:
        """Perform pre-execution environment checks"""
        self.logger.info("🔍 Performing pre-execution checks...")

        checks = [
            ("Project directory exists", self.project_root.exists()),
            ("Packs directory exists", (self.project_root / "packs").exists()),
            ("Scripts directory exists", (self.project_root / "scripts").exists()),
            ("Module.json exists", (self.project_root / "module.json").exists()),
        ]

        all_passed = True
        for check_name, passed in checks:
            status = "✅" if passed else "❌"
            self.logger.info(f"  {status} {check_name}")
            if not passed:
                all_passed = False

        # Check Python dependencies
        try:
            import requests
            self.logger.info("  ✅ Python dependencies available")
        except ImportError:
            self.logger.warning("  ⚠️ Some Python dependencies missing (requests)")

        # Check for FVTT CLI
        try:
            result = subprocess.run(['fvtt', '--version'],
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                self.logger.info("  ✅ Foundry VTT CLI available")
            else:
                self.logger.warning("  ⚠️ Foundry VTT CLI not working properly")
        except (subprocess.TimeoutExpired, FileNotFoundError):
            self.logger.warning("  ⚠️ Foundry VTT CLI not available")

        return all_passed

    def check_dependencies(self, agent_config: Dict[str, Any]) -> bool:
        """Check if agent dependencies are satisfied"""
        dependencies = agent_config.get("dependencies", [])

        if not dependencies:
            return True

        for dep_name in dependencies:
            # Find dependency result
            dep_result = None
            for result in self.execution_results:
                if result.agent_name == dep_name:
                    dep_result = result
                    break

            if not dep_result:
                self.logger.error(f"Dependency not found: {dep_name}")
                return False

            if dep_result.status == "FAILED":
                self.logger.error(f"Dependency failed: {dep_name}")
                return False

        return True

    def execute_agent(self, agent_config: Dict[str, Any]) -> AgentResult:
        """Execute a single agent"""
        agent_name = agent_config["name"]
        script_name = agent_config["script"]
        script_path = self.project_root / "scripts" / script_name

        self.logger.info(f"🔄 Executing: {agent_name}")
        self.logger.info(f"   📝 {agent_config['description']}")

        start_time = time.time()

        try:
            # Check if script exists
            if not script_path.exists():
                raise FileNotFoundError(f"Agent script not found: {script_path}")

            # Execute agent
            result = subprocess.run(
                [sys.executable, str(script_path), str(self.project_root)],
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
                cwd=self.project_root
            )

            execution_time = time.time() - start_time

            if result.returncode == 0:
                # Parse agent output for summary
                summary = self.parse_agent_output(result.stdout, agent_name)

                self.logger.info(f"   ✅ {agent_name} completed successfully ({execution_time:.2f}s)")
                return AgentResult(
                    agent_name=agent_name,
                    execution_time=execution_time,
                    status="SUCCESS",
                    summary=summary
                )
            else:
                self.logger.error(f"   ❌ {agent_name} failed with return code {result.returncode}")
                self.logger.error(f"   Error: {result.stderr}")
                return AgentResult(
                    agent_name=agent_name,
                    execution_time=execution_time,
                    status="FAILED",
                    summary={},
                    error_message=result.stderr
                )

        except subprocess.TimeoutExpired:
            execution_time = time.time() - start_time
            self.logger.error(f"   ⏰ {agent_name} timed out after {execution_time:.2f}s")
            return AgentResult(
                agent_name=agent_name,
                execution_time=execution_time,
                status="FAILED",
                summary={},
                error_message="Agent execution timed out"
            )

        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"   💥 {agent_name} crashed: {e}")
            return AgentResult(
                agent_name=agent_name,
                execution_time=execution_time,
                status="FAILED",
                summary={},
                error_message=str(e)
            )

    def parse_agent_output(self, output: str, agent_name: str) -> Dict[str, Any]:
        """Parse agent output to extract summary information"""
        summary = {"raw_output": output}

        # Look for common patterns in agent output
        lines = output.split('\n')

        for line in lines:
            line = line.strip()

            # Look for completion messages
            if "Complete!" in line:
                summary["completed"] = True

            # Extract numeric results
            if "fixes" in line.lower() and any(char.isdigit() for char in line):
                numbers = [int(s) for s in line.split() if s.isdigit()]
                if numbers:
                    summary["fixes_applied"] = numbers[0]

            if "validated" in line.lower() and any(char.isdigit() for char in line):
                numbers = [int(s) for s in line.split() if s.isdigit()]
                if numbers:
                    summary["items_validated"] = numbers[0]

            if "passed" in line.lower() and "/" in line:
                # Look for test results like "50/60 tests passed"
                try:
                    parts = line.split()
                    for part in parts:
                        if "/" in part and all(c.isdigit() or c == "/" for c in part):
                            passed, total = map(int, part.split("/"))
                            summary["tests_passed"] = passed
                            summary["tests_total"] = total
                            break
                except ValueError:
                    pass

        return summary

    def generate_orchestration_summary(self, total_time: float) -> Dict[str, Any]:
        """Generate comprehensive orchestration summary"""
        successful_agents = [r for r in self.execution_results if r.status == "SUCCESS"]
        failed_agents = [r for r in self.execution_results if r.status == "FAILED"]
        skipped_agents = [r for r in self.execution_results if r.status == "SKIPPED"]

        # Calculate overall success rate
        total_agents = len(self.execution_results)
        success_rate = (len(successful_agents) / total_agents * 100) if total_agents > 0 else 0

        # Determine overall status
        critical_agents = [cfg for cfg in self.agent_pipeline if cfg["critical"]]
        critical_failures = [r for r in failed_agents
                           if any(cfg["name"] == r.agent_name and cfg["critical"]
                                 for cfg in critical_agents)]

        if critical_failures:
            overall_status = "CRITICAL_FAILURE"
        elif failed_agents:
            overall_status = "PARTIAL_SUCCESS"
        elif successful_agents:
            overall_status = "SUCCESS"
        else:
            overall_status = "NO_EXECUTION"

        summary = {
            "orchestration_timestamp": datetime.now().isoformat(),
            "total_execution_time": total_time,
            "overall_status": overall_status,
            "success_rate": success_rate,
            "agent_summary": {
                "total_agents": total_agents,
                "successful": len(successful_agents),
                "failed": len(failed_agents),
                "skipped": len(skipped_agents)
            },
            "agent_results": [
                {
                    "agent_name": result.agent_name,
                    "status": result.status,
                    "execution_time": result.execution_time,
                    "summary": result.summary,
                    "error_message": result.error_message
                }
                for result in self.execution_results
            ],
            "critical_failures": [r.agent_name for r in critical_failures],
            "performance_metrics": {
                "fastest_agent": min(successful_agents, key=lambda x: x.execution_time).agent_name if successful_agents else None,
                "slowest_agent": max(successful_agents, key=lambda x: x.execution_time).agent_name if successful_agents else None,
                "total_fixes_applied": sum(r.summary.get("fixes_applied", 0) for r in successful_agents),
                "total_items_validated": sum(r.summary.get("items_validated", 0) for r in successful_agents)
            }
        }

        return summary

    def generate_final_report(self, summary: Dict[str, Any]):
        """Generate comprehensive final report"""
        report_path = self.project_root / "reports" / "orchestration_report.json"

        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)

        self.logger.info(f"📊 Final report saved to: {report_path}")

        # Generate human-readable summary
        self.generate_human_readable_summary(summary, report_path.parent / "orchestration_summary.md")

    def generate_human_readable_summary(self, summary: Dict[str, Any], summary_path: Path):
        """Generate human-readable orchestration summary"""
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("# Brancalonia Multi-Agent Orchestration Report\n\n")
            f.write(f"**Execution Date:** {summary['orchestration_timestamp']}\n")
            f.write(f"**Total Duration:** {summary['total_execution_time']:.2f} seconds\n")
            f.write(f"**Overall Status:** {summary['overall_status']}\n")
            f.write(f"**Success Rate:** {summary['success_rate']:.1f}%\n\n")

            # Status indicator
            status = summary['overall_status']
            if status == "SUCCESS":
                f.write("🎉 **ORCHESTRATION SUCCESSFUL**\n\n")
                f.write("All critical agents completed successfully. Brancalonia is now fully compatible with D&D 5e v5.1.9!\n\n")
            elif status == "PARTIAL_SUCCESS":
                f.write("⚠️ **PARTIAL SUCCESS**\n\n")
                f.write("Critical agents succeeded but some non-critical agents failed. Review failures below.\n\n")
            elif status == "CRITICAL_FAILURE":
                f.write("🚨 **CRITICAL FAILURE**\n\n")
                f.write("One or more critical agents failed. Manual intervention required.\n\n")
            else:
                f.write("❓ **UNKNOWN STATUS**\n\n")

            f.write("## Agent Execution Summary\n\n")
            f.write(f"- **Total Agents:** {summary['agent_summary']['total_agents']}\n")
            f.write(f"- **Successful:** {summary['agent_summary']['successful']} ✅\n")
            f.write(f"- **Failed:** {summary['agent_summary']['failed']} ❌\n")
            f.write(f"- **Skipped:** {summary['agent_summary']['skipped']} ⏭️\n\n")

            # Performance metrics
            metrics = summary.get('performance_metrics', {})
            if metrics.get('total_fixes_applied', 0) > 0:
                f.write("## Performance Metrics\n\n")
                f.write(f"- **Total Fixes Applied:** {metrics.get('total_fixes_applied', 0)}\n")
                f.write(f"- **Total Items Validated:** {metrics.get('total_items_validated', 0)}\n")
                if metrics.get('fastest_agent'):
                    f.write(f"- **Fastest Agent:** {metrics['fastest_agent']}\n")
                if metrics.get('slowest_agent'):
                    f.write(f"- **Slowest Agent:** {metrics['slowest_agent']}\n")
                f.write("\n")

            # Agent details
            f.write("## Individual Agent Results\n\n")
            for result in summary['agent_results']:
                status_icon = {
                    "SUCCESS": "✅",
                    "FAILED": "❌",
                    "SKIPPED": "⏭️"
                }.get(result['status'], "❓")

                f.write(f"### {status_icon} {result['agent_name']}\n")
                f.write(f"**Status:** {result['status']}\n")
                f.write(f"**Execution Time:** {result['execution_time']:.2f} seconds\n")

                if result['status'] == "SUCCESS":
                    agent_summary = result.get('summary', {})
                    if agent_summary.get('fixes_applied'):
                        f.write(f"**Fixes Applied:** {agent_summary['fixes_applied']}\n")
                    if agent_summary.get('items_validated'):
                        f.write(f"**Items Validated:** {agent_summary['items_validated']}\n")
                    if agent_summary.get('tests_passed') and agent_summary.get('tests_total'):
                        f.write(f"**Tests:** {agent_summary['tests_passed']}/{agent_summary['tests_total']} passed\n")

                elif result['status'] == "FAILED":
                    if result.get('error_message'):
                        f.write(f"**Error:** {result['error_message'][:200]}...\n")

                f.write("\n")

            # Critical failures
            if summary.get('critical_failures'):
                f.write("## Critical Failures\n\n")
                f.write("The following critical agents failed and require immediate attention:\n\n")
                for agent_name in summary['critical_failures']:
                    f.write(f"- 🚨 **{agent_name}**\n")
                f.write("\n")

            # Next steps
            f.write("## Next Steps\n\n")
            if status == "SUCCESS":
                f.write("### Deployment Ready ✅\n")
                f.write("1. 🧪 Test module in Foundry VTT development environment\n")
                f.write("2. 🎮 Create test characters and scenarios\n")
                f.write("3. 📦 Package for distribution\n")
                f.write("4. 📊 Set up monitoring for D&D 5e updates\n")
            elif status == "PARTIAL_SUCCESS":
                f.write("### Review and Fix ⚠️\n")
                f.write("1. 🔍 Review failed non-critical agents\n")
                f.write("2. 🛠️ Apply manual fixes if needed\n")
                f.write("3. 🔄 Re-run specific agents\n")
                f.write("4. ✅ Proceed with testing once resolved\n")
            else:
                f.write("### Critical Issues Need Resolution 🚨\n")
                f.write("1. 🆘 Address critical agent failures immediately\n")
                f.write("2. 🔧 Run agents individually for debugging\n")
                f.write("3. 📋 Check logs for detailed error information\n")
                f.write("4. 🔄 Re-run orchestration after fixes\n")

            f.write("\n## Project Status\n\n")
            f.write("**Brancalonia D&D 5e v5.1.9 Compatibility:** ")
            if status == "SUCCESS":
                f.write("✅ **FULLY COMPATIBLE**\n\n")
                f.write("The module has been successfully adapted for D&D 5e v5.1.9 and is ready for use in Foundry VTT.\n")
            elif status == "PARTIAL_SUCCESS":
                f.write("🟡 **MOSTLY COMPATIBLE**\n\n")
                f.write("Core functionality is compatible with minor issues in non-critical areas.\n")
            else:
                f.write("🔴 **COMPATIBILITY ISSUES**\n\n")
                f.write("Significant issues prevent full D&D 5e v5.1.9 compatibility. Manual intervention required.\n")

        self.logger.info(f"📄 Human-readable summary saved to: {summary_path}")

    def run_agent_subset(self, agent_names: List[str]) -> Dict[str, Any]:
        """Run only specific agents"""
        self.logger.info(f"🎯 Running agent subset: {', '.join(agent_names)}")

        # Filter pipeline to only include requested agents
        filtered_pipeline = [cfg for cfg in self.agent_pipeline if cfg["name"] in agent_names]

        if not filtered_pipeline:
            return {"status": "FAILED", "message": "No valid agents found"}

        # Execute filtered agents
        start_time = time.time()

        for agent_config in filtered_pipeline:
            result = self.execute_agent(agent_config)
            self.execution_results.append(result)

        total_time = time.time() - start_time
        summary = self.generate_orchestration_summary(total_time)

        return summary

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Brancalonia Multi-Agent Orchestrator")
    parser.add_argument("project_root", nargs="?",
                       default="/Users/erik/Desktop/brancalonia-bigat-master",
                       help="Path to Brancalonia project root")
    parser.add_argument("--skip-non-critical", action="store_true",
                       help="Skip non-critical agents for faster execution")
    parser.add_argument("--agents", nargs="+",
                       help="Run only specific agents")
    parser.add_argument("--list-agents", action="store_true",
                       help="List available agents and exit")

    args = parser.parse_args()

    orchestrator = BrancaloniaOrchestrator(args.project_root)

    if args.list_agents:
        print("\n🤖 Available Agents:\n")
        for i, agent in enumerate(orchestrator.agent_pipeline, 1):
            critical = "🔴 CRITICAL" if agent["critical"] else "🟡 Optional"
            print(f"{i:2d}. {agent['name']} ({critical})")
            print(f"    📝 {agent['description']}")
            if agent['dependencies']:
                print(f"    🔗 Depends on: {', '.join(agent['dependencies'])}")
            print()
        sys.exit(0)

    print("\n🚀 Brancalonia Multi-Agent Orchestration System")
    print("=" * 50)
    print(f"📁 Project: {args.project_root}")
    print(f"⚡ Mode: {'Fast (critical only)' if args.skip_non_critical else 'Complete'}")
    if args.agents:
        print(f"🎯 Target Agents: {', '.join(args.agents)}")
    print()

    # Execute orchestration
    if args.agents:
        results = orchestrator.run_agent_subset(args.agents)
    else:
        results = orchestrator.run_full_orchestration(args.skip_non_critical)

    # Print final results
    print("\n" + "=" * 50)
    print("🏁 ORCHESTRATION COMPLETE")
    print("=" * 50)
    print(f"Status: {results.get('overall_status', 'UNKNOWN')}")
    print(f"Success Rate: {results.get('success_rate', 0):.1f}%")
    print(f"Duration: {results.get('total_execution_time', 0):.2f} seconds")

    if results.get('critical_failures'):
        print(f"🚨 Critical Failures: {', '.join(results['critical_failures'])}")

    print(f"\n📊 Reports: {orchestrator.project_root}/reports/")
    print(f"📋 Logs: {orchestrator.project_root}/logs/")

    # Exit with appropriate code
    if results.get('overall_status') == "CRITICAL_FAILURE":
        sys.exit(1)
    elif results.get('overall_status') == "PARTIAL_SUCCESS":
        sys.exit(2)
    else:
        sys.exit(0)