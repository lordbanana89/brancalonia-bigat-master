const fs = require('fs');
const path = require('path');

function addKeysToFiles(packName, collectionType) {
  const srcDir = path.join(__dirname, 'packs', packName, '_source');

  if (!fs.existsSync(srcDir)) {
    console.log(`⚠️  Directory non trovata: ${srcDir}`);
    return;
  }

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(srcDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const doc = JSON.parse(content);

    // Genera _key dal _id o dal nome del file
    const id = doc._id || path.basename(file, '.json');
    doc._key = `!${collectionType}!${id}`;

    // Scrivi il file aggiornato
    fs.writeFileSync(filePath, JSON.stringify(doc, null, 2));
  }

  console.log(`✅ ${packName}: Aggiunte chiavi a ${files.length} file`);
}

// Mappa dei pack alle loro collection type
const packs = {
  'backgrounds': 'items',
  'brancalonia-features': 'items',
  'emeriticenze': 'items',
  'equipaggiamento': 'items',
  'incantesimi': 'items',
  'macro': 'macros',
  'npc': 'actors',
  'razze': 'items',
  'regole': 'journal',
  'rollable-tables': 'tables',
  'sottoclassi': 'items',
  'talenti': 'items'
};

console.log('🔨 Aggiungendo _key ai documenti...\n');

for (const [pack, type] of Object.entries(packs)) {
  addKeysToFiles(pack, type);
}

console.log('\n✅ Completato!');