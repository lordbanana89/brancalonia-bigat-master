/**
 * Brancalonia - Sistema Active Effects Runtime
 * Applica Active Effects a runtime per aggirare limitazione Foundry CLI (Issue #41)
 * Compatibile con D&D 5e v3.3.1 e Foundry v13
 */

// Mappatura completa Active Effects per ogni item
const BRANCALONIA_EFFECTS = {
  // ========================================
  // RAZZE
  // ========================================
  'morgante001': [
    {
      label: 'Robusto come un Tronco',
      icon: 'icons/creatures/humanoid/giant.webp',
      changes: [
        { key: 'system.attributes.hp.bonuses.level', mode: 2, value: '1', priority: 20 },
        { key: 'system.attributes.hp.bonuses.overall', mode: 2, value: '1', priority: 20 }
      ]
    },
    {
      label: 'Stomaco d\'Acciaio',
      icon: 'icons/creatures/humanoid/giant.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.stomacoDacciaio', mode: 5, value: 'true', priority: 20 }
      ]
    },
    {
      label: 'Gigantesco',
      icon: 'icons/creatures/humanoid/giant.webp',
      changes: [
        { key: 'system.attributes.encumbrance.bonuses.carry', mode: 1, value: '2', priority: 20 }
      ]
    }
  ],

  'malebranche001': [
    {
      label: 'Resistenza Infernale',
      icon: 'icons/creatures/humanoid/devil-horned-red.webp',
      changes: [
        { key: 'system.traits.dr.value', mode: 2, value: 'fire', priority: 20 }
      ]
    }
  ],

  'marionetta001': [
    {
      label: 'Costrutto',
      icon: 'icons/creatures/magical/construct-wood.webp',
      changes: [
        { key: 'system.traits.di.value', mode: 2, value: 'poison', priority: 20 },
        { key: 'system.traits.ci.value', mode: 2, value: 'poisoned', priority: 20 },
        { key: 'system.traits.ci.value', mode: 2, value: 'exhaustion', priority: 20 }
      ]
    }
  ],

  'selvatico001': [
    {
      label: 'Istinto Selvaggio',
      icon: 'icons/creatures/magical/beast-wolf.webp',
      changes: [
        { key: 'system.skills.sur.bonuses.check', mode: 2, value: '2', priority: 20 }
      ]
    }
  ],

  'dotato001': [
    {
      label: 'Dote Magica',
      icon: 'icons/magic/light/orb-lightbulb-blue.webp',
      changes: [
        { key: 'system.bonuses.spell.dc', mode: 2, value: '1', priority: 20 }
      ]
    }
  ],

  // ========================================
  // TALENTI
  // ========================================
  'talent_supercazzola': [
    {
      label: 'Dadi Supercazzola',
      icon: 'icons/magic/control/tongue-coil-green.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.supercazzolaDice', mode: 5, value: '2d4', priority: 20 }
      ]
    }
  ],

  'fortunadelbifolco001': [
    {
      label: 'Fortuna del Bifolco',
      icon: 'icons/magic/fortune/fortune-coin-gold.webp',
      changes: [
        { key: 'flags.dnd5e.initiativeAdv', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  'linguasciolta001': [
    {
      label: 'Lingua Sciolta',
      icon: 'icons/magic/control/tongue-speak-green.webp',
      changes: [
        { key: 'system.skills.dec.bonuses.check', mode: 2, value: '2', priority: 20 },
        { key: 'system.skills.per.bonuses.check', mode: 2, value: '2', priority: 20 }
      ]
    }
  ],

  'attaccabrighe001': [
    {
      label: 'Attaccabrighe',
      icon: 'icons/skills/melee/fist-punch-impact-orange.webp',
      changes: [
        { key: 'system.bonuses.mwak.attack', mode: 2, value: '1', priority: 20 }
      ]
    }
  ],

  'talent_cialtroneria': [
    {
      label: 'Cialtroneria',
      icon: 'icons/skills/social/theft-pickpocket-bribery.webp',
      changes: [
        { key: 'system.skills.slt.bonuses.check', mode: 2, value: '@prof', priority: 20 }
      ]
    }
  ],

  // ========================================
  // PRIVILEGI CLASSE (brancalonia-features)
  // ========================================
  'knave_uncanny_dodge': [
    {
      label: 'Schivata Prodigiosa',
      icon: 'icons/skills/movement/arrow-acrobatics-red.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.uncannyDodge', mode: 5, value: 'true', priority: 20 }
      ]
    }
  ],

  'straccione_unarmored_defense': [
    {
      label: 'Difesa Senza Armatura',
      icon: 'icons/skills/melee/unarmed-punch-fist.webp',
      changes: [
        { key: 'system.attributes.ac.calc', mode: 5, value: 'custom', priority: 20 },
        { key: 'system.attributes.ac.formula', mode: 5, value: '10 + @abilities.dex.mod + @abilities.con.mod', priority: 20 }
      ]
    }
  ],

  'straccione_hardy': [
    {
      label: 'Robusto',
      icon: 'icons/skills/wounds/injury-triple-slash-bleed.webp',
      changes: [
        { key: 'system.traits.dr.value', mode: 2, value: 'bludgeoning', priority: 20 }
      ]
    }
  ],

  // ========================================
  // EMERITICENZE
  // ========================================
  'emeriticenza_energumeno': [
    {
      label: 'Energumeno - Bonus PF',
      icon: 'icons/magic/life/heart-cross-large-green.webp',
      changes: [
        { key: 'system.attributes.hp.bonuses.overall', mode: 2, value: '6 + @abilities.con.mod', priority: 20 }
      ]
    }
  ],

  'emeriticenza_assoluta': [
    {
      label: 'Emeriticenza Assoluta',
      icon: 'icons/magic/control/mind-fear-orange.webp',
      changes: [
        { key: 'system.attributes.prof', mode: 5, value: '4', priority: 30 }
      ]
    }
  ],

  'emeriticenza_arma_preferita': [
    {
      label: 'Arma Preferita',
      icon: 'icons/weapons/swords/sword-guard-blue.webp',
      changes: [
        { key: 'system.bonuses.mwak.damage', mode: 2, value: '@prof', priority: 20 }
      ]
    }
  ],

  'emeriticenza_indomito': [
    {
      label: 'Indomito',
      icon: 'icons/magic/control/defense-shield-barrier-blue.webp',
      changes: [
        { key: 'system.traits.ci.value', mode: 2, value: 'frightened', priority: 20 }
      ]
    }
  ],

  'emeriticenza_rissaiolo_professionista': [
    {
      label: 'Rissaiolo Professionista',
      icon: 'icons/skills/melee/unarmed-punch-fist-brown.webp',
      changes: [
        { key: 'flags.brancalonia-bigat.slotMossa', mode: 2, value: '1', priority: 20 }
      ]
    }
  ],

  'emeriticenza_affinamento': [
    {
      label: 'Affinamento',
      icon: 'icons/magic/control/buff-strength-muscle-red.webp',
      changes: []
    }
  ],

  'emeriticenza_santa_fortuna': [
    {
      label: 'Santa Fortuna',
      icon: 'icons/magic/life/ankh-gold-green.webp',
      changes: []
    }
  ],

  'emeriticenza_gioco_squadra': [
    {
      label: 'Gioco di Squadra',
      icon: 'icons/magic/control/target-arrow-green.webp',
      changes: []
    }
  ],

  'emeriticenza_fandonia_migliorata': [
    {
      label: 'Fandonia Migliorata',
      icon: 'icons/magic/control/silhouette-hold-beam-green.webp',
      changes: []
    }
  ],

  // ========================================
  // BACKGROUND
  // ========================================
  'ambulante001': [
    {
      label: 'Competenze Ambulante',
      icon: 'icons/tools/navigation/map-marked-blue.webp',
      changes: [
        { key: 'system.skills.inv.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.sur.value', mode: 5, value: '1', priority: 20 }
      ]
    }
  ],

  'attaccabrighe_background': [
    {
      label: 'Competenze Attaccabrighe',
      icon: 'icons/skills/melee/sword-damaged-broken.webp',
      changes: [
        { key: 'system.skills.ath.value', mode: 5, value: '1', priority: 20 },
        { key: 'system.skills.itm.value', mode: 5, value: '1', priority: 20 }
      ]
    }
  ],

  // ========================================
  // EQUIPAGGIAMENTO
  // ========================================
  'armaturadecuoiorappezzata001': [
    {
      label: 'Armatura Scadente',
      icon: 'icons/equipment/chest/breastplate-leather-brown.webp',
      changes: [
        { key: 'system.attributes.ac.value', mode: 2, value: '-1', priority: 10 }
      ]
    }
  ],

  'amuletodisanpancrazio001': [
    {
      label: 'Protezione di San Pancrazio',
      icon: 'icons/equipment/neck/amulet-symbol-holy-gold.webp',
      changes: [
        { key: 'system.bonuses.abilities.save', mode: 2, value: '1', priority: 20 }
      ]
    }
  ]
};

/**
 * Applica Active Effects a un item nel compendio
 */
async function applyBrancaloniaEffects(item) {
  try {
    const itemId = item.id || item._id;
    const effects = BRANCALONIA_EFFECTS[itemId];

    if (!effects || effects.length === 0) {
      return false;
    }

    // Controlla se l'item ha già effetti
    if (item.effects && item.effects.size > 0) {
      console.log(`⏭️  ${item.name}: ha già effetti`);
      return false;
    }

    console.log(`🔧 Applicando Active Effects a ${item.name} (${itemId})`);

    // Prepara i dati degli effetti
    const effectsData = effects.map(effect => ({
      label: effect.label,
      icon: effect.icon || item.img,
      changes: effect.changes || [],
      disabled: false,
      transfer: true,
      duration: {},
      flags: {
        'dnd5e': {
          type: item.type,
          rider: itemId
        },
        'brancalonia-bigat': {
          autoApplied: true
        }
      }
    }));

    // Crea gli effetti
    await item.createEmbeddedDocuments('ActiveEffect', effectsData);
    console.log(`✅ Aggiunti ${effectsData.length} effetti a ${item.name}`);

    // Aggiorna il flag
    await item.setFlag('brancalonia-bigat', 'hasActiveEffects', true);
    return true;
  } catch (error) {
    console.error(`❌ Errore applicando effetti a ${item.name}:`, error);
    return false;
  }
}

/**
 * Applica effects a tutti i compendi Brancalonia
 */
async function applyAllBrancaloniaEffects() {
  console.log('🚀 Brancalonia: Inizializzazione Active Effects Runtime...');

  const packKeys = [
    'brancalonia-bigat.razze',
    'brancalonia-bigat.talenti',
    'brancalonia-bigat.brancalonia-features',
    'brancalonia-bigat.emeriticenze',
    'brancalonia-bigat.backgrounds',
    'brancalonia-bigat.equipaggiamento'
  ];

  let totalApplied = 0;
  let totalProcessed = 0;

  for (const packKey of packKeys) {
    const pack = game.packs.get(packKey);
    if (!pack) {
      console.log(`⚠️  Pack ${packKey} non trovato`);
      continue;
    }

    console.log(`📦 Processando ${pack.metadata.label}...`);

    // Carica tutti i documenti
    const documents = await pack.getDocuments();

    for (const doc of documents) {
      totalProcessed++;
      const applied = await applyBrancaloniaEffects(doc);
      if (applied) totalApplied++;
    }
  }

  console.log(`✨ Brancalonia Active Effects: Completato!`);
  console.log(`📊 ${totalApplied} items aggiornati su ${totalProcessed} processati`);

  if (totalApplied > 0) {
    ui.notifications.info(`Brancalonia: Applicati Active Effects a ${totalApplied} items`, { permanent: false });
  }
}

// Registra setting per tracciare versione - DEVE essere prima di ready
Hooks.once('init', () => {
  game.settings.register('brancalonia-bigat', 'effectsVersion', {
    scope: 'world',
    config: false,
    type: String,
    default: '0.0.0'
  });

  console.log('📜 Brancalonia: Active Effects Runtime registrato');
});

// Hook principale - esegue solo una volta all'avvio
Hooks.once('ready', async () => {
  // Attendi che tutti i moduli siano caricati
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Controlla se è la prima volta o se serve un aggiornamento
  const lastVersion = game.settings.get('brancalonia-bigat', 'effectsVersion') || '0.0.0';
  const currentVersion = '3.14.0';

  if (lastVersion !== currentVersion) {
    console.log(`📝 Brancalonia: Aggiornamento Active Effects da v${lastVersion} a v${currentVersion}`);
    await applyAllBrancaloniaEffects();
    await game.settings.set('brancalonia-bigat', 'effectsVersion', currentVersion);
  }
});

// Hook per nuovi item creati/importati
Hooks.on('createItem', async (item, options, userId) => {
  // Solo per item Brancalonia
  if (!item.flags?.['brancalonia-bigat']) return;
  if (item.effects?.size > 0) return;

  await applyBrancaloniaEffects(item);
});

/**
 * CSS per miglioramenti UI
 */
Hooks.once('ready', () => {
  const style = document.createElement('style');
  style.innerHTML = `
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

    .brancalonia-effects-info {
      background: #E8F5E8;
      border: 1px solid #4CAF50;
      padding: 8px;
      margin: 10px 0;
      border-radius: 4px;
      color: #2E7D32;
    }
  `;
  document.head.appendChild(style);
});