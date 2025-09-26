#!/usr/bin/env node

const { ClassicLevel } = require('classic-level');
const path = require('path');
const fs = require('fs');

async function checkPack(packName, packPath) {
  try {
    const db = new ClassicLevel(packPath, { valueEncoding: 'json' });
    let issues = [];

    for await (const [key, value] of db.iterator()) {
      if (value.system) {
        // Check for startingEquipment issues
        if (value.system.startingEquipment) {
          for (let i = 0; i < value.system.startingEquipment.length; i++) {
            const eq = value.system.startingEquipment[i];
            if (eq.type === 'default' || !eq.type) {
              issues.push({
                pack: packName,
                id: value._id,
                name: value.name,
                issue: `startingEquipment[${i}].type = '${eq.type || 'undefined'}'`
              });
            }
          }
        }

        // Check for wealth issues
        if (value.system.wealth && typeof value.system.wealth === 'string') {
          if (value.system.wealth.includes('ma')) {
            issues.push({
              pack: packName,
              id: value._id,
              name: value.name,
              issue: `wealth contains 'ma': ${value.system.wealth}`
            });
          }
        }
      }
    }

    await db.close();
    return issues;
  } catch (e) {
    // Pack doesn't exist or can't be opened
    return [];
  }
}

async function main() {
  const packsDir = path.join(process.cwd(), 'packs');
  const packs = fs.readdirSync(packsDir).filter(d => {
    const stat = fs.statSync(path.join(packsDir, d));
    return stat.isDirectory() && fs.existsSync(path.join(packsDir, d, 'CURRENT'));
  });

  console.log('=== CHECKING ALL PACKS FOR VALIDATION ISSUES ===\n');

  let allIssues = [];

  for (const pack of packs) {
    const packPath = path.join(packsDir, pack);
    const issues = await checkPack(pack, packPath);
    if (issues.length > 0) {
      allIssues = allIssues.concat(issues);
    }
  }

  if (allIssues.length > 0) {
    console.log(`Found ${allIssues.length} validation issues:\n`);
    for (const issue of allIssues) {
      console.log(`[${issue.pack}] ${issue.name} (${issue.id}): ${issue.issue}`);
    }

    // Group by pack for fixing
    console.log('\nIssues by pack:');
    const byPack = {};
    for (const issue of allIssues) {
      if (!byPack[issue.pack]) byPack[issue.pack] = [];
      byPack[issue.pack].push(issue);
    }

    for (const [pack, issues] of Object.entries(byPack)) {
      console.log(`\n${pack}: ${issues.length} issues`);
      const uniqueItems = [...new Set(issues.map(i => i.id))];
      console.log(`  Affected items: ${uniqueItems.join(', ')}`);
    }
  } else {
    console.log('✅ No validation issues found in any pack!');
  }
}

main().catch(console.error);