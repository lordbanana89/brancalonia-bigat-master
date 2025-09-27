const fs = require('fs');
const path = require('path');

function fixEmbeddedKeys(packName, collectionType) {
  const srcDir = path.join(__dirname, 'packs', packName, '_source');

  if (!fs.existsSync(srcDir)) {
    console.log(`⚠️  Directory non trovata: ${srcDir}`);
    return;
  }

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
  let fixedCount = 0;

  for (const file of files) {
    const filePath = path.join(srcDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const doc = JSON.parse(content);

    let modified = false;

    // Aggiungi _key al documento principale se manca
    if (!doc._key && doc._id) {
      doc._key = `!${collectionType}!${doc._id}`;
      modified = true;
    }

    // Se è un actor, controlla gli items embedded
    if (collectionType === 'actors' && doc.items && Array.isArray(doc.items)) {
      doc.items = doc.items.map(item => {
        if (!item._key && item._id) {
          item._key = `!items!${item._id}`;
          modified = true;
        }
        return item;
      });
    }

    // Controlla advancement per items (razze, classi, ecc)
    if (doc.advancement && Array.isArray(doc.advancement)) {
      doc.advancement = doc.advancement.map(adv => {
        if (!adv._key && adv._id) {
          adv._key = `!advancement!${adv._id}`;
          modified = true;
        }
        return adv;
      });
    }

    // Se è un journal, controlla le pages embedded
    if (collectionType === 'journal' && doc.pages && Array.isArray(doc.pages)) {
      doc.pages = doc.pages.map(page => {
        if (!page._key && page._id) {
          page._key = `!pages!${page._id}`;
          modified = true;
        }
        return page;
      });
    }

    // Se è una table, controlla i results embedded
    if (collectionType === 'tables' && doc.results && Array.isArray(doc.results)) {
      doc.results = doc.results.map(result => {
        if (!result._key && result._id) {
          result._key = `!results!${result._id}`;
          modified = true;
        }
        return result;
      });
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(doc, null, 2));
      fixedCount++;
    }
  }

  console.log(`✅ ${packName}: Sistemati ${fixedCount} file`);
}

// Correggi i pack con errori
const problematicPacks = {
  'npc': 'actors',
  'razze': 'items',
  'regole': 'journal',
  'rollable-tables': 'tables'
};

console.log('🔧 Correggendo _key per documenti embedded...\n');

for (const [pack, type] of Object.entries(problematicPacks)) {
  fixEmbeddedKeys(pack, type);
}

console.log('\n✅ Completato!');