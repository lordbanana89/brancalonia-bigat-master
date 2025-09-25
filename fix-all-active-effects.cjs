/**
 * Sistema completo per aggiungere Active Effects reali a tutti i compendi
 * Compatibile con D&D 5e v5.1.9 e Foundry v13
 */

const fs = require('fs');
const path = require('path');

// ========================================
// CONFIGURAZIONI EFFETTI PER OGNI TIPO
// ========================================

// Mappatura effetti per le RAZZE
const RACE_EFFECTS = {
  'morgante001': [
    {
      name: 'Robusto come un Tronco',
      changes: [
        {
          key: 'system.attributes.hp.bonuses.level',
          mode: 2, // ADD
          value: '1',
          priority: 20
        },
        {
          key: 'system.attributes.hp.bonuses.overall',
          mode: 2, // ADD
          value: '1',
          priority: 20
        }
      ]
    },
    {
      name: 'Stomaco d\'Acciaio',
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
      changes: [
        {
          key: 'system.traits.dr.value',
          mode: 2, // ADD
          value: 'fire',
          priority: 20
        }
      ]
    }
  ],

  'marionetta001': [
    {
      name: 'Costrutto',
      changes: [
        {
          key: 'system.traits.di.value',
          mode: 2, // ADD
          value: 'poison',
          priority: 20
        },
        {
          key: 'system.traits.ci.value',
          mode: 2, // ADD
          value: 'poisoned',
          priority: 20
        },
        {
          key: 'system.traits.ci.value',
          mode: 2, // ADD
          value: 'exhaustion',
          priority: 20
        }
      ]
    }
  ],

  'selvatico001': [
    {
      name: 'Istinto Selvaggio',
      changes: [
        {
          key: 'system.skills.sur.bonuses.check',
          mode: 2, // ADD
          value: '2',
          priority: 20
        }
      ]
    }
  ],

  'dotato001': [
    {
      name: 'Dote Magica',
      changes: [
        {
          key: 'system.bonuses.spell.dc',
          mode: 2, // ADD
          value: '1',
          priority: 20
        }
      ]
    }
  ]
};

// Mappatura effetti per i TALENTI
const FEAT_EFFECTS = {
  'talent_supercazzola': [
    {
      name: 'Dadi Supercazzola',
      changes: [
        {
          key: 'flags.brancalonia-bigat.supercazzolaDice',
          mode: 5, // OVERRIDE
          value: '2d4',
          priority: 20
        }
      ]
    }
  ],

  'talent_fortuna_bifolco': [
    {
      name: 'Fortuna del Bifolco',
      changes: [
        {
          key: 'flags.dnd5e.initiativeAdv',
          mode: 5, // OVERRIDE
          value: 'true',
          priority: 20
        }
      ]
    }
  ],

  'talent_lingua_sciolta': [
    {
      name: 'Lingua Sciolta',
      changes: [
        {
          key: 'system.skills.dec.bonuses.check',
          mode: 2, // ADD
          value: '2',
          priority: 20
        },
        {
          key: 'system.skills.per.bonuses.check',
          mode: 2, // ADD
          value: '2',
          priority: 20
        }
      ]
    }
  ],

  'talent_attaccabrighe': [
    {
      name: 'Attaccabrighe',
      changes: [
        {
          key: 'system.bonuses.mwak.attack',
          mode: 2, // ADD
          value: '1',
          priority: 20
        }
      ]
    }
  ],

  'talent_cialtroneria': [
    {
      name: 'Cialtroneria',
      changes: [
        {
          key: 'system.skills.slt.bonuses.check',
          mode: 2, // ADD
          value: '@prof',
          priority: 20
        }
      ]
    }
  ]
};

// Mappatura effetti per i BACKGROUND
const BACKGROUND_EFFECTS = {
  'ambulante001': [
    {
      name: 'Competenze Ambulante',
      changes: [
        {
          key: 'system.skills.inv.value',
          mode: 5, // OVERRIDE
          value: '1',
          priority: 20
        },
        {
          key: 'system.skills.sur.value',
          mode: 5, // OVERRIDE
          value: '1',
          priority: 20
        }
      ]
    }
  ],

  'attaccabrighe001': [
    {
      name: 'Competenze Attaccabrighe',
      changes: [
        {
          key: 'system.skills.ath.value',
          mode: 5, // OVERRIDE
          value: '1',
          priority: 20
        },
        {
          key: 'system.skills.itm.value',
          mode: 5, // OVERRIDE
          value: '1',
          priority: 20
        }
      ]
    }
  ]
};

