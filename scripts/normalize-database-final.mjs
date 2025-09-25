#!/usr/bin/env node

/**
 * Script di normalizzazione database Brancalonia per Foundry VTT v13
 * Versione finale con converter specializzati
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import converter specializzati
import { convertSpell } from './converters/spell-converter.mjs';
import { convertWeapon, convertArmor, convertMagicItem } from './converters/equipment-converter.mjs';
import convertCreature from './converters/creature-converter.mjs';
import convertBackground from './converters/background-converter.mjs';
import { generateFoundryId, getDefaultImage } from './utils/common.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurazione
const CONFIG = {
  DATABASE_PATH: path.resolve(process.cwd(), 'database'),
  OUTPUT_PATH: path.resolve(process.cwd(), 'packs_normalized'),
  DRY_RUN: process.argv.includes('--dry-run'),
  VERBOSE: process.argv.includes('--verbose'),
  QUIET: process.argv.includes('--quiet')
};

// Mappatura reale basata sulla struttura del database
const MAPPING_RULES = [
  // === BACKGROUNDS ===
  { pattern: /^backgrounds\/index\.json$/, skip: true }, // Skip index first
  { pattern: /^backgrounds\/[^\/]+\.json$/, pack: 'backgrounds', type: 'background', converter: 'background' },

  // === RAZZE ===
  { pattern: /^razze\/index\.json$/, skip: true }, // Skip index
  { pattern: /^razze\/[^\/]+\/tratti\//, pack: 'brancalonia-features', type: 'feat', converter: 'racialTrait' },
  { pattern: /^razze\/[^\/]+\/(sottorazze|varianti)\//, pack: 'razze', type: 'race', converter: 'item' },
  { pattern: /^razze\/[^\/]+\.json$/, pack: 'razze', type: 'race', converter: 'item' },
  { pattern: /^razze\/modificatori_culturali\//, pack: 'brancalonia-features', type: 'feat', converter: 'culturalModifier' },

  // === CLASSI ===
  { pattern: /^classi\/[^\/]+\/privilegi_generali\//, pack: 'brancalonia-features', type: 'feat', converter: 'classFeature' },
  { pattern: /^classi\/[^\/]+\/privilegi\/index\.json$/, skip: true }, // Skip index files
  { pattern: /^classi\/[^\/]+\/privilegi\//, pack: 'brancalonia-features', type: 'feat', converter: 'classFeature' },
  { pattern: /^classi\/[^\/]+\/cammini\//, pack: 'sottoclassi', type: 'subclass', converter: 'subclass' },
  { pattern: /^classi\/[^\/]+\/progressione\//, skip: true }, // Skip progressioni
  { pattern: /^classi\/dettagli\//, skip: true }, // Skip dettagli
  { pattern: /^classi\/[^\/]+\.json$/, pack: 'classi', type: 'class', converter: 'class' },

  // === SOTTOCLASSI ===
  { pattern: /^sottoclassi\//, pack: 'sottoclassi', type: 'subclass', converter: 'subclass' },

  // === TALENTI ED EMERITICENZE ===
  { pattern: /^talenti\/index\.json$/, skip: true },
  { pattern: /^talenti\//, pack: 'talenti', type: 'feat', converter: 'feat' },
  { pattern: /^emeriticenze\/index\.json$/, skip: true },
  { pattern: /^emeriticenze\//, pack: 'emeriticenze', type: 'feat', converter: 'feat' },

  // === EQUIPAGGIAMENTO ===
  // Armi
  { pattern: /^equipaggiamento\/armi\//, pack: 'equipaggiamento', type: 'weapon', converter: 'weapon' },
  { pattern: /^equipaggiamento\/armi_standard\/(semplici|marziali)_(mischia|distanza)\//, pack: 'equipaggiamento', type: 'weapon', converter: 'weapon' },

  // Armature
  { pattern: /^equipaggiamento\/armature\//, pack: 'equipaggiamento', type: 'equipment', converter: 'armor' },
  { pattern: /^equipaggiamento\/armature_standard\/(leggere|medie|pesanti|scudi)\//, pack: 'equipaggiamento', type: 'equipment', converter: 'armor' },

  // Oggetti magici
  { pattern: /^equipaggiamento\/cimeli\//, pack: 'equipaggiamento', type: 'equipment', converter: 'magicItem' },

  // Consumabili
  { pattern: /^equipaggiamento\/intrugli\//, pack: 'equipaggiamento', type: 'consumable', converter: 'consumable' },
  { pattern: /^equipaggiamento\/provvista\//, pack: 'equipaggiamento', type: 'consumable', converter: 'consumable' },

  // Oggetti comuni
  { pattern: /^equipaggiamento\/oggetti_comuni\/(abbigliamento|kit_e_strumenti|servizi_alloggio|speciali|veicoli)\//, pack: 'equipaggiamento', type: 'equipment', converter: 'equipment' },
  { pattern: /^equipaggiamento\/oggetti_contraffatti\/index\.json$/, skip: true },
  { pattern: /^equipaggiamento\/oggetti_contraffatti\//, pack: 'equipaggiamento', type: 'equipment', converter: 'equipment' },
  { pattern: /^equipaggiamento\/animali\//, pack: 'equipaggiamento', type: 'loot', converter: 'equipment' },
  { pattern: /^equipaggiamento\/scadente\//, pack: 'equipaggiamento', type: 'equipment', converter: 'equipment' },

  // File diretti in equipaggiamento (index files)
  { pattern: /^equipaggiamento\/index\.json$/, skip: true },
  { pattern: /^equipaggiamento\/intrugli\.json$/, skip: true },
  { pattern: /^equipaggiamento\/ciarpame_magico\.json$/, skip: true },

  // === INCANTESIMI ===
  { pattern: /^incantesimi\/base\//, skip: true }, // Riferimenti a dnd5e
  { pattern: /^incantesimi\/livello_\d+\/index\.json$/, skip: true }, // Skip index in spell levels
  { pattern: /^incantesimi\/livello_\d+\//, pack: 'incantesimi', type: 'spell', converter: 'spell' },
  { pattern: /^incantesimi\/\w+\.json$/, skip: true }, // File classe (mago.json, chierico.json, etc.)
  { pattern: /^incantesimi\/index\.json$/, skip: true }, // File indice

  // === CREATURE E PNG ===
  { pattern: /^creature\/creature_base\//, pack: 'npc', type: 'npc', converter: 'creature' },
  { pattern: /^creature\/png_base\//, pack: 'npc', type: 'npc', converter: 'creature' },
  { pattern: /^creature\/creature_macaronicon\//, pack: 'npc', type: 'npc', converter: 'creature' },
  { pattern: /^creature\/png_macaronicon\/(creature_uniche|mostri_maggiori|mostri_minori|png_leggendari|png_maggiori|png_minori)\//, pack: 'npc', type: 'npc', converter: 'creature' },

  // === REGOLE ===
  { pattern: /^regole\//, pack: 'regole', type: 'journal', converter: 'journal' },

  // === TABELLE ===
  { pattern: /^tabelle\//, pack: 'rollable-tables', type: 'table', converter: 'table' },

  // === MACARONICON (duplicati) ===
  { pattern: /^macaronicon\//, skip: true },

  // === SKIP FILES ===
  { pattern: /index\.json$/, skip: true },
  { pattern: /dettagli\//, skip: true },
  { pattern: /validazione\//, skip: true },
  { pattern: /\.md$/, skip: true },
  { pattern: /\.txt$/, skip: true },
  { pattern: /README/, skip: true }
];

// Statistiche
const stats = {
  processed: 0,
  converted: 0,
  skipped: 0,
  errors: [],
  warnings: [],
  missingMappings: new Set()
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

  // Aggiungi ai missing mappings per report
  stats.missingMappings.add(path.dirname(relativePath));
  return null;
}

/**
 * Converter base per item generico
 */
