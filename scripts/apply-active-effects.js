/**
 * Script per applicare Active Effects a runtime in Foundry VTT
 * Compatibile con D&D 5e v5.1.9 e Foundry v13
 *
 * NOTA: Gli Active Effects NON possono essere inclusi nei file JSON sorgenti
 * a causa di limitazioni del Foundry CLI. Devono essere applicati a runtime.
 */

// Mappatura completa degli Active Effects per ogni item
const ACTIVE_EFFECTS_MAP = {
  // RAZZE
  'morgante001': [
    {
      name: 'Robusto come un Tronco',
      icon: 'icons/creatures/humanoid/giant.webp',
      changes: [
        {
          key: 'system.attributes.hp.bonuses.level',
          mode: 2, // ADD
          value: '1',
          priority: 20
        },
        {
          key: 'system.attributes.hp.bonuses.overall',
          mode: 2,
          value: '1',
          priority: 20
        }
      ]
    },
    {
      name: 'Stomaco d\'Acciaio',
      icon: 'icons/creatures/humanoid/giant.webp',
      changes: [
        {
          key: 'flags.brancalonia-bigat.stomacoDacciaio',
          mode: 5, // OVERRIDE
          value: 'true',
          priority: 20
        }
      ]
    },
    {
      name: 'Gigantesco',
      icon: 'icons/creatures/humanoid/giant.webp',
      changes: [
        {
          key: 'system.attributes.encumbrance.bonuses.carry',
          mode: 1, // MULTIPLY
          value: '2',
          priority: 20
        }
      ]
    }
  ],

  'malebranche001': [
    {
      name: 'Resistenza Infernale',
      icon: 'icons/creatures/humanoid/devil-horned-red.webp',
      changes: [
        {
          key: 'system.traits.dr.value',
          mode: 2,
          value: 'fire',
          priority: 20
        }
      ]
    }
  ],

  'marionetta001': [
    {
      name: 'Costrutto',
      icon: 'icons/creatures/magical/construct-wood.webp',
      changes: [
        {
          key: 'system.traits.di.value',
          mode: 2,
          value: 'poison',
          priority: 20
        },
        {
          key: 'system.traits.ci.value',
          mode: 2,
          value: 'poisoned',
          priority: 20
        },
        {
          key: 'system.traits.ci.value',
          mode: 2,
          value: 'exhaustion',
          priority: 20
        }
      ]
    }
  ],

  // TALENTI
  'talent_supercazzola': [
    {
      name: 'Dadi Supercazzola',
      icon: 'icons/magic/control/tongue-coil-green.webp',
      changes: [
        {
          key: 'flags.brancalonia-bigat.supercazzolaDice',
          mode: 5,
          value: '2d4',
          priority: 20
        }
      ]
    }
  ],

  'talent_fortuna_bifolco': [
    {
      name: 'Fortuna del Bifolco',
      icon: 'icons/magic/fortune/fortune-coin-gold.webp',
      changes: [
        {
          key: 'flags.dnd5e.initiativeAdv',
          mode: 5,
          value: 'true',
          priority: 20
        }
      ]
    }
  ],

  'talent_lingua_sciolta': [
    {
      name: 'Lingua Sciolta',
      icon: 'icons/magic/control/tongue-speak-green.webp',
      changes: [
        {
          key: 'system.skills.dec.bonuses.check',
          mode: 2,
          value: '2',
          priority: 20
        },
        {
          key: 'system.skills.per.bonuses.check',
          mode: 2,
          value: '2',
          priority: 20
        }
      ]
    }
  ],

  // PRIVILEGI CLASSE (brancalonia-features)
  'knave_uncanny_dodge': [
    {
      name: 'Schivata Prodigiosa',
      icon: 'icons/skills/movement/arrow-acrobatics-red.webp',
      changes: [
        {
          key: 'flags.brancalonia-bigat.uncannyDodge',
          mode: 5,
          value: 'true',
          priority: 20
        }
      ]
    }
  ],

  'straccione_unarmored_defense': [
    {
      name: 'Difesa Senza Armatura',
      icon: 'icons/skills/melee/unarmed-punch-fist.webp',
      changes: [
        {
          key: 'system.attributes.ac.calc',
          mode: 5,
          value: 'custom',
          priority: 20
        },
        {
          key: 'system.attributes.ac.formula',
          mode: 5,
          value: '10 + @abilities.dex.mod + @abilities.con.mod',
          priority: 20
        }
      ]
    }
  ],

  'straccione_hardy': [
    {
      name: 'Robusto',
      icon: 'icons/skills/wounds/injury-triple-slash-bleed.webp',
      changes: [
        {
          key: 'system.traits.dr.value',
          mode: 2,
          value: 'bludgeoning',
          priority: 20
        }
      ]
    }
  ],

  // EMERITICENZE
  'emeriticenza_energumeno': [
    {
      name: 'Energumeno - Bonus PF',
      icon: 'icons/magic/life/heart-cross-large-green.webp',
      changes: [
        {
          key: 'system.attributes.hp.bonuses.overall',
          mode: 2,
          value: '6 + @abilities.con.mod',
          priority: 20
        }
      ]
    }
  ],

  'emeriticenza_assoluta': [
    {
      name: 'Emeriticenza Assoluta - Competenza +4',
      icon: 'icons/magic/control/mind-fear-orange.webp',
      changes: [
        {
          key: 'system.attributes.prof',
          mode: 5,
          value: '4',
          priority: 30
        }
      ]
    }
  ],

  'emeriticenza_arma_preferita': [
    {
      name: 'Arma Preferita - Bonus Danni',
      icon: 'icons/weapons/swords/sword-guard-blue.webp',
      changes: [
        {
          key: 'system.bonuses.mwak.damage',
          mode: 2,
          value: '@prof',
          priority: 20
        }
      ]
    }
  ],

  'emeriticenza_indomito': [
    {
      name: 'Indomito - Immune Spaventato',
      icon: 'icons/magic/control/defense-shield-barrier-blue.webp',
      changes: [
        {
          key: 'system.traits.ci.value',
          mode: 2,
          value: 'frightened',
          priority: 20
        }
      ]
    }
  ],

  'emeriticenza_rissaiolo_professionista': [
    {
      name: 'Rissaiolo - Slot Mossa Extra',
      icon: 'icons/skills/melee/unarmed-punch-fist-brown.webp',
      changes: [
        {
          key: 'flags.brancalonia-bigat.slotMossa',
          mode: 2,
          value: '1',
          priority: 20
        }
      ]
    }
  ]
};

