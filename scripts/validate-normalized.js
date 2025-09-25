#!/usr/bin/env node

/**
 * Script di validazione file normalizzati
 * Verifica che i file in packs/_source rispettino lo schema dnd5e
 */

const fs = require('fs');
const path = require('path');

const PACKS_PATH = '/Users/erik/Desktop/brancalonia-bigat-master/packs';

// Schema validazione minimo
const REQUIRED_FIELDS = {
  actor: ['_id', '_key', 'name', 'type', 'system', 'items'],
  item: ['_id', '_key', 'name', 'type', 'system'],
  journal: ['_id', '_key', 'name', 'pages'],
  table: ['_id', '_key', 'name', 'formula', 'results']
};

// Tipi di documento validi
const VALID_TYPES = {
  actor: ['character', 'npc', 'vehicle', 'group'],
  item: ['weapon', 'equipment', 'consumable', 'tool', 'loot', 'background', 'class', 'subclass', 'spell', 'feat', 'race'],
  journal: ['journal'],
  table: ['table']
};

const stats = {
  validated: 0,
  valid: 0,
  invalid: 0,
  warnings: 0,
  errors: []
};

/**
 * Determina il tipo di collezione dal _key
 */
function getCollectionFromKey(key) {
  if (!key) return null;
  const match = key.match(/^!([^!]+)!/);
  return match ? match[1] : null;
}

/**
 * Valida un file normalizzato
 */
function validateFile(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const fileName = path.basename(filePath);
    const errors = [];
    const warnings = [];

    // Verifica _key
    if (!data._key) {
      errors.push('Manca _key');
    } else {
      const collection = getCollectionFromKey(data._key);
      if (!collection) {
        errors.push(`_key non valido: ${data._key}`);
      } else if (!data._key.includes(data._id)) {
        warnings.push(`_key non contiene _id: ${data._key}`);
      }
    }

    // Determina tipo documento
    const collection = getCollectionFromKey(data._key) || 'items';
    const docType = collection === 'actors' ? 'actor' :
                   collection === 'journal' ? 'journal' :
                   collection === 'tables' ? 'table' : 'item';

    // Verifica campi obbligatori
    const required = REQUIRED_FIELDS[docType] || [];
    required.forEach(field => {
      if (!(field in data)) {
        errors.push(`Campo obbligatorio mancante: ${field}`);
      }
    });

    // Verifica type valido
    if (data.type) {
      const validTypes = VALID_TYPES[docType] || [];
      if (!validTypes.includes(data.type)) {
        warnings.push(`Tipo documento insolito: ${data.type}`);
      }
    }

    // Verifica system
    if (docType !== 'journal' && docType !== 'table') {
      if (!data.system || typeof data.system !== 'object') {
        errors.push('Campo system mancante o non valido');
      }
    }

    // Verifica ownership
    if (!data.ownership || typeof data.ownership !== 'object') {
      warnings.push('Campo ownership mancante');
    }

    // Verifica items per actor
    if (docType === 'actor') {
      if (!Array.isArray(data.items)) {
        errors.push('Campo items non è un array');
      } else {
        // Valida ogni item
        data.items.forEach((item, index) => {
          if (!item._id) warnings.push(`Item ${index} senza _id`);
          if (!item._key) warnings.push(`Item ${index} senza _key`);
          if (!item.name) warnings.push(`Item ${index} senza name`);
          if (!item.type) warnings.push(`Item ${index} senza type`);
        });
      }
    }

    // Report
    if (errors.length > 0) {
      stats.invalid++;
      stats.errors.push({
        file: fileName,
        errors: errors,
        warnings: warnings
      });
      console.log(`❌ ${fileName}`);
      errors.forEach(e => console.log(`   ERROR: ${e}`));
      warnings.forEach(w => console.log(`   WARN: ${w}`));
    } else if (warnings.length > 0) {
      stats.valid++;
      stats.warnings += warnings.length;
      console.log(`⚠️  ${fileName}`);
      warnings.forEach(w => console.log(`   WARN: ${w}`));
    } else {
      stats.valid++;
      if (process.argv.includes('--verbose')) {
        console.log(`✅ ${fileName}`);
      }
    }

    stats.validated++;

  } catch (error) {
    stats.invalid++;
    stats.errors.push({
      file: path.basename(filePath),
      errors: [`Errore parsing JSON: ${error.message}`],
      warnings: []
    });
    console.log(`❌ ${path.basename(filePath)}: ${error.message}`);
  }
}

/**
 * Valida tutti i file in una directory _source
 */
function validateSourceDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⏭️  Directory non esiste: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    if (file.endsWith('.json')) {
      validateFile(path.join(dirPath, file));
    }
  });
}

/**
 * Main
 */
function main() {
  console.log('🔍 Validazione File Normalizzati');
  console.log('=================================\n');

  // Trova tutte le directory _source
  const packs = fs.readdirSync(PACKS_PATH);

  packs.forEach(pack => {
    const packPath = path.join(PACKS_PATH, pack);
    if (fs.statSync(packPath).isDirectory()) {
      const sourcePath = path.join(packPath, '_source');
      if (fs.existsSync(sourcePath)) {
        console.log(`\n📦 Validazione ${pack}/_source`);
        console.log('-'.repeat(40));
        validateSourceDirectory(sourcePath);
      }
    }
  });

  // Report finale
  console.log('\n\n📊 REPORT VALIDAZIONE');
  console.log('====================');
  console.log(`📄 File validati: ${stats.validated}`);
  console.log(`✅ File validi: ${stats.valid}`);
  console.log(`❌ File non validi: ${stats.invalid}`);
  console.log(`⚠️  Warning totali: ${stats.warnings}`);

  if (stats.invalid > 0) {
    console.log('\n❌ FILE CON ERRORI:');
    stats.errors.forEach(err => {
      if (err.errors.length > 0) {
        console.log(`\n  ${err.file}:`);
        err.errors.forEach(e => console.log(`    - ${e}`));
      }
    });

    console.log('\n⚠️  Correggere gli errori prima di procedere con il build!');
    process.exit(1);
  } else {
    console.log('\n✅ Tutti i file sono validi!');
    console.log('   Puoi procedere con: npm run build:packs');
  }
}

// Gestione argomenti
if (process.argv.includes('--help')) {
  console.log(`
Utilizzo: node scripts/validate-normalized.js [opzioni]

Opzioni:
  --verbose    Mostra anche i file validi
  --help       Mostra questo messaggio

Esempio:
  node scripts/validate-normalized.js --verbose
  `);
  process.exit(0);
}

// Esegui
main();