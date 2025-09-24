/**
 * Script per ricostruire i pack in formato LevelDB per Foundry VTT
 */

const fs = require('fs');
const path = require('path');

// Lista di tutti i pack
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

function cleanPackDirectory(packName) {
  const packPath = path.join(__dirname, 'packs', packName);

  // Rimuovi tutti i file .db e LOG esistenti
  const files = fs.readdirSync(packPath);
  for (const file of files) {
    if (file.endsWith('.ldb') || file.endsWith('.log') ||
        file === 'CURRENT' || file === 'LOCK' ||
        file === 'LOG' || file.startsWith('MANIFEST')) {
      fs.unlinkSync(path.join(packPath, file));
    }
  }

  console.log(`✅ Pulita directory ${packName}`);
}

// Pulisci tutte le directory dei pack
console.log('Pulizia directory pack...\n');

for (const pack of packs) {
  try {
    cleanPackDirectory(pack);
  } catch (err) {
    console.log(`⚠️ Impossibile pulire ${pack}: ${err.message}`);
  }
}

console.log('\n✅ Pulizia completata!');
console.log('\nOra i pack sono pronti per essere ricompilati da Foundry.');
console.log('I file _source.json verranno usati automaticamente da Foundry.');