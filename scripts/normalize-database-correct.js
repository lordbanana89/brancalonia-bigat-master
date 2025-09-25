#!/usr/bin/env node

/**
 * Script di normalizzazione database Brancalonia per Foundry VTT v13
 * Versione corretta basata sulla struttura reale del database
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configurazione - usa percorsi relativi
const CONFIG = {
  DATABASE_PATH: path.resolve(process.cwd(), 'database'),
  PACKS_PATH: path.resolve(process.cwd(), 'packs'),
  OUTPUT_PATH: path.resolve(process.cwd(), 'packs_normalized'),
  DRY_RUN: process.argv.includes('--dry-run'),
  VERBOSE: process.argv.includes('--verbose')
};

// Mappatura reale basata sulla struttura effettiva del database
const MAPPING_RULES = [
  // Backgrounds
  { pattern: /^backgrounds\//, pack: 'backgrounds', type: 'background', converter: 'item' },

  // Razze e tratti
  { pattern: /^razze\/[^\/]+\/tratti\//, pack: 'brancalonia-features', type: 'feat', converter: 'racialTrait' },
  { pattern: /^razze\/[^\/]+\/(sottorazze|varianti)\//, pack: 'razze', type: 'race', converter: 'item' },
  { pattern: /^razze\/[^\/]+\.json$/, pack: 'razze', type: 'race', converter: 'item' },

  // Classi e privilegi
  { pattern: /^classi\/[^\/]+\/privilegi_generali\//, pack: 'brancalonia-features', type: 'feat', converter: 'classFeature' },
  { pattern: /^classi\/[^\/]+\/privilegi\//, pack: 'brancalonia-features', type: 'feat', converter: 'classFeature' },
  { pattern: /^classi\/[^\/]+\/cammini\//, pack: 'sottoclassi', type: 'subclass', converter: 'item' },
  { pattern: /^classi\/[^\/]+\/progressione\//, skip: true }, // Skip progression files
  { pattern: /^classi\/[^\/]+\.json$/, pack: 'classi', type: 'class', converter: 'item' },

  // Sottoclassi
  { pattern: /^sottoclassi\//, pack: 'sottoclassi', type: 'subclass', converter: 'item' },

  // Talenti ed Emeriticenze
  { pattern: /^talenti\//, pack: 'talenti', type: 'feat', converter: 'item' },
  { pattern: /^emeriticenze\//, pack: 'emeriticenze', type: 'feat', converter: 'item' },

  // Equipaggiamento
  { pattern: /^equipaggiamento\/armi\//, pack: 'equipaggiamento', type: 'weapon', converter: 'weapon' },
  { pattern: /^equipaggiamento\/armi_standard\//, pack: 'equipaggiamento', type: 'weapon', converter: 'weapon' },
  { pattern: /^equipaggiamento\/armature\//, pack: 'equipaggiamento', type: 'equipment', converter: 'armor' },
  { pattern: /^equipaggiamento\/armature_standard\//, pack: 'equipaggiamento', type: 'equipment', converter: 'armor' },
  { pattern: /^equipaggiamento\/cimeli\//, pack: 'equipaggiamento', type: 'equipment', converter: 'magicItem' },
  { pattern: /^equipaggiamento\/intrugli\//, pack: 'equipaggiamento', type: 'consumable', converter: 'consumable' },
  { pattern: /^equipaggiamento\/oggetti_comuni\//, pack: 'equipaggiamento', type: 'equipment', converter: 'equipment' },
  { pattern: /^equipaggiamento\/animali\//, pack: 'equipaggiamento', type: 'loot', converter: 'equipment' },

  // Incantesimi
  { pattern: /^incantesimi\/base\//, pack: 'incantesimi', type: 'spell', converter: 'spellReference' },
  { pattern: /^incantesimi\/livello_\d+\//, pack: 'incantesimi', type: 'spell', converter: 'spell' },

  // Creature e PNG
  { pattern: /^creature\/creature_base\//, pack: 'npc', type: 'npc', converter: 'creature' },
  { pattern: /^creature\/png_base\//, pack: 'npc', type: 'npc', converter: 'creature' },
  { pattern: /^creature\/creature_macaronicon\//, pack: 'npc', type: 'npc', converter: 'creature' },
  { pattern: /^creature\/png_macaronicon\//, pack: 'npc', type: 'npc', converter: 'creature' },

  // Regole
  { pattern: /^regole\//, pack: 'regole', type: 'journal', converter: 'journal' },

  // Tabelle
  { pattern: /^tabelle\//, pack: 'rollable-tables', type: 'table', converter: 'table' },

  // Macaronicon duplicati - skip per ora
  { pattern: /^macaronicon\//, skip: true },

  // Skip index e dettagli
  { pattern: /index\.json$/, skip: true },
  { pattern: /dettagli\//, skip: true },
  { pattern: /validazione\//, skip: true }
];

// Statistiche
const stats = {
  processed: 0,
  converted: 0,
  skipped: 0,
  errors: []
};

/**
 * Trova la regola di mappatura per un file
 */
