#!/usr/bin/env node

const { ClassicLevel } = require('classic-level');
const path = require('path');
const fs = require('fs');

const PACKS = [
  { name: 'backgrounds', type: 'Item', expectedMin: 10 },
  { name: 'razze', type: 'Item', expectedMin: 5 },
  { name: 'equipaggiamento', type: 'Item', expectedMin: 100 },
  { name: 'talenti', type: 'Item', expectedMin: 5 },
  { name: 'incantesimi', type: 'Item', expectedMin: 100 },
  { name: 'brancalonia-features', type: 'Item', expectedMin: 200 },
  { name: 'sottoclassi', type: 'Item', expectedMin: 15 },
  { name: 'emeriticenze', type: 'Item', expectedMin: 8 },
  { name: 'classi', type: 'Item', expectedMin: 10 },
  { name: 'npc', type: 'Actor', expectedMin: 30 },
  { name: 'regole', type: 'JournalEntry', expectedMin: 50 },
  { name: 'rollable-tables', type: 'RollTable', expectedMin: 20 },
  { name: 'macro', type: 'Macro', expectedMin: 5 }
];

async function validatePack(packInfo) {
  const dbPath = path.join(__dirname, '..', 'packs', packInfo.name);
  const sourcePath = path.join(__dirname, '..', 'packs', packInfo.name, '_source');

  const result = {
    name: packInfo.name,
    type: packInfo.type,
    compiled: false,
    sourceCount: 0,
    dbCount: 0,
    issues: []
  };

  // Check if compiled
  if (!fs.existsSync(path.join(dbPath, 'CURRENT'))) {
    result.issues.push('❌ Pack not compiled (missing CURRENT file)');
    return result;
  }
  result.compiled = true;

  // Count source files
  if (fs.existsSync(sourcePath)) {
    const sourceFiles = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));
    result.sourceCount = sourceFiles.length;
  }

  // Open database
  const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
  await db.open();

  let dbIssues = {
    missingKey: 0,
    missingName: 0,
    wrongType: 0,
    invalidAdvancementId: 0,
    nullImg: 0,
    invalidIcon: 0,
    indexEntries: 0
  };

  for await (const [key, value] of db.iterator()) {
    result.dbCount++;

    // Check _key field
    if (!value._key) {
      dbIssues.missingKey++;
    } else if (value._key !== key) {
      result.issues.push(`❌ Mismatched _key: ${value._key} !== ${key}`);
    }

    // Check name
    if (!value.name || value.name === '') {
      dbIssues.missingName++;
    }

    // Check for Index entries
    if (value.name === 'Index' || value.name === 'index') {
      dbIssues.indexEntries++;
    }

    // Check type - Foundry v13 uses lowercase types
    const expectedType = packInfo.type === 'JournalEntry' ? 'journal' :
                        packInfo.type === 'RollTable' ? 'rolltable' :
                        packInfo.type === 'Actor' ? 'npc' :
                        packInfo.type === 'Macro' ? 'macro' :
                        packInfo.type.toLowerCase();

    // Special handling for various actor types
    const validActorTypes = ['npc', 'character', 'vehicle'];

    if (packInfo.type === 'Actor') {
      if (!validActorTypes.includes(value.type)) {
        dbIssues.wrongType++;
      }
    } else if (packInfo.type === 'Item') {
      // Items can have many subtypes
      const validItemTypes = ['feat', 'spell', 'weapon', 'equipment', 'consumable',
                              'tool', 'loot', 'background', 'class', 'subclass',
                              'feature', 'race'];
      if (!validItemTypes.includes(value.type)) {
        dbIssues.wrongType++;
      }
    } else if (value.type !== expectedType) {
      dbIssues.wrongType++;
    }

    // Check img
    if (value.img === null) {
      dbIssues.nullImg++;
    }

    // Check advancement IDs (for Items)
    if (value.system?.advancement) {
      for (const adv of value.system.advancement) {
        if (adv._id && !/^[a-zA-Z0-9]{16}$/.test(adv._id)) {
          dbIssues.invalidAdvancementId++;
        }
        if (adv.icon === null) {
          dbIssues.invalidIcon++;
        }
      }
    }
  }

  await db.close();

  // Report issues
  if (dbIssues.missingKey > 0) {
    result.issues.push(`❌ ${dbIssues.missingKey} documents missing _key field`);
  }
  if (dbIssues.missingName > 0) {
    result.issues.push(`❌ ${dbIssues.missingName} documents missing name`);
  }
  if (dbIssues.wrongType > 0) {
    result.issues.push(`❌ ${dbIssues.wrongType} documents with wrong type`);
  }
  if (dbIssues.invalidAdvancementId > 0) {
    result.issues.push(`❌ ${dbIssues.invalidAdvancementId} invalid advancement IDs`);
  }
  if (dbIssues.nullImg > 0) {
    result.issues.push(`❌ ${dbIssues.nullImg} documents with null img`);
  }
  if (dbIssues.invalidIcon > 0) {
    result.issues.push(`❌ ${dbIssues.invalidIcon} advancements with null icon`);
  }
  if (dbIssues.indexEntries > 0) {
    result.issues.push(`❌ ${dbIssues.indexEntries} Index entries found`);
  }

  // Check count expectations
  if (result.dbCount < packInfo.expectedMin) {
    result.issues.push(`⚠️  Only ${result.dbCount} entries (expected min ${packInfo.expectedMin})`);
  }

  // Check source/db mismatch
  if (result.sourceCount > 0 && result.sourceCount !== result.dbCount) {
    result.issues.push(`⚠️  Source/DB count mismatch: ${result.sourceCount} source files, ${result.dbCount} DB entries`);
  }

  return result;
}

