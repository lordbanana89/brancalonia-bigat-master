const fs = require('fs');
const path = require('path');

function fixAllFiles() {
  const packs = [
    'backgrounds', 'brancalonia-features', 'emeriticenze', 'equipaggiamento',
    'incantesimi', 'macro', 'npc', 'razze', 'regole', 'rollable-tables',
    'sottoclassi', 'talenti'
  ];

  let totalFixed = 0;

  for (const pack of packs) {
    const srcDir = path.join(__dirname, 'packs', pack, '_source');

    if (!fs.existsSync(srcDir)) continue;

    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
    let packFixed = 0;

    for (const file of files) {
      const filePath = path.join(srcDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const doc = JSON.parse(content);

      let modified = false;

      // Controlla advancement
      if (doc.advancement && Array.isArray(doc.advancement)) {
        doc.advancement = doc.advancement.map(adv => {
          if (!adv._key && adv._id) {
            adv._key = `!advancement!${adv._id}`;
            modified = true;
          }
          return adv;
        });
      }

      // Controlla effects
      if (doc.effects && Array.isArray(doc.effects)) {
        doc.effects = doc.effects.map(eff => {
          if (!eff._key && eff._id) {
            eff._key = `!effects!${eff._id}`;
            modified = true;
          }
          return eff;
        });
      }

      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(doc, null, 2));
        packFixed++;
        totalFixed++;
      }
    }

    if (packFixed > 0) {
      console.log(`✅ ${pack}: Sistemati ${packFixed} file`);
    }
  }

  console.log(`\n✅ Totale: ${totalFixed} file corretti`);
}

console.log('🔧 Correggendo _key per advancement e effects...\n');
fixAllFiles();