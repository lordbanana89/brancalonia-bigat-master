#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '..', 'modules');
const moduleJson = require('../module.json');

// Moduli attualmente caricati in module.json
const loadedModules = new Set(moduleJson.esmodules.map(m => path.basename(m)));

// Categorie di moduli
const categories = {
  'Core System': [],
  'Icon/Image Fixes': [],
  'Compatibility Layers': [],
  'Game Mechanics': [],
  'UI/Sheets': [],
  'Initialization': [],
  'Utilities': [],
  'Debug/Test': [],
  'Unknown': []
};

// Pattern per categorizzare
const patterns = {
  'Icon/Image Fixes': /icon|image/i,
  'Compatibility Layers': /compat|v13|deprecat|namespace|appv2|mixin/i,
  'Game Mechanics': /infamia|haven|compagnia|brawl|tavern|disease|hazard|menagramo|malefatte|reputation|faction|duel|rest|shoddy|bagordi|covo|rischi|favori/i,
  'UI/Sheets': /sheet|actor/i,
  'Initialization': /init|loader|safe/i,
  'Utilities': /cache|logger|monitor|slugify|tooltip|links|validator|api/i,
  'Debug/Test': /debug|test/i,
  'Core System': /brancalonia-(core|v13-modern|compatibility-fix|sheets|dice-theme|background-privileges)\.js$/i
};

// Analizza tutti i moduli
const allModules = fs.readdirSync(modulesDir)
  .filter(f => f.endsWith('.js'))
  .map(filename => {
    const filepath = path.join(modulesDir, filename);
    const stats = fs.statSync(filepath);
    const content = fs.readFileSync(filepath, 'utf-8');

    // Conta elementi implementati
    const hooksCount = (content.match(/Hooks\.(on|once|emit|call)/g) || []).length;
    const classCount = (content.match(/class\s+\w+/g) || []).length;
    const functionCount = (content.match(/function\s+\w+/g) || []).length;
    const exportsCount = (content.match(/export\s+(default|class|function|const)/g) || []).length;

    // Determina categoria
    let category = 'Unknown';
    for (const [cat, pattern] of Object.entries(patterns)) {
      if (pattern.test(filename)) {
        category = cat;
        break;
      }
    }

    return {
      filename,
      size: stats.size,
      lines: content.split('\n').length,
      isLoaded: loadedModules.has(filename),
      hooksCount,
      classCount,
      functionCount,
      exportsCount,
      category,
      hasImplementation: hooksCount > 0 || classCount > 0 || functionCount > 0
    };
  });

// Raggruppa per categoria
allModules.forEach(mod => {
  categories[mod.category].push(mod);
});

// Report
console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║           BRANCALONIA MODULE ANALYSIS REPORT                        ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

console.log(`📊 SUMMARY:`);
console.log(`   Total modules: ${allModules.length}`);
console.log(`   Currently loaded: ${loadedModules.size}`);
console.log(`   Not loaded: ${allModules.length - loadedModules.size}\n`);

// Per ogni categoria
Object.entries(categories).forEach(([cat, modules]) => {
  if (modules.length === 0) return;

  console.log(`\n📁 ${cat.toUpperCase()} (${modules.length} modules)`);
  console.log('─'.repeat(70));

  // Ordina per size
  modules.sort((a, b) => b.size - a.size);

  modules.forEach(mod => {
    const loaded = mod.isLoaded ? '✅' : '❌';
    const impl = mod.hasImplementation ? '🔧' : '📄';
    const size = `${(mod.size / 1024).toFixed(1)}kb`;
    const hooks = mod.hooksCount > 0 ? `H:${mod.hooksCount}` : '';
    const classes = mod.classCount > 0 ? `C:${mod.classCount}` : '';
    const funcs = mod.functionCount > 0 ? `F:${mod.functionCount}` : '';
    const stats = [hooks, classes, funcs].filter(Boolean).join(' ');

    console.log(`   ${loaded} ${impl} ${mod.filename.padEnd(40)} ${size.padStart(8)} ${mod.lines.toString().padStart(5)} lines  ${stats}`);
  });
});

// Trova duplicati potenziali
console.log('\n\n🔍 POTENTIAL DUPLICATES:');
console.log('─'.repeat(70));

// Raggruppa per pattern simile
const duplicateGroups = {};
allModules.forEach(mod => {
  const base = mod.filename.replace(/-\d+|-v\d+|-fix|-complete|-ultimate|-global|-auto|-modern|-safe|-minimal/g, '');
  if (!duplicateGroups[base]) duplicateGroups[base] = [];
  duplicateGroups[base].push(mod);
});

Object.entries(duplicateGroups)
  .filter(([_, mods]) => mods.length > 1)
  .forEach(([base, mods]) => {
    console.log(`\n   ${base}:`);
    mods.forEach(mod => {
      const loaded = mod.isLoaded ? '✅ LOADED' : '   not loaded';
      console.log(`      ${loaded} ${mod.filename} (${(mod.size/1024).toFixed(1)}kb, ${mod.lines} lines)`);
    });
  });

// Raccomandazioni
console.log('\n\n💡 RECOMMENDATIONS:');
console.log('─'.repeat(70));

const iconModules = categories['Icon/Image Fixes'];
if (iconModules.length > 1) {
  const largest = iconModules[0];
  console.log(`\n   ICONS: Keep only "${largest.filename}" (${(largest.size/1024).toFixed(1)}kb)`);
  console.log(`          Remove ${iconModules.length - 1} duplicates`);
}

const compatModules = categories['Compatibility Layers'];
const loadedCompat = compatModules.filter(m => m.isLoaded);
console.log(`\n   COMPATIBILITY: ${loadedCompat.length} loaded, ${compatModules.length - loadedCompat.length} not loaded`);

const initModules = categories['Initialization'];
if (initModules.length > 1) {
  console.log(`\n   INIT: Multiple initialization modules found - consolidate to 1`);
}

// Moduli non caricati ma con implementazione
const unloadedWithImpl = allModules.filter(m => !m.isLoaded && m.hasImplementation);
if (unloadedWithImpl.length > 0) {
  console.log(`\n   ⚠️  ${unloadedWithImpl.length} modules have implementation but are NOT loaded!`);
  unloadedWithImpl.slice(0, 5).forEach(m => {
    console.log(`      - ${m.filename} (${m.hooksCount} hooks, ${m.classCount} classes)`);
  });
}

// Export per ulteriore analisi
const report = {
  summary: {
    total: allModules.length,
    loaded: loadedModules.size,
    notLoaded: allModules.length - loadedModules.size
  },
  categories,
  duplicates: Object.entries(duplicateGroups).filter(([_, mods]) => mods.length > 1)
};

fs.writeFileSync(
  path.join(__dirname, 'module-analysis-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n\n✅ Full report saved to scripts/module-analysis-report.json');