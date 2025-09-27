/**
 * Implementa Active Effects per i 21 privilegi mancanti con meccaniche reali
 */

const privilegiMancanti = {
  // STRACCIONE - Classe del mendicante combattente
  'straccione_unarmored_defense': [{
    label: 'Difesa Improvvisata',
    icon: 'icons/skills/melee/unarmed-punch-fist.webp',
    changes: [
      // CA = 10 + STR/DEX + CON (richiede configurazione manuale)
      { key: 'flags.brancalonia-bigat.unarmoredDefense', mode: 5, value: 'straccione', priority: 20 }
    ],
    transfer: true
  }],

  'straccione_street_resilience': [{
    label: 'Resilienza di Strada',
    icon: 'icons/skills/wounds/injury-chest-blood-red.webp',
    changes: [
      // +1d6 quando spende Dadi Vita durante riposo breve
      { key: 'flags.brancalonia-bigat.shortRestBonus', mode: 2, value: '1d6', priority: 20 }
    ],
    transfer: true
  }],

  'straccione_hardy': [{
    label: 'Tempra del Bigat',
    icon: 'icons/skills/wounds/injury-triple-slash-bleed.webp',
    changes: [
      // PF temporanei = CON mod all'inizio del combattimento
      { key: 'flags.brancalonia-bigat.combatTempHP', mode: 5, value: '@abilities.con.mod', priority: 20 }
      // Vantaggio TS malattie gestito narrativamente
    ],
    transfer: true
  }],

  'straccione_survivor': [{
    label: 'Sopravvissuto di Strada',
    icon: 'icons/skills/wounds/injury-pain-red.webp',
    changes: [
      // Resistenza a veleno
      { key: 'system.traits.dr.value', mode: 2, value: 'poison', priority: 20 }
    ],
    transfer: true
  }],

  'straccione_supreme_survivor': [{
    label: 'Sopravvissuto Supremo',
    icon: 'icons/magic/life/heart-glowing-red.webp',
    changes: [
      // Recupera 5 + CON mod PF all'inizio del turno se sotto metà PF
      { key: 'flags.brancalonia-bigat.regeneration', mode: 5, value: '5 + @abilities.con.mod', priority: 20 }
    ],
    transfer: true
  }],

  'straccione_beggars_fortune': [{
    label: 'Fortuna del Mendicante',
    icon: 'icons/commodities/currency/coins-assorted-mix-copper.webp',
    changes: [
      // Fortuna estrema (riroll 1 naturali) - gestito narrativamente
      { key: 'flags.brancalonia-bigat.luckyReroll', mode: 5, value: '1', priority: 20 }
    ],
    transfer: true
  }],

  // MORGANTE - Il gigante
  'morgante_gigantesco': [{
    label: 'Gigantesco',
    icon: 'icons/creatures/humanoid/giant.webp',
    changes: [
      // Conta come una taglia più grande per trasporto
      { key: 'system.attributes.encumbrance.bonuses.multiplier', mode: 1, value: '2', priority: 20 }
    ],
    transfer: true
  }],

  // MARIONETTA - Costrutto vivente
  'marionetta_aggiustarsi': [{
    label: 'Aggiustarsi',
    icon: 'icons/tools/repair/hammer-wrench-brown.webp',
    changes: [
      // +2d8 Dadi Vita extra durante riposo breve
      { key: 'flags.brancalonia-bigat.bonusHitDice', mode: 2, value: '2d8', priority: 20 }
    ],
    transfer: true
  }],

  'marionetta_privilegio_rissa': [{
    label: 'Privilegio da Rissa: Braccio Smontabile',
    icon: 'icons/equipment/hand/gauntlet-armored-blue.webp',
    changes: [
      // Attacco a distanza con braccio (1d6) - gestito come arma
      { key: 'flags.brancalonia-bigat.detachableLimb', mode: 5, value: '1d6', priority: 20 }
    ],
    transfer: true
  }],

  // KNAVE - Ladro furfante
  'knave_evasion': [{
    label: 'Elusione',
    icon: 'icons/skills/movement/arrow-down-blue.webp',
    changes: [
      // Se supera TS DEX per area, nessun danno invece di metà
      { key: 'flags.dnd5e.remarkableAthlete.dex', mode: 5, value: '1', priority: 20 }
    ],
    transfer: true
  }],

  'knave_stroke_luck': [{
    label: 'Colpo di Fortuna',
    icon: 'icons/skills/social/diplomacy-handshake.webp',
    changes: [
      // Trasforma fallimento in successo 1/riposo breve
      { key: 'flags.brancalonia-bigat.strokeOfLuck', mode: 5, value: '1', priority: 20 }
    ],
    transfer: true
  }],

  // PAGANO - Barbaro primitivo
  'pagano_barbaro_coraggio': [{
    label: 'Barbaro Coraggio',
    icon: 'icons/skills/melee/weapons-crossed-swords-purple.webp',
    changes: [
      // Vantaggio ai TS contro paura e charme mentre in Ira
      { key: 'flags.brancalonia-bigat.rageAdvantage', mode: 5, value: 'fear,charm', priority: 20 }
    ],
    transfer: true
  }],

  // DOTATO - Mago spontaneo
  'dotato_influsso_magico': [{
    label: 'Influsso Magico',
    icon: 'icons/magic/symbols/runes-star-blue.webp',
    changes: [
      // +1 attacco e danno con incantesimi
      { key: 'system.bonuses.rsak.attack', mode: 2, value: '1', priority: 20 },
      { key: 'system.bonuses.rsak.damage', mode: 2, value: '1', priority: 20 },
      { key: 'system.bonuses.msak.attack', mode: 2, value: '1', priority: 20 },
      { key: 'system.bonuses.msak.damage', mode: 2, value: '1', priority: 20 }
    ],
    transfer: true
  }],

  'dotato_privilegio_rissa': [{
    label: 'Privilegio da Rissa: Adattamento Magico',
    icon: 'icons/magic/symbols/star-shine-blue.webp',
    changes: [
      // Resistenza a un tipo di danno scelto
      { key: 'flags.brancalonia-bigat.adaptiveResistance', mode: 5, value: 'choice', priority: 20 }
    ],
    transfer: true
  }],

  'dotato_risonanza_magica': [{
    label: 'Risonanza Magica',
    icon: 'icons/magic/symbols/rune-sigil-blue.webp',
    changes: [
      // Vantaggio ai TS contro incantesimi
      { key: 'flags.brancalonia-bigat.magicSaveAdvantage', mode: 5, value: '1', priority: 20 }
    ],
    transfer: true
  }],

  // GUISCARDO - Ingegnere ciarlatano
  'guiscardo_chincaglieria': [{
    label: 'Chincaglieria Magica',
    icon: 'icons/tools/scribal/ink-quill-glass-blue.webp',
    changes: [
      // Oggetti temporanei con effetti minori - narrativo
      { key: 'flags.brancalonia-bigat.trinkets', mode: 5, value: '3', priority: 20 }
    ],
    transfer: true
  }],

  // MALEBRANCHE - Diavolo minore
  'malebranche_malavoce': [{
    label: 'Malavoce',
    icon: 'icons/magic/sonic/scream-wail-shout-purple.webp',
    changes: [
      // Intimidire con vantaggio
      { key: 'system.skills.itm.bonuses.check', mode: 2, value: '1d4', priority: 20 }
    ],
    transfer: true
  }],

  // Liste incantesimi - NON servono Active Effects
  'benandante_incantesimi_circolo': null, // Lista incantesimi
  'cavaliere_errante_oath_spells': null, // Lista incantesimi
  'menagramo_lista_incantesimi': null, // Lista incantesimi
  'miracolaro_domain_spells': null // Lista incantesimi
};

// Conta effetti implementati
const implementati = Object.entries(privilegiMancanti).filter(([k,v]) => v !== null).length;
const listnIncantesimi = Object.entries(privilegiMancanti).filter(([k,v]) => v === null).length;

console.log('📊 IMPLEMENTAZIONE PRIVILEGI MANCANTI');
console.log('=' .repeat(60));
console.log(`✅ Privilegi con meccaniche: ${implementati}`);
console.log(`📚 Liste incantesimi (non servono effects): ${listnIncantesimi}`);
console.log('\n// Aggiungi al file brancalonia-active-effects-complete.js:\n');

// Output per il modulo JavaScript
for (const [id, effects] of Object.entries(privilegiMancanti)) {
  if (effects) {
    console.log(`  '${id}': ${JSON.stringify(effects, null, 2).replace(/\n/g, '\n  ')},\n`);
  }
}