/**
 * BRANCALONIA ICONS TEXT FALLBACK
 * Sostituisce completamente le icone Font Awesome con testo
 */

console.log('📝 Brancalonia Icons Text Fallback - Starting...');

// Mappa icone -> testo
const ICON_TEXT_MAP = {
  'fa-user-plus': '[+U]',
  'fa-folder-plus': '[+F]',
  'fa-plus': '[+]',
  'fa-user': '[U]',
  'fa-users': '[UU]',
  'fa-folder': '[F]',
  'fa-folder-open': '[Fo]',
  'fa-search': '[S]',
  'fa-cog': '[⚙]',
  'fa-cogs': '[⚙⚙]',
  'fa-trash': '[X]',
  'fa-trash-alt': '[X]',
  'fa-edit': '[E]',
  'fa-pen-to-square': '[E]',
  'fa-times': '[×]',
  'fa-xmark': '[×]',
  'fa-check': '[✓]',
  'fa-chevron-up': '[↑]',
  'fa-chevron-down': '[↓]',
  'fa-chevron-left': '[←]',
  'fa-chevron-right': '[→]',
  'fa-dice-d20': '[D20]',
  'fa-comments': '[💬]',
  'fa-book': '[📚]',
  'fa-atlas': '[🗺]',
  'fa-map': '[🗺]',
  'fa-music': '[♫]',
  'fa-suitcase': '[💼]',
  'fa-fist-raised': '[✊]',
  'fa-table': '[▦]',
  'fa-th-list': '[☰]'
};

// Funzione per sostituire icona con testo
function replaceIconWithText(icon) {
  if (!icon || icon.hasAttribute('data-text-replaced')) return;

  // Trova quale icona è
  let iconText = null;
  icon.classList.forEach(cls => {
    if (ICON_TEXT_MAP[cls]) {
      iconText = ICON_TEXT_MAP[cls];
    }
  });

  if (iconText) {
    // Sostituisci contenuto con testo
    icon.textContent = iconText;
    icon.style.fontFamily = 'monospace';
    icon.style.fontSize = '12px';
    icon.style.fontWeight = 'bold';
    icon.style.fontStyle = 'normal';
    icon.style.display = 'inline-block';
    icon.style.minWidth = '20px';
    icon.style.textAlign = 'center';
    icon.setAttribute('data-text-replaced', 'true');
  }
}

// Hook principale
Hooks.once('ready', () => {
  console.log('📝 Applying text fallback to all icons...');

  // Sostituisci tutte le icone esistenti
  function replaceAll() {
    document.querySelectorAll('i[class*="fa-"]').forEach(replaceIconWithText);
  }

  // Sostituisci inizialmente
  replaceAll();

  // Observer per nuove icone
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.tagName === 'I' && node.className && node.className.includes('fa-')) {
            replaceIconWithText(node);
          }
          const icons = node.querySelectorAll?.('i[class*="fa-"]');
          if (icons) {
            icons.forEach(replaceIconWithText);
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Hook per re-applicare quando cambiano le tabs
  Hooks.on('renderSidebarTab', () => {
    setTimeout(replaceAll, 100);
  });

  Hooks.on('renderApplication', () => {
    setTimeout(replaceAll, 100);
  });

  console.log('✅ Text fallback system active');
});

// Utility globali
window.TextFallback = {
  apply: () => {
    document.querySelectorAll('i[class*="fa-"]').forEach(icon => {
      icon.removeAttribute('data-text-replaced');
      replaceIconWithText(icon);
    });
    console.log('✅ Text fallback applied to all icons');
  },

  status: () => {
    const all = document.querySelectorAll('i[class*="fa-"]');
    const replaced = document.querySelectorAll('i[data-text-replaced]');
    console.log(`Icons: ${replaced.length}/${all.length} replaced with text`);
  }
};

console.log(`
📝 TEXT FALLBACK COMMANDS:
- TextFallback.apply() - Apply text to all icons
- TextFallback.status() - Check replacement status
`);