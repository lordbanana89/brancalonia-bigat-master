/**
 * Converter specializzato per creature e PNG
 * Mappa tutti i campi dal database Brancalonia allo schema dnd5e
 */

import {
  generateFoundryId,
  getDefaultImage,
  parseSpeed,
  mapSize,
  mapCreatureType,
  parseLanguages,
  parseDamageModifiers,
  parseConditions,
  mapSkillCode,
  getSkillAbility,
  getAbilityModifier,
  mapDamageType,
  generateEffectId
} from '../utils/common.mjs';

/**
 * Converte una creatura dal formato database al formato Foundry dnd5e
 */
export function convertCreature(data, filePath) {
  const id = generateFoundryId(filePath);

  const creature = {
    _id: id,
    _key: `!actors!${id}`,
    name: data.nome || data.name || 'Creatura',
    type: 'npc',
    img: data.img || getCreatureImage(data),

    system: {
      // Caratteristiche
      abilities: mapAbilities(data.caratteristiche),

      // Attributi
      attributes: {
        ac: mapArmorClass(data.classe_armatura),
        hp: mapHitPoints(data.punti_ferita),
        init: {
          value: 0,
          bonus: data.iniziativa_bonus || 0,
          roll: {
            min: null,
            max: null,
            mode: 0
          }
        },
        movement: mapMovement(data.velocita),
        attunement: {
          max: 3
        },
        senses: mapSenses(data.sensi),
        spellcasting: data.incantatore || '',
        prof: calculateProficiency(data.grado_sfida),
        spelldc: data.cd_incantesimi || null,
        death: {
          success: 0,
          failure: 0
        }
      },

      // Dettagli
      details: {
        biography: {
          value: formatCreatureDescription(data),
          public: ''
        },
        alignment: data.allineamento || '',
        race: '',
        type: {
          value: mapCreatureType(data.tipo),
          subtype: data.sottotipo || '',
          swarm: data.tipo === 'Sciame' ? mapSwarmSize(data) : '',
          custom: ''
        },
        environment: data.ambiente || '',
        cr: parseFloat(data.grado_sfida) || 0,
        spellLevel: data.livello_incantatore || 0,
        xp: {
          value: data.punti_esperienza || calculateXP(data.grado_sfida)
        },
        source: data.fonte || 'Brancalonia'
      },

      // Tratti
      traits: {
        size: mapSize(data.taglia),
        di: {
          value: parseDamageModifiers(data.immunita?.danni),
          bypasses: [],
          custom: data.immunita?.danni_note || ''
        },
        dr: {
          value: parseDamageModifiers(data.resistenze?.danni),
          bypasses: [],
          custom: data.resistenze?.danni_note || ''
        },
        dv: {
          value: parseDamageModifiers(data.vulnerabilita?.danni),
          bypasses: [],
          custom: data.vulnerabilita?.danni_note || ''
        },
        ci: {
          value: parseConditions(data.immunita?.condizioni),
          custom: data.immunita?.condizioni_note || ''
        },
        languages: {
          value: parseLanguages(data.linguaggi),
          custom: data.linguaggi_speciali || ''
        }
      },

      // Valuta
      currency: {
        pp: 0,
        gp: data.tesoro?.oro || 0,
        ep: 0,
        sp: data.tesoro?.argento || 0,
        cp: data.tesoro?.rame || 0
      },

      // Abilità
      skills: mapCreatureSkills(data.abilita, data.caratteristiche),

      // Incantesimi
      spells: mapSpellSlots(data.slot_incantesimi),

      // Bonus
      bonuses: {
        mwak: {
          attack: data.bonus_attacco_mischia || '',
          damage: data.bonus_danno_mischia || ''
        },
        rwak: {
          attack: data.bonus_attacco_distanza || '',
          damage: data.bonus_danno_distanza || ''
        },
        msak: {
          attack: '',
          damage: ''
        },
        rsak: {
          attack: '',
          damage: ''
        },
        abilities: {
          check: '',
          save: '',
          skill: ''
        },
        spell: {
          dc: ''
        }
      },

      // Risorse
      resources: {
        legact: {
          value: data.azioni_leggendarie?.numero || 0,
          max: data.azioni_leggendarie?.numero || 0
        },
        legres: {
          value: data.resistenze_leggendarie?.numero || 0,
          max: data.resistenze_leggendarie?.numero || 0
        },
        lair: {
          value: data.tana?.iniziativa ? true : false,
          initiative: data.tana?.iniziativa || 0
        }
      }
    },

    // Items (tratti, azioni, reazioni, etc.)
    items: createCreatureItems(data, id),

    // Effetti attivi
    effects: createCreatureEffects(data),

    // Token
    prototypeToken: createTokenData(data),

    // Metadata
    folder: null,
    sort: 0,
    ownership: {
      default: 0,
      
    },

    // Flags
    flags: {
      brancalonia: {
        id_originale: data.id,
        fonte: data.fonte,
        note: data.note_brancalonia,
        implementazione: data.implementazione_foundry,
        png_type: data.categoria_png,
        ruolo: data.note_brancalonia?.ruolo,
        affiliazione: data.note_brancalonia?.affiliazione
      }
    }
  };

  return creature;
}

