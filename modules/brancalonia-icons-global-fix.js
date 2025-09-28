/**
 * BRANCALONIA ICONS GLOBAL FIX
 * Fix completo per tutte le icone duplicate e mal renderizzate
 */

(() => {
  console.log('🔧 Brancalonia Icons Global Fix - Inizializzazione');

  // Mappa completa icone Font Awesome
  const iconMap = {
    // User/Actor icons
    'user': '\uf007',
    'users': '\uf0c0',
    'user-plus': '\uf234',
    'user-friends': '\uf500',
    'user-circle': '\uf2bd',

    // Folder/File icons
    'folder': '\uf07b',
    'folder-open': '\uf07c',
    'folder-plus': '\uf65e',
    'file': '\uf15b',
    'file-plus': '\uf319',
    'file-alt': '\uf15c',

    // UI icons
    'plus': '\uf067',
    'plus-circle': '\uf055',
    'plus-square': '\uf0fe',
    'search': '\uf002',
    'cog': '\uf013',
    'cogs': '\uf085',
    'bars': '\uf0c9',
    'times': '\uf00d',
    'check': '\uf00c',
    'edit': '\uf044',
    'trash': '\uf1f8',
    'trash-alt': '\uf2ed',

    // Navigation
    'chevron-up': '\uf077',
    'chevron-down': '\uf078',
    'chevron-left': '\uf053',
    'chevron-right': '\uf054',
    'angle-up': '\uf106',
    'angle-down': '\uf107',
    'angle-left': '\uf104',
    'angle-right': '\uf105',
    'caret-up': '\uf0d8',
    'caret-down': '\uf0d7',

    // Game icons
    'dice-d20': '\uf6cf',
    'dice': '\uf522',
    'comments': '\uf086',
    'comment': '\uf075',
    'fist-raised': '\uf6de',
    'book': '\uf02d',
    'atlas': '\uf558',
    'map': '\uf279',
    'suitcase': '\uf0f2',
    'music': '\uf001',
    'table': '\uf0ce',
    'th-list': '\uf00b',
    'credit-card': '\uf09d',

    // Actions
    'play': '\uf04b',
    'pause': '\uf04c',
    'stop': '\uf04d',
    'forward': '\uf04e',
    'backward': '\uf04a',
    'sync': '\uf021',
    'sync-alt': '\uf2f1',
    'redo': '\uf01e',
    'undo': '\uf0e2',
    'save': '\uf0c7',
    'download': '\uf019',
    'upload': '\uf093',

    // Status
    'check-circle': '\uf058',
    'times-circle': '\uf057',
    'exclamation-triangle': '\uf071',
    'info-circle': '\uf05a',
    'question-circle': '\uf059',
    'lock': '\uf023',
    'unlock': '\uf09c',
    'eye': '\uf06e',
    'eye-slash': '\uf070',

    // Misc
    'home': '\uf015',
    'star': '\uf005',
    'heart': '\uf004',
    'bookmark': '\uf02e',
    'flag': '\uf024',
    'bell': '\uf0f3',
    'envelope': '\uf0e0',
    'calendar': '\uf133',
    'clock': '\uf017',
    'history': '\uf1da',
    'globe': '\uf0ac',
    'link': '\uf0c1',
    'unlink': '\uf127'
  };

  // Funzione per pulire il testo dalle icone duplicate
  function cleanIconText(element) {
    if (!element) return;

    // Se è un text node
    if (element.nodeType === 3) {
      let text = element.textContent;

      // Rimuovi pattern fa-solid, fa-regular, etc
      text = text.replace(/\s*fa-(solid|regular|brands|light|duotone)\s*/gi, ' ');

      // Rimuovi pattern fa-icon-name duplicati
      text = text.replace(/\s*fa-[\w-]+\s*/gi, ' ');

      // Rimuovi caratteri unicode strani
      text = text.replace(/[\uf000-\uf8ff]/g, '');

      // Pulisci spazi multipli
      text = text.replace(/\s+/g, ' ').trim();

      if (element.textContent !== text) {
        element.textContent = text;
      }
    }

    // Ricorsione per i child nodes
    if (element.childNodes) {
      Array.from(element.childNodes).forEach(child => {
        if (child.nodeType === 3 || (child.nodeType === 1 && !child.matches('i[class*="fa-"]'))) {
          cleanIconText(child);
        }
      });
    }
  }

  // Funzione per fixare una singola icona
  function fixIcon(icon) {
    if (!icon || icon.dataset.iconFixed === 'true') return;

    // Estrai il nome dell'icona dalle classi
    const classes = icon.className;
    const iconMatch = classes.match(/fa-([\w-]+)/);

    if (iconMatch) {
      const iconName = iconMatch[1];

      // Imposta lo stile base
      icon.style.fontFamily = '"Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome"';
      icon.style.fontStyle = 'normal';
      icon.style.fontVariant = 'normal';
      icon.style.textRendering = 'auto';
      icon.style.webkitFontSmoothing = 'antialiased';
      icon.style.display = 'inline-block';

      // Imposta il peso corretto
      if (classes.includes('fas') || classes.includes('fa-solid')) {
        icon.style.fontWeight = '900';
      } else if (classes.includes('far') || classes.includes('fa-regular')) {
        icon.style.fontWeight = '400';
      } else if (classes.includes('fab') || classes.includes('fa-brands')) {
        icon.style.fontWeight = '400';
      } else {
        // Default a solid
        icon.style.fontWeight = '900';
      }

      // Se l'icona è vuota, aggiungi il contenuto unicode
      if (!icon.textContent.trim() && iconMap[iconName]) {
        icon.textContent = iconMap[iconName];
      }

      // Pulisci eventuali text nodes intorno all'icona
      if (icon.parentElement) {
        cleanIconText(icon.parentElement);
      }

      // Marca come fixata
      icon.dataset.iconFixed = 'true';
    }
  }

  // Funzione per fixare tutte le icone
  function fixAllIcons() {
    // Seleziona tutte le icone
    const icons = document.querySelectorAll('i[class*="fa-"], .fas, .far, .fab, .fa');
    icons.forEach(fixIcon);

    // Fix specifici per elementi problematici

    // Fix bottoni con testo duplicato
    document.querySelectorAll('button, a.item, .directory-item, .tab').forEach(element => {
      // Trova icone dentro l'elemento
      const icon = element.querySelector('i[class*="fa-"]');
      if (icon) {
        // Pulisci il testo dell'elemento parent
        Array.from(element.childNodes).forEach(node => {
          if (node.nodeType === 3) { // Text node
            cleanIconText(node);
          }
        });
      }
    });

    // Fix labels specifici
    document.querySelectorAll('label').forEach(label => {
      if (label.textContent.includes('fa-solid') || label.textContent.includes('fa-regular')) {
        cleanIconText(label);
      }
    });

    // Fix sidebar tabs
    document.querySelectorAll('#sidebar-tabs a.item').forEach(tab => {
      const icon = tab.querySelector('i');
      if (icon) {
        fixIcon(icon);
        // Rimuovi testo duplicato
        Array.from(tab.childNodes).forEach(node => {
          if (node.nodeType === 3 && node !== icon) {
            node.textContent = '';
          }
        });
      }
    });

    // Fix directory headers
    document.querySelectorAll('.directory-header button').forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        fixIcon(icon);
      }
    });
  }

  // Funzione per pulire tutto il DOM
  function globalCleanup() {
    // Rimuovi tutti i testi "fa-solid", "fa-regular" etc dal DOM
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          if (node.textContent.match(/fa-(solid|regular|brands|light)/)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach(node => {
      cleanIconText(node);
    });
  }

  // Hook per l'inizializzazione
  Hooks.once('init', () => {
    console.log('🔧 Brancalonia Icons - Hook init');
  });

  // Hook quando il DOM è pronto
  Hooks.once('ready', () => {
    console.log('🔧 Brancalonia Icons - Sistema pronto, applicazione fix globale');

    // Prima pulizia globale
    globalCleanup();

    // Fix tutte le icone
    fixAllIcons();

    // Setup observer per cambiamenti futuri
    setupMutationObserver();
  });

  // Setup MutationObserver
  function setupMutationObserver() {
    let fixTimeout;

    const observer = new MutationObserver((mutations) => {
      // Debounce per evitare troppe esecuzioni
      clearTimeout(fixTimeout);
      fixTimeout = setTimeout(() => {
        let needsFix = false;

        mutations.forEach(mutation => {
          // Check per nuovi nodi
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1) {
                // Check se contiene icone o testo problematico
                if (node.matches?.('i[class*="fa-"], button, label, .tab, .directory-item') ||
                    node.querySelector?.('i[class*="fa-"]') ||
                    (node.textContent && node.textContent.includes('fa-solid'))) {
                  needsFix = true;
                }
              } else if (node.nodeType === 3 && node.textContent.includes('fa-solid')) {
                needsFix = true;
              }
            });
          }

          // Check per modifiche di attributi
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (mutation.target.matches?.('i[class*="fa-"]')) {
              needsFix = true;
            }
          }

          // Check per modifiche di testo
          if (mutation.type === 'characterData') {
            if (mutation.target.textContent.includes('fa-solid')) {
              needsFix = true;
            }
          }
        });

        if (needsFix) {
          fixAllIcons();
        }
      }, 100);
    });

    // Osserva tutto il body
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
      characterData: true
    });
  }

  // Hooks per elementi specifici
  Hooks.on('renderSidebarTab', (app, html) => {
    setTimeout(() => {
      globalCleanup();
      fixAllIcons();
    }, 50);
  });

  Hooks.on('renderSettings', (app, html) => {
    setTimeout(() => {
      globalCleanup();
      fixAllIcons();
    }, 50);
  });

  Hooks.on('renderActorSheet', (app, html) => {
    setTimeout(() => {
      const element = html[0] || html;
      cleanIconText(element);
      element.querySelectorAll('i[class*="fa-"]').forEach(fixIcon);
    }, 50);
  });

  Hooks.on('renderItemSheet', (app, html) => {
    setTimeout(() => {
      const element = html[0] || html;
      cleanIconText(element);
      element.querySelectorAll('i[class*="fa-"]').forEach(fixIcon);
    }, 50);
  });

  Hooks.on('renderApplication', (app, html) => {
    setTimeout(() => {
      const element = html[0] || html;
      cleanIconText(element);
      element.querySelectorAll('i[class*="fa-"]').forEach(fixIcon);
    }, 50);
  });

  // Fix periodico come failsafe
  setInterval(() => {
    const problemElements = document.querySelectorAll('*');
    let foundProblems = false;

    problemElements.forEach(el => {
      if (el.textContent && el.textContent.includes('fa-solid') &&
          !el.matches('script, style, i[class*="fa-"]')) {
        foundProblems = true;
      }
    });

    if (foundProblems) {
      console.log('🔧 Brancalonia Icons - Trovati problemi residui, pulizia in corso');
      globalCleanup();
      fixAllIcons();
    }
  }, 5000);

  // Aggiungi CSS globale tramite JavaScript
  const style = document.createElement('style');
  style.textContent = `
    /* Nascondi testo fa-solid/fa-regular ovunque */
    *:not(i):not(script):not(style) {
      text-rendering: auto !important;
    }

    /* Fix icone Font Awesome */
    i[class*="fa-"] {
      font-family: "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome" !important;
      font-style: normal !important;
      speak: none !important;
    }

    /* Previeni duplicazione testo */
    button i[class*="fa-"]::after,
    label i[class*="fa-"]::after,
    .tab i[class*="fa-"]::after {
      content: "" !important;
    }

    /* Hide any stray fa-solid text */
    button:has(i[class*="fa-"]),
    label:has(i[class*="fa-"]),
    .tab:has(i[class*="fa-"]) {
      text-transform: none !important;
    }
  `;
  document.head.appendChild(style);

  console.log('✅ Brancalonia Icons Global Fix - Caricato e attivo');
})();