#!/usr/bin/env node

/**
 * Script di normalizzazione database Brancalonia per Foundry VTT v13
 * Versione 2.0 - Preserva struttura esistente e integra con packs
 *
 * Trasforma i file JSON dal formato database al formato Foundry dnd5e v5.1.9
 * mantenendo la struttura modulare esistente (1 file = 1 entità)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configurazione percorsi
const CONFIG = {
  DATABASE_PATH: '/Users/erik/Desktop/brancalonia-bigat-master/database',
  PACKS_PATH: '/Users/erik/Desktop/brancalonia-bigat-master/packs',
  BACKUP_PATH: '/Users/erik/Desktop/brancalonia-bigat-master/backup',
  DRY_RUN: process.argv.includes('--dry-run'),
  VERBOSE: process.argv.includes('--verbose')
};

// Mappatura database → packs
const CATEGORY_MAPPING = {
  // Mappatura diretta
  'backgrounds': { pack: 'backgrounds', type: 'background' },
  'razze': { pack: 'razze', type: 'race' },
  'talenti': { pack: 'talenti', type: 'feat' },
  'emeriticenze': { pack: 'emeriticenze', type: 'feat' },
  'incantesimi': { pack: 'incantesimi', type: 'spell' },
  'regole': { pack: 'regole', type: 'journal' },
  'tabelle': { pack: 'rollable-tables', type: 'table' },

  // Creature
  'creature/creature_base': { pack: 'npc', type: 'npc' },
  'creature/png_base': { pack: 'npc', type: 'npc' },
  'creature/creature_macaronicon': { pack: 'npc', type: 'npc' },
  'creature/png_macaronicon': { pack: 'npc', type: 'npc' },

  // Equipaggiamento
  'equipaggiamento/armi': { pack: 'equipaggiamento', type: 'weapon' },
  'equipaggiamento/armature': { pack: 'equipaggiamento', type: 'equipment' },
  'equipaggiamento/cimeli': { pack: 'equipaggiamento', type: 'equipment' },
  'equipaggiamento/oggetti': { pack: 'equipaggiamento', type: 'equipment' },

  // Classi e feature
  'classi': { pack: 'classi', type: 'class' },
  'classi/**/sottoclassi': { pack: 'sottoclassi', type: 'subclass' },
  'classi/**/privilegi_*': { pack: 'brancalonia-features', type: 'feat' }
};

// Statistiche
const stats = {
  processed: 0,
  normalized: 0,
  skipped: 0,
  errors: []
};

/**
 * Genera un ID Foundry deterministico dal nome file
 */
function generateFoundryId(filePath, category) {
  const fileName = path.basename(filePath, '.json');
  const hash = crypto.createHash('md5').update(filePath).digest('hex').substring(0, 8);
  return `${fileName.replace(/[^a-zA-Z0-9]/g, '')}${hash}`;
}

/**
 * Determina il tipo di collezione per _key
 */
function getCollectionType(documentType) {
  const collectionMap = {
    'npc': 'actors',
    'character': 'actors',
    'background': 'items',
    'class': 'items',
    'subclass': 'items',
    'race': 'items',
    'feat': 'items',
    'spell': 'items',
    'weapon': 'items',
    'equipment': 'items',
    'journal': 'journal',
    'table': 'tables'
  };
  return collectionMap[documentType] || 'items';
}

/**
 * Converte velocità da metri a piedi
 */
function convertSpeed(speedString) {
  if (!speedString) return 30;
  const meters = parseInt(speedString.replace(/[^0-9]/g, ''));
  return Math.round(meters * 3.28084 / 5) * 5; // Arrotonda ai 5 piedi
}

/**
 * Converte taglia italiana in codice dnd5e
 */
function convertSize(taglia) {
  const sizeMap = {
    'Minuscola': 'tiny',
    'Piccola': 'sm',
    'Media': 'med',
    'Grande': 'lg',
    'Enorme': 'huge',
    'Mastodontica': 'grg'
  };
  return sizeMap[taglia] || 'med';
}

/**
 * Normalizza una creatura/PNG
 */