async function checkIconPaths() {
  console.log('\n📸 CHECKING ICON PATHS...\n');

  const invalidIcons = new Set();

  for (const packInfo of PACKS) {
    const sourcePath = path.join(__dirname, '..', 'packs', packInfo.name, '_source');

    if (!fs.existsSync(sourcePath)) continue;

    const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(sourcePath, file), 'utf8'));

      // Check main img
      if (data.img && data.img.includes('undefined')) {
        invalidIcons.add(data.img);
      }

      // Check system.img
      if (data.system?.img && data.system.img.includes('undefined')) {
        invalidIcons.add(data.system.img);
      }
    }
  }

  if (invalidIcons.size > 0) {
    console.log('❌ Found invalid icon paths:');
    invalidIcons.forEach(icon => console.log(`   - ${icon}`));
    return false;
  } else {
    console.log('✅ All icon paths are valid');
    return true;
  }
}

async function validateJSON() {
  console.log('\n📋 VALIDATING JSON STRUCTURE...\n');

  let totalFiles = 0;
  let invalidFiles = 0;

  for (const packInfo of PACKS) {
    const sourcePath = path.join(__dirname, '..', 'packs', packInfo.name, '_source');

    if (!fs.existsSync(sourcePath)) continue;

    const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));

    for (const file of files) {
      totalFiles++;
      try {
        const content = fs.readFileSync(path.join(sourcePath, file), 'utf8');
        JSON.parse(content);
      } catch (e) {
        console.log(`❌ Invalid JSON in ${packInfo.name}/${file}: ${e.message}`);
        invalidFiles++;
      }
    }
  }

  console.log(`Checked ${totalFiles} JSON files`);
  if (invalidFiles > 0) {
    console.log(`❌ ${invalidFiles} invalid JSON files found`);
    return false;
  } else {
    console.log('✅ All JSON files are valid');
    return true;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('   BRANCALONIA MODULE FULL VALIDATION');
  console.log('='.repeat(60));
  console.log(`\nModule Version: ${JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'module.json'))).version}`);
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  // Validate JSON first
  const jsonValid = await validateJSON();

  // Check icon paths
  const iconsValid = await checkIconPaths();

  // Validate each pack
  console.log('\n📦 VALIDATING PACKS...\n');

  const results = [];
  let totalIssues = 0;

  for (const packInfo of PACKS) {
    const result = await validatePack(packInfo);
    results.push(result);
    totalIssues += result.issues.length;

    // Report pack status
    const status = result.issues.length === 0 ? '✅' : '❌';
    console.log(`${status} ${packInfo.name}: ${result.dbCount} entries`);

    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`   ${issue}`));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(60));

  let totalDocs = 0;
  let compiledPacks = 0;

  results.forEach(r => {
    totalDocs += r.dbCount;
    if (r.compiled) compiledPacks++;
  });

  console.log(`\n📊 STATISTICS:`);
  console.log(`   Total Packs: ${PACKS.length}`);
  console.log(`   Compiled Packs: ${compiledPacks}/${PACKS.length}`);
  console.log(`   Total Documents: ${totalDocs}`);
  console.log(`   JSON Validation: ${jsonValid ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Icon Validation: ${iconsValid ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Total Issues: ${totalIssues}`);

  if (totalIssues === 0 && jsonValid && iconsValid) {
    console.log('\n✅ ✅ ✅  ALL VALIDATION CHECKS PASSED  ✅ ✅ ✅\n');
    console.log('The module is ready for Foundry v13!');
  } else {
    console.log('\n❌ VALIDATION FAILED - ISSUES FOUND ❌\n');
    console.log('Please fix the issues listed above.');
  }
}

main().catch(console.error);