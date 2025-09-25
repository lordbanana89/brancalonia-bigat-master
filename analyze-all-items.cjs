/**
 * Analizza TUTTI gli item per identificare Active Effects necessari
 */

const fs = require('fs');
const path = require('path');

const compendi = [
  'razze',
  'talenti',
  'brancalonia-features',
  'emeriticenze',
  'backgrounds',
  'equipaggiamento',
  'sottoclassi',
  'classi',
  'incantesimi'
];

const allItems = [];

for (const pack of compendi) {
  const sourcePath = path.join('./packs', pack, '_source');

  if (!fs.existsSync(sourcePath)) continue;

  const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(sourcePath, file), 'utf-8'));

      allItems.push({
        pack,
        id: data._id,
        name: data.name,
        type: data.type,
        description: data.system?.description?.value || ''
      });
    } catch (e) {
      console.error(`Errore leggendo ${file}: ${e.message}`);
    }
  }
}

// Analizza descrizioni per identificare bonus meccanici
console.log('📊 ANALISI COMPLETA ITEMS BRANCALONIA\n');
console.log('=' .repeat(60));

const needsEffects = {
  razze: [],
  talenti: [],
  features: [],
  emeriticenze: [],
  backgrounds: [],
  equipaggiamento: [],
  sottoclassi: []
};

// Parole chiave che indicano necessità di Active Effects
const keywords = [
  'aumenta di', 'aumentano di', 'bonus', 'vantaggio', 'svantaggio',
  'resistenza', 'immunità', 'immune', 'competenza', 'competenze',
  'velocità', 'CA', 'classe armatura', 'punti ferita', 'PF',
  'tiro salvezza', 'tiri salvezza', 'CD', 'attacco', 'danni',
  'iniziativa', 'percezione', 'furtività', 'movimento',
  'prova di', 'prove di', '+1', '+2', '+3', '+4', '+5',
  '-1', '-2', 'dimezza', 'raddoppia', 'x2', 'modificatore'
];

for (const item of allItems) {
  const desc = item.description.toLowerCase();
  let hasEffect = false;
  const foundKeywords = [];

  for (const keyword of keywords) {
    if (desc.includes(keyword)) {
      hasEffect = true;
      foundKeywords.push(keyword);
    }
  }

  if (hasEffect) {
    const packKey = item.pack === 'brancalonia-features' ? 'features' : item.pack;
    if (needsEffects[packKey]) {
      needsEffects[packKey].push({
        id: item.id,
        name: item.name,
        keywords: [...new Set(foundKeywords)].slice(0, 3)
      });
    }
  }
}

// Report dettagliato
for (const [pack, items] of Object.entries(needsEffects)) {
  if (items.length === 0) continue;

  console.log(`\n📦 ${pack.toUpperCase()} (${items.length} items con effects necessari)`);
  console.log('-'.repeat(60));

  for (const item of items) {
    console.log(`• ${item.id}: ${item.name}`);
    console.log(`  Keywords: ${item.keywords.join(', ')}`);
  }
}

// Statistiche finali
const total = Object.values(needsEffects).reduce((sum, items) => sum + items.length, 0);
console.log('\n' + '='.repeat(60));
console.log(`\n📊 TOTALE: ${total} items necessitano Active Effects`);
console.log(`📁 Su ${allItems.length} items totali analizzati`);
console.log(`📈 Percentuale: ${((total/allItems.length)*100).toFixed(1)}%\n`);