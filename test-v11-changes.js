/**
 * TEST SUITE per Brancalonia v11.0.0
 * Verifica che tutte le modifiche apportate funzionino correttamente
 */

console.log(`
╔═══════════════════════════════════════════╗
║  🧪 BRANCALONIA v11.0.0 TEST SUITE       ║
╚═══════════════════════════════════════════╝
`);

// Test 1: Verifica BrancaloniaCore
function testBrancaloniaCore() {
  console.group('📦 Test BrancaloniaCore');

  try {
    // Verifica che il core sia inizializzato
    if (!game.brancalonia?.core) {
      throw new Error('BrancaloniaCore non inizializzato');
    }

    // Verifica versione
    if (game.brancalonia.version !== '11.0.0') {
      throw new Error(`Versione errata: ${game.brancalonia.version}`);
    }

    // Verifica API disponibile
    if (!game.brancalonia.api) {
      throw new Error('API non disponibile');
    }

    // Verifica metodi API
    const requiredMethods = [
      'version',
      'isCompatible',
      'hasModule',
      'getModule',
      'getModuleStatus',
      'addInfamia',
      'getInfamia',
      'applyTheme',
      'removeTheme',
      'debug'
    ];

    for (const method of requiredMethods) {
      if (!game.brancalonia.api[method]) {
        throw new Error(`Metodo API mancante: ${method}`);
      }
    }

    console.log('✅ BrancaloniaCore funzionante');
    console.log(`   - Versione: ${game.brancalonia.version}`);
    console.log(`   - Moduli caricati: ${Object.keys(game.brancalonia.modules || {}).length}`);

  } catch (error) {
    console.error('❌ Test BrancaloniaCore fallito:', error.message);
    return false;
  }

  console.groupEnd();
  return true;
}

// Test 2: Verifica Sistema Unificato Reputazione/Infamia
function testReputationInfamiaSystem() {
  console.group('🎭 Test Sistema Reputazione/Infamia Unificato');

  try {
    // Verifica che il sistema sia inizializzato
    if (!game.brancalonia?.reputationInfamia) {
      throw new Error('Sistema Reputazione/Infamia non inizializzato');
    }

    // Verifica retrocompatibilità
    if (!game.brancalonia?.infamia) {
      throw new Error('Retrocompatibilità infamia non mantenuta');
    }

    // Verifica strutture dati
    const system = game.brancalonia.reputationInfamia;

    if (!system.infamiaLevels) {
      throw new Error('infamiaLevels mancante');
    }

    if (!system.reputationTypes) {
      throw new Error('reputationTypes mancante');
    }

    if (!system.titles) {
      throw new Error('titles mancante');
    }

    // Verifica metodi Actor estesi
    const testActor = game.actors?.contents?.[0];
    if (testActor) {
      const requiredMethods = [
        'addInfamia',
        'getInfamia',
        'getInfamiaLevel',
        'getReputation',
        'setReputation',
        'adjustReputation',
        'getTitles',
        'hasTitle',
        'grantTitle',
        'getTotalReputation'
      ];

      for (const method of requiredMethods) {
        if (typeof testActor[method] !== 'function') {
          throw new Error(`Metodo Actor mancante: ${method}`);
        }
      }
    }

    console.log('✅ Sistema Reputazione/Infamia funzionante');
    console.log(`   - Livelli infamia: ${Object.keys(system.infamiaLevels).length}`);
    console.log(`   - Tipi reputazione: ${Object.keys(system.reputationTypes).length}`);
    console.log(`   - Titoli disponibili: ${Object.keys(system.titles).length}`);

  } catch (error) {
    console.error('❌ Test Reputazione/Infamia fallito:', error.message);
    return false;
  }

  console.groupEnd();
  return true;
}

// Test 3: Verifica Init Wrapper
function testInitWrapper() {
  console.group('🔧 Test Init Wrapper');

  try {
    // Verifica che il wrapper sia disponibile
    if (!window.BrancaloniaInitWrapper) {
      throw new Error('BrancaloniaInitWrapper non disponibile');
    }

    // Verifica logging
    if (!game.brancalonia?.log) {
      throw new Error('Sistema logging non inizializzato');
    }

    // Verifica metodi logging
    const logMethods = ['debug', 'info', 'warn', 'error'];
    for (const method of logMethods) {
      if (typeof game.brancalonia.log[method] !== 'function') {
        throw new Error(`Metodo log mancante: ${method}`);
      }
    }

    // Ottieni status moduli
    const status = BrancaloniaInitWrapper.getModulesStatus();

    console.log('✅ Init Wrapper funzionante');
    console.log(`   - Moduli inizializzati: ${status.initialized.length}`);
    console.log(`   - Moduli falliti: ${status.failed.length}`);

    // Mostra moduli falliti se presenti
    if (status.failed.length > 0) {
      console.warn('   ⚠️ Moduli con errori:');
      status.failed.forEach(m => {
        console.warn(`      - ${m.name}: ${m.error}`);
      });
    }

  } catch (error) {
    console.error('❌ Test Init Wrapper fallito:', error.message);
    return false;
  }

  console.groupEnd();
  return true;
}