function normalizeCreature(data, filePath) {
  const id = generateFoundryId(filePath, 'creature');
  const collection = 'actors';

  const normalized = {
    _id: id,
    _key: `!${collection}!${id}`,
    name: data.nome || data.name || 'Creatura Senza Nome',
    type: 'npc',
    img: 'icons/svg/mystery-man.svg',
    system: {
      abilities: {},
      attributes: {
        ac: {
          flat: data.classe_armatura?.valore || 10,
          calc: 'default',
          formula: ''
        },
        hp: {
          value: data.punti_ferita?.valore || 1,
          max: data.punti_ferita?.valore || 1,
          temp: 0,
          tempmax: 0,
          formula: data.punti_ferita?.formula || ''
        },
        movement: {
          walk: convertSpeed(data.velocita?.camminare),
          swim: convertSpeed(data.velocita?.nuotare),
          fly: convertSpeed(data.velocita?.volare),
          climb: convertSpeed(data.velocita?.scalare),
          burrow: convertSpeed(data.velocita?.scavare),
          units: 'ft',
          hover: false
        },
        senses: {
          darkvision: parseInt(data.sensi?.scurovisione) || 0,
          blindsight: parseInt(data.sensi?.vista_cieca) || 0,
          tremorsense: 0,
          truesight: 0,
          units: 'ft',
          special: ''
        },
        spellcasting: '',
        prof: 2
      },
      details: {
        biography: {
          value: data.descrizione ? `<p>${data.descrizione}</p>` : '',
          public: ''
        },
        alignment: data.allineamento || '',
        race: '',
        type: {
          value: (data.tipo || 'humanoid').toLowerCase().replace('umanoide', 'humanoid'),
          subtype: '',
          swarm: data.tipo === 'Sciame' ? 'tiny' : '',
          custom: ''
        },
        environment: '',
        cr: parseFloat(data.grado_sfida) || 0,
        spellLevel: 0,
        xp: {
          value: data.punti_esperienza || 0
        },
        source: data.fonte || 'Brancalonia'
      },
      traits: {
        size: convertSize(data.taglia),
        di: { value: [], custom: '' },
        dr: { value: [], custom: '' },
        dv: { value: [], custom: '' },
        ci: { value: [], custom: '' },
        languages: {
          value: data.linguaggi ? data.linguaggi.split(',').map(l => l.trim().toLowerCase()) : [],
          custom: ''
        }
      },
      currency: {
        pp: 0, gp: 0, ep: 0, sp: 0, cp: 0
      }
    },
    items: [],
    effects: [],
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: {
      brancalonia: {
        fonte: data.fonte,
        note: data.note_brancalonia || {},
        implementazione: data.implementazione_foundry || {},
        id_originale: data.id
      }
    }
  };

  // Aggiungi caratteristiche
  if (data.caratteristiche) {
    normalized.system.abilities = {
      str: { value: data.caratteristiche.forza || 10, proficient: 0, bonuses: { check: '', save: '' } },
      dex: { value: data.caratteristiche.destrezza || 10, proficient: 0, bonuses: { check: '', save: '' } },
      con: { value: data.caratteristiche.costituzione || 10, proficient: 0, bonuses: { check: '', save: '' } },
      int: { value: data.caratteristiche.intelligenza || 10, proficient: 0, bonuses: { check: '', save: '' } },
      wis: { value: data.caratteristiche.saggezza || 10, proficient: 0, bonuses: { check: '', save: '' } },
      cha: { value: data.caratteristiche.carisma || 10, proficient: 0, bonuses: { check: '', save: '' } }
    };
  }

  // Aggiungi abilità
  const skillMap = {
    'furtivita': 'ste',
    'percezione': 'prc',
    'atletica': 'ath',
    'inganno': 'dec',
    'intimidire': 'inti'
  };

  // Inizializza tutte le skill con valori default
  const allSkills = ['acr', 'ani', 'arc', 'ath', 'dec', 'his', 'ins', 'inti', 'inv', 'med', 'nat', 'prc', 'prf', 'per', 'rel', 'slt', 'ste', 'sur'];
  normalized.system.skills = {};
  allSkills.forEach(skill => {
    normalized.system.skills[skill] = {
      value: 0,
      ability: getSkillAbility(skill),
      bonuses: { check: '', passive: '' }
    };
  });

  // Applica skill specifiche
  if (data.abilita) {
    Object.entries(data.abilita).forEach(([skillName, bonus]) => {
      const mappedSkill = skillMap[skillName.toLowerCase()];
      if (mappedSkill && normalized.system.skills[mappedSkill]) {
        const bonusValue = parseInt(bonus.replace(/[^0-9-]/g, '')) || 0;
        const prof = Math.floor((bonusValue - getAbilityMod(normalized.system.abilities[getSkillAbility(mappedSkill)].value)) / 2);
        normalized.system.skills[mappedSkill].value = Math.max(0, prof);
      }
    });
  }

  // Aggiungi tratti come item feat
  if (data.tratti && Array.isArray(data.tratti)) {
    data.tratti.forEach((tratto, index) => {
      const featId = `${id}trait${index}`;
      normalized.items.push({
        _id: featId,
        _key: `!items!${featId}`,
        name: tratto.nome,
        type: 'feat',
        img: 'icons/skills/melee/strike-slashes-red.webp',
        system: {
          description: {
            value: `<p>${tratto.descrizione}</p>`,
            chat: '',
            unidentified: ''
          },
          source: '',
          activation: { type: '', cost: null, condition: '' },
          duration: { value: '', units: '' },
          target: { value: null, width: null, units: '', type: '' },
          range: { value: null, long: null, units: '' },
          uses: { value: null, max: '', per: null, recovery: '' },
          type: { value: 'monster', subtype: '' }
        }
      });
    });
  }

  // Aggiungi azioni come item weapon/feat
  if (data.azioni && Array.isArray(data.azioni)) {
    data.azioni.forEach((azione, index) => {
      const actionId = `${id}action${index}`;
      const isWeapon = azione.tipo && azione.tipo.includes('Attacco');

      normalized.items.push({
        _id: actionId,
        _key: `!items!${actionId}`,
        name: azione.nome,
        type: isWeapon ? 'weapon' : 'feat',
        img: isWeapon ? 'icons/weapons/swords/sword-guard-purple.webp' : 'icons/skills/melee/strike-slashes-red.webp',
        system: createActionSystem(azione, isWeapon)
      });
    });
  }

  return normalized;
}

