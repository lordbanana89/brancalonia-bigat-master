#!/bin/bash
# Script to remove redundant modules for v10.0.0

# Array of modules to KEEP (from module.json + essential)
KEEP_MODULES=(
  "brancalonia-v13-modern.js"
  "brancalonia-compatibility-fix.js"
  "brancalonia-sheets.js"
  "infamia-tracker.js"
  "haven-system.js"
  "compagnia-manager.js"
  "dirty-jobs.js"
  "malefatte-taglie-nomea.js"
  "menagramo.js"
  "brancalonia-tavern-brawl.js"
  "diseases-system.js"
  "environmental-hazards.js"
  "level-cap.js"
  "brancalonia-dice-theme.js"
  "background-privileges.js"
  "brancalonia-icon-interceptor.js"  # Keep ONE icon fix
)

# Convert to associative array for faster lookup
declare -A keep_map
for module in "${KEEP_MODULES[@]}"; do
  keep_map["$module"]=1
done

# Remove redundant modules
cd modules
removed=0
for file in *.js; do
  if [[ -z "${keep_map[$file]}" ]]; then
    echo "Removing redundant: $file"
    rm "$file"
    ((removed++))
  else
    echo "Keeping essential: $file"
  fi
done

echo ""
echo "✅ Removed $removed redundant modules"
echo "📦 Kept ${#KEEP_MODULES[@]} essential modules"