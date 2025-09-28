/**
 * BRANCALONIA FONT AWESOME DEBUG & FIX
 * Sistema completo per diagnosticare e fixare Font Awesome
 */

console.log('🔍 Brancalonia Font Awesome Debug - Starting...');

// Funzione per verificare se un font è caricato
async function checkFontLoaded(fontName) {
  try {
    await document.fonts.load(`900 16px "${fontName}"`);
    const loaded = document.fonts.check(`900 16px "${fontName}"`);
    return loaded;
  } catch (e) {
    console.error(`Error checking font ${fontName}:`, e);
    return false;
  }
}

// Verifica tutti i possibili Font Awesome
async function checkAllFontAwesome() {
  const fonts = [
    'Font Awesome 6 Free',
    'Font Awesome 6 Solid',
    'Font Awesome 6 Regular',
    'Font Awesome 6 Brands',
    'Font Awesome 5 Free',
    'FontAwesome',
    'FA6Free'
  ];

  console.log('🔍 Checking Font Awesome variants...');
  for (const font of fonts) {
    const loaded = await checkFontLoaded(font);
    console.log(`  ${font}: ${loaded ? '✅ LOADED' : '❌ NOT LOADED'}`);
  }
}

// Analizza un'icona specifica
function analyzeIcon(element) {
  if (!element) return null;

  const computed = window.getComputedStyle(element);
  const computedBefore = window.getComputedStyle(element, '::before');

  return {
    classes: element.className,
    fontFamily: computed.fontFamily,
    fontWeight: computed.fontWeight,
    beforeContent: computedBefore.content,
    beforeFontFamily: computedBefore.fontFamily,
    beforeFontWeight: computedBefore.fontWeight,
    beforeDisplay: computedBefore.display,
    innerHTML: element.innerHTML,
    textContent: element.textContent
  };
}

// Fix con fallback a SVG se necessario
function fixIconWithFallback(icon) {
  // Mappa icone -> SVG paths
  const svgPaths = {
    'fa-user-plus': 'M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0S96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4zM504 312V248c0-13.3-10.7-24-24-24s-24 10.7-24 24v64h-64c-13.3 0-24 10.7-24 24s10.7 24 24 24h64v64c0 13.3 10.7 24 24 24s24-10.7 24-24v-64h64c13.3 0 24-10.7 24-24s-10.7-24-24-24h-64z',
    'fa-folder-plus': 'M464 128H272l-64-64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48zM400 344c0 8.822-7.178 16-16 16h-72v72c0 8.822-7.178 16-16 16h-16c-8.822 0-16-7.178-16-16v-72h-72c-8.822 0-16-7.178-16-16v-16c0-8.822 7.178-16 16-16h72v-72c0-8.822 7.178-16 16-16h16c8.822 0 16 7.178 16 16v72h72c8.822 0 16 7.178 16 16v16z',
    'fa-plus': 'M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z',
    'fa-folder': 'M464 128H272l-64-64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48z',
    'fa-user': 'M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0S96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z',
    'fa-search': 'M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z'
  };

  // Estrai il nome dell'icona
  let iconName = null;
  icon.classList.forEach(cls => {
    if (cls.startsWith('fa-') && cls !== 'fa-fw') {
      iconName = cls;
    }
  });

  if (iconName && svgPaths[iconName]) {
    // Crea SVG inline
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 512 512');
    svg.setAttribute('width', '1em');
    svg.setAttribute('height', '1em');
    svg.style.fill = 'currentColor';
    svg.style.display = 'inline-block';
    svg.style.verticalAlign = 'middle';

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', svgPaths[iconName]);

    svg.appendChild(path);

    // Sostituisci contenuto icon con SVG
    icon.innerHTML = '';
    icon.appendChild(svg);

    return true;
  }

  return false;
}

// Hook principale
Hooks.once('ready', async () => {
  console.log('🔍 Font Awesome Debug - Ready Hook');

  // Check font loading
  await checkAllFontAwesome();

  // Analizza icone problematiche
  console.log('\n🔍 Analyzing problem icons...');
  const problemSelectors = [
    'button[data-action="create"] i',
    'button[data-action="createFolder"] i',
    '.fa-user-plus',
    '.fa-folder-plus'
  ];

  problemSelectors.forEach(selector => {
    const icons = document.querySelectorAll(selector);
    icons.forEach((icon, index) => {
      const analysis = analyzeIcon(icon);
      console.log(`\n📌 ${selector} [${index}]:`, analysis);

      // Se l'icona non mostra nulla, prova a fixarla con SVG
      if (analysis && (!analysis.beforeContent || analysis.beforeContent === 'none' || analysis.beforeContent === '""')) {
        console.log(`  🔧 Attempting SVG fallback...`);
        const fixed = fixIconWithFallback(icon);
        if (fixed) {
          console.log(`  ✅ Fixed with SVG!`);
        }
      }
    });
  });

  // Setup mutation observer per icone future
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          const icons = node.querySelectorAll?.('i[class*="fa-"]') || [];
          icons.forEach(icon => {
            setTimeout(() => {
              const analysis = analyzeIcon(icon);
              if (analysis && (!analysis.beforeContent || analysis.beforeContent === 'none')) {
                fixIconWithFallback(icon);
              }
            }, 100);
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('✅ Font Awesome Debug & Fix system active');
});

// Esporta funzioni globali per debug manuale
window.FADebug = {
  check: checkAllFontAwesome,
  analyze: (selector) => {
    const el = document.querySelector(selector);
    return analyzeIcon(el);
  },
  fixAll: () => {
    let fixed = 0;
    document.querySelectorAll('i[class*="fa-"]').forEach(icon => {
      if (fixIconWithFallback(icon)) fixed++;
    });
    console.log(`Fixed ${fixed} icons with SVG fallback`);
  },
  forceFont: () => {
    // Prova a caricare il font direttamente
    const fontFace = new FontFace('FontAwesomeForce', 'url(modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-solid-900.woff2)');
    fontFace.load().then(loaded => {
      document.fonts.add(loaded);
      console.log('✅ Font loaded and added to document');

      // Applica a tutte le icone
      document.querySelectorAll('i[class*="fa-"]').forEach(icon => {
        icon.style.fontFamily = 'FontAwesomeForce';
        icon.style.fontWeight = '900';
      });
    }).catch(e => {
      console.error('❌ Failed to load font:', e);
    });
  }
};

console.log(`
🔧 FONT AWESOME DEBUG COMMANDS:
- FADebug.check() - Check all Font Awesome fonts
- FADebug.analyze('selector') - Analyze specific icon
- FADebug.fixAll() - Apply SVG fallback to all broken icons
- FADebug.forceFont() - Force load font from file
`);