/**
 * Mappa le caratteristiche
 */
function mapAbilities(caratteristiche) {
  if (!caratteristiche) {
    return createDefaultAbilities();
  }

  return {
    str: createAbility(caratteristiche.forza),
    dex: createAbility(caratteristiche.destrezza),
    con: createAbility(caratteristiche.costituzione),
    int: createAbility(caratteristiche.intelligenza),
    wis: createAbility(caratteristiche.saggezza),
    cha: createAbility(caratteristiche.carisma)
  };
}

/**
 * Crea una caratteristica
 */
function createAbility(value) {
  const score = value || 10;
  const mod = getAbilityModifier(score);

  return {
    value: score,
    proficient: 0,
    bonuses: {
      check: '',
      save: ''
    },
    min: 3,
    mod: mod,
    save: mod,
    dc: 8 + 2 + mod // Base DC
  };
}

/**
 * Crea caratteristiche di default
 */
function createDefaultAbilities() {
  return {
    str: createAbility(10),
    dex: createAbility(10),
    con: createAbility(10),
    int: createAbility(10),
    wis: createAbility(10),
    cha: createAbility(10)
  };
}

/**
 * Mappa la classe armatura
 */
function mapArmorClass(classeArmatura) {
  if (!classeArmatura) {
    return { flat: 10, calc: 'default', formula: '' };
  }

  const ac = {
    flat: classeArmatura.valore || 10,
    calc: 'default',
    formula: ''
  };

  // Se c'è un tipo di armatura specificato
  if (classeArmatura.tipo) {
    ac.calc = 'natural';
    if (classeArmatura.formula) {
      ac.formula = classeArmatura.formula;
    }
  }

  return ac;
}

/**
 * Mappa i punti ferita
 */
function mapHitPoints(puntiFerita) {
  if (!puntiFerita) {
    return { value: 1, max: 1, temp: 0, tempmax: 0, formula: '1d8' };
  }

  return {
    value: puntiFerita.valore || 1,
    max: puntiFerita.valore || 1,
    temp: 0,
    tempmax: 0,
    formula: puntiFerita.formula || ''
  };
}

/**
 * Mappa il movimento
 */
function mapMovement(velocita) {
  if (!velocita) {
    return {
      burrow: 0,
      climb: 0,
      fly: 0,
      swim: 0,
      walk: 30,
      units: 'ft',
      hover: false
    };
  }

  return {
    burrow: parseSpeed(velocita.scavare),
    climb: parseSpeed(velocita.scalare),
    fly: parseSpeed(velocita.volare),
    swim: parseSpeed(velocita.nuotare),
    walk: parseSpeed(velocita.camminare),
    units: 'ft',
    hover: velocita.volare?.includes('planare') || false
  };
}

/**
 * Mappa i sensi
 */
function mapSenses(sensi) {
  if (!sensi) {
    return {
      darkvision: 0,
      blindsight: 0,
      tremorsense: 0,
      truesight: 0,
      units: 'ft',
      special: ''
    };
  }

  const senses = {
    darkvision: parseInt(sensi.scurovisione) || 0,
    blindsight: parseInt(sensi.vista_cieca) || 0,
    tremorsense: parseInt(sensi.percezione_tellurica) || 0,
    truesight: parseInt(sensi.vista_del_vero) || 0,
    units: 'ft',
    special: ''
  };

  // Percezione passiva come senso speciale
  if (sensi.percezione_passiva) {
    senses.special = `Percezione Passiva ${sensi.percezione_passiva}`;
  }

  // Converti metri in piedi se necessario
  Object.keys(senses).forEach(key => {
    if (key !== 'units' && key !== 'special' && senses[key] > 0) {
      // Se il valore sembra essere in metri (< 200)
      if (senses[key] < 200) {
        senses[key] = Math.round(senses[key] * 3.28084 / 5) * 5;
      }
    }
  });

  return senses;
}