function findMappingRule(relativePath) {
  for (const rule of MAPPING_RULES) {
    if (rule.pattern.test(relativePath)) {
      return rule;
    }
  }
  return null;
}

/**
 * Genera ID Foundry deterministico
 */
function generateFoundryId(filePath) {
  const fileName = path.basename(filePath, '.json')
    .replace(/^\d+[-_]/, '') // Rimuovi prefissi numerici
    .replace(/[^a-zA-Z0-9]/g, ''); // Rimuovi caratteri speciali

  const hash = crypto.createHash('md5')
    .update(filePath)
    .digest('hex')
    .substring(0, 6);

  return `${fileName}${hash}`;
}

/**
 * Conversione base per item generico
 */
function convertBaseItem(data, filePath, itemType) {
  const id = generateFoundryId(filePath);
  const collection = getCollection(itemType);

  return {
    _id: id,
    _key: `!${collection}!${id}`,
    name: data.nome || data.name || 'Item Senza Nome',
    type: itemType,
    img: getDefaultImage(itemType),
    system: {
      description: {
        value: data.descrizione ? `<p>${data.descrizione}</p>` : '',
        chat: '',
        unidentified: ''
      },
      source: data.fonte?.manuale || 'Brancalonia',
      activation: { type: '', cost: null, condition: '' },
      duration: { value: '', units: '' },
      target: { value: null, width: null, units: '', type: '' },
      range: { value: null, long: null, units: '' },
      uses: { value: null, max: '', per: null, recovery: '' }
    },
    effects: [],
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {
      brancalonia: {
        id_originale: data.id,
        fonte: data.fonte,
        validazione: data.validazione,
        note: data.note || data.note_meccaniche || data.note_brancalonia
      }
    }
  };
}

/**
 * Converte un'arma
 */
function convertWeapon(data, filePath) {
  const item = convertBaseItem(data, filePath, 'weapon');

  // Parse damage
  let damageParts = [];
  if (data.danni) {
    const match = data.danni.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)\s*(\w+)/);
    if (match) {
      const damageType = match[2].includes('perforant') ? 'piercing' :
                        match[2].includes('tagliente') ? 'slashing' :
                        match[2].includes('contundent') ? 'bludgeoning' : 'bludgeoning';
      damageParts.push([match[1], damageType]);
    }
  }

  // Determina tipo arma
  const isRanged = data.proprieta?.includes('Distanza') || data.gittata;
  const isMartial = data.categoria?.includes('marziale');

  Object.assign(item.system, {
    quantity: 1,
    weight: parseFloat(data.peso) || 0,
    price: { value: parseCost(data.costo), denomination: 'gp' },
    damage: { parts: damageParts, versatile: '' },
    weaponType: isRanged ? (isMartial ? 'martialR' : 'simpleR') :
                          (isMartial ? 'martialM' : 'simpleM'),
    properties: parseWeaponProperties(data.proprieta),
    proficient: true,
    equipped: false,
    rarity: '',
    identified: true,
    actionType: isRanged ? 'rwak' : 'mwak',
    ability: ''
  });

  if (data.gittata) {
    const ranges = data.gittata.match(/(\d+)\/(\d+)/);
    if (ranges) {
      item.system.range = { value: parseInt(ranges[1]), long: parseInt(ranges[2]), units: 'ft' };
    }
  }

  return item;
}

/**
 * Converte un'armatura
 */
function convertArmor(data, filePath) {
  const item = convertBaseItem(data, filePath, 'equipment');

  Object.assign(item.system, {
    quantity: 1,
    weight: parseFloat(data.peso) || 0,
    price: { value: parseCost(data.costo), denomination: 'gp' },
    armor: {
      value: parseInt(data.classe_armatura) || 10,
      type: getArmorType(data),
      dex: getDexBonus(data)
    },
    equipped: false,
    rarity: '',
    identified: true,
    type: { value: 'armor', subtype: getArmorType(data) }
  });

  return item;
}

