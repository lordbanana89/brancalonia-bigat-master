/**
 * Brancalonia - Sistema Active Effects Runtime
 * Applica Active Effects a runtime per aggirare limitazione Foundry CLI (Issue #41)
 * Compatibile con D&D 5e v3.3.1 e Foundry v13
 */

import { createModuleLogger } from './brancalonia-logger.js';

const MODULE_ID = 'brancalonia-bigat';
const MODULE_NAME = 'ActiveEffects';
const moduleLogger = createModuleLogger(MODULE_NAME);
let GENERATED_EFFECTS_REGISTRY = {};

/**
 * Carica il registro generato runtime attraverso import dinamico.
 * Restituisce sempre un oggetto (anche vuoto se il file non è disponibile).
 */
async function loadGeneratedRegistry() {
  // Fix: usa path assoluto con leading slash per ES module import
  // Il file si trova in /modules/brancalonia-bigat/data/ (non /modules/brancalonia-bigat/modules/data/)
  const registryPath = `/modules/${MODULE_ID}/data/active-effects-registry-generated.js`;

  try {
    const { GENERATED_EFFECTS_REGISTRY: registry } = await import(
      /* webpackIgnore: true */ registryPath
    );
    GENERATED_EFFECTS_REGISTRY = registry ?? {};
    moduleLogger?.debug?.(
      MODULE_NAME,
      'Registro effetti generato caricato con successo'
    );
  } catch (error) {
    // Fallback manuale se il file generato non è disponibile
    // Non loggare come warning se è solo un file mancante (comportamento normale)
    if (error.message?.includes('404') || error.message?.includes('Not Found')) {
      moduleLogger?.debug?.(
        MODULE_NAME,
        'Registro effetti generato non presente (normale). Uso fallback manuale.'
      );
    } else {
      moduleLogger?.warn?.(
        MODULE_NAME,
        'Errore caricamento registro effetti generato. Uso fallback manuale.',
        error
      );
    }
    GENERATED_EFFECTS_REGISTRY = {};
  }

  return GENERATED_EFFECTS_REGISTRY;
}
const SETTINGS = {
  version: 'effectsVersion',
  autoApplyOnReady: 'effectsAutoApplyOnReady',
  autoApplyOnCreate: 'effectsAutoApplyOnCreate',
  dryRun: 'effectsDryRun'
};

const DEFAULT_PACKS = [
  'brancalonia-bigat.razze',
  'brancalonia-bigat.talenti',
  'brancalonia-bigat.brancalonia-features',
  'brancalonia-bigat.emeriticenze',
  'brancalonia-bigat.backgrounds',
  'brancalonia-bigat.equipaggiamento'
];

