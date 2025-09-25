/**
 * Converter specializzato per equipaggiamento (armi, armature, oggetti)
 * Mappa tutti i campi dal database Brancalonia allo schema dnd5e
 */

import { generateFoundryId, getDefaultImage } from '../utils/common.mjs';

/**
 * Converte un'arma dal formato database al formato Foundry dnd5e
 */
export function convertWeapon(data, filePath) {
  const id = generateFoundryId(filePath);

  const weapon = {
    _id: id,
    _key: `!items!${id}`,
    name: data.nome || data.name || 'Arma',
    type: 'weapon',
    img: data.img || getDefaultImage('weapon'),
    system: {
      description: {
        value: formatItemDescription(data),
        chat: '',
        unidentified: data.descrizione_nascosta || ''
      },
      source: data.fonte?.manuale || data.fonte || 'Brancalonia',

      // Quantità e peso
      quantity: data.quantita || 1,
      weight: parseWeight(data.peso),

      // Prezzo
      price: {
        value: parsePrice(data.costo),
        denomination: 'gp'
      },

      // Identificazione e rarità
      identified: data.identificato !== false,
      rarity: mapRarity(data.rarita || data.categoria),

      // Attunement
      attunement: mapAttunement(data),
      attuned: false,

      // Equipaggiamento
      equipped: false,

      // Tipo di arma
      weaponType: mapWeaponType(data),
      baseItem: mapBaseWeapon(data),

      // Proprietà dell'arma
      properties: mapWeaponProperties(data.proprieta),

      // Bonus magici
      magicalBonus: parseMagicalBonus(data),

      // Proficienza
      proficient: data.proficiente !== false,

      // Attivazione
      activation: {
        type: data.attivazione?.tipo || '',
        cost: data.attivazione?.costo || null,
        condition: data.attivazione?.condizione || ''
      },

      // Durata (per effetti temporanei)
      duration: {
        value: data.durata?.valore || '',
        units: data.durata?.unita || ''
      },

      // Bersaglio
      target: {
        value: data.bersaglio?.valore || null,
        width: null,
        units: '',
        type: data.bersaglio?.tipo || ''
      },

      // Gittata
      range: mapWeaponRange(data),

      // Utilizzi (per oggetti con cariche)
      uses: {
        value: data.cariche?.attuali || null,
        max: data.cariche?.massime || '',
        per: data.cariche?.per || null,
        recovery: data.cariche?.recupero || '',
        autoDestroy: data.cariche?.distruggi_a_zero || false,
        autoUse: true
      },

      // Consumo
      consume: {
        type: '',
        target: null,
        amount: null,
        scale: false
      },

      // Abilità e tipo azione
      ability: mapWeaponAbility(data),
      actionType: mapActionType(data),

      // Bonus di attacco (sempre presente)
      attackBonus: data.bonus_attacco || '0',

      // Chat Flavor
      chatFlavor: data.flavor || '',

      // Critico
      critical: {
        threshold: data.critico?.soglia || null,
        damage: data.critico?.danno_extra || ''
      },

      // Danno
      damage: mapWeaponDamage(data),

      // Formula (per effetti speciali)
      formula: data.formula_speciale || '',

      // Tiro salvezza
      save: {
        ability: data.tiro_salvezza?.caratteristica || '',
        dc: data.tiro_salvezza?.cd || null,
        scaling: 'flat'
      },

      // Munizioni
      ammunition: {
        value: data.munizioni?.tipo || '',
        consumed: data.munizioni?.consumate !== false
      }
    },

    // Effetti attivi
    effects: mapItemEffects(data),

    // Metadata
    folder: null,
    sort: 0,
    ownership: { default: 0 },

    // Flags
    flags: {
      brancalonia: {
        id_originale: data.id,
        categoria: data.categoria,
        sottotipo: data.sottotipo,
        qualita_scadente: data.qualita_scadente,
        note_meccaniche: data.note_meccaniche,
        validazione: data.validazione,
        implementazione: data.implementazione
      }
    }
  };

  return weapon;
}

/**
 * Converte un'armatura
 */
