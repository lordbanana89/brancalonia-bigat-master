#!/usr/bin/env node

/**
 * Script di normalizzazione database Brancalonia per Foundry VTT v13
 * Versione corretta basata sulla struttura reale del database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { convertSpell } from './converters/spell-converter.mjs';
import {
  convertWeapon as convertWeaponItem,
  convertArmor as convertArmorItem,
  convertMagicItem
} from './converters/equipment-converter.mjs';
import { convertCreature } from './converters/creature-converter.mjs';
import {
  generateFoundryId,
  getDefaultImage,
  getCollection
} from './utils/common.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurazione - usa percorsi relativi
const CONFIG = {
  DATABASE_PATH: path.resolve(process.cwd(), 'database'),
  PACKS_PATH: path.resolve(process.cwd(), 'packs'),
  OUTPUT_PATH: path.resolve(process.cwd(), 'packs_normalized'),
  DRY_RUN: process.argv.includes('--dry-run'),
  VERBOSE: process.argv.includes('--verbose')
};

// Mappatura reale basata sulla struttura effettiva del database
const MAPPING_RULES = [
  // Skip generici
  { pattern: /index\.json$/, skip: true },
  { pattern: /dettagli\//, skip: true },
  { pattern: /validazione\//, skip: true },
  { pattern: /^classi\/[^\/]+\/progressione\//, skip: true },
  { pattern: /^macaronicon\//, skip: true },

  // Backgrounds
  { pattern: /^backgrounds\//, pack: 'backgrounds', type: 'background', converter: 'item' },

  // Razze e tratti
  { pattern: /^razze\/[^\/]+\/tratti\//, pack: 'brancalonia-features', type: 'feat', converter: 'racialTrait' },
  { pattern: /^razze\/[^\/]+\/(sottorazze|varianti)\//, pack: 'razze', type: 'race', converter: 'item' },
  { pattern: /^razze\/[^\/]+\.json$/, pack: 'razze', type: 'race', converter: 'item' },

  // Classi e privilegi
  { pattern: /^classi\/[^\/]+\/privilegi_generali\//, pack: 'brancalonia-features', type: 'feat', converter: 'classFeature' },
  { pattern: /^classi\/[^\/]+\/privilegi\//, pack: 'brancalonia-features', type: 'feat', converter: 'classFeature' },
  { pattern: /^classi\/[^\/]+\/cammini\//, pack: 'sottoclassi', type: 'subclass', converter: 'item' },
  { pattern: /^classi\/[^\/]+\.json$/, pack: 'classi', type: 'class', converter: 'item' },

  // Sottoclassi
  { pattern: /^sottoclassi\//, pack: 'sottoclassi', type: 'subclass', converter: 'item' },

  // Talenti ed Emeriticenze
  { pattern: /^talenti\//, pack: 'talenti', type: 'feat', converter: 'item' },
  { pattern: /^emeriticenze\//, pack: 'emeriticenze', type: 'feat', converter: 'item' },

  // Equipaggiamento
  { pattern: /^equipaggiamento\/armi\//, pack: 'equipaggiamento', type: 'weapon', converter: 'weapon' },
  { pattern: /^equipaggiamento\/armi_standard\//, pack: 'equipaggiamento', type: 'weapon', converter: 'weapon' },
  { pattern: /^equipaggiamento\/armature\//, pack: 'equipaggiamento', type: 'equipment', converter: 'armor' },
  { pattern: /^equipaggiamento\/armature_standard\//, pack: 'equipaggiamento', type: 'equipment', converter: 'armor' },
  { pattern: /^equipaggiamento\/cimeli\//, pack: 'equipaggiamento', type: 'equipment', converter: 'magicItem' },
  { pattern: /^equipaggiamento\/intrugli\//, pack: 'equipaggiamento', type: 'consumable', converter: 'consumable' },
  { pattern: /^equipaggiamento\/oggetti_comuni\//, pack: 'equipaggiamento', type: 'equipment', converter: 'equipment' },
  { pattern: /^equipaggiamento\/animali\//, pack: 'equipaggiamento', type: 'loot', converter: 'equipment' },

  // Incantesimi
  { pattern: /^incantesimi\/base\//, pack: 'incantesimi', type: 'spell', converter: 'spellReference' },
  { pattern: /^incantesimi\/livello_\d+\//, pack: 'incantesimi', type: 'spell', converter: 'spell' },

  // Creature e PNG
  { pattern: /^creature\/creature_base\//, pack: 'npc', type: 'npc', converter: 'creature' },
  { pattern: /^creature\/png_base\//, pack: 'npc', type: 'npc', converter: 'creature' },
  { pattern: /^creature\/creature_macaronicon\//, pack: 'npc', type: 'npc', converter: 'creature' },
  { pattern: /^creature\/png_macaronicon\//, pack: 'npc', type: 'npc', converter: 'creature' },

  // Regole
  { pattern: /^regole\//, pack: 'regole', type: 'journal', converter: 'journal' },

  // Tabelle
  { pattern: /^tabelle\//, pack: 'rollable-tables', type: 'table', converter: 'table' }
];

// Statistiche
const stats = {
  processed: 0,
  converted: 0,
  skipped: 0,
  errors: []
};

/**
 * Trova la regola di mappatura per un file
 */
