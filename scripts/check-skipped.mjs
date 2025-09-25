#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databasePath = path.join(__dirname, '..', 'database');

// Mapping rules from normalize-database-final.mjs
const MAPPING_RULES = [
  { pattern: /^classi\/\w+\/info-classe-\w+\.json$/, skip: false },
  { pattern: /^classi\/\w+\/progressione\//, skip: false },
  { pattern: /^classi\/\w+\/privilegi_generali\//, skip: false },
  { pattern: /^classi\/\w+\/privilegi_sottoclasse\//, skip: false },
  { pattern: /^classi\/\w+\/index\.json$/, skip: true },

  { pattern: /^razze\/\w+\.json$/, skip: false },
  { pattern: /^razze\/index\.json$/, skip: true },

  { pattern: /^talenti\//, skip: false },
  { pattern: /^emeriticenze\//, skip: false },

  { pattern: /^equipaggiamento\/armi\//, skip: false },
  { pattern: /^equipaggiamento\/armi_standard\/(semplici|marziali)_(mischia|distanza)\//, skip: false },
  { pattern: /^equipaggiamento\/armature\//, skip: false },
  { pattern: /^equipaggiamento\/armature_standard\/(leggere|medie|pesanti|scudi)\//, skip: false },
  { pattern: /^equipaggiamento\/cimeli\//, skip: false },
  { pattern: /^equipaggiamento\/ciarpame_magico\.json$/, skip: true },
  { pattern: /^equipaggiamento\/intrugli\//, skip: false },
  { pattern: /^equipaggiamento\/provvista\//, skip: false },
  { pattern: /^equipaggiamento\/oggetti_comuni\/(abbigliamento|kit_e_strumenti|servizi_alloggio|speciali|veicoli)\//, skip: false },
  { pattern: /^equipaggiamento\/oggetti_contraffatti\//, skip: false },
  { pattern: /^equipaggiamento\/animali\//, skip: false },
  { pattern: /^equipaggiamento\/scadente\//, skip: false },
  { pattern: /^equipaggiamento\/\w+\.json$/, skip: true },

  { pattern: /^incantesimi\/base\//, skip: true },
  { pattern: /^incantesimi\/livello_\d+\//, skip: false },
  { pattern: /^incantesimi\/\w+\.json$/, skip: true },
  { pattern: /^incantesimi\/index\.json$/, skip: true },

  { pattern: /^creature\/creature_base\//, skip: false },
  { pattern: /^creature\/png_base\//, skip: false },
  { pattern: /^creature\/creature_macaronicon\//, skip: false },
  { pattern: /^creature\/png_macaronicon\/(creature_uniche|mostri_maggiori|mostri_minori|png_leggendari|png_maggiori|png_minori)\//, skip: false },

  { pattern: /^regole\//, skip: false },
  { pattern: /^tabelle\//, skip: false },
  { pattern: /^macaronicon\//, skip: true },
];

function findMappingRule(relativePath) {
  for (const rule of MAPPING_RULES) {
    if (rule.pattern.test(relativePath)) {
      return rule;
    }
  }
  return null;
}

function processDirectory(dirPath, relativePath = '') {
  const items = fs.readdirSync(dirPath);
  let stats = {
    total: 0,
    skipped: [],
    unmapped: []
  };

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const itemRelativePath = path.join(relativePath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const subStats = processDirectory(fullPath, itemRelativePath);
      stats.total += subStats.total;
      stats.skipped.push(...subStats.skipped);
      stats.unmapped.push(...subStats.unmapped);
    } else if (item.endsWith('.json')) {
      stats.total++;

      const rule = findMappingRule(itemRelativePath);

      if (!rule) {
        stats.unmapped.push(itemRelativePath);
      } else if (rule.skip) {
        stats.skipped.push(itemRelativePath);
      }
    }
  }

  return stats;
}

console.log('Analisi file saltati e non mappati:');
console.log('====================================\n');

const stats = processDirectory(databasePath);

console.log(`📊 Totale file JSON: ${stats.total}`);
console.log(`⏭️  File saltati (skip: true): ${stats.skipped.length}`);
console.log(`❓ File senza mappatura: ${stats.unmapped.length}`);
console.log(`✅ File da convertire: ${stats.total - stats.skipped.length - stats.unmapped.length}`);

if (stats.unmapped.length > 0) {
  console.log('\n❓ File senza mappatura (primi 20):');
  stats.unmapped.slice(0, 20).forEach(f => console.log(`   - ${f}`));
  if (stats.unmapped.length > 20) {
    console.log(`   ... e altri ${stats.unmapped.length - 20} file`);
  }
}

if (stats.skipped.length > 0) {
  console.log('\n⏭️  File saltati intenzionalmente (primi 20):');
  stats.skipped.slice(0, 20).forEach(f => console.log(`   - ${f}`));
  if (stats.skipped.length > 20) {
    console.log(`   ... e altri ${stats.skipped.length - 20} file`);
  }
}

console.log(`\n📈 Percentuale conversione prevista: ${Math.round((stats.total - stats.skipped.length - stats.unmapped.length) / stats.total * 100)}%`);