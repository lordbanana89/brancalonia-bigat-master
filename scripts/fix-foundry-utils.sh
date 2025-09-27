#!/bin/bash

# Fix duplicated foundry.utils.foundry.utils patterns
echo "🔧 Fixing duplicated foundry.utils patterns..."

# Fix in all JS and MJS files
find modules/ -type f \( -name "*.js" -o -name "*.mjs" \) -exec sed -i '' 's/foundry\.utils\.foundry\.utils\./foundry.utils./g' {} \;

# Count fixes
FIXED=$(grep -r "foundry.utils.foundry.utils" modules/ --include="*.js" --include="*.mjs" | wc -l)

if [ "$FIXED" -eq 0 ]; then
    echo "✅ All foundry.utils patterns fixed!"
else
    echo "⚠️  Still $FIXED occurrences to fix"
fi

echo "📊 Files processed"