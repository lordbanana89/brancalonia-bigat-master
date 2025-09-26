#!/usr/bin/env node

const { ClassicLevel } = require('classic-level');
const path = require('path');

async function removeIndexEntry(packName) {
  const dbPath = path.join(__dirname, '..', 'packs', packName);

  console.log(`\nCleaning ${packName}...`);

  const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
  await db.open();

  // Find and remove index entries
  const toRemove = [];
  for await (const [key, value] of db.iterator()) {
    if (value.name === 'Index' || value._id === 'undefined' || key.includes('undefined')) {
      console.log(`  Removing: ${key} (${value.name || 'no name'})`);
      toRemove.push(key);
    }
  }

  // Remove entries
  for (const key of toRemove) {
    await db.del(key);
  }

  await db.close();

  if (toRemove.length > 0) {
    console.log(`  ✅ Removed ${toRemove.length} entries`);
  } else {
    console.log(`  ✅ No index entries found`);
  }
}

async function cleanAll() {
  console.log("=== REMOVING INDEX ENTRIES FROM PACKS ===");

  await removeIndexEntry('brancalonia-features');
  await removeIndexEntry('incantesimi');

  console.log("\n=== DONE ===");
}

cleanAll().catch(console.error);