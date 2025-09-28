/**
 * BRANCALONIA FONTFACE FIX
 * Soluzione definitiva per Font Awesome in Foundry VTT v13
 * Basato su soluzioni della community Foundry
 */

console.log('🎯 Brancalonia FontFace Fix - Initializing...');

// Registra i font usando l'API FontFace di Foundry
Hooks.once('init', async () => {
  console.log('🎯 Registering Font Awesome via FontFace API...');

  try {
    // Percorso relativo ai font nel modulo
    const fontPath = 'modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts';

    // Registra Font Awesome Solid
    const fontAwesomeSolid = new FontFace(
      'Font Awesome 6 Free',
      `url('${fontPath}/fa-solid-900.woff2') format('woff2'), url('${fontPath}/fa-solid-900.ttf') format('truetype')`,
      {
        weight: '900',
        style: 'normal',
        display: 'block'
      }
    );

    // Registra Font Awesome Regular
    const fontAwesomeRegular = new FontFace(
      'Font Awesome 6 Free',
      `url('${fontPath}/fa-regular-400.woff2') format('woff2'), url('${fontPath}/fa-regular-400.ttf') format('truetype')`,
      {
        weight: '400',
        style: 'normal',
        display: 'block'
      }
    );

    // Registra Font Awesome Brands
    const fontAwesomeBrands = new FontFace(
      'Font Awesome 6 Brands',
      `url('${fontPath}/fa-brands-400.woff2') format('woff2'), url('${fontPath}/fa-brands-400.ttf') format('truetype')`,
      {
        weight: '400',
        style: 'normal',
        display: 'block'
      }
    );

    // Carica e aggiungi i font
    await fontAwesomeSolid.load();
    await fontAwesomeRegular.load();
    await fontAwesomeBrands.load();

    document.fonts.add(fontAwesomeSolid);
    document.fonts.add(fontAwesomeRegular);
    document.fonts.add(fontAwesomeBrands);

    console.log('✅ Font Awesome loaded via FontFace API');

    // Aggiungi anche come FontConfig di Foundry se disponibile
    if (CONFIG.fontDefinitions) {
      CONFIG.fontDefinitions['Font Awesome 6 Free'] = {
        editor: false,
        fonts: [
          {
            urls: [`${fontPath}/fa-solid-900.woff2`],
            weight: 900,
            style: 'normal'
          },
          {
            urls: [`${fontPath}/fa-regular-400.woff2`],
            weight: 400,
            style: 'normal'
          }
        ]
      };
      console.log('✅ Font Awesome added to CONFIG.fontDefinitions');
    }

  } catch (error) {
    console.error('❌ Error loading Font Awesome:', error);
  }

  // Inietta CSS critico
  const style = document.createElement('style');
  style.id = 'brancalonia-fontface-critical';
  style.textContent = `
    /* Font Awesome Critical CSS */
    i[class*="fa-"],
    .fas, .far, .fab, .fa {
      font-family: "Font Awesome 6 Free", "Font Awesome 6 Brands", "Font Awesome 5 Free", FontAwesome !important;
      font-style: normal !important;
      font-variant: normal !important;
      text-rendering: auto !important;
      line-height: 1 !important;
      display: inline-block !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
    }

    .fas, .fa-solid {
      font-weight: 900 !important;
    }

    .far, .fa-regular {
      font-weight: 400 !important;
    }

    .fab, .fa-brands {
      font-family: "Font Awesome 6 Brands" !important;
      font-weight: 400 !important;
    }

    /* Icone specifiche - content mapping */
    i.fa-user-plus::before,
    .fa-user-plus::before { content: "\\f234" !important; }

    i.fa-folder-plus::before,
    .fa-folder-plus::before { content: "\\f65e" !important; }

    i.fa-plus::before,
    .fa-plus::before { content: "\\f067" !important; }

    i.fa-folder::before,
    .fa-folder::before { content: "\\f07b" !important; }

    i.fa-user::before,
    .fa-user::before { content: "\\f007" !important; }

    i.fa-users::before,
    .fa-users::before { content: "\\f0c0" !important; }

    i.fa-search::before,
    .fa-search::before { content: "\\f002" !important; }

    i.fa-cog::before,
    .fa-cog::before { content: "\\f013" !important; }

    i.fa-cogs::before,
    .fa-cogs::before { content: "\\f085" !important; }

    i.fa-trash::before,
    .fa-trash::before { content: "\\f1f8" !important; }

    i.fa-edit::before,
    .fa-edit::before { content: "\\f044" !important; }

    i.fa-times::before,
    .fa-times::before { content: "\\f00d" !important; }

    i.fa-check::before,
    .fa-check::before { content: "\\f00c" !important; }

    i.fa-chevron-up::before,
    .fa-chevron-up::before { content: "\\f077" !important; }

    i.fa-chevron-down::before,
    .fa-chevron-down::before { content: "\\f078" !important; }

    i.fa-chevron-left::before,
    .fa-chevron-left::before { content: "\\f053" !important; }

    i.fa-chevron-right::before,
    .fa-chevron-right::before { content: "\\f054" !important; }

    i.fa-dice-d20::before,
    .fa-dice-d20::before { content: "\\f6cf" !important; }

    i.fa-comments::before,
    .fa-comments::before { content: "\\f086" !important; }

    i.fa-book::before,
    .fa-book::before { content: "\\f02d" !important; }

    i.fa-atlas::before,
    .fa-atlas::before { content: "\\f558" !important; }

    i.fa-map::before,
    .fa-map::before { content: "\\f279" !important; }

    i.fa-music::before,
    .fa-music::before { content: "\\f001" !important; }

    i.fa-suitcase::before,
    .fa-suitcase::before { content: "\\f0f2" !important; }

    i.fa-fist-raised::before,
    .fa-fist-raised::before { content: "\\f6de" !important; }

    i.fa-table::before,
    .fa-table::before { content: "\\f0ce" !important; }

    i.fa-th-list::before,
    .fa-th-list::before { content: "\\f00b" !important; }

    i.fa-folder-open::before,
    .fa-folder-open::before { content: "\\f07c" !important; }

    /* Fix specifici per Foundry VTT UI */
    #sidebar button i[class*="fa-"],
    #sidebar .directory-header button i[class*="fa-"],
    .window-app button i[class*="fa-"] {
      font-family: "Font Awesome 6 Free" !important;
      font-weight: 900 !important;
    }

    /* Fix per bottoni Create specifici */
    button[data-action="create"] i,
    button[data-action="createFolder"] i,
    button[data-folder*="create"] i {
      font-family: "Font Awesome 6 Free" !important;
      font-weight: 900 !important;
      font-style: normal !important;
    }
  `;

  document.head.appendChild(style);
  console.log('✅ Critical CSS injected');
});

