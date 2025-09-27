/* ===================================== */
/* BRANCALONIA CACHE BUSTER */
/* Forza ricaricamento moduli aggiornati */
/* ===================================== */

Hooks.once('init', () => {
  // Aggiungi timestamp ai moduli per evitare cache
  const version = game.modules.get('brancalonia-bigat')?.version || '4.2.6';
  const timestamp = Date.now();

  console.log(`Brancalonia | Cache Buster v${version} - ${timestamp}`);

  // Log per debug
  if (typeof mergeObject !== 'undefined' && mergeObject !== foundry.utils.mergeObject) {
    console.warn('Brancalonia | mergeObject globale ancora presente, usa foundry.utils.mergeObject');
  }

  // Forza ricaricamento se versione cambiata
  const lastVersion = localStorage.getItem('brancalonia-version');
  if (lastVersion !== version) {
    console.log(`Brancalonia | Nuova versione rilevata: ${lastVersion} -> ${version}`);
    localStorage.setItem('brancalonia-version', version);

    // Suggerisci ricaricamento se ci sono errori di cache
    Hooks.once('ready', () => {
      if (window.location.search.includes('force-reload')) return;

      // Controlla se ci sono ancora riferimenti a mergeObject globale
      try {
        // Test access
        const test = window.mergeObject;
        if (test && !window.location.search.includes('nocache')) {
          ui.notifications.warn('Cache modulo rilevata. Ricarica la pagina con CTRL+SHIFT+R per applicare gli aggiornamenti.');
        }
      } catch (e) {
        // Va bene, mergeObject non accessibile
      }
    });
  }
});