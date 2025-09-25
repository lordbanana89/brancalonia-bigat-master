#!/usr/bin/env node

/**
 * Script di integrazione contenuti database Brancalonia con packs esistenti
 * Normalizza e integra i dati mantenendo compatibilità con dnd5e v5.1.9
 */

const fs = require('fs');
const path = require('path');

// Path configurazione
const DATABASE_PATH = '/Users/erik/Desktop/brancalonia-bigat-master/database';
const PACKS_PATH = '/Users/erik/Desktop/brancalonia-bigat-master/packs';

/**
 * Genera ID univoco compatibile Foundry
 */
function generateFoundryId(prefix) {
  const timestamp = Date.now().toString(36).substring(-4);
  const random = Math.random().toString(36).substring(2, 5);
  return `${prefix}${timestamp}${random}`.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Aggiunge _key field richiesto da Foundry v13
 */
function addKeyField(doc, collection) {
  if (!doc._id) {
    doc._id = generateFoundryId(doc.id || doc.nome || 'item');
  }
  doc._key = `!${collection}!${doc._id}`;
  return doc;
}

/**
 * Normalizza creature dal database al formato NPC di dnd5e
 */
function normalizeCreatureToNPC(creature) {
  const npcId = generateFoundryId(creature.id || 'npc');

  // Calcola modificatori
  const getModifier = (score) => Math.floor((score - 10) / 2);

  const npc = {
    _id: npcId,
    _key: `!actors!${npcId}`,
    name: creature.nome || 'Creatura',
    type: 'npc',
    img: getCreatureImage(creature.tipo),
    system: {
      abilities: {},
      attributes: {},
      details: {},
      traits: {},
      skills: {},
      resources: {}
    },
    prototypeToken: {
      name: creature.nome,
      displayName: 20,
      actorLink: false,
      width: getTokenSize(creature.taglia),
      height: getTokenSize(creature.taglia),
      randomImg: false
    },
    items: [],
    effects: [],
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: {
      "brancalonia-bigat": {
        imported: true,
        sourceDatabase: true,
        originalData: {
          descrizione: creature.descrizione,
          fonte: creature.fonte,
          note: creature.note_brancalonia
        }
      }
    }
  };

  // Abilità (caratteristiche)
  if (creature.caratteristiche) {
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    const italianMap = {
      'str': 'forza',
      'dex': 'destrezza',
      'con': 'costituzione',
      'int': 'intelligenza',
      'wis': 'saggezza',
      'cha': 'carisma'
    };

    abilities.forEach(ability => {
      const value = creature.caratteristiche[italianMap[ability]] || 10;
      npc.system.abilities[ability] = {
        value: value,
        proficient: 0,
        mod: getModifier(value)
      };
    });
  }

  // Attributi
  npc.system.attributes = {
    ac: {
      flat: creature.classe_armatura?.valore || 10,
      calc: 'natural',
      formula: creature.classe_armatura?.tipo || ''
    },
    hp: {
      value: creature.punti_ferita?.valore || 1,
      max: creature.punti_ferita?.valore || 1,
      temp: 0,
      tempmax: 0,
      formula: creature.punti_ferita?.formula || '1d8'
    },
    init: {
      value: 0,
      bonus: 0
    },
    movement: parseMovement(creature.velocita),
    senses: parseSenses(creature.sensi),
    spellcasting: '',
    prof: getProficiencyBonus(creature.grado_sfida)
  };

  // Dettagli
  npc.system.details = {
    biography: {
      value: formatDescription(creature),
      public: ''
    },
    alignment: creature.allineamento || '',
    race: '',
    type: {
      value: getCreatureType(creature.tipo),
      subtype: '',
      swarm: creature.tipo === 'Sciame' ? getSwarmSize(creature.taglia) : '',
      custom: creature.tipo || ''
    },
    environment: '',
    cr: parseCR(creature.grado_sfida),
    xp: {
      value: creature.punti_esperienza || 0
    },
    source: creature.fonte || 'Brancalonia'
  };

  // Tratti
  npc.system.traits = {
    size: getSizeCode(creature.taglia),
    di: { value: parseImmunities(creature.immunita?.danni) },
    dr: { value: parseResistances(creature.resistenze?.danni) },
    dv: { value: [] },
    ci: { value: parseConditionImmunities(creature.immunita?.condizioni) },
    languages: {
      value: parseLanguages(creature.linguaggi),
      custom: ''
    }
  };

  // Abilità (skills)
  if (creature.abilita) {
    npc.system.skills = parseSkills(creature.abilita, npc.system.abilities);
  }

  // Tiri salvezza
  if (creature.tiri_salvezza) {
    parseSaves(creature.tiri_salvezza, npc.system.abilities);
  }

  // Aggiungi azioni come embedded items
  if (creature.azioni) {
    npc.items = createActionItems(creature.azioni, npcId);
  }

  // Aggiungi tratti speciali
  if (creature.tratti) {
    npc.items.push(...createTraitItems(creature.tratti, npcId));
  }

  return npc;
}

/**
 * Ottiene immagine appropriata per tipo creatura
 */
function getCreatureImage(tipo) {
  const imageMap = {
    'Mostruosità': 'systems/dnd5e/icons/skills/beast_04.jpg',
    'Immondo': 'systems/dnd5e/icons/skills/affliction_03.jpg',
    'Non morto': 'systems/dnd5e/icons/skills/shadow_01.jpg',
    'Drago': 'systems/dnd5e/icons/skills/red_13.jpg',
    'Bestia': 'systems/dnd5e/icons/skills/beast_01.jpg',
    'Umanoide': 'systems/dnd5e/icons/skills/yellow_04.jpg',
    'Gigante': 'systems/dnd5e/icons/skills/ice_09.jpg',
    'Sciame': 'systems/dnd5e/icons/skills/light_07.jpg',
    'Costrutto': 'systems/dnd5e/icons/skills/light_15.jpg',
    'Fata': 'systems/dnd5e/icons/skills/emerald_10.jpg'
  };
  return imageMap[tipo] || 'icons/svg/mystery-man.svg';
}

/**
 * Calcola dimensione token
 */
function getTokenSize(taglia) {
  const sizeMap = {
    'Minuscola': 0.5,
    'Piccola': 1,
    'Media': 1,
    'Grande': 2,
    'Enorme': 3,
    'Mastodontica': 4
  };
  return sizeMap[taglia] || 1;
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
 * Ottiene tipo creatura per dnd5e
 */
function getCreatureType(tipo) {
  const typeMap = {
    'Mostruosità': 'monstrosity',
    'Immondo': 'fiend',
    'Non morto': 'undead',
    'Drago': 'dragon',
    'Bestia': 'beast',
    'Umanoide': 'humanoid',
    'Gigante': 'giant',
    'Sciame': 'swarm',
    'Costrutto': 'construct',
    'Fata': 'fey'
  };
  return typeMap[tipo] || 'humanoid';
}

/**
 * Parsifica movimento
 */
function parseMovement(velocita) {
  if (!velocita) return { walk: 30 };

  return {
    walk: parseInt(velocita.camminare) || 30,
    swim: parseInt(velocita.nuotare) || 0,
    fly: parseInt(velocita.volare) || 0,
    climb: parseInt(velocita.scalare) || 0,
    burrow: parseInt(velocita.scavare) || 0,
    hover: false
  };
}

/**
 * Parsifica sensi
 */
function parseSenses(sensi) {
  if (!sensi) return {};

  return {
    darkvision: parseInt(sensi.scurovisione) || 0,
    blindsight: parseInt(sensi.vista_cieca) || 0,
    tremorsense: parseInt(sensi.percezione_tellurica) || 0,
    truesight: parseInt(sensi.vista_vera) || 0,
    units: 'ft',
    special: sensi.percezione_passiva ? `Percezione Passiva ${sensi.percezione_passiva}` : ''
  };
}

/**
 * Calcola bonus competenza da GS
 */
function getProficiencyBonus(cr) {
  const crNum = parseCR(cr);
  if (crNum <= 4) return 2;
  if (crNum <= 8) return 3;
  if (crNum <= 12) return 4;
  if (crNum <= 16) return 5;
  if (crNum <= 20) return 6;
  if (crNum <= 24) return 7;
  if (crNum <= 28) return 8;
  return 9;
}

/**
 * Parsifica CR
 */
function parseCR(cr) {
  if (!cr) return 0;
  if (typeof cr === 'number') return cr;
  if (cr.includes('/')) {
    const [num, den] = cr.split('/');
    return parseInt(num) / parseInt(den);
  }
  return parseFloat(cr) || 0;
}

/**
 * Formatta descrizione HTML
 */
function formatDescription(creature) {
  let html = `<h2>${creature.nome}</h2>\n`;

  if (creature.descrizione) {
    html += `<p>${creature.descrizione}</p>\n`;
  }

  if (creature.note_brancalonia) {
    html += `<h3>Note di Brancalonia</h3>\n<ul>\n`;
    for (const [key, value] of Object.entries(creature.note_brancalonia)) {
      html += `<li><strong>${key}:</strong> ${value}</li>\n`;
    }
    html += `</ul>\n`;
  }

  if (creature.fonte) {
    html += `<p><strong>Fonte:</strong> ${creature.fonte}</p>`;
  }

  return html;
}

/**
 * Parsifica immunità
 */
function parseImmunities(immString) {
  if (!immString) return [];
  const damageTypes = ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning',
                       'necrotic', 'piercing', 'poison', 'psychic', 'radiant',
                       'slashing', 'thunder'];

  return immString.toLowerCase().split(/[,;]/)
    .map(s => s.trim())
    .filter(s => damageTypes.includes(s));
}

/**
 * Parsifica resistenze
 */
function parseResistances(resString) {
  return parseImmunities(resString); // Stessa logica
}

/**
 * Parsifica immunità condizioni
 */
function parseConditionImmunities(condString) {
  if (!condString) return [];
  const conditions = ['blinded', 'charmed', 'deafened', 'exhaustion', 'frightened',
                      'grappled', 'incapacitated', 'invisible', 'paralyzed',
                      'petrified', 'poisoned', 'prone', 'restrained', 'stunned',
                      'unconscious'];

  const italianMap = {
    'accecato': 'blinded',
    'affascinato': 'charmed',
    'assordato': 'deafened',
    'indebolimento': 'exhaustion',
    'spaventato': 'frightened',
    'afferrato': 'grappled',
    'incapacitato': 'incapacitated',
    'invisibile': 'invisible',
    'paralizzato': 'paralyzed',
    'pietrificato': 'petrified',
    'avvelenato': 'poisoned',
    'prono': 'prone',
    'trattenuto': 'restrained',
    'stordito': 'stunned',
    'privo di sensi': 'unconscious'
  };

  return condString.toLowerCase().split(/[,;]/)
    .map(s => s.trim())
    .map(s => italianMap[s] || s)
    .filter(s => conditions.includes(s));
}

/**
 * Parsifica linguaggi
 */
function parseLanguages(langString) {
  if (!langString || langString === '-') return [];

  const languageMap = {
    'volgare': 'common',
    'comune': 'common',
    'draconiano': 'draconic',
    'elfico': 'elvish',
    'gigante': 'giant',
    'nanico': 'dwarvish',
    'infernale': 'infernal',
    'celestiale': 'celestial',
    'abissale': 'abyssal',
    'primordiale': 'primordial'
  };

  return langString.toLowerCase().split(/[,;]/)
    .map(s => s.trim())
    .map(s => languageMap[s] || s)
    .filter(s => s);
}

/**
 * Parsifica abilità
 */
function parseSkills(abilita, abilities) {
  const skills = {};
  const skillMap = {
    'acrobazia': 'acr',
    'addestrare animali': 'ani',
    'arcano': 'arc',
    'atletica': 'ath',
    'inganno': 'dec',
    'indagare': 'inv',
    'intimidire': 'itm',
    'intuizione': 'ins',
    'medicina': 'med',
    'natura': 'nat',
    'percezione': 'prc',
    'persuasione': 'per',
    'intrattenere': 'prf',
    'religione': 'rel',
    'rapidità di mano': 'slt',
    'furtività': 'ste',
    'sopravvivenza': 'sur',
    'storia': 'his'
  };

  for (const [skill, bonus] of Object.entries(abilita)) {
    const skillCode = skillMap[skill.toLowerCase()];
    if (skillCode) {
      const bonusNum = parseInt(bonus.replace('+', '')) || 0;
      skills[skillCode] = {
        value: 1, // Proficient
        ability: getSkillAbility(skillCode),
        bonus: bonusNum
      };
    }
  }

  return skills;
}

/**
 * Ottiene abilità associata a skill
 */
function getSkillAbility(skill) {
  const map = {
    'acr': 'dex', 'ani': 'wis', 'arc': 'int', 'ath': 'str',
    'dec': 'cha', 'his': 'int', 'ins': 'wis', 'inv': 'int',
    'itm': 'cha', 'med': 'wis', 'nat': 'int', 'prc': 'wis',
    'per': 'cha', 'prf': 'cha', 'rel': 'int', 'slt': 'dex',
    'ste': 'dex', 'sur': 'wis'
  };
  return map[skill] || 'str';
}

/**
 * Parsifica tiri salvezza
 */
function parseSaves(saves, abilities) {
  const saveMap = {
    'forza': 'str',
    'destrezza': 'dex',
    'costituzione': 'con',
    'intelligenza': 'int',
    'saggezza': 'wis',
    'carisma': 'cha'
  };

  for (const [save, bonus] of Object.entries(saves)) {
    const ability = saveMap[save.toLowerCase()];
    if (ability && abilities[ability]) {
      abilities[ability].proficient = 1;
      abilities[ability].saveBonus = parseInt(bonus.replace('+', '')) || 0;
    }
  }
}

/**
 * Crea item per azioni
 */
function createActionItems(azioni, parentId) {
  return azioni.map((azione, index) => {
    const itemId = generateFoundryId(`action${index}`);
    return {
      _id: itemId,
      name: azione.nome,
      type: 'weapon',
      img: 'icons/svg/sword.svg',
      system: {
        description: {
          value: azione.descrizione || azione.effetto || '',
          chat: '',
          unidentified: ''
        },
        source: 'Brancalonia',
        actionType: getActionType(azione),
        attackBonus: azione.bonus_attacco || '',
        damage: {
          parts: parseDamage(azione.danno),
          versatile: ''
        },
        range: parseRange(azione),
        save: parseSave(azione),
        activation: {
          type: 'action',
          cost: 1,
          condition: ''
        },
        duration: {
          value: '',
          units: ''
        },
        target: parseTarget(azione),
        uses: parseUses(azione)
      },
      effects: [],
      folder: null,
      sort: 100 + index,
      ownership: {
        default: 0
      },
      flags: {}
    };
  });
}

/**
 * Crea items per tratti
 */
function createTraitItems(tratti, parentId) {
  return tratti.map((tratto, index) => {
    const itemId = generateFoundryId(`trait${index}`);
    return {
      _id: itemId,
      name: tratto.nome,
      type: 'feat',
      img: 'icons/svg/aura.svg',
      system: {
        description: {
          value: `<p>${tratto.descrizione}</p>`,
          chat: '',
          unidentified: ''
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
          per: null
        },
        requirements: '',
        recharge: {
          value: null,
          charged: false
        }
      },
      effects: [],
      folder: null,
      sort: index,
      ownership: {
        default: 0
      },
      flags: {}
    };
  });
}

/**
 * Determina tipo azione
 */
function getActionType(azione) {
  const tipo = azione.tipo?.toLowerCase() || '';
  if (tipo.includes('mischia')) return 'mwak';
  if (tipo.includes('distanza')) return 'rwak';
  if (tipo.includes('salvezza')) return 'save';
  if (tipo.includes('soffio') || tipo.includes('area')) return 'save';
  return 'other';
}

/**
 * Parsifica danno
 */
function parseDamage(dannoStr) {
  if (!dannoStr) return [];

  // Regex per estrarre formula danno e tipo
  const damageRegex = /(\d+d?\d*(?:\s*[+-]\s*\d+)?)\s*danni?\s*(?:da\s+)?(\w+)?/gi;
  const parts = [];
  let match;

  while ((match = damageRegex.exec(dannoStr)) !== null) {
    const formula = match[1].replace(/\s/g, '');
    const damageType = getDamageType(match[2]) || '';
    parts.push([formula, damageType]);
  }

  return parts;
}

/**
 * Mappa tipo danno
 */
function getDamageType(tipo) {
  if (!tipo) return '';

  const typeMap = {
    'contundenti': 'bludgeoning',
    'contundente': 'bludgeoning',
    'perforanti': 'piercing',
    'perforante': 'piercing',
    'taglienti': 'slashing',
    'tagliente': 'slashing',
    'fuoco': 'fire',
    'freddo': 'cold',
    'fulmine': 'lightning',
    'tuono': 'thunder',
    'acido': 'acid',
    'veleno': 'poison',
    'necrotico': 'necrotic',
    'necrotici': 'necrotic',
    'radiante': 'radiant',
    'radianti': 'radiant',
    'psichico': 'psychic',
    'psichici': 'psychic',
    'forza': 'force'
  };

  return typeMap[tipo.toLowerCase()] || tipo;
}

/**
 * Parsifica portata/gittata
 */
function parseRange(azione) {
  const range = {
    value: null,
    long: null,
    units: 'ft'
  };

  if (azione.portata) {
    range.value = parseInt(azione.portata) * 5 || 5; // Converti metri in piedi
  }
  if (azione.gittata) {
    const parts = azione.gittata.split('/');
    range.value = parseInt(parts[0]) || null;
    range.long = parseInt(parts[1]) || null;
  }

  return range;
}

/**
 * Parsifica tiro salvezza
 */
function parseSave(azione) {
  const save = {
    ability: '',
    dc: null,
    scaling: 'flat'
  };

  if (azione.tiro_salvezza) {
    const saveMatch = azione.tiro_salvezza.match(/(Forza|Destrezza|Costituzione|Intelligenza|Saggezza|Carisma)\s+CD\s+(\d+)/i);
    if (saveMatch) {
      const abilityMap = {
        'forza': 'str',
        'destrezza': 'dex',
        'costituzione': 'con',
        'intelligenza': 'int',
        'saggezza': 'wis',
        'carisma': 'cha'
      };
      save.ability = abilityMap[saveMatch[1].toLowerCase()] || 'str';
      save.dc = parseInt(saveMatch[2]);
    }
  }

  return save;
}

/**
 * Parsifica bersaglio
 */
function parseTarget(azione) {
  const target = {
    value: null,
    width: null,
    units: 'ft',
    type: ''
  };

  if (azione.area) {
    const areaMatch = azione.area.match(/(\d+)\s*(metri|piedi|m|ft)/i);
    if (areaMatch) {
      target.value = parseInt(areaMatch[1]);
      if (areaMatch[2].startsWith('m')) {
        target.value *= 5; // Converti metri in piedi
      }
      target.type = 'radius';
    }
    if (azione.area.includes('cono')) target.type = 'cone';
    if (azione.area.includes('linea')) target.type = 'line';
    if (azione.area.includes('cubo')) target.type = 'cube';
  }

  if (azione.bersagli) {
    if (azione.bersagli.includes('creatur')) {
      target.type = target.type || 'creature';
    }
  }

  return target;
}

/**
 * Parsifica usi/ricarica
 */
function parseUses(azione) {
  const uses = {
    value: null,
    max: '',
    per: null,
    recovery: ''
  };

  if (azione.ricarica) {
    const rechargeMatch = azione.ricarica.match(/(\d+)(?:-(\d+))?/);
    if (rechargeMatch) {
      uses.value = 1;
      uses.max = '1';
      uses.per = 'charges';
      uses.recovery = `Ricarica ${azione.ricarica}`;
    }
  }

  if (azione.uso) {
    const useMatch = azione.uso.match(/(\d+)\/(\w+)/);
    if (useMatch) {
      uses.value = parseInt(useMatch[1]);
      uses.max = useMatch[1];
      uses.per = useMatch[2].includes('giorn') ? 'day' : 'charges';
    }
  }

  return uses;
}

/**
 * Ottiene dimensione per swarm
 */
function getSwarmSize(taglia) {
  const sizeMap = {
    'Media': 'tiny',
    'Grande': 'sm',
    'Enorme': 'med',
    'Mastodontica': 'lg'
  };
  return sizeMap[taglia] || 'tiny';
}

/**
 * Processa e integra contenuti creature
 */
function processCreatures() {
  console.log('\n📦 Integrazione Creature e PNG...');

  const sourceDirs = [
    path.join(DATABASE_PATH, 'creature/creature_base'),
    path.join(DATABASE_PATH, 'creature/png_base'),
    path.join(DATABASE_PATH, 'creature/creature_macaronicon')
  ];

  const outputPath = path.join(PACKS_PATH, 'npc', '_source');

  // Crea directory se non esiste
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  let processed = 0;
  let errors = 0;

  sourceDirs.forEach(sourceDir => {
    if (!fs.existsSync(sourceDir)) {
      console.log(`⚠️  Directory non trovata: ${sourceDir}`);
      return;
    }

    const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.json'));

    files.forEach(file => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(sourceDir, file), 'utf8'));
        const normalized = normalizeCreatureToNPC(data);

        const outputFile = path.join(outputPath, file);
        fs.writeFileSync(outputFile, JSON.stringify(normalized, null, 2));

        console.log(`  ✅ ${data.nome || file}`);
        processed++;
      } catch (error) {
        console.error(`  ❌ Errore ${file}: ${error.message}`);
        errors++;
      }
    });
  });

  console.log(`\n📊 Creature processate: ${processed} successi, ${errors} errori`);
}