function convertBaseItem(data, filePath, itemType) {
  const id = generateFoundryId(filePath);
  const collection = getCollection(itemType);

  const item = {
    _id: id,
    _key: `!${collection}!${id}`,
    name: data.nome || data.name || 'Item',
    type: itemType,
    img: data.img || getDefaultImage(itemType),
    system: {
      description: {
        value: data.descrizione ? `<p>${data.descrizione}</p>` : '',
        chat: '',
        unidentified: ''
      },
      source: data.fonte?.manuale || data.fonte || 'Brancalonia',
      activation: { type: '', cost: null, condition: '' },
      duration: { value: '', units: '' },
      target: { value: null, width: null, units: '', type: '' },
      range: { value: null, long: null, units: '' },
      uses: { value: null, max: '', per: null, recovery: '' },
      // Campi comuni aggiuntivi
      equipped: false,
      identified: true,
      quantity: 1,
      weight: data.peso || 0,
      price: {
        value: data.prezzo || 0,
        denomination: 'gp'
      },
      rarity: data.rarita || 'common',
      attunement: data.sintonizzazione || 0
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
        note: data.note || data.note_meccaniche
      }
    }
  };

  // Campi specifici per equipment/armor
  if (itemType === 'equipment' || itemType === 'armor') {
    if (!item.system.armor) {
      item.system.armor = {
        value: data.classe_armatura || 10,
        type: data.tipo_armatura || 'light',
        dex: data.destrezza_max || null
      };
    }
    item.system.strength = data.forza_richiesta || 0;
    item.system.stealth = data.svantaggio_furtivita === true;
  }

  // Campi specifici per consumable
  if (itemType === 'consumable') {
    item.system.consumableType = data.tipo_consumabile || 'potion';
  }

  // Campi specifici per background
  if (itemType === 'background') {
    item.system.advancement = data.avanzamenti || [];
  }

  // Campi specifici per weapon
  if (itemType === 'weapon') {
    item.system.weaponType = data.tipo_arma || 'simpleM';
    item.system.damage = {
      parts: data.danno ? [[data.danno, data.tipo_danno || 'slashing']] : [],
      versatile: data.danno_versatile || ''
    };
    item.system.actionType = data.azione || 'mwak';
    item.system.attackBonus = data.bonus_attacco || '';
    item.system.proficient = true;
    item.system.properties = {};
  }

  return item;
}

