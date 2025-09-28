/**
 * BRANCALONIA FIX ICON TEXT - IMMEDIATE
 * Fix immediato e brutale per rimuovere TUTTI i testi fa-solid/fa-regular
 */

// Esegui immediatamente al caricamento
(function() {
  console.log('🔥 BRANCALONIA EMERGENCY ICON FIX - STARTING');

  // Funzione brutale per pulire TUTTO
  function bruteForceClean() {
    // Trova TUTTI gli elementi del DOM
    const allElements = document.querySelectorAll('*');

    allElements.forEach(element => {
      // Skip scripts e stili
      if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return;

      // Per ogni child node dell'elemento
      const childNodes = Array.from(element.childNodes);
      childNodes.forEach(node => {
        // Se è un text node
        if (node.nodeType === Node.TEXT_NODE) {
          let text = node.textContent;
          let cleaned = text;

          // Rimuovi TUTTI i pattern problematici
          cleaned = cleaned.replace(/\bfa-solid\b/gi, '');
          cleaned = cleaned.replace(/\bfa-regular\b/gi, '');
          cleaned = cleaned.replace(/\bfa-brands\b/gi, '');
          cleaned = cleaned.replace(/\bfa-light\b/gi, '');
          cleaned = cleaned.replace(/\bfa-duotone\b/gi, '');
          cleaned = cleaned.replace(/\bfas\b(?!\w)/gi, '');
          cleaned = cleaned.replace(/\bfar\b(?!\w)/gi, '');
          cleaned = cleaned.replace(/\bfab\b(?!\w)/gi, '');

          // Rimuovi anche pattern fa-icon-name se seguito da testo
          cleaned = cleaned.replace(/\bfa-[\w-]+(?=\s+[A-Z])/gi, '');

          // Rimuovi caratteri unicode Font Awesome
          cleaned = cleaned.replace(/[\uf000-\uf8ff]/g, '');

          // Pulisci spazi multipli
          cleaned = cleaned.replace(/\s+/g, ' ').trim();

          // Se il testo è cambiato, aggiornalo
          if (text !== cleaned && cleaned !== '') {
            node.textContent = cleaned;
          } else if (cleaned === '' && node.parentNode) {
            // Se il testo è vuoto, rimuovi il nodo
            node.parentNode.removeChild(node);
          }
        }
      });

      // Fix specifico per bottoni
      if (element.tagName === 'BUTTON' || element.classList.contains('item')) {
        // Se ha un'icona
        const icon = element.querySelector('i[class*="fa-"]');
        if (icon) {
          // Trova tutti i text nodes dopo l'icona
          let currentNode = icon.nextSibling;
          while (currentNode) {
            if (currentNode.nodeType === Node.TEXT_NODE) {
              let text = currentNode.textContent;
              // Pulisci il testo
              text = text.replace(/^\s*fa-[\w-]+\s*/gi, '');
              text = text.replace(/^\s*fa(s|r|b)?\s+/gi, '');
              currentNode.textContent = text.trim();
            }
            currentNode = currentNode.nextSibling;
          }
        }
      }
    });
  }

  // Funzione per fixare le icone stesse
  function fixIcons() {
    const icons = document.querySelectorAll('i[class*="fa-"]');
    icons.forEach(icon => {
      // Assicura che l'icona non abbia testo
      if (icon.childNodes.length > 0) {
        Array.from(icon.childNodes).forEach(child => {
          if (child.nodeType === Node.TEXT_NODE) {
            child.remove();
          }
        });
      }

      // Imposta gli stili corretti
      icon.style.fontFamily = '"Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome"';
      icon.style.fontWeight = icon.classList.contains('far') ? '400' : '900';
      icon.style.fontStyle = 'normal';
      icon.style.display = 'inline-block';

      // Aggiungi pseudo-elemento per l'icona se non c'è contenuto
      if (!icon.textContent && !icon.dataset.fixed) {
        icon.dataset.fixed = 'true';

        // Estrai nome icona
        const match = icon.className.match(/fa-([\w-]+)/);
        if (match) {
          const iconName = match[1];
          // Aggiungi classe per forzare il rendering
          icon.classList.add('fa-fw'); // Fixed width
        }
      }
    });
  }

  // CSS di emergenza
  function injectEmergencyCSS() {
    const existingStyle = document.getElementById('brancalonia-emergency-css');
    if (existingStyle) existingStyle.remove();

    const style = document.createElement('style');
    style.id = 'brancalonia-emergency-css';
    style.textContent = `
      /* EMERGENCY: Nascondi TUTTI i testi fa-solid/fa-regular */
      body *:not(i):not(script):not(style) {
        font-family: inherit !important;
      }

      /* Forza rendering icone */
      i[class*="fa-"]::before {
        font-family: "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome" !important;
      }

      /* Fix bottoni specifici */
      button i[class*="fa-"],
      a.item i[class*="fa-"],
      .directory-item i[class*="fa-"] {
        margin-right: 0.25em;
      }

      /* Nascondi testo dopo icone nei bottoni */
      button:has(i[class*="fa-"]),
      a.item:has(i[class*="fa-"]) {
        font-size: inherit !important;
      }

      /* Fix Create Compendium button */
      button[data-action="createCompendium"] i::before {
        content: "\\f02d" !important;
      }

      /* Fix Create Folder button */
      button[data-action="createFolder"] i::before {
        content: "\\f65e" !important;
      }

      /* Fix Open Browser button */
      button[data-action="browseCompendium"] i::before,
      button[data-action="openBrowser"] i::before {
        content: "\\f02d" !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Esegui immediatamente
  bruteForceClean();
  fixIcons();
  injectEmergencyCSS();

  // Esegui quando DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bruteForceClean();
      fixIcons();
    });
  }

  // Hooks Foundry
  if (typeof Hooks !== 'undefined') {
    Hooks.once('init', () => {
      console.log('🔥 EMERGENCY FIX - Hooks init');
      bruteForceClean();
      fixIcons();
    });

    Hooks.once('ready', () => {
      console.log('🔥 EMERGENCY FIX - System ready');
      // Tripla pulizia per sicurezza
      bruteForceClean();
      setTimeout(bruteForceClean, 100);
      setTimeout(bruteForceClean, 500);
      setTimeout(bruteForceClean, 1000);

      // Observer super aggressivo
      const observer = new MutationObserver(() => {
        // Ad ogni mutazione, pulisci tutto
        bruteForceClean();
        fixIcons();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        characterDataOldValue: true
      });
    });

    // Hook su OGNI render
    Hooks.on('renderApplication', () => {
      setTimeout(bruteForceClean, 10);
    });

    Hooks.on('renderSidebarTab', () => {
      setTimeout(bruteForceClean, 10);
    });

    Hooks.on('renderSidebarDirectory', () => {
      setTimeout(bruteForceClean, 10);
    });

    Hooks.on('renderCompendiumDirectory', () => {
      setTimeout(bruteForceClean, 10);
    });
  }

  // Intervallo di pulizia aggressivo
  setInterval(() => {
    // Check se ci sono ancora problemi
    const bodyText = document.body.innerText;
    if (bodyText.includes('fa-solid') || bodyText.includes('fa-regular')) {
      console.log('🔥 EMERGENCY FIX - Problemi rilevati, pulizia forzata');
      bruteForceClean();
      fixIcons();
    }
  }, 2000);

  console.log('✅ BRANCALONIA EMERGENCY ICON FIX - ACTIVE');
})();