#!/bin/bash
echo "🔧 COMPILAZIONE COMPLETA TUTTI I PACK BRANCALONIA"
echo "=================================================="

PACKS=(
  "backgrounds"
  "brancalonia-features" 
  "classi"
  "emeriticenze"
  "equipaggiamento"
  "incantesimi"
  "npc"
  "razze"
  "regole"
  "rollable-tables"
  "sottoclassi"
  "talenti"
)

SUCCESS=0
FAILED=0

for pack in "${PACKS[@]}"; do
  echo ""
  echo "📦 Compilando pack: $pack"
  echo "-----------------------------------"
  
  if [ -d "packs/$pack/_source" ]; then
    file_count=$(ls -1 packs/$pack/_source/*.json 2>/dev/null | wc -l)
    echo "  File JSON trovati: $file_count"
    
    fvtt package pack "brancalonia.$pack" --in "packs/$pack/_source" --out "packs/$pack" 2>&1 | grep -E "(Packed|Error|Failed)" | head -5
    
    if [ $? -eq 0 ]; then
      echo "  ✅ Pack compilato con successo"
      ((SUCCESS++))
    else
      echo "  ❌ Errore nella compilazione"
      ((FAILED++))
    fi
  else
    echo "  ⚠️  Directory _source non trovata"
    ((FAILED++))
  fi
done

echo ""
echo "=================================================="
echo "RIEPILOGO COMPILAZIONE:"
echo "  ✅ Pack compilati: $SUCCESS"
echo "  ❌ Pack falliti: $FAILED"
echo "=================================================="
