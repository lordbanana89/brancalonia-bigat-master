#!/usr/bin/env node

/**
 * Compila i pack JSON in formato LevelDB per Foundry VTT v13
 * Usa il formato corretto che Foundry si aspetta
 */

const fs = require('fs');
const path = require('path');

// Definisci i pack con i loro tipi corretti
const packDefinitions = {
  'backgrounds': 'Item',
  'brancalonia-features': 'Item',
  'emeriticenze': 'Item',
  'equipaggiamento': 'Item',
  'incantesimi': 'Item',
  'macro': 'Macro',
  'npc': 'Actor',
  'razze': 'Item',
  'regole': 'JournalEntry',
  'rollable-tables': 'RollTable',
  'sottoclassi': 'Item',
  'talenti': 'Item'
};

function ensureValidId(doc) {
  // Assicura che ogni documento abbia un _id valido
  if (!doc._id) {
    // Genera un ID casuale nel formato Foundry
    doc._id = randomID(16);
  }
  return doc;
}

function randomID(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function compilePack(packName, documentType) {
  const packDir = path.join(__dirname, 'packs', packName);

  // Controlla se esistono file JSON
  const jsonFiles = fs.readdirSync(packDir).filter(f => f.endsWith('.json') && f !== '_source.json');

  if (jsonFiles.length === 0) {
    console.log(`❌ Nessun file JSON trovato in ${packName}`);
    return false;
  }

  // Raccogli tutti i documenti
  const documents = [];

  for (const file of jsonFiles) {
    try {
      const content = fs.readFileSync(path.join(packDir, file), 'utf8');
      let doc = JSON.parse(content);

      // Assicura ID valido
      doc = ensureValidId(doc);

      // Aggiungi metadati se mancanti
      if (!doc.name && doc.name !== "") {
        console.warn(`⚠️  Documento senza nome in ${file}`);
      }

      // Aggiungi tipo se mancante
      if (!doc.type && documentType === 'Item') {
        // Cerca di determinare il tipo dal contenuto
        if (file.includes('talenti') || file.includes('feat')) doc.type = 'feat';
        else if (file.includes('spell') || file.includes('incantesimi')) doc.type = 'spell';
        else if (file.includes('equipment') || file.includes('equipaggiamento')) doc.type = 'equipment';
        else if (file.includes('race') || file.includes('razze')) doc.type = 'race';
        else if (file.includes('background')) doc.type = 'background';
        else if (file.includes('class') || file.includes('sottoclassi')) doc.type = 'subclass';
        else doc.type = 'feat'; // Default
      }

      documents.push(doc);
    } catch (err) {
      console.error(`❌ Errore leggendo ${file}: ${err.message}`);
    }
  }

  if (documents.length === 0) {
    console.log(`❌ Nessun documento valido in ${packName}`);
    return false;
  }

  // Crea il file _sources.json nel formato corretto per Foundry
  const sourcesPath = path.join(packDir, '_sources.json');

  // Formato: array di oggetti con percorso del file
  const sources = documents.map((doc, index) => {
    const filename = jsonFiles[index] || `doc_${index}.json`;
    return {
      _id: doc._id,
      path: filename
    };
  });

  fs.writeFileSync(sourcesPath, JSON.stringify(sources, null, 2));

  console.log(`✅ ${packName}: ${documents.length} documenti compilati`);
  return true;
}

// Main
console.log('🔨 Compilazione pack per Foundry VTT v13...\n');

let successCount = 0;
let failCount = 0;

for (const [packName, docType] of Object.entries(packDefinitions)) {
  if (compilePack(packName, docType)) {
    successCount++;
  } else {
    failCount++;
  }
}

console.log(`\n✅ Completato: ${successCount} pack compilati con successo`);
if (failCount > 0) {
  console.log(`⚠️  ${failCount} pack con problemi`);
}

console.log('\n📝 Note:');
console.log('- I file _sources.json sono stati creati');
console.log('- Foundry dovrebbe ora riconoscere i pack');
console.log('- Potrebbe essere necessario riavviare Foundry');