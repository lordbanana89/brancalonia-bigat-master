#!/usr/bin/env node

const { ClassicLevel } = require('classic-level');
const path = require('path');
const fs = require('fs');

async function checkPack(packName) {
  const dbPath = path.join(__dirname, '..', 'packs', packName);

  if (!fs.existsSync(path.join(dbPath, 'CURRENT'))) {
    console.log(`Skipping ${packName} - not a compiled pack`);
    return;
  }

  console.log(`\nChecking ${packName}...`);

  const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
  await db.open();

  let issues = 0;

  for await (const [key, value] of db.iterator()) {
    // Check for null or missing img
    if (!value.img) {
      console.log(`  ❌ Missing img: ${value.name || value._id} [${key}]`);
      issues++;
    } else if (value.img === null) {
      console.log(`  ❌ NULL img: ${value.name || value._id} [${key}]`);
      issues++;
    }

    // Check system.img if exists
    if (value.system?.img === null) {
      console.log(`  ❌ NULL system.img: ${value.name || value._id} [${key}]`);
      issues++;
    }
  }

  await db.close();

  if (issues === 0) {
    console.log(`  ✅ No issues found`);
  } else {
    console.log(`  Total issues: ${issues}`);
  }

  return issues;
}

async function checkAll() {
  console.log("=== CHECKING COMPILED PACKS FOR IMG ISSUES ===\n");

  const packs = fs.readdirSync(path.join(__dirname, '..', 'packs'));
  let totalIssues = 0;

  for (const pack of packs) {
    const issues = await checkPack(pack);
    totalIssues += issues || 0;
  }

  console.log(`\n=== TOTAL ISSUES: ${totalIssues} ===`);
}

checkAll().catch(console.error);