/**
 * Crea system per un'azione
 */
function createActionSystem(azione, isWeapon) {
  const base = {
    description: {
      value: `<p>${azione.descrizione || ''}</p>`,
      chat: '',
      unidentified: ''
    },
    source: '',
    activation: { type: 'action', cost: 1, condition: '' },
    duration: { value: '', units: '' },
    target: { value: 1, width: null, units: '', type: 'creature' },
    range: { value: 5, long: null, units: 'ft' }
  };

  if (isWeapon) {
    // Parse bonus attacco
    const attackBonus = parseInt(azione.bonus_attacco?.replace(/[^0-9-]/g, '')) || 0;

    // Parse danno
    let damageParts = [];
    if (azione.danno) {
      const damageMatch = azione.danno.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)/);
      if (damageMatch) {
        const damageType = azione.danno.includes('contundent') ? 'bludgeoning' :
                          azione.danno.includes('perforant') ? 'piercing' :
                          azione.danno.includes('tagliente') ? 'slashing' : 'bludgeoning';
        damageParts.push([damageMatch[1], damageType]);
      }
    }

    return {
      ...base,
      quantity: 1,
      weight: 0,
      price: { value: 0, denomination: 'gp' },
      attunement: 0,
      equipped: true,
      rarity: '',
      identified: true,
      ability: 'str',
      actionType: azione.tipo?.includes('Distanza') ? 'rwak' : 'mwak',
      attackBonus: attackBonus > 0 ? `${attackBonus}` : '',
      damage: { parts: damageParts, versatile: '' },
      weaponType: 'natural',
      properties: {},
      proficient: true
    };
  }

  return {
    ...base,
    type: { value: 'monster', subtype: '' },
    uses: { value: null, max: '', per: null, recovery: '' }
  };
}

/**
 * Ottieni l'abilità per una skill
 */
function getSkillAbility(skill) {
  const skillAbilities = {
    'acr': 'dex', 'ani': 'wis', 'arc': 'int', 'ath': 'str',
    'dec': 'cha', 'his': 'int', 'ins': 'wis', 'inti': 'cha',
    'inv': 'int', 'med': 'wis', 'nat': 'int', 'prc': 'wis',
    'prf': 'cha', 'per': 'cha', 'rel': 'int', 'slt': 'dex',
    'ste': 'dex', 'sur': 'wis'
  };
  return skillAbilities[skill] || 'str';
}

/**
 * Calcola modificatore abilità
 */
