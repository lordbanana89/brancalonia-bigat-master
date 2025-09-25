#!/usr/bin/env node
/**
 * Script per validare i file normalizzati rispetto allo schema Foundry dnd5e
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizedPath = path.join(__dirname, '..', 'packs_normalized');

// Colori per output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

/**
 * Validazione base per documenti Foundry
 */
function validateDocument(doc, filePath) {
  const errors = [];
  const warnings = [];
  const relativePath = path.relative(normalizedPath, filePath);

  // Check campi obbligatori
  if (!doc._id) {
    errors.push(`Missing _id`);
  }

  if (!doc._key) {
    errors.push(`Missing _key`);
  }

  if (!doc.name) {
    errors.push(`Missing name`);
  }

  // Journal entries e tables non hanno type field
  const isJournal = doc._key && doc._key.includes('!journal!');
  const isTable = doc._key && doc._key.includes('!tables!');

  if (!doc.type && !isJournal && !isTable) {
    errors.push(`Missing type`);
  }

  // Validazione _key format
  if (doc._key && !doc._key.startsWith('!')) {
    errors.push(`Invalid _key format: ${doc._key}`);
  }

  // Validazione system (non richiesto per journal e tables)
  if (!doc.system && !isJournal && !isTable) {
    errors.push(`Missing system object`);
  }

  return { errors, warnings };
}

/**
 * Validazione specifica per spell
 */
function validateSpell(doc, filePath) {
  const { errors, warnings } = validateDocument(doc, filePath);

  if (doc.type !== 'spell') {
    errors.push(`Wrong type for spell: ${doc.type}`);
  }

  const sys = doc.system || {};

  // Check campi spell obbligatori
  if (sys.level === undefined) {
    errors.push(`Missing system.level`);
  }

  if (!sys.school) {
    warnings.push(`Missing system.school`);
  }

  if (!sys.components) {
    warnings.push(`Missing system.components`);
  }

  if (!sys.description?.value) {
    warnings.push(`Missing system.description.value`);
  }

  return { errors, warnings };
}

/**
 * Validazione specifica per creature
 */
function validateCreature(doc, filePath) {
  const { errors, warnings } = validateDocument(doc, filePath);

  if (doc.type !== 'npc') {
    errors.push(`Wrong type for creature: ${doc.type}`);
  }

  const sys = doc.system || {};

  // Check abilities
  if (!sys.abilities) {
    errors.push(`Missing system.abilities`);
  } else {
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    for (const ability of abilities) {
      if (!sys.abilities[ability]) {
        errors.push(`Missing ability: ${ability}`);
      }
    }
  }

  // Check attributes
  if (!sys.attributes?.hp) {
    errors.push(`Missing system.attributes.hp`);
  }

  if (!sys.attributes?.ac) {
    errors.push(`Missing system.attributes.ac`);
  }

  return { errors, warnings };
}

/**
 * Validazione specifica per item/equipment
 */
function validateItem(doc, filePath) {
  const { errors, warnings } = validateDocument(doc, filePath);

  // Journal e tables non hanno type
  const isJournal = doc._key && doc._key.includes('!journal!');
  const isTable = doc._key && doc._key.includes('!tables!');

  if (!isJournal && !isTable) {
    const validTypes = ['weapon', 'equipment', 'consumable', 'loot', 'feat', 'spell',
                        'class', 'subclass', 'background', 'race'];

    if (!validTypes.includes(doc.type)) {
      errors.push(`Invalid item type: ${doc.type}`);
    }
  }

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
    if (!sys.armor && sys.equipped === undefined) {
      warnings.push(`Missing armor or equipped field`);
    }
  }

  return { errors, warnings };
}

/**
 * Processa tutti i file in una directory
 */