/**
 * Mappa le abilità della creatura
 */
function mapCreatureSkills(abilita, caratteristiche) {
  const skills = {};

  // Lista completa delle skill dnd5e
  const allSkills = [
    'acr', 'ani', 'arc', 'ath', 'dec', 'his', 'ins', 'inti',
    'inv', 'med', 'nat', 'prc', 'prf', 'per', 'rel', 'slt',
    'ste', 'sur'
  ];

  // Inizializza tutte le skill
  allSkills.forEach(skill => {
    skills[skill] = {
      value: 0,
      ability: getSkillAbility(skill),
      bonuses: {
        check: '',
        passive: ''
      },
      mod: 0,
      passive: 10,
      prof: 0,
      total: 0
    };
  });

  // Se ci sono abilità specificate
  if (abilita) {
    Object.entries(abilita).forEach(([skillName, bonus]) => {
      const skillCode = mapSkillCode(skillName);
      if (skillCode && skills[skillCode]) {
        // Parsifica il bonus
        const bonusValue = parseInt(bonus.toString().replace(/[^0-9-]/g, '')) || 0;

        // Calcola la proficiency dal bonus
        const ability = skills[skillCode].ability;
        const abilityMod = caratteristiche ?
          getAbilityModifier(caratteristiche[mapAbilityName(ability)] || 10) : 0;

        // Calcola il livello di proficiency (0, 1 o 2 per expertise)
        const profBonus = calculateProficiency(parseFloat(abilita.grado_sfida) || 0);
        const totalWithoutProf = abilityMod;
        const difference = bonusValue - totalWithoutProf;

        let profLevel = 0;
        if (difference >= profBonus * 2) {
          profLevel = 2; // Expertise
        } else if (difference >= profBonus) {
          profLevel = 1; // Proficient
        }

        skills[skillCode].value = profLevel;
        skills[skillCode].mod = bonusValue;
        skills[skillCode].prof = profLevel;
        skills[skillCode].total = bonusValue;
        skills[skillCode].passive = 10 + bonusValue;
      }
    });
  }

  return skills;
}

/**
 * Mappa nome abilità inglese -> italiano per caratteristiche
 */
function mapAbilityName(ability) {
  const map = {
    'str': 'forza',
    'dex': 'destrezza',
    'con': 'costituzione',
    'int': 'intelligenza',
    'wis': 'saggezza',
    'cha': 'carisma'
  };
  return map[ability] || 'forza';
}

/**
 * Calcola il bonus di proficiency dal CR
 */
function calculateProficiency(cr) {
  if (cr === 0) return 2;
  if (cr <= 4) return 2;
  if (cr <= 8) return 3;
  if (cr <= 12) return 4;
  if (cr <= 16) return 5;
  if (cr <= 20) return 6;
  if (cr <= 24) return 7;
  if (cr <= 28) return 8;
  return 9;
}

/**
 * Calcola XP dal CR
 */
function calculateXP(cr) {
  const xpByCR = {
    0: 10,
    0.125: 25,
    0.25: 50,
    0.5: 100,
    1: 200,
    2: 450,
    3: 700,
    4: 1100,
    5: 1800,
    6: 2300,
    7: 2900,
    8: 3900,
    9: 5000,
    10: 5900,
    11: 7200,
    12: 8400,
    13: 10000,
    14: 11500,
    15: 13000,
    16: 15000,
    17: 18000,
    18: 20000,
    19: 22000,
    20: 25000,
    21: 33000,
    22: 41000,
    23: 50000,
    24: 62000,
    25: 75000,
    26: 90000,
    27: 105000,
    28: 120000,
    29: 135000,
    30: 155000
  };

  return xpByCR[cr] || 0;
}

/**
 * Ottiene dimensione dello sciame
 */
function mapSwarmSize(data) {
  const sottotipo = (data.sottotipo || '').toLowerCase();

  if (sottotipo.includes('minuscol')) return 'tiny';
  if (sottotipo.includes('piccol')) return 'small';
  if (sottotipo.includes('medi')) return 'medium';

  return 'tiny';
}