// Test 4: Verifica CSS e UI
function testCSSandUI() {
  console.group('🎨 Test CSS e UI');

  try {
    // Verifica che gli stili siano caricati
    const styleSheets = Array.from(document.styleSheets);
    const brancaloniaStyles = styleSheets.filter(s =>
      s.href?.includes('brancalonia')
    );

    if (brancaloniaStyles.length === 0) {
      throw new Error('Nessun foglio di stile Brancalonia caricato');
    }

    // Verifica che i CSS legacy siano stati rimossi
    const legacyFiles = [
      'brancalonia-theme-system-v2.css',
      'brancalonia-fontawesome-local.css',
      'brancalonia-icons-fix.css',
      'brancalonia-theme-variables.css'
    ];

    const foundLegacy = brancaloniaStyles.filter(s =>
      legacyFiles.some(legacy => s.href?.includes(legacy))
    );

    if (foundLegacy.length > 0) {
      throw new Error(`CSS legacy ancora caricati: ${foundLegacy.map(s => s.href).join(', ')}`);
    }

    // Verifica tema applicabile
    if (game.brancalonia?.api?.applyTheme) {
      game.brancalonia.api.applyTheme();
      if (!document.body.classList.contains('theme-brancalonia')) {
        throw new Error('Tema non applicato correttamente');
      }
      game.brancalonia.api.removeTheme();
    }

    console.log('✅ CSS e UI funzionanti');
    console.log(`   - Fogli di stile caricati: ${brancaloniaStyles.length}`);

  } catch (error) {
    console.error('❌ Test CSS e UI fallito:', error.message);
    return false;
  }

  console.groupEnd();
  return true;
}

// Test 5: Verifica Settings
function testSettings() {
  console.group('⚙️ Test Settings');

  try {
    const namespace = 'brancalonia-bigat';

    // Settings critiche che dovrebbero esistere
    const requiredSettings = [
      'debugMode',
      'trackInfamia',
      'infamiaEffects',
      'randomEncounters',
      'useReputation',
      'dynamicTitles',
      'reputationDecay',
      'trackHistory'
    ];

    const missingSettings = [];
    for (const setting of requiredSettings) {
      try {
        game.settings.get(namespace, setting);
      } catch {
        missingSettings.push(setting);
      }
    }

    if (missingSettings.length > 0) {
      throw new Error(`Settings mancanti: ${missingSettings.join(', ')}`);
    }

    console.log('✅ Settings configurate correttamente');
    console.log(`   - Settings verificate: ${requiredSettings.length}`);

  } catch (error) {
    console.error('❌ Test Settings fallito:', error.message);
    return false;
  }

  console.groupEnd();
  return true;
}

// Esegui tutti i test
async function runAllTests() {
  console.log('🚀 Avvio test suite...\n');

  const tests = [
    testBrancaloniaCore,
    testReputationInfamiaSystem,
    testInitWrapper,
    testCSSandUI,
    testSettings
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    console.log(''); // Riga vuota tra test
  }

  // Report finale
  console.log(`
╔═══════════════════════════════════════════╗
║  📊 RISULTATI TEST                        ║
╟───────────────────────────────────────────╢
║  ✅ Passati: ${passed}                              ║
║  ❌ Falliti: ${failed}                              ║
║  📈 Success Rate: ${Math.round((passed / tests.length) * 100)}%                  ║
╚═══════════════════════════════════════════╝
  `);

  if (failed === 0) {
    console.log('🎉 Tutti i test sono passati! Brancalonia v11.0.0 è pronto per l'uso.');
    ui.notifications.info('✅ Brancalonia v11.0.0: Tutti i test passati!');
  } else {
    console.warn('⚠️ Alcuni test sono falliti. Verifica i log sopra per i dettagli.');
    ui.notifications.warn(`⚠️ Brancalonia v11.0.0: ${failed} test falliti. Controlla la console.`);
  }

  // Suggerimenti diagnostici
  if (failed > 0) {
    console.log('\n📌 Suggerimenti per il debug:');
    console.log('1. Ricarica la pagina (F5) e riprova');
    console.log('2. Verifica che tutti i moduli siano abilitati in Foundry');
    console.log('3. Controlla la console per errori durante il caricamento');
    console.log('4. Usa: game.brancalonia.api.debug.enable() per abilitare il debug');
    console.log('5. Usa: BrancaloniaInitWrapper.printInitReport() per vedere lo stato dei moduli');
  }
}

// Avvia i test quando il sistema è pronto
if (game.ready) {
  runAllTests();
} else {
  Hooks.once('ready', () => {
    setTimeout(runAllTests, 500); // Piccolo delay per assicurarsi che tutto sia caricato
  });
}

// Esporta per uso manuale
window.BrancaloniaTestSuite = {
  runAllTests,
  testBrancaloniaCore,
  testReputationInfamiaSystem,
  testInitWrapper,
  testCSSandUI,
  testSettings
};