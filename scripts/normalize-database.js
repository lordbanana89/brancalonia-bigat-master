#!/usr/bin/env node

/**
 * Script di normalizzazione database Brancalonia per Foundry VTT v13
 * Converte i file JSON dal database generico al formato Foundry dnd5e v5.1.9
 */

const fs = require('fs');
const path = require('path');

// Configurazione percorsi
const DATABASE_PATH = '/Users/erik/Desktop/brancalonia-bigat-master/database';
const PACKS_PATH = '/Users/erik/Desktop/brancalonia-bigat-master/packs';

// Mappatura tipi documento per _key
const DOCUMENT_TYPES = {
  'creature': 'actors',
  'png': 'actors',
  'razze': 'items',
  'classi': 'items',
  'backgrounds': 'items',
  'talenti': 'items',
  'emeriticenze': 'items',
  'equipaggiamento': 'items',
  'incantesimi': 'items',
  'regole': 'journal',
  'tabelle': 'tables'
};

// Template base per documenti Foundry
const FOUNDRY_TEMPLATES = {
  actor: {
    _id: '',
    _key: '',
    name: '',
    type: 'npc',
    img: 'icons/svg/mystery-man.svg',
    system: {
      abilities: {},
      attributes: {},
      details: {},
      traits: {},
      currency: {},
      skills: {},
      spells: {},
      bonuses: {},
      resources: {}
    },
    prototypeToken: {
      name: '',
      displayName: 0,
      actorLink: false,
      width: 1,
      height: 1,
      randomImg: false
    },
    items: [],
    effects: [],
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: {}
  },

  item: {
    _id: '',
    _key: '',
    name: '',
    type: 'feat',
    img: 'icons/svg/item-bag.svg',
    system: {
      description: {
        value: '',
        chat: '',
        unidentified: '',
        richTooltip: {
          content: '',
          flavor: ''
        }
      },
      source: 'Brancalonia',
      activation: {
        type: '',
        cost: null,
        condition: ''
      },
      duration: {
        value: '',
        units: ''
      },
      target: {
        value: '',
        width: null,
        units: '',
        type: ''
      },
      range: {
        value: null,
        long: null,
        units: ''
      },
      uses: {
        value: null,
        max: '',
        per: null,
        recovery: ''
      },
      consume: {
        type: '',
        target: null,
        amount: null
      },
      ability: null,
      actionType: '',
      attackBonus: '',
      chatFlavor: '',
      critical: {
        threshold: null,
        damage: ''
      },
      damage: {
        parts: [],
        versatile: ''
      },
      formula: '',
      save: {
        ability: '',
        dc: null,
        scaling: 'spell'
      },
      requirements: '',
      recharge: {
        value: null,
        charged: false
      }
    },
    effects: [],
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: {}
  },

  journal: {
    _id: '',
    _key: '',
    name: '',
    img: 'icons/svg/book.svg',
    content: '',
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: {},
    pages: []
  }
};

/**
 * Genera un ID univoco per Foundry
 */