function findMappingRule(relativePath) {
  for (const rule of MAPPING_RULES) {
    if (rule.pattern.test(relativePath)) {
      return rule;
    }
  }
  return null;
}

/**
 * Conversione base per item generico
 */
function convertBaseItem(data, filePath, itemType) {
  const id = generateFoundryId(filePath);
  const collection = getCollection(itemType);

  return {
    _id: id,
    _key: `!${collection}!${id}`,
    name: data.nome || data.name || 'Item Senza Nome',
    type: itemType,
    img: getDefaultImage(itemType),
    system: {
      description: {
        value: data.descrizione ? `<p>${data.descrizione}</p>` : '',
        chat: '',
        unidentified: ''
      },
      source: data.fonte?.manuale || 'Brancalonia',
      activation: { type: '', cost: null, condition: '' },
      duration: { value: '', units: '' },
      target: { value: null, width: null, units: '', type: '' },
      range: { value: null, long: null, units: '' },
      uses: { value: null, max: '', per: null, recovery: '' }
    },
    effects: [],
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {
      brancalonia: {
        id_originale: data.id,
        fonte: data.fonte,
        validazione: data.validazione,
        note: data.note || data.note_meccaniche || data.note_brancalonia
      }
    }
  };
}

/**
 * Processa un singolo file
 */
async function processFile(filePath, relativePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    stats.processed++;

    const rule = findMappingRule(relativePath);

    if (!rule) {
      if (CONFIG.VERBOSE) {
        console.log(`⚠️  Nessuna regola per: ${relativePath}`);
      }
      stats.skipped++;
      return;
    }

    if (rule.skip) {
      stats.skipped++;
      return;
    }

    let converted;

    // Applica il converter appropriato
    switch (rule.converter) {
      case 'creature':
        converted = convertCreature(data, filePath);
        break;
      case 'weapon':
        converted = convertWeaponItem(data, filePath);
        break;
      case 'armor':
        converted = convertArmorItem(data, filePath);
        break;
      case 'magicItem':
        converted = convertMagicItem(data, filePath);
        break;
      case 'spell':
        converted = convertSpell(data, filePath);
        break;
      case 'spellReference':
        // Skip spell references that puntano al compendio dnd5e
        stats.skipped++;
        return;
      default:
        converted = convertBaseItem(data, filePath, rule.type);
    }

    // Salva il file convertito
    const outputDir = path.join(CONFIG.OUTPUT_PATH, rule.pack, '_source');
    const outputFile = path.join(outputDir, path.basename(filePath));

    if (!CONFIG.DRY_RUN) {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(outputFile, JSON.stringify(converted, null, 2));
    }

    if (CONFIG.VERBOSE) {
      console.log(`✅ ${relativePath} → ${rule.pack}/_source/`);
    }

    stats.converted++;

  } catch (error) {
    console.error(`❌ Errore in ${relativePath}: ${error.message}`);
    stats.errors.push({ file: relativePath, error: error.message });
  }
}

/**
 * Processa directory ricorsivamente
 */
async function processDirectory(dirPath, baseDir = '') {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.join(baseDir, file).replace(/\\/g, '/');
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await processDirectory(fullPath, relativePath);
    } else if (file.endsWith('.json')) {
      await processFile(fullPath, relativePath);
    }
  }
}

/**
 * Main
 */
async function main() {
  console.log('🔧 Normalizzazione Database Brancalonia (Versione Corretta)');
  console.log('==========================================================\n');

  if (CONFIG.DRY_RUN) {
    console.log('⚠️  MODALITÀ DRY RUN - Nessun file verrà creato\n');
  }

  if (!fs.existsSync(CONFIG.DATABASE_PATH)) {
    console.error(`❌ Directory database non trovata: ${CONFIG.DATABASE_PATH}`);
    process.exit(1);
  }

  console.log(`📂 Database: ${CONFIG.DATABASE_PATH}`);
  console.log(`📦 Output: ${CONFIG.OUTPUT_PATH}\n`);

  // Processa il database
  await processDirectory(CONFIG.DATABASE_PATH);

  // Report
  console.log('\n📊 REPORT');
  console.log('=========');
  console.log(`📄 File processati: ${stats.processed}`);
  console.log(`✅ File convertiti: ${stats.converted}`);
  console.log(`⏭️  File saltati: ${stats.skipped}`);
  console.log(`❌ Errori: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ ERRORI:');
    stats.errors.slice(0, 10).forEach(err => {
      console.log(`  - ${err.file}: ${err.error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`  ... e altri ${stats.errors.length - 10} errori`);
    }
  }

  if (!CONFIG.DRY_RUN && stats.converted > 0) {
    console.log(`\n✅ Conversione completata!`);
    console.log(`📁 File salvati in: ${CONFIG.OUTPUT_PATH}`);
    console.log('\nProssimi passi:');
    console.log('1. Verifica i file convertiti');
    console.log('2. Copia in packs/ quando soddisfatto');
    console.log('3. Esegui build dei pack');
  }
}

// Help
if (process.argv.includes('--help')) {
  console.log(`
Utilizzo: node scripts/normalize-database-correct.mjs [opzioni]

Opzioni:
  --dry-run    Simula senza creare file
  --verbose    Output dettagliato
  --help       Mostra questo messaggio

Esempio:
  node scripts/normalize-database-correct.mjs --dry-run --verbose
  `);
  process.exit(0);
}

// Esegui
main().catch(console.error);
