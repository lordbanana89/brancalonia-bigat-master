/**
 * BRANCALONIA ICONS COMPLETE FIX
 * Mappatura completa di TUTTE le icone di Foundry VTT v13
 */

console.log('🎨 Brancalonia Icons Complete Fix - Initializing...');

// Mappatura COMPLETA delle icone Font Awesome usate da Foundry
const COMPLETE_ICON_MAP = {
  // Navigation & UI
  'fa-users': '\uf0c0',
  'fa-user': '\uf007',
  'fa-user-plus': '\uf234',
  'fa-user-friends': '\uf500',
  'fa-user-circle': '\uf2bd',
  'fa-user-check': '\uf4fc',
  'fa-user-times': '\uf235',
  'fa-user-xmark': '\uf235',
  'fa-user-edit': '\uf4ff',
  'fa-user-pen': '\uf4ff',

  // Folders & Files
  'fa-folder': '\uf07b',
  'fa-folder-open': '\uf07c',
  'fa-folder-plus': '\uf65e',
  'fa-folder-minus': '\uf65d',
  'fa-file': '\uf15b',
  'fa-file-plus': '\uf319',
  'fa-file-alt': '\uf15c',
  'fa-file-lines': '\uf15c',

  // Actions
  'fa-plus': '\uf067',
  'fa-plus-circle': '\uf055',
  'fa-circle-plus': '\uf055',
  'fa-plus-square': '\uf0fe',
  'fa-square-plus': '\uf0fe',
  'fa-minus': '\uf068',
  'fa-minus-circle': '\uf056',
  'fa-circle-minus': '\uf056',
  'fa-minus-square': '\uf146',
  'fa-square-minus': '\uf146',

  // Settings & Configuration
  'fa-cog': '\uf013',
  'fa-cogs': '\uf085',
  'fa-gear': '\uf013',
  'fa-gears': '\uf085',
  'fa-sliders-h': '\uf1de',
  'fa-sliders': '\uf1de',
  'fa-wrench': '\uf0ad',
  'fa-tools': '\uf7d9',

  // Media Controls
  'fa-backward': '\uf04a',
  'fa-fast-forward': '\uf050',

  // Time & Calendar
  'fa-clock': '\uf017',
  'fa-calendar-alt': '\uf073',

  // Books & Code
  'fa-book-atlas': '\uf558',
  'fa-book-open-reader': '\uf5da',
  'fa-code': '\uf121',

  // Compress/Expand
  'fa-compress-alt': '\uf422',
  'fa-compress': '\uf066',
  'fa-expand': '\uf065',

  // Carets/Arrows
  'fa-caret-down': '\uf0d7',
  'fa-caret-up': '\uf0d8',
  'fa-caret-left': '\uf0d9',
  'fa-caret-right': '\uf0da',
  'fa-screwdriver-wrench': '\uf7d9',

  // Module/Package icons
  'fa-cube': '\uf1b2',
  'fa-rectangles-mixed': '\ue323',
  'fa-cubes': '\uf1b3',
  'fa-box': '\uf466',
  'fa-boxes': '\uf468',
  'fa-package': '\uf49e',
  'fa-puzzle-piece': '\uf12e',

  // Search & Filter
  'fa-search': '\uf002',
  'fa-magnifying-glass': '\uf002',
  'fa-filter': '\uf0b0',

  // Edit & Delete
  'fa-edit': '\uf044',
  'fa-pen': '\uf304',
  'fa-pen-to-square': '\uf044',
  'fa-pencil': '\uf303',
  'fa-pencil-alt': '\uf303',
  'fa-trash': '\uf1f8',
  'fa-trash-alt': '\uf2ed',
  'fa-trash-can': '\uf2ed',

  // Navigation arrows
  'fa-chevron-up': '\uf077',
  'fa-chevron-down': '\uf078',
  'fa-chevron-left': '\uf053',
  'fa-chevron-right': '\uf054',
  'fa-angle-up': '\uf106',
  'fa-angle-down': '\uf107',
  'fa-angle-left': '\uf104',
  'fa-angle-right': '\uf105',
  'fa-arrow-up': '\uf062',
  'fa-arrow-down': '\uf063',
  'fa-arrow-left': '\uf060',
  'fa-arrow-right': '\uf061',

  // Common UI
  'fa-times': '\uf00d',
  'fa-xmark': '\uf00d',
  'fa-check': '\uf00c',
  'fa-check-circle': '\uf058',
  'fa-circle-check': '\uf058',
  'fa-times-circle': '\uf057',
  'fa-circle-xmark': '\uf057',
  'fa-exclamation': '\uf12a',
  'fa-exclamation-triangle': '\uf071',
  'fa-triangle-exclamation': '\uf071',
  'fa-info': '\uf129',
  'fa-info-circle': '\uf05a',
  'fa-circle-info': '\uf05a',
  'fa-question': '\uf128',
  'fa-question-circle': '\uf059',
  'fa-circle-question': '\uf059',

  // Menu & Lists
  'fa-bars': '\uf0c9',
  'fa-navicon': '\uf0c9',
  'fa-list': '\uf03a',
  'fa-list-ul': '\uf0ca',
  'fa-list-ol': '\uf0cb',
  'fa-th': '\uf00a',
  'fa-th-list': '\uf00b',
  'fa-th-large': '\uf009',
  'fa-grip': '\uf58d',
  'fa-grip-horizontal': '\uf58d',
  'fa-grip-vertical': '\uf58e',
  'fa-ellipsis-h': '\uf141',
  'fa-ellipsis': '\uf141',
  'fa-ellipsis-v': '\uf142',
  'fa-ellipsis-vertical': '\uf142',

  // Gaming icons
  'fa-dice': '\uf522',
  'fa-dice-d20': '\uf6cf',
  'fa-dice-d6': '\uf6d1',
  'fa-dragon': '\uf6d5',
  'fa-dungeon': '\uf6d9',
  'fa-scroll': '\uf70e',
  'fa-book-open': '\uf518',
  'fa-book': '\uf02d',
  'fa-bookmark': '\uf02e',
  'fa-atlas': '\uf558',
  'fa-map': '\uf279',
  'fa-map-marked': '\uf59f',
  'fa-map-marked-alt': '\uf5a0',
  'fa-compass': '\uf14e',

  // Communication
  'fa-comments': '\uf086',
  'fa-comment': '\uf075',
  'fa-comment-alt': '\uf27a',
  'fa-message': '\uf27a',
  'fa-envelope': '\uf0e0',
  'fa-bell': '\uf0f3',

  // Media
  'fa-image': '\uf03e',
  'fa-images': '\uf302',
  'fa-music': '\uf001',
  'fa-volume-up': '\uf028',
  'fa-volume-high': '\uf028',
  'fa-volume-down': '\uf027',
  'fa-volume-low': '\uf027',
  'fa-volume-off': '\uf026',
  'fa-volume-xmark': '\uf6a9',
  'fa-play': '\uf04b',
  'fa-pause': '\uf04c',
  'fa-stop': '\uf04d',

  // Visibility
  'fa-eye': '\uf06e',
  'fa-eye-slash': '\uf070',
  'fa-low-vision': '\uf2a8',
  'fa-mask': '\uf6fa',

  // Lock/Unlock
  'fa-lock': '\uf023',
  'fa-unlock': '\uf09c',
  'fa-lock-open': '\uf3c1',
  'fa-key': '\uf084',

  // Other common
  'fa-home': '\uf015',
  'fa-house': '\uf015',
  'fa-globe': '\uf0ac',
  'fa-download': '\uf019',
  'fa-upload': '\uf093',
  'fa-save': '\uf0c7',
  'fa-floppy-disk': '\uf0c7',
  'fa-sync': '\uf021',
  'fa-sync-alt': '\uf2f1',
  'fa-arrows-rotate': '\uf021',
  'fa-redo': '\uf01e',
  'fa-undo': '\uf0e2',
  'fa-copy': '\uf0c5',
  'fa-clone': '\uf24d',
  'fa-share': '\uf064',
  'fa-share-alt': '\uf1e0',
  'fa-share-nodes': '\uf1e0',
  'fa-external-link': '\uf08e',
  'fa-external-link-alt': '\uf35d',
  'fa-up-right-from-square': '\uf35d',
  'fa-link': '\uf0c1',
  'fa-unlink': '\uf127',
  'fa-chain': '\uf0c1',
  'fa-chain-broken': '\uf127',

  // Combat & Items
  'fa-suitcase': '\uf0f2',
  'fa-shield': '\uf132',
  'fa-shield-alt': '\uf3ed',
  'fa-shield-halved': '\uf3ed',
  'fa-sword': '\uf71c',
  'fa-swords': '\uf71d',
  'fa-fist-raised': '\uf6de',
  'fa-hand-fist': '\uf6de',
  'fa-heart': '\uf004',
  'fa-heartbeat': '\uf21e',
  'fa-heart-pulse': '\uf21e',
  'fa-skull': '\uf54c',
  'fa-skull-crossbones': '\uf714',
  'fa-crown': '\uf521',
  'fa-trophy': '\uf091',
  'fa-medal': '\uf5a2',
  'fa-star': '\uf005',
  'fa-star-half': '\uf089',
  'fa-star-half-alt': '\uf5c0',
  'fa-star-half-stroke': '\uf5c0',

  // Tables & Grids
  'fa-table': '\uf0ce',
  'fa-table-cells': '\uf00a',
  'fa-table-list': '\uf00b',
  'fa-border-all': '\uf84c',
  'fa-border-none': '\uf850',

  // System
  'fa-server': '\uf233',
  'fa-database': '\uf1c0',
  'fa-hdd': '\uf0a0',
  'fa-hard-drive': '\uf0a0',
  'fa-microchip': '\uf2db',
  'fa-memory': '\uf538',
  'fa-wifi': '\uf1eb',
  'fa-signal': '\uf012',
  'fa-plug': '\uf1e6',
  'fa-power-off': '\uf011',

  // D&D Specific (common in Foundry)
  'fa-hat-wizard': '\uf6e8',
  'fa-magic': '\uf0d0',
  'fa-wand-magic': '\uf0d0',
  'fa-wand-sparkles': '\uf72b',
  'fa-hand-sparkles': '\ue05d',
  'fa-fire': '\uf06d',
  'fa-fire-flame-curved': '\uf7e4',
  'fa-bolt': '\uf0e7',
  'fa-bolt-lightning': '\ue0b7',
  'fa-snowflake': '\uf2dc',
  'fa-sun': '\uf185',
  'fa-moon': '\uf186',
  'fa-cloud': '\uf0c2',
  'fa-wind': '\uf72e',
  'fa-water': '\uf773'
};

