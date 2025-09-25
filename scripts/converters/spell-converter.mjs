/**
 * Converter specializzato per incantesimi
 * Mappa tutti i campi dal database Brancalonia allo schema dnd5e
 */

import { generateFoundryId, getDefaultImage } from '../utils/common.mjs';

/**
 * Converte un incantesimo dal formato database al formato Foundry dnd5e
 */
export function convertSpell(data, filePath) {
  const id = generateFoundryId(filePath);

  const spell = {
    _id: id,
    _key: `!items!${id}`,
    name: data.nome || data.name || 'Incantesimo',
    type: 'spell',
    img: data.img || getDefaultImage('spell'),
    system: {
      description: {
        value: formatDescription(data),
        chat: data.descrizione_breve || '',
        unidentified: ''
      },
      source: data.fonte || 'Brancalonia',

      // Livello e scuola
      level: data.livello || 0,
      school: mapSpellSchool(data.scuola),

      // Componenti - legge direttamente i booleani dal database
      components: {
        vocal: data.componenti?.verbale === true,
        somatic: data.componenti?.somatica === true,
        material: data.componenti?.materiale === true,
        ritual: data.rituale === true,
        concentration: data.concentrazione === true
      },

      // Materiali
      materials: {
        value: data.materiali || data.componenti?.materiali || '',
        consumed: data.componenti?.materiali_consumati || false,
        cost: data.costo_materiali || 0,
        supply: 0
      },

      // Preparazione
      preparation: {
        mode: 'prepared',
        prepared: false
      },

      // Attivazione
      activation: {
        type: mapActivationType(data.tempo_lancio),
        cost: extractActivationCost(data.tempo_lancio),
        condition: data.condizioni || ''
      },

      // Durata
      duration: mapDuration(data.durata),

      // Gittata
      range: mapRange(data.gittata),

      // Bersaglio
      target: mapTarget(data.bersaglio || data.area),

      // Area di effetto
      ...(data.area && { area: mapArea(data.area) }),

      // Tiro salvezza
      save: {
        ability: mapSaveAbility(data.tiro_salvezza),
        dc: data.cd_salvezza || null,
        scaling: 'spell'
      },

      // Scaling
      scaling: mapScaling(data.livelli_superiori, data.scaling),

      // Utilizzi (per incantesimi con cariche)
      uses: {
        value: data.usi?.valore || null,
        max: data.usi?.massimo || '',
        per: data.usi?.per || null,
        recovery: data.usi?.recupero || ''
      },

      // Tipo di azione
      actionType: mapActionType(data),

      // Bonus di attacco (per spell attack)
      attackBonus: data.bonus_attacco || '',

      // Chat flavor
      chatFlavor: data.flavor || '',

      // Critico
      critical: {
        threshold: null,
        damage: ''
      },

      // Danno
      damage: mapSpellDamage(data),

      // Formula generica
      formula: data.formula || '',

      // Requisiti
      requirements: data.prerequisiti || '',

      // Tipo di incantesimo (per sottotipi)
      type: {
        value: data.sottotipo || '',
        subtype: ''
      }
    },

    // Effetti attivi
    effects: mapActiveEffects(data),

    // Metadata
    folder: null,
    sort: 0,
    ownership: { default: 0 },

    // Flags Brancalonia
    flags: {
      brancalonia: {
        id_originale: data.id,
        fonte: data.fonte,
        meccaniche: data.meccaniche_brancalonia,
        qualita_scadente: data.qualita_scadente_rules,
        utilizzi: data.utilizzi,
        note_dm: data.note_dm,
        flavor: data.flavor_brancalonia,
        implementazione: data.implementazione_foundry
      },
      dnd5e: {
        itemData: {
          school: data.scuola,
          level: data.livello
        }
      }
    }
  };

  return spell;
}

/**
 * Formatta la descrizione completa
 */
function formatDescription(data) {
  let desc = '';

  if (data.descrizione) {
    desc += `<p>${data.descrizione}</p>`;
  }

  if (data.livelli_superiori) {
    desc += `<h3>Ai Livelli Superiori</h3>`;
    desc += `<p>${data.livelli_superiori}</p>`;
  }

  if (data.utilizzi && Array.isArray(data.utilizzi)) {
    desc += `<h3>Utilizzi Tipici</h3>`;
    desc += '<ul>';
    data.utilizzi.forEach(uso => {
      desc += `<li>${uso}</li>`;
    });
    desc += '</ul>';
  }

  if (data.note_dm) {
    desc += `<h3>Note per il DM</h3>`;
    desc += `<p><em>${data.note_dm}</em></p>`;
  }

  return desc;
}

/**
 * Mappa la scuola di magia
 */
