/**
 * BRANCALONIA ICONS NATIVE FIX
 * Approccio che usa il sistema nativo di Foundry per Font Awesome
 * Basato su come moduli UI professionali gestiscono le icone
 */

console.log('🎮 Brancalonia Icons Native Fix - Starting...');

// Aspetta che Foundry carichi completamente Font Awesome
Hooks.once('setup', async () => {
  console.log('🎮 Waiting for Foundry Font Awesome...');

  // Foundry v13 usa Font Awesome 6.7.2 internamente
  // Dobbiamo solo assicurarci che sia caricato correttamente

  // Verifica che Font Awesome di Foundry sia caricato
  const checkFoundryFonts = async () => {
    try {
      // Foundry carica Font Awesome da resources/app/public/fonts/fontawesome/
      // Verifichiamo che sia disponibile
      await document.fonts.ready;

      // Cerca Font Awesome nei font di sistema
      let faLoaded = false;
      for (const font of document.fonts.values()) {
        if (font.family.includes('Font Awesome') || font.family.includes('FontAwesome')) {
          faLoaded = true;
          console.log(`✅ Found system font: ${font.family} (${font.weight})`);
        }
      }

      if (!faLoaded) {
        console.warn('⚠️ Font Awesome not detected in system fonts');
        return false;
      }

      return true;
    } catch (e) {
      console.error('❌ Error checking fonts:', e);
      return false;
    }
  };

  const systemFontsLoaded = await checkFoundryFonts();

  if (!systemFontsLoaded) {
    console.log('🔄 Font Awesome not loaded from Foundry, using fallback...');
    loadFallbackFonts();
  }
});

// Fallback: Carica i nostri font se Foundry non li ha caricati
function loadFallbackFonts() {
  console.log('📦 Loading fallback fonts...');

  // Crea un link al CSS di Font Awesome del modulo
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'modules/brancalonia-bigat/assets/fonts/fontawesome/css/all.min.css';
  link.onload = () => console.log('✅ Fallback Font Awesome CSS loaded');
  document.head.appendChild(link);
}

// Hook principale per fixare le icone dopo il rendering
Hooks.once('ready', () => {
  console.log('🎮 Applying icon fixes...');

  // Stili CSS inline per garantire che funzionino
  const criticalCSS = `
    /* Reset base per tutte le icone Font Awesome */
    i[class*="fa-"]:not(.fab):not(.fal):not(.fat):not(.fad):not(.fass),
    i.fas,
    i.far {
      font-family: "Font Awesome 6", "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome" !important;
      font-style: normal !important;
      font-variant: normal !important;
      text-rendering: auto !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      display: inline-block !important;
      line-height: 1 !important;
    }

    /* Peso corretto per solid icons (default) */
    i[class*="fa-"]:not(.far):not(.fal):not(.fat),
    i.fas {
      font-weight: 900 !important;
    }

    /* Peso per regular icons */
    i.far {
      font-weight: 400 !important;
    }

    /* Fix specifico per bottoni della sidebar */
    #sidebar .directory .directory-header .header-control i,
    #sidebar .directory .directory-header button i,
    #sidebar button[data-action] i,
    #sidebar button[data-folder] i {
      font-family: "Font Awesome 6", "Font Awesome 6 Free", "FontAwesome" !important;
      font-weight: 900 !important;
      font-style: normal !important;
    }

    /* Mappatura Unicode per icone essenziali */
    i.fa-user-plus::before,
    i.fas.fa-user-plus::before {
      content: "\\f234" !important;
    }

    i.fa-folder-plus::before,
    i.fas.fa-folder-plus::before {
      content: "\\f65e" !important;
    }

    i.fa-plus::before,
    i.fas.fa-plus::before {
      content: "\\f067" !important;
    }

    i.fa-user::before,
    i.fas.fa-user::before {
      content: "\\f007" !important;
    }

    i.fa-users::before,
    i.fas.fa-users::before {
      content: "\\f0c0" !important;
    }

    i.fa-folder::before,
    i.fas.fa-folder::before {
      content: "\\f07b" !important;
    }

    i.fa-folder-open::before,
    i.fas.fa-folder-open::before {
      content: "\\f07c" !important;
    }

    i.fa-search::before,
    i.fas.fa-search::before {
      content: "\\f002" !important;
    }

    i.fa-cog::before,
    i.fas.fa-cog::before {
      content: "\\f013" !important;
    }

    i.fa-cogs::before,
    i.fas.fa-cogs::before {
      content: "\\f085" !important;
    }

    i.fa-trash::before,
    i.fas.fa-trash::before {
      content: "\\f1f8" !important;
    }

    i.fa-trash-alt::before,
    i.fas.fa-trash-alt::before {
      content: "\\f2ed" !important;
    }

    i.fa-edit::before,
    i.fas.fa-edit::before,
    i.fa-pen-to-square::before {
      content: "\\f044" !important;
    }

    i.fa-times::before,
    i.fas.fa-times::before,
    i.fa-xmark::before {
      content: "\\f00d" !important;
    }

    i.fa-check::before,
    i.fas.fa-check::before {
      content: "\\f00c" !important;
    }

    /* Icone direzionali */
    i.fa-chevron-up::before { content: "\\f077" !important; }
    i.fa-chevron-down::before { content: "\\f078" !important; }
    i.fa-chevron-left::before { content: "\\f053" !important; }
    i.fa-chevron-right::before { content: "\\f054" !important; }

    /* Icone gaming */
    i.fa-dice-d20::before { content: "\\f6cf" !important; }
    i.fa-comments::before { content: "\\f086" !important; }
    i.fa-book::before { content: "\\f02d" !important; }
    i.fa-atlas::before { content: "\\f558" !important; }
    i.fa-map::before { content: "\\f279" !important; }
    i.fa-music::before { content: "\\f001" !important; }
    i.fa-suitcase::before { content: "\\f0f2" !important; }
    i.fa-fist-raised::before { content: "\\f6de" !important; }
    i.fa-table::before { content: "\\f0ce" !important; }
    i.fa-th-list::before { content: "\\f00b" !important; }

    /* Fix per bottoni Create specifici di Foundry v13 */
    button[data-action="create"][data-type="Actor"] i::before,
    button[data-tooltip*="Create Actor"] i::before {
      content: "\\f234" !important; /* user-plus */
      font-family: "Font Awesome 6", "Font Awesome 6 Free" !important;
      font-weight: 900 !important;
    }

    button[data-action="create"][data-type="Item"] i::before,
    button[data-tooltip*="Create Item"] i::before {
      content: "\\f067" !important; /* plus */
      font-family: "Font Awesome 6", "Font Awesome 6 Free" !important;
      font-weight: 900 !important;
    }

    button[data-action="createFolder"] i::before,
    button[data-folder-action="create"] i::before,
    button[data-tooltip*="Create Folder"] i::before {
      content: "\\f65e" !important; /* folder-plus */
      font-family: "Font Awesome 6", "Font Awesome 6 Free" !important;
      font-weight: 900 !important;
    }

    /* Evita che le icone mostrino il "?" */
    i[class*="fa-"]:empty::before {
      font-family: "Font Awesome 6", "Font Awesome 6 Free", "FontAwesome" !important;
      font-weight: 900 !important;
    }
  `;

  // Inietta CSS con alta priorità
  const style = document.createElement('style');
  style.id = 'brancalonia-icons-critical';
  style.textContent = criticalCSS;

  // Inserisci come ultimo elemento per avere massima priorità
  document.head.appendChild(style);

  console.log('✅ Critical icon CSS injected');

  // Applica fix dinamici
  applyDynamicFixes();
});

