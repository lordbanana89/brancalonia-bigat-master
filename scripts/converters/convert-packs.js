/**
 * Script per convertire i pack JSON in formato NeDB per Foundry VTT v13
 * I pack devono essere in formato database, non JSON singoli
 */

const fs = require('fs');
const path = require('path');

// Lista di tutti i pack da convertire
const packs = [
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

function convertPackToNeDB(packName) {
  const packPath = path.join(__dirname, 'packs', packName);

  // Verifica se la directory esiste
  if (!fs.existsSync(packPath)) {
    console.log(`Pack ${packName} non trovato, skip...`);
    return;
  }

  // Leggi tutti i file JSON nella directory
  const files = fs.readdirSync(packPath).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log(`Nessun file JSON trovato in ${packName}`);
    return;
  }

  // Crea un array per tutti i documenti
  const documents = [];

  for (const file of files) {
    const filePath = path.join(packPath, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const doc = JSON.parse(content);

      // Assicurati che il documento abbia un _id
      if (!doc._id) {
        doc._id = file.replace('.json', '');
      }

      documents.push(doc);
    } catch (err) {
      console.error(`Errore leggendo ${file}:`, err);
    }
  }

  // Scrivi il file database NeDB
  const dbPath = path.join(packPath, '_source.json');

  // Formato NeDB: ogni documento su una linea
  const nedbContent = documents.map(doc => JSON.stringify(doc)).join('\n');

  fs.writeFileSync(dbPath, nedbContent, 'utf8');
  console.log(`✅ Convertito ${packName}: ${documents.length} documenti`);
}

// Converti tutti i pack
console.log('Inizio conversione pack per Foundry VTT v13...\n');

for (const pack of packs) {
  convertPackToNeDB(pack);
}

console.log('\n✅ Conversione completata!');
console.log('\nNOTA: I pack sono ora in formato NeDB (_source.json)');
console.log('Potrebbe essere necessario ricompilare i pack in Foundry.');