/**
 * Converte una creatura
 */
function convertCreature(data, filePath) {
  const id = generateFoundryId(filePath);

  const creature = {
    _id: id,
    _key: `!actors!${id}`,
    name: data.nome || data.name || 'Creatura',
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
          walk: parseSpeed(data.velocita?.camminare),
          swim: parseSpeed(data.velocita?.nuotare),
          fly: parseSpeed(data.velocita?.volare),
          climb: parseSpeed(data.velocita?.scalare),
          burrow: parseSpeed(data.velocita?.scavare),
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
          value: convertCreatureType(data.tipo),
          subtype: '',
          swarm: data.tipo === 'Sciame' ? 'tiny' : '',
          custom: ''
        },
        environment: '',
        cr: parseFloat(data.grado_sfida) || 0,
        spellLevel: 0,
        xp: { value: data.punti_esperienza || 0 },
        source: data.fonte || 'Brancalonia'
      },
      traits: {
        size: convertSize(data.taglia),
        di: { value: [], custom: '' },
        dr: { value: [], custom: '' },
        dv: { value: [], custom: '' },
        ci: { value: [], custom: '' },
        languages: {
          value: parseLanguages(data.linguaggi),
          custom: ''
        }
      },
      currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
      skills: generateSkills(data.abilita)
    },
    items: [],
    effects: [],
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {
      brancalonia: {
        id_originale: data.id,
        fonte: data.fonte,
        note: data.note_brancalonia
      }
    }
  };

  // Aggiungi caratteristiche
  if (data.caratteristiche) {
    creature.system.abilities = {
      str: createAbility(data.caratteristiche.forza),
      dex: createAbility(data.caratteristiche.destrezza),
      con: createAbility(data.caratteristiche.costituzione),
      int: createAbility(data.caratteristiche.intelligenza),
      wis: createAbility(data.caratteristiche.saggezza),
      cha: createAbility(data.caratteristiche.carisma)
    };
  }

  // Aggiungi tratti e azioni come items
  if (data.tratti) {
    data.tratti.forEach((tratto, i) => {
      const traitId = `${id}trait${i}`;
      creature.items.push(createFeatureItem(traitId, tratto.nome, tratto.descrizione, 'monster'));
    });
  }

  if (data.azioni) {
    data.azioni.forEach((azione, i) => {
      const actionId = `${id}action${i}`;
      if (azione.tipo?.includes('Attacco')) {
        creature.items.push(createWeaponItem(actionId, azione));
      } else {
        creature.items.push(createFeatureItem(actionId, azione.nome, azione.descrizione, 'action'));
      }
    });
  }

  return creature;
}

/**
 * Converte incantesimo
 */
function convertSpell(data, filePath) {
  const item = convertBaseItem(data, filePath, 'spell');

  Object.assign(item.system, {
    level: data.livello || 0,
    school: convertSpellSchool(data.scuola),
    components: {
      vocal: data.componenti?.verbale || false,
      somatic: data.componenti?.somatica || false,
      material: data.componenti?.materiale || false,
      ritual: data.rituale || false,
      concentration: data.concentrazione || false
    },
    materials: { value: data.materiali || '', consumed: false, cost: 0, supply: 0 },
    preparation: { mode: 'prepared', prepared: false },
    scaling: { mode: 'none', formula: '' },
    activation: {
      type: convertActivationType(data.tempo_lancio),
      cost: 1,
      condition: ''
    },
    duration: convertDuration(data.durata),
    range: convertRange(data.gittata),
    target: convertTarget(data.bersaglio)
  });

  return item;
}

// Helper functions

function getCollection(type) {
  const map = {
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
    'consumable': 'items',
    'loot': 'items',
    'tool': 'items',
    'journal': 'journal',
    'table': 'tables'
  };
  return map[type] || 'items';
}

