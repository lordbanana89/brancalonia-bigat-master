/**
 * Script completo per compilare tutti i compendi
 * Compatibile con Foundry v13 e D&D 5e v5.1.9
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 BUILD COMPLETO COMPENDI BRANCALONIA v3.14.0\n');
console.log('=' .repeat(60));

// Lista compendi da compilare
const packs = [
  { name: 'backgrounds', type: 'Item' },
  { name: 'brancalonia-features', type: 'Item' },
  { name: 'classi', type: 'Item' },
  { name: 'emeriticenze', type: 'Item' },
  { name: 'equipaggiamento', type: 'Item' },
  { name: 'incantesimi', type: 'Item' },
  { name: 'macro', type: 'Macro' },
  { name: 'npc', type: 'Actor' },
  { name: 'razze', type: 'Item' },
  { name: 'regole', type: 'JournalEntry' },
  { name: 'rollable-tables', type: 'RollTable' },
  { name: 'sottoclassi', type: 'Item' },
  { name: 'talenti', type: 'Item' }
];

// Funzione per pulire vecchi database
function cleanOldDatabases() {
  console.log('🧹 Pulizia vecchi database...\n');

  for (const pack of packs) {
    // Rimuovi .db file (NeDB)
    const dbFile = path.join('./packs', `${pack.name}.db`);
    if (fs.existsSync(dbFile)) {
      fs.unlinkSync(dbFile);
      console.log(`   ❌ Rimosso ${pack.name}.db`);
    }

    // Rimuovi directory LevelDB
    const levelDbDir = path.join('./packs', pack.name);
    if (fs.existsSync(levelDbDir) && fs.lstatSync(levelDbDir).isDirectory()) {
      const hasSourceDir = fs.existsSync(path.join(levelDbDir, '_source'));
      if (!hasSourceDir) {
        // È una directory database, non source
        execSync(`rm -rf "${levelDbDir}"`, { stdio: 'inherit' });
        console.log(`   ❌ Rimossa directory ${pack.name}/`);
      }
    }
  }

  console.log();
}

// Funzione per compilare un singolo pack
function compilePack(pack) {
  const sourcePath = path.join('./packs', pack.name, '_source');

  if (!fs.existsSync(sourcePath)) {
    console.log(`   ⚠️  Nessuna directory _source per ${pack.name}`);
    return false;
  }

  const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    console.log(`   ⚠️  Nessun file JSON in ${pack.name}/_source`);
    return false;
  }

  try {
    // Usa LevelDB (classic-level) per tutti i pack
    const cmd = `fvtt package pack ${pack.name} ` +
                `--compendiumType ${pack.type} ` +
                `--inputDirectory "packs/${pack.name}/_source" ` +
                `--outputDirectory "packs"`;

    console.log(`   📦 Compilando ${pack.name} (${files.length} file)...`);
    execSync(cmd, { stdio: 'pipe' });
    console.log(`   ✅ ${pack.name} compilato con successo`);
    return true;
  } catch (error) {
    console.error(`   ❌ Errore compilando ${pack.name}: ${error.message}`);
    return false;
  }
}

// Funzione per verificare i database compilati
function verifyDatabases() {
  console.log('\n🔍 Verifica database compilati...\n');

  let allGood = true;

  for (const pack of packs) {
    const levelDbDir = path.join('./packs', pack.name);
    const hasLevelDb = fs.existsSync(path.join(levelDbDir, 'CURRENT'));

    if (hasLevelDb) {
      console.log(`   ✅ ${pack.name}: Database LevelDB presente`);
    } else {
      console.log(`   ❌ ${pack.name}: Database mancante`);
      allGood = false;
    }
  }

  return allGood;
}

// Esecuzione principale
async function main() {
  // 1. Pulisci vecchi database
  cleanOldDatabases();

  // 2. Compila tutti i pack
  console.log('📦 Compilazione compendi...\n');

  const stats = {
    success: 0,
    failed: 0,
    skipped: 0
  };

  for (const pack of packs) {
    const result = compilePack(pack);
    if (result === true) {
      stats.success++;
    } else if (result === false) {
      stats.failed++;
    } else {
      stats.skipped++;
    }
  }

  // 3. Verifica risultati
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RISULTATI COMPILAZIONE\n');
  console.log(`✅ Successo: ${stats.success}`);
  console.log(`❌ Falliti: ${stats.failed}`);
  console.log(`⏭️  Saltati: ${stats.skipped}`);

  // 4. Verifica finale
  const allGood = verifyDatabases();

  if (allGood) {
    console.log('\n✨ BUILD COMPLETATO CON SUCCESSO!');
    console.log('\n📝 Prossimi passi:');
    console.log('1. Testa il modulo in Foundry VTT');
    console.log('2. Verifica che tutti gli Active Effects funzionino');
    console.log('3. Commit e push delle modifiche');
  } else {
    console.log('\n⚠️  BUILD PARZIALMENTE COMPLETATO');
    console.log('Alcuni database non sono stati compilati correttamente.');
    console.log('Controlla gli errori sopra e riprova.');
  }
}

// Esegui
main().catch(error => {
  console.error('❌ Errore fatale:', error);
  process.exit(1);
});