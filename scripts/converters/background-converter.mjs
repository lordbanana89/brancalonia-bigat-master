/**
 * Convertitore per background di Brancalonia
 */

export default function convertBackground(doc) {
  const converted = {
    _id: doc.nome.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.random().toString(36).substring(2, 8),
    _key: '', // Will be set later
    name: doc.nome,
    type: 'background',
    img: 'icons/skills/trades/academics-study-reading-book.webp',
    system: {
      description: {
        value: `<p>${doc.descrizione}</p>`,
        chat: '',
        unidentified: ''
      },
      source: doc.fonte || 'Brancalonia',
      identifier: doc.nome.toLowerCase().replace(/[^a-z0-9]/g, ''),
      advancement: [],
      startingEquipment: []
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

  // Aggiungi advancement per skill proficiencies
  if (doc.meccaniche?.competenze_abilita) {
    const skills = [];
    const desc = doc.meccaniche.competenze_abilita.descrizione;

    // Mappa le abilità dal testo
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

    // Cerca le abilità nel testo
    for (const [skill, code] of Object.entries(skillMap)) {
      if (desc.includes(skill)) {
        skills.push(code);
      }
    }

    if (skills.length > 0) {
      converted.system.advancement.push({
        _id: Math.random().toString(36).substring(2, 18),
        type: 'Improvement',
        configuration: {
          skills: {
            chosen: skills,
            fixed: skills
          }
        },
        value: {
          skills: skills
        },
        level: 0,
        title: 'Competenze Abilità',
        icon: null,
        classRestriction: ''
      });
    }
  }

  // Aggiungi strumenti
  if (doc.meccaniche?.competenze_strumenti) {
    const tools = [];
    const desc = doc.meccaniche.competenze_strumenti.descrizione;

    const toolMap = {
      'gioco': ['game', 'dice', 'card'],
      'strumento musicale': ['music'],
      'kit da ladro': ['thief'],
      'arnesi del fabbro': ['smith'],
      'arnesi del falegname': ['carpenter'],
      'arnesi del calzolaio': ['cobbler']
    };

    for (const [tool, codes] of Object.entries(toolMap)) {
      if (desc.toLowerCase().includes(tool)) {
        tools.push(...codes);
      }
    }

    if (tools.length > 0) {
      converted.system.advancement.push({
        _id: Math.random().toString(36).substring(2, 18),
        type: 'Improvement',
        configuration: {
          tools: {
            chosen: tools,
            fixed: []
          }
        },
        value: {
          tools: tools
        },
        level: 0,
        title: 'Competenze Strumenti',
        icon: null,
        classRestriction: ''
      });
    }
  }

  // Aggiungi equipaggiamento iniziale
  if (doc.meccaniche?.equipaggiamento) {
    const items = [];
    const desc = doc.meccaniche.equipaggiamento.descrizione;

    // Parse equipment description
    const equipParts = desc.split(',').map(s => s.trim());

    for (const part of equipParts) {
      // Estrai quantità e nome
      const match = part.match(/(\d+)?\s*(.+)/);
      const qty = match[1] ? parseInt(match[1]) : 1;
      const itemName = match[2];

      // Gestisci monete
      if (itemName.includes(' ma')) {
        const goldMatch = itemName.match(/(\d+)\s*ma/);
        if (goldMatch) {
          items.push({
            uuid: 'Compendium.dnd5e.items.Item.cWi8SiGCmP89GQZZ', // Gold
            quantity: parseInt(goldMatch[1])
          });
        }
      } else {
        // Altri oggetti
        items.push({
          uuid: null, // Da collegare ai veri UUID degli oggetti
          quantity: qty,
          name: itemName
        });
      }
    }

    converted.system.startingEquipment = items;
  }

  // Aggiungi privilegio speciale
  if (doc.meccaniche?.privilegio_rissaiolo) {
    converted.system.advancement.push({
      _id: Math.random().toString(36).substring(2, 18),
      type: 'ItemGrant',
      configuration: {
        items: [{
          uuid: 'Compendium.brancalonia-bigat.brancalonia-features.Item.privilegio_rissaiolo',
          optional: false
        }]
      },
      value: {},
      level: 0,
      title: doc.meccaniche.privilegio_rissaiolo.descrizione,
      icon: null,
      classRestriction: ''
    });
  }

  // Aggiungi tratti personalità
  if (doc.caratterizzazione?.tratti) {
    const traitsHtml = '<h4>Tratti Personalità</h4><ul>' +
      doc.caratterizzazione.tratti.map(t => `<li>${t}</li>`).join('') +
      '</ul>';
    converted.system.description.value += traitsHtml;
  }

  // Aggiungi ideali
  if (doc.caratterizzazione?.ideali) {
    let idealsHtml = '<h4>Ideali</h4>';
    if (Array.isArray(doc.caratterizzazione.ideali)) {
      idealsHtml += '<ul>' +
        doc.caratterizzazione.ideali.map(i => `<li>${i}</li>`).join('') +
        '</ul>';
    } else {
      idealsHtml += `<p>${doc.caratterizzazione.ideali}</p>`;
    }
    converted.system.description.value += idealsHtml;
  }

  // Set _key
  converted._key = `!items!${converted._id}`;

  return converted;
}