// Inizializza subito
(function initImmediate() {
  // Inietta font face con percorso corretto
  const fontFaceCSS = `
    @font-face {
      font-family: "BrancaloniaFA";
      font-style: normal;
      font-weight: 900;
      font-display: swap;
      src: local("Font Awesome 6 Free Solid"),
           local("Font Awesome 6 Free"),
           local("FontAwesome"),
           url("modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-solid-900.woff2") format("woff2"),
           url("modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-solid-900.ttf") format("truetype");
    }

    @font-face {
      font-family: "BrancaloniaFA";
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: local("Font Awesome 6 Free Regular"),
           local("Font Awesome 6 Free"),
           url("modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-regular-400.woff2") format("woff2"),
           url("modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-regular-400.ttf") format("truetype");
    }
  `;

  const fontStyle = document.createElement('style');
  fontStyle.id = 'brancalonia-complete-font';
  fontStyle.textContent = fontFaceCSS;

  if (document.head) {
    document.head.insertBefore(fontStyle, document.head.firstChild);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.head.insertBefore(fontStyle, document.head.firstChild);
    });
  }
})();

Hooks.once('init', () => {
  console.log('🎨 Injecting complete icon CSS...');

  // CSS per TUTTE le icone mappate
  const completeCSS = `
    /* Base per tutte le icone Font Awesome */
    i[class*="fa-"] {
      font-family: "BrancaloniaFA", "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome", sans-serif !important;
      font-style: normal !important;
      font-variant: normal !important;
      text-rendering: auto !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      display: inline-block !important;
      line-height: 1 !important;
    }

    /* Peso default per solid */
    i[class*="fa-"]:not(.far):not(.fal):not(.fab) {
      font-weight: 900 !important;
    }

    /* Peso per regular */
    i.far {
      font-weight: 400 !important;
    }

    /* Mappatura completa delle icone */
    ${Object.entries(COMPLETE_ICON_MAP).map(([cls, unicode]) => `
      i.${cls}::before,
      i.fas.${cls}::before,
      i.far.${cls}::before,
      .${cls}::before {
        content: "${unicode}" !important;
        font-family: "BrancaloniaFA", "Font Awesome 6 Free", "FontAwesome" !important;
        font-weight: 900 !important;
      }
    `).join('\n')}

    /* Fix specifici per Foundry UI */
    #sidebar .directory-header button i,
    #sidebar .action-buttons button i,
    #sidebar-tabs .item i,
    .app.window-app .window-header i,
    .scene-control i,
    .control-tool i {
      font-family: "BrancaloniaFA", "Font Awesome 6 Free", "FontAwesome" !important;
      font-weight: 900 !important;
    }

    /* Se proprio non carica, usa fallback testuale minimo */
    i[class*="fa-"]:empty::after {
      content: "•" !important;
      font-family: sans-serif !important;
    }
  `;

  const style = document.createElement('style');
  style.id = 'brancalonia-complete-icons';
  style.textContent = completeCSS;
  document.head.appendChild(style);

  console.log('✅ Complete icon mapping injected');
});