// Mappatura effetti per PRIVILEGI (brancalonia-features)
const FEATURE_EFFECTS = {
  'knave_uncanny_dodge': [
    {
      name: 'Schivata Prodigiosa',
      changes: [
        {
          key: 'flags.brancalonia-bigat.uncannyDodge',
          mode: 5, // OVERRIDE
          value: 'true',
          priority: 20
        }
      ]
    }
  ],

  'straccione_unarmored_defense': [
    {
      name: 'Difesa Senza Armatura',
      changes: [
        {
          key: 'system.attributes.ac.calc',
          mode: 5, // OVERRIDE
          value: 'custom',
          priority: 20
        },
        {
          key: 'system.attributes.ac.formula',
          mode: 5, // OVERRIDE
          value: '10 + @abilities.dex.mod + @abilities.con.mod',
          priority: 20
        }
      ]
    }
  ],

  'straccione_hardy': [
    {
      name: 'Robusto',
      changes: [
        {
          key: 'system.traits.dr.value',
          mode: 2, // ADD
          value: 'bludgeoning',
          priority: 20
        }
      ]
    }
  ]
};

// Mappatura effetti per EQUIPAGGIAMENTO
const EQUIPMENT_EFFECTS = {
  'armatura_cuoio_rappezzata': [
    {
      name: 'Armatura Scadente',
      changes: [
        {
          key: 'system.attributes.ac.value',
          mode: 2, // ADD
          value: '-1',
          priority: 10
        }
      ]
    }
  ],

  'amuleto_san_pancrazio': [
    {
      name: 'Protezione di San Pancrazio',
      changes: [
        {
          key: 'system.bonuses.abilities.save',
          mode: 2, // ADD
          value: '1',
          priority: 20
        }
      ]
    }
  ]
};

// ========================================
// FUNZIONI DI SUPPORTO
// ========================================

function getEffectsForItem(itemId, itemType, itemName) {
  // Cerca gli effetti appropriati in base al tipo e ID
  let effects = [];

  if (itemType === 'race') {
    effects = RACE_EFFECTS[itemId] || [];
  } else if (itemType === 'feat') {
    if (itemId.startsWith('talent_')) {
      effects = FEAT_EFFECTS[itemId] || [];
    } else if (itemId.startsWith('emeriticenza_')) {
      // Le emeriticenze sono già state fixate
      return null;
    } else {
      effects = FEATURE_EFFECTS[itemId] || [];
    }
  } else if (itemType === 'background') {
    effects = BACKGROUND_EFFECTS[itemId] || [];
  } else if (itemType === 'equipment' || itemType === 'weapon' || itemType === 'consumable' || itemType === 'loot') {
    effects = EQUIPMENT_EFFECTS[itemId] || [];
  } else if (itemType === 'subclass') {
    // Le sottoclassi usano advancement, non effects
    return null;
  }

  // Se non abbiamo effetti specifici, prova a dedurli dal nome
  if (effects.length === 0) {
    effects = deduceEffectsFromName(itemName, itemType);
  }

  return effects;
}

function deduceEffectsFromName(name, type) {
  const effects = [];
  const nameLower = name.toLowerCase();

  // Deduzione basata su parole chiave
  if (nameLower.includes('forza')) {
    effects.push({
      name: 'Bonus Forza',
      changes: [{
        key: 'system.abilities.str.bonuses.check',
        mode: 2,
        value: '2',
        priority: 20
      }]
    });
  }

  if (nameLower.includes('velocit')) {
    effects.push({
      name: 'Bonus Velocità',
      changes: [{
        key: 'system.attributes.movement.walk',
        mode: 2,
        value: '10',
        priority: 20
      }]
    });
  }

  if (nameLower.includes('resistenza')) {
    effects.push({
      name: 'Resistenza',
      changes: [{
        key: 'system.traits.dr.custom',
        mode: 5,
        value: 'Danni non magici',
        priority: 20
      }]
    });
  }

  if (nameLower.includes('competenza') && type === 'feat') {
    effects.push({
      name: 'Competenza Extra',
      changes: [{
        key: 'system.bonuses.abilities.skill',
        mode: 2,
        value: '1',
        priority: 20
      }]
    });
  }

  return effects;
}

