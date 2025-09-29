/**
 * BRANCALONIA ICONS AUTO FIX
 * Sistema che rileva e fixa automaticamente TUTTE le icone
 */

console.log('🤖 Brancalonia Icons Auto Fix - Starting...');

// Database Unicode esteso per Font Awesome 6
const FA6_UNICODE_MAP = {
  // Aggiunte mancanti comuni
  'fa-atlas': '\uf558',
  'fa-book-solid': '\uf02d',
  'fa-book-open-solid': '\uf518',
  'fa-certificate': '\uf0a3',
  'fa-id-card': '\uf2c2',
  'fa-landmark': '\uf66f',
  'fa-scroll': '\uf70e',
  'fa-theater-masks': '\uf630',
  'fa-masks-theater': '\uf630',
  'fa-dragon': '\uf6d5',
  'fa-dungeon': '\uf6d9',
  'fa-hat-wizard': '\uf6e8',
  'fa-magic': '\uf0d0',
  'fa-wand-magic': '\uf0d0',
  'fa-wand-magic-sparkles': '\ue2ca',
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
  'fa-water': '\uf773',
  'fa-droplet': '\uf043',
  'fa-tint': '\uf043',

  // Sistema e UI
  'fa-bars': '\uf0c9',
  'fa-navicon': '\uf0c9',
  'fa-bars-staggered': '\uf550',
  'fa-stream': '\uf550',
  'fa-grip': '\uf58d',
  'fa-grip-horizontal': '\uf58d',
  'fa-grip-vertical': '\uf58e',
  'fa-grip-lines': '\uf7a4',
  'fa-grip-lines-vertical': '\uf7a5',
  'fa-ellipsis': '\uf141',
  'fa-ellipsis-h': '\uf141',
  'fa-ellipsis-v': '\uf142',
  'fa-ellipsis-vertical': '\uf142',

  // Tutti i cubi e boxes
  'fa-cube': '\uf1b2',
  'fa-cubes': '\uf1b3',
  'fa-cubes-stacked': '\ue4e6',
  'fa-box': '\uf466',
  'fa-boxes': '\uf468',
  'fa-boxes-stacked': '\uf468',
  'fa-boxes-packing': '\ue4c7',
  'fa-box-archive': '\uf187',
  'fa-archive': '\uf187',
  'fa-box-open': '\uf49e',
  'fa-package': '\uf49e',

  // Puzzle
  'fa-puzzle-piece': '\uf12e',

  // Settings vari
  'fa-cog': '\uf013',
  'fa-cogs': '\uf085',
  'fa-gear': '\uf013',
  'fa-gears': '\uf085',
  'fa-sliders': '\uf1de',
  'fa-sliders-h': '\uf1de',
  'fa-tools': '\uf7d9',
  'fa-screwdriver-wrench': '\uf7d9',
  'fa-wrench': '\uf0ad',
  'fa-hammer': '\uf6e3',
  'fa-toolbox': '\uf552',

  // Users & People
  'fa-user': '\uf007',
  'fa-users': '\uf0c0',
  'fa-user-plus': '\uf234',
  'fa-user-minus': '\uf503',
  'fa-user-check': '\uf4fc',
  'fa-user-xmark': '\uf235',
  'fa-user-times': '\uf235',
  'fa-user-slash': '\uf506',
  'fa-user-edit': '\uf4ff',
  'fa-user-pen': '\uf4ff',
  'fa-user-gear': '\uf4fe',
  'fa-user-cog': '\uf4fe',
  'fa-user-shield': '\uf505',
  'fa-user-lock': '\uf502',
  'fa-user-secret': '\uf21b',
  'fa-user-ninja': '\uf504',
  'fa-user-astronaut': '\uf4fb',
  'fa-user-tie': '\uf508',
  'fa-user-tag': '\uf507',
  'fa-user-circle': '\uf2bd',
  'fa-user-friends': '\uf500',
  'fa-user-group': '\uf500',
  'fa-users-gear': '\uf509',
  'fa-users-cog': '\uf509',
  'fa-people-group': '\ue533',

  // Folders & Files
  'fa-folder': '\uf07b',
  'fa-folder-open': '\uf07c',
  'fa-folder-plus': '\uf65e',
  'fa-folder-minus': '\uf65d',
  'fa-folder-tree': '\uf802',
  'fa-folder-closed': '\ue185',
  'fa-folder-blank': '\uf07b',
  'fa-file': '\uf15b',
  'fa-file-alt': '\uf15c',
  'fa-file-lines': '\uf15c',
  'fa-file-text': '\uf15c',
  'fa-file-plus': '\uf319',
  'fa-file-circle-plus': '\ue494',
  'fa-file-export': '\uf56e',
  'fa-file-import': '\uf56f',
  'fa-file-download': '\uf56d',
  'fa-file-upload': '\uf574',
  'fa-file-pen': '\uf31c',
  'fa-file-edit': '\uf31c',
  'fa-file-signature': '\uf573',
  'fa-file-shield': '\ue4f0',
  'fa-file-code': '\uf1c9',
  'fa-file-pdf': '\uf1c1',
  'fa-file-image': '\uf1c5',
  'fa-file-video': '\uf1c8',
  'fa-file-audio': '\uf1c7',
  'fa-file-zipper': '\uf1c6',
  'fa-file-archive': '\uf1c6',
  'fa-file-csv': '\uf6dd',

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
  'fa-xmark': '\uf00d',
  'fa-times': '\uf00d',
  'fa-times-circle': '\uf057',
  'fa-circle-xmark': '\uf057',
  'fa-xmark-circle': '\uf057',
  'fa-times-square': '\uf2d3',
  'fa-square-xmark': '\uf2d3',
  'fa-check': '\uf00c',
  'fa-check-circle': '\uf058',
  'fa-circle-check': '\uf058',
  'fa-check-square': '\uf14a',
  'fa-square-check': '\uf14a',
  'fa-check-double': '\uf560',

  // Edit & Modify
  'fa-edit': '\uf044',
  'fa-pen': '\uf304',
  'fa-pen-to-square': '\uf044',
  'fa-pen-square': '\uf044',
  'fa-pencil': '\uf303',
  'fa-pencil-alt': '\uf303',
  'fa-pen-alt': '\uf305',
  'fa-pen-fancy': '\uf5ac',
  'fa-pen-nib': '\uf5ad',
  'fa-pen-ruler': '\uf5ae',
  'fa-pen-clip': '\uf305',
  'fa-paperclip': '\uf305',
  'fa-eraser': '\uf12d',

  // Delete
  'fa-trash': '\uf1f8',
  'fa-trash-alt': '\uf2ed',
  'fa-trash-can': '\uf2ed',
  'fa-trash-arrow-up': '\uf829',
  'fa-trash-restore': '\uf829',
  'fa-trash-restore-alt': '\uf82a',
  'fa-trash-can-arrow-up': '\uf82a',
  'fa-dumpster': '\uf793',
  'fa-dumpster-fire': '\uf794',
  'fa-recycle': '\uf1b8',

  // Search & Filter
  'fa-search': '\uf002',
  'fa-magnifying-glass': '\uf002',
  'fa-search-plus': '\uf00e',
  'fa-magnifying-glass-plus': '\uf00e',
  'fa-search-minus': '\uf010',
  'fa-magnifying-glass-minus': '\uf010',
  'fa-magnifying-glass-location': '\uf689',
  'fa-search-location': '\uf689',
  'fa-magnifying-glass-dollar': '\uf688',
  'fa-search-dollar': '\uf688',
  'fa-magnifying-glass-chart': '\ue522',
  'fa-magnifying-glass-arrow-right': '\ue521',
  'fa-filter': '\uf0b0',
  'fa-filter-circle-dollar': '\uf662',
  'fa-filter-circle-xmark': '\ue17b',
  'fa-funnel': '\uf0b0',
  'fa-sort': '\uf0dc',
  'fa-sort-up': '\uf0de',
  'fa-sort-down': '\uf0dd',
  'fa-sort-alpha-up': '\uf15e',
  'fa-sort-alpha-down': '\uf15d',
  'fa-sort-alpha-asc': '\uf15d',
  'fa-sort-alpha-desc': '\uf15e',
  'fa-sort-numeric-up': '\uf163',
  'fa-sort-numeric-down': '\uf162',
  'fa-sort-numeric-asc': '\uf162',
  'fa-sort-numeric-desc': '\uf163',
  'fa-sort-amount-up': '\uf161',
  'fa-sort-amount-down': '\uf160',
  'fa-sort-amount-asc': '\uf160',
  'fa-sort-amount-desc': '\uf161',

  // Chevrons & Angles
  'fa-chevron-up': '\uf077',
  'fa-chevron-down': '\uf078',
  'fa-chevron-left': '\uf053',
  'fa-chevron-right': '\uf054',
  'fa-chevron-circle-up': '\uf139',
  'fa-chevron-circle-down': '\uf13a',
  'fa-chevron-circle-left': '\uf137',
  'fa-chevron-circle-right': '\uf138',
  'fa-circle-chevron-up': '\uf139',
  'fa-circle-chevron-down': '\uf13a',
  'fa-circle-chevron-left': '\uf137',
  'fa-circle-chevron-right': '\uf138',
  'fa-angle-up': '\uf106',
  'fa-angle-down': '\uf107',
  'fa-angle-left': '\uf104',
  'fa-angle-right': '\uf105',
  'fa-angle-double-up': '\uf102',
  'fa-angle-double-down': '\uf103',
  'fa-angle-double-left': '\uf100',
  'fa-angle-double-right': '\uf101',
  'fa-angles-up': '\uf102',
  'fa-angles-down': '\uf103',
  'fa-angles-left': '\uf100',
  'fa-angles-right': '\uf101',

  // Arrows
  'fa-arrow-up': '\uf062',
  'fa-arrow-down': '\uf063',
  'fa-arrow-left': '\uf060',
  'fa-arrow-right': '\uf061',
  'fa-arrow-up-right': '\ue09f',
  'fa-arrow-up-left': '\ue09d',
  'fa-arrow-down-right': '\ue093',
  'fa-arrow-down-left': '\ue091',
  'fa-arrow-rotate-left': '\uf0e2',
  'fa-arrow-rotate-right': '\uf01e',
  'fa-arrow-left-rotate': '\uf0e2',
  'fa-arrow-right-rotate': '\uf01e',
  'fa-undo': '\uf0e2',
  'fa-redo': '\uf01e',
  'fa-undo-alt': '\uf2ea',
  'fa-redo-alt': '\uf2f9',
  'fa-rotate-left': '\uf2ea',
  'fa-rotate-right': '\uf2f9',
  'fa-rotate': '\uf021',
  'fa-sync': '\uf021',
  'fa-sync-alt': '\uf2f1',
  'fa-arrows-rotate': '\uf021',
  'fa-refresh': '\uf021',
  'fa-retweet': '\uf079',
  'fa-repeat': '\uf363',
  'fa-arrow-right-arrow-left': '\uf0ec',
  'fa-exchange': '\uf0ec',
  'fa-exchange-alt': '\uf362',
  'fa-right-left': '\uf362',
  'fa-arrows-left-right': '\uf07e',
  'fa-arrows-h': '\uf07e',
  'fa-arrows-up-down': '\uf07d',
  'fa-arrows-v': '\uf07d',
  'fa-maximize': '\uf31e',
  'fa-up-right-and-down-left-from-center': '\ue0a0',
  'fa-expand': '\uf065',
  'fa-expand-alt': '\uf424',
  'fa-expand-arrows-alt': '\uf31e',
  'fa-compress': '\uf066',
  'fa-compress-alt': '\uf422',
  'fa-compress-arrows-alt': '\uf78c',
  'fa-minimize': '\uf78c',
  'fa-down-left-and-up-right-to-center': '\uf422'
};

