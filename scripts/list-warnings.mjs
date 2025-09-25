#!/usr/bin/env node
/**
 * Lista tutti i warning del validator
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizedPath = path.join(__dirname, '..', 'packs_normalized');

function validateSpell(doc, filePath) {
  const warnings = [];
  const sys = doc.system || {};

  if (!sys.school) warnings.push(`Missing system.school`);
  if (!sys.components) warnings.push(`Missing system.components`);
  if (!sys.description?.value) warnings.push(`Missing system.description.value`);

  return warnings;
}

function validateCreature(doc, filePath) {
  const warnings = [];
  return warnings;
}

function validateItem(doc, filePath) {
  const warnings = [];
  const sys = doc.system || {};

  // Validazioni specifiche per tipo
  if (doc.type === 'weapon') {
    if (!sys.damage?.parts) warnings.push(`Missing damage.parts for weapon`);
    if (!sys.weaponType) warnings.push(`Missing weaponType`);
  }

  if (doc.type === 'equipment' || doc.type === 'armor') {
    if (!sys.armor && !sys.equipped) warnings.push(`Missing armor or equipped field`);
  }

  return warnings;
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return [];

  const warnings = [];
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      warnings.push(...processDirectory(fullPath));
    } else if (item.endsWith('.json')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const doc = JSON.parse(content);

        let validation;
        if (fullPath.includes('/incantesimi/')) {
          validation = validateSpell(doc, fullPath);
        } else if (fullPath.includes('/npc/')) {
          validation = validateCreature(doc, fullPath);
        } else {
          validation = validateItem(doc, fullPath);
        }

        if (validation.length > 0) {
          warnings.push({
            file: path.relative(normalizedPath, fullPath),
            warnings: validation
          });
        }
      } catch (error) {}
    }
  }

  return warnings;
}

const allWarnings = processDirectory(normalizedPath);

console.log(`\nTotale file con warning: ${allWarnings.length}\n`);

// Mostra dettagli
allWarnings.forEach((w, i) => {
  if (i < 10) {  // Mostra solo i primi 10
    console.log(`${i+1}. ${w.file}`);
    w.warnings.forEach(warn => console.log(`   - ${warn}`));
  }
});

if (allWarnings.length > 10) {
  console.log(`\n... e altri ${allWarnings.length - 10} file`);
}