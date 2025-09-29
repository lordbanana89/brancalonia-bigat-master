/**
 * BRANCALONIA SAFE LOADER
 * Sistema di caricamento sicuro per prevenire blocchi di Foundry
 */

(() => {
  console.log('🛡️ Brancalonia Safe Loader - Inizializzazione');

  // Flag per prevenire esecuzioni multiple
  if (window.BRANCALONIA_SAFE_LOADED) {
    console.log('🛡️ Safe Loader già caricato, skip');
    return;
  }
  window.BRANCALONIA_SAFE_LOADED = true;

  // Timeout per ogni operazione
  const OPERATION_TIMEOUT = 1000; // 1 secondo max per operazione

  // Wrapper sicuro per funzioni
  function safeExecute(fn, name = 'unknown') {
    return function(...args) {
      const timeoutId = setTimeout(() => {
        console.error(`⚠️ Brancalonia: Operazione ${name} timeout dopo ${OPERATION_TIMEOUT}ms`);
      }, OPERATION_TIMEOUT);

      try {
        const result = fn.apply(this, args);
        clearTimeout(timeoutId);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error(`⚠️ Brancalonia: Errore in ${name}:`, error);
        return undefined;
      }
    };
  }

  // Disabilita temporaneamente i fix aggressivi durante il caricamento
  const originalSetInterval = window.setInterval;
  const originalSetTimeout = window.setTimeout;

  // Lista di intervalli/timeout da limitare
  const limitedIntervals = new Set();
  const limitedTimeouts = new Set();

  // Override setInterval per prevenire loop infiniti
  window.setInterval = function(fn, delay, ...args) {
    // Se il delay è troppo breve (< 100ms), aumentalo
    if (delay < 100) {
      console.warn(`⚠️ Brancalonia: Intervallo troppo breve (${delay}ms), aumentato a 100ms`);
      delay = 100;
    }

    // Se ci sono troppi intervalli attivi, non crearne di nuovi
    if (limitedIntervals.size > 10) {
      console.warn('⚠️ Brancalonia: Troppi intervalli attivi, nuovo intervallo ignorato');
      return -1;
    }

    const id = originalSetInterval.call(window, fn, delay, ...args);
    limitedIntervals.add(id);
    return id;
  };

  // Override clearInterval per tracciare
  const originalClearInterval = window.clearInterval;
  window.clearInterval = function(id) {
    limitedIntervals.delete(id);
    return originalClearInterval.call(window, id);
  };

  // Disabilita MutationObserver aggressivi durante il caricamento iniziale
  const originalMutationObserver = window.MutationObserver;
  let observerCount = 0;

  window.MutationObserver = class SafeMutationObserver extends originalMutationObserver {
    constructor(callback) {
      observerCount++;

      if (observerCount > 5) {
        console.warn('⚠️ Brancalonia: Troppi MutationObserver, limitando...');
        // Wrapper che limita le chiamate
        const throttledCallback = (() => {
          let timeout;
          return (mutations, observer) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              try {
                callback(mutations, observer);
              } catch (e) {
                console.error('⚠️ MutationObserver error:', e);
              }
            }, 100);
          };
        })();
        super(throttledCallback);
      } else {
        super(callback);
      }
    }
  };

  // Disabilita temporaneamente i fix delle icone durante il caricamento
  let loadingComplete = false;

  Hooks.once('ready', () => {
    console.log('🛡️ Brancalonia Safe Loader - Sistema pronto');
    loadingComplete = true;

    // Ripristina funzioni originali dopo il caricamento
    setTimeout(() => {
      console.log('🛡️ Ripristino funzioni normali...');

      // NON ripristinare setInterval e MutationObserver per evitare loop
      // window.setInterval = originalSetInterval;
      // window.MutationObserver = originalMutationObserver;

      // Pulisci intervalli eccessivi
      limitedIntervals.forEach(id => {
        if (limitedIntervals.size > 5) {
          clearInterval(id);
          limitedIntervals.delete(id);
        }
      });
    }, 5000);
  });

  // Previeni l'esecuzione di clean brutali durante il caricamento
  const dangerousFunctions = [
    'bruteForceClean',
    'globalCleanup',
    'fixAllIcons'
  ];

  dangerousFunctions.forEach(fnName => {
    if (window[fnName]) {
      const original = window[fnName];
      window[fnName] = function(...args) {
        if (!loadingComplete) {
          console.log(`🛡️ Funzione ${fnName} ritardata fino al caricamento completo`);
          return;
        }
        return original.apply(this, args);
      };
    }
  });

  // Error boundary globale
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('brancalonia')) {
      console.error('⚠️ Brancalonia Error caught:', event.message);
      event.preventDefault(); // Previeni il crash
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && String(event.reason).includes('brancalonia')) {
      console.error('⚠️ Brancalonia Promise rejection:', event.reason);
      event.preventDefault(); // Previeni il crash
    }
  });

  console.log('✅ Brancalonia Safe Loader - Protezioni attive');
})();