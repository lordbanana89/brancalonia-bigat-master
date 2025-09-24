#!/bin/bash

# Script per compilare i pack con il CLI di Foundry VTT

echo "🔨 Compilazione pack con Foundry VTT CLI..."
echo ""

# Lista dei pack
packs=("backgrounds" "brancalonia-features" "emeriticenze" "equipaggiamento" "incantesimi" "macro" "npc" "razze" "regole" "rollable-tables" "sottoclassi" "talenti")

# Per ogni pack
for pack in "${packs[@]}"; do
  echo "📦 Processando $pack..."

  # Crea directory src se non esiste
  mkdir -p "packs/$pack/src"

  # Sposta i file JSON nella directory src
  for file in packs/$pack/*.json; do
    if [[ -f "$file" && "$file" != *"_source.json" && "$file" != *"_sources.json" ]]; then
      filename=$(basename "$file")
      mv "$file" "packs/$pack/src/$filename" 2>/dev/null || true
    fi
  done

  # Compila con il CLI di Foundry
  if [ -d "packs/$pack/src" ] && [ "$(ls -A packs/$pack/src 2>/dev/null)" ]; then
    fvtt package pack "packs/$pack/src" --out "packs/$pack" --type Module
    if [ $? -eq 0 ]; then
      echo "✅ $pack compilato con successo"
    else
      echo "❌ Errore compilando $pack"
    fi
  else
    echo "⚠️  Nessun file sorgente per $pack"
  fi

  echo ""
done

echo "✅ Compilazione completata!"