/**
 * Applica Active Effects a un item
 */
async function applyActiveEffects(item) {
  const itemId = item.data._id || item.data.id;
  const effects = ACTIVE_EFFECTS_MAP[itemId];

  if (!effects || effects.length === 0) {
    return false;
  }

  console.log(`🔧 Applicando Active Effects a ${item.name} (${itemId})`);

  // Crea gli effetti
  const effectsData = effects.map(effect => ({
    label: effect.name,
    icon: effect.icon || item.img,
    changes: effect.changes,
    disabled: false,
    transfer: true,
    flags: {
      'dnd5e': {
        type: item.type,
        rider: itemId
      }
    }
  }));

  // Applica gli effetti all'item
  try {
    await item.createEmbeddedDocuments('ActiveEffect', effectsData);
    console.log(`✅ Aggiunti ${effectsData.length} effetti a ${item.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Errore applicando effetti a ${item.name}:`, error);
    return false;
  }
}

/**
 * Hook per applicare effetti quando il modulo viene inizializzato
 */
Hooks.once('ready', async () => {
  console.log('🚀 Brancalonia: Inizializzazione Active Effects...');

  // Ottieni tutti i compendi del modulo
  const packKeys = [
    'brancalonia-bigat.razze',
    'brancalonia-bigat.talenti',
    'brancalonia-bigat.brancalonia-features',
    'brancalonia-bigat.emeriticenze',
    'brancalonia-bigat.backgrounds',
    'brancalonia-bigat.equipaggiamento',
    'brancalonia-bigat.sottoclassi'
  ];

  let totalApplied = 0;
  let totalProcessed = 0;

  for (const packKey of packKeys) {
    const pack = game.packs.get(packKey);
    if (!pack) continue;

    console.log(`📦 Processando compendio ${pack.metadata.label}...`);

    // Carica tutti i documenti del compendio
    const documents = await pack.getDocuments();

    for (const doc of documents) {
      totalProcessed++;

      // Controlla se l'item ha già effetti
      if (doc.effects && doc.effects.size > 0) {
        continue;
      }

      // Applica gli effetti se presenti nella mappa
      const applied = await applyActiveEffects(doc);
      if (applied) {
        totalApplied++;
      }
    }
  }

  console.log(`✨ Brancalonia: Active Effects applicati!`);
  console.log(`📊 Risultati: ${totalApplied} items aggiornati su ${totalProcessed} processati`);

  // Notifica all'utente
  if (totalApplied > 0) {
    ui.notifications.info(`Brancalonia: Applicati Active Effects a ${totalApplied} items`);
  }
});

/**
 * Hook per applicare effetti quando un item viene creato o importato
 */
Hooks.on('createItem', async (item, options, userId) => {
  // Applica solo agli item del modulo Brancalonia
  if (!item.flags?.['brancalonia-bigat']) return;

  // Applica gli effetti se necessario
  if (!item.effects || item.effects.size === 0) {
    await applyActiveEffects(item);
  }
});

console.log('📜 Brancalonia: Script Active Effects caricato');