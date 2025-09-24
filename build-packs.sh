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

  # Non spostare più i file, sono già in _source

  # Compila con il CLI di Foundry usando _source
  if [ -d "packs/$pack/_source" ] && [ "$(ls -A packs/$pack/_source 2>/dev/null)" ]; then
    fvtt package pack "packs/$pack" --type Module
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