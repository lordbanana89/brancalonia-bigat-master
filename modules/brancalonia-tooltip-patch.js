/**
 * Sistema completo di tooltip per oggetti Brancalonia
 * Rende i tooltip completamente funzionanti per tutti gli oggetti del modulo
 */

Hooks.once('init', () => {
  console.log('🔧 Brancalonia - Sistema Tooltip Inizializzato');

  // Registra un enricher personalizzato per i link Brancalonia
  CONFIG.TextEditor.enrichers.push({
    pattern: /@UUID\[Compendium\.brancalonia-bigat\.([\w-]+)\.([\w]+)\]\{([^}]+)\}/g,
    enricher: async (match, options) => {
      const [_, pack, id, label] = match;
      const uuid = `Compendium.brancalonia-bigat.${pack}.${id}`;

      // Crea un elemento anchor con tutti gli attributi necessari
      const a = document.createElement('a');
      a.classList.add('content-link');
      a.dataset.uuid = uuid;
      a.dataset.type = 'Compendium';
      a.dataset.pack = `brancalonia-bigat.${pack}`;
      a.dataset.id = id;
      a.dataset.tooltip = uuid;
      a.draggable = true;
      a.innerHTML = `<i class="fas fa-suitcase"></i> ${label}`;

      return a;
    }
  });
});

// Sistema di tooltip personalizzato per Brancalonia
Hooks.once('ready', () => {
  console.log('🛠️ Brancalonia - Attivando sistema tooltip');

  // Override del tooltip per i nostri oggetti
  const originalActivateListeners = TextEditor.activateListeners;

  TextEditor.activateListeners = function() {
    originalActivateListeners.call(this);

    // Aggiungi listener per i nostri link
    $(document).on('mouseenter', 'a[data-uuid*="brancalonia-bigat"]', async function(event) {
      const link = event.currentTarget;
      const uuid = link.dataset.uuid;

      if (!uuid) return;

      try {
        // Carica il documento dal compendio
        const doc = await fromUuid(uuid);

        if (!doc) {
          console.warn('Documento non trovato:', uuid);
          return;
        }

        // Crea il contenuto del tooltip
        let tooltipContent = await createEnhancedTooltip(doc);

        // Mostra il tooltip usando il sistema di Foundry
        game.tooltip.activate(link, {
          content: tooltipContent,
          cssClass: "dnd5e-tooltip item-tooltip",
          direction: "UP"
        });
      } catch (error) {
        console.error('Errore creazione tooltip Brancalonia:', error);
      }
    });
  };
});


// Hook per pre-processare i documenti Brancalonia quando vengono caricati
Hooks.on('getCompendiumDocument', (doc) => {
  // Solo per documenti Brancalonia
  if (!doc?.uuid?.includes('brancalonia-bigat')) return;

  // Aggiungi richTooltip se manca
  if (doc.system?.description && !doc.system.description.richTooltip) {
    doc.system.description.richTooltip = {
      content: doc.system.description.value || '',
      flavor: doc.type || ''
    };
  }
});

// Hook per processare i link quando vengono creati
Hooks.on('renderApplication', (app, html) => {
  // Trova tutti i link Brancalonia
  html.find('a[data-uuid*="brancalonia-bigat"]').each((i, element) => {
    const link = element;

    // Aggiungi attributi necessari
    if (!link.dataset.tooltipDirection) {
      link.dataset.tooltipDirection = 'UP';
    }

    // Aggiungi un data attribute per identificarlo come link speciale
    link.dataset.brancaloniaItem = 'true';
  });
});