export function convertArmor(data, filePath) {
  const id = generateFoundryId(filePath);

  const armor = {
    _id: id,
    _key: `!items!${id}`,
    name: data.nome || data.name || 'Armatura',
    type: 'equipment',
    img: data.img || getDefaultImage('equipment'),
    system: {
      description: {
        value: formatItemDescription(data),
        chat: '',
        unidentified: data.descrizione_nascosta || ''
      },
      source: data.fonte?.manuale || data.fonte || 'Brancalonia',

      // Quantità e peso
      quantity: data.quantita || 1,
      weight: parseWeight(data.peso),

      // Prezzo
      price: {
        value: parsePrice(data.costo),
        denomination: 'gp'
      },

      // Identificazione e rarità
      identified: data.identificato !== false,
      rarity: mapRarity(data.rarita || data.categoria),

      // Attunement
      attunement: mapAttunement(data),
      attuned: false,

      // Equipaggiamento
      equipped: false,

      // Tipo di equipaggiamento
      type: {
        value: 'armor',
        subtype: mapArmorType(data),
        baseItem: mapBaseArmor(data)
      },

      // Statistiche armatura
      armor: {
        value: parseInt(data.classe_armatura) || parseInt(data.ca) || 10,
        type: mapArmorType(data),
        dex: mapDexBonus(data),
        magicalBonus: parseMagicalBonus(data)
      },

      // Requisiti forza
      strength: data.forza_minima || null,

      // Furtività
      stealth: data.svantaggio_furtivita === true,

      // Proficienza
      proficient: data.proficiente !== false,

      // Proprietà speciali
      properties: mapArmorProperties(data),

      // Attivazione (per armature magiche)
      activation: {
        type: data.attivazione?.tipo || '',
        cost: data.attivazione?.costo || null,
        condition: data.attivazione?.condizione || ''
      },

      // Utilizzi (per oggetti con cariche)
      uses: {
        value: data.cariche?.attuali || null,
        max: data.cariche?.massime || '',
        per: data.cariche?.per || null,
        recovery: data.cariche?.recupero || ''
      }
    },

    // Effetti attivi
    effects: mapItemEffects(data),

    // Metadata
    folder: null,
    sort: 0,
    ownership: { default: 0 },

    // Flags
    flags: {
      brancalonia: {
        id_originale: data.id,
        categoria: data.categoria,
        qualita_scadente: data.qualita_scadente,
        note_meccaniche: data.note_meccaniche,
        validazione: data.validazione
      }
    }
  };

  return armor;
}

/**
 * Converte un cimelo (oggetto magico)
 */
export function convertMagicItem(data, filePath) {
  const id = generateFoundryId(filePath);

  const item = {
    _id: id,
    _key: `!items!${id}`,
    name: data.nome || data.name || 'Cimelo',
    type: 'equipment',
    img: data.img || getDefaultImage('equipment'),
    system: {
      description: {
        value: formatMagicItemDescription(data),
        chat: '',
        unidentified: data.descrizione_nascosta || 'Un oggetto misterioso'
      },
      source: data.fonte || 'Brancalonia',

      // Quantità e peso
      quantity: 1,
      weight: parseWeight(data.peso) || 0.5,

      // Prezzo
      price: {
        value: parsePrice(data.valore || data.costo),
        denomination: 'gp'
      },

      // Identificazione e rarità
      identified: data.identificato !== false,
      rarity: mapRarity(data.rarita) || 'uncommon',

      // Attunement sempre richiesto per i cimeli
      attunement: data.attunement === false ? 0 : 1,
      attuned: false,

      // Equipaggiamento
      equipped: false,

      // Tipo di equipaggiamento
      type: {
        value: mapMagicItemType(data),
        subtype: data.sottotipo || '',
        baseItem: ''
      },

      // Attivazione
      activation: {
        type: mapMagicItemActivation(data),
        cost: 1,
        condition: data.condizione_attivazione || ''
      },

      // Durata degli effetti
      duration: {
        value: data.durata || '',
        units: data.unita_durata || ''
      },

      // Bersaglio
      target: {
        value: data.bersaglio || null,
        width: null,
        units: '',
        type: ''
      },

      // Gittata
      range: {
        value: null,
        long: null,
        units: ''
      },

      // Utilizzi/Cariche
      uses: {
        value: data.cariche?.attuali || null,
        max: data.cariche?.massime || '',
        per: data.cariche?.per || 'day',
        recovery: data.cariche?.recupero || '1d6+4',
        autoDestroy: data.distruggi_senza_cariche || false,
        autoUse: true
      },

      // Proprietà speciali
      properties: mapMagicItemProperties(data),

      // Maledizioni
      ...(data.maledizione && {
        cursed: true,
        curse: data.maledizione_specifica || data.maledizione
      })
    },

    // Effetti attivi
    effects: mapMagicItemEffects(data),

    // Metadata
    folder: null,
    sort: 0,
    ownership: { default: 0 },

    // Flags
    flags: {
      brancalonia: {
        id_originale: data.id,
        categoria: 'cimelo',
        storia: data.storia,
        proprieta_originale: data.proprieta,
        maledizione: data.maledizione,
        maledizione_specifica: data.maledizione_specifica,
        implementazione: data.implementazione
      }
    }
  };

  return item;
}

