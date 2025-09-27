/* ===================================== */
/* BRANCALONIA IMAGE FALLBACK */
/* Gestisce immagini mancanti con fallback */
/* ===================================== */

Hooks.once('init', () => {
  console.log('Brancalonia | Inizializzazione sistema fallback immagini');

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
            console.log(`Brancalonia | Immagine mancante: ${missingImg}, uso fallback`);
            img.dataset.fallbackApplied = 'true';
            img.src = fallbackImg;
            event.preventDefault();
            return false;
          }
        }
      }
    }
  }, true);
});

// Hook aggiornato per Foundry v13 - usa renderChatMessageHTML invece di renderChatMessage
Hooks.on('renderChatMessageHTML', (message, html, data) => {
  // html è ora un HTMLElement, non jQuery
  const images = html.querySelectorAll('img');

  images.forEach(img => {
    const src = img.src;

    // Applica fallback per immagini conosciute come mancanti
    if (src.includes('breastplate-metal-copper.webp') ||
        src.includes('breastplate-steel.webp') ||
        src.includes('breastplate-metal.webp') ||
        src.includes('chainmail.webp') ||
        src.includes('leather.webp')) {

      if (!img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = 'true';
        img.src = 'icons/svg/shield.svg';
        img.onerror = null; // Previeni ulteriori errori
      }
    }
  });
});

// Hook aggiuntivo per gestire immagini in altri contesti (sheet, journal, etc.)
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

console.log('Brancalonia | Sistema fallback immagini attivo (v13 compatible)');