/**
 * Ottiene immagine appropriata per la creatura
 */
function getCreatureImage(data) {
  const tipo = (data.tipo || '').toLowerCase();

  const imageMap = {
    'aberrazione': 'icons/creatures/magical/spirit-undead-ghost-blue.webp',
    'bestia': 'icons/creatures/mammals/wolf-black-howl.webp',
    'celestiale': 'icons/creatures/magical/angel-winged-blue.webp',
    'costrutto': 'icons/creatures/magical/construct-stone-earth-golem.webp',
    'drago': 'icons/creatures/reptiles/dragon-horned-blue.webp',
    'elementale': 'icons/creatures/magical/elemental-fire.webp',
    'fata': 'icons/creatures/magical/fae-fairy-winged-glowing.webp',
    'immondo': 'icons/creatures/unholy/demon-horned-winged-pink.webp',
    'gigante': 'icons/creatures/giants/giant-stone-club.webp',
    'umanoide': 'icons/creatures/humanoids/human-villager-green.webp',
    'mostruosità': 'icons/creatures/aberrations/beast-tentacles-eyes-red.webp',
    'melma': 'icons/creatures/slimes/slime-movement-pseudopod-green.webp',
    'vegetale': 'icons/creatures/plants/plant-treant-green.webp',
    'non morto': 'icons/creatures/undead/ghost-ghoul-gray.webp'
  };

  return imageMap[tipo] || getDefaultImage('npc');
}

/**
 * Mappa gli slot incantesimi
 */
function mapSpellSlots(slotIncantesimi) {
  if (!slotIncantesimi) {
    return {
      spell1: { value: 0, override: null, max: 0 },
      spell2: { value: 0, override: null, max: 0 },
      spell3: { value: 0, override: null, max: 0 },
      spell4: { value: 0, override: null, max: 0 },
      spell5: { value: 0, override: null, max: 0 },
      spell6: { value: 0, override: null, max: 0 },
      spell7: { value: 0, override: null, max: 0 },
      spell8: { value: 0, override: null, max: 0 },
      spell9: { value: 0, override: null, max: 0 },
      pact: { value: 0, override: null, max: 0, level: 0 }
    };
  }

  const slots = {};

  for (let i = 1; i <= 9; i++) {
    const slotKey = `spell${i}`;
    const slotValue = slotIncantesimi[`livello_${i}`] || 0;
    slots[slotKey] = {
      value: slotValue,
      override: null,
      max: slotValue
    };
  }

  // Pact slots se specificato
  slots.pact = {
    value: slotIncantesimi.patto || 0,
    override: null,
    max: slotIncantesimi.patto || 0,
    level: slotIncantesimi.livello_patto || 0
  };

  return slots;
}

/**
 * Formatta la descrizione della creatura
 */
function formatCreatureDescription(data) {
  let desc = '';

  if (data.descrizione) {
    desc += `<p>${data.descrizione}</p>`;
  }

  if (data.storia) {
    desc += `<h3>Storia</h3>`;
    desc += `<p>${data.storia}</p>`;
  }

  if (data.note_brancalonia) {
    desc += `<h3>Note Brancalonia</h3>`;
    if (data.note_brancalonia.ruolo) {
      desc += `<p><strong>Ruolo:</strong> ${data.note_brancalonia.ruolo}</p>`;
    }
    if (data.note_brancalonia.attivita) {
      desc += `<p><strong>Attività:</strong> ${data.note_brancalonia.attivita}</p>`;
    }
    if (data.note_brancalonia.affiliazione) {
      desc += `<p><strong>Affiliazione:</strong> ${data.note_brancalonia.affiliazione}</p>`;
    }
    if (data.note_brancalonia.diffusione) {
      desc += `<p><strong>Diffusione:</strong> ${data.note_brancalonia.diffusione}</p>`;
    }
  }

  return desc;
}

/**
 * Crea gli items della creatura (tratti, azioni, etc.)
 */
