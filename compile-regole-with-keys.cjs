#!/usr/bin/env node

const { ClassicLevel } = require('classic-level');
const fs = require('fs');
const path = require('path');

async function compilePack() {
    const sourcePath = path.join(__dirname, 'packs', 'regole', '_source');
    const dbPath = path.join(__dirname, 'packs', 'regole'); // IMPORTANTE: Non in sottocartella!

    // Rimuovi il database esistente se c'è
    const dbSubPath = path.join(dbPath, 'regole');
    if (fs.existsSync(dbSubPath)) {
        console.log('🗑️  Rimuovendo vecchio database in sottocartella...');
        fs.rmSync(dbSubPath, { recursive: true, force: true });
    }

    // Rimuovi i file del database esistente nella directory principale
    const dbFiles = ['CURRENT', 'LOCK', 'LOG', 'LOG.old'];
    const manifestFiles = fs.readdirSync(dbPath).filter(f => f.startsWith('MANIFEST-') || f.endsWith('.ldb') || f.endsWith('.log'));

    for (const file of [...dbFiles, ...manifestFiles]) {
        const filePath = path.join(dbPath, file);
        if (fs.existsSync(filePath)) {
            console.log(`🗑️  Rimuovendo ${file}...`);
            fs.unlinkSync(filePath);
        }
    }

    console.log('📦 Compilando il compendio regole con _key preservato...');

    const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
    await db.open();

    const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const content = JSON.parse(fs.readFileSync(path.join(sourcePath, file), 'utf8'));
        const key = content._key || `!journal!${content._id}`;

        // CRITICO: Preservare _key nel documento salvato
        const docToSave = { ...content, _key: key };
        await db.put(key, docToSave);
        console.log(`✅ Aggiunto: ${key} - ${content.name}`);
    }

    await db.close();
    console.log(`\n✨ Compilazione completata! ${files.length} documenti salvati in ${dbPath}`);
}

compilePack().catch(err => {
    console.error('❌ Errore durante la compilazione:', err);
    process.exit(1);
});