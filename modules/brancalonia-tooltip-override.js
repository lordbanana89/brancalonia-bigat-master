/**
 * Override diretto del metodo problematico in Tooltips5e
 * Previene l'errore "Cannot read properties of null (reading 'richTooltip')"
 */

console.log('⚡ Brancalonia - Override Tooltip Sistema');

// Aspetta che il sistema dnd5e sia pronto
Hooks.once('ready', () => {
  // Trova la classe Tooltips5e in vari modi possibili
  let Tooltips5e = null;

  // Prova prima dal game object
  if (game.dnd5e?.tooltips?.constructor) {
    Tooltips5e = game.dnd5e.tooltips.constructor;
  }
  // Prova dal CONFIG
  else if (CONFIG.DND5E?.tooltips?.constructor) {
    Tooltips5e = CONFIG.DND5E.tooltips.constructor;
  }
  // Prova dal window
  else if (window.dnd5e?.tooltips?.Tooltips5e) {
    Tooltips5e = window.dnd5e.tooltips.Tooltips5e;
  }

  if (!Tooltips5e) {
    console.warn('⚠️ Non riesco a trovare Tooltips5e class');
    return;
  }

  console.log('✅ Trovata classe Tooltips5e, patching...');

  // Salva il metodo originale
  const original_onHoverContentLink = Tooltips5e.prototype._onHoverContentLink;

  // Override con versione sicura
  Tooltips5e.prototype._onHoverContentLink = async function(event) {
    try {
      // Ottieni il link e UUID
      const link = event.currentTarget;
      const uuid = link?.dataset?.uuid;

      // Log per debug
      if (uuid?.includes('brancalonia-bigat')) {
        console.log(`🔍 Tooltip per: ${uuid}`);
      }

      // Carica il documento
      let doc = null;
      try {
        doc = await fromUuid(uuid);
      } catch (e) {
        console.warn('Errore caricamento documento:', e);
        return;
      }

      // Se non trova il documento, esci
      if (!doc) {
        console.warn('Documento non trovato:', uuid);
        return;
      }

      // FIX CRITICO: Assicurati che la struttura esista
      if (doc.system) {
        // Se description è null o undefined, creala
        if (!doc.system.description || doc.system.description === null) {
          console.warn(`🔧 FIX: ${doc.name} aveva description null/undefined`);
          doc.system.description = {
            value: doc.name || '',
            chat: '',
            unidentified: ''
          };
        }

        // Se non ha richTooltip, aggiungilo
        if (!doc.system.description.richTooltip) {
          console.warn(`🔧 FIX: Aggiungo richTooltip a ${doc.name}`);

          // Crea contenuto tooltip dal value esistente o usa default
          let content = '';
          if (doc.system.description.value) {
            // Prendi solo testo, rimuovi HTML
            content = doc.system.description.value
              .replace(/<[^>]*>/g, '')
              .substring(0, 200);
          } else {
            content = doc.name || 'Oggetto di Brancalonia';
          }

          doc.system.description.richTooltip = {
            content: `<p>${content}</p>`,
            flavor: ''
          };
        }
      }

      // Ora chiama il metodo originale con il documento fixato
      return await original_onHoverContentLink.call(this, event);

    } catch (error) {
      // Se c'è ancora un errore, loggalo ma non crashare
      console.error('Errore nel tooltip:', error);

      // Se l'errore è il solito richTooltip, mostra un tooltip di fallback
      if (error.message?.includes('richTooltip')) {
        const link = event.currentTarget;
        const uuid = link?.dataset?.uuid;

        // Prova a mostrare almeno il nome
        try {
          const doc = await fromUuid(uuid);
          if (doc) {
            // Usa il sistema tooltip di Foundry direttamente
            game.tooltip.activate(link, {
              content: `<div class="item-tooltip"><strong>${doc.name}</strong><br>${doc.type || 'Item'}</div>`,
              direction: 'UP'
            });
          }
        } catch (e) {
          console.warn('Anche il fallback ha fallito:', e);
        }
      }

      // Non propagare l'errore
      return;
    }
  };

  console.log('✅ Tooltips5e patchato con successo!');
});

// Anche un fix preventivo su tutti i documenti caricati
Hooks.on('preCreateDocument', (doc, data, options, userId) => {
  if (doc.pack?.includes('brancalonia-bigat')) {
    // Assicurati che la struttura esista nei nuovi documenti
    if (!data.system) data.system = {};
    if (!data.system.description) {
      data.system.description = {
        value: '',
        chat: '',
        unidentified: '',
        richTooltip: {
          content: `<p>${data.name || 'Nuovo oggetto'}</p>`,
          flavor: ''
        }
      };
    }
  }
});

console.log('⚡ Override Tooltip Caricato');