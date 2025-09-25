#!/usr/bin/env node

/**
 * Script per verificare che i compendi compilati abbiano il campo _key
 */

const { ClassicLevel } = require('classic-level');
const path = require('path');

async function verifyPack(packName) {
  const dbPath = path.join(__dirname, '..', 'packs', packName);

  console.log(`\nVerifica ${packName}...`);

  try {
    const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
    await db.open();

    let count = 0;
    let missingKeys = 0;

    for await (const [key, value] of db.iterator()) {
      count++;
      if (!value._key) {
        console.log(`  ❌ Manca _key per: ${value.name || value._id}`);
        missingKeys++;
      }
    }

    await db.close();

    if (missingKeys === 0) {
      console.log(`  ✅ ${count} documenti verificati - tutti hanno _key`);
    } else {
      console.log(`  ⚠️ ${missingKeys}/${count} documenti senza _key`);
    }

    return { count, missingKeys };
  } catch (error) {
    console.log(`  ❌ Errore: ${error.message}`);
    return { count: 0, missingKeys: 0 };
  }
}

async function verifyAll() {
  console.log("=== VERIFICA COMPENDI ===");

  const packs = [
    'backgrounds',
    'razze',
    'equipaggiamento',
    'talenti',
    'incantesimi',
    'brancalonia-features',
    'sottoclassi',
    'emeriticenze',
    'classi',
    'npc',
    'regole',
    'rollable-tables',
    'macro'
  ];

  let totalDocs = 0;
  let totalMissing = 0;

  for (const pack of packs) {
    const result = await verifyPack(pack);
    totalDocs += result.count;
    totalMissing += result.missingKeys;
  }

  console.log("\n=== RISULTATO FINALE ===");
  console.log(`Totale documenti: ${totalDocs}`);
  if (totalMissing === 0) {
    console.log("✅ Tutti i documenti hanno il campo _key!");
  } else {
    console.log(`⚠️ ${totalMissing} documenti senza _key`);
  }
}

verifyAll().catch(error => {
  console.error('Errore fatale:', error);
  process.exit(1);
});