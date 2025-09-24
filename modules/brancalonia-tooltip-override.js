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

  // Override con versione sicura - NOTA: il parametro è doc, non event!
  Tooltips5e.prototype._onHoverContentLink = async function(doc) {
    try {
      // Se non c'è documento, esci silenziosamente
      if (!doc) {
        // Non loggare - succede normalmente quando si muove il mouse fuori dal link
        return;
      }

      // Log per debug documenti Brancalonia
      if (doc.uuid?.includes('brancalonia-bigat') || doc.pack?.includes('brancalonia-bigat')) {
        console.log(`🔍 Tooltip per: ${doc.name} (${doc.uuid})`);
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
      return await original_onHoverContentLink.call(this, doc);

    } catch (error) {
      // Se c'è ancora un errore, loggalo ma non crashare
      console.error('Errore nel tooltip:', error);

      // Se l'errore è il solito richTooltip, usa il documento che abbiamo
      if (error.message?.includes('richTooltip') && doc) {
        console.warn(`Tooltip fallback per ${doc.name}`);

        // Crea un contenuto tooltip di base
        const fallbackContent = `
          <div class="item-tooltip">
            <strong>${doc.name}</strong>
            <div class="item-type">${doc.type || 'Item'}</div>
            ${doc.system?.description?.value ?
              `<div class="item-desc">${doc.system.description.value.substring(0, 100)}...</div>` :
              ''}
          </div>
        `;

        // Prova a mostrare il tooltip usando il metodo interno
        if (this.tooltip) {
          this.tooltip.innerHTML = fallbackContent;
          this.tooltip.classList.remove('theme-dark');
          // Il tooltip dovrebbe già essere posizionato
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