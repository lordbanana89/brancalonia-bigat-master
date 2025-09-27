/* ===================================== */
/* BRANCALONIA ULTIMATE IMAGE FIX */
/* Soluzione definitiva per immagini 404 */
/* ===================================== */

(() => {
  console.log('Brancalonia | ULTIMATE Image Fix - Intercettazione totale attivata');

  // Lista completa di TUTTE le immagini problematiche
  const PROBLEM_IMAGES = [
    'breastplate-metal-copper.webp',
    'breastplate-steel.webp',
    'breastplate-metal.webp',
    'breastplate.webp',
    'chainmail.webp',
    'leather.webp',
    'hide.webp',
    'padded.webp',
    'scale.webp',
    'splint.webp',
    'studded.webp',
    'ring.webp',
    'plate.webp'
  ];

  // Funzione per verificare se un URL è problematico
  function isProblematicImage(url) {
    if (!url) return false;

    // Controlla se contiene path equipment/chest o armor
    if (url.includes('/equipment/chest/') || url.includes('/equipment/armor/')) {
      return true;
    }

    // Controlla lista specifica
    return PROBLEM_IMAGES.some(img => url.includes(img));
  }

  // Funzione per ottenere fallback appropriato
  function getFallbackImage(originalUrl) {
    // Usa shield.svg come fallback universale per armature
    return 'icons/svg/shield.svg';
  }

  // INTERCETTAZIONE LIVELLO 1: Override di TextEditor.enrichHTML
  // Questo è il punto più precoce dove possiamo intercettare
  Hooks.once('init', () => {
    const originalEnrichHTML = TextEditor.enrichHTML;

    TextEditor.enrichHTML = function(content, options = {}) {
      // Se non è una stringa, passa direttamente all'originale
      if (typeof content !== 'string') {
        return originalEnrichHTML.call(this, content, options);
      }

      // Sostituisci TUTTE le immagini problematiche PRIMA del processing
      let modifiedContent = content;

      // Regex per trovare TUTTI i tag img con src problematici
      const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;

      modifiedContent = modifiedContent.replace(imgRegex, (match, src) => {
        if (isProblematicImage(src)) {
          console.log(`Brancalonia | Pre-processing: Sostituisco ${src.split('/').pop()}`);
          // Sostituisci il src mantenendo tutti gli altri attributi
          return match.replace(src, getFallbackImage(src));
        }
        return match;
      });

      // Regex specifiche per path noti problematici
      modifiedContent = modifiedContent.replace(
        /icons\/equipment\/chest\/[^"'\s]+\.webp/gi,
        'icons/svg/shield.svg'
      );

      modifiedContent = modifiedContent.replace(
        /icons\/equipment\/armor\/[^"'\s]+\.webp/gi,
        'icons/svg/shield.svg'
      );

      // Chiama l'originale con il contenuto modificato
      return originalEnrichHTML.call(this, modifiedContent, options);
    };

    console.log('Brancalonia | Override enrichHTML installato con successo');
  });

  // INTERCETTAZIONE LIVELLO 2: Override createElement per img
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName, options) {
    const element = originalCreateElement.call(this, tagName, options);

    if (tagName.toLowerCase() === 'img') {
      // Intercetta quando src viene settato
      let _src = '';
      Object.defineProperty(element, 'src', {
        get() {
          return _src;
        },
        set(value) {
          if (isProblematicImage(value)) {
            console.log(`Brancalonia | createElement intercept: ${value.split('/').pop()}`);
            _src = getFallbackImage(value);
            element.setAttribute('src', _src);
            element.dataset.originalSrc = value;
          } else {
            _src = value;
            element.setAttribute('src', value);
          }
        }
      });
    }

    return element;
  };

  // INTERCETTAZIONE LIVELLO 3: Override Image constructor
  const OriginalImage = window.Image;
  window.Image = class extends OriginalImage {
    set src(value) {
      if (isProblematicImage(value)) {
        console.log(`Brancalonia | Image constructor intercept: ${value.split('/').pop()}`);
        super.src = getFallbackImage(value);
        this.dataset.originalSrc = value;
      } else {
        super.src = value;
      }
    }

    get src() {
      return super.src;
    }
  };

  // INTERCETTAZIONE LIVELLO 4: MutationObserver per DOM changes
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      // Controlla nodi aggiunti
      mutation.addedNodes.forEach(node => {
        if (node.nodeName === 'IMG') {
          if (isProblematicImage(node.src)) {
            console.log(`Brancalonia | MutationObserver: ${node.src.split('/').pop()}`);
            node.src = getFallbackImage(node.src);
            node.dataset.fallbackApplied = 'true';
          }
        } else if (node.querySelectorAll) {
          // Controlla immagini nei nodi figli
          const images = node.querySelectorAll('img');
          images.forEach(img => {
            if (isProblematicImage(img.src) && !img.dataset.fallbackApplied) {
              console.log(`Brancalonia | MutationObserver child: ${img.src.split('/').pop()}`);
              img.src = getFallbackImage(img.src);
              img.dataset.fallbackApplied = 'true';
            }
          });
        }
      });
    });
  });

  // Avvia observer quando DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  } else {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // INTERCETTAZIONE LIVELLO 5: fetch API override
  const originalFetch = window.fetch;
  window.fetch = async function(resource, init) {
    // Se è una richiesta per un'immagine problematica
    if (typeof resource === 'string' && isProblematicImage(resource)) {
      console.log(`Brancalonia | Fetch intercept: ${resource.split('/').pop()}`);
      // Ritorna direttamente il fallback
      return originalFetch.call(this, getFallbackImage(resource), init);
    }

    return originalFetch.call(this, resource, init);
  };

  // INTERCETTAZIONE LIVELLO 6: XMLHttpRequest override
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (isProblematicImage(url)) {
      console.log(`Brancalonia | XHR intercept: ${url.split('/').pop()}`);
      return originalOpen.call(this, method, getFallbackImage(url), ...args);
    }
    return originalOpen.call(this, method, url, ...args);
  };

  console.log('Brancalonia | ULTIMATE Image Fix - Sistema completo installato');
  console.log('Brancalonia | 6 livelli di intercettazione attivi');
})();