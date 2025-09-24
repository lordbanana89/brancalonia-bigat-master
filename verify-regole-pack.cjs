#!/usr/bin/env node

const { ClassicLevel } = require('classic-level');
const path = require('path');

async function verifyPack() {
    const dbPath = path.join(__dirname, 'packs', 'regole');

    console.log('🔍 Verificando il database compilato...\n');

    const db = new ClassicLevel(dbPath, { valueEncoding: 'json' });
    await db.open();

    let count = 0;
    let hasKeys = true;

    for await (const [key, value] of db.iterator()) {
        count++;
        console.log(`📄 Documento #${count}:`);
        console.log(`   Key: ${key}`);
        console.log(`   _key: ${value._key}`);
        console.log(`   _id: ${value._id}`);
        console.log(`   Name: ${value.name}`);
        console.log(`   Type: ${value.type}`);
        console.log(`   Pages: ${value.pages ? value.pages.length : 0}`);

        if (!value._key) {
            console.log(`   ⚠️ ATTENZIONE: Manca _key!`);
            hasKeys = false;
        }

        if (value._key !== key) {
            console.log(`   ⚠️ ATTENZIONE: _key (${value._key}) non corrisponde alla chiave (${key})!`);
        }

        console.log('');
    }

    await db.close();

    console.log('📊 Riepilogo:');
    console.log(`   Totale documenti: ${count}`);
    console.log(`   Tutti hanno _key: ${hasKeys ? '✅ Sì' : '❌ No'}`);
    console.log(`   Database path: ${dbPath}`);

    if (count === 0) {
        console.log('\n❌ ATTENZIONE: Il database è vuoto!');
    } else if (!hasKeys) {
        console.log('\n❌ ATTENZIONE: Alcuni documenti non hanno _key. Foundry v13 non li caricherà!');
    } else {
        console.log('\n✅ Il database è pronto per Foundry v13!');
    }
}

verifyPack().catch(err => {
    console.error('❌ Errore durante la verifica:', err);
    process.exit(1);
});