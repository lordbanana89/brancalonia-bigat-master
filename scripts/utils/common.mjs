/**
 * Utility comuni per i converter
 */

import crypto from 'crypto';
import path from 'path';

/**
 * Genera un ID Foundry deterministico dal percorso del file
 */
export function generateFoundryId(filePath) {
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
 * Ottiene l'immagine default per un tipo di documento
 */
export function getDefaultImage(type) {
  const images = {
    // Items
    'weapon': 'icons/weapons/swords/sword-guard-purple.webp',
    'equipment': 'icons/equipment/chest/breastplate-metal-copper.webp',
    'consumable': 'icons/consumables/potions/bottle-round-corked-red.webp',
    'tool': 'icons/tools/instruments/lute-gold-brown.webp',
    'loot': 'icons/containers/bags/coinpouch-simple-leather-brown.webp',
    'spell': 'icons/magic/light/orb-lightbulb-gray.webp',
    'feat': 'icons/skills/yellow/affinity-puzzle.webp',
    'background': 'icons/skills/trades/academics-study-reading-book.webp',
    'race': 'icons/environment/people/group.webp',
    'class': 'icons/skills/melee/weapons-crossed-swords-yellow.webp',
    'subclass': 'icons/skills/melee/weapons-crossed-swords-blue.webp',

    // Actors
    'npc': 'icons/svg/mystery-man.svg',
    'character': 'icons/svg/cowled.svg',

    // Altri
    'journal': 'icons/svg/book.svg',
    'table': 'icons/svg/d20-highlight.svg',
    'folder': 'icons/svg/folder.svg',
    'item': 'icons/svg/item-bag.svg'
  };

  return images[type] || 'icons/svg/mystery-man.svg';
}

/**
 * Ottiene la collezione per un tipo di documento
 */
export function getCollection(type) {
  const map = {
    // Actors
    'npc': 'actors',
    'character': 'actors',
    'vehicle': 'actors',
    'group': 'actors',

    // Items
    'weapon': 'items',
    'equipment': 'items',
    'consumable': 'items',
    'tool': 'items',
    'loot': 'items',
    'background': 'items',
    'class': 'items',
    'subclass': 'items',
    'spell': 'items',
    'feat': 'items',
    'race': 'items',

    // Altri
    'journal': 'journal',
    'journalEntry': 'journal',
    'table': 'tables',
    'rollTable': 'tables',
    'macro': 'macros',
    'playlist': 'playlists',
    'scene': 'scenes'
  };

  return map[type] || 'items';
}

/**
 * Converte metri in piedi (arrotondati ai 5 piedi)
 */
export function metersToFeet(meters) {
  if (!meters) return 0;
  const m = typeof meters === 'string' ? parseInt(meters.replace(/[^0-9]/g, '')) : meters;
  if (isNaN(m)) return 0;
  return Math.round(m * 3.28084 / 5) * 5;
}

/**
 * Parsifica una stringa di velocità
 */
export function parseSpeed(speedString) {
  if (!speedString) return 0;
  if (typeof speedString === 'number') return speedString;

  const meters = parseInt(speedString.replace(/[^0-9]/g, ''));
  if (isNaN(meters)) return 0;

  return metersToFeet(meters);
}

/**
 * Mappa skill italiana -> codice dnd5e
 */
export function mapSkillCode(skillName) {
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
    'sopravvivenza': 'sur',
    'furtivita': 'ste' // Variante comune
  };

  return skillMap[skillName.toLowerCase()] || '';
}

/**
 * Ottiene l'abilità associata a una skill
 */
export function getSkillAbility(skill) {
  const skillAbilities = {
    'acr': 'dex',  // Acrobazia
    'ani': 'wis',  // Addestrare Animali
    'arc': 'int',  // Arcano
    'ath': 'str',  // Atletica
    'dec': 'cha',  // Inganno
    'his': 'int',  // Storia
    'ins': 'wis',  // Intuizione
    'inti': 'cha', // Intimidire
    'inv': 'int',  // Indagare
    'med': 'wis',  // Medicina
    'nat': 'int',  // Natura
    'prc': 'wis',  // Percezione
    'prf': 'cha',  // Intrattenere
    'per': 'cha',  // Persuasione
    'rel': 'int',  // Religione
    'slt': 'dex',  // Rapidità di Mano
    'ste': 'dex',  // Furtività
    'sur': 'wis'   // Sopravvivenza
  };

  return skillAbilities[skill] || 'str';
}

/**
 * Calcola il modificatore di una caratteristica
 */
export function getAbilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

/**
 * Mappa taglia italiana -> codice dnd5e
 */
export function mapSize(sizeString) {
  if (!sizeString) return 'med';

  const sizeMap = {
    'minuscola': 'tiny',
    'piccolissima': 'tiny',
    'piccola': 'sm',
    'media': 'med',
    'grande': 'lg',
    'enorme': 'huge',
    'mastodontica': 'grg',
    'colossale': 'grg'
  };

  return sizeMap[sizeString.toLowerCase()] || 'med';
}

/**
 * Mappa tipo di creatura
 */
