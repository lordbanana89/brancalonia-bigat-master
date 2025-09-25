/**
 * Estrae TUTTE le meccaniche da ogni item per Active Effects
 */

const fs = require('fs');
const path = require('path');

// Funzione per estrarre meccaniche dal testo
function extractMechanics(text) {
  const mechanics = [];
  const lines = text.split(/[<>.\n]/);

  for (const line of lines) {
    const cleanLine = line.replace(/<[^>]*>/g, '').trim();

    // Bonus numerici
    if (cleanLine.match(/aumenta(no)? di \d+/i)) {
      mechanics.push({ type: 'bonus', text: cleanLine });
    }
    if (cleanLine.match(/\+\d+ (a|ai|alle|agli)/i)) {
      mechanics.push({ type: 'bonus', text: cleanLine });
    }
    if (cleanLine.match(/-\d+ (a|ai|alle|agli)/i)) {
      mechanics.push({ type: 'malus', text: cleanLine });
    }

    // Vantaggio/Svantaggio
    if (cleanLine.match(/vantaggio/i)) {
      mechanics.push({ type: 'advantage', text: cleanLine });
    }
    if (cleanLine.match(/svantaggio/i)) {
      mechanics.push({ type: 'disadvantage', text: cleanLine });
    }

    // Resistenze/Immunità
    if (cleanLine.match(/resistenza/i)) {
      mechanics.push({ type: 'resistance', text: cleanLine });
    }
    if (cleanLine.match(/immun[ei]/i)) {
      mechanics.push({ type: 'immunity', text: cleanLine });
    }

    // Competenze
    if (cleanLine.match(/competenz[ae]/i)) {
      mechanics.push({ type: 'proficiency', text: cleanLine });
    }

    // Velocità
    if (cleanLine.match(/velocità/i) && cleanLine.match(/\d+ metri/i)) {
      mechanics.push({ type: 'speed', text: cleanLine });
    }

    // CA
    if (cleanLine.match(/classe armatura|CA/i)) {
      mechanics.push({ type: 'ac', text: cleanLine });
    }

    // PF
    if (cleanLine.match(/punti ferita|PF/i)) {
      mechanics.push({ type: 'hp', text: cleanLine });
    }
  }

  return mechanics;
}

// Analizza tutti i file
const allMechanics = {};

const compendi = [
  'razze',
  'talenti',
  'brancalonia-features',
  'emeriticenze',
  'backgrounds',
  'equipaggiamento',
  'sottoclassi'
];

for (const pack of compendi) {
  const sourcePath = path.join('./packs', pack, '_source');

  if (!fs.existsSync(sourcePath)) continue;

  const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(sourcePath, file), 'utf-8'));
      const mechanics = extractMechanics(data.system?.description?.value || '');

      if (mechanics.length > 0) {
        if (!allMechanics[pack]) allMechanics[pack] = {};
        allMechanics[pack][data._id] = {
          name: data.name,
          mechanics: mechanics
        };
      }
    } catch (e) {
      // Skip errors
    }
  }
}

// Output strutturato per ogni compendio
console.log('// MAPPATURA COMPLETA ACTIVE EFFECTS BRANCALONIA\n');

for (const [pack, items] of Object.entries(allMechanics)) {
  console.log(`// ${'='.repeat(40)}`);
  console.log(`// ${pack.toUpperCase()}`);
  console.log(`// ${'='.repeat(40)}`);

  for (const [id, data] of Object.entries(items)) {
    console.log(`\n// ${data.name}`);
    console.log(`'${id}': [`);

    // Raggruppa per tipo
    const byType = {};
    for (const mech of data.mechanics) {
      if (!byType[mech.type]) byType[mech.type] = [];
      byType[mech.type].push(mech.text);
    }

    // Output per tipo
    for (const [type, texts] of Object.entries(byType)) {
      console.log(`  // ${type}:`);
      for (const text of [...new Set(texts)].slice(0, 2)) {
        console.log(`  // - ${text.substring(0, 80)}`);
      }
    }

    console.log(`  {`);
    console.log(`    label: '${data.name}',`);
    console.log(`    icon: 'icons/svg/aura.svg',`);
    console.log(`    changes: []`);
    console.log(`  }`);
    console.log(`],`);
  }
}

// Statistiche
let totalItems = 0;
for (const items of Object.values(allMechanics)) {
  totalItems += Object.keys(items).length;
}

console.log(`\n// TOTALE: ${totalItems} items con meccaniche da implementare`);