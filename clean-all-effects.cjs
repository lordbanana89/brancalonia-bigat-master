/**
 * Rimuove tutti gli effects arrays dai file sorgenti
 * Necessario perché il Foundry CLI non supporta effects nei JSON (Issue #41)
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Pulizia effects arrays dai file sorgenti...\n');

const packs = [
  'backgrounds',
  'brancalonia-features',
  'classi',
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

let totalCleaned = 0;

for (const packName of packs) {
  const sourcePath = path.join('./packs', packName, '_source');

  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  ${packName}: directory non trovata`);
    continue;
  }

  const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));
  let cleaned = 0;

  for (const file of files) {
    const filePath = path.join(sourcePath, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Se ha effects array con contenuto, svuotalo
      if (data.effects && Array.isArray(data.effects) && data.effects.length > 0) {
        data.effects = [];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
        cleaned++;
      }
    } catch (e) {
      console.log(`❌ Errore processando ${file}: ${e.message}`);
    }
  }

  if (cleaned > 0) {
    console.log(`✅ ${packName}: puliti ${cleaned} file`);
    totalCleaned += cleaned;
  }
}

console.log(`\n✨ Completato! Puliti ${totalCleaned} file totali`);
console.log('\n📝 Gli Active Effects verranno applicati a runtime tramite script del modulo');