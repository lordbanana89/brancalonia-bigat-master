#!/usr/bin/env python3
"""
Test runner for Agent Debugger Profondo
Quick validation and demo of the deep testing system
"""

import subprocess
import sys
from pathlib import Path

def run_debugger_test():
    """Run the debugger on the current module"""
    module_path = Path(__file__).parent.parent
    debugger_script = module_path / "scripts" / "agent-debugger-profondo.py"

    print("🔧 Testing Agent Debugger Profondo")
    print(f"Module path: {module_path}")
    print(f"Debugger script: {debugger_script}")

    if not debugger_script.exists():
        print("❌ Debugger script not found!")
        return False

    try:
        # Run the debugger
        result = subprocess.run([
            sys.executable,
            str(debugger_script),
            str(module_path)
        ], capture_output=True, text=True, timeout=300)

        print("\n" + "="*50)
        print("DEBUGGER OUTPUT:")
        print("="*50)
        print(result.stdout)

        if result.stderr:
            print("\nERRORS:")
            print(result.stderr)

        print(f"\nExit code: {result.returncode}")

        # Check if report was generated
        report_file = module_path / "scripts" / "debug_report.json"
        if report_file.exists():
            print(f"✅ Report generated: {report_file}")
            return True
        else:
            print("❌ No report generated")
            return False

    except subprocess.TimeoutExpired:
        print("❌ Debugger timed out after 5 minutes")
        return False
    except Exception as e:
        print(f"❌ Error running debugger: {e}")
        return False

if __name__ == "__main__":
    success = run_debugger_test()
    sys.exit(0 if success else 1)