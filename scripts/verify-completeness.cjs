#!/usr/bin/env node

/**
 * Script per verificare la completezza dei moduli Brancalonia
 * Controlla che non ci siano placeholder o mock
 */

const fs = require('fs');
const path = require('path');

const results = {
  complete: [],
  incomplete: [],
  warnings: [],
  stats: {
    total: 0,
    complete: 0,
    incomplete: 0,
    warnings: 0
  }
};

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║  BRANCALONIA v10.1.0 - VERIFICA COMPLETEZZA MODULI      ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// Directory dei moduli
const modulesDir = path.join(__dirname, '..', 'modules');
const coreDir = path.join(__dirname, '..', 'core');

// Pattern che indicano incompletezza
const incompletenessPatterns = [
  /TODO(?!:)/i,           // TODO senza : (non commento JSDoc)
  /FIXME/i,
  /PLACEHOLDER/i,
  /MOCK/i,
  /STUB/i,
  /not\s+implemented/i,
  /da\s+implementare/i,
  /throw\s+.*not\s+implemented/i,
  /console\.error.*not\s+implemented/i
];

// Pattern che indicano funzioni vuote sospette
const emptyFunctionPattern = /function\s+\w+\s*\([^)]*\)\s*{\s*}/;
const emptyMethodPattern = /\w+\s*\([^)]*\)\s*{\s*}/;

// Verifica un singolo file
function verifyFile(filePath) {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const issues = [];
  let hasImplementation = false;

  // Conta elementi implementati
  const classCount = (content.match(/class\s+\w+/g) || []).length;
  const functionCount = (content.match(/function\s+\w+/g) || []).length;
  const hooksCount = (content.match(/Hooks\.(on|once|emit|call)/g) || []).length;
  const exportsCount = (content.match(/export\s+(default|class|function|const)/g) || []).length;
  const windowExports = (content.match(/window\.\w+\s*=/g) || []).length;

  // Verifica se ha implementazione sostanziale
  hasImplementation = classCount > 0 || functionCount > 3 || hooksCount > 0 ||
                     exportsCount > 0 || windowExports > 0 || lines.length > 100;

  // Cerca pattern di incompletezza
  lines.forEach((line, index) => {
    incompletenessPatterns.forEach(pattern => {
      if (pattern.test(line)) {
        // Ignora se è in un commento
        const trimmed = line.trim();
        if (!trimmed.startsWith('//') && !trimmed.startsWith('*')) {
          issues.push({
            line: index + 1,
            type: 'incomplete',
            message: `Pattern trovato: ${pattern.source}`,
            content: line.trim().substring(0, 100)
          });
        }
      }
    });

    // Cerca funzioni vuote sospette (ma ignora costruttori e inizializzazioni)
    if (emptyFunctionPattern.test(line) && !line.includes('constructor')) {
      const functionName = line.match(/function\s+(\w+)/)?.[1];
      if (functionName && !['init', 'initialize', 'setup'].includes(functionName.toLowerCase())) {
        issues.push({
          line: index + 1,
          type: 'warning',
          message: 'Funzione vuota trovata',
          content: line.trim().substring(0, 100)
        });
      }
    }
  });

  // Verifica minima implementazione
  if (!hasImplementation && lines.length < 50) {
    issues.push({
      type: 'critical',
      message: 'File troppo piccolo e senza implementazione sostanziale'
    });
  }

  // Risultati
  const result = {
    file: fileName,
    path: filePath,
    lines: lines.length,
    classes: classCount,
    functions: functionCount,
    hooks: hooksCount,
    exports: exportsCount + windowExports,
    issues: issues,
    isComplete: issues.filter(i => i.type === 'incomplete' || i.type === 'critical').length === 0
  };

  return result;
}

// Verifica tutti i moduli
function verifyAllModules() {
  console.log('📁 Verifico moduli JavaScript...\n');

  // Moduli JS
  const jsFiles = fs.readdirSync(modulesDir)
    .filter(f => f.endsWith('.js'))
    .map(f => path.join(modulesDir, f));

  // Moduli MJS
  const mjsFiles = fs.readdirSync(modulesDir)
    .filter(f => f.endsWith('.mjs'))
    .map(f => path.join(modulesDir, f));

  // Core files
  const coreFiles = fs.readdirSync(coreDir)
    .filter(f => f.endsWith('.js'))
    .map(f => path.join(coreDir, f));

  const allFiles = [...jsFiles, ...mjsFiles, ...coreFiles];

  allFiles.forEach(filePath => {
    const result = verifyFile(filePath);
    results.stats.total++;

    if (result.isComplete) {
      results.complete.push(result);
      results.stats.complete++;
      console.log(`✅ ${result.file.padEnd(40)} [${result.lines} linee, ${result.classes} classi, ${result.functions} funzioni]`);
    } else {
      const criticalIssues = result.issues.filter(i => i.type === 'critical' || i.type === 'incomplete');
      const warnings = result.issues.filter(i => i.type === 'warning');

      if (criticalIssues.length > 0) {
        results.incomplete.push(result);
        results.stats.incomplete++;
        console.log(`❌ ${result.file.padEnd(40)} [${criticalIssues.length} problemi critici]`);
      } else if (warnings.length > 0) {
        results.warnings.push(result);
        results.stats.warnings++;
        console.log(`⚠️  ${result.file.padEnd(40)} [${warnings.length} warning]`);
      }
    }
  });
}

// Report dettagliato
function printDetailedReport() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                    REPORT DETTAGLIATO                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  if (results.incomplete.length > 0) {
    console.log('❌ MODULI INCOMPLETI O PLACEHOLDER:\n');
    results.incomplete.forEach(module => {
      console.log(`  ${module.file}:`);
      module.issues.filter(i => i.type === 'incomplete' || i.type === 'critical').forEach(issue => {
        console.log(`    - Linea ${issue.line || 'N/A'}: ${issue.message}`);
        if (issue.content) {
          console.log(`      > ${issue.content}`);
        }
      });
      console.log('');
    });
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  MODULI CON WARNING (probabilmente OK):\n');
    results.warnings.forEach(module => {
      console.log(`  ${module.file}: ${module.issues.length} warning`);
    });
    console.log('');
  }

  // Statistiche finali
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                      STATISTICHE                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`  Totale moduli:     ${results.stats.total}`);
  console.log(`  ✅ Completi:       ${results.stats.complete}`);
  console.log(`  ❌ Incompleti:     ${results.stats.incomplete}`);
  console.log(`  ⚠️  Con warning:    ${results.stats.warnings}`);
  console.log(`  📊 Completezza:    ${Math.round((results.stats.complete / results.stats.total) * 100)}%\n`);

  // Raccomandazioni
  if (results.stats.incomplete > 0) {
    console.log('⚠️  ATTENZIONE: Ci sono moduli incompleti o placeholder!');
    console.log('   Questi moduli devono essere completati prima del deploy.\n');
    return false;
  } else if (results.stats.warnings > 0) {
    console.log('✅ Tutti i moduli sembrano completi!');
    console.log('   Alcuni hanno warning minori che potrebbero essere ignorati.\n');
    return true;
  } else {
    console.log('🎉 PERFETTO! Tutti i moduli sono completi e pronti!\n');
    return true;
  }
}

// Esegui verifica
verifyAllModules();
const isReady = printDetailedReport();

// Exit code
process.exit(isReady ? 0 : 1);