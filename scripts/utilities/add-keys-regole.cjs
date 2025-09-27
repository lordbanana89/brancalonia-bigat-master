#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'packs', 'regole', '_source');

// Leggi tutti i file JSON nella directory
const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));

for (const file of files) {
    const filePath = path.join(sourcePath, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Aggiungi il campo _key se non esiste
    if (!content._key) {
        content._key = `!journal!${content._id}`;
        console.log(`✅ Aggiunto _key a ${file}: ${content._key}`);

        // Salva il file aggiornato
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    } else {
        console.log(`⏭️  ${file} ha già _key: ${content._key}`);
    }
}

console.log('✨ Completato! Tutti i file hanno il campo _key');