#!/usr/bin/env node

/**
 * Script per compilare i compendi preservando il campo _key
 * CRITICO per Foundry v13 - senza _key i compendi appaiono vuoti!
 */

const { ClassicLevel } = require('classic-level');
const fs = require('fs');
const path = require('path');

async function compilePack(packName, collectionType) {
  const sourcePath = path.join(__dirname, '..', 'packs', packName, '_source');
  const dbPath = path.join(__dirname, '..', 'packs', packName); // IMPORTANTE: Non in sottocartella!

  // Rimuovi database esistente se presente
  const oldDbPath = path.join(dbPath, `brancalonia-bigat.${packName}`);
  if (fs.existsSync(oldDbPath)) {
    console.log(`Rimuovo vecchio database: ${oldDbPath}`);
    fs.rmSync(oldDbPath, { recursive: true, force: true });
  }

  // Rimuovi file LevelDB esistenti nella cartella principale
  const levelFiles = ['CURRENT', 'LOCK', 'LOG', 'MANIFEST-000002'];
  const ldbFiles = fs.readdirSync(dbPath).filter(f => f.endsWith('.ldb') || f.endsWith('.log'));
  [...levelFiles, ...ldbFiles].forEach(file => {
    const filePath = path.join(dbPath, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Rimosso: ${file}`);
    }
  });

  console.log(`\n📦 Compilando ${packName} (${collectionType})...`);

  const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
  await db.open();

  const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));
  console.log(`   Trovati ${files.length} documenti da compilare`);

  let count = 0;
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.join(sourcePath, file), 'utf8'));
    const key = `!${collectionType}!${content._id}`;

    // CRITICO: Preservare _key nel documento salvato
    const docToSave = { ...content, _key: key };
    await db.put(key, docToSave);
    count++;
  }

  await db.close();
  console.log(`   ✅ Compilati ${count} documenti con _key preservato\n`);
}

async function compileAll() {
  console.log("=== COMPILAZIONE COMPENDI CON _KEY ===\n");
  console.log("IMPORTANTE: Questo script preserva il campo _key");
  console.log("richiesto da Foundry v13 per caricare i compendi\n");

  const packs = [
    { name: 'backgrounds', type: 'items' },
    { name: 'razze', type: 'items' },
    { name: 'equipaggiamento', type: 'items' },
    { name: 'talenti', type: 'items' },
    { name: 'incantesimi', type: 'items' },
    { name: 'brancalonia-features', type: 'items' },
    { name: 'sottoclassi', type: 'items' },
    { name: 'emeriticenze', type: 'items' },
    { name: 'classi', type: 'items' },
    { name: 'npc', type: 'actors' },
    { name: 'regole', type: 'journal' },
    { name: 'rollable-tables', type: 'tables' },
    { name: 'macro', type: 'macros' }
  ];

  for (const pack of packs) {
    try {
      await compilePack(pack.name, pack.type);
    } catch (error) {
      console.error(`❌ Errore compilando ${pack.name}:`, error.message);
    }
  }

  console.log("\n=== COMPILAZIONE COMPLETATA ===");
  console.log("I compendi sono ora pronti per Foundry v13!");
}

// Esegui
compileAll().catch(error => {
  console.error('Errore fatale:', error);
  process.exit(1);
});