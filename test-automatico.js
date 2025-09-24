/**
 * TEST AUTOMATICO COMPLETO BRANCALONIA
 * Esegui questo script nella console di Foundry per testare tutto automaticamente
 */

async function testBrancaloniaCompleto() {
  console.clear();
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║     🎭 TEST AUTOMATICO BRANCALONIA v3.2.2 🎭         ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  let testPassati = 0;
  let testFalliti = 0;
  const errori = [];

  // Test 1: Verifica Caricamento Modulo
  console.log('📦 TEST 1: CARICAMENTO MODULO');
  try {
    const mod = game.modules.get('brancalonia-bigat');
    console.assert(mod, 'Modulo non trovato');
    console.log('   ✅ Modulo caricato');
    console.log('   → Versione:', mod.version);
    console.log('   → File JS:', mod.esmodules.size);
    testPassati++;
  } catch(e) {
    console.log('   ❌ FALLITO:', e.message);
    errori.push('Caricamento modulo: ' + e.message);
    testFalliti++;
  }

  // Test 2: Verifica Sistemi Attivi
  console.log('\n🔧 TEST 2: SISTEMI ATTIVI');
  try {
    console.assert(game.brancalonia, 'game.brancalonia non esiste');
    console.assert(game.brancalonia.equitaglia, 'Sistema Equitaglia non trovato');
    console.assert(game.brancalonia.rischiMestiere, 'Sistema Rischi non trovato');
    console.log('   ✅ Sistemi principali attivi');
    console.log('   → Sistemi trovati:', Object.keys(game.brancalonia).length);
    testPassati++;
  } catch(e) {
    console.log('   ❌ FALLITO:', e.message);
    errori.push('Sistemi attivi: ' + e.message);
    testFalliti++;
  }

  // Test 3: Test Flag System
  console.log('\n🚩 TEST 3: SISTEMA FLAG');
  const actor = game.actors.contents[0];
  if (!actor) {
    console.log('   ⚠️ Nessun attore disponibile - crea un personaggio');
    testFalliti++;
  } else {
    try {
      // Pulisci vecchi flag
      await actor.unsetFlag("brancalonia-bigat", "test");

      // Test set/get flag
      await actor.setFlag("brancalonia-bigat", "test", "valore_test");
      const valore = actor.getFlag("brancalonia-bigat", "test");
      console.assert(valore === "valore_test", 'Flag non salvato correttamente');
      console.log('   ✅ Flag system funziona');

      // Cleanup
      await actor.unsetFlag("brancalonia-bigat", "test");
      testPassati++;
    } catch(e) {
      console.log('   ❌ FALLITO:', e.message);
      errori.push('Flag system: ' + e.message);
      testFalliti++;
    }
  }

  // Test 4: Sistema Equitaglia
  console.log('\n⚖️ TEST 4: SISTEMA EQUITAGLIA');
  if (!actor) {
    console.log('   ⚠️ Saltato - nessun attore');
    testFalliti++;
  } else {
    try {
      // Reset taglia
      await actor.unsetFlag("brancalonia-bigat", "malefatte");
      await actor.unsetFlag("brancalonia-bigat", "taglia");

      // Aggiungi malefatte
      await game.brancalonia.equitaglia.aggiungiMalefatta(actor, "schiamazzi");
      let taglia = actor.getFlag("brancalonia-bigat", "taglia") || 0;
      console.assert(taglia === 2, `Taglia dovrebbe essere 2, è ${taglia}`);

      await game.brancalonia.equitaglia.aggiungiMalefatta(actor, "borseggio", {
        valoreMaltolto: 50
      });
      taglia = actor.getFlag("brancalonia-bigat", "taglia") || 0;
      console.assert(taglia === 102, `Taglia dovrebbe essere 102, è ${taglia}`);

      console.log('   ✅ Equitaglia funziona');
      console.log('   → Taglia totale:', taglia, 'gransoldi');
      testPassati++;
    } catch(e) {
      console.log('   ❌ FALLITO:', e.message);
      errori.push('Equitaglia: ' + e.message);
      testFalliti++;
    }
  }

  // Test 5: Rischi del Mestiere
  console.log('\n🎲 TEST 5: RISCHI DEL MESTIERE');
  const cricca = game.actors.filter(a => a.type === "character").slice(0, 3);
  if (cricca.length === 0) {
    console.log('   ⚠️ Saltato - nessun personaggio');
    testFalliti++;
  } else {
    try {
      // Imposta nomea
      await cricca[0].setFlag("brancalonia-bigat", "nomea", 15);

      // Tira rischi
      const risultato = game.brancalonia.rischiMestiere.tiraRischiMestiere(
        cricca.map(a => ({actor: a})),
        0
      );

      console.assert(risultato, 'Tiro rischi non ha restituito risultato');
      console.assert(typeof risultato.risultato === 'number', 'Risultato non è un numero');

      console.log('   ✅ Rischi del Mestiere funziona');
      console.log('   → Risultato tiro:', risultato.risultato);
      console.log('   → Evento:', risultato.evento?.evento || 'Nessuno');
      testPassati++;
    } catch(e) {
      console.log('   ❌ FALLITO:', e.message);
      errori.push('Rischi: ' + e.message);
      testFalliti++;
    }
  }

  // Test 6: UI Character Sheet
  console.log('\n📋 TEST 6: UI SCHEDA PERSONAGGIO');
  if (!actor) {
    console.log('   ⚠️ Saltato - nessun attore');
    testFalliti++;
  } else {
    try {
      await actor.sheet.render(true);
      console.log('   ✅ Scheda renderizzata');
      console.log('   → Controlla sezione Equitaglia nella scheda!');
      testPassati++;
    } catch(e) {
      console.log('   ❌ FALLITO:', e.message);
      errori.push('UI: ' + e.message);
      testFalliti++;
    }
  }

  // Test 7: Chat Messages
  console.log('\n💬 TEST 7: MESSAGGI CHAT');
  try {
    // Crea messaggio test
    await ChatMessage.create({
      content: `<div class="brancalonia-equitaglia">
        <h3>⚖️ Test Messaggio Equitaglia</h3>
        <p>Questo è un messaggio di test del sistema.</p>
      </div>`,
      speaker: ChatMessage.getSpeaker()
    });
    console.log('   ✅ Messaggio chat creato');
    testPassati++;
  } catch(e) {
    console.log('   ❌ FALLITO:', e.message);
    errori.push('Chat: ' + e.message);
    testFalliti++;
  }

  // Test 8: Settings
  console.log('\n⚙️ TEST 8: IMPOSTAZIONI');
  try {
    // Test setting Imbosco
    const vecchioValore = game.settings.get("brancalonia-bigat", "settimaneImbosco");
    await game.settings.set("brancalonia-bigat", "settimaneImbosco", 2);
    const nuovoValore = game.settings.get("brancalonia-bigat", "settimaneImbosco");
    console.assert(nuovoValore === 2, 'Setting non salvato');

    // Ripristina
    await game.settings.set("brancalonia-bigat", "settimaneImbosco", vecchioValore);

    console.log('   ✅ Settings funzionano');
    testPassati++;
  } catch(e) {
    console.log('   ❌ FALLITO:', e.message);
    errori.push('Settings: ' + e.message);
    testFalliti++;
  }

  // RISULTATI FINALI
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║                  RISULTATI TEST                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝');

  const totale = testPassati + testFalliti;
  const percentuale = Math.round((testPassati / totale) * 100);

  console.log(`\n📊 RIEPILOGO: ${testPassati}/${totale} test passati (${percentuale}%)`);

  if (testFalliti === 0) {
    console.log('🎉 TUTTI I TEST SONO PASSATI! Il modulo funziona perfettamente!');
  } else {
    console.log(`⚠️ ${testFalliti} test falliti. Errori:`);
    errori.forEach(e => console.log('   •', e));
  }

  // Suggerimenti
  if (!actor) {
    console.log('\n💡 SUGGERIMENTO: Crea almeno un personaggio per test completi');
  }

  console.log('\n✅ Test automatico completato!');
  return { passati: testPassati, falliti: testFalliti };
}

// Esegui il test
console.log('Avvio test in 1 secondo...');
setTimeout(() => testBrancaloniaCompleto(), 1000);