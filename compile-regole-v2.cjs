#!/usr/bin/env node

const { ClassicLevel } = require('classic-level');
const fs = require('fs');
const path = require('path');

async function compilePack() {
    const sourcePath = path.join(__dirname, 'packs', 'regole', '_source');
    const dbPath = path.join(__dirname, 'packs', 'regole');

    // Rimuovi i file del database esistente
    const dbFiles = ['CURRENT', 'LOCK', 'LOG', 'LOG.old'];
    const manifestFiles = fs.readdirSync(dbPath).filter(f =>
        f.startsWith('MANIFEST-') || f.endsWith('.ldb') || f.endsWith('.log')
    );

    for (const file of [...dbFiles, ...manifestFiles]) {
        const filePath = path.join(dbPath, file);
        if (fs.existsSync(filePath)) {
            console.log(`🗑️  Rimuovendo ${file}...`);
            fs.unlinkSync(filePath);
        }
    }

    console.log('📦 Compilando il compendio regole con struttura v13...\n');

    const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
    await db.open();

    const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));

    for (const file of files) {
        const content = JSON.parse(fs.readFileSync(path.join(sourcePath, file), 'utf8'));

        // Rimuovi il _key dalle pagine prima di salvare il journal entry
        const journalToSave = { ...content };
        if (journalToSave.pages) {
            journalToSave.pages = journalToSave.pages.map(page => {
                const { _key, ...pageWithoutKey } = page;
                return pageWithoutKey;
            });
        }

        // Assicurati che il journal entry abbia il _key corretto
        const journalKey = content._key || `!journal!${content._id}`;
        journalToSave._key = journalKey;

        // Salva il journal entry principale
        await db.put(journalKey, journalToSave);
        console.log(`✅ Journal: ${journalKey} - ${content.name}`);

        // Salva anche ogni pagina come documento separato (potrebbe essere necessario per v13)
        if (content.pages && content.pages.length > 0) {
            for (const page of content.pages) {
                if (page._key) {
                    // Crea una chiave univoca per la pagina
                    const pageKey = page._key;
                    const pageToSave = {
                        ...page,
                        _key: pageKey,
                        // Aggiungi riferimento al parent journal
                        parent: content._id,
                        parentCollection: 'journal'
                    };

                    await db.put(pageKey, pageToSave);
                    console.log(`   📄 Page: ${pageKey} - ${page.name}`);
                }
            }
        }
    }

    await db.close();
    console.log(`\n✨ Compilazione completata! ${files.length} journal entries salvati in ${dbPath}`);
}

compilePack().catch(err => {
    console.error('❌ Errore durante la compilazione:', err);
    process.exit(1);
});