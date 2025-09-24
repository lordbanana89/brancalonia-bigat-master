/**
 * Fix per i tooltip degli oggetti Brancalonia
 * Risolve l'errore "Cannot read properties of null (reading 'richTooltip')"
 */

// Hook per intercettare e fixare i tooltip degli oggetti Brancalonia
Hooks.once('ready', () => {
  console.log('🛠️ Brancalonia - Fix Tooltip Attivato');
});

// Sovrascrivi il comportamento dei tooltip per gli oggetti Brancalonia
Hooks.on('renderCompendiumDirectory', (app, html, data) => {
  // Aggiungi gestione tooltip personalizzata per i compendi Brancalonia
  const brancaloniaCompendiums = [
    'brancalonia-bigat.equipaggiamento',
    'brancalonia-bigat.talenti',
    'brancalonia-bigat.incantesimi',
    'brancalonia-bigat.regole'
  ];

  // Hook per gestire i link UUID nei journal
  if (game.system.id === 'dnd5e') {
    const originalEnrichHTML = TextEditor.enrichHTML;

    TextEditor.enrichHTML = function(content, options = {}) {
      // Prima applica l'enrichHTML originale
      let enriched = originalEnrichHTML.call(this, content, options);

      // Poi aggiungi data-tooltip per i link Brancalonia
      enriched = enriched.replace(
        /data-uuid="Compendium\.(brancalonia-bigat)\.([\w-]+)\.([\w]+)"/g,
        (match, module, pack, id) => {
          return `${match} data-tooltip="Compendium.${module}.${pack}.${id}"`;
        }
      );

      return enriched;
    };
  }
});

// Fix specifico per il sistema dnd5e Tooltips
Hooks.on('dnd5eRenderTooltip', (tooltip, html, data) => {
  // Se è un oggetto Brancalonia senza richTooltip, aggiungi i dati base
  if (data?.uuid?.includes('brancalonia-bigat') && !data.richTooltip) {
    data.richTooltip = {
      content: data.description?.value || data.name || 'Oggetto di Brancalonia',
      flavor: data.type || 'Item'
    };
  }
});

// Patch per prevenire l'errore quando richTooltip è null
Hooks.once('init', () => {
  // Intercetta e gestisci l'errore dei tooltip
  if (game.system.id === 'dnd5e') {
    libWrapper?.register('brancalonia-bigat', 'CONFIG.DND5E.tooltips._onHoverContentLink', function (wrapped, ...args) {
      try {
        // Prova ad eseguire la funzione originale
        return wrapped(...args);
      } catch (error) {
        // Se c'è un errore relativo a richTooltip, gestiscilo silenziosamente
        if (error.message?.includes('richTooltip')) {
          console.warn('Tooltip non disponibile per questo oggetto Brancalonia');
          return;
        }
        // Altrimenti rilancia l'errore
        throw error;
      }
    }, 'WRAPPER');
  }
});

// Fallback se libWrapper non è disponibile
if (!window.libWrapper) {
  Hooks.once('ready', () => {
    // Aggiungi gestione errori base per i tooltip
    document.addEventListener('mouseover', (event) => {
      const link = event.target.closest('a[data-uuid]');
      if (link?.dataset?.uuid?.includes('brancalonia-bigat')) {
        // Previeni l'errore aggiungendo un tooltip placeholder
        if (!link.dataset.tooltip) {
          link.dataset.tooltip = link.dataset.uuid;
        }
      }
    }, true);
  });
}

// Hook per aggiungere tooltip ai documenti renderizzati
Hooks.on('renderJournalSheet', (app, html, data) => {
  // Trova tutti i link UUID nel contenuto
  html.find('a[data-uuid*="brancalonia-bigat"]').each((i, el) => {
    const link = $(el);
    const uuid = link.attr('data-uuid');

    // Aggiungi attributi per tooltip se mancanti
    if (!link.attr('data-tooltip')) {
      link.attr('data-tooltip', uuid);
      link.attr('data-tooltip-class', 'brancalonia-item');

      // Aggiungi un tooltip al hover
      link.on('mouseenter', async function(event) {
        event.preventDefault();
        event.stopPropagation();

        try {
          const doc = await fromUuid(uuid);
          if (doc) {
            // Mostra un tooltip semplice con il nome e la descrizione
            const tooltipContent = `
              <div class="brancalonia-tooltip">
                <h4>${doc.name}</h4>
                ${doc.system?.description?.value ?
                  `<div class="description">${doc.system.description.value.substring(0, 200)}...</div>` :
                  ''}
              </div>
            `;

            // Usa il sistema di tooltip di Foundry se disponibile
            if (game.tooltip) {
              game.tooltip.activate(event.currentTarget, {
                content: tooltipContent,
                cssClass: 'brancalonia-tooltip-wrapper'
              });
            }
          }
        } catch (error) {
          console.warn('Impossibile caricare tooltip per:', uuid);
        }
      });
    }
  });
});

// Aggiungi CSS per i tooltip Brancalonia
Hooks.once('ready', () => {
  if (!document.querySelector('#brancalonia-tooltip-styles')) {
    const style = document.createElement('style');
    style.id = 'brancalonia-tooltip-styles';
    style.textContent = `
      .brancalonia-tooltip-wrapper {
        max-width: 400px;
      }

      .brancalonia-tooltip {
        padding: 8px;
        background: #f4e8d0;
        border: 1px solid #8b4513;
        border-radius: 4px;
        font-family: 'Cinzel', serif;
      }

      .brancalonia-tooltip h4 {
        margin: 0 0 5px 0;
        color: #8b4513;
        font-size: 1.1em;
      }

      .brancalonia-tooltip .description {
        font-size: 0.9em;
        color: #2c1810;
        line-height: 1.3;
      }

      /* Fix per prevenire errori di tooltip */
      a[data-uuid*="brancalonia-bigat"] {
        position: relative;
      }

      a[data-uuid*="brancalonia-bigat"]:hover::after {
        content: attr(data-tooltip-fallback);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s;
      }

      a[data-uuid*="brancalonia-bigat"]:hover::after {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
});