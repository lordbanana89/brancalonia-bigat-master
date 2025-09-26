#!/bin/bash

echo "=== FORCE CLEAN AND RECOMPILE ALL PACKS ==="
echo

# Clean all database files
for pack in backgrounds razze equipaggiamento talenti incantesimi brancalonia-features sottoclassi emeriticenze classi npc regole rollable-tables macro; do
  echo "Cleaning $pack..."
  rm -rf packs/$pack/*.ldb 2>/dev/null
  rm -rf packs/$pack/*.log 2>/dev/null
  rm -rf packs/$pack/CURRENT 2>/dev/null
  rm -rf packs/$pack/LOCK 2>/dev/null
  rm -rf packs/$pack/LOG* 2>/dev/null
  rm -rf packs/$pack/MANIFEST-* 2>/dev/null
done

echo
echo "All packs cleaned. Now recompiling..."
echo

# Recompile
node scripts/compile-with-keys.cjs

echo
echo "=== DONE ==="