function createCreatureItems(data, creatureId) {
  const items = [];
  let itemIndex = 0;

  // Tratti
  if (data.tratti && Array.isArray(data.tratti)) {
    data.tratti.forEach(tratto => {
      items.push(createFeatureItem(
        `${creatureId}trait${itemIndex++}`,
        tratto.nome,
        tratto.descrizione,
        'trait'
      ));
    });
  }

  // Azioni
  if (data.azioni && Array.isArray(data.azioni)) {
    data.azioni.forEach(azione => {
      if (azione.tipo?.includes('Attacco')) {
        items.push(createWeaponItem(
          `${creatureId}action${itemIndex++}`,
          azione
        ));
      } else {
        items.push(createFeatureItem(
          `${creatureId}action${itemIndex++}`,
          azione.nome,
          azione.descrizione,
          'action'
        ));
      }
    });
  }

  // Azioni bonus
  if (data.azioni_bonus && Array.isArray(data.azioni_bonus)) {
    data.azioni_bonus.forEach(azione => {
      items.push(createFeatureItem(
        `${creatureId}bonus${itemIndex++}`,
        azione.nome,
        azione.descrizione,
        'bonus'
      ));
    });
  }

  // Reazioni
  if (data.reazioni && Array.isArray(data.reazioni)) {
    data.reazioni.forEach(reazione => {
      items.push(createFeatureItem(
        `${creatureId}reaction${itemIndex++}`,
        reazione.nome,
        reazione.descrizione,
        'reaction'
      ));
    });
  }

  // Azioni leggendarie
  if (data.azioni_leggendarie?.azioni && Array.isArray(data.azioni_leggendarie.azioni)) {
    data.azioni_leggendarie.azioni.forEach(azione => {
      items.push(createFeatureItem(
        `${creatureId}legendary${itemIndex++}`,
        azione.nome,
        azione.descrizione,
        'legendary',
        azione.costo || 1
      ));
    });
  }

  // Azioni della tana
  if (data.tana?.azioni && Array.isArray(data.tana.azioni)) {
    data.tana.azioni.forEach(azione => {
      items.push(createFeatureItem(
        `${creatureId}lair${itemIndex++}`,
        azione.nome,
        azione.descrizione,
        'lair'
      ));
    });
  }

  // Incantesimi conosciuti
  if (data.incantesimi && Array.isArray(data.incantesimi)) {
    data.incantesimi.forEach(incantesimo => {
      items.push(createSpellItem(
        `${creatureId}spell${itemIndex++}`,
        incantesimo
      ));
    });
  }

  return items;
}

/**
 * Crea un item di tipo feature
 */
function createFeatureItem(id, name, description, type = 'trait', cost = null) {
  const item = {
    _id: id,
    _key: `!items!${id}`,
    name: name || 'Feature',
    type: 'feat',
    img: getFeatureIcon(type),
    system: {
      description: {
        value: `<p>${description || ''}</p>`,
        chat: '',
        unidentified: ''
      },
      source: '',
      activation: {
        type: getActivationType(type),
        cost: cost || (type === 'legendary' ? 1 : null),
        condition: ''
      },
      duration: { value: '', units: '' },
      target: { value: null, width: null, units: '', type: '' },
      range: { value: null, long: null, units: '' },
      uses: { value: null, max: '', per: null, recovery: '' },
      consume: { type: '', target: null, amount: null },
      ability: null,
      actionType: '',
      attackBonus: '',
      chatFlavor: '',
      critical: { threshold: null, damage: '' },
      damage: { parts: [], versatile: '' },
      formula: '',
      save: { ability: '', dc: null, scaling: 'spell' },
      type: {
        value: mapFeatureType(type),
        subtype: ''
      },
      requirements: '',
      recharge: { value: null, charged: false }
    }
  };

  return item;
}

/**
 * Crea un item di tipo weapon per le azioni di attacco
 */
function createWeaponItem(id, azione) {
  const item = {
    _id: id,
    _key: `!items!${id}`,
    name: azione.nome || 'Attacco',
    type: 'weapon',
    img: 'icons/weapons/claws/claw-bear-brown.webp',
    system: {
      description: {
        value: `<p>${azione.descrizione || ''}</p>`,
        chat: '',
        unidentified: ''
      },
      source: '',
      quantity: 1,
      weight: 0,
      price: { value: 0, denomination: 'gp' },
      attunement: 0,
      equipped: true,
      rarity: '',
      identified: true,
      activation: { type: 'action', cost: 1, condition: '' },
      duration: { value: '', units: '' },
      target: {
        value: parseInt(azione.bersagli) || 1,
        width: null,
        units: '',
        type: 'creature'
      },
      range: parseWeaponRange(azione),
      uses: { value: null, max: '', per: null, recovery: '' },
      consume: { type: '', target: null, amount: null },
      ability: '',
      actionType: mapActionType(azione),
      attackBonus: parseAttackBonus(azione.bonus_attacco),
      chatFlavor: '',
      critical: { threshold: null, damage: '' },
      damage: parseWeaponDamage(azione.danno),
      formula: '',
      save: { ability: '', dc: null, scaling: 'spell' },
      weaponType: 'natural',
      baseItem: '',
      properties: {},
      proficient: true
    }
  };

  return item;
}

