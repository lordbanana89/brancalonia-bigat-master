#!/usr/bin/env node

const { ClassicLevel } = require('classic-level');
const path = require('path');

async function checkDuplicates(packName) {
  const dbPath = path.join(__dirname, '..', 'packs', packName);

  console.log(`\nControllo duplicati in ${packName}...`);

  const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
  await db.open();

  const names = {};
  const entries = [];

  for await (const [key, value] of db.iterator()) {
    const name = value.name || 'NO_NAME';
    if (!names[name]) {
      names[name] = [];
    }
    names[name].push({
      key: key,
      id: value._id,
      name: name
    });
    entries.push({key, name, id: value._id});
  }

  // Mostra duplicati
  let hasDuplicates = false;
  for (const [name, items] of Object.entries(names)) {
    if (items.length > 1) {
      console.log(`\nDUPLICATO: "${name}" - ${items.length} occorrenze:`);
      items.forEach(item => {
        console.log(`  - Key: ${item.key}`);
        console.log(`    ID: ${item.id}`);
      });
      hasDuplicates = true;
    }
  }

  if (!hasDuplicates) {
    console.log('✓ Nessun duplicato trovato');
  }

  // Mostra tutti per debugging
  console.log(`\nTotale entries: ${entries.length}`);
  console.log('\nLista completa:');
  entries.sort((a, b) => a.name.localeCompare(b.name));
  entries.forEach(e => {
    console.log(`  ${e.name} [${e.id}]`);
  });

  await db.close();
}

// Esegui per backgrounds
checkDuplicates('backgrounds').catch(console.error);