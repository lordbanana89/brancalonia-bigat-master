import fs from 'fs';
import path from 'path';

// Mappa degli oggetti esistenti nei compendi
const ITEMS_MAP = {
  // ARMI DA FUOCO - OGGETTI ESISTENTI
  'Archibugio': {
    name: 'Archibugio Malfunzionante',
    pack: 'brancalonia-bigat.equipaggiamento',
    id: 'archibugiomalfunzionante001'
  },
  'Pistola': {
    name: 'Pistola Scadente',
    pack: 'brancalonia-bigat.equipaggiamento',
    id: 'pistolascadente001'
  },
  'Moschetto': {
    name: 'Moschetto Arrugginito',
    pack: 'brancalonia-bigat.equipaggiamento',
    id: 'moschettoarrugginito001'
  },
  'Bombarda Tascabile': {
    name: 'Bombarda Tascabile',
    pack: 'brancalonia-bigat.equipaggiamento',
    id: 'bombardatascabile001'
  },
  'Trombone': {
    name: 'Trombone da Guerra',
    pack: 'brancalonia-bigat.equipaggiamento',
    id: 'trombonedaguerra001'
  },

  // ARMI BIANCHE SCADENTI
  'Spadaccio Arrugginito': {
    name: 'Spadaccio Arrugginito',
    pack: 'brancalonia-bigat.equipaggiamento',
    id: 'spadaccioarrugginito001'
  },
  'Pugnale della Malasorte': {
    name: 'Pugnale della Malasorte',
    pack: 'brancalonia-bigat.equipaggiamento',
    id: 'pugnaledellaMalasorte001'
  },
  'Forchettone da Guerra': {
    name: 'Forchettone da Guerra',
    pack: 'brancalonia-bigat.equipaggiamento',
    id: 'forchettonedaguerra001'
  },

  // ARMATURE SCADENTI
  'Armatura di Cuoio Rappezzata': {
    name: 'Armatura di Cuoio Rappezzata',
    pack: 'brancalonia-bigat.equipaggiamento',
    id: 'armaturadecuoiorappezzata001'
  },
  'Armatura di Pezze': {
    name: 'Armatura di Pezze',
    pack: 'brancalonia-bigat.equipaggiamento',
    id: 'armaturadipezze001'
  },
  'Scudo Sfondato': {
    name: 'Scudo Sfondato',
    pack: 'brancalonia-bigat.equipaggiamento',
    id: 'scudosfondato001'
  },

  // OGGETTI VARI
  'Dadi Truccati': {
    name: 'Dadi Truccati',
    pack: 'brancalonia-bigat.equipaggiamento',
    id: 'daditruccati001'
  },
  'Talismano Portafortuna': {
    name: 'Talismano Portafortuna',
    pack: 'brancalonia-bigat.equipaggiamento',
    id: 'talismanoPortafortuna001'
  },
  'Borsa del Vino Acido': {
    name: 'Borsa del Vino Acido',
    pack: 'brancalonia-bigat.equipaggiamento',
    id: 'borsadelvinoacido001'
  },

  // TALENTI
  'Attaccabrighe': {
    name: 'Attaccabrighe',
    pack: 'brancalonia-bigat.talenti',
    id: 'attaccabrighe001'
  },
  'Fortuna del Bifolco': {
    name: 'Fortuna del Bifolco',
    pack: 'brancalonia-bigat.talenti',
    id: 'fortunadelbifolco001'
  },
  'Lingua Sciolta': {
    name: 'Lingua Sciolta',
    pack: 'brancalonia-bigat.talenti',
    id: 'linguasciolta001'
  },
  'Scudanza': {
    name: 'Scudanza',
    pack: 'brancalonia-bigat.talenti',
    id: 'talent_scudanza'
  },
  'Supercazzola': {
    name: 'Supercazzola',
    pack: 'brancalonia-bigat.talenti',
    id: 'talent_supercazzola'
  },

  // INCANTESIMI
  'Malocchio': {
    name: 'Malocchio',
    pack: 'brancalonia-bigat.incantesimi',
    id: 'malocchio001'
  },
  'Dado Truccato': {
    name: 'Dado Truccato',
    pack: 'brancalonia-bigat.incantesimi',
    id: 'dadotruccato001'
  },
  'Vino della Verità': {
    name: 'Vino della Verità',
    pack: 'brancalonia-bigat.incantesimi',
    id: 'vinodellaverita001'
  },
  'Taverna Sicura': {
    name: 'Taverna Sicura',
    pack: 'brancalonia-bigat.incantesimi',
    id: 'tavernasicura001'
  },
  'Forchetta Danzante': {
    name: 'Forchetta Danzante',
    pack: 'brancalonia-bigat.incantesimi',
    id: 'forchettadanzante001'
  }
};

