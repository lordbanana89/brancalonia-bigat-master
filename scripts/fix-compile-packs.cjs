#!/usr/bin/env node

/**
 * Script per ricompilare tutti i pack Brancalonia con struttura corretta
 * PROBLEMA: I database sono in sottocartelle (packs/nome/nome/) invece che in packs/nome/
 * SOLUZIONE: Ricompila direttamente in packs/nome/ con campo _key preservato
 */

const { ClassicLevel } = require('classic-level');
const fs = require('fs');
const path = require('path');

// Configurazione pack
const PACKS = [
  { name: 'backgrounds', type: 'items' },
  { name: 'brancalonia-features', type: 'items' },
  { name: 'classi', type: 'items' },
  { name: 'emeriticenze', type: 'items' },
  { name: 'equipaggiamento', type: 'items' },
  { name: 'incantesimi', type: 'items' },
  { name: 'macro', type: 'macros' },
  { name: 'npc', type: 'actors' },
  { name: 'razze', type: 'items' },
  { name: 'regole', type: 'journal' },
  { name: 'rollable-tables', type: 'tables' },
  { name: 'sottoclassi', type: 'items' },
  { name: 'talenti', type: 'items' }
];

async function cleanDirectory(dir) {
  // Rimuove database esistenti (sia in root che in sottocartella)
  const files = ['CURRENT', 'LOCK', 'LOG', 'MANIFEST-000002', 'MANIFEST-000003'];
  const patterns = ['*.ldb', '*.log'];

  // Pulisci root directory
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`  Rimosso: ${file}`);
    }
  }

  // Pulisci file con pattern
  if (fs.existsSync(dir)) {
    const dirFiles = fs.readdirSync(dir);
    for (const file of dirFiles) {
      if (file.endsWith('.ldb') || file.endsWith('.log')) {
        fs.unlinkSync(path.join(dir, file));
        console.log(`  Rimosso: ${file}`);
      }
    }
  }

  // Rimuovi sottocartella se esiste
  const subdir = path.join(dir, path.basename(dir));
  if (fs.existsSync(subdir)) {
    // Rimuovi ricorsivamente la sottocartella
    fs.rmSync(subdir, { recursive: true, force: true });
    console.log(`  Rimossa sottocartella: ${path.basename(dir)}/`);
  }
}

async function compilePack(packConfig) {
  const { name, type } = packConfig;
  console.log(`\n📦 Compilando pack: ${name} (${type})`);

  const sourcePath = path.join(__dirname, '..', 'packs', name, '_source');
  const dbPath = path.join(__dirname, '..', 'packs', name);

  // Verifica che esista la directory _source
  if (!fs.existsSync(sourcePath)) {
    console.log(`  ⚠️  Directory _source non trovata, skip`);
    return;
  }

  const sourceFiles = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));
  console.log(`  📄 Trovati ${sourceFiles.length} file JSON`);

  if (sourceFiles.length === 0) {
    console.log(`  ⚠️  Nessun file da compilare`);
    return;
  }

  // Pulisci database esistenti
  console.log(`  🧹 Pulizia database esistenti...`);
  await cleanDirectory(dbPath);

  // Crea nuovo database direttamente nella root del pack
  console.log(`  💾 Creazione database in: ${dbPath}`);
  const db = new ClassicLevel(dbPath, {
    valueEncoding: 'json',
    createIfMissing: true
  });

  try {
    await db.open();
    console.log(`  ✅ Database aperto`);

    let compiled = 0;
    let errors = 0;

    for (const file of sourceFiles) {
      try {
        const content = JSON.parse(
          fs.readFileSync(path.join(sourcePath, file), 'utf8')
        );

        // Verifica che ci sia _id
        if (!content._id) {
          console.log(`  ❌ File ${file} manca di _id, skip`);
          errors++;
          continue;
        }

        // Crea la chiave corretta basata sul tipo
        const key = `!${type}!${content._id}`;

        // IMPORTANTE: Aggiungi _key al documento
        content._key = key;

        // Salva nel database
        await db.put(key, content);
        compiled++;

      } catch (err) {
        console.log(`  ❌ Errore compilando ${file}: ${err.message}`);
        errors++;
      }
    }

    await db.close();
    console.log(`  ✅ Compilati ${compiled}/${sourceFiles.length} documenti`);
    if (errors > 0) {
      console.log(`  ⚠️  ${errors} errori durante la compilazione`);
    }

    // Verifica che il database sia stato creato correttamente
    const dbFiles = fs.readdirSync(dbPath).filter(f =>
      f.endsWith('.ldb') || f === 'CURRENT' || f === 'MANIFEST-000002'
    );

    if (dbFiles.length > 0) {
      console.log(`  ✅ Database creato con successo (${dbFiles.length} file)`);
    } else {
      console.log(`  ❌ ERRORE: Database non creato!`);
    }

  } catch (err) {
    console.log(`  ❌ ERRORE CRITICO: ${err.message}`);
    await db.close();
  }
}