// Helper Functions

/**
 * Formatta la descrizione di un oggetto
 */
function formatItemDescription(data) {
  let desc = '';

  if (data.descrizione) {
    desc += `<p>${data.descrizione}</p>`;
  }

  if (data.proprieta && typeof data.proprieta === 'string') {
    desc += `<h3>Proprietà</h3>`;
    desc += `<p>${data.proprieta}</p>`;
  }

  if (data.note_meccaniche) {
    desc += `<h3>Note Meccaniche</h3>`;
    desc += `<p>${data.note_meccaniche}</p>`;
  }

  return desc;
}

/**
 * Formatta la descrizione di un oggetto magico
 */
function formatMagicItemDescription(data) {
  let desc = formatItemDescription(data);

  if (data.storia) {
    desc += `<h3>Storia</h3>`;
    desc += `<p><em>${data.storia}</em></p>`;
  }

  if (data.maledizione) {
    desc += `<h3>Maledizione</h3>`;
    desc += `<p><strong>${data.maledizione}</strong></p>`;
    if (data.maledizione_specifica) {
      desc += `<p>${data.maledizione_specifica}</p>`;
    }
  }

  return desc;
}

/**
 * Parsifica il peso
 */
function parseWeight(weightString) {
  if (!weightString) return 0;
  const match = weightString.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Parsifica il prezzo
 */
function parsePrice(priceString) {
  if (!priceString) return 0;

  const match = priceString.match(/(\d+)\s*(mo|ma|mr|gp|sp|cp)/);
  if (match) {
    const value = parseInt(match[1]);
    const currency = match[2];

    // Conversione in GP
    switch(currency) {
      case 'mo':
      case 'gp':
        return value;
      case 'ma':
      case 'sp':
        return value / 10;
      case 'mr':
      case 'cp':
        return value / 100;
      default:
        return value;
    }
  }

  return parseInt(priceString) || 0;
}

/**
 * Mappa la rarità
 */
function mapRarity(rarity) {
  if (!rarity) return 'common';  // Default to common if no rarity

  const r = rarity.toLowerCase();

  if (r.includes('comune')) return 'common';
  if (r.includes('non comune')) return 'uncommon';
  if (r.includes('raro')) return 'rare';
  if (r.includes('molto raro')) return 'veryRare';
  if (r.includes('leggendario')) return 'legendary';
  if (r.includes('artefatto')) return 'artifact';

  // Per categorie specifiche
  if (r === 'cimelo') return 'uncommon';
  if (r.includes('scadente')) return 'common';

  return 'common';  // Default to common instead of empty string
}

/**
 * Mappa l'attunement
 */
function mapAttunement(data) {
  if (data.attunement === false) return 0;
  if (data.attunement === true) return 1;

  // Per cimeli, sempre richiesto a meno che non specificato
  if (data.categoria === 'Cimelo') return 1;

  // Per oggetti magici
  if (data.magico || data.bonus_magico) return 1;

  return 0;
}

/**
 * Mappa il tipo di arma
 */
function mapWeaponType(data) {
  const categoria = (data.categoria || '').toLowerCase();
  const sottotipo = (data.sottotipo || '').toLowerCase();

  // Armi semplici/marziali
  if (categoria.includes('semplice')) {
    if (sottotipo.includes('distanza')) return 'simpleR';
    return 'simpleM';
  }

  if (categoria.includes('marziale')) {
    if (sottotipo.includes('distanza')) return 'martialR';
    return 'martialM';
  }

  // Default basato su proprietà
  if (data.proprieta) {
    const props = Array.isArray(data.proprieta) ? data.proprieta.join(' ') : data.proprieta;
    if (props.toLowerCase().includes('distanza') || props.toLowerCase().includes('munizioni')) {
      return 'simpleR';
    }
  }

  return 'simpleM';
}

/**
 * Mappa l'arma base
 */
function mapBaseWeapon(data) {
  const nome = (data.nome || '').toLowerCase();

  const weaponMap = {
    'pugnale': 'dagger',
    'mazza': 'club',
    'spada corta': 'shortsword',
    'spada lunga': 'longsword',
    'arco corto': 'shortbow',
    'arco lungo': 'longbow',
    'balestra': 'lightCrossbow',
    'ascia': 'handaxe',
    'martello': 'warhammer',
    'lancia': 'spear',
    'bastone': 'quarterstaff'
  };

  for (const [ita, eng] of Object.entries(weaponMap)) {
    if (nome.includes(ita)) return eng;
  }

  return '';
}

/**
 * Mappa le proprietà dell'arma
 */
function mapWeaponProperties(properties) {
  if (!properties) return {};

  const props = {};
  const propString = Array.isArray(properties) ? properties.join(' ').toLowerCase() : properties.toLowerCase();

  // Mappa proprietà italiane -> codici dnd5e
  const propMap = {
    'munizioni': 'amm',
    'finezza': 'fin',
    'pesante': 'hvy',
    'leggera': 'lgt',
    'ricarica': 'lod',
    'portata': 'rch',
    'speciale': 'spc',
    'lancio': 'thr',
    'due mani': 'two',
    'versatile': 'ver',
    'argentata': 'sil',
    'magica': 'mgc',
    'focus': 'foc',
    'a distanza': 'rng'
  };

  for (const [ita, code] of Object.entries(propMap)) {
    if (propString.includes(ita)) {
      props[code] = true;
    }
  }

  return props;
}

/**
 * Parsifica il bonus magico
 */
function parseMagicalBonus(data) {
  if (data.bonus_magico) return parseInt(data.bonus_magico) || 0;

  const nome = (data.nome || '').toLowerCase();
  const match = nome.match(/\+(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Mappa la gittata dell'arma
 */
function mapWeaponRange(data) {
  const range = { value: null, long: null, units: '' };

  if (data.gittata) {
    // Formato: "6/18 m" o "30/120 ft"
    const match = data.gittata.match(/(\d+)\/(\d+)/);
    if (match) {
      range.value = parseInt(match[1]);
      range.long = parseInt(match[2]);
      range.units = data.gittata.includes('m') ? 'ft' : 'ft';

      // Converti metri in piedi se necessario
      if (data.gittata.includes('m')) {
        range.value = Math.round(range.value * 3.28084 / 5) * 5;
        range.long = Math.round(range.long * 3.28084 / 5) * 5;
      }
    }
  }

  // Default per armi da mischia
  if (!range.value && data.sottotipo === 'mischia') {
    range.value = 5;
    range.units = 'ft';
  }

  return range;
}

/**
 * Mappa l'abilità dell'arma
 */
function mapWeaponAbility(data) {
  // Se specificata esplicitamente
  if (data.caratteristica) {
    const abilityMap = {
      'forza': 'str',
      'destrezza': 'dex'
    };
    const mapped = abilityMap[data.caratteristica.toLowerCase()];
    if (mapped) return mapped;
  }

  // Se ha finezza, può usare DEX
  if (data.proprieta) {
    const props = Array.isArray(data.proprieta) ? data.proprieta.join(' ') : data.proprieta;
    if (props.toLowerCase().includes('finezza')) return '';
  }

  // Armi a distanza usano DEX
  if (data.sottotipo === 'distanza' || data.categoria?.includes('distanza')) {
    return 'dex';
  }

  // Default
  return '';
}

/**
 * Mappa il tipo di azione
 */
function mapActionType(data) {
  const sottotipo = (data.sottotipo || '').toLowerCase();

  if (sottotipo.includes('distanza')) return 'rwak';
  if (sottotipo.includes('mischia')) return 'mwak';

  // Se ha proprietà lancio
  if (data.proprieta) {
    const props = Array.isArray(data.proprieta) ? data.proprieta.join(' ') : data.proprieta;
    if (props.toLowerCase().includes('lancio')) return 'rwak';
  }

  return 'mwak';
}

/**
 * Mappa il danno dell'arma
 */
function mapWeaponDamage(data) {
  const damage = { parts: [], versatile: '' };

  // Danno principale
  if (data.danni) {
    const match = data.danni.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)\s*(\w+)/);
    if (match) {
      const damageType = mapDamageType(match[2]);
      damage.parts.push([match[1], damageType]);
    }
  } else if (data.danno) {
    // Fallback per altri formati
    damage.parts.push([data.danno, data.tipo_danno || 'slashing']);
  }

  // Se ancora non ha danno, aggiungi default
  if (damage.parts.length === 0) {
    damage.parts.push(['1d4', 'bludgeoning']);
  }

  // Danno versatile - sempre presente anche se vuoto
  if (data.danno_versatile) {
    const match = data.danno_versatile.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)/);
    if (match) {
      damage.versatile = match[1];
    }
  }

  // Assicura sempre stringa per versatile
  damage.versatile = damage.versatile || '';

  return damage;
}

