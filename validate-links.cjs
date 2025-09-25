#!/usr/bin/env node

/**
 * Script di validazione collegamenti per Brancalonia v3.12.0
 * Verifica che tutti gli UUID nelle regole puntino a oggetti esistenti
 * e che ci siano collegamenti bidirezionali corretti
 */

const fs = require('fs');
const path = require('path');

// Colori per output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Contatori per report finale
let totalLinks = 0;
let brokenLinks = 0;
let missingBacklinks = 0;
let warnings = 0;

/**
 * Estrae tutti gli UUID da un contenuto HTML
 */
function extractUUIDs(content) {
  const uuidPattern = /@UUID\[Compendium\.brancalonia-bigat\.(\w+)\.(\w+)\]/g;
  const uuids = [];
  let match;

  while ((match = uuidPattern.exec(content)) !== null) {
    uuids.push({
      full: match[0],
      pack: match[1],
      id: match[2]
    });
  }

  return uuids;
}

/**
 * Carica tutti gli oggetti da un pack
 */
function loadPack(packName) {
  const packPath = path.join(__dirname, 'packs', packName, '_source');
  const items = {};

  if (!fs.existsSync(packPath)) {
    console.log(`${colors.yellow}⚠ Pack ${packName} non trovato${colors.reset}`);
    return items;
  }

  const files = fs.readdirSync(packPath).filter(f => f.endsWith('.json'));

  for (const file of files) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(packPath, file), 'utf8'));
      items[content._id] = {
        name: content.name,
        type: content.type,
        file: file,
        relatedRules: content.flags?.['brancalonia-bigat']?.relatedRules || []
      };
    } catch (e) {
      console.log(`${colors.red}❌ Errore leggendo ${file}: ${e.message}${colors.reset}`);
    }
  }

  return items;
}

/**
 * Valida tutti i collegamenti nelle regole
 */
function validateRules() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}    VALIDAZIONE COLLEGAMENTI BRANCALONIA v3.12.0${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════${colors.reset}\n`);

  // Carica tutti i pack
  console.log(`${colors.magenta}📦 Caricamento compendi...${colors.reset}`);
  const packs = {
    equipaggiamento: loadPack('equipaggiamento'),
    talenti: loadPack('talenti'),
    incantesimi: loadPack('incantesimi'),
    razze: loadPack('razze'),
    'brancalonia-features': loadPack('brancalonia-features'),
    backgrounds: loadPack('backgrounds'),
    sottoclassi: loadPack('sottoclassi'),
    emeriticenze: loadPack('emeriticenze')
  };

  // Conta oggetti totali
  const totalItems = Object.values(packs).reduce((sum, pack) => sum + Object.keys(pack).length, 0);
  console.log(`${colors.green}✓ Caricati ${totalItems} oggetti dai compendi${colors.reset}\n`);

  // Valida regole
  console.log(`${colors.magenta}🔍 Validazione regole...${colors.reset}`);
  const rulesPath = path.join(__dirname, 'packs', 'regole', '_source');
  const ruleFiles = fs.readdirSync(rulesPath).filter(f => f.endsWith('.json'));

  for (const file of ruleFiles) {
    const content = JSON.parse(fs.readFileSync(path.join(rulesPath, file), 'utf8'));
    const ruleName = content.name;
    const ruleId = content._id;

    console.log(`\n${colors.blue}📜 ${ruleName}${colors.reset}`);

    // Cerca UUID nelle pagine
    if (content.pages) {
      for (const page of content.pages) {
        if (page.text?.content) {
          const uuids = extractUUIDs(page.text.content);
          totalLinks += uuids.length;

          for (const uuid of uuids) {
            const pack = packs[uuid.pack];

            if (!pack) {
              console.log(`  ${colors.red}❌ Pack inesistente: ${uuid.pack}${colors.reset}`);
              brokenLinks++;
              continue;
            }

            const item = pack[uuid.id];

            if (!item) {
              console.log(`  ${colors.red}❌ Oggetto mancante: ${uuid.id} in ${uuid.pack}${colors.reset}`);
              brokenLinks++;
            } else {
              console.log(`  ${colors.green}✓ ${item.name} (${uuid.id})${colors.reset}`);

              // Verifica backlink
              if (!item.relatedRules.includes(ruleId)) {
                console.log(`    ${colors.yellow}⚠ Manca backlink alla regola${colors.reset}`);
                missingBacklinks++;
              }
            }
          }
        }
      }
    }
  }

  // Report finale
  console.log(`\n${colors.blue}═══════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}                 REPORT FINALE${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.magenta}📊 Statistiche:${colors.reset}`);
  console.log(`   Collegamenti totali: ${totalLinks}`);
  console.log(`   Collegamenti funzionanti: ${colors.green}${totalLinks - brokenLinks}${colors.reset}`);
  console.log(`   Collegamenti rotti: ${brokenLinks > 0 ? colors.red : colors.green}${brokenLinks}${colors.reset}`);
  console.log(`   Backlink mancanti: ${missingBacklinks > 0 ? colors.yellow : colors.green}${missingBacklinks}${colors.reset}`);

  const successRate = totalLinks > 0 ? ((totalLinks - brokenLinks) / totalLinks * 100).toFixed(1) : 100;

  console.log(`\n${colors.magenta}📈 Tasso di successo: ${successRate >= 95 ? colors.green : colors.yellow}${successRate}%${colors.reset}`);

  if (brokenLinks === 0) {
    console.log(`\n${colors.green}✅ TUTTI I COLLEGAMENTI FUNZIONANO CORRETTAMENTE!${colors.reset}`);
  } else {
    console.log(`\n${colors.red}⚠️  CI SONO ${brokenLinks} COLLEGAMENTI DA CORREGGERE${colors.reset}`);
  }

  // Suggerimenti
  if (missingBacklinks > 0) {
    console.log(`\n${colors.yellow}💡 Suggerimento: Esegui 'node add-backlinks.js' per aggiungere i backlink mancanti${colors.reset}`);
  }
}

// Esegui validazione
validateRules();