/**
 * Aggiunge _key a file esistenti
 */
function addKeysToExistingPacks() {
  console.log('\n🔑 Aggiunta _key ai packs esistenti...');

  const packDirs = fs.readdirSync(PACKS_PATH)
    .filter(dir => fs.statSync(path.join(PACKS_PATH, dir)).isDirectory());

  let updated = 0;

  packDirs.forEach(packDir => {
    const sourcePath = path.join(PACKS_PATH, packDir, '_source');
    if (!fs.existsSync(sourcePath)) return;

    const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));

    files.forEach(file => {
      const filePath = path.join(sourcePath, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Determina collection type
        let collection = 'items';
        if (data.type === 'npc' || data.type === 'character') {
          collection = 'actors';
        } else if (data.pages) {
          collection = 'journal';
        } else if (data.formula) {
          collection = 'tables';
        }

        // Aggiungi _key se mancante
        if (!data._key) {
          data._key = `!${collection}!${data._id}`;
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          updated++;
        }
      } catch (error) {
        console.error(`  ⚠️  Errore ${file}: ${error.message}`);
      }
    });
  });

  console.log(`  ✅ Aggiornati ${updated} file con _key`);
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Integrazione Database Brancalonia');
  console.log('=====================================');
  console.log(`Sistema: D&D 5e v5.1.9`);
  console.log(`Foundry: v13+`);
  console.log(`Database: ${DATABASE_PATH}`);
  console.log(`Packs: ${PACKS_PATH}`);

  // 1. Aggiungi _key ai file esistenti
  addKeysToExistingPacks();

  // 2. Integra creature dal database
  processCreatures();

  console.log('\n✅ Integrazione completata!');
  console.log('\n⚠️  Prossimi passi:');
  console.log('1. Compilare i packs con: node compile-with-keys.cjs');
  console.log('2. Verificare con: node verify-packs.cjs');
  console.log('3. Testare in Foundry VTT');
}

// Esegui
if (require.main === module) {
  main();
}

module.exports = {
  normalizeCreatureToNPC,
  addKeyField,
  generateFoundryId
};