/**
 * Mappa il tipo di danno
 */
function mapDamageType(type) {
  if (!type) return '';

  const t = type.toLowerCase();

  const typeMap = {
    'contundenti': 'bludgeoning',
    'perforanti': 'piercing',
    'taglienti': 'slashing',
    'acido': 'acid',
    'freddo': 'cold',
    'fuoco': 'fire',
    'forza': 'force',
    'fulmine': 'lightning',
    'necrotici': 'necrotic',
    'veleno': 'poison',
    'psichici': 'psychic',
    'radiosi': 'radiant',
    'tuono': 'thunder'
  };

  for (const [ita, eng] of Object.entries(typeMap)) {
    if (t.includes(ita)) return eng;
  }

  return 'bludgeoning';
}

/**
 * Mappa il tipo di armatura
 */
function mapArmorType(data) {
  const categoria = (data.categoria || '').toLowerCase();

  if (categoria.includes('leggera')) return 'light';
  if (categoria.includes('media')) return 'medium';
  if (categoria.includes('pesante')) return 'heavy';
  if (categoria.includes('scudo')) return 'shield';

  // Basato sul nome
  const nome = (data.nome || '').toLowerCase();
  if (nome.includes('cuoio')) return 'light';
  if (nome.includes('maglia')) return 'medium';
  if (nome.includes('piastre')) return 'heavy';
  if (nome.includes('scudo')) return 'shield';

  return 'light';
}

