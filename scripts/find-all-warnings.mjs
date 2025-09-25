#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizedPath = path.join(__dirname, '..', 'packs_normalized');

function validateDocument(doc) {
  const warnings = [];
  const sys = doc.system || {};

  // Skip journal and tables
  if (doc._key?.includes('!journal!') || doc._key?.includes('!tables!')) {
    return warnings;
  }

  // Check per tipo specifico
  if (doc.type === 'spell') {
    if (!sys.school) warnings.push('Missing school');
    if (!sys.components) warnings.push('Missing components');
    if (!sys.description?.value) warnings.push('Missing description.value');
  }

  if (doc.type === 'weapon') {
    if (!sys.damage?.parts || sys.damage.parts.length === 0) warnings.push('Missing damage.parts');
    if (!sys.weaponType) warnings.push('Missing weaponType');
    if (!sys.proficient) warnings.push('Missing proficient');
    if (!sys.properties) warnings.push('Missing properties');
    if (!sys.actionType) warnings.push('Missing actionType');
    if (sys.attackBonus === undefined || sys.attackBonus === '') warnings.push('Missing attackBonus');
    if (sys.damage?.versatile === undefined) warnings.push('Missing damage.versatile');
  }

  if (doc.type === 'equipment' || doc.type === 'armor') {
    if (!sys.armor && sys.equipped === undefined) warnings.push('Missing armor or equipped');
    if (!sys.rarity || sys.rarity === '') warnings.push('Missing rarity');
    if (sys.weight === undefined || sys.weight === null) warnings.push('Missing weight');
    if (!sys.price) warnings.push('Missing price');
  }

  if (doc.type === 'consumable') {
    if (!sys.consumableType) warnings.push('Missing consumableType');
    if (!sys.uses) warnings.push('Missing uses');
    if (sys.weight === undefined) warnings.push('Missing weight');
  }

  if (doc.type === 'feat') {
    if (!sys.type) warnings.push('Missing feat type');
    if (sys.requirements === undefined) warnings.push('Missing requirements');
    if (!sys.recharge) warnings.push('Missing recharge');
  }

  if (doc.type === 'background') {
    if (!sys.source) warnings.push('Missing source');
    if (!sys.advancement) warnings.push('Missing advancement');
  }

  return warnings;
}

// Main scan
const allWarnings = [];

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
        const warnings = validateDocument(doc);

        if (warnings.length > 0) {
          allWarnings.push({
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

console.log(`\nTOTALE: ${allWarnings.length} file con warning\n`);

// Mostra tutti i file
allWarnings.forEach((w, i) => {
  console.log(`${i+1}. ${w.name} (${w.type}) - ${path.basename(w.file)}`);
  w.warnings.forEach(warn => console.log(`   - ${warn}`));
});