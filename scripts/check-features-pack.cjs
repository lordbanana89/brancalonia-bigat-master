#!/usr/bin/env node

const { ClassicLevel } = require('classic-level');
const path = require('path');

async function checkFeaturesPack() {
  const dbPath = path.join(__dirname, '..', 'packs', 'brancalonia-features');

  console.log('=== CHECKING BRANCALONIA-FEATURES PACK ===\n');

  const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
  await db.open();

  let totalCount = 0;
  let noName = [];
  let indexEntries = [];
  let samples = [];

  for await (const [key, value] of db.iterator()) {
    totalCount++;

    // Collect first 20 samples
    if (samples.length < 20) {
      samples.push({
        name: value.name,
        type: value.type,
        key: key
      });
    }

    // Check for missing names
    if (!value.name || value.name === '') {
      noName.push({
        key: key,
        id: value._id
      });
    }

    // Check for Index entries
    if (value.name === 'Index' || value.name === 'index') {
      indexEntries.push({
        key: key,
        id: value._id,
        name: value.name
      });
    }
  }

  await db.close();

  console.log(`Total entries: ${totalCount}`);
  console.log(`Missing names: ${noName.length}`);
  console.log(`Index entries: ${indexEntries.length}`);

  if (noName.length > 0) {
    console.log('\nDocuments with missing names:');
    noName.forEach(d => console.log(`  - ${d.key} (${d.id})`));
  }

  if (indexEntries.length > 0) {
    console.log('\nIndex entries found:');
    indexEntries.forEach(d => console.log(`  - ${d.key}: ${d.name}`));
  }

  console.log('\nFirst 20 entries:');
  samples.forEach(s => {
    console.log(`  - ${s.name || 'NO NAME'} (${s.type}) [${s.key}]`);
  });
}

checkFeaturesPack().catch(console.error);