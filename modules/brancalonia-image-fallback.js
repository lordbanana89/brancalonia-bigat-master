/* ===================================== */
/* BRANCALONIA IMAGE FALLBACK */
/* Gestisce immagini mancanti con fallback */
/* ===================================== */

// Inizializzazione precoce per intercettare tutti gli errori
(() => {
  console.log('Brancalonia | Sistema fallback immagini attivato');

  // Lista di immagini mancanti conosciute e loro fallback
  const missingImages = {
    'breastplate-metal-copper.webp': 'icons/svg/shield.svg',
    'breastplate-steel.webp': 'icons/svg/shield.svg',
    'breastplate-metal.webp': 'icons/svg/shield.svg',
    'chainmail.webp': 'icons/svg/shield.svg',
    'leather.webp': 'icons/svg/shield.svg'
  };

  // Intercetta errori di caricamento immagini globalmente
  window.addEventListener('error', (event) => {
    if (event.target instanceof HTMLImageElement) {
      const img = event.target;
      const src = img.src;

      // Controlla se è un'immagine conosciuta come mancante
      for (const [missingImg, fallbackImg] of Object.entries(missingImages)) {
        if (src.includes(missingImg)) {
          // Evita loop infiniti
          if (!img.dataset.fallbackApplied) {
            console.log(`Brancalonia | Fallback per: ${missingImg}`);
            img.dataset.fallbackApplied = 'true';
            img.src = fallbackImg;
            img.onerror = null; // Rimuovi handler per evitare loop
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
        }
      }
    }
  }, true);

  // Override diretto del costruttore Image per prevenzione
  const OriginalImage = window.Image;
  window.Image = class extends OriginalImage {
    constructor(width, height) {
      super(width, height);

      // Aggiungi listener per questa specifica immagine
      this.addEventListener('error', function(e) {
        const src = this.src;
        for (const [missingImg, fallbackImg] of Object.entries(missingImages)) {
          if (src && src.includes(missingImg) && !this.dataset.fallbackApplied) {
            console.log(`Brancalonia | Image constructor fallback: ${missingImg}`);
            this.dataset.fallbackApplied = 'true';
            this.src = fallbackImg;
            e.preventDefault();
            e.stopPropagation();
            break;
          }
        }
      });
    }
  };
})();

// Hook aggiornato per Foundry v13
Hooks.on('renderChatMessageHTML', (message, html, data) => {
  // html è ora un HTMLElement
  const images = html.querySelectorAll('img');

  images.forEach(img => {
    const src = img.src;

    // Lista di immagini da sostituire
    const toReplace = [
      'breastplate-metal-copper.webp',
      'breastplate-steel.webp',
      'breastplate-metal.webp',
      'chainmail.webp',
      'leather.webp'
    ];

    for (const imgName of toReplace) {
      if (src && src.includes(imgName)) {
        img.src = 'icons/svg/shield.svg';
        img.dataset.fallbackApplied = 'true';
        img.onerror = null;
        break;
      }
    }
  });
});

// Hook per intercettare la creazione di documenti con immagini
Hooks.on('preCreateChatMessage', (document, data, options, userId) => {
  if (data.content && typeof data.content === 'string') {
    // Sostituisci le immagini problematiche nel contenuto
    data.content = data.content.replace(
      /src="[^"]*breastplate-metal-copper\.webp"/gi,
      'src="icons/svg/shield.svg"'
    );
    data.content = data.content.replace(
      /src="[^"]*breastplate-steel\.webp"/gi,
      'src="icons/svg/shield.svg"'
    );
    data.content = data.content.replace(
      /src="[^"]*equipment\/chest\/[^"]+\.webp"/gi,
      'src="icons/svg/shield.svg"'
    );
  }
});

// Hook per gestire le immagini in altri contesti
Hooks.on('renderApplication', (app, html, data) => {
  // Converti jQuery a HTMLElement se necessario
  const element = html[0] || html;
  if (element instanceof HTMLElement) {
    const images = element.querySelectorAll('img[src*="equipment/chest"]');

    images.forEach(img => {
      if (!img.dataset.fallbackApplied && img.onerror === null) {
        img.onerror = function() {
          if (!this.dataset.fallbackApplied) {
            this.dataset.fallbackApplied = 'true';
            this.src = 'icons/svg/shield.svg';
            this.onerror = null;
          }
        };
      }
    });
  }
});

console.log('Brancalonia | Sistema fallback immagini completo v13');