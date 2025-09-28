/**
 * BRANCALONIA ICONS FALLBACK
 * Sistema di fallback per icone quando Font Awesome non carica
 */

(() => {
  console.log('🔍 Brancalonia Icons Fallback - Controllo icone...');

  // Mappa unicode diretta per le icone essenziali
  const iconMap = {
    'fa-user': '\uf007',
    'fa-user-plus': '\uf234',
    'fa-folder': '\uf07b',
    'fa-folder-plus': '\uf65e',
    'fa-plus': '\uf067',
    'fa-search': '\uf002',
    'fa-cog': '\uf013',
    'fa-users': '\uf0c0',
    'fa-dice-d20': '\uf6cf',
    'fa-comments': '\uf086',
    'fa-book': '\uf02d',
    'fa-map': '\uf279',
    'fa-music': '\uf001',
    'fa-atlas': '\uf558',
    'fa-suitcase': '\uf0f2',
    'fa-fist-raised': '\uf6de',
    'fa-table': '\uf0ce',
    'fa-th-list': '\uf00b'
  };

  // Controlla se Font Awesome è caricato
  function checkFontAwesome() {
    const testElement = document.createElement('i');
    testElement.className = 'fas fa-user';
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.style.fontFamily = '"Font Awesome 6 Free"';
    testElement.style.fontWeight = '900';
    document.body.appendChild(testElement);

    const styles = window.getComputedStyle(testElement, '::before');
    const fontFamily = styles.fontFamily || 'none';
    const content = styles.content || 'none';

    // Check anche un'icona reale nella sidebar
    const realIcon = document.querySelector('.directory-header i.fa-user-plus, .directory-header i.fa-folder-plus');
    let realIconInfo = 'No real icon found';
    if (realIcon) {
      const realStyles = window.getComputedStyle(realIcon, '::before');
      realIconInfo = {
        class: realIcon.className,
        fontFamily: realStyles.fontFamily || 'none',
        content: realStyles.content || 'none',
        display: realStyles.display || 'none'
      };
    }

    document.body.removeChild(testElement);

    // Se Font Awesome non è caricato, fontFamily non conterrà "Font Awesome"
    const isFontAwesomeLoaded = fontFamily &&
      (fontFamily.includes('Font Awesome') || fontFamily.includes('FontAwesome')) &&
      content && content !== 'none' && content !== '""' && content !== '"?"';

    console.log('🔍 === FONT AWESOME DETECTION ===');
    console.log('🔍 Test element - Font Family:', fontFamily);
    console.log('🔍 Test element - Content:', content);
    console.log('🔍 Real icon info:', realIconInfo);
    console.log('🔍 Font Awesome loaded:', isFontAwesomeLoaded);
    console.log('🔍 ==============================');

    return isFontAwesomeLoaded;
  }

  // Fix icone con approccio diretto
  function fixIconsDirect() {
    console.log('🔧 Applicando fix diretto icone...');

    const allIcons = document.querySelectorAll('i[class*="fa-"]');
    let fixedCount = 0;

    allIcons.forEach(icon => {
      // Estrai classe icona
      const classes = Array.from(icon.classList);
      let iconName = null;

      for (const cls of classes) {
        if (cls.startsWith('fa-') && cls !== 'fa-fw' && cls !== 'fa-spin') {
          iconName = cls;
          break;
        }
      }

      if (iconName && iconMap[iconName]) {
        // Rimuovi qualsiasi contenuto esistente
        icon.textContent = '';

        // Applica stili diretti
        icon.style.fontFamily = '"Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome", sans-serif';
        icon.style.fontWeight = '900';
        icon.style.fontStyle = 'normal';
        icon.style.display = 'inline-block';

        // Crea pseudo-elemento con ::before tramite data attribute
        icon.setAttribute('data-icon', iconMap[iconName]);
        fixedCount++;
      }
    });

    // Inietta CSS per data-icon
    if (fixedCount > 0) {
      const style = document.getElementById('brancalonia-icon-fallback-style') || document.createElement('style');
      style.id = 'brancalonia-icon-fallback-style';
      style.textContent = `
        i[data-icon]::before {
          content: attr(data-icon) !important;
          font-family: "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome" !important;
          font-weight: 900 !important;
        }

        /* Fix specifico per bottoni Create */
        button[data-action="create"] i[data-icon],
        button[data-action="createFolder"] i[data-icon] {
          margin-right: 0.25em;
        }

        /* Rimuovi placeholder ? se presente */
        i[data-icon]:empty::after {
          display: none !important;
        }
      `;

      if (!document.getElementById('brancalonia-icon-fallback-style')) {
        document.head.appendChild(style);
      }

      console.log(`✅ Fixed ${fixedCount} icone con fallback diretto`);
    }
  }

  // Verifica e applica fix
  function applyIconFix() {
    // Se Font Awesome non è caricato, usa fallback
    if (!checkFontAwesome()) {
      console.warn('⚠️ Font Awesome non caricato, uso fallback');
      fixIconsDirect();
    } else {
      console.log('✅ Font Awesome caricato correttamente');
      // Applica fix minimale comunque per sicurezza
      fixIconsDirect();
    }
  }

  // Esegui dopo che il DOM è pronto
  if (typeof Hooks !== 'undefined') {
    Hooks.once('ready', () => {
      console.log('🔍 Controllo icone dopo ready...');
      setTimeout(applyIconFix, 1000);
    });

    Hooks.on('renderSidebarTab', () => {
      setTimeout(applyIconFix, 200);
    });
  } else {
    // Fallback se Hooks non disponibile
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(applyIconFix, 1000);
      });
    } else {
      setTimeout(applyIconFix, 100);
    }
  }

  console.log('✅ Brancalonia Icons Fallback - Sistema attivo');
})();