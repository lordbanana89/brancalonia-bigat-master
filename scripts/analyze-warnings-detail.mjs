#!/usr/bin/env node
/**
 * Analisi dettagliata dei warning
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizedPath = path.join(__dirname, '..', 'packs_normalized');

function analyzeDocument(doc, filePath) {
  const warnings = [];
  const sys = doc.system || {};
  const relativePath = path.relative(normalizedPath, filePath);

  // Check per spell
  if (doc.type === 'spell') {
    if (!sys.school) warnings.push('Missing school');
    if (!sys.components) warnings.push('Missing components');
    if (!sys.description?.value) warnings.push('Missing description.value');
    if (!sys.source) warnings.push('Missing source');
    if (sys.level === undefined) warnings.push('Missing level');
    if (!sys.activation) warnings.push('Missing activation');
    if (!sys.duration) warnings.push('Missing duration');
    if (!sys.range) warnings.push('Missing range');
    if (!sys.target) warnings.push('Missing target');
  }

  // Check per weapon
  if (doc.type === 'weapon') {
    if (!sys.damage?.parts) warnings.push('Missing damage.parts');
    if (!sys.weaponType) warnings.push('Missing weaponType');
    if (!sys.proficient) warnings.push('Missing proficient');
    if (!sys.properties) warnings.push('Missing properties');
    if (!sys.actionType) warnings.push('Missing actionType');
    if (!sys.attackBonus) warnings.push('Missing attackBonus');
    if (!sys.damage?.versatile) warnings.push('Missing damage.versatile');
  }

  // Check per equipment/armor
  if (doc.type === 'equipment' || doc.type === 'armor') {
    if (!sys.armor && !sys.equipped) warnings.push('Missing armor or equipped');
    if (!sys.rarity) warnings.push('Missing rarity');
    if (!sys.weight) warnings.push('Missing weight');
    if (!sys.price) warnings.push('Missing price');
  }

  // Check per consumable
  if (doc.type === 'consumable') {
    if (!sys.consumableType) warnings.push('Missing consumableType');
    if (!sys.uses) warnings.push('Missing uses');
    if (!sys.weight) warnings.push('Missing weight');
  }

  // Check per feat
  if (doc.type === 'feat') {
    if (sys.type === undefined) warnings.push('Missing feat type');
    if (sys.requirements === undefined) warnings.push('Missing requirements');
    if (sys.recharge === undefined) warnings.push('Missing recharge');
  }

  // Check per background
  if (doc.type === 'background') {
    if (!sys.source) warnings.push('Missing source');
    if (!sys.advancement) warnings.push('Missing advancement');
  }

  return { path: relativePath, type: doc.type, warnings };
}

function processDirectory(dirPath) {
  const results = [];

  function scan(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (item.endsWith('.json')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const doc = JSON.parse(content);

          const analysis = analyzeDocument(doc, fullPath);
          if (analysis.warnings.length > 0) {
            results.push(analysis);
          }
        } catch (e) {}
      }
    }
  }

  scan(dirPath);
  return results;
}

// Main
const results = processDirectory(normalizedPath);

// Raggruppa per tipo di warning
const byWarning = {};
const byType = {};

results.forEach(r => {
  if (!byType[r.type]) byType[r.type] = [];
  byType[r.type].push(r);

  r.warnings.forEach(w => {
    if (!byWarning[w]) byWarning[w] = [];
    byWarning[w].push(r.path);
  });
});

console.log('📊 ANALISI WARNING DETTAGLIATA\n');
console.log('='.repeat(60));

console.log('\n📈 Per tipo di documento:');
Object.entries(byType).forEach(([type, items]) => {
  console.log(`\n${type}: ${items.length} file con warning`);

  // Conta warning più comuni per questo tipo
  const warningCounts = {};
  items.forEach(item => {
    item.warnings.forEach(w => {
      warningCounts[w] = (warningCounts[w] || 0) + 1;
    });
  });

  Object.entries(warningCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([warning, count]) => {
      console.log(`  - ${warning}: ${count}`);
    });
});

console.log('\n' + '='.repeat(60));
console.log('\n📋 Per tipo di warning:');
Object.entries(byWarning)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([warning, files]) => {
    console.log(`\n${warning}: ${files.length} file`);
    console.log(`  Esempi: ${files.slice(0, 2).map(f => path.basename(f)).join(', ')}`);
  });

console.log('\n' + '='.repeat(60));
console.log(`\n📊 TOTALE: ${results.length} file con ${Object.keys(byWarning).length} tipi di warning`);