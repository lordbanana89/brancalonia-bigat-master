/**
 * Fix definitivo per le icone Font Awesome in Foundry v13
 * Risolve tutti i problemi di rendering delle icone
 */

Hooks.once('init', () => {
  console.log('Brancalonia | Inizializzazione fix icone Font Awesome v13');
});

// Fix immediato al caricamento del DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Brancalonia | Fix icone DOM ready');
    injectFontAwesomeFixes();
  });
} else {
  console.log('Brancalonia | Fix icone immediate');
  injectFontAwesomeFixes();
}

function injectFontAwesomeFixes() {
  // Inietta gli stili SUBITO
  const criticalStyles = document.createElement('style');
  criticalStyles.id = 'brancalonia-fa-critical-fix';
  criticalStyles.textContent = `
    /* CRITICAL FONT AWESOME FIX */
    @font-face {
      font-family: "Font Awesome 6 Free";
      font-style: normal;
      font-weight: 900;
      font-display: block;
      src: url("modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-solid-900.woff2") format("woff2");
    }

    i[class*="fa-"]::before,
    .fas::before, .far::before, .fab::before {
      font-family: "Font Awesome 6 Free" !important;
      font-weight: 900 !important;
      font-style: normal !important;
      display: inline-block !important;
    }

    /* Icone specifiche MUST WORK */
    i.fa-user-plus::before,
    .fa-user-plus::before { content: "\\f234" !important; }

    i.fa-folder-plus::before,
    .fa-folder-plus::before { content: "\\f65e" !important; }

    i.fa-plus::before,
    .fa-plus::before { content: "\\f067" !important; }

    i.fa-search::before,
    .fa-search::before { content: "\\f002" !important; }

    i.fa-user::before,
    .fa-user::before { content: "\\f007" !important; }

    i.fa-folder::before,
    .fa-folder::before { content: "\\f07b" !important; }
  `;

  // Inserisci come PRIMO elemento in head
  const firstChild = document.head.firstChild;
  if (firstChild) {
    document.head.insertBefore(criticalStyles, firstChild);
  } else {
    document.head.appendChild(criticalStyles);
  }

  console.log('✅ Critical Font Awesome fixes injected');
}

Hooks.once('ready', () => {
  console.log('Brancalonia | Applicazione fix icone Font Awesome avanzato');

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

  // Aggiungi stili globali AGGIUNTIVI via JavaScript
  if (!document.getElementById('brancalonia-fa-runtime-fix')) {
    const runtimeStyle = document.createElement('style');
    runtimeStyle.id = 'brancalonia-fa-runtime-fix';
    runtimeStyle.textContent = `
      /* RUNTIME Font Awesome Fix - Force Override Everything */

      /* Base font face definition */
      @font-face {
        font-family: "FA6Free";
        font-style: normal;
        font-weight: 900;
        src: url("modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-solid-900.woff2") format("woff2");
      }

      /* Force all FA icons to use our font */
      i[class*="fa-"]::before,
      i.fas::before, i.far::before, i.fab::before,
      .fas::before, .far::before, .fab::before {
        font-family: "FA6Free", "Font Awesome 6 Free" !important;
        font-weight: 900 !important;
        font-style: normal !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }

      /* MUST WORK - Create Actor/Folder buttons */
      button i.fa-user-plus::before,
      button i.fas.fa-user-plus::before,
      .fa-user-plus::before {
        content: "\\f234" !important;
        font-family: "FA6Free", "Font Awesome 6 Free" !important;
        font-weight: 900 !important;
      }

      button i.fa-folder-plus::before,
      button i.fas.fa-folder-plus::before,
      .fa-folder-plus::before {
        content: "\\f65e" !important;
        font-family: "FA6Free", "Font Awesome 6 Free" !important;
        font-weight: 900 !important;
      }

      /* Common icons */
      .fa-plus::before { content: "\\f067" !important; }
      .fa-search::before { content: "\\f002" !important; }
      .fa-user::before { content: "\\f007" !important; }
      .fa-users::before { content: "\\f0c0" !important; }
      .fa-folder::before { content: "\\f07b" !important; }
      .fa-folder-open::before { content: "\\f07c" !important; }
      .fa-cog::before { content: "\\f013" !important; }
      .fa-cogs::before { content: "\\f085" !important; }
      .fa-trash::before { content: "\\f1f8" !important; }
      .fa-edit::before { content: "\\f044" !important; }
      .fa-times::before { content: "\\f00d" !important; }
      .fa-check::before { content: "\\f00c" !important; }
      .fa-chevron-up::before { content: "\\f077" !important; }
      .fa-chevron-down::before { content: "\\f078" !important; }
      .fa-chevron-left::before { content: "\\f053" !important; }
      .fa-chevron-right::before { content: "\\f054" !important; }

      /* Sidebar specific */
      #sidebar button i[class*="fa-"]::before,
      #sidebar .directory-header i[class*="fa-"]::before {
        font-family: "FA6Free", "Font Awesome 6 Free" !important;
        font-weight: 900 !important;
      }
    `;
    document.head.appendChild(runtimeStyle);
    console.log('✅ Runtime Font Awesome overrides applied');
  }

  console.log('Brancalonia | Fix icone Font Awesome completato');
});