// Funzione per creare un link Foundry UUID
function createFoundryLink(itemKey, displayText) {
  const item = ITEMS_MAP[itemKey];
  if (!item) {
    // Se non trovato, cerca varianti
    for (const [key, value] of Object.entries(ITEMS_MAP)) {
      if (key.toLowerCase().includes(itemKey.toLowerCase()) ||
          itemKey.toLowerCase().includes(key.toLowerCase())) {
        return `@UUID[Compendium.${value.pack}.${value.id}]{${displayText || key}}`;
      }
    }
    return displayText || itemKey; // Ritorna testo originale se non trovato
  }
  return `@UUID[Compendium.${item.pack}.${item.id}]{${displayText || item.name}}`;
}

// Funzione per processare il contenuto HTML e sostituire i nomi con link
function replaceItemNamesWithLinks(content) {
  let modifiedContent = content;

  // Pattern per trovare celle di tabella con nomi di oggetti
  // Cerca pattern come <td><strong>Nome</strong></td> o <td>Nome</td>
  const patterns = [
    // Pattern per nomi in grassetto nelle tabelle
    /<td><strong>([^<]+)<\/strong><\/td>/g,
    // Pattern per talenti e incantesimi nelle liste
    /<li><strong>([^:]+):<\/strong>/g,
    // Pattern per oggetti nelle tabelle semplici
    /<td>([A-Z][^<,]+(?:\s+[A-Z][^<,]+)*)<\/td>/g
  ];

  // Prima passa: sostituisci i nomi in grassetto
  modifiedContent = modifiedContent.replace(/<td><strong>([^<]+)<\/strong><\/td>/g, (match, itemName) => {
    const link = createFoundryLink(itemName, itemName);
    if (link.includes('@UUID')) {
      return `<td><strong>${link}</strong></td>`;
    }
    return match;
  });

  // Seconda passa: sostituisci oggetti specifici conosciuti
  for (const [itemKey, itemData] of Object.entries(ITEMS_MAP)) {
    // Cerca menzioni esatte dell'oggetto
    const regex = new RegExp(`<td>${itemKey}</td>`, 'g');
    modifiedContent = modifiedContent.replace(regex, `<td>${createFoundryLink(itemKey)}</td>`);

    // Cerca anche in contesti di liste
    const listRegex = new RegExp(`<li><strong>${itemKey}:</strong>`, 'g');
    modifiedContent = modifiedContent.replace(listRegex, `<li><strong>${createFoundryLink(itemKey)}:</strong>`);
  }

  // Sostituisci riferimenti specifici nelle tabelle delle armi
  const weaponReplacements = {
    'Archibugio': 'Archibugio Malfunzionante',
    'Pistola': 'Pistola Scadente',
    'Moschetto': 'Moschetto Arrugginito',
    'Spadaccio': 'Spadaccio Arrugginito',
    'Pugnale': 'Pugnale della Malasorte',
    'Scudo': 'Scudo Sfondato'
  };

  for (const [search, replace] of Object.entries(weaponReplacements)) {
    const searchRegex = new RegExp(`(<td>(?:<strong>)?)(${search})((?:<\/strong>)?<\/td>)`, 'g');
    modifiedContent = modifiedContent.replace(searchRegex, (match, pre, name, post) => {
      const link = createFoundryLink(search, name);
      return `${pre}${link}${post}`;
    });
  }

  return modifiedContent;
}

// Funzione per processare un file di regole
function processRuleFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    let modified = false;

    // Processa ogni pagina del journal
    if (data.pages && Array.isArray(data.pages)) {
      for (let page of data.pages) {
        if (page.text && page.text.content) {
          const originalContent = page.text.content;
          const newContent = replaceItemNamesWithLinks(originalContent);

          if (originalContent !== newContent) {
            page.text.content = newContent;
            modified = true;
          }
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Aggiornato: ${path.basename(filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Errore processando ${filePath}: ${error.message}`);
    return false;
  }
}

// Funzione principale
function main() {
  const rulesDir = 'packs/regole/_source';

  console.log('🔗 Aggiunta link agli oggetti nelle regole...\n');

  if (!fs.existsSync(rulesDir)) {
    console.error('❌ Directory regole non trovata');
    return;
  }

  const files = fs.readdirSync(rulesDir).filter(f => f.endsWith('.json'));
  let updated = 0;

  // File prioritari che contengono tabelle di oggetti
  const priorityFiles = [
    'armi-da-fuoco-primitive.json',
    'equipaggiamento-scadente.json',
    'combattimento-sporco.json',
    'gioco-azzardo.json',
    'risse-taverna.json'
  ];

  // Processa prima i file prioritari
  for (const file of priorityFiles) {
    if (files.includes(file)) {
      const filePath = path.join(rulesDir, file);
      if (processRuleFile(filePath)) {
        updated++;
      }
    }
  }

  // Poi processa gli altri
  for (const file of files) {
    if (!priorityFiles.includes(file)) {
      const filePath = path.join(rulesDir, file);
      if (processRuleFile(filePath)) {
        updated++;
      }
    }
  }

  console.log(`\n📊 Riepilogo: ${updated} file aggiornati su ${files.length}`);
}

// Esegui
main();