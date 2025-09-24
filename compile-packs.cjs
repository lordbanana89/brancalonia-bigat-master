const fs = require('fs');
const path = require('path');
const { ClassicLevel } = require('classic-level');

async function compilePack(packName) {
  const srcDir = path.join(__dirname, 'packs', packName, '_source');
  const dbDir = path.join(__dirname, 'packs', packName, packName);

  if (!fs.existsSync(srcDir)) {
    console.log(`⚠️  Nessuna directory sorgente per ${packName}`);
    return;
  }

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log(`⚠️  Nessun file JSON in ${packName}/_source`);
    return;
  }

  // Rimuovi database esistente
  if (fs.existsSync(dbDir)) {
    fs.rmSync(dbDir, { recursive: true });
  }

  // Crea nuovo database
  const db = new ClassicLevel(dbDir, { valueEncoding: 'json' });

  try {
    await db.open();

    let count = 0;
    for (const file of files) {
      const content = fs.readFileSync(path.join(srcDir, file), 'utf8');
      const doc = JSON.parse(content);

      // Usa l'_id del documento come chiave
      const id = doc._id || path.basename(file, '.json');

      await db.put(id, doc);
      count++;
    }

    console.log(`✅ ${packName}: ${count} documenti inseriti`);

    await db.close();
  } catch (error) {
    console.error(`❌ Errore con ${packName}:`, error);
    if (db.isOpen()) await db.close();
  }
}

async function main() {
  console.log('🔨 Compilazione pack con LevelDB diretto...\n');

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
    await compilePack(pack);
  }

  console.log('\n✅ Compilazione completata!');
}

main().catch(console.error);