/**
 * BRANCALONIA ICONS ULTIMATE FIX
 * Soluzione definitiva che sovrascrive completamente il sistema di icone
 */

console.log('⚡ Brancalonia Icons Ultimate Fix - Initializing...');

// Mappa completa delle icone con i loro caratteri Unicode
const ICON_MAP = {
  'fa-user-plus': '\uf234',
  'fa-folder-plus': '\uf65e',
  'fa-plus': '\uf067',
  'fa-user': '\uf007',
  'fa-users': '\uf0c0',
  'fa-folder': '\uf07b',
  'fa-folder-open': '\uf07c',
  'fa-search': '\uf002',
  'fa-cog': '\uf013',
  'fa-cogs': '\uf085',
  'fa-trash': '\uf1f8',
  'fa-trash-alt': '\uf2ed',
  'fa-edit': '\uf044',
  'fa-pen-to-square': '\uf044',
  'fa-times': '\uf00d',
  'fa-xmark': '\uf00d',
  'fa-check': '\uf00c',
  'fa-chevron-up': '\uf077',
  'fa-chevron-down': '\uf078',
  'fa-chevron-left': '\uf053',
  'fa-chevron-right': '\uf054',
  'fa-dice-d20': '\uf6cf',
  'fa-comments': '\uf086',
  'fa-book': '\uf02d',
  'fa-atlas': '\uf558',
  'fa-map': '\uf279',
  'fa-music': '\uf001',
  'fa-suitcase': '\uf0f2',
  'fa-fist-raised': '\uf6de',
  'fa-table': '\uf0ce',
  'fa-th-list': '\uf00b'
};

// Inizializza immediatamente
(function initImmediate() {
  // Inietta Font Face definitions SUBITO
  const fontFaceCSS = `
    @font-face {
      font-family: "BrancaloniaIcons";
      font-style: normal;
      font-weight: 900;
      font-display: block;
      src: url("modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-solid-900.woff2") format("woff2"),
           url("modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-solid-900.ttf") format("truetype");
    }

    @font-face {
      font-family: "BrancaloniaIcons";
      font-style: normal;
      font-weight: 400;
      font-display: block;
      src: url("modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-regular-400.woff2") format("woff2"),
           url("modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-regular-400.ttf") format("truetype");
    }
  `;

  const fontStyle = document.createElement('style');
  fontStyle.id = 'brancalonia-font-faces';
  fontStyle.textContent = fontFaceCSS;

  if (document.head) {
    document.head.insertBefore(fontStyle, document.head.firstChild);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.head.insertBefore(fontStyle, document.head.firstChild);
    });
  }
})();

// Hook principale
Hooks.once('init', () => {
  console.log('⚡ Overriding Foundry icon system...');

  // Override del metodo che crea elementi
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName, options) {
    const element = originalCreateElement.call(this, tagName, options);

    if (tagName.toLowerCase() === 'i') {
      // Schedule fix per icone
      Promise.resolve().then(() => {
        if (element.className && element.className.includes('fa-')) {
          processIcon(element);
        }
      });
    }

    return element;
  };

  // Inietta CSS principale
  const mainCSS = `
    /* Override completo per tutte le icone */
    i[class*="fa-"] {
      font-family: "BrancaloniaIcons", "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome" !important;
      font-style: normal !important;
      font-variant: normal !important;
      text-rendering: auto !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      display: inline-block !important;
      font-weight: 900 !important;
      line-height: 1 !important;
    }

    /* Force before content per ogni icona specifica */
    ${Object.entries(ICON_MAP).map(([cls, unicode]) => `
      i.${cls}::before,
      i.fas.${cls}::before,
      i.far.${cls}::before,
      .${cls}::before {
        content: "${unicode}" !important;
        font-family: "BrancaloniaIcons", "Font Awesome 6 Free" !important;
        font-weight: 900 !important;
      }
    `).join('\n')}

    /* Fix specifici per bottoni Foundry */
    button[data-action="create"] i::before {
      content: "\\f067" !important; /* plus */
    }

    button[data-action="create"][data-type="Actor"] i::before {
      content: "\\f234" !important; /* user-plus */
    }

    button[data-action="createFolder"] i::before,
    button[data-folder*="create"] i::before {
      content: "\\f65e" !important; /* folder-plus */
    }

    /* Fix per sidebar */
    #sidebar .directory-header button i {
      font-family: "BrancaloniaIcons", "Font Awesome 6 Free" !important;
      font-weight: 900 !important;
    }
  `;

  const style = document.createElement('style');
  style.id = 'brancalonia-icons-main';
  style.textContent = mainCSS;
  document.head.appendChild(style);
});

