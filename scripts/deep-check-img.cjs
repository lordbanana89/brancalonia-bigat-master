#!/usr/bin/env node

const { ClassicLevel } = require('classic-level');
const path = require('path');
const fs = require('fs');

async function deepCheckPack(packName) {
  const dbPath = path.join(__dirname, '..', 'packs', packName);

  if (!fs.existsSync(path.join(dbPath, 'CURRENT'))) {
    return null;
  }

  console.log(`\n📦 Checking ${packName}...`);

  const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
  await db.open();

  const issues = [];

  for await (const [key, value] of db.iterator()) {
    // Deep check for any null img
    function checkObject(obj, path = '') {
      if (obj === null || obj === undefined) return;

      for (const [k, v] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${k}` : k;

        if (k === 'img' && (v === null || v === undefined)) {
          issues.push({
            pack: packName,
            key: key,
            name: value.name || value._id || 'UNKNOWN',
            path: currentPath,
            value: v
          });
        }

        if (typeof v === 'object' && v !== null) {
          checkObject(v, currentPath);
        }
      }
    }

    checkObject(value);
  }

  await db.close();

  if (issues.length > 0) {
    console.log(`  ❌ Found ${issues.length} null img issues:`);
    issues.forEach(issue => {
      console.log(`     - ${issue.name} at ${issue.path} [${issue.key}]`);
    });
  } else {
    console.log(`  ✅ No issues found`);
  }

  return issues;
}

async function checkAll() {
  console.log("=== DEEP CHECKING ALL PACKS FOR NULL IMG ===\n");

  const packs = fs.readdirSync(path.join(__dirname, '..', 'packs'));
  const allIssues = [];

  for (const pack of packs) {
    const issues = await deepCheckPack(pack);
    if (issues) {
      allIssues.push(...issues);
    }
  }

  if (allIssues.length > 0) {
    console.log(`\n\n❌ TOTAL ISSUES FOUND: ${allIssues.length}`);
    console.log('\nGenerating fix script...');

    // Generate fix commands
    const fixCommands = [];
    allIssues.forEach(issue => {
      console.log(`\nIssue in ${issue.pack}:`);
      console.log(`  Document: ${issue.name}`);
      console.log(`  Path: ${issue.path}`);
      console.log(`  Key: ${issue.key}`);
    });
  } else {
    console.log(`\n\n✅ NO ISSUES FOUND IN ANY PACK!`);
  }
}

checkAll().catch(console.error);