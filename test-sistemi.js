/**
 * Test per i nuovi sistemi di Brancalonia
 * Esegui questi comandi nella console di Foundry per testare
 */

// ========================================
// TEST SISTEMA EQUITAGLIA
// ========================================

// Test 1: Calcola valore taglia per una malefatta
console.log("=== TEST EQUITAGLIA ===");
const testActor = game.actors.getName("Test Canaglia") || game.actors.contents[0];

// Aggiungi una malefatta semplice
await game.brancalonia.equitaglia.aggiungiMalefatta(testActor, "schiamazzi");
console.log("✅ Malefatta 'schiamazzi' aggiunta (2 mo)");

// Aggiungi furto con valore
await game.brancalonia.equitaglia.aggiungiMalefatta(testActor, "borseggio", {
  valoreMaltolto: 10,
  testimoni: ["Guardia Beppe", "Oste Gino"]
});
console.log("✅ Malefatta 'borseggio' aggiunta (20 mo)");

// Aggiungi malefatta con modificatori
await game.brancalonia.equitaglia.aggiungiMalefatta(testActor, "aggressione", {
  numeroPersone: 2,
  modificatori: ["tentato", "controBirri"]
});
console.log("✅ Malefatta 'aggressione tentata contro birri' aggiunta");

// Verifica taglia totale
const tagliatotale = testActor.getFlag("brancalonia", "taglia");
console.log(`Taglia totale: ${tagliatotale} gransoldi`);

// Test calcolo pena
const giorni = game.brancalonia.equitaglia.calcolaPena(tagliatotale);
console.log(`Pena da scontare: ${giorni} giorni`);

// Test cattura
const ricompensa = await game.brancalonia.equitaglia.catturaMalfattore(testActor, "cacciatore");
console.log(`Ricompensa per cattura: ${ricompensa} gransoldi`);

// ========================================
// TEST RISCHI DEL MESTIERE
// ========================================

console.log("\n=== TEST RISCHI DEL MESTIERE ===");

// Crea una cricca di test
const cricca = game.actors.filter(a => a.type === "character").slice(0, 3).map(a => ({actor: a}));

if (cricca.length > 0) {
  // Imposta nomea per il test
  cricca[0].actor.setFlag("brancalonia", "nomea", 25);
  cricca[1].actor.setFlag("brancalonia", "nomea", 15);
  if (cricca[2]) cricca[2].actor.setFlag("brancalonia", "nomea", 10);

  // Test tiro Rischi senza modificatori
  const risultato1 = game.brancalonia.rischiMestiere.tiraRischiMestiere(cricca, 0);
  console.log(`✅ Tiro base: ${risultato1.roll.formula} = ${risultato1.risultato}`);
  console.log(`   Evento: ${risultato1.evento ? risultato1.evento.evento : "Nessun evento"}`);

  // Test con Imbosco
  await game.brancalonia.rischiMestiere.applicaImbosco(2);
  console.log("✅ Applicate 2 settimane di Imbosco (-6 al tiro)");

  const risultato2 = game.brancalonia.rischiMestiere.tiraRischiMestiere(cricca, 0);
  console.log(`✅ Tiro con Imbosco: ${risultato2.roll.formula} = ${risultato2.risultato}`);
  console.log(`   Evento: ${risultato2.evento ? risultato2.evento.evento : "Nessun evento"}`);

  // Reset Imbosco
  await game.brancalonia.rischiMestiere.resetImbosco();
  console.log("✅ Imbosco resettato");

  // Test evento specifico
  const eventoBirri = CONFIG.BRANCALONIA.rischiMestiere.tabella[6];
  await game.brancalonia.rischiMestiere.gestisciEvento(eventoBirri, cricca);
  console.log("✅ Evento 'Incontro con birri' gestito");
} else {
  console.log("⚠️ Nessun personaggio disponibile per test Rischi del Mestiere");
}

// ========================================
// VERIFICA CONFIGURAZIONI
// ========================================

console.log("\n=== VERIFICA CONFIGURAZIONI ===");

// Verifica che i sistemi siano registrati
console.log("Sistema Equitaglia:", game.brancalonia.equitaglia ? "✅ Caricato" : "❌ Non caricato");
console.log("Sistema Rischi:", game.brancalonia.rischiMestiere ? "✅ Caricato" : "❌ Non caricato");

// Verifica configurazioni
console.log("\nMalefatte registrate:", Object.keys(CONFIG.BRANCALONIA.equitaglia.malefatte).length);
console.log("Eventi Rischi registrati:", Object.keys(CONFIG.BRANCALONIA.rischiMestiere.tabella).length);

// Verifica UI
const hasEquitagliaButton = document.querySelector('.aggiungi-malefatta');
const hasRischiButton = document.querySelector('.tira-rischi-mestiere');

console.log("\nUI Equitaglia:", hasEquitagliaButton ? "✅ Presente" : "⚠️ Apri una scheda personaggio per verificare");
console.log("UI Rischi:", hasRischiButton ? "✅ Presente" : "⚠️ Solo per GM nella chat");

console.log("\n=== TEST COMPLETATI ===");
console.log("Controlla la chat per i messaggi generati dai sistemi!");