// Fix aggiuntivo dopo che Foundry è pronto
Hooks.once('ready', () => {
  console.log('🎯 Verifying Font Awesome after ready...');

  // Verifica che i font siano caricati
  document.fonts.ready.then(() => {
    const fonts = Array.from(document.fonts);
    const faFonts = fonts.filter(f =>
      f.family.includes('Font Awesome') ||
      f.family.includes('FontAwesome')
    );

    console.log(`✅ ${faFonts.length} Font Awesome fonts loaded:`,
      faFonts.map(f => `${f.family} (${f.weight})`).join(', ')
    );

    // Se non ci sono font caricati, riprova
    if (faFonts.length === 0) {
      console.warn('⚠️ No Font Awesome fonts found, retrying...');
      retryFontLoading();
    }
  });
});

// Funzione di retry per Firefox e altri browser problematici
async function retryFontLoading() {
  console.log('🔄 Retrying Font Awesome loading...');

  try {
    // Metodo alternativo: preload dei font
    const preloads = [
      'modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-solid-900.woff2',
      'modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-regular-400.woff2',
      'modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-brands-400.woff2'
    ];

    for (const fontUrl of preloads) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = fontUrl;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    // Forza il reload dei font
    await document.fonts.ready;

    console.log('✅ Font retry completed');
  } catch (error) {
    console.error('❌ Font retry failed:', error);
  }
}

// Hook per fixare icone quando le sidebar tabs cambiano
Hooks.on('changeSidebarTab', (app) => {
  setTimeout(() => {
    console.log(`🔧 Checking icons after tab change: ${app.tabName}`);
    checkAndFixIcons();
  }, 100);
});

// Funzione per verificare e fixare icone
function checkAndFixIcons() {
  const problemIcons = document.querySelectorAll(
    '.fa-user-plus, .fa-folder-plus, button[data-action="create"] i, button[data-action="createFolder"] i'
  );

  problemIcons.forEach(icon => {
    const computed = window.getComputedStyle(icon, '::before');
    const content = computed.content;

    if (!content || content === 'none' || content === '""') {
      console.warn('🔧 Fixing broken icon:', icon.className);

      // Forza il font
      icon.style.fontFamily = '"Font Awesome 6 Free"';
      icon.style.fontWeight = '900';
      icon.style.fontStyle = 'normal';
      icon.style.display = 'inline-block';
    }
  });
}

// Esporta utilità globali
window.FAFix = {
  checkFonts: async () => {
    await document.fonts.ready;
    const fonts = Array.from(document.fonts);
    const faFonts = fonts.filter(f => f.family.includes('Font'));
    console.table(faFonts.map(f => ({
      family: f.family,
      weight: f.weight,
      style: f.style,
      status: f.status
    })));
    return faFonts.length > 0;
  },

  retry: retryFontLoading,

  fix: checkAndFixIcons,

  test: () => {
    const test = document.createElement('i');
    test.className = 'fas fa-user-plus';
    document.body.appendChild(test);

    setTimeout(() => {
      const computed = window.getComputedStyle(test, '::before');
      console.log('Test icon:', {
        content: computed.content,
        fontFamily: computed.fontFamily,
        fontWeight: computed.fontWeight
      });
      document.body.removeChild(test);
    }, 100);
  }
};

console.log(`
🛠️ FONTFACE FIX COMMANDS:
- FAFix.checkFonts() - Check loaded fonts
- FAFix.retry() - Retry font loading
- FAFix.fix() - Fix broken icons
- FAFix.test() - Test icon rendering
`);