// Funzione per processare icone dinamicamente
function processIcon(icon) {
  if (!icon || icon.hasAttribute('data-complete-fixed')) return;

  // Classi di stile Font Awesome da ignorare
  const styleClasses = ['fa-duotone', 'fa-solid', 'fa-regular', 'fa-light', 'fa-thin',
                       'fa-brands', 'fas', 'far', 'fal', 'fat', 'fab', 'fad',
                       'fa-fw', 'fa-ul', 'fa-li', 'fa-spin', 'fa-pulse', 'fa-border',
                       'fa-pull-left', 'fa-pull-right', 'fa-stack', 'fa-inverse',
                       'fa-flip-horizontal', 'fa-flip-vertical', 'fa-rotate-90',
                       'fa-rotate-180', 'fa-rotate-270', 'fa-flip-both',
                       'fa-2x', 'fa-3x', 'fa-4x', 'fa-5x', 'fa-lg', 'fa-sm', 'fa-xs'];

  // Trova tutte le classi fa- che NON sono classi di stile
  const iconClasses = Array.from(icon.classList).filter(cls =>
    cls.startsWith('fa-') && !styleClasses.includes(cls)
  );

  // Trova la prima icona mappata
  let mappedIcon = null;
  for (const cls of iconClasses) {
    if (COMPLETE_ICON_MAP[cls]) {
      mappedIcon = cls;
      break;
    }
  }

  if (mappedIcon) {
    icon.style.fontFamily = '"BrancaloniaFA", "Font Awesome 6 Free", "FontAwesome"';
    icon.style.fontWeight = '900';
    icon.style.fontStyle = 'normal';
    icon.setAttribute('data-complete-fixed', 'true');
    icon.setAttribute('data-icon-unicode', COMPLETE_ICON_MAP[mappedIcon]);
  } else if (iconClasses.length > 0) {
    // Log solo icone vere non mappate, non classi di stile
    console.warn(`Unmapped icon: ${iconClasses.join(', ')}`);
  }
}

