const { ClassicLevel } = require('classic-level');
const fs = require('fs');
const path = require('path');

async function compilePack(packName, collectionType) {
  const sourcePath = path.join(__dirname, 'packs', packName, '_source');
  const dbPath = path.join(__dirname, 'packs', packName); // Database direttamente nella cartella pack

  // Rimuovi il database esistente
  if (fs.existsSync(dbPath)) {
    fs.rmSync(dbPath, { recursive: true, force: true });
  }

  // Crea nuovo database
  const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
  await db.open();

  // Leggi tutti i file JSON
  const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(sourcePath, file), 'utf8'));
    const id = content._id;
    const key = `!${collectionType}!${id}`;

    // IMPORTANTE: Includiamo _key nel documento salvato
    const docToSave = {
      ...content,
      _key: key  // Assicuriamoci che _key sia nel documento
    };

    await db.put(key, docToSave);
  }

  await db.close();
  console.log(`✅ ${packName}: ${files.length} documenti compilati con _key`);
}

async function compileAll() {
  console.log('🔨 Compilazione packs con campo _key preservato...\n');

  const packs = [
    { name: 'backgrounds', type: 'items' },
    { name: 'brancalonia-features', type: 'items' },
    { name: 'emeriticenze', type: 'items' },
    { name: 'equipaggiamento', type: 'items' },
    { name: 'incantesimi', type: 'items' },
    { name: 'macro', type: 'macros' },
    { name: 'npc', type: 'actors' },
    { name: 'razze', type: 'items' },
    { name: 'regole', type: 'journal' },
    { name: 'rollable-tables', type: 'tables' },
    { name: 'sottoclassi', type: 'items' },
    { name: 'talenti', type: 'items' }
  ];

  for (const pack of packs) {
    await compilePack(pack.name, pack.type);
  }

  console.log('\n✅ Tutti i packs compilati con _key preservato!');
}

compileAll().catch(console.error);