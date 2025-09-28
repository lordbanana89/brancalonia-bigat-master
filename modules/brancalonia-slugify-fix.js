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
  // Prova ad aggiungere a foundry.utils solo se possibile
  try {
    if (foundry?.utils && !foundry.utils.slugify) {
      // Controlla se l'oggetto è estensibile
      if (Object.isExtensible(foundry.utils)) {
        foundry.utils.slugify = globalThis.slugify;
        console.log("✅ slugify added to foundry.utils");
      } else {
        console.log("⚠️ foundry.utils is not extensible, using global slugify");
      }
    }
  } catch (e) {
    console.log("⚠️ Could not add slugify to foundry.utils:", e.message);
  }

  // Prova ad aggiungere a game per retrocompatibilità
  try {
    if (game && !game.slugify) {
      if (Object.isExtensible(game)) {
        game.slugify = globalThis.slugify;
        console.log("✅ slugify added to game");
      } else {
        console.log("⚠️ game is not extensible, using global slugify");
      }
    }
  } catch (e) {
    console.log("⚠️ Could not add slugify to game:", e.message);
  }
});

console.log("✅ Brancalonia Slugify Fix loaded");