// Registry manuale con definizioni curate (ha priorità su quello generato)
const MANUAL_EFFECTS_REGISTRY = {
  // ========================================
  // BACKGROUND BRANCALONIA
  // ========================================
  ambulante: [
    {
      label: 'Storie della Strada',
      icon: 'icons/skills/trades/academics-study-reading-book.webp',
      changes: [
        { key: 'system.skills.prf.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.his.value', mode: 5, value: '1', priority: 20 },
        { key: 'flags.brancalonia-bigat.storieStrada', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  attaccabrighe: [
    {
      label: 'Rissaiolo',
      icon: 'icons/skills/melee/unarmed-punch-fist-brown.webp',
      changes: [
        { key: 'system.skills.prf.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.ins.value', mode: 5, value: '1', priority: 20 },
        { key: 'flags.brancalonia-bigat.slotMossaExtra', mode: 2, value: '1', priority: 20 }
      ]
    }
  ],

  azzeccagarbugli: [
    {
      label: 'Risolvere Guai',
      icon: 'icons/tools/scribal/scroll-plain-tan.webp',
      changes: [
        { key: 'system.skills.inv.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.per.value', mode: 5, value: '1', priority: 20 },
        { key: 'flags.brancalonia-bigat.risolvereGuai', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  brado: [
    {
      label: 'Dimestichezza Selvatica',
      icon: 'icons/creatures/mammals/wolf-howl-moon-blue.webp',
      changes: [
        { key: 'system.skills.ani.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.ath.value', mode: 5, value: '1', priority: 20 },
        { key: 'flags.brancalonia-bigat.dimestichezzaSelvatica', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  cacciatore_di_reliquie: [
    {
      label: 'Studioso di Reliquie',
      icon: 'icons/equipment/chest/chest-simple-gold.webp',
      changes: [
        { key: 'system.skills.inv.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.his.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.rel.bonuses.check', mode: 2, value: '1', priority: 20 },
        { key: 'flags.brancalonia-bigat.studiosoReliquie', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  duro: [
    {
      label: 'Faccia da Duro',
      icon: 'icons/skills/social/intimidation-impressing.webp',
      changes: [
        { key: 'system.skills.ath.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.itm.value', mode: 5, value: '1', priority: 20 },
        { key: 'flags.brancalonia-bigat.facciaDaDuro', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  bargellos9ghr8: [
    {
      label: 'Competenze Bargello',
      icon: 'icons/equipment/shield/heater-shield-steel-worn.webp',
      changes: [
        { key: 'system.skills.ath.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.itm.value', mode: 5, value: '1', priority: 20 }
      ]
    }
  ],

  cantastoriexpr4pl: [
    {
      label: 'Competenze Cantastorie',
      icon: 'icons/tools/instruments/lute-gold-brown.webp',
      changes: [
        { key: 'system.skills.prf.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.his.value', mode: 5, value: '1', priority: 20 }
      ]
    }
  ],

  cialtroned4x7kf: [
    {
      label: 'Competenze Cialtrone',
      icon: 'icons/equipment/head/hat-feathered-red.webp',
      changes: [
        { key: 'system.skills.dec.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.slt.value', mode: 5, value: '1', priority: 20 }
      ]
    }
  ],

  contrabbandierezulgk6: [
    {
      label: 'Competenze Contrabbandiere',
      icon: 'icons/commodities/treasure/chest-worn-brown-tan.webp',
      changes: [
        { key: 'system.skills.dec.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.ste.value', mode: 5, value: '1', priority: 20 }
      ]
    }
  ],

  disertore56faeo: [
    {
      label: 'Competenze Disertore',
      icon: 'icons/equipment/back/pack-leather-black-brown.webp',
      changes: [
        { key: 'system.skills.ste.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.sur.value', mode: 5, value: '1', priority: 20 }
      ]
    }
  ],

  locandierevcqp61: [
    {
      label: 'Competenze Locandiere',
      icon: 'icons/consumables/drinks/beer-stein-pint.webp',
      changes: [
        { key: 'system.skills.ins.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.per.value', mode: 5, value: '1', priority: 20 }
      ]
    }
  ],

  pellegrinovu1zl4: [
    {
      label: 'Competenze Pellegrino',
      icon: 'icons/equipment/feet/boots-leather-worn-brown.webp',
      changes: [
        { key: 'system.skills.ins.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.rel.value', mode: 5, value: '1', priority: 20 }
      ]
    }
  ],

  villanopttqgm: [
    {
      label: 'Competenze Villano',
      icon: 'icons/tools/farming/pitchfork-wood-brown.webp',
      changes: [
        { key: 'system.skills.ani.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.sur.value', mode: 5, value: '1', priority: 20 }
      ]
    }
  ],

  impresario: [
    {
      label: 'Competenze Impresario',
      icon: 'icons/tools/instruments/harp-gold-brown.webp',
      changes: [
        { key: 'system.skills.ins.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.per.value', mode: 5, value: '1', priority: 20 }
      ]
    }
  ],

  innamorato: [
    {
      label: 'Competenze Innamorato',
      icon: 'icons/magic/life/heart-glowing-red.webp',
      changes: [
        { key: 'system.skills.per.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.his.value', mode: 5, value: '1', priority: 20 }
      ]
    }
  ],

  lucignolo: [
    {
      label: 'Competenze Lucignolo',
      icon: 'icons/tools/scribal/ink-quill-orange.webp',
      changes: [
        { key: 'system.skills.dec.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.per.value', mode: 5, value: '1', priority: 20 }
      ]
    }
  ],

  passatore: [
    {
      label: 'Competenze Passatore',
      icon: 'icons/environment/wilderness/cave-entrance-brown.webp',
      changes: [
        { key: 'system.skills.ste.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.sur.value', mode: 5, value: '1', priority: 20 }
      ]
    }
  ],

  fuggitivo: [
    {
      label: 'Competenze Fuggitivo',
      icon: 'icons/skills/movement/figure-running-gray.webp',
      changes: [
        { key: 'system.skills.ste.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.sur.value', mode: 5, value: '1', priority: 20 },
        { key: "system.traits.languages.value", mode: 2, value: "['baccaglio']", priority: 20 },
        { key: 'flags.brancalonia-bigat.tagliaBonus', mode: 2, value: '100', priority: 20 },
        { key: 'flags.brancalonia-bigat.fuggitivo', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  prelato: [
    {
      label: 'Competenze Prelato',
      icon: 'icons/magic/holy/chalice-glowing-gold-water.webp',
      changes: [
        { key: 'system.skills.per.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.rel.value', mode: 5, value: '1', priority: 20 }
      ]
    }
  ],

  staffetta: [
    {
      label: 'Competenze Staffetta',
      icon: 'icons/skills/movement/feet-winged-boots-brown.webp',
      changes: [
        { key: 'system.skills.ath.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.sur.value', mode: 5, value: '1', priority: 20 }
      ]
    }
  ],

  // ========================================
  // EMERITICENZE (FEAT)
  // ========================================
  energumeno41d582: [
    {
      label: 'Energumeno - Bonus PF',
      icon: 'icons/magic/life/heart-cross-large-green.webp',
      changes: [
        { key: 'system.attributes.hp.bonuses.overall', mode: 2, value: '6 + @abilities.con.mod', priority: 20 }
      ]
    }
  ],

  emeriticenzaassoluta32ec13: [
    {
      label: 'Emeriticenza Assoluta',
      icon: 'icons/magic/control/mind-fear-orange.webp',
      changes: [
        { key: 'system.attributes.prof', mode: 5, value: '4', priority: 30 }
      ]
    }
  ],

  armapreferitae3c6f4: [
    {
      label: 'Arma Preferita',
      icon: 'icons/weapons/swords/sword-guard-blue.webp',
      changes: [
        { key: 'system.bonuses.mwak.damage', mode: 2, value: '@prof', priority: 20 }
      ]
    }
  ],

  indomito84d610: [
    {
      label: 'Indomito',
      icon: 'icons/magic/control/defense-shield-barrier-blue.webp',
      changes: [
        { key: 'system.traits.ci.value', mode: 2, value: 'frightened', priority: 20 }
      ]
    }
  ],

  rissaioloprofessionistafec96b: [
    {
      label: 'Rissaiolo Professionista',
      icon: 'icons/skills/melee/unarmed-punch-fist-brown.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.slotMossa', mode: 2, value: '1', priority: 20 }
      ]
    }
  ],

  affinamento1c276b: [
    {
      label: 'Affinamento',
      icon: 'icons/magic/control/buff-strength-muscle-red.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.affinamento', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  giocodisquadrac40c21: [
    {
      label: 'Gioco di Squadra',
      icon: 'icons/magic/control/target-arrow-green.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.giocoSquadra', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  fandoniamiglioratad1933c: [
    {
      label: 'Fandonia Migliorata',
      icon: 'icons/magic/control/silhouette-hold-beam-green.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.fandoniaPlus', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  recuperomigliorato5cdb97: [
    {
      label: 'Recupero Migliorato',
      icon: 'icons/magic/life/crosses-trio-yellow.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.recuperoMigliorato', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  fandoniapotenziata3d825b: [
    {
      label: 'Fandonia Potenziata',
      icon: 'icons/magic/control/buff-flight-wings-runes-purple.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.fandoniaPotenziata', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  compagnodellaselva8d6630: [
    {
      label: 'Compagno della Selva',
      icon: 'icons/creatures/mammals/wolf-shadow-black.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.compagnoSelva', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ildonodeltalento882c0b: [
    {
      label: 'Il Dono del Talento',
      icon: 'icons/magic/symbols/star-inverted-yellow.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.donoTalento', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  sanguedellaviluperae72ab1: [
    {
      label: 'Sangue della Vilupera',
      icon: 'icons/creatures/abilities/mouth-teeth-long-red.webp',
      changes: [
        { key: 'system.traits.dr.value', mode: 2, value: 'poison', priority: 20 },
        { key: 'flags.brancalonia-bigat.sangueVilupera', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  scaglianzadd4fb5: [
    {
      label: 'Scaglianza',
      icon: 'icons/magic/defensive/shield-barrier-glowing-triangle-blue.webp',
      changes: [
        { key: 'system.attributes.ac.bonus', mode: 2, value: '1', priority: 20 },
        { key: 'flags.brancalonia-bigat.scaglianza', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  scudanza3b9d1d: [
    {
      label: 'Scudanza',
      icon: 'icons/equipment/shield/heater-crystal-gold-blue.webp',
      changes: [
        { key: 'system.attributes.ac.bonus', mode: 2, value: '1', priority: 20 },
        { key: 'flags.brancalonia-bigat.scudanza', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  spezialec74084: [
    {
      label: 'Speziale',
      icon: 'icons/consumables/potions/bottle-round-corked-pink.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.speziale', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  animacontadina84ec09: [
    {
      label: 'Anima Contadina',
      icon: 'icons/tools/farming/hoe-simple-steel-brown.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.animaContadina', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  anticaarteculinaria42f530: [
    {
      label: 'Antica Arte Culinaria',
      icon: 'icons/tools/cooking/bowl-steaming-pink.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.arteCulinaria', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  // ========================================
  // TALENTI BRANCALONIA
  // ========================================
  supercazzola0a1867: [
    {
      label: 'Dadi Supercazzola',
      icon: 'icons/magic/control/tongue-coil-green.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.supercazzolaDice', mode: 5, value: '2d4', priority: 20 }
      ]
    }
  ],

  // ========================================
  // CIMELI MALEDETTI - LOTTO 1: COMBATTIMENTO/DIFESA
  // ========================================
  
  lanellodelvescovoladronef84df4: [
    {
      label: 'Menzogne Sacrileghe',
      icon: 'icons/equipment/finger/ring-cabochon-gold-red.webp',
      changes: [
        { key: 'flags.dnd5e.advantage.skill.dec', mode: 5, value: '1', priority: 20 }
      ]
    },
    {
      label: 'Maledizione: Ira Divina',
      icon: 'icons/magic/holy/yin-yang-balance-symbol.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.svantaggioEffettiDivini', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  labisacciadelpellegrinomorto737587: [
    {
      label: 'Rifornimento Infinito',
      icon: 'icons/equipment/chest/breastplate-scale-steel.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.cibeloInfinito', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  idadideldiavoloa8c71e: [
    {
      label: 'Fortuna Maledetta',
      icon: 'icons/sundries/gaming/dice-runed-brown.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.dadiMaledetti', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ilboccaledelgiganteubriacone138759: [
    {
      label: 'Sete Insaziabile',
      icon: 'icons/consumables/drinks/beer-stein-brown.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.boccaleInfinito', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lacordadellimpiccatoinnocente7ab8bc: [
    {
      label: 'Nodo della Morte',
      icon: 'icons/tools/fasteners/rope-noose-brown.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.cordaMaledetta', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lalanternadelguardianodelfarob41ec0: [
    {
      label: 'Luce Rivelatrice',
      icon: 'icons/sundries/lights/lantern-iron-yellow.webp',
      changes: [
        { key: 'system.attributes.senses.special', mode: 2, value: 'Vede attraverso oscurità magica e nebbia', priority: 20 },
        { key: 'flags.brancalonia-bigat.rivelaInvisibili', mode: 5, value: 'true', priority: 20 }
      ]
    },
    {
      label: 'Maledizione: Spiriti dei Naufraghi',
      icon: 'icons/magic/death/skull-humanoid-crown-white.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.attraeSpirti', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lamascheradelcarnefice07bf20: [
    {
      label: 'Anonimato del Boia',
      icon: 'icons/equipment/head/mask-carved-scream-tan.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.mascheraCarnefice', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ilnasodipinocchio277de3: [
    {
      label: 'Rivelatore di Bugie',
      icon: 'icons/equipment/head/mask-carved-tan.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.nasoPinocchio', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  locchiodivetrodelpiratae64401: [
    {
      label: 'Vista del Pirata',
      icon: 'icons/commodities/gems/pearl-brown-grey.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.occhioPirata', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ilpennellodelpittoremaledettoe56b5d: [
    {
      label: 'Creazioni Maledette',
      icon: 'icons/tools/scribal/brush-simple-brown.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.pennelloMaledetto', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lapipadelfilosofof6c8da: [
    {
      label: 'Saggezza Fumosa',
      icon: 'icons/tools/cooking/pipe-brown.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.pipaFilosofo', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ilquadrifoglioappassito909f5f: [
    {
      label: 'Fortuna Morente',
      icon: 'icons/magic/nature/leaf-glow-triple-green.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.quadrifoglioMaledetto', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  larosadiferro50fe2b: [
    {
      label: 'Bellezza Letale',
      icon: 'icons/magic/nature/rose-thorned-red.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.rosaFerro', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lospecchiodellastrega7b716d: [
    {
      label: 'Verità Rivelata',
      icon: 'icons/sundries/misc/mirror-hand-steel.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.specchioVerita', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ilteschiodelsantoereticod77f69: [
    {
      label: 'Protezione Mentale',
      icon: 'icons/magic/death/skull-humanoid-crown-white.webp',
      changes: [
        { key: 'system.traits.ci.value', mode: 2, value: 'charmed', priority: 20 },
        { key: 'flags.brancalonia-bigat.teschioDominio', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lultimochiododellacroce78a697: [
    {
      label: 'Arma Sacra',
      icon: 'icons/tools/fasteners/nail-steel.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.chiodoCroce', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ilviolinodeldiavoloe39da9: [
    {
      label: 'Melodia Ammaliante',
      icon: 'icons/tools/instruments/lute-gold-brown.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.violinoDiavolo', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lazappadelcontadinoribellef51c1e: [
    {
      label: 'Forza Contadina',
      icon: 'icons/tools/farming/hoe-simple-steel-brown.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.zappaRibelle', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lampolladisanguedisangeniale24206f: [
    {
      label: 'Miracolo di San Geniale',
      icon: 'icons/consumables/potions/bottle-round-corked-red.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.ampollaSangue', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ilbastonedelmendicantere058deb: [
    {
      label: 'Dignità del Mendicante',
      icon: 'icons/weapons/staves/staff-simple-spiral-green.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.bastoneMendicante', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lacatenadelcaneinfernale65c15c: [
    {
      label: 'Vincolo Infernale',
      icon: 'icons/tools/fasteners/chain-iron-steel.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.catenaCane', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ildiariodelcondannatobcb7a1: [
    {
      label: 'Ultima Confessione',
      icon: 'icons/sundries/books/book-worn-brown-blue.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.diarioCondannato', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lelmettodelsoldatosconosciuto8f6056: [
    {
      label: 'Coraggio Anonimo',
      icon: 'icons/equipment/head/helm-barbute-tan.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.elmettoSoldato', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  // LOTTO 2: CIMELI MALEDETTI (21-30)
  ilferrodicavallofortunato4e2f8b: [
    {
      label: 'Fortuna Equina',
      icon: 'icons/commodities/metal/horseshoe-steel.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.ferroCavallo', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ilgrimoriodellostudentesuicidae77749: [
    {
      label: 'Conoscenze Proibite',
      icon: 'icons/sundries/books/book-symbol-eye-purple.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.grimorioSuicida', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ilcrocifissocapovolto1f454a: [
    {
      label: 'Segno Blasfemo',
      icon: 'icons/magic/symbols/cross-stone-green.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.crocifissoCapovolto', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lamonetadeltraghettatoree04bd5: [
    {
      label: 'Passaggio Oltremondano',
      icon: 'icons/commodities/currency/coin-embossed-skull-gold.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.monetaTraghettatore', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lorecchiodelconfessoreeb6aec: [
    {
      label: 'Ascoltare Segreti',
      icon: 'icons/commodities/biological/organ-heart-pink.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.orecchioConfessore', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ilpugnaledeltraditore27f43c: [
    {
      label: 'Lama del Tradimento',
      icon: 'icons/weapons/daggers/dagger-straight-blood.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.pugnaleTraditore', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  laruotadellatortura0724dd: [
    {
      label: 'Eco del Dolore',
      icon: 'icons/tools/fasteners/wheel-spoked-tan.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.ruotaTortura', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lostendardostrappatob67a6e: [
    {
      label: 'Vessillo della Sconfitta',
      icon: 'icons/equipment/back/banner-flag-worn-tan.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.stendardoStrappato', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  iltamburodiguerrasilenziosoa18b25: [
    {
      label: 'Marcia Silenziosa',
      icon: 'icons/tools/instruments/drum-brown.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.tamburoSilenzioso', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  luncinodelpiratafantasma211ae9: [
    {
      label: 'Presa Spettrale',
      icon: 'icons/weapons/hooks/hook-barbed-steel.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.uncinoPirata', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  // LOTTO 3: CIMELI MALEDETTI (31-40)
  lavestedelmonacoapostatae28560: [
    {
      label: 'Vesti Profane',
      icon: 'icons/equipment/chest/robe-simple-brown.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.vesteMonaco', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lozufolodelpifferaio47f2fe: [
    {
      label: 'Richiamo Roditore',
      icon: 'icons/tools/instruments/flute-simple-wood.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.zufoloPifferaio', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lanellospezzato4dc57d: [
    {
      label: 'Promessa Infranta',
      icon: 'icons/equipment/finger/ring-band-simple-gold.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.anelloSpezzato', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ilbicchiereavvelenato4a6c07: [
    {
      label: 'Veleno Latente',
      icon: 'icons/consumables/drinks/goblet-jeweled-silver-water.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.bicchiereVeleno', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lacandeladelvegliardof2b412: [
    {
      label: 'Luce Eterna',
      icon: 'icons/sundries/lights/candle-unlit-grey.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.candelaVegliardo', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ildadodeldestino359bf6: [
    {
      label: 'Fato Segnato',
      icon: 'icons/sundries/gaming/dice-runed-brown.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.dadoDestino', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lelmodelgeneralesconfittof82405: [
    {
      label: 'Tattica Fallimentare',
      icon: 'icons/equipment/head/helm-barbute-steel-grey.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.elmoGenerale', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lafialadellelacrimedigioia093c04: [
    {
      label: 'Gioia Effimera',
      icon: 'icons/consumables/potions/vial-cork-blue.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.fialaLacrime', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ilguantodelduellantef6fee3: [
    {
      label: 'Sfida d\'Onore',
      icon: 'icons/equipment/hand/glove-armored-steel-grey.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.guantoDuellante', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  liconapiangente2a9387: [
    {
      label: 'Lacrime Sacre',
      icon: 'icons/magic/holy/angel-winged-humanoid-blue.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.iconaPiangente', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  // LOTTO 4: CIMELI FINALI (41-50)
  laletteramaiconsegnatab0d3ba: [
    {
      label: 'Messaggio Perduto',
      icon: 'icons/sundries/documents/document-sealed-brown-red.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.letteraMai', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lamappadeltesoromaledetto66f5dd: [
    {
      label: 'Tesoro Maledetto',
      icon: 'icons/sundries/scrolls/scroll-rolled-brown-red.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.mappaTesoro', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  laspadaspezzatadelleroe0d45bf: [
    {
      label: 'Gloria Infranta',
      icon: 'icons/weapons/swords/sword-broken-steel-orange.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.spadaSpezzata', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  bisacciadelpellegrinomorto737587: [
    {
      label: 'Bisaccia del Pellegrino Morto',
      icon: 'icons/containers/bags/pouch-leather-red.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.bisacciaPellegrino', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  // ========================================
  // PRIVILEGI SOTTOCLASSI BRANCALONIA
  // ========================================
  
  // ARLECCHINO (Bardo)
  arlecchinobardolivello3difesasenzaarmatura129d94: [
    {
      label: 'Difesa Senza Armatura (Arlecchino)',
      icon: 'icons/equipment/shield/heater-steel-boss-purple.webp',
      changes: [
        { key: 'system.attributes.ac.calc', mode: 5, value: 'custom', priority: 20 },
        { key: 'system.attributes.ac.formula', mode: 5, value: '10 + @abilities.dex.mod + @abilities.cha.mod', priority: 20 }
      ]
    }
  ],

  arlecchinobardolivello3batocchio68d64d: [
    {
      label: 'Batocchio',
      icon: 'icons/weapons/staves/staff-ornate-purple.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.batocchio', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  // BRIGANTE (Ladro)
  briganteladrolivello3brigantaggiofee0ed: [
    {
      label: 'Brigantaggio',
      icon: 'icons/skills/trades/security-lockpicking-brown.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.brigantaggio', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  // CAVALIERE ERRANTE (Paladino)
  cavaliereerrantepaladinolivello3ispirarecompagni5c5bf0: [
    {
      label: 'Ispirare Compagni',
      icon: 'icons/magic/holy/yin-yang-balance-symbol.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.ispirareCompagni', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  // FRATE (Monaco)
  fratemonacolivello3porgialtraguancia7b3534: [
    {
      label: 'Porgi l\'Altra Guancia',
      icon: 'icons/magic/holy/meditation-chi-focus-blue.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.porgiAltraGuancia', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  // GUISCARDO (Mago)
  guiscardomagolivello2chincaglieriamagica640e0d: [
    {
      label: 'Chincaglieria Magica',
      icon: 'icons/sundries/misc/puzzle-piece-yellow.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.chincaglieriaMagica', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  // MENAGRAMO (Warlock)
  menagramowarlocklivello1iattura2a26bc: [
    {
      label: 'Iattura',
      icon: 'icons/magic/death/skull-horned-worn-fire-blue.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.iattura', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  menagramowarlocklivello6toccomalasorte7ef4e1: [
    {
      label: 'Tocco di Malasorte',
      icon: 'icons/magic/death/hand-undead-skeleton-fire-green.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.toccoMalasorte', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  // MIRACOLARO (Chierico)
  miracolarochiericolivello1tiraregiusanti941c7c: [
    {
      label: 'Tirare Giù i Santi',
      icon: 'icons/magic/holy/prayer-hands-glowing-yellow.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.tirareGiuSanti', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  // SCARAMANTE (Stregone)
  scaramantestregonelivello1protettodalfatoc7a17a: [
    {
      label: 'Protetto dal Fato',
      icon: 'icons/magic/defensive/shield-barrier-flaming-diamond-teal.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.protettoFato', mode: 5, value: 'true', priority: 20 },
        { key: 'system.attributes.hp.bonuses.level', mode: 2, value: '1', priority: 20 }
      ]
    }
  ],

  // SPADACCINO (Guerriero)
  spadaccinoguerrierolivello3scuolascherma926229: [
    {
      label: 'Scuola di Scherma',
      icon: 'icons/weapons/swords/sword-guard-steel.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.scuolaScherma', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  // MATTATORE (Ranger)
  mattatorerangerlivello3occhiomattatore4e22a1: [
    {
      label: 'Occhio del Mattatore',
      icon: 'icons/magic/perception/eye-ringed-glow-yellow.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.occhioMattatore', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  // LIVELLO 6 SOTTOCLASSI
  arlecchinobardolivello6silenzioinsala3a0f6a: [
    {
      label: 'Silenzio in Sala',
      icon: 'icons/magic/control/silhouette-hold-beam-yellow.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.silenzioSala', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  guiscardomagolivello6maestriafandonicab97016: [
    {
      label: 'Maestria Fandonica',
      icon: 'icons/magic/symbols/runes-star-orange.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.maestriaFandonica', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  miracolarochiericolivello6pertuttisantie4dbac: [
    {
      label: 'Per Tutti i Santi',
      icon: 'icons/magic/holy/saint-glass-portrait-halo.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.perTuttiSanti', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  benandantedruidolivello6guardianodanzamacabra393a52: [
    {
      label: 'Guardiano della Danza Macabra',
      icon: 'icons/magic/death/skull-humanoid-crown-purple.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.danzaMacabra', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  briganteladrolivello3arteimboscata37e0f9: [
    {
      label: 'Arte dell\'Imboscata',
      icon: 'icons/skills/targeting/crosshair-bars-yellow.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.arteImboscata', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  cavaliereerrantepaladinolivello3proteggerebisognosib94313: [
    {
      label: 'Proteggere i Bisognosi',
      icon: 'icons/magic/defensive/shield-barrier-glowing-triangle-blue.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.proteggereBisognosi', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  benandantedruidolivello2guardareoltrevelo634d6b: [
    {
      label: 'Guardare Oltre il Velo',
      icon: 'icons/magic/perception/third-eye-blue-red.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.guardareOltreVelo', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  fratemonacolivello6tecnicamanoferropiumabfbed3: [
    {
      label: 'Tecnica Mano di Ferro, Piuma di Volpe',
      icon: 'icons/skills/melee/hand-grip-staff-yellow.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.tecnicaManoFerro', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  guiscardomagolivello2cercatoretesorib3c675: [
    {
      label: 'Cercatore di Tesori',
      icon: 'icons/containers/bags/sack-simple-leather-brown.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.cercatoreTesori', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  guiscardomagolivello2espertooggettimagici5aaba8: [
    {
      label: 'Esperto di Oggetti Magici',
      icon: 'icons/magic/symbols/runes-star-magenta.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.espertoOggettiMagici', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  miracolarochiericolivello1dominiocalendariobc1a6d: [
    {
      label: 'Dominio del Calendario',
      icon: 'icons/sundries/scrolls/scroll-worn-tan-red.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.dominioCalendario', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  scaramantestregonelivello6ritualescaramantico329b67: [
    {
      label: 'Rituale Scaramantico',
      icon: 'icons/magic/symbols/runes-triangle-blue.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.ritualeScaramantico', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  // ========================================
  // ALTRI CIMELI MALEDETTI PRIORITARI
  // ========================================
  lelmodelcavalierecodardo27f87e: [
    {
      label: 'Vigliaccamente Protetto',
      icon: 'icons/equipment/head/helm-barbute-steel.webp',
      changes: [
        { key: 'system.attributes.ac.bonus', mode: 2, value: '1', priority: 20 },
        { key: 'flags.brancalonia-bigat.vigliacceriaElmo', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ilfazzolettodelladamanerac1ed60: [
    {
      label: 'Presenza Inquietante',
      icon: 'icons/equipment/hand/gauntlet-black.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.fazzolettoDama', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  ilguantodelboiad803a0: [
    {
      label: 'Stretta Mortale',
      icon: 'icons/equipment/hand/glove-armored-steel-grey.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.guantoBoia', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  lidolopagano10819a: [
    {
      label: 'Benedizione Pagana',
      icon: 'icons/sundries/misc/idol-carving-bear-brown.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.idoloPagano', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  scudetto6d5460: [
    {
      label: 'Protezione Scudetto',
      icon: 'icons/equipment/shield/buckler-steel-worn.webp',
      changes: [
        { key: 'system.attributes.ac.bonus', mode: 2, value: '1', priority: 20 }
      ]
    }
  ]
};

// Merge: registry manuale sovrascrive quello generato automaticamente
let ACTIVE_EFFECTS_REGISTRY = {};

const REGISTRY_VERSION = '11.1.0-effects'; // Coverage: 115 manual + 443 generated = 558 total (88.8%)

function getSetting(key) {
  return game.settings.get(MODULE_ID, SETTINGS[key]);
}

function setSetting(key, value) {
  return game.settings.set(MODULE_ID, SETTINGS[key], value);
}

function resolveRegistryKey(item) {
  if (!item) return null;
  const brancaloniaId = item.getFlag(MODULE_ID, 'registryId');
  if (brancaloniaId) return brancaloniaId;

  const sourceId = item.getFlag('core', 'sourceId');
  if (sourceId) {
    const parts = sourceId.split('.');
    return parts.pop();
  }

  return item.id ?? item._id ?? null;
}

function buildEffectData(registryId, definition, item) {
  const base = {
    label: definition.label,
    icon: definition.icon ?? item.img,
    changes: definition.changes ?? [],
    disabled: false,
    transfer: true,
    duration: definition.duration ?? {},
    flags: foundry.utils.mergeObject(definition.flags ?? {}, {
      [MODULE_ID]: {
        autoApplied: true,
        registryId,
        version: REGISTRY_VERSION
      }
    }, { inplace: false })
  };

  return base;
}

function normalizeEffectData(effectData) {
  const clone = foundry.utils.deepClone(effectData);
  delete clone._id;
  delete clone.sort;
  delete clone.origin;
  delete clone.changes?.forEach?.(change => delete change._id);

  return {
    label: clone.label,
    icon: clone.icon,
    changes: clone.changes?.map(change => ({
      key: change.key,
      mode: change.mode,
      value: change.value,
      priority: change.priority ?? 0
    })) ?? [],
    disabled: clone.disabled ?? false,
    transfer: clone.transfer ?? true,
    duration: clone.duration ?? {},
    flags: clone.flags ?? {}
  };
}

/**
 * Applica Active Effects a un item nel compendio
 */
/**
 * Applica effects a tutti i compendi Brancalonia
 */
// Registra setting per tracciare versione - DEVE essere prima di ready
Hooks.once('init', () => {
  game.settings.register(MODULE_ID, SETTINGS.version, {
    scope: 'world',
    config: false,
    type: String,
    default: '0.0.0'
  });

  game.settings.register(MODULE_ID, SETTINGS.autoApplyOnReady, {
    name: 'Active Effects: applica all\'avvio',
    hint: 'Esegue automaticamente l\'applicazione degli effetti quando cambia la versione del registro.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, SETTINGS.autoApplyOnCreate, {
    name: 'Active Effects: applica su nuovi item',
    hint: 'Applica automaticamente gli effetti agli item Brancalonia appena creati.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, SETTINGS.dryRun, {
    scope: 'world',
    config: false,
    type: Boolean,
    default: false
  });

  moduleLogger.info('Runtime registrato');

  game.brancalonia = game.brancalonia || {};
  game.brancalonia.activeEffects = activeEffectsManager;
});

// Hook principale - esegue solo una volta all'avvio
Hooks.once('ready', async () => {
  // Assicura che il registro sia disponibile anche se setup non è stato eseguito
  if (!Object.keys(ACTIVE_EFFECTS_REGISTRY).length) {
    const generated = await loadGeneratedRegistry();
    ACTIVE_EFFECTS_REGISTRY = {
      ...generated,
      ...MANUAL_EFFECTS_REGISTRY
    };
    activeEffectsManager.setRegistry(ACTIVE_EFFECTS_REGISTRY);
  }

  const storedVersion = getSetting('version');
  const requiredVersion = activeEffectsManager.getRequiredVersion();
  const dryRun = getSetting('dryRun');

  if (!getSetting('autoApplyOnReady')) {
    moduleLogger.info('Auto apply on ready disabilitato');
    return;
  }

  if (storedVersion === requiredVersion && !dryRun) {
    moduleLogger.debug('Active Effects già aggiornati');
    return;
  }

  moduleLogger.info(`Applicazione effetti (stored=${storedVersion}, required=${requiredVersion}, dryRun=${dryRun})`);

  const results = await activeEffectsManager.applyAll({ force: true, dryRun });
  const errors = results.reduce((acc, res) => acc + (res.errors ?? 0), 0);

  if (!dryRun && errors === 0) {
    await setSetting('version', requiredVersion);
  }

  moduleLogger.table(results);

  if (errors > 0) {
    ui.notifications.error(`Active Effects: ${errors} errori. Controlla la console.`);
  } else if (!dryRun) {
    ui.notifications.info('Active Effects aggiornati correttamente.');
  } else {
    ui.notifications.warn('Active Effects dry-run completato. Nessuna modifica applicata.');
  }
});

// Hook per nuovi item creati/importati
Hooks.on('createItem', async (item) => {
  if (!getSetting('autoApplyOnCreate')) return;
  if (!item?.isOwned) return;

  const result = await activeEffectsManager.applyToItem(item, { force: false });
  if (result.updated) {
    moduleLogger.debug(`Effetti applicati a item creato ${item.name}`);
  }
});

Hooks.on('chatMessage', (log, message) => {
  if (!message.startsWith('/brancaeffects')) return true;

  const [, subcommand] = message.split(' ');
  switch ((subcommand ?? '').toLowerCase()) {
    case 'apply':
      activeEffectsManager.applyAll({ force: true }).then(results => {
        moduleLogger.table(results);
        ui.notifications.info('Active Effects applicati manualmente.');
      });
      break;
    case 'dryrun':
      activeEffectsManager.applyAll({ force: true, dryRun: true }).then(results => {
        moduleLogger.table(results);
        ui.notifications.warn('Active Effects dry-run completato.');
      });
      break;
    case 'status':
    default: {
      const status = activeEffectsManager.getStatus();
      const content = `
        <div class="brancalonia-status">
          <h3>Active Effects Status</h3>
          <p>Versione richiesta: ${status.registryVersion}</p>
          <p>Versione salvata: ${status.storedVersion}</p>
          <p>Packs registrati: ${status.packs.length}</p>
          <p>Entries in registry: ${status.registryEntries}</p>
        </div>
      `;
      ChatMessage.create({ content, whisper: [game.user.id] });
      break;
    }
  }

  return false;
});

Hooks.once('renderChatLog', () => {
  if (document.getElementById('brancalonia-effects-css')) return;

  const style = document.createElement('style');
  style.id = 'brancalonia-effects-css';
  style.textContent = `
    .brancalonia-status, .brancalonia-help {
      background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
      color: white;
      border: 2px solid #388E3C;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(56, 142, 60, 0.3);
    }

    .brancalonia-status h3, .brancalonia-help h3 {
      color: #C8E6C9;
      margin-bottom: 10px;
      text-align: center;
    }

    .brancalonia-status ul, .brancalonia-help ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    .brancalonia-status code, .brancalonia-help code {
      background: rgba(0,0,0,0.3);
      padding: 2px 6px;
      border-radius: 3px;
      color: #FFEB3B;
    }
  `;
  document.head.appendChild(style);
});

class BrancaloniaActiveEffectsManager {
  constructor() {
    this.packs = new Set(DEFAULT_PACKS);
    this.registry = {};
  }

  registerAdditionalPack(packId) {
    this.packs.add(packId);
  }

  unregisterPack(packId) {
    this.packs.delete(packId);
  }

  getRegisteredPacks() {
    return Array.from(this.packs);
  }

  hasRegistryEntry(registryId) {
    return Boolean(this.registry[registryId]);
  }

  getRegistryEntries() {
    return Object.keys(this.registry);
  }

  getRequiredVersion() {
    return REGISTRY_VERSION;
  }

  setRegistry(registry) {
    this.registry = registry ?? {};
  }

  async applyToItem(item, { force = false, dryRun = false } = {}) {
    const registryId = resolveRegistryKey(item);
    if (!registryId) {
      moduleLogger.debug(`Item ${item?.name} senza registryId, ignorato`);
      return { updated: false, reason: 'no-registry-id' };
    }

    const definitions = this.registry[registryId];
    if (!definitions) {
      moduleLogger.debug(`Nessuna definizione effetti per ${registryId}`);
      return { updated: false, reason: 'no-definition', registryId };
    }

    const existingEffects = item.effects?.contents ?? [];
    const normalizedExisting = existingEffects.map(e => normalizeEffectData(e.toObject()));
    const desiredEffects = definitions.map(def => buildEffectData(registryId, def, item));
    const normalizedDesired = desiredEffects.map(normalizeEffectData);

    const needsUpdate = force || !foundry.utils.deepEquals(normalizedExisting, normalizedDesired);

    if (!needsUpdate) {
      return { updated: false, reason: 'no-change', registryId };
    }

    if (dryRun) {
      return { updated: false, reason: 'dry-run', registryId };
    }

    try {
      if (existingEffects.length > 0) {
        await item.deleteEmbeddedDocuments('ActiveEffect', existingEffects.map(e => e.id));
      }

      await item.createEmbeddedDocuments('ActiveEffect', desiredEffects);
      await item.setFlag(MODULE_ID, 'registryId', registryId);
      await item.setFlag(MODULE_ID, 'hasActiveEffects', true);

      moduleLogger.info(`Applicati ${desiredEffects.length} effetti a ${item.name}`, { registryId });
      return { updated: true, registryId };
    } catch (error) {
      moduleLogger.error(`Errore applicando effetti a ${item?.name}`, error);
      return { updated: false, error, registryId, reason: 'error' };
    }
  }

  async applyToPack(packId, { force = false, dryRun = false } = {}) {
    const pack = game.packs.get(packId);
    if (!pack) {
      moduleLogger.warn(`Pack ${packId} non trovato`);
      return { packId, processed: 0, updated: 0, errors: 1, missing: true };
    }

    const hasPackAccess = () => {
      if (pack.configure?.permission?.GRANTED) return true;
      if (typeof pack.canUserModify === 'function') {
        try {
          return pack.canUserModify(game.user, 'update');
        } catch (err) {
          moduleLogger.warn(`canUserModify non disponibile per ${pack.metadata?.label}`, err);
        }
      }
      const docClass = pack.documentClass;
      if (docClass?.canUserModify) {
        return docClass.canUserModify(game.user, 'update', {pack});
      }
      return game.user?.isGM ?? false;
    };

    if (!hasPackAccess()) {
      moduleLogger.warn(`Permessi insufficienti per modificare ${packId}`);
      return { packId, processed: 0, updated: 0, errors: 1, locked: true };
    }

    const documents = await pack.getDocuments();
    const summary = { packId, processed: 0, updated: 0, errors: 0, skipped: 0 };

    for (const doc of documents) {
      summary.processed += 1;
      const result = await this.applyToItem(doc, { force, dryRun });
      if (result.updated) {
        summary.updated += 1;
      } else if (result.reason === 'error') {
        summary.errors += 1;
      } else {
        summary.skipped += 1;
      }
    }

    return summary;
  }

  async applyAll({ force = false, dryRun = false, packs } = {}) {
    const packList = packs ?? this.getRegisteredPacks();
    const results = [];

    for (const packId of packList) {
      const summary = await this.applyToPack(packId, { force, dryRun });
      results.push(summary);
    }

    return results;
  }

  getStatus() {
    return {
      registryVersion: REGISTRY_VERSION,
      storedVersion: getSetting('version'),
      packs: this.getRegisteredPacks(),
      registryEntries: this.getRegistryEntries().length
    };
  }
}

const activeEffectsManager = new BrancaloniaActiveEffectsManager();

Hooks.once('setup', async () => {
  const generated = await loadGeneratedRegistry();
  ACTIVE_EFFECTS_REGISTRY = {
    ...generated,
    ...MANUAL_EFFECTS_REGISTRY
  };
  activeEffectsManager.setRegistry(ACTIVE_EFFECTS_REGISTRY);
});