function mapSpellSchool(school) {
  const schoolMap = {
    'Abiurazione': 'abj',
    'Ammaliamento': 'enc',
    'Divinazione': 'div',
    'Evocazione': 'evo',
    'Illusione': 'ill',
    'Invocazione': 'con',
    'Necromanzia': 'nec',
    'Trasmutazione': 'trs'
  };
  return schoolMap[school] || 'evo';
}

/**
 * Mappa il tipo di attivazione
 */
function mapActivationType(timeCast) {
  if (!timeCast) return 'action';

  const time = timeCast.toLowerCase();

  if (time.includes('bonus')) return 'bonus';
  if (time.includes('reazione')) return 'reaction';
  if (time.includes('minuto') || time.includes('minuti')) return 'minute';
  if (time.includes('ora') || time.includes('ore')) return 'hour';
  if (time === '1 azione' || time === 'azione') return 'action';

  return 'action';
}

/**
 * Estrae il costo di attivazione
 */
function extractActivationCost(timeCast) {
  if (!timeCast) return 1;

  const match = timeCast.match(/(\d+)/);
  return match ? parseInt(match[1]) : 1;
}

/**
 * Mappa la durata
 */
function mapDuration(duration) {
  if (!duration) return { value: '', units: '' };

  const dur = duration.toLowerCase();

  if (dur === 'istantanea') return { value: '', units: 'inst' };
  if (dur === 'fino a dissolto') return { value: '', units: 'perm' };
  if (dur === 'speciale') return { value: '', units: 'spec' };

  // Concentrazione
  if (dur.includes('concentrazione')) {
    const match = dur.match(/(\d+)\s*(\w+)/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];

      if (unit.includes('round')) return { value, units: 'round' };
      if (unit.includes('minut')) return { value, units: 'minute' };
      if (unit.includes('or')) return { value, units: 'hour' };
      if (unit.includes('giorn')) return { value, units: 'day' };
    }
  }

  // Durata normale
  const match = dur.match(/(\d+)\s*(\w+)/);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2];

    if (unit.includes('round')) return { value, units: 'round' };
    if (unit.includes('minut')) return { value, units: 'minute' };
    if (unit.includes('or')) return { value, units: 'hour' };
    if (unit.includes('giorn')) return { value, units: 'day' };
  }

  return { value: '', units: '' };
}

/**
 * Mappa la gittata
 */
function mapRange(range) {
  if (!range) return { value: null, long: null, units: '' };

  const r = range.toLowerCase();

  if (r === 'personale' || r === 'incantatore') return { value: null, long: null, units: 'self' };
  if (r === 'contatto') return { value: null, long: null, units: 'touch' };
  if (r === 'vista') return { value: null, long: null, units: 'sight' };
  if (r === 'illimitata') return { value: null, long: null, units: 'unlimited' };
  if (r === 'speciale') return { value: null, long: null, units: 'spec' };

  // Metri -> piedi
  const metersMatch = r.match(/(\d+)\s*metri/);
  if (metersMatch) {
    const meters = parseInt(metersMatch[1]);
    const feet = Math.round(meters * 3.28084 / 5) * 5; // Arrotonda ai 5 piedi
    return { value: feet, long: null, units: 'ft' };
  }

  // Piedi diretti
  const feetMatch = r.match(/(\d+)\s*(?:piedi|ft)/);
  if (feetMatch) {
    return { value: parseInt(feetMatch[1]), long: null, units: 'ft' };
  }

  return { value: 30, long: null, units: 'ft' };
}

/**
 * Mappa il bersaglio
 */
function mapTarget(target) {
  if (!target) return { value: null, width: null, units: '', type: '' };

  const t = target.toLowerCase();

  // Numero di creature
  const creatureMatch = t.match(/(\d+)\s*creatur/);
  if (creatureMatch) {
    return { value: parseInt(creatureMatch[1]), width: null, units: '', type: 'creature' };
  }

  if (t.includes('creatura')) return { value: 1, width: null, units: '', type: 'creature' };
  if (t.includes('oggetto')) return { value: 1, width: null, units: '', type: 'object' };
  if (t.includes('alleato')) return { value: 1, width: null, units: '', type: 'ally' };
  if (t.includes('nemico')) return { value: 1, width: null, units: '', type: 'enemy' };

  return { value: null, width: null, units: '', type: '' };
}

/**
 * Mappa l'area di effetto
 */
function mapArea(area) {
  if (!area) return null;

  const a = area.toLowerCase();
  const result = { value: null, units: 'ft', type: '' };

  // Tipo di area
  if (a.includes('sfera')) result.type = 'sphere';
  else if (a.includes('cubo')) result.type = 'cube';
  else if (a.includes('cono')) result.type = 'cone';
  else if (a.includes('linea')) result.type = 'line';
  else if (a.includes('cilindro')) result.type = 'cylinder';
  else if (a.includes('quadrato')) result.type = 'square';

  // Dimensione
  const sizeMatch = a.match(/(\d+)\s*metri/);
  if (sizeMatch) {
    const meters = parseInt(sizeMatch[1]);
    result.value = Math.round(meters * 3.28084 / 5) * 5;
  }

  const feetMatch = a.match(/(\d+)\s*(?:piedi|ft)/);
  if (feetMatch) {
    result.value = parseInt(feetMatch[1]);
  }

  return result;
}

