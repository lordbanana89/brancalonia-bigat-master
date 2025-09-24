import fs from 'fs';
import path from 'path';

/**
 * Aggiunge richTooltip a tutti gli oggetti dei compendi Brancalonia
 * per renderli compatibili con il sistema tooltip di dnd5e
 */

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    let modified = false;

    // Assicurati che system esista
    if (!data.system) {
      data.system = {};
      modified = true;
    }

    // Assicurati che description esista
    if (!data.system.description) {
      data.system.description = {
        value: '',
        chat: '',
        unidentified: ''
      };
      modified = true;
    }

    // Se description è null o non è un oggetto, correggilo
    if (data.system.description === null || typeof data.system.description !== 'object') {
      data.system.description = {
        value: '',
        chat: '',
        unidentified: ''
      };
      modified = true;
    }

    // Aggiungi richTooltip se manca
    if (!data.system.description.richTooltip) {
      // Crea il contenuto del tooltip dal value esistente o dal nome
      let tooltipContent = '';

      if (data.system.description.value) {
        // Estrai i primi 200 caratteri della descrizione, rimuovendo HTML
        tooltipContent = data.system.description.value
          .replace(/<[^>]*>/g, '') // Rimuovi tag HTML
          .replace(/&[^;]+;/g, ' ') // Rimuovi entità HTML
          .trim()
          .substring(0, 200);
      } else {
        // Se non c'è descrizione, usa il nome
        tooltipContent = data.name || 'Oggetto di Brancalonia';
      }

      // Struttura richTooltip come si aspetta dnd5e
      data.system.description.richTooltip = {
        content: `<p>${tooltipContent}${tooltipContent.length >= 200 ? '...' : ''}</p>`,
        flavor: ''
      };

      modified = true;
    }

    // Salva se modificato
    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Aggiunto richTooltip a: ${path.basename(filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Errore processando ${filePath}: ${error.message}`);
    return false;
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️ Directory non trovata: ${dirPath}`);
    return 0;
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
  let updated = 0;

  for (const file of files) {
    if (processFile(path.join(dirPath, file))) {
      updated++;
    }
  }

  return updated;
}

// Processa tutti i compendi
console.log('🔧 Aggiunta richTooltip agli oggetti Brancalonia...\n');

const compendiums = [
  'packs/equipaggiamento/_source',
  'packs/talenti/_source',
  'packs/incantesimi/_source',
  'packs/brancalonia-features/_source',
  'packs/emeriticenze/_source',
  'packs/npc/_source',
  'packs/backgrounds/_source',
  'packs/razze/_source',
  'packs/sottoclassi/_source'
];

let totalUpdated = 0;

for (const compendium of compendiums) {
  console.log(`\n📂 Processando ${compendium}...`);
  const updated = processDirectory(compendium);
  totalUpdated += updated;
  console.log(`   Aggiornati: ${updated} file`);
}

console.log(`\n✨ Completato! Totale file aggiornati: ${totalUpdated}`);
console.log('\n⚠️ Ricorda di ricompilare i compendi con:');
console.log('   fvtt package pack --type Module --id brancalonia-bigat --compendiumName <nome> --compendiumType Item --inputDirectory <dir> --nedb');