function getDefaultImage(type) {
  const images = {
    'weapon': 'icons/weapons/swords/sword-guard-purple.webp',
    'equipment': 'icons/equipment/chest/breastplate-metal-copper.webp',
    'spell': 'icons/magic/light/orb-lightbulb-gray.webp',
    'feat': 'icons/skills/yellow/affinity-puzzle.webp',
    'background': 'icons/skills/trades/academics-study-reading-book.webp',
    'race': 'icons/environment/people/group.webp',
    'class': 'icons/skills/melee/weapons-crossed-swords-yellow.webp',
    'subclass': 'icons/skills/melee/weapons-crossed-swords-blue.webp',
    'npc': 'icons/svg/mystery-man.svg',
    'consumable': 'icons/consumables/potions/bottle-round-corked-red.webp'
  };
  return images[type] || 'icons/svg/item-bag.svg';
}

function parseCost(costString) {
  if (!costString) return 0;
  const match = costString.match(/(\d+)\s*(mo|ma|mr|gp|sp|cp)/);
  if (match) {
    const value = parseInt(match[1]);
    const currency = match[2];
    // Converti in GP
    if (currency === 'mo' || currency === 'gp') return value;
    if (currency === 'ma' || currency === 'sp') return value / 10;
    if (currency === 'mr' || currency === 'cp') return value / 100;
  }
  return 0;
}

function parseSpeed(speedString) {
  if (!speedString) return 0;
  const meters = parseInt(speedString.replace(/[^0-9]/g, ''));
  if (isNaN(meters)) return 0;
  return Math.round(meters * 3.28084 / 5) * 5; // Converti metri in piedi
}

function convertSize(taglia) {
  const map = {
    'Minuscola': 'tiny',
    'Piccola': 'sm',
    'Media': 'med',
    'Grande': 'lg',
    'Enorme': 'huge',
    'Mastodontica': 'grg'
  };
  return map[taglia] || 'med';
}

function convertCreatureType(tipo) {
  if (!tipo) return 'humanoid';
  const type = tipo.toLowerCase();
  if (type.includes('umanoide')) return 'humanoid';
  if (type.includes('bestia')) return 'beast';
  if (type.includes('non morto')) return 'undead';
  if (type.includes('immondo')) return 'fiend';
  if (type.includes('drago')) return 'dragon';
  if (type.includes('mostruosità')) return 'monstrosity';
  if (type.includes('sciame')) return 'swarm';
  return 'humanoid';
}

function parseLanguages(langString) {
  if (!langString || langString === '-') return [];
  return langString.split(',').map(l => l.trim().toLowerCase());
}

function parseWeaponProperties(propArray) {
  if (!propArray) return {};
  const props = {};
  propArray.forEach(prop => {
    const p = prop.toLowerCase();
    if (p.includes('due mani')) props.two = true;
    if (p.includes('pesante')) props.hvy = true;
    if (p.includes('leggera')) props.lgt = true;
    if (p.includes('finezza')) props.fin = true;
    if (p.includes('portata')) props.rch = true;
    if (p.includes('lancio')) props.thr = true;
    if (p.includes('versatile')) props.ver = true;
    if (p.includes('munizioni')) props.amm = true;
    if (p.includes('ricarica')) props.lod = true;
  });
  return props;
}

function getArmorType(data) {
  if (data.categoria?.includes('leggera')) return 'light';
  if (data.categoria?.includes('media')) return 'medium';
  if (data.categoria?.includes('pesante')) return 'heavy';
  if (data.categoria?.includes('scudo')) return 'shield';
  return 'light';
}

function getDexBonus(data) {
  const type = getArmorType(data);
  if (type === 'heavy') return 0;
  if (type === 'medium') return 2;
  return null;
}

function createAbility(value) {
  return {
    value: value || 10,
    proficient: 0,
    bonuses: { check: '', save: '' }
  };
}

function generateSkills(abilitaData) {
  const skills = {};
  const allSkills = ['acr', 'ani', 'arc', 'ath', 'dec', 'his', 'ins', 'inti',
                     'inv', 'med', 'nat', 'prc', 'prf', 'per', 'rel', 'slt',
                     'ste', 'sur'];

  allSkills.forEach(skill => {
    skills[skill] = {
      value: 0,
      ability: getSkillAbility(skill),
      bonuses: { check: '', passive: '' }
    };
  });

  // Mappa abilità italiane
  if (abilitaData) {
    const map = {
      'furtivita': 'ste',
      'percezione': 'prc',
      'atletica': 'ath',
      'inganno': 'dec'
    };

    Object.entries(abilitaData).forEach(([name, bonus]) => {
      const skill = map[name.toLowerCase()];
      if (skill) {
        skills[skill].value = 1; // Proficient
      }
    });
  }

  return skills;
}

