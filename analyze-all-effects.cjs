/**
 * Analisi completa di tutti i compendi per verificare presenza di Active Effects
 */

const fs = require('fs');
const path = require('path');

const PACKS_DIR = './packs';

// Analizza un singolo file JSON
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    return {
      id: data._id,
      name: data.name,
      type: data.type,
      hasEffects: data.effects && data.effects.length > 0,
      effectsCount: data.effects ? data.effects.length : 0,
      hasActiveChanges: data.effects && data.effects.some(e => e.changes && e.changes.length > 0),
      systemVersion: data._stats?.systemVersion || 'unknown'
    };
  } catch (e) {
    return null;
  }
}

// Analizza un compendio
function analyzeCompendium(packName) {
  const sourcePath = path.join(PACKS_DIR, packName, '_source');

  if (!fs.existsSync(sourcePath)) {
    return { packName, exists: false };
  }

  const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));
  const analysis = {
    packName,
    exists: true,
    totalFiles: files.length,
    withEffects: 0,
    withActiveChanges: 0,
    needsEffects: [],
    types: {}
  };

  for (const file of files) {
    const result = analyzeFile(path.join(sourcePath, file));
    if (result) {
      // Conta per tipo
      analysis.types[result.type] = (analysis.types[result.type] || 0) + 1;

      // Conta effetti
      if (result.hasEffects) analysis.withEffects++;
      if (result.hasActiveChanges) analysis.withActiveChanges++;

      // Identifica item che dovrebbero avere effetti
      if (shouldHaveEffects(result.type, result.name) && !result.hasActiveChanges) {
        analysis.needsEffects.push({
          file: file,
          name: result.name,
          type: result.type
        });
      }
    }
  }

  return analysis;
}

// Determina se un item dovrebbe avere effetti
function shouldHaveEffects(type, name) {
  // Item che dovrebbero avere effetti meccanici
  const effectTypes = ['feat', 'race', 'class', 'subclass', 'background', 'weapon', 'equipment', 'consumable'];

  if (!effectTypes.includes(type)) return false;

  // Esclude item puramente narrativi
  const narrativeKeywords = ['storia', 'descrizione', 'lore', 'flavor'];
  const hasNarrativeKeyword = narrativeKeywords.some(k => name.toLowerCase().includes(k));

  return !hasNarrativeKeyword;
}

// Report principale
console.log('🔍 ANALISI COMPLETA ACTIVE EFFECTS NEI COMPENDI\n');
console.log('=' .repeat(60));

const compendi = [
  'backgrounds',
  'brancalonia-features',
  'classi',
  'emeriticenze',
  'equipaggiamento',
  'incantesimi',
  'macro',
  'npc',
  'razze',
  'regole',
  'rollable-tables',
  'sottoclassi',
  'talenti'
];

const summary = {
  totalItems: 0,
  itemsWithEffects: 0,
  itemsWithActiveChanges: 0,
  itemsNeedingEffects: 0,
  byType: {}
};

for (const pack of compendi) {
  const result = analyzeCompendium(pack);

  if (!result.exists) {
    console.log(`❌ ${pack}: NON ESISTE`);
    continue;
  }

  const percentage = result.totalFiles > 0
    ? Math.round((result.withActiveChanges / result.totalFiles) * 100)
    : 0;

  const statusIcon = percentage === 100 ? '✅' :
                     percentage > 50 ? '⚠️' :
                     percentage > 0 ? '🔴' : '❌';

  console.log(`${statusIcon} ${pack}: ${result.withActiveChanges}/${result.totalFiles} con effetti attivi (${percentage}%)`);

  if (result.needsEffects.length > 0) {
    console.log(`   🔧 ${result.needsEffects.length} item necessitano effetti`);

    // Mostra primi 3 esempi
    const examples = result.needsEffects.slice(0, 3);
    for (const ex of examples) {
      console.log(`      - ${ex.name} (${ex.type})`);
    }
    if (result.needsEffects.length > 3) {
      console.log(`      ... e altri ${result.needsEffects.length - 3}`);
    }
  }

  // Aggiorna summary
  summary.totalItems += result.totalFiles;
  summary.itemsWithEffects += result.withEffects;
  summary.itemsWithActiveChanges += result.withActiveChanges;
  summary.itemsNeedingEffects += result.needsEffects.length;

  for (const [type, count] of Object.entries(result.types)) {
    summary.byType[type] = (summary.byType[type] || 0) + count;
  }
}

console.log('\n' + '=' .repeat(60));
console.log('📊 RIEPILOGO GENERALE\n');

console.log(`📦 Item totali: ${summary.totalItems}`);
console.log(`🎯 Con effects array: ${summary.itemsWithEffects} (${Math.round((summary.itemsWithEffects/summary.totalItems)*100)}%)`);
console.log(`⚡ Con changes attivi: ${summary.itemsWithActiveChanges} (${Math.round((summary.itemsWithActiveChanges/summary.totalItems)*100)}%)`);
console.log(`🔧 Necessitano fix: ${summary.itemsNeedingEffects} (${Math.round((summary.itemsNeedingEffects/summary.totalItems)*100)}%)`);

console.log('\n📈 Distribuzione per tipo:');
for (const [type, count] of Object.entries(summary.byType).sort((a,b) => b[1] - a[1])) {
  console.log(`   ${type}: ${count}`);
}

console.log('\n' + '=' .repeat(60));
console.log('⚠️  AZIONE RICHIESTA\n');

if (summary.itemsNeedingEffects > 0) {
  console.log(`È necessario aggiungere Active Effects a ${summary.itemsNeedingEffects} item.`);
  console.log('I compendi prioritari sono:');
  console.log('1. razze - bonus statistiche e tratti razziali');
  console.log('2. talenti - effetti meccanici dei talenti');
  console.log('3. brancalonia-features - privilegi di classe');
  console.log('4. backgrounds - competenze e bonus');
  console.log('5. equipaggiamento - bonus armi/armature');
}