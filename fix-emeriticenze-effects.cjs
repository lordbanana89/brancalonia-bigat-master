/**
 * Script per aggiungere Active Effects funzionanti alle Emeriticenze
 * Compatibile con D&D 5e v5.1.9 e Foundry v13
 */

const fs = require('fs');
const path = require('path');

const EMERITICENZE_PATH = './packs/emeriticenze/_source';

// Mappatura degli effetti per ogni emeriticenza
const EFFECTS_MAP = {
  'emeriticenza_affinamento': {
    description: 'Configurare manualmente: +1 o +2 alle caratteristiche scelte',
    effects: [{
      name: 'Affinamento - Bonus Caratteristica',
      changes: [],
      notes: 'Aggiungere manualmente changes per le caratteristiche scelte'
    }]
  },

  'emeriticenza_arma_preferita': {
    description: 'Aggiungi bonus competenza ai danni con arma scelta',
    effects: [{
      name: 'Arma Preferita - Bonus Danni',
      changes: [{
        key: 'system.bonuses.mwak.damage',
        mode: 2, // ADD
        value: '@prof',
        priority: 20
      }]
    }],
    requirements: 'Solo Barbari, Guerrieri, Paladini e Ranger'
  },

  'emeriticenza_assoluta': {
    description: 'Bonus competenza diventa +4',
    effects: [{
      name: 'Emeriticenza Assoluta - Competenza +4',
      changes: [{
        key: 'system.attributes.prof',
        mode: 5, // OVERRIDE
        value: '4',
        priority: 30
      }]
    }],
    requirements: 'Richiede 2 altre emeriticenze'
  },

  'emeriticenza_energumeno': {
    description: 'PF massimi +6 + mod Costituzione',
    effects: [{
      name: 'Energumeno - Bonus PF',
      changes: [{
        key: 'system.attributes.hp.bonuses.overall',
        mode: 2, // ADD
        value: '6 + @abilities.con.mod',
        priority: 20
      }]
    }]
  },

  'emeriticenza_fandonia_migliorata': {
    description: 'Slot incantesimo aggiuntivo',
    effects: [{
      name: 'Fandonia Migliorata - Slot Extra',
      changes: [],
      notes: 'Gestito dal modulo level-cap.js'
    }]
  },

  'emeriticenza_fandonia_potenziata': {
    description: 'Upcast gratuito 1/riposo breve',
    uses: {
      max: '1',
      per: 'sr'
    },
    effects: []
  },

  'emeriticenza_gioco_squadra': {
    description: 'Azione Aiuto come azione bonus',
    effects: [{
      name: 'Gioco di Squadra',
      changes: [],
      notes: 'Richiede gestione manuale o macro'
    }]
  },

  'emeriticenza_indomito': {
    description: 'Immune alla condizione spaventato',
    effects: [{
      name: 'Indomito - Immune Spaventato',
      changes: [{
        key: 'system.traits.ci.value',
        mode: 2, // ADD
        value: 'frightened',
        priority: 20
      }]
    }]
  },

  'emeriticenza_recupero_migliorato': {
    description: 'Recupero privilegi con riposo breve',
    effects: [],
    notes: 'Gestito dal modulo rest-system.js'
  },

  'emeriticenza_rissaiolo_professionista': {
    description: 'Slot mossa aggiuntivo per risse',
    effects: [{
      name: 'Rissaiolo - Slot Mossa Extra',
      changes: [{
        key: 'flags.brancalonia-bigat.slotMossa',
        mode: 2, // ADD
        value: '1',
        priority: 20
      }]
    }]
  },

  'emeriticenza_santa_fortuna': {
    description: '1d8 a qualsiasi tiro, 1/riposo breve',
    uses: {
      max: '1',
      per: 'sr'
    },
    effects: [{
      name: 'Santa Fortuna',
      changes: [],
      notes: 'Utilizzare come reazione, aggiungere 1d8 al tiro'
    }]
  },

  'emeriticenza_dono_talento': {
    description: 'Ottieni un talento',
    effects: [],
    notes: 'Scegliere manualmente un talento dal compendio'
  }
};

function fixEmeriticenza(filename) {
  const filePath = path.join(EMERITICENZE_PATH, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File non trovato: ${filename}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const baseName = filename.replace('.json', '');
  const config = EFFECTS_MAP[baseName];

  if (!config) {
    console.log(`❓ Nessuna configurazione per: ${baseName}`);
    return;
  }

  // Aggiorna sistema versione
  data._stats = data._stats || {};
  data._stats.systemVersion = '5.1.9';

  // Aggiungi uses se configurato
  if (config.uses) {
    data.system.uses = {
      value: config.uses.max,
      max: config.uses.max,
      per: config.uses.per,
      recovery: ''
    };
  }

  // Aggiungi requirements se configurato
  if (config.requirements) {
    data.system.requirements = config.requirements;
  }

  // Aggiungi effects
  if (config.effects && config.effects.length > 0) {
    data.effects = config.effects.map((effect, index) => ({
      _id: `${baseName}_effect${index + 1}`,
      name: effect.name,
      icon: data.img,
      changes: effect.changes || [],
      duration: {},
      disabled: false,
      transfer: true,
      flags: {
        'dnd5e': {
          type: 'feat',
          rider: baseName
        }
      },
      description: effect.notes || ''
    }));
  } else {
    data.effects = [];
  }

  // Aggiungi flags
  data.flags = data.flags || {};
  data.flags['brancalonia-bigat'] = {
    emeriticenza: true,
    ...data.flags['brancalonia-bigat']
  };

  // Salva il file aggiornato
  const newPath = filePath.replace('.json', '_fixed.json');
  fs.writeFileSync(newPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`✅ Aggiornato: ${baseName}`);
}

// Processa tutte le emeriticenze
console.log('🔧 Aggiornamento Emeriticenze con Active Effects\n');

for (const filename of fs.readdirSync(EMERITICENZE_PATH)) {
  if (filename.endsWith('.json') && !filename.includes('_fixed')) {
    fixEmeriticenza(filename);
  }
}

console.log('\n✨ Completato! Ora le emeriticenze hanno Active Effects funzionanti.');
console.log('📝 Nota: Alcune emeriticenze richiedono configurazione manuale:');
console.log('   - Affinamento: scegliere quali caratteristiche aumentare');
console.log('   - Arma Preferita: specificare l\'arma scelta');
console.log('   - Dono del Talento: scegliere il talento dal compendio');