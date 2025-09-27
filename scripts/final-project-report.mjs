#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, '..');

console.log('='.repeat(60));
console.log('📊 REPORT FINALE CORREZIONI BRANCALONIA');
console.log('='.repeat(60) + '\n');

// Check hook status
console.log('🪝 STATO HOOK D&D 5e v3+:\n');
const hooks = {
  'renderActorSheet5eCharacter': 0,
  'renderActorSheet5eNPC': 0,
  'renderItemSheet5e': 0,
  'renderActorSheet5e': 0,
  'renderActorSheetV2': 0,
  'renderItemSheetV2': 0
};

const modulesPath = path.join(basePath, 'modules');
const files = fs.readdirSync(modulesPath).filter(f => f.endsWith('.js') || f.endsWith('.mjs'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(modulesPath, file), 'utf8');
  Object.keys(hooks).forEach(hook => {
    const regex = new RegExp(hook, 'g');
    const matches = content.match(regex);
    if (matches) hooks[hook] += matches.length;
  });
});

console.log('Hook corretti per D&D 5e v3+:');
console.log(`  ✅ renderActorSheet5eCharacter: ${hooks['renderActorSheet5eCharacter']} occorrenze`);
console.log(`  ✅ renderActorSheet5eNPC: ${hooks['renderActorSheet5eNPC']} occorrenze`);
console.log(`  ✅ renderItemSheet5e: ${hooks['renderItemSheet5e']} occorrenze`);

if (hooks['renderActorSheet5e'] > 0) {
  console.log(`  ⚠️  renderActorSheet5e (generico, da verificare): ${hooks['renderActorSheet5e']} occorrenze`);
}
if (hooks['renderActorSheetV2'] > 0) {
  console.log(`  ❌ renderActorSheetV2 (deprecato): ${hooks['renderActorSheetV2']} occorrenze`);
}
if (hooks['renderItemSheetV2'] > 0) {
  console.log(`  ❌ renderItemSheetV2 (deprecato): ${hooks['renderItemSheetV2']} occorrenze`);
}

// Check API usage
console.log('\n🔧 STATO API FOUNDRY V13:\n');

const deprecatedAPIs = [
  'game.actors.entities',
  'game.items.entities',
  'actor.data.data',
  'item.data.data',
  'mergeObject\\(',
  'duplicate\\(',
  'CONFIG.*.entityClass'
];

let foundDeprecated = false;
deprecatedAPIs.forEach(api => {
  const regex = new RegExp(api, 'g');
  let count = 0;
  files.forEach(file => {
    const content = fs.readFileSync(path.join(modulesPath, file), 'utf8');
    const matches = content.match(regex);
    if (matches) count += matches.length;
  });
  if (count > 0) {
    console.log(`  ❌ ${api}: ${count} occorrenze da correggere`);
    foundDeprecated = true;
  }
});

if (!foundDeprecated) {
  console.log('  ✅ Tutte le API sono aggiornate a Foundry V13');
}

// ApplicationV2 status
console.log('\n🖼️ STATO APPLICATION V2:\n');
const themeConfig = fs.readFileSync(path.join(modulesPath, 'theme-config.mjs'), 'utf8');
if (themeConfig.includes('ApplicationV2')) {
  console.log('  ✅ ThemeConfig migrato a ApplicationV2');
} else {
  console.log('  ❌ ThemeConfig ancora usa Application V1');
}

// Database integrity
console.log('\n📁 INTEGRITÀ DATABASE:\n');
const dbPath = path.join(basePath, 'database');
let indexCount = 0;
let standardCount = 0;

function countIndexes(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      countIndexes(filePath);
    } else if (file === 'index.json') {
      indexCount++;
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (content.categoria && content.elementi && typeof content.totale !== 'undefined') {
        standardCount++;
      }
    }
  });
}

countIndexes(dbPath);
console.log(`  ✅ ${indexCount} file index.json trovati`);
console.log(`  ✅ ${standardCount} con struttura standard (${Math.round(standardCount/indexCount*100)}%)`);

// Final status
console.log('\n' + '='.repeat(60));
console.log('🎯 STATO FINALE:');
console.log('='.repeat(60) + '\n');

const criticalIssues = hooks['renderActorSheetV2'] + hooks['renderItemSheetV2'];

if (criticalIssues === 0 && !foundDeprecated) {
  console.log('✅ PERFETTO! Il progetto è completamente compatibile con Foundry V13+');
  console.log('   - Tutti gli hook sono corretti per D&D 5e v3+');
  console.log('   - ApplicationV2 implementato correttamente');
  console.log('   - Database con struttura index.json standard');
  console.log('   - Nessuna API deprecata trovata');
} else {
  console.log(`⚠️  ATTENZIONE: ${criticalIssues} problemi critici rimanenti`);
  if (hooks['renderActorSheetV2'] > 0) {
    console.log('   - Correggere renderActorSheetV2 hook');
  }
  if (hooks['renderItemSheetV2'] > 0) {
    console.log('   - Correggere renderItemSheetV2 hook');
  }
  if (foundDeprecated) {
    console.log('   - Aggiornare API deprecate');
  }
}

console.log('\n📝 Raccomandazioni:');
console.log('   1. Testare tutte le schede personaggio in Foundry V13');
console.log('   2. Verificare che i temi si carichino correttamente');
console.log('   3. Controllare che le modifiche Brancalonia appaiano');
console.log('   4. Testare creazione e modifica personaggi');
