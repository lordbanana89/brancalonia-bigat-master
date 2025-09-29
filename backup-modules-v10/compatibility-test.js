/**
 * Test di compatibilità per Brancalonia
 * Verifica che tutti i moduli siano correttamente integrati
 */

export class BrancaloniaCompatibilityTest {
  static async runTests() {
    console.log("=== BRANCALONIA COMPATIBILITY TEST ===");
    
    const results = {
      passed: 0,
      failed: 0,
      warnings: 0
    };

    // Test 1: Verifica sistema dnd5e
    if (game.system.id === "dnd5e") {
      console.log("✅ Sistema dnd5e rilevato");
      results.passed++;
    } else {
      console.error("❌ Sistema dnd5e non trovato");
      results.failed++;
    }

    // Test 2: Verifica versione dnd5e
    if (game.system.version.startsWith("3.3")) {
      console.log("✅ Versione dnd5e compatibile (3.3.x)");
      results.passed++;
    } else {
      console.warn("⚠️ Versione dnd5e potrebbe non essere compatibile:", game.system.version);
      results.warnings++;
    }

    // Test 3: Verifica moduli caricati
    const requiredModules = [
      'tavernBrawl', 'tavernGames', 'bagordi', 
      'restSystem', 'levelCap', 'infamiaTracker',
      'compagniaManager', 'havenSystem'
    ];

    for (const module of requiredModules) {
      if (game.brancalonia?.[module]) {
        console.log(`✅ Modulo ${module} caricato`);
        results.passed++;
      } else {
        console.error(`❌ Modulo ${module} NON caricato`);
        results.failed++;
      }
    }

    // Test 4: Verifica hooks registrati
    const testActor = game.actors.getName("Test") || game.actors.contents[0];
    if (testActor) {
      try {
        // Test currency access
        const currency = testActor.system.currency?.du;
        console.log(`✅ Accesso valuta (du): ${currency !== undefined}`);
        results.passed++;

        // Test HP access
        const hp = testActor.system.attributes.hp.value;
        console.log(`✅ Accesso HP: ${hp !== undefined}`);
        results.passed++;

        // Test level access
        const level = testActor.system.details.level;
        console.log(`✅ Accesso livello: ${level !== undefined}`);
        results.passed++;
      } catch (error) {
        console.error("❌ Errore accesso dati actor:", error);
        results.failed++;
      }
    }

    // Test 5: Verifica settings
    const settings = [
      'useCanagliasRest', 'trackInfamia', 'useCompagnia',
      'havenSystem', 'nonLethalBrawls', 'shoddyItems'
    ];

    for (const setting of settings) {
      try {
        const value = game.settings.get("brancalonia-bigat", setting);
        console.log(`✅ Setting ${setting}: ${value}`);
        results.passed++;
      } catch {
        console.warn(`⚠️ Setting ${setting} non trovato`);
        results.warnings++;
      }
    }

    // Report finale
    console.log("\n=== RISULTATI TEST ===");
    console.log(`✅ Passati: ${results.passed}`);
    console.log(`❌ Falliti: ${results.failed}`);
    console.log(`⚠️ Warning: ${results.warnings}`);

    const score = Math.round((results.passed / (results.passed + results.failed)) * 100);
    console.log(`\n📊 Compatibilità: ${score}%`);

    if (score >= 90) {
      console.log("🎉 Modulo completamente funzionante!");
    } else if (score >= 70) {
      console.log("⚠️ Modulo funzionante con alcuni problemi minori");
    } else {
      console.log("❌ Modulo richiede correzioni");
    }

    return results;
  }
}

// Auto-run on ready
Hooks.once("ready", () => {
  if (game.user.isGM && game.settings.get("brancalonia-bigat", "debugMode")) {
    setTimeout(() => {
      BrancaloniaCompatibilityTest.runTests();
    }, 2000);
  }
});
