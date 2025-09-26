#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function checkPackIds(packName) {
  console.log(`\n=== Checking ${packName} ===`);

  const dir = path.join(__dirname, '..', 'packs', packName, '_source');

  if (!fs.existsSync(dir)) {
    console.log('  Source directory not found');
    return;
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  let issues = [];
  let validIds = [];
  const idMap = new Map();

  files.forEach(file => {
    const content = JSON.parse(fs.readFileSync(path.join(dir, file)));

    if (!content._id) {
      issues.push({file: file, issue: 'MISSING _id'});
    } else if (content._id === 'undefined' || content._id.includes('undefined')) {
      issues.push({file: file, issue: `INVALID _id: ${content._id}`});
    } else {
      validIds.push(content._id);

      // Check for duplicates
      if (idMap.has(content._id)) {
        issues.push({
          file: file,
          issue: `DUPLICATE _id: ${content._id} (also in ${idMap.get(content._id)})`
        });
      } else {
        idMap.set(content._id, file);
      }
    }
  });

  console.log(`  Total files: ${files.length}`);
  console.log(`  Valid IDs: ${validIds.length}`);
  console.log(`  Issues: ${issues.length}`);

  if (issues.length > 0) {
    console.log('\n  Problems found:');
    issues.slice(0, 10).forEach(i => {
      console.log(`    - ${i.file}: ${i.issue}`);
    });
    if (issues.length > 10) {
      console.log(`    ... and ${issues.length - 10} more`);
    }
  }

  // Show sample IDs
  if (validIds.length > 0) {
    console.log('\n  Sample valid IDs:');
    validIds.slice(0, 5).forEach(id => console.log(`    - ${id}`));
  }

  return {
    total: files.length,
    valid: validIds.length,
    issues: issues.length
  };
}

// Check problematic packs
const packs = ['incantesimi', 'brancalonia-features'];

console.log('=== CHECKING PACK IDS ===');

const results = {};
packs.forEach(pack => {
  results[pack] = checkPackIds(pack);
});

console.log('\n=== SUMMARY ===');
packs.forEach(pack => {
  const r = results[pack];
  if (r) {
    const status = r.issues === 0 ? '✅' : '❌';
    console.log(`${status} ${pack}: ${r.valid}/${r.total} valid IDs`);
  }
});