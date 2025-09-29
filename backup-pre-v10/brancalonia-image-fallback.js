/* ===================================== */
/* BRANCALONIA IMAGE FALLBACK */
/* Gestisce immagini mancanti con fallback */
/* ===================================== */

console.log('Brancalonia | Sistema fallback immagini v2 attivato');

// Configurazione immagini mancanti
const MISSING_IMAGES = {
  'breastplate-metal-copper.webp': 'icons/svg/shield.svg',
  'breastplate-steel.webp': 'icons/svg/shield.svg',
  'breastplate-metal.webp': 'icons/svg/shield.svg',
  'breastplate.webp': 'icons/svg/shield.svg',
  'chainmail.webp': 'icons/svg/shield.svg',
  'leather.webp': 'icons/svg/shield.svg',
  'hide.webp': 'icons/svg/shield.svg',
  'padded.webp': 'icons/svg/shield.svg',
  'scale.webp': 'icons/svg/shield.svg',
  'splint.webp': 'icons/svg/shield.svg',
  'studded.webp': 'icons/svg/shield.svg'
};

// Intercetta globale errori immagini
window.addEventListener('error', function(event) {
  if (!(event.target instanceof HTMLImageElement)) return;

  const img = event.target;
  const src = img.src || '';

  // Controlla se è un'immagine di equipaggiamento
  if (src.includes('/equipment/chest/') || src.includes('/equipment/armor/')) {
    // Previeni loop infiniti
    if (img.dataset.fallbackApplied === 'true') return;

    // Applica fallback
    console.log(`Brancalonia | Fallback immagine: ${src.split('/').pop()}`);
    img.dataset.fallbackApplied = 'true';
    img.src = 'icons/svg/shield.svg';
    img.style.filter = 'sepia(1) saturate(0.8) hue-rotate(15deg)'; // Stile pergamena

    // Previeni propagazione errore
    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  // Controlla specifiche immagini mancanti
  for (const [missingImg, fallbackImg] of Object.entries(MISSING_IMAGES)) {
    if (src.includes(missingImg)) {
      if (img.dataset.fallbackApplied === 'true') return;

      console.log(`Brancalonia | Fallback per: ${missingImg}`);
      img.dataset.fallbackApplied = 'true';
      img.src = fallbackImg;
      img.style.filter = 'sepia(1) saturate(0.8) hue-rotate(15deg)';

      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }
}, true);

// Hook per messaggi chat (Foundry v13)
Hooks.on('renderChatMessageHTML', (message, html, data) => {
  // Gestisci sia jQuery che HTMLElement
  const element = html[0] || html;
  if (!(element instanceof HTMLElement)) return;

  const images = element.querySelectorAll('img');

  images.forEach(img => {
    const src = img.src || '';

    // Controlla equipaggiamento
    if (src.includes('/equipment/chest/') || src.includes('/equipment/armor/')) {
      // Aggiungi handler preventivo
      if (!img.dataset.fallbackReady) {
        img.dataset.fallbackReady = 'true';

        // Handler immediato se l'immagine è già in errore
        if (img.naturalWidth === 0 && img.naturalHeight === 0) {
          img.dataset.fallbackApplied = 'true';
          img.src = 'icons/svg/shield.svg';
          img.style.filter = 'sepia(1) saturate(0.8) hue-rotate(15deg)';
        }

        // Handler per errori futuri
        img.onerror = function() {
          if (this.dataset.fallbackApplied !== 'true') {
            console.log(`Brancalonia | Chat fallback: ${src.split('/').pop()}`);
            this.dataset.fallbackApplied = 'true';
            this.src = 'icons/svg/shield.svg';
            this.style.filter = 'sepia(1) saturate(0.8) hue-rotate(15deg)';
          }
          return false;
        };
      }
    }

    // Controlla immagini specifiche
    for (const missingImg of Object.keys(MISSING_IMAGES)) {
      if (src.includes(missingImg)) {
        if (!img.dataset.fallbackApplied) {
          img.dataset.fallbackApplied = 'true';
          img.src = MISSING_IMAGES[missingImg];
          img.style.filter = 'sepia(1) saturate(0.8) hue-rotate(15deg)';
          img.onerror = null;
        }
        break;
      }
    }
  });
});

// Hook per tutte le applicazioni
Hooks.on('renderApplication', (app, html, data) => {
  const element = html[0] || html;
  if (!(element instanceof HTMLElement)) return;

  // Trova tutte le immagini di equipaggiamento
  const images = element.querySelectorAll('img[src*="equipment"], img[src*="armor"], img[src*="chest"]');

  images.forEach(img => {
    if (!img.dataset.fallbackReady) {
      img.dataset.fallbackReady = 'true';

      // Controlla se l'immagine è già fallita
      if (img.complete && img.naturalWidth === 0) {
        img.dataset.fallbackApplied = 'true';
        img.src = 'icons/svg/shield.svg';
        img.style.filter = 'sepia(1) saturate(0.8) hue-rotate(15deg)';
      }

      // Aggiungi handler per errori futuri
      img.onerror = function() {
        if (this.dataset.fallbackApplied !== 'true') {
          console.log(`Brancalonia | App fallback: ${this.src.split('/').pop()}`);
          this.dataset.fallbackApplied = 'true';
          this.src = 'icons/svg/shield.svg';
          this.style.filter = 'sepia(1) saturate(0.8) hue-rotate(15deg)';
        }
        return false;
      };
    }
  });
});

// Intercetta creazione nuove immagini
const OriginalImage = window.Image;
window.Image = class extends OriginalImage {
  constructor(width, height) {
    super(width, height);

    let fallbackApplied = false;

    this.addEventListener('error', function() {
      if (fallbackApplied) return;

      const src = this.src || '';

      // Controlla se è equipaggiamento
      if (src.includes('/equipment/chest/') || src.includes('/equipment/armor/')) {
        console.log(`Brancalonia | Image constructor fallback: ${src.split('/').pop()}`);
        fallbackApplied = true;
        this.src = 'icons/svg/shield.svg';
        return;
      }

      // Controlla immagini specifiche
      for (const [missingImg, fallbackImg] of Object.entries(MISSING_IMAGES)) {
        if (src.includes(missingImg)) {
          console.log(`Brancalonia | Constructor fallback: ${missingImg}`);
          fallbackApplied = true;
          this.src = fallbackImg;
          break;
        }
      }
    });
  }
};

// Sostituisci fetch per intercettare richieste 404
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const [resource, config] = args;

  // Controlla se è un'immagine di equipaggiamento
  if (typeof resource === 'string' &&
      (resource.includes('/equipment/chest/') || resource.includes('/equipment/armor/'))) {

    try {
      const response = await originalFetch.apply(this, args);

      // Se 404, ritorna fallback
      if (!response.ok && response.status === 404) {
        console.log(`Brancalonia | Fetch intercept 404: ${resource.split('/').pop()}`);
        return originalFetch('icons/svg/shield.svg', config);
      }

      return response;
    } catch (error) {
      console.log(`Brancalonia | Fetch error, using fallback`);
      return originalFetch('icons/svg/shield.svg', config);
    }
  }

  return originalFetch.apply(this, args);
};

console.log('Brancalonia | Sistema fallback immagini v2 completato');