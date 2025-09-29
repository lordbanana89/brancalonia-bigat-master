#!/bin/bash

# Script to safely remove ONLY truly redundant modules
# These are modules that:
# 1. Are NOT loaded in module.json
# 2. Have duplicate functionality with loaded modules
# 3. Have been verified as safe to remove

echo "🧹 Brancalonia v10 - Removing ONLY verified redundant modules"
echo "============================================================"

# Move to modules directory
cd modules

# Modules to remove - verified duplicates/redundant
REMOVE=(
  # Icon fixes - keeping only brancalonia-icon-interceptor.js
  "brancalonia-fix-icon-text-immediate.js"
  "brancalonia-icon-detector.js"
  "brancalonia-icons-auto-fix.js"
  "brancalonia-icons-complete-fix.js"
  "brancalonia-icons-global-fix.js"
  "brancalonia-image-fallback.js"
  "brancalonia-image-fix-ultimate.js"

  # Init modules - keeping core/BrancaloniaCore.js
  "brancalonia-init.js"
  "brancalonia-minimal-init.js"
  "brancalonia-safe-init.js"
  "brancalonia-safe-loader.js"
  "brancalonia-module-loader.js"
  "brancalonia-debug-loader.js"
  "brancalonia-api-modern-safe.js"

  # Duplicate compatibility - keeping loaded ones
  "brancalonia-v13-compatibility.js"
  "brancalonia-module-compatibility.js"
  "brancalonia-appv2-compatibility.js"
  "brancalonia-compat-fix.js"
  "compatibility-test.js"
  "brancalonia-deprecation-fix.js"
  "brancalonia-early-namespace-fix.js"

  # Actor sheet fixes - keeping brancalonia-sheets.js
  "brancalonia-actorsheet-fix.js"
  "brancalonia-actorsheet-mixin-fix.js"

  # Active effects - keeping smaller one
  "brancalonia-active-effects-complete.js"

  # Small utilities without real implementation
  "brancalonia-cache-buster.js"
  "brancalonia-suppress-warnings-simple.js"
  "brancalonia-suppress-appv1-warning.js"

  # Other redundant fixes
  "brancalonia-chat-hooks-fix.js"
  "brancalonia-config-fix.js"
  "brancalonia-data-validator.js"
  "brancalonia-epic-rolls-fix.js"
  "brancalonia-links.js"
  "brancalonia-logger.js"
  "brancalonia-performance-monitor.js"
  "brancalonia-polygon-fix.js"
  "brancalonia-power-select-fix.js"
  "brancalonia-renaissance-activator.js"
  "brancalonia-rules-chat.js"
  "brancalonia-slugify-fix.js"
  "brancalonia-targeted-fix.js"
  "brancalonia-tidbits-fix.js"
  "brancalonia-tooltip-override.js"

  # Duplicate rischi mestiere
  "imbosco-rischi-mestiere.js"
)

removed=0
for file in "${REMOVE[@]}"; do
  if [ -f "$file" ]; then
    echo "  Removing: $file"
    rm "$file"
    ((removed++))
  fi
done

echo ""
echo "✅ Removed $removed redundant modules"
echo "📦 Keeping all loaded modules + unique game mechanics"