function getSkillAbility(skill) {
  const map = {
    'acr': 'dex', 'ani': 'wis', 'arc': 'int', 'ath': 'str',
    'dec': 'cha', 'his': 'int', 'ins': 'wis', 'inti': 'cha',
    'inv': 'int', 'med': 'wis', 'nat': 'int', 'prc': 'wis',
    'prf': 'cha', 'per': 'cha', 'rel': 'int', 'slt': 'dex',
    'ste': 'dex', 'sur': 'wis'
  };
  return map[skill] || 'str';
}

function createFeatureItem(id, name, description, type = 'monster') {
  return {
    _id: id,
    _key: `!items!${id}`,
    name: name,
    type: 'feat',
    img: 'icons/skills/melee/strike-slashes-red.webp',
    system: {
      description: {
        value: `<p>${description || ''}</p>`,
        chat: '',
        unidentified: ''
      },
      source: '',
      activation: { type: type === 'action' ? 'action' : '', cost: null, condition: '' },
      duration: { value: '', units: '' },
      target: { value: null, width: null, units: '', type: '' },
      range: { value: null, long: null, units: '' },
      uses: { value: null, max: '', per: null, recovery: '' },
      type: { value: type, subtype: '' }
    }
  };
}

function createWeaponItem(id, azione) {
  const weapon = createFeatureItem(id, azione.nome, azione.descrizione, 'weapon');
  weapon.type = 'weapon';
  weapon.img = 'icons/weapons/swords/sword-guard-purple.webp';

  // Parse attack bonus
  const attackBonus = parseInt(azione.bonus_attacco?.replace(/[^0-9-]/g, '')) || 0;

  // Parse damage
  let damageParts = [];
  if (azione.danno) {
    const match = azione.danno.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)/);
    if (match) {
      const damageType = azione.danno.includes('contundent') ? 'bludgeoning' :
                        azione.danno.includes('perforant') ? 'piercing' :
                        azione.danno.includes('tagliente') ? 'slashing' : 'bludgeoning';
      damageParts.push([match[1], damageType]);
    }
  }

  Object.assign(weapon.system, {
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
  });

  return weapon;
}

function convertSpellSchool(school) {
  const map = {
    'Abiurazione': 'abj',
    'Ammaliamento': 'enc',
    'Divinazione': 'div',
    'Evocazione': 'evo',
    'Illusione': 'ill',
    'Invocazione': 'con',
    'Necromanzia': 'nec',
    'Trasmutazione': 'trs'
  };
  return map[school] || 'evo';
}

function convertActivationType(time) {
  if (!time) return 'action';
  const t = time.toLowerCase();
  if (t.includes('bonus')) return 'bonus';
  if (t.includes('reazione')) return 'reaction';
  if (t.includes('minuti')) return 'minute';
  if (t.includes('ore')) return 'hour';
  return 'action';
}

function convertDuration(duration) {
  if (!duration) return { value: '', units: '' };
  const d = duration.toLowerCase();
  if (d.includes('istantanea')) return { value: '', units: 'inst' };
  if (d.includes('concentrazione')) {
    const match = d.match(/(\d+)\s*(\w+)/);
    if (match) {
      const units = match[2].includes('minut') ? 'minute' :
                   match[2].includes('or') ? 'hour' :
                   match[2].includes('round') ? 'round' : 'minute';
      return { value: parseInt(match[1]), units };
    }
  }
  return { value: '', units: '' };
}

function convertRange(range) {
  if (!range) return { value: null, long: null, units: '' };
  const r = range.toLowerCase();
  if (r.includes('contatto')) return { value: null, long: null, units: 'touch' };
  if (r.includes('persona')) return { value: null, long: null, units: 'self' };
  const match = r.match(/(\d+)\s*metri/);
  if (match) {
    const feet = Math.round(parseInt(match[1]) * 3.28084 / 5) * 5;
    return { value: feet, long: null, units: 'ft' };
  }
  return { value: null, long: null, units: '' };
}

