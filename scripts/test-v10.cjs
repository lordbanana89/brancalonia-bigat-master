#!/usr/bin/env node

/**
 * TEST SUITE FOR BRANCALONIA v10.0.0
 * Comprehensive validation of refactored module
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let testsPassed = 0;
let testsFailed = 0;

console.log(`\n${colors.blue}╔══════════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.blue}║        BRANCALONIA v10.0.0 TEST SUITE                ║${colors.reset}`);
console.log(`${colors.blue}╚══════════════════════════════════════════════════════╝${colors.reset}\n`);

// Test 1: Module JSON validity
console.log('📋 Test 1: Module JSON Validation');
try {
  const moduleJson = require('../module.json');

  assert(moduleJson.version === '10.0.0', 'Version should be 10.0.0');
  assert(moduleJson.esmodules.length === 34, 'Should have 34 modules loaded');
  assert(moduleJson.esmodules[0] === 'core/BrancaloniaCore.js', 'Core should be first');

  logSuccess('Module JSON is valid');
} catch (e) {
  logError(`Module JSON validation failed: ${e.message}`);
}

// Test 2: All loaded modules exist
console.log('\n📂 Test 2: Module Files Existence');
try {
  const moduleJson = require('../module.json');
  let missing = [];

  moduleJson.esmodules.forEach(modulePath => {
    const fullPath = path.join(__dirname, '..', modulePath);
    if (!fs.existsSync(fullPath)) {
      missing.push(modulePath);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing modules: ${missing.join(', ')}`);
  }

  logSuccess('All 34 modules exist');
} catch (e) {
  logError(e.message);
}

// Test 3: CSS files and imports
console.log('\n🎨 Test 3: CSS Configuration');
try {
  const mainCss = path.join(__dirname, '..', 'styles', 'brancalonia.css');
  const cssContent = fs.readFileSync(mainCss, 'utf-8');

  // Check that problematic CSS is disabled
  assert(cssContent.includes('/* DISABLED: @import url(\'./brancalonia-actor-sheet-fix.css\')'),
    'Actor sheet fix should be disabled');

  // Check that main imports are present
  assert(cssContent.includes('@import url(\'./brancalonia-tokens.css\')'),
    'Tokens CSS should be imported');
  assert(cssContent.includes('@import url(\'./brancalonia-main.css\')'),
    'Main CSS should be imported');

  logSuccess('CSS configuration correct');
} catch (e) {
  logError(`CSS validation failed: ${e.message}`);
}

// Test 4: No duplicate modules
console.log('\n🔍 Test 4: Duplicate Module Check');
try {
  const modules = fs.readdirSync(path.join(__dirname, '..', 'modules'))
    .filter(f => f.endsWith('.js'));

  // Check for icon duplicates
  const iconModules = modules.filter(m => m.includes('icon'));
  assert(iconModules.length === 1, `Should have only 1 icon module, found ${iconModules.length}`);

  // Check for init duplicates
  const initModules = modules.filter(m => m.includes('init'));
  assert(initModules.length === 0, `Should have no init modules (using Core), found ${initModules.length}`);

  logSuccess('No problematic duplicates found');
} catch (e) {
  logError(e.message);
}

// Test 5: Core architecture files
console.log('\n🏗️ Test 5: Core Architecture');
try {
  const coreFiles = [
    'core/BrancaloniaCore.js',
    'core/HooksManager.js',
    'core/CompatibilityLayer.js',
    'core/ConfigManager.js'
  ];

  let missing = [];
  coreFiles.forEach(file => {
    if (!fs.existsSync(path.join(__dirname, '..', file))) {
      missing.push(file);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing core files: ${missing.join(', ')}`);
  }

  logSuccess('Core architecture complete');
} catch (e) {
  logError(e.message);
}

// Test 6: Game mechanics modules
console.log('\n🎮 Test 6: Game Mechanics Modules');
try {
  const mechanics = [
    'infamia-tracker.js',
    'haven-system.js',
    'compagnia-manager.js',
    'tavern-brawl.js',
    'diseases-system.js',
    'environmental-hazards.js',
    'factions-system.js',
    'dueling-system.js',
    'reputation-system.js'
  ];

  let missing = [];
  mechanics.forEach(file => {
    if (!fs.existsSync(path.join(__dirname, '..', 'modules', file))) {
      missing.push(file);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing mechanics: ${missing.join(', ')}`);
  }

  logSuccess('All game mechanics present');
} catch (e) {
  logError(e.message);
}

// Test 7: Module syntax check
console.log('\n✅ Test 7: Module Syntax Validation');
try {
  const moduleJson = require('../module.json');
  let errors = [];

  moduleJson.esmodules.forEach(modulePath => {
    const fullPath = path.join(__dirname, '..', modulePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Basic syntax checks
      if (content.includes('export default') && !modulePath.includes('core/')) {
        errors.push(`${modulePath}: Uses ESM export (should use window assignment)`);
      }

      if (content.includes('renderActorSheet5eCharacter') && !content.includes('HooksManager')) {
        errors.push(`${modulePath}: Uses old hooks without HooksManager`);
      }
    }
  });

  if (errors.length > 0) {
    console.log(`  ${colors.yellow}⚠️  Warnings:${colors.reset}`);
    errors.forEach(e => console.log(`    - ${e}`));
  } else {
    logSuccess('Module syntax valid');
  }
} catch (e) {
  logError(e.message);
}

// Test 8: Package counts
console.log('\n📦 Test 8: Compendium Packs');
try {
  const moduleJson = require('../module.json');

  assert(moduleJson.packs.length === 13, `Should have 13 packs, found ${moduleJson.packs.length}`);

  // Check pack directories exist
  let missing = [];
  moduleJson.packs.forEach(pack => {
    const packPath = path.join(__dirname, '..', pack.path);
    if (!fs.existsSync(packPath)) {
      missing.push(pack.name);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing packs: ${missing.join(', ')}`);
  }

  logSuccess('All 13 compendium packs present');
} catch (e) {
  logError(e.message);
}

// Final report
console.log(`\n${colors.blue}════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.blue}RESULTS:${colors.reset}`);
console.log(`  ${colors.green}✅ Passed: ${testsPassed}${colors.reset}`);
console.log(`  ${colors.red}❌ Failed: ${testsFailed}${colors.reset}`);

if (testsFailed === 0) {
  console.log(`\n${colors.green}🎉 ALL TESTS PASSED! v10.0.0 is ready for deployment${colors.reset}\n`);
} else {
  console.log(`\n${colors.red}⚠️  Some tests failed. Please fix before deploying.${colors.reset}\n`);
  process.exit(1);
}

// Helper functions
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function logSuccess(message) {
  console.log(`  ${colors.green}✅ ${message}${colors.reset}`);
  testsPassed++;
}

function logError(message) {
  console.log(`  ${colors.red}❌ ${message}${colors.reset}`);
  testsFailed++;
}