export function mapCreatureType(type) {
  if (!type) return 'humanoid';

  const t = type.toLowerCase();
  const typeMap = {
    'aberrazione': 'aberration',
    'bestia': 'beast',
    'celestiale': 'celestial',
    'costrutto': 'construct',
    'drago': 'dragon',
    'elementale': 'elemental',
    'fata': 'fey',
    'immondo': 'fiend',
    'gigante': 'giant',
    'umanoide': 'humanoid',
    'mostruosità': 'monstrosity',
    'melma': 'ooze',
    'vegetale': 'plant',
    'non morto': 'undead',
    'sciame': 'swarm'
  };

  for (const [ita, eng] of Object.entries(typeMap)) {
    if (t.includes(ita)) return eng;
  }

  return 'humanoid';
}

/**
 * Mappa tipo di danno italiano -> inglese
 */
export function mapDamageType(type) {
  if (!type) return '';

  const t = type.toLowerCase();
  const typeMap = {
    'acido': 'acid',
    'contundenti': 'bludgeoning',
    'contundente': 'bludgeoning',
    'freddo': 'cold',
    'fuoco': 'fire',
    'forza': 'force',
    'fulmine': 'lightning',
    'necrotici': 'necrotic',
    'necrotico': 'necrotic',
    'perforanti': 'piercing',
    'perforante': 'piercing',
    'veleno': 'poison',
    'psichici': 'psychic',
    'psichico': 'psychic',
    'radiosi': 'radiant',
    'radioso': 'radiant',
    'taglienti': 'slashing',
    'tagliente': 'slashing',
    'tuono': 'thunder'
  };

  for (const [ita, eng] of Object.entries(typeMap)) {
    if (t.includes(ita)) return eng;
  }

  return '';
}

/**
 * Parsifica linguaggi
 */
export function parseLanguages(langString) {
  if (!langString || langString === '-' || langString === '—') return [];

  const languages = langString.split(',').map(l => l.trim());
  const mapped = [];

  const langMap = {
    'comune': 'common',
    'volgare': 'common',
    'elfico': 'elvish',
    'nanico': 'dwarvish',
    'gigante': 'giant',
    'gnomesco': 'gnomish',
    'goblin': 'goblin',
    'halfling': 'halfling',
    'orchesco': 'orc',
    'abissale': 'abyssal',
    'celestiale': 'celestial',
    'draconico': 'draconic',
    'profondo': 'deep',
    'infernale': 'infernal',
    'primordiale': 'primordial',
    'silvano': 'sylvan',
    'sottocomune': 'undercommon',
    'petroglifico': 'primordial' // Brancalonia specific
  };

  languages.forEach(lang => {
    const l = lang.toLowerCase();
    const mapped_lang = langMap[l] || l;
    if (mapped_lang) mapped.push(mapped_lang);
  });

  return mapped;
}

/**
 * Parsifica immunità/resistenze/vulnerabilità
 */
export function parseDamageModifiers(modString) {
  if (!modString) return [];

  const mods = modString.split(/[,;]/).map(m => m.trim());
  const mapped = [];

  mods.forEach(mod => {
    const damageType = mapDamageType(mod);
    if (damageType) {
      mapped.push(damageType);
    }
  });

  return mapped;
}

/**
 * Parsifica condizioni
 */
export function parseConditions(condString) {
  if (!condString) return [];

  const conditions = condString.split(/[,;]/).map(c => c.trim());
  const mapped = [];

  const conditionMap = {
    'accecato': 'blinded',
    'affascinato': 'charmed',
    'assordato': 'deafened',
    'avvelenato': 'poisoned',
    'esausto': 'exhaustion',
    'invisibile': 'invisible',
    'paralizzato': 'paralyzed',
    'pietrificato': 'petrified',
    'prono': 'prone',
    'spaventato': 'frightened',
    'stordito': 'stunned',
    'trattenuto': 'restrained',
    'incapacitato': 'incapacitated',
    'afferrato': 'grappled'
  };

  conditions.forEach(cond => {
    const c = cond.toLowerCase();
    const mapped_cond = conditionMap[c];
    if (mapped_cond) {
      mapped.push(mapped_cond);
    }
  });

  return mapped;
}

/**
 * Genera un ID per un Active Effect
 */
export function generateEffectId() {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Sanitizza HTML per descrizioni
 */
export function sanitizeHtml(html) {
  if (!html) return '';

  // Converti caratteri speciali
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formatta testo in HTML paragrafi
 */
export function formatAsHtml(text) {
  if (!text) return '';

  // Se già HTML, ritorna così com'è
  if (text.includes('<p>') || text.includes('<div>')) {
    return text;
  }

  // Converti newline in paragrafi
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
}

export default {
  generateFoundryId,
  getDefaultImage,
  getCollection,
  metersToFeet,
  parseSpeed,
  mapSkillCode,
  getSkillAbility,
  getAbilityModifier,
  mapSize,
  mapCreatureType,
  mapDamageType,
  parseLanguages,
  parseDamageModifiers,
  parseConditions,
  generateEffectId,
  sanitizeHtml,
  formatAsHtml
};