/**
 * Mappa il bonus DEX per armature
 */
function mapDexBonus(data) {
  const type = mapArmorType(data);

  if (type === 'heavy') return 0;
  if (type === 'medium') return 2;
  if (type === 'shield') return null;

  return null; // Light armor, no limit
}

/**
 * Mappa l'armatura base
 */
function mapBaseArmor(data) {
  const nome = (data.nome || '').toLowerCase();

  const armorMap = {
    'imbottita': 'padded',
    'cuoio': 'leather',
    'cuoio borchiato': 'studdedLeather',
    'pelle': 'hide',
    'giaco di maglia': 'chainShirt',
    'scaglie': 'scalemail',
    'corazza di piastre': 'breastplate',
    'mezza armatura': 'halfPlate',
    'cotta di maglia': 'ringmail',
    'maglia': 'chainmail',
    'stecche': 'splint',
    'piastre': 'plate',
    'scudo': 'shield'
  };

  for (const [ita, eng] of Object.entries(armorMap)) {
    if (nome.includes(ita)) return eng;
  }

  return '';
}

/**
 * Mappa le proprietà dell'armatura
 */
function mapArmorProperties(data) {
  const props = {};

  if (data.svantaggio_furtivita) props.stealthDisadvantage = true;
  if (data.magica) props.mgc = true;

  return props;
}

/**
 * Mappa il tipo di oggetto magico
 */
function mapMagicItemType(data) {
  const nome = (data.nome || '').toLowerCase();

  if (nome.includes('anello')) return 'ring';
  if (nome.includes('amuleto') || nome.includes('collana')) return 'neck';
  if (nome.includes('cinta') || nome.includes('cintura')) return 'waist';
  if (nome.includes('mantello')) return 'back';
  if (nome.includes('guanti')) return 'hands';
  if (nome.includes('stivali')) return 'feet';
  if (nome.includes('elmo')) return 'head';
  if (nome.includes('bracciali')) return 'arms';

  return 'trinket';
}