function generateFoundryId(prefix) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}_${timestamp}${random}`;
}

/**
 * Converte statistiche creature dal formato database a Foundry
 */
function convertCreatureToActor(creature) {
  const actor = JSON.parse(JSON.stringify(FOUNDRY_TEMPLATES.actor));

  actor._id = generateFoundryId(creature.id || 'creature');
  actor._key = `!actors!${actor._id}`;
  actor.name = creature.nome || 'Creatura Senza Nome';
  actor.type = 'npc';

  // Immagine
  if (creature.tipo) {
    const typeIcons = {
      'Mostruosità': 'systems/dnd5e/icons/skills/beast_04.jpg',
      'Immondo': 'systems/dnd5e/icons/skills/affliction_03.jpg',
      'Non morto': 'systems/dnd5e/icons/skills/shadow_01.jpg',
      'Drago': 'systems/dnd5e/icons/skills/beast_02.jpg',
      'Bestia': 'systems/dnd5e/icons/skills/beast_01.jpg',
      'Umanoide': 'systems/dnd5e/icons/skills/yellow_21.jpg'
    };
    actor.img = typeIcons[creature.tipo] || 'icons/svg/mystery-man.svg';
  }

  // Caratteristiche
  if (creature.caratteristiche) {
    actor.system.abilities = {
      str: { value: creature.caratteristiche.forza || 10 },
      dex: { value: creature.caratteristiche.destrezza || 10 },
      con: { value: creature.caratteristiche.costituzione || 10 },
      int: { value: creature.caratteristiche.intelligenza || 10 },
      wis: { value: creature.caratteristiche.saggezza || 10 },
      cha: { value: creature.caratteristiche.carisma || 10 }
    };
  }

  // Attributi
  actor.system.attributes = {
    ac: {
      flat: creature.classe_armatura?.valore || 10,
      calc: 'flat',
      formula: ''
    },
    hp: {
      value: creature.punti_ferita?.valore || 1,
      max: creature.punti_ferita?.valore || 1,
      temp: 0,
      tempmax: 0,
      formula: creature.punti_ferita?.formula || ''
    },
    init: {
      value: 0,
      bonus: 0
    },
    movement: {
      walk: parseInt(creature.velocita?.camminare) || 30,
      swim: parseInt(creature.velocita?.nuotare) || 0,
      fly: parseInt(creature.velocita?.volare) || 0,
      climb: parseInt(creature.velocita?.scalare) || 0,
      burrow: parseInt(creature.velocita?.scavare) || 0,
      hover: false
    },
    senses: {
      darkvision: parseInt(creature.sensi?.scurovisione) || 0,
      blindsight: parseInt(creature.sensi?.vista_cieca) || 0,
      tremorsense: 0,
      truesight: 0,
      special: creature.sensi?.percezione_passiva ? `Percezione Passiva ${creature.sensi.percezione_passiva}` : ''
    }
  };

  // Dettagli
  actor.system.details = {
    biography: {
      value: creature.descrizione || '',
      public: ''
    },
    alignment: creature.allineamento || '',
    race: creature.tipo || '',
    type: {
      value: creature.tipo?.toLowerCase() || 'humanoid',
      subtype: '',
      swarm: '',
      custom: ''
    },
    cr: parseFloat(creature.grado_sfida) || 0,
    xp: {
      value: creature.punti_esperienza || 0
    },
    source: creature.fonte || 'Brancalonia'
  };

  // Tratti e resistenze
  if (creature.resistenze || creature.immunita) {
    actor.system.traits = {
      size: getSizeCode(creature.taglia),
      dr: { value: parseResistances(creature.resistenze?.danni) },
      di: { value: parseResistances(creature.immunita?.danni) },
      dv: { value: [] },
      ci: { value: parseResistances(creature.immunita?.condizioni) },
      languages: {
        value: parseLanguages(creature.linguaggi),
        custom: ''
      }
    };
  }

  return actor;
}

/**
 * Converte taglia in codice dnd5e
 */
function getSizeCode(taglia) {
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
 * Parsifica resistenze/immunità
 */
function parseResistances(resString) {
  if (!resString) return [];
  return resString.split(',').map(r => r.trim().toLowerCase());
}

/**
 * Parsifica linguaggi
 */
function parseLanguages(langString) {
  if (!langString || langString === '-') return [];
  return langString.split(',').map(l => l.trim().toLowerCase());
}

/**
 * Converte item generico in formato Foundry
 */
function convertGenericItem(item, type = 'feat') {
  const foundryItem = JSON.parse(JSON.stringify(FOUNDRY_TEMPLATES.item));

  foundryItem._id = generateFoundryId(item.id || type);
  foundryItem._key = `!items!${foundryItem._id}`;
  foundryItem.name = item.nome || 'Item Senza Nome';
  foundryItem.type = type;

  // Descrizione e tooltip
  const description = item.descrizione || '';
  foundryItem.system.description.value = `<p>${description}</p>`;
  foundryItem.system.description.richTooltip.content = `<p>${description.substring(0, 200)}...</p>`;

  // Fonte
  foundryItem.system.source = item.fonte || 'Brancalonia';

  return foundryItem;
}

/**
 * Processa directory e converte file
 */
function processDirectory(dirPath, outputDir, converter) {
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath);
  const outputPath = path.join(PACKS_PATH, outputDir, '_source');

  // Crea directory output se non esiste
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  files.forEach(file => {
    if (!file.endsWith('.json')) return;

    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      processDirectory(filePath, outputDir, converter);
    } else {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const converted = converter(data);

        if (converted) {
          const outputFile = path.join(outputPath, file);
          fs.writeFileSync(outputFile, JSON.stringify(converted, null, 2));
          console.log(`✅ Convertito: ${file}`);
        }
      } catch (error) {
        console.error(`❌ Errore conversione ${file}:`, error.message);
      }
    }
  });
}

/**
 * Main
 */
function main() {
  console.log('🔧 Normalizzazione Database Brancalonia per Foundry VTT v13');
  console.log('================================================');

  // Converti creature
  console.log('\n📦 Conversione Creature...');
  processDirectory(
    path.join(DATABASE_PATH, 'creature/creature_base'),
    'creature',
    (data) => convertCreatureToActor(data)
  );

  processDirectory(
    path.join(DATABASE_PATH, 'creature/png_base'),
    'png',
    (data) => convertCreatureToActor(data)
  );

  // Converti equipaggiamento
  console.log('\n📦 Conversione Equipaggiamento...');
  processDirectory(
    path.join(DATABASE_PATH, 'equipaggiamento'),
    'equipaggiamento-new',
    (data) => convertGenericItem(data, 'weapon')
  );

  // Converti talenti
  console.log('\n📦 Conversione Talenti...');
  processDirectory(
    path.join(DATABASE_PATH, 'talenti'),
    'talenti-new',
    (data) => convertGenericItem(data, 'feat')
  );

  console.log('\n✅ Normalizzazione completata!');
  console.log('📁 File convertiti salvati in:', PACKS_PATH);
}

// Esegui
main();