/**
 * Debug e fix per il problema richTooltip
 * Identifica esattamente cosa è null e lo corregge
 */

console.log('🔍 Brancalonia - Debug Tooltip Attivo');

// Hook per intercettare quando i documenti vengono caricati
Hooks.on('preGetCompendiumDocument', (pack, id) => {
  if (pack.metadata.id?.includes('brancalonia')) {
    console.log(`📦 Caricamento documento da ${pack.metadata.id}: ${id}`);
  }
});

Hooks.on('getCompendiumDocument', (doc) => {
  if (!doc) return;

  // Solo per documenti Brancalonia
  if (doc.pack?.includes('brancalonia-bigat')) {
    console.log(`📄 Documento caricato: ${doc.name}`, doc);

    // Verifica la struttura
    if (!doc.system) {
      console.warn(`⚠️ ${doc.name}: manca system`);
      doc.system = {};
    }

    if (!doc.system.description) {
      console.warn(`⚠️ ${doc.name}: manca system.description`);
      doc.system.description = {
        value: '',
        chat: '',
        unidentified: ''
      };
    }

    // Il problema critico: description potrebbe essere null anche se esiste
    if (doc.system.description === null) {
      console.warn(`⚠️ ${doc.name}: system.description è NULL!`);
      doc.system.description = {
        value: doc.name || '',
        chat: '',
        unidentified: '',
        richTooltip: {
          content: `<p>${doc.name || 'Oggetto di Brancalonia'}</p>`,
          flavor: ''
        }
      };
    }

    // Assicurati che richTooltip esista
    if (doc.system.description && !doc.system.description.richTooltip) {
      console.warn(`⚠️ ${doc.name}: manca richTooltip, lo aggiungo`);
      doc.system.description.richTooltip = {
        content: doc.system.description.value || `<p>${doc.name}</p>`,
        flavor: ''
      };
    }
  }
});

// Intercetta il problema PRIMA che dnd5e lo processi
Hooks.once('ready', () => {
  // Patch il metodo fromUuid per correggere i documenti Brancalonia
  const originalFromUuid = globalThis.fromUuid;

  globalThis.fromUuid = async function(uuid, options = {}) {
    const doc = await originalFromUuid.call(this, uuid, options);

    // Se è un documento Brancalonia con problemi, correggilo
    if (doc && uuid?.includes('brancalonia-bigat')) {
      // Controlla e correggi la struttura
      if (doc.system) {
        // Il problema principale: description potrebbe essere null
        if (doc.system.description === null || doc.system.description === undefined) {
          console.warn(`🔧 Correzione: ${doc.name} aveva description null`);
          doc.system.description = {
            value: '',
            chat: '',
            unidentified: '',
            richTooltip: {
              content: `<p>${doc.name || 'Oggetto'}</p>`,
              flavor: ''
            }
          };
        }
        // Se description esiste ma non ha richTooltip
        else if (doc.system.description && !doc.system.description.richTooltip) {
          console.warn(`🔧 Correzione: ${doc.name} mancava richTooltip`);
          doc.system.description.richTooltip = {
            content: doc.system.description.value || `<p>${doc.name}</p>`,
            flavor: ''
          };
        }
      }
    }

    return doc;
  };

  console.log('✅ Patch fromUuid installato');
});

// Intercetta anche i link quando vengono processati
Hooks.on('renderApplication', (app, html) => {
  // Trova tutti i link Brancalonia
  html.find?.('a[data-uuid*="brancalonia-bigat"]').each(function() {
    const link = this;
    const uuid = link.dataset.uuid;

    // Aggiungi un listener per correggere al volo
    if (!link._brancaloniaPatched) {
      link._brancaloniaPatched = true;

      link.addEventListener('mouseenter', async (event) => {
        // Pre-carica e correggi il documento
        try {
          const doc = await fromUuid(uuid);
          if (doc && (!doc.system?.description || doc.system.description === null)) {
            console.warn(`🔧 Correzione hover per: ${doc.name}`);
            if (!doc.system) doc.system = {};
            doc.system.description = {
              value: '',
              chat: '',
              unidentified: '',
              richTooltip: {
                content: `<p>${doc.name}</p>`,
                flavor: ''
              }
            };
          }
        } catch (e) {
          console.error('Errore pre-caricamento:', e);
        }
      }, true);
    }
  });
});

// Log dettagliato quando si verifica l'errore
if (game.system.id === 'dnd5e') {
  Hooks.once('ready', () => {
    // Intercetta l'errore specifico
    const originalConsoleError = console.error;
    console.error = function(...args) {
      if (args[0]?.toString?.().includes('richTooltip')) {
        console.warn('🚨 ERRORE RICHTOOLTIP INTERCETTATO!');
        console.trace();

        // Prova a capire quale documento causa il problema
        const stack = new Error().stack;
        console.log('Stack trace:', stack);
      }
      return originalConsoleError.apply(console, args);
    };
  });
}

console.log('🔍 Debug Tooltip Configurato - Monitoraggio attivo');