// Funzione per creare tooltip migliorati
async function createEnhancedTooltip(doc) {
  if (!doc) return '';

  let content = `<div class="dnd5e-tooltip item-tooltip">`;

  // Header con icona e nome
  content += `<div class="tooltip-header">`;
  if (doc.img) {
    content += `<img src="${doc.img}" alt="${doc.name}">`;
  }
  content += `<h4>${doc.name}</h4>`;
  content += `</div>`;

  // Dettagli dell'oggetto
  content += `<div class="tooltip-details">`;

  // Tipo di oggetto
  const itemType = game.i18n.localize(`ITEM.Type${doc.type.capitalize()}`);
  content += `<div class="item-type">${itemType}</div>`;

  // Per le armi, mostra danno e proprietà
  if (doc.type === 'weapon' && doc.system) {
    if (doc.system.damage?.parts?.length > 0) {
      const damage = doc.system.damage.parts[0];
      content += `<div class="item-damage">Danno: ${damage[0]} ${damage[1]}</div>`;
    }

    if (doc.system.range) {
      const range = doc.system.range;
      if (range.value || range.long) {
        content += `<div class="item-range">Gittata: ${range.value}/${range.long} ft</div>`;
      }
    }
  }

  // Per armature, mostra CA
  if (doc.type === 'equipment' && doc.system?.armor) {
    content += `<div class="item-ac">CA: ${doc.system.armor.value}</div>`;
  }

  // Rarità
  if (doc.system?.rarity && doc.system.rarity !== 'common') {
    const rarity = doc.system.rarity;
    content += `<div class="item-rarity ${rarity}">${rarity.capitalize()}</div>`;
  }

  // Prezzo
  if (doc.system?.price?.value) {
    content += `<div class="item-price">Prezzo: ${doc.system.price.value} ${doc.system.price.denomination}</div>`;
  }

  content += `</div>`;

  // Descrizione breve
  if (doc.system?.description?.value) {
    let shortDesc = doc.system.description.value;

    // Estrai solo il primo paragrafo o i primi 150 caratteri
    const firstParagraph = shortDesc.match(/<p>([^<]+)<\/p>/);
    if (firstParagraph) {
      shortDesc = firstParagraph[1];
    } else {
      shortDesc = shortDesc.replace(/<[^>]*>/g, ''); // Rimuovi tutto l'HTML
    }

    if (shortDesc.length > 150) {
      shortDesc = shortDesc.substring(0, 150) + '...';
    }

    content += `<div class="tooltip-description">${shortDesc}</div>`;
  }

  content += `</div>`;

  return content;
}

// CSS per tooltip
Hooks.once('ready', () => {
  if (!document.querySelector('#brancalonia-tooltip-patch-styles')) {
    const style = document.createElement('style');
    style.id = 'brancalonia-tooltip-patch-styles';
    style.textContent = `
      /* Tooltip Brancalonia migliorati */
      .dnd5e-tooltip.item-tooltip {
        max-width: 350px;
        padding: 8px;
        background: rgba(0, 0, 0, 0.9);
        border: 1px solid #c9b037;
        border-radius: 4px;
        color: #fff;
      }

      .tooltip-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid #c9b037;
        margin-bottom: 8px;
      }

      .tooltip-header img {
        width: 32px;
        height: 32px;
        border-radius: 4px;
      }

      .tooltip-header h4 {
        margin: 0;
        font-size: 1.1em;
        color: #c9b037;
      }

      .tooltip-details {
        font-size: 0.9em;
        margin-bottom: 8px;
      }

      .tooltip-details > div {
        margin-bottom: 4px;
      }

      .item-type {
        color: #b8b8b8;
        font-style: italic;
      }

      .item-damage {
        color: #ff6666;
      }

      .item-range {
        color: #66ccff;
      }

      .item-ac {
        color: #66ff66;
      }

      .item-rarity {
        font-weight: bold;
        text-transform: capitalize;
      }

      .item-rarity.uncommon {
        color: #1eff00;
      }

      .item-rarity.rare {
        color: #0070dd;
      }

      .item-rarity.veryrare {
        color: #a335ee;
      }

      .item-rarity.legendary {
        color: #ff8000;
      }

      .item-price {
        color: #ffcc00;
      }

      .tooltip-description {
        padding-top: 8px;
        border-top: 1px solid #444;
        color: #d0d0d0;
        font-style: italic;
        font-size: 0.9em;
        line-height: 1.3;
      }
    `;
    document.head.appendChild(style);
  }
});

console.log('✅ Brancalonia - Patch Tooltip Caricato');