/**
 * Converter per talenti/feat
 */
function convertFeat(data, filePath) {
  const item = convertBaseItem(data, filePath, 'feat');

  // Requisiti - sempre presente anche se vuoto
  item.system.requirements = data.prerequisiti || '';

  // Tipo di feat - sempre presente con default
  item.system.type = {
    value: data.tipo_talento || 'class',  // default: class feature
    subtype: data.sottotipo || ''
  };

  // Ricarica - sempre presente
  item.system.recharge = {
    value: data.ricarica || null,
    charged: false
  };

  // Usi limitati se specificati
  if (data.usi || data.uses) {
    item.system.uses = {
      value: data.usi?.valore || null,
      max: data.usi?.massimo || null,
      per: data.usi?.per || null,
      recovery: data.usi?.recupero || ''
    };
  }

  return item;
}

/**
 * Converter per classi
 */
function convertClass(data, filePath) {
  const item = convertBaseItem(data, filePath, 'class');

  // Dado vita
  item.system.hitDice = data.dado_vita || 'd8';
  item.system.hitDiceUsed = 0;

  // Competenze
  item.system.saves = data.tiri_salvezza || [];
  item.system.skills = {
    number: data.abilita?.numero || 2,
    choices: data.abilita?.scelte || [],
    value: []
  };

  // Equipaggiamento iniziale
  item.system.startingEquipment = data.equipaggiamento_iniziale || '';

  // Incantatore
  if (data.incantatore) {
    item.system.spellcasting = {
      progression: data.progressione_incantesimi || 'none',
      ability: data.caratteristica_incantesimi || ''
    };
  }

  return item;
}

/**
 * Converter per sottoclassi
 */
function convertSubclass(data, filePath) {
  const item = convertBaseItem(data, filePath, 'subclass');

  // Classe di riferimento
  item.system.classIdentifier = data.classe_riferimento || '';

  // Livello di acquisizione
  item.system.advancement = [{
    level: data.livello_acquisizione || 3,
    features: data.privilegi || []
  }];

  // Incantesimi bonus
  if (data.incantesimi_bonus) {
    item.system.spells = data.incantesimi_bonus;
  }

  return item;
}

/**
 * Converter per journal entries
 */
function convertJournal(data, filePath) {
  const id = generateFoundryId(filePath);

  return {
    _id: id,
    _key: `!journal!${id}`,
    name: data.titolo || data.nome || 'Regola',
    img: data.img || getDefaultImage('journal'),
    pages: [{
      _id: `${id}page1`,
      name: data.titolo || data.nome || 'Pagina',
      type: 'text',
      text: {
        format: 1, // HTML
        content: formatJournalContent(data)
      },
      title: { show: true, level: 1 },
      src: null,
      system: {},
      sort: 0,
      ownership: { default: 0 },
      flags: {}
    }],
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {
      brancalonia: {
        id_originale: data.id,
        categoria: data.categoria,
        fonte: data.fonte
      }
    }
  };
}

