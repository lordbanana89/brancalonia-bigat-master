/**
 * BRANCALONIA SLUGIFY FIX
 * Corregge l'errore "slugify is not defined" in D&D 5e
 */

console.log("🔧 Brancalonia Slugify Fix - Loading");

// ============================================
// DEFINE SLUGIFY GLOBALLY
// ============================================

// Definisci slugify se non esiste
if (typeof globalThis.slugify === 'undefined') {
  globalThis.slugify = function(str) {
    if (!str) return '';

    return str
      .toString()
      .toLowerCase()
      .trim()
      // Rimuovi accenti e caratteri speciali
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Sostituisci spazi e caratteri non alfanumerici con trattini
      .replace(/[^a-z0-9]+/g, '-')
      // Rimuovi trattini multipli
      .replace(/-+/g, '-')
      // Rimuovi trattini all'inizio e alla fine
      .replace(/^-|-$/g, '');
  };

  console.log("✅ slugify function defined globally");
}

// Assicurati che sia disponibile anche su foundry.utils
Hooks.once("init", () => {
  if (foundry?.utils && !foundry.utils.slugify) {
    foundry.utils.slugify = globalThis.slugify;
    console.log("✅ slugify added to foundry.utils");
  }

  // Aggiungi anche a game per retrocompatibilità
  if (game && !game.slugify) {
    game.slugify = globalThis.slugify;
    console.log("✅ slugify added to game");
  }
});

console.log("✅ Brancalonia Slugify Fix loaded");