async function verifyPack(packName) {
  const dbPath = path.join(__dirname, '..', 'packs', packName);

  console.log(`\n🔍 Verifica pack: ${packName}`);

  // Controlla che non ci sia sottocartella
  const subdir = path.join(dbPath, packName);
  if (fs.existsSync(subdir)) {
    console.log(`  ❌ ERRORE: Trovata sottocartella ${packName}/${packName}/`);
    return false;
  }

  // Controlla che ci siano file database
  if (!fs.existsSync(path.join(dbPath, 'CURRENT'))) {
    console.log(`  ❌ ERRORE: Database non trovato in ${packName}/`);
    return false;
  }

  // Apri e verifica contenuto
  const db = new ClassicLevel(dbPath, {
    valueEncoding: 'json',
    readOnly: true
  });

  try {
    await db.open();

    let count = 0;
    let hasKey = true;

    for await (const [key, value] of db.iterator({ limit: 5 })) {
      count++;
      if (!value._key) {
        hasKey = false;
        console.log(`  ⚠️  Documento senza _key: ${key}`);
      }
      if (count === 1) {
        console.log(`  📝 Primo documento: ${key} -> _id: ${value._id}, _key: ${value._key || 'MANCANTE'}`);
      }
    }

    await db.close();

    if (count > 0 && hasKey) {
      console.log(`  ✅ Pack valido con almeno ${count} documenti`);
      return true;
    } else if (count > 0) {
      console.log(`  ⚠️  Pack con documenti ma _key mancanti`);
      return false;
    } else {
      console.log(`  ❌ Pack vuoto!`);
      return false;
    }

  } catch (err) {
    console.log(`  ❌ Errore verifica: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 BRANCALONIA PACK COMPILER - FIX COMPENDI VUOTI');
  console.log('==================================================');
  console.log('Questo script risolve il problema dei database in sottocartelle');
  console.log('e garantisce che ogni documento abbia il campo _key necessario.');

  // Compila tutti i pack
  for (const pack of PACKS) {
    await compilePack(pack);
  }

  // Verifica tutti i pack
  console.log('\n\n📊 VERIFICA FINALE');
  console.log('==================');

  let valid = 0;
  let invalid = 0;

  for (const pack of PACKS) {
    const isValid = await verifyPack(pack.name);
    if (isValid) valid++;
    else invalid++;
  }

  console.log('\n\n✅ RISULTATI FINALI:');
  console.log(`  Pack validi: ${valid}/${PACKS.length}`);
  console.log(`  Pack con problemi: ${invalid}/${PACKS.length}`);

  if (invalid === 0) {
    console.log('\n🎉 SUCCESSO! Tutti i pack sono stati compilati correttamente!');
    console.log('I compendi dovrebbero ora caricarsi in Foundry VTT.');
  } else {
    console.log('\n⚠️  Alcuni pack hanno ancora problemi. Controlla i log sopra.');
  }
}

// Esegui
main().catch(console.error);