#!/bin/bash

# Script per compilare tutti i pack e verificare errori
echo "🔧 COMPILAZIONE COMPLETA PACK BRANCALONIA"
echo "=========================================="
echo ""

SUCCESS=0
FAILED=0
FAILED_PACKS=""

# Lista dei pack da compilare
PACKS=(
    "razze"
    "equipaggiamento"
    "talenti"
    "incantesimi"
    "rollable-tables"
    "regole"
    "npc"
    "macro"
    "brancalonia-features"
    "backgrounds"
    "sottoclassi"
    "emeriticenze"
    "classi"
)

for pack in "${PACKS[@]}"; do
    echo -n "📦 Compilando $pack... "

    # Verifica che la directory source esista
    if [ ! -d "packs/$pack/_source" ]; then
        echo "❌ Directory _source mancante!"
        FAILED=$((FAILED + 1))
        FAILED_PACKS="$FAILED_PACKS\n  - $pack: directory source mancante"
        continue
    fi

    # Compila il pack
    if fvtt package pack "brancalonia.$pack" --in "packs/$pack/_source" --out "packs/$pack" > /tmp/compile_$pack.log 2>&1; then
        COUNT=$(grep -c "^Packed" /tmp/compile_$pack.log)
        echo "✅ ($COUNT items)"
        SUCCESS=$((SUCCESS + 1))
    else
        echo "❌ FALLITO!"
        ERROR=$(tail -n 5 /tmp/compile_$pack.log | head -n 1)
        FAILED=$((FAILED + 1))
        FAILED_PACKS="$FAILED_PACKS\n  - $pack: $ERROR"
    fi
done

echo ""
echo "=========================================="
echo "📊 RISULTATI:"
echo "  ✅ Compilati con successo: $SUCCESS"
echo "  ❌ Falliti: $FAILED"

if [ $FAILED -gt 0 ]; then
    echo ""
    echo "⚠️  Pack con errori:"
    echo -e "$FAILED_PACKS"
fi

echo ""
echo "✨ Compilazione completata!"