/**
 * Formatta il contenuto del journal
 */
function formatJournalContent(data) {
  let content = '';

  if (data.contenuto) {
    content = data.contenuto;
  } else if (data.descrizione) {
    content = `<p>${data.descrizione}</p>`;
  }

  // Aggiungi sezioni
  if (data.regole) {
    content += `<h2>Regole</h2>`;
    content += Array.isArray(data.regole) ?
      data.regole.map(r => `<p>${r}</p>`).join('') :
      `<p>${data.regole}</p>`;
  }

  if (data.esempi) {
    content += `<h2>Esempi</h2>`;
    content += Array.isArray(data.esempi) ?
      `<ul>${data.esempi.map(e => `<li>${e}</li>`).join('')}</ul>` :
      `<p>${data.esempi}</p>`;
  }

  return content;
}

/**
 * Converter per roll tables
 */
function convertTable(data, filePath) {
  const id = generateFoundryId(filePath);

  return {
    _id: id,
    _key: `!tables!${id}`,
    name: data.nome || 'Tabella',
    img: data.img || getDefaultImage('table'),
    description: data.descrizione || '',
    formula: data.formula || '1d100',
    replacement: true,
    displayRoll: true,
    results: mapTableResults(data.risultati || data.voci || []),
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {
      brancalonia: {
        id_originale: data.id,
        fonte: data.fonte
      }
    }
  };
}

/**
 * Mappa i risultati della tabella
 */
function mapTableResults(results) {
  if (!Array.isArray(results)) return [];

  return results.map((result, index) => ({
    _id: generateFoundryId(`result${index}`),
    type: 0, // Text result
    text: result.testo || result.descrizione || result,
    weight: result.peso || 1,
    range: result.range || [index + 1, index + 1],
    drawn: false,
    flags: {}
  }));
}

/**
 * Ottiene la collezione per un tipo
 */
function getCollection(type) {
  const map = {
    'npc': 'actors',
    'character': 'actors',
    'background': 'items',
    'class': 'items',
    'subclass': 'items',
    'race': 'items',
    'feat': 'items',
    'spell': 'items',
    'weapon': 'items',
    'equipment': 'items',
    'consumable': 'items',
    'loot': 'items',
    'tool': 'items',
    'journal': 'journal',
    'table': 'tables'
  };
  return map[type] || 'items';
}

/**
 * Processa un singolo file
 */
