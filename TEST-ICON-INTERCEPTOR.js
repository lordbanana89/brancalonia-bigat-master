/**
 * TEST RAPIDO ICON INTERCEPTOR
 * 
 * Copia-incolla questo file nella Console (F12) di Foundry VTT
 * per testare rapidamente il nuovo Icon Interceptor v9.0.0
 */

(async function testIconInterceptor() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║     ICON INTERCEPTOR v9.0.0 - TEST SUITE RAPIDO         ║
╚═══════════════════════════════════════════════════════════╝
  `);

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0
  };

  function test(name, condition, message) {
    if (condition) {
      console.log(`✅ ${name}`);
      results.passed++;
    } else {
      console.error(`❌ ${name}: ${message}`);
      results.failed++;
    }
  }

  function warn(name, message) {
    console.warn(`⚠️ ${name}: ${message}`);
    results.warnings++;
  }

  // Test 1: Modulo caricato
  test(
    'Modulo caricato',
    typeof IconInterceptor !== 'undefined',
    'IconInterceptor non trovato nel global scope'
  );

  // Test 2: API pubblica disponibile
  test(
    'API pubblica disponibile',
    window.IconInterceptor && typeof window.IconInterceptor.scan === 'function',
    'API pubblica non esposta'
  );

  // Test 3: Settings registrati
  const enabledSetting = game.settings.settings.get('brancalonia-bigat.enableIconInterceptor');
  test(
    'Settings registrati',
    enabledSetting !== undefined,
    'Settings non registrati'
  );

  // Test 4: Font Awesome caricato
  const faLoaded = document.getElementById('fa-cdn-style') || document.getElementById('brancalonia-fontawesome-local');
  test(
    'Font Awesome caricato',
    faLoaded !== null,
    'Font Awesome non caricato (né CDN né locale)'
  );

  // Test 5: Icone nel DOM
  const iconsInDOM = document.querySelectorAll('i[class*="fa-"]').length;
  test(
    'Icone presenti nel DOM',
    iconsInDOM > 0,
    'Nessuna icona Font Awesome trovata nel DOM'
  );

  console.log(`Trovate ${iconsInDOM} icone nel DOM`);

  // Test 6: Icone intercettate
  const interceptedIcons = document.querySelectorAll('i[data-intercepted="true"]').length;
  test(
    'Icone intercettate',
    interceptedIcons > 0,
    'Nessuna icona intercettata (interceptor non attivo?)'
  );

  console.log(`${interceptedIcons} icone intercettate`);

  // Test 7: Performance scan
  if (window.IconInterceptor) {
    console.log('\n📊 Eseguendo scan completo...');
    const scanResult = window.IconInterceptor.scan();

    if (scanResult) {
      // Test 8: Icone con testo
      if (scanResult.withText > 0) {
        warn('Icone con testo', `${scanResult.withText} icone contengono ancora testo (potrebbero non essere visualizzate correttamente)`);
      } else {
        test('Nessuna icona con testo', true, '');
      }

      // Test 9: Classi non mappate
      if (scanResult.unmapped > 0) {
        warn('Classi non mappate', `${scanResult.unmapped} classi Font Awesome non hanno mapping Unicode`);
        console.log('Classi non mappate:', scanResult.unmappedClasses);
      } else {
        test('Tutte le classi mappate', true, '');
      }

      // Test 10: Performance
      if (scanResult.performance.lastScanTime > 100) {
        warn('Performance scan', `Ultimo scan ha impiegato ${scanResult.performance.lastScanTime.toFixed(2)}ms (potrebbe impattare performance)`);
      } else {
        test('Performance scan accettabile', true, '');
      }
    }
  }

  // Test 11: MutationObserver attivo (indiretto)
  const observerActive = IconInterceptor._observer !== null;
  test(
    'MutationObserver attivo',
    observerActive,
    'Observer non attivo (cambimenti DOM non monitorati)'
  );

  // Test 12: Scan periodico attivo (indiretto)
  const scanActive = IconInterceptor._scanInterval !== null;
  test(
    'Scan periodico attivo',
    scanActive,
    'Scan periodico non attivo'
  );

  // Riepilogo
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    RIEPILOGO TEST                         ║
╠═══════════════════════════════════════════════════════════╣
║  ✅ Passati:  ${String(results.passed).padStart(3)}                                      ║
║  ❌ Falliti:  ${String(results.failed).padStart(3)}                                      ║
║  ⚠️  Warning: ${String(results.warnings).padStart(3)}                                      ║
╠═══════════════════════════════════════════════════════════╣
║  STATUS: ${results.failed === 0 ? '🟢 TUTTO OK                                  ' : '🔴 CI SONO PROBLEMI                          '}║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Comandi utili
  console.log(`
📚 COMANDI UTILI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Scan completo:
   IconInterceptor.scan()

2. Forza riscansione:
   IconInterceptor.forceFixAll()

3. Statistiche:
   IconInterceptor.stats()

4. Reset statistiche:
   IconInterceptor.resetStats()

5. Aggiungi mapping custom:
   IconInterceptor.fix('fa-custom', '\\ufXXX')

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  // Raccomandazioni
  if (results.warnings > 0 || results.failed > 0) {
    console.log(`
🔧 RACCOMANDAZIONI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    if (results.failed > 0) {
      console.log(`
❌ CI SONO ERRORI CRITICI:
   1. Verifica che il modulo sia abilitato nelle impostazioni
   2. Controlla la console per errori di caricamento
   3. Riavvia Foundry VTT
   4. Leggi ICON-INTERCEPTOR-FIX-COMPLETO.md
      `);
    }

    if (results.warnings > 0) {
      console.log(`
⚠️ CI SONO WARNING:
   - Icone con testo: Potrebbero non visualizzarsi correttamente
   - Classi non mappate: Aggiungi mapping con IconInterceptor.fix()
   - Performance: Considera di abbassare la frequenza scan nelle settings
      `);
    }

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  }

  return {
    results,
    commands: {
      scan: () => IconInterceptor.scan(),
      fix: () => IconInterceptor.forceFixAll(),
      stats: () => IconInterceptor.stats(),
      reset: () => IconInterceptor.resetStats()
    }
  };
})();