/**
 * Crea un item di tipo spell
 */
function createSpellItem(id, spell) {
  return {
    _id: id,
    _key: `!items!${id}`,
    name: spell.nome || 'Incantesimo',
    type: 'spell',
    img: 'icons/magic/light/orb-lightbulb-blue.webp',
    system: {
      description: {
        value: `<p>${spell.descrizione || ''}</p>`,
        chat: '',
        unidentified: ''
      },
      source: '',
      level: spell.livello || 0,
      school: spell.scuola || 'evo',
      components: {
        vocal: true,
        somatic: true,
        material: false,
        ritual: false,
        concentration: false
      },
      materials: { value: '', consumed: false, cost: 0, supply: 0 },
      preparation: { mode: 'innate', prepared: true },
      scaling: { mode: 'none', formula: '' }
    }
  };
}

/**
 * Parsifica la gittata dell'arma
 */
function parseWeaponRange(azione) {
  const range = { value: 5, long: null, units: 'ft' };

  if (azione.portata) {
    const portataMatch = azione.portata.match(/(\d+)/);
    if (portataMatch) {
      range.value = parseInt(portataMatch[1]);
      // Converti metri in piedi se necessario
      if (azione.portata.includes('m')) {
        range.value = Math.round(range.value * 3.28084 / 5) * 5;
      }
    }
  }

  if (azione.gittata) {
    const gittataMatch = azione.gittata.match(/(\d+)\/(\d+)/);
    if (gittataMatch) {
      range.value = parseInt(gittataMatch[1]);
      range.long = parseInt(gittataMatch[2]);
      // Converti metri in piedi
      if (azione.gittata.includes('m')) {
        range.value = Math.round(range.value * 3.28084 / 5) * 5;
        range.long = Math.round(range.long * 3.28084 / 5) * 5;
      }
    }
  }

  return range;
}

/**
 * Parsifica il bonus di attacco
 */
function parseAttackBonus(bonusString) {
  if (!bonusString) return '';

  // Converti in stringa se necessario
  const str = typeof bonusString === 'string' ? bonusString : bonusString.toString();
  const match = str.match(/([+-]?\d+)/);
  return match ? match[1] : '';
}

/**
 * Parsifica il danno dell'arma
 */
function parseWeaponDamage(dannoString) {
  const damage = { parts: [], versatile: '' };

  if (!dannoString) return damage;

  // Assicura che sia una stringa
  const str = typeof dannoString === 'string' ? dannoString : String(dannoString);

  // Cerca pattern tipo "2d6+3 danni perforanti"
  const regex = /(\d+d\d+(?:\s*[+-]\s*\d+)?)\s*(?:danni\s+)?(\w+)/g;

  // Fallback per versioni Node senza matchAll
  if (str.matchAll) {
    const matches = str.matchAll(regex);
    for (const match of matches) {
      const damageType = mapDamageType(match[2]);
      damage.parts.push([match[1], damageType || 'bludgeoning']);
    }
  } else {
    // Fallback con exec
    let match;
    while ((match = regex.exec(str)) !== null) {
      const damageType = mapDamageType(match[2]);
      damage.parts.push([match[1], damageType || 'bludgeoning']);
    }
  }

  // Se non trova nulla con il pattern completo, prova pattern più semplice
  if (damage.parts.length === 0 && str) {
    const simpleMatch = str.match(/(\d+(?:\s*\(\d+d\d+(?:\s*[+-]\s*\d+)?\))?)/);
    if (simpleMatch) {
      // Estrai i dadi se presenti tra parentesi
      const diceMatch = simpleMatch[1].match(/\(([^)]+)\)/);
      const diceFormula = diceMatch ? diceMatch[1] : simpleMatch[1];
      damage.parts.push([diceFormula, 'bludgeoning']);
    }
  }

  return damage;
}