/**
 * Mappa l'abilità del tiro salvezza
 */
function mapSaveAbility(save) {
  if (!save) return '';

  const s = save.toLowerCase();

  if (s.includes('forz')) return 'str';
  if (s.includes('destr')) return 'dex';
  if (s.includes('costit')) return 'con';
  if (s.includes('intell')) return 'int';
  if (s.includes('sagg')) return 'wis';
  if (s.includes('caris')) return 'cha';

  return '';
}

/**
 * Mappa lo scaling dell'incantesimo
 */
function mapScaling(higherLevels, scalingData) {
  if (!higherLevels && !scalingData) {
    return { mode: 'none', formula: '' };
  }

  // Se c'è scaling esplicito
  if (scalingData) {
    if (scalingData.danno) return { mode: 'level', formula: scalingData.danno };
    if (scalingData.bersagli) return { mode: 'level', formula: '' };
  }

  // Analizza il testo dei livelli superiori
  if (higherLevels) {
    const h = higherLevels.toLowerCase();

    if (h.includes('dado') || h.includes('danni')) {
      return { mode: 'level', formula: '1d6' }; // Default scaling
    }

    if (h.includes('slot')) {
      return { mode: 'level', formula: '' };
    }
  }

  return { mode: 'none', formula: '' };
}

/**
 * Mappa il tipo di azione
 */
function mapActionType(data) {
  // Se c'è un attacco
  if (data.attacco_incantesimo) {
    return data.attacco_incantesimo.includes('distanza') ? 'rsak' : 'msak';
  }

  // Se c'è un tiro salvezza
  if (data.tiro_salvezza) {
    return 'save';
  }

  // Se c'è danno
  if (data.danno || data.danni) {
    return 'damage';
  }

  // Se c'è guarigione
  if (data.guarigione) {
    return 'heal';
  }

  // Utility
  return 'util';
}

/**
 * Mappa il danno dell'incantesimo
 */
function mapSpellDamage(data) {
  const parts = [];
  const versatile = '';

  // Danno principale
  if (data.danno) {
    const match = data.danno.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)\s*(?:danni\s+)?(\w+)/);
    if (match) {
      const damageType = mapDamageType(match[2]);
      parts.push([match[1], damageType]);
    }
  }

  // Danni multipli
  if (data.danni && Array.isArray(data.danni)) {
    data.danni.forEach(danno => {
      const match = danno.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)\s*(?:danni\s+)?(\w+)/);
      if (match) {
        const damageType = mapDamageType(match[2]);
        parts.push([match[1], damageType]);
      }
    });
  }

  return { parts, versatile };
}

/**
 * Mappa il tipo di danno
 */
function mapDamageType(type) {
  if (!type) return '';

  const t = type.toLowerCase();

  const typeMap = {
    'acido': 'acid',
    'contundenti': 'bludgeoning',
    'freddo': 'cold',
    'fuoco': 'fire',
    'forza': 'force',
    'fulmine': 'lightning',
    'necrotici': 'necrotic',
    'perforanti': 'piercing',
    'veleno': 'poison',
    'psichici': 'psychic',
    'radiosi': 'radiant',
    'taglienti': 'slashing',
    'tuono': 'thunder'
  };

  for (const [ita, eng] of Object.entries(typeMap)) {
    if (t.includes(ita)) return eng;
  }

  return '';
}

/**
 * Mappa gli Active Effects
 */
function mapActiveEffects(data) {
  const effects = [];

  // Se ci sono effetti predefiniti
  if (data.implementazione_foundry?.active_effects) {
    return data.implementazione_foundry.active_effects;
  }

  // Genera effetti dalle meccaniche Brancalonia
  if (data.meccaniche_brancalonia?.qualita_scadente === 'Rimuove temporaneamente') {
    effects.push({
      _id: generateEffectId(),
      name: 'Bollo di Qualità',
      icon: 'icons/magic/symbols/rune-sigil-red.webp',
      origin: null,
      transfer: true,
      duration: { startTime: null, seconds: 3600, turns: null },
      disabled: false,
      changes: [{
        key: 'flags.brancalonia.qualita_scadente',
        mode: 5, // OVERRIDE
        value: 'false',
        priority: 20
      }]
    });
  }

  return effects;
}

/**
 * Genera un ID per un effect
 */
function generateEffectId() {
  return Math.random().toString(36).substr(2, 16);
}

export default convertSpell;