function convertTarget(target) {
  if (!target) return { value: null, width: null, units: '', type: '' };
  const t = target.toLowerCase();
  if (t.includes('creatur')) return { value: 1, width: null, units: '', type: 'creature' };
  if (t.includes('cubo')) {
    const match = t.match(/(\d+)/);
    if (match) {
      const feet = Math.round(parseInt(match[1]) * 3.28084 / 5) * 5;
      return { value: feet, width: null, units: 'ft', type: 'cube' };
    }
  }
  return { value: null, width: null, units: '', type: '' };
}

/**
 * Processa un singolo file
 */
async function processFile(filePath, relativePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    stats.processed++;

    const rule = findMappingRule(relativePath);

    if (!rule) {
      if (CONFIG.VERBOSE) {
        console.log(`⚠️  Nessuna regola per: ${relativePath}`);
      }
      stats.skipped++;
      return;
    }

    if (rule.skip) {
      stats.skipped++;
      return;
    }

    let converted;

    // Applica il converter appropriato
    switch (rule.converter) {
      case 'creature':
        converted = convertCreature(data, filePath);
        break;
      case 'weapon':
        converted = convertWeapon(data, filePath);
        break;
      case 'armor':
        converted = convertArmor(data, filePath);
        break;
      case 'spell':
        converted = convertSpell(data, filePath);
        break;
      case 'spellReference':
        // Skip spell references that point to dnd5e compendium
        stats.skipped++;
        return;
      default:
        converted = convertBaseItem(data, filePath, rule.type);
    }

    // Salva il file convertito
    const outputDir = path.join(CONFIG.OUTPUT_PATH, rule.pack, '_source');
    const outputFile = path.join(outputDir, path.basename(filePath));

    if (!CONFIG.DRY_RUN) {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(outputFile, JSON.stringify(converted, null, 2));
    }

    if (CONFIG.VERBOSE) {
      console.log(`✅ ${relativePath} → ${rule.pack}/_source/`);
    }

    stats.converted++;

  } catch (error) {
    console.error(`❌ Errore in ${relativePath}: ${error.message}`);
    stats.errors.push({ file: relativePath, error: error.message });
  }
}

/**
 * Processa directory ricorsivamente
 */
async function processDirectory(dirPath, baseDir = '') {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.join(baseDir, file).replace(/\\/g, '/');
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await processDirectory(fullPath, relativePath);
    } else if (file.endsWith('.json')) {
      await processFile(fullPath, relativePath);
    }
  }
}

/**
 * Main
 */
async function main() {
  console.log('🔧 Normalizzazione Database Brancalonia (Versione Corretta)');
  console.log('==========================================================\n');

  if (CONFIG.DRY_RUN) {
    console.log('⚠️  MODALITÀ DRY RUN - Nessun file verrà creato\n');
  }

  if (!fs.existsSync(CONFIG.DATABASE_PATH)) {
    console.error(`❌ Directory database non trovata: ${CONFIG.DATABASE_PATH}`);
    process.exit(1);
  }

  console.log(`📂 Database: ${CONFIG.DATABASE_PATH}`);
  console.log(`📦 Output: ${CONFIG.OUTPUT_PATH}\n`);

  // Processa il database
  await processDirectory(CONFIG.DATABASE_PATH);

  // Report
  console.log('\n📊 REPORT');
  console.log('=========');
  console.log(`📄 File processati: ${stats.processed}`);
  console.log(`✅ File convertiti: ${stats.converted}`);
  console.log(`⏭️  File saltati: ${stats.skipped}`);
  console.log(`❌ Errori: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ ERRORI:');
    stats.errors.slice(0, 10).forEach(err => {
      console.log(`  - ${err.file}: ${err.error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`  ... e altri ${stats.errors.length - 10} errori`);
    }
  }

  if (!CONFIG.DRY_RUN && stats.converted > 0) {
    console.log(`\n✅ Conversione completata!`);
    console.log(`📁 File salvati in: ${CONFIG.OUTPUT_PATH}`);
    console.log('\nProssimi passi:');
    console.log('1. Verifica i file convertiti');
    console.log('2. Copia in packs/ quando soddisfatto');
    console.log('3. Esegui build dei pack');
  }
}

// Help
if (process.argv.includes('--help')) {
  console.log(`
Utilizzo: node scripts/normalize-database-correct.js [opzioni]

Opzioni:
  --dry-run    Simula senza creare file
  --verbose    Output dettagliato
  --help       Mostra questo messaggio

Esempio:
  node scripts/normalize-database-correct.js --dry-run --verbose
  `);
  process.exit(0);
}

// Esegui
main().catch(console.error);