/**
 * BRANCALONIA ICON DETECTOR
 * Sistema per rilevare TUTTE le icone usate e generare la mappatura completa
 */

console.log('🔍 Brancalonia Icon Detector - Starting...');

// Collezione globale di tutte le icone trovate
window.BrancaloniaIconDetector = {
  foundIcons: new Set(),
  iconElements: new Map(),

  // Scansiona tutto il DOM per icone
  scanDOM: function() {
    this.foundIcons.clear();
    this.iconElements.clear();

    const allIcons = document.querySelectorAll('i[class*="fa-"]');

    allIcons.forEach(icon => {
      const classes = Array.from(icon.classList);
      const faClasses = classes.filter(cls => cls.startsWith('fa-'));

      faClasses.forEach(cls => {
        this.foundIcons.add(cls);

        if (!this.iconElements.has(cls)) {
          this.iconElements.set(cls, []);
        }
        this.iconElements.get(cls).push(icon);
      });
    });

    console.log(`Found ${this.foundIcons.size} unique icon classes`);
    return this.foundIcons;
  },

  // Analizza quali icone non mostrano contenuto
  analyzeBroken: function() {
    const broken = new Map();

    this.iconElements.forEach((elements, className) => {
      elements.forEach(el => {
        const computed = window.getComputedStyle(el, '::before');
        const content = computed.content;
        const fontFamily = computed.fontFamily;

        if (!content || content === 'none' || content === '""' || content === '"?"') {
          if (!broken.has(className)) {
            broken.set(className, {
              count: 0,
              examples: [],
              computed: {
                content: content,
                fontFamily: fontFamily
              }
            });
          }

          broken.get(className).count++;
          if (broken.get(className).examples.length < 3) {
            broken.get(className).examples.push({
              element: el,
              parent: el.parentElement?.tagName,
              context: el.parentElement?.className
            });
          }
        }
      });
    });

    return broken;
  },

  // Genera report completo
  report: function() {
    this.scanDOM();
    const broken = this.analyzeBroken();

    console.log('==== ICON DETECTION REPORT ====');
    console.log(`Total unique icons: ${this.foundIcons.size}`);
    console.log(`Broken icons: ${broken.size}`);

    if (broken.size > 0) {
      console.log('\n🔴 BROKEN ICONS:');
      broken.forEach((info, className) => {
        console.log(`  ${className}: ${info.count} instances`);
        console.log(`    Content: ${info.computed.content}`);
        console.log(`    Font: ${info.computed.fontFamily}`);
      });
    }

    console.log('\n📋 ALL FOUND ICONS:');
    const sortedIcons = Array.from(this.foundIcons).sort();
    sortedIcons.forEach(icon => {
      const isBroken = broken.has(icon);
      console.log(`  ${isBroken ? '❌' : '✅'} ${icon}`);
    });

    return {
      total: this.foundIcons.size,
      broken: Array.from(broken.keys()),
      all: sortedIcons
    };
  },

  // Monitora nuove icone aggiunte
  startMonitoring: function() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            const icons = node.querySelectorAll?.('i[class*="fa-"]');
            if (icons && icons.length > 0) {
              icons.forEach(icon => {
                const classes = Array.from(icon.classList).filter(cls => cls.startsWith('fa-'));
                classes.forEach(cls => {
                  if (!this.foundIcons.has(cls)) {
                    console.log(`🆕 New icon detected: ${cls}`);
                    this.foundIcons.add(cls);
                  }
                });
              });
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('✅ Icon monitoring started');
  },

  // Genera codice per mappatura
  generateMapping: function() {
    const broken = this.analyzeBroken();
    const brokenIcons = Array.from(broken.keys());

    console.log('\n📝 GENERATED MAPPING CODE:');
    console.log('const MISSING_ICONS = {');

    brokenIcons.forEach(icon => {
      // Prova a indovinare il codice Unicode basandosi sul nome
      let unicode = '\\uf059'; // Default question mark

      // Mappatura comune per icone note
      const knownMappings = {
        'fa-cubes': '\\uf1b3',
        'fa-puzzle-piece': '\\uf12e',
        'fa-sliders-h': '\\uf1de',
        'fa-sliders': '\\uf1de',
        'fa-box': '\\uf466',
        'fa-boxes': '\\uf468',
        'fa-square-plus': '\\uf0fe',
        'fa-pen-to-square': '\\uf044',
        'fa-circle-check': '\\uf058',
        'fa-circle-xmark': '\\uf057',
        'fa-triangle-exclamation': '\\uf071',
        'fa-circle-info': '\\uf05a',
        'fa-circle-question': '\\uf059',
        'fa-magnifying-glass': '\\uf002',
        'fa-gear': '\\uf013',
        'fa-gears': '\\uf085',
        'fa-floppy-disk': '\\uf0c7',
        'fa-house': '\\uf015',
        'fa-up-right-from-square': '\\uf35d',
        'fa-shield-halved': '\\uf3ed',
        'fa-hand-fist': '\\uf6de',
        'fa-heart-pulse': '\\uf21e',
        'fa-star-half-stroke': '\\uf5c0',
        'fa-hard-drive': '\\uf0a0',
        'fa-wand-magic': '\\uf0d0',
        'fa-bolt-lightning': '\\ue0b7',
        'fa-arrows-rotate': '\\uf021',
        'fa-share-nodes': '\\uf1e0',
        'fa-trash-can': '\\uf2ed',
        'fa-xmark': '\\uf00d',
        'fa-file-lines': '\\uf15c',
        'fa-volume-high': '\\uf028',
        'fa-volume-low': '\\uf027',
        'fa-volume-xmark': '\\uf6a9'
      };

      if (knownMappings[icon]) {
        unicode = knownMappings[icon];
      }

      console.log(`  '${icon}': '${unicode}',`);
    });

    console.log('};');

    return brokenIcons;
  },

  // Test fix su icona specifica
  testFix: function(iconClass, unicode) {
    const icons = document.querySelectorAll(`i.${iconClass}`);
    icons.forEach(icon => {
      const style = document.createElement('style');
      style.textContent = `
        i.${iconClass}::before {
          content: "${unicode}" !important;
          font-family: "Font Awesome 6 Free", "FontAwesome" !important;
          font-weight: 900 !important;
        }
      `;
      document.head.appendChild(style);
    });

    console.log(`Applied fix to ${icons.length} instances of ${iconClass}`);
  }
};

// Hook per iniziare il monitoraggio
Hooks.once('ready', () => {
  console.log('🔍 Starting icon detection...');

  // Aspetta che tutto sia caricato
  setTimeout(() => {
    const report = window.BrancaloniaIconDetector.report();

    if (report.broken.length > 0) {
      console.warn(`⚠️ Found ${report.broken.length} broken icon types!`);
      console.log('Run BrancaloniaIconDetector.generateMapping() to generate fix code');
    }

    // Inizia monitoraggio continuo
    window.BrancaloniaIconDetector.startMonitoring();
  }, 2000);
});

// Hook per ri-scansionare quando cambiano le tabs
Hooks.on('renderSidebarTab', () => {
  setTimeout(() => {
    window.BrancaloniaIconDetector.scanDOM();
  }, 500);
});

console.log(`
🔍 ICON DETECTOR COMMANDS:
- BrancaloniaIconDetector.report() - Full report of all icons
- BrancaloniaIconDetector.analyzeBroken() - Find broken icons
- BrancaloniaIconDetector.generateMapping() - Generate fix code
- BrancaloniaIconDetector.testFix('fa-icon', '\\\\uf123') - Test fix on specific icon
`);