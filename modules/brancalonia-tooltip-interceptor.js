/**
 * Intercettore aggressivo per risolvere definitivamente l'errore richTooltip
 * Patcha il sistema dnd5e PRIMA che possa generare errori
 */

// Intercetta immediatamente al caricamento
Hooks.once('init', () => {
  console.log('⚡ Brancalonia - Intercettore Tooltip Attivo');

  // Override del metodo fromUuid per aggiungere richTooltip agli oggetti Brancalonia
  const originalFromUuid = globalThis.fromUuid;
  globalThis.fromUuid = async function(uuid, options) {
    const doc = await originalFromUuid.call(this, uuid, options);

    // Se è un documento Brancalonia, assicurati che abbia richTooltip
    if (doc && uuid?.includes('brancalonia-bigat')) {
      if (doc.system?.description && !doc.system.description.richTooltip) {
        // Crea un richTooltip valido
        doc.system.description.richTooltip = {
          content: doc.system.description.value || `<p>${doc.name}</p>`,
          flavor: ''
        };

        // Aggiungi anche una versione cache per evitare riprocessamenti
        doc._brancaloniaTooltipPatched = true;
      }
    }

    return doc;
  };
});

// Patch più aggressivo dopo che dnd5e è caricato
Hooks.once('dnd5e.ready', () => {
  console.log('🔨 Brancalonia - Patchando sistema tooltip dnd5e');

  // Trova la classe Tooltips5e
  const Tooltips5e = CONFIG.DND5E?.tooltips?.constructor ||
                     game.dnd5e?.tooltips?.constructor ||
                     window.dnd5e?.tooltips?.Tooltips5e;

  if (Tooltips5e) {
    // Salva il metodo originale
    const original_onHoverContentLink = Tooltips5e.prototype._onHoverContentLink;

    // Sovrascrivi con versione patchata
    Tooltips5e.prototype._onHoverContentLink = async function(event) {
      const link = event?.currentTarget;
      if (!link) return;

      const uuid = link.dataset?.uuid;
      if (!uuid) return;

      // Per oggetti Brancalonia, usa un approccio completamente custom
      if (uuid.includes('brancalonia-bigat')) {
        event.stopPropagation();

        try {
          const doc = await fromUuid(uuid);
          if (!doc) return;

          // Crea un tooltip custom per Brancalonia
          const content = await createBrancaloniaTooltip(doc);

          // Usa il sistema di tooltip di Foundry
          game.tooltip.activate(link, {
            content: content,
            cssClass: "dnd5e-tooltip item-tooltip brancalonia-tooltip",
            direction: link.dataset.tooltipDirection || "UP"
          });

          return; // Non chiamare il metodo originale
        } catch (err) {
          console.warn('Tooltip Brancalonia fallito, usando fallback:', err);
        }
      }

      // Per altri oggetti, usa il metodo originale con protezione
      try {
        return await original_onHoverContentLink.call(this, event);
      } catch (error) {
        // Se l'errore è relativo a richTooltip, gestiscilo silenziosamente
        if (error.message?.includes('richTooltip')) {
          console.debug('Tooltip non disponibile, ignorato');
          return;
        }
        // Altri errori vengono propagati
        throw error;
      }
    };

    console.log('✅ Sistema tooltip dnd5e patchato con successo');
  }
});

// Funzione per creare tooltip Brancalonia
async function createBrancaloniaTooltip(doc) {
  let html = `<div class="item-tooltip">`;

  // Header
  html += `<header class="item-header">`;
  if (doc.img) {
    html += `<img src="${doc.img}" alt="${doc.name}">`;
  }
  html += `<h4>${doc.name}</h4>`;
  html += `</header>`;

  // Contenuto
  html += `<section class="item-properties">`;

  // Tipo
  if (doc.type) {
    const typeLabel = CONFIG.Item?.typeLabels?.[doc.type] || doc.type;
    html += `<span class="item-type">${typeLabel}</span>`;
  }

  // Rarità
  if (doc.system?.rarity && doc.system.rarity !== 'common') {
    html += `<span class="item-rarity ${doc.system.rarity}">${doc.system.rarity}</span>`;
  }

  html += `</section>`;

  // Statistiche per armi
  if (doc.type === 'weapon' && doc.system) {
    html += `<section class="item-stats">`;

    if (doc.system.damage?.parts?.[0]) {
      const [formula, type] = doc.system.damage.parts[0];
      html += `<div><strong>Danno:</strong> ${formula} ${type || ''}</div>`;
    }

    if (doc.system.range?.value || doc.system.range?.long) {
      html += `<div><strong>Gittata:</strong> ${doc.system.range.value || '-'}/${doc.system.range.long || '-'}</div>`;
    }

    html += `</section>`;
  }

  // Descrizione breve
  if (doc.system?.description?.value) {
    const desc = doc.system.description.value
      .replace(/<[^>]*>/g, '')
      .substring(0, 150);
    html += `<section class="item-description">${desc}${desc.length >= 150 ? '...' : ''}</section>`;
  }

  html += `</div>`;

  return html;
}

// Aggiungi stili CSS
Hooks.once('ready', () => {
  const style = document.createElement('style');
  style.textContent = `
    .brancalonia-tooltip .item-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-bottom: 1px solid var(--color-border-light);
      padding-bottom: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .brancalonia-tooltip .item-header img {
      width: 36px;
      height: 36px;
      border: none;
    }

    .brancalonia-tooltip .item-header h4 {
      margin: 0;
      font-size: var(--font-size-14);
    }

    .brancalonia-tooltip .item-properties {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .brancalonia-tooltip .item-properties span {
      padding: 0.125rem 0.5rem;
      background: var(--color-bg-option);
      border-radius: 3px;
      font-size: var(--font-size-11);
    }

    .brancalonia-tooltip .item-rarity.uncommon {
      background: #1eff00;
      color: black;
    }

    .brancalonia-tooltip .item-rarity.rare {
      background: #0070dd;
      color: white;
    }

    .brancalonia-tooltip .item-rarity.veryrare {
      background: #a335ee;
      color: white;
    }

    .brancalonia-tooltip .item-rarity.legendary {
      background: #ff8000;
      color: white;
    }

    .brancalonia-tooltip .item-stats {
      margin-bottom: 0.5rem;
      font-size: var(--font-size-12);
    }

    .brancalonia-tooltip .item-stats div {
      margin-bottom: 0.25rem;
    }

    .brancalonia-tooltip .item-description {
      font-size: var(--font-size-11);
      font-style: italic;
      color: var(--color-text-dark-secondary);
    }
  `;
  document.head.appendChild(style);
});

console.log('🛡️ Brancalonia - Intercettore Tooltip Caricato');