/**
 * Determina il tipo di azione
 */
function mapActionType(azione) {
  const tipo = (azione.tipo || '').toLowerCase();

  if (tipo.includes('mischia')) return 'mwak';
  if (tipo.includes('distanza')) return 'rwak';
  if (tipo.includes('incantesimo')) return 'save';

  return 'mwak';
}

/**
 * Ottiene l'icona per un feature
 */
function getFeatureIcon(type) {
  const icons = {
    'trait': 'icons/skills/social/diplomacy-peace-alliance.webp',
    'action': 'icons/skills/melee/strike-slashes-red.webp',
    'bonus': 'icons/skills/movement/arrow-down-blue.webp',
    'reaction': 'icons/skills/defensive/shield-block-gray.webp',
    'legendary': 'icons/skills/melee/strike-slashes-orange.webp',
    'lair': 'icons/environment/wilderness/cave-entrance-mountain.webp'
  };

  return icons[type] || 'icons/skills/melee/strike-slashes-red.webp';
}

/**
 * Ottiene il tipo di attivazione
 */
function getActivationType(type) {
  const activationMap = {
    'trait': '',
    'action': 'action',
    'bonus': 'bonus',
    'reaction': 'reaction',
    'legendary': 'legendary',
    'lair': 'lair'
  };

  return activationMap[type] || '';
}

/**
 * Mappa il tipo di feature
 */
function mapFeatureType(type) {
  if (type === 'trait') return 'monster';
  if (type === 'action') return 'monster';
  if (type === 'bonus') return 'monster';
  if (type === 'reaction') return 'monster';
  if (type === 'legendary') return 'legendary';
  if (type === 'lair') return 'lair';

  return 'monster';
}

/**
 * Crea gli effetti attivi della creatura
 */
function createCreatureEffects(data) {
  const effects = [];

  // Effetti predefiniti
  if (data.implementazione_foundry?.active_effects) {
    return data.implementazione_foundry.active_effects;
  }

  // Resistenze leggendarie
  if (data.resistenze_leggendarie?.numero > 0) {
    effects.push({
      _id: generateEffectId(),
      name: 'Resistenze Leggendarie',
      icon: 'icons/magic/defensive/shield-barrier-flaming-diamond-purple.webp',
      origin: null,
      transfer: false,
      disabled: false,
      duration: { startTime: null, seconds: null, turns: null },
      changes: []
    });
  }

  // Regenerazione
  if (data.rigenerazione) {
    effects.push({
      _id: generateEffectId(),
      name: 'Rigenerazione',
      icon: 'icons/magic/life/heart-glowing-red.webp',
      origin: null,
      transfer: false,
      disabled: false,
      duration: { startTime: null, seconds: null, turns: null },
      changes: [{
        key: 'flags.dnd5e.regeneration',
        mode: 5, // OVERRIDE
        value: data.rigenerazione,
        priority: 20
      }]
    });
  }

  return effects;
}

/**
 * Crea i dati del token
 */
function createTokenData(data) {
  const size = mapSize(data.taglia);
  const sizeMap = {
    'tiny': 0.5,
    'sm': 1,
    'med': 1,
    'lg': 2,
    'huge': 3,
    'grg': 4
  };

  const tokenSize = sizeMap[size] || 1;

  return {
    name: data.nome || 'Creatura',
    displayName: 20, // OWNER_HOVER
    actorLink: false,
    texture: {
      src: data.token_img || data.img || getCreatureImage(data),
      scaleX: 1,
      scaleY: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0
    },
    width: tokenSize,
    height: tokenSize,
    lockRotation: false,
    rotation: 0,
    alpha: 1,
    disposition: data.disposizione || -1, // Hostile di default
    displayBars: 40, // OWNER
    bar1: {
      attribute: 'attributes.hp'
    },
    bar2: {
      attribute: null
    },
    light: {
      alpha: 0.5,
      angle: 360,
      bright: 0,
      coloration: 1,
      dim: 0,
      animation: {
        speed: 5,
        intensity: 5,
        reverse: false,
        type: null
      }
    },
    sight: {
      enabled: false,
      range: 0,
      angle: 360,
      visionMode: 'basic',
      color: null,
      attenuation: 0.1,
      brightness: 0,
      saturation: 0,
      contrast: 0
    },
    detectionModes: [],
    flags: {},
    randomImg: false
  };
}

export default convertCreature;