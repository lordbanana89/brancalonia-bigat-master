/**
 * Convertitore avanzato per background di Brancalonia
 * Compatibile con D&D 5e v5.1.9
 */

export default function convertBackground(doc) {
  const bgId = doc.nome.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.random().toString(36).substring(2, 8);

  const converted = {
    _id: bgId,
    _key: `!items!${bgId}`,
    name: doc.nome,
    type: 'background',
    img: getBackgroundIcon(doc.nome),
    system: {
      description: {
        value: buildDescription(doc),
        chat: '',
        unidentified: ''
      },
      source: doc.fonte || 'Brancalonia',
      identifier: doc.nome.toLowerCase().replace(/[^a-z0-9]/g, ''),
      advancement: []
    },
    effects: [],
    folder: null,
    sort: 0,
    ownership: {
      default: 0
    },
    flags: {
      brancalonia: {
        fonte: doc.fonte,
        validazione: doc.validazione || {}
      }
    }
  };

  // Build complete description with all sections
  function buildDescription(doc) {
    let html = `<p><em>${doc.descrizione}</em></p>\n`;

    // Add skill proficiencies section
    if (doc.meccaniche?.competenze_abilita) {
      const skills = extractSkills(doc.meccaniche.competenze_abilita.descrizione);
      if (skills.length > 0) {
        html += `<p><strong>Skill Proficiencies:</strong> ${skills.join(', ')}</p>\n`;
      }
    }

    // Add tool proficiencies
    if (doc.meccaniche?.competenze_strumenti) {
      html += `<p><strong>Tool Proficiencies:</strong> ${doc.meccaniche.competenze_strumenti.descrizione}</p>\n`;
    }

    // Add languages
    if (doc.meccaniche?.linguaggi) {
      html += `<p><strong>Languages:</strong> ${doc.meccaniche.linguaggi.descrizione}</p>\n`;
    }

    // Add equipment
    if (doc.meccaniche?.equipaggiamento) {
      html += `<p><strong>Equipment:</strong> ${doc.meccaniche.equipaggiamento.descrizione}</p>\n`;
    }

    // Add feature
    if (doc.meccaniche?.privilegio_rissaiolo || doc.meccaniche?.privilegio_specializzato) {
      const privilegio = doc.meccaniche.privilegio_rissaiolo || doc.meccaniche.privilegio_specializzato;
      html += `<h3>Feature: ${getNomePrivilegio(doc.nome)}</h3>\n`;
      html += `<p>${privilegio.descrizione}</p>\n`;
    }

    // Add suggested characteristics
    if (doc.caratterizzazione) {
      html += `<h3>Suggested Characteristics</h3>\n`;

      if (doc.caratterizzazione.tratti) {
        html += `<p>I ${doc.nome.toLowerCase()} di Brancalonia sono caratterizzati da:</p>\n`;
        html += `<table><thead><tr><th>d8</th><th>Personality Trait</th></tr></thead><tbody>`;
        doc.caratterizzazione.tratti.forEach((trait, i) => {
          html += `<tr><td>${i + 1}</td><td>${trait}</td></tr>`;
        });
        html += `</tbody></table>\n`;
      }

      if (doc.caratterizzazione.ideali) {
        if (Array.isArray(doc.caratterizzazione.ideali)) {
          html += `<table><thead><tr><th>d6</th><th>Ideal</th></tr></thead><tbody>`;
          doc.caratterizzazione.ideali.forEach((ideal, i) => {
            html += `<tr><td>${i + 1}</td><td>${ideal}</td></tr>`;
          });
          html += `</tbody></table>\n`;
        } else {
          html += `<p><strong>Ideals:</strong> ${doc.caratterizzazione.ideali}</p>\n`;
        }
      }
    }

    return html;
  }

  // Extract skill names from description
  function extractSkills(desc) {
    const skillMap = {
      'Acrobazia': 'Acrobatics',
      'Addestrare Animali': 'Animal Handling',
      'Arcano': 'Arcana',
      'Atletica': 'Athletics',
      'Furtività': 'Stealth',
      'Indagare': 'Investigation',
      'Inganno': 'Deception',
      'Intimidire': 'Intimidation',
      'Intrattenere': 'Performance',
      'Intuizione': 'Insight',
      'Medicina': 'Medicine',
      'Natura': 'Nature',
      'Percezione': 'Perception',
      'Persuasione': 'Persuasion',
      'Rapidità di Mano': 'Sleight of Hand',
      'Religione': 'Religion',
      'Sopravvivenza': 'Survival',
      'Storia': 'History'
    };

    const skills = [];
    for (const [ita, eng] of Object.entries(skillMap)) {
      if (desc.includes(ita)) {
        skills.push(eng);
      }
    }
    return skills;
  }

  // Get feature name based on background
  function getNomePrivilegio(nome) {
    const privilegi = {
      'Attaccabrighe': 'Rissaiolo',
      'Ambulante': 'Vita da Strada',
      'Azzeccagarbugli': 'Linguaggio Legale',
      'Bargello': 'Autorità Residua',
      'Brado': 'Selvaggio',
      'Cantastorie': 'Intrattenimento',
      'Cialtrone': 'Identità Fasulla',
      'Contrabbandiere': 'Contrabbando',
      'Disertore': 'Vita Militare',
      'Duro': 'Temprato dalle Difficoltà',
      'Fuggitivo': 'In Fuga',
      'Locandiere': 'Ospitalità',
      'Pellegrino': 'Ospitalità Religiosa',
      'Villano': 'Ospitalità Rustica'
    };
    return privilegi[nome] || 'Privilegio Speciale';
  }

  // Get appropriate icon for background
  function getBackgroundIcon(nome) {
    const icons = {
      'Attaccabrighe': 'icons/skills/melee/unarmed-punch-fist-yellow.webp',
      'Ambulante': 'icons/environment/people/commoner.webp',
      'Azzeccagarbugli': 'icons/sundries/documents/document-official-capital.webp',
      'Bargello': 'icons/equipment/shield/heater-shield-steel-worn.webp',
      'Brado': 'icons/environment/wilderness/tree-oak.webp',
      'Cantastorie': 'icons/skills/trades/music-singing-voice-blue.webp',
      'Cialtrone': 'icons/skills/social/theft-pickpocket-bribery.webp',
      'Contrabbandiere': 'icons/containers/bags/pack-leather-black-white.webp',
      'Disertore': 'icons/equipment/weapons/sword-two-handed-damaged.webp',
      'Duro': 'icons/skills/melee/shield-damaged-broken-orange.webp',
      'Fuggitivo': 'icons/skills/movement/feet-sprint-barefoot-sand.webp',
      'Locandiere': 'icons/environment/settlement/tavern-interior.webp',
      'Pellegrino': 'icons/magic/holy/saint-glass-portrait-halo.webp',
      'Villano': 'icons/tools/hand/shovel-spade-brown-grey.webp'
    };
    return icons[nome] || 'icons/skills/trades/academics-study-reading-book.webp';
  }

  // Add proper advancement entries
  // Skills
  if (doc.meccaniche?.competenze_abilita) {
    const skillCodes = [];
    const desc = doc.meccaniche.competenze_abilita.descrizione;

    const skillMap = {
      'Acrobazia': 'acr',
      'Addestrare Animali': 'ani',
      'Arcano': 'arc',
      'Atletica': 'ath',
      'Furtività': 'ste',
      'Indagare': 'inv',
      'Inganno': 'dec',
      'Intimidire': 'itm',
      'Intrattenere': 'prf',
      'Intuizione': 'ins',
      'Medicina': 'med',
      'Natura': 'nat',
      'Percezione': 'prc',
      'Persuasione': 'per',
      'Rapidità di Mano': 'slt',
      'Religione': 'rel',
      'Sopravvivenza': 'sur',
      'Storia': 'his'
    };

    for (const [skill, code] of Object.entries(skillMap)) {
      if (desc.includes(skill)) {
        skillCodes.push(code);
      }
    }

    if (skillCodes.length > 0) {
      converted.system.advancement.push({
        _id: Math.random().toString(36).substring(2, 18),
        type: 'Improvement',
        configuration: {
          skills: {
            chosen: [],
            fixed: skillCodes
          }
        },
        value: {},
        level: 0,
        title: '',
        classRestriction: '',
        appliedEffects: []
      });
    }
  }

  // Tools
  if (doc.meccaniche?.competenze_strumenti) {
    const desc = doc.meccaniche.competenze_strumenti.descrizione.toLowerCase();
    const tools = [];

    if (desc.includes('gioco')) {
      tools.push('game');
    }
    if (desc.includes('musica') || desc.includes('strumento')) {
      tools.push('music');
    }
    if (desc.includes('ladro')) {
      tools.push('thieves');
    }

    if (tools.length > 0) {
      converted.system.advancement.push({
        _id: Math.random().toString(36).substring(2, 18),
        type: 'Improvement',
        configuration: {
          tools: {
            chosen: tools.length > 1 ? tools : [],
            fixed: tools.length === 1 ? tools : []
          }
        },
        value: {},
        level: 0,
        title: '',
        classRestriction: '',
        appliedEffects: []
      });
    }
  }

  // Languages
  if (doc.meccaniche?.linguaggi) {
    const desc = doc.meccaniche.linguaggi.descrizione.toLowerCase();
    const langs = [];

    if (desc.includes('baccaglio')) {
      langs.push('cant'); // Thieves' cant equivalent
    }

    converted.system.advancement.push({
      _id: Math.random().toString(36).substring(2, 18),
      type: 'Improvement',
      configuration: {
        languages: {
          chosen: [],
          fixed: langs
        }
      },
      value: {},
      level: 0,
      title: '',
      classRestriction: '',
      appliedEffects: []
    });
  }

  // Equipment
  if (doc.meccaniche?.equipaggiamento) {
    const items = [];
    const desc = doc.meccaniche.equipaggiamento.descrizione;

    // Parse equipment
    const parts = desc.split(',').map(s => s.trim());
    for (const part of parts) {
      if (part.includes(' ma')) {
        const match = part.match(/(\d+)\s*ma/);
        if (match) {
          items.push({
            uuid: 'Compendium.dnd5e.items.Item.cWi8SiGCmP89GQZZ', // Gold
            quantity: parseInt(match[1])
          });
        }
      }
    }

    converted.system.startingEquipment = items;
  }

  // Feature as ItemGrant
  if (doc.meccaniche?.privilegio_rissaiolo || doc.meccaniche?.privilegio_specializzato) {
    const privilegio = doc.meccaniche.privilegio_rissaiolo || doc.meccaniche.privilegio_specializzato;
    converted.system.advancement.push({
      _id: Math.random().toString(36).substring(2, 18),
      type: 'ItemGrant',
      configuration: {
        items: [],
        optional: false,
        spell: null
      },
      value: {},
      level: 0,
      title: getNomePrivilegio(doc.nome),
      classRestriction: '',
      appliedEffects: []
    });
  }

  return converted;
}