// Hook ready
Hooks.once('ready', () => {
  console.log('🎨 Processing all icons...');

  function processAll() {
    document.querySelectorAll('i[class*="fa-"]').forEach(processIcon);
  }

  processAll();

  // Observer per nuove icone
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.tagName === 'I' && node.className && node.className.includes('fa-')) {
            processIcon(node);
          }
          const icons = node.querySelectorAll?.('i[class*="fa-"]');
          if (icons) {
            icons.forEach(processIcon);
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Re-process su cambio tab
  Hooks.on('renderSidebarTab', () => {
    setTimeout(processAll, 100);
  });

  console.log('✅ Complete icon system active');
});

// Utility
window.CompleteFix = {
  status: () => {
    const all = document.querySelectorAll('i[class*="fa-"]');
    const fixed = document.querySelectorAll('i[data-complete-fixed]');
    const unmapped = [];

    all.forEach(icon => {
      if (!icon.hasAttribute('data-complete-fixed')) {
        const classes = Array.from(icon.classList).filter(cls => cls.startsWith('fa-'));
        if (classes.length > 0) {
          unmapped.push(classes.join(', '));
        }
      }
    });

    console.log(`Icons: ${fixed.length}/${all.length} fixed`);
    if (unmapped.length > 0) {
      console.log('Unmapped icons:', [...new Set(unmapped)]);
    }
  },

  fix: () => {
    document.querySelectorAll('i[class*="fa-"]').forEach(icon => {
      icon.removeAttribute('data-complete-fixed');
      processIcon(icon);
    });
    console.log('✅ Reprocessed all icons');
  },

  findUnmapped: () => {
    const unmapped = new Set();
    document.querySelectorAll('i[class*="fa-"]').forEach(icon => {
      const classes = Array.from(icon.classList).filter(cls => cls.startsWith('fa-'));
      classes.forEach(cls => {
        if (!COMPLETE_ICON_MAP[cls]) {
          unmapped.add(cls);
        }
      });
    });
    console.log('Unmapped icon classes:', Array.from(unmapped));
    return Array.from(unmapped);
  }
};

console.log(`
🎨 COMPLETE FIX COMMANDS:
- CompleteFix.status() - Check icon status
- CompleteFix.fix() - Reprocess all icons
- CompleteFix.findUnmapped() - Find unmapped icon classes
`);