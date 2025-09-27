#!/usr/bin/env node

// Script di verifica configurazione tema completa
// Verifica che TUTTI i 32 colori siano esposti nel template

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Lista completa dei 32 colori dal Theme class
const REQUIRED_COLORS = [
  // Controls (6)
  'controlContent',
  'controlBorder',
  'controlFocusContent',
  'controlInactiveContent',
  'controlFill1',
  'controlFill2',

  // Control Highlight (4)
  'controlHighlightContent',
  'controlHighlightBorder',
  'controlHighlightFill1',
  'controlHighlightFill2',

  // Control Active (4)
  'controlActiveContent',
  'controlActiveBorder',
  'controlActiveFill1',
  'controlActiveFill2',

  // Applications Header (4)
  'appHeaderContent',
  'appHeaderFocusContent',
  'appHeaderFill1',
  'appHeaderFill2',

  // Applications Body (7)
  'appBodyContent',
  'appBodyContentSecondary',
  'appBodyPrimaryFill1',
  'appBodyPrimaryFill2',
  'appBorder',
  'appNameSectionContent',
  'appNameSectionShadow',

  // Misc (9)
  'miscBorder',
  'miscFill',
  'miscFillPrimary',
  'miscFillSecondary',
  'miscInactiveContent',
  'miscShadowHighlight',
  'miscLinkIdle',
  'miscLinkFocus',
  'miscReroll'
];

console.log('🔍 Verifica Sistema Tema Brancalonia v4.3.8');
console.log('=========================================\n');

// Leggi il template
const templatePath = path.join(__dirname, '..', 'templates', 'theme-config.hbs');
const templateContent = fs.readFileSync(templatePath, 'utf-8');

// Verifica ogni colore
let allPresent = true;
let foundCount = 0;

console.log('📋 Verifica presenza dei 32 colori nel template:\n');

REQUIRED_COLORS.forEach((color, index) => {
  const searchPattern = `name="theme.colors.${color}"`;
  const isPresent = templateContent.includes(searchPattern);

  if (isPresent) {
    console.log(`✅ ${(index + 1).toString().padStart(2, '0')}. ${color.padEnd(30)} - PRESENTE`);
    foundCount++;
  } else {
    console.log(`❌ ${(index + 1).toString().padStart(2, '0')}. ${color.padEnd(30)} - MANCANTE`);
    allPresent = false;
  }
});

console.log('\n=========================================');
console.log(`📊 Risultato: ${foundCount}/${REQUIRED_COLORS.length} colori configurabili`);

if (allPresent) {
  console.log('✅ SUCCESSO: Tutti i 32 colori sono configurabili!');
  console.log('🎨 Il sistema tema è COMPLETO e PROFESSIONALE.');
} else {
  console.log('⚠️  ATTENZIONE: Alcuni colori non sono configurabili.');
  console.log('    Verificare il template per completare l\'implementazione.');
}

// Verifica anche la versione nel module.json
const moduleJsonPath = path.join(__dirname, '..', 'module.json');
const moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));

console.log(`\n📦 Versione modulo: ${moduleJson.version}`);
console.log('🚀 Sistema tema Rinascimento Italiano attivo\n');

process.exit(allPresent ? 0 : 1);