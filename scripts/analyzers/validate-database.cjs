/**
 * Valida il database delle meccaniche contro l'implementazione attuale
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

// Carica il modulo Active Effects attuale
const jsContent = fs.readFileSync('./modules/brancalonia-active-effects-complete.js', 'utf-8');

// Estrai gli ID implementati
const implementedEffects = {};
const lines = jsContent.split('\n');
for (const line of lines) {
  const match = line.match(/^\s*'([^']+)':\s*\[/);
  if (match) {
    implementedEffects[match[1]] = true;
  }
}

// Funzione per validare una categoria
function validateCategory(category) {
  const dbPath = path.join('./database', category);
  if (!fs.existsSync(dbPath)) {
    console.log(`${colors.yellow}⚠️  Directory ${category} non trovata${colors.reset}`);
    return { total: 0, valid: 0, issues: [] };
  }

  const files = fs.readdirSync(dbPath).filter(f => f.endsWith('.json'));
  let total = 0;
  let valid = 0;
  const issues = [];

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dbPath, file), 'utf-8'));
    total++;

    // Controlla se è implementato
    const fileId = data.validazione?.file_id;
    const isImplemented = implementedEffects[fileId] || false;

    // Analizza meccaniche
    const activeMechanics = [];
    const narrativeMechanics = [];
    const advancementMechanics = [];

    for (const [key, mechanic] of Object.entries(data.meccaniche || {})) {
      if (mechanic.tipo === 'attivo') {
        activeMechanics.push(key);
      } else if (mechanic.tipo === 'narrativo') {
        narrativeMechanics.push(key);
      } else if (mechanic.tipo === 'advancement') {
        advancementMechanics.push(key);
      }
    }

    // Valida
    if (data.validazione?.implementato && !isImplemented) {
      issues.push({
        file: file,
        nome: data.nome,
        problema: `Marcato come implementato ma NON trovato nel modulo JS (${fileId})`,
        meccaniche_attive: activeMechanics
      });
    } else if (isImplemented && activeMechanics.length > 0) {
      valid++;
      console.log(`${colors.green}✅ ${data.nome}${colors.reset} - ${activeMechanics.length} meccaniche attive implementate`);
    } else if (activeMechanics.length === 0) {
      console.log(`${colors.blue}📘 ${data.nome}${colors.reset} - Solo meccaniche narrative/advancement`);
      valid++; // Conta come valido se non ha meccaniche attive
    }

    // Report dettagliato per debug
    if (activeMechanics.length > 0) {
      console.log(`   Meccaniche attive: ${colors.cyan}${activeMechanics.join(', ')}${colors.reset}`);
    }
  }

  return { total, valid, issues };
}

// Analizza il database corrente dei file JSON source
function analyzeCurrentImplementation() {
  const compendi = {
    'razze': 'razze',
    'talenti': 'talenti',
    'brancalonia-features': 'features',
    'backgrounds': 'backgrounds',
    'emeriticenze': 'emeriticenze',
    'equipaggiamento': 'equipaggiamento'
  };

  const stats = {};

  for (const [packName, label] of Object.entries(compendi)) {
    const sourcePath = path.join('./packs', packName, '_source');
    if (!fs.existsSync(sourcePath)) continue;

    const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));
    let implemented = 0;
    let total = files.length;

    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(sourcePath, file), 'utf-8'));
        if (implementedEffects[data._id]) {
          implemented++;
        }
      } catch (e) {
        // skip
      }
    }

    stats[label] = { total, implemented, percentage: ((implemented/total)*100).toFixed(1) };
  }

  return stats;
}

// Main
console.log('🔍 VALIDAZIONE DATABASE MECCANICHE BRANCALONIA\n');
console.log('=' .repeat(60));

// Valida categorie del database
const categories = ['razze', 'classi', 'talenti', 'backgrounds', 'emeriticenze', 'equipaggiamento'];
const results = {};

console.log('\n📂 VALIDAZIONE DATABASE DOCUMENTATO:\n');

for (const category of categories) {
  console.log(`\n${colors.yellow}━━━ ${category.toUpperCase()} ━━━${colors.reset}`);
  results[category] = validateCategory(category);
}

// Report issues
console.log('\n' + '=' .repeat(60));
console.log('\n❌ PROBLEMI TROVATI:\n');

let totalIssues = 0;
for (const [category, result] of Object.entries(results)) {
  if (result.issues.length > 0) {
    console.log(`\n${colors.red}${category.toUpperCase()}:${colors.reset}`);
    for (const issue of result.issues) {
      console.log(`  • ${issue.nome}: ${issue.problema}`);
      if (issue.meccaniche_attive.length > 0) {
        console.log(`    Meccaniche da implementare: ${issue.meccaniche_attive.join(', ')}`);
      }
      totalIssues++;
    }
  }
}

if (totalIssues === 0) {
  console.log(`${colors.green}✨ Nessun problema trovato! Tutte le meccaniche documentate sono correttamente implementate.${colors.reset}`);
}

// Confronto con implementazione attuale
console.log('\n' + '=' .repeat(60));
console.log('\n📊 CONFRONTO CON IMPLEMENTAZIONE ATTUALE:\n');

const currentStats = analyzeCurrentImplementation();
for (const [category, stats] of Object.entries(currentStats)) {
  console.log(`${category}: ${stats.implemented}/${stats.total} (${stats.percentage}%)`);
}

// Report finale
console.log('\n' + '=' .repeat(60));
console.log('\n📝 RIEPILOGO DATABASE:\n');

let totalDocumented = 0;
let totalValidated = 0;

for (const [category, result] of Object.entries(results)) {
  if (result.total > 0) {
    totalDocumented += result.total;
    totalValidated += result.valid;
    console.log(`${category}: ${result.valid}/${result.total} validati`);
  }
}

console.log(`\nTOTALE: ${totalValidated}/${totalDocumented} elementi validati`);
console.log(`\n💡 PROSSIMI PASSI:`);
console.log(`1. Completare estrazione meccaniche da manuali (classi, talenti, etc.)`);
console.log(`2. Documentare tutte le meccaniche mancanti`);
console.log(`3. Identificare discrepanze tra documentazione e implementazione`);
console.log(`4. Correggere implementazioni errate o mancanti`);