async function processFile(filePath, relativePath) {
  try {
    // Leggi il file
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    stats.processed++;

    // Trova la regola di mappatura
    const rule = findMappingRule(relativePath);

    if (!rule) {
      if (CONFIG.VERBOSE) {
        console.log(`⚠️  Nessuna mappatura: ${relativePath}`);
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
    try {
      switch (rule.converter) {
        case 'creature':
          converted = convertCreature(data, filePath);
          break;
        case 'spell':
          converted = convertSpell(data, filePath);
          break;
        case 'weapon':
          converted = convertWeapon(data, filePath);
          break;
        case 'armor':
          converted = convertArmor(data, filePath);
          break;
        case 'magicItem':
          converted = convertMagicItem(data, filePath);
          break;
        case 'feat':
        case 'racialTrait':
        case 'classFeature':
        case 'culturalModifier':
          converted = convertFeat(data, filePath);
          break;
        case 'class':
          converted = convertClass(data, filePath);
          break;
        case 'subclass':
          converted = convertSubclass(data, filePath);
          break;
        case 'journal':
          converted = convertJournal(data, filePath);
          break;
        case 'table':
          converted = convertTable(data, filePath);
          break;
        case 'background':
          converted = convertBackground(data, filePath);
          break;
        case 'consumable':
        case 'equipment':
        case 'item':
        default:
          converted = convertBaseItem(data, filePath, rule.type);

          // Warning per converter generico
          if (CONFIG.VERBOSE && data.meccaniche_brancalonia) {
            stats.warnings.push({
              file: relativePath,
              warning: 'Converter generico usato, possibili dati persi'
            });
          }
      }
    } catch (converterError) {
      console.error(`❌ Errore converter ${rule.converter}: ${converterError.message}`);
      stats.errors.push({ file: relativePath, error: converterError.message });
      return;
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

    if (CONFIG.VERBOSE && !CONFIG.QUIET) {
      console.log(`✅ ${relativePath} → ${rule.pack}/_source/`);
    }

    stats.converted++;

  } catch (error) {
    console.error(`❌ Errore in ${relativePath}: ${error.message}`);
    stats.errors.push({ file: relativePath, error: error.message });
  }
}

/**
 * Processa una directory ricorsivamente
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
 * Stampa il report finale
 */
function printReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 REPORT NORMALIZZAZIONE');
  console.log('='.repeat(60));

  console.log(`\n📈 Statistiche:`);
  console.log(`   File processati: ${stats.processed}`);
  console.log(`   ✅ Convertiti: ${stats.converted} (${Math.round(stats.converted / stats.processed * 100)}%)`);
  console.log(`   ⏭️  Saltati: ${stats.skipped}`);
  console.log(`   ❌ Errori: ${stats.errors.length}`);
  console.log(`   ⚠️  Warning: ${stats.warnings.length}`);

  // Report errori
  if (stats.errors.length > 0) {
    console.log(`\n❌ ERRORI (primi 10):`);
    stats.errors.slice(0, 10).forEach(err => {
      console.log(`   ${err.file}`);
      console.log(`      → ${err.error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`   ... e altri ${stats.errors.length - 10} errori`);
    }
  }

  // Report warning
  if (stats.warnings.length > 0 && CONFIG.VERBOSE) {
    console.log(`\n⚠️  WARNING (primi 5):`);
    stats.warnings.slice(0, 5).forEach(warn => {
      console.log(`   ${warn.file}: ${warn.warning}`);
    });
  }

  // Report mappature mancanti
  if (stats.missingMappings.size > 0) {
    console.log(`\n🔍 Directory senza mappatura:`);
    Array.from(stats.missingMappings).slice(0, 10).forEach(dir => {
      console.log(`   ${dir}/`);
    });
  }

  // Suggerimenti
  if (stats.converted > 0) {
    console.log(`\n✅ Conversione completata!`);
    console.log(`\n📁 File salvati in: ${CONFIG.OUTPUT_PATH}`);
    console.log(`\n📋 Prossimi passi:`);
    console.log(`   1. Verifica i file convertiti in ${CONFIG.OUTPUT_PATH}`);
    console.log(`   2. Esegui: node scripts/validate-normalized.mjs`);
    console.log(`   3. Se tutto ok, copia in packs/`);
    console.log(`   4. Esegui: fvtt package pack`);
  }
}

/**
 * Main
 */
async function main() {
  console.log('🔧 Normalizzazione Database Brancalonia - Versione Finale');
  console.log('=' .repeat(60));
  console.log(`📁 Database: ${CONFIG.DATABASE_PATH}`);
  console.log(`📦 Output: ${CONFIG.OUTPUT_PATH}`);

  if (CONFIG.DRY_RUN) {
    console.log('⚠️  MODALITÀ DRY RUN - Nessun file verrà creato');
  }

  console.log('');

  // Verifica esistenza database
  if (!fs.existsSync(CONFIG.DATABASE_PATH)) {
    console.error(`❌ Directory database non trovata: ${CONFIG.DATABASE_PATH}`);
    process.exit(1);
  }

  // Inizia il processamento
  const startTime = Date.now();

  if (!CONFIG.QUIET) {
    console.log('⏳ Elaborazione in corso...\n');
  }

  await processDirectory(CONFIG.DATABASE_PATH);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  // Stampa report
  printReport();

  console.log(`\n⏱️  Tempo impiegato: ${elapsed}s`);
  console.log('=' .repeat(60));
}

// Gestione argomenti
if (process.argv.includes('--help')) {
  console.log(`
Utilizzo: node scripts/normalize-database-final.mjs [opzioni]

Opzioni:
  --dry-run    Simula senza creare file
  --verbose    Output dettagliato
  --quiet      Minimizza output durante elaborazione
  --help       Mostra questo messaggio

Esempio:
  node scripts/normalize-database-final.mjs --dry-run --verbose
  node scripts/normalize-database-final.mjs --quiet
`);
  process.exit(0);
}

// Esegui
main().catch(error => {
  console.error('💥 Errore fatale:', error);
  process.exit(1);
});