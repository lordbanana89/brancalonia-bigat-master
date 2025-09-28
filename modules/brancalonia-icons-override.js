/**
 * BRANCALONIA ICONS OVERRIDE
 * Sovrascrive completamente il sistema di icone di Foundry
 */

console.log('⚡ Brancalonia Icons Override - STARTING');

// Override del metodo di Foundry che crea i bottoni
Hooks.once('init', () => {
  console.log('⚡ Overriding Foundry button creation...');

  // Intercetta la creazione di elementi HTML
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(this, tagName);

    // Se è un elemento <i>, scheduliamo un fix
    if (tagName.toLowerCase() === 'i') {
      setTimeout(() => {
        if (element.classList && element.classList.length > 0) {
          fixIconElement(element);
        }
      }, 0);
    }

    return element;
  };
});

// Funzione per fixare un elemento icona
function fixIconElement(icon) {
  // Mappa delle icone con i loro caratteri Unicode
  const iconMap = {
    'fa-user-plus': '➕👤',
    'fa-folder-plus': '➕📁',
    'fa-user': '👤',
    'fa-users': '👥',
    'fa-folder': '📁',
    'fa-folder-open': '📂',
    'fa-plus': '➕',
    'fa-search': '🔍',
    'fa-cog': '⚙️',
    'fa-cogs': '⚙️',
    'fa-dice-d20': '🎲',
    'fa-comments': '💬',
    'fa-book': '📚',
    'fa-atlas': '🗺️',
    'fa-map': '🗺️',
    'fa-music': '🎵',
    'fa-suitcase': '💼',
    'fa-fist-raised': '✊',
    'fa-table': '📊',
    'fa-th-list': '📋',
    'fa-trash': '🗑️',
    'fa-edit': '✏️',
    'fa-times': '❌',
    'fa-check': '✅',
    'fa-chevron-up': '⬆️',
    'fa-chevron-down': '⬇️',
    'fa-chevron-left': '⬅️',
    'fa-chevron-right': '➡️'
  };

  // Trova quale icona è
  let iconName = null;
  icon.classList.forEach(cls => {
    if (cls.startsWith('fa-') && iconMap[cls]) {
      iconName = cls;
    }
  });

  // Se abbiamo trovato l'icona, sostituiscila con emoji
  if (iconName && iconMap[iconName]) {
    icon.textContent = iconMap[iconName];
    icon.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    icon.style.fontSize = '14px';
    icon.style.fontStyle = 'normal';
    icon.style.fontWeight = 'normal';
    icon.style.display = 'inline-block';
    icon.style.width = 'auto';
    icon.style.lineHeight = '1';
  }
}

// Hook per quando il DOM è pronto
Hooks.once('ready', () => {
  console.log('⚡ Applying emoji fallback to all icons...');

  // Fixa tutte le icone esistenti
  function fixAllIcons() {
    document.querySelectorAll('i[class*="fa-"]').forEach(icon => {
      fixIconElement(icon);
    });
  }

  // Fix iniziale
  fixAllIcons();

  // Re-fix quando cambiano le tabs
  Hooks.on('renderSidebarTab', () => {
    setTimeout(fixAllIcons, 100);
  });

  // Re-fix quando si aprono finestre
  Hooks.on('renderApplication', () => {
    setTimeout(fixAllIcons, 100);
  });

  // Observer per nuove icone
  const observer = new MutationObserver((mutations) => {
    let needsFix = false;
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && (
            node.tagName === 'I' ||
            node.querySelector?.('i[class*="fa-"]')
          )) {
            needsFix = true;
          }
        });
      }
    });

    if (needsFix) {
      setTimeout(fixAllIcons, 50);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('✅ Emoji fallback system active');
});

// Override specifico per i bottoni Create
Hooks.on('renderSidebarDirectory', (app, html) => {
  console.log('⚡ Fixing directory buttons...');

  // Fix Create Actor button
  const createButton = html.find('button[data-action="create"]');
  createButton.each((i, btn) => {
    const icon = btn.querySelector('i');
    if (icon && icon.classList.contains('fa-user-plus')) {
      icon.textContent = '➕👤';
      icon.style.fontFamily = 'inherit';
    } else if (icon && icon.classList.contains('fa-plus')) {
      icon.textContent = '➕';
      icon.style.fontFamily = 'inherit';
    }
  });

  // Fix Create Folder button
  const folderButton = html.find('button[data-action="createFolder"]');
  folderButton.each((i, btn) => {
    const icon = btn.querySelector('i');
    if (icon) {
      icon.textContent = '➕📁';
      icon.style.fontFamily = 'inherit';
    }
  });

  // Fix search icon
  const searchIcon = html.find('.header-search i');
  searchIcon.each((i, icon) => {
    icon.textContent = '🔍';
    icon.style.fontFamily = 'inherit';
  });
});

// Funzione globale per fix manuale
window.fixIconsNow = function() {
  console.log('🔧 Manual icon fix...');
  document.querySelectorAll('i[class*="fa-"]').forEach(icon => {
    fixIconElement(icon);
  });
  console.log('✅ Done!');
};

console.log('💡 Use fixIconsNow() in console to manually fix icons');