function getAbilityMod(score) {
  return Math.floor((score - 10) / 2);
}

/**
 * Normalizza un item generico
 */
function normalizeItem(data, filePath, itemType) {
  const id = generateFoundryId(filePath, itemType);
  const collection = 'items';

  const normalized = {
    _id: id,
    _key: `!${collection}!${id}`,
    name: data.nome || data.name || 'Item Senza Nome',
    type: itemType,
    img: getItemIcon(itemType),
    system: {
      description: {
        value: data.descrizione ? `<p>${data.descrizione}</p>` : '',
        chat: '',
        unidentified: '',
        richTooltip: {
          content: data.descrizione ? `<p>${data.descrizione.substring(0, 200)}...</p>` : '',
          flavor: ''
        }
      },
      source: data.fonte || 'Brancalonia',
      activation: { type: '', cost: null, condition: '' },
      duration: { value: '', units: '' },
      target: { value: null, width: null, units: '', type: '' },
      range: { value: null, long: null, units: '' },
      uses: { value: null, max: '', per: null, recovery: '' }
    },
    effects: [],
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: {
      brancalonia: {
        fonte: data.fonte,
        meccaniche: data.meccaniche_brancalonia || {},
        note: data.note || {},
        id_originale: data.id
      }
    }
  };

  // Aggiungi campi specifici per tipo
  if (itemType === 'spell') {
    normalized.system.level = data.livello || 0;
    normalized.system.school = data.scuola || '';
    normalized.system.components = {
      vocal: data.componenti?.includes('V') || false,
      somatic: data.componenti?.includes('S') || false,
      material: data.componenti?.includes('M') || false,
      ritual: data.rituale || false,
      concentration: data.concentrazione || false
    };
    normalized.system.materials = { value: data.materiali || '', consumed: false, cost: 0, supply: 0 };
    normalized.system.preparation = { mode: 'prepared', prepared: false };
    normalized.system.scaling = { mode: 'none', formula: '' };
  }

  if (itemType === 'weapon') {
    normalized.system.quantity = 1;
    normalized.system.weight = data.peso || 0;
    normalized.system.price = { value: data.prezzo || 0, denomination: 'gp' };
    normalized.system.damage = { parts: [], versatile: '' };
    normalized.system.weaponType = data.tipo_arma || 'simpleM';
    normalized.system.properties = {};
    normalized.system.proficient = true;
  }

  if (itemType === 'feat') {
    normalized.system.type = { value: data.tipo_talento || '', subtype: '' };
    normalized.system.requirements = data.prerequisiti || '';
    normalized.system.recharge = { value: null, charged: false };
  }

  return normalized;
}

/**
 * Ottieni icona per tipo item
 */
function getItemIcon(itemType) {
  const iconMap = {
    'spell': 'icons/magic/light/orb-lightbulb-gray.webp',
    'feat': 'icons/skills/yellow/affinity-puzzle.webp',
    'weapon': 'icons/weapons/swords/sword-guard-purple.webp',
    'equipment': 'icons/equipment/chest/breastplate-metal-copper.webp',
    'background': 'icons/skills/trades/academics-study-reading-book.webp',
    'race': 'icons/environment/people/group.webp',
    'class': 'icons/skills/melee/weapons-crossed-swords-yellow.webp',
    'subclass': 'icons/skills/melee/weapons-crossed-swords-blue.webp'
  };
  return iconMap[itemType] || 'icons/svg/item-bag.svg';
}

/**
 * Normalizza un journal entry
 */
function normalizeJournal(data, filePath) {
  const id = generateFoundryId(filePath, 'journal');

  return {
    _id: id,
    _key: `!journal!${id}`,
    name: data.titolo || data.nome || 'Regola Senza Nome',
    img: 'icons/svg/book.svg',
    pages: [{
      _id: `${id}page1`,
      name: data.titolo || data.nome || 'Pagina',
      type: 'text',
      text: {
        format: 1,
        content: data.contenuto || data.descrizione || ''
      },
      title: { show: true, level: 1 },
      src: null,
      system: {},
      sort: 0,
      ownership: { default: 0 },
      flags: {}
    }],
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: {
      brancalonia: {
        fonte: data.fonte,
        categoria: data.categoria,
        id_originale: data.id
      }
    }
  };
}

/**
 * Processa un file
 */