function processDirectory(dirPath, stats) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath, stats);
    } else if (item.endsWith('.json')) {
      stats.total++;

      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const doc = JSON.parse(content);

        // Seleziona validator appropriato
        let validation;
        if (fullPath.includes('/incantesimi/')) {
          validation = validateSpell(doc, fullPath);
        } else if (fullPath.includes('/npc/')) {
          validation = validateCreature(doc, fullPath);
        } else {
          validation = validateItem(doc, fullPath);
        }

        // Raccogli errori e warnings
        if (validation.errors.length > 0) {
          stats.errors++;
          stats.errorDetails.push({
            file: path.relative(normalizedPath, fullPath),
            errors: validation.errors
          });
        }

        if (validation.warnings.length > 0) {
          stats.warnings++;
          stats.warningDetails.push({
            file: path.relative(normalizedPath, fullPath),
            warnings: validation.warnings
          });
        }

        if (validation.errors.length === 0 && validation.warnings.length === 0) {
          stats.valid++;
        }

      } catch (error) {
        stats.parseErrors++;
        stats.errorDetails.push({
          file: path.relative(normalizedPath, fullPath),
          errors: [`Parse error: ${error.message}`]
        });
      }
    }
  }
}

// Main
console.log(`${colors.bold}${colors.cyan}🔍 Validazione File Normalizzati${colors.reset}`);
console.log('='.repeat(60));

if (!fs.existsSync(normalizedPath)) {
  console.error(`${colors.red}❌ Directory non trovata: ${normalizedPath}${colors.reset}`);
  process.exit(1);
}

const stats = {
  total: 0,
  valid: 0,
  errors: 0,
  warnings: 0,
  parseErrors: 0,
  errorDetails: [],
  warningDetails: []
};

processDirectory(normalizedPath, stats);

// Report
console.log('\n' + '='.repeat(60));
console.log(`${colors.bold}📊 REPORT VALIDAZIONE${colors.reset}`);
console.log('='.repeat(60));

console.log(`\n📈 Statistiche:`);
console.log(`   File totali: ${stats.total}`);
console.log(`   ${colors.green}✅ Validi: ${stats.valid}${colors.reset}`);
console.log(`   ${colors.red}❌ Con errori: ${stats.errors}${colors.reset}`);
console.log(`   ${colors.yellow}⚠️  Con warning: ${stats.warnings}${colors.reset}`);
console.log(`   ${colors.red}💥 Parse errors: ${stats.parseErrors}${colors.reset}`);

// Mostra primi errori
if (stats.errorDetails.length > 0) {
  console.log(`\n${colors.red}❌ ERRORI (primi 10):${colors.reset}`);
  stats.errorDetails.slice(0, 10).forEach(detail => {
    console.log(`\n   ${colors.cyan}${detail.file}${colors.reset}`);
    detail.errors.forEach(err => {
      console.log(`      → ${err}`);
    });
  });

  if (stats.errorDetails.length > 10) {
    console.log(`\n   ... e altri ${stats.errorDetails.length - 10} file con errori`);
  }
}

// Mostra primi warning
if (stats.warningDetails.length > 0 && stats.warningDetails.length <= 5) {
  console.log(`\n${colors.yellow}⚠️  WARNING (primi 5):${colors.reset}`);
  stats.warningDetails.slice(0, 5).forEach(detail => {
    console.log(`\n   ${colors.cyan}${detail.file}${colors.reset}`);
    detail.warnings.forEach(warn => {
      console.log(`      → ${warn}`);
    });
  });

  if (stats.warningDetails.length > 5) {
    console.log(`\n   ... e altri ${stats.warningDetails.length - 5} file con warning`);
  }
}

// Risultato finale
console.log('\n' + '='.repeat(60));
if (stats.errors === 0 && stats.parseErrors === 0) {
  console.log(`${colors.green}✅ Validazione completata con successo!${colors.reset}`);
  if (stats.warnings > 0) {
    console.log(`${colors.yellow}   (${stats.warnings} warning non bloccanti)${colors.reset}`);
  }
} else {
  console.log(`${colors.red}❌ Validazione fallita: ${stats.errors + stats.parseErrors} errori trovati${colors.reset}`);
  process.exit(1);
}

console.log('='.repeat(60));