// ========================================
// PROCESSO PRINCIPALE
// ========================================

function processFile(filePath, packName) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Skip se già ha effetti attivi
    if (data.effects && data.effects.some(e => e.changes && e.changes.length > 0)) {
      return { skipped: true, reason: 'già con effetti' };
    }

    // Ottieni gli effetti appropriati
    const effects = getEffectsForItem(data._id, data.type, data.name);

    if (!effects) {
      return { skipped: true, reason: 'tipo non supportato' };
    }

    if (effects.length === 0) {
      return { skipped: true, reason: 'nessun effetto definito' };
    }

    // Aggiorna system version
    data._stats = data._stats || {};
    data._stats.systemVersion = '5.1.9';

    // Aggiungi gli effetti
    data.effects = effects.map((effect, index) => ({
      _id: `${data._id}_effect${index + 1}`,
      name: effect.name,
      icon: data.img || 'icons/svg/aura.svg',
      changes: effect.changes || [],
      duration: {},
      disabled: false,
      transfer: true,
      flags: {
        'dnd5e': {
          type: data.type,
          rider: data._id
        }
      }
    }));

    // Aggiungi flags
    data.flags = data.flags || {};
    data.flags['brancalonia-bigat'] = {
      ...data.flags['brancalonia-bigat'],
      hasActiveEffects: true
    };

    // Salva il file aggiornato
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');

    return {
      success: true,
      effectsAdded: effects.length
    };
  } catch (e) {
    return {
      error: true,
      message: e.message
    };
  }
}

// ========================================
// ESECUZIONE
// ========================================

console.log('🔧 AGGIORNAMENTO ACTIVE EFFECTS PER TUTTI I COMPENDI\n');
console.log('=' .repeat(60));

const compendi = [
  'razze',
  'talenti',
  'backgrounds',
  'brancalonia-features',
  'equipaggiamento',
  'sottoclassi'
];

const stats = {
  totalProcessed: 0,
  successfulUpdates: 0,
  skipped: 0,
  errors: 0
};

for (const packName of compendi) {
  const sourcePath = path.join('./packs', packName, '_source');

  if (!fs.existsSync(sourcePath)) {
    console.log(`❌ ${packName}: directory non trovata`);
    continue;
  }

  const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));
  let packStats = {
    updated: 0,
    skipped: 0,
    errors: 0
  };

  console.log(`\n📦 Processando ${packName} (${files.length} file)...`);

  for (const file of files) {
    const result = processFile(path.join(sourcePath, file), packName);

    if (result.success) {
      packStats.updated++;
      console.log(`   ✅ ${file}: ${result.effectsAdded} effetti aggiunti`);
    } else if (result.skipped) {
      packStats.skipped++;
      // Non mostrare skip per ridurre output
    } else if (result.error) {
      packStats.errors++;
      console.log(`   ❌ ${file}: ${result.message}`);
    }
  }

  console.log(`   📊 Risultati: ${packStats.updated} aggiornati, ${packStats.skipped} saltati, ${packStats.errors} errori`);

  stats.totalProcessed += files.length;
  stats.successfulUpdates += packStats.updated;
  stats.skipped += packStats.skipped;
  stats.errors += packStats.errors;
}

console.log('\n' + '=' .repeat(60));
console.log('📊 RIEPILOGO FINALE\n');
console.log(`📦 File totali processati: ${stats.totalProcessed}`);
console.log(`✅ Aggiornamenti riusciti: ${stats.successfulUpdates}`);
console.log(`⏭️  File saltati: ${stats.skipped}`);
console.log(`❌ Errori: ${stats.errors}`);

console.log('\n✨ COMPLETATO!');
console.log('\n📝 Prossimi passi:');
console.log('1. Ricompilare tutti i database con: npm run build');
console.log('2. Testare in Foundry VTT');
console.log('3. Verificare che gli effetti si applichino correttamente ai personaggi');