// Processa singola icona
function processIcon(icon) {
  if (!icon || icon.hasAttribute('data-icon-fixed')) return;

  // Trova quale icona è
  let iconClass = null;
  icon.classList.forEach(cls => {
    if (ICON_MAP[cls]) {
      iconClass = cls;
    }
  });

  if (iconClass) {
    // Applica stili inline come backup
    icon.style.fontFamily = '"BrancaloniaIcons", "Font Awesome 6 Free"';
    icon.style.fontWeight = '900';
    icon.style.fontStyle = 'normal';
    icon.setAttribute('data-icon-fixed', 'true');

    // Se l'icona è vuota, aggiungi il carattere direttamente
    if (!icon.textContent || icon.textContent.trim() === '') {
      // Non aggiungere testo, usa solo CSS
      icon.setAttribute('data-icon-char', ICON_MAP[iconClass]);
    }
  }
}

// Hook ready per fix finale
Hooks.once('ready', () => {
  console.log('⚡ Final icon fixes...');

  // Fix tutte le icone esistenti
  function fixAllIcons() {
    document.querySelectorAll('i[class*="fa-"]').forEach(processIcon);
  }

  // Fix iniziale
  fixAllIcons();

  // Observer per nuove icone
  const observer = new MutationObserver((mutations) => {
    let needsFix = false;

    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.tagName === 'I' && node.className && node.className.includes('fa-')) {
              processIcon(node);
            }
            const icons = node.querySelectorAll?.('i[class*="fa-"]');
            if (icons && icons.length > 0) {
              needsFix = true;
            }
          }
        });
      } else if (mutation.type === 'attributes' && mutation.target.tagName === 'I') {
        processIcon(mutation.target);
      }
    });

    if (needsFix) {
      requestAnimationFrame(fixAllIcons);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });

  // Fix per tabs
  Hooks.on('renderSidebarTab', (app, html, data) => {
    console.log(`⚡ Fixing icons for tab: ${app.tabName}`);
    setTimeout(() => {
      html[0]?.querySelectorAll('i[class*="fa-"]').forEach(processIcon);
    }, 0);
  });

  // Fix per applicazioni
  Hooks.on('renderApplication', (app, html, data) => {
    setTimeout(() => {
      html[0]?.querySelectorAll('i[class*="fa-"]').forEach(processIcon);
    }, 0);
  });

  console.log('✅ Icon Ultimate Fix active');
});

// Carica font direttamente
Hooks.once('setup', async () => {
  try {
    // Carica i font usando FontFace API
    const solidFont = new FontFace(
      'BrancaloniaIcons',
      'url(modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-solid-900.woff2)',
      { weight: '900', style: 'normal' }
    );

    await solidFont.load();
    document.fonts.add(solidFont);
    console.log('✅ BrancaloniaIcons font loaded');
  } catch (e) {
    console.warn('⚠️ Could not load font via FontFace API:', e);
  }
});

// Utility globali
window.UltimateFix = {
  status: () => {
    const all = document.querySelectorAll('i[class*="fa-"]');
    const fixed = document.querySelectorAll('i[data-icon-fixed]');
    console.log(`Icons: ${fixed.length}/${all.length} fixed`);

    // Controlla icone problematiche
    const problemIcons = ['fa-user-plus', 'fa-folder-plus'];
    problemIcons.forEach(cls => {
      const icons = document.querySelectorAll(`i.${cls}`);
      icons.forEach((icon, i) => {
        const computed = window.getComputedStyle(icon, '::before');
        console.log(`${cls}[${i}]:`, {
          content: computed.content,
          fontFamily: computed.fontFamily
        });
      });
    });
  },

  forcefix: () => {
    document.querySelectorAll('i[class*="fa-"]').forEach(icon => {
      icon.removeAttribute('data-icon-fixed');
      processIcon(icon);
    });
    console.log('✅ Force fixed all icons');
  },

  test: () => {
    // Crea icone di test
    const testContainer = document.createElement('div');
    testContainer.style.position = 'fixed';
    testContainer.style.top = '10px';
    testContainer.style.right = '10px';
    testContainer.style.background = 'white';
    testContainer.style.padding = '10px';
    testContainer.style.border = '2px solid black';
    testContainer.style.zIndex = '99999';

    const testIcons = ['fa-user-plus', 'fa-folder-plus', 'fa-plus'];
    testIcons.forEach(cls => {
      const icon = document.createElement('i');
      icon.className = `fas ${cls}`;
      icon.style.fontSize = '20px';
      icon.style.margin = '5px';
      testContainer.appendChild(icon);
      processIcon(icon);
    });

    document.body.appendChild(testContainer);

    setTimeout(() => {
      document.body.removeChild(testContainer);
    }, 5000);

    console.log('✅ Test icons shown for 5 seconds');
  }
};

console.log(`
🚀 ULTIMATE FIX COMMANDS:
- UltimateFix.status() - Check icon status
- UltimateFix.forcefix() - Force fix all icons
- UltimateFix.test() - Show test icons
`);