#!/usr/bin/env node

/**
 * Script per verificare TUTTI i pack Brancalonia in dettaglio
 */

const { ClassicLevel } = require('classic-level');
const fs = require('fs');
const path = require('path');

const PACKS = [
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

async function verifyPack(packName) {
  const dbPath = path.join(__dirname, '..', 'packs', packName);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📦 PACK: ${packName}`);
  console.log(`${'='.repeat(60)}`);

  // 1. Verifica struttura directory
  console.log('\n📁 Struttura Directory:');

  if (!fs.existsSync(dbPath)) {
    console.log('  ❌ Directory pack non esiste!');
    return { valid: false, count: 0, errors: ['Directory non esiste'] };
  }

  const files = fs.readdirSync(dbPath);
  const hasSource = files.includes('_source');
  const hasCurrent = files.includes('CURRENT');
  const hasManifest = files.some(f => f.startsWith('MANIFEST-'));
  const hasLdb = files.some(f => f.endsWith('.ldb'));
  const hasSubdir = files.includes(packName);

  console.log(`  ✓ Directory _source: ${hasSource ? '✅' : '❌'}`);
  console.log(`  ✓ File CURRENT: ${hasCurrent ? '✅' : '❌'}`);
  console.log(`  ✓ File MANIFEST: ${hasManifest ? '✅' : '❌'}`);
  console.log(`  ✓ File .ldb: ${hasLdb ? '✅' : '❌'}`);
  console.log(`  ✓ Sottocartella errata: ${hasSubdir ? '❌ PRESENTE (ERRORE!)' : '✅ Assente'}`);

  if (!hasCurrent || !hasLdb) {
    console.log('\n❌ Database non trovato o non compilato!');
    return { valid: false, count: 0, errors: ['Database mancante'] };
  }

  if (hasSubdir) {
    console.log('\n⚠️  ATTENZIONE: Trovata sottocartella che potrebbe causare problemi!');
  }

  // 2. Conta documenti source
  console.log('\n📄 File Source:');
  const sourcePath = path.join(dbPath, '_source');
  let sourceCount = 0;
  if (fs.existsSync(sourcePath)) {
    const sourceFiles = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));
    sourceCount = sourceFiles.length;
    console.log(`  Totale file JSON: ${sourceCount}`);
  } else {
    console.log('  ⚠️  Directory _source non trovata');
  }

  // 3. Verifica contenuto database
  console.log('\n💾 Contenuto Database:');

  const db = new ClassicLevel(dbPath, {
    valueEncoding: 'json',
    readOnly: true
  });

  try {
    await db.open();

    let totalDocs = 0;
    let docsWithKey = 0;
    let docsWithoutKey = 0;
    let firstDocs = [];
    let errors = [];

    // Conta tutti i documenti
    for await (const [key, value] of db.iterator()) {
      totalDocs++;

      if (value._key) {
        docsWithKey++;
      } else {
        docsWithoutKey++;
        if (docsWithoutKey <= 3) {
          errors.push(`Documento senza _key: ${key}`);
        }
      }

      // Salva primi 3 documenti per esempio
      if (totalDocs <= 3) {
        firstDocs.push({
          key,
          _id: value._id,
          _key: value._key,
          name: value.name
        });
      }
    }

    await db.close();

    console.log(`  Documenti totali: ${totalDocs}`);
    console.log(`  Documenti con _key: ${docsWithKey} ${docsWithKey === totalDocs ? '✅' : '⚠️'}`);
    console.log(`  Documenti senza _key: ${docsWithoutKey} ${docsWithoutKey === 0 ? '✅' : '❌'}`);

    // Confronta con source
    if (sourceCount > 0) {
      const match = sourceCount === totalDocs;
      console.log(`  Match source/database: ${sourceCount}/${totalDocs} ${match ? '✅' : '⚠️'}`);
      if (!match) {
        errors.push(`Mismatch documenti: ${sourceCount} source vs ${totalDocs} database`);
      }
    }

    // Mostra primi documenti
    if (firstDocs.length > 0) {
      console.log('\n📝 Primi documenti:');
      firstDocs.forEach((doc, i) => {
        console.log(`  ${i + 1}. ${doc.name || 'Senza nome'}`);
        console.log(`     Key: ${doc.key}`);
        console.log(`     _id: ${doc._id || 'MANCANTE'}`);
        console.log(`     _key: ${doc._key || 'MANCANTE ❌'}`);
      });
    }

    // Report errori
    if (errors.length > 0) {
      console.log('\n⚠️  Problemi trovati:');
      errors.forEach(err => console.log(`  - ${err}`));
    }

    // Valutazione finale
    const isValid = totalDocs > 0 && docsWithoutKey === 0 && !hasSubdir;

    console.log('\n📊 Valutazione:');
    if (isValid) {
      console.log('  ✅ Pack VALIDO e pronto per Foundry');
    } else if (totalDocs > 0 && docsWithoutKey === 0) {
      console.log('  ⚠️  Pack funzionante ma con warning');
    } else {
      console.log('  ❌ Pack NON VALIDO - richiede ricompilazione');
    }

    return { valid: isValid, count: totalDocs, errors };

  } catch (err) {
    console.log(`  ❌ Errore apertura database: ${err.message}`);
    return { valid: false, count: 0, errors: [err.message] };
  }
}

async function main() {
  console.log('🔍 VERIFICA COMPLETA PACK BRANCALONIA');
  console.log('=' .repeat(60));
  console.log(`Data: ${new Date().toLocaleString()}`);
  console.log(`Totale pack da verificare: ${PACKS.length}`);

  const results = [];

  for (const pack of PACKS) {
    const result = await verifyPack(pack);
    results.push({ name: pack, ...result });
  }

  // Report finale
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 REPORT FINALE');
  console.log('='.repeat(60));

  const validPacks = results.filter(r => r.valid);
  const invalidPacks = results.filter(r => !r.valid);
  const totalDocs = results.reduce((sum, r) => sum + r.count, 0);

  console.log(`\n✅ Pack validi: ${validPacks.length}/${PACKS.length}`);
  validPacks.forEach(p => {
    console.log(`   ✓ ${p.name} (${p.count} documenti)`);
  });

  if (invalidPacks.length > 0) {
    console.log(`\n❌ Pack con problemi: ${invalidPacks.length}`);
    invalidPacks.forEach(p => {
      console.log(`   ✗ ${p.name}: ${p.errors.join(', ')}`);
    });
  }

  console.log(`\n📈 Statistiche:`);
  console.log(`   Documenti totali: ${totalDocs}`);
  console.log(`   Media per pack: ${Math.round(totalDocs / PACKS.length)}`);

  if (invalidPacks.length === 0) {
    console.log('\n🎉 SUCCESSO TOTALE!');
    console.log('Tutti i pack sono compilati correttamente e pronti per Foundry VTT!');
  } else {
    console.log('\n⚠️  ATTENZIONE!');
    console.log(`${invalidPacks.length} pack richiedono attenzione.`);
    console.log('Esegui "node scripts/fix-compile-packs.cjs" per ricompilare.');
  }
}

main().catch(console.error);