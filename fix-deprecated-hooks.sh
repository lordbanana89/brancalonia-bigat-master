#!/bin/bash

# Fix deprecated hooks for Foundry v13

echo "Fixing deprecated hooks for Foundry v13..."

# Fix renderChatMessage -> renderChatMessageHTML
echo "Fixing renderChatMessage hooks..."
find modules -name "*.js" -exec grep -l "renderChatMessage[^H]" {} \; | while read file; do
    echo "  Updating $file"
    sed -i '' 's/Hooks\.on("renderChatMessage"/Hooks.on("renderChatMessageHTML"/g' "$file"
    sed -i '' 's/(message, html, data)/(message, html)/g' "$file"
done

# Fix renderItemSheet -> renderItemSheetV2
echo "Fixing renderItemSheet hooks..."
find modules -name "*.js" -exec grep -l 'renderItemSheet"' {} \; | while read file; do
    echo "  Updating $file"
    sed -i '' 's/Hooks\.on("renderItemSheet"/Hooks.on("renderItemSheetV2"/g' "$file"
done

# Fix renderActorSheet -> renderActorSheetV2
echo "Fixing renderActorSheet hooks..."
find modules -name "*.js" -exec grep -l 'renderActorSheet"' {} \; | while read file; do
    echo "  Updating $file"
    sed -i '' 's/Hooks\.on("renderActorSheet"/Hooks.on("renderActorSheetV2"/g' "$file"
done

echo "Done! All deprecated hooks have been updated."