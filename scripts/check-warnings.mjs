#!/usr/bin/env node
/**
 * Script per analizzare i warning della validazione
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizedPath = path.join(__dirname, '..', 'packs_normalized');

function validateItem(doc, filePath) {
  const warnings = [];
  const sys = doc.system || {};

  // Validazioni specifiche per tipo
  if (doc.type === 'weapon') {
    if (!sys.damage?.parts) {
      warnings.push(`Missing damage.parts for weapon`);
    }
    if (!sys.weaponType) {
      warnings.push(`Missing weaponType`);
    }
  }

  if (doc.type === 'equipment' || doc.type === 'armor') {
    if (!sys.armor && !sys.equipped) {
      warnings.push(`Missing armor or equipped field`);
    }
  }

  return warnings;
}

function processDirectory(dirPath) {
  const warnings = {};

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

          const warns = validateItem(doc, fullPath);
          if (warns.length > 0) {
            warns.forEach(w => {
              if (!warnings[w]) warnings[w] = [];
              warnings[w].push(path.relative(normalizedPath, fullPath));
            });
          }
        } catch (e) {}
      }
    }
  }

  scan(dirPath);
  return warnings;
}

// Main
const warnings = processDirectory(normalizedPath);

console.log('📊 Analisi Warning:\n');

Object.entries(warnings).forEach(([warning, files]) => {
  console.log(`\n⚠️  ${warning}: ${files.length} file`);
  console.log(`   Esempi: ${files.slice(0, 3).join(', ')}`);
});

const total = Object.values(warnings).reduce((sum, files) => sum + files.length, 0);
console.log(`\n📈 Totale: ${total} warning`);