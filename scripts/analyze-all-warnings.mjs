#!/usr/bin/env node
/**
 * Analisi dettagliata di tutti i warning
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizedPath = path.join(__dirname, '..', 'packs_normalized');

function validateSpell(doc, sys) {
  const warnings = [];
  if (!sys.school) warnings.push('Missing school');
  if (!sys.components) warnings.push('Missing components');
  if (!sys.description?.value) warnings.push('Missing description.value');
  return warnings;
}

function validateWeapon(doc, sys) {
  const warnings = [];
  if (!sys.damage?.parts || sys.damage.parts.length === 0) warnings.push('Missing damage.parts');
  if (!sys.weaponType) warnings.push('Missing weaponType');
  if (sys.damage?.versatile === undefined) warnings.push('Missing damage.versatile');
  return warnings;
}

function validateEquipment(doc, sys) {
  const warnings = [];
  if (!sys.armor && sys.equipped === undefined) warnings.push('Missing armor or equipped');
  if (!sys.rarity) warnings.push('Missing rarity');
  if (sys.weight === undefined || sys.weight === null) warnings.push('Missing weight');
  if (!sys.price) warnings.push('Missing price');
  return warnings;
}

function validateItem(doc, filePath) {
  const sys = doc.system || {};
  const warnings = [];

  // Skip journal and tables
  if (doc._key?.includes('!journal!') || doc._key?.includes('!tables!')) {
    return warnings;
  }

  if (doc.type === 'spell') {
    warnings.push(...validateSpell(doc, sys));
  } else if (doc.type === 'weapon') {
    warnings.push(...validateWeapon(doc, sys));
  } else if (doc.type === 'equipment' || doc.type === 'armor') {
    warnings.push(...validateEquipment(doc, sys));
  }

  return warnings;
}

// Main
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

        const warnings = validateItem(doc, fullPath);
        if (warnings.length > 0) {
          results.push({
            file: path.relative(normalizedPath, fullPath),
            name: doc.name,
            type: doc.type,
            warnings
          });
        }
      } catch (e) {}
    }
  }
}

scan(normalizedPath);

// Report
console.log('📊 TUTTI I 51 WARNING DETTAGLIATI\n');
console.log('='.repeat(60));

// Group by warning type
const byWarning = {};
results.forEach(r => {
  r.warnings.forEach(w => {
    if (!byWarning[w]) byWarning[w] = [];
    byWarning[w].push(r);
  });
});

Object.entries(byWarning)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([warning, items]) => {
    console.log(`\n${warning}: ${items.length} file`);
    items.slice(0, 3).forEach(item => {
      console.log(`  - ${item.name} (${item.type}) - ${path.basename(item.file)}`);
    });
    if (items.length > 3) {
      console.log(`  ... e altri ${items.length - 3}`);
    }
  });

console.log('\n' + '='.repeat(60));
console.log(`TOTALE: ${results.length} file con warning`);