/* ===================================== */
/* BRANCALONIA CACHE BUSTER */
/* Forza ricaricamento moduli aggiornati */
/* ===================================== */

Hooks.once('init', () => {
  // Aggiungi timestamp ai moduli per evitare cache
  const version = game.modules.get('brancalonia-bigat')?.version || '4.2.6';
  const timestamp = Date.now();

  console.log(`Brancalonia | Cache Buster v${version} - ${timestamp}`);

  // Log per debug - Rimosso test che causava l'errore stesso!

  // Forza ricaricamento se versione cambiata
  const lastVersion = localStorage.getItem('brancalonia-version');
  if (lastVersion !== version) {
    console.log(`Brancalonia | Nuova versione rilevata: ${lastVersion} -> ${version}`);
    localStorage.setItem('brancalonia-version', version);

    // Suggerisci ricaricamento se ci sono errori di cache
    Hooks.once('ready', () => {
      if (window.location.search.includes('force-reload')) return;

      // Non testare mergeObject direttamente perché causa l'errore!
      // Invece, verifica solo se la versione è cambiata
      if (!window.location.search.includes('nocache')) {
        console.log('Brancalonia | Nuova versione installata. Se vedi errori di deprecazione, ricarica con CTRL+SHIFT+R');
      }
    });
  }
});