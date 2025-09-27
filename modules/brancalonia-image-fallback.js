/* ===================================== */
/* BRANCALONIA IMAGE FALLBACK */
/* Gestisce immagini mancanti con fallback */
/* ===================================== */

Hooks.once('init', () => {
  console.log('Brancalonia | Inizializzazione sistema fallback immagini');

  // Override del metodo di caricamento immagini
  const originalImageOnError = window.Image.prototype.onerror;

  window.addEventListener('error', (event) => {
    if (event.target instanceof HTMLImageElement) {
      const img = event.target;
      const src = img.src;

      // Gestisci solo immagini del modulo
      if (src.includes('breastplate-metal-copper.webp')) {
        console.log(`Brancalonia | Immagine mancante: ${src}, uso fallback`);
        img.src = 'icons/svg/shield.svg';
        event.preventDefault();
        return false;
      }

      if (src.includes('breastplate-steel.webp')) {
        console.log(`Brancalonia | Immagine mancante: ${src}, uso fallback`);
        img.src = 'icons/svg/shield.svg';
        event.preventDefault();
        return false;
      }
    }
  }, true);
});

// Hook per gestire le immagini nei messaggi chat
Hooks.on('renderChatMessage', (message, html, data) => {
  html.find('img').each((i, img) => {
    const src = img.src;

    if (src.includes('breastplate-metal-copper.webp') || src.includes('breastplate-steel.webp')) {
      img.src = 'icons/svg/shield.svg';
      img.onerror = null; // Previeni loop infiniti
    }
  });
});

console.log('Brancalonia | Sistema fallback immagini attivo');