// Fix dinamici per icone che vengono create dopo il caricamento
function applyDynamicFixes() {
  // Observer per nuove icone aggiunte al DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Element node
          // Cerca icone Font Awesome
          const icons = node.querySelectorAll?.('i[class*="fa-"]') || [];
          if (node.matches?.('i[class*="fa-"]')) {
            fixIcon(node);
          }
          icons.forEach(fixIcon);
        }
      });
    });
  });

  // Osserva tutto il documento
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Fix iniziale per tutte le icone esistenti
  document.querySelectorAll('i[class*="fa-"]').forEach(fixIcon);
}

// Funzione per fixare singola icona
function fixIcon(icon) {
  // Non modificare se già ha contenuto visibile
  const computed = window.getComputedStyle(icon, '::before');
  if (computed.content && computed.content !== 'none' && computed.content !== '""') {
    return;
  }

  // Applica stili inline come backup
  icon.style.fontFamily = '"Font Awesome 6", "Font Awesome 6 Free", "FontAwesome"';
  icon.style.fontWeight = '900';
  icon.style.fontStyle = 'normal';
  icon.style.display = 'inline-block';
}

// Hook per ri-applicare fix quando cambiano le tabs
Hooks.on('renderSidebarTab', (app, html) => {
  setTimeout(() => {
    console.log(`🔧 Re-fixing icons for tab: ${app.tabName}`);
    html.find('i[class*="fa-"]').each((i, el) => fixIcon(el));
  }, 100);
});

// Hook per finestre e dialoghi
Hooks.on('renderDialog', (app, html) => {
  setTimeout(() => {
    html.find('i[class*="fa-"]').each((i, el) => fixIcon(el));
  }, 100);
});

Hooks.on('renderApplication', (app, html) => {
  setTimeout(() => {
    html.find('i[class*="fa-"]').each((i, el) => fixIcon(el));
  }, 100);
});

// Utility globali per debug
window.IconFix = {
  check: () => {
    const icons = document.querySelectorAll('i[class*="fa-"]');
    let broken = 0;
    let working = 0;

    icons.forEach(icon => {
      const computed = window.getComputedStyle(icon, '::before');
      if (!computed.content || computed.content === 'none' || computed.content === '""') {
        broken++;
        console.warn('Broken icon:', icon);
      } else {
        working++;
      }
    });

    console.log(`Icons: ${working} working, ${broken} broken out of ${icons.length} total`);
    return { working, broken, total: icons.length };
  },

  fix: () => {
    document.querySelectorAll('i[class*="fa-"]').forEach(fixIcon);
    console.log('✅ Applied fix to all icons');
  },

  reload: () => {
    // Ricarica Font Awesome CSS
    const links = document.querySelectorAll('link[href*="fontawesome"]');
    links.forEach(link => {
      const newLink = link.cloneNode();
      newLink.href = link.href + '?t=' + Date.now();
      link.parentNode.replaceChild(newLink, link);
    });
    console.log('✅ Reloaded Font Awesome CSS');
  }
};

console.log(`
🛠️ ICON FIX UTILITIES:
- IconFix.check() - Check icon status
- IconFix.fix() - Apply fix to all icons
- IconFix.reload() - Reload Font Awesome CSS
`);