/**
 * Mappa l'attivazione dell'oggetto magico
 */
function mapMagicItemActivation(data) {
  if (!data.proprieta) return '';

  const prop = (data.proprieta || '').toLowerCase();

  if (prop.includes('sempre attivo')) return '';
  if (prop.includes('azione')) return 'action';
  if (prop.includes('bonus')) return 'bonus';
  if (prop.includes('reazione')) return 'reaction';

  return 'action';
}

/**
 * Mappa le proprietà dell'oggetto magico
 */
function mapMagicItemProperties(data) {
  const props = {};

  if (data.magico !== false) props.mgc = true;
  if (data.maledizione) props.cursed = true;

  return props;
}

/**
 * Mappa gli effetti dell'oggetto
 */
function mapItemEffects(data) {
  const effects = [];

  // Se ci sono effetti predefiniti
  if (data.implementazione?.active_effects) {
    return data.implementazione.active_effects;
  }

  // Qualità scadente
  if (data.qualita_scadente) {
    effects.push({
      _id: generateEffectId(),
      name: 'Qualità Scadente',
      icon: 'icons/skills/wounds/injury-pain-body-orange.webp',
      origin: null,
      transfer: true,
      disabled: false,
      changes: [{
        key: 'system.bonuses.mwak.attack',
        mode: 2, // ADD
        value: '-1',
        priority: 20
      }, {
        key: 'system.bonuses.mwak.damage',
        mode: 2, // ADD
        value: '-1',
        priority: 20
      }]
    });
  }

  return effects;
}

/**
 * Mappa gli effetti degli oggetti magici
 */
function mapMagicItemEffects(data) {
  const effects = [];

  // Effetti base dall'oggetto
  const baseEffects = mapItemEffects(data);
  effects.push(...baseEffects);

  // Effetti specifici dei cimeli
  if (data.proprieta) {
    const prop = data.proprieta.toLowerCase();

    // Vantaggio su prove specifiche
    if (prop.includes('vantaggio')) {
      const match = prop.match(/vantaggio.*?(inganno|persuasione|intimidire|percezione|intuizione)/i);
      if (match) {
        const skill = mapSkillFromItalian(match[1]);
        if (skill) {
          effects.push({
            _id: generateEffectId(),
            name: `Vantaggio ${match[1]}`,
            icon: 'icons/magic/control/buff-flight-wings-blue.webp',
            origin: null,
            transfer: true,
            disabled: false,
            changes: [{
              key: `flags.dnd5e.advantage.skill.${skill}`,
              mode: 5, // OVERRIDE
              value: '1',
              priority: 20
            }]
          });
        }
      }
    }

    // Svantaggio (maledizioni)
    if (data.maledizione_specifica && data.maledizione_specifica.includes('svantaggio')) {
      const match = data.maledizione_specifica.match(/svantaggio.*?(tiri salvezza|TS)/i);
      if (match) {
        effects.push({
          _id: generateEffectId(),
          name: 'Maledizione - Svantaggio TS',
          icon: 'icons/magic/unholy/strike-hand-glow-pink.webp',
          origin: null,
          transfer: true,
          disabled: false,
          changes: [{
            key: 'flags.dnd5e.disadvantage.save.all',
            mode: 5, // OVERRIDE
            value: '1',
            priority: 20
          }]
        });
      }
    }
  }

  return effects;
}

/**
 * Mappa skill italiana -> codice dnd5e
 */
function mapSkillFromItalian(skillName) {
  const skillMap = {
    'acrobazia': 'acr',
    'addestrare animali': 'ani',
    'arcano': 'arc',
    'atletica': 'ath',
    'inganno': 'dec',
    'storia': 'his',
    'intuizione': 'ins',
    'intimidire': 'inti',
    'indagare': 'inv',
    'medicina': 'med',
    'natura': 'nat',
    'percezione': 'prc',
    'intrattenere': 'prf',
    'persuasione': 'per',
    'religione': 'rel',
    'rapidità di mano': 'slt',
    'furtività': 'ste',
    'sopravvivenza': 'sur'
  };

  return skillMap[skillName.toLowerCase()] || '';
}

/**
 * Genera un ID per un effect
 */
function generateEffectId() {
  return Math.random().toString(36).substr(2, 16);
}

export default { convertWeapon, convertArmor, convertMagicItem };