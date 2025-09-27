#!/usr/bin/env node

/**
 * Script di standardizzazione ID per Brancalonia v3.12.0
 * Verifica e suggerisce correzioni per ID inconsistenti
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
  cyan: '\x1b[36m'
};

// Pattern per standardizzazione
const idPatterns = {
  // ID dovrebbe essere lowercase con underscore o senza spazi
  standard: /^[a-z0-9_]+$/,
  // Nome file dovrebbe essere kebab-case
  filename: /^[a-z0-9-]+\.json$/
};

/**
 * Analizza un pack per inconsistenze
 */
function analyzePack(packName) {
  const packPath = path.join(__dirname, 'packs', packName, '_source');

  if (!fs.existsSync(packPath)) {
    return null;
  }

  const issues = [];
  const files = fs.readdirSync(packPath).filter(f => f.endsWith('.json'));

  console.log(`\n${colors.blue}📦 Analizzando ${packName}...${colors.reset}`);

  for (const file of files) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(packPath, file), 'utf8'));
      const id = content._id;
      const name = content.name;

      // Controlla pattern ID
      if (!idPatterns.standard.test(id)) {
        console.log(`  ${colors.yellow}⚠ ID non standard: ${id}${colors.reset}`);
        console.log(`    File: ${file}`);
        console.log(`    Suggerito: ${id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
        issues.push({ file, id, type: 'id_format' });
      }

      // Controlla corrispondenza ID-filename
      const expectedFilename = id.replace(/_/g, '-').replace(/001$/, '') + '.json';
      const actualFilename = file.replace(/001/, '');

      if (expectedFilename !== actualFilename && !file.includes(id.replace(/_/g, '-'))) {
        console.log(`  ${colors.yellow}⚠ Filename non corrisponde all'ID${colors.reset}`);
        console.log(`    ID: ${id}`);
        console.log(`    File: ${file}`);
        console.log(`    Atteso: ${expectedFilename}`);
        issues.push({ file, id, type: 'filename_mismatch' });
      }

      // Controlla CamelCase vs lowercase
      if (id !== id.toLowerCase()) {
        console.log(`  ${colors.yellow}⚠ ID contiene maiuscole: ${id}${colors.reset}`);
        console.log(`    Suggerito: ${id.toLowerCase()}`);
        issues.push({ file, id, type: 'uppercase' });
      }

      // Controlla numerazione finale
      if (!id.endsWith('001') && packName !== 'regole') {
        console.log(`  ${colors.cyan}ℹ ID senza numerazione: ${id}${colors.reset}`);
        console.log(`    Considerare: ${id}001`);
      }

    } catch (e) {
      console.log(`  ${colors.red}❌ Errore leggendo ${file}: ${e.message}${colors.reset}`);
    }
  }

  return issues;
}

/**
 * Report generale
 */
function generateReport() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}    STANDARDIZZAZIONE ID BRANCALONIA v3.12.0${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════${colors.reset}\n`);

  const packs = [
    'equipaggiamento',
    'talenti',
    'incantesimi',
    'razze',
    'brancalonia-features',
    'backgrounds',
    'sottoclassi',
    'emeriticenze',
    'regole',
    'npc',
    'macro'
  ];

  let totalIssues = 0;
  const allIssues = {};

  for (const pack of packs) {
    const issues = analyzePack(pack);
    if (issues) {
      allIssues[pack] = issues;
      totalIssues += issues.length;
    }
  }

  // Report finale
  console.log(`\n${colors.blue}═══════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}                 REPORT FINALE${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════${colors.reset}\n`);

  if (totalIssues === 0) {
    console.log(`${colors.green}✅ Tutti gli ID sono standardizzati correttamente!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  Trovati ${totalIssues} problemi di standardizzazione${colors.reset}\n`);

    console.log(`${colors.cyan}Riepilogo per tipo:${colors.reset}`);
    let idFormatCount = 0;
    let filenameMismatchCount = 0;
    let uppercaseCount = 0;

    for (const [pack, issues] of Object.entries(allIssues)) {
      for (const issue of issues) {
        if (issue.type === 'id_format') idFormatCount++;
        if (issue.type === 'filename_mismatch') filenameMismatchCount++;
        if (issue.type === 'uppercase') uppercaseCount++;
      }
    }

    console.log(`  Format ID non standard: ${idFormatCount}`);
    console.log(`  Filename non corrispondenti: ${filenameMismatchCount}`);
    console.log(`  ID con maiuscole: ${uppercaseCount}`);

    console.log(`\n${colors.yellow}💡 Suggerimento: Crea uno script di fix automatico per correggere questi problemi${colors.reset}`);
  }
}

// Esegui analisi
generateReport();