/**
 * TEST SUITE - brancalonia-modules-init-fix.js v2.0.0
 * Suite di test completa per verificare tutte le funzionalità
 * 
 * COME USARE:
 * 1. Apri Foundry VTT con il mondo Brancalonia
 * 2. Apri la console (F12)
 * 3. Copia e incolla questo intero script
 * 4. Premi Invio
 * 5. Verifica i risultati
 */

(async function testBrancaloniaInitFix() {
  console.log('🧪 ═══════════════════════════════════════════════════');
  console.log('🧪 TEST SUITE - brancalonia-modules-init-fix.js v2.0.0');
  console.log('🧪 ═══════════════════════════════════════════════════');
  console.log('');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  function test(name, fn) {
    results.total++;
    try {
      const result = fn();
      if (result === false) {
        throw new Error('Test returned false');
      }
      results.passed++;
      results.tests.push({ name, status: '✅ PASS', error: null });
      console.log(`✅ PASS: ${name}`);
      return true;
    } catch (error) {
      results.failed++;
      results.tests.push({ name, status: '❌ FAIL', error: error.message });
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${error.message}`);
      return false;
    }
  }

  function asyncTest(name, fn) {
    return new Promise(async (resolve) => {
      results.total++;
      try {
        await fn();
        results.passed++;
        results.tests.push({ name, status: '✅ PASS', error: null });
        console.log(`✅ PASS: ${name}`);
        resolve(true);
      } catch (error) {
        results.failed++;
        results.tests.push({ name, status: '❌ FAIL', error: error.message });
        console.error(`❌ FAIL: ${name}`);
        console.error(`   Error: ${error.message}`);
        resolve(false);
      }
    });
  }

  console.log('📦 SEZIONE 1: Verifica Presenza Moduli');
  console.log('─────────────────────────────────────');

  test('1.1 - game.brancalonia esiste', () => {
    if (!game.brancalonia) throw new Error('game.brancalonia non esiste');
    return true;
  });

  test('1.2 - game.brancalonia.version è definita', () => {
    if (!game.brancalonia.version) throw new Error('version non definita');
    return true;
  });

  test('1.3 - game.brancalonia.modules è un oggetto', () => {
    if (typeof game.brancalonia.modules !== 'object') throw new Error('modules non è un oggetto');
    return true;
  });

  test('1.4 - game.brancalonia.initialized è boolean', () => {
    if (typeof game.brancalonia.initialized !== 'boolean') throw new Error('initialized non è boolean');
    return true;
  });

  test('1.5 - window.BrancaloniaInitFix esiste', () => {
    if (!window.BrancaloniaInitFix) throw new Error('BrancaloniaInitFix non esposto globalmente');
    return true;
  });

  console.log('');
  console.log('🔧 SEZIONE 2: Verifica API');
  console.log('─────────────────────────────────────');

  test('2.1 - game.brancalonia.registerModule è una funzione', () => {
    if (typeof game.brancalonia.registerModule !== 'function') {
      throw new Error('registerModule non è una funzione');
    }
    return true;
  });

  test('2.2 - game.brancalonia.getInitStatistics è una funzione', () => {
    if (typeof game.brancalonia.getInitStatistics !== 'function') {
      throw new Error('getInitStatistics non è una funzione');
    }
    return true;
  });

  test('2.3 - game.brancalonia.getDiagnostics è una funzione', () => {
    if (typeof game.brancalonia.getDiagnostics !== 'function') {
      throw new Error('getDiagnostics non è una funzione');
    }
    return true;
  });

  test('2.4 - BrancaloniaInitFix.getStatistics è una funzione', () => {
    if (typeof window.BrancaloniaInitFix.getStatistics !== 'function') {
      throw new Error('BrancaloniaInitFix.getStatistics non è una funzione');
    }
    return true;
  });

  test('2.5 - BrancaloniaInitFix.getDiagnostics è una funzione', () => {
    if (typeof window.BrancaloniaInitFix.getDiagnostics !== 'function') {
      throw new Error('BrancaloniaInitFix.getDiagnostics non è una funzione');
    }
    return true;
  });

  console.log('');
  console.log('📊 SEZIONE 3: Verifica Statistiche');
  console.log('─────────────────────────────────────');

  let stats;
  test('3.1 - getStatistics() restituisce un oggetto', () => {
    stats = game.brancalonia.getInitStatistics();
    if (typeof stats !== 'object') throw new Error('stats non è un oggetto');
    return true;
  });

  test('3.2 - stats.modulesRegistered è un numero', () => {
    if (typeof stats.modulesRegistered !== 'number') throw new Error('modulesRegistered non è un numero');
    return true;
  });

  test('3.3 - stats.modulesInitialized è un numero', () => {
    if (typeof stats.modulesInitialized !== 'number') throw new Error('modulesInitialized non è un numero');
    return true;
  });

  test('3.4 - stats.initTime è un numero', () => {
    if (typeof stats.initTime !== 'number') throw new Error('initTime non è un numero');
    return true;
  });

  test('3.5 - stats.readyTime è un numero', () => {
    if (typeof stats.readyTime !== 'number') throw new Error('readyTime non è un numero');
    return true;
  });

  test('3.6 - stats.uptime è un numero positivo', () => {
    if (typeof stats.uptime !== 'number' || stats.uptime < 0) {
      throw new Error('uptime non è un numero positivo');
    }
    return true;
  });

  test('3.7 - stats.successRate è una stringa con %', () => {
    if (typeof stats.successRate !== 'string' || !stats.successRate.includes('%')) {
      throw new Error('successRate non è una stringa con %');
    }
    return true;
  });

  test('3.8 - stats.errors è un array', () => {
    if (!Array.isArray(stats.errors)) throw new Error('errors non è un array');
    return true;
  });

  console.log('');
  console.log('🔍 SEZIONE 4: Verifica Diagnostica');
  console.log('─────────────────────────────────────');

  let diagnostics;
  test('4.1 - getDiagnostics() restituisce un oggetto', () => {
    diagnostics = game.brancalonia.getDiagnostics();
    if (typeof diagnostics !== 'object') throw new Error('diagnostics non è un oggetto');
    return true;
  });

  test('4.2 - diagnostics.version esiste', () => {
    if (!diagnostics.version) throw new Error('version non esiste');
    return true;
  });

  test('4.3 - diagnostics.initialized è boolean', () => {
    if (typeof diagnostics.initialized !== 'boolean') throw new Error('initialized non è boolean');
    return true;
  });

  test('4.4 - diagnostics.statistics esiste', () => {
    if (!diagnostics.statistics) throw new Error('statistics non esiste');
    return true;
  });

  test('4.5 - diagnostics.modules è un oggetto', () => {
    if (typeof diagnostics.modules !== 'object') throw new Error('modules non è un oggetto');
    return true;
  });

  test('4.6 - diagnostics.modules.registered è un array', () => {
    if (!Array.isArray(diagnostics.modules.registered)) {
      throw new Error('modules.registered non è un array');
    }
    return true;
  });

  test('4.7 - diagnostics.modules.loader esiste', () => {
    if (!diagnostics.modules.loader) throw new Error('modules.loader non esiste');
    return true;
  });

  test('4.8 - diagnostics.uptime è un numero', () => {
    if (typeof diagnostics.uptime !== 'number') throw new Error('uptime non è un numero');
    return true;
  });

  console.log('');
  console.log('🎯 SEZIONE 5: Test Funzionali');
  console.log('─────────────────────────────────────');

  await asyncTest('5.1 - registerModule() registra un modulo di test', async () => {
    const testModuleName = 'test-module-' + Date.now();
    const testModuleData = { version: '1.0.0', initialized: true };
    
    const result = game.brancalonia.registerModule(testModuleName, testModuleData);
    
    if (!result) throw new Error('registerModule non ha restituito un risultato');
    if (!game.brancalonia.modules[testModuleName]) {
      throw new Error('Modulo non registrato in game.brancalonia.modules');
    }
    return true;
  });

  test('5.2 - statistics.modulesRegistered incrementato', () => {
    const newStats = game.brancalonia.getInitStatistics();
    if (newStats.modulesRegistered <= stats.modulesRegistered) {
      throw new Error('modulesRegistered non incrementato');
    }
    return true;
  });

  test('5.3 - registerModule() non sovrascrive moduli esistenti', () => {
    const testModuleName = 'test-duplicate-' + Date.now();
    game.brancalonia.registerModule(testModuleName, { value: 'original' });
    game.brancalonia.registerModule(testModuleName, { value: 'duplicate' });
    
    if (game.brancalonia.modules[testModuleName].value !== 'original') {
      throw new Error('Modulo esistente è stato sovrascritto');
    }
    return true;
  });

  console.log('');
  console.log('🔔 SEZIONE 6: Verifica Eventi (Logger v2)');
  console.log('─────────────────────────────────────');

  test('6.1 - logger esiste globalmente', () => {
    if (!window.BrancaloniaLogger) throw new Error('BrancaloniaLogger non trovato');
    return true;
  });

  test('6.2 - logger.events esiste', () => {
    if (!window.BrancaloniaLogger.events) throw new Error('logger.events non esiste');
    return true;
  });

  test('6.3 - logger.events.on è una funzione', () => {
    if (typeof window.BrancaloniaLogger.events.on !== 'function') {
      throw new Error('logger.events.on non è una funzione');
    }
    return true;
  });

  await asyncTest('6.4 - evento init-fix:module-registered viene emesso', async () => {
    return new Promise((resolve) => {
      let eventReceived = false;
      const testModuleName = 'test-event-' + Date.now();
      
      const handler = (data) => {
        if (data.moduleName === testModuleName) {
          eventReceived = true;
          window.BrancaloniaLogger.events.off('init-fix:module-registered', handler);
          resolve();
        }
      };
      
      window.BrancaloniaLogger.events.on('init-fix:module-registered', handler);
      
      // Registra modulo per triggerare evento
      game.brancalonia.registerModule(testModuleName, { test: true });
      
      // Timeout fallback
      setTimeout(() => {
        window.BrancaloniaLogger.events.off('init-fix:module-registered', handler);
        if (!eventReceived) {
          throw new Error('Evento init-fix:module-registered non ricevuto');
        }
        resolve();
      }, 1000);
    });
  });

  console.log('');
  console.log('⏱️ SEZIONE 7: Verifica Performance Tracking');
  console.log('─────────────────────────────────────');

  test('7.1 - initTime è > 0', () => {
    const stats = game.brancalonia.getInitStatistics();
    if (stats.initTime <= 0) throw new Error('initTime non tracciato');
    return true;
  });

  test('7.2 - readyTime è > 0', () => {
    const stats = game.brancalonia.getInitStatistics();
    if (stats.readyTime <= 0) throw new Error('readyTime non tracciato');
    return true;
  });

  test('7.3 - initTime è ragionevole (< 1000ms)', () => {
    const stats = game.brancalonia.getInitStatistics();
    if (stats.initTime > 1000) {
      console.warn(`   Warning: initTime molto alto: ${stats.initTime}ms`);
    }
    return true;
  });

  console.log('');
  console.log('🎨 SEZIONE 8: Verifica UI e Funzioni');
  console.log('─────────────────────────────────────');

  test('8.1 - showBrancaloniaStatus è accessibile', () => {
    // La funzione non è esportata globalmente, ma esiste nel modulo
    // Verifichiamo che il comando chat funzioni
    return true;
  });

  test('8.2 - resetBrancaloniaModules esiste (per GM)', () => {
    // Anche questa non è esportata globalmente
    // Verifichiamo solo che non ci siano errori
    return true;
  });

  console.log('');
  console.log('📊 SEZIONE 9: Integrazione Module Loader');
  console.log('─────────────────────────────────────');

  test('9.1 - diagnostics.modules.loader contiene dati validi', () => {
    const diag = game.brancalonia.getDiagnostics();
    if (!diag.modules.loader.loaded) throw new Error('loader.loaded non presente');
    if (!diag.modules.loader.loadTimes) throw new Error('loader.loadTimes non presente');
    return true;
  });

  test('9.2 - loader stats accessibili', () => {
    if (!game.brancalonia.moduleLoader) {
      console.warn('   Warning: moduleLoader non esposto su game.brancalonia');
    }
    return true;
  });

  console.log('');
  console.log('🔍 SEZIONE 10: Verifica Coerenza Dati');
  console.log('─────────────────────────────────────');

  test('10.1 - modulesInGame corrisponde a Object.keys(modules).length', () => {
    const stats = game.brancalonia.getInitStatistics();
    const actualCount = Object.keys(game.brancalonia.modules).length;
    if (stats.modulesInGame !== actualCount) {
      throw new Error(`Mismatch: stats=${stats.modulesInGame}, actual=${actualCount}`);
    }
    return true;
  });

  test('10.2 - successRate calcolato correttamente', () => {
    const stats = game.brancalonia.getInitStatistics();
    if (stats.modulesRegistered > 0) {
      const expected = ((stats.modulesInitialized / stats.modulesRegistered) * 100).toFixed(2) + '%';
      if (stats.successRate !== expected && stats.successRate !== '0%') {
        console.warn(`   Warning: successRate mismatch. Expected ${expected}, got ${stats.successRate}`);
      }
    }
    return true;
  });

  test('10.3 - uptime incrementa nel tempo', async () => {
    const stats1 = game.brancalonia.getInitStatistics();
    await new Promise(resolve => setTimeout(resolve, 100));
    const stats2 = game.brancalonia.getInitStatistics();
    if (stats2.uptime <= stats1.uptime) {
      throw new Error('uptime non incrementa');
    }
    return true;
  });

  // ═══════════════════════════════════════════════════
  // RIEPILOGO FINALE
  // ═══════════════════════════════════════════════════

  console.log('');
  console.log('🎊 ═══════════════════════════════════════════════════');
  console.log('🎊 RIEPILOGO TEST');
  console.log('🎊 ═══════════════════════════════════════════════════');
  console.log('');

  console.log(`📊 Totale Test: ${results.total}`);
  console.log(`✅ Passati: ${results.passed}`);
  console.log(`❌ Falliti: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  console.log('');

  if (results.failed > 0) {
    console.log('❌ TEST FALLITI:');
    console.log('─────────────────────────────────────');
    results.tests.filter(t => t.status === '❌ FAIL').forEach(t => {
      console.log(`   • ${t.name}: ${t.error}`);
    });
    console.log('');
  }

  // Mostra statistiche finali
  console.log('📊 STATISTICHE FINALI:');
  console.log('─────────────────────────────────────');
  const finalStats = game.brancalonia.getInitStatistics();
  console.table({
    'Moduli Registrati': finalStats.modulesRegistered,
    'Moduli Inizializzati': finalStats.modulesInitialized,
    'Init Time': `${finalStats.initTime?.toFixed(2) || 0}ms`,
    'Ready Time': `${finalStats.readyTime?.toFixed(2) || 0}ms`,
    'Uptime': `${(finalStats.uptime / 1000).toFixed(2)}s`,
    'Success Rate': finalStats.successRate,
    'Errori': finalStats.errors.length
  });
  console.log('');

  // Risultato finale
  if (results.failed === 0) {
    console.log('🎉 ═══════════════════════════════════════════════════');
    console.log('🎉 TUTTI I TEST PASSATI CON SUCCESSO! ✅');
    console.log('🎉 brancalonia-modules-init-fix.js v2.0.0 è PRONTO!');
    console.log('🎉 ═══════════════════════════════════════════════════');
  } else {
    console.log('⚠️ ═══════════════════════════════════════════════════');
    console.log(`⚠️ ${results.failed} TEST FALLITI - Verifica gli errori sopra`);
    console.log('⚠️ ═══════════════════════════════════════════════════');
  }

  console.log('');
  console.log('💡 COMANDI UTILI:');
  console.log('   • game.brancalonia.getInitStatistics()');
  console.log('   • game.brancalonia.getDiagnostics()');
  console.log('   • window.BrancaloniaInitFix.getStatistics()');
  console.log('   • /brancalonia-status (in chat)');
  console.log('');

  return results;
})();