async function processFile(filePath, category) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    stats.processed++;

    // Determina mappatura
    const mapping = CATEGORY_MAPPING[category];
    if (!mapping) {
      console.warn(`⚠️  Nessuna mappatura per categoria: ${category}`);
      stats.skipped++;
      return;
    }

    let normalized;

    // Normalizza in base al tipo
    if (mapping.type === 'npc') {
      normalized = normalizeCreature(data, filePath);
    } else if (mapping.type === 'journal') {
      normalized = normalizeJournal(data, filePath);
    } else {
      normalized = normalizeItem(data, filePath, mapping.type);
    }

    // Salva file normalizzato
    const outputDir = path.join(CONFIG.PACKS_PATH, mapping.pack, '_source');
    const outputFile = path.join(outputDir, path.basename(filePath));

    if (!CONFIG.DRY_RUN) {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(outputFile, JSON.stringify(normalized, null, 2));
    }

    if (CONFIG.VERBOSE) {
      console.log(`✅ ${path.basename(filePath)} → ${mapping.pack}/_source/`);
    }

    stats.normalized++;

  } catch (error) {
    console.error(`❌ Errore in ${filePath}: ${error.message}`);
    stats.errors.push({ file: filePath, error: error.message });
  }
}

/**
 * Processa una directory ricorsivamente
 */
async function processDirectory(dirPath, category = '') {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      // Determina nuova categoria
      const newCategory = category ? `${category}/${file}` : file;
      await processDirectory(fullPath, newCategory);
    } else if (file.endsWith('.json') && !file.startsWith('index')) {
      await processFile(fullPath, category);
    }
  }
}

/**
 * Backup dei pack esistenti
 */
function backupExistingPacks() {
  if (!CONFIG.DRY_RUN && fs.existsSync(CONFIG.PACKS_PATH)) {
    console.log('📦 Backup dei pack esistenti...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(CONFIG.BACKUP_PATH, `packs_${timestamp}`);

    if (!fs.existsSync(CONFIG.BACKUP_PATH)) {
      fs.mkdirSync(CONFIG.BACKUP_PATH, { recursive: true });
    }

    // Copia ricorsiva dei pack
    copyRecursive(CONFIG.PACKS_PATH, backupPath);
    console.log(`✅ Backup salvato in: ${backupPath}`);
  }
}

/**
 * Copia ricorsiva
 */
function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

/**
 * Main
 */
async function main() {
  console.log('🔧 Normalizzazione Database Brancalonia v2.0');
  console.log('============================================');

  if (CONFIG.DRY_RUN) {
    console.log('⚠️  MODALITÀ DRY RUN - Nessun file verrà modificato\n');
  }

  // Backup
  backupExistingPacks();

  // Processa database
  console.log('\n📊 Elaborazione database...\n');
  await processDirectory(CONFIG.DATABASE_PATH);

  // Report
  console.log('\n📈 REPORT NORMALIZZAZIONE');
  console.log('========================');
  console.log(`✅ File processati: ${stats.processed}`);
  console.log(`✅ File normalizzati: ${stats.normalized}`);
  console.log(`⚠️  File saltati: ${stats.skipped}`);
  console.log(`❌ Errori: ${stats.errors.length}`);

  if (stats.errors.length > 0 && CONFIG.VERBOSE) {
    console.log('\n❌ DETTAGLIO ERRORI:');
    stats.errors.forEach(err => {
      console.log(`  - ${err.file}: ${err.error}`);
    });
  }

  if (!CONFIG.DRY_RUN) {
    console.log('\n✅ Normalizzazione completata!');
    console.log('📁 File normalizzati salvati in:', CONFIG.PACKS_PATH);
    console.log('\nProssimi passi:');
    console.log('1. Esegui: node scripts/validate-normalized.js');
    console.log('2. Esegui: npm run build:packs');
    console.log('3. Testa in Foundry VTT');
  }
}

// Gestione argomenti
if (process.argv.includes('--help')) {
  console.log(`
Utilizzo: node scripts/normalize-database-v2.js [opzioni]

Opzioni:
  --dry-run    Simula l'esecuzione senza modificare file
  --verbose    Mostra output dettagliato
  --help       Mostra questo messaggio

Esempio:
  node scripts/normalize-database-v2.js --dry-run --verbose
  `);
  process.exit(0);
}

// Esegui
main().catch(console.error);