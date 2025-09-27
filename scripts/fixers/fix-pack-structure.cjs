const fs = require('fs');
const path = require('path');

const packs = [
  'backgrounds',
  'brancalonia-features',
  'emeriticenze',
  'equipaggiamento',
  'incantesimi',
  'macro',
  'npc',
  'razze',
  'regole',
  'rollable-tables',
  'sottoclassi',
  'talenti'
];

console.log('🔧 Correzione struttura packs per Foundry v13...\n');

for (const packName of packs) {
  const packDir = path.join(__dirname, 'packs', packName);
  const dbSubDir = path.join(packDir, packName);

  if (fs.existsSync(dbSubDir)) {
    // Sposta tutti i file del database dalla sottocartella alla cartella principale
    const files = fs.readdirSync(dbSubDir);

    for (const file of files) {
      const oldPath = path.join(dbSubDir, file);
      const newPath = path.join(packDir, file);

      // Se esiste già un file con lo stesso nome, rimuovilo prima
      if (fs.existsSync(newPath)) {
        fs.rmSync(newPath, { force: true });
      }

      fs.renameSync(oldPath, newPath);
    }

    // Rimuovi la sottocartella vuota
    fs.rmdirSync(dbSubDir);

    console.log(`✅ ${packName}: database spostato nella posizione corretta`);
  } else {
    console.log(`⏭️ ${packName}: già nella struttura corretta`);
  }
}

console.log('\n✅ Struttura packs corretta per Foundry v13!');