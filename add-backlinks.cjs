const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function loadJSONFiles(dir) {
  const items = new Map();

  function scanDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const fullPath = path.join(directory, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !file.startsWith('.')) {
        scanDirectory(fullPath);
      } else if (file.endsWith('.json') && !file.startsWith('.')) {
        try {
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          if (data._id) {
            items.set(data._id, {
              path: fullPath,
              data: data,
              packName: path.basename(path.dirname(fullPath) === '_source' ? path.dirname(path.dirname(fullPath)) : path.dirname(fullPath))
            });
          }
        } catch (e) {
          console.error(`Errore nel leggere ${fullPath}:`, e.message);
        }
      }
    }
  }

  scanDirectory(dir);
  return items;
}

function extractUUIDs(text) {
  const uuidPattern = /@UUID\[Compendium\.brancalonia-bigat\.([\w-]+)\.Item\.([^\]]+)\]/g;
  const matches = [];
  let match;

  while ((match = uuidPattern.exec(text)) !== null) {
    matches.push({
      full: match[0],
      pack: match[1],
      id: match[2]
    });
  }

  return matches;
}

function addBacklinks() {
  console.log(`${COLORS.cyan}════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}     AGGIUNTA BACKLINK AUTOMATICI${COLORS.reset}`);
  console.log(`${COLORS.cyan}════════════════════════════════════════════════${COLORS.reset}\n`);

  const packsDir = path.join(__dirname, 'packs');
  const allItems = loadJSONFiles(packsDir);

  let totalBacklinksAdded = 0;
  const modifications = [];

  // Trova tutti i collegamenti dalle regole
  const ruleItems = Array.from(allItems.values()).filter(item =>
    item.packName === 'regole' && item.data.type === 'JournalEntry'
  );

  for (const rule of ruleItems) {
    const pages = rule.data.pages || [];

    for (const page of pages) {
      if (page.text && page.text.content) {
        const uuids = extractUUIDs(page.text.content);

        for (const uuid of uuids) {
          const targetItem = allItems.get(uuid.id);

          if (targetItem && targetItem.packName !== 'regole') {
            // Controlla se il backlink esiste già
            if (!targetItem.data.flags) {
              targetItem.data.flags = {};
            }
            if (!targetItem.data.flags['brancalonia-bigat']) {
              targetItem.data.flags['brancalonia-bigat'] = {};
            }

            const ruleUUID = `@UUID[Compendium.brancalonia-bigat.regole.JournalEntry.${rule.data._id}]`;

            if (!targetItem.data.flags['brancalonia-bigat'].linkedRules) {
              targetItem.data.flags['brancalonia-bigat'].linkedRules = [];
            }

            if (!targetItem.data.flags['brancalonia-bigat'].linkedRules.includes(ruleUUID)) {
              targetItem.data.flags['brancalonia-bigat'].linkedRules.push(ruleUUID);
              modifications.push({
                item: targetItem,
                rule: rule.data.name,
                itemName: targetItem.data.name
              });
              totalBacklinksAdded++;
            }
          }
        }
      }
    }
  }

  // Salva le modifiche
  for (const mod of modifications) {
    fs.writeFileSync(
      mod.item.path,
      JSON.stringify(mod.item.data, null, 2) + '\n',
      'utf-8'
    );
    console.log(`${COLORS.green}✓${COLORS.reset} Aggiunto backlink a ${COLORS.yellow}${mod.itemName}${COLORS.reset} ← ${COLORS.blue}${mod.rule}${COLORS.reset}`);
  }

  console.log(`\n${COLORS.cyan}════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.magenta}📊 Riepilogo:${COLORS.reset}`);
  console.log(`   Backlink aggiunti: ${COLORS.green}${totalBacklinksAdded}${COLORS.reset}`);
  console.log(`   File modificati: ${COLORS.green}${modifications.length}${COLORS.reset}`);

  if (totalBacklinksAdded > 0) {
    console.log(`\n${COLORS.green}✅ BACKLINK AGGIUNTI CON SUCCESSO!${COLORS.reset}`);
    console.log(`${COLORS.yellow}💡 Ricorda di ricompilare i database con 'npm run build'${COLORS.reset}`);
  } else {
    console.log(`\n${COLORS.blue}ℹ️ Nessun nuovo backlink da aggiungere${COLORS.reset}`);
  }
}

// Esegui
addBacklinks();