// Fix aggiuntivo per quando cambiano le tabs
Hooks.on('changeSidebarTab', (tab) => {
  console.log('Brancalonia | Fix icone dopo cambio tab:', tab.tabName);
  setTimeout(() => {
    const icons = document.querySelectorAll('#sidebar i[class*="fa-"]');
    icons.forEach(icon => {
      icon.style.fontFamily = '"FA6Free", "Font Awesome 6 Free", "Font Awesome 5 Free"';
      icon.style.fontWeight = '900';
      icon.style.fontStyle = 'normal';

      // Log debug per icone problematiche
      if (icon.classList.contains('fa-user-plus') || icon.classList.contains('fa-folder-plus')) {
        const computed = window.getComputedStyle(icon, '::before');
        console.log(`Icon ${icon.className}:`, {
          fontFamily: computed.fontFamily,
          content: computed.content,
          fontWeight: computed.fontWeight
        });
      }
    });
  }, 100);
});

// Funzione di debug globale
window.debugFontAwesome = function() {
  console.log('=== FONT AWESOME DEBUG ===');

  // Controlla se i font sono caricati
  document.fonts.ready.then(() => {
    const fonts = Array.from(document.fonts);
    const faFonts = fonts.filter(f => f.family.includes('Font Awesome') || f.family.includes('FA6Free'));
    console.log('Font Awesome fonts loaded:', faFonts);
  });

  // Controlla icone problematiche
  const problemIcons = document.querySelectorAll('.fa-user-plus, .fa-folder-plus');
  problemIcons.forEach(icon => {
    const computed = window.getComputedStyle(icon, '::before');
    console.log(`Icon ${icon.className}:`, {
      element: icon,
      fontFamily: computed.fontFamily,
      content: computed.content,
      fontWeight: computed.fontWeight,
      display: computed.display
    });
  });

  console.log('Use window.fixFontAwesome() to force fix all icons');
};

// Funzione di fix manuale
window.fixFontAwesome = function() {
  console.log('Forcing Font Awesome fix...');

  // Ricarica il font forzatamente
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = 'font/woff2';
  link.href = 'modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-solid-900.woff2';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);

  // Applica fix a tutte le icone
  document.querySelectorAll('i[class*="fa-"]').forEach(icon => {
    icon.style.fontFamily = '"FA6Free", "Font Awesome 6 Free"';
    icon.style.fontWeight = '900';
    icon.style.fontStyle = 'normal';
    icon.style.display = 'inline-block';
  });

  console.log('Fix applied. Check icons now.');
};