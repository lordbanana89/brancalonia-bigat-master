import fs from 'fs';
import path from 'path';

// Mappa dei collegamenti tra contenuti e regole
const CONTENT_TO_RULES_MAP = {
  // ARMI DA FUOCO
  'archibugio': ['armi-da-fuoco-primitive', 'equipaggiamento-scadente'],
  'pistola': ['armi-da-fuoco-primitive', 'equipaggiamento-scadente'],
  'bombarda': ['armi-da-fuoco-primitive'],

  // COMBATTIMENTO
  'attaccabrighe': ['combattimento-sporco', 'risse-taverna'],
  'rissa': ['risse-taverna', 'combattimento-sporco'],
  'taverna': ['risse-taverna'],
  'pugni': ['combattimento-sporco'],
  'morso': ['combattimento-sporco'],
  'testata': ['combattimento-sporco'],

  // EQUIPAGGIAMENTO SCADENTE
  'scadente': ['equipaggiamento-scadente'],
  'malfunzionante': ['equipaggiamento-scadente'],
  'rappezzat': ['equipaggiamento-scadente'],
  'arrugginit': ['equipaggiamento-scadente'],
  'bucato': ['equipaggiamento-scadente'],
  'sfondat': ['equipaggiamento-scadente'],

  // FORTUNA/SFORTUNA
  'fortuna': ['fortuna-sfortuna'],
  'sfortuna': ['fortuna-sfortuna'],
  'menagramo': ['menagramo', 'fortuna-sfortuna'],
  'iella': ['menagramo'],
  'malocchio': ['superstizioni-tradizioni', 'menagramo'],

  // VELENI
  'veleno': ['veleni-antidoti'],
  'antidoto': ['veleni-antidoti'],
  'avvelenat': ['veleni-antidoti'],

  // UBRIACHEZZA
  'vino': ['ubriachezza'],
  'birra': ['ubriachezza'],
  'alcol': ['ubriachezza'],
  'ubriaco': ['ubriachezza'],
  'sbronzo': ['ubriachezza'],

  // GIOCO D'AZZARDO
  'dadi': ['gioco-azzardo'],
  'carte': ['gioco-azzardo'],
  'truccati': ['gioco-azzardo'],
  'scommess': ['gioco-azzardo'],
  'barare': ['gioco-azzardo'],

  // DUELLI
  'duello': ['duelli-codice-onore'],
  'onore': ['duelli-codice-onore'],
  'sfida': ['duelli-codice-onore'],

  // CORRUZIONE
  'corruzione': ['corruzione-tangenti'],
  'tangente': ['corruzione-tangenti'],
  'bustarella': ['corruzione-tangenti'],

  // VIAGGI
  'viaggio': ['viaggi-incontri'],
  'carrozza': ['viaggi-incontri'],
  'cavallo': ['viaggi-incontri'],
  'locanda': ['viaggi-incontri', 'vita-da-vagabondo'],

  // RIPOSO
  'riposo': ['riposo-canaglia'],
  'sbraco': ['riposo-canaglia'],
  'bagordi': ['riposo-canaglia'],

  // TAGLIE
  'taglia': ['sistema-taglie'],
  'bounty': ['sistema-taglie'],
  'ricercat': ['sistema-taglie'],

  // LAVORI
  'lavoro': ['lavori-sporchi'],
  'lavoretto': ['lavori-sporchi'],
  'missione': ['lavori-sporchi']
};

// Funzione per generare il tag HTML per un riferimento a regola
function createRuleTag(ruleName, displayName) {
  const ruleId = ruleName.replace(/-/g, '');
  return `<span class="regola-tag" data-regola="${ruleName}" draggable="true">📜 ${displayName}</span>`;
}

// Funzione per aggiungere tag alle descrizioni
function addRuleTags(description, itemName) {
  let enhancedDescription = description;
  const addedRules = new Set();

  // Cerca parole chiave nel nome e descrizione dell'oggetto
  const textToSearch = (itemName + ' ' + description).toLowerCase();

  for (const [keyword, rules] of Object.entries(CONTENT_TO_RULES_MAP)) {
    if (textToSearch.includes(keyword)) {
      for (const rule of rules) {
        if (!addedRules.has(rule)) {
          addedRules.add(rule);
        }
      }
    }
  }

  // Se ci sono regole correlate, aggiungi i tag alla fine
  if (addedRules.size > 0) {
    enhancedDescription += '<div class="regole-correlate"><strong>Regole Correlate:</strong> ';
    const ruleTags = Array.from(addedRules).map(rule => {
      // Converti il nome della regola in formato leggibile
      const displayName = rule.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      return createRuleTag(rule, displayName);
    });
    enhancedDescription += ruleTags.join(' ');
    enhancedDescription += '</div>';
  }

  return enhancedDescription;
}

// Funzione per processare un file JSON di un compendio
function processCompendiumFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Se la descrizione esiste, aggiungi i tag
    if (data.system && data.system.description && data.system.description.value) {
      const originalDesc = data.system.description.value;
      const enhancedDesc = addRuleTags(originalDesc, data.name);

      if (originalDesc !== enhancedDesc) {
        data.system.description.value = enhancedDesc;

        // Salva il file modificato
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ Aggiornato: ${path.basename(filePath)}`);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`❌ Errore processando ${filePath}: ${error.message}`);
    return false;
  }
}

// Funzione principale per processare tutti i compendi
function processAllCompendiums() {
  const compendiumDirs = [
    'packs/equipaggiamento/_source',
    'packs/talenti/_source',
    'packs/incantesimi/_source',
    'packs/brancalonia-features/_source',
    'packs/emeriticenze/_source'
  ];

  let totalProcessed = 0;
  let totalUpdated = 0;

  for (const dir of compendiumDirs) {
    if (fs.existsSync(dir)) {
      console.log(`\n📂 Processando ${dir}...`);
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

      for (const file of files) {
        totalProcessed++;
        if (processCompendiumFile(path.join(dir, file))) {
          totalUpdated++;
        }
      }
    }
  }

  console.log(`\n📊 Riepilogo:`);
  console.log(`   File processati: ${totalProcessed}`);
  console.log(`   File aggiornati: ${totalUpdated}`);
}

// Esegui il processing
console.log('🔗 Aggiunta collegamenti alle regole nei compendi...\n');
processAllCompendiums();