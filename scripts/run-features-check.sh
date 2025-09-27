#!/bin/bash
#
# Helper script to run the Agent Features Check
# Usage: ./run-features-check.sh [base_path]
#

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Use provided path or default to project root
BASE_PATH="${1:-$PROJECT_ROOT}"

echo "🚀 Running Agent Features Check..."
echo "Base path: $BASE_PATH"
echo

# Run the Python script
cd "$BASE_PATH"
python3 "$SCRIPT_DIR/agent-features-check.py" "$BASE_PATH"

echo
echo "📄 Report generated: features-check-report.md"
echo "📊 To view the report:"
echo "   cat features-check-report.md"
echo "   # or"
echo "   open features-check-report.md"