/**
 * Fix definitivo per le icone Font Awesome in Foundry v13
 * Risolve tutti i problemi di rendering delle icone
 */

Hooks.once('init', () => {
  console.log('Brancalonia | Inizializzazione fix icone Font Awesome v13');
});

Hooks.once('ready', () => {
  console.log('Brancalonia | Applicazione fix icone Font Awesome');

  // Funzione per fixare tutte le icone
  const fixAllIcons = () => {
    // Trova tutte le icone Font Awesome nel DOM
    const icons = document.querySelectorAll('i[class*="fa-"], .fas, .far, .fab');

    icons.forEach(icon => {
      // Assicura che l'icona abbia la font-family corretta
      if (!icon.style.fontFamily || !icon.style.fontFamily.includes('Font Awesome')) {
        icon.style.fontFamily = '"Font Awesome 6 Free", "Font Awesome 6 Solid", "Font Awesome 5 Free", "FontAwesome"';
      }

      // Fix peso per solid icons
      if (icon.classList.contains('fas')) {
        icon.style.fontWeight = '900';
      } else if (icon.classList.contains('far')) {
        icon.style.fontWeight = '400';
      }

      // Fix display
      if (!icon.style.display || icon.style.display === 'none') {
        icon.style.display = 'inline-block';
      }

      // Fix font-style
      icon.style.fontStyle = 'normal';
      icon.style.fontVariant = 'normal';
      icon.style.textRendering = 'auto';
      icon.style.webkitFontSmoothing = 'antialiased';
    });
  };

  // Fix iniziale
  fixAllIcons();

  // Observer per fixare nuove icone aggiunte dinamicamente
  const observer = new MutationObserver((mutations) => {
    let shouldFix = false;

    mutations.forEach(mutation => {
      // Controlla se sono stati aggiunti nodi
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            // Controlla se il nodo o i suoi figli contengono icone
            if (node.matches?.('i[class*="fa-"], .fas, .far, .fab') ||
                node.querySelector?.('i[class*="fa-"], .fas, .far, .fab')) {
              shouldFix = true;
            }
          }
        });
      }

      // Controlla anche modifiche agli attributi class
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (mutation.target.matches?.('i[class*="fa-"], .fas, .far, .fab')) {
          shouldFix = true;
        }
      }
    });

    // Applica fix se necessario (con debouncing)
    if (shouldFix) {
      clearTimeout(observer.fixTimeout);
      observer.fixTimeout = setTimeout(fixAllIcons, 100);
    }
  });

  // Osserva tutto il documento per cambiamenti
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });

  // Fix specifici per elementi Foundry
  Hooks.on('renderSidebarTab', (app, html) => {
    console.log('Brancalonia | Fix icone in sidebar tab:', app.tabName);
    setTimeout(fixAllIcons, 100);
  });

  Hooks.on('renderActorSheet', (app, html) => {
    console.log('Brancalonia | Fix icone in actor sheet');
    setTimeout(fixAllIcons, 100);
  });

  Hooks.on('renderItemSheet', (app, html) => {
    console.log('Brancalonia | Fix icone in item sheet');
    setTimeout(fixAllIcons, 100);
  });

  // Aggiungi stili globali via JavaScript per assicurarsi che vengano applicati
  const style = document.createElement('style');
  style.textContent = `
    /* Font Awesome Global Fix */
    i[class*="fa-"],
    .fas, .far, .fab {
      font-family: "Font Awesome 6 Free", "Font Awesome 6 Solid", "Font Awesome 5 Free", "FontAwesome" !important;
      font-style: normal !important;
      font-variant: normal !important;
      text-rendering: auto !important;
      -webkit-font-smoothing: antialiased !important;
      display: inline-block !important;
    }

    .fas { font-weight: 900 !important; }
    .far { font-weight: 400 !important; }
    .fab { font-weight: 400 !important; }

    /* Icone specifiche mancanti */
    .fas.fa-folder-plus::before { content: "\\f65e" !important; }
    .fas.fa-user-plus::before { content: "\\f234" !important; }
    .fas.fa-file-plus::before { content: "\\f319" !important; }
    .fas.fa-square-plus::before { content: "\\f0fe" !important; }

    /* Fix sidebar buttons */
    #sidebar button i.fas,
    #sidebar .action-buttons button i {
      font-family: "Font Awesome 6 Free", "Font Awesome 5 Free" !important;
      font-weight: 900 !important;
      display: inline-block !important;
    }

    /* Fix Create Folder button specifically */
    button[data-action="createFolder"] i::before,
    button[data-tooltip*="Create Folder"] i::before,
    button[title*="Create Folder"] i::before,
    .create-folder i::before {
      content: "\\f65e" !important;
      font-family: "Font Awesome 6 Free" !important;
      font-weight: 900 !important;
    }

    /* Fix Create buttons */
    button[data-action="create"] i.fa-plus::before {
      content: "\\f067" !important;
    }

    /* Debug: mostra contenuto per icone vuote */
    i[class*="fa-"]:empty::after {
      content: "?" !important;
      color: red !important;
      font-family: monospace !important;
      font-size: 12px !important;
    }
  `;
  document.head.appendChild(style);

  console.log('Brancalonia | Fix icone Font Awesome completato');
});

// Fix aggiuntivo per quando cambiano le tabs
Hooks.on('changeSidebarTab', (tab) => {
  console.log('Brancalonia | Fix icone dopo cambio tab:', tab.tabName);
  setTimeout(() => {
    const icons = document.querySelectorAll('#sidebar i[class*="fa-"]');
    icons.forEach(icon => {
      icon.style.fontFamily = '"Font Awesome 6 Free", "Font Awesome 5 Free"';
      if (icon.classList.contains('fas')) {
        icon.style.fontWeight = '900';
      }
    });
  }, 100);
});