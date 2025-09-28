/**
 * BRANCALONIA ICONS SAFE FIX
 * Fix sicuro per le icone Font Awesome senza bloccare Foundry
 */

(() => {
  console.log('🎨 Brancalonia Icons Safe Fix - Inizializzazione');

  // CSS per le icone Font Awesome
  const iconStyles = `
    /* Fix Font Awesome Icons */
    i[class*="fa-"]::before {
      font-family: "Font Awesome 6 Free", "Font Awesome 6 Pro", "Font Awesome 5 Free", "FontAwesome" !important;
      font-weight: 900 !important;
      font-style: normal !important;
      display: inline-block !important;
    }

    /* Icone specifiche sidebar */
    button[data-action="createFolder"] i::before,
    button[data-tooltip="SIDEBAR.Create"] i.fa-folder-plus::before {
      content: "\\f65e" !important;
      font-family: "Font Awesome 6 Free" !important;
      font-weight: 900 !important;
    }

    button[data-action="create"] i.fa-user-plus::before,
    button[data-tooltip="SIDEBAR.Create"] i.fa-user-plus::before {
      content: "\\f234" !important;
      font-family: "Font Awesome 6 Free" !important;
      font-weight: 900 !important;
    }

    /* Fix per Create Actor/Folder buttons */
    .directory-header button i.fas {
      font-family: "Font Awesome 6 Free" !important;
      font-weight: 900 !important;
    }

    /* Icone navigation */
    .fa-folder::before { content: "\\f07b" !important; }
    .fa-folder-open::before { content: "\\f07c" !important; }
    .fa-folder-plus::before { content: "\\f65e" !important; }
    .fa-user::before { content: "\\f007" !important; }
    .fa-users::before { content: "\\f0c0" !important; }
    .fa-user-plus::before { content: "\\f234" !important; }
    .fa-plus::before { content: "\\f067" !important; }
    .fa-search::before { content: "\\f002" !important; }
    .fa-cog::before { content: "\\f013" !important; }
    .fa-dice-d20::before { content: "\\f6cf" !important; }
    .fa-comments::before { content: "\\f086" !important; }
    .fa-fist-raised::before { content: "\\f6de" !important; }
    .fa-book::before { content: "\\f02d" !important; }
    .fa-map::before { content: "\\f279" !important; }
    .fa-music::before { content: "\\f001" !important; }
    .fa-atlas::before { content: "\\f558" !important; }
    .fa-suitcase::before { content: "\\f0f2" !important; }
    .fa-th-list::before { content: "\\f00b" !important; }
    .fa-table::before { content: "\\f0ce" !important; }

    /* Nascondi testo duplicato */
    button i[class*="fa-"] + span,
    a.item i[class*="fa-"] + span {
      /* Mantieni il testo ma puliscilo */
    }

    /* Fix specifico per sidebar actors */
    #sidebar .directory-header .action-buttons button {
      display: inline-flex !important;
      align-items: center !important;
      gap: 0.25rem !important;
    }

    #sidebar .directory-header .action-buttons button i {
      display: inline-block !important;
      width: 1em !important;
      height: 1em !important;
      line-height: 1 !important;
    }
  `;

  // Inietta gli stili
  function injectStyles() {
    const existingStyle = document.getElementById('brancalonia-icons-fix-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    const styleElement = document.createElement('style');
    styleElement.id = 'brancalonia-icons-fix-styles';
    styleElement.textContent = iconStyles;
    document.head.appendChild(styleElement);
    console.log('✅ Stili icone iniettati');
  }

  // Fix leggero per pulire testi duplicati
  function cleanIconTexts() {
    // Solo per elementi che hanno chiaramente testi duplicati
    const problematicElements = document.querySelectorAll(
      'button:not([data-cleaned]), a.item:not([data-cleaned])'
    );

    problematicElements.forEach(element => {
      const icon = element.querySelector('i[class*="fa-"]');
      if (!icon) return;

      // Cerca text nodes che contengono "fa-solid" o pattern simili
      const textNodes = [];
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Solo text nodes che contengono pattern problematici
            if (node.nodeValue &&
                (node.nodeValue.includes('fa-solid') ||
                 node.nodeValue.includes('fa-regular') ||
                 node.nodeValue.includes('fas ') ||
                 node.nodeValue.includes('far '))) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
          }
        }
      );

      let node;
      while (node = walker.nextNode()) {
        textNodes.push(node);
      }

      // Pulisci i text nodes problematici
      textNodes.forEach(textNode => {
        let cleaned = textNode.nodeValue;
        cleaned = cleaned.replace(/\s*fa-(solid|regular|brands|light)\s*/gi, ' ');
        cleaned = cleaned.replace(/\s*fa[srlb]\s+/gi, ' ');
        cleaned = cleaned.replace(/\s+/g, ' ').trim();

        if (cleaned !== textNode.nodeValue) {
          textNode.nodeValue = cleaned;
        }
      });

      // Marca come pulito per evitare riprocessing
      element.setAttribute('data-cleaned', 'true');
    });
  }

  // Applica fix quando il DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectStyles();
      setTimeout(cleanIconTexts, 100);
    });
  } else {
    injectStyles();
    setTimeout(cleanIconTexts, 100);
  }

  // Hook Foundry per applicare fix dopo render
  if (typeof Hooks !== 'undefined') {
    Hooks.once('ready', () => {
      console.log('🎨 Applicazione fix icone dopo ready');
      injectStyles();
      setTimeout(cleanIconTexts, 500);
    });

    // Fix dopo render di sidebar
    Hooks.on('renderSidebarTab', (app, html, data) => {
      if (app.tabName === 'actors' || app.tabName === 'items') {
        setTimeout(() => {
          cleanIconTexts();

          // Fix specifico per i bottoni Create
          const createButtons = html[0].querySelectorAll('.directory-header button');
          createButtons.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon && !icon.style.fontFamily) {
              icon.style.fontFamily = '"Font Awesome 6 Free", "Font Awesome 5 Free"';
              icon.style.fontWeight = '900';
            }
          });
        }, 100);
      }
    });

    // Fix dopo render directory
    Hooks.on('renderSidebarDirectory', (app, html, data) => {
      setTimeout(cleanIconTexts, 100);
    });
  }

  console.log('✅ Brancalonia Icons Safe Fix - Attivo');
})();