// Sistema di fix automatico
class AutoIconFixer {
  constructor() {
    this.fixedIcons = new Set();
    this.styleElement = null;
    this.initStyles();
  }

  initStyles() {
    // Crea elemento style per tutti i fix
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'brancalonia-auto-fixes';
    document.head.appendChild(this.styleElement);

    // Stili base
    this.styleElement.textContent = `
      /* Auto Fix Base Styles */
      i[class*="fa-"] {
        font-family: "Font Awesome 6 Free", "Font Awesome 6 Brands", "Font Awesome 5 Free", "FontAwesome", sans-serif !important;
        font-style: normal !important;
        font-variant: normal !important;
        text-rendering: auto !important;
        -webkit-font-smoothing: antialiased !important;
        display: inline-block !important;
        line-height: 1 !important;
      }

      i[class*="fa-"]:not(.far):not(.fal):not(.fab) {
        font-weight: 900 !important;
      }

      i.far {
        font-weight: 400 !important;
      }
    `;

    // Aggiungi tutte le mappature conosciute
    this.addAllKnownMappings();
  }

  addAllKnownMappings() {
    let css = '\n/* Known Icon Mappings */\n';

    for (const [iconClass, unicode] of Object.entries(FA6_UNICODE_MAP)) {
      css += `
      i.${iconClass}::before,
      i.fas.${iconClass}::before,
      i.far.${iconClass}::before,
      .${iconClass}::before {
        content: "${unicode}" !important;
        font-family: "Font Awesome 6 Free", "FontAwesome" !important;
        font-weight: 900 !important;
      }`;
      this.fixedIcons.add(iconClass);
    }

    this.styleElement.textContent += css;
  }

  scanAndFix() {
    const allIcons = document.querySelectorAll('i[class*="fa-"]');
    const newIcons = new Set();

    allIcons.forEach(icon => {
      const classes = Array.from(icon.classList).filter(cls => cls.startsWith('fa-'));

      classes.forEach(cls => {
        if (!this.fixedIcons.has(cls)) {
          newIcons.add(cls);
        }
      });
    });

    if (newIcons.size > 0) {
      console.log(`🆕 Found ${newIcons.size} new icon types to fix`);
      this.generateFixes(newIcons);
    }

    return newIcons;
  }

  generateFixes(iconClasses) {
    let css = '\n/* Dynamic Fixes */\n';

    iconClasses.forEach(cls => {
      // Prova a trovare un unicode simile o usa default
      const unicode = this.guessUnicode(cls) || '\uf059'; // Question mark as fallback

      css += `
      i.${cls}::before {
        content: "${unicode}" !important;
        font-family: "Font Awesome 6 Free" !important;
        font-weight: 900 !important;
      }`;

      this.fixedIcons.add(cls);
    });

    this.styleElement.textContent += css;
  }

  guessUnicode(iconClass) {
    // Prova a trovare varianti simili
    const baseName = iconClass.replace(/^fa-/, '');

    // Cerca varianti con suffissi/prefissi diversi
    const variants = [
      `fa-${baseName}`,
      `fa-${baseName}-alt`,
      `fa-${baseName.replace('-alt', '')}`,
      `fa-${baseName}-solid`,
      `fa-${baseName.replace('-solid', '')}`,
      `fa-${baseName}-regular`,
      `fa-${baseName.replace('-regular', '')}`,
      `fa-${baseName.replace(/-o$/, '')}`,
      `fa-${baseName}-o`
    ];

    for (const variant of variants) {
      if (FA6_UNICODE_MAP[variant]) {
        console.log(`✅ Mapped ${iconClass} → ${variant}`);
        return FA6_UNICODE_MAP[variant];
      }
    }

    console.warn(`❌ No mapping found for ${iconClass}`);
    return null;
  }

  status() {
    console.log(`
📊 AUTO FIX STATUS:
- Fixed icons: ${this.fixedIcons.size}
- Known mappings: ${Object.keys(FA6_UNICODE_MAP).length}
    `);

    // Trova icone non fixate
    const allIcons = document.querySelectorAll('i[class*="fa-"]');
    const unfixed = new Set();

    allIcons.forEach(icon => {
      const computed = window.getComputedStyle(icon, '::before');
      if (!computed.content || computed.content === 'none' || computed.content === '""') {
        const classes = Array.from(icon.classList).filter(cls => cls.startsWith('fa-'));
        classes.forEach(cls => unfixed.add(cls));
      }
    });

    if (unfixed.size > 0) {
      console.log('❌ Still broken:', Array.from(unfixed));
    } else {
      console.log('✅ All icons fixed!');
    }
  }
}

// Inizializza sistema
let autoFixer = null;

Hooks.once('init', () => {
  console.log('🤖 Initializing Auto Icon Fixer...');
  autoFixer = new AutoIconFixer();
});

Hooks.once('ready', () => {
  console.log('🤖 Starting auto fix scan...');

  // Scan iniziale
  autoFixer.scanAndFix();

  // Re-scan periodico
  setInterval(() => {
    autoFixer.scanAndFix();
  }, 5000);

  // Re-scan su cambio tab
  Hooks.on('renderSidebarTab', () => {
    setTimeout(() => autoFixer.scanAndFix(), 500);
  });

  // Observer per nuovi elementi
  const observer = new MutationObserver(() => {
    requestAnimationFrame(() => autoFixer.scanAndFix());
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  autoFixer.status();
});

// Comandi globali
window.AutoIconFix = {
  scan: () => autoFixer.scanAndFix(),
  status: () => autoFixer.status(),
  addMapping: (iconClass, unicode) => {
    FA6_UNICODE_MAP[iconClass] = unicode;
    autoFixer.addAllKnownMappings();
    console.log(`✅ Added ${iconClass} → ${unicode}`);
  },
  getMappings: () => FA6_UNICODE_MAP
};

console.log(`
🤖 AUTO FIX COMMANDS:
- AutoIconFix.scan() - Scan and fix new icons
- AutoIconFix.status() - Check status
- AutoIconFix.addMapping('fa-icon', '\\\\uf123') - Add custom mapping
- AutoIconFix.getMappings() - Get all mappings
`);