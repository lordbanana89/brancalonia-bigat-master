const { ClassicLevel } = require('classic-level');
const path = require('path');

async function verifyPack(packName) {
  const dbDir = path.join(__dirname, 'packs', packName, packName);

  try {
    const db = new ClassicLevel(dbDir, { valueEncoding: 'json' });
    await db.open();

    let count = 0;
    const docs = [];

    for await (const [key, value] of db.iterator()) {
      count++;
      if (count <= 3) {
        docs.push({ key, name: value.name });
      }
    }

    await db.close();

    if (count > 0) {
      console.log(`✅ ${packName}: ${count} documenti`);
      if (docs.length > 0) {
        console.log(`   Esempi: ${docs.map(d => d.name).join(', ')}`);
      }
    } else {
      console.log(`❌ ${packName}: database vuoto`);
    }
  } catch (error) {
    console.error(`❌ ${packName}: Errore - ${error.message}`);
  }
}

async function main() {
  console.log('=== Verifica Database LevelDB ===\n');

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

  let total = 0;
  for (const pack of packs) {
    await verifyPack(pack);
  }

  console.log('\n✅ Verifica completata!');
}

main().catch(console.error);