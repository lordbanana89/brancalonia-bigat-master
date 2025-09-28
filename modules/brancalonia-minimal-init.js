/**
 * BRANCALONIA MINIMAL INIT
 * Inizializzazione minima e sicura del modulo
 * Nessun fix aggressivo, solo funzionalità base
 */

(() => {
  console.log('✅ Brancalonia v6.2.1 - Inizializzazione minima');

  // Flag per evitare inizializzazioni multiple
  if (window.BRANCALONIA_INITIALIZED) {
    return;
  }
  window.BRANCALONIA_INITIALIZED = true;

  // Registra il modulo come attivo
  Hooks.once('init', () => {
    console.log('✅ Brancalonia - Hook init completato');

    // Registra settings base se necessario
    try {
      if (game.settings && !game.settings.get('brancalonia-bigat', 'version')) {
        game.settings.register('brancalonia-bigat', 'version', {
          scope: 'world',
          config: false,
          type: String,
          default: '6.2.1'
        });
      }
    } catch (e) {
      // Ignora errori di settings
    }
  });

  Hooks.once('ready', () => {
    console.log('✅ Brancalonia - Sistema pronto');

    // Notifica versione
    ui.notifications?.info('Brancalonia v6.2.1 - Modulo caricato correttamente', {
      permanent: false,
      console: false
    });
  });

  // Registra solo hooks essenziali senza modifiche aggressive
  Hooks.on('renderActorSheet', (app, html, data) => {
    // Solo log, nessuna modifica
    console.debug('Brancalonia - Actor sheet renderizzato');
  });

  Hooks.on('renderItemSheet', (app, html, data) => {
    // Solo log, nessuna modifica
    console.debug('Brancalonia - Item sheet renderizzato');
  });

  // Nessun MutationObserver
  // Nessun setInterval aggressivo
  // Nessuna modifica DOM
  // Nessun override di funzioni globali

  console.log('✅ Brancalonia - Inizializzazione minima completata');
})();