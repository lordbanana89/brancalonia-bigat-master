const fs = require('fs');
const path = require('path');

function fixDuplicatePageIds() {
  const srcDir = path.join(__dirname, 'packs', 'regole', '_source');
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(srcDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const doc = JSON.parse(content);

    if (doc.pages && Array.isArray(doc.pages)) {
      const baseId = doc._id || path.basename(file, '.json');

      doc.pages = doc.pages.map((page, index) => {
        // Genera ID unico per ogni pagina
        page._id = `${baseId}_page_${index + 1}`;
        page._key = `!pages!${page._id}`;
        return page;
      });

      fs.writeFileSync(filePath, JSON.stringify(doc, null, 2));
      console.log(`✅ ${file}: Sistemate ${doc.pages.length} pagine`);
    }
  }
}

console.log('🔧 Correggendo ID duplicati nelle pagine...\n');
fixDuplicatePageIds();
console.log('\n✅ Completato!');