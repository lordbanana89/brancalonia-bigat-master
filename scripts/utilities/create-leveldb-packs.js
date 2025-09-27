const fs = require('fs');
const path = require('path');
const { ClassicLevel } = require('classic-level');

async function createLevelDBPack(packName) {
  // Prova prima _source, poi src
  let srcDir = path.join(__dirname, 'packs', packName, '_source');
  if (!fs.existsSync(srcDir)) {
    srcDir = path.join(__dirname, 'packs', packName, 'src');
  }

  const dbDir = path.join(__dirname, 'packs', packName);

  // Verifica che esistano file sorgente
  if (!fs.existsSync(srcDir)) {
    console.log(`⚠️  No source directory for ${packName}`);
    return;
  }

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log(`⚠️  No JSON files in ${packName}/src`);
    return;
  }

  // Crea il database LevelDB
  const db = new ClassicLevel(dbDir, { valueEncoding: 'json' });

  try {
    // Apri il database
    await db.open();

    // Inserisci ogni documento
    for (const file of files) {
      const content = fs.readFileSync(path.join(srcDir, file), 'utf8');
      const doc = JSON.parse(content);

      // Usa l'_id del documento o genera uno basato sul filename
      const id = doc._id || file.replace('.json', '');

      // Inserisci nel database
      await db.put(id, doc);
    }

    console.log(`✅ ${packName}: ${files.length} documenti inseriti in LevelDB`);

    // Chiudi il database
    await db.close();
  } catch (error) {
    console.error(`❌ Errore con ${packName}:`, error);
    if (db.isOpen()) await db.close();
  }
}

async function main() {
  console.log('🔨 Creazione pack LevelDB per Foundry VTT v13...\n');

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

  for (const pack of packs) {
    await createLevelDBPack(pack);